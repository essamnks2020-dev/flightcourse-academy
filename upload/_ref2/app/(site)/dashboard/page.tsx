import { getProgress } from "@/app/actions/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { isPro } from "@/lib/access"
import { courseModules, stagesWithModules, totalXp } from "@/lib/content/course"
import {
  badges,
  nextRankForXp,
  rankForXp,
  rankProgress,
} from "@/lib/gamification"
import { getViewer } from "@/lib/session"
import { ArrowRight, Check, Flame, Lock, Star, Trophy } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Your dashboard",
  description: "Track your rank, XP, study streak and module progress.",
}

export default async function DashboardPage() {
  const viewer = await getViewer()
  if (!viewer) redirect("/sign-in")

  const progress = await getProgress()
  const pro = isPro(viewer)

  const completed = new Set(progress.completedSlugs)
  const rank = rankForXp(progress.xp)
  const nextRank = nextRankForXp(progress.xp)
  const earned = new Set(progress.badgeSlugs)

  const nextModule =
    courseModules.find((m) => !completed.has(m.slug)) ?? courseModules[0]
  const percentComplete = Math.round(
    (completed.size / courseModules.length) * 100,
  )

  const quizEntries = Object.values(progress.quizScores)
  const quizAccuracy = quizEntries.length
    ? Math.round(
        (quizEntries.reduce((s, q) => s + q.score, 0) /
          quizEntries.reduce((s, q) => s + q.total, 0)) *
          100,
      )
    : null

  const stats = [
    { label: "XP", value: `${progress.xp}`, sub: `of ${totalXp}`, icon: Star },
    {
      label: "Streak",
      value: `${progress.streakCount}`,
      sub: `best ${progress.longestStreak}`,
      icon: Flame,
    },
    {
      label: "Modules",
      value: `${completed.size}`,
      sub: `of ${courseModules.length}`,
      icon: Check,
    },
    {
      label: "Quiz accuracy",
      value: quizAccuracy === null ? "—" : `${quizAccuracy}%`,
      sub: `${quizEntries.length} taken`,
      icon: Trophy,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="label-instrument text-primary">Flight deck</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {viewer.name.split(" ")[0]}, you are a {rank.name}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {rank.blurb}
          </p>
        </div>
        {pro ? (
          <Badge>Pro</Badge>
        ) : (
          <Button size="sm" variant="outline" render={<Link href="/pricing" />}>
            Upgrade to Pro
          </Button>
        )}
      </header>

      <section className="glass mt-8 flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-sm font-medium">
            {nextRank
              ? `${nextRank.minXp - progress.xp} XP to ${nextRank.name}`
              : "Top rank reached — Captain"}
          </p>
          <span className="text-primary font-mono text-sm">
            {progress.xp} XP
          </span>
        </div>
        <Progress value={rankProgress(progress.xp)} />
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Button size="sm" render={<Link href={`/course/${nextModule.slug}`} />}>
            {completed.size === 0 ? "Start module 1" : "Continue training"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-muted-foreground text-sm">
            Next up: {nextModule.title}
          </p>
        </div>
      </section>

      <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass flex flex-col gap-2 rounded-xl p-5">
            <stat.icon className="text-accent size-4" aria-hidden="true" />
            <dt className="label-instrument text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-medium">
                {stat.value}
              </span>
              <span className="text-muted-foreground text-xs">{stat.sub}</span>
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-12 flex flex-col gap-5">
        <div className="border-border flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Syllabus progress
          </h2>
          <span className="text-muted-foreground font-mono text-sm">
            {percentComplete}% complete
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stagesWithModules.map((stage) => {
            const done = stage.modules.filter((m) => completed.has(m.slug)).length
            return (
              <div key={stage.slug} className="glass flex flex-col gap-3 rounded-xl p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium">{stage.name}</h3>
                  <span className="text-muted-foreground font-mono text-xs">
                    {done}/{stage.modules.length}
                  </span>
                </div>
                <Progress value={(done / stage.modules.length) * 100} />
                <ul className="mt-1 flex flex-col gap-1.5">
                  {stage.modules.map((mod) => {
                    const isDone = completed.has(mod.slug)
                    const locked = mod.tier === "pro" && !pro
                    return (
                      <li key={mod.slug}>
                        <Link
                          href={`/course/${mod.slug}`}
                          className="hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                        >
                          {isDone ? (
                            <Check
                              className="text-primary size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : locked ? (
                            <Lock
                              className="text-muted-foreground size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <span
                              className="border-muted-foreground/50 size-3.5 shrink-0 rounded-full border"
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={
                              isDone ? "" : "text-muted-foreground truncate"
                            }
                          >
                            {mod.shortTitle}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-12 flex flex-col gap-5">
        <div className="border-border flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2 className="text-xl font-semibold tracking-tight">Badges</h2>
          <span className="text-muted-foreground font-mono text-sm">
            {earned.size}/{badges.length}
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => {
            const has = earned.has(badge.slug)
            return (
              <li
                key={badge.slug}
                className={`glass flex flex-col gap-1.5 rounded-xl p-4 ${
                  has ? "border-primary/40" : "opacity-55"
                }`}
              >
                <span
                  className={`label-instrument ${has ? "text-primary" : "text-muted-foreground"}`}
                >
                  {has ? "Earned" : "Locked"}
                </span>
                <p className="text-sm font-medium leading-snug">{badge.name}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {badge.description}
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
