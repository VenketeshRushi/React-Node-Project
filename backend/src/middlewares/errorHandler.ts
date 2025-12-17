import { config } from '@/config/index.js';
import { ApiError, ErrorType } from '@/utils/ApiError.js';
import { logger } from '@/services/logging/logger.js';
import { getClientIp } from '@/utils/ext.js';
import type { Request, Response, NextFunction } from 'express';

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'creditCard',
    'credit_card',
    'cardNumber',
    'card_number',
    'cvv',
    'ssn',
    'privateKey',
    'private_key',
  ];

  const sanitized = Array.isArray(body) ? [...body] : { ...body };

  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key in obj) {
      const lowerKey = key.toLowerCase();

      if (
        sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))
      ) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = sanitizeObject(obj[key]);
      }
    }

    return obj;
  };

  return sanitizeObject(sanitized);
}

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

  const context: any = {
    requestId,
    path: req.path,
    method: req.method,
    type: apiError.type,
    statusCode: apiError.statusCode,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  };

  if (isDevelopment) {
    context.body = sanitizeBody(req.body);
    context.query = req.query;
    context.params = req.params;
  }

  if (!apiError.isOperational) {
    logger.error(apiError.message, {
      ...context,
      stack: apiError.stack,
      cause: (apiError as any).cause,
    });
  } else if (apiError.statusCode >= 500) {
    logger.error(apiError.message, {
      ...context,
      stack: apiError.stack,
      cause: (apiError as any).cause,
    });
  } else if (apiError.statusCode >= 400) {
    logger.warn(apiError.message, context);
  }

  if (res.headersSent) {
    logger.error('Cannot send error response - headers already sent', {
      requestId,
      path: req.path,
      statusCode: res.statusCode,
    });
    return;
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Request-Id', requestId);

  if (apiError.isRetryable() && apiError.getRetryAfter()) {
    res.setHeader('Retry-After', apiError.getRetryAfter()!);
  }

  const shouldSanitize = !apiError.isOperational || apiError.statusCode >= 500;

  const clientMessage =
    shouldSanitize && !isDevelopment
      ? 'An unexpected error occurred. Please try again later.'
      : apiError.message;

  const clientType =
    shouldSanitize && !isDevelopment ? ErrorType.INTERNAL : apiError.type;

  const responseData: any = {
    success: false,
    error: {
      type: clientType,
      message: clientMessage,
    },
    requestId,
    timestamp: apiError.timestamp,
  };

  if (isDevelopment) {
    if (apiError.data) {
      responseData.error.data = apiError.data;
    }
    responseData.error.stack = apiError.stack
      ?.split('\n')
      .map(line => line.trim());
  } else if (
    apiError.isOperational &&
    apiError.statusCode < 500 &&
    apiError.data
  ) {
    responseData.error.data = apiError.data;
  }

  res.status(apiError.statusCode).json(responseData);
};
