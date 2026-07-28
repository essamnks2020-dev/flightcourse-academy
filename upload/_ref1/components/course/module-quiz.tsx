"use client"

import { completeModule } from "@/app/actions/progress"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { QuizQuestion } from "@/lib/content-types"
import { badgeBySlug } from "@/lib/gamification"
import { Check, Loader2, RotateCcw, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export function ModuleQuiz({
  moduleSlug,
  questions,
  xpReward,
  signedIn,
  previousScore,
}: {
  moduleSlug: string
  questions: QuizQuestion[]
  xpReward: number
  signedIn: boolean
  previousScore: { score: number; total: number } | null
}) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, startSaving] = useTransition()

  const question = questions[index]
  const isLast = index === questions.length - 1

  function check() {
    if (selected === null) return
    setRevealed(true)
    if (selected === question.correctIndex) setScore((s) => s + 1)
  }

  function next() {
    const finalScore = score

    if (isLast) {
      setFinished(true)
      if (signedIn) {
        startSaving(async () => {
          try {
            const result = await completeModule(
              moduleSlug,
              { score: finalScore, total: questions.length },
              localToday(),
            )
            if (!result.alreadyComplete) {
              toast.success(`Module complete — +${xpReward} XP`, {
                description: `Study streak: ${result.streakCount} day${result.streakCount === 1 ? "" : "s"}`,
              })
            }
            for (const slug of result.newBadges) {
              const badge = badgeBySlug.get(slug)
              if (badge) {
                toast.success(`Badge earned: ${badge.name}`, {
                  description: badge.description,
                })
              }
            }
            router.refresh()
          } catch {
            toast.error("Could not save your progress. Please try again.")
          }
        })
      }
      return
    }

    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const passed = score / questions.length >= 0.7
    return (
      <div className="glass flex flex-col items-start gap-4 rounded-xl p-6">
        <p className="label-instrument text-primary">Debrief</p>
        <p className="text-3xl font-semibold">
          {score}
          <span className="text-muted-foreground text-xl"> / {questions.length}</span>
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {passed
            ? "Good pass. You have the essentials of this module — move on to the next one."
            : "Below 70%. Re-read the sections above and run the quiz again; this material comes back later."}
        </p>

        {!signedIn && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            <Link href="/sign-up" className="text-accent font-medium">
              Create a free account
            </Link>{" "}
            to save this score, earn XP and keep your streak.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={restart}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Retake quiz
          </Button>
          {saving && (
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving progress
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="glass flex flex-col gap-5 rounded-xl p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="label-instrument text-primary">
          Question {index + 1} of {questions.length}
        </p>
        {previousScore && (
          <span className="text-muted-foreground font-mono text-xs">
            Best: {previousScore.score}/{previousScore.total}
          </span>
        )}
      </div>

      <Progress value={(index / questions.length) * 100} />

      <p className="font-medium leading-relaxed text-pretty">
        {question.question}
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{question.question}</legend>
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex
          const isChosen = i === selected

          let tone = "border-border hover:border-primary/40"
          if (revealed && isCorrect) tone = "border-success/60 bg-success/10"
          else if (revealed && isChosen) tone = "border-destructive/60 bg-destructive/10"
          else if (isChosen) tone = "border-primary bg-primary/10"

          return (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${tone}`}
            >
              <input
                type="radio"
                name={`q-${index}`}
                className="sr-only"
                checked={isChosen}
                disabled={revealed}
                onChange={() => setSelected(i)}
              />
              <span
                className="border-border mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]"
                aria-hidden="true"
              >
                {revealed && isCorrect ? (
                  <Check className="text-success size-3" />
                ) : revealed && isChosen ? (
                  <X className="text-destructive size-3" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="leading-relaxed">{option}</span>
            </label>
          )
        })}
      </fieldset>

      {revealed && (
        <p className="text-muted-foreground border-border border-l-2 pl-4 text-sm leading-relaxed">
          {question.explanation}
        </p>
      )}

      <div className="flex justify-end">
        {revealed ? (
          <Button size="sm" onClick={next}>
            {isLast ? "See results" : "Next question"}
          </Button>
        ) : (
          <Button size="sm" onClick={check} disabled={selected === null}>
            Check answer
          </Button>
        )}
      </div>
    </div>
  )
}
