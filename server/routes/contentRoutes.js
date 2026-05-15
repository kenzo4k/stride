import express from 'express';
import { getContent, upsertContent } from '../controllers/contentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId/content', verifyToken, getContent);
router.put('/:courseId/content', verifyToken, requireRole('instructor', 'admin'), upsertContent);

export default router;
