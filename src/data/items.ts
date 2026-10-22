// Gear: named loot per dungeon/raid, tier sets, random "of the Bear" greens and special item effects.
import type { ArmorType, ClassId, HookSet, Item, ItemLook, OffType, Quality, Slot, StatKey, WeaponType } from '../engine/types';
import { P, all } from './passives';

export const QUALITY_COLOR: Record<Quality, string> = {
  poor: '#9d9d9d', common: '#ffffff', uncommon: '#1eff00', rare: '#0070dd', epic: '#a335ee', legendary: '#ff8000',
};
export const SLOT_NAME: Record<Slot, string> = {
  head: 'Head', shoulder: 'Shoulders', chest: 'Chest', hands: 'Hands', legs: 'Legs', feet: 'Feet',
  mainhand: 'Main Hand', offhand: 'Off Hand', ring: 'Finger', trinket: 'Trinket',
};
export const SLOTS: Slot[] = ['head', 'shoulder', 'chest', 'hands', 'legs', 'feet', 'mainhand', 'offhand', 'ring', 'trinket'];
export const STAT_NAME: Record<StatKey, string> = { sta: 'Stamina', str: 'Strength', agi: 'Agility', int: 'Intellect', spi: 'Spirit', armor: 'Armor', ap: 'Attack Power', sp: 'Spell Power', crit: '% Crit' };

// ---------- Special effects (procs and play-style changers) ----------
export interface FxDef { desc: string; hooks: HookSet }
export const FX: Record<string, FxDef> = {
  cruel_barb: { desc: 'Your first Attack each combat deals +6 damage.', hooks: { outDmg: (c, _n, d) => { if (d.src === 'card' && d.isAttack && !c.mem.cruel) { d.amt += 6; c.mem.cruel = 1; } } } },
  smite_hammer: { desc: 'Attacks apply 1 Weakened.', hooks: { onCardPlayed: (c, _n, def, ctx) => { if (def.type === 'attack' && ctx.target && !ctx.target.dead) c.applyStatus(ctx.target, 'weak', 1, true); } } },
  vancleef_blade: { desc: 'Start each combat in Stealth. Openers deal +4 damage.', hooks: all(P.start('stealth', 1), { outDmg: (_c, _n, d) => { if (d.src === 'card' && d.card?.kw?.includes('opener')) d.amt += 4; } }) },
  thrash_blade: { desc: 'Every 4th Attack you play strikes again for 5.', hooks: { onCardPlayed: (c, _n, def, ctx) => { if (def.type !== 'attack') return; c.mem.thrash = (c.mem.thrash ?? 0) + 1; if (c.mem.thrash % 4 === 0) { const t = ctx.target && !ctx.target.dead ? ctx.target : c.randomEnemy(); if (t) c.effectDamage(t, 5, 'physical', 'effect'); } } } },
  serpent_staff: { desc: 'Poison you apply is increased by 2.', hooks: P.applyPlus('poison', 2) },
  arugal_ring: { desc: 'Shadow damage +3.', hooks: P.dmgSchool(['shadow'], 3) },
  whitemane_chapeau: { desc: 'Healing increased by 20%.', hooks: P.healPct(20) },
  herod_shoulder: { desc: 'Whirlwind and Cleave deal +4. Start combat with 1 Attack Power.', hooks: all(P.dmgCards(['w_cleave', 'w_whirlwind', 'd_swipe', 'h_multi'], 4), P.start('str', 1)) },
  mograine_might: { desc: 'Holy damage +3.', hooks: P.dmgSchool(['holy'], 3) },
  zum_rah_wand: { desc: 'Start each combat by applying 3 Affliction to ALL enemies.', hooks: P.startAll('affliction', 3) },
  jangdor: { desc: 'Start each combat with 1 Clearcasting.', hooks: P.start('clearcast', 1) },
  ironfoe: { desc: 'Your first Attack each turn strikes again for 4.', hooks: { onCardPlayed: (c, _n, def, ctx) => { if (def.type === 'attack' && c.attacksThisTurn === 1) { const t = ctx.target && !ctx.target.dead ? ctx.target : c.randomEnemy(); if (t) c.effectDamage(t, 4, 'physical', 'effect'); } } } },
  hand_of_justice: { desc: 'Every 3rd Attack grants 1 extra resource.', hooks: { onCardPlayed: (c, _n, def) => { if (def.type !== 'attack') return; c.mem.hoj = (c.mem.hoj ?? 0) + 1; if (c.mem.hoj % 3 === 0) c.gainRes(1); } } },
  dagran_scepter: { desc: 'Fire damage +4. Start combat with 2 Fortified.', hooks: all(P.dmgSchool(['fire'], 4), P.start('fortify', 2)) },
  briarwood: { desc: 'Spell critical strike chance +5%. Spell Power +1.', hooks: P.crit(s => s !== 'physical', 5) },
  blackhand_breadth: { desc: '+5% critical strike chance.', hooks: P.crit(() => true, 5) },
  dal_rend: { desc: 'Attacks deal +2 damage.', hooks: P.dmgAttack(2) },
  rivendare_reins: { desc: 'Each time you kill an enemy, gain 2 Attack Power and 2 Spell Power for the combat.', hooks: { onKill: c => { c.applyStatus(c.p, 'str', 2, true); c.applyStatus(c.p, 'sp', 2, true); } } },
  runeblade: { desc: 'Your Attacks heal you for 1.', hooks: { onCardPlayed: (c, _n, def) => { if (def.type === 'attack') c.heal(1); } } },
  dragonslayer: { desc: '+15% damage against Dragonkin. Start each combat with 4 Shield.', hooks: all(P.start('absorb', 4), { outDmg: (_c, _n, d) => { const e = d.target as any; if (e.def?.tags?.includes('dragon')) d.amt *= 1.15; } }) },
  onyxia_tooth: { desc: '+4% critical strike chance and +2 Agility.', hooks: P.crit(() => true, 4) },
  ony_blood: { desc: 'Draw 1 extra card each turn.', hooks: { drawBonus: () => 1 } },
  quickstrike: { desc: 'Attacks cost 1 less on your first turn.', hooks: { costMod: (c, _n, def) => (c.turn === 1 && def.type === 'attack' ? -1 : 0) } },
  sulfuras: { desc: 'LEGENDARY — At the end of your turn, deal 6 Fire damage to ALL enemies and apply 2 Burning.', hooks: { onTurnEnd: c => { for (const e of c.alive()) { c.effectDamage(e, 6, 'fire', 'effect'); c.applyStatus(e, 'burn', 2, true); } } } },
  thunderfury: { desc: 'LEGENDARY — Whenever you play an Attack, lightning arcs to up to 3 enemies for 4 Nature damage and applies 1 Weakened.', hooks: { onCardPlayed: (c, _n, def) => { if (def.type !== 'attack') return; for (const e of c.alive().slice(0, 3)) { c.effectDamage(e, 4, 'nature', 'effect'); if (!e.dead) c.applyStatus(e, 'weak', 1, true); } } } },
  perdition: { desc: 'Attacks deal 3 extra Fire damage.', hooks: { onCardPlayed: (c, _n, def, ctx) => { if (def.type === 'attack') { const t = ctx.target && !ctx.target.dead ? ctx.target : c.randomEnemy(); if (t) c.effectDamage(t, 3, 'fire', 'effect'); } } } },
  bonereaver: { desc: 'Attacks apply 1 Exposed.', hooks: { onCardPlayed: (c, _n, def, ctx) => { if (def.type === 'attack' && ctx.target && !ctx.target.dead) c.applyStatus(ctx.target, 'vuln', 1, true); } } },
  azuresong: { desc: 'Spells deal +10% damage.', hooks: P.dmgPct(s => s !== 'physical', 10) },
  talisman_ephemeral: { desc: 'Your first spell each turn costs 1 less.', hooks: { costMod: (c, _n, def) => (c.cardsPlayedThisTurn === 0 && def.school && def.school !== 'physical' ? -1 : 0) } },
  ashkandi: { desc: 'Attacks deal +3 damage and +5% crit.', hooks: all(P.dmgAttack(3), P.crit(s => s === 'physical', 5)) },
  ashjrethul: { desc: 'Start each combat with 2 Hunter\'s Mark on ALL enemies.', hooks: P.startAll('mark', 2) },
  chromatic_boots: { desc: 'Start each combat with 1 Dodge and 6 Block.', hooks: all(P.start('dodge', 1), P.startBlock(6)) },
  styleen: { desc: 'Draw 1 extra card on your first turn; resource +1 on first turn.', hooks: all(P.drawFirst(1), P.resFirst(1)) },
  drake_fang: { desc: 'Start each combat with 2 Dodge.', hooks: P.start('dodge', 2) },
  lok_amir: { desc: 'Healing increased by 25% and Overheals deal 25% as Holy damage.', hooks: all(P.healPct(25), P.overheal(25)) },
  neltharion_tear: { desc: 'Spells deal +3 damage and +5% crit.', hooks: all(P.dmgSchool(['holy', 'fire', 'frost', 'arcane', 'shadow', 'nature'], 3), P.crit(s => s !== 'physical', 5)) },
  rejuv_gem: { desc: 'End of turn: heal 3.', hooks: P.turnHeal(3) },
  lifegiving_gem: { desc: 'Once per combat, when you fall below 30% HP, heal 20.', hooks: { onHurt: c => { if (!c.mem.lgg && c.p.hp > 0 && c.p.hp < c.p.maxHp * 0.3) { c.mem.lgg = 1; c.heal(20); } } } },
  tooth_of_gnarr: { desc: 'Healing increased by 15%.', hooks: P.healPct(15) },
  royal_seal: { desc: 'Draw 1 extra card on your first turn.', hooks: P.drawFirst(1) },
  zhc: { desc: 'Start each combat with 3 Spell Power that fades by 1 each turn.', hooks: { onCombatStart: c => c.applyStatus(c.p, 'sp', 3, true), onTurnEnd: c => { if (c.turn <= 3 && (c.p.st.sp ?? 0) > 0) c.p.st.sp--; } } },
  kiss_spider: { desc: 'Your first card each combat costs 0.', hooks: { costMod: c => (c.turn === 1 && c.cardsPlayedThisTurn === 0 ? -9 : 0) } },
  essence_eranikus: { desc: 'Gain 3 Shield at the start of each turn.', hooks: { onTurnStart: c => c.applyStatus(c.p, 'absorb', 3, true) } },
  eye_of_rend: { desc: '+4% crit. Your crits deal 10% more damage.', hooks: all(P.crit(() => true, 4), P.critDmg(10)) },
  sapphiron_drape: { desc: 'Start each combat with 8 Shield.', hooks: P.start('absorb', 8) },
};

