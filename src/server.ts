import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import requestLogger from './middleware/requestLogger.js';
import { requestTimeout } from './middleware/requestTimeout.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import familyRoutes from './routes/familyRoutes.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder root (go up from backend/src to backend root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Request timeout middleware (30 seconds)
app.use(requestTimeout(30000));

// Request logging middleware (must be before routes)
app.use(requestLogger);

// Trust proxy for accurate IP detection (important for Docker/nginx proxy)
// This must be set before rate limiting middleware
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:80',
  'http://localhost',
  'http://127.0.0.1:80',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    // In production, be strict about origins
    if (process.env.NODE_ENV === 'production') {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow localhost origins
      if (!origin || origin.startsWith('http://localhost') || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Trust proxy for accurate IP detection (important for Docker/nginx proxy)
app.set('trust proxy', 1);

// Rate limiting - General API
// Note: app.set('trust proxy', 1) above ensures correct IP detection behind proxy
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for auth routes - 100 calls per minute
// Note: Behind ALB, all requests appear from same IP, so need higher limits
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 authentication attempts per minute
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Cookie parser middleware (must be before routes)
app.use(cookieParser());

// Body parser middleware with size limits
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: false, limit: '10kb' })); // Limit URL-encoded payload size

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

