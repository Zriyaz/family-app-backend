import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { sanitizeInput } from '../middleware/sanitizeInput.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  validate(registerSchema, 'body'),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Sanitize inputs (email is already lowercased and trimmed by Zod)
      const sanitizedName = sanitizeInput(name);

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      const user = await User.create({
        name: sanitizedName,
        email, // Already lowercased and trimmed by Zod
        password,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      logger.error(`Registration error: ${error.message}`, { error: error.stack });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  validate(loginSchema, 'body'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Email is already lowercased and trimmed by Zod
      // Check for user email
      const user = await User.findOne({ email }).select('+password');

      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      logger.error(`Login error: ${error.message}`, { error: error.stack });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`, { error: error.stack });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

