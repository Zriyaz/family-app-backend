import { Request, Response, NextFunction } from 'express';

/**
 * Request timeout middleware
 * Prevents hanging requests from consuming server resources
 */
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set timeout
    req.setTimeout(timeout, () => {
      if (!res.headersSent) {
        res.status(408).json({ message: 'Request timeout' });
      }
    });

    next();
  };
};
