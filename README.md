# AEGIS — Personal Command Center

A full-stack personal productivity dashboard: goals, journal, calendar, and a
health & fitness command center. Dark premium glassmorphism UI, fully wired to
Supabase (auth + database). No AI, no external APIs — offline-capable after login.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Recharts ·
Framer Motion · Lucide React.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database** — open the Supabase project SQL editor and run the
   contents of [`supabase/schema.sql`](supabase/schema.sql). This creates all six
   tables, enables Row Level Security (each user only sees their own rows), and adds
   a trigger that auto-creates a `users` profile row on signup.

3. **Environment** — `.env.local` already contains your project URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **(Optional) Disable email confirmation** — in Supabase → Authentication →
   Providers → Email, turn off "Confirm email" so you can sign in immediately after
   signing up. Otherwise check your inbox for the confirmation link first.

5. **Run**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 → you'll be redirected to `/login`. Sign up, then
   you're in.

## Modules
- **Dashboard** — greeting, today's agenda, top goals, latest mood, today's workout, quick links.
- **Goals** — CRUD goals with categories, milestones, radial progress rings, progress bar chart, stats.
- **Journal** — fullscreen editor with debounced auto-save, mood tags, search/filter, GitHub-style heatmap, streak stats.
- **Calendar** — month/week views, color-coded events by category, upcoming widget.
- **Fitness** — biodata profile, day-by-day workout plan builder, weight check-ins with line chart, body-stats history table, nutrition macro rings.

## Notes
- Auth is Supabase email/password; the session is persisted to `localStorage`
  (`storageKey: "aegis-auth"`), so the app stays logged in and works offline.
- All data is per-user and protected by RLS — nothing is shared between accounts.
- Toggling a goal's milestones auto-syncs that goal's progress %.
