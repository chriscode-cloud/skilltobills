import React from "react";
import { Quote } from "lucide-react";
import { TRANSFORMATION_STORIES, TransformationStory } from "../data/contentData";

interface TransformationSectionProps {
  onPlayVideo?: (story: TransformationStory) => void;
}

export const TransformationSection: React.FC<TransformationSectionProps> = () => {
  const story1 = TRANSFORMATION_STORIES[0];
  const story2 = TRANSFORMATION_STORIES[1];

  const metrics = [
    { value: "12", label: "Students Trained" },
    { value: "9", label: "Young Creators Supported in 2026" },
    { value: "3", label: "Monetized Channels & Accounts" },
    { value: "11", label: "Portfolio Pieces Completed" },
  ];

  return (
    <section
      id="transformation"
      className="bg-[#D4F636] py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-black/10 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 mb-4">
            The Proof
          </h2>
          <p className="text-slate-900 text-base sm:text-xl max-w-2xl mx-auto font-medium">
            Real students. Real work. Proof from across every skill we teach.
          </p>
        </div>

        {/* 2 Spotlights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
          {/* Spotlight 1: Ahmed & Alex */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-300">
            <div>
              <div className="relative mb-6">
                <p className="relative z-10 text-slate-700 text-base sm:text-lg italic leading-relaxed pt-2">
                  &ldquo;Building a virtual creator from scratch forced me to actually think about brand identity, not just generate pretty images. I left with a character, a content calendar, and a pitch deck I built myself.&rdquo;
                </p>
              </div>
            </div>

            {/* Author Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={story1.image}
                  alt="Ahmed & Alex"
                  className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-slate-950 text-base">
                    Ahmed & Alex
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    AI & Virtual Influencers Learner
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spotlight 2: Christian Aboagye */}
          <div className="bg-black text-white rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="relative mb-6">
                <p className="relative z-10 text-slate-200 text-base sm:text-lg italic leading-relaxed pt-2">
                  &ldquo;Before this, I was just jumping from one YouTube video to another, piecing things together with no real structure and half the info missing. This platform gave me actual structured modules step by step, with feedback on my own work instead of me having to figure it all out alone.&rdquo;
                </p>
              </div>
            </div>

            {/* Author Profile */}
            <div className="flex items-center justify-between pt-4 mt-4 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={story2.image}
                  alt="Christian Aboagye"
                  className="w-13 h-13 rounded-full object-cover border-2 border-white/20 shadow-xs shrink-0"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-white text-base">
                    Christian Aboagye
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Streaming Learner
                  </p>
                </div>
              </div>
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
