import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { handleOAuthLogin } from '@/modules/auth/auth.service.js';
import { setCookie } from '@/utils/cookies.js';
import { config } from '@/config/index.js';
import {
  BadRequestError,
  UnauthorizedError,
  InternalError,
} from '@/utils/CustomError.js';
import { sendSuccess } from '@/utils/response.js';

const googleClient = new OAuth2Client(
  config.oauth.google.clientId,
  config.oauth.google.clientSecret,
  config.oauth.google.callbackUrl
);

const isProduction = config.app.nodeEnv === 'production';

/**
 * Handle Google OAuth callback with PKCE verification
 * - Client sends: authorization code + code_verifier
 * - Google verifies: SHA256(code_verifier) matches stored code_challenge
 * - Server validates: ID token signature and claims
 */
export async function googleAuthCodeController(
  req: Request,
  res: Response
): Promise<void> {
  const { code, codeVerifier } = req.body;

  // Validate required parameters
  if (!code || !codeVerifier) {
    throw new BadRequestError(
      'Missing required parameters: code and codeVerifier'
    );
  }

  // Validate code_verifier format (base64url, 43-128 chars)
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)) {
    throw new BadRequestError('Invalid code_verifier format');
  }

  // Exchange authorization code for tokens
  // Google automatically verifies PKCE: sha256(codeVerifier) == code_challenge
  let tokens;
  try {
    const tokenResponse = await googleClient.getToken({
      code,
      redirect_uri: config.oauth.google.callbackUrl,
      codeVerifier, // Google verifies this against the code_challenge
    });
    tokens = tokenResponse.tokens;
  } catch (err: any) {
    console.error('Token exchange error:', err);

    if (err.message?.includes('invalid_grant')) {
      throw new UnauthorizedError('Authorization code expired or already used');
    }
    if (err.message?.includes('code_verifier')) {
      throw new UnauthorizedError('PKCE verification failed');
    }
    throw new InternalError('Failed to exchange authorization code', {
      cause: err?.message,
    });
  }

  if (!tokens?.id_token) {
    throw new UnauthorizedError('No ID token received from Google');
  }

  // Verify ID token signature and claims
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.oauth.google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new UnauthorizedError('Invalid Google ID token');
  }

  // Extract user profile from ID token
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

  // Create or update user in database, generate JWT
  const result = await handleOAuthLogin('google', profile as any, req);

  // Set access token cookie with security flags
  setCookie(res, 'accessToken', result.accessToken, {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: false, // Set to true in production for better security
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax', // CSRF protection
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
      httpOnly: false, // Frontend needs to read this
      secure: isProduction,
      sameSite: 'lax',
    }
  );

  sendSuccess(res, 200, 'Login successful', result.user);
}

export async function logoutController(
  _req: Request,
  res: Response
): Promise<void> {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('user', { path: '/' });
  sendSuccess(res, 200, 'Logged out successfully');
}
