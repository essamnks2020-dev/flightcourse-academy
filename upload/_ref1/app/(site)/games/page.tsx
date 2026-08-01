import { getGameStats, type GameStat } from "@/app/actions/games"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isPro } from "@/lib/access"
import { moduleById } from "@/lib/content/course"
import { freeGameCount, games, totalGameXp } from "@/lib/content/games"
import { getViewer } from "@/lib/session"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Gauge,
  Lock,
  Radio,
  Repeat,
  Target,
  Timer,
  Trophy,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Drills — timed cockpit mini-games",
  description:
    "Five timed drills that build the perishable skills a quiz can't test: reading instruments fast, phonetic alphabet, decoding METARs, circuit maths and running checklists in order.",
}

const gameIcons: Record<string, typeof Gauge> = {
  "six-pack-rush": Gauge,
  "phonetic-drill": Radio,
  "metar-decoder": Target,
  "pattern-planner": Repeat,
  "checklist-scramble": Timer,
}

export default async function GamesPage() {
  const viewer = await getViewer()
  const pro = isPro(viewer)

  let stats: GameStat[] = []
  if (viewer) {
    try {
      stats = await getGameStats()
    } catch {
      stats = []
    }
  }
  const statBySlug = new Map(stats.map((s) => [s.gameSlug, s]))
  const totalAttempts = stats.reduce((sum, s) => sum + s.attempts, 0)

  return (
    <>
      <section className="bg-horizon border-border relative overflow-hidden border-b">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:py-20">
          <span className="glass label-instrument text-primary inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5">
            <Timer className="size-3.5" aria-hidden="true" />
            Timed drills
          </span>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Some skills you can&apos;t learn by reading
          </h1>

          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            Reading an altimeter, spelling a callsign, pulling the ceiling out of
            a METAR — these need to be automatic, not remembered. Every drill
            generates fresh rounds on a clock, so there is nothing to memorise.
          </p>

          <dl className="border-border mt-2 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6">
            <Stat label="Drills" value={String(games.length)} />
            <Stat label="Free" value={String(freeGameCount)} />
            <Stat label="XP on offer" value={String(totalGameXp)} />
            {viewer ? (
              <Stat label="Your runs" value={String(totalAttempts)} />
            ) : null}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {games.map((game) => {
            const Icon = gameIcons[game.slug] ?? Gauge
            const locked = game.tier === "pro" && !pro
            const stat = statBySlug.get(game.slug)
            const related = moduleById.get(game.relatedModuleId)

            return (
              <article
                key={game.slug}
                className={cn(
                  "glass group relative flex flex-col gap-5 rounded-2xl p-6 transition-colors",
                  !locked && "hover:border-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      game.accent === "primary" && "bg-primary/12 text-primary",
                      game.accent === "accent" && "bg-accent/12 text-accent",
                      game.accent === "success" && "bg-success/12 text-success",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {locked ? (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="size-3" aria-hidden="true" />
                        Pro
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {game.tier === "pro" ? "Pro" : "Free"}
                      </Badge>
                    )}
                    <Badge variant="ghost">+{game.xpReward} XP</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {game.name}
                  </h2>
                  <p className="text-primary text-sm font-medium">
                    {game.tagline}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <dl className="border-border flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
                  <MiniStat label="Rounds" value={String(game.rounds)} />
                  <MiniStat
                    label="Clock"
                    value={`${Math.round(game.seconds / 60)} min`}
                  />
                  <MiniStat label="Pass" value={`${game.passMark}%`} />
                  {stat ? (
                    <MiniStat
                      label="Your best"
                      value={`${stat.best}/${game.rounds}`}
                      highlight
                    />
                  ) : null}
                </dl>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  {locked ? (
                    <Button size="sm" render={<Link href="/pricing" />}>
                      Unlock with Pro
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button size="sm" render={<Link href={`/games/${game.slug}`} />}>
                      {stat ? "Run it again" : "Start drill"}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                  {related ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      render={<Link href={`/course/${related.slug}`} />}
                    >
                      Learn it first
                    </Button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        {!viewer ? (
          <div className="glass mt-10 flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Trophy
                className="text-primary mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <p className="font-medium">Play signed out, or keep the score</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Free drills work without an account. Sign up and every run adds
                  XP, feeds your streak and records a personal best.
                </p>
              </div>
            </div>
            <Button render={<Link href="/sign-up" />} className="shrink-0">
              Create free account
            </Button>
          </div>
        ) : null}
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-instrument text-muted-foreground">{label}</dt>
      <dd className="font-mono text-2xl font-medium">{value}</dd>
    </div>
  )
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="label-instrument text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-mono text-sm font-medium",
          highlight && "text-primary",
        )}
      >
        {value}
      </dd>
    </div>
  )
}
