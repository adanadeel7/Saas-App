import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import dbFallback from '../utils/dbFallback.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret123');

      // Get user from database or fallback mock database
      let user = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        const mockUser = dbFallback.findUserById(decoded.id);
        if (mockUser) {
          const { password, ...userWithoutPassword } = mockUser;
          user = { ...userWithoutPassword, _id: mockUser._id };
        }
      }

      if (!user) {
        res.status(401);
        return res.json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      return res.json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401);
    return res.json({ message: 'Not authorized, no token provided' });
  }
};

export { protect };
