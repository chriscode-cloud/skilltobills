import React from "react";

export const WorthWatchingSection: React.FC = () => {
  return (
    <section
      id="worth-watching"
      className="bg-[#000000] text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-16 border-b border-white/10 relative"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Heading & Subtext */}
        <div className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Worth Watching: What This Space Actually Looks Like
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Before you dive into a programme, here&apos;s a good overview of the kind of opportunities we teach you to actually build and prove.
          </p>
        </div>

        {/* Featured Video Embed Container */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 aspect-[16/9] bg-black max-w-4xl mx-auto">
          <iframe
            className="w-full h-full"
            src="https://www.youtube-nocookie.com/embed/q1g65sjQI-4?si=oYWOCzy1h1sdRVWX"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};
