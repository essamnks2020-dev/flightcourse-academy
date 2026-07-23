"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, X, BookOpen, Info, ChevronRight } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

interface Hotspot {
  id: string;
  name: string;
  module: number;
  category: "Instrument" | "Control" | "Avionics" | "Switch";
  whatItDoes: string;
  howToRead: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: "asi", name: "Airspeed Indicator", module: 2, category: "Instrument", whatItDoes: "Shows your speed through the air in knots (KIAS). It works by comparing ram air pressure from the pitot tube to static air pressure.", howToRead: "White arc = flap operating range. Green arc = normal operating. Yellow arc = caution (smooth air only). Red line = never exceed (Vne)." },
  { id: "ai", name: "Attitude Indicator", module: 2, category: "Instrument", whatItDoes: "Your artificial horizon. Shows pitch (nose up/down) and bank (roll left/right) relative to the real horizon — critical when you can't see outside.", howToRead: "Blue = sky, brown = ground. The orange line between them is the horizon. The yellow wings represent your aircraft. Keep the wings level and the horizon centered for straight-and-level flight." },
  { id: "alt", name: "Altimeter", module: 2, category: "Instrument", whatItDoes: "Shows your altitude above sea level (MSL) in feet. It's a barometer — it measures air pressure, which decreases as you climb.", howToRead: "Long hand = hundreds of feet, short hand = thousands, tiny hand = ten-thousands. Read it like a clock: if the short hand is on 3 and the long on 5, you're at 3,500 ft." },
  { id: "tc", name: "Turn Coordinator", module: 2, category: "Instrument", whatItDoes: "Shows your rate of turn and whether your turn is coordinated (rudder and aileron balanced). The ball at the bottom is your inclinometer.", howToRead: "Standard rate marks (L and R) = 3°/second (a full turn in 2 minutes). 'Step on the ball' — if the ball is right of center, add right rudder." },
  { id: "hi", name: "Heading Indicator", module: 2, category: "Instrument", whatItDoes: "Shows your magnetic heading on a compass rose. More stable than the magnetic compass, which bounces in turbulence.", howToRead: "Read the number under the orange pointer. 000 = North, 090 = East, 180 = South, 270 = West. It drifts over time — realign with the compass every 15 minutes." },
  { id: "vsi", name: "Vertical Speed Indicator", module: 2, category: "Instrument", whatItDoes: "Shows your rate of climb or descent in feet per minute (fpm). Zero means level flight. It helps you hold a steady altitude.", howToRead: "Pointer above zero = climbing. Below zero = descending. For a standard climb, aim for +500 fpm. The needle lags a few seconds — don't chase it." },
  { id: "yoke", name: "Yoke (Control Wheel)", module: 2, category: "Control", whatItDoes: "Your primary flight control. Turn it left/right to control ailerons (roll). Push/pull to control the elevator (pitch). It also has buttons for trim and radio.", howToRead: "Small movements — an inch of movement is a lot. Grip it lightly, like holding a bird. Over-controlling is the #1 beginner mistake." },
  { id: "throttle", name: "Throttle", module: 2, category: "Control", whatItDoes: "Controls engine power. Push in for more power, pull out for less. Think of it like a gas pedal, but smoother and more deliberate.", howToRead: "Full throttle for takeoff and climb. Reduce to ~65% for cruise. The friction lock prevents it from creeping — tighten it once set." },
  { id: "mixture", name: "Mixture Control", module: 5, category: "Control", whatItDoes: "Controls the fuel-to-air ratio. Red knob. Rich (in) = more fuel for takeoff and low altitudes. Lean (out) = less fuel for cruise and high altitudes.", howToRead: "Full rich for takeoff and below 5,000 ft. Lean above 5,000 ft by slowly pulling out until the engine runs smoothest (peak RPM, then slightly rich)." },
  { id: "rudder", name: "Rudder Pedals", module: 4, category: "Control", whatItDoes: "Control the rudder (yaw) and steer on the ground. Left pedal = yaw/turn left. Right pedal = yaw/turn right. Tops steer the nosewheel while taxiing.", howToRead: "Use rudder to keep the ball centered in turns (coordination). On the ground, use differential braking (press a pedal further) for tight turns." },
  { id: "trim", name: "Trim Wheel", module: 2, category: "Control", whatItDoes: "Relieves control pressure so you don't have to hold the yoke. A small wheel between the seats. Nose-up = roll back, nose-down = roll forward.", howToRead: "Trim for a desired attitude, then let go — the plane should hold that attitude. 'Trim to relieve, not to steer.' Re-trim whenever you change power or airspeed." },
  { id: "flaps", name: "Flap Switch", module: 8, category: "Control", whatItDoes: "Extends flaps on the trailing edge of the wings. Flaps add lift and drag — they let you fly slower and descend more steeply for landing.", howToRead: "10° for takeoff (short field) or first notch of landing. 20° on base leg. 30° on final. Always below the white arc on the airspeed indicator." },
  { id: "radio", name: "Radio Stack (COM/NAV)", module: 11, category: "Avionics", whatItDoes: "Your communication and navigation radios. COM for talking to ATC/traffic. NAV for receiving VOR and ILS signals. Each has an active and standby frequency.", howToRead: "Tune the standby frequency, then flip the swap button to make it active. 122.700 is a common CTAF. 121.500 is the emergency frequency." },
  { id: "xponder", name: "Transponder", module: 11, category: "Avionics", whatItDoes: "Sends your altitude and a 4-digit squawk code to ATC radar. It's how controllers 'see' you on their screens.", howToRead: "Squawk 1200 = VFR, generic. 7700 = emergency. 7600 = radio failure. 7500 = hijack. Mode C (altitude reporting) should be on whenever in controlled airspace." },
  { id: "master", name: "Master Switch", module: 5, category: "Switch", whatItDoes: "Two switches: Master (alt/batt) controls the main electrical bus. The alternator side charges the battery; the battery side powers everything when the engine is off.", howToRead: "Turn ON both before engine start. The battery side powers the panel while you crank. After start, the alternator side takes over and recharges the battery." },
  { id: "magnetos", name: "Magnetos (Ignition)", module: 5, category: "Switch", whatItDoes: "The ignition system. Magnets generate spark — no battery needed once running. The key switch selects LEFT, RIGHT, BOTH, or START.", howToRead: "Start with the key to START, release to BOTH. During runup, check each magneto (L then R) for a small RPM drop — both should work independently." },
  { id: "fuel", name: "Fuel Gauges", module: 5, category: "Instrument", whatItDoes: "Show fuel quantity in each wing tank. C172 has left and right tanks. Notoriously inaccurate — trust your time-in-flight calculations more.", howToRead: "Full = about 3 hours of flight in a C172. Below 1/4 tank, start planning to land. Never trust the gauge alone — calculate fuel by gallons-per-hour × time." },
  { id: "gps", name: "GPS / Moving Map", module: 10, category: "Avionics", whatItDoes: "Modern GPS navigator (like the Garmin G1000 or GTN 750). Shows your position on a moving map, routes to waypoints, and can fly approaches.", howToRead: "The map shows airports (blue/runway shapes), airspace (lines), and your track. Direct-to button sends you straight to a waypoint. Learn VOR first — GPS is a bonus, not a crutch." },
];

