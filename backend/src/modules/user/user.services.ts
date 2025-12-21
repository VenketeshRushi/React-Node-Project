import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/database/connection.js';
import { usersTable } from '@/models/users.model.js';
import { NotFoundError } from '@/utils/CustomError.js';
import { UserWithoutPassword } from '@/types/auth.types.js';

interface GetUsersOptions {
  page: number;
  limit: number;
  role?: 'user' | 'admin' | 'superadmin';
  is_active?: boolean;
  search?: string;
}

interface UpdateUserPayload {
  name?: string;
  mobile_no?: string;
  onboarding?: boolean;
  profession?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  timezone?: string | null;
  language?: string | null;
}

const userPublicSelect = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  onboarding: usersTable.onboarding,
  profession: usersTable.profession,
  company: usersTable.company,
  address: usersTable.address,
  city: usersTable.city,
  state: usersTable.state,
  country: usersTable.country,
  avatar_url: usersTable.avatar_url,
  timezone: usersTable.timezone,
  language: usersTable.language,
  login_method: usersTable.login_method,
  role: usersTable.role,
  is_active: usersTable.is_active,
  is_banned: usersTable.is_banned,
  created_at: usersTable.created_at,
  updated_at: usersTable.updated_at,
};

export async function getUsersService(options: GetUsersOptions) {
  const { page, limit, role, is_active, search } = options;
  const offset = (page - 1) * limit;

  const conditions: Parameters<typeof and>[0][] = [];

  if (role) {
    conditions.push(eq(usersTable.role, role));
  }

  if (typeof is_active === 'boolean') {
    conditions.push(eq(usersTable.is_active, is_active));
  }

  if (search) {
    conditions.push(
      or(
        ilike(usersTable.name, `%${search}%`),
        ilike(usersTable.email, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [users, countResult] = await Promise.all([
    db
      .select(userPublicSelect)
      .from(usersTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(usersTable.created_at)),

    db.select({ count: count() }).from(usersTable).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserByIdService(
  userId: string
): Promise<UserWithoutPassword> {
  const [user] = await db
    .select(userPublicSelect)
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

export async function updateUserByIdService(
  userId: string,
  payload: UpdateUserPayload
): Promise<UserWithoutPassword> {
  const [updated] = await db
    .update(usersTable)
    .set(payload)
    .where(eq(usersTable.id, userId))
    .returning(userPublicSelect);

  if (!updated) {
    throw new NotFoundError('User not found');
  }

  return updated;
}
