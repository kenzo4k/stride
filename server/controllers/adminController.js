import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        
        const enrollments = await Enrollment.find().populate('courseId');
        
        const totalRevenue = enrollments.reduce((acc, e) => {
            return acc + (e.courseId?.price || 0);
        }, 0);

        const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        const pendingApprovals = await Course.countDocuments({ status: 'pending' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        // Calculate User Growth
        const allUsers = await User.find({}, 'createdAt').sort({ createdAt: 1 });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate last 12 month keys in order: YYYY-Month
        const last12Months = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last12Months.push({
                key: `${d.getFullYear()}-${months[d.getMonth()]}`,
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                label: `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
            });
        }

        // Count users created before our 12-month window
        const firstWindowMonth = last12Months[0];
        const windowStartLimit = new Date(firstWindowMonth.year, firstWindowMonth.monthIndex, 1);
        let cumulative = await User.countDocuments({ createdAt: { $lt: windowStartLimit } });

        // Map users created within the window
        const growthMap = {};
        allUsers.forEach(u => {
            if (u.createdAt && u.createdAt >= windowStartLimit) {
                const date = new Date(u.createdAt);
                const key = `${date.getFullYear()}-${months[date.getMonth()]}`;
                growthMap[key] = (growthMap[key] || 0) + 1;
            }
        });

        const userGrowthData = last12Months.map(m => {
            cumulative += (growthMap[m.key] || 0);
            return { month: m.label, users: cumulative };
        });

        // Calculate Enrollment Trends
        const courseEnrollmentMap = {};
        enrollments.forEach(e => {
            const courseTitle = e.courseId?.title || 'Unknown Course';
            courseEnrollmentMap[courseTitle] = (courseEnrollmentMap[courseTitle] || 0) + 1;
        });

        const enrollmentData = Object.keys(courseEnrollmentMap).map(title => ({
            course: title.length > 15 ? title.substring(0, 15) + '...' : title,
            enrollments: courseEnrollmentMap[title]
        })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5);

        res.json({
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalRevenue,
            activeUsers,
            pendingApprovals,
            totalInstructors,
            userGrowthData,
            enrollmentData
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getRecentUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(10);
        res.json(users.map(u => ({
            ...u.toObject(),
            displayName: u.name // for frontend compatibility
        })));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getRecentCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }).limit(10);
        res.json(courses.map(c => ({
            ...c.toObject(),
            instructorName: c.instructor?.name || 'Unknown'
        })));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' });
        const instructorsWithStats = await Promise.all(instructors.map(async (inst) => {
            const courses = await Course.find({ "instructor.email": inst.email });
            const courseIds = courses.map(c => c._id);
            const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
            const totalRevenue = courses.reduce((acc, c) => {
                const count = enrollments.filter(e => e.courseId.toString() === c._id.toString()).length;
                return acc + (count * c.price);
            }, 0);

            return {
                ...inst.toObject(),
                displayName: inst.name,
                totalCourses: courses.length,
                totalStudents: enrollments.length,
                totalRevenue: totalRevenue,
                status: inst.status || 'active'
            };
        }));
        res.json(instructorsWithStats);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const handleUserAction = async (req, res) => {
    try {
        const { id, action } = req.params;
        let update;
        switch (action) {
            case 'ban':
                update = { status: 'banned' };
                break;
            case 'activate':
            case 'approve':
                update = { status: 'active' };
                break;
            case 'suspend':
                update = { status: 'suspended' };
                break;
            case 'delete':
                await User.findByIdAndDelete(id);
                await Enrollment.deleteMany({ userId: id });
                return res.json({ message: 'User and their enrollments deleted successfully' });
            default:
                return res.status(400).json({ message: `Unknown action: ${action}` });
        }
        const user = await User.findByIdAndUpdate(id, update, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${action}ed successfully`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const handleCourseAction = async (req, res) => {
    try {
        const { id, action } = req.params;
        let update;
        switch (action) {
            case 'approve':
                update = { status: 'active' };
                break;
            case 'publish':
                update = { status: 'published' };
                break;
            case 'reject':
                update = { status: 'rejected' };
                break;
            case 'suspend':
                update = { status: 'suspended' };
                break;
            default:
                return res.status(400).json({ message: `Unknown action: ${action}` });
        }
        const course = await Course.findByIdAndUpdate(id, update, { new: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: `Course ${action}ed successfully`, course });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const handleInstructorAction = async (req, res) => {
    try {
        const { id, action } = req.params;
        let update;
        switch (action) {
            case 'approve':
                update = { status: 'active' };
                break;
            case 'suspend':
                update = { status: 'suspended' };
                break;
            default:
                return res.status(400).json({ message: `Unknown action: ${action}` });
        }
        const instructor = await User.findByIdAndUpdate(id, update, { new: true });
        if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
        res.json({ message: `Instructor ${action}ed successfully`, instructor });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getAllCoursesAdmin = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getAtRiskStudentsAdmin = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email photoURL lastLogin')
      .populate('courseId', 'title');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const atRisk = enrollments.filter(e => {
        const user = e.userId;
        if (!user) return false;
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

export const sendReminderAdmin = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { message } = req.body || {};

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const enrollment = await Enrollment.findOne({
            userId: studentId
        }).populate('courseId');

        const courseTitle = enrollment && enrollment.courseId ? enrollment.courseId.title : "Unknown Course";
        const reminderMsg = message || `Hi ${student.name}, please remember to check back into your course: ${courseTitle}.`;

        console.log(`[Admin Reminder Sent]
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

export const sendBulkReminderAdmin = async (req, res) => {
    try {
        const { studentIds, message } = req.body || {};
        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ message: "studentIds array is required" });
        }

        for (const studentId of studentIds) {
            const student = await User.findById(studentId);
            if (!student) continue;

            const enrollment = await Enrollment.findOne({
                userId: studentId
            }).populate('courseId');

            const courseTitle = enrollment && enrollment.courseId ? enrollment.courseId.title : "Unknown Course";
            const reminderMsg = message || `Hi ${student.name}, please remember to check back into your course: ${courseTitle}.`;

            console.log(`[Admin Bulk Reminder Sent]
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
