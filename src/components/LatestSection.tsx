import React from "react";
import { ArrowUpRight } from "lucide-react";
import { BLOG_ARTICLES, BlogArticle } from "../data/contentData";

interface LatestSectionProps {
  onSelectArticle: (article: BlogArticle) => void;
  onVisitBlog: () => void;
}

export const LatestSection: React.FC<LatestSectionProps> = ({ onSelectArticle, onVisitBlog }) => {
  return (
    <section
      id="the-latest"
      className="bg-[#F7F7F5] pt-20 sm:pt-28 pb-24 sm:pb-32 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
              The Latest
            </h2>
          </div>

          <button
            type="button"
            onClick={onVisitBlog}
            className="text-slate-950 font-bold text-sm sm:text-base hover:underline flex items-center gap-1.5 group cursor-pointer shrink-0"
          >
            <span>View All Articles &amp; Guides</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* 3 Column Blog/Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {BLOG_ARTICLES.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between border border-slate-200/70"
            >
              <div>
                {/* Card Top Image */}
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7">
                  {/* Title */}
                  <h3 className="text-slate-950 font-extrabold text-lg sm:text-xl leading-snug group-hover:text-black transition-colors line-clamp-3 mb-3">
                    {article.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
