export type ScenarioType = "initial-call" | "readback";

export type MapKind =
  | "downwind"
  | "pattern-entry-45"
  | "ground-taxi"
  | "runway-hold"
  | "approach"
  | "emergency"
  | "radio-check"
  | "flight-following"
  | "runway-crossing";

/**
 * Phrase-anatomy slots — the universal "Four W's" of a pilot radio call
 * (AIM 4-2): who you're calling, who you are, where you are, what you want,
 * plus readback items and a close-out. Teaching blocks as ROLES (not
 * sentences) is what makes the pattern transfer to any future call.
 */
export type Slot =
  | "distress" // Mayday opener
  | "addressee" // who you're calling (station / airport traffic)
  | "callsign" // who you are
  | "position" // where you are
  | "altitude" // altitude (kept separate for clarity)
  | "intention" // what you want / what you'll do
  | "readback" // mandatory readback item (clearance echo)
  | "closing"; // close-out (repeat airport / callsign)

export interface SlotMeta {
  id: Slot;
  label: string;
  short: string;
  /** hex accent used for the block's role ring + legend */
  accent: string;
  /** one-line role description for the legend/teaching */
  role: string;
}

export const SLOT_META: Record<Slot, SlotMeta> = {
  distress: {
    id: "distress",
    label: "Distress Signal",
    short: "MAYDAY",
    accent: "#EF5B5B",
    role: "Opens a distress call — grabs every station's full attention.",
  },
  addressee: {
    id: "addressee",
    label: "Who You're Calling",
    short: "STATION",
    accent: "#3E92CC",
    role: "Address the facility first so ATC screens your call by frequency.",
  },
  callsign: {
    id: "callsign",
    label: "Who You Are",
    short: "CALLSIGN",
    accent: "#F2B134",
    role: "State your full aircraft callsign right after the addressee.",
  },
  position: {
    id: "position",
    label: "Where You Are",
    short: "POSITION",
    accent: "#5BB8C4",
    role: "Report your position so others can find you and deconflict.",
  },
  altitude: {
    id: "altitude",
    label: "Altitude",
    short: "ALTITUDE",
    accent: "#5BFF9B",
    role: "Report altitude so ATC can separate you from other traffic.",
  },
  intention: {
    id: "intention",
    label: "What You Want",
    short: "INTENTION",
    accent: "#E89B3B",
    role: "State your specific request or intended action.",
  },
  readback: {
    id: "readback",
    label: "Readback Item",
    short: "READBACK",
    accent: "#3FB68B",
    role: "Mandatory item ATC must hear back verbatim (runway, hold-short, altitude, heading).",
  },
  closing: {
    id: "closing",
    label: "Close-Out",
    short: "CLOSE",
    accent: "#8AA0BD",
    role: "Close the transmission (repeat airport name at non-towered fields, or callsign).",
  },
};

export const SLOT_ORDER: Slot[] = [
  "distress",
  "addressee",
  "callsign",
  "position",
  "altitude",
  "intention",
  "readback",
  "closing",
];

export interface ScenarioToken {
  id: string;
  text: string;
  slot: Slot;
  /** Teaching reason shown when a hint reveals this token's position. */
  why: string;
}

export interface ScenarioBrief {
  situation: string;
  position: string;
  intention: string;
  notes?: string;
}

export interface Scenario {
  id: string;
  type: ScenarioType;
  index: number;
  title: string;
  subtitle: string;
  callsign: string;
  callsignShort: string;
  activeFreq: string;
  standbyFreq: string;
  station: string;
  brief: ScenarioBrief;
  mapKind: MapKind;
  runway: string;
  /** For readback scenarios: the instruction ATC issued that you must read back. */
  atcInstruction?: string;
  /** Tokens listed in the CORRECT order. The component shuffles them for the pool. */
  tokens: ScenarioToken[];
  fullPhrase: string;
  /** Post-completion teaching note with FAA reference. */
  explanation: string;
  /** The single most common real-world mistake for this call type. */
  commonMistake: string;
  ref: string;
}