// ---------- Tier sets (play-style changing set bonuses) ----------
export interface SetDef { id: string; name: string; cls: ClassId; tier: 1 | 2; bonuses: { n: number; fx: FxDef }[]; look: ItemLook }
const S = (id: string, name: string, cls: ClassId, tier: 1 | 2, look: ItemLook, b2: FxDef, b4: FxDef): SetDef => ({ id, name, cls, tier, look, bonuses: [{ n: 2, fx: b2 }, { n: 4, fx: b4 }] });

export const SETS: SetDef[] = [
  S('might', 'Battlegear of Might', 'warrior', 1, { c1: '#8b2c1a', c2: '#d4a017', style: 'spiked' },
    { desc: 'Start each combat with 3 Rage.', hooks: P.startRes(3) },
    { desc: 'Whenever you take unblocked damage, gain 2 Block.', hooks: { onHurt: (c, _n, dealt) => { if (dealt > 0) c.gainBlock(2, undefined, true); } } }),
  S('wrath', 'Battlegear of Wrath', 'warrior', 2, { c1: '#1c2a4a', c2: '#c0c0c0', style: 'spiked' },
    { desc: 'Attacks deal +3 damage.', hooks: P.dmgAttack(3) },
    { desc: 'Each turn, your first Attack costs 0.', hooks: { costMod: (c, _n, def) => (def.type === 'attack' && c.attacksThisTurn === 0 ? -9 : 0) } }),
  S('lawbringer', 'Lawbringer Armor', 'paladin', 1, { c1: '#c9a227', c2: '#ffffff', style: 'winged' },
    { desc: 'Start each combat with Seal of Righteousness active.', hooks: { onCombatStart: c => { if (!c.p.seal) c.p.seal = 'righteousness'; } } },
    { desc: 'Judgement heals you 6 and draws a card.', hooks: { onCardPlayed: (c, _n, def) => { if (def.id === 'p_judgement') { c.heal(6); c.drawCards(1); } } } }),
  S('judgement', 'Judgement Armor', 'paladin', 2, { c1: '#e6d070', c2: '#8a1c1c', style: 'winged' },
    { desc: 'Holy damage +4.', hooks: P.dmgSchool(['holy'], 4) },
    { desc: 'Judging does not consume your Seal.', hooks: { onCombatStart: c => { c.mem.keepSeal = 1; } } }),
  S('giantstalker', 'Giantstalker Armor', 'hunter', 1, { c1: '#3f6b3a', c2: '#a0522d', style: 'scaled' },
    { desc: 'Your pet deals +3 damage.', hooks: P.pet(3) },
    { desc: 'Your pet attacks twice each turn.', hooks: { onTurnEnd: c => c.petAttack() } }),
  S('dragonstalker', 'Dragonstalker Armor', 'hunter', 2, { c1: '#2e5e9e', c2: '#d4af37', style: 'scaled' },
    { desc: '+8% critical strike chance.', hooks: P.crit(() => true, 8) },
    { desc: 'Marked enemies take an additional 25% damage.', hooks: P.vsStatus('mark', 25) }),
  S('nightslayer', 'Nightslayer Armor', 'rogue', 1, { c1: '#2b2b2b', c2: '#7a1f1f', style: 'hooded' },
    { desc: 'Start each combat with 2 Combo Points.', hooks: { onCombatStart: c => c.gainCp(2) } },
    { desc: 'Finishers refund 1 Energy.', hooks: { onCardPlayed: (c, _n, def) => { if (def.kw?.includes('finisher')) c.gainRes(1); } } }),
  S('bloodfang', 'Bloodfang Armor', 'rogue', 2, { c1: '#5a0f14', c2: '#1a1a1a', style: 'hooded' },
    { desc: 'Bleed and Poison you apply +2.', hooks: all(P.applyPlus('bleed', 2), P.applyPlus('poison', 2)) },
    { desc: 'Finishers deal 30% more damage.', hooks: { outDmg: (_c, _n, d) => { if (d.src === 'card' && d.card?.kw?.includes('finisher')) d.amt *= 1.3; } } }),
  S('prophecy', 'Vestments of Prophecy', 'priest', 1, { c1: '#f0f0ff', c2: '#6a5acd', style: 'robe' },
    { desc: 'Healing increased by 20%.', hooks: P.healPct(20) },
    { desc: 'Power Word: Shield costs 0.', hooks: P.costMinus(['pr_pws'], 9) }),
  S('transcendence', 'Vestments of Transcendence', 'priest', 2, { c1: '#fff8dc', c2: '#daa520', style: 'robe' },
    { desc: 'Overhealing deals 50% as Holy damage to a random enemy.', hooks: P.overheal(50) },
    { desc: 'Shadow and Holy damage +4.', hooks: P.dmgSchool(['shadow', 'holy'], 4) }),
  S('earthfury', 'The Earthfury', 'shaman', 1, { c1: '#3a5a8a', c2: '#c08a3a', style: 'totemic' },
    { desc: 'Totems cost 0.', hooks: { costMod: (_c, _n, def) => (def.a.some(a => a.k === 'totem') ? -9 : 0) } },
    { desc: 'Start each combat with Searing and Stoneskin Totems placed.', hooks: { onCombatStart: c => { c.p.totems.fire = c.p.totems.fire ?? 'searing'; c.p.totems.earth = c.p.totems.earth ?? 'stoneskin'; } } }),
  S('tenstorms', 'The Ten Storms', 'shaman', 2, { c1: '#1e3c78', c2: '#7fd3ff', style: 'totemic' },
    { desc: 'Nature damage +4.', hooks: P.dmgSchool(['nature'], 4) },
    { desc: 'Your Lightning spells chain to a random enemy for 50% damage.', hooks: { onHit: (c, _n, d, dealt) => { if (d.src === 'card' && d.school === 'nature' && dealt > 0 && !c.mem.chaining) { const t = c.randomEnemy(d.target as any); if (t) { c.mem.chaining = 1; c.effectDamage(t, Math.ceil(dealt / 2), 'nature', 'effect'); c.mem.chaining = 0; } } } } }),
  S('arcanist', 'Arcanist Regalia', 'mage', 1, { c1: '#5a1f7a', c2: '#e0b0ff', style: 'robe' },
    { desc: 'Start each combat with 1 Clearcasting.', hooks: P.start('clearcast', 1) },
    { desc: 'Spells deal +3 damage.', hooks: P.dmgSchool(['fire', 'frost', 'arcane'], 3) }),
  S('netherwind', 'Netherwind Regalia', 'mage', 2, { c1: '#1a0a3a', c2: '#ff4fd8', style: 'robe' },
    { desc: 'Draw 1 extra card each turn.', hooks: { drawBonus: () => 1 } },
    { desc: 'Spell crits deal 30% more damage and refund 1 Mana (once per turn).', hooks: all(P.critDmg(30), { onCrit: (c, _n, d) => { if (d.school !== 'physical' && c.mem.nwTurn !== c.turn) { c.mem.nwTurn = c.turn; c.gainRes(1); } } }) }),
  S('felheart', 'Felheart Raiment', 'warlock', 1, { c1: '#3a0f4a', c2: '#7fff00', style: 'robe' },
    { desc: 'Start each combat with 1 Soul Shard.', hooks: { onCombatStart: c => c.gainShards(1) } },
    { desc: 'Affliction ticks heal you for 2.', hooks: { onHit: (c, _n, d) => { if (d.src === 'dot' && d.school === 'shadow') c.heal(2); } } }),
  S('nemesis', 'Nemesis Raiment', 'warlock', 2, { c1: '#5a0a0a', c2: '#ff6a00', style: 'robe' },
    { desc: 'Your demons deal +4 damage.', hooks: P.pet(4) },
    { desc: 'Shadow and Fire damage +4.', hooks: P.dmgSchool(['shadow', 'fire'], 4) }),
  S('cenarion', 'Cenarion Raiment', 'druid', 1, { c1: '#5c4033', c2: '#7cfc00', style: 'leafy' },
    { desc: 'Start each combat with 3 Thorns.', hooks: P.start('thorns', 3) },
    { desc: 'Shapeshifting costs 0.', hooks: { costMod: (_c, _n, def) => (def.a.some(a => a.k === 'form') ? -9 : 0) } }),
  S('stormrage', 'Stormrage Raiment', 'druid', 2, { c1: '#2f4f2f', c2: '#9370db', style: 'leafy' },
    { desc: 'Regeneration you gain +3.', hooks: { applyMod: (_c, _n, s, amt, t) => (t.isPlayer && s === 'regen' ? amt + 3 : amt) } },
    { desc: 'All damage +3 and attacks grant 1 Block.', hooks: all(P.dmgAll(3), { onCardPlayed: (c, _n, def) => { if (def.type === 'attack') c.gainBlock(1, undefined, true); } }) }),
];
export const SET_BY_ID = Object.fromEntries(SETS.map(s => [s.id, s])) as Record<string, SetDef>;

