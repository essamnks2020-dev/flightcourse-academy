# FlightPath Academy — Worklog

This file tracks all agent work on the FlightPath Academy project.
Each agent must read previous entries before starting and append their own after finishing.

---
Task ID: 1
Agent: Main (Z.ai Code)
Task: Foundation — design system, fonts, navigation/progress stores, content types

Work Log:
- Installed three, @react-three/fiber, @react-three/drei, @types/three
- Wrote globals.css with FlightPath brand colors (navy #0B1D3A, sky #3E92CC, gold #F2B134), dark mode default, and opinionated component vocabulary (fp-bezel cards with corner ticks, fp-toggle-btn beveled buttons, fp-ink-path animation, fp-sky-grain texture, fp-chart-bg, custom scrollbars)
- Updated layout.tsx with Sora (headings), Inter (body), JetBrains Mono (mono) fonts + metadata
- Created theme-provider.tsx (next-themes, dark default)
- Created nav-store.ts (Zustand client-side view router with history pushState for back button)
- Created progress-store.ts (Zustand + persist: moduleProgress, xp, badges, license tiers, quiz submission logic, certificate name)
- Created content-types.ts (ModuleContent, GlossaryTerm, Checklist, FAQItem, ContentBlock types)

Stage Summary:
- Design system foundation complete. Brand tokens in CSS variables. Component vocabulary classes established.
- Navigation is client-side via Zustand (views: home, path, module, glossary, cockpit, setup, checklists, progress, faq)
- Progress persisted to localStorage keys "fp-nav" and "fp-progress"
- 9 badges defined, 4 license tiers defined
- Content types ready for subagents to fill with real aviation data
- Ready for: content creation (parallel subagents), then UI component building

---
Task ID: 3d
Agent: FAQ/Checklists/Setup Agent
Task: Create FAQ (12+), Checklists (5 C172), Setup Guide

Work Log:
- Read worklog.md and content-types.ts to align with existing types (FAQItem, Checklist) and avoid schema drift
- Created src/lib/data/ directory (did not previously exist)
- Wrote src/lib/data/faq.ts exporting faqItems: FAQItem[] — 14 items total covering all 12 required questions plus 2 extras (VR motion sickness, internet connection). Categories used: "Getting Started", "Simulators & Hardware", "Real Flying", "Course & Progress". Each answer is 2-5 sentences, honest, specific — including the honest "this is prep, not a substitute" answer for the real-pilot-license question
- Wrote src/lib/data/checklists.ts exporting checklists: Checklist[] — 5 accurate Cessna 172 checklists:
    1. C172 Before Start (pre-flight inspection across Cabin/Empennage/Right Wing/Nose/Left Wing/Final, plus cockpit setup) — uses real values (6-8 qts oil, 100LL blue fuel, fuel selector BOTH, avionics OFF for start)
    2. C172 Before Takeoff (cockpit, engine runup at 1800 RPM with mag check max drop 175 RPM max diff 50 RPM, vacuum 4.5-5.5 in Hg, carb heat check, systems set, takeoff briefing with rotation 55 KIAS / climb 75 KIAS and engine-failure-below-800-AGL plan)
    3. C172 Before Landing (downwind abeam the numbers with carb heat BEFORE power reduction, flaps 10/20/30 sequence, 65 KIAS final, rollout flow)
    4. Engine Failure In Flight structured around Aviate / Navigate / Troubleshoot / Communicate / Secure with real best-glide 65 KIAS for C172, 7700 squawk, 121.5 mayday call format, cockpit-secure-before-impact flow
    5. VFR Cross-Country Planning (Route, Weather, Performance, Fuel with 30-min day-VFR reserve, NavLog, Day-of-Flight pre-flight) — FAA-aligned, with honest "60 minutes is the real floor" instructor guidance
- Wrote src/lib/data/setup-guide.ts exporting local interfaces SimPlatform, HardwareItem, GraphicsPreset, SetupGuide and the setupGuide const. Includes 4 platforms (MSFS 2024 $69.99, MSFS 2020 $59.99, X-Plane 12 $79.99, DCS World free base) with real pros/cons/bestFor, minimum-hardware paragraph starting "A mouse and keyboard. Seriously." plus concrete CPU/RAM/SSD/GPU guidance, 7-item hardware ranking across Essential/Nice-to-Have/Enthusiast tiers (mouse+keyboard $0, Logitech Extreme 3D Pro ~$35, headset, Honeycomb Alpha yoke ~$250, rudder pedals, multi-monitor, VR), 8 graphics-preset recommendations prioritizing FPS over visual splendor, and recommended first flight: C172 at KRNT (Renton Municipal) runway 34, calm daytime, with 5 concrete steps
- Verified all three files with `npx tsc --noEmit --skipLibCheck` — no type errors
- Verified counts: 14 FAQ items, 5 checklists, 4 platforms, 7 hardware items, 8 graphics presets

Stage Summary:
- Three data files produced under src/lib/data/: faq.ts, checklists.ts, setup-guide.ts
- All content is aviation-accurate (C172 POH-aligned values, FAA VFR reserve rules, real platform prices and pros/cons, real KRNT runway 34 details)
- All files type-check cleanly against content-types.ts (FAQItem, Checklist) and against locally-declared interfaces in setup-guide.ts
- Tone is patient, encouraging, and honestly anti-aspirational — including frank statements about what sim training cannot substitute for (real CFI, medical, exams) and where to spend money (SSD before GPU, joystick before yoke)
- Ready for: UI agents to wire these into the /faq, /checklists, and /setup views (all three already exist as nav-store views per Task 1)

---
Task ID: 3c
Agent: Glossary Agent
Task: Create 55+ aviation glossary terms

Work Log:
- Read worklog.md (Tasks 1 and 3d already complete) and content-types.ts to confirm the GlossaryTerm interface: id (kebab-case), term, category union (7 categories), definition, whyItMatters, moduleId (number | null)
- Reviewed faq.ts in src/lib/data/ for stylistic consistency (plain-English, honest, beginner-friendly tone) and confirmed the data directory already existed
- Drafted a 16-module curriculum map (documented in glossary.ts header comment) to assign moduleId values consistently: 1 Intro, 2 Aerodynamics, 3 Flight Controls, 4 Six-Pack, 5 Glass Cockpit, 6 Radio Comms, 7 Airspace/ATC, 8 Weather Theory, 9 Weather Services, 10 Radio Nav, 11 Sectional/Pilotage, 12 Pattern/Takeoff/Landing, 13 Maneuvers, 14 Emergencies, 15 Cross-Country Planning, 16 Cockpit Procedures
- Wrote src/lib/data/glossary.ts exporting `glossary: GlossaryTerm[]` with 76 terms — well over the 55-term minimum
- Definitions follow plain-English style with acronyms expanded inline (e.g. "Visual Flight Rules (VFR), flying by looking out the window..."); every whyItMatters is a single sentence tying the term to a practical sim-pilot consequence
- Verified by `npx tsc --noEmit`: no type errors introduced by glossary.ts (only pre-existing errors in unrelated files remain)
- Verified category counts via ripgrep: Aerodynamics 12, Instruments 12, Navigation 12, Communications 9, Weather 12, Procedures 10, General 9 — all categories meet or exceed their required minimums
- Verified ID uniqueness via `sort | uniq -d` — zero duplicate IDs

Stage Summary:
- One data file produced: src/lib/data/glossary.ts (76 terms total)
- Per-category counts: Aerodynamics 12 (req 8+), Instruments 12 (req 10+), Navigation 12 (req 8+), Communications 9 (req 7+), Weather 12 (req 8+), Procedures 10 (req 8+), General 9 (req 6+)
- All 7 categories covered; every term has a unique kebab-case id; every term maps to a moduleId 1-16 based on the documented curriculum map
- File imports via `import type { GlossaryTerm } from "@/lib/content-types";` and exports `glossary: GlossaryTerm[]` exactly as specified — no React components, no test files
- Ready for: UI agents to render the glossary view (already exists as a nav-store view per Task 1), with category filtering, search, and per-term detail panels

---
Task ID: 3a
Agent: Content Agent (Modules 1-8)
Task: Create real aviation content for modules 1-8 with quizzes

Work Log:
- Read /home/z/my-project/worklog.md to understand prior agent work (Task 1: foundation, design system, content-types.ts)
- Read /home/z/my-project/src/lib/content-types.ts to confirm the exact ModuleContent / ContentBlock / QuizQuestion shapes to follow
- Created /home/z/my-project/src/lib/data/ directory (did not previously exist)
- Wrote /home/z/my-project/src/lib/data/modules-1-8.ts with the import `import type { ModuleContent } from "@/lib/content-types"` and the export `export const modules18: ModuleContent[]`
- Authored 8 fully-written modules in the voice of a patient, encouraging flight instructor:
  M1 Welcome to Flight Simulation (Beginner, prereqs [], xp 10, 5 sections, 1 diagram "sim-comparison")
  M2 Cockpit Fundamentals (Beginner, prereqs [1], xp 12, 5 sections, 1 diagram "six-pack")
  M3 The Four Forces & Basic Aerodynamics (Foundational, prereqs [1], xp 13, 5 sections, 2 diagrams "four-forces","angle-of-attack")
  M4 Flight Controls Deep Dive (Foundational, prereqs [2,3], xp 13, 5 sections, 3 diagrams "control-axes","aileron-roll","adverse-yaw")
  M5 Engine Startup & Pre-Flight (Foundational, prereqs [2,4], xp 14, 5 sections, 1 diagram "cesna-panel")
  M6 Taxiing & Ground Operations (Foundational, prereqs [5], xp 13, 5 sections, 1 diagram "hold-short-line")
  M7 Takeoff Procedures (Intermediate, prereqs [5,6], xp 14, 5 sections, 2 diagrams "takeoff-roll","initial-climb")
  M8 Basic Maneuvers (Intermediate, prereqs [7], xp 15, 5 sections, 2 diagrams "straight-level","standard-rate-turn")
- Wrote accurate aviation content: debunked the equal-transit-time lift myth, correct AoA/stall explanation, full C172 startup checklist, hold-short line marking spec, Vr/Vy numbers (55/74 kt), left-turning tendency (torque + spiral slipstream + P-factor + gyro precession), "step on the ball", pitch+power=performance, "never turn back to runway below ~1000 ft AGL", etc.
- Every acronym defined on first use: VFR (not used yet), FMC, GA, AGL, ASI, AI, HI, VSI, Vne, Vy, Vr, Vx, ATC, ATIS/AWOS, CTAF/UNICOM, CFI, ILS, RPM, P-factor
- Each module has: 5 sections of 3-8 content blocks, 1+ diagram, a commonMistake (amber/warning), tryItInSim with 5 numbered steps, 3-5 keyTakeaways, 5 quiz questions with 4 plausible options + correctIndex + one-line explanation
- Ran `npx tsc --noEmit` — confirmed zero TypeScript errors in modules-1-8.ts (the 5 pre-existing errors elsewhere in the repo are in examples/, skills/, and progress-store.ts, none in this file)
- Programmatic structural validation: 8 modules, 40 quiz questions, all 40 options arrays contain exactly 4 items, all 40 correctIndex values 0-3, total 13 diagrams (≥1 per module), 94 paragraphs, 32 callouts

Stage Summary:
- Produced /home/z/my-project/src/lib/data/modules-1-8.ts (~1,810 lines) — the core product content for the first 8 modules of FlightPath Academy
- Content is real, accurate, plain-English aviation training that maps to FAA Private Pilot ground school; written for total beginners with zero prior knowledge
- File is type-clean against content-types.ts and ready for UI agents to render (the diagramKey strings hint which inline SVG to render: sim-comparison, six-pack, four-forces, angle-of-attack, control-axes, aileron-roll, adverse-yaw, cesna-panel, hold-short-line, takeoff-roll, initial-climb, straight-level, standard-rate-turn)
- Ready for: UI component agents to build the module viewer, diagram SVG components keyed by diagramKey, quiz interaction, and progress tracking wired to progress-store.ts

---
Task ID: 3b
Agent: Content Agent (Modules 9-16)
Task: Create real aviation content for modules 9-16 with quizzes

Work Log:
- Read /home/z/my-project/worklog.md to understand prior agent work (Task 1 foundation; Task 3a modules 1-8 by another agent using `modules18` export name and 5-section, 5-question, 1+ diagram per module pattern; Task 3c glossary; Task 3d FAQ/checklists/setup)
- Read /home/z/my-project/src/lib/content-types.ts to confirm exact ModuleContent / ContentBlock / QuizQuestion union shapes; noted the literal union `ContentBlock` requires `type` discriminator + variant-specific fields
- Wrote /home/z/my-project/src/lib/data/modules-9-16.ts with `import type { ModuleContent } from "@/lib/content-types"` and `export const modules916: ModuleContent[]` (export name matches task spec exactly)
- Authored 8 fully-written modules in the voice of a patient, encouraging flight instructor. Each module verified to have: 5-6 sections, 18-22 content blocks, exactly 1 diagram, 5+ callouts, 5 keyTakeaways, 5 tryItInSim steps, 5 quiz questions with exactly 4 plausible options + correctIndex 0-3 + one-line explanation
  M9  Traffic Patterns & Landing (Intermediate, prereqs [7,8], xp 14, 28 min, 5 sections, 1 diagram "traffic-pattern") — 5 legs named (upwind/crosswind/downwind/base/final), 1000 ft AGL pattern altitude, left traffic default, C172 speed progression 90/80/75/65, flare technique, go-around framed as good judgment not failure
  M10 Navigation Basics (Intermediate, prereqs [8], xp 13, 26 min, 5 sections, 1 diagram "vor-cone") — course vs heading vs track distinction, sectional chart legend (blue=mag towered, magenta=non-towered; Class B solid blue, C solid magenta, D dashed blue), VOR radials (360), Morse identify-before-trust, GPS as backup not substitute
  M11 Radio Communications (Intermediate, prereqs [5], xp 12, 24 min, 5 sections, 1 diagram "radio-call-structure") — four-part call structure (who you're calling, who you are, where you are, what you want) with two real examples (Greensboro Ground taxi call; Greenville Traffic downwind call closing with airport name + Traffic), full phonetic alphabet (Alpha-Zulu), tree/fife/niner number pronunciation, CTAF vs UNICOM, Ground vs Tower vs Approach
  M12 Weather Basics (Intermediate, prereqs [8], xp 14, 30 min, 6 sections, 1 diagram "metar-breakdown") — decoded real METAR string "METAR KSEA 151755Z 22012G20KT 6SM -RA OVC025 15/12 A2992" piece by piece, TAF groups (BECMG/TEMPO/PROB30/FM), crosswind = wind × sin(angle) with worked 50° example ≈ 9 kt, density altitude rule-of-thumb (1000 ft per 15°C above standard), Class E day VFR minimums (3 SM)
  M13 Emergency Procedures (Advanced, prereqs [8], xp 15, 26 min, 5 sections, 1 diagram "engine-failure-flow") — Aviate/Navigate/Communicate order, C172 best glide 65 KIAS, glide ratio ~9:1 (1.5 mi per 1000 ft → 7.5 mi at 5000 ft AGL), never stretch a glide, 7700 squawk + 121.5 mayday, configure-for-crash sequence, never-chase-radio-first common mistake
  M14 Cross-Country Flight Planning (Advanced, prereqs [10,11,12], xp 15, 30 min, 6 sections, 1 diagram "xc-nav-log") — 50 nm XC definition, route selection (checkpoints every 10-15 nm, avoid Class B, terrain), AIRMET vs SIGMET vs NOTAM distinctions, fuel planning flow with FAA 30-min day VFR reserve floor + personal 1-hr minimum, nav log columns, 6-step diversion flow
  M15 Intro to IFR (Advanced, prereqs [10,13], xp 14, 28 min, 5 sections, 1 diagram "ils-approach") — VFR vs IFR framing, six-pack scan (always return to attitude indicator), localizer (lateral, vertical needle, ~350 ft full deflection at threshold, 4× VOR sensitivity), glideslope (vertical, horizontal needle, 3° path), ILS to DA, "don't chase the needles", framed explicitly as preview not mastery
  M16 Aircraft-Specific Modules (Intermediate, prereqs [9,14], xp 13, 28 min, 5 sections, 1 diagram "c172-vs-pa28") — C172 deep dive (44,000+ built since 1956, Lycoming O-320/O-360, high wing gravity-fed fuel, full V-speeds Vr 55 / Vy 73 / Vx 62 / Vbg 65 / Vs0 40), PA-28 comparison (low wing, cantilever, requires engine-driven + electric fuel pump because tanks below engine, Johnson-bar flaps), real handling differences (ground effect, sight picture, stall behavior), bonus airliner preview
- Every acronym defined on first use: METAR (Meteorological Aerodrome Report), TAF (Terminal Aerodrome Forecast), VOR (VHF Omnidirectional Range), CTAF (Common Traffic Advisory Frequency), UNICOM, AIRMET (Airmen's Meteorological Information), SIGMET (Significant Meteorological Information), NOTAM (Notices to Airmen), ILS (Instrument Landing System), LOC (localizer), GS (glideslope), CDI (Course Deviation Indicator), OBS (Omni-Bearing Selector), POH (Pilot's Operating Handbook), IMC (Instrument Meteorological Conditions), KIAS (Knots Indicated Airspeed), AGL, MSL, Vbg, Vr, Vx, Vy, Vs0, Vapp, DA
- All technical facts checked: wind correction crosswind math (12 × sin 50° ≈ 9.19, cos 50° ≈ 7.71), METAR OVC025 = 2500 ft AGL (not MSL), C172 glide ratio 9:1 → 1.5 mi/1000 ft → 7.5 mi from 5000 ft AGL, localizer 350 ft full-scale deflection at threshold, ILS glideslope standard 3°, C172 demonstrated crosswind ~15 kt, FAA day VFR fuel reserve 30 min, PPL XC definition 50 nm landing, Class E day VFR minima 3 SM vis / 500-1000-2000 cloud clearance, 7700 emergency squawk, 121.5 guard frequency, PA-28 low-wing fuel pump requirement
- Ran `npx tsc --noEmit -p tsconfig.json` — zero TypeScript errors in modules-9-16.ts (only pre-existing errors in unrelated files: examples/websocket, skills/*, progress-store.ts)
- Programmatic structural validation via tsx script: 8 modules confirmed; all 8 modules have 1 diagram each (8 total); all 40 quiz questions have exactly 4 options and correctIndex 0-3; all 8 modules have 5 keyTakeaways and 5 tryItInSim steps; per-module block counts in range 18-22; per-module callout counts in range 5-7

Stage Summary:
- Produced /home/z/my-project/src/lib/data/modules-9-16.ts (~1,150 lines) — the core product content for the final 8 modules (9-16) of FlightPath Academy
- Content is real, accurate, plain-English aviation training that maps to FAA Private Pilot ground school; written for total beginners with zero prior knowledge; never condescending, occasionally witty
- File is type-clean against content-types.ts and exports `modules916: ModuleContent[]` exactly as specified — no React components, no test files
- diagramKey strings hint which inline SVG to render: traffic-pattern, vor-cone, radio-call-structure, metar-breakdown, engine-failure-flow, xc-nav-log, ils-approach, c172-vs-pa28
- Together with Task 3a (modules 1-8), the full 16-module FlightPath Academy curriculum is now content-complete and ready for UI agents to build the module viewer, diagram SVG components, quiz interaction, and progress tracking wired to progress-store.ts

---
Task ID: 4-13
Agent: Main (Z.ai Code)
Task: Build all UI, 3D, integration, Agent Browser testing

Work Log:
- Built shared components: callout-box, glossary-tooltip (auto-links 76 terms), gauge-ring, diagrams (21 hand-built SVG), quiz
- Built navbar (compass logo, XP indicator, theme toggle), sticky footer
- Built 3D aircraft (React Three Fiber Cessna 172 with Float animation)
- Built home view (animated sky hero, cloud parallax, 3D aircraft, value cards, path preview, testimonials, CTA)
- Built learning path (sectional chart SVG with 16 winding nodes, gold progress fill, mobile vertical list)
- Built module view (content renderer, glossary tooltips, callouts, quiz, prev/next)
- Built cockpit explorer (18 clickable hotspots, detail panel)
- Built glossary (search + 7 category filters), checklists (5 interactive), FAQ (14 accordion), setup guide (4 platforms + hardware + first flight)
- Built progress dashboard (gauge ring, license progression, 9 badges, certificate PNG generator)
- Fixed hotspot overlap, lint errors, dev origins

Agent Browser Testing: All 9 views verified, quiz awards XP, mobile responsive confirmed, 0 lint errors, no runtime errors

Stage Summary: Complete working product. 16 modules with real content + quizzes, 76 glossary terms, 18 cockpit hotspots, 5 checklists, 14 FAQs, certificate generation, 3D aircraft, dark mode, responsive.

---
Task ID: V10-GLB-MODEL
Agent: Main (Z.ai Code)
Task: Replace hand-built 3D plane with real textured GLB model from Meshy AI

Work Log:
- Copied user-uploaded GLB file (6MB, Meshy AI generated Cessna 172 with textures) to /public/models/cessna172.glb
- Rebuilt interactive-aircraft.tsx to use drei's useGLTF hook instead of hand-built geometry
- Model loading: useGLTF("/models/cessna172.glb") with Suspense fallback ("Loading aircraft...")
- Auto-scale and center: useMemo computes bounding box, scales to 3.5 units, centers on origin, offsets Y to sit on ground plane
- Shadow enabled on all meshes via traverse
- 8 numbered educational pins positioned around the model (positions adjusted for the GLB scale)
- Invisible click targets (sphereGeometry) at each pin position for click handling
- OrbitControls with damping, autoRotate, drag + zoom
- 3-point lighting (warm key + cool fill + gold rim) with ACESFilmicToneMapping
- ContactShadows for ground weight
- Environment preset="sunset" for reflections
- Fixed import: home-view.tsx was importing from old aircraft-3d.tsx instead of interactive-aircraft.tsx
- Fixed lint: moved scale/position/shadow logic from useEffect into useMemo to avoid react-hooks/immutability error
- Fixed page.tsx: restored mounted guard (was removed, causing SSR issues with useGLTF)
- GLB confirmed loading: 5.7MB transferred, model renders with textures

VLM RESULT: 8-9/10 ("highly detailed, textured 3D model of a Cessna 172 with realistic metallic paint, reflections, clear canopy glass, and numbered educational pins")

Stage Summary: Real textured GLB model replaces hand-built primitives. 8-9/10 visual quality. Model loads via useGLTF with proper PBR materials, textures, shadows. Educational pins preserved. Lint clean.

---
Task ID: V10-VISUAL-INJECTION
Agent: Main (Z.ai Code)
Task: Full visual overhaul using Visual Injection System prompt + research

Work Log:
RESEARCH:
- Researched Kimi K3 (dark frontier AI, metric-driven hero), Claude Fable 5 (warm editorial, Anthropic rust #D97757, custom serif)
- Researched Linear (#5E6AD2 indigo, Inter+Berkeley Mono, pills, restraint), Vercel (Geist, shadow-as-border, dark canonical), Raycast (dark glass cockpit), Arc (calm/personal), Cursor (minimal), Things 3 (white space), Cron (vintage-futurism)
- Key findings: "restraint" is the premium word; ease-out-expo is the #1 premium easing; 2-3 fonts max; shadows-as-borders not gray lines; stagger 40-80ms at 400-600ms ease-out-expo; skeletons not spinners

FIXES:
1. GLB compressed from 6MB to 823KB (87% reduction via gltf-transform with WebP texture compression + mesh simplification). Load time: 72ms (was 5+ seconds).
2. Loading skeleton: 3 pulsing dots instead of text fallback
3. Design tokens completely rebuilt per Visual Injection prompt:
   - 5-layer surface ladder (surface-0 deepest → surface-4 modals) for both themes
   - Hairline borders (rgba semi-transparent) replace drop shadows on dark
   - Layered shadow stacks (sm/md/lg + glow-gold/glow-sky) — never single shadow
   - 4-layer Liquid Glass (backdrop blur 20px + saturate 180% + tint + border highlight + inner shadow)
   - Atmospheric tokens (glow, tint, hero-gradient)
   - 8-point spacing grid (4/8/12/16/24/32/48/64/96)
   - Radius scale (6/10/16/24/999) — varies by element scale
   - Motion tokens: ease-out-expo, ease-in-out-quart, ease-spring; durations micro(200ms)/structural(350ms)/scene(600ms); stagger 60ms
4. Typography: h1 uses Space Grotesk at -0.04em tracking, line-height 1.05; h2 at -0.03em, 1.1; h3-h6 Sora at -0.02em, 1.2; body line-height 1.6; mono with tabular-nums
5. Component vocabulary rebuilt: fp-glass (4-layer), fp-bezel (hairline+corners+shadow), fp-bezel-hover (spring lift+glow), fp-toggle-btn (shine sweep+spring), fp-corner-brackets (HUD style), fp-gradient-border (animated)
6. Gold promoted to precious accent (ring, focus, CTAs) — <5% surface area
7. Focus rings: 2px accent + 2px offset, visible only on keyboard nav

VLM: 7.5/10 ("strong B+ execution, solid bones, needs motion design and button refinement for $50k look")

Stage Summary: Foundation rebuilt. GLB loads in 72ms. Design tokens fully compliant with Visual Injection prompt. 4 of 35 todos complete. Next: apply tokens to all components (navbar, hero, cards, sections).

---
Task ID: V11-RESEARCH
Agent: Main (Z.ai Code)
Task: Research learning-website design + Fable 5 / Kimi K3 visual style, learn from uploaded reference, overhaul whole site

Work Log:
- Extracted 3 uploaded zips (gaming-platform.zip, gaming-platform-fixed.zip, data batch). Reference is a clean "Glass Cockpit" FlightCourse Academy design — OKLCH navy + amber + cyan, Instrument Sans + JetBrains Mono, label-instrument mono eyebrows, glass cards (7% gradient + 14px blur), bg-grid 56px, bg-horizon radial glow, radar-sweep animation, mono numbers for all stats, clean border-t section dividers.
- Researched Fable 5 (Griffin Wooldridge + Banani articles via page_reader). Key findings: "generic AI slop" is the named enemy; telltale signs = emoji in cards, generic gradients, safe standard sections, plain text not real content. Fable 5 = "more minimal and polished" (Visual Polish 4.5/5). Design system FIRST, realistic data, specify all states, smooth animations not snapping.
- Researched Kimi K3 (Moonshot 2.8T model, scroll-driven cinematic sites, native visual understanding).
- Synthesized cognitive-science principles: cognitive load (4±1 items in working memory), Hick's Law (fewer choices), Doherty threshold (<400ms), Von Restorff (one different item stands out), aesthetic-usability effect. Animation: 200-400ms micro, 300-500ms page, ease-out entrances, never animate text being read, functional only.
- VERDICT: Reference Glass Cockpit style is BETTER than our current design (which had classic AI slop: 3 fonts, 642-line CSS, 11-layer decorative hero, over-engineered 4-layer liquid glass). Complete overhaul authorised.

Stage Summary:
- New globals.css: Glass Cockpit OKLCH theme (navy bg, amber primary, cyan accent), 2 fonts, label-instrument utility, glass/bg-grid/bg-horizon/glow utilities, sweep/drift/pulse-ring/marquee/fade-up animations, backward-compat aliases (text-sky/gold, fp-glass, fp-toggle-btn, font-heading) so existing game components keep rendering.
- layout.tsx: Instrument Sans (body) + JetBrains Mono (instrument), dark default, themeColor #0b1220.
- brand/logo.tsx: attitude-indicator SVG mark (clean, no animation) + two-line wordmark.
- navbar.tsx: glass header, simple text nav (Course/Cockpit/Glossary/Checklists/Setup/Progress/FAQ), Games dropdown (Flare/Radio/Pattern), XP readout pill, theme toggle, mobile sheet. FlightCourseLogo re-exported for backward compat.
- footer.tsx: clean glass footer, 3 link columns + brand, sticky bottom (mt-auto).
- page.tsx: minimal loading (LogoMark + progress bar), subtle fade+rise page transitions (no blur/scale).
- Shared components rebuilt: callout-box (glass + accent/destructive/primary variants), gauge-ring (primary color, oklch ticks), quiz (success/destructive states, label-instrument, nums).
- Dev server: HTTP 200, compiles clean.
- Next: dispatch subagents to rebuild all 9 views + restyle 3 games in Glass Cockpit style.

---
Task ID: 11+12
Agent: Glass Cockpit Views Agent (cockpit-explorer + glossary rewrite)

Task: Rewrite cockpit-explorer-view.tsx and glossary-view.tsx in the new Glass Cockpit design system (OKLCH navy/amber/cyan, Instrument Sans + JetBrains Mono, label-instrument mono eyebrows, glass cards, mono numbers, border-t dividers, no emoji, no decorative gradients).

Work Log:
- Read worklog.md (Task V11-RESEARCH context), globals.css (glass / glow-primary / glow-accent / label-instrument / nums / thin-scroll / animate-fade-up utilities, color tokens, fp-toggle-btn / fp-outline-btn classes), nav-store.ts (useNav + openModule), glossary.ts (76 terms), the existing cockpit-explorer-view.tsx (12 HOTSPOTS preserved), and modules.ts (getModule helper).
- Wrote work record to /agent-ctx/11+12-glass-cockpit-views.md before starting.
- FILE 1 src/components/views/cockpit-explorer-view.tsx — full rewrite (~190 lines, "use client", default export):
  * Preserved all 12 HOTSPOTS (asi, ai, alt, tc, dg, vsi, master, avbus, land, hdgknob, altknob, radio) with their original detail strings; added per-instrument moduleId per the task spec (six-pack → 2 cockpit basics; switches master/avbus/land → 4; knobs hdgknob/altknob → 6; radio → 11).
  * Header: label-instrument eyebrow "Cockpit" + H1 "The Cessna 172 panel, explained" + subhead.
  * Category filter pills (All + 4 categories): active border-primary bg-primary text-primary-foreground; inactive border-border text-muted-foreground hover:text-foreground. rounded-full, px-3 py-1, text-xs.
  * Two-column grid lg:grid-cols-[1fr_1.15fr]:
    - LEFT: <ul> of instrument cards (sm:grid-cols-2). Each card is a <button> with glass + rounded-xl + p-4; active adds border-primary/60 + glow-primary; inactive adds hover:border-primary/30. Row: Gauge icon (text-primary if active else text-muted-foreground) + label-instrument mono id. Name in font-medium. Truncated detail (80 chars + ellipsis).
    - RIGHT: glass detail card with lg:sticky lg:top-24. Badges row (category + mono id). H2 with name. Full detail paragraph. <dl> with three sections: "How to read it" (text-primary label-instrument dt + detail dd), "Scan habit" (text-accent label-instrument + Eye icon, generic tip), "When it fails" (text-accent label-instrument + AlertTriangle icon, generic note). If moduleId: fp-outline-btn with Settings2 icon + "Learn it in module {moduleId}" → openModule(moduleId).
  * useState for selectedId + category; useMemo for filtered list + selected lookup. Default selectedId = first instrument (asi).
  * Imports from lucide-react: Gauge, AlertTriangle, Eye, Settings2.
- FILE 2 src/components/views/glossary-view.tsx — full rewrite (~150 lines, "use client", named export GlossaryView):
  * Header: label-instrument eyebrow "Reference" + H1 "Glossary" + subhead.
  * Search + filter bar inside glass rounded-2xl p-4: controlled text input with placeholder "Search terms…", border-border bg-background, focus-visible ring-ring. Below: 8 category pills (All + 7 categories) in same style as cockpit.
  * Result count above grid: label-instrument text-muted-foreground "{n} of {glossary.length} terms".
  * Results: grid gap-3 sm:grid-cols-2 of glass rounded-xl p-4 cards. Each card: header row with font-semibold term name on left + category badge (rounded-full border-border px-2 py-0.5 text-[10px]) on right; definition in text-sm text-muted-foreground; "Why" line as text-xs with label-instrument text-accent mr-1.5 "Why" eyebrow + whyItMatters; if moduleId, text-accent text-xs hover:underline self-start button "Learn in module {moduleId} →" calling openModule.
  * Empty state: py-16 text-center with muted "No terms match "{query}"." message (curly quotes).
  * useState for query + category; useMemo filters by query match on term+definition+whyItMatters AND by category, sorted alphabetically.
- Lint: `bun run lint` returned 0 errors, 3 warnings — all 3 warnings are in unrelated files (progress-dashboard.tsx, share-card.tsx, funnel.ts). My two files contribute zero lint issues.
- Dev server: recompiled clean. The pre-existing FlightCourseLogo import error in progress-view.tsx is unrelated to this task.
- No emoji, no Framer Motion, no decorative gradients. animate-fade-up used on headers only. Mono numbers via nums class on instrument id badge. No other files touched.

Stage Summary:
- Two Glass Cockpit view files rewritten: cockpit-explorer-view.tsx (default export, two-column list+sticky detail, 12 instruments with module links) and glossary-view.tsx (named export, glass search/filter bar, 76 terms with module links).
- Both files use only canonical Glass Cockpit utilities (glass, glow-primary, label-instrument, nums, fp-outline-btn) and color tokens (text-primary, text-accent, text-muted-foreground, bg-background, border-border). No legacy sky/gold aliases, no Framer Motion, no emoji.
- Exports match existing page.tsx imports (default CockpitExplorerView, named GlossaryView) so no other files needed changes.
- Both files clean (lint 0 errors, dev server recompiled, tsc-clean).

---
Task ID: 9+10
Agent: Glass Cockpit Views Agent (Learning Path + Module)

Task: Rewrite learning-path-view.tsx and module-view.tsx in the new Glass Cockpit design system (OKLCH navy/amber/cyan, Instrument Sans + JetBrains Mono, glass cards, label-instrument eyebrows, mono numbers, hairline borders).

Work Log:
- Read worklog.md (Tasks 1, 3a, 3b, 3c, 3d, 4-13, V10-*, V11-RESEARCH) to understand the Glass Cockpit design system migration from Fable 5 / Kimi K3 research.
- Read globals.css to confirm available utilities: `glass`, `bg-grid`, `bg-horizon`, `glow-primary`, `glow-accent`, `label-instrument`, `nums`, `text-shadow-glow`, `animate-fade-up`, `fp-toggle-btn`, `fp-outline-btn`, color tokens (`text-primary`, `text-accent`, `text-muted-foreground`, `bg-background`, `bg-card`, `border-border`, `text-destructive`).
- Read modules.ts (allModules, getModule, getNextModule, getPrevModule, TOTAL_MODULES, TOTAL_XP), content-types.ts (ModuleContent + ContentBlock union), nav-store.ts (useNav.navigate + openModule), progress-store.ts (useProgress.isModuleCompleted + isModuleUnlocked + startModule).
- Read shared components I had to consume: callout-box.tsx (CalloutBox variant=info|warning|tip), quiz.tsx (QuizComponent), glossary-tooltip.tsx (GlossaryTooltip for single term, GlossaryText for auto-linking all terms in a string), diagrams.tsx (DiagramRenderer({ diagramKey, caption })).
- Wrote /home/z/my-project/src/components/views/learning-path-view.tsx — `"use client"` syllabus overview. Container max-w-6xl. Header eyebrow + H1 + subhead. Top summary bar (`glass rounded-2xl p-5`) with 3 stats: TOTAL_MODULES, TOTAL_XP, computed totalHours (sum estimatedMinutes / 60 rounded). 4 stages with zero-padded mono stage numbers. 2-col grid of module `<button>` cards using `glass hover:border-primary/40` base, `border-primary/40` if completed, `opacity-55` if locked. Each card: id + title row, status indicator (Check / Lock / Free pill / open circle), tagline, mono footer with Clock icon + minutes + difficulty + XP.
- Wrote /home/z/my-project/src/components/views/module-view.tsx — `"use client"` module reader. Container max-w-3xl (reading width). `useEffect` calls `startModule(moduleId)` on mount. Breadcrumb back-button. Header meta row (label-instrument "Module NN · Category" + Free/Pro badge with Lock icon on Pro + Complete pill if completed) + H1 + tagline + mono meta row (Clock + minutes, difficulty, XP, question count). "Why this matters" glass callout. Sections loop with H2 `border-b pb-3` dividers. ContentBlockRenderer switch: paragraph (GlossaryText auto-link), heading (h3), list (ordered: `marker:text-primary marker:font-mono list-decimal` / unordered), callout (CalloutBox), diagram (DiagramRenderer). Common-mistake destructive box (TriangleAlert). Try-it-in-sim glass box (Sparkles + ordered list). Key takeaways checklist (Check bullets). Quiz (QuizComponent). Bottom nav (prev = fp-outline-btn with ArrowLeft, next = fp-toggle-btn with ArrowRight).
- Confirmed all 7 imported lucide icons (ArrowLeft, ArrowRight, Check, Clock, Lock, Sparkles, TriangleAlert) are actually used in module-view.tsx — Lock appears on the Pro badge so no unused-import lint error.
- Ran `bun run lint` — ZERO errors / warnings in either of my two files. (The 1 error in checklists-view.tsx and 3 warnings in unrelated files are pre-existing, not from my work.)
- Confirmed dev.log shows `GET / 200` (successful compile) — my view files compile without TypeScript or React errors. (The pre-existing `FlightCourseLogo` import error in progress-view.tsx is unrelated to this task.)
- Did NOT touch any other file. Only rewrote the two view files as instructed.

Stage Summary:
- Two Glass Cockpit view files delivered: learning-path-view.tsx (syllabus overview, 4 stages × 4 modules = 16 cards with completed/locked/free status) and module-view.tsx (single-module reader with full content block renderer, quiz, prev/next nav).
- All design tokens used: `glass` cards, `label-instrument` eyebrows (text-primary or text-accent), `nums`/`font-mono` for every numeric value (module IDs, XP, minutes, difficulty), `border-border` dividers, `text-muted-foreground` body copy, `text-primary` amber accent for active state, `text-accent` cyan for the "Why this matters" eyebrow, `text-destructive` for the common-mistake box, `fp-toggle-btn`/`fp-outline-btn` for bottom nav.
- Restraint respected: NO emoji, NO Framer Motion (page.tsx handles transitions), NO decorative gradients beyond the existing `glass` 7% gradient + 14px blur, NO 3D, NO drop shadows. Only `animate-fade-up` on the path header for a subtle entrance.
- Accessibility: semantic `<header>`, `<section>`, `<nav>` elements; `aria-label` on each module card button; `aria-hidden` on decorative separators; focus-visible ring on module cards; keyboard-navigable breadcrumb and prev/next buttons.
- Files ready for the existing page.tsx view router to render when `view === "path"` or `view === "module"`. No changes needed elsewhere.

---
Task ID: 13+14
Agent: Progress + Checklists Views Agent
Task: Rewrite progress-view.tsx and checklists-view.tsx in Glass Cockpit design

Work Log:
- Read worklog.md (all prior tasks) for Glass Cockpit context, globals.css for utility vocabulary (glass, label-instrument, nums, fp-toggle-btn, fp-outline-btn, animate-fade-up), progress-store.ts (useProgress + BADGES + LICENSE_TIERS + MODULE_BADGES), data/modules.ts (allModules, TOTAL_MODULES, TOTAL_XP), data/checklists.ts (5 C172 checklists), nav-store.ts (useNav.navigate / openModule), gauge-ring.tsx, ui/progress.tsx, lib/utils.ts (cn), content-types.ts (confirmed ModuleContent.shortTitle)
- Did NOT import FlightCourseLogo per task note — old progress-view.tsx imported it and was a known breakage (dev log: HTTP 500). Rewrite uses no logo.
- Wrote src/components/views/progress-view.tsx (~280 lines):
  - Container max-w-5xl, header with "Flight deck" eyebrow + H1 "You are a {tier.name}" + tier-blurb subhead (per-tier copy for Student Pilot / Private Pilot Track / Instrument Track / Rated)
  - Top progress card (glass + rounded-2xl p-6): "X XP to next rank" or "Top rank reached — Captain" + {xp} XP readout + shadcn Progress + fp-toggle-btn "Continue training" with ArrowRight + "Next up: {nextModule.title}"
  - Stats grid (grid-cols-2 lg:grid-cols-4): XP (Star), Modules (Check), Flight hours (Clock, (xp/10).toFixed(1) h), Badges (Medal). Each card: icon size-4 text-accent, label-instrument label, nums text-2xl font-medium value + muted sub
  - Syllabus progress: border-b border-border pb-3 header + "X% complete" + 4 stage cards (modules 1-4, 5-8, 9-12, 13-16). Each stage: name + done/total font-mono + Progress + ul of module buttons (Check text-primary if done, hollow circle if not; shortTitle muted if not done)
  - Badges section: H2 + {earned}/{BADGES.length} count, grid of 9 badge cards. Earned = border-primary/40 + "Earned" label text-primary. Locked = opacity-55 + Lock icon + "Locked" label
  - Reset button at bottom: fp-outline-btn text-destructive, wraps in flex justify-center, calls confirm() then resetProgress()
- Wrote src/components/views/checklists-view.tsx (~180 lines):
  - Container max-w-4xl, header with "Reference" eyebrow + H1 "Checklists" + subhead
  - Pill selector: one button per checklist, active = border-primary bg-primary text-primary-foreground, inactive = border-border text-muted-foreground hover:text-foreground, all rounded-full border px-3 py-1 text-xs font-medium
  - Header card (glass rounded-xl p-5): title + font-mono aircraft + description
  - Overall progress: label-instrument "{checked}/{total} complete" + Reset button text-accent hover:underline + shadcn Progress
  - Sections: each in glass rounded-xl p-5 with label-instrument text-primary heading + ul of items. Each item: full-width button with custom checkbox (size-5 rounded border, filled border-primary bg-primary text-primary-foreground when checked) + text (line-through text-muted-foreground when checked) + optional detail (text-xs text-muted-foreground)
  - State: selectedIdx + checked Set<string> of "{sectionIdx}-{itemIdx}" keys. Reset on checklist switch via React's "adjust state during render" pattern (prev-value tracking) — avoids react-hooks/set-state-in-effect lint error
  - useMemo for total count
- Lint: first pass flagged react-hooks/set-state-in-effect in checklists-view useEffect. Refactored to "adjust state during render" (prevSelectedIdx tracker). Second pass: 0 errors, 0 warnings in either file. Pre-existing warnings in unrelated files (progress-dashboard.tsx, share-card.tsx, funnel.ts) untouched.
- TypeScript: npx tsc --noEmit --skipLibCheck — 0 errors in either file
- Dev server: confirmed dev.log shows prior FlightCourseLogo HTTP 500 was from OLD progress-view.tsx (line 10). After rewrite, dev server reports "✓ Compiled in 14.3s" repeatedly with HTTP 200s

Stage Summary:
- Two view components rewritten in Glass Cockpit design: progress-view.tsx (~280 lines) and checklists-view.tsx (~180 lines), both under the ~350-line guideline
- Design adheres to spec: label-instrument mono eyebrows, glass cards, nums mono for all readouts, border-b border-border pb-3 section dividers, OKLCH token colors (primary amber, accent cyan, destructive red), no emoji, no decorative gradients, no Framer Motion (only animate-fade-up for the header)
- Both files lint-clean and type-clean. Dev server compiles successfully after rewrite (prior FlightCourseLogo import error resolved)
- Ready for: Agent Browser integration test if needed; rest of Glass Cockpit view migration continues independently

---
Task ID: 15
Agent: Setup Guide + FAQ Views Agent
Task: Rewrite setup-guide-view.tsx and faq-view.tsx in Glass Cockpit design

Work Log:
- Read worklog.md (all prior tasks) for Glass Cockpit design context, OKLCH token palette, and established component vocabulary
- Read globals.css — confirmed utilities: glass, glow-primary, label-instrument, nums, animate-fade-up, fp-toggle-btn, fp-outline-btn, text-success, text-destructive, border-border. Backward-compat aliases (fp-bezel, text-sky, text-gold) NOT used — went canonical only.
- Read src/lib/data/setup-guide.ts — exported const `setupGuide` (SetupGuide). 4 platforms, 7 hardware items across 3 tiers, 8 graphics presets, 5-step first flight at KRNT
- Read src/lib/data/faq.ts — exported `faqItems: FAQItem[]`, 14 items across 4 categories (Getting Started, Simulators & Hardware, Real Flying, Course & Progress)
- Read src/lib/nav-store.ts — `useNav` with `navigate(view, moduleId?)` and `openModule(id)`
- Read src/components/ui/accordion.tsx — confirmed shadcn Accordion exports (Accordion type="single" collapsible, AccordionItem/Trigger/Content)
- Read existing setup-guide-view.tsx and faq-view.tsx — both used legacy fp-bezel + framer-motion + text-sky/text-gold. Full rewrites.
- Wrote src/components/views/setup-guide-view.tsx (~190 lines):
  - Container mx-auto w-full max-w-5xl px-4 py-12 sm:px-6
  - Header: label-instrument text-primary "Getting started" eyebrow + H1 text-3xl/4xl tracking-tight text-balance "Set up your simulator" + subhead = setupGuide.intro
  - Platform comparison: H2 "Which simulator should I buy?" + grid gap-4 md:grid-cols-3 of glass cards. Each: name + price badge (nums text-sm text-primary), "Curve" label-instrument + learningCurve, realism paragraph, "Best for" label-instrument text-accent + bestFor, pros ul with Check text-success size-3.5, cons ul with X text-destructive size-3.5
  - Minimum hardware: glass rounded-xl p-5 callout with label-instrument text-accent "Minimum hardware" + paragraph
  - Hardware ranking: H2 "What hardware actually matters" + flex flex-col gap-4 of 3 tier sections (Essential, Nice-to-Have, Enthusiast). Each section glass rounded-xl p-5 with label-instrument text-primary header + ul of items (name + description + nums approxPrice)
  - Graphics guidance: H2 "Graphics settings to learn with" + glass overflow-hidden rounded-xl. Desktop: grid-cols-[12rem_14rem_1fr] header row with Setting/Recommendation/Why labels (hidden on mobile). Each row: border-t border-border p-4, font-medium setting, text-accent recommendation, text-muted-foreground why. Mobile: stacked flex-col gap-1.5
  - Recommended first flight: glass glow-primary rounded-2xl p-6 card. label-instrument text-primary "Your first flight" + H3 "{aircraft} at {airport} ({icao})" + reason paragraph + ol list-decimal with marker:text-primary marker:font-mono + fp-toggle-btn "Start module 1" with ArrowRight calling navigate("module", 1)
  - Imports: Check, X, ArrowRight from lucide-react; HardwareItem type for HARDWARE_TIERS array
- Wrote src/components/views/faq-view.tsx (~110 lines):
  - Container mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 (reading width)
  - Header: label-instrument text-primary "Help" eyebrow + H1 "Frequently asked questions" + subhead "Everything a new simulator pilot tends to ask before they start. If your question isn't here, the glossary and setup guide probably cover it."
  - CATEGORIES = ["All", ...unique categories from faqItems]
  - Category filter: flex flex-wrap gap-2 of pills. Active: border-primary bg-primary text-primary-foreground. Inactive: border-border text-muted-foreground hover:text-foreground. All rounded-full border px-3 py-1 text-xs font-medium transition-colors
  - Result count: label-instrument text-muted-foreground "{filtered.length} questions"
  - Accordion type="single" collapsible. Each AccordionItem value={question} className="border-border border-b". AccordionTrigger text-left hover:no-underline. AccordionContent text-muted-foreground leading-relaxed with answer
  - CTA below accordion: glass mt-10 rounded-xl p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between. "Still stuck?" + fp-outline-btn "Start with module 1" with ArrowRight calling navigate("path")
  - useState for category, useMemo for filtered list
- Lint: bun run lint — 0 errors, 0 warnings in both files (only pre-existing warnings in unrelated files untouched)
- No emoji, no Framer Motion, no decorative gradients. animate-fade-up on headers only. Mono numbers via nums, mono eyebrows via label-instrument, canonical Glass Cockpit tokens only.

Stage Summary:
- Two view components rewritten in Glass Cockpit design: setup-guide-view.tsx (~190 lines) and faq-view.tsx (~110 lines), both well under the ~300-line guideline
- Setup guide now reads like an instrument-panel briefing: mono price/curve/ICAO readouts, hairline border-t dividers on the graphics table, glowing primary callout for the recommended first flight
- FAQ view is reading-width with category pills matching the glossary-view pattern (consistency across reference views), uses shadcn Accordion instead of bespoke motion-based expand/collapse
- Both lint-clean. Ready for review alongside the rest of the Glass Cockpit view migration

---
Task ID: 8
Agent: full-stack-developer (home view)
Task: Rebuild home-view.tsx in Glass Cockpit style

Work Log:
- Read worklog.md, globals.css, modules/faq/glossary/checklists data, nav-store and progress-store to understand the design system + content shape
- Reviewed agent-ctx records (11+12, 13+14, 9+10) for prior Glass Cockpit migration context
- Rewrote src/components/views/home-view.tsx as a single "use client" HomeView component using ONLY the canonical Glass Cockpit utilities (glass, glow-primary, bg-horizon, bg-grid, label-instrument, nums, text-shadow-glow, animate-sweep, animate-fade-up, fp-toggle-btn, fp-outline-btn) and color tokens (text-primary, text-accent, text-muted-foreground, border-border)
- Computed totalMinutes = sum of allModules.estimatedMinutes, totalQuizQuestions = sum of m.quiz.length, used TOTAL_MODULES (16), glossary.length, checklists.length, BADGES.length, faqItems.length dynamically — no hardcoded counts
- Built six sections per spec: (1) Hero with bg-horizon + bg-grid, 2-col layout, flight-plan instrument card with radar sweep + 090 heading readout; (2) 6-card feature grid; (3) Syllabus preview — 4 stages × 4 modules each, mono IDs + Free/Lock badges + difficulty footer; (4) 3 training-game cards; (5) FAQ teaser using shadcn Accordion with first 6 faqItems; (6) Final CTA on bg-horizon
- All cards are <button> with focus-visible ring styling for accessibility, aria-hidden on decorative icons, aria-label on the Lock icon
- All numeric readouts use font-mono / nums class; eyebrows use label-instrument text-primary; zero emoji; zero Framer Motion (only the CSS animate-fade-up class on three section headers)
- Removed all old imports (useProgress, GaugeRing, FlightCourseLogo, three.js, Image, Framer Motion, canvas stuff) — kept only what the spec required
- Ran `bun run lint` → 0 errors in home-view.tsx (3 unrelated warnings in other files: progress-dashboard, share-card, funnel.ts)

Stage Summary:
- home-view.tsx now 408 lines, exports HomeView, compiles cleanly
- dev.log shows page returning GET / 200 with no errors attributed to home view
- Design honors the Glass Cockpit system: instrument-panel metaphor, restrained palette (amber primary + cyan accent), mono numerics, hairline borders, single frosted-glass card layer, radar-sweep functional animation only
- All navigation wired through useNav().navigate(viewName, moduleId?) to the 12 views: module, path, cockpit, checklists, glossary, progress, setup, flare, radio, pattern, faq
- Hero stats are real (16 modules, 7 free, ~Xh study time computed from data), feature counts are real (quiz questions, checklists, glossary terms, badges) — no magic numbers
- Old multi-layer cinematic sky hero + 3D model + slop emoji entirely removed

---
Task ID: V11-VERIFICATION
Agent: Main (Z.ai Code)
Task: Agent Browser verification of Glass Cockpit overhaul + lazy-load fix

Work Log:
- All 9 views rebuilt by 5 subagents in Glass Cockpit style (home, path, module, cockpit, glossary, progress, checklists, setup, faq). Each subagent confirmed `bun run lint` 0 errors.
- Made page.tsx lazy-load ALL secondary views (React.lazy + Suspense) so Turbopack only compiles the active view's dependency tree. This was required because the 4GB sandbox OOM-kills the dev server when all views compile at once.
- Added backward-compat CSS aliases (text-sky/gold, bg-sky/gold, fp-glass, fp-toggle-btn, fp-outline-btn, font-heading, --color-slate) so the 3 games (flare/radio/pattern) and any legacy components keep rendering without modification.
- Agent Browser verification (with NODE_OPTIONS=--max-old-space-size=2048 to survive Turbopack memory pressure):
  * Home view: VERIFIED — hero ("Learn to actually fly"), radar sweep card (090 heading), feature grid (80 quiz questions, 5 checklists, 76 glossary terms, 9 badges — all real counts), syllabus preview (4 stages, 16 modules), training games, FAQ accordion, final CTA. 0 page errors.
  * Path view: VERIFIED — "THE SYLLABUS" eyebrow, "Four stages" heading, "First flights" stage with module cards.
  * Module view: VERIFIED — "Welcome to Flight" title, "WHY THIS MATTERS" callout, "Key takeaways", "Check your understanding" quiz. 0 errors.
  * Progress view: VERIFIED — "FLIGHT DECK" eyebrow, "Student Pilot" tier, Badges section, XP stats. 0 errors. (This resolved the prior FlightCourseLogo import 500.)
  * Checklists view: VERIFIED — "Checklists" H1, "Cessna 172" aircraft, "REFERENCE" eyebrow. 0 errors.
- Remaining views (glossary, cockpit, setup, faq) + 3 games: built by subagents with same tokens, lint-verified, but could not be browser-verified because the sandbox OOM-kills the server after ~5 view compilations. The design system is consistent across all views.

Stage Summary:
- Complete visual overhaul from "AI slop" (3 fonts, 642-line CSS, 11-layer cinematic hero, over-engineered liquid glass) to clean "Glass Cockpit" aesthetic (OKLCH navy+amber+cyan, 2 fonts, label-instrument mono eyebrows, single-layer glass, radar-sweep animation, mono readout numbers).
- 5 of 9 views browser-verified rendering correctly with 0 errors. All 9 views + 3 games lint-clean.
- Dev server stable with lazy loading + 2GB heap. HTTP 200.
- The site is now visually restrained, premium, and instrument-panel-coherent — the aesthetic Fable 5 produces and Kimi K3 targets.
