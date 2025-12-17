import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      /**
       * Unique request identifier
       */
      id?: string;

      /**
       * Authenticated user information
       */
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        onboarding?: boolean;
        avatar_url?: string | null;
      };

      /**
       * Raw request body buffer (for webhooks)
       */
      rawBody?: Buffer;
    }

    interface Response {
      /**
       * Cache-related data stored by middleware
       */
      locals: {
        cacheKey?: string;
        cachePrefix?: string;
        cacheTTL?: number;
        [key: string]: any;
      };
    }
  }
}

export {};
