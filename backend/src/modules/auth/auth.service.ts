import { Request } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '@/database/connection.js';
import { usersTable } from '@/models/users.model.js';
import {
  OAuthProvider,
  OAuthResponse,
  UserWithoutPassword,
} from '@/types/auth.types.js';
import JWT from '@/utils/jwt.js';

function extractProfileData(provider: OAuthProvider, profile: any) {
  const email = profile.emails?.[0]?.value;
  const name = profile.displayName || profile.name?.givenName || 'User';
  const avatarUrl = profile.photos?.[0]?.value || null;
  const providerId = profile.id;

  if (!email) {
    throw new Error(`No email provided by ${provider}`);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  if (!providerId) {
    throw new Error(`No provider ID received`);
  }

  return { email, name, avatarUrl, providerId };
}

function sanitizeUser(
  user: typeof usersTable.$inferSelect
): UserWithoutPassword {
  const { password, ...userWithoutPassword } = user as typeof user & {
    password?: string;
  };
  return userWithoutPassword as UserWithoutPassword;
}

function getProviderFields(provider: OAuthProvider) {
  return {
    idField: provider === 'google' ? 'google_id' : 'facebook_id',
    loginMethod: provider === 'google' ? 'google_oauth' : 'facebook_oauth',
  } as const;
}

export async function handleOAuthLogin(
  provider: OAuthProvider,
  profile: any,
  _req: Request
): Promise<OAuthResponse> {
  try {
    const { email, name, avatarUrl, providerId } = extractProfileData(
      provider,
      profile
    );

    const { idField, loginMethod } = getProviderFields(provider);

    // Check by provider ID
    let existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable[idField], providerId))
      .limit(1)
      .then(rows => rows[0]);

    // Check by email if not found
    if (!existingUser) {
      existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .then(rows => rows[0]);

      if (existingUser) {
        // Link OAuth to existing account
        await db
          .update(usersTable)
          .set({
            [idField]: providerId,
            avatar_url: existingUser.avatar_url || avatarUrl,
            updated_at: new Date(),
          })
          .where(eq(usersTable.id, existingUser.id));

        existingUser = { ...existingUser, [idField]: providerId };
      }
    }

    let user: typeof usersTable.$inferSelect;

    if (existingUser) {
      if (existingUser.is_banned) {
        throw new Error('Account suspended. Contact support.');
      }

      if (existingUser.deleted_at) {
        throw new Error('Account deleted. Contact support to restore.');
      }

      user = existingUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name,
          email,
          [idField]: providerId,
          login_method: loginMethod,
          avatar_url: avatarUrl,
          is_active: true,
          role: 'user',
        })
        .returning();

      if (!newUser) {
        throw new Error('Failed to create user account');
      }

      user = newUser;
    }

    // Generate tokens
    const { accessToken } = await JWT.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar_url: user.avatar_url,
      onboarding: user.onboarding,
    });

    return {
      accessToken,
      user: sanitizeUser(user),
    };
  } catch (error: any) {
    console.error(`OAuth login error for ${provider}:`, error);

    if (
      error.message.includes('email') ||
      error.message.includes('banned') ||
      error.message.includes('deleted') ||
      error.message.includes('suspended')
    ) {
      throw error;
    }

    throw new Error('Authentication failed. Please try again.');
  }
}
