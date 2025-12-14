import { ApiError, ErrorData, ErrorType } from './ApiError.js';

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', data?: ErrorData) {
    super(ErrorType.BAD_REQUEST, message, 400, true, data);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', data?: ErrorData) {
    super(ErrorType.NOT_FOUND, message, 404, true, data);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required', data?: ErrorData) {
    super(ErrorType.UNAUTHORIZED, message, 401, true, data);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden', data?: ErrorData) {
    super(ErrorType.FORBIDDEN, message, 403, true, data);
  }
}

export class InternalError extends ApiError {
  constructor(message = 'Internal server error', data?: ErrorData) {
    super(ErrorType.INTERNAL, message, 500, false, data);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(message = 'Token has expired', data?: ErrorData) {
    super(ErrorType.TOKEN_EXPIRED, message, 401, true, data);
  }
}

export class BadTokenError extends ApiError {
  constructor(message = 'Invalid token', data?: ErrorData) {
    super(ErrorType.BAD_TOKEN, message, 401, true, data);
  }
}

export class AccessTokenError extends ApiError {
  constructor(message = 'Access token error', data?: ErrorData) {
    super(ErrorType.ACCESS_TOKEN_ERROR, message, 401, true, data);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', data?: ErrorData) {
    super(ErrorType.VALIDATION_ERROR, message, 422, true, data);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', data?: ErrorData) {
    super(ErrorType.CONFLICT, message, 409, true, data);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', data?: ErrorData) {
    super(ErrorType.TOO_MANY_REQUESTS, message, 429, true, data);
  }
}

export class DatabaseError extends ApiError {
  constructor(message = 'Database error occurred', data?: ErrorData) {
    super(ErrorType.DATABASE_ERROR, message, 500, false, data);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable', data?: ErrorData) {
    super(ErrorType.SERVICE_UNAVAILABLE, message, 503, true, data);
  }
}

export class PayloadTooLargeError extends ApiError {
  constructor(message = 'Request payload too large', data?: ErrorData) {
    super(ErrorType.PAYLOAD_TOO_LARGE, message, 413, true, data);
  }
}
