import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const getInstructorStats = async (req, res) => {
    try {
        const { email } = req.query;
        const instructor = await User.findOne({ email: email });
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({ instructor: instructor._id });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
        
        const totalRevenue = courses.reduce((acc, course) => {
            const count = enrollments.filter(e => e.courseId.toString() === course._id.toString()).length;
            return acc + (count * course.price);
        }, 0);

        const stats = {
            totalCourses: courses.length,
            totalStudents: enrollments.length,
            totalRevenue: totalRevenue,
            averageRating: courses.reduce((acc, c) => acc + (c.rating || 0), 0) / (courses.length || 1),
            pendingReviews: 0, // Mocked
            activeCourses: courses.filter(c => c.status === 'active').length
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getInstructorCourses = async (req, res) => {
    try {
        const { email } = req.query;
        const instructor = await User.findOne({ email: email });
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({ instructor: instructor._id });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getInstructorStudents = async (req, res) => {
    try {
        const { email } = req.query;
        const instructor = await User.findOne({ email: email });
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({ instructor: instructor._id });
        const courseIds = courses.map(c => c._id);

        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).populate('userId');
        
        // Unique students
        const studentsMap = {};
        enrollments.forEach(e => {
            if (!studentsMap[e.userId._id]) {
                studentsMap[e.userId._id] = {
                    _id: e.userId._id,
                    displayName: e.userId.name,
                    email: e.userId.email,
                    enrolledCourses: 0,
                    progress: 0
                };
            }
            studentsMap[e.userId._id].enrolledCourses++;
            // progress could be average progress
            studentsMap[e.userId._id].progress += e.progress;
        });

        const students = Object.values(studentsMap).map(s => ({
            ...s,
            progress: s.progress / s.enrolledCourses
        }));

        res.json(students);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getAtRiskStudents = async (req, res) => {
  try {
    const { email } = req.query;
    const instructor = await User.findOne({ email: email });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    // Find all courses by this instructor
    const courses = await Course.find({ instructor: instructor._id });
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
        const lastLogin = user.lastLogin ? new Date(user.lastLogin) : new Date(0);
        return lastLogin < sevenDaysAgo || e.grade < 60;
    }).map(e => ({
        id: e.userId._id,
        name: e.userId.name,
        email: e.userId.email,
        photoURL: e.userId.photoURL,
        lastLogin: e.userId.lastLogin,
        course: e.courseId.title,
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
        const { email } = req.query;
        const instructor = await User.findOne({ email: email });
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({ instructor: instructor._id });
        
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
        const { email } = req.query;
        const instructor = await User.findOne({ email: email });
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const courses = await Course.find({ instructor: instructor._id });
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
    // This is a stub as actual email sending is not requested
    res.json({ message: "Reminder sent successfully" });
};

export const sendBulkReminder = async (req, res) => {
    // This is a stub
    res.json({ message: "Bulk reminders sent successfully" });
};
