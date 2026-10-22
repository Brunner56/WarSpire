// Status effect definitions (buffs, debuffs, auras) shared by players and enemies.
import type { HookSet } from './types';

export interface StatusDef {
  name: string;
  icon: string;
  debuff?: boolean;
  desc: (n: number) => string;
  /** 'turn' = decrements by 1 at end of owner's turn; 'temp' = removed at end of owner's turn */
  decay?: 'turn' | 'temp' | 'start';
  hooks?: HookSet;
  hidden?: boolean;
}

export const STATUSES: Record<string, StatusDef> = {
  absorb: { name: 'Shield', icon: '🔵', desc: n => `Absorbs the next ${n} damage. Does not expire.` },
  str: { name: 'Attack Power', icon: '💪', desc: n => `Physical attacks deal ${n >= 0 ? '+' : ''}${n} damage.` },
  sp: { name: 'Spell Power', icon: '✨', desc: n => `Spells deal and heal ${n >= 0 ? '+' : ''}${n}.` },
  dex: { name: 'Defense', icon: '🛡️', desc: n => `Gain ${n >= 0 ? '+' : ''}${n} Block from cards.` },
  empower: { name: 'Empowered', icon: '🔆', decay: 'temp', desc: n => `All damage +${n} this turn.` },
  vuln: { name: 'Exposed', icon: '🎯', debuff: true, decay: 'turn', desc: n => `Takes 50% more damage for ${n} turn(s).` },
  weak: { name: 'Weakened', icon: '🥀', debuff: true, decay: 'turn', desc: n => `Deals 25% less damage for ${n} turn(s).` },
  frail: { name: 'Sundered', icon: '💔', debuff: true, decay: 'turn', desc: n => `Gains 25% less Block for ${n} turn(s).` },
  poison: { name: 'Poison', icon: '🧪', debuff: true, desc: n => `Takes ${n} Nature damage at turn start, then reduces by 1.` },
  bleed: { name: 'Bleed', icon: '🩸', debuff: true, desc: n => `Takes ${n} Physical damage at turn start, then reduces by 1.` },
  burn: { name: 'Burning', icon: '🔥', debuff: true, desc: n => `Takes ${n} Fire damage at turn start, then halves.` },
  affliction: { name: 'Affliction', icon: '🟣', debuff: true, desc: n => `Takes ${n} Shadow damage at turn start, then reduces by 1.` },
  siphon: { name: 'Siphon Life', icon: '🫀', debuff: true, desc: n => `Takes ${n} Shadow damage at turn start and heals the caster. Reduces by 1.` },
  doom: { name: 'Curse of Doom', icon: '☠️', debuff: true, desc: n => `In ${n} turn(s), takes 40 Shadow damage.` },
  chill: { name: 'Chilled', icon: '❄️', debuff: true, desc: n => `At 4 stacks becomes Frozen (skips its next action). ${n}/4` },
  stun: { name: 'Stunned', icon: '💫', debuff: true, desc: () => `Skips its next action.` },
  poly: { name: 'Polymorphed', icon: '🐑', debuff: true, desc: () => `Skips its next action. Breaks if damaged.` },
  mark: { name: "Hunter's Mark", icon: '🎯', debuff: true, desc: n => `Takes +${n} damage from every hit.` },
  firevuln: { name: 'Fire Vulnerability', icon: '♨️', debuff: true, desc: n => `Takes +${n} Fire damage per hit.` },
  regen: { name: 'Regeneration', icon: '🌿', decay: 'turn', desc: n => `Heals ${n} at end of turn, then reduces by 1.` },
  thorns: { name: 'Thorns', icon: '🌵', desc: n => `Attackers take ${n} damage.` },
  dodge: { name: 'Dodge', icon: '💨', desc: n => `Avoids the next ${n} attack hit(s).` },
  invuln: { name: 'Invulnerable', icon: '🔆', decay: 'start', desc: () => `Takes no damage until next turn.` },
  fortify: { name: 'Fortified', icon: '🏰', desc: n => `Gains ${n} Block at end of turn.` },
  ritual: { name: 'Frenzy', icon: '😡', desc: n => `Gains ${n} Attack Power at end of turn.` },
  enrage: { name: 'Enrage', icon: '💢', desc: n => `Gains ${n} Attack Power when damaged.` },
  airborne: { name: 'Airborne', icon: '🪽', desc: () => `Takes 50% less Physical damage.` },
  immune: { name: 'Boss', icon: '👑', desc: () => `Immune to Stun, Polymorph and Freeze (receives Weakened instead).` },
  stealth: { name: 'Stealth', icon: '🌑', desc: () => `Enables Openers. Broken when you play an Attack.` },
  feared: { name: 'Feared', icon: '😱', debuff: true, desc: n => `Draw ${n} fewer card(s) next turn.` },
  dazed: { name: 'Dazed', icon: '😵', debuff: true, desc: n => `Gain ${n} less resource next turn.` },
  clearcast: { name: 'Clearcasting', icon: '💠', desc: n => `Your next ${n} spell(s) cost 0.` },
  critnext: { name: 'Focused', icon: '🎯', desc: n => `Your next ${n} damaging card(s) critically strike.` },
  sweep: { name: 'Sweeping Strikes', icon: '🌀', desc: n => `Your next ${n} attack(s) also hit another enemy.` },
  snd: { name: 'Slice and Dice', icon: '🗡️', desc: n => `Attacks deal +${n} damage.` },
  consecration: { name: 'Consecration', icon: '✴️', desc: n => `End of turn: deal ${n} Holy damage to ALL enemies, then halves.` },
  adrenaline: { name: 'Adrenaline Rush', icon: '⚡', decay: 'turn', desc: n => `Gain 1 extra Energy at start of turn (${n} turns).` },
  rapid: { name: 'Rapid Fire', icon: '🏹', decay: 'temp', desc: () => `Attacks cost 1 less this turn.` },
  trapFreeze: { name: 'Freezing Trap', icon: '🧊', desc: () => `The next enemy that attacks you is Stunned.` },
  trapImmo: { name: 'Immolation Trap', icon: '🔥', desc: n => `The next enemy that attacks you gains ${n} Burning.` },
  petpow: { name: 'Pet Power', icon: '🐾', desc: n => `Your pet deals +${n} damage.` },
  jlight: { name: 'Judgement of Light', icon: '🌟', debuff: true, desc: n => `Your hits against this enemy heal you ${n}.` },
  maxhp: { name: 'Fortitude', icon: '❤️', desc: n => `+${n} Max HP this combat.`, hidden: true },
  reincarnate: { name: 'Reincarnation', icon: '🪶', desc: n => `The next time you would die, revive with ${n} HP.` },
  fearward: { name: 'Fear Ward', icon: '🛐', desc: () => `Immune to Fear and Daze.` },
  // ---- auras with hooks (filled in by mechanics.ts) ----
  deadlyPoison: { name: 'Deadly Poison', icon: '🟢', desc: n => `Your attacks apply ${n} Poison.` },
  instantPoison: { name: 'Instant Poison', icon: '🧴', desc: n => `Your attacks deal ${n} extra Nature damage.` },
  rfury: { name: 'Righteous Fury', icon: '🔆', desc: n => `Whenever you deal Holy damage, gain ${n} Block.` },
  vamp: { name: 'Vampiric Embrace', icon: '🦇', desc: n => `Heal for ${n * 25}% of Shadow damage you deal.` },
  shadowform: { name: 'Shadowform', icon: '👤', desc: () => `Shadow damage +25%. Take 15% less damage.` },
  arcanePower: { name: 'Arcane Power', icon: '🔮', desc: n => `Spells deal +${n * 4} damage. Lose ${n * 2} HP at start of turn.` },
  soulLink: { name: 'Soul Link', icon: '🔗', desc: () => `Take 30% less damage while you have a demon.` },
  mageArmor: { name: 'Mage Armor', icon: '🧥', desc: n => `Draw ${n} extra card(s) each turn.` },
  flametongue: { name: 'Flametongue', icon: '🗡️', desc: n => `Your attacks deal ${n} extra Fire damage.` },
  lightningShield: { name: 'Lightning Shield', icon: '⚡', desc: n => `Attackers take ${n} Nature damage.` },
  deathwish: { name: 'Death Wish', icon: '☠️', desc: () => `Deal 30% more damage, take 20% more damage.` },
  trueshot: { name: 'Trueshot Aura', icon: '🏹', desc: n => `Attacks deal +${n} damage and your pet +${n}.` },
  moonkinAura: { name: 'Moonkin Aura', icon: '🦉', desc: () => `Spells have +10% critical strike chance.` },
  retribution: { name: 'Retribution Aura', icon: '☀️', desc: n => `Attackers take ${n} Holy damage.` },
};

export function statusDef(id: string): StatusDef {
  return STATUSES[id] ?? { name: id, icon: '❔', desc: n => `${id} ${n}` };
}

export const DEBUFF_IDS = Object.keys(STATUSES).filter(k => STATUSES[k].debuff);
