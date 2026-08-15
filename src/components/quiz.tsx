"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy, ChevronRight } from "lucide-react";
import type { QuizQuestion } from "@/lib/content-types";
import { useProgress } from "@/lib/progress-store";
import { useNav as useNavStore } from "@/lib/nav-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuizComponentProps {
  moduleId: number;
  xpReward: number;
  questions: QuizQuestion[];
  moduleTitle: string;
}

export function QuizComponent({ moduleId, xpReward, questions, moduleTitle }: QuizComponentProps) {
  const [answers, setAnswers] = React.useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [submitted, setSubmitted] = React.useState(false);
  const submitQuiz = useProgress((s) => s.submitQuiz);
  const navigate = useNavStore((s) => s.navigate);

  const score = answers.reduce(
    (acc: number, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0),
    0
  );
  const allAnswered = answers.every((a) => a !== null);
  const passed = score >= 3;

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    const result = submitQuiz(moduleId, score, xpReward);
    if (result.leveledUp) {
      toast.success(`Module complete · +${xpReward} hours logged`);
    }
    if (result.newBadges.length > 0) {
      result.newBadges.forEach((_, i) => {
        setTimeout(() => {
          toast.success("Badge earned", {
            description: "Check your progress page to see it.",
          });
        }, 800 + i * 600);
      });
    }
    if (!passed) {
      toast.info("Review and try again", {
        description: `You scored ${score}/${questions.length}. You need 3 to complete.`,
      });
    }
  }

  function handleRetry() {
    setAnswers(new Array(questions.length).fill(null));
    setSubmitted(false);
  }

  return (
    <div className="glass rounded-xl p-5 sm:p-7">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
          Check your understanding
        </h3>
        <span className="label-instrument text-muted-foreground">
          {questions.length} questions
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Score 3 out of {questions.length} to complete this module and log your flight hours.
      </p>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="border-l-2 border-border pl-4">
            <p className="mb-3 text-sm font-medium sm:text-base">
              <span className="nums mr-2 text-accent">Q{qi + 1}.</span>
              {q.question}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = oi === q.correctIndex;
                const showResult = submitted;
                let stateClass = "border-border hover:border-accent/50 hover:bg-accent/5";
                if (showResult && isCorrect) {
                  stateClass = "border-success/50 bg-success/10";
                } else if (showResult && isSelected && !isCorrect) {
                  stateClass = "border-destructive/50 bg-destructive/10";
                } else if (isSelected) {
                  stateClass = "border-accent bg-accent/10";
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    className={cn(
                      "flex items-center gap-3 border px-3 py-2.5 text-left text-sm transition-all",
                      stateClass,
                      submitted && "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center border text-xs font-semibold",
                        showResult && isCorrect
                          ? "border-success/60 text-success bg-success/20"
                          : showResult && isSelected && !isCorrect
                          ? "border-destructive/60 text-destructive bg-destructive/20"
                          : isSelected
                          ? "border-accent text-accent bg-accent/10"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {showResult && isCorrect ? (
                        <Check className="size-3.5" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <X className="size-3.5" />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div
                    className={cn(
                      "border-l-2 px-3 py-2 text-xs",
                      answers[qi] === q.correctIndex
                        ? "border-success text-success"
                        : "border-destructive text-destructive"
                    )}
                  >
                    {answers[qi] === q.correctIndex ? "Correct. " : "Not quite. "}
                    {q.explanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-6 flex flex-col gap-4 border p-4 sm:flex-row sm:items-center sm:justify-between",
              passed ? "border-success/40 bg-success/5" : "border-primary/40 bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-12 items-center justify-center",
                  passed ? "text-success" : "text-primary"
                )}
              >
                <Trophy className="size-7" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">
                  {score}/{questions.length} {passed ? "— Passed" : "— Review and retry"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {passed
                    ? `+${xpReward} flight hours logged. Module complete.`
                    : "You need 3 to complete. Review the content and try again."}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="fp-outline-btn px-4 py-2 text-sm"
              >
                <RotateCcw className="size-3.5" />
                Retry
              </button>
              {passed && (
                <button
                  onClick={() => navigate("path")}
                  className="fp-toggle-btn px-4 py-2 text-sm"
                >
                  Continue
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={cn(
            "mt-6 w-full py-3 text-sm font-semibold transition-all",
            allAnswered
              ? "fp-toggle-btn"
              : "cursor-not-allowed border border-border text-muted-foreground opacity-50"
          )}
        >
          {allAnswered ? "Submit answers" : `Answer all ${questions.length} questions to submit`}
        </button>
      )}
    </div>
  );
}
