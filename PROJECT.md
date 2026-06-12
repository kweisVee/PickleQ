# PickleQ

A pickleball court booking and queueing system for the Philippines, starting in provincial markets.

---

## What it is

PickleQ is a SaaS that court owners pay for and players use to book courts. Owners configure their facility (number of courts, pricing, hours), and players reserve timeslots, invite friends, or join open games.

Initial target market: provincial Philippines (not Manila yet). Most players will pay via GCash or cash.

---

## Users

There are three user types:

1. **Players** — book courts, invite friends, join open games. Use the PWA on their phone.
2. **Court owners** — manage their facility, courts, pricing, walk-ins, and player flags. Use the web console (mobile or desktop).
3. **Walk-ins** — show up at a facility without a booking. Owner creates a booking for them on the spot. No account required.

---

## Tech stack

- **Next.js 15** — the core framework. Handles both frontend (React pages) and backend (API routes) in one project. Think Spring Boot + a frontend framework combined. One codebase, one deployment.
- **TypeScript** — the language used everywhere, frontend and backend. JavaScript with types — like Java's type system but for JS.
- **Tailwind CSS** — handles styling. You write utility classes directly on HTML elements (e.g. `className="bg-blue-500 p-4"`) instead of separate CSS files.
- **Drizzle** — the ORM. Like JPA/Hibernate in Spring Boot. Tables are defined as TypeScript objects and queried with a type-safe API instead of raw SQL strings.
- **Supabase Postgres** — managed Postgres database in the cloud. Supabase hosts it; we connect to it like any Postgres DB.
- **Supabase Auth** — handles login/signup (phone OTP, email magic link). Like Spring Security but fully managed externally. Does not touch our app's own database directly.
- **PayMongo** — Philippine payment gateway for GCash payments. Like Stripe but for the Philippines.
- **Resend** — sends emails (booking receipts, owner reports). Managed email service.
- **Semaphore** — Philippine SMS gateway. Used for OTP at signup and urgent reminders. Kept minimal because SMS costs money.
- **PWA web push** — real-time in-app notifications (e.g. someone joined your open game). Installable from the browser, no app store needed for v1.
- **Vercel** — hosting. Deploys Next.js apps natively.
- **Background jobs** — Inngest or Trigger.dev (TBD). For reminders, weekly payouts, and other async tasks.

The app is a **PWA (Progressive Web App)** — installable from the browser, no app store needed for v1. Mobile native (React Native) is planned for v2 once there's traction.

---

## Core features (v1)

### Booking

- Players see available timeslots per facility
- Owner configures `min_duration`, `max_duration`, and `increment` per facility (e.g. min 60 min, max 180 min, in 30-min increments)
- Player picks a timeslot, then picks a court (system pre-selects the least-used court that day to spread load, but player can change)
- Courts can be labeled by the owner (e.g. "Court 2 — covered", "Court 4 — near washroom")

### Booking types

- **Private** — booker invites specific friends by phone or email. Group is locked.
- **Open to join** — booker reserves a slot and marks it "open." Other players can request to join. Booker (or system, if configured) approves.
- **Walk-in** — owner creates the booking on-site for someone with no account. Just needs a name and optional phone.

### Pricing flexibility

Pricing is rule-based, not a single per-court price. Owners can configure:

- Peak vs off-peak (day of week + time range)
- Weekday vs weekend
- Seasonal pricing (active_from / active_until)
- Member vs non-member rates (later)
- Promo codes / discount modifiers

Schema: `pricing_rule` table with `day_of_week`, `start_time`, `end_time`, `price_per_slot`, `priority`, `active_from`, `active_until`.

### Payments

- **GCash deposit (default)** — small deposit holds the slot, balance paid at the counter
- **GCash full** — pay full amount upfront
- **Cash on arrival** — no upfront payment, player pays at the counter

Deposits and full GCash payments go through PayMongo. Cash is tracked manually by the owner when the player arrives.

### Cancellation policy

Owner-configurable per court. Default tiers:
- More than 24 hours before: full deposit refund
- 6–24 hours: 50% refund
- Less than 6 hours: deposit forfeited
- No-show: deposit forfeited + no-show count increments

### Check-in

**All check-ins happen at the counter, not in the app.**

- Owner sees today's bookings on their console
- When a player arrives, owner taps "Checked In"
- Owner collects cash at this moment if needed
- If 15 minutes pass after booking start with no check-in, owner gets an alert to mark as no-show or extend grace
- Owner is always the source of truth for attendance

### Trust and flags

Two independent systems:

1. **No-show counts** (global, per-user)
   - 2+ no-shows in 90 days → must pay a deposit to book
   - 4+ no-shows in 90 days → must pay full upfront
   - Simple counter for v1 — no fancy scoring algorithm yet

2. **Per-court flags** (scoped to one court/facility)
   - Owner can flag a player from their court at any time
   - Owner can unflag
   - A flagged player cannot book at that specific court
   - Other courts are unaffected
   - Stored in a `court_flag` table: `(court_id, user_id, owner_id, reason, created_at, active)`

### QR code

One static QR per facility, printed and displayed on-site.

- URL pattern: `pickleq.app/book/{facility_id}`
- Scanning lands the user on that facility's booking page
- That's it — one purpose: acquisition and quick booking
- No check-in QR, no payment QR (keep it simple for v1)

