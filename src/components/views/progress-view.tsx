"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Trophy, Plane, Compass, Gauge, Radio, CloudSun, ShieldAlert, Route, Download, RotateCcw, Lock, Play } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { useProgress, BADGES, LICENSE_TIERS } from "@/lib/progress-store";
import { allModules, TOTAL_MODULES } from "@/lib/data/modules";
import { GaugeRing } from "@/components/gauge-ring";
import { FlightCourseLogo } from "@/components/navbar";
import { cn } from "@/lib/utils";

const BADGE_ICONS: Record<string, React.ElementType> = {
  "plane-takeoff": Plane,
  "gauge": Gauge,
  "arrow-up": Plane,
  "arrow-down": Plane,
  "radio": Radio,
  "cloud-sun": CloudSun,
  "shield-alert": ShieldAlert,
  "route": Route,
  "award": Award,
};

export function ProgressView() {
  const navigate = useNav((s) => s.navigate);
  const openModule = useNav((s) => s.openModule);
  const xp = useProgress((s) => s.xp);
  const badges = useProgress((s) => s.badges);
  const completedCount = useProgress((s) => s.getCompletedCount());
  const isCompleted = useProgress((s) => s.isModuleCompleted);
  const getProgress = useProgress((s) => s.getModuleProgress);
  const resetProgress = useProgress((s) => s.resetProgress);
  const certificateName = useProgress((s) => s.certificateName);
  const setCertificateName = useProgress((s) => s.setCertificateName);
  const licenseTier = useProgress((s) => s.getLicenseTier());

  const [name, setName] = React.useState(certificateName || "");
  const [showReset, setShowReset] = React.useState(false);
  const certificateRef = React.useRef<HTMLCanvasElement>(null);

  const completionPct = (completedCount / TOTAL_MODULES) * 100;
  const allComplete = completedCount === TOTAL_MODULES;

  // Find next incomplete module for "resume"
  const nextModule = allModules.find((m) => !isCompleted(m.id));

  function downloadCertificate() {
    const canvas = certificateRef.current;
    if (!canvas) return;
    const finalName = name.trim() || "Future Pilot";
    setCertificateName(finalName);
    drawCertificate(canvas, finalName, completedCount, xp);
    const link = document.createElement("a");
    link.download = `FlightCourse-Academy-Certificate-${finalName.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const licenseIdx = LICENSE_TIERS.findIndex((t) => t.name === licenseTier.name);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
          <Award className="w-4 h-4" />
          Your Flight Log
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Progress Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your hours, badges, and license progression. Everything saves
          automatically in your browser.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="fp-bezel bg-card p-5 flex flex-col items-center text-center">
          <GaugeRing value={completionPct} size={100} strokeWidth={7} label={`${Math.round(completionPct)}%`} sublabel="complete" color="var(--color-sky)" />
          <div className="text-xs font-mono text-muted-foreground mt-2">{completedCount} of {TOTAL_MODULES} modules</div>
        </div>
        <div className="fp-bezel bg-card p-5 flex flex-col justify-center">
          <Clock className="w-6 h-6 text-gold mb-2" />
          <div className="font-heading font-bold text-3xl text-gold">{(xp / 10).toFixed(1)}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">hours logged</div>
        </div>
        <div className="fp-bezel bg-card p-5 flex flex-col justify-center">
          <Trophy className="w-6 h-6 text-gold mb-2" />
          <div className="font-heading font-bold text-3xl text-gold">{badges.length}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">badges earned</div>
        </div>
        <div className="fp-bezel bg-card p-5 flex flex-col justify-center">
          <Compass className="w-6 h-6 mb-2" style={{ color: licenseTier.color }} />
          <div className="font-heading font-bold text-lg leading-tight" style={{ color: licenseTier.color }}>{licenseTier.name}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">current tier</div>
        </div>
      </div>

      {/* Resume button */}
      {nextModule ? (
        <div className="fp-bezel bg-gradient-to-r from-sky/5 to-transparent border-sky/30 p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-sky mb-1">Pick up where you left off</div>
            <h3 className="font-heading font-bold text-lg">{nextModule.title}</h3>
            <p className="text-sm text-muted-foreground">{nextModule.tagline}</p>
          </div>
          <button
            onClick={() => openModule(nextModule.id)}
            className="fp-toggle-btn px-5 py-3 text-sm flex items-center gap-2 flex-shrink-0"
          >
            <Play className="w-4 h-4" />
            Resume Module {nextModule.id}
          </button>
        </div>
      ) : (
        <div className="fp-bezel bg-gradient-to-r from-gold/10 to-transparent border-gold/40 p-5 mb-8 text-center">
          <Trophy className="w-10 h-10 text-gold mx-auto mb-2" />
          <h3 className="font-heading font-bold text-xl mb-1">All 16 modules complete!</h3>
          <p className="text-sm text-muted-foreground">You've earned your certificate. Download it below.</p>
        </div>
      )}

      {/* License progression */}
      <section className="mb-8">
        <h2 className="font-heading font-bold text-xl mb-4">License Progression</h2>
        <div className="fp-bezel bg-card p-5">
          <div className="relative flex justify-between items-center mb-4">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-sky to-gold -translate-y-1/2 transition-all duration-700"
              style={{ width: `${(licenseIdx / (LICENSE_TIERS.length - 1)) * 100}%` }}
            />
            {LICENSE_TIERS.map((tier, i) => {
              const reached = i <= licenseIdx;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                      reached ? "border-transparent" : "border-border bg-card"
                    )}
                    style={reached ? { backgroundColor: tier.color } : undefined}
                  >
                    {reached ? (
                      <span className="text-white font-mono font-bold text-xs">{i + 1}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className={cn("text-[10px] font-mono mt-2 text-center max-w-[80px]", reached ? "text-foreground" : "text-muted-foreground")}>
                    {tier.name}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Complete {LICENSE_TIERS[licenseIdx + 1]?.minModules - completedCount || 0} more module{LICENSE_TIERS[licenseIdx + 1] && (LICENSE_TIERS[licenseIdx + 1].minModules - completedCount) !== 1 ? "s" : ""} to reach {LICENSE_TIERS[licenseIdx + 1]?.name || "the top tier"}.
          </p>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-8">
        <h2 className="font-heading font-bold text-xl mb-4">Badges ({badges.length}/{BADGES.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const earned = badges.includes(badge.id);
            const Icon = BADGE_ICONS[badge.icon] || Award;
            return (
              <div
                key={badge.id}
                className={cn(
                  "fp-bezel p-4 text-center transition-all",
                  earned ? "bg-card" : "bg-muted/30 opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full border-2",
                    earned ? "border-gold bg-gold/10" : "border-border"
                  )}
                >
                  {earned ? (
                    <Icon className="w-6 h-6 text-gold" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className={cn("font-heading font-semibold text-xs mb-1", earned && "text-gold-dark dark:text-gold-light")}>
                  {badge.name}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{badge.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Module progress list */}
      <section className="mb-8">
        <h2 className="font-heading font-bold text-xl mb-4">Module Progress</h2>
        <div className="fp-bezel bg-card divide-y divide-border">
          {allModules.map((mod) => {
            const completed = isCompleted(mod.id);
            const progress = getProgress(mod.id);
            const inProgress = progress?.startedAt && !completed;
            return (
              <button
                key={mod.id}
                onClick={() => openModule(mod.id)}
                className="w-full flex items-center gap-4 p-3 hover:bg-sky/5 transition-colors text-left"
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold",
                    completed ? "bg-green-500 border-green-500 text-white" : inProgress ? "border-sky text-sky" : "border-border text-muted-foreground"
                  )}
                >
                  {completed ? <Check className="w-4 h-4" /> : mod.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-sm truncate">{mod.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {completed ? `Completed · Best score ${progress?.quizScore}/5` : inProgress ? "In progress" : "Not started"}
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground flex-shrink-0">
                  {completed ? `+${mod.xpReward / 10}h` : ""}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Certificate */}
      <section className="mb-8">
        <h2 className="font-heading font-bold text-xl mb-4">Completion Certificate</h2>
        {allComplete ? (
          <div className="fp-bezel bg-card p-6">
            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Your name (as it will appear on the certificate)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full max-w-sm px-3 py-2 bg-background border border-border text-sm focus:outline-none focus:border-sky"
              />
            </div>
            {/* Certificate preview */}
            <CertificatePreview name={name || "Your Name"} hours={(xp / 10).toFixed(1)} completedCount={completedCount} />
            <button
              onClick={downloadCertificate}
              className="fp-toggle-gold fp-toggle-btn px-6 py-3 text-sm flex items-center gap-2 mt-4"
            >
              <Download className="w-4 h-4" />
              Download Certificate (PNG)
            </button>
            <canvas ref={certificateRef} width={1200} height={850} className="hidden" />
          </div>
        ) : (
          <div className="fp-bezel bg-muted/30 p-8 text-center">
            <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg mb-1">Complete all 16 modules to unlock</h3>
            <p className="text-sm text-muted-foreground">
              You're {completedCount}/{TOTAL_MODULES} of the way there. Keep flying!
            </p>
          </div>
        )}
      </section>

      {/* Reset */}
      <section className="pt-6 border-t border-border">
        {showReset ? (
          <div className="fp-bezel bg-red-500/5 border-red-500/30 p-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm">Reset all progress? This cannot be undone — you'll lose all hours, badges, and quiz scores.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowReset(false)} className="fp-outline-btn px-3 py-1.5 text-xs">Cancel</button>
              <button
                onClick={() => { resetProgress(); setShowReset(false); }}
                className="px-3 py-1.5 text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all progress
          </button>
        )}
      </section>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return <Compass className={className} />;
}

function Check({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

// Certificate preview component (HTML/SVG visual)
function CertificatePreview({ name, hours, completedCount }: { name: string; hours: string; completedCount: number }) {
  return (
    <div className="border-4 border-double border-navy dark:border-sky p-6 sm:p-10 bg-cloud dark:bg-navy-deep text-center relative overflow-hidden">
      {/* Corner ornaments */}
      <div className="absolute top-2 left-2 w-12 h-12 border-l-2 border-t-2 border-gold" />
      <div className="absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 border-gold" />
      <div className="absolute bottom-2 left-2 w-12 h-12 border-l-2 border-b-2 border-gold" />
      <div className="absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 border-gold" />

      <div className="flex justify-center mb-4">
        <FlightCourseLogo className="w-16 h-16" />
      </div>
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sky mb-1">FlightCourse Academy</div>
      <div className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-6">From Zero to Wheels Up</div>
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Certificate of Completion</div>
      <h2 className="font-heading font-bold text-2xl sm:text-3xl mb-4 text-navy dark:text-cloud">Private Pilot Simulation Track</h2>
      <p className="text-sm text-muted-foreground mb-2">This certifies that</p>
      <p className="font-heading font-bold text-2xl sm:text-3xl text-gold mb-4">{name}</p>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        has successfully completed all {completedCount} modules of the FlightCourse Academy
        curriculum, demonstrating proficiency in cockpit operations, aerodynamics,
        navigation, radio communications, weather, and emergency procedures
        in a flight simulation environment.
      </p>
      <div className="flex justify-around items-center mt-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="font-mono text-sm border-t border-border pt-1 px-4">{hours} hours logged</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Flight Hours</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-sm border-t border-border pt-1 px-4">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Date</div>
        </div>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground mt-6 italic">
        For simulation training purposes only · Not a certified pilot rating
      </p>
    </div>
  );
}

// Draw certificate to canvas for download
function drawCertificate(canvas: HTMLCanvasElement, name: string, completedCount: number, xp: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1200, H = 850;
  ctx.fillStyle = "#F7F9FC";
  ctx.fillRect(0, 0, W, H);

  // Double border
  ctx.strokeStyle = "#0B1D3A";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(42, 42, W - 84, H - 84);

  // Corner ornaments (gold)
  ctx.strokeStyle = "#F2B134";
  ctx.lineWidth = 2;
  const cornerSize = 50;
  // Top-left
  ctx.beginPath(); ctx.moveTo(60, 60 + cornerSize); ctx.lineTo(60, 60); ctx.lineTo(60 + cornerSize, 60); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(W - 60 - cornerSize, 60); ctx.lineTo(W - 60, 60); ctx.lineTo(W - 60, 60 + cornerSize); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(60, H - 60 - cornerSize); ctx.lineTo(60, H - 60); ctx.lineTo(60 + cornerSize, H - 60); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(W - 60 - cornerSize, H - 60); ctx.lineTo(W - 60, H - 60); ctx.lineTo(W - 60, H - 60 - cornerSize); ctx.stroke();

  // Logo circle (compass)
  ctx.translate(W / 2, 130);
  ctx.strokeStyle = "#0B1D3A";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#F2B134";
  ctx.beginPath(); ctx.moveTo(-32, 0); ctx.lineTo(32, 0); ctx.stroke();
  ctx.strokeStyle = "#3E92CC";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-18, 8); ctx.quadraticCurveTo(0, -18, 18, 8); ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Title
  ctx.fillStyle = "#3E92CC";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.fillText("F L I G H T P A T H   A C A D E M Y", W / 2, 185);
  ctx.fillStyle = "#5B6B79";
  ctx.font = "10px monospace";
  ctx.fillText("FROM ZERO TO WHEELS UP", W / 2, 205);

  ctx.fillStyle = "#5B6B79";
  ctx.font = "bold 12px monospace";
  ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 250);

  ctx.fillStyle = "#0B1D3A";
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText("Private Pilot Simulation Track", W / 2, 300);

  ctx.fillStyle = "#5B6B79";
  ctx.font = "16px sans-serif";
  ctx.fillText("This certifies that", W / 2, 345);

  ctx.fillStyle = "#C88E1F";
  ctx.font = "bold 42px Georgia, serif";
  ctx.fillText(name, W / 2, 400);

  ctx.fillStyle = "#5B6B79";
  ctx.font = "15px sans-serif";
  const desc = `has successfully completed all ${completedCount} modules of the FlightCourse Academy`;
  const desc2 = "curriculum, demonstrating proficiency in cockpit operations, aerodynamics,";
  const desc3 = "navigation, radio communications, weather, and emergency procedures.";
  ctx.fillText(desc, W / 2, 445);
  ctx.fillText(desc2, W / 2, 468);
  ctx.fillText(desc3, W / 2, 491);

  // Signatures
  ctx.fillStyle = "#0B1D3A";
  ctx.font = "bold 18px monospace";
  ctx.fillText(`${(xp / 10).toFixed(1)} hours`, W / 2 - 180, 580);
  ctx.strokeStyle = "#0B1D3A";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 280, 560); ctx.lineTo(W / 2 - 80, 560); ctx.stroke();
  ctx.fillStyle = "#5B6B79";
  ctx.font = "10px monospace";
  ctx.fillText("FLIGHT HOURS LOGGED", W / 2 - 180, 600);

  ctx.fillStyle = "#0B1D3A";
  ctx.font = "bold 18px monospace";
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  ctx.fillText(dateStr, W / 2 + 180, 580);
  ctx.beginPath(); ctx.moveTo(W / 2 + 80, 560); ctx.lineTo(W / 2 + 280, 560); ctx.stroke();
  ctx.fillStyle = "#5B6B79";
  ctx.font = "10px monospace";
  ctx.fillText("DATE", W / 2 + 180, 600);

  // Footer
  ctx.fillStyle = "#5B6B79";
  ctx.font = "italic 11px monospace";
  ctx.fillText("For simulation training purposes only · Not a certified pilot rating", W / 2, 770);
}
