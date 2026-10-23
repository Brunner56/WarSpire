// Procedural audio: every sound effect is synthesised with Web Audio, so the game ships no audio files.
import type { School } from '../../engine/types';

type Ctx = AudioContext;
let ctx: Ctx | null = null;
let master: GainNode, sfxBus: GainNode, musicBus: GainNode, verbIn: GainNode;
let noiseBuf: AudioBuffer;
const vol = { sfx: 0.8, music: 0.6, on: true };
const onReady: (() => void)[] = [];

export function audioReady(): Ctx | null { return ctx && ctx.state === 'running' ? ctx : null; }
export function whenAudioReady(f: () => void) { if (audioReady()) f(); else onReady.push(f); }
export function buses() { return { musicBus, verbIn, noiseBuf }; }

export function setVolumes(o: { sfx?: number; music?: number; on?: boolean }) {
  Object.assign(vol, o);
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(vol.on ? 1 : 0, t, 0.05);
  sfxBus.gain.setTargetAtTime(vol.sfx, t, 0.05);
  musicBus.gain.setTargetAtTime(vol.music * 0.55, t, 0.2);
}

function impulse(c: Ctx, secs: number, decay: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * secs);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return b;
}

function build() {
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return;
  const c: Ctx = new AC();
  ctx = c;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  master = c.createGain();
  master.connect(comp).connect(c.destination);
  sfxBus = c.createGain(); sfxBus.connect(master);
  musicBus = c.createGain(); musicBus.connect(master);
  // shared hall reverb
  const conv = c.createConvolver();
  conv.buffer = impulse(c, 2.6, 2.8);
  verbIn = c.createGain();
  const verbOut = c.createGain(); verbOut.gain.value = 0.35;
  verbIn.connect(conv).connect(verbOut).connect(master);
  noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  setVolumes({});
}

/** Browsers (iOS especially) only allow audio after a user gesture. */
export function installAudioUnlock() {
  const unlock = () => {
    if (!ctx) build();
    if (!ctx) return;
    // iOS 17+: play even when the ring/silent switch is on
    try { (navigator as any).audioSession && ((navigator as any).audioSession.type = 'playback'); } catch { /* ignore */ }
    if (ctx.state !== 'running') ctx.resume().catch(() => undefined);
    if (ctx.state === 'running' || ctx.state === 'suspended') {
      setTimeout(() => {
        if (ctx?.state !== 'running') return;
        for (const f of onReady.splice(0)) f();
      }, 30);
    }
  };
  for (const ev of ['pointerdown', 'touchend', 'keydown', 'click']) window.addEventListener(ev, unlock, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => undefined);
    else ctx.resume().catch(() => undefined);
  });
}

// ---------------------------------------------------------------------------
// synthesis primitives (shared with the music engine)

export interface ToneOpts {
  type?: OscillatorType; f: number; f2?: number; t?: number; dur: number; v: number; a?: number;
  lp?: number; lp2?: number; bp?: number; hp?: number; q?: number; det?: number; out?: AudioNode; verb?: number; vib?: number;
}

export function tone(c: Ctx, o: ToneOpts) {
  const t = o.t ?? c.currentTime;
  const osc = c.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t + o.dur);
  if (o.det) osc.detune.value = o.det;
  let node: AudioNode = osc;
  if (o.vib) {
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(o.vib, t + Math.min(0.25, o.dur * 0.4));
    lfo.connect(lg).connect(osc.detune); lfo.start(t); lfo.stop(t + o.dur + 0.05);
  }
  if (o.lp || o.bp || o.hp) {
    const fl = c.createBiquadFilter();
    fl.type = o.lp ? 'lowpass' : o.bp ? 'bandpass' : 'highpass';
    fl.frequency.setValueAtTime(o.lp ?? o.bp ?? o.hp!, t);
    if (o.lp2) fl.frequency.exponentialRampToValueAtTime(o.lp2, t + o.dur);
    if (o.q) fl.Q.value = o.q;
    node.connect(fl); node = fl;
  }
  const g = c.createGain();
  const a = o.a ?? 0.005;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(o.v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.01, o.dur));
  node.connect(g).connect(o.out ?? sfxBus);
  if (o.verb) { const s = c.createGain(); s.gain.value = o.verb; g.connect(s).connect(verbIn); }
  osc.start(t); osc.stop(t + o.dur + 0.05);
}