// ---------- Stat budget ----------
const Q_BASE: Record<Quality, number> = { poor: 0, common: 1, uncommon: 2, rare: 3, epic: 5, legendary: 7 };
const Q_GROW: Record<Quality, number> = { poor: 0.2, common: 0.35, uncommon: 0.6, rare: 0.75, epic: 0.95, legendary: 1.1 };
export const budget = (q: Quality, tier: number) => Math.round(Q_BASE[q] + Q_GROW[q] * tier);
const ARMOR_BASE: Record<ArmorType, number> = { cloth: 0.3, leather: 0.6, mail: 1, plate: 1.4 };
const SLOT_ARMOR: Partial<Record<Slot, number>> = { head: 1, shoulder: 0.8, chest: 1.3, hands: 0.6, legs: 1.1, feet: 0.7 };

export function rollStats(slot: Slot, q: Quality, tier: number, prim: StatKey[], armor?: ArmorType, off?: OffType, wpn?: WeaponType, twoHand?: boolean): Partial<Stats2> {
  const out: Partial<Stats2> = {};
  let b = budget(q, tier);
  if (twoHand) b = Math.round(b * 1.7);
  if (slot === 'mainhand' && wpn) {
    const caster = wpn === 'staff' && prim.some(p => p === 'int' || p === 'sp');
    const w = Math.max(1, Math.round((caster ? 0.35 : 0.5) * b + tier * 0.25));
    if (caster) out.sp = w; else out.ap = w;
    b = Math.max(1, b - w + 1);
  }
  const shares = prim.length === 1 ? [1] : prim.length === 2 ? [0.6, 0.4] : [0.5, 0.3, 0.2];
  prim.forEach((k, i) => {
    const v = Math.max(1, Math.round(b * shares[i]));
    out[k] = (out[k] ?? 0) + v;
  });
  if (armor && SLOT_ARMOR[slot]) out.armor = (out.armor ?? 0) + Math.max(1, Math.round(ARMOR_BASE[armor] * SLOT_ARMOR[slot]! * (2 + tier * 0.9)));
  if (off === 'shield') out.armor = (out.armor ?? 0) + Math.round(4 + tier * 1.6);
  return out;
}
type Stats2 = Record<StatKey, number>;

