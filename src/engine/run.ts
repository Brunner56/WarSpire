// A single dungeon/raid run: map, encounters, rewards, shops, rests and events.
import type { CardInst, ClassId, Item, Slot } from './types';
import { Rng } from './rng';
import { Combat, Provider } from './combat';
import { Character, collectProviders, derive, Derived, equippedItems, talentCards, xpToNext, MAX_LEVEL } from './character';
import { DUNGEON_BY_ID, tierScale, DungeonDef, ActDef } from '../data/dungeons';
import { ALL_CARDS, getCard, canUpgrade, cardActions, POTIONS } from '../data/cards';
import { CLASS_BY_ID, starterDeck } from '../data/classes';
import { PETS } from '../data/mechanics';
import { EVENTS, EventApi, EventResult } from '../data/events';
import { canEquip, itemScore, namedLoot, randomItem, rollQuality, UidGen, dungeonSetPiece } from './loot';
import { talentPointsForLevel } from '../data/talents';
import { difficulty } from '../data/difficulty';
import type { Profile } from './save';

export type NodeType = 'combat' | 'elite' | 'rest' | 'shop' | 'event' | 'treasure' | 'boss';
export interface MapNode { id: number; row: number; col: number; type: NodeType; next: number[] }

export interface ShopStock {
  cards: { card: CardInst; price: number; sold?: boolean }[];
  items: { item: Item; price: number; sold?: boolean }[];
  potions: { id: string; price: number; sold?: boolean }[];
  removePrice: number;
  removed?: boolean;
}

export type Pending =
  | { kind: 'combat'; enemies: string[]; node: NodeType }
  | { kind: 'reward'; title: string; gold: number; cards: CardInst[] | null; items: Item[]; potion: string | null; boss?: boolean }
  | { kind: 'shop'; stock: ShopStock }
  | { kind: 'rest'; done?: boolean }
  | { kind: 'event'; id: string; result?: EventResult }
  | { kind: 'actEnd' }
  | { kind: 'end'; win: boolean };

export interface RunState {
  v: 1;
  charId: string;
  dungeonId: string;
  rank: number;
  act: number;
  rng: number;
  map: MapNode[];
  pos: number | null;
  visited: number[];
  hp: number;
  maxHpBonus: number;
  gold: number;
  deck: CardInst[];
  gear: Partial<Record<Slot, Item>>;
  bag: Item[];
  potions: (string | null)[];
  found: number[];
  xp: number;
  kills: { normal: number; elite: number; boss: number };
  combats: number;
  removals: number;
  uid: number;
  pending: Pending | null;
  lastEnc: string;
  combatSeed: number;
  log: string[];
}

export const BAG_SIZE = 8;

// ---------------------------------------------------------------------------
export function dungeonOf(run: RunState): DungeonDef { return DUNGEON_BY_ID[run.dungeonId]; }
export function actOf(run: RunState): ActDef { return dungeonOf(run).acts[run.act]; }
function rngOf(run: RunState): Rng { return new Rng(run.rng); }
function save(run: RunState, r: Rng) { run.rng = r.s; }
const uidGen = (run: RunState) => { const g = new UidGen(run.uid); return { g, done: () => { run.uid = g.n; } }; };

export function gearList(run: RunState): Item[] { return Object.values(run.gear).filter((x): x is Item => !!x); }

export function runProviders(run: RunState, ch: Character): Provider[] { return collectProviders(ch, gearList(run)); }

export function runDerived(run: RunState, ch: Character): Derived {
  const d = derive(ch, gearList(run), runProviders(run, ch));
  d.maxHp += run.maxHpBonus;
  return d;
}

export function maxHpOf(run: RunState, ch: Character) { return runDerived(run, ch).maxHp; }

