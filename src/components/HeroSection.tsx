import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  return (
    <section
      id="hero"
      className="relative bg-white text-slate-950 py-20 sm:py-28 lg:py-32 px-4 sm:px-8 lg:px-16 overflow-hidden border-b border-slate-100"
    >
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-950 leading-[1.08] mb-6 max-w-4xl">
          Learn What&apos;s Actually Happening in Content, AI, and Digital Products
        </h1>

        <p className="text-slate-700 text-lg sm:text-xl lg:text-2xl font-normal leading-relaxed max-w-3xl mb-10">
          Hands-on skills in AI content creation, digital tools, and emerging trends. Learn it, build it, use it for your own content or business.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExploreClick}
            className="w-full sm:w-auto bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold px-9 py-4 rounded-full text-base tracking-wide transition-all duration-200 shadow-sm border border-black/10 flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <span>Explore Programmes</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900" />
            <span>Zero prior capital required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900" />
            <span>Step-by-step modular blueprints</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-900" />
            <span>Built for beginners &amp; students</span>
          </div>
        </div>
      </div>
    </section>
  );
};
