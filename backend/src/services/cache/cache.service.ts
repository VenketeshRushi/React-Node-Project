import { logger } from '@/services/logging/logger.js';
import { getKey, setKey, delKey } from '@/services/redis/redis.service.js';
import { buildCacheKey } from './cache.helpers.js';

/**
 * Set cache with error handling
 */
export async function setCache(
  prefix: string,
  key: string,
  value: any,
  ttl = 60
): Promise<void> {
  const fullKey = buildCacheKey(prefix, key);
  try {
    await setKey(fullKey, JSON.stringify(value), ttl);
    logger.debug(`[Cache] Stored: ${fullKey} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error(`[Cache] Failed to store ${fullKey}:`, error);
    // Don't throw - fail gracefully
  }
}

/**
 * Get cache with error handling
 */
export async function getCache<T = any>(
  prefix: string,
  key: string
): Promise<T | null> {
  const fullKey = buildCacheKey(prefix, key);
  try {
    const data = await getKey(fullKey);
    if (!data) return null;

    const parsed = JSON.parse(data) as T;
    return parsed;
  } catch (error) {
    logger.error(`[Cache] Failed to retrieve ${fullKey}:`, error);
    return null;
  }
}

/**
 * Delete cache entry
 */
export async function deleteCache(prefix: string, key: string): Promise<void> {
  const fullKey = buildCacheKey(prefix, key);
  try {
    await delKey(fullKey);
    logger.debug(`[Cache] Deleted: ${fullKey}`);
  } catch (error) {
    logger.error(`[Cache] Failed to delete ${fullKey}:`, error);
    // Don't throw - fail gracefully
  }
}

/**
 * Clear all cache entries by prefix
 * Note: Requires Redis SCAN implementation
 */
export async function clearCacheByPrefix(prefix: string): Promise<void> {
  try {
    logger.info(`[Cache] Clearing all entries with prefix: ${prefix}`);
    // TODO: Implement with Redis SCAN
    // const keys = await scanKeys(`${prefix}:*`);
    // await Promise.all(keys.map(key => delKey(key)));
    logger.warn('[Cache] clearCacheByPrefix not fully implemented');
  } catch (error) {
    logger.error(`[Cache] Failed to clear prefix ${prefix}:`, error);
    throw error;
  }
}
