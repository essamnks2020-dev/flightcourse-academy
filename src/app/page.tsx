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
import { CockpitExplorerView } from "@/components/views/cockpit-explorer-view";
import { SetupGuideView } from "@/components/views/setup-guide-view";
import { ChecklistsView } from "@/components/views/checklists-view";
import { ProgressView } from "@/components/views/progress-view";
import { FaqView } from "@/components/views/faq-view";

// Premium loading screen — animated logo with horizon draw-in
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, rgba(62,146,204,0.08) 0%, transparent 60%)",
      }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 fp-grid-bg opacity-20" />

      <motion.div
        className="relative flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated logo */}
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <defs>
            <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3E92CC" />
              <stop offset="100%" stopColor="#F2B134" />
            </linearGradient>
          </defs>
          {/* Outer ring — draws in */}
          <motion.circle
            cx="40" cy="40" r="34" fill="none" stroke="url(#loadGrad)" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Horizon line — draws across */}
          <motion.line
            x1="8" y1="40" x2="72" y2="40"
            stroke="#F2B134" strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Sky half */}
          <motion.path
            d="M 8 40 A 32 32 0 0 1 72 40 Z" fill="#3E92CC" opacity="0.15"
            initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />
          {/* Flight path arrow — draws in */}
          <motion.path
            d="M 22 48 Q 40 16 58 48" fill="none" stroke="#3E92CC" strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.circle cx="58" cy="48" r="3" fill="#F2B134"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>

        {/* Brand text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="font-heading font-bold text-lg tracking-tight">FlightPath Academy</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky mt-1">From Zero to Wheels Up</div>
        </motion.div>

        {/* Progress dots */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-sky"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

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

  // Server renders a loading shell; client mounts the full app.
  // This eliminates all hydration mismatches from framer-motion/Zustand/Three.js.
  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${moduleId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
