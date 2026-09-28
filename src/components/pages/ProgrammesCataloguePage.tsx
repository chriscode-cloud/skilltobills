import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, Layers, Sparkles } from "lucide-react";
import { COURSE_TRACKS } from "../../data/contentData";
import { usePageMeta } from "../../hooks/usePageMeta";

export const ProgrammesCataloguePage: React.FC = () => {
  usePageMeta(
    "All Programmes & Pathways",
    "Explore practical edtech pathways designed for the 2026 creator economy."
  );

  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Pathways" },
    { id: "ai", label: "AI & Virtual Influencers" },
    { id: "clipping", label: "Content Clipping" },
    { id: "streaming", label: "Live Broadcast" },
    { id: "youtube", label: "YouTube Automation" },
  ];

  const trackSlugMap: Record<string, { slug: string; cat: string }> = {
    "ai-influencer": { slug: "ai-virtual-influencers", cat: "ai" },
    "content-creation": { slug: "content-clipping", cat: "clipping" },
    "live-streaming": { slug: "live-streaming", cat: "streaming" },
    "youtube-automation": { slug: "youtube-automation", cat: "youtube" },
  };

  const filteredTracks = COURSE_TRACKS.filter((track) => {
    if (selectedFilter === "all") return true;
    const meta = trackSlugMap[track.id];
    return meta?.cat === selectedFilter;
  });

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="inline-block px-3 py-1 rounded-full bg-[#D4F636]/10 text-[#D4F636] font-mono text-xs font-bold mb-4 border border-[#D4F636]/20">
          2026 Curriculum Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Practical skills that creators and media teams pay for.
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Structured programmes with hands-on tool stacks, project briefs, and measurable milestones.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === cat.id
                ? "bg-[#D4F636] text-black shadow-xs font-extrabold"
                : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTracks.map((track) => {
          const mapping = trackSlugMap[track.id] || { slug: track.id, cat: "all" };
          return (
            <div
              key={track.id}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold">
                    {track.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{track.duration}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-[#D4F636] transition-colors mb-3">
                  {track.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  {track.description}
                </p>

                {/* Modules breakdown */}
                <div className="space-y-2 mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Core Curriculum Modules ({track.curriculum.length})
                  </span>
                  {track.curriculum.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636]" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                  {track.curriculum.length > 3 && (
                    <p className="text-[11px] text-zinc-500 pt-1">
                      + {track.curriculum.length - 3} additional modules
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  <span>Tool Stack: </span>
                  <strong className="text-zinc-200">{track.keyTools.slice(0, 3).join(", ")}</strong>
                </div>

                <Link
                  to={`/programmes/${mapping.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-colors"
                >
                  <span>View Programme</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
