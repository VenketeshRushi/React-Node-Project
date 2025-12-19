import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { usersTable } from './users.model.js';

export const sessionsTable = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    token_hash: varchar('token_hash', { length: 255 }).notNull().unique(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    revoked_at: timestamp('revoked_at', { withTimezone: true }),
    user_agent: varchar('user_agent', { length: 500 }),
    ip_address: varchar('ip_address', { length: 45 }),
    created_at: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  t => [
    index('sessions_user_id_idx').on(t.user_id),
    index('sessions_token_hash_idx').on(t.token_hash),
    index('sessions_expires_at_idx').on(t.expires_at),
  ]
);
