import { checklists } from "@/lib/content/checklists"
import { glossary } from "@/lib/content/glossary"
import { totalQuizQuestions } from "@/lib/content/course"
import { badges } from "@/lib/gamification"
import {
  BookOpen,
  ClipboardCheck,
  Gauge,
  ListChecks,
  Medal,
  Settings2,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: ListChecks,
    title: `${totalQuizQuestions} quiz questions`,
    body: "Every module ends with a checkride-style quiz. Explanations tell you why the wrong answers are wrong.",
    href: "/course",
    cta: "Browse modules",
  },
  {
    icon: Gauge,
    title: "Cockpit explorer",
    body: "Click any instrument on the panel and learn what it reads, how it fails, and what to do about it.",
    href: "/cockpit",
    cta: "Open the panel",
  },
  {
    icon: ClipboardCheck,
    title: `${checklists.length} printable checklists`,
    body: "The same flows real Cessna 172 pilots run, from preflight to shutdown and emergencies.",
    href: "/checklists",
    cta: "View checklists",
  },
  {
    icon: BookOpen,
    title: `${glossary.length}-term glossary`,
    body: "Plain-English definitions with why each term matters, cross-linked to the module that teaches it.",
    href: "/glossary",
    cta: "Look something up",
  },
  {
    icon: Medal,
    title: `${badges.length} badges and seven ranks`,
    body: "XP, study streaks and a rank ladder from Cadet to Captain so you can see the progress you made.",
    href: "/dashboard",
    cta: "See your dashboard",
  },
  {
    icon: Settings2,
    title: "Honest setup advice",
    body: "Which simulator to buy, what hardware actually matters, and the graphics settings to learn with.",
    href: "/setup",
    cta: "Set up your sim",
  },
]

export function FeatureGrid() {
  return (
    <section className="border-border border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-3">
          <p className="label-instrument text-primary">What you get</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A training course, not a video library
          </h2>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li key={feature.title}>
              <Link
                href={feature.href}
                className="glass hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-3 rounded-xl p-6 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <feature.icon
                  className="text-primary size-5"
                  aria-hidden="true"
                />
                <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.body}
                </p>
                <p className="text-accent mt-auto text-sm font-medium">
                  {feature.cta}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
