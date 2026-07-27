/**
 * Pattern Perfect — scenario definitions.
 *
 * Difficulty progression widens/narrows guide tolerance and adds traffic + wind.
 * The right-traffic option uses Cedar Lake (runway 22, right traffic per the
 * airport publication) so the whole pattern — including AI placement and turn
 * handedness — is genuinely mirrored, not just a relabelled left pattern.
 */

import type { Difficulty, RunwayConfig, Wind } from "@/lib/pattern/types";
import { AIRPORTS, speakRunway } from "@/lib/data/phraseology";

export interface ScenarioConfig {
  id: string;
  label: string;
  difficulty: Difficulty;
  airportKey: keyof typeof AIRPORTS;
  runway: RunwayConfig;
  wind: Wind;
  callsign: string;
  callsignSpoken: string;
  guideAlpha: number;
  brief: string;
}

function runwayFromAirport(key: keyof typeof AIRPORTS): RunwayConfig {
  const a = AIRPORTS[key];
  const heading = (parseInt(a.runway, 10) % 36) * 10;
  return {
    runwayHeading: heading === 0 ? 360 : heading,
    runwayNumber: a.runway,
    runwaySpoken: a.runwaySpoken ?? speakRunway(a.runway),
    lengthFt: 5000,
    trafficDirection: a.trafficDirection,
  };
}

const PLAYER_CALLSIGN = "Cessna seven-eight-alpha";

export type AirportChoice = "riverside" | "cedarlake" | "meadowfield";

export function buildScenario(
  difficulty: Difficulty,
  rightTraffic: boolean,
  airportChoice?: AirportChoice,
): ScenarioConfig {
  // Default: right-traffic toggle picks cedarlake vs riverside; explicit
  // airportChoice overrides (so Meadowfield, a left-traffic field, is reachable
  // without conflicting with the right-traffic toggle).
  const airportKey: AirportChoice =
    airportChoice ?? (rightTraffic ? "cedarlake" : "riverside");
  const runway = runwayFromAirport(airportKey);
  const airport = AIRPORTS[airportKey];

  const mod = (n: number) => ((n % 360) + 360) % 360;
  const windByDiff: Record<Difficulty, Wind> = {
    rookie: { fromHeadingDeg: mod(runway.runwayHeading - 30), speedKt: 5, gustKt: 0 },
    student: { fromHeadingDeg: mod(runway.runwayHeading - 20), speedKt: 8, gustKt: 3 },
    solo: { fromHeadingDeg: mod(runway.runwayHeading - 40), speedKt: 10, gustKt: 5 },
  };

  const guideAlpha = difficulty === "rookie" ? 0.7 : difficulty === "student" ? 0.4 : 0.12;

  const rightField = airport.trafficDirection === "right";
  const brief = rightField
    ? `${airport.name} uses RIGHT-hand traffic for runway ${airport.runwaySpoken} (per the airport publication). Every turn in the pattern is a RIGHT turn and the pattern is flown on the RIGHT side of the runway. ${airport.name} CTAF ${airport.ctaf}.`
    : `${airport.name}, runway ${airport.runwaySpoken}, standard LEFT-hand traffic. Pattern altitude ${airport.patternAltitudeFt} ft. CTAF ${airport.ctaf}. ${difficulty === "rookie" ? "Light wind, one aircraft ahead, a generous guide track." : difficulty === "student" ? "Moderate crosswind, one aircraft — tighten your spacing." : "Gusty wind, TWO aircraft (one joins mid-pattern), and the guide track is nearly gone."}`;

  const labels: Record<Difficulty, string> = {
    rookie: "Rookie",
    student: "Student",
    solo: "Solo",
  };

  return {
    id: `${difficulty}-${airportKey}-${rightTraffic ? "r" : "l"}`,
    label: `${labels[difficulty]} · ${airport.name}`,
    difficulty,
    airportKey,
    runway,
    wind: windByDiff[difficulty],
    callsign: PLAYER_CALLSIGN,
    callsignSpoken: PLAYER_CALLSIGN,
    guideAlpha,
    brief,
  };
}

export const AIRPORT_OPTIONS: { value: AirportChoice; label: string; blurb: string }[] = [
  { value: "riverside", label: "Riverside", blurb: "RWY 27, left traffic. Farmland. The default." },
  { value: "cedarlake", label: "Cedar Lake", blurb: "RWY 22, right traffic. Coastal field." },
  { value: "meadowfield", label: "Meadowfield", blurb: "RWY 36, left traffic. Mountain valley." },
];

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; blurb: string }[] = [
  { value: "rookie", label: "Rookie", blurb: "Wide tolerance, 1 aircraft, light wind. Learn the shape." },
  { value: "student", label: "Student", blurb: "Tighter tolerance, 1 aircraft, crosswind." },
  { value: "solo", label: "Solo", blurb: "Tight tolerance, 2 aircraft (one joins mid-pattern), gusty. No guide." },
];

/**
 * Practical Test — a formal, gated assessment mode.
 *
 * Fixed parameters (solo difficulty, no guide, no mid-flight pause-and-retry),
 * timed, ending in a real pass/fail with a shareable summary. Closer to a
 * checkride than a casual attempt. Available only after at least one solid
 * practice completion (score ≥ 70) so it reads as an earned formal assessment.
 */
export function buildPracticalTestScenario(): ScenarioConfig {
  const base = buildScenario("solo", false, "riverside");
  return {
    ...base,
    id: "practical-test",
    label: "Practical Test",
    brief:
      "PRACTICAL TEST — formal assessment. Solo difficulty, no guide overlay, no mid-flight pause. " +
      "Fly a complete pattern with all radio calls and safe sequencing. " +
      "Pass = score ≥ 80 with no redo. This is your checkride.",
  };
}

export const PRACTICAL_TEST_PASS_SCORE = 80;
