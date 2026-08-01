"use client";

import * as React from "react";
import {
  Award,
  Flame,
  Trophy,
  CheckCircle2,
  Lock,
  Radio,
  Ear,
  Star,
  Download,
  ScrollText,
  Mic,
} from "lucide-react";
import { SCENARIOS } from "@/lib/scenarios";
import {
  useFlightStore,
  selectTotals,
  ACHIEVEMENT_CATALOG,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useHydrated } from "@/hooks/use-pointer";
import { cn } from "@/lib/utils";

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  "first-contact": <Radio className="size-5" />,
  "sharp-ears": <Ear className="size-5" />,
  "on-frequency": <Radio className="size-5" />,
  "readback-pro": <Ear className="size-5" />,
  "hot-streak-3": <Flame className="size-5" />,
  "streak-5": <Flame className="size-5" />,
  "streak-7": <Flame className="size-5" />,
  "mic-shy-no-more": <Mic className="size-5" />,
  "perfect-run": <Trophy className="size-5" />,
  "all-cleared": <CheckCircle2 className="size-5" />,
  "on-the-air": <Mic className="size-5" />,
};

export function ProgressDashboard() {
  const hydrated = useHydrated();
  const radio = useFlightStore((s) => s.radio);
  const achievements = useFlightStore((s) => s.achievements);
  const results = radio.results;
  const totals = selectTotals(radio);
  const earnedIds = new Set(achievements.map((a) => a.id));
  const earnedCount = achievements.length;
  const maxScore = SCENARIOS.length * 100;
  const allComplete = hydrated && SCENARIOS.every((s) => results[s.id]?.completed);

  const [name, setName] = React.useState("");
  const [certUrl, setCertUrl] = React.useState("");

  const generateCert = async () => {
    const url = await drawCertificate({
      name: name.trim() || "Student Pilot",
      score: totals.totalScore,
      maxScore,
      streak: radio.bestStreak,
      scenariosCompleted: totals.scenariosCompleted,
      totalScenarios: SCENARIOS.length,
      allComplete,
    });
    setCertUrl(url);
  };

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="fc-glass fc-grain rounded-2xl p-5 relative animate-rise">
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <span className="fc-screw absolute bottom-3 left-3" />
        <span className="fc-screw absolute bottom-3 right-3" />
        <div className="flex items-center gap-2 text-gold text-xs font-mono tracking-widest mb-3">
          <Trophy className="size-4" /> PROGRESS DASHBOARD
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DashStat
            icon={<Trophy className="size-4" />}
            label="Total score"
            value={`${hydrated ? totals.totalScore : 0}`}
            sub={`/ ${maxScore}`}
          />
          <DashStat
            icon={<Flame className="size-4" />}
            label="Best streak"
            value={`${hydrated ? radio.bestStreak : 0}`}
            accent="text-gold"
          />
          <DashStat
            icon={<CheckCircle2 className="size-4" />}
            label="Scenarios"
            value={`${hydrated ? totals.scenariosCompleted : 0}`}
            sub={`/ ${SCENARIOS.length}`}
            accent="text-emerald-400"
          />
          <DashStat
            icon={<Award className="size-4" />}
            label="Badges"
            value={`${hydrated ? earnedCount : 0}`}
            sub={`/ ${ACHIEVEMENT_CATALOG.length}`}
            accent="text-sky-soft"
          />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Overall completion</span>
            <span className="font-mono">
              {hydrated ? Math.round((totals.scenariosCompleted / SCENARIOS.length) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={hydrated ? (totals.scenariosCompleted / SCENARIOS.length) * 100 : 0}
            className="h-2 bg-white/10 [&>[data-slot=progress-indicator]]:bg-sky"
          />
        </div>
      </div>

      {/* Badges */}
      <div className="fc-glass rounded-2xl p-5 relative">
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sky-soft text-xs font-mono tracking-widest">
            <Award className="size-4" /> BADGES
          </div>
          <span className="text-xs font-mono text-slate-400">
            {hydrated ? earnedCount : 0} / {ACHIEVEMENT_CATALOG.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACHIEVEMENT_CATALOG.map((def, i) => {
            const earned = hydrated && earnedIds.has(def.id);
            return (
              <div
                key={def.id}
                style={{ animationDelay: `${Math.min(i * 0.03, 0.4)}s` }}
                data-locked={earned ? undefined : "true"}
                className={cn(
                  "fc-pin p-3 animate-rise",
                  !earned && "opacity-70",
                )}
              >
                <div
                  className={cn(
                    "mb-1.5 grid place-items-center h-9 w-9 rounded-lg",
                    earned
                      ? "bg-gold/15 text-gold ring-1 ring-gold/40"
                      : "bg-white/5 text-slate-400 ring-1 ring-white/10",
                  )}
                >
                  {earned ? (
                    ACHIEVEMENT_ICONS[def.id] ?? <Award className="size-5" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-100 leading-tight">
                  {def.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {def.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario breakdown */}
      <div className="fc-glass rounded-2xl p-5 relative">
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <div className="flex items-center gap-2 text-sky-soft text-xs font-mono tracking-widest mb-3">
          <Radio className="size-4" /> SCENARIO BREAKDOWN
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto fc-scroll pr-1">
          {SCENARIOS.map((sc) => {
            const r = hydrated ? results[sc.id] : undefined;
            const done = !!r?.completed;
            const firstTry = !!r?.firstTryClear;
            const best = r?.bestScore ?? 0;
            const isRb = sc.type === "readback";
            return (
              <div
                key={sc.id}
                className="flex items-center gap-3 rounded-lg fc-glass-soft border border-white/8 px-3 py-2 hover:border-sky/30 transition-colors"
              >
                <span className="font-mono text-[11px] text-slate-400 w-6 shrink-0">
                  {String(sc.index).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-200 truncate">{sc.title}</span>
                    {isRb && (
                      <Ear className="size-3 text-gold shrink-0" />
                    )}
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        firstTry
                          ? "bg-gold"
                          : done
                            ? "bg-emerald-400"
                            : "bg-transparent",
                      )}
                      style={{ width: `${best}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {done ? (
                    <Badge
                      className={cn(
                        "font-mono text-[10px]",
                        firstTry
                          ? "bg-gold/15 border-gold/50 text-gold"
                          : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
                      )}
                    >
                      {firstTry ? <Star className="size-2.5" /> : <CheckCircle2 className="size-2.5" />}
                      {best}
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate */}
      <div className="fc-glass rounded-2xl p-5 relative">
        <span className="fc-screw absolute top-3 left-3" />
        <span className="fc-screw absolute top-3 right-3" />
        <div className="flex items-center gap-2 text-gold text-xs font-mono tracking-widest mb-3">
          <ScrollText className="size-4" /> CERTIFICATE OF COMPLETION
        </div>
        <p className="text-sm text-slate-300 mb-3">
          {allComplete
            ? "You've cleared every scenario. Generate your Radio Communications certificate."
            : "Clear all 12 scenarios to unlock the full certificate — or generate a progress certificate now."}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="bg-navy-700/40 border-white/10 text-slate-100 placeholder:text-slate-400 sm:max-w-xs"
          />
          <Button
            onClick={generateCert}
            className={cn(
              allComplete
                ? "bg-gold text-navy hover:bg-gold/90 font-semibold"
                : "bg-sky text-navy hover:bg-sky/90 font-semibold",
            )}
          >
            <Download className="size-4" /> {allComplete ? "Generate certificate" : "Progress certificate"}
          </Button>
        </div>
        {certUrl && (
          <div className="mt-4 space-y-2">
            <img
              src={certUrl}
              alt="FlightCourse Radio Communications certificate"
              className="w-full rounded-lg border border-sky/20"
            />
            <a
              href={certUrl}
              download="flightcourse-radio-certificate.png"
              className="inline-flex items-center gap-1.5 text-sm text-sky-soft hover:text-sky"
            >
              <Download className="size-4" /> Download PNG
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function DashStat({
  icon,
  label,
  value,
  sub,
  accent = "text-sky",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="fc-stat px-3 py-2.5">
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

async function drawCertificate(opts: {
  name: string;
  score: number;
  maxScore: number;
  streak: number;
  scenariosCompleted: number;
  totalScenarios: number;
  allComplete: boolean;
}): Promise<string> {
  if (typeof document === "undefined") return "";
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* noop */
  }
  const W = 1400;
  const H = 1000;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return "";

  // bg
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0B1D3A");
  bg.addColorStop(1, "#081227");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // border frame
  ctx.strokeStyle = "#F2B134";
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = "rgba(62,146,204,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  // header
  ctx.fillStyle = "#3E92CC";
  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("FLIGHTCOURSE", W / 2, 130);
  ctx.fillStyle = "rgba(219,234,246,0.6)";
  ctx.font = "400 18px Inter, sans-serif";
  ctx.fillText("Cessna 172 · Beginner Pilot Training", W / 2, 160);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 52px Sora, sans-serif";
  ctx.fillText(
    opts.allComplete ? "Certificate of Completion" : "Progress Certificate",
    W / 2,
    240,
  );

  ctx.fillStyle = "rgba(219,234,246,0.7)";
  ctx.font = "400 20px Inter, sans-serif";
  ctx.fillText("This is presented to", W / 2, 300);

  ctx.fillStyle = "#F2B134";
  ctx.font = "800 64px Sora, sans-serif";
  ctx.fillText(opts.name, W / 2, 372);

  ctx.fillStyle = "rgba(219,234,246,0.85)";
  ctx.font = "400 22px Inter, sans-serif";
  ctx.fillText(
    opts.allComplete
      ? "for completing all 12 Radio Call Builder scenarios with FAA-accurate phraseology"
      : "for progress in the Radio Call Builder ATC phraseology trainer",
    W / 2,
    420,
  );

  // stats row
  const stats = [
    { label: "SCORE", value: `${opts.score} / ${opts.maxScore}` },
    { label: "BEST STREAK", value: `${opts.streak}` },
    { label: "SCENARIOS", value: `${opts.scenariosCompleted} / ${opts.totalScenarios}` },
  ];
  const sy = 520;
  stats.forEach((s, i) => {
    const x = W / 4 + i * (W / 4);
    ctx.fillStyle = "rgba(62,146,204,0.12)";
    ctx.beginPath();
    ctx.arc(x, sy, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5BFF9B";
    ctx.font = "800 30px 'JetBrains Mono', monospace";
    ctx.fillText(s.value, x, sy + 8);
    ctx.fillStyle = "rgba(219,234,246,0.6)";
    ctx.font = "500 14px 'JetBrains Mono', monospace";
    ctx.fillText(s.label, x, sy + 44);
  });

  // phraseology line
  ctx.fillStyle = "rgba(219,234,246,0.6)";
  ctx.font = "italic 400 20px Inter, sans-serif";
  ctx.fillText(
    "\u201cSay what you mean, mean what you say.\u201d  — AIM 4-2",
    W / 2,
    700,
  );

  // signatures
  ctx.fillStyle = "rgba(219,234,246,0.8)";
  ctx.font = "600 20px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FlightCourse Chief CFI", 200, 880);
  ctx.strokeStyle = "rgba(219,234,246,0.4)";
  ctx.beginPath();
  ctx.moveTo(200, 850);
  ctx.lineTo(520, 850);
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.fillText("Date", W - 200, 880);
  ctx.beginPath();
  ctx.moveTo(W - 520, 850);
  ctx.lineTo(W - 200, 850);
  ctx.stroke();
  ctx.fillStyle = "rgba(219,234,246,0.6)";
  ctx.font = "400 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    W - 360,
    878,
  );

  // footer
  ctx.fillStyle = "rgba(62,146,204,0.5)";
  ctx.font = "500 14px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("flightcourse.app/radio · Built on FAA AIM 4-2 · 4-3 · 6-3", W / 2, 950);

  return c.toDataURL("image/png");
}
