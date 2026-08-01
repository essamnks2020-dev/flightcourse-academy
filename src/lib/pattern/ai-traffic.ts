/**
 * AI traffic for Pattern Perfect.
 *
 * Each AI aircraft flies the published pattern ground track (it "knows" the wind
 * and corrects for it, so it stays a clean reference for the player to sequence
 * against). A small, slowly-drifting lateral + altitude offset keeps it from
 * looking robotic and makes it realistically beatable.
 *
 * Spacing/conflict detection lives here too: the player must recognise the AI's
 * position and extend/adjust. Unsafe spacing is flagged clearly; a true
 * near-miss is a critical event (the whole teaching point of the game).
 */

import type {
  AIActor,
  AIRadioCall,
  AircraftState,
  PatternGeometry,
  Vec2,
  Wind,
  LegName,
  FlightRecording,
} from "./types";
import {
  buildCorrectCall,
  buildRadioCallScenario,
  type CallPosition,
  type AirportInfo,
} from "@/lib/data/phraseology";
import {
  add,
  sub,
  scale,
  lerp,
  dirFromHeading,
  targetAltitudeForLeg,
  targetAirspeedForLeg,
  dist,
  clamp,
} from "./geometry";
import { KT_TO_FPS, MAX_BANK_DEG } from "./physics";

export const WARN_SEPARATION_FT = 1300; // "TRAFFIC — watch your spacing"
export const CRITICAL_SEPARATION_FT = 650; // near-miss
const ALTITUDE_BAND_FT = 250; // conflicts only matter when altitudes are close

const AI_COLORS = ["#6fb7e6", "#9ad0f0"];

let aiCounter = 0;

export function createAIActor(
  geo: PatternGeometry,
  opts: {
    callsign: string;
    spawnDelaySec?: number;
    startLeg?: LegName;
    startProgress?: number;
    lateralOffsetFt?: number;
    altitudeOffsetFt?: number;
  },
): AIActor {
  const startLeg: LegName = opts.startLeg ?? "entry";
  const startProgress = opts.startProgress ?? 0;
  const legDef = geo.legs.find((l) => l.name === startLeg)!;
  const startPos = lerp(legDef.start, legDef.end, startProgress);
  const heading = legDef.headingDeg;

  aiCounter += 1;
  return {
    id: `ai-${aiCounter}`,
    callsign: opts.callsign,
    color: AI_COLORS[(aiCounter - 1) % AI_COLORS.length],
    state: {
      pos: startPos,
      headingDeg: heading,
      bankDeg: 0,
      altitudeFt: legDef.altitudeStartFt,
      airspeedKt: targetAirspeedForLeg(startLeg),
      verticalSpeedFpm: 0,
      onGround: startLeg === "rollout",
    },
    leg: startLeg,
    legProgress: startProgress,
    lateralOffsetFt: opts.lateralOffsetFt ?? 0,
    altitudeOffsetFt: opts.altitudeOffsetFt ?? 0,
    spawnDelaySec: opts.spawnDelaySec ?? 0,
    active: (opts.spawnDelaySec ?? 0) <= 0,
    trail: [{ x: startPos.x, y: startPos.y, t: 0, leg: startLeg }],
    callsMade: new Set(),
    badCallSeed: null,
  };
}

const LEG_ORDER: LegName[] = ["entry", "downwind", "base", "final", "rollout"];

/** Perpendicular offset direction for a leg (for lateral imperfection). */
function legOffsetDir(geo: PatternGeometry, leg: LegName): Vec2 {
  switch (leg) {
    case "entry":
    case "downwind":
    case "final":
    case "rollout":
      return geo.side;
    case "base":
      return geo.recip;
  }
}

/** Turn direction sign for the next transition (+1 = right bank, -1 = left). */
function turnSignFor(geo: PatternGeometry, from: LegName): number {
  // Left traffic => all turns are left (negative bank). Right traffic => right.
  return geo.runway.trafficDirection === "left" ? -1 : 1;
}

