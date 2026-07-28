"use client";

import * as React from "react";
import { Gauge, AlertTriangle, Eye, Settings2 } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

/* ============================================================
 * Cockpit instrument hotspots — Cessna 172 panel
 * Categories: Instrument, Control, Avionics, Switch
 * ========================================================== */

type Category = "Instrument" | "Control" | "Avionics" | "Switch";

interface Hotspot {
  id: string;
  name: string;
  category: Category;
  detail: string;
  moduleId?: number;
}

const HOTSPOTS: Hotspot[] = [
  { id: "asi", name: "Airspeed Indicator", category: "Instrument", moduleId: 2,
    detail: "Indicates airspeed in knots. White, green, yellow arcs and a red line mark flap, normal, caution, and never-exceed ranges." },
  { id: "ai", name: "Attitude Indicator", category: "Instrument", moduleId: 2,
    detail: "Gyro-driven artificial horizon showing pitch and bank against the horizon line." },
  { id: "alt", name: "Altimeter", category: "Instrument", moduleId: 2,
    detail: "Barometric altimeter in feet. The needle indicates hundreds of feet per revolution; the digital window shows the full reading." },
  { id: "tc", name: "Turn Coordinator", category: "Instrument", moduleId: 2,
    detail: "Shows rate of turn. The miniature aircraft banks with roll; standard-rate marks sit left and right." },
  { id: "dg", name: "Heading Indicator", category: "Instrument", moduleId: 2,
    detail: "Directional gyro. The compass card rotates beneath a fixed lubber pointer to display the current heading." },
  { id: "vsi", name: "Vertical Speed Indicator", category: "Instrument", moduleId: 2,
    detail: "Rate of climb or descent in feet per minute. Zero sits at the nine o'clock position." },
  { id: "master", name: "Master Switch", category: "Switch", moduleId: 4,
    detail: "Controls the aircraft electrical master bus. Without it, nothing else on the panel has power." },
  { id: "avbus", name: "Avionics Bus", category: "Switch", moduleId: 4,
    detail: "Enables power to the avionics bus. Always switch OFF before engine start or shutdown to protect the radios." },
  { id: "land", name: "Landing Light", category: "Switch", moduleId: 4,
    detail: "Toggle for the forward landing light. Used for takeoff and landing, and for collision avoidance in the pattern." },
  { id: "hdgknob", name: "Heading Bug Knob", category: "Control", moduleId: 6,
    detail: "Rotary control that sets the heading bug on the directional gyro. The bug is your reference for heading holds." },
  { id: "altknob", name: "Altimeter Knob", category: "Control", moduleId: 6,
    detail: "Adjusts the barometric pressure reference (Kollsman window). Set to local altimeter setting before takeoff." },
  { id: "radio", name: "COM/NAV Radio", category: "Avionics", moduleId: 11,
    detail: "Communication and navigation frequency display. Active and standby frequencies are swapped with a flip-flop button." },
];

const CATEGORIES: Category[] = ["Instrument", "Control", "Avionics", "Switch"];

/* ============================================================
 * View
 * ========================================================== */

export default function CockpitExplorerView() {
  const openModule = useNav((s) => s.openModule);
  const [selectedId, setSelectedId] = React.useState<string>(HOTSPOTS[0].id);
  const [category, setCategory] = React.useState<Category | "All">("All");

  const filtered = React.useMemo(
    () => (category === "All" ? HOTSPOTS : HOTSPOTS.filter((h) => h.category === category)),
    [category]
  );

  const selected = React.useMemo(
    () => HOTSPOTS.find((h) => h.id === selectedId) ?? HOTSPOTS[0],
    [selectedId]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="mb-10 animate-fade-up">
        <p className="label-instrument text-primary mb-3">Cockpit</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          The Cessna 172 panel, explained
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          Click any instrument on the panel to learn what it reads, how it works,
          and what to do when it fails.
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        {/* LEFT — instrument list */}
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((instrument) => {
            const active = instrument.id === selectedId;
            return (
              <li key={instrument.id}>
                <button
                  onClick={() => setSelectedId(instrument.id)}
                  className={cn(
                    "glass flex w-full flex-col gap-2 rounded-xl p-4 text-left transition-colors",
                    active
                      ? "border-primary/60 glow-primary"
                      : "hover:border-primary/30"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Gauge
                      className={cn(
                        "size-4",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="label-instrument text-muted-foreground">
                      {instrument.id.toUpperCase()}
                    </span>
                  </span>
                  <span className="font-medium tracking-tight">
                    {instrument.name}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {instrument.detail.slice(0, 80)}
                    {instrument.detail.length > 80 ? "…" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* RIGHT — detail panel */}
        <div className="glass flex flex-col gap-5 rounded-2xl p-6 lg:sticky lg:top-24">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {selected.category}
            </span>
            <span className="nums rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {selected.id.toUpperCase()}
            </span>
          </div>

          {/* Title + description */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-balance">
              {selected.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {selected.detail}
            </p>
          </div>

          {/* Structured sections */}
          <dl className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-1.5">
              <dt className="label-instrument text-primary">How to read it</dt>
              <dd className="leading-relaxed text-muted-foreground">
                {selected.detail}
              </dd>
            </div>

            <div className="flex flex-col gap-1.5">
              <dt className="flex items-center gap-1.5 label-instrument text-accent">
                <Eye className="size-3.5" />
                Scan habit
              </dt>
              <dd className="leading-relaxed text-muted-foreground">
                Glance at this instrument every 3-4 seconds as part of your
                six-pack scan, then return to the attitude indicator.
              </dd>
            </div>

            <div className="flex flex-col gap-1.5">
              <dt className="flex items-center gap-1.5 label-instrument text-accent">
                <AlertTriangle className="size-3.5" />
                When it fails
              </dt>
              <dd className="leading-relaxed text-muted-foreground">
                If the indication looks suspect, cross-check with another
                instrument that reads the same thing differently and treat the
                worst-case indication as the truth.
              </dd>
            </div>
          </dl>

          {/* Module link */}
          {selected.moduleId && (
            <button
              onClick={() => openModule(selected.moduleId!)}
              className="fp-outline-btn w-fit px-4 py-2 text-sm"
            >
              <Settings2 className="size-4" />
              Learn it in module {selected.moduleId}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