// ---------- Named item templates ----------
export interface ItemTpl {
  id: string; name: string; slot: Slot; q: Quality; tier: number; prim: StatKey[];
  armor?: ArmorType; wpn?: WeaponType; off?: OffType; twoHand?: boolean; fx?: string; set?: string; cls?: ClassId[]; look?: Partial<ItemLook>; flavor?: string;
  extra?: Partial<Stats2>;
}

const I = (id: string, name: string, slot: Slot, q: Quality, tier: number, prim: StatKey[], o: Partial<ItemTpl> = {}): ItemTpl => ({ id, name, slot, q, tier, prim, ...o });

export const NAMED: Record<string, ItemTpl[]> = {
  rfc: [
    I('rfc_cloak', 'Cavedweller Bracers', 'hands', 'uncommon', 1, ['sta', 'str'], { armor: 'mail', look: { c1: '#7a4a2a' } }),
    I('rfc_robe', 'Robe of Evocation', 'chest', 'uncommon', 1, ['int', 'spi'], { armor: 'cloth', look: { c1: '#6a1f1f', c2: '#d4a017' } }),
    I('rfc_taragaman', "Taragaman's Gauntlets", 'hands', 'rare', 1, ['str', 'sta'], { armor: 'plate', look: { c1: '#5a2a2a' } }),
    I('rfc_axe', 'Ragefire Axe', 'mainhand', 'uncommon', 1, ['str'], { wpn: 'axe', look: { c1: '#b03a2e' } }),
    I('rfc_dagger', 'Searing Blade Dagger', 'mainhand', 'uncommon', 1, ['agi'], { wpn: 'dagger', look: { c1: '#e67e22' } }),
    I('rfc_staff', 'Bazzalan\'s Staff', 'mainhand', 'rare', 1, ['int', 'sta'], { wpn: 'staff', twoHand: true, look: { c1: '#5b2c6f' } }),
    I('rfc_boots', 'Trogg Leather Boots', 'feet', 'uncommon', 1, ['agi', 'sta'], { armor: 'leather', look: { c1: '#6e4b2a' } }),
  ],
  dm: [
    I('dm_cruel', 'Cruel Barb', 'mainhand', 'rare', 2, ['str', 'sta'], { wpn: 'sword', fx: 'cruel_barb', look: { c1: '#c0c0c0', c2: '#8b0000' } }),
    I('dm_smite', "Smite's Mighty Hammer", 'mainhand', 'rare', 2, ['str', 'sta'], { wpn: 'mace2h', twoHand: true, fx: 'smite_hammer', look: { c1: '#7f7f7f' } }),
    I('dm_vanc', "VanCleef's Boots", 'feet', 'rare', 2, ['agi', 'sta'], { armor: 'leather', look: { c1: '#2b2b2b' } }),
    I('dm_blade', 'Blackened Defias Blade', 'mainhand', 'rare', 2, ['agi'], { wpn: 'dagger', fx: 'vancleef_blade', look: { c1: '#3a3a3a', c2: '#c0392b' } }),
    I('dm_cape', 'Cape of the Brotherhood', 'shoulder', 'rare', 2, ['agi', 'sta'], { armor: 'leather', look: { c1: '#8b0000' } }),
    I('dm_cookie', "Cookie's Tenderizer", 'mainhand', 'uncommon', 2, ['str'], { wpn: 'mace', look: { c1: '#8a6a3a' } }),
    I('dm_gold', 'Gold-plated Buckler', 'offhand', 'uncommon', 2, ['sta'], { off: 'shield', look: { c1: '#d4af37' } }),
    I('dm_robe', 'Blackened Defias Robe', 'chest', 'uncommon', 2, ['int', 'sta'], { armor: 'cloth', look: { c1: '#2b2b2b', c2: '#8b0000' } }),
    I('dm_helm', 'Defias Mask', 'head', 'uncommon', 2, ['agi', 'sta'], { armor: 'leather', look: { c1: '#8b0000', style: 'mask' } }),
    I('dm_ring', "Sneed's Ring of Gears", 'ring', 'uncommon', 2, ['int', 'sta']),
  ],
  wc: [
    I('wc_serpent', 'Staff of the Serpent', 'mainhand', 'rare', 3, ['int', 'spi'], { wpn: 'staff', twoHand: true, fx: 'serpent_staff', look: { c1: '#2e7d32' } }),
    I('wc_crescent', 'Crescent Staff', 'mainhand', 'rare', 3, ['int', 'spi', 'sta'], { wpn: 'staff', twoHand: true, look: { c1: '#9fc5e8' } }),
    I('wc_belt', "Cobrahn's Grasp", 'hands', 'rare', 3, ['str', 'sta'], { armor: 'mail', look: { c1: '#2e7d32' } }),
    I('wc_leggings', "Leggings of the Fang", 'legs', 'rare', 3, ['agi', 'sta'], { armor: 'leather', look: { c1: '#4a7a3a' } }),
    I('wc_glaive', 'Deviate Scale Glaive', 'mainhand', 'uncommon', 3, ['agi', 'str'], { wpn: 'polearm', twoHand: true, look: { c1: '#6a8f3a' } }),
    I('wc_shield', 'Buckler of the Fang', 'offhand', 'uncommon', 3, ['sta', 'str'], { off: 'shield', look: { c1: '#3a6b2a' } }),
    I('wc_mutanus', "Mutanus's Bracers", 'hands', 'uncommon', 3, ['int', 'spi'], { armor: 'cloth', look: { c1: '#8a6aaa' } }),
    I('wc_helm', 'Serpent Crown', 'head', 'uncommon', 3, ['int', 'sta'], { armor: 'leather', look: { c1: '#2e7d32', style: 'crown' } }),
  ],
  sfk: [
    I('sfk_ring', "Arugal's Signet", 'ring', 'rare', 4, ['int', 'sta'], { fx: 'arugal_ring' }),
    I('sfk_bow', 'Silverlaine\'s Family Seal', 'trinket', 'rare', 4, ['sta', 'spi']),
    I('sfk_axe', 'Shadowfang', 'mainhand', 'rare', 4, ['str', 'agi'], { wpn: 'sword', fx: 'runeblade', look: { c1: '#4a0080', c2: '#9b59b6' }, flavor: 'The blade that gave the keep its name.' }),
    I('sfk_hat', "Wolfmaster Cape", 'shoulder', 'uncommon', 4, ['agi', 'sta'], { armor: 'leather', look: { c1: '#555' } }),
    I('sfk_belt', "Fenrus's Hide", 'chest', 'rare', 4, ['agi', 'sta'], { armor: 'leather', look: { c1: '#6b5b4b' } }),
    I('sfk_helm', "Commander's Helm", 'head', 'rare', 4, ['str', 'sta'], { armor: 'plate', look: { c1: '#4a4a5a' } }),
    I('sfk_robe', 'Robes of Arugal', 'chest', 'rare', 4, ['int', 'sta'], { armor: 'cloth', look: { c1: '#3a1a4a', c2: '#c0c0c0' } }),
    I('sfk_legs', "Odo's Ley Staff", 'mainhand', 'uncommon', 4, ['int', 'spi'], { wpn: 'staff', twoHand: true, look: { c1: '#4b3b2b' } }),
  ],
  sm: [
    I('sm_ravager', 'Ravager', 'mainhand', 'rare', 5, ['str', 'sta'], { wpn: 'axe2h', twoHand: true, fx: 'herod_shoulder', look: { c1: '#a0a0a0', c2: '#8b0000' } }),
    I('sm_herod', "Herod's Shoulder", 'shoulder', 'rare', 5, ['str', 'sta'], { armor: 'mail', look: { c1: '#8b0000', c2: '#d4af37' } }),
    I('sm_whitemane', "Whitemane's Chapeau", 'head', 'rare', 5, ['int', 'spi'], { armor: 'cloth', fx: 'whitemane_chapeau', look: { c1: '#ffffff', c2: '#8b0000', style: 'hat' } }),
    I('sm_mograine', "Mograine's Might", 'mainhand', 'rare', 5, ['str', 'int'], { wpn: 'mace2h', twoHand: true, fx: 'mograine_might', look: { c1: '#d4af37' } }),
    I('sm_aegis', 'Aegis of the Scarlet Commander', 'offhand', 'rare', 5, ['sta', 'str'], { off: 'shield', look: { c1: '#8b0000', c2: '#ffffff' } }),
    I('sm_doan', "Illusionary Rod", 'mainhand', 'rare', 5, ['int', 'sta'], { wpn: 'staff', twoHand: true, look: { c1: '#6a1fbf' } }),
    I('sm_tabard', 'Scarlet Leggings', 'legs', 'uncommon', 5, ['str', 'sta'], { armor: 'mail', look: { c1: '#8b0000' } }),
    I('sm_gloves', "Loksey's Training Stick", 'mainhand', 'uncommon', 5, ['agi', 'sta'], { wpn: 'staff', twoHand: true, look: { c1: '#8a6a3a' } }),
    I('sm_bracer', 'Scarlet Boots', 'feet', 'uncommon', 5, ['agi', 'sta'], { armor: 'leather', look: { c1: '#8b0000' } }),
  ],
  zf: [
    I('zf_jangdor', "Jang'thraze the Protector", 'mainhand', 'rare', 6, ['str', 'sta'], { wpn: 'sword', look: { c1: '#c0c0c0', c2: '#d4af37' } }),
    I('zf_sulthraze', "Sul'thraze the Lasher", 'mainhand', 'epic', 6, ['str', 'sta'], { wpn: 'sword2h', twoHand: true, fx: 'thrash_blade', look: { c1: '#4b6b3b', c2: '#a335ee' }, flavor: 'Forged from two blades of the sandfury trolls.' }),
    I('zf_zumrah', "Zum'rah's Vexing Cane", 'mainhand', 'rare', 6, ['int', 'sta'], { wpn: 'staff', twoHand: true, fx: 'zum_rah_wand', look: { c1: '#2e5e3e' } }),
    I('zf_jumanza', 'Jumanza Grips', 'hands', 'rare', 6, ['int', 'spi'], { armor: 'cloth', look: { c1: '#3e8e7e' } }),
    I('zf_ukorz', 'Sandscalp Helm', 'head', 'rare', 6, ['agi', 'sta'], { armor: 'mail', look: { c1: '#c2a060', style: 'horned' } }),
    I('zf_lifeless', 'Big Bad Pauldrons', 'shoulder', 'rare', 6, ['str', 'sta'], { armor: 'plate', look: { c1: '#7a5a3a' } }),
    I('zf_carapace', 'Carapace of Tuten\'kash', 'chest', 'uncommon', 6, ['sta', 'agi'], { armor: 'mail', look: { c1: '#4b3b2b' } }),
    I('zf_ring', 'Ring of the Sandfury', 'ring', 'uncommon', 6, ['agi', 'str']),
  ],
  brd: [
    I('brd_ironfoe', 'Ironfoe', 'mainhand', 'epic', 7, ['str', 'sta'], { wpn: 'mace', fx: 'ironfoe', look: { c1: '#5a5a5a', c2: '#a335ee' } }),
    I('brd_hoj', 'Hand of Justice', 'trinket', 'rare', 7, ['sta'], { fx: 'hand_of_justice' }),
    I('brd_dagran', 'Thaurissan\'s Ironweaver', 'mainhand', 'rare', 7, ['int', 'sta'], { wpn: 'staff', twoHand: true, fx: 'dagran_scepter', look: { c1: '#3a3a3a', c2: '#ff4500' } }),
    I('brd_angerforge', 'Angerforge\'s Battle Axe', 'mainhand', 'rare', 7, ['str', 'sta'], { wpn: 'axe2h', twoHand: true, look: { c1: '#3a3a3a' } }),
    I('brd_savage', 'Savage Gladiator Chain', 'chest', 'epic', 7, ['agi', 'str', 'sta'], { armor: 'mail', look: { c1: '#8b4513', c2: '#c0c0c0' } }),
    I('brd_robe', 'Dark Iron Archmage Robe', 'chest', 'rare', 7, ['int', 'spi'], { armor: 'cloth', look: { c1: '#2a2a2a', c2: '#ff6600' } }),
    I('brd_helm', "Lord Roccor's Helm", 'head', 'rare', 7, ['str', 'sta'], { armor: 'plate', look: { c1: '#4a4a4a', style: 'horned' } }),
    I('brd_shield', 'Skullflame Shield', 'offhand', 'epic', 7, ['sta'], { off: 'shield', look: { c1: '#3a3a3a', c2: '#ff4500' } }),
    I('brd_boots', 'Molten Boots', 'feet', 'rare', 7, ['agi', 'sta'], { armor: 'leather', look: { c1: '#5a2a1a' } }),
    I('brd_briar', 'Briarwood Reed', 'trinket', 'rare', 7, ['int'], { fx: 'briarwood' }),
  ],
  strat: [
    I('st_rivendare', "Deathcharger's Reins", 'trinket', 'epic', 8, ['sta'], { fx: 'rivendare_reins' }),
    I('st_runeblade', 'Runeblade of Baron Rivendare', 'mainhand', 'epic', 8, ['str', 'sta'], { wpn: 'sword2h', twoHand: true, fx: 'runeblade', look: { c1: '#4a6a8a', c2: '#a335ee' } }),
    I('st_helm', 'Helm of the Bone Guard', 'head', 'rare', 8, ['sta', 'str'], { armor: 'plate', look: { c1: '#d8d8c8', style: 'skull' } }),
    I('st_cloak', 'Shroud of the Nathrezim', 'shoulder', 'rare', 8, ['int', 'sta'], { armor: 'cloth', look: { c1: '#2a2a3a' } }),
    I('st_gloves', 'Ramstein\'s Gauntlets', 'hands', 'rare', 8, ['str', 'sta'], { armor: 'plate', look: { c1: '#6a6a6a' } }),
    I('st_robe', 'Robe of the Exalted', 'chest', 'rare', 8, ['int', 'spi', 'sta'], { armor: 'cloth', look: { c1: '#fffaf0', c2: '#d4af37' } }),
    I('st_bow', 'Crimson Barrage Bow', 'mainhand', 'rare', 8, ['agi'], { wpn: 'bow', twoHand: true, look: { c1: '#8b0000' } }),
    I('st_legs', 'Plagued Leggings', 'legs', 'rare', 8, ['agi', 'sta'], { armor: 'leather', look: { c1: '#4a5a4a' } }),
    I('st_gem', 'Lifegiving Gem', 'trinket', 'rare', 8, ['sta'], { fx: 'lifegiving_gem' }),
  ],
  ubrs: [
    I('ub_dalrend', "Dal'Rend's Sacred Charge", 'mainhand', 'rare', 9, ['str', 'agi'], { wpn: 'sword', fx: 'dal_rend', look: { c1: '#c0c0c0', c2: '#ffd700' } }),
    I('ub_breadth', "Blackhand's Breadth", 'trinket', 'rare', 9, ['sta'], { fx: 'blackhand_breadth' }),
    I('ub_rend', 'Eye of Rend', 'head', 'rare', 9, ['agi', 'str', 'sta'], { armor: 'leather', fx: 'eye_of_rend', look: { c1: '#3a2a1a', style: 'mask' } }),
    I('ub_draconian', 'Draconian Deflector', 'offhand', 'epic', 9, ['sta', 'str'], { off: 'shield', look: { c1: '#1a1a1a', c2: '#c0392b' } }),
    I('ub_brazier', 'Tooth of Gnarr', 'ring', 'rare', 9, ['int', 'spi'], { fx: 'tooth_of_gnarr' }),
    I('ub_robe', 'Drakkisath\'s Robe of the Void', 'chest', 'epic', 9, ['int', 'sta', 'sp'], { armor: 'cloth', look: { c1: '#2a0a3a', c2: '#c0392b' } }),
    I('ub_chain', 'Drakkisath\'s Chain', 'chest', 'epic', 9, ['str', 'agi', 'sta'], { armor: 'mail', look: { c1: '#1a1a1a', c2: '#c0392b' } }),
    I('ub_plate', 'Drakkisath\'s Breastplate', 'chest', 'epic', 9, ['str', 'sta'], { armor: 'plate', look: { c1: '#1a1a1a', c2: '#c0392b' } }),
    I('ub_spear', 'Dragonspine Halberd', 'mainhand', 'rare', 9, ['agi', 'str'], { wpn: 'polearm', twoHand: true, look: { c1: '#3a3a3a' } }),
    I('ub_ring', 'Royal Seal of Eldre\'Thalas', 'ring', 'rare', 9, ['sta', 'int'], { fx: 'royal_seal' }),
  ],
  ony: [
    I('on_tooth', 'Onyxia Tooth Pendant', 'ring', 'epic', 10, ['agi', 'sta'], { fx: 'onyxia_tooth' }),
    I('on_blood', 'Onyxia Blood Talisman', 'trinket', 'epic', 10, ['sta'], { fx: 'ony_blood' }),
    I('on_ring', 'Dragonslayer\'s Signet', 'ring', 'epic', 10, ['sta', 'str', 'int'], { fx: 'dragonslayer' }),
    I('on_sapphiron', 'Sapphiron Drape', 'shoulder', 'epic', 10, ['int', 'sta'], { armor: 'cloth', fx: 'sapphiron_drape', look: { c1: '#3a6aaa' } }),
    I('on_vis', "Vis'kag the Bloodletter", 'mainhand', 'epic', 10, ['agi', 'sta'], { wpn: 'sword', look: { c1: '#8b0000', c2: '#a335ee' } }),
    I('on_deathbringer', 'Deathbringer', 'mainhand', 'epic', 10, ['str', 'sta'], { wpn: 'axe', look: { c1: '#2a2a2a', c2: '#7fff00' } }),
    I('on_eskhandar', 'Ring of Binding', 'ring', 'epic', 10, ['sta', 'armor']),
    I('on_staff', 'Staff of the Scale', 'mainhand', 'epic', 10, ['int', 'sta', 'sp'], { wpn: 'staff', twoHand: true, look: { c1: '#2a1a1a', c2: '#ff4500' } }),
  ],
  mc: [
    I('mc_sulfuras', 'Sulfuras, Hand of Ragnaros', 'mainhand', 'legendary', 11, ['str', 'sta'], { wpn: 'mace2h', twoHand: true, fx: 'sulfuras', look: { c1: '#ff4500', c2: '#ffd700' }, flavor: 'Fashioned from the burning heart of the Firelord.' }),
    I('mc_thunderfury', 'Thunderfury, Blessed Blade of the Windseeker', 'mainhand', 'legendary', 11, ['agi', 'str', 'sta'], { wpn: 'sword', fx: 'thunderfury', look: { c1: '#4fc3f7', c2: '#ffd700' }, flavor: 'Did someone say...?' }),
    I('mc_perdition', "Perdition's Blade", 'mainhand', 'epic', 11, ['agi'], { wpn: 'dagger', fx: 'perdition', look: { c1: '#ff4500', c2: '#a335ee' } }),
    I('mc_bonereaver', "Bonereaver's Edge", 'mainhand', 'epic', 11, ['str', 'sta'], { wpn: 'sword2h', twoHand: true, fx: 'bonereaver', look: { c1: '#d8d8c8', c2: '#a335ee' } }),
    I('mc_azuresong', 'Azuresong Mageblade', 'mainhand', 'epic', 11, ['int', 'sp'], { wpn: 'sword', fx: 'azuresong', look: { c1: '#4169e1', c2: '#a335ee' } }),
    I('mc_talisman', 'Talisman of Ephemeral Power', 'trinket', 'epic', 11, ['int'], { fx: 'talisman_ephemeral' }),
    I('mc_quickstrike', 'Quick Strike Ring', 'ring', 'epic', 11, ['str', 'agi'], { fx: 'quickstrike' }),
    I('mc_drape', 'Mantle of Shrouded Mists', 'shoulder', 'epic', 11, ['agi', 'sta'], { armor: 'leather', look: { c1: '#2a3a4a' } }),
    I('mc_spinal', 'Spinal Reaper', 'mainhand', 'epic', 11, ['str', 'sta'], { wpn: 'axe2h', twoHand: true, look: { c1: '#d8d8c8', c2: '#ff4500' } }),
    I('mc_malistar', "Malistar's Defender", 'offhand', 'epic', 11, ['sta', 'int'], { off: 'shield', look: { c1: '#ffd700', c2: '#a335ee' } }),
  ],
  bwl: [
    I('bwl_ashkandi', 'Ashkandi, Greatsword of the Brotherhood', 'mainhand', 'epic', 12, ['str', 'sta'], { wpn: 'sword2h', twoHand: true, fx: 'ashkandi', look: { c1: '#d4af37', c2: '#a335ee' } }),
    I('bwl_ashjrethul', "Ashjre'thul, Crossbow of Smiting", 'mainhand', 'epic', 12, ['agi', 'sta'], { wpn: 'bow', twoHand: true, fx: 'ashjrethul', look: { c1: '#3a2a1a', c2: '#a335ee' } }),
    I('bwl_lokamir', "Lok'amir il Romathis", 'mainhand', 'epic', 12, ['int', 'sp', 'sta'], { wpn: 'mace', fx: 'lok_amir', look: { c1: '#ffd700', c2: '#a335ee' } }),
    I('bwl_neltharion', "Neltharion's Tear", 'trinket', 'epic', 12, ['int'], { fx: 'neltharion_tear' }),
    I('bwl_rejuv', 'Rejuvenating Gem', 'trinket', 'epic', 12, ['spi'], { fx: 'rejuv_gem' }),
    I('bwl_chromatic', 'Chromatic Boots', 'feet', 'epic', 12, ['str', 'agi', 'sta'], { armor: 'plate', fx: 'chromatic_boots', look: { c1: '#4a0a6a', c2: '#ff4500' } }),
    I('bwl_drake_fang', 'Drake Fang Talisman', 'trinket', 'epic', 12, ['agi', 'sta'], { fx: 'drake_fang' }),
    I('bwl_styleen', "Styleen's Impeding Scarab", 'trinket', 'epic', 12, ['sta', 'armor'], { fx: 'styleen' }),
    I('bwl_crul', "Crul'shorukh, Edge of Chaos", 'mainhand', 'epic', 12, ['agi', 'str'], { wpn: 'axe', look: { c1: '#1a1a1a', c2: '#a335ee' } }),
    I('bwl_shield', 'Elementium Reinforced Bulwark', 'offhand', 'epic', 12, ['sta', 'str'], { off: 'shield', look: { c1: '#5a7a9a', c2: '#a335ee' } }),
  ],
};

