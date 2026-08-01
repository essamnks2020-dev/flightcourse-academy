/**
 * Pattern Perfect — flight physics.
 *
 * Deliberately simplified vs. a full flight model (deep physics live in the
 * Landing Flare Trainer). Here the player controls BANK only; airspeed and
 * altitude are auto-managed to leg targets so the focus stays on ground-track
 * shape, timing, radio calls and sequencing.
 *
 * What IS modelled accurately (because it is the teaching point):
 *   - Turn rate from bank: rate = g·tan(bank) / V   (the real formula)
 *   - Wind drift: ground velocity = air velocity + wind vector. The aircraft
 *     icon points along its heading (crab angle), while the ground track is
 *     pushed by wind — so drift correction is a visible, correctable skill.
 *   - Altitude profile: pattern altitude on downwind, descending on base/final.
 */

import type {
  AircraftState,
  InputState,
  Wind,
  Vec2,
  LegName,
  PatternGeometry,
  TrailPoint,
} from "./types";
import {
  add,
  scale,
  dirFromHeading,
  clamp,
  dot,
  sub,
  targetAltitudeForLeg,
  targetAirspeedForLeg,
} from "./geometry";

export const KT_TO_FPS = 1.68781;
const G = 32.174; // ft/s^2

export const MAX_BANK_DEG = 25;
const BANK_RATE_DEG_PER_S = 80; // how quickly bank eases toward the commanded value
const AIRSPEED_RESPONSE_KT_PER_S = 6;
const ALT_RESPONSE_PER_S = 0.7; // how quickly altitude settles toward target
const MAX_TURN_RATE_DEG_PER_S = 9; // safety cap

export const TRAIL_MIN_DIST_FT = 55;
export const TRAIL_MAX_POINTS = 1400;

export interface Guidance {
  leg: LegName;
  progress: number; // 0..1 along the current leg
  targetAltFt: number;
  targetAirspeedKt: number;
  onGround: boolean;
}

/* --------------------------------- wind ---------------------------------- */

/** Wind vector (ft/s) the aircraft is pushed by, including a smooth gust term. */
export function windVector(wind: Wind, timeSec: number): Vec2 {
  const towardHeading = wind.fromHeadingDeg + 180;
  const baseDir = dirFromHeading(towardHeading);
  const baseFps = wind.speedKt * KT_TO_FPS;

  // Smooth gust: a couple of layered sinusoids, bounded by gustKt.
  const g = wind.gustKt;
  const gustFactor =
    g > 0
      ? 0.5 *
        g *
        (Math.sin(timeSec * 0.6) * 0.6 + Math.sin(timeSec * 1.7 + 1.3) * 0.4)
      : 0;
  const gustDirWobble =
    g > 0 ? Math.sin(timeSec * 0.43 + 2.1) * 12 : 0; // small direction wobble (deg)

  const dir = dirFromHeading(towardHeading + gustDirWobble);
  const totalFps = baseFps + gustFactor * KT_TO_FPS;
  return { x: dir.x * totalFps, y: dir.y * totalFps };
}

/** Spoken wind for the HUD, e.g. "wind two-two-zero at eight". */
export function speakWind(wind: Wind): string {
  const from = Math.round(wind.fromHeadingDeg / 10) * 10;
  const padded = String(from).padStart(3, "0");
  const digits = padded
    .split("")
    .map((d) => ({ "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine" }[d] ?? d))
    .join("-");
  return `wind ${digits} at ${Math.round(wind.speedKt)}`;
}

/* --------------------------- phase / guidance ---------------------------- */

/**
 * Decide which leg the player is currently on and how far along it, based on
 * position + heading. Phase advances forward only (never backward) so a sloppy
 * pattern is still scored as progressing through the legs.
 */
export function determinePhase(
  geo: PatternGeometry,
  state: AircraftState,
  current: LegName,
): LegName {
  const p = state.pos;
  const hdg = state.headingDeg;
  const ad = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

  switch (current) {
    case "entry": {
      // Reach/pass the merge point, OR have turned onto downwind near it.
      const pastMerge = dot(sub(p, geo.mergePoint), geo.recip) > 200;
      const turnedDownwind =
        ad(hdg, geo.downwindHeadingDeg) < 30 &&
        dot(sub(p, geo.mergePoint), geo.recip) > -400;
      return pastMerge || turnedDownwind ? "downwind" : "entry";
    }
    case "downwind": {
      const pastBase = dot(sub(p, geo.turnBasePoint), geo.recip) > 200;
      const turnedBase =
        ad(hdg, geo.baseHeadingDeg) < 35 &&
        dot(sub(p, geo.turnBasePoint), geo.recip) > -500;
      return pastBase || turnedBase ? "base" : "downwind";
    }
    case "base": {
      const pastFinal = dot(sub(p, geo.turnFinalPoint), geo.baseDir) > 100;
      const turnedFinal =
        ad(hdg, geo.finalHeadingDeg) < 35 &&
        dot(sub(p, geo.turnFinalPoint), geo.baseDir) > -400;
      return pastFinal || turnedFinal ? "final" : "base";
    }
    case "final": {
      if (state.altitudeFt < 80) return "rollout";
      return "final";
    }
    case "rollout":
      return "rollout";
  }
}

