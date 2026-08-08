"use client";

import { motion } from "framer-motion";

interface DiagramProps {
  caption?: string;
}

/** Wrapper with caption */
function DiagramFrame({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className="my-6">
      <div className="fp-bezel bg-card p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-center min-w-[280px]">
          {children}
        </div>
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const SKY = "#3E92CC";
const NAVY = "#0B1D3A";
const GOLD = "#F2B134";
const SLATE = "#5B6B79";
const CLOUD = "#F7F9FC";
const GREEN = "#3BA55D";
const RED = "#D64545";

// ===== SIM COMPARISON (Module 1) =====
function SimComparisonDiagram() {
  const platforms = [
    { name: "MSFS", x: 40, w: 100, realism: 95, access: 90, color: SKY },
    { name: "X-Plane", x: 175, w: 100, realism: 92, access: 75, color: GOLD },
    { name: "DCS", x: 310, w: 100, realism: 98, access: 45, color: SLATE },
  ];
  // Grouped bar chart: two bars per platform, both anchored to a shared baseline.
  const BASELINE = 150; // common floor for every bar
  const MAX_BAR_H = 95; // pixel height for a 100% value
  const BAR_W = 30;
  const GAP = 14; // space between the realism and accessibility bar in a group
  const scale = (v: number) => (v / 100) * MAX_BAR_H;
  return (
    <svg viewBox="0 0 430 210" className="w-full max-w-md">
      <text x="215" y="18" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="var(--font-jetbrains)" opacity="0.6">REALISM vs ACCESSIBILITY</text>
      {/* Shared baseline the bars sit on */}
      <line x1="24" y1={BASELINE} x2="406" y2={BASELINE} stroke="currentColor" strokeWidth="1" opacity="0.25" />
      {platforms.map((p, i) => {
        const center = p.x + p.w / 2;
        const realismX = center - GAP / 2 - BAR_W;
        const accessX = center + GAP / 2;
        const realismH = scale(p.realism);
        const accessH = scale(p.access);
        return (
          <g key={i}>
            {/* Realism bar (solid) */}
            <rect x={realismX} y={BASELINE - realismH} width={BAR_W} height={realismH} fill={p.color} opacity="0.85" rx="2" />
            <text x={realismX + BAR_W / 2} y={BASELINE - realismH - 5} textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.7">{p.realism}</text>
            {/* Accessibility bar (translucent) */}
            <rect x={accessX} y={BASELINE - accessH} width={BAR_W} height={accessH} fill={p.color} opacity="0.35" rx="2" />
            <text x={accessX + BAR_W / 2} y={BASELINE - accessH - 5} textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">{p.access}</text>
            {/* Platform name under the baseline */}
            <text x={center} y={BASELINE + 20} textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="600" fontFamily="var(--font-sora)">{p.name}</text>
          </g>
        );
      })}
      {/* Legend */}
      <g transform="translate(120, 188)">
        <rect x="0" y="0" width="11" height="11" fill="currentColor" opacity="0.85" rx="2" />
        <text x="17" y="9" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.6">Realism</text>
        <rect x="90" y="0" width="11" height="11" fill="currentColor" opacity="0.35" rx="2" />
        <text x="107" y="9" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.6">Accessibility</text>
      </g>
    </svg>
  );
}

// ===== SIX-PACK INSTRUMENTS (Module 2) =====
function SixPackDiagram() {
  const instruments = [
    { name: "ASI", label: "Airspeed", cx: 80, cy: 70 },
    { name: "AI", label: "Attitude", cx: 210, cy: 70 },
    { name: "ALT", label: "Altimeter", cx: 340, cy: 70 },
    { name: "TC", label: "Turn Coord.", cx: 80, cy: 180 },
    { name: "HI", label: "Heading", cx: 210, cy: 180 },
    { name: "VSI", label: "V. Speed", cx: 340, cy: 180 },
  ];
  return (
    <svg viewBox="0 0 420 250" className="w-full max-w-lg">
      {instruments.map((inst, i) => (
        <g key={i}>
          {/* Bezel */}
          <circle cx={inst.cx} cy={inst.cy} r="50" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <circle cx={inst.cx} cy={inst.cy} r="46" fill="var(--color-card)" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, t) => {
            const a = (t / 12) * 360 - 90;
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={t}
                x1={inst.cx + 40 * Math.cos(rad)}
                y1={inst.cy + 40 * Math.sin(rad)}
                x2={inst.cx + 44 * Math.cos(rad)}
                y2={inst.cy + 44 * Math.sin(rad)}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
              />
            );
          })}
          {/* Specialized content per instrument */}
          {inst.name === "ASI" && (
            <>
              <text x={inst.cx} y={inst.cy - 5} textAnchor="middle" fill={SKY} fontSize="16" fontFamily="var(--font-jetbrains)" fontWeight="700">120</text>
              <text x={inst.cx} y={inst.cy + 12} textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5">KNOTS</text>
              <line x1={inst.cx} y1={inst.cy + 5} x2={inst.cx + 20} y2={inst.cy} stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {inst.name === "AI" && (
            <>
              <rect x={inst.cx - 40} y={inst.cy - 40} width="80" height="40" fill={SKY} opacity="0.3" />
              <rect x={inst.cx - 40} y={inst.cy} width="80" height="40" fill={NAVY} opacity="0.5" />
              <line x1={inst.cx - 40} y1={inst.cy} x2={inst.cx + 40} y2={inst.cy} stroke={GOLD} strokeWidth="1.5" />
              <line x1={inst.cx - 15} y1={inst.cy} x2={inst.cx + 15} y2={inst.cy} stroke={GOLD} strokeWidth="3" />
            </>
          )}
          {inst.name === "ALT" && (
            <>
              <text x={inst.cx} y={inst.cy + 5} textAnchor="middle" fill={SKY} fontSize="14" fontFamily="var(--font-jetbrains)" fontWeight="700">3500</text>
              <text x={inst.cx} y={inst.cy + 18} textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">FT</text>
              <line x1={inst.cx} y1={inst.cy} x2={inst.cx + 10} y2={inst.cy - 20} stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
              <line x1={inst.cx} y1={inst.cy} x2={inst.cx - 15} y2={inst.cy + 10} stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {inst.name === "TC" && (
            <>
              <line x1={inst.cx - 30} y1={inst.cy} x2={inst.cx + 30} y2={inst.cy} stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <circle cx={inst.cx} cy={inst.cy} r="4" fill="none" stroke={GOLD} strokeWidth="1.5" />
              <line x1={inst.cx - 20} y1={inst.cy} x2={inst.cx + 20} y2={inst.cy} stroke={GOLD} strokeWidth="1.5" />
              <circle cx={inst.cx} cy={inst.cy + 25} r="8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <circle cx={inst.cx} cy={inst.cy + 25} r="3" fill={SKY} opacity="0.6" />
            </>
          )}
          {inst.name === "HI" && (
            <>
              <circle cx={inst.cx} cy={inst.cy} r="32" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              {["N", "E", "S", "W"].map((d, j) => {
                const a = (j / 4) * 360 - 90;
                const rad = (a * Math.PI) / 180;
                return (
                  <text key={d} x={inst.cx + 25 * Math.cos(rad)} y={inst.cy + 25 * Math.sin(rad) + 3} textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="600" opacity="0.6">{d}</text>
                );
              })}
              <polygon points={`${inst.cx},${inst.cy - 28} ${inst.cx - 4},${inst.cy} ${inst.cx + 4},${inst.cy}`} fill={GOLD} />
            </>
          )}
          {inst.name === "VSI" && (
            <>
              <text x={inst.cx} y={inst.cy + 4} textAnchor="middle" fill={SKY} fontSize="11" fontFamily="var(--font-jetbrains)" fontWeight="700">+500</text>
              <text x={inst.cx} y={inst.cy + 16} textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">FPM</text>
              <line x1={inst.cx} y1={inst.cy} x2={inst.cx + 15} y2={inst.cy - 15} stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          <text x={inst.cx} y={inst.cy + 66} textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-sora)" opacity="0.6">{inst.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ===== FOUR FORCES (Module 3) =====
function FourForcesDiagram() {
  return (
    <svg viewBox="0 0 400 260" className="w-full max-w-md">
      {/* Aircraft silhouette (top-down) */}
      <g transform="translate(200, 130)">
        {/* Fuselage */}
        <ellipse cx="0" cy="0" rx="12" ry="60" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Wings */}
        <ellipse cx="0" cy="0" rx="80" ry="14" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Tail */}
        <ellipse cx="0" cy="50" rx="30" ry="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="0" y1="45" x2="0" y2="60" stroke="currentColor" strokeWidth="2" />
        {/* Prop */}
        <line x1="-15" y1="-60" x2="15" y2="-60" stroke={GOLD} strokeWidth="2" />
        <circle cx="0" cy="-60" r="3" fill={GOLD} />
      </g>
      {/* Lift arrow (up) */}
      <g>
        <line x1="200" y1="100" x2="200" y2="40" stroke={SKY} strokeWidth="3" markerEnd="url(#arrowSky)" />
        <text x="210" y="60" fill={SKY} fontSize="13" fontWeight="600" fontFamily="var(--font-sora)">Lift</text>
      </g>
      {/* Weight arrow (down) */}
      <g>
        <line x1="200" y1="160" x2="200" y2="220" stroke={RED} strokeWidth="3" markerEnd="url(#arrowRed)" />
        <text x="210" y="210" fill={RED} fontSize="13" fontWeight="600" fontFamily="var(--font-sora)">Weight</text>
      </g>
      {/* Thrust arrow (forward/right) */}
      <g>
        <line x1="210" y1="130" x2="300" y2="130" stroke={GOLD} strokeWidth="3" markerEnd="url(#arrowGold)" />
        <text x="260" y="120" fill={GOLD} fontSize="13" fontWeight="600" fontFamily="var(--font-sora)">Thrust</text>
      </g>
      {/* Drag arrow (backward/left) */}
      <g>
        <line x1="190" y1="130" x2="100" y2="130" stroke={SLATE} strokeWidth="3" markerEnd="url(#arrowSlate)" />
        <text x="120" y="120" fill={SLATE} fontSize="13" fontWeight="600" fontFamily="var(--font-sora)">Drag</text>
      </g>
      <defs>
        <marker id="arrowSky" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SKY} /></marker>
        <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={RED} /></marker>
        <marker id="arrowGold" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={GOLD} /></marker>
        <marker id="arrowSlate" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SLATE} /></marker>
      </defs>
    </svg>
  );
}

// ===== ANGLE OF ATTACK (Module 3) =====
function AngleOfAttackDiagram() {
  return (
    <svg viewBox="0 0 400 220" className="w-full max-w-md">
      {/* Relative wind arrow */}
      <line x1="30" y1="150" x2="200" y2="150" stroke={SLATE} strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#arrowSlate2)" />
      <text x="40" y="140" fill={SLATE} fontSize="11" fontFamily="var(--font-jetbrains)">Relative Wind</text>
      {/* Wing (airfoil cross-section) */}
      <path d="M 200 150 Q 230 110 300 140 Q 340 155 360 155 Q 320 160 280 162 Q 240 163 200 150 Z" fill={SKY} opacity="0.3" stroke={SKY} strokeWidth="2" />
      {/* Chord line */}
      <line x1="200" y1="150" x2="360" y2="155" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4,3" />
      <text x="300" y="175" fill={GOLD} fontSize="10" fontFamily="var(--font-jetbrains)">Chord Line</text>
      {/* AoA arc */}
      <path d="M 210 150 A 30 30 0 0 0 225 128" fill="none" stroke={GOLD} strokeWidth="2" />
      <text x="235" y="135" fill={GOLD} fontSize="12" fontWeight="600" fontFamily="var(--font-sora)">α (AoA)</text>
      <defs><marker id="arrowSlate2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SLATE} /></marker></defs>
    </svg>
  );
}

// ===== CONTROL AXES (Module 4) =====
function ControlAxesDiagram() {
  return (
    <svg viewBox="0 0 400 260" className="w-full max-w-md">
      {/* Aircraft (side view) */}
      <g transform="translate(200,130)">
        <ellipse cx="0" cy="0" rx="70" ry="14" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="10" ry="50" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="-25" y1="40" x2="25" y2="40" stroke="currentColor" strokeWidth="2" />
      </g>
      {/* Pitch axis (lateral, through wings) */}
      <line x1="80" y1="130" x2="320" y2="130" stroke={GOLD} strokeWidth="2" strokeDasharray="2,2" opacity="0.5" />
      <text x="330" y="134" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Pitch</text>
      {/* Roll axis (longitudinal, through nose-tail) */}
      <line x1="200" y1="60" x2="200" y2="200" stroke={SKY} strokeWidth="2" strokeDasharray="2,2" opacity="0.5" />
      <text x="210" y="55" fill={SKY} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Roll</text>
      {/* Yaw axis (vertical) */}
      <circle cx="200" cy="130" r="4" fill={RED} opacity="0.6" />
      <text x="210" y="150" fill={RED} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Yaw ↕</text>
      {/* Arrows showing rotation */}
      <path d="M 140 110 Q 120 95 140 80" fill="none" stroke={GOLD} strokeWidth="2" markerEnd="url(#arrG)" />
      <path d="M 250 100 Q 270 115 250 130" fill="none" stroke={SKY} strokeWidth="2" markerEnd="url(#arrS)" />
      <defs>
        <marker id="arrG" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={GOLD} /></marker>
        <marker id="arrS" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SKY} /></marker>
      </defs>
    </svg>
  );
}

// ===== AILERON ROLL (Module 4) =====
function AileronRollDiagram() {
  return (
    <svg viewBox="0 0 400 200" className="w-full max-w-md">
      {/* Aircraft from behind */}
      <g transform="translate(200,100)">
        {/* Fuselage circle */}
        <ellipse cx="0" cy="0" rx="14" ry="18" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Left wing */}
        <path d="M -14 -2 L -110 -8 L -110 12 L -14 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Right wing */}
        <path d="M 14 -2 L 110 -8 L 110 12 L 14 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Left aileron down */}
        <path d="M -110 -8 L -90 -8 L -90 12 L -110 12 Z" fill={SKY} opacity="0.4" stroke={SKY} strokeWidth="1.5" />
        <text x="-100" y="-15" textAnchor="middle" fill={SKY} fontSize="9" fontFamily="var(--font-jetbrains)">DOWN</text>
        {/* Right aileron up */}
        <path d="M 90 -8 L 110 -8 L 110 12 L 90 12 Z" fill={GOLD} opacity="0.4" stroke={GOLD} strokeWidth="1.5" />
        <text x="100" y="28" textAnchor="middle" fill={GOLD} fontSize="9" fontFamily="var(--font-jetbrains)">UP</text>
      </g>
      {/* Roll arrow */}
      <path d="M 280 80 A 40 40 0 0 1 280 120" fill="none" stroke={SKY} strokeWidth="2" markerEnd="url(#arrRoll)" />
      <text x="300" y="105" fill={SKY} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Rolls right</text>
      <defs><marker id="arrRoll" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SKY} /></marker></defs>
    </svg>
  );
}

// ===== ADVERSE YAW (Module 4) =====
function AdverseYawDiagram() {
  return (
    <svg viewBox="0 0 400 200" className="w-full max-w-md">
      <g transform="translate(200,100)">
        <ellipse cx="0" cy="0" rx="12" ry="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M -12 0 L -100 -4 L -100 10 L -12 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 12 0 L 100 -4 L 100 10 L 12 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Left aileron down — more drag */}
        <path d="M -100 -4 L -82 -4 L -82 10 L -100 10 Z" fill={SKY} opacity="0.3" stroke={SKY} />
        <line x1="-91" y1="10" x2="-91" y2="35" stroke={RED} strokeWidth="2" markerEnd="url(#arrDrag)" />
        <text x="-91" y="48" textAnchor="middle" fill={RED} fontSize="8" fontFamily="var(--font-jetbrains)">More drag</text>
        {/* Right aileron up — less drag */}
        <path d="M 82 -4 L 100 -4 L 100 10 L 82 10 Z" fill={GOLD} opacity="0.3" stroke={GOLD} />
        <line x1="91" y1="10" x2="91" y2="28" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrDrag2)" opacity="0.4" />
        <text x="91" y="40" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">Less drag</text>
      </g>
      <text x="200" y="180" textAnchor="middle" fill={RED} fontSize="11" fontFamily="var(--font-sora)" fontWeight="500">Nose yaws LEFT (unwanted) → use rudder to coordinate</text>
      <defs>
        <marker id="arrDrag" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={RED} /></marker>
        <marker id="arrDrag2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" /></marker>
      </defs>
    </svg>
  );
}

