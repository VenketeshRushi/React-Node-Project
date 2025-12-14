import { pool } from '@/database/connection.js';
import { redisClient } from '@/services/redis/redis.client.js';
import { logger } from '@/services/logging/logger.js';

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message?: string;
  details?: any;
}

interface HealthCheckResult {
  postgres: ServiceHealth;
  redis: ServiceHealth;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

const thresholds = {
  postgres: 100,
  redis: 50,
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
};

export const checkPostgresHealth = async (): Promise<ServiceHealth> => {
  const start = Date.now();
  try {
    const healthCheck = async () => {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
      } finally {
        client.release();
      }
    };

    await withTimeout(healthCheck(), 2000);

    const responseTime = Date.now() - start;
    return {
      status: responseTime < thresholds.postgres ? 'healthy' : 'degraded',
      responseTime,
      message: 'Connected',
      details: {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount,
      },
    };
  } catch (error: any) {
    logger.error('PostgreSQL health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error.message || 'Connection failed',
    };
  }
};

export const checkRedisHealth = async (): Promise<ServiceHealth> => {
  const start = Date.now();
  try {
    const result = await withTimeout(redisClient.ping(), 2000);
    const responseTime = Date.now() - start;

    if (result !== 'PONG') throw new Error('Invalid PING response');

    return {
      status: responseTime < thresholds.redis ? 'healthy' : 'degraded',
      responseTime,
      message: 'Connected',
      details: {
        mode: redisClient.mode,
        status: redisClient.status,
      },
    };
  } catch (error: any) {
    logger.error('Redis health check failed', { error: error.message });
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error.message || 'Connection failed',
    };
  }
};

export const getDetailedHealthStatus = async (): Promise<HealthCheckResult> => {
  const [postgres, redis] = await Promise.all([
    checkPostgresHealth(),
    checkRedisHealth(),
  ]);

  const statuses = [postgres.status, redis.status];
  const hasUnhealthy = statuses.includes('unhealthy');
  const hasDegraded = statuses.includes('degraded');

  const overall = hasUnhealthy
    ? 'unhealthy'
    : hasDegraded
      ? 'degraded'
      : 'healthy';

  return { postgres, redis, overall };
};

export const checkAllConnections = async (): Promise<
  Record<string, boolean>
> => {
  const health = await getDetailedHealthStatus();
  return {
    postgres: health.postgres.status !== 'unhealthy',
    redis: health.redis.status !== 'unhealthy',
  };
};
