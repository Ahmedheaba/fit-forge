/**
 * GymClass Model
 * Workout classes and sessions available for booking
 */

const mongoose = require('mongoose');

const gymClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'yoga', 'hiit', 'cycling', 'boxing', 'pilates', 'crossfit', 'open_gym'],
    required: true,
  },
  trainer: {
    name: { type: String, required: true },
    avatar: { type: String, default: null },
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 180,
  },
  maxCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'all_levels',
  },
  room: {
    type: String,
    default: 'Main Floor',
  },
  // Recurring schedule (e.g., every Monday at 7am)
  schedule: [{
    dayOfWeek: {
      type: Number, // 0=Sunday, 1=Monday, ..., 6=Saturday
      min: 0,
      max: 6,
    },
    startTime: {
      type: String, // "07:00", "18:30", etc.
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: '#39FF14',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('GymClass', gymClassSchema);
