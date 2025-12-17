/**
 * Sanitize cache key to prevent Redis injection
 */
export function sanitizeCacheKey(key: string): string {
  if (!key) return '';

  return key
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9:/_?&=.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Build full cache key with prefix
 */
export function buildCacheKey(prefix: string, key: string): string {
  if (!prefix || !key) {
    throw new Error('Cache prefix and key are required');
  }

  return `${sanitizeCacheKey(prefix)}:${sanitizeCacheKey(key)}`;
}
