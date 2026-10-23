// Generative soundtrack: synthesised instruments play seeded melodies over modal chord progressions.
import { audioReady, whenAudioReady, buses, tone, noise } from './audio';
import { Rng } from '../../engine/rng';

export type TrackId = 'tavern' | 'dungeon' | 'combat' | 'boss' | 'raid';

type Lead = 'flute' | 'pluck' | 'brass' | 'bell' | 'choir';
type Drum = 'kick' | 'snare' | 'tom' | 'hat' | 'frame';

interface TrackDef {
  bpm: number;
  steps: 12 | 16;          // sixteenth notes per bar (12 = 3/4)
  root: number;            // midi note of the tonic (octave 3)
  scale: number[];
  prog: number[];          // chord root as scale degree, one per bar
  drums: Partial<Record<Drum, string>>; // per-bar patterns: x = hit, o = soft
  bass: string;            // r = root, f = fifth, o = octave, . = rest
  arp?: string;            // 0-3 = chord tone index, . = rest
  pad?: 'strings' | 'choir';
  lead: Lead; leadB: Lead;
  density: number;         // 0..1 melody note density
  swing?: number;
  seed: number;
}

const MAJOR_MIXO = [0, 2, 4, 5, 7, 9, 10];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const AEOLIAN = [0, 2, 3, 5, 7, 8, 10];
const HARM_MINOR = [0, 2, 3, 5, 7, 8, 11];
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];

const TRACKS: Record<TrackId, TrackDef> = {
  // Lion's Pride Inn: a lilting 3/4 tavern tune
  tavern: {
    bpm: 108, steps: 12, root: 55, scale: MAJOR_MIXO, prog: [0, 6, 3, 0, 0, 6, 4, 0],
    drums: { frame: 'x...o...o...', hat: '..o...o...o.' },
    bass: 'r.......f...', arp: '....1.2.3.2.', pad: undefined, lead: 'flute', leadB: 'pluck', density: 0.75, swing: 0.08, seed: 11,
  },
  // dungeon map: slow, mysterious dorian drone
  dungeon: {
    bpm: 66, steps: 16, root: 50, scale: DORIAN, prog: [0, 0, 6, 6, 3, 3, 4, 6],
    drums: { tom: 'o...............' },
    bass: 'r...............', arp: '0...1...2...1...', pad: 'strings', lead: 'bell', leadB: 'flute', density: 0.35, seed: 23,
  },
  // battle: driving war drums in E minor
  combat: {
    bpm: 128, steps: 16, root: 52, scale: AEOLIAN, prog: [0, 5, 2, 6, 0, 5, 3, 4],
    drums: { kick: 'x.......x.x.....', snare: '....x.......x...', tom: '..o...o...o..ooo', hat: 'o.o.o.o.o.o.o.o.' },
    bass: 'r.rrr.rrr.rrr.ro', arp: '0.1.2.1.0.1.2.3.', pad: 'strings', lead: 'brass', leadB: 'flute', density: 0.7, seed: 37,
  },
  // bosses: harmonic minor, heavy and urgent
  boss: {
    bpm: 140, steps: 16, root: 50, scale: HARM_MINOR, prog: [0, 5, 3, 4, 0, 3, 5, 4],
    drums: { kick: 'x..x..x.x..x..x.', snare: '....x.......x..x', tom: 'x...x...x...xxxx', hat: '..o...o...o...o.' },
    bass: 'r.o.r.o.r.o.r.of', arp: '0.2.1.2.0.2.1.3.', pad: 'choir', lead: 'brass', leadB: 'choir', density: 0.8, seed: 53,
  },
  // raid bosses: phrygian dread with choir
  raid: {
    bpm: 120, steps: 16, root: 49, scale: PHRYGIAN, prog: [0, 1, 0, 6, 0, 1, 5, 4],
    drums: { kick: 'x.....x.x.......', snare: '........x.......', tom: 'x..x..x.x..x.xxx', hat: 'o...o...o...o...' },
    bass: 'r..r..r.r..r..r.', arp: '0...2...1...3...', pad: 'choir', lead: 'choir', leadB: 'brass', density: 0.55, seed: 71,
  },
};

const LOOP_BARS = 16;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const degToMidi = (d: TrackDef, deg: number) => d.root + d.scale[((deg % 7) + 7) % 7] + 12 * Math.floor(deg / 7);
const chordDegs = (root: number) => [root, root + 2, root + 4];

interface Note { deg: number; dur: number; inst: Lead }

