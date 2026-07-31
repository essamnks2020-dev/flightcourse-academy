"use client";

import * as React from "react";
import { Plane, Radio, Gauge, ArrowRight, Navigation } from "lucide-react";

/**
 * FlightDeckCard — the hero's right column. A "living glass cockpit" that
 * shows a mini PFD (Primary Flight Display): heading tape, attitude
 * indicator, telemetry ticker, and a visual flight path with the 3
 * course phases. Not a static compass — it breathes.
 */
export function FlightDeckCard() {
  const [heading, setHeading] = React.useState(90);
  const [alt, setAlt] = React.useState(2000);
  const [ias, setIas] = React.useState(110);
  const [fuel, setFuel] = React.useState(38.2);
  const [phase, setPhase] = React.useState(0); // 0=start, 1=taxi, 2=takeoff, 3=climb

  // Animate the heading bug sweeping to 090 on mount (gyro spin-up)
  React.useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setHeading(Math.round(360 - (360 - 90) * (1 - eased) + 90 * eased) % 360);
      if (t < 1) raf = requestAnimationFrame(animate);
      else setHeading(90);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Live telemetry ticker — subtle drift to feel alive
  React.useEffect(() => {
    const id = setInterval(() => {
      setAlt((a) => a + Math.round((Math.random() - 0.5) * 4));
      setIas((s) => Math.max(0, s + Math.round((Math.random() - 0.5) * 2)));
      setFuel((f) => Math.max(0, f - 0.01));
      setPhase((p) => (p + 1) % 4);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Heading to rotation degrees: 0° = North (up), 90° = East (right)
  const headingDeg = heading;

  const FLIGHT_PATH = [
    { icon: Plane, label: "Engine start", active: phase === 0 },
    { icon: Navigation, label: "Taxi & takeoff", active: phase === 1 },
    { icon: Radio, label: "Radio calls", active: phase === 2 },
    { icon: Gauge, label: "IFR approach", active: phase === 3 },
  ];

  return (
    <div className="glass glow-primary relative flex flex-col gap-4 rounded-2xl p-5 overflow-hidden">
      {/* Background grid overlay — subtle HUD reticle */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.99 0.01 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.99 0.01 250) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header — aircraft data plate */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-primary/15 text-primary nums rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider">
            N172FC
          </span>
          <p className="label-instrument text-primary">Flight plan</p>
        </div>
        <span className="label-instrument text-muted-foreground">C172 · KSEA</span>
      </div>

      {/* PFD — Primary Flight Display */}
      <div className="relative flex items-center gap-3">
        {/* Attitude indicator (mini) */}
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 80 80" className="size-20">
            <defs>
              <clipPath id="pfd-clip">
                <circle cx="40" cy="40" r="28" />
              </clipPath>
              <linearGradient id="pfd-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.11 232)" />
                <stop offset="100%" stopColor="oklch(0.44 0.08 244)" />
              </linearGradient>
              <linearGradient id="pfd-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.44 0.06 60)" />
                <stop offset="100%" stopColor="oklch(0.28 0.045 55)" />
              </linearGradient>
            </defs>
            {/* Bezel */}
            <circle cx="40" cy="40" r="30" fill="oklch(0.18 0.02 255)" stroke="oklch(0.99 0.01 250 / 15%)" strokeWidth="1.5" />
            {/* Sky/ground split */}
            <g clipPath="url(#pfd-clip)">
              <rect x="0" y="0" width="80" height="80" fill="url(#pfd-sky)" />
              <rect x="0" y="42" width="80" height="38" fill="url(#pfd-ground)" />
              <line x1="10" y1="42" x2="70" y2="42" stroke="oklch(0.97 0.01 250)" strokeWidth="1.2" />
              {/* Pitch ladder */}
              <line x1="32" y1="36" x2="38" y2="35" stroke="oklch(0.97 0.01 250 / 40%)" strokeWidth="0.6" />
              <line x1="42" y1="35" x2="48" y2="36" stroke="oklch(0.97 0.01 250 / 40%)" strokeWidth="0.6" />
            </g>
            {/* Aircraft symbol */}
            <g stroke="oklch(0.79 0.152 74)" strokeWidth="2.5" strokeLinecap="round" fill="oklch(0.79 0.152 74)">
              <line x1="18" y1="42" x2="32" y2="42" />
              <line x1="48" y1="42" x2="62" y2="42" />
              <circle cx="40" cy="42" r="1.5" />
            </g>
            {/* Bank pointer */}
            <path d="M40 14 L37 18 L43 18 Z" fill="oklch(0.79 0.152 74)" />
          </svg>
        </div>

        {/* Heading tape + readout */}
        <div className="flex flex-1 flex-col gap-1.5">
          {/* Heading tape */}
          <div className="relative h-7 overflow-hidden rounded border border-border bg-background/60">
            <div
              className="absolute top-0 flex h-full items-center transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${-headingDeg * 1.2 + 60}px)` }}
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map((h) => (
                <div key={h} className="flex shrink-0 items-center" style={{ width: 36 }}>
                  <span className="nums text-[10px] text-muted-foreground">
                    {h === 0 ? "N" : h === 90 ? "E" : h === 180 ? "S" : h === 270 ? "W" : String(h).padStart(3, "0")}
                  </span>
                  <span className="mx-1 h-2 w-px bg-border" />
                </div>
              ))}
            </div>
            {/* Center indicator */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary" />
            <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-primary" />
          </div>
          {/* Heading readout */}
          <div className="flex items-baseline justify-between">
            <span className="nums text-2xl font-bold text-primary tabular-nums">
              {String(heading).padStart(3, "0")}°
            </span>
            <span className="label-instrument text-muted-foreground">HDG</span>
          </div>
        </div>
      </div>

      {/* Telemetry ticker — live data strip */}
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background/40 p-2.5">
        <TelemetryItem label="ALT" value={`${alt.toLocaleString()}`} unit="ft" />
        <TelemetryItem label="IAS" value={`${ias}`} unit="kt" />
        <TelemetryItem label="FUEL" value={fuel.toFixed(1)} unit="gal" />
      </div>

      {/* Visual flight path — the 4 phases */}
      <div className="relative">
        <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />
        <div
          className="absolute left-[14px] top-2 w-px bg-primary transition-all duration-1000 ease-out"
          style={{ height: `${((phase + 1) / 4) * 100}%` }}
        />
        <ul className="flex flex-col gap-2.5">
          {FLIGHT_PATH.map((p, i) => (
            <li key={p.label} className="relative flex items-center gap-3 pl-1">
              <span
                className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  p.active
                    ? "border-primary bg-primary/15 text-primary glow-primary"
                    : i < phase
                    ? "border-primary/40 bg-primary/5 text-primary/60"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <p.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span
                className={`text-xs leading-relaxed transition-colors ${
                  p.active ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {p.label}
              </span>
              {p.active && (
                <span className="ml-auto size-2 rounded-full bg-primary animate-pulse-ring" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TelemetryItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label-instrument text-muted-foreground text-[9px]">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="nums text-sm font-semibold tabular-nums">{value}</span>
        <span className="text-[9px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
