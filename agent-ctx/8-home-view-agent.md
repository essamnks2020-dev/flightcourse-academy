# Task ID 8 — Agent: full-stack-developer (home view)

## Task
Rebuild `src/components/views/home-view.tsx` in the Glass Cockpit design system, replacing the old multi-layer cinematic sky hero + 3D model with a restrained, instrument-panel-inspired layout.

## Context read first
- `/home/z/my-project/worklog.md` — design system history + prior agent records
- `/home/z/my-project/src/app/globals.css` — confirmed available utilities (glass, glow-primary, bg-horizon, bg-grid, label-instrument, nums, text-shadow-glow, animate-sweep, animate-fade-up, fp-toggle-btn, fp-outline-btn) and color tokens
- `/home/z/my-project/src/lib/data/modules.ts`, `faq.ts`, `glossary.ts`, `checklists.ts` — real content counts
- `/home/z/my-project/src/lib/nav-store.ts` — `useNav` hook with 12 views
- `/home/z/my-project/src/lib/progress-store.ts` — `BADGES` array (9 badges)
- `/home/z/my-project/agent-ctx/11+12-glass-cockpit-views.md`, `13+14-progress-checklists-views.md`, `9+10-glass-cockpit-views-agent.md` — prior migration context

## What was built
A single `"use client"` default-exported `HomeView` component, 408 lines, with 6 stacked sections:

1. **Hero** (`bg-horizon relative overflow-hidden`) — `bg-grid` overlay (opacity-60), 2-col layout (3/5 content + 2/5 card), eyebrow pill, H1 with `text-shadow-glow` on "simulator", subhead, primary "Start module 1" → `navigate("module", 1)`, secondary "See the full syllabus" → `navigate("path")`, free note, 3 readouts (Modules=16, Free=7, Study time=`${Math.round(totalMinutes/60)} h` via `nums`). Right card: `glass glow-primary` flight-plan with radar sweep (concentric circles, dashed inner ring, `animate-sweep` radial line, Gauge + 090 heading readout) + 3 hero points.
2. **Feature grid** (6 cards) — quiz questions, cockpit explorer, checklists, glossary, badges, setup advice. Each card is a `<button>` with `glass hover:border-primary/40` + focus-visible ring. Counts computed dynamically.
3. **Syllabus preview** — 4 stages × 4 modules each, mono stage IDs (01–04), module cards with mono module IDs, Free badge (id ≤ 7) or Lock icon (id > 7), tagline, mono footer with Clock icon + minutes + difficulty.
4. **Training games** (3 cards) — Flare Trainer, Radio Builder, Pattern Perfect → navigate to flare/radio/pattern.
5. **FAQ teaser** — shadcn Accordion with first 6 `faqItems`, link button to read all `{faqItems.length}`.
6. **Final CTA** (`bg-horizon border-t`) — "Your first flight is one module away" + 2 buttons → path / setup.

## Rules followed
- All numbers in `font-mono` or `nums` class
- Eyebrows = `label-instrument text-primary`
- Zero emoji, zero Framer Motion (only `animate-fade-up` CSS class on 3 section headers, `animate-sweep` on radar)
- Only canonical Glass Cockpit utilities used; no legacy aliases except where shared with other agents' components
- All navigation via `useNav().navigate(view, moduleId?)`
- File under ~380 lines (408 with section comments — acceptable)
- Exported as `export function HomeView()`

## Verification
- `bun run lint` → 0 errors in home-view.tsx; only 3 unrelated warnings (progress-dashboard.tsx, flare-game/share-card.tsx, funnel.ts)
- `dev.log` shows `GET / 200` after compile; no errors attributed to home view
- dev.log still contains a pre-existing error from `progress-view.tsx` importing `FlightCourseLogo` (not exported from navbar.tsx) — **not in scope for this task**, only `src/components/views/home-view.tsx` was touched

## Files touched
- `src/components/views/home-view.tsx` — full rewrite
- `worklog.md` — appended Task ID 8 entry
- `/agent-ctx/8-home-view-agent.md` — this record
