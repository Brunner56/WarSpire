// Persistent characters, derived stats and passive collection.
import type { ClassId, HookSet, Item, RaceId, RunMods, Slot, Stats, StatKey } from './types';
import { CLASS_BY_ID } from '../data/classes';
import { RACE_BY_ID } from '../data/races';
import { TALENT_BY_ID, TALENTS, TIER_REQ, talentPointsForLevel } from '../data/talents';
import { FX, SET_BY_ID, itemHooks } from '../data/items';
import type { Provider } from './combat';

export interface Look { skin: number; hair: number; hairColor: number; face: number }

export interface Character {
  id: string;
  name: string;
  race: RaceId;
  cls: ClassId;
  spec: string;
  look: Look;
  pet?: string;
  level: number;
  xp: number;
  talents: Record<string, number>;
  armory: Item[];
  equipped: Partial<Record<Slot, number>>; // uid of armory item
  cleared: Record<string, number>; // dungeon id -> highest heroic rank cleared
  stats: { runs: number; wins: number; deaths: number; bossKills: number; bestFloor: number };
  created: number;
}

export const MAX_LEVEL = 60;
export const xpToNext = (lvl: number) => 50 + 10 * lvl;

export function emptyStats(): Stats { return { sta: 0, str: 0, agi: 0, int: 0, spi: 0, armor: 0, ap: 0, sp: 0, crit: 0 }; }

export function addStats(a: Stats, b: Partial<Stats>) { for (const [k, v] of Object.entries(b)) a[k as StatKey] += v ?? 0; }

export function hookStats(h: HookSet, n: number): Partial<Stats> {
  if (!h.stats) return {};
  return typeof h.stats === 'function' ? h.stats(n) : h.stats;
}
export function hookRun(h: HookSet, n: number): RunMods {
  if (!h.run) return {};
  return typeof h.run === 'function' ? h.run(n) : h.run;
}

export function talentPointsSpent(ch: Character, tree?: string): number {
  return Object.entries(ch.talents).reduce((s, [id, r]) => (!tree || TALENT_BY_ID[id]?.tree === tree ? s + r : s), 0);
}
export function talentPointsAvailable(ch: Character): number {
  return talentPointsForLevel(ch.level) - talentPointsSpent(ch);
}
export function canLearnTalent(ch: Character, id: string): boolean {
  const t = TALENT_BY_ID[id];
  if (!t || t.cls !== ch.cls) return false;
  if ((ch.talents[id] ?? 0) >= t.max) return false;
  if (talentPointsAvailable(ch) <= 0) return false;
  return talentPointsSpent(ch, t.tree) >= TIER_REQ[t.tier];
}

/** Count of set pieces per set among equipped items. */
export function setCounts(items: Item[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) if (it.set) out[it.set] = (out[it.set] ?? 0) + 1;
  return out;
}

/** Gather all passive providers (race, talents, gear effects, set bonuses). */
export function collectProviders(ch: Pick<Character, 'race' | 'talents' | 'cls'>, gear: Item[]): Provider[] {
  const out: Provider[] = [];
  out.push({ h: RACE_BY_ID[ch.race].hooks, n: 1, id: 'race' });
  for (const [id, r] of Object.entries(ch.talents)) {
    const t = TALENT_BY_ID[id];
    if (t?.hooks && r > 0) out.push({ h: t.hooks, n: r, id: 'talent:' + id });
  }
  for (const it of gear) {
    const h = itemHooks(it);
    if (h) out.push({ h, n: 1, id: 'item:' + it.uid });
  }
  for (const [sid, n] of Object.entries(setCounts(gear))) {
    const s = SET_BY_ID[sid];
    if (!s) continue;
    for (const b of s.bonuses) if (n >= b.n) out.push({ h: b.fx.hooks, n: 1, id: `set:${sid}:${b.n}` });
  }
  return out;
}

export interface Derived {
  stats: Stats;
  maxHp: number;
  ap: number;
  sp: number;
  physCrit: number;
  spellCrit: number;
  startBlock: number;
  postHeal: number;
  run: Required<RunMods>;
}

export function derive(ch: Pick<Character, 'race' | 'talents' | 'cls' | 'level'>, gear: Item[], providers: Provider[]): Derived {
  const cls = CLASS_BY_ID[ch.cls];
  const st = emptyStats();
  for (const it of gear) addStats(st, it.stats);
  const run: Required<RunMods> = { gold: 0, shop: 0, rest: 0, postHeal: 0, maxHpPct: 0, cardChoices: 0, xp: 0 };
  for (const p of providers) {
    addStats(st, hookStats(p.h, p.n));
    const r = hookRun(p.h, p.n);
    for (const [k, v] of Object.entries(r)) (run as any)[k] += v ?? 0;
  }
  const lvlHp = Math.floor(ch.level / 2);
  let maxHp = cls.hp + lvlHp + st.sta * 2;
  maxHp = Math.round(maxHp * (1 + run.maxHpPct));
  const phys = cls.physStat === 'agi' ? st.agi : st.str;
  const druidPhys = ch.cls === 'druid' ? Math.max(st.agi, st.str) : phys;
  const ap = Math.floor((ch.cls === 'druid' ? druidPhys : phys) / 2) + st.ap;
  const sp = Math.floor(st.int / 2) + st.sp;
  return {
    stats: st, maxHp, ap, sp,
    physCrit: 5 + st.agi * 0.5 + st.crit,
    spellCrit: 5 + st.int * 0.25 + st.crit,
    startBlock: Math.floor(st.armor / 3),
    postHeal: Math.floor(st.spi / 2) + run.postHeal,
    run,
  };
}

export function equippedItems(ch: Character): Item[] {
  return Object.values(ch.equipped).map(uid => ch.armory.find(i => i.uid === uid)).filter((x): x is Item => !!x);
}

export function talentCards(ch: Pick<Character, 'talents'>): string[] {
  return Object.entries(ch.talents).filter(([id, r]) => r > 0 && TALENT_BY_ID[id]?.card).map(([id]) => TALENT_BY_ID[id].card!);
}

export function classTalentsByTree(cls: ClassId, tree: string) { return TALENTS.filter(t => t.cls === cls && t.tree === tree); }

export function fxDesc(id?: string): string | undefined { return id ? FX[id]?.desc : undefined; }
