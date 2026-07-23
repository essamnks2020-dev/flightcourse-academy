"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewName =
  | "home"
  | "path"
  | "module"
  | "glossary"
  | "cockpit"
  | "setup"
  | "checklists"
  | "progress"
  | "faq";

interface NavState {
  view: ViewName;
  moduleId: number | null;
  navigate: (view: ViewName, moduleId?: number) => void;
  openModule: (moduleId: number) => void;
}

/**
 * Client-side view router. Because this environment only exposes the `/` route,
 * all "pages" are rendered as views inside page.tsx, switched by this store.
 * The browser back button is handled via history state in the app shell.
 */
export const useNav = create<NavState>()(
  persist(
    (set) => ({
      view: "home",
      moduleId: null,
      navigate: (view, moduleId) => {
        set({ view, moduleId: moduleId ?? null });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" });
          // Push history state so back button works
          const state = { view, moduleId: moduleId ?? null };
          window.history.pushState(state, "", "/");
        }
      },
      openModule: (moduleId) => {
        set({ view: "module", moduleId });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" });
          window.history.pushState({ view: "module", moduleId }, "", "/");
        }
      },
    }),
    {
      name: "fp-nav",
      partialize: (s) => ({ view: s.view, moduleId: s.moduleId }),
    }
  )
);
