import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, app, self, draw, petAtk, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const H = (d: D): CardDef => ({ ...d, cls: 'hunter' });

export const HUNTER_CARDS: CardDef[] = [
  H({ id: 'h_auto', name: 'Auto Shot', type: 'attack', rarity: 'starter', cost: 1, a: [dmg(6)], icon: '🏹' }),
  H({ id: 'h_disengage', name: 'Disengage', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '💨' }),
  H({ id: 'h_mark', name: "Hunter's Mark", type: 'skill', rarity: 'starter', cost: 0, a: [app('mark', 2)], u: [app('mark', 3)], icon: '🎯' }),
  // Beast Mastery
  H({ id: 'h_kill_cmd', name: 'Kill Command', tree: 'bm', type: 'attack', rarity: 'common', cost: 1, a: [petAtk(3)], u: [petAtk(6)], text: 'Your pet attacks the target for +3 damage.', icon: '🐺' }),
  H({ id: 'h_mend_pet', name: 'Mend Pet', tree: 'bm', type: 'skill', rarity: 'common', cost: 1, a: [self('petpow', 2), blk(4)], u: [self('petpow', 3), blk(6)], icon: '💚' }),
  H({ id: 'h_intimidation', name: 'Intimidation', tree: 'bm', type: 'attack', rarity: 'uncommon', cost: 1, lvl: 14, a: [petAtk(2), app('stun', 1)], kw: ['cooldown'], icon: '😾' }),
  H({ id: 'h_bestial', name: 'Bestial Wrath', tree: 'bm', type: 'skill', rarity: 'rare', cost: 1, talent: 'h_bm_cap', a: [self('petpow', 5), petAtk(4)], u: [self('petpow', 7), petAtk(6)], kw: ['cooldown'], icon: '👹' }),
  H({ id: 'h_spirit_bond', name: 'Spirit Bond', tree: 'bm', type: 'aura', rarity: 'uncommon', cost: 1, lvl: 18, a: [self('regen', 3), self('petpow', 1)], u: [self('regen', 4), self('petpow', 2)], icon: '🤝' }),
  H({ id: 'h_feed_pet', name: 'Feed Pet', tree: 'bm', type: 'skill', rarity: 'common', cost: 0, a: [self('petpow', 1), draw(1)], u: [self('petpow', 2), draw(1)], lvl: 4, icon: '🍖' }),
  H({ id: 'h_aspect_beast', name: 'Aspect of the Beast', tree: 'bm', type: 'aura', rarity: 'rare', cost: 2, uc: 1, lvl: 38, a: [self('petpow', 4)], icon: '🐻' }),
  // Marksmanship
  H({ id: 'h_arcane', name: 'Arcane Shot', tree: 'mm', type: 'attack', rarity: 'common', cost: 1, school: 'arcane', scale: 'ap', a: [dmg(8)], u: [dmg(11)], icon: '💫' }),
  H({ id: 'h_multi', name: 'Multi-Shot', tree: 'mm', type: 'attack', rarity: 'common', cost: 2, a: [aoe(7)], u: [aoe(10)], icon: '🎆' }),
  H({ id: 'h_concussive', name: 'Concussive Shot', tree: 'mm', type: 'attack', rarity: 'common', cost: 1, a: [dmg(4), app('weak', 2)], u: [dmg(6), app('weak', 3)], icon: '💢' }),
  H({ id: 'h_hawk', name: 'Aspect of the Hawk', tree: 'mm', type: 'aura', rarity: 'common', cost: 1, a: [self('str', 2)], u: [self('str', 3)], lvl: 6, icon: '🦅' }),
  H({ id: 'h_rapid', name: 'Rapid Fire', tree: 'mm', type: 'skill', rarity: 'uncommon', cost: 1, uc: 0, lvl: 22, a: [self('rapid', 1), draw(2)], kw: ['cooldown'], text: 'This turn your Attacks cost 1 less. Draw 2 cards.', icon: '🏹' }),
  H({ id: 'h_aimed', name: 'Aimed Shot', tree: 'mm', type: 'attack', rarity: 'uncommon', cost: 2, lvl: 16, a: [dmg(18)], u: [dmg(25)], icon: '🎯' }),
  H({ id: 'h_volley', name: 'Volley', tree: 'mm', type: 'attack', rarity: 'rare', cost: 2, lvl: 36, a: [aoe(3, { hits: 3 })], u: [aoe(4, { hits: 3 })], icon: '🌧️' }),
  H({ id: 'h_trueshot', name: 'Trueshot Aura', tree: 'mm', type: 'aura', rarity: 'rare', cost: 1, talent: 'h_mm_cap', a: [self('trueshot', 3)], u: [self('trueshot', 4)], icon: '🏹' }),
  // Survival
  H({ id: 'h_serpent', name: 'Serpent Sting', tree: 'sv', type: 'attack', rarity: 'common', cost: 1, a: [dmg(2), app('poison', 4)], u: [dmg(3), app('poison', 6)], icon: '🐍' }),
  H({ id: 'h_raptor', name: 'Raptor Strike', tree: 'sv', type: 'attack', rarity: 'common', cost: 1, a: [dmg(6), blk(3)], u: [dmg(9), blk(4)], icon: '🦖' }),
  H({ id: 'h_wingclip', name: 'Wing Clip', tree: 'sv', type: 'attack', rarity: 'common', cost: 0, a: [dmg(2), app('weak', 1)], u: [dmg(4), app('weak', 2)], icon: '🪶' }),
  H({ id: 'h_freeze_trap', name: 'Freezing Trap', tree: 'sv', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 12, a: [self('trapFreeze', 1), blk(4)], u: [self('trapFreeze', 1), blk(8)], text: 'Set a trap: the next enemy to attack you is Stunned. Gain 4 Block.', icon: '🧊' }),
  H({ id: 'h_immo_trap', name: 'Immolation Trap', tree: 'sv', type: 'skill', rarity: 'common', cost: 1, lvl: 8, a: [self('trapImmo', 8), blk(3)], u: [self('trapImmo', 12), blk(4)], text: 'Set a trap: the next enemy to attack you gains 8 Burning. Gain 3 Block.', icon: '🔥' }),
  H({ id: 'h_explosive', name: 'Explosive Trap', tree: 'sv', type: 'skill', rarity: 'uncommon', cost: 1, school: 'fire', scale: 'ap', lvl: 26, a: [aoe(5, { school: 'fire' }), app('burn', 3, 'all')], u: [aoe(7, { school: 'fire' }), app('burn', 5, 'all')], icon: '💣' }),
  H({ id: 'h_deterrence', name: 'Deterrence', tree: 'sv', type: 'skill', rarity: 'rare', cost: 1, lvl: 30, a: [self('dodge', 3)], u: [self('dodge', 4)], kw: ['cooldown'], icon: '🌪️' }),
  H({ id: 'h_wyvern', name: 'Wyvern Sting', tree: 'sv', type: 'attack', rarity: 'rare', cost: 1, talent: 'h_sv_cap', a: [app('poly', 1), app('poison', 8)], u: [app('poly', 1), app('poison', 12)], icon: '🐉' }),
  H({ id: 'h_feign', name: 'Feign Death', tree: 'sv', type: 'skill', rarity: 'uncommon', cost: 2, uc: 1, lvl: 20, a: [self('invuln', 1)], kw: ['cooldown'], icon: '💀' }),
  H({ id: 'h_mongoose', name: 'Mongoose Bite', tree: 'sv', type: 'attack', rarity: 'uncommon', cost: 0, lvl: 10, tgt: true,
    text: 'Deal 5 damage. If you have Dodge, deal double and gain 1 Dodge.',
    a: [fn('mongoose', (c, ctx, up) => {
      const t = ctx.target; if (!t) return;
      const has = (c.p.st.dodge ?? 0) > 0;
      c.hit(c.calcCardHit(ctx.def, (up ? 7 : 5) * (has ? 2 : 1), 'physical', t, false));
      if (has) c.applyStatus(c.p, 'dodge', 1, true);
    })], icon: '🦦' }),
];
