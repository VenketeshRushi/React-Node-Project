import type { Server } from 'http';
import { config } from '@/config/index.js';
import app from '@/app.js';
import { logger } from '@/services/logging/logger.js';
import {
  checkAllConnections,
  getDetailedHealthStatus,
} from '@/services/health.service.js';
import { shutdownPool } from '@/database/connection.js';
import { shutdownRedis } from '@/services/redis/redis.client.js';
import { retry } from '@/utils/retry.js';

interface ShutdownStep {
  name: string;
  fn: () => Promise<void>;
}

let isShuttingDown = false;
const activeConnections = new Set<any>();

const connectToServices = async (): Promise<boolean> => {
  try {
    return await retry(
      async () => {
        logger.info('Attempting to connect to services...');
        const result = await checkAllConnections();
        const failedServices = Object.entries(result)
          .filter(([_, ok]) => !ok)
          .map(([name]) => name);

        if (failedServices.length > 0) {
          throw new Error(`Failed services: ${failedServices.join(', ')}`);
        }

        const health = await getDetailedHealthStatus();
        logger.info('All required services connected successfully', {
          postgres: health.postgres.status,
          redis: health.redis.status,
        });

        return true;
      },
      { retries: 5, delay: 10000, backoff: true, jitter: true }
    );
  } catch (err) {
    const error = err as Error;
    logger.error('Could not connect to services after retries', {
      error: error.message,
      retries: 5,
    });
    return false;
  }
};

const shutdown = async (signal: string, server?: Server): Promise<void> => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal', { signal });
    return;
  }

  isShuttingDown = true;
  logger.warn(`Received ${signal} signal. Starting graceful shutdown...`);

  const shutdownTimeout = 30000;
  const forcedExit = setTimeout(() => {
    logger.error('Shutdown taking too long. Forcing exit.', {
      activeConnections: activeConnections.size,
    });
    process.exit(1);
  }, shutdownTimeout);

  let exitCode = 0;

  try {
    const shutdownSteps: ShutdownStep[] = [];

    if (server) {
      shutdownSteps.push({
        name: 'HTTP Server',
        fn: () =>
          new Promise<void>((resolve, reject) => {
            server.close(err => {
              if (err) {
                logger.error('Error closing HTTP server', {
                  error: err.message,
                });
                reject(err);
              } else {
                logger.info('HTTP server stopped accepting new connections');
                resolve();
              }
            });

            // Wait for active connections to complete
            const connectionCheckInterval = setInterval(() => {
              if (activeConnections.size === 0) {
                clearInterval(connectionCheckInterval);
              }
            }, 100);

            // Force close after timeout is handled by forcedExit
          }),
      });
    }

    shutdownSteps.push(
      { name: 'PostgreSQL Pool', fn: shutdownPool },
      { name: 'Redis Client', fn: shutdownRedis }
    );

    for (const step of shutdownSteps) {
      try {
        logger.info(`Closing ${step.name}...`);
        await step.fn();
        logger.info(`${step.name} closed successfully`);
      } catch (error) {
        const err = error as Error;
        logger.error(`Error closing ${step.name}`, { error: err.message });
        exitCode = 1;
      }
    }

    if (exitCode === 0) {
      logger.info('All services closed gracefully');
    } else {
      logger.warn('Shutdown completed with errors', { exitCode });
    }
  } catch (error) {
    const err = error as Error;
    logger.error('Unexpected error during shutdown', { error: err.message });
    exitCode = 1;
  } finally {
    clearTimeout(forcedExit);
    process.exit(exitCode);
  }
};

const startServer = async (): Promise<void> => {
  let server: Server | undefined;

  try {
    logger.info(`Server process ${process.pid} initializing...`);

    // Register signal handlers early, before server starts
    const handleShutdown = (signal: string) => {
      shutdown(signal, server);
    };

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.removeAllListeners(signal);
      process.on(signal, () => handleShutdown(signal));
    });

    process.removeAllListeners('uncaughtException');
    process.on('uncaughtException', async (err: Error) => {
      logger.error('Uncaught exception', {
        processId: process.pid,
        error: err.message,
        stack: err.stack,
      });
      await shutdown('uncaughtException', server);
    });

    process.removeAllListeners('unhandledRejection');
    process.on('unhandledRejection', async (reason: unknown) => {
      logger.error('Unhandled rejection', {
        processId: process.pid,
        reason: String(reason),
      });
      await shutdown('unhandledRejection', server);
    });

    const connected = await connectToServices();
    if (!connected) {
      logger.error('Could not connect to required services. Exiting.');
      process.exit(1);
    }

    server = app.listen(config.app.port, config.app.host, () => {
      logger.info('HTTP server started', {
        processId: process.pid,
        url: `http://${config.app.host}:${config.app.port}`,
        host: config.app.host,
        port: config.app.port,
        environment: config.app.nodeEnv,
      });
    });

    // Track active connections for graceful shutdown
    server.on('connection', (connection: any) => {
      activeConnections.add(connection);
      connection.on('close', () => {
        activeConnections.delete(connection);
      });
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error('Port already in use', {
          processId: process.pid,
          port: config.app.port,
          error: err.message,
        });
      } else {
        logger.error('Server error', {
          processId: process.pid,
          error: err.message,
        });
      }
      process.exit(1);
    });

    server.timeout = 30000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    logger.info('Server startup completed successfully', {
      processId: process.pid,
      port: config.app.port,
      host: config.app.host,
      nodeVersion: process.version,
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to start server', {
      processId: process.pid,
      error: err.message,
      stack: err.stack,
    });
    if (server) {
      await shutdown('startup-error', server);
    } else {
      process.exit(1);
    }
  }
};

startServer();
