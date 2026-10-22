// Profession cards, curses/afflictions, tokens and potions.
import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, app, self, draw, res, lose, heal, cleanse, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const N = (d: D): CardDef => ({ ...d, cls: 'neutral' });
const K = (d: Omit<D, 'type' | 'cost'>): CardDef => ({ ...d, cls: 'curse', type: 'curse', cost: -1 });
const T = (d: D): CardDef => ({ ...d, cls: 'token' });

export const NEUTRAL_CARDS: CardDef[] = [
  N({ id: 'n_bandage', name: 'Heavy Runecloth Bandage', type: 'skill', rarity: 'common', cost: 1, a: [heal(10)], u: [heal(15)], kw: ['cooldown'], tags: ['firstaid'], icon: '🩹' }),
  N({ id: 'n_copper_bomb', name: 'Rough Copper Bomb', type: 'attack', rarity: 'common', cost: 1, school: 'fire', a: [aoe(6, { school: 'fire' })], u: [aoe(9, { school: 'fire' })], tags: ['eng'], icon: '💣' }),
  N({ id: 'n_iron_grenade', name: 'Iron Grenade', type: 'attack', rarity: 'common', cost: 1, school: 'fire', a: [dmg(8, { school: 'fire' }), app('stun', 1)], u: [dmg(12, { school: 'fire' }), app('stun', 1)], kw: ['cooldown'], tags: ['eng'], icon: '🧨' }),
  N({ id: 'n_sapper', name: 'Goblin Sapper Charge', type: 'attack', rarity: 'uncommon', cost: 1, school: 'fire', a: [aoe(18, { school: 'fire' }), lose(6)], u: [aoe(26, { school: 'fire' }), lose(6)], kw: ['cooldown'], tags: ['eng'], icon: '💥' }),
  N({ id: 'n_net', name: 'Gnomish Net-o-Matic', type: 'skill', rarity: 'uncommon', cost: 0, a: [app('stun', 1)], kw: ['cooldown'], tags: ['eng'], icon: '🕸️' }),
  N({ id: 'n_dark_rune', name: 'Dark Rune', type: 'skill', rarity: 'common', cost: 0, a: [lose(4), res(2)], u: [lose(2), res(2)], kw: ['cooldown'], icon: '🪨' }),
  N({ id: 'n_tuber', name: 'Whipper Root Tuber', type: 'skill', rarity: 'common', cost: 0, a: [heal(6)], u: [heal(9)], kw: ['cooldown'], icon: '🥔' }),
  N({ id: 'n_thorium', name: 'Thorium Grenade', type: 'attack', rarity: 'rare', cost: 1, school: 'fire', a: [aoe(12, { school: 'fire' }), app('stun', 1, 'all')], u: [aoe(16, { school: 'fire' }), app('stun', 1, 'all')], kw: ['cooldown'], tags: ['eng'], icon: '💣' }),
  N({ id: 'n_mithril_shield', name: 'Mithril Spurs', type: 'skill', rarity: 'common', cost: 0, a: [blk(4), draw(1)], u: [blk(6), draw(1)], icon: '🥾' }),
  N({ id: 'n_flask', name: 'Nightfin Soup', type: 'skill', rarity: 'uncommon', cost: 1, a: [res(2), draw(1)], u: [res(2), draw(2)], kw: ['cooldown'], icon: '🍲' }),
  N({ id: 'n_battle_chicken', name: 'Gnomish Battle Chicken', type: 'skill', rarity: 'rare', cost: 1, text: 'For the rest of combat, a Battle Chicken pecks a random enemy for 5 at the end of your turn.',
    a: [fn('chicken', c => { c.mem.chicken = (c.mem.chicken ?? 0) + 5; })], u: [fn('chicken', c => { c.mem.chicken = (c.mem.chicken ?? 0) + 8; })], tags: ['eng'], kw: ['cooldown'], icon: '🐔' }),

  // ----- curses and afflictions -----
  K({ id: 'c_wound', name: 'Wound', rarity: 'special', a: [], kw: ['unplayable'], text: 'Unplayable.', icon: '🩸' }),
  K({ id: 'c_res_sick', name: 'Resurrection Sickness', rarity: 'special', a: [], kw: ['unplayable'], text: 'Unplayable. A lingering weakness from the Spirit Healer.', icon: '👻' }),
  K({ id: 'c_tongues', name: 'Curse of Tongues', rarity: 'special', a: [], kw: ['unplayable', 'ethereal'], text: 'Unplayable. Fades at end of turn.', icon: '🗣️' }),
  K({ id: 'c_burning', name: 'Burning Adrenaline', rarity: 'special', a: [], kw: ['unplayable', 'ethereal'], endInHand: [lose(4)], text: 'Unplayable. If held at end of turn, lose 4 HP. Fades.', icon: '🔥' }),
  K({ id: 'c_living_bomb', name: 'Living Bomb', rarity: 'special', a: [], kw: ['unplayable', 'ethereal'], endInHand: [lose(8)], text: 'Unplayable. If held at end of turn, explode for 8 damage.', icon: '💣' }),
  K({ id: 'c_poisoned', name: 'Poisoned', rarity: 'special', a: [], kw: ['unplayable'], endInHand: [lose(2)], text: 'Unplayable. If held at end of turn, lose 2 HP.', icon: '🧪' }),
  K({ id: 'c_brood_red', name: 'Brood Affliction: Red', rarity: 'special', a: [], kw: ['unplayable'], endInHand: [lose(3)], text: 'Unplayable. Lose 3 HP at end of turn if held.', icon: '🔴' }),
  K({ id: 'c_brood_black', name: 'Brood Affliction: Black', rarity: 'special', a: [], kw: ['unplayable'], text: 'Unplayable.', icon: '⚫' }),
  K({ id: 'c_brood_bronze', name: 'Brood Affliction: Bronze', rarity: 'special', a: [], kw: ['unplayable', 'ethereal'], text: 'Unplayable. Fades at end of turn.', icon: '🟤' }),
  K({ id: 'c_shadowflame', name: 'Shadow Flame', rarity: 'special', a: [], kw: ['unplayable', 'ethereal'], endInHand: [lose(5)], text: 'Unplayable. Lose 5 HP at end of turn if held.', icon: '🖤' }),
  K({ id: 'c_mind_control', name: "Dominated Mind", rarity: 'special', a: [], kw: ['unplayable', 'ethereal'], text: 'Unplayable. Fades.', icon: '🌀' }),
  { id: 'c_dazed_rock', name: 'Pyroclast Shard', cls: 'curse', type: 'curse', rarity: 'special', cost: 1, a: [], kw: ['cooldown'], text: 'Play to remove. Lose 3 HP if held at end of turn.', endInHand: [lose(3)], icon: '🪨' },

  // ----- tokens -----
  T({ id: 't_mana_gem', name: 'Mana Gem', type: 'skill', rarity: 'special', cost: 0, a: [res(1)], kw: ['cooldown'], icon: '💎' }),
  T({ id: 't_healthstone', name: 'Healthstone', type: 'skill', rarity: 'special', cost: 0, a: [heal(14)], kw: ['cooldown'], icon: '💚' }),
];

