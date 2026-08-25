/**
 * Stark Industries Audio Synthesis Engine
 * 100% dependency-free Web Audio API sound effects for HUD interactions and Mini-Games.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playBlip(freq: number = 880, dur: number = 0.04) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
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
        gain.gain.setValueAtTime(0.09, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.18);
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
      osc.frequency.linearRampToValueAtTime(80, now + 0.22);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  playMatrixNote(noteIndex: number) {
    if (!this.enabled) return;
    const freqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
    const freq = freqs[noteIndex % freqs.length] || 440;
    this.playBlip(freq, 0.18);
  }

  private hasPlayedIntro: boolean = false;

  /**
   * Iconic Marvel Studios Orchestral Fanfare & Comic Page Flip Synthesis
   * High-fidelity Web Audio synthesis with horn filters, brass swells, and cinematic sub-bass boom.
   */
  playMarvelFanfare(force: boolean = false) {
    if (!this.enabled) return;
    if (this.hasPlayedIntro && !force) return;
    this.hasPlayedIntro = true;

    const ctx = this.getContext();
    if (!ctx) return;

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
      bandpass.frequency.exponentialRampToValueAtTime(2200, now + 1.2);
      bandpass.Q.setValueAtTime(3.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 1.5);

      // ── 2. Cinematic Sub-Bass Impact (Timpani / Taiko hit) ──
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(110, now + 1.2);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 2.8);
      subGain.gain.setValueAtTime(0.22, now + 1.2);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now + 1.2);
      subOsc.stop(now + 3.3);

      // ── 3. Orchestral Brass / Heroic Fanfare Chord Progression ──
      // [TimeOffset, Duration, [Frequencies]]
      const chords: [number, number, number[]][] = [
        [0.2, 0.9, [130.81, 196.0, 261.63, 329.63]], // C Major chord
        [1.1, 0.8, [155.56, 233.08, 311.13, 392.0]],  // Eb Major chord
        [1.9, 0.9, [174.61, 261.63, 349.23, 440.0]],  // F Major chord
        [2.8, 2.2, [196.0, 293.66, 392.0, 523.25, 659.25]], // G -> High C Grand Finale
      ];

      chords.forEach(([offset, dur, freqs]) => {
        freqs.forEach((freq, fi) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Rich brass harmonic tone (blend sawtooth with warm lowpass cutoff)
          osc.type = fi % 2 === 0 ? "sawtooth" : "triangle";
          osc.frequency.setValueAtTime(freq, now + offset);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(freq * 3.5, now + offset);
          filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + offset + dur);

          const vol = fi === freqs.length - 1 ? 0.05 : 0.035;
          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.linearRampToValueAtTime(vol, now + offset + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + offset);
          osc.stop(now + offset + dur);
        });
      });
    } catch {}
  }
}

export const sound = new SoundEngine();

