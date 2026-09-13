import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export const SubscribeBanner: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div
      id="subscribe-banner"
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mb-20"
    >
      <div className="bg-[#000000] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/60 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 border border-white/20">
        {/* Left: Portrait in organic arch/capsule frame */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-white/50 shadow-lg shrink-0">
          <img
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop"
            alt="Creator smiling"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>

        {/* Center: Heading and Subtitle */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            Subscribe to Skill2Bills Updates
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl">
            We bring together industry leaders to share insights, spark ideas, and help you level up.
          </p>
        </div>

        {/* Right: Subscribe Form */}
        <div className="shrink-0 w-full md:w-auto">
          {subscribed ? (
            <div className="bg-white/15 border border-white/40 px-6 py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-bold text-sm backdrop-blur-xs">
              <CheckCircle2 className="w-5 h-5 text-[#D4F636]" />
              <span>You&apos;re on the insider list!</span>
            </div>
          ) : (
            <div className="space-y-2">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-white text-slate-900 text-sm px-5 py-3.5 rounded-full outline-none focus:ring-2 focus:ring-[#D4F636] w-full sm:w-64"
                />
                <button
                  type="submit"
                  className="bg-[#D4F636] hover:bg-[#c2e42b] text-black font-bold text-sm px-7 py-3.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer w-full sm:w-auto shadow-sm"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-[11px] text-slate-400 text-center sm:text-left px-2">
                Free. Unsubscribe anytime. We never sell your data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