// ===== CESSNA PANEL (Module 5) =====
function CesnaPanelDiagram() {
  return (
    <svg viewBox="0 0 420 200" className="w-full max-w-lg">
      <rect x="5" y="5" width="410" height="190" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" rx="6" />
      {/* Six-pack */}
      {[
        { cx: 75, cy: 60, label: "ASI" },
        { cx: 145, cy: 60, label: "AI" },
        { cx: 215, cy: 60, label: "ALT" },
        { cx: 75, cy: 140, label: "TC" },
        { cx: 145, cy: 140, label: "HI" },
        { cx: 215, cy: 140, label: "VSI" },
      ].map((g, i) => (
        <g key={i}>
          <circle cx={g.cx} cy={g.cy} r="24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <text x={g.cx} y={g.cy + 4} textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">{g.label}</text>
        </g>
      ))}
      {/* Radio stack */}
      <rect x="260" y="35" width="50" height="130" fill="none" stroke={SKY} strokeWidth="1.5" opacity="0.5" rx="3" />
      <text x="285" y="28" textAnchor="middle" fill={SKY} fontSize="8" fontFamily="var(--font-jetbrains)">RADIOS</text>
      {[45, 70, 95, 120, 145].map((y, i) => (
        <g key={i}>
          <rect x="267" y={y} width="36" height="18" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" rx="2" />
          <text x="285" y={y + 12} textAnchor="middle" fill={GREEN} fontSize="7" fontFamily="var(--font-jetbrains)">122.7</text>
        </g>
      ))}
      {/* Switches */}
      <rect x="330" y="35" width="75" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" rx="3" />
      <text x="367" y="28" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">SWITCHES</text>
      {[42, 54, 66, 78].map((y, i) => (
        <g key={i}>
          <rect x="345" y={y} width="4" height="14" fill={i < 2 ? GOLD : SLATE} opacity="0.6" />
          <rect x="385" y={y} width="4" height="14" fill={SLATE} opacity="0.4" />
        </g>
      ))}
      {/* Throttle quadrant */}
      <rect x="330" y="110" width="75" height="55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" rx="3" />
      <text x="367" y="105" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">THROTTLE</text>
      <rect x="345" y="120" width="8" height="35" fill={GOLD} opacity="0.6" rx="2" />
      <rect x="360" y="125" width="8" height="30" fill={SLATE} opacity="0.5" rx="2" />
      <rect x="375" y="130" width="8" height="25" fill={SLATE} opacity="0.4" rx="2" />
      {/* Yoke */}
      <rect x="20" y="175" width="240" height="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" rx="3" />
      <text x="140" y="186" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="var(--font-jetbrains)" opacity="0.4">YOKE / CONTROL COLUMN</text>
    </svg>
  );
}

