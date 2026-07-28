"use client";

import * as React from "react";
import { Mic, MicOff, X, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { phraseSimilarity, clamp } from "@/lib/utils";

interface Props {
  targetPhrase: string;
  onSpoke: (score: number) => void;
  onClose: () => void;
}

// Minimal structural typing for the Web Speech API (vendor-prefixed in some browsers).
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function SayItMode({ targetPhrase, onSpoke, onClose }: Props) {
  const SR = getSpeechRecognition();
  const supported = !!SR;

  const recRef = React.useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [score, setScore] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const doneRef = React.useRef(false);

  const stop = React.useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = React.useCallback(() => {
    if (!SR) return;
    setError(null);
    setTranscript("");
    setScore(null);
    doneRef.current = false;
    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (e) => {
        let text = "";
        const results = e.results as unknown as ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal: boolean }
        >;
        for (let i = 0; i < results.length; i++) {
          text += results[i][0].transcript;
        }
        setTranscript(text);
        const last = results[results.length - 1];
        if (last && last.isFinal && !doneRef.current) {
          doneRef.current = true;
          const sim = phraseSimilarity(text, targetPhrase);
          const pct = Math.round(clamp(sim, 0, 1) * 100);
          setScore(pct);
          if (sim >= 0.8) {
            onSpoke(pct);
          }
        }
      };
      rec.onerror = (e) => {
        setError(e.error || "Speech recognition error");
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setError("Could not start microphone");
      setListening(false);
    }
  }, [SR, targetPhrase, onSpoke]);

  React.useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const verdict =
    score === null
      ? null
      : score >= 80
        ? { tone: "good", label: "On the air! Readback received.", icon: <Check className="size-4" /> }
        : score >= 60
          ? { tone: "ok", label: "Close — say again, a little clearer.", icon: <AlertTriangle className="size-4" /> }
          : { tone: "bad", label: "Didn't catch that — try again.", icon: <AlertTriangle className="size-4" /> };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fc-bezel rounded-2xl w-full max-w-lg p-5 sm:p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
          aria-label="Close Say-It mode"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono tracking-wider text-gold">SAY-IT MODE</span>
        </div>
        <h3 className="font-display text-lg font-bold text-white">Speak the transmission</h3>
        <p className="text-sm text-slate-300 mt-1">
          Read the assembled call aloud. Your browser grades it against the correct phrase.
        </p>

        <div className="mt-3 rounded-lg bg-navy-700/50 border border-white/5 px-3 py-2">
          <div className="text-[10px] font-mono tracking-wider text-slate-400 mb-0.5">
            CORRECT PHRASE
          </div>
          <p className="font-mono text-sm text-sky-soft leading-relaxed">{targetPhrase}</p>
        </div>

        {!supported ? (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Speech recognition isn&apos;t available in this browser. Try Chrome or Edge on desktop,
            or Safari on iOS. You can still complete the scenario via the block builder.
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={listening ? stop : start}
                className={
                  "relative grid place-items-center h-20 w-20 rounded-full transition-all " +
                  (listening
                    ? "bg-red-500/20 border-2 border-red-400"
                    : "bg-gold/15 border-2 border-gold hover:bg-gold/25")
                }
                aria-label={listening ? "Stop listening" : "Start listening"}
              >
                {listening && (
                  <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                )}
                {listening ? (
                  <MicOff className="size-8 text-red-300" />
                ) : (
                  <Mic className="size-8 text-gold" />
                )}
              </button>
            </div>

            <div className="mt-3 min-h-[2.5rem] text-center">
              <AnimatePresence mode="wait">
                {transcript ? (
                  <motion.p
                    key={transcript}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-sm text-slate-100"
                  >
                    &ldquo;{transcript}&rdquo;
                  </motion.p>
                ) : (
                  <p className="text-sm text-slate-400">
                    {listening ? "Listening…" : "Tap the mic and speak naturally."}
                  </p>
                )}
              </AnimatePresence>
            </div>

            {score !== null && (
              <div className="mt-3">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.4 }}
                    className={
                      "h-full " +
                      (score >= 80
                        ? "bg-emerald-400"
                        : score >= 60
                          ? "bg-gold"
                          : "bg-red-400")
                    }
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-slate-400">Match score</span>
                  <span className="font-mono text-slate-200">{score}%</span>
                </div>
              </div>
            )}

            <AnimatePresence>
              {verdict && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm " +
                    (verdict.tone === "good"
                      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40"
                      : verdict.tone === "ok"
                        ? "bg-gold/15 text-amber-100 border border-gold/40"
                        : "bg-red-500/15 text-red-200 border border-red-500/40")
                  }
                >
                  {verdict.icon}
                  {verdict.label}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="mt-2 text-xs text-red-300">
                {error === "not-allowed"
                  ? "Microphone permission denied. Allow mic access to use Say-It."
                  : `Error: ${error}`}
              </p>
            )}
          </>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
