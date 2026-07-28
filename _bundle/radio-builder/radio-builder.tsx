"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { Send, Flag, Eraser, ArrowLeft, Inbox, Volume2, BookOpen } from "lucide-react";
import {
  SCENARIOS,
  SCENARIO_BY_ID,
  correctOrderOf,
  scoreForHints,
  diagnoseAttempt,
  SLOT_META,
  type Scenario,
  type AttemptDiagnosis,
} from "@/lib/scenarios";
import {
  useFlightStore,
  selectTotals,
  selectAllCompleted,
  selectNeedsReview,
  type Achievement,
} from "@/lib/store";
import {
  playClick,
  playSnap,
  playStatic,
  playSuccess,
  playError,
} from "@/lib/audio";
import { shuffle, cn } from "@/lib/utils";
import { usePointerCoarse } from "@/hooks/use-pointer";
import type { ShareCardData } from "@/lib/share";

import { RadioStackHeader } from "./radio-stack-header";
import { ScenarioBriefing } from "./scenario-briefing";
import { ScenarioMenu } from "./scenario-menu";
import { TransmissionArea } from "./transmission-area";
import { PoolWordBlock, DragGhost } from "./word-block";
import { HintPanel, type TieredHintInfo } from "./hint-panel";
import { FeedbackPanel, SlotLegend } from "./feedback-panel";
import { ScoreStrip } from "./score-strip";
import { ResultOverlay, type ScenarioResultState } from "./result-overlay";
import { SayItMode } from "./say-it-mode";
import { ShareCardModal } from "./share-card-modal";
import { PhraseologyGuide } from "./phraseology-guide";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useSpeech } from "@/lib/speech";

const MAX_HINTS = 3;

type Phase = "menu" | "briefing" | "playing";

