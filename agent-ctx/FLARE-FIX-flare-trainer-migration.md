# Task ID: FLARE-FIX — Flare Trainer token migration + progress-store bridge

## Scope
Migrate the 8 flare-game component files from dead Glass Cockpit design tokens to canonical classes, AND bridge the flare-specific progress store (`src/stores/progress-store.ts`) to the main site-wide progress store (`src/lib/progress-store.ts`) so good landings award XP toward license tiers.

## Files touched
- `src/stores/progress-store.ts` — added `useProgress` import + XP bridge in `recordAttempt`
- `src/components/flare-game/coaching-ui.tsx` — token migration + new `score` prop on DebriefCard + XP-earned banner with `inferQuality` helper
- `src/components/flare-game/flare-trainer.tsx` — token migration + passed `score={attempt.score}` to DebriefCard
- `src/components/flare-game/telemetry-chart.tsx` — token migration + recharts stroke/fill mapped to CSS vars
- `src/components/flare-game/paywall-dialog.tsx` — token migration + reframed copy ("Unlock the full flight-school track")
- `src/components/flare-game/share-card.tsx` — token migration + removed unused eslint-disable directive
- `src/components/flare-game/replay.tsx` — token migration
- `src/components/flare-game/cessna-svg.tsx` — replaced `var(--font-jetbrains)` → `var(--font-mono)` (×2 SVG text elements)
- `src/components/flare-game/cockpit-canvas.tsx` — NOT TOUCHED (no dead refs found; pure canvas drawing)

## NOT touched
- `src/components/flare-game/game-canvas.tsx` — spec forbade touching the physics canvas (only remaining `var(--font-jetbrains)` ref in the codebase, falls back to `monospace` silently)

## Token migration map applied
| Dead class | Canonical class |
|---|---|
| `text-horizon-gold` | `text-primary` |
| `bg-horizon-gold` | `bg-primary` |
| `border-horizon-gold` | `border-primary` |
| `ring-horizon-gold` | `ring-primary` |
| `text-navy` | `text-primary-foreground` (on amber buttons) / `text-background` (elsewhere) |
| `bg-navy` | `bg-background` |
| `text-e0a04a` (typo) | `text-primary` (warn verdict) |
| `fc-pulse-gold` | `animate-pulse-ring` |
| `text-sky` | `text-accent` |
| `bg-sky` | `bg-accent` |
| `border-sky` | `border-accent` |
| `text-gold` | `text-primary` |
| `bg-gold` | `bg-primary` |
| `border-gold` | `border-primary` |
| `fp-glass` | `glass` |
| `font-heading` | `font-semibold tracking-tight` |
| `font-sora` | removed, or `font-semibold tracking-tight` on headings |
| `font-jetbrains` | `font-mono` |
| `var(--font-jetbrains)` (in cessna-svg) | `var(--font-mono)` |

## Inline style hex migrations
- `linear-gradient(180deg,#ffe9a0,#F2B134)` (bezel toggle active) → `var(--primary)` with `inset 0 1px 0 rgba(255,255,255,0.5)` highlight
- `rgba(242,177,52,0.35)` (GUIDED pill glow) → `color-mix(in oklch, var(--primary) 35%, transparent)`
- `1px solid rgba(242,177,52,0.4)` (GUIDED border) → `1px solid var(--primary)`
- Recharts stroke `#F2B134` → `var(--primary)`, `#3E92CC` → `var(--accent)`, `#e0584f` → `var(--destructive)`
- Recharts Tooltip contentStyle `rgba(11,29,58,0.95)` → `var(--background)`, `rgba(62,146,204,0.3)` → `var(--border)`

## NOT migrated (intentionally)
- Canvas drawing colors inside `cockpit-canvas.tsx`, `share-card.tsx` `generateShareCard()`, `cessna-svg.tsx` SVG fill/stroke, `flare-trainer.tsx` `METAL_GRADIENT` constant — these are artwork, not inline styles or design tokens. The spec explicitly said only className strings + inline style colors + store bridge.
- `QUALITY_COLORS` map in `src/lib/aviation.ts` — game logic that maps landing quality to a per-result color (greaser=gold, good=sky, crash=red). Game logic stays unchanged per spec.
- Recharts `#5f7a99` axis tick fill and `#8aa3c4` label color — slate text colors that aren't brand tokens.
- Generic `rgba(255,255,255,0.0X)` gridlines — generic white overlays, not brand colors.

## Store bridge implementation
In `src/stores/progress-store.ts`:
1. Added `import { useProgress } from '@/lib/progress-store'` after the funnel import (top of file). No circular dep: `lib/progress-store.ts` doesn't import from `stores/`.
2. Inside `recordAttempt`, after the `set({...})` + `track.gameComplete(...)` calls but before `return`, added:
```typescript
if (['greaser', 'good', 'firm'].includes(a.quality)) {
  const xpGain = a.quality === 'greaser' ? 5 : a.quality === 'good' ? 3 : 2
  useProgress.setState((s) => ({ xp: s.xp + xpGain }))
}
```
Synchronous, no async needed. Safe on SSR — `useProgress.setState` is just a Zustand store setter, no DOM access.

## DebriefCard XP banner
The `Debrief` type in `src/lib/coaching.ts` doesn't expose `quality` (only headline/summary/cause/fix/insights/tip). Per spec instruction:
- Added optional `score?: number` prop to DebriefCard
- Added `inferQuality(debrief, score)` helper that maps `headline.startsWith('Outstanding' | 'Nice work' | 'Acceptable')` → greaser/good/firm (these are the canonical headline prefixes from `headlineFor()` in coaching.ts), with score-based fallback (≥90 greaser, ≥75 good, ≥60 firm)
- Renders the spec'd banner: `<div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5"><Sparkles className="size-3.5 shrink-0 text-primary" /><p className="text-xs text-foreground/80"><span className="font-semibold text-primary">+{xpGain} XP</span> logged toward your next rating.</p></div>` — only when `xpGain > 0`
- Imported `Sparkles` from lucide-react
- Updated flare-trainer.tsx ResultScreen to pass `<DebriefCard debrief={debrief} score={attempt.score} />`

## Paywall reframe
In `src/components/flare-game/paywall-dialog.tsx`, primary card:
- Headline: "Unlimited Flare Practice" → "Unlock the full flight-school track"
- Description: "One-time unlock. Practice the flare as many times as you like, forever." → "Unlimited flare practice, all 16 ground-school modules, three training sims, and progress toward your pilot rating."
- Price ($4.99), unlock button text, mechanic unchanged.

## Lint verification
- `bun run lint` → 0 errors, 0 warnings in any modified file
- 3 pre-existing warnings remain in unrelated files (`_bundle/flare-game/share-card.tsx` bundle copy, `dashboard/progress-dashboard.tsx`, `lib/funnel.ts`)
- TypeScript pre-existing errors in `flare-game/replay.tsx` line 15 (frameToState — untouched by this task) and other unrelated files are NOT introduced by this work

## Stats
- ~95 className substitutions across 7 component files
- 2 dead CSS variable refs (`var(--font-jetbrains)`) migrated in cessna-svg.tsx
- 8 inline-style hex/rgba colors migrated to CSS vars
- 1 store bridge added (3 lines of XP logic + 1 import)
- 1 new component prop (DebriefCard `score?`)
- 1 new helper function (`inferQuality`)
- 1 paywall copy reframe (headline + description)
- 0 game logic / physics / scoring / state changes
