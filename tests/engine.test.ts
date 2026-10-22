import { describe, it, expect } from 'vitest';
import { ALL_CARDS, getCard } from '../src/data/cards';
import { DUNGEONS, allEnemyIds, getEnemyDef } from '../src/data/dungeons';
import { CLASSES, starterDeck } from '../src/data/classes';
import { RACES } from '../src/data/races';
import { TALENTS } from '../src/data/talents';
import { NAMED, ALL_SET_TEMPLATES, makeItem } from '../src/data/items';
import { describeCard } from '../src/engine/describe';
import { Combat } from '../src/engine/combat';
import { Rng } from '../src/engine/rng';
import { simRun, makeChar, CLASS_RACE, autoTalents, botCombat, finishRun, keepCandidates } from './sim';
import type { ClassId } from '../src/engine/types';

describe('data integrity', () => {
  it('every card has text', () => {
    for (const c of ALL_CARDS) {
      for (const up of [false, true]) {
        const d = describeCard(c, up);
        expect(d.text.length, c.id).toBeGreaterThan(0);
      }
    }
  });
  it('talent cards exist', () => {
    for (const t of TALENTS) if (t.card) expect(getCard(t.card).talent, t.id).toBe(t.id);
    for (const c of ALL_CARDS) if (c.talent) expect(TALENTS.some(t => t.id === c.talent), c.id).toBe(true);
  });
  it('every class has 3 trees x 6 talents', () => {
    for (const cls of CLASSES) for (const tr of cls.trees) expect(TALENTS.filter(t => t.cls === cls.id && t.tree === tr.id).length, cls.id + tr.id).toBe(6);
  });
  it('dungeon encounters reference real enemies', () => {
    for (const d of DUNGEONS) for (const a of d.acts) for (const g of [...a.easy, ...a.normal, ...a.elites, a.boss]) for (const id of g) expect(() => getEnemyDef(id)).not.toThrow();
  });
  it('starter decks resolve for all class/spec/race', () => {
    for (const c of CLASSES) for (const t of c.trees) for (const r of RACES.filter(r => r.classes.includes(c.id))) for (const id of starterDeck(c.id, t.id, r.id)) expect(() => getCard(id)).not.toThrow();
  });
  it('items build', () => {
    for (const list of [...Object.values(NAMED), ALL_SET_TEMPLATES]) for (const t of list) expect(makeItem(t, 1).name.length).toBeGreaterThan(0);
  });
});

describe('every card is playable in combat', () => {
  it('plays each card without throwing', () => {
    const cards = ALL_CARDS.filter(c => c.cost >= 0 && !(c.kw ?? []).includes('unplayable'));
    for (const up of [false, true]) for (const def of cards) {
      const cls = (['neutral', 'token', 'curse'].includes(def.cls) ? 'warrior' : def.cls) as ClassId;
      const c = new Combat({ cls, name: 't', deck: [{ uid: 1, id: def.id, up }], hp: 60, maxHp: 60, ap: 1, sp: 1, physCrit: 5, spellCrit: 5, startBlock: 0,
        passives: [], pet: cls === 'hunter' ? { id: 'wolf', name: 'Wolf', dmg: 3, icon: '' } : null, enemies: ['rfc_trogg', 'rfc_trogg'], hpScale: 3, dmgScale: 1, seed: 7 });
      c.start();
      c.p.res = 9; c.p.cp = 3; c.p.shards = 3; c.p.seal = 'righteousness'; c.p.st.stealth = 1;
      if (def.form) c.p.form = def.form;
      const i = c.hand.findIndex(h => h.id === def.id);
      expect(i, def.id).toBeGreaterThanOrEqual(0);
      expect(c.canPlay(c.hand[i]).ok, def.id + ' ' + c.canPlay(c.hand[i]).why).toBe(true);
      expect(() => c.playCard(i, c.alive()[0].uid), def.id).not.toThrow();
      expect(() => c.endTurn(), def.id).not.toThrow();
    }
  });
  it('every enemy can act', () => {
    for (const id of allEnemyIds()) {
      const c = new Combat({ cls: 'warrior', name: 't', deck: [{ uid: 1, id: 'w_parry', up: false }], hp: 500, maxHp: 500, ap: 0, sp: 0, physCrit: 0, spellCrit: 0, startBlock: 0,
        passives: [], pet: null, enemies: [id], hpScale: 1, dmgScale: 1, seed: 3 });
      c.start();
      for (let t = 0; t < 8 && !c.over; t++) {
        expect(() => c.endTurn(), id).not.toThrow();
        for (const e of c.alive()) { e.hp = Math.max(1, e.hp - Math.floor(e.maxHp * 0.12)); c.checkPhase(e); }
      }
    }
  });
});

