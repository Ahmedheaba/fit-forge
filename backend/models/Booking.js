/**
 * Booking Model
 * Individual session bookings
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gymClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymClass',
    default: null,
  },
  // Booking details (flattened for quick access)
  className: {
    type: String,
    required: true,
  },
  classCategory: {
    type: String,
    required: true,
  },
  trainerName: {
    type: String,
    default: 'Open Gym',
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  duration: {
    type: Number, // minutes
    required: true,
  },
  room: {
    type: String,
    default: 'Main Floor',
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed',
  },
  confirmationCode: {
    type: String,
    unique: true,
  },
  notes: {
    type: String,
    default: '',
    maxlength: 500,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// ─── Compound index to prevent double booking ─────────────────────────────────
bookingSchema.index(
  { user: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelled'] } } }
);

// ─── Index for class capacity checks ─────────────────────────────────────────
bookingSchema.index({ gymClass: 1, date: 1, status: 1 });

// ─── Auto-generate confirmation code ─────────────────────────────────────────
bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'FF-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.confirmationCode = code;
  }
  next();
});

// ─── Static: count active bookings for a class slot ──────────────────────────
bookingSchema.statics.getSlotCount = async function(gymClassId, date, startTime) {
  return this.countDocuments({
    gymClass: gymClassId,
    date: date,
    startTime: startTime,
    status: { $in: ['confirmed'] },
  });
};

module.exports = mongoose.model('Booking', bookingSchema);
