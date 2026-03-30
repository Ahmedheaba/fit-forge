// ─── routes/users.js ──────────────────────────────────────────────────────────
const express = require('express');
const userRouter = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Update profile
userRouter.patch('/profile', protect, async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'phone', 'dateOfBirth', 'fitnessGoal', 'avatar', 'emailNotifications'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true,
    });
    res.json({ message: 'Profile updated.', user });
  } catch (error) { next(error); }
});

// Change password
userRouter.patch('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.password && !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (error) { next(error); }
});

module.exports = userRouter;
