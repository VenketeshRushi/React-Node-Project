import compression from 'compression';
import type { RequestHandler } from 'express';

export const compressionMiddleware: RequestHandler = compression({
  level: 6, // compression level
  threshold: 1024, // minimum bytes to compress
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
});
