import { pgTable, uuid, text, integer, timestamp, time } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone').unique(),
  noShowCount: integer('no_show_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const facilities = pgTable('facilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  streetAddress: text('street_address').notNull(),
  barangay: text('barangay').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  minDuration: integer('min_duration').notNull().default(60),
  maxDuration: integer('max_duration').notNull().default(180),
  increment: integer('increment').notNull().default(30),
  openTime: time('open_time').notNull().default('06:00'),
  closeTime: time('close_time').notNull().default('22:00'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
