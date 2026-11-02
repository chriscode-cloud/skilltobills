import React from "react";
import { 
  Play, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  Flame, 
  BookOpen, 
  Layers, 
  MessageSquare
} from "lucide-react";
import { Course, UserProgressState } from "./types";

interface StudentDashboardProps {
  course: Course;
  progress: UserProgressState;
  onContinueCourse: () => void;
  onSelectLesson: (lessonId: string) => void;
  userEmail?: string;
  allCourses: Course[];
  onSwitchCourse: (courseId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  course,
  progress,
  onContinueCourse,
  onSelectLesson,
  userEmail = "creator@skill2bills.com",
  allCourses,
  onSwitchCourse,
}) => {
  // Compute course completion statistics
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;
  const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Derive initial or display name
  const studentName = userEmail.split("@")[0] || "Christian";
  const formattedName = studentName.charAt(0).toUpperCase() + studentName.slice(1);
  const avatarLetter = formattedName.charAt(0).toUpperCase();

  return (
    <div className="flex-1 p-5 sm:p-8 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full font-sans text-white">
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hello, {formattedName}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Welcome to Skill2Bills Creator Academy. Master high-converting digital workflows.
        </p>
      </div>

      {/* Main Grid: Left 8-cols Hero + Right 4-cols Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8-col: Main Course Progress Hero */}
        <div className="lg:col-span-8 space-y-6">
          {/* Big Progress Box */}
          <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Radial Progress Ring */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-zinc-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#D4F636]"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * percentComplete) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute font-black text-xl text-white">
                    {percentComplete}%
                  </div>
                </div>

                <div>
                  <div className="inline-block text-xs font-semibold bg-[#D4F636]/10 text-[#D4F636] px-2.5 py-0.5 rounded-full border border-[#D4F636]/20 mb-1.5">
                    {course.badge}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {course.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {completedCount} of {totalLessons} lessons complete
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={onContinueCourse}
                className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#D4F636]/10 active:scale-95 shrink-0"
              >
                <span>Continue</span>
                <Play className="w-4 h-4 fill-black" />
              </button>
            </div>

            {/* Horizontal progress indicator bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-[#D4F636] rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Quick Actions & Track Switcher */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400">
              Switch Pathway
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allCourses.map((c) => {
                const isCurrent = c.id === course.id;
                const cLessons = c.modules.flatMap((m) => m.lessons);
                const cCompleted = cLessons.filter((l) =>
                  progress.completedLessonIds.includes(l.id)
                ).length;
                const cPct = cLessons.length > 0 ? Math.round((cCompleted / cLessons.length) * 100) : 0;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSwitchCourse(c.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? "bg-[#181820] border-[#D4F636]/50 shadow-md"
                        : "bg-[#101014] border-white/5 hover:border-white/20 hover:bg-[#14141a]"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-white truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {cLessons.length} lessons &bull; {cPct}% done
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#D4F636] bg-[#D4F636]/10 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events Box */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Events</span>
            </h3>
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 text-center text-zinc-400 text-xs shadow-md">
              No live coaching sessions scheduled this week. Keep building your modules!
            </div>
          </div>
        </div>

        {/* Right 4-col: Profile Stat Card & Announcements */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Profile Card */}
          <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#D4F636] text-black font-black text-lg flex items-center justify-center shadow-lg">
                {avatarLetter}
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-white truncate">
                  {formattedName}
                </div>
                <div className="text-xs text-zinc-400 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#181820] border border-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white">
                  {completedCount}
                </div>
                <div className="text-xs font-medium text-zinc-400 mt-0.5">
                  Lessons Done
                </div>
              </div>

              <div className="bg-[#181820] border border-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-[#D4F636]">
                  {percentComplete}%
                </div>
                <div className="text-xs font-medium text-zinc-400 mt-0.5">
                  Completion
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#D4F636]" />
              <span>Announcements</span>
            </h3>

            <div className="bg-[#181820] border border-white/5 rounded-2xl p-4 space-y-2.5">
              <span className="text-[11px] font-medium text-zinc-400 bg-black/40 px-2 py-0.5 rounded">
                Oct 15, 2026
              </span>
              <h3 className="text-xs font-bold text-white">
                Join the Academy Discord
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connect with fellow creators, share clip drafts, and get instant feedback on your AI model generations.
              </p>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4F636] hover:underline pt-1 cursor-pointer"
              >
                <span>Open Discord Lounge</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
