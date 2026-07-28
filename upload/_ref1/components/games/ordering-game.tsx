"use client"

import { GameSummary } from "@/components/games/game-summary"
import { Readout, StartCard } from "@/components/games/quickfire-game"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { GameDef } from "@/lib/content/games"
import {
  orderingRounds,
  shuffle,
  type OrderingRound,
} from "@/lib/games/generators"
import { cn } from "@/lib/utils"
import { Check, ListOrdered, Timer, Undo2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type Phase = "idle" | "playing" | "review" | "done"

/**
 * Tap-to-sequence rather than drag-and-drop: it works identically on touch and
 * keyboard, and matches how you actually run a flow — one item at a time.
 */
export function OrderingGame({
  game,
  signedIn,
}: {
  game: GameDef
  signedIn: boolean
}) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [rounds, setRounds] = useState<OrderingRound[]>([])
  const [index, setIndex] = useState(0)
  const [pool, setPool] = useState<string[]>([])
  const [placed, setPlaced] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [cleared, setCleared] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(game.seconds)
  const startedAt = useRef(0)

  const loadRound = useCallback((round: OrderingRound) => {
    setPool(shuffle(round.steps))
    setPlaced([])
    setMistakes(0)
  }, [])

  const start = useCallback(() => {
    const next = orderingRounds(game.rounds)
    setRounds(next)
    setIndex(0)
    setCleared(0)
    setSecondsLeft(game.seconds)
    startedAt.current = Date.now()
    if (next[0]) loadRound(next[0])
    setPhase("playing")
  }, [game.rounds, game.seconds, loadRound])

  useEffect(() => {
    if (phase !== "playing" && phase !== "review") return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setPhase("done")
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  const round = rounds[index]

  const place = (step: string) => {
    if (phase !== "playing" || !round) return
    const expected = round.steps[placed.length]

    if (step !== expected) {
      setMistakes((m) => m + 1)
      return
    }

    const nextPlaced = [...placed, step]
    setPlaced(nextPlaced)
    setPool((p) => p.filter((s) => s !== step))

    if (nextPlaced.length === round.steps.length) {
      // A flow counts as cleared only if you sequenced it without a single
      // mis-tap — flows are all-or-nothing in the cockpit too.
      if (mistakes === 0) setCleared((c) => c + 1)
      setPhase("review")
    }
  }

  const undo = () => {
    if (phase !== "playing" || placed.length === 0) return
    const last = placed[placed.length - 1]
    setPlaced((p) => p.slice(0, -1))
    setPool((p) => shuffle([...p, last]))
  }

  const next = () => {
    if (index + 1 >= rounds.length) {
      setPhase("done")
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
    loadRound(rounds[nextIndex])
    setPhase("playing")
  }

  if (phase === "idle") {
    return (
      <StartCard game={game} onStart={start}>
        <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <ListOrdered
              className="text-primary size-4 shrink-0"
              aria-hidden="true"
            />
            {game.rounds} real C172 flows, shuffled
          </li>
          <li className="flex items-center gap-2">
            <Timer className="text-primary size-4 shrink-0" aria-hidden="true" />
            {Math.round(game.seconds / 60)} minutes for the whole set
          </li>
          <li className="flex items-center gap-2">
            <Check className="text-primary size-4 shrink-0" aria-hidden="true" />
            A flow only counts if you sequence it with zero mis-taps
          </li>
        </ul>
      </StartCard>
    )
  }

  if (phase === "done") {
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000)
    const answered = phase === "done" && placed.length === 0 ? index : index + 1
    return (
      <GameSummary
        game={game}
        score={cleared}
        answered={Math.max(cleared, Math.min(answered, game.rounds))}
        durationSeconds={elapsed}
        signedIn={signedIn}
        onReplay={start}
      />
    )
  }

  if (!round) return null

  const low = secondsLeft <= 20

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-5">
          <Readout label="Flow" value={`${index + 1}/${rounds.length}`} />
          <Readout label="Cleared" value={String(cleared)} />
          <Readout
            label="Mis-taps"
            value={String(mistakes)}
            className={mistakes > 0 ? "text-destructive" : undefined}
          />
          <Readout
            label="Clock"
            value={`${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
            className={low ? "text-destructive" : undefined}
          />
        </div>
        <div className="w-full sm:w-56">
          <Progress
            value={(secondsLeft / game.seconds) * 100}
            aria-label="Time remaining"
            className={cn("h-1.5", low && "[&>div]:bg-destructive")}
          />
        </div>
      </div>

      <div className="glass flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="label-instrument text-primary">{round.context}</p>
          <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {round.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tap the steps in the order you would actually run them.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sequenced so far */}
          <div className="flex flex-col gap-3">
            <p className="label-instrument text-muted-foreground">Your flow</p>
            <ol className="flex flex-col gap-2">
              {placed.map((step, i) => (
                <li
                  key={step}
                  className="border-success/40 bg-success/10 flex items-start gap-3 rounded-xl border p-3"
                >
                  <span className="label-instrument text-success border-success/40 flex size-6 shrink-0 items-center justify-center rounded-md border">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{step}</span>
                </li>
              ))}
              {placed.length === 0 ? (
                <li className="border-border text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                  Nothing sequenced yet. Pick the first step.
                </li>
              ) : null}
            </ol>
            {placed.length > 0 && phase === "playing" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                className="self-start"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                Undo last
              </Button>
            ) : null}
          </div>

          {/* Remaining steps */}
          <div className="flex flex-col gap-3">
            <p className="label-instrument text-muted-foreground">
              Remaining steps
            </p>
            <div className="flex flex-col gap-2">
              {pool.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => place(step)}
                  disabled={phase !== "playing"}
                  className="border-border bg-card/60 hover:border-primary/60 hover:bg-card flex items-start gap-3 rounded-xl border p-3 text-left text-sm leading-relaxed transition-colors disabled:cursor-default disabled:opacity-55"
                >
                  <span className="border-border text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md border">
                    <ListOrdered className="size-3.5" aria-hidden="true" />
                  </span>
                  {step}
                </button>
              ))}
              {pool.length === 0 ? (
                <p className="border-success/40 bg-success/10 text-success rounded-xl border p-4 text-sm">
                  Flow complete.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {mistakes > 0 && phase === "playing" ? (
          <p
            role="status"
            className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-xl border p-3 text-sm"
          >
            <X className="size-4 shrink-0" aria-hidden="true" />
            That step comes later. Think about what has to be true first.
          </p>
        ) : null}

        {phase === "review" ? (
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "rounded-xl border p-4 text-sm leading-relaxed",
                mistakes === 0
                  ? "border-success/40 bg-success/8 text-muted-foreground"
                  : "border-primary/40 bg-primary/8 text-muted-foreground",
              )}
            >
              {mistakes === 0
                ? "Clean run — that flow is in the right order and you knew it."
                : `You got there, but with ${mistakes} mis-tap${
                    mistakes === 1 ? "" : "s"
                  }. Read it top to bottom once more before moving on.`}
            </div>
            <Button onClick={next} className="self-start">
              {index + 1 >= rounds.length ? "See results" : "Next flow"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
