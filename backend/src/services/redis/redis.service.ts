import { Pipeline } from 'ioredis';
import { redisClient } from './redis.client.js';
import { logger } from '@/services/logging/logger.js';

/**
 * Get value by key
 */
export const getKey = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Redis getKey error', { key, error });
    throw new Error(`Redis getKey failed for key: ${key}`);
  }
};

/**
 * Set value with optional TTL (in seconds)
 */
export const setKey = async (
  key: string,
  value: string | number,
  ttl?: number
): Promise<void> => {
  try {
    if (ttl) {
      await redisClient.setex(key, ttl, value.toString());
    } else {
      await redisClient.set(key, value.toString());
    }
  } catch (error) {
    logger.error('Redis setKey error', { key, value, error });
    throw new Error(`Redis setKey failed for key: ${key}`);
  }
};

/**
 * Increment value with TTL using atomic operations
 * Uses pipeline to ensure TTL is always set/refreshed with increment
 */
export const incrKey = async (
  key: string,
  ttl?: number,
  increment: number = 1
): Promise<number> => {
  try {
    if (ttl) {
      // Use pipeline for atomic increment + expire
      const pipeline = redisClient.pipeline();

      if (increment === 1) {
        pipeline.incr(key);
      } else {
        pipeline.incrby(key, increment);
      }

      pipeline.expire(key, ttl);

      const results = await pipeline.exec();

      if (!results || results.length !== 2) {
        throw new Error('Pipeline execution failed');
      }

      // Check for errors in pipeline results
      const [incrResult, expireResult] = results;

      if (!incrResult || !expireResult) {
        throw new Error('Pipeline execution failed: missing results');
      }

      if (incrResult[0]) throw incrResult[0];
      if (expireResult[0]) throw expireResult[0];

      return incrResult[1] as number;
    } else {
      // No TTL needed, simple increment
      if (increment === 1) {
        return await redisClient.incr(key);
      } else {
        return await redisClient.incrby(key, increment);
      }
    }
  } catch (error) {
    logger.error('Redis incrKey error', { key, increment, error });
    throw new Error(`Redis incrKey failed for key: ${key}`);
  }
};

/**
 * Get current count and TTL atomically
 */
export const getKeyWithTTL = async (
  key: string
): Promise<{ value: string | null; ttl: number }> => {
  try {
    const pipeline = redisClient.pipeline();
    pipeline.get(key);
    pipeline.ttl(key);

    const results = await pipeline.exec();

    if (!results || results.length !== 2) {
      throw new Error('Pipeline execution failed');
    }

    const [getResult, ttlResult] = results;

    if (!getResult || !ttlResult) {
      throw new Error('Pipeline execution failed: missing results');
    }

    if (getResult[0]) throw getResult[0];
    if (ttlResult[0]) throw ttlResult[0];

    return {
      value: getResult[1] as string | null,
      ttl: ttlResult[1] as number,
    };
  } catch (error) {
    logger.error('Redis getKeyWithTTL error', { key, error });
    throw new Error(`Redis getKeyWithTTL failed for key: ${key}`);
  }
};

/**
 * Delete a single key
 */
export const delKey = async (key: string): Promise<number> => {
  try {
    return await redisClient.del(key);
  } catch (error) {
    logger.error('Redis delKey error', { key, error });
    throw new Error(`Redis delKey failed for key: ${key}`);
  }
};

/**
 * Delete multiple keys
 */
export const delKeys = async (keys: string[]): Promise<number> => {
  try {
    if (!keys?.length) return 0;
    return await redisClient.del(...keys);
  } catch (error) {
    logger.error('Redis delKeys error', { keys, error });
    throw new Error(`Redis delKeys failed for keys: ${keys.join(', ')}`);
  }
};

/**
 * Check if key exists
 */
export const exists = async (key: string): Promise<boolean> => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Redis exists error', { key, error });
    throw new Error(`Redis exists check failed for key: ${key}`);
  }
};

/**
 * Get TTL of a key
 */
export const getTTL = async (key: string): Promise<number> => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error('Redis getTTL error', { key, error });
    throw new Error(`Redis getTTL failed for key: ${key}`);
  }
};

/**
 * Set expiry for a key
 */
export const expire = async (key: string, ttl: number): Promise<boolean> => {
  try {
    const result = await redisClient.expire(key, ttl);
    return result === 1;
  } catch (error) {
    logger.error('Redis expire error', { key, ttl, error });
    throw new Error(`Redis expire failed for key: ${key}`);
  }
};

/**
 * Scan keys by pattern (safe for production)
 * Uses SCAN command to iterate without blocking Redis
 */
export const scanKeys = async (
  pattern: string,
  count = 100
): Promise<string[]> => {
  try {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, matchedKeys] = await redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count
      );

      cursor = nextCursor;
      keys.push(...matchedKeys);

      // Safety limit to prevent infinite loops
      if (keys.length > 100000) {
        logger.warn(`scanKeys found >100k keys for pattern: ${pattern}`);
        break;
      }
    } while (cursor !== '0');

    return keys;
  } catch (error) {
    logger.error('Redis scanKeys error', { pattern, error });
    throw new Error(`Redis scanKeys failed for pattern: ${pattern}`);
  }
};

/**
 * Create a Redis pipeline for batch operations
 */
export const pipeline = (): Pipeline => redisClient.pipeline() as Pipeline;
