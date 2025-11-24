import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import logger from '../config/logger.js';

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: ZodSchema, type: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
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
      }) as Record<string, unknown>;

      // Replace the original data with validated data
      if (type === 'body') {
        req.body = result.body as typeof req.body;
      } else if (type === 'params') {
        req.params = result.params as typeof req.params;
      } else if (type === 'query') {
        req.query = result.query as typeof req.query;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const errors = error.errors.map(err => ({
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Validation middleware error', { error: errorMessage });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Middleware to validate multiple parts of the request using a full schema
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      const dataToValidate = {
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
      };

      // Validate the entire request
      const result = schema.parse(dataToValidate) as {
        body?: typeof req.body;
        params?: typeof req.params;
        query?: typeof req.query;
      };

      // Replace the original data with validated data
      if (result.body) req.body = result.body;
      if (result.params) req.params = result.params;
      if (result.query) req.query = result.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
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

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Validation middleware error', { error: errorMessage });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};
