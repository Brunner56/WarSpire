import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, app, self, draw, res, lose, heal, fn, per } from './helpers';

type D = Omit<CardDef, 'cls'>;
const W = (d: D): CardDef => ({ ...d, cls: 'warrior' });

export const WARRIOR_CARDS: CardDef[] = [
  W({ id: 'w_heroic', name: 'Heroic Strike', type: 'attack', rarity: 'starter', cost: 1, a: [dmg(6)], icon: '⚔️' }),
  W({ id: 'w_parry', name: 'Parry', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🛡️' }),
  W({ id: 'w_charge', name: 'Charge', type: 'attack', rarity: 'starter', cost: 0, a: [dmg(4), res(2)], u: [dmg(6), res(3)], kw: ['innate', 'cooldown'], icon: '🐂' }),
  // Arms
  W({ id: 'w_rend', name: 'Rend', tree: 'arms', type: 'attack', rarity: 'common', cost: 1, a: [dmg(3), app('bleed', 4)], u: [dmg(4), app('bleed', 6)], icon: '🩸' }),
  W({ id: 'w_overpower', name: 'Overpower', tree: 'arms', type: 'attack', rarity: 'common', cost: 0, a: [dmg(4), draw(1)], u: [dmg(7), draw(1)], icon: '⚡' }),
  W({ id: 'w_hamstring', name: 'Hamstring', tree: 'arms', type: 'attack', rarity: 'common', cost: 1, a: [dmg(5), app('weak', 2)], icon: '🦵' }),
  W({ id: 'w_slam', name: 'Slam', tree: 'arms', type: 'attack', rarity: 'common', cost: 2, a: [dmg(14)], lvl: 4, icon: '🔨' }),
  W({ id: 'w_sweeping', name: 'Sweeping Strikes', tree: 'arms', type: 'skill', rarity: 'uncommon', cost: 1, a: [self('sweep', 3)], u: [self('sweep', 5)], lvl: 14, icon: '🌀' }),
  W({ id: 'w_execute', name: 'Execute', tree: 'arms', type: 'attack', rarity: 'uncommon', cost: 1, lvl: 20, tgt: true,
    text: 'Spend ALL remaining Rage. Deal 6 damage +3 per Rage spent. Double damage if the target is below 25% HP.',
    a: [fn('execute', (c, ctx, up) => {
      const r = c.p.res; c.p.res = 0;
      const t = ctx.target; if (!t) return;
      let base = (up ? 9 : 6) + r * 3;
      if (t.hp / t.maxHp < 0.25) base *= 2;
      const d = c.calcCardHit(ctx.def, base, 'physical', t, false); c.hit(d);
    })], icon: '🪓' }),
  W({ id: 'w_mortal', name: 'Mortal Strike', tree: 'arms', type: 'attack', rarity: 'rare', cost: 2, talent: 'w_arms_cap', a: [dmg(16), app('weak', 2)], u: [dmg(22), app('weak', 3)], icon: '💀' }),
  W({ id: 'w_retaliation', name: 'Retaliation', tree: 'arms', type: 'skill', rarity: 'rare', cost: 1, lvl: 36, a: [blk(8), self('thorns', 4)], kw: ['cooldown'], icon: '🔁' }),
  W({ id: 'w_battle_shout', name: 'Battle Shout', tree: 'arms', type: 'aura', rarity: 'uncommon', cost: 1, a: [self('str', 2)], u: [self('str', 3)], lvl: 8, icon: '📯' }),
  // Fury
  W({ id: 'w_cleave', name: 'Cleave', tree: 'fury', type: 'attack', rarity: 'common', cost: 1, a: [aoe(7)], icon: '🪓' }),
  W({ id: 'w_bloodrage', name: 'Bloodrage', tree: 'fury', type: 'skill', rarity: 'common', cost: 0, a: [lose(3), res(2), draw(1)], u: [lose(2), res(3), draw(1)], icon: '🩸' }),
  W({ id: 'w_berserker', name: 'Berserker Rage', tree: 'fury', type: 'skill', rarity: 'common', cost: 0, a: [res(3)], u: [res(4)], kw: ['cooldown'], icon: '😤' }),
  W({ id: 'w_whirlwind', name: 'Whirlwind', tree: 'fury', type: 'attack', rarity: 'uncommon', cost: 2, lvl: 18, a: [aoe(5, { hits: 2 })], u: [aoe(7, { hits: 2 })], icon: '🌪️' }),
  W({ id: 'w_intercept', name: 'Intercept', tree: 'fury', type: 'attack', rarity: 'uncommon', cost: 1, lvl: 12, a: [dmg(5), app('stun', 1)], kw: ['cooldown'], icon: '💥' }),
  W({ id: 'w_bloodthirst', name: 'Bloodthirst', tree: 'fury', type: 'attack', rarity: 'rare', cost: 1, talent: 'w_fury_cap', a: [dmg(10, { ls: 0.5 })], u: [dmg(14, { ls: 0.5 })], icon: '🩸' }),
  W({ id: 'w_recklessness', name: 'Recklessness', tree: 'fury', type: 'skill', rarity: 'rare', cost: 1, lvl: 34, a: [self('critnext', 3), self('vuln', 2)], u: [self('critnext', 4), self('vuln', 1)], kw: ['cooldown'], icon: '😈' }),
  W({ id: 'w_deathwish', name: 'Death Wish', tree: 'fury', type: 'aura', rarity: 'rare', cost: 2, uc: 1, lvl: 40, a: [self('deathwish', 1)], icon: '☠️' }),
  W({ id: 'w_rampage', name: 'Raging Blow', tree: 'fury', type: 'attack', rarity: 'common', cost: 1, lvl: 6, text: 'Deal 4 damage twice. Gain 1 Rage.',
    a: [dmg(4, { hits: 2 }), res(1)], u: [dmg(6, { hits: 2 }), res(1)], icon: '👊' }),
  // Protection
  W({ id: 'w_sunder', name: 'Sunder Armor', tree: 'prot', type: 'attack', rarity: 'common', cost: 1, a: [dmg(5), app('vuln', 2)], icon: '🔩' }),
  W({ id: 'w_shield_block', name: 'Shield Block', tree: 'prot', type: 'skill', rarity: 'common', cost: 1, a: [blk(8)], u: [blk(11)], icon: '🛡️' }),
  W({ id: 'w_revenge', name: 'Revenge', tree: 'prot', type: 'attack', rarity: 'common', cost: 1, a: [dmg(6), blk(4)], u: [dmg(8), blk(6)], icon: '↩️' }),
  W({ id: 'w_thunder', name: 'Thunder Clap', tree: 'prot', type: 'attack', rarity: 'common', cost: 1, a: [aoe(4), app('weak', 1, 'all')], u: [aoe(6), app('weak', 2, 'all')], icon: '⚡' }),
  W({ id: 'w_demo_shout', name: 'Demoralizing Shout', tree: 'prot', type: 'skill', rarity: 'common', cost: 1, a: [app('weak', 2, 'all')], u: [app('weak', 3, 'all')], lvl: 6, icon: '📣' }),
  W({ id: 'w_def_stance', name: 'Defensive Stance', tree: 'prot', type: 'aura', rarity: 'uncommon', cost: 1, a: [self('fortify', 3)], u: [self('fortify', 4)], lvl: 10, icon: '🏰' }),
  W({ id: 'w_last_stand', name: 'Last Stand', tree: 'prot', type: 'skill', rarity: 'uncommon', cost: 1, a: [heal(14)], u: [heal(20)], kw: ['cooldown'], lvl: 16, icon: '❤️‍🩹' }),
  W({ id: 'w_concussion', name: 'Concussion Blow', tree: 'prot', type: 'attack', rarity: 'uncommon', cost: 2, a: [dmg(8), app('stun', 1)], u: [dmg(12), app('stun', 1)], kw: ['cooldown'], lvl: 22, icon: '🔨' }),
  W({ id: 'w_shield_wall', name: 'Shield Wall', tree: 'prot', type: 'skill', rarity: 'rare', cost: 2, a: [blk(25)], u: [blk(34)], kw: ['cooldown'], lvl: 30, icon: '🧱' }),
  W({ id: 'w_shield_slam', name: 'Shield Slam', tree: 'prot', type: 'attack', rarity: 'rare', cost: 1, talent: 'w_prot_cap', a: [dmg(4, { x: per('block', 1) })], u: [dmg(8, { x: per('block', 1) })], text: 'Deal 4 damage plus damage equal to your Block.', icon: '🛡️' }),
  W({ id: 'w_taunt', name: 'Mocking Blow', tree: 'prot', type: 'attack', rarity: 'common', cost: 0, a: [dmg(3), app('weak', 1)], u: [dmg(5), app('weak', 2)], icon: '😜' }),
];
