import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Play,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Code2,
  Check,
  Download,
  ExternalLink,
  HelpCircle,
  Video,
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import { Course, Lesson } from "./types";
import { AuthUser } from "../../lib/auth";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { usePageMeta } from "../../hooks/usePageMeta";
import { findCourseBySlugOrId, getSafeEmbedUrl } from "./courseUtils";

// Single toggle for sequential progression locking (set false for open curriculum)
const ENFORCE_SEQUENTIAL_UNLOCKING = false;

interface LessonPlayerPageProps {
  currentUser?: AuthUser | null;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({ currentUser }) => {
  const { programme, lesson: lessonParam } = useParams<{ programme: string; lesson: string }>();
  const navigate = useNavigate();

  // Progress state
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("skill2bills_lms_progress_v2");
      if (saved) return JSON.parse(saved).completedLessonIds || [];
    } catch {
      // ignore
    }
    return [];
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedResource, setCopiedResource] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState(false);

  // Robust course resolution with fallback
  const course: Course = findCourseBySlugOrId(programme);

  const allLessonsWithModule = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleId: m.id }))
  );

  const activeIndex = allLessonsWithModule.findIndex((l) => l.id === lessonParam);
  const currentLesson = activeIndex !== -1 ? allLessonsWithModule[activeIndex] : allLessonsWithModule[0];
  const prevLesson = activeIndex > 0 ? allLessonsWithModule[activeIndex - 1] : null;
  const nextLesson = activeIndex + 1 < allLessonsWithModule.length ? allLessonsWithModule[activeIndex + 1] : null;

  const currentModuleObj = course.modules.find((m) => m.id === currentLesson.moduleId) || course.modules[0];
  const currentModuleLessons = currentModuleObj ? currentModuleObj.lessons : [];
  const completedInModule = currentModuleLessons.filter((l) => completedLessonIds.includes(l.id)).length;

  usePageMeta(`${currentLesson.title} | ${course.title}`);



  // Sync with Supabase if logged in
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured || !supabase) return;
    supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", currentUser.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const ids = data.map((d: any) => d.lesson_id);
          setCompletedLessonIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
      });
  }, [currentUser]);

  // Reset quiz when lesson changes
  useEffect(() => {
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setEmbedError(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentLesson.id]);

  const isCompleted = completedLessonIds.includes(currentLesson.id);

  // Toggle completion
  const handleToggleComplete = async () => {
    let nextCompleted: string[];
    if (isCompleted) {
      nextCompleted = completedLessonIds.filter((id) => id !== currentLesson.id);
    } else {
      nextCompleted = [...completedLessonIds, currentLesson.id];
    }

    setCompletedLessonIds(nextCompleted);
    localStorage.setItem(
      "skill2bills_lms_progress_v2",
      JSON.stringify({ completedLessonIds: nextCompleted, lastActiveLessonId: currentLesson.id })
    );

    if (currentUser && isSupabaseConfigured && supabase) {
      try {
        if (!isCompleted) {
          await supabase.from("user_progress").upsert({
            user_id: currentUser.id,
            lesson_id: currentLesson.id,
            completed_at: new Date().toISOString(),
          });
        } else {
          await supabase
            .from("user_progress")
            .delete()
            .match({ user_id: currentUser.id, lesson_id: currentLesson.id });
        }
      } catch {
        // offline
      }
    }
  };

  const isLessonLocked = (idx: number) => {
    if (!ENFORCE_SEQUENTIAL_UNLOCKING || idx === 0) return false;
    const previousLesson = allLessonsWithModule[idx - 1];
    return !completedLessonIds.includes(previousLesson.id);
  };

  // Safe embed URL that will never trigger relative route fallback
  const safeVideoUrl = getSafeEmbedUrl(currentLesson.videoUrl);

  // Direct video link for external viewing fallback
  const externalVideoLink = currentLesson.videoUrl.includes("http")
    ? currentLesson.videoUrl
    : `https://www.youtube.com/watch?v=${currentLesson.videoUrl}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col font-sans">
      {/* Top Bar for Lesson Player */}
      <div className="h-14 bg-[#0c0c0e] border-b border-zinc-900 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <Link
            to={`/learn/${course.slug}`}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to course</span>
          </Link>
          <span className="text-zinc-600">&gt;</span>
          <span className="text-zinc-300 hidden sm:inline">{currentLesson.moduleTitle}</span>
          <span className="text-zinc-600 hidden sm:inline">&gt;</span>
          <span className="text-[#D4F636] font-bold truncate max-w-xs">{currentLesson.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile drawer toggle */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 cursor-pointer"
            aria-label="Toggle curriculum navigation"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Stage (Video, Learn, Experiment, Practice) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-8 max-w-4xl mx-auto">
          {/* Lesson Video Stage */}
          <div className="space-y-3">
            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl relative">
              <iframe
                src={safeVideoUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {/* Lesson Title, Duration & Mark Complete Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentLesson.title}
              </h1>
              {currentLesson.duration && (
                <p className="text-xs text-zinc-400 font-mono">
                  Estimated Duration: {currentLesson.duration}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleComplete}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 ${
                isCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold shadow-[0_0_15px_rgba(212,246,54,0.15)]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
            </button>
          </div>

          {/* Lesson Notes / Core Concept Area */}
          <div className="pt-4 space-y-8">
            {currentLesson.id === "les-ai-1" ? (
              <div className="space-y-8">
                {/* Core Concept Overview Header */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Core Concept Overview
                  </h2>
                  <div className="p-5 rounded-2xl bg-zinc-950 border-l-4 border-[#D4F636] text-sm sm:text-base text-zinc-300 italic leading-relaxed">
                    This foundational lesson explores the rapid evolution of virtual creators and breaks down how modern generative models allow creators to build 24/7 scalable AI influencers. Rather than treating an AI persona as simple viral content, successful creators treat them as automated digital assets that solve specific audience problems and capture leads.
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Key Takeaways & Chapter Breakdown
                  </h3>

                  <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        1. The Technological Paradigm Shift
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                          <span className="text-xs font-bold text-white block">Model Breakthroughs</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Recent generative updates have eliminated legacy issues like robotic speech, unnatural lip-sync, and uncanny facial expressions.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                          <span className="text-xs font-bold text-white block">Scalability</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            AI influencers operate as digital extensions that can publish daily across platforms (Instagram, TikTok, YouTube Shorts) with zero physical filming.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        2. Real-World Case Studies & Personas
                      </h4>
                      <div className="space-y-2.5">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Lifestyle & Wealth Personas:</strong> High-engagement profiles (e.g., Omar Wisman, Jing Chen) leverage aspirational storytelling to sell courses, software, or digital products via bio links.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Niche Habit & Transformation Personas:</strong> Accounts focused on physical fitness or self-improvement drive multi-million view virality by tapping into dramatic transformation arcs.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Archetype Niches:</strong> Storytelling and wisdom-driven accounts (e.g., philosophical or spiritual personas) generate massive organic reach by creating emotional connections.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        3. The 3 Archetypes of AI Influencers
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <div className="space-y-0.5">
                            <p><strong className="text-white">Archetype 1: Entertainment</strong></p>
                            <p className="text-xs text-zinc-400">Focus: Memes, funny clips, viral stories</p>
                            <p className="text-xs text-zinc-400">Reach: Very High &bull; Monetization: Low</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <div className="space-y-0.5">
                            <p><strong className="text-white">Archetype 2: Aesthetic / Lifestyle</strong></p>
                            <p className="text-xs text-zinc-400">Focus: Visual models, fashion, aesthetic renders</p>
                            <p className="text-xs text-zinc-400">Reach: High &bull; Monetization: Moderate</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <div className="space-y-0.5">
                            <p><strong className="text-white">Archetype 3: Problem-Solving (Premium Pick)</strong></p>
                            <p className="text-xs text-zinc-400">Focus: Targeted advice (dating, finance, fitness, habits)</p>
                            <p className="text-xs text-zinc-400 font-bold text-[#D4F636]">Reach: Targeted/Niche &bull; Monetization: Extremely High</p>
                          </div>
                        </div>
                      </div>

                      {/* Strategic Rule Callout */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3 mt-4">
                        <p className="text-xs sm:text-sm text-zinc-300">
                          <strong className="text-white">Strategic Rule:</strong> Always build around a Problem-Solving Archetype. High-intent views that solve a specific problem are significantly more valuable than generic viral views.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why 99% Fail */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Why 99% of AI Influencers Fail
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3 text-sm">
                      <p className="text-zinc-300">
                        <strong className="text-white">Generic Quality:</strong> Relying on default prompts results in generic faces, unnatural vocal cadences, and recycled scripts that viewers scroll past immediately.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3 text-sm">
                      <p className="text-zinc-300">
                        <strong className="text-white">Lack of Direction:</strong> Posting random, disconnected topics instead of sticking to a tight niche persona destroys audience retention and platform authority.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3 text-sm">
                      <p className="text-zinc-300">
                        <strong className="text-white">Chasing Views Instead of Systems:</strong> Treating the page as "content-first" rather than a structured conversion funnel with a clear CTA results in zero revenue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentLesson.id === "les-ai-2" ? (
              <div className="space-y-8">
                {/* Core Concept Overview Header */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Core Concept Overview
                  </h2>
                  <div className="p-5 rounded-2xl bg-zinc-950 border-l-4 border-[#D4F636] text-sm sm:text-base text-zinc-300 italic leading-relaxed">
                    A photorealistic face is no longer enough to build a profitable virtual creator. Today, winning AI influencers are built around a distinct personality, a dedicated niche, and content that consistently solves a real-world problem for a specific target audience. Establishing two core anchor photos—a face close-up and a full-body shot—locks in 100% character consistency across every future post.
                  </div>
                </div>

                {/* Key Takeaways & Step-by-Step Breakdown */}
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Key Takeaways & Step-by-Step Breakdown
                  </h3>

                  <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        1. The Modern AI Influencer Paradigm Shift
                      </h4>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-sm">
                          <p className="text-zinc-300">
                            <strong className="text-red-400">The Old Formula (Obsolete):</strong> Generating an attractive face, posting random aesthetic photos, and hoping for viral attention.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#1c220a] border border-[#3b4711] text-sm">
                          <p className="text-zinc-200">
                            <strong className="text-[#D4F636]">The New Formula (High-Converting):</strong> Pairing a recognizable character identity with problem-solving content (educational or specialized niche) that gives viewers immediate value.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        2. Niche Selection & Competitor Research
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Educational & Problem-Solving Niches (Recommended):</strong> Health, fitness, wealth, finance, relationships, and self-improvement. They offer higher conversion rates and multiple monetization channels (digital products, affiliate links, consulting, brand deals).
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Entertainment Niches:</strong> Storytelling, scary stories, comedy, travel, and history. High view potential, but harder to monetize directly.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Competitor Outlier Research:</strong> Study top accounts in your target niche. Analyze their profile structure, bio call-outs, and specific "outlier" videos that generated 5x–10x their average view count to understand what holds audience attention.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        3. Base Character Design & Prompt Extraction
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Visual Inspiration (Pinterest):</strong> Search for real human archetypes fitting your concept (e.g., a Southern craftsman in his 50s, a minimalist Scandinavian fitness coach). Examine lighting, clothing texture, skin detail, and age characteristics for inspiration.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">LLM Prompt Extraction (ChatGPT / Claude):</strong> Upload your reference inspiration image to ChatGPT or Claude AI. Instruct the model to extract key facial structure, skin texture, lighting parameters, and camera lens details into a master prompt.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Generating the First Face Anchor:</strong> Input the generated master prompt into a high-fidelity image model (Midjourney, OpenArt AI, or Flux). Render a 1:1 square close-up face shot on a neutral background.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        4. Establishing 100% Character Consistency
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">The Two-Anchor System:</strong> To prevent facial drift across future generations, you only need two foundational reference images:
                            <br />
                            <span className="text-zinc-400 font-bold block mt-1">Anchor 1: High-resolution close-up face shot.</span>
                            <span className="text-zinc-400 font-bold block">Anchor 2: Full-body shot (prompts only clothing, posture, and body type while using Anchor 1 as the visual face reference).</span>
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Generating Lifestyle Variations:</strong> Use both anchor images simultaneously inside your image editor or character model studio to generate 5–10 close-up and waist-up variations of your character in different settings (smiling, working, outdoors) while preserving exact facial geometry.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        5. 4-Step Social Account Setup & Bio Optimization
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Step 1: Profile Picture:</strong> Select a clear, highly realistic close-up shot of your character's face with a slight, welcoming smile.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Step 2: Searchable Name Field:</strong> Use a realistic human handle (e.g., @julian.wellness). In the searchable Name field, put your exact offer or topic rather than repeating the name (e.g., Julian | Men's Health & Mobility).
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Step 3: Targeted Bio Hook:</strong> Write the first line of your bio to call out your exact target audience (e.g., "Helping men over 40 move better and sleep deeper").
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Step 4: DM Trigger Automation:</strong> End your bio with a compelling reason to message you (e.g., "DM me ROUTINE to get the free mobility guide"). DM conversations convert passive viewers into leads.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Transparency & Compliance:</strong> Enable the AI Creator label in your account settings. Disclosing synthetic media builds audience trust and keeps your account fully compliant with platform guidelines.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Essential Resources & Recommended Toolstack */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Essential Resources & Recommended Toolstack
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* LLM Identity & Prompt Generators */}
                    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        LLM Identity & Prompt Generators
                      </h4>
                      <div className="flex flex-col gap-2">
                        <a
                          href="https://chatgpt.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-between border border-zinc-800 transition-colors"
                        >
                          <span>ChatGPT</span>
                          <span className="text-zinc-500 text-[10px]">&rarr;</span>
                        </a>
                        <a
                          href="https://claude.ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-between border border-zinc-800 transition-colors"
                        >
                          <span>Claude AI</span>
                          <span className="text-zinc-500 text-[10px]">&rarr;</span>
                        </a>
                      </div>
                    </div>

                    {/* Image Generation & Character Reference Engines */}
                    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Image & Character Engines
                      </h4>
                      <div className="flex flex-col gap-2">
                        <a
                          href="https://openart.ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-between border border-zinc-800 transition-colors"
                        >
                          <span>OpenArt AI</span>
                          <span className="text-zinc-500 text-[10px]">&rarr;</span>
                        </a>
                        <a
                          href="https://www.midjourney.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-between border border-zinc-800 transition-colors"
                        >
                          <span>Midjourney</span>
                          <span className="text-zinc-500 text-[10px]">&rarr;</span>
                        </a>
                        <a
                          href="https://higgsfield.ai"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-between border border-zinc-800 transition-colors"
                        >
                          <span>Higgsfield AI</span>
                          <span className="text-zinc-500 text-[10px]">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Visual Research & Inspiration */}
                  <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Visual Research & Inspiration
                    </h4>
                    <a
                      href="https://www.pinterest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-800 transition-colors"
                    >
                      <span>Pinterest</span>
                      <span className="text-zinc-500 text-[10px]">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : currentLesson.id === "les-ai-3" ? (
              <div className="space-y-8">
                {/* Core Concept Overview Header */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Core Concept Overview
                  </h2>
                  <div className="p-5 rounded-2xl bg-zinc-950 border-l-4 border-[#D4F636] text-sm sm:text-base text-zinc-300 italic leading-relaxed">
                    Publishing AI content requires adherence to evolving international regulations, disclosure mandates, and intellectual property standards. Understanding watermarking rules, creator disclosures, and legal boundaries prevents account penalties, copyright disputes, and regulatory enforcement.
                  </div>
                </div>

                {/* Key Takeaways & Step-by-Step Breakdown */}
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Key Takeaways & Step-by-Step Breakdown
                  </h3>

                  <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        1. AI Content Marking & Watermarking Laws
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Mandatory AI Labelling:</strong> Regulatory bodies (including the EU AI Act) mandate that AI-generated visual, audio, and text media carry detectable markers or digital watermarks.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Provenance Standards:</strong> Platforms and creators must integrate technical metadata (C2PA/CR credentials) or visual overlays to distinguish synthetic media from authentic footage.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        2. Disclosure & Platform Compliance
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Native Toggles:</strong> Always activate platform-native AI disclosure tags (YouTube, Meta, TikTok) before publishing to stay in full algorithmic and legal compliance.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Clear Consumer Disclosures:</strong> Sponsored AI posts or synthetic brand ambassadors must feature explicit visual and textual disclosures (e.g., #AIgenerated, #ad) placed prominently.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        3. Copyright & Rights of Publicity
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">IP Restrictions:</strong> Avoid cloning real human voices, faces, or likenesses without explicit written consent.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Commercial Authorization:</strong> Ensure all training assets, prompts, and software used possess commercial distribution rights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Essential Resources */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Essential Resources & Compliance Policies
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <a
                      href="https://artificialintelligenceact.eu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">EU AI Act</span>
                      <p className="text-xs text-zinc-400">Official updates, regulations, and implementation standards.</p>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">FTC Guidelines</span>
                      <p className="text-xs text-zinc-400">Social media disclosure policies and consumer standards.</p>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://support.google.com/youtube/answer/14342130"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">YouTube AI Policy</span>
                      <p className="text-xs text-zinc-400">Rules regarding synthetic content labelling and safety guidelines.</p>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content-on-tiktok"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">TikTok AI Policy</span>
                      <p className="text-xs text-zinc-400">Community rules and synthetic content tagging details.</p>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : currentLesson.id === "les-ai-4" ? (
              <div className="space-y-8">
                {/* Core Concept Overview Header */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Core Concept Overview
                  </h2>
                  <div className="p-5 rounded-2xl bg-zinc-950 border-l-4 border-[#D4F636] text-sm sm:text-base text-zinc-300 italic leading-relaxed">
                    The core process of creating a consistent AI influencer revolves around generating a multi-angle character board to serve as a persistent reference image, paired with scene swapping and free 4K upscaling to generate unlimited photorealistic content.
                  </div>
                </div>

                {/* Key Takeaways & Step-by-Step Breakdown */}
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Step-by-Step Summary
                  </h3>

                  <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        1. Style & Prompt Extraction (Pinterest Method)
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Find a reference image on Pinterest that reflects your desired character aesthetic.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Upload the image to Claude to generate an in-depth, structured prompt for image generation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        2. Base Character & Angle Renders
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Open Google Flow and select Nano Banana 2 in image mode set to a 9:16 aspect ratio.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Generate initial close-up portraits using the Claude prompt.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Set the best render as a reference image to create multiple angles: side profile, back view, eye/facial details, and a full-body outfit shot.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        3. Character Board Assembly
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Open Canva and create a 1920x1080 canvas.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Upload all multi-angle renders, arrange them into a single-sheet character reference board, and export the file.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        4. Scene Generation & Swapping
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Text-to-Image:</strong> Upload the character board into Google Flow as a reference image and describe any scene, action, or outfit in a text prompt.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            <strong className="text-white">Pinterest Scene Swap:</strong> Upload the character board as Reference Image 1 and a lifestyle scene from Pinterest as Reference Image 2. Prompt the AI to swap the person in Reference Image 2 with your character while keeping the exact background environment.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                        5. Free 4K Upscaling
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Download the generated images from Google Flow.
                          </p>
                        </div>
                        <div className="flex gap-3 text-sm text-zinc-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                          <p>
                            Upload them to Image Upscaler (imageupscaler.com), select the 400% ratio, and process to enhance resolution to production-ready 4K.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Toolstack */}
                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    Recommended Toolstack
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <a
                      href="https://claude.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">Claude</span>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://flow.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">Google Flow</span>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://www.canva.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">Canva</span>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://www.pinterest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">Pinterest</span>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>

                    <a
                      href="https://imageupscaler.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-[#D4F636] block mb-1">Image Upscaler</span>
                      <span className="text-zinc-600 text-[10px] mt-2 block">&rarr; Visit Website</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              // Generic Lesson Notes fallback
              <div className="space-y-3">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Core Concept Overview
                </h2>
                <div className="text-sm sm:text-base leading-relaxed text-zinc-300 font-sans">
                  <p className="font-medium whitespace-pre-wrap">{currentLesson.bodyContent}</p>
                </div>
              </div>
            )}
          </div>

          {/* Knowledge Check Quiz (if defined) */}
          {currentLesson.quiz && (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4F636] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Knowledge Check</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {currentLesson.quiz.question}
              </h3>

              <div className="space-y-2">
                {currentLesson.quiz.options.map((opt, optIdx) => {
                  const isSelected = quizAnswer === optIdx;
                  let optStyle = "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-300";
                  if (quizSubmitted) {
                    if (optIdx === currentLesson.quiz?.answerIndex) {
                      optStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold";
                    } else if (isSelected) {
                      optStyle = "bg-red-500/20 border-red-500/50 text-red-300";
                    }
                  } else if (isSelected) {
                    optStyle = "bg-zinc-800 border-[#D4F636] text-white";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={quizSubmitted}
                      onClick={() => setQuizAnswer(optIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={quizAnswer === null}
                  onClick={() => setQuizSubmitted(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Submit Answer
                </button>
              ) : (
                <p className="text-xs text-zinc-400">
                  {quizAnswer === currentLesson.quiz.answerIndex ? (
                    <span className="text-emerald-400 font-bold">Correct! Well done.</span>
                  ) : (
                    <span>Take note of the correct approach for your next project.</span>
                  )}
                </p>
              )}
            </div>
          )}



          {/* Navigation Controls: Previous / Next */}
          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
            {prevLesson ? (
              <button
                type="button"
                onClick={() => navigate(`/learn/${course.slug}/${prevLesson.id}`)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous: {prevLesson.title}</span>
                <span className="sm:hidden">Previous</span>
              </button>
            ) : <div />}

            {nextLesson ? (
              <button
                type="button"
                onClick={() => navigate(`/learn/${course.slug}/${nextLesson.id}`)}
                className="px-5 py-2.5 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span className="hidden sm:inline">Next: {nextLesson.title}</span>
                <span className="sm:hidden">Next Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/learn/${course.slug}`)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Track</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Sidebar: Curriculum Outline & Phase Progress */}
        <div className="hidden lg:flex w-80 bg-[#0c0c0e] flex-col shrink-0 p-4 space-y-6 overflow-y-auto">
          {/* Phase Progress Card */}
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="text-zinc-500">PROGRAM PROGRESS</span>
              <span className="text-[#D4F636]">{Math.round((completedLessonIds.filter(id => course.modules.some(m => m.lessons.some(l => l.id === id))).length / Math.max(course.modules.reduce((acc, m) => acc + m.lessons.length, 0), 1)) * 100)}%</span>
            </div>
            <h3 className="font-extrabold text-sm text-white">
              {course.title}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              {completedLessonIds.filter(id => course.modules.some(m => m.lessons.some(l => l.id === id))).length} of {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons completed
            </p>
          </div>

          {/* Community Discord Box */}
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4 space-y-3">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-[#D4F636] uppercase tracking-wider">
                COMMUNITY
              </div>
              <p className="text-xs font-bold text-white">
                Connect with other Academy creators.
              </p>
            </div>
            <a
              href={import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(212,246,54,0.2)]"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>OPEN DISCORD</span>
            </a>
          </div>

          {/* Modules & Lessons List */}
          <div className="space-y-4 pt-2">
            {course.modules.map((mod) => (
              <div key={mod.id} className="space-y-2">
                <div className="space-y-1">
                  {mod.lessons.map((les) => {
                    const isActive = les.id === currentLesson.id;
                    const isLesCompleted = completedLessonIds.includes(les.id);

                    return (
                      <button
                        key={les.id}
                        type="button"
                        onClick={() => navigate(`/learn/${course.slug}/${les.id}`)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#1c220a] text-[#D4F636] border border-[#3b4711]"
                            : "hover:bg-zinc-900/60 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                              isLesCompleted
                                ? "bg-[#D4F636] text-black"
                                : isActive
                                ? "border-2 border-[#D4F636] text-[#D4F636]"
                                : "bg-zinc-800 text-zinc-600"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className={`text-xs truncate font-medium ${isActive ? "font-extrabold text-[#D4F636]" : "text-zinc-300"}`}>
                            {les.title}
                          </span>
                        </div>

                        {les.duration && (
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                            {les.duration}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-80 max-w-full bg-zinc-950 h-full border-l border-zinc-800 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Curriculum Lessons
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2">
              {course.modules.map((mod) => (
                <div key={mod.id} className="py-2">
                  <div className="space-y-1">
                    {mod.lessons.map((les) => {
                      const isActive = les.id === currentLesson.id;
                      const isLesCompleted = completedLessonIds.includes(les.id);

                      return (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => {
                            setMobileDrawerOpen(false);
                            navigate(`/learn/${course.slug}/${les.id}`);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[#D4F636] text-black font-extrabold"
                              : "hover:bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isLesCompleted ? (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 ${
                                  isActive ? "text-black" : "text-emerald-400"
                                }`}
                              />
                            ) : (
                              <Play
                                className={`w-3.5 h-3.5 ${
                                  isActive ? "text-black fill-current" : "text-zinc-500"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate leading-snug">{les.title}</p>
                            <span
                              className={`text-[10px] font-mono block ${
                                isActive ? "text-black/80" : "text-zinc-500"
                              }`}
                            >
                              {les.duration}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
