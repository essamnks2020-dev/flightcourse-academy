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

export default function Page() {
  const view = useNav((s) => s.view);
  const moduleId = useNav((s) => s.moduleId);
  const navigate = useNav((s) => s.navigate);

  // Handle browser back/forward
  React.useEffect(() => {
    const handler = (e: PopStateEvent) => {
      const state = e.state as { view?: string; moduleId?: number } | null;
      if (state?.view) {
        navigate(state.view as any, state.moduleId);
      } else {
        navigate("home");
      }
    };
    window.addEventListener("popstate", handler);
    // Replace initial state
    window.history.replaceState({ view: "home" }, "", "/");
    return () => window.removeEventListener("popstate", handler);
  }, [navigate]);

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
