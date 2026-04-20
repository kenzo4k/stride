import express from 'express';
import {
    getAdminStats,
    getRecentUsers,
    getRecentCourses,
    getInstructors,
    handleUserAction,
    handleCourseAction,
    handleInstructorAction
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/recent-users', getRecentUsers);
router.get('/recent-courses', getRecentCourses);
router.get('/instructors', getInstructors);
router.post('/users/:id/:action', handleUserAction);
router.post('/courses/:id/:action', handleCourseAction);
router.post('/instructors/:id/:action', handleInstructorAction);

export default router;