// Tier set pieces are generated: 4 visible pieces per set.
const SET_SLOTS: Slot[] = ['head', 'shoulder', 'chest', 'legs'];
const SET_PIECE_NAMES: Record<Slot, string[]> = {
  head: ['Helm', 'Crown', 'Circlet', 'Cover'], shoulder: ['Pauldrons', 'Spaulders', 'Mantle', 'Shoulderpads'],
  chest: ['Breastplate', 'Chestguard', 'Robes', 'Vestments'], legs: ['Legplates', 'Leggings', 'Pants', 'Legguards'],
  hands: [], feet: [], mainhand: [], offhand: [], ring: [], trinket: [],
};
const SET_CLASS_ARMOR: Record<ClassId, ArmorType> = { warrior: 'plate', paladin: 'plate', hunter: 'mail', shaman: 'mail', rogue: 'leather', druid: 'leather', mage: 'cloth', priest: 'cloth', warlock: 'cloth' };
const SET_CLASS_PRIM: Record<ClassId, StatKey[]> = {
  warrior: ['str', 'sta'], paladin: ['str', 'int', 'sta'], hunter: ['agi', 'sta', 'int'], rogue: ['agi', 'sta'],
  priest: ['int', 'spi', 'sta'], shaman: ['int', 'str', 'sta'], mage: ['int', 'sta'], warlock: ['int', 'sta'], druid: ['int', 'agi', 'sta'],
};

