import React from "react";
import { Download, ExternalLink } from "lucide-react";
import { LessonResource } from "./types";

export interface ParsedItem {
  title?: string;
  text: string;
  isSubBullet?: boolean;
}

export interface ParsedStepSection {
  title: string;
  items: ParsedItem[];
}

export interface ParsedResourceItem {
  title: string;
  text: string;
}

export interface ParsedLessonData {
  coreConcept: string;
  mainTitle?: string;
  sections: ParsedStepSection[];
  strategicRules: string[];
  resourceAllocations: ParsedResourceItem[];
}

export function parseStructuredLesson(rawContent: string): ParsedLessonData {
  const lines = (rawContent || "").replace(/\r\n/g, "\n").split("\n");

  let coreConcept = "";
  let mainTitle: string | undefined = undefined;
  const sections: ParsedStepSection[] = [];
  const strategicRules: string[] = [];
  const resourceAllocations: ParsedResourceItem[] = [];

  let currentSection: ParsedStepSection | null = null;
  let inCoreConcept = false;
  let inResourceAllocation = false;

  let i = 0;

  // Step 1: Detect Core Concept Overview start
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith("core concept overview")) {
      inCoreConcept = true;
      i++;
      break;
    }
    if (line.length > 0) {
      inCoreConcept = true;
      break;
    }
    i++;
  }

  // Collect Core Concept text until the next section boundary
  if (inCoreConcept) {
    const coreConceptLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i].trim();

      const isMajorSection =
        /^(key takeaways|step-by-step|step by step|essential resources|why \d+%|resource & credit)/i.test(line) ||
        /^(\d+\.|\bstep\s+\d+:?)/i.test(line) ||
        /^strategic rule\s*:/i.test(line);

      if (isMajorSection && coreConceptLines.length > 0) {
        break;
      }

      if (line.length > 0) {
        coreConceptLines.push(line);
      }
      i++;
    }
    coreConcept = coreConceptLines.join(" ");
  }

  // Step 2: Parse the remaining sections
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      i++;
      continue;
    }

    // Check for Strategic Rule
    if (/^strategic rule\s*:/i.test(line)) {
      const ruleText = line.replace(/^strategic rule\s*:\s*/i, "").trim();
      if (ruleText) {
        strategicRules.push(ruleText);
      }
      i++;
      continue;
    }

    // Check for Resource & Credit Allocation section
    if (/^resource & credit allocation/i.test(line)) {
      inResourceAllocation = true;
      i++;
      continue;
    }

    if (inResourceAllocation) {
      // Check if another major section started
      if (/^(key takeaways|step-by-step|\d+\.)/i.test(line)) {
        inResourceAllocation = false;
      } else {
        const cleanBullet = line.replace(/^[-•*]\s*/, "").trim();
        const colonIdx = cleanBullet.indexOf(":");
        if (colonIdx > 0 && colonIdx < 45) {
          resourceAllocations.push({
            title: cleanBullet.slice(0, colonIdx).replace(/\*\*/g, "").trim(),
            text: cleanBullet.slice(colonIdx + 1).replace(/\*\*/g, "").trim(),
          });
        } else if (cleanBullet) {
          resourceAllocations.push({
            title: "Allocation Detail",
            text: cleanBullet,
          });
        }
        i++;
        continue;
      }
    }

    // Check for Main section header (e.g. "Key Takeaways & Chapter Breakdown" or "Step-by-Step Execution Guide")
    if (
      /^(key takeaways|step-by-step summary|step-by-step execution guide|step-by-step guide|chapter breakdown)/i.test(
        line
      ) &&
      !/^\d+\./.test(line)
    ) {
      mainTitle = line;
      i++;
      continue;
    }

    // Check for Numbered Section or Step Heading (e.g. "1. Style & Prompt Extraction", "1. Step 1: Asset Preparation & Platform Setup", "Step 1: ...")
    if (/^(\d+\.\s+|step\s+\d+:)/i.test(line)) {
      currentSection = {
        title: line,
        items: [],
      };
      sections.push(currentSection);
      i++;
      continue;
    }

    // Check for bullet items (- or • or * or sub-bullets)
    if (/^[-•*]/.test(line) || /^\s+[-•*]/.test(rawLine)) {
      const isSubBullet = /^\s{2,}/.test(rawLine) || rawLine.startsWith("\t");
      const cleanBullet = line.replace(/^[-•*]\s*/, "").trim();

      let itemTitle: string | undefined = undefined;
      let itemText = cleanBullet;

      const colonMatch = cleanBullet.match(
        /^(\*\*([^*]+)\*\*|([A-Za-z0-9\s/&()'-]+?)):\s*(.+)$/
      );
      if (colonMatch) {
        itemTitle = (colonMatch[2] || colonMatch[3]).trim();
        itemText = colonMatch[4].trim();
      }

      if (!currentSection) {
        currentSection = {
          title: "Key Takeaways",
          items: [],
        };
        sections.push(currentSection);
      }

      currentSection.items.push({
        title: itemTitle,
        text: itemText,
        isSubBullet,
      });
      i++;
      continue;
    }

    // Check for non-bulleted items with "Title: Description" format
    const plainColonMatch = line.match(
      /^(\*\*([^*]+)\*\*|([A-Za-z0-9\s/&()'-]+?)):\s*(.+)$/
    );
    if (plainColonMatch && plainColonMatch[1].length < 75 && !line.startsWith("http")) {
      const itemTitle = (plainColonMatch[2] || plainColonMatch[3]).trim();
      const itemText = plainColonMatch[4].trim();

      if (!currentSection) {
        currentSection = {
          title: "Key Takeaways",
          items: [],
        };
        sections.push(currentSection);
      }

      currentSection.items.push({
        title: itemTitle,
        text: itemText,
        isSubBullet: false,
      });
      i++;
      continue;
    }

    // Any other regular content line
    if (currentSection) {
      currentSection.items.push({
        text: line,
      });
    } else {
      currentSection = {
        title: "Key Takeaways",
        items: [{ text: line }],
      };
      sections.push(currentSection);
    }

    i++;
  }

  return {
    coreConcept,
    mainTitle:
      mainTitle ||
      (sections.length > 0 ? "Key Takeaways & Chapter Breakdown" : undefined),
    sections,
    strategicRules,
    resourceAllocations,
  };
}

interface StructuredLessonContentProps {
  content: string;
  resources?: LessonResource[];
}

export const StructuredLessonContent: React.FC<StructuredLessonContentProps> = ({
  content,
  resources,
}) => {
  const parsed = parseStructuredLesson(content);

  return (
    <div className="space-y-8">
      {/* Core Concept Overview Header in Styled Black Card with Yellow Left Edge */}
      {parsed.coreConcept && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Core Concept Overview
          </h2>
          <div className="p-5 rounded-2xl bg-zinc-950 border-l-4 border-[#D4F636] text-sm sm:text-base text-zinc-300 italic leading-relaxed">
            {parsed.coreConcept}
          </div>
        </div>
      )}

      {/* Main Sections / Steps outside the yellow-bordered card */}
      {parsed.sections.length > 0 && (
        <div className="space-y-6">
          {parsed.mainTitle && (
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {parsed.mainTitle}
            </h3>
          )}

          <div className="space-y-6">
            {parsed.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h4 className="text-sm font-bold text-[#D4F636] uppercase tracking-wider">
                  {sec.title}
                </h4>
                <div className="space-y-2.5">
                  {sec.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className={`flex gap-3 text-sm text-zinc-300 ${
                        item.isSubBullet
                          ? "ml-5 pl-3 border-l-2 border-zinc-800"
                          : ""
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4F636] mt-2 shrink-0" />
                      <p className="leading-relaxed">
                        {item.title ? (
                          <strong className="text-white">
                            {item.title}:{" "}
                          </strong>
                        ) : null}
                        <span>{item.text}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Rules in dedicated callout cards */}
      {parsed.strategicRules.map((rule, rIdx) => (
        <div
          key={rIdx}
          className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3 mt-4"
        >
          <p className="text-xs sm:text-sm text-zinc-300">
            <strong className="text-[#D4F636]">Strategic Rule:</strong> {rule}
          </p>
        </div>
      ))}

      {/* Resource & Credit Allocation (if any) */}
      {parsed.resourceAllocations.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Resource & Credit Allocation
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {parsed.resourceAllocations.map((alloc, aIdx) => (
              <div
                key={aIdx}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1"
              >
                <span className="text-xs font-bold text-[#D4F636] block">
                  {alloc.title}
                </span>
                <p className="text-xs text-zinc-300">{alloc.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essential Resources & Downloads */}
      {resources && resources.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Essential Resources & Downloads
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((res, rIdx) => (
              <a
                key={rIdx}
                href={res.url || "#"}
                target={res.url && res.url.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                download={res.type === "download" ? true : undefined}
                className="p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-[#D4F636]/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 group-hover:bg-[#D4F636]/10 flex items-center justify-center text-[#D4F636] border border-zinc-800 transition-colors">
                    {res.type === "download" ? (
                      <Download className="w-4 h-4" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#D4F636] transition-colors">
                      {res.name}
                    </p>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                      {res.type}
                    </span>
                  </div>
                </div>
                <span className="text-zinc-600 group-hover:text-[#D4F636] text-xs transition-colors">
                  &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