// ===== HOLD SHORT LINE (Module 6) =====
function HoldShortLineDiagram() {
  return (
    <svg viewBox="0 0 400 160" className="w-full max-w-md">
      {/* Taxiway surface */}
      <rect x="0" y="20" width="400" height="50" fill={SLATE} opacity="0.1" />
      {/* Runway surface */}
      <rect x="0" y="100" width="400" height="50" fill={NAVY} opacity="0.15" />
      {/* Hold short lines — 2 solid + 2 dashed */}
      <line x1="170" y1="20" x2="170" y2="70" stroke={GOLD} strokeWidth="3" />
      <line x1="176" y1="20" x2="176" y2="70" stroke={GOLD} strokeWidth="3" />
      <line x1="182" y1="20" x2="182" y2="70" stroke={GOLD} strokeWidth="3" strokeDasharray="5,4" />
      <line x1="188" y1="20" x2="188" y2="70" stroke={GOLD} strokeWidth="3" strokeDasharray="5,4" />
      <text x="80" y="50" textAnchor="middle" fill={SKY} fontSize="13" fontWeight="600" fontFamily="var(--font-sora)">Taxiway</text>
      <text x="80" y="65" textAnchor="middle" fill={SKY} fontSize="9" fontFamily="var(--font-jetbrains)">(this side = safe)</text>
      <text x="290" y="130" textAnchor="middle" fill={RED} fontSize="13" fontWeight="600" fontFamily="var(--font-sora)">Runway</text>
      <text x="290" y="145" textAnchor="middle" fill={RED} fontSize="9" fontFamily="var(--font-jetbrains)">(DO NOT cross without clearance)</text>
      {/* Direction arrow */}
      <text x="179" y="90" textAnchor="middle" fill={GOLD} fontSize="16">← STOP</text>
    </svg>
  );
}

