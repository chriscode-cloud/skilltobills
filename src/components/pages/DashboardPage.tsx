import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, BookOpen, CheckCircle2, ArrowRight, Sparkles, Compass } from "lucide-react";
import { AuthUser } from "../../lib/auth";
import { LMS_COURSES } from "../lms/lmsData";
import { Course } from "../lms/types";
import { findCourseBySlugOrId, getUserEnrolledCourses } from "../lms/courseUtils";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";

interface DashboardPageProps {
  currentUser: AuthUser;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser }) => {
  usePageMeta("Student Dashboard", "Track your curriculum progress and continue learning.");
  const navigate = useNavigate();

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

  const [lastLessonId, setLastLessonId] = useState<string>("");

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

  // Determine user's active/recommended course
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

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser.name || "Creator"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {completedLessonIds.length > 0
              ? `You have completed ${completedLessonIds.length} practical lessons across your curriculum.`
              : "Ready to start your first creator skill sprint?"}
          </p>
        </div>

        <Link
          to={`/learn/${primaryCourse.slug}/${nextLesson.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Resume Learning</span>
        </Link>
      </div>

      {/* 1. Continue Learning Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4F636]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4F636]/10 text-[#D4F636] text-[11px] font-mono font-bold border border-[#D4F636]/20">
              <Sparkles className="w-3 h-3" />
              <span>Continue Primary Track</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {primaryCourse.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Current Lesson: <strong className="text-zinc-200">{nextLesson.title}</strong>
            </p>

            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>Course Progress</span>
                <span className="font-bold text-white font-mono">{primaryPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4F636] transition-all duration-500 rounded-full"
                  style={{ width: `${primaryPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/learn/${primaryCourse.slug}/${nextLesson.id}`}
              className="px-6 py-3.5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Launch Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={`/learn/${primaryCourse.slug}`}
              className="px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              Curriculum Overview
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Enrolled Programmes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4F636]" />
            <span>Enrolled Programme</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {getUserEnrolledCourses(currentUser).map((course) => {
            const courseLessons = course.modules.flatMap((m) => m.lessons);
            const done = courseLessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;
            const pct = courseLessons.length > 0 ? Math.round((done / courseLessons.length) * 100) : 0;

            return (
              <div
                key={course.id}
                className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-[#D4F636] transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span>{done} / {courseLessons.length} lessons</span>
                    <span className="font-bold text-zinc-300">{pct}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4F636] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <Link
                    to={`/learn/${course.slug}`}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{pct > 0 ? "Resume Track" : "View Curriculum"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
