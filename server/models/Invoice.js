import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  rate: {
    type: Number,
    required: true,
    default: 0,
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
});

const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'payment_link', 'other'],
    default: 'bank_transfer',
  },
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  routingNumber: { type: String, default: '' },
  paypalEmail: { type: String, default: '' },
  paymentLink: { type: String, default: '' },
  instructions: { type: String, default: '' },
});

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    freelancerName: {
      type: String,
      required: true,
    },
    freelancerEmail: {
      type: String,
      default: '',
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      default: '',
    },
    clientAddress: {
      type: String,
      default: '',
    },
    projectTitle: {
      type: String,
      required: true,
    },
    projectPrice: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    durationUnit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'days',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    lineItems: [lineItemSchema],
    paymentDetails: {
      type: paymentDetailsSchema,
      default: () => ({}),
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid'],
      default: 'draft',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculations and sequence generation
invoiceSchema.pre('validate', async function (next) {
  // 1. Calculate line item amounts
  let calculatedSubtotal = 0;
  if (this.lineItems && this.lineItems.length > 0) {
    this.lineItems.forEach((item) => {
      item.amount = item.quantity * item.rate;
      calculatedSubtotal += item.amount;
    });
  } else {
    // If no line items, fallback to projectPrice
    calculatedSubtotal = this.projectPrice || 0;
  }
  this.subtotal = calculatedSubtotal;
  this.totalAmount = calculatedSubtotal; // No tax fields as requested

  // 2. Generate invoiceNumber if not present
  if (!this.invoiceNumber) {
    try {
      const InvoiceModel = mongoose.model('Invoice', invoiceSchema);
      const count = await InvoiceModel.countDocuments({ user: this.user });
      const nextNum = String(count + 1).padStart(5, '0');
      this.invoiceNumber = `INV-${nextNum}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
