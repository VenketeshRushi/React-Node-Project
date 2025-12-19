import { Request } from 'express';
import { eq, and, gt, isNull, lt } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/database/connection.js';
import { usersTable } from '@/models/users.model.js';
import JWT from '@/utils/jwt.js';
import { UnauthorizedError } from '@/utils/CustomError.js';
import { sessionsTable } from '@/models/sessions.model.js';
import { getClientIp } from '@/utils/ext.js';

/**
 * Create hash from refresh token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(
  userId: string,
  refreshToken: string,
  req: Request
): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await db.insert(sessionsTable).values({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    user_agent: req.get('user-agent') || req.headers['user-agent'] || 'unknown',
    ip_address:
      getClientIp(req) || req.ip || req.socket.remoteAddress || 'unknown',
  });
}

/**
 * Validate and get user from refresh token
 */
export async function validateAndGetUser(refreshToken: string) {
  // Validate JWT structure
  const payload = await JWT.validateRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);

  // Check if token exists in database and is not revoked
  const storedToken = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.token_hash, tokenHash),
        eq(sessionsTable.user_id, payload.id),
        gt(sessionsTable.expires_at, new Date()),
        isNull(sessionsTable.revoked_at)
      )
    )
    .limit(1)
    .then(rows => rows[0]);

  if (!storedToken) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Get user from database
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.id))
    .limit(1)
    .then(rows => rows[0]);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  if (user.is_banned) {
    throw new UnauthorizedError('Account suspended. Please contact support.');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('Account inactive. Please contact support.');
  }

  if (user.deleted_at) {
    throw new UnauthorizedError('Account has been deleted');
  }

  return { user, storedToken };
}

/**
 * Revoke refresh token (logout or token rotation)
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  await db
    .update(sessionsTable)
    .set({ revoked_at: new Date() })
    .where(eq(sessionsTable.token_hash, tokenHash));
}

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await db
    .update(sessionsTable)
    .set({ revoked_at: new Date() })
    .where(
      and(eq(sessionsTable.user_id, userId), isNull(sessionsTable.revoked_at))
    );
}

/**
 * Clean up expired tokens (run this periodically via cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await db
    .delete(sessionsTable)
    .where(
      and(
        lt(sessionsTable.expires_at, new Date()),
        isNull(sessionsTable.revoked_at)
      )
    );

  return result.rowCount || 0;
}
