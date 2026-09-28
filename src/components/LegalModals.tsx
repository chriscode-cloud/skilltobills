import React from "react";
import { X, Shield, FileText } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms";
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            {type === "privacy" ? (
              <Shield className="w-5 h-5 text-[#D4F636]" />
            ) : (
              <FileText className="w-5 h-5 text-[#D4F636]" />
            )}
            <h2 className="text-lg font-bold text-white tracking-tight">
              {type === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-300 font-sans">
          {type === "privacy" ? (
            <>
              <p className="text-zinc-400 text-xs">Last updated: September 2026</p>
              <h3 className="text-base font-bold text-white pt-2">1. Information We Collect</h3>
              <p>
                When you register for Skill2Bills or authenticate using email OTP or Google OAuth, we collect your email address, display name, and learning track progress to deliver your course materials and track curriculum completion.
              </p>
              <h3 className="text-base font-bold text-white pt-2">2. How We Use Information</h3>
              <p>
                We use collected information solely to authenticate your account, provide access to the student academy, sync your lesson progress, and communicate important course updates. We never sell your personal information to third parties.
              </p>
              <h3 className="text-base font-bold text-white pt-2">3. Data Storage & Security</h3>
              <p>
                User authentication and profile data are stored securely using Supabase database infrastructure with industry-standard encryption in transit and at rest.
              </p>
              <h3 className="text-base font-bold text-white pt-2">4. Your Rights</h3>
              <p>
                You may request account deletion or data export at any time by contacting our support team at christianaboagye06@gmail.com.
              </p>
            </>
          ) : (
            <>
              <p className="text-zinc-400 text-xs">Last updated: September 2026</p>
              <h3 className="text-base font-bold text-white pt-2">1. Acceptance of Terms</h3>
              <p>
                By creating an account or accessing the Skill2Bills educational platform, you agree to these Terms of Service.
              </p>
              <h3 className="text-base font-bold text-white pt-2">2. Educational Content & Licensing</h3>
              <p>
                All curriculum materials, video lessons, and resources provided on Skill2Bills are for personal educational use. Unauthorized redistribution or commercial resale of course materials is strictly prohibited.
              </p>
              <h3 className="text-base font-bold text-white pt-2">3. Earnings & Outcomes Disclaimer</h3>
              <p>
                Skill2Bills provides skills training and practical guidance. We do not guarantee income, brand sponsorships, monetization eligibility, or client contracts. Individual results depend on student effort, skills, and market conditions.
              </p>
              <h3 className="text-base font-bold text-white pt-2">4. Code of Conduct</h3>
              <p>
                Students are expected to respect fellow creators and mentors. Harassment, spam, or disruptive behavior will result in immediate termination of academy access.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#D4F636] hover:bg-[#c2e42b] text-black transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
