import React from "react";

interface TelecastHeaderProps {
  onExploreClick?: () => void;
}

export const TelecastHeader: React.FC<TelecastHeaderProps> = ({ onExploreClick }) => {
  const tickerPhrases = [
    "Make Extra Income: Discover the highest-paying online side hustles proven for 2026",
    "Trending Now: AI Influencers on Fanvue, Twitch live streaming and TikTok UGC brand deals",
    "Start Today: Turn 2 hours of spare evening time into real digital income",
    "Zero Prior Capital Needed: Step-by-step roadmaps designed for busy students and beginners"
  ];

  return (
    <aside
      aria-label="Announcement Ticker"
      className="bg-[#D4F636] text-black border-b border-black/10 text-xs sm:text-sm overflow-hidden relative z-50 flex items-center h-9 sm:h-10 shadow-xs"
    >
      {/* Ticker Tape Scroller - Full width, clean flowing text without buttons */}
      <div
        className="w-full overflow-hidden relative cursor-pointer group h-full flex items-center"
        onClick={onExploreClick}
        title="Click to explore hustle programmes"
      >
        {/* Subtle gradient fades at the edges */}
        <div className="absolute left-0 inset-y-0 w-10 bg-gradient-to-r from-[#D4F636] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-[#D4F636] to-transparent z-10 pointer-events-none" />

        <div className="animate-telecast flex items-center py-1">
          {/* Stream 1 */}
          {tickerPhrases.map((phrase, idx) => (
            <div key={`phrase-1-${idx}`} className="inline-flex items-center mx-6 sm:mx-10 whitespace-nowrap">
              <span className="font-bold text-black text-xs sm:text-sm tracking-tight">
                {phrase}
              </span>
              <span className="ml-6 sm:ml-10 text-black/50 font-bold select-none">✦</span>
            </div>
          ))}

          {/* Stream 2 (duplicate for continuous loop) */}
          {tickerPhrases.map((phrase, idx) => (
            <div key={`phrase-2-${idx}`} className="inline-flex items-center mx-6 sm:mx-10 whitespace-nowrap">
              <span className="font-bold text-black text-xs sm:text-sm tracking-tight">
                {phrase}
              </span>
              <span className="ml-6 sm:ml-10 text-black/50 font-bold select-none">✦</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
