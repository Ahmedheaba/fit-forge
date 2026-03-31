/**
 * Admin Controller
 * Dashboard analytics and admin-only management
 */

const User = require('../models/User');
const Booking = require('../models/Booking');
const Plan = require('../models/Plan');
const GymClass = require('../models/GymClass');
const { sendAccountActivationEmail, sendAccountDeactivationEmail } = require('../config/email');

/**
 * GET /api/admin/dashboard
 * Overview analytics
 */
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for performance
    const [
      totalUsers,
      newUsersThisMonth,
      totalBookings,
      bookingsThisMonth,
      activeSubscriptions,
      totalPlans,
      recentBookings,
      popularClasses,
      revenueData,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: startOfMonth } }),
      Booking.countDocuments({ status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
      User.countDocuments({ 'subscription.status': 'active', 'subscription.endDate': { $gt: now } }),
      Plan.countDocuments({ isActive: true }),
      Booking.find({ status: { $ne: 'cancelled' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email avatar'),
      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$className', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Monthly revenue from subscriptions
      User.aggregate([
        { $match: { 'subscription.status': 'active', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$subscription.amount' } } },
      ]),
    ]);

    // Monthly bookings trend (last 6 months)
    const monthlyTrend = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyRevenue = revenueData[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        newUsersThisMonth,
        totalBookings,
        bookingsThisMonth,
        activeSubscriptions,
        totalPlans,
        monthlyRevenue,
      },
      recentBookings,
      popularClasses,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * List all users with pagination and search
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, subscription } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (subscription === 'active') {
      query['subscription.status'] = 'active';
      query['subscription.endDate'] = { $gt: new Date() };
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id
 * Update user (role, status, subscription)
 */
const updateUser = async (req, res, next) => {
  try {
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return res.status(404).json({ error: 'User not found.' });

    const allowedUpdates = ['role', 'isActive', 'subscription'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // Check if isActive status changed and send appropriate email
    if (updates.isActive !== undefined && oldUser.isActive !== updates.isActive) {
      if (updates.isActive === true) {
        sendAccountActivationEmail(user).catch(err => console.error('Activation email failed:', err));
      } else {
        sendAccountDeactivationEmail(user).catch(err => console.error('Deactivation email failed:', err));
      }
    }

    res.json({ message: 'User updated.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/bookings
 * All bookings with filters
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, date, classCategory } = req.query;
    const query = {};

    if (status) query.status = status;
    if (classCategory) query.classCategory = classCategory;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const bookings = await Booking.find(query)
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email avatar');

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/bookings/:id
 * Update booking status
 */
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking updated.', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, updateUser, getAllBookings, updateBooking };