/** Seeded melody for the whole 16-bar loop: phrases A A' B A over the progression. */
function composeMelody(d: TrackDef): Map<number, Note> {
  const rng = new Rng(d.seed);
  const S = d.steps;
  const rhythms16 = [[0, 4, 8, 12], [0, 6, 8, 12], [0, 3, 4, 8, 12, 14], [0, 2, 4, 8, 10, 12], [0, 8, 12], [0, 4, 6, 8, 12], [0, 4, 8, 10, 12, 14]];
  const rhythms12 = [[0, 4, 8], [0, 6, 8, 10], [0, 2, 4, 8], [0, 4, 6, 8], [0, 8], [0, 2, 4, 6, 8, 10]];
  const pool = S === 16 ? rhythms16 : rhythms12;
  const thin = (r: number[]) => r.filter((x, i) => i === 0 || rng.next() < d.density + 0.15);
  const phrase = (high: boolean): number[][] => {
    const r1 = thin(rng.pick(pool)), r2 = thin(rng.pick(pool)), r3 = thin(rng.pick(pool));
    return [r1, r2, r1, high ? r3 : [0, S === 16 ? 8 : 6]];
  };
  const A = phrase(false), B = phrase(true);
  const form = [A, A, B, A];
  const out = new Map<number, Note>();
  let pitch = 9; // degrees above the root (octave 4 area)
  const A_pitches: number[][] = [];
  for (let p = 0; p < 4; p++) {
    const rh = form[p];
    const high = p === 2;
    const reuse = p === 1 || p === 3;
    for (let b = 0; b < 4; b++) {
      const bar = p * 4 + b;
      const ch = chordDegs(d.prog[bar % d.prog.length]);
      const onsets = rh[b];
      const prev = reuse && A_pitches[b] && !(p === 1 && b === 3) ? A_pitches[b] : null;
      const pitches: number[] = [];
      onsets.forEach((on, i) => {
        let deg: number;
        if (prev && prev[i] !== undefined) deg = prev[i];
        else if (on === 0 || rng.next() < 0.3) {
          // land on the chord tone nearest the current pitch
          const cands = [-7, 0, 7, 14].flatMap(o => ch.map(x => x + o)).filter(x => x >= 4 && x <= 16);
          deg = cands.sort((a, b2) => Math.abs(a - pitch) - Math.abs(b2 - pitch))[0] ?? pitch;
        } else {
          const step = rng.pick([-2, -1, -1, 1, 1, 2, 3]);
          deg = pitch + step;
          if (deg > (high ? 17 : 14)) deg -= 2;
          if (deg < 5) deg += 2;
        }
        if (b === 3 && i === onsets.length - 1 && !high) deg = ch[0] + (ch[0] < 5 ? 7 : 0);
        if (high && i === 0) deg += 2;
        pitches.push(deg);
        pitch = deg;
        const next = onsets[i + 1] ?? S;
        out.set(bar * S + on, { deg, dur: Math.min(next - on, S === 16 ? 8 : 6), inst: high ? d.leadB : d.lead });
      });
      if (p === 0) A_pitches[b] = pitches;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// instruments

function lead(c: AudioContext, inst: Lead, f: number, t: number, dur: number, out: AudioNode) {
  switch (inst) {
    case 'flute':
      tone(c, { type: 'sine', f, t, dur: dur + 0.12, v: 0.11, a: 0.06, vib: 14, out, verb: 0.5 });
      tone(c, { type: 'triangle', f: f * 2, t, dur: dur + 0.1, v: 0.015, a: 0.06, out });
      noise(c, { t, dur: 0.12, v: 0.025, bp: f * 2, q: 4, out });
      break;
    case 'pluck':
      tone(c, { type: 'triangle', f, t, dur: Math.max(0.5, dur), v: 0.14, lp: 3200, lp2: 500, out, verb: 0.3 });
      tone(c, { type: 'sawtooth', f, t, dur: 0.25, v: 0.03, lp: 2200, lp2: 400, out });
      break;
    case 'brass':
      tone(c, { type: 'sawtooth', f, t, dur: dur + 0.05, v: 0.06, a: 0.04, lp: 2600, lp2: 900, out, verb: 0.35 });
      tone(c, { type: 'sawtooth', f, t, dur: dur + 0.05, v: 0.04, a: 0.04, det: 8, lp: 1700, out, vib: 6 });
      break;
    case 'bell':
      [1, 2.76, 5.4].forEach((m, i) => tone(c, { type: 'sine', f: f * m, t, dur: 1.6 - i * 0.4, v: 0.06 / (i + 1), out, verb: 0.8 }));
      break;
    case 'choir':
      [0, -7, 7].forEach(det => tone(c, { type: 'sawtooth', f, t, dur: dur + 0.25, v: 0.03, a: 0.12, det, bp: 750, q: 2.2, out, verb: 0.7, vib: 10 }));
      break;
  }
}

function drum(c: AudioContext, k: Drum, t: number, v: number, out: AudioNode) {
  switch (k) {
    case 'kick': tone(c, { type: 'sine', f: 120, f2: 42, t, dur: 0.32, v: 0.55 * v, out }); break;
    case 'snare':
      noise(c, { t, dur: 0.16, v: 0.22 * v, bp: 1900, q: 0.7, out, verb: 0.3 });
      tone(c, { type: 'triangle', f: 190, f2: 140, t, dur: 0.08, v: 0.15 * v, out });
      break;
    case 'tom':
      tone(c, { type: 'sine', f: 95, f2: 58, t, dur: 0.42, v: 0.4 * v, out, verb: 0.25 });
      noise(c, { t, dur: 0.12, v: 0.08 * v, lp: 400, out });
      break;
    case 'hat': noise(c, { t, dur: 0.04, v: 0.06 * v, hp: 7000, out }); break;
    case 'frame':
      tone(c, { type: 'sine', f: 170, f2: 120, t, dur: 0.22, v: 0.22 * v, out });
      noise(c, { t, dur: 0.09, v: 0.09 * v, bp: 900, q: 1, out });
      break;
  }
}

// ---------------------------------------------------------------------------
// player

class Player {
  gain: GainNode;
  step = 0;
  next = 0;
  timer: number | undefined;
  melody: Map<number, Note>;
  stopped = false;
  constructor(public id: TrackId, public d: TrackDef, c: AudioContext) {
    this.gain = c.createGain();
    this.gain.gain.setValueAtTime(0.0001, c.currentTime);
    this.gain.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.5);
    this.gain.connect(buses().musicBus);
    this.melody = composeMelody(d);
    this.next = c.currentTime + 0.12;
    this.timer = window.setInterval(() => this.tick(), 40);
  }
  stop() {
    const c = audioReady();
    this.stopped = true;
    window.clearInterval(this.timer);
    if (c) {
      this.gain.gain.cancelScheduledValues(c.currentTime);
      this.gain.gain.setValueAtTime(this.gain.gain.value, c.currentTime);
      this.gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.2);
    }
    setTimeout(() => this.gain.disconnect(), 1500);
  }
  tick() {
    const c = audioReady();
    if (!c || this.stopped) return;
    if (this.next < c.currentTime - 0.5) this.next = c.currentTime + 0.05; // resumed after a pause
    const sd = 60 / this.d.bpm / 4;
    while (this.next < c.currentTime + 0.25) {
      const swing = this.step % 2 === 1 ? (this.d.swing ?? 0) * sd : 0;
      this.play(c, this.step, this.next + swing, sd);
      this.next += sd;
      this.step++;
    }
  }
  play(c: AudioContext, step: number, t: number, sd: number) {
    const d = this.d, S = d.steps, out = this.gain;
    const loopStep = step % (S * LOOP_BARS);
    const bar = Math.floor(loopStep / S), s = loopStep % S;
    const chord = chordDegs(d.prog[bar % d.prog.length]);
    // drums (fill on the last bar of each phrase)
    for (const [k, pat] of Object.entries(d.drums) as [Drum, string][]) {
      const ch = pat[s];
      if (ch === 'x' || ch === 'o') drum(c, k, t, ch === 'x' ? 1 : 0.55, out);
    }
    if (bar % 4 === 3 && s >= S - 4 && d.drums.tom) drum(c, 'tom', t, 0.7, out);
    // bass
    const b = d.bass[s];
    if (b && b !== '.') {
      const deg = chord[0] + (b === 'f' ? 4 : b === 'o' ? 7 : 0);
      const f = mtof(degToMidi(d, deg) - 12);
      let len = 1; while (d.bass[s + len] === '.' && s + len < S) len++;
      tone(c, { type: 'triangle', f, t, dur: Math.min(len * sd, 1.6), v: 0.2, lp: 700, out });
      tone(c, { type: 'sine', f: f / 2, t, dur: Math.min(len * sd, 1.6), v: 0.12, out });
    }
    // arpeggio / strum
    const a = d.arp?.[s];
    if (a && a !== '.') {
      const i = Number(a);
      const deg = i === 3 ? chord[0] + 7 : chord[i];
      lead(c, 'pluck', mtof(degToMidi(d, deg)), t, sd * 3, out);
    }
    // sustained pad at the start of each bar
    if (s === 0 && d.pad) {
      const dur = sd * S + 0.3;
      for (const deg of chord) {
        const f = mtof(degToMidi(d, deg));
        if (d.pad === 'strings') {
          tone(c, { type: 'sawtooth', f, t, dur, v: 0.022, a: 0.5, lp: 1100, det: -6, out, verb: 0.6 });
          tone(c, { type: 'sawtooth', f, t, dur, v: 0.022, a: 0.5, lp: 1100, det: 6, out });
        } else {
          tone(c, { type: 'sawtooth', f, t, dur, v: 0.028, a: 0.6, bp: 700, q: 1.8, det: -5, out, verb: 0.8, vib: 8 });
        }
      }
    }
    // melody
    const n = this.melody.get(loopStep);
    if (n) lead(c, n.inst, mtof(degToMidi(d, n.deg)), t, n.dur * sd, out);
  }
}

let current: Player | null = null;
let wanted: TrackId | null = null;
let hooked = false;

/** Switch the soundtrack (crossfades; null = silence). Safe to call every render. */
export function playMusic(id: TrackId | null) {
  wanted = id;
  if (current?.id === id) return;
  const c = audioReady();
  if (!c) {
    if (!hooked) { hooked = true; whenAudioReady(() => { hooked = false; playMusic(wanted); }); }
    return;
  }
  current?.stop();
  current = id ? new Player(id, TRACKS[id], c) : null;
}

export function _tracks() { return TRACKS; }
