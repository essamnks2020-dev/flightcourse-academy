import { getGameStats } from "@/app/actions/games"
import { OrderingGame } from "@/components/games/ordering-game"
import { QuickfireGame } from "@/components/games/quickfire-game"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isPro } from "@/lib/access"
import { moduleById } from "@/lib/content/course"
import { gameBySlug, games } from "@/lib/content/games"
import { getViewer } from "@/lib/session"
import { ArrowLeft, ArrowRight, Lock } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const game = gameBySlug.get(slug)
  if (!game) return { title: "Drill not found" }
  return {
    title: `${game.name} — ${game.skill} drill`,
    description: game.description,
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game = gameBySlug.get(slug)
  if (!game) notFound()

  const viewer = await getViewer()
  const pro = isPro(viewer)
  const locked = game.tier === "pro" && !pro
  const related = moduleById.get(game.relatedModuleId)

  let best: number | null = null
  if (viewer) {
    try {
      const stats = await getGameStats()
      best = stats.find((s) => s.gameSlug === game.slug)?.best ?? null
    } catch {
      best = null
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" render={<Link href="/games" />}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          All drills
        </Button>
        {best != null ? (
          <Badge variant="outline" className="label-instrument">
            Personal best {best}/{game.rounds}
          </Badge>
        ) : null}
      </div>

      <header className="mb-8 flex flex-col gap-3">
        <p className="label-instrument text-primary">{game.skill}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {game.name}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {game.tagline}
        </p>
      </header>

      {locked ? (
        <div className="glass flex flex-col gap-5 rounded-2xl p-6 sm:p-10">
          <span className="bg-primary/12 text-primary flex size-11 items-center justify-center rounded-xl">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">
            This drill is part of Pro
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            {game.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/pricing" />}>
              See what Pro includes
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="outline" render={<Link href="/games" />}>
              Play the free drills
            </Button>
          </div>
        </div>
      ) : game.mode === "ordering" ? (
        <OrderingGame game={game} signedIn={Boolean(viewer)} />
      ) : (
        <QuickfireGame game={game} signedIn={Boolean(viewer)} />
      )}

      {related && !locked ? (
        <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
          Struggling with this one? It is taught in{" "}
          <Link
            href={`/course/${related.slug}`}
            className="text-accent font-medium"
          >
            Module {related.id}: {related.title}
          </Link>
          .
        </p>
      ) : null}
    </div>
  )
}
