import { Router } from 'express';
import {
  googleAuthCodeController,
  logoutController,
} from '@/modules/auth/auth.controller.js';
import { rateLimiter } from '@/middlewares/rateLimiter.js';

const authRouter: Router = Router();

authRouter.post(
  '/google/callback',
  rateLimiter('auth'),
  googleAuthCodeController
);

authRouter.post('/logout', logoutController);

export default authRouter;
