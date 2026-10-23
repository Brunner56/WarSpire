// Combat presentation: turns engine events into a short timeline of poses, projectiles, impacts, floaters and sounds.
import type { Combat, CEvent } from '../engine/combat';
import type { CardDef, School } from '../engine/types';
import { STATUSES } from '../engine/statuses';
import { getCard, cardActions } from '../data/cards';
import { sfx, Sfx } from './sound/audio';

const fxOpts = { motion: true, fast: false };
export function setFxOptions(o: Partial<typeof fxOpts>) {
  Object.assign(fxOpts, o);
  document.body.classList.toggle('nomotion', !motionOn());
}
const motionOn = () => fxOpts.motion && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const COL: Record<School, [string, string]> = {
  physical: ['#ffffff', '#d9c7a0'], fire: ['#ffd34a', '#ff4a10'], frost: ['#e6fbff', '#49a9ff'], shadow: ['#d39bff', '#3a0a5a'],
  arcane: ['#ffc6fb', '#a24aff'], holy: ['#fff7c2', '#ffbe2e'], nature: ['#e2ff9a', '#2fbf4f'],
};
const PLAYER = 1;
const MELEE_HUNTER = new Set(['h_raptor', 'h_mongoose', 'h_wingclip']);
const LIGHTNING = /bolt|chain|lightning|storm|shock|thunder/i;

// ---------------------------------------------------------------------------
// geometry & DOM helpers

function overlay(): HTMLElement {
  let el = document.getElementById('fx-over');
  if (!el) { el = document.createElement('div'); el.id = 'fx-over'; document.body.appendChild(el); }
  return el;
}
function unitEl(uid: number): HTMLElement | null {
  return document.querySelector(`[data-uid="${uid}"]`);
}
function artEl(uid: number): HTMLElement | null {
  const u = unitEl(uid);
  return (u?.querySelector(uid === PLAYER ? '.pdoll' : '.eart') as HTMLElement | null) ?? u;
}
interface Pt { x: number; y: number }
function center(uid: number, fy = 0.45): Pt | null {
  const el = artEl(uid);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height * fy };
}
function hand(): Pt | null {
  const el = artEl(PLAYER);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width * 0.78, y: r.top + r.height * 0.42 };
}
function div(cls: string, p: Pt, style: Record<string, string> = {}): HTMLElement {
  const d = document.createElement('div');
  d.className = cls;
  d.style.left = `${p.x}px`; d.style.top = `${p.y}px`;
  for (const [k, v] of Object.entries(style)) d.style.setProperty(k, v);
  overlay().appendChild(d);
  return d;
}
function anim(el: Element | null, kf: Keyframe[], ms: number, easing = 'ease-out', remove = false) {
  if (!el || !(el as any).animate) { if (remove) el?.remove(); return; }
  const a = (el as HTMLElement).animate(kf, { duration: ms, easing, fill: remove ? 'forwards' : 'none' });
  if (remove) a.onfinish = () => el.remove();
}
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// ---------------------------------------------------------------------------
// effects

