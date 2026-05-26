import PDFDocument from 'pdfkit';
import currencies from './currencies.js';

const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const currencyInfo = currencies[invoice.currency] || { symbol: invoice.currency, locale: 'en-US' };
  
  // Safe symbol display helper to prevent encoding issues with certain fonts
  const safeSymbol = ['USD', 'EUR', 'GBP', 'JPY'].includes(invoice.currency) 
    ? currencyInfo.symbol 
    : `${invoice.currency} `;

  const formatMoney = (amount) => {
    return `${safeSymbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    return new Date(dateVal).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // --- Header Section ---
  doc
    .fillColor('#0b1326') // Obsidian / Dark Navy theme color
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('EQUINOX', 50, 50);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#64748b')
    .text('PROFESSIONAL BILLING', 50, 80);

  // Invoice Details (Right-aligned)
  doc
    .fillColor('#0f172a')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`INVOICE: ${invoice.invoiceNumber}`, 400, 50, { align: 'right' })
    .font('Helvetica')
    .fillColor('#64748b')
    .text(`DATE: ${formatDate(invoice.issueDate)}`, 400, 65, { align: 'right' })
    .text(`DUE DATE: ${formatDate(invoice.dueDate)}`, 400, 80, { align: 'right' });

  // Divider Line
  doc
    .moveTo(50, 105)
    .lineTo(550, 105)
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .stroke();

  // --- Parties Section ---
  // Freelancer Info (Left)
  doc
    .fillColor('#0b1326')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('FROM:', 50, 125)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(invoice.freelancerName, 50, 140)
    .fillColor('#64748b')
    .text(invoice.freelancerEmail || '', 50, 155);

  // Client Info (Right)
  doc
    .fillColor('#0b1326')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('BILLED TO:', 300, 125)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(invoice.clientName, 300, 140)
    .fillColor('#64748b')
    .text(invoice.clientEmail || '', 300, 155)
    .text(invoice.clientAddress || '', 300, 170);

  // Project Context
  doc
    .fillColor('#0b1326')
    .font('Helvetica-Bold')
    .text('PROJECT:', 50, 200)
    .font('Helvetica')
    .fillColor('#0f172a')
    .text(`${invoice.projectTitle} (Duration: ${invoice.duration} ${invoice.durationUnit || 'days'})`, 50, 215);

  // Divider Line
  doc
    .moveTo(50, 235)
    .lineTo(550, 235)
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .stroke();

  // --- Table Header ---
  let y = 255;
  doc
    .fillColor('#0b1326')
    .font('Helvetica-Bold')
    .text('DESCRIPTION', 50, y)
    .text('QTY', 350, y, { width: 50, align: 'center' })
    .text('RATE', 410, y, { width: 60, align: 'right' })
    .text('AMOUNT', 480, y, { width: 70, align: 'right' });

  // Divider Line
  doc
    .moveTo(50, 272)
    .lineTo(550, 272)
    .strokeColor('#475569')
    .lineWidth(1.5)
    .stroke();

  // --- Table Rows ---
  y = 285;
  doc.font('Helvetica').fillColor('#0f172a');
  
  if (invoice.lineItems && invoice.lineItems.length > 0) {
    invoice.lineItems.forEach((item) => {
      // Draw rows
      doc
        .text(item.description, 50, y, { width: 280 })
        .text(String(item.quantity), 350, y, { width: 50, align: 'center' })
        .text(formatMoney(item.rate), 410, y, { width: 60, align: 'right' })
        .text(formatMoney(item.amount), 480, y, { width: 70, align: 'right' });
      
      y += 25;
      
      // Draw a subtle line under each row
      doc
        .moveTo(50, y - 5)
        .lineTo(550, y - 5)
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .stroke();
    });
  } else {
    // If no line items, output a single row for the project price
    doc
      .text(`${invoice.projectTitle} - Fixed Price`, 50, y, { width: 280 })
      .text('1', 350, y, { width: 50, align: 'center' })
      .text(formatMoney(invoice.projectPrice), 410, y, { width: 60, align: 'right' })
      .text(formatMoney(invoice.projectPrice), 480, y, { width: 70, align: 'right' });
    y += 25;
  }

  // --- Totals ---
  y += 10;
  doc
    .moveTo(350, y)
    .lineTo(550, y)
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .stroke();

  y += 10;
  doc
    .font('Helvetica-Bold')
    .fillColor('#0b1326')
    .text('TOTAL DUE:', 350, y, { width: 100, align: 'left' })
    .text(formatMoney(invoice.totalAmount), 450, y, { width: 100, align: 'right' });

  // --- Payment Details & Notes Section ---
  y += 50;
  
  if (
    invoice.paymentDetails &&
    (invoice.paymentDetails.accountNumber ||
      invoice.paymentDetails.paypalEmail ||
      invoice.paymentDetails.paymentLink ||
      invoice.paymentDetails.instructions)
  ) {
    doc
      .moveTo(50, y - 10)
      .lineTo(550, y - 10)
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor('#0b1326')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('PAYMENT DETAILS', 50, y)
      .font('Helvetica')
      .fillColor('#475569')
      .fontSize(9);

    y += 15;
    
    const details = invoice.paymentDetails;
    if (details.method === 'bank_transfer' && details.accountNumber) {
      doc.text(`Bank Transfer: ${details.bankName || ''}`, 50, y);
      doc.text(`Account Name: ${details.accountName || ''}`, 50, y + 12);
      doc.text(`Account Number: ${details.accountNumber}`, 50, y + 24);
      if (details.routingNumber) {
        doc.text(`Routing/Sort Code: ${details.routingNumber}`, 50, y + 36);
      }
      y += 55;
    } else if (details.method === 'paypal' && details.paypalEmail) {
      doc.text(`PayPal: ${details.paypalEmail}`, 50, y);
      y += 20;
    } else if (details.method === 'payment_link' && details.paymentLink) {
      doc.text(`Payment Link: ${details.paymentLink}`, 50, y);
      y += 20;
    } else if (details.instructions) {
      doc.text(details.instructions, 50, y, { width: 500 });
      y += 35;
    }
  }

  // --- Notes Section ---
  if (invoice.notes) {
    y += 10;
    doc
      .fillColor('#0b1326')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('NOTES', 50, y)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(invoice.notes, 50, y + 12, { width: 500 });
  }

  // --- Footer ---
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .text(
        'Thank you for your business. Generated via Equinox Invoicing.',
        50,
        780,
        { align: 'center', width: 500 }
      );
  }

  doc.end();
  return doc;
};

export { generateInvoicePDF };
