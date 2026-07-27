"use client";

import * as React from "react";

/**
 * Professional radio audio for the Radio Call Builder.
 *
 * All fixed, author-known phrases (every scenario's fullPhrase, every
 * ATC instruction, the menu example) are PRE-RENDERED as high-quality
 * TTS (jam voice = English gentleman) then processed through a VHF
 * radio filter chain (bandpass 300-3400Hz, compression, saturation) so
 * they sound like actual radio transmissions.
 *
 * Dynamic text (the learner's own assembled attempt) falls back to the
 * browser's SpeechSynthesis API with pilot-phraseology expansion.
 */

// ─── Pre-rendered audio manifest ───────────────────────────────────
// Maps a scenario/phrase key to its audio file in /audio/.
const AUDIO_MANIFEST: Record<string, string> = {
  "example-call": "/audio/example-call.mp3",
  "nt-downwind": "/audio/nt-downwind.mp3",
  "nt-entry-45": "/audio/nt-entry-45.mp3",
  "tw-taxi": "/audio/tw-taxi.mp3",
  "tw-takeoff": "/audio/tw-takeoff.mp3",
  "tw-downwind": "/audio/tw-downwind.mp3",
  "tw-approach": "/audio/tw-approach.mp3",
  "emergency-mayday": "/audio/emergency-mayday.mp3",
  "radio-check": "/audio/radio-check.mp3",
  "flight-following": "/audio/flight-following.mp3",
  "runway-crossing": "/audio/runway-crossing.mp3",
  "rb-taxi-atc": "/audio/rb-taxi-atc.mp3",
  "rb-altitude-atc": "/audio/rb-altitude-atc.mp3",
  "rb-taxi": "/audio/rb-taxi.mp3",
  "rb-altitude": "/audio/rb-altitude.mp3",
};

// Reverse-lookup: exact phrase text → audio key
const PHRASE_TO_KEY: Record<string, string> = {};
// These are populated lazily by the scenario data on first use.
// The caller passes the scenarioId to playPreRendered() directly.

const STATIC_BURST = "/audio/static-burst.mp3";

// ─── Number/NATO expansion for SpeechSynthesis fallback ───────────
function expandForSpeech(text: string): string {
  let out = text;
  out = out.replace(/\b(\d)\s*(\d)\b/g, (_m, a, b) => `${digitWord(a)} ${digitWord(b)}`);
  out = out.replace(/\b(\d)\s*(\d)\s*(\d)\b/g, (_m, a, b, c) =>
    `${digitWord(a)} ${digitWord(b)} ${digitWord(c)}`,
  );
  out = out.replace(/\bN(\d{1,5})([A-Z]{0,2})\b/g, (_m, nums, letters) => {
    const n = nums.split("").map((d) => digitWord(d)).join(" ");
    const l = letters ? letters.split("").map((c) => NATO[c] ?? c).join(" ") : "";
    return `November ${n}${l ? " " + l : ""}`.trim();
  });
  out = out.replace(/\b([A-Z])\b(?!\w)/g, (_m, c) => NATO[c] ?? c);
  out = out.replace(/\.\s*$/, "");
  return out;
}

const digitWord: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
  "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "niner",
};

const NATO: Record<string, string> = {
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo",
  F: "Foxtrot", G: "Golf", H: "Hotel", I: "India", J: "Juliet",
  K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar",
  P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango",
  U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee",
  Z: "Zulu",
};

// ─── Audio playback engine ────────────────────────────────────────

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

// Cache for loaded audio buffers
const bufferCache = new Map<string, Promise<AudioBuffer | null>>();

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) return bufferCache.get(url)!;
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const ctx = getAudioCtx();
      if (!ctx) return null;
      return await ctx.decodeAudioData(arr);
    } catch {
      return null;
    }
  })();
  bufferCache.set(url, promise);
  return promise;
}

function stopCurrent() {
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource.disconnect();
    currentSource = null;
  }
  if (currentGain) {
    currentGain.disconnect();
    currentGain = null;
  }
}

