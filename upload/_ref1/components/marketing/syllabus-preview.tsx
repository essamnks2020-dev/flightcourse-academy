import { Badge } from "@/components/ui/badge"
import { stagesWithModules } from "@/lib/content/course"
import { Clock, Lock } from "lucide-react"
import Link from "next/link"

export function SyllabusPreview() {
  return (
    <section className="border-border border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-3">
          <p className="label-instrument text-primary">The syllabus</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Four stages, sixteen modules, in flying order
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Each stage ends with you able to do something specific in the
            simulator. Nothing is introduced before you need it.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-10">
          {stagesWithModules.map((stage, stageIndex) => (
            <div key={stage.slug} className="flex flex-col gap-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-primary font-mono text-sm">
                  {String(stageIndex + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  {stage.name}
                </h3>
                <p className="text-muted-foreground text-sm">{stage.subtitle}</p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {stage.modules.map((mod) => (
                  <li key={mod.slug}>
                    <Link
                      href={`/course/${mod.slug}`}
                      className="glass hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-2 rounded-xl p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium leading-snug">
                          <span className="text-muted-foreground font-mono text-xs">
                            {String(mod.id).padStart(2, "0")}{" "}
                          </span>
                          {mod.title}
                        </p>
                        {mod.tier === "free" ? (
                          <Badge variant="secondary" className="shrink-0">
                            Free
                          </Badge>
                        ) : (
                          <Lock
                            className="text-muted-foreground mt-1 size-3.5 shrink-0"
                            aria-label="Pro module"
                          />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {mod.tagline}
                      </p>
                      <p className="text-muted-foreground mt-auto flex items-center gap-1.5 font-mono text-xs">
                        <Clock className="size-3" aria-hidden="true" />
                        {mod.estimatedMinutes} min
                        <span aria-hidden="true">·</span>
                        {mod.difficulty}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
