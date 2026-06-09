import express from 'express';
import { getLeaderboard, getBadges, awardXP } from '../controllers/gamificationController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Leaderboard is public so visitors can see top students
router.get('/leaderboard', getLeaderboard);

// Badges require auth (need to look up user by email)
router.get('/student/badges', verifyToken, getBadges);

// XP award requires admin role
router.post('/users/award-xp', verifyToken, requireRole('admin'), awardXP);

export default router;
