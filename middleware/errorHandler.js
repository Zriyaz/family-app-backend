import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error details (but don't expose to client)
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode,
    ip: req.ip,
  });

  // Don't leak sensitive error information in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode);
  res.json({
    message: isDevelopment ? err.message : 'An error occurred',
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { details: err }),
  });
};

