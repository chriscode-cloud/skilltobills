import React, { useState } from "react";
import { ChevronDown, Send, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { AuthUser } from "../../lib/auth";
import { usePageMeta } from "../../hooks/usePageMeta";

interface SupportPageProps {
  currentUser: AuthUser | null;
}

export const SupportPage: React.FC<SupportPageProps> = ({ currentUser }) => {
  usePageMeta("Support & FAQ", "Find answers to student questions or message our creator support team.");

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState(currentUser?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [botTrap, setBotTrap] = useState(""); // Honeypot
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const faqs = [
    {
      q: "Are the programmes free to start?",
      a: "Yes. All core curriculum lessons, guides, and project briefs in our current pathways are free for registered students in the 2026 pilot.",
    },
    {
      q: "Do I need previous video editing or programming experience?",
      a: "No. Each programme starts with foundation modules covering software setup (such as OBS Studio, CapCut Desktop, or ElevenLabs) before advancing to specialized workflows.",
    },
    {
      q: "How does progress tracking work?",
      a: "When you mark lessons complete, your progress automatically syncs with your authenticated profile so you can resume on any device.",
    },
    {
      q: "Can I switch or take multiple programmes at the same time?",
      a: "Yes. While your onboarding questionnaire selects a primary focus, you have full access to all curriculum modules and lessons in the Academy.",
    },
    {
      q: "Do you guarantee brand deals, income, or job placement?",
      a: "No. Skill2Bills provides practical skills education, tool stack guides, and structured project briefs. Outcomes depend on individual dedication, quality of portfolio work, and market conditions.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Honeypot check: If bot filled the hidden trap field, silently abort
    if (botTrap) {
      setSuccess(true);
      return;
    }

    if (!email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("support_messages").insert({
          user_id: currentUser?.id || null,
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
        });

        if (error) throw error;
      }

      setSuccess(true);
      setMessage("");
      setSubject("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full bg-[#D4F636]/10 text-[#D4F636] font-mono text-xs font-bold mb-4 border border-[#D4F636]/20">
          Support &amp; Assistance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          How can we help you?
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Frequently asked questions about our curriculum, platform access, and direct creator support.
        </p>
      </div>

      {/* Grid: FAQ (Left) + Contact Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* FAQ Accordion (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D4F636]" />
            <span>Frequently Asked Questions</span>
          </h2>

          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-white pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#D4F636]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Form (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">
            Send us a message
          </h2>
          <p className="text-xs text-zinc-400 mb-6">
            Have a question about a lesson or your account? Our team typically responds within 24 hours.
          </p>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base text-white">Message Delivered</h3>
              <p className="text-xs text-zinc-300">
                Thank you! We received your inquiry and will follow up with you at {email}.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-bold text-[#D4F636] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Bot Honeypot field (hidden from real users) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_bot_trap"
                  tabIndex={-1}
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636] transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question about Content Clipping Module 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs outline-none focus:border-[#D4F636] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
