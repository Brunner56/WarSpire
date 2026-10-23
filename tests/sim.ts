// Headless bot used by tests to play whole runs.
import { Combat } from '../src/engine/combat';
import { getCard, cardActions } from '../src/data/cards';
import { EVENTS } from '../src/data/events';
import type { Character } from '../src/engine/character';
import { newProfile, createCharacter } from '../src/engine/save';
import {
  RunState, newRun, enterNode, reachable, makeCombat, resolveCombat, takeRewardCard, takeRewardItem, takeRewardPotion, finishReward,
  restHeal, upgradeCard, maxHpOf, chooseEvent, eventFollowUp, nextAct, removeCard, duplicateCard, leaveNode, finishRun, itemScore, gearList, keepCandidates,
} from '../src/engine/run';
import { canEquip } from '../src/engine/loot';
import { Rng } from '../src/engine/rng';
import type { ClassId, RaceId } from '../src/engine/types';
import { CLASS_BY_ID } from '../src/data/classes';
import { TALENTS, TIER_REQ, talentPointsForLevel } from '../src/data/talents';
import { talentPointsSpent } from '../src/engine/character';

export function botCombat(c: Combat, rng: Rng, maxTurns = 80) {
  c.start();
  let turns = 0;
  while (!c.over && turns < maxTurns) {
    botPotions(c);
    let guard = 0;
    while (!c.over && guard++ < 40) {
      const playable = c.hand.map((ci, i) => ({ ci, i })).filter(x => c.canPlay(x.ci).ok);
      if (!playable.length) break;
      const incoming = c.alive().reduce((s, e) => s + (e.move ? e.move.acts.filter(a => a.k === 'atk').reduce((t, a: any) => t + c.enemyHitDamage(e, a.n) * (a.hits ?? 1), 0) : 0), 0);
      const formCards = (f: string) => c.hand.filter(ci => getCard(ci.id).form === f).length;
      const scored = playable.map(x => {
        const def = getCard(x.ci.id);
        const acts = cardActions(def, x.ci.up);
        let s = 1;
        if (def.type === 'aura') s += 8;
        if (acts.some(a => a.k === 'block' || a.k === 'absorb')) s += incoming > c.p.block ? 6 : -2;
        if (acts.some(a => a.k === 'dmg')) s += 5;
        if (acts.some(a => a.k === 'apply' && ['bleed', 'poison', 'burn', 'affliction', 'siphon', 'doom'].includes((a as any).s))) s += 5;
        if (acts.some(a => a.k === 'apply' && ['weak', 'vuln', 'stun', 'poly', 'chill', 'mark', 'firevuln'].includes((a as any).s))) s += 2;
        if (def.kw?.includes('opener') && c.p.st.stealth) s += 6;
        if (acts.some(a => a.k === 'seal' || a.k === 'totem' || a.k === 'pet')) s += 7;
        for (const a of acts) {
          if (a.k === 'seal' && c.p.seal === a.id) s -= 12;
          if (a.k === 'totem' && Object.values(c.p.totems).includes(a.id)) s -= 12;
          if (a.k === 'form') s += a.id === c.p.form ? -20 : 1 + 4 * formCards(a.id);
        }
        // spells knock you out of Cat/Bear Form: avoid them while holding form cards
        if (def.kw?.includes('caster') && (c.p.form === 'cat' || c.p.form === 'bear')) s -= 4 * formCards(c.p.form);
        if (acts.some(a => a.k === 'heal')) s += c.p.hp < c.p.maxHp * 0.6 ? 5 : -3;
        if (def.kw?.includes('finisher')) s += c.p.cp >= 4 ? 8 : -5;
        s += rng.next();
        return { ...x, s };
      }).sort((a, b) => b.s - a.s);
      const pick = scored[0];
      const target = c.alive().sort((a, b) => a.hp - b.hp)[0];
      if (!c.playCard(pick.i, target?.uid)) break;
    }
    if (c.over) break;
    c.endTurn();
    turns++;
  }
  if (!c.over) { c.p.hp = 0; c.over = 'lose'; }
}

const DEFENSIVE = new Set(['po_heal', 'po_stone', 'po_fire', 'po_lip', 'po_free']);
/** Drink defensive potions when low, offensive ones at the start of boss fights. */
function botPotions(c: Combat) {
  const low = c.p.hp < c.p.maxHp * 0.4;
  const boss = c.turn === 1 && c.alive().some(e => e.def.boss);
  c.potions.forEach((id, i) => {
    if (!id || c.over) return;
    if (DEFENSIVE.has(id) ? low : boss) c.usePotion(i, c.alive().sort((a, b) => b.hp - a.hp)[0]?.uid);
  });
}

