import express from 'express';
import { 
    registerUser, 
    getAllUsers, 
    getUserById, 
    updateProfile, 
    updateUserRole, 
    deleteUser 
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register-user', registerUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
