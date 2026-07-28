/**
 * Ground-school reference content for Pattern Perfect.
 *
 * Cites real FAA sources with section numbers (AIM 4-1-9 for non-towered
 * procedures, AC 90-66C for pattern operations). Precision here is a
 * credibility signal as much as a learning one.
 *
 * Every "why" shown in the results screen can point back to a specific entry
 * here, so a wrong answer is a link into an explanation, not a dead end.
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface ProcedureWhy {
  topic: string;
  why: string;
  source: string; // e.g. "AC 90-66C §9.2"
}

export interface LegInfo {
  leg: string;
  description: string;
  altitude: string;
  call: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "CTAF",
    definition:
      "Common Traffic Advisory Frequency — the radio frequency used at non-towered airports for pilots to self-announce position and intentions. Riverside uses 122.8.",
  },
  {
    term: "AGL",
    definition:
      "Above Ground Level — altitude relative to the terrain directly below, not sea level. Pattern altitude is typically 1,000 ft AGL for light aircraft.",
  },
  {
    term: "Crosswind (leg)",
    definition:
      "The first leg after takeoff, perpendicular to the runway. Not a separate call in the standard pattern entry flow (the 45° entry replaces it for arriving aircraft).",
  },
  {
    term: "Downwind",
    definition:
      "The leg flown parallel to the runway in the opposite direction of landing. The longest leg; where you complete pre-landing checks and announce position.",
  },
  {
    term: "Base",
    definition:
      "The leg flown perpendicular to the runway, between downwind and final. You begin the descent here and announce the turn.",
  },
  {
    term: "Final",
    definition:
      "The leg aligned with the runway in the direction of landing. You announce the turn onto final and complete the landing checklist.",
  },
  {
    term: "Abeam",
    definition:
      "Directly alongside — 'abeam the numbers' means your wing is perpendicular to the runway threshold. The midfield-downwind call is made roughly here.",
  },
  {
    term: "Clear of the runway",
    definition:
      "You have crossed the runway holding position markings and are fully clear of the active surface. The last required call of the pattern.",
  },
  {
    term: "45° entry",
    definition:
      "The standard way to join the downwind leg: approach the pattern at a 45° angle, merging onto downwind at pattern altitude. A convention, not a legal requirement.",
  },
  {
    term: "Go-around",
    definition:
      "Abandoning the approach and climbing back to pattern altitude for another attempt. Announced on CTAF so other traffic knows you're not landing.",
  },
];

export const PROCEDURE_WHY: ProcedureWhy[] = [
  {
    topic: "Why the 45° entry to downwind?",
    why: "It lets you observe existing traffic before merging, gives you time to match pattern altitude, and presents a predictable merge angle. Other pilots can see you arriving rather than having you appear on downwind with no warning.",
    source: "AC 90-66C §9.2 (recommended practice)",
  },
  {
    topic: "Why 1,000 ft AGL pattern altitude?",
    why: "It's high enough to reach the runway if the engine quits on downwind/base, but low enough to keep the pattern compact and noise footprint reasonable. It also standardizes where other pilots should look for you.",
    source: "AC 90-66C §10.2",
  },
  {
    topic: "Why say the airport name at the start AND end?",
    why: "Non-towered frequencies are shared. The opening name tells everyone which airport you're at; the closing name confirms the transmission is complete and belongs to that airport — preventing confusion when multiple fields share a CTAF.",
    source: "AIM 4-1-9(g)",
  },
  {
    topic: "Why the actual runway number, not 'the active'?",
    why: "There may be aircraft on different runways at the same field. 'The active runway' is ambiguous and can send a pilot looking for traffic on the wrong runway. The number is unambiguous.",
    source: "AIM 4-1-9(g)",
  },
  {
    topic: "Why is 'any traffic in the area, please advise' not a real call?",
    why: "The AIM explicitly says pilots should self-announce and monitor the frequency — asking others to 'advise' clogs the frequency and signals you have not been listening. It's a habit from pilots who didn't monitor before transmitting.",
    source: "AIM 4-1-9(g) (note)",
  },
  {
    topic: "Why left-hand traffic by default?",
    why: "Left traffic keeps the pilot on the left side of the cockpit, where the left seat is, giving a clearer view of the runway in the left traffic pattern. Right traffic is used only where terrain, noise, or the airport publication requires it.",
    source: "AC 90-66C §10.1",
  },
  {
    topic: "Why is sequencing the hardest part?",
    why: "Nearly half of all general aviation accidents happen in the traffic pattern. The other aircraft isn't on a fixed schedule — you must build a mental picture from radio calls and sight, then decide whether to extend, slow, or go around. There is no controller to separate you.",
    source: "AC 90-66C §9; NTSB pattern-accident data",
  },
  {
    topic: "Why go around instead of squeezing it in?",
    why: "A stabilized approach requires stable speed, stable descent rate, and a clear runway. If spacing collapses, continuing to chase a landing is how runway overruns and collisions happen. A go-around is a normal, expected recovery — not a failure.",
    source: "AIM 4-1-9; AC 90-66C §10.4",
  },
];

export const LEG_REFERENCE: LegInfo[] = [
  { leg: "Entry (45°)", description: "Approach downwind at 45°, pattern altitude, scanning for traffic.", altitude: "1,000 ft AGL", call: "entering downwind" },
  { leg: "Downwind", description: "Parallel to runway, opposite landing direction. Pre-landing checks.", altitude: "1,000 ft AGL", call: "midfield downwind" },
  { leg: "Base", description: "Perpendicular to runway. Begin descent, configure for landing.", altitude: "1,000 → ~700 ft", call: "turning base" },
  { leg: "Final", description: "Aligned with runway. Stabilize approach speed and descent.", altitude: "~700 → 0 ft", call: "turning final" },
  { leg: "Rollout", description: "Landed, decelerating, taxiing clear of the runway.", altitude: "0 ft", call: "clear of runway" },
];

/** Find the glossary/procedure entry relevant to a results-screen "why" string. */
export function findReferenceForWhy(why: string): { term?: GlossaryTerm; proc?: ProcedureWhy } {
  const lower = why.toLowerCase();
  const term = GLOSSARY.find((g) => lower.includes(g.term.toLowerCase().split(" ")[0]));
  const proc = PROCEDURE_WHY.find((p) => lower.includes(p.topic.toLowerCase().split(" ")[1] ?? p.topic.toLowerCase().slice(0, 8)));
  return { term, proc };
}
