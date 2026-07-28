# FlightCourse Academy — Full Game Bundle

This zip contains the complete source code for all three FlightCourse Academy
training games, the Glass Cockpit design system, and detailed improvement
prompts you can paste into another AI (z.ai, Claude, GPT) to restyle the
games.

## What's in this zip

```
├── README.md                  ← you are here (has all 3 prompts)
├── design-system/
│   ├── globals.css            ← the Glass Cockpit CSS tokens (READ THIS FIRST)
│   ├── logo.tsx               ← the FlightCourse Academy logo component
│   └── progress-store.ts      ← shared progress/badge state (Zustand)
├── flare-game/                ← Game 1: Flare Trainer (landing physics)
│   ├── flare-trainer.tsx      ← main game (~1000 lines)
│   ├── coaching-ui.tsx        ← instructor feedback panel
│   ├── cockpit-canvas.tsx     ← canvas cockpit overlay
│   ├── game-canvas.tsx        ← the physics canvas (DO NOT TOUCH)
│   ├── telemetry-chart.tsx    ← post-flight telemetry graph
│   ├── paywall-dialog.tsx     ← 5-free-trials paywall
│   ├── share-card.tsx         ← downloadable result image
│   ├── replay.tsx             ← flight replay viewer
│   └── cessna-svg.tsx         ← SVG aircraft
├── radio-builder/             ← Game 2: Radio Builder (ATC call construction)
│   ├── radio-builder.tsx      ← main game (~850 lines)
│   ├── word-block.tsx         ← draggable word tiles
│   ├── transmission-area.tsx  ← drop zone for the call
│   ├── scenario-briefing.tsx  ← scenario intro card
│   ├── scenario-menu.tsx      ← scenario picker
│   ├── feedback-panel.tsx     ← correct/incorrect feedback
│   ├── hint-panel.tsx         ← hint display
│   ├── phraseology-guide.tsx  ← reference panel
│   ├── radio-stack-header.tsx ← header bar
│   ├── result-overlay.tsx     ← end-of-round results
│   ├── say-it-mode.tsx        ← text-to-speech mode
│   ├── score-strip.tsx        ← score display
│   └── share-card-modal.tsx   ← shareable results
└── pattern-perfect/           ← Game 3: Pattern Perfect (traffic pattern sim)
    ├── PatternPerfectGame.tsx ← main game (~900 lines)
    ├── StartScreen.tsx        ← intro/menu screen
    ├── Hud.tsx                ← heads-up display overlay
    ├── Dashboard.tsx          ← stats panel
    ├── RadioCallPanel.tsx     ← radio call display
    ├── ReferencePanel.tsx     ← reference/info panel
    ├── ResultsScreen.tsx      ← post-game results
    ├── SettingsBar.tsx        ← settings controls
    ├── MobileControls.tsx     ← touch controls
    ├── CtacTranscript.tsx     ← radio transcript
    └── GameErrorBoundary.tsx  ← error fallback (leave as-is)
```

---

## The Glass Cockpit Design System

Read `design-system/globals.css` first — it defines every token. The site
looks like an avionics glass panel at night. Here's the cheat sheet:

### Colors (OKLCH — perceptual color space)
| Token | Value | Used for |
|---|---|---|
| `--background` | `oklch(0.16 0.026 254)` | Deep avionics navy (page bg) |
| `--card` | `oklch(0.213 0.028 253)` | Raised instrument bezel |
| `--primary` | `oklch(0.79 0.152 74)` | Night-lit amber (CTAs, key numbers, glow) |
| `--accent` | `oklch(0.75 0.128 205)` | Instrument cyan (secondary info, icons) |
| `--success` | `oklch(0.73 0.152 155)` | Green (correct answers, pass) |
| `--destructive` | `oklch(0.62 0.208 26)` | Red (wrong answers, fail) |
| `--muted-foreground` | `oklch(0.68 0.024 250)` | Slate (body text) |
| `--border` | `oklch(0.99 0.01 250 / 11%)` | Hairline border (semi-transparent white) |

