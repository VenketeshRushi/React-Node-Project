import { Router } from 'express';
import {
  googleAuthCodeController,
  refreshTokenController,
  logoutController,
  logoutAllDevicesController,
} from '@/modules/auth/auth.controllers.js';
import { rateLimiter } from '@/middlewares/rateLimiter.js';
import { authenticateToken } from '@/middlewares/authenticateToken.middleware.js';

const authRouter: Router = Router();

// Google OAuth 2.0 With PKCE
authRouter.post(
  '/google/callback',
  rateLimiter('auth'),
  googleAuthCodeController
);

// Refresh token
authRouter.post('/refresh', rateLimiter('auth'), refreshTokenController);

// Logout (protected)
authRouter.post(
  '/logout',
  authenticateToken,
  rateLimiter('auth'),
  logoutController
);

// Logout all devices
authRouter.post(
  '/logout/all',
  authenticateToken,
  rateLimiter('auth'),
  logoutAllDevicesController
);

export default authRouter;
