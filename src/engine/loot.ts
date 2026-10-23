// Item generation and equip rules.
import type { ClassId, Item, Quality, Slot, StatKey, WeaponType, OffType, ArmorType } from './types';
import { Rng } from './rng';
import { CLASS_BY_ID, canWearArmor } from '../data/classes';
import {
  NAMED, SETS, setPieces, makeItem, SUFFIXES, BASE_NAMES, WPN_NAMES, OFF_NAMES, PREFIX_BY_TIER, TIER_PALETTE, ItemTpl, STARTER_GEAR,
} from '../data/items';

const DUAL_WIELD: ClassId[] = ['warrior', 'rogue', 'hunter'];

export function canEquip(cls: ClassId, it: Item): boolean {
  const c = CLASS_BY_ID[cls];
  if (it.cls && !it.cls.includes(cls)) return false;
  if (it.armor && !canWearArmor(c, it.armor)) return false;
  if (it.slot === 'mainhand' && it.wpn && !c.weapons.includes(it.wpn)) return false;
  if (it.slot === 'offhand' && it.off) {
    if (it.off === 'weapon') return DUAL_WIELD.includes(cls);
    if (!c.offhands.includes(it.off)) return false;
  }
  return true;
}

export function itemScore(cls: ClassId, it: Pick<Item, 'stats'>): number {
  const w = CLASS_BY_ID[cls].weights;
  let s = 0;
  for (const [k, v] of Object.entries(it.stats)) s += (w[k as StatKey] ?? (k === 'armor' ? 0.3 : k === 'sta' ? 1 : 0)) * (v ?? 0);
  return s;
}

function tplUseful(cls: ClassId, t: ItemTpl): boolean {
  const w = CLASS_BY_ID[cls].weights;
  return t.prim.some(p => (w[p] ?? 0) >= 1.5) || t.prim.length === 1 && t.prim[0] === 'sta';
}

function tplUsable(cls: ClassId, t: ItemTpl): boolean {
  return canEquip(cls, makeItem(t, 0));
}

export class UidGen { constructor(public n: number) {} next() { return ++this.n; } }

/** Named loot from a dungeon's loot table that suits the class. */
export function namedLoot(rng: Rng, cls: ClassId, dungeonId: string, uid: UidGen, opts: { minQ?: Quality; count?: number; includeSets?: boolean } = {}): Item[] {
  let pool = (NAMED[dungeonId] ?? []).filter(t => tplUsable(cls, t) && tplUseful(cls, t));
  if (opts.includeSets) {
    if (dungeonId === 'mc') pool = pool.concat(setPieces(SETS.find(s => s.kind === 'raid' && s.cls === cls && s.tier === 1)!.id));
    if (dungeonId === 'bwl') pool = pool.concat(setPieces(SETS.find(s => s.kind === 'raid' && s.cls === cls && s.tier === 2)!.id).filter(t => t.slot !== 'head'));
    if (dungeonId === 'ony') pool = pool.concat(setPieces(SETS.find(s => s.kind === 'raid' && s.cls === cls && s.tier === 2)!.id).filter(t => t.slot === 'head'));
  }
  if (opts.minQ) {
    const order: Quality[] = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
    const better = pool.filter(t => order.indexOf(t.q) >= order.indexOf(opts.minQ!));
    if (better.length) pool = better;
  }
  // legendaries are rare even from their boss
  pool = pool.filter(t => t.q !== 'legendary' || rng.chance(0.25));
  const picks = rng.sample(pool, Math.min(pool.length, opts.count ?? 1));
  return picks.map(t => makeItem(t, uid.next()));
}

const ARMOR_SLOTS: Slot[] = ['head', 'shoulder', 'chest', 'hands', 'legs', 'feet'];

/** A random "of the X" item. */
export function randomItem(rng: Rng, cls: ClassId, tier: number, q: Quality, uid: UidGen, slot?: Slot): Item {
  const c = CLASS_BY_ID[cls];
  const slots: Slot[] = [...ARMOR_SLOTS, ...ARMOR_SLOTS, 'mainhand', 'offhand', 'ring', 'trinket'];
  const s: Slot = slot ?? rng.pick(slots);
  const w = c.weights;
  const suffix = rng.weighted(SUFFIXES, x => x.prim.reduce((a, p) => a + (w[p] ?? 0), 0) ** 2);
  const prefix = PREFIX_BY_TIER[Math.min(PREFIX_BY_TIER.length - 1, tier)];
  const pal = TIER_PALETTE[Math.min(TIER_PALETTE.length - 1, tier)];
  const tpl: ItemTpl = { id: `rnd_${s}`, name: '', slot: s, q, tier, prim: suffix.prim, look: { c1: rng.pick([pal[0], pal[1], '#5a6a7a', '#7a5a3a', '#4a6a4a']), c2: pal[1] } };
  if (ARMOR_SLOTS.includes(s)) {
    const at: ArmorType = c.armor;
    tpl.armor = at;
    tpl.name = `${prefix} ${rng.pick(BASE_NAMES[`${s}:${at}`])} ${suffix.name}`;
  } else if (s === 'mainhand') {
    const wpn: WeaponType = rng.pick(c.weapons);
    tpl.wpn = wpn;
    tpl.twoHand = ['staff', 'polearm', 'bow', 'gun', 'sword2h', 'axe2h', 'mace2h'].includes(wpn);
    tpl.name = `${prefix} ${rng.pick(WPN_NAMES[wpn])} ${suffix.name}`;
  } else if (s === 'offhand') {
    const off: OffType = rng.pick(cls === 'warrior' || cls === 'rogue' || cls === 'hunter' ? [...c.offhands, 'weapon' as OffType] : c.offhands);
    tpl.off = off;
    tpl.name = `${prefix} ${rng.pick(OFF_NAMES[off])} ${suffix.name}`;
  } else if (s === 'ring') {
    tpl.name = `${prefix} ${rng.pick(['Band', 'Ring', 'Signet', 'Loop'])} ${suffix.name}`;
  } else {
    tpl.name = `${prefix} ${rng.pick(['Talisman', 'Charm', 'Idol', 'Medallion', 'Token'])} ${suffix.name}`;
  }
  const it = makeItem(tpl, uid.next());
  it.id = `rnd_${it.uid}`;
  return it;
}

/** A random piece of this class's dungeon set (1 or 2), with stats for the dungeon's tier. */
export function dungeonSetPiece(rng: Rng, cls: ClassId, which: 1 | 2, tier: number, uid: UidGen): Item {
  const set = SETS.find(s => s.kind === 'dungeon' && s.cls === cls && s.tier === which)!;
  return makeItem(rng.pick(setPieces(set.id, tier)), uid.next());
}

export function rollQuality(rng: Rng, tier: number, boost: number, raid: boolean): Quality {
  const r = rng.next() * 100;
  const epic = (raid ? 12 : tier >= 7 ? 4 : 0) + boost * 2;
  const rare = 15 + tier * 2 + boost * 5;
  if (r < epic) return 'epic';
  if (r < epic + rare) return 'rare';
  return 'uncommon';
}

export function starterItems(cls: ClassId, uid: UidGen): Item[] {
  return STARTER_GEAR[cls].map(t => makeItem(t, uid.next()));
}
