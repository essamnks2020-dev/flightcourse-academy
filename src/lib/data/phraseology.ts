/**
 * Shared phraseology dataset for FlightCourse.
 *
 * This is the SINGLE source of truth for non-towered-airport radio calls and is
 * reused by:
 *   - the Radio Call Builder mini-game (assembly drills), and
 *   - Pattern Perfect (timed in-pattern radio checkpoints).
 *
 * Accuracy rules baked into the data (per FAA AC 90-66C / standard phraseology):
 *   1. State the airport name at the START and the END of every transmission.
 *   2. Use the ACTUAL runway number spoken as digits ("runway two-seven"),
 *      never "the active runway" or "the runway".
 *   3. Include callsign, position, altitude (where appropriate) and intent.
 *   4. Non-towered airports use "<Airport> traffic" — never "<Airport> Tower".
 *   5. The phrase "any traffic in the area, please advise" is NOT a recognized
 *      call. It is included ONLY as a wrong-answer distractor and is flagged
 *      `banned: true` so it can never be marked correct.
 */

export type CallPosition =
  | "entering-downwind"
  | "midfield-downwind"
  | "turning-base"
  | "turning-final"
  | "going-around"
  | "clear-of-runway";

export type TrafficDirection = "left" | "right";

export interface AirportInfo {
  name: string; // e.g. "Riverside"
  ctaf: string; // e.g. "122.8"
  runway: string; // numeric string e.g. "27"
  runwayReciprocal: string; // e.g. "09"
  runwaySpoken: string; // e.g. "two-seven"
  patternAltitudeFt: number; // 1000 AGL standard (varies by airport in reality)
  trafficDirection: TrafficDirection;
}

export interface CallOption {
  id: string;
  text: string;
  correct: boolean;
  explanation: string;
  banned?: boolean;
}

export interface RadioCallScenario {
  position: CallPosition;
  airport: AirportInfo;
  callsign: string; // spoken, e.g. "Cessna seven-eight-alpha"
  callsignShort: string; // e.g. "eight-alpha"
  altitudeFt: number;
  intent: string; // e.g. "for full-stop landing"
  prompt: string; // human description of when this call is made
  options: CallOption[];
}

/* ----------------------------- Airport catalog ---------------------------- */

export const AIRPORTS: Record<string, AirportInfo> = {
  riverside: {
    name: "Riverside",
    ctaf: "122.8",
    runway: "27",
    runwayReciprocal: "09",
    runwaySpoken: "two-seven",
    patternAltitudeFt: 1000,
    trafficDirection: "left",
  },
  meadowfield: {
    name: "Meadowfield",
    ctaf: "123.0",
    runway: "36",
    runwayReciprocal: "18",
    runwaySpoken: "three-six",
    patternAltitudeFt: 1000,
    trafficDirection: "left",
  },
  cedarlake: {
    // A right-traffic airport example (runway 22 right traffic per publication)
    name: "Cedar Lake",
    ctaf: "122.7",
    runway: "22",
    runwayReciprocal: "04",
    runwaySpoken: "two-two",
    patternAltitudeFt: 1000,
    trafficDirection: "right",
  },
};

/* ------------------------------ Spoken numbers ---------------------------- */

const DIGITS: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
};

/** "27" -> "two-seven". */
export function speakRunway(num: string): string {
  return num
    .split("")
    .map((d) => DIGITS[d] ?? d)
    .join("-");
}

/** "1000" -> "one thousand". Good enough for pattern altitudes. */
export function speakAltitude(ft: number): string {
  if (ft % 1000 === 0) {
    const thousands = ft / 1000;
    const words: string[] = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ];
    return `${words[thousands] ?? String(thousands)} thousand`;
  }
  return `${ft}`;
}

/* --------------------------- Position descriptions ------------------------ */

export const POSITION_LABELS: Record<CallPosition, string> = {
  "entering-downwind": "entering downwind",
  "midfield-downwind": "midfield downwind",
  "turning-base": "turning base",
  "turning-final": "turning final",
  "going-around": "going around",
  "clear-of-runway": "clear of the runway",
};

