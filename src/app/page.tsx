"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "@/lib/nav-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MouseTracker } from "@/components/mouse-tracker";
import { ThemeFX } from "@/components/theme-fx";
import { HomeView } from "@/components/views/home-view";
import { LogoMark } from "@/components/brand/logo";

// All secondary views are lazy-loaded so Turbopack only compiles the active
// view's dependency tree. This keeps the dev server within the sandbox
// memory budget (4 GB, no swap) and speeds up initial load.
const LearningPathView = React.lazy(() =>
  import("@/components/views/learning-path-view").then((m) => ({ default: m.LearningPathView }))
);
const ModuleView = React.lazy(() =>
  import("@/components/views/module-view").then((m) => ({ default: m.ModuleView }))
);
const GlossaryView = React.lazy(() =>
  import("@/components/views/glossary-view").then((m) => ({ default: m.GlossaryView }))
);
const CockpitExplorerView = React.lazy(() =>
  import("@/components/views/cockpit-explorer-view").then((m) => ({ default: m.default }))
);
const SetupGuideView = React.lazy(() =>
  import("@/components/views/setup-guide-view").then((m) => ({ default: m.SetupGuideView }))
);
const ChecklistsView = React.lazy(() =>
  import("@/components/views/checklists-view").then((m) => ({ default: m.ChecklistsView }))
);
const ProgressView = React.lazy(() =>
  import("@/components/views/progress-view").then((m) => ({ default: m.ProgressView }))
);
const FaqView = React.lazy(() =>
  import("@/components/views/faq-view").then((m) => ({ default: m.FaqView }))
);
const FlareTrainer = React.lazy(() =>
  import("@/components/flare-game/flare-trainer").then((m) => ({ default: m.FlareTrainer }))
);
const RadioBuilder = React.lazy(() =>
  import("@/components/flightcourse/radio-builder/radio-builder").then((m) => ({
    default: m.RadioBuilder,
  }))
);
const PatternPerfectGame = React.lazy(() =>
  import("@/components/pattern-perfect/PatternPerfectGame").then((m) => ({
    default: m.PatternPerfectGame,
  }))
);

// Minimal loading state — a single attitude-indicator mark + fade.
function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <LogoMark className="size-12" />
      </motion.div>
      <motion.div
        className="mt-5 h-0.5 w-24 overflow-hidden rounded-full bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </div>
  );
}

function ViewFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="animate-ai-spin-up"
      >
        <LogoMark className="size-12" />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <p className="label-instrument text-primary">{label}</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Subtle page transition — fade + slight rise.
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
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
    <div className="flex min-h-screen flex-col bg-background">
      <ThemeFX />
      <MouseTracker />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${moduleId}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {view === "home" && <HomeView />}
            {view === "path" && (
              <React.Suspense fallback={<ViewFallback label="Loading syllabus" />}><LearningPathView /></React.Suspense>
            )}
            {view === "module" && moduleId && (
              <React.Suspense fallback={<ViewFallback label="Loading module" />}><ModuleView moduleId={moduleId} /></React.Suspense>
            )}
            {view === "glossary" && (
              <React.Suspense fallback={<ViewFallback label="Loading glossary" />}><GlossaryView /></React.Suspense>
            )}
            {view === "cockpit" && (
              <React.Suspense fallback={<ViewFallback label="Loading cockpit" />}><CockpitExplorerView /></React.Suspense>
            )}
            {view === "setup" && (
              <React.Suspense fallback={<ViewFallback label="Loading setup guide" />}><SetupGuideView /></React.Suspense>
            )}
            {view === "checklists" && (
              <React.Suspense fallback={<ViewFallback label="Loading checklists" />}><ChecklistsView /></React.Suspense>
            )}
            {view === "progress" && (
              <React.Suspense fallback={<ViewFallback label="Loading dashboard" />}><ProgressView /></React.Suspense>
            )}
            {view === "faq" && (
              <React.Suspense fallback={<ViewFallback label="Loading FAQ" />}><FaqView /></React.Suspense>
            )}
            {view === "flare" && (
              <React.Suspense fallback={<ViewFallback label="Prepping the runway" />}>
                <FlareTrainer />
              </React.Suspense>
            )}
            {view === "radio" && (
              <React.Suspense fallback={<ViewFallback label="Tuning the radio" />}>
                <RadioBuilder />
              </React.Suspense>
            )}
            {view === "pattern" && (
              <React.Suspense fallback={<ViewFallback label="Entering the pattern" />}>
                <PatternPerfectGame />
              </React.Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
