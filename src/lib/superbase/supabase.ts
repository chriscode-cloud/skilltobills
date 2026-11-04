import { supabase, isSupabaseConfigured, getSupabaseAdminClient } from "./client";

export type OnboardingInput = {
  track: string;
  goal: string;
  timeCommitment: string;
  experienceLevel: string;
};

export type Profile = {
  id: string;
  email: string;
  track: string;
  goal: string | null;
  time_commitment: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at?: string;
  role?: string;
  name?: string;
  status?: string;
  source?: string;
  last_sign_in_at?: string | null;
};

export type SupabaseProfile = Profile;

export { supabase, isSupabaseConfigured };

export const DEFAULT_SQL_SYNC_SCRIPT = `-- =================================================================
-- Skill2Bills: 1-Click Supabase Auth Users Synchronization Script
-- Run this in Supabase Dashboard -> SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- =================================================================

-- 1. Ensure public.profiles table exists and has proper columns
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text default 'student',
  onboarding_completed boolean default true,
  name text,
  track text default 'AI & Virtual Influencers',
  goal text default 'Scale my personal brand',
  time_commitment text default '5-15',
  experience_level text default 'Beginner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure required columns exist
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists onboarding_completed boolean default true;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists track text default 'AI & Virtual Influencers';
alter table public.profiles add column if not exists goal text default 'Scale my personal brand';
alter table public.profiles add column if not exists time_commitment text default '5-15';
alter table public.profiles add column if not exists experience_level text default 'Beginner';

-- 2. Enable RLS and permit admins and authenticated users to read profiles
alter table public.profiles enable row level security;

drop policy if exists "Allow reading all profiles" on public.profiles;
create policy "Allow reading all profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Allow inserting own profile" on public.profiles;
create policy "Allow inserting own profile"
  on public.profiles for insert
  with check (auth.uid() = id or email in ('christianaboagye06@gmail.com', 'christianaaboagye06@gmail.com'));

drop policy if exists "Allow updating own profile" on public.profiles;
create policy "Allow updating own profile"
  on public.profiles for update
  using (auth.uid() = id or email in ('christianaboagye06@gmail.com', 'christianaaboagye06@gmail.com'));

-- 3. Backfill all existing auth.users into public.profiles right now!
insert into public.profiles (id, email, name, role, track, goal, time_commitment, experience_level, created_at, updated_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  case when u.email in ('christianaboagye06@gmail.com', 'christianaaboagye06@gmail.com') then 'admin' else 'student' end,
  'AI & Virtual Influencers',
  'Scale my personal brand',
  '5-15',
  'Beginner',
  u.created_at,
  now()
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  role = case when excluded.email in ('christianaboagye06@gmail.com', 'christianaaboagye06@gmail.com') then 'admin' else public.profiles.role end;

-- 4. Automatically sync any future signups from auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, track, goal, time_commitment, experience_level, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when new.email in ('christianaboagye06@gmail.com', 'christianaaboagye06@gmail.com') then 'admin' else 'student' end,
    'AI & Virtual Influencers',
    'Scale my personal brand',
    '5-15',
    'Beginner',
    new.created_at,
    now()
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Safe RPC function returning all registered users
create or replace function public.get_all_registered_users()
returns table (
  id uuid,
  email text,
  name text,
  role text,
  track text,
  goal text,
  time_commitment text,
  experience_level text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone
) security definer as $$
begin
  return query
  select
    u.id,
    u.email::text,
    coalesce(p.name, split_part(u.email, '@', 1))::text,
    case when u.email in ('christianaboagye06@gmail.com', 'christianaaboagye06@gmail.com') then 'admin' else coalesce(p.role, 'student') end::text,
    coalesce(p.track, 'AI & Virtual Influencers')::text,
    coalesce(p.goal, 'Scale my personal brand')::text,
    coalesce(p.time_commitment, '5-15')::text,
    coalesce(p.experience_level, 'Beginner')::text,
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  left join public.profiles p on u.id = p.id
  order by u.created_at desc;
end;
$$ language plpgsql;

grant execute on function public.get_all_registered_users() to anon, authenticated;
`;

