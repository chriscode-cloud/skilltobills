

import { supabase } from "./client";


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
  updated_at: string;
};


export async function saveOnboardingData(onboarding: OnboardingInput): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) {
    throw new Error("You must be signed in to save onboarding data.");
  }

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

  if (error) throw error;
  return data as Profile;
}


export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

