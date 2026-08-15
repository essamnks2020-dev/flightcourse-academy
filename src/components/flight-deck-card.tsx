"use client";

import * as React from "react";

/**
 * FlightDeckCard — a "living glass cockpit" for the hero section.
 * Ported from the AI-generated hero-deck-preview.html, rebuilt as a React
 * component using CSS variables so it adapts to theme changes.
 *
 * Features:
 * - SVG PFD (attitude indicator with pitch ladder, bank scale, aircraft symbol)
 * - Speed + altitude flanking tapes
 * - Heading tape with compass (gyro spin-up on mount)
 * - Live telemetry (ALT/IAS/FUEL — drifts to feel alive)
 * - Flight path timeline (4 phases, cycles every 12s)
 * - Zulu clock
 * - All colors use CSS vars — adapts to light/dark theme automatically
 */
export function FlightDeckCard() {
  const horizonRef = React.useRef<SVGGElement | null>(null);
  const rollPtrRef = React.useRef<SVGGElement | null>(null);
  const hdgTicksRef = React.useRef<SVGGElement | null>(null);
  const hdgValRef = React.useRef<HTMLSpanElement | null>(null);
  const vAltRef = React.useRef<HTMLSpanElement | null>(null);
  const vIasRef = React.useRef<HTMLSpanElement | null>(null);
  const vFuelRef = React.useRef<HTMLSpanElement | null>(null);
  const fillRef = React.useRef<HTMLLIElement | null>(null);
  const pctRef = React.useRef<HTMLSpanElement | null>(null);
  const clkRef = React.useRef<HTMLSpanElement | null>(null);
  const spdTapeRef = React.useRef<SVGGElement | null>(null);
  const altTapeRef = React.useRef<SVGGElement | null>(null);
  const stepRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const SVGNS = "http://www.w3.org/2000/svg";

  // Build static geometry on mount
  React.useEffect(() => {
    const mk = (t: string, a: Record<string, string>) => {
      const n = document.createElementNS(SVGNS, t);
      for (const k in a) n.setAttribute(k, a[k]);
      return n;
    };

    const PPD = 2.5;
    const ladder = document.getElementById("fc-ladder");
    if (ladder) {
      for (let d = -25; d <= 25; d += 5) {
        if (!d) continue;
        const major = d % 10 === 0, w = major ? 19 : 9, y = 88 - d * PPD;
        ladder.appendChild(mk("line", { x1: String(176 - w), y1: String(y), x2: String(176 + w), y2: String(y), opacity: major ? "0.8" : "0.5" }));
        if (major) [-1, 1].forEach(s => {
          const t = mk("text", { x: String(176 + s * (w + 6)), y: String(y + 2.4), "text-anchor": s < 0 ? "end" : "start", fill: "oklch(0.97 0.01 250 / 0.8)", "font-family": "JetBrains Mono", "font-size": "6.5" });
          t.textContent = String(Math.abs(d));
          ladder.appendChild(t);
        });
      }
    }

    const bank = document.getElementById("fc-bankScale");
    if (bank) {
      [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].forEach(a => {
        const len = Math.abs(a) % 30 === 0 ? 8 : 5;
        bank.appendChild(mk("line", { x1: "176", y1: "16", x2: "176", y2: String(16 + len), transform: `rotate(${a} 176 88)`, opacity: Math.abs(a) % 30 === 0 ? "0.75" : "0.45" }));
      });
    }

    // Flanking tick scales
    ([["fc-spdTape", 10, 40], ["fc-altTape", 312, 342]] as const).forEach(([id, x0, x1]) => {
      const g = document.getElementById(id);
      if (!g) return;
      for (let i = -8; i <= 8; i++) {
        const major = i % 2 === 0, y = 88 + i * 9;
        g.appendChild(mk("line", { x1: String(Number(x0) + (major ? 4 : 9)), y1: String(y), x2: String(Number(x1) - (major ? 4 : 9)), y2: String(y), opacity: major ? "0.6" : "0.3" }));
      }
    });

    // Heading tape
    const HPD = 2.15;
    const ticks = hdgTicksRef.current;
    const CARD: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W" };
    if (ticks) {
      for (let d = -80; d <= 440; d += 5) {
        const x = d * HPD, major = ((d % 30) + 30) % 30 === 0;
        ticks.appendChild(mk("line", { x1: String(x), y1: major ? "8" : "12", x2: String(x), y2: "19", stroke: "oklch(0.97 0.01 250 / 0.5)", "stroke-width": "1", "stroke-linecap": "round" }));
        if (major) {
          const n = ((d % 360) + 360) % 360, lab = CARD[n] ?? String(n / 10).padStart(2, "0");
          const t = mk("text", { x: String(x), y: "31", "text-anchor": "middle", fill: CARD[n] ? "var(--accent)" : "oklch(0.78 0.014 250)", "font-family": "JetBrains Mono", "font-size": CARD[n] ? "10" : "9", "font-weight": CARD[n] ? "600" : "400" });
          t.textContent = lab;
          ticks.appendChild(t);
        }
      }
    }
  }, []);

  // Animation loop
  React.useEffect(() => {
    let raf = 0;
    let A = 4520, I = 108, F = 78.4, tA = A, tI = I, tF = F;
    let lastPhase = -1;
    let lastHdg = "", lastAlt = "", lastIas = "";

    const interval = setInterval(() => {
      tA = 4380 + Math.random() * 300;
      tI = 101 + Math.random() * 13;
      tF = F - (0.25 + Math.random() * 0.45);
      if (tF < 61) tF = 79;
    }, 3000);

    const t0 = performance.now();
    const easeExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const HPD = 2.15;
    const PPD = 2.5;

    const frame = (now: number) => {
      const t = now - t0;

      // Gyro spin-up
      const su = easeExpo(Math.min(t / 2400, 1));
      const hdg = (348 + (450 - 348) * su + (su >= 1 ? Math.sin(t * 0.00031) * 1.6 : 0) + 360) % 360;
      if (hdgTicksRef.current) {
        hdgTicksRef.current.setAttribute("transform", `translate(${168 - hdg * HPD} 0)`);
      }
      const hs = String(Math.round(hdg) % 360).padStart(3, "0") + "°";
      if (hs !== lastHdg && hdgValRef.current) { hdgValRef.current.textContent = hs; lastHdg = hs; }

      // Attitude drift
      const roll = (Math.sin(t * 0.00037) * 5.4 + Math.sin(t * 0.00091) * 1.9) * su;
      const pitch = (Math.sin(t * 0.00043) * 1.7 + Math.sin(t * 0.00119) * 0.5) * su;
      if (horizonRef.current) {
        horizonRef.current.setAttribute("transform", `rotate(${-roll} 176 88) translate(0 ${pitch * PPD})`);
      }
      if (rollPtrRef.current) {
        rollPtrRef.current.setAttribute("transform", `rotate(${-roll} 176 88)`);
      }
      if (spdTapeRef.current) {
        spdTapeRef.current.setAttribute("transform", `translate(0 ${(I % 10) * 1.8 - 9})`);
      }
      if (altTapeRef.current) {
        altTapeRef.current.setAttribute("transform", `translate(0 ${(A % 100) * 0.18 - 9})`);
      }

      // Telemetry easing
      A += (tA - A) * 0.018; I += (tI - I) * 0.02; F += (tF - F) * 0.01;
      const as = Math.round(A).toLocaleString("en-US");
      const is = String(Math.round(I));
      const fs = F.toFixed(1);
      if (as !== lastAlt && vAltRef.current) { vAltRef.current.textContent = as; lastAlt = as; }
      if (is !== lastIas && vIasRef.current) { vIasRef.current.textContent = is; lastIas = is; }
      if (vFuelRef.current) vFuelRef.current.textContent = fs;

      // Flight path
      const p = (t % 12000) / 12000;
      if (fillRef.current) {
        (fillRef.current as HTMLElement).style.transform = `scaleY(${p.toFixed(4)})`;
      }
      if (pctRef.current) {
        pctRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
      }
      const ph = Math.min(3, Math.floor(p * 4));
      if (ph !== lastPhase) {
        stepRefs.current.forEach((s, i) => {
          if (!s) return;
          s.className = "fc-step" + (i < ph ? " done" : i === ph ? " on" : "");
        });
        lastPhase = ph;
      }

      // Zulu clock
      if (clkRef.current) {
        const d = new Date();
        clkRef.current.textContent = [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()].map(n => String(n).padStart(2, "0")).join(":") + "Z";
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(raf);
    };
  }, []);

  const STEPS = [
    { icon: "power", label: "Engine start", ts: "T+00:00" },
    { icon: "plane-takeoff", label: "Taxi & takeoff", ts: "T+02:40" },
    { icon: "radio", label: "Radio calls", ts: "T+06:10" },
    { icon: "plane-landing", label: "IFR approach", ts: "T+09:35" },
  ];

  return (
    <div className="glass glow-primary relative w-full max-w-[400px] rounded-2xl p-4">
      {/* Data plate */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="nums rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-primary">N172FC</span>
          <span className="label-instrument text-primary">Flight plan</span>
        </div>
        <span className="label-instrument text-muted-foreground">C172 · KSEA</span>
      </header>

      {/* PFD SVG */}
      <div className="relative">
        <svg viewBox="0 0 352 176" className="w-full" role="img" aria-label="Attitude indicator">
          <defs>
            <clipPath id="fc-aiClip"><circle cx="176" cy="88" r="72" /></clipPath>
            <clipPath id="fc-tapeL"><rect x="10" y="18" width="30" height="140" rx="4" /></clipPath>
            <clipPath id="fc-tapeR"><rect x="312" y="18" width="30" height="140" rx="4" /></clipPath>
            <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.42 0.108 248)" />
              <stop offset="100%" stopColor="oklch(0.60 0.118 235)" />
            </linearGradient>
            <linearGradient id="fc-gnd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.44 0.082 62)" />
              <stop offset="100%" stopColor="oklch(0.25 0.045 55)" />
            </linearGradient>
            <radialGradient id="fc-lens" cx="50%" cy="46%" r="52%">
              <stop offset="55%" stopColor="oklch(0.10 0.02 254 / 0)" />
              <stop offset="100%" stopColor="oklch(0.08 0.018 254 / 0.62)" />
            </radialGradient>
          </defs>

          <g clipPath="url(#fc-aiClip)">
            <g ref={horizonRef} id="fc-horizon">
              <rect x="-140" y="-260" width="632" height="348" fill="url(#fc-sky)" />
              <rect x="-140" y="88" width="632" height="348" fill="url(#fc-gnd)" />
              <line x1="-140" y1="88" x2="492" y2="88" stroke="oklch(0.97 0.01 250 / 0.85)" strokeWidth="1.4" />
              <g id="fc-ladder" stroke="oklch(0.97 0.01 250 / 0.72)" strokeWidth="1" strokeLinecap="round" />
            </g>
            <circle cx="176" cy="88" r="72" fill="url(#fc-lens)" />
          </g>

          <circle cx="176" cy="88" r="72" fill="none" stroke="oklch(0.99 0.01 250 / 0.16)" />
          <circle cx="176" cy="88" r="66.5" fill="none" stroke="oklch(0.75 0.13 68 / 0.10)" />
          <g id="fc-bankScale" stroke="oklch(0.97 0.01 250 / 0.62)" strokeWidth="1" strokeLinecap="round" />
          <path d="M176 10 l4.6 7.6 h-9.2 Z" fill="oklch(0.97 0.01 250 / 0.75)" />
          <g ref={rollPtrRef}><path d="M176 20.5 l5 8.4 h-10 Z" fill="var(--primary)" /></g>

          {/* Aircraft symbol */}
          <g>
            <path d="M130 88 h30 v5" fill="none" stroke="oklch(0.14 0.02 254)" strokeWidth="5" strokeLinejoin="round" />
            <path d="M222 88 h-30 v5" fill="none" stroke="oklch(0.14 0.02 254)" strokeWidth="5" strokeLinejoin="round" />
            <path d="M130 88 h30 v5" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M222 88 h-30 v5" fill="none" stroke="var(--primary)" strokeWidth="2.4" strokeLinejoin="round" />
            <rect x="173.4" y="85.4" width="5.2" height="5.2" rx="1" fill="var(--primary)" stroke="oklch(0.14 0.02 254)" strokeWidth="1.2" />
          </g>

          {/* Flanking tapes */}
          <rect x="10" y="18" width="30" height="140" rx="4" fill="oklch(0.99 0.01 250 / 0.035)" stroke="var(--border)" />
          <rect x="312" y="18" width="30" height="140" rx="4" fill="oklch(0.99 0.01 250 / 0.035)" stroke="var(--border)" />
          <g clipPath="url(#fc-tapeL)"><g ref={spdTapeRef} id="fc-spdTape" stroke="oklch(0.75 0.128 205 / 0.55)" strokeWidth="1" strokeLinecap="round" /></g>
          <g clipPath="url(#fc-tapeR)"><g ref={altTapeRef} id="fc-altTape" stroke="oklch(0.75 0.128 205 / 0.55)" strokeWidth="1" strokeLinecap="round" /></g>
          <path d="M42 88 l-6 -4.4 v8.8 Z" fill="var(--primary)" />
          <path d="M310 88 l6 -4.4 v8.8 Z" fill="var(--primary)" />
          <text x="25" y="13" textAnchor="middle" fill="oklch(0.52 0.016 250)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.9">IAS</text>
          <text x="327" y="13" textAnchor="middle" fill="oklch(0.52 0.016 250)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.9">ALT</text>
        </svg>

        {/* Heading tape */}
        <div className="px-2 pb-2">
          <span ref={hdgValRef} className="nums mb-1 block text-center text-sm font-bold text-primary">090°</span>
          <svg viewBox="0 0 336 40" className="w-full" role="img" aria-label="Heading indicator">
            <g ref={hdgTicksRef}></g>
            <line x1="168" y1="12" x2="168" y2="30" stroke="oklch(0.75 0.13 68 / 0.35)" strokeWidth="1" />
            <path d="M168 34 l4.4 -7 h-8.8 Z" fill="var(--primary)" />
          </svg>
        </div>
      </div>

      {/* Telemetry */}
      <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-border bg-background/40 p-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="label-instrument text-muted-foreground text-[9px]">ALT</span>
          <div className="flex items-baseline gap-1">
            <span ref={vAltRef} className="nums text-sm font-semibold tabular-nums text-primary">4,520</span>
            <span className="text-[9px] text-muted-foreground">FT</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="label-instrument text-muted-foreground text-[9px]">IAS</span>
          <div className="flex items-baseline gap-1">
            <span ref={vIasRef} className="nums text-sm font-semibold tabular-nums text-primary">108</span>
            <span className="text-[9px] text-muted-foreground">KT</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="label-instrument text-muted-foreground text-[9px]">FUEL</span>
          <div className="flex items-baseline gap-1">
            <span ref={vFuelRef} className="nums text-sm font-semibold tabular-nums">78.4</span>
            <span className="text-[9px] text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* Flight path */}
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="label-instrument text-primary">Flight path</span>
          <span ref={pctRef} className="nums text-xs text-muted-foreground">00%</span>
        </div>
        <div className="relative">
          <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />
          <li ref={fillRef} className="absolute left-[14px] top-2 w-px bg-primary transition-all duration-1000 ease-out" style={{ height: "0%", listStyle: "none", transformOrigin: "top" }} />
          <ul className="flex flex-col gap-2.5">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="fc-step relative flex items-center gap-3 pl-1"
              >
                <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                  <span className="text-[10px] font-mono">{i + 1}</span>
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">{s.label}</span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">{s.ts}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Status strip */}
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-2">
        <span className="size-2 rounded-full bg-success animate-pulse" />
        <span className="label-instrument text-muted-foreground">Avionics nominal</span>
        <span className="flex-1" />
        <span ref={clkRef} className="nums text-[10px] text-muted-foreground">00:00:00Z</span>
      </div>

      {/* CSS for step states */}
      <style>{`
        .fc-step.on .border-border { border-color: var(--primary); background: var(--primary); color: var(--primary-foreground); }
        .fc-step.on > span:first-child { box-shadow: 0 0 12px var(--primary); }
        .fc-step.done > span:first-child { border-color: oklch(0.75 0.13 68 / 0.4); background: oklch(0.75 0.13 68 / 0.05); color: var(--primary); opacity: 0.6; }
      `}</style>
    </div>
  );
}
