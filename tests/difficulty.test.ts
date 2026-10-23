import { describe, it } from 'vitest';
import { difficulty } from './difficulty';

describe.skipIf(!process.env.DIFF)('difficulty report (fresh heroes, Normal)', () => {
  it('runs', () => {
    const seeds = Number(process.env.SEEDS ?? 10);
    const only = process.env.DUNGEONS?.split(',');
    const rows = difficulty(seeds, only, (process.env.GEAR as 'none' | 'low' | 'mix') ?? 'mix');
    const pct = (w: number, r: number) => `${Math.round((100 * w) / Math.max(1, r))}%`.padStart(4);
    const byD: Record<string, [number, number]> = {}, byC: Record<string, [number, number]> = {}, deaths: Record<string, number> = {};
    for (const r of rows) {
      const cls = r.spec.split('/')[0];
      (byD[r.dungeon] ??= [0, 0]); byD[r.dungeon][0] += r.wins; byD[r.dungeon][1] += r.runs;
      (byC[cls] ??= [0, 0]); byC[cls][0] += r.wins; byC[cls][1] += r.runs;
      for (const [k, v] of Object.entries(r.deaths)) deaths[`${r.dungeon}:${k}`] = (deaths[`${r.dungeon}:${k}`] ?? 0) + v;
    }
    const specs = [...new Set(rows.map(r => r.spec))];
    const ds = Object.keys(byD);
    const lines = ['spec'.padEnd(16) + ds.map(d => d.padStart(6)).join('') + '   avg'];
    for (const s of specs) {
      const mine = rows.filter(x => x.spec === s);
      lines.push(s.padEnd(16) + ds.map(d => { const r = mine.find(x => x.dungeon === d)!; return pct(r.wins, r.runs).padStart(6); }).join('')
        + pct(mine.reduce((a, r) => a + r.wins, 0), mine.reduce((a, r) => a + r.runs, 0)).padStart(6));
    }
    lines.push('ALL'.padEnd(16) + ds.map(d => pct(...byD[d]).padStart(6)).join(''));
    console.log(lines.join('\n'));
    console.log('BY CLASS ' + Object.entries(byC).map(([k, v]) => `${k}:${pct(...v)}`).join('  '));
    const tw = rows.reduce((s, r) => s + r.wins, 0), tr = rows.reduce((s, r) => s + r.runs, 0);
    console.log(`OVERALL ${pct(tw, tr)} of ${tr}`);
    console.log('TOP DEATHS ' + Object.entries(deaths).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k}:${v}`).join('  '));
  });
});
