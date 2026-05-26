import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import dbFallback from '../utils/dbFallback.js';

// @desc    Get all user invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    
    if (mongoose.connection.readyState === 1) {
      const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(invoices);
    } else {
      const mockInvoices = dbFallback.findInvoicesByUser(userIdString);
      res.json(mockInvoices);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    let invoice = null;

    if (mongoose.connection.readyState === 1) {
      invoice = await Invoice.findById(req.params.id);
    } else {
      invoice = dbFallback.findInvoiceById(req.params.id);
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Verify ownership
    if (invoice.user.toString() !== userIdString) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  const {
    freelancerName,
    freelancerEmail,
    clientName,
    clientEmail,
    clientAddress,
    projectTitle,
    projectPrice,
    duration,
    durationUnit,
    currency,
    lineItems,
    paymentDetails,
    dueDate,
    notes,
    status,
  } = req.body;

  try {
    const userIdString = req.user._id.toString();
    let createdInvoice = null;

    if (mongoose.connection.readyState === 1) {
      const invoice = new Invoice({
        user: req.user._id,
        freelancerName,
        freelancerEmail: freelancerEmail || req.user.email,
        clientName,
        clientEmail,
        clientAddress,
        projectTitle,
        projectPrice,
        duration,
        durationUnit,
        currency,
        lineItems,
        paymentDetails,
        dueDate,
        notes,
        status: status || 'draft',
      });
      createdInvoice = await invoice.save();
    } else {
      createdInvoice = dbFallback.createInvoice(
        {
          freelancerName,
          freelancerEmail: freelancerEmail || req.user.email,
          clientName,
          clientEmail,
          clientAddress,
          projectTitle,
          projectPrice: Number(projectPrice) || 0,
          duration,
          durationUnit,
          currency,
          lineItems: lineItems || [],
          paymentDetails: paymentDetails || {},
          dueDate,
          notes,
          status: status || 'draft',
        },
        userIdString
      );
    }

    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    let invoice = null;
    let updatedInvoice = null;

    if (mongoose.connection.readyState === 1) {
      invoice = await Invoice.findById(req.params.id);
    } else {
      invoice = dbFallback.findInvoiceById(req.params.id);
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Verify ownership
    if (invoice.user.toString() !== userIdString) {
      return res.status(403).json({ message: 'Not authorized to modify this invoice' });
    }

    if (mongoose.connection.readyState === 1) {
      // Update fields
      invoice.freelancerName = req.body.freelancerName || invoice.freelancerName;
      invoice.freelancerEmail = req.body.freelancerEmail !== undefined ? req.body.freelancerEmail : invoice.freelancerEmail;
      invoice.clientName = req.body.clientName || invoice.clientName;
      invoice.clientEmail = req.body.clientEmail !== undefined ? req.body.clientEmail : invoice.clientEmail;
      invoice.clientAddress = req.body.clientAddress !== undefined ? req.body.clientAddress : invoice.clientAddress;
      invoice.projectTitle = req.body.projectTitle || invoice.projectTitle;
      invoice.projectPrice = req.body.projectPrice !== undefined ? req.body.projectPrice : invoice.projectPrice;
      invoice.duration = req.body.duration || invoice.duration;
      invoice.durationUnit = req.body.durationUnit || invoice.durationUnit;
      invoice.currency = req.body.currency || invoice.currency;
      invoice.lineItems = req.body.lineItems || invoice.lineItems;
      invoice.paymentDetails = req.body.paymentDetails || invoice.paymentDetails;
      invoice.dueDate = req.body.dueDate || invoice.dueDate;
      invoice.notes = req.body.notes !== undefined ? req.body.notes : invoice.notes;
      invoice.status = req.body.status || invoice.status;

      updatedInvoice = await invoice.save();
    } else {
      const updateData = {
        freelancerName: req.body.freelancerName,
        freelancerEmail: req.body.freelancerEmail,
        clientName: req.body.clientName,
        clientEmail: req.body.clientEmail,
        clientAddress: req.body.clientAddress,
        projectTitle: req.body.projectTitle,
        projectPrice: req.body.projectPrice !== undefined ? Number(req.body.projectPrice) : undefined,
        duration: req.body.duration,
        durationUnit: req.body.durationUnit,
        currency: req.body.currency,
        lineItems: req.body.lineItems,
        paymentDetails: req.body.paymentDetails,
        dueDate: req.body.dueDate,
        notes: req.body.notes,
        status: req.body.status,
      };

      // Filter out undefined keys
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      updatedInvoice = dbFallback.updateInvoice(req.params.id, updateData);
    }

    res.json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    let invoice = null;

    if (mongoose.connection.readyState === 1) {
      invoice = await Invoice.findById(req.params.id);
    } else {
      invoice = dbFallback.findInvoiceById(req.params.id);
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Verify ownership
    if (invoice.user.toString() !== userIdString) {
      return res.status(403).json({ message: 'Not authorized to delete this invoice' });
    }

    if (mongoose.connection.readyState === 1) {
      await invoice.deleteOne();
    } else {
      dbFallback.deleteInvoice(req.params.id);
    }

    res.json({ message: 'Invoice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    let invoice = null;

    if (mongoose.connection.readyState === 1) {
      invoice = await Invoice.findById(req.params.id);
    } else {
      invoice = dbFallback.findInvoiceById(req.params.id);
    }

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Verify ownership
    if (invoice.user.toString() !== userIdString) {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    // Generate PDF stream
    const pdfStream = generateInvoicePDF(invoice);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`
    );

    // Pipe PDF kit stream to response
    pdfStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
};
