import React, { useState, useEffect } from "react";
import { LmsSidebar } from "./LmsSidebar";
import { StudentDashboard } from "./StudentDashboard";
import { CourseClassroom } from "./CourseClassroom";
import { CourseResources } from "./CourseResources";
import { LMS_COURSES } from "./lmsData";
import { Course, UserProgressState } from "./types";
import { supabase } from "../../lib/superbase/supabase";

interface LmsAppProps {
  onExitToWebsite: () => void;
  initialCourseSlug?: string;
  userEmail?: string;
}

const STORAGE_KEY_PROGRESS = "skill2bills_lms_progress_v1";
const STORAGE_KEY_ACTIVE_COURSE = "skill2bills_lms_active_course_v1";

export const LmsApp: React.FC<LmsAppProps> = ({
  onExitToWebsite,
  initialCourseSlug,
  userEmail = "creator@skill2bills.com",
}) => {
  // Determine initial course
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    if (initialCourseSlug) {
      const match = LMS_COURSES.find((c) => c.slug === initialCourseSlug);
      if (match) return match.id;
    }
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_COURSE);
    if (saved && LMS_COURSES.some((c) => c.id === saved)) {
      return saved;
    }
    return LMS_COURSES[0].id;
  });

  const activeCourse: Course =
    LMS_COURSES.find((c) => c.id === activeCourseId) || LMS_COURSES[0];

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<
    "dashboard" | "course" | "resources" | "community" | "settings"
  >("dashboard");

  // User progress state (completed lesson IDs)
  const [progress, setProgress] = useState<UserProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default initial mock progress for a realistic feel
    return {
      completedLessonIds: ["les-clip-1", "les-clip-2"],
      lastActiveLessonId: "les-clip-3",
    };
  });

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return progress.lastActiveLessonId || activeCourse.modules[0].lessons[0].id;
  });

  // Persist progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Persist active course
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_COURSE, activeCourseId);
  }, [activeCourseId]);

  // Attempt to sync progress with Supabase if configured
  useEffect(() => {
    if (!supabase) return;
    const fetchCloudProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", userEmail);

        if (!error && data && data.length > 0) {
          const ids = data.map((d: any) => d.lesson_id);
          setProgress((prev) => ({
            ...prev,
            completedLessonIds: Array.from(new Set([...prev.completedLessonIds, ...ids])),
          }));
        }
      } catch (err) {
        console.warn("Supabase user_progress fetch error:", err);
      }
    };
    fetchCloudProgress();
  }, [userEmail]);

  // Handler: Mark or unmark a lesson complete
  const handleToggleCompleteLesson = async (lessonId: string) => {
    const isCompleted = progress.completedLessonIds.includes(lessonId);
    let newCompleted: string[];

    if (isCompleted) {
      newCompleted = progress.completedLessonIds.filter((id) => id !== lessonId);
    } else {
      newCompleted = [...progress.completedLessonIds, lessonId];
    }

    setProgress((prev) => ({
      ...prev,
      completedLessonIds: newCompleted,
      lastActiveLessonId: lessonId,
    }));

    // If Supabase is available, sync to user_progress table
    if (supabase) {
      try {
        if (!isCompleted) {
          await supabase.from("user_progress").upsert({
            user_id: userEmail,
            lesson_id: lessonId,
            completed_at: new Date().toISOString(),
          });
        } else {
          await supabase
            .from("user_progress")
            .delete()
            .match({ user_id: userEmail, lesson_id: lessonId });
        }
      } catch (err) {
        console.warn("Error toggling progress in Supabase:", err);
      }
    }
  };

  // Handler: Select lesson and open course player
  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setProgress((prev) => ({ ...prev, lastActiveLessonId: lessonId }));
    setCurrentTab("course");
  };

  // Continue course from dashboard
  const handleContinueCourse = () => {
    const allLessons = activeCourse.modules.flatMap((m) => m.lessons);
    // Find first incomplete lesson
    const nextIncomplete = allLessons.find(
      (l) => !progress.completedLessonIds.includes(l.id)
    );
    const targetId = nextIncomplete ? nextIncomplete.id : allLessons[0].id;
    setActiveLessonId(targetId);
    setCurrentTab("course");
  };

  // Switch course
  const handleSwitchCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    const targetCourse = LMS_COURSES.find((c) => c.id === courseId);
    if (targetCourse && targetCourse.modules[0]?.lessons[0]) {
      setActiveLessonId(targetCourse.modules[0].lessons[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col md:flex-row w-full font-sans antialiased selection:bg-[#D4F636] selection:text-black">
      {/* 1. Left Sidebar Navigation */}
      <LmsSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onExit={onExitToWebsite}
        courseTitle={activeCourse.title}
      />

      {/* 2. Main Content Stage */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#09090c]">
        {currentTab === "dashboard" && (
          <StudentDashboard
            course={activeCourse}
            progress={progress}
            onContinueCourse={handleContinueCourse}
            onSelectLesson={handleSelectLesson}
            userEmail={userEmail}
            allCourses={LMS_COURSES}
            onSwitchCourse={handleSwitchCourse}
          />
        )}

        {currentTab === "course" && (
          <CourseClassroom
            course={activeCourse}
            activeLessonId={activeLessonId}
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onToggleCompleteLesson={handleToggleCompleteLesson}
            onBackToDashboard={() => setCurrentTab("dashboard")}
          />
        )}

        {currentTab === "resources" && (
          <CourseResources course={activeCourse} />
        )}

        {currentTab === "settings" && (
          <div className="flex-1 p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">Student Account &amp; Preferences</h1>
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Enrolled Email</label>
                <div className="text-sm font-semibold text-white bg-black/40 border border-white/5 rounded-xl p-3">
                  {userEmail}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Active Pathway</label>
                <div className="text-sm font-semibold text-[#D4F636] bg-black/40 border border-white/5 rounded-xl p-3">
                  {activeCourse.title}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY_PROGRESS);
                    setProgress({ completedLessonIds: [] });
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Completed Lessons Progress
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
