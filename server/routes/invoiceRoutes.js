import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPlanLimit } from '../middleware/planMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getInvoices)
  .post(protect, checkPlanLimit, createInvoice);

router.route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice);

router.get('/:id/pdf', protect, downloadInvoicePDF);

export default router;
