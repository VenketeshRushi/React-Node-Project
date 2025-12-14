import type { Request, Response, NextFunction } from 'express';
import {
  getCache,
  setCache,
  deleteCache,
} from '@/services/cache/cache.service.js';
import { logger } from '@/services/logging/logger.js';
import { buildCacheKey } from '@/services/cache/cache.helpers.js';

interface CacheOptions {
  prefix: string;
  ttl?: number; // Time to live in seconds
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
    if (req.method !== 'GET') return next();
    if (skipCache?.(req)) return next();

    const cacheKey = keyBuilder ? keyBuilder(req) : req.originalUrl;

    try {
      const cachedData = await getCache<CachedResponse>(prefix, cacheKey);

      if (cachedData) {
        logger.info(`[Cache] HIT: ${prefix}:${cacheKey}`);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', buildCacheKey(prefix, cacheKey));
        res.status(cachedData.statusCode || 200).json(cachedData.body);
        return;
      }

      // Cache miss
      logger.info(`[Cache] MISS: ${prefix}:${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');

      // Intercept response
      const originalJson = res.json.bind(res);
      let intercepted = false;

      res.json = (body: any): Response => {
        if (!intercepted && res.statusCode >= 200 && res.statusCode < 300) {
          intercepted = true;
          const dataToCache: CachedResponse = {
            body,
            statusCode: res.statusCode,
            timestamp: Date.now(),
          };

          setCache(prefix, cacheKey, dataToCache, ttl).catch(err => {
            logger.error(`[Cache] Failed to cache response:`, err);
          });
        }

        originalJson(body);
        return res; // optional for chaining
      };

      return next();
    } catch (error) {
      logger.error('[Cache] Middleware error:', error);
      return next();
    }
  };
}

/**
 * Invalidate cache on mutations (POST/PUT/PATCH/DELETE)
 */
export function invalidateCache(
  prefix: string,
  keyBuilder?: (req: Request) => string
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    let intercepted = false;

    res.json = (body: any): Response => {
      if (!intercepted && res.statusCode >= 200 && res.statusCode < 300) {
        intercepted = true;

        const cacheKey = keyBuilder ? keyBuilder(req) : req.originalUrl;
        deleteCache(prefix, cacheKey).catch(err => {
          logger.error(`[Cache] Failed to invalidate cache:`, err);
        });
      }

      originalJson(body);
      return res;
    };

    next();
  };
}

/**
 * Invalidate multiple cache keys at once
 */
export function invalidateMultipleCache(
  prefix: string,
  keyBuilders: ((req: Request) => string)[]
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    let intercepted = false;

    res.json = (body: any): Response => {
      if (!intercepted && res.statusCode >= 200 && res.statusCode < 300) {
        intercepted = true;

        Promise.all(
          keyBuilders.map(builder => deleteCache(prefix, builder(req)))
        ).catch(err => {
          logger.error(`[Cache] Failed to invalidate multiple keys:`, err);
        });
      }

      originalJson(body);
      return res;
    };

    next();
  };
}