// ===== TAKEOFF ROLL (Module 7) =====
function TakeoffRollDiagram() {
  return (
    <svg viewBox="0 0 420 180" className="w-full max-w-lg">
      {/* Runway */}
      <polygon points="40,150 380,150 320,170 100,170" fill={NAVY} opacity="0.2" />
      {/* Center line dashes */}
      {[60, 120, 180, 240, 300, 360].map((x, i) => (
        <line key={i} x1={x} y1={160 - (x - 40) * 0.03} x2={x + 20} y2={160 - (x + 20 - 40) * 0.03} stroke={CLOUD} strokeWidth="2" opacity="0.5" />
      ))}
      {/* Aircraft accelerating */}
      <g transform="translate(120, 135)">
        <ellipse cx="0" cy="0" rx="8" ry="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="30" ry="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="-6" y1="-18" x2="6" y2="-18" stroke={GOLD} strokeWidth="2" />
      </g>
      {/* Speed building */}
      <text x="120" y="120" textAnchor="middle" fill={SKY} fontSize="11" fontFamily="var(--font-jetbrains)">0 → 55 KIAS</text>
      {/* Arrow showing acceleration */}
      <line x1="140" y1="135" x2="220" y2="135" stroke={GOLD} strokeWidth="2" markerEnd="url(#arrAcc)" />
      <text x="180" y="125" textAnchor="middle" fill={GOLD} fontSize="10" fontFamily="var(--font-sora)">accelerate</text>
      {/* Rotate point */}
      <circle cx="300" cy="130" r="3" fill={GOLD} />
      <text x="300" y="115" textAnchor="middle" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Vr = 55 kt</text>
      <text x="300" y="100" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">rotate here</text>
      <defs><marker id="arrAcc" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={GOLD} /></marker></defs>
    </svg>
  );
}

