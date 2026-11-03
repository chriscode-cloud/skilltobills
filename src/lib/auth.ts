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

export const AUTH_STORAGE_KEY = "skill2bills_auth_user_v2";

/**
 * Retrieve cached user from localStorage
 */
export function getStoredUser(): AuthUser | null {
  try {
    // Try v2 key first, fallback to v1 key for migration
    let raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem("skill2bills_auth_user_v1");
      if (raw) {
        localStorage.removeItem("skill2bills_auth_user_v1");
      }
    }
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.email) return null;

    const emailLower = (parsed.email || "").toLowerCase().trim();

    // Auto-grant admin role, onboarding, and guarantee primary track for designated admin emails
    if (ADMIN_EMAILS.includes(emailLower) || parsed.role === "admin") {
      parsed.role = "admin";
      parsed.onboardingCompleted = true;
      if (!parsed.track || parsed.track === "content-clipping" || parsed.track === "content-creation" || parsed.track === "none") {
        parsed.track = "ai-virtual-influencers";
      }
    }

    // Cache normalization:
    // If track is missing or contains legacy clipping default, prioritize primary programme "ai-virtual-influencers"
    if (!parsed.track || parsed.track === "none" || parsed.track === "content-creation" || parsed.track === "content-clipping") {
      parsed.track = "ai-virtual-influencers";
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
    const emailLower = (user?.email || "").toLowerCase().trim();
    if (user && emailLower && (ADMIN_EMAILS.includes(emailLower) || user.role === "admin")) {
      user.role = "admin";
      user.onboardingCompleted = true;
      if (!user.track || user.track === "content-clipping" || user.track === "content-creation" || user.track === "none") {
        user.track = "ai-virtual-influencers";
      }
    }

    // Ensure valid track - default to primary programme
    if (!user.track || user.track === "none" || user.track === "content-creation" || user.track === "content-clipping") {
      user.track = "ai-virtual-influencers";
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
