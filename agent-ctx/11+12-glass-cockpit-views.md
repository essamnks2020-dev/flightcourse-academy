# Task 11+12 — Glass Cockpit rewrite of cockpit-explorer + glossary views

**Agent:** Glass Cockpit Views Agent
**Scope:** Rewrite two React view files in the new Glass Cockpit design system.

## Inputs read
- `/home/z/my-project/worklog.md` — design system context (Task V11-RESEARCH)
- `/home/z/my-project/src/app/globals.css` — utilities: `glass`, `bg-horizon`, `glow-primary`, `glow-accent`, `label-instrument`, `nums`, `thin-scroll`, `animate-fade-up`, color tokens, `fp-toggle-btn`, `fp-outline-btn`
- `/home/z/my-project/src/lib/nav-store.ts` — `useNav` with `navigate(view, moduleId?)` and `openModule(id)`
- `/home/z/my-project/src/lib/data/glossary.ts` — 76 GlossaryTerm entries
- `/home/z/my-project/src/components/views/cockpit-explorer-view.tsx` (existing) — 12 HOTSPOTS preserved
- `/home/z/my-project/src/lib/data/modules.ts` — getModule helper (openModule used directly)

## Plan
- FILE 1 cockpit-explorer-view.tsx: two-column (list + sticky detail) layout, category pills, instrument list buttons with Gauge icon + mono ID eyebrow, detail card with badges + dl sections (How to read it / Scan habit / When it fails), per-instrument moduleId link.
- FILE 2 glossary-view.tsx: glass search/filter bar, category pills (All + 7), 2-col grid of term cards with definition + Why eyebrow + module link, count readout, empty state.
- Both `"use client"`, no Framer Motion, no emoji, no decorative gradients.
