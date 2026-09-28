import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Calendar, MessageSquare } from "lucide-react";
import { AuthUser } from "../../lib/auth";
import { Course } from "../lms/types";
import { findCourseBySlugOrId } from "../lms/courseUtils";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";

interface DashboardPageProps {
  currentUser: AuthUser;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  usePageMeta("Student Dashboard", "Track your curriculum progress and continue learning.");

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("skill2bills_lms_progress_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.completedLessonIds || [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Load real progress from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadProgress = async () => {
      try {
        const { data } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", currentUser.id);

        if (data && data.length > 0) {
          const ids = data.map((d: any) => d.lesson_id);
          setCompletedLessonIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
      } catch {
        // ignore
      }
    };

    loadProgress();
  }, [currentUser.id]);

  // Determine user's active course
  const primaryCourse: Course = findCourseBySlugOrId(currentUser.track);

  // Calculate total course lessons and progress
  const allLessons = primaryCourse.modules.flatMap((m) => m.lessons);
  const completedInPrimary = allLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  );
  const primaryPercentage = allLessons.length > 0
    ? Math.round((completedInPrimary.length / allLessons.length) * 100)
    : 0;

  // Next lesson to continue
  const nextLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0];
  const firstName = currentUser.name ? currentUser.name.split(" ")[0] : "Christian";

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans text-white">
      {/* Top Welcome Title */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Hello, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Welcome to Skill2Bills AI Creator Academy.
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* COURSE PROGRESS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-mono font-black text-[#D4F636] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#D4F636] animate-pulse" />
              <span>COURSE PROGRESS</span>
            </div>

            <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Circular Percentage Ring */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#1e1e24"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#D4F636"
                      strokeWidth="5"
                      strokeDasharray={163}
                      strokeDashoffset={163 - (163 * primaryPercentage) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-white font-mono">
                    {primaryPercentage}%
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    {primaryCourse.title}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono">
                    {completedInPrimary.length} of {allLessons.length} lessons complete
                  </p>

                  {/* Brand Yellow Progress Line */}
                  <div className="w-48 sm:w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden pt-1 mt-2">
                    <div
                      className="h-full bg-[#D4F636] rounded-full transition-all duration-500 shadow-[0_0_10px_#D4F636]"
                      style={{ width: `${primaryPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* CONTINUE Button in Brand Yellow */}
              <Link
                to={`/learn/${primaryCourse.slug}/${nextLesson.id}`}
                className="px-6 py-3 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(212,246,54,0.2)] text-center shrink-0"
              >
                CONTINUE
              </Link>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">
              &gt; QUICK ACTIONS
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>UPCOMING EVENTS</span>
            </div>

            <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-10 text-center text-xs text-zinc-500">
              No upcoming events scheduled.
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Student Profile Card */}
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1a200a] border border-[#D4F636]/40 flex items-center justify-center text-[#D4F636] font-black text-lg shadow-[0_0_15px_rgba(212,246,54,0.2)] shrink-0">
                {firstName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-white text-base truncate">
                  {currentUser.name || "Student"}
                </h3>
                <p className="text-xs text-zinc-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white font-mono">
                  {completedInPrimary.length}
                </div>
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mt-1">
                  LESSONS DONE
                </div>
              </div>

              <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-[#D4F636] font-mono">
                  {primaryPercentage}%
                </div>
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mt-1">
                  COMPLETION
                </div>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>ANNOUNCEMENTS</span>
            </div>

            <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl p-5 border-l-2 border-l-[#D4F636] space-y-3">
              <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                27 APR 2026
              </span>
              <h4 className="font-extrabold text-white text-sm">
                Join the Academy Discord
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We've launched the official Skill2Bills AI Creator Academy Discord — your home for connecting with like-minded AI creators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
