import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { faqItems } from "@/lib/content/faq"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "How the course works, which simulator to use, what Pro unlocks and whether any of this counts toward a real pilot certificate.",
}

export default function FaqPage() {
  const categories = Array.from(new Set(faqItems.map((f) => f.category)))

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label-instrument text-primary">Support</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {faqItems.length} straight answers about the course, the simulator and
          what this training does and does not cover.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-10">
        {categories.map((category) => (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="border-border border-b pb-3 text-lg font-semibold tracking-tight">
              {category}
            </h2>
            <Accordion>
              {faqItems
                .filter((f) => f.category === category)
                .map((item) => (
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
          </section>
        ))}
      </div>

      <div className="glass mt-14 flex flex-wrap items-center justify-between gap-4 rounded-xl p-6">
        <p className="text-sm leading-relaxed">
          Still unsure? Read module one — it is free and takes 15 minutes.
        </p>
        <Button
          size="sm"
          render={<Link href="/course/welcome-to-flight-simulation" />}
        >
          Start module 1
        </Button>
      </div>
    </div>
  )
}
