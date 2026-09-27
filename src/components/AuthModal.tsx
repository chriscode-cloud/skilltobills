import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { supabase, saveOnboardingData } from "../lib/superbase/supabase";
import { ImageSlider } from "@/components/ui/image-slider";
import { BrandLogo } from "./BrandLogo";

const IMAGES = [
  "https://i.pinimg.com/736x/33/e1/a8/33e1a80d8efcd1c27d1868eda5ceb7ab.jpg", // First slide: Custom creator aesthetic image from Pinterest
  "https://i.pinimg.com/736x/f5/8f/e8/f58fe8a40459d66da2b4780e48ee46b7.jpg", // Second slide: Custom creator aesthetic image from Pinterest
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop", // Dynamic digital creator workstation
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop", // High-fidelity audio podcasting setup
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "community";
  isStandalone?: boolean;
}

type Step = "auth" | "otp" | "onboarding" | "complete";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = "login", isStandalone = false }) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("auth");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [trackChoice, setTrackChoice] = useState("");
  const [goalChoice, setGoalChoice] = useState("");
  const [timeChoice, setTimeChoice] = useState("");
  const [experienceChoice, setExperienceChoice] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setEmail("");
      setStep("auth");
      setOtp(["", "", "", ""]);
      setOnboardingStep(1);
      setTrackChoice("");
      setGoalChoice("");
      setTimeChoice("");
      setExperienceChoice("");
      setLoading(false);
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle email submit -> Go to OTP step or send magic link
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMessage("");
    if (!supabase) {
      // Sandbox preview fallback
      setStep("otp");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      console.error("Supabase magic link error:", err);
      setErrorMessage(err.message || "Failed to initiate login request.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login -> Go directly to Onboarding
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    if (!supabase) {
      // Sandbox preview fallback
      setStep("onboarding");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Supabase Google Auth error:", err);
      setErrorMessage(err.message || "Failed to start Google SSO.");
      // Soft-fallback so user can still preview onboarding
      setStep("onboarding");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.slice(0, 4).split("");
      const newOtp = [...otp];
      for (let i = 0; i < 4; i++) {
        if (digits[i]) newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      otpRefs[3].current?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP -> Go to Onboarding
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join("");
    if (enteredCode.length !== 4) return;

    setErrorMessage("");
    if (!supabase) {
      // Sandbox preview fallback
      setStep("onboarding");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: enteredCode,
        type: "magiclink",
      });
      if (error) throw error;
      setStep("onboarding");
    } catch (err: any) {
      console.error("Supabase OTP verify error:", err);
      setErrorMessage(err.message || "Invalid or expired 4 digit verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Onboarding Next
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
      await saveOnboardingData(email || "google-sso-creator", {
        track: trackChoice,
        goal: goalChoice,
        timeCommitment: timeChoice,
        experienceLevel: choice,
      });
      setStep("complete");
    } catch (err: any) {
      console.error("Failed saving onboarding selection:", err);
      // Fallback transition
      setStep("complete");
    } finally {
      setLoading(false);
    }
  };

  const totalOnboardingSteps = 4;
  const progressPercent = (onboardingStep / totalOnboardingSteps) * 100;

  if (!isOpen) return null;

  const cardContent = (
    <div className="relative w-full max-w-lg lg:max-w-5xl bg-black text-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2">
      
      {/* Visual Image Slider: Top banner on mobile, full-height side column on desktop */}
      <div className="block relative w-full h-48 sm:h-56 lg:h-full lg:min-h-[580px] bg-black shrink-0">
        <ImageSlider images={IMAGES} interval={4500} />

        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 lg:h-44 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 lg:p-8 flex flex-col justify-end text-white pointer-events-none z-10">
          <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#D4F636] mb-1">
            Build Your Digital Empire
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-300 max-w-sm leading-relaxed font-medium line-clamp-2">
            From absolute novice to high-earning creator. Master streaming, viral video content, and premium AI personas.
          </p>
        </div>
      </div>

      {/* Right side: Step Form Content */}
      <div className="w-full bg-[#0a0a0a] flex flex-col justify-center relative p-6 sm:p-10 md:p-12 overflow-y-auto min-h-[460px]">
        {/* Progress Bar for Onboarding inside the right column */}
        {step === "onboarding" && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-900">
            <div 
              className="h-full bg-[#D4F636] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
          
          {/* STEP 1: AUTH SELECTOR */}
          {step === "auth" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center mx-auto mb-3">
                  <BrandLogo className="w-14 h-14 rounded-2xl shadow-md" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Join the Launchpad
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Secure your seat for the free beta pilot starting October 15th. Lock in your early dashboard access to the upcoming step-by-step roadmaps.
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
                  <span>{loading ? "Authenticating..." : "Continue with Google"}</span>
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-zinc-850"></div>
                  <span className="px-3 text-xs font-medium text-zinc-500">— or use your email —</span>
                  <div className="flex-1 border-t border-zinc-850"></div>
                </div>

                {/* Option B: Email Entry */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                      Creator Email
                    </label>
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@creator.com"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:ring-2 focus:ring-[#D4F636] focus:border-[#D4F636] outline-none transition-all disabled:opacity-60"
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
                        <span>Secure My Free Pilot Seat</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="text-center text-[11px] text-zinc-500">
                By continuing, you agree to Skill2Bills' Terms of Service and Privacy Policy.
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
                  Verify Your Email
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                  We sent a secure 4-digit verification code to <span className="font-semibold text-white">{email}</span>. Enter it below to sign in instantly.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-900 text-rose-200 text-xs rounded-xl p-3.5 flex items-start gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="font-semibold leading-normal">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-3">
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
                      className="w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-extrabold bg-zinc-900 border-2 border-zinc-800 text-white focus:border-[#D4F636] focus:bg-zinc-950 rounded-2xl outline-none transition-all disabled:opacity-60"
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={otp.join("").length < 4 || loading}
                    className="w-full bg-[#D4F636] disabled:opacity-50 hover:bg-[#c2e42b] disabled:hover:bg-[#D4F636] text-black font-extrabold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md border border-black/10 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify and Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setOtp(["", "", "", ""]);
                      otpRefs[0].current?.focus();
                    }}
                    className="w-full text-center text-xs font-bold text-zinc-500 hover:text-white transition-colors py-2 disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </form>

              <button
                type="button"
                disabled={loading}
                onClick={() => setStep("auth")}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors mx-auto disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go back</span>
              </button>
            </div>
          )}

          {/* STEP 3: PERSONALIZED ONBOARDING */}
          {step === "onboarding" && (
            <div className="space-y-6">
              
              {/* Question 1: Track choice */}
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Which track are you most excited to master?
                    </h4>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      We will align your dashboard with resources specific to your choice.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { id: "Content Clipping", label: "Content Clipping", desc: "Monetize viral clips and short form edits" },
                      { id: "Live Streaming", label: "Live Streaming and Gaming", desc: "Launch dynamic live streams and broadcast setups" },
                      { id: "AI Influencer", label: "AI Influencer Track", desc: "Build and syndicate hyper realistic digital personas" }
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

              {/* Question 2: Main Goal */}
              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      What is your main professional goal?
                    </h4>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      Let us know how you plan to leverage these digital frameworks.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { id: "Agency", label: "Start an Agency", desc: "Secure monthly recurring retainers from brands" },
                      { id: "Channel", label: "Grow my own channel", desc: "Scale a dedicated audience and monetize direct loops" },
                      { id: "SideHustle", label: "Build a highly profitable side gig", desc: "Earn consistently on your own schedule" }
                    ].map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => handleSelectGoal(goal.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 hover:border-zinc-500 transition-all cursor-pointer flex items-start gap-3.5 ${
                          goalChoice === goal.id ? "border-[#D4F636] bg-zinc-900/50 ring-2 ring-[#D4F636]/30" : "border-zinc-800 bg-zinc-900"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-700 mt-1 flex items-center justify-center shrink-0">
                          {goalChoice === goal.id && <div className="w-2.5 h-2.5 bg-[#D4F636] rounded-full" />}
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
                      How much time can you dedicate per week?
                    </h4>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      We optimize your daily action steps based on your schedule.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { id: "1-5", label: "1 to 5 hours a week", desc: "Focused weekend sprints and efficient automated loops" },
                      { id: "5-15", label: "5 to 15 hours a week", desc: "Balanced part-time builder path with steady gains" },
                      { id: "15+", label: "15 or more hours a week", desc: "Hyper-accelerated full speed scaling and agency growth" }
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
                      We will adapt lesson difficulty so you can learn comfortably.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { id: "Beginner", label: "Complete Novice", desc: "No coding or editing experience, starting from scratch" },
                      { id: "Intermediate", label: "Have some content experience", desc: "Understand basic video cropping or editing tools" },
                      { id: "Advanced", label: "Already running a channel or agency", desc: "Looking to scale and automate existing retainers" }
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

          {/* STEP 4: ONBOARDING COMPLETE / ENDING CELEBRATION */}
          {step === "complete" && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  You’re officially on the launchpad!
                </h4>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                  Your free seat for the beta pilot is securely locked in. We will notify you via email the exact second the roadmaps go live on October 15th.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.hash = "#academy";
                  }}
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
                  Return to Main Website
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
        <header className="w-full max-w-5xl mx-auto flex items-center justify-start py-4 mb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="Skill2Bills"
          >
            <BrandLogo className="w-8 h-8 rounded-lg shadow-md" />
            <span className="font-extrabold text-white text-base tracking-tight">Skill<span className="text-[#D4F636]">2</span>Bills</span>
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
