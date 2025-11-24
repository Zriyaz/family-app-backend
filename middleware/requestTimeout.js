/**
 * Request timeout middleware
 * Prevents hanging requests from consuming server resources
 */
export const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    // Set timeout
    req.setTimeout(timeout, () => {
      if (!res.headersSent) {
        res.status(408).json({ message: 'Request timeout' });
      }
    });

    next();
  };
};

