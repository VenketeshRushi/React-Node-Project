import { Redis } from 'ioredis';
import { logger } from '@/services/logging/logger.js';
import { config } from '@/config/index.js';

export const redisClient = new Redis({
  ...config.redis,
  retryStrategy: times => Math.min(times * 50, 2000),
});

let lastReconnectLog = 0;

redisClient.on('connect', () => logger.info('Connected to Redis'));
redisClient.on('ready', () => logger.info('Redis ready'));
redisClient.on('error', err =>
  logger.error('Redis error', { message: err.message, stack: err.stack })
);
redisClient.on('close', () => logger.warn('Redis connection closed'));
redisClient.on('reconnecting', (delay: number, attempt: number) => {
  const now = Date.now();
  if (now - lastReconnectLog > 5000) {
    logger.warn(`Redis reconnecting in ${delay}ms (attempt ${attempt})`);
    lastReconnectLog = now;
  }
});

export const shutdownRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'end') {
      logger.info('Closing Redis connection...');
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (err) {
    const e = err as Error;
    logger.error('Error shutting down Redis', {
      message: e.message,
      stack: e.stack,
    });
  }
};
