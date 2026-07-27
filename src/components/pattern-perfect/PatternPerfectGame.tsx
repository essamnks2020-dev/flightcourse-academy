"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StartScreen } from "./StartScreen";
import { Hud, type HudData } from "./Hud";
import { RadioCallPanel } from "./RadioCallPanel";
import { MobileControls } from "./MobileControls";
import { ResultsScreen } from "./ResultsScreen";
import { Dashboard } from "./Dashboard";
import { SettingsBar } from "./SettingsBar";
import { CtacTranscript } from "./CtacTranscript";
import { ReferencePanel } from "./ReferencePanel";

import { buildScenario, buildPracticalTestScenario, type ScenarioConfig } from "@/lib/data/pattern-scenarios";
import { AIRPORTS, PATTERN_CALL_ORDER, type CallPosition } from "@/lib/data/phraseology";
import { buildPattern } from "@/lib/pattern/geometry";
import {
  physicsStep,
  computeGuidance,
  determinePhase,
  maybeSampleTrail,
  speakWind,
  type Guidance,
} from "@/lib/pattern/physics";
import {
  createAIActor,
  updateAIActor,
  checkSpacing,
  recordConflict,
  aiPlacementsForDifficulty,
  collectAIRadioCalls,
} from "@/lib/pattern/ai-traffic";
import { scoreFlight, tolerancesFor } from "@/lib/pattern/scoring";
import { computeTransform, renderScene, type TimeOfDay } from "@/lib/pattern/render";
import { getRadioVoice } from "@/lib/pattern/radio-voice";
import { createCamera, updateCamera, addShake, cameraTransform, renderMinimap, type CameraState } from "@/lib/pattern/camera";
import { ParticleSystem } from "@/lib/pattern/particles";
import { getAudioEngine } from "@/lib/pattern/audio";
import { preloadAssets } from "@/lib/pattern/assets";
import { trackFunnel } from "@/lib/funnel";
import { useProgressStore } from "@/lib/store/progress-store";
import type {
  AIRadioCall,
  AircraftState,
  AIActor,
  FlightRecording,
  FlightResult,
  LegName,
  PatternGeometry,
  TrailPoint,
  Vec2,
  Wind,
} from "@/lib/pattern/types";

type Phase = "start" | "flying" | "results";

interface MutableGame {
  geo: PatternGeometry;
  wind: Wind;
  player: AircraftState;
  trail: TrailPoint[];
  ai: AIActor[];
  leg: LegName;
  timeSec: number;
  acc: number;
  recording: FlightRecording;
  radioDone: Set<CallPosition>;
  ended: boolean;
  criticalAt: number | null;
  conflictFunnelFired: boolean;
  lastAltSample: number;
  lastHudCommit: number;
  completed: boolean;
  difficulty: "rookie" | "student" | "solo";
  cam: CameraState;
  particles: ParticleSystem;
  goAroundOfferedAt: number | null; // when the go-around call was offered (critical conflict)
  goAroundResolved: "recovered" | "failed" | null;
  goAroundRealElapsed: number; // real-time seconds elapsed since go-around offer (sim is paused)
}

