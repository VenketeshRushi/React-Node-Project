import type { Request, Response, NextFunction } from 'express';
import {
  getCache,
  setCache,
  deleteCache,
  clearCacheByPrefix,
} from '@/services/cache/cache.service.js';
import { logger } from '@/services/logging/logger.js';
import { buildCacheKey } from '@/services/cache/cache.helpers.js';

interface CacheOptions {
  prefix: string;
  ttl?: number;
  keyBuilder?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
}

interface CachedResponse {
  body: any;
  statusCode: number;
  timestamp: number;
}

/**
 * Cache middleware for GET requests
 */
export function cacheMiddleware(options: CacheOptions) {
  const { prefix, ttl = 60, keyBuilder, skipCache } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if condition met
    if (skipCache?.(req)) {
      return next();
    }

    const cacheKey = keyBuilder ? keyBuilder(req) : req.originalUrl;

    try {
      // Try to get cached response
      const cached = await getCache<CachedResponse>(prefix, cacheKey);

      if (cached) {
        const age = Math.floor((Date.now() - cached.timestamp) / 1000);

        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', buildCacheKey(prefix, cacheKey));
        res.setHeader('Age', age.toString());

        logger.info(`[Cache] HIT: ${prefix}:${cacheKey}`);
        res.status(cached.statusCode).json(cached.body);
        return;
      }

      // Cache miss - store info for later caching
      res.locals.cacheInfo = { prefix, key: cacheKey, ttl };
      res.setHeader('X-Cache', 'MISS');

      logger.info(`[Cache] MISS: ${prefix}:${cacheKey}`);
      next();
    } catch (error) {
      logger.error('[Cache] Error in cacheMiddleware:', error);
      next(); // Continue without cache on error
    }
  };
}

/**
 * Global middleware to cache successful responses
 * Apply this ONCE globally after requestLogger
 */
export function cacheHandler() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any): Response {
      // Cache successful responses
      const cacheInfo = res.locals.cacheInfo;
      if (cacheInfo && res.statusCode >= 200 && res.statusCode < 300) {
        const dataToCache: CachedResponse = {
          body,
          statusCode: res.statusCode,
          timestamp: Date.now(),
        };

        setCache(
          cacheInfo.prefix,
          cacheInfo.key,
          dataToCache,
          cacheInfo.ttl
        ).catch(err => logger.error('[Cache] Failed to store:', err));
      }

      // Invalidate cache on mutations
      const invalidateInfo = res.locals.cacheInvalidate;
      if (invalidateInfo && res.statusCode >= 200 && res.statusCode < 300) {
        handleInvalidation(invalidateInfo).catch(err =>
          logger.error('[Cache] Failed to invalidate:', err)
        );
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Mark cache for invalidation (single key)
 */
export function invalidateCache(
  prefix: string,
  keyBuilder?: (req: Request) => string
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyBuilder ? keyBuilder(req) : req.originalUrl;
    res.locals.cacheInvalidate = { prefix, keys: [key] };
    next();
  };
}

/**
 * Mark multiple keys for invalidation
 */
export function invalidateMultipleCache(
  prefix: string,
  keyBuilders: ((req: Request) => string)[]
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const keys = keyBuilders.map(builder => builder(req));
    res.locals.cacheInvalidate = { prefix, keys };
    next();
  };
}

/**
 * Invalidate entire prefix
 */
export function invalidateCacheByPrefix(prefix: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.locals.cacheInvalidate = { prefix, clearAll: true };
    next();
  };
}

/**
 * Handle cache invalidation
 */
async function handleInvalidation(info: any): Promise<void> {
  try {
    if (info.clearAll) {
      await clearCacheByPrefix(info.prefix);
      logger.info(`[Cache] Invalidated prefix: ${info.prefix}`);
    } else if (info.keys && info.keys.length > 0) {
      await Promise.all(
        info.keys.map((key: string) => deleteCache(info.prefix, key))
      );
      logger.info(`[Cache] Invalidated ${info.keys.length} key(s)`);
    }
  } catch (error) {
    logger.error('[Cache] Invalidation error:', error);
  }
}