// SVG positions on the panel (viewBox 800x400)
const HOTSPOT_POSITIONS: Record<string, { x: number; y: number; r: number }> = {
  asi: { x: 145, y: 95, r: 38 },
  ai: { x: 235, y: 95, r: 38 },
  alt: { x: 325, y: 95, r: 38 },
  tc: { x: 145, y: 185, r: 38 },
  hi: { x: 235, y: 185, r: 38 },
  vsi: { x: 325, y: 185, r: 38 },
  yoke: { x: 235, y: 310, r: 30 },
  throttle: { x: 580, y: 300, r: 18 },
  mixture: { x: 625, y: 300, r: 18 },
  rudder: { x: 100, y: 360, r: 22 },
  trim: { x: 530, y: 340, r: 16 },
  flaps: { x: 700, y: 300, r: 16 },
  radio: { x: 470, y: 100, r: 28 },
  xponder: { x: 470, y: 180, r: 22 },
  master: { x: 660, y: 95, r: 18 },
  magnetos: { x: 720, y: 95, r: 18 },
  fuel: { x: 660, y: 180, r: 18 },
  gps: { x: 560, y: 200, r: 22 },
};

const CATEGORY_COLORS: Record<Hotspot["category"], string> = {
  Instrument: "#3E92CC",
  Control: "#F2B134",
  Avionics: "#6FB3DE",
  Switch: "#5B6B79",
};

