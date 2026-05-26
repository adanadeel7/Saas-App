import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../features/subscription/subscriptionSlice';
import toast from 'react-hot-toast';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.subscription);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSelectPlan = (planId) => {
    if (!user) {
      toast.error('Please register or log in first to choose a plan');
      navigate('/register');
      return;
    }

    if (planId === 'free') {
      toast.success('You are currently on the Free plan');
      navigate('/dashboard');
      return;
    }

    dispatch(createCheckoutSession(planId))
      .unwrap()
      .then((res) => {
        if (res.mock) {
          toast.success(`Subscribed to ${planId === 'pro' ? 'Pro' : 'Business'} successfully (MOCK)`);
          // Redirection to success URL is handled in thunk
        }
      })
      .catch((err) => {
        toast.error(err || 'Failed to initialize checkout');
      });
  };

  return (
    <div className="bg-background text-on-background font-body-md animate-fade-in">
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-margin-mobile md:px-margin-desktop text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block font-label-md text-label-md text-primary tracking-widest uppercase mb-4 font-bold">
              Investment Tiers
            </span>
            <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Scale your practice with precision.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
              Choose a plan that matches your freelance velocity. No hidden fees, just pure financial utility.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`font-label-md text-label-md transition-colors ${!isAnnual ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-14 h-7 bg-surface-container-highest rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                id="billing-toggle"
              >
                <div
                  className={`w-5 h-5 bg-primary rounded-full transition-transform duration-300 transform ${
                    isAnnual ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`font-label-md text-label-md transition-colors ${isAnnual ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                Annual <span className="text-tertiary-container ml-1 font-bold">(Save 20%)</span>
              </span>
            </div>
          </div>

          {/* Pricing Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-container-max-width mx-auto">
            {/* Starter Tier */}
            <div className="pricing-card glass-panel flex flex-col p-8 bg-surface-container-low border border-outline-variant rounded-xl text-left">
              <div className="mb-8">
                <h3 className="font-headline-md text-2xl font-bold mb-2">Starter</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">For the newly independent professional.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-display-lg text-4xl font-bold text-on-surface">$0</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-12 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">5 Invoices per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Basic Dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Email Support</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('free')}
                disabled={isLoading}
                className="w-full py-4 border border-outline-variant hover:bg-surface-container-highest transition-colors font-body-md text-body-md rounded-lg font-bold cursor-pointer disabled:opacity-50"
              >
                {user && user.plan === 'free' ? 'Current Plan' : 'Start Free'}
              </button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="pricing-card glass-panel relative flex flex-col p-8 bg-surface-container-high border border-primary/50 rounded-xl text-left overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary px-4 py-1 rounded-bl-lg">
                <span className="font-label-sm text-[10px] text-on-primary font-bold">MOST POPULAR</span>
              </div>
              <div className="mb-8">
                <h3 className="font-headline-md text-2xl font-bold mb-2">Pro</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">The engine for high-performing freelancers.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-display-lg text-4xl font-bold text-on-surface">
                    R{isAnnual ? '144' : '180'}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-12 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Unlimited Invoices</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Custom Branding & PDF</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Automated Reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Line Items & Payments</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('pro')}
                disabled={isLoading}
                className="w-full py-4 bg-primary text-on-primary hover:opacity-90 transition-all font-body-md text-body-md rounded-lg font-bold cursor-pointer disabled:opacity-50 shadow-md"
              >
                {user && user.plan === 'pro' ? 'Current Plan' : 'Elevate to Pro'}
              </button>
            </div>

            {/* Business Tier */}
            <div className="pricing-card glass-panel flex flex-col p-8 bg-surface-container-low border border-outline-variant rounded-xl text-left">
              <div className="mb-8">
                <h3 className="font-headline-md text-2xl font-bold mb-2">Business</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Synergy for studios and partnerships.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="font-display-lg text-4xl font-bold text-on-surface">
                    R{isAnnual ? '360' : '450'}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-12 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Unlimited Invoices</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Custom branding details</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">Priority support priority</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-body-md text-body-md">API Access integrations</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('business')}
                disabled={isLoading}
                className="w-full py-4 border border-outline-variant hover:bg-surface-container-highest transition-colors font-body-md text-body-md rounded-lg font-bold cursor-pointer disabled:opacity-50"
              >
                {user && user.plan === 'business' ? 'Current Plan' : 'Scale with Business'}
              </button>
            </div>
          </div>
        </section>

        {/* Feature Comparison Detail (Bento Style) */}
        <section className="py-20 bg-surface-container-lowest px-margin-mobile md:px-margin-desktop border-t border-outline-variant/10">
          <div className="max-w-container-max-width mx-auto">
            <div className="mb-12">
              <h2 className="font-headline-lg text-2xl font-bold mb-4">Precision Details</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Everything you need to master your cash flow.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 p-8 bg-surface border border-outline-variant rounded-xl flex flex-col justify-between glass-panel">
                <div className="mb-6">
                  <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: '32px' }}>
                    branding_watermark
                  </span>
                  <h4 className="font-headline-md text-xl font-bold mb-2">Custom Branding</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Inject your visual identity into every PDF. Upload logos, set primary colors, and use custom fonts to ensure your invoices look as professional as your work.
                  </p>
                </div>
                <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/30 w-full">
                  <div className="h-2 w-24 bg-primary rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-outline-variant rounded-full"></div>
                </div>
              </div>
              <div className="p-8 bg-surface border border-outline-variant rounded-xl glass-panel">
                <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: '32px' }}>
                  group
                </span>
                <h4 className="font-headline-md text-xl font-bold mb-2">Collaboration</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Invite contractors or partners to manage billing together without compromising security.
                </p>
              </div>
              <div className="p-8 bg-surface border border-outline-variant rounded-xl glass-panel">
                <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: '32px' }}>
                  lock
                </span>
                <h4 className="font-headline-md text-xl font-bold mb-2">Bank Grade</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  AES-256 encryption for all financial data and secure payment gateway integrations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
