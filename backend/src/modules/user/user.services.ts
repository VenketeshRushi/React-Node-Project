import { and, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/database/connection.js';
import { usersTable } from '@/models/users.model.js';
import { NotFoundError } from '@/utils/CustomError.js';

interface GetUsersOptions {
  page: number;
  limit: number;
  role?: 'user' | 'admin' | 'superadmin';
  is_active?: boolean;
  search?: string;
}

export async function getUsersService(options: GetUsersOptions) {
  const { page, limit, role, is_active, search } = options;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (role) {
    conditions.push(eq(usersTable.role, role));
  }

  if (typeof is_active === 'boolean') {
    conditions.push(eq(usersTable.is_active, is_active));
  }

  if (search) {
    conditions.push(ilike(usersTable.name, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [users, countResult] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        onboarding: usersTable.onboarding,
        is_active: usersTable.is_active,
        created_at: usersTable.created_at,
      })
      .from(usersTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(usersTable.created_at),

    db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(usersTable)
      .where(whereClause),
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  return {
    data: users,
    pagination: {
      page,
      limit,
      total: Number(totalCount),
      totalPages: Math.ceil(Number(totalCount) / limit),
    },
  };
}

export async function getUserByIdService(userId: string) {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user.length) {
    throw new NotFoundError('User not found');
  }

  return user[0];
}

export async function updateUserByIdService(
  userId: string,
  payload: Partial<typeof usersTable.$inferInsert>
) {
  const updated = await db
    .update(usersTable)
    .set(payload)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated.length) {
    throw new NotFoundError('User not found');
  }

  return updated[0];
}
