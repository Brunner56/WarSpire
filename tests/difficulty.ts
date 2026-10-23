// Difficulty report: low-unlock heroes (dungeon's minimum level, auto talents, green gear from the previous tier) on Normal.
import { simRun, makeChar, autoTalents, CLASS_RACE } from './sim';
import { DUNGEONS } from '../src/data/dungeons';
import { CLASSES } from '../src/data/classes';
import { randomItem, canEquip, UidGen } from '../src/engine/loot';
import { itemScore } from '../src/engine/run';
import { Rng } from '../src/engine/rng';
import type { Character } from '../src/engine/character';
import type { Slot } from '../src/engine/types';

const SLOTS: Slot[] = ['head', 'shoulder', 'chest', 'hands', 'legs', 'feet', 'mainhand', 'offhand', 'ring', 'trinket'];

/** "Low unlocks": greens from the previous tier in every slot (none for the first dungeon). */
export function lowGear(ch: Character, tier: number, seed: number) {
  if (tier <= 1) return;
  const rng = new Rng(seed), uid = new UidGen(50000);
  for (const slot of SLOTS) {
    const it = randomItem(rng, ch.cls, tier - 1, 'uncommon', uid, slot);
    if (!canEquip(ch.cls, it)) continue;
    const curId = ch.equipped[slot];
    const cur = ch.armory.find(x => x.uid === curId);
    if (cur && itemScore(ch.cls, cur) >= itemScore(ch.cls, it)) continue;
    if (slot === 'offhand') { const mh = ch.armory.find(x => x.uid === ch.equipped.mainhand); if (mh?.twoHand) continue; }
    ch.armory.push(it);
    ch.equipped[slot] = it.uid;
    if (it.twoHand) delete ch.equipped.offhand;
  }
}

export const minLevel = (lvl: string) => Math.max(1, parseInt(lvl, 10) || 60);

export interface DiffRow { dungeon: string; spec: string; wins: number; runs: number; acts: number[]; deaths: Record<string, number> }

export function difficulty(seeds: number, dungeons = DUNGEONS.map(d => d.id), gear: 'none' | 'low' | 'mix' = 'mix', specs?: string[]) {
  const rows: DiffRow[] = [];
  for (const d of DUNGEONS.filter(x => dungeons.includes(x.id))) {
    for (const c of CLASSES) for (const t of c.trees) {
      if (specs && !specs.includes(`${c.id}/${t.id}`)) continue;
      const row: DiffRow = { dungeon: d.id, spec: `${c.id}/${t.id}`, wins: 0, runs: 0, acts: [0, 0, 0, 0], deaths: {} };
      const off = Number(process.env.SEED_OFFSET ?? 0);
      for (let s = off; s < off + seeds; s++) {
        const ch = makeChar(c.id, CLASS_RACE[c.id], t.id, minLevel(d.lvl));
        autoTalents(ch);
        if (gear === 'low' || (gear === 'mix' && s % 2 === 1)) lowGear(ch, d.tier, s * 31 + d.tier);
        const { result } = simRun(ch, d.id, 7919 * (s + 1) + d.tier * 131 + c.id.length * 17 + t.id.length);
        row.runs++;
        if (result.win) row.wins++;
        else { row.acts[result.act]++; const k = result.diedTo ?? '?'; row.deaths[k] = (row.deaths[k] ?? 0) + 1; }
      }
      rows.push(row);
    }
  }
  return rows;
}
