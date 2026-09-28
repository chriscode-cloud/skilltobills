import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";

export const NotFoundPage: React.FC = () => {
  usePageMeta("Page Not Found", "The requested page does not exist on Skill2Bills.");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#D4F636] mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold text-[#D4F636] uppercase tracking-wider mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-zinc-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
        The link you followed may be broken or the page may have been moved as part of our platform update.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-sm transition-all shadow-md cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
