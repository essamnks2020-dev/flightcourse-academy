"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/data/faq";
import { useNav } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

const CATEGORIES: string[] = [
  "All",
  ...Array.from(new Set(faqItems.map((i) => i.category))),
];

/* ============================================================
 * FAQ view — full list with category filter
 * Glass Cockpit design system. No emoji, no Framer Motion.
 * ========================================================== */

export function FaqView() {
  const navigate = useNav((s) => s.navigate);
  const [category, setCategory] = React.useState<string>("All");

  const filtered = React.useMemo(
    () =>
      category === "All"
        ? faqItems
        : faqItems.filter((i) => i.category === category),
    [category]
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="mb-8 animate-fade-up">
        <p className="label-instrument text-primary mb-3">Help</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          Everything a new simulator pilot tends to ask before they start. If
          your question isn&apos;t here, the glossary and setup guide probably
          cover it.
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
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

      {/* Result count */}
      <p className="label-instrument mb-4 text-muted-foreground">
        {filtered.length} questions
      </p>

      {/* Accordion */}
      <Accordion type="single" collapsible className="flex flex-col">
        {filtered.map((item) => (
          <AccordionItem
            key={item.question}
            value={item.question}
            className="border-border border-b"
          >
            <AccordionTrigger className="text-left hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* CTA */}
      <div className="glass mt-10 flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold tracking-tight">Still stuck?</p>
          <p className="text-sm text-muted-foreground">
            The learning path lays out every module in order, module 1 first.
          </p>
        </div>
        <button
          onClick={() => navigate("path")}
          className="fp-outline-btn shrink-0 px-4 py-2 text-sm"
        >
          Start with module 1
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
