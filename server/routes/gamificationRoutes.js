import express from 'express';
import { getLeaderboard, getBadges, awardXP } from '../controllers/gamificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Leaderboard is public so visitors can see top students
router.get('/leaderboard', getLeaderboard);

// Badges require auth (need to look up user by email)
router.get('/student/badges', verifyToken, getBadges);

// XP award requires auth
router.post('/users/award-xp', verifyToken, awardXP);

export default router;
