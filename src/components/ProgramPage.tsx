import React, { useState, useRef } from "react";
import { CourseTrack } from "../data/contentData";
import { Play, Pause, CheckCircle2, Sparkles, Wrench } from "lucide-react";

interface ProgramPageProps {
  track: CourseTrack;
}

export const ProgramPage: React.FC<ProgramPageProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const isAiInfluencer = track.id === "ai-influencer";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-in fade-in duration-300">
      {/* 1. Header Banner/Hero with track background tint or image */}
      <div 
        className={`border-b border-black/5 py-12 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 ${
          isAiInfluencer 
            ? "bg-cover bg-center md:bg-right bg-no-repeat relative" 
            : track.bgColor
        }`}
        style={isAiInfluencer ? { backgroundImage: "url('/ai-influencer-bg.jpg')" } : undefined}
      >
        {/* Soft left gradient shadow overlay for perfect readability on mobile */}
        {isAiInfluencer && (
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent md:from-white md:via-white/70 md:to-transparent/30 pointer-events-none" />
        )}

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl bg-white/50 backdrop-blur-xs md:bg-transparent md:backdrop-blur-none p-6 sm:p-8 md:p-0 rounded-3xl border border-white/30 md:border-none shadow-xs md:shadow-none">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
                {track.title}
              </h1>

              <p className="text-slate-900 text-base sm:text-lg font-bold max-w-xl mb-3">
                {track.tagline}
              </p>

              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
                {track.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Deliverable, Curriculum, Tools */}
          <div className="lg:col-span-7 space-y-8">
            {/* Estimated Revenue Range Box */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
              <div className="text-xs font-bold text-[#D4F636] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4F636]" />
                <span>Estimated Revenue Range</span>
              </div>
              <p className="text-white text-2xl sm:text-3xl font-black tracking-tight">
                {track.earningsRange}
              </p>
            </div>

            {/* Key Modules / Curriculum Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 mb-6">
                Key Modules &amp; Curriculum
              </h2>

              <div className="space-y-4">
                {track.curriculum.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D4F636]/20 text-black font-extrabold text-sm flex items-center justify-center shrink-0">
                      0{index + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-950 text-sm sm:text-base">{item}</h4>
                      <p className="text-xs text-slate-500">Includes live exercises, assignments, and certified creator check-ins.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Tech Stack */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-slate-800" />
                <span>Creator Tech Stack</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mb-6">
                Master the exact industry tools and production environments used across this programme.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {track.keyTools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D4F636] shrink-0"></span>
                    <span>{tool}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Premium Raw Video Player */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div 
              onClick={togglePlay}
              className="relative aspect-video rounded-3xl overflow-hidden bg-black border-2 border-slate-900 shadow-xl cursor-pointer group"
            >
              <video
                ref={videoRef}
                src="/ai-side-hustles.mp4"
                poster="/video-poster.jpg"
                className="w-full h-full object-cover"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Dark overlay when not playing or on hover */}
              <div className={`absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-all flex items-center justify-center ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                {/* Circle play button */}
                <div className="w-14 h-14 rounded-full bg-[#D4F636] text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-black text-black" />
                  ) : (
                    <Play className="w-6 h-6 fill-black translate-x-0.5 text-black" />
                  )}
                </div>
              </div>

              {/* Discreet status pill */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/10 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-[#D4F636]'}`}></span>
                <span>{isPlaying ? 'Playing Overview' : 'Click to Play Overview'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