export interface NoiseOpts { t?: number; dur: number; v: number; a?: number; lp?: number; bp?: number; hp?: number; f2?: number; q?: number; out?: AudioNode; verb?: number }

export function noise(c: Ctx, o: NoiseOpts) {
  const t = o.t ?? c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const fl = c.createBiquadFilter();
  fl.type = o.lp ? 'lowpass' : o.bp ? 'bandpass' : 'highpass';
  const f = o.lp ?? o.bp ?? o.hp ?? 1000;
  fl.frequency.setValueAtTime(f, t);
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
  fl.Q.value = o.q ?? 0.8;
  const g = c.createGain();
  const a = o.a ?? 0.004;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(o.v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.01, o.dur));
  src.connect(fl).connect(g).connect(o.out ?? sfxBus);
  if (o.verb) { const s = c.createGain(); s.gain.value = o.verb; g.connect(s).connect(verbIn); }
  src.start(t, Math.random() * 0.5); src.stop(t + o.dur + 0.05);
}

// ---------------------------------------------------------------------------
// sound effects

export type Sfx =
  | 'click' | 'card' | 'swing' | 'hit' | 'blocked' | 'block' | 'heal' | 'buff' | 'debuff' | 'dodge' | 'die' | 'summon' | 'roar'
  | 'coin' | 'turn' | 'victory' | 'defeat' | 'levelup' | 'cast' | 'shoot' | 'poison' | 'bleed' | 'burn' | 'chill' | 'stun' | 'shuffle' | 'pet';

const last: Record<string, number> = {};

