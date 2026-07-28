import { FeatureGrid } from "@/components/marketing/feature-grid"
import { Hero } from "@/components/marketing/hero"
import { SyllabusPreview } from "@/components/marketing/syllabus-preview"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { PRICING } from "@/lib/access"
import { faqItems } from "@/lib/content/faq"
import { getViewer } from "@/lib/session"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const viewer = await getViewer()
  const topFaqs = faqItems.slice(0, 6)

  return (
    <>
      <Hero signedIn={Boolean(viewer)} />
      <SyllabusPreview />
      <FeatureGrid />

      <section className="border-border border-t">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-3">
            <p className="label-instrument text-primary">Questions</p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Before you start the engine
            </h2>
          </div>

          <Accordion className="mt-10">
            {topFaqs.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-muted-foreground mt-8 text-sm">
            <Link href="/faq" className="text-accent font-medium">
              Read all {faqItems.length} questions
            </Link>
          </p>
        </div>
      </section>

      <section className="border-border bg-horizon border-t">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your first flight is one module away
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            Read the first seven modules free. Unlock landings, navigation,
            weather, emergencies and IFR for {PRICING.monthly.label} a month or{" "}
            {PRICING.yearly.label} a year.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/course" />}>
              Start the course
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/pricing" />}>
              Compare plans
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