export function setPieces(setId: string): ItemTpl[] {
  const s = SET_BY_ID[setId];
  const armorWord = SET_CLASS_ARMOR[s.cls] === 'cloth' ? 2 : SET_CLASS_ARMOR[s.cls] === 'plate' ? 0 : 1;
  const prefix = s.name.split(' of ').pop()!.replace(/^The /, '').replace(' Armor', '').replace(' Raiment', '').replace(' Regalia', '').replace(' Vestments', '');
  return SET_SLOTS.map(slot => {
    const names = SET_PIECE_NAMES[slot];
    const word = names[Math.min(names.length - 1, armorWord + (slot === 'head' && SET_CLASS_ARMOR[s.cls] === 'cloth' ? 1 : 0))];
    return I(`${setId}_${slot}`, `${prefix} ${word}`, slot, 'epic', s.tier === 1 ? 11 : 12, SET_CLASS_PRIM[s.cls], {
      armor: SET_CLASS_ARMOR[s.cls], set: setId, cls: [s.cls], look: { ...s.look },
    });
  });
}

// ---------- Random "of the X" greens ----------
export const SUFFIXES: { name: string; prim: StatKey[] }[] = [
  { name: 'of the Bear', prim: ['str', 'sta'] }, { name: 'of the Monkey', prim: ['agi', 'sta'] },
  { name: 'of the Eagle', prim: ['int', 'sta'] }, { name: 'of the Owl', prim: ['int', 'spi'] },
  { name: 'of the Tiger', prim: ['str', 'agi'] }, { name: 'of the Whale', prim: ['sta', 'spi'] },
  { name: 'of the Falcon', prim: ['agi', 'int'] }, { name: 'of the Gorilla', prim: ['str', 'int'] },
  { name: 'of the Wolf', prim: ['agi', 'spi'] }, { name: 'of Stamina', prim: ['sta'] },
  { name: 'of Strength', prim: ['str'] }, { name: 'of Agility', prim: ['agi'] }, { name: 'of Intellect', prim: ['int'] },
  { name: 'of Healing', prim: ['sp', 'spi'] }, { name: 'of Sorcery', prim: ['sp', 'int', 'sta'] }, { name: 'of Power', prim: ['ap', 'sta'] },
];

