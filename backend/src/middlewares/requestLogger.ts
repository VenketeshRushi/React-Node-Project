import { type Request, type Response, type NextFunction } from 'express';
import { getClientIp, sanitizeUrl } from '@/utils/ext.js';
import { logger } from '@/services/logging/logger.js';
import { generateUUID } from '@/utils/encryption.js';

interface LogContext {
  requestId: string;
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  statusCode: number;
  duration: number;
  contentLength?: string;
  userId?: string;
  error?: boolean;
  memoryUsageMB?: number;
  timestamp: string;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Generate or retrieve request ID
  const requestId =
    req.id || (req.headers['x-request-id'] as string) || generateUUID();

  // Attach to request object for downstream middleware/handlers
  req.id = requestId;
  res.setHeader('x-request-id', requestId);

  // Store original end function
  const originalEnd = res.end;

  // Flag to ensure we only log once
  let logged = false;

  // Override res.end to log after response is sent
  res.end = function (
    chunk?: any,
    encodingOrCb?: BufferEncoding | (() => void),
    cb?: () => void
  ): Response {
    // Log only once
    if (!logged) {
      logged = true;
      const duration = Date.now() - start;

      const logContext: LogContext = {
        requestId,
        method: req.method,
        url: sanitizeUrl(req.originalUrl || req.url),
        ip: getClientIp(req),
        statusCode: res.statusCode,
        duration,
        error: res.statusCode >= 400,
        timestamp: new Date().toISOString(),
      };

      // Add optional fields
      const userAgent = req.get('user-agent');
      const contentLength = res.get('content-length');
      const userId = req.user?.id;

      if (userAgent) logContext.userAgent = userAgent;
      if (contentLength) logContext.contentLength = contentLength;
      if (userId) logContext.userId = userId;

      // Only track memory on errors or slow requests to reduce overhead
      if (res.statusCode >= 400 || duration > 1000) {
        logContext.memoryUsageMB = Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        );
      }

      // Log based on status code and duration
      if (res.statusCode >= 500) {
        logger.error('HTTP Request - Server Error', logContext);
      } else if (res.statusCode >= 400) {
        logger.warn('HTTP Request - Client Error', logContext);
      } else if (duration > 1000) {
        logger.warn('HTTP Request - Slow Response', logContext);
      } else {
        logger.http('HTTP Request', logContext);
      }
    }

    // Handle all callback signatures properly
    if (typeof encodingOrCb === 'function') {
      return originalEnd.call(this, chunk, encodingOrCb as any);
    }
    if (typeof cb === 'function') {
      return originalEnd.call(this, chunk, encodingOrCb as BufferEncoding, cb);
    }
    return originalEnd.call(this, chunk, encodingOrCb as BufferEncoding);
  };

  next();
};
