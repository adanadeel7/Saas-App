import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSettings, reset as authReset } from '../features/auth/authSlice';
import { getSubscription, cancelSubscription, resetSubState } from '../features/subscription/subscriptionSlice';
import Sidebar from '../components/layout/Sidebar';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const currencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'NGN', name: 'Nigerian Naira (₦)' },
  { code: 'BRL', name: 'Brazilian Real (R$)' },
  { code: 'CHF', name: 'Swiss Franc (CHF)' },
];

const Settings = () => {
  const dispatch = useDispatch();
  const { user, isLoading: authLoading, isError: authError, isSuccess: authSuccess, message: authMsg } = useSelector(
    (state) => state.auth
  );
  const { subscription, isLoading: subLoading, isError: subError, message: subMsg } = useSelector(
    (state) => state.subscription
  );
  
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    defaultCurrency: user?.defaultCurrency || 'USD',
    password: '',
  });

  const { name, company, defaultCurrency, password } = formData;

  useEffect(() => {
    dispatch(getSubscription());
  }, [dispatch]);

  useEffect(() => {
    if (authError) {
      toast.error(authMsg || 'Failed to update settings');
      dispatch(authReset());
    }
    if (authSuccess) {
      toast.success('Settings updated successfully!');
      dispatch(authReset());
    }
  }, [authError, authSuccess, authMsg, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    dispatch(updateSettings({ themePreference: selectedTheme }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!name) {
      toast.error('Name is required');
      return;
    }

    const payload = {
      name,
      company,
      defaultCurrency,
    };

    if (password) {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      payload.password = password;
    }

    dispatch(updateSettings(payload));
  };

  const handleCancelSub = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel your active subscription? You will revert to the Free plan at the end of your billing cycle.'
      )
    ) {
      dispatch(cancelSubscription())
        .unwrap()
        .then(() => {
          toast.success('Subscription cancelled successfully');
        })
        .catch((err) => {
          toast.error(err || 'Failed to cancel subscription');
        });
    }
  };

  return (
    <div className="max-w-container-max-width mx-auto px-margin-desktop py-10 flex gap-gutter min-h-screen">
      <Sidebar />

      <section className="flex-grow flex flex-col gap-8 animate-fade-in pb-16">
        <div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface">Settings</h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Manage your account profiles, visual preferences, and subscription tier.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Preferences */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low/30">
              <h2 className="text-base font-bold text-on-surface mb-6 uppercase tracking-wider text-primary">
                Account Settings
              </h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-xs font-bold text-on-surface-variant mb-2" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={onChange}
                      className="w-full bg-surface-dim border border-outline-variant/60 rounded px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-xs font-bold text-on-surface-variant mb-2" htmlFor="company">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={company}
                      onChange={onChange}
                      className="w-full bg-surface-dim border border-outline-variant/60 rounded px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-md text-xs font-bold text-on-surface-variant mb-2" htmlFor="defaultCurrency">
                    Default Invoice Currency
                  </label>
                  <select
                    id="defaultCurrency"
                    name="defaultCurrency"
                    value={defaultCurrency}
                    onChange={onChange}
                    className="w-full bg-surface-dim border border-outline-variant/60 rounded px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-xs font-bold text-on-surface-variant mb-2" htmlFor="password">
                    Change Password (Leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    className="w-full bg-surface-dim border border-outline-variant/60 rounded px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-4"
                >
                  {authLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>

            {/* Visual Preferences */}
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low/30">
              <h2 className="text-base font-bold text-on-surface mb-6 uppercase tracking-wider text-primary">
                Visual Preferences
              </h2>
              <div>
                <label className="block font-label-md text-xs font-bold text-on-surface-variant mb-2">
                  Theme Appearance
                </label>
                <select
                  value={theme}
                  onChange={onThemeChange}
                  className="w-full bg-surface-dim border border-outline-variant/60 rounded px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme</option>
                  <option value="system">Follow System Theme</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscription Management Tiers */}
          <div className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant/30 bg-surface-container-low/30 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-base font-bold text-on-surface mb-6 uppercase tracking-wider text-primary">
                  Billing Plan
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/20">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase font-bold">Current Tier</p>
                      <p className="text-lg font-extrabold capitalize text-white mt-1">{user?.plan} Tier</p>
                    </div>
                    <span className="material-symbols-outlined text-primary text-3xl font-bold">verified</span>
                  </div>

                  {subscription && subscription.stripeSubscriptionId && (
                    <div className="text-xs text-on-surface-variant space-y-2 border-t border-outline-variant/20 pt-4">
                      <div className="flex justify-between">
                        <span>Billing Status:</span>
                        <span className="text-green-400 font-bold capitalize">{subscription.status}</span>
                      </div>
                      {subscription.currentPeriodEnd && (
                        <div className="flex justify-between">
                          <span>Next Billing Date:</span>
                          <span className="text-white font-medium">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Cancel at Period End:</span>
                        <span className="text-white font-medium">{subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant/20">
                {user?.plan === 'free' ? (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-xl font-bold text-sm cursor-pointer active:scale-95 duration-200"
                  >
                    Upgrade Subscription
                  </button>
                ) : (
                  subscription &&
                  !subscription.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancelSub}
                      disabled={subLoading}
                      className="w-full border border-red-500/30 text-red-400 py-3 rounded-xl font-bold text-sm hover:bg-red-500/10 cursor-pointer active:scale-95 duration-200"
                    >
                      {subLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
