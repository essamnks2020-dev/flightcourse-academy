"use client";

import {
  PlaneTakeoff,
  ArrowRight,
  Gauge,
  Radio,
  ListChecks,
  ClipboardCheck,
  BookOpen,
  Medal,
  Settings2,
  Clock,
  Lock,
  Plane,
  Map,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNav } from "@/lib/nav-store";
import { BADGES } from "@/lib/progress-store";
import { allModules, TOTAL_MODULES } from "@/lib/data/modules";
import { faqItems } from "@/lib/data/faq";
import { glossary } from "@/lib/data/glossary";
import { checklists } from "@/lib/data/checklists";

const totalMinutes = allModules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
const totalQuizQuestions = allModules.reduce((sum, m) => sum + m.quiz.length, 0);

const STAGES = [
  { name: "First flights", subtitle: "Cold cockpit to first takeoff", ids: [1, 2, 3, 4] },
  { name: "Controlling the aircraft", subtitle: "Climbs, turns, descents and landings", ids: [5, 6, 7, 8] },
  { name: "Leaving the pattern", subtitle: "Navigation, radio, weather", ids: [9, 10, 11, 12] },
  { name: "Going further", subtitle: "Emergencies, cross-country, IFR", ids: [13, 14, 15, 16] },
];

const HERO_POINTS = [
  { icon: PlaneTakeoff, text: "Start-up, taxi and takeoff flows" },
  { icon: Radio, text: "Radio phraseology you can actually say" },
  { icon: Gauge, text: "Instrument scan and IFR approaches" },
];

const FEATURES = [
  {
    icon: ListChecks,
    title: `${totalQuizQuestions} quiz questions`,
    body: "Every module ends with a checkride-style quiz. Explanations tell you why the wrong answers are wrong.",
    cta: "Browse modules",
    view: "path" as const,
  },
  {
    icon: Gauge,
    title: "Cockpit explorer",
    body: "Click any instrument on the panel and learn what it reads, how it fails, and what to do about it.",
    cta: "Open the panel",
    view: "cockpit" as const,
  },
  {
    icon: ClipboardCheck,
    title: `${checklists.length} printable checklists`,
    body: "The same flows real Cessna 172 pilots run, from preflight to shutdown and emergencies.",
    cta: "View checklists",
    view: "checklists" as const,
  },
  {
    icon: BookOpen,
    title: `${glossary.length}-term glossary`,
    body: "Plain-English definitions with why each term matters, cross-linked to the module that teaches it.",
    cta: "Look something up",
    view: "glossary" as const,
  },
  {
    icon: Medal,
    title: `${BADGES.length} badges and four ranks`,
    body: "XP, study streaks and a rank ladder from Student Pilot to Rated so you can see the progress you made.",
    cta: "See your dashboard",
    view: "progress" as const,
  },
  {
    icon: Settings2,
    title: "Honest setup advice",
    body: "Which simulator to buy, what hardware actually matters, and the graphics settings to learn with.",
    cta: "Set up your sim",
    view: "setup" as const,
  },
];

const GAMES = [
  {
    icon: Plane,
    title: "Flare Trainer",
    body: "Land without bouncing — a 2D physics trainer with real flare timing.",
    view: "flare" as const,
  },
  {
    icon: Radio,
    title: "Radio Builder",
    body: "Build ATC radio calls by dragging words into the right order.",
    view: "radio" as const,
  },
  {
    icon: Map,
    title: "Pattern Perfect",
    body: "Fly the traffic pattern with AI traffic and CTAF calls.",
    view: "pattern" as const,
  },
];