// ---------------------------------------------------------------------------
export function newRun(ch: Character, dungeonId: string, rank: number, uidStart: number, seed = (Math.random() * 2 ** 32) >>> 0): RunState {
  const d = DUNGEON_BY_ID[dungeonId];
  const r = new Rng(seed);
  let cuid = 1;
  const deckIds = [...starterDeck(ch.cls, ch.spec, ch.race), ...talentCards(ch)];
  const gear: Partial<Record<Slot, Item>> = {};
  for (const it of equippedItems(ch)) gear[it.slot] = JSON.parse(JSON.stringify(it));
  const run: RunState = {
    v: 1, charId: ch.id, dungeonId, rank, act: 0, rng: r.s, map: [], pos: null, visited: [],
    hp: 0, maxHpBonus: 0, gold: 60, deck: deckIds.map(id => ({ uid: cuid++, id, up: false })), gear, bag: [], potions: [null, null, null],
    found: [], xp: 0, kills: { normal: 0, elite: 0, boss: 0 }, combats: 0, removals: 0, uid: Math.max(uidStart, 100000), pending: null,
    lastEnc: '', combatSeed: r.int(1, 2 ** 31), log: [],
  };
  run.map = genMap(r, d.acts[0].rows);
  save(run, r);
  const mx = maxHpOf(run, ch);
  run.hp = mx;
  run.potions[0] = 'po_heal';
  return run;
}

export function nextCardUid(run: RunState): number { return Math.max(0, ...run.deck.map(c => c.uid)) + 1; }

// ---------------------------------------------------------------------------
// Map generation: StS-style branching paths, bottom (row 0) to top, then boss.
export function genMap(r: Rng, rows: number): MapNode[] {
  const W = 6;
  const grid = new Map<string, MapNode>();
  let id = 0;
  const get = (row: number, col: number) => {
    const k = `${row},${col}`;
    let n = grid.get(k);
    if (!n) { n = { id: id++, row, col, type: 'combat', next: [] }; grid.set(k, n); }
    return n;
  };
  const starts = new Set<number>();
  for (let p = 0; p < 5; p++) {
    let col = p < 2 ? r.int(0, W - 1) : r.int(0, W - 1);
    if (p === 1) while (starts.has(col) && starts.size < W) col = r.int(0, W - 1);
    starts.add(col);
    let prev = get(0, col);
    for (let row = 1; row < rows; row++) {
      col = Math.max(0, Math.min(W - 1, col + r.int(-1, 1)));
      const n = get(row, col);
      if (!prev.next.includes(n.id)) prev.next.push(n.id);
      prev = n;
    }
  }
  const nodes = [...grid.values()];
  const boss: MapNode = { id: id++, row: rows, col: Math.floor(W / 2), type: 'boss', next: [] };
  for (const n of nodes) if (n.row === rows - 1) n.next.push(boss.id);
  // assign types
  const byId = new Map(nodes.map(n => [n.id, n]));
  const parents = new Map<number, MapNode[]>();
  for (const n of nodes) for (const c of n.next) { if (!parents.has(c)) parents.set(c, []); parents.get(c)!.push(n); }
  const mid = Math.floor(rows / 2);
  for (const n of nodes.sort((a, b) => a.row - b.row)) {
    if (n.row === 0) { n.type = 'combat'; continue; }
    if (n.row === rows - 1) { n.type = 'rest'; continue; }
    if (n.row === mid) { n.type = 'treasure'; continue; }
    const banned = new Set<NodeType>();
    for (const p of parents.get(n.id) ?? []) if (['elite', 'rest', 'shop'].includes(p.type)) banned.add(p.type);
    for (let tries = 0; tries < 10; tries++) {
      const t = r.weighted<NodeType>(['combat', 'event', 'elite', 'rest', 'shop'], x =>
        x === 'combat' ? 46 : x === 'event' ? 22 : x === 'elite' ? (n.row >= 3 ? 14 : 0) : x === 'rest' ? (n.row >= 3 && n.row < rows - 2 ? 10 : 0) : (n.row >= 2 ? 8 : 0));
      if (!banned.has(t)) { n.type = t; break; }
    }
  }
  void byId;
  return [...nodes, boss];
}

export function reachable(run: RunState): number[] {
  if (run.pending) return [];
  if (run.pos === null) return run.map.filter(n => n.row === 0).map(n => n.id);
  return run.map.find(n => n.id === run.pos)?.next ?? [];
}

// ---------------------------------------------------------------------------
function pickEncounter(run: RunState, r: Rng, kind: 'easy' | 'normal' | 'elites'): string[] {
  const act = actOf(run);
  const pool = act[kind];
  let opts = pool.filter(e => e.join() !== run.lastEnc);
  if (!opts.length) opts = pool;
  const e = r.pick(opts);
  run.lastEnc = e.join();
  return e;
}

