export enum ErrorType {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE',

  // Auth Errors (401)
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  BAD_TOKEN = 'BAD_TOKEN',
  ACCESS_TOKEN_ERROR = 'ACCESS_TOKEN_ERROR',
  REFRESH_TOKEN_REQUIRED = 'REFRESH_TOKEN_REQUIRED',

  // Server Errors (5xx)
  INTERNAL = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
}

export interface ErrorData {
  [key: string]: any;
  field?: string;
  value?: any;
  constraint?: string;
  fields?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly data?: ErrorData;
  public readonly timestamp: string = new Date().toISOString();

  constructor(
    type: ErrorType,
    message: string,
    statusCode = 500,
    isOperational = true,
    data: ErrorData = {},
    cause?: unknown
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;
    this.name = this.constructor.name;

    // Maintain proper stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);

    if (cause) {
      (this as any).cause = cause;
    }
  }

  /**
   * Safely converts any unknown thrown error into an ApiError.
   */
  static fromUnknown(error: unknown): ApiError {
    // Already an ApiError
    if (error instanceof ApiError) {
      return error;
    }

    // Standard Error
    if (error instanceof Error) {
      // Check for database errors FIRST (Drizzle, Prisma, etc.)
      if (
        error.name === 'DrizzleQueryError' ||
        error.constructor.name === 'DrizzleQueryError' ||
        error.name === 'PrismaClientKnownRequestError' ||
        (error as any).code?.startsWith('P')
      ) {
        return ApiError.fromDatabaseError(error);
      }

      // Check for Zod validation errors
      if (error.name === 'ZodError') {
        return ApiError.fromZodError(error);
      }

      // Check for specific error types and map them
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        return new ApiError(
          ErrorType.BAD_REQUEST,
          'Invalid JSON in request body',
          400,
          true,
          { originalError: error.message },
          error
        );
      }

      if (error.name === 'PayloadTooLargeError') {
        return new ApiError(
          ErrorType.PAYLOAD_TOO_LARGE,
          'Request payload too large',
          413,
          true,
          undefined,
          error
        );
      }

      // Generic error fallback
      return new ApiError(
        ErrorType.INTERNAL,
        error.message || 'An unexpected error occurred',
        500,
        false,
        undefined,
        error
      );
    }

    // Handle non-Error values
    const message =
      typeof error === 'string'
        ? error
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : 'An unexpected error occurred';

    return new ApiError(ErrorType.INTERNAL, message, 500, false);
  }

  /**
   * Create error from Zod validation
   */
  static fromZodError(zodError: any): ApiError {
    const fields = zodError.issues?.map((issue: any) => ({
      field: issue.path.join('.') || '(root)',
      message: issue.message,
    }));

    return new ApiError(
      ErrorType.VALIDATION_ERROR,
      'Validation failed',
      422,
      true,
      { fields }
    );
  }

  /**
   * Create error from database error (Prisma, Drizzle, etc.)
   */
  static fromDatabaseError(error: any): ApiError {
    // Drizzle query error
    if (
      error.name === 'DrizzleQueryError' ||
      error.constructor.name === 'DrizzleQueryError'
    ) {
      // PostgreSQL syntax error (42601)
      if (error.cause?.code === '42601') {
        return new ApiError(
          ErrorType.DATABASE_ERROR,
          'Database query error',
          500,
          false,
          { code: error.cause.code },
          error
        );
      }

      // PostgreSQL unique violation (23505)
      if (error.cause?.code === '23505') {
        return new ApiError(
          ErrorType.CONFLICT,
          'Resource already exists',
          409,
          true,
          { constraint: 'unique', code: error.cause.code },
          error
        );
      }

      // PostgreSQL foreign key violation (23503)
      if (error.cause?.code === '23503') {
        return new ApiError(
          ErrorType.BAD_REQUEST,
          'Referenced resource does not exist',
          400,
          true,
          { constraint: 'foreign_key', code: error.cause.code },
          error
        );
      }

      // PostgreSQL not null violation (23502)
      if (error.cause?.code === '23502') {
        const column = error.cause.column || 'unknown';
        return new ApiError(
          ErrorType.VALIDATION_ERROR,
          `Required field missing: ${column}`,
          422,
          true,
          { field: column, constraint: 'not_null', code: error.cause.code },
          error
        );
      }

      // Generic Drizzle error
      return new ApiError(
        ErrorType.DATABASE_ERROR,
        'Database operation failed',
        500,
        false,
        { code: error.cause?.code },
        error
      );
    }

    // Prisma unique constraint (P2002)
    if (error.code === 'P2002') {
      const fields = error.meta?.target || [];
      return new ApiError(
        ErrorType.CONFLICT,
        `Resource already exists: ${fields.join(', ')}`,
        409,
        true,
        { fields, constraint: 'unique' }
      );
    }

    // Prisma foreign key constraint (P2003)
    if (error.code === 'P2003') {
      return new ApiError(
        ErrorType.BAD_REQUEST,
        'Referenced resource does not exist',
        400,
        true,
        { constraint: 'foreign_key' }
      );
    }

    // Prisma not found (P2025)
    if (error.code === 'P2025') {
      return new ApiError(ErrorType.NOT_FOUND, 'Record not found', 404, true);
    }

    // Prisma connection error (P1001)
    if (error.code === 'P1001') {
      return new ApiError(
        ErrorType.SERVICE_UNAVAILABLE,
        'Database connection failed',
        503,
        true,
        { code: error.code }
      );
    }

    // Generic database error
    return new ApiError(
      ErrorType.DATABASE_ERROR,
      'Database operation failed',
      500,
      false,
      { code: error.code },
      error
    );
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableTypes = [
      ErrorType.TOO_MANY_REQUESTS,
      ErrorType.SERVICE_UNAVAILABLE,
      ErrorType.GATEWAY_TIMEOUT,
    ];
    return retryableTypes.includes(this.type);
  }

  /**
   * Get retry-after seconds (for rate limits)
   */
  getRetryAfter(): number | undefined {
    return this.data?.retryAfter;
  }
}
