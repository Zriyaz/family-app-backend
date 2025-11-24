import morgan from 'morgan';
import logger from '../config/logger.js';

// Create a stream object with a 'write' function that will be used by `morgan`
const stream: morgan.StreamOptions = {
  write: (message: string) => {
    // Use the 'info' log level so the output will be picked up by both transports
    logger.info(message.trim());
  },
};

// Skip logging in test environment
const skip = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

// Build the morgan middleware
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default requestLogger;

