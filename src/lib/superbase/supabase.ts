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

  if (isSupabaseConfigured) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            track: onboarding.track,
            goal: onboarding.goal,
            time_commitment: onboarding.timeCommitment,
            experience_level: onboarding.experienceLevel,
          })
          .eq("id", user.id)
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
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Profile[];
      }
    } catch {
      // Offline fallback
    }
  }

  try {
    const localLeads = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
    const singleProfile = JSON.parse(localStorage.getItem("skill2bill_creator_profile") || "null");
    const combined: Profile[] = [...localLeads];
    if (
      singleProfile &&
      singleProfile.email &&
      !combined.some((c) => c.email.toLowerCase() === singleProfile.email.toLowerCase())
    ) {
      combined.unshift(singleProfile);
    }
    return combined;
  } catch {
    return [];
  }
}
