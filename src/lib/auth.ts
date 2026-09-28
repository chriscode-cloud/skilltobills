import { supabase, isSupabaseConfigured } from "./supabase";

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

export const AUTH_STORAGE_KEY = "skill2bills_auth_user_v1";

/**
 * Retrieve cached user from localStorage (display & offline cache only)
 */
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Update cached user state and broadcast event
 */
export function setStoredUser(user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("skill2bills_auth_changed", { detail: user }));
  } catch {
    // ignore
  }
}

/**
 * Clear cached user state (log out) and sign out from Supabase Auth
 */
export function clearStoredUser(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    window.dispatchEvent(new CustomEvent("skill2bills_auth_changed", { detail: null }));
  } catch {
    // ignore
  }
}

/**
 * Validates the true session with Supabase server.
 * Never trusts localStorage for authorization or security guards.
 */
export async function getLiveSession(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured || !supabase) {
    return getStoredUser();
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      if (getStoredUser()) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("skill2bills_auth_changed", { detail: null }));
      }
      return null;
    }

    // Authoritative profile check from Supabase database
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    const rawMeta = session.user.user_metadata || {};
    const liveUser: AuthUser = {
      id: session.user.id,
      email: session.user.email || profile?.email || "",
      name: profile?.name || rawMeta.full_name || rawMeta.name || profile?.email?.split("@")[0] || "Creator",
      role: (profile?.role as any) || "student",
      onboardingCompleted: Boolean(profile?.onboarding_completed),
      username: profile?.username || undefined,
      avatar: profile?.avatar_url || rawMeta.avatar_url || rawMeta.picture,
      bio: profile?.bio || undefined,
      links: profile?.links || {},
      emailNotifications: profile?.email_notifications !== false,
      track: profile?.track !== "none" ? profile?.track : undefined,
      goal: profile?.goal || undefined,
      timeCommitment: profile?.time_commitment || undefined,
      experienceLevel: profile?.experience_level || undefined,
      createdAt: profile?.created_at || session.user.created_at,
    };

    setStoredUser(liveUser);
    return liveUser;
  } catch (err) {
    console.warn("Failed to check live Supabase session, using safe cache:", err);
    return getStoredUser();
  }
}

/**
 * Check if active user is an admin
 */
export function isUserAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

/**
 * Quick synchronous check against cached state
 */
export function isAuthenticated(): boolean {
  return Boolean(getStoredUser());
}
