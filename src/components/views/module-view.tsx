"use client";

import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Lock,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import { getModule, getNextModule, getPrevModule } from "@/lib/data/modules";
import { CalloutBox } from "@/components/callout-box";
import { GlossaryText } from "@/components/glossary-tooltip";
import { DiagramRenderer } from "@/components/diagrams";
import { QuizComponent } from "@/components/quiz";
import type { ContentBlock } from "@/lib/content-types";

export function ModuleView({ moduleId }: { moduleId: number }) {
  const mod = getModule(moduleId);
  const navigate = useNav((s) => s.navigate);
  const openModule = useNav((s) => s.openModule);
  const startModule = useProgress((s) => s.startModule);
  const isCompleted = useProgress((s) => s.isModuleCompleted);

  // Track that the module was started so progress reflects reading.
  useEffect(() => {
    startModule(moduleId);
  }, [moduleId, startModule]);

  if (!mod) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-muted-foreground">Module not found.</p>
        <button
          onClick={() => navigate("path")}
          className="fp-outline-btn mt-4 px-4 py-2 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          All modules
        </button>
      </div>
    );
  }

  const prev = getPrevModule(mod.id);
  const next = getNextModule(mod.id);
  const completed = isCompleted(mod.id);
  const isFree = mod.id <= 7;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("path")}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        All modules
      </button>

      {/* Header */}
      <header className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-instrument text-primary">
            Module {String(mod.id).padStart(2, "0")} · {mod.category}
          </span>
          {isFree ? (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Free
            </span>
          ) : (
            <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium">
              <Lock className="size-2.5" />
              Pro
            </span>
          )}
          {completed && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
              Complete
            </span>
          )}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {mod.title}
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
          {mod.tagline}
        </p>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3" />
            {mod.estimatedMinutes} min
          </span>
          <span>{mod.difficulty}</span>
          <span>{mod.xpReward} XP</span>
          <span>{mod.quiz.length} questions</span>
        </div>
      </header>

      {/* Why this matters */}
      <section className="glass mt-8 flex flex-col gap-2 rounded-xl p-5">
        <p className="label-instrument text-accent">Why this matters</p>
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
          {mod.whyItMatters}
        </p>
      </section>

      {/* Content sections */}
      <div className="mt-12 flex flex-col gap-12">
        {mod.sections.map((section, si) => (
          <section key={si} className="flex flex-col gap-5">
            <h2 className="border-border border-b pb-3 text-xl font-semibold tracking-tight text-balance">
              {section.heading}
            </h2>
            {section.blocks.map((block, bi) => (
              <ContentBlockRenderer key={bi} block={block} />
            ))}
          </section>
        ))}
      </div>

      {/* Common mistake */}
      <section className="mt-12 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <TriangleAlert className="text-destructive mt-0.5 size-4 shrink-0" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-sm font-semibold">
            Common mistake: {mod.commonMistake.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {mod.commonMistake.body}
          </p>
        </div>
      </section>

      {/* Try it in the sim */}
      <section className="glass mt-6 flex flex-col gap-4 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <h2 className="font-semibold tracking-tight">{mod.tryItInSim.title}</h2>
        </div>
        <ol className="marker:text-primary marker:font-mono flex list-decimal flex-col gap-2 pl-5 text-sm">
          {mod.tryItInSim.steps.map((step, i) => (
            <li key={i} className="leading-relaxed">
              <GlossaryText text={step} />
            </li>
          ))}
        </ol>
      </section>

      {/* Key takeaways */}
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Key takeaways</h2>
        <ul className="flex flex-col gap-2">
          {mod.keyTakeaways.map((tk, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <Check className="text-primary mt-0.5 size-4 shrink-0" />
              <span className="leading-relaxed">{tk}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quiz */}
      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Check your understanding</h2>
        <QuizComponent
          moduleId={mod.id}
          xpReward={mod.xpReward}
          questions={mod.quiz}
          moduleTitle={mod.title}
        />
      </section>

      {/* Bottom nav */}
      <nav className="border-border mt-16 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:justify-between">
        {prev ? (
          <button
            onClick={() => openModule(prev.id)}
            className="fp-outline-btn px-4 py-2 text-sm"
          >
            <ArrowLeft className="size-3.5" />
            {prev.shortTitle}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            onClick={() => openModule(next.id)}
            className="fp-toggle-btn px-4 py-2 text-sm"
          >
            {next.shortTitle}
            <ArrowRight className="size-3.5" />
          </button>
        ) : null}
      </nav>
    </div>
  );
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-muted-foreground leading-relaxed">
          <GlossaryText text={block.text} />
        </p>
      );
    case "heading":
      return <h3 className="mt-2 text-lg font-semibold tracking-tight">{block.text}</h3>;
    case "list":
      if (block.ordered) {
        return (
          <ol className="marker:text-primary marker:font-mono flex list-decimal flex-col gap-2 pl-5 text-sm">
            {block.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                <GlossaryText text={item} />
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="flex flex-col gap-2 text-sm">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <GlossaryText text={item} />
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <CalloutBox variant={block.variant} title={block.title}>
          <p>{block.body}</p>
        </CalloutBox>
      );
    case "diagram":
      return <DiagramRenderer diagramKey={block.diagramKey} caption={block.caption} />;
  }
}
