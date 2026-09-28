import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Play,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Code2,
  Check,
  Download,
  ExternalLink,
  HelpCircle,
  Video,
  AlertTriangle
} from "lucide-react";
import { Course, Lesson } from "./types";
import { AuthUser } from "../../lib/auth";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";
import { findCourseBySlugOrId, getSafeEmbedUrl } from "./courseUtils";

// Single toggle for sequential progression locking (set false for open curriculum)
const ENFORCE_SEQUENTIAL_UNLOCKING = false;

interface LessonPlayerPageProps {
  currentUser?: AuthUser | null;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({ currentUser }) => {
  const { programme, lesson: lessonParam } = useParams<{ programme: string; lesson: string }>();
  const navigate = useNavigate();

  // Robust course resolution with fallback
  const course: Course = findCourseBySlugOrId(programme);

  const allLessonsWithModule = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleId: m.id }))
  );

  const activeIndex = allLessonsWithModule.findIndex((l) => l.id === lessonParam);
  const currentLesson = activeIndex !== -1 ? allLessonsWithModule[activeIndex] : allLessonsWithModule[0];
  const prevLesson = activeIndex > 0 ? allLessonsWithModule[activeIndex - 1] : null;
  const nextLesson = activeIndex + 1 < allLessonsWithModule.length ? allLessonsWithModule[activeIndex + 1] : null;

  usePageMeta(`${currentLesson.title} | ${course.title}`);

  // Progress state
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("skill2bills_lms_progress_v2");
      if (saved) return JSON.parse(saved).completedLessonIds || [];
    } catch {
      // ignore
    }
    return [];
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedResource, setCopiedResource] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState(false);

  // Sync with Supabase if logged in
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

  // Reset quiz when lesson changes
  useEffect(() => {
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setEmbedError(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentLesson.id]);

  const isCompleted = completedLessonIds.includes(currentLesson.id);

  // Toggle completion
  const handleToggleComplete = async () => {
    let nextCompleted: string[];
    if (isCompleted) {
      nextCompleted = completedLessonIds.filter((id) => id !== currentLesson.id);
    } else {
      nextCompleted = [...completedLessonIds, currentLesson.id];
    }

    setCompletedLessonIds(nextCompleted);
    localStorage.setItem(
      "skill2bills_lms_progress_v2",
      JSON.stringify({ completedLessonIds: nextCompleted, lastActiveLessonId: currentLesson.id })
    );

    if (currentUser && isSupabaseConfigured && supabase) {
      try {
        if (!isCompleted) {
          await supabase.from("user_progress").upsert({
            user_id: currentUser.id,
            lesson_id: currentLesson.id,
            completed_at: new Date().toISOString(),
          });
        } else {
          await supabase
            .from("user_progress")
            .delete()
            .match({ user_id: currentUser.id, lesson_id: currentLesson.id });
        }
      } catch {
        // offline
      }
    }
  };

  const isLessonLocked = (idx: number) => {
    if (!ENFORCE_SEQUENTIAL_UNLOCKING || idx === 0) return false;
    const previousLesson = allLessonsWithModule[idx - 1];
    return !completedLessonIds.includes(previousLesson.id);
  };

  // Safe embed URL that will never trigger relative route fallback
  const safeVideoUrl = getSafeEmbedUrl(currentLesson.videoUrl);

  // Direct video link for external viewing fallback
  const externalVideoLink = currentLesson.videoUrl.includes("http")
    ? currentLesson.videoUrl
    : `https://www.youtube.com/watch?v=${currentLesson.videoUrl}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans">
      {/* Top Bar for Lesson Player */}
      <div className="h-14 bg-zinc-950 border-b border-zinc-900 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to={`/learn/${course.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md font-mono">
            {course.title} &bull; {currentLesson.moduleTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 cursor-pointer"
            aria-label="Toggle curriculum navigation"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleComplete}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Stage (Video, Learn, Experiment, Practice) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-8 max-w-4xl mx-auto">
          {/* Lesson Video Stage */}
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl relative">
              {!embedError ? (
                <iframe
                  src={safeVideoUrl}
                  title={currentLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onError={() => setEmbedError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-zinc-900">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-bold text-white">Video Player Direct Stream</p>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    If this stream is restricted by your browser sandbox, click below to open the official lesson master video:
                  </p>
                  <a
                    href={externalVideoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#D4F636] text-black font-extrabold text-xs flex items-center gap-2 hover:bg-[#c2e42b] transition-colors"
                  >
                    <span>Watch Lesson on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Video utility controls */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-[11px]">HD Stream Online</span>
                {currentLesson.duration && (
                  <>
                    <span>&bull;</span>
                    <span className="font-mono text-[11px]">{currentLesson.duration}</span>
                  </>
                )}
              </div>
              <a
                href={externalVideoLink}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Lesson Title & Module */}
          <div className="space-y-2 pb-4 border-b border-zinc-800">
            <span className="text-[11px] font-mono text-[#D4F636] uppercase tracking-wider block">
              {currentLesson.moduleTitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentLesson.title}
            </h1>
            {currentLesson.duration && (
              <p className="text-xs text-zinc-400 font-mono">
                Estimated Duration: {currentLesson.duration}
              </p>
            )}
          </div>

          {/* Section 1: LEARN (Conceptual walkthrough) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-[#D4F636]" />
              <span>1. Learn</span>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm leading-relaxed text-zinc-300 space-y-3 font-sans">
              <p>{currentLesson.bodyContent}</p>
            </div>
          </div>

          {/* Section 2: EXPERIMENT (Hands-on execution & Tools) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-[#D4F636]" />
              <span>2. Experiment</span>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm leading-relaxed text-zinc-300 space-y-3">
              <p className="font-semibold text-white">Recommended Workflow Run:</p>
              <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-zinc-400">
                <li>Load your workspace with the project assets from the resource kit.</li>
                <li>Apply the calibration settings demonstrated in the lesson video.</li>
                <li>Observe the frame retention metrics and export your draft.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: PRACTICE (Self-check assignment & Checklist) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#D4F636]" />
              <span>3. Practice (Self-Check Task)</span>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm leading-relaxed text-zinc-300 space-y-4">
              <p className="text-xs sm:text-sm">
                Before marking this lesson complete, confirm that you have met these milestones:
              </p>
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-[#D4F636]">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Applied the lesson&apos;s primary workflow in your local editor.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-[#D4F636]">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Tested audio levels, visual cadence, and pacing standards.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleted ? "Milestone Verified & Completed" : "Mark Milestone Complete"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Knowledge Check Quiz (if defined) */}
          {currentLesson.quiz && (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4F636] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Knowledge Check</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {currentLesson.quiz.question}
              </h3>

              <div className="space-y-2">
                {currentLesson.quiz.options.map((opt, optIdx) => {
                  const isSelected = quizAnswer === optIdx;
                  let optStyle = "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300";
                  if (quizSubmitted) {
                    if (optIdx === currentLesson.quiz?.answerIndex) {
                      optStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold";
                    } else if (isSelected) {
                      optStyle = "bg-red-500/20 border-red-500/50 text-red-300";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-zinc-800 border-[#D4F636] text-white";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={quizSubmitted}
                      onClick={() => setQuizAnswer(optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={quizAnswer === null}
                  onClick={() => setQuizSubmitted(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Submit Answer
                </button>
              ) : (
                <p className="text-xs text-zinc-400">
                  {quizAnswer === currentLesson.quiz.answerIndex ? (
                    <span className="text-emerald-400 font-bold">Correct! Well done.</span>
                  ) : (
                    <span>Take note of the correct approach for your next project.</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Module Resource Kit Panel */}
          {currentLesson.resources && currentLesson.resources.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Module Resource Kit
              </span>
              <div className="space-y-2">
                {currentLesson.resources.map((res, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{res.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{res.type}</p>
                    </div>
                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-zinc-800 hover:text-[#D4F636] text-zinc-300 text-xs transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (res.content) {
                            navigator.clipboard.writeText(res.content);
                            setCopiedResource(res.name);
                            setTimeout(() => setCopiedResource(null), 2000);
                          }
                        }}
                        className="p-2 rounded-lg bg-zinc-800 hover:text-[#D4F636] text-zinc-300 text-xs transition-colors cursor-pointer"
                      >
                        {copiedResource === res.name ? "Copied!" : "Copy Template"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls: Previous / Next */}
          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
            {prevLesson ? (
              <button
                type="button"
                onClick={() => navigate(`/learn/${course.slug}/${prevLesson.id}`)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
                <span className="sm:hidden">Previous</span>
              </button>
            ) : <div />}

            {nextLesson ? (
              <button
                type="button"
                onClick={() => navigate(`/learn/${course.slug}/${nextLesson.id}`)}
                className="px-5 py-2.5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span className="hidden sm:inline">Next: {nextLesson.title}</span>
                <span className="sm:hidden">Next Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/learn/${course.slug}`)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Track</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Sidebar: Curriculum Outline */}
        <div className="hidden lg:flex w-80 bg-zinc-950 border-l border-zinc-900 flex-col shrink-0">
          <div className="p-4 border-b border-zinc-900">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Curriculum Lessons ({allLessonsWithModule.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {course.modules.map((mod) => (
              <div key={mod.id} className="py-2">
                <div className="px-4 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  {mod.title}
                </div>
                <div className="space-y-0.5 px-2">
                  {mod.lessons.map((les) => {
                    const isActive = les.id === currentLesson.id;
                    const isLesCompleted = completedLessonIds.includes(les.id);
                    const globalIdx = allLessonsWithModule.findIndex((l) => l.id === les.id);
                    const locked = isLessonLocked(globalIdx);

                    return (
                      <button
                        key={les.id}
                        type="button"
                        disabled={locked}
                        onClick={() => navigate(`/learn/${course.slug}/${les.id}`)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          isActive
                            ? "bg-[#D4F636] text-black font-extrabold shadow-sm"
                            : "hover:bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {locked ? (
                            <Lock className="w-3.5 h-3.5 text-zinc-600" />
                          ) : isLesCompleted ? (
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                isActive ? "text-black" : "text-emerald-400"
                              }`}
                            />
                          ) : (
                            <Play
                              className={`w-3.5 h-3.5 ${
                                isActive ? "text-black fill-current" : "text-zinc-500"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate leading-snug">{les.title}</p>
                          <span
                            className={`text-[10px] font-mono block ${
                              isActive ? "text-black/80" : "text-zinc-500"
                            }`}
                          >
                            {les.duration}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-80 max-w-full bg-zinc-950 h-full border-l border-zinc-800 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Curriculum Lessons
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2">
              {course.modules.map((mod) => (
                <div key={mod.id} className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    {mod.title}
                  </div>
                  <div className="space-y-1">
                    {mod.lessons.map((les) => {
                      const isActive = les.id === currentLesson.id;
                      const isLesCompleted = completedLessonIds.includes(les.id);

                      return (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => {
                            setMobileDrawerOpen(false);
                            navigate(`/learn/${course.slug}/${les.id}`);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#D4F636] text-black font-extrabold"
                              : "hover:bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isLesCompleted ? (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  isActive ? "text-black" : "text-emerald-400"
                                }`}
                              />
                            ) : (
                              <Play
                                className={`w-3.5 h-3.5 ${
                                  isActive ? "text-black fill-current" : "text-zinc-500"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate leading-snug">{les.title}</p>
                            <span
                              className={`text-[10px] font-mono block ${
                                isActive ? "text-black/80" : "text-zinc-500"
                              }`}
                            >
                              {les.duration}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