// Potions are used from the potion belt and are defined like cards.
const Po = (d: Omit<CardDef, 'cls' | 'type' | 'rarity' | 'cost'> & { rarity?: CardDef['rarity'] }): CardDef =>
  ({ cls: 'token', type: 'skill', cost: 0, ...d, rarity: d.rarity ?? 'common' });

export const POTIONS: CardDef[] = [
  Po({ id: 'po_heal', name: 'Major Healing Potion', a: [heal(20)], icon: '🧪', text: 'Restore 20 HP. Can be used outside combat.' }),
  Po({ id: 'po_mana', name: 'Major Mana Potion', a: [res(2)], icon: '🔷', text: 'Gain 2 resource.' }),
  Po({ id: 'po_giants', name: 'Elixir of Giants', a: [self('str', 3)], icon: '💪', text: 'Gain 3 Attack Power this combat.' }),
  Po({ id: 'po_sages', name: 'Greater Arcane Elixir', a: [self('sp', 3)], icon: '✨', text: 'Gain 3 Spell Power this combat.' }),
  Po({ id: 'po_stone', name: 'Greater Stoneshield Potion', a: [blk(16)], icon: '🪨', text: 'Gain 16 Block.' }),
  Po({ id: 'po_swift', name: 'Swiftness Potion', a: [draw(3)], icon: '💨', text: 'Draw 3 cards.' }),
  Po({ id: 'po_free', name: 'Free Action Potion', a: [cleanse(), self('fearward', 1)], icon: '🕊️', text: 'Remove all debuffs. Immune to Fear and Daze this combat.' }),
  Po({ id: 'po_lip', name: 'Limited Invulnerability Potion', a: [self('invuln', 1)], icon: '🔆', text: 'Become Invulnerable until your next turn.', rarity: 'rare' }),
  Po({ id: 'po_fire', name: 'Greater Fire Protection Potion', a: [{ k: 'absorb', n: 18 }], icon: '♨️', text: 'Gain 18 Shield.', rarity: 'uncommon' }),
  Po({ id: 'po_rage', name: 'Mighty Rage Potion', a: [res(2), self('str', 2)], icon: '😡', text: 'Gain 2 resource and 2 Attack Power.', rarity: 'uncommon' }),
  Po({ id: 'po_dense', name: 'Dense Dynamite', a: [aoe(12, { school: 'fire' })], icon: '🧨', text: 'Deal 12 Fire damage to ALL enemies.' }),
  Po({ id: 'po_frost_oil', name: 'Frost Oil', a: [app('chill', 3, 'all')], icon: '❄️', text: 'Apply 3 Chilled to ALL enemies.' }),
];
