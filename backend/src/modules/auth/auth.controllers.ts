import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { handleOAuthLogin } from '@/modules/auth/auth.services.js';
import {
  storeRefreshToken,
  validateAndGetUser,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '@/modules/auth/refreshToken.services.js';
import { setCookie } from '@/utils/cookies.js';
import { config } from '@/config/index.js';
import { UnauthorizedError, ValidationError } from '@/utils/CustomError.js';
import { sendSuccess } from '@/utils/response.js';
import JWT from '@/utils/jwt.js';

const googleClient = new OAuth2Client(
  config.oauth.google.clientId,
  config.oauth.google.clientSecret,
  config.oauth.google.callbackUrl
);

const isProduction = config.app.nodeEnv === 'production';

/**
 * Google OAuth Login
 */
export async function googleAuthCodeController(
  req: Request,
  res: Response
): Promise<void> {
  const { code, codeVerifier } = req.body;

  if (!code || !codeVerifier) {
    throw new ValidationError('Missing required parameters');
  }

  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)) {
    throw new ValidationError('Invalid request');
  }

  let tokens;
  try {
    const tokenResponse = await googleClient.getToken({
      code,
      redirect_uri: config.oauth.google.callbackUrl,
      codeVerifier,
    });
    tokens = tokenResponse.tokens;
  } catch (err: any) {
    throw new UnauthorizedError('Failed to exchange authorization code');
  }

  if (!tokens?.id_token) {
    throw new UnauthorizedError('No ID token received from Google');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.oauth.google.clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new UnauthorizedError('Failed to verify Google ID token');
  }

  if (!payload) {
    throw new UnauthorizedError('Invalid token payload');
  }

  const profile = {
    id: payload.sub,
    displayName: payload.name || '',
    name: {
      familyName: payload.family_name || '',
      givenName: payload.given_name || '',
    },
    emails: payload.email
      ? [{ value: payload.email, verified: payload.email_verified }]
      : [],
    photos: payload.picture ? [{ value: payload.picture }] : [],
    provider: 'google' as const,
    _raw: JSON.stringify(payload),
    _json: payload,
  };

  let result;
  try {
    result = await handleOAuthLogin('google', profile as any, req);
  } catch (err: any) {
    throw new UnauthorizedError(
      err.message || 'Authentication failed. Please try again.'
    );
  }

  // Store refresh token in database
  await storeRefreshToken(result.user.id, result.refreshToken, req);

  // Set cookies
  setCookie(res, 'accessToken', result.accessToken, {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: isProduction,
    secure: isProduction,
    sameSite: 'lax',
  });

  setCookie(res, 'refreshToken', result.refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: isProduction,
    secure: isProduction,
    sameSite: 'lax',
  });

  setCookie(
    res,
    'user',
    JSON.stringify({
      id: result.user.id,
      role: result.user.role,
      name: result.user.name,
      email: result.user.email,
      avatar_url: result.user.avatar_url,
      onboarding: result.user.onboarding,
    }),
    {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
    }
  );

  sendSuccess(res, result.user, {
    message: 'Login successful',
    statusCode: 200,
  });
}

/**
 * Refresh Access Token
 */
export async function refreshTokenController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token required');
  }

  try {
    // Validate token and get user
    const { user } = await validateAndGetUser(refreshToken);

    // Revoke old refresh token (token rotation for security)
    await revokeRefreshToken(refreshToken);

    // Generate new token pair
    const newTokens = await JWT.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      onboarding: user.onboarding,
      is_active: user.is_active,
      is_banned: user.is_banned,
    });

    // Store new refresh token
    await storeRefreshToken(user.id, newTokens.refreshToken, req);

    // Set new cookies
    setCookie(res, 'accessToken', newTokens.accessToken, {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: 'lax',
    });

    setCookie(res, 'refreshToken', newTokens.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: isProduction,
      secure: isProduction,
      sameSite: 'lax',
    });

    // Update user cookie
    setCookie(
      res,
      'user',
      JSON.stringify({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        onboarding: user.onboarding,
      }),
      {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
      }
    );

    sendSuccess(
      res,
      {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      },
      {
        message: 'Token refreshed successfully',
        statusCode: 200,
      }
    );
  } catch (err: any) {
    throw new UnauthorizedError(
      err.message || 'Invalid or expired refresh token'
    );
  }
}

/**
 * Logout - Revoke current refresh token
 */
export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  // Revoke refresh token if present
  if (refreshToken) {
    try {
      await revokeRefreshToken(refreshToken);
    } catch (err) {
      // Continue with logout even if revocation fails
      console.error('Failed to revoke refresh token:', err);
    }
  }

  // Clear cookies
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  res.clearCookie('user', { path: '/' });

  sendSuccess(res, undefined, {
    message: 'Logged out successfully',
    statusCode: 200,
  });
}

/**
 * Logout from all devices - Revoke all refresh tokens
 */
export async function logoutAllDevicesController(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    await revokeAllUserTokens(userId);
  } catch (err) {
    console.error('Failed to revoke all tokens:', err);
  }

  // Clear cookies
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  res.clearCookie('user', { path: '/' });

  sendSuccess(res, undefined, {
    message: 'Logged out from all devices successfully',
    statusCode: 200,
  });
}
