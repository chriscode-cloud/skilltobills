/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import { PublicShell } from "./components/navigation/PublicShell";
import { AppShell } from "./components/navigation/AppShell";
import { HeroSection } from "./components/HeroSection";
import { WorthWatchingSection } from "./components/WorthWatchingSection";
import { PathwaysSection } from "./components/PathwaysSection";
import { TransformationSection } from "./components/TransformationSection";
import { LatestSection } from "./components/LatestSection";
import { SubscribeBanner } from "./components/SubscribeBanner";
import { ProgramPage } from "./components/ProgramPage";
import { BlogPage } from "./components/BlogPage";
import { SupportPage } from "./components/pages/SupportPage";
import { LegalPage } from "./components/pages/LegalPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";
import { AuthPage } from "./components/auth/AuthPage";
import { OnboardingPage } from "./components/onboarding/OnboardingPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { MyProgrammesPage } from "./components/lms/MyProgrammesPage";
import { ProgrammeOverviewPage } from "./components/lms/ProgrammeOverviewPage";
import { LessonPlayerPage } from "./components/lms/LessonPlayerPage";
import { SettingsPages } from "./components/settings/SettingsPages";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminGuard } from "./components/admin/AdminGuard";
import { COURSE_TRACKS, CourseTrack, BLOG_ARTICLES } from "./data/contentData";
import { getStoredUser, clearStoredUser, setStoredUser, AuthUser } from "./lib/auth";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { usePageMeta } from "./hooks/usePageMeta";
import { Analytics } from "@vercel/analytics/react";

// --- Route Guard: Require Authenticated Student ---
const RequireAuth: React.FC<{
  currentUser: AuthUser | null;
  children: React.ReactNode;
}> = ({ currentUser, children }) => {
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// --- Route Guard: Redirect Logged-In Users ---
const RedirectIfAuth: React.FC<{
  currentUser: AuthUser | null;
  children: React.ReactNode;
}> = ({ currentUser, children }) => {
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// --- Landing Page View ---
const HomePage: React.FC<{ currentUser: AuthUser | null }> = ({ currentUser }) => {
  usePageMeta("Skill2Bills | Practical Skills Training for the 2026 Creator Economy");
  const navigate = useNavigate();

  return (
    <>
      <HeroSection
        onSignUpClick={() => navigate(currentUser ? "/dashboard" : "/signup")}
      />
      <WorthWatchingSection />
      <PathwaysSection
        onSelectTrack={(track) => {
          const trackSlugMap: Record<string, string> = {
            "ai-influencer": "ai-virtual-influencers",
            "content-creation": "content-clipping",
            "live-streaming": "live-streaming",
            "youtube-automation": "youtube-automation",
          };
          const slug = trackSlugMap[track.id] || "content-clipping";
          navigate(`/programmes/${slug}`);
        }}
      />
      <TransformationSection />
      <LatestSection
        onSelectArticle={(article) => navigate(`/blog/${article.id}`)}
        onVisitBlog={() => navigate("/blog")}
      />
      <SubscribeBanner />
    </>
  );
};

// --- Program Detail Wrapper ---
const ProgramPageWrapper: React.FC<{ currentUser: AuthUser | null }> = ({ currentUser }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const slugTrackMap: Record<string, string> = {
    "ai-virtual-influencers": "ai-influencer",
    "content-clipping": "content-creation",
    "live-streaming": "live-streaming",
    "youtube-automation": "youtube-automation",
    "clipping-mastery": "content-creation",
    "stream-engineer": "live-streaming",
  };

  const trackId = (slug && slugTrackMap[slug]) || slug || "content-creation";
  const track = COURSE_TRACKS.find((t) => t.id === trackId) || COURSE_TRACKS[0];

  usePageMeta(`${track.title} | Programme Detail`, track.description);

  const handleEnroll = async (title: string) => {
    if (!currentUser) {
      sessionStorage.setItem("skill2bills_redirect", `/learn/${slug || "clipping-mastery"}`);
      navigate("/signup");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("enrollments").upsert({
          user_id: currentUser.id,
          course_id: track.id,
          enrolled_at: new Date().toISOString(),
          status: "active",
        });
      } catch {
        // offline
      }
    }

    navigate(`/learn/${slug || "clipping-mastery"}`);
  };

  return (
    <ProgramPage
      track={track}
      onBack={() => navigate("/programmes")}
      onEnrollSuccess={handleEnroll}
    />
  );
};

// --- Blog Page Wrapper ---
const BlogPageWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const selectedArticle = slug ? BLOG_ARTICLES.find((a) => a.id === slug) || null : null;
  usePageMeta(
    selectedArticle ? `${selectedArticle.title} | The Latest` : "The Latest | Skill2Bills Creator Editorial"
  );

  return (
    <BlogPage
      initialSelectedArticle={selectedArticle}
      onBackToHome={() => navigate("/blog")}
      onSelectArticle={(article) => navigate(`/blog/${article.id}`)}
    />
  );
};

