import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getInvoices } from '../features/invoices/invoiceSlice';
import Sidebar from '../components/layout/Sidebar';
import API from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { invoices, isLoading, isError, message } = useSelector(
    (state) => state.invoices
  );

  useEffect(() => {
    dispatch(getInvoices());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Failed to load invoices');
    }
  }, [isError, message]);

  // Calculations for Stats
  const calculateStats = () => {
    let totalEarnings = 0;
    let pendingRevenue = 0;
    let unpaidCount = 0;

    if (invoices && invoices.length > 0) {
      invoices.forEach((inv) => {
        if (inv.status === 'paid') {
          totalEarnings += inv.totalAmount;
        } else if (inv.status === 'sent') {
          pendingRevenue += inv.totalAmount;
          unpaidCount++;
        } else if (inv.status === 'draft') {
          unpaidCount++;
        }
      });
    }

    return { totalEarnings, pendingRevenue, unpaidCount };
  };

  const { totalEarnings, pendingRevenue, unpaidCount } = calculateStats();

  const formatAmount = (val) => {
    const currency = user?.defaultCurrency || 'USD';
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    });
    return formatter.format(val);
  };

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Get recent 5 invoices
  const recentInvoices = invoices ? invoices.slice(0, 5) : [];

  const handleResendVerification = async () => {
    try {
      const response = await API.post('/auth/resend-verification');
      toast.success(response.data.message || 'Verification link resent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="max-w-container-max-width mx-auto px-margin-desktop py-10 flex gap-gutter min-h-screen">
      <Sidebar />

      {/* Main Dashboard Canvas */}
      <section className="flex-grow flex flex-col gap-10 animate-fade-in">
        {/* Header Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface">Precision Dashboard</h1>
            <p className="text-on-surface-variant font-body-md mt-1">
              Welcome back, <span className="text-primary font-bold">{user?.name}</span>. Your finance overview is up to date.
            </p>
          </div>
          <button
            onClick={() => navigate('/invoices/new')}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-115 active:scale-95 transition-transform duration-200 cursor-pointer group shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined transition-transform group-hover:rotate-90">add</span>
            Create New Invoice
          </button>
        </div>

        {/* Email Verification Warning Banner */}
        {user && !user.isVerified && (
          <div className="glass-panel border-amber-500/30 bg-amber-500/5 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-left animate-fade-in">
            <span className="material-symbols-outlined text-amber-500 text-[24px]">warning</span>
            <div className="flex-grow">
              <h4 className="text-sm font-bold text-on-surface">Verify your email address</h4>
              <p className="text-xs text-on-surface-variant">
                Please check your inbox (or server console) for a verification link to activate full invoicing actions.
              </p>
            </div>
            <button
              onClick={handleResendVerification}
              className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              Resend Verification Link
            </button>
          </div>
        )}

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Earnings */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Total Earnings (PAID)</span>
              <span className="material-symbols-outlined text-primary">trending_up</span>
            </div>
            <div className="font-label-md text-3xl font-extrabold text-primary font-mono">
              {formatAmount(totalEarnings)}
            </div>
            <div className="text-label-sm text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              Active invoices tracking
            </div>
          </div>

          {/* Pending Revenue */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Pending Revenue</span>
              <span className="material-symbols-outlined text-tertiary">hourglass_empty</span>
            </div>
            <div className="font-label-md text-3xl font-extrabold text-on-surface font-mono">
              {formatAmount(pendingRevenue)}
            </div>
            <div className="text-label-sm text-on-surface-variant">
              {unpaidCount} unpaid/draft invoices
            </div>
          </div>

          {/* Plan stats */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-label-md uppercase tracking-wider font-bold">Account Tier</span>
              <span className="material-symbols-outlined text-secondary">bolt</span>
            </div>
            <div className="font-label-md text-3xl font-extrabold text-on-surface capitalize">
              {user?.plan} Plan
            </div>
            <div className="text-label-sm text-on-surface-variant">
              {user?.plan === 'free' ? 'Upgrade for unlimited invoices' : 'Unlimited invoicing unlocked'}
            </div>
          </div>
        </div>

        {/* Visual Data & Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          {/* Main Activity Chart Card */}
          <div className="xl:col-span-3 glass-panel p-8 rounded-3xl flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-xl font-bold text-on-surface">Revenue Flow</h3>
              <div className="flex gap-2">
                <button className="text-xs bg-surface-container-high px-3 py-1 rounded-full text-primary font-bold">
                  MONTHLY
                </button>
              </div>
            </div>
            {/* Visualizer for invoices volume */}
            <div className="h-64 w-full flex items-end justify-between gap-3 px-2">
              {invoices && invoices.length > 0 ? (
                // Group invoice values by last 5 invoices
                invoices.slice(0, 7).reverse().map((inv, idx) => {
                  const maxVal = Math.max(...invoices.map(i => i.totalAmount), 1);
                  const heightPercent = Math.max(Math.round((inv.totalAmount / maxVal) * 100), 10);
                  return (
                    <div key={inv._id} className="group flex flex-col items-center gap-2 flex-1">
                      <div 
                        className={`w-full bg-primary/20 rounded-t-lg group-hover:bg-primary transition-all duration-300 relative cursor-pointer`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${inv.invoiceNumber}: ${formatAmount(inv.totalAmount)}`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity z-20 font-bold whitespace-nowrap">
                          {formatAmount(inv.totalAmount)}
                        </div>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-bold truncate max-w-full">
                        {inv.invoiceNumber}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40 text-sm">
                  Create invoices to view data
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="xl:col-span-2 glass-panel p-8 rounded-3xl flex flex-col gap-6">
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Recent Activity</h3>
            <div className="flex flex-col gap-6">
              {invoices && invoices.length > 0 ? (
                invoices.slice(0, 3).map((inv) => {
                  const statusColors = {
                    paid: 'border-green-500 text-green-400',
                    sent: 'border-primary text-primary',
                    draft: 'border-outline-variant text-on-surface-variant',
                  };
                  return (
                    <div key={inv._id} className={`flex gap-4 items-start border-l-2 pl-4 py-1 ${statusColors[inv.status]}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface">Invoice {inv.invoiceNumber}</span>
                        <span className="text-xs text-on-surface-variant">
                          {inv.clientName} • {new Date(inv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="ml-auto font-label-md text-sm font-mono font-bold">
                        {formatAmount(inv.totalAmount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-on-surface-variant/40 text-sm py-4">No recent activity</div>
              )}
            </div>
            <Link
              to="/history"
              className="mt-4 text-on-surface-variant font-label-md hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold"
            >
              View All Invoices
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Invoices Table Section */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Recent Invoices</h3>
            <Link
              to="/invoices/new"
              className="text-xs bg-primary-container text-on-primary-container px-3 py-1.5 rounded-lg border border-outline-variant hover:opacity-95 text-primary font-bold"
            >
              + Create
            </Link>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high/40 text-on-surface-variant uppercase text-xs">
                  <th className="px-8 py-4 font-bold">Client</th>
                  <th className="px-8 py-4 font-bold">Invoice #</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                  <th className="px-8 py-4 font-bold">Issue Date</th>
                  <th className="px-8 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recentInvoices.map((inv) => {
                  const badgeStyles = {
                    paid: 'bg-green-500/10 text-green-400 border border-green-500/20',
                    sent: 'bg-primary/10 text-primary border border-primary/20',
                    draft: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/20',
                  };
                  return (
                    <tr
                      key={inv._id}
                      onClick={() => navigate(`/invoices/${inv._id}`)}
                      className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-xs font-bold shadow-sm">
                            {getInitials(inv.clientName)}
                          </div>
                          <span className="text-sm font-bold text-on-surface">{inv.clientName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs text-on-surface-variant">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeStyles[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-on-surface-variant">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-sm text-primary">
                        {formatAmount(inv.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
                {(!invoices || invoices.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-on-surface-variant/40 text-sm">
                      No invoices found. Get started by creating your first invoice!
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

export default Dashboard;
