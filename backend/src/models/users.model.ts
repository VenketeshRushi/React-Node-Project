import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const UserRoleEnum = pgEnum('user_role', [
  'user',
  'admin',
  'superadmin',
]);

export const LoginMethodEnum = pgEnum('login_method', [
  'email_password',
  'google_oauth',
  'facebook_oauth',
]);

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  mobile_no: varchar('mobile_no', { length: 15 }).unique(),
  google_id: varchar('google_id', { length: 100 }).unique(),
  facebook_id: varchar('facebook_id', { length: 100 }).unique(),

  login_method: LoginMethodEnum('login_method')
    .notNull()
    .default('google_oauth'),
  role: UserRoleEnum('role').notNull().default('user'),
  // Onboarding state
  onboarding: boolean('onboarding').notNull().default(true),

  // Enterprise fields
  profession: varchar('profession', { length: 100 }),
  company: varchar('company', { length: 150 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  language: varchar('language', { length: 10 }).default('en'),

  avatar_url: varchar('avatar_url', { length: 500 }),
  is_active: boolean('is_active').notNull().default(false),
  is_banned: boolean('is_banned').notNull().default(false),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
  deleted_by: uuid('deleted_by'),
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});
