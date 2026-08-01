/**
 * Pattern Perfect — scoring engine.
 *
 * Scores every checkpoint individually (entry, downwind track/altitude, base
 * timing, base track/altitude, final alignment/track, each radio call, and
 * traffic sequencing) then rolls up to a 0-100 total and a grade band.
 *
 * Per the design brief, SEQUENCING/SPACING is the hardest category: it carries
 * the single largest weight and a critical spacing conflict forces a redo
 * regardless of how clean the rest of the pattern was.
 */

import type {
  FlightRecording,
  FlightResult,
  CheckpointResult,
  PatternGeometry,
  LegName,
  RadioCallRecord,
  TrailPoint,
  Difficulty,
  Vec2,
} from "./types";
import {
  dot,
  sub,
  dist,
  clamp,
  angleDiff,
} from "./geometry";
import { PATTERN_CALL_ORDER } from "@/lib/data/phraseology";
import { WARN_SEPARATION_FT, CRITICAL_SEPARATION_FT } from "./ai-traffic";

interface Tolerances {
  trackFt: number;
  altFt: number;
  timingFt: number;
  guideVisible: boolean;
}

export function tolerancesFor(d: Difficulty): Tolerances {
  switch (d) {
    case "rookie":
      return { trackFt: 750, altFt: 130, timingFt: 1300, guideVisible: true };
    case "student":
      return { trackFt: 480, altFt: 95, timingFt: 850, guideVisible: true };
    case "solo":
      return { trackFt: 320, altFt: 70, timingFt: 520, guideVisible: false };
  }
}

/* ----------------------------- helpers ----------------------------------- */

function trailForLeg(trail: TrailPoint[], leg: LegName): TrailPoint[] {
  return trail.filter((p) => p.leg === leg);
}

/**
 * Perpendicular distance from point p to the line through a->b (signed by the
 * side normal). Returns absolute distance.
 */
function perpDistance(p: Vec2, a: Vec2, b: Vec2): number {
  const ab = sub(b, a);
  const len = Math.hypot(ab.x, ab.y) || 1;
  const n = { x: -ab.y / len, y: ab.x / len };
  return Math.abs(dot(sub(p, a), n));
}

function rms(values: number[]): number {
  if (values.length === 0) return 0;
  const s = values.reduce((a, b) => a + b * b, 0);
  return Math.sqrt(s / values.length);
}

function scoreFromDeviation(dev: number, tolerance: number): number {
  // Linear falloff to 0 at 2x tolerance, clamped.
  return clamp(100 * (1 - dev / (tolerance * 2)), 0, 100);
}

/* --------------------------- main scoring -------------------------------- */

