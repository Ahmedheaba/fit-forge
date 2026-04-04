const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