export function autoTalents(ch: Character) {
  let guard = 0;
  while (talentPointsForLevel(ch.level) - talentPointsSpent(ch) > 0 && guard++ < 100) {
    const cands = TALENTS.filter(t => t.cls === ch.cls && (ch.talents[t.id] ?? 0) < t.max && talentPointsSpent(ch, t.tree) >= TIER_REQ[t.tier])
      .sort((a, b) => (a.tree === ch.spec ? 0 : 1) - (b.tree === ch.spec ? 0 : 1) || b.tier - a.tier);
    if (!cands.length) break;
    ch.talents[cands[0].id] = (ch.talents[cands[0].id] ?? 0) + 1;
  }
}

export interface SimResult { diedTo?: string; win: boolean; floors: number; act: number; hp: number; error?: string; deck: number; kills: RunState['kills'] }

export function simRun(ch: Character, dungeonId: string, seed: number, rank = 0): { result: SimResult; run: RunState } {
  const rng = new Rng(seed);
  const run = newRun(ch, dungeonId, rank, 1000, seed);
  let floors = 0;
  let guard = 0;
  while (guard++ < 400) {
    const p = run.pending;
    if (!p) {
      const opts = reachable(run);
      if (!opts.length) break;
      enterNode(run, ch, rng.pick(opts));
      floors++;
      continue;
    }
    switch (p.kind) {
      case 'combat': {
        const c = makeCombat(run, ch);
        botCombat(c, rng);
        if (c.over !== 'win') (run as any).diedTo = p.enemies.join('+');
        resolveCombat(run, ch, c);
        break;
      }
      case 'reward': {
        if (p.cards && p.cards.length) takeRewardCard(run, 0);
        for (const it of [...p.items]) {
          const cur = run.gear[it.slot];
          const better = canEquip(ch.cls, it) && (!cur || itemScore(ch.cls, it) > itemScore(ch.cls, cur));
          takeRewardItem(run, ch, it.uid, better ? 'equip' : 'sell');
          if (p.boss) break;
        }
        if (p.potion) takeRewardPotion(run);
        finishReward(run, ch);
        break;
      }
      case 'rest': {
        const up = run.deck.find(c => !c.up && getCard(c.id).cls === ch.cls);
        if (run.hp < 0.65 * maxHpOf(run, ch) || !up) restHeal(run, ch); else upgradeCard(run, up.uid);
        leaveNode(run);
        break;
      }
      case 'shop': leaveNode(run); break;
      case 'event': {
        const ev = EVENTS.find(e => e.id === p.id)!;
        let res = null;
        for (let i = 0; i < ev.choices.length && !res; i++) res = chooseEvent(run, ch, i);
        if (res?.pick === 'remove') removeCard(run, run.deck[0].uid);
        if (res?.pick === 'upgrade') { const c = run.deck.find(x => !x.up); if (c) upgradeCard(run, c.uid); }
        if (res?.pick === 'duplicate') duplicateCard(run, run.deck[run.deck.length - 1].uid);
        eventFollowUp(run);
        break;
      }
      case 'actEnd': nextAct(run, ch); break;
      case 'end':
        return { result: { diedTo: (run as any).diedTo, win: p.win, floors, act: run.act, hp: run.hp, deck: run.deck.length, kills: run.kills }, run };
    }
  }
  return { result: { win: false, floors, act: run.act, hp: run.hp, error: 'guard', deck: run.deck.length, kills: run.kills }, run };
}

export function makeChar(cls: ClassId, race: RaceId, spec: string, level = 1): Character {
  const prof = newProfile();
  const ch = createCharacter(prof, { name: 'Bot', race, cls, spec, look: { skin: 0, hair: 0, hairColor: 0, face: 0 }, pet: 'wolf' });
  ch.level = level;
  return ch;
}

export const CLASS_RACE: Record<ClassId, RaceId> = {
  warrior: 'orc', paladin: 'human', hunter: 'nightelf', rogue: 'undead', priest: 'dwarf', shaman: 'tauren', mage: 'gnome', warlock: 'human', druid: 'tauren',
};

export { finishRun, keepCandidates, gearList, CLASS_BY_ID };
