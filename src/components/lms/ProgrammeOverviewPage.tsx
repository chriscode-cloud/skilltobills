import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle2, Lock, BookOpen, Clock } from "lucide-react";
import { LMS_COURSES } from "./lmsData";
import { AuthUser } from "../../lib/auth";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";
import { findCourseBySlugOrId } from "./courseUtils";

interface ProgrammeOverviewPageProps {
  currentUser?: AuthUser | null;
}

export const ProgrammeOverviewPage: React.FC<ProgrammeOverviewPageProps> = ({ currentUser }) => {
  const { programme } = useParams<{ programme: string }>();
  const navigate = useNavigate();

  const course = findCourseBySlugOrId(programme);
  usePageMeta(course.title, course.description);

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
    if (!isSupabaseConfigured || !supabase) return;
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
  }, [currentUser.id]);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const nextLesson = allLessons.find((l) => !completedLessonIds.includes(l.id)) || allLessons[0];
  const totalCompleted = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const totalPercentage = allLessons.length > 0 ? Math.round((totalCompleted / allLessons.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <Link
        to="/learn"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Programmes</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#D4F636]">
            {course.badge}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {totalCompleted} of {allLessons.length} lessons finished ({totalPercentage}%)
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {course.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
          {course.description}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            to={`/learn/${course.slug}/${nextLesson.id}`}
            className="py-3 px-6 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{totalCompleted > 0 ? "Resume Learning" : "Start First Lesson"}</span>
          </Link>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D4F636]" />
          <span>Curriculum Modules</span>
        </h2>

        <div className="space-y-4">
          {course.modules.map((mod, modIdx) => {
            const modLessons = mod.lessons;
            const modCompleted = modLessons.filter((l) => completedLessonIds.includes(l.id)).length;
            const isModComplete = modCompleted === modLessons.length && modLessons.length > 0;

            return (
              <div
                key={mod.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {modIdx + 1}
                    </span>
                    <h3 className="font-extrabold text-base text-white">{mod.title}</h3>
                  </div>

                  <span className="text-xs font-mono text-zinc-400">
                    {modCompleted} / {modLessons.length} Done
                  </span>
                </div>

                {/* Lesson rows */}
                <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-900/30">
                  {modLessons.map((les) => {
                    const isDone = completedLessonIds.includes(les.id);
                    return (
                      <Link
                        key={les.id}
                        to={`/learn/${course.slug}/${les.id}`}
                        className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-zinc-900/70 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isDone
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                            {les.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {les.duration && (
                            <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {les.duration}
                            </span>
                          )}
                          <Play className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#D4F636] transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
