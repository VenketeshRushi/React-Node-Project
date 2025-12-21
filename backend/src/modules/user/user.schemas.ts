import { z } from 'zod';

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(['user', 'admin', 'superadmin']).optional(),
  is_active: z
    .string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .optional(),
  search: z.string().min(1).optional(),
});

export const getUserByIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const updateUserBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  mobile_no: z.string().max(15).optional(),
  onboarding: z.boolean().optional(),
  profession: z.string().max(100).optional(),
  company: z.string().max(150).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  avatar_url: z.string().url().max(500).optional(),
});
