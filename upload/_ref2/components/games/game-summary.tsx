"use client"

import { submitGameRun } from "@/app/actions/games"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { GameDef } from "@/lib/content/games"
import { moduleById } from "@/lib/content/course"
import { badgeBySlug } from "@/lib/gamification"
import { cn } from "@/lib/utils"
import { ArrowRight, RotateCcw, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

/** Local YYYY-MM-DD so streaks line up with the player's own day. */
function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

export function GameSummary({
  game,
  score,
  answered,
  durationSeconds,
  signedIn,
  onReplay,
}: {
  game: GameDef
  score: number
  answered: number
  durationSeconds: number
  signedIn: boolean
  onReplay: () => void
}) {
  const accuracy = answered > 0 ? Math.round((score / answered) * 100) : 0
  const passed = accuracy >= game.passMark && answered >= Math.ceil(game.rounds / 2)
  const submitted = useRef(false)
  const [saving, setSaving] = useState(signedIn)
  const router = useRouter()

  useEffect(() => {
    if (!signedIn || submitted.current) return
    submitted.current = true

    submitGameRun({
      gameSlug: game.slug,
      score,
      accuracy,
      durationSeconds,
      today: localToday(),
    })
      .then((result) => {
        if (result.xpAwarded > 0) {
          toast.success(`Drill passed — +${result.xpAwarded} XP`)
        } else if (result.isPersonalBest) {
          toast.success("New personal best")
        }
        for (const slug of result.newBadges) {
          const badge = badgeBySlug.get(slug)
          if (badge) {
            toast.success(`Badge earned: ${badge.name}`, {
              description: badge.description,
            })
          }
        }
        if (result.xpAwarded > 0 || result.newBadges.length > 0) {
          router.refresh()
        }
      })
      .catch(() => toast.error("Could not save that run. Your score still counts locally."))
      .finally(() => setSaving(false))
  }, [accuracy, durationSeconds, game.slug, score, signedIn, router])

  const related = moduleById.get(game.relatedModuleId)

  return (
    <div className="glass flex flex-col gap-7 rounded-2xl p-6 sm:p-10">
      <div className="flex flex-col gap-2">
        <p className="label-instrument text-primary">Debrief</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {passed ? "Drill passed" : answered < game.rounds ? "Out of time" : "Not passed yet"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {passed
            ? "That is the standard. Run it again in a few days — the goal is for these to feel automatic, not remembered."
            : `You need ${game.passMark}% to pass. Look at what you missed, then go again — the rounds are regenerated every time.`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Correct" value={`${score}/${answered || game.rounds}`} />
        <Stat
          label="Accuracy"
          value={`${accuracy}%`}
          tone={passed ? "success" : "warning"}
        />
        <Stat
          label="Time"
          value={`${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pass mark {game.passMark}%</span>
          <span className="font-mono font-medium">{accuracy}%</span>
        </div>
        <Progress
          value={accuracy}
          aria-label="Accuracy"
          className={cn("h-2", passed ? "[&>div]:bg-success" : "[&>div]:bg-primary")}
        />
      </div>

      {!signedIn ? (
        <div className="border-primary/35 bg-primary/8 flex flex-col gap-3 rounded-xl border p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="text-primary size-4" aria-hidden="true" />
            Scores, XP and personal bests need an account
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Create one free and every drill you run counts toward your rank and
            your daily streak.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" render={<Link href="/sign-up" />}>
              Create free account
            </Button>
            <Button size="sm" variant="ghost" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onReplay} disabled={saving}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Run it again
        </Button>
        {related ? (
          <Button
            variant="outline"
            render={<Link href={`/course/${related.slug}`} />}
          >
            Review {related.shortTitle}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
        <Button variant="ghost" render={<Link href="/games" />}>
          All drills
        </Button>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "success" | "warning"
}) {
  return (
    <div className="border-border bg-card/50 flex flex-col gap-1 rounded-xl border p-4">
      <span className="label-instrument text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono text-2xl font-medium",
          tone === "success" && "text-success",
          tone === "warning" && "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  )
}
