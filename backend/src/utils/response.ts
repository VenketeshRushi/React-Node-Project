import { Response } from 'express';
import { ApiError } from '@/utils/ApiError.js';
import { config } from '@/config/index.js';

interface SuccessOptions {
  message?: string;
  statusCode?: number;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  options: SuccessOptions = {}
): void => {
  const { message = 'Success', statusCode = 200 } = options;

  const response: any = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Send success response with custom data structure
 */
export const sendData = <T = any>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: unknown,
  requestId?: string
): void => {
  const apiError = ApiError.fromUnknown(error);
  const isDevelopment = config.app.nodeEnv === 'development';

  const data = isDevelopment
    ? { ...apiError.data, stack: apiError.stack }
    : apiError.data;

  const response: any = {
    success: false,
    error: {
      type: apiError.type,
      message: apiError.message,
    },
  };

  if (data) {
    response.error.data = data;
  }

  if (requestId) {
    response.requestId = requestId;
  }

  response.timestamp = apiError.timestamp;

  res.status(apiError.statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T = any>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message: string = 'Success'
): void => {
  const { page, limit, total, totalPages } = pagination;

  const response = {
    success: true,
    message,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  };

  res.status(200).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T = any>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  sendSuccess(res, data, { message, statusCode: 201 });
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

/**
 * Send accepted response (202)
 */
export const sendAccepted = (
  res: Response,
  message: string = 'Request accepted for processing'
): void => {
  res.status(202).json({
    success: true,
    message,
  });
};
