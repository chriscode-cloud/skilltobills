import React from "react";
import { Quote, Play, ArrowUpRight } from "lucide-react";
import { TRANSFORMATION_STORIES, TransformationStory } from "../data/contentData";

interface TransformationSectionProps {
  onPlayVideo?: (story: TransformationStory) => void;
}

export const TransformationSection: React.FC<TransformationSectionProps> = ({ onPlayVideo }) => {
  const story1 = TRANSFORMATION_STORIES[0];
  const story2 = TRANSFORMATION_STORIES[1];

  const metrics = [
    { value: "347.1K", label: "Total Active Hustlers Trained" },
    { value: "43.4K", label: "Young Creators Supported in 2026" },
    { value: "257.9K", label: "Monetized Channels & Accounts" },
    { value: "60.1K", label: "Full-Time Exits from 9-to-5s" },
  ];

  return (
    <section
      id="transformation"
      className="bg-[#F7F7F5] py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-slate-200/60"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 mb-4">
            Transformation in Action
          </h2>
          <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto font-normal">
            Real creators. Real income shifts. Proof from across our programmes.
          </p>
        </div>

        {/* 2 Spotlights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Spotlight 1: Khadija & Alex (UGC Agency Partners) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-5 leading-tight">
                &ldquo;{story1.title}&rdquo;
              </h3>

              {/* Before vs After stats bar */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/70 mb-6">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-1">
                    Before Joining
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-slate-600">
                    {story1.beforeIncome}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-600 mb-1">
                    Current Monthly Retainers
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-700">
                    {story1.currentIncome}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="w-8 h-8 text-slate-200 absolute -top-4 -left-2 -z-0" />
                <p className="relative z-10 text-slate-700 text-sm sm:text-base italic leading-relaxed pt-2">
                  &ldquo;{story1.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* Author Footer & Video Button */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={story1.image}
                  alt={story1.creatorName}
                  className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-slate-950 text-base">
                    {story1.creatorName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {story1.role}
                  </p>
                </div>
              </div>

              {onPlayVideo && (
                <button
                  type="button"
                  onClick={() => onPlayVideo(story1)}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer hover:bg-[#D4F636] hover:text-black"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Story ({story1.videoLength})</span>
                </button>
              )}
            </div>
          </div>

          {/* Spotlight 2: Ahmed E. (Fanvue / Twitch Partner) */}
          <div className="lg:col-span-5 bg-black text-white rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              {/* Text Quote */}
              <div className="relative mb-8">
                <Quote className="w-10 h-10 text-white/10 absolute -top-5 -left-2" />
                <p className="relative z-10 text-slate-200 text-lg sm:text-xl font-medium leading-relaxed pt-3">
                  &ldquo;{story2.quote}&rdquo;
                </p>
              </div>

              {/* Earnings Badge */}
              <div className="inline-block bg-white/10 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="text-xs font-semibold text-slate-400 mb-0.5">
                  Verified Monthly Recurring
                </div>
                <div className="text-2xl font-black text-[#D4F636]">
                  {story2.currentIncome}
                </div>
              </div>
            </div>

            {/* Author Profile */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={story2.image}
                  alt={story2.creatorName}
                  className="w-13 h-13 rounded-full object-cover border-2 border-white/20 shadow-xs shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-white text-base">
                    {story2.creatorName}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {story2.role}
                  </p>
                </div>
              </div>

              {onPlayVideo && (
                <button
                  type="button"
                  onClick={() => onPlayVideo(story2)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#D4F636] hover:text-black flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer"
                  title="View story"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Platform Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight mb-2">
                {m.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