// ===== INITIAL CLIMB (Module 7) =====
function InitialClimbDiagram() {
  return (
    <svg viewBox="0 0 420 200" className="w-full max-w-lg">
      {/* Ground */}
      <line x1="0" y1="170" x2="420" y2="170" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Climb path */}
      <line x1="40" y1="170" x2="380" y2="50" stroke={SKY} strokeWidth="2" strokeDasharray="4,3" />
      {/* Aircraft at Vy */}
      <g transform="translate(300, 92) rotate(-19)">
        <ellipse cx="0" cy="0" rx="8" ry="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="28" ry="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="-6" y1="-18" x2="6" y2="-18" stroke={GOLD} strokeWidth="2" />
      </g>
      <text x="320" y="85" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Vy = 74 kt</text>
      <text x="320" y="100" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">best climb</text>
      {/* Altitude markers */}
      <text x="50" y="165" fill={SLATE} fontSize="9" fontFamily="var(--font-jetbrains)">0 ft</text>
      <text x="200" y="110" fill={SLATE} fontSize="9" fontFamily="var(--font-jetbrains)">500 ft</text>
      <text x="360" y="55" fill={SLATE} fontSize="9" fontFamily="var(--font-jetbrains)">1000 ft</text>
      {/* Pitch reference */}
      <text x="200" y="190" textAnchor="middle" fill={SKY} fontSize="10" fontFamily="var(--font-sora)">Pitch up ~10° — hold heading with rudder</text>
    </svg>
  );
}

// ===== STRAIGHT AND LEVEL (Module 8) =====
function StraightLevelDiagram() {
  return (
    <svg viewBox="0 0 420 180" className="w-full max-w-lg">
      {/* Horizon */}
      <line x1="0" y1="90" x2="420" y2="90" stroke={SKY} strokeWidth="1.5" opacity="0.5" />
      <rect x="0" y="0" width="420" height="90" fill={SKY} opacity="0.08" />
      <rect x="0" y="90" width="420" height="90" fill={NAVY} opacity="0.1" />
      {/* Aircraft straight and level */}
      <g transform="translate(210, 90)">
        <ellipse cx="0" cy="0" rx="8" ry="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="35" ry="7" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <text x="210" y="40" textAnchor="middle" fill={SKY} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Straight</text>
      <text x="210" y="55" textAnchor="middle" fill={SKY} fontSize="9" fontFamily="var(--font-jetbrains)">wings level</text>
      <text x="210" y="135" textAnchor="middle" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Level</text>
      <text x="210" y="150" textAnchor="middle" fill={GOLD} fontSize="9" fontFamily="var(--font-jetbrains)">constant altitude</text>
      <text x="210" y="170" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">Pitch + Power = Performance</text>
    </svg>
  );
}

// ===== STANDARD RATE TURN (Module 8) =====
function StandardRateTurnDiagram() {
  return (
    <svg viewBox="0 0 300 220" className="w-full max-w-sm">
      {/* Turn coordinator face */}
      <circle cx="150" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="150" cy="100" r="68" fill="var(--color-card)" opacity="0.5" />
      {/* Sky/ground split */}
      <path d="M 82 100 A 68 68 0 0 1 218 100 L 82 100 Z" fill={SKY} opacity="0.15" />
      <path d="M 82 100 A 68 68 0 0 0 218 100 L 82 100 Z" fill={NAVY} opacity="0.15" />
      {/* Standard rate marks (L and R) */}
      <line x1="108" y1="62" x2="118" y2="78" stroke="currentColor" strokeWidth="2" />
      <line x1="192" y1="62" x2="182" y2="78" stroke="currentColor" strokeWidth="2" />
      {/* Aircraft symbol (banked right) */}
      <g transform="translate(150,100) rotate(20)">
        <line x1="-35" y1="0" x2="35" y2="0" stroke={GOLD} strokeWidth="3" />
        <circle cx="0" cy="0" r="5" fill="none" stroke={GOLD} strokeWidth="2" />
        <line x1="-10" y1="0" x2="-25" y2="0" stroke={GOLD} strokeWidth="4" />
        <line x1="10" y1="0" x2="25" y2="0" stroke={GOLD} strokeWidth="4" />
      </g>
      {/* Inclinometer ball */}
      <rect x="120" y="148" width="60" height="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" rx="7" />
      <line x1="150" y1="148" x2="150" y2="162" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="145" cy="155" r="4" fill={CLOUD} stroke="currentColor" strokeWidth="0.5" />
      <text x="150" y="195" textAnchor="middle" fill={SKY} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Standard Rate = 3°/sec</text>
      <text x="150" y="210" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">2 minutes for full 360°</text>
    </svg>
  );
}

