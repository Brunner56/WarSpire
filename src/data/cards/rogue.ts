import type { CardDef } from '../../engine/types';
import { dmg, blk, app, self, draw, res, cp, per, fn } from './helpers';

type D = Omit<CardDef, 'cls'>;
const R = (d: D): CardDef => ({ ...d, cls: 'rogue' });

export const ROGUE_CARDS: CardDef[] = [
  R({ id: 'r_sinister', name: 'Sinister Strike', type: 'attack', rarity: 'starter', cost: 1, a: [dmg(5), cp(1)], u: [dmg(8), cp(1)], icon: '🗡️' }),
  R({ id: 'r_feint', name: 'Feint', type: 'skill', rarity: 'starter', cost: 1, a: [blk(5)], icon: '💨' }),
  R({ id: 'r_eviscerate', name: 'Eviscerate', type: 'attack', rarity: 'starter', cost: 1, kw: ['finisher'], a: [dmg(2, { x: per('cp', 5) })], u: [dmg(4, { x: per('cp', 6) })],
    text: 'Finisher: Deal 2 damage +5 per Combo Point.', icon: '🔪' }),
  // Assassination
  R({ id: 'r_garrote', name: 'Garrote', tree: 'assa', type: 'attack', rarity: 'common', cost: 1, kw: ['opener'], a: [app('bleed', 7), cp(2)], u: [app('bleed', 10), cp(2)], icon: '🧵' }),
  R({ id: 'r_rupture', name: 'Rupture', tree: 'assa', type: 'attack', rarity: 'common', cost: 1, kw: ['finisher'], a: [app('bleed', 0, 'enemy', per('cp', 3))], u: [app('bleed', 2, 'enemy', per('cp', 4))],
    text: 'Finisher: Apply 3 Bleed per Combo Point.', icon: '🩸' }),
  R({ id: 'r_deadly', name: 'Deadly Poison', tree: 'assa', type: 'aura', rarity: 'common', cost: 1, a: [self('deadlyPoison', 2)], u: [self('deadlyPoison', 3)], lvl: 6, icon: '🟢' }),
  R({ id: 'r_envenom', name: 'Envenom', tree: 'assa', type: 'attack', rarity: 'uncommon', cost: 1, kw: ['finisher'], lvl: 16, tgt: true,
    text: 'Finisher: Deal damage equal to the target\'s Poison ×(1 + Combo Points / 2).',
    a: [fn('envenom', (c, ctx, up) => {
      const t = ctx.target; if (!t) return;
      const base = Math.floor((t.st.poison ?? 0) * (1 + ctx.cp / 2)) + (up ? 4 : 0);
      c.hit(c.calcCardHit(ctx.def, base, 'nature', t, false));
    })], icon: '🐍' }),
  R({ id: 'r_mutilate', name: 'Poisoned Blade', tree: 'assa', type: 'attack', rarity: 'common', cost: 1, a: [dmg(3, { hits: 2 }), app('poison', 2), cp(1)], u: [dmg(4, { hits: 2 }), app('poison', 3), cp(1)], icon: '🗡️' }),
  R({ id: 'r_cold_blood', name: 'Cold Blood', tree: 'assa', type: 'skill', rarity: 'rare', cost: 0, talent: 'r_assa_cap', a: [self('critnext', 1), cp(2)], u: [self('critnext', 2), cp(2)], icon: '🧊' }),
  R({ id: 'r_expose', name: 'Expose Armor', tree: 'assa', type: 'skill', rarity: 'uncommon', cost: 0, kw: ['finisher'], lvl: 12, a: [app('vuln', 0, 'enemy', per('cp', 1))], u: [app('vuln', 1, 'enemy', per('cp', 1))], text: 'Finisher: Apply 1 Exposed per Combo Point.', icon: '🔓' }),
  R({ id: 'r_vendetta', name: 'Crippling Poison', tree: 'assa', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 22, a: [app('poison', 6), app('weak', 2)], u: [app('poison', 9), app('weak', 2)], icon: '☠️' }),
  // Combat
  R({ id: 'r_gouge', name: 'Gouge', tree: 'combat', type: 'attack', rarity: 'common', cost: 1, a: [dmg(3), app('poly', 1), cp(1)], icon: '👊' }),
  R({ id: 'r_snd', name: 'Slice and Dice', tree: 'combat', type: 'skill', rarity: 'common', cost: 1, uc: 0, kw: ['finisher'], tgt: false,
    text: 'Finisher: For the rest of combat, your Attacks deal +1 damage per Combo Point (does not stack, keeps the highest).',
    a: [fn('snd', (c, ctx) => { c.p.st.snd = Math.max(c.p.st.snd ?? 0, ctx.cp); })], icon: '🗡️' }),
  R({ id: 'r_riposte', name: 'Riposte', tree: 'combat', type: 'attack', rarity: 'common', cost: 1, a: [dmg(5), self('dodge', 1), cp(1)], u: [dmg(7), self('dodge', 1), cp(1)], lvl: 4, icon: '🤺' }),
  R({ id: 'r_evasion', name: 'Evasion', tree: 'combat', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 10, a: [self('dodge', 2)], u: [self('dodge', 3)], kw: ['cooldown'], icon: '🌀' }),
  R({ id: 'r_blade_flurry', name: 'Blade Flurry', tree: 'combat', type: 'skill', rarity: 'uncommon', cost: 1, lvl: 18, a: [self('sweep', 3)], u: [self('sweep', 5)], icon: '⚔️' }),
  R({ id: 'r_adrenaline', name: 'Adrenaline Rush', tree: 'combat', type: 'skill', rarity: 'rare', cost: 0, talent: 'r_combat_cap', a: [res(2), self('adrenaline', 2)], u: [res(2), self('adrenaline', 3)], kw: ['cooldown'], icon: '⚡' }),
  R({ id: 'r_killing', name: 'Blade Dance', tree: 'combat', type: 'attack', rarity: 'rare', cost: 2, lvl: 36, a: [dmg(4, { hits: 4, tgt: 'random' }), cp(2)], u: [dmg(5, { hits: 5, tgt: 'random' }), cp(2)], icon: '🌪️' }),
  R({ id: 'r_sprint', name: 'Sprint', tree: 'combat', type: 'skill', rarity: 'common', cost: 0, a: [draw(2)], u: [draw(3)], kw: ['cooldown'], icon: '👟' }),
  R({ id: 'r_thistle', name: 'Thistle Tea', tree: 'combat', type: 'skill', rarity: 'uncommon', cost: 0, lvl: 26, a: [res(2)], u: [res(3)], kw: ['cooldown'], icon: '🍵' }),
  // Subtlety
  R({ id: 'r_ambush', name: 'Ambush', tree: 'sub', type: 'attack', rarity: 'common', cost: 1, kw: ['opener'], a: [dmg(14), cp(2)], u: [dmg(20), cp(2)], icon: '🌑' }),
  R({ id: 'r_cheap', name: 'Cheap Shot', tree: 'sub', type: 'attack', rarity: 'common', cost: 0, kw: ['opener'], a: [app('stun', 1), cp(2)], icon: '🦶' }),
  R({ id: 'r_backstab', name: 'Backstab', tree: 'sub', type: 'attack', rarity: 'common', cost: 1, tgt: true,
    text: 'Deal 7 damage (double if in Stealth or the target is Stunned). Gain 1 Combo Point.',
    a: [fn('backstab', (c, ctx, up) => {
      const t = ctx.target; if (!t) return;
      const bonus = c.p.st.stealth || t.st.stun || t.st.poly ? 2 : 1;
      c.hit(c.calcCardHit(ctx.def, (up ? 10 : 7) * bonus, 'physical', t, false));
      c.gainCp(1);
    })], icon: '🗡️' }),
  R({ id: 'r_hemo', name: 'Hemorrhage', tree: 'sub', type: 'attack', rarity: 'uncommon', cost: 1, lvl: 14, a: [dmg(5), app('mark', 2), cp(1)], u: [dmg(7), app('mark', 3), cp(1)], icon: '🩸' }),
  R({ id: 'r_ghostly', name: 'Ghostly Strike', tree: 'sub', type: 'attack', rarity: 'uncommon', cost: 1, lvl: 20, a: [dmg(6), self('dodge', 1), cp(1)], u: [dmg(9), self('dodge', 1), cp(1)], icon: '👻' }),
  R({ id: 'r_kidney', name: 'Kidney Shot', tree: 'sub', type: 'skill', rarity: 'uncommon', cost: 1, kw: ['finisher'], lvl: 24, a: [app('stun', 1), app('weak', 0, 'enemy', per('cp', 1))], text: 'Finisher: Stun the target and apply 1 Weakened per Combo Point.', icon: '🦵' }),
  R({ id: 'r_vanish', name: 'Vanish', tree: 'sub', type: 'skill', rarity: 'rare', cost: 1, lvl: 30, a: [self('stealth', 1), blk(8)], u: [self('stealth', 1), blk(12)], kw: ['cooldown'], icon: '💨' }),
  R({ id: 'r_premed', name: 'Premeditation', tree: 'sub', type: 'skill', rarity: 'rare', cost: 0, talent: 'r_sub_cap', a: [self('stealth', 1), cp(2)], u: [self('stealth', 1), cp(3)], kw: ['cooldown'], icon: '🧠' }),
];