export type FeedbackEntry = {
  id?: string;
  user_id?: string | null;
  user_email: string;
  track_slug?: string;
  track_title?: string;
  rating: number;
  priority?: string;
  pacing?: string;
  comments?: string;
  metadata?: any;
  created_at: string;
};

/**
 * Saves or updates creator profile in Supabase profiles table,
 * with graceful local fallback if offline or not logged in.
 */
export async function saveOnboardingData(
  arg1: string | OnboardingInput,
  arg2?: OnboardingInput
): Promise<Profile> {
  const email = typeof arg1 === "string" ? arg1 : "student@skill2bills.com";
  const onboarding = typeof arg1 === "string" ? arg2! : arg1;

  if (isSupabaseConfigured && supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const profileData = {
          id: user.id,
          email: user.email || email,
          track: onboarding.track,
          goal: onboarding.goal,
          time_commitment: onboarding.timeCommitment,
          experience_level: onboarding.experienceLevel,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("profiles")
          .upsert(profileData, { onConflict: "id" })
          .select()
          .single();

        if (!error && data) {
          return data as Profile;
        }
      }
    } catch {
      // Offline fallback
    }
  }

  // Resilient local storage persistence
  const fallbackProfile: Profile = {
    id: "local-user-" + Math.random().toString(36).substring(2, 9),
    email,
    track: onboarding.track,
    goal: onboarding.goal,
    time_commitment: onboarding.timeCommitment,
    experience_level: onboarding.experienceLevel,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    localStorage.setItem("skill2bill_creator_profile", JSON.stringify(fallbackProfile));
    const existing = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
    existing.unshift(fallbackProfile);
    localStorage.setItem("skill2bill_creator_leads", JSON.stringify(existing));
  } catch {
    // ignore
  }

  return fallbackProfile;
}

/**
 * Fetch all registered users directly from Supabase Auth via Service Role key
 */
export async function fetchSupabaseAuthUsers(serviceRoleKey?: string): Promise<{ users: Profile[]; error?: string }> {
  try {
    const adminClient = getSupabaseAdminClient(serviceRoleKey);
    if (!adminClient) {
      return { users: [], error: "No service role key configured. Enter your service_role secret key to query auth.users." };
    }

    const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      return { users: [], error: error.message };
    }

    if (!data?.users || !Array.isArray(data.users)) {
      return { users: [] };
    }

    const profiles: Profile[] = data.users.map((u: any) => {
      const email = (u.email || "").toLowerCase().trim();
      const isAdmin = ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(email);
      const name = u.user_metadata?.name || u.user_metadata?.full_name || email.split("@")[0] || "Learner";

      return {
        id: u.id,
        email,
        name,
        role: isAdmin ? "admin" : "student",
        track: "AI & Virtual Influencers",
        goal: "Scale personal brand & monetize",
        time_commitment: "5-15",
        experience_level: "Beginner",
        status: u.email_confirmed_at ? "Confirmed" : "Verified",
        source: "Supabase Auth",
        created_at: u.created_at || new Date().toISOString(),
        updated_at: u.updated_at,
        last_sign_in_at: u.last_sign_in_at,
      };
    });

    return { users: profiles };
  } catch (err: any) {
    return { users: [], error: err?.message || String(err) };
  }
}

/**
 * Batch sync auth users into public.profiles table
 */
export async function syncAuthUsersToProfiles(users: Profile[]): Promise<{ count: number; error?: string }> {
  if (!isSupabaseConfigured || !supabase || users.length === 0) {
    return { count: 0 };
  }

  let count = 0;
  for (const user of users) {
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email.toLowerCase().trim(),
          name: user.name || user.email.split("@")[0],
          role: user.role || "student",
          track: user.track || "AI & Virtual Influencers",
          goal: user.goal || "Scale personal brand & monetize",
          time_commitment: user.time_commitment || "5-15",
          experience_level: user.experience_level || "Beginner",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (!error) count++;
    } catch {
      // Continue next user
    }
  }

  return { count };
}

