import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles, BookOpen, Clock, Target, Compass } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { AuthUser, setStoredUser } from "../../lib/auth";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";

interface OnboardingPageProps {
  currentUser: AuthUser;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  usePageMeta("Creator Onboarding", "Select your focus track, weekly commitment, and creator goals.");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>("content-clipping");
  const [selectedGoal, setSelectedGoal] = useState<string>("Build a high-income freelance skillset");
  const [selectedTime, setSelectedTime] = useState<string>("5 to 15 hours a week");
  const [selectedExperience, setSelectedExperience] = useState<string>("Beginner");
  const [saving, setSaving] = useState(false);

  const tracks = [
    {
      id: "content-clipping",
      title: "Content Clipping & Short-Form Video",
      desc: "Turn long-form podcast & stream footage into viral vertical clips for creator retainers.",
      icon: BookOpen,
      slug: "content-clipping",
    },
    {
      id: "ai-virtual-influencers",
      title: "AI & Virtual Influencers",
      desc: "Build consistent photorealistic digital personas, character scripts, and brand partnerships.",
      icon: Sparkles,
      slug: "ai-virtual-influencers",
    },
    {
      id: "live-streaming",
      title: "Live Streaming & Broadcast Engineering",
      desc: "Master OBS Studio, multi-camera audio routing, Twitch alerts, and hardware encoders.",
      icon: Compass,
      slug: "live-streaming",
    },
    {
      id: "youtube-automation",
      title: "Faceless YouTube Automation",
      desc: "Build scalable niche documentary channels using high-RPM scripting and automated systems.",
      icon: Target,
      slug: "youtube-automation",
    },
  ];

  const goals = [
    { id: "freelance", title: "Build a high-income freelance skillset", desc: "Land retainer clients and offer digital production services." },
    { id: "channel", title: "Launch and grow my own channels", desc: "Build an audience on YouTube, TikTok, or live streaming." },
    { id: "systems", title: "Scale content production with AI tools", desc: "Speed up existing workflows and create automated video loops." },
  ];

  const timeCommitments = [
    { id: "1-5", title: "1 to 5 hours a week", desc: "Focused weekend sprints and efficient learning modules." },
    { id: "5-15", title: "5 to 15 hours a week", desc: "Steady part-time builder path with continuous portfolio pieces." },
    { id: "15+", title: "15 or more hours a week", desc: "Accelerated full-speed execution and comprehensive skill mastery." },
  ];

  const experienceLevels = [
    { id: "beginner", title: "Complete Novice", desc: "Starting from scratch with video editing and creator tools." },
    { id: "intermediate", title: "Some Experience", desc: "Understand basic editing and have made a few clips or videos." },
    { id: "advanced", title: "Experienced Builder", desc: "Already active and looking to systemize, scale, and monetize." },
  ];

  const handleFinish = async (targetSlug?: string) => {
    setSaving(true);
    const chosenTrackObj = tracks.find((t) => t.id === selectedTrack) || tracks[0];
    const destinationSlug = targetSlug || chosenTrackObj.slug;

    const updatedUser: AuthUser = {
      ...currentUser,
      onboardingCompleted: true,
      track: chosenTrackObj.id,
      goal: selectedGoal,
      timeCommitment: selectedTime,
      experienceLevel: selectedExperience,
    };

    setStoredUser(updatedUser);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("profiles")
          .update({
            onboarding_completed: true,
            track: chosenTrackObj.id,
            goal: selectedGoal,
            time_commitment: selectedTime,
            experience_level: selectedExperience,
          })
          .eq("id", currentUser.id);

        // Also enroll user in chosen course
        const canonicalCourseId =
          destinationSlug === "live-streaming"
            ? "course-streaming"
            : destinationSlug === "ai-virtual-influencers"
            ? "course-ai-influencer"
            : destinationSlug === "youtube-automation"
            ? "course-youtube"
            : "course-clipping";

        await supabase.from("enrollments").upsert({
          user_id: currentUser.id,
          course_id: canonicalCourseId,
          enrolled_at: new Date().toISOString(),
          status: "active",
        });
      } catch (err) {
        console.warn("Could not save onboarding to Supabase:", err);
      }
    }

    setSaving(false);
    navigate(`/learn/${destinationSlug}`, { replace: true });
  };

  const handleSkip = async () => {
    const updatedUser: AuthUser = {
      ...currentUser,
      onboardingCompleted: true,
    };
    setStoredUser(updatedUser);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("id", currentUser.id);
      } catch {
        // ignore
      }
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Header & Steps Progress */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-8 h-8" />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                Creator Onboarding
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Step {step} of 4
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Skip for now &rarr;
          </button>
        </div>

        {/* Step 1: Pathway */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Which skill track do you want to build first?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                You will have access to all tracks, but this prioritizes your primary curriculum.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {tracks.map((t) => {
                const isSelected = selectedTrack === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTrack(t.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-zinc-900 border-[#D4F636] ring-1 ring-[#D4F636]/50 shadow-md"
                        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-[#D4F636]" : "text-zinc-400"}`} />
                        {isSelected && <Check className="w-4 h-4 text-[#D4F636]" />}
                      </div>
                      <h3 className="font-bold text-sm text-white">{t.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                What is your primary objective?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                This shapes the project briefs and action checklists recommended to you.
              </p>
            </div>

            <div className="space-y-3">
              {goals.map((g) => {
                const isSelected = selectedGoal === g.title;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.title)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-zinc-900 border-[#D4F636] ring-1 ring-[#D4F636]/50"
                        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white">{g.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{g.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[#D4F636] shrink-0 ml-3" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Commitment & Experience */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Your schedule &amp; background
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Helps us set a sustainable learning pacing.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Weekly Commitment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {timeCommitments.map((tc) => {
                    const isSelected = selectedTime === tc.title;
                    return (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setSelectedTime(tc.title)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 border-[#D4F636] text-white"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <p className="font-bold text-xs text-white">{tc.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {experienceLevels.map((lvl) => {
                    const isSelected = selectedExperience === lvl.title;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSelectedExperience(lvl.title)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 border-[#D4F636] text-white"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <p className="font-bold text-xs text-white">{lvl.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>View Recommended Programme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Recommended Programme with 1-click start */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center sm:text-left">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#D4F636]/10 text-[#D4F636] font-mono text-[11px] font-bold mb-3 border border-[#D4F636]/30">
                Tailored Recommendation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                You are ready to begin
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Based on your preference for {selectedTime.toLowerCase()} and {selectedExperience.toLowerCase()} pacing:
              </p>
            </div>

            {/* Recommended card */}
            {(() => {
              const rec = tracks.find((t) => t.id === selectedTrack) || tracks[0];
              return (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-[#D4F636]/60 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4F636] text-black flex items-center justify-center font-extrabold">
                      <rec.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">{rec.title}</h3>
                      <p className="text-xs text-[#D4F636] font-semibold">Priority Programme</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{rec.desc}</p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleFinish(rec.slug)}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <span>Start This Programme</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleFinish()}
                      className="py-3.5 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
