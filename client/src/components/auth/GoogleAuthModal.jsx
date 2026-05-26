import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signInWithGoogle } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const GoogleAuthModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const mockAccounts = [
    { name: 'Adan Adeel', email: 'adanadeel903@gmail.com', desc: 'System Administrator', avatar: 'AA' },
    { name: 'John Doe', email: 'john.doe@example.com', desc: 'Premium Pro Account', avatar: 'JD' },
    { name: 'Jane Smith', email: 'jane.smith@example.com', desc: 'Standard Free Account', avatar: 'JS' },
  ];

  const handleAccountSelect = async (account) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Connecting with Google...');
    try {
      await dispatch(signInWithGoogle({ name: account.name, email: account.email })).unwrap();
      toast.success(`Welcome back, ${account.name}!`, { id: toastId });
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to authenticate with Google', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      toast.error('Please enter both name and email');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Connecting with Google...');
    try {
      await dispatch(signInWithGoogle({ name: customName, email: customEmail })).unwrap();
      toast.success(`Authenticated as ${customName}!`, { id: toastId });
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to authenticate with Google', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-margin-mobile">
      {/* Modal Card */}
      <div className="w-full max-w-[440px] bg-[#0b1326] border border-outline-variant rounded-2xl shadow-2xl overflow-hidden glass-panel relative flex flex-col gap-6 p-8 animate-scale-in">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          {/* Mock Google Logo */}
          <div className="flex items-center gap-1.5 bg-white py-2 px-4 rounded-full shadow-md mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-gray-800 font-bold text-xs uppercase tracking-wider">Sign in with Google</span>
          </div>
          <div>
            <h2 className="font-headline-md text-xl text-on-surface">Choose an account</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">to continue to Equinox Invoicing</p>
          </div>
        </div>

        {/* Account Selector List */}
        {!showCustomForm ? (
          <div className="flex flex-col gap-3">
            {mockAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => handleAccountSelect(account)}
                disabled={isSubmitting}
                className="flex items-center gap-4 w-full text-left p-3.5 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/40 rounded-xl transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                  {account.avatar}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                    {account.name}
                  </div>
                  <div className="text-xs text-on-surface-variant font-mono">{account.email}</div>
                  <span className="text-[9px] uppercase tracking-wider text-primary/70 font-semibold">{account.desc}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-lg">
                  chevron_right
                </span>
              </button>
            ))}

            {/* Custom Account Toggle */}
            <button
              onClick={() => setShowCustomForm(true)}
              disabled={isSubmitting}
              className="flex items-center gap-4 w-full text-left p-3.5 bg-transparent hover:bg-surface-container-low/40 border border-dashed border-outline-variant/60 hover:border-primary/40 rounded-xl transition-all group disabled:opacity-50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <div className="flex-grow">
                <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Use another account
                </div>
                <div className="text-xs text-on-surface-variant">Sign in with a custom profile</div>
              </div>
            </button>
          </div>
        ) : (
          /* Custom User Form */
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Full Name</label>
              <input
                type="text"
                placeholder="Google Username"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 border border-outline-variant hover:bg-surface-container-low transition-colors text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 text-on-surface"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-primary text-on-primary hover:brightness-110 active:scale-95 duration-200 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Connecting...' : 'Authorize'}
              </button>
            </div>
          </form>
        )}

        {/* Footer / Info */}
        <div className="text-[10px] text-on-surface-variant/60 leading-relaxed text-center">
          By continuing, Google will share your name, email address, profile picture, and personal preferences with Equinox Invoicing.
        </div>

        {/* Close trigger */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
