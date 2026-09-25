-- Skill2Bills Database Schema for Supabase (PostgreSQL)
-- Copy and paste this directly into the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Profiles Table (Tracks onboarded creators and leads)
create table if not exists public.profiles (
  id text primary key,
  email text unique not null,
  track text default 'none',
  goal text,
  time_commitment text,
  experience_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Allow public anon read/write for onboarding signups
create policy "Allow anon insert/upsert to profiles"
  on public.profiles for all
  using (true)
  with check (true);

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

create policy "Allow public read courses"
  on public.courses for select
  using (true);

-- 3. Modules Table
create table if not exists public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null
);

alter table public.modules enable row level security;

create policy "Allow public read modules"
  on public.modules for select
  using (true);

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

alter table public.lessons enable row level security;

create policy "Allow public read lessons"
  on public.lessons for select
  using (true);

-- 5. User Progress Table
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  lesson_id text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Allow public read/write user progress"
  on public.user_progress for all
  using (true)
  with check (true);

-- Optional Seed Data: Seed the 3 core courses into Supabase
insert into public.courses (id, slug, title, description, badge)
values
  ('course-clip-mastery', 'clipping-mastery', 'Content Clipping & VOD Repurposing Mastery', 'Learn how to take long-form podcast & stream footage, cut high-retention vertical clips, and get paid retainer fees by creators.', 'Highest Demand'),
  ('course-stream-engine', 'stream-engineer', 'Live Broadcast & Stream Engineering', 'Master OBS Studio, multi-camera audio routing, Twitch alerts, and hardware encoders to manage top streamers live shows.', 'Tech Heavy'),
  ('course-creator-rep', 'talent-management', 'Creator Representation & Sponsorship Brokerage', 'Bridge the gap between brands and creators. Learn rate cards, pitch decks, inbound deal filtering, and 15-20% commission structures.', 'Business Core')
on conflict (id) do nothing;
