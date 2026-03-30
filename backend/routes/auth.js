// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const validate = (validations) => async (req, res, next) => {
  const { validationResult } = require('express-validator');
  await Promise.all(validations.map(v => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

router.post('/register', validate([
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]), register);

router.post('/login', validate([
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]), login);

router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