export function enterNode(run: RunState, ch: Character, id: number) {
  const n = run.map.find(x => x.id === id);
  if (!n || !reachable(run).includes(id)) return;
  run.pos = id;
  run.visited.push(id);
  const r = rngOf(run);
  switch (n.type) {
    case 'combat': run.pending = { kind: 'combat', node: 'combat', enemies: pickEncounter(run, r, run.combats < 2 && run.act === 0 ? 'easy' : 'normal') }; break;
    case 'elite': run.pending = { kind: 'combat', node: 'elite', enemies: pickEncounter(run, r, 'elites') }; break;
    case 'boss': run.pending = { kind: 'combat', node: 'boss', enemies: actOf(run).boss.slice() }; break;
    case 'rest': run.pending = { kind: 'rest' }; break;
    case 'shop': run.pending = { kind: 'shop', stock: makeShop(run, ch, r) }; break;
    case 'treasure': run.pending = treasureReward(run, ch, r); break;
    case 'event': {
      const ev = r.pick(EVENTS);
      run.pending = { kind: 'event', id: ev.id };
      break;
    }
  }
  save(run, r);
}

// ---------------------------------------------------------------------------
export function makeCombat(run: RunState, ch: Character): Combat {
  const p = run.pending;
  if (!p || p.kind !== 'combat') throw new Error('No combat pending');
  const d = runDerived(run, ch);
  const dg = dungeonOf(run);
  const sc = tierScale(dg.tier);
  const df = difficulty(run.rank);
  const hpScale = sc.hp * df.hp;
  const dmgScale = sc.dmg * df.dmg;
  const pet = ch.cls === 'hunter' ? (() => { const pd = PETS[ch.pet ?? 'wolf']; return { id: ch.pet ?? 'wolf', name: pd.name, dmg: pd.dmg, icon: pd.icon }; })() : null;
  const c = new Combat({
    cls: ch.cls, name: ch.name, deck: run.deck.filter(ci => getCard(ci.id).cls !== 'token'), hp: Math.min(run.hp, d.maxHp), maxHp: d.maxHp,
    ap: d.ap, sp: d.sp, physCrit: d.physCrit, spellCrit: d.spellCrit, startBlock: d.startBlock,
    passives: runProviders(run, ch), pet, enemies: p.enemies, hpScale, dmgScale, seed: run.combatSeed, potions: run.potions,
  });
  return c;
}

const xpUnit = (tier: number) => 15 * tier + 12;

/** Called when a combat ends. Returns true if the run continues. */
export function resolveCombat(run: RunState, ch: Character, c: Combat): boolean {
  const p = run.pending;
  if (!p || p.kind !== 'combat') return false;
  run.potions = c.potions.slice();
  const r = rngOf(run);
  run.combatSeed = r.int(1, 2 ** 31);
  if (c.over !== 'win') {
    run.hp = 0;
    run.pending = { kind: 'end', win: false };
    save(run, r);
    return false;
  }
  const d = runDerived(run, ch);
  run.hp = Math.min(d.maxHp, Math.max(1, c.p.hp));
  if (d.postHeal > 0) run.hp = Math.min(d.maxHp, run.hp + d.postHeal);
  run.combats++;
  const dg = dungeonOf(run);
  const tier = dg.tier;
  const df = difficulty(run.rank);
  const xpMul = df.xp;
  const goldMul = (1 + d.run.gold) * (1 + 0.08 * tier);
  let gold = 0;
  let cards: CardInst[] | null = null;
  const items: Item[] = [];
  let potion: string | null = null;
  const ug = uidGen(run);
  if (p.node === 'combat') {
    run.kills.normal++;
    run.xp += Math.round(xpUnit(tier) * xpMul);
    gold = Math.round(r.int(12, 18) * goldMul);
    cards = cardChoices(run, ch, r, 'normal', 3 + d.run.cardChoices);
    if (r.chance(0.12 + df.loot * 0.03)) items.push(randomItem(r, ch.cls, tier, rollQuality(r, tier, df.loot, dg.kind === 'raid'), ug.g));
    const sp = dungeonSetDrop(run, ch, r, ug.g, 0.05); if (sp) items.push(sp);
    if (r.chance(0.35)) potion = randomPotion(r);
  } else if (p.node === 'elite') {
    run.kills.elite++;
    run.xp += Math.round(xpUnit(tier) * 3 * xpMul);
    gold = Math.round(r.int(28, 36) * goldMul);
    cards = cardChoices(run, ch, r, 'elite', 3 + d.run.cardChoices);
    const named = r.chance(0.6) ? namedLoot(r, ch.cls, dg.id, ug.g, { includeSets: dg.kind === 'raid' }) : [];
    items.push(...(named.length ? named : [randomItem(r, ch.cls, tier, rollQuality(r, tier, df.loot + 2, dg.kind === 'raid'), ug.g)]));
    const sp = dungeonSetDrop(run, ch, r, ug.g, 0.3); if (sp) items.push(sp);
    if (r.chance(0.5)) potion = randomPotion(r);
  } else {
    run.kills.boss++;
    run.xp += Math.round(xpUnit(tier) * 6 * xpMul);
    gold = Math.round(r.int(70, 90) * goldMul);
    cards = cardChoices(run, ch, r, 'boss', 3 + d.run.cardChoices);
    const loot = namedLoot(r, ch.cls, dg.id, ug.g, { minQ: dg.kind === 'raid' ? 'epic' : 'rare', count: 3, includeSets: dg.kind === 'raid' });
    const sp = dungeonSetDrop(run, ch, r, ug.g, 1);
    if (sp) { loot.splice(2); loot.push(sp); }
    while (loot.length < 3) loot.push(randomItem(r, ch.cls, tier, dg.kind === 'raid' || r.chance(df.loot * 0.08) ? 'epic' : 'rare', ug.g));
    items.push(...loot);
    potion = randomPotion(r);
  }
  ug.done();
  run.gold += gold;
  run.pending = { kind: 'reward', title: p.node === 'boss' ? `${actOf(run).bossName} defeated!` : p.node === 'elite' ? 'Elite defeated!' : 'Victory!', gold, cards, items, potion, boss: p.node === 'boss' };
  save(run, r);
  return true;
}

