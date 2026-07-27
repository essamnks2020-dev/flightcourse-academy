"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  AlertTriangle,
  Mic,
  Share2,
  ArrowRight,
  RotateCcw,
  LayoutGrid,
  Award,
  Flame,
  Volume2,
} from "lucide-react";
import type { Scenario } from "@/lib/scenarios";
import type { Achievement } from "@/lib/store";
import { useSpeech } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ScenarioResultState {
  score: number;
  firstTryClear: boolean;
  gaveUp: boolean;
  newAchievements: Achievement[];
  streakMilestone: number | null;
}

interface Props {
  scenario: Scenario;
  result: ScenarioResultState;
  allComplete: boolean;
  isLast: boolean;
  onNext: () => void;
  onReplay: () => void;
  onMenu: () => void;
  onSayIt: () => void;
  onShare: () => void;
}

export function ResultOverlay({
  scenario,
  result,
  allComplete,
  isLast,
  onNext,
  onReplay,
  onMenu,
  onSayIt,
  onShare,
}: Props) {
  const { score, firstTryClear, gaveUp, newAchievements, streakMilestone } = result;
  const speech = useSpeech();

  const headline = gaveUp
    ? "Transmission revealed"
    : firstTryClear
      ? "Nailed it!"
      : score >= 75
        ? "Cleared"
        : score >= 50
          ? "Cleared with help"
          : "Cleared";
  const tone = gaveUp
    ? "slate"
    : firstTryClear
      ? "gold"
      : score >= 50
        ? "sky"
        : "slate";

  const shareHighlight = !!streakMilestone || allComplete;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="fc-glass fc-grain rounded-2xl w-full max-w-lg p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto fc-scroll"
      >
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <span className="fc-screw absolute bottom-3 left-3" />
        <span className="fc-screw absolute bottom-3 right-3" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono tracking-wider text-sky-soft/80 mb-1">
              SCENARIO {scenario.index} / 12 · {scenario.ref}
            </div>
            <h3
              className={
                "font-display text-2xl sm:text-3xl font-bold leading-tight " +
                (tone === "gold"
                  ? "text-gold"
                  : tone === "sky"
                    ? "text-sky-soft"
                    : "text-slate-200")
              }
            >
              {headline}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-mono text-3xl sm:text-4xl font-bold text-white">
              {score}
            </div>
            <div className="text-[10px] font-mono text-slate-400">/ 100</div>
          </div>
        </div>

        {/* status chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {firstTryClear && (
            <Badge className="bg-gold/15 border-gold/50 text-gold font-mono">
              <Flame className="size-3" /> First-try clear
            </Badge>
          )}
          {!firstTryClear && !gaveUp && (
            <Badge className="bg-sky/15 border-sky/50 text-sky-soft font-mono">
              <CheckCircle2 className="size-3" /> Cleared
            </Badge>
          )}
          {gaveUp && (
            <Badge className="bg-slate-500/15 border-slate-400/40 text-slate-300 font-mono">
              <XCircle className="size-3" /> Revealed
            </Badge>
          )}
          {streakMilestone && (
            <Badge className="bg-gold/15 border-gold/50 text-gold font-mono animate-pulse-gold">
              <Flame className="size-3" /> {streakMilestone}-streak milestone!
            </Badge>
          )}
        </div>

        {/* correct phrase */}
        <div className="mt-4 rounded-lg bg-navy-700/50 border border-white/5 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[10px] font-mono tracking-wider text-slate-400">
              CORRECT TRANSMISSION
            </div>
            <button
              onClick={() => speech.speak(scenario.fullPhrase, { scenarioKey: scenario.id })}
              className="grid place-items-center h-7 w-7 rounded-md text-emerald-300 hover:bg-emerald-500/15 transition-colors"
              aria-label="Hear the correct transmission"
            >
              <Volume2 className={cn("size-3.5", speech.speaking && "animate-pulse")} />
            </button>
          </div>
          <p className="font-mono text-sm text-emerald-300 leading-relaxed">
            {scenario.fullPhrase}
          </p>
        </div>

        {/* explanation */}
        <div className="mt-3 rounded-lg border border-sky/20 bg-sky/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sky-soft text-[11px] font-mono tracking-wider mb-1">
            <Lightbulb className="size-3.5" /> WHY · {scenario.ref}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{scenario.explanation}</p>
        </div>

        {/* common-mistake callout */}
        <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2.5">
          <div className="flex items-center gap-2 text-amber-300 text-[11px] font-mono tracking-wider mb-1">
            <AlertTriangle className="size-3.5" /> WATCH OUT FOR THIS
          </div>
          <p className="text-sm text-amber-50/90 leading-relaxed">{scenario.commonMistake}</p>
        </div>

        {/* new achievements */}
        {newAchievements.length > 0 && (
          <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5">
            <div className="flex items-center gap-2 text-gold text-[11px] font-mono tracking-wider mb-2">
              <Award className="size-3.5" /> NEW BADGE{newAchievements.length > 1 ? "S" : ""} EARNED
            </div>
            <div className="flex flex-wrap gap-2">
              {newAchievements.map((a) => (
                <Badge key={a.id} className="bg-gold/15 border-gold/50 text-gold">
                  <Award className="size-3" /> {a.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* actions */}
        <div className="mt-5 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              onClick={onNext}
              className="bg-gold text-navy hover:bg-gold/90 font-semibold"
              disabled={isLast && allComplete}
            >
              {isLast ? "All scenarios done" : "Next scenario"} <ArrowRight className="size-4" />
            </Button>
            <Button
              onClick={onShare}
              variant={shareHighlight ? "default" : "outline"}
              className={
                shareHighlight
                  ? "bg-sky text-navy hover:bg-sky/90 font-semibold animate-pulse-gold"
                  : "border-sky/50 text-sky-soft hover:bg-sky/10"
              }
            >
              <Share2 className="size-4" /> Share {shareHighlight ? "milestone" : "result"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onSayIt}
              variant="ghost"
              className="text-slate-300 hover:text-white border border-white/10"
            >
              <Mic className="size-4" /> Say it aloud
            </Button>
            <Button
              onClick={onReplay}
              variant="ghost"
              className="text-slate-300 hover:text-white border border-white/10"
            >
              <RotateCcw className="size-4" /> Replay
            </Button>
          </div>
          <Button onClick={onMenu} variant="ghost" className="w-full text-slate-400 hover:text-slate-200">
            <LayoutGrid className="size-4" /> Back to scenario list
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
