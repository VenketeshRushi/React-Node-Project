import type { Request, Response, NextFunction } from 'express';
import { config } from '@/config/index.js';

export const permissionsPolicyMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowedOrigins = [
    config.app.frontendUrl,
    // if dev, also localhost
    ...(config.app.nodeEnv !== 'production'
      ? [config.app.frontendUrl]
      : [
          config.app.frontendUrl,
          'http://localhost:5173',
          'http://192.168.1.3:5173',
        ]),
  ].filter(Boolean);

  const identityPolicy = allowedOrigins.join(' ');

  res.setHeader(
    'Permissions-Policy',
    [
      `identity-credentials-get=(${identityPolicy})`,
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  );
  next();
};
