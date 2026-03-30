/**
 * User Model
 * Handles both Google OAuth and local users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Never return password in queries
  },
  googleId: {
    type: String,
    sparse: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  phone: {
    type: String,
    trim: true,
    default: null,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  fitnessGoal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', ''],
    default: '',
  },
  // Current active subscription
  subscription: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    planName: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'none'],
      default: 'none',
    },
    amount: { type: Number, default: 0 },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Compare password ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Check if subscription is active ─────────────────────────────────────────
userSchema.methods.hasActiveSubscription = function() {
  return (
    this.subscription.status === 'active' &&
    this.subscription.endDate &&
    new Date(this.subscription.endDate) > new Date()
  );
};

// ─── Virtual: full profile ─────────────────────────────────────────────────────
userSchema.virtual('isSubscribed').get(function() {
  return this.hasActiveSubscription();
});

module.exports = mongoose.model('User', userSchema);
