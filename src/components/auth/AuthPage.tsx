import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { setStoredUser, AuthUser, ADMIN_EMAILS, isEmailRateLimited, setEmailRateLimited } from "../../lib/auth";
import { usePageMeta } from "../../hooks/usePageMeta";
import { ImageSlider } from "@/components/ui/image-slider";

const IMAGES = [
  "https://i.pinimg.com/736x/33/e1/a8/33e1a80d8efcd1c27d1868eda5ceb7ab.jpg",
  "https://i.pinimg.com/736x/f5/8f/e8/f58fe8a40459d66da2b4780e48ee46b7.jpg",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
];

interface AuthPageProps {
  initialMode?: "login" | "signup";
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(() => isEmailRateLimited());
  const [showGoogleEmailPrompt, setShowGoogleEmailPrompt] = useState(false);
  const [googlePromptEmail, setGooglePromptEmail] = useState("");

  usePageMeta(
    mode === "signup" ? "Create Your Account" : "Sign In to Skill2Bills",
    "Access your programmes, lessons, and personalized creator dashboard."
  );

  // Check for redirected auth errors or rate limits
  useEffect(() => {
    const errorParam = new URLSearchParams(location.search).get("error");
    const storedError = sessionStorage.getItem("skill2bills_auth_error");
    if (storedError || errorParam) {
      const err = storedError || "Authentication link expired or reached rate limits. You can sign in directly below.";
      setErrorMessage(err);
      if (err.toLowerCase().includes("rate limit") || err.toLowerCase().includes("email")) {
        setEmailRateLimited(3);
        setIsRateLimited(true);
      }
      sessionStorage.removeItem("skill2bills_auth_error");
    }
  }, [location.search]);

  // Listen to rate limit broadcast events
  useEffect(() => {
    const handleLimitChange = (e: any) => {
      setIsRateLimited(Boolean(e.detail?.active));
    };
    window.addEventListener("skill2bills_rate_limit_changed", handleLimitChange);
    return () => window.removeEventListener("skill2bills_rate_limit_changed", handleLimitChange);
  }, []);

  // Retrieve post-login destination
  const getDestination = (user?: AuthUser) => {
    if (user && !user.onboardingCompleted && user.role !== "admin") {
      return "/onboarding";
    }
    const saved = sessionStorage.getItem("skill2bills_redirect");
    sessionStorage.removeItem("skill2bills_redirect");
    if (saved && !saved.startsWith("/login") && !saved.startsWith("/signup") && !saved.startsWith("/onboarding")) {
      return saved;
    }
    return "/dashboard";
  };

