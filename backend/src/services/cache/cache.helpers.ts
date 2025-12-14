/**
 * Sanitize cache key to prevent injection
 */
export function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9:/_?&=-]/g, '_');
}

/**
 * Build a cache key with prefix
 */
export function buildCacheKey(prefix: string, key: string): string {
  return `${prefix}:${sanitizeCacheKey(key)}`;
}
