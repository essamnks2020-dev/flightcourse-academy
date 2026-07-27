/**
 * Client-side radio-call voice player.
 *
 * Fetches spoken audio from /api/tts (hash-cached server-side), applies a light
 * radio-filter effect via Web Audio (bandpass + slight distortion) so it sounds
 * like a CTAF transmission, and plays it. On any failure (network, 503, decode),
 * falls back silently — the existing transmit beep + on-screen text carry the
 * full experience. Never blocks gameplay.
 */

export class RadioVoicePlayer {
  private ctx: AudioContext | null = null;
  private active = new Map<string, HTMLAudioElement | null>();
  enabled = true;

  /** Lazily create an AudioContext (must follow a user gesture). */
  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      return this.ctx;
    } catch {
      return null;
    }
  }

  init() {
    this.ensureCtx();
  }

  /**
   * Speak a transmission. Idempotent: if the same text is already playing or
   * was recently played, it won't stack.
   */
  async speak(text: string, opts?: { voice?: string; filter?: boolean }): Promise<void> {
    if (!this.enabled) return;
    const key = text.slice(0, 40);
    if (this.active.has(key)) return;
    this.active.set(key, null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: opts?.voice ?? "tongtong" }),
      });
      if (!res.ok) return; // graceful fallback
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const ctx = this.ensureCtx();
      if (!ctx) {
        // No Web Audio — play the raw blob via an Audio element.
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          this.active.delete(key);
        };
        this.active.set(key, audio);
        void audio.play().catch(() => this.active.delete(key));
        return;
      }

      // Decode + apply radio filter through Web Audio.
      const arrayBuf = await blob.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuf);
      const src = ctx.createBufferSource();
      src.buffer = decoded;

      if (opts?.filter !== false) {
        // Radio chain: bandpass → slight distortion → compressor → gain.
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 1800;
        bandpass.Q.value = 0.8;

        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 500;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -24;
        comp.ratio.value = 4;

        const gain = ctx.createGain();
        gain.gain.value = 1.1;

        src.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(comp);
        comp.connect(gain);
        gain.connect(ctx.destination);
      } else {
        src.connect(ctx.destination);
      }

      src.onended = () => {
        URL.revokeObjectURL(url);
        this.active.delete(key);
      };
      src.start();
      this.active.set(key, null);
    } catch {
      // Any failure is silent — gameplay continues with beep + text.
      this.active.delete(key);
    }
  }

  /** Stop and discard any playing voices. */
  stopAll() {
    for (const [, audio] of this.active) {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    }
    this.active.clear();
  }
}

let _player: RadioVoicePlayer | null = null;
export function getRadioVoice(): RadioVoicePlayer {
  if (!_player) _player = new RadioVoicePlayer();
  return _player;
}
