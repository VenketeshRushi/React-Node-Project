import compression from 'compression';
import type { Request, Response, RequestHandler } from 'express';

/**
 * Compression middleware with sensible defaults
 */
export const compressionMiddleware: RequestHandler = compression({
  // Compression level (0-9, where 6 is a good balance)
  level: 6,

  // Minimum response size in bytes to compress (1KB)
  threshold: 1024,

  // Custom filter function
  filter: (req: Request, res: Response): boolean => {
    // Don't compress if explicitly disabled via header
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress for Server-Sent Events (SSE)
    if (req.headers.accept?.includes('text/event-stream')) {
      return false;
    }

    // Don't compress for already compressed content
    const contentType = res.getHeader('Content-Type');
    if (contentType) {
      const type = contentType.toString().toLowerCase();

      // Skip already compressed formats
      if (
        type.includes('zip') ||
        type.includes('gzip') ||
        type.includes('compress') ||
        type.includes('br') ||
        type.includes('image/') ||
        type.includes('video/') ||
        type.includes('audio/')
      ) {
        return false;
      }
    }

    // Use default compression filter for everything else
    return compression.filter(req, res);
  },

  // Memory level (1-9, where 8 is default)
  memLevel: 8,

  // Window bits (9-15, where 15 is default)
  windowBits: 15,

  // Z_DEFAULT_STRATEGY (0) is default
  strategy: 0,
});