function particles(p: Pt, n: number, color: string, o: { spread?: number; rise?: number; size?: number; ms?: number; char?: string; fall?: boolean } = {}) {
  for (let i = 0; i < n; i++) {
    const s = (o.size ?? 6) * rnd(0.6, 1.3);
    const d = div(o.char ? 'fxp ch' : 'fxp', p, { '--c': color, width: `${s}px`, height: `${s}px`, 'font-size': `${s * 1.8}px` });
    if (o.char) d.textContent = o.char;
    const ang = rnd(0, Math.PI * 2), dist = rnd(0.4, 1) * (o.spread ?? 40);
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.6 - (o.rise ?? 0) + (o.fall ? rnd(20, 45) : 0);
    anim(d, [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.3)`, opacity: 0 },
    ], (o.ms ?? 520) * rnd(0.8, 1.2), 'cubic-bezier(.2,.7,.3,1)', true);
  }
}

function burst(p: Pt, school: School, crit: boolean) {
  const [c1, c2] = COL[school];
  const ring = div('fxring', p, { '--c': c2, '--c1': c1 });
  const sz = crit ? 2.4 : 1.6;
  anim(ring, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 }, { transform: `translate(-50%,-50%) scale(${sz})`, opacity: 0 }], 380, 'ease-out', true);
  const flash = div('fxflash', p, { '--c': c1 });
  anim(flash, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0.95 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0 }], 240, 'ease-out', true);
  particles(p, crit ? 12 : 7, school === 'physical' ? '#fff3d0' : c2, { spread: crit ? 70 : 46, size: crit ? 8 : 6 });
  if (crit) shake(7);
}

function slash(p: Pt) {
  const s = div('fxslash', p, { '--r': `${rnd(-50, -20)}deg` });
  anim(s, [
    { transform: `translate(-50%,-50%) rotate(var(--r)) scaleX(.1)`, opacity: 0 },
    { transform: `translate(-50%,-50%) rotate(var(--r)) scaleX(1)`, opacity: 1, offset: 0.4 },
    { transform: `translate(-50%,-50%) rotate(var(--r)) scaleX(1.15)`, opacity: 0 },
  ], 260, 'ease-out', true);
}

function shake(px: number) {
  anim(document.querySelector('.battlefield'), [
    { transform: 'translate(0,0)' }, { transform: `translate(${px}px,${-px / 2}px)` }, { transform: `translate(${-px}px,${px / 2}px)` },
    { transform: `translate(${px / 2}px,0)` }, { transform: 'translate(0,0)' },
  ], 260, 'linear');
}

function fly(from: Pt, to: Pt, ms: number, cls: string, school: School, o: { arc?: number; trail?: number; rotate?: boolean; delay?: number } = {}) {
  const [c1, c2] = COL[school];
  setTimeout(() => {
    const el = div(`proj ${cls}`, from, { '--c': c1, '--c2': c2 });
    const t0 = performance.now();
    let lastTrail = 0;
    const ang = Math.atan2(to.y - from.y, to.x - from.x);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const x = from.x + (to.x - from.x) * e;
      const y = from.y + (to.y - from.y) * e - Math.sin(Math.PI * e) * (o.arc ?? 0);
      el.style.left = `${x}px`; el.style.top = `${y}px`;
      if (o.rotate) {
        const dy = (to.y - from.y) - Math.cos(Math.PI * e) * Math.PI * (o.arc ?? 0);
        el.style.transform = `translate(-50%,-50%) rotate(${Math.atan2(dy, to.x - from.x)}rad)`;
      }
      if (o.trail && now - lastTrail > o.trail) {
        lastTrail = now;
        const tr = div('fxtrail', { x, y }, { '--c': c2 });
        anim(tr, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 0.8 }, { transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }], 320, 'ease-out', true);
      }
      if (k < 1) requestAnimationFrame(step); else el.remove();
    };
    if (!o.rotate) el.style.transform = `translate(-50%,-50%) rotate(${ang}rad)`;
    requestAnimationFrame(step);
  }, o.delay ?? 0);
}

function lightning(from: Pt, to: Pt) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'fxbolt');
  svg.setAttribute('width', String(window.innerWidth)); svg.setAttribute('height', String(window.innerHeight));
  const path = document.createElementNS(ns, 'path');
  const pts: string[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const j = i === 0 || i === n ? 0 : rnd(-16, 16);
    pts.push(`${from.x + (to.x - from.x) * k + j * 0.4},${from.y + (to.y - from.y) * k + j}`);
  }
  path.setAttribute('d', 'M' + pts.join(' L'));
  svg.appendChild(path);
  overlay().appendChild(svg);
  anim(svg, [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0.3, offset: 0.4 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], 300, 'linear', true);
}

function beam(p: Pt, school: School) {
  const [c1, c2] = COL[school];
  const b = div('fxbeam', { x: p.x, y: p.y }, { '--c': c1, '--c2': c2 });
  anim(b, [
    { transform: 'translate(-50%,-100%) scaleX(.2)', opacity: 0 },
    { transform: 'translate(-50%,-100%) scaleX(1)', opacity: 1, offset: 0.3 },
    { transform: 'translate(-50%,-100%) scaleX(.1)', opacity: 0 },
  ], 520, 'ease-out', true);
  particles({ x: p.x, y: p.y }, 8, c1, { spread: 30, rise: 40, size: 5 });
}

function pose(kind: 'melee' | 'ranged' | 'cast' | 'self', school: School) {
  const d = artEl(PLAYER);
  if (!d) return;
  const arm = d.querySelector('.d-arm');
  const ms = fxOpts.fast ? 230 : 380;
  if (kind === 'melee') {
    anim(d, [{ transform: 'translateX(0)' }, { transform: 'translateX(34px) translateY(-6px)', offset: 0.4 }, { transform: 'translateX(0)' }], ms);
    anim(arm, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(115deg)', offset: 0.3 }, { transform: 'rotate(-40deg)', offset: 0.55 }, { transform: 'rotate(0deg)' }], ms);
  } else if (kind === 'ranged') {
    anim(d, [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)', offset: 0.3 }, { transform: 'translateX(0)' }], ms);
    anim(arm, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-62deg)', offset: 0.25 }, { transform: 'rotate(-62deg)', offset: 0.6 }, { transform: 'rotate(0deg)' }], ms);
  } else {
    anim(arm, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-105deg)', offset: 0.3 }, { transform: 'rotate(-95deg)', offset: 0.7 }, { transform: 'rotate(0deg)' }], ms + 120);
    const c = COL[school][1];
    anim(d, [{ filter: 'drop-shadow(0 0 0 transparent)' }, { filter: `drop-shadow(0 0 14px ${c})`, offset: 0.35 }, { filter: 'drop-shadow(0 0 0 transparent)' }], ms + 160);
    const hp = hand();
    if (hp) {
      const g = div('fxglow', { x: hp.x, y: hp.y - 18 }, { '--c': COL[school][0], '--c2': c });
      anim(g, [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.2)', opacity: 1, offset: 0.5 }, { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }], ms, 'ease-out', true);
    }
    if (kind === 'self') { const p = center(PLAYER, 0.6); if (p) particles(p, 9, COL[school][0], { spread: 44, rise: 60, size: 5, ms: 700 }); }
  }
}

function lunge(uid: number) {
  const el = artEl(uid);
  anim(el, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(-34px,8px) scale(1.07)', offset: 0.4 }, { transform: 'translate(0,0) scale(1)' }], fxOpts.fast ? 220 : 340);
}

function statusFx(ev: CEvent) {
  const s = ev.text ?? '';
  const p = center(ev.uid, 0.4);
  if (!p) return;
  const debuff = STATUSES[s]?.debuff;
  switch (s) {
    case 'poison': particles(p, 7, '#7dff4a', { spread: 30, rise: 40, size: 8, ms: 800 }); break;
    case 'bleed': particles(p, 6, '#c8102e', { spread: 22, fall: true, size: 6, ms: 700 }); break;
    case 'burn': particles(p, 8, '#ff8a1a', { spread: 26, rise: 55, size: 7, ms: 700 }); break;
    case 'affliction': case 'siphon': case 'doom': particles(p, 7, '#a24aff', { spread: 30, rise: 30, size: 8, ms: 800 }); break;
    case 'chill': particles(p, 7, '#dff6ff', { spread: 40, size: 5, char: '❄', ms: 800 }); break;
    case 'stun': particles({ x: p.x, y: p.y - 30 }, 5, '#ffe14a', { spread: 34, size: 6, char: '✦', ms: 800 }); break;
    case 'poly': particles(p, 10, '#ffb6f2', { spread: 40, size: 9, ms: 600 }); break;
    default:
      if (debuff) particles(p, 5, '#b05aff', { spread: 24, fall: true, size: 6, char: '▼', ms: 700 });
      else particles(p, 8, '#ffe58a', { spread: 30, rise: 50, size: 5, ms: 800 });
  }
}

function statusSound(ev: CEvent): Sfx {
  const s = ev.text ?? '';
  const m: Record<string, Sfx> = { poison: 'poison', bleed: 'bleed', burn: 'burn', chill: 'chill', stun: 'stun', poly: 'stun' };
  if (m[s]) return m[s];
  return STATUSES[s]?.debuff ? 'debuff' : 'buff';
}

// ---------------------------------------------------------------------------
// floaters

function floatText(ev: CEvent): string {
  switch (ev.t) {
    case 'dmg': return ev.text ?? `${ev.crit ? '💥' : ''}-${ev.n}`;
    case 'heal': return `+${ev.n}`;
    case 'block': return `🛡${ev.n}`;
    case 'status': return ev.text ? `${(ev.n ?? 0) > 1 ? ev.n + ' ' : ''}${statusName(ev.text)}` : '';
    case 'dodge': return 'Dodge!';
    case 'die': return '☠';
    case 'summon': return ev.text ? `📯 ${ev.text}` : '📯';
    case 'phase': return '⚠';
    default: return ev.text ?? '';
  }
}
function statusName(s: string) {
  const m: Record<string, string> = { str: 'AP', sp: 'SP', vuln: 'Exposed', weak: 'Weak', frail: 'Sundered', poison: 'Poison', bleed: 'Bleed', burn: 'Burn', affliction: 'Affliction', chill: 'Chill', stun: 'Stun', poly: 'Sheep', mark: 'Mark', dodge: 'Dodge', thorns: 'Thorns', regen: 'Regen' };
  return m[s] ?? STATUSES[s]?.name ?? s;
}
const SCHOOL_CLASS: Record<string, string> = { physical: 'phys', holy: 'holy', fire: 'fire', frost: 'frost', arcane: 'arcane', shadow: 'shadow', nature: 'nature' };
function floatClass(ev: CEvent): string {
  if (ev.t === 'dmg') return `dmg ${SCHOOL_CLASS[ev.school ?? 'physical'] ?? ''} ${ev.crit ? 'crit' : ''}`;
  return ev.t;
}

function floater(ev: CEvent, k: number) {
  const text = floatText(ev);
  if (!text) return;
  const el = unitEl(ev.uid);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'floater ' + floatClass(ev);
  f.textContent = text;
  f.style.left = `${r.left + r.width / 2 + ((k % 3) - 1) * 16}px`;
  f.style.top = `${r.top + r.height * 0.35 - k * 6}px`;
  overlay().appendChild(f);
  setTimeout(() => f.remove(), 1500);
}

// ---------------------------------------------------------------------------
// timeline

type Kind = 'melee' | 'ranged' | 'spell' | 'self';
function playKind(c: Combat, def: CardDef, hasTargets: boolean): Kind {
  const school = def.school ?? 'physical';
  if (def.type === 'attack' && school === 'physical') return c.p.cls === 'hunter' && !MELEE_HUNTER.has(def.id) ? 'ranged' : 'melee';
  if (hasTargets && (def.type === 'attack' || school !== 'physical')) return 'spell';
  return 'self';
}

function targetsAfter(evs: CEvent[], i: number): number[] {
  const out: number[] = [];
  for (let j = i + 1; j < evs.length; j++) {
    const e = evs[j];
    if (e.t === 'play' || e.t === 'swing' || e.t === 'petAtk') break;
    if (e.uid !== PLAYER && (e.t === 'dmg' || e.t === 'status' || e.t === 'die') && !out.includes(e.uid)) out.push(e.uid);
  }
  return out;
}

function launch(def: CardDef, kind: Kind, school: School, targets: number[], ms: number) {
  const from = hand();
  if (!from) return;
  targets.forEach((uid, i) => {
    const to = center(uid);
    if (!to) return;
    const delay = i * 50;
    if (kind === 'ranged') { fly(from, to, ms, 'arrow', 'physical', { arc: 26, rotate: true, delay }); return; }
    if (school === 'nature' && LIGHTNING.test(def.id)) { setTimeout(() => lightning(from, to), delay + ms * 0.5); return; }
    if (school === 'holy') { setTimeout(() => beam(to, 'holy'), delay + ms * 0.4); return; }
    if (school === 'arcane') { for (let m = 0; m < 3; m++) fly(from, to, ms, 'orb small', school, { arc: rnd(-30, 30), trail: 30, delay: delay + m * 55 }); return; }
    const cls = school === 'frost' ? 'shard' : school === 'fire' ? 'orb big' : 'orb';
    fly(from, to, ms, cls, school, { arc: 14, trail: school === 'fire' ? 18 : 28, rotate: school === 'frost', delay });
  });
}

/** Plays and clears the combat's pending events. Returns how long the sequence takes (ms). */
export function playCombatEvents(c: Combat): number {
  const evs = c.events.splice(0);
  const motion = motionOn();
  const k = fxOpts.fast ? 0.55 : 1;
  const flight = (motion ? 260 : 0) * k;
  let t = 0;
  const counts: Record<number, number> = {};
  const at = (ms: number, f: () => void) => { if (ms <= 0) f(); else setTimeout(f, ms); };
  let meleeTargets: number[] = [];
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    if (ev.t === 'play') {
      const def = ev.card ? getCard(ev.card) : null;
      if (!def) continue;
      const targets = ev.tgt ? [ev.tgt] : targetsAfter(evs, i);
      const school = def.school ?? 'physical';
      const kind = playKind(c, def, targets.length > 0 && cardActions(def, false).some(a => a.k === 'dmg' || a.k === 'apply' || a.k === 'fn' || a.k === 'judge'));
      meleeTargets = kind === 'melee' ? targets : [];
      at(t, () => {
        sfx(kind === 'melee' ? 'swing' : kind === 'ranged' ? 'shoot' : kind === 'spell' ? 'cast' : 'card', { school });
        if (!motion) return;
        pose(kind === 'spell' ? 'cast' : kind, school);
        if (kind === 'spell' || kind === 'ranged') launch(def, kind, school, targets, flight);
      });
      t += kind === 'spell' || kind === 'ranged' ? flight + 40 * k : kind === 'melee' ? (motion ? 150 : 0) * k : 60 * k;
      continue;
    }
    if (ev.t === 'swing') {
      at(t, () => { sfx('swing'); if (motion) lunge(ev.uid); });
      t += (motion ? 140 : 60) * k;
      continue;
    }
    if (ev.t === 'petAtk') {
      at(t, () => {
        sfx('pet');
        const from = center(PLAYER, 0.8), to = ev.tgt ? center(ev.tgt) : null;
        if (motion && from && to) fly({ x: from.x + 30, y: from.y }, to, 220 * k, 'orb pet', ev.school ?? 'physical', { arc: 40, trail: 40 });
      });
      t += (motion ? 230 : 40) * k;
      continue;
    }
    const n = counts[ev.uid] = (counts[ev.uid] ?? 0) + 1;
    const melee = meleeTargets.includes(ev.uid) && ev.t === 'dmg';
    at(t, () => {
      floater(ev, n);
      impact(ev, motion, melee);
    });
    t += (ev.t === 'dmg' ? 90 : ev.t === 'heal' || ev.t === 'block' ? 60 : 30) * k;
  }
  return t;
}

function impact(ev: CEvent, motion: boolean, melee: boolean) {
  const p = center(ev.uid);
  switch (ev.t) {
    case 'dmg': {
      const n = ev.n ?? 0;
      if (n > 0) {
        sfx('hit', { school: ev.school ?? 'physical', crit: ev.crit, n });
        const el = unitEl(ev.uid);
        if (el) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
        if (motion && p) { if (melee) slash(p); burst(p, ev.school ?? 'physical', !!ev.crit); }
        if (ev.uid === PLAYER && n >= 12 && motion) shake(5);
      } else if (ev.text === 'Blocked') {
        sfx('blocked');
        if (motion && p) particles(p, 6, '#cfe3ff', { spread: 30, size: 4 });
      }
      break;
    }
    case 'heal':
      sfx('heal');
      if (motion && p) { particles({ x: p.x, y: p.y + 20 }, 9, '#7dff8a', { spread: 34, rise: 60, size: 6, ms: 900 }); particles(p, 3, '#eaffd0', { spread: 20, rise: 40, size: 10, char: '✚', ms: 900 }); }
      break;
    case 'block':
      sfx('block');
      if (motion && p) {
        const s = div('fxshield', p);
        anim(s, [{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(1.15)', opacity: 0 }], 420, 'ease-out', true);
      }
      break;
    case 'status':
      sfx(statusSound(ev));
      if (motion) statusFx(ev);
      break;
    case 'dodge':
      sfx('dodge');
      if (motion) anim(artEl(ev.uid), [{ transform: 'translateX(0)' }, { transform: `translateX(${ev.uid === PLAYER ? -26 : 26}px)`, offset: 0.4 }, { transform: 'translateX(0)' }], 300);
      break;
    case 'die':
      sfx('die');
      if (motion && p) { particles(p, 14, '#3a0a0a', { spread: 60, size: 8, ms: 700 }); particles(p, 6, '#e0e0ff', { spread: 20, rise: 80, size: 5, ms: 1100 }); }
      break;
    case 'summon':
      sfx('summon');
      if (motion && p) particles(p, 12, '#9a9a9a', { spread: 50, rise: 20, size: 14, ms: 700 });
      break;
    case 'phase':
      sfx('roar');
      if (motion) {
        shake(10);
        const bf = document.querySelector('.battlefield');
        if (bf) anim(bf, [{ boxShadow: 'inset 0 0 0 0 rgba(255,40,20,0)' }, { boxShadow: 'inset 0 0 120px 30px rgba(255,40,20,.55)' }, { boxShadow: 'inset 0 0 0 0 rgba(255,40,20,0)' }], 900);
      }
      break;
    case 'text':
      if (ev.text === 'Frozen!') sfx('chill');
      break;
  }
}

/** Flies a ghost of the played card from the hand toward the battlefield. */
export function cardGhost(from: DOMRect | null, html: string | null) {
  if (!from || !html || !motionOn()) return;
  const g = div('fxcard', { x: from.left, y: from.top }, { width: `${from.width}px`, height: `${from.height}px` });
  g.innerHTML = html;
  const bf = document.querySelector('.battlefield')?.getBoundingClientRect();
  const dx = bf ? bf.left + bf.width * 0.55 - (from.left + from.width / 2) : 0;
  const dy = bf ? bf.top + bf.height * 0.5 - (from.top + from.height / 2) : -200;
  anim(g, [
    { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
    { transform: `translate(${dx * 0.6}px,${dy * 0.6}px) scale(.8) rotate(-6deg)`, opacity: 0.9, offset: 0.6 },
    { transform: `translate(${dx}px,${dy}px) scale(.3) rotate(-12deg)`, opacity: 0 },
  ], fxOpts.fast ? 220 : 340, 'ease-in', true);
}
