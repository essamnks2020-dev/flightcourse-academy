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
  | "faq"
  | "flare"
  | "radio"
  | "pattern";

interface NavState {
  view: ViewName;
  moduleId: number | null;
  /** 1 = moved deeper (enter from right), -1 = moved back (enter from left). */
  dir: 1 | -1;
  navigate: (view: ViewName, moduleId?: number) => void;
  openModule: (moduleId: number) => void;
}

/** Relative depth of each view — drives the directional page transition. */
export const VIEW_DEPTH: Record<ViewName, number> = {
  home: 0,
  path: 1, cockpit: 1, glossary: 1, checklists: 1, setup: 1, progress: 1, faq: 1,
  module: 2, flare: 2, radio: 2, pattern: 2,
};

/**
 * Client-side view router. Because this environment only exposes the `/` route,
 * all "pages" are rendered as views inside page.tsx, switched by this store.
 * The browser back button is handled via history state in the app shell.
 */
export const useNav = create<NavState>()(
  persist(
    (set, get) => ({
      view: "home",
      moduleId: null,
      dir: 1,
      navigate: (view, moduleId) => {
        const from = get().view;
        const dir = VIEW_DEPTH[view] >= VIEW_DEPTH[from] ? 1 : -1;
        set({ view, moduleId: moduleId ?? null, dir });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" });
          // Push history state so back button works
          const state = { view, moduleId: moduleId ?? null };
          window.history.pushState(state, "", "/");
        }
      },
      openModule: (moduleId) => {
        set({ view: "module", moduleId, dir: 1 });
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
