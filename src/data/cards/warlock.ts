import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, absorb, app, self, draw, res, lose, shard, pet, add, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const L = (d: D): CardDef => ({ ...d, cls: 'warlock' });

export const WARLOCK_CARDS: CardDef[] = [
  L({ id: 'l_bolt', name: 'Shadow Bolt', type: 'attack', rarity: 'starter', cost: 1, school: 'shadow', a: [dmg(6)], icon: '🟣' }),
  L({ id: 'l_skin', name: 'Demon Skin', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🛡️' }),
  L({ id: 'l_imp', name: 'Summon Imp', type: 'skill', rarity: 'starter', cost: 1, uc: 0, a: [pet('imp')], kw: ['innate'], text: 'Summon an Imp that casts Firebolt at the end of each of your turns.', icon: '👺' }),
  L({ id: 'l_tap', name: 'Life Tap', type: 'skill', rarity: 'starter', cost: 0, a: [lose(4), res(1)], u: [lose(3), res(1), draw(1)], icon: '🩸' }),
  // Affliction
  L({ id: 'l_corruption', name: 'Corruption', tree: 'aff', type: 'skill', rarity: 'common', cost: 1, school: 'shadow', a: [app('affliction', 6)], u: [app('affliction', 9)], icon: '🟪' }),
  L({ id: 'l_agony', name: 'Curse of Agony', tree: 'aff', type: 'skill', rarity: 'common', cost: 0, school: 'shadow', a: [app('affliction', 3)], u: [app('affliction', 5)], icon: '😖' }),
  L({ id: 'l_drain_life', name: 'Drain Life', tree: 'aff', type: 'attack', rarity: 'common', cost: 1, school: 'shadow', a: [dmg(5, { ls: 1 })], u: [dmg(7, { ls: 1 })], icon: '💜' }),
  L({ id: 'l_drain_soul', name: 'Drain Soul', tree: 'aff', type: 'attack', rarity: 'common', cost: 1, school: 'shadow', tgt: true,
    text: 'Deal 6 Shadow damage (double below 25% HP). If it kills, gain 2 Soul Shards.',
    a: [fn('drainsoul', (c, ctx, up) => {
      const t = ctx.target; if (!t) return;
      const base = (up ? 9 : 6) * (t.hp / t.maxHp < 0.25 ? 2 : 1);
      c.hit(c.calcCardHit(ctx.def, base, 'shadow', t, false));
      if (t.dead) c.gainShards(2);
    })], icon: '👻' }),
  L({ id: 'l_siphon', name: 'Siphon Life', tree: 'aff', type: 'skill', rarity: 'uncommon', cost: 1, school: 'shadow', lvl: 12, a: [app('siphon', 5)], u: [app('siphon', 8)], icon: '🫀' }),
  L({ id: 'l_weakness', name: 'Curse of Weakness', tree: 'aff', type: 'skill', rarity: 'common', cost: 0, a: [app('weak', 2)], u: [app('weak', 3)], lvl: 4, icon: '🥀' }),
  L({ id: 'l_reckless', name: 'Curse of Recklessness', tree: 'aff', type: 'skill', rarity: 'common', cost: 0, a: [app('vuln', 2)], u: [app('vuln', 3)], lvl: 8, icon: '🎯' }),
  L({ id: 'l_doom', name: 'Curse of Doom', tree: 'aff', type: 'skill', rarity: 'rare', cost: 1, school: 'shadow', lvl: 34, a: [app('doom', 3)], u: [app('doom', 2)], text: 'In 3 turns the target takes 40 Shadow damage.', icon: '☠️' }),
  L({ id: 'l_dark_pact', name: 'Dark Pact', tree: 'aff', type: 'skill', rarity: 'rare', cost: 0, talent: 'l_aff_cap', a: [res(2), draw(1), lose(2)], u: [res(2), draw(2), lose(2)], icon: '🤝' }),
  L({ id: 'l_fear', name: 'Fear', tree: 'aff', type: 'skill', rarity: 'uncommon', cost: 1, school: 'shadow', lvl: 16, a: [app('poly', 1), app('affliction', 3)], u: [app('poly', 1), app('affliction', 5)], icon: '😱' }),
  // Demonology
  L({ id: 'l_voidwalker', name: 'Summon Voidwalker', tree: 'demo', type: 'skill', rarity: 'common', cost: 1, a: [pet('voidwalker'), blk(5)], icon: '🌀' }),
  L({ id: 'l_succubus', name: 'Summon Succubus', tree: 'demo', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 14, a: [pet('succubus')], icon: '💋' }),
  L({ id: 'l_felhunter', name: 'Summon Felhunter', tree: 'demo', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 22, a: [pet('felhunter'), draw(1)], icon: '🐕' }),
  L({ id: 'l_infernal', name: 'Inferno', tree: 'demo', type: 'skill', rarity: 'rare', cost: 2, shards: 1, lvl: 40, school: 'fire', a: [aoe(10, { school: 'fire' }), pet('infernal')], u: [aoe(15, { school: 'fire' }), pet('infernal')], text: 'Costs 1 Soul Shard. Deal 10 Fire damage to ALL enemies and summon an Infernal.', icon: '☄️' }),
  L({ id: 'l_healthstone', name: 'Create Healthstone', tree: 'demo', type: 'skill', rarity: 'common', cost: 1, a: [add('t_healthstone'), shard(1)], kw: ['cooldown'], lvl: 6, text: 'Add a Healthstone to your hand. Gain 1 Soul Shard.', icon: '💚' }),
  L({ id: 'l_soul_link', name: 'Soul Link', tree: 'demo', type: 'aura', rarity: 'rare', cost: 1, talent: 'l_demo_cap', a: [self('soulLink', 1), self('petpow', 2)], icon: '🔗' }),
  L({ id: 'l_demon_armor', name: 'Demon Armor', tree: 'demo', type: 'aura', rarity: 'uncommon', cost: 1, lvl: 18, a: [self('fortify', 2), self('regen', 3)], u: [self('fortify', 3), self('regen', 4)], icon: '🦺' }),
  L({ id: 'l_sacrifice', name: 'Demonic Sacrifice', tree: 'demo', type: 'skill', rarity: 'uncommon', cost: 0, lvl: 26, text: 'Sacrifice your demon: gain Spell Power equal to its damage and 10 Shield.',
    a: [fn('sacrifice', (c, _x, up) => { const p = c.p.pet; if (!p) return; c.applyStatus(c.p, 'sp', Math.ceil(p.dmg / 2) + (up ? 1 : 0), true); c.p.st.absorb = (c.p.st.absorb ?? 0) + 10; c.p.pet = null; })], kw: ['cooldown'], icon: '🔪' }),
  // Destruction
  L({ id: 'l_immolate', name: 'Immolate', tree: 'destro', type: 'attack', rarity: 'common', cost: 1, school: 'fire', a: [dmg(4), app('burn', 6)], u: [dmg(6), app('burn', 8)], icon: '🔥' }),
  L({ id: 'l_searing', name: 'Searing Pain', tree: 'destro', type: 'attack', rarity: 'common', cost: 0, school: 'fire', a: [dmg(4)], u: [dmg(6)], icon: '♨️' }),
  L({ id: 'l_shadowburn', name: 'Shadowburn', tree: 'destro', type: 'attack', rarity: 'uncommon', cost: 1, shards: 1, school: 'shadow', lvl: 10, tgt: true,
    text: 'Costs 1 Soul Shard. Deal 16 Shadow damage. If it kills, refund 2 Soul Shards.',
    a: [fn('shadowburn', (c, ctx, up) => { const t = ctx.target; if (!t) return; c.hit(c.calcCardHit(ctx.def, up ? 22 : 16, 'shadow', t, false)); if (t.dead) c.gainShards(2); })], icon: '🌑' }),
  L({ id: 'l_rain', name: 'Rain of Fire', tree: 'destro', type: 'attack', rarity: 'uncommon', cost: 2, school: 'fire', lvl: 18, a: [aoe(4, { hits: 2 }), app('burn', 2, 'all')], u: [aoe(5, { hits: 2 }), app('burn', 4, 'all')], icon: '🌧️' }),
  L({ id: 'l_hellfire', name: 'Hellfire', tree: 'destro', type: 'attack', rarity: 'uncommon', cost: 1, school: 'fire', lvl: 24, a: [aoe(8), lose(3)], u: [aoe(11), lose(3)], icon: '🔥' }),
  L({ id: 'l_soul_fire', name: 'Soul Fire', tree: 'destro', type: 'attack', rarity: 'rare', cost: 2, shards: 1, school: 'fire', lvl: 32, a: [dmg(28)], u: [dmg(38)], kw: ['cooldown'], text: 'Costs 1 Soul Shard. Deal 28 Fire damage.', icon: '🔥' }),
  L({ id: 'l_conflag', name: 'Conflagrate', tree: 'destro', type: 'attack', rarity: 'rare', cost: 1, school: 'fire', talent: 'l_destro_cap', tgt: true,
    text: 'Consume the target\'s Burning to deal 3× that much Fire damage.',
    a: [fn('conflag', (c, ctx, up) => { const t = ctx.target; if (!t) return; const b = t.st.burn ?? 0; delete t.st.burn; c.hit(c.calcCardHit(ctx.def, b * (up ? 4 : 3), 'fire', t, false)); })], icon: '💥' }),
  L({ id: 'l_death_coil', name: 'Death Coil', tree: 'destro', type: 'attack', rarity: 'rare', cost: 1, school: 'shadow', lvl: 38, a: [dmg(10, { ls: 1 }), app('poly', 1)], u: [dmg(14, { ls: 1 }), app('poly', 1)], kw: ['cooldown'], icon: '💀' }),
  L({ id: 'l_shadow_ward', name: 'Shadow Ward', tree: 'destro', type: 'skill', rarity: 'common', cost: 1, a: [absorb(8)], u: [absorb(11)], lvl: 6, icon: '🛡️' }),
];
