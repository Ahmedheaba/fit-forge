/**
 * Auth Controller
 * Handles registration, login, Google OAuth
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../config/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Generate JWT Token ───────────────────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Format user response ─────────────────────────────────────────────────────
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  fitnessGoal: user.fitnessGoal,
  subscription: user.subscription,
  emailNotifications: user.emailNotifications,
  createdAt: user.createdAt,
});

/**
 * POST /api/auth/register
 * Local email/password registration
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Determine role (first admin email gets admin role)
    const role = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() ? 'admin' : 'customer';

    // Create user
    const user = await User.create({ name, email, password, role });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));

    const token = signToken(user._id);
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Local email/password login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Your account has been deactivated. Contact support.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({
      message: 'Login successful!',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/google
 * Google OAuth - verify ID token from frontend
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists (by googleId or email)
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
      }
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user
      const role = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() ? 'admin' : 'customer';
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role,
      });
      // Send welcome email (non-blocking)
      sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Your account has been deactivated.' });
    }

    const token = signToken(user._id);
    res.json({
      message: 'Google authentication successful!',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Invalid Google token.' });
    }
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

module.exports = { register, login, googleAuth, getMe };
