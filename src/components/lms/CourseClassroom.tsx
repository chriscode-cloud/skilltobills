import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  MessageSquare, 
  Download, 
  Sparkles, 
  Check, 
  X,
  FileText
} from "lucide-react";
import { Course, Lesson, UserProgressState } from "./types";

interface CourseClassroomProps {
  course: Course;
  activeLessonId?: string;
  progress: UserProgressState;
  onSelectLesson: (lessonId: string) => void;
  onToggleCompleteLesson: (lessonId: string) => void;
  onBackToDashboard: () => void;
}

export const CourseClassroom: React.FC<CourseClassroomProps> = ({
  course,
  activeLessonId,
  progress,
  onSelectLesson,
  onToggleCompleteLesson,
  onBackToDashboard,
}) => {
  // Flatten all lessons to enable simple "Next" and "Previous" logic
  const allLessonsWithModule = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
  );

  const activeIndex = allLessonsWithModule.findIndex(
    (l) => l.id === activeLessonId
  );
  const currentLesson =
    activeIndex !== -1 ? allLessonsWithModule[activeIndex] : allLessonsWithModule[0];

  const nextLesson =
    activeIndex !== -1 && activeIndex + 1 < allLessonsWithModule.length
      ? allLessonsWithModule[activeIndex + 1]
      : null;

  // Find active module to display phase statistics
  const currentModule =
    course.modules.find((m) => m.id === currentLesson?.moduleId) || course.modules[0];

  // Active module completion calculation
  const moduleLessons = currentModule.lessons;
  const moduleCompletedCount = moduleLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;
  const modulePercent =
    moduleLessons.length > 0
      ? Math.round((moduleCompletedCount / moduleLessons.length) * 100)
      : 0;

  const isCurrentLessonCompleted = currentLesson
    ? progress.completedLessonIds.includes(currentLesson.id)
    : false;

  // State for interactive client-side quiz
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [copiedResource, setCopiedResource] = useState<string | null>(null);

  // Reset quiz state when active lesson changes
  React.useEffect(() => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setCopiedResource(null);
  }, [currentLesson?.id]);

  const handleCopyPrompt = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResource(name);
    setTimeout(() => setCopiedResource(null), 2000);
  };

  if (!currentLesson) {
    return (
      <div className="p-8 text-center text-white">
        No lesson found.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full font-sans text-white bg-[#0a0a0d]">
      {/* LEFT / CENTER STAGE: Video Canvas & Lesson Content (Flex 1, scrollable) */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to course</span>
          </button>
          <span>&rsaquo;</span>
          <span className="text-zinc-300 font-medium">{currentModule.title}</span>
          <span>&rsaquo;</span>
          <span className="text-[#D4F636] font-bold truncate max-w-[200px] sm:max-w-xs">
            {currentLesson.title}
          </span>
        </div>

        {/* 16:9 Video Canvas Player */}
        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${currentLesson.videoUrl}?modestbranding=1&rel=0&showinfo=0`}
            title={currentLesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Action Header Directly Below Video */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {currentLesson.title}
            </h1>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-1">
              <span className="bg-zinc-800 text-zinc-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                {currentLesson.duration}
              </span>
              <span>&bull;</span>
              <span>{currentModule.title}</span>
            </div>
          </div>

          {/* Toggle Complete Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleCompleteLesson(currentLesson.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isCurrentLessonCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-[#D4F636] hover:bg-[#c2e42b] text-black shadow-[#D4F636]/10 active:scale-95"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCurrentLessonCompleted ? "Completed" : "Mark Complete"}</span>
            </button>
          </div>
        </div>

        {/* UP NEXT CARD */}
        {nextLesson && (
          <button
            type="button"
            onClick={() => onSelectLesson(nextLesson.id)}
            className="w-full bg-[#131318] hover:bg-[#181820] border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer text-left group"
          >
            <div>
              <div className="text-xs font-semibold text-[#D4F636]">
                Up Next
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5 group-hover:text-[#D4F636] transition-colors">
                {nextLesson.title}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#D4F636] group-hover:text-black flex items-center justify-center transition-colors shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* LESSON SUMMARY & MARKDOWN SECTION */}
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4F636]" />
              <span>Practical Execution Breakdown</span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mt-2">
              {currentLesson.bodyContent}
            </p>
          </div>

          {/* Actionable Resources & Downloads */}
          {currentLesson.resources && currentLesson.resources.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="text-xs font-semibold text-zinc-400">
                Practical Assets &amp; Downloads
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLesson.resources.map((res, i) => (
                  <div
                    key={i}
                    className="bg-[#181820] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-white truncate">
                        {res.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 capitalize">
                        {res.type}
                      </div>
                    </div>
                    {res.content ? (
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(res.content || "", res.name)}
                        className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        {copiedResource === res.name ? "Copied!" : "Copy Prompt"}
                      </button>
                    ) : (
                      <a
                        href={res.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#D4F636] hover:bg-[#c2e42b] text-black text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Get</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLIENT-SIDE INSTANT RECALL CHALLENGE (QUIZ JSON) */}
          {currentLesson.quiz && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4F636]" />
                <h4 className="text-xs font-semibold text-white">
                  Instant Recall Challenge
                </h4>
              </div>

              <div className="bg-[#181820] border border-white/5 rounded-2xl p-5 space-y-4">
                <p className="text-xs sm:text-sm font-bold text-white">
                  {currentLesson.quiz.question}
                </p>

                <div className="space-y-2">
                  {currentLesson.quiz.options.map((option, idx) => {
                    let btnStyle = "bg-[#121217] border-white/5 text-zinc-300 hover:border-white/20";
                    if (selectedAnswer === idx) {
                      btnStyle = "bg-[#D4F636]/10 border-[#D4F636] text-white";
                    }
                    if (quizSubmitted) {
                      if (idx === currentLesson.quiz?.answerIndex) {
                        btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                      } else if (selectedAnswer === idx) {
                        btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!quizSubmitted) setSelectedAnswer(idx);
                        }}
                        disabled={quizSubmitted}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && idx === currentLesson.quiz?.answerIndex && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {quizSubmitted && selectedAnswer === idx && idx !== currentLesson.quiz?.answerIndex && (
                          <X className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedAnswer !== null) setQuizSubmitted(true);
                    }}
                    disabled={selectedAnswer === null}
                    className="bg-white hover:bg-slate-200 text-black text-xs font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="text-xs text-zinc-300 bg-black/40 p-3 rounded-xl border border-white/5">
                    <strong>Takeaway:</strong> {currentLesson.quiz.explanation}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: MODULE & LESSON TREE (Exact Fanvue layout from lms2.PNG) */}
      <div className="w-full lg:w-80 bg-[#0d0d12] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-5 sm:p-6 space-y-6">
          {/* Phase Progress Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#D4F636]">
                Current Phase
              </span>
              <span className="text-zinc-300 font-bold">
                {modulePercent}%
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              {currentModule.title}
            </h2>
            <div className="text-xs text-zinc-400">
              {moduleCompletedCount} of {moduleLessons.length} lessons completed
            </div>

            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[#D4F636] rounded-full transition-all duration-300"
                style={{ width: `${modulePercent}%` }}
              />
            </div>
          </div>

          {/* Sticky Community Discord CTA Box */}
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 space-y-2.5 shadow-md">
            <h3 className="text-xs font-semibold text-zinc-400">
              Community
            </h3>
            <p className="text-xs text-zinc-300">
              Connect with other Academy creators &amp; share output.
            </p>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-[#D4F636]/10"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Open Discord</span>
            </a>
          </div>

          {/* Module & Lesson Tree */}
          <div className="space-y-6">
            {course.modules.map((mod) => (
              <div key={mod.id} className="space-y-2.5">
                <div className="text-xs font-semibold text-zinc-400 px-1">
                  {mod.title}
                </div>

                <div className="space-y-1.5">
                  {mod.lessons.map((lesson) => {
                    const isLessonActive = lesson.id === currentLesson.id;
                    const isLessonCompleted = progress.completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                          isLessonActive
                            ? "bg-[#1a1a24] border border-[#D4F636]/40 shadow-sm"
                            : "hover:bg-white/5 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {isLessonCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-[#D4F636] text-black flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : isLessonActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-[#D4F636] flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 bg-[#D4F636] rounded-full" />
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                          )}

                          <span
                            className={`text-xs truncate ${
                              isLessonActive ? "font-bold text-white" : "font-medium text-zinc-300"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>

                        <span className="text-[11px] font-semibold text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full shrink-0">
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
