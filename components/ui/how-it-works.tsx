"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export type ColorTheme = "lime" | "lilac" | "peach" | "orange" | "blue" | "purple";

interface CardProps {
  key?: React.Key;
  number: string;
  title: string;
  description: string;
  colorTheme?: ColorTheme;
  className?: string;
  rotate?: string;
  image?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
    pin?: string;
  };
  onClick?: () => void;
  ctaText?: string;
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "lime",
  className,
  rotate,
  colors: customColors,
  image,
  onClick,
  ctaText = "View Track",
}: CardProps) => {
  const defaultBgColors: Record<ColorTheme, string> = {
    lime: "bg-[#D4F79E]",
    lilac: "bg-[#EADFF5]",
    peach: "bg-[#FAECE1]",
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  };
  const defaultTextColors: Record<ColorTheme, string> = {
    lime: "text-[#1c3305]",
    lilac: "text-[#2e1946]",
    peach: "text-[#3f2008]",
    orange: "text-orange-600",
    blue: "text-blue-700",
    purple: "text-purple-700",
  };
  const defaultBorderColors: Record<ColorTheme, string> = {
    lime: "border-[#bfe87e]",
    lilac: "border-[#d8c5ec]",
    peach: "border-[#ecd2be]",
    orange: "border-orange-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
  };
  const defaultPinColors: Record<ColorTheme, string> = {
    lime: "text-[#2e5209]",
    lilac: "text-[#5e2f91]",
    peach: "text-[#a04612]",
    orange: "text-orange-500",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme] || defaultBgColors.lime;
  const textColor = customColors?.text || defaultTextColors[colorTheme] || defaultTextColors.lime;
  const borderColor = customColors?.border || defaultBorderColors[colorTheme] || defaultBorderColors.lime;
  const pinColor = customColors?.pin || defaultPinColors[colorTheme] || defaultPinColors.lime;

  return (
    <div
      onClick={onClick}
      className={`group/card relative w-full max-w-[420px] lg:max-w-[440px] xl:max-w-[460px] mx-auto transition-all duration-300 hover:z-30 hover:scale-[1.03] ${
        onClick ? "cursor-pointer" : ""
      } ${rotate || ""} ${className || ""}`}
    >
      <div className="bg-white p-3.5 sm:p-4 rounded-[28px] shadow-[0_16px_36px_rgba(0,0,0,0.09),0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/90 h-full flex flex-col justify-between">
        <Pin className={`w-6 h-6 sm:w-7 sm:h-7 ${pinColor} z-20 mb-2 mx-auto drop-shadow-sm transition-transform duration-300 group-hover/card:-translate-y-0.5`} />
        <div
          className={`${bgColor} border ${borderColor} rounded-[20px] p-4.5 sm:p-5 lg:p-6 h-full flex flex-col justify-between relative overflow-hidden`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`${textColor} text-3xl sm:text-4xl font-black font-handwriting select-none`}
                style={{
                  fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                }}
              >
                {number}
              </span>
            </div>

            {image && (
              <div className="mb-3.5 sm:mb-4 w-full h-36 sm:h-44 lg:h-48 xl:h-52 rounded-xl overflow-hidden shadow-sm shrink-0 border border-black/10">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  loading="lazy"
                />
              </div>
            )}

            <h3 className="text-xl sm:text-2xl lg:text-[23px] font-extrabold text-slate-950 leading-tight mb-2 tracking-tight">
              {title}
            </h3>
            <p className="text-slate-800 text-sm sm:text-[15px] leading-relaxed line-clamp-3 sm:line-clamp-4 mb-3 font-normal">
              {description}
            </p>
          </div>

          {/* Bottom Action: Expandable "View Track" pill */}
          <div className="flex items-center justify-end pt-3 mt-1.5">
            <div
              className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-black text-white shadow-sm transition-all duration-300 ease-out group-hover/card:bg-[#000000]"
              title={ctaText}
            >
              <span className="max-w-0 opacity-0 group-hover/card:max-w-xs group-hover/card:opacity-100 overflow-hidden whitespace-nowrap text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out select-none">
                {ctaText}
              </span>

              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 group-hover/card:bg-[#D4F636] group-hover/card:text-black flex items-center justify-center transition-all duration-300 transform group-hover/card:rotate-45 shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: ColorTheme;
  image?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
    pin?: string;
  };
  onClick?: () => void;
  ctaText?: string;
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
  showBackgroundGrid?: boolean;
}

const DEFAULT_STAGGER: StepPosition[] = [
  { className: "md:translate-y-0", rotate: "rotate-1" },
  { className: "md:translate-y-4 lg:translate-y-5", rotate: "-rotate-1" },
  { className: "md:translate-y-0", rotate: "rotate-1" },
];

export default function HowItWorks({
  features,
  className,
  stepPositions,
  showBackgroundGrid = false,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Create Account",
      description: "Sign up in minutes. Enter your details and verify your email.",
      colorTheme: "lime",
    },
    {
      title: "Verify Identity",
      description: "Complete your profile verification to ensure secure transactions.",
      colorTheme: "lilac",
    },
    {
      title: "Select Plan",
      description: "Choose from a variety of investment plans tailored to your goals.",
      colorTheme: "peach",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_STAGGER;

  return (
    <LazyMotion features={domAnimation}>
      <div className={`relative px-2 sm:px-4 ${className || ""}`}>
        {showBackgroundGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
              backgroundSize: "100% 32px",
              marginTop: "4px",
            }}
          />
        )}

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Container */}
          <div className="relative w-full">
            {/* Desktop PC Fluid Connecting Mapping Lines that stretch across any Chrome window resolution */}
            {data.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none hidden md:block z-0"
                viewBox="0 0 1000 520"
                preserveAspectRatio="none"
              >
                {/* Ambient soft shadow under-stroke */}
                <path
                  d="M 167 250 C 280 130, 380 400, 500 330 C 620 260, 720 130, 833 250"
                  stroke="#0f172a"
                  strokeWidth="6"
                  strokeOpacity="0.08"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Animated high-contrast dashed mapping path */}
                <m.path
                  d="M 167 250 C 280 130, 380 400, 500 330 C 620 260, 720 130, 833 250"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{
                    strokeDashoffset: -112,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Connection Anchor Nodes at each column's mathematical center (16.66%, 50%, 83.33%) */}
                {data.length === 3 && (
                  <>
                    <circle cx="167" cy="250" r="7" fill="#D4F636" stroke="#0f172a" strokeWidth="2.5" />
                    <circle cx="500" cy="330" r="7" fill="#D4F636" stroke="#0f172a" strokeWidth="2.5" />
                    <circle cx="833" cy="250" r="7" fill="#D4F636" stroke="#0f172a" strokeWidth="2.5" />
                  </>
                )}
              </svg>
            )}

            {/* Fully Responsive CSS Grid: 1 col on mobile, 3 equal fluid columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 items-stretch relative z-10">
              {data.map((step, index) => {
                const position = positions[index % positions.length];

                return (
                  <div key={step.title} className="w-full flex justify-center">
                    <Card
                      number={`0${index + 1}`}
                      title={step.title}
                      description={step.description}
                      colorTheme={step.colorTheme || "lime"}
                      colors={step.colors}
                      rotate={position.rotate}
                      className={position.className}
                      onClick={step.onClick}
                      ctaText={step.ctaText || "View Track"}
                      image={step.image}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