export const BASE_NAMES: Record<string, string[]> = {
  'head:cloth': ['Hood', 'Cowl', 'Circlet'], 'head:leather': ['Cap', 'Mask', 'Helm'], 'head:mail': ['Coif', 'Helm'], 'head:plate': ['Helm', 'Greathelm'],
  'shoulder:cloth': ['Mantle', 'Amice'], 'shoulder:leather': ['Shoulderpads', 'Spaulders'], 'shoulder:mail': ['Shoulders', 'Pauldrons'], 'shoulder:plate': ['Pauldrons', 'Shoulderguards'],
  'chest:cloth': ['Robe', 'Vest'], 'chest:leather': ['Tunic', 'Jerkin'], 'chest:mail': ['Hauberk', 'Chain Vest'], 'chest:plate': ['Breastplate', 'Chestplate'],
  'hands:cloth': ['Gloves', 'Handwraps'], 'hands:leather': ['Gloves', 'Grips'], 'hands:mail': ['Gauntlets', 'Grips'], 'hands:plate': ['Gauntlets', 'Handguards'],
  'legs:cloth': ['Pants', 'Leggings'], 'legs:leather': ['Breeches', 'Leggings'], 'legs:mail': ['Legguards', 'Chain Leggings'], 'legs:plate': ['Legplates', 'Greaves'],
  'feet:cloth': ['Slippers', 'Sandals'], 'feet:leather': ['Boots', 'Treads'], 'feet:mail': ['Sabatons', 'Boots'], 'feet:plate': ['Sabatons', 'Warboots'],
};
export const WPN_NAMES: Record<WeaponType, string[]> = {
  sword: ['Longsword', 'Broadsword', 'Scimitar'], axe: ['Hatchet', 'War Axe', 'Cleaver'], mace: ['Mace', 'Hammer', 'Morning Star'],
  dagger: ['Dirk', 'Stiletto', 'Kris'], fist: ['Claw', 'Knuckles'], staff: ['Staff', 'Quarterstaff'], polearm: ['Halberd', 'Glaive'],
  bow: ['Longbow', 'Recurve Bow'], gun: ['Blunderbuss', 'Rifle'], sword2h: ['Greatsword', 'Claymore'], axe2h: ['Greataxe', 'Battle Axe'], mace2h: ['Warhammer', 'Maul'],
};
export const OFF_NAMES: Record<OffType, string[]> = { shield: ['Buckler', 'Kite Shield', 'Tower Shield'], orb: ['Orb', 'Sphere'], tome: ['Tome', 'Grimoire', 'Libram'], weapon: ['Dagger'] };
export const PREFIX_BY_TIER = ['Worn', 'Sturdy', 'Fine', 'Polished', 'Scarlet', 'Sandfury', 'Dark Iron', 'Plaguebound', 'Blackrock', 'Draconic', 'Molten', 'Chromatic', 'Chromatic'];
export const TIER_PALETTE = [
  ['#8a7a6a', '#6a5a4a'], ['#7a6a5a', '#9a8a6a'], ['#5a7a5a', '#8aa07a'], ['#6a6a7a', '#9a9aaa'], ['#5a5a6a', '#8a8aa0'],
  ['#8b0000', '#d4d4d4'], ['#c2a060', '#7a5a3a'], ['#3a3a3a', '#ff6600'], ['#4a5a4a', '#9aaa8a'], ['#2a2a2a', '#c0392b'],
  ['#1a1a2a', '#c0392b'], ['#7a1a0a', '#ffa500'], ['#2a0a3a', '#9b59b6'],
];