// ===== TRAFFIC PATTERN (Module 9) =====
function TrafficPatternDiagram() {
  return (
    <svg viewBox="0 0 400 340" className="w-full max-w-md">
      {/* Runway */}
      <rect x="160" y="140" width="80" height="180" fill={NAVY} opacity="0.2" rx="2" />
      <line x1="200" y1="145" x2="200" y2="315" stroke={CLOUD} strokeWidth="1.5" strokeDasharray="8,6" opacity="0.5" />
      <text x="200" y="335" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">RUNWAY 36</text>
      {/* Pattern legs */}
      {/* Upwind */}
      <line x1="200" y1="140" x2="200" y2="70" stroke={SKY} strokeWidth="2" markerEnd="url(#pat1)" />
      <text x="210" y="100" fill={SKY} fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">Upwind</text>
      {/* Crosswind */}
      <line x1="200" y1="70" x2="320" y2="70" stroke={GOLD} strokeWidth="2" markerEnd="url(#pat2)" />
      <text x="250" y="60" fill={GOLD} fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">Crosswind</text>
      {/* Downwind */}
      <line x1="320" y1="70" x2="320" y2="230" stroke={SKY} strokeWidth="2" markerEnd="url(#pat3)" />
      <text x="330" y="150" fill={SKY} fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">Downwind</text>
      <text x="330" y="162" fill={SKY} fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.6">1000 ft AGL</text>
      {/* Base */}
      <line x1="320" y1="230" x2="240" y2="230" stroke={GOLD} strokeWidth="2" markerEnd="url(#pat4)" />
      <text x="265" y="222" fill={GOLD} fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">Base</text>
      {/* Final */}
      <line x1="240" y1="230" x2="210" y2="190" stroke={RED} strokeWidth="2.5" markerEnd="url(#pat5)" />
      <text x="170" y="215" fill={RED} fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">Final</text>
      {/* 45° entry */}
      <line x1="370" y1="45" x2="325" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <text x="350" y="35" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.4">45° entry</text>
      <defs>
        <marker id="pat1" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SKY} /></marker>
        <marker id="pat2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={GOLD} /></marker>
        <marker id="pat3" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={SKY} /></marker>
        <marker id="pat4" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={GOLD} /></marker>
        <marker id="pat5" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={RED} /></marker>
      </defs>
    </svg>
  );
}

// ===== VOR CONE (Module 10) =====
function VorConeDiagram() {
  return (
    <svg viewBox="0 0 400 240" className="w-full max-w-md">
      {/* VOR station */}
      <circle cx="200" cy="120" r="8" fill={GOLD} />
      <text x="200" y="145" textAnchor="middle" fill={GOLD} fontSize="10" fontFamily="var(--font-jetbrains)">VOR</text>
      {/* Radials */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const x2 = 200 + 90 * Math.cos(rad);
        const y2 = 120 + 90 * Math.sin(rad);
        return (
          <line key={i} x1="200" y1="120" x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" opacity={deg === 0 || deg === 180 ? 0.6 : 0.2} strokeDasharray={deg === 0 ? "0" : "2,2"} />
        );
      })}
      {/* To/from indicator */}
      <circle cx="200" cy="120" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {/* Aircraft on the 030 radial, inbound */}
      <g transform="translate(260, 75)">
        <polygon points="0,-8 -5,6 5,6" fill={SKY} />
      </g>
      <text x="275" y="78" fill={SKY} fontSize="9" fontFamily="var(--font-jetbrains)">You</text>
      <text x="275" y="90" fill={SKY} fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.6">inbound</text>
      <text x="100" y="40" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">030° Radial</text>
      <text x="100" y="55" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">"From" the station</text>
    </svg>
  );
}

// ===== RADIO CALL STRUCTURE (Module 11) =====
function RadioCallStructureDiagram() {
  const parts = [
    { label: "WHO you're calling", text: "Greensboro Ground,", color: SKY },
    { label: "WHO you are", text: "Cessna 23AB,", color: GOLD },
    { label: "WHERE you are", text: "at the ramp,", color: SKY },
    { label: "WHAT you want", text: "taxi to runway 23.", color: GOLD },
  ];
  return (
    <svg viewBox="0 0 420 180" className="w-full max-w-lg">
      {parts.map((p, i) => (
        <g key={i} transform={`translate(10, ${30 + i * 35})`}>
          <rect x="0" y="0" width="130" height="26" fill={p.color} opacity="0.12" stroke={p.color} strokeWidth="1" rx="3" />
          <text x="8" y="17" fill={p.color} fontSize="9" fontFamily="var(--font-jetbrains)" fontWeight="600">{p.label}</text>
          <text x="145" y="17" fill="currentColor" fontSize="12" fontFamily="var(--font-jetbrains)">"{p.text}"</text>
        </g>
      ))}
      <text x="10" y="175" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">Four parts. Always in this order. Keep it short.</text>
    </svg>
  );
}