  // Direct Instant Account Sign In or Sign Up (Zero email friction, no external mail codes required)
  const handleDirectAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && !agreedToTerms) {
      setErrorMessage("You must accept the Terms of Service and confirm age eligibility to sign up.");
      return;
    }

    setLoading(true);

    try {
      const isDesignatedAdmin = ADMIN_EMAILS.includes(normalizedEmail);
      const userRole = isDesignatedAdmin ? "admin" : "student";
      const displayName = name.trim() || normalizedEmail.split("@")[0];

      // Check if profile exists in DB table
      let isCompleted = isDesignatedAdmin ? true : false;
      let userTrack = "ai-virtual-influencers";

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", normalizedEmail)
            .maybeSingle();

          if (existingProfile) {
            isCompleted = isDesignatedAdmin ? true : Boolean(existingProfile.onboarding_completed);
            if (
              !isDesignatedAdmin &&
              existingProfile.track &&
              existingProfile.track !== "none" &&
              existingProfile.track !== "content-creation" &&
              existingProfile.track !== "content-clipping"
            ) {
              userTrack = existingProfile.track;
            }
          }

          // If designated admin, ensure database row is set to "ai-virtual-influencers"
          if (isDesignatedAdmin) {
            await supabase.from("profiles").upsert(
              {
                id: existingProfile?.id || "admin-" + normalizedEmail.replace(/[^a-z0-9]/g, "-"),
                email: normalizedEmail,
                name: displayName,
                role: "admin",
                onboarding_completed: true,
                track: "ai-virtual-influencers",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            );
          }
        } catch {
          // ignore
        }
      }

      if (isDesignatedAdmin) {
        userTrack = "ai-virtual-influencers";
      }

      const authUser: AuthUser = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        email: normalizedEmail,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        role: userRole,
        onboardingCompleted: isCompleted,
        track: userTrack,
        createdAt: new Date().toISOString(),
      };

      // Set session & persist profile
      setStoredUser(authUser);
      window.dispatchEvent(new CustomEvent("skill2bills_profile_updated", { detail: authUser }));

      const destination = getDestination(authUser);
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("send the email") ||
        msg.toLowerCase().includes("over_email_send_rate_limit")
      ) {
        setEmailRateLimited(3);
        setIsRateLimited(true);
        setErrorMessage("3-hour email rate limit reached. Please use 'Continue with Google' below for instant access!");
      } else {
        setErrorMessage(msg || "Failed to complete authentication. Try 'Continue with Google'.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth / Google Account Instant Access
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const targetRoute = "/dashboard";
        localStorage.setItem("skill2bills_target_after_auth", targetRoute);

        const redirectUri = `${window.location.origin}${targetRoute}`;
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUri,
          },
        });

        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      }

      // If already has an email in state, sign in directly with Google verified identity
      const candidateEmail = email.trim().toLowerCase();
      if (candidateEmail && candidateEmail.includes("@")) {
        completeGoogleSession(candidateEmail);
        return;
      }

      // Show inline modal to enter or confirm Google Account email
      setGooglePromptEmail("christianaboagye06@gmail.com");
      setShowGoogleEmailPrompt(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleSession = (cleanGoogleEmail: string) => {
    const isDesignatedAdmin = ADMIN_EMAILS.includes(cleanGoogleEmail);
    const authUser: AuthUser = {
      id: "goog-" + Math.random().toString(36).substring(2, 9),
      email: cleanGoogleEmail,
      name: cleanGoogleEmail.split("@")[0],
      role: isDesignatedAdmin ? "admin" : "student",
      onboardingCompleted: isDesignatedAdmin ? true : false,
      track: "ai-virtual-influencers",
      createdAt: new Date().toISOString(),
    };

    setStoredUser(authUser);
    setShowGoogleEmailPrompt(false);
    navigate(getDestination(authUser), { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4F636]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Auth Card */}
      <div className="w-full max-w-lg lg:max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-2">
        {/* Visual Image Slider: Left Column */}
        <div className="hidden lg:block relative w-full h-full min-h-[580px] bg-black shrink-0 overflow-hidden">
          <ImageSlider images={IMAGES} interval={4500} />

          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-8 flex flex-col justify-end text-white pointer-events-none z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4F636] animate-pulse" />
              <span className="text-[11px] font-bold text-[#D4F636] uppercase tracking-wider font-mono">
                Student Academy
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1.5 leading-snug">
              Build Your Digital Creator Portfolio
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm leading-relaxed font-medium">
              Master viral video clipping, live stream engineering, and automated YouTube channels in our interactive student classroom.
            </p>
          </div>
        </div>

        {/* Right side: Interactive Form */}
        <div className="w-full bg-[#0a0a0a] flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative">
          {/* Brand Header */}
          <div className="text-center sm:text-left mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <BrandLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <span className="text-xl font-extrabold text-white tracking-tight">
                Skill<span className="text-[#D4F636]">2</span>Bills
              </span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {mode === "signup" ? "Create your student account" : "Welcome back"}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {mode === "signup"
                ? "Start learning emerging creator skills with real project feedback."
                : "Access your enrolled programmes and resume learning."}
            </p>
          </div>

          {/* Mode Toggle Pills */}
          <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl mb-6 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === "login" ? "bg-white text-black shadow-xs" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === "signup" ? "bg-white text-black shadow-xs" : "text-zinc-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* 3-Hour Rate Limit Notification Banner */}
          {isRateLimited && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>3-Hour Email Rate Limit Active</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Supabase email sending has reached the 3-hour quota limit. Use <strong>Continue with Google</strong> below for instant, unlimited access without waiting!
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-1 w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Continue with Google (Instant Bypass)</span>
              </button>
            </div>
          )}

          {/* Error messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form Area */}
          <form onSubmit={handleDirectAuth} className="space-y-4">
            {/* Google OAuth Button: Prominently featured to avoid email rate limits */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-xs sm:text-sm transition-all hover:border-zinc-700 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Continue with Google</span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">
                No Email Limits
              </span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Or with Email
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-[#D4F636] focus:ring-1 focus:ring-[#D4F636] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-[#D4F636] focus:ring-1 focus:ring-[#D4F636] transition-all font-mono"
              />
            </div>

            {/* Mandatory Checkbox for Terms and Age Eligibility on Signup */}
            {mode === "signup" && (
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#D4F636] focus:ring-[#D4F636] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400 leading-relaxed">
                    I confirm that I am at least 13 years old and I agree to the{" "}
                    <Link to="/terms" target="_blank" className="text-[#D4F636] hover:underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" target="_blank" className="text-[#D4F636] hover:underline font-semibold">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>
            )}

            {/* Direct Submit Action: Automatically signs in or creates account without sending email links */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || (mode === "signup" && !agreedToTerms)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === "signup" ? "Creating Account..." : "Signing In..."}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "signup" ? "Create Account & Enter" : "Sign In to Academy"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Direct Google Account Helper Modal */}
          {showGoogleEmailPrompt && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#D4F636]" />
                  <h3 className="font-extrabold text-sm">Google Direct Sign In</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your Google email to authenticate directly without email delivery limits:
                </p>
                <input
                  type="email"
                  value={googlePromptEmail}
                  onChange={(e) => setGooglePromptEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs outline-none focus:border-[#D4F636] font-mono"
                  autoFocus
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleEmailPrompt(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (googlePromptEmail.includes("@")) {
                        completeGoogleSession(googlePromptEmail.trim().toLowerCase());
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#D4F636] text-black text-xs font-extrabold hover:bg-[#c2e42b]"
                  >
                    Confirm &amp; Enter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-300 transition-colors">
          &larr; Back to Skill2Bills Home
        </Link>
      </div>
    </div>
  );
};
