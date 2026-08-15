/**
 * Pattern Perfect — shared types.
 *
 * World coordinate system (feet):
 *   x = East (+) / West (-)
 *   y = North (+) / South (-)
 *   origin = runway midpoint
 * Headings are true-style degrees: 0 = North, 90 = East, 180 = South, 270 = West
 * (matching real aviation headings and runway numbers).
 */

import type { CallPosition, TrafficDirection } from "@/lib/data/phraseology";

export type { TrafficDirection, CallPosition };

export interface Vec2 {
  x: number;
  y: number;
}

export interface RunwayConfig {
  runwayHeading: number; // landing heading, e.g. 270 for runway 27
  runwayNumber: string; // "27"
  runwaySpoken: string; // "two-seven"
  runwayReciprocal: string; // "09" for runway 27
  lengthFt: number; // 5000
  trafficDirection: TrafficDirection;
}

export interface PatternDimensions {
  downwindOffsetFt: number; // distance from runway centerline to downwind leg
  baseTurnDistanceFt: number; // how far past threshold before turning base (≈ downwindOffset)
  entryDistanceFt: number; // length of the 45° entry segment
  patternAltitudeFt: number; // 1000 AGL standard (real pattern altitude varies by airport)
}

export type LegName = "entry" | "downwind" | "base" | "final" | "rollout";

export interface Leg {
  name: LegName;
  start: Vec2;
  end: Vec2;
  headingDeg: number;
  altitudeStartFt: number;
  altitudeEndFt: number;
}

export interface RadioCallPoint {
  pos: Vec2;
  position: CallPosition;
  leg: LegName;
  label: string;
}

export interface PatternGeometry {
  runway: RunwayConfig;
  dims: PatternDimensions;

  // Unit vectors
  along: Vec2; // landing / final direction
  recip: Vec2; // downwind direction (opposite of landing)
  side: Vec2; // pattern-side normal (left or right of landing direction)
  baseDir: Vec2; // base direction (toward runway from pattern side)

  // Key points
  runwayMid: Vec2;
  threshold: Vec2; // approach end (crossed on short final)
  departureEnd: Vec2;
  entryStart: Vec2;
  mergePoint: Vec2; // where 45° entry joins downwind
  midfieldDownwind: Vec2; // abeam the threshold
  turnBasePoint: Vec2;
  turnFinalPoint: Vec2;
  touchdownPoint: Vec2;
  clearOfRunwayPoint: Vec2;

  // Headings (degrees)
  entryHeadingDeg: number;
  downwindHeadingDeg: number;
  baseHeadingDeg: number;
  finalHeadingDeg: number;

  legs: Leg[];
  guidePath: Vec2[]; // ideal ground track with rounded turns (for guide overlay + scoring)
  radioCallPoints: RadioCallPoint[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface Wind {
  fromHeadingDeg: number; // direction wind is FROM
  speedKt: number;
  gustKt: number; // additional gust amplitude
}

export interface AircraftState {
  pos: Vec2;
  headingDeg: number;
  bankDeg: number; // + = right, - = left
  altitudeFt: number;
  airspeedKt: number;
  verticalSpeedFpm: number;
  onGround: boolean;
}

export interface TrailPoint {
  x: number;
  y: number;
  t: number; // seconds since flight start
  leg: LegName;
}

export type InputState = {
  left: boolean;
  right: boolean;
};

export type Difficulty = "rookie" | "student" | "solo";

export interface AIActor {
  id: string;
  callsign: string;
  color: string;
  state: AircraftState;
  /** Pattern progress: which leg, parameter 0..1 along it, plus an offset for imperfection. */
  leg: LegName;
  legProgress: number;
  /** Slightly imperfect tracking so the AI is realistic and beatable. */
  lateralOffsetFt: number;
  altitudeOffsetFt: number;
  spawnDelaySec: number; // for aircraft that join mid-pattern
  active: boolean;
  trail: TrailPoint[];
  /** Set of CallPositions this AI has already transmitted (so it calls each once). */
  callsMade: Set<CallPosition>;
  /** Optional: a deliberately-wrong call to seed for the "spot the error" drill. */
  badCallSeed?: CallPosition | null;
}

export interface AIRadioCall {
  actorId: string;
  callsign: string;
  position: CallPosition;
  text: string;
  correct: boolean;
  ts: number;
  /** Present (and false) when this call was seeded with a deliberate phraseology error. */
  hasError?: boolean;
}

export interface CheckpointResult {
  id: string;
  label: string;
  leg: LegName;
  category: "entry" | "track" | "altitude" | "turn-timing" | "radio" | "sequencing";
  score: number; // 0-100
  maxScore: number;
  passed: boolean;
  detail: string;
}

export interface RadioCallRecord {
  position: CallPosition;
  correct: boolean;
  banned: boolean; // did they pick the banned phrase?
  chosenText: string;
  ts: number;
}

export interface FlightResult {
  totalScore: number; // 0-100
  grade: "textbook" | "solid" | "needs-work" | "redo";
  gradeLabel: string;
  checkpoints: CheckpointResult[];
  radioCalls: RadioCallRecord[];
  conflicts: number; // unsafe-spacing events
  nearMiss: boolean; // critical spacing conflict
  goAroundRecovered: boolean; // player executed a correct go-around after a critical conflict
  completedPattern: boolean;
  flightTimeSec: number;
  trail: TrailPoint[];
  why: string; // human summary of why this grade
}

export interface FlightRecording {
  trail: TrailPoint[];
  altitudeSamples: { t: number; alt: number; target: number }[];
  legTransitions: { leg: LegName; t: number; pos: Vec2; headingDeg: number; altitudeFt: number }[];
  radioCalls: RadioCallRecord[];
  conflicts: { t: number; sepFt: number; severity: "warn" | "critical" }[];
  minSeparationFt: number;
  wind: Wind;
  flightTimeSec: number;
  completedPattern: boolean;
}
