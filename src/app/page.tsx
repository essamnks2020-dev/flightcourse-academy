"use client";

import * as React from "react";
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
import { FlightPathLogo } from "@/components/navbar";

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
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="h-16" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-sky/30 border-t-sky rounded-full animate-spin" />
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Initializing FlightPath Academy...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {view === "home" && <HomeView />}
        {view === "path" && <LearningPathView />}
        {view === "module" && moduleId && <ModuleView moduleId={moduleId} />}
        {view === "glossary" && <GlossaryView />}
        {view === "cockpit" && <CockpitExplorerView />}
        {view === "setup" && <SetupGuideView />}
        {view === "checklists" && <ChecklistsView />}
        {view === "progress" && <ProgressView />}
        {view === "faq" && <FaqView />}
      </main>
      <Footer />
    </div>
  );
}