// --- Legacy Hash Interceptor & Session Sync ---
function HashAndSessionManager({
  setCurrentUser,
}: {
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Process OAuth Tokens returning in hash (#access_token=...)
    if (window.location.hash.includes("access_token")) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const token = hashParams.get("access_token");
        if (token) {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const decoded = JSON.parse(atob(payloadBase64));
            if (decoded && decoded.email) {
              const meta = decoded.user_metadata || {};
              const authUser: AuthUser = {
                id: decoded.sub || "",
                email: decoded.email,
                name: meta.full_name || meta.name || decoded.email.split("@")[0],
                avatar: meta.avatar_url || meta.picture,
                createdAt: new Date().toISOString(),
              };
              setStoredUser(authUser);
              setCurrentUser(authUser);
              window.location.hash = "";
              navigate("/dashboard", { replace: true });
              return;
            }
          }
        }
      } catch {
        // fallback
      }
    }

    // 2. Map legacy hash URLs to clean paths
    const hash = window.location.hash;
    if (hash) {
      if (hash.startsWith("#program/")) {
        const id = hash.replace("#program/", "");
        navigate(`/programmes/${id}`, { replace: true });
      } else if (hash.startsWith("#blog/")) {
        const id = hash.replace("#blog/", "");
        navigate(`/blog/${id}`, { replace: true });
      } else if (hash === "#blog") {
        navigate("/blog", { replace: true });
      } else if (hash.startsWith("#academy/")) {
        const slug = hash.replace("#academy/", "");
        navigate(`/learn/${slug}`, { replace: true });
      } else if (hash === "#academy" || hash === "#classroom" || hash === "#lms") {
        navigate("/dashboard", { replace: true });
      } else if (hash === "#login") {
        navigate("/login", { replace: true });
      } else if (hash === "#join") {
        navigate("/signup", { replace: true });
      } else if (hash === "#terms") {
        navigate("/terms", { replace: true });
      } else if (hash === "#privacy") {
        navigate("/privacy", { replace: true });
      } else if (hash === "#admin" || hash === "#dashboard") {
        navigate("/admin", { replace: true });
      }
    }
  }, [navigate, setCurrentUser]);

  return null;
}

// --- Main App Root ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    const handleAuthChanged = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener("skill2bills_auth_changed", handleAuthChanged);

    // Live Supabase Auth listener
    let authUnsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured && supabase) {
      try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
            // Fetch live profile to check onboarding completion & track
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            const rawMeta = session.user.user_metadata || {};
            const isCompleted = profile ? Boolean(profile.onboarding_completed) : false;
            const userTrack = profile?.track && profile.track !== "none" ? profile.track : "content-clipping";

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || profile?.email || "",
              name: profile?.name || rawMeta.full_name || rawMeta.name || session.user.email?.split("@")[0] || "Creator",
              role: (profile?.role as any) || "student",
              onboardingCompleted: isCompleted,
              track: userTrack,
              avatar: profile?.avatar_url || rawMeta.avatar_url || rawMeta.picture,
              createdAt: session.user.created_at,
            };

            setStoredUser(authUser);
            setCurrentUser(authUser);

            // Clean hash parameters if returning from magic link redirect
            if (window.location.hash.includes("access_token")) {
              window.history.replaceState(null, "", window.location.pathname);
            }
          } else if (event === "SIGNED_OUT") {
            clearStoredUser();
            setCurrentUser(null);
          }
        });
        authUnsubscribe = () => subscription.unsubscribe();
      } catch {
        // offline
      }
    }

    return () => {
      window.removeEventListener("skill2bills_auth_changed", handleAuthChanged);
      if (authUnsubscribe) authUnsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    clearStoredUser();
    setCurrentUser(null);
    window.location.assign("/login");
  };

  return (
    <BrowserRouter>
      <HashAndSessionManager setCurrentUser={setCurrentUser} />

      <Routes>
        {/* PUBLIC SHELL ROUTES */}
        <Route element={<PublicShell currentUser={currentUser} onLogout={handleLogout} />}>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/programmes" element={<Navigate to="/#pathways" replace />} />
          <Route path="/programmes/:slug" element={<ProgramPageWrapper currentUser={currentUser} />} />
          <Route path="/blog" element={<BlogPageWrapper />} />
          <Route path="/blog/:slug" element={<BlogPageWrapper />} />
          <Route path="/support" element={<SupportPage currentUser={currentUser} />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/earnings-disclaimer" element={<LegalPage type="earnings" />} />
        </Route>

        {/* AUTH ROUTES (Redirects to dashboard if already authenticated) */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/authpage" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuth currentUser={currentUser}>
              <AuthPage initialMode="login" />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth currentUser={currentUser}>
              <AuthPage initialMode="signup" />
            </RedirectIfAuth>
          }
        />

        {/* ONBOARDING ROUTE */}
        <Route
          path="/onboarding"
          element={
            currentUser ? (
              <OnboardingPage currentUser={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* APP SHELL ROUTES (Guarded for Logged-In Students) */}
        <Route
          element={
            <RequireAuth currentUser={currentUser}>
              <AppShell currentUser={currentUser!} onLogout={handleLogout} />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser!} />} />
          <Route path="/learn" element={<MyProgrammesPage currentUser={currentUser!} />} />
          <Route path="/learn/:programme" element={<ProgrammeOverviewPage currentUser={currentUser!} />} />
          <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
          <Route path="/settings/*" element={<SettingsPages currentUser={currentUser!} />} />
        </Route>

        {/* STANDALONE LESSON PLAYER VIEW (Full screen curriculum stage) */}
        <Route
          path="/learn/:programme/:lesson"
          element={
            <RequireAuth currentUser={currentUser}>
              <LessonPlayerPage currentUser={currentUser} />
            </RequireAuth>
          }
        />

        {/* ADMIN ROUTES (Guarded by Role) */}
        <Route
          path="/admin/*"
          element={
            <AdminGuard currentUser={currentUser}>
              <AdminDashboard onBackToWebsite={() => window.location.assign("/dashboard")} />
            </AdminGuard>
          }
        />

        {/* 404 FALLBACK */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
