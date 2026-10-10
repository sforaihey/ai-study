-- Steady backend: accounts, progress sync and friends.
-- Paste this whole file into Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- ── Tables ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default 'Learner' check (char_length(name) between 1 and 60),
  friend_code text not null unique,
  created_at  timestamptz not null default now()
);

-- Full app state, private to its owner (used to sync your own devices).
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Small public-to-friends summary: what friends can see.
create table if not exists public.summaries (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  streak       int  not null default 0,
  streak_last  date,
  minutes_7d   numeric not null default 0,
  minutes_today numeric not null default 0,
  lessons_done int  not null default 0,
  courses      jsonb not null default '[]',   -- [{id,title,done,total,cert}]
  updated_at   timestamptz not null default now()
);

create table if not exists public.friendships (
  user_a     uuid not null references auth.users(id) on delete cascade,
  user_b     uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

create table if not exists public.cheers (
  id         bigint generated always as identity primary key,
  from_id    uuid not null references auth.users(id) on delete cascade,
  to_id      uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('keep-going','streak','study-together','congrats')),
  seen       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists cheers_to_idx on public.cheers (to_id, seen);

-- ── Helpers ────────────────────────────────────────────────────────────
create schema if not exists private;
grant usage on schema private to authenticated;
create or replace function private.is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships where user_a = least(a, b) and user_b = greatest(a, b));
$$;

-- Create a profile with a unique 6-character friend code for every new account.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare code text; alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  loop
    code := '';
    for i in 1..6 loop code := code || substr(alphabet, 1 + floor(random() * char_length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from profiles where friend_code = code);
  end loop;
  insert into profiles (id, name, friend_code)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Learner'), code)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Add a friend by their code (both people then see each other).
create or replace function public.add_friend(code text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); them profiles;
begin
  if me is null then raise exception 'not signed in'; end if;
  select * into them from profiles where friend_code = upper(trim(code));
  if them.id is null then raise exception 'No one has that code'; end if;
  if them.id = me then raise exception 'That is your own code'; end if;
  insert into friendships (user_a, user_b) values (least(me, them.id), greatest(me, them.id)) on conflict do nothing;
  return json_build_object('id', them.id, 'name', them.name);
end $$;

create or replace function public.remove_friend(friend uuid) returns void
language sql security definer set search_path = public as $$
  delete from friendships where user_a = least((select auth.uid()), friend) and user_b = greatest((select auth.uid()), friend);
$$;

-- Permanently delete your own account and all its data.
create or replace function public.delete_account() returns void
language sql security definer set search_path = public as $$
  delete from auth.users where id = (select auth.uid());
$$;

-- ── Row-level security ─────────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.progress    enable row level security;
alter table public.summaries   enable row level security;
alter table public.friendships enable row level security;
alter table public.cheers      enable row level security;

drop policy if exists "own or friend profile" on public.profiles;
create policy "own or friend profile" on public.profiles for select using (id = (select auth.uid()) or private.is_friend(id, (select auth.uid())));
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "read own or friend summary" on public.summaries;
create policy "read own or friend summary" on public.summaries for select using (user_id = (select auth.uid()) or private.is_friend(user_id, (select auth.uid())));
drop policy if exists "write own summary" on public.summaries;
create policy "write own summary" on public.summaries for insert with check (user_id = (select auth.uid()));
drop policy if exists "update own summary" on public.summaries;
create policy "update own summary" on public.summaries for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "see own friendships" on public.friendships;
create policy "see own friendships" on public.friendships for select using ((select auth.uid()) in (user_a, user_b));

drop policy if exists "see own cheers" on public.cheers;
create policy "see own cheers" on public.cheers for select using ((select auth.uid()) in (from_id, to_id));
drop policy if exists "cheer a friend" on public.cheers;
create policy "cheer a friend" on public.cheers for insert with check (from_id = (select auth.uid()) and private.is_friend(from_id, to_id));
drop policy if exists "mark cheers seen" on public.cheers;
create policy "mark cheers seen" on public.cheers for update using (to_id = (select auth.uid())) with check (to_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;
grant select, insert, update on public.progress, public.summaries to authenticated;
grant select on public.friendships to authenticated;
grant select, insert on public.cheers to authenticated;
grant update (seen) on public.cheers to authenticated;
grant execute on function public.add_friend(text), public.remove_friend(uuid), public.delete_account() to authenticated;
revoke execute on function private.is_friend(uuid, uuid) from public, anon;
grant execute on function private.is_friend(uuid, uuid) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
drop function if exists public.is_friend(uuid, uuid);
revoke execute on function public.add_friend(text), public.remove_friend(uuid), public.delete_account() from anon, public;
