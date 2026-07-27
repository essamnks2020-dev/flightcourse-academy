/**
 * Pattern Perfect — procedural audio engine (Web Audio API).
 *
 * No external sound files — everything is synthesised: an engine drone whose
 * pitch tracks airspeed, wind noise whose volume tracks airspeed, a radio
 * transmit beep, success/fail chimes, a conflict alarm, and a soft ambient pad.
 *
 * Inspired by how flight sims layer audio: a continuous engine bed, reactive
 * wind, and discrete UI/event sounds on top.
 */

type SoundName =
  | "transmit"
  | "correct"
  | "incorrect"
  | "banned"
  | "conflict-warn"
  | "conflict-critical"
  | "checkpoint"
  | "complete"
  | "ui-click";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private padOsc: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private started = false;
  muted = false;

  /** Must be called from a user gesture (click/keydown) to satisfy autoplay rules. */
  init() {
    if (this.started) {
      this.resume();
      return;
    }
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
      this.startEngine();
      this.startWind();
      this.startPad();
      this.started = true;
    } catch {
      /* audio not available — game still works silently */
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.05);
    }
  }

  /** Update the continuous engine + wind layers based on flight state. */
  updateLayers(airspeedKt: number, onGround: boolean, intensity = 1) {
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    // Engine pitch: base 70Hz, rises to ~150Hz at 95kt.
    const targetFreq = onGround ? 55 : 70 + (airspeedKt / 95) * 80;
    if (this.engineOsc) {
      this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.15);
    }
    if (this.engineFilter) {
      const cutoff = 300 + (airspeedKt / 95) * 600;
      this.engineFilter.frequency.setTargetAtTime(cutoff, t, 0.2);
    }
    if (this.engineGain) {
      const g = onGround ? 0.04 : 0.09 * intensity;
      this.engineGain.gain.setTargetAtTime(g, t, 0.2);
    }
    // Wind volume scales with airspeed.
    if (this.windGain) {
      const w = onGround ? 0 : (airspeedKt / 95) * 0.12;
      this.windGain.gain.setTargetAtTime(w, t, 0.2);
    }
    if (this.windFilter) {
      this.windFilter.frequency.setTargetAtTime(400 + airspeedKt * 12, t, 0.2);
    }
  }

  private startEngine() {
    if (!this.ctx || !this.master) return;
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.value = 70;
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.value = 600;
    this.engineFilter.Q.value = 4;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.06;
    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);
    this.engineOsc.start();
  }

  private startWind() {
    if (!this.ctx || !this.master) return;
    // Generate a noise buffer (1s of white noise).
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = buf;
    this.windSource.loop = true;
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "bandpass";
    this.windFilter.frequency.value = 600;
    this.windFilter.Q.value = 0.7;
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;
    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.master);
    this.windSource.start();
  }

  private startPad() {
    if (!this.ctx || !this.master) return;
    this.padOsc = this.ctx.createOscillator();
    this.padOsc.type = "sine";
    this.padOsc.frequency.value = 110; // A2
    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0.015;
    this.padOsc.connect(this.padGain);
    this.padGain.connect(this.master);
    this.padOsc.start();
  }

  /** Play a discrete sound effect. */
  play(name: SoundName) {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case "transmit":
        this.beep(880, 0.08, 0.18, "square");
        this.beep(660, 0.06, 0.12, "square", 0.1);
        break;
      case "correct":
        this.chord([523, 659, 784], 0.5, 0.12); // C-E-G major
        break;
      case "incorrect":
        this.beep(220, 0.2, 0.15, "sawtooth");
        this.beep(180, 0.2, 0.12, "sawtooth", 0.15);
        break;
      case "banned":
        this.beep(150, 0.3, 0.2, "sawtooth");
        this.beep(120, 0.3, 0.15, "sawtooth", 0.2);
        break;
      case "conflict-warn":
        this.beep(740, 0.12, 0.18, "square");
        this.beep(740, 0.12, 0.18, "square", 0.2);
        break;
      case "conflict-critical":
        this.beep(880, 0.15, 0.22, "square");
        this.beep(660, 0.15, 0.22, "square", 0.18);
        this.beep(880, 0.15, 0.22, "square", 0.36);
        break;
      case "checkpoint":
        this.beep(1046, 0.1, 0.14, "triangle");
        this.beep(1318, 0.12, 0.1, "triangle", 0.08);
        break;
      case "complete":
        this.chord([523, 659, 784, 1046], 1.2, 0.14);
        break;
      case "ui-click":
        this.beep(1200, 0.03, 0.08, "square");
        break;
    }
  }

  private beep(
    freq: number,
    dur: number,
    vol: number,
    type: OscillatorType,
    delay = 0,
  ) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private chord(freqs: number[], dur: number, vol: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t + i * 0.06);
      g.gain.setValueAtTime(0, t + i * 0.06);
      g.gain.linearRampToValueAtTime(vol, t + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + dur);
      osc.connect(g);
      g.connect(this.master!);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + dur + 0.1);
    });
  }

  dispose() {
    try {
      this.engineOsc?.stop();
      this.windSource?.stop();
      this.padOsc?.stop();
      this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.started = false;
  }
}

// Singleton (one audio engine for the whole app).
let _engine: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!_engine) _engine = new AudioEngine();
  return _engine;
}
