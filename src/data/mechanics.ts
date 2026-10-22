// Class mechanics: Paladin Seals, Shaman Totems, Druid Forms, Hunter/Warlock pets and aura status hooks.
import type { Combat } from '../engine/combat';
import type { ClassId, Enemy, Form, HookSet, PlayCtx, School, Unit } from '../engine/types';

export interface SealDef {
  name: string; icon: string; desc: string;
  onAttack?: (c: Combat, ctx: PlayCtx) => void;
  judge: (c: Combat, t: Enemy, up: boolean) => void;
}

const holyHit = (c: Combat, t: Unit, n: number) => {
  const d = c.calcCardHit({ id: 'judgement', name: 'Judgement', cls: 'paladin', type: 'attack', rarity: 'special', cost: 0, school: 'holy', a: [], icon: '' }, n, 'holy', t, false);
  c.hit(d);
};

export const SEALS: Record<string, SealDef> = {
  righteousness: {
    name: 'Seal of Righteousness', icon: '🟡', desc: 'Your Attacks deal 3 extra Holy damage. Judgement: 8 Holy damage.',
    onAttack: (c, ctx) => { const t = ctx.target ?? c.randomEnemy(); if (t && !t.dead) c.effectDamage(t, 3 + Math.floor(c.sp / 2), 'holy', 'effect'); },
    judge: (c, t, up) => holyHit(c, t, up ? 11 : 8),
  },
  crusader: {
    name: 'Seal of the Crusader', icon: '🔴', desc: 'Your first Attack each turn grants 1 Mana and 1 Attack Power. Judgement: apply 2 Exposed.',
    onAttack: c => { if (c.attacksThisTurn === 1) { c.gainRes(1); c.applyStatus(c.p, 'str', 1, true); } },
    judge: (c, t, up) => { c.applyStatus(t, 'vuln', up ? 3 : 2, true); holyHit(c, t, 3); },
  },
  command: {
    name: 'Seal of Command', icon: '🟣', desc: 'Your Attacks deal an extra 50% of their damage as Holy. Judgement: 12 Holy damage, double vs. Stunned.',
    onAttack: (c, ctx) => { const t = ctx.target ?? c.randomEnemy(); if (t && !t.dead && ctx.dealt > 0) c.effectDamage(t, Math.ceil(ctx.dealt * 0.5), 'holy', 'effect'); },
    judge: (c, t, up) => holyHit(c, t, (up ? 16 : 12) * (t.st.stun || t.st.poly ? 2 : 1)),
  },
  light: {
    name: 'Seal of Light', icon: '🌟', desc: 'Your Attacks heal you 2. Judgement: your hits against the target heal you 2.',
    onAttack: c => c.heal(2),
    judge: (c, t, up) => { c.applyStatus(t, 'jlight', up ? 3 : 2, true); holyHit(c, t, 4); },
  },
  wisdom: {
    name: 'Seal of Wisdom', icon: '🔵', desc: 'Your first Attack each turn draws a card. Judgement: gain 2 Mana.',
    onAttack: c => { if (c.attacksThisTurn === 1) c.drawCards(1); },
    judge: (c, t, up) => { c.gainRes(up ? 3 : 2); holyHit(c, t, 4); },
  },
  justice: {
    name: 'Seal of Justice', icon: '🟠', desc: 'Your Attacks apply 1 Weakened. Judgement: Stun the target.',
    onAttack: (c, ctx) => { const t = ctx.target; if (t && !t.dead) c.applyStatus(t, 'weak', 1, true); },
    judge: (c, t) => { c.applyStatus(t, 'stun', 1, true); holyHit(c, t, 4); },
  },
};

export interface TotemDef { name: string; element: 'earth' | 'fire' | 'water' | 'air'; icon: string; desc: string; hooks: HookSet; onPlace?: (c: Combat) => void }

