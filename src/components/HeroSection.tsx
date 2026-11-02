import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onSignUpClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSignUpClick }) => {
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
            onClick={onSignUpClick}
            className="w-full sm:w-auto bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold px-9 py-4 rounded-full text-base tracking-wide transition-all duration-200 shadow-sm border border-black/10 flex items-center justify-center gap-2.5 group cursor-pointer animate-pulse-subtle"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
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