export function CockpitExplorerView() {
  const navigate = useNav((s) => s.navigate);
  const [selected, setSelected] = React.useState<Hotspot | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
          <Gauge className="w-4 h-4" />
          Interactive · Cessna 172 Panel
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Cockpit Explorer
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Click any instrument or control to learn what it does and how to read
          it. This is a Cessna 172 Skyhawk panel — the most common trainer
          aircraft in the world, and the one this course is built around.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel SVG */}
        <div className="lg:col-span-2">
          <div className="fp-bezel bg-card p-3 sm:p-5">
            <div className="relative">
              <svg viewBox="0 0 800 400" className="w-full h-auto" role="img" aria-label="Interactive Cessna 172 instrument panel">
                {/* Panel background */}
                <rect x="0" y="0" width="800" height="400" fill="var(--color-navy)" opacity="0.05" rx="6" />
                <rect x="5" y="5" width="790" height="390" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.15" rx="4" />

                {/* Panel section dividers */}
                <line x1="410" y1="20" x2="410" y2="250" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
                <line x1="630" y1="20" x2="630" y2="380" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />

                {/* Six-pack instruments */}
                {["asi", "ai", "alt", "tc", "hi", "vsi"].map((id) => {
                  const pos = HOTSPOT_POSITIONS[id];
                  return <InstrumentFace key={id} id={id} pos={pos} hovered={hovered === id} selected={selected?.id === id} onSelect={() => setSelected(HOTSPOTS.find(h => h.id === id)!)} onHover={setHovered} />;
                })}

                {/* Radio stack */}
                <rect x="425" y="50" width="60" height="200" fill="none" stroke={CATEGORY_COLORS.Avionics} strokeWidth="1" opacity="0.4" rx="3" />
                <text x="455" y="42" textAnchor="middle" fill={CATEGORY_COLORS.Avionics} fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.6">RADIOS</text>
                {[60, 90, 120, 150, 180, 210, 240].map((y, i) => (
                  <rect key={i} x="432" y={y} width="46" height="24" fill="var(--color-navy)" opacity="0.15" stroke={CATEGORY_COLORS.Avionics} strokeWidth="0.5" rx="2" />
                ))}

                {/* Transponder */}
                <rect x="440" y="160" width="60" height="36" fill="none" stroke={CATEGORY_COLORS.Avionics} strokeWidth="1" opacity="0.4" rx="3" />

                {/* GPS */}
                <rect x="510" y="170" width="100" height="70" fill="none" stroke={CATEGORY_COLORS.Avionics} strokeWidth="1" opacity="0.4" rx="3" />
                <text x="560" y="165" textAnchor="middle" fill={CATEGORY_COLORS.Avionics} fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.6">GPS</text>

                {/* Switches panel */}
                <rect x="640" y="60" width="40" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" rx="2" />
                {[68, 80, 92, 104, 116, 128].map((y, i) => (
                  <rect key={i} x="650" y={y} width="6" height="10" fill={i < 3 ? CATEGORY_COLORS.Switch : "var(--color-muted)"} opacity="0.6" rx="1" />
                ))}
                {/* Magneto key */}
                <circle cx="720" cy="100" r="12" fill="none" stroke={CATEGORY_COLORS.Switch} strokeWidth="1.5" opacity="0.5" />
                <text x="720" y="104" textAnchor="middle" fill={CATEGORY_COLORS.Switch} fontSize="8" fontFamily="var(--font-jetbrains)" opacity="0.6">KEY</text>

                {/* Fuel gauges */}
                <rect x="645" y="160" width="30" height="40" fill="none" stroke={CATEGORY_COLORS.Instrument} strokeWidth="0.5" opacity="0.3" rx="2" />
                <rect x="650" y="190" width="20" height="6" fill={CATEGORY_COLORS.Instrument} opacity="0.4" />

                {/* Throttle quadrant */}
                <rect x="555" y="280" width="170" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" rx="3" />
                <rect x="575" y="288" width="10" height="35" fill={CATEGORY_COLORS.Control} opacity="0.7" rx="2" />
                <rect x="620" y="293" width="10" height="30" fill={CATEGORY_COLORS.Control} opacity="0.5" rx="2" />
                <rect x="665" y="293" width="10" height="30" fill="var(--color-muted)" opacity="0.4" rx="2" />
                {/* Flap lever */}
                <rect x="690" y="285" width="25" height="40" fill="none" stroke={CATEGORY_COLORS.Control} strokeWidth="0.5" opacity="0.4" rx="2" />

                {/* Trim wheel */}
                <circle cx="530" cy="340" r="12" fill="none" stroke={CATEGORY_COLORS.Control} strokeWidth="1.5" opacity="0.5" />
                {Array.from({length: 8}).map((_,i) => {
                  const a = (i/8)*360;
                  const rad = (a*Math.PI)/180;
                  return <line key={i} x1={530+8*Math.cos(rad)} y1={340+8*Math.sin(rad)} x2={530+12*Math.cos(rad)} y2={340+12*Math.sin(rad)} stroke={CATEGORY_COLORS.Control} strokeWidth="1" opacity="0.4" />;
                })}

                {/* Yoke */}
                <circle cx="235" cy="310" r="28" fill="none" stroke={CATEGORY_COLORS.Control} strokeWidth="2" opacity="0.4" />
                <line x1="215" y1="310" x2="255" y2="310" stroke={CATEGORY_COLORS.Control} strokeWidth="2" opacity="0.5" />
                <line x1="235" y1="290" x2="235" y2="330" stroke={CATEGORY_COLORS.Control} strokeWidth="2" opacity="0.5" />

                {/* Rudder pedals (simplified) */}
                <ellipse cx="100" cy="365" rx="20" ry="8" fill="none" stroke={CATEGORY_COLORS.Control} strokeWidth="1.5" opacity="0.4" />
                <ellipse cx="160" cy="365" rx="20" ry="8" fill="none" stroke={CATEGORY_COLORS.Control} strokeWidth="1.5" opacity="0.4" />

                {/* Clickable hotspot overlays */}
                {HOTSPOTS.map((hs) => {
                  const pos = HOTSPOT_POSITIONS[hs.id];
                  if (!pos) return null;
                  const isHovered = hovered === hs.id;
                  const isSelected = selected?.id === hs.id;
                  const isSixPack = ["asi","ai","alt","tc","hi","vsi"].includes(hs.id);
                  return (
                    <g key={hs.id}>
                      {/* Invisible larger hit area (skip for six-pack — InstrumentFace handles clicks) */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={pos.r + 6}
                        fill="transparent"
                        className="cursor-pointer"
                        style={{ pointerEvents: isSixPack ? "none" : "auto" }}
                        onClick={() => !isSixPack && setSelected(hs)}
                        onMouseEnter={() => !isSixPack && setHovered(hs.id)}
                        onMouseLeave={() => setHovered(null)}
                      />
                      {/* Highlight ring on hover/select */}
                      {(isHovered || isSelected) && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={pos.r + 2}
                          fill="none"
                          stroke={isSelected ? "var(--color-gold)" : CATEGORY_COLORS[hs.category]}
                          strokeWidth="2"
                          opacity="0.8"
                        >
                          <animate attributeName="r" values={`${pos.r + 2};${pos.r + 5};${pos.r + 2}`} dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* Hotspot dot for non-instrument items */}
                      {!["asi","ai","alt","tc","hi","vsi"].includes(hs.id) && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="4"
                          fill={isSelected ? "var(--color-gold)" : CATEGORY_COLORS[hs.category]}
                          opacity={isHovered ? 1 : 0.7}
                          className="cursor-pointer pointer-events-none"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Hover tooltip label */}
                {hovered && HOTSPOT_POSITIONS[hovered] && (
                  <g>
                    {(() => {
                      const pos = HOTSPOT_POSITIONS[hovered];
                      const hs = HOTSPOTS.find(h => h.id === hovered);
                      if (!hs) return null;
                      return (
                        <>
                          <rect x={pos.x - 60} y={pos.y - pos.r - 28} width="120" height="20" fill="var(--color-card)" stroke={CATEGORY_COLORS[hs.category]} strokeWidth="1" rx="3" />
                          <text x={pos.x} y={pos.y - pos.r - 14} textAnchor="middle" fontSize="9" fontFamily="var(--font-jetbrains)" fill="currentColor">{hs.name}</text>
                        </>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>

            {/* Category legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border text-xs font-mono">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <span key={cat} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  {cat}
                </span>
              ))}
              <span className="text-muted-foreground ml-auto">{HOTSPOTS.length} hotspots · click to explore</span>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fp-bezel bg-card p-6 sticky top-20"
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest px-2 py-1"
                    style={{ backgroundColor: `${CATEGORY_COLORS[selected.category]}22`, color: CATEGORY_COLORS[selected.category] }}
                  >
                    {selected.category}
                  </span>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-heading font-bold text-xl mb-3">{selected.name}</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-sky mb-1">What It Does</div>
                    <p className="text-muted-foreground leading-relaxed">{selected.whatItDoes}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gold mb-1">How To Read It</div>
                    <p className="text-muted-foreground leading-relaxed">{selected.howToRead}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("module", selected.module)}
                  className="fp-toggle-btn w-full mt-6 py-2.5 text-sm flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Learn in Module {selected.module}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fp-bezel bg-card p-6 sticky top-20"
              >
                <Info className="w-8 h-8 text-sky mb-3" />
                <h3 className="font-heading font-bold text-base mb-2">Click an instrument</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Click any instrument or control on the panel to see what it
                  does, how to read it, and which lesson covers it in depth.
                </p>
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Quick Start</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-sky">▸</span> The six-pack (top-left cluster) is your core flight instruments</li>
                  <li className="flex gap-2"><span className="text-sky">▸</span> The radio stack (right of center) handles comms and nav</li>
                  <li className="flex gap-2"><span className="text-sky">▸</span> Throttle and mixture are bottom-right</li>
                  <li className="flex gap-2"><span className="text-sky">▸</span> Switches and keys are top-right</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Instrument face renderer
function InstrumentFace({ id, pos, hovered, selected, onSelect, onHover }: {
  id: string;
  pos: { x: number; y: number; r: number };
  hovered: boolean;
  selected: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}) {
  const cx = pos.x, cy = pos.y, r = pos.r;
  return (
    <g
      className="cursor-pointer"
      onClick={onSelect}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Bezel */}
      <circle cx={cx} cy={cy} r={r} fill="var(--color-card)" stroke="var(--color-slate)" strokeWidth="2" opacity="0.9" />
      <circle cx={cx} cy={cy} r={r - 3} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {/* Tick marks */}
      {Array.from({ length: 12 }).map((_, t) => {
        const a = (t / 12) * 360 - 90;
        const rad = (a * Math.PI) / 180;
        const major = t % 3 === 0;
        return (
          <line
            key={t}
            x1={cx + (r - 7) * Math.cos(rad)}
            y1={cy + (r - 7) * Math.sin(rad)}
            x2={cx + (r - 2) * Math.cos(rad)}
            y2={cy + (r - 2) * Math.sin(rad)}
            stroke="currentColor"
            strokeWidth={major ? 1.2 : 0.5}
            opacity={major ? 0.5 : 0.3}
          />
        );
      })}
      {/* Instrument-specific face */}
      {id === "asi" && (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--color-sky)" fontSize="14" fontFamily="var(--font-jetbrains)" fontWeight="700">120</text>
          <text x={cx} y={cy + 6} textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">KNOTS</text>
          <line x1={cx} y1={cy} x2={cx + 18} y2={cy - 8} stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {id === "ai" && (
        <>
          <clipPath id={`clip-ai-${id}`}>
            <circle cx={cx} cy={cy} r={r - 5} />
          </clipPath>
          <g clipPath={`url(#clip-ai-${id})`}>
            <rect x={cx - r} y={cy - r} width={r * 2} height={r} fill="var(--color-sky)" opacity="0.35" />
            <rect x={cx - r} y={cy} width={r * 2} height={r} fill="var(--color-navy)" opacity="0.5" />
          </g>
          <line x1={cx - r + 5} y1={cy} x2={cx + r - 5} y2={cy} stroke="var(--color-gold)" strokeWidth="1" />
          <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke="var(--color-gold)" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="2" fill="var(--color-gold)" />
        </>
      )}
      {id === "alt" && (
        <>
          <text x={cx} y={cy + 3} textAnchor="middle" fill="var(--color-sky)" fontSize="12" fontFamily="var(--font-jetbrains)" fontWeight="700">3,500</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="currentColor" fontSize="5" opacity="0.5">FT</text>
          <line x1={cx} y1={cy} x2={cx + 10} y2={cy - 18} stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={cx - 12} y2={cy + 8} stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {id === "tc" && (
        <>
          <line x1={cx - 24} y1={cy - 10} x2={cx + 24} y2={cy - 10} stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <line x1={cx - 16} y1={cy + 4} x2={cx + 16} y2={cy + 4} stroke="var(--color-gold)" strokeWidth="2" />
          <circle cx={cx} cy={cy + 4} r="4" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
          <rect x={cx - 14} y={cy + 14} width="28" height="7" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" rx="3.5" />
          <circle cx={cx - 3} cy={cy + 17.5} r="2.5" fill="var(--color-cloud)" opacity="0.6" />
        </>
      )}
      {id === "hi" && (
        <>
          <circle cx={cx} cy={cy} r={r - 8} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          {["N", "E", "S", "W"].map((d, j) => {
            const a = (j / 4) * 360 - 90;
            const rad = (a * Math.PI) / 180;
            return <text key={d} x={cx + (r - 15) * Math.cos(rad)} y={cy + (r - 15) * Math.sin(rad) + 3} textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="600" opacity="0.5">{d}</text>;
          })}
          <polygon points={`${cx},${cy - r + 8} ${cx - 3},${cy} ${cx + 3},${cy}`} fill="var(--color-gold)" />
        </>
      )}
      {id === "vsi" && (
        <>
          <text x={cx} y={cy + 3} textAnchor="middle" fill="var(--color-sky)" fontSize="10" fontFamily="var(--font-jetbrains)" fontWeight="700">+500</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="currentColor" fontSize="5" opacity="0.5">FPM</text>
          <line x1={cx} y1={cy} x2={cx + 14} y2={cy - 14} stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* Hover highlight */}
      {(hovered || selected) && (
        <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke={selected ? "var(--color-gold)" : "var(--color-sky)"} strokeWidth="2" opacity="0.8">
          <animate attributeName="r" values={`${r + 1};${r + 4};${r + 1}`} dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}
