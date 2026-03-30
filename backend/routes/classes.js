// ─── routes/classes.js ──────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const GymClass = require('../models/GymClass');
const { protect, restrictTo } = require('../middleware/auth');

// GET all active classes (public)
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    const classes = await GymClass.find(query).sort({ name: 1 });
    res.json({ classes });
  } catch (error) { next(error); }
});

// GET single class
router.get('/:id', async (req, res, next) => {
  try {
    const gymClass = await GymClass.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ error: 'Class not found.' });
    res.json({ gymClass });
  } catch (error) { next(error); }
});

// POST create class (admin)
router.post('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const gymClass = await GymClass.create(req.body);
    res.status(201).json({ message: 'Class created.', gymClass });
  } catch (error) { next(error); }
});

// PUT update class (admin)
router.put('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const gymClass = await GymClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!gymClass) return res.status(404).json({ error: 'Class not found.' });
    res.json({ message: 'Class updated.', gymClass });
  } catch (error) { next(error); }
});

// DELETE class (admin - soft delete)
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    await GymClass.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Class deactivated.' });
  } catch (error) { next(error); }
});

module.exports = router;
