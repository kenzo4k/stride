import express from 'express';
import {
    getAtRiskStudents,
    getCourseStats,
    getStudentAnalytics,
    sendReminder,
    sendBulkReminder,
    getInstructorStats,
    getInstructorCourses,
    getInstructorStudents
} from '../controllers/instructorController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All instructor routes require instructor role
router.use(verifyToken, requireRole('instructor'));

router.get('/at-risk-students', getAtRiskStudents);
router.get('/course-stats', getCourseStats);
router.get('/student-analytics', getStudentAnalytics);
router.get('/stats', getInstructorStats);
router.get('/courses', getInstructorCourses);
router.get('/students', getInstructorStudents);
router.post('/send-reminder/:studentId', sendReminder);
router.post('/send-bulk-reminder', sendBulkReminder);

export default router;