### Fonts
- **Body**: Instrument Sans (`var(--font-body)`)
- **Readouts/labels**: JetBrains Mono (`var(--font-mono)`)
- Two fonts only. Never add a third.

### Utility classes (defined in globals.css)
| Class | What it does |
|---|---|
| `.glass` | Frosted glass card: 7% white gradient + 14px blur + hairline border |
| `.bg-grid` | 56px instrument-panel grid lines at 4% opacity |
| `.bg-horizon` | Radial amber + cyan glow at top of section |
| `.glow-primary` | Amber box-shadow glow on featured cards |
| `.glow-accent` | Cyan box-shadow glow |
| `.label-instrument` | Mono uppercase eyebrow text (0.69rem, 0.14em tracking) |
| `.nums` | JetBrains Mono with tabular-nums for readouts |
| `.text-shadow-glow` | 24px amber text-shadow |
| `.animate-sweep` | 6s radar sweep rotation |
| `.animate-drift` | 9s gentle floating |
| `.animate-pulse-ring` | 2.4s expanding pulse |
| `.animate-fade-up` | 0.5s fade + rise entrance |
| `.fp-toggle-btn` | Primary button (amber bg, dark text) |
| `.fp-outline-btn` | Secondary button (border, transparent bg) |

### The 7 rules (non-negotiable)
1. **NO emoji.** Ever. Anywhere.
2. **Two fonts only** — Instrument Sans + JetBrains Mono.
3. **All numbers** use `font-mono` or the `.nums` class (tabular-nums).
4. **All section labels** use `.label-instrument` with `text-primary` (amber) or `text-accent` (cyan).
5. **Hairline borders**, never drop shadows, on dark surfaces.
6. **Animations must be functional** (radar sweep, pulse, drift) — never decorative.
7. **Restraint is the premium signal.** One metaphor: an avionics glass panel. If it looks "busy," it's wrong.

---

## How to use the prompts below

1. Pick the game you want to improve.
2. Copy its prompt (below).
3. Open a new z.ai / Claude / GPT session.
4. Paste the prompt.
5. Upload this entire zip (or just the specific game folder + the design-system folder).
6. The AI will return restyled code. Bring it back to me and I'll integrate it.

---

## PROMPT 1 — Flare Trainer (landing physics game)

```
You are improving the visual design of a flight-simulator training game called "Flare Trainer." It's a 2D Canvas physics game that teaches pilots how to time the flare before landing a Cessna 172. The game works — do NOT change the physics, the game loop, or the scoring logic. Your job is ONLY to restyle the UI chrome (coaching panel, cockpit instruments, telemetry chart, paywall dialog, share card) to match the "Glass Cockpit" design system.

I'm attaching a zip with the full source code. The key files are in flare-game/ and design-system/.

FILES TO RESTYLE (change className/inline styles only, keep all logic):
- flare-game/flare-trainer.tsx (main game, ~1000 lines — only restyle the UI wrappers, not the canvas physics)
- flare-game/coaching-ui.tsx (instructor feedback panel — restyle fully)
- flare-game/cockpit-canvas.tsx (canvas cockpit overlay — restyle the bezels/frames)
- flare-game/telemetry-chart.tsx (post-flight telemetry graph — restyle fully)
- flare-game/paywall-dialog.tsx (5-free-trials paywall — restyle fully)
- flare-game/share-card.tsx (downloadable result image — restyle fully)
- flare-game/replay.tsx (flight replay viewer — restyle fully)
- flare-game/cessna-svg.tsx (SVG aircraft — leave as-is or minor tweaks)

FILE TO NOT TOUCH:
- flare-game/game-canvas.tsx (the physics canvas — DO NOT TOUCH)

REFERENCE (read these, do not change):
- design-system/globals.css (the design system tokens — READ THIS FIRST)
- design-system/logo.tsx (the FlightCourse Academy logo)

DESIGN SYSTEM (Glass Cockpit — like an avionics panel at night):
- Background: deep navy oklch(0.16 0.026 254)
- Primary: amber oklch(0.79 0.152 74) — used for CTAs, key numbers, glow
- Accent: cyan oklch(0.75 0.128 205) — used for secondary info, icons
- Cards: .glass class (7% white gradient + 14px blur + hairline border)
- Eyebrows: .label-instrument class (mono uppercase, 0.14em tracking)
- Numbers: .nums class (JetBrains Mono, tabular-nums)
- Glows: .glow-primary / .glow-accent (box-shadow)
- Animations: .animate-sweep (radar), .animate-pulse-ring, .animate-fade-up
- Fonts: Instrument Sans (body) + JetBrains Mono (readouts) — two fonts only

RULES:
1. NO emoji. NO Framer Motion in game components.
2. All numeric readouts (altitude, airspeed, VS, score) use font-mono / .nums
3. All section labels use .label-instrument with text-primary or text-accent
4. Cards use .glass class. Featured cards add .glow-primary
5. Keep the game canvas pixel-perfect — only restyle what wraps around it
6. The coaching UI should feel like an instructor's clipboard: clean, mono readouts, amber highlights
7. The telemetry chart should look like a flight data recorder readout
8. The paywall should feel premium, not aggressive — amber glow, clear value prop
9. Keep all existing functionality. Only change className strings and inline styles.
10. Return the complete improved files.

Please read each file, restyle it to match the Glass Cockpit system, and return the full improved code for each file.
```

