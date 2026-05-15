import express from 'express';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByCategory
} from '../controllers/courseController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/category/:category', getCoursesByCategory);

// Protected routes (instructor or admin only)
router.post('/', verifyToken, requireRole('instructor', 'admin'), createCourse);
router.put('/:id', verifyToken, requireRole('instructor', 'admin'), updateCourse);
router.delete('/:id', verifyToken, requireRole('instructor', 'admin'), deleteCourse);

export default router;