import express from 'express';
import {
    enrollInCourse,
    getMyEnrollments,
    updateProgress,
    requestUnenrollment
} from '../controllers/enrollmentController.js';
import { verifyToken } from '../middleware/auth.js';

import { body, validationResult } from 'express-validator';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// All enrollment routes require authentication
router.post('/', verifyToken, [
  body('courseId').notEmpty().withMessage('Course ID is required')
], validate, enrollInCourse);

// Duplicate: This endpoint is already registered at the top-level app in index.js: app.get("/api/my-enrollments", verifyToken, getMyEnrollments)
// router.get('/my-enrollments', verifyToken, getMyEnrollments);

router.patch('/:id/progress', verifyToken, [
  body('progress').isNumeric().withMessage('Progress must be a number'),
  body('completedLessons').isArray().withMessage('completedLessons must be an array')
], validate, updateProgress);

router.post('/:id/unenroll', verifyToken, requestUnenrollment);

export default router;
