import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_PROJECT_URL = "https://pvsrowtmzpgmieooafbn.supabase.co";
export const DEFAULT_PROJECT_KEY = "sb_publishable_oXrM0xJLWZ-mZqoLjVwfCA_cCg_Kp6R";

function isPlaceholder(val: string | undefined | null): boolean {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    !lower ||
    lower.includes("your-project") ||
    lower.includes("your_project") ||
    lower.includes("your-supabase") ||
    lower.includes("your_supabase") ||
    lower.includes("your_") ||
    lower.includes("my_") ||
    lower.includes("placeholder") ||
    lower.includes("example") ||
    lower.includes("your-anon-key") ||
    lower === "your-supabase-anon-key"
  );
}

// Clean up stale placeholder values from localStorage on load
if (typeof window !== "undefined") {
  try {
    const storedUrl = localStorage.getItem("skill2bills_supabase_url");
    if (storedUrl && isPlaceholder(storedUrl)) {
      localStorage.removeItem("skill2bills_supabase_url");
    }
    const storedKey = localStorage.getItem("skill2bills_supabase_key");
    if (storedKey && isPlaceholder(storedKey)) {
      localStorage.removeItem("skill2bills_supabase_key");
    }
  } catch {
    // Ignore
  }
}

function normalizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl || isPlaceholder(rawUrl)) return DEFAULT_PROJECT_URL;
  let url = rawUrl.trim();

  // If user provided just a project reference ID (e.g. 'pvsrowtmzpgmieooafbn')
  if (/^[a-z0-9_-]+$/i.test(url) && !url.includes(".")) {
    url = `https://${url}.supabase.co`;
  } else if (!/^https?:\/\//i.test(url)) {
    // If entered without protocol (e.g. 'pvsrowtmzpgmieooafbn.supabase.co')
    url = `https://${url.replace(/^\/+/, "")}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin;
    }
  } catch {
    return DEFAULT_PROJECT_URL;
  }
  return DEFAULT_PROJECT_URL;
}

function normalizeSupabaseKey(rawKey: string | undefined): string {
  if (!rawKey || isPlaceholder(rawKey)) return DEFAULT_PROJECT_KEY;
  return rawKey.trim();
}

const getRawUrl = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("skill2bills_supabase_url");
      if (stored && !isPlaceholder(stored)) return stored;
    } catch {
      // Ignore
    }
  }
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && !isPlaceholder(envUrl)) return envUrl;
  return DEFAULT_PROJECT_URL;
};

const getRawKey = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("skill2bills_supabase_key");
      if (stored && !isPlaceholder(stored)) return stored;
    } catch {
      // Ignore
    }
  }
  const envKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && !isPlaceholder(envKey)) return envKey;
  return DEFAULT_PROJECT_KEY;
};

const getRawServiceRoleKey = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("skill2bills_supabase_service_role_key");
      if (stored && !isPlaceholder(stored)) return stored.trim();
    } catch {
      // Ignore
    }
  }
  const envServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (envServiceKey && !isPlaceholder(envServiceKey)) return envServiceKey.trim();
  return "";
};

const rawUrl = getRawUrl();
const rawKey = getRawKey();
const rawServiceKey = getRawServiceRoleKey();

export const supabaseUrl = normalizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = normalizeSupabaseKey(rawKey);
export const supabaseServiceRoleKey = rawServiceKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)
);

export function setCustomSupabaseCredentials(url: string, key: string, serviceKey?: string) {
  if (typeof window !== "undefined") {
    if (!isPlaceholder(url)) {
      localStorage.setItem("skill2bills_supabase_url", url.trim());
    } else {
      localStorage.removeItem("skill2bills_supabase_url");
    }
    if (!isPlaceholder(key)) {
      localStorage.setItem("skill2bills_supabase_key", key.trim());
    } else {
      localStorage.removeItem("skill2bills_supabase_key");
    }
    if (serviceKey && !isPlaceholder(serviceKey)) {
      localStorage.setItem("skill2bills_supabase_service_role_key", serviceKey.trim());
    }
    window.location.reload();
  }
}

export function setCustomServiceRoleKey(serviceKey: string) {
  if (typeof window !== "undefined") {
    if (serviceKey && !isPlaceholder(serviceKey)) {
      localStorage.setItem("skill2bills_supabase_service_role_key", serviceKey.trim());
    } else {
      localStorage.removeItem("skill2bills_supabase_service_role_key");
    }
    window.dispatchEvent(new Event("skill2bills_service_key_updated"));
  }
}

export function clearCustomServiceRoleKey() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("skill2bills_supabase_service_role_key");
    window.dispatchEvent(new Event("skill2bills_service_key_updated"));
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("skill2bills_supabase_url");
    localStorage.removeItem("skill2bills_supabase_key");
    localStorage.removeItem("skill2bills_supabase_service_role_key");
    window.location.reload();
  }
}

function initSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  });
}

export const supabase = initSupabaseClient();

/**
 * Creates an admin client using the service role key to query auth.users
 */
export function getSupabaseAdminClient(overrideKey?: string): SupabaseClient | null {
  const activeServiceKey = overrideKey?.trim() || getRawServiceRoleKey();
  if (!activeServiceKey || isPlaceholder(activeServiceKey)) {
    return null;
  }
  return createClient(supabaseUrl, activeServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

