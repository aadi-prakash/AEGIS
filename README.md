# AEGIS — Personal Command Center

> *Your life. One dashboard.*

Most productivity tools are built for teams. Notion wants you to collaborate. Linear wants you to ship tickets. Google Calendar wants you to attend meetings.

**AEGIS is built for one person — you.** A dark, self-hosted command center where you track what matters, log how you're feeling, plan your week, and build your body. No subscriptions. No AI black box. No data leaving your machine except to your own Supabase instance. Just a fast, beautiful dashboard that does exactly what you tell it to.

---

## What's inside

**Dashboard** — Your day at a glance. Today's agenda, active goals, latest journal mood, and your workout — all in one view the moment you log in.

**Goals** — Set goals with categories, milestones, and target dates. Watch your progress fill up radial rings in real time. A streak tracker keeps you honest.

**Journal** — A distraction-free editor that saves as you type. Tag each entry with a mood, search your history, and see your consistency mapped out on a GitHub-style heatmap. Your thoughts, organized.

**Calendar** — Month and week views, color-coded by category. Work, gym, personal, deadlines — everything in one place, nothing synced to a third-party server.

**Fitness** — Input your biodata once: age, weight, goal, training experience, available days, equipment. Build your weekly workout split day by day. Log weekly weigh-ins and watch your progress charted over time. Track your macros with nutrition rings.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database + Auth | Supabase |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

No external APIs. No AI dependencies. Two environment variables.

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/aegis.git
cd aegis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Open your [Supabase project](https://supabase.com) → SQL Editor → paste and run the contents of `supabase/schema.sql`.

This creates all six tables, enables Row Level Security (each user only ever sees their own data), and adds a trigger that auto-creates a user profile on signup.

### 4. Add your environment variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You'll find both under **Supabase → Project Settings → API**.

### 5. (Optional) Disable email confirmation

In Supabase → Authentication → Providers → Email, toggle off **"Confirm email"** so you can sign in immediately after signing up. Otherwise check your inbox for the confirmation link first.

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on `/login`. Sign up and you're in.

---

## Database schema

| Table | Purpose |
|---|---|
| `users` | Profile row, auto-created on signup |
| `goals` | Goals with milestones and progress |
| `journal_entries` | Entries with mood tags |
| `calendar_events` | Events with categories |
| `fitness_profiles` | Biodata, workout plan, nutrition targets |
| `fitness_logs` | Weekly weight check-ins |

All tables are protected by RLS — nothing is shared between accounts.

---

## Notes

- Auth is Supabase email/password. Sessions persist to `localStorage` (`storageKey: "aegis-auth"`), so the app stays logged in and works offline after the initial load.
- Toggling goal milestones auto-syncs that goal's overall progress percentage.
- Self-hosted means your data stays yours. Fork it, break it, make it your own.

---

## License

MIT — do whatever you want with it.
