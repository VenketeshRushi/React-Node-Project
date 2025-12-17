import { ApiError } from '@/utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodType } from 'zod';

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
 */
export function validateRequest(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate in order: headers -> params -> query -> body
      // This order ensures authentication/authorization happens before validating payload

      if (schemas.headers) {
        req.headers = schemas.headers.parse(req.headers);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
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
