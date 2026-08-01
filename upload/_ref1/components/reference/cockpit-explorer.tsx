"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Instrument, InstrumentGroup } from "@/lib/content/cockpit"
import { AlertTriangle, Eye, Gauge, Settings2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

export function CockpitExplorer({
  instruments,
  groups,
  moduleSlugs,
}: {
  instruments: Instrument[]
  groups: InstrumentGroup[]
  moduleSlugs: Record<number, string>
}) {
  const [group, setGroup] = useState<InstrumentGroup | "All">("All")
  const [selectedId, setSelectedId] = useState(instruments[0]?.id ?? "")

  const filtered = useMemo(
    () =>
      group === "All"
        ? instruments
        : instruments.filter((i) => i.group === group),
    [instruments, group],
  )

  const selected =
    filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? instruments[0]

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter instruments by panel group"
      >
        {(["All", ...groups] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setGroup(option)}
            aria-pressed={group === option}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              group === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        {/* The panel */}
        <ul
          className="grid gap-3 sm:grid-cols-2"
          aria-label="Instrument panel"
        >
          {filtered.map((instrument) => {
            const active = selected?.id === instrument.id
            return (
              <li key={instrument.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(instrument.id)}
                  aria-pressed={active}
                  className={`glass flex w-full flex-col gap-2 rounded-xl p-4 text-left transition-colors ${
                    active
                      ? "border-primary/60 glow-primary"
                      : "hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Gauge
                      className={
                        active
                          ? "text-primary size-4 shrink-0"
                          : "text-muted-foreground size-4 shrink-0"
                      }
                      aria-hidden="true"
                    />
                    <span className="label-instrument text-muted-foreground">
                      {instrument.abbreviation}
                    </span>
                  </div>
                  <span className="font-medium tracking-tight">
                    {instrument.name}
                  </span>
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {instrument.reads}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* The detail card */}
        {selected && (
          <div
            className="glass flex flex-col gap-5 rounded-2xl p-6 lg:sticky lg:top-24"
            aria-live="polite"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{selected.abbreviation}</Badge>
                <Badge variant="outline">{selected.group}</Badge>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-balance">
                {selected.name}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {selected.reads}
              </p>
            </div>

            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="label-instrument text-primary">How it works</dt>
                <dd className="leading-relaxed">{selected.howItWorks}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="label-instrument text-primary">
                  Normal indication
                </dt>
                <dd className="leading-relaxed">{selected.normalIndication}</dd>
              </div>
              <div className="border-border flex flex-col gap-1 border-t pt-4">
                <dt className="label-instrument text-accent flex items-center gap-2">
                  <AlertTriangle className="size-3.5" aria-hidden="true" />
                  When it fails
                </dt>
                <dd className="text-muted-foreground leading-relaxed">
                  {selected.failure}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="label-instrument text-accent flex items-center gap-2">
                  <Eye className="size-3.5" aria-hidden="true" />
                  Scan habit
                </dt>
                <dd className="text-muted-foreground leading-relaxed">
                  {selected.scanTip}
                </dd>
              </div>
            </dl>

            {moduleSlugs[selected.moduleId] && (
              <Button
                variant="outline"
                className="w-fit"
                render={
                  <Link href={`/course/${moduleSlugs[selected.moduleId]}`} />
                }
              >
                <Settings2 className="size-4" aria-hidden="true" />
                Learn it in module {selected.moduleId}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