export function sfx(name: Sfx, o: { school?: School; crit?: boolean; n?: number } = {}) {
  const c = audioReady();
  if (!c || !vol.on || vol.sfx <= 0) return;
  const key = name + (o.school ?? '');
  const now = performance.now();
  if (now - (last[key] ?? 0) < 40) return;
  last[key] = now;
  const t = c.currentTime + 0.005;
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  switch (name) {
    case 'click': tone(c, { type: 'triangle', f: 900, f2: 700, t, dur: 0.05, v: 0.12, lp: 3000 }); break;
    case 'card':
      noise(c, { t, dur: 0.09, v: 0.16, bp: 2400, f2: 4200, q: 1.2 });
      tone(c, { type: 'sine', f: 660, f2: 990, t, dur: 0.08, v: 0.05 });
      break;
    case 'shuffle': for (let i = 0; i < 4; i++) noise(c, { t: t + i * 0.05, dur: 0.05, v: 0.1, bp: r(1800, 3200), q: 1.5 }); break;
    case 'swing': noise(c, { t, dur: 0.2, v: 0.32, bp: 500, f2: 1900, q: 1.4 }); break;
    case 'dodge': noise(c, { t, dur: 0.16, v: 0.25, bp: 1400, f2: 3500, q: 2 }); break;
    case 'shoot':
      tone(c, { type: 'triangle', f: 220, f2: 90, t, dur: 0.12, v: 0.25 });
      noise(c, { t, dur: 0.22, v: 0.18, bp: 2500, f2: 900, q: 2 });
      break;
    case 'pet':
      tone(c, { type: 'sawtooth', f: r(160, 220), f2: 110, t, dur: 0.18, v: 0.12, lp: 900 });
      noise(c, { t, dur: 0.12, v: 0.18, bp: 1200, q: 1 });
      break;
    case 'cast': castSound(c, t, o.school ?? 'arcane'); break;
    case 'hit': hitSound(c, t, o.school ?? 'physical', !!o.crit, o.n ?? 6); break;
    case 'blocked':
      tone(c, { type: 'square', f: 520, t, dur: 0.18, v: 0.1, lp: 2500, verb: 0.3 });
      tone(c, { type: 'triangle', f: 1310, t, dur: 0.25, v: 0.08, verb: 0.3 });
      noise(c, { t, dur: 0.06, v: 0.25, hp: 2500 });
      break;
    case 'block':
      tone(c, { type: 'triangle', f: 330, t, dur: 0.14, v: 0.16 });
      tone(c, { type: 'square', f: 470, t, dur: 0.1, v: 0.05, lp: 2000 });
      noise(c, { t, dur: 0.05, v: 0.15, bp: 3000 });
      break;
    case 'heal':
      [1047, 1319, 1568, 2093].forEach((f, i) => tone(c, { type: 'sine', f, t: t + i * 0.06, dur: 0.45, v: 0.09, a: 0.02, verb: 0.6 }));
      break;
    case 'buff':
      tone(c, { type: 'sine', f: 440, f2: 880, t, dur: 0.3, v: 0.12, a: 0.03, verb: 0.5 });
      tone(c, { type: 'triangle', f: 1320, t: t + 0.12, dur: 0.35, v: 0.06, verb: 0.6 });
      break;
    case 'debuff': tone(c, { type: 'triangle', f: 620, f2: 260, t, dur: 0.3, v: 0.12, lp: 1800 }); break;
    case 'poison': for (let i = 0; i < 3; i++) tone(c, { type: 'sine', f: r(260, 520), f2: r(600, 900), t: t + i * 0.06, dur: 0.07, v: 0.1 }); break;
    case 'bleed':
      noise(c, { t, dur: 0.12, v: 0.22, lp: 700 });
      tone(c, { type: 'sine', f: 210, f2: 110, t, dur: 0.14, v: 0.14 });
      break;
    case 'burn': for (let i = 0; i < 5; i++) noise(c, { t: t + r(0, 0.25), dur: 0.03, v: 0.16, hp: 2500 }); noise(c, { t, dur: 0.35, v: 0.12, lp: 600 }); break;
    case 'chill': [2100, 3170, 4330].forEach(f => tone(c, { type: 'sine', f, t, dur: 0.35, v: 0.05, verb: 0.5 })); break;
    case 'stun': [1200, 1500].forEach((f, i) => tone(c, { type: 'triangle', f, f2: f * 0.8, t: t + i * 0.07, dur: 0.2, v: 0.07 })); break;
    case 'die':
      noise(c, { t, dur: 0.7, v: 0.3, lp: 900, f2: 90 });
      tone(c, { type: 'sawtooth', f: 140, f2: 38, t, dur: 0.7, v: 0.13, lp: 500 });
      break;
    case 'summon':
      [196, 294].forEach(f => tone(c, { type: 'sawtooth', f, t, dur: 0.55, v: 0.07, a: 0.05, lp: 1300, verb: 0.5 }));
      noise(c, { t, dur: 0.4, v: 0.1, lp: 500 });
      break;
    case 'roar':
      tone(c, { type: 'sawtooth', f: 95, f2: 55, t, dur: 1.1, v: 0.2, a: 0.08, lp: 650, vib: 60, verb: 0.4 });
      tone(c, { type: 'sawtooth', f: 142, f2: 80, t, dur: 1.0, v: 0.1, a: 0.08, lp: 900, vib: 40 });
      noise(c, { t, dur: 1.0, v: 0.2, lp: 500, a: 0.1 });
      break;
    case 'coin': [1760, 2637].forEach((f, i) => tone(c, { type: 'sine', f, t: t + i * 0.07, dur: 0.18, v: 0.1, verb: 0.3 })); break;
    case 'turn':
      tone(c, { type: 'sine', f: 110, f2: 70, t, dur: 0.3, v: 0.25 });
      tone(c, { type: 'sine', f: 880, t: t + 0.05, dur: 0.4, v: 0.05, verb: 0.6 });
      break;
    case 'victory': {
      const notes = [392, 523, 659, 784];
      notes.forEach((f, i) => brass(c, f, t + i * 0.13, i === 3 ? 1.1 : 0.16, 0.13));
      brass(c, 523, t + 0.39, 1.1, 0.07); brass(c, 659, t + 0.39, 1.1, 0.07);
      tone(c, { type: 'sine', f: 98, f2: 60, t: t + 0.39, dur: 0.5, v: 0.35 });
      break;
    }
    case 'defeat':
      [440, 349, 294, 220].forEach((f, i) => brass(c, f, t + i * 0.32, i === 3 ? 1.6 : 0.34, 0.09));
      tone(c, { type: 'sine', f: 70, f2: 45, t: t + 0.96, dur: 1.2, v: 0.35 });
      break;
    case 'levelup':
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, { type: 'triangle', f, t: t + i * 0.07, dur: 0.6, v: 0.09, verb: 0.6 }));
      [2093, 2637].forEach((f, i) => tone(c, { type: 'sine', f, t: t + 0.4 + i * 0.1, dur: 0.9, v: 0.05, verb: 0.8 }));
      break;
  }
}

function brass(c: Ctx, f: number, t: number, dur: number, v: number) {
  tone(c, { type: 'sawtooth', f, t, dur, v, a: 0.03, lp: 2400, lp2: 900, verb: 0.4 });
  tone(c, { type: 'sawtooth', f, t, dur, v: v * 0.6, a: 0.03, det: 9, lp: 1800, verb: 0.3 });
}

