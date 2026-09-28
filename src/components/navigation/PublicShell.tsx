import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { TelecastHeader } from "../TelecastHeader";
import { TopBar } from "../TopBar";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import { AuthUser } from "../../lib/auth";

interface PublicShellProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const PublicShell: React.FC<PublicShellProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#D4F636] selection:text-black">
      {/* 1. Global Announcement / Telecast Ticker */}
      <TelecastHeader onExploreClick={() => navigate("/programmes")} />

      {/* 2. Public TopBar */}
      <TopBar
        currentUser={currentUser}
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate(currentUser ? "/dashboard" : "/signup")}
        onLogout={onLogout}
      />

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate(currentUser ? "/dashboard" : "/signup")}
        onLogout={onLogout}
        onSelectTrack={(slug) => navigate(`/programmes/${slug}`)}
        onBlogClick={() => navigate("/blog")}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Public Footer */}
      <Footer
        onSelectTrackById={(id) => {
          const trackSlugMap: Record<string, string> = {
            "ai-influencer": "ai-virtual-influencers",
            "content-creation": "content-clipping",
            "live-streaming": "live-streaming",
            "youtube-automation": "youtube-automation",
          };
          const slug = trackSlugMap[id] || id;
          navigate(`/programmes/${slug}`);
        }}
        onBlogClick={() => navigate("/blog")}
      />
    </div>
  );
};