export function scoreFlight(
  geo: PatternGeometry,
  rec: FlightRecording,
  difficulty: Difficulty,
): FlightResult {
  const tol = tolerancesFor(difficulty);
  const checkpoints: CheckpointResult[] = [];

  const leg = (name: LegName) => geo.legs.find((l) => l.name === name)!;

  /* --- 1. Entry angle -------------------------------------------------- */
  {
    const entryPts = trailForLeg(rec.trail, "entry");
    let score = 100;
    let detail = "Clean 45° entry to downwind.";
    if (entryPts.length < 2) {
      score = 40;
      detail = "Entry segment too short to evaluate — did you skip the 45° join?";
    } else {
      // Average heading during entry vs ideal entry heading.
      const heads = entryPts.map((_, i) => {
        if (i === 0) return geo.entryHeadingDeg;
        const a = entryPts[i - 1];
        const b = entryPts[i];
        const dh = (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
        return (dh + 360) % 360;
      });
      const avgHead = heads.reduce((a, b) => a + b, 0) / heads.length;
      const dev = Math.abs(angleDiff(avgHead, geo.entryHeadingDeg));
      score = scoreFromDeviation(dev, 18);
      detail = `Entry track was ${Math.round(dev)}° off the ideal 45° (${geo.entryHeadingDeg.toFixed(0).padStart(3, "0")}°).`;
    }
    checkpoints.push({
      id: "entry",
      label: "45° entry to downwind",
      leg: "entry",
      category: "entry",
      score,
      maxScore: 8,
      passed: score >= 55,
      detail,
    });
  }

  /* --- 2. Downwind track + altitude ----------------------------------- */
  {
    const pts = trailForLeg(rec.trail, "downwind");
    const l = leg("downwind");
    const trackDevs = pts.map((p) => perpDistance(p, l.start, l.end));
    const rmsTrack = rms(trackDevs);
    const trackScore = scoreFromDeviation(rmsTrack, tol.trackFt);

    const altSamples = rec.altitudeSamples.filter((s) => s.t >= pts[0]?.t && s.t <= pts[pts.length - 1]?.t);
    const altDevs = altSamples.map((s) => Math.abs(s.alt - s.target));
    const rmsAlt = rms(altDevs);
    const altScore = scoreFromDeviation(rmsAlt, tol.altFt);

    const score = trackScore * 0.55 + altScore * 0.45;
    checkpoints.push(
      {
        id: "downwind-track",
        label: "Downwind ground track",
        leg: "downwind",
        category: "track",
        score: trackScore,
        maxScore: 8,
        passed: trackScore >= 55,
        detail: `RMS lateral deviation ${Math.round(rmsTrack)} ft from the downwind centerline (tolerance ±${tol.trackFt} ft).`,
      },
      {
        id: "downwind-alt",
        label: "Downwind altitude discipline",
        leg: "downwind",
        category: "altitude",
        score: altScore,
        maxScore: 6,
        passed: altScore >= 55,
        detail: `Pattern altitude ${geo.dims.patternAltitudeFt} ft AGL; RMS deviation ${Math.round(rmsAlt)} ft.`,
      },
    );
    void score;
  }

  /* --- 3. Base turn timing ------------------------------------------- */
  {
    const trans = rec.legTransitions.find((t) => t.leg === "base");
    let score = 100;
    let detail = "Turned base right on the 45° point.";
    if (!trans) {
      score = 0;
      detail = "Never established a base leg.";
    } else {
      // How far past (or before) the ideal turnBasePoint along recip the player was.
      const alongRecip = dot(sub(trans.pos, geo.turnBasePoint), geo.recip);
      const dev = Math.abs(alongRecip);
      score = scoreFromDeviation(dev, tol.timingFt);
      const dir = alongRecip > 0 ? "extended" : "turned early";
      detail = `${dir.charAt(0).toUpperCase() + dir.slice(1)} downwind by ${Math.round(dev)} ft relative to the ideal base turn (45° off the threshold).`;
    }
    checkpoints.push({
      id: "base-timing",
      label: "Base turn timing",
      leg: "base",
      category: "turn-timing",
      score,
      maxScore: 10,
      passed: score >= 55,
      detail,
    });
  }

  /* --- 4. Base track + altitude -------------------------------------- */
  {
    const pts = trailForLeg(rec.trail, "base");
    const l = leg("base");
    const trackDevs = pts.map((p) => perpDistance(p, l.start, l.end));
    const rmsTrack = rms(trackDevs);
    const trackScore = pts.length ? scoreFromDeviation(rmsTrack, tol.trackFt) : 0;

    const altSamples = rec.altitudeSamples.filter((s) => pts.length && s.t >= pts[0].t && s.t <= pts[pts.length - 1].t);
    const altDevs = altSamples.map((s) => Math.abs(s.alt - s.target));
    const rmsAlt = rms(altDevs);
    const altScore = altSamples.length ? scoreFromDeviation(rmsAlt, tol.altFt + 30) : 0;

    checkpoints.push(
      {
        id: "base-track",
        label: "Base ground track",
        leg: "base",
        category: "track",
        score: trackScore,
        maxScore: 6,
        passed: trackScore >= 50,
        detail: pts.length ? `RMS deviation ${Math.round(rmsTrack)} ft from the base leg.` : "No base leg flown.",
      },
      {
        id: "base-alt",
        label: "Base altitude (descent)",
        leg: "base",
        category: "altitude",
        score: altScore,
        maxScore: 4,
        passed: altScore >= 50,
        detail: altSamples.length ? `Descent RMS deviation ${Math.round(rmsAlt)} ft from the target profile.` : "No descent sampled on base.",
      },
    );
  }

  /* --- 5. Final alignment + track ------------------------------------ */
  {
    const pts = trailForLeg(rec.trail, "final");
    const l = leg("final");
    const trackDevs = pts.map((p) => perpDistance(p, l.start, l.end));
    const rmsTrack = rms(trackDevs);
    const trackScore = pts.length ? scoreFromDeviation(rmsTrack, tol.trackFt * 0.7) : 0;

    // Alignment: average heading vs final heading.
    let alignScore = 0;
    if (pts.length >= 2) {
      const heads: number[] = [];
      for (let i = 1; i < pts.length; i++) {
        const dh = (Math.atan2(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) * 180) / Math.PI;
        heads.push((dh + 360) % 360);
      }
      const avg = heads.reduce((a, b) => a + b, 0) / heads.length;
      alignScore = scoreFromDeviation(Math.abs(angleDiff(avg, geo.finalHeadingDeg)), 8);
    }

    checkpoints.push(
      {
        id: "final-align",
        label: "Final alignment",
        leg: "final",
        category: "track",
        score: alignScore,
        maxScore: 6,
        passed: alignScore >= 55,
        detail: pts.length ? `Average heading ${Math.round(rmsTrack)} vs runway ${geo.runway.runwayNumber} (${geo.finalHeadingDeg.toFixed(0).padStart(3, "0")}°).` : "No final leg flown.",
      },
      {
        id: "final-track",
        label: "Final ground track (centerline)",
        leg: "final",
        category: "track",
        score: trackScore,
        maxScore: 6,
        passed: trackScore >= 55,
        detail: pts.length ? `RMS deviation ${Math.round(rmsTrack)} ft from the extended centerline.` : "No final leg flown.",
      },
    );
  }

  /* --- 6. Radio calls ------------------------------------------------ */
  {
    const perCallWeight = 26 / PATTERN_CALL_ORDER.length;
    const callsByIdx: { position: (typeof PATTERN_CALL_ORDER)[number]; rec: RadioCallRecord | undefined }[] =
      PATTERN_CALL_ORDER.map((p) => ({ position: p, rec: rec.radioCalls.find((r) => r.position === p) }));

    for (const { position, rec: r } of callsByIdx) {
      let score = 0;
      let detail = "";
      if (!r) {
        score = 0;
        detail = `No call made at "${position}". A call is expected here.`;
      } else if (r.banned) {
        score = 0;
        detail = `You used the banned phrase "any traffic in the area, please advise" — never a correct call.`;
      } else if (r.correct) {
        score = 100;
        detail = `Correct call at ${position}.`;
      } else {
        score = 35;
        detail = `Incorrect call at ${position} — see the per-call explanation.`;
      }
      checkpoints.push({
        id: `radio-${position}`,
        label: `Radio: ${position.replace(/-/g, " ")}`,
        leg: "downwind",
        category: "radio",
        score,
        maxScore: perCallWeight,
        passed: score >= 60,
        detail,
      });
    }
  }

  /* --- 7. Sequencing / spacing -------------------------------------- */
  {
    let score = 100;
    const warnings = rec.conflicts.filter((c) => c.severity === "warn").length;
    const criticals = rec.conflicts.filter((c) => c.severity === "critical").length;
    score -= warnings * 22;
    score -= criticals * 60;
    // Reward good minimum spacing.
    if (rec.minSeparationFt > WARN_SEPARATION_FT * 1.6) score = Math.min(100, score + 8);
    score = clamp(score, 0, 100);

    let detail: string;
    if (criticals > 0) {
      detail = `${criticals} near-miss${criticals > 1 ? "es" : ""} with traffic. A real spacing conflict — the riskiest thing in the pattern.`;
    } else if (warnings > 0) {
      detail = `${warnings} unsafe-spacing warning${warnings > 1 ? "s" : ""}. Minimum separation ${Math.round(rec.minSeparationFt)} ft.`;
    } else {
      detail = `Safely sequenced. Minimum separation ${Math.round(rec.minSeparationFt)} ft from traffic.`;
    }

    checkpoints.push({
      id: "sequencing",
      label: "Traffic sequencing & spacing",
      leg: "downwind",
      category: "sequencing",
      score,
      maxScore: 20,
      passed: score >= 55 && criticals === 0,
      detail,
    });
  }

  /* --- roll up ------------------------------------------------------- */
  const totalScore = Math.round(
    checkpoints.reduce((sum, c) => sum + (c.score / 100) * c.maxScore, 0),
  );

  const nearMiss = rec.conflicts.some((c) => c.severity === "critical");
  // A go-around is "recovered" if the player made a correct going-around call
  // after a critical conflict. This distinguishes "recognized the conflict and
  // executed the correct recovery" from "never noticed" — the redo consequence
  // is softened only for a genuine recovery, never for an un-recovered conflict.
  const goAroundCall = rec.radioCalls.find((r) => r.position === "going-around");
  const goAroundRecovered = !!goAroundCall && goAroundCall.correct && !goAroundCall.banned;
  const allRadioCorrect = rec.radioCalls.length === PATTERN_CALL_ORDER.length && rec.radioCalls.every((r) => r.correct && !r.banned);
  const noWarnings = rec.conflicts.length === 0;

  let grade: FlightResult["grade"];
  let gradeLabel: string;
  // A critical conflict that was NOT recovered is always a redo, regardless of
  // other score. A recovered go-around still reflects the conflict seriously
  // (the sequencing checkpoint already penalizes it) but is not an auto-redo.
  if (!rec.completedPattern || (nearMiss && !goAroundRecovered)) {
    grade = "redo";
    gradeLabel = "Redo required";
  } else if (totalScore >= 88 && allRadioCorrect && noWarnings) {
    grade = "textbook";
    gradeLabel = "Textbook pattern!";
  } else if (totalScore >= 70) {
    grade = "solid";
    gradeLabel = "Solid pattern";
  } else {
    grade = "needs-work";
    gradeLabel = "Needs work";
  }

  const why = buildWhy(grade, checkpoints, nearMiss, rec, goAroundRecovered);

  return {
    totalScore,
    grade,
    gradeLabel,
    checkpoints,
    radioCalls: rec.radioCalls,
    conflicts: rec.conflicts.length,
    nearMiss,
    goAroundRecovered,
    completedPattern: rec.completedPattern,
    flightTimeSec: rec.flightTimeSec,
    trail: rec.trail,
    why,
  };
}

function buildWhy(
  grade: FlightResult["grade"],
  checkpoints: CheckpointResult[],
  nearMiss: boolean,
  rec: FlightRecording,
  goAroundRecovered: boolean,
): string {
  if (grade === "redo") {
    if (nearMiss && !goAroundRecovered) {
      return `Redo required: a critical spacing conflict with traffic (${Math.round(rec.minSeparationFt)} ft minimum) and the go-around wasn't executed. Nearly half of GA accidents happen in the pattern — sequencing is the whole point of this trainer.`;
    }
    if (!rec.completedPattern) {
      return "Redo required: the pattern wasn't completed to a landing. Fly entry → downwind → base → final → clear of runway.";
    }
    return "Redo required: an unsafe event forced a redo.";
  }

  const weakest = [...checkpoints].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];
  const failedRadios = checkpoints.filter((c) => c.category === "radio" && !c.passed).length;

  if (grade === "textbook") {
    return "Textbook: clean rectangle, every radio call correct, safely sequenced around traffic. That's a pattern you can be proud of.";
  }
  if (grade === "solid") {
    const parts: string[] = [];
    if (weakest) parts.push(`weakest: ${weakest.label.toLowerCase()} (${Math.round(weakest.score)}%)`);
    if (failedRadios) parts.push(`${failedRadios} radio call(s) off`);
    if (goAroundRecovered) parts.push("go-around executed correctly after a conflict");
    return `Solid pattern — mostly correct with minor deviations. ${parts.join("; ")}.`;
  }
  // needs-work
  const parts: string[] = [];
  if (weakest) parts.push(`biggest issue: ${weakest.label.toLowerCase()} (${Math.round(weakest.score)}%)`);
  if (failedRadios) parts.push(`${failedRadios} radio call(s) wrong or missing`);
  if (rec.conflicts.length) parts.push(`${rec.conflicts.length} spacing warning(s)`);
  if (goAroundRecovered) parts.push("recovered via go-around");
  return `Needs work. ${parts.join("; ")}. Fly the rectangle tighter, call every position, and watch the other aircraft.`;
}

/** Convenience: distance below which a near-miss is "critical". */
export const NEAR_MISS_FT = CRITICAL_SEPARATION_FT;
export const UNSAFE_FT = WARN_SEPARATION_FT;

/** Distance from a point to the nearest guide-path vertex (used for "off track"). */
export function nearestGuideDistance(geo: PatternGeometry, p: Vec2): number {
  let min = Infinity;
  for (const gp of geo.guidePath) {
    const d = dist(gp, p);
    if (d < min) min = d;
  }
  return min;
}
