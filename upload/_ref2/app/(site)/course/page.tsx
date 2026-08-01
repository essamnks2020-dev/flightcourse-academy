import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { isPro } from "@/lib/access"
import {
  courseModules,
  freeModuleCount,
  stagesWithModules,
  totalMinutes,
  totalQuizQuestions,
} from "@/lib/content/course"
import { db } from "@/lib/db"
import { lessonProgress } from "@/lib/db/schema"
import { getViewer } from "@/lib/session"
import { eq } from "drizzle-orm"
import { Check, Clock, Lock } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "The 16-module syllabus",
  description:
    "Every module in FlightCourse Academy, from cockpit fundamentals to IFR approaches. Seven modules are free.",
}

export default async function CoursePage() {
  const viewer = await getViewer()
  const pro = isPro(viewer)

  const rows = viewer
    ? await db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, viewer.id))
    : []

  const completed = new Set(
    rows.filter((r) => r.status === "completed").map((r) => r.moduleSlug),
  )
  const started = new Set(rows.map((r) => r.moduleSlug))
  const percent = Math.round((completed.size / courseModules.length) * 100)

  const nextModule =
    courseModules.find((m) => !completed.has(m.slug)) ?? courseModules[0]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label-instrument text-primary">Syllabus</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          The full course
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          {courseModules.length} modules, {totalQuizQuestions} quiz questions and
          roughly {Math.round(totalMinutes / 60)} hours of reading. Modules build
          on each other, so work top to bottom — the first {freeModuleCount} are
          free.
        </p>

        {viewer ? (
          <div className="glass mt-2 flex flex-col gap-3 rounded-xl p-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-medium">
                {completed.size} of {courseModules.length} modules complete
              </p>
              <span className="text-primary font-mono text-sm">{percent}%</span>
            </div>
            <Progress value={percent} />
            <div className="mt-1">
              <Button size="sm" render={<Link href={`/course/${nextModule.slug}`} />}>
                {completed.size === 0 ? "Start module 1" : "Continue"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass mt-2 flex flex-wrap items-center justify-between gap-4 rounded-xl p-5">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create a free account to track quiz scores, XP and study streaks.
            </p>
            <Button size="sm" render={<Link href="/sign-up" />}>
              Create free account
            </Button>
          </div>
        )}
      </header>

      <div className="mt-14 flex flex-col gap-12">
        {stagesWithModules.map((stage, index) => (
          <section key={stage.slug} className="flex flex-col gap-5">
            <div className="border-border flex flex-wrap items-baseline gap-3 border-b pb-3">
              <span className="text-primary font-mono text-sm">
                Stage {index + 1}
              </span>
              <h2 className="text-xl font-semibold tracking-tight">
                {stage.name}
              </h2>
              <p className="text-muted-foreground text-sm">{stage.subtitle}</p>
            </div>

            <ol className="flex flex-col gap-3">
              {stage.modules.map((mod) => {
                const isDone = completed.has(mod.slug)
                const inProgress = !isDone && started.has(mod.slug)
                const locked = mod.tier === "pro" && !pro

                return (
                  <li key={mod.slug}>
                    <Link
                      href={`/course/${mod.slug}`}
                      className="glass hover:border-primary/40 focus-visible:ring-ring flex items-start gap-4 rounded-xl p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:p-5"
                    >
                      <span
                        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs ${
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      >
                        {isDone ? (
                          <Check className="size-4" />
                        ) : (
                          String(mod.id).padStart(2, "0")
                        )}
                      </span>

                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{mod.title}</h3>
                          {mod.tier === "free" && (
                            <Badge variant="secondary">Free</Badge>
                          )}
                          {isDone && <Badge>Complete</Badge>}
                          {inProgress && (
                            <Badge variant="outline">In progress</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {mod.tagline}
                        </p>
                        <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 font-mono text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3" aria-hidden="true" />
                            {mod.estimatedMinutes} min
                          </span>
                          <span>{mod.difficulty}</span>
                          <span>{mod.xpReward} XP</span>
                          <span>{mod.quiz.length} questions</span>
                        </p>
                      </div>

                      {locked && (
                        <Lock
                          className="text-muted-foreground ml-auto mt-1 size-4 shrink-0"
                          aria-label="Requires Pro"
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
