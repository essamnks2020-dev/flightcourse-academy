import type { CourseModule } from "@/lib/content-types"

export type Plan = "free" | "pro" | "lifetime"

export interface Viewer {
  id: string
  name: string
  email: string
  plan: Plan
  planExpiresAt: Date | null
}

/** True when the viewer holds an active paid entitlement. */
export function isPro(viewer: Viewer | null): boolean {
  if (!viewer) return false
  if (viewer.plan === "lifetime") return true
  if (viewer.plan !== "pro") return false
  if (!viewer.planExpiresAt) return true
  return viewer.planExpiresAt.getTime() > Date.now()
}

/**
 * Whether a viewer may read the full body of a module.
 * Free modules are open to everyone, including signed-out visitors — that is
 * deliberate: the first seven modules are the funnel.
 */
export function canReadModule(
  module: Pick<CourseModule, "tier">,
  viewer: Viewer | null,
): boolean {
  return module.tier === "free" || isPro(viewer)
}

/** Pro-only tools outside the module reader. */
export const proTools = [
  "checklists",
  "cockpit",
  "logbook",
  "certificate",
] as const

export type ProTool = (typeof proTools)[number]

export function canUseTool(_tool: ProTool, viewer: Viewer | null): boolean {
  return isPro(viewer)
}

export const PRICING = {
  monthly: { amount: 12, interval: "month" as const, label: "$12" },
  yearly: {
    amount: 79,
    interval: "year" as const,
    label: "$79",
    monthlyEquivalent: 6.58,
    savingsPercent: 45,
  },
} as const
