/**
 * Plan Model
 * Gym membership plans and pricing
 */

const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  duration: {
    value: { type: Number, required: true }, // e.g., 1, 3, 12
    unit: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      required: true,
    },
  },
  features: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'personal_training'],
    default: 'standard',
  },
  maxBookingsPerMonth: {
    type: Number,
    default: null, // null = unlimited
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: '#39FF14', // neon green accent
  },
  totalSubscribers: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// ─── Auto-generate slug ───────────────────────────────────────────────────────
planSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Plan', planSchema);
