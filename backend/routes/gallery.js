const express = require('express');
const router = express.Router();
const GalleryItem = require('../models/GalleryItem');
const { protect, restrictTo } = require('../middleware/auth');

// Seed data
const INITIAL_IMAGES = [
  { type: 'photo', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=70', label: 'Main Floor',             category: 'facilities' },
  { type: 'photo', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=70', label: 'Weight Room',            category: 'facilities' },
  { type: 'photo', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70', label: 'Strength Training',      category: 'training' },
  { type: 'photo', url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=70', label: 'CrossFit Box',           category: 'facilities' },
  { type: 'photo', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=70', label: 'Cardio Zone',            category: 'facilities' },
  { type: 'photo', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=70', label: 'Yoga Class',             category: 'classes' },
  { type: 'photo', url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', thumb: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=70', label: 'Dumbbell Area',          category: 'training' }
];

const INITIAL_VIDEOS = [
  { type: 'video', embedId: 'gey73xiS79A', title: 'FitForge Gym Tour', description: 'Take a full tour of our world-class facilities.' },
  { type: 'video', embedId: 'IODxDxX7oi4', title: 'Member Transformation Stories', description: 'Real results from real FitForge members.' }
];

// Seed function wrapper
const seedGallery = async () => {
  try {
    const count = await GalleryItem.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding gallery items...');
      await GalleryItem.insertMany([...INITIAL_IMAGES, ...INITIAL_VIDEOS]);
      console.log('✅ Gallery items seeded successfully.');
    }
  } catch (err) {
    console.error('Failed to seed gallery:', err);
  }
};

seedGallery();

// GET all items
router.get('/', async (req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json({ gallery: items });
  } catch (err) {
    next(err);
  }
});

// POST create an item (Admin only)
router.post('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const item = await GalleryItem.create(req.body);
    res.status(201).json({ message: 'Gallery item added.', item });
  } catch (err) {
    next(err);
  }
});

// DELETE an item (Admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found.' });
    res.json({ message: 'Gallery item deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
