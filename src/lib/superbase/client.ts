import { createClient, SupabaseClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  if (
    !url ||
    url.includes("YOUR_") ||
    url.includes("MY_") ||
    url.toLowerCase().includes("placeholder")
  ) {
    return "";
  }

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
    return "";
  }
  return "";
}

function normalizeSupabaseKey(rawKey: string | undefined): string {
  if (!rawKey) return "";
  const key = rawKey.trim();
  if (
    !key ||
    key.includes("YOUR_") ||
    key.includes("MY_") ||
    key.toLowerCase().includes("placeholder")
  ) {
    return "";
  }
  return key;
}

const getRawUrl = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("skill2bills_supabase_url");
      if (stored) return stored;
    } catch {
      // Ignore
    }
  }
  return import.meta.env.VITE_SUPABASE_URL || "";
};

const getRawKey = (): string => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("skill2bills_supabase_key");
      if (stored) return stored;
    } catch {
      // Ignore
    }
  }
  return (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ""
  );
};

const rawUrl = getRawUrl();
const rawKey = getRawKey();

export const supabaseUrl = normalizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = normalizeSupabaseKey(rawKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("skill2bills_supabase_url", url.trim());
    localStorage.setItem("skill2bills_supabase_key", key.trim());
    window.location.reload();
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("skill2bills_supabase_url");
    localStorage.removeItem("skill2bills_supabase_key");
    window.location.reload();
  }
}


const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

function initSupabaseClient(): SupabaseClient {
  if (isSupabaseConfigured) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "implicit",
        },
      });
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
    }
  }
  return createClient(fallbackUrl, fallbackKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = initSupabaseClient();

