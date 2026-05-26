import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getInvoice, deleteInvoice, updateInvoice, reset } from '../features/invoices/invoiceSlice';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';
import API from '../services/api';

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

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentInvoice, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.invoices
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getInvoice(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to fetch invoice details');
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      dispatch(deleteInvoice(id))
        .unwrap()
        .then(() => {
          toast.success('Invoice deleted successfully');
          navigate('/dashboard');
        })
        .catch((err) => {
          toast.error(err || 'Failed to delete invoice');
        });
    }
  };

  const handleStatusChange = (newStatus) => {
    dispatch(updateInvoice({ id, invoiceData: { status: newStatus } }))
      .unwrap()
      .then(() => {
        toast.success(`Status updated to ${newStatus}`);
      })
      .catch((err) => {
        toast.error(err || 'Failed to update status');
      });
  };

  const handleDownloadPDF = () => {
    if (!currentInvoice) return;

    toast.loading('Generating PDF...');

    API.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${currentInvoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.dismiss();
        toast.success('Invoice PDF downloaded!');
      })
      .catch((err) => {
        console.error('PDF download error:', err);
        toast.dismiss();
        toast.error('Failed to download invoice PDF');
      });
  };

  const getCurrencySymbol = () => {
    if (!currentInvoice) return '$';
    const match = currencies.find((c) => c.code === currentInvoice.currency);
    return match ? match.symbol : '$';
  };

  const formatMoney = (val) => {
    return `${getCurrencySymbol()}${val.toFixed(2)}`;
  };

  if (isLoading && !currentInvoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
          <p className="text-sm font-bold">Loading Invoice Details...</p>
        </div>
      </div>
    );
  }

  if (!currentInvoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">
        <div className="text-center space-y-4">
          <p className="text-sm font-bold">Invoice not found.</p>
          <Link to="/dashboard" className="text-primary hover:underline font-bold text-xs">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOverdue =
    currentInvoice.status !== 'paid' &&
    currentInvoice.dueDate &&
    new Date(currentInvoice.dueDate) < new Date();

  return (
    <div className="max-w-container-max-width mx-auto px-margin-desktop py-10 flex gap-gutter min-h-screen">
      <Sidebar />

      <section className="flex-grow flex flex-col gap-8 animate-fade-in pb-16">
        {/* Actions Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-on-surface">Invoice {currentInvoice.invoiceNumber}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-on-surface-variant">Status:</span>
                <select
                  value={currentInvoice.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-surface-dim border border-outline-variant/40 rounded px-2 py-0.5 text-xs text-primary font-bold focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
                {isOverdue && (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    Overdue
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/invoices/${id}/edit`)}
              className="flex-1 sm:flex-none border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-all text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download PDF
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 sm:flex-none border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-red-500/10 hover:text-red-500 transition-all text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete
            </button>
          </div>
        </div>

        {/* Invoice Page Visualizer */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8 md:p-12 text-[#dae2fd] max-w-3xl shadow-2xl relative overflow-hidden self-start w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-12 border-b border-outline-variant/20 pb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tighter text-primary">EQUINOX</h2>
              <p className="text-[10px] font-label-md text-on-surface-variant uppercase tracking-widest opacity-60 font-bold">
                Professional Invoicing
              </p>
            </div>
            <div className="text-right">
              <p className="font-label-md text-xs text-on-surface font-bold">
                INVOICE: {currentInvoice.invoiceNumber}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                DATE: {new Date(currentInvoice.issueDate).toLocaleDateString()}
              </p>
              {currentInvoice.dueDate && (
                <p className="text-xs text-on-surface-variant mt-1">
                  DUE DATE: {new Date(currentInvoice.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <p className="font-label-md text-[10px] text-primary uppercase mb-2 font-bold tracking-wider">From</p>
              <h4 className="font-bold text-base text-white">{currentInvoice.freelancerName}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{currentInvoice.freelancerEmail}</p>
            </div>
            <div>
              <p className="font-label-md text-[10px] text-primary uppercase mb-2 font-bold tracking-wider">Billed To</p>
              <h4 className="font-bold text-base text-white">{currentInvoice.clientName}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{currentInvoice.clientEmail}</p>
              {currentInvoice.clientAddress && (
                <p className="text-xs text-on-surface-variant mt-1">{currentInvoice.clientAddress}</p>
              )}
            </div>
          </div>

          <div className="mb-10">
            <p className="font-label-md text-[10px] text-primary uppercase mb-2 font-bold tracking-wider">Project Scope</p>
            <h4 className="text-sm font-bold text-white">{currentInvoice.projectTitle}</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              Duration: {currentInvoice.duration} {currentInvoice.durationUnit}
            </p>
          </div>

          {/* Line Items Table */}
          <div className="space-y-4 mb-12">
            <div className="grid grid-cols-12 border-b border-outline-variant/30 pb-2 text-xs font-bold uppercase text-on-surface-variant">
              <p className="col-span-7">Description</p>
              <p className="col-span-2 text-center">Qty</p>
              <p className="col-span-3 text-right">Amount</p>
            </div>
            <div className="space-y-3">
              {currentInvoice.lineItems && currentInvoice.lineItems.length > 0 ? (
                currentInvoice.lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-sm border-b border-outline-variant/10 pb-3">
                    <p className="col-span-7 text-white font-medium">{item.description}</p>
                    <p className="col-span-2 text-center font-mono">{item.quantity}</p>
                    <p className="col-span-3 text-right font-mono font-bold text-primary">
                      {formatMoney(item.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-12 text-sm border-b border-outline-variant/10 pb-3">
                  <p className="col-span-7 text-white font-medium">{currentInvoice.projectTitle} - Fixed Price</p>
                  <p className="col-span-2 text-center font-mono">1</p>
                  <p className="col-span-3 text-right font-mono font-bold text-primary">
                    {formatMoney(currentInvoice.projectPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Calculations */}
          <div className="flex flex-col items-end space-y-2 border-t border-outline-variant/30 pt-6 mb-8">
            <div className="flex justify-between w-48 text-xs text-on-surface-variant">
              <p>Subtotal</p>
              <p className="font-mono">{formatMoney(currentInvoice.subtotal)}</p>
            </div>
            <div className="flex justify-between w-48 pt-2 border-t border-outline-variant/50">
              <p className="text-primary font-bold text-sm">Total Due</p>
              <p className="text-primary font-bold text-sm font-mono">{formatMoney(currentInvoice.totalAmount)}</p>
            </div>
          </div>

          {/* Payment Details */}
          {currentInvoice.paymentDetails && (
            <div className="pt-6 border-t border-outline-variant/30 text-xs space-y-2">
              <p className="font-label-md text-primary uppercase tracking-widest mb-2 font-bold">Payment Methods</p>
              <p className="text-on-surface font-semibold capitalize">
                Preferred Method: {currentInvoice.paymentDetails.method.replace('_', ' ')}
              </p>
              {currentInvoice.paymentDetails.method === 'bank_transfer' && currentInvoice.paymentDetails.accountNumber && (
                <div className="bg-surface-container-low/40 p-4 rounded-lg border border-outline-variant/20 grid grid-cols-2 gap-2 text-on-surface-variant mt-2">
                  <p>Bank: <span className="text-white font-medium">{currentInvoice.paymentDetails.bankName}</span></p>
                  <p>Account Name: <span className="text-white font-medium">{currentInvoice.paymentDetails.accountName}</span></p>
                  <p className="col-span-2">Account/IBAN: <span className="text-white font-medium font-mono">{currentInvoice.paymentDetails.accountNumber}</span></p>
                  {currentInvoice.paymentDetails.routingNumber && (
                    <p className="col-span-2">Routing/Sort Code: <span className="text-white font-medium font-mono">{currentInvoice.paymentDetails.routingNumber}</span></p>
                  )}
                </div>
              )}
              {currentInvoice.paymentDetails.method === 'paypal' && currentInvoice.paymentDetails.paypalEmail && (
                <p className="text-on-surface-variant">PayPal Email: <span className="text-white font-medium">{currentInvoice.paymentDetails.paypalEmail}</span></p>
              )}
              {currentInvoice.paymentDetails.method === 'payment_link' && currentInvoice.paymentDetails.paymentLink && (
                <p className="text-on-surface-variant">
                  Payment Link:{' '}
                  <a
                    href={currentInvoice.paymentDetails.paymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    Click to pay
                  </a>
                </p>
              )}
              {currentInvoice.paymentDetails.instructions && (
                <p className="text-on-surface-variant italic mt-1">{currentInvoice.paymentDetails.instructions}</p>
              )}
            </div>
          )}

          {/* Notes */}
          {currentInvoice.notes && (
            <div className="pt-6 border-t border-outline-variant/30 mt-6 text-xs text-on-surface-variant">
              <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1 font-bold">Notes</p>
              <p className="italic">{currentInvoice.notes}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InvoiceDetail;
