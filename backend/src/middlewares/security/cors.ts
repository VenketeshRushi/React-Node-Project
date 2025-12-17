import { config } from '@/config/index.js';
import { logger } from '@/services/logging/logger.js';
import cors from 'cors';

const allowedOrigins: string[] = [
  config.app.allowedOrigin,
  config.app.frontendUrl,
].filter(Boolean);

const isProduction = config.app.nodeEnv === 'production';

// Regex for local development - only common ports (3000-9999)
const LOCAL_DEV_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1):([3-9]\d{3})$/;

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow localhost with common ports
    if (!isProduction && LOCAL_DEV_REGEX.test(origin)) {
      return callback(null, true);
    }

    // Log CORS violation for monitoring
    logger.warn('CORS violation attempt', {
      origin,
      allowed: allowedOrigins,
      environment: config.app.nodeEnv,
    });

    callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-CSRF-Token',
    'X-Request-Id',
  ],
  exposedHeaders: [
    'X-Request-Id',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
    'X-Cache',
    'X-Cache-Key',
    'Age',
  ],
  maxAge: 86400, // Cache preflight for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
