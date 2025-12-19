import { defineConfig, type Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set in env');
}

export default defineConfig({
  out: './migrations',
  dialect: 'postgresql',
  schema: './src/models/**/*.model.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  migrations: {
    table: '__drizzle_migrations__',
    schema: 'public',
  },
}) satisfies Config;