---

## PROMPT 2 — Radio Builder (ATC call construction game)

```
You are improving the visual design of a flight-simulator training game called "Radio Builder." It's a drag-and-drop game where pilots build ATC radio calls by arranging word blocks into the correct order. The game works — do NOT change the drag-and-drop logic, the scoring, or the scenario data. Your job is ONLY to restyle the UI to match the "Glass Cockpit" design system.

I'm attaching a zip with the full source code. The key files are in radio-builder/ and design-system/.

FILES TO RESTYLE (change className/inline styles only, keep all logic):
- radio-builder/radio-builder.tsx (main game, ~850 lines — restyle UI, keep logic)
- radio-builder/word-block.tsx (draggable word tiles — restyle, keep DnD events)
- radio-builder/transmission-area.tsx (drop zone for the call — restyle)
- radio-builder/scenario-briefing.tsx (scenario intro card — restyle)
- radio-builder/scenario-menu.tsx (scenario picker — restyle)
- radio-builder/feedback-panel.tsx (correct/incorrect feedback — restyle)
- radio-builder/hint-panel.tsx (hint display — restyle)
- radio-builder/phraseology-guide.tsx (reference panel — restyle)
- radio-builder/radio-stack-header.tsx (header bar — restyle)
- radio-builder/result-overlay.tsx (end-of-round results — restyle)
- radio-builder/say-it-mode.tsx (text-to-speech mode — restyle)
- radio-builder/score-strip.tsx (score display — restyle)
- radio-builder/share-card-modal.tsx (shareable results — restyle)

REFERENCE (read these, do not change):
- design-system/globals.css (the design system tokens — READ THIS FIRST)
- design-system/logo.tsx (the FlightCourse Academy logo)

DESIGN SYSTEM (Glass Cockpit — like an avionics panel at night):
- Background: deep navy oklch(0.16 0.026 254)
- Primary: amber oklch(0.79 0.152 74) — CTAs, key numbers, glow
- Accent: cyan oklch(0.75 0.128 205) — secondary info, icons
- Cards: .glass class (7% white gradient + 14px blur + hairline border)
- Eyebrows: .label-instrument class (mono uppercase, 0.14em tracking)
- Numbers: .nums class (JetBrains Mono, tabular-nums)
- Glows: .glow-primary / .glow-accent
- Animations: .animate-sweep, .animate-pulse-ring, .animate-fade-up
- Fonts: Instrument Sans (body) + JetBrains Mono (readouts)

RULES:
1. NO emoji. NO Framer Motion.
2. Word blocks should look like instrument labels: mono font, hairline border, amber when selected/locked-in, cyan when hint-affected
3. The transmission area should look like a radio stack display
4. Score readouts use .nums (tabular mono)
5. The scenario briefing should feel like a flight plan card
6. Feedback (correct/wrong) uses text-success / text-destructive with .glass tint
7. Keep all drag-and-drop handlers, state, and scoring logic unchanged
8. Only change className strings, inline styles, and presentational markup
9. Return the complete improved files for every component.

Please read each file, restyle it, and return the full improved code.
```

