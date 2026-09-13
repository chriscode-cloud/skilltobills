import React from "react";
import { ArrowRight } from "lucide-react";

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
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08] mb-6">
          Online Wealth <br className="hidden sm:inline" />
          Is Already Here
        </h1>

        <p className="text-slate-700 text-base sm:text-xl lg:text-2xl font-normal leading-relaxed max-w-2xl mb-10">
          Learn what actually generates income in 2026. Explore modern AI side hustles
          and creator programmes every student and beginner should know about.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onExploreClick}
            className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-bold px-8 py-4 rounded-full text-base tracking-wide transition-all duration-300 shadow-md border border-black/10 flex items-center gap-2.5 group cursor-pointer"
          >
            <span>Explore Hustle Programmes</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