/**
 * Batch import user emails manually (e.g. pasted from Supabase Dashboard)
 */
export async function batchImportEmails(
  rawInput: string,
  assignedTrack: string = "AI & Virtual Influencers"
): Promise<Profile[]> {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = rawInput.match(emailRegex) || [];
  const uniqueEmails = Array.from(new Set(matches.map((e) => e.toLowerCase().trim())));

  if (uniqueEmails.length === 0) {
    return [];
  }

  const existingLeads: Profile[] = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
  const existingMap = new Map<string, Profile>();
  existingLeads.forEach((p) => existingMap.set(p.email.toLowerCase().trim(), p));

  const importedProfiles: Profile[] = [];

  for (const email of uniqueEmails) {
    const isAdmin = ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(email);
    const existing = existingMap.get(email);
    const newProfile: Profile = {
      id: existing?.id || "imported-" + Math.random().toString(36).substring(2, 9),
      email,
      name: email.split("@")[0],
      role: isAdmin ? "admin" : "student",
      track: assignedTrack,
      goal: "Scale personal brand & monetize",
      time_commitment: "5-15",
      experience_level: "Beginner",
      status: "Supabase User",
      source: "Supabase Import",
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    existingMap.set(email, newProfile);
    importedProfiles.push(newProfile);

    // Also attempt saving to Supabase profiles
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.name,
            role: newProfile.role,
            track: newProfile.track,
            goal: newProfile.goal,
            time_commitment: newProfile.time_commitment,
            experience_level: newProfile.experience_level,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );
      } catch {
        // ignore
      }
    }
  }

  const allUpdated = Array.from(existingMap.values());
  try {
    localStorage.setItem("skill2bill_creator_leads", JSON.stringify(allUpdated));
    window.dispatchEvent(new Event("skill2bills_profile_updated"));
  } catch {
    // ignore
  }

  return importedProfiles;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const profileMap = new Map<string, Profile>();

  // 1. First, check if Service Role Key is configured to query auth.users directly
  try {
    const adminClient = getSupabaseAdminClient();
    if (adminClient) {
      const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!authError && authData?.users && Array.isArray(authData.users)) {
        authData.users.forEach((u: any) => {
          const emailVal = (u.email || "").toLowerCase().trim();
          if (emailVal) {
            const isAdmin = ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(emailVal);
            profileMap.set(emailVal, {
              id: u.id,
              email: emailVal,
              name: u.user_metadata?.name || u.user_metadata?.full_name || emailVal.split("@")[0],
              role: isAdmin ? "admin" : "student",
              track: "AI & Virtual Influencers",
              goal: "Scale personal brand & monetize",
              time_commitment: "5-15",
              experience_level: "Beginner",
              status: u.email_confirmed_at ? "Confirmed" : "Verified",
              source: "Supabase Auth",
              created_at: u.created_at || new Date().toISOString(),
              updated_at: u.updated_at,
              last_sign_in_at: u.last_sign_in_at,
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn("Could not query auth.users via admin client:", err);
  }

  // 2. Try calling RPC get_all_registered_users (if SQL script was run)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_all_registered_users");
      if (!rpcError && rpcData && Array.isArray(rpcData)) {
        rpcData.forEach((u: any) => {
          const emailVal = (u.email || "").toLowerCase().trim();
          if (emailVal) {
            const existing = profileMap.get(emailVal);
            profileMap.set(emailVal, {
              id: u.id || existing?.id || `rpc-${Math.random().toString(36).substring(2, 8)}`,
              email: emailVal,
              name: u.name || existing?.name || emailVal.split("@")[0],
              role: u.role || existing?.role || (["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(emailVal) ? "admin" : "student"),
              track: u.track || existing?.track || "AI & Virtual Influencers",
              goal: u.goal || existing?.goal || "Scale personal brand & monetize",
              time_commitment: u.time_commitment || existing?.time_commitment || "5-15",
              experience_level: u.experience_level || existing?.experience_level || "Beginner",
              status: "Registered",
              source: "Supabase DB",
              created_at: u.created_at || existing?.created_at || new Date().toISOString(),
              last_sign_in_at: u.last_sign_in_at,
            });
          }
        });
      }
    } catch {
      // RPC not yet installed in Supabase
    }

    // 3. Fetch from Supabase profiles table
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Retry without order clause
        const retry = await supabase.from("profiles").select("*");
        data = retry.data;
      }

      if (data && Array.isArray(data)) {
        data.forEach((p: any) => {
          const emailVal = (p.email || p.user_email || "").toLowerCase().trim();
          if (emailVal) {
            const existing = profileMap.get(emailVal);
            const isAdmin = ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(emailVal);
            profileMap.set(emailVal, {
              id: p.id || existing?.id || `sp-${Math.random().toString(36).substring(2, 8)}`,
              email: emailVal,
              name: p.name || existing?.name || emailVal.split("@")[0],
              role: isAdmin ? "admin" : (p.role || existing?.role || "student"),
              track: p.track || p.track_slug || existing?.track || "AI & Virtual Influencers",
              goal: p.goal || existing?.goal || "Build personal brand & monetize",
              time_commitment: p.time_commitment || p.commitment || existing?.time_commitment || "5-15",
              experience_level: p.experience_level || p.experience || existing?.experience_level || "Beginner",
              status: "Active Learner",
              source: "Supabase Profiles",
              created_at: p.created_at || existing?.created_at || new Date().toISOString(),
              updated_at: p.updated_at,
            });
          }
        });
      }
    } catch (err) {
      console.warn("Could not fetch profiles from Supabase:", err);
    }

    // 4. Also check Supabase feedback table for users who submitted feedback
    try {
      const { data: fbData } = await supabase.from("feedback").select("*");
      if (fbData && Array.isArray(fbData)) {
        fbData.forEach((fb: any) => {
          const emailVal = (fb.user_email || fb.email || "").toLowerCase().trim();
          if (emailVal && !profileMap.has(emailVal)) {
            profileMap.set(emailVal, {
              id: fb.user_id || `fb-${Math.random().toString(36).substring(2, 8)}`,
              email: emailVal,
              name: emailVal.split("@")[0],
              role: "student",
              track: fb.track_title || fb.track_slug || "AI & Virtual Influencers",
              goal: "Active Learner (Feedback Submitted)",
              time_commitment: "5-15",
              experience_level: "Intermediate",
              status: "Feedback Submitter",
              source: "Supabase Feedback",
              created_at: fb.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // ignore
    }

    // 5. Also check newsletter subscribers
    try {
      const { data: newsData } = await supabase.from("newsletter_subscribers").select("*");
      if (newsData && Array.isArray(newsData)) {
        newsData.forEach((ns: any) => {
          const emailVal = (ns.email || "").toLowerCase().trim();
          if (emailVal && !profileMap.has(emailVal)) {
            profileMap.set(emailVal, {
              id: ns.id || `news-${Math.random().toString(36).substring(2, 8)}`,
              email: emailVal,
              name: emailVal.split("@")[0],
              role: "student",
              track: "AI & Virtual Influencers",
              goal: "Newsletter Subscriber",
              time_commitment: "5-15",
              experience_level: "Beginner",
              status: "Subscribed",
              source: "Newsletter",
              created_at: ns.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // ignore
    }
  }

  // 6. Local storage fallbacks & leads merge
  try {
    const localLeads = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
    localLeads.forEach((p: any) => {
      const emailVal = (p.email || "").toLowerCase().trim();
      if (emailVal && !profileMap.has(emailVal)) {
        profileMap.set(emailVal, {
          ...p,
          email: emailVal,
          track: p.track || "AI & Virtual Influencers",
          role: ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(emailVal) ? "admin" : (p.role || "student"),
        } as Profile);
      }
    });

    // Merge registered emails store
    const registeredEmails: string[] = JSON.parse(localStorage.getItem("skill2bills_registered_emails") || "[]");
    registeredEmails.forEach((email) => {
      const emailVal = email.toLowerCase().trim();
      if (emailVal && !profileMap.has(emailVal)) {
        profileMap.set(emailVal, {
          id: `reg-${Math.random().toString(36).substring(2, 8)}`,
          email: emailVal,
          name: emailVal.split("@")[0],
          role: ["christianaboagye06@gmail.com", "christianaaboagye06@gmail.com"].includes(emailVal) ? "admin" : "student",
          track: "AI & Virtual Influencers",
          goal: "Scale personal brand & monetize",
          time_commitment: "5-15",
          experience_level: "Beginner",
          status: "Verified",
          source: "Auth Signup",
          created_at: new Date().toISOString(),
        });
      }
    });

    const singleProfile = JSON.parse(localStorage.getItem("skill2bill_creator_profile") || "null");
    if (singleProfile && singleProfile.email) {
      const emailVal = singleProfile.email.toLowerCase().trim();
      if (!profileMap.has(emailVal)) {
        profileMap.set(emailVal, {
          ...singleProfile,
          email: emailVal,
          track: singleProfile.track || "AI & Virtual Influencers",
        } as Profile);
      }
    }
  } catch {
    // ignore
  }

  // Ensure Admin is always included
  const adminEmail = "christianaboagye06@gmail.com";
  if (!profileMap.has(adminEmail)) {
    profileMap.set(adminEmail, {
      id: "admin-christian",
      email: adminEmail,
      name: "Christian Aboagye",
      role: "admin",
      track: "AI & Virtual Influencers",
      goal: "Platform Founder & Director",
      time_commitment: "15+",
      experience_level: "Advanced",
      status: "Super Admin",
      source: "System Admin",
      created_at: new Date("2026-09-01").toISOString(),
    });
  } else {
    // Guarantee admin role
    const adminRecord = profileMap.get(adminEmail)!;
    adminRecord.role = "admin";
    if (!adminRecord.track || adminRecord.track.includes("clipping")) {
      adminRecord.track = "AI & Virtual Influencers";
    }
  }

  return Array.from(profileMap.values()).sort((a, b) => {
    // Put admin on top, then newest created
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (b.role === "admin" && a.role !== "admin") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}


export async function getAllFeedbacks(): Promise<FeedbackEntry[]> {
  const feedbacks: FeedbackEntry[] = [];
  const seenKeys = new Set<string>();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && Array.isArray(data)) {
        data.forEach((fb: any) => {
          const key = `${fb.user_email}-${fb.created_at}`;
          seenKeys.add(key);
          feedbacks.push({
            id: fb.id,
            user_id: fb.user_id,
            user_email: fb.user_email || "Anonymous",
            track_slug: fb.track_slug,
            track_title: fb.track_title || "Skill2Bills",
            rating: typeof fb.rating === "number" ? fb.rating : 5,
            priority: fb.priority,
            pacing: fb.pacing,
            comments: fb.comments,
            metadata: fb.metadata,
            created_at: fb.created_at || new Date().toISOString(),
          });
        });
      }
    } catch (err) {
      console.warn("Could not fetch feedback from Supabase:", err);
    }
  }

  // Merge local storage feedbacks
  try {
    const localFeedbacks = JSON.parse(localStorage.getItem("skill2bills_all_feedbacks") || "[]");
    localFeedbacks.forEach((fb: any) => {
      const key = `${fb.userEmail}-${fb.submittedAt}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        feedbacks.push({
          id: `local-${Math.random().toString(36).substring(2, 8)}`,
          user_email: fb.userEmail || "Anonymous Learner",
          track_slug: fb.trackSlug,
          track_title: fb.trackTitle || "Skill2Bills",
          rating: typeof fb.rating === "number" ? fb.rating : 5,
          priority: fb.difficulty,
          pacing: fb.pace,
          comments: `Most useful: ${fb.mostUseful || ""} | To improve: ${fb.oneImprovement || ""}`,
          metadata: {
            easeLevel: fb.easeLevel,
            readyForNext: fb.readyForNext,
            deviceUsed: fb.deviceUsed,
            completedCount: fb.completedCount,
          },
          created_at: fb.submittedAt || new Date().toISOString(),
        });
      }
    });
  } catch {
    // ignore
  }

  return feedbacks.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
