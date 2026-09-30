import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { supabase, isSupabaseConfigured, setCustomSupabaseCredentials, clearCustomSupabaseCredentials } from "../../lib/supabase";
import { setStoredUser, AuthUser } from "../../lib/auth";
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
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const [showSupaConfig, setShowSupaConfig] = useState(false);
  const [supaUrlInput, setSupaUrlInput] = useState("");
  const [supaKeyInput, setSupaKeyInput] = useState("");

  usePageMeta(
    mode === "signup" ? "Create Your Account" : "Sign In to Skill2Bills",
    "Access your programmes, lessons, and personalized creator dashboard."
  );

  // Retrieve post-login destination
  const getDestination = (user?: AuthUser) => {
    // Logging in means the user already has an account: take them straight to dashboard!
    if (mode === "login") {
      return "/dashboard";
    }
    // For sign up: if user hasn't selected a track or finished onboarding, route to /onboarding
    if (user && (!user.onboardingCompleted || !user.track)) {
      return "/onboarding";
    }
    const saved = sessionStorage.getItem("skill2bills_redirect");
    sessionStorage.removeItem("skill2bills_redirect");
    if (saved && !saved.startsWith("/login") && !saved.startsWith("/signup") && !saved.startsWith("/onboarding")) {
      return saved;
    }
    return "/dashboard";
  };

  // 1. Google OAuth
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured yet.");
      }

      // If user is logging in, they already have an account and should land on /dashboard
      // If signing up, target /onboarding
      const targetRoute = mode === "login" ? "/dashboard" : "/onboarding";
      localStorage.setItem("skill2bills_target_after_auth", targetRoute);

      const redirectUri = `${window.location.origin}${targetRoute}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("provider is not enabled")) {
        setErrorMessage(
          "Google provider is not enabled in your Supabase dashboard yet. Please sign in with email OTP below."
        );
      } else {
        setErrorMessage(msg);
      }
      setLoading(false);
    }
  };

  // 2. Send 8-digit OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage("Authentication service is unavailable. Please check your Supabase configuration.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const isLoginMode = mode === "login";

      // Mark the target destination for when user returns / verifies
      localStorage.setItem(
        "skill2bills_target_after_auth",
        isLoginMode ? "/dashboard" : "/onboarding"
      );

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: !isLoginMode,
          emailRedirectTo: isLoginMode
            ? `${window.location.origin}/dashboard`
            : `${window.location.origin}/onboarding`,
          data: {
            full_name: name.trim() || undefined,
          },
        },
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (
          msg.includes("signups not allowed") ||
          msg.includes("user not found") ||
          msg.includes("not registered") ||
          msg.includes("invalid login credentials")
        ) {
          setErrorMessage(
            "No account found with this email. Please click 'Create Account' above to sign up first."
          );
          setLoading(false);
          return;
        }
        throw error;
      }

      if (mode === "signup") {
        try {
          await supabase.from("profiles").upsert(
            {
              email: normalizedEmail,
              name: name.trim() || normalizedEmail.split("@")[0],
              role: "student",
              onboarding_completed: false,
              created_at: new Date().toISOString(),
            },
            { onConflict: "email", ignoreDuplicates: true }
          );
        } catch {
          // If RLS prevents anon insert, it will be finalized upon verifyOtp
        }
        window.dispatchEvent(new CustomEvent("skill2bills_profile_updated", { detail: { email: normalizedEmail } }));
      }

      setIsOtpSent(true);
      setInfoMessage(`We sent a magic sign-in link and verification code to ${normalizedEmail}. Click the link in your email to sign in instantly, or enter your 8-digit code below!`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpCode.replace(/\D/g, "").trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (token.length < 6) {
      setErrorMessage("Please enter your verification code.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage("Authentication service is unavailable. Please check your Supabase configuration.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token,
        type: "email",
      });

      if (error) throw error;

      if (data.user) {
        // Fetch existing profile to preserve onboarding completed & track status
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        // Ensure profile row exists
        if (!profile) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: normalizedEmail,
              name: name.trim() || data.user.user_metadata?.full_name || normalizedEmail.split("@")[0],
              role: "student",
              onboarding_completed: mode === "login" ? true : false,
              created_at: new Date().toISOString(),
            });
          } catch {
            // ignore
          }
        }

        // If user logged in, mark onboarding as completed so they directly access dashboard
        const isCompleted = mode === "login" ? true : profile ? Boolean(profile.onboarding_completed) : false;
        const userTrack = profile?.track && profile.track !== "none" ? profile.track : "content-clipping";

        if (mode === "login" && profile && !profile.onboarding_completed) {
          try {
            await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", data.user.id);
          } catch {
            // ignore
          }
        }

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || normalizedEmail,
          name: profile?.name || name.trim() || data.user.user_metadata?.full_name || normalizedEmail.split("@")[0],
          role: (profile?.role as any) || "student",
          onboardingCompleted: isCompleted,
          track: userTrack,
          createdAt: data.user.created_at,
        };

        setStoredUser(authUser);
        window.dispatchEvent(new CustomEvent("skill2bills_profile_updated", { detail: authUser }));
        navigate(getDestination(authUser), { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid or expired code. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#D4F636]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Auth Card (Slider on Left, Interactive Form on Right) */}
      <div className="w-full max-w-lg lg:max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-2">
        {/* Visual Image Slider: Left Column (Preserved 3-image slide UI) */}
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
                setIsOtpSent(false);
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
                setIsOtpSent(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === "signup" ? "bg-white text-black shadow-xs" : "text-zinc-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Info messages */}
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

          {/* Step A: Request OTP / Email */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-xs sm:text-sm transition-all hover:border-zinc-700 cursor-pointer disabled:opacity-50"
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
                <span>Continue with Google</span>
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
                    <span>{mode === "signup" ? "Create Account" : "Sign In"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step B: Verification Code Entry with Direct Paste Support */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 text-center">
                  Enter Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").trim();
                      if (pasted) {
                        setOtpCode(pasted.slice(0, 8));
                      }
                    }}
                    placeholder="Enter verification code"
                    className="w-full text-center font-mono font-black text-2xl tracking-[6px] sm:tracking-[10px] py-4 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-[#D4F636] focus:border-[#D4F636] focus:ring-2 focus:ring-[#D4F636]/30 outline-none transition-all placeholder:text-zinc-600 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.replace(/\D/g, "").length < 6}
                className="w-full py-3.5 px-4 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpCode("");
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#D4F636] hover:underline font-bold cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
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
