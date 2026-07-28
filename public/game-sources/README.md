# FlightCourse Academy — Game Improvement Prompts

You're getting three prompts below, one per game. Each prompt is designed to
be pasted into a new z.ai (or Claude/GPT) session along with the matching
source-code zip. The other AI will improve the game's visuals to match our
"Glass Cockpit" design system while keeping the game logic intact.

## How to use these

1. Download the zip for the game you want to improve.
2. Open a new z.ai session.
3. Paste the prompt for that game (below).
4. Upload the zip when the AI asks for the source code.
5. When the AI returns improved code, bring it back here and I'll integrate it.

---

## Design system reference (shared by all three prompts)

The site uses a "Glass Cockpit" aesthetic — like an avionics panel at night.
The exact CSS tokens are in `src/app/globals.css` (included in every zip).
Key utilities:

| Utility | What it does |
|---|---|
| `glass` | Frosted glass card: 7% white gradient + 14px blur + hairline border |
| `bg-grid` | 56px instrument-panel grid lines at 4% opacity |
| `bg-horizon` | Radial amber + cyan glow at top of section |
| `glow-primary` | Amber box-shadow glow on featured cards |
| `glow-accent` | Cyan box-shadow glow |
| `label-instrument` | Mono uppercase eyebrow text (0.69rem, 0.14em tracking) |
| `nums` | JetBrains Mono with tabular-nums for readouts |
| `text-shadow-glow` | 24px amber text-shadow |
| `animate-sweep` | 6s radar sweep rotation |
| `animate-drift` | 9s gentle floating |
| `animate-pulse-ring` | 2.4s expanding pulse |
| `animate-fade-up` | 0.5s fade + rise entrance |

**Colors** (OKLCH):
- Background: `oklch(0.16 0.026 254)` — deep avionics navy
- Primary: `oklch(0.79 0.152 74)` — night-lit amber
- Accent: `oklch(0.75 0.128 205)` — instrument cyan
- Success: `oklch(0.73 0.152 155)` — green
- Destructive: `oklch(0.62 0.208 26)` — red
- Muted foreground: `oklch(0.68 0.024 250)` — slate

**Fonts**: Instrument Sans (body) + JetBrains Mono (readouts). Two fonts only.

**Rules**:
- NO emoji anywhere. Ever.
- NO Framer Motion in games (the games use their own canvas/physics).
- All numbers use `font-mono` or the `nums` class.
- Eyebrows/labels use `label-instrument text-primary` or `text-accent`.
- Hairline borders, never drop shadows, on dark surfaces.
- Animations must be functional (radar sweep, pulse, drift) — never decorative.
- Restraint is the premium signal. One metaphor: an avionics glass panel.

---

## Prompt 1 — Flare Trainer (landing physics game)

```
You are improving the visual design of a flight-simulator training game called "Flare Trainer." It's a 2D Canvas physics game that teaches pilots how to time the flare before landing a Cessna 172. The game works — do NOT change the physics, the game loop, or the scoring logic. Your job is ONLY to restyle the UI chrome (coaching panel, cockpit instruments, telemetry chart, paywall dialog, share card) to match the "Glass Cockpit" design system.

I'm attaching a zip with the full source code. The key files are:
- flare-trainer.tsx (main game, ~1000 lines — only restyle the UI wrappers, not the canvas physics)
- coaching-ui.tsx (instructor feedback panel — restyle fully)
- cockpit-canvas.tsx (canvas cockpit overlay — restyle the bezels/frames)
- telemetry-chart.tsx (post-flight telemetry graph — restyle fully)
- paywall-dialog.tsx (5-free-trials paywall — restyle fully)
- share-card.tsx (downloadable result image — restyle fully)
- cessna-svg.tsx (SVG aircraft — leave as-is or minor tweaks)
- game-canvas.tsx (the physics canvas — DO NOT TOUCH)

Also included: src/app/globals.css (the design system tokens) and src/components/brand/logo.tsx (the logo).

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

**Download**: `/game-sources/flare-trainer-source.zip`

---

## Prompt 2 — Radio Builder (ATC call construction game)

```
You are improving the visual design of a flight-simulator training game called "Radio Builder." It's a drag-and-drop game where pilots build ATC radio calls by arranging word blocks into the correct order. The game works — do NOT change the drag-and-drop logic, the scoring, or the scenario data. Your job is ONLY to restyle the UI to match the "Glass Cockpit" design system.

I'm attaching a zip with the full source code. The key files are:
- radio-builder.tsx (main game, ~850 lines — restyle UI, keep logic)
- word-block.tsx (draggable word tiles — restyle, keep DnD events)
- transmission-area.tsx (drop zone for the call — restyle)
- scenario-briefing.tsx (scenario intro card — restyle)
- scenario-menu.tsx (scenario picker — restyle)
- feedback-panel.tsx (correct/incorrect feedback — restyle)
- hint-panel.tsx (hint display — restyle)
- phraseology-guide.tsx (reference panel — restyle)
- radio-stack-header.tsx (header bar — restyle)
- result-overlay.tsx (end-of-round results — restyle)
- say-it-mode.tsx (text-to-speech mode — restyle)
- score-strip.tsx (score display — restyle)
- share-card-modal.tsx (shareable results — restyle)

Also included: src/app/globals.css (design tokens) and src/components/brand/logo.tsx.

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

**Download**: `/game-sources/radio-builder-source.zip`

---

## Prompt 3 — Pattern Perfect (traffic pattern simulator)

```
You are improving the visual design of a flight-simulator training game called "Pattern Perfect." It's a Canvas2D traffic pattern simulator where pilots fly a Cessna 172 around an airport pattern with AI traffic and CTAF radio calls. The game works — do NOT change the canvas physics, the AI traffic logic, or the scoring. Your job is ONLY to restyle the UI chrome to match the "Glass Cockpit" design system.

I'm attaching a zip with the full source code. The key files are:
- PatternPerfectGame.tsx (main game, ~900 lines — restyle UI wrappers only)
- StartScreen.tsx (intro/menu screen — restyle fully)
- Hud.tsx (heads-up display overlay — restyle fully)
- Dashboard.tsx (stats panel — restyle fully)
- RadioCallPanel.tsx (radio call display — restyle fully)
- ReferencePanel.tsx (reference/info panel — restyle fully)
- ResultsScreen.tsx (post-game results — restyle fully)
- SettingsBar.tsx (settings controls — restyle fully)
- MobileControls.tsx (touch controls — restyle fully)
- CtacTranscript.tsx (radio transcript — restyle fully)
- GameErrorBoundary.tsx (error fallback — leave as-is)

Also included: src/app/globals.css (design tokens) and src/components/brand/logo.tsx.

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

**Download**: `/game-sources/pattern-perfect-source.zip`

---

## Combined download

If you want to send all three games at once: `/game-sources/all-games-source.zip`
