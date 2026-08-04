'use client'

/**
 * FlightCourse — audio engine (Web Audio API, zero assets)
 * -----------------------------------------------------------------------------
 * A small synth that produces all cockpit sound procedurally:
 *   • Engine drone — two detuned sawtooth oscillators + lowpass, frequency
 *     tracks airspeed (idle ~70Hz → cruise ~120Hz). Subtle amp wobble.
 *   • Stall horn — reedy 800Hz square buzz, intermittent, when near stall.
 *   • Touchdown thump — short filtered-noise burst + low sine pop.
 *   • Radar callout — clean sine beep (distinct from voice; instantly readable).
 *   • Wind noise — filtered white noise, gain tracks airspeed.
 *   • UI click — short blip for button presses.
 *
 * Everything is gated by a master gain + mute flag. The engine is a lazy
 * singleton: the AudioContext is created on first user gesture (browser policy).
 */

type Sfx = 'click' | 'beep' | 'callout' | 'thump' | 'chime' | 'error'

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private engineGain: GainNode | null = null
  private engineOsc1: OscillatorNode | null = null
  private engineOsc2: OscillatorNode | null = null
  private engineFilter: BiquadFilterNode | null = null
  private engineLfo: OscillatorNode | null = null
  private engineLfoGain: GainNode | null = null
  private windGain: GainNode | null = null
  private windSource: AudioBufferSourceNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private stallHornTimer: ReturnType<typeof setInterval> | null = null
  private stallHornOn = false
  private started = false
  private muted = false
  private lastEngineSpeed = 0

  /** Must be called from a user gesture (click/keydown) to satisfy autoplay policy. */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.5
      this.master.connect(this.ctx.destination)
    } catch {
      this.ctx = null
    }
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.05)
    }
  }

  isMuted() {
    return this.muted
  }

  /** Start the continuous engine drone + wind bed. Idempotent. */
  startEngine() {
    if (!this.ctx || !this.master || this.started) return
    this.started = true
    const t = this.ctx.currentTime

    // --- engine: two detuned saws through a lowpass ---
    this.engineGain = this.ctx.createGain()
    this.engineGain.gain.value = 0.0
    this.engineFilter = this.ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.value = 380
    this.engineFilter.Q.value = 4

    this.engineOsc1 = this.ctx.createOscillator()
    this.engineOsc1.type = 'sawtooth'
    this.engineOsc1.frequency.value = 78
    this.engineOsc2 = this.ctx.createOscillator()
    this.engineOsc2.type = 'sawtooth'
    this.engineOsc2.frequency.value = 79.4 // slight beat

    this.engineOsc1.connect(this.engineFilter)
    this.engineOsc2.connect(this.engineFilter)
    this.engineFilter.connect(this.engineGain)
    this.engineGain.connect(this.master)

    // subtle amp wobble (engine "breathing")
    this.engineLfo = this.ctx.createOscillator()
    this.engineLfo.type = 'sine'
    this.engineLfo.frequency.value = 6.5
    this.engineLfoGain = this.ctx.createGain()
    this.engineLfoGain.gain.value = 0.015
    this.engineLfo.connect(this.engineLfoGain)
    this.engineLfoGain.connect(this.engineGain.gain)

    this.engineOsc1.start(t)
    this.engineOsc2.start(t)
    this.engineLfo.start(t)
    // ramp up
    this.engineGain.gain.setTargetAtTime(0.12, t, 0.4)

    // --- wind: filtered white noise, gain tracks airspeed ---
    this.windGain = this.ctx.createGain()
    this.windGain.gain.value = 0.0
    this.windFilter = this.ctx.createBiquadFilter()
    this.windFilter.type = 'bandpass'
    this.windFilter.frequency.value = 900
    this.windFilter.Q.value = 0.7
    this.windGain.connect(this.master)
    this.windFilter.connect(this.windGain)
    this.windSource = this.ctx.createBufferSource()
    this.windSource.buffer = this.makeNoiseBuffer(2)
    this.windSource.loop = true
    this.windSource.connect(this.windFilter)
    this.windSource.start(t)
  }

  private makeNoiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.ctx!
    const len = ctx.sampleRate * seconds
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return buf
  }

  /**
   * Update the continuous bed. Call every frame (or ~10Hz is fine).
   *   airspeed: kt (0-160)
   *   rpm factor: 0..1 (throttle-like; here we tie to airspeed)
   */
  updateEngine(airspeed: number) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineGain || !this.windGain || !this.engineFilter) return
    // smooth
    const target = 70 + (airspeed / 65) * 52 // idle 70Hz, cruise ~122Hz
    this.lastEngineSpeed += (target - this.lastEngineSpeed) * 0.1
    this.engineOsc1.frequency.setTargetAtTime(this.lastEngineSpeed, this.ctx.currentTime, 0.1)
    this.engineOsc2.frequency.setTargetAtTime(this.lastEngineSpeed * 1.018, this.ctx.currentTime, 0.1)
    // filter opens with speed
    this.engineFilter.frequency.setTargetAtTime(320 + airspeed * 8, this.ctx.currentTime, 0.15)
    // wind gain tracks airspeed
    const windAmt = Math.max(0, Math.min(0.18, (airspeed - 35) / 400))
    this.windGain.gain.setTargetAtTime(windAmt, this.ctx.currentTime, 0.2)
  }

  /** Stall horn on/off. When on, it buzzes intermittently (reedy). */
  setStallHorn(on: boolean) {
    if (on === this.stallHornOn) return
    this.stallHornOn = on
    if (on) {
      this.stallHornTimer = setInterval(() => this.buzz(820, 0.08, 'square', 0.16), 220)
      this.buzz(820, 0.08, 'square', 0.16)
    } else if (this.stallHornTimer) {
      clearInterval(this.stallHornTimer)
      this.stallHornTimer = null
    }
  }

  private buzz(freq: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(g)
    g.connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  /** Touchdown thump — filtered noise burst + low pop. */
  touchdown(severity: number) {
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    const vol = Math.min(0.6, 0.15 + severity * 0.4)
    // noise burst
    const src = this.ctx.createBufferSource()
    src.buffer = this.makeNoiseBuffer(0.4)
    const filt = this.ctx.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.value = 240
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
    src.connect(filt)
    filt.connect(g)
    g.connect(this.master)
    src.start(t)
    src.stop(t + 0.4)
    // low pop
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(90, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18)
    const og = this.ctx.createGain()
    og.gain.setValueAtTime(vol * 0.8, t)
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.connect(og)
    og.connect(this.master)
    osc.start(t)
    osc.stop(t + 0.22)
  }

  /** Radar callout beep — distinct clean tone. */
  calloutBeep() {
    this.buzz(1320, 0.12, 'sine', 0.12)
  }

  /** Generic UI/cue SFX. */
  sfx(kind: Sfx) {
    switch (kind) {
      case 'click':
        this.buzz(660, 0.05, 'sine', 0.08)
        break
      case 'beep':
        this.buzz(880, 0.08, 'sine', 0.1)
        break
      case 'callout':
        this.buzz(1320, 0.12, 'sine', 0.12)
        break
      case 'chime':
        this.buzz(987, 0.14, 'sine', 0.12)
        setTimeout(() => this.buzz(1318, 0.18, 'sine', 0.12), 90)
        break
      case 'error':
        this.buzz(220, 0.18, 'square', 0.14)
        setTimeout(() => this.buzz(180, 0.22, 'square', 0.14), 120)
        break
      case 'thump':
        this.touchdown(0.5)
        break
    }
  }

  /** Tear down everything (used on unmount/reset). */
  stopAll() {
    if (this.stallHornTimer) {
      clearInterval(this.stallHornTimer)
      this.stallHornTimer = null
    }
    this.stallHornOn = false
    try {
      this.engineOsc1?.stop()
      this.engineOsc2?.stop()
      this.engineLfo?.stop()
      this.windSource?.stop()
    } catch {
      /* already stopped */
    }
    this.engineOsc1 = null
    this.engineOsc2 = null
    this.engineLfo = null
    this.windSource = null
    this.started = false
  }
}

// Singleton — one engine for the whole app.
let engine: AudioEngine | null = null
export function getAudio(): AudioEngine {
  if (!engine) engine = new AudioEngine()
  return engine
}

// Re-export methods for components that import them directly
export function setMuted(m: boolean) { getAudio().setMuted(m) }
export function playSfx(s: Sfx) { getAudio().sfx(s) }
export function playClick() { getAudio().sfx('click') }
export function playSnap() { getAudio().sfx('click') }
export function playStatic() { getAudio().sfx('error') }
export function playSuccess() { getAudio().sfx('chime') }
export function playError() { getAudio().sfx('error') }
export function playBeep() { getAudio().sfx('beep') }
export function playThump() { getAudio().sfx('thump') }
export function playCallout() { getAudio().sfx('callout') }
export function playChime() { getAudio().sfx('chime') }
export function isMuted(): boolean { return getAudio().isMuted() }