### Notifications

Three channels with clear jobs:

- **Email (Resend)** — booking receipts, owner reports, anything not time-sensitive
- **Push (PWA web push)** — real-time updates (someone joined your open game, invite accepted)
- **SMS (Semaphore)** — OTP at signup, "your booking starts in 1 hour" reminder, no-show alerts. Used sparingly because of cost.

---

## Features for later (v2+)

- Friends / social graph between players
- Play history and stats per user
- Discover feed of open games nearby (geo-based)
- Cost-splitting between participants (each pays their share via GCash)
- React Native mobile app
- Events and tournaments as a separate entity (in v1 events are just long bookings with a name)

---

## Key design decisions and reasoning

1. **Web (PWA) first, native later.** Booking is a low-frequency action. PWA gets users to install via a home-screen icon, no app store friction. React Native comes later once there's traction.

2. **Next.js for both frontend and backend.** One language (TypeScript), one deployment, shared types between client and server. Fast to ship.

3. **Drizzle over Prisma.** Closer to SQL, better serverless performance, cleaner for complex booking transactions. Plays well with Supabase.

4. **Supabase as managed Postgres only (mostly).** We use Supabase Auth for the auth flow (phone OTP and email), but we do NOT use Supabase's auto-generated REST API or RLS. All data access goes through our own backend (Next.js API routes) using Drizzle. This keeps the architecture flexible and not locked into Supabase patterns.

5. **No RLS, so authorization lives in code.** Every API route checks the user's identity and permissions explicitly. We centralize this with middleware/helpers (`requireUser`, `requireOwnerOf(facilityId)`) to avoid scattered checks. Integration tests verify "user A cannot access user B's resource."

6. **Check-in is owner-driven, not app-driven.** Players can't fake check-ins. Owner is the source of truth at the counter. Simpler, fewer disputes.

7. **Per-court flags separate from no-show counts.** A player can be banned from one court without affecting their standing elsewhere. Owners get full control over their own court.

8. **Pricing is rule-based, not a single price field.** Owners need flexibility from day one. Retrofitting this later is painful.

9. **Phone number is verified at signup but not the only login.** Users can also sign up with email. Phone OTP costs money, so we use it sparingly after signup.

10. **Booking creation must be atomic** to prevent double-booking. Use a Postgres transaction with an exclusion constraint on `(court_id, time_range)`.

11. **`users.id` is separate from `users.auth_id`.** Supabase Auth has its own internal `users` table we don't control. If we used Supabase's ID as our primary key, switching auth providers later would break every foreign key in our database. `id` is our internal PK; `auth_id` is just a lookup bridge: "given this Supabase login, find our user." Same reason you wouldn't use Google's user ID as your PK if integrating SSO.

---

## Project structure (planned)

```
pickleq/
├── src/
│   ├── app/
│   │   ├── (player)/         # player-facing pages
│   │   ├── (owner)/          # owner console pages
│   │   ├── book/[facilityId]/ # QR landing page
│   │   ├── api/              # backend API routes
│   │   └── layout.tsx
│   ├── components/           # shared React components
│   ├── lib/
│   │   ├── db/               # Drizzle schema and client
│   │   ├── auth/             # Supabase Auth helpers
│   │   ├── payments/         # PayMongo integration
│   │   ├── notifications/    # email, SMS, push dispatchers
│   │   └── services/         # business logic (booking, pricing, flags)
│   └── types/                # shared TypeScript types
├── drizzle/                  # migration files
├── public/
├── PROJECT.md                # this file
└── package.json
```

---

## Build order (rough plan)

1. Set up Drizzle and connect to Supabase Postgres
2. Define core schema: users, facilities, courts, pricing_rules
3. Set up Supabase Auth (phone OTP + email)
4. Build the owner console: create facility, add courts, set pricing
5. Build the player booking flow: see availability, pick slot, pick court
6. Add booking confirmation, deposit payment via PayMongo
7. Add owner check-in console (today's bookings, mark as checked in)
8. Add invite flow (private bookings with multiple participants)
9. Add per-court flag system
10. Add cancellation and no-show logic
11. Add notifications (email + SMS + push)
12. Add QR code landing pages
13. Add open-to-join bookings

---

## Open questions to revisit

- Will PickleQ collect all payments centrally and pay owners weekly, or will each owner have their own PayMongo merchant account? (Leaning: PickleQ collects centrally for v1, to reduce owner onboarding friction.)
- What happens when an open-to-join booking has empty spots at start time? (Owner-configurable policy: cancel, charge anyway, or let them play short-handed.)
- How to handle disputes when owner says "didn't pay" and player says "did pay" for cash bookings? (Leaning: PickleQ stays out of cash disputes in v1. Owner is source of truth.)

---

## Context for AI coding assistants

This project is being built by a software engineer (Java Spring Boot background, expanding into Next.js/TypeScript) for the Philippine pickleball market. Prioritize:

- Clear, layered architecture (controllers/routes → services → ORM → database)
- TypeScript everywhere with shared types between frontend and backend
- Simplicity over cleverness for v1; we'll refactor when we have real users
- Atomic, transactional booking logic to prevent race conditions
- Centralized auth checks via middleware/helpers

When in doubt, ask before adding new dependencies or patterns.
