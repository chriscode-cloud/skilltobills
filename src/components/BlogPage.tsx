import React, { useState, useEffect } from "react";
import { Clock, Calendar, ArrowRight, BookOpen, Share2, User } from "lucide-react";
import { BLOG_ARTICLES, BlogArticle } from "../data/contentData";

interface BlogPageProps {
  onBackToHome: () => void;
  initialSelectedArticle?: BlogArticle | null;
  onSelectArticle?: (article: BlogArticle) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBackToHome, initialSelectedArticle = null, onSelectArticle }) => {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(initialSelectedArticle);

  useEffect(() => {
    setSelectedArticle(initialSelectedArticle);
  }, [initialSelectedArticle]);

  useEffect(() => {
    // Scroll to top of window whenever the state changes
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedArticle]);

  const [copied, setCopied] = useState(false);

  // Share Article Function
  const handleShare = (article: BlogArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 animate-in fade-in duration-300">
      {selectedArticle ? (
        /* ================= 2A. SINGLE BLOG ARTICLE READER VIEW ================= */
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.1]">
              {selectedArticle.title}
            </h1>

            {/* Author Metadata Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-slate-200/80 py-5">
              <div className="flex items-center gap-3">
                <img
                  src={selectedArticle.author.avatar}
                  alt={selectedArticle.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <div className="font-extrabold text-slate-950 text-sm sm:text-base">
                    {selectedArticle.author.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {selectedArticle.author.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedArticle.readTime}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedArticle.date}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleShare(selectedArticle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors cursor-pointer"
                  title="Share Article"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-xs">{copied ? "Copied!" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 shadow-md">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Body Text */}
            <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-6 pt-4">
              <p className="font-semibold text-slate-950 text-lg sm:text-xl leading-relaxed">
                {selectedArticle.summary}
              </p>

              <p>
                In the digital frontier of 2026, the traditional rulebooks of building businesses online have been completely rewritten. What once took months of programming, software acquisitions, and complex teams can now be built by a single focused creator utilizing smart, modular platforms and AI leverage.
              </p>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                Phase 1: Setting up the High-Ticket Funnel
              </h3>
              <p>
                Most beginners make the fatal error of trying to build an audience before they know how they will monetize. When you invert the equation—establishing high-margin affiliate links, Discord subscriptions, or brand sponsorship rate cards first—every single follower has 10x the lifetime revenue yield.
              </p>

              <blockquote className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 font-semibold italic border-l-4 border-[#D4F636]">
                "Building an audience is only 20% of the game. The remaining 80% is building the economic structures that turn attention into recurring high-ticket retainers."
              </blockquote>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                Phase 2: Retention-Engineered Content
              </h3>
              <p>
                Whether it's holding a Twitch viewer's attention past the critical 4-minute mark or crafting a TikTok hook that stops the thumb in the first 0.8 seconds, pacing is your greatest leverage. We recommend cutting all dead air, utilizing dynamic subtitle punch-ins, and orchestrating raid collaborations with creators in adjacent niches.
              </p>

              <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl space-y-3">
                <div className="font-extrabold text-slate-950 text-sm sm:text-base flex items-center gap-2">
                  <span>Key Action Item for This Week:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Audit your last 5 pieces of content or stream VODs. Identify the exact second where retention drops below 60%, and replace that pattern with a narrative cliffhanger.
                </p>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                Phase 3: Automated Scaling Loops
              </h3>
              <p>
                Once you establish your primary funnel and content engine, consistency is maintained through workflow templates. Repurpose livestream VODs into 15 high-converting vertical short-form reels, automate direct-message delivery to curious commentators, and expand cross-channel reach.
              </p>
            </div>
          </div>
        </article>
      ) : (
        /* ================= 2B. ARTICLE CATALOG GRID VIEW ================= */
        <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12 animate-in fade-in duration-300">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.05]">
              The Latest
            </h1>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_ARTICLES.map((article) => (
              <article
                key={article.id}
                onClick={() => {
                  if (onSelectArticle) {
                    onSelectArticle(article);
                  } else {
                    setSelectedArticle(article);
                  }
                }}
                className="bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/80 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 sm:p-7 space-y-3">
                    <h2 className="text-slate-950 font-extrabold text-lg sm:text-xl leading-snug group-hover:underline">
                      {article.title}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}
    </div>
  );
};
