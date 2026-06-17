import { pgTable, uuid, text, integer, timestamp, time, date } from 'drizzle-orm/pg-core'

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

export const courts = pgTable('courts', {
  id: uuid('id').primaryKey().defaultRandom(),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const pricingRules = pgTable('pricing_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  facilityId: uuid('facility_id').notNull().references(() => facilities.id),
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday. Null means applies to all days.
  dayOfWeek: integer('day_of_week'),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  // Price in centavos (e.g. 50000 = ₱500.00) to avoid floating point issues
  pricePerSlot: integer('price_per_slot').notNull(),
  // Higher priority wins when multiple rules overlap
  priority: integer('priority').notNull().default(0),
  activeFrom: date('active_from'),
  activeUntil: date('active_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
