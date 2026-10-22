import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, app, self, draw, heal, totem, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const S = (d: D): CardDef => ({ ...d, cls: 'shaman' });

export const SHAMAN_CARDS: CardDef[] = [
  S({ id: 's_strike', name: 'Primal Strike', type: 'attack', rarity: 'starter', cost: 1, a: [dmg(6)], icon: '👊' }),
  S({ id: 's_guard', name: 'Earthen Guard', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🪨' }),
  S({ id: 's_searing', name: 'Searing Totem', type: 'skill', rarity: 'starter', cost: 1, uc: 0, a: [totem('searing')], icon: '🔥' }),
  // Elemental
  S({ id: 's_bolt', name: 'Lightning Bolt', tree: 'ele', type: 'attack', rarity: 'common', cost: 1, school: 'nature', a: [dmg(8)], u: [dmg(11)], icon: '⚡' }),
  S({ id: 's_earth_shock', name: 'Earth Shock', tree: 'ele', type: 'attack', rarity: 'common', cost: 1, school: 'nature', a: [dmg(5), app('weak', 1)], u: [dmg(8), app('weak', 1)], icon: '🌍' }),
  S({ id: 's_flame_shock', name: 'Flame Shock', tree: 'ele', type: 'attack', rarity: 'common', cost: 1, school: 'fire', a: [dmg(4), app('burn', 5)], u: [dmg(6), app('burn', 7)], icon: '🔥' }),
  S({ id: 's_frost_shock', name: 'Frost Shock', tree: 'ele', type: 'attack', rarity: 'common', cost: 1, school: 'frost', a: [dmg(5), app('chill', 2)], u: [dmg(7), app('chill', 3)], lvl: 6, icon: '❄️' }),
  S({ id: 's_chain', name: 'Chain Lightning', tree: 'ele', type: 'attack', rarity: 'uncommon', cost: 2, school: 'nature', lvl: 20, tgt: true,
    text: 'Deal 10 Nature damage to the target, 7 to a second enemy and 4 to a third.',
    a: [fn('chain', (c, ctx, up) => {
      const vals = up ? [14, 10, 6] : [10, 7, 4];
      const hit = new Set<number>();
      let t = ctx.target;
      for (const v of vals) {
        if (!t) break;
        hit.add(t.uid);
        c.hit(c.calcCardHit(ctx.def, v, 'nature', t, false));
        t = c.alive().find(e => !hit.has(e.uid));
      }
    })], icon: '🌩️' }),
  S({ id: 's_magma', name: 'Magma Totem', tree: 'ele', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 12, a: [totem('magma')], uc: 0, icon: '🌋' }),
  S({ id: 's_fire_nova', name: 'Fire Nova Totem', tree: 'ele', type: 'skill', rarity: 'uncommon', cost: 2, school: 'fire', lvl: 16, a: [aoe(8, { school: 'fire' }), totem('firenova')], u: [aoe(12, { school: 'fire' }), totem('firenova')], icon: '💥' }),
  S({ id: 's_em', name: 'Elemental Mastery', tree: 'ele', type: 'skill', rarity: 'rare', cost: 0, talent: 's_ele_cap', a: [self('critnext', 2), self('clearcast', 1)], u: [self('critnext', 3), self('clearcast', 2)], kw: ['cooldown'], icon: '🌀' }),
  S({ id: 's_storm', name: 'Thunderstorm', tree: 'ele', type: 'attack', rarity: 'rare', cost: 2, school: 'nature', lvl: 38, a: [aoe(9), app('weak', 1, 'all')], u: [aoe(13), app('weak', 2, 'all')], icon: '⛈️' }),
  // Enhancement
  S({ id: 's_lshield', name: 'Lightning Shield', tree: 'enh', type: 'aura', rarity: 'common', cost: 1, a: [self('lightningShield', 3)], u: [self('lightningShield', 5)], icon: '⚡' }),
  S({ id: 's_flametongue', name: 'Flametongue Weapon', tree: 'enh', type: 'aura', rarity: 'common', cost: 1, a: [self('flametongue', 2)], u: [self('flametongue', 3)], lvl: 4, icon: '🗡️' }),
  S({ id: 's_rockbiter', name: 'Rockbiter Weapon', tree: 'enh', type: 'aura', rarity: 'common', cost: 1, a: [self('str', 2)], u: [self('str', 3)], icon: '🪨' }),
  S({ id: 's_strength', name: 'Strength of Earth Totem', tree: 'enh', type: 'skill', rarity: 'common', cost: 1, uc: 0, a: [totem('strength')], lvl: 8, icon: '🗿' }),
  S({ id: 's_windfury', name: 'Windfury Totem', tree: 'enh', type: 'skill', rarity: 'uncommon', cost: 1, uc: 0, a: [totem('windfury')], lvl: 18, icon: '🌪️' }),
  S({ id: 's_stormstrike', name: 'Stormstrike', tree: 'enh', type: 'attack', rarity: 'rare', cost: 1, talent: 's_enh_cap', a: [dmg(5, { hits: 2 }), app('vuln', 2)], u: [dmg(7, { hits: 2 }), app('vuln', 2)], icon: '⛈️' }),
  S({ id: 's_lava_lash', name: 'Lava Lash', tree: 'enh', type: 'attack', rarity: 'uncommon', cost: 1, lvl: 24, a: [dmg(6), dmg(6, { school: 'fire' })], u: [dmg(8), dmg(8, { school: 'fire' })], icon: '🌋' }),
  S({ id: 's_grace', name: 'Grace of Air Totem', tree: 'enh', type: 'skill', rarity: 'uncommon', cost: 1, uc: 0, a: [totem('grace')], lvl: 28, icon: '🍃' }),
  // Restoration
  S({ id: 's_hwave', name: 'Healing Wave', tree: 'resto', type: 'skill', rarity: 'common', cost: 2, school: 'nature', a: [heal(14)], u: [heal(19)], icon: '🌊' }),
  S({ id: 's_lhw', name: 'Lesser Healing Wave', tree: 'resto', type: 'skill', rarity: 'common', cost: 1, school: 'nature', a: [heal(6), blk(3)], u: [heal(9), blk(4)], icon: '💧' }),
  S({ id: 's_stoneskin', name: 'Stoneskin Totem', tree: 'resto', type: 'skill', rarity: 'common', cost: 1, uc: 0, a: [totem('stoneskin')], icon: '🗿' }),
  S({ id: 's_hstream', name: 'Healing Stream Totem', tree: 'resto', type: 'skill', rarity: 'common', cost: 1, uc: 0, a: [totem('healingstream')], lvl: 6, icon: '⛲' }),
  S({ id: 's_manaspring', name: 'Mana Spring Totem', tree: 'resto', type: 'skill', rarity: 'uncommon', cost: 2, uc: 1, a: [totem('manaspring')], lvl: 16, icon: '💠' }),
  S({ id: 's_chain_heal', name: 'Chain Heal', tree: 'resto', type: 'skill', rarity: 'uncommon', cost: 2, school: 'nature', lvl: 30, a: [heal(10), blk(6)], u: [heal(14), blk(8)], icon: '🔗' }),
  S({ id: 's_manatide', name: 'Mana Tide Totem', tree: 'resto', type: 'skill', rarity: 'rare', cost: 1, uc: 0, talent: 's_resto_cap', a: [totem('manatide')], icon: '🌊' }),
  S({ id: 's_reincarnation', name: 'Reincarnation', tree: 'resto', type: 'aura', rarity: 'rare', cost: 2, lvl: 40, text: 'The next time you would die this combat, revive with 20 HP.', a: [self('reincarnate', 20)], u: [self('reincarnate', 30)], icon: '🪶' }),
  S({ id: 's_purge', name: 'Purge', tree: 'resto', type: 'skill', rarity: 'common', cost: 0, tgt: true, text: 'Remove the target\'s Attack Power and Block. Draw 1.',
    a: [fn('purge', (c, ctx) => { const t = ctx.target; if (t) { delete t.st.str; t.block = 0; } c.drawCards(1); })], icon: '🧹' }),
  S({ id: 's_earthbind', name: 'Earthbind Totem', tree: 'ele', type: 'skill', rarity: 'common', cost: 1, uc: 0, a: [totem('earthbind'), draw(1)], lvl: 10, icon: '🕸️' }),
];