function treasureReward(run: RunState, ch: Character, r: Rng): Pending {
  const dg = dungeonOf(run);
  const ug = uidGen(run);
  const named = r.chance(0.5) ? namedLoot(r, ch.cls, dg.id, ug.g) : [];
  const df = difficulty(run.rank);
  const items = named.length ? named : [randomItem(r, ch.cls, dg.tier, rollQuality(r, dg.tier, df.loot + 1, dg.kind === 'raid'), ug.g)];
  const sp = dungeonSetDrop(run, ch, r, ug.g, 0.25); if (sp) items.push(sp);
  ug.done();
  const gold = Math.round(r.int(25, 45) * (1 + 0.08 * dg.tier));
  run.gold += gold;
  return { kind: 'reward', title: 'Treasure Chest', gold, cards: null, items, potion: null };
}

/** On Heroic and above, dungeons can drop pieces of the class's dungeon sets. */
function dungeonSetDrop(run: RunState, ch: Character, r: Rng, uid: UidGen, chance: number): Item | null {
  const df = difficulty(run.rank);
  const dg = dungeonOf(run);
  if (dg.kind !== 'dungeon' || !df.sets.length || !r.chance(chance)) return null;
  const which = df.sets.length > 1 && r.chance(0.6) ? 2 : 1;
  return dungeonSetPiece(r, ch.cls, which, dg.tier, uid);
}

export function randomPotion(r: Rng): string {
  return r.weighted(POTIONS, p => (p.rarity === 'rare' ? 1 : p.rarity === 'uncommon' ? 3 : 6)).id;
}

// ---------------------------------------------------------------------------
export const unlockLevel = (c: { lvl?: number }) => (c.lvl ? Math.max(1, Math.round(c.lvl * 0.6)) : 1);

export function rewardPool(ch: Pick<Character, 'cls' | 'level' | 'talents' | 'race'>) {
  return ALL_CARDS.filter(c => c.cls === ch.cls && c.rarity !== 'starter' && c.rarity !== 'special'
    && unlockLevel(c) <= ch.level && (!c.talent || (ch.talents[c.talent] ?? 0) > 0) && (!c.race || c.race === ch.race));
}

