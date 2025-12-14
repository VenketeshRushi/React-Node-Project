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

export function validateRequest(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.headers) {
        schemas.headers.parse(req.headers);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
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
