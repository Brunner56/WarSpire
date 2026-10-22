import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, app, self, draw, res, heal, cp, form, per, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const Dr = (d: D): CardDef => ({ ...d, cls: 'druid' });

export const DRUID_CARDS: CardDef[] = [
  Dr({ id: 'd_wrath', name: 'Wrath', type: 'attack', rarity: 'starter', cost: 1, school: 'nature', kw: ['caster'], a: [dmg(6)], icon: '🌿' }),
  Dr({ id: 'd_barkskin', name: 'Barkskin', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🌳' }),
  Dr({ id: 'd_bear', name: 'Bear Form', type: 'skill', rarity: 'starter', cost: 1, a: [form('bear'), blk(6)], u: [form('bear'), blk(9)], kw: ['innate'], text: 'Shift into Bear Form (your Attacks also grant 2 Block). Gain 6 Block.', icon: '🐻' }),
  Dr({ id: 'd_cat', name: 'Cat Form', type: 'skill', rarity: 'starter', cost: 1, a: [form('cat'), cp(1), draw(1)], u: [form('cat'), cp(2), draw(1)], kw: ['innate'], text: 'Shift into Cat Form (Attacks deal +1 damage). Gain 1 Combo Point. Draw 1.', icon: '🐆' }),
  // Balance
  Dr({ id: 'd_moonfire', name: 'Moonfire', tree: 'balance', type: 'attack', rarity: 'common', cost: 1, school: 'arcane', kw: ['caster'], a: [dmg(4), app('burn', 5)], u: [dmg(6), app('burn', 7)], icon: '🌙' }),
  Dr({ id: 'd_starfire', name: 'Starfire', tree: 'balance', type: 'attack', rarity: 'common', cost: 2, school: 'arcane', kw: ['caster'], a: [dmg(14)], u: [dmg(19)], icon: '⭐' }),
  Dr({ id: 'd_swarm', name: 'Insect Swarm', tree: 'balance', type: 'skill', rarity: 'common', cost: 1, school: 'nature', kw: ['caster'], a: [app('poison', 5), app('weak', 1)], u: [app('poison', 7), app('weak', 2)], lvl: 6, icon: '🦟' }),
  Dr({ id: 'd_roots', name: 'Entangling Roots', tree: 'balance', type: 'skill', rarity: 'common', cost: 1, school: 'nature', kw: ['caster'], a: [app('poly', 1), app('poison', 3)], u: [app('poly', 1), app('poison', 5)], lvl: 4, icon: '🌱' }),
  Dr({ id: 'd_faerie', name: 'Faerie Fire', tree: 'balance', type: 'skill', rarity: 'common', cost: 0, a: [app('vuln', 2)], u: [app('vuln', 3)], icon: '🧚' }),
  Dr({ id: 'd_hurricane', name: 'Hurricane', tree: 'balance', type: 'attack', rarity: 'uncommon', cost: 2, school: 'nature', kw: ['caster'], lvl: 26, a: [aoe(4, { hits: 2 }), app('weak', 1, 'all')], u: [aoe(5, { hits: 2 }), app('weak', 2, 'all')], icon: '🌪️' }),
  Dr({ id: 'd_starfall', name: "Nature's Grasp", tree: 'balance', type: 'aura', rarity: 'uncommon', cost: 1, lvl: 16, a: [self('thorns', 3), self('dodge', 1)], u: [self('thorns', 4), self('dodge', 2)], icon: '🌾' }),
  Dr({ id: 'd_moonkin', name: 'Moonkin Form', tree: 'balance', type: 'skill', rarity: 'rare', cost: 1, uc: 0, talent: 'd_balance_cap', a: [form('moonkin'), self('sp', 1)], text: 'Shift into Moonkin Form: spells deal +3 damage and +10% crit. Spells do not cancel it. Gain 1 Spell Power.', icon: '🦉' }),
  Dr({ id: 'd_innervate', name: 'Innervate', tree: 'balance', type: 'skill', rarity: 'rare', cost: 0, lvl: 30, a: [res(3)], u: [res(4)], kw: ['cooldown'], icon: '💫' }),
  // Feral
  Dr({ id: 'd_claw', name: 'Claw', tree: 'feral', type: 'attack', rarity: 'common', cost: 1, form: 'cat', a: [dmg(6), cp(1)], u: [dmg(9), cp(1)], icon: '🐾' }),
  Dr({ id: 'd_rake', name: 'Rake', tree: 'feral', type: 'attack', rarity: 'common', cost: 1, form: 'cat', a: [dmg(3), app('bleed', 4), cp(1)], u: [dmg(4), app('bleed', 6), cp(1)], icon: '🩸' }),
  Dr({ id: 'd_shred', name: 'Shred', tree: 'feral', type: 'attack', rarity: 'uncommon', cost: 2, form: 'cat', lvl: 12, a: [dmg(14), cp(2)], u: [dmg(19), cp(2)], icon: '🐆' }),
  Dr({ id: 'd_bite', name: 'Ferocious Bite', tree: 'feral', type: 'attack', rarity: 'common', cost: 1, form: 'cat', kw: ['finisher'], a: [dmg(3, { x: per('cp', 5) })], u: [dmg(5, { x: per('cp', 6) })], text: 'Cat Form. Finisher: Deal 3 damage +5 per Combo Point.', icon: '🦷' }),
  Dr({ id: 'd_rip', name: 'Rip', tree: 'feral', type: 'attack', rarity: 'uncommon', cost: 1, form: 'cat', kw: ['finisher'], lvl: 18, a: [app('bleed', 0, 'enemy', per('cp', 4))], u: [app('bleed', 2, 'enemy', per('cp', 5))], text: 'Cat Form. Finisher: Apply 4 Bleed per Combo Point.', icon: '🩸' }),
  Dr({ id: 'd_tigers', name: "Tiger's Fury", tree: 'feral', type: 'skill', rarity: 'common', cost: 0, a: [self('empower', 3)], u: [self('empower', 5)], lvl: 8, icon: '🐯' }),
  Dr({ id: 'd_maul', name: 'Maul', tree: 'feral', type: 'attack', rarity: 'common', cost: 1, form: 'bear', a: [dmg(8)], u: [dmg(11)], icon: '🐻' }),
  Dr({ id: 'd_swipe', name: 'Swipe', tree: 'feral', type: 'attack', rarity: 'common', cost: 1, form: 'bear', a: [aoe(5)], u: [aoe(7)], icon: '🐾' }),
  Dr({ id: 'd_roar', name: 'Demoralizing Roar', tree: 'feral', type: 'skill', rarity: 'common', cost: 1, form: 'bear', a: [app('weak', 2, 'all'), blk(3)], u: [app('weak', 2, 'all'), blk(6)], lvl: 6, icon: '📣' }),
  Dr({ id: 'd_frenzied', name: 'Frenzied Regeneration', tree: 'feral', type: 'skill', rarity: 'uncommon', cost: 1, form: 'bear', lvl: 20, a: [self('regen', 5), blk(5)], u: [self('regen', 7), blk(7)], icon: '❤️‍🔥' }),
  Dr({ id: 'd_feral_charge', name: 'Feral Charge', tree: 'feral', type: 'attack', rarity: 'uncommon', cost: 1, form: 'bear', lvl: 14, a: [dmg(5), app('stun', 1)], kw: ['cooldown'], icon: '💨' }),
  Dr({ id: 'd_enrage', name: 'Enrage', tree: 'feral', type: 'skill', rarity: 'common', cost: 0, a: [res(1), draw(1), self('vuln', 1)], u: [res(1), draw(2), self('vuln', 1)], lvl: 10, icon: '💢' }),
  Dr({ id: 'd_lotp', name: 'Leader of the Pack', tree: 'feral', type: 'aura', rarity: 'rare', cost: 1, talent: 'd_feral_cap', a: [self('str', 2), self('regen', 2)], u: [self('str', 3), self('regen', 3)], text: 'Gain 2 Attack Power. Your crits heal 2 (talent).', icon: '🐺' }),
  // Restoration
  Dr({ id: 'd_rejuv', name: 'Rejuvenation', tree: 'resto', type: 'skill', rarity: 'common', cost: 1, school: 'nature', a: [self('regen', 5)], u: [self('regen', 7)], icon: '🌿' }),
  Dr({ id: 'd_touch', name: 'Healing Touch', tree: 'resto', type: 'skill', rarity: 'common', cost: 2, school: 'nature', kw: ['caster'], a: [heal(15)], u: [heal(21)], icon: '💚' }),
  Dr({ id: 'd_regrowth', name: 'Regrowth', tree: 'resto', type: 'skill', rarity: 'uncommon', cost: 2, school: 'nature', kw: ['caster'], lvl: 14, a: [heal(8), self('regen', 5)], u: [heal(11), self('regen', 7)], icon: '🍀' }),
  Dr({ id: 'd_swiftmend', name: 'Swiftmend', tree: 'resto', type: 'skill', rarity: 'rare', cost: 0, talent: 'd_resto_cap', a: [heal(0, per('regen', 2)), blk(0, per('regen', 1))], u: [heal(4, per('regen', 2)), blk(2, per('regen', 1))], text: 'Heal 2× your Regeneration and gain Block equal to it.', icon: '🌸' }),
  Dr({ id: 'd_tranq', name: 'Tranquility', tree: 'resto', type: 'skill', rarity: 'rare', cost: 2, school: 'nature', kw: ['caster', 'cooldown'], lvl: 36, a: [heal(20), self('regen', 4)], u: [heal(28), self('regen', 6)], icon: '🕊️' }),
  Dr({ id: 'd_thorns', name: 'Thorns', tree: 'resto', type: 'aura', rarity: 'common', cost: 1, a: [self('thorns', 3)], u: [self('thorns', 5)], icon: '🌵' }),
  Dr({ id: 'd_motw', name: 'Mark of the Wild', tree: 'resto', type: 'aura', rarity: 'uncommon', cost: 1, lvl: 10, a: [self('str', 1), self('sp', 1), self('dex', 1)], u: [self('str', 2), self('sp', 2), self('dex', 1)], icon: '🐾' }),
  Dr({ id: 'd_ns', name: "Nature's Swiftness", tree: 'resto', type: 'skill', rarity: 'uncommon', cost: 0, lvl: 22, a: [self('clearcast', 1), draw(1)], u: [self('clearcast', 2), draw(1)], kw: ['cooldown'], icon: '🍃' }),
];
