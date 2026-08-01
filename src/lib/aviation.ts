/**
 * FlightCourse — Landing Flare Trainer physics + scoring (v2 — research-driven)
 * -----------------------------------------------------------------------------
 * A time-stepped flight model tuned to *feel* and *teach* like a Cessna 172 on
 * short final, grounded in FAA-H-8083-3C (Airplane Flying Handbook Ch.9),
 * the C172S POH, and Boldmethod/AOPA/PilotWorkshops guidance.
 *
 * Pilot-friendly units: altitude (ft AGL), airspeed (kt), vsi (ft/min),
 * pitch (deg), distance (ft from threshold, +past / -before), lateral (ft
 * from centerline), crab (deg). Internal integration uses seconds.
 *
 * Key C172 reference numbers baked in:
 *   • Final approach speed (flaps 30°): 65 KIAS
 *   • Touchdown speed: ~45-50 KIAS
 *   • Vs0 (flaps down): 40 KIAS  (stall horn ~5-10 kt above)
 *   • Greaser sink: <100 fpm  |  Hard: >240 fpm  |  Mfr-inspect: >600 fpm
 *   • Ground effect: <1 wingspan ≈ 36 ft AGL
 *   • 3° glideslope ≈ 300-500 fpm sink
 *   • Flare trigger: 10-20 ft AGL (visual "zoom")
 *   • Touchdown tolerance: ±400 ft of aim point (PPL ACS)
 */

export type LandingQuality =
  | 'greaser'
  | 'good'
  | 'firm'
  | 'hard'
  | 'bounce'
  | 'porpoise'
  | 'stall'
  | 'balloon'
  | 'short'
  | 'crash'

export type CoachingPhase =
  | 'approach'
  | 'short-final'
  | 'over-threshold'
  | 'flare-window'
  | 'hold-off'
  | 'touchdown'
  | 'rollout'

export interface TelemetryFrame {
  t: number // ms from start
  altitude: number // ft AGL
  airspeed: number // kt
  vsi: number // ft/min (negative = descending)
  pitch: number // deg
  distance: number // ft from threshold
  lateral: number // ft from centerline (+ right)
  crab: number // deg (yaw offset)
  flare: boolean
  onGround: boolean
  stalled: boolean
  bounces: number
  phase: CoachingPhase
}

export interface FlightState {
  altitude: number
  airspeed: number
  vsi: number
  pitch: number
  distance: number
  lateral: number
  crab: number
  onGround: boolean
  stalled: boolean
  stallHorn: boolean
  bounces: number
  airborne: boolean
  elapsed: number // ms
  ended: boolean
  flareHold: number // seconds of accumulated flare input (near ground)
  flareHeld: boolean
  flareFirstAlt: number | null // altitude at first flare input
  flareFirstTime: number | null // elapsed at first flare input
  balloonAlt: number | null // peak altitude after a balloon event
  lastCalloutAlt: number // last radar callout triggered (for 50/40/30/20/10)
  result: LandingResult | null
  phase: CoachingPhase
  goAround: boolean
  rolloutDistance: number // ft traveled after touchdown (rollout phase)
  rolloutSpeed: number // kt at start of rollout
}

export interface LandingResult {
  quality: LandingQuality
  score: number
  touchdownVSI: number
  touchdownAirspeed: number
  touchdownDistance: number
  touchdownLateral: number
  touchdownCrab: number
  touchdownPitch: number
  flareAltitude: number
  flareTiming: 'early' | 'ideal' | 'late' | 'none'
  bounces: number
  stalled: boolean
  crosswind: boolean
  duration: number
  stableAt500: boolean | null
  maxBalloon: number
}

export interface Attempt {
  id: string
  timestamp: number
  score: number
  quality: LandingQuality
  touchdownVSI: number
  touchdownAirspeed: number
  touchdownDistance: number
  touchdownLateral: number
  touchdownCrab: number
  touchdownPitch: number
  flareAltitude: number
  flareTiming: 'early' | 'ideal' | 'late' | 'none'
  bounces: number
  stalled: boolean
  crosswind: boolean
  duration: number
  stableAt500: boolean | null
  maxBalloon: number
  scenarioId: ScenarioId
  telemetry: TelemetryFrame[]
}

