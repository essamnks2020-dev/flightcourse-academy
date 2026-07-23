"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy, ChevronRight } from "lucide-react";
import type { QuizQuestion } from "@/lib/content-types";
import { useProgress, useNav } from "@/lib/progress-store";
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
  const isCompleted = useProgress((s) => s.isModuleCompleted(moduleId));

  const score = answers.reduce(
    (acc, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0),
    0
  );
  const allAnswered = answers.every((a) => a !== null);
  const passed = score >= 3;

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    const result = submitQuiz(moduleId, score, xpReward);
    if (result.leveledUp) {
      toast.success(`Module complete! +${xpReward} hours logged`, {
        description: "Your progress has been saved.",
      });
    }
    if (result.newBadges.length > 0) {
      result.newBadges.forEach((badgeId, i) => {
        setTimeout(() => {
          toast.success("Badge earned!", {
            description: "Check your progress page to see it.",
          });
        }, 800 + i * 600);
      });
    }
    if (!passed) {
      toast.info("Keep going — review and try again!", {
        description: `You scored ${score}/5. You need 3/5 to complete.`,
      });
    }
  }

  function handleRetry() {
    setAnswers(new Array(questions.length).fill(null));
    setSubmitted(false);
  }

  return (
    <div className="fp-bezel bg-card p-5 sm:p-7">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading font-bold text-lg sm:text-xl">
          Knowledge Check
        </h3>
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          5 Questions
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Score 3 out of 5 to complete this module and log your flight hours.
      </p>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="border-l-2 border-border pl-4">
            <p className="font-medium text-sm sm:text-base mb-3">
              <span className="text-sky font-mono mr-2">Q{qi + 1}.</span>
              {q.question}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = oi === q.correctIndex;
                const showResult = submitted;
                let stateClass = "border-border hover:border-sky/50 hover:bg-sky/5";
                if (showResult && isCorrect) {
                  stateClass = "border-green-500 bg-green-500/10";
                } else if (showResult && isSelected && !isCorrect) {
                  stateClass = "border-red-500 bg-red-500/10";
                } else if (isSelected) {
                  stateClass = "border-sky bg-sky/10";
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[qi] = oi;
                      setAnswers(newAnswers);
                    }}
                    className={cn(
                      "flex items-center gap-3 text-left px-3 py-2.5 border transition-all text-sm",
                      stateClass,
                      submitted && "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 flex items-center justify-center border text-xs font-mono font-bold",
                        showResult && isCorrect
                          ? "border-green-500 text-green-600 bg-green-500/20"
                          : showResult && isSelected && !isCorrect
                          ? "border-red-500 text-red-600 bg-red-500/20"
                          : isSelected
                          ? "border-sky text-sky bg-sky/10"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {showResult && isCorrect ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <X className="w-3.5 h-3.5" />
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
                      "text-xs px-3 py-2 border-l-2",
                      answers[qi] === q.correctIndex
                        ? "border-green-500 text-green-700 dark:text-green-400"
                        : "border-red-500 text-red-700 dark:text-red-400"
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

      {/* Results bar */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-6 p-4 border flex flex-col sm:flex-row items-center gap-4 justify-between",
              passed ? "border-green-500/40 bg-green-500/5" : "border-gold/40 bg-gold/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center",
                  passed ? "text-green-600" : "text-gold-dark"
                )}
              >
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="font-heading font-bold text-lg">
                  {score}/5 {passed ? "— Passed!" : "— Review and Retry"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {passed
                    ? `+${xpReward} flight hours logged. Module complete.`
                    : "You need 3/5 to complete. Review the content and try again."}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="fp-outline-btn px-4 py-2 text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
              {passed && (
                <button
                  onClick={() => navigate("path")}
                  className="fp-toggle-btn px-4 py-2 text-sm flex items-center gap-1.5"
                >
                  Continue
                  <ChevronRight className="w-3.5 h-3.5" />
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
            "w-full mt-6 py-3 font-heading font-semibold text-sm transition-all",
            allAnswered ? "fp-toggle-btn" : "border border-border text-muted-foreground cursor-not-allowed opacity-50"
          )}
        >
          {allAnswered ? "Submit Answers" : `Answer all ${questions.length} questions to submit`}
        </button>
      )}
    </div>
  );
}
