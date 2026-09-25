import React, { useState } from "react";
import { 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Search,
  Filter
} from "lucide-react";
import { Course } from "./types";

interface CourseResourcesProps {
  course: Course;
}

export const CourseResources: React.FC<CourseResourcesProps> = ({ course }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Extract all resources from all lessons
  const allResources = course.modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      (l.resources || []).map((r) => ({
        ...r,
        lessonTitle: l.title,
        moduleTitle: m.title,
      }))
    )
  );

  const filtered = allResources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 p-5 sm:p-8 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full font-sans text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resources &amp; Practical Blueprints
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Download project files, copy battle-tested prompt setups, and access cheat sheets for {course.title}.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates, prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121217] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4F636]"
          />
        </div>
      </div>

      {/* Grid of resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#121217] border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all shadow-md"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4F636] capitalize bg-[#D4F636]/10 px-2.5 py-0.5 rounded-full border border-[#D4F636]/20">
                  {item.type}
                </span>
                <span className="text-[11px] text-zinc-500 truncate max-w-[150px]">
                  {item.moduleTitle}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {item.name}
              </h2>
              <p className="text-xs text-zinc-400">
                Associated with: <span className="text-zinc-300">{item.lessonTitle}</span>
              </p>
            </div>

            {item.content ? (
              <div className="space-y-2">
                <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                  {item.content}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.content || "", idx)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Setup Prompt</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <a
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#D4F636] hover:bg-[#c2e42b] text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#D4F636]/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
