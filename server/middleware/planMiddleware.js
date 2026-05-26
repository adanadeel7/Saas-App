import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import dbFallback from '../utils/dbFallback.js';

const checkPlanLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();

    // Administrators and Pro/Business plans have unlimited invoice creation
    if (
      user.role === 'admin' ||
      (user.email && user.email.toLowerCase() === adminEmail) ||
      user.plan === 'pro' ||
      user.plan === 'business'
    ) {
      return next();
    }

    // Free plan has a limit of 5 invoices total or per month.
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let count = 0;
    const userIdString = user._id.toString();

    if (mongoose.connection.readyState === 1) {
      count = await Invoice.countDocuments({
        user: user._id,
        createdAt: { $gte: startOfMonth },
      });
    } else {
      const mockInvoices = dbFallback.findInvoicesByUser(userIdString);
      count = mockInvoices.filter((inv) => new Date(inv.createdAt) >= startOfMonth).length;
    }

    if (count >= 5) {
      return res.status(403).json({
        message: 'Free plan limit reached (5 invoices/month). Please upgrade to Pro or Business for unlimited invoicing.',
        limitReached: true,
      });
    }

    next();
  } catch (error) {
    console.error('Plan limit check error:', error);
    res.status(500).json({ message: 'Server error checking plan limits' });
  }
};

export { checkPlanLimit };
