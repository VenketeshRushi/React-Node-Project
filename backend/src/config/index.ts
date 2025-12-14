import path from 'path';
import { URL } from 'url';

import type { PoolConfig } from 'pg';
import type { RedisOptions } from 'ioredis';

import {
  getRequiredEnv,
  getRequiredNumberEnv,
  getRequiredBooleanEnv,
} from './env.loader.js';

// --------------------
// App Config
// --------------------
export const appConfig = {
  nodeEnv: getRequiredEnv('NODE_ENV'),
  port: getRequiredNumberEnv('PORT'),
  host: getRequiredEnv('HOST'),
  frontendUrl: getRequiredEnv('FRONTEND_URL'),
  backendUrl: getRequiredEnv('BACKEND_URL'),
  allowedOrigin: getRequiredEnv('ALLOWED_ORIGIN'),
  logLevel: getRequiredEnv('LOG_LEVEL'),
  cookieSecret: getRequiredEnv('COOKIE_SECRET'),
} as const;

// --------------------
// Database Config (Postgres)
// --------------------
export const databaseConfig: PoolConfig = {
  connectionString: getRequiredEnv('DATABASE_URL'),
  min: getRequiredNumberEnv('DB_POOL_MIN'),
  max: getRequiredNumberEnv('DB_POOL_MAX'),
  idleTimeoutMillis: getRequiredNumberEnv('DB_IDLE_TIMEOUT'),
  connectionTimeoutMillis: getRequiredNumberEnv('DB_CONNECTION_TIMEOUT'),
} as const;

// --------------------
// Redis Config
// --------------------
const redisUrl = new URL(getRequiredEnv('REDIS_URL'));

export const redisConfig: RedisOptions = {
  host: redisUrl.hostname,
  port: getRequiredNumberEnv('REDIS_PORT') || Number(redisUrl.port) || 6379,
  password: getRequiredEnv('REDIS_PASSWORD'),
  db:
    getRequiredNumberEnv('REDIS_DB') || Number(redisUrl.pathname.slice(1)) || 0,
  lazyConnect: false,
  keepAlive: getRequiredNumberEnv('REDIS_KEEPALIVE'),
  family: getRequiredNumberEnv('REDIS_FAMILY'),
  commandTimeout: getRequiredNumberEnv('REDIS_COMMAND_TIMEOUT'),
  enableOfflineQueue: getRequiredBooleanEnv('REDIS_ENABLE_OFFLINE_QUEUE'),
  enableReadyCheck: getRequiredBooleanEnv('REDIS_ENABLE_READY_CHECK'),
};

// --------------------
// JWT Config
// --------------------
export const jwtConfig = {
  secret: getRequiredEnv('JWT_SECRET'),
  accessExpiresIn: getRequiredNumberEnv('JWT_ACCESS_EXPIRES_IN'),
  refreshExpiresIn: getRequiredNumberEnv('JWT_REFRESH_EXPIRES_IN'),
  issuer: getRequiredEnv('JWT_ISSUER'),
  audience: getRequiredEnv('JWT_AUDIENCE'),
  algorithm: 'HS256' as const,
} as const;

// --------------------
// OAuth Config
// --------------------
export const oauthConfig = {
  google: {
    clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
    callbackUrl: getRequiredEnv('GOOGLE_REDIRECT_URI'),
    scope: ['profile', 'email', 'openid'],
  },
} as const;

// --------------------
// Email Config
// --------------------
export const emailConfig = {
  smtp: {
    host: getRequiredEnv('SMTP_HOST'),
    port: getRequiredNumberEnv('SMTP_PORT'),
    user: getRequiredEnv('SMTP_USER'),
    pass: getRequiredEnv('SMTP_PASS'),
    service: getRequiredEnv('SMTP_SERVICE'),
    secure: getRequiredNumberEnv('SMTP_PORT') === 465,
  },
  from: {
    email: getRequiredEnv('FROM_EMAIL'),
    name: getRequiredEnv('FROM_NAME'),
  },
} as const;

// --------------------
// SMS Config (Twilio)
// --------------------
export const smsConfig = {
  twilio: {
    accountSid: getRequiredEnv('TWILIO_ACCOUNT_SID'),
    authToken: getRequiredEnv('TWILIO_AUTH_TOKEN'),
    phoneNumber: getRequiredEnv('TWILIO_PHONE_NUMBER'),
  },
} as const;

// --------------------
// Rate Limit Config
// --------------------
export const rateLimitConfig = {
  global: {
    windowMs: getRequiredNumberEnv('RATE_LIMIT_WINDOW_MS'),
    max: getRequiredNumberEnv('RATE_LIMIT_MAX_REQUESTS'),
    bypass: false,
    failClosed: false,
    redisPrefix: 'rl',
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },

  auth: {
    windowMs: 15 * 60 * 1000,
    max: 50,
    bypass: false,
    failClosed: true,
    redisPrefix: 'rl:auth',
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
  },

  api: {
    windowMs: 15 * 60 * 1000,
    max: 300,
    bypass: false,
    failClosed: false,
    redisPrefix: 'rl:api',
    message: 'API rate limit exceeded, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },

  admin: {
    windowMs: 15 * 60 * 1000,
    max: 50,
    bypass: false,
    failClosed: true,
    redisPrefix: 'rl:admin',
    message: 'Admin rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
  },

  health: {
    windowMs: 1 * 60 * 1000,
    max: 3,
    bypass: false,
    failClosed: false,
    redisPrefix: 'rl:health',
    message: 'Health check rate limit exceeded',
    standardHeaders: false,
    legacyHeaders: false,
  },

  upload: {
    windowMs: 60 * 60 * 1000,
    max: 20,
    bypass: false,
    failClosed: true,
    redisPrefix: 'rl:upload',
    message: 'Upload rate limit exceeded, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },

  webhook: {
    windowMs: 1 * 60 * 1000,
    max: 100,
    bypass: false,
    failClosed: false,
    redisPrefix: 'rl:webhook',
    message: 'Webhook rate limit exceeded',
    standardHeaders: false,
    legacyHeaders: false,
  },
} as const;

// --------------------
// Storage Config
// --------------------
export const storageConfig = {
  local: {
    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    maxFileSize: getRequiredNumberEnv('MAX_FILE_SIZE'),
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ] as const,
    allowedExtensions: [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'pdf',
      'doc',
      'docx',
    ] as const,
  },

  folders: {
    images: 'images',
    documents: 'documents',
    videos: 'videos',
    temp: 'temp',
  },
} as const;

// --------------------
// LLM Config
// --------------------
export const llmConfig = {
  openAiApiKey: getRequiredEnv('OPENAI_API_KEY'),
  googleAiApiKey: getRequiredEnv('GOOGLE_API_KEY'),
} as const;

// --------------------
// Unified Export
// --------------------
export const config = {
  app: appConfig,
  database: databaseConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  oauth: oauthConfig,
  email: emailConfig,
  sms: smsConfig,
  rateLimit: rateLimitConfig,
  storage: storageConfig,
  llm: llmConfig,
} as const;

console.log('✓ All environment variables loaded successfully');
