import { logger } from '@/services/logging/logger.js';

export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: boolean;
    jitter?: boolean;
  } = {}
): Promise<T> => {
  const { retries = 3, delay = 1000, backoff = true, jitter = true } = options;

  for (let i = 0; i < retries; i++) {
    try {
      if (i > 0) {
        logger.info('Retry attempt', { attempt: i, maxRetries: retries });
      }
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) {
        throw error;
      }

      let waitTime = backoff ? delay * Math.pow(2, i) : delay;
      if (jitter) {
        const randomFactor = Math.random() * 0.5 + 0.75;
        waitTime = waitTime * randomFactor;
      }

      logger.warn('Retry attempt failed', {
        attempt: i + 1,
        maxRetries: retries,
        error: error.message,
        nextRetryIn: Math.round(waitTime),
      });

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Retry failed');
};
