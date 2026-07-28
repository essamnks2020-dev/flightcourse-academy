"use client";

import { useMemo } from "react";
import { Check, Clock, Lock } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import { allModules, TOTAL_MODULES, TOTAL_XP } from "@/lib/data/modules";
import type { ModuleContent } from "@/lib/content-types";
import { cn } from "@/lib/utils";

interface Stage {
  name: string;
  subtitle: string;
  ids: number[];
}

const STAGES: Stage[] = [
  { name: "First flights", subtitle: "Cold cockpit to first takeoff", ids: [1, 2, 3, 4] },
  { name: "Controlling the aircraft", subtitle: "Climbs, turns, descents and landings", ids: [5, 6, 7, 8] },
  { name: "Leaving the pattern", subtitle: "Navigation, radio, weather", ids: [9, 10, 11, 12] },
  { name: "Going further", subtitle: "Emergencies, cross-country, IFR", ids: [13, 14, 15, 16] },
];

export function LearningPathView() {
  const openModule = useNav((s) => s.openModule);
  const isModuleCompleted = useProgress((s) => s.isModuleCompleted);
  const isModuleUnlocked = useProgress((s) => s.isModuleUnlocked);

  const moduleById = useMemo(() => {
    const map = new Map<number, ModuleContent>();
    for (const m of allModules) map.set(m.id, m);
    return map;
  }, []);

  const totalMinutes = useMemo(
    () => allModules.reduce((sum, m) => sum + m.estimatedMinutes, 0),
    []
  );
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="animate-fade-up flex flex-col gap-3">
        <p className="label-instrument text-primary">The syllabus</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Four stages, sixteen modules, in flying order
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Each stage ends with you able to do something specific in the simulator.
          Nothing is introduced before you need it.
        </p>
      </header>

      {/* Summary bar */}
      <div className="glass mt-8 flex flex-col gap-6 rounded-2xl p-5 sm:flex-row sm:gap-10">
        <div className="flex flex-col gap-1.5">
          <span className="label-instrument text-muted-foreground">Modules</span>
          <span className="nums text-2xl font-medium">{TOTAL_MODULES}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="label-instrument text-muted-foreground">Total XP</span>
          <span className="nums text-2xl font-medium">{TOTAL_XP}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="label-instrument text-muted-foreground">Estimated time</span>
          <span className="nums text-2xl font-medium">{totalHours} h</span>
        </div>
      </div>

      {/* Stages */}
      <div className="mt-12 flex flex-col gap-12">
        {STAGES.map((stage, stageIdx) => {
          const stageNum = String(stageIdx + 1).padStart(2, "0");
          const modules = stage.ids
            .map((id) => moduleById.get(id))
            .filter((m): m is ModuleContent => Boolean(m));

          return (
            <section key={stageIdx} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-primary font-mono text-sm">{stageNum}</span>
                <h2 className="text-xl font-semibold tracking-tight">{stage.name}</h2>
                <span className="text-muted-foreground text-sm">{stage.subtitle}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {modules.map((mod) => {
                  const completed = isModuleCompleted(mod.id);
                  const unlocked = isModuleUnlocked(mod.id, mod.prerequisites);
                  const locked = !unlocked;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => openModule(mod.id)}
                      aria-label={`Open module ${mod.id}: ${mod.title}`}
                      className={cn(
                        "glass hover:border-primary/40 flex h-full flex-col gap-2 rounded-xl p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        completed && "border-primary/40",
                        locked && "opacity-55"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-baseline gap-2">
                          <span className="text-muted-foreground font-mono text-xs">
                            {String(mod.id).padStart(2, "0")}
                          </span>
                          <span className="font-medium leading-snug">{mod.title}</span>
                        </div>
                        <span className="flex shrink-0 items-center pt-0.5">
                          {completed ? (
                            <Check className="text-primary size-4" />
                          ) : locked ? (
                            <Lock className="text-muted-foreground size-3.5" />
                          ) : mod.id <= 7 ? (
                            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Free
                            </span>
                          ) : (
                            <span className="border-muted-foreground/50 size-3.5 rounded-full border" />
                          )}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {mod.tagline}
                      </p>

                      <p className="text-muted-foreground mt-auto flex items-center gap-1.5 font-mono text-xs">
                        <Clock className="size-3" />
                        <span>{mod.estimatedMinutes} min</span>
                        <span aria-hidden="true">·</span>
                        <span>{mod.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span>{mod.xpReward} XP</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
