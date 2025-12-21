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

// Current user routes
userRouter.get(
  '/me',
  authenticateToken,
  rateLimiter('api'),
  getCurrentUserController
);

userRouter.put(
  '/me',
  authenticateToken,
  rateLimiter('api'),
  validateBody(updateUserBodySchema),
  updateCurrentUserController
);

// Admin routes
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
  authorizeRoles(['admin', 'superadmin']),
  rateLimiter('api'),
  validateParams(getUserByIdParamsSchema),
  getUserByIdController
);

export default userRouter;
