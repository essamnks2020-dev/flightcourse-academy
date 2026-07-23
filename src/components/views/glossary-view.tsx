"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Filter, X } from "lucide-react";
import { glossary } from "@/lib/data/glossary";
import { useNav } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Aerodynamics", "Instruments", "Navigation", "Communications", "Weather", "Procedures", "General"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Aerodynamics: "#F2B134",
  Instruments: "#3E92CC",
  Navigation: "#6FB3DE",
  Communications: "#F2B134",
  Weather: "#84939F",
  Procedures: "#3E92CC",
  General: "#5B6B79",
};

export function GlossaryView() {
  const navigate = useNav((s) => s.navigate);
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let results = glossary;
    if (activeCategory) {
      results = results.filter((t) => t.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.whyItMatters.toLowerCase().includes(q)
      );
    }
    return results.sort((a, b) => a.term.localeCompare(b.term));
  }, [query, activeCategory]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof glossary>();
    for (const t of filtered) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) =>
      CATEGORIES.indexOf(a[0] as any) - CATEGORIES.indexOf(b[0] as any)
    );
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
          <BookOpen className="w-4 h-4" />
          {glossary.length} Terms · 7 Categories
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Aviation Glossary
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Every acronym demystified. Every term explained in plain English with
          a "why it matters" line. Search or filter by category — and click
          through to the lesson that covers it.
        </p>
      </div>

      {/* Search */}
      <div className="fp-bezel bg-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms, definitions, or concepts..."
            className="w-full pl-10 pr-10 py-2.5 bg-background border border-border text-sm focus:outline-none focus:border-sky transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "text-xs font-mono px-2.5 py-1 border transition-colors",
              !activeCategory ? "bg-sky/15 border-sky text-sky" : "border-border text-muted-foreground hover:border-sky/50"
            )}
          >
            All ({glossary.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = glossary.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  "text-xs font-mono px-2.5 py-1 border transition-colors",
                  activeCategory === cat
                    ? "text-foreground"
                    : "border-border text-muted-foreground hover:border-sky/50"
                )}
                style={activeCategory === cat ? {
                  backgroundColor: `${CATEGORY_COLORS[cat]}22`,
                  borderColor: CATEGORY_COLORS[cat],
                  color: CATEGORY_COLORS[cat],
                } : undefined}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground font-mono mb-4">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"} found
      </div>

      {/* Grouped results */}
      {grouped.length === 0 ? (
        <div className="fp-bezel bg-card p-12 text-center">
          <p className="text-muted-foreground">No terms match "{query}".</p>
          <button onClick={() => { setQuery(""); setActiveCategory(null); }} className="fp-outline-btn px-4 py-2 mt-4 text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, terms]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider" style={{ color: CATEGORY_COLORS[category] }}>
                  {category}
                </h2>
                <span className="text-xs font-mono text-muted-foreground">({terms.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {terms.map((term, i) => (
                  <motion.div
                    key={term.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                    className="fp-bezel bg-card p-4 hover:border-sky/40 transition-colors"
                  >
                    <h3 className="font-heading font-semibold text-base mb-1.5">{term.term}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">{term.definition}</p>
                    <p className="text-xs text-gold-dark dark:text-gold-light italic mb-3">
                      Why it matters: {term.whyItMatters}
                    </p>
                    {term.moduleId && (
                      <button
                        onClick={() => navigate("module", term.moduleId!)}
                        className="text-xs font-mono text-sky hover:text-sky-light transition-colors flex items-center gap-1"
                      >
                        → Module {term.moduleId}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
