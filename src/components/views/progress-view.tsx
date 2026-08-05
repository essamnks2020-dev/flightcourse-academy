"use client";

import { ArrowRight, Check, Clock, Flame, Lock, Medal, Star, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GaugeRing } from "@/components/gauge-ring";
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
    currentStreak,
    bestStreak,
  } = useProgress();
  const { navigate, openModule } = useNav();

  const tier = getLicenseTier();
  const completedCount = getCompletedCount();

  function generateCertificate() {
    const name = certificateName || "Student Pilot";
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const w = 1400, h = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = w / 2;

    // ═══ BACKGROUND ═══
    // Deep navy with subtle radial vignette
    const bgGrad = ctx.createRadialGradient(cx, h / 2, 200, cx, h / 2, 800);
    bgGrad.addColorStop(0, "#0f1828");
    bgGrad.addColorStop(1, "#080d18");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ═══ BORDER SYSTEM ═══
    // Outer thin border
    ctx.strokeStyle = "rgba(242, 177, 52, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, w - 100, h - 100);

    // Inner thicker border
    ctx.strokeStyle = "rgba(242, 177, 52, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(65, 65, w - 130, h - 130);

    // Innermost hairline
    ctx.strokeStyle = "rgba(242, 177, 52, 0.15)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(75, 75, w - 150, h - 150);

    // Corner ornaments (subtle L-shaped marks)
    ctx.strokeStyle = "rgba(242, 177, 52, 0.4)";
    ctx.lineWidth = 1.5;
    const cornerLen = 30;
    const cornerOff = 65;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(cornerOff, cornerOff + cornerLen);
    ctx.lineTo(cornerOff, cornerOff);
    ctx.lineTo(cornerOff + cornerLen, cornerOff);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - cornerOff - cornerLen, cornerOff);
    ctx.lineTo(w - cornerOff, cornerOff);
    ctx.lineTo(w - cornerOff, cornerOff + cornerLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cornerOff, h - cornerOff - cornerLen);
    ctx.lineTo(cornerOff, h - cornerOff);
    ctx.lineTo(cornerOff + cornerLen, h - cornerOff);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - cornerOff - cornerLen, h - cornerOff);
    ctx.lineTo(w - cornerOff, h - cornerOff);
    ctx.lineTo(w - cornerOff, h - cornerOff - cornerLen);
    ctx.stroke();

    // ═══ HEADER ═══
    // Small attitude indicator mark (simplified)
    const markY = 145;
    const markR = 22;
    ctx.save();
    ctx.translate(cx, markY);
    // Bezel
    ctx.beginPath();
    ctx.arc(0, 0, markR, 0, Math.PI * 2);
    ctx.fillStyle = "#111927";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 177, 52, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Sky half
    ctx.beginPath();
    ctx.arc(0, 0, markR - 3, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = "rgba(62, 146, 204, 0.3)";
    ctx.fill();
    // Ground half
    ctx.beginPath();
    ctx.arc(0, 0, markR - 3, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = "rgba(107, 91, 61, 0.3)";
    ctx.fill();
    // Horizon line
    ctx.beginPath();
    ctx.moveTo(-markR + 3, 0);
    ctx.lineTo(markR - 3, 0);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Aircraft symbol
    ctx.beginPath();
    ctx.moveTo(-8, 1);
    ctx.lineTo(-2, 0);
    ctx.moveTo(2, 0);
    ctx.lineTo(8, -1);
    ctx.strokeStyle = "#F2B134";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#F2B134";
    ctx.fill();
    ctx.restore();

    // Brand name
    ctx.fillStyle = "#E9E7E0";
    ctx.font = "600 28px 'Instrument Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FlightCourse Academy", cx, markY + 50);

    // Subtitle
    ctx.fillStyle = "rgba(139, 143, 153, 0.7)";
    ctx.font = "400 11px 'JetBrains Mono', monospace";
    ctx.fillText("FLIGHT SIMULATION GROUND SCHOOL", cx, markY + 72);

    // ═══ DIVIDER ═══
    const divY = 260;
    ctx.beginPath();
    ctx.moveTo(cx - 120, divY);
    ctx.lineTo(cx - 20, divY);
    ctx.moveTo(cx + 20, divY);
    ctx.lineTo(cx + 120, divY);
    ctx.strokeStyle = "rgba(242, 177, 52, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Center dot
    ctx.beginPath();
    ctx.arc(cx, divY, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(242, 177, 52, 0.5)";
    ctx.fill();

    // ═══ CERTIFICATE TITLE ═══
    ctx.fillStyle = "#E9E7E0";
    ctx.font = "600 42px 'Instrument Sans', sans-serif";
    ctx.fillText("Certificate of Completion", cx, 330);

    // ═══ "This is to certify that" ═══
    ctx.fillStyle = "rgba(139, 143, 153, 0.8)";
    ctx.font = "400 16px 'Instrument Sans', sans-serif";
    ctx.fillText("This is to certify that", cx, 400);

    // ═══ NAME ═══
    ctx.fillStyle = "#F2B134";
    ctx.font = "600 56px 'Instrument Sans', sans-serif";
    ctx.fillText(name, cx, 475);

    // Underline beneath name
    const nameWidth = ctx.measureText(name).width;
    ctx.beginPath();
    ctx.moveTo(cx - nameWidth / 2 - 20, 495);
    ctx.lineTo(cx + nameWidth / 2 + 20, 495);
    ctx.strokeStyle = "rgba(242, 177, 52, 0.2)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // ═══ DESCRIPTION ═══
    ctx.fillStyle = "#E9E7E0";
    ctx.font = "400 18px 'Instrument Sans', sans-serif";
    ctx.fillText("has successfully completed all 16 modules of the", cx, 555);
    ctx.fillText("FlightCourse Academy ground-school curriculum,", cx, 583);
    ctx.fillText("from cold cockpit startup through IFR approaches.", cx, 611);

    // ═══ STATS ROW ═══
    const statsY = 680;
    ctx.fillStyle = "rgba(139, 143, 153, 0.6)";
    ctx.font = "400 11px 'JetBrains Mono', monospace";
    ctx.fillText("MODULES COMPLETED", cx - 180, statsY);
    ctx.fillText("XP EARNED", cx, statsY);
    ctx.fillText("DATE", cx + 180, statsY);

    ctx.fillStyle = "#E9E7E0";
    ctx.font = "500 24px 'JetBrains Mono', monospace";
    ctx.fillText("16 / 16", cx - 180, statsY + 30);
    ctx.fillText(`${xp}`, cx, statsY + 30);
    ctx.font = "400 14px 'Instrument Sans', sans-serif";
    ctx.fillText(date, cx + 180, statsY + 28);

    // ═══ GOLD SEAL ═══
    const sealY = 800;
    const sealR = 35;
    ctx.save();
    ctx.translate(cx, sealY);
    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, sealR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(242, 177, 52, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, sealR - 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(242, 177, 52, 0.08)";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 177, 52, 0.2)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Star/diamond in center
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fillStyle = "rgba(242, 177, 52, 0.6)";
    ctx.fill();
    ctx.restore();

    // ═══ DISCLAIMER ═══
    ctx.fillStyle = "rgba(90, 94, 104, 0.6)";
    ctx.font = "400 11px 'Instrument Sans', sans-serif";
    ctx.fillText("This certificate is for simulation training purposes only and does not constitute", cx, 880);
    ctx.fillText("certification by the FAA or any aviation authority. Not a substitute for real-world flight instruction.", cx, 898);

    // ═══ DOWNLOAD ═══
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

      {/* Top progress cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="glass flex flex-col gap-4 rounded-2xl p-6">
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
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Flame
            className={cn(
              "size-4",
              currentStreak > 0 ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          <p className="text-sm">
            {currentStreak > 0 ? (
              <>
                <span className="nums font-semibold text-primary">{currentStreak}</span>
                {" "}-day study streak
              </>
            ) : (
              "Study today to start a streak"
            )}
          </p>
          <span className="label-instrument ml-auto text-muted-foreground">
            Best {bestStreak}
          </span>
        </div>
        </div>
        <div className="glass flex items-center justify-center rounded-2xl p-5">
          <GaugeRing
            value={percentComplete}
            size={128}
            label={`${completedCount}/${TOTAL_MODULES}`}
            sublabel="Syllabus"
          />
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
          {BADGES.map((badge, i) => {
            const has = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={cn(
                  "glass flex flex-col gap-1.5 rounded-xl p-4",
                  has ? "border-primary/40 animate-badge-stamp" : "opacity-55"
                )}
                style={has ? { animationDelay: `${i * 60}ms` } : undefined}
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