---

## PROMPT 3 — Pattern Perfect (traffic pattern simulator)

```
You are improving the visual design of a flight-simulator training game called "Pattern Perfect." It's a Canvas2D traffic pattern simulator where pilots fly a Cessna 172 around an airport pattern with AI traffic and CTAF radio calls. The game works — do NOT change the canvas physics, the AI traffic logic, or the scoring. Your job is ONLY to restyle the UI chrome to match the "Glass Cockpit" design system.

I'm attaching a zip with the full source code. The key files are in pattern-perfect/ and design-system/.

FILES TO RESTYLE (change className/inline styles only, keep all logic):
- pattern-perfect/PatternPerfectGame.tsx (main game, ~900 lines — restyle UI wrappers only)
- pattern-perfect/StartScreen.tsx (intro/menu screen — restyle fully)
- pattern-perfect/Hud.tsx (heads-up display overlay — restyle fully)
- pattern-perfect/Dashboard.tsx (stats panel — restyle fully)
- pattern-perfect/RadioCallPanel.tsx (radio call display — restyle fully)
- pattern-perfect/ReferencePanel.tsx (reference/info panel — restyle fully)
- pattern-perfect/ResultsScreen.tsx (post-game results — restyle fully)
- pattern-perfect/SettingsBar.tsx (settings controls — restyle fully)
- pattern-perfect/MobileControls.tsx (touch controls — restyle fully)
- pattern-perfect/CtacTranscript.tsx (radio transcript — restyle fully)

FILE TO NOT TOUCH:
- pattern-perfect/GameErrorBoundary.tsx (error fallback — leave as-is)

REFERENCE (read these, do not change):
- design-system/globals.css (the design system tokens — READ THIS FIRST)
- design-system/logo.tsx (the FlightCourse Academy logo)

DESIGN SYSTEM (Glass Cockpit — like an avionics panel at night):
- Background: deep navy oklch(0.16 0.026 254)
- Primary: amber oklch(0.79 0.152 74) — CTAs, key numbers, glow
- Accent: cyan oklch(0.75 0.128 205) — secondary info, icons
- Cards: .glass class (7% white gradient + 14px blur + hairline border)
- Eyebrows: .label-instrument class (mono uppercase, 0.14em tracking)
- Numbers: .nums class (JetBrains Mono, tabular-nums)
- Glows: .glow-primary / .glow-accent
- Animations: .animate-sweep, .animate-pulse-ring, .animate-fade-up
- Fonts: Instrument Sans (body) + JetBrains Mono (readouts)

RULES:
1. NO emoji. NO Framer Motion in game components.
2. The HUD should look like a real glass-cockpit overlay: mono readouts, amber/cyan accents, hairline borders
3. Altitude/airspeed/heading readouts use .nums
4. The radio call panel should look like a COM radio display
5. The results screen should feel like a debrief: clean stats, .glass cards, .glow-primary on the score
6. The start screen should feel like a pre-flight briefing
7. Keep all canvas rendering, physics, AI traffic, and scoring logic unchanged
8. Only change className strings, inline styles, and presentational markup
9. Return the complete improved files for every component.

Please read each file, restyle it, and return the full improved code.
```

---

## Tech stack context (for the AI doing the restyling)

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 (uses `@theme inline` for tokens, `@layer utilities` for custom classes)
- **UI library**: shadcn/ui (New York style) with Lucide icons
- **State**: Zustand for client state
- **Canvas**: raw Canvas 2D API (no Three.js in the games)
- **The tokens are OKLCH** (perceptual color space) — `oklch(lightness chroma hue)` where hue 254 = navy, 74 = amber, 205 = cyan