export const TOTEMS: Record<string, TotemDef> = {
  searing: { name: 'Searing Totem', element: 'fire', icon: '🔥', desc: 'End of turn: deal 4 Fire damage to a random enemy.',
    hooks: { onTurnEnd: c => { const t = c.randomEnemy(); if (t) c.effectDamage(t, 4 + Math.floor(c.sp / 2), 'fire', 'effect'); } } },
  magma: { name: 'Magma Totem', element: 'fire', icon: '🌋', desc: 'End of turn: deal 2 Fire damage to ALL enemies.',
    hooks: { onTurnEnd: c => { for (const e of c.alive()) c.effectDamage(e, 2 + Math.floor(c.sp / 3), 'fire', 'effect'); } } },
  firenova: { name: 'Fire Nova Totem', element: 'fire', icon: '💥', desc: 'End of turn: apply 2 Burning to ALL enemies.',
    hooks: { onTurnEnd: c => { for (const e of c.alive()) c.applyStatus(e, 'burn', 2, true); } } },
  strength: { name: 'Strength of Earth Totem', element: 'earth', icon: '🗿', desc: 'Your physical damage is increased by 2.',
    hooks: { outDmg: (c, _n, d) => { if (d.school === 'physical' && (d.src === 'card' || d.src === 'pet')) d.amt += 2; } } },
  stoneskin: { name: 'Stoneskin Totem', element: 'earth', icon: '🪨', desc: 'End of turn: gain 4 Block.',
    hooks: { onTurnEnd: c => c.gainBlock(4, undefined, true) } },
  earthbind: { name: 'Earthbind Totem', element: 'earth', icon: '🕸️', desc: 'End of turn: apply 1 Weakened to a random enemy.',
    hooks: { onTurnEnd: c => { const t = c.randomEnemy(); if (t) c.applyStatus(t, 'weak', 1, true); } } },
  healingstream: { name: 'Healing Stream Totem', element: 'water', icon: '⛲', desc: 'End of turn: heal 3.',
    hooks: { onTurnEnd: c => c.heal(3 + Math.floor(c.sp / 3)) } },
  manaspring: { name: 'Mana Spring Totem', element: 'water', icon: '💠', desc: 'Gain 1 extra Mana each turn.',
    hooks: { resBonus: () => 1 } },
  manatide: { name: 'Mana Tide Totem', element: 'water', icon: '🌊', desc: 'Gain 1 extra Mana and draw 1 extra card each turn.',
    hooks: { resBonus: () => 1, drawBonus: () => 1 } },
  windfury: { name: 'Windfury Totem', element: 'air', icon: '🌪️', desc: 'Your first Attack each turn strikes again for 60% of its damage +2.',
    hooks: { onCardPlayed: (c, _n, def, ctx) => {
      if (def.type === 'attack' && c.attacksThisTurn === 1) { const t = ctx.target && !ctx.target.dead ? ctx.target : c.randomEnemy(); if (t) c.effectDamage(t, Math.floor(ctx.dealt * 0.6) + 2, 'physical', 'effect'); }
    } } },
  grace: { name: 'Grace of Air Totem', element: 'air', icon: '🍃', desc: 'Your physical attacks have +15% critical strike chance.',
    hooks: { critMod: (_c, _n, d) => (d.school === 'physical' ? 15 : 0) } },
};

export interface FormDef { name: string; icon: string; desc: string; hooks: HookSet; onEnter?: (c: Combat) => void }

export const FORMS: Record<Form, FormDef> = {
  caster: { name: 'Caster Form', icon: '🧙', desc: 'Your natural form.', hooks: {} },
  bear: { name: 'Bear Form', icon: '🐻', desc: 'Your Attacks also grant 2 Block. Take 10% less damage.',
    hooks: {
      onCardPlayed: (c, _n, def) => { if (def.type === 'attack') c.gainBlock(2, undefined, true); },
      inDmg: (_c, _n, d) => { d.amt *= 0.9; },
    } },
  cat: { name: 'Cat Form', icon: '🐆', desc: 'Your Attacks deal +1 damage and have +10% crit.',
    hooks: {
      outDmg: (_c, _n, d) => { if (d.src === 'card' && d.isAttack) d.amt += 1; },
      critMod: (_c, _n, d) => (d.school === 'physical' ? 10 : 0),
    } },
  moonkin: { name: 'Moonkin Form', icon: '🦉', desc: 'Your spells deal +3 damage and have +10% crit.',
    hooks: {
      outDmg: (_c, _n, d) => { if (d.src === 'card' && d.school !== 'physical') d.amt += 3; },
      critMod: (_c, _n, d) => (d.school !== 'physical' ? 10 : 0),
    } },
};

export interface PetDef { name: string; dmg: number; icon: string; school?: School; aoe?: boolean; desc: string; onAttack?: (c: Combat, t: Unit) => void; onSummon?: (c: Combat) => void }

