import type { Action, CardDef, ClassId } from '../../engine/types';
import { WARRIOR_CARDS } from './warrior';
import { PALADIN_CARDS } from './paladin';
import { HUNTER_CARDS } from './hunter';
import { ROGUE_CARDS } from './rogue';
import { PRIEST_CARDS } from './priest';
import { SHAMAN_CARDS } from './shaman';
import { MAGE_CARDS } from './mage';
import { WARLOCK_CARDS } from './warlock';
import { DRUID_CARDS } from './druid';
import { NEUTRAL_CARDS, POTIONS } from './neutral';

export const ALL_CARDS: CardDef[] = [
  ...WARRIOR_CARDS, ...PALADIN_CARDS, ...HUNTER_CARDS, ...ROGUE_CARDS, ...PRIEST_CARDS,
  ...SHAMAN_CARDS, ...MAGE_CARDS, ...WARLOCK_CARDS, ...DRUID_CARDS, ...NEUTRAL_CARDS, ...POTIONS,
];
export { POTIONS };

const BY_ID = new Map<string, CardDef>();
for (const c of ALL_CARDS) {
  if (BY_ID.has(c.id)) throw new Error('Duplicate card id ' + c.id);
  BY_ID.set(c.id, c);
}

export function getCard(id: string): CardDef {
  const c = BY_ID.get(id);
  if (!c) throw new Error('Unknown card ' + id);
  return c;
}
export function hasCard(id: string): boolean { return BY_ID.has(id); }

export function classCards(cls: ClassId): CardDef[] {
  return ALL_CARDS.filter(c => c.cls === cls);
}

const upCache = new Map<string, { a: Action[]; cost: number }>();

function autoUpgrade(def: CardDef): { a: Action[]; cost: number } {
  const cached = upCache.get(def.id);
  if (cached) return cached;
  let changed = false;
  const bump = (n: number) => { changed = true; return n + Math.max(2, Math.round(n * 0.35)); };
  const a = def.u ?? def.a.map(x => {
    switch (x.k) {
      case 'dmg': return x.n > 0 ? { ...x, n: bump(x.n) } : x;
      case 'block': case 'heal': case 'absorb': return x.n > 0 ? { ...x, n: bump(x.n) } : x;
      case 'apply': if (x.s !== 'stun' && x.s !== 'poly' && x.s !== 'invuln' && x.n > 0) { changed = true; return { ...x, n: x.n + 1 }; } return x;
      default: return x;
    }
  });
  if (def.u) changed = true;
  let cost = def.uc ?? def.cost;
  if (def.uc === undefined && !changed && def.cost > 0) cost = def.cost - 1;
  const r = { a, cost };
  upCache.set(def.id, r);
  return r;
}

export function cardActions(def: CardDef, up: boolean): Action[] {
  return up ? autoUpgrade(def).a : def.a;
}
export function cardCost(def: CardDef, up: boolean): number {
  return up ? autoUpgrade(def).cost : def.cost;
}

export function canUpgrade(def: CardDef): boolean {
  return def.cls !== 'curse' && def.cls !== 'token';
}
