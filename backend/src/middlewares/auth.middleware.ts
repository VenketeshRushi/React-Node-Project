import { Request, Response, NextFunction } from 'express';
import JWT from '@/utils/jwt.js';
import { UnauthorizedError } from '@/utils/CustomError.js';

export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.accessToken ||
      (authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : undefined);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = await JWT.validateAccessToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      onboarding: payload.onboarding,
      avatar_url: payload.avatar_url || null,
    };

    next();
  } catch (err) {
    next(err);
  }
}
