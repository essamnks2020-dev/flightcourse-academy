import { Button } from "@/components/ui/button"
import { courseModules, freeModuleCount, totalMinutes } from "@/lib/content/course"
import { ArrowRight, Gauge, PlaneTakeoff, Radio } from "lucide-react"
import Link from "next/link"

const readouts = [
  { label: "Modules", value: String(courseModules.length) },
  { label: "Free modules", value: String(freeModuleCount) },
  { label: "Study time", value: `${Math.round(totalMinutes / 60)} h` },
]

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="bg-horizon relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-28">
        <div className="flex w-full flex-col items-start gap-6 lg:w-3/5">
          <span className="glass label-instrument text-primary inline-flex items-center gap-2 rounded-full px-3 py-1.5">
            <PlaneTakeoff className="size-3.5" aria-hidden="true" />
            Ground school to IFR
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Learn to actually fly the aircraft in your{" "}
            <span className="text-primary text-shadow-glow">simulator</span>.
          </h1>

          <p className="text-muted-foreground max-w-xl text-base leading-relaxed sm:text-lg">
            Sixteen structured modules that take you from a cold, dark cockpit to
            an instrument approach in weather. Real procedures, plain English,
            quizzes that check you understood — not a playlist of videos.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link href="/course/welcome-to-flight-simulation" />}
            >
              Start module 1 free
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href={signedIn ? "/dashboard" : "/course"} />}
            >
              {signedIn ? "Go to dashboard" : "See the full syllabus"}
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            First {freeModuleCount} modules are free — no account required to read
            module one.
          </p>

          <dl className="border-border mt-4 flex w-full flex-wrap gap-x-10 gap-y-4 border-t pt-6">
            {readouts.map((r) => (
              <div key={r.label} className="flex flex-col gap-1">
                <dt className="label-instrument text-muted-foreground">
                  {r.label}
                </dt>
                <dd className="font-mono text-2xl font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="w-full lg:w-2/5">
          <div className="glass glow-primary relative flex flex-col gap-5 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="label-instrument text-primary">Flight plan</p>
              <span className="label-instrument text-muted-foreground">
                C172 / KSEA
              </span>
            </div>

            <div className="relative mx-auto flex size-40 items-center justify-center">
              <div className="border-border absolute inset-0 rounded-full border-2" />
              <div className="border-primary/50 absolute inset-3 rounded-full border border-dashed" />
              <div className="animate-sweep absolute inset-3 flex items-start justify-center">
                <span className="bg-primary h-1/2 w-px" />
              </div>
              <div className="flex flex-col items-center">
                <Gauge className="text-primary size-6" aria-hidden="true" />
                <span className="mt-1 font-mono text-xl font-medium">090</span>
                <span className="label-instrument text-muted-foreground">
                  heading
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {[
                { icon: PlaneTakeoff, text: "Start-up, taxi and takeoff flows" },
                { icon: Radio, text: "Radio phraseology you can actually say" },
                { icon: Gauge, text: "Instrument scan and IFR approaches" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-sm">
                  <item.icon
                    className="text-accent size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground leading-relaxed">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