describe('full run simulation', () => {
  const classes = CLASSES.map(c => c.id);
  it('every class can play Ragefire Chasm end to end', () => {
    const report: string[] = [];
    for (const cls of classes) {
      for (const tree of CLASSES.find(c => c.id === cls)!.trees) {
        let wins = 0;
        for (let s = 1; s <= 4; s++) {
          const ch = makeChar(cls, CLASS_RACE[cls], tree.id, 1);
          const { result, run } = simRun(ch, 'rfc', s * 101 + cls.length);
          expect(result.error, `${cls}/${tree.id}`).toBeUndefined();
          if (result.win) wins++;
          const sum = finishRun(ch, run, keepCandidates(run).slice(0, 1).map(i => i.uid));
          expect(sum.xp).toBeGreaterThan(0);
        }
        report.push(`${cls}/${tree.id}: ${wins}/4`);
      }
    }
    console.log('RFC win rates (greedy bot):\n' + report.join('\n'));
  });

  it('raids run end to end at level 60 with talents', () => {
    const report: string[] = [];
    for (const cls of classes) {
      const tree = CLASSES.find(c => c.id === cls)!.trees[0].id;
      for (const d of ['ony', 'mc', 'bwl']) {
        const ch = makeChar(cls, CLASS_RACE[cls], tree, 60);
        autoTalents(ch);
        const { result } = simRun(ch, d, 77 + cls.length);
        expect(result.error, `${cls}/${d}`).toBeUndefined();
        report.push(`${cls} ${d}: ${result.win ? 'WIN' : 'loss'} act ${result.act + 1} floors ${result.floors}`);
      }
    }
    console.log(report.join('\n'));
  });

  it('mid dungeons run', () => {
    for (const d of DUNGEONS.filter(x => x.kind === 'dungeon')) {
      const ch = makeChar('mage', 'gnome', 'frost', Math.min(60, d.tier * 7));
      autoTalents(ch);
      const { result } = simRun(ch, d.id, 5 + d.tier);
      expect(result.error, d.id).toBeUndefined();
    }
  });
});

describe('combat basics', () => {
  it('block absorbs damage and vuln amplifies', () => {
    const c = new Combat({ cls: 'warrior', name: 't', deck: Array.from({ length: 10 }, (_, i) => ({ uid: i, id: 'w_parry', up: false })), hp: 50, maxHp: 50, ap: 0, sp: 0, physCrit: 0, spellCrit: 0, startBlock: 0,
      passives: [], pet: null, enemies: ['rfc_trogg'], hpScale: 1, dmgScale: 1, seed: 1 });
    c.start();
    const e = c.alive()[0];
    c.p.block = 3;
    c.enemyHit(e, 6);
    expect(c.p.hp).toBe(47);
    c.p.st.vuln = 1;
    c.enemyHit(e, 6);
    expect(c.p.hp).toBe(38);
  });
  it('rage is bounded: starts at 0, fades at end of turn, hit rage capped', () => {
    const c = new Combat({ cls: 'warrior', name: 't', deck: Array.from({ length: 10 }, (_, i) => ({ uid: i, id: 'w_parry', up: false })), hp: 500, maxHp: 500, ap: 0, sp: 0, physCrit: 0, spellCrit: 0, startBlock: 0,
      passives: [], pet: null, enemies: ['rfc_trogg'], hpScale: 1, dmgScale: 1, seed: 1 });
    c.start();
    expect(c.p.res).toBe(3);
    c.gainRes(20);
    expect(c.p.res).toBe(c.rageCap());
    c.endPlayerTurn();
    const e = c.alive()[0];
    for (let i = 0; i < 5; i++) c.enemyHit(e, 5);
    expect(c.p.res).toBeLessThanOrEqual(4);
  });
  it('bot combat terminates', () => {
    const ch = makeChar('rogue', 'undead', 'combat', 1);
    void ch;
    const c = new Combat({ cls: 'rogue', name: 't', deck: ['r_sinister', 'r_sinister', 'r_eviscerate', 'r_feint', 'r_feint'].map((id, i) => ({ uid: i, id, up: false })), hp: 50, maxHp: 50, ap: 0, sp: 0, physCrit: 5, spellCrit: 5, startBlock: 0,
      passives: [], pet: null, enemies: ['rfc_trogg'], hpScale: 1, dmgScale: 1, seed: 1 });
    botCombat(c, new Rng(1));
    expect(c.over).not.toBeNull();
  });
});

import { CARD_ICONS, TALENT_ICONS } from '../src/ui/wowart';
describe('wow art mapping', () => {
  it('every card and talent has a WoW icon name', () => {
    expect(ALL_CARDS.filter(c => !CARD_ICONS[c.id]).map(c => c.id)).toEqual([]);
    expect(Object.keys(CARD_ICONS).filter(id => !ALL_CARDS.some(c => c.id === id))).toEqual([]);
    expect(TALENTS.filter(t => !t.card && !TALENT_ICONS[t.name]).map(t => t.name)).toEqual([]);
  });
});
