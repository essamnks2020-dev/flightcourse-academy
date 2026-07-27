"use client";

import * as React from "react";
import {
  Radio,
  Ear,
  CheckCircle2,
  Lock,
  Flame,
  Trophy,
  RotateCcw,
  Star,
  Navigation,
  ArrowRight,
  Target,
  AlertCircle,
  Volume2,
  Play,
  BookOpen,
} from "lucide-react";
import { SCENARIOS, SCENARIO_BY_ID } from "@/lib/scenarios";
import {
  useFlightStore,
  selectTotals,
  selectNeedsReview,
} from "@/lib/store";
import { useSpeech } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-pointer";
import {
  AttitudeIndicator,
  AltitudeTape,
  CompassRose,
} from "@/components/flightcourse/instruments";

interface Props {
  onSelect: (id: string) => void;
  onOpenGuide?: () => void;
}

// A short, real example call used for the "Hear an example" demo.
const EXAMPLE_CALL =
  "Watertown Tower, Cessna Seven Three Romeo, at runway two three, ready for takeoff.";

export function ScenarioMenu({ onSelect, onOpenGuide }: Props) {
  // Always call hooks (Rules of Hooks) but gate all DISPLAY values behind
  // hydrated so server output == first client render output (no mismatch).
  const storeResults = useFlightStore((s) => s.radio.results);
  const storeStreak = useFlightStore((s) => s.radio.currentStreak);
  const storeBest = useFlightStore((s) => s.radio.bestStreak);
  const resetRadio = useFlightStore((s) => s.resetRadio);
  const storeRadio = useFlightStore((s) => s.radio);
  const hydrated = useHydrated();
  const speech = useSpeech();

  // Use defaults when not hydrated — guarantees SSR/first-render parity.
  const results = hydrated ? storeResults : {};
  const currentStreak = hydrated ? storeStreak : 0;
  const bestStreak = hydrated ? storeBest : 0;
  const totals = hydrated
    ? selectTotals(storeRadio)
    : { totalScore: 0, scenariosCompleted: 0, firstTryClears: 0 };
  const needsReview = hydrated ? selectNeedsReview(storeRadio) : [];

  const completionPct = totals.scenariosCompleted / SCENARIOS.length;
  // bank the attitude indicator by completion (-25°..+25°), pitch by streak
  const bank = -25 + completionPct * 50;
  const pitch = Math.min(currentStreak * 1.5, 10);
  const heading = hydrated ? Math.round((totals.totalScore / (SCENARIOS.length * 100)) * 360) : 0;
  const altitude = hydrated ? 1500 + totals.totalScore * 4 : 1500;

  const reviewScenario =
    needsReview.length > 0 ? SCENARIO_BY_ID[needsReview[0]] : null;

  const isNewUser = !hydrated || totals.scenariosCompleted === 0;

  return (
    <div className="space-y-6">
      {/* ===== HERO ===== */}
      <div
        className="fc-glass fc-grain rounded-3xl p-5 sm:p-8 relative overflow-hidden animate-rise"
      >
        {/* corner screws */}
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <span className="fc-screw absolute bottom-3 left-3" />
        <span className="fc-screw absolute bottom-3 right-3" />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] items-center">
          {/* Left: copy + CTA / stats */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full fc-glass-soft px-3 py-1 text-gold text-[11px] font-mono tracking-[0.2em] mb-4 animate-rise"
              style={{ animationDelay: "0.1s" }}
            >
              <Radio className="size-3.5" /> FLIGHTCOURSE · RADIO CALL BUILDER
            </div>
            <h2
              className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-[1.05] tracking-tight animate-rise"
              style={{ animationDelay: "0.18s" }}
            >
              <span className="block">Build the call</span>
              <span className="block">
                before you{" "}
                <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
                  key the mic.
                </span>
              </span>
            </h2>
            <p
              className="text-sm sm:text-base text-slate-300/90 mt-3 max-w-xl leading-relaxed animate-rise"
              style={{ animationDelay: "0.26s" }}
            >
              Assemble real Cessna 172 radio calls block-by-block.{" "}
              <span className="text-sky-soft">FAA-accurate phraseology</span>, scored
              with streaks — the on-ramp before your first transmission.
            </p>

            {/* CTA row: Hear example + Start + Guide */}
            <div
              className="flex flex-wrap items-center gap-2 mt-5 animate-rise"
              style={{ animationDelay: "0.32s" }}
            >
              {isNewUser ? (
                <Button
                  onClick={() => onSelect(SCENARIOS[0].id)}
                  size="lg"
                  className="bg-gold text-navy hover:bg-gold/90 font-semibold h-12 px-6 text-base"
                >
                  <Play className="size-4" /> Start lesson 1
                </Button>
              ) : null}
              <Button
                onClick={() => speech.speak(EXAMPLE_CALL, { scenarioKey: "example-call" })}
                variant="outline"
                size="lg"
                className="border-sky/40 text-sky-soft hover:bg-sky/10 h-12 px-5"
              >
                <Volume2 className={cn("size-4", speech.speaking && "animate-pulse")} />
                {speech.speaking ? "Playing…" : "Hear an example call"}
              </Button>
              {onOpenGuide && (
                <Button
                  onClick={onOpenGuide}
                  variant="ghost"
                  size="lg"
                  className="text-slate-300 hover:text-white h-12 px-4"
                >
                  <BookOpen className="size-4" /> Phraseology guide
                </Button>
              )}
            </div>

            {/* Stats: only for returning users (new users see 0s = demotivating) */}
            {!isNewUser ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 animate-rise"
                style={{ animationDelay: "0.34s" }}
              >
                <HeroStat
                  icon={<Trophy className="size-4" />}
                  label="Total score"
                  value={`${totals.totalScore}`}
                  sub={`/ ${SCENARIOS.length * 100}`}
                  accent="text-sky-soft"
                />
                <HeroStat
                  icon={<Flame className="size-4" />}
                  label="Best streak"
                  value={`${bestStreak}`}
                  accent="text-gold"
                  glow
                />
                <HeroStat
                  icon={<CheckCircle2 className="size-4" />}
                  label="Scenarios"
                  value={`${totals.scenariosCompleted}`}
                  sub={`/ ${SCENARIOS.length}`}
                  accent="text-emerald-400"
                />
                <HeroStat
                  icon={<Navigation className="size-4" />}
                  label="Live streak"
                  value={`${currentStreak}`}
                  accent={currentStreak > 0 ? "text-gold" : "text-slate-400"}
                />
              </div>
            ) : (
              <div
                className="mt-5 inline-flex items-center gap-2 rounded-lg fc-glass-soft px-3 py-2 text-xs text-slate-300 animate-rise"
                style={{ animationDelay: "0.36s" }}
              >
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                12 scenarios · 2 readback challenges · no mic required
              </div>
            )}
          </div>

          {/* Right: instrument cluster */}
          <div
            className="flex justify-center lg:justify-end animate-rise"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="fc-bezel rounded-3xl p-4 sm:p-5 relative animate-float">
              <span className="fc-screw absolute top-2 left-2" />
              <span className="fc-screw absolute top-2 right-2" />
              <span className="fc-screw absolute bottom-2 left-2" />
              <span className="fc-screw absolute bottom-2 right-2" />
              <div className="rounded-full overflow-hidden ring-1 ring-black/40">
                <AttitudeIndicator bank={bank} pitch={pitch} size={236} />
              </div>
              <div className="flex items-center justify-between mt-3 px-1">
                <AltitudeTape altitude={altitude} />
                <div className="text-center">
                  <div className="text-[8px] font-mono text-sky-soft/60 tracking-widest">ATTITUDE</div>
                  <div className="font-mono text-xs text-sky-soft">
                    BANK {bank >= 0 ? "+" : ""}
                    {bank.toFixed(0)}°
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    tracks completion
                  </div>
                </div>
                <CompassRose heading={heading} size={62} />
              </div>
            </div>
          </div>
        </div>

        {/* bottom progress ribbon */}
        <div
          className="mt-6 flex items-center gap-3 animate-rise"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky via-sky-soft to-gold transition-[width] duration-700 ease-out"
              style={{ width: `${completionPct * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-slate-300 tabular-nums">
            {Math.round(completionPct * 100)}%
          </span>
        </div>
      </div>

      {/* ===== Practice weak spots (mastery surfacing) ===== */}
      {hydrated && reviewScenario && (
        <button
          onClick={() => onSelect(reviewScenario.id)}
          className="group w-full text-left rounded-2xl border border-amber-400/40 bg-amber-400/[0.07] hover:bg-amber-400/[0.12] hover:border-amber-400/60 transition-all p-4 flex items-center gap-3"
        >
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-300 shrink-0">
            <Target className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-amber-300 text-[10px] font-mono tracking-widest mb-0.5">
              <AlertCircle className="size-3" /> PRACTICE WEAK SPOTS
            </div>
            <div className="font-display font-semibold text-slate-100 leading-tight">
              Review: {reviewScenario.title}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {needsReview.length} scenario{needsReview.length > 1 ? "s" : ""} not yet first-tried
              — clear one cleanly to grow your streak.
            </div>
          </div>
          <ArrowRight className="size-5 text-amber-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ===== Scenario list ===== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gold" />
            Scenarios
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {hydrated ? totals.scenariosCompleted : 0} / {SCENARIOS.length} cleared
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SCENARIOS.map((sc, i) => {
            const r = hydrated ? results[sc.id] : undefined;
            const done = !!r?.completed;
            const firstTry = !!r?.firstTryClear;
            const best = r?.bestScore ?? 0;
            const isReadback = sc.type === "readback";
            return (
              <button
                key={sc.id}
                onClick={() => onSelect(sc.id)}
                style={{ animationDelay: `${Math.min(i * 0.035, 0.4)}s` }}
                className={cn(
                  "group relative text-left rounded-2xl border p-4 transition-all overflow-hidden animate-rise hover:-translate-y-1",
                  done
                    ? "border-emerald-500/30 bg-emerald-500/[0.06] hover:border-emerald-400/60"
                    : "border-white/10 fc-glass-soft hover:border-gold/50",
                )}
              >
                {/* hover sheen */}
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-gold/5 to-transparent" />
                <div className="flex items-start justify-between gap-2 relative">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="font-mono text-[11px] text-slate-400">
                        {String(sc.index).padStart(2, "0")}
                      </span>
                      <Badge
                        className={cn(
                          "font-mono text-[10px] px-1.5 py-0",
                          isReadback
                            ? "bg-gold/15 border-gold/50 text-gold"
                            : "bg-sky/15 border-sky/50 text-sky-soft",
                        )}
                      >
                        {isReadback ? (
                          <>
                            <Ear className="size-2.5" /> READBACK
                          </>
                        ) : (
                          <>
                            <Radio className="size-2.5" /> CALL
                          </>
                        )}
                      </Badge>
                      {done && (
                        <Badge className="bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-mono text-[10px] px-1.5 py-0">
                          {firstTry ? (
                            <>
                              <Star className="size-2.5" /> {best}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-2.5" /> {best}
                            </>
                          )}
                        </Badge>
                      )}
                      {done && !firstTry && (
                        <Badge className="bg-amber-400/15 border-amber-400/40 text-amber-300 font-mono text-[10px] px-1.5 py-0">
                          <Target className="size-2.5" /> REVIEW
                        </Badge>
                      )}
                    </div>
                    <div className="font-display font-semibold text-slate-100 leading-tight">
                      {sc.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{sc.subtitle}</div>
                  </div>
                  <div className="shrink-0 self-center text-slate-400 group-hover:text-gold transition-colors">
                    {done ? (
                      <CheckCircle2 className="size-5 text-emerald-400" />
                    ) : (
                      <ArrowRight className="size-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {hydrated && totals.scenariosCompleted > 0 && (
        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-300"
            onClick={() => {
              if (confirm("Reset all Radio Call Builder progress, streaks, and badges?")) {
                resetRadio();
              }
            }}
          >
            <RotateCcw className="size-3.5" /> Reset progress
          </Button>
        </div>
      )}
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  sub,
  accent = "text-sky-soft",
  glow = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("fc-stat px-3 py-2.5", glow && "ring-1 ring-gold/30")}>
      <div className={cn("flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-400 uppercase", accent)}>
        {icon}
        {label}
      </div>
      <div className="font-mono text-xl font-bold text-slate-100 mt-0.5">
        {value}
        {sub && <span className="text-slate-400 text-xs"> {sub}</span>}
      </div>
    </div>
  );
}
