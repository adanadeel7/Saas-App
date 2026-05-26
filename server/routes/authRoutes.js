import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserSettings,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.get('/me', protect, getUserProfile);
router.put('/settings', protect, updateUserSettings);

export default router;
