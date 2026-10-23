// Talent trees: 3 per class, 6 talents per tree. Capstones grant signature abilities.
import type { ClassId, HookSet } from '../engine/types';
import { P, all } from './passives';

export interface TalentDef {
  id: string;
  cls: ClassId;
  tree: string;
  tier: number;
  max: number;
  name: string;
  icon: string;
  desc: (r: number) => string;
  hooks?: HookSet;
  card?: string;
}

export const TIER_REQ = [0, 3, 6, 10];
export const talentPointsForLevel = (lvl: number) => Math.max(0, Math.floor((lvl - 8) / 2));

const T = (cls: ClassId, tree: string, tier: number, max: number, id: string, name: string, icon: string, desc: (r: number) => string, hooks?: HookSet, card?: string): TalentDef =>
  ({ cls, tree, tier, max, id, name, icon, desc, hooks, card });
const cap = (cls: ClassId, tree: string, id: string, name: string, icon: string, card: string, extra?: HookSet, extraDesc = ''): TalentDef =>
  T(cls, tree, 3, 1, id, name, icon, () => `Learn ${name}: it is added to your deck at the start of every run.${extraDesc}`, extra, card);

const phys = (s: string) => s === 'physical';
const spell = (s: string) => s !== 'physical';

export const TALENTS: TalentDef[] = [
  // ================= WARRIOR =================
  T('warrior', 'arms', 0, 3, 'w_a1', 'Improved Rend', '🩸', r => `Bleed you apply is increased by ${r}.`, P.applyPlus('bleed', 1)),
  T('warrior', 'arms', 0, 3, 'w_a2', 'Deflection', '🛡️', r => `Start each combat with ${r * 2} Block.`, P.startBlock(2)),
  T('warrior', 'arms', 1, 3, 'w_a3', 'Tactical Mastery', '🎓', r => `Keep up to ${r} more unspent Rage between turns.`,
    { onCombatStart: (c, n) => { c.mem.rageKeep = n; } }),
  T('warrior', 'arms', 1, 2, 'w_a4', 'Impale', '🗡️', r => `Critical strikes deal ${r * 15}% more damage.`, P.critDmg(15)),
  T('warrior', 'arms', 2, 3, 'w_a5', 'Deep Wounds', '🩸', r => `When an Attack crits, apply ${r * 2} Bleed.`, P.critApply('bleed', 2, phys)),
  cap('warrior', 'arms', 'w_arms_cap', 'Mortal Strike', '💀', 'w_mortal'),
  T('warrior', 'fury', 0, 3, 'w_f1', 'Cruelty', '😈', r => `+${r * 3}% critical strike chance with Attacks.`, P.crit(phys, 3)),
  T('warrior', 'fury', 0, 3, 'w_f2', 'Unbridled Wrath', '💢', r => `${r * 33}% chance when an Attack crits to lose 2 HP and gain 1 Rage (once per turn).`,
    { onCrit: (c, n, d) => { if (d.src === 'card' && c.mem.wrathTurn !== c.turn && c.rng.next() * 100 < 33 * n) { c.mem.wrathTurn = c.turn; c.loseHp(2); c.gainRes(1); } } }),
  T('warrior', 'fury', 1, 2, 'w_f3', 'Enrage', '😡', r => `The first ${r} time(s) you take unblocked damage each combat, gain 1 Attack Power.`,
    { onHurt: (c, n, dealt) => { if (dealt > 0 && (c.mem.enrage ?? 0) < n) { c.mem.enrage = (c.mem.enrage ?? 0) + 1; c.applyStatus(c.p, 'str', 1, true); } } }),
  T('warrior', 'fury', 1, 2, 'w_f4', 'Improved Cleave', '🪓', r => `Cleave and Whirlwind deal +${r * 2} damage.`, P.dmgCards(['w_cleave', 'w_whirlwind'], 2)),
  T('warrior', 'fury', 2, 3, 'w_f5', 'Flurry', '🌪️', r => `Your third and later Attacks each turn deal +${r} damage.`,
    { outDmg: (c, n, d) => { if (d.src === 'card' && d.isAttack && c.attacksThisTurn >= 2) d.amt += n; } }),
  cap('warrior', 'fury', 'w_fury_cap', 'Bloodthirst', '🩸', 'w_bloodthirst'),
  T('warrior', 'prot', 0, 3, 'w_p1', 'Shield Specialization', '🛡️', r => `Cards that grant Block grant ${r} more.`, P.block(1)),
  T('warrior', 'prot', 0, 3, 'w_p2', 'Anticipation', '🧱', r => `+${r * 2} Stamina.`, P.stat('sta', 2)),
  T('warrior', 'prot', 1, 3, 'w_p3', 'Toughness', '🪨', r => `+${r * 4} Armor.`, P.stat('armor', 4)),
  T('warrior', 'prot', 1, 2, 'w_p4', 'Improved Revenge', '↩️', r => `When you take unblocked damage, gain ${r * 2} Block (once per turn).`,
    { onHurt: (c, n, dealt) => { if (dealt > 0 && c.mem.revTurn !== c.turn) { c.mem.revTurn = c.turn; c.gainBlock(2 * n, undefined, true); } } }),
  T('warrior', 'prot', 2, 3, 'w_p5', 'Defiance', '🏰', r => `Start each turn with ${r * 2} Block.`, P.turnBlock(2)),
  cap('warrior', 'prot', 'w_prot_cap', 'Shield Slam', '🛡️', 'w_shield_slam'),

  // ================= PALADIN =================
  T('paladin', 'holy', 0, 3, 'p_h1', 'Divine Intellect', '🧠', r => `+${r * 2} Intellect.`, P.stat('int', 2)),
  T('paladin', 'holy', 0, 3, 'p_h2', 'Healing Light', '💛', r => `Healing increased by ${r * 10}%.`, P.healPct(10)),
  T('paladin', 'holy', 1, 3, 'p_h3', 'Illumination', '🌟', r => `${r * 33}% chance to refund 1 Mana when a Holy card crits.`, P.critRes(33)),
  T('paladin', 'holy', 1, 2, 'p_h4', 'Improved Seal of Righteousness', '🟡', r => `Holy damage cards deal +${r * 2} damage.`, P.dmgSchool(['holy'], 2)),
  T('paladin', 'holy', 2, 3, 'p_h5', 'Holy Reach', '☀️', r => `Overhealing deals ${r * 33}% of the excess as Holy damage to a random enemy.`, P.overheal(33)),
  cap('paladin', 'holy', 'p_holy_cap', 'Holy Shock', '⚡', 'p_holy_shock'),
  T('paladin', 'prot', 0, 3, 'p_p1', 'Redoubt', '🛡️', r => `Cards that grant Block grant ${r} more.`, P.block(1)),
  T('paladin', 'prot', 0, 3, 'p_p2', 'Toughness', '🪨', r => `+${r * 4} Armor.`, P.stat('armor', 4)),
  T('paladin', 'prot', 1, 3, 'p_p3', 'Guardian\'s Favor', '🔨', r => `Start each combat with ${r} Retribution Aura.`, P.start('retribution', 1)),
  T('paladin', 'prot', 1, 2, 'p_p4', 'Blessing of Kings', '👑', r => `+${r * 2} Stamina and +${r} Strength.`, all(P.stat('sta', 2), P.stat('str', 1))),
  T('paladin', 'prot', 2, 3, 'p_p5', 'Reckoning', '⚖️', r => `When you take unblocked damage, gain ${r} Attack Power (up to 3 times per combat).`,
    { onHurt: (c, n, dealt) => { if (dealt > 0 && (c.mem.reck ?? 0) < 3) { c.mem.reck = (c.mem.reck ?? 0) + 1; c.applyStatus(c.p, 'str', n, true); } } }),
  cap('paladin', 'prot', 'p_prot_cap', 'Holy Shield', '🛡️', 'p_holy_shield'),
  T('paladin', 'ret', 0, 3, 'p_r1', 'Benediction', '💠', r => `+${r * 3} Strength.`, P.stat('str', 3)),
  T('paladin', 'ret', 0, 3, 'p_r2', 'Improved Judgement', '⚖️', r => `Judgement deals +${r * 5} damage.`, P.dmgCards(['p_judgement', 'judgement'], 5)),
  T('paladin', 'ret', 1, 3, 'p_r3', 'Conviction', '🎯', r => `+${r * 3}% critical strike chance.`, P.crit(() => true, 3)),
  T('paladin', 'ret', 1, 2, 'p_r4', 'Two-Handed Specialization', '🗡️', r => `Attacks deal +${r * 2} damage.`, P.dmgAttack(2)),
  T('paladin', 'ret', 2, 3, 'p_r5', 'Vengeance', '🔥', r => `After you crit, gain ${r} Empowered this turn.`, { onCrit: (c, n, d) => { if (d.src === 'card') c.applyStatus(c.p, 'empower', n, true); } }),
  cap('paladin', 'ret', 'p_ret_cap', 'Repentance', '🙏', 'p_repentance'),

  // ================= HUNTER =================
  T('hunter', 'bm', 0, 3, 'h_b1', 'Endurance Training', '❤️', r => `+${r * 2} Stamina.`, P.stat('sta', 2)),
  T('hunter', 'bm', 0, 3, 'h_b2', 'Unleashed Fury', '🐾', r => `Your pet deals +${r} damage.`, P.pet(1)),
  T('hunter', 'bm', 1, 3, 'h_b3', 'Ferocity', '🦁', r => `Your pet has +${r * 10}% critical strike chance.`, { critMod: (_c, n, d) => (d.src === 'pet' ? 10 * n : 0) }),
  T('hunter', 'bm', 1, 2, 'h_b4', 'Bestial Discipline', '🍖', r => `Start each combat with ${r * 2} Pet Power.`, P.start('petpow', 2)),
  T('hunter', 'bm', 2, 3, 'h_b5', 'Frenzy', '😾', r => `When your pet crits, gain ${r} Attack Power.`, { onCrit: (c, n, d) => { if (d.src === 'pet') c.applyStatus(c.p, 'str', n, true); } }),
  cap('hunter', 'bm', 'h_bm_cap', 'Bestial Wrath', '👹', 'h_bestial'),
  T('hunter', 'mm', 0, 3, 'h_m1', 'Lethal Shots', '🎯', r => `+${r * 3}% critical strike chance.`, P.crit(() => true, 3)),
  T('hunter', 'mm', 0, 3, 'h_m2', 'Improved Hunter\'s Mark', '🔴', r => `Hunter's Mark applies ${r} more.`, P.applyPlus('mark', 1)),
  T('hunter', 'mm', 1, 3, 'h_m3', 'Efficiency', '💧', r => `Gain ${r} extra Mana on your first turn of each combat.`, P.resFirst(1)),
  T('hunter', 'mm', 1, 2, 'h_m4', 'Barrage', '🎆', r => `Multi-Shot and Volley deal +${r * 2} damage.`, P.dmgCards(['h_multi', 'h_volley'], 2)),
  T('hunter', 'mm', 2, 3, 'h_m5', 'Mortal Shots', '💥', r => `Critical strikes deal ${r * 15}% more damage.`, P.critDmg(15)),
  cap('hunter', 'mm', 'h_mm_cap', 'Trueshot Aura', '🏹', 'h_trueshot'),
  T('hunter', 'sv', 0, 3, 'h_s1', 'Monster Slaying', '👹', r => `+${r * 6}% damage against Elites and Bosses.`, { outDmg: (_c, n, d) => { const e = d.target as any; if (e.def && (e.def.elite || e.def.boss)) d.amt *= 1 + 0.06 * n; } }),
  T('hunter', 'sv', 0, 1, 'h_s2', 'Deflection', '💨', () => 'Start each combat with 1 Dodge.', P.start('dodge', 1)),
  T('hunter', 'sv', 1, 3, 'h_s3', 'Clever Traps', '🪤', r => `When a trap triggers, gain ${r * 3} Block.`, { onTurnStart: (c, n) => { if (c.mem.trapUsed) { c.gainBlock(3 * n, undefined, true); c.mem.trapUsed = 0; } } }),
  T('hunter', 'sv', 1, 2, 'h_s4', 'Improved Stings', '🐍', r => `Poison you apply is increased by ${r}.`, P.applyPlus('poison', 1)),
  T('hunter', 'sv', 2, 3, 'h_s5', 'Killer Instinct', '🗡️', r => `+${r} Agility.`, P.stat('agi', 1)),
  cap('hunter', 'sv', 'h_sv_cap', 'Wyvern Sting', '🐉', 'h_wyvern'),

  // ================= ROGUE =================
  T('rogue', 'assa', 0, 3, 'r_a1', 'Malice', '😈', r => `+${r * 5}% critical strike chance.`, P.crit(() => true, 5)),
  T('rogue', 'assa', 0, 3, 'r_a2', 'Vile Poisons', '🧪', r => `Poison you apply is increased by ${r * 2}.`, P.applyPlus('poison', 2)),
  T('rogue', 'assa', 1, 3, 'r_a3', 'Ruthlessness', '🔪', r => `${r * 33}% chance for Finishers to grant 1 Combo Point.`,
    { onCardPlayed: (c, n, def) => { if (def.kw?.includes('finisher') && c.rng.next() * 100 < 33 * n) c.gainCp(1); } }),
  T('rogue', 'assa', 1, 2, 'r_a4', 'Lethality', '💀', r => `Critical strikes deal ${r * 20}% more damage.`, P.critDmg(20)),
  T('rogue', 'assa', 2, 3, 'r_a5', 'Seal Fate', '🎲', r => `${r * 33}% chance to gain 1 Combo Point when you crit.`, { onCrit: (c, n, d) => { if (d.src === 'card' && c.rng.next() * 100 < 33 * n) c.gainCp(1); } }),
  cap('rogue', 'assa', 'r_assa_cap', 'Cold Blood', '🧊', 'r_cold_blood'),
  T('rogue', 'combat', 0, 3, 'r_c1', 'Precision', '🎯', r => `Attacks deal +${r} damage.`, P.dmgAttack(1)),
  T('rogue', 'combat', 0, 3, 'r_c2', 'Lightning Reflexes', '💨', r => `+${r * 2} Agility.`, P.stat('agi', 2)),
  T('rogue', 'combat', 1, 3, 'r_c3', 'Improved Sinister Strike', '🗡️', r => `Sinister Strike deals +${r * 2} damage.`, P.dmgCards(['r_sinister'], 2)),
  T('rogue', 'combat', 1, 2, 'r_c4', 'Endurance', '❤️', r => `+${r * 3} Stamina.`, P.stat('sta', 3)),
  T('rogue', 'combat', 2, 3, 'r_c5', 'Weapon Expertise', '⚔️', r => `+${r * 4}% critical strike chance with Attacks.`, P.crit(phys, 4)),
  cap('rogue', 'combat', 'r_combat_cap', 'Adrenaline Rush', '⚡', 'r_adrenaline'),
  T('rogue', 'sub', 0, 3, 'r_s1', 'Master of Deception', '🌑', r => `Openers deal +${r * 3} damage.`, { outDmg: (_c, n, d) => { if (d.src === 'card' && d.card?.kw?.includes('opener')) d.amt += 3 * n; } }),
  T('rogue', 'sub', 0, 3, 'r_s2', 'Camouflage', '🍃', r => `Start each combat with ${r * 4} Block.`, P.startBlock(4)),
  T('rogue', 'sub', 1, 3, 'r_s3', 'Initiative', '⚡', r => `Start each combat with ${r} Combo Point(s).`, { onCombatStart: (c, n) => c.gainCp(n) }),
  T('rogue', 'sub', 1, 2, 'r_s4', 'Setup', '💨', r => `Start each combat with ${r} Dodge.`, P.start('dodge', 1)),
  T('rogue', 'sub', 2, 3, 'r_s5', 'Opportunity', '🗡️', r => `+${r * 15}% damage against Stunned or Incapacitated enemies.`,
    { outDmg: (_c, n, d) => { if (d.src === 'card' && (d.target.st.stun || d.target.st.poly)) d.amt *= 1 + 0.15 * n; } }),
  cap('rogue', 'sub', 'r_sub_cap', 'Premeditation', '🧠', 'r_premed'),

  // ================= PRIEST =================
  T('priest', 'disc', 0, 3, 'pr_d1', 'Meditation', '🧘', r => `+${r * 2} Spirit.`, P.stat('spi', 2)),
  T('priest', 'disc', 0, 3, 'pr_d2', 'Improved Power Word: Shield', '🔵', r => `Shields you gain are increased by ${r}.`, { blockMod: (_c, n, amt, def) => (def?.id === 'pr_pws' || def?.id === 'pr_barrier' ? amt + n : amt) }),
  T('priest', 'disc', 1, 3, 'pr_d3', 'Mental Agility', '💭', r => `Draw ${r === 3 ? 2 : 1} extra card(s) on your first turn.`, { drawBonus: (c, n) => (c.turn === 1 ? (n === 3 ? 2 : 1) : 0) }),
  T('priest', 'disc', 1, 2, 'pr_d4', 'Mental Strength', '🧠', r => `+${r * 2} Intellect.`, P.stat('int', 2)),
  T('priest', 'disc', 2, 3, 'pr_d5', 'Divine Spirit', '🕊️', r => `Start each combat with ${r * 3} Shield.`, P.start('absorb', 3)),
  cap('priest', 'disc', 'pr_disc_cap', 'Power Infusion', '⚡', 'pr_pi'),
  T('priest', 'holy', 0, 3, 'pr_h1', 'Holy Specialization', '✨', r => `Holy cards deal +${r} damage.`, P.dmgSchool(['holy'], 1)),
  T('priest', 'holy', 0, 3, 'pr_h2', 'Spiritual Healing', '💛', r => `Healing increased by ${r * 10}%.`, P.healPct(10)),
  T('priest', 'holy', 1, 3, 'pr_h3', 'Searing Light', '🔆', r => `Smite and Holy Fire deal +${r * 2} damage.`, P.dmgCards(['pr_smite', 'pr_holy_fire'], 2)),
  T('priest', 'holy', 1, 2, 'pr_h4', 'Spiritual Guidance', '🙏', r => `After each victorious combat, heal ${r * 4}.`, P.postHeal(4)),
  T('priest', 'holy', 2, 3, 'pr_h5', 'Holy Reach', '☀️', r => `Overhealing deals ${r * 33}% of the excess as Holy damage to a random enemy.`, P.overheal(33)),
  cap('priest', 'holy', 'pr_holy_cap', 'Spirit of Redemption', '👼', 'pr_lightwell',
    { onDeath: (c) => { if (c.mem.sor) return false; c.mem.sor = 1; c.p.hp = Math.ceil(c.p.maxHp * 0.3); c.ev({ t: 'text', uid: c.p.uid, text: 'Spirit of Redemption!' }); return true; } },
    ' Also: once per combat, when you would die, return with 30% HP.'),
  T('priest', 'shadow', 0, 3, 'pr_s1', 'Shadow Focus', '🟣', r => `Shadow cards deal +${r} damage.`, P.dmgSchool(['shadow'], 1)),
  T('priest', 'shadow', 0, 3, 'pr_s2', 'Improved Shadow Word: Pain', '🌑', r => `Affliction you apply is increased by ${r}.`, P.applyPlus('affliction', 1)),
  T('priest', 'shadow', 1, 3, 'pr_s3', 'Shadow Weaving', '🕸️', r => `+${r * 8}% damage against enemies with Affliction.`, P.vsStatus('affliction', 8)),
  T('priest', 'shadow', 1, 2, 'pr_s4', 'Darkness', '🌚', r => `Shadow damage +${r * 10}%.`, P.dmgPct(s => s === 'shadow', 10)),
  T('priest', 'shadow', 2, 3, 'pr_s5', 'Blackout', '💫', r => `When you kill an enemy, heal ${r * 3}.`, P.killHeal(3)),
  cap('priest', 'shadow', 'pr_shadow_cap', 'Shadowform', '👤', 'pr_shadowform'),

  // ================= SHAMAN =================
  T('shaman', 'ele', 0, 3, 's_e1', 'Concussion', '⚡', r => `Lightning Bolt, Chain Lightning and shocks deal +${r * 2} damage.`, P.dmgCards(['s_bolt', 's_chain', 's_earth_shock', 's_flame_shock', 's_frost_shock'], 2)),
  T('shaman', 'ele', 0, 3, 's_e2', 'Call of Flame', '🔥', r => `Fire totems and Fire cards deal +${r} damage.`, all(P.dmgSchool(['fire'], 1), { outDmg: (_c, n, d) => { if (d.src === 'effect' && d.school === 'fire') d.amt += n; } })),
  T('shaman', 'ele', 1, 3, 's_e3', 'Elemental Fury', '🌀', r => `Critical strikes deal ${r * 15}% more damage.`, P.critDmg(15)),
  T('shaman', 'ele', 1, 2, 's_e4', 'Elemental Focus', '💠', r => `${r * 40}% chance to gain Clearcasting when a spell crits.`, { onCrit: (c, n, d) => { if (d.src === 'card' && d.school !== 'physical' && c.rng.next() < 0.4 * n) c.applyStatus(c.p, 'clearcast', 1, true); } }),
  T('shaman', 'ele', 2, 3, 's_e5', 'Lightning Mastery', '🌩️', r => `+${r * 4}% spell critical strike chance.`, P.crit(spell, 4)),
  cap('shaman', 'ele', 's_ele_cap', 'Elemental Mastery', '🌀', 's_em'),
  T('shaman', 'enh', 0, 3, 's_n1', 'Ancestral Knowledge', '📜', r => `+${r * 3} Strength.`, P.stat('str', 3)),
  T('shaman', 'enh', 0, 3, 's_n2', 'Shield Specialization', '🛡️', r => `Cards that grant Block grant ${r} more.`, P.block(1)),
  T('shaman', 'enh', 1, 3, 's_n3', 'Flurry', '🌪️', r => `After you crit, gain ${r} Empowered this turn.`, { onCrit: (c, n, d) => { if (d.src === 'card') c.applyStatus(c.p, 'empower', n, true); } }),
  T('shaman', 'enh', 1, 2, 's_n4', 'Elemental Weapons', '🗡️', r => `Start each combat with ${r} Flametongue.`, P.start('flametongue', 1)),
  T('shaman', 'enh', 2, 3, 's_n5', 'Thundering Strikes', '⚡', r => `+${r * 3}% critical strike chance.`, P.crit(() => true, 3)),
  cap('shaman', 'enh', 's_enh_cap', 'Stormstrike', '⛈️', 's_stormstrike'),
  T('shaman', 'resto', 0, 3, 's_r1', 'Tidal Focus', '💧', r => `Healing increased by ${r * 10}%.`, P.healPct(10)),
  T('shaman', 'resto', 0, 3, 's_r2', 'Totemic Focus', '🗿', r => `Gain ${r} extra Mana on your first turn.`, P.resFirst(1)),
  T('shaman', 'resto', 1, 3, 's_r3', 'Healing Way', '🌊', r => `End of turn: heal ${r}.`, P.turnHeal(1)),
  T('shaman', 'resto', 1, 2, 's_r4', 'Restorative Totems', '⛲', r => `Start each combat with a Healing Stream Totem${r > 1 ? ' and Stoneskin Totem' : ''}.`,
    { onCombatStart: (c, n) => { c.p.totems.water = 'healingstream'; if (n > 1) c.p.totems.earth = 'stoneskin'; } }),
  T('shaman', 'resto', 2, 3, 's_r5', 'Purification', '💦', r => `Overhealing deals ${r * 33}% of the excess as Nature damage to a random enemy.`, P.overheal(33, 'nature')),
  cap('shaman', 'resto', 's_resto_cap', 'Mana Tide Totem', '🌊', 's_manatide'),

  // ================= MAGE =================
  T('mage', 'arcane', 0, 3, 'm_a1', 'Arcane Subtlety', '🔮', r => `Arcane cards deal +${r} damage.`, P.dmgSchool(['arcane'], 1)),
  T('mage', 'arcane', 0, 3, 'm_a2', 'Arcane Focus', '🧠', r => `+${r * 2} Intellect.`, P.stat('int', 2)),
  T('mage', 'arcane', 1, 3, 'm_a3', 'Arcane Concentration', '💠', r => `${r * 10}% chance after casting a spell to gain Clearcasting.`, { onCardPlayed: (c, n, def) => { if (def.school && def.school !== 'physical' && c.rng.next() < 0.1 * n) c.applyStatus(c.p, 'clearcast', 1, true); } }),
  T('mage', 'arcane', 1, 2, 'm_a4', 'Arcane Meditation', '🧘', r => `Draw ${r} extra card(s) on your first turn.`, P.drawFirst(1)),
  T('mage', 'arcane', 2, 3, 'm_a5', 'Arcane Instability', '⚡', r => `Spells deal ${r * 5}% more damage and +${r}% crit.`, all(P.dmgPct(spell, 5), P.crit(spell, 1))),
  cap('mage', 'arcane', 'm_arcane_cap', 'Arcane Power', '🔮', 'm_arcane_power'),
  T('mage', 'fire', 0, 3, 'm_f1', 'Improved Fireball', '🔥', r => `Fireball deals +${r * 2} damage.`, P.dmgCards(['m_fireball'], 2)),
  T('mage', 'fire', 0, 3, 'm_f2', 'Ignite', '♨️', r => `Fire crits apply Burning equal to ${r * 20}% of the hit.`, P.ignite(20)),
  T('mage', 'fire', 1, 3, 'm_f3', 'Incinerate', '💥', r => `+${r * 4}% crit chance with Fire spells.`, P.crit(s => s === 'fire', 4)),
  T('mage', 'fire', 1, 2, 'm_f4', 'Burning Soul', '🧡', r => `Burning you apply is increased by ${r * 2}.`, P.applyPlus('burn', 2)),
  T('mage', 'fire', 2, 3, 'm_f5', 'Fire Power', '🔥', r => `Fire damage +${r * 4}%.`, P.dmgPct(s => s === 'fire', 4)),
  cap('mage', 'fire', 'm_fire_cap', 'Combustion', '🔥', 'm_combustion'),
  T('mage', 'frost', 0, 3, 'm_r1', 'Improved Frostbolt', '❄️', r => `Frostbolt deals +${r * 2} damage.`, P.dmgCards(['m_frostbolt'], 2)),
  T('mage', 'frost', 0, 3, 'm_r2', 'Frostbite', '🥶', r => `Frost cards deal +${r} damage. At rank 3, Chill you apply is increased by 1.`, all(P.dmgSchool(['frost'], 1), { applyMod: (_c, n, s, amt, t) => (!t.isPlayer && s === 'chill' && n >= 3 ? amt + 1 : amt) })),
  T('mage', 'frost', 1, 3, 'm_r3', 'Shatter', '💎', r => `+${r * 12}% damage against Frozen (Stunned) or Chilled enemies.`, { outDmg: (_c, n, d) => { if (d.src === 'card' && (d.target.st.stun || d.target.st.chill)) d.amt *= 1 + 0.12 * n; } }),
  T('mage', 'frost', 1, 2, 'm_r4', 'Frost Warding', '🧊', r => `Start each combat with ${r * 4} Shield.`, P.start('absorb', 4)),
  T('mage', 'frost', 2, 3, 'm_r5', 'Winter\'s Chill', '🌨️', r => `Start each combat by applying ${r} Chilled to ALL enemies.`, P.startAll('chill', 1)),
  cap('mage', 'frost', 'm_frost_cap', 'Ice Barrier', '🧊', 'm_ice_barrier'),

  // ================= WARLOCK =================
  T('warlock', 'aff', 0, 3, 'l_a1', 'Improved Corruption', '🟪', r => `Affliction you apply is increased by ${r}.`, P.applyPlus('affliction', 1)),
  T('warlock', 'aff', 0, 3, 'l_a2', 'Suppression', '🌑', r => `Shadow cards deal +${r} damage.`, P.dmgSchool(['shadow'], 1)),
  T('warlock', 'aff', 1, 3, 'l_a3', 'Improved Life Tap', '🩸', r => `Life Tap and Dark Pact draw ${r === 3 ? 2 : 1} extra card(s).`, { onCardPlayed: (c, n, def) => { if (def.id === 'l_tap' || def.id === 'l_dark_pact') c.drawCards(n === 3 ? 2 : 1); } }),
  T('warlock', 'aff', 1, 2, 'l_a4', 'Fel Concentration', '🫀', r => `Siphon Life applied is increased by ${r * 2}.`, P.applyPlus('siphon', 2)),
  T('warlock', 'aff', 2, 3, 'l_a5', 'Nightfall', '🌙', r => `Each Affliction tick has ${r * 10}% chance to grant Clearcasting.`,
    { onHit: (c, n, d) => { if (d.src === 'dot' && d.school === 'shadow' && c.rng.next() < 0.1 * n) c.applyStatus(c.p, 'clearcast', 1, true); } }),
  cap('warlock', 'aff', 'l_aff_cap', 'Dark Pact', '🤝', 'l_dark_pact'),
  T('warlock', 'demo', 0, 3, 'l_d1', 'Demonic Embrace', '❤️', r => `+${r * 3} Stamina.`, P.stat('sta', 3)),
  T('warlock', 'demo', 0, 3, 'l_d2', 'Unholy Power', '👺', r => `Your demons deal +${r * 2} damage.`, P.pet(2)),
  T('warlock', 'demo', 1, 3, 'l_d3', 'Fel Domination', '⚡', r => `Your first Summon each combat costs 0. Start each combat with ${r} Pet Power.`,
    all(P.start('petpow', 1), { costMod: (c, _n, def) => (def.a.some(a => a.k === 'pet') && !c.mem.feldom ? -9 : 0), onCardPlayed: (c, _n, def) => { if (def.a.some(a => a.k === 'pet')) c.mem.feldom = 1; } })),
  T('warlock', 'demo', 1, 2, 'l_d4', 'Master Summoner', '🌀', r => `Start each combat with your Imp already summoned${r > 1 ? ' and 4 Shield' : ''}.`,
    { onCombatStart: (c, n) => { if (!c.p.pet) c.p.pet = { id: 'imp', name: 'Imp', dmg: 3, icon: '👺' }; if (n > 1) c.applyStatus(c.p, 'absorb', 4, true); } }),
  T('warlock', 'demo', 2, 3, 'l_d5', 'Master Demonologist', '😈', r => `While you have a demon, take ${r * 5}% less damage.`, { inDmg: (c, n, d) => { if (c.p.pet) d.amt *= 1 - 0.05 * n; } }),
  cap('warlock', 'demo', 'l_demo_cap', 'Soul Link', '🔗', 'l_soul_link'),
  T('warlock', 'destro', 0, 3, 'l_x1', 'Improved Shadow Bolt', '🟣', r => `Shadow Bolt deals +${r * 2} damage.`, P.dmgCards(['l_bolt'], 2)),
  T('warlock', 'destro', 0, 3, 'l_x2', 'Bane', '🔥', r => `Fire cards deal +${r * 2} damage.`, P.dmgSchool(['fire'], 2)),
  T('warlock', 'destro', 1, 3, 'l_x3', 'Devastation', '💥', r => `+${r * 4}% spell critical strike chance.`, P.crit(spell, 4)),
  T('warlock', 'destro', 1, 2, 'l_x4', 'Aftermath', '🌋', r => `Burning you apply is increased by ${r * 2}.`, P.applyPlus('burn', 2)),
  T('warlock', 'destro', 2, 3, 'l_x5', 'Ruin', '☄️', r => `Critical strikes deal ${r * 20}% more damage.`, P.critDmg(20)),
  cap('warlock', 'destro', 'l_destro_cap', 'Conflagrate', '💥', 'l_conflag'),

  // ================= DRUID =================
  T('druid', 'balance', 0, 3, 'd_b1', 'Improved Wrath', '🌿', r => `Wrath and Starfire deal +${r * 3} damage.`, P.dmgCards(['d_wrath', 'd_starfire'], 3)),
  T('druid', 'balance', 0, 3, 'd_b2', 'Nature\'s Grasp', '🌱', r => `Start each combat with ${r * 2} Thorns.`, P.start('thorns', 2)),
  T('druid', 'balance', 1, 3, 'd_b3', 'Moonfury', '🌙', r => `Spells deal ${r * 8}% more damage.`, P.dmgPct(spell, 8)),
  T('druid', 'balance', 1, 2, 'd_b4', 'Nature\'s Grace', '💫', r => `After a spell crits, gain ${r} Mana (once per turn).`, { onCrit: (c, n, d) => { if (d.src === 'card' && d.school !== 'physical' && c.mem.ngTurn !== c.turn) { c.mem.ngTurn = c.turn; c.gainRes(n); } } }),
  T('druid', 'balance', 2, 3, 'd_b5', 'Vengeance', '⭐', r => `Critical strikes deal ${r * 15}% more damage.`, P.critDmg(15)),
  cap('druid', 'balance', 'd_balance_cap', 'Moonkin Form', '🦉', 'd_moonkin'),
  T('druid', 'feral', 0, 3, 'd_f1', 'Ferocity', '🐾', r => `Attacks deal +${r} damage.`, P.dmgAttack(1)),
  T('druid', 'feral', 0, 3, 'd_f2', 'Thick Hide', '🐻', r => `+${r * 5} Armor.`, P.stat('armor', 5)),
  T('druid', 'feral', 1, 3, 'd_f3', 'Sharpened Claws', '🗡️', r => `+${r * 3}% critical strike chance.`, P.crit(phys, 3)),
  T('druid', 'feral', 1, 2, 'd_f4', 'Primal Fury', '😾', r => `When an Attack crits in Cat Form gain 1 Combo Point; in Bear Form gain ${r * 2} Block.`,
    { onCrit: (c, n, d) => { if (d.src !== 'card' || !d.isAttack) return; if (c.p.form === 'cat') c.gainCp(1); else if (c.p.form === 'bear') c.gainBlock(2 * n, undefined, true); } }),
  T('druid', 'feral', 2, 3, 'd_f5', 'Heart of the Wild', '❤️', r => `+${r * 2} Stamina and +${r} Agility.`, all(P.stat('sta', 2), P.stat('agi', 1))),
  cap('druid', 'feral', 'd_feral_cap', 'Leader of the Pack', '🐺', 'd_lotp',
    { onCrit: (c, _n, d) => { if (d.src === 'card' && d.school === 'physical') c.heal(2); } }, ' Also: your physical crits heal you for 2.'),
  T('druid', 'resto', 0, 3, 'd_r1', 'Improved Rejuvenation', '🌿', r => `Regeneration you gain is increased by ${r}.`, { applyMod: (_c, n, s, amt, t) => (t.isPlayer && s === 'regen' ? amt + n : amt) }),
  T('druid', 'resto', 0, 3, 'd_r2', 'Gift of Nature', '💚', r => `Healing increased by ${r * 6}%.`, P.healPct(6)),
  T('druid', 'resto', 1, 3, 'd_r3', 'Intensity', '🧠', r => `+${r} Spirit and +${r} Intellect.`, all(P.stat('spi', 1), P.stat('int', 1))),
  T('druid', 'resto', 1, 2, 'd_r4', 'Furor', '🐻', r => `Shapeshifting grants ${r * 2} Block (once per turn).`, { onCardPlayed: (c, n, def) => { if (def.a.some(a => a.k === 'form') && c.mem.furorTurn !== c.turn) { c.mem.furorTurn = c.turn; c.gainBlock(2 * n, undefined, true); } } }),
  T('druid', 'resto', 2, 3, 'd_r5', 'Tranquil Spirit', '🍃', r => `Overhealing deals ${r * 20}% of the excess as Nature damage to a random enemy.`, P.overheal(20, 'nature')),
  cap('druid', 'resto', 'd_resto_cap', 'Swiftmend', '🌸', 'd_swiftmend'),
];

export const TALENT_BY_ID = Object.fromEntries(TALENTS.map(t => [t.id, t])) as Record<string, TalentDef>;
export const classTalents = (cls: ClassId) => TALENTS.filter(t => t.cls === cls);
