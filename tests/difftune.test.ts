// Fits Heroic and Mythic strength (DIFF_TUNE) so heroes who progressed through Normal win ~20% / ~10%.
import { describe, it } from 'vitest';
import { progressionSnapshots, progressedRates } from './difficulty';
import { DIFF_TUNE, applyDiffTune } from '../src/data/difficulty';

const pct = (x: number) => `${Math.round(x * 100)}%`;
const table = (r: ReturnType<typeof progressedRates>) =>
  Object.entries(r.byDungeon).map(([k, [w, n]]) => `${k}:${pct(w / n)}`).join(' ') + '\n  ' +
  Object.entries(r.bySpec).map(([k, [w, n]]) => `${k}:${pct(w / n)}`).join(' ');

describe.skipIf(!process.env.DIFFTUNE)('Heroic/Mythic tuner', () => {
  it('tunes', () => {
    const seeds = Number(process.env.SEEDS ?? 3);
    const snaps = progressionSnapshots();
    console.log(`snapshots: ${snaps.length}`);
    const fit = (key: 'heroic' | 'mythic', rank: number, target: number) => {
      if (process.env.REPORT) return;
      let lo = 1, hi = 4;
      for (let i = 0; i < 9; i++) {
        DIFF_TUNE[key] = (lo + hi) / 2; applyDiffTune();
        const r = progressedRates(snaps, rank, seeds);
        if (r.rate > target) lo = DIFF_TUNE[key]; else hi = DIFF_TUNE[key];
      }
      DIFF_TUNE[key] = +((lo + hi) / 2).toFixed(2); applyDiffTune();
    };
    fit('heroic', 1, 0.2);
    fit('mythic', 2, 0.1);
    console.log(`DIFF_TUNE = { heroic: ${DIFF_TUNE.heroic}, mythic: ${DIFF_TUNE.mythic} }`);
    for (const [name, rank] of [['Normal', 0], ['Heroic', 1], ['Mythic', 2]] as const) {
      const r = progressedRates(snaps, rank, seeds * 2, 50);
      console.log(`${name} (fresh seeds, ${r.runs} runs): ${pct(r.rate)}\n  ${table(r)}`);
    }
  });
});
