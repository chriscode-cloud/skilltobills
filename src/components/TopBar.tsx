import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

interface TopBarProps {
  onLoginClick: () => void;
  onCommunityClick: () => void;
  onBlogClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onLoginClick, onCommunityClick, onBlogClick }) => {
  const [communityOpen, setCommunityOpen] = useState(false);
  const communityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
        setCommunityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      id="utility-topbar"
      className="bg-[#000000] text-slate-300 text-xs sm:text-sm font-medium py-2 px-4 sm:px-10 lg:px-16 flex items-center justify-end gap-3 sm:gap-6 border-b border-white/10 relative z-50 w-full max-w-full"
    >
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Community dropdown matching ALX style */}
        <div className="relative" ref={communityRef}>
          <button
            type="button"
            onClick={() => setCommunityOpen(!communityOpen)}
            className={`hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1 ${
              communityOpen ? "text-[#D4F636] font-semibold" : ""
            }`}
          >
            <span>Community</span>
            {communityOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#D4F636]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {communityOpen && (
            <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white text-slate-900 rounded-b-2xl rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-150">
              {/* Top item: All Community Hubs */}
              <button
                type="button"
                onClick={() => {
                  setCommunityOpen(false);
                  onCommunityClick();
                }}
                className="w-full text-left px-6 py-4 font-medium text-[15px] text-slate-900 hover:bg-slate-50 transition-colors border-b border-slate-200/80 flex items-center justify-between cursor-pointer"
              >
                <span>All Community Hubs</span>
              </button>

              {/* Section label: EXPLORE BY CATEGORY */}
              <div className="px-6 pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                EXPLORE BY CATEGORY
              </div>

              <div className="pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setCommunityOpen(false);
                    onCommunityClick();
                  }}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 transition-colors group cursor-pointer text-left"
                >
                  <span>Discord Creator Hub</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </button>

                <a
                  href="#transformation"
                  onClick={() => setCommunityOpen(false)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 transition-colors group cursor-pointer text-left"
                >
                  <span>Learners Voices &amp; Proof</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </a>

                <a
                  href="#the-latest"
                  onClick={() => setCommunityOpen(false)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 transition-colors group cursor-pointer text-left"
                >
                  <span>Live AMAs &amp; Workshops</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </a>

                <a
                  href="#footer"
                  onClick={() => setCommunityOpen(false)}
                  className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-slate-700 hover:text-black hover:bg-slate-50 transition-colors group cursor-pointer text-left"
                >
                  <span>Creator Mentorship Network</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </div>
          )}
        </div>



        <button
          type="button"
          onClick={onBlogClick}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Blog
        </button>

        <a
          href="#footer"
          className="hover:text-white transition-colors hidden sm:inline-block"
        >
          Support
        </a>

        <div className="w-[1px] h-3.5 bg-white/20 hidden sm:block"></div>

        <button
          type="button"
          onClick={onLoginClick}
          className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-white hover:underline">Login</span>
        </button>
      </div>
    </div>
  );
};
