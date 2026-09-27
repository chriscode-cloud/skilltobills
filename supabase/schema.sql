-- I added admin priviledges

create extension if not exists pgcrypto;


-- 1. Profiles

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  track text default 'none',
  goal text,
  time_commitment text,
  experience_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;


create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);




-- 2. Courses

create table if not exists public.courses (
  id text primary key,
  slug text unique not null,
  title text not null,
  description text,
  badge text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;

create policy "Public can read courses"
  on public.courses for select
  using (true);


create policy "Service role can manage courses"
  on public.courses for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- 3. Modules

create table if not exists public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null
);

create index if not exists modules_course_id_idx on public.modules(course_id);

alter table public.modules enable row level security;

create policy "Public can read modules"
  on public.modules for select
  using (true);

create policy "Service role can manage modules"
  on public.modules for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- 4. Lessons

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

create policy "Public can read lessons"
  on public.lessons for select
  using (true);

create policy "Service role can manage lessons"
  on public.lessons for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- 5. User Progress

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


create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);


-- 6. Auto-update profiles

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
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


-- 7. Auto profile creation on signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- 8. Seed data

insert into public.courses (id, slug, title, description, badge)
values
  ('course-clip-mastery', 'clipping-mastery', 'Content Clipping & VOD Repurposing Mastery', 'Learn how to take long-form podcast & stream footage, cut high-retention vertical clips, and get paid retainer fees by creators.', 'Highest Demand'),
  ('course-stream-engine', 'stream-engineer', 'Live Broadcast & Stream Engineering', 'Master OBS Studio, multi-camera audio routing, Twitch alerts, and hardware encoders to manage top streamers live shows.', 'Tech Heavy'),
  ('course-creator-rep', 'talent-management', 'Creator Representation & Sponsorship Brokerage', 'Bridge the gap between brands and creators. Learn rate cards, pitch decks, inbound deal filtering, and 15-20% commission structures.', 'Business Core')
on conflict (id) do nothing;