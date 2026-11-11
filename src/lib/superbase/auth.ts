import { supabase, clearCustomServiceRoleKey } from "./client";
import { Profile } from "./supabase";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(redirectTo: string = window.location.origin) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}

export async function sendMagicLink(email: string, redirectTo: string = window.location.origin) {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  if (error) throw error;
  return data;
}

export async function verifyOtpCode(
  email: string,
  token: string,
  type: "email" | "magiclink" | "signup" = "email"
) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  // Primary verification attempt
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type,
    });
    if (!error && data?.session) {
      return data;
    }
    if (error) throw error;
    return data;
  } catch (err: any) {
    // Fallback attempts if type mismatch (e.g., signup vs email)
    if (type === "email") {
      try {
        const { data: fallbackData, error: fallbackError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "magiclink",
        });
        if (!fallbackError && fallbackData?.session) {
          return fallbackData;
        }
      } catch {
        // continue
      }
      try {
        const { data: signupData, error: signupError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: "signup",
        });
        if (!signupError && signupData?.session) {
          return signupData;
        }
      } catch {
        // continue
      }
    }
    throw err;
  }
}

export async function signOut() {
  clearCustomServiceRoleKey();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateMyProfile(updates: Partial<Profile>): Promise<Profile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => subscription.unsubscribe();
}
