/**
 * FlightCourse — coaching engine
 * -----------------------------------------------------------------------------
 * Real-time guidance + post-landing debrief, grounded in FAA-H-8083-3C
 * (Airplane Flying Handbook Ch.9 "Approaches and Landings"), the C172S POH,
 * and Boldmethod/AOPA/PilotWorkshops guidance.
 *
 * Two layers:
 *   1. Real-time: radar-altitude callouts (50/40/30/20/10 + FLARE), live
 *      coaching hints keyed to the current flight phase.
 *   2. Debrief: after touchdown, generate a structured "what happened → why →
 *      the fix" card from the FAA AFH error table.
 */

import type {
  Attempt,
  CoachingPhase,
  FlightState,
  LandingQuality,
} from './aviation'
import { APPROACH_SPEED, STALL_HORN_SPEED, nextRadarCallout } from './aviation'

export interface RadarCallout {
  alt: number
  text: string
  ts: number
}

export interface LiveHint {
  text: string
  tone: 'info' | 'good' | 'warn' | 'crit'
  phase: CoachingPhase
}

/**
 * Produce a live coaching hint for the current flight state.
 * Returns null when there's nothing useful to say.
 */
export function liveHint(s: FlightState): LiveHint | null {
  // Stall horn — critical
  if (s.stallHorn && s.altitude < 15 && !s.onGround) {
    return {
      text: 'Stall horn — hold it off, let it settle',
      tone: 'crit',
      phase: s.phase,
    }
  }

  // Over threshold, stable — prompt the flare
  if (s.phase === 'over-threshold' && s.altitude <= 20 && s.altitude > 8) {
    if (!s.flareHeld && s.flareFirstAlt === null) {
      return {
        text: 'Flare window — begin round-out',
        tone: 'warn',
        phase: s.phase,
      }
    }
  }

  // Flaring too high
  if (s.flareHeld && s.altitude > 25 && s.flareFirstAlt !== null && s.flareFirstAlt > 25) {
    return {
      text: 'Flared too high — relax back pressure, let it settle',
      tone: 'warn',
      phase: s.phase,
    }
  }

  // Ballooning (climbing after a flare)
  if (s.vsi > 60 && s.altitude > 4 && s.altitude < 30 && s.flareFirstAlt !== null) {
    return {
      text: 'Balloon! Relax pressure, don\'t push',
      tone: 'crit',
      phase: s.phase,
    }
  }

  // In ground effect / hold-off — good
  if (s.phase === 'hold-off') {
    return {
      text: 'Hold it off — eyes to the far end',
      tone: 'good',
      phase: s.phase,
    }
  }

  // Approach speed check (short final)
  if (s.phase === 'short-final' && s.altitude > 40) {
    if (s.airspeed > APPROACH_SPEED + 8) {
      return {
        text: `Fast — ${Math.round(s.airspeed)}kt (target 65)`,
        tone: 'warn',
        phase: s.phase,
      }
    }
    if (s.airspeed < APPROACH_SPEED - 8) {
      return {
        text: `Slow — ${Math.round(s.airspeed)}kt (target 65)`,
        tone: 'warn',
        phase: s.phase,
      }
    }
  }

  return null
}

/**
 * Radar-altitude callout state — call each time the altitude drops through a
 * threshold. Returns the callout to announce (and the HUD should play it).
 */
export function checkRadarCallout(s: FlightState): RadarCallout | null {
  const c = nextRadarCallout(s.altitude, s.lastCalloutAlt)
  if (c === null) return null
  // The "10" callout doubles as the flare prompt
  const text = c <= 10 ? `${c} — FLARE` : String(c)
  return { alt: c, text, ts: s.elapsed }
}

// ---------------------------------------------------------------------------
// DEBRIEF GENERATOR
// ---------------------------------------------------------------------------

export interface DebriefInsight {
  metric: string
  value: string
  verdict: 'good' | 'warn' | 'bad'
  note: string
}

export interface Debrief {
  headline: string
  summary: string
  cause: string
  fix: string
  insights: DebriefInsight[]
  tip: string
}