export const STARTER_GEAR: Record<ClassId, ItemTpl[]> = Object.fromEntries((['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'] as ClassId[]).map(cls => {
  const armor = SET_CLASS_ARMOR[cls];
  const prim = SET_CLASS_PRIM[cls].slice(0, 1);
  const wpn: WeaponType = ({ warrior: 'sword', paladin: 'mace2h', hunter: 'bow', rogue: 'dagger', priest: 'mace', shaman: 'mace', mage: 'staff', warlock: 'dagger', druid: 'staff' } as Record<ClassId, WeaponType>)[cls];
  const off: OffType | undefined = ({ warrior: 'shield', rogue: 'weapon', shaman: 'shield', priest: 'tome', warlock: 'orb' } as Partial<Record<ClassId, OffType>>)[cls];
  const tw = ['mace2h', 'staff', 'bow'].includes(wpn);
  const tpls: ItemTpl[] = [
    I(`st_${cls}_chest`, `Recruit's ${armor === 'cloth' ? 'Robe' : armor === 'leather' ? 'Vest' : armor === 'mail' ? 'Chain Vest' : 'Breastplate'}`, 'chest', 'common', 0, prim, { armor, look: { c1: '#8a7a5a' } }),
    I(`st_${cls}_legs`, `Recruit's Pants`, 'legs', 'common', 0, ['sta'], { armor, look: { c1: '#5a4a3a' } }),
    I(`st_${cls}_feet`, `Worn Boots`, 'feet', 'common', 0, ['sta'], { armor, look: { c1: '#4a3a2a' } }),
    I(`st_${cls}_mh`, `Worn ${WPN_NAMES[wpn][0]}`, 'mainhand', 'common', 0, prim, { wpn, twoHand: tw, look: { c1: '#9a9a9a' } }),
  ];
  if (off && !tw) tpls.push(I(`st_${cls}_oh`, `Worn ${OFF_NAMES[off][0]}`, 'offhand', 'common', 0, ['sta'], { off, look: { c1: '#7a6a5a' } }));
  return [cls, tpls];
})) as Record<ClassId, ItemTpl[]>;

export const ALL_SET_TEMPLATES: ItemTpl[] = SETS.flatMap(s => setPieces(s.id));

export function itemTplById(id: string): ItemTpl | undefined {
  for (const list of Object.values(NAMED)) { const t = list.find(x => x.id === id); if (t) return t; }
  return ALL_SET_TEMPLATES.find(x => x.id === id) ?? Object.values(STARTER_GEAR).flat().find(x => x.id === id);
}

export function makeItem(t: ItemTpl, uid: number): Item {
  const stats = rollStats(t.slot, t.q, t.tier, t.prim, t.armor, t.off, t.wpn, t.twoHand);
  if (t.extra) for (const [k, v] of Object.entries(t.extra)) (stats as any)[k] = ((stats as any)[k] ?? 0) + v;
  const pal = TIER_PALETTE[Math.min(TIER_PALETTE.length - 1, t.tier)];
  return {
    uid, id: t.id, name: t.name, slot: t.slot, q: t.q, ilvl: 5 + t.tier * 5 + (t.q === 'epic' ? 6 : t.q === 'legendary' ? 12 : t.q === 'rare' ? 3 : 0),
    armor: t.armor, wpn: t.wpn, off: t.off, twoHand: t.twoHand, stats, fx: t.fx, set: t.set, cls: t.cls,
    look: { c1: t.look?.c1 ?? pal[0], c2: t.look?.c2 ?? pal[1], style: t.look?.style }, flavor: t.flavor,
  };
}

export function itemHooks(it: Item): HookSet | undefined {
  return it.fx ? FX[it.fx]?.hooks : undefined;
}
