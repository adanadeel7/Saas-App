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

// @desc    Update user plan
// @route   PUT /api/admin/users/:id/plan
// @access  Private/Admin
const updateUserPlan = async (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;

  if (!['free', 'pro', 'business'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan value. Must be free, pro, or business.' });
  }

  try {
    let updatedUser = null;

    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(id, { plan }, { new: true }).select('-password');
    } else {
      updatedUser = dbFallback.updateUser(id, { plan });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Admin updateUserPlan error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Delete user from platform
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete yourself from the platform.' });
  }

  try {
    let userDeleted = false;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id);
      if (user) {
        await User.deleteOne({ _id: id });
        userDeleted = true;
      }
    } else {
      userDeleted = dbFallback.deleteUser(id);
    }

    if (!userDeleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User removed from platform successfully' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role value. Must be user or admin.' });
  }

  // Prevent self-role modification
  if (id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot modify your own administrative access.' });
  }

  try {
    let updatedUser = null;

    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    } else {
      updatedUser = dbFallback.updateUser(id, { role });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Admin updateUserRole error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export { getUsers, updateUserPlan, deleteUser, updateUserRole };
