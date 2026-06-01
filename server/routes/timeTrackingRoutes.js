import express from 'express';
import { getWeeklyActivity } from '../controllers/timeTrackingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get weekly time activity for chart
router.get('/weekly', verifyToken, getWeeklyActivity);

export default router;
