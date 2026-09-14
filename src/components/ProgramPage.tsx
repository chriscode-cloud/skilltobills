import React, { useState, useRef } from "react";
import { CourseTrack } from "../data/contentData";
import { Play, Pause, Sparkles, Wrench, ChevronDown, ChevronUp } from "lucide-react";

interface ProgramPageProps {
  track: CourseTrack;
  onBack?: () => void;
  onEnrollSuccess?: (trackTitle: string) => void;
}

interface ModuleItem {
  title: string;
  description: string;
}

export const ProgramPage: React.FC<ProgramPageProps> = ({ track, onBack, onEnrollSuccess }) => {
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

  // AI Influencer interactive curriculum modules
  const aiInfluencerModules: ModuleItem[] = [
    {
      title: "Character Foundations (Beginner)",
      description: "Choosing a character concept, niche, and audience before touching any tool  the step most beginners skip and regret later."
    },
    {
      title: "Building Visual Consistency",
      description: "Using a prompt/no-prompt visual character builder (like Higgsfield's Soul ID approach) to lock in a consistent face/character across multiple images the single hardest technical problem in this space, tackled with current, beginner-friendly tools instead of manual prompt-engineering."
    },
    {
      title: "From Image to Video",
      description: "Turning your static character into short video content while keeping it recognizably the same character  covering what actually causes \"drift\" between generations and how to avoid it."
    },
    {
      title: "Brand Voice & Content Calendar",
      description: "Defining a personality and posting rhythm  the part that separates a \"generated image\" from an actual creator brand."
    },
    {
      title: "Pitching to Brands",
      description: "How virtual creators and their teams actually approach brand partnerships deck structure, what brands look for, and realistic expectations (not every character lands a deal, and that's normal)."
    },
    {
      title: "Platform Policy & AI Disclosure",
      description: "What platforms currently require for labeling AI-generated content, and why transparency protects you long-term as policy in this space keeps evolving."
    }
  ];

  // Dynamic detailed curriculum mapping descriptions for other tracks
  const curriculumDescriptions: Record<string, string> = {
    // Viral Content & Short-Form UGC
    "Psychology of the 3-Second Hook & Retention Curve": 
      "Understand user attention metrics and algorithmic thresholds. Learn to design high-retention visual hooks and structural pacing that stops users from scrolling past your video.",
    "CapCut Pro & Premiere Viral Pacing Workflows": 
      "Master the high-speed editing techniques used by top-tier creators. Covers automatic caption presets, keyframe zoom transitions, b-roll layouts, sound effect layering, and direct export setups.",
    "Landing $1,500/video UGC Contracts with Global Brands": 
      "Step-by-step negotiation and outreach strategies to pitch user-generated content (UGC) services. Learn contract terms, usage rights management, and building high-converting rate sheets.",
    "YouTube Automation & Faceless Channel Scaling": 
      "Systematize content ideation, script structures, thumbnail testing, and bulk production schedules so you can operate multiple successful channels without needing to show your face on camera.",
    "TikTok Creator Rewards Program & RPM Optimization": 
      "Master the math behind the algorithm's payout structure. Optimize your video length, engagement velocity, and niche audience targeting to maximize your revenue per thousand views (RPM).",

    // Live Streaming & Gaming
    "OBS Studio Setup, Audio Compression & Dynamic Overlays": 
      "Full hardware and software calibration from scratch. Configure pristine noise-gates, clean virtual audio cables, high-performance streaming bitrates, and custom responsive stream layouts.",
    "Speedrunning to Twitch Affiliate & Kick Creator Program": 
      "Actionable milestone strategies to hit your viewer and subscription minimums in record time. Focuses on authentic engagement, co-streaming, and platform-specific promotional hacks.",
    "Engaging Dead Chats: Viewer Retention Techniques": 
      "The psychological art of live hosting. Discover how to keep conversations flowing naturally, interact with new viewers, and foster a welcoming and sticky community space.",
    "Securing Energy Drink, Tech & VPN Sponsorship Contracts": 
      "How to reach out to brands even with a small active viewer base. Build customized media kits, set up affiliate dashboards, and negotiate upfront integration sponsorships.",
    "Merchandising & Multi-Platform VOD Repurposing": 
      "Leverage your stream broadcasts into endless content. Use automated tools to clip and format live highlights into viral vertical videos for TikTok, Shorts, and Reels.",

    // Faceless YouTube Automation
    "High-CPM Niche Selection & Competitor Intelligence": 
      "Identify high-paying advertising niches like finance, tech, and travel. Reverse-engineer top competitors to locate content gaps and maximize your potential AdSense payouts.",
    "AI Scripting Workflows for Maximum Viewer Retention": 
      "Configure advanced prompts and guidelines to generate structured, human-like video outlines and engaging narrations that optimize watch-time and trigger search algorithms.",
    "ElevenLabs Voice Generation & Human-Like Cadence": 
      "Design perfectly tuned, natural-sounding voiceovers using custom voice designs and exact cadence pacing, ensuring viewers can't differentiate your host from a real human.",
    "Thumbnail Psychology & Click-Through Rate Mastery": 
      "Analyze visual triggers, contrast choices, and text-to-image layouts. Test multiple thumbnail iterations to guarantee high click-through rates (CTR) on any video upload.",
    "Monetization Beyond AdSense: Affiliates & Digital Sponsorships": 
      "Layer your revenue channels. Integrate high-paying affiliate links, digital downloads, and native sponsor spots so you earn from day one, even before YouTube monetization is active."
  };

  const modules: ModuleItem[] = isAiInfluencer
    ? aiInfluencerModules
    : track.curriculum.map((title) => ({
        title,
        description:
          curriculumDescriptions[title] ||
          "Includes live exercises, practical creator assignments, community feedback, and certified milestone check-ins to secure your portfolio success.",
      }));

  // State to track which curriculum dropdowns are expanded
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    0: true, // open the first module by default
  });

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-in fade-in duration-300">
      {/* 1. Header Banner/Hero */}
      <div 
        className={`border-b border-black/5 py-12 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 ${
          isAiInfluencer 
            ? "bg-slate-100" 
            : track.bgColor
        }`}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              {/* Category Badge */}
              {!isAiInfluencer && (
                <div className="inline-block bg-black/5 text-slate-800 text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                  {track.category}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1] mb-4">
                {track.title}
              </h1>

              <p className="text-slate-900 text-base sm:text-xl font-bold max-w-2xl mb-4">
                {isAiInfluencer ? "Build a consistent virtual character from scratch no experience needed." : track.tagline}
              </p>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
                {isAiInfluencer 
                  ? "Start with zero design or AI experience and walk through the exact process of building a virtual creator: character identity, visual consistency across posts, a content calendar, and how to actually pitch that character to a brand."
                  : track.description
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Deliverable, Curriculum, Tools */}
          <div className={`${isAiInfluencer ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-7"} space-y-8`}>

            {/* Estimated Revenue Range Box */}
            {!isAiInfluencer && (
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
                <div className="text-xs font-bold text-[#D4F636] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4F636]" />
                  <span>Estimated Revenue Range</span>
                </div>
                <p className="text-white text-2xl sm:text-3xl font-black tracking-tight">
                  {track.earningsRange}
                </p>
              </div>
            )}

            {/* Key Modules / Curriculum Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 mb-6">
                {isAiInfluencer ? "What You'll Cover From Scratch" : "Key Modules & Curriculum"}
              </h2>

              <div className="space-y-4">
                {modules.map((item, index) => {
                  const isOpen = !!expandedModules[index];
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-150 overflow-hidden transition-all duration-300"
                    >
                      {/* Dropdown Header Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleModule(index)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-[#D4F636] text-black font-extrabold text-sm flex items-center justify-center shrink-0">
                            0{index + 1}
                          </div>
                          <span className="font-extrabold text-slate-950 text-sm sm:text-base">
                            {item.title}
                          </span>
                        </div>
                        <div className="shrink-0 text-slate-500">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Dropdown Expandable Content */}
                      {isOpen && (
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 bg-slate-50/50 border-t border-slate-100">
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Creator Tech Stack */}
            <div className={`rounded-3xl p-6 sm:p-10 shadow-xs ${
              isAiInfluencer 
                ? "bg-black text-white border border-white/10" 
                : "bg-white text-slate-900 border border-slate-200/60"
            }`}>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight mb-3 flex items-center gap-2 ${
                isAiInfluencer ? "text-white" : "text-slate-950"
              }`}>
                {!isAiInfluencer && <Wrench className="w-5 h-5 text-slate-800" />}
                <span>{isAiInfluencer ? "Creator Tech Stack (2026)" : "Creator Tech Stack"}</span>
              </h2>
              <p className={`text-xs sm:text-sm mb-6 ${
                isAiInfluencer ? "text-slate-400" : "text-slate-600"
              }`}>
                Master the exact industry tools and production environments used across this programme.
              </p>

              {isAiInfluencer ? (
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Higgsfield AI Influencer Studio",
                    "Midjourney",
                    "Kling AI",
                    "HeyGen Avatar IV",
                    "Canva",
                    "ComfyUI",
                    "Others"
                  ].map((tool, idx) => (
                    <span
                      key={idx}
                      className="bg-neutral-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl border border-neutral-800 flex items-center gap-2 hover:border-neutral-700 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#D4F636] shrink-0"></span>
                      <span>{tool}</span>
                    </span>
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Content based on Program */}
          {!isAiInfluencer && (
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
          )}
        </div>
      </div>

      {/* 3. Worth Watching Plain Section (below the main grid) */}
      {isAiInfluencer && (
        <div className="w-full bg-[#000000] text-white py-16 sm:py-20 mt-16 border-t border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6 leading-[1.2]">
              Here's a good overview of some of the AI and Virtual Influencers already making an impact.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-10 max-w-3xl mx-auto font-normal">
              Virtual influencers are a genuinely fast-growing part of the creator economy  brands increasingly work with fully AI-generated personas (Lil Miquela with Prada and BMW-style collaborations, Aitana Lopez's brand deals in Spain, Lu do Magalu's work with Samsung and Intel). The skill gap for beginners is mostly about consistency and brand-thinking, not access to tools.
            </p>
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black relative max-w-3xl mx-auto">
              <iframe
                className="absolute w-full h-[122%] -top-[11%] left-0"
                src="https://www.youtube.com/embed/mleTrrUBc60?si=bRrkzgEqi3_S8PRR&modestbranding=1&showinfo=0&rel=0&cc_load_policy=0"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Join For Free Button Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-20 mb-12 flex flex-col items-center justify-center text-center">
        <button
          onClick={() => {
            if (onEnrollSuccess) {
              onEnrollSuccess(track.title);
            }
          }}
          className="px-10 py-5 bg-[#D4F636] hover:bg-[#c2e42b] text-slate-950 font-black text-lg sm:text-xl rounded-full shadow-lg hover:shadow-[#D4F636]/20 transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wide cursor-pointer"
        >
          Join for free
        </button>
      </div>
    </main>
  );
};
