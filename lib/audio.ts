/**
 * Stark Industries Audio Synthesis Engine
 * 100% dependency-free Web Audio API sound effects for HUD interactions and Mini-Games,
 * equipped with high-output dynamic compression, continuous Arc-Reactor ambient audio,
 * and cinematic Jarvis voice synthesis.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  private voicesReady: boolean = false;
  private pendingSpeech: string | null = null;

  // Continuous ambient background engine
  private ambientGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  public ambientPlaying: boolean = false;
  private telemetryInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.enabled = window.localStorage.getItem("techopedia-audio-muted") !== "1";

      // Auto-resume AudioContext & start continuous ambient on any user gesture
      const unlockAudio = () => {
        if (this.enabled) {
          const ctx = this.getContext();
          if (ctx && ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }
          if (!this.ambientPlaying) {
            this.startAmbient();
          }
        }
      };

      ["click", "pointerdown", "keydown", "touchstart", "scroll", "wheel"].forEach((evt) => {
        window.addEventListener(evt, unlockAudio, { passive: true });
      });

      // Wait for speech synthesis voices to be loaded
      if ("speechSynthesis" in window) {
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            this.voicesReady = true;
            // Flush any pending speech that was queued before voices loaded
            if (this.pendingSpeech) {
              const text = this.pendingSpeech;
              this.pendingSpeech = null;
              this.speak(text);
            }
          }
        };
        checkVoices();
        window.speechSynthesis.addEventListener("voiceschanged", checkVoices);
      }
    }
  }

  get muted() {
    return !this.enabled;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("techopedia-audio-muted", this.enabled ? "0" : "1");
    }
    if (this.enabled) {
      this.getContext();
      this.startAmbient();
      this.playBlip(720, 0.1);
      this.speak("Audio systems online");
    } else {
      this.stopAmbient();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
    return this.enabled;
  }

  public getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx) {
      if (!this.masterGain) {
        // Dynamics compressor — maximises perceived loudness without clipping
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

        // Master gain at 1.4 — optimal cinematic balance
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.4, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }
    return this.ctx;
  }

  private getMaster(ctx: AudioContext): AudioNode {
    return this.compressor ?? ctx.destination;
  }

  /**
   * Continuous Cinematic Ambient Soundscape (Stark Arc-Reactor & Harmonic Space Drone)
   * Plays continuously in the background when sound is enabled.
   */
  startAmbient() {
    if (!this.enabled || this.ambientPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      this.ambientPlaying = true;
      const now = ctx.currentTime;

      // Ambient master gain with gentle fade in
      const ambGain = ctx.createGain();
      ambGain.gain.setValueAtTime(0.0001, now);
      ambGain.gain.linearRampToValueAtTime(0.22, now + 2.5); // Warm, continuous presence
      ambGain.connect(this.getMaster(ctx));
      this.ambientGain = ambGain;

      // ── Arc Reactor Drone 1: Low fundamental (55Hz / A1) ──
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, now);

      // ── Arc Reactor Drone 2: Sub-octave warmth (110Hz / A2) ──
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(110.2, now);

      // Low-pass filter with gentle resonance for warm acoustic character
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200, now);
      filter.Q.setValueAtTime(2.2, now);

      // LFO for slow, breathing Arc Reactor energy pulse (0.12Hz ~ 8.3s cycle)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, now);
      lfoGain.gain.setValueAtTime(75, now); // Modulate filter between 125Hz and 275Hz
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // ── Cinematic Ambient Chord Pad (Stark Laboratory Atmosphere) ──
      // D2 (73.4Hz), A2 (110Hz), F3 (174.6Hz)
      const padFreqs = [73.42, 110.0, 174.61];
      padFreqs.forEach((pf, idx) => {
        const pOsc = ctx.createOscillator();
        pOsc.type = "sine";
        pOsc.frequency.setValueAtTime(pf, now);
        const pGain = ctx.createGain();
        pGain.gain.setValueAtTime(0.07 / (idx + 1), now);
        pOsc.connect(pGain);
        pGain.connect(filter);
        pOsc.start(now);
        this.ambientNodes.push(pOsc, pGain);
      });

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(ambGain);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      this.ambientNodes.push(osc1, osc2, lfo, lfoGain, filter, ambGain);

      // Continuous periodic subtle Stark telemetry blips every 7 seconds
      if (this.telemetryInterval) clearInterval(this.telemetryInterval);
      this.telemetryInterval = setInterval(() => {
        if (!this.enabled || !this.ambientPlaying) return;
        const c = this.getContext();
        if (!c || c.state !== "running") return;
        try {
          const t = c.currentTime;
          const ping = c.createOscillator();
          const pingGain = c.createGain();
          ping.type = "sine";
          // Alternate gentle sci-fi scan tones (C6: 1046Hz or E6: 1318Hz)
          const f = Math.random() > 0.5 ? 1046.5 : 1318.5;
          ping.frequency.setValueAtTime(f, t);
          pingGain.gain.setValueAtTime(0.045, t);
          pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          ping.connect(pingGain);
          pingGain.connect(this.getMaster(c));
          ping.start(t);
          ping.stop(t + 0.2);
        } catch {}
      }, 7000);
    } catch (e) {
      console.warn("Ambient audio error:", e);
      this.ambientPlaying = false;
    }
  }

  stopAmbient() {
    if (!this.ambientPlaying) return;
    this.ambientPlaying = false;
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    if (this.ctx && this.ambientGain) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          this.ambientNodes.forEach((node) => {
            try {
              if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
                (node as OscillatorNode).stop();
              }
              node.disconnect();
            } catch {}
          });
          this.ambientNodes = [];
          this.ambientGain = null;
        }, 700);
      } catch {
        this.ambientNodes = [];
        this.ambientGain = null;
      }
    }
  }

  toggleAmbient() {
    if (this.ambientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this.ambientPlaying;
  }

  /**
   * Stark / Jarvis AI Voice Announcement
   * Queues speech if voices are not yet loaded (async browser init).
   */
  speak(text: string, priority: boolean = false) {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      if (!this.voicesReady) {
        this.pendingSpeech = text;
        return;
      }

      if (priority) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0;
      utterance.rate = 0.95;
      utterance.pitch = 0.88;

      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.name.includes("Google UK English Male")) ||
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Natural") && v.lang.startsWith("en")) ||
        voices.find((v) => (v.name.includes("Daniel") || v.name.includes("Alex")) && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.startsWith("en"));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  playBlip(freq: number = 880, dur: number = 0.05) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.38, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.getMaster(ctx));
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  playSuccess() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.35, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(this.getMaster(ctx));
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.22);
      });
    } catch {}
  }

  playError() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.getMaster(ctx));
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  playMatrixNote(noteIndex: number) {
    if (!this.enabled) return;
    const freqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
    const freq = freqs[noteIndex % freqs.length] || 440;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.getMaster(ctx));
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  /**
   * Iconic Marvel Studios Orchestral Fanfare & Comic Page Flip Synthesis
   * Always plays on request and transitions seamlessly into continuous ambient audio!
   */
  playMarvelFanfare(_force: boolean = true) {
    if (!this.enabled) return;

    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Ensure continuous ambient begins and swells alongside the fanfare
    this.startAmbient();

    // AI voice introduction accompanying the fanfare
    this.speak("Stark protocol online. Welcome to Techopedia Level 15.", true);

    try {
      const now = ctx.currentTime + 0.05;

      // ── 1. Comic Book Page Flipping (Synthesized rhythmic swooshes) ──
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.8));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(800, now);
      bandpass.frequency.exponentialRampToValueAtTime(2400, now + 1.2);
      bandpass.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.38, now + 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.getMaster(ctx));
      whiteNoise.start(now);
      whiteNoise.stop(now + 1.5);

      // ── 2. Cinematic Sub-Bass Impact (Timpani / Taiko hit) ──
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(120, now + 1.2);
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 2.8);
      subGain.gain.setValueAtTime(0.8, now + 1.2);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      subOsc.connect(subGain);
      subGain.connect(this.getMaster(ctx));
      subOsc.start(now + 1.2);
      subOsc.stop(now + 3.3);

      // ── 3. Orchestral Brass / Heroic Fanfare Chord Progression ──
      const chords: [number, number, number[]][] = [
        [0.2, 0.9, [130.81, 196.0, 261.63, 329.63]], // C Major chord
        [1.1, 0.8, [155.56, 233.08, 311.13, 392.0]], // Eb Major chord
        [1.9, 0.9, [174.61, 261.63, 349.23, 440.0]], // F Major chord
        [2.8, 2.5, [196.0, 293.66, 392.0, 523.25, 659.25]], // G -> High C Grand Finale
      ];

      chords.forEach(([offset, dur, freqs]) => {
        freqs.forEach((freq, fi) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Rich brass harmonic tone
          osc.type = fi % 2 === 0 ? "sawtooth" : "triangle";
          osc.frequency.setValueAtTime(freq, now + offset);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(freq * 4.5, now + offset);
          filter.frequency.exponentialRampToValueAtTime(freq * 1.8, now + offset + dur);

          const vol = fi === freqs.length - 1 ? 0.32 : 0.25;
          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.linearRampToValueAtTime(vol, now + offset + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.getMaster(ctx));

          osc.start(now + offset);
          osc.stop(now + offset + dur);
        });
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
