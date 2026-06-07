import express from 'express';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload a file (instructor or admin only)
router.post('/', verifyToken, requireRole('instructor', 'admin'), upload.single('file'), uploadFile);

// Delete a file (instructor or admin only)
router.delete('/', verifyToken, requireRole('instructor', 'admin'), deleteFile);

export default router;
