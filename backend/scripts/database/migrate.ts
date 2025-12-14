import dotenv from 'dotenv';
import fs from 'fs';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const MIGRATIONS_FOLDER = './migrations';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set in env');
}

const runMigrations = async () => {
  if (!fs.existsSync(MIGRATIONS_FOLDER)) {
    console.error(`Migrations folder not found: ${MIGRATIONS_FOLDER}`);
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Connecting to PostgreSQL for migrations...');
    await client.connect();
    console.log('Connected successfully');

    const db = drizzle(client);
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
};

runMigrations();
