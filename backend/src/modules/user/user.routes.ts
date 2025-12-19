import { Router } from 'express';
import { rateLimiter } from '@/middlewares/rateLimiter.js';
import {
  validateQuery,
  validateBody,
  validateParams,
} from '@/middlewares/validateRequest.js';
import {
  getUsersController,
  getCurrentUserController,
  updateCurrentUserController,
  getUserByIdController,
} from './user.controllers.js';
import {
  getUserByIdParamsSchema,
  getUsersQuerySchema,
  updateUserBodySchema,
} from './user.schemas.js';

import { authorizeRoles } from '@/middlewares/authorizeRoles.middleware.js';
import { authenticateToken } from '@/middlewares/authenticateToken.middleware.js';

const userRouter: Router = Router();

// Current user endpoint
userRouter.get('/me', authenticateToken, getCurrentUserController);

userRouter.put(
  '/me',
  authenticateToken,
  validateBody(updateUserBodySchema),
  updateCurrentUserController
);

// Admin endpoints
userRouter.get(
  '/',
  authenticateToken,
  authorizeRoles(['admin', 'superadmin']),
  rateLimiter('api'),
  validateQuery(getUsersQuerySchema),
  getUsersController
);

userRouter.get(
  '/:userId',
  authenticateToken,
  validateParams(getUserByIdParamsSchema),
  authorizeRoles(['admin', 'superadmin']),
  getUserByIdController
);

export default userRouter;
