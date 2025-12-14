import { config } from '@/config/index.js';
import { ApiError, ErrorType } from '@/utils/ApiError.js';
import { logger } from '@/services/logging/logger.js';
import { getClientIp } from '@/utils/ext.js';
import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const apiError = ApiError.fromUnknown(err);
  const requestId =
    req.id || (req.headers['x-request-id'] as string) || 'unknown';
  const isDevelopment = config.app.nodeEnv === 'development';

  // Build logging context
  const context = {
    requestId,
    path: req.path,
    method: req.method,
    type: apiError.type,
    statusCode: apiError.statusCode,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    // Log full details server-side
    cause: (apiError as any).cause,
    ...(isDevelopment && {
      body: req.body,
      query: req.query,
      params: req.params,
    }),
  };

  // Log based on severity
  if (!apiError.isOperational) {
    logger.error(apiError.message, {
      ...context,
      stack: apiError.stack,
    });
  } else if (apiError.statusCode >= 500) {
    logger.error(apiError.message, { ...context, stack: apiError.stack });
  } else if (apiError.statusCode >= 400) {
    logger.warn(apiError.message, context);
  }

  // Prevent duplicate responses
  if (res.headersSent) {
    logger.error('Cannot send error response - headers already sent', {
      requestId,
      path: req.path,
      statusCode: res.statusCode,
    });
    return;
  }

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Request-Id', requestId);

  // Add Retry-After header for rate limits
  if (apiError.isRetryable() && apiError.getRetryAfter()) {
    res.setHeader('Retry-After', apiError.getRetryAfter()!);
  }

  // Prepare client response (NEVER expose sensitive details)
  const shouldSanitize = !apiError.isOperational || apiError.statusCode >= 500;

  const clientMessage =
    shouldSanitize && !isDevelopment
      ? 'An unexpected error occurred. Please try again later.'
      : apiError.message;

  const clientType =
    shouldSanitize && !isDevelopment ? ErrorType.INTERNAL : apiError.type;

  // Build response data
  const responseData: any = {
    success: false,
    error: {
      type: clientType,
      message: clientMessage,
    },
    requestId,
    timestamp: apiError.timestamp,
  };

  // Only add data in development or for operational client errors
  if (isDevelopment && apiError.data) {
    responseData.error.data = {
      ...apiError.data,
      stack: apiError.stack?.split('\n').map(line => line.trim()),
    };
  } else if (
    apiError.isOperational &&
    apiError.statusCode < 500 &&
    apiError.data
  ) {
    // Only expose data for client errors (4xx) in production
    responseData.error.data = apiError.data;
  }

  // Send error response
  res.status(apiError.statusCode).json(responseData);
};