function cardChoices(run: RunState, ch: Character, r: Rng, kind: 'normal' | 'elite' | 'boss' | 'shop', n: number): CardInst[] {
  const pool = rewardPool(ch);
  const out: CardInst[] = [];
  const used = new Set<string>();
  let uid = nextCardUid(run) + 500;
  for (let i = 0; i < n; i++) {
    const roll = r.next() * 100;
    let rarity: 'common' | 'uncommon' | 'rare' =
      kind === 'boss' ? 'rare' : kind === 'elite' ? (roll < 15 ? 'rare' : roll < 55 ? 'uncommon' : 'common') : (roll < 6 ? 'rare' : roll < 38 ? 'uncommon' : 'common');
    let cands = pool.filter(c => c.rarity === rarity && !used.has(c.id));
    if (!cands.length) cands = pool.filter(c => !used.has(c.id));
    if (!cands.length) break;
    const c = r.weighted(cands, x => (x.tree === ch.spec ? 3 : x.tree ? 1 : 2));
    used.add(c.id);
    const up = r.chance(0.02 * dungeonOf(run).tier + (kind === 'boss' ? 0.1 : 0));
    out.push({ uid: uid++, id: c.id, up });
    void rarity;
  }
  if (kind !== 'boss' && r.chance(0.08)) {
    const neutral = neutralPool(ch.cls);
    out[out.length - 1] = { uid: uid++, id: r.pick(neutral).id, up: false };
  }
  return out;
}

/** Neutral cards offered to a class. Warriors only get Rage from rare, HP-costing class cards. */
function neutralPool(cls: ClassId) {
  return ALL_CARDS.filter(c => c.cls === 'neutral' && !(cls === 'warrior' && cardActions(c, false).some(a => a.k === 'res')));
}

export function takeRewardCard(run: RunState, idx: number) {
  const p = run.pending;
  if (!p || p.kind !== 'reward' || !p.cards) return;
  const c = p.cards[idx];
  if (c) run.deck.push({ uid: nextCardUid(run), id: c.id, up: c.up });
  p.cards = null;
}
export function skipRewardCards(run: RunState) {
  const p = run.pending;
  if (p && p.kind === 'reward') p.cards = null;
}
export function takeRewardPotion(run: RunState): boolean {
  const p = run.pending;
  if (!p || p.kind !== 'reward' || !p.potion) return false;
  const slot = run.potions.indexOf(null);
  if (slot < 0) return false;
  run.potions[slot] = p.potion;
  p.potion = null;
  return true;
}

export function sellValue(it: Item): number {
  const base = { poor: 2, common: 5, uncommon: 15, rare: 30, epic: 60, legendary: 120 }[it.q];
  return base + Math.floor(it.ilvl / 3);
}

/** Take an item from the pending reward. Boss rewards let you pick one; others give all. */
export function takeRewardItem(run: RunState, ch: Character, uid: number, mode: 'equip' | 'bag' | 'sell') {
  const p = run.pending;
  if (!p || p.kind !== 'reward') return;
  const it = p.items.find(i => i.uid === uid);
  if (!it) return;
  if (p.boss) p.items = []; else p.items = p.items.filter(i => i.uid !== uid);
  acquireItem(run, ch, it, mode);
}

export function acquireItem(run: RunState, ch: Character, it: Item, mode: 'equip' | 'bag' | 'sell') {
  if (mode === 'sell' || (mode === 'equip' && !canEquip(ch.cls, it))) { run.gold += sellValue(it); return; }
  run.found.push(it.uid);
  if (mode === 'equip') equipItem(run, ch, it);
  else if (run.bag.length < BAG_SIZE) run.bag.push(it);
  else run.gold += sellValue(it);
}

export function equipItem(run: RunState, ch: Character, it: Item) {
  if (!canEquip(ch.cls, it)) return;
  run.bag = run.bag.filter(b => b.uid !== it.uid);
  const toBag = (x?: Item) => { if (!x) return; if (run.bag.length < BAG_SIZE) run.bag.push(x); else run.gold += sellValue(x); };
  toBag(run.gear[it.slot]);
  run.gear[it.slot] = it;
  if (it.slot === 'mainhand' && it.twoHand && run.gear.offhand) { toBag(run.gear.offhand); delete run.gear.offhand; }
  if (it.slot === 'offhand' && run.gear.mainhand?.twoHand) { toBag(run.gear.mainhand); delete run.gear.mainhand; }
  const mx = maxHpOf(run, ch);
  run.hp = Math.min(run.hp, mx);
}

export function unequip(run: RunState, ch: Character, slot: Slot) {
  const it = run.gear[slot];
  if (!it || run.bag.length >= BAG_SIZE) return;
  delete run.gear[slot];
  run.bag.push(it);
  run.hp = Math.min(run.hp, maxHpOf(run, ch));
}

