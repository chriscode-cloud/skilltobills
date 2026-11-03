import { supabase, isSupabaseConfigured, Profile } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: "student" | "instructor" | "admin";
  onboardingCompleted?: boolean;
  username?: string;
  avatar?: string;
  bio?: string;
  links?: Record<string, string>;
  emailNotifications?: boolean;
  track?: string;
  goal?: string;
  timeCommitment?: string;
  experienceLevel?: string;
  createdAt: string;
}

export const ADMIN_EMAILS = [
  "christianaboagye06@gmail.com",
  "christianaaboagye06@gmail.com",
];

export const AUTH_STORAGE_KEY = "skill2bills_auth_user_v1";

/**
 * Retrieve cached user from localStorage
 */
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && ADMIN_EMAILS.includes(parsed.email.toLowerCase().trim())) {
      parsed.role = "admin";
      parsed.onboardingCompleted = true;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Update cached user state and broadcast event
 */
export function setStoredUser(user: AuthUser): void {
  try {
    if (user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
      user.role = "admin";
      user.onboardingCompleted = true;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("skill2bills_auth_changed", { detail: user }));
    
    // Save or update profile directly in database (no Supabase Auth dependency)
    saveUserProfileToDatabase(user).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Clear cached user state (log out)
 */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem("skill2bills_redirect");
    window.dispatchEvent(new CustomEvent("skill2bills_auth_changed", { detail: null }));
  } catch {
    // ignore
  }
}

/**
 * Persists profile to database table directly
 */
export async function saveUserProfileToDatabase(user: AuthUser): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email.toLowerCase().trim(),
          name: user.name || user.email.split("@")[0],
          role: user.role || "student",
          onboarding_completed: Boolean(user.onboardingCompleted),
          track: user.track || "ai-virtual-influencers",
          goal: user.goal,
          time_commitment: user.timeCommitment,
          experience_level: user.experienceLevel,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (err) {
      console.warn("Could not save profile directly to DB table:", err);
    }
  }
}

/**
 * Validates active session synchronously or from local DB state
 */
export async function getLiveSession(): Promise<AuthUser | null> {
  const current = getStoredUser();
  if (current) {
    if (ADMIN_EMAILS.includes(current.email.toLowerCase().trim())) {
      current.role = "admin";
      current.onboardingCompleted = true;
    }
    return current;
  }
  return null;
}

/**
 * Check if active user is an admin
 */
export function isUserAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  const email = (user.email || "").toLowerCase().trim();
  if (ADMIN_EMAILS.includes(email)) return true;
  return user.role === "admin";
}

/**
 * Quick synchronous check against cached state
 */
export function isAuthenticated(): boolean {
  return Boolean(getStoredUser());
}

/**
 * Helper to decode Google JWT ID Token payload (client-side)
 */
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
