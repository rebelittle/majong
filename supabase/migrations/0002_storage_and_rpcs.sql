-- Migration 0002: profile photo storage bucket + helper RPCs
-- Apply after 0001_init.sql by running this in the Supabase SQL editor.

------------------------------------------------------------------------
-- Storage bucket for profile photos (public-read, owner-write)
------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

-- Drop existing policies if re-running, then recreate
drop policy if exists "profile photo read"   on storage.objects;
drop policy if exists "profile photo upload" on storage.objects;
drop policy if exists "profile photo update" on storage.objects;
drop policy if exists "profile photo delete" on storage.objects;

create policy "profile photo read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'profiles');

-- Path convention: <auth.uid()>/<filename>. Owner can write only inside their own folder.
create policy "profile photo upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile photo update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile photo delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

------------------------------------------------------------------------
-- ensure_sessions_materialized(weeks_ahead)
--   For each active template, makes sure the next N weekly occurrences
--   exist as rows in `sessions`. Safe to call repeatedly.
--   Timezone hardcoded to America/New_York; change if Fox Hill is elsewhere.
------------------------------------------------------------------------
create or replace function public.ensure_sessions_materialized(weeks_ahead int default 14)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tpl record;
  week_offset int;
  base_date date;
  target_date date;
  start_ts timestamptz;
  end_ts timestamptz;
  zone constant text := 'America/New_York';
begin
  for tpl in
    select * from session_templates where active = true
  loop
    base_date := (now() at time zone zone)::date;
    -- Step 1: find the first occurrence of this day_of_week on or after today
    -- extract(dow from date) returns 0=Sun..6=Sat, matching our day_of_week column
    target_date := base_date + ((tpl.day_of_week - extract(dow from base_date)::int + 7) % 7);

    for week_offset in 0..(weeks_ahead - 1) loop
      start_ts := ((target_date + week_offset * 7)::text || ' ' || tpl.start_time)::timestamp at time zone zone;
      end_ts   := ((target_date + week_offset * 7)::text || ' ' || tpl.end_time)::timestamp   at time zone zone;

      insert into sessions (template_id, type, starts_at, ends_at)
      select tpl.id, tpl.type, start_ts, end_ts
      where not exists (
        select 1 from sessions s
        where s.template_id = tpl.id and s.starts_at = start_ts
      );
    end loop;
  end loop;
end;
$$;

grant execute on function public.ensure_sessions_materialized(int) to anon, authenticated;

------------------------------------------------------------------------
-- claim_seat(seat_id)
--   Atomically claims an empty seat for the current user.
--   If the user already holds another seat in the same session, releases
--   that one first (smooth seat-switching within a session).
--   Raises an exception if the target seat is already taken.
------------------------------------------------------------------------
create or replace function public.claim_seat(p_seat_id uuid)
returns seats
language plpgsql
security definer
set search_path = public
as $$
declare
  target_session_id uuid;
  result_row seats;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to claim a seat';
  end if;

  -- Lock the target seat for the duration of the transaction
  select session_id into target_session_id
  from seats
  where id = p_seat_id and profile_id is null
  for update;

  if target_session_id is null then
    raise exception 'That seat is already taken';
  end if;

  -- Release the user's existing seat in this session (if any)
  update seats
  set profile_id = null, reserved_at = null
  where session_id = target_session_id
    and profile_id = auth.uid();

  -- Claim the target seat
  update seats
  set profile_id = auth.uid(), reserved_at = now()
  where id = p_seat_id
  returning * into result_row;

  return result_row;
end;
$$;

grant execute on function public.claim_seat(uuid) to authenticated;

------------------------------------------------------------------------
-- Realtime: enable change broadcasts on the seats table so the table
-- layout view updates live when anyone claims/releases a seat.
------------------------------------------------------------------------
alter publication supabase_realtime add table public.seats;
