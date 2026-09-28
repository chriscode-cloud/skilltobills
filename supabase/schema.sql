-- Skill2Bills Database Schema for Supabase (PostgreSQL)
-- Copy and paste this directly into the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Fully idempotent: Safe to run repeatedly without throwing "already exists" errors.

create extension if not exists pgcrypto;

-- 1. Profiles Table (Tracks onboarded creators, learners, and admins)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text default 'student' check (role in ('student', 'instructor', 'admin')),
  onboarding_completed boolean default false,
  name text,
  username text unique,
  avatar_url text,
  bio text,
  links jsonb default '{}'::jsonb,
  email_notifications boolean default true,
  track text default 'none',
  goal text,
  time_commitment text,
  experience_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist for existing tables
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists onboarding_completed boolean default false;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists links jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists email_notifications boolean default true;

-- Helper security definer function to avoid recursive RLS queries
create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  -- Exemption for direct SQL editor operations and service_role
  if current_user in ('postgres', 'supabase_admin') or coalesce(auth.role(), '') = 'service_role' then
    return true;
  end if;

  if auth.uid() is null then
    return false;
  end if;

  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Protect role from client-side privilege escalation (both INSERT and UPDATE)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Allow updates from Supabase SQL Editor / database superusers / service role or active admins
  if current_user in ('postgres', 'supabase_admin') or coalesce(auth.role(), '') = 'service_role' or public.is_admin() then
    return new;
  end if;

  -- On client INSERT: force role to 'student'
  if tg_op = 'INSERT' then
    new.role := 'student';
  -- On client UPDATE: prevent role modification
  elsif tg_op = 'UPDATE' then
    if new.role is distinct from old.role then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tr_protect_profile_role on public.profiles;
create trigger tr_protect_profile_role
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_role();

-- Enable RLS
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- 2. Courses Table
create table if not exists public.courses (
  id text primary key,
  slug text unique not null,
  title text not null,
  description text,
  badge text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;

drop policy if exists "Public can read courses" on public.courses;
create policy "Public can read courses"
  on public.courses for select
  using (true);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses for all
  using (public.is_admin() or auth.role() = 'service_role')
  with check (public.is_admin() or auth.role() = 'service_role');

-- 3. Modules Table
create table if not exists public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null
);

create index if not exists modules_course_id_idx on public.modules(course_id);
alter table public.modules enable row level security;

drop policy if exists "Public can read modules" on public.modules;
create policy "Public can read modules"
  on public.modules for select
  using (true);

drop policy if exists "Admins can manage modules" on public.modules;
create policy "Admins can manage modules"
  on public.modules for all
  using (public.is_admin() or auth.role() = 'service_role')
  with check (public.is_admin() or auth.role() = 'service_role');

-- 4. Lessons Table
create table if not exists public.lessons (
  id text primary key,
  module_id text references public.modules(id) on delete cascade not null,
  title text not null,
  duration text,
  video_url text not null,
  body_content text,
  quiz_json jsonb,
  resources_json jsonb,
  order_index integer not null
);

create index if not exists lessons_module_id_idx on public.lessons(module_id);
alter table public.lessons enable row level security;

drop policy if exists "Public can read lessons" on public.lessons;
create policy "Public can read lessons"
  on public.lessons for select
  using (true);

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons"
  on public.lessons for all
  using (public.is_admin() or auth.role() = 'service_role')
  with check (public.is_admin() or auth.role() = 'service_role');

-- 5. User Progress Table
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id text references public.lessons(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, lesson_id)
);

create index if not exists user_progress_user_id_idx on public.user_progress(user_id);
create index if not exists user_progress_lesson_id_idx on public.user_progress(lesson_id);
alter table public.user_progress enable row level security;

drop policy if exists "Users can view own progress" on public.user_progress;
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own progress" on public.user_progress;
create policy "Users can delete own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- 6. Enrollments Table
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text references public.courses(id) on delete cascade not null,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'active' check (status in ('active', 'completed', 'dropped')),
  unique (user_id, course_id)
);

create index if not exists enrollments_user_id_idx on public.enrollments(user_id);
create index if not exists enrollments_course_id_idx on public.enrollments(course_id);
alter table public.enrollments enable row level security;

drop policy if exists "Users can view own enrollments" on public.enrollments;
create policy "Users can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can enroll themselves" on public.enrollments;
create policy "Users can enroll themselves"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own enrollments" on public.enrollments;
create policy "Users can update own enrollments"
  on public.enrollments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Account Deletion Requests (Privacy Compliance)
create table if not exists public.deletion_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  reason text,
  status text default 'pending' check (status in ('pending', 'processed', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.deletion_requests enable row level security;

drop policy if exists "Users can create own deletion request" on public.deletion_requests;
create policy "Users can create own deletion request"
  on public.deletion_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view deletion requests" on public.deletion_requests;
create policy "Admins can view deletion requests"
  on public.deletion_requests for select
  using (auth.uid() = user_id or public.is_admin());

-- 8. Support Messages Table
create table if not exists public.support_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.support_messages enable row level security;

drop policy if exists "Anyone can submit support message" on public.support_messages;
create policy "Anyone can submit support message"
  on public.support_messages for insert
  with check (true);

drop policy if exists "Admins can view support messages" on public.support_messages;
create policy "Admins can view support messages"
  on public.support_messages for select
  using (public.is_admin() or auth.role() = 'service_role');

-- 9. Newsletter Subscribers Table (Insert-only for anon, Admin-only read)
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists "Admins can view newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can view newsletter subscribers"
  on public.newsletter_subscribers for select
  using (public.is_admin() or auth.role() = 'service_role');

drop policy if exists "Admins can manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can manage newsletter subscribers"
  on public.newsletter_subscribers for delete
  using (public.is_admin() or auth.role() = 'service_role');

-- 10. Auto-update profiles timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- 11. Auto profile creation on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 12. Seed data for courses
insert into public.courses (id, slug, title, description, badge) values
  ('course-clip-mastery', 'clipping-mastery', 'Content Clipping & VOD Repurposing Mastery', 'Learn how to take long-form podcast & stream footage, cut high-retention vertical clips, and get paid retainer fees by creators.', 'Highest Demand'),
  ('course-stream-engine', 'stream-engineer', 'Live Broadcast & Stream Engineering', 'Master OBS Studio, multi-camera audio routing, Twitch alerts, and hardware encoders to manage top streamers live shows.', 'Tech Heavy'),
  ('course-creator-rep', 'talent-management', 'Creator Representation & Sponsorship Brokerage', 'Bridge the gap between brands and creators. Learn rate cards, pitch decks, inbound deal filtering, and 15-20% commission structures.', 'Business Core')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  badge = excluded.badge;
