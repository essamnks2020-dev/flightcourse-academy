# Task ID 9+10 — Glass Cockpit Views Agent (Learning Path + Module)

## Assignment
Rewrite two React view files in the new Glass Cockpit design system:
1. `/home/z/my-project/src/components/views/learning-path-view.tsx` — syllabus overview (4 stages × 4 modules)
2. `/home/z/my-project/src/components/views/module-view.tsx` — single-module reader with content blocks, quiz, prev/next nav

## Context I read before starting
- `/home/z/my-project/worklog.md` — full project history (foundation Task 1, content Tasks 3a/3b/3c/3d, integration Task 4-13, GLB model Task V10, Glass Cockpit visual overhaul Task V11-RESEARCH)
- `/home/z/my-project/src/app/globals.css` — confirmed `glass`, `bg-grid`, `bg-horizon`, `glow-primary`, `glow-accent`, `label-instrument`, `nums`, `text-shadow-glow`, `animate-fade-up`, `fp-toggle-btn`, `fp-outline-btn`, plus color tokens
- `/home/z/my-project/src/lib/data/modules.ts` — exports `allModules`, `getModule`, `getNextModule`, `getPrevModule`, `TOTAL_MODULES`, `TOTAL_XP`
- `/home/z/my-project/src/lib/content-types.ts` — `ModuleContent`, `ContentBlock` union (paragraph | heading | list | callout | diagram)
- `/home/z/my-project/src/lib/nav-store.ts` — `useNav.navigate(view, moduleId?)`, `useNav.openModule(id)`
- `/home/z/my-project/src/lib/progress-store.ts` — `useProgress.isModuleCompleted(id)`, `isModuleUnlocked(id, prereqs)`, `startModule(id)`
- `/home/z/my-project/src/components/callout-box.tsx` — `CalloutBox({ variant, title, children })` with info/warning/tip variants
- `/home/z/my-project/src/components/quiz.tsx` — `QuizComponent({ moduleId, xpReward, questions, moduleTitle })`
- `/home/z/my-project/src/components/glossary-tooltip.tsx` — `GlossaryTooltip({ term, children })` for single terms, `GlossaryText({ text })` for auto-linking all terms in a string
- `/home/z/my-project/src/components/diagrams.tsx` — `DiagramRenderer({ diagramKey, caption })` is the export (not `Diagram`)

## What I built

### learning-path-view.tsx
- `"use client"` syllabus overview
- Container: `mx-auto w-full max-w-6xl px-4 py-12 sm:px-6`
- Header: `label-instrument text-primary` "The syllabus" eyebrow + H1 "Four stages, sixteen modules, in flying order" + subhead
- Summary bar: `glass rounded-2xl p-5` with 3 stats (Modules=16, Total XP=sum, Estimated time=round(sum minutes/60)+" h"), each with `label-instrument text-muted-foreground` label + `nums text-2xl font-medium` value
- 4 stages: First flights / Controlling the aircraft / Leaving the pattern / Going further
- Each stage header: zero-padded mono stage number (`text-primary font-mono text-sm`) + stage name (`text-xl font-semibold tracking-tight`) + subtitle (`text-muted-foreground text-sm`)
- Module cards: `<button onClick={() => openModule(mod.id)}>` with base classes `glass hover:border-primary/40 flex h-full flex-col gap-2 rounded-xl p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`; adds `border-primary/40` if completed, `opacity-55` if locked
- Card content: id+title row with status indicator (Check if completed / Lock if locked / "Free" pill if id<=7 and not completed / open circle otherwise) / tagline / mono footer with Clock icon + minutes + difficulty + XP

### module-view.tsx
- `"use client"` module reader
- Container: `mx-auto w-full max-w-3xl px-4 py-12 sm:px-6` (reading width)
- `useEffect` calls `startModule(moduleId)` on mount
- Breadcrumb: `<button onClick={() => navigate("path")}>` with ArrowLeft + "All modules"
- Header: meta row (label-instrument "Module NN · Category" + Free/Pro badge — Pro badge has a Lock icon — + Complete pill if completed) + H1 + tagline + mono meta row (Clock + minutes, difficulty, XP, question count)
- "Why this matters" callout: `glass mt-8 flex flex-col gap-2 rounded-xl p-5` with `label-instrument text-accent` eyebrow
- Sections: `mt-12 flex flex-col gap-12`, each `<section>` with H2 `border-b border-border pb-3 text-xl font-semibold tracking-tight text-balance`
- `ContentBlockRenderer` switch on block.type:
  - paragraph → `<p className="text-muted-foreground leading-relaxed"><GlossaryText text={block.text} /></p>`
  - heading → `<h3 className="mt-2 text-lg font-semibold tracking-tight">`
  - list ordered → `<ol className="marker:text-primary marker:font-mono flex list-decimal flex-col gap-2 pl-5 text-sm">`
  - list unordered → `<ul className="flex flex-col gap-2 text-sm">`
  - callout → `<CalloutBox variant={block.variant} title={block.title}><p>{block.body}</p></CalloutBox>`
  - diagram → `<DiagramRenderer diagramKey={block.diagramKey} caption={block.caption} />`
- Common mistake: destructive-tinted box with TriangleAlert icon
- Try it in the sim: `glass` box with Sparkles icon + ordered list
- Key takeaways: checklist with Check icons
- Quiz: H2 "Check your understanding" + `<QuizComponent moduleId={mod.id} xpReward={mod.xpReward} questions={mod.quiz} moduleTitle={mod.title} />`
- Bottom nav: `border-t border-border mt-16 pt-8` with prev (fp-outline-btn + ArrowLeft + shortTitle) and next (fp-toggle-btn + shortTitle + ArrowRight); empty `<span />` if no prev

## Verification
- `bun run lint` — ZERO errors / warnings in either of my two files (the 1 error in checklists-view.tsx and 3 warnings elsewhere are pre-existing and unrelated)
- dev.log shows `GET / 200` — my view files compile without TypeScript or React errors
- All 7 imported lucide icons (ArrowLeft, ArrowRight, Check, Clock, Lock, Sparkles, TriangleAlert) are actually used in module-view.tsx — Lock appears on the Pro badge, so no unused-import lint error
- Did NOT touch any other file. Only rewrote the two view files as instructed

## Notes for downstream agents
- Used `GlossaryText` (not `GlossaryTooltip`) for auto-linking glossary terms in paragraphs and list items — `GlossaryTooltip` requires a single explicit `term` prop and would not auto-link. The spec's prose ("wraps text to auto-link glossary terms") describes `GlossaryText`'s actual behavior.
- The module-view's prev/next nav uses `prev.shortTitle` and `next.shortTitle` (not full `title`) for compact buttons — matches the `shortTitle` field on `ModuleContent`.
- Module IDs 1–7 are marked "Free" (matching the spec's `id <= 7` rule); modules 8–16 show a "Pro" pill with a small Lock icon to use the imported `Lock` lucide icon meaningfully.
- Card border-color override (`border-primary/40` on a `glass` base) follows the same pattern `callout-box.tsx` already uses (`glass` + `border-accent/30`), so it should render identically to that established component.
