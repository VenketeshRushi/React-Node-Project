import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import hpp from 'hpp';

import { config } from './config/index.js';
import { logger } from './services/logging/logger.js';
import { ensureUploadDirs } from './services/storage/multer.storage.js';

import { helmetMiddleware } from './middlewares/security/helmet.js';
import { permissionsPolicyMiddleware } from './middlewares/security/permissionsPolicy.js';
import { corsMiddleware } from './middlewares/security/cors.js';
import { compressionMiddleware } from './middlewares/compression.js';
import { requestLogger } from './middlewares/logging/requestLogger.js';
import { rateLimiter } from './middlewares/security/rateLimiter.js';

import { NotFoundError } from './utils/CustomError.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { getDetailedHealthStatus } from './services/health.service.js';
import { cacheMiddleware } from './middlewares/cache.js';

import authRouter from './modules/auth/auth.routes.js';

const app: Express = express();

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info('Created logs directory', { path: logsDir });
}

ensureUploadDirs();

// Security and proxy settings
app.set('trust proxy', 1);
app.disable('x-powered-by');

// GLOBAL SECURITY MIDDLEWARE (Order matters!)
app.use(helmetMiddleware);
app.use(permissionsPolicyMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter('global'));
app.use(
  hpp({
    whitelist: [
      'filter',
      'sort',
      'limit',
      'offset',
      'page',
      'fields',
      'search',
      'q',
    ],
  })
);

// Helper to determine if raw body should be stored
const shouldStoreRawBody = (req: Request): boolean => {
  return (
    req.path.startsWith('/webhooks/') || req.path.startsWith('/api/webhooks/')
  );
};

// Body parsing middleware
app.use(
  express.json({
    limit: '1mb',
    type: ['application/json', 'application/json-patch+json'],
    verify: (req: Request, _res: Response, buf: Buffer) => {
      if (shouldStoreRawBody(req)) {
        (req as any).rawBody = buf;
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 100,
  })
);

app.use(cookieParser(config.app.cookieSecret));
app.use(compressionMiddleware);
app.use(requestLogger);

app.use('/api/auth', authRouter);

app.get(
  '/ping',
  cacheMiddleware({ prefix: 'ping', ttl: 30 }),
  (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
  }
);

// Health check routes
app.get(
  '/health',
  rateLimiter('health'),
  cacheMiddleware({ prefix: 'health', ttl: 10 }),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const startTime = Date.now();
      const health = await getDetailedHealthStatus();
      const totalResponseTime = Date.now() - startTime;

      const services = {
        postgres: { ...health.postgres },
        redis: { ...health.redis },
      };

      const statusCounts = {
        healthy: Object.values(services).filter(s => s.status === 'healthy')
          .length,
        degraded: Object.values(services).filter(s => s.status === 'degraded')
          .length,
        unhealthy: Object.values(services).filter(s => s.status === 'unhealthy')
          .length,
      };

      const getHealthMessage = (
        overall: string,
        counts: typeof statusCounts
      ): string => {
        if (overall === 'healthy') return 'All systems operational';
        if (overall === 'degraded')
          return `System degraded (${counts.degraded} service(s) with issues)`;
        return `System unhealthy (${counts.unhealthy} service(s) down)`;
      };

      const statusCode = health.overall === 'healthy' ? 200 : 503;
      const message = getHealthMessage(health.overall, statusCounts);

      res.status(statusCode).json({
        status: health.overall,
        message,
        services,
        statusCounts,
        responseTimeMs: totalResponseTime,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

app.get('/{*splat}', (_req: Request, _res: Response) => {
  throw new NotFoundError(
    'The endpoint you requested does not exist on this server.'
  );
});

app.use(errorHandler);

export default app;
