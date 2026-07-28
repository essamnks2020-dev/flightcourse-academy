import { CockpitExplorer } from "@/components/reference/cockpit-explorer"
import { instrumentGroups, instruments } from "@/lib/content/cockpit"
import { courseModules } from "@/lib/content/course"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cockpit walkthrough",
  description:
    "Every instrument on the Cessna 172 panel: what it reads, how it works, how it fails, and the scan habit that keeps you ahead of the aircraft.",
}

export default function CockpitPage() {
  const moduleSlugs: Record<number, string> = {}
  for (const mod of courseModules) moduleSlugs[mod.id] = mod.slug

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label-instrument text-primary">Reference</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          The Cessna 172 panel, instrument by instrument
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed text-pretty">
          Pick any gauge, knob or radio to see what it actually measures, what a
          normal reading looks like, and the failure that catches simulator
          pilots out. Every instrument links to the module that teaches it.
        </p>
      </header>

      <div className="mt-10">
        <CockpitExplorer
          instruments={instruments}
          groups={instrumentGroups}
          moduleSlugs={moduleSlugs}
        />
      </div>
    </div>
  )
}