const SCENARIOS: Scenario[] = [
  // 1 — Non-towered downwind
  {
    id: "nt-downwind",
    type: "initial-call",
    index: 1,
    title: "Non-Towered Downwind Call",
    subtitle: "Self-announce on CTAF",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "122.725",
    standbyFreq: "121.5",
    station: "Watertown Traffic",
    brief: {
      situation:
        "You're flying the VFR traffic pattern at a non-towered airport (Watertown).",
      position: "Just turned downwind for Runway 23.",
      intention: "Full-stop landing.",
      notes:
        "No tower here — everyone coordinates on the Common Traffic Advisory Frequency (CTAF). Self-announce so other traffic can deconflict.",
    },
    mapKind: "downwind",
    runway: "23",
    tokens: [
      { id: "tw", slot: "addressee", text: "Watertown traffic,", why: "Self-announce calls at non-towered fields OPEN with the airport traffic name, so anyone on frequency knows the call is for this airport." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "State your full callsign right after who you're addressing, so listeners know who's talking." },
      { id: "pos", slot: "position", text: "downwind runway two three,", why: "Report your pattern leg and the runway — this is the heart of a position report." },
      { id: "intent", slot: "intention", text: "full stop,", why: "State your intentions so others can plan spacing around what you'll do next." },
      { id: "close", slot: "closing", text: "Watertown traffic.", why: "CLOSE self-announce calls by repeating the airport traffic name, signaling the transmission is complete." },
    ],
    fullPhrase:
      "Watertown traffic, Cessna Seven Three Romeo, downwind runway two three, full stop, Watertown traffic.",
    explanation:
      "At non-towered airports, self-announce on CTAF as 'airport traffic, callsign, position, intentions, airport traffic.' Open and close with the airport name. Position reports are recommended on downwind, base, and final.",
    commonMistake:
      "Forgetting to CLOSE with the airport name. At non-towered fields, every self-announce call opens AND closes with 'Watertown traffic' — the close-out tells everyone your transmission is done.",
    ref: "AIM 4-1-9 / 4-3-1",
  },

  // 2 — 45° pattern entry
  {
    id: "nt-entry-45",
    type: "initial-call",
    index: 2,
    title: "45° Pattern Entry",
    subtitle: "Arrival at a non-towered field",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "122.725",
    standbyFreq: "121.5",
    station: "Watertown Traffic",
    brief: {
      situation: "Arriving at Watertown from the southwest, 10 miles out.",
      position: "Ten miles southwest of the airport.",
      intention: "Enter the pattern on a 45-degree entry to downwind, Runway 23.",
      notes:
        "Announce position and intent early so traffic already in the pattern can sequence you in.",
    },
    mapKind: "pattern-entry-45",
    runway: "23",
    tokens: [
      { id: "tw", slot: "addressee", text: "Watertown traffic,", why: "Open with the airport traffic name — standard for every CTAF self-announce call." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign right after who you're addressing." },
      { id: "pos", slot: "position", text: "one zero miles southwest,", why: "Report distance and bearing from the airport so others can find you and plan the sequence." },
      { id: "intent", slot: "intention", text: "entering four five downwind runway two three,", why: "State how you'll enter the pattern — a 45-degree entry to downwind is the standard VFR arrival." },
      { id: "close", slot: "closing", text: "Watertown traffic.", why: "Close with the airport traffic name to mark the end of the call." },
    ],
    fullPhrase:
      "Watertown traffic, Cessna Seven Three Romeo, one zero miles southwest, entering four five downwind runway two three, Watertown traffic.",
    explanation:
      "Standard VFR pattern entry is a 45-degree entry to downwind. Report your position (miles/direction) and the intended entry so existing traffic can deconflict. Open and close with the airport name.",
    commonMistake:
      "Announcing only 'entering downwind' with no position. Without miles and direction, other traffic can't locate you — always include WHERE you are relative to the field.",
    ref: "AIM 4-3-3",
  },

  // 3 — Tower taxi request
  {
    id: "tw-taxi",
    type: "initial-call",
    index: 3,
    title: "Taxi Clearance Request",
    subtitle: "Initial call to Ground",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "121.900",
    standbyFreq: "124.200",
    station: "Watertown Ground",
    brief: {
      situation: "At the main ramp at towered Watertown Regional, ready to taxi.",
      position: "Main ramp.",
      intention: "Taxi to Runway 23.",
      notes: "You've copied ATIS Information Charlie.",
    },
    mapKind: "ground-taxi",
    runway: "23",
    tokens: [
      { id: "st", slot: "addressee", text: "Watertown Ground,", why: "Address the station first — Ground handles all taxi movement." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign so Ground knows who's calling." },
      { id: "loc", slot: "position", text: "at the main ramp,", why: "State where you are on the airport so the controller can issue taxi instructions from your actual spot." },
      { id: "req", slot: "intention", text: "taxi to runway two three,", why: "State your request — the runway you want to taxi to." },
      { id: "atis", slot: "intention", text: "with information Charlie.", why: "Tell the controller you have the current ATIS so they don't have to relay weather and wind." },
    ],
    fullPhrase:
      "Watertown Ground, Cessna Seven Three Romeo, at the main ramp, taxi to runway two three, with information Charlie.",
    explanation:
      "The initial Ground call is 'station, callsign, location on airport, request, ATIS code.' Stating you have the ATIS saves the controller from reading weather and wind.",
    commonMistake:
      "Omitting your location on the airport. 'Watertown Ground, N73R, taxi to runway 23' forces the controller to ask where you are — always state your ramp or spot up front.",
    ref: "AIM 4-3-7",
  },

  // 4 — Tower ready for takeoff
  {
    id: "tw-takeoff",
    type: "initial-call",
    index: 4,
    title: "Ready for Takeoff",
    subtitle: "Holding short, announcing readiness",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "124.200",
    standbyFreq: "121.900",
    station: "Watertown Tower",
    brief: {
      situation:
        "Taxied to the hold-short line of Runway 23, runup and pre-takeoff checks complete.",
      position: "Holding short of Runway 23.",
      intention: "Depart.",
      notes: "Don't enter the runway until Tower issues a takeoff clearance.",
    },
    mapKind: "runway-hold",
    runway: "23",
    tokens: [
      { id: "st", slot: "addressee", text: "Watertown Tower,", why: "Address Tower — they control the active runways." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign." },
      { id: "pos", slot: "position", text: "at runway two three,", why: "Tell Tower exactly where you are — holding short of the departure runway." },
      { id: "ready", slot: "intention", text: "ready for takeoff.", why: "State readiness so Tower can issue the takeoff clearance or sequence you." },
    ],
    fullPhrase:
      "Watertown Tower, Cessna Seven Three Romeo, at runway two three, ready for takeoff.",
    explanation:
      "When holding short and ready, notify Tower 'at runway, ready for takeoff.' Tower then issues 'cleared for takeoff' (or hold-short instructions). Never taxi onto the runway without a clearance.",
    commonMistake:
      "Saying 'taking the runway' or taxiing onto the runway without a clearance. 'Ready for takeoff' is a REQUEST — you must wait for Tower's explicit 'cleared for takeoff' before crossing the hold-short line.",
    ref: "AIM 4-3-6",
  },

  // 5 — Tower downwind
  {
    id: "tw-downwind",
    type: "initial-call",
    index: 5,
    title: "Towered Downwind Call",
    subtitle: "Position report in the pattern",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "124.200",
    standbyFreq: "121.900",
    station: "Watertown Tower",
    brief: {
      situation:
        "In the traffic pattern at towered Watertown, just turning downwind.",
      position: "Downwind, Runway 23.",
      intention: "Full-stop landing.",
      notes: "Tower asked you to report downwind.",
    },
    mapKind: "downwind",
    runway: "23",
    tokens: [
      { id: "st", slot: "addressee", text: "Watertown Tower,", why: "Address Tower, who is sequencing the pattern." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign." },
      { id: "pos", slot: "position", text: "downwind runway two three,", why: "Report the pattern leg and runway so Tower can sequence you." },
      { id: "intent", slot: "intention", text: "full stop.", why: "State your landing intent." },
    ],
    fullPhrase:
      "Watertown Tower, Cessna Seven Three Romeo, downwind runway two three, full stop.",
    explanation:
      "In a towered pattern, report pattern positions (downwind, base, final) when requested or as standard. Address Tower, give callsign, position, and intentions.",
    commonMistake:
      "Dropping the runway number. 'Downwind, full stop' is ambiguous when multiple runways are active — always include the runway so Tower knows your intent for the correct surface.",
    ref: "AIM 4-3-6",
  },

  // 6 — Approach / arrival request
  {
    id: "tw-approach",
    type: "initial-call",
    index: 6,
    title: "Inbound Landing Request",
    subtitle: "Arriving at a towered field",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "124.200",
    standbyFreq: "121.900",
    station: "Watertown Tower",
    brief: {
      situation: "Inbound to towered Watertown, 10 miles south at 2,500 ft.",
      position: "Ten miles south, two thousand five hundred feet.",
      intention: "Full-stop landing.",
      notes: "ATIS Information Charlie is current.",
    },
    mapKind: "approach",
    runway: "23",
    tokens: [
      { id: "st", slot: "addressee", text: "Watertown Tower,", why: "Address Tower — they control arrivals into the airport." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign." },
      { id: "pos", slot: "position", text: "one zero miles south,", why: "Report distance and direction from the field." },
      { id: "alt", slot: "altitude", text: "at two thousand five hundred,", why: "Report your altitude so Tower can deconflict with other traffic." },
      { id: "atis", slot: "intention", text: "with information Charlie,", why: "Confirm you have the current ATIS." },
      { id: "intent", slot: "intention", text: "inbound for full stop.", why: "State your request — landing full stop." },
    ],
    fullPhrase:
      "Watertown Tower, Cessna Seven Three Romeo, one zero miles south, at two thousand five hundred, with information Charlie, inbound for full stop.",
    explanation:
      "The inbound tower call is 'station, callsign, position (miles/direction), altitude, ATIS, request.' Tower will then sequence you into the pattern or clear you straight in.",
    commonMistake:
      "Forgetting altitude. Tower needs your altitude to deconflict you with traffic already in the pattern — a position report without altitude is incomplete.",
    ref: "AIM 4-3-6 / 5-1-1",
  },

  // 7 — Mayday
  {
    id: "emergency-mayday",
    type: "initial-call",
    index: 7,
    title: "Mayday — Engine Failure",
    subtitle: "Distress call",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "124.200",
    standbyFreq: "121.500",
    station: "Watertown Tower",
    brief: {
      situation: "Engine failure. Two miles south of the airport at 2,000 ft.",
      position: "Two miles south, two thousand feet.",
      intention: "Attempt a landing on Runway 23.",
      notes:
        "Two souls on board, three hours of fuel. Transmit on the frequency you're already on — distress overrides normal traffic.",
    },
    mapKind: "emergency",
    runway: "23",
    tokens: [
      { id: "may", slot: "distress", text: "Mayday, Mayday, Mayday,", why: "A distress call opens with 'MAYDAY' spoken three times — the universal radiotelephone distress signal that grabs every station's full attention." },
      { id: "st", slot: "addressee", text: "Watertown Tower,", why: "Address the station you want help from." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Identify your aircraft." },
      { id: "nature", slot: "intention", text: "engine failure,", why: "State the nature of the emergency so ATC knows what help you need." },
      { id: "pos", slot: "position", text: "two miles south of the airport,", why: "Give your position so ATC and rescue can find you." },
      { id: "alt", slot: "altitude", text: "two thousand feet,", why: "State your altitude — critical for a glide assessment." },
      { id: "intent", slot: "intention", text: "attempting runway two three,", why: "State your intentions so ATC can clear other traffic and protect the runway." },
      { id: "souls", slot: "position", text: "two souls on board,", why: "Report the number of people on board for rescue planning." },
      { id: "fuel", slot: "position", text: "three hours fuel,", why: "Report fuel remaining (in hours) — part of the required distress information." },
      { id: "close", slot: "closing", text: "Cessna Seven Three Romeo.", why: "Close with your callsign to confirm the transmission." },
    ],
    fullPhrase:
      "Mayday, Mayday, Mayday, Watertown Tower, Cessna Seven Three Romeo, engine failure, two miles south of the airport, two thousand feet, attempting runway two three, two souls on board, three hours fuel, Cessna Seven Three Romeo.",
    explanation:
      "The distress call is 'MAYDAY (x3), station addressed, aircraft callsign, nature of emergency, intentions, number of souls on board, fuel remaining, then callsign.' Once transmitted, ATC prioritizes you and clears traffic. If not on a frequency, use 121.5.",
    commonMistake:
      "Forgetting souls and fuel. In a real emergency you'll be busy flying, but ATC needs souls-on-board and fuel for rescue planning — say them even if everything else feels rushed.",
    ref: "AIM 6-3-1",
  },

  // 8 — Radio check after 7600
  {
    id: "radio-check",
    type: "initial-call",
    index: 8,
    title: "Radio Check (after 7600)",
    subtitle: "Confirming your COM works again",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "121.900",
    standbyFreq: "121.500",
    station: "Watertown Ground",
    brief: {
      situation:
        "Your COM went silent mid-taxi. You squawked 7600 (radio failure), recycled avionics, and the radio appears alive again.",
      position: "On the taxiway.",
      intention: "Confirm the radio actually transmits and receives.",
      notes:
        "If comms truly fail, squawk 7600 and continue per lost-comms procedures. This call verifies the radio is back.",
    },
    mapKind: "radio-check",
    runway: "23",
    tokens: [
      { id: "st", slot: "addressee", text: "Watertown Ground,", why: "Address the station you want to evaluate your signal." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign." },
      { id: "req", slot: "intention", text: "radio check,", why: "State the request — a radio check asks the station to evaluate your signal." },
      { id: "freq", slot: "position", text: "one two one point niner.", why: "State the frequency you're transmitting on so the station confirms which radio they're hearing." },
    ],
    fullPhrase:
      "Watertown Ground, Cessna Seven Three Romeo, radio check, one two one point niner.",
    explanation:
      "A radio check is 'station, callsign, radio check, [frequency].' The station replies with signal quality (e.g., 'loud and clear'). Separately, in actual two-way comms failure, squawk 7600 and proceed per lost-comms procedures.",
    commonMistake:
      "Confusing a radio check with a real failure. A radio check just asks 'how do I sound?' If you actually lose two-way comms, squawk 7600 and follow lost-comms procedures — don't just keep calling.",
    ref: "AIM 4-2-3 / 6-4-1",
  },

  // 9 — Flight following
  {
    id: "flight-following",
    type: "initial-call",
    index: 9,
    title: "VFR Flight Following",
    subtitle: "Request traffic advisories",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "127.400",
    standbyFreq: "121.500",
    station: "Minneapolis Center",
    brief: {
      situation:
        "Cruising VFR at 4,500 ft, 20 miles south of Watertown, heading to Rochester.",
      position: "Twenty miles south of Watertown, four thousand five hundred.",
      intention: "Request flight following to Rochester for traffic advisories.",
      notes:
        "Flight following is provided workload-permitting — ATC may assign a squawk and hand you off along the route.",
    },
    mapKind: "flight-following",
    runway: "23",
    tokens: [
      { id: "st", slot: "addressee", text: "Minneapolis Center,", why: "Address the radar facility that owns the airspace you're in." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign." },
      { id: "type", slot: "callsign", text: "Cessna one seven two,", why: "State your aircraft type so ATC knows your performance and can tag the radar track correctly." },
      { id: "pos", slot: "position", text: "two zero miles south of Watertown,", why: "Give your position relative to a known fix so the controller can find your radar return." },
      { id: "alt", slot: "altitude", text: "at four thousand five hundred,", why: "State your altitude — ATC needs it to deconflict with IFR traffic." },
      { id: "req", slot: "intention", text: "request VFR flight following to Rochester.", why: "State the request and your destination — flight following is provided workload permitting." },
    ],
    fullPhrase:
      "Minneapolis Center, Cessna Seven Three Romeo, Cessna one seven two, two zero miles south of Watertown, at four thousand five hundred, request VFR flight following to Rochester.",
    explanation:
      "To request VFR flight following, contact the appropriate Center/Approach with 'station, callsign, aircraft type, position, altitude, request flight following to destination.' ATC assigns a squawk and provides traffic advisories workload permitting.",
    commonMistake:
      "Omitting aircraft type. Center tags your radar return by type — without it they may ask 'say aircraft type,' adding a round-trip. Include type right after your callsign.",
    ref: "AIM 4-1-17 / 5-2-9",
  },

  // 10 — Runway crossing request
  {
    id: "runway-crossing",
    type: "initial-call",
    index: 10,
    title: "Runway Crossing Request",
    subtitle: "Explicit clearance required",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "121.900",
    standbyFreq: "124.200",
    station: "Watertown Ground",
    brief: {
      situation:
        "Taxiing via Alpha, you've reached the approach end of Runway 11 and need to cross it to reach Runway 23.",
      position: "Approach end of Runway 11, taxiway Alpha.",
      intention: "Cross Runway 11.",
      notes: "Never cross any runway — active or not — without an explicit clearance.",
    },
    mapKind: "runway-crossing",
    runway: "11",
    tokens: [
      { id: "st", slot: "addressee", text: "Watertown Ground,", why: "Address Ground — they authorize movement on taxiways and runway crossings." },
      { id: "cs", slot: "callsign", text: "Cessna Seven Three Romeo,", why: "Give your callsign." },
      { id: "pos", slot: "position", text: "at Alpha, approach end runway one one,", why: "State exactly where you are on the movement area so the controller can issue the right clearance." },
      { id: "req", slot: "intention", text: "request crossing runway one one.", why: "Explicitly request to cross — never cross a runway without a clearance." },
    ],
    fullPhrase:
      "Watertown Ground, Cessna Seven Three Romeo, at Alpha, approach end runway one one, request crossing runway one one.",
    explanation:
      "You must receive an explicit clearance to cross any runway, active or not. State your position and request crossing. The crossing clearance must then be read back (see the readback challenge).",
    commonMistake:
      "Crossing without an explicit clearance. Hearing 'taxi to runway 23' does NOT authorize crossing Runway 11 — you need a specific 'cleared to cross' call. When in doubt, ask.",
    ref: "AIM 4-3-7",
  },

  // 11 — Readback: taxi clearance with hold short
  {
    id: "rb-taxi",
    type: "readback",
    index: 11,
    title: "Readback: Taxi & Hold Short",
    subtitle: "Mandatory readback items",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "121.900",
    standbyFreq: "124.200",
    station: "Watertown Ground",
    atcInstruction:
      "Cessna Seven Three Romeo, Watertown Ground, runway two three, taxi via Alpha, hold short of runway one one.",
    brief: {
      situation:
        "Ground issued your taxi clearance: taxi to Runway 23 via Alpha, but hold short of Runway 11 (which crosses your path).",
      position: "Main ramp, about to taxi.",
      intention: "Read back the clearance correctly.",
      notes:
        "Runway assignment and hold-short instructions are both mandatory readback items — ATC must hear them back.",
    },
    mapKind: "ground-taxi",
    runway: "23",
    tokens: [
      { id: "rw", slot: "readback", text: "Runway two three,", why: "Read back the runway assignment FIRST — confirming the correct runway is a critical safety item." },
      { id: "route", slot: "readback", text: "taxi via Alpha,", why: "Read back the taxi route so the controller knows you understood the path." },
      { id: "hold", slot: "readback", text: "hold short of runway one one,", why: "Hold-short instructions are MANDATORY readback items — ATC must hear you say it back to confirm you'll stop." },
      { id: "cs", slot: "closing", text: "Cessna Seven Three Romeo.", why: "End the readback with your callsign so ATC knows who acknowledged." },
    ],
    fullPhrase:
      "Runway two three, taxi via Alpha, hold short of runway one one, Cessna Seven Three Romeo.",
    explanation:
      "Runway assignments, taxi routing, and hold-short instructions all require a readback. Always read back the hold-short instruction in full — it's one of the most common real-world errors and a frequent checkride focus.",
    commonMistake:
      "Reading back 'taxi to runway 23' but dropping 'hold short of runway 11.' The hold-short is the single most important word — ATC will not let you taxi until they hear it back verbatim.",
    ref: "AIM 4-3-7 / 4-2-3",
  },

  // 12 — Readback: altitude & heading
  {
    id: "rb-altitude",
    type: "readback",
    index: 12,
    title: "Readback: Vector & Altitude",
    subtitle: "Heading + altitude readback",
    callsign: "Cessna Seven Three Romeo",
    callsignShort: "N73R",
    activeFreq: "124.200",
    standbyFreq: "121.900",
    station: "Watertown Tower",
    atcInstruction:
      "Cessna Seven Three Romeo, turn right heading zero niner zero, descend and maintain two thousand five hundred.",
    brief: {
      situation:
        "On left downwind, Tower vectors you behind traffic: turn right to heading 090 and descend to 2,500 ft.",
      position: "Downwind, being sequenced.",
      intention: "Read back the assignment correctly.",
      notes:
        "Heading and altitude assignments are both mandatory readback items — read them back promptly and exactly.",
    },
    mapKind: "downwind",
    runway: "23",
    tokens: [
      { id: "hdg", slot: "readback", text: "Right heading zero niner zero,", why: "Read back the direction and assigned heading — headings are mandatory readback items." },
      { id: "alt", slot: "readback", text: "descend and maintain two thousand five hundred,", why: "Read back altitude assignments in full — confirming the correct altitude is safety-critical." },
      { id: "cs", slot: "closing", text: "Cessna Seven Three Romeo.", why: "Close the readback with your callsign." },
    ],
    fullPhrase:
      "Right heading zero niner zero, descend and maintain two thousand five hundred, Cessna Seven Three Romeo.",
    explanation:
      "Altitude assignments, altitude restrictions, and heading assignments are mandatory readback items. Read them back exactly as issued, then your callsign.",
    commonMistake:
      "Reading back only the altitude and dropping the heading (or vice versa). Both are mandatory — a partial readback forces ATC to repeat the instruction, increasing workload on a busy frequency.",
    ref: "AIM 4-2-3 / 4-4",
  },
];

export { SCENARIOS };

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export const BASE_SCENARIO_IDS = SCENARIOS.filter(
  (s) => s.type === "initial-call",
).map((s) => s.id);

export const READBACK_SCENARIO_IDS = SCENARIOS.filter(
  (s) => s.type === "readback",
).map((s) => s.id);

export function correctOrderOf(s: Scenario): string[] {
  return s.tokens.map((t) => t.id);
}

/** Score by hint count: 0→100, 1→75, 2→50, 3+→0 (give-up → 0). */
export function scoreForHints(hintsUsed: number, gaveUp: boolean): number {
  if (gaveUp) return 0;
  if (hintsUsed <= 0) return 100;
  if (hintsUsed === 1) return 75;
  if (hintsUsed === 2) return 50;
  return 0;
}

/**
 * Diagnose a learner's attempt vs the correct order.
 * Returns the first index where they diverge, plus which blocks
 * are misplaced / missing — used for smart feedback (not a bare shake).
 */
export interface AttemptDiagnosis {
  correct: boolean;
  firstDivergence: number | null;
  missing: { tokenId: string; slot: Slot; text: string }[];
  placedCount: number;
  expectedCount: number;
}

export function diagnoseAttempt(
  placed: string[],
  scenario: Scenario,
): AttemptDiagnosis {
  const correct = correctOrderOf(scenario);
  const correctSet = new Set(correct);
  const placedSet = new Set(placed);
  const correct_bool = placed.length === correct.length && placed.every((id, i) => id === correct[i]);

  let firstDivergence: number | null = null;
  const minLen = Math.min(placed.length, correct.length);
  for (let i = 0; i < minLen; i++) {
    if (placed[i] !== correct[i]) {
      firstDivergence = i;
      break;
    }
  }
  if (firstDivergence === null && placed.length !== correct.length) {
    firstDivergence = minLen;
  }

  const missing: { tokenId: string; slot: Slot; text: string }[] = [];
  for (const id of correct) {
    if (!placedSet.has(id)) {
      const tok = scenario.tokens.find((t) => t.id === id)!;
      missing.push({ tokenId: id, slot: tok.slot, text: tok.text });
    }
  }
  // also flag extras (blocks placed that aren't in correct — shouldn't happen, but safe)
  void correctSet;

  return {
    correct: correct_bool,
    firstDivergence,
    missing,
    placedCount: placed.length,
    expectedCount: correct.length,
  };
}
