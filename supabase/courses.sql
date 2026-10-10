-- Steady: user-created courses, sharing, public catalog with admin approval, reports and AI usage.
-- Run after schema.sql. Safe to run more than once.

create table if not exists public.app_admins (user_id uuid primary key references auth.users(id) on delete cascade);

create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  owner         uuid not null references auth.users(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 120),
  subtitle      text not null default '',
  lang          text not null default 'en' check (lang in ('en', 'ar')),
  content       jsonb not null,                       -- the full course in Steady's format
  status        text not null default 'ready' check (status in ('generating', 'ready', 'failed')),
  visibility    text not null default 'private' check (visibility in ('private', 'link', 'public')),
  review_status text not null default 'none' check (review_status in ('none', 'pending', 'approved', 'rejected')),
  review_note   text,
  ai_generated  boolean not null default false,
  lesson_count  int not null default 0,
  enroll_count  int not null default 0,
  report_count  int not null default 0,
  version       int not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists courses_catalog_idx on public.courses (visibility, review_status);
create index if not exists courses_owner_idx on public.courses (owner);

create table if not exists public.enrollments (
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.course_reports (
  course_id  uuid not null references public.courses(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  reason     text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

-- Every Claude call is logged with its tokens and cost, for quotas and a future pricing study.
create table if not exists public.ai_usage (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  course_id     uuid references public.courses(id) on delete set null,
  kind          text not null,                         -- outline | course | lesson | scenarios | check
  model         text not null,
  input_tokens  int not null default 0,
  output_tokens int not null default 0,
  cache_read_tokens int not null default 0,
  cost_usd      numeric(10,5) not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists ai_usage_user_idx on public.ai_usage (user_id, kind, created_at);

-- ── Helpers ────────────────────────────────────────────────────────────
create or replace function private.is_admin(u uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_admins where user_id = u);
$$;
revoke execute on function private.is_admin(uuid) from public, anon;
grant execute on function private.is_admin(uuid) to authenticated;

-- Catalog listing (no lesson content): approved public courses, newest and most-enrolled first.
create or replace function public.catalog(q text default '') returns table (
  id uuid, title text, subtitle text, lang text, lesson_count int, enroll_count int, ai_generated boolean, author text, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, c.title, c.subtitle, c.lang, c.lesson_count, c.enroll_count, c.ai_generated, coalesce(p.name, 'Learner'), c.updated_at
  from courses c left join profiles p on p.id = c.owner
  where c.visibility = 'public' and c.review_status = 'approved' and c.status = 'ready'
    and (q = '' or c.title ilike '%' || q || '%' or c.subtitle ilike '%' || q || '%')
  order by c.enroll_count desc, c.updated_at desc limit 100;
$$;

-- Read one course: owner, admin, enrolled, link-shared or approved public.
create or replace function public.get_course(cid uuid) returns json
language plpgsql stable security definer set search_path = public as $$
declare c courses; me uuid := auth.uid();
begin
  select * into c from courses where id = cid;
  if c.id is null then raise exception 'Course not found'; end if;
  if not (coalesce(c.owner = me, false) or coalesce(private.is_admin(me), false) or c.visibility = 'link'
          or (c.visibility = 'public' and c.review_status = 'approved')
          or exists (select 1 from enrollments where user_id = me and course_id = cid)) then
    raise exception 'This course is private';
  end if;
  return json_build_object('id', c.id, 'owner', c.owner, 'is_owner', coalesce(c.owner = me, false), 'title', c.title, 'lang', c.lang, 'content', c.content,
    'status', c.status, 'visibility', c.visibility, 'review_status', c.review_status, 'review_note', c.review_note,
    'ai_generated', c.ai_generated, 'enroll_count', c.enroll_count, 'version', c.version,
    'author', (select name from profiles where id = c.owner));
end $$;

create or replace function public.enroll(cid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c courses; me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  select * into c from courses where id = cid;
  if c.id is null then raise exception 'Course not found'; end if;
  if not (c.owner = me or c.visibility = 'link' or (c.visibility = 'public' and c.review_status = 'approved')) then raise exception 'This course is private'; end if;
  insert into enrollments (user_id, course_id) values (me, cid) on conflict do nothing;
  if found then update courses set enroll_count = enroll_count + 1 where id = cid; end if;
end $$;

create or replace function public.unenroll(cid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from enrollments where user_id = auth.uid() and course_id = cid;
  if found then update courses set enroll_count = greatest(enroll_count - 1, 0) where id = cid; end if;
end $$;

-- Owner sets sharing. Choosing 'public' sends it for admin review (admins publish directly).
create or replace function public.set_visibility(cid uuid, vis text) returns json
language plpgsql security definer set search_path = public as $$
declare c courses; me uuid := auth.uid();
begin
  select * into c from courses where id = cid;
  if me is null or c.id is null or c.owner is distinct from me then raise exception 'Only the course owner can change sharing'; end if;
  if vis not in ('private', 'link', 'public') then raise exception 'Unknown sharing option'; end if;
  update courses set visibility = vis, updated_at = now(),
    review_status = case when vis <> 'public' then 'none' when private.is_admin(me) then 'approved' when review_status = 'approved' then 'approved' else 'pending' end
  where id = cid returning * into c;
  return json_build_object('visibility', c.visibility, 'review_status', c.review_status);
end $$;

create or replace function public.delete_course(cid uuid) returns void
language sql security definer set search_path = public as $$
  delete from courses where id = cid and (owner = auth.uid() or private.is_admin(auth.uid()));
$$;

create or replace function public.report_course(cid uuid, reason text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into course_reports (course_id, user_id, reason) values (cid, auth.uid(), left(reason, 500)) on conflict do nothing;
  if found then update courses set report_count = report_count + 1 where id = cid; end if;
end $$;

-- Admin: review queue (pending + reported), and decisions.
create or replace function public.admin_queue() returns table (
  id uuid, title text, subtitle text, lang text, lesson_count int, review_status text, report_count int, author text, visibility text, reasons text[])
language plpgsql stable security definer set search_path = public as $$
begin
  if not private.is_admin(auth.uid()) then raise exception 'Admins only'; end if;
  return query select c.id, c.title, c.subtitle, c.lang, c.lesson_count, c.review_status, c.report_count, coalesce(p.name, 'Learner'), c.visibility,
    array(select r.reason from course_reports r where r.course_id = c.id order by r.created_at desc limit 5)
  from courses c left join profiles p on p.id = c.owner
  where (c.visibility = 'public' and c.review_status = 'pending') or c.report_count > 0
  order by c.review_status = 'pending' desc, c.report_count desc, c.updated_at desc;
end $$;

create or replace function public.admin_review(cid uuid, decision text, note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not private.is_admin(auth.uid()) then raise exception 'Admins only'; end if;
  if decision = 'approve' then update courses set review_status = 'approved', review_note = note, visibility = 'public' where id = cid;
  elsif decision = 'reject' then update courses set review_status = 'rejected', review_note = note where id = cid;
  elsif decision = 'unpublish' then update courses set visibility = 'private', review_status = 'rejected', review_note = note where id = cid;
  elsif decision = 'dismiss_reports' then delete from course_reports where course_id = cid; update courses set report_count = 0 where id = cid;
  else raise exception 'Unknown decision'; end if;
end $$;

create or replace function public.my_library() returns table (id uuid, version int, is_owner boolean, status text)
language sql stable security definer set search_path = public as $$
  select c.id, c.version, c.owner = auth.uid(), c.status from courses c
  where c.owner = auth.uid() or exists (select 1 from enrollments e where e.course_id = c.id and e.user_id = auth.uid());
$$;

create or replace function public.ai_quota() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('used', (select count(*) from ai_usage where user_id = auth.uid() and kind = 'course' and created_at >= date_trunc('month', now())),
                           'limit', case when private.is_admin(auth.uid()) then 1000 else 3 end, 'admin', private.is_admin(auth.uid()));
$$;

-- ── Row-level security: everything goes through the functions above or the server function ──
alter table public.app_admins     enable row level security;
alter table public.courses        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.course_reports enable row level security;
alter table public.ai_usage       enable row level security;

drop policy if exists "own courses" on public.courses;
create policy "own courses" on public.courses for select using (owner = (select auth.uid()));
drop policy if exists "own enrollments" on public.enrollments;
create policy "own enrollments" on public.enrollments for select using (user_id = (select auth.uid()));
drop policy if exists "own usage" on public.ai_usage;
create policy "own usage" on public.ai_usage for select using (user_id = (select auth.uid()));

grant select on public.courses, public.enrollments, public.ai_usage to authenticated;
revoke execute on function public.get_course(uuid), public.catalog(text) from public;
grant execute on function public.get_course(uuid), public.catalog(text) to anon, authenticated;
revoke execute on function public.enroll(uuid), public.unenroll(uuid), public.set_visibility(uuid, text), public.delete_course(uuid),
  public.report_course(uuid, text), public.admin_queue(), public.admin_review(uuid, text, text), public.my_library(), public.ai_quota() from public, anon;
grant execute on function public.enroll(uuid), public.unenroll(uuid), public.set_visibility(uuid, text), public.delete_course(uuid),
  public.report_course(uuid, text), public.admin_queue(), public.admin_review(uuid, text, text), public.my_library(), public.ai_quota() to authenticated;

-- The owner's account becomes admin automatically when it signs up.
create or replace function private.grant_owner_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 's.foraihey@gmail.com' then insert into app_admins (user_id) values (new.id) on conflict do nothing; end if;
  return new;
end $$;
revoke execute on function private.grant_owner_admin() from public, anon, authenticated;
drop trigger if exists on_owner_signup on auth.users;
create trigger on_owner_signup after insert on auth.users for each row execute function private.grant_owner_admin();
insert into public.app_admins (user_id) select id from auth.users where lower(email) = 's.foraihey@gmail.com' on conflict do nothing;
