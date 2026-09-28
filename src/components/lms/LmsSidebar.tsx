import React from "react";
import { 
  LayoutDashboard, 
  Plus,
  PlaySquare, 
  Download, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { BrandLogo } from "../BrandLogo";

interface LmsSidebarProps {
  currentTab: "dashboard" | "course" | "resources" | "community" | "settings";
  onSelectTab: (tab: "dashboard" | "course" | "resources" | "community" | "settings") => void;
  onExit: () => void;
  onLogout?: () => void;
  userEmail?: string;
  courseTitle?: string;
}

export const LmsSidebar: React.FC<LmsSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExit,
  onLogout,
}) => {
  return (
    <aside className="w-full md:w-56 bg-[#000000] border-b md:border-b-0 md:border-r border-zinc-900 flex flex-col justify-between p-4 shrink-0 z-30 font-sans">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pt-1">
          <button
            type="button"
            onClick={onExit}
            className="flex flex-col items-center gap-1 cursor-pointer group text-center mx-auto"
            title="Return to Skill2Bills Homepage"
          >
            <div className="w-12 h-12 bg-[#D4F636] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,246,54,0.3)] group-hover:scale-105 transition-transform">
              <BrandLogo className="w-8 h-8 text-black" />
            </div>
            <span className="text-[10px] font-mono font-black text-[#D4F636] tracking-widest mt-1">
              ACADEMY
            </span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-6 pt-2">
          {/* MENU */}
          <div>
            <div className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 px-3 mb-2">
              MENU
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "dashboard"
                    ? "bg-[#1c220a] text-[#D4F636] border border-[#3b4711]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("course")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "course"
                    ? "bg-[#1c220a] text-[#D4F636] border border-[#3b4711]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Create</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("course")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "course"
                    ? "bg-[#1c220a] text-[#D4F636] border border-[#3b4711]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <PlaySquare className="w-4 h-4 shrink-0" />
                <span>Course</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("resources")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "resources"
                    ? "bg-[#1c220a] text-[#D4F636] border border-[#3b4711]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Resources</span>
              </button>

              <a
                href={import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Community</span>
              </a>
            </nav>
          </div>

          {/* Language Selector */}
          <div className="px-1">
            <div className="w-full bg-[#121216] border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-zinc-300 font-semibold">
              <span>English</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>

          {/* GENERAL */}
          <div>
            <div className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-zinc-500 px-3 mb-2">
              GENERAL
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  window.open("mailto:support@skill2bills.com", "_blank");
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition-all cursor-pointer text-left"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "settings"
                    ? "bg-[#1c220a] text-[#D4F636] border border-[#3b4711]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer text-left mt-2"
                >
                  <LogOut className="w-4 h-4 shrink-0 rotate-180" />
                  <span>Sign out</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};
