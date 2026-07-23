"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, PlayCircle, Circle, Compass, Clock, Star, ChevronRight, AlertCircle } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import { allModules, CATEGORY_COLORS } from "@/lib/data/modules";
import { cn } from "@/lib/utils";

// Desktop chart positions (viewBox 2000x600) — irregular, like a real flight plan
const NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 60, y: 300 },
  { x: 190, y: 180 },
  { x: 320, y: 380 },
  { x: 450, y: 220 },
  { x: 580, y: 400 },
  { x: 710, y: 200 },
  { x: 840, y: 340 },
  { x: 970, y: 180 },
  { x: 1100, y: 380 },
  { x: 1230, y: 240 },
  { x: 1360, y: 420 },
  { x: 1490, y: 280 },
  { x: 1620, y: 180 },
  { x: 1750, y: 360 },
  { x: 1880, y: 220 },
  { x: 1960, y: 400 },
];

// Build smooth path through nodes
function buildPath(positions: { x: number; y: number }[]): string {
  if (positions.length < 2) return "";
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` Q ${cpx} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
    d += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

const FULL_PATH = buildPath(NODE_POSITIONS);

export function LearningPathView() {
  const navigate = useNav((s) => s.navigate);
  const openModule = useNav((s) => s.openModule);
  const isUnlocked = useProgress((s) => s.isModuleUnlocked);
  const isCompleted = useProgress((s) => s.isModuleCompleted);
  const getProgress = useProgress((s) => s.getModuleProgress);
  const completedCount = useProgress((s) => s.getCompletedCount());
  const xp = useProgress((s) => s.xp);

  const [hoveredNode, setHoveredNode] = React.useState<number | null>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Calculate progress path length (proportional to completed count)
  const progressRatio = completedCount / 16;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
            <Compass className="w-4 h-4" />
            Sectional Chart · Flight Plan
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight">
            The Learning Path
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Sixteen modules, charted like a flight plan. Complete each one to
            fill in the route. Modules unlock as you master the prerequisites —
            just like a real pilot rating progression.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="fp-bezel bg-card px-4 py-3 text-center">
            <div className="text-2xl font-heading font-bold text-sky">{completedCount}/16</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">complete</div>
          </div>
          <div className="fp-bezel bg-card px-4 py-3 text-center">
            <div className="text-2xl font-heading font-bold text-gold">{(xp / 10).toFixed(1)}h</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">logged</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-mono">
        <span className="flex items-center gap-1.5"><Circle className="w-3.5 h-3.5 text-muted-foreground" /> Available</span>
        <span className="flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5 text-sky" /> In Progress</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Completed</span>
        <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-muted-foreground" /> Locked</span>
      </div>

      {/* Desktop: Sectional chart SVG */}
      <div className="hidden lg:block fp-bezel bg-card p-2 fp-chart-bg overflow-x-auto fp-scroll" ref={chartRef}>
        <div className="relative" style={{ minWidth: "1400px" }}>
          <svg viewBox="0 0 2000 520" className="w-full h-auto" style={{ minHeight: "480px" }}>
            {/* Chart grid background */}
            <defs>
              <pattern id="chartGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.05" />
              </pattern>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F2B134" />
                <stop offset="100%" stopColor="#F7C968" />
              </linearGradient>
            </defs>
            <rect width="2000" height="520" fill="url(#chartGrid)" />

            {/* Compass rose decoration */}
            <g transform="translate(1000, 260)" opacity="0.06">
              <circle r="180" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle r="120" fill="none" stroke="currentColor" strokeWidth="0.5" />
              {Array.from({ length: 36 }).map((_, i) => {
                const a = (i * 10 * Math.PI) / 180;
                const r1 = i % 9 === 0 ? 160 : 170;
                return (
                  <line key={i} x1={r1 * Math.cos(a)} y1={r1 * Math.sin(a)} x2={180 * Math.cos(a)} y2={180 * Math.sin(a)} stroke="currentColor" strokeWidth="0.5" />
                );
              })}
              <text x="0" y="-150" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="var(--font-jetbrains)">N</text>
            </g>

            {/* Base route (dashed gray) */}
            <path d={FULL_PATH} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,6" opacity="0.2" />

            {/* Progress route (gold, fills as you complete) */}
            {completedCount > 0 && (
              <motion.path
                d={FULL_PATH}
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progressRatio }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            )}

            {/* Nodes */}
            {allModules.map((mod, i) => {
              const pos = NODE_POSITIONS[i];
              const unlocked = isUnlocked(mod.id, mod.prerequisites);
              const completed = isCompleted(mod.id);
              const progress = getProgress(mod.id);
              const inProgress = progress?.startedAt && !completed;
              const isHovered = hoveredNode === mod.id;
              const color = CATEGORY_COLORS[mod.category] || "#3E92CC";

              return (
                <g
                  key={mod.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => unlocked && openModule(mod.id)}
                  onMouseEnter={() => setHoveredNode(mod.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Hover glow */}
                  {isHovered && unlocked && (
                    <circle r="32" fill={color} opacity="0.15" />
                  )}

                  {/* Node circle */}
                  <circle
                    r="22"
                    fill={completed ? "#3BA55D" : unlocked ? "var(--color-card)" : "var(--color-muted)"}
                    stroke={completed ? "#3BA55D" : unlocked ? color : "var(--color-border)"}
                    strokeWidth="2"
                    className={unlocked ? "transition-all" : ""}
                  />

                  {/* Inner content */}
                  {completed ? (
                    <CheckCircle2 className="w-7 h-7 text-white" x={-14} y={-14} />
                  ) : !unlocked ? (
                    <g transform="translate(-7, -7)">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    </g>
                  ) : inProgress ? (
                    <text textAnchor="middle" dy="5" fontSize="14" fontWeight="700" fontFamily="var(--font-sora)" fill={color}>
                      {mod.id}
                    </text>
                  ) : (
                    <text textAnchor="middle" dy="5" fontSize="14" fontWeight="700" fontFamily="var(--font-sora)" fill={color}>
                      {mod.id}
                    </text>
                  )}

                  {/* In-progress ring */}
                  {inProgress && (
                    <circle r="26" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4,3" opacity="0.6">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Module label below */}
                  <text textAnchor="middle" y="42" fontSize="10" fontFamily="var(--font-jetbrains)" fill="currentColor" opacity={unlocked ? 0.7 : 0.35}>
                    {mod.shortTitle.length > 18 ? mod.shortTitle.slice(0, 17) + "…" : mod.shortTitle}
                  </text>

                  {/* Locked tooltip */}
                  {!unlocked && isHovered && (
                    <g transform="translate(0, -40)">
                      <rect x="-90" y="-18" width="180" height="28" fill="var(--color-card)" stroke="var(--color-gold)" strokeWidth="1" rx="3" />
                      <text textAnchor="middle" y="0" fontSize="9" fontFamily="var(--font-jetbrains)" fill="currentColor">
                        Complete Module {mod.prerequisites.join(", ")} to unlock
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Mobile/Tablet: Vertical list with connecting line */}
      <div className="lg:hidden relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        <div
          className="absolute left-6 top-0 w-0.5 bg-gold transition-all duration-700"
          style={{ height: `${(completedCount / 16) * 100}%` }}
        />
        <div className="space-y-3">
          {allModules.map((mod) => {
            const unlocked = isUnlocked(mod.id, mod.prerequisites);
            const completed = isCompleted(mod.id);
            const progress = getProgress(mod.id);
            const inProgress = progress?.startedAt && !completed;
            const color = CATEGORY_COLORS[mod.category] || "#3E92CC";

            return (
              <div key={mod.id} className="relative pl-16">
                <div
                  className={cn(
                    "absolute left-3 top-3 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10",
                    completed ? "bg-green-500 border-green-500" : unlocked ? "bg-card border-sky" : "bg-muted border-border"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : !unlocked ? (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <span className="text-xs font-mono font-bold" style={{ color }}>{mod.id}</span>
                  )}
                </div>
                <button
                  onClick={() => unlocked && openModule(mod.id)}
                  disabled={!unlocked}
                  className={cn(
                    "fp-bezel bg-card p-4 w-full text-left transition-all",
                    unlocked ? "hover:border-sky/50 active:scale-[0.99]" : "opacity-50",
                    inProgress && "border-sky"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Module {mod.id} of 16
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {mod.difficulty}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-sm mb-1">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{mod.tagline}</p>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mod.estimatedMinutes}m</span>
                    <span className="flex items-center gap-1 text-gold"><Star className="w-3 h-3" />{mod.xpReward / 10}h</span>
                    {!unlocked && (
                      <span className="flex items-center gap-1 text-gold-dark"><AlertCircle className="w-3 h-3" />Needs M{mod.prerequisites.join(",")}</span>
                    )}
                    {completed && <span className="text-green-600">Completed</span>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category guide */}
      <div className="mt-10 fp-bezel bg-card p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">Module Categories</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(allModules.map((m) => m.category))).map((cat) => (
            <span
              key={cat}
              className="text-xs font-mono px-2.5 py-1 border"
              style={{ borderColor: `${CATEGORY_COLORS[cat]}55`, color: CATEGORY_COLORS[cat] }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
