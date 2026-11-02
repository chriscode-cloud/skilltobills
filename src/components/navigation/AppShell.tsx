import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthUser } from "../../lib/auth";
import { LmsSidebar } from "../lms/LmsSidebar";
import { LearnerFeedbackPopup } from "../feedback/LearnerFeedbackPopup";
import { findCourseBySlugOrId } from "../lms/courseUtils";
import { LMS_COURSES } from "../lms/lmsData";

interface AppShellProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active track from URL or user profile
  const rawTrackSlug = location.pathname.startsWith("/learn/")
    ? location.pathname.replace("/learn/", "").split("/")[0]
    : currentUser.track || "content-clipping";

  const activeCourse = findCourseBySlugOrId(rawTrackSlug) || LMS_COURSES[0];

  const [trackCompletedCount, setTrackCompletedCount] = React.useState(0);
  const [showAutoFeedback, setShowAutoFeedback] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("skill2bills_lms_progress_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        const completedIds: string[] = parsed?.completedLessonIds || [];
        const courseLessonIds = activeCourse.modules.flatMap((m) => m.lessons.map((l) => l.id));
        const count = completedIds.filter((id) => courseLessonIds.includes(id)).length;
        setTrackCompletedCount(count);
      }
    } catch {
      // ignore
    }
  }, [location.pathname, activeCourse.id]);

  // Automated pop up in dashboard / syllabus if learner has completed 2+ lessons in this track
  React.useEffect(() => {
    const hasSubmitted = localStorage.getItem(`skill2bills_feedback_${activeCourse.slug}`);
    const hasDismissedInSession = sessionStorage.getItem(`skill2bills_dismissed_${activeCourse.slug}`);
    if (trackCompletedCount >= 2 && !hasSubmitted && !hasDismissedInSession) {
      const timer = setTimeout(() => {
        setShowAutoFeedback(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [trackCompletedCount, activeCourse.slug]);

  const currentTab: "dashboard" | "course" | "resources" | "community" | "settings" =
    location.pathname.startsWith("/learn")
      ? "course"
      : location.pathname.startsWith("/settings")
      ? "settings"
      : location.pathname === "/resources"
      ? "resources"
      : "dashboard";

  const handleSelectTab = (tab: "dashboard" | "course" | "resources" | "community" | "settings") => {
    const userTrack = currentUser.track || "content-clipping";
    if (tab === "dashboard") navigate("/dashboard");
    else if (tab === "course") navigate(`/learn/${userTrack}`);
    else if (tab === "settings") navigate("/settings/profile");
    else if (tab === "resources") navigate(`/learn/${userTrack}`);
  };

  const handleUserLogout = async () => {
    await onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#D4F636] selection:text-black">
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        <LmsSidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          onExit={() => navigate("/")}
          onLogout={handleUserLogout}
          userEmail={currentUser.email}
        />
        <main className="flex-1 min-w-0 overflow-y-auto bg-black min-h-screen relative">
          <Outlet />
        </main>
      </div>
      <LearnerFeedbackPopup
        isOpen={showAutoFeedback}
        onClose={() => {
          sessionStorage.setItem(`skill2bills_dismissed_${activeCourse.slug}`, "true");
          setShowAutoFeedback(false);
        }}
        trackSlug={activeCourse.slug}
        trackTitle={activeCourse.title}
        completedCount={trackCompletedCount}
        userEmail={currentUser.email}
      />
    </div>
  );
};
