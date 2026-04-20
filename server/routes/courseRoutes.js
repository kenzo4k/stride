import express from 'express';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByCategory
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', getAllCourses);
router.post('/', createCourse);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.get('/category/:category', getCoursesByCategory);

export default router;
