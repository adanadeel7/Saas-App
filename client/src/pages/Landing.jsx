import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Landing = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-background text-on-background font-body-md animate-fade-in">
      {/* Hero Section */}
      <header className="relative hero-mesh pt-16 pb-20 overflow-hidden">
        <div className="max-w-container-max-width mx-auto px-margin-desktop grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 bg-secondary-container/30 border border-outline-variant px-3 py-1 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary uppercase">v2.0 Now Live</span>
            </div>
            <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface mb-6 leading-tight font-extrabold">
              Invoices that get you paid. <span className="text-primary block sm:inline">In seconds.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
              The minimalistic invoicing tool designed for the modern freelancer. Streamline your billing workflow and focus on what matters.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/invoices/new"
                  className="bg-[#3B82F6] text-white px-8 py-4 rounded-xl font-body-md font-bold hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 active:scale-95 duration-200"
                >
                  Create Invoice
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-[#3B82F6] text-white px-8 py-4 rounded-xl font-body-md font-bold hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 active:scale-95 duration-200"
                >
                  Generate Free Invoice
                </Link>
              )}
              <Link
                to="/pricing"
                className="border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-body-md font-bold hover:bg-surface-container transition-all active:scale-95 duration-200"
              >
                View Plans
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-on-surface-variant">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] font-bold">JS</div>
                <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] font-bold">MK</div>
                <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] font-bold">AL</div>
              </div>
              <span className="font-label-sm text-label-sm">Trusted by 5,000+ top-tier freelancers</span>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50"></div>
            <div className="obsidian-glass glass-panel rounded-2xl p-6 relative z-10">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-6">
                <div className="font-headline-md text-headline-md text-primary font-bold">Invoice #EQ-204</div>
                <div className="text-on-surface-variant font-label-md text-label-md">DUE IN 3 DAYS</div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="h-4 bg-surface-container rounded-full w-3/4"></div>
                <div className="h-4 bg-surface-container rounded-full w-1/2"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant mb-1">AMOUNT DUE</p>
                  <p className="font-label-md text-2xl font-bold font-mono text-primary">$4,250.00</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant mb-1">STATUS</p>
                  <span className="bg-primary/15 text-primary px-3 py-1 rounded text-label-sm uppercase font-bold inline-block mt-1">Pending</span>
                </div>
              </div>
              <div className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] cursor-pointer rounded-lg flex items-center justify-center font-bold text-white transition-all active:scale-95">
                Pay Invoice
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Social Proof Section */}
      <section className="py-16 bg-surface-container-lowest border-y border-outline-variant/10">
        <div className="max-w-container-max-width mx-auto px-margin-desktop">
          <p className="text-center font-label-md text-label-md text-on-surface-variant mb-10 uppercase tracking-widest">Powering global independent creators</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 font-bold text-headline-md text-xl">
              <span className="material-symbols-outlined text-primary">api</span> FORGE
            </div>
            <div className="flex items-center gap-2 font-bold text-headline-md text-xl">
              <span className="material-symbols-outlined text-primary">rocket_launch</span> VELOCITY
            </div>
            <div className="flex items-center gap-2 font-bold text-headline-md text-xl">
              <span className="material-symbols-outlined text-primary">layers</span> PRISM
            </div>
            <div className="flex items-center gap-2 font-bold text-headline-md text-xl">
              <span className="material-symbols-outlined text-primary">terminal</span> NEXUS
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <div id="features"></div>
      <section className="py-32">
        <div className="max-w-container-max-width mx-auto px-margin-desktop">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-4">Engineered for Efficiency</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Built by freelancers, for freelancers. We stripped away the bloat to focus on what actually gets you paid.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {/* Feature 1: Fast Creation */}
            <div className="md:col-span-8 group obsidian-glass glass-panel rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden transition-all hover:border-primary/50">
              <div className="absolute top-8 right-8">
                <span className="material-symbols-outlined text-primary text-5xl opacity-20 group-hover:opacity-100 transition-opacity">bolt</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Fast Creation</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Generate professional invoices in under 60 seconds with our streamlined UI and automated templates.</p>
              </div>
            </div>
            {/* Feature 2: Secure Payments */}
            <div className="md:col-span-4 obsidian-glass glass-panel rounded-2xl p-8 flex flex-col transition-all hover:border-primary/50 bg-gradient-to-br from-surface-container-high to-surface">
              <div className="mb-auto">
                <span className="material-symbols-outlined text-primary text-4xl mb-4">verified_user</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Secure Payments</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Bank-level encryption for all transactions. We support Stripe, PayPal, and Direct Bank Transfer.</p>
            </div>
            {/* Feature 3: Auto-Reminders */}
            <div className="md:col-span-4 obsidian-glass glass-panel rounded-2xl p-8 flex flex-col transition-all hover:border-primary/50">
              <div className="mb-auto">
                <span className="material-symbols-outlined text-primary text-4xl mb-4">notifications_active</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Auto-Reminders</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Let Equinox handle the awkward follow-ups. Automated emails sent precisely when payments are late.</p>
            </div>
            {/* Feature 4: Financial Analytics */}
            <div className="md:col-span-8 obsidian-glass glass-panel rounded-2xl p-8 flex items-center justify-between transition-all hover:border-primary/50 group">
              <div className="max-w-xs">
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Real-time Stats</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Visual health tracking of your freelance business. Know your monthly recurring revenue at a glance.</p>
              </div>
              <div className="hidden sm:flex gap-2 items-end h-32">
                <div className="w-8 bg-surface-container rounded-t-lg group-hover:bg-primary transition-all duration-500 h-[40%]"></div>
                <div className="w-8 bg-surface-container rounded-t-lg group-hover:bg-primary transition-all duration-700 h-[65%]"></div>
                <div className="w-8 bg-surface-container rounded-t-lg group-hover:bg-primary transition-all duration-300 h-[45%]"></div>
                <div className="w-8 bg-surface-container rounded-t-lg group-hover:bg-primary transition-all duration-1000 h-[85%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden bg-primary/5 border-y border-outline-variant/10">
        <div className="max-w-container-max-width mx-auto px-margin-desktop text-center relative z-10">
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-6">Ready to stop chasing payments?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Join thousands of freelancers who have upgraded their professionalism with Equinox.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            {user ? (
              <Link to="/dashboard" className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold active:scale-95 duration-200">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold active:scale-95 duration-200">
                Get Started Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
