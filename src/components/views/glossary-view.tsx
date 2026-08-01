"use client";

import * as React from "react";
import { glossary } from "@/lib/data/glossary";
import { useNav } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Aerodynamics",
  "Instruments",
  "Navigation",
  "Communications",
  "Weather",
  "Procedures",
  "General",
] as const;

/* ============================================================
 * Glossary view — plain-English aviation terms
 * ========================================================== */

export function GlossaryView() {
  const openModule = useNav((s) => s.openModule);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | "All">("All");

  const filtered = React.useMemo(() => {
    let results = glossary;
    if (category !== "All") {
      results = results.filter((t) => t.category === category);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.whyItMatters.toLowerCase().includes(q)
      );
    }
    return results.sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="mb-8 animate-fade-up">
        <p className="label-instrument text-primary mb-3">Reference</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Glossary
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          Plain-English definitions with why each term matters, cross-linked to
          the module that teaches it.
        </p>
      </header>

      {/* Search + filter bar */}
      <div className="glass mb-6 rounded-2xl p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {(["All", ...CATEGORIES] as const).map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <p className="label-instrument mb-4 text-muted-foreground">
        {filtered.length} of {glossary.length} terms
      </p>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No terms match &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((term) => (
            <div key={term.id} className="glass flex flex-col gap-2 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold tracking-tight">{term.term}</h3>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {term.category}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {term.definition}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="label-instrument mr-1.5 text-accent">Why</span>
                {term.whyItMatters}
              </p>
              {term.moduleId && (
                <button
                  onClick={() => openModule(term.moduleId!)}
                  className="mt-1 self-start text-xs font-medium text-accent hover:underline"
                >
                  Learn in module {term.moduleId} →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
