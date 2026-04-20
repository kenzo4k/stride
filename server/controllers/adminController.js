import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();
        
        const courses = await Course.find();
        const enrollments = await Enrollment.find().populate('courseId');
        
        const totalRevenue = enrollments.reduce((acc, e) => {
            return acc + (e.courseId?.price || 0);
        }, 0);

        const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        const pendingApprovals = await Course.countDocuments({ status: 'pending' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        res.json({
            totalUsers,
            totalCourses,
            totalEnrollments,
            totalRevenue,
            activeUsers,
            pendingApprovals,
            totalInstructors
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
        const courses = await Course.find().sort({ createdAt: -1 }).limit(10).populate('instructor');
        res.json(courses.map(c => ({
            ...c.toObject(),
            instructor: c.instructor?.name || 'Unknown'
        })));
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' });
        const instructorsWithStats = await Promise.all(instructors.map(async (inst) => {
            const courses = await Course.find({ instructor: inst._id });
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
                status: 'active'
            };
        }));
        res.json(instructorsWithStats);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const handleUserAction = async (req, res) => {
    // Stub
    res.json({ message: `User ${req.params.action}ed successfully` });
};

export const handleCourseAction = async (req, res) => {
    // Stub
    res.json({ message: `Course ${req.params.action}ed successfully` });
};

export const handleInstructorAction = async (req, res) => {
    // Stub
    res.json({ message: `Instructor ${req.params.action}ed successfully` });
};
