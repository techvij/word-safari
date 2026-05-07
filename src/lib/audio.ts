// Web Audio synth — ported from the original app.js. No audio files; envelopes
// are built on the fly from oscillator + gain nodes so playback is instant
// and bundle bytes stay flat regardless of how many sounds we add.

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }
  const C = (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!C) return null;
  ctx = new C();
  return ctx;
}

type ToneOpts = {
  freqStart: number;
  freqEnd?: number;
  duration?: number;
  delay?: number;
  type?: OscillatorType;
  peak?: number;
};

function tone({ freqStart, freqEnd, duration = 0.18, delay = 0, type = 'sine', peak = 0.18 }: ToneOpts) {
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t0);
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playCorrect() {
  tone({ freqStart: 660, freqEnd: 880, duration: 0.12 });
  tone({ freqStart: 880, freqEnd: 1175, duration: 0.14, delay: 0.1 });
}

export function playWrong() {
  tone({ freqStart: 220, freqEnd: 110, duration: 0.28, type: 'square', peak: 0.12 });
}

export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => tone({ freqStart: n, duration: 0.18, delay: i * 0.13, peak: 0.2 }));
}

export function playLose() {
  const notes = [392, 311, 247];
  notes.forEach((n, i) => tone({ freqStart: n, duration: 0.3, delay: i * 0.2, type: 'triangle', peak: 0.15 }));
}

export function unlockAudio() {
  // Called on first user gesture to satisfy autoplay policies.
  ensureCtx();
}
