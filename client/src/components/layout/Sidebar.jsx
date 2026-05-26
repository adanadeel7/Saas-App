import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { invoices } = useSelector((state) => state.invoices);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Calculate current month's invoices for the plan limit check
  const getInvoiceCountThisMonth = () => {
    if (!invoices) return 0;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return invoices.filter((inv) => new Date(inv.createdAt) >= startOfMonth).length;
  };

  const currentMonthCount = getInvoiceCountThisMonth();
  const limit = 5;
  const percentage = Math.min((currentMonthCount / limit) * 100, 100);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8 h-[calc(100vh-120px)] sticky top-28">
      <div className="flex flex-col gap-1">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/dashboard')
              ? 'bg-secondary-container text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-body-md">Dashboard</span>
        </Link>
        <Link
          to="/invoices/new"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/invoices/new')
              ? 'bg-secondary-container text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
          <span className="font-body-md">Create Invoice</span>
        </Link>
        <Link
          to="/history"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/history')
              ? 'bg-secondary-container text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined" data-icon="history">history</span>
          <span className="font-body-md">History</span>
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/settings')
              ? 'bg-secondary-container text-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="font-body-md">Settings</span>
        </Link>
        {user && (user.role === 'admin' || user.email?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com').toLowerCase()) && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border border-dashed border-primary/20 ${
              isActive('/admin')
                ? 'bg-secondary-container text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:border-primary/40'
            }`}
          >
            <span className="material-symbols-outlined text-primary" data-icon="admin_panel_settings">admin_panel_settings</span>
            <span className="font-body-md text-primary font-bold">Admin Panel</span>
          </Link>
        )}
      </div>

      {user && (() => {
        const isAdmin = user.role === 'admin' || user.email?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
        const displayPlanName = isAdmin ? 'Admin (Unlimited)' : `${user.plan} Account`;
        const isFreePlan = user.plan === 'free' && !isAdmin;

        return (
          <div className="mt-auto glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined" data-icon="bolt">bolt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-body-sm font-bold text-on-surface capitalize">
                {displayPlanName}
              </span>
              {isFreePlan ? (
                <span className="text-label-sm text-on-surface-variant">
                  {currentMonthCount} of 5 free invoices used
                </span>
              ) : (
                <span className="text-label-sm text-on-surface-variant">
                  Unlimited Invoices
                </span>
              )}
            </div>
            {isFreePlan && (
              <div className="flex flex-col gap-2">
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <Link 
                  to="/pricing" 
                  className="text-xs text-primary font-bold hover:underline mt-1 text-center"
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        );
      })()}
    </aside>
  );
};

export default Sidebar;
