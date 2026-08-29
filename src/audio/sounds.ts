const MASTER = 0.09;

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!context) context = new AudioCtx();
  if (context.state === "suspended") void context.resume();
  return context;
}

export function unlockAudio() {
  audioContext();
}

function envelope(gain: GainNode, start: number, peak: number, duration: number) {
  const safePeak = Math.max(0.0001, peak * MASTER);
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(safePeak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
}

function playTone(
  frequency: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  delay = 0,
) {
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  filter.type = "lowpass";
  filter.frequency.value = Math.min(2800, frequency * 4);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  envelope(gain, start, peak, duration);
  osc.start(start);
  osc.stop(start + duration + 0.04);
}

function playNoise(duration: number, peak: number, highpassHz: number) {
  const ctx = audioContext();
  if (!ctx) return;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = highpassHz;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  const start = ctx.currentTime;
  envelope(gain, start, peak, duration);
  source.start(start);
  source.stop(start + duration + 0.02);
}

export function playClick() {
  playNoise(0.028, 0.22, 1800);
  playTone(1650, 0.04, 0.12, "triangle");
}

export function playCorrect() {
  playTone(523.25, 0.22, 0.28, "sine");
  playTone(659.25, 0.24, 0.22, "triangle", 0.05);
  playTone(783.99, 0.28, 0.18, "sine", 0.1);
}

export function playWrong() {
  playTone(196, 0.14, 0.2, "sine");
  playTone(164.81, 0.16, 0.16, "triangle", 0.05);
}

export function playFail() {
  playTone(174.61, 0.22, 0.22, "sine");
  playTone(130.81, 0.32, 0.2, "triangle", 0.08);
}

export function playTick(urgent = false) {
  playTone(urgent ? 980 : 840, urgent ? 0.05 : 0.04, urgent ? 0.16 : 0.11, "triangle");
  playNoise(0.018, urgent ? 0.1 : 0.06, 2400);
}
