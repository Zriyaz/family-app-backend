import { ZodError, ZodSchema } from 'zod';
import logger from '../config/logger.js';

/**
 * Middleware to validate request data using Zod schemas
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {string} type - Type of data to validate ('body', 'params', 'query')
 */
export const validate = (schema, type = 'body') => {
  return (req, res, next) => {
    try {
      // Get the data to validate based on type
      const dataToValidate = {
        body: req.body,
        params: req.params,
        query: req.query,
      };

      // Validate the data
      const result = schema.parse({
        [type]: dataToValidate[type],
      });

      // Replace the original data with validated data
      if (type === 'body') {
        req.body = result.body;
      } else if (type === 'params') {
        req.params = result.params;
      } else if (type === 'query') {
        req.query = result.query;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation error', {
          errors,
          path: req.path,
          method: req.method,
        });

        return res.status(400).json({
          message: 'Validation error',
          errors,
        });
      }

      // Unexpected error
      logger.error('Validation middleware error', { error: error.message });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Middleware to validate multiple parts of the request using a full schema
 * @param {ZodSchema} schema - Full schema with body, params, query
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const dataToValidate = {
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
      };

      // Validate the entire request
      const result = schema.parse(dataToValidate);

      // Replace the original data with validated data
      req.body = result.body || req.body;
      req.params = result.params || req.params;
      req.query = result.query || req.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation error', {
          errors,
          path: req.path,
          method: req.method,
        });

        return res.status(400).json({
          message: 'Validation error',
          errors,
        });
      }

      logger.error('Validation middleware error', { error: error.message });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

