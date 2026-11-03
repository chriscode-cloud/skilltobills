import { supabase, isSupabaseConfigured } from "./client";

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
};

export type SupabaseProfile = Profile;

export { supabase, isSupabaseConfigured };

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

export async function getAllProfiles(): Promise<Profile[]> {
  const profileMap = new Map<string, Profile>();

  // 1. Fetch from Supabase profiles table
  if (isSupabaseConfigured && supabase) {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Retry without order clause if created_at column missing/different
        const retry = await supabase.from("profiles").select("*");
        data = retry.data;
      }

      if (data && Array.isArray(data)) {
        data.forEach((p: any) => {
          const emailVal = p.email || p.user_email;
          if (emailVal) {
            profileMap.set(emailVal.toLowerCase().trim(), {
              id: p.id || `sp-${Math.random().toString(36).substring(2, 8)}`,
              email: emailVal,
              track: p.track || p.track_slug || "AI & Virtual Influencers",
              goal: p.goal || "Build personal brand & monetize",
              time_commitment: p.time_commitment || p.commitment || "5-15",
              experience_level: p.experience_level || p.experience || "Beginner",
              created_at: p.created_at || new Date().toISOString(),
              updated_at: p.updated_at,
            });
          }
        });
      }
    } catch (err) {
      console.warn("Could not fetch profiles from Supabase:", err);
    }

    // 2. Also check Supabase feedback table for users who submitted feedback
    try {
      const { data: fbData } = await supabase.from("feedback").select("*");
      if (fbData && Array.isArray(fbData)) {
        fbData.forEach((fb: any) => {
          const emailVal = fb.user_email || fb.email;
          if (emailVal && !profileMap.has(emailVal.toLowerCase().trim())) {
            profileMap.set(emailVal.toLowerCase().trim(), {
              id: fb.user_id || `fb-${Math.random().toString(36).substring(2, 8)}`,
              email: emailVal,
              track: fb.track_title || fb.track_slug || "AI & Virtual Influencers",
              goal: "Active Learner (Feedback Submitted)",
              time_commitment: "5-15",
              experience_level: "Intermediate",
              created_at: fb.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // ignore
    }
  }

  // 3. Local storage fallbacks & leads merge
  try {
    const localLeads = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
    localLeads.forEach((p: any) => {
      if (p.email && !profileMap.has(p.email.toLowerCase().trim())) {
        profileMap.set(p.email.toLowerCase().trim(), p as Profile);
      }
    });

    const singleProfile = JSON.parse(localStorage.getItem("skill2bill_creator_profile") || "null");
    if (singleProfile && singleProfile.email && !profileMap.has(singleProfile.email.toLowerCase().trim())) {
      profileMap.set(singleProfile.email.toLowerCase().trim(), singleProfile as Profile);
    }

    // Merge any stored local feedbacks
    const localFeedbacks = JSON.parse(localStorage.getItem("skill2bills_all_feedbacks") || "[]");
    localFeedbacks.forEach((fb: any) => {
      const emailVal = fb.userEmail || fb.user_email;
      if (emailVal && !profileMap.has(emailVal.toLowerCase().trim())) {
        profileMap.set(emailVal.toLowerCase().trim(), {
          id: `local-fb-${Math.random().toString(36).substring(2, 8)}`,
          email: emailVal,
          track: fb.trackTitle || fb.trackSlug || "Skill2Bills Learner",
          goal: "Feedback Contributor",
          time_commitment: "5-15",
          experience_level: "Beginner",
          created_at: fb.submittedAt || new Date().toISOString(),
        });
      }
    });
  } catch {
    // ignore
  }

  return Array.from(profileMap.values());
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
