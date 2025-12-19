import { Request, Response } from 'express';
import { sendSuccess } from '@/utils/response.js';
import {
  getUsersService,
  getUserByIdService,
  updateUserByIdService,
} from './user.services.js';

/**
 * Get current authenticated user's profile
 */
export async function getCurrentUserController(req: Request, res: Response) {
  const userId = req.user!.id;
  const user = await getUserByIdService(userId);
  sendSuccess(res, user, {
    message: 'User fetched successfully',
  });
}

/**
 * Update current authenticated user's profile
 */
export async function updateCurrentUserController(req: Request, res: Response) {
  const userId = req.user!.id;
  const user = await updateUserByIdService(userId, req.body);
  sendSuccess(res, user, {
    message: 'User updated successfully',
  });
}

/**
 * Get any user by ID (Admin only)
 */
export async function getUserByIdController(req: Request, res: Response) {
  const { userId } = req.params;
  const user = await getUserByIdService(userId as string);
  sendSuccess(res, user, {
    message: 'User fetched successfully',
  });
}

/**
 * Get all users with pagination and filters (Admin only)
 */
export async function getUsersController(req: Request, res: Response) {
  const result = await getUsersService(req.query as any);
  sendSuccess(res, result, {
    message: 'Users fetched successfully',
  });
}