const CAUSE_FIX: Record<LandingQuality, { cause: string; fix: string }> = {
  greaser: {
    cause: 'You rounded out at the right altitude and held the nose up through touchdown, letting speed bleed in ground effect until the mains kissed the pavement.',
    fix: 'Repeat exactly this. The only trap now is complacency — keep the scan alive on every approach.',
  },
  good: {
    cause: 'Your flare timing and attitude were close to ideal — you arrested the descent and touched down main-first at a comfortable sink rate.',
    fix: 'To turn "good" into a greaser: hold back pressure a beat longer in ground effect, eyes to the far end of the runway, and let it settle the last foot on its own.',
  },
  firm: {
    cause: 'You carried a bit too much sink or speed into touchdown. The flare arrested most of the descent but not quite enough for a soft contact.',
    fix: 'Begin the round-out a half-second earlier and hold the nose-up attitude a beat longer. Aim to hear the stall horn in the last second before the mains touch.',
  },
  hard: {
    cause: 'The flare was too late or too shallow — you contacted the runway with significant sink rate still remaining.',
    fix: 'Start the flare at ~15 ft AGL (when the runway "zooms"). Round out to level first, THEN hold the nose up to bleed speed. Don\'t let the nose drop once you\'ve started the flare.',
  },
  bounce: {
    cause: 'You touched down with enough sink that the energy stored the gear and rebounded you airborne — a bounce.',
    fix: 'A slight bounce: hold attitude and add a touch of power to cushion the re-settle. A severe bounce: full power, go around. Never push the nose down to "find" the runway.',
  },
  porpoise: {
    cause: 'After the first bounce, the nose pitched forward and struck first, rebounding you back up — classic pilot-induced oscillation. Each cycle gets worse.',
    fix: 'GO AROUND IMMEDIATELY. A porpoise will not fix itself; trying to ride it out risks a prop strike or nosewheel collapse. Add full power, pitch for climb, clean up.',
  },
  stall: {
    cause: 'You held the flare too long or too high — airspeed bled below the stall and the wing stopped flying. The nose dropped and you dropped in.',
    fix: 'Don\'t over-flare. Once in ground effect, hold pitch constant (don\'t keep pulling) and let the plane settle. If you\'re not down by the aim point with the stall horn blaring, go around.',
  },
  balloon: {
    cause: 'You pulled too much pitch too early (or too fast) and the aircraft climbed away from the runway instead of settling — a balloon.',
    fix: 'Relax back pressure slightly and hold attitude to let it re-settle. A small balloon is salvageable; a big one with the stall horn = full power, go around. Never shove the nose down.',
  },
  short: {
    cause: 'You touched down before the runway threshold — the approach was too low or you flared too early over undershoot terrain.',
    fix: 'Fly the 3° glideslope all the way to the threshold (PAPI: 2 red / 2 white). Don\'t flare until you\'re over the runway. If you\'re below glideslope on short final, add power and go around.',
  },
  crash: {
    cause: 'You touched down off the runway, with extreme sink rate, or nose-first — any of these is a structural-risk event.',
    fix: 'Go around earlier. The landing is never mandatory — if the approach isn\'t stable by ~500 ft (on speed, on path, sink <1000 fpm), add power and try again.',
  },
}

const TIPS = [
  'Look to the FAR end of the runway during the flare — not at the aim point. Peripheral vision judges height best.',
  'The runway "zooms" (grows ~10× faster) at about 10 ft — that\'s your flare trigger.',
  'One bounce is a mistake; two is a do-over; three is an immediate go-around. No exceptions.',
  'Hearing the stall horn in the last second of flare is CORRECT — it means minimum flying speed.',
  'Ground effect starts at one wingspan (~36 ft) and is strongest in the last 5 ft. It\'s the cushion that makes a greaser possible.',
  'Aim 200–300 ft BEFORE your intended touchdown point — the flare eats that distance.',
  'Never push the nose down to "hit the spot" — it causes prop strikes and porpoises. Go around instead.',
  'In a crosswind: crab down final, transition to wing-low in the flare. Touch the upwind main first.',
  'Keep flying after touchdown — hold the nosewheel off with back pressure until it settles on its own.',
  'Stable approach = on speed (65 kt), on path, sink <1000 fpm, configured. If not stable by 500 ft, go around.',
]