// ===== METAR BREAKDOWN (Module 12) =====
function MetarBreakdownDiagram() {
  const parts = [
    { text: "METAR", note: "type", color: SLATE },
    { text: "KSEA", note: "station", color: SKY },
    { text: "151755Z", note: "date/time", color: GOLD },
    { text: "22012G20KT", note: "wind", color: SKY },
    { text: "6SM", note: "visibility", color: GOLD },
    { text: "-RA", note: "weather", color: SKY },
    { text: "OVC025", note: "sky", color: GOLD },
    { text: "15/12", note: "temp/dew", color: SKY },
    { text: "A2992", note: "altimeter", color: GOLD },
  ];
  return (
    <svg viewBox="0 0 420 160" className="w-full max-w-lg">
      <text x="10" y="25" fill="currentColor" fontSize="13" fontFamily="var(--font-jetbrains)" fontWeight="600">METAR KSEA 151755Z 22012G20KT 6SM -RA OVC025 15/12 A2992</text>
      {parts.map((p, i) => {
        const widths = [50, 50, 65, 85, 38, 35, 65, 42, 50];
        let xPos = 10;
        for (let j = 0; j < i; j++) xPos += widths[j] + 2;
        return (
          <g key={i}>
            <line x1={xPos + widths[i] / 2} y1="32" x2={xPos + widths[i] / 2} y2="55" stroke={p.color} strokeWidth="1" opacity="0.5" />
            <line x1={xPos} y1="60" x2={xPos + widths[i]} y2="60" stroke={p.color} strokeWidth="2" />
            <text x={xPos + widths[i] / 2} y="75" textAnchor="middle" fill={p.color} fontSize="8" fontFamily="var(--font-jetbrains)">{p.note}</text>
            <text x={xPos + widths[i] / 2} y="88" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="var(--font-jetbrains)" opacity="0.5">
              {p.text === "22012G20KT" ? "220° @ 12kt, gust 20" :
               p.text === "OVC025" ? "overcast 2500ft" :
               p.text === "151755Z" ? "15th, 17:55Z" :
               p.text === "-RA" ? "light rain" :
               p.text === "A2992" ? "29.92 inHg" : ""}
            </text>
          </g>
        );
      })}
      <text x="10" y="140" fill={GOLD} fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">Decoded: Wind 220° at 12 gusting 20 kt, 6 SM vis, light rain, overcast at 2500 ft</text>
    </svg>
  );
}

// ===== ENGINE FAILURE FLOW (Module 13) =====
function EngineFailureFlowDiagram() {
  const steps = [
    { num: "1", text: "AVIATE", sub: "Best glide 65 KIAS\npitch for it NOW", color: RED },
    { num: "2", text: "NAVIGATE", sub: "Pick a field\nwithin glide range", color: SKY },
    { num: "3", text: "TROUBLESHOOT", sub: "Fuel selector BOTH\nMags BOTH, mixture RICH\nCarb heat ON", color: GOLD },
    { num: "4", text: "COMMUNICATE", sub: "Mayday on 121.5\nSquawk 7700", color: SLATE },
  ];
  return (
    <svg viewBox="0 0 420 120" className="w-full max-w-lg">
      {steps.map((s, i) => {
        const x = 15 + i * 102;
        return (
          <g key={i}>
            {i < 3 && <line x1={x + 80} y1="45" x2={x + 95} y2="45" stroke="currentColor" strokeWidth="1.5" opacity="0.3" markerEnd="url(#flowArr)" />}
            <circle cx={x + 40} cy="25" r="12" fill={s.color} opacity="0.15" stroke={s.color} strokeWidth="2" />
            <text x={x + 40} y="30" textAnchor="middle" fill={s.color} fontSize="14" fontWeight="700" fontFamily="var(--font-sora)">{s.num}</text>
            <text x={x + 40} y="55" textAnchor="middle" fill={s.color} fontSize="12" fontWeight="700" fontFamily="var(--font-sora)">{s.text}</text>
            {s.sub.split("\n").map((line, j) => (
              <text key={j} x={x + 40} y={72 + j * 12} textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.6">{line}</text>
            ))}
          </g>
        );
      })}
      <defs><marker id="flowArr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="currentColor" /></marker></defs>
    </svg>
  );
}

// ===== XC NAV LOG (Module 14) =====
function XcNavLogDiagram() {
  const rows = [
    { from: "KRNT", to: "KPAE", hdg: "335°", dist: "12nm", alt: "2500" },
    { from: "KPAE", to: "KBFI", hdg: "170°", dist: "18nm", alt: "3000" },
    { from: "KBFI", to: "KRNT", hdg: "010°", dist: "15nm", alt: "2500" },
  ];
  return (
    <svg viewBox="0 0 420 140" className="w-full max-w-lg">
      <text x="10" y="20" fill="currentColor" fontSize="10" fontFamily="var(--font-jetbrains)" opacity="0.5">FROM    TO       HDG      DIST      ALT</text>
      <line x1="10" y1="25" x2="410" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      {rows.map((r, i) => (
        <g key={i} transform={`translate(10, ${45 + i * 28})`}>
          <text x="0" y="0" fill={SKY} fontSize="11" fontFamily="var(--font-jetbrains)" fontWeight="600">{r.from}</text>
          <text x="70" y="0" fill={SKY} fontSize="11" fontFamily="var(--font-jetbrains)" fontWeight="600">{r.to}</text>
          <text x="150" y="0" fill={GOLD} fontSize="11" fontFamily="var(--font-jetbrains)">{r.hdg}</text>
          <text x="230" y="0" fill="currentColor" fontSize="11" fontFamily="var(--font-jetbrains)" opacity="0.7">{r.dist}</text>
          <text x="310" y="0" fill="currentColor" fontSize="11" fontFamily="var(--font-jetbrains)" opacity="0.7">{r.alt} ft</text>
          <line x1="0" y1="8" x2="380" y2="8" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
        </g>
      ))}
      <text x="10" y="130" fill={GOLD} fontSize="9" fontFamily="var(--font-sora)">Total: 45 nm · ~30 min · fuel: 1.5 hr reserve</text>
    </svg>
  );
}

