import React from "react";
import HowItWorks, { Step, StepPosition } from "@/components/ui/how-it-works";
import { COURSE_TRACKS, CourseTrack } from "../data/contentData";

interface PathwaysSectionProps {
  onSelectTrack: (track: CourseTrack) => void;
}

export const PathwaysSection: React.FC<PathwaysSectionProps> = ({ onSelectTrack }) => {
  const programmeSteps: Step[] = [
    {
      title: COURSE_TRACKS[0].title,
      description: COURSE_TRACKS[0].description,
      colorTheme: "lime",
      image: COURSE_TRACKS[0].image,
      ctaText: "View Track",
      onClick: () => onSelectTrack(COURSE_TRACKS[0]),
    },
    {
      title: COURSE_TRACKS[1].title,
      description: COURSE_TRACKS[1].description,
      colorTheme: "lilac",
      image: COURSE_TRACKS[1].image,
      ctaText: "View Track",
      onClick: () => onSelectTrack(COURSE_TRACKS[1]),
    },
    {
      title: COURSE_TRACKS[2].title,
      description: COURSE_TRACKS[2].description,
      colorTheme: "peach",
      image: COURSE_TRACKS[2].image,
      ctaText: "View Track",
      onClick: () => onSelectTrack(COURSE_TRACKS[2]),
    },
  ];

  const stepPositions: StepPosition[] = [
    { className: "md:translate-y-0", rotate: "rotate-1" },
    { className: "md:translate-y-4 lg:translate-y-5", rotate: "-rotate-1" },
    { className: "md:translate-y-0", rotate: "rotate-1" },
  ];

  return (
    <section
      id="pathways"
      className="bg-white text-slate-950 py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 mb-3">
            Explore What You Can Build
          </h2>
        </div>

        {/* How-It-Works Component Integrated for Programmes */}
        <div className="w-full">
          <HowItWorks
            className="bg-transparent"
            features={programmeSteps}
            stepPositions={stepPositions}
            showBackgroundGrid={false}
          />
        </div>
      </div>
    </section>
  );
};