export function buildDebrief(a: Attempt): Debrief {
  const cf = CAUSE_FIX[a.quality]
  const insights: DebriefInsight[] = []

  // Sink rate
  const absVsi = Math.abs(a.touchdownVSI)
  let sinkVerdict: 'good' | 'warn' | 'bad' = 'bad'
  let sinkNote = 'Hard contact — well above the greaser zone.'
  if (absVsi < 100) {
    sinkVerdict = 'good'
    sinkNote = 'Greaser territory — wheels barely kissed the runway.'
  } else if (absVsi < 200) {
    sinkVerdict = 'good'
    sinkNote = 'Comfortable sink rate for a smooth landing.'
  } else if (absVsi < 300) {
    sinkVerdict = 'warn'
    sinkNote = 'Firm — a little more round-out next time.'
  } else if (absVsi < 450) {
    sinkVerdict = 'warn'
    sinkNote = 'Hard — passengers felt that one.'
  } else {
    sinkVerdict = 'bad'
    sinkNote = 'Very hard — above the 240 fpm "hard landing" threshold.'
  }
  insights.push({
    metric: 'Touchdown sink',
    value: `${Math.round(a.touchdownVSI)} fpm`,
    verdict: sinkVerdict,
    note: sinkNote,
  })

  // Touchdown speed
  const speedDelta = Math.abs(a.touchdownAirspeed - 50)
  insights.push({
    metric: 'Touchdown speed',
    value: `${Math.round(a.touchdownAirspeed)} kt`,
    verdict: speedDelta < 6 ? 'good' : speedDelta < 12 ? 'warn' : 'bad',
    note:
      a.touchdownAirspeed > 56
        ? 'Fast — excess speed floats you down the runway.'
        : a.touchdownAirspeed < 44
          ? 'Slow — risk of a stall drop.'
          : 'Right in the 45–50 kt touchdown band.',
  })

  // Touchdown distance
  let distVerdict: 'good' | 'warn' | 'bad' = 'good'
  let distNote = 'In the touchdown zone.'
  if (a.touchdownDistance < 0) {
    distVerdict = 'bad'
    distNote = 'Before the threshold — unsafe.'
  } else if (a.touchdownDistance > 2000) {
    distVerdict = 'bad'
    distNote = 'Floated too far — overrun risk.'
  } else if (a.touchdownDistance > 1000) {
    distVerdict = 'warn'
    distNote = 'Long — you floated past the touchdown zone.'
  } else if (a.touchdownDistance < 100) {
    distVerdict = 'warn'
    distNote = 'Right at the threshold — little margin.'
  }
  insights.push({
    metric: 'Touchdown point',
    value: a.touchdownDistance < 0 ? `${Math.round(a.touchdownDistance)} ft` : `+${Math.round(a.touchdownDistance)} ft`,
    verdict: distVerdict,
    note: distNote,
  })

  // Flare altitude / timing
  let flareVerdict: 'good' | 'warn' | 'bad' = 'warn'
  let flareNote = ''
  if (a.flareTiming === 'none') {
    flareVerdict = 'bad'
    flareNote = 'No flare detected — you flew it onto the runway.'
  } else if (a.flareTiming === 'early') {
    flareVerdict = 'warn'
    flareNote = `Flared at ${Math.round(a.flareAltitude)} ft — too high, risks a balloon.`
  } else if (a.flareTiming === 'late') {
    flareVerdict = 'warn'
    flareNote = `Flared at ${Math.round(a.flareAltitude)} ft — too low, little time to round out.`
  } else {
    flareVerdict = 'good'
    flareNote = `Flared at ${Math.round(a.flareAltitude)} ft — ideal 8–25 ft window.`
  }
  insights.push({
    metric: 'Flare altitude',
    value: a.flareAltitude > 0 ? `${Math.round(a.flareAltitude)} ft` : '—',
    verdict: flareVerdict,
    note: flareNote,
  })

  // Lateral / crab
  if (a.crosswind) {
    const latOk = Math.abs(a.touchdownLateral) < 12
    const crabOk = Math.abs(a.touchdownCrab) < 6
    insights.push({
      metric: 'Centerline / crab',
      value: `${Math.round(a.touchdownLateral)} ft · ${Math.round(a.touchdownCrab)}°`,
      verdict: latOk && crabOk ? 'good' : latOk || crabOk ? 'warn' : 'bad',
      note:
        latOk && crabOk
          ? 'Aligned on centerline — good crosswind technique.'
          : 'Off-centerline or sideways — sideload on the gear.',
    })
  }

  // Bounces
  if (a.bounces > 0) {
    insights.push({
      metric: 'Bounces',
      value: String(a.bounces),
      verdict: a.bounces >= 2 ? 'bad' : 'warn',
      note: a.bounces >= 2 ? 'Multiple bounces = porpoise risk. Go around.' : 'One bounce is recoverable with power.',
    })
  }

  // Approach stability (if available)
  if (a.stableAt500 !== null) {
    insights.push({
      metric: 'Stable @ 500ft',
      value: a.stableAt500 ? 'Stable' : 'Unstable',
      verdict: a.stableAt500 ? 'good' : 'warn',
      note: a.stableAt500
        ? 'On speed, on path, sink in check — good setup for the flare.'
        : 'Off speed or path at 500 ft — the flare only forgives a stable approach.',
    })
  }

  return {
    headline: headlineFor(a.quality),
    summary: summaryFor(a),
    cause: cf.cause,
    fix: cf.fix,
    insights,
    tip: selectRelevantTip(a),
  }
}

