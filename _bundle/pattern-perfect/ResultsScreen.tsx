"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Share2,
  Download,
  Trophy,
  AlertTriangle,
  Check,
  X,
  Radio,
  Home,
  Sparkles,
  MessageSquareQuote,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FlightResult, CheckpointResult, PatternGeometry } from "@/lib/pattern/types";
import type { ScenarioConfig } from "@/lib/data/pattern-scenarios";
import { generateShareCard } from "@/lib/pattern/share-card";
import { useProgressStore } from "@/lib/store/progress-store";
import { trackFunnel } from "@/lib/funnel";

interface Props {
  result: FlightResult;
  scenario: ScenarioConfig;
  geo: PatternGeometry;
  onReplay: () => void;
  onHome: () => void;
}

const GRADE_STYLES: Record<FlightResult["grade"], { color: string; ring: string; emoji: string }> = {
  textbook: { color: "text-gold", ring: "ring-gold/50", emoji: "✦" },
  solid: { color: "text-sky", ring: "ring-sky/50", emoji: "✓" },
  "needs-work": { color: "text-muted-foreground", ring: "ring-border", emoji: "•" },
  redo: { color: "text-destructive", ring: "ring-destructive/50", emoji: "!" },
};

export function ResultsScreen({ result, scenario, geo, onReplay, onHome }: Props) {
  const shareUrl = useMemo(
    () => generateShareCard(geo, result.trail, result, scenario),
    [geo, result, scenario],
  );
  const [shared, setShared] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const claimShareBonus = useProgressStore((s) => s.claimShareBonus);
  const shareBonusClaimed = useProgressStore((s) => s.shareBonusClaimed);

  // Animated count-up for the score.
  useEffect(() => {
    const target = result.totalScore;
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result.totalScore]);

  // AI CFI debrief — grounded in the real FlightResult, with the deterministic
  // `why` as the guaranteed fallback if the API fails or is slow.
  const [aiDebrief, setAiDebrief] = useState<string | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setDebriefLoading(true);
    setAiDebrief(null);
    fetch("/api/debrief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalScore: result.totalScore,
        grade: result.grade,
        flightTimeSec: result.flightTimeSec,
        conflicts: result.conflicts,
        nearMiss: result.nearMiss,
        goAroundRecovered: result.goAroundRecovered,
        completedPattern: result.completedPattern,
        airport: scenario.airportKey.includes("cedar") ? "Cedar Lake" : scenario.airportKey.includes("meadow") ? "Meadowfield" : "Riverside",
        difficulty: scenario.difficulty,
        checkpoints: result.checkpoints.map((c) => ({ label: c.label, category: c.category, score: c.score, detail: c.detail, passed: c.passed })),
        radioCalls: result.radioCalls.map((r) => ({ position: r.position, correct: r.correct, banned: r.banned })),
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("debrief failed"))))
      .then((data) => { if (!cancelled && data?.debrief) setAiDebrief(data.debrief); })
      .catch(() => { /* silent — deterministic why is the fallback */ })
      .finally(() => { if (!cancelled) setDebriefLoading(false); });
    return () => { cancelled = true; };
  }, [result, scenario.airportKey, scenario.difficulty]);

  const categories = useMemo(() => {
    const order: CheckpointResult["category"][] = [
      "entry",
      "track",
      "altitude",
      "turn-timing",
      "radio",
      "sequencing",
    ];
    const labels: Record<CheckpointResult["category"], string> = {
      entry: "Entry",
      track: "Ground track",
      altitude: "Altitude",
      "turn-timing": "Turn timing",
      radio: "Radio calls",
      sequencing: "Sequencing",
    };
    return order.map((cat) => ({
      cat,
      label: labels[cat],
      items: result.checkpoints.filter((c) => c.category === cat),
    }));
  }, [result]);

  const doShare = async () => {
    trackFunnel("share-tapped", { data: { grade: result.grade, score: result.totalScore } });
    if (!shareBonusClaimed) claimShareBonus();
    setShared(true);
    try {
      if (shareUrl) {
        const res = await fetch(shareUrl);
        const blob = await res.blob();
        const file = new File([blob], "flightcourse-pattern.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "My Pattern Perfect flight" });
          return;
        }
      }
      downloadCard();
    } catch {
      downloadCard();
    }
  };

  const downloadCard = () => {
    if (!shareUrl) return;
    const a = document.createElement("a");
    a.href = shareUrl;
    a.download = "flightcourse-pattern.png";
    a.click();
  };

  const style = GRADE_STYLES[result.grade];
  const isTextbook = result.grade === "textbook";

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-6">
      {/* Celebratory particles for textbook */}
      {isTextbook && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-gold"
              initial={{
                x: "50%",
                y: "20%",
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 90}%`,
                y: `${20 + Math.random() * 60}%`,
                opacity: [1, 1, 0],
                scale: [0, 1.4, 0],
              }}
              transition={{ duration: 1.6 + Math.random(), delay: 0.3 + Math.random() * 0.6, repeat: Infinity, repeatDelay: 1.5 }}
              style={{ boxShadow: "0 0 8px rgba(242,177,52,0.8)" }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-5"
      >
        {/* Grade header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          <Card className={`glass-strong relative overflow-hidden border-0 p-6 ring-1 ${style.ring}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Flight complete · {scenario.label}
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                  className={`font-display text-4xl font-extrabold sm:text-5xl ${style.color} ${isTextbook ? "glow-text-gold count-glow" : ""}`}
                >
                  {result.gradeLabel}
                </motion.div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{result.why}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-mono text-6xl font-bold text-foreground">
                    {displayScore}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    / 100
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CFI debrief (AI-generated, grounded in real data; deterministic why is the fallback) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass border-sky/25 p-4">
            <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-sky">
              <MessageSquareQuote className="h-4 w-4" /> CFI debrief
            </div>
            {aiDebrief ? (
              <p className="text-sm leading-relaxed text-foreground">{aiDebrief}</p>
            ) : debriefLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-sky border-t-transparent" />
                Your instructor is reviewing the flight…
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">{result.why}</p>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              Deterministic summary: {result.why}
            </p>
          </Card>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Share card preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass overflow-hidden p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-foreground">Flight track</h3>
                <Badge variant="outline" className="glass gap-1 text-muted-foreground">
                  {result.trail.length} pts
                </Badge>
              </div>
              {shareUrl ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  src={shareUrl}
                  alt="Flight track share card"
                  className="w-full rounded-xl border border-border shadow-lg"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-border text-sm text-muted-foreground">
                  Generating track…
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button onClick={doShare} className="gap-1.5 bg-gradient-to-r from-gold to-gold-warm text-navy shadow-lg shadow-gold/30">
                    <Share2 className="h-4 w-4" /> Share track
                  </Button>
                </motion.div>
                <Button variant="outline" onClick={downloadCard} className="glass gap-1.5">
                  <Download className="h-4 w-4" /> Download
                </Button>
                {shared && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="self-center text-xs text-emerald-400"
                  >
                    <Sparkles className="mr-1 inline h-3 w-3" />+1 attempt earned
                  </motion.span>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Stats summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="glass h-full p-4">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat icon={<Trophy className="h-4 w-4 text-gold" />} label="Grade score" value={`${result.totalScore}/100`} />
                <Stat icon={<Radio className="h-4 w-4 text-sky" />} label="Radio calls" value={`${result.radioCalls.filter((r) => r.correct).length}/${result.radioCalls.length}`} />
                <Stat
                  icon={<AlertTriangle className={`h-4 w-4 ${result.nearMiss ? "text-destructive" : "text-muted-foreground"}`} />}
                  label="Spacing alerts"
                  value={`${result.conflicts}`}
                />
                <Stat icon={<RotateCcw className="h-4 w-4 text-muted-foreground" />} label="Flight time" value={`${Math.round(result.flightTimeSec)}s`} />
              </div>
              {result.nearMiss && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="glass rounded-lg border border-destructive/40 p-3 text-sm text-destructive">
                    <AlertTriangle className="mr-1 inline h-4 w-4" /> A critical spacing conflict
                    triggered a redo. Sequencing around traffic is the riskiest part of
                    the pattern — that&apos;s the whole teaching point.
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Checkpoint breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass p-4">
            <h3 className="mb-3 font-display text-sm font-semibold text-foreground">
              Checkpoint breakdown
            </h3>
            <div className="flex flex-col gap-4">
              {categories.map((group, gi) => (
                <motion.div
                  key={group.cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + gi * 0.08 }}
                >
                  <div className="mb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {group.items.map((c) => (
                      <CheckpointRow key={c.id} c={c} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <Button variant="outline" onClick={onHome} className="glass gap-1.5">
            <Home className="h-4 w-4" /> Back to start
          </Button>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button onClick={onReplay} className="gap-1.5 bg-gradient-to-r from-gold to-gold-warm text-navy shadow-lg shadow-gold/30">
              <RotateCcw className="h-4 w-4" /> Fly again
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CheckpointRow({ c }: { c: CheckpointResult }) {
  const pct = Math.round((c.score / 100) * 100);
  const passed = c.passed;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-2.5">
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
          passed ? "bg-emerald-400/15 text-emerald-400" : "bg-destructive/15 text-destructive"
        }`}
      >
        {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-foreground">{c.label}</span>
          <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="mt-1 h-1.5" />
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span className="uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 font-mono text-lg text-foreground">{value}</div>
    </div>
  );
}