export function sellBagItem(run: RunState, uid: number) {
  const it = run.bag.find(b => b.uid === uid);
  if (!it) return;
  run.bag = run.bag.filter(b => b.uid !== uid);
  run.gold += sellValue(it);
}

/** After reward screen. */
export function finishReward(run: RunState, ch: Character) {
  const p = run.pending;
  if (!p || p.kind !== 'reward') return;
  if (p.boss) {
    const dg = dungeonOf(run);
    if (run.act < dg.acts.length - 1) run.pending = { kind: 'actEnd' };
    else { run.xp += Math.round(xpUnit(dg.tier) * 6 * difficulty(run.rank).xp); run.pending = { kind: 'end', win: true }; }
  } else run.pending = null;
}

export function nextAct(run: RunState, ch: Character) {
  const r = rngOf(run);
  run.act++;
  run.map = genMap(r, actOf(run).rows);
  run.pos = null;
  run.visited = [];
  const mx = maxHpOf(run, ch);
  run.hp = Math.min(mx, run.hp + Math.ceil((mx - run.hp) * 0.6));
  run.pending = null;
  save(run, r);
}

// ---------------------------------------------------------------------------
// Rest sites
export function restHeal(run: RunState, ch: Character): number {
  const d = runDerived(run, ch);
  const pct = 0.3 + d.run.rest;
  const amt = Math.round(d.maxHp * pct);
  run.hp = Math.min(d.maxHp, run.hp + amt);
  if (run.pending?.kind === 'rest') run.pending.done = true;
  return amt;
}
export function upgradeCard(run: RunState, uid: number): boolean {
  const c = run.deck.find(x => x.uid === uid);
  if (!c || c.up || !canUpgrade(getCard(c.id))) return false;
  c.up = true;
  if (run.pending?.kind === 'rest') run.pending.done = true;
  return true;
}
export function removeCard(run: RunState, uid: number): boolean {
  const i = run.deck.findIndex(x => x.uid === uid);
  if (i < 0) return false;
  run.deck.splice(i, 1);
  return true;
}
export function duplicateCard(run: RunState, uid: number): boolean {
  const c = run.deck.find(x => x.uid === uid);
  if (!c) return false;
  run.deck.push({ uid: nextCardUid(run), id: c.id, up: c.up });
  return true;
}
export function leaveNode(run: RunState) { run.pending = null; }

// ---------------------------------------------------------------------------
// Shops
function priceMul(run: RunState, ch: Character) { return 1 - runDerived(run, ch).run.shop; }

function makeShop(run: RunState, ch: Character, r: Rng): ShopStock {
  const m = priceMul(run, ch);
  const dg = dungeonOf(run);
  const cards = cardChoices(run, ch, r, 'shop', 5).map(card => {
    const rar = getCard(card.id).rarity;
    const base = rar === 'rare' ? 140 : rar === 'uncommon' ? 72 : 48;
    return { card, price: Math.round(base * (0.9 + r.next() * 0.2) * m * (card.up ? 1.4 : 1)) };
  });
  const neutral = neutralPool(ch.cls);
  for (const n of r.sample(neutral, 2)) cards.push({ card: { uid: 9000 + cards.length, id: n.id, up: false }, price: Math.round((n.rarity === 'rare' ? 110 : 60) * m) });
  const ug = uidGen(run);
  const items = [
    randomItem(r, ch.cls, dg.tier, 'uncommon', ug.g),
    randomItem(r, ch.cls, dg.tier, r.chance(0.5) ? 'rare' : 'uncommon', ug.g),
    ...(r.chance(0.5) ? namedLoot(r, ch.cls, dg.id, ug.g) : [randomItem(r, ch.cls, dg.tier, 'rare', ug.g)]),
  ].map(item => ({ item, price: Math.round(({ uncommon: 70, rare: 140, epic: 260, legendary: 500, common: 30, poor: 10 }[item.q]) * (1 + dg.tier * 0.05) * m) }));
  ug.done();
  const potions = [0, 1, 2].map(() => { const id = randomPotion(r); const rar = getCard(id).rarity; return { id, price: Math.round((rar === 'rare' ? 90 : rar === 'uncommon' ? 60 : 40) * m) }; });
  return { cards, items, potions, removePrice: Math.round((60 + 25 * run.removals) * m) };
}

