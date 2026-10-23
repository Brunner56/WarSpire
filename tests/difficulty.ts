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

// ---------------------------------------------------------------------------
// Heroic/Mythic: heroes snapshotted right after they clear each dungeon on Normal during a campaign.

import { campaign } from './campaign';

export interface Snapshot { dungeon: string; spec: string; ch: Character }

export function progressionSnapshots(specs?: string[]): Snapshot[] {
  const out: Snapshot[] = [];
  for (const c of CLASSES) for (const t of c.trees) {
    const spec = `${c.id}/${t.id}`;
    if (specs && !specs.includes(spec)) continue;
    campaign(c.id, t.id, 1000 + c.id.length * 7 + t.id.length, 6, (dungeon, ch) => out.push({ dungeon, spec, ch: JSON.parse(JSON.stringify(ch)) }));
  }
  return out;
}

export function progressedRates(snaps: Snapshot[], rank: number, seeds: number, offset = 0) {
  const byDungeon: Record<string, [number, number]> = {}, bySpec: Record<string, [number, number]> = {};
  let wins = 0, runs = 0;
  for (const sn of snaps) {
    const d = DUNGEONS.find(x => x.id === sn.dungeon)!;
    for (let s = offset; s < offset + seeds; s++) {
      const { result } = simRun(sn.ch, d.id, 104729 * (s + 1) + d.tier * 977 + sn.spec.length * 31, rank);
      runs++; if (result.win) wins++;
      const bd = (byDungeon[d.id] ??= [0, 0]); bd[1]++; if (result.win) bd[0]++;
      const bs = (bySpec[sn.spec] ??= [0, 0]); bs[1]++; if (result.win) bs[0]++;
    }
  }
  return { rate: wins / Math.max(1, runs), runs, byDungeon, bySpec };
}
