import dotenv from 'dotenv';
import pg from 'node_modules/@types/pg/index.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

const { Client } = pg;

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set in env');
}

const resetDatabase = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Resetting database...');
    console.log('WARNING: This will delete all data!');

    await client.connect();
    console.log('Connected to database');

    const db = drizzle(client);

    // Drop all tables and recreate schema
    console.log('Dropping all tables...');
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

    console.log('Database reset successfully!');
    console.log('\nNext steps:');
    console.log('   1. Run: npm run db:generate (if schema changed)');
    console.log('   2. Run: npm run db:migrate');
    console.log('   3. Run: npm run db:seed');
    console.log('\nOr use: npm run db:fresh (does all steps)');
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

resetDatabase();
