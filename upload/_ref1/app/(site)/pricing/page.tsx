import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRICING, isPro } from "@/lib/access"
import { courseModules, freeModuleCount } from "@/lib/content/course"
import { checklists } from "@/lib/content/checklists"
import { getViewer } from "@/lib/session"
import { Check, X } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pricing",
  description: `Seven free modules, then ${PRICING.monthly.label} a month or ${PRICING.yearly.label} a year for the full 16-module syllabus, checklists, cockpit explorer and logbook.`,
}

const freeFeatures = [
  { text: `Modules 1–${freeModuleCount} in full`, included: true },
  { text: "Every quiz in those modules", included: true },
  { text: "Glossary and FAQ", included: true },
  { text: "Progress, XP, ranks and streaks", included: true },
  { text: "Modules 8–16 (landings to IFR)", included: false },
  { text: "Printable checklists", included: false },
  { text: "Cockpit explorer", included: false },
  { text: "Flight logbook and certificate", included: false },
]

const proFeatures = [
  `All ${courseModules.length} modules, including IFR`,
  "Every quiz, with saved best scores",
  `${checklists.length} printable Cessna 172 checklists`,
  "Interactive cockpit explorer",
  "Flight logbook with badges",
  "Course completion certificate",
  "New modules as they ship",
]

const pricingFaqs = [
  {
    q: "Do I need a subscription to start?",
    a: `No. The first ${freeModuleCount} modules take you from installing a simulator to your first successful takeoff, and they are free forever. You only need Pro when you want to learn to land, navigate and fly on instruments.`,
  },
  {
    q: "Is this a real flight training course?",
    a: "It teaches real-world procedures as they apply inside a flight simulator. It is not a substitute for instruction toward a pilot certificate, and it does not log real flight time.",
  },
  {
    q: "Which simulator do I need?",
    a: "Microsoft Flight Simulator 2020/2024 or X-Plane 12 are ideal because the course targets the default Cessna 172. The setup guide walks through the trade-offs before you spend anything.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, at any time. You keep access until the end of the period you paid for, and your progress, XP and badges stay on your account if you come back.",
  },
]

export default async function PricingPage() {
  const viewer = await getViewer()
  const pro = isPro(viewer)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <p className="label-instrument text-primary">Pricing</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Learn the first seven modules free
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Pro unlocks the half of the course where you actually become a pilot:
          landings, navigation, radio, weather, emergencies and instrument
          flying.
        </p>
      </header>

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <section className="glass flex flex-col gap-6 rounded-2xl p-7">
          <div className="flex flex-col gap-2">
            <p className="label-instrument text-muted-foreground">Free</p>
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-medium">$0</span>
              <span className="text-muted-foreground text-sm">forever</span>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Everything you need to get airborne for the first time.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {freeFeatures.map((feature) => (
              <li key={feature.text} className="flex gap-3 text-sm">
                {feature.included ? (
                  <Check
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <X
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={
                    feature.included ? "leading-relaxed" : "text-muted-foreground leading-relaxed"
                  }
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className="mt-auto"
            render={<Link href={viewer ? "/course" : "/sign-up"} />}
          >
            {viewer ? "Keep learning free" : "Create free account"}
          </Button>
        </section>

        <section className="glass glow-primary border-primary/40 flex flex-col gap-6 rounded-2xl p-7">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="label-instrument text-primary">Pro</p>
              <Badge variant="secondary">
                Save {PRICING.yearly.savingsPercent}% yearly
              </Badge>
            </div>
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-medium">
                {PRICING.monthly.label}
              </span>
              <span className="text-muted-foreground text-sm">/ month</span>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Or {PRICING.yearly.label} a year — about $
              {PRICING.yearly.monthlyEquivalent.toFixed(2)} a month.
            </p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm">
                <Check
                  className="text-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-3">
            {pro ? (
              <>
                <Button disabled>You are on Pro</Button>
                <p className="text-muted-foreground text-center text-xs">
                  Thank you — every module is unlocked on your account.
                </p>
              </>
            ) : (
              <>
                <Button render={<Link href="/checkout?plan=yearly" />}>
                  Get Pro yearly — {PRICING.yearly.label}
                </Button>
                <Button
                  variant="outline"
                  render={<Link href="/checkout?plan=monthly" />}
                >
                  Get Pro monthly — {PRICING.monthly.label}
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                  Cancel any time. Your progress is kept either way.
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="mx-auto mt-16 w-full max-w-2xl">
        <h2 className="text-xl font-semibold tracking-tight">
          Pricing questions
        </h2>
        <Accordion className="mt-6">
          {pricingFaqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
