// Auto-tuner: binary-search each tier's difficulty multiplier toward a target bot win rate.
import { describe, it } from 'vitest';
import { difficulty } from './difficulty';
import { DUNGEONS, TIER_TUNE } from '../src/data/dungeons';

describe.skipIf(!process.env.TUNE)('difficulty tuner', () => {
  it('tunes', () => {
    const seeds = Number(process.env.SEEDS ?? 8);
    const out: string[] = [];
    for (const d of DUNGEONS) {
      const target = d.kind === 'raid' ? 0.42 : 0.5;
      let lo = 0.4, hi = 3;
      let best = TIER_TUNE[d.tier - 1], bestErr = 1, bestRate = 0;
      for (let i = 0; i < 9; i++) {
        const k = (lo + hi) / 2;
        TIER_TUNE[d.tier - 1] = k;
        const rows = difficulty(seeds, [d.id]);
        const rate = rows.reduce((s, r) => s + r.wins, 0) / rows.reduce((s, r) => s + r.runs, 0);
        if (Math.abs(rate - target) < bestErr) { bestErr = Math.abs(rate - target); best = k; bestRate = rate; }
        if (rate > target) lo = k; else hi = k;
      }
      TIER_TUNE[d.tier - 1] = best;
      out.push(`${d.id}: k=${best.toFixed(3)} rate=${Math.round(bestRate * 100)}%`);
    }
    console.log(out.join('\n'));
    console.log('TIER_TUNE = [' + TIER_TUNE.map(k => +k.toFixed(2)).join(', ') + ']');
  });
});
