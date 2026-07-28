# Task ID 13+14 — Progress + Checklists Views Agent

## Task
Rewrite two React view components in the FlightCourse Academy "Glass Cockpit" design:
1. `src/components/views/progress-view.tsx` — pilot's logbook / dashboard
2. `src/components/views/checklists-view.tsx` — interactive C172 checklists

## Work Log
- Read worklog.md (Tasks 1, 3a, 3b, 3c, 3d, 4-13, V10-GLB-MODEL, V10-VISUAL-INJECTION, V11-RESEARCH) to absorb the Glass Cockpit design context (OKLCH navy + amber + cyan, Instrument Sans + JetBrains Mono, `label-instrument` mono eyebrows, `glass` cards, mono numbers, `border-t` dividers, NO emoji, NO decorative gradients).
- Read `src/app/globals.css` for utility vocabulary: `.glass`, `.bg-horizon`, `.glow-primary`, `.label-instrument`, `.nums`, `.animate-fade-up`, color tokens, button classes `fp-toggle-btn` / `fp-outline-btn`.
- Read `src/lib/progress-store.ts` — confirmed exports `useProgress` (moduleProgress, xp, badges, getCompletedCount, getLicenseTier, isModuleCompleted, resetProgress, …), `BADGES` (9 items), `LICENSE_TIERS` (4 tiers), `MODULE_BADGES`.
- Read `src/lib/data/modules.ts` — `allModules`, `TOTAL_MODULES`, `TOTAL_XP`.
- Read `src/lib/data/checklists.ts` — `checklists: Checklist[]` (5 C172 checklists).
- Read `src/lib/nav-store.ts` — `useNav` with `navigate(view, moduleId?)`, `openModule(id)`.
- Read `src/components/gauge-ring.tsx`, `src/components/ui/progress.tsx`, `src/lib/utils.ts`, `src/lib/content-types.ts` (confirmed `ModuleContent.shortTitle` exists).
- Did NOT import `FlightCourseLogo` (per task note — old import was a known breakage).
- Wrote `src/components/views/progress-view.tsx` (~280 lines):
  - Container `mx-auto w-full max-w-5xl px-4 py-12 sm:px-6` with `animate-fade-up` header.
  - Eyebrow `label-instrument text-primary` "Flight deck" + H1 "You are a {tier.name}" + tier-blurb subhead (per-tier copy for Student / Private / Instrument / Rated).
  - Top progress card (`glass` + `rounded-2xl p-6`): "X XP to next rank" / "Top rank reached — Captain" + `{xp} XP` readout + shadcn `Progress` + Continue button (`fp-toggle-btn` + ArrowRight) + "Next up: {nextModule.title}".
  - Stats grid (`grid-cols-2 lg:grid-cols-4`): XP (Star), Modules (Check), Flight hours (Clock, `(xp/10).toFixed(1) h`), Badges (Medal). Each card: icon `size-4 text-accent`, `label-instrument` label, `nums text-2xl font-medium` value + muted sub.
  - Syllabus progress section with `border-b border-border pb-3` header + "X% complete" + 4 stage cards (`glass rounded-xl p-5`) grouping modules 1-4 / 5-8 / 9-12 / 13-16. Each stage: name + done/total mono, Progress bar, `<ul>` of module buttons (Check `text-primary` if done, hollow circle if not; shortTitle muted if not done).
  - Badges section: H2 + `{earned}/{BADGES.length}` count, grid of 9 badge cards. Earned = `border-primary/40`; locked = `opacity-55` + Lock icon + "Locked" label. Earned = "Earned" label in `text-primary`.
  - Reset button at bottom: `fp-outline-btn text-destructive`, wraps in `flex justify-center`, calls `confirm()` then `resetProgress()`.
  - Imports: `ArrowRight, Check, Clock, Lock, Medal, Star` from lucide-react.
- Wrote `src/components/views/checklists-view.tsx` (~180 lines):
  - Container `mx-auto w-full max-w-4xl px-4 py-12 sm:px-6` with `animate-fade-up` header.
  - Eyebrow "Reference" + H1 "Checklists" + subhead.
  - Pill selector row: one button per checklist, active = `border-primary bg-primary text-primary-foreground`, inactive = `border-border text-muted-foreground hover:text-foreground`, all `rounded-full border px-3 py-1 text-xs font-medium`.
  - Header card (`glass rounded-xl p-5`): title, `font-mono` aircraft, description.
  - Overall progress row: `label-instrument` "{checked}/{total} complete" + Reset button (`text-accent hover:underline`) + shadcn `Progress`.
  - Sections: each in `glass rounded-xl p-5` with `label-instrument text-primary` heading + `<ul>` of items. Each item: full-width button with custom checkbox (`size-5 rounded border`, filled `border-primary bg-primary text-primary-foreground` when checked) + text (`line-through text-muted-foreground` when checked) + optional detail (`text-xs text-muted-foreground`).
  - State: `selectedIdx` + `checked: Set<string>` of `"${sectionIdx}-${itemIdx}"` keys. Reset on checklist switch via React's "adjust state during render" pattern (prev-value tracking) — avoids `useEffect` setState lint error.
  - `useMemo` for total count. `toggleItem` + `resetAll` handlers.
  - Imports: `Check` from lucide-react, `useMemo, useState` from react, `Progress`, `checklists`, `cn`.
- Ran `bun run lint` — first pass flagged `react-hooks/set-state-in-effect` in checklists-view. Refactored to the React-recommended "adjust state during render" pattern (prev-value tracker). Second pass: 0 errors, 0 warnings in either file (remaining warnings are pre-existing in unrelated files: progress-dashboard.tsx, share-card.tsx, funnel.ts).
- Ran `npx tsc --noEmit --skipLibCheck` — no errors in either file.
- Verified dev.log: prior `FlightCourseLogo` 500 was from the OLD progress-view.tsx (line 10 import). After rewrite, dev server reports `✓ Compiled in 14.3s` repeatedly. HTTP 200s on subsequent requests.

## Stage Summary
- Two view components rewritten in the Glass Cockpit design system: `progress-view.tsx` (~280 lines) and `checklists-view.tsx` (~180 lines). Both under the ~350-line guideline.
- Design adheres to spec: `label-instrument` mono eyebrows, `glass` cards, mono `nums` for all readouts, `border-b border-border pb-3` section dividers, OKLCH token colors (primary amber, accent cyan, destructive red), no emoji, no decorative gradients, no Framer Motion (only `animate-fade-up` for the header).
- Both files lint-clean and type-clean. Dev server compiles successfully after the rewrite (the prior `FlightCourseLogo` import error is gone).
- Ready for: integration testing via Agent Browser if needed; the rest of the Glass Cockpit view migration continues.
