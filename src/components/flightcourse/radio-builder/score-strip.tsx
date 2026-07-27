"use client";

import * as React from "react";
import { Flame, Target, CheckCircle2, Trophy } from "lucide-react";

interface Props {
  hintsUsed: number;
  potentialScore: number;
  currentStreak: number;
  bestStreak: number;
  scenariosCompleted: number;
  totalScenarios: number;
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="fc-stat px-3 py-2 flex items-center gap-2.5">
      <span className={accent}>{icon}</span>
      <div className="leading-tight min-w-0">
        <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          {label}
        </div>
        <div className="font-mono text-base font-bold text-slate-100 truncate">{value}</div>
      </div>
    </div>
  );
}

export function ScoreStrip({
  hintsUsed,
  potentialScore,
  currentStreak,
  bestStreak,
  scenariosCompleted,
  totalScenarios,
}: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat
        icon={<Target className="size-4" />}
        label="This call"
        accent="text-sky"
        value={
          <span>
            {potentialScore}
            <span className="text-slate-400 text-xs">/100</span>
          </span>
        }
      />
      <Stat
        icon={<Flame className={currentStreak > 0 ? "size-4 text-gold" : "size-4 text-slate-400"} />}
        label="Streak"
        accent={currentStreak > 0 ? "text-gold" : "text-slate-400"}
        value={
          <span>
            {currentStreak}
            <span className="text-slate-400 text-xs"> best {bestStreak}</span>
          </span>
        }
      />
      <Stat
        icon={<CheckCircle2 className="size-4" />}
        label="Done"
        accent="text-emerald-400"
        value={`${scenariosCompleted}/${totalScenarios}`}
      />
      <Stat
        icon={<Trophy className="size-4" />}
        label="Hints used"
        accent={hintsUsed > 0 ? "text-gold" : "text-slate-400"}
        value={hintsUsed}
      />
    </div>
  );
}
