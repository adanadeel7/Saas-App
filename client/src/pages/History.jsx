import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../features/invoices/invoiceSlice';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';
import API from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { invoices, isLoading, isError, message } = useSelector(
    (state) => state.invoices
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getInvoices());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to load invoices');
    }
  }, [isError, message]);

  // Calculations for Stats (based on filtered or total invoices)
  const calculateTotals = () => {
    let totalBilled = 0;
    let pendingBilled = 0;
    let overdueBilled = 0;

    if (invoices && invoices.length > 0) {
      invoices.forEach((inv) => {
        totalBilled += inv.totalAmount;
        if (inv.status === 'sent') {
          pendingBilled += inv.totalAmount;
        } else if (inv.status === 'draft') {
          // You could count drafts as pending or separate.
        } else if (inv.status === 'paid') {
          // Paid
        }
        // If due date is passed and status is not paid, count as overdue
        if (inv.status !== 'paid' && inv.dueDate && new Date(inv.dueDate) < new Date()) {
          overdueBilled += inv.totalAmount;
        }
      });
    }

    return { totalBilled, pendingBilled, overdueBilled };
  };

  const { totalBilled, pendingBilled, overdueBilled } = calculateTotals();

  const formatAmount = (val) => {
    const currency = user?.defaultCurrency || 'USD';
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(val);
  };

  // Searching & Filtering logic
  const filteredInvoices = invoices
    ? invoices.filter((inv) => {
        const matchesSearch =
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          inv.status === statusFilter ||
          (statusFilter === 'overdue' &&
            inv.status !== 'paid' &&
            inv.dueDate &&
            new Date(inv.dueDate) < new Date());

        return matchesSearch && matchesStatus;
      })
    : [];

  const handleDownloadPDF = (e, invoiceId, invoiceNumber) => {
    e.stopPropagation(); // Prevent row click navigation
    toast.loading('Preparing PDF...');
    
    API.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoiceNumber}.pdf`;
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

  return (
    <div className="max-w-container-max-width mx-auto px-margin-desktop py-10 flex gap-gutter min-h-screen">
      <Sidebar />

      {/* Main Content Section */}
      <section className="flex-grow flex flex-col gap-10 animate-fade-in">
        {/* Header & Description */}
        <div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface">Invoice History</h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            A comprehensive list and overview of your freelance transactions.
          </p>
        </div>

        {/* Bento Grid Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Billed */}
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total Billed (YTD)</span>
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <div>
              <span className="font-label-md text-2xl font-extrabold font-mono text-on-surface">
                {formatAmount(totalBilled)}
              </span>
            </div>
          </div>

          {/* Pending Billed */}
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Pending Revenue</span>
              <span className="material-symbols-outlined text-tertiary">pending_actions</span>
            </div>
            <div>
              <span className="font-label-md text-2xl font-extrabold font-mono text-on-surface">
                {formatAmount(pendingBilled)}
              </span>
            </div>
          </div>

          {/* Overdue */}
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Overdue Balance</span>
              <span className="material-symbols-outlined text-red-400">warning</span>
            </div>
            <div>
              <span className="font-label-md text-2xl font-extrabold font-mono text-red-400">
                {formatAmount(overdueBilled)}
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-outline-variant/20 pt-6">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/40"
              placeholder="Search by client or invoice ID..."
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
            {['all', 'paid', 'sent', 'overdue', 'draft'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer capitalize ${
                  statusFilter === filter
                    ? 'bg-primary border-primary text-on-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table Container */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden shadow-xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-highest/20 text-xs">
                  <th className="py-4 px-6 font-bold uppercase text-on-surface-variant">Invoice ID</th>
                  <th className="py-4 px-6 font-bold uppercase text-on-surface-variant">Client</th>
                  <th className="py-4 px-6 font-bold uppercase text-on-surface-variant">Date</th>
                  <th className="py-4 px-6 font-bold uppercase text-on-surface-variant">Status</th>
                  <th className="py-4 px-6 font-bold uppercase text-on-surface-variant text-right">Amount</th>
                  <th className="py-4 px-6 font-bold uppercase text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredInvoices.map((inv) => {
                  const badgeStyles = {
                    paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
                    sent: 'bg-primary/10 text-primary border border-primary/20',
                    draft: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/20',
                  };

                  const isOverdue =
                    inv.status !== 'paid' &&
                    inv.dueDate &&
                    new Date(inv.dueDate) < new Date();

                  return (
                    <tr
                      key={inv._id}
                      onClick={() => navigate(`/invoices/${inv._id}`)}
                      className="border-b border-outline-variant/20 hover:bg-surface-container-high/30 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-primary">{inv.invoiceNumber}</td>
                      <td className="py-4 px-6 font-bold">{inv.clientName}</td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isOverdue
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : badgeStyles[inv.status]
                          }`}
                        >
                          {isOverdue ? 'Overdue' : inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-right text-sm">
                        {formatAmount(inv.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/invoices/${inv._id}`);
                            }}
                            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="View Invoice"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={(e) => handleDownloadPDF(e, inv._id, inv.invoiceNumber)}
                            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!filteredInvoices || filteredInvoices.length === 0) && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-on-surface-variant/40 text-sm">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default History;
