import type { CardDef } from '../../engine/types';
import { dmg, aoe, blk, app, self, draw, res, heal, seal, judge, cleanse, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const P = (d: D): CardDef => ({ ...d, cls: 'paladin' });

export const PALADIN_CARDS: CardDef[] = [
  P({ id: 'p_strike', name: 'Crusader Strike', type: 'attack', rarity: 'starter', cost: 1, a: [dmg(6)], icon: '⚔️' }),
  P({ id: 'p_guard', name: 'Holy Guard', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '🛡️' }),
  P({ id: 'p_seal_right', name: 'Seal of Righteousness', type: 'skill', rarity: 'starter', cost: 0, a: [seal('righteousness')], u: [seal('righteousness'), draw(1)], icon: '🟡' }),
  P({ id: 'p_judgement', name: 'Judgement', type: 'attack', rarity: 'starter', cost: 1, school: 'holy', a: [dmg(6), judge()], u: [dmg(9), judge()], icon: '⚖️',
    text: 'Deal 6 Holy damage. Unleash your active Seal\'s Judgement and consume it.' }),
  // Holy
  P({ id: 'p_seal_light', name: 'Seal of Light', tree: 'holy', type: 'skill', rarity: 'common', cost: 0, a: [seal('light')], u: [seal('light'), draw(1)], icon: '🌟' }),
  P({ id: 'p_seal_wisdom', name: 'Seal of Wisdom', tree: 'holy', type: 'skill', rarity: 'uncommon', cost: 0, a: [seal('wisdom')], u: [seal('wisdom'), draw(1)], lvl: 12, icon: '🔵' }),
  P({ id: 'p_holy_light', name: 'Holy Light', tree: 'holy', type: 'skill', rarity: 'common', cost: 2, school: 'holy', a: [heal(12)], u: [heal(17)], kw: ['caster'], icon: '💛' }),
  P({ id: 'p_flash', name: 'Flash of Light', tree: 'holy', type: 'skill', rarity: 'common', cost: 1, school: 'holy', a: [heal(5), draw(1)], u: [heal(8), draw(1)], icon: '✨' }),
  P({ id: 'p_exorcism', name: 'Exorcism', tree: 'holy', type: 'attack', rarity: 'uncommon', cost: 1, school: 'holy', lvl: 10, tgt: true,
    text: 'Deal 9 Holy damage. Triple damage against Undead and Demons.',
    a: [fn('exorcism', (c, ctx, up) => {
      const t = ctx.target; if (!t) return;
      const tags = t.def.tags ?? [];
      const base = (up ? 13 : 9) * (tags.includes('undead') || tags.includes('demon') ? 3 : 1);
      c.hit(c.calcCardHit(ctx.def, base, 'holy', t, false));
    })], icon: '✝️' }),
  P({ id: 'p_holy_shock', name: 'Holy Shock', tree: 'holy', type: 'attack', rarity: 'rare', cost: 1, school: 'holy', talent: 'p_holy_cap', a: [dmg(9), heal(5)], u: [dmg(13), heal(7)], icon: '⚡' }),
  P({ id: 'p_holy_wrath', name: 'Holy Wrath', tree: 'holy', type: 'attack', rarity: 'rare', cost: 2, school: 'holy', lvl: 44,
    text: 'Deal 9 Holy damage to ALL enemies. Triple against Undead and Demons.',
    a: [fn('holywrath', (c, ctx, up) => {
      for (const t of c.alive()) {
        const tags = t.def.tags ?? [];
        const base = (up ? 13 : 9) * (tags.includes('undead') || tags.includes('demon') ? 3 : 1);
        c.hit(c.calcCardHit(ctx.def, base, 'holy', t, false));
      }
    })], icon: '🌞' }),
  P({ id: 'p_lay_hands', name: 'Lay on Hands', tree: 'holy', type: 'skill', rarity: 'rare', cost: 0, school: 'holy', lvl: 30, a: [heal(25), res(2)], u: [heal(35), res(2)], kw: ['cooldown'], icon: '🙌' }),
  P({ id: 'p_cleanse', name: 'Cleanse', tree: 'holy', type: 'skill', rarity: 'common', cost: 0, a: [cleanse(), draw(1)], u: [cleanse(), draw(2)], lvl: 6, icon: '💧' }),
  // Protection
  P({ id: 'p_seal_justice', name: 'Seal of Justice', tree: 'prot', type: 'skill', rarity: 'common', cost: 0, a: [seal('justice')], u: [seal('justice'), draw(1)], icon: '🟠' }),
  P({ id: 'p_hoj', name: 'Hammer of Justice', tree: 'prot', type: 'attack', rarity: 'common', cost: 1, school: 'holy', a: [dmg(4), app('stun', 1)], u: [dmg(7), app('stun', 1)], kw: ['cooldown'], icon: '🔨' }),
  P({ id: 'p_devotion', name: 'Devotion Aura', tree: 'prot', type: 'aura', rarity: 'common', cost: 1, a: [self('fortify', 3)], u: [self('fortify', 4)], lvl: 4, icon: '🔰' }),
  P({ id: 'p_rfury', name: 'Righteous Fury', tree: 'prot', type: 'aura', rarity: 'uncommon', cost: 1, a: [self('rfury', 3)], u: [self('rfury', 4)], lvl: 14, icon: '🔆' }),
  P({ id: 'p_consecration', name: 'Consecration', tree: 'prot', type: 'skill', rarity: 'uncommon', cost: 2, school: 'holy', lvl: 20, a: [aoe(4), self('consecration', 6)], u: [aoe(6), self('consecration', 8)],
    text: 'Deal 4 Holy damage to ALL enemies. Consecrate the ground for 6 (deals at end of turn, then halves).', icon: '✴️' }),
  P({ id: 'p_holy_shield', name: 'Holy Shield', tree: 'prot', type: 'skill', rarity: 'rare', cost: 1, school: 'holy', talent: 'p_prot_cap', a: [blk(10), self('retribution', 2)], u: [blk(14), self('retribution', 3)], icon: '🛡️' }),
  P({ id: 'p_divine_shield', name: 'Divine Shield', tree: 'prot', type: 'skill', rarity: 'rare', cost: 2, uc: 1, lvl: 28, a: [self('invuln', 1)], kw: ['cooldown'], icon: '🔆' }),
  P({ id: 'p_blessing_sanc', name: 'Blessing of Sanctuary', tree: 'prot', type: 'aura', rarity: 'uncommon', cost: 1, lvl: 24, a: [self('dex', 2), self('retribution', 1)], u: [self('dex', 3), self('retribution', 2)], icon: '🏛️' }),
  // Retribution
  P({ id: 'p_seal_crusader', name: 'Seal of the Crusader', tree: 'ret', type: 'skill', rarity: 'common', cost: 0, a: [seal('crusader')], u: [seal('crusader'), draw(1)], icon: '🔴' }),
  P({ id: 'p_seal_command', name: 'Seal of Command', tree: 'ret', type: 'skill', rarity: 'uncommon', cost: 0, a: [seal('command')], u: [seal('command'), draw(1)], lvl: 16, icon: '🟣' }),
  P({ id: 'p_might', name: 'Blessing of Might', tree: 'ret', type: 'aura', rarity: 'common', cost: 1, a: [self('str', 3)], u: [self('str', 4)], icon: '💪' }),
  P({ id: 'p_ret_aura', name: 'Retribution Aura', tree: 'ret', type: 'aura', rarity: 'common', cost: 1, a: [self('retribution', 4)], u: [self('retribution', 6)], lvl: 8, icon: '☀️' }),
  P({ id: 'p_hammer_wrath', name: 'Hammer of Wrath', tree: 'ret', type: 'attack', rarity: 'uncommon', cost: 1, school: 'holy', lvl: 26, tgt: true,
    text: 'Deal 7 Holy damage. Triple damage if the target is below 30% HP.',
    a: [fn('how', (c, ctx, up) => {
      const t = ctx.target; if (!t) return;
      const base = (up ? 10 : 7) * (t.hp / t.maxHp < 0.3 ? 3 : 1);
      c.hit(c.calcCardHit(ctx.def, base, 'holy', t, false));
    })], icon: '🔨' }),
  P({ id: 'p_repentance', name: 'Repentance', tree: 'ret', type: 'skill', rarity: 'rare', cost: 1, talent: 'p_ret_cap', a: [app('poly', 1), self('str', 2)], u: [app('poly', 1), self('str', 3)], icon: '🙏' }),
  P({ id: 'p_crusade', name: 'Divine Storm', tree: 'ret', type: 'attack', rarity: 'uncommon', cost: 2, lvl: 32, a: [aoe(8), heal(4)], u: [aoe(11), heal(6)], icon: '🌪️' }),
  P({ id: 'p_kings', name: 'Blessing of Kings', tree: 'ret', type: 'aura', rarity: 'rare', cost: 2, uc: 1, lvl: 40, a: [self('str', 2), self('sp', 2), self('dex', 2)], icon: '👑' }),
];