export interface GameEnv {
  crosswind: number // kt crosswind component (0 = none)
  gust: number // current gust offset (kt), varies over time
  headwind: number // kt headwind (reduces groundspeed)
  daylight: number // 0..1 — 1 = full sun (day), 0 = full night (moon + stars)
  rain: number // 0..1 — 0 = clear, 1 = heavy rain
  fog: number // 0..1 — 0 = clear, 1 = dense fog (visibility severely limited)
  turbulence: number // 0..1 — gust/turbulence intensity
  runwayHeading: string // e.g. "27" — drawn on threshold + HUD
  runwayLength: number // ft — affects rollout distance available
  surface: 'paved' | 'grass' // affects dust/spray color + rollout friction
}

// --- Scenario definitions (each is a complete environment preset) -----------
// Sources: FAA-H-8083-3C Ch.9 (approach/landing environment factors);
// C172S POH §4 (crosswind demonstrated 15kt); AIM 4-3-5 (runway markings).
export type ScenarioId =
  | 'dusk' | 'dawn' | 'midday' | 'night'
  | 'rain' | 'fog' | 'gusty'
  | 'crosswind' | 'short-field'

export interface Scenario {
  id: ScenarioId
  label: string
  description: string
  crosswind: boolean
  env: Omit<GameEnv, 'gust'>
  unlockedByDefault: boolean
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'dusk',
    label: 'Dusk — Calm',
    description: 'Golden-hour calm. The flagship scenario — learn the flare sight picture in ideal conditions.',
    crosswind: false,
    env: { crosswind: 0, headwind: 3, daylight: 0.92, rain: 0, fog: 0, turbulence: 0, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: true,
  },
  {
    id: 'crosswind',
    label: 'Dusk — Crosswind',
    description: '7-12 kt crosswind. Crab down final, transition to wing-low in the flare. Demonstrated crosswind for the C172 is 15 kt.',
    crosswind: true,
    env: { crosswind: 10, headwind: 3, daylight: 0.92, rain: 0, fog: 0, turbulence: 0.1, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: true,
  },
  {
    id: 'dawn',
    label: 'Dawn — Calm',
    description: 'Early-morning calm with a low eastern sun. Different light, same technique.',
    crosswind: false,
    env: { crosswind: 0, headwind: 2, daylight: 0.85, rain: 0, fog: 0, turbulence: 0, runwayHeading: '09', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: true,
  },
  {
    id: 'midday',
    label: 'Midday — Calm',
    description: 'Bright midday sun, harsh shadows, less atmospheric color. Read the runway plainly.',
    crosswind: false,
    env: { crosswind: 0, headwind: 4, daylight: 1.0, rain: 0, fog: 0, turbulence: 0, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: true,
  },
  {
    id: 'night',
    label: 'Night — Calm',
    description: 'Full night. Trust your instruments and the runway lights — the horizon is barely visible. A real lesson in instrument discipline.',
    crosswind: false,
    env: { crosswind: 0, headwind: 3, daylight: 0.08, rain: 0, fog: 0, turbulence: 0, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: false,
  },
  {
    id: 'rain',
    label: 'Rain — Wet Runway',
    description: 'Light rain on a wet runway. Specular reflections of the runway lights, duller sky, muted PAPI bloom. Braking distance increases.',
    crosswind: false,
    env: { crosswind: 0, headwind: 5, daylight: 0.55, rain: 0.6, fog: 0.15, turbulence: 0.15, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: false,
  },
  {
    id: 'fog',
    label: 'Fog — Low Visibility',
    description: 'Dense fog. The runway and PAPI are invisible until you are very close. Trust your altitude and airspeed — not what you can see.',
    crosswind: false,
    env: { crosswind: 0, headwind: 2, daylight: 0.7, rain: 0, fog: 0.85, turbulence: 0, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: false,
  },
  {
    id: 'gusty',
    label: 'Gusty — Turbulent',
    description: 'Gusty, turbulent air. The windsock near-max deflection, airframe jitter, variable sink. Manage your energy carefully.',
    crosswind: true,
    env: { crosswind: 8, headwind: 4, daylight: 0.8, rain: 0, fog: 0, turbulence: 0.7, runwayHeading: '27', runwayLength: 4000, surface: 'paved' },
    unlockedByDefault: false,
  },
  {
    id: 'short-field',
    label: 'Short Field — Grass',
    description: 'A shorter grass strip. Soft-field technique: hold nosewheel off, minimize braking, expect a firmer rollout. Touchdown precision matters.',
    crosswind: false,
    env: { crosswind: 0, headwind: 3, daylight: 0.9, rain: 0, fog: 0, turbulence: 0, runwayHeading: '18', runwayLength: 2200, surface: 'grass' },
    unlockedByDefault: false,
  },
]

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]
}

export const FREE_PLAYS_INITIAL = 5
export const UNLOCK_PRICE = 4.99
export const DAILY_SHARE_CAP = 5

// --- C172 reference constants (research-grounded) --------------------------
const KT_TO_FPS = 1.68781
export const STALL_SPEED = 40 // kt Vs0 flaps-down (C172S)
export const STALL_HORN_SPEED = 48 // kt — horn sounds ~5-10kt above stall
export const APPROACH_SPEED = 65 // KIAS, full-flaps final
export const TOUCHDOWN_SPEED_IDEAL = 50 // kt, full-stall touchdown
const FLARE_TARGET_PITCH = 9 // deg, nose-up flare attitude
const APPROACH_PITCH = 2.5 // deg, hands-off approach pitch
const GROUND_EFFECT_BAND = 36 // ft — 1 wingspan, where cushion begins
const GROUND_EFFECT_STRONG = 18 // ft — half-span, strong cushion
const MAX_BOUNCES = 2 // after 2 bounces it's a porpoise — force it down

const PITCH_RESPONSE = 4.0 // 1/s — elevator lag (responsive but not instant)
const DRAG_BASE = 0.4 // kt/s airspeed bleed baseline
const DRAG_PER_PITCH = 0.32 // kt/s extra bleed per deg above approach
const GE_DRAG_RELIEF = 0.6 // kt/s less bleed in strong ground effect

// 3° glideslope: at 65kt groundspeed, sink ≈ 345 fpm
const APPROACH_VS_FPM = -345

export function createInitialState(scenario: Scenario): FlightState {
  const cw = scenario.env.crosswind
  // Start on a stable 3° glideslope tuned so an unflared approach crosses the
  // threshold at ~50ft and touches down ~500ft past it. The flare then adds
  // 300-500ft of float, putting a greaser near the 1000ft aim point.
  return {
    altitude: 115,
    airspeed: APPROACH_SPEED,
    vsi: APPROACH_VS_FPM,
    pitch: APPROACH_PITCH,
    distance: -2000, // 2000 ft before threshold
    lateral: 0,
    crab: cw > 0 ? cw * 1.1 : 0,
    onGround: false,
    stalled: false,
    stallHorn: false,
    bounces: 0,
    airborne: true,
    elapsed: 0,
    ended: false,
    flareHold: 0,
    flareHeld: false,
    flareFirstAlt: null,
    flareFirstTime: null,
    balloonAlt: null,
    lastCalloutAlt: 999,
    result: null,
    phase: 'approach',
    goAround: false,
    rolloutDistance: 0, // ft traveled after touchdown
    rolloutSpeed: 0, // kt at start of rollout
  }
}

export function createEnv(scenario: Scenario): GameEnv {
  return { ...scenario.env, gust: 0 }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Advance the flight one timestep. Returns a new state (shallow-copied).
 */
export function stepFlight(
  prev: FlightState,
  flareInput: boolean,
  dt: number,
  env: GameEnv,
): FlightState {
  if (prev.ended) return prev
  const s: FlightState = { ...prev }

  s.flareHeld = flareInput
  if (flareInput && s.flareFirstAlt === null && s.airborne) {
    s.flareFirstAlt = s.altitude
    s.flareFirstTime = s.elapsed
  }

  // --- Coaching phase tracking (for HUD + callouts) ------------------------
  if (s.distance < -700) s.phase = 'approach'
  else if (s.distance < -50 && s.altitude > 50) s.phase = 'short-final'
  else if (s.distance >= -50 && s.altitude > 20) s.phase = 'over-threshold'
  else if (s.altitude > 0 && s.altitude <= 20) s.phase = 'flare-window'
  if (s.altitude > 0 && s.altitude < 8 && s.flareHeld) s.phase = 'hold-off'
  if (s.onGround) s.phase = 'rollout'

  // --- Pitch (elevator response with lag) ----------------------------------
  const targetPitch = flareInput ? FLARE_TARGET_PITCH : APPROACH_PITCH
  s.pitch += (targetPitch - s.pitch) * Math.min(1, dt * PITCH_RESPONSE)

  // --- Stall horn (5-10kt above stall) -------------------------------------
  s.stallHorn = s.airspeed < STALL_HORN_SPEED && s.altitude < 30

  // --- Stall detection ------------------------------------------------------
  const wasStalled = s.stalled
  s.stalled = s.airspeed < STALL_SPEED
  if (s.stalled && !wasStalled) {
    s.pitch = Math.min(s.pitch, -3) // nose breaks
  }
  if (s.stalled) {
    s.pitch -= 5 * dt // nose keeps falling while stalled
  }

  // --- Vertical dynamics — flare-effort model ------------------------------
  // The aircraft is trimmed to a stable 3° descent. Flaring commands a
  // round-out: pitch above approach + remaining speed arrest the descent
  // toward a gentle sink. Speed bleeds while flaring; holding too long
  // collapses the effort → stall drop. Ground effect cushions near the runway.
  const geFactor =
    s.altitude < GROUND_EFFECT_BAND ? 1 - s.altitude / GROUND_EFFECT_BAND : 0
  const geStrong =
    s.altitude < GROUND_EFFECT_STRONG
      ? 1 - s.altitude / GROUND_EFFECT_STRONG
      : 0
  const speedFactor = clamp(s.airspeed / APPROACH_SPEED, 0, 1.15)
  const flarePitch = Math.max(0, s.pitch - APPROACH_PITCH)
  const flareEffort = s.stalled ? 0 : Math.min(1, flarePitch / 6) * speedFactor

  // Full flare effort → gentle sink of -50 fpm (the "hold-off").
  // No flare → -345 fpm (stable approach). Too-early flare (high+fast) → balloon.
  let targetVS = APPROACH_VS_FPM + flareEffort * (APPROACH_VS_FPM * -1 - 50)
  // Balloon guard: if flaring high with lots of speed, command a climb (capped)
  if (flareEffort > 0.7 && s.altitude > 15 && s.airspeed > 58) {
    targetVS = Math.min(targetVS, 220) // capped balloon
  } else {
    targetVS = Math.min(targetVS, 100)
  }
  // Ground-effect cushion: mild shave near the ground (rewards a held flare,
  // but doesn't save a no-flare fly-on from being firm).
  if (targetVS < 0) targetVS *= 1 - geFactor * 0.18 - geStrong * 0.1
  // Ease actual VS toward target (~0.3s response — crisp but smooth)
  s.vsi += (targetVS - s.vsi) * Math.min(1, dt * 3.4)
  if (s.stalled) s.vsi -= 850 * dt // stall breaks and drops the nose hard
  s.vsi = clamp(s.vsi, -1600, 400)

  // Track balloon peak (climb after a flare high)
  if (s.vsi > 0 && s.altitude > 3) {
    s.balloonAlt = Math.max(s.balloonAlt ?? 0, s.altitude)
  }

  // --- Airspeed (drag bleed, pitch-driven; relieved by ground effect) ------
  let dragBleed = DRAG_BASE + Math.max(0, s.pitch - 2) * DRAG_PER_PITCH
  dragBleed -= geStrong * GE_DRAG_RELIEF
  if (s.stalled) dragBleed *= 0.4
  s.airspeed = clamp(s.airspeed - dragBleed * dt, 0, 160)

  // --- Forward distance (groundspeed) --------------------------------------
  const groundspeedKts = Math.max(0, s.airspeed - env.headwind)
  s.distance += groundspeedKts * KT_TO_FPS * dt

  // --- Crosswind: lateral drift + crab / de-crab ---------------------------
  if (env.crosswind > 0) {
    const cwFps = env.crosswind * KT_TO_FPS
    const drift = cwFps * 0.5 * dt
    // Flare near the ground = de-crab / wing-low correction
    const correcting = flareInput && s.altitude < 45
    if (correcting) {
      s.flareHold += dt
      const correction = cwFps * 0.95 * dt
      s.lateral += drift - correction
      s.crab += (0 - s.crab) * Math.min(1, dt * 1.8) // align to runway
    } else {
      s.lateral += drift
      const fullCrab = env.crosswind * 1.1
      s.crab += (fullCrab - s.crab) * Math.min(1, dt * 0.8)
    }
  }

  // --- Gust + turbulence (FAA AFH Ch.9: gusty conditions require speed addon
  // and active energy management; turbulence causes variable sink) ----------
  const baseGust = Math.sin(s.elapsed / 650) * (env.crosswind > 0 ? 1.6 : 0.7)
  const turbJitter = env.turbulence > 0
    ? (Math.sin(s.elapsed / 180) + Math.sin(s.elapsed / 97)) * env.turbulence * 40
    : 0
  env.gust = baseGust + turbJitter
  // Turbulence adds variable sink (updrafts/downdrafts) to the VSI
  if (env.turbulence > 0 && s.airborne) {
    s.vsi += Math.sin(s.elapsed / 220) * env.turbulence * 60 * dt
  }

  // --- Integrate altitude ---------------------------------------------------
  s.altitude += (s.vsi / 60) * dt

  // --- Touchdown / bounce logic --------------------------------------------
  if (s.altitude <= 0 && s.vsi < 0 && s.airborne) {
    s.altitude = 0
    const touchVSI = s.vsi
    const touchSpeed = s.airspeed
    const offRunway = Math.abs(s.lateral) > 45 // half-width of a 90ft runway
    const veryHard = Math.abs(touchVSI) > 600 // mfr hard-landing inspection
    const noseFirst = s.pitch < -5 && Math.abs(touchVSI) > 350

    const stallDrop = s.stalled

    // Should we bounce? (still fast, moderate-hard, not destructive)
    const canBounce =
      !stallDrop &&
      !offRunway &&
      !veryHard &&
      !noseFirst &&
      touchSpeed > 50 &&
      Math.abs(touchVSI) >= 230 &&
      s.bounces < MAX_BOUNCES

    if (canBounce) {
      // Rebound airborne — a second, harder attempt at the flare
      const rebound = clamp(Math.abs(touchVSI) * 0.022, 4, 14)
      s.altitude = rebound
      s.vsi = Math.abs(touchVSI) * 0.36
      s.airspeed = Math.max(STALL_SPEED + 3, touchSpeed - 5)
      s.bounces += 1
      s.pitch += (Math.random() - 0.5) * 5
      s.pitch = clamp(s.pitch, -3, 12)
      s.onGround = false
    } else {
      // Final touchdown — evaluate, then enter rollout phase (§1.4).
      // The flight doesn't end instantly; the pilot must hold the nosewheel
      // off and maintain directional control during deceleration.
      s.onGround = true
      s.airborne = false
      s.vsi = touchVSI
      s.result = evaluateLanding(s, env, touchVSI, touchSpeed)
      s.rolloutSpeed = touchSpeed
      s.rolloutDistance = 0
      s.phase = 'rollout'
    }
  }

  // --- Rollout phase (§1.4) -------------------------------------------------
  // After touchdown, the aircraft decelerates. Holding flare input keeps the
  // nosewheel up (matching the coaching tip "hold the nosewheel off with back
  // pressure until it settles"). Crosswind still pushes laterally — stop
  // correcting and you drift toward the edge. The flight ends when the
  // aircraft slows to taxi speed (~15 kt) or runs out of runway.
  if (s.onGround && !s.ended) {
    s.phase = 'rollout'
    // Deceleration: grass has more rolling friction (shorter rollout)
    const friction = env.surface === 'grass' ? 0.20 : 0.14 // kt/s²
    s.airspeed = Math.max(0, s.airspeed - friction * 60 * dt)
    // Holding flare keeps nose up — pitch eases toward 0 but slower if held
    const noseDropRate = flareInput ? 1.0 : 2.5
    s.pitch += (0 - s.pitch) * Math.min(1, dt * noseDropRate)
    // Distance covered during rollout
    const gsKts = Math.max(0, s.airspeed - env.headwind)
    s.distance += gsKts * KT_TO_FPS * dt
    s.rolloutDistance += gsKts * KT_TO_FPS * dt
    // Crosswind still pushes — if you stop correcting, you drift
    if (env.crosswind > 0) {
      const cwFps = env.crosswind * KT_TO_FPS
      const correcting = flareInput && s.airspeed > 20
      const drift = cwFps * 0.3 * dt * (s.airspeed / 50)
      if (correcting) {
        s.lateral += drift - cwFps * 0.6 * dt
      } else {
        s.lateral += drift
      }
    }
    // End the rollout when slow enough or runway ends
    const runwayEnd = env.runwayLength
    if (s.airspeed < 15 || s.distance > runwayEnd) {
      s.ended = true
    }
  }

  // Safety clamp
  if (s.altitude < 0) s.altitude = 0

  s.elapsed += dt * 1000
  return s
}

export function evaluateLanding(
  s: FlightState,
  env: GameEnv,
  touchVSI: number,
  touchSpeed: number,
): LandingResult {
  const offRunway = Math.abs(s.lateral) > 45
  const veryHard = Math.abs(touchVSI) > 600
  const noseFirst = s.pitch < -5 && Math.abs(touchVSI) > 350
  const landedShort = s.distance < 0

  // Stable approach check (at the 500ft crossing, inferred from telemetry isn't
  // available here, so approximate: stable if approach speed held within ±8kt
  // and sink stayed moderate). The trainer passes stableAt500 separately.

  // Flare timing classification
  let flareTiming: 'early' | 'ideal' | 'late' | 'none' = 'none'
  if (s.flareFirstAlt !== null) {
    if (s.flareFirstAlt > 25) flareTiming = 'early'
    else if (s.flareFirstAlt >= 8) flareTiming = 'ideal'
    else flareTiming = 'late'
  }

  // Quality classification — priority order matters
  let quality: LandingQuality
  if (s.stalled && s.airspeed < STALL_SPEED + 3) quality = 'stall'
  else if (offRunway) quality = 'crash'
  else if (veryHard || noseFirst) quality = 'crash'
  else if (landedShort) quality = 'short'
  else if (s.bounces >= 2) quality = 'porpoise'
  else if (s.bounces === 1) quality = 'bounce'
  else if ((s.balloonAlt ?? 0) > 12 && flareTiming === 'early') quality = 'balloon'
  else if (Math.abs(touchVSI) < 100 && Math.abs(s.lateral) < 12 && Math.abs(s.crab) < 6)
    quality = 'greaser'
  else if (Math.abs(touchVSI) < 200) quality = 'good'
  else if (Math.abs(touchVSI) < 300) quality = 'firm'
  else if (Math.abs(touchVSI) < 450) quality = 'hard'
  else quality = 'crash'

  const score = computeScore({
    touchVSI,
    touchSpeed,
    distance: s.distance,
    lateral: s.lateral,
    crab: s.crab,
    bounces: s.bounces,
    stalled: s.stalled,
    quality,
    offRunway,
    flareTiming,
    balloon: s.balloonAlt ?? 0,
  })

  return {
    quality,
    score,
    touchdownVSI: touchVSI,
    touchdownAirspeed: touchSpeed,
    touchdownDistance: s.distance,
    touchdownLateral: s.lateral,
    touchdownCrab: s.crab,
    touchdownPitch: s.pitch,
    flareAltitude: s.flareFirstAlt ?? 0,
    flareTiming,
    bounces: s.bounces,
    stalled: s.stalled,
    crosswind: env.crosswind > 0,
    duration: s.elapsed,
    stableAt500: null, // filled by trainer from telemetry
    maxBalloon: s.balloonAlt ?? 0,
  }
}

function computeScore(p: {
  touchVSI: number
  touchSpeed: number
  distance: number
  lateral: number
  crab: number
  bounces: number
  stalled: boolean
  quality: LandingQuality
  offRunway: boolean
  flareTiming: 'early' | 'ideal' | 'late' | 'none'
  balloon: number
}): number {
  let score = 100

  // Touchdown sink rate (the dominant factor)
  const absVsi = Math.abs(p.touchVSI)
  if (absVsi < 100) score += 4 // bonus for a true greaser
  else score -= (absVsi - 100) * 0.18

  // Touchdown speed (ideal ~50kt)
  score -= Math.abs(p.touchSpeed - 50) * 1.2

  // Touchdown distance (ideal 200-800 ft past threshold; PPL ACS ±400ft of point)
  if (p.distance < 0) score -= 35 // landed before threshold — dangerous
  else if (p.distance > 2500) score -= 30 // ran off the end
  else {
    score -= Math.max(0, 200 - p.distance) * 0.04
    score -= Math.max(0, p.distance - 1000) * 0.03
  }

  // Lateral / crab (sideload)
  score -= Math.abs(p.lateral) * 0.4
  score -= Math.abs(p.crab) * 1.3

  // Bounces
  score -= p.bounces * 12

  // Stall
  if (p.stalled) score -= 38

  // Off runway
  if (p.offRunway) score -= 40

  // Balloon penalty
  if (p.balloon > 12) score -= (p.balloon - 12) * 1.5

  // Flare timing bonus/penalty
  if (p.flareTiming === 'ideal') score += 3
  else if (p.flareTiming === 'early') score -= 6
  else if (p.flareTiming === 'late') score -= 4
  else if (p.flareTiming === 'none') score -= 8

  // Quality floor — a crash should never read as "decent"
  const floors: Record<LandingQuality, number> = {
    greaser: 92,
    good: 76,
    firm: 60,
    hard: 42,
    bounce: 34,
    porpoise: 20,
    balloon: 36,
    stall: 10,
    short: 12,
    crash: 0,
  }
  score = Math.min(score, 100)
  score = Math.max(score, floors[p.quality])
  return Math.round(clamp(score, 0, 100))
}

export const QUALITY_LABELS: Record<LandingQuality, string> = {
  greaser: 'Greaser!',
  good: 'Smooth Landing',
  firm: 'Firm Landing',
  hard: 'Hard Landing',
  bounce: 'Bounced',
  porpoise: 'Porpoise',
  stall: 'Stall Drop',
  balloon: 'Ballooned',
  short: 'Landed Short',
  crash: 'Crash',
}

export const QUALITY_COLORS: Record<LandingQuality, string> = {
  greaser: '#F2B134',
  good: '#3E92CC',
  firm: '#6fb1e6',
  hard: '#e0a04a',
  bounce: '#cf8a4a',
  porpoise: '#cf5b53',
  stall: '#e0584f',
  balloon: '#cf7a4a',
  short: '#b06a4a',
  crash: '#b3372f',
}

export const QUALITY_BLURBS: Record<LandingQuality, string> = {
  greaser: 'Passengers applauded. Wheels barely kissed the runway.',
  good: 'A clean, repeatable landing. Your instructor nods.',
  firm: 'Positive contact. A little more round-out next time.',
  hard: 'A firm thump — you\'ll feel it in the airframe.',
  bounce: 'You ballooned and came back. Recoverable, but costly.',
  porpoise: 'Pitch oscillation — go around would\'ve saved it.',
  stall: 'You stalled it onto the runway. Nose dropped hard.',
  balloon: 'You pulled too early and climbed away — a balloon.',
  short: 'You touched down before the threshold — unsafe.',
  crash: 'Off the runway or far too hard. Walk away, debrief, retry.',
}

// --- Telemetry sampling -----------------------------------------------------
export function frameFromState(s: FlightState): TelemetryFrame {
  return {
    t: Math.round(s.elapsed),
    altitude: s.altitude,
    airspeed: s.airspeed,
    vsi: s.vsi,
    pitch: s.pitch,
    distance: s.distance,
    lateral: s.lateral,
    crab: s.crab,
    flare: s.flareHeld,
    onGround: s.onGround,
    stalled: s.stalled,
    bounces: s.bounces,
    phase: s.phase,
  }
}

// --- Radar-altitude callout thresholds (GPWS Mode-6 style) ------------------
export const RADAR_CALLOUTS = [50, 40, 30, 20, 10] as const

/**
 * Returns the next callout to fire given the current altitude and the last
 * callout altitude already fired. Returns null if none.
 */
export function nextRadarCallout(altitude: number, lastFired: number): number | null {
  for (const c of RADAR_CALLOUTS) {
    if (altitude <= c && lastFired > c) return c
  }
  return null
}
