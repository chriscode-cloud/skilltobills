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
            <div className="rounded-3xl overflow-hidden bg-slate-100 shadow-md w-full">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-auto block"
              />
            </div>

            {/* Body Text */}
            <div className="prose prose-slate max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-6 pt-4">
              <p className="font-semibold text-slate-950 text-lg sm:text-xl leading-relaxed">
                {selectedArticle.summary}
              </p>

              {selectedArticle.id === "twitch-affiliate-blueprint" ? (
                <>
                  <p>
                    According to recent 2026 data, Africa’s creator economy is booming at an estimated valuation of $5.1 billion, with economic projections pointing to an explosive surge toward $30 billion by 2032.{" "}
                    <a href="https://www.facebook.com/NewsCentralAfrica/videos/the-creator-economy-is-growing-rapidly-with-the-global-industry-valued-at-205-25/1767479030953381/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[1]</a>,{" "}
                    <a href="https://thebftonline.com/article/inside-africas-us5bn-creator-economy-boom" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[2]</a>.
                  </p>

                  <p>
                    Yet, there is a massive underlying problem: the digital skills gap.{" "}
                    <a href="https://www.emerald.com/et/article/68/6/885/1370091/Digital-skills-for-youth-employment-in-Africa-a" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[1]</a>.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Broken Pipeline of Traditional Education
                  </h3>
                  <p>
                    Every single month, nearly one million young Africans enter the job market, yet formal employment opportunities remain incredibly scarce. A joint comprehensive regional study by the World Bank and the Mastercard Foundation revealed a stark reality: African employers are facing an intense digital skills shortage, with nearly 65% of all open job vacancies requiring intermediate to advanced digital skills.{" "}
                    <a href="https://mastercardfdn.org/en/articles/digital-skills-for-africa-preparing-young-people-for-the-future-of-work/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[1]</a>,{" "}
                    <a href="https://www.worldbank.org/en/news/feature/2025/10/20/skills-education-training-job-youth-employment-opportunities-millions-young-people-africa" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[2]</a>,{" "}
                    <a href="https://mastercardfdn.org/en/articles/accelerating-digital-literacy-to-benefit-education-systems-in-africa/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[3]</a>.
                  </p>

                  <p>
                    The crisis lies within our formal learning institutions. Research reveals that while Africa’s youth population represents the youngest, most energetic future workforce on the planet, only 10% to 11% of tertiary education graduates receive any formal digital training. Worse, most standard public programs stop at basic computer literacy (like typing or browsing), which are skills that are completely insufficient for the modern digital landscape.{" "}
                    <a href="https://mastercardfdn.org/en/what-we-do/focus-areas/digital/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[1]</a>,{" "}
                    <a href="https://www.facebook.com/MastercardFoundation/posts/across-africa-more-young-people-are-gaining-digital-skills-than-ever-before-but-/1473522258140439/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[2]</a>,{" "}
                    <a href="https://mohacafrica.org/strategies-to-build-digital-skills-among-african-youth-at-scale/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[3]</a>.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Trap of Unstructured "Self-Teaching"
                  </h3>
                  <p>
                    Because the classroom fails to provide hands-on vocational competency, millions of youth turn to the internet to self-teach emerging trends like content clipping, algorithmic social management, and virtual influencer building.
                  </p>

                  <p>
                    But searching the open web leads straight into a messy jungle of information overload. Students spend weeks sorting through conflicting, unverified YouTube videos or face steep paywalls from chaotic online communities before they can learn a single monetizable framework.
                  </p>

                  <p>
                    This educational friction is exactly why six out of ten active African content creators still earn less than $100 a month. They understand the trend, but they completely lack the advanced workflows, automation knowledge, and technical team frameworks required to scale their effort into a real business.{" "}
                    <a href="https://techpoint.africa/news/africa-creator-economy-report-2026/" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[1]</a>.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    How skill2bill Bridges the Gap
                  </h3>
                  <p>
                    Advanced digital capabilities, such as strategic video engineering, automated multi-platform distribution systems, and client acquisition funnels, boost a young person’s self-employment outcomes by up to 30%.{" "}
                    <a href="https://www.emerald.com/et/article/68/6/885/1370091/Digital-skills-for-youth-employment-in-Africa-a" target="_blank" rel="noopener noreferrer" className="text-[#84cc16] hover:text-[#a3e635] underline font-black">[1]</a>.
                  </p>

                  <p>
                    <strong>skill2bill</strong> was built to act as the missing link. We do the dirty work of scraping, filtering, and organizing the internet's unstructured chaos into clean, linear learning pathways. By pairing highly curated, fluff free video modules with real interactive quizzes and practical execution exercises, we provide the structured technical training that standard schools omit and YouTube playlists scatter.
                  </p>

                  <blockquote className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 font-semibold italic border-l-4 border-[#D4F636]">
                    "The continent doesn't just need more creators; it needs 'Creative CEOs' who know how to build digital systems."
                  </blockquote>

                  <p>
                    Whether you want to launch a modern streaming content engine or run an omnichannel content clipping agency from your bedroom, our free roadmaps ensure your technical effort directly translates into paying bills.
                  </p>
                </>
              ) : selectedArticle.id === "anatomy-of-ai-influencer" ? (
                <>
                  <p>
                    For decades, the corporate marketing playbook looked exactly the same. If a company wanted to grow its brand, it hired a traditional advertising agency. These firms charged thousands of dollars a month, brought in heavy camera crews, and spent weeks producing a single, heavily polished 2 minute corporate video.
                  </p>

                  <p>
                    But in the current digital landscape, that old model is completely broken. Traditional, over produced corporate videos are being heavily ignored by modern audiences. Instead, attention has shifted entirely to high retention, fast paced, vertical short form clips like TikToks, Reels, and YouTube Shorts.
                  </p>

                  <p>
                    Because traditional agencies are too slow to keep up with daily algorithmic trends, a massive new career path has emerged for solo builders: The Omnichannel Content Clipping Agency.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Squeeze: Why Brands Are Desperate for Clippers
                  </h3>
                  <p>
                    Every major CEO, podcaster, and business founder knows they need to be posting 3 to 5 short form videos every single day to stay relevant. They have hundreds of hours of raw long form footage sitting in Zoom recordings, interviews, and past live streams.
                  </p>

                  <p>
                    Their problem is not a lack of content; instead it is a lack of time and technical workflow. A busy business owner does not have the hours to sit down, sift through a 2 hour podcast, isolate the viral hooks, crop the video into a 9:16 vertical format, add dynamic captions, and manually upload it across four different social networks.
                  </p>

                  <p>
                    This exact friction point is why businesses are willingly paying $1,500 to $3,000 a month to independent digital clippers who can manage this entire pipeline for them.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Solo Advantage: AI Tools and Automation Loops
                  </h3>
                  <p>
                    How can a single person running a laptop from their bedroom replace a whole marketing team? The answer is software leverage. By utilizing advanced digital workflows, a solo clipping agent can achieve massive output with minimal effort:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 text-slate-800">
                    <li>
                      <strong>The Extraction:</strong> They use smart slicing frameworks to scan long form videos and instantly identify high retention segments.
                    </li>
                    <li>
                      <strong>The Formatting:</strong> They deploy rapid editing templates, using tools like CapCut, to add high contrast, automated dynamic subtitles and visual sound effects that grab attention in the first 0.8 seconds.
                    </li>
                    <li>
                      <strong>The Distribution:</strong> Instead of logging into multiple apps, they use centralized scheduling networks like Postopia to automate and push content across 10 or more accounts simultaneously while they sleep.
                    </li>
                  </ul>

                  <p>
                    With this setup, a single founder can manage 3 to 5 corporate clients at the same time, turning standard video editing into a highly profitable, recurring retainer business.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Borderless Income Opportunity
                  </h3>
                  <p>
                    The most powerful aspect of the clipping business model is that it is entirely location independent. A client in New York or London does not care where their video editor is physically sitting. They only care about two metrics: retention rate and upload consistency.
                  </p>

                  <p>
                    If you know how to make a clip pull views on TikTok, your skill is universally valuable across the global economy.
                  </p>

                  <blockquote className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 font-semibold italic border-l-4 border-[#D4F636]">
                    "If you know how to make a clip pull views on TikTok, your skill is universally valuable across the global economy."
                  </blockquote>

                  <p>
                    This is exactly why skill2bill refuses to teach outdated, theoretical IT concepts. The internet moves too fast for traditional textbook curriculums. By mapping out the exact, end to end technical steps required to build a modern clipping engine, we give you the practical blueprint to step out of the job hunting queue and build your own digital agency from scratch.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Step aside from traditional social media models. A massive shift is happening on platforms like Instagram and TikTok, and some of the fastest growing creators online are not even human. They are AI Influencers, hyper realistic digital personas built completely from scratch using artificial intelligence.
                  </p>

                  <p>
                    Virtual models like Lil Miquela, with millions of followers, have paved the way, securing high paying sponsorship deals with real world fashion global brands like Prada and Calvin Klein.
                  </p>

                  <p>
                    But this is not just a game for massive tech corporations anymore. Thanks to affordable, modern software leverage, solo founders are now building their own virtual creators right from their bedrooms.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    What Exactly is an AI Influencer?
                  </h3>
                  <p>
                    An AI influencer is a fully branded digital character with a consistent face, a unique personality, and a specific lifestyle theme, such as fitness, street fashion, or travel.
                  </p>

                  <p>
                    Instead of hiring expensive models, photographers, and renting studios, the creator behind the scenes uses advanced tools to generate high quality visual content. By crafting viral video clips around these characters, creators can scale a massive, deeply engaged audience without ever showing their own face on camera.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Business Model: How Virtual Personas Pay Bills
                  </h3>
                  <p>
                    Why are brands pouring money into virtual models instead of real human influencers? It comes down to control, reliability, and cost:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 text-slate-800">
                    <li>
                      <strong>Zero Drama:</strong> Real influencers can get involved in real world controversies that ruin a brand's reputation overnight. AI influencers are completely brand safe.
                    </li>
                    <li>
                      <strong>Total Customization:</strong> A virtual model can be styled instantly to fit any product launch, background aesthetic, or international target market without the cost of travel or camera gear.
                    </li>
                    <li>
                      <strong>Borderless Scaling:</strong> An AI influencer can speak multiple languages seamlessly, allowing a solo creator to push content across different regional audiences simultaneously.
                    </li>
                  </ul>

                  <p>
                    Because of this, creators monetize these assets through direct brand sponsorships, automated affiliate marketing networks, and digital merchandise loops.
                  </p>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    The Technical Stack: How to Build One Alone
                  </h3>
                  <p>
                    Building a virtual model does not require a university degree in computer science. It requires mastering a specific, connected software pipeline:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 text-slate-800">
                    <li>
                      <strong>Face Consistency:</strong> Using image generation engines alongside advanced face swapping techniques to ensure the digital character looks identical across every photo and video.
                    </li>
                    <li>
                      <strong>Voice and Motion:</strong> Using text to speech tools and video animation filters to give the virtual persona a distinct voice and realistic human movements.
                    </li>
                    <li>
                      <strong>Algorithmic Syndication:</strong> Packing these clips into high yield social formats and using centralized automated tools like Postopia to schedule daily uploads across global networks while the creator focuses on the next big concept.
                    </li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight pt-4">
                    Why skill2bill Teaches This Track
                  </h3>
                  <p>
                    The traditional job market tells youth to wait for opportunities. The modern internet demands that you build them yourself.
                  </p>

                  <p>
                    Learning how to engineer AI creators is not just about making funny videos; it teaches you the fundamentals of digital branding, visual design, and audience retention infrastructure.
                  </p>

                  <blockquote className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 font-semibold italic border-l-4 border-[#D4F636]">
                    "Learning how to engineer AI creators teaches you the fundamentals of digital branding, visual design, and audience retention infrastructure."
                  </blockquote>

                  <p>
                    At skill2bill, we do the heavy lifting of sorting through the unstructured internet confusion. We map out the exact step by step tools, prompt frameworks, and distribution steps needed to take you from a complete novice to an advanced digital architect. The future of media is digital, and you can build it from scratch.
                  </p>
                </>
              )}
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
