import { Logo } from "@/components/brand/logo"
import { freeModuleCount, totalMinutes } from "@/lib/content/course"
import { Check } from "lucide-react"
import Link from "next/link"

const perks = [
  "Track progress across all 16 modules",
  "Quiz scores, XP, ranks and study streaks",
  "Resume exactly where you left the aircraft",
]

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="bg-horizon flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:gap-20">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex">
            <Logo />
            <span className="sr-only">FlightCourse Academy home</span>
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>

        <div className="glass hidden w-full max-w-sm flex-col gap-5 rounded-2xl p-7 lg:flex">
          <p className="label-instrument text-primary">Free account includes</p>
          <ul className="flex flex-col gap-3">
            {perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-sm">
                <Check
                  className="text-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>
          <div className="border-border flex gap-6 border-t pt-5">
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums">
                {freeModuleCount}
              </p>
              <p className="label-instrument text-muted-foreground">
                Free modules
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold tabular-nums">
                {Math.round(totalMinutes / 60)}h
              </p>
              <p className="label-instrument text-muted-foreground">
                Total course
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
