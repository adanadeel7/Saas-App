import express from 'express';
import { getUsers } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminCheck } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', protect, adminCheck, getUsers);

export default router;