export const POSITION_PROMPTS: Record<CallPosition, string> = {
  "entering-downwind":
    "You have joined the 45° entry and are merging onto downwind. Make the call.",
  "midfield-downwind":
    "You are abeam the runway numbers, midfield downwind. Make the call.",
  "turning-base":
    "The threshold is about 45° behind your wing. You are turning base. Make the call.",
  "turning-final":
    "You are rolling out on final, aligned with the runway. Make the call.",
  "going-around":
    "A spacing conflict has developed on short final — you must go around. Announce it.",
  "clear-of-runway":
    "You have landed and taxied clear of the runway. Make the call.",
};

/* --------------------------- Correct-call builder ------------------------- */

/**
 * Assemble the canonical correct transmission for a position.
 * Always: "<Airport> traffic, <callsign>, <position> runway <spoken>,
 *         [altitude], [intent], <Airport> traffic."
 */
export function buildCorrectCall(
  position: CallPosition,
  airport: AirportInfo,
  callsign: string,
  altitudeFt: number,
  intent: string,
): string {
  const dir = airport.trafficDirection; // "left" | "right"
  const rw = airport.runwaySpoken;
  const alt = speakAltitude(altitudeFt);
  const name = airport.name;

  switch (position) {
    case "entering-downwind":
      return `${name} traffic, ${callsign}, entering ${dir} downwind runway ${rw}, ${intent}, ${name} traffic.`;
    case "midfield-downwind":
      return `${name} traffic, ${callsign}, midfield ${dir} downwind runway ${rw}, ${alt}, ${intent}, ${name} traffic.`;
    case "turning-base":
      return `${name} traffic, ${callsign}, turning base runway ${rw}, ${name} traffic.`;
    case "turning-final":
      return `${name} traffic, ${callsign}, turning final runway ${rw}, ${intent}, ${name} traffic.`;
    case "going-around":
      // Standard go-around call: announce going around + the runway, bookended by airport name.
      // Intent is omitted here — "going around" IS the intent.
      return `${name} traffic, ${callsign}, going around runway ${rw}, ${name} traffic.`;
    case "clear-of-runway":
      return `${name} traffic, ${callsign}, clear of runway ${rw}, ${name} traffic.`;
  }
}

/* --------------------------- Distractor generators ------------------------ */

interface DistractorInput {
  position: CallPosition;
  airport: AirportInfo;
  callsign: string;
  altitudeFt: number;
  intent: string;
}

type DistractorFn = (i: DistractorInput) => { text: string; explanation: string };

const oppositeDir = (d: TrafficDirection): TrafficDirection =>
  d === "left" ? "right" : "left";

const wrongPositionFor: Record<CallPosition, CallPosition> = {
  "entering-downwind": "midfield-downwind",
  "midfield-downwind": "entering-downwind",
  "turning-base": "turning-final",
  "turning-final": "turning-base",
  "going-around": "turning-final",
  "clear-of-runway": "midfield-downwind",
};

const distractors: DistractorFn[] = [
  // Missing the closing airport name (rule 1).
  (i) => {
    const correct = buildCorrectCall(
      i.position,
      i.airport,
      i.callsign,
      i.altitudeFt,
      i.intent,
    );
    const stripped = correct.replace(/, [^,]+ traffic\.$/, ".");
    return {
      text: stripped,
      explanation:
        "Every non-towered transmission must state the airport name at the START and the END so everyone on frequency knows who you're talking to and that the transmission is complete.",
    };
  },
  // "the active runway" instead of the actual number (rule 2).
  (i) => {
    const correct = buildCorrectCall(
      i.position,
      i.airport,
      i.callsign,
      i.altitudeFt,
      i.intent,
    );
    const text = correct.replace(
      `runway ${i.airport.runwaySpoken}`,
      "the active runway",
    );
    return {
      text,
      explanation:
        `Say the actual runway number ("runway ${i.airport.runwaySpoken}"). "The active runway" is ambiguous — there may be aircraft on different runways.`,
    };
  },
  // Non-towered airport addressed as Tower (rule 4).
  (i) => {
    const correct = buildCorrectCall(
      i.position,
      i.airport,
      i.callsign,
      i.altitudeFt,
      i.intent,
    );
    return {
      text: correct.replace(
        `${i.airport.name} traffic,`,
        `${i.airport.name} Tower,`,
      ),
      explanation: `${i.airport.name} is non-towered. Address "${i.airport.name} traffic" on the CTAF, not "Tower" — there is no controller.`,
    };
  },
  // Wrong traffic direction (left vs right).
  (i) => {
    const correct = buildCorrectCall(
      i.position,
      i.airport,
      i.callsign,
      i.altitudeFt,
      i.intent,
    );
    if (!correct.includes(i.airport.trafficDirection)) {
      const wrong = wrongPositionFor[i.position];
      const text = buildCorrectCall(wrong, i.airport, i.callsign, i.altitudeFt, i.intent);
      return {
        text,
        explanation: `That's the call for "${POSITION_LABELS[wrong]}", not "${POSITION_LABELS[i.position]}". Call the position you are actually at.`,
      };
    }
    const flipped = oppositeDir(i.airport.trafficDirection);
    const text = correct.replace(
      `${i.airport.trafficDirection} downwind`,
      `${flipped} downwind`,
    );
    return {
      text,
      explanation: `${i.airport.name} uses ${i.airport.trafficDirection}-hand traffic for runway ${i.airport.runwaySpoken}. Calling the wrong direction sends other pilots looking on the wrong side of the runway.`,
    };
  },
  // Wrong position label entirely.
  (i) => {
    const wrong = wrongPositionFor[i.position];
    const text = buildCorrectCall(wrong, i.airport, i.callsign, i.altitudeFt, i.intent);
    return {
      text,
      explanation: `That's the "${POSITION_LABELS[wrong]}" call. You are ${POSITION_LABELS[i.position]} — the call must match where you actually are.`,
    };
  },
];

