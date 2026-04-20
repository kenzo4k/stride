import express from 'express';
import {
    enrollInCourse,
    getMyEnrollments,
    updateProgress
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.post('/', enrollInCourse);
router.get('/my-enrollments', getMyEnrollments); // This might conflict if moved under /enrollments
router.patch('/:id/progress', updateProgress);

export default router;
