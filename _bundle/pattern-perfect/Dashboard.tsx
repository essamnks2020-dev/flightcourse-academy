"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Plane,
  Radio,
  PlaneTakeoff,
  Award,
  RotateCcw,
  ArrowLeft,
  Check,
  Lock,
  Sparkles,
  Gauge,
  Zap,
  Wind,
  Square,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useProgressStore,
  type GameId,
  type BadgeInfo,
} from "@/lib/store/progress-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  onBack: () => void;
  onPlay: () => void;
}

const GAME_META: Record<GameId, { icon: React.ReactNode; tag: string }> = {
  "landing-flare": { icon: <PlaneTakeoff className="h-5 w-5" />, tag: "Mini-game 1" },
  "radio-call": { icon: <Radio className="h-5 w-5" />, tag: "Mini-game 2" },
  "pattern-perfect": { icon: <Plane className="h-5 w-5" />, tag: "Mini-game 3" },
};

export function Dashboard({ onBack, onPlay }: Props) {
  const games = useProgressStore((s) => s.games);
  const freeAttempts = useProgressStore((s) => s.freeAttempts);
  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);
  const streak = useProgressStore((s) => s.streak);
  const bestStreak = useProgressStore((s) => s.bestStreak);
  const levelProgressFn = useProgressStore((s) => s.levelProgress);
  const focusAreasFn = useProgressStore((s) => s.focusAreas);
  const categoryHistory = useProgressStore((s) => s.categoryHistory);
  const badgesFn = useProgressStore((s) => s.badges);
  const previewComplete = useProgressStore((s) => s.previewComplete);
  const resetAll = useProgressStore((s) => s.resetAll);
  const events = useProgressStore((s) => s.events);
  const firstSoloUnlocked = useProgressStore((s) => s.isFirstSoloUnlocked());
  const badges = useMemo(() => badgesFn(), [badgesFn, games]);
  const levelProg = useMemo(() => levelProgressFn(), [levelProgressFn, xp, level]);
  const focusAreas = useMemo(() => focusAreasFn(), [focusAreasFn, categoryHistory]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 24 } },
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Progress <span className="text-gradient-gold">Dashboard</span>
          </h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-strong border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears completion records, badges, attempts and funnel counts
                  for all three mini-games. Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAll}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>

        {/* XP / Level / Streak progression */}
        <motion.div variants={item}>
          <Card className="glass p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="glass-gold flex h-14 w-14 flex-col items-center justify-center rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-gold">Lvl</span>
                  <span className="font-display text-2xl font-bold text-gold">{level}</span>
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-foreground">Pilot Progression</div>
                  <div className="text-xs text-muted-foreground">{xp.toLocaleString()} XP earned</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Level {level}</span>
                  <span className="font-mono">{levelProg.current}/{levelProg.needed} XP</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-warm"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProg.pct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <div className="font-mono text-2xl font-bold text-foreground">{streak}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Streak</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-muted-foreground">{bestStreak}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Best</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Focus-area callout — surfaces what the player repeatedly gets wrong */}
        {focusAreas.length > 0 && (
          <motion.div variants={item}>
            <Card className="glass border-gold/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gold">
                <Target className="h-4 w-4" /> Your focus areas
              </div>
              <div className="flex flex-wrap gap-2">
                {focusAreas.slice(0, 3).map((f) => (
                  <div key={f.category} className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
                    <span className="font-semibold text-foreground">{f.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      missed in {f.missCount}/5 recent · avg {f.recentAvg}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                These are the categories you&apos;ve scored below 55% most often. Fly again and focus on these.
              </p>
            </Card>
          </motion.div>
        )}

        {/* First Solo hero */}
        <motion.div variants={item}>
          <Card
            className={`glass-strong relative overflow-hidden border-0 p-6 ring-1 ${
              firstSoloUnlocked ? "ring-gold/50" : "ring-border"
            }`}
          >
            {firstSoloUnlocked && (
              <motion.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(242,177,52,0.18), transparent 70%)",
                }}
              />
            )}
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <motion.div
                animate={firstSoloUnlocked ? { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl ${
                  firstSoloUnlocked ? "glass-gold text-gold glow-gold" : "bg-muted text-muted-foreground"
                }`}
              >
                {firstSoloUnlocked ? <Award className="h-9 w-9" /> : <Lock className="h-7 w-7" />}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h2 className="font-display text-2xl font-bold text-foreground">First Solo</h2>
                  <AnimatePresence>
                    {firstSoloUnlocked && (
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 12 }}
                      >
                        <Badge className="gap-1 bg-gradient-to-r from-gold to-gold-warm text-navy">
                          <Sparkles className="h-3 w-3" /> Unlocked
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  The combined badge. Clear all three FlightCourse mini-games — the
                  Landing Flare Trainer, the Radio Call Builder, and Pattern Perfect —
                  in any order. Completion order doesn&apos;t matter; the logic checks all three.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {(["landing-flare", "radio-call", "pattern-perfect"] as GameId[]).map((g, i) => (
                    <motion.div
                      key={g}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <Badge
                        variant="outline"
                        className={`gap-1 ${
                          games[g].completed
                            ? "border-emerald-400/50 text-emerald-400"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {games[g].completed ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {GAME_META[g].tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Game badges grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges
            .filter((b) => b.id !== "first-solo")
            .map((b, i) => {
              const isGame = b.id === "landing-flare" || b.id === "radio-call" || b.id === "pattern-perfect";
              const gameId = isGame ? (b.id as GameId) : null;
              return (
                <motion.div key={b.id} variants={item} custom={i}>
                  <GameBadgeCard
                    badge={b}
                    best={gameId ? games[gameId].bestScore : undefined}
                    bestGrade={gameId ? games[gameId].bestGrade : undefined}
                    isPattern={b.id === "pattern-perfect"}
                    isAchievement={!isGame}
                    onPlay={onPlay}
                    onPreviewComplete={() => gameId && previewComplete(gameId)}
                  />
                </motion.div>
              );
            })}
        </div>

        {/* Activity */}
        <motion.div variants={item}>
          <Card className="glass p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky">
              <Gauge className="h-4 w-4" /> Activity
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                "flight-start",
                "radio-call-missed",
                "sequencing-conflict-triggered",
                "flight-complete",
                "share-tapped",
              ].map((ev, i) => (
                <motion.div
                  key={ev}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="rounded-lg border border-border bg-background/40 p-2 text-center"
                >
                  <div className="font-mono text-lg font-semibold text-foreground">{events[ev] ?? 0}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    {ev.replace(/-/g, " ")}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Free attempts remaining:{" "}
              <span className="font-mono text-foreground">{freeAttempts}</span> · share a
              flight track to earn a bonus attempt.
            </p>
          </Card>
        </motion.div>

        <p className="pb-4 text-center text-xs leading-relaxed text-muted-foreground">
          Pattern Perfect is fully playable. The Landing Flare Trainer and Radio Call
          Builder are part of the FlightCourse trilogy — use each card&apos;s
          &ldquo;simulate completion&rdquo; control to preview the First Solo badge.
        </p>
      </motion.div>
    </div>
  );
}

function GameBadgeCard({
  badge,
  best,
  bestGrade,
  isPattern,
  isAchievement,
  onPlay,
  onPreviewComplete,
}: {
  badge: BadgeInfo;
  best?: number;
  bestGrade?: string;
  isPattern: boolean;
  isAchievement?: boolean;
  onPlay: () => void;
  onPreviewComplete: () => void;
}) {
  const meta = GAME_META[badge.id as GameId];
  const [justSimulated, setJustSimulated] = useState(false);
  const achievementIcon: Record<string, React.ReactNode> = {
    "clean-rectangle": <Square className="h-5 w-5" />,
    "radio-perfect": <Radio className="h-5 w-5" />,
    "traffic-safe": <Wind className="h-5 w-5" />,
    "speed-demon": <Zap className="h-5 w-5" />,
  };
  const icon = isAchievement ? (achievementIcon[badge.id] ?? <Award className="h-5 w-5" />) : meta?.icon;
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card
        className={`flex h-full flex-col gap-3 p-4 ring-1 ${
          badge.unlocked ? "glass ring-emerald-400/30" : "glass ring-border"
        }`}
      >
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              badge.unlocked ? "glass-gold text-gold" : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </div>
          {badge.unlocked ? (
            <Badge className="gap-1 bg-emerald-400/15 text-emerald-400">
              <Check className="h-3 w-3" /> {isAchievement ? "Earned" : "Cleared"}
            </Badge>
          ) : (
            <Badge variant="outline" className="glass gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" /> Locked
            </Badge>
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {isAchievement ? "Achievement" : meta?.tag}
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">{badge.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{badge.description}</p>
        </div>
        {badge.unlocked && best !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-gold" />
            <span>
              Best: <span className="font-mono text-foreground">{best}/100</span>
              {bestGrade ? ` · ${bestGrade}` : ""}
            </span>
          </div>
        )}
        {isAchievement ? (
          <div className="mt-auto pt-1 text-center text-[11px] text-muted-foreground">
            {badge.unlocked ? "Unlocked by flying well" : "Earn it in a flight"}
          </div>
        ) : (
          <div className="mt-auto flex gap-2 pt-1">
            {isPattern ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full">
                <Button size="sm" onClick={onPlay} className="w-full gap-1 bg-gradient-to-r from-gold to-gold-warm text-navy shadow-lg shadow-gold/30">
                  <Plane className="h-3.5 w-3.5" /> {badge.unlocked ? "Play again" : "Play"}
                </Button>
              </motion.div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={badge.unlocked || justSimulated}
                onClick={() => {
                  onPreviewComplete();
                  setJustSimulated(true);
                }}
                className="glass w-full gap-1"
              >
                {badge.unlocked ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Simulated
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Simulate completion
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