// ===== ILS APPROACH (Module 15) =====
function IlsApproachDiagram() {
  return (
    <svg viewBox="0 0 420 200" className="w-full max-w-lg">
      {/* Runway */}
      <polygon points="340,170 390,165 385,185 335,190" fill={NAVY} opacity="0.2" />
      {/* Glideslope path */}
      <line x1="40" y1="40" x2="350" y2="175" stroke={GOLD} strokeWidth="2" strokeDasharray="4,3" />
      {/* Localizer cone */}
      <line x1="365" y1="177" x2="60" y2="20" stroke={SKY} strokeWidth="1" opacity="0.3" />
      <line x1="365" y1="177" x2="60" y2="60" stroke={SKY} strokeWidth="1" opacity="0.3" />
      <path d="M 60 20 L 60 60 L 365 177 Z" fill={SKY} opacity="0.05" />
      {/* Aircraft on glideslope */}
      <g transform="translate(180, 100) rotate(25)">
        <ellipse cx="0" cy="0" rx="6" ry="15" fill="none" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="22" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
      <text x="60" y="180" fill={SKY} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Localizer</text>
      <text x="60" y="193" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">lateral guidance</text>
      <text x="200" y="55" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Glideslope</text>
      <text x="200" y="68" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">3° vertical path</text>
      <text x="350" y="160" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.5">RUNWAY</text>
    </svg>
  );
}

// ===== C172 VS PA28 (Module 16) =====
function C172VsPa28Diagram() {
  return (
    <svg viewBox="0 0 420 180" className="w-full max-w-lg">
      {/* C172 — high wing */}
      <g transform="translate(105, 80)">
        <text x="0" y="-35" textAnchor="middle" fill={SKY} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Cessna 172</text>
        <text x="0" y="-22" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">HIGH wing</text>
        {/* Fuselage */}
        <ellipse cx="0" cy="10" rx="10" ry="40" fill="none" stroke={SKY} strokeWidth="2" />
        {/* High wing */}
        <ellipse cx="0" cy="-5" rx="60" ry="8" fill={SKY} opacity="0.15" stroke={SKY} strokeWidth="2" />
        {/* Strut */}
        <line x1="-25" y1="0" x2="-15" y2="15" stroke={SKY} strokeWidth="1" opacity="0.5" />
        <line x1="25" y1="0" x2="15" y2="15" stroke={SKY} strokeWidth="1" opacity="0.5" />
        {/* Tail */}
        <line x1="0" y1="-30" x2="0" y2="-45" stroke={SKY} strokeWidth="2" />
        <line x1="-20" y1="-45" x2="20" y2="-45" stroke={SKY} strokeWidth="2" />
        <line x1="-8" y1="-48" x2="8" y2="-48" stroke={SKY} strokeWidth="2" />
        {/* Prop */}
        <line x1="-12" y1="48" x2="12" y2="48" stroke={GOLD} strokeWidth="2" />
        <circle cx="0" cy="48" r="2" fill={GOLD} />
      </g>
      {/* PA28 — low wing */}
      <g transform="translate(315, 80)">
        <text x="0" y="-35" textAnchor="middle" fill={GOLD} fontSize="11" fontWeight="600" fontFamily="var(--font-sora)">Piper PA-28</text>
        <text x="0" y="-22" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.5">LOW wing</text>
        <ellipse cx="0" cy="10" rx="10" ry="40" fill="none" stroke={GOLD} strokeWidth="2" />
        <ellipse cx="0" cy="25" rx="60" ry="8" fill={GOLD} opacity="0.15" stroke={GOLD} strokeWidth="2" />
        <line x1="0" y1="-30" x2="0" y2="-45" stroke={GOLD} strokeWidth="2" />
        <path d="M -20 -45 L 0 -35 L 20 -45" fill="none" stroke={GOLD} strokeWidth="2" />
        <line x1="-12" y1="48" x2="12" y2="48" stroke={SKY} strokeWidth="2" />
        <circle cx="0" cy="48" r="2" fill={SKY} />
      </g>
      {/* VS divider */}
      <line x1="210" y1="20" x2="210" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3,3" />
      <text x="210" y="170" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.4">both ~160 HP · 4 seats · 110 kt cruise</text>
    </svg>
  );
}

const DIAGRAMS: Record<string, React.FC> = {
  "sim-comparison": SimComparisonDiagram,
  "six-pack": SixPackDiagram,
  "four-forces": FourForcesDiagram,
  "angle-of-attack": AngleOfAttackDiagram,
  "control-axes": ControlAxesDiagram,
  "aileron-roll": AileronRollDiagram,
  "adverse-yaw": AdverseYawDiagram,
  "cesna-panel": CesnaPanelDiagram,
  "hold-short-line": HoldShortLineDiagram,
  "takeoff-roll": TakeoffRollDiagram,
  "initial-climb": InitialClimbDiagram,
  "straight-level": StraightLevelDiagram,
  "standard-rate-turn": StandardRateTurnDiagram,
  "traffic-pattern": TrafficPatternDiagram,
  "vor-cone": VorConeDiagram,
  "radio-call-structure": RadioCallStructureDiagram,
  "metar-breakdown": MetarBreakdownDiagram,
  "engine-failure-flow": EngineFailureFlowDiagram,
  "xc-nav-log": XcNavLogDiagram,
  "ils-approach": IlsApproachDiagram,
  "c172-vs-pa28": C172VsPa28Diagram,
};

export function DiagramRenderer({ diagramKey, caption }: { diagramKey: string; caption?: string }) {
  const Diagram = DIAGRAMS[diagramKey];
  if (!Diagram) {
    return (
      <DiagramFrame caption={caption}>
        <div className="text-muted-foreground text-sm italic">Diagram: {diagramKey}</div>
      </DiagramFrame>
    );
  }
  return (
    <DiagramFrame caption={caption}>
      <Diagram />
    </DiagramFrame>
  );
}
