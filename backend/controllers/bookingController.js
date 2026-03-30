/**
 * Booking Controller
 * Create, view, cancel bookings
 */

const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');
const User = require('../models/User');
const { sendBookingConfirmation, sendCancellationEmail } = require('../config/email');

/**
 * POST /api/bookings
 * Create a new booking
 */
const createBooking = async (req, res, next) => {
  try {
    const { gymClassId, date, startTime, notes } = req.body;
    const userId = req.user._id;

    // Validate booking date is in the future
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ error: 'Cannot book sessions in the past.' });
    }

    // Max 14 days in advance
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    if (bookingDate > maxDate) {
      return res.status(400).json({ error: 'Cannot book more than 14 days in advance.' });
    }

    // Check user has active subscription
    const user = await User.findById(userId);
    if (!user.hasActiveSubscription()) {
      return res.status(403).json({ error: 'An active membership is required to book sessions.' });
    }

    let gymClass, endTime, duration, className, category, trainerName, room;

    if (gymClassId) {
      // Booking a specific class
      gymClass = await GymClass.findById(gymClassId);
      if (!gymClass || !gymClass.isActive) {
        return res.status(404).json({ error: 'Class not found or no longer available.' });
      }

      // Check capacity
      const currentBookings = await Booking.countDocuments({
        gymClass: gymClassId,
        date: bookingDate,
        startTime,
        status: 'confirmed',
      });

      if (currentBookings >= gymClass.maxCapacity) {
        return res.status(409).json({ error: 'This class is fully booked for the selected time.' });
      }

      // Calculate end time
      const [hours, minutes] = startTime.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + gymClass.duration;
      endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

      duration = gymClass.duration;
      className = gymClass.name;
      category = gymClass.category;
      trainerName = gymClass.trainer.name;
      room = gymClass.room;
    } else {
      // Open gym booking
      className = 'Open Gym';
      category = 'open_gym';
      trainerName = 'Self-directed';
      room = 'Main Floor';
      duration = 60;

      const [hours, minutes] = startTime.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + 60;
      endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    }

    // Check for user double booking at same time
    const existingBooking = await Booking.findOne({
      user: userId,
      date: bookingDate,
      startTime,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'You already have a booking at this time.' });
    }

    // Check monthly booking limit
    if (user.subscription.planId) {
      const Plan = require('../models/Plan');
      const plan = await Plan.findById(user.subscription.planId);
      if (plan?.maxBookingsPerMonth) {
        const startOfMonth = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), 1);
        const endOfMonth = new Date(bookingDate.getFullYear(), bookingDate.getMonth() + 1, 0);
        const monthlyCount = await Booking.countDocuments({
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'cancelled' },
        });
        if (monthlyCount >= plan.maxBookingsPerMonth) {
          return res.status(403).json({
            error: `Your plan allows ${plan.maxBookingsPerMonth} bookings per month. Upgrade to book more.`,
          });
        }
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      gymClass: gymClassId || null,
      className,
      classCategory: category,
      trainerName,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      room,
      notes: notes || '',
    });

    // Send confirmation email (non-blocking)
    if (user.emailNotifications) {
      sendBookingConfirmation(user, booking).catch(err =>
        console.error('Booking email failed:', err)
      );
    }

    res.status(201).json({
      message: 'Booking confirmed! Check your email for details.',
      booking,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You already have a booking at this time.' });
    }
    next(error);
  }
};

/**
 * GET /api/bookings
 * Get current user's bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('gymClass', 'name category');

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 * Get single booking
 */
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Cancel a booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed session.' });
    }

    // Must cancel at least 2 hours before
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
    if (new Date() > twoHoursBefore) {
      return res.status(400).json({
        error: 'Bookings must be cancelled at least 2 hours before the session.',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'User cancelled';
    await booking.save();

    // Send cancellation email
    const user = await User.findById(req.user._id);
    if (user.emailNotifications) {
      sendCancellationEmail(user, booking).catch(err =>
        console.error('Cancellation email failed:', err)
      );
    }

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/availability/:classId
 * Check available slots for a class on a given date
 */
const getAvailability = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }

    const gymClass = await GymClass.findById(classId);
    if (!gymClass) {
      return res.status(404).json({ error: 'Class not found.' });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    // Get scheduled times for this day
    const scheduledTimes = gymClass.schedule.filter(s => s.dayOfWeek === dayOfWeek);

    // Get booking counts for each time slot
    const availability = await Promise.all(
      scheduledTimes.map(async (slot) => {
        const count = await Booking.countDocuments({
          gymClass: classId,
          date: bookingDate,
          startTime: slot.startTime,
          status: 'confirmed',
        });
        return {
          startTime: slot.startTime,
          available: gymClass.maxCapacity - count,
          total: gymClass.maxCapacity,
          isFull: count >= gymClass.maxCapacity,
        };
      })
    );

    res.json({ availability, gymClass });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAvailability,
};
