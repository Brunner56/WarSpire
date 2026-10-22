import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, absorb, app, self, draw, res, add, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const M = (d: D): CardDef => ({ ...d, cls: 'mage' });

export const MAGE_CARDS: CardDef[] = [
  M({ id: 'm_fireball', name: 'Fireball', type: 'attack', rarity: 'starter', cost: 1, school: 'fire', a: [dmg(6)], icon: '🔥' }),
  M({ id: 'm_frost_armor', name: 'Frost Armor', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🧊' }),
  M({ id: 'm_int', name: 'Arcane Intellect', type: 'skill', rarity: 'starter', cost: 0, a: [draw(2)], u: [draw(3)], kw: ['innate', 'cooldown'], icon: '📘' }),
  M({ id: 'm_poly', name: 'Polymorph', type: 'skill', rarity: 'common', cost: 1, uc: 0, school: 'arcane', a: [app('poly', 1)], lvl: 4, icon: '🐑' }),
  M({ id: 'm_blink', name: 'Blink', type: 'skill', rarity: 'common', cost: 0, a: [blk(4), draw(1)], u: [blk(6), draw(1)], icon: '✴️' }),
  M({ id: 'm_mana_gem', name: 'Conjure Mana Gem', type: 'skill', rarity: 'common', cost: 1, a: [add('t_mana_gem', 'hand', 2)], u: [add('t_mana_gem', 'hand', 3)], kw: ['cooldown'], lvl: 8, icon: '💎' }),
  // Arcane
  M({ id: 'm_missiles', name: 'Arcane Missiles', tree: 'arcane', type: 'attack', rarity: 'common', cost: 1, school: 'arcane', a: [dmg(3, { hits: 3 })], u: [dmg(4, { hits: 3 })], icon: '💫' }),
  M({ id: 'm_explosion', name: 'Arcane Explosion', tree: 'arcane', type: 'attack', rarity: 'common', cost: 1, school: 'arcane', a: [aoe(5)], u: [aoe(7)], icon: '💥' }),
  M({ id: 'm_mana_shield', name: 'Mana Shield', tree: 'arcane', type: 'skill', rarity: 'common', cost: 1, school: 'arcane', a: [absorb(8)], u: [absorb(11)], icon: '🔮' }),
  M({ id: 'm_pom', name: 'Presence of Mind', tree: 'arcane', type: 'skill', rarity: 'uncommon', cost: 0, lvl: 12, a: [self('clearcast', 1), draw(1)], u: [self('clearcast', 2), draw(1)], kw: ['cooldown'], icon: '⏳' }),
  M({ id: 'm_evocation', name: 'Evocation', tree: 'arcane', type: 'skill', rarity: 'uncommon', cost: 0, lvl: 18, a: [res(3)], u: [res(4)], kw: ['cooldown'], icon: '🌀' }),
  M({ id: 'm_counterspell', name: 'Counterspell', tree: 'arcane', type: 'skill', rarity: 'uncommon', cost: 0, lvl: 14, tgt: true,
    text: 'If the target intends to do anything other than attack, Stun it. Otherwise apply 1 Weakened.',
    a: [fn('counter', (c, ctx) => {
      const t = ctx.target; if (!t || !t.move) return;
      const k = c.intentOf(t.move);
      if (k === 'attack') c.applyStatus(t, 'weak', 1, true); else c.applyStatus(t, 'stun', 1, true);
    })], icon: '🚫' }),
  M({ id: 'm_mage_armor', name: 'Mage Armor', tree: 'arcane', type: 'aura', rarity: 'rare', cost: 2, lvl: 30, a: [self('mageArmor', 1)], u: [self('mageArmor', 1), blk(6)], icon: '🧥' }),
  M({ id: 'm_arcane_power', name: 'Arcane Power', tree: 'arcane', type: 'aura', rarity: 'rare', cost: 1, uc: 0, talent: 'm_arcane_cap', a: [self('arcanePower', 1)], icon: '🔮' }),
  // Fire
  M({ id: 'm_fire_blast', name: 'Fire Blast', tree: 'fire', type: 'attack', rarity: 'common', cost: 0, school: 'fire', a: [dmg(4)], u: [dmg(7)], icon: '💥' }),
  M({ id: 'm_scorch', name: 'Scorch', tree: 'fire', type: 'attack', rarity: 'common', cost: 1, school: 'fire', a: [dmg(5), app('firevuln', 1)], u: [dmg(7), app('firevuln', 2)], icon: '♨️' }),
  M({ id: 'm_flamestrike', name: 'Flamestrike', tree: 'fire', type: 'attack', rarity: 'uncommon', cost: 2, school: 'fire', lvl: 16, a: [aoe(7), app('burn', 4, 'all')], u: [aoe(9), app('burn', 6, 'all')], icon: '🌋' }),
  M({ id: 'm_blast_wave', name: 'Blast Wave', tree: 'fire', type: 'attack', rarity: 'uncommon', cost: 1, school: 'fire', lvl: 22, a: [aoe(6), app('weak', 1, 'all')], u: [aoe(8), app('weak', 2, 'all')], icon: '🌊' }),
  M({ id: 'm_pyro', name: 'Pyroblast', tree: 'fire', type: 'attack', rarity: 'rare', cost: 3, uc: 2, school: 'fire', lvl: 28, a: [dmg(20), app('burn', 8)], icon: '☄️' }),
  M({ id: 'm_combustion', name: 'Combustion', tree: 'fire', type: 'skill', rarity: 'rare', cost: 0, talent: 'm_fire_cap', a: [self('critnext', 3)], u: [self('critnext', 4)], kw: ['cooldown'], icon: '🔥' }),
  M({ id: 'm_fire_ward', name: 'Fire Ward', tree: 'fire', type: 'skill', rarity: 'common', cost: 1, a: [absorb(6), self('thorns', 2)], u: [absorb(9), self('thorns', 3)], lvl: 6, icon: '🛡️' }),
  // Frost
  M({ id: 'm_frostbolt', name: 'Frostbolt', tree: 'frost', type: 'attack', rarity: 'common', cost: 1, school: 'frost', a: [dmg(6), app('chill', 1)], u: [dmg(8), app('chill', 2)], icon: '❄️' }),
  M({ id: 'm_cone', name: 'Cone of Cold', tree: 'frost', type: 'attack', rarity: 'common', cost: 2, school: 'frost', a: [aoe(6), app('chill', 2, 'all')], u: [aoe(8), app('chill', 2, 'all')], icon: '🌨️' }),
  M({ id: 'm_nova', name: 'Frost Nova', tree: 'frost', type: 'skill', rarity: 'common', cost: 1, school: 'frost', a: [aoe(2), app('chill', 2, 'all')], u: [aoe(3), app('chill', 3, 'all')], lvl: 6, icon: '💠' }),
  M({ id: 'm_blizzard', name: 'Blizzard', tree: 'frost', type: 'attack', rarity: 'uncommon', cost: 2, school: 'frost', lvl: 20, a: [aoe(3, { hits: 3 }), app('chill', 1, 'all')], u: [aoe(4, { hits: 3 }), app('chill', 2, 'all')], icon: '🌨️' }),
  M({ id: 'm_ice_lance', name: 'Ice Lance', tree: 'frost', type: 'attack', rarity: 'uncommon', cost: 0, school: 'frost', lvl: 14, tgt: true,
    text: 'Deal 3 Frost damage. Triple damage if the target is Chilled or Frozen.',
    a: [fn('icelance', (c, ctx, up) => { const t = ctx.target; if (!t) return; const m = t.st.chill || t.st.stun ? 3 : 1; c.hit(c.calcCardHit(ctx.def, (up ? 5 : 3) * m, 'frost', t, false)); })], icon: '🧊' }),
  M({ id: 'm_ice_block', name: 'Ice Block', tree: 'frost', type: 'skill', rarity: 'rare', cost: 1, lvl: 30, a: [self('invuln', 1)], u: [self('invuln', 1), draw(1)], kw: ['cooldown'], icon: '🧊' }),
  M({ id: 'm_ice_barrier', name: 'Ice Barrier', tree: 'frost', type: 'skill', rarity: 'rare', cost: 1, talent: 'm_frost_cap', a: [absorb(12), self('dex', 1)], u: [absorb(16), self('dex', 2)], icon: '🧊' }),
  M({ id: 'm_cold_snap', name: 'Cold Snap', tree: 'frost', type: 'skill', rarity: 'uncommon', cost: 1, uc: 0, lvl: 26, text: 'Return all of your Cooldown cards to your discard pile.',
    a: [fn('coldsnap', (c) => { const keep = c.exhaust.filter(ci => ci.id === 'm_cold_snap'); const back = c.exhaust.filter(ci => !keep.includes(ci)); c.discard.push(...back); c.exhaust = keep; })], kw: ['cooldown'], icon: '❄️' }),
];
