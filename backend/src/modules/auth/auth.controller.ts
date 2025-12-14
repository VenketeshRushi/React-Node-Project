import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

import { handleOAuthLogin } from '@/modules/auth/auth.service.js';
import { setCookie } from '@/utils/cookies.js';
import { config } from '@/config/index.js';
import { verifyCodeChallenge } from '@/utils/pkce.js';
import { storePKCEChallenge, consumePKCEChallenge } from '@/utils/pkceStore.js';

import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
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
 * Initialize PKCE flow
 * Receives code_challenge from frontend, generates random state, stores in Redis
 */
export async function initPKCEFlow(req: Request, res: Response): Promise<void> {
  const { codeChallenge } = req.body;

  if (!codeChallenge) {
    throw new BadRequestError('code_challenge is required');
  }

  // Validate code_challenge format (base64url, 43-128 chars)
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge)) {
    throw new ValidationError('Invalid code_challenge format');
  }

  // Generate cryptographically secure random state
  const state = crypto.randomBytes(32).toString('hex');
  const expiresIn = 600; // 10 minutes

  // Store in Redis with TTL
  await storePKCEChallenge(state, codeChallenge, expiresIn);

  sendSuccess(res, 200, 'PKCE initialized', {
    state,
    expiresIn,
  });
}

/**
 * Handle Google OAuth callback
 * Verifies PKCE, exchanges authorization code for tokens, creates/updates user
 */
export async function googleAuthCodeController(
  req: Request,
  res: Response
): Promise<void> {
  const { code, codeVerifier, state, nonce } = req.body;

  // Validate required parameters
  if (!code || !codeVerifier || !state) {
    throw new BadRequestError('Missing required parameters');
  }

  // Validate code_verifier format (base64url, 43-128 chars)
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)) {
    throw new ValidationError('Invalid code_verifier format');
  }

  // Retrieve and delete PKCE challenge from Redis (one-time use)
  const pkceData = await consumePKCEChallenge(state);

  if (!pkceData) {
    throw new UnauthorizedError('Invalid or expired PKCE state');
  }

  // Verify PKCE: hash(codeVerifier) must equal stored codeChallenge
  if (!verifyCodeChallenge(codeVerifier, pkceData.codeChallenge)) {
    throw new UnauthorizedError('PKCE verification failed');
  }

  // Exchange authorization code for tokens
  let tokens;
  try {
    const tokenResponse = await googleClient.getToken({
      code,
      redirect_uri: config.oauth.google.callbackUrl,
      codeVerifier, // Google will verify this against code_challenge
    });
    tokens = tokenResponse.tokens;
  } catch (err: any) {
    if (err.message?.includes('invalid_grant')) {
      throw new UnauthorizedError('Authorization code expired or already used');
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

  // Validate nonce if provided (OpenID Connect CSRF protection)
  // Prevents token replay attacks
  if (nonce) {
    if (!payload.nonce) {
      throw new UnauthorizedError('Nonce expected but not found in ID token');
    }
    if (payload.nonce !== nonce) {
      throw new UnauthorizedError(
        'Nonce mismatch - possible token replay attack'
      );
    }
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
  // httpOnly: true prevents XSS attacks from stealing token
  // secure: true ensures cookie only sent over HTTPS in production
  // sameSite: 'lax' provides CSRF protection
  setCookie(res, 'accessToken', result.accessToken, {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: false, // CRITICAL: Prevents JavaScript access in production and create logout api
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
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 days
      httpOnly: false, // Frontend needs to read this
      secure: isProduction,
      sameSite: 'lax',
    }
  );

  sendSuccess(res, 200, 'Login successful', result.user);
}

/**
 * Get current authenticated user
 * Requires authentication middleware to populate req.user
 */
export async function meController(req: Request, res: Response) {
  const user = req?.user;

  sendSuccess(res, 200, 'Authenticated user', {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    role: user?.role,
    avatar_url: user?.avatar_url,
    onboarding: user?.onboarding,
  });
}