/** Compute guidance targets for the current leg + progress. */
export function computeGuidance(
  geo: PatternGeometry,
  state: AircraftState,
  leg: LegName,
): Guidance {
  const legDef = geo.legs.find((l) => l.name === leg)!;
  const seg = sub(legDef.end, legDef.start);
  const segLen = Math.hypot(seg.x, seg.y) || 1;
  const alongVec = scale(seg, 1 / segLen);
  const rel = sub(state.pos, legDef.start);
  let progress = dot(rel, alongVec) / segLen;
  progress = clamp(progress, 0, 1);

  const onGround = leg === "rollout";
  const targetAltFt = onGround
    ? 0
    : targetAltitudeForLeg(leg, progress, geo.dims.patternAltitudeFt);
  const targetAirspeedKt = onGround ? 0 : targetAirspeedForLeg(leg);

  return { leg, progress, targetAltFt, targetAirspeedKt, onGround };
}

/* ------------------------------ physics step ----------------------------- */

export interface StepResult {
  state: AircraftState;
  sampledTrail: boolean;
}

/**
 * Advance the aircraft by `dt` seconds. Frame-rate independent: the caller
 * passes a fixed dt (we run fixed 120 Hz steps from the render loop), so
 * behaviour is identical at 60 fps or 120 fps display refresh.
 */
export function physicsStep(
  prev: AircraftState,
  input: InputState,
  wind: Wind,
  guidance: Guidance,
  timeSec: number,
  dt: number,
): AircraftState {
  const s: AircraftState = { ...prev, pos: { ...prev.pos } };

  // 1) Commanded bank from input. Left/right are mutually opposing; both = level.
  let targetBank = 0;
  if (guidance.onGround) {
    targetBank = 0;
  } else if (input.left && !input.right) {
    targetBank = -MAX_BANK_DEG;
  } else if (input.right && !input.left) {
    targetBank = MAX_BANK_DEG;
  }
  // Ease bank toward target (responsive but not instantaneous).
  const bankDelta = clamp(targetBank - s.bankDeg, -BANK_RATE_DEG_PER_S * dt, BANK_RATE_DEG_PER_S * dt);
  s.bankDeg = clamp(s.bankDeg + bankDelta, -MAX_BANK_DEG, MAX_BANK_DEG);

  // 2) Airspeed eases toward the leg target.
  if (guidance.onGround) {
    // Brake to a stop once on the runway.
    s.airspeedKt = Math.max(0, s.airspeedKt - 18 * dt);
  } else {
    const asDelta = clamp(
      guidance.targetAirspeedKt - s.airspeedKt,
      -AIRSPEED_RESPONSE_KT_PER_S * dt,
      AIRSPEED_RESPONSE_KT_PER_S * dt,
    );
    s.airspeedKt = Math.max(45, s.airspeedKt + asDelta);
  }

  // 3) Turn rate from bank (real formula), capped for safety.
  const Vfps = Math.max(20, s.airspeedKt * KT_TO_FPS);
  let turnRate = ((G * Math.tan((s.bankDeg * Math.PI) / 180)) / Vfps) * (180 / Math.PI);
  turnRate = clamp(turnRate, -MAX_TURN_RATE_DEG_PER_S, MAX_TURN_RATE_DEG_PER_S);
  if (guidance.onGround) turnRate = 0;
  s.headingDeg = (s.headingDeg + turnRate * dt + 360) % 360;

  // 4) Air velocity (along heading) + wind = ground velocity.
  const airDir = dirFromHeading(s.headingDeg);
  const airVel = scale(airDir, Vfps);
  const wVec = guidance.onGround ? { x: 0, y: 0 } : windVector(wind, timeSec);
  const groundVel = add(airVel, wVec);

  // 5) Integrate position.
  s.pos = add(s.pos, scale(groundVel, dt));

  // 6) Altitude eases toward target (auto-trim). On ground, pinned to 0.
  if (guidance.onGround) {
    s.altitudeFt = 0;
    s.verticalSpeedFpm = 0;
    s.onGround = true;
  } else {
    const oldAlt = s.altitudeFt;
    const k = clamp(ALT_RESPONSE_PER_S * dt, 0, 1);
    s.altitudeFt = oldAlt + (guidance.targetAltFt - oldAlt) * k;
    s.verticalSpeedFpm = ((s.altitudeFt - oldAlt) / Math.max(dt, 0.0001)) * 60;
    // Touchdown detection: if we're aligned on final/rollout and reach the ground.
    if (s.altitudeFt < 5 && (guidance.leg === "final" || guidance.leg === "rollout")) {
      s.altitudeFt = 0;
      s.onGround = true;
    } else {
      s.onGround = false;
    }
  }

  return s;
}

/* ------------------------------- trail ----------------------------------- */

export function maybeSampleTrail(
  trail: TrailPoint[],
  pos: Vec2,
  timeSec: number,
  leg: LegName,
): boolean {
  if (trail.length === 0) {
    trail.push({ x: pos.x, y: pos.y, t: timeSec, leg });
    return true;
  }
  const last = trail[trail.length - 1];
  const d = Math.hypot(pos.x - last.x, pos.y - last.y);
  if (d >= TRAIL_MIN_DIST_FT) {
    trail.push({ x: pos.x, y: pos.y, t: timeSec, leg });
    if (trail.length > TRAIL_MAX_POINTS) trail.shift();
    return true;
  }
  return false;
}
