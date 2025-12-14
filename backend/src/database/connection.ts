import { config } from '@/config/index.js';
import { logger } from '@/services/logging/logger.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, DatabaseError } from 'pg';
import { Logger as DrizzleLogger } from 'drizzle-orm/logger';

class WinstonDrizzleLogger implements DrizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    logger.debug('Drizzle SQL query', {
      query,
      params: JSON.stringify(params),
    });
  }
}

const pool = new Pool(config.database);

pool.on('connect', () => logger.info('PostgreSQL client connected to pool'));
pool.on('acquire', () => logger.debug('PostgreSQL client acquired from pool'));
pool.on('remove', () => logger.debug('PostgreSQL client removed from pool'));
pool.on('error', (err: Error) => {
  const dbError = err as DatabaseError;
  logger.error('PostgreSQL pool error', {
    message: dbError.message,
    code: dbError.code,
    stack: config.app.nodeEnv === 'development' ? dbError.stack : undefined,
  });
});

export const shutdownPool = async (): Promise<void> => {
  try {
    logger.info('Closing PostgreSQL pool...');
    await pool.end();
    logger.info('PostgreSQL pool closed successfully');
  } catch (error) {
    const e = error as Error;
    logger.error('Error closing PostgreSQL pool', {
      message: e.message,
      stack: e.stack,
    });
  }
};

const drizzleLoggerOption =
  config.app.nodeEnv === 'development' ? new WinstonDrizzleLogger() : false;
const db = drizzle(pool, { logger: drizzleLoggerOption });

export { pool, db };
