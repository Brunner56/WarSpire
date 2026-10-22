// Campaign simulation: a bot hero progresses through every dungeon and raid, keeping loot.
import { simRun, makeChar, autoTalents, CLASS_RACE } from './sim';
import { finishRun, keepCandidates, itemScore } from '../src/engine/run';
import { DUNGEONS } from '../src/data/dungeons';
import { canEquip } from '../src/engine/loot';
import type { ClassId } from '../src/engine/types';
import type { Character } from '../src/engine/character';

function equipBest(ch: Character) {
  for (const it of ch.armory) {
    if (!canEquip(ch.cls, it)) continue;
    const cur = ch.armory.find(x => x.uid === ch.equipped[it.slot]);
    if (!cur || itemScore(ch.cls, it) > itemScore(ch.cls, cur)) ch.equipped[it.slot] = it.uid;
  }
}

export function campaign(cls: ClassId, spec: string, seed: number, maxTries = 6) {
  const ch = makeChar(cls, CLASS_RACE[cls], spec, 1);
  const log: string[] = [];
  let s = seed;
  let runs = 0;
  const deaths: Record<string, number> = {};
  for (const d of DUNGEONS) {
    let ok = false;
    for (let t = 0; t < maxTries && !ok; t++) {
      autoTalents(ch);
      equipBest(ch);
      const { result, run } = simRun(ch, d.id, s++);
      runs++;
      const keep = keepCandidates(run).sort((a, b) => itemScore(cls, b) - itemScore(cls, a)).slice(0, 2).map(i => i.uid);
      finishRun(ch, run, keep);
      ok = result.win;
      if (!ok) deaths[result.diedTo ?? '?'] = (deaths[result.diedTo ?? '?'] ?? 0) + 1;
      if (!ok && t === maxTries - 1) log.push(`${d.id}: FAILED x${maxTries} (lvl ${ch.level}, act ${result.act + 1})`);
      if (ok) log.push(`${d.id}: won try ${t + 1} lvl ${ch.level}`);
    }
    if (!ok) break;
  }
  return { log, runs, level: ch.level, deaths };
}
