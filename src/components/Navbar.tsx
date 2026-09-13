import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Menu, X, ArrowUpRight } from "lucide-react";
import { COURSE_TRACKS, CourseTrack } from "../data/contentData";
import { BrandLogo } from "./BrandLogo";

interface NavbarProps {
  onSelectTrack: (track: CourseTrack) => void;
  onExploreClick: () => void;
  onHomeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTrack, onExploreClick, onHomeClick }) => {
  const [programmesOpen, setProgrammesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgrammesOpen, setMobileProgrammesOpen] = useState(false);
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProgrammesOpen(false);
        setHoveredTrackId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const TRACK_ITEMS = [
    {
      id: "ai-influencer",
      label: "AI & Virtual Influencers",
      track: COURSE_TRACKS[0],
    },
    {
      id: "content-creation",
      label: "Viral Content & Short-Form UGC",
      track: COURSE_TRACKS[1],
    },
    {
      id: "live-streaming",
      label: "Live Streaming & Gaming",
      track: COURSE_TRACKS[2],
    },
    {
      id: "youtube-automation",
      label: "Faceless YouTube Automation",
      track: COURSE_TRACKS[3],
    },
  ];

  return (
    <nav
      id="main-navbar"
      className="bg-[#000000] text-white sticky top-0 z-40 border-b border-white/10 shadow-sm transition-all"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 py-4 flex items-center justify-between">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-3 group cursor-pointer text-left"
          >
            <BrandLogo className="w-9 h-9 sm:w-10 sm:h-10" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Skill<span className="text-[#D4F636]">2</span>Bills
            </span>
          </button>
        </div>

        {/* Center/Right Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-white">
          {/* Pathways / Programmes dropdown matching the reference visual style */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setProgrammesOpen(true)}
            onMouseLeave={() => {
              setProgrammesOpen(false);
              setHoveredTrackId(null);
            }}
          >
            <button
              type="button"
              onClick={() => {
                setProgrammesOpen(!programmesOpen);
                if (programmesOpen) setHoveredTrackId(null);
              }}
              className={`relative flex items-center gap-1.5 transition-colors py-2 cursor-pointer font-medium ${
                programmesOpen ? "text-[#D4F636]" : "text-white hover:text-[#D4F636]"
              }`}
            >
              <span>Programmes</span>
              {programmesOpen ? (
                <ChevronUp className="w-4 h-4 text-[#D4F636]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
              {/* Active bottom indicator line matching the screenshot style */}
              {programmesOpen && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[3px] bg-[#D4F636] z-50 rounded-t-sm" />
              )}
            </button>

            {programmesOpen && (
              <div
                className="absolute left-0 top-full mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
              >
                {/* Top item: All Pathways / All Programmes */}
                <button
                  type="button"
                  onClick={() => {
                    onExploreClick();
                    setProgrammesOpen(false);
                  }}
                  className="w-full text-left px-6 py-4 text-slate-900 font-medium text-[15px] hover:bg-slate-50 transition-colors border-b border-slate-200/80 flex items-center justify-between cursor-pointer group"
                >
                  <span>All Programmes</span>
                </button>

                {/* Section label: EXPLORE BY TRACK */}
                <div className="px-6 pt-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  EXPLORE BY TRACK
                </div>

                {/* Track List matching screenshot layout with clean text and right chevrons */}
                <div className="pb-3">
                  {TRACK_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTrack(item.track);
                        setProgrammesOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-6 py-3 text-[14px] font-medium transition-colors cursor-pointer text-left text-slate-700 hover:text-black hover:bg-slate-50 group"
                    >
                      <span className="truncate pr-2">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-5 bg-white/20"></div>

          <button
            type="button"
            onClick={() => onSelectTrack(COURSE_TRACKS[0])}
            className="hover:text-[#D4F636] transition-colors cursor-pointer font-medium text-white"
          >
            AI &amp; Fanvue
          </button>

          <button
            type="button"
            onClick={() => onSelectTrack(COURSE_TRACKS[1])}
            className="hover:text-[#D4F636] transition-colors cursor-pointer font-medium text-white"
          >
            Viral UGC
          </button>

          <button
            type="button"
            onClick={() => onSelectTrack(COURSE_TRACKS[2])}
            className="hover:text-[#D4F636] transition-colors cursor-pointer font-medium text-white"
          >
            Live Streaming
          </button>

          <button
            type="button"
            onClick={onExploreClick}
            className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer ml-2 shadow-sm"
          >
            Explore Programmes
          </button>
        </div>

        {/* Mobile Hamburger toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#D4F636] focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#000000] border-t border-white/15 px-6 py-6 space-y-5 shadow-xl animate-fade-in text-white">
          <div className="space-y-4 text-sm font-medium text-slate-300">
            {/* Collapsible Programmes option */}
            <div className="border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setMobileProgrammesOpen(!mobileProgrammesOpen)}
                className="w-full flex items-center justify-between py-1 text-left text-slate-100 hover:text-[#D4F636] font-semibold transition-colors cursor-pointer"
              >
                <span>Programmes</span>
                {mobileProgrammesOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#D4F636]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {mobileProgrammesOpen && (
                <div className="mt-2.5 bg-white text-slate-900 rounded-2xl p-4.5 space-y-3.5 shadow-lg border border-slate-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      onExploreClick();
                      setMobileMenuOpen(false);
                      setMobileProgrammesOpen(false);
                    }}
                    className="flex items-center justify-between w-full text-left py-1 text-slate-700 hover:text-black text-xs sm:text-sm font-semibold cursor-pointer group"
                  >
                    <span>All Programmes</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-black" />
                  </button>
                  {TRACK_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTrack(item.track);
                        setMobileMenuOpen(false);
                        setMobileProgrammesOpen(false);
                      }}
                      className="flex items-center justify-between w-full text-left py-1 text-slate-700 hover:text-black text-xs sm:text-sm font-semibold cursor-pointer group"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-black" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="#subscribe-banner"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#D4F636] text-slate-100 font-semibold cursor-pointer"
            >
              Newsletter &amp; Updates
            </a>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onExploreClick();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#D4F636] text-black font-bold py-3 rounded-full text-center text-sm shadow-md hover:bg-[#c2e42b]"
            >
              Explore All Creator Programmes
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
