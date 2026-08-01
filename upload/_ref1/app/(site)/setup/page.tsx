import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { setupGuide } from "@/lib/content/setup-guide"
import { Check, Minus, Monitor, PlaneTakeoff, Wrench } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Simulator and hardware setup",
  description:
    "Which flight simulator to buy, what hardware actually matters, graphics settings for learning, and a first flight to fly today.",
}

const tierTone: Record<string, string> = {
  Essential: "border-primary/50 text-primary",
  "Nice-to-Have": "border-accent/50 text-accent",
  Enthusiast: "border-border text-muted-foreground",
}

export default function SetupPage() {
  const { recommendedFirstFlight: first } = setupGuide

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label-instrument text-primary">Before module one</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Set up your simulator
        </h1>
        <p className="text-muted-foreground leading-relaxed text-pretty">
          {setupGuide.intro}
        </p>
      </header>

      <section className="mt-14 flex flex-col gap-5">
        <div className="border-border flex items-center gap-3 border-b pb-3">
          <PlaneTakeoff className="text-primary size-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight">
            Choosing a simulator
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {setupGuide.platforms.map((platform) => (
            <div
              key={platform.name}
              className="glass flex flex-col gap-4 rounded-xl p-6"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold tracking-tight">{platform.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{platform.price}</Badge>
                  <Badge variant="outline">
                    {platform.learningCurve} curve
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {platform.realism}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <ul className="flex flex-col gap-2">
                  {platform.pros.map((pro) => (
                    <li key={pro} className="flex gap-2.5 text-sm">
                      <Check
                        className="text-primary mt-0.5 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col gap-2">
                  {platform.cons.map((con) => (
                    <li
                      key={con}
                      className="text-muted-foreground flex gap-2.5 text-sm"
                    >
                      <Minus className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="border-border mt-auto border-t pt-3 text-sm">
                <span className="text-accent font-medium">Best for: </span>
                <span className="text-muted-foreground leading-relaxed">
                  {platform.bestFor}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 flex flex-col gap-5">
        <div className="border-border flex items-center gap-3 border-b pb-3">
          <Wrench className="text-primary size-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight">
            Hardware, in buying order
          </h2>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {setupGuide.minimumHardware}
        </p>

        <ul className="flex flex-col gap-3">
          {setupGuide.hardwareRanking.map((item) => (
            <li
              key={item.name}
              className="glass flex flex-col gap-2 rounded-xl p-5 sm:flex-row sm:items-start sm:gap-5"
            >
              <span
                className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${tierTone[item.tier] ?? "border-border"}`}
              >
                {item.tier}
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 font-mono text-xs sm:ml-auto">
                {item.approxPrice}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 flex flex-col gap-5">
        <div className="border-border flex items-center gap-3 border-b pb-3">
          <Monitor className="text-primary size-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold tracking-tight">
            Graphics settings for learning
          </h2>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          {setupGuide.graphicsGuidance.map((preset) => (
            <div key={preset.setting} className="glass flex flex-col gap-2 rounded-xl p-5">
              <dt className="flex flex-wrap items-baseline gap-2">
                <span className="font-medium">{preset.setting}</span>
                <span className="text-primary font-mono text-xs">
                  {preset.recommendation}
                </span>
              </dt>
              <dd className="text-muted-foreground text-sm leading-relaxed">
                {preset.why}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="glass glow-primary mt-14 flex flex-col gap-5 rounded-2xl p-7">
        <div className="flex flex-col gap-2">
          <p className="label-instrument text-primary">Your first flight</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {first.aircraft} at {first.airport} ({first.icao})
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {first.reason}
          </p>
        </div>

        <ol className="marker:text-primary flex list-decimal flex-col gap-2 pl-5 text-sm marker:font-mono">
          {first.steps.map((step) => (
            <li key={step} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>

        <Button
          className="w-fit"
          render={<Link href="/course/welcome-to-flight-simulation" />}
        >
          Start module 1
        </Button>
      </section>
    </div>
  )
}
