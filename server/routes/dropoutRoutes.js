import express from 'express';
import { getDropoutPredictions, triggerPredictions, recordSessionTimeController, recordLessonStartedController } from '../controllers/dropoutController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/predictions', verifyToken, requireRole('instructor'), getDropoutPredictions);
router.post('/run-predictions', verifyToken, requireRole('instructor'), triggerPredictions);
router.post('/session-time', verifyToken, recordSessionTimeController);
router.post('/lesson-started', verifyToken, recordLessonStartedController);

export default router;
