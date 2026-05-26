import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import dbFallback from '../utils/dbFallback.js';
import { sendVerificationEmail } from '../utils/emailService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, company } = req.body;

  try {
    // Check if user exists (DB or mock fallback)
    let userExists = null;

    if (mongoose.connection.readyState === 1) {
      userExists = await User.findOne({ email });
    } else {
      userExists = dbFallback.findUserByEmail(email);
    }

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate email verification token
    const token = crypto.randomBytes(32).toString('hex');
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const role = email.toLowerCase() === adminEmail ? 'admin' : 'user';

    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.create({
        name,
        email,
        password,
        company: company || '',
        plan: 'free',
        role,
        isVerified: false,
        verificationToken: token,
      });
    } else {
      user = dbFallback.createUser({
        name,
        email,
        password: hashedPassword,
        company: company || '',
        plan: 'free',
        role,
        isVerified: false,
        verificationToken: token,
      });
    }

    if (user) {
      // Send verification email
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
      
      // Async call so it doesn't block response
      sendVerificationEmail(user.email, user.name, verificationUrl).catch(err => {
        console.error('Error in sendVerificationEmail async background task:', err);
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        plan: user.plan,
        role: user.role,
        isVerified: user.isVerified,
        themePreference: user.themePreference || 'system',
        defaultCurrency: user.defaultCurrency || 'USD',
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } else {
      user = dbFallback.findUserByEmail(email);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (user && isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        plan: user.plan,
        role: user.role || 'user',
        isVerified: user.isVerified || false,
        themePreference: user.themePreference,
        defaultCurrency: user.defaultCurrency,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    let user = null;
    const userIdString = req.user._id.toString();

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    } else {
      user = dbFallback.findUserById(userIdString);
    }

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        plan: user.plan,
        role: user.role || 'user',
        isVerified: user.isVerified || false,
        themePreference: user.themePreference,
        defaultCurrency: user.defaultCurrency,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
const updateUserSettings = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    let updatedUser = null;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name || user.name;
        user.company = req.body.company !== undefined ? req.body.company : user.company;
        user.themePreference = req.body.themePreference || user.themePreference;
        user.defaultCurrency = req.body.defaultCurrency || user.defaultCurrency;

        if (req.body.password) {
          user.password = req.body.password;
        }

        updatedUser = await user.save();
      }
    } else {
      const updateData = {
        name: req.body.name,
        company: req.body.company,
        themePreference: req.body.themePreference,
        defaultCurrency: req.body.defaultCurrency,
      };

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(req.body.password, salt);
      }

      // Filter out undefined keys to prevent overriding with undefined
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) delete updateData[key];
      });

      updatedUser = dbFallback.updateUser(userIdString, updateData);
    }

    if (updatedUser) {
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        plan: updatedUser.plan,
        role: updatedUser.role || 'user',
        isVerified: updatedUser.isVerified || false,
        themePreference: updatedUser.themePreference,
        defaultCurrency: updatedUser.defaultCurrency,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  try {
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ verificationToken: token });
      if (user) {
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
      }
    } else {
      const mockUser = dbFallback.findUserByToken(token);
      if (mockUser) {
        user = dbFallback.verifyUser(mockUser._id);
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    res.json({ message: 'Email verified successfully', isVerified: true });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    const token = crypto.randomBytes(32).toString('hex');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
      if (user) {
        if (user.isVerified) {
          return res.status(400).json({ message: 'Email is already verified' });
        }
        user.verificationToken = token;
        await user.save();
      }
    } else {
      const mockUser = dbFallback.findUserById(userIdString);
      if (mockUser) {
        if (mockUser.isVerified) {
          return res.status(400).json({ message: 'Email is already verified' });
        }
        dbFallback.updateUser(userIdString, { verificationToken: token });
        user = dbFallback.findUserById(userIdString);
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send verification email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    
    // Async background task
    sendVerificationEmail(user.email, user.name, verificationUrl).catch(err => {
      console.error('Error in sendVerificationEmail resend background task:', err);
    });

    res.json({ message: 'Verification link sent to your email.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mock Google Login / Registration
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Name and email are required for Google sign-in.' });
  }

  try {
    let user = null;
    const adminEmail = (process.env.ADMIN_EMAIL || 'adanadeel903@gmail.com').toLowerCase();
    const role = email.toLowerCase() === adminEmail ? 'admin' : 'user';

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
      if (!user) {
        // Create user with a random password since they login via Google
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);
        user = await User.create({
          name,
          email,
          password: hashedPassword,
          plan: 'free',
          role,
          isVerified: true, // Auto-verify Google accounts
        });
      }
    } else {
      user = dbFallback.findUserByEmail(email);
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), salt);
        user = dbFallback.createUser({
          name,
          email,
          password: hashedPassword,
          plan: 'free',
          role,
          isVerified: true,
        });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      company: user.company || '',
      plan: user.plan,
      role: user.role || 'user',
      isVerified: user.isVerified || false,
      themePreference: user.themePreference || 'system',
      defaultCurrency: user.defaultCurrency || 'USD',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser, googleLogin, getUserProfile, updateUserSettings, verifyEmail, resendVerification };
