import { ApiError } from '@/utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodType } from 'zod';

// Extend Express Request type to include validated data
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
      validatedHeaders?: any;
    }
  }
}

type SchemaMap = {
  body?: ZodType<any, any>;
  headers?: ZodType<any, any>;
  query?: ZodType<any, any>;
  params?: ZodType<any, any>;
};

/**
 * Validate request against Zod schemas
 * @param schemas - Object containing schemas for different parts of the request
 * @returns Express middleware function
 *
 * Note: This middleware stores validated data in separate properties
 * (validatedBody, validatedQuery, etc.) to avoid mutating read-only properties
 */
export function validateRequest(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate in order: headers -> params -> query -> body
      // This order ensures authentication/authorization happens before validating payload

      if (schemas.headers) {
        const result = schemas.headers.safeParse(req.headers);
        if (!result.success) {
          throw result.error;
        }
        req.validatedHeaders = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          throw result.error;
        }
        req.validatedParams = result.data;
        // Also update req.params for backward compatibility (params is writable)
        req.params = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          throw result.error;
        }
        // Store in validatedQuery (query is read-only, cannot be mutated)
        req.validatedQuery = result.data;
      }

      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          throw result.error;
        }
        req.validatedBody = result.data;
        // Also update req.body for backward compatibility (body is writable)
        req.body = result.data;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.fromZodError(err));
      }
      return next(err);
    }
  };
}

export function validateBody<T>(schema: ZodType<T>) {
  return validateRequest({ body: schema });
}

export function validateQuery<T>(schema: ZodType<T>) {
  return validateRequest({ query: schema });
}

export function validateParams<T>(schema: ZodType<T>) {
  return validateRequest({ params: schema });
}

export function validateHeaders<T>(schema: ZodType<T>) {
  return validateRequest({ headers: schema });
}
