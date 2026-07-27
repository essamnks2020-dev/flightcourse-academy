/**
 * Pattern geometry engine.
 *
 * Builds the standard rectangular traffic pattern from a runway + traffic
 * direction. Left vs right traffic is handled purely by the `side` normal, so
 * the entire pattern (downwind offset, 45° entry side, base direction, turn
 * handedness) mirrors correctly with no special-casing.
 *
 * Reference: FAA AC 90-66C — left-hand traffic is the default for fixed-wing
 * aircraft at non-towered airports unless the airport indicates right traffic.
 */

import type {
  Vec2,
  RunwayConfig,
  PatternDimensions,
  PatternGeometry,
  Leg,
  LegName,
} from "./types";

/* ------------------------------ vector helpers ---------------------------- */

export function v(x: number, y: number): Vec2 {
  return { x, y };
}
export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}
export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}
export function scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}
export function len(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}
export function normalize(a: Vec2): Vec2 {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
}
export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}
export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Rotate a vector by `deg` degrees (CCW positive in standard math). */
export function rotate(a: Vec2, deg: number): Vec2 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
}

/** Convert a direction vector to an aviation heading (0=N, 90=E). */
export function headingOf(dir: Vec2): number {
  let h = (Math.atan2(dir.x, dir.y) * 180) / Math.PI;
  if (h < 0) h += 360;
  return h;
}

