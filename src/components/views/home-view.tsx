"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Gauge, BookOpen, CheckSquare, Award, Sparkles, ChevronRight, Plane, Cloud } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import { allModules, TOTAL_MODULES } from "@/lib/data/modules";
import { glossary } from "@/lib/data/glossary";
import { Aircraft3D } from "@/components/3d/aircraft-3d";
import { GaugeRing } from "@/components/gauge-ring";
import { cn } from "@/lib/utils";

export function HomeView() {
  const navigate = useNav((s) => s.navigate);
  const openModule = useNav((s) => s.openModule);
  const xp = useProgress((s) => s.xp);
  const completedCount = useProgress((s) => s.getCompletedCount());
  const isCompleted = useProgress((s) => s.isModuleCompleted);

  const firstFive = allModules.slice(0, 5);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden fp-sky-grain">
        {/* Sky gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1D3A] via-[#14264a] to-[#3E92CC]/30" />
        <div className="absolute inset-0 dark:block hidden bg-gradient-to-b from-[#07152A] via-[#0B1D3A] to-[#14264a]" />

        {/* Stars (dark mode) */}
        <div className="absolute inset-0 dark:block hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 50}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.6 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Drifting clouds (parallax layers) */}
        <CloudLayer speed={60} opacity={0.06} className="top-[15%]" />
        <CloudLayer speed={90} opacity={0.08} className="top-[35%]" />
        <CloudLayer speed={120} opacity={0.05} className="top-[55%]" />

        {/* Horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F2B134]/15 to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-8 items-center w-full">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 border border-gold/30 bg-gold/5 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-mono uppercase tracking-widest text-gold-light">
                From Zero to Wheels Up
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-cloud"
            >
              Learn to Fly.
              <br />
              <span className="text-sky-light">For Real,</span> In The Sim.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-cloud/70 max-w-lg leading-relaxed"
            >
              A complete course that takes you from zero aviation knowledge to
              confidently flying a Cessna 172 in MSFS or X-Plane. Cockpit
              basics, aerodynamics, procedures, navigation, radio comms — all
              taught the way a real flight instructor would. Patient. Precise.
              No jargon without explanation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={() => navigate("path")}
                className="fp-toggle-btn px-6 py-3.5 text-sm flex items-center justify-center gap-2 group"
              >
                Start the Learning Path
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("cockpit")}
                className="fp-outline-btn px-6 py-3.5 text-sm flex items-center justify-center gap-2 border-sky/50 text-cloud"
                style={{ borderColor: "rgba(62,146,204,0.5)" }}
              >
                <Gauge className="w-4 h-4" />
                Explore the Cockpit First
              </button>
            </motion.div>

            {/* Stat bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-mono text-cloud/60"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-gold font-bold">{TOTAL_MODULES}</span> Modules
              </span>
              <span className="text-cloud/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="text-gold font-bold">{glossary.length}+</span> Terms Demystified
              </span>
              <span className="text-cloud/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="text-gold font-bold">Zero</span> Experience Required
              </span>
            </motion.div>
          </div>

          {/* 3D Aircraft */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px]"
          >
            <Aircraft3D className="w-full h-full" />
            {/* Floating gauge badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-4 fp-bezel bg-card/90 backdrop-blur p-3 hidden sm:block"
            >
              <GaugeRing value={completedCount > 0 ? (completedCount / 16) * 100 : 8} size={64} strokeWidth={5} label={`${completedCount}/16`} sublabel="modules" color="var(--color-gold)" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-8 left-4 fp-bezel bg-card/90 backdrop-blur p-3 hidden sm:block"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Hours Logged</div>
              <div className="font-heading font-bold text-2xl text-sky">{(xp / 10).toFixed(1)}h</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cloud/40"
        >
          <ChevronRight className="w-6 h-6 rotate-90" />
        </motion.div>
      </section>

      {/* ===== WHY FLIGHTPATH ===== */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-sky mb-2">Why FlightPath</div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight max-w-2xl">
              Built for the person who's never touched a yoke.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUE_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="fp-bezel bg-card p-6 flex flex-col"
              >
                <div className="w-11 h-11 flex items-center justify-center mb-4 border border-sky/30 bg-sky/5">
                  <card.icon className="w-5 h-5 text-sky" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PATH PREVIEW ===== */}
      <section className="py-20 px-4 sm:px-6 bg-card/30 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-sky mb-2">The Learning Path</div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight">
                Your flight plan, module by module.
              </h2>
            </div>
            <button
              onClick={() => navigate("path")}
              className="fp-outline-btn px-5 py-2.5 text-sm flex items-center gap-2"
            >
              View Full Path
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto fp-scroll pb-4 -mx-4 px-4 snap-x">
            {firstFive.map((mod, i) => {
              const completed = isCompleted(mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => openModule(mod.id)}
                  className="fp-bezel bg-card p-5 min-w-[280px] snap-start text-left hover:border-sky/50 transition-colors group flex-shrink-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Module {String(mod.id).padStart(2, "0")} of 16
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5",
                        mod.difficulty === "Beginner" && "bg-green-500/15 text-green-600",
                        mod.difficulty === "Foundational" && "bg-sky/15 text-sky",
                        mod.difficulty === "Intermediate" && "bg-gold/15 text-gold-dark",
                        mod.difficulty === "Advanced" && "bg-red-500/15 text-red-600"
                      )}
                    >
                      {mod.difficulty}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base mb-1.5 group-hover:text-sky transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {mod.tagline}
                  </p>
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span>{mod.estimatedMinutes} min</span>
                    <span className="text-gold">+{mod.xpReward / 10}h</span>
                  </div>
                  {completed && (
                    <div className="mt-2 text-[10px] font-mono text-green-600 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> Completed
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURE STRIP: ASYMMETRIC ===== */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="text-xs font-mono uppercase tracking-widest text-gold mb-2">Cockpit Explorer</div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-4">
              Click any instrument. Learn what it does.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our interactive Cessna 172 panel has 15+ hotspots — from the
              six-pack instruments to the magneto switch. Click anything and get
              a plain-English explainer with a link to the full lesson. It's the
              fastest way to stop feeling overwhelmed in the cockpit.
            </p>
            <button
              onClick={() => navigate("cockpit")}
              className="fp-toggle-btn px-5 py-3 text-sm flex items-center gap-2"
            >
              <Gauge className="w-4 h-4" />
              Open the Cockpit Explorer
            </button>
          </div>
          <div className="lg:col-span-3">
            <div className="fp-bezel bg-card p-6 sm:p-8 relative overflow-hidden">
              <CockpitTeaserSVG />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 px-4 sm:px-6 bg-card/30 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-sky mb-2">What Pilots Say</div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight">
              Sample voices from the pattern.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="fp-bezel bg-card p-6 flex flex-col"
              >
                <div className="text-gold text-3xl font-heading leading-none mb-3">"</div>
                <blockquote className="text-sm leading-relaxed flex-1 mb-4">
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky to-navy flex items-center justify-center text-cloud font-heading font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8 italic font-mono">
            Sample content — representative of the FlightPath Academy experience.
          </p>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1D3A] to-[#14264a] dark:from-[#07152A] dark:to-[#0B1D3A] px-4 sm:px-6 py-20">
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <Compass className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-cloud tracking-tight mb-4">
              Your First Flight Starts With One Click.
            </h2>
            <p className="text-cloud/60 text-lg max-w-xl mx-auto mb-8">
              No account. No credit card. No prior knowledge. Just you, a
              simulator, and sixteen modules that turn "I've always wanted to
              fly" into "Gear up, flaps up, runway heading."
            </p>
            <button
              onClick={() => navigate("path")}
              className="fp-toggle-gold fp-toggle-btn px-8 py-4 text-base inline-flex items-center gap-2"
            >
              <Plane className="w-5 h-5" />
              Begin Module 1: Welcome to Flight Simulation
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-cloud/40 text-xs font-mono mt-6">
              ~12 minutes · Beginner · No simulator required to start reading
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ===== Sub-components =====

function CloudLayer({ speed, opacity, className }: { speed: number; opacity: number; className?: string }) {
  return (
    <div className={cn("absolute inset-x-0", className)} style={{ opacity }}>
      <motion.div
        animate={{ x: ["-20%", "120%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <svg width="600" height="120" viewBox="0 0 600 120" className="opacity-70">
          <ellipse cx="100" cy="60" rx="80" ry="25" fill="white" />
          <ellipse cx="200" cy="55" rx="60" ry="30" fill="white" />
          <ellipse cx="320" cy="60" rx="90" ry="28" fill="white" />
          <ellipse cx="450" cy="55" rx="70" ry="25" fill="white" />
        </svg>
      </motion.div>
    </div>
  );
}

function CockpitTeaserSVG() {
  return (
    <svg viewBox="0 0 500 280" className="w-full h-auto">
      {/* Panel frame */}
      <rect x="10" y="10" width="480" height="260" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" rx="8" />
      {/* Six instruments */}
      {[
        { cx: 90, cy: 90, r: 42, label: "ASI" },
        { cx: 190, cy: 90, r: 42, label: "AI" },
        { cx: 290, cy: 90, r: 42, label: "ALT" },
        { cx: 90, cy: 190, r: 42, label: "TC" },
        { cx: 190, cy: 190, r: 42, label: "HI" },
        { cx: 290, cy: 190, r: 42, label: "VSI" },
      ].map((g, i) => (
        <g key={i}>
          <circle cx={g.cx} cy={g.cy} r={g.r} fill="none" stroke="var(--color-sky)" strokeWidth="1.5" opacity="0.4" />
          <circle cx={g.cx} cy={g.cy} r={g.r - 4} fill="var(--color-card)" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          {Array.from({ length: 10 }).map((_, t) => {
            const a = (t / 10) * 360 - 90;
            const rad = (a * Math.PI) / 180;
            return <line key={t} x1={g.cx + (g.r - 8) * Math.cos(rad)} y1={g.cy + (g.r - 8) * Math.sin(rad)} x2={g.cx + (g.r - 3) * Math.cos(rad)} y2={g.cy + (g.r - 3) * Math.sin(rad)} stroke="currentColor" strokeWidth="0.5" opacity="0.3" />;
          })}
          <text x={g.cx} y={g.cy + 4} textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="var(--font-jetbrains)" opacity="0.4">{g.label}</text>
          {/* Hotspot pulse */}
          <circle cx={g.cx} cy={g.cy} r={g.r} fill="none" stroke="var(--color-gold)" strokeWidth="1.5" opacity="0.3">
            <animate attributeName="r" values={`${g.r};${g.r + 6};${g.r}`} dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          </circle>
        </g>
      ))}
      {/* Radio stack */}
      <rect x="360" y="40" width="60" height="200" fill="none" stroke="var(--color-sky)" strokeWidth="1" opacity="0.3" rx="4" />
      <text x="390" y="32" textAnchor="middle" fill="var(--color-sky)" fontSize="9" fontFamily="var(--font-jetbrains)" opacity="0.6">RADIOS</text>
      {[55, 85, 115, 145, 175, 205].map((y, i) => (
        <rect key={i} x="370" y={y} width="40" height="22" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" rx="2" />
      ))}
      <text x="430" y="250" fill="var(--color-gold)" fontSize="10" fontFamily="var(--font-sora)" fontWeight="600">15+ hotspots →</text>
    </svg>
  );
}

// ===== Data =====
const VALUE_CARDS = [
  {
    icon: Plane,
    title: "Built for Zero Experience",
    body: "We assume you've never sat in a cockpit. Every term is defined. Every concept starts from 'why does this even exist?' No prerequisites except curiosity.",
  },
  {
    icon: Gauge,
    title: "Learn by Doing",
    body: "Every module ends with 'Try It In The Sim' — concrete steps to fire up MSFS or X-Plane and apply what you just learned. Reading is good. Flying is better.",
  },
  {
    icon: Award,
    title: "Real Aviation Standards",
    body: "This isn't arcade trivia. We teach real Cessna 172 procedures, real radio call structure, real METAR decoding. The same fundamentals a CFI would teach on day one.",
  },
  {
    icon: Sparkles,
    title: "Actually Fun",
    body: "Earn flight hours, unlock badges, watch your license tier climb from Student Pilot to Rated. Gamification that respects your intelligence, not condescending stars and emojis.",
  },
];

// Sample testimonials — marked as sample content
const TESTIMONIALS = [
  {
    quote: "I'd owned MSFS for two years and never made it past the startup checklist. FlightPath's Module 5 walked me through the C172 startup in plain English — now I'm flying circuits every evening.",
    name: "Marcus T.",
    role: "MSFS 2024 · 3 months in",
  },
  {
    quote: "The radio comms module finally made CTAF clicks. I actually called 'downwind' on a multiplayer server and someone responded 'number two, cleared to land.' I nearly fell out of my chair.",
    name: "Priya K.",
    role: "X-Plane 12 · 6 months in",
  },
  {
    quote: "As a student pilot working toward my PPL, I use FlightPath to review concepts before lessons. The aerodynamics section explains lift correctly — unlike half the YouTube videos out there.",
    name: "Daniel R.",
    role: "Real-world student pilot",
  },
];
