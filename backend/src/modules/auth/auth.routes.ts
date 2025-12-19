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

// OAuth Login
authRouter.post(
  '/google/callback',
  rateLimiter('auth'),
  googleAuthCodeController
);

// Refresh Token Management
authRouter.post('/refresh', rateLimiter('auth'), refreshTokenController);

// Logout
authRouter.post('/logout', logoutController);

// Logout from all devices
authRouter.post('/logout/all', authenticateToken, logoutAllDevicesController);

export default authRouter;
