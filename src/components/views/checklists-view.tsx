"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { checklists } from "@/lib/data/checklists";
import { cn } from "@/lib/utils";

export function ChecklistsView() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [prevSelectedIdx, setPrevSelectedIdx] = useState(selectedIdx);

  const checklist = checklists[selectedIdx];

  // Reset checked items when the selected checklist changes.
  // (Adjust state during render — the React-recommended pattern for
  // reacting to a state change without an effect.)
  if (selectedIdx !== prevSelectedIdx) {
    setPrevSelectedIdx(selectedIdx);
    setChecked(new Set());
  }

  const total = useMemo(
    () =>
      checklist.sections.reduce((sum, s) => sum + s.items.length, 0),
    [checklist]
  );
  const checkedCount = checked.size;

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetAll = () => setChecked(new Set());

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="flex animate-fade-up flex-col gap-3">
        <span className="label-instrument text-primary">Reference</span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Checklists
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          The same flows real Cessna 172 pilots run, from preflight to shutdown.
          Tap an item to check it off.
        </p>
      </header>

      {/* Checklist selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {checklists.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setSelectedIdx(idx)}
            aria-pressed={idx === selectedIdx}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              idx === selectedIdx
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Selected checklist detail */}
      <div className="mt-8 flex flex-col gap-4">
        {/* Header card */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-xl font-semibold tracking-tight">
            {checklist.title}
          </h2>
          <p className="font-mono text-sm text-muted-foreground">
            {checklist.aircraft}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {checklist.description}
          </p>
        </div>

        {/* Overall progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="label-instrument text-muted-foreground">
              {checkedCount}/{total} complete
            </span>
            <button
              onClick={resetAll}
              className="text-xs font-medium text-accent hover:underline"
            >
              Reset
            </button>
          </div>
          <Progress value={total === 0 ? 0 : (checkedCount / total) * 100} />
        </div>

        {/* Sections */}
        {checklist.sections.map((section, sectionIdx) => (
          <section key={section.name} className="glass rounded-xl p-5">
            <h3 className="label-instrument mb-3 text-primary">
              {section.name}
            </h3>
            <ul className="flex flex-col gap-2">
              {section.items.map((item, itemIdx) => {
                const key = `${sectionIdx}-${itemIdx}`;
                const isChecked = checked.has(key);
                return (
                  <li key={key}>
                    <button
                      onClick={() => toggleItem(sectionIdx, itemIdx)}
                      aria-pressed={isChecked}
                      className="flex w-full items-start gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                          isChecked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        )}
                      >
                        {isChecked && <Check className="size-3.5" />}
                      </span>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm leading-relaxed",
                            isChecked && "text-muted-foreground line-through"
                          )}
                        >
                          {item.text}
                        </p>
                        {item.detail && (
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
