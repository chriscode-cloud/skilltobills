import React from "react";
import { 
  LayoutDashboard, 
  PlaySquare, 
  Download, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { BrandLogo } from "../BrandLogo";

interface LmsSidebarProps {
  currentTab: "dashboard" | "course" | "resources" | "community" | "settings";
  onSelectTab: (tab: "dashboard" | "course" | "resources" | "community" | "settings") => void;
  onExit: () => void;
  courseTitle?: string;
}

export const LmsSidebar: React.FC<LmsSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExit,
}) => {
  return (
    <aside className="w-full md:w-60 bg-[#08080a] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-4 md:py-6 shrink-0 z-30 font-sans">
      {/* Top Brand Mark */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-3 cursor-pointer group text-left"
            title="Return to Skill2Bills Homepage"
          >
            <div className="relative">
              <BrandLogo className="w-10 h-10 rounded-2xl shadow-lg group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#D4F636] rounded-full border-2 border-[#08080a]" />
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                Skill<span className="text-[#D4F636]">2</span>Bills
              </div>
              <div className="text-xs font-semibold text-[#D4F636]">
                Academy
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-zinc-500 px-3 mb-2">
              Menu
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "dashboard"
                    ? "bg-[#141419] text-[#D4F636] shadow-sm border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("course")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "course"
                    ? "bg-[#141419] text-[#D4F636] shadow-sm border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <PlaySquare className="w-4 h-4 shrink-0" />
                <span>Course</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("resources")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "resources"
                    ? "bg-[#141419] text-[#D4F636] shadow-sm border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Resources</span>
              </button>

              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Community</span>
              </a>
            </nav>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-500 px-3 mb-2">
              General
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === "settings"
                    ? "bg-[#141419] text-[#D4F636] shadow-sm border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open("mailto:support@skill2bills.com", "_blank");
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-left"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Feedback & Help</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Area / Return */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <button
          type="button"
          onClick={onExit}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit Academy</span>
        </button>
      </div>
    </aside>
  );
};
