import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Loader2,
  Check,
  MessageSquare,
  X,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

interface LearnerFeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trackSlug?: string;
  trackTitle?: string;
  completedCount?: number;
  userEmail?: string;
  onFeedbackSubmitted?: () => void;
}

const TYPEFORM_ID = "01M6HRXRE7VBRM0DCCEAC5SXWB";
const TYPEFORM_URL = `https://form.typeform.com/to/${TYPEFORM_ID}`;
const SCRIPT_SRC = "//embed.typeform.com/next/embed.js";

export const LearnerFeedbackPopup: React.FC<LearnerFeedbackPopupProps> = ({
  isOpen,
  onClose,
  trackSlug = "ai-virtual-influencers",
  trackTitle = "Skill2Bills Creator Academy",
  completedCount = 2,
  userEmail = "creator@skill2bills.com",
  onFeedbackSubmitted,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);

  // Load and initialize Typeform embed whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Helper to trigger Typeform embed loader
    const initTypeform = () => {
      try {
        const tf = (window as any).tf;
        if (tf && typeof tf.load === "function") {
          tf.load();
        }
      } catch (err) {
        console.warn("Typeform tf.load error:", err);
      }
    };

    // Check if embed script is already in the DOM
    const existingScript = document.querySelector(`script[src*="embed.typeform.com/next/embed.js"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        if (isMounted) {
          initTypeform();
        }
      };
      document.body.appendChild(script);
    } else {
      // Re-trigger Typeform scanner on the freshly mounted DOM node
      const timer = setTimeout(initTypeform, 100);
      return () => clearTimeout(timer);
    }

    // Listen for postMessage from Typeform when respondent finishes
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const isFormSubmitted =
          data?.type === "form-submit" ||
          data?.event === "form-submit" ||
          data?.action === "form-submit" ||
          event.data?.type === "form-submit" ||
          (typeof event.data === "string" && event.data.includes("form-submit"));

        if (isFormSubmitted) {
          saveFeedbackRecord();
        }
      } catch {
        if (typeof event.data === "string" && event.data.includes("form-submit")) {
          saveFeedbackRecord();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen]);

  // Record feedback completion to localStorage and Supabase
  const saveFeedbackRecord = async () => {
    setIsSubmitted(true);
    setHasMarkedCompleted(true);

    const feedbackPayload = {
      userEmail,
      trackSlug,
      trackTitle,
      completedCount,
      rating: 5,
      pacing: "Optimal",
      priority: "Typeform Submission",
      comments: `Completed Typeform survey (ID: ${TYPEFORM_ID})`,
      submittedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`skill2bills_feedback_${trackSlug}`, JSON.stringify(feedbackPayload));
      localStorage.setItem("skill2bills_feedback_submitted_v2", "true");

      const allSaved = localStorage.getItem("skill2bills_all_feedbacks");
      const list = allSaved ? JSON.parse(allSaved) : [];
      list.push(feedbackPayload);
      localStorage.setItem("skill2bills_all_feedbacks", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("skill2bills_feedback_updated"));
    } catch (err) {
      console.warn("Could not write feedback to localStorage:", err);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("feedback").insert([
          {
            user_id: user?.id || null,
            user_email: userEmail,
            track_slug: trackSlug,
            track_title: trackTitle,
            rating: 5,
            priority: "Typeform",
            pacing: "Optimal",
            comments: `Submitted via Typeform (${TYPEFORM_ID})`,
            metadata: {
              completedCount,
              typeformId: TYPEFORM_ID,
              submittedVia: "Typeform Live Embed",
            },
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // silent fallback
      }
    }

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted();
    }
  };

  const handleManualDone = () => {
    saveFeedbackRecord();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[680px] md:max-w-[740px] w-[95vw] max-h-[92vh] overflow-hidden bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-3xl shadow-2xl [&>button:last-child]:top-4 [&>button:last-child]:right-4">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/40 space-y-1">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4F636]/10 border border-[#D4F636]/30 flex items-center justify-center text-[#D4F636]">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Help Us Improve Skill2Bills
              </DialogTitle>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4F636] bg-[#D4F636]/10 px-2.5 py-1 rounded-full border border-[#D4F636]/20">
              {completedCount >= 2 ? "2 Lessons Done" : "Learner Feedback"}
            </span>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            You completed your first lessons! Take 60 seconds to share your thoughts so we can make the training even better.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="p-8 sm:p-12 text-center space-y-5 bg-zinc-950">
            <div className="w-16 h-16 bg-[#D4F636]/15 text-[#D4F636] rounded-2xl flex items-center justify-center mx-auto ring-1 ring-[#D4F636]/30 shadow-[0_0_24px_rgba(212,246,54,0.2)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">Thank You for Your Feedback!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your input directly helps us refine video pacing, prompts, and practical tools for all creators in the academy.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={onClose}
                className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-[#D4F636]/10"
              >
                Continue Learning &rarr;
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col min-h-0">
            {/* The live Typeform embed container as specified by the user */}
            <div className="relative w-full h-[520px] sm:h-[580px] bg-zinc-950 flex flex-col">
              <div
                ref={containerRef}
                key={`typeform-embed-${isOpen ? "open" : "closed"}`}
                data-tf-live="01M6HRXRE7VBRM0DCCEAC5SXWB"
                data-tf-translucent="true"
                data-tf-auto-focus="true"
                style={{ width: "100%", height: "100%" }}
                className="w-full h-full"
              />
            </div>

            {/* Bottom Toolbar & Fallback */}
            <div className="p-3 sm:px-5 sm:py-3.5 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 text-[#D4F636]" />
                <span>Powered by Typeform</span>
                <span className="text-zinc-600">&bull;</span>
                <a
                  href={TYPEFORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[#D4F636] underline flex items-center gap-1 transition-colors"
                >
                  <span>Open in new window</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs h-8 px-3 rounded-lg cursor-pointer"
                >
                  Later
                </Button>
                <Button
                  type="button"
                  onClick={handleManualDone}
                  disabled={hasMarkedCompleted}
                  className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs h-8 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{hasMarkedCompleted ? "Recorded!" : "I've Submitted This"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
