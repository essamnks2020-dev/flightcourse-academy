import { courseModules, totalXp } from "@/lib/content/course"
import { games } from "@/lib/content/games"

/* ---------------------------------------------------------------------------
 * Ranks. Progression mirrors a real pilot career ladder, which gives learners
 * an identity to grow into rather than an abstract number.
 * ------------------------------------------------------------------------- */

export interface Rank {
  slug: string
  name: string
  minXp: number
  blurb: string
}

export const ranks: Rank[] = [
  {
    slug: "cadet",
    name: "Cadet",
    minXp: 0,
    blurb: "Wheels still firmly on the ground.",
  },
  {
    slug: "student-pilot",
    name: "Student Pilot",
    minXp: 30,
    blurb: "You can start an aircraft and taxi without embarrassment.",
  },
  {
    slug: "solo-pilot",
    name: "Solo Pilot",
    minXp: 70,
    blurb: "Takeoffs and basic handling are yours.",
  },
  {
    slug: "private-pilot",
    name: "Private Pilot",
    minXp: 115,
    blurb: "You can fly a circuit and put it back on the runway.",
  },
  {
    slug: "cross-country",
    name: "Cross-Country Pilot",
    minXp: 165,
    blurb: "Navigation, radio and weather are under control.",
  },
  {
    slug: "instrument-rated",
    name: "Instrument Rated",
    minXp: 215,
    blurb: "Cloud no longer ends your flight.",
  },
  {
    slug: "captain",
    name: "Captain",
    minXp: 260,
    blurb: "Full syllabus complete. Left seat is yours.",
  },
]

export function rankForXp(xp: number): Rank {
  let current = ranks[0]
  for (const rank of ranks) if (xp >= rank.minXp) current = rank
  return current
}

export function nextRankForXp(xp: number): Rank | null {
  return ranks.find((r) => r.minXp > xp) ?? null
}

export function rankProgress(xp: number): number {
  const current = rankForXp(xp)
  const next = nextRankForXp(xp)
  if (!next) return 100
  const span = next.minXp - current.minXp
  if (span <= 0) return 100
  return Math.min(100, Math.round(((xp - current.minXp) / span) * 100))
}

export const maxXp = totalXp

/* ---------------------------------------------------------------------------
 * Badges. Each badge is awarded by a pure predicate over the user's stats so
 * the same rules run on the server and in optimistic UI.
 * ------------------------------------------------------------------------- */

export interface BadgeStats {
  completedModuleIds: number[]
  xp: number
  streakCount: number
  perfectQuizzes: number
  logbookEntries: number
  /** Distinct mini-games cleared at or above their pass mark. */
  gamesPassed: number
  /** Mini-game runs finished with 100% accuracy. */
  perfectGames: number
  /** Total mini-game attempts, passed or not. */
  gameRuns: number
}

export interface Badge {
  slug: string
  name: string
  description: string
  icon: string
  earned: (s: BadgeStats) => boolean
}

const has = (ids: number[], id: number) => ids.includes(id)

export const badges: Badge[] = [
  {
    slug: "first-steps",
    name: "First Steps",
    description: "Finish your first module.",
    icon: "footprints",
    earned: (s) => s.completedModuleIds.length >= 1,
  },
  {
    slug: "ground-school",
    name: "Ground School Graduate",
    description: "Complete all four Ground School modules.",
    icon: "graduation-cap",
    earned: (s) => [1, 2, 3, 4].every((id) => has(s.completedModuleIds, id)),
  },
  {
    slug: "wheels-up",
    name: "Wheels Up",
    description: "Complete Takeoff Procedures.",
    icon: "plane-takeoff",
    earned: (s) => has(s.completedModuleIds, 7),
  },
  {
    slug: "greased-it",
    name: "Greased It",
    description: "Complete Traffic Patterns & Landing.",
    icon: "plane-landing",
    earned: (s) => has(s.completedModuleIds, 9),
  },
  {
    slug: "on-frequency",
    name: "On Frequency",
    description: "Complete Radio Communications.",
    icon: "radio",
    earned: (s) => has(s.completedModuleIds, 11),
  },
  {
    slug: "in-the-soup",
    name: "In The Soup",
    description: "Complete Intro to IFR.",
    icon: "cloud-fog",
    earned: (s) => has(s.completedModuleIds, 15),
  },
  {
    slug: "sharp-mind",
    name: "Sharp Mind",
    description: "Score 100% on five quizzes.",
    icon: "brain",
    earned: (s) => s.perfectQuizzes >= 5,
  },
  {
    slug: "consistent",
    name: "Consistent",
    description: "Study seven days in a row.",
    icon: "flame",
    earned: (s) => s.streakCount >= 7,
  },
  {
    slug: "dedicated",
    name: "Dedicated",
    description: "Study thirty days in a row.",
    icon: "trophy",
    earned: (s) => s.streakCount >= 30,
  },
  {
    slug: "logbook-started",
    name: "Logbook Open",
    description: "Log your first simulated flight.",
    icon: "notebook-pen",
    earned: (s) => s.logbookEntries >= 1,
  },
  {
    slug: "hour-builder",
    name: "Hour Builder",
    description: "Log ten simulated flights.",
    icon: "clock",
    earned: (s) => s.logbookEntries >= 10,
  },
  {
    slug: "drill-rookie",
    name: "Drill Rookie",
    description: "Finish your first cockpit drill.",
    icon: "gamepad-2",
    earned: (s) => s.gameRuns >= 1,
  },
  {
    slug: "quick-hands",
    name: "Quick Hands",
    description: "Pass three different drills.",
    icon: "zap",
    earned: (s) => s.gamesPassed >= 3,
  },
  {
    slug: "checkride-reflexes",
    name: "Checkride Reflexes",
    description: "Finish a drill with 100% accuracy.",
    icon: "target",
    earned: (s) => s.perfectGames >= 1,
  },
  {
    slug: "drill-instructor",
    name: "Drill Instructor",
    description: "Pass every drill in the hangar.",
    icon: "shield-check",
    earned: (s) => s.gamesPassed >= games.length,
  },
  {
    slug: "full-syllabus",
    name: "Full Syllabus",
    description: "Complete all sixteen modules.",
    icon: "medal",
    earned: (s) => s.completedModuleIds.length >= courseModules.length,
  },
]

export const badgeBySlug = new Map(badges.map((b) => [b.slug, b]))

export function evaluateBadges(stats: BadgeStats): string[] {
  return badges.filter((b) => b.earned(stats)).map((b) => b.slug)
}

/* ---------------------------------------------------------------------------
 * Streaks. Dates are compared as plain YYYY-MM-DD strings in the user's own
 * timezone, which is passed from the client, so "today" means what they expect.
 * ------------------------------------------------------------------------- */

export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00Z`).getTime()
  const db = new Date(`${b}T00:00:00Z`).getTime()
  return Math.round((db - da) / 86_400_000)
}

export function nextStreak(
  lastActiveDate: string | null,
  today: string,
  currentStreak: number,
): number {
  if (!lastActiveDate) return 1
  const gap = daysBetween(lastActiveDate, today)
  if (gap === 0) return Math.max(currentStreak, 1)
  if (gap === 1) return currentStreak + 1
  return 1
}
