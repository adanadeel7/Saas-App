import express from 'express';
import { getUsers, updateUserPlan, deleteUser, updateUserRole } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminCheck } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', protect, adminCheck, getUsers);
router.put('/users/:id/plan', protect, adminCheck, updateUserPlan);
router.put('/users/:id/role', protect, adminCheck, updateUserRole);
router.delete('/users/:id', protect, adminCheck, deleteUser);

export default router;
