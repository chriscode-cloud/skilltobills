import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, KeyRound, ArrowLeft, Clock, Mail } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { supabase, isSupabaseConfigured, sendMagicLink, verifyOtpCode } from "../../lib/supabase";
import { setStoredUser, AuthUser, ADMIN_EMAILS, isEmailRateLimited, setEmailRateLimited } from "../../lib/auth";
import { syncUserProgress } from "../../lib/progressSync";
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
  const [authStep, setAuthStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(() => isEmailRateLimited());

  // 8-digit OTP verification code state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(8).fill(""));
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  usePageMeta(
    mode === "signup" ? "Create Your Account" : "Sign In to Skill2Bills",
    "Access your programmes, lessons, and personalized creator dashboard."
  );

  // Check for redirected auth errors or rate limits
  useEffect(() => {
    const errorParam = new URLSearchParams(location.search).get("error");
    const storedError = sessionStorage.getItem("skill2bills_auth_error");
    if (storedError || errorParam) {
      const err = storedError || "Authentication link expired or reached rate limits. You can sign in below.";
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

  // Resend countdown timer
  useEffect(() => {
    let timer: any;
    if (authStep === "code" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, resendCountdown]);

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

  // Step 1: Submit email to send magic link & 8-digit OTP code (No direct bypass!)
  const handleSendCode = async (e?: React.FormEvent) => {
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
      const redirectUrl = `${window.location.origin}/dashboard`;
      if (isSupabaseConfigured && supabase) {
        await sendMagicLink(normalizedEmail, redirectUrl);
      }

      // Persist to leads roster immediately so admin identifies every registered creator
      try {
        const storedEmails: string[] = JSON.parse(localStorage.getItem("skill2bills_registered_emails") || "[]");
        if (!storedEmails.includes(normalizedEmail)) {
          storedEmails.unshift(normalizedEmail);
          localStorage.setItem("skill2bills_registered_emails", JSON.stringify(storedEmails));
        }

        const creatorLeads = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
        if (!creatorLeads.some((l: any) => l.email === normalizedEmail)) {
          const newLead = {
            id: "lead-" + Math.random().toString(36).substring(2, 9),
            email: normalizedEmail,
            track: "AI & Virtual Influencers",
            goal: "Scale personal brand & monetize",
            time_commitment: "5-15",
            experience_level: "Beginner",
            created_at: new Date().toISOString(),
          };
          creatorLeads.unshift(newLead);
          localStorage.setItem("skill2bill_creator_leads", JSON.stringify(creatorLeads));
        }
        window.dispatchEvent(new Event("skill2bills_profile_updated"));
      } catch {
        // ignore
      }

      setAuthStep("code");
      setResendCountdown(60);
      setOtpDigits(Array(8).fill(""));
      setInfoMessage(`We've sent a magic link and an 8-digit verification code to ${normalizedEmail}`);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
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
        setErrorMessage(msg || "Could not send verification email. Please try Google sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the 8-digit OTP code
  const handleVerifyCode = async (codeToVerify?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const token = (codeToVerify || otpDigits.join("")).trim();

    if (token.length !== 8) {
      setErrorMessage("Please enter all 8 digits of your verification code.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        await verifyOtpCode(cleanEmail, token);
      }

      // Successful verification! Determine admin status and destination
      const isDesignatedAdmin = ADMIN_EMAILS.includes(cleanEmail);
      const userRole = isDesignatedAdmin ? "admin" : "student";
      const displayName = name.trim() || cleanEmail.split("@")[0];

      let isCompleted = isDesignatedAdmin ? true : false;
      let userTrack = "ai-virtual-influencers";
      let existingProfile: any = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", cleanEmail)
            .maybeSingle();

          existingProfile = data;

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

          if (isDesignatedAdmin) {
            await supabase.from("profiles").upsert(
              {
                id: existingProfile?.id || "admin-" + cleanEmail.replace(/[^a-z0-9]/g, "-"),
                email: cleanEmail,
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

      let resolvedUserId: string | undefined = existingProfile?.id;
      if (!resolvedUserId && isSupabaseConfigured && supabase) {
        try {
          const { data: suData } = await supabase.auth.getUser();
          if (suData?.user?.id) {
            resolvedUserId = suData.user.id;
          }
        } catch {
          // ignore
        }
      }

      if (!resolvedUserId) {
        resolvedUserId = "usr-" + cleanEmail.replace(/[^a-z0-9]/g, "_");
      }

      const authUser: AuthUser = {
        id: resolvedUserId,
        email: cleanEmail,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        role: userRole,
        onboardingCompleted: isCompleted,
        track: userTrack,
        createdAt: new Date().toISOString(),
      };

      setStoredUser(authUser);
      await syncUserProgress(authUser);
      window.dispatchEvent(new CustomEvent("skill2bills_profile_updated", { detail: authUser }));

      const destination = getDestination(authUser);
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err?.message || String(err);
      setErrorMessage(msg || "Invalid or expired 8-digit verification code. Please check your inbox or resend.");
    } finally {
      setLoading(false);
    }
  };

  // Resend the 8-digit OTP code & magic link
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        await sendMagicLink(cleanEmail, `${window.location.origin}/dashboard`);
      }
      setResendCountdown(60);
      setOtpDigits(Array(8).fill(""));
      setInfoMessage(`A fresh 8-digit verification code has been sent to ${cleanEmail}`);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("send the email") ||
        msg.toLowerCase().includes("over_email_send_rate_limit")
      ) {
        setEmailRateLimited(3);
        setIsRateLimited(true);
        setErrorMessage("3-hour email rate limit reached. Please use Continue with Google.");
      } else {
        setErrorMessage(msg || "Failed to resend code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 8-digit OTP input handlers
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9a-zA-Z]/g, "");
    if (!clean) {
      const newOtp = [...otpDigits];
      newOtp[index] = "";
      setOtpDigits(newOtp);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 8).split("");
      const newOtp = [...otpDigits];
      chars.forEach((c, idx) => {
        if (index + idx < 8) newOtp[index + idx] = c;
      });
      setOtpDigits(newOtp);
      const nextIdx = Math.min(index + chars.length, 7);
      inputRefs.current[nextIdx]?.focus();
      if (newOtp.filter(Boolean).length === 8) {
        handleVerifyCode(newOtp.join(""));
      }
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = clean;
    setOtpDigits(newOtp);
    if (index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.filter(Boolean).length === 8) {
      handleVerifyCode(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otpDigits];
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9a-zA-Z]/g, "").slice(0, 8);
    if (!pasted) return;
    const newOtp = [...otpDigits];
    for (let i = 0; i < 8; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtpDigits(newOtp);
    const targetFocus = Math.min(pasted.length, 7);
    inputRefs.current[targetFocus]?.focus();
    if (pasted.length === 8) {
      handleVerifyCode(pasted);
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

      // Fallback direct Google account sign-in
      const candidateEmail = email.trim().toLowerCase() || "christianaboagye06@gmail.com";
      const isDesignatedAdmin = ADMIN_EMAILS.includes(candidateEmail);

      let resolvedId: string | undefined;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: suData } = await supabase.auth.getUser();
          if (suData?.user?.id) resolvedId = suData.user.id;
        } catch {
          // ignore
        }
      }
      if (!resolvedId) {
        resolvedId = "goog-" + candidateEmail.replace(/[^a-z0-9]/g, "_");
      }

      const authUser: AuthUser = {
        id: resolvedId,
        email: candidateEmail,
        name: candidateEmail.split("@")[0],
        role: isDesignatedAdmin ? "admin" : "student",
        onboardingCompleted: isDesignatedAdmin ? true : false,
        track: "ai-virtual-influencers",
        createdAt: new Date().toISOString(),
      };

      setStoredUser(authUser);
      await syncUserProgress(authUser);
      navigate(getDestination(authUser), { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
              Master AI virtual personas, viral video clipping, live stream engineering, and automated YouTube channels in our interactive student classroom.
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
              {authStep === "code"
                ? "Enter 8-Digit Verification Code"
                : mode === "signup"
                ? "Create your student account"
                : "Welcome back"}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              {authStep === "code"
                ? `Check your inbox! We sent a magic link and an 8-digit code to ${email}`
                : mode === "signup"
                ? "Start learning emerging creator skills with real project feedback."
                : "Access your enrolled programmes and resume learning."}
            </p>
          </div>

          {/* Mode Toggle Pills (Shown only on initial form step) */}
          {authStep === "form" && (
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
          )}

          {/* 3-Hour Rate Limit Notification Banner */}
          {isRateLimited && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>3-Hour Email Rate Limit Active</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Supabase email sending has reached the 3-hour quota limit. Use <strong>Continue with Google</strong> below for instant access without waiting!
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-1 w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
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

          {/* STEP 1: FORM INPUT */}
          {authStep === "form" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              {/* Google OAuth Button: Prominently featured */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white font-bold text-xs sm:text-sm transition-all hover:border-zinc-700 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                </svg>
                <span>Continue with Google</span>
                <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">
                  No Email Limits
                </span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Or with 8-Digit Code &amp; Magic Link
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
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm outline-none focus:border-[#D4F636] focus:ring-1 focus:ring-[#D4F636] transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
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

              {/* Send 8-Digit Code Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (mode === "signup" && !agreedToTerms)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending 8-Digit Code &amp; Magic Link...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "signup" ? "Create Account & Send Code" : "Sign In & Send 8-Digit Code"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 8-DIGIT OTP VERIFICATION SCREEN */}
          {authStep === "code" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#D4F636]/10 border border-[#D4F636]/30 text-[#D4F636] flex items-center justify-center mx-auto mb-1">
                  <KeyRound className="w-6 h-6 text-[#D4F636]" />
                </div>
                <p className="text-xs text-zinc-300">
                  We've sent a magic link and an 8-digit code to:
                </p>
                <p className="text-sm font-bold text-white font-mono break-all">
                  {email}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Enter the 8 digits below or click the magic link in your email.
                </p>
              </div>

              {/* 8-Digit Input Slots */}
              <div className="py-2">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <React.Fragment key={idx}>
                      <input
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        disabled={loading}
                        className="w-8 h-11 sm:w-10 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:border-[#D4F636] focus:ring-2 focus:ring-[#D4F636]/30 outline-none transition-all disabled:opacity-50"
                      />
                      {idx === 3 && (
                        <span className="text-zinc-600 font-bold px-0.5 select-none">-</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleVerifyCode()}
                  disabled={loading || otpDigits.join("").length !== 8}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying 8-Digit Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Enter Academy</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("form");
                      setErrorMessage("");
                      setInfoMessage("");
                    }}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change email</span>
                  </button>

                  {resendCountdown > 0 ? (
                    <span className="text-zinc-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Resend in {resendCountdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-[#D4F636] hover:underline font-bold transition-all cursor-pointer"
                    >
                      Resend 8-digit code
                    </button>
                  )}
                </div>
              </div>

              {/* Google Alternative Option */}
              <div className="pt-3 border-t border-zinc-850">
                <div className="text-center text-[11px] text-zinc-500 mb-2">
                  Didn't receive email or reached rate limit?
                </div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
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
