import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
  { code: 'NGN', symbol: '₦' },
  { code: 'BRL', symbol: 'R$' },
  { code: 'CHF', symbol: 'CHF' },
];

const InvoiceForm = ({ initialData, onSubmit, submitBtnText }) => {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    freelancerName: user?.name || '',
    freelancerEmail: user?.email || '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    projectTitle: '',
    projectPrice: 0,
    duration: '1',
    durationUnit: 'weeks',
    currency: user?.defaultCurrency || 'USD',
    dueDate: '',
    notes: '',
    status: 'draft',
    paymentDetails: {
      method: 'bank_transfer',
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      paypalEmail: '',
      paymentLink: '',
      instructions: '',
    },
  });

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        freelancerName: initialData.freelancerName || '',
        freelancerEmail: initialData.freelancerEmail || '',
        clientName: initialData.clientName || '',
        clientEmail: initialData.clientEmail || '',
        clientAddress: initialData.clientAddress || '',
        projectTitle: initialData.projectTitle || '',
        projectPrice: initialData.projectPrice || 0,
        duration: initialData.duration || '1',
        durationUnit: initialData.durationUnit || 'weeks',
        currency: initialData.currency || 'USD',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        notes: initialData.notes || '',
        status: initialData.status || 'draft',
        paymentDetails: {
          method: initialData.paymentDetails?.method || 'bank_transfer',
          bankName: initialData.paymentDetails?.bankName || '',
          accountName: initialData.paymentDetails?.accountName || '',
          accountNumber: initialData.paymentDetails?.accountNumber || '',
          routingNumber: initialData.paymentDetails?.routingNumber || '',
          paypalEmail: initialData.paymentDetails?.paypalEmail || '',
          paymentLink: initialData.paymentDetails?.paymentLink || '',
          instructions: initialData.paymentDetails?.instructions || '',
        },
      });
      if (initialData.lineItems && initialData.lineItems.length > 0) {
        setLineItems(initialData.lineItems);
      }
    }
  }, [initialData]);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    setFormData({
      ...formData,
      paymentDetails: {
        ...formData.paymentDetails,
        [e.target.name]: e.target.value,
      },
    });
  };

  // Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    let parsedValue = value;

    if (field === 'quantity') {
      parsedValue = parseInt(value) || 0;
    } else if (field === 'rate') {
      parsedValue = parseFloat(value) || 0;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: parsedValue,
    };

    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }

    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) {
      toast.error('At least one line item is required');
      return;
    }
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
  const total = subtotal; // No tax fields

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientName.trim()) {
      toast.error('Client Name is required');
      return;
    }
    if (!formData.projectTitle || !formData.projectTitle.trim()) {
      toast.error('Project Title is required');
      return;
    }
    
    // Sanitize line items:
    // Filter out rows that are completely empty (no description, 0 rate)
    // If the user filled in a rate or quantity but left the description blank, auto-populate description with the project title.
    let sanitizedItems = lineItems
      .map(item => {
        const desc = item.description ? item.description.trim() : '';
        const qty = parseInt(item.quantity) || 1;
        const rate = parseFloat(item.rate) || 0;
        
        return {
          description: desc,
          quantity: qty,
          rate: rate,
          amount: qty * rate
        };
      })
      .filter(item => {
        // Keep items that have either a description or a rate > 0
        return item.description !== '' || item.rate > 0;
      });

    // If all line items were filtered out (i.e. they were all empty defaults),
    // we create a single default line item using the project details so the database validation passes.
    if (sanitizedItems.length === 0) {
      sanitizedItems = [
        {
          description: formData.projectTitle || 'General Services',
          quantity: 1,
          rate: parseFloat(formData.projectPrice) || 0,
          amount: parseFloat(formData.projectPrice) || 0,
        }
      ];
    } else {
      // For any item where description is blank but rate is > 0, fill in the description with projectTitle
      sanitizedItems = sanitizedItems.map(item => {
        if (!item.description) {
          item.description = formData.projectTitle || 'General Services';
        }
        return item;
      });
    }

    // Sync projectPrice to the new sanitized items subtotal
    const calculatedTotal = sanitizedItems.reduce((acc, item) => acc + item.amount, 0);

    const payload = {
      ...formData,
      projectPrice: calculatedTotal,
      lineItems: sanitizedItems,
    };

    onSubmit(payload);
  };

  const getCurrencySymbol = () => {
    const match = currencies.find((c) => c.code === formData.currency);
    return match ? match.symbol : '$';
  };

  const formatPreviewMoney = (val) => {
    return `${getCurrencySymbol()}${val.toFixed(2)}`;
  };

  return (
    <main className="flex flex-col lg:flex-row min-h-screen w-full animate-fade-in">
      {/* Left Side: Form Fields */}
      <section className="w-full lg:w-1/2 border-r border-outline-variant bg-surface-container-low p-6 md:p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-10 pb-16">
          <header>
            <h1 className="font-headline-lg text-2xl font-extrabold text-on-surface tracking-tight">
              {initialData ? 'Edit Invoice' : 'Create Invoice'}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Precision billing for high-performance freelance workflows.
            </p>
          </header>

          <div className="space-y-6">
            {/* Freelancer Details */}
            <div className="space-y-4">
              <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                My Details
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="freelancerName"
                  value={formData.freelancerName}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="My Name"
                  required
                />
                <input
                  type="email"
                  name="freelancerEmail"
                  value={formData.freelancerEmail}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="myemail@domain.com"
                  required
                />
              </div>
            </div>

            {/* Client Info Section */}
            <div className="space-y-4">
              <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                Client Details
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleFormChange}
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Client Name or Company"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Client Email Address"
                />
                <input
                  type="text"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Client Mailing Address"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                Project Details
              </label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleFormChange}
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Project Name / Contract Name"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="1"
                  required
                />
                <select
                  name="durationUnit"
                  value={formData.durationUnit}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                  Line Items
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-primary flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer font-bold text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Row
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center group animate-fade-in">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="col-span-6 bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Description"
                      required
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="col-span-2 bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-xs text-center focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Qty"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="col-span-3 bg-surface-dim border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Rate"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="col-span-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 border-t border-outline-variant/30 pt-6">
              <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                Payment Details
              </label>
              <select
                name="method"
                value={formData.paymentDetails.method}
                onChange={handlePaymentChange}
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="payment_link">Payment URL Link</option>
                <option value="other">Other Details</option>
              </select>

              {formData.paymentDetails.method === 'bank_transfer' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <input
                    type="text"
                    name="bankName"
                    value={formData.paymentDetails.bankName}
                    onChange={handlePaymentChange}
                    className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="Bank Name"
                  />
                  <input
                    type="text"
                    name="accountName"
                    value={formData.paymentDetails.accountName}
                    onChange={handlePaymentChange}
                    className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="Account Holder Name"
                  />
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.paymentDetails.accountNumber}
                    onChange={handlePaymentChange}
                    className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary col-span-2"
                    placeholder="Account Number / IBAN"
                  />
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.paymentDetails.routingNumber}
                    onChange={handlePaymentChange}
                    className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary col-span-2"
                    placeholder="Routing Transit / Sort Code (Optional)"
                  />
                </div>
              )}

              {formData.paymentDetails.method === 'paypal' && (
                <input
                  type="email"
                  name="paypalEmail"
                  value={formData.paymentDetails.paypalEmail}
                  onChange={handlePaymentChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary animate-fade-in"
                  placeholder="PayPal Email Address"
                />
              )}

              {formData.paymentDetails.method === 'payment_link' && (
                <input
                  type="url"
                  name="paymentLink"
                  value={formData.paymentDetails.paymentLink}
                  onChange={handlePaymentChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary animate-fade-in"
                  placeholder="Payment Request URL (e.g. Stripe checkout page)"
                />
              )}

              {formData.paymentDetails.method === 'other' && (
                <textarea
                  name="instructions"
                  value={formData.paymentDetails.instructions}
                  onChange={handlePaymentChange}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary animate-fade-in"
                  placeholder="Custom payment instructions..."
                  rows="3"
                />
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2 border-t border-outline-variant/30 pt-6">
              <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-widest">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary"
                placeholder="Payment terms or thank you note..."
                rows="3"
              />
            </div>
          </div>

          <div className="pt-8">
            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 cursor-pointer shadow-lg active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined">save</span>
              {submitBtnText || 'Save Invoice'}
            </button>
          </div>
        </form>
      </section>

      {/* Right Side: Live Preview */}
      <section className="hidden lg:flex w-1/2 bg-surface p-12 items-start justify-center relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="preview-canvas w-full max-w-[480px] bg-[#1E293B] border border-[#334155] rounded-sm p-10 flex flex-col justify-between text-[#dae2fd] animate-fade-in sticky top-8">
          <div>
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tighter text-primary">EQUINOX</h2>
                <p className="text-[9px] font-label-md text-on-surface-variant uppercase tracking-widest opacity-60 font-bold">
                  Professional Invoicing
                </p>
              </div>
              <div className="text-right">
                <p className="font-label-md text-[10px] text-on-surface-variant font-bold">
                  INVOICE: {initialData?.invoiceNumber || 'INV-00000'}
                </p>
                <p className="font-label-md text-[10px] text-on-surface-variant">
                  DATE: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="font-label-md text-[9px] text-primary uppercase mb-1 font-bold">From</p>
                <h4 className="font-bold text-sm truncate">{formData.freelancerName || 'My Name'}</h4>
                <p className="text-[10px] text-on-surface-variant truncate">{formData.freelancerEmail || 'myemail@domain.com'}</p>
              </div>
              <div>
                <p className="font-label-md text-[9px] text-primary uppercase mb-1 font-bold">Billed To</p>
                <h4 className="font-bold text-sm truncate">{formData.clientName || 'Untitled Client'}</h4>
                <p className="text-[10px] text-on-surface-variant truncate">{formData.clientEmail || 'client@example.com'}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-label-md text-[9px] text-primary uppercase mb-1 font-bold">Project</p>
              <h4 className="text-sm font-bold">{formData.projectTitle || 'Project Title'}</h4>
              <p className="text-[10px] text-on-surface-variant">
                Duration: {formData.duration} {formData.durationUnit}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="grid grid-cols-12 border-b border-outline-variant pb-2 text-[10px] font-bold uppercase text-on-surface-variant">
                <p className="col-span-7">Description</p>
                <p className="col-span-2 text-center">Qty</p>
                <p className="col-span-3 text-right">Amount</p>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                {lineItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 text-xs">
                    <p className="col-span-7 truncate">{item.description || 'Line Item'}</p>
                    <p className="col-span-2 text-center font-mono">{item.quantity}</p>
                    <p className="col-span-3 text-right font-mono font-bold">
                      {formatPreviewMoney(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-end space-y-2 border-t border-outline-variant pt-6">
              <div className="flex justify-between w-40 text-xs">
                <p className="text-on-surface-variant">Subtotal</p>
                <p className="font-mono font-bold">{formatPreviewMoney(subtotal)}</p>
              </div>
              <div className="flex justify-between w-40 pt-2 border-t border-outline-variant">
                <p className="text-primary font-bold text-sm">Total Due</p>
                <p className="text-primary font-bold text-sm font-mono">{formatPreviewMoney(total)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 text-[10px]">
              <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1 font-bold">Payment Via</p>
              <p className="text-on-surface-variant/80 italic capitalize font-bold">
                {formData.paymentDetails.method.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default InvoiceForm;