/**
 * §2.1 — Select the pro-tip that's actually relevant to what happened in this
 * specific attempt, not a random one. Maps the failure-mode classification
 * (quality, flareTiming, bounces, crosswind, stall) to the tip that addresses
 * that specific mistake.
 */
function selectRelevantTip(a: Attempt): string {
  // Crosswind landing → crosswind technique tip
  if (a.crosswind && a.quality !== 'greaser') {
    return 'In a crosswind: crab down final, transition to wing-low in the flare. Touch the upwind main first.'
  }
  // Bounce/porpoise → bounce recovery tip
  if (a.quality === 'bounce' || a.quality === 'porpoise') {
    return 'One bounce is a mistake; two is a do-over; three is an immediate go-around. No exceptions.'
  }
  // Stall drop → stall horn tip
  if (a.quality === 'stall') {
    return 'Hearing the stall horn in the last second of flare is CORRECT — it means minimum flying speed. But don\'t hold it past that point — let it settle.'
  }
  // Balloon → don't push the nose tip
  if (a.quality === 'balloon') {
    return 'Never push the nose down to "hit the spot" — it causes prop strikes and porpoises. Go around instead.'
  }
  // Landed short → aim point tip
  if (a.quality === 'short') {
    return 'Aim 200–300 ft BEFORE your intended touchdown point — the flare eats that distance. Don\'t flare until you\'re over the runway.'
  }
  // Hard/firm landing with late or no flare → flare timing tip
  if ((a.quality === 'hard' || a.quality === 'firm') && (a.flareTiming === 'late' || a.flareTiming === 'none')) {
    return 'The runway "zooms" (grows ~10× faster) at about 10 ft — that\'s your flare trigger. Round out to level first, then hold the nose up.'
  }
  // Early flare → ground effect tip
  if (a.flareTiming === 'early') {
    return 'Ground effect starts at one wingspan (~36 ft) and is strongest in the last 5 ft. It\'s the cushion that makes a greaser possible, but it\'s also why excess speed floats you halfway down the runway.'
  }
  // Crash → stable approach tip
  if (a.quality === 'crash') {
    return 'Stable approach = on speed (65 kt), on path, sink <1000 fpm, configured. If not stable by 500 ft, go around.'
  }
  // Good/greaser → keep flying after touchdown tip
  if (a.quality === 'greaser' || a.quality === 'good') {
    return 'Keep flying after touchdown — hold the nosewheel off with back pressure until it settles on its own.'
  }
  // Default: the far-end sight-picture tip (universally useful)
  return 'Look to the FAR end of the runway during the flare — not at the aim point. Peripheral vision judges height best.'
}

function headlineFor(q: LandingQuality): string {
  switch (q) {
    case 'greaser': return 'Outstanding — a true greaser'
    case 'good': return 'Nice work — a clean landing'
    case 'firm': return 'Acceptable, but firm'
    case 'hard': return 'Hard landing — debrief required'
    case 'bounce': return 'Bounced — salvageable'
    case 'porpoise': return 'Porpoise — go around next time'
    case 'stall': return 'Stall drop — over-flared'
    case 'balloon': return 'Ballooned — over-eager flare'
    case 'short': return 'Landed short — unsafe'
    case 'crash': return 'Crash — go around earlier'
  }
}

function summaryFor(a: Attempt): string {
  const parts: string[] = []
  parts.push(`touched down at ${Math.round(a.touchdownVSI)} fpm`)
  parts.push(`${Math.round(a.touchdownAirspeed)} kt`)
  if (a.touchdownDistance < 0) parts.push(`${Math.round(a.touchdownDistance)} ft (before threshold)`)
  else parts.push(`${Math.round(a.touchdownDistance)} ft past threshold`)
  if (a.bounces > 0) parts.push(`${a.bounces} bounce${a.bounces > 1 ? 's' : ''}`)
  return `You ${parts.join(', ')}.`
}