export function RadioBuilder() {
  const coarse = usePointerCoarse();
  // Drag is ALWAYS enabled — on touch, the PointerSensor uses a delay
  // activation constraint (hold 250ms to drag) so taps don't start drags.
  const dragEnabled = true;

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<Phase>("menu");
  const [pool, setPool] = React.useState<string[]>([]);
  const [tx, setTx] = React.useState<string[]>([]);
  const [hintedIds, setHintedIds] = React.useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = React.useState(0);
  const [wrongAttempts, setWrongAttempts] = React.useState(0);
  const [vibe, setVibe] = React.useState<"idle" | "over" | "correct" | "wrong">("idle");
  const [lastHint, setLastHint] = React.useState<TieredHintInfo | null>(null);
  const [diagnosis, setDiagnosis] = React.useState<AttemptDiagnosis | null>(null);
  const [divergenceIndex, setDivergenceIndex] = React.useState<number | null>(null);
  const [liveMsg, setLiveMsg] = React.useState("");
  const [result, setResult] = React.useState<ScenarioResultState | null>(null);
  const [sayItOpen, setSayItOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [guideOpen, setGuideOpen] = React.useState(false);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [pickedUpId, setPickedUpId] = React.useState<string | null>(null);
  const speech = useSpeech();

  const recordScenarioResult = useFlightStore((s) => s.recordScenarioResult);
  const markSpokeIt = useFlightStore((s) => s.markSpokeIt);
  const logEvent = useFlightStore((s) => s.logEvent);
  const radio = useFlightStore((s) => s.radio);

  const scenario: Scenario | null = activeId ? SCENARIO_BY_ID[activeId] : null;
  const tokensById = React.useMemo(() => {
    const m: Record<string, Scenario["tokens"][number]> = {};
    if (scenario) for (const t of scenario.tokens) m[t.id] = t;
    return m;
  }, [scenario]);

  const txTokens = tx.map((id) => tokensById[id]).filter(Boolean);
  const poolTokens = pool.map((id) => tokensById[id]).filter(Boolean);
  const lockedCount = hintedIds.size;
  const potentialScore = scoreForHints(hintsUsed, false);
  const totals = selectTotals(radio);
  const allComplete = selectAllCompleted(radio);
  // First-ever scenario: no results at all yet (for guided onboarding)
  const isFirstEverScenario = Object.keys(radio.results).length === 0;

  // On touch (coarse pointer): hold 250ms to start a drag (iOS-style).
  // On mouse (fine pointer): move 8px to start a drag.
  // This lets taps/clicks fire onClick (for tap-to-swap) without starting drags.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: coarse
        ? { delay: 250, tolerance: 5 }
        : { distance: 8 },
    }),
  );

  // Keyboard shortcut: Enter transmits when blocks are placed and focus
  // isn't in an input/button. Lets keyboard-only users finish a scenario
  // without tabbing to the Transmit button.
  React.useEffect(() => {
    if (phase !== "playing" || result) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (tx.length === 0) return;
      // don't hijack Enter when a block button is focused (it places/removes)
      if (t && t.tagName === "BUTTON" && t.getAttribute("aria-label")?.startsWith("Add block")) return;
      e.preventDefault();
      transmit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, result, tx, hintsUsed, wrongAttempts]);

  function resetAttempt(sc: Scenario) {
    setPool(shuffle(sc.tokens.map((t) => t.id)));
    setTx([]);
    setHintedIds(new Set());
    setHintsUsed(0);
    setWrongAttempts(0);
    setVibe("idle");
    setLastHint(null);
    setDiagnosis(null);
    setDivergenceIndex(null);
    setLiveMsg("");
    setResult(null);
  }

  function startScenario(id: string) {
    const sc = SCENARIO_BY_ID[id];
    if (!sc) return;
    setActiveId(id);
    setPhase("briefing");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function beginPlay() {
    if (!scenario) return;
    resetAttempt(scenario);
    setPhase("playing");
    logEvent("scenario-start", { scenarioId: scenario.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToMenu() {
    setPhase("menu");
    setActiveId(null);
    setResult(null);
  }

  function addToken(id: string) {
    if (!scenario) return;
    if (result) return;
    setPool((p) => p.filter((x) => x !== id));
    setTx((prev) => [...prev, id]);
    setDivergenceIndex(null);
    setDiagnosis(null);
    playSnap();
  }

  function removeToken(id: string) {
    if (hintedIds.has(id) || result) return;
    setTx((prev) => prev.filter((x) => x !== id));
    setPool((p) => [...p, id]);
    setDivergenceIndex(null);
    setDiagnosis(null);
    setPickedUpId(null);
    playClick(440);
  }

  /** Tap-to-swap: tap a placed block to pick it up, tap another to swap. */
  function onBlockTap(id: string) {
    if (result) return;
    if (hintedIds.has(id)) return; // locked blocks can't be picked up
    if (pickedUpId === null) {
      // pick up
      setPickedUpId(id);
      playClick(660);
    } else if (pickedUpId === id) {
      // put down (same block tapped again)
      setPickedUpId(null);
      playClick(440);
    } else {
      // swap pickedUpId with id
      if (hintedIds.has(id)) {
        // can't swap with a locked block — just pick up the new one
        setPickedUpId(id);
        playClick(660);
        return;
      }
      setTx((prev) => {
        const i = prev.indexOf(pickedUpId);
        const j = prev.indexOf(id);
        if (i < 0 || j < 0) return prev;
        const copy = prev.slice();
        copy[i] = id;
        copy[j] = pickedUpId;
        return copy;
      });
      setPickedUpId(null);
      setDivergenceIndex(null);
      setDiagnosis(null);
      playSnap();
    }
  }

  function moveUp(id: string) {
    if (result) return;
    setTx((prev) => {
      const i = prev.indexOf(id);
      if (i <= lockedCount) return prev;
      const c = prev.slice();
      [c[i - 1], c[i]] = [c[i], c[i - 1]];
      return c;
    });
    playClick();
  }

  function moveDown(id: string) {
    if (result) return;
    setTx((prev) => {
      const i = prev.indexOf(id);
      if (i < 0 || i >= prev.length - 1) return prev;
      const c = prev.slice();
      [c[i], c[i + 1]] = [c[i + 1], c[i]];
      return c;
    });
    playClick();
  }

  function clearTx() {
    if (result) return;
    const unlocked = tx.filter((id) => !hintedIds.has(id));
    if (unlocked.length === 0) return;
    setTx((prev) => prev.filter((id) => hintedIds.has(id)));
    setPool((p) => [...p, ...unlocked]);
    setDivergenceIndex(null);
    setDiagnosis(null);
    setPickedUpId(null);
    playClick(330);
  }

  function useHint() {
    if (!scenario || result || hintsUsed >= MAX_HINTS) return;
    const correct = correctOrderOf(scenario);
    let k = 0;
    while (k < tx.length && tx[k] === correct[k]) k++;
    const nextId = correct[k];
    if (!nextId) return;
    const nextTok = tokensById[nextId];
    const tier = (hintsUsed + 1) as 1 | 2 | 3;

    if (tier === 1) {
      // Tier 1 — structural: reveal the SLOT only, don't move the block.
      setLastHint({ tier: 1, slot: nextTok.slot, why: SLOT_META[nextTok.slot].role });
      setLiveMsg(`Hint: the next block is the ${SLOT_META[nextTok.slot].label} slot.`);
    } else if (tier === 2) {
      // Tier 2 — specific: name the exact block text (still don't place).
      setLastHint({
        tier: 2,
        text: nextTok.text,
        why: nextTok.why,
      });
      setLiveMsg(`Hint: the next block is "${nextTok.text}".`);
    } else {
      // Tier 3 — auto-place the block and lock it.
      setPool((p) => p.filter((id) => id !== nextId));
      setTx((prev) => {
        const without = prev.filter((id) => id !== nextId);
        const copy = without.slice(0, k);
        copy.push(nextId);
        copy.push(...without.slice(k));
        return copy;
      });
      setHintedIds((prev) => new Set(prev).add(nextId));
      setLastHint({ tier: 3, text: nextTok.text, why: nextTok.why });
      setLiveMsg(`Hint: placed "${nextTok.text}" for you.`);
    }

    const nextHints = hintsUsed + 1;
    setHintsUsed(nextHints);
    setDivergenceIndex(null);
    setDiagnosis(null);
    playClick(880);
    logEvent("hint-used", { scenarioId: scenario.id, hintsUsed: nextHints, tier });
  }

  function transmit() {
    if (!scenario || result) return;
    if (tx.length === 0) return;
    playStatic();
    const d = diagnoseAttempt(tx, scenario);
    if (d.correct) {
      const firstTryClear = hintsUsed === 0 && wrongAttempts === 0;
      const score = scoreForHints(hintsUsed, false);
      window.setTimeout(() => {
        const res = recordScenarioResult({
          scenarioId: scenario.id,
          score,
          hintsUsed,
          firstTryClear,
          gaveUp: false,
        });
        logEvent("scenario-complete", {
          scenarioId: scenario.id,
          score,
          hintsUsed,
          firstTryClear,
        });
        if (res.streakMilestone) {
          logEvent("streak-milestone", {
            streak: res.streakMilestone,
            scenarioId: scenario.id,
          });
        }
        setVibe("correct");
        setDivergenceIndex(null);
        setDiagnosis(null);
        playSuccess();
        setLiveMsg(
          firstTryClear
            ? `Transmission received — first-try clear! Score ${score}.`
            : `Transmission received. Score ${score}.`,
        );
        setResult({
          score,
          firstTryClear,
          gaveUp: false,
          newAchievements: res.newAchievements as Achievement[],
          streakMilestone: res.streakMilestone,
        });
      }, 300);
    } else {
      setVibe("wrong");
      playError();
      setWrongAttempts((w) => w + 1);
      setDiagnosis(d);
      setDivergenceIndex(d.firstDivergence);
      // clear the divergence highlight after a moment (block stays, ring fades)
      window.setTimeout(() => setDivergenceIndex(null), 2400);
      window.setTimeout(() => setVibe("idle"), 720);
      setLiveMsg(
        d.firstDivergence !== null && d.firstDivergence < scenario.tokens.length
          ? `Not accepted. Position ${d.firstDivergence + 1} should be the ${
              SLOT_META[scenario.tokens[d.firstDivergence].slot].label
            } slot.`
          : "Not accepted — check your transmission.",
      );
    }
  }

  function giveUp() {
    if (!scenario || result) return;
    const correct = correctOrderOf(scenario);
    setTx(correct.slice());
    setHintedIds(new Set(correct));
    playError();
    const res = recordScenarioResult({
      scenarioId: scenario.id,
      score: 0,
      hintsUsed,
      firstTryClear: false,
      gaveUp: true,
    });
    logEvent("give-up", { scenarioId: scenario.id });
    setVibe("idle");
    setDivergenceIndex(null);
    setDiagnosis(null);
    setLiveMsg("Transmission revealed — study the correct order.");
    setResult({
      score: 0,
      firstTryClear: false,
      gaveUp: true,
      newAchievements: res.newAchievements as Achievement[],
      streakMilestone: null,
    });
  }

  function onDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveDragId(null);
    if (!over) return;
    const aData = active.data.current as
      | { tokenId?: string; container?: "pool" | "tx" }
      | undefined;
    const oData = over.data.current as
      | { tokenId?: string; container?: "pool" | "tx" }
      | undefined;
    const tokenId = aData?.tokenId;
    if (!tokenId) return;
    const aContainer = aData?.container;
    let oContainer = oData?.container;
    if (!oContainer) {
      if (over.id === "tx-area") oContainer = "tx";
      else if (over.id === "pool-area") oContainer = "pool";
    }
    const locked = hintedIds.has(tokenId);

    if (aContainer === "pool" && oContainer === "tx") {
      setPool((p) => p.filter((id) => id !== tokenId));
      setTx((prev) => {
        const overToken = oData?.tokenId;
        if (overToken && prev.includes(overToken)) {
          const idx = prev.indexOf(overToken);
          const insertAt = Math.max(lockedCount, idx);
          const copy = prev.slice();
          copy.splice(insertAt, 0, tokenId);
          return copy;
        }
        return [...prev, tokenId];
      });
      playSnap();
      return;
    }

    if (aContainer === "tx" && oContainer === "pool") {
      if (locked) return;
      setTx((prev) => prev.filter((id) => id !== tokenId));
      setPool((p) => [...p, tokenId]);
      playClick(440);
      return;
    }

    if (aContainer === "tx" && oContainer === "tx") {
      if (locked) return;
      const overToken = oData?.tokenId;
      if (!overToken || overToken === tokenId) return;
      if (hintedIds.has(overToken)) return;
      setTx((prev) => {
        const oldIndex = prev.indexOf(tokenId);
        const newIndex = prev.indexOf(overToken);
        if (oldIndex < 0 || newIndex < 0) return prev;
        if (oldIndex < lockedCount || newIndex < lockedCount) return prev;
        const copy = prev.slice();
        const [m] = copy.splice(oldIndex, 1);
        copy.splice(newIndex, 0, m);
        return copy;
      });
      playClick();
    }
  }

  function replay() {
    if (!scenario) return;
    resetAttempt(scenario);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (!scenario) return;
    const idx = SCENARIOS.findIndex((s) => s.id === scenario.id);
    const next = SCENARIOS[idx + 1];
    if (next) startScenario(next.id);
  }

  const isLast = scenario ? scenario.index === SCENARIOS.length : false;

  function openSayIt() {
    setSayItOpen(true);
    logEvent("say-it-attempt", { scenarioId: scenario?.id });
  }
  function onSpoke(score: number) {
    if (scenario) {
      markSpokeIt(scenario.id);
      logEvent("say-it-complete", { scenarioId: scenario.id, score });
      toast({
        title: "On the air! Say-It challenge complete.",
        description: "Badge earned: On the Air",
      });
    }
    setSayItOpen(false);
  }

  function onShareTapped(kind: "generic" | "cfi") {
    logEvent("share-tapped", { kind, scenarioId: scenario?.id });
  }

  function hearAssembled() {
    if (!scenario || tx.length === 0) return;
    const phrase = tx.map((id) => tokensById[id]?.text).filter(Boolean).join(" ");
    // Dynamic text — use SpeechSynthesis (the learner's own assembly varies)
    speech.speakDynamic(phrase);
  }

  const shareData: ShareCardData | null = (() => {
    if (!scenario) return null;
    return {
      score: totals.totalScore,
      maxScore: SCENARIOS.length * 100,
      streak: radio.currentStreak,
      bestStreak: radio.bestStreak,
      scenariosCompleted: totals.scenariosCompleted,
      totalScenarios: SCENARIOS.length,
      headline: allComplete
        ? "All Clear"
        : result?.firstTryClear
          ? "Nailed it!"
          : result?.gaveUp
            ? "Revealed"
            : "Radio Call Builder",
      subhead: allComplete
        ? "Every scenario complete — FAA AIM phraseology mastered."
        : `Scenario ${scenario.index}: ${scenario.title}`,
      mode: allComplete ? "complete" : "result",
    };
  })();

  const activeDragToken = activeDragId
    ? tokensById[activeDragId.replace(/^(pool|tx)-/, "")]
    : null;

  // ---------- MENU ----------
  if (phase === "menu" || !scenario) {
    return (
      <>
        <ScenarioMenu onSelect={startScenario} onOpenGuide={() => setGuideOpen(true)} />
        <PhraseologyGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
      </>
    );
  }

  // ---------- BRIEFING ----------
  if (phase === "briefing") {
    return (
      <div className="space-y-4">
        <BackBar onBack={backToMenu} onGuide={() => setGuideOpen(true)} />
        <ScenarioBriefing scenario={scenario} onStart={beginPlay} />
      </div>
    );
  }

  // ---------- PLAYING ----------
  const scenarioTokenSlots = scenario.tokens.map((t) => ({
    id: t.id,
    slot: t.slot,
    text: t.text,
  }));
  return (
    <div className="space-y-4">
      {/* ARIA live region — announces scoring, hints, and feedback for SR users */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMsg}
      </span>

      <BackBar onBack={backToMenu} onGuide={() => setGuideOpen(true)} />

      <RadioStackHeader
        activeFreq={scenario.activeFreq}
        standbyFreq={scenario.standbyFreq}
        station={scenario.station}
        callsignShort={scenario.callsignShort}
        transmitting={vibe === "correct"}
        channelLabel={scenario.type === "readback" ? "READBACK" : "COM1"}
      />

      <ScoreStrip
        hintsUsed={hintsUsed}
        potentialScore={potentialScore}
        currentStreak={radio.currentStreak}
        bestStreak={radio.bestStreak}
        scenariosCompleted={totals.scenariosCompleted}
        totalScenarios={SCENARIOS.length}
      />

      <DndContext
        sensors={dragEnabled ? sensors : []}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        accessibility={{
          announcements: {
            onDragStart({ active }) {
              const t = active.data.current?.tokenId;
              const txt = t ? tokensById[t]?.text : "";
              return `Picked up block: ${txt}. Drag to reorder.`;
            },
            onDragOver({ active, over }) {
              if (!over) return;
              const overTxt = over.data.current?.tokenId
                ? tokensById[over.data.current.tokenId]?.text
                : "transmission area";
              return `Over ${overTxt}.`;
            },
            onDragEnd({ active, over }) {
              const t = active.data.current?.tokenId;
              const txt = t ? tokensById[t]?.text : "";
              if (!over) return `Cancelled. ${txt} returned.`;
              return `Dropped ${txt}.`;
            },
            onDragCancel({ active }) {
              const t = active.data.current?.tokenId;
              const txt = t ? tokensById[t]?.text : "";
              return `Cancelled. ${txt} returned.`;
            },
          },
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          {/* Pool */}
          <div className="space-y-3">
            {/* Guided onboarding coachmark — only for first-ever scenario,
                disappears once the learner places their first block */}
            {isFirstEverScenario && tx.length === 0 && !result && (
              <div className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 flex items-center gap-2.5 animate-pulse-gold">
                <span className="grid place-items-center h-7 w-7 rounded-full bg-gold/20 text-gold shrink-0">
                  <Inbox className="size-4" />
                </span>
                <p className="text-sm text-amber-50 leading-snug">
                  <span className="font-semibold">Start here.</span>{" "}
                  {dragEnabled
                    ? "Drag a block to the transmission area — order matters."
                    : "Tap a block to add it — order matters."}
                </p>
              </div>
            )}
            <PoolArea
              tokens={poolTokens}
              dragEnabled={dragEnabled}
              onAdd={addToken}
              allSlots={scenario.tokens.map((t) => t.slot)}
            />
            <HintPanel
              hint={lastHint}
              hintsUsed={hintsUsed}
              maxHints={MAX_HINTS}
              onHint={useHint}
              disabled={!!result}
            />
          </div>

          {/* Transmission + actions */}
          <div className="space-y-3">
            <TransmissionArea
              tx={txTokens}
              hintedIds={hintedIds}
              lockedIds={hintedIds}
              dragEnabled={dragEnabled}
              vibe={vibe}
              station={scenario.station}
              callsign={scenario.callsign}
              activeFreq={scenario.activeFreq}
              divergenceIndex={divergenceIndex}
              pickedUpId={pickedUpId}
              onBlockTap={onBlockTap}
              onRemove={removeToken}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
            />

            <FeedbackPanel diagnosis={diagnosis} scenarioTokens={scenarioTokenSlots} />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={transmit}
                disabled={tx.length === 0 || !!result}
                size="lg"
                className="bg-gold text-navy hover:bg-gold/90 font-semibold flex-1 min-w-[140px] h-11"
              >
                <Send className="size-4" /> Transmit
                <kbd className="ml-1 hidden sm:inline-block rounded bg-navy/20 px-1.5 py-0.5 text-[10px] font-mono">↵</kbd>
              </Button>
              <Button
                onClick={hearAssembled}
                disabled={tx.length === 0 || !!result}
                variant="outline"
                className="border-sky/40 text-sky-soft hover:bg-sky/10 h-11"
                aria-label="Hear your assembled transmission"
              >
                <Volume2 className={cn("size-4", speech.speaking && "animate-pulse")} />
                <span className="hidden sm:inline">Hear it</span>
              </Button>
              <Button
                onClick={clearTx}
                disabled={!!result || tx.filter((id) => !hintedIds.has(id)).length === 0}
                variant="outline"
                className="border-white/15 text-slate-200 hover:bg-white/5 h-11"
              >
                <Eraser className="size-4" /> <span className="hidden sm:inline">Clear</span>
              </Button>
              <Button
                onClick={giveUp}
                disabled={!!result}
                variant="outline"
                className="border-red-400/30 text-red-300 hover:bg-red-500/10 h-11"
              >
                <Flag className="size-4" /> <span className="hidden sm:inline">Give up</span>
              </Button>
            </div>

            {!dragEnabled && (
              <p className="text-xs text-slate-400">
                Tip: tap blocks to add them in order. Tap a placed block to remove it; use the
                arrows to reorder.
              </p>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragToken ? <DragGhost token={activeDragToken} /> : null}
        </DragOverlay>
      </DndContext>

      <AnimatePresence>
        {result && (
          <ResultOverlay
            scenario={scenario}
            result={result}
            allComplete={allComplete}
            isLast={isLast}
            onNext={goNext}
            onReplay={replay}
            onMenu={backToMenu}
            onSayIt={openSayIt}
            onShare={() => setShareOpen(true)}
          />
        )}
      </AnimatePresence>

      {sayItOpen && scenario && (
        <SayItMode
          targetPhrase={scenario.fullPhrase}
          onSpoke={onSpoke}
          onClose={() => setSayItOpen(false)}
        />
      )}

      {shareOpen && shareData && (
        <ShareCardModal
          open={shareOpen}
          data={shareData}
          onClose={() => setShareOpen(false)}
          onShareTapped={onShareTapped}
        />
      )}

      <PhraseologyGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

function BackBar({ onBack, onGuide }: { onBack: () => void; onGuide?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-slate-300 hover:text-white"
      >
        <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Scenario list</span>
        <span className="sm:hidden">List</span>
      </Button>
      <div className="flex items-center gap-2">
        {onGuide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onGuide}
            className="text-slate-300 hover:text-sky-soft"
          >
            <BookOpen className="size-4" /> <span className="hidden sm:inline">Guide</span>
          </Button>
        )}
        <Badge variant="outline" className="border-white/15 text-slate-400 font-mono hidden sm:inline">
          Radio Call Builder
        </Badge>
      </div>
    </div>
  );
}

function PoolArea({
  tokens,
  dragEnabled,
  onAdd,
  allSlots,
}: {
  tokens: Scenario["tokens"];
  dragEnabled: boolean;
  onAdd: (id: string) => void;
  allSlots: Scenario["tokens"][number]["slot"][];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool-area" });
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-sky-soft/80">
          <Inbox className="size-3.5" />
          AVAILABLE BLOCKS
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          {tokens.length} left
        </div>
      </div>
      <SlotLegend slots={allSlots} className="mb-2" />
      <div
        ref={setNodeRef}
        data-over={isOver ? "true" : "false"}
        className={cn(
          "rounded-xl border border-dashed border-sky/25 bg-navy-700/25 p-3 min-h-[96px] flex flex-wrap gap-2 content-start transition-colors",
          isOver && "border-gold/60 bg-gold/5",
        )}
      >
        {tokens.length === 0 ? (
          <div className="w-full text-center py-4 text-xs text-slate-400">
            All blocks placed — check your transmission.
          </div>
        ) : (
          tokens.map((t) => (
            <PoolWordBlock
              key={t.id}
              token={t}
              draggable={dragEnabled}
              onAdd={() => onAdd(t.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
