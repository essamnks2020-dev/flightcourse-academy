# Pattern Perfect — FlightCourse Mini-game 3

A browser-based flight-training simulator teaching the standard VFR traffic
pattern at non-towered airports (entry → downwind → base → final → rollout),
the five required CTAF radio calls, and safe sequencing around other traffic —
grounded in FAA AC 90-66C and AIM 4-1-9 phraseology.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 ·
shadcn/ui · Framer Motion · Zustand (+localStorage) · Canvas2D ·
Web Audio API · Prisma (SQLite) · z-ai-web-dev-sdk (image gen, TTS, chat).

## Setup

```bash
bun install                # or npm install
bun run db:push            # create the SQLite database (optional — game runs without it)
bun run dev                # starts on http://localhost:3000
```

Open http://localhost:3000 — that's the only route.

## What's included

- `src/` — all source code (app, components, lib, store, hooks)
- `src/lib/pattern/` — the simulation engine (geometry, physics, ai-traffic,
  scoring, camera, particles, audio, render, share-card, radio-voice, assets)
- `src/lib/data/` — FAA-accurate phraseology + scenarios + ground-school content
- `src/lib/store/` — Zustand progress store (XP, levels, streaks, achievements,
  weak-area tracking, persisted settings)
- `src/components/pattern-perfect/` — all UI components
- `src/app/api/` — funnel, TTS (hash-cached), and AI-debrief API routes
- `scripts/generate-art.ts` — one-off art asset generator (uses z-ai-web-dev-sdk)
- `public/art/` — generated illustrated sprites (c172-top, taildragger-top)
- `prisma/schema.prisma` — database schema
- `worklog.md` — full build history (every phase documented)

## Regenerating art assets

The shipped app includes two illustrated sprites (c172-top.png, taildragger-top.png).
To regenerate all assets (requires the z-ai-web-dev-sdk config at /etc/.z-ai-config):

```bash
bun run scripts/generate-art.ts
```

The renderer falls back to procedural canvas drawing for any missing asset, so
the game is 100% playable with zero generated assets.

## TTS cache

Radio-call voice audio is cached in `.tts-cache/` (gitignored). First call to a
new phrase hits the SDK (~4s); repeats serve from cache (~20ms).

## Controls

- **Bank:** ←/→ or A/D (on-screen buttons on touch)
- **Pause:** Space (disabled in Practical Test mode)
- **Radio panel:** number keys 1-5 to select, Enter to transmit, arrows to navigate

## Key accuracy points (non-negotiable)

- Airport name bookends every CTAF transmission (start AND end)
- Actual runway number spoken as digits ("runway two-seven"), never "the active"
- "any traffic in the area, please advise" is a permanent wrong-answer distractor
- Left/right traffic mirrored via the side normal vector (no special-casing)
- Turn-rate from real formula: rate = g·tan(bank)/V
- 120Hz fixed-timestep physics (identical at 60fps and 120fps)
- Sequencing is the hardest-weighted scoring category
- A near-miss forces a redo UNLESS the player executes a correct go-around
