"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Plane, RotateCcw, ClipboardList } from "lucide-react";
import { checklists } from "@/lib/data/checklists";
import { cn } from "@/lib/utils";

export function ChecklistsView() {
  const [activeId, setActiveId] = React.useState(checklists[0].id);
  const [checked, setChecked] = React.useState<Record<string, Set<string>>>({});

  const active = checklists.find((c) => c.id === activeId)!;

  function toggle(sectionIdx: number, itemIdx: number) {
    const key = `${sectionIdx}-${itemIdx}`;
    setChecked((prev) => {
      const setForChecklist = new Set(prev[activeId] || []);
      if (setForChecklist.has(key)) setForChecklist.delete(key);
      else setForChecklist.add(key);
      return { ...prev, [activeId]: setForChecklist };
    });
  }

  function resetChecklist() {
    setChecked((prev) => ({ ...prev, [activeId]: new Set() }));
  }

  const checkedSet = checked[activeId] || new Set();
  const totalItems = active.sections.reduce((acc, s) => acc + s.items.length, 0);
  const checkedCount = checkedSet.size;
  const allDone = checkedCount === totalItems;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
          <ClipboardList className="w-4 h-4" />
          Real Cessna 172 Procedures
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Checklist Library
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Real, accurate checklists for the Cessna 172 Skyhawk. Click items as
          you complete them — your progress is saved per checklist. In real
          flying, checklists are sacred. Get in the habit now.
        </p>
      </div>

      {/* Checklist selector tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {checklists.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={cn(
              "px-3 py-2 text-sm font-medium border transition-all flex items-center gap-2",
              activeId === c.id
                ? "border-sky bg-sky/10 text-sky"
                : "border-border text-muted-foreground hover:border-sky/50"
            )}
          >
            <Plane className="w-3.5 h-3.5" />
            {c.title}
          </button>
        ))}
      </div>

      {/* Active checklist */}
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fp-bezel bg-card p-5 sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-heading font-bold text-xl mb-1">{active.title}</h2>
            <p className="text-sm text-muted-foreground">{active.description}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">{active.aircraft}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-heading font-bold text-lg">
                {checkedCount}/{totalItems}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">items done</div>
            </div>
            <button
              onClick={resetChecklist}
              className="fp-outline-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <motion.div
            className={cn("h-full rounded-full", allDone ? "bg-green-500" : "bg-sky")}
            initial={{ width: 0 }}
            animate={{ width: `${(checkedCount / totalItems) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {active.sections.map((section, si) => {
            const sectionItems = section.items.map((_, ii) => `${si}-${ii}`);
            const sectionChecked = sectionItems.filter((k) => checkedSet.has(k)).length;
            return (
              <div key={si}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-sky">
                    {section.name}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    {sectionChecked}/{section.items.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {section.items.map((item, ii) => {
                    const key = `${si}-${ii}`;
                    const isChecked = checkedSet.has(key);
                    return (
                      <button
                        key={ii}
                        onClick={() => toggle(si, ii)}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 border text-left transition-all text-sm",
                          isChecked
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-border hover:border-sky/40 hover:bg-sky/5"
                        )}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className={cn("font-medium", isChecked && "line-through opacity-60")}>
                            {item.text}
                          </div>
                          {item.detail && (
                            <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion message */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 border border-green-500/40 bg-green-500/5 flex items-center gap-3"
          >
            <CheckSquare className="w-6 h-6 text-green-500" />
            <div>
              <div className="font-heading font-bold text-sm text-green-700 dark:text-green-400">
                Checklist complete
              </div>
              <div className="text-xs text-muted-foreground">
                All items verified. In a real cockpit, you'd read each item aloud
                and confirm with your hand on the control. Build that habit.
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
