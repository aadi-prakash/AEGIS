-- ============================================================
-- AEGIS — Supabase schema
-- Run this in the Supabase SQL editor for project yefioqpctxozdpipzjwy
-- ============================================================

-- USERS (profile row mirrored from auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

-- GOALS
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('career','health','financial','personal')),
  target_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  milestones jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now()
);

-- JOURNAL ENTRIES
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CALENDAR EVENTS
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  category text not null default 'personal' check (category in ('work','gym','personal','deadlines')),
  created_at timestamptz not null default now()
);

-- FITNESS PROFILE (one per user)
create table if not exists public.fitness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  biodata jsonb not null default '{}'::jsonb,
  workout_plan jsonb not null default '{}'::jsonb,
  nutrition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FITNESS LOGS (weight check-ins)
create table if not exists public.fitness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security — each user only sees their own rows
-- ============================================================
alter table public.users            enable row level security;
alter table public.goals            enable row level security;
alter table public.journal_entries  enable row level security;
alter table public.calendar_events  enable row level security;
alter table public.fitness_profiles enable row level security;
alter table public.fitness_logs     enable row level security;

-- USERS: a user can read/insert/update their own profile row
drop policy if exists "users self access" on public.users;
create policy "users self access" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner policies for the rest (user_id = auth.uid())
do $$
declare t text;
begin
  foreach t in array array['goals','journal_entries','calendar_events','fitness_profiles','fitness_logs']
  loop
    execute format('drop policy if exists "owner access" on public.%I;', t);
    execute format(
      'create policy "owner access" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- ============================================================
-- Auto-create a profile row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpful indexes
create index if not exists goals_user_idx          on public.goals(user_id);
create index if not exists journal_user_idx        on public.journal_entries(user_id, created_at desc);
create index if not exists events_user_idx         on public.calendar_events(user_id, start_time);
create index if not exists fitness_logs_user_idx   on public.fitness_logs(user_id, date);
