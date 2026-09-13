import React, { useState } from "react";
import { X, CheckCircle2, MessageCircle, Mail, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "community";
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = "login" }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-black text-[#D4F636] flex items-center justify-center mx-auto mb-3 font-black text-xl shadow-sm">
            sh
          </div>
          <h3 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            {defaultMode === "community" ? "Join the Creator Hub" : "Welcome Back"}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {defaultMode === "community"
              ? "Connect with 42,000+ streamers, AI creators & digital hustlers."
              : "Access your courses, blueprint downloads, and mentor chats."}
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Magic Link Sent!</h4>
            <p className="text-xs text-slate-500">
              Check your inbox to finish logging in to Skill2Bills.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                setTimeout(() => {
                  onClose();
                  setSubmitted(false);
                }, 1200);
              }}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                setTimeout(() => {
                  onClose();
                  setSubmitted(false);
                }, 1200);
              }}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Connect with Discord</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[11px] uppercase font-bold text-slate-400">or with email</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Creator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@creator.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#D4F636] hover:bg-[#c2e42b] text-black font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md border border-black/10"
              >
                Continue with Email
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400 pt-2">
              By continuing you agree to Skill2Bills's Terms of Service and Privacy Policy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
