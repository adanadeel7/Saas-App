import express from 'express';
import {
  createCheckoutSession,
  handleWebhook,
  getSubscription,
  cancelSubscription,
  verifyCheckout,
  checkoutDebit,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/webhook', handleWebhook); // PayFast ITN webhook url
router.post('/verify-checkout', protect, verifyCheckout); // Direct verification fallback
router.post('/checkout-debit', protect, checkoutDebit);
router.get('/subscription', protect, getSubscription);
router.post('/cancel', protect, cancelSubscription);

export default router;
