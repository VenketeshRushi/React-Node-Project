import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { handleOAuthLogin } from '@/modules/auth/auth.service.js';
import { setCookie } from '@/utils/cookies.js';
import { config } from '@/config/index.js';
import { UnauthorizedError, ValidationError } from '@/utils/CustomError.js';
import { sendSuccess } from '@/utils/response.js';

const googleClient = new OAuth2Client(
  config.oauth.google.clientId,
  config.oauth.google.clientSecret,
  config.oauth.google.callbackUrl
);

const isProduction = config.app.nodeEnv === 'production';

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
    throw new UnauthorizedError();
  }

  if (!tokens?.id_token) {
    throw new UnauthorizedError();
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.oauth.google.clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new UnauthorizedError();
  }

  if (!payload) {
    throw new UnauthorizedError();
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
  } catch (err) {
    throw new UnauthorizedError();
  }

  setCookie(res, 'accessToken', result.accessToken, {
    maxAge: 1000 * 60 * 60 * 24,
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
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: false,
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
