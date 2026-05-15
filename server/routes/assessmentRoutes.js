import express from 'express';
import { getAssessment, submitAssessment, upsertAssessment } from '../controllers/assessmentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId/assessment', verifyToken, getAssessment);
router.post('/:courseId/assessment/submit', verifyToken, submitAssessment);
router.put('/:courseId/assessment', verifyToken, requireRole('instructor', 'admin'), upsertAssessment);

export default router;
