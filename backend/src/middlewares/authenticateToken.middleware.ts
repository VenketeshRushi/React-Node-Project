import { Request, Response, NextFunction } from 'express';
import JWT from '@/utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '@/utils/CustomError.js';

export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (!accessToken) {
      throw new UnauthorizedError('Session expired. Please sign in again.');
    }

    // Validate access token only
    const payload = await JWT.validateAccessToken(accessToken);

    if (!payload.id) {
      throw new UnauthorizedError('Session expired. Please sign in again.');
    }

    if (!payload.onboarding) {
      throw new ForbiddenError('Please complete your onboarding process first');
    }

    if (payload.is_banned) {
      throw new UnauthorizedError('Account suspended. Please contact support.');
    }

    if (!payload.is_active) {
      throw new UnauthorizedError('Account inactive. Please contact support.');
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      onboarding: payload.onboarding,
      avatar_url: payload.avatar_url || null,
      is_banned: payload.is_banned,
      is_active: payload.is_active,
    };

    next();
  } catch (err) {
    next(err);
  }
}
