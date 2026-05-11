-- Fox Hill Mahjong — initial schema
-- Run this in the Supabase SQL editor after creating a new project.

------------------------------------------------------------------------
-- Profiles: one row per signed-in user (Supabase auth user id)
------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text not null,
  photo_url     text,
  skill_level   text check (skill_level in ('beginner', 'intermediate', 'advanced')),
  notes         text,
  is_helper     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

------------------------------------------------------------------------
-- Admins: emails granted admin powers (used by RLS policies)
------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);

insert into public.admins (email)
values ('reaganlittle05@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.email = auth.email());
$$;

------------------------------------------------------------------------
-- Session templates: the recurring weekly schedule
------------------------------------------------------------------------
create table if not exists public.session_templates (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('mommy', 'beginner', 'experienced')),
  day_of_week  int  not null check (day_of_week between 0 and 6), -- 0=Sun..6=Sat
  start_time   time not null,
  end_time     time not null,
  active       boolean not null default true
);

-- Seed the three default sessions (admin can edit later)
insert into public.session_templates (type, day_of_week, start_time, end_time) values
  ('mommy',       2, '10:00', '12:00'),  -- Tuesday
  ('beginner',    3, '13:00', '15:00'),  -- Wednesday
  ('experienced', 4, '10:00', '12:00')   -- Thursday
on conflict do nothing;

------------------------------------------------------------------------
-- Sessions: concrete instances (one per week per template)
------------------------------------------------------------------------
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid references public.session_templates(id) on delete set null,
  type         text not null check (type in ('mommy', 'beginner', 'experienced')),
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  status       text not null default 'open' check (status in ('open', 'cancelled')),
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists sessions_starts_at_idx on public.sessions (starts_at);

------------------------------------------------------------------------
-- Seats: 5 tables × 4 positions per session
------------------------------------------------------------------------
create table if not exists public.seats (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  table_number   int  not null check (table_number between 1 and 5),
  seat_position  text not null check (seat_position in ('east', 'south', 'west', 'north')),
  profile_id     uuid references public.profiles(id) on delete set null,
  reserved_at    timestamptz,
  unique (session_id, table_number, seat_position),
  unique (session_id, profile_id)
);

create index if not exists seats_session_idx on public.seats (session_id);

-- When a new session is created, auto-generate its 20 empty seats.
create or replace function public.generate_seats_for_session()
returns trigger
language plpgsql
as $$
declare
  t int;
  positions text[] := array['east', 'south', 'west', 'north'];
  p text;
begin
  for t in 1..5 loop
    foreach p in array positions loop
      insert into public.seats (session_id, table_number, seat_position)
      values (new.id, t, p);
    end loop;
  end loop;
  return new;
end;
$$;

drop trigger if exists generate_seats_after_session_insert on public.sessions;
create trigger generate_seats_after_session_insert
after insert on public.sessions
for each row execute function public.generate_seats_for_session();

------------------------------------------------------------------------
-- Row-Level Security
------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.admins            enable row level security;
alter table public.session_templates enable row level security;
alter table public.sessions          enable row level security;
alter table public.seats             enable row level security;

-- profiles: anyone signed in can read; only the owner (or admin) can write
create policy "profiles read"   on public.profiles for select to authenticated using (true);
create policy "profiles insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update to authenticated using (auth.uid() = id or public.is_admin());
create policy "profiles delete" on public.profiles for delete to authenticated using (public.is_admin());

-- admins: only admins can see who is admin
create policy "admins read"  on public.admins for select to authenticated using (public.is_admin());
create policy "admins write" on public.admins for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- session_templates: everyone reads; only admin writes
create policy "templates read"  on public.session_templates for select to authenticated using (true);
create policy "templates write" on public.session_templates for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- sessions: everyone reads; only admin writes
create policy "sessions read"  on public.sessions for select to authenticated using (true);
create policy "sessions write" on public.sessions for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- seats: everyone reads; players can claim an empty seat or release their own
create policy "seats read"   on public.seats for select to authenticated using (true);
create policy "seats update" on public.seats for update to authenticated
  using (
    -- The seat is empty (claim) OR currently held by me (release) OR I'm admin
    profile_id is null or profile_id = auth.uid() or public.is_admin()
  )
  with check (
    -- After update: either I'm claiming it for myself, releasing it, or admin
    profile_id = auth.uid() or profile_id is null or public.is_admin()
  );
-- No insert/delete policies for seats: rows are created by the trigger and removed via session cascade.