/** Unit vector for an aviation heading. */
export function dirFromHeading(hdg: number): Vec2 {
  const r = (hdg * Math.PI) / 180;
  return { x: Math.sin(r), y: Math.cos(r) };
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

/** Normalised angular difference a-b, in range (-180, 180]. */
export function angleDiff(a: number, b: number): number {
  let d = ((a - b + 540) % 360) - 180;
  if (d === -180) d = 180;
  return d;
}

/* ------------------------------ pattern builder --------------------------- */

const DEFAULT_DIMS: PatternDimensions = {
  downwindOffsetFt: 3000,
  baseTurnDistanceFt: 3000,
  entryDistanceFt: 2600,
  patternAltitudeFt: 1000,
};

const TURN_RADIUS_FT = 1100; // ~standard-rate-ish turn radius used for the guide path arcs

/**
 * Build the full pattern geometry. `trafficDirection` controls left vs right
 * (mirrors the whole pattern across the runway centerline automatically).
 */
export function buildPattern(
  runway: RunwayConfig,
  dims: PatternDimensions = DEFAULT_DIMS,
): PatternGeometry {
  const along = dirFromHeading(runway.runwayHeading); // landing / final direction
  const recip = scale(along, -1); // downwind direction
  // Left side of the landing direction = rotate along by +90°.
  const leftNormal = rotate(along, 90);
  const side =
    runway.trafficDirection === "left" ? leftNormal : scale(leftNormal, -1);
  const baseDir = scale(side, -1); // base flies from downwind toward the runway

  const runwayMid = v(0, 0);
  const threshold = add(runwayMid, scale(along, -runway.lengthFt / 2));
  const departureEnd = add(runwayMid, scale(along, runway.lengthFt / 2));

  const mergePoint = add(
    add(departureEnd, scale(side, dims.downwindOffsetFt)),
    scale(recip, 1500),
  );
  const midfieldDownwind = add(
    threshold,
    scale(side, dims.downwindOffsetFt),
  );
  const turnBasePoint = add(
    midfieldDownwind,
    scale(recip, dims.baseTurnDistanceFt),
  );
  const turnFinalPoint = add(turnBasePoint, scale(baseDir, dims.downwindOffsetFt));
  const touchdownPoint = threshold;
  const clearOfRunwayPoint = add(runwayMid, scale(along, -runway.lengthFt / 2 - 800));

  // 45° entry: approach from the pattern side, merging onto downwind.
  // Entry direction = normalize(recip - side): has a component along downwind
  // and a component inward from the pattern side. For left traffic this is NE
  // (045) merging to E (090); for right traffic SE (135) merging to E (090).
  const entryDir = normalize(sub(recip, side));
  const entryStart = sub(mergePoint, scale(entryDir, dims.entryDistanceFt));

  const entryHeadingDeg = headingOf(entryDir);
  const downwindHeadingDeg = headingOf(recip);
  const baseHeadingDeg = headingOf(baseDir);
  const finalHeadingDeg = headingOf(along);

  const alt = dims.patternAltitudeFt;

  const legs: Leg[] = [
    {
      name: "entry",
      start: entryStart,
      end: mergePoint,
      headingDeg: entryHeadingDeg,
      altitudeStartFt: alt,
      altitudeEndFt: alt,
    },
    {
      name: "downwind",
      start: mergePoint,
      end: turnBasePoint,
      headingDeg: downwindHeadingDeg,
      altitudeStartFt: alt,
      altitudeEndFt: alt,
    },
    {
      name: "base",
      start: turnBasePoint,
      end: turnFinalPoint,
      headingDeg: baseHeadingDeg,
      altitudeStartFt: alt,
      altitudeEndFt: 700,
    },
    {
      name: "final",
      start: turnFinalPoint,
      end: touchdownPoint,
      headingDeg: finalHeadingDeg,
      altitudeStartFt: 700,
      altitudeEndFt: 0,
    },
    {
      name: "rollout",
      start: touchdownPoint,
      end: clearOfRunwayPoint,
      headingDeg: finalHeadingDeg,
      altitudeStartFt: 0,
      altitudeEndFt: 0,
    },
  ];

  const radioCallPoints = [
    { pos: mergePoint, position: "entering-downwind" as const, leg: "downwind" as LegName, label: "Entering downwind" },
    { pos: midfieldDownwind, position: "midfield-downwind" as const, leg: "downwind" as LegName, label: "Midfield downwind" },
    { pos: turnBasePoint, position: "turning-base" as const, leg: "base" as LegName, label: "Turning base" },
    { pos: turnFinalPoint, position: "turning-final" as const, leg: "final" as LegName, label: "Turning final" },
    { pos: clearOfRunwayPoint, position: "clear-of-runway" as const, leg: "rollout" as LegName, label: "Clear of runway" },
  ];

  const guidePath = buildGuidePath({
    entryStart,
    mergePoint,
    turnBasePoint,
    turnFinalPoint,
    touchdownPoint,
    clearOfRunwayPoint,
    recip,
    baseDir,
    along,
    side,
    turnRadius: TURN_RADIUS_FT,
  });

  const bounds = computeBounds([
    entryStart,
    mergePoint,
    midfieldDownwind,
    turnBasePoint,
    turnFinalPoint,
    threshold,
    departureEnd,
    clearOfRunwayPoint,
  ]);

  return {
    runway,
    dims,
    along,
    recip,
    side,
    baseDir,
    runwayMid,
    threshold,
    departureEnd,
    entryStart,
    mergePoint,
    midfieldDownwind,
    turnBasePoint,
    turnFinalPoint,
    touchdownPoint,
    clearOfRunwayPoint,
    entryHeadingDeg,
    downwindHeadingDeg,
    baseHeadingDeg,
    finalHeadingDeg,
    legs,
    guidePath,
    radioCallPoints,
    bounds,
  };
}

/** Smooth ideal path: straight legs connected by arc segments at each corner. */
function buildGuidePath(opts: {
  entryStart: Vec2;
  mergePoint: Vec2;
  turnBasePoint: Vec2;
  turnFinalPoint: Vec2;
  touchdownPoint: Vec2;
  clearOfRunwayPoint: Vec2;
  recip: Vec2;
  baseDir: Vec2;
  along: Vec2;
  side: Vec2;
  turnRadius: number;
}): Vec2[] {
  const path: Vec2[] = [];
  const {
    entryStart,
    mergePoint,
    turnBasePoint,
    turnFinalPoint,
    touchdownPoint,
    clearOfRunwayPoint,
    recip,
    baseDir,
    along,
    turnRadius,
  } = opts;

  // Entry to merge (straight)
  path.push(entryStart);
  path.push(mergePoint);

  // Arc: downwind -> base (turn toward runway).
  path.push(...arcPath(turnBasePoint, recip, baseDir, turnRadius));

  // Arc: base -> final
  path.push(...arcPath(turnFinalPoint, baseDir, along, turnRadius));

  // Final straight to touchdown, then rollout
  path.push(touchdownPoint);
  path.push(clearOfRunwayPoint);

  return path;
}

/**
 * Generate arc points connecting the inbound leg (along inDir, ending at corner)
 * to the outbound leg (along outDir, starting at corner). The arc is tangent to
 * both legs, with the given radius.
 */
function arcPath(
  corner: Vec2,
  inDir: Vec2,
  outDir: Vec2,
  radius: number,
): Vec2[] {
  const pts: Vec2[] = [];
  // Tangent entry point: back from corner along inDir by radius.
  const start = sub(corner, scale(inDir, radius));
  // Tangent exit point: forward from corner along outDir by radius.
  const end = add(corner, scale(outDir, radius));
  // Handedness via 2D cross product: +1 = left/CCW, -1 = right/CW.
  const cross = inDir.x * outDir.y - inDir.y * outDir.x;
  const turnSign = cross >= 0 ? 1 : -1;
  // Turn center sits perpendicular to the inbound direction, on the inside.
  const inward = rotate(inDir, turnSign * 90);
  const center = add(start, scale(inward, radius));

  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const turnAngle = Math.acos(clamp(dot(inDir, outDir), -1, 1));
  const delta = turnSign * turnAngle; // signed sweep, short way
  const steps = 16;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const a = startAngle + delta * t;
    pts.push({
      x: center.x + radius * Math.cos(a),
      y: center.y + radius * Math.sin(a),
    });
  }
  pts.push(end);
  return pts;
}

function computeBounds(points: Vec2[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const pad = 800;
  return {
    minX: minX - pad,
    maxX: maxX + pad,
    minY: minY - pad,
    maxY: maxY + pad,
  };
}

/* --------------------------- target-altitude profile ---------------------- */

/**
 * Target altitude for a given leg + progress (0..1) along that leg.
 * Downwind = pattern altitude; base descends to ~700; final descends to 0.
 */
export function targetAltitudeForLeg(
  leg: LegName,
  progress: number,
  patternAlt: number,
): number {
  switch (leg) {
    case "entry":
      return patternAlt;
    case "downwind":
      return patternAlt;
    case "base":
      return patternAlt + (700 - patternAlt) * clamp(progress, 0, 1);
    case "final":
      return 700 * (1 - clamp(progress, 0, 1));
    case "rollout":
      return 0;
  }
}

/** Target airspeed (kt) for a leg — C172-ish pattern speeds. */
export function targetAirspeedForLeg(leg: LegName): number {
  switch (leg) {
    case "entry":
      return 95;
    case "downwind":
      return 90;
    case "base":
      return 80;
    case "final":
      return 70;
    case "rollout":
      return 0;
  }
}
