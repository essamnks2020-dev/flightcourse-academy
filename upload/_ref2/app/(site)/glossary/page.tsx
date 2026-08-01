import { GlossaryBrowser } from "@/components/reference/glossary-browser"
import { courseModules } from "@/lib/content/course"
import { glossary } from "@/lib/content/glossary"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aviation glossary",
  description: `${glossary.length} aviation terms explained in plain English, with why each one matters to a simulator pilot.`,
}

export default function GlossaryPage() {
  const moduleSlugs: Record<number, string> = {}
  for (const mod of courseModules) moduleSlugs[mod.id] = mod.slug

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label-instrument text-primary">Reference</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Aviation glossary
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          {glossary.length} terms across aerodynamics, instruments, navigation,
          communications, weather and procedures. Every entry tells you why it
          matters, not just what it means.
        </p>
      </header>

      <div className="mt-10">
        <GlossaryBrowser terms={glossary} moduleSlugs={moduleSlugs} />
      </div>
    </div>
  )
}
