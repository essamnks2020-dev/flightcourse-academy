"use client";

import * as React from "react";
import { Headphones, X, Send, Volume2, VolumeX, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress-store";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED = [
  "What's the best approach speed for a C172?",
  "How do I read a METAR?",
  "What's a traffic pattern?",
  "Explain VOR navigation",
];

// Try to find a good voice
function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  // Prefer male, English voices — sounds more like a CFI
  const preferred = [
    "Google US English",
    "Microsoft Guy",
    "Microsoft David",
    "Alex",
    "Daniel",
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en")) || voices[0];
}

export function PilotHelper() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [voiceOn, setVoiceOn] = React.useState(true);
  const [voice, setVoice] = React.useState<SpeechSynthesisVoice | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const progress = useProgress();

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const setV = () => setVoice(pickVoice());
      setV();
      window.speechSynthesis.onvoiceschanged = setV;
    }
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function speak(text: string) {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.rate = 1.05;
    utter.pitch = 0.95;
    utter.volume = 0.8;
    window.speechSynthesis.speak(utter);
  }

  async function ask(q: string) {
    const question = q.trim();
    if (!question || loading) return;

    const userMsg: Message = { role: "user", text: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/pilot-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      const answerText = data.answer || data.error || "I couldn't reach the AI. Please try again.";
      const aiMsg: Message = { role: "assistant", text: answerText };
      setMessages((m) => [...m, aiMsg]);
      speak(answerText);
    } catch {
      const errMsg = "I couldn't reach the AI. Please try again.";
      setMessages((m) => [...m, { role: "assistant", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  }

  const completedCount = progress.getCompletedCount();
  const xp = progress.xp;
  const tier = progress.getLicenseTier();

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Copilot" : "Open Copilot"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-[0_8px_30px_-4px_oklch(0.75_0.13_68_/_50%)] hover:shadow-[0_12px_40px_-4px_oklch(0.75_0.13_68_/_65%)]",
          "ring-1 ring-primary/30",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          open && "rotate-90"
        )}
      >
        {open ? <X className="size-5" /> : <Headphones className="size-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="glass animate-fade-up fixed bottom-20 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-[380px] flex-col rounded-2xl p-4 shadow-2xl"
          style={{ maxHeight: "560px" }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                <Headphones className="size-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight">Copilot</span>
                <span className="text-[9px] text-muted-foreground">Your AI flight instructor</span>
              </div>
            </div>
            <button
              onClick={() => setVoiceOn((v) => !v)}
              className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-primary"
              aria-label={voiceOn ? "Mute voice" : "Unmute voice"}
              title={voiceOn ? "Voice on" : "Voice off"}
            >
              {voiceOn ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            </button>
          </div>

          {/* Progress strip */}
          {completedCount > 0 && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-xs">
              <TrendingUp className="size-3.5 text-accent shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{tier.name}</span> · {completedCount}/16 modules · {xp} XP
              </span>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2 py-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Hi, I&apos;m Copilot — ask me anything about flying, radio calls, navigation, or weather.
                </p>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="glass rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-1">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      m.role === "user"
                        ? "self-end bg-primary text-primary-foreground"
                        : "self-start bg-muted text-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div className="self-start flex gap-1 rounded-xl bg-muted px-3 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-1.5 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
