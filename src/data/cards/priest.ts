import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, absorb, app, self, draw, res, heal, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const P = (d: D): CardDef => ({ ...d, cls: 'priest' });

export const PRIEST_CARDS: CardDef[] = [
  P({ id: 'pr_smite', name: 'Smite', type: 'attack', rarity: 'starter', cost: 1, school: 'holy', a: [dmg(6)], icon: '✨' }),
  P({ id: 'pr_fade', name: 'Fade', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🌫️' }),
  P({ id: 'pr_pws', name: 'Power Word: Shield', type: 'skill', rarity: 'starter', cost: 1, school: 'holy', a: [absorb(7)], u: [absorb(10)], icon: '🔵' }),
  // Discipline
  P({ id: 'pr_inner_fire', name: 'Inner Fire', tree: 'disc', type: 'aura', rarity: 'common', cost: 1, a: [self('dex', 2), self('sp', 1)], u: [self('dex', 3), self('sp', 1)], icon: '🔥' }),
  P({ id: 'pr_inner_focus', name: 'Inner Focus', tree: 'disc', type: 'skill', rarity: 'common', cost: 0, a: [self('clearcast', 1), draw(1)], u: [self('clearcast', 1), draw(2)], lvl: 4, icon: '🧘' }),
  P({ id: 'pr_mana_burn', name: 'Mana Burn', tree: 'disc', type: 'attack', rarity: 'common', cost: 1, school: 'arcane', tgt: true,
    text: 'Remove all of the target\'s Block, then deal 7 Arcane damage.',
    a: [fn('manaburn', (c, ctx, up) => { const t = ctx.target; if (!t) return; t.block = 0; c.hit(c.calcCardHit(ctx.def, up ? 10 : 7, 'arcane', t, false)); })], icon: '💙' }),
  P({ id: 'pr_fortitude', name: 'Power Word: Fortitude', tree: 'disc', type: 'aura', rarity: 'common', cost: 1, lvl: 6, text: 'Gain 8 Max HP for this combat and heal 8.',
    a: [fn('fort', (c, _x, up) => { const n = up ? 12 : 8; c.p.maxHp += n; c.p.st.maxhp = (c.p.st.maxhp ?? 0) + n; c.heal(n); })], icon: '❤️' }),
  P({ id: 'pr_dispel', name: 'Dispel Magic', tree: 'disc', type: 'skill', rarity: 'common', cost: 0, tgt: true, text: 'Remove the target\'s Attack Power and Block. Draw 1.',
    a: [fn('dispel', (c, ctx) => { const t = ctx.target; if (t) { delete t.st.str; delete t.st.ritual; t.block = 0; } c.drawCards(1); })], icon: '🌀' }),
  P({ id: 'pr_pi', name: 'Power Infusion', tree: 'disc', type: 'skill', rarity: 'rare', cost: 0, talent: 'pr_disc_cap', a: [res(2), self('empower', 4)], u: [res(2), self('empower', 6)], kw: ['cooldown'], icon: '⚡' }),
  P({ id: 'pr_barrier', name: 'Divine Spirit', tree: 'disc', type: 'skill', rarity: 'uncommon', cost: 2, school: 'holy', lvl: 20, a: [absorb(14), self('dex', 1)], u: [absorb(19), self('dex', 1)], icon: '🕊️' }),
  P({ id: 'pr_penance', name: 'Holy Bolt Barrage', tree: 'disc', type: 'attack', rarity: 'uncommon', cost: 2, school: 'holy', lvl: 28, a: [dmg(4, { hits: 3 }), absorb(4)], u: [dmg(5, { hits: 3 }), absorb(6)], icon: '🔱' }),
  // Holy
  P({ id: 'pr_renew', name: 'Renew', tree: 'holy', type: 'skill', rarity: 'common', cost: 1, school: 'holy', a: [self('regen', 5)], u: [self('regen', 7)], icon: '🌿' }),
  P({ id: 'pr_flash', name: 'Flash Heal', tree: 'holy', type: 'skill', rarity: 'common', cost: 1, school: 'holy', a: [heal(7)], u: [heal(10)], icon: '💛' }),
  P({ id: 'pr_greater', name: 'Greater Heal', tree: 'holy', type: 'skill', rarity: 'uncommon', cost: 2, school: 'holy', lvl: 24, a: [heal(18)], u: [heal(25)], icon: '💖' }),
  P({ id: 'pr_holy_fire', name: 'Holy Fire', tree: 'holy', type: 'attack', rarity: 'common', cost: 2, school: 'holy', a: [dmg(10), app('burn', 4)], u: [dmg(13), app('burn', 6)], lvl: 6, icon: '🔥' }),
  P({ id: 'pr_nova', name: 'Holy Nova', tree: 'holy', type: 'attack', rarity: 'uncommon', cost: 1, school: 'holy', lvl: 14, a: [aoe(4), heal(3)], u: [aoe(6), heal(4)], icon: '🌟' }),
  P({ id: 'pr_prayer', name: 'Prayer of Healing', tree: 'holy', type: 'skill', rarity: 'rare', cost: 2, school: 'holy', lvl: 36, a: [heal(14), self('regen', 4)], u: [heal(18), self('regen', 6)], kw: ['cooldown'], icon: '🙏' }),
  P({ id: 'pr_chastise', name: 'Chastise', tree: 'holy', type: 'attack', rarity: 'common', cost: 0, school: 'holy', a: [dmg(4), app('weak', 1)], u: [dmg(6), app('weak', 1)], lvl: 10, icon: '☝️' }),
  P({ id: 'pr_lightwell', name: 'Lightwell', tree: 'holy', type: 'aura', rarity: 'rare', cost: 2, school: 'holy', talent: 'pr_holy_cap', a: [self('regen', 4), self('fortify', 2)], u: [self('regen', 6), self('fortify', 3)], text: 'Gain 4 Regeneration and Fortify 2.', icon: '⛲' }),
  // Shadow
  P({ id: 'pr_swp', name: 'Shadow Word: Pain', tree: 'shadow', type: 'skill', rarity: 'common', cost: 1, school: 'shadow', a: [app('affliction', 6)], u: [app('affliction', 9)], icon: '🟣' }),
  P({ id: 'pr_mind_blast', name: 'Mind Blast', tree: 'shadow', type: 'attack', rarity: 'common', cost: 2, school: 'shadow', a: [dmg(13)], u: [dmg(18)], icon: '🧠' }),
  P({ id: 'pr_mind_flay', name: 'Mind Flay', tree: 'shadow', type: 'attack', rarity: 'common', cost: 1, school: 'shadow', a: [dmg(3, { hits: 3 }), app('weak', 1)], u: [dmg(4, { hits: 3 }), app('weak', 1)], lvl: 8, icon: '🌀' }),
  P({ id: 'pr_vamp', name: 'Vampiric Embrace', tree: 'shadow', type: 'aura', rarity: 'uncommon', cost: 1, lvl: 18, a: [self('vamp', 1)], u: [self('vamp', 2)], icon: '🦇' }),
  P({ id: 'pr_scream', name: 'Psychic Scream', tree: 'shadow', type: 'skill', rarity: 'uncommon', cost: 2, lvl: 22, a: [app('stun', 1, 'all')], u: [app('stun', 1, 'all'), app('weak', 1, 'all')], kw: ['cooldown'], icon: '😱' }),
  P({ id: 'pr_shadowform', name: 'Shadowform', tree: 'shadow', type: 'aura', rarity: 'rare', cost: 2, uc: 1, talent: 'pr_shadow_cap', a: [self('shadowform', 1)], icon: '👤' }),
  P({ id: 'pr_silence', name: 'Mind Sear', tree: 'shadow', type: 'attack', rarity: 'rare', cost: 2, school: 'shadow', lvl: 34, a: [aoe(5), app('affliction', 3, 'all')], u: [aoe(7), app('affliction', 4, 'all')], icon: '💜' }),
  // Racial priest spells (Classic!)
  P({ id: 'pr_desperate', name: 'Desperate Prayer', race: 'human', type: 'skill', rarity: 'uncommon', cost: 0, school: 'holy', a: [heal(12)], u: [heal(17)], kw: ['cooldown'], icon: '🙏' }),
  P({ id: 'pr_fear_ward', name: 'Fear Ward', race: 'dwarf', type: 'aura', rarity: 'uncommon', cost: 0, a: [self('fearward', 1), blk(4)], u: [self('fearward', 1), blk(8)], icon: '🛐' }),
  P({ id: 'pr_starshards', name: 'Starshards', race: 'nightelf', type: 'attack', rarity: 'uncommon', cost: 2, school: 'arcane', a: [dmg(6, { hits: 3 })], u: [dmg(8, { hits: 3 })], icon: '🌠' }),
  P({ id: 'pr_plague', name: 'Devouring Plague', race: 'undead', type: 'skill', rarity: 'uncommon', cost: 1, school: 'shadow', a: [app('siphon', 6)], u: [app('siphon', 9)], icon: '🦠' }),
  P({ id: 'pr_shadowguard', name: 'Shadowguard', race: 'troll', type: 'aura', rarity: 'uncommon', cost: 1, a: [self('thorns', 3), blk(4)], u: [self('thorns', 4), blk(6)], icon: '🛡️' }),
];
