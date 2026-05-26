import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import dbFallback from '../utils/dbFallback.js';

// PayFast configuration
const payfastMerchantId = process.env.PAYFAST_MERCHANT_ID || '10000100'; // Sandbox default
const payfastMerchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0z58xyzipg'; // Sandbox default
const payfastPassphrase = process.env.PAYFAST_PASSPHRASE || '';
const isProduction = process.env.PAYFAST_PRODUCTION === 'true';

const payfastUrl = isProduction
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

const payfastValidateUrl = isProduction
  ? 'https://www.payfast.co.za/eng/query/validate'
  : 'https://sandbox.payfast.co.za/eng/query/validate';

// Helper to generate PayFast signature
const generatePayfastSignature = (params, passphrase = '') => {
  let paramString = '';
  // Sort keys alphabetically
  Object.keys(params).sort().forEach((key) => {
    if (params[key] !== '') {
      paramString += `${key}=${encodeURIComponent(params[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  });
  
  // Remove trailing '&'
  paramString = paramString.slice(0, -1);

  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(paramString).digest('hex');
};

// Plan pricing mapping
const plans = {
  free: { name: 'Free', price: 0 },
  pro: { name: 'Pro', price: 180, nameLabel: 'Equinox Pro Subscription' }, // price in ZAR
  business: { name: 'Business', price: 450, nameLabel: 'Equinox Business Subscription' }, // price in ZAR
};

// @desc    Create PayFast Checkout Session URL
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  const { planId } = req.body;
  const user = req.user;
  const userIdString = user._id.toString();

  if (!['pro', 'business'].includes(planId)) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  const selectedPlan = plans[planId];
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const apiURL = process.env.API_URL || 'http://localhost:5000';

  // --- MOCK MODE IF NO DB ---
  if (mongoose.connection.readyState !== 1) {
    try {
      dbFallback.updateUser(userIdString, { plan: planId });
      dbFallback.updateSubscription(userIdString, {
        plan: planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      });

      return res.json({
        id: 'mock_session_' + Date.now(),
        url: `${clientUrl}/checkout/success?session_id=mock_session_${Date.now()}&plan=${planId}`,
        mock: true,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Mock PayFast checkout failed: ' + err.message });
    }
  }

  // --- REAL PAYFAST REDIRECT GENERATION ---
  try {
    const paymentId = `pay_${Date.now()}_${userIdString.substring(18)}`;

    const payfastParams = {
      merchant_id: payfastMerchantId,
      merchant_key: payfastMerchantKey,
      return_url: `${clientUrl}/checkout/success?plan=${planId}&session_id=${paymentId}`,
      cancel_url: `${clientUrl}/pricing`,
      notify_url: `${apiURL}/api/payments/webhook`, // ITN webhook URL
      name_first: user.name.split(' ')[0] || 'User',
      email_address: user.email,
      m_payment_id: paymentId,
      amount: selectedPlan.price.toFixed(2),
      item_name: selectedPlan.nameLabel,
      
      // PayFast Subscription details
      subscription_type: '1',
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: selectedPlan.price.toFixed(2),
      frequency: '3', // 3 = Monthly
      cycles: '0', // 0 = Infinite
    };

    // Generate MD5 signature
    payfastParams.signature = generatePayfastSignature(payfastParams, payfastPassphrase);

    // Build URL query string
    const queryString = Object.keys(payfastParams)
      .map((key) => `${key}=${encodeURIComponent(payfastParams[key])}`)
      .join('&');

    const redirectUrl = `${payfastUrl}?${queryString}`;

    res.json({ id: paymentId, url: redirectUrl });
  } catch (error) {
    res.status(500).json({ message: 'PayFast session URL generation failed: ' + error.message });
  }
};

// @desc    PayFast ITN Webhook receiver
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const pfData = req.body;

  try {
    // 1. Verify PayFast signature
    const receivedSignature = pfData.signature;
    const tempParams = { ...pfData };
    delete tempParams.signature;

    const computedSignature = generatePayfastSignature(tempParams, payfastPassphrase);

    if (receivedSignature !== computedSignature) {
      console.warn('PayFast Webhook signature mismatch');
      return res.status(400).send('Signature verification failed');
    }

    // 2. Validate with PayFast server
    // Construct check query string
    const checkQueryString = Object.keys(pfData)
      .map((key) => `${key}=${encodeURIComponent(pfData[key])}`)
      .join('&');

    const validationResponse = await fetch(payfastValidateUrl, {
      method: 'POST',
      body: checkQueryString,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const responseText = await validationResponse.text();
    if (responseText.trim() !== 'VALID') {
      console.warn('PayFast Webhook validation check failed');
      return res.status(400).send('Validation check failed');
    }

    // 3. Process Transaction
    const paymentStatus = pfData.payment_status;
    const paymentId = pfData.m_payment_id;
    const token = pfData.custom_str1; // Can be used to store info, or we parse userId from paymentId

    // PayFast subscription info
    const isSubscription = pfData.subscription_id !== undefined;

    if (paymentStatus === 'COMPLETE') {
      // Find User ID. Our Payment ID format is: pay_timestamp_last6UserIdChars
      // If we need a more reliable user match, we can query by custom parameters or parse database.
      // Let's find user by email address! This is extremely reliable!
      const userEmail = pfData.email_address;
      
      const user = await User.findOne({ email: userEmail });
      if (user) {
        // Identify plan from item name
        let plan = 'free';
        if (pfData.item_name.includes('Pro')) plan = 'pro';
        if (pfData.item_name.includes('Business')) plan = 'business';

        user.plan = plan;
        await user.save();

        // Save Subscription
        await Subscription.findOneAndUpdate(
          { user: user._id },
          {
            stripeSubscriptionId: pfData.subscription_id || `pf_${paymentId}`,
            plan: plan,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            cancelAtPeriodEnd: false,
          },
          { upsert: true }
        );
        console.log(`PayFast Webhook: User ${user.email} successfully upgraded to ${plan}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast Webhook error:', error);
    res.status(500).send('Webhook processing error');
  }
};

// @desc    Get current subscription details
// @route   GET /api/payments/subscription
// @access  Private
const getSubscription = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();

    if (mongoose.connection.readyState === 1) {
      const sub = await Subscription.findOne({ user: req.user._id });
      if (!sub) {
        return res.json({ plan: req.user.plan, status: 'inactive' });
      }
      res.json(sub);
    } else {
      const mockSub = dbFallback.findSubscriptionByUser(userIdString);
      if (!mockSub) {
        return res.json({ plan: req.user.plan, status: 'inactive' });
      }
      res.json(mockSub);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel subscription
// @route   POST /api/payments/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  const user = req.user;
  const userIdString = user._id.toString();

  try {
    let sub = null;

    if (mongoose.connection.readyState === 1) {
      sub = await Subscription.findOne({ user: user._id });
    } else {
      sub = dbFallback.findSubscriptionByUser(userIdString);
    }

    if (!sub || sub.status === 'canceled') {
      return res.status(400).json({ message: 'No active subscription found to cancel' });
    }

    // Cancel plan locally
    if (mongoose.connection.readyState === 1) {
      sub.status = 'canceled';
      sub.cancelAtPeriodEnd = true;
      await sub.save();

      user.plan = 'free';
      await user.save();
    } else {
      dbFallback.updateSubscription(userIdString, {
        status: 'canceled',
        cancelAtPeriodEnd: true,
      });
      dbFallback.updateUser(userIdString, { plan: 'free' });
      sub = dbFallback.findSubscriptionByUser(userIdString);
    }

    res.json({ message: 'Subscription canceled successfully', subscription: sub });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify and force upgrade for development/testing if webhook didn't deliver
// @route   POST /api/payments/verify-checkout
// @access  Private
const verifyCheckout = async (req, res) => {
  const { planId, sessionId } = req.body;
  const user = req.user;
  const userIdString = user._id.toString();

  if (!['pro', 'business'].includes(planId)) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findById(req.user._id);
      if (dbUser) {
        dbUser.plan = planId;
        await dbUser.save();

        await Subscription.findOneAndUpdate(
          { user: dbUser._id },
          {
            stripeSubscriptionId: sessionId || `pf_fallback_${Date.now()}`,
            plan: planId,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
          },
          { upsert: true }
        );
      }
    } else {
      dbFallback.updateUser(userIdString, { plan: planId });
      dbFallback.updateSubscription(userIdString, {
        plan: planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      });
    }

    res.json({ success: true, plan: planId });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed: ' + error.message });
  }
};

// @desc    Process debit card checkout (Mock)
// @route   POST /api/payments/checkout-debit
// @access  Private
const checkoutDebit = async (req, res) => {
  const { planId, cardNumber, cardExpiry, cardCvv, cardName } = req.body;
  const user = req.user;
  const userIdString = user._id.toString();

  if (!['pro', 'business'].includes(planId)) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
    return res.status(400).json({ message: 'All card details are required' });
  }

  // Simulate processing delay for realistic payment gateway experience
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const cleanedCardNumber = cardNumber.replace(/\s+/g, '');
    if (cleanedCardNumber.length !== 16) {
      return res.status(400).json({ message: 'Invalid card number. Must be 16 digits.' });
    }
    if (cardCvv.length < 3 || cardCvv.length > 4) {
      return res.status(400).json({ message: 'Invalid CVV. Must be 3 or 4 digits.' });
    }

    const sessionId = `debit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findById(req.user._id);
      if (dbUser) {
        dbUser.plan = planId;
        await dbUser.save();

        await Subscription.findOneAndUpdate(
          { user: dbUser._id },
          {
            stripeSubscriptionId: sessionId,
            plan: planId,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
          },
          { upsert: true }
        );
      }
    } else {
      dbFallback.updateUser(userIdString, { plan: planId });
      dbFallback.updateSubscription(userIdString, {
        plan: planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      });
    }

    res.json({ success: true, plan: planId, sessionId });
  } catch (error) {
    console.error('Checkout debit error:', error);
    res.status(500).json({ message: 'Payment processing failed: ' + error.message });
  }
};

export { createCheckoutSession, handleWebhook, getSubscription, cancelSubscription, verifyCheckout, checkoutDebit };
