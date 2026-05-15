import express from 'express';
import { 
    registerUser, 
    getAllUsers, 
    getUserById, 
    updateProfile, 
    updateUserRole, 
    deleteUser,
    getMe,
    updateSettings
} from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/register-user', registerUser);

// Protected (any authenticated user)
router.get('/me', verifyToken, getMe);
router.patch('/settings', verifyToken, updateSettings);
router.get('/:id', verifyToken, getUserById);
router.put('/profile', verifyToken, updateProfile);

// Admin only
router.get('/', verifyToken, requireRole('admin'), getAllUsers);
router.patch('/:id/role', verifyToken, requireRole('admin'), updateUserRole);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;
