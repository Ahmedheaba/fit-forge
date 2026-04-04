const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, restrictTo } = require('../middleware/auth');

const INITIAL_REVIEWS = [
  {
    guestName: "Sarah M.",
    guestRole: "Pro Member · 2 years",
    rating: 5,
    comment: "FitForge completely changed my relationship with fitness. Lost 30 lbs and gained confidence I never thought possible.",
  },
  {
    guestName: "Ahmed K.",
    guestRole: "Elite Member · 1 year",
    rating: 5,
    comment: "The facilities are top-tier and the booking system makes it so easy to plan my week. Best investment I have made.",
  },
  {
    guestName: "Layla R.",
    guestRole: "Personal Training · 8 months",
    rating: 5,
    comment: "My trainer Jake pushed me to limits I did not know I had. I competed in my first powerlifting meet after 6 months.",
  },
  {
    guestName: "Omar S.",
    guestRole: "Pro Member · 3 years",
    rating: 5,
    comment: "Been a member since day one. The community here is unlike anything else — it is a second family.",
  },
  {
    guestName: "Nadia T.",
    guestRole: "Starter Member · 5 months",
    rating: 5,
    comment: "As a complete beginner the staff made me feel welcome from day one. The yoga classes with Sophia are incredible.",
  },
  {
    guestName: "Youssef H.",
    guestRole: "Elite Member · 18 months",
    rating: 5,
    comment: "The 24/7 access as an elite member is a game changer. I work late shifts and can still get my workout in at 2am.",
  }
];

const seedReviews = async () => {
  try {
    const count = await Review.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial reviews...');
      await Review.insertMany(INITIAL_REVIEWS);
      console.log('✅ Reviews seeded successfully.');
    }
  } catch (err) {
    console.error('Failed to seed reviews:', err);
  }
};

seedReviews();

// GET all reviews
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name activePlan')
      .sort({ createdAt: -1 }); // Newest first
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

// POST a new review (Authenticated Users Only)
router.post('/', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Please provide a rating and comment' });
    }

    const review = await Review.create({
      user: req.user._id,
      rating,
      comment
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    next(err);
  }
});

// DELETE a review (Admin Only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
