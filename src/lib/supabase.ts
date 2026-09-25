import { createClient } from "@supabase/supabase-js";

// Safe, non-blocking check for Supabase environment credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl) &&
  !supabaseUrl.includes("YOUR_") &&
  !supabaseUrl.includes("MY_")
);

// Lazy initialize client or return null if not configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseProfile {
  id: string;
  email: string;
  track?: string;
  goal?: string;
  time_commitment?: string;
  experience_level?: string;
  created_at?: string;
}

/**
 * Saves or updates creator profile in Supabase database.
 * If Supabase is not configured, it acts as a local fallback persistence.
 */
export async function saveOnboardingData(
  email: string,
  onboarding: {
    track: string;
    goal: string;
    timeCommitment: string;
    experienceLevel: string;
  }
) {
  if (!supabase) {
    console.warn("Supabase is not configured. Saving onboarding data to localStorage fallback.");
    const fallbackProfile: SupabaseProfile = {
      id: "local-user-" + Math.random().toString(36).substring(2, 9),
      email,
      track: onboarding.track,
      goal: onboarding.goal,
      time_commitment: onboarding.timeCommitment,
      experience_level: onboarding.experienceLevel,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("skill2bill_creator_profile", JSON.stringify(fallbackProfile));
    return fallbackProfile;
  }

  try {
    // 1. Get current user if exists
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "anonymous-onboarding";

    // 2. Upsert profile into public.profiles table
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email,
        track: onboarding.track,
        goal: onboarding.goal,
        time_commitment: onboarding.timeCommitment,
        experience_level: onboarding.experienceLevel,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as SupabaseProfile;
  } catch (err) {
    console.error("Error upserting Supabase profile:", err);
    // Silent failover to localStorage for robust preview continuity
    const fallbackProfile: SupabaseProfile = {
      id: "local-user-" + Math.random().toString(36).substring(2, 9),
      email,
      track: onboarding.track,
      goal: onboarding.goal,
      time_commitment: onboarding.timeCommitment,
      experience_level: onboarding.experienceLevel,
      created_at: new Date().toISOString(),
    };

    // Store in historical list so admin can see multiple leads even offline
    try {
      const existing = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
      existing.unshift(fallbackProfile);
      localStorage.setItem("skill2bill_creator_leads", JSON.stringify(existing));
    } catch {
      // ignore
    }

    localStorage.setItem("skill2bill_creator_profile", JSON.stringify(fallbackProfile));
    return fallbackProfile;
  }
}

/**
 * Fetches all registered creator pilot signups from Supabase profiles,
 * falling back gracefully to real local user signups stored in localStorage.
 * Does not return any fake or seeded leads.
 */
export async function getAllProfiles(): Promise<SupabaseProfile[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as SupabaseProfile[];
      }
    } catch (err) {
      console.warn("Supabase fetch profiles warning, falling back to local leads:", err);
    }
  }

  // Return strictly actual local signups created on this device/app
  try {
    const localLeads = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
    const singleProfile = JSON.parse(localStorage.getItem("skill2bill_creator_profile") || "null");
    
    const combined: SupabaseProfile[] = [...localLeads];
    if (singleProfile && singleProfile.email && !combined.some(c => c.email.toLowerCase() === singleProfile.email.toLowerCase())) {
      combined.unshift(singleProfile);
    }
    return combined;
  } catch {
    return [];
  }
}
