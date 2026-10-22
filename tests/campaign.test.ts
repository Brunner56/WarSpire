import { campaign } from './campaign';
import { CLASSES } from '../src/data/classes';

describe.skipIf(!process.env.CAMPAIGN)('campaign balance report', () => {
  it('runs', () => {
    const all: Record<string, number> = {};
    for (const c of CLASSES) for (const t of c.trees.slice(0, Number(process.env.TREES ?? 1))) {
      const r = campaign(c.id, t.id, 1000 + c.id.length * 7);
      console.log(`${c.id}/${t.id} runs=${r.runs} lvl=${r.level}\n  ` + r.log.join('\n  '));
      for (const [k, v] of Object.entries(r.deaths)) all[k] = (all[k] ?? 0) + v;
    }
    console.log('DEATHS', Object.entries(all).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => `${k}:${v}`).join('  '));
  });
});
