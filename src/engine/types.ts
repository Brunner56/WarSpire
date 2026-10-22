// Core shared types for WarSpire.
import type { Combat } from './combat';

export type ClassId = 'warrior' | 'paladin' | 'hunter' | 'rogue' | 'priest' | 'shaman' | 'mage' | 'warlock' | 'druid';
export type RaceId = 'human' | 'dwarf' | 'nightelf' | 'gnome' | 'orc' | 'undead' | 'tauren' | 'troll';
export type School = 'physical' | 'holy' | 'fire' | 'frost' | 'arcane' | 'shadow' | 'nature';
export type CardType = 'attack' | 'skill' | 'aura' | 'curse';
export type Rarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'special';
export type Form = 'caster' | 'bear' | 'cat' | 'moonkin';
export type Keyword = 'cooldown' | 'innate' | 'retain' | 'finisher' | 'opener' | 'unplayable' | 'caster' | 'ethereal';

export type ScaleSrc = 'cp' | 'rage' | 'shards' | 'block' | 'debuffs' | 'missingHp' | 'hand' | 'burn' | 'regen' | 'absorb';
export interface Scale { src: ScaleSrc; m: number }

export type DmgTarget = 'enemy' | 'all' | 'random';
export type ApplyTarget = 'enemy' | 'all' | 'self' | 'random';

export interface PlayCtx {
  card: CardInst;
  def: CardDef;
  target?: Enemy;
  cp: number; // combo points available when the card was played
  rage: number; // rage left after paying cost
  killed: boolean;
  dealt: number;
}

export type Action =
  | { k: 'dmg'; n: number; hits?: number; tgt?: DmgTarget; x?: Scale; school?: School; ls?: number }
  | { k: 'block'; n: number; x?: Scale }
  | { k: 'absorb'; n: number }
  | { k: 'heal'; n: number; x?: Scale }
  | { k: 'apply'; s: string; n: number; tgt?: ApplyTarget; x?: Scale }
  | { k: 'draw'; n: number }
  | { k: 'res'; n: number }
  | { k: 'cp'; n: number }
  | { k: 'shard'; n: number }
  | { k: 'hp'; n: number } // lose life
  | { k: 'seal'; id: string }
  | { k: 'judge' }
  | { k: 'totem'; id: string }
  | { k: 'form'; id: Form }
  | { k: 'pet'; id: string }
  | { k: 'petAtk'; n: number }
  | { k: 'add'; card: string; to: 'hand' | 'draw' | 'discard'; n?: number }
  | { k: 'cleanse' }
  | { k: 'fn'; t: string; f: (c: Combat, ctx: PlayCtx, up: boolean) => void };

export interface CardDef {
  id: string;
  name: string;
  cls: ClassId | 'neutral' | 'curse' | 'token';
  tree?: string;
  type: CardType;
  rarity: Rarity;
  cost: number; // -1 = unplayable
  school?: School;
  scale?: 'ap' | 'sp';
  a: Action[];
  u?: Action[]; // upgraded actions (auto-generated if missing)
  uc?: number; // upgraded cost
  kw?: Keyword[];
  form?: Form; // required form
  shards?: number; // soul shards required/consumed
  lvl?: number;
  talent?: string; // only obtainable via this talent
  race?: RaceId;
  tags?: string[]; // e.g. 'eng'
  text?: string; // custom rules text override
  tgt?: boolean; // force needing an enemy target
  endInHand?: Action[]; // triggers at end of turn if held
  icon: string;
}

export interface CardInst { uid: number; id: string; up: boolean }

// ---------- Stats / items ----------
export type StatKey = 'sta' | 'str' | 'agi' | 'int' | 'spi' | 'armor' | 'ap' | 'sp' | 'crit';
export type Stats = Record<StatKey, number>;
export type Slot = 'head' | 'shoulder' | 'chest' | 'hands' | 'legs' | 'feet' | 'mainhand' | 'offhand' | 'ring' | 'trinket';
export type Quality = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ArmorType = 'cloth' | 'leather' | 'mail' | 'plate';
export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'fist' | 'staff' | 'polearm' | 'bow' | 'gun' | 'sword2h' | 'axe2h' | 'mace2h';
export type OffType = 'shield' | 'orb' | 'tome' | 'weapon';

export interface ItemLook { style?: string; c1: string; c2?: string }

export interface Item {
  uid: number;
  id: string;
  name: string;
  slot: Slot;
  q: Quality;
  ilvl: number;
  armor?: ArmorType;
  wpn?: WeaponType;
  off?: OffType;
  twoHand?: boolean;
  stats: Partial<Stats>;
  fx?: string; // effect id in fx registry
  set?: string;
  cls?: ClassId[]; // restriction (tier sets)
  look: ItemLook;
  flavor?: string;
}

// ---------- Hooks ----------
export interface DmgCalc {
  src: 'card' | 'pet' | 'dot' | 'enemy' | 'thorns' | 'effect';
  card?: CardDef;
  school: School;
  amt: number;
  target: Unit;
  attacker?: Unit;
  crit?: boolean;
  isAttack: boolean;
  noCrit?: boolean;
}