function initGame(scenario: ScenarioConfig): MutableGame {
  const geo = buildPattern(scenario.runway);
  const startState: AircraftState = {
    pos: { ...geo.entryStart },
    headingDeg: geo.entryHeadingDeg,
    bankDeg: 0,
    altitudeFt: geo.dims.patternAltitudeFt,
    airspeedKt: 95,
    verticalSpeedFpm: 0,
    onGround: false,
  };
  const placements = aiPlacementsForDifficulty(scenario.difficulty);
  const ai = placements.map((p) =>
    createAIActor(geo, {
      callsign: p.callsign,
      startLeg: p.startLeg,
      startProgress: p.startProgress,
      spawnDelaySec: p.spawnDelaySec,
      lateralOffsetFt: p.lateralOffsetFt,
    }),
  );
  const trail: TrailPoint[] = [
    { x: startState.pos.x, y: startState.pos.y, t: 0, leg: "entry" },
  ];
  const recording: FlightRecording = {
    trail,
    altitudeSamples: [{ t: 0, alt: startState.altitudeFt, target: geo.dims.patternAltitudeFt }],
    legTransitions: [{ leg: "entry", t: 0, pos: { ...startState.pos }, headingDeg: startState.headingDeg, altitudeFt: startState.altitudeFt }],
    radioCalls: [],
    conflicts: [],
    minSeparationFt: 99999,
    wind: scenario.wind,
    flightTimeSec: 0,
    completedPattern: false,
  };
  return {
    geo,
    wind: scenario.wind,
    player: startState,
    trail,
    ai,
    leg: "entry",
    timeSec: 0,
    acc: 0,
    recording,
    radioDone: new Set(),
    ended: false,
    criticalAt: null,
    conflictFunnelFired: false,
    lastAltSample: 0,
    lastHudCommit: 0,
    completed: false,
    difficulty: scenario.difficulty,
    cam: createCamera(geo),
    particles: new ParticleSystem(),
    goAroundOfferedAt: null,
    goAroundResolved: null,
    goAroundRealElapsed: 0,
  };
}

const TRIGGER_RADIUS: Record<CallPosition, number> = {
  "entering-downwind": 750,
  "midfield-downwind": 750,
  "turning-base": 850,
  "turning-final": 850,
  "going-around": 0, // triggered by critical-conflict detection, not position
  "clear-of-runway": 0, // triggered by rollout progress instead
};

function radioPointFor(geo: PatternGeometry, pos: CallPosition): Vec2 | null {
  const rp = geo.radioCallPoints.find((r) => r.position === pos);
  return rp ? rp.pos : null;
}