/** Play a pre-rendered audio file through the Web Audio graph. */
async function playAudioFile(url: string, onEnd?: () => void): Promise<boolean> {
  const ctx = getAudioCtx();
  if (!ctx) return false;
  stopCurrent();

  const buffer = await loadBuffer(url);
  if (!buffer) return false;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = 1.0;

  source.connect(gain);
  gain.connect(ctx.destination);

  source.onended = () => {
    stopCurrent();
    onEnd?.();
  };

  currentSource = source;
  currentGain = gain;
  source.start();
  return true;
}

/** Play the static burst THEN the phrase (authentic "key the mic" effect). */
async function playWithStatic(phraseUrl: string, onEnd?: () => void): Promise<boolean> {
  // Play static burst first, then the phrase
  const staticOk = await playAudioFile(STATIC_BURST);
  if (staticOk) {
    // Wait for static to finish, then play the phrase
    setTimeout(async () => {
      const ok = await playAudioFile(phraseUrl, onEnd);
      if (!ok) onEnd?.();
    }, 320); // static burst is 0.3s + small gap
    return true;
  }
  // No static — just play the phrase
  const ok = await playAudioFile(phraseUrl, onEnd);
  if (!ok) onEnd?.();
  return ok;
}

// ─── React hook ───────────────────────────────────────────────────

interface SpeakOpts {
  rate?: number;
  onEnd?: () => void;
  /** Skip the static burst (e.g., for rapid sequential playback). */
  noStatic?: boolean;
}

export function useSpeech() {
  const [supported, setSupported] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [voicesReady, setVoicesReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // We support audio playback if either Web Audio or SpeechSynthesis is available
    const hasWebAudio = !!window.AudioContext || !!(window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
    const hasSpeech = "speechSynthesis" in window;
    setSupported(hasWebAudio || hasSpeech);

    if (hasSpeech) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) setVoicesReady(true);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
    }
  }, []);

  /**
   * Play a pre-rendered phrase by its scenario key.
   * This plays the static burst + the VHF-filtered audio clip.
   */
  const playPreRendered = React.useCallback(
    async (key: string, opts?: SpeakOpts) => {
      const url = AUDIO_MANIFEST[key];
      if (!url) return false;
      setSpeaking(true);
      const ok = opts?.noStatic
        ? await playAudioFile(url, () => setSpeaking(false))
        : await playWithStatic(url, () => setSpeaking(false));
      if (!ok) setSpeaking(false);
      return ok;
    },
    [],
  );

  /**
   * Speak arbitrary text using SpeechSynthesis (for dynamic text like
   * the learner's assembled attempt). Falls back gracefully.
   */
  const speakDynamic = React.useCallback(
    (text: string, opts?: SpeakOpts) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        opts?.onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const expanded = expandForSpeech(text);
      const u = new SpeechSynthesisUtterance(expanded);
      u.lang = "en-US";
      u.rate = opts?.rate ?? 0.92;
      u.pitch = 1.0;
      u.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /Google US English/i.test(v.name)) ||
        voices.find((v) => /Samantha/i.test(v.name)) ||
        voices.find((v) => /en-US/i.test(v.lang) && /female/i.test(v.name)) ||
        voices.find((v) => /en-US/i.test(v.lang)) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (preferred) u.voice = preferred;
      u.onstart = () => setSpeaking(true);
      u.onend = () => { setSpeaking(false); opts?.onEnd?.(); };
      u.onerror = () => { setSpeaking(false); opts?.onEnd?.(); };
      window.speechSynthesis.speak(u);
    },
    [],
  );

  /**
   * Smart speak: if the text matches a known pre-rendered phrase, play
   * the high-quality radio audio. Otherwise, use SpeechSynthesis.
   * Also accepts an optional `scenarioKey` to directly play a pre-rendered clip.
   */
  const speak = React.useCallback(
    (text: string, opts?: SpeakOpts & { scenarioKey?: string }) => {
      // If a scenario key is provided, use the pre-rendered audio
      if (opts?.scenarioKey && AUDIO_MANIFEST[opts.scenarioKey]) {
        void playPreRendered(opts.scenarioKey, opts);
        return;
      }
      // Otherwise, try to find a matching pre-rendered phrase by text
      // (checks the fullPhrase of each scenario)
      // For now, fall back to dynamic speech
      speakDynamic(text, opts);
    },
    [playPreRendered, speakDynamic],
  );

  const stop = React.useCallback(() => {
    stopCurrent();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  return { supported, speaking, voicesReady, speak, speakDynamic, playPreRendered, stop };
}
