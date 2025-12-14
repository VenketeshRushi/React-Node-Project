import { Response } from 'express';
import { ApiError } from '@/utils/ApiError.js';
import { config } from '@/config/index.js';

// Send success response
export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number = 200,
  message: string = 'Success',
  data?: T,
  meta?: Record<string, any>
): void => {
  const response: any = {
    success: true,
    message,
  };

  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;

  res.status(statusCode).json(response);
};

// Send error response
export const sendError = (
  res: Response,
  error: unknown,
  requestId?: string
): void => {
  const apiError = ApiError.fromUnknown(error);

  const data =
    config.app.nodeEnv === 'production'
      ? apiError.data
      : { ...apiError.data, stack: apiError.stack };

  const response: any = {
    success: false,
    type: apiError.type,
    message: apiError.message,
  };

  if (data) response.data = data;
  if (requestId) response.requestId = requestId;

  res.status(apiError.statusCode).json(response);
};

// Send paginated response
export const sendPaginated = <T = any>(
  res: Response,
  message: string,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): void => {
  sendSuccess(res, 200, message, data, { pagination });
};
