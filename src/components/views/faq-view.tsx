"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, AlertCircle } from "lucide-react";
import { faqItems } from "@/lib/data/faq";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Getting Started", "Simulators & Hardware", "Real Flying", "Course & Progress"];

export function FaqView() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filtered = activeCategory
    ? faqItems.map((item, i) => ({ item, i })).filter(({ item }) => item.category === activeCategory)
    : faqItems.map((item, i) => ({ item, i }));

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky mb-2">
          <HelpCircle className="w-4 h-4" />
          {faqItems.length} Questions Answered
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground">
          Straight answers. No upselling. If you have a question that isn't
          here, it's probably answered in one of the modules.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "text-xs font-mono px-3 py-1.5 border transition-colors",
            !activeCategory ? "bg-sky/15 border-sky text-sky" : "border-border text-muted-foreground hover:border-sky/50"
          )}
        >
          All Questions
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "text-xs font-mono px-3 py-1.5 border transition-colors",
              activeCategory === cat ? "bg-sky/15 border-sky text-sky" : "border-border text-muted-foreground hover:border-sky/50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {filtered.map(({ item, i }) => (
          <div key={i} className="fp-bezel bg-card overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
              aria-expanded={openIdx === i}
            >
              <span className="font-heading font-semibold text-sm sm:text-base">{item.question}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform",
                  openIdx === i && "rotate-180 text-sky"
                )}
              />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <div className="border-l-2 border-sky pl-4 text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-3">
                      {item.category}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Honest disclaimer */}
      <div className="fp-bezel bg-gold/5 border-gold p-5 mt-8 flex gap-3">
        <AlertCircle className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-heading font-semibold mb-1">A note on real certification</p>
          <p className="text-muted-foreground leading-relaxed">
            FlightCourse Academy teaches genuine aviation knowledge and builds
            real procedure muscle memory — but it is not a substitute for
            certified flight training. To earn a real pilot's license, you need
            a Certified Flight Instructor (CFI), a medical certificate, logged
            flight hours in a real aircraft, and written + practical exams
            administered by your country's aviation authority. Think of this as
            the best possible head start.
          </p>
        </div>
      </div>
    </div>
  );
}
