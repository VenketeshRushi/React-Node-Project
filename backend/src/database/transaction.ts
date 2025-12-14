import type { NodePgTransaction } from 'drizzle-orm/node-postgres';
import { db } from './connection.js';
import { logger } from '@/services/logging/logger.js';

/**
 * Wraps a callback in a database transaction.
 * Automatically commits if successful, rolls back if an error occurs.
 *
 * @param callback - Function to execute within the transaction
 * @returns Result of the callback
 */
export const withTransaction = async <T>(
  callback: (tx: NodePgTransaction<any, any>) => Promise<T>
): Promise<T> => {
  try {
    return await db.transaction(async tx => {
      return await callback(tx);
    });
  } catch (error) {
    logger.error('Database transaction failed', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};
