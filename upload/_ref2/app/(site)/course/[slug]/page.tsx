import { ContentBlocks } from "@/components/course/content-blocks"
import { ModuleQuiz } from "@/components/course/module-quiz"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRICING, canReadModule, isPro } from "@/lib/access"
import {
  courseModules,
  getModule,
  getNextModule,
  getPreviousModule,
} from "@/lib/content/course"
import { db } from "@/lib/db"
import { lessonProgress } from "@/lib/db/schema"
import { getViewer } from "@/lib/session"
import { and, eq } from "drizzle-orm"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Lock,
  Sparkles,
  TriangleAlert,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return courseModules.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const mod = getModule(slug)
  if (!mod) return { title: "Module not found" }
  return {
    title: `${mod.id}. ${mod.title}`,
    description: mod.tagline,
    openGraph: { title: mod.title, description: mod.tagline },
  }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const mod = getModule(slug)
  if (!mod) notFound()

  const viewer = await getViewer()
  const canRead = canReadModule(mod, viewer)
  const previous = getPreviousModule(slug)
  const next = getNextModule(slug)

  const rows = viewer
    ? await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, viewer.id),
            eq(lessonProgress.moduleSlug, slug),
          ),
        )
        .limit(1)
    : []

  const record = rows[0]
  const isDone = record?.status === "completed"
  const previousScore =
    record?.quizScore != null && record?.quizTotal != null
      ? { score: record.quizScore, total: record.quizTotal }
      : null

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/course"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All modules
        </Link>
      </nav>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-instrument text-primary">
            Module {String(mod.id).padStart(2, "0")} · {mod.stage}
          </span>
          {mod.tier === "free" ? (
            <Badge variant="secondary">Free</Badge>
          ) : (
            <Badge variant="outline">Pro</Badge>
          )}
          {isDone && <Badge>Complete</Badge>}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {mod.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          {mod.tagline}
        </p>

        <p className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3" aria-hidden="true" />
            {mod.estimatedMinutes} min
          </span>
          <span>{mod.difficulty}</span>
          <span>{mod.xpReward} XP</span>
          <span>{mod.quiz.length} questions</span>
        </p>
      </header>

      <section className="glass mt-8 flex flex-col gap-2 rounded-xl p-5">
        <p className="label-instrument text-accent">Why this matters</p>
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          {mod.whyItMatters}
        </p>
      </section>

      {canRead ? (
        <>
          <div className="mt-12 flex flex-col gap-12">
            {mod.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-5">
                <h2 className="border-border border-b pb-3 text-xl font-semibold tracking-tight text-balance">
                  {section.heading}
                </h2>
                <ContentBlocks blocks={section.blocks} />
              </section>
            ))}
          </div>

          <section className="border-destructive/40 bg-destructive/8 mt-12 flex gap-3 rounded-xl border p-5">
            <TriangleAlert
              className="text-destructive mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">
                Common mistake: {mod.commonMistake.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {mod.commonMistake.body}
              </p>
            </div>
          </section>

          <section className="glass mt-6 flex flex-col gap-4 rounded-xl p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary size-4" aria-hidden="true" />
              <h2 className="font-semibold tracking-tight">
                {mod.tryItInSim.title}
              </h2>
            </div>
            <ol className="marker:text-primary flex list-decimal flex-col gap-2 pl-5 text-sm marker:font-mono">
              {mod.tryItInSim.steps.map((step) => (
                <li key={step} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Key takeaways
            </h2>
            <ul className="flex flex-col gap-2">
              {mod.keyTakeaways.map((point) => (
                <li key={point} className="flex gap-3 text-sm">
                  <Check
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Check your understanding
            </h2>
            <ModuleQuiz
              moduleSlug={mod.slug}
              questions={mod.quiz}
              xpReward={mod.xpReward}
              signedIn={Boolean(viewer)}
              previousScore={previousScore}
            />
          </section>
        </>
      ) : (
        <section className="glass glow-primary mt-12 flex flex-col items-start gap-4 rounded-2xl p-7">
          <Lock className="text-primary size-5" aria-hidden="true" />
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            This module is part of Pro
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Modules 8 to 16 cover landings, navigation, radio work, weather,
            emergencies, cross-country planning and IFR — the parts that turn a
            passenger into a pilot. Unlock all of them, plus checklists, the
            cockpit explorer and your logbook.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              "All 16 modules and every quiz",
              "Printable Cessna 172 checklists",
              "Interactive cockpit explorer",
              "Flight logbook, badges and certificate",
            ].map((perk) => (
              <li key={perk} className="flex gap-3">
                <Check
                  className="text-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button render={<Link href="/pricing" />}>
              Unlock for {PRICING.monthly.label}/month
            </Button>
            {!viewer && (
              <Button variant="outline" render={<Link href="/sign-up" />}>
                Create free account
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {isPro(viewer)
              ? "Your subscription may have expired — check your account."
              : `Or read the seven free modules first. ${PRICING.yearly.label}/year saves ${PRICING.yearly.savingsPercent}%.`}
          </p>
        </section>
      )}

      <nav
        aria-label="Module navigation"
        className="border-border mt-16 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:justify-between"
      >
        {previous ? (
          <Button variant="outline" render={<Link href={`/course/${previous.slug}`} />}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {previous.shortTitle}
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button render={<Link href={`/course/${next.slug}`} />}>
            {next.shortTitle}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </nav>
    </article>
  )
}
