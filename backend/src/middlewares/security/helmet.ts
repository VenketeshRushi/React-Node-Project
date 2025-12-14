import { config } from '@/config/index.js';
import helmet from 'helmet';

const isProduction = config.app.nodeEnv === 'production';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: isProduction
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            ...(config.app.backendUrl ? [config.app.backendUrl] : []),
            'https://accounts.google.com', // Google OAuth authorization
            'https://oauth2.googleapis.com', // Google OAuth token exchange
            'https://www.googleapis.com', // Google APIs
          ],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
          blockAllMixedContent: [],
        },
        reportOnly: false,
      }
    : false,

  crossOriginEmbedderPolicy: false,

  crossOriginResourcePolicy: { policy: 'same-site' },

  // Allow popups for OAuth (Google opens in popup/redirect)
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});
