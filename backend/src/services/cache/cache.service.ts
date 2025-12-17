import { logger } from '@/services/logging/logger.js';
import {
  getKey,
  setKey,
  delKey,
  delKeys,
} from '@/services/redis/redis.service.js';
import { buildCacheKey } from './cache.helpers.js';

/**
 * Set cache with TTL
 */
export async function setCache(
  prefix: string,
  key: string,
  value: any,
  ttl = 60
): Promise<void> {
  if (!prefix || !key) return;

  const fullKey = buildCacheKey(prefix, key);

  try {
    const serialized = JSON.stringify(value);
    await setKey(fullKey, serialized, ttl);
    logger.debug(`[Cache] SET: ${fullKey} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error(`[Cache] SET failed for ${fullKey}:`, error);
    // Fail silently - cache should never break the app
  }
}

/**
 * Get cached value
 */
export async function getCache<T = any>(
  prefix: string,
  key: string
): Promise<T | null> {
  if (!prefix || !key) return null;

  const fullKey = buildCacheKey(prefix, key);

  try {
    const data = await getKey(fullKey);
    if (!data) return null;

    const parsed = JSON.parse(data) as T;
    logger.debug(`[Cache] GET: ${fullKey}`);
    return parsed;
  } catch (error) {
    logger.error(`[Cache] GET failed for ${fullKey}:`, error);
    return null;
  }
}

/**
 * Delete single cache entry
 */
export async function deleteCache(prefix: string, key: string): Promise<void> {
  if (!prefix || !key) return;

  const fullKey = buildCacheKey(prefix, key);

  try {
    await delKey(fullKey);
    logger.debug(`[Cache] DEL: ${fullKey}`);
  } catch (error) {
    logger.error(`[Cache] DEL failed for ${fullKey}:`, error);
  }
}

/**
 * Delete multiple cache entries
 */
export async function deleteCacheBatch(
  prefix: string,
  keys: string[]
): Promise<void> {
  if (!prefix || !keys.length) return;

  try {
    const fullKeys = keys.map(key => buildCacheKey(prefix, key));
    await delKeys(fullKeys);
    logger.debug(`[Cache] DEL ${fullKeys.length} keys for prefix: ${prefix}`);
  } catch (error) {
    logger.error(`[Cache] Batch delete failed for prefix ${prefix}:`, error);
  }
}

/**
 * Clear all cache entries by prefix
 */
export async function clearCacheByPrefix(prefix: string): Promise<number> {
  if (!prefix) return 0;

  try {
    const { scanKeys } = await import('@/services/redis/redis.service.js');
    const pattern = `${prefix}:*`;
    const keys = await scanKeys(pattern);

    if (keys.length === 0) {
      logger.debug(`[Cache] No keys found for prefix: ${prefix}`);
      return 0;
    }

    // Delete in batches
    const batchSize = 100;
    let deleted = 0;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await delKeys(batch);
      deleted += batch.length;
    }

    logger.info(`[Cache] Cleared ${deleted} keys for prefix: ${prefix}`);
    return deleted;
  } catch (error) {
    logger.error(`[Cache] Clear prefix failed for ${prefix}:`, error);
    return 0;
  }
}
