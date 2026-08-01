/**
 * Mini-game catalogue. Each game drills one perishable cockpit skill that a
 * quiz can't really test: reading a dial fast, saying a callsign, remembering
 * a flow in order.
 */

export type GameMode = "quickfire" | "ordering"

export interface GameDef {
  slug: string
  name: string
  tagline: string
  description: string
  /** Short skill label shown on the card. */
  skill: string
  mode: GameMode
  tier: "free" | "pro"
  /** Rounds per run. */
  rounds: number
  /** Seconds allowed for the whole run. */
  seconds: number
  /** XP granted the first time the pass mark is reached. */
  xpReward: number
  /** Percentage of correct answers needed to pass. */
  passMark: number
  /** Module this game reinforces, for the "learn it first" link. */
  relatedModuleId: number
  accent: "primary" | "accent" | "success"
}

export const games: GameDef[] = [
  {
    slug: "six-pack-rush",
    name: "Six-Pack Rush",
    tagline: "Read the dial before it reads you.",
    description:
      "A live instrument appears — altimeter, heading indicator, airspeed or attitude — and you have seconds to say what it shows. This is the single highest-value habit in instrument flying: getting a number off a gauge without staring at it.",
    skill: "Instrument scan",
    mode: "quickfire",
    tier: "free",
    rounds: 12,
    seconds: 120,
    xpReward: 8,
    passMark: 70,
    relatedModuleId: 3,
    accent: "accent",
  },
  {
    slug: "phonetic-drill",
    name: "Phonetic Drill",
    tagline: "Say it the way the controller expects.",
    description:
      "Letters, numbers and short callsigns come at you in both directions: spell it out, or decode what you just heard. Radio work stops being scary the moment the alphabet is automatic.",
    skill: "Radio phraseology",
    mode: "quickfire",
    tier: "free",
    rounds: 15,
    seconds: 100,
    xpReward: 6,
    passMark: 80,
    relatedModuleId: 11,
    accent: "primary",
  },
  {
    slug: "metar-decoder",
    name: "METAR Decoder",
    tagline: "Turn the wall of letters into a forecast.",
    description:
      "Real-format METARs, generated fresh every round. Pull out the wind, the visibility, the ceiling and the one detail that decides whether you're flying VFR or not.",
    skill: "Weather reading",
    mode: "quickfire",
    tier: "free",
    rounds: 10,
    seconds: 180,
    xpReward: 10,
    passMark: 70,
    relatedModuleId: 13,
    accent: "accent",
  },
  {
    slug: "pattern-planner",
    name: "Pattern Planner",
    tagline: "Runway, wind, circuit — in your head.",
    description:
      "Given a runway and the surface wind, work out the downwind heading, the crosswind component and which end you should actually be using. Pure mental arithmetic under a clock, exactly like a busy circuit.",
    skill: "Circuit geometry",
    mode: "quickfire",
    tier: "pro",
    rounds: 10,
    seconds: 150,
    xpReward: 12,
    passMark: 70,
    relatedModuleId: 9,
    accent: "primary",
  },
  {
    slug: "checklist-scramble",
    name: "Checklist Scramble",
    tagline: "Put the flow back in order.",
    description:
      "A real C172 flow arrives shuffled. Tap the steps in the correct sequence — get one out of order and you'll see exactly why the order matters. Flows live in muscle memory, not on paper.",
    skill: "Procedural flows",
    mode: "ordering",
    tier: "pro",
    rounds: 5,
    seconds: 240,
    xpReward: 12,
    passMark: 60,
    relatedModuleId: 6,
    accent: "success",
  },
]

export const gameBySlug = new Map(games.map((g) => [g.slug, g]))
export const freeGameCount = games.filter((g) => g.tier === "free").length
export const totalGameXp = games.reduce((sum, g) => sum + g.xpReward, 0)
