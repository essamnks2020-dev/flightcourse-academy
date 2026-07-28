import { checklists } from "@/lib/content/checklists"

/* ---------------------------------------------------------------------------
 * Shared round shapes. Generators are pure apart from Math.random, and are
 * only ever called on the client after the player presses Start — that keeps
 * the server render deterministic and avoids hydration mismatches.
 * ------------------------------------------------------------------------- */

export type InstrumentSpec =
  | { kind: "altimeter"; altitude: number }
  | { kind: "heading"; heading: number }
  | { kind: "airspeed"; knots: number }
  | { kind: "attitude"; pitch: number; bank: number }
  | { kind: "vsi"; fpm: number }

export interface QuickfireRound {
  /** The question. */
  prompt: string
  /** Optional fixed-width payload rendered above the prompt (e.g. a METAR). */
  payload?: string
  /** Optional live instrument to read. */
  instrument?: InstrumentSpec
  options: string[]
  correctIndex: number
  explanation: string
}

export interface OrderingRound {
  title: string
  context: string
  /** Correct sequence, top to bottom. */
  steps: string[]
}

/* ---------------------------------------------------------------------------
 * Randomness helpers
 * ------------------------------------------------------------------------- */

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const pick = <T,>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)]

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Builds a 4-option multiple choice from one correct answer plus candidate
 * distractors, de-duplicated and shuffled. Returns the shuffled options and
 * the new index of the correct answer.
 */
function choices(
  correct: string,
  candidates: string[],
): { options: string[]; correctIndex: number } {
  const seen = new Set([correct])
  const distractors: string[] = []
  for (const c of candidates) {
    if (distractors.length === 3) break
    if (seen.has(c)) continue
    seen.add(c)
    distractors.push(c)
  }
  const options = shuffle([correct, ...distractors])
  return { options, correctIndex: options.indexOf(correct) }
}

/* ---------------------------------------------------------------------------
 * Formatting
 * ------------------------------------------------------------------------- */

