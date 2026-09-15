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
    // Content Clipping
    "Understanding the Clipping Ecosystem": 
      "What content clipping actually is, how legitimate clipping campaigns work (source creators explicitly authorize clippers through marketplaces), and why understanding this matters before you cut a single clip.",
    "Content Rights & What You're Allowed to Clip": 
      "The line between authorized clipping (joining a creator's campaign, using platform-sanctioned source material) and copyright infringement (re-uploading someone's content without permission). This module exists because it's the single most common mistake beginners make, and it can get channels penalized or removed.",
    "Finding the Moment: What Makes a Clip Worth Cutting": 
      "How to scan long-form content (podcasts, interviews, streams) for the segments most likely to hold attention  the same skill AI tools attempt to automate, understood well enough that you can judge whether the AI got it right.",
    "AI-Assisted Clipping Workflow": 
      "Hands-on with an AI clipping tool (starting with a free tier)  from raw long-form video to a batch of captioned, reframed vertical clips in minutes instead of hours.",
    "Manual Editing Fundamentals (CapCut)": 
      "Learning the underlying cuts, pacing, and caption placement manually first, so you understand what the AI tools are actually doing and can fix it when they get a clip wrong.",
    "Platform-Specific Formatting": 
      "Adjusting the same clip for TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels  each has different aspect ratios, caption conventions, and audience expectations.",
    "Building a Clip Portfolio & Sample Reel": 
      "Packaging your best clips into a portfolio, and preparing a sample clip as your \"pitch\"  the standard way clippers demonstrate quality before joining a campaign or working with a creator directly.",
    "Understanding Campaigns & Realistic Expectations": 
      "How clipping marketplaces and campaigns are structured (performance-based pay per view, typically low single-digit rates per thousand views, varying by platform and niche), how to evaluate whether a specific campaign or brief is worth your time, and why this is realistically a supplementary skill/income stream at first not a guaranteed outcome.",

    // Live Streaming & Gaming
    "Choosing Your Platform": 
      "An honest comparison of Twitch, Kick, and YouTube Live: audience size and discovery, revenue splits, content rules, and which fits different goals (gaming, variety, community-first). Choosing deliberately here saves months of second-guessing later.",
    "Platform Setup From Zero": 
      "Full calibration: scenes, audio (including a noise gate and clean mic levels), resolution, and bitrate, prioritizing a stable, watchable stream over an over-produced one. On Twitch, choose between Twitch Studio (official, simpler) or OBS (more control). On Kick, there's no dedicated desktop app: streamers use OBS or Streamlabs. A steady 720p stream beats a laggy 1080p one, especially at the start.",
    "Platform Requirements & Compliance": 
      "What Twitch Affiliate, Kick's Creator Program, and YouTube's thresholds actually require: realistic, verifiable requirements (follower counts, broadcast hours, concurrent viewers), not shortcuts. Also covers protecting your channel from avoidable strikes, including background-music copyright flags, one of the most common ways new streamers get penalized without realizing it. Platform requirements and rules change, so this module also covers where to check current terms yourself.",
    "Genuine Viewer Engagement (Including at Zero Viewers)": 
      "Real techniques: acknowledging every new chatter by name, asking open low-effort questions, running simple chat commands/polls, and treating an empty chat as practice, not failure. Explicitly excluded: buying viewbots, fake chatters, or engagement services. These violate platform terms of service, can get a channel suspended, and don't build a real audience anyway.",
    "Discord & Community Infrastructure": 
      "Setting up a community space that keeps people talking to you, and each other, when your stream is offline. This is what turns viewers into a returning audience instead of one-time visitors.",
    "Clipping Your Own Content for Discovery": 
      "Turning your VODs into short clips for TikTok, Reels, and Shorts, currently one of the most effective ways new streamers actually get found, since Twitch/Kick have limited built-in discovery for small channels.",
    "Multi-Platform Repurposing": 
      "Turning one stream into a week of content: Discord recaps, clip compilations, and cross-posted highlights, using a scheduling tool to publish across platforms without manually logging into each one, so your effort compounds instead of disappearing after one broadcast.",
    "Building a Media Kit & Approaching Sponsors": 
      "A clean one-page media kit built around your niche and clip engagement, not raw follower count. Covers landing your first brand relationship through no-minimum affiliate programs (real examples: NordVPN, GFuel, Elgato, Secretlab all run programs with no or very low follower requirements), then building toward paid placements as your channel grows.",
    "FTC Compliance & Disclosure": 
      "Knowing exactly when and how to disclose sponsored or affiliate content (e.g. #ad, stream title tags) to stay compliant as your brand relationships grow.",
    "Optional Path: Clipping for Other Creators": 
      "If your own channel is growing slowly, the same clipping and editing skills from this programme (and from the separate Content Clipping programme) can be offered as a service to busier creators and podcasters who need short-form distribution but don't have time to do it themselves. Covers finding prospects and a simple outreach approach.",

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
        className={`border-b border-black/5 py-12 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-16 relative overflow-hidden ${
          track.id === "content-creation"
            ? ""
            : track.bgColor
        }`}
        style={track.id === "content-creation" ? {
          backgroundImage: 'url("https://i.pinimg.com/originals/31/d7/5a/31d75a6a1c386d188f696275aa585ac3.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {/* Soft high-contrast overlay for Content Clipping background image */}
        {track.id === "content-creation" && (
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-[#0c0a09]/85 via-[#0c0a09]/45 to-[#0c0a09]/15 backdrop-blur-[1px] z-0" />
        )}

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl text-center lg:text-left flex flex-col items-center lg:items-start w-full">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4 ${
                track.id === "content-creation" ? "text-white" : "text-slate-950"
              }`}>
                {track.title}
              </h1>

              <p className={`text-base sm:text-xl font-bold max-w-2xl mb-4 mx-auto lg:mx-0 ${
                track.id === "content-creation" ? "text-slate-200" : "text-slate-900"
              }`}>
                {isAiInfluencer ? "Build a consistent virtual character from scratch no experience needed." : track.tagline}
              </p>

              <p className={`text-sm sm:text-base leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0 ${
                track.id === "content-creation" ? "text-slate-300" : "text-slate-700"
              }`}>
                {isAiInfluencer 
                  ? "Start with zero design or AI experience and walk through the exact process of building a virtual creator: character identity, visual consistency across posts, a content calendar, and how to actually pitch that character to a brand."
                  : track.description
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Worth Watching Plain Section (above the main grid) */}
      {(isAiInfluencer || track.id === "content-creation" || track.id === "live-streaming") && (
        <div className="w-full bg-[#000000] text-white py-12 sm:py-20 border-b border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-16 text-center">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 sm:mb-6 leading-tight sm:leading-[1.2]">
              {isAiInfluencer && "Here's a good overview of some of the AI and Virtual Influencers already making an impact."}
              {track.id === "content-creation" && "Could clipping become your next digital skill?"}
              {track.id === "live-streaming" && "Could live streaming become your next career?"}
            </h2>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed mb-8 sm:mb-10 max-w-3xl mx-auto font-normal whitespace-pre-line">
              {isAiInfluencer && "Virtual influencers are a genuinely fast-growing part of the creator economy  brands increasingly work with fully AI-generated personas (Lil Miquela with Prada and BMW-style collaborations, Aitana Lopez's brand deals in Spain, Lu do Magalu's work with Samsung and Intel)."}
              {track.id === "content-creation" && "This video breaks down how content clipping turns long-form videos, podcasts, and livestreams into short-form content for platforms like TikTok, Instagram, YouTube, and Facebook."}
              {track.id === "live-streaming" && "This video gives you a simple introduction to live streaming what it is, how it works, where people stream, and how streaming can potentially become a career. It’s a good starting point if you’re curious about the world of streaming and want to understand what’s possible before getting started."}
            </p>
            <div className="aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black relative max-w-3xl mx-auto">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={
                  isAiInfluencer
                    ? "https://www.youtube.com/embed/mleTrrUBc60?si=bRrkzgEqi3_S8PRR&modestbranding=1&showinfo=0&rel=0"
                    : track.id === "content-creation"
                    ? "https://www.youtube.com/embed/6f3o6rGX7BA?si=xTfV0Zad-OuZJJtO&start=110"
                    : "https://www.youtube.com/embed/FKo_nk74zSE?si=gyhV0hhiiZdP3vdK"
                }
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

      {/* 3. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-16">
        <div className="max-w-4xl mx-auto w-full space-y-8">

          {/* Key Modules / Curriculum Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 mb-6">
              What You'll Cover, From Scratch
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
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 mb-6">
              <span>Creator Tech Stack (2026)</span>
            </h2>

            <div className="flex flex-wrap gap-2.5">
              {track.keyTools.map((tool, idx) => (
                <span
                  key={idx}
                  className="bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 hover:border-slate-300 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D4F636] shrink-0 shadow-sm"></span>
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

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
