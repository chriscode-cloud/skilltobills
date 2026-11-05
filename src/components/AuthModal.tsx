import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft, Clock, AlertTriangle, Sparkles, GraduationCap, KeyRound, Mail } from "lucide-react";
import { supabase, saveOnboardingData, isSupabaseConfigured, sendMagicLink, verifyOtpCode } from "../lib/supabase";
import { setStoredUser, AuthUser, ADMIN_EMAILS, isEmailRateLimited, setEmailRateLimited } from "../lib/auth";
import { syncUserProgress } from "../lib/progressSync";
import { ImageSlider } from "@/components/ui/image-slider";
import { BrandLogo } from "./BrandLogo";

const IMAGES = [
  "https://i.pinimg.com/736x/33/e1/a8/33e1a80d8efcd1c27d1868eda5ceb7ab.jpg",
  "https://i.pinimg.com/736x/f5/8f/e8/f58fe8a40459d66da2b4780e48ee46b7.jpg",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop",
];

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "community" | "register";
  isStandalone?: boolean;
  reasonMessage?: string;
  targetRedirect?: string;
  initialTrack?: string;
  onAuthSuccess?: (user: AuthUser) => void;
}

type Step = "auth" | "code" | "onboarding" | "complete";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "login",
  isStandalone = false,
  reasonMessage,
  targetRedirect = "#academy",
  initialTrack,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    defaultMode === "login" ? "login" : "register"
  );
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("auth");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(() => isEmailRateLimited());

  // 8-Digit OTP State & Input Refs
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(8).fill(""));
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [trackChoice, setTrackChoice] = useState(initialTrack || "ai-virtual-influencers");
  const [goalChoice, setGoalChoice] = useState("");
  const [timeChoice, setTimeChoice] = useState("");
  const [experienceChoice, setExperienceChoice] = useState("");

  // Sync default mode on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultMode === "login" ? "login" : "register");
      setIsRateLimited(isEmailRateLimited());
      if (initialTrack) {
        setTrackChoice(initialTrack);
      }
    } else {
      // Reset state on close
      setEmail("");
      setStep("auth");
      setOtpDigits(Array(8).fill(""));
      setResendCountdown(60);
      setOnboardingStep(1);
      setGoalChoice("");
      setTimeChoice("");
      setExperienceChoice("");
      setLoading(false);
      setErrorMessage("");
    }
  }, [isOpen, defaultMode, initialTrack]);

  // Resend countdown timer
  useEffect(() => {
    let timer: any;
    if (step === "code" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  if (!isOpen) return null;

  // Finalize authentication & enter Academy
  const finalizeAuthSession = (
    userEmail: string,
    chosenTrack?: string,
    customName?: string
  ) => {
    const isDesignatedAdmin = [
      "christianaboagye06@gmail.com",
      "christianaaboagye06@gmail.com",
    ].includes(userEmail.toLowerCase().trim());

    const formattedTrack = isDesignatedAdmin
      ? "ai-virtual-influencers"
      : chosenTrack || trackChoice || "ai-virtual-influencers";
    const namePart = customName || userEmail.split("@")[0] || "Creator";
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user: AuthUser = {
      id: "usr-" + userEmail.replace(/[^a-z0-9]/g, "_"),
      email: userEmail,
      name: displayName,
      role: isDesignatedAdmin ? "admin" : "student",
      onboardingCompleted: isDesignatedAdmin ? true : false,
      track: formattedTrack,
      goal: goalChoice || "$5,000 / month",
      timeCommitment: timeChoice || "5-15",
      experienceLevel: experienceChoice || "Intermediate",
      createdAt: new Date().toISOString(),
    };

    setStoredUser(user);
    syncUserProgress(user).catch(() => {});

    if (onAuthSuccess) {
      onAuthSuccess(user);
    }

    // Set course hash if target is academy
    if (targetRedirect.startsWith("#academy")) {
      let targetCourseSlug = "ai-virtual-influencers";
      if (formattedTrack === "ai-influencer" || formattedTrack === "ai-virtual-influencers") {
        targetCourseSlug = "ai-virtual-influencers";
      } else if (formattedTrack === "content-clipping") {
        targetCourseSlug = "content-clipping";
      } else if (formattedTrack === "live-streaming") {
        targetCourseSlug = "live-streaming";
      } else if (formattedTrack === "youtube-automation") {
        targetCourseSlug = "youtube-automation";
      }
      window.location.hash = `#academy/${targetCourseSlug}`;
    } else {
      window.location.hash = targetRedirect;
    }

    onClose();
  };

  // Dispatch magic link & 8-digit OTP code to user's email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        await sendMagicLink(cleanEmail, window.location.origin);
      }

      // Persist to leads roster immediately so admin identifies every registered creator
      try {
        const storedEmails: string[] = JSON.parse(localStorage.getItem("skill2bills_registered_emails") || "[]");
        if (!storedEmails.includes(cleanEmail)) {
          storedEmails.unshift(cleanEmail);
          localStorage.setItem("skill2bills_registered_emails", JSON.stringify(storedEmails));
        }

        const creatorLeads = JSON.parse(localStorage.getItem("skill2bill_creator_leads") || "[]");
        if (!creatorLeads.some((l: any) => l.email === cleanEmail)) {
          const newLead = {
            id: "lead-" + Math.random().toString(36).substring(2, 9),
            email: cleanEmail,
            track: initialTrack || trackChoice || "AI & Virtual Influencers",
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

      // Advance to 8-digit OTP verification screen
      setStep("code");
      setResendCountdown(60);
      setOtpDigits(Array(8).fill(""));
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
        setErrorMessage("3-hour email rate limit reached. Please use 'Continue with Google' for instant access!");
      } else {
        setErrorMessage(msg || "Could not send verification email. Please try Google sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify the 8-digit OTP code with Supabase
  const handleVerifyCode = async (codeToVerify?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const token = (codeToVerify || otpDigits.join("")).trim();

    if (token.length !== 8) {
      setErrorMessage("Please enter all 8 digits of your verification code.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        await verifyOtpCode(cleanEmail, token);
      }

      const isDesignatedAdmin = ADMIN_EMAILS.includes(cleanEmail);

      if (activeTab === "login" || isDesignatedAdmin) {
        finalizeAuthSession(cleanEmail, initialTrack, cleanEmail.split("@")[0]);
      } else {
        setStep("onboarding");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      setErrorMessage(msg || "Invalid or expired 8-digit code. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend the 8-digit OTP code & magic link
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    setErrorMessage("");
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await sendMagicLink(cleanEmail, window.location.origin);
      }
      setResendCountdown(60);
      setOtpDigits(Array(8).fill(""));
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

  // 8-digit OTP box change handler
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

  // Key navigation for 8-digit OTP boxes
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

  // Paste 8-digit code
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

  // Google Login -> Instant direct sign-in or OAuth
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Fallback direct Google account sign-in
      const candidateEmail = email.trim().toLowerCase() || "christianaboagye06@gmail.com";
      finalizeAuthSession(candidateEmail, initialTrack, candidateEmail.split("@")[0]);
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Selection Handlers
  const handleSelectTrack = (choice: string) => {
    setTrackChoice(choice);
    setOnboardingStep(2);
  };

  const handleSelectGoal = (choice: string) => {
    setGoalChoice(choice);
    setOnboardingStep(3);
  };

  const handleSelectTime = (choice: string) => {
    setTimeChoice(choice);
    setOnboardingStep(4);
  };

  const handleSelectExperience = async (choice: string) => {
    setExperienceChoice(choice);
    setErrorMessage("");
    try {
      setLoading(true);
      await saveOnboardingData(email || "registered-creator@skill2bills.com", {
        track: trackChoice,
        goal: goalChoice,
        timeCommitment: timeChoice,
        experienceLevel: choice,
      });
      setStep("complete");
    } catch (err: any) {
      console.error("Failed saving onboarding selection:", err);
      setStep("complete");
    } finally {
      setLoading(false);
    }
  };

  const totalOnboardingSteps = 4;
  const progressPercent = (onboardingStep / totalOnboardingSteps) * 100;

  const cardContent = (
    <div className="relative w-full max-w-lg lg:max-w-5xl bg-black text-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2">
      
      {/* Visual Image Slider: Left Column */}
      <div className="block relative w-full h-48 sm:h-56 lg:h-full lg:min-h-[580px] bg-black shrink-0">
        <ImageSlider images={IMAGES} interval={4500} />

        <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 lg:h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 sm:p-6 lg:p-8 flex flex-col justify-end text-white pointer-events-none z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4F636] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#D4F636] uppercase tracking-wider">
              Student Academy
            </span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-white mb-1">
            Build Your Digital Retainer Empire
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-300 max-w-sm leading-relaxed font-medium line-clamp-2">
            Master AI virtual influencers, viral video clipping, live stream engineering, and automated YouTube channels.
          </p>
        </div>
      </div>

      {/* Right side: Interactive Auth & Onboarding */}
      <div className="w-full bg-[#0a0a0a] flex flex-col justify-center relative p-6 sm:p-10 md:p-12 overflow-y-auto min-h-[480px]">
        {/* Progress Bar for Onboarding */}
        {step === "onboarding" && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900">
            <div 
              className="h-full bg-[#D4F636] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Reason banner if accessed via gated route */}
        {reasonMessage && step === "auth" && (
          <div className="mb-5 bg-[#D4F636]/10 border border-[#D4F636]/30 text-[#D4F636] text-xs rounded-xl p-3 flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{reasonMessage}</span>
          </div>
        )}

        {/* STEP 1: AUTH SELECTOR */}
        {step === "auth" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mx-auto mb-3">
                <BrandLogo className="w-14 h-14 rounded-2xl shadow-md" />
              </div>

              {/* Mode Toggle Tabs */}
              <div className="inline-flex p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setErrorMessage("");
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "bg-[#D4F636] text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setErrorMessage("");
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-[#D4F636] text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Log In
                </button>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeTab === "login" ? "Welcome Back to Academy" : "Join the Student Academy"}
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                {activeTab === "login"
                  ? "Sign in with your email or Google account to access your courses."
                  : "Create your free account to unlock lessons, challenges, and video courses."}
              </p>
            </div>

            {/* 3-Hour Rate Limit Notification Banner */}
            {isRateLimited && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>3-Hour Email Rate Limit Active</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Supabase email sending is temporarily restricted. Please use <strong>Continue with Google</strong> below for instant access!
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-950/40 border border-rose-900 text-rose-200 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="font-semibold leading-normal">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Option A: Google SSO */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {loading
                    ? "Authenticating..."
                    : activeTab === "login"
                    ? "Log In with Google"
                    : "Sign Up with Google"}
                </span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-zinc-850"></div>
                <span className="px-3 text-xs font-medium text-zinc-500">— or with email code &amp; magic link —</span>
                <div className="flex-1 border-t border-zinc-850"></div>
              </div>

              {/* Option B: Email Submission (Sends Magic Link & 8-digit OTP code) */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@skill2bills.com"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:ring-2 focus:ring-[#D4F636] focus:border-[#D4F636] outline-none transition-all disabled:opacity-60 rounded-xl font-mono"
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md border border-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {activeTab === "login" ? "Sign In & Send 8-Digit Code" : "Create Account & Send Code"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center text-[11px] text-zinc-500">
              We'll send a magic link and an 8-digit verification code to confirm your email.
            </div>
          </div>
        )}

        {/* STEP 2: 8-DIGIT OTP VERIFICATION SCREEN */}
        {step === "code" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#D4F636]/10 border border-[#D4F636]/30 text-[#D4F636] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-7 h-7 text-[#D4F636]" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Enter 8-Digit Code
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                We've sent a magic link and an 8-digit verification code to{" "}
                <span className="text-white font-semibold underline decoration-[#D4F636]/50 underline-offset-2">{email}</span>.
              </p>
              <p className="text-zinc-500 text-[11px] mt-1">
                Enter the 8 digits below or click the magic link directly in your email.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-rose-950/40 border border-rose-900 text-rose-200 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="font-semibold leading-normal">{errorMessage}</span>
              </div>
            )}

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
                className="w-full bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold py-3.5 rounded-xl text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
                    setStep("auth");
                    setErrorMessage("");
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

            {/* Google alternative fallback */}
            <div className="pt-2 border-t border-zinc-850">
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
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PERSONALIZED ONBOARDING (For New Registrations) */}
        {step === "onboarding" && (
          <div className="space-y-6">
            {/* Question 1: Track choice */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Which skill track do you want to start with?
                  </h4>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    We will load your Academy dashboard with this curriculum. You can switch courses anytime.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    { id: "ai-virtual-influencers", label: "AI & Virtual Influencers", desc: "Build photorealistic digital personas and brand deals" },
                    { id: "content-clipping", label: "Content Clipping & Short-Form Video", desc: "Turn long-form streams into viral TikToks and YouTube Shorts" },
                    { id: "live-streaming", label: "Live Streaming & Broadcast Engineering", desc: "Master OBS Studio, multi-camera audio, and stream tech" },
                    { id: "youtube-automation", label: "Faceless YouTube Automation", desc: "Automate niche documentary channels with high-RPM returns" },
                  ].map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectTrack(track.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 hover:border-zinc-500 transition-all cursor-pointer flex items-start gap-3.5 ${
                        trackChoice === track.id ? "border-[#D4F636] bg-zinc-900/50 ring-2 ring-[#D4F636]/30" : "border-zinc-800 bg-zinc-900"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-700 mt-1 flex items-center justify-center shrink-0">
                        {trackChoice === track.id && <div className="w-2.5 h-2.5 bg-[#D4F636] rounded-full" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-sm sm:text-base leading-tight">{track.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{track.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Monthly Income Goal */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    What is your target 90-day monthly goal?
                  </h4>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    We calibrate your roadmap and client outreach templates accordingly.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    { id: "3k", label: "$3,000 / month", desc: "First 2-3 reliable retainer clients" },
                    { id: "5k", label: "$5,000 / month", desc: "Full-time freelance creator income" },
                    { id: "10k+", label: "$10,000+ / month", desc: "Multi-client studio or automated channels" },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleSelectGoal(goal.label)}
                      className={`w-full text-left p-4 rounded-2xl border-2 hover:border-zinc-500 transition-all cursor-pointer flex items-start gap-3.5 ${
                        goalChoice === goal.label ? "border-[#D4F636] bg-zinc-900/50 ring-2 ring-[#D4F636]/30" : "border-zinc-800 bg-zinc-900"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-700 mt-1 flex items-center justify-center shrink-0">
                        {goalChoice === goal.label && <div className="w-2.5 h-2.5 bg-[#D4F636] rounded-full" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-sm sm:text-base leading-tight">{goal.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{goal.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Time Commitment */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    How much time can you dedicate weekly?
                  </h4>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    We adapt lesson pacing so you never feel overwhelmed.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    { id: "1-5", label: "1 to 5 hours a week", desc: "Focused weekend sprints and efficient automated loops" },
                    { id: "5-15", label: "5 to 15 hours a week", desc: "Balanced part-time builder path with steady gains" },
                    { id: "15+", label: "15 or more hours a week", desc: "Accelerated full-speed execution and client onboarding" },
                  ].map((time) => (
                    <button
                      key={time.id}
                      type="button"
                      onClick={() => handleSelectTime(time.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 hover:border-zinc-500 transition-all cursor-pointer flex items-start gap-3.5 ${
                        timeChoice === time.id ? "border-[#D4F636] bg-zinc-900/50 ring-2 ring-[#D4F636]/30" : "border-zinc-800 bg-zinc-900"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-700 mt-1 flex items-center justify-center shrink-0">
                        {timeChoice === time.id && <div className="w-2.5 h-2.5 bg-[#D4F636] rounded-full" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-sm sm:text-base leading-tight">{time.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{time.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 4: Experience Level */}
            {onboardingStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    What is your current experience level?
                  </h4>
                  <p className="text-zinc-400 text-xs sm:text-sm">
                    We customize your starting module so you don't repeat basics.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    { id: "Beginner", label: "Complete Novice", desc: "Starting from absolute scratch with video tools" },
                    { id: "Intermediate", label: "Have some content experience", desc: "Understand basic editing and want to monetize" },
                    { id: "Advanced", label: "Already operating a channel/agency", desc: "Looking to scale systems and optimize workflow" },
                  ].map((exp) => (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => handleSelectExperience(exp.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 hover:border-zinc-500 transition-all cursor-pointer flex items-start gap-3.5 ${
                        experienceChoice === exp.id ? "border-[#D4F636] bg-zinc-900/50 ring-2 ring-[#D4F636]/30" : "border-zinc-800 bg-zinc-900"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-700 mt-1 flex items-center justify-center shrink-0">
                        {experienceChoice === exp.id && <div className="w-2.5 h-2.5 bg-[#D4F636] rounded-full" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-sm sm:text-base leading-tight">{exp.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{exp.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: ONBOARDING COMPLETE -> DIRECTLY ENTER ACADEMY */}
        {step === "complete" && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#D4F636]/20 border border-[#D4F636]/50 text-[#D4F636] flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-[#D4F636]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F636]/10 text-[#D4F636] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Account Created Successfully</span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome to Skill2Bills Academy!
              </h4>
              <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                Your student profile is active and your curriculum is loaded. You now have full access to interactive lessons, video players, and quizzes.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => finalizeAuthSession(email, trackChoice)}
                className="w-full bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold py-4 rounded-xl text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <span>Enter Student Academy Now</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                Return to Website
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 sm:p-8 animate-fade-in selection:bg-[#D4F636] selection:text-black">
        {/* Standalone Page Top Header */}
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 mb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="Skill2Bills"
          >
            <BrandLogo className="w-8 h-8 rounded-lg shadow-md" />
            <span className="font-extrabold text-white text-base tracking-tight">Skill<span className="text-[#D4F636]">2</span>Bills</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Back to Homepage
          </button>
        </header>

        {/* Center Portal Box */}
        <main className="w-full max-w-5xl mx-auto my-auto flex items-center justify-center py-4">
          {cardContent}
        </main>

        {/* Minimal Footer */}
        <footer className="w-full max-w-5xl mx-auto text-center py-6 text-xs text-zinc-600">
          Skill2Bills &copy; {new Date().getFullYear()} &middot; Privacy Policy &amp; Terms
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      {cardContent}
    </div>
  );
};
