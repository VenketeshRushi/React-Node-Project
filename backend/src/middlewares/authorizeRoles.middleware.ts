import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/utils/CustomError.js';

export function authorizeRoles(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError(
          'You do not have permission to access this resource'
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
