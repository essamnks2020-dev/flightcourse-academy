"use client";

import * as React from "react";
import { Headphones, X, Send, Volume2, VolumeX, ChevronDown, Sparkles, TrendingUp, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress-store";

interface Message {
  role: "user" | "assistant";
  text: string;
  id: number;
}

const SUGGESTED = [
  "What's the best approach speed for a C172?",
  "How do I read a METAR?",
  "What's a traffic pattern?",
  "Explain VOR navigation",
];

// Curated list of good voices to try (varies by OS/browser)
const PREFERRED_VOICES = [
  { name: "Google US English", lang: "en-US", desc: "Natural · Male" },
  { name: "Microsoft Guy", lang: "en-US", desc: "Warm · Male" },
  { name: "Microsoft David", lang: "en-US", desc: "Deep · Male" },
  { name: "Alex", lang: "en-US", desc: "Classic · Male" },
  { name: "Daniel", lang: "en-GB", desc: "British · Male" },
  { name: "Google UK English Male", lang: "en-GB", desc: "British · Male" },
  { name: "Samantha", lang: "en-US", desc: "Clear · Female" },
  { name: "Microsoft Zira", lang: "en-US", desc: "Professional · Female" },
  { name: "Google UK English Female", lang: "en-GB", desc: "British · Female" },
  { name: "Karen", lang: "en-AU", desc: "Australian · Female" },
];

let msgId = 0;

export function PilotHelper() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [voiceOn, setVoiceOn] = React.useState(true);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = React.useState<string>("");
  const [showVoiceMenu, setShowVoiceMenu] = React.useState(false);
  const [typingText, setTypingText] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const [micSupported, setMicSupported] = React.useState(false);
  const [interimText, setInterimText] = React.useState("");
  const recognitionRef = React.useRef<any>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const progress = useProgress();

  // Check if speech recognition is supported
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setMicSupported(!!SR);
    }
  }, []);

  // Voice input — start/stop listening
  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (finalText) {
        setInput(finalText);
        setInterimText("");
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      setInterimText("");
      if (event.error === "not-allowed") {
        setMessages(m => [...m, { role: "assistant", text: "I couldn't access your microphone. Please allow microphone access in your browser settings.", id: ++msgId }]);
      } else if (event.error === "no-speech") {
        // Silent — user didn't say anything
      } else if (event.error === "network") {
        setMessages(m => [...m, { role: "assistant", text: "Voice recognition needs an internet connection. Please try typing instead.", id: ++msgId }]);
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
      // Auto-submit if we got text
      if (finalText.trim()) {
        setTimeout(() => ask(finalText.trim()), 100);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setInterimText("");
  }

  // Load available voices
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter to English voices, sorted by preference
      const englishVoices = allVoices.filter(v => v.lang.startsWith("en"));
      // Sort: preferred voices first, then others
      const sorted = [...englishVoices].sort((a, b) => {
        const aPref = PREFERRED_VOICES.findIndex(p => a.name.includes(p.name));
        const bPref = PREFERRED_VOICES.findIndex(p => b.name.includes(p.name));
        if (aPref !== -1 && bPref !== -1) return aPref - bPref;
        if (aPref !== -1) return -1;
        if (bPref !== -1) return 1;
        return 0;
      });
      setVoices(sorted);
      // Auto-select the best available voice
      if (sorted.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(sorted[0].voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceURI]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, typingText]);

  function speak(text: string) {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (voice) utter.voice = voice;
    utter.rate = 1.02;
    utter.pitch = 0.92;
    utter.volume = 0.85;
    window.speechSynthesis.speak(utter);
  }

  // Typing animation for AI responses
  function animateTyping(fullText: string, msgId: number) {
    let i = 0;
    const speed = 15; // ms per character
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypingText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTypingText("");
        setMessages(m => m.map(msg =>
          msg.id === msgId ? { ...msg, text: fullText } : msg
        ));
        speak(fullText);
      }
    }, speed);
    return interval;
  }

  async function ask(q: string) {
    const question = q.trim();
    if (!question || loading) return;

    const userMsg: Message = { role: "user", text: question, id: ++msgId };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Add placeholder AI message
    const aiMsgId = ++msgId;
    setMessages(m => [...m, { role: "assistant", text: "", id: aiMsgId }]);

    try {
      const res = await fetch("/api/pilot-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      const answerText = data.answer || data.error || "I couldn't reach the AI. Please try again.";

      // Animate the typing
      const interval = animateTyping(answerText, aiMsgId);

      // Cleanup on unmount
      return () => clearInterval(interval);
    } catch {
      setMessages(m => m.map(msg =>
        msg.id === aiMsgId ? { ...msg, text: "I couldn't reach the AI. Please try again." } : msg
      ));
    } finally {
      setLoading(false);
    }
  }

  const completedCount = progress.getCompletedCount();
  const xp = progress.xp;
  const tier = progress.getLicenseTier();
  const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Close Copilot" : "Open Copilot"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground relative overflow-visible",
          "ring-1 ring-primary/30",
          "transition-all duration-300 hover:scale-110 active:scale-90",
          !open && "copilot-idle",
          open && "rotate-90"
        )}
      >
        {open ? <X className="size-5 relative z-10" /> : <Headphones className="size-5 relative z-10" />}
        {/* Ripple on click */}
        {open && <span className="copilot-ripple" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="copilot-panel-in fixed bottom-20 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-[400px] flex-col rounded-2xl shadow-2xl"
          style={{
            background: "oklch(0.18 0.022 254 / 97%)",
            backdropFilter: "blur(20px) saturate(140%)",
            border: "1px solid oklch(0.99 0.01 250 / 10%)",
            maxHeight: "600px",
          }}
        >
          {/* Header */}
          <div className="header-glow flex items-center justify-between border-b border-border p-4 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20 transition-all">
                <Headphones className="size-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight">Copilot</span>
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5">Your AI flight instructor</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <button
                onClick={() => setVoiceOn(v => !v)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg border transition-all",
                  voiceOn
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                )}
                aria-label={voiceOn ? "Mute voice" : "Unmute voice"}
                title={voiceOn ? "Voice on" : "Voice off"}
              >
                {voiceOn ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              </button>
              {/* Voice selector */}
              <div className="relative">
                <button
                  onClick={() => setShowVoiceMenu(v => !v)}
                  className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:text-primary"
                  aria-label="Select voice"
                  title={selectedVoice ? selectedVoice.name : "Select voice"}
                >
                  <ChevronDown className="size-3.5" />
                </button>
                {showVoiceMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowVoiceMenu(false)} />
                    <div className="thin-scroll absolute right-0 top-full mt-1 max-h-60 w-56 overflow-y-auto rounded-xl p-1.5 shadow-2xl z-50"
                      style={{ background: "oklch(0.20 0.025 254 / 97%)", backdropFilter: "blur(20px)", border: "1px solid oklch(0.99 0.01 250 / 15%)" }}
                    >
                      <p className="label-instrument text-muted-foreground px-2 py-1.5">Voice options</p>
                      {voices.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-muted-foreground">No voices available in this browser</p>
                      ) : (
                        voices.map(v => {
                          const pref = PREFERRED_VOICES.find(p => v.name.includes(p.name));
                          return (
                            <button
                              key={v.voiceURI}
                              onClick={() => {
                                setSelectedVoiceURI(v.voiceURI);
                                setShowVoiceMenu(false);
                                // Preview the voice
                                if (voiceOn) {
                                  window.speechSynthesis?.cancel();
                                  const u = new SpeechSynthesisUtterance("Cessna one seven two bravo, ready for departure.");
                                  u.voice = v;
                                  u.rate = 1.02;
                                  u.pitch = 0.92;
                                  u.volume = 0.85;
                                  window.speechSynthesis?.speak(u);
                                }
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                                selectedVoiceURI === v.voiceURI
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <span className="truncate max-w-[140px]">{v.name.replace("Microsoft ", "MS ").replace("Google ", "G ")}</span>
                              {pref && <span className="text-[9px] text-muted-foreground shrink-0">{pref.desc.split(" · ")[1]}</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress strip */}
          {completedCount > 0 && (
            <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-xs">
              <TrendingUp className="size-3.5 text-accent shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{tier.name}</span> · {completedCount}/16 modules · {xp} XP
              </span>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto min-h-0 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2">
                <div className="mb-2 flex items-start gap-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Sparkles className="size-3 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hi, I&apos;m <span className="text-foreground font-medium">Copilot</span> — your AI flight instructor.
                    Ask me anything about flying, radio calls, navigation, or weather.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {SUGGESTED.map(s => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="rounded-lg px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 hover:translate-x-1 hover:bg-primary/5"
                      style={{ background: "oklch(0.99 0.01 250 / 4%)", border: "1px solid oklch(0.99 0.01 250 / 8%)" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={cn(
                      "msg-in flex gap-2 max-w-[90%]",
                      m.role === "user" ? "self-end flex-row-reverse" : "self-start"
                    )}
                  >
                    {m.role === "assistant" && (
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 mt-0.5">
                        <Headphones className="size-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {/* Typing animation for the last AI message */}
                      {m.role === "assistant" && m.text === "" && loading ? (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="typing-dot size-2 rounded-full bg-primary/60" style={{ animationDelay: "0s" }} />
                          <span className="typing-dot size-2 rounded-full bg-primary/60" style={{ animationDelay: "0.15s" }} />
                          <span className="typing-dot size-2 rounded-full bg-primary/60" style={{ animationDelay: "0.3s" }} />
                        </div>
                      ) : m.role === "assistant" && m.id === messages[messages.length - 1]?.id && typingText ? (
                        <span>{typingText}<span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse" /></span>
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="border-t border-border p-3"
          >
            {/* Interim transcript while listening */}
            {listening && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                <span className="size-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  {interimText || "Listening…"}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={listening ? (interimText || input) : input}
                onChange={e => setInput(e.target.value)}
                placeholder={listening ? "Listening…" : "Ask Copilot… or tap the mic"}
                disabled={listening}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
              />
              {/* Microphone button */}
              {micSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95",
                    listening
                      ? "border-destructive/50 bg-destructive/15 text-destructive mic-pulse"
                      : "border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                  )}
                  aria-label={listening ? "Stop listening" : "Start voice input"}
                  title={listening ? "Stop listening" : "Speak your question"}
                >
                  {listening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || loading || listening}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
