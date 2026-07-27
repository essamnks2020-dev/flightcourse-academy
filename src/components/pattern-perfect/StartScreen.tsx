"use client";

import { motion } from "framer-motion";
import { Plane, Wind, Trophy, Radio, BookOpen, Compass, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DIFFICULTY_OPTIONS,
  AIRPORT_OPTIONS,
  type AirportChoice,
  type ScenarioConfig,
} from "@/lib/data/pattern-scenarios";
import { AIRPORTS } from "@/lib/data/phraseology";
import type { Difficulty } from "@/lib/pattern/types";
import type { GameProgress } from "@/lib/store/progress-store";
import type { TimeOfDay } from "@/lib/pattern/render";
import { SettingsBar } from "./SettingsBar";

interface Props {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  rightTraffic: boolean;
  setRightTraffic: (b: boolean) => void;
  airportChoice: AirportChoice;
  setAirportChoice: (a: AirportChoice) => void;
  scenario: ScenarioConfig;
  freeAttempts: number;
  best?: GameProgress;
  onStart: () => void;
  onOpenDashboard: () => void;
  onOpenReference: () => void;
  onStartPracticalTest: () => void;
  practicalTestUnlocked: boolean;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 24 } },
};

export function StartScreen({
  difficulty,
  setDifficulty,
  rightTraffic,
  setRightTraffic,
  airportChoice,
  setAirportChoice,
  scenario,
  freeAttempts,
  best,
  onStart,
  onOpenDashboard,
  onOpenReference,
  onStartPracticalTest,
  practicalTestUnlocked,
  timeOfDay,
  setTimeOfDay,
  muted,
  setMuted,
}: Props) {
  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 py-6">
      {/* Settings bar (top-right floating) */}
      <div className="mb-4 flex justify-end">
        <SettingsBar timeOfDay={timeOfDay} setTimeOfDay={setTimeOfDay} muted={muted} setMuted={setMuted} />
      </div>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">
        {/* Hero */}
        <motion.div variants={item} className="flex flex-col items-center gap-3 text-center">
          {/* Illustrated hero asset (progressive enhancement — hidden if missing). */}
          <motion.img
            src="/art/hero-start.png"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none mb-2 max-h-56 w-full max-w-md rounded-2xl object-cover opacity-90"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
          >
            <Badge variant="outline" className="glass gap-1.5 border-gold/40 px-3 py-1 text-gold">
              <Plane className="h-3.5 w-3.5" /> FlightCourse · Mini-game 3
            </Badge>
          </motion.div>
          <motion.h1
            className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Pattern <span className="text-gradient-gold glow-text-gold">Perfect</span>
          </motion.h1>
          <motion.p
            className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Fly a clean, correctly-called, safely-sequenced traffic pattern around a
            non-towered airport. Nearly half of GA accidents happen in the pattern —
            so the procedure has to be right, not approximate.
          </motion.p>
        </motion.div>

        {/* Difficulty selector */}
        <motion.div variants={item}>
          <Card className="glass overflow-hidden p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky">
              <Compass className="h-4 w-4" /> Difficulty
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const active = opt.value === difficulty;
                return (
                  <motion.button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative overflow-hidden rounded-xl border p-3.5 text-left transition-colors ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-border bg-background/40 hover:border-sky/50"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="diff-glow"
                        className="absolute inset-0 -z-10 bg-gradient-to-br from-gold/15 to-transparent"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className="text-sm font-bold text-foreground">{opt.label}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {opt.blurb}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {AIRPORT_OPTIONS.map((opt) => {
                const active = opt.value === airportChoice;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setAirportChoice(opt.value);
                      // Keep the right-traffic toggle in sync with the airport's
                      // published direction so the geometry is always correct.
                      setRightTraffic(opt.value === "cedarlake");
                    }}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      active ? "border-sky bg-sky/10" : "border-border bg-background/40 hover:border-sky/50"
                    }`}
                  >
                    <div className="text-sm font-bold text-foreground">{opt.label}</div>
                    <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{opt.blurb}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="right-traffic"
                  checked={rightTraffic}
                  onCheckedChange={setRightTraffic}
                />
                <Label htmlFor="right-traffic" className="text-sm text-foreground">
                  Right-hand traffic
                </Label>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {scenario.runway.runwayNumber} · {scenario.runway.trafficDirection.toUpperCase()}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Briefing */}
        <motion.div variants={item}>
          <Card className="glass p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky">
              <BookOpen className="h-4 w-4" /> Pre-flight briefing
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{scenario.brief}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <BriefStat icon={<Compass className="h-3.5 w-3.5" />} label="Runway" value={`${scenario.runway.runwayNumber} · ${scenario.runway.trafficDirection}`} />
              <BriefStat icon={<Wind className="h-3.5 w-3.5" />} label="Wind" value={`${Math.round(scenario.wind.speedKt)} kt${scenario.wind.gustKt ? ` G${scenario.wind.gustKt}` : ""}`} />
              <BriefStat icon={<Radio className="h-3.5 w-3.5" />} label="CTAF" value={AIRPORTS[scenario.airportKey].ctaf} />
              <BriefStat icon={<Plane className="h-3.5 w-3.5" />} label="Callsign" value="N78A" />
            </div>
          </Card>
        </motion.div>

        {/* CTA row */}
        <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary" className="glass gap-1 px-3 py-1">
              <Trophy className="h-3.5 w-3.5 text-gold" />
              Best: {best?.completed ? `${best.bestScore}` : "—"}
            </Badge>
            <span className="text-muted-foreground">
              Free attempts: <span className="font-mono text-foreground">{freeAttempts}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onOpenReference} className="glass gap-1.5 border-border">
              <BookOpen className="h-4 w-4" /> Ground School
            </Button>
            <Button variant="outline" onClick={onOpenDashboard} className="glass border-border">
              Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={onStartPracticalTest}
              disabled={!practicalTestUnlocked}
              className="glass gap-1.5 border-border"
              title={practicalTestUnlocked ? "Formal assessment — solo difficulty, no pause, pass at 80+" : "Score 70+ in practice to unlock"}
            >
              <GraduationCap className="h-4 w-4" /> Practical Test
            </Button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button onClick={onStart} className="gap-1.5 bg-gradient-to-r from-gold to-gold-warm text-navy shadow-lg shadow-gold/30 hover:shadow-gold/50">
                Start flight <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function BriefStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-0.5 font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