export interface RunMods { gold?: number; shop?: number; rest?: number; postHeal?: number; maxHpPct?: number; cardChoices?: number; xp?: number }

export interface HookSet {
  name?: string;
  desc?: string | ((n: number) => string);
  stats?: Partial<Stats> | ((n: number) => Partial<Stats>);
  run?: RunMods | ((n: number) => RunMods);
  onCombatStart?(c: Combat, n: number): void;
  drawBonus?(c: Combat, n: number): number;
  resBonus?(c: Combat, n: number): number;
  onTurnStart?(c: Combat, n: number): void;
  onTurnEnd?(c: Combat, n: number): void;
  onCardPlayed?(c: Combat, n: number, def: CardDef, ctx: PlayCtx): void;
  costMod?(c: Combat, n: number, def: CardDef): number;
  outDmg?(c: Combat, n: number, d: DmgCalc): void;
  inDmg?(c: Combat, n: number, d: DmgCalc): void;
  onHit?(c: Combat, n: number, d: DmgCalc, dealt: number): void;
  onHurt?(c: Combat, n: number, dealt: number, d: DmgCalc): void;
  blockMod?(c: Combat, n: number, amt: number, def?: CardDef): number;
  healMod?(c: Combat, n: number, amt: number): number;
  applyMod?(c: Combat, n: number, s: string, amt: number, target: Unit): number;
  critMod?(c: Combat, n: number, d: DmgCalc): number;
  onCrit?(c: Combat, n: number, d: DmgCalc): void;
  onKill?(c: Combat, n: number, e: Enemy): void;
  onHeal?(c: Combat, n: number, healed: number, over: number): void;
  onCombatEnd?(c: Combat, n: number): void;
  onDeath?(c: Combat, n: number): boolean; // return true to prevent death
}

// ---------- Units ----------
export interface Unit {
  uid: number;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  st: Record<string, number>;
  isPlayer: boolean;
  dead?: boolean;
}

export interface Pet { id: string; name: string; dmg: number; icon: string }

export interface Player extends Unit {
  isPlayer: true;
  cls: ClassId;
  res: number;
  resMax: number;
  resName: 'Mana' | 'Rage' | 'Energy';
  cp: number;
  shards: number;
  seal: string | null;
  totems: Partial<Record<'earth' | 'fire' | 'water' | 'air', string>>;
  form: Form;
  pet: Pet | null;
}

export type IntentKind = 'attack' | 'defend' | 'buff' | 'debuff' | 'atkdef' | 'atkdebuff' | 'summon' | 'stun' | 'unknown' | 'special';

export type EAct =
  | { k: 'atk'; n: number; hits?: number }
  | { k: 'block'; n: number }
  | { k: 'blockAll'; n: number }
  | { k: 'buff'; s: string; n: number }
  | { k: 'buffAll'; s: string; n: number }
  | { k: 'debuff'; s: string; n: number }
  | { k: 'heal'; n: number }
  | { k: 'summon'; id: string; n?: number }
  | { k: 'card'; id: string; n: number; to: 'discard' | 'draw' | 'hand' }
  | { k: 'fn'; t?: string; f: (c: Combat, e: Enemy) => void };

export interface EnemyMove { id: string; name: string; acts: EAct[]; intent?: IntentKind }

export interface EnemyArt {
  k: 'humanoid' | 'beast' | 'dragon' | 'whelp' | 'elemental' | 'ooze' | 'skeleton' | 'golem' | 'hound' | 'spider' | 'serpent' | 'egg' | 'demon' | 'giant' | 'murloc' | 'trogg' | 'rat' | 'plant' | 'totem' | 'ghost' | 'boar';
  c1: string;
  c2?: string;
  c3?: string;
  wpn?: WeaponType;
  off?: OffType;
  helm?: string;
  size?: number;
  race?: RaceId;
  hair?: number;
}

export interface EnemyPhase { pct: number; moves: string[]; msg: string; enter?: (c: Combat, e: Enemy) => void }

export interface EnemyDef {
  id: string;
  name: string;
  hp: [number, number];
  art: EnemyArt;
  tags?: string[];
  moves: EnemyMove[];
  pattern?: string[]; // fixed cycle
  base?: string[]; // phase-0 move pool
  first?: string;
  pick?: (c: Combat, e: Enemy) => string;
  start?: Record<string, number>;
  startBlock?: number;
  startHpPct?: number;
  phases?: EnemyPhase[];
  onDeath?: (c: Combat, e: Enemy) => void;
  onTurnStart?: (c: Combat, e: Enemy) => void;
  boss?: boolean;
  elite?: boolean;
  lore?: string;
}

export interface Enemy extends Unit {
  isPlayer: false;
  def: EnemyDef;
  move: EnemyMove | null;
  lastMoves: string[];
  phase: number;
  turns: number;
  dmgMult: number;
  mem: Record<string, number>;
}