function castSound(c: Ctx, t: number, s: School) {
  switch (s) {
    case 'fire': noise(c, { t, dur: 0.35, v: 0.22, bp: 300, f2: 1400, q: 1, a: 0.12 }); tone(c, { type: 'sawtooth', f: 110, f2: 220, t, dur: 0.3, v: 0.06, lp: 800 }); break;
    case 'frost': tone(c, { type: 'sine', f: 700, f2: 1500, t, dur: 0.28, v: 0.09, a: 0.08, verb: 0.5 }); noise(c, { t, dur: 0.25, v: 0.08, hp: 5000, a: 0.1 }); break;
    case 'shadow': tone(c, { type: 'sawtooth', f: 70, f2: 150, t, dur: 0.35, v: 0.12, lp: 500, a: 0.1, vib: 30 }); noise(c, { t, dur: 0.3, v: 0.08, lp: 400, a: 0.1 }); break;
    case 'holy': [523, 659, 784].forEach(f => tone(c, { type: 'sawtooth', f, t, dur: 0.5, v: 0.03, a: 0.15, bp: 900, q: 3, verb: 0.8 })); break;
    case 'nature': noise(c, { t, dur: 0.3, v: 0.12, bp: 3200, q: 2, a: 0.08 }); tone(c, { type: 'triangle', f: 330, f2: 495, t, dur: 0.25, v: 0.06 }); break;
    case 'arcane': default: [660, 990, 1320].forEach((f, i) => tone(c, { type: 'sine', f, t: t + i * 0.04, dur: 0.22, v: 0.07, verb: 0.5 })); break;
  }
}

function hitSound(c: Ctx, t: number, s: School, crit: boolean, n: number) {
  const big = Math.min(1.6, 0.7 + n / 25) * (crit ? 1.35 : 1);
  switch (s) {
    case 'physical':
      noise(c, { t, dur: 0.12, v: 0.4 * big, lp: 2200 });
      tone(c, { type: 'sine', f: 150, f2: 55, t, dur: 0.14, v: 0.45 * big });
      if (crit) tone(c, { type: 'square', f: 880, f2: 660, t, dur: 0.12, v: 0.08, lp: 3000 });
      break;
    case 'fire':
      noise(c, { t, dur: 0.4, v: 0.35 * big, lp: 1000, f2: 250 });
      for (let i = 0; i < 4; i++) noise(c, { t: t + Math.random() * 0.3, dur: 0.03, v: 0.15, hp: 3000 });
      tone(c, { type: 'sine', f: 90, f2: 45, t, dur: 0.3, v: 0.3 * big });
      break;
    case 'frost':
      [2000, 3150, 4210, 5300].forEach(f => tone(c, { type: 'sine', f: f * (0.95 + Math.random() * 0.1), t, dur: 0.3, v: 0.05 * big, verb: 0.4 }));
      noise(c, { t, dur: 0.18, v: 0.25 * big, hp: 3500 });
      tone(c, { type: 'sine', f: 140, f2: 70, t, dur: 0.12, v: 0.25 });
      break;
    case 'shadow':
      tone(c, { type: 'sawtooth', f: 120, f2: 45, t, dur: 0.45, v: 0.16 * big, lp: 600 });
      noise(c, { t, dur: 0.35, v: 0.22 * big, lp: 450 });
      break;
    case 'arcane':
      tone(c, { type: 'sine', f: 880, f2: 1760, t, dur: 0.22, v: 0.1 * big, verb: 0.4 });
      tone(c, { type: 'sine', f: 1320, f2: 2640, t: t + 0.03, dur: 0.2, v: 0.06 * big, verb: 0.4 });
      noise(c, { t, dur: 0.08, v: 0.15, bp: 4000 });
      break;
    case 'holy':
      [784, 1568, 2352].forEach((f, i) => tone(c, { type: 'sine', f, t, dur: 0.7 - i * 0.15, v: 0.09 * big, verb: 0.7 }));
      noise(c, { t, dur: 0.1, v: 0.18, bp: 2500 });
      break;
    case 'nature':
      noise(c, { t, dur: 0.16, v: 0.45 * big, hp: 1200 });
      tone(c, { type: 'square', f: 240, f2: 70, t, dur: 0.2, v: 0.1 * big, lp: 1500 });
      break;
  }
}
