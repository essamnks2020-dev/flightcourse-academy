"use client";

import * as React from "react";
import { glossary } from "@/lib/data/glossary";
import { BookOpen } from "lucide-react";
import { useNav } from "@/lib/nav-store";

// Build a lookup map: lowercase term → GlossaryTerm
const termMap = new Map<string, (typeof glossary)[number]>();
for (const t of glossary) {
  termMap.set(t.term.toLowerCase(), t);
}

// Sorted list of terms (longest first) for matching
const sortedTerms = glossary
  .map((t) => t.term)
  .sort((a, b) => b.length - a.length);

// Escape regex special chars
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a single regex that matches any glossary term as a whole word
const termRegex = new RegExp(
  `\\b(${sortedTerms.map(escapeRe).join("|")})\\b`,
  "gi"
);

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

/** Single glossary term tooltip — click to open popover */
export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const entry = termMap.get(term.toLowerCase());
  const [open, setOpen] = React.useState(false);
  const navigate = useNav((s) => s.navigate);
  const ref = React.useRef<HTMLSpanElement>(null);

  if (!entry) return <>{children ?? term}</>;

  return (
    <span className="relative inline">
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`Glossary term: ${entry.term}. Click for definition.`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="cursor-help border-b border-dashed border-gold/70 text-gold-dark dark:text-gold-light font-medium hover:bg-gold/10 transition-colors"
      >
        {children ?? term}
      </span>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label={`Definition of ${entry.term}`}
            className="absolute z-50 left-0 top-full mt-2 w-72 max-w-[90vw] fp-bezel bg-card p-4 shadow-xl"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Glossary
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky">
                · {entry.category}
              </span>
            </div>
            <h5 className="font-heading font-bold text-base mb-1">{entry.term}</h5>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {entry.definition}
            </p>
            <div className="text-xs text-gold-dark dark:text-gold-light italic mb-2">
              Why it matters: {entry.whyItMatters}
            </div>
            {entry.moduleId && (
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("module", entry.moduleId!);
                }}
                className="flex items-center gap-1 text-xs font-medium text-sky hover:text-sky-light transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                Learn in Module {entry.moduleId}
              </button>
            )}
          </div>
        </>
      )}
    </span>
  );
}

/** Renders text with glossary terms auto-wrapped in tooltips */
export function GlossaryText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  // Use a fresh regex instance to avoid mutating the shared module-level one
  const localRegex = new RegExp(termRegex.source, termRegex.flags);

  while ((match = localRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }
    const matchedTerm = match[0];
    const entry = termMap.get(matchedTerm.toLowerCase());
    if (entry) {
      parts.push(
        <GlossaryTooltip key={`${matchStart}-${matchedTerm}`} term={entry.term} />
      );
    } else {
      parts.push(matchedTerm);
    }
    lastIndex = matchEnd;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}
