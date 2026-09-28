import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";

interface LegalPageProps {
  type?: "terms" | "privacy" | "earnings";
}

export const LegalPage: React.FC<LegalPageProps> = ({ type: propType }) => {
  const location = useLocation();

  const activeType =
    propType ||
    (location.pathname.includes("privacy")
      ? "privacy"
      : location.pathname.includes("earnings")
      ? "earnings"
      : "terms");

  const titles = {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    earnings: "Earnings & Outcomes Disclaimer",
  };

  usePageMeta(titles[activeType], `Official ${titles[activeType]} for Skill2Bills education platform.`);

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 animate-fade-in text-zinc-300">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          {activeType === "privacy" && <Shield className="w-6 h-6 text-[#D4F636]" />}
          {activeType === "terms" && <FileText className="w-6 h-6 text-[#D4F636]" />}
          {activeType === "earnings" && <AlertTriangle className="w-6 h-6 text-[#D4F636]" />}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {titles[activeType]}
          </h1>
        </div>
        <p className="text-xs text-zinc-500 font-mono">Last updated: September 2026</p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 leading-relaxed text-sm sm:text-base space-y-6">
        {activeType === "earnings" && (
          <>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm">
              <strong>Important Notice:</strong> Skill2Bills is an educational skills training platform. We do not provide financial advice, make income claims, or guarantee employment.
            </div>

            <h2 className="text-lg font-bold text-white pt-2">1. No Earnings or Income Guarantees</h2>
            <p>
              Skill2Bills provides curriculum, tutorials, checklists, and software training for digital media, content repurposing, live broadcasting, and creator operations. Under no circumstances do we promise, represent, or guarantee that you will earn any specific amount of money, secure retainer clients, or make a return on your time investment.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">2. Independent Results & Market Factors</h2>
            <p>
              Individual student outcomes vary greatly based on personal dedication, background experience, quality of created content, software proficiency, client negotiation skills, and market conditions. Past student portfolio examples or historical case studies featured on the site are illustrative of what is possible, not guarantees of what you will achieve.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">3. Platform Monetization Rules</h2>
            <p>
              Third-party platforms (such as YouTube, TikTok, Twitch, and Kick) maintain independent terms of service, monetization requirements, and affiliate guidelines outside our control. We cannot guarantee eligibility for monetization programs, Creator Rewards, or brand partnership programs.
            </p>
          </>
        )}

        {activeType === "privacy" && (
          <>
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              When you create an account, log in using Email OTP, or authenticate via Google OAuth, we collect your email address, display name, avatar, and curriculum progress (completed lesson IDs). If you complete our onboarding questionnaire, we store your learning track preferences to recommend relevant curriculum sprints.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">2. How Your Data Is Used</h2>
            <p>
              Your data is used solely to authenticate your account session, sync your lesson progress across devices, and deliver relevant educational materials. We do not sell, rent, or trade your personal information with third-party advertisers.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">3. Storage &amp; Security</h2>
            <p>
              User records and progress are stored securely via Supabase PostgreSQL databases with encrypted network transmission (TLS/HTTPS) and database-level Row Level Security policies.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">4. Your Data Rights &amp; Deletion</h2>
            <p>
              You have the right to request an export of your stored data or request complete account deletion at any time via your Account Settings page or by contacting support.
            </p>
          </>
        )}

        {activeType === "terms" && (
          <>
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing Skill2Bills or registering a student account, you agree to comply with and be bound by these Terms of Service.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">2. Eligibility</h2>
            <p>
              You must be at least 13 years of age to register for Skill2Bills. If you are under the age of majority in your jurisdiction, you represent that your parent or legal guardian has reviewed and agreed to these terms on your behalf.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">3. Educational Content &amp; Intellectual Property</h2>
            <p>
              All course materials, video lessons, and curriculum outlines provided on Skill2Bills are protected by copyright. Registered students are granted a personal, non-exclusive, non-transferable license to access the material for individual learning. Reselling, scraping, or redistributing course assets is prohibited.
            </p>

            <h2 className="text-lg font-bold text-white pt-2">4. Code of Conduct</h2>
            <p>
              Students must treat instructors, creators, and community peers with respect. Harassment, abuse, copyright infringement, or malicious activity will result in immediate suspension of platform access.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
