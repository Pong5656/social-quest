/**
 * 100% Original 8-Bit Chiptune Synthesizer using Web Audio API
 * Muted by default as required; unlocked cleanly on first user interaction.
 */
class ChiptuneAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.ensureContext();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    durationSec: number,
    type: OscillatorType = "square",
    volume: number = 0.08,
    delaySec: number = 0
  ): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + durationSec);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.01);
  }

  public playJump(): void {
    this.playTone(220, 560, 0.14, "square", 0.06);
  }

  public playCoin(): void {
    this.playTone(987.77, 987.77, 0.07, "square", 0.07, 0);
    this.playTone(1318.51, 1318.51, 0.16, "square", 0.07, 0.07);
  }

  public playBlockHit(): void {
    this.playTone(320, 640, 0.11, "triangle", 0.09);
  }

  public playCorrect(): void {
    this.playTone(523.25, 523.25, 0.09, "square", 0.08, 0);
    this.playTone(659.25, 659.25, 0.09, "square", 0.08, 0.08);
    this.playTone(783.99, 783.99, 0.09, "square", 0.08, 0.16);
    this.playTone(1046.5, 1046.5, 0.22, "square", 0.08, 0.24);
  }

  public playWrong(): void {
    this.playTone(240, 140, 0.16, "sawtooth", 0.08, 0);
    this.playTone(170, 95, 0.24, "sawtooth", 0.08, 0.14);
  }

  public playBossHit(): void {
    this.playTone(180, 60, 0.2, "sawtooth", 0.1);
  }

  public playStageClear(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, n, i === notes.length - 1 ? 0.35 : 0.11, "square", 0.08, i * 0.11);
    });
  }
}

export const soundEngine = new ChiptuneAudioEngine();
