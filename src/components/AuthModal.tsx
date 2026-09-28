import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft, Clock, AlertTriangle, Sparkles, GraduationCap } from "lucide-react";
import { supabase, saveOnboardingData, isSupabaseConfigured } from "../lib/supabase";
import { setStoredUser, AuthUser } from "../lib/auth";
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

type Step = "auth" | "otp" | "onboarding" | "complete";

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
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [trackChoice, setTrackChoice] = useState(initialTrack || "content-clipping");
  const [goalChoice, setGoalChoice] = useState("");
  const [timeChoice, setTimeChoice] = useState("");
  const [experienceChoice, setExperienceChoice] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Sync default mode on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultMode === "login" ? "login" : "register");
      if (initialTrack) {
        setTrackChoice(initialTrack);
      }
    } else {
      // Reset state on close
      setEmail("");
      setStep("auth");
      setOtp(["", "", "", ""]);
      setOnboardingStep(1);
      setGoalChoice("");
      setTimeChoice("");
      setExperienceChoice("");
      setLoading(false);
      setErrorMessage("");
    }
  }, [isOpen, defaultMode, initialTrack]);

  if (!isOpen) return null;

  // Finalize authentication & enter Academy
  const finalizeAuthSession = (
    userEmail: string,
    chosenTrack?: string,
    customName?: string
  ) => {
    const formattedTrack = chosenTrack || trackChoice || "content-clipping";
    const namePart = customName || userEmail.split("@")[0] || "Creator";
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user: AuthUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 9),
      email: userEmail,
      name: displayName,
      track: formattedTrack,
      goal: goalChoice || "$5,000 / month",
      timeCommitment: timeChoice || "5-15",
      experienceLevel: experienceChoice || "Intermediate",
      createdAt: new Date().toISOString(),
    };

    setStoredUser(user);

    if (onAuthSuccess) {
      onAuthSuccess(user);
    }

    // Set course hash if target is academy
    if (targetRedirect.startsWith("#academy")) {
      // If a track was chosen, route directly into that course
      let targetCourseSlug = "content-clipping";
      if (formattedTrack === "ai-influencer" || formattedTrack === "ai-virtual-influencers") {
        targetCourseSlug = "ai-virtual-influencers";
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

  // Handle email submit -> Request real Supabase OTP code
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setErrorMessage("");
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, email, onboarding_completed")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (activeTab === "register" && existingProfile) {
          setErrorMessage("An account with this email address already exists. Please sign in instead.");
          setLoading(false);
          return;
        }

        if (activeTab === "login" && !existingProfile) {
          setErrorMessage("No account found with this email. Please sign up to create a new account.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: activeTab === "register",
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          throw error;
        }
      }

      setStep("otp");
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setErrorMessage(
          "Could not connect to Supabase (Failed to fetch). Please check if your Supabase project is active or unpaused in your Supabase dashboard."
        );
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login -> Authenticate with Google OAuth via Supabase
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/#academy`,
        },
      });

      if (error) {
        throw error;
      }

      // If Supabase returned a redirect URL, browser redirects automatically
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
        setErrorMessage(
          "Google provider is not enabled yet in your Supabase project. In your Supabase Dashboard, go to Authentication → Providers → Google and turn it ON (or sign in using the Email field above)."
        );
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setErrorMessage(
          "Could not connect to Supabase for Google OAuth. Please ensure your project is active in your Supabase dashboard and the Google provider is enabled."
        );
      } else {
        setErrorMessage(msg);
      }
      setLoading(false);
    }
  };

  // Handle OTP Input changes (6-digit support with paste)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || "";
      }
      setOtp(newOtp);
      const targetFocus = Math.min(digits.length, 5);
      otpRefs[targetFocus].current?.focus();
      return;
    }

    const cleanVal = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal !== "" && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP with Supabase
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join("").trim();
    if (enteredCode.length < 6 && enteredCode.length !== 4) {
      setErrorMessage("Please enter the complete verification code from your email.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: enteredCode,
        type: "email",
      });

      if (error) {
        throw error;
      }

      const verifiedEmail = data.user?.email || email;
      const verifiedName =
        data.user?.user_metadata?.full_name ||
        data.user?.user_metadata?.name ||
        verifiedEmail.split("@")[0];

      if (activeTab === "login") {
        finalizeAuthSession(verifiedEmail, undefined, verifiedName);
      } else {
        // Move to onboarding for new registrations
        setStep("onboarding");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("Failed to fetch")) {
        setErrorMessage(
          "Could not reach Supabase server to verify code. Please verify your Supabase project status."
        );
      } else {
        setErrorMessage(
          msg || "Invalid or expired verification code. Please check your email and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Onboarding Questions
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
            Master viral video clipping, live stream engineering, and automated YouTube channels in our interactive student classroom.
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
                  ? "Sign in to resume your course modules, quizzes, and digital assets."
                  : "Create your free account to unlock courses, video lessons, and interactive challenges."}
              </p>
            </div>

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
                <span className="px-3 text-xs font-medium text-zinc-500">— or continue with email —</span>
                <div className="flex-1 border-t border-zinc-850"></div>
              </div>

              {/* Option B: Email Entry */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@skill2bills.com"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:ring-2 focus:ring-[#D4F636] focus:border-[#D4F636] outline-none transition-all disabled:opacity-60 rounded-xl"
                  />
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
                        {activeTab === "login" ? "Sign In & Enter Academy" : "Continue to Academy Setup"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center text-[11px] text-zinc-500">
              By continuing, you agree to Skill2Bills' Terms of Service and Student Community Guidelines.
            </div>
          </div>
        )}

        {/* STEP 2: OTP CODES ENTER */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Enter Verification Code
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                We sent a verification code to <span className="font-semibold text-white">{email}</span>. Check your inbox (or spam) and enter the code below.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-rose-950/40 border border-rose-900 text-rose-200 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="font-semibold leading-normal">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    disabled={loading}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-13 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-extrabold bg-zinc-900 border-2 border-zinc-800 text-white focus:border-[#D4F636] focus:bg-zinc-950 rounded-xl outline-none transition-all disabled:opacity-60"
                  />
                ))}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={otp.join("").trim().length < 4 || loading}
                  className="w-full bg-[#D4F636] disabled:opacity-50 hover:bg-[#c2e42b] disabled:hover:bg-[#D4F636] text-black font-extrabold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md border border-black/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {activeTab === "login" ? "Verify & Open Academy" : "Verify & Continue Setup"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setErrorMessage("");
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.signInWithOtp({
                        email: email.trim().toLowerCase(),
                        options: {
                          shouldCreateUser: true,
                          emailRedirectTo: window.location.origin,
                        },
                      });
                      if (error) throw error;
                      setOtp(["", "", "", "", "", ""]);
                      otpRefs[0].current?.focus();
                    } catch (err: any) {
                      setErrorMessage(err?.message || "Failed to resend verification code.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full text-center text-xs font-bold text-zinc-500 hover:text-white transition-colors py-2 disabled:opacity-50 cursor-pointer"
                >
                  Resend Verification Code
                </button>
              </div>
            </form>

            <button
              type="button"
              disabled={loading}
              onClick={() => setStep("auth")}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors mx-auto disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go back</span>
            </button>
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
                    { id: "content-clipping", label: "Content Clipping & Short-Form Video", desc: "Turn long-form streams into viral TikToks and YouTube Shorts" },
                    { id: "ai-virtual-influencers", label: "AI & Virtual Influencers", desc: "Build photorealistic digital personas and brand deals" },
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
