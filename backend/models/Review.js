const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  guestName: {
    type: String, // Used for legacy/hardcoded seeded reviews
  },
  guestRole: {
    type: String, // Used for legacy/hardcoded seeded reviews
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
