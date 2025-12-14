import { config } from '@/config/index.js';
import { logger } from '@/services/logging/logger.js';
import cors from 'cors';

const allowedOrigins: string[] = [
  config.app.allowedOrigin,
  config.app.frontendUrl,
].filter(Boolean);
const isProduction = config.app.nodeEnv === 'production';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (
      !isProduction &&
      /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    logger.warn('CORS violation attempt', { origin });
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
  ],
  exposedHeaders: [
    'X-Request-Id',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'Retry-After',
  ], // Add this so frontend can read these headers
  maxAge: 86400, // Cache preflight for 24 hours
});
