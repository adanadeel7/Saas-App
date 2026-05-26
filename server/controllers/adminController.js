import mongoose from 'mongoose';
import User from '../models/User.js';
import dbFallback from '../utils/dbFallback.js';

// @desc    Get all users for admin dashboard
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    let users = [];

    if (mongoose.connection.readyState === 1) {
      users = await User.find({}, '-password').sort({ createdAt: -1 });
    } else {
      users = dbFallback.getAllUsers();
    }

    res.json(users);
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export { getUsers };
