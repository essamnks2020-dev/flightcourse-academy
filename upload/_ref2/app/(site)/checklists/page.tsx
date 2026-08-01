import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRICING, isPro } from "@/lib/access"
import { checklists } from "@/lib/content/checklists"
import { getViewer } from "@/lib/session"
import { Check, Lock, Printer } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cessna 172 checklists",
  description:
    "Printable preflight, start-up, takeoff, cruise, landing, shutdown and emergency checklists for the Cessna 172.",
}

export default async function ChecklistsPage() {
  const viewer = await getViewer()
  const pro = isPro(viewer)
  const visible = pro ? checklists : checklists.slice(0, 1)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="label-instrument text-primary">Cockpit reference</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Checklists
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Run these on a second monitor or print them. Read the item, do the
          item, then say it out loud — that habit is what stops you taking off
          with the fuel selector off.
        </p>
        {!pro && (
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-xl p-5">
            <p className="text-muted-foreground text-sm leading-relaxed">
              The preflight checklist is free. Pro unlocks all{" "}
              {checklists.length}, including emergencies.
            </p>
            <Button size="sm" render={<Link href="/pricing" />}>
              Unlock for {PRICING.monthly.label}/month
            </Button>
          </div>
        )}
      </header>

      <div className="mt-12 flex flex-col gap-12">
        {visible.map((list) => (
          <section key={list.id} className="flex flex-col gap-5">
            <div className="border-border flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  {list.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {list.description}
                </p>
              </div>
              <Badge variant="outline">{list.aircraft}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {list.sections.map((section) => (
                <div
                  key={section.name}
                  className="glass flex flex-col gap-3 rounded-xl p-5"
                >
                  <h3 className="label-instrument text-accent">
                    {section.name}
                  </h3>
                  <ol className="flex flex-col gap-2.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <Check
                          className="text-primary mt-0.5 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm leading-relaxed">
                            {item.text}
                          </span>
                          {item.detail && (
                            <span className="text-muted-foreground text-xs leading-relaxed">
                              {item.detail}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        ))}

        {!pro &&
          checklists.slice(1).map((list) => (
            <section
              key={list.id}
              className="glass flex items-center gap-4 rounded-xl p-5 opacity-70"
            >
              <Lock
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <h2 className="font-medium">{list.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {list.description}
                </p>
              </div>
            </section>
          ))}
      </div>

      <p className="text-muted-foreground mt-12 flex items-center gap-2 text-sm">
        <Printer className="size-4" aria-hidden="true" />
        Use your browser&apos;s print command to get a paper copy.
      </p>
    </div>
  )
}
