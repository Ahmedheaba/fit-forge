const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: function() { return this.type === 'photo'; }
  },
  embedId: {
    type: String, // For YouTube video ID
    required: function() { return this.type === 'video'; }
  },
  thumb: {
    type: String, // Only strictly required for old photos, but we can make it optional for user uploads
  },
  label: {
    type: String,
    required: function() { return this.type === 'photo'; }
  },
  title: {
    type: String,
    required: function() { return this.type === 'video'; }
  },
  category: {
    type: String,
    enum: ['facilities', 'training', 'classes'],
    required: function() { return this.type === 'photo'; }
  },
  description: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