export function HomeView() {
  const navigate = useNav((s) => s.navigate);
  const topFaqs = faqItems.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/* Section 1 — Hero                                              */}
      {/* ============================================================ */}
      <section className="bg-horizon relative">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:py-28">
          {/* Left column */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-6 lg:flex-[3]">
            <span className="glass label-instrument text-primary inline-flex items-center gap-2 rounded-full px-3 py-1.5">
              <PlaneTakeoff className="size-3.5" aria-hidden="true" />
              Ground school to IFR
            </span>

            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Learn to actually fly the aircraft in your{" "}
              <span className="text-primary text-shadow-glow">simulator</span>.
            </h1>

            <p className="text-muted-foreground max-w-xl text-base leading-relaxed sm:text-lg">
              Sixteen structured modules that take you from a cold, dark cockpit to an
              instrument approach in weather. Real procedures, plain English, quizzes that
              check you understood — not a playlist of videos.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("module", 1)}
                className="fp-toggle-btn px-5 py-3 text-sm"
              >
                Start module 1
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("path")}
                className="fp-outline-btn px-5 py-3 text-sm"
              >
                See the full syllabus
              </button>
            </div>

            <p className="text-muted-foreground text-xs">
              First 7 modules are free — no account required.
            </p>

            <dl className="border-border mt-4 flex w-full flex-wrap gap-x-10 gap-y-4 border-t pt-6">
              <div className="flex flex-col gap-1">
                <dt className="label-instrument text-muted-foreground">Modules</dt>
                <dd className="nums text-2xl font-medium">{TOTAL_MODULES}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="label-instrument text-muted-foreground">Free modules</dt>
                <dd className="nums text-2xl font-medium">7</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="label-instrument text-muted-foreground">Study time</dt>
                <dd className="nums text-2xl font-medium">{Math.round(totalMinutes / 60)} h</dd>
              </div>
            </dl>
          </div>

          {/* Right column — flight plan card */}
          <div className="min-w-0 w-full lg:flex-[2] lg:max-w-sm">
            <div className="glass glow-primary relative flex flex-col gap-5 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <p className="label-instrument text-primary">Flight plan</p>
                <span className="label-instrument text-muted-foreground">C172 / KSEA</span>
              </div>

              <div className="relative mx-auto flex size-40 items-center justify-center">
                <div className="border-border absolute inset-0 rounded-full border-2" />
                <div className="border-primary/50 absolute inset-3 rounded-full border border-dashed" />
                <div className="animate-sweep absolute inset-3 flex items-start justify-center">
                  <span className="bg-primary h-1/2 w-px" />
                </div>
                <div className="flex flex-col items-center">
                  <Gauge className="text-primary size-6" aria-hidden="true" />
                  <span className="nums mt-1 text-xl font-medium">090</span>
                  <span className="label-instrument text-muted-foreground">heading</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3">
                {HERO_POINTS.map((point) => (
                  <li key={point.text} className="flex items-center gap-3 text-sm">
                    <point.icon className="text-accent size-4 shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground leading-relaxed">{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 2 — Feature grid                                      */}
      {/* ============================================================ */}
      <section className="border-border border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-3 animate-fade-up">
            <p className="label-instrument text-primary">What you get</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              A training course, not a video library
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <button
                key={feature.title}
                onClick={() => navigate(feature.view)}
                className="glass hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-3 rounded-xl p-6 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <feature.icon className="text-primary size-5" aria-hidden="true" />
                <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.body}</p>
                <span className="text-accent mt-auto text-sm font-medium">{feature.cta}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 3 — Syllabus preview                                  */}
      {/* ============================================================ */}
      <section className="border-border border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-3 animate-fade-up">
            <p className="label-instrument text-primary">The syllabus</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Four stages, sixteen modules, in flying order
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Each stage ends with you able to do something specific in the simulator.
              Nothing is introduced before you need it.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-10">
            {STAGES.map((stage, stageIndex) => (
              <div key={stage.name} className="flex flex-col gap-5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-primary font-mono text-sm">
                    {String(stageIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">{stage.name}</h3>
                  <p className="text-muted-foreground text-sm">{stage.subtitle}</p>
                </div>

                <ul className="grid gap-3 sm:grid-cols-2">
                  {stage.ids.map((id) => {
                    const mod = allModules.find((m) => m.id === id);
                    if (!mod) return null;
                    return (
                      <li key={mod.id}>
                        <button
                          onClick={() => navigate("module", mod.id)}
                          className="glass hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-2 rounded-xl p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium leading-snug">
                              <span className="text-muted-foreground font-mono text-xs">
                                {String(mod.id).padStart(2, "0")}{" "}
                              </span>
                              {mod.title}
                            </p>
                            {mod.id <= 7 ? (
                              <span className="border-border shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Free
                              </span>
                            ) : (
                              <Lock
                                className="text-muted-foreground mt-1 size-3.5 shrink-0"
                                aria-label="Pro module"
                              />
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {mod.tagline}
                          </p>
                          <p className="text-muted-foreground mt-auto flex items-center gap-1.5 font-mono text-xs">
                            <Clock className="size-3" aria-hidden="true" />
                            {mod.estimatedMinutes} min
                            <span aria-hidden="true">·</span>
                            {mod.difficulty}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 4 — Training games                                    */}
      {/* ============================================================ */}
      <section className="border-border border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-3 animate-fade-up">
            <p className="label-instrument text-primary">Practice</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Three training games, built in
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Reading is the theory. These are where you build the muscle memory.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {GAMES.map((game) => (
              <button
                key={game.title}
                onClick={() => navigate(game.view)}
                className="glass hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-3 rounded-xl p-6 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <game.icon className="text-primary size-5" aria-hidden="true" />
                <h3 className="font-semibold tracking-tight">{game.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{game.body}</p>
                <span className="text-accent mt-auto text-sm font-medium">Play</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 5 — FAQ teaser                                        */}
      {/* ============================================================ */}
      <section className="border-border border-t">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-3">
            <p className="label-instrument text-primary">Questions</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Before you start the engine
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-10 w-full">
            {topFaqs.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-muted-foreground mt-8 text-sm">
            <button
              onClick={() => navigate("faq")}
              className="text-accent font-medium hover:underline"
            >
              Read all {faqItems.length} questions
            </button>
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Section 6 — Final CTA                                         */}
      {/* ============================================================ */}
      <section className="border-border bg-horizon border-t">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your first flight is one module away
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            Read the first seven modules free. No account, no paywall, no credit card. Just
            open module one and start.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate("path")} className="fp-toggle-btn px-5 py-3 text-sm">
              Start the course
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <button onClick={() => navigate("setup")} className="fp-outline-btn px-5 py-3 text-sm">
              Set up your sim
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
