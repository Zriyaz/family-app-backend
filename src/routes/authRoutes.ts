import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';
import logger from '../config/logger.js';
import { sanitizeInput } from '../middleware/sanitizeInput.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  validate(registerSchema, 'body'),
  async (req: Request, res: Response): Promise<Response | void> => {
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
        const token = generateToken(user._id.toString());
        
        // Set httpOnly cookie
        // Note: secure should be true only if using HTTPS
        // For HTTP ALB, set secure to false (or use HTTPS with SSL certificate)
        const isSecure = process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true';
        res.cookie('token', token, {
          httpOnly: true,
          secure: isSecure, // Only true if HTTPS is enabled
          sameSite: 'lax', // Works with both HTTP and HTTPS
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });

        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(`Registration error: ${errorMessage}`, { error: errorStack });
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
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { email, password } = req.body;

      // Email is already lowercased and trimmed by Zod
      // Check for user email
      const user = await User.findOne({ email }).select('+password');

      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id.toString());
        
        // Set httpOnly cookie
        // Note: secure should be true only if using HTTPS
        // For HTTP ALB, set secure to false (or use HTTPS with SSL certificate)
        const isSecure = process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true';
        res.cookie('token', token, {
          httpOnly: true,
          secure: isSecure, // Only true if HTTPS is enabled
          sameSite: 'lax', // Works with both HTTP and HTTPS
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(`Login error: ${errorMessage}`, { error: errorStack });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(`Get user error: ${errorMessage}`, { error: errorStack });
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    // Clear httpOnly cookie
    const isSecure = process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isSecure, // Only true if HTTPS is enabled
      sameSite: 'lax', // Works with both HTTP and HTTPS
      path: '/',
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error(`Logout error: ${errorMessage}`, { error: errorStack });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

