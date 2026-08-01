"use client";

import { ArrowRight, Check, Clock, Lock, Medal, Star, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNav } from "@/lib/nav-store";
import { BADGES, useProgress } from "@/lib/progress-store";
import { TOTAL_MODULES, TOTAL_XP, allModules } from "@/lib/data/modules";
import { cn } from "@/lib/utils";

const TIER_BLURB: Record<string, string> = {
  "Student Pilot":
    "You're at the start. Read module 1 to log your first hours.",
  "Private Pilot Track":
    "Cleared for solo. You've got the basics — patterns, radios, and weather are next.",
  "Instrument Track":
    "Flying on gauges now. Emergencies, navigation, and instrument approaches are on your plate.",
  Rated:
    "All sixteen modules done. You're rated — fly the pattern, plan a cross-country, brief a friend.",
};

const STAGES = [
  { name: "Stage 1 · Foundations", modules: allModules.slice(0, 4) },
  { name: "Stage 2 · Cockpit & Controls", modules: allModules.slice(4, 8) },
  { name: "Stage 3 · Navigation & Weather", modules: allModules.slice(8, 12) },
  { name: "Stage 4 · Advanced & Cross-Country", modules: allModules.slice(12, 16) },
];

export function ProgressView() {
  const {
    xp,
    badges,
    getCompletedCount,
    getLicenseTier,
    isModuleCompleted,
    resetProgress,
    certificateName,
    setCertificateName,
  } = useProgress();
  const { navigate, openModule } = useNav();

  const tier = getLicenseTier();
  const completedCount = getCompletedCount();

  function generateCertificate() {
    const name = certificateName || "Student Pilot";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const w = 1200, h = 850;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = "#F2B134";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, w - 80, h - 80);
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, w - 110, h - 110);

    // Title
    ctx.fillStyle = "#F2B134";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FlightCourse Academy", w / 2, 180);

    ctx.fillStyle = "#8B8F99";
    ctx.font = "18px monospace";
    ctx.fillText("FLIGHT SIMULATION TRAINING CERTIFICATE", w / 2, 220);

    // "Certificate of Completion"
    ctx.fillStyle = "#E9E7E0";
    ctx.font = "36px serif";
    ctx.fillText("Certificate of Completion", w / 2, 320);

    // "This certifies that"
    ctx.fillStyle = "#8B8F99";
    ctx.font = "20px sans-serif";
    ctx.fillText("This certifies that", w / 2, 400);

    // Name
    ctx.fillStyle = "#F2B134";
    ctx.font = "bold 52px serif";
    ctx.fillText(name, w / 2, 470);

    // Description
    ctx.fillStyle = "#E9E7E0";
    ctx.font = "20px sans-serif";
    ctx.fillText("has successfully completed all 16 modules of the", w / 2, 540);
    ctx.fillText("FlightCourse Academy ground-school curriculum", w / 2, 570);
    ctx.fillText("from cold cockpit to IFR approaches.", w / 2, 600);

    // Date
    ctx.fillStyle = "#8B8F99";
    ctx.font = "16px monospace";
    ctx.fillText(`Completed on ${date}`, w / 2, 680);

    // XP
    ctx.fillText(`${xp} XP earned · ${completedCount} modules completed`, w / 2, 710);

    // Disclaimer
    ctx.fillStyle = "#5a5e68";
    ctx.font = "12px sans-serif";
    ctx.fillText("For simulation training only — not a substitute for real-world flight instruction.", w / 2, 780);

    // Download
    const link = document.createElement("a");
    link.download = `FlightCourse-Certificate-${name.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const nextModule =
    allModules.find((m) => !isModuleCompleted(m.id)) ?? allModules[0];

  const isMaxed = xp >= TOTAL_XP;
  const percentToNextTier = isMaxed
    ? 100
    : Math.min(100, Math.max(0, (xp / TOTAL_XP) * 100));
  const percentComplete = Math.round((completedCount / TOTAL_MODULES) * 100);

  const stats = [
    { icon: Star, label: "Total XP", value: xp, sub: `of ${TOTAL_XP}` },
    {
      icon: Check,
      label: "Modules",
      value: completedCount,
      sub: `of ${TOTAL_MODULES}`,
    },
    {
      icon: Clock,
      label: "Flight hours",
      value: `${(xp / 10).toFixed(1)} h`,
      sub: "logged",
    },
    {
      icon: Medal,
      label: "Badges",
      value: badges.length,
      sub: `of ${BADGES.length}`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="flex animate-fade-up flex-col gap-3">
        <span className="label-instrument text-primary">Flight deck</span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          You are a {tier.name}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {TIER_BLURB[tier.name] ?? "Keep flying."}
        </p>
      </header>

      {/* Top progress card */}
      <section className="glass mt-8 flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium">
            {isMaxed
              ? "Top rank reached — Captain"
              : `${TOTAL_XP - xp} XP to next rank`}
          </p>
          <span className="nums text-sm text-primary">{xp} XP</span>
        </div>
        <Progress value={percentToNextTier} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <button
            onClick={() => navigate("path")}
            className="fp-toggle-btn self-start px-4 py-2 text-sm"
          >
            Continue training
            <ArrowRight className="size-4" />
          </button>
          <p className="text-sm text-muted-foreground">
            Next up: {nextModule.title}
          </p>
        </div>
      </section>

      {/* Stats grid */}
      <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass flex flex-col gap-2 rounded-xl p-5"
          >
            <stat.icon className="size-4 text-accent" />
            <dt className="label-instrument text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="flex items-baseline gap-2">
              <span className="nums text-2xl font-medium">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.sub}</span>
            </dd>
          </div>
        ))}
      </dl>

      {/* Syllabus progress */}
      <section className="mt-12 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Syllabus progress
          </h2>
          <span className="nums text-sm text-muted-foreground">
            {percentComplete}% complete
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {STAGES.map((stage) => {
            const done = stage.modules.filter((m) =>
              isModuleCompleted(m.id)
            ).length;
            const total = stage.modules.length;
            return (
              <div
                key={stage.name}
                className="glass flex flex-col gap-3 rounded-xl p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{stage.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {done}/{total}
                  </span>
                </div>
                <Progress value={total === 0 ? 0 : (done / total) * 100} />
                <ul className="flex flex-col gap-1">
                  {stage.modules.map((mod) => {
                    const isDone = isModuleCompleted(mod.id);
                    return (
                      <li key={mod.id}>
                        <button
                          onClick={() => openModule(mod.id)}
                          className="hover:text-foreground flex w-full items-center gap-2 text-left text-sm transition-colors"
                        >
                          {isDone ? (
                            <Check className="size-4 shrink-0 text-primary" />
                          ) : (
                            <span className="size-4 shrink-0 rounded-full border border-muted-foreground/50" />
                          )}
                          <span
                            className={cn(
                              "truncate",
                              isDone
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {mod.shortTitle}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="mt-12 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-xl font-semibold tracking-tight">Badges</h2>
          <span className="nums text-sm text-muted-foreground">
            {badges.length}/{BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((badge) => {
            const has = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={cn(
                  "glass flex flex-col gap-1.5 rounded-xl p-4",
                  has ? "border-primary/40" : "opacity-55"
                )}
              >
                <span
                  className={cn(
                    "label-instrument inline-flex items-center gap-1",
                    has ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {has ? (
                    "Earned"
                  ) : (
                    <>
                      <Lock className="size-3" />
                      Locked
                    </>
                  )}
                </span>
                <p className="text-sm font-medium leading-snug">
                  {badge.name}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certificate */}
      {completedCount >= 16 && (
        <section className="mt-12 flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-3">
            <h2 className="text-xl font-semibold tracking-tight">Certificate of Completion</h2>
          </div>
          <div className="glass glow-primary rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Award className="size-6 text-primary" />
                <div>
                  <p className="font-semibold tracking-tight">You completed all 16 modules!</p>
                  <p className="text-sm text-muted-foreground">Enter your name to generate a printable certificate.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Your full name"
                  defaultValue={certificateName || ""}
                  onChange={(e) => setCertificateName(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
                />
                <button
                  onClick={() => generateCertificate()}
                  className="fp-toggle-btn px-5 py-2 text-sm"
                >
                  <Award className="size-4" />
                  Generate certificate
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reset */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            if (
              confirm("Reset all progress? This cannot be undone.")
            )
              resetProgress();
          }}
          className="fp-outline-btn px-4 py-2 text-sm text-destructive"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
