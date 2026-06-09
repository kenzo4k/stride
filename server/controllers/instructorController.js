import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import TimeTracking from '../models/TimeTracking.js';

export const getInstructorStats = async (req, res) => {
    try {
        const instructor = await User.findById(req.user.id);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
        
        const totalRevenue = courses.reduce((acc, course) => {
            const count = enrollments.filter(e => e.courseId.toString() === course._id.toString()).length;
            return acc + (count * course.price);
        }, 0);

        // Calculate actual study time from TimeTracking across instructor's courses
        const trackingRecords = await TimeTracking.find({ courseId: { $in: courseIds } });
        const totalMinutes = trackingRecords.reduce((acc, r) => acc + r.minutes, 0);
        const avgHours = enrollments.length > 0 ? (totalMinutes / enrollments.length / 60) : 0;

        // Calculate average student course progress as submission rate proxy
        const avgProgress = enrollments.length > 0
            ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length
            : 0;

        const stats = {
            totalCourses: courses.length,
            totalStudents: enrollments.length,
            totalRevenue: totalRevenue,
            averageRating: courses.reduce((acc, c) => acc + (c.rating || 0), 0) / (courses.length || 1),
            pendingReviews: courses.filter(c => c.status === 'pending').length,
            activeCourses: courses.filter(c => ['active', 'published'].includes(c.status)).length,
            avgTimeSpent: parseFloat(avgHours.toFixed(1)),
            submissionRate: Math.round(avgProgress)
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getInstructorCourses = async (req, res) => {
    try {
        const instructor = await User.findById(req.user.id);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getInstructorStudents = async (req, res) => {
    try {
        const instructor = await User.findById(req.user.id);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('userId')
            .populate('courseId');
        
        // Unique students
        const studentsMap = {};
        enrollments.forEach(e => {
            if (!e.userId || !e.courseId) return;
            const studentId = e.userId._id.toString();
            if (!studentsMap[studentId]) {
                studentsMap[studentId] = {
                    _id: e.userId._id,
                    displayName: e.userId.name,
                    email: e.userId.email,
                    lastLogin: e.userId.lastLogin,
                    enrolledCourses: 0,
                    progressSum: 0,
                    gradeSum: 0,
                    courses: []
                };
            }
            studentsMap[studentId].enrolledCourses++;
            studentsMap[studentId].progressSum += e.progress || 0;
            studentsMap[studentId].gradeSum += e.grade || 0;
            studentsMap[studentId].courses.push({
                title: e.courseId.title,
                progress: e.progress,
                enrolledAt: e.enrolledAt
            });
        });

        const students = Object.values(studentsMap).map(s => ({
            _id: s._id,
            displayName: s.displayName,
            email: s.email,
            lastLogin: s.lastLogin,
            enrolledCourses: s.enrolledCourses,
            progress: s.enrolledCourses > 0 ? (s.progressSum / s.enrolledCourses) : 0,
            avgGrade: s.enrolledCourses > 0 ? (s.gradeSum / s.enrolledCourses) : 0,
            courses: s.courses
        }));

        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getAtRiskStudents = async (req, res) => {
  try {
    const instructor = await User.findById(req.user.id);
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    // Find all courses by this instructor
    const courses = await Course.find({
        $or: [
            { instructorId: instructor._id },
            { "instructor.email": instructor.email }
        ]
    });
    const courseIds = courses.map(c => c._id);

    // Find enrollments for these courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('userId', 'name email photoURL lastLogin')
      .populate('courseId', 'title');

    // Filter at-risk students: lastLogin > 7 days ago OR grade < 60
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const atRisk = enrollments.filter(e => {
        const user = e.userId;
        if (!user) return false; // Skip if student account is deleted
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : new Date(0);
        return lastLogin < sevenDaysAgo || e.grade < 60;
    }).map(e => ({
        id: e.userId._id,
        name: e.userId.name,
        email: e.userId.email,
        photoURL: e.userId.photoURL,
        lastLogin: e.userId.lastLogin,
        course: e.courseId ? e.courseId.title : 'Deleted Course',
        grade: e.grade,
        progress: e.progress,
        status: e.grade < 50 ? 'Failing' : 'At Risk'
    }));

    res.json(atRisk);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getCourseStats = async (req, res) => {
    try {
        const instructor = await User.findById(req.user.id);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        
        const stats = await Promise.all(courses.map(async (course) => {
            const enrollments = await Enrollment.find({ courseId: course._id });
            const revenue = enrollments.length * course.price;
            return {
                courseId: course._id,
                title: course.title,
                enrollments: enrollments.length,
                revenue: revenue
            };
        }));

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getStudentAnalytics = async (req, res) => {
    try {
        const instructor = await User.findById(req.user.id);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
        
        // Group by grade ranges for chart
        const distribution = [
            { label: '0-20', count: 0, color: 'red' },
            { label: '21-40', count: 0, color: 'orange' },
            { label: '41-60', count: 0, color: 'yellow' },
            { label: '61-80', count: 0, color: 'blue' },
            { label: '81-100', count: 0, color: 'green' }
        ];

        enrollments.forEach(e => {
            if (e.grade <= 20) distribution[0].count++;
            else if (e.grade <= 40) distribution[1].count++;
            else if (e.grade <= 60) distribution[2].count++;
            else if (e.grade <= 80) distribution[3].count++;
            else distribution[4].count++;
        });

        res.json(distribution);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const sendReminder = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { message } = req.body || {};

        // Find the student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Get the instructor
        const instructor = await User.findById(req.user.id);
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }

        // Find instructor's courses
        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        const courseIds = courses.map(c => c._id);

        // Find student's enrollment in one of these courses to get the course title
        const enrollment = await Enrollment.findOne({
            userId: studentId,
            courseId: { $in: courseIds }
        }).populate('courseId');

        const courseTitle = enrollment && enrollment.courseId ? enrollment.courseId.title : "Unknown Course";
        const reminderMsg = message || `Hi ${student.name}, please remember to check back into your course: ${courseTitle}.`;

        console.log(`[Reminder Sent]
Recipient ID: ${student._id}
Recipient Email: ${student.email}
Course Title: ${courseTitle}
Message: ${reminderMsg}
`);

        res.json({ message: "Reminder sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const sendBulkReminder = async (req, res) => {
    try {
        const { studentIds, message } = req.body || {};
        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ message: "studentIds array is required" });
        }

        // Get the instructor
        const instructor = await User.findById(req.user.id);
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }

        // Find instructor's courses
        const courses = await Course.find({
            $or: [
                { instructorId: instructor._id },
                { "instructor.email": instructor.email }
            ]
        });
        const courseIds = courses.map(c => c._id);

        for (const studentId of studentIds) {
            const student = await User.findById(studentId);
            if (!student) continue;

            const enrollment = await Enrollment.findOne({
                userId: studentId,
                courseId: { $in: courseIds }
            }).populate('courseId');

            const courseTitle = enrollment && enrollment.courseId ? enrollment.courseId.title : "Unknown Course";
            const reminderMsg = message || `Hi ${student.name}, please remember to check back into your course: ${courseTitle}.`;

            console.log(`[Bulk Reminder Sent]
Recipient ID: ${student._id}
Recipient Email: ${student.email}
Course Title: ${courseTitle}
Message: ${reminderMsg}
`);
        }

        res.json({ message: "Bulk reminders sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
