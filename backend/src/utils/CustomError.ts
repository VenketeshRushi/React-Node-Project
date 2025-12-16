import { ApiError, ErrorData, ErrorType } from './ApiError.js';

export class BadRequestError extends ApiError {
  constructor(
    message = 'Invalid request. Please check your input and try again.',
    data?: ErrorData
  ) {
    super(ErrorType.BAD_REQUEST, message, 400, true, data);
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message = 'The requested resource could not be found.',
    data?: ErrorData
  ) {
    super(ErrorType.NOT_FOUND, message, 404, true, data);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = 'Authentication failed. Please try again.',
    data?: ErrorData
  ) {
    super(ErrorType.UNAUTHORIZED, message, 401, true, data);
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = 'You do not have permission to perform this action.',
    data?: ErrorData
  ) {
    super(ErrorType.FORBIDDEN, message, 403, true, data);
  }
}

export class InternalError extends ApiError {
  constructor(
    message = 'Something went wrong. Please try again later.',
    data?: ErrorData
  ) {
    super(ErrorType.INTERNAL, message, 500, false, data);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(
    message = 'Your session has expired. Please sign in again.',
    data?: ErrorData
  ) {
    super(ErrorType.TOKEN_EXPIRED, message, 401, true, data);
  }
}

export class BadTokenError extends ApiError {
  constructor(
    message = 'Authentication failed. Please sign in again.',
    data?: ErrorData
  ) {
    super(ErrorType.BAD_TOKEN, message, 401, true, data);
  }
}

export class AccessTokenError extends ApiError {
  constructor(
    message = 'Authentication failed. Please sign in again.',
    data?: ErrorData
  ) {
    super(ErrorType.ACCESS_TOKEN_ERROR, message, 401, true, data);
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = 'Some information is invalid. Please review and try again.',
    data?: ErrorData
  ) {
    super(ErrorType.VALIDATION_ERROR, message, 422, true, data);
  }
}

export class ConflictError extends ApiError {
  constructor(
    message = 'This action could not be completed due to a conflict.',
    data?: ErrorData
  ) {
    super(ErrorType.CONFLICT, message, 409, true, data);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(
    message = 'Too many requests. Please wait a moment and try again.',
    data?: ErrorData
  ) {
    super(ErrorType.TOO_MANY_REQUESTS, message, 429, true, data);
  }
}

export class DatabaseError extends ApiError {
  constructor(
    message = 'A system error occurred. Please try again later.',
    data?: ErrorData
  ) {
    super(ErrorType.DATABASE_ERROR, message, 500, false, data);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(
    message = 'Service is temporarily unavailable. Please try again shortly.',
    data?: ErrorData
  ) {
    super(ErrorType.SERVICE_UNAVAILABLE, message, 503, true, data);
  }
}

export class PayloadTooLargeError extends ApiError {
  constructor(
    message = 'The request is too large. Please reduce the size and try again.',
    data?: ErrorData
  ) {
    super(ErrorType.PAYLOAD_TOO_LARGE, message, 413, true, data);
  }
}
