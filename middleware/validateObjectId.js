import mongoose from 'mongoose';
import logger from '../config/logger.js';

/**
 * Middleware to validate MongoDB ObjectId
 * Prevents NoSQL injection and invalid ObjectId errors
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID parameter is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid ObjectId attempted: ${id}`, { ip: req.ip });
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  next();
};

