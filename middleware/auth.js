import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      if (!process.env.JWT_SECRET) {
        logger.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'family-app',
        audience: 'family-app-users',
      });

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