/** Advance one AI aircraft by dt seconds. Returns the updated actor. */
export function updateAIActor(
  actor: AIActor,
  geo: PatternGeometry,
  timeSec: number,
  dt: number,
): AIActor {
  const a: AIActor = {
    ...actor,
    state: { ...actor.state, pos: { ...actor.state.pos } },
    trail: actor.trail,
  };

  if (!a.active) {
    if (timeSec >= a.spawnDelaySec) {
      a.active = true;
    } else {
      return a; // not spawned yet
    }
  }

  const legIdx = LEG_ORDER.indexOf(a.leg);
  const legDef = geo.legs[legIdx];
  const segLen = Math.max(1, dist(legDef.start, legDef.end));
  const Vfps = targetAirspeedForLeg(a.leg) * KT_TO_FPS;

  // Advance progress.
  a.legProgress += (Vfps * dt) / segLen;

  // Transition to next leg.
  while (a.legProgress >= 1 && legIdx < LEG_ORDER.length - 1) {
    a.legProgress -= 1;
    a.leg = LEG_ORDER[legIdx + 1];
  }

  const currentLeg = geo.legs[LEG_ORDER.indexOf(a.leg)];
  const basePos = lerp(currentLeg.start, currentLeg.end, clamp(a.legProgress, 0, 1));
  // Apply slowly-drifting lateral offset.
  const drift = Math.sin(timeSec * 0.25 + a.id.length) * 120;
  const offset = (a.lateralOffsetFt + drift) ;
  const offDir = legOffsetDir(geo, a.leg);
  a.state.pos = add(basePos, scale(offDir, offset));

  // Heading: ease toward the leg heading; show a bank in turn zones.
  const targetHeading = currentLeg.headingDeg;
  let dh = ((targetHeading - a.state.headingDeg + 540) % 360) - 180;
  const headingEase = clamp(dh, -90 * dt, 90 * dt);
  a.state.headingDeg = (a.state.headingDeg + headingEase + 360) % 360;

  // Visual bank: in the last 12% of a leg, bank into the next turn.
  const inTurnZone = a.legProgress > 0.86 && a.leg !== "rollout";
  const targetBank = inTurnZone ? turnSignFor(geo, a.leg) * MAX_BANK_DEG * 0.7 : 0;
  a.state.bankDeg = clamp(
    a.state.bankDeg + clamp(targetBank - a.state.bankDeg, -90 * dt, 90 * dt),
    -MAX_BANK_DEG,
    MAX_BANK_DEG,
  );

  // Altitude.
  const baseAlt = targetAltitudeForLeg(a.leg, a.legProgress, geo.dims.patternAltitudeFt);
  a.state.altitudeFt = Math.max(0, baseAlt + a.altitudeOffsetFt + Math.sin(timeSec * 0.4) * 20);
  a.state.airspeedKt = targetAirspeedForLeg(a.leg);
  a.state.onGround = a.leg === "rollout";

  // Trail sample (lighter than the player's).
  const last = a.trail[a.trail.length - 1];
  if (!last || dist(last, a.state.pos) > 120) {
    a.trail = [...a.trail, { x: a.state.pos.x, y: a.state.pos.y, t: timeSec, leg: a.leg }].slice(-300);
  }

  // AI exits the pattern after rollout completes.
  if (a.leg === "rollout" && a.legProgress >= 1) {
    a.active = false;
  }

  return a;
}

/* --------------------------- spacing / conflicts ------------------------- */

export interface SpacingResult {
  minSeparationFt: number;
  warning: boolean;
  critical: boolean;
  nearestActorId: string | null;
}

export function checkSpacing(
  player: AircraftState,
  actors: AIActor[],
): SpacingResult {
  let min = Infinity;
  let warning = false;
  let critical = false;
  let nearestId: string | null = null;

  for (const a of actors) {
    if (!a.active) continue;
    const d = dist(player.pos, a.state.pos);
    if (d < min) {
      min = d;
      nearestId = a.id;
    }
    const altDiff = Math.abs(player.altitudeFt - a.state.altitudeFt);
    if (altDiff < ALTITUDE_BAND_FT && d < CRITICAL_SEPARATION_FT) {
      critical = true;
    } else if (altDiff < ALTITUDE_BAND_FT && d < WARN_SEPARATION_FT) {
      warning = true;
    }
  }

  return {
    minSeparationFt: min === Infinity ? 99999 : min,
    warning,
    critical,
    nearestActorId: nearestId,
  };
}

/** Record a conflict into the flight recording (dedupes rapid repeats). */
export function recordConflict(
  rec: FlightRecording,
  timeSec: number,
  separationFt: number,
  severity: "warn" | "critical",
) {
  const last = rec.conflicts[rec.conflicts.length - 1];
  // Dedupe: only record if > 3s since the last same-severity event.
  if (last && last.severity === severity && timeSec - last.t < 3) return;
  rec.conflicts.push({ t: timeSec, sepFt: separationFt, severity });
  if (separationFt < rec.minSeparationFt) rec.minSeparationFt = separationFt;
}

/* ------------------------- AI scenario placements ------------------------ */