/** The banned phrase — a legitimate *wrong* answer (real pilots still say it by habit). */
export const BANNED_PHRASE = "any traffic in the area, please advise";

/* ------------------------------ Scenario factory -------------------------- */

/**
 * Build a full multiple-choice scenario for a position. Always returns exactly
 * one correct option plus a curated set of distractors, INCLUDING the banned
 * "any traffic in the area, please advise" phrase as a wrong answer.
 *
 * Options are shuffled by the caller (UI) to avoid positional bias.
 */
export function buildRadioCallScenario(
  position: CallPosition,
  airportKey: keyof typeof AIRPORTS | AirportInfo,
  callsign: string,
  altitudeFt?: number,
  intent = "for full-stop landing",
): RadioCallScenario {
  const airport: AirportInfo =
    typeof airportKey === "string" ? AIRPORTS[airportKey] : airportKey;
  const alt = altitudeFt ?? airport.patternAltitudeFt;

  const correctText = buildCorrectCall(position, airport, callsign, alt, intent);

  const options: CallOption[] = [];

  options.push({
    id: "correct",
    text: correctText,
    correct: true,
    explanation: `Textbook. Correct callsign, position ("${POSITION_LABELS[position]}"), actual runway ("runway ${airport.runwaySpoken}"), ${position === "midfield-downwind" ? "altitude, " : ""}and intent — bookended with "${airport.name} traffic."`,
  });

  // Add up to 3 phraseology distractors (deduped).
  const seen = new Set<string>([correctText]);
  for (const fn of distractors) {
    if (options.length >= 4) break;
    const { text, explanation } = fn({ position, airport, callsign, altitudeFt: alt, intent });
    if (seen.has(text)) continue;
    seen.add(text);
    options.push({ id: `distractor-${options.length}`, text, correct: false, explanation });
  }

  // Always include the banned phrase as a final distractor if room (5 options total is fine).
  if (options.length < 5) {
    options.push({
      id: "banned",
      text: `${airport.name} traffic, ${callsign}, ${POSITION_LABELS[position]} runway ${airport.runwaySpoken}, ${BANNED_PHRASE}, ${airport.name} traffic.`,
      correct: false,
      banned: true,
      explanation:
        '"any traffic in the area, please advise" is not a recognized call. The AIM is explicit: pilots should self-announce and listen — asking others to "advise" clogs the frequency and signals you have not been monitoring traffic. Never use it.',
    });
  }

  return {
    position,
    airport,
    callsign,
    callsignShort: callsign.split(" ").slice(-1)[0],
    altitudeFt: alt,
    intent,
    prompt: POSITION_PROMPTS[position],
    options,
  };
}

/* The set of positions that require a radio call during a pattern flight. */
export const PATTERN_CALL_ORDER: CallPosition[] = [
  "entering-downwind",
  "midfield-downwind",
  "turning-base",
  "turning-final",
  "clear-of-runway",
];
