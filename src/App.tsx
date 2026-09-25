/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TelecastHeader } from "./components/TelecastHeader";
import { TopBar } from "./components/TopBar";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { WorthWatchingSection } from "./components/WorthWatchingSection";
import { PathwaysSection } from "./components/PathwaysSection";
import { TransformationSection } from "./components/TransformationSection";
import { LatestSection } from "./components/LatestSection";
import { SubscribeBanner } from "./components/SubscribeBanner";
import { Footer } from "./components/Footer";
import { VideoModal } from "./components/VideoModal";
import { ProgramPage } from "./components/ProgramPage";
import { BlogPage } from "./components/BlogPage";
import { AuthModal } from "./components/AuthModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { LmsApp } from "./components/lms/LmsApp";
import { COURSE_TRACKS, CourseTrack, TransformationStory, BlogArticle, BLOG_ARTICLES } from "./data/contentData";
import { CheckCircle2, X } from "lucide-react";

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<CourseTrack | null>(null);
  const [activeStory, setActiveStory] = useState<TransformationStory | null>(null);
  const [isBlogPageOpen, setIsBlogPageOpen] = useState(false);
  const [isLoginPageOpen, setIsLoginPageOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isLmsOpen, setIsLmsOpen] = useState(false);
  const [lmsCourseSlug, setLmsCourseSlug] = useState<string | undefined>(undefined);
  const [preselectedBlogArticle, setPreselectedBlogArticle] = useState<BlogArticle | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "community">("login");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parse hash and synchronize React state
  const parseHash = () => {
    const hash = window.location.hash;
    if (hash === "#academy" || hash === "#classroom" || hash === "#lms" || hash.startsWith("#academy/")) {
      setSelectedTrack(null);
      setIsBlogPageOpen(false);
      setIsLoginPageOpen(false);
      setIsAdminDashboardOpen(false);
      setPreselectedBlogArticle(null);
      setIsLmsOpen(true);
      if (hash.startsWith("#academy/")) {
        setLmsCourseSlug(hash.replace("#academy/", ""));
      }
      return;
    } else if (hash === "#admin" || hash === "#dashboard") {
      setSelectedTrack(null);
      setIsBlogPageOpen(false);
      setIsLoginPageOpen(false);
      setPreselectedBlogArticle(null);
      setIsAdminDashboardOpen(true);
      setIsLmsOpen(false);
      return;
    } else if (hash === "#login") {
      setSelectedTrack(null);
      setIsBlogPageOpen(false);
      setPreselectedBlogArticle(null);
      setIsAdminDashboardOpen(false);
      setIsLmsOpen(false);
      setIsLoginPageOpen(true);
      setAuthMode("login");
      return;
    } else if (hash === "#signup" || hash === "#join") {
      setSelectedTrack(null);
      setIsBlogPageOpen(false);
      setPreselectedBlogArticle(null);
      setIsAdminDashboardOpen(false);
      setIsLmsOpen(false);
      setIsLoginPageOpen(true);
      setAuthMode("community");
      return;
    } else if (hash.startsWith("#program/")) {
      const trackId = hash.replace("#program/", "");
      const found = COURSE_TRACKS.find((t) => t.id === trackId);
      if (found) {
        setSelectedTrack(found);
        setIsBlogPageOpen(false);
        setIsLoginPageOpen(false);
        setIsAdminDashboardOpen(false);
        setIsLmsOpen(false);
        setPreselectedBlogArticle(null);
        return;
      }
    } else if (hash.startsWith("#blog/")) {
      const articleId = hash.replace("#blog/", "");
      const found = BLOG_ARTICLES.find((a) => a.id === articleId);
      if (found) {
        setSelectedTrack(null);
        setIsBlogPageOpen(true);
        setIsLoginPageOpen(false);
        setIsAdminDashboardOpen(false);
        setIsLmsOpen(false);
        setPreselectedBlogArticle(found);
        return;
      }
    } else if (hash === "#blog") {
      setSelectedTrack(null);
      setIsBlogPageOpen(true);
      setIsLoginPageOpen(false);
      setIsAdminDashboardOpen(false);
      setIsLmsOpen(false);
      setPreselectedBlogArticle(null);
      return;
    }

    // Default to Home
    setSelectedTrack(null);
    setIsBlogPageOpen(false);
    setIsLoginPageOpen(false);
    setIsAdminDashboardOpen(false);
    setIsLmsOpen(false);
    setPreselectedBlogArticle(null);
  };

  // Synchronize routing state on mount and hashchange
  React.useEffect(() => {
    parseHash(); // Initial mount parse
    const handleHashChange = () => {
      parseHash();
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Scroll to top of window whenever a programme, blog or login opens
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedTrack, isBlogPageOpen, isLoginPageOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectTrackById = (id: string) => {
    window.location.hash = `#program/${id}`;
  };

  const handleScrollToPathways = () => {
    window.location.hash = "";
    setTimeout(() => {
      const el = document.getElementById("pathways");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleNavigateToHome = () => {
    window.location.hash = "";
  };

  if (isLmsOpen) {
    return (
      <div id="skill2bills-app" className="min-h-screen bg-[#070709] text-white w-full max-w-full">
        <LmsApp
          onExitToWebsite={handleNavigateToHome}
          initialCourseSlug={lmsCourseSlug}
        />
      </div>
    );
  }

  if (isAdminDashboardOpen) {
    return (
      <div id="skill2bills-app" className="min-h-screen bg-[#070708] text-white w-full max-w-full">
        <AdminDashboard onBackToWebsite={handleNavigateToHome} />
      </div>
    );
  }

  if (isLoginPageOpen) {
    return (
      <div id="skill2bills-app" className="min-h-screen bg-black text-white w-full max-w-full">
        <AuthModal
          isOpen={true}
          isStandalone={true}
          defaultMode={authMode}
          onClose={handleNavigateToHome}
        />
        {/* Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="skill2bills-app" className="min-h-screen bg-white font-sans flex flex-col text-slate-900 w-full max-w-full overflow-x-hidden">
      {/* Moving Telecast Header */}
      <TelecastHeader onExploreClick={handleScrollToPathways} />

      {/* 1. Utility Top Bar matching screenshot navigation */}
      <TopBar
        onLoginClick={() => {
          window.location.hash = "#login";
        }}
        onCommunityClick={() => {
          window.location.hash = "#join";
        }}
        onBlogClick={() => {
          window.location.hash = "#blog";
        }}
      />

      {/* 2. Main White Navigation matching screenshot layout */}
      <Navbar
        onSelectTrack={(track) => {
          window.location.hash = `#program/${track.id}`;
        }}
        onExploreClick={handleScrollToPathways}
        onHomeClick={handleNavigateToHome}
      />

      {selectedTrack ? (
        <ProgramPage
          track={selectedTrack}
          onBack={handleNavigateToHome}
          onEnrollSuccess={(trackTitle) => {
            window.location.hash = "";
            showToast(`Welcome! You're enrolled in the 7-day trial of ${trackTitle}.`);
          }}
        />
      ) : isBlogPageOpen ? (
        <BlogPage
          key={preselectedBlogArticle?.id || "catalog"}
          initialSelectedArticle={preselectedBlogArticle}
          onBackToHome={handleNavigateToHome}
          onSelectArticle={(article) => {
            window.location.hash = `#blog/${article.id}`;
          }}
        />
      ) : (
        <>
          {/* 3. Hero Section matching hero.PNG layout */}
          <HeroSection
            onSignUpClick={() => {
              window.location.hash = "#login";
            }}
          />

          {/* Worth Watching Section */}
          <WorthWatchingSection />

          {/* 4. Section 2: Explore Hustle Programmes matching section 2.PNG */}
          <PathwaysSection onSelectTrack={(track) => { window.location.hash = `#program/${track.id}`; }} />

          {/* 5. Section 3: Transformation in Action matching section 3.PNG */}
          <TransformationSection onPlayVideo={(story) => setActiveStory(story)} />

          {/* 6. Section 4: The Latest matching section 4.PNG */}
          <LatestSection
            onSelectArticle={(article) => {
              window.location.hash = `#blog/${article.id}`;
            }}
            onVisitBlog={() => {
              window.location.hash = "#blog";
            }}
          />
        </>
      )}

      {/* 7. Section 5: Floating Subscribe Banner & Dark Navy Footer matching section 5.PNG */}
      <SubscribeBanner />
      <Footer
        onSelectTrackById={handleSelectTrackById}
        onBlogClick={() => {
          window.location.hash = "#blog";
        }}
      />

      {/* Interactive Modals */}
      <VideoModal
        isOpen={Boolean(activeStory)}
        onClose={() => setActiveStory(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
