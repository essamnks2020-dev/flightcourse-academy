"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Star, ChevronLeft, ChevronRight, Home, Compass, CheckCircle2, Lightbulb, AlertTriangle, BookOpen, Target } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { useProgress } from "@/lib/progress-store";
import { getModule, getNextModule, getPrevModule, CATEGORY_COLORS } from "@/lib/data/modules";
import type { ContentBlock } from "@/lib/content-types";
import { CalloutBox } from "@/components/callout-box";
import { GlossaryText } from "@/components/glossary-tooltip";
import { DiagramRenderer } from "@/components/diagrams";
import { QuizComponent } from "@/components/quiz";
import { cn } from "@/lib/utils";

export function ModuleView({ moduleId }: { moduleId: number }) {
  const navigate = useNav((s) => s.navigate);
  const openModule = useNav((s) => s.openModule);
  const startModule = useProgress((s) => s.startModule);
  const isCompleted = useProgress((s) => s.isModuleCompleted(moduleId));
  const isUnlocked = useProgress((s) => s.isModuleUnlocked);

  const mod = getModule(moduleId);
  const prev = getPrevModule(moduleId);
  const next = getNextModule(moduleId);

  React.useEffect(() => {
    if (mod) startModule(mod.id);
  }, [mod, startModule]);

  if (!mod) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Module not found.</p>
        <button onClick={() => navigate("path")} className="fp-outline-btn px-4 py-2 mt-4 text-sm">
          Back to Learning Path
        </button>
      </div>
    );
  }

  const unlocked = isUnlocked(mod.id, mod.prerequisites);
  const color = CATEGORY_COLORS[mod.category] || "#3E92CC";
  const nextUnlocked = next ? isUnlocked(next.id, next.prerequisites) : false;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-6 flex-wrap">
        <button onClick={() => navigate("home")} className="hover:text-sky flex items-center gap-1">
          <Home className="w-3 h-3" /> Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate("path")} className="hover:text-sky">Learning Path</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Module {mod.id}</span>
      </nav>

      {/* Module header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Module {mod.id} of 16
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 border"
            style={{ borderColor: `${color}55`, color }}
          >
            {mod.category}
          </span>
          <span
            className={cn(
              "text-[10px] font-mono px-2 py-0.5",
              mod.difficulty === "Beginner" && "bg-green-500/15 text-green-600",
              mod.difficulty === "Foundational" && "bg-sky/15 text-sky",
              mod.difficulty === "Intermediate" && "bg-gold/15 text-gold-dark",
              mod.difficulty === "Advanced" && "bg-red-500/15 text-red-600"
            )}
          >
            {mod.difficulty}
          </span>
          {isCompleted && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-green-500/15 text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          {mod.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-4">{mod.tagline}</p>
        <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{mod.estimatedMinutes} min</span>
          <span className="flex items-center gap-1.5 text-gold"><Star className="w-4 h-4" />{(mod.xpReward / 10).toFixed(1)}h reward</span>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="fp-bezel bg-card p-5 sm:p-6 mb-8 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4" style={{ color }} />
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider" style={{ color }}>
            Why This Matters
          </h2>
        </div>
        <p className="text-base leading-relaxed">{mod.whyItMatters}</p>
      </div>

      {/* Locked warning */}
      {!unlocked && (
        <div className="fp-bezel bg-gold/5 border-gold p-5 mb-8 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-gold flex-shrink-0" />
          <p className="text-sm">
            <strong>Heads up:</strong> This module recommends completing{" "}
            {mod.prerequisites.map((p, i) => (
              <React.Fragment key={p}>
                {i > 0 && " and "}
                <button onClick={() => openModule(p)} className="text-sky underline">
                  Module {p}
                </button>
              </React.Fragment>
            ))}{" "}
            first. You can still read ahead, but the concepts will make more sense in order.
          </p>
        </div>
      )}

      {/* Content sections */}
      <div className="fp-prose space-y-10 mb-10">
        {mod.sections.map((section, si) => (
          <motion.section
            key={si}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-heading font-bold text-2xl tracking-tight mb-4 flex items-baseline gap-3">
              <span className="text-xs font-mono text-muted-foreground/50">{String(si + 1).padStart(2, "0")}</span>
              {section.heading}
            </h2>
            <div className="space-y-1">
              {section.blocks.map((block, bi) => (
                <BlockRenderer key={bi} block={block} />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Common Mistake */}
      <CalloutBox variant="warning" title={mod.commonMistake.title}>
        <p>{mod.commonMistake.body}</p>
      </CalloutBox>

      {/* Try It In The Sim */}
      <div className="fp-bezel bg-gold/5 border-gold p-5 sm:p-6 my-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-gold-dark" />
          <h3 className="font-heading font-bold text-lg text-gold-dark dark:text-gold-light">
            {mod.tryItInSim.title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Fire up your simulator and do this right now. Learning sticks when your hands move.
        </p>
        <ol className="space-y-3">
          {mod.tryItInSim.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gold/20 text-gold-dark dark:text-gold-light font-mono font-bold text-xs">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Key Takeaways */}
      <div className="fp-bezel bg-card p-5 sm:p-6 my-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-sky" />
          <h3 className="font-heading font-bold text-lg">Key Takeaways</h3>
        </div>
        <ul className="space-y-2.5">
          {mod.keyTakeaways.map((kt, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <span className="text-sky flex-shrink-0 mt-0.5">✓</span>
              <span>{kt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz */}
      <div className="my-10">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-sky" />
          <h2 className="font-heading font-bold text-2xl">Test Your Knowledge</h2>
        </div>
        <QuizComponent
          moduleId={mod.id}
          xpReward={mod.xpReward}
          questions={mod.quiz}
          moduleTitle={mod.title}
        />
      </div>

      {/* Prev/Next navigation */}
      <nav className="grid sm:grid-cols-2 gap-3 mt-10 pt-8 border-t border-border">
        {prev ? (
          <button
            onClick={() => openModule(prev.id)}
            className="fp-bezel bg-card p-4 text-left hover:border-sky/50 transition-colors group flex items-center gap-3"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-sky transition-colors flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Previous</div>
              <div className="font-heading font-semibold text-sm truncate">{prev.title}</div>
            </div>
          </button>
        ) : <div />}
        {next ? (
          <button
            onClick={() => openModule(next.id)}
            className="fp-bezel bg-card p-4 text-right hover:border-sky/50 transition-colors group flex items-center gap-3 justify-end"
          >
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Next Up</div>
              <div className="font-heading font-semibold text-sm truncate">{next.title}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-sky transition-colors flex-shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => navigate("progress")}
            className="fp-toggle-gold fp-toggle-btn p-4 text-sm flex items-center gap-3 justify-center"
          >
            <Compass className="w-5 h-5" />
            View Your Progress & Certificate
          </button>
        )}
      </nav>
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p><GlossaryText text={block.text} /></p>;
    case "heading":
      return <h3 className="font-heading font-semibold text-lg mt-6 mb-2">{block.text}</h3>;
    case "list":
      if (block.ordered) {
        return (
          <ol className="space-y-2 my-4">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="text-sky font-mono font-bold flex-shrink-0">{i + 1}.</span>
                <span><GlossaryText text={item} /></span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="space-y-2 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="text-sky flex-shrink-0 mt-1">▸</span>
              <span><GlossaryText text={item} /></span>
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
    default:
      return null;
  }
}