export function buyCard(run: RunState, i: number) {
  const p = run.pending; if (!p || p.kind !== 'shop') return;
  const s = p.stock.cards[i]; if (!s || s.sold || run.gold < s.price) return;
  run.gold -= s.price; s.sold = true;
  run.deck.push({ uid: nextCardUid(run), id: s.card.id, up: s.card.up });
}
export function buyItem(run: RunState, ch: Character, i: number, mode: 'equip' | 'bag') {
  const p = run.pending; if (!p || p.kind !== 'shop') return;
  const s = p.stock.items[i]; if (!s || s.sold || run.gold < s.price) return;
  run.gold -= s.price; s.sold = true;
  acquireItem(run, ch, s.item, mode);
}
export function buyPotion(run: RunState, i: number) {
  const p = run.pending; if (!p || p.kind !== 'shop') return;
  const s = p.stock.potions[i]; const slot = run.potions.indexOf(null);
  if (!s || s.sold || run.gold < s.price || slot < 0) return;
  run.gold -= s.price; s.sold = true; run.potions[slot] = s.id;
}
export function buyRemoval(run: RunState, uid: number) {
  const p = run.pending; if (!p || p.kind !== 'shop' || p.stock.removed || run.gold < p.stock.removePrice) return;
  if (!removeCard(run, uid)) return;
  run.gold -= p.stock.removePrice; p.stock.removed = true; run.removals++;
}

export function drinkPotionOutside(run: RunState, ch: Character, slot: number) {
  const id = run.potions[slot];
  if (id !== 'po_heal') return;
  run.potions[slot] = null;
  run.hp = Math.min(maxHpOf(run, ch), run.hp + 20);
}

// ---------------------------------------------------------------------------
// Events
export function chooseEvent(run: RunState, ch: Character, idx: number): EventResult | null {
  const p = run.pending;
  if (!p || p.kind !== 'event' || p.result) return null;
  const ev = EVENTS.find(e => e.id === p.id)!;
  const choice = ev.choices[idx];
  const r = rngOf(run);
  const api = eventApi(run, ch, r);
  if (choice.req && !choice.req(api)) return null;
  const res = choice.go(api);
  p.result = res;
  save(run, r);
  return res;
}

export function eventFollowUp(run: RunState) {
  const p = run.pending;
  if (!p || p.kind !== 'event' || !p.result) return;
  const res = p.result;
  const r = rngOf(run);
  if (res.elite) run.pending = { kind: 'combat', node: 'elite', enemies: pickEncounter(run, r, 'elites') };
  else if (res.combat && res.combat.length) run.pending = { kind: 'combat', node: 'combat', enemies: res.combat };
  else run.pending = null;
  save(run, r);
}

export function eventApi(run: RunState, ch: Character, r: Rng): EventApi {
  const dg = dungeonOf(run);
  return {
    gold: () => run.gold,
    hp: () => run.hp,
    maxHp: () => maxHpOf(run, ch),
    level: () => ch.level,
    hasPotionSlot: () => run.potions.includes(null),
    addGold: n => { run.gold = Math.max(0, run.gold + n); },
    damage: n => { run.hp = Math.max(1, run.hp - n); },
    heal: n => { run.hp = Math.min(maxHpOf(run, ch), run.hp + n); },
    healPct: p => { const m = maxHpOf(run, ch); run.hp = Math.min(m, run.hp + Math.round(m * p)); },
    addMaxHp: n => { run.maxHpBonus += n; run.hp += n; },
    addCard: (id, up = false) => { run.deck.push({ uid: nextCardUid(run), id, up }); return getCard(id).name; },
    addRandomClassCard: rarity => {
      const pool = rewardPool(ch);
      const cands = pool.filter(c => c.rarity === rarity);
      const c = r.pick(cands.length ? cands : pool);
      run.deck.push({ uid: nextCardUid(run), id: c.id, up: false });
      return c.name;
    },
    addCurse: id => { run.deck.push({ uid: nextCardUid(run), id, up: false }); return getCard(id).name; },
    upgradeRandom: n => {
      const cands = r.shuffle(run.deck.filter(c => !c.up && canUpgrade(getCard(c.id)))).slice(0, n);
      for (const c of cands) c.up = true;
      return cands.map(c => getCard(c.id).name);
    },
    giveItem: q => {
      const ug = uidGen(run);
      const it = randomItem(r, ch.cls, dg.tier, q ?? rollQuality(r, dg.tier, run.rank, dg.kind === 'raid'), ug.g);
      ug.done();
      acquireItem(run, ch, it, 'bag');
      return it.name;
    },
    givePotion: () => { const id = randomPotion(r); const s = run.potions.indexOf(null); if (s >= 0) run.potions[s] = id; return getCard(id).name; },
    chance: p => r.chance(p),
    pick: a => r.pick(a),
  };
}

