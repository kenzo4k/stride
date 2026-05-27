import express from 'express';
import {
    getAdminStats,
    getRecentUsers,
    getRecentCourses,
    getInstructors,
    handleUserAction,
    handleCourseAction,
    handleInstructorAction,
    getAllCoursesAdmin
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(verifyToken, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/recent-users', getRecentUsers);
router.get('/recent-courses', getRecentCourses);
router.get('/instructors', getInstructors);
router.get('/courses', getAllCoursesAdmin);
router.post('/users/:id/:action', handleUserAction);
router.post('/courses/:id/:action', handleCourseAction);
router.post('/instructors/:id/:action', handleInstructorAction);

export default router;
