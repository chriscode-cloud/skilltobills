import React from "react";
import { ArrowUpRight } from "lucide-react";
import { COURSE_TRACKS, CourseTrack } from "../data/contentData";

interface PathwaysSectionProps {
  onSelectTrack: (track: CourseTrack) => void;
}

export const PathwaysSection: React.FC<PathwaysSectionProps> = ({ onSelectTrack }) => {
  return (
    <section
      id="pathways"
      className="bg-[#000000] text-white py-20 sm:py-28 px-4 sm:px-8 lg:px-16 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-14 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
            Explore Hustle Programmes
          </h2>
          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-normal">
            The income growth you want, without putting your life on hold.
          </p>
        </div>

        {/* 3 Column Floating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {COURSE_TRACKS.map((track, index) => (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track)}
              style={{ animationDelay: `${index * 0.75}s` }}
              className={`${track.bgColor} animate-float-card rounded-3xl p-7 sm:p-9 text-slate-950 flex flex-col justify-between min-h-[420px] relative overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] cursor-pointer group hover:[animation-play-state:paused]`}
            >
              {/* Top Row: Arched organic image cutout at top-right (small button removed) */}
              <div className="flex justify-end items-start mb-6">
                <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-white/60 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Middle content: Title and Description (No est earnings, no weeks, no self-paced) */}
              <div className="flex-1 flex flex-col justify-center my-auto">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mb-3 group-hover:text-black transition-colors">
                  {track.title}
                </h3>
                <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-normal">
                  {track.description}
                </p>
              </div>

              {/* Bottom Action: Arrow button that reveals inner text 'View Track' on hover */}
              <div className="flex items-center justify-end pt-6 border-t border-black/10 mt-6">
                <div
                  className="group/btn inline-flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-full bg-black text-white shadow-md group-hover:bg-[#000000] group-hover:text-white group-hover/btn:bg-[#000000] transition-all duration-300 ease-out"
                  title="View Track"
                >
                  {/* Inner text revealed smoothly when mouse is placed on it */}
                  <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover/btn:max-w-xs group-hover/btn:opacity-100 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out select-none">
                    View Track
                  </span>

                  {/* Arrow circle */}
                  <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#D4F636] group-hover:text-black group-hover/btn:bg-[#D4F636] group-hover/btn:text-black flex items-center justify-center transition-all duration-300 transform group-hover:rotate-45 group-hover/btn:rotate-45 shrink-0">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
