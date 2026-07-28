import type {
  CourseModule,
  CourseStage,
  ModuleContent,
} from "@/lib/content-types"
import { modules18 } from "./modules-1-8"
import { modules916 } from "./modules-9-16"

/** Every module, in curriculum order. */
const rawModules: ModuleContent[] = [...modules18, ...modules916].sort(
  (a, b) => a.id - b.id,
)

/** URL slugs are stable and human readable — they are part of the SEO surface. */
const SLUGS: Record<number, string> = {
  1: "welcome-to-flight-simulation",
  2: "cockpit-fundamentals",
  3: "four-forces-and-aerodynamics",
  4: "flight-controls-deep-dive",
  5: "engine-startup-and-preflight",
  6: "taxiing-and-ground-operations",
  7: "takeoff-procedures",
  8: "basic-maneuvers",
  9: "traffic-patterns-and-landing",
  10: "navigation-basics",
  11: "radio-communications",
  12: "weather-basics",
  13: "emergency-procedures",
  14: "cross-country-flight-planning",
  15: "intro-to-ifr",
  16: "aircraft-specific-training",
}

/**
 * The free tier is a genuinely useful mini-course: it gets a beginner from
 * install to their first successful takeoff. Landing onward is Pro — that is
 * the moment learners are most motivated to upgrade.
 */
const FREE_MODULE_IDS = new Set([1, 2, 3, 4, 5, 6, 7])

export const stages: CourseStage[] = [
  {
    slug: "ground-school",
    name: "Ground School",
    subtitle: "Understand the machine before you touch it",
    moduleIds: [1, 2, 3, 4],
  },
  {
    slug: "first-flight",
    name: "First Flight",
    subtitle: "Cold aircraft to wheels off the ground",
    moduleIds: [5, 6, 7, 8],
  },
  {
    slug: "circuits-and-navigation",
    name: "Circuits & Navigation",
    subtitle: "Land it consistently, then go somewhere",
    moduleIds: [9, 10, 11, 12],
  },
  {
    slug: "cross-country-and-ifr",
    name: "Cross-Country & IFR",
    subtitle: "Real flights, real weather, real failures",
    moduleIds: [13, 14, 15, 16],
  },
]

function stageForModule(id: number): string {
  return stages.find((s) => s.moduleIds.includes(id))?.name ?? "Ground School"
}

export const courseModules: CourseModule[] = rawModules.map((m, i) => ({
  ...m,
  slug: SLUGS[m.id] ?? `module-${m.id}`,
  tier: FREE_MODULE_IDS.has(m.id) ? "free" : "pro",
  order: i + 1,
  stage: stageForModule(m.id),
}))

export const moduleBySlug = new Map(courseModules.map((m) => [m.slug, m]))
export const moduleById = new Map(courseModules.map((m) => [m.id, m]))

export function getModule(slug: string): CourseModule | undefined {
  return moduleBySlug.get(slug)
}

export function getNextModule(slug: string): CourseModule | undefined {
  const current = moduleBySlug.get(slug)
  if (!current) return undefined
  return courseModules.find((m) => m.order === current.order + 1)
}

export function getPreviousModule(slug: string): CourseModule | undefined {
  const current = moduleBySlug.get(slug)
  if (!current) return undefined
  return courseModules.find((m) => m.order === current.order - 1)
}

/** Total study time across the whole curriculum, in minutes. */
export const totalMinutes = courseModules.reduce(
  (sum, m) => sum + m.estimatedMinutes,
  0,
)

export const totalXp = courseModules.reduce((sum, m) => sum + m.xpReward, 0)

export const totalQuizQuestions = courseModules.reduce(
  (sum, m) => sum + m.quiz.length,
  0,
)

export const freeModuleCount = courseModules.filter(
  (m) => m.tier === "free",
).length

export const stagesWithModules = stages.map((stage) => ({
  ...stage,
  modules: stage.moduleIds
    .map((id) => moduleById.get(id))
    .filter((m): m is CourseModule => Boolean(m)),
}))
