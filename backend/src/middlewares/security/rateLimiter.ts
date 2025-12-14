import type { Request, Response, NextFunction } from 'express';
import {
  getKeyWithTTL,
  setKey,
  incrKey,
} from '@/services/redis/redis.service.js';
import { config } from '@/config/index.js';
import { getClientIp } from '@/utils/ext.js';
import { TooManyRequestsError } from '@/utils/CustomError.js';
import { logger } from '@/services/logging/logger.js';

const rateLimitConfig = config.rateLimit;

type RateLimitType = keyof typeof rateLimitConfig;

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  bypass: boolean;
  failClosed: boolean;
  redisPrefix: string;
  message?: string;
  skipSuccessfulRequests?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

interface RateLimitInfo {
  current: number;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Normalize request path to prevent bypass attempts
 */
const normalizePath = (path: string): string => {
  return path
    .toLowerCase()
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
    .replace(/[^a-z0-9/_-]/g, '_'); // Replace special chars with underscore
};

/**
 * Generate rate limit key
 */
const getRateLimitKey = (
  prefix: string,
  type: string,
  identifier: string,
  path: string
): string => {
  const normalizedPath = normalizePath(path);
  return `${prefix}:${type}:${identifier}:${normalizedPath}`;
};

/**
 * Set rate limit headers on response
 */
const setRateLimitHeaders = (
  res: Response,
  info: RateLimitInfo,
  standardHeaders: boolean = true
): void => {
  if (standardHeaders) {
    res.setHeader('X-RateLimit-Limit', info.limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, info.remaining));
    res.setHeader('X-RateLimit-Reset', info.resetTime);

    if (info.remaining <= 0) {
      const retryAfter = Math.ceil((info.resetTime - Date.now()) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfter));
    }
  }
};

/**
 * Get current rate limit status
 */
const getRateLimitStatus = async (
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitInfo> => {
  const { value, ttl } = await getKeyWithTTL(key);
  const current = value ? parseInt(value, 10) : 0;
  const remaining = Math.max(0, limit - current);

  // Calculate reset time
  let resetTime: number;
  if (ttl > 0) {
    resetTime = Date.now() + ttl * 1000;
  } else {
    resetTime = Date.now() + windowMs;
  }

  return {
    current,
    limit,
    remaining,
    resetTime,
  };
};

/**
 * Handle rate limiting for routes that skip successful requests
 */
const handleSkipSuccessfulRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
  key: string,
  limit: number,
  windowMs: number,
  message: string
): Promise<void> => {
  const ttlSeconds = Math.floor(windowMs / 1000);

  // Check current status
  const status = await getRateLimitStatus(key, limit, windowMs);

  // Set headers
  setRateLimitHeaders(res, status);

  // Already rate limited
  if (status.current >= limit) {
    return next(
      new TooManyRequestsError(message, {
        limit,
        retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000),
      })
    );
  }

  // Intercept response to increment only on failures
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let hasIncremented = false;

  const incrementOnError = async () => {
    if (hasIncremented || res.statusCode < 400) {
      return;
    }

    hasIncremented = true;

    try {
      await incrKey(key, ttlSeconds);
      logger.debug('Rate limit incremented for failed request', {
        key,
        statusCode: res.statusCode,
        path: req.path,
      });
    } catch (err) {
      logger.error('Failed to increment rate limit', {
        key,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  // Override json method
  res.json = function (body?: any): Response {
    incrementOnError().catch(err => {
      logger.error('Error in json interceptor', { error: err });
    });
    return originalJson(body);
  };

  // Override send method (for non-JSON responses)
  res.send = function (body?: any): Response {
    incrementOnError().catch(err => {
      logger.error('Error in send interceptor', { error: err });
    });
    return originalSend(body);
  };

  return next();
};

/**
 * Handle standard rate limiting
 */
const handleStandardRateLimit = async (
  _req: Request,
  res: Response,
  next: NextFunction,
  key: string,
  limit: number,
  windowMs: number,
  message: string,
  standardHeaders: boolean
): Promise<void> => {
  const ttlSeconds = Math.floor(windowMs / 1000);

  // Get current status
  const status = await getRateLimitStatus(key, limit, windowMs);

  // First request in window
  if (status.current === 0) {
    await setKey(key, '1', ttlSeconds);
    setRateLimitHeaders(
      res,
      {
        current: 1,
        limit,
        remaining: limit - 1,
        resetTime: Date.now() + windowMs,
      },
      standardHeaders
    );
    return next();
  }

  // Limit exceeded
  if (status.current >= limit) {
    setRateLimitHeaders(res, status, standardHeaders);
    return next(
      new TooManyRequestsError(message, {
        limit,
        retryAfter: Math.ceil((status.resetTime - Date.now()) / 1000),
      })
    );
  }

  // Increment and continue
  const newCount = await incrKey(key, ttlSeconds);

  setRateLimitHeaders(
    res,
    {
      current: newCount,
      limit,
      remaining: limit - newCount,
      resetTime: status.resetTime,
    },
    standardHeaders
  );

  return next();
};

/**
 * Rate limiter middleware factory
 */
export const rateLimiter = (type: RateLimitType = 'global') => {
  const config = rateLimitConfig[type] as RateLimitConfig;
  const {
    max: limit,
    windowMs,
    bypass,
    failClosed,
    skipSuccessfulRequests = false,
    message = 'Too many requests',
    standardHeaders = true,
  } = config;

  const redisPrefix = config.redisPrefix || 'rl';

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Bypass if configured
    if (bypass) {
      return next();
    }

    try {
      // Get identifier with fallback chain
      const identifier = getClientIp(req) || req.ip || 'unknown';

      // Fail closed if identifier cannot be determined
      if (identifier === 'unknown' && failClosed) {
        logger.warn('Cannot determine client identifier', {
          type,
          path: req.path,
          headers: req.headers,
        });
        return next(new Error('Cannot determine client identifier'));
      }

      // Generate rate limit key
      const key = getRateLimitKey(redisPrefix, type, identifier, req.path);

      // Handle different rate limiting strategies
      if (skipSuccessfulRequests) {
        return await handleSkipSuccessfulRequests(
          req,
          res,
          next,
          key,
          limit,
          windowMs,
          message
        );
      } else {
        return await handleStandardRateLimit(
          req,
          res,
          next,
          key,
          limit,
          windowMs,
          message,
          standardHeaders
        );
      }
    } catch (err) {
      logger.error('Rate limiter error', {
        type,
        path: req.path,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });

      // Fail open or closed based on configuration
      if (failClosed) {
        return next(
          new TooManyRequestsError('Rate limit check failed', {
            limit,
            retryAfter: Math.floor(windowMs / 1000),
          })
        );
      }

      // Fail open - allow request to proceed
      return next();
    }
  };
};
