import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthUser } from "../../lib/auth";
import { LmsSidebar } from "../lms/LmsSidebar";

interface AppShellProps {
  currentUser: AuthUser;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    navigate("/signup", { replace: true });
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
        <main className="flex-1 min-w-0 overflow-y-auto bg-black min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
