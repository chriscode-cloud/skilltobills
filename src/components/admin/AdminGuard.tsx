import React, { useEffect, useState } from "react";
import { AuthUser, isUserAdmin } from "../../lib/auth";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { ShieldAlert, Loader2 } from "lucide-react";

interface AdminGuardProps {
  currentUser: AuthUser | null;
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ currentUser, children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      // Server-side RLS verification
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!error && data?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(isUserAdmin(currentUser));
        }
      } else {
        setIsAdmin(isUserAdmin(currentUser));
      }
    };

    checkAdmin();
  }, [currentUser]);

  if (isAdmin === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4F636]" />
        <p className="text-xs text-zinc-400 font-mono">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          You do not have administrative privileges to view this portal. If you need admin access, please contact the platform administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