// ---------------------------------------------------------------------------
// End of run: experience, levels, attunements and kept loot.
export interface RunSummary { win: boolean; xp: number; levelsGained: number; newLevel: number; newTalentPoints: number; newCards: string[]; kept: Item[]; unlocked?: string; rankCleared?: number }

export function keepLimit(run: RunState): number { return (dungeonOf(run).kind === 'raid' ? 2 : 1) + difficulty(run.rank).keepBonus; }

export function keepCandidates(run: RunState): Item[] {
  const all = [...gearList(run), ...run.bag];
  return all.filter(i => run.found.includes(i.uid));
}

export function finishRun(ch: Character, run: RunState, keepUids: number[]): RunSummary {
  const win = run.pending?.kind === 'end' && run.pending.win;
  const before = ch.level;
  const beforeCards = new Set(rewardPool(ch).map(c => c.id));
  const beforePts = talentPointsForLevel(ch.level);
  let xp = run.xp;
  ch.stats.runs++;
  if (win) ch.stats.wins++; else ch.stats.deaths++;
  ch.stats.bossKills += run.kills.boss;
  if (ch.level < MAX_LEVEL) {
    ch.xp += xp;
    while (ch.level < MAX_LEVEL && ch.xp >= xpToNext(ch.level)) { ch.xp -= xpToNext(ch.level); ch.level++; }
    if (ch.level >= MAX_LEVEL) ch.xp = 0;
  }
  const kept: Item[] = [];
  let unlocked: string | undefined;
  let rankCleared: number | undefined;
  if (win) {
    const cands = keepCandidates(run);
    for (const uid of keepUids.slice(0, keepLimit(run))) {
      const it = cands.find(c => c.uid === uid);
      if (it && !ch.armory.some(a => a.uid === it.uid)) { ch.armory.push(it); kept.push(it); }
    }
    const prev = ch.cleared[run.dungeonId] ?? -1;
    if (run.rank > prev) ch.cleared[run.dungeonId] = run.rank;
    if (difficulty(run.rank).permadeath) ch.hardcore = { ...(ch.hardcore ?? {}), [run.dungeonId]: true };
    rankCleared = run.rank;
    const next = Object.values(DUNGEON_BY_ID).find(d => d.unlock === run.dungeonId);
    if (next && prev < 0) unlocked = next.name;
  }
  const newCards = rewardPool(ch).filter(c => !beforeCards.has(c.id)).map(c => c.name);
  return { win: !!win, xp, levelsGained: ch.level - before, newLevel: ch.level, newTalentPoints: talentPointsForLevel(ch.level) - beforePts, newCards, kept, unlocked, rankCleared };
}

export function isUnlocked(ch: Character, dungeonId: string): boolean {
  const d = DUNGEON_BY_ID[dungeonId];
  return !d.unlock || (ch.cleared[d.unlock] ?? -1) >= 0;
}

/** Heroic unlocks by clearing Normal; Mythic and Hardcore unlock by clearing Heroic. */
export function rankUnlocked(ch: Character, dungeonId: string, rank: number): boolean {
  const cleared = ch.cleared[dungeonId] ?? -1;
  if (rank <= 0) return true;
  if (rank === 1) return cleared >= 0;
  return cleared >= 1;
}

/** A hero who falls on Hardcore is erased along with everything they earned. */
export function buryHero(profile: Profile, charId: string, dungeonId: string) {
  const ch = profile.characters.find(c => c.id === charId);
  if (ch) {
    profile.fallen = [...(profile.fallen ?? []), { name: ch.name, race: ch.race, cls: ch.cls, level: ch.level, dungeon: DUNGEON_BY_ID[dungeonId]?.name ?? dungeonId, at: Date.now() }].slice(-30);
  }
  profile.characters = profile.characters.filter(c => c.id !== charId);
  if (profile.run?.charId === charId) profile.run = null;
  if (profile.activeId === charId) profile.activeId = profile.characters[0]?.id ?? null;
}

export function classOf(ch: Character) { return CLASS_BY_ID[ch.cls]; }
export function isClass(ch: Character, c: ClassId) { return ch.cls === c; }
export { itemScore };
