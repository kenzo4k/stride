import express from 'express';
import { getStudentMetrics, getCourseMetrics, getAtRiskStudents } from '../controllers/metricController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/student/:studentId', verifyToken, getStudentMetrics);
router.get('/course/:courseId', verifyToken, requireRole('instructor', 'admin'), getCourseMetrics);
router.get('/at-risk', verifyToken, requireRole('instructor', 'admin'), getAtRiskStudents);

export default router;