export function PatternPerfectGame() {
  const [view, setView] = useState<"game" | "dashboard">("game");
  const [phase, setPhase] = useState<Phase>("start");
  const [difficulty, setDifficulty] = useState<"rookie" | "student" | "solo">("rookie");
  const [rightTraffic, setRightTraffic] = useState(false);
  const [airportChoice, setAirportChoice] = useState<"riverside" | "cedarlake" | "meadowfield">("riverside");
  const [hud, setHud] = useState<HudData | null>(null);
  const [pendingRadio, setPendingRadio] = useState<{
    position: CallPosition;
    altitudeFt: number;
  } | null>(null);
  const [result, setResult] = useState<FlightResult | null>(null);
  const [conflictFlash, setConflictFlash] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeOfDay, setTimeOfDayState] = useState<TimeOfDay>(() => useProgressStore.getState().settings.timeOfDay as TimeOfDay);
  const [muted, setMutedState] = useState<boolean>(() => useProgressStore.getState().settings.muted);
  const [showHints, setShowHints] = useState(true);
  const [ctafTranscript, setCtafTranscript] = useState<AIRadioCall[]>([]);
  const [showReference, setShowReference] = useState(false);
  const [practicalTest, setPracticalTest] = useState(false);

  const scenario = useMemo(() => buildScenario(difficulty, rightTraffic, airportChoice), [difficulty, rightTraffic, airportChoice]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<MutableGame | null>(null);
  const inputRef = useRef({ left: false, right: false });
  const pendingRadioRef = useRef<{ position: CallPosition; altitudeFt: number } | null>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 800, h: 600, dpr: 1 });
  const timeOfDayRef = useRef<TimeOfDay>("dusk");
  const mutedRef = useRef(false);
  const audioRef = useRef(getAudioEngine());
  const radioVoiceRef = useRef(getRadioVoice());

  useEffect(() => { timeOfDayRef.current = timeOfDay; }, [timeOfDay]);
  useEffect(() => {
    mutedRef.current = muted;
    audioRef.current.setMuted(muted);
    radioVoiceRef.current.enabled = !muted;
  }, [muted]);

  // Preload illustrated assets (progressive enhancement — renderer falls back
  // to procedural drawing for any missing file, so this never blocks gameplay).
  useEffect(() => { void preloadAssets(); }, []);

  const freeAttempts = useProgressStore((s) => s.freeAttempts);
  const best = useProgressStore((s) => s.games["pattern-perfect"]);
  const registerAttempt = useProgressStore((s) => s.registerAttempt);
  const spendAttempt = useProgressStore((s) => s.spendAttempt);
  const recordCompletion = useProgressStore((s) => s.recordCompletion);
  const recordPatternFlight = useProgressStore((s) => s.recordPatternFlight);
  const setSetting = useProgressStore((s) => s.setSetting);

  // Route time-of-day / mute setter calls through the persisted store so they
  // survive a reload (initialized lazily from the store above).
  const setTimeOfDay = useCallback((t: TimeOfDay) => { setTimeOfDayState(t); setSetting("timeOfDay", t); }, [setSetting]);
  const setMuted = useCallback((m: boolean) => { setMutedState(m); setSetting("muted", m); }, [setSetting]);

  // Keep refs in sync with state for use inside the rAF loop.
  useEffect(() => {
    pendingRadioRef.current = pendingRadio;
  }, [pendingRadio]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Warn before navigating away mid-flight (an interrupted flight otherwise
  // loses everything with no warning).
  useEffect(() => {
    if (phase !== "flying") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  /* ----------------------------- canvas sizing ---------------------------- */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [view, phase]);

  /* ------------------------------- keyboard ------------------------------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        inputRef.current.left = true;
        e.preventDefault();
      } else if (k === "arrowright" || k === "d") {
        inputRef.current.right = true;
        e.preventDefault();
      } else if (k === " " || k === "p") {
        if (phase === "flying" && !pendingRadioRef.current) {
          setPaused((p) => !p);
          e.preventDefault();
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") inputRef.current.left = false;
      else if (k === "arrowright" || k === "d") inputRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [phase]);

  /* ------------------------------- game loop ------------------------------ */
  const endFlight = useCallback((completed: boolean) => {
    const g = gameRef.current;
    if (!g || g.ended) return;
    g.ended = true;
    g.completed = completed;
    g.recording.completedPattern = completed;
    g.recording.flightTimeSec = g.timeSec;
    const res = scoreFlight(g.geo, g.recording, g.difficulty);
    recordCompletion("pattern-perfect", res.totalScore, res.grade);
    // Rich progression data: XP, streaks, achievements.
    const trackPct = Math.round(
      res.checkpoints
        .filter((c) => c.category === "track" || c.category === "entry")
        .reduce((sum, c) => sum + (c.score / 100) * c.maxScore, 0) /
        res.checkpoints
          .filter((c) => c.category === "track" || c.category === "entry")
          .reduce((sum, c) => sum + c.maxScore, 0) *
        100,
    );
    const radioPerfect = res.radioCalls.length > 0 && res.radioCalls.every((r) => r.correct && !r.banned);
    // Aggregate per-category scores (avg of that category's checkpoints) for
    // weak-area tracking across flights.
    const cats = ["entry", "track", "altitude", "turn-timing", "radio", "sequencing"] as const;
    const categoryScores = cats
      .map((cat) => {
        const items = res.checkpoints.filter((c) => c.category === cat);
        if (items.length === 0) return null;
        const avg = items.reduce((a, b) => a + b.score, 0) / items.length;
        return { category: cat, score: Math.round(avg), ts: Date.now() };
      })
      .filter((x): x is { category: typeof cats[number]; score: number; ts: number } => x !== null);
    recordPatternFlight({
      score: res.totalScore,
      grade: res.grade,
      flightTimeSec: res.flightTimeSec,
      trackPct: isNaN(trackPct) ? 0 : trackPct,
      radioPerfect,
      noWarnings: res.conflicts === 0,
      categoryScores,
    });
    audioRef.current.play(res.grade === "redo" ? "conflict-critical" : "complete");
    trackFunnel("flight-complete", { data: { grade: res.grade, score: res.totalScore, completed } });
    setResult(res);
    setPhase("results");
  }, [recordCompletion, recordPatternFlight]);

  const stepGame = useCallback(
    (realDt: number) => {
      const g = gameRef.current;
      const canvas = canvasRef.current;
      if (!g || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isPaused = pausedRef.current || pendingRadioRef.current !== null || g.ended;

      if (!isPaused && !g.criticalAt) {
        // Fixed-timestep physics at 120 Hz (frame-rate independent: identical at 60 or 120 fps).
        const STEP = 1 / 120;
        g.acc += Math.min(realDt, 0.05);
        let iterations = 0;
        while (g.acc >= STEP && iterations < 8) {
          // Determine leg + guidance.
          const newLeg = determinePhase(g.geo, g.player, g.leg);
          if (newLeg !== g.leg) {
            // Leg transition: spark burst + checkpoint sound + popup.
            const [px, py] = [g.player.pos.x, g.player.pos.y];
            const color = newLeg === "final" ? "#f2b134" : "#3e92cc";
            // We'll convert world→screen after camera update; queue via popup using world coords handled in render.
            g.particles.burst(px, py, color, 14);
            g.particles.popup(px, py, newLeg.toUpperCase(), color);
            audioRef.current.play("checkpoint");
            g.leg = newLeg;
            g.recording.legTransitions.push({
              leg: newLeg,
              t: g.timeSec,
              pos: { ...g.player.pos },
              headingDeg: g.player.headingDeg,
              altitudeFt: g.player.altitudeFt,
            });
          }
          const guidance: Guidance = computeGuidance(g.geo, g.player, g.leg);
          g.player = physicsStep(g.player, inputRef.current, g.wind, guidance, g.timeSec, STEP);
          g.timeSec += STEP;
          maybeSampleTrail(g.trail, g.player.pos, g.timeSec, g.leg);
          // Engine exhaust particles (behind the aircraft).
          if (iterations % 3 === 0 && !guidance.onGround) {
            const hr = (g.player.headingDeg * Math.PI) / 180;
            g.particles.exhaust(
              g.player.pos.x - Math.sin(hr) * 22,
              g.player.pos.y - Math.cos(hr) * 22,
              hr,
            );
          }
          // Altitude sampling (throttled).
          if (g.timeSec - g.lastAltSample > 0.2) {
            g.recording.altitudeSamples.push({
              t: g.timeSec,
              alt: g.player.altitudeFt,
              target: guidance.targetAltFt,
            });
            g.lastAltSample = g.timeSec;
          }
          g.acc -= STEP;
          iterations++;
        }

        // Camera follows the player.
        g.cam = updateCamera(
          g.cam,
          {
            pos: g.player.pos,
            headingDeg: g.player.headingDeg,
            leg: g.leg,
            airspeedKt: g.player.airspeedKt,
          },
          g.geo,
          Math.min(realDt, 0.05),
        );

        // Particles update (in world space; rendered via camera transform).
        g.particles.update(Math.min(realDt, 0.05));

        // Audio layers track flight state.
        audioRef.current.updateLayers(g.player.airspeedKt, g.player.onGround);

        // AI update (once per frame, real dt).
        g.ai = g.ai.map((a) => updateAIActor(a, g.geo, g.timeSec, Math.min(realDt, 0.05)));

        // AI traffic radio calls — each AI transmits its own position reports
        // at the same checkpoints the player does, using the SAME phraseology
        // builder. This is the real learning payoff: building a mental picture
        // from radio calls the way a real pilot does.
        const aiCalls = collectAIRadioCalls(g.ai, g.geo, AIRPORTS[scenario.airportKey], g.timeSec, scenario.callsignSpoken);
        if (aiCalls.length > 0) {
          setCtafTranscript((prev) => [...prev, ...aiCalls].slice(-12));
          // Speak each new AI call (radio-filtered). Non-blocking; falls back silently.
          for (const c of aiCalls) {
            void radioVoiceRef.current.speak(c.text);
          }
          audioRef.current.play("transmit");
        }

        // Spacing / conflicts.
        const spacing = checkSpacing(g.player, g.ai);
        if (spacing.warning) recordConflict(g.recording, g.timeSec, spacing.minSeparationFt, "warn");
        if (spacing.critical && !g.criticalAt) {
          g.criticalAt = g.timeSec;
          setConflictFlash(true);
          g.cam = addShake(g.cam, 0.9);
          audioRef.current.play("conflict-critical");
          if (!g.conflictFunnelFired) {
            g.conflictFunnelFired = true;
            trackFunnel("sequencing-conflict-triggered", {
              data: { sep: spacing.minSeparationFt, severity: "critical" },
            });
          }
          // Give the player a brief window to initiate the go-around call
          // themselves (the actual teaching point). If they don't respond in
          // time, or get the call wrong, the existing redo behavior stands.
          if (!pendingRadioRef.current && !g.radioDone.has("going-around")) {
            const snap = { position: "going-around" as CallPosition, altitudeFt: g.player.altitudeFt };
            pendingRadioRef.current = snap;
            setPendingRadio(snap);
            audioRef.current.play("transmit");
            g.goAroundOfferedAt = g.timeSec;
          }
        } else if (spacing.warning && !g.conflictFunnelFired) {
          g.conflictFunnelFired = true;
          g.cam = addShake(g.cam, 0.3);
          audioRef.current.play("conflict-warn");
          trackFunnel("sequencing-conflict-triggered", {
            data: { sep: spacing.minSeparationFt, severity: "warn" },
          });
        }

        // Radio call trigger (positional).
        if (!pendingRadioRef.current) {
          const next = PATTERN_CALL_ORDER.find((p) => !g.radioDone.has(p));
          if (next) {
            let fire = false;
            if (next === "clear-of-runway") {
              if (g.leg === "rollout" && g.player.onGround) fire = true;
            } else {
              const pt = radioPointFor(g.geo, next);
              if (pt) {
                const d = Math.hypot(g.player.pos.x - pt.x, g.player.pos.y - pt.y);
                if (d < TRIGGER_RADIUS[next]) fire = true;
              }
            }
            if (fire) {
              const snap = { position: next, altitudeFt: g.player.altitudeFt };
              pendingRadioRef.current = snap;
              setPendingRadio(snap);
              audioRef.current.play("transmit");
            }
          }
        }

        // Completion.
        if (g.leg === "rollout") {
          const clearPt = g.geo.clearOfRunwayPoint;
          const dClear = Math.hypot(g.player.pos.x - clearPt.x, g.player.pos.y - clearPt.y);
          const legDef = g.geo.legs.find((l) => l.name === "rollout")!;
          const seg = { x: legDef.end.x - legDef.start.x, y: legDef.end.y - legDef.start.y };
          const prog = Math.hypot(g.player.pos.x - legDef.start.x, g.player.pos.y - legDef.start.y) / (Math.hypot(seg.x, seg.y) || 1);
          if (prog > 0.85 || dClear < 400 || (g.player.onGround && g.player.airspeedKt < 5)) {
            // Only complete once the clear-of-runway call is done (or skipped via timeout).
            if (g.radioDone.has("clear-of-runway") || g.timeSec > 195) {
              endFlight(true);
            }
          }
        }
        if (g.timeSec > 200) endFlight(false);
      } else {
        // Even when paused, keep camera + particles settling for a smooth feel.
        g.cam = updateCamera(g.cam, { pos: g.player.pos, headingDeg: g.player.headingDeg, leg: g.leg, airspeedKt: g.player.airspeedKt }, g.geo, Math.min(realDt, 0.05));
        g.particles.update(Math.min(realDt, 0.05));
        // Go-around timeout: the radio panel pauses sim time, so measure the
        // window in real seconds via criticalAtReal. If the player hasn't
        // answered within 8s of the offer, count it as a failed recovery.
        if (g.goAroundOfferedAt !== null && g.goAroundResolved === null && pendingRadioRef.current?.position === "going-around") {
          const elapsed = g.timeSec - g.goAroundOfferedAt;
          // timeSec doesn't advance while paused; use a real-time fallback counter.
          g.goAroundRealElapsed = (g.goAroundRealElapsed ?? 0) + realDt;
          if (g.goAroundRealElapsed > 8) {
            g.goAroundResolved = "failed";
            pendingRadioRef.current = null;
            setPendingRadio(null);
            window.setTimeout(() => endFlight(false), 600);
          }
          void elapsed;
        }
      }

      // Render.
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const tf = cameraTransform(g.cam, g.geo, w, h);
      const tol = tolerancesFor(g.difficulty);
      const spacing = checkSpacing(g.player, g.ai);
      const conflict: "none" | "warn" | "critical" = g.criticalAt
        ? "critical"
        : spacing.warning
          ? "warn"
          : "none";
      // Wind vector in screen-px/s (for streak particles).
      const windRad = ((g.wind.fromHeadingDeg + 180) * Math.PI) / 180;
      const windSpeedPx = g.wind.speedKt * 1.688 * tf.scale; // ft/s → px/s
      const windVxPx = Math.sin(windRad) * windSpeedPx;
      const windVyPx = -Math.cos(windRad) * windSpeedPx;
      renderScene({
        ctx,
        tf,
        geo: g.geo,
        player: g.player,
        playerTrail: g.trail,
        ai: g.ai,
        wind: g.wind,
        timeSec: g.timeSec,
        guideAlpha: tol.guideVisible ? (g.difficulty === "rookie" ? 0.7 : g.difficulty === "student" ? 0.4 : 0.12) : 0,
        conflict,
        showLabels: true,
        timeOfDay: timeOfDayRef.current,
        particles: g.particles,
        windVxPx,
        windVyPx,
        airportKey: scenario.airportKey,
      });

      // Minimap (bottom-right) — full pattern overview.
      const mmW = Math.min(150, w * 0.28);
      const mmH = Math.min(110, h * 0.28);
      const mmPad = 12;
      renderMinimap(ctx, w - mmW - mmPad, h - mmH - mmPad, {
        geo: g.geo,
        player: g.player,
        ai: g.ai,
        cam: g.cam,
        width: mmW,
        height: mmH,
      });

      // HUD snapshot (throttled ~12 Hz).
      if (g.timeSec - g.lastHudCommit > 0.08) {
        g.lastHudCommit = g.timeSec;
        const nextCall = PATTERN_CALL_ORDER.find((p) => !g.radioDone.has(p)) ?? null;
        const callLabels: Record<CallPosition, string> = {
          "entering-downwind": "entering downwind",
          "midfield-downwind": "midfield downwind",
          "turning-base": "turning base",
          "turning-final": "turning final",
          "clear-of-runway": "clear of runway",
        };
        setHud({
          altitudeFt: g.player.altitudeFt,
          airspeedKt: g.player.airspeedKt,
          headingDeg: g.player.headingDeg,
          verticalSpeedFpm: g.player.verticalSpeedFpm,
          leg: g.leg,
          minSeparationFt: spacing.minSeparationFt,
          status: g.criticalAt ? "critical" : spacing.warning ? "warn" : "safe",
          nextCallLabel: nextCall ? callLabels[nextCall] : null,
          flightTimeSec: g.timeSec,
          callsign: scenario.callsignSpoken,
          windLabel: speakWind(g.wind),
          windFromDeg: g.wind.fromHeadingDeg,
        });
      }
    },
    [endFlight, scenario.callsignSpoken, scenario.airportKey],
  );

  useEffect(() => {
    if (phase !== "flying") return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      stepGame(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, stepGame]);

  /* ------------------------------- actions -------------------------------- */
  const startFlight = useCallback((opts?: { practicalTest?: boolean }) => {
    const isTest = opts?.practicalTest ?? false;
    setPracticalTest(isTest);
    // Init audio on this user gesture (autoplay policy).
    audioRef.current.init();
    audioRef.current.setMuted(mutedRef.current);
    if (!isTest) {
      registerAttempt("pattern-perfect");
      spendAttempt();
    }
    const sc = isTest
      ? buildPracticalTestScenario()
      : buildScenario(difficulty, rightTraffic, airportChoice);
    gameRef.current = initGame(sc);
    inputRef.current = { left: false, right: false };
    setHud(null);
    setPendingRadio(null);
    setResult(null);
    setConflictFlash(false);
    setPaused(false);
    setCtafTranscript([]);
    radioVoiceRef.current.init();
    setPhase("flying");
    trackFunnel("flight-start", { data: { difficulty, rightTraffic } });
  }, [difficulty, rightTraffic, airportChoice, registerAttempt, spendAttempt]);

  const resolveRadio = useCallback(
    (r: { position: CallPosition; correct: boolean; banned: boolean; chosenText: string }) => {
      const g = gameRef.current;
      if (!g) return;
      g.recording.radioCalls.push({ ...r, ts: g.timeSec });
      g.radioDone.add(r.position);
      // Surface the player's own call in the CTAF transcript + speak it.
      setCtafTranscript((prev) =>
        [...prev, {
          actorId: "player",
          callsign: scenario.callsignSpoken,
          position: r.position,
          text: r.chosenText,
          correct: r.correct,
          ts: g.timeSec,
        } as AIRadioCall].slice(-12),
      );
      if (r.correct && !r.banned) {
        void radioVoiceRef.current.speak(r.chosenText);
      }
      // Audio + particle feedback.
      if (r.banned) {
        audioRef.current.play("banned");
      } else if (r.correct) {
        audioRef.current.play("correct");
        const rp = g.geo.radioCallPoints.find((p) => p.position === r.position);
        if (rp) g.particles.burst(rp.pos.x, rp.pos.y, "#f2b134", 20);
      } else {
        audioRef.current.play("incorrect");
      }
      if (!r.correct) {
        trackFunnel("radio-call-missed", { data: { position: r.position, banned: r.banned } });
      }
      // Go-around resolution: a correct call = recovered maneuver (flight
      // continues, scored as a real recovery); wrong/missed = failed, redo.
      if (r.position === "going-around") {
        if (r.correct) {
          g.goAroundResolved = "recovered";
          g.criticalAt = null; // clear the conflict state so the sim resumes
          setConflictFlash(false);
          // Climb back to pattern altitude on the upwind/go-around track.
          g.player.altitudeFt = Math.max(g.player.altitudeFt, g.geo.dims.patternAltitudeFt);
        } else {
          g.goAroundResolved = "failed";
          window.setTimeout(() => endFlight(false), 800);
        }
      }
      pendingRadioRef.current = null;
      setPendingRadio(null);
    },
    [endFlight, scenario.callsignSpoken],
  );

  const replay = useCallback(() => {
    startFlight();
  }, [startFlight]);

  const onMobilePress = useCallback((side: "left" | "right" | "level", pressed: boolean) => {
    if (side === "left") inputRef.current.left = pressed;
    else if (side === "right") inputRef.current.right = pressed;
    else {
      inputRef.current.left = false;
      inputRef.current.right = false;
    }
  }, []);

  const airport = AIRPORTS[scenario.airportKey];

  /* -------------------------------- render -------------------------------- */
  if (view === "dashboard") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
        >
          <Dashboard onBack={() => setView("game")} onPlay={() => { setView("game"); setPhase("start"); }} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (phase === "start") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="start"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <StartScreen
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            rightTraffic={rightTraffic}
            setRightTraffic={setRightTraffic}
            airportChoice={airportChoice}
            setAirportChoice={setAirportChoice}
            scenario={scenario}
            freeAttempts={freeAttempts}
            best={best}
            onStart={startFlight}
            onOpenDashboard={() => setView("dashboard")}
            onOpenReference={() => setShowReference(true)}
            onStartPracticalTest={() => startFlight({ practicalTest: true })}
            practicalTestUnlocked={!!best?.completed && best.bestScore >= 70}
            timeOfDay={timeOfDay}
            setTimeOfDay={setTimeOfDay}
            muted={muted}
            setMuted={setMuted}
          />
          <AnimatePresence>
            {showReference && <ReferencePanel onClose={() => setShowReference(false)} />}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (phase === "results" && result) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="results"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResultsScreen
            result={result}
            scenario={scenario}
            geo={buildPattern(scenario.runway)}
            onReplay={replay}
            onHome={() => setPhase("start")}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Flying view.
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-2 py-3 sm:px-4 sm:py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => setPhase("start")} className="glass gap-1 text-muted-foreground">
          <X className="h-4 w-4" /> Exit flight
        </Button>
        <div className="glass rounded-full px-3 py-1 font-display text-sm font-semibold text-foreground">
          {scenario.label}
        </div>
        <div className="flex items-center gap-2">
          <SettingsBar timeOfDay={timeOfDay} setTimeOfDay={setTimeOfDay} muted={muted} setMuted={setMuted} compact />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaused((p) => !p)}
            className="glass gap-1"
            disabled={!!pendingRadio || practicalTest}
            title={practicalTest ? "Paused during Practical Test" : ""}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-sky/25 shadow-2xl shadow-navy-deep/60 sm:aspect-[16/9]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {hud && <Hud data={hud} />}
        <CtacTranscript transcript={ctafTranscript} playerCallsign={scenario.callsignSpoken} />
        <MobileControls onPress={onMobilePress} />

        {pendingRadio && (
          <RadioCallPanel
            position={pendingRadio.position}
            airport={airport}
            callsign={scenario.callsign}
            altitudeFt={Math.round(pendingRadio.altitudeFt)}
            onResolved={resolveRadio}
          />
        )}

        <AnimatePresence>
          {paused && !pendingRadio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-navy-deep/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <Card className="glass-strong border-sky/30 p-6 text-center">
                  <Pause className="mx-auto mb-2 h-8 w-8 text-sky" />
                  <div className="font-display text-lg font-bold text-foreground">Paused</div>
                  <p className="mt-1 text-sm text-muted-foreground">Take a breath. Resume when ready.</p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button onClick={() => setPaused(false)} className="mt-3 gap-1 bg-gradient-to-r from-gold to-gold-warm text-navy shadow-lg shadow-gold/30">
                      <Play className="h-4 w-4" /> Resume
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {conflictFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-destructive/20"
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="glass-strong rounded-2xl border border-destructive px-6 py-4 text-center"
              >
                <AlertTriangle className="mx-auto mb-1 h-9 w-9 text-destructive" />
                <div className="font-display text-2xl font-extrabold text-destructive glow-text-sky">NEAR MISS</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Unsafe spacing — going around</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <span className="font-mono text-foreground">←/→</span> or <span className="font-mono text-foreground">A/D</span> to bank ·
        <span className="font-mono text-foreground"> Space</span> to pause · on-screen buttons on touch ·
        Crab into the wind to hold your ground track.
      </p>
      <AnimatePresence>
        {showReference && <ReferencePanel onClose={() => setShowReference(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
