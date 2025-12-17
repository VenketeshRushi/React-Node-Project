import { config } from '@/config/index.js';
import helmet from 'helmet';

const isProduction = config.app.nodeEnv === 'production';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: isProduction
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in future
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            ...(config.app.backendUrl ? [config.app.backendUrl] : []),
            'https://accounts.google.com', // Google OAuth authorization
            'https://oauth2.googleapis.com', // Google OAuth token exchange
            'https://www.googleapis.com', // Google APIs
          ].filter(Boolean),
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
    : false, // Disable in development for easier debugging

  // Disable COEP as it can break OAuth popups and cross-origin resources
  crossOriginEmbedderPolicy: false,

  // Allow same-site resources
  crossOriginResourcePolicy: {
    policy: 'same-site',
  },

  // Allow popups for OAuth (Google opens in popup/redirect)
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups',
  },

  // Prevent DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security (only in production)
  hsts: isProduction
    ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // Prevent IE from opening untrusted HTML
  ieNoOpen: true,

  // Prevent MIME type sniffing
  noSniff: true,

  // Enable origin agent cluster
  originAgentCluster: true,

  // Restrict Adobe products' access
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Enable XSS filter
  xssFilter: true,
});
