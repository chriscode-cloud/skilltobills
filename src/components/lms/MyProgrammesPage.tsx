import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";
import { AuthUser } from "../../lib/auth";
import { getUserEnrolledCourses } from "./courseUtils";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";

interface MyProgrammesPageProps {
  currentUser?: AuthUser | null;
}

export const MyProgrammesPage: React.FC<MyProgrammesPageProps> = ({ currentUser }) => {
  usePageMeta("My Learning Programmes", "Your enrolled track, active modules, and lesson completion status.");

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("skill2bills_lms_progress_v2");
      if (saved) return JSON.parse(saved).completedLessonIds || [];
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured || !supabase) return;
    supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", currentUser.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const ids = data.map((d: any) => d.lesson_id);
          setCompletedLessonIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
      });
  }, [currentUser]);

  const enrolledCourses = getUserEnrolledCourses(currentUser);

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Enrolled Programme
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Your primary focus track selected during onboarding.
        </p>
      </div>

      <div className="space-y-6">
        {enrolledCourses.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-[#D4F636] mx-auto" />
            <h2 className="text-xl font-bold text-white">No Focus Track Selected</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              You have not chosen your primary learning track yet. Complete onboarding to unlock your customized curriculum.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                to="/onboarding"
                className="px-5 py-2.5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs transition-all"
              >
                Start Onboarding &rarr;
              </Link>
            </div>
          </div>
        ) : (
          enrolledCourses.map((course) => {
            const allLessons = course.modules.flatMap((m) => m.lessons);
            const completedCount = allLessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;
            const percentage = allLessons.length > 0
              ? Math.round((completedCount / allLessons.length) * 100)
              : 0;

            const nextLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0];

            return (
              <div
                key={course.id}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 hover:border-zinc-700 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-2xl">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {course.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Progress bar */}
                  <div className="pt-2 max-w-md">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-mono">
                      <span>{completedCount} of {allLessons.length} lessons completed</span>
                      <span className="font-bold text-white">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D4F636] transition-all rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    to={`/learn/${course.slug}/${nextLesson.id}`}
                    className="py-3 px-6 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{percentage > 0 ? "Resume Learning" : "Start Track"}</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
