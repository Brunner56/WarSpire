// Reusable passive-effect factories used by talents, gear effects and set bonuses.
// Each factory returns a HookSet whose hooks receive `n` (talent rank or stack count).
import type { HookSet, School, StatKey } from '../engine/types';

const merge = (...hs: HookSet[]): HookSet => {
  const out: HookSet = {};
  for (const h of hs) {
    for (const [k, v] of Object.entries(h) as [keyof HookSet, any][]) {
      const prev = (out as any)[k];
      if ((k === 'stats' || k === 'run') && prev) {
        const f1 = prev, f2 = v;
        (out as any)[k] = (n: number) => {
          const a1 = typeof f1 === 'function' ? f1(n) : f1;
          const a2 = typeof f2 === 'function' ? f2(n) : f2;
          const r: any = { ...a1 };
          for (const [kk, vv] of Object.entries(a2)) r[kk] = (r[kk] ?? 0) + (vv as number);
          return r;
        };
      } else if (prev && typeof prev === 'function' && typeof v === 'function') {
        if (['costMod', 'drawBonus', 'resBonus', 'critMod'].includes(k)) (out as any)[k] = (...a: any[]) => prev(...a) + v(...a);
        else if (['blockMod', 'healMod'].includes(k)) (out as any)[k] = (c: any, n: number, amt: number, d: any) => v(c, n, prev(c, n, amt, d), d);
        else if (k === 'applyMod') (out as any)[k] = (c: any, n: number, s: string, amt: number, t: any) => v(c, n, s, prev(c, n, s, amt, t), t);
        else if (k === 'onDeath') (out as any)[k] = (...a: any[]) => prev(...a) || v(...a);
        else (out as any)[k] = (...a: any[]) => { prev(...a); v(...a); };
      } else if (prev && typeof prev === 'object' && typeof v === 'object') {
        (out as any)[k] = { ...prev, ...v };
      } else (out as any)[k] = v;
    }
  }
  return out;
};
export const all = merge;

export const P = {
  /** +per×n damage on cards of the given schools */
  dmgSchool: (schools: School[], per: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'card' && schools.includes(d.school)) d.amt += per * n; } }),
  /** +per×n damage on specific cards */
  dmgCards: (ids: string[], per: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'card' && d.card && ids.includes(d.card.id)) d.amt += per * n; } }),
  /** +pct×n % damage on cards of a type/school */
  dmgPct: (pred: (school: School, isAttack: boolean) => boolean, pct: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'card' && pred(d.school, d.isAttack)) d.amt *= 1 + (pct * n) / 100; } }),
  dmgAttack: (per: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'card' && d.isAttack) d.amt += per * n; } }),
  dmgAll: (per: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'card') d.amt += per * n; } }),
  crit: (pred: (school: School) => boolean, pct: number): HookSet => ({ critMod: (_c, n, d) => (pred(d.school) ? pct * n : 0) }),
  critDmg: (pct: number): HookSet => ({ onCombatStart: (c, n) => { c.mem.critBonus = (c.mem.critBonus ?? 0) + pct * n; } }),
  block: (per: number): HookSet => ({ blockMod: (_c, n, amt, def) => (def ? amt + per * n : amt) }),
  healPct: (pct: number): HookSet => ({ healMod: (_c, n, amt) => amt * (1 + (pct * n) / 100) }),
  applyPlus: (status: string, per: number): HookSet => ({ applyMod: (_c, n, s, amt, t) => (!t.isPlayer && s === status ? amt + per * n : amt) }),
  start: (status: string, per: number): HookSet => ({ onCombatStart: (c, n) => c.applyStatus(c.p, status, per * n, true) }),
  startBlock: (per: number): HookSet => ({ onCombatStart: (c, n) => c.gainBlock(per * n, undefined, true) }),
  startRes: (per: number): HookSet => ({ onCombatStart: (c, n) => c.gainRes(per * n) }),
  startAll: (status: string, per: number): HookSet => ({ onCombatStart: (c, n) => { for (const e of c.alive()) c.applyStatus(e, status, per * n, true); } }),
  stat: (k: StatKey, per: number): HookSet => ({ stats: (n: number) => ({ [k]: per * n }) }),
  pet: (per: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'pet') d.amt += per * n; } }),
  turnBlock: (per: number): HookSet => ({ onTurnStart: (c, n) => c.gainBlock(per * n, undefined, true) }),
  turnHeal: (per: number): HookSet => ({ onTurnEnd: (c, n) => c.heal(per * n) }),
  postHeal: (per: number): HookSet => ({ run: (n: number) => ({ postHeal: per * n }) }),
  gold: (pct: number): HookSet => ({ run: (n: number) => ({ gold: (pct * n) / 100 }) }),
  costMinus: (ids: string[], per = 1): HookSet => ({ costMod: (_c, n, def) => (ids.includes(def.id) ? -per * Math.min(n, 1) : 0) }),
  /** Overhealing deals pct% as Holy/Nature damage to a random enemy */
  overheal: (pct: number, school: School = 'holy'): HookSet => ({
    onHeal: (c, n, _h, over) => { if (over > 0) { const t = c.randomEnemy(); if (t) c.effectDamage(t, Math.ceil(over * (pct * n) / 100), school, 'effect'); } },
  }),
  /** On crit: chance×n % to gain 1 resource */
  critRes: (chance: number): HookSet => ({ onCrit: (c, n, d) => { if (d.src === 'card' && c.rng.next() * 100 < chance * n) c.gainRes(1); } }),
  /** On crit: apply status to target */
  critApply: (status: string, per: number, pred?: (s: School) => boolean): HookSet => ({
    onCrit: (c, n, d) => { if (d.src === 'card' && (!pred || pred(d.school)) && !d.target.isPlayer && !d.target.dead) c.applyStatus(d.target, status, Math.max(1, Math.round(per * n)), true); },
  }),
  /** Ignite: crit applies burn equal to pct% of the hit */
  ignite: (pct: number): HookSet => ({
    onCrit: (c, n, d) => { if (d.src === 'card' && d.school === 'fire' && !d.target.dead) c.applyStatus(d.target, 'burn', Math.max(1, Math.floor((d.amt * pct * n) / 100)), true); },
  }),
  /** Bonus damage vs targets with a status */
  vsStatus: (status: string, pct: number): HookSet => ({ outDmg: (_c, n, d) => { if (d.src === 'card' && d.target.st[status]) d.amt *= 1 + (pct * n) / 100; } }),
  inPct: (pct: number): HookSet => ({ inDmg: (_c, n, d) => { d.amt *= 1 - (pct * n) / 100; } }),
  drawFirst: (per: number): HookSet => ({ drawBonus: (c, n) => (c.turn === 1 ? per * n : 0) }),
  resFirst: (per: number): HookSet => ({ resBonus: (c, n) => (c.turn === 1 ? per * n : 0) }),
  killHeal: (per: number): HookSet => ({ onKill: (c, n) => c.heal(per * n) }),
  killRes: (per: number): HookSet => ({ onKill: (c, n) => c.gainRes(per * n) }),
};
