"use client";

import * as React from "react";
import { Plane, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function PilotHelper() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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

      if (!res.ok) {
        const aiMsg: Message = {
          role: "assistant",
          text: data.error || "I couldn't reach the AI. Please try again.",
        };
        setMessages((m) => [...m, aiMsg]);
      } else {
        const aiMsg: Message = { role: "assistant", text: data.answer };
        setMessages((m) => [...m, aiMsg]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I couldn't reach the AI. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Pilot Helper" : "Open Pilot Helper"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-[0_8px_30px_-4px_oklch(0.79_0.152_74_/_50%)] hover:shadow-[0_12px_40px_-4px_oklch(0.79_0.152_74_/_65%)]",
          "ring-1 ring-primary/30",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          open && "rotate-90"
        )}
      >
        {open ? <X className="size-5" /> : <Plane className="size-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="glass animate-fade-up fixed bottom-20 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-[380px] flex-col rounded-2xl p-4 shadow-2xl"
          style={{ maxHeight: "500px" }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="font-semibold text-sm tracking-tight">Pilot Helper</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Powered by Gemini</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2 py-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Ask me anything about flying, radio calls, navigation, weather…
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
              placeholder="Ask a question…"
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
