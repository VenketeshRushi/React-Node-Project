import { config } from '@/config/index.js';
import type { Response, CookieOptions } from 'express';

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  const isProd = config.app.nodeEnv === 'production';

  // Base cookie settings
  const baseOptions: CookieOptions = {
    path: '/',
    httpOnly: true, // default to httpOnly
    secure: isProd, // secure only in production
    sameSite: isProd ? 'none' : 'lax', // none in prod for cross‑site, lax in dev
  };

  // Merge defaults with any specific options passed
  const finalOptions: CookieOptions = {
    ...baseOptions,
    ...options,
  };

  // If user explicitly uses sameSite none, enforce secure in production
  if (finalOptions.sameSite === 'none' && isProd) {
    finalOptions.secure = true;
  }

  res.cookie(name, value, finalOptions);
};

export const clearAllCookies = (res: Response): void => {
  const isProd = config.app.nodeEnv === 'production';
  const baseClearOpts: CookieOptions = {
    path: '/',
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  const cookies = ['accessToken', 'user'];
  cookies.forEach(name => {
    // clear both httpOnly true and false to be safe
    res.clearCookie(name, { ...baseClearOpts, httpOnly: true });
    res.clearCookie(name, { ...baseClearOpts, httpOnly: false });
  });
};
