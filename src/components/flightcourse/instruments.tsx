"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Round to 2 decimal places — prevents SSR hydration mismatches caused
 * by floating-point serialization differences between Node (server) and
 * the browser (client) when computing SVG coordinates via Math.cos/sin.
 * e.g. 8.483339501604604 (client) vs 8.4833395016046 (server) → both
 * become "8.48".
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ============================================================
   Attitude Indicator (artificial horizon)
   - bank (deg) tilts the horizon; pitch (deg) shifts it vertically
   - subtle ambient oscillation when idle
   ============================================================ */
export function AttitudeIndicator({
  bank = 0,
  pitch = 0,
  size = 240,
  className,
  ambient = true,
}: {
  bank?: number;
  pitch?: number;
  size?: number;
  className?: string;
  ambient?: boolean;
}) {
  // Start as null so the first render (server + client) uses the base
  // bank/pitch without ambient offset — prevents hydration mismatch.
  // The rAF loop sets t to a number only after mount.
  const [t, setT] = React.useState<number | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(true);
  const reducedMotion = useReducedMotion();
  React.useEffect(() => {
    if (!ambient) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
    } else {
      const el = wrapRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => setVisible(entries[0]?.isIntersecting ?? true),
        { threshold: 0 },
      );
      io.observe(el);
      return () => io.disconnect();
    }
  }, [ambient]);
  React.useEffect(() => {
    if (!ambient || !visible || reducedMotion) return;
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    // Delay the animation start so React completes hydration validation
    // before the DOM starts changing — prevents hydration mismatch.
    timeout = setTimeout(() => {
      raf = requestAnimationFrame(loop);
    }, 300);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [ambient, visible, reducedMotion]);

  // gentle ambient bank/pitch breathing (only after mount when t is set)
  const bBank = t !== null ? r2(bank + Math.sin(t * 0.6) * 2.4) : bank;
  const bPitch = t !== null ? r2(pitch + Math.sin(t * 0.45) * 1.6) : pitch;

  const r = size / 2;
  const horizonY = r2(r + bPitch * 1.6);

  return (
    <div
      ref={wrapRef}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Attitude indicator"
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <defs>
          <clipPath id={`ai-clip-${size}`}>
            <circle cx={r} cy={r} r={r - 8} />
          </clipPath>
          <radialGradient id={`ai-sky-${size}`} cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#5BA8DE" />
            <stop offset="60%" stopColor="#2E6FA8" />
            <stop offset="100%" stopColor="#1A4E7C" />
          </radialGradient>
          <radialGradient id={`ai-gnd-${size}`} cx="50%" cy="60%" r="75%">
            <stop offset="0%" stopColor="#7A5A2A" />
            <stop offset="60%" stopColor="#5A4119" />
            <stop offset="100%" stopColor="#3A2A10" />
          </radialGradient>
          <radialGradient id={`ai-glass-${size}`} cx="35%" cy="25%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </radialGradient>
        </defs>

        {/* bezel ring */}
        <circle cx={r} cy={r} r={r - 1} fill="#0C2247" stroke="rgba(62,146,204,0.4)" strokeWidth="2" />

        {/* rotating instrument body */}
        <g transform={`rotate(${bBank} ${r} ${r})`}>
          <g clipPath={`url(#ai-clip-${size})`}>
            {/* sky */}
            <rect x={-size} y={-size} width={size * 3} height={size * 3} fill={`url(#ai-sky-${size})`} />
            {/* ground */}
            <rect x={-size} y={horizonY} width={size * 3} height={size * 3} fill={`url(#ai-gnd-${size})`} />
            {/* horizon line */}
            <line x1={-size} y1={horizonY} x2={size * 2} y2={horizonY} stroke="#fff" strokeWidth="2" />

            {/* pitch ladder */}
            {[-20, -10, 10, 20].map((p) => {
              const y = r2(horizonY - p * 1.6);
              const w = Math.abs(p) === 10 ? 26 : 18;
              return (
                <g key={p} stroke="#fff" strokeWidth="1.4" opacity="0.85">
                  <line x1={r2(r - w)} y1={y} x2={r2(r - 6)} y2={y} />
                  <line x1={r2(r + 6)} y1={y} x2={r2(r + w)} y2={y} />
                </g>
              );
            })}
          </g>

          {/* fixed aircraft symbol */}
          <g stroke="#F2B134" strokeWidth="3.5" fill="none" strokeLinecap="round">
            <line x1={r - 34} y1={r} x2={r - 12} y2={r} />
            <line x1={r + 12} y1={r} x2={r + 34} y2={r} />
            <circle cx={r} cy={r} r="3" fill="#F2B134" stroke="none" />
          </g>

          {/* bank pointer (top) */}
          <g>
            <polygon points={`${r},12 ${r - 7},24 ${r + 7},24`} fill="#F2B134" />
            {/* bank tick marks */}
            {[-30, -20, -10, 0, 10, 20, 30].map((deg) => {
              const rad = (deg - 90) * (Math.PI / 180);
              const x1 = r2(r + Math.cos(rad) * (r - 9));
              const y1 = r2(r + Math.sin(rad) * (r - 9));
              const x2 = r2(r + Math.cos(rad) * (r - (Math.abs(deg) === 0 ? 18 : 14)));
              const y2 = r2(r + Math.sin(rad) * (r - (Math.abs(deg) === 0 ? 18 : 14)));
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E6F1FB" strokeWidth={Math.abs(deg) === 0 ? 2 : 1} opacity="0.7" />;
            })}
          </g>
        </g>

        {/* glass glare */}
        <circle cx={r} cy={r} r={r - 8} fill={`url(#ai-glass-${size})`} pointerEvents="none" />
        <circle cx={r} cy={r} r={r - 8} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* ============================================================
   Signal bars — animated EQ / receive strength
   ============================================================ */
export function SignalBars({
  idle = false,
  className,
}: {
  idle?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("fc-sigbar", className)}
      data-idle={idle ? "true" : "false"}
      aria-hidden
    >
      <i /><i /><i /><i />
    </span>
  );
}

/* ============================================================
   Altitude tape — vertical rolling readout
   ============================================================ */
export function AltitudeTape({
  altitude,
  className,
  label = "ALT",
}: {
  altitude: number;
  className?: string;
  label?: string;
}) {
  const v = React.useMemo(() => Math.max(0, Math.round(altitude)), [altitude]);
  return (
    <div className={cn("lcd-screen lcd-flicker rounded-md px-2.5 py-1.5 text-center", className)}>
      <div className="text-[8px] text-emerald-300/60 tracking-widest leading-none">{label}</div>
      <div className="font-mono text-base sm:text-lg font-bold tabular-nums leading-tight">
        {String(v).padStart(3, "0")}
      </div>
      <div className="text-[7px] text-emerald-300/50 tracking-widest leading-none">FT</div>
    </div>
  );
}

/* ============================================================
   Compass / heading rose (small)
   ============================================================ */
export function CompassRose({
  heading = 0,
  size = 120,
  className,
}: {
  heading?: number;
  size?: number;
  className?: string;
}) {
  const r = size / 2;
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }} role="img" aria-label={`Heading ${heading}`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={r} cy={r} r={r - 2} fill="#071c10" stroke="rgba(91,255,155,0.35)" strokeWidth="1.5" />
        <g transform={`rotate(${-heading} ${r} ${r})`}>
          {Array.from({ length: 24 }).map((_, i) => {
            const deg = i * 15;
            const rad = (deg - 90) * (Math.PI / 180);
            const major = deg % 90 === 0;
            const x1 = r2(r + Math.cos(rad) * (r - 5));
            const y1 = r2(r + Math.sin(rad) * (r - 5));
            const x2 = r2(r + Math.cos(rad) * (r - (major ? 12 : 8)));
            const y2 = r2(r + Math.sin(rad) * (r - (major ? 12 : 8)));
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5BFF9B" strokeWidth={major ? 1.6 : 0.8} opacity={major ? 0.9 : 0.5} />;
          })}
          {["N", "E", "S", "W"].map((c, i) => {
            const rad = (i * 90 - 90) * (Math.PI / 180);
            const x = r2(r + Math.cos(rad) * (r - 20));
            const y = r2(r + Math.sin(rad) * (r - 20) + 4);
            return (
              <text key={c} x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5BFF9B" fontFamily="JetBrains Mono, monospace">
                {c}
              </text>
            );
          })}
        </g>
        <polygon points={`${r},4 ${r - 6},14 ${r + 6},14`} fill="#F2B134" />
        <text x={r} y={r + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5BFF9B" fontFamily="JetBrains Mono, monospace">
          {String(Math.round(heading)).padStart(3, "0")}°
        </text>
      </svg>
    </div>
  );
}
