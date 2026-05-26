import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from '../features/auth/authSlice';
import API from '../services/api';
import toast from 'react-hot-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const plan = searchParams.get('plan') || 'pro';
  const sessionId = searchParams.get('session_id') || '';
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyAndLoad = async () => {
      try {
        // Call backend to verify and force upgrade subscription locally if needed
        await API.post('/payments/verify-checkout', { planId: plan, sessionId });
      } catch (err) {
        console.error('Checkout verification failed:', err);
      } finally {
        setVerifying(false);
        // Refresh user profile state to reflect upgraded plan in store/localStorage
        dispatch(getMe());
        toast.success(`Welcome to the ${plan.toUpperCase()} tier!`);
      }
    };

    verifyAndLoad();
  }, [dispatch, plan, sessionId]);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-margin-mobile relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center opacity-30">
        <div className="w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[500px] bg-surface border border-outline-variant rounded-xl p-10 shadow-2xl text-center flex flex-col items-center gap-8 glass-panel animate-fade-in">
        {/* Animated Success Badge */}
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 shadow-md">
          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
            check_circle
          </span>
        </div>

        <div>
          <h1 className="font-display-lg text-3xl font-extrabold text-on-surface mb-2">
            {verifying ? 'Verifying payment...' : 'Upgrade Complete!'}
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-sm">
            {verifying 
              ? 'Please wait while we confirm your subscription details.' 
              : `Thank you for upgrading! Your subscription is now active, and you have unlocked all features of the ${plan} tier.`}
          </p>
        </div>

        <div className="w-full border-y border-outline-variant/30 py-6 my-2 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Tier Activated</span>
            <span className="font-bold text-primary capitalize">{plan} Plan</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Status</span>
            <span className="font-bold text-green-400">Active</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Invoicing limit</span>
            <span className="font-bold text-on-surface">Unlimited</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            to="/dashboard"
            className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 duration-200 text-center text-sm"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/invoices/new"
            className="flex-1 border border-outline-variant text-on-surface py-3 rounded-xl font-bold hover:bg-surface-container transition-all active:scale-95 duration-200 text-center text-sm"
          >
            Create an Invoice
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CheckoutSuccess;
