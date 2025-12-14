import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'node_modules/@types/pg/index.js';
import bcrypt from 'bcrypt';
import { usersTable } from '@/models/users.model.js';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set in env');
}

const seedDatabase = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Starting database seeding...');
    await client.connect();
    console.log('Connected to database');

    // Check if the users table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'users'
      ) AS exists;
    `;
    const checkResult = await client.query(tableCheckQuery);
    const tableExists = checkResult.rows[0]?.exists;

    if (!tableExists) {
      console.error(
        "The 'users' table does not exist. Please run migrations before seeding."
      );
      process.exit(1);
    }

    const db = drizzle(client);
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // Check if any record already present
    const existing = await db.select().from(usersTable).limit(1);
    if (existing.length > 0) {
      console.warn(
        'Database already seeded (users present). Skipping seeding.'
      );
      return;
    }

    console.log('Inserting seed users...');
    await db.insert(usersTable).values([
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        mobile_no: '+1234567890',
        role: 'superadmin',
        is_active: true,
        is_banned: false,
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        mobile_no: '+1234567891',
        role: 'admin',
        is_active: true,
        is_banned: false,
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        mobile_no: '+1234567892',
        role: 'user',
        is_active: true,
        is_banned: false,
      },
    ]);

    console.log('Seeding completed successfully.');
    console.log('Default credentials:');
    console.log('  Super Admin: superadmin@example.com / Password@123');
    console.log('  Admin: admin@example.com / Password@123');
    console.log('  User: john.doe@example.com / Password@123');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
};

seedDatabase();
