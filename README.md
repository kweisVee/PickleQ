# PickleQ

A pickleball court booking and queueing system for the Philippines, starting in provincial markets.

Court owners pay for the service. Players use it to book courts, invite friends, or join open games.

---

## Prerequisites

Make sure you have the following installed on your machine before getting started:

- [Node.js](https://nodejs.org/) v20 or higher
- npm (comes with Node.js)
- A [Supabase](https://supabase.com) account with a project created

---

## Local Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd pickleq
```

### 2. Install dependencies

```bash
npm install
```

This installs everything in `package.json`. The key packages already included are:

| Package | Purpose |
|---|---|
| `next` | Next.js framework |
| `react`, `react-dom` | React |
| `drizzle-orm` | ORM for querying the database |
| `postgres` | Postgres driver used by Drizzle |
| `tailwindcss` | Utility-first CSS framework |
| `typescript` | TypeScript compiler |
| `drizzle-kit` | CLI for generating and running DB migrations (dev only) |
| `@supabase/supabase-js` | Supabase client (Auth + storage) |
| `@supabase/ssr` | Supabase SSR helpers for Next.js App Router (cookie-based sessions) |

If you ever need to install them individually:

```bash
# Core dependencies
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr

# Dev dependencies
npm install -D drizzle-kit
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then fill in your values:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.<your-project-ref>.supabase.co:5432/postgres
```

To find your `DATABASE_URL`:
1. Go to your Supabase project dashboard
2. Click **Connect** (top of the page)
3. Choose **Direct connection** and **URI** type
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **ORM:** Drizzle
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth (phone OTP + email)
- **Payments:** PayMongo (GCash)
- **Email:** Resend
- **SMS:** Semaphore
- **Hosting:** Vercel

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── app/
│   ├── (player)/          # player-facing pages
│   ├── (owner)/           # owner console pages
│   ├── book/[facilityId]/ # QR landing page
│   ├── api/               # backend API routes
│   └── layout.tsx
├── components/            # shared React components
├── lib/
│   ├── db/                # Drizzle schema and client
│   ├── auth/              # Supabase Auth helpers
│   ├── payments/          # PayMongo integration
│   ├── notifications/     # email, SMS, push dispatchers
│   └── services/          # business logic (booking, pricing, flags)
└── types/                 # shared TypeScript types
drizzle/                   # migration files
```

---

## Database

This project uses [Drizzle ORM](https://orm.drizzle.team/) with Supabase Postgres.

Migrations will be added as the schema is built out. Instructions for running migrations will be documented here.
