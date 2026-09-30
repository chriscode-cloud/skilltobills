import React from "react";
import { BrandLogo } from "./BrandLogo";

interface FooterProps {
  onSelectTrackById: (id: string) => void;
  onBlogClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTrackById, onBlogClick }) => {
  return (
    <footer
      id="footer"
      className="relative bg-[#000000] text-white pt-32 pb-12 px-4 sm:px-8 lg:px-16 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#000000] via-[#000000]/95 to-[#000000]/80 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 mb-16">
          {/* Logo & Tagline Column */}
          <div className="col-span-2 space-y-4">
            <a
              href="#"
              className="flex items-center gap-3 group text-left"
            >
              <BrandLogo className="w-9 h-9 sm:w-10 sm:h-10" />
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Skill<span className="text-[#D4F636]">2</span>Bills
              </span>
            </a>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              <a
                href="/admin"
                className="hover:text-slate-300 transition-colors cursor-pointer"
                title="Admin"
              >
                Practical
              </a>{" "}
              education for the 2026 creator economy. Learn what actually pays.
            </p>
          </div>

          {/* Column 1: Community & Students */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 tracking-tight">
              Community &amp; Students
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="/support" className="hover:text-[#D4F636] transition-colors">
                  Student Support &amp; FAQ
                </a>
              </li>
              {import.meta.env.VITE_DISCORD_INVITE_URL && (
                <li>
                  <a
                    href={import.meta.env.VITE_DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4F636] transition-colors"
                  >
                    Community Discord
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 2: Editorial & Resources */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 tracking-tight">
              Editorial &amp; Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={onBlogClick}
                  className="hover:text-[#D4F636] transition-colors cursor-pointer text-left font-normal"
                >
                  The Latest (Blog)
                </button>
              </li>
              <li>
                <a href="/support" className="hover:text-[#D4F636] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Support */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 tracking-tight">
              Governance &amp; Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="/terms" className="hover:text-[#D4F636] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-[#D4F636] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/support" className="hover:text-[#D4F636] transition-colors">
                  Student Support
                </a>
              </li>
              <li>
                <a href="/earnings-disclaimer" className="hover:text-[#D4F636] transition-colors">
                  Earnings &amp; Outcomes Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance Disclaimer Box */}
        <div className="border-t border-slate-800/80 pt-8 pb-6">
          <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
            Skill2Bills provides skills training and project feedback. We do not guarantee income, brand deals, platform monetization eligibility (e.g. Twitch Affiliate, TikTok Creator Rewards), or job placement. Outcomes depend on individual effort, market conditions, and third-party platform policies outside our control.
          </p>
        </div>

        {/* Bottom Row: Legal & Circular Social Icons */}
        <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Legal / Copyright */}
          <div className="text-xs text-slate-400 flex items-center flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
            <span>&copy; 2026 Skill2Bills Education. All rights reserved.</span>
          </div>

          {/* Circular Social Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#D4F636] flex items-center justify-center transition-all hover:scale-110 shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#D4F636] flex items-center justify-center transition-all hover:scale-110 shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#D4F636] flex items-center justify-center transition-all hover:scale-110 shadow-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-[#D4F636] flex items-center justify-center transition-all hover:scale-110 shadow-xs"
            >
              <svg className="w-4 h-4 fill-current text-red-600" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
