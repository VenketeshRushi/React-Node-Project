import { Router } from 'express';
import { rateLimiter } from '@/middlewares/security/rateLimiter.js';
import {
  googleAuthCodeController,
  initPKCEFlow,
} from '@/modules/auth/auth.controller.js';

const authRouter: Router = Router();

authRouter.post('/google/pkce/init', rateLimiter('auth'), initPKCEFlow);

authRouter.post(
  '/google/callback',
  rateLimiter('auth'),
  googleAuthCodeController
);

export default authRouter;
