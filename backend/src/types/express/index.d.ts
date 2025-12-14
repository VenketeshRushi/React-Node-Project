import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string; // this is request id
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        onboarding?: boolean;
        avatar_url?: string | null;
      };
    }
  }
}

export {};
