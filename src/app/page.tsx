"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "@/lib/nav-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeView } from "@/components/views/home-view";
import { LearningPathView } from "@/components/views/learning-path-view";
import { ModuleView } from "@/components/views/module-view";
import { GlossaryView } from "@/components/views/glossary-view";
import CockpitExplorerView from "@/components/views/cockpit-explorer-view";
import { SetupGuideView } from "@/components/views/setup-guide-view";
import { ChecklistsView } from "@/components/views/checklists-view";
import { ProgressView } from "@/components/views/progress-view";
import { FaqView } from "@/components/views/faq-view";

// ===== Premium loading screen =====
// Full cinematic sequence: ambient sky → ring draws → horizon → compass → brand → fade
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050d1c] overflow-hidden relative">
      {/* Deep sky gradient */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 100%, #1a3a5c 0%, #0B1D3A 30%, #07152A 60%, #050d1c 100%)",
      }} />

      {/* Aurora glow — slowly drifting */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(62,146,204,0.12) 0%, transparent 50%)",
          filter: "blur(60px)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Stars — twinkling */}
      <div className="absolute inset-0">
        {LOADING_STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: `${s.top}%`, left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px` }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Horizon glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40" style={{
        background: "linear-gradient(to top, rgba(242,177,52,0.2) 0%, transparent 100%)",
      }} />

      {/* Center content */}
      <motion.div
        className="relative flex flex-col items-center gap-5 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated logo — larger, more cinematic */}
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 60px rgba(62,146,204,0.3)" }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <svg viewBox="0 0 100 100" className="w-24 h-24 relative">
            <defs>
              <linearGradient id="loadRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3E92CC" />
                <stop offset="50%" stopColor="#6FB3DE" />
                <stop offset="100%" stopColor="#F2B134" />
              </linearGradient>
              <linearGradient id="loadSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3E92CC" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3E92CC" stopOpacity="0.05" />
              </linearGradient>
              <radialGradient id="loadGlow" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#F2B134" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#F2B134" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient glow */}
            <circle cx="50" cy="50" r="44" fill="url(#loadGlow)" />

            {/* Outer ring — draws in clockwise */}
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke="url(#loadRingGrad)" strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
              animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "center" }}
            />

            {/* Sky half */}
            <motion.path
              d="M 8 50 A 42 42 0 0 1 92 50 Z" fill="url(#loadSkyGrad)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            />

            {/* Horizon line — gold, draws across with glow */}
            <motion.line x1="8" y1="50" x2="92" y2="50" stroke="#F2B134" strokeWidth="2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.line x1="8" y1="50" x2="92" y2="50" stroke="#F2B134" strokeWidth="4" opacity="0.2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Compass marks */}
            <motion.line x1="50" y1="6" x2="50" y2="12" stroke="#F2B134" strokeWidth="2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
            />
            <motion.line x1="50" y1="88" x2="50" y2="94" stroke="currentColor" strokeWidth="1" opacity="0.3"
              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.0 }}
            />
            <motion.line x1="6" y1="50" x2="12" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3"
              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.0 }}
            />
            <motion.line x1="88" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3"
              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.0 }}
            />

            {/* Flight path — draws in with glow */}
            <motion.path
              d="M 28 58 Q 50 20 72 58" fill="none" stroke="#3E92CC" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M 28 58 Q 50 20 72 58" fill="none" stroke="#6FB3DE" strokeWidth="5" strokeLinecap="round" opacity="0.2"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.0, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Arrow tip + gold dot */}
            <motion.polygon points="72,58 68,52 72,54 76,52" fill="#3E92CC"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 2.2, ease: [0.34, 1.56, 0.64, 1] }}
            />
            <motion.circle cx="72" cy="58" r="4" fill="#F2B134"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 2.0, ease: [0.34, 1.56, 0.64, 1] }}
            />
            <motion.circle cx="72" cy="58" r="8" fill="#F2B134" opacity="0.2"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 2.0, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </svg>
        </div>

        {/* Brand text — staggered reveal */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          <motion.div
            className="font-heading font-bold text-xl tracking-tight text-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            FlightPath Academy
          </motion.div>
          <motion.div
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-sky mt-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            From Zero to Wheels Up
          </motion.div>
        </motion.div>

        {/* Progress bar — animated fill */}
        <motion.div
          className="w-40 h-0.5 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #3E92CC, #F2B134)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      </motion.div>

      {/* Film grain */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}

// Deterministic stars for loading screen
const LOADING_STARS = Array.from({ length: 30 }, (_, i) => {
  const seed = i * 7919 + 31;
  const r1 = ((seed % 233280) / 233280);
  const r2 = (((seed * 13) % 233280) / 233280);
  const r3 = (((seed * 17) % 233280) / 233280);
  return { top: r1 * 70, left: r2 * 100, size: 1 + r3 * 2, dur: 2 + r3 * 3, delay: r1 * 3 };
});

// ===== Page transition variants =====
// Each view change: old content fades+blurs+slides out, new content fades+unblurs+slides in
const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: "blur(8px)",
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
      opacity: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
      filter: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(6px)",
    scale: 0.99,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as const,
      opacity: { duration: 0.2 },
      filter: { duration: 0.2 },
    },
  },
};

export default function Page() {
  const view = useNav((s) => s.view);
  const moduleId = useNav((s) => s.moduleId);
  const navigate = useNav((s) => s.navigate);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handler = (e: PopStateEvent) => {
      const state = e.state as { view?: string; moduleId?: number } | null;
      if (state?.view) {
        navigate(state.view as any, state.moduleId);
      } else {
        navigate("home");
      }
    };
    window.addEventListener("popstate", handler);
    window.history.replaceState({ view: "home" }, "", "/");
    return () => window.removeEventListener("popstate", handler);
  }, [navigate]);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${moduleId}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {view === "home" && <HomeView />}
            {view === "path" && <LearningPathView />}
            {view === "module" && moduleId && <ModuleView moduleId={moduleId} />}
            {view === "glossary" && <GlossaryView />}
            {view === "cockpit" && <CockpitExplorerView />}
            {view === "setup" && <SetupGuideView />}
            {view === "checklists" && <ChecklistsView />}
            {view === "progress" && <ProgressView />}
            {view === "faq" && <FaqView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