const ft = (n: number) => `${n.toLocaleString("en-US")} ft`
const deg = (n: number) => `${String(((n % 360) + 360) % 360).padStart(3, "0")}°`
const kt = (n: number) => `${n} kt`
const fpm = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("en-US")} fpm`

const norm = (h: number) => ((Math.round(h) % 360) + 360) % 360

/* ---------------------------------------------------------------------------
 * Game 1 — Six-Pack Rush: read a live instrument.
 * ------------------------------------------------------------------------- */

function altimeterRound(): QuickfireRound {
  // Multiples of 100 ft keep the hundreds needle on a tick mark.
  const altitude = randInt(2, 97) * 100
  const { options, correctIndex } = choices(ft(altitude), [
    ft(altitude + 1000),
    ft(Math.max(0, altitude - 1000)),
    ft(altitude + 100),
    ft(Math.max(0, altitude - 200)),
  ])
  return {
    prompt: "What altitude is indicated?",
    instrument: { kind: "altimeter", altitude },
    options,
    correctIndex,
    explanation: `Short needle = thousands, long needle = hundreds. Short is just past ${Math.floor(
      altitude / 1000,
    )}, long is on ${(altitude % 1000) / 100}, so ${ft(altitude)}.`,
  }
}

function headingRound(): QuickfireRound {
  const heading = randInt(0, 71) * 5
  const { options, correctIndex } = choices(deg(heading), [
    deg(heading + 180),
    deg(heading + 30),
    deg(heading - 30),
    deg(heading + 10),
  ])
  return {
    prompt: "What heading is the aircraft on?",
    instrument: { kind: "heading", heading },
    options,
    correctIndex,
    explanation: `The compass card rotates under a fixed lubber line at the top — read the number there: ${deg(
      heading,
    )}.`,
  }
}

function airspeedRound(): QuickfireRound {
  const knots = randInt(8, 32) * 5
  const { options, correctIndex } = choices(kt(knots), [
    kt(knots + 10),
    kt(knots - 10),
    kt(knots + 20),
    kt(knots - 5),
  ])
  return {
    prompt: "What is the indicated airspeed?",
    instrument: { kind: "airspeed", knots },
    options,
    correctIndex,
    explanation: `Each labelled tick is 20 kt with a minor tick every 10 kt. The needle reads ${kt(
      knots,
    )}.`,
  }
}

function attitudeRound(): QuickfireRound {
  const bankMag = pick([10, 15, 20, 30, 45])
  const left = Math.random() < 0.5
  const bank = left ? -bankMag : bankMag
  const pitch = pick([-10, -5, 0, 5, 10])
  const answer = `${bankMag}° ${left ? "left" : "right"}`
  const { options, correctIndex } = choices(answer, [
    `${bankMag}° ${left ? "right" : "left"}`,
    `${bankMag === 45 ? 30 : bankMag + 10}° ${left ? "left" : "right"}`,
    `${Math.max(10, bankMag - 10)}° ${left ? "right" : "left"}`,
    `${bankMag === 10 ? 20 : bankMag - 5}° ${left ? "left" : "right"}`,
  ])
  return {
    prompt: "How far, and which way, is the aircraft banked?",
    instrument: { kind: "attitude", pitch, bank },
    options,
    correctIndex,
    explanation: `The sky pointer at the top of the bezel sits on the ${
      left ? "left" : "right"
    } ${bankMag}° index. The wings stay level on the display; the horizon tilts the other way.`,
  }
}

function vsiRound(): QuickfireRound {
  const value = pick([-1500, -1000, -800, -500, -200, 200, 500, 800, 1000, 1500])
  const { options, correctIndex } = choices(fpm(value), [
    fpm(-value),
    fpm(value > 0 ? value + 500 : value - 500),
    fpm(value > 0 ? Math.max(200, value - 300) : Math.min(-200, value + 300)),
    fpm(value * 2),
  ])
  return {
    prompt: "What vertical speed is indicated?",
    instrument: { kind: "vsi", fpm: value },
    options,
    correctIndex,
    explanation: `Up is climb, down is descent. Each labelled ring is 500 fpm, so this is ${fpm(
      value,
    )}.`,
  }
}

export function sixPackRound(): QuickfireRound {
  return pick([
    altimeterRound,
    altimeterRound, // altimeter reading is the hardest, so weight it twice
    headingRound,
    airspeedRound,
    attitudeRound,
    vsiRound,
  ])()
}

/* ---------------------------------------------------------------------------
 * Game 2 — Phonetic Drill
 * ------------------------------------------------------------------------- */

const alphabet: Record<string, string> = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
}

const letters = Object.keys(alphabet)
const words = Object.values(alphabet)

const digits: Record<string, string> = {
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Tree",
  "4": "Fower",
  "5": "Fife",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Niner",
}

export function phoneticRound(): QuickfireRound {
  const style = randInt(1, 4)

  if (style === 1) {
    const letter = pick(letters)
    const { options, correctIndex } = choices(
      alphabet[letter],
      shuffle(words).slice(0, 6),
    )
    return {
      prompt: `How do you say the letter "${letter}" on the radio?`,
      options,
      correctIndex,
      explanation: `${letter} is "${alphabet[letter]}".`,
    }
  }

  if (style === 2) {
    const letter = pick(letters)
    const { options, correctIndex } = choices(
      letter,
      shuffle(letters).slice(0, 6),
    )
    return {
      prompt: `Which letter is "${alphabet[letter]}"?`,
      options,
      correctIndex,
      explanation: `"${alphabet[letter]}" is ${letter}.`,
    }
  }

  if (style === 3) {
    const digit = pick(Object.keys(digits).filter((d) => "34579".includes(d)))
    const { options, correctIndex } = choices(
      digits[digit],
      shuffle(Object.values(digits)).slice(0, 6),
    )
    return {
      prompt: `On the radio, the digit "${digit}" is spoken as…`,
      options,
      correctIndex,
      explanation: `Aviation English changes the ambiguous digits: 3 is "Tree", 4 "Fower", 5 "Fife", 9 "Niner". ${digit} is "${digits[digit]}".`,
    }
  }

  // Full three-letter group read-back, with one word swapped in each distractor.
  const group = shuffle(letters).slice(0, 3)
  const correct = group.map((l) => alphabet[l]).join(" ")
  const swapAt = (i: number) => {
    const copy = group.map((l) => alphabet[l])
    const replacement = words.find((w) => !copy.includes(w)) as string
    copy[i] = replacement
    return copy.join(" ")
  }
  const { options, correctIndex } = choices(correct, [
    swapAt(0),
    swapAt(1),
    swapAt(2),
    group
      .map((l) => alphabet[l])
      .reverse()
      .join(" "),
  ])
  return {
    prompt: `Read back the registration suffix "${group.join("")}".`,
    options,
    correctIndex,
    explanation: `${group.join("")} is "${correct}" — in that order, no extra words.`,
  }
}

/* ---------------------------------------------------------------------------
 * Game 3 — METAR Decoder
 * ------------------------------------------------------------------------- */

const stations = [
  "KSEA",
  "KPDX",
  "KBFI",
  "KAPA",
  "EGLL",
  "EGCC",
  "CYYZ",
  "KJFK",
  "KSFO",
  "KDEN",
]

const weatherCodes: Record<string, string> = {
  "-RA": "light rain",
  RA: "rain",
  "+RA": "heavy rain",
  "-SN": "light snow",
  BR: "mist",
  FG: "fog",
  TSRA: "thunderstorm with rain",
  HZ: "haze",
}

interface Metar {
  raw: string
  station: string
  windDir: number
  windSpeed: number
  gust: number | null
  visibility: number
  weather: string | null
  ceiling: number | null
  ceilingCover: string | null
  temp: number
  dewpoint: number
  altimeter: string
  category: "VFR" | "MVFR" | "IFR" | "LIFR"
}

function flightCategory(vis: number, ceiling: number | null): Metar["category"] {
  const c = ceiling ?? 99_000
  if (vis < 1 || c < 500) return "LIFR"
  if (vis < 3 || c < 1000) return "IFR"
  if (vis <= 5 || c <= 3000) return "MVFR"
  return "VFR"
}

function buildMetar(): Metar {
  const station = pick(stations)
  const day = randInt(1, 28)
  const hour = randInt(0, 23)
  const minute = pick([15, 25, 35, 53, 56])

  const windDir = randInt(1, 36) * 10
  const windSpeed = randInt(3, 25)
  const gust = Math.random() < 0.4 ? windSpeed + randInt(6, 14) : null

  const visibility = pick([0.5, 1, 2, 3, 4, 5, 6, 10, 10, 10])
  const weather = Math.random() < 0.55 ? pick(Object.keys(weatherCodes)) : null

  const layer = pick([
    null,
    { cover: "FEW", base: randInt(30, 90) * 100 },
    { cover: "SCT", base: randInt(25, 70) * 100 },
    { cover: "BKN", base: randInt(4, 30) * 100 },
    { cover: "OVC", base: randInt(3, 20) * 100 },
  ])
  // Only BKN/OVC counts as a ceiling.
  const ceiling =
    layer && (layer.cover === "BKN" || layer.cover === "OVC")
      ? layer.base
      : null

  const temp = randInt(-8, 32)
  const dewpoint = temp - randInt(0, 9)
  const inHg = (randInt(2952, 3032) / 100).toFixed(2)
  const altimeter = `A${inHg.replace(".", "")}`

  const visText =
    visibility === 0.5 ? "1/2SM" : `${visibility.toString().replace(".0", "")}SM`

  const raw = [
    station,
    `${String(day).padStart(2, "0")}${String(hour).padStart(2, "0")}${minute}Z`,
    `${String(windDir === 360 ? 360 : windDir).padStart(3, "0")}${String(
      windSpeed,
    ).padStart(2, "0")}${gust ? `G${gust}` : ""}KT`,
    visText,
    weather ?? "",
    layer ? `${layer.cover}${String(layer.base / 100).padStart(3, "0")}` : "SKC",
    `${temp < 0 ? `M${String(Math.abs(temp)).padStart(2, "0")}` : String(temp).padStart(2, "0")}/${
      dewpoint < 0
        ? `M${String(Math.abs(dewpoint)).padStart(2, "0")}`
        : String(dewpoint).padStart(2, "0")
    }`,
    altimeter,
  ]
    .filter(Boolean)
    .join(" ")

  return {
    raw,
    station,
    windDir,
    windSpeed,
    gust,
    visibility,
    weather: weather ? weatherCodes[weather] : null,
    ceiling,
    ceilingCover: layer && ceiling ? layer.cover : null,
    temp,
    dewpoint,
    altimeter: inHg,
    category: flightCategory(visibility, ceiling),
  }
}

export function metarRound(): QuickfireRound {
  const m = buildMetar()
  const style = randInt(1, 5)

  if (style === 1) {
    const answer = `From ${deg(m.windDir)} at ${kt(m.windSpeed)}`
    const { options, correctIndex } = choices(answer, [
      `Toward ${deg(m.windDir)} at ${kt(m.windSpeed)}`,
      `From ${deg(m.windDir + 180)} at ${kt(m.windSpeed)}`,
      `From ${deg(m.windDir)} at ${kt(m.windSpeed + 10)}`,
      `From ${deg(m.windDir - 20)} at ${kt(m.windSpeed)}`,
    ])
    return {
      prompt: "What is the surface wind doing?",
      payload: m.raw,
      options,
      correctIndex,
      explanation: `The wind group reads direction-then-speed, and it is always the direction the wind is coming FROM: ${deg(
        m.windDir,
      )} at ${kt(m.windSpeed)}${m.gust ? `, gusting ${m.gust} kt` : ""}.`,
    }
  }

  if (style === 2) {
    const answer = m.ceiling ? ft(m.ceiling) : "No ceiling reported"
    const { options, correctIndex } = choices(answer, [
      m.ceiling ? ft(m.ceiling * 10) : ft(1200),
      m.ceiling ? ft(m.ceiling + 1000) : "Ceiling 3,000 ft",
      "No ceiling reported",
      m.ceiling ? ft(Math.max(200, m.ceiling - 500)) : ft(500),
    ])
    return {
      prompt: "What is the ceiling?",
      payload: m.raw,
      options,
      correctIndex,
      explanation: m.ceiling
        ? `${m.ceilingCover}${String(m.ceiling / 100).padStart(
            3,
            "0",
          )} means ${m.ceilingCover} at ${ft(
            m.ceiling,
          )} — cloud heights are in hundreds of feet, and only BKN or OVC counts as a ceiling.`
        : "Nothing broken or overcast is reported, so there is no ceiling. FEW and SCT layers never form a ceiling.",
    }
  }

  if (style === 3) {
    const answer = m.category
    const { options, correctIndex } = choices(answer, ["VFR", "MVFR", "IFR", "LIFR"])
    return {
      prompt: "Which flight category is this?",
      payload: m.raw,
      options,
      correctIndex,
      explanation: `Visibility ${m.visibility} SM with ${
        m.ceiling ? `a ${ft(m.ceiling)} ceiling` : "no ceiling"
      } is ${m.category}. VFR needs better than 5 SM and above 3,000 ft; MVFR is 3–5 SM or 1,000–3,000 ft; IFR is 1–3 SM or 500–999 ft; below that is LIFR.`,
    }
  }

  if (style === 4) {
    const answer = `${m.temp}°C / ${m.dewpoint}°C`
    const spread = m.temp - m.dewpoint
    const { options, correctIndex } = choices(answer, [
      `${m.dewpoint}°C / ${m.temp}°C`,
      `${m.temp}°F / ${m.dewpoint}°F`,
      `${m.temp + 2}°C / ${m.dewpoint - 1}°C`,
      `${m.temp}°C / ${m.temp}°C`,
    ])
    return {
      prompt: "What are the temperature and dewpoint?",
      payload: m.raw,
      options,
      correctIndex,
      explanation: `Temperature first, dewpoint second, both in Celsius (M = minus). The ${spread}°C spread ${
        spread <= 2
          ? "is tight — expect mist or fog forming."
          : "is comfortable, so fog is unlikely right now."
      }`,
    }
  }

  const answer = `${m.altimeter} inHg`
  const { options, correctIndex } = choices(answer, [
    `${(Number(m.altimeter) + 0.1).toFixed(2)} inHg`,
    `${(Number(m.altimeter) - 0.1).toFixed(2)} inHg`,
    `${m.altimeter.replace(".", "")} hPa`,
    `${(Number(m.altimeter) + 1).toFixed(2)} inHg`,
  ])
  return {
    prompt: "What should you set in the altimeter window?",
    payload: m.raw,
    options,
    correctIndex,
    explanation: `A${m.altimeter.replace(
      ".",
      "",
    )} is ${m.altimeter} inches of mercury — the "A" group drops the decimal point.`,
  }
}

/* ---------------------------------------------------------------------------
 * Game 4 — Pattern Planner
 * ------------------------------------------------------------------------- */

const runwayIdent = (heading: number) => {
  const n = Math.round(norm(heading) / 10)
  return String(n === 0 ? 36 : n).padStart(2, "0")
}

export function patternRound(): QuickfireRound {
  const runwayHeading = randInt(1, 36) * 10
  const rwy = runwayIdent(runwayHeading)
  const reciprocal = norm(runwayHeading + 180)
  const style = randInt(1, 4)

  if (style === 1) {
    const answer = deg(reciprocal)
    const { options, correctIndex } = choices(answer, [
      deg(runwayHeading),
      deg(reciprocal + 90),
      deg(reciprocal - 90),
      deg(reciprocal + 30),
    ])
    return {
      prompt: `You are in the circuit for runway ${rwy}. What heading do you fly on downwind?`,
      options,
      correctIndex,
      explanation: `Downwind is the reciprocal of the runway: ${deg(
        runwayHeading,
      )} + 180 = ${deg(reciprocal)}.`,
    }
  }

  if (style === 2) {
    const crosswindSide = Math.random() < 0.5 ? -1 : 1
    const offset = pick([60, 70, 80, 90]) * crosswindSide
    const windDir = norm(runwayHeading + offset)
    const answer = crosswindSide < 0 ? "Left crosswind" : "Right crosswind"
    const { options, correctIndex } = choices(answer, [
      crosswindSide < 0 ? "Right crosswind" : "Left crosswind",
      "Direct headwind",
      "Direct tailwind",
    ])
    return {
      prompt: `Runway ${rwy}, surface wind ${deg(windDir)} at ${kt(
        randInt(8, 18),
      )}. Which way will it push you on the roll?`,
      options,
      correctIndex,
      explanation: `The wind is ${Math.abs(offset)}° to the ${
        crosswindSide < 0 ? "left" : "right"
      } of the runway heading, so it blows from the ${
        crosswindSide < 0 ? "left" : "right"
      } — hold ${crosswindSide < 0 ? "left" : "right"} aileron into it.`,
    }
  }

  if (style === 3) {
    const speed = randInt(10, 24)
    const angle = pick([30, 45, 60, 90])
    const side = Math.random() < 0.5 ? -1 : 1
    const windDir = norm(runwayHeading + angle * side)
    const exact = speed * Math.sin((angle * Math.PI) / 180)
    const answer = `About ${Math.round(exact)} kt`
    const { options, correctIndex } = choices(answer, [
      `About ${Math.round(speed * Math.cos((angle * Math.PI) / 180))} kt`,
      `About ${speed} kt`,
      `About ${Math.max(1, Math.round(exact) - 5)} kt`,
      `About ${Math.round(exact) + 6} kt`,
    ])
    return {
      prompt: `Runway ${rwy}, wind ${deg(windDir)} at ${kt(
        speed,
      )}. What is the crosswind component?`,
      options,
      correctIndex,
      explanation: `The wind is ${angle}° off the nose. Crosswind = speed × sin(angle) ≈ ${speed} × ${Math.sin(
        (angle * Math.PI) / 180,
      ).toFixed(2)} ≈ ${Math.round(exact)} kt. The rule of thumb: 30° ≈ ½, 45° ≈ ⅔, 60°+ ≈ all of it.`,
    }
  }

  // Which runway end should you use?
  const windDir = randInt(1, 36) * 10
  const headwindOnRwy = Math.cos(((windDir - runwayHeading) * Math.PI) / 180)
  const better = headwindOnRwy >= 0 ? rwy : runwayIdent(reciprocal)
  const worse = headwindOnRwy >= 0 ? runwayIdent(reciprocal) : rwy
  const { options, correctIndex } = choices(`Runway ${better}`, [
    `Runway ${worse}`,
    "Either — the wind is straight across",
    `Runway ${runwayIdent(norm(runwayHeading + 90))}`,
  ])
  return {
    prompt: `The field has runways ${rwy}/${runwayIdent(
      reciprocal,
    )}. Wind is ${deg(windDir)} at ${kt(randInt(8, 20))}. Which end do you use?`,
    options,
    correctIndex,
    explanation: `Take off and land into wind. The wind from ${deg(
      windDir,
    )} gives a headwind component on runway ${better}, and a tailwind on ${worse}.`,
  }
}

/* ---------------------------------------------------------------------------
 * Game 5 — Checklist Scramble (ordering). Built from the real C172 flows so
 * the game and the reference pages can never drift apart.
 * ------------------------------------------------------------------------- */

const orderingPool: OrderingRound[] = checklists.flatMap((list) =>
  list.sections
    .filter((s) => s.items.length >= 4)
    .map((s) => ({
      title: s.name,
      context: list.title,
      steps: s.items.slice(0, 6).map((i) => i.text),
    })),
)

export function orderingRounds(count: number): OrderingRound[] {
  return shuffle(orderingPool).slice(0, count)
}

/* ---------------------------------------------------------------------------
 * Registry
 * ------------------------------------------------------------------------- */

export const quickfireGenerators: Record<string, () => QuickfireRound> = {
  "six-pack-rush": sixPackRound,
  "phonetic-drill": phoneticRound,
  "metar-decoder": metarRound,
  "pattern-planner": patternRound,
}

/** Generates a run of rounds, avoiding back-to-back duplicate prompts. */
export function generateRun(slug: string, count: number): QuickfireRound[] {
  const gen = quickfireGenerators[slug]
  if (!gen) return []
  const out: QuickfireRound[] = []
  let guard = 0
  while (out.length < count && guard < count * 30) {
    guard++
    const round = gen()
    const key = `${round.prompt}|${round.payload ?? ""}|${round.options[round.correctIndex]}`
    if (out.some((r) => `${r.prompt}|${r.payload ?? ""}|${r.options[r.correctIndex]}` === key)) {
      continue
    }
    out.push(round)
  }
  return out
}
