import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

interface LearnerFeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trackSlug?: string;
  trackTitle?: string;
  completedCount: number;
  userEmail?: string;
  onFeedbackSubmitted?: () => void;
}

export const LearnerFeedbackPopup: React.FC<LearnerFeedbackPopupProps> = ({
  isOpen,
  onClose,
  trackSlug = "ai-virtual-influencers",
  trackTitle = "Skill2Bills",
  completedCount,
  userEmail = "creator@skill2bills.com",
  onFeedbackSubmitted,
}) => {
  // 1. Overall rating (1 to 5)
  const [rating, setRating] = useState<string>("5");

  // 2. How easy were the lessons to understand?
  const [easeLevel, setEaseLevel] = useState<string>("Very easy");

  // 3. How was the lesson pace?
  const [pace, setPace] = useState<string>("About right");

  // 4. Did you face any difficulty while learning?
  const [difficulty, setDifficulty] = useState<string>("No major difficulty");

  // 5. What is the most useful thing you've learned so far?
  const [mostUseful, setMostUseful] = useState<string>("");

  // 6. What is one thing we should improve?
  const [oneImprovement, setOneImprovement] = useState<string>("");

  // 7. Do you feel ready to continue to the next lesson?
  const [readyForNext, setReadyForNext] = useState<string>("Yes, definitely");

  // 8. Which device did you use to access the lessons?
  const [deviceUsed, setDeviceUsed] = useState<string>("Laptop or desktop");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatResponsesForCopy = (): string => {
    return [
      `Feedback for Skill2Bills (${trackTitle})`,
      `Completed Lessons: ${completedCount}`,
      `User: ${userEmail}`,
      `---`,
      `1. Overall experience rating (1-5): ${rating}/5`,
      `2. Easy to understand: ${easeLevel}`,
      `3. Lesson pace: ${pace}`,
      `4. Difficulties faced: ${difficulty}`,
      `5. Most useful thing learned: ${mostUseful.trim() || "(None entered)"}`,
      `6. One thing to improve: ${oneImprovement.trim() || "(None entered)"}`,
      `7. Ready to continue: ${readyForNext}`,
      `8. Device used: ${deviceUsed}`,
      `Submitted at: ${new Date().toLocaleString()}`,
    ].join("\n");
  };

  const handleCopy = async () => {
    try {
      const text = formatResponsesForCopy();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Could not copy responses to clipboard", err);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const feedbackPayload = {
      userEmail,
      trackSlug,
      trackTitle,
      completedCount,
      rating: parseInt(rating, 10) || 5,
      easeLevel,
      pace,
      difficulty,
      mostUseful: mostUseful.trim(),
      oneImprovement: oneImprovement.trim(),
      readyForNext,
      deviceUsed,
      submittedAt: new Date().toISOString(),
    };

    // 1. Save to localStorage
    try {
      localStorage.setItem(`skill2bills_feedback_${trackSlug}`, JSON.stringify(feedbackPayload));
      localStorage.setItem("skill2bills_feedback_submitted_v2", "true");

      const allSaved = localStorage.getItem("skill2bills_all_feedbacks");
      const list = allSaved ? JSON.parse(allSaved) : [];
      list.push(feedbackPayload);
      localStorage.setItem("skill2bills_all_feedbacks", JSON.stringify(list));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }

    // 2. Persist to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("feedback").insert([
          {
            user_id: user?.id || null,
            user_email: userEmail,
            track_slug: trackSlug,
            track_title: trackTitle,
            rating: parseInt(rating, 10) || 5,
            priority: difficulty,
            pacing: pace,
            comments: `Most useful: ${mostUseful.trim()} | To improve: ${oneImprovement.trim()}`,
            metadata: {
              easeLevel,
              readyForNext,
              deviceUsed,
              completedCount,
            },
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // graceful offline fallback
      }
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    if (onFeedbackSubmitted) onFeedbackSubmitted();

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[540px] max-h-[88vh] overflow-hidden bg-zinc-950 text-zinc-100 border-zinc-800 rounded-2xl shadow-2xl [&>button:last-child]:top-4 [&>button:last-child]:right-4">
        {/* Header */}
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-zinc-800/80 px-6 py-4 text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4F636]" />
            <span>Help us improve Skill2Bills</span>
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#D4F636]/15 text-[#D4F636] rounded-2xl flex items-center justify-center mx-auto ring-1 ring-[#D4F636]/30 shadow-[0_0_20px_rgba(212,246,54,0.15)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">Thank You!</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your feedback will directly help us make Skill2Bills better for learners like you.
              </p>
            </div>
            <Button
              type="button"
              onClick={onClose}
              className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs px-6 py-2 rounded-xl cursor-pointer"
            >
              Continue Learning
            </Button>
          </div>
        ) : (
          <div className="px-6 py-5 overflow-y-auto space-y-6 text-xs text-zinc-300">
            {/* Intro paragraph */}
            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/70">
              You've completed your first two lessons. Tell us how it's going. Your feedback will help us make Skill2Bills better for learners like you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question 1: Overall rating 1 to 5 */}
              <div className="space-y-3">
                <fieldset className="space-y-3">
                  <legend className="text-xs font-bold text-white leading-normal">
                    1. Overall, how would you rate your experience with these first two lessons?
                  </legend>
                  <RadioGroup
                    value={rating}
                    onValueChange={setRating}
                    className="flex gap-0 -space-x-px rounded-xl shadow-sm overflow-hidden border border-zinc-800 bg-zinc-900/40"
                  >
                    {[1, 2, 3, 4, 5].map((number) => (
                      <label
                        key={number}
                        className={`relative flex size-11 flex-1 cursor-pointer flex-col items-center justify-center border-r border-zinc-800 text-center text-sm font-bold transition-all last:border-r-0 ${
                          rating === number.toString()
                            ? "bg-[#D4F636] text-black shadow-inner font-black"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                      >
                        <RadioGroupItem
                          id={`radio-rating-${number}`}
                          value={number.toString()}
                          className="sr-only"
                        />
                        {number}
                      </label>
                    ))}
                  </RadioGroup>
                </fieldset>
                <div className="flex justify-between text-[11px] font-medium text-zinc-500 px-1">
                  <span>Very poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Question 2: How easy were the lessons to understand? */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-white block">
                  2. How easy were the lessons to understand?
                </Label>
                <RadioGroup value={easeLevel} onValueChange={setEaseLevel} className="grid grid-cols-1 gap-2">
                  {[
                    "Very easy",
                    "Mostly easy",
                    "Some parts were confusing",
                    "Difficult to follow",
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                        easeLevel === option
                          ? "bg-[#D4F636]/15 border-[#D4F636] text-white font-bold ring-1 ring-[#D4F636]/30"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                      }`}
                    >
                      <RadioGroupItem value={option} className="border-zinc-500 text-[#D4F636]" />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 3: How was the lesson pace? */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-white block">
                  3. How was the lesson pace?
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Too slow", "About right", "Too fast"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPace(option)}
                      className={`py-2 px-2.5 rounded-xl text-center text-xs font-medium border transition-colors cursor-pointer ${
                        pace === option
                          ? "bg-zinc-800 border-[#D4F636] text-white font-bold ring-1 ring-[#D4F636]/40"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Did you face any difficulty while learning? */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-white block">
                  4. Did you face any difficulty while learning?
                </Label>
                <RadioGroup value={difficulty} onValueChange={setDifficulty} className="grid grid-cols-1 gap-2">
                  {[
                    "No major difficulty",
                    "Understanding the content",
                    "Internet or data costs",
                    "Using the tools",
                    "Finding time to learn",
                    "Other",
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                        difficulty === option
                          ? "bg-[#D4F636]/15 border-[#D4F636] text-white font-bold ring-1 ring-[#D4F636]/30"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                      }`}
                    >
                      <RadioGroupItem value={option} className="border-zinc-500 text-[#D4F636]" />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 5: What is the most useful thing you've learned so far? */}
              <div className="space-y-2">
                <Label htmlFor="q5-useful" className="text-xs font-bold text-white block">
                  5. What is the most useful thing you've learned so far?
                </Label>
                <Textarea
                  id="q5-useful"
                  placeholder="Share your favorite takeaway or practical technique..."
                  value={mostUseful}
                  onChange={(e) => setMostUseful(e.target.value)}
                  className="bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl text-xs min-h-[75px] focus-visible:ring-[#D4F636]/40"
                />
              </div>

              {/* Question 6: What is one thing we should improve? */}
              <div className="space-y-2">
                <Label htmlFor="q6-improve" className="text-xs font-bold text-white block">
                  6. What is one thing we should improve?
                </Label>
                <Textarea
                  id="q6-improve"
                  placeholder="What could be clearer, added, or streamlined?"
                  value={oneImprovement}
                  onChange={(e) => setOneImprovement(e.target.value)}
                  className="bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl text-xs min-h-[75px] focus-visible:ring-[#D4F636]/40"
                />
              </div>

              {/* Question 7: Do you feel ready to continue to the next lesson? */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-white block">
                  7. Do you feel ready to continue to the next lesson?
                </Label>
                <RadioGroup value={readyForNext} onValueChange={setReadyForNext} className="grid grid-cols-1 gap-2">
                  {[
                    "Yes, definitely",
                    "Yes, but I need more practice",
                    "Not yet, I need help",
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                        readyForNext === option
                          ? "bg-[#D4F636]/15 border-[#D4F636] text-white font-bold ring-1 ring-[#D4F636]/30"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                      }`}
                    >
                      <RadioGroupItem value={option} className="border-zinc-500 text-[#D4F636]" />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Question 8: Which device did you use to access the lessons? */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-white block">
                  8. Which device did you use to access the lessons?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Android phone",
                    "iPhone",
                    "Laptop or desktop",
                    "Tablet or other",
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDeviceUsed(option)}
                      className={`py-2 px-3 rounded-xl text-left text-xs font-medium border transition-colors cursor-pointer ${
                        deviceUsed === option
                          ? "bg-zinc-800 border-[#D4F636] text-white font-bold ring-1 ring-[#D4F636]/40"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Copy responses & Send feedback */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className="w-full sm:w-1/2 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs h-10 rounded-xl gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy feedback responses</span>
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-1/2 bg-[#D4F636] hover:bg-[#c2e42b] text-black font-black text-xs h-10 rounded-xl gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Sending..." : "Send feedback"}</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
