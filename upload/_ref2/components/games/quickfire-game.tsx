"use client"

import { Instrument } from "@/components/games/instruments"
import { GameSummary } from "@/components/games/game-summary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { GameDef } from "@/lib/content/games"
import { generateRun, type QuickfireRound } from "@/lib/games/generators"
import { cn } from "@/lib/utils"
import { Check, Play, Timer, X, Zap } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type Phase = "idle" | "playing" | "review" | "done"

export function QuickfireGame({
  game,
  signedIn,
}: {
  game: GameDef
  signedIn: boolean
}) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [rounds, setRounds] = useState<QuickfireRound[]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [secondsLeft, setSecondsLeft] = useState(game.seconds)
  const startedAt = useRef<number>(0)

  const start = useCallback(() => {
    setRounds(generateRun(game.slug, game.rounds))
    setIndex(0)
    setPicked(null)
    setCorrect(0)
    setAnswers([])
    setSecondsLeft(game.seconds)
    startedAt.current = Date.now()
    setPhase("playing")
  }, [game.rounds, game.seconds, game.slug])

  // Countdown. Runs during both playing and review so reading the explanation
  // still costs you time — that is the point of a timed drill.
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

  const answer = (choice: number) => {
    if (phase !== "playing") return
    const wasRight = choice === rounds[index].correctIndex
    setPicked(choice)
    setCorrect((c) => c + (wasRight ? 1 : 0))
    setAnswers((a) => [...a, wasRight])
    setPhase("review")
  }

  const next = () => {
    if (index + 1 >= rounds.length) {
      setPhase("done")
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
    setPhase("playing")
  }

  // Keyboard: 1-4 to answer, Enter/Space to advance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "playing") {
        const n = Number(e.key)
        if (n >= 1 && n <= rounds[index]?.options.length) answer(n - 1)
      } else if (phase === "review" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (phase === "idle") {
    return (
      <StartCard game={game} onStart={start}>
        <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <Zap className="text-primary size-4 shrink-0" aria-hidden="true" />
            {game.rounds} rounds, freshly generated every run
          </li>
          <li className="flex items-center gap-2">
            <Timer className="text-primary size-4 shrink-0" aria-hidden="true" />
            {Math.round(game.seconds / 60)} minute clock for the whole set
          </li>
          <li className="flex items-center gap-2">
            <Check className="text-primary size-4 shrink-0" aria-hidden="true" />
            {game.passMark}% to pass — keys 1-4 work too
          </li>
        </ul>
      </StartCard>
    )
  }

  if (phase === "done") {
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000)
    return (
      <GameSummary
        game={game}
        score={correct}
        answered={answers.length}
        durationSeconds={elapsed}
        signedIn={signedIn}
        onReplay={start}
      />
    )
  }

  const round = rounds[index]
  const timePct = (secondsLeft / game.seconds) * 100
  const low = secondsLeft <= 15

  return (
    <div className="flex flex-col gap-6">
      {/* Status strip */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-5">
          <Readout label="Round" value={`${index + 1}/${rounds.length}`} />
          <Readout label="Correct" value={String(correct)} />
          <Readout
            label="Clock"
            value={`${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
            className={low ? "text-destructive" : undefined}
          />
        </div>
        <div className="flex w-full items-center gap-3 sm:w-56">
          <Progress
            value={timePct}
            aria-label="Time remaining"
            className={cn("h-1.5", low && "[&>div]:bg-destructive")}
          />
        </div>
      </div>

      <div className="glass flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
        {round.instrument ? (
          <Instrument spec={round.instrument} className="self-center" />
        ) : null}

        {round.payload ? (
          <pre className="border-border bg-background/60 text-foreground overflow-x-auto rounded-xl border p-4 font-mono text-[0.8125rem] leading-relaxed tracking-tight">
            {round.payload}
          </pre>
        ) : null}

        <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
          {round.prompt}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {round.options.map((option, i) => {
            const isCorrect = i === round.correctIndex
            const isPicked = i === picked
            const revealed = phase === "review"
            return (
              <button
                key={option}
                type="button"
                onClick={() => answer(i)}
                disabled={revealed}
                aria-label={`Option ${i + 1}: ${option}`}
                className={cn(
                  "border-border bg-card/60 hover:border-primary/60 hover:bg-card flex items-center gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-default",
                  revealed && isCorrect && "border-success bg-success/12",
                  revealed &&
                    isPicked &&
                    !isCorrect &&
                    "border-destructive bg-destructive/12",
                  revealed && !isCorrect && !isPicked && "opacity-55",
                )}
              >
                <span
                  className={cn(
                    "label-instrument border-border text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg border",
                    revealed && isCorrect && "border-success text-success",
                    revealed &&
                      isPicked &&
                      !isCorrect &&
                      "border-destructive text-destructive",
                  )}
                >
                  {revealed && isCorrect ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : revealed && isPicked ? (
                    <X className="size-3.5" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="text-sm leading-relaxed font-medium">
                  {option}
                </span>
              </button>
            )
          })}
        </div>

        {phase === "review" ? (
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "rounded-xl border p-4",
                picked === round.correctIndex
                  ? "border-success/40 bg-success/8"
                  : "border-primary/40 bg-primary/8",
              )}
            >
              <p className="label-instrument mb-2">
                {picked === round.correctIndex ? (
                  <span className="text-success">Correct</span>
                ) : (
                  <span className="text-primary">Not quite</span>
                )}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {round.explanation}
              </p>
            </div>
            <Button onClick={next} className="self-start">
              {index + 1 >= rounds.length ? "See results" : "Next round"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export function Readout({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label-instrument text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-lg font-medium", className)}>
        {value}
      </span>
    </div>
  )
}

export function StartCard({
  game,
  onStart,
  children,
}: {
  game: GameDef
  onStart: () => void
  children: React.ReactNode
}) {
  return (
    <div className="glass glow-primary flex flex-col gap-6 rounded-2xl p-6 sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="label-instrument">
          {game.skill}
        </Badge>
        <Badge variant={game.tier === "pro" ? "default" : "secondary"}>
          {game.tier === "pro" ? "Pro" : "Free"}
        </Badge>
        <Badge variant="ghost">+{game.xpReward} XP</Badge>
      </div>

      <p className="text-muted-foreground max-w-2xl leading-relaxed">
        {game.description}
      </p>

      {children}

      <Button size="lg" onClick={onStart} className="self-start">
        <Play className="size-4" aria-hidden="true" />
        Start drill
      </Button>
    </div>
  )
}
