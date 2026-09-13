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
      className="bg-[#F7F7F5] pb-24 sm:pb-32 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
              The Creator Blueprint
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
                  <div className="absolute top-4 left-4 bg-black/75 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {article.category}
                  </div>
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

              {/* Card Footer: Author info */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">{article.author.name}</div>
                  <div className="text-slate-500 text-[11px]">{article.author.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