export const PETS: Record<string, PetDef> = {
  wolf: { name: 'Wolf', dmg: 3, icon: '🐺', desc: 'Bites for 3 and applies 1 Weakened.', onAttack: (c, t) => { if (!t.dead) c.applyStatus(t, 'weak', 1, true); } },
  cat: { name: 'Cat', dmg: 5, icon: '🐈', desc: 'Claws for 5.' },
  boar: { name: 'Boar', dmg: 2, icon: '🐗', desc: 'Gores for 2 and grants you 3 Block.', onAttack: c => c.gainBlock(3, undefined, true) },
  raptor: { name: 'Raptor', dmg: 2, icon: '🦖', desc: 'Rends for 2 and applies 2 Bleed.', onAttack: (c, t) => { if (!t.dead) c.applyStatus(t, 'bleed', 2, true); } },
  imp: { name: 'Imp', dmg: 3, icon: '👺', school: 'fire', desc: 'Casts Firebolt for 3 Fire damage.' },
  voidwalker: { name: 'Voidwalker', dmg: 1, icon: '🌀', school: 'shadow', desc: 'Torments for 1 and grants you 4 Block.', onAttack: c => c.gainBlock(4, undefined, true) },
  succubus: { name: 'Succubus', dmg: 5, icon: '💋', school: 'shadow', desc: 'Lashes for 5 Shadow damage and applies 1 Exposed.', onAttack: (c, t) => { if (!t.dead) c.applyStatus(t, 'vuln', 1, true); } },
  felhunter: { name: 'Felhunter', dmg: 3, icon: '🐕', school: 'shadow', desc: 'Bites for 3 and devours one of your debuffs.',
    onAttack: c => { for (const s of ['weak', 'vuln', 'frail', 'poison', 'burn', 'bleed', 'affliction']) if (c.p.st[s]) { delete c.p.st[s]; break; } } },
  infernal: { name: 'Infernal', dmg: 5, icon: '☄️', school: 'fire', aoe: true, desc: 'Immolation: 5 Fire damage to ALL enemies.' },
};

export const HUNTER_PETS = ['wolf', 'cat', 'boar', 'raptor'];

const isSpellHit = (d: { src: string; school: School }) => d.src === 'card' && d.school !== 'physical';

export const STATUS_HOOKS: Record<string, HookSet> = {
  deadlyPoison: { onCardPlayed: (c, n, def, ctx) => { if (def.type === 'attack' && ctx.target && !ctx.target.dead) c.applyStatus(ctx.target, 'poison', n, true); } },
  instantPoison: { onCardPlayed: (c, n, def, ctx) => { if (def.type === 'attack' && ctx.target && !ctx.target.dead) c.effectDamage(ctx.target, n, 'nature', 'effect'); } },
  flametongue: { onCardPlayed: (c, n, def, ctx) => { if (def.type === 'attack') { const t = ctx.target && !ctx.target.dead ? ctx.target : c.randomEnemy(); if (t) c.effectDamage(t, n + Math.floor(c.sp / 3), 'fire', 'effect'); } } },
  rfury: { onHit: (c, n, d, dealt) => { if (d.school === 'holy' && dealt > 0) c.gainBlock(n, undefined, true); } },
  vamp: { onHit: (c, n, d, dealt) => { if (d.school === 'shadow' && dealt > 0) { const h = Math.floor(dealt * 0.25 * n); if (h) c.heal(h); } } },
  shadowform: { outDmg: (_c, _n, d) => { if (d.school === 'shadow') d.amt *= 1.25; }, inDmg: (_c, _n, d) => { d.amt *= 0.85; } },
  arcanePower: { outDmg: (_c, n, d) => { if (isSpellHit(d)) d.amt += 4 * n; }, onTurnStart: (c, n) => c.loseHp(2 * n) },
  soulLink: { inDmg: (c, _n, d) => { if (c.p.pet) d.amt *= 0.7; } },
  mageArmor: { drawBonus: (_c, n) => n },
  deathwish: { outDmg: (_c, _n, d) => { if (d.src === 'card') d.amt *= 1.3; }, inDmg: (_c, _n, d) => { d.amt *= 1.2; } },
  trueshot: { outDmg: (_c, n, d) => { if ((d.src === 'card' && d.isAttack) || d.src === 'pet') d.amt += n; } },
};

export const CLASS_HOOKS: Partial<Record<ClassId, HookSet>> = {
  warlock: {
    onKill: (c, _n, e) => { if (e.st.affliction || e.st.siphon || e.st.doom) c.gainShards(1); },
  },
};

export const CLASS_MECHANIC_TEXT: Record<ClassId, string> = {
  warrior: 'Rage: gain 3 Rage each turn and 1 whenever an enemy hits you. Unspent Rage carries over (max 10).',
  paladin: 'Seals: keep one Seal active to empower your Attacks, then Judge it for a burst effect.',
  hunter: 'Pet: your loyal companion attacks at the end of each of your turns, preferring Marked targets.',
  rogue: 'Combo Points & Stealth: build Combo Points and spend them on Finishers. You begin each fight in Stealth, enabling Openers.',
  priest: 'Shields & Light: Power Word: Shield absorbs damage across turns. Master Holy, Discipline or Shadow.',
  shaman: 'Totems: place one totem of each element (Earth, Fire, Water, Air). Each pulses every turn.',
  mage: 'Schools of magic: stack Chill to Freeze foes, set them Burning, or overwhelm with Arcane.',
  warlock: 'Demons & Soul Shards: summon demons to fight for you. Enemies that die while afflicted yield Soul Shards.',
  druid: 'Shapeshifting: Bear Form tanks, Cat Form builds Combo Points. Casting caster spells shifts you back.',
};
