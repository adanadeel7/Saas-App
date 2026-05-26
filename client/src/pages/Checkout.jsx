import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from '../features/auth/authSlice';
import API from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const planId = searchParams.get('plan') || 'pro';
  const billingCycle = searchParams.get('billing') || 'monthly';

  // Form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billingZip, setBillingZip] = useState('');

  // UI state
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pricing constants matching pricing page
  const prices = {
    pro: { monthly: 12, annual: 9, name: 'Equinox Pro Plan' },
    business: { monthly: 30, annual: 24, name: 'Equinox Business Plan' },
  };

  const currentPlan = prices[planId] || prices.pro;
  const rate = billingCycle === 'annual' ? currentPlan.annual : currentPlan.monthly;
  const total = billingCycle === 'annual' ? rate * 12 : rate;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Card Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Format CVV (max 4 digits)
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardCvv(value);
  };

  // Process checkout submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length !== 16) {
      toast.error('Card number must be exactly 16 digits');
      return;
    }

    if (cardExpiry.length !== 5) {
      toast.error('Expiry date must be in MM/YY format');
      return;
    }

    if (cardCvv.length < 3 || cardCvv.length > 4) {
      toast.error('CVV must be 3 or 4 digits');
      return;
    }

    if (!cardName.trim()) {
      toast.error('Please enter the cardholder name');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Authorizing payment with bank...');

    try {
      const response = await API.post('/payments/checkout-debit', {
        planId,
        cardNumber: cleanCard,
        cardExpiry,
        cardCvv,
        cardName,
      });

      if (response.data && response.data.success) {
        toast.success('Subscription active! Upgrading account...', { id: toastId });
        // Refresh Redux Profile state to trigger user update across all pages
        await dispatch(getMe()).unwrap();
        
        // Timeout to allow redux state sync before redirect
        setTimeout(() => {
          navigate(`/checkout/success?plan=${planId}&session_id=${response.data.sessionId}`);
        }, 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment authentication failed.', { id: toastId });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-body-md antialiased min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center opacity-35">
        <div className="w-[800px] h-[800px] bg-primary-container/10 rounded-full blur-[140px] animate-pulse duration-[6000ms]"></div>
      </div>

      <main className="relative z-10 w-full max-w-[940px] flex flex-col lg:flex-row gap-8 bg-surface-container border border-outline-variant/60 rounded-3xl p-6 md:p-8 shadow-2xl glass-panel animate-scale-in">
        {/* Left Side: Virtual Card & Summary */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-outline-variant/30 pb-8 lg:pb-0 lg:pr-8">
          <div>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer mb-6"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to plans
            </button>

            <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2 font-mono">Secured Checkout</span>
            <h1 className="font-headline-lg text-2xl font-extrabold mb-1">Billing Authorization</h1>
            <p className="text-xs text-on-surface-variant mb-6">Process your subscription with bank security encryption.</p>

            {/* Premium 3D Flippable Virtual Card */}
            <div className="relative w-full max-w-[360px] h-[210px] mx-auto perspective-1000 mb-8 select-none">
              <div className={`relative w-full h-full duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Card Front */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1e293b] via-[#111c2d] to-[#060e20] border border-outline/30 rounded-2xl p-5 flex flex-col justify-between backface-hidden shadow-xl shadow-black/50">
                  <div className="flex justify-between items-start">
                    {/* Chip */}
                    <div className="w-10 h-7 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded shadow-inner opacity-80 relative overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-3 gap-px opacity-30 border border-black/10 p-0.5">
                        <div className="border border-black/10 rounded-sm"></div>
                        <div className="border border-black/10 rounded-sm"></div>
                        <div className="border border-black/10 rounded-sm"></div>
                      </div>
                    </div>
                    {/* Visa Icon */}
                    <span className="font-bold italic text-md text-primary font-mono select-none tracking-wider">EQUINOX</span>
                  </div>

                  {/* Card Number */}
                  <div className="font-mono text-lg md:text-xl tracking-[0.18em] text-on-surface select-all text-center py-2">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="text-[8px] uppercase tracking-wider text-on-surface-variant font-mono">Cardholder</span>
                      <span className="text-xs font-bold font-mono tracking-wide truncate uppercase block h-4">
                        {cardName || 'YOUR FULL NAME'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[8px] uppercase tracking-wider text-on-surface-variant font-mono">Expires</span>
                      <span className="text-xs font-bold font-mono tracking-wide">
                        {cardExpiry || 'MM/YY'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Back */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#111c2d] to-[#060e20] border border-outline/30 rounded-2xl py-5 flex flex-col justify-between rotate-y-180 backface-hidden shadow-xl shadow-black/50">
                  {/* Magnetic Strip */}
                  <div className="w-full h-10 bg-black/80 my-1"></div>

                  <div className="px-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      {/* Signature Area */}
                      <div className="flex-grow h-8 bg-surface-container-highest rounded border border-outline-variant/30 flex items-center justify-end px-3">
                        <span className="font-mono font-bold text-xs italic text-on-surface-variant/40 tracking-wider">Authorized Signature</span>
                      </div>
                      {/* CVV Display */}
                      <div className="w-14 bg-white text-black text-center py-1.5 rounded font-mono font-bold text-sm shadow-sm select-all">
                        {cardCvv || '•••'}
                      </div>
                    </div>

                    <div className="text-[7px] text-on-surface-variant/40 leading-relaxed font-mono">
                      This card is property of Equinox Finance. Use is governed by standard terms of service. If found, please return to any branch office or destroy immediately.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Pricing breakdown summary */}
          <div className="bg-[#131b2e] border border-outline-variant/40 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs shadow-inner">
            <div className="flex justify-between text-on-surface-variant">
              <span>Selected Plan:</span>
              <span className="font-bold text-primary">{currentPlan.name}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Billing Cycle:</span>
              <span className="capitalize">{billingCycle}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Plan Rate:</span>
              <span>${rate.toFixed(2)}/mo</span>
            </div>
            <div className="h-px bg-outline-variant/30 my-1"></div>
            <div className="flex justify-between text-sm">
              <span className="font-bold">Total Due Now:</span>
              <span className="font-extrabold text-primary font-mono text-base">
                ${total.toFixed(2)}
              </span>
            </div>
            {billingCycle === 'annual' && (
              <div className="text-[10px] text-tertiary font-bold tracking-tight text-right uppercase">
                Includes 20% annual discount
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Credit Card input Form */}
        <form onSubmit={handleSubmit} className="w-full lg:w-1/2 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            {/* Cardholder Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider font-mono">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="ADAN ADEEL"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                onFocus={() => setIsFlipped(false)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono placeholder:opacity-30 uppercase"
                required
                disabled={isProcessing}
              />
            </div>

            {/* Card Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider font-mono">
                Card Number
              </label>
              <input
                type="text"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onFocus={() => setIsFlipped(false)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono placeholder:opacity-30"
                required
                disabled={isProcessing}
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider font-mono">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  onFocus={() => setIsFlipped(false)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono placeholder:opacity-30"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider font-mono">
                  CVV / Code
                </label>
                <input
                  type="text"
                  placeholder="3-4 digits"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono placeholder:opacity-30"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Postal Zip */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider font-mono">
                Billing ZIP / Postal Code
              </label>
              <input
                type="text"
                placeholder="10001"
                value={billingZip}
                onChange={(e) => setBillingZip(e.target.value.slice(0, 10))}
                onFocus={() => setIsFlipped(false)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono placeholder:opacity-30"
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl hover:brightness-110 active:scale-98 transition-all flex justify-center items-center gap-2 cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                  <span>Confirm Pay ${total.toFixed(2)}</span>
                </>
              )}
            </button>

            {/* Bank Security Info */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-on-surface-variant/50">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>256-bit SSL encrypted. Payment gateway simulated transaction.</span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
