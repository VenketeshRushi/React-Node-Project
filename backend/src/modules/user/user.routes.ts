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

userRouter.get(
  '/me',
  authenticateToken,
  rateLimiter('api'),
  getCurrentUserController
);

userRouter.put(
  '/me',
  validateBody(updateUserBodySchema),
  authenticateToken,
  rateLimiter('api'),
  updateCurrentUserController
);

userRouter.get(
  '/',
  validateQuery(getUsersQuerySchema),
  authenticateToken,
  authorizeRoles(['admin', 'superadmin']),
  rateLimiter('api'),
  getUsersController
);

userRouter.get(
  '/:userId',
  validateParams(getUserByIdParamsSchema),
  authenticateToken,
  authorizeRoles(['admin', 'superadmin']),
  rateLimiter('api'),
  getUserByIdController
);

export default userRouter;