/**
 * Check each active AI aircraft for radio-call checkpoints it has reached but
 * not yet called, and generate the transmission text (correct, or deliberately
 * wrong if a badCallSeed is set for that position — the "spot the error" drill).
 * Returns new AIRadioCall events to surface in the CTAF transcript + speak via TTS.
 *
 * AI calls use the SAME phraseology builder as the player, so they're equally
 * accurate — this is the real learning payoff: building a mental picture from
 * radio calls the way a real pilot does.
 */
export function collectAIRadioCalls(
  actors: AIActor[],
  geo: PatternGeometry,
  airport: AirportInfo,
  timeSec: number,
  playerCallsign: string,
): AIRadioCall[] {
  const out: AIRadioCall[] = [];
  for (const a of actors) {
    if (!a.active) continue;
    // Map the AI's current leg+progress to a CallPosition it should be calling.
    const pos = aiCallPositionFor(a.leg, a.legProgress);
    if (!pos) continue;
    if (a.callsMade.has(pos)) continue;

    // Only call if the AI is actually near the checkpoint (not just past the leg).
    if (!aiAtCheckpoint(a, geo, pos)) continue;

    a.callsMade.add(pos);
    const intent = "for full-stop landing";
    const correctText = buildCorrectCall(pos, airport, a.callsign, airport.patternAltitudeFt, intent);

    // Seeded error: if this AI has a badCallSeed for this position, emit a
    // deliberately-wrong call (reusing the distractor generator) for the
    // "spot the other pilot's error" drill.
    let text = correctText;
    let correct = true;
    let hasError: boolean | undefined = undefined;
    if (a.badCallSeed === pos) {
      const scenario = buildRadioCallScenario(pos, airport, a.callsign, airport.patternAltitudeFt, intent);
      const wrong = scenario.options.find((o) => !o.correct && !o.banned);
      if (wrong) {
        text = wrong.text;
        correct = false;
        hasError = true;
      }
    }

    out.push({
      actorId: a.id,
      callsign: a.callsign,
      position: pos,
      text,
      correct,
      ts: timeSec,
      hasError,
    });
  }
  void playerCallsign;
  return out;
}

/** Map an AI's leg + progress to the CallPosition it should report, if any. */
function aiCallPositionFor(leg: LegName, progress: number): CallPosition | null {
  switch (leg) {
    case "entry":
      // Calls "entering downwind" once it has merged (~0.7+ progress).
      return progress > 0.7 ? "entering-downwind" : null;
    case "downwind":
      // Midfield downwind at ~0.5 progress.
      return progress > 0.45 && progress < 0.6 ? "midfield-downwind" : null;
    case "base":
      return progress > 0.2 && progress < 0.4 ? "turning-base" : null;
    case "final":
      return progress > 0.1 && progress < 0.3 ? "turning-final" : null;
    default:
      return null;
  }
}

function aiAtCheckpoint(a: AIActor, geo: PatternGeometry, pos: CallPosition): boolean {
  const rp = geo.radioCallPoints.find((r) => r.position === pos);
  if (!rp) return pos === "entering-downwind"; // entry call has no fixed point
  const d = dist(a.state.pos, rp.pos);
  return d < 1200;
}

export interface AIPlacement {
  callsign: string;
  startLeg: LegName;
  startProgress: number;
  spawnDelaySec?: number;
  lateralOffsetFt?: number;
}

/**
 * Define where AI traffic starts for a scenario. The placements are designed
 * so the player faces a genuine sequencing decision at least once per flight.
 */
export function aiPlacementsForDifficulty(
  difficulty: "rookie" | "student" | "solo",
): AIPlacement[] {
  switch (difficulty) {
    case "rookie":
      // One aircraft already on downwind, ahead of the player's entry.
      return [
        {
          callsign: "Cessna four-two-bravo",
          startLeg: "downwind",
          startProgress: 0.55,
          lateralOffsetFt: 200,
        },
      ];
    case "student":
      // One aircraft ahead on downwind, slightly closer (tighter spacing).
      return [
        {
          callsign: "Cessna four-two-bravo",
          startLeg: "downwind",
          startProgress: 0.42,
          lateralOffsetFt: 120,
        },
      ];
    case "solo":
      // Two aircraft: one ahead on downwind, one that joins mid-pattern.
      return [
        {
          callsign: "Cessna four-two-bravo",
          startLeg: "downwind",
          startProgress: 0.4,
          lateralOffsetFt: 100,
        },
        {
          callsign: "Skyhawk six-one-romeo",
          startLeg: "entry",
          startProgress: 0,
          spawnDelaySec: 22,
          lateralOffsetFt: -180,
        },
      ];
  }
}
