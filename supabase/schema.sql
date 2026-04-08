-- GymBook schema
-- Run this in your Supabase project → SQL Editor

-- Sessions
create table if not exists public.sessions (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text,
  tags         text[],
  date         text not null,         -- YYYY-MM-DD (stored as text to avoid tz shifts)
  started_at   text not null,         -- ISO datetime string
  finished_at  text,
  exercises    jsonb not null default '[]'::jsonb,
  notes        text,
  template_id  text,
  created_at   timestamptz default now()
);

alter table public.sessions enable row level security;

create policy "users_own_sessions" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Preferences (one row per user)
create table if not exists public.preferences (
  user_id              uuid references auth.users(id) on delete cascade primary key,
  weight_unit          text    not null default 'kg',
  rest_timer_default   integer not null default 90,
  dark_mode            boolean not null default true,
  plan_session_index   integer not null default 0,
  program_progress     jsonb   not null default '{}'::jsonb
);

alter table public.preferences enable row level security;

create policy "users_own_preferences" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Planned workouts
create table if not exists public.planned_workouts (
  id       text primary key,
  user_id  uuid references auth.users(id) on delete cascade not null,
  date     text not null,
  title    text
);

alter table public.planned_workouts enable row level security;

create policy "users_own_planned_workouts" on public.planned_workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
