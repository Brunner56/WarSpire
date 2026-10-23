// The turn-based card combat engine.
import { Rng } from './rng';
import { STATUSES, DEBUFF_IDS } from './statuses';
import type {
  Action, CardDef, CardInst, ClassId, DmgCalc, EAct, Enemy, EnemyDef, EnemyMove, Form, HookSet,
  IntentKind, Pet, PlayCtx, Player, Scale, School, Unit,
} from './types';
import { getCard, cardCost, cardActions } from '../data/cards';
import { getEnemyDef } from '../data/dungeons';
import { SEALS, TOTEMS, FORMS, PETS, STATUS_HOOKS, CLASS_HOOKS } from '../data/mechanics';

export interface CEvent {
  t: 'dmg' | 'heal' | 'block' | 'status' | 'text' | 'die' | 'dodge' | 'play' | 'summon' | 'phase' | 'swing' | 'petAtk';
  uid: number;
  /** play: the card id; swing/petAtk: who is being attacked */
  card?: string;
  tgt?: number;
  n?: number;
  text?: string;
  school?: School;
  crit?: boolean;
}

export interface Provider { h: HookSet; n: number; id: string }

export interface CombatSetup {
  cls: ClassId;
  name: string;
  deck: CardInst[];
  hp: number;
  maxHp: number;
  ap: number;
  sp: number;
  physCrit: number;
  spellCrit: number;
  startBlock: number;
  passives: Provider[];
  pet: Pet | null;
  enemies: string[];
  hpScale: number;
  dmgScale: number;
  seed: number;
  potions?: (string | null)[];
}

const RES_NAME: Record<ClassId, Player['resName']> = {
  warrior: 'Rage', rogue: 'Energy', paladin: 'Mana', hunter: 'Mana', priest: 'Mana', shaman: 'Mana', mage: 'Mana', warlock: 'Mana', druid: 'Mana',
};

/** Max Rage held at once, and how much unspent Rage survives the end of your turn. */
export const RAGE_CAP = 5;
export const RAGE_KEEP = 1;
/** Rage gained from enemy hits is limited per enemy phase. */
export const RAGE_FROM_HITS = 1;
export const MAX_HAND = 10;

export class Combat {
  p: Player;
  enemies: Enemy[] = [];
  draw: CardInst[] = [];
  hand: CardInst[] = [];
  discard: CardInst[] = [];
  exhaust: CardInst[] = [];
  rng: Rng;
  turn = 0;
  over: null | 'win' | 'lose' = null;
  events: CEvent[] = [];
  logLines: string[] = [];
  passives: Provider[];
  ap: number;
  sp: number;
  physCrit: number;
  spellCrit: number;
  startBlock: number;
  mem: Record<string, number> = {};
  hpScale: number;
  dmgScale: number;
  private uidc = 1000;
  cardsPlayedThisTurn = 0;
  attacksThisTurn = 0;
  potions: (string | null)[];
  setup: CombatSetup;

  constructor(s: CombatSetup) {
    this.setup = s;
    this.rng = new Rng(s.seed);
    this.passives = s.passives;
    this.ap = s.ap;
    this.sp = s.sp;
    this.physCrit = s.physCrit;
    this.spellCrit = s.spellCrit;
    this.startBlock = s.startBlock;
    this.hpScale = s.hpScale;
    this.dmgScale = s.dmgScale;
    this.potions = s.potions ?? [];
    this.p = {
      uid: 1, name: s.name, hp: s.hp, maxHp: s.maxHp, block: 0, st: {}, isPlayer: true, cls: s.cls,
      res: 0, resMax: 3, resName: RES_NAME[s.cls], cp: 0, shards: 0, seal: null, totems: {}, form: 'caster',
      pet: s.pet ? { ...s.pet } : null,
    };
    for (const id of s.enemies) this.spawn(id);
    const deck = s.deck.map(c => ({ ...c }));
    this.rng.shuffle(deck);
    const innate = deck.filter(c => { const kw = getCard(c.id).kw ?? []; return kw.includes('innate') || kw.includes('opener'); });
    this.draw = [...deck.filter(c => !innate.includes(c)), ...innate]; // draw from end
  }

  // ---------- helpers ----------
  nextUid() { return ++this.uidc; }
  log(msg: string) { this.logLines.push(msg); if (this.logLines.length > 60) this.logLines.shift(); }
  ev(e: CEvent) { this.events.push(e); }
  alive(): Enemy[] { return this.enemies.filter(e => !e.dead); }
  randomEnemy(exclude?: Enemy): Enemy | undefined {
    const pool = this.alive().filter(e => e !== exclude);
    return pool.length ? this.rng.pick(pool) : undefined;
  }
  isBoss(u: Unit): boolean { return !u.isPlayer && !!((u as Enemy).def.boss || (u as Enemy).st.immune); }

  providers(): Provider[] {
    const out: Provider[] = [...this.passives];
    const ch = CLASS_HOOKS[this.p.cls];
    if (ch) out.push({ h: ch, n: 1, id: 'class' });
    for (const [s, n] of Object.entries(this.p.st)) {
      const h = STATUS_HOOKS[s];
      if (h && n) out.push({ h, n, id: 'st:' + s });
    }
    for (const t of Object.values(this.p.totems)) if (t && TOTEMS[t]) out.push({ h: TOTEMS[t].hooks, n: 1, id: 'totem:' + t });
    const f = FORMS[this.p.form];
    if (f) out.push({ h: f.hooks, n: 1, id: 'form:' + this.p.form });
    return out;
  }
  each(fn: (p: Provider) => void) { for (const p of this.providers()) fn(p); }

  spawn(id: string): Enemy | null {
    if (this.alive().length >= 5) return null;
    const def: EnemyDef = getEnemyDef(id);
    const base = this.rng.int(def.hp[0], def.hp[1]);
    const hp = Math.max(1, Math.round(base * this.hpScale));
    const e: Enemy = {
      uid: this.nextUid(), name: def.name, hp, maxHp: hp, block: def.startBlock ? Math.round(def.startBlock * this.hpScale) : 0,
      st: { ...(def.start ?? {}) }, isPlayer: false, def, move: null, lastMoves: [], phase: 0, turns: 0, dmgMult: this.dmgScale, mem: {},
    };
    if (def.boss) e.st.immune = 1;
    if (def.startHpPct) e.hp = Math.max(1, Math.round(hp * def.startHpPct));
    this.enemies.push(e);
    return e;
  }

  // ---------- flow ----------
  start() {
    if (this.p.cls === 'rogue') this.p.st.stealth = 1;
    this.each(p => p.h.onCombatStart?.(this, p.n));
    for (const e of this.alive()) this.chooseMove(e);
    this.startPlayerTurn();
  }

  startPlayerTurn() {
    if (this.over) return;
    this.turn++;
    this.cardsPlayedThisTurn = 0;
    this.attacksThisTurn = 0;
    const p = this.p;
    p.block = this.turn === 1 ? this.startBlock : 0;
    if (p.st.invuln) delete p.st.invuln;
    this.tickDots(p);
    if (this.checkPlayerDeath()) return;
    // resource
    let gain = p.resMax;
    this.each(x => { gain += x.h.resBonus?.(this, x.n) ?? 0; });
    if (p.st.adrenaline) gain += 1;
    if (p.st.dazed) { gain -= p.st.dazed; delete p.st.dazed; }
    gain = Math.max(0, gain);
    if (p.resName === 'Rage') p.res = Math.min(this.rageCap(), p.res + gain);
    else p.res = gain;
    // draw
    let n = 5;
    this.each(x => { n += x.h.drawBonus?.(this, x.n) ?? 0; });
    if (p.st.feared) { n -= p.st.feared; delete p.st.feared; }
    this.drawCards(Math.max(1, n));
    this.each(x => x.h.onTurnStart?.(this, x.n));
    this.checkEnd();
  }

  drawCards(n: number) {
    for (let i = 0; i < n; i++) {
      if (this.hand.length >= MAX_HAND) return;
      if (!this.draw.length) {
        if (!this.discard.length) return;
        this.draw = this.rng.shuffle(this.discard);
        this.discard = [];
      }
      const c = this.draw.pop()!;
      this.hand.push(c);
    }
  }

  endPlayerTurn() {
    if (this.over) return;
    const p = this.p;
    this.each(x => x.h.onTurnEnd?.(this, x.n));
    // Rage fades: only a little unspent Rage carries into the next turn
    if (p.resName === 'Rage') p.res = Math.min(p.res, RAGE_KEEP + (this.mem.rageKeep ?? 0));
    this.mem.hitRage = 0;
    this.petAttack();
    if (this.mem.chicken) { const t = this.randomEnemy(); if (t) this.effectDamage(t, this.mem.chicken, 'physical', 'effect'); }
    if (p.st.fortify) this.gainBlock(p.st.fortify, undefined, true);
    if (p.st.regen) this.heal(p.st.regen);
    if (p.st.consecration) {
      for (const e of this.alive()) this.effectDamage(e, p.st.consecration, 'holy', 'effect');
      p.st.consecration = Math.floor(p.st.consecration / 2);
      if (!p.st.consecration) delete p.st.consecration;
    }
    // cards with end-of-turn effects in hand
    for (const ci of [...this.hand]) {
      const d = getCard(ci.id);
      if (d.endInHand) for (const a of d.endInHand) this.doAction(a, this.mkCtx(ci, d), ci.up);
    }
    const keep: CardInst[] = [];
    for (const ci of this.hand) {
      const kw = getCard(ci.id).kw ?? [];
      if (kw.includes('retain')) keep.push(ci);
      else if (kw.includes('ethereal')) this.exhaust.push(ci);
      else this.discard.push(ci);
    }
    this.hand = keep;
    this.decay(p);
    this.checkEnd();
  }

  /** Runs every enemy action; the UI uses the step-wise variants for animation. */
  endTurn() {
    this.endPlayerTurn();
    for (const e of [...this.enemies]) this.enemyAct(e);
    this.finishEnemyPhase();
  }

  finishEnemyPhase() {
    if (this.over) return;
    for (const e of this.alive()) this.chooseMove(e);
    this.startPlayerTurn();
  }

  checkEnd() {
    if (this.over) return;
    if (this.p.hp <= 0) { this.checkPlayerDeath(); return; }
    if (this.alive().length === 0) {
      this.over = 'win';
      this.each(x => x.h.onCombatEnd?.(this, x.n));
    }
  }

  checkPlayerDeath(): boolean {
    const p = this.p;
    if (p.hp > 0) return false;
    if (p.st.reincarnate) {
      p.hp = p.st.reincarnate;
      delete p.st.reincarnate;
      this.ev({ t: 'text', uid: p.uid, text: 'Reincarnation!' });
      return false;
    }
    for (const x of this.providers()) {
      if (x.h.onDeath?.(this, x.n)) { if (p.hp <= 0) p.hp = 1; return false; }
    }
    p.hp = 0;
    p.dead = true;
    this.over = 'lose';
    return true;
  }

  decay(u: Unit) {
    for (const [s, n] of Object.entries(u.st)) {
      const d = STATUSES[s]?.decay;
      if (d === 'turn') { if (n <= 1) delete u.st[s]; else u.st[s] = n - 1; }
      else if (d === 'temp') delete u.st[s];
    }
  }

  tickDots(u: Unit) {
    const st = u.st;
    if (st.poison) { this.effectDamage(u, st.poison, 'nature', 'dot'); st.poison--; if (st.poison <= 0) delete st.poison; }
    if (u.dead || u.hp <= 0) return;
    if (st.bleed) { this.effectDamage(u, st.bleed, 'physical', 'dot'); st.bleed--; if (st.bleed <= 0) delete st.bleed; }
    if (u.dead || u.hp <= 0) return;
    if (st.burn) { this.effectDamage(u, st.burn, 'fire', 'dot'); st.burn = Math.floor(st.burn / 2); if (st.burn <= 0) delete st.burn; }
    if (u.dead || u.hp <= 0) return;
    if (st.affliction) { this.effectDamage(u, st.affliction, 'shadow', 'dot'); st.affliction--; if (st.affliction <= 0) delete st.affliction; }
    if (u.dead || u.hp <= 0) return;
    if (st.siphon) {
      const dealt = this.effectDamage(u, st.siphon, 'shadow', 'dot');
      if (!u.isPlayer) this.heal(dealt);
      st.siphon--; if (st.siphon <= 0) delete st.siphon;
    }
    if (u.dead || u.hp <= 0) return;
    if (st.doom) {
      st.doom--;
      if (st.doom <= 0) { delete st.doom; this.effectDamage(u, 40, 'shadow', 'dot'); }
    }
  }

  // ---------- enemies ----------
  movePool(e: Enemy): string[] {
    const d = e.def;
    if (e.phase > 0 && d.phases) return d.phases[e.phase - 1].moves;
    if (d.base) return d.base;
    const phased = new Set((d.phases ?? []).flatMap(p => p.moves));
    const pool = d.moves.map(m => m.id).filter(id => !phased.has(id));
    return pool.length >= 2 ? pool : d.moves.map(m => m.id);
  }

  chooseMove(e: Enemy) {
    const d = e.def;
    let id: string;
    if (d.pick) id = d.pick(this, e);
    else if (e.turns === 0 && d.first && e.phase === 0) id = d.first;
    else if (d.pattern && e.phase === 0) id = d.pattern[e.turns % d.pattern.length];
    else {
      const pool = this.movePool(e);
      const last = e.lastMoves[e.lastMoves.length - 1];
      const last2 = e.lastMoves[e.lastMoves.length - 2];
      let options = pool.filter(m => !(m === last && m === last2));
      if (pool.length > 2) options = options.filter(m => m !== last);
      if (!options.length) options = pool;
      id = this.rng.pick(options);
    }
    e.move = d.moves.find(m => m.id === id) ?? d.moves[0];
  }

  intentOf(m: EnemyMove): IntentKind {
    if (m.intent) return m.intent;
    const ks = new Set(m.acts.map(a => a.k));
    const atk = ks.has('atk');
    const def = ks.has('block') || ks.has('blockAll');
    const debuff = ks.has('debuff') || ks.has('card');
    const buff = ks.has('buff') || ks.has('buffAll') || ks.has('heal');
    if (ks.has('summon')) return 'summon';
    if (atk && debuff) return 'atkdebuff';
    if (atk && def) return 'atkdef';
    if (atk) return 'attack';
    if (debuff) return 'debuff';
    if (def) return 'defend';
    if (buff) return 'buff';
    return 'unknown';
  }

  /** Damage per hit an enemy would deal to the player right now (for intent display). */
  enemyHitDamage(e: Enemy, n: number): number {
    let amt = n * e.dmgMult + (e.st.str ?? 0);
    if (e.st.weak) amt *= 0.75;
    if (this.p.st.vuln) amt *= 1.5;
    const d: DmgCalc = { src: 'enemy', school: 'physical', amt, target: this.p, attacker: e, isAttack: true };
    this.each(x => x.h.inDmg?.(this, x.n, d));
    return Math.max(0, Math.floor(d.amt));
  }

  enemyAct(e: Enemy) {
    if (this.over || e.dead) return;
    e.block = 0;
    if (e.st.invuln) { e.st.invuln--; if (e.st.invuln <= 0) delete e.st.invuln; }
    this.tickDots(e);
    if (e.dead) return;
    e.def.onTurnStart?.(this, e);
    if (e.dead || this.over) return;
    if (e.st.stun || e.st.poly) {
      if (e.st.stun) { e.st.stun--; if (e.st.stun <= 0) delete e.st.stun; }
      else delete e.st.poly;
      this.ev({ t: 'text', uid: e.uid, text: 'Stunned' });
    } else if (e.move) {
      const m = e.move;
      e.lastMoves.push(m.id);
      if (e.lastMoves.length > 4) e.lastMoves.shift();
      this.log(`${e.name} uses ${m.name}.`);
      this.ev({ t: 'text', uid: e.uid, text: m.name });
      this.mem.trapUsed = 0;
      for (const a of m.acts) {
        if (this.over || e.dead) break;
        this.enemyDo(e, a);
      }
    }
    if (e.dead || this.over) return;
    if (e.st.regen) this.healUnit(e, e.st.regen);
    if (e.st.ritual) e.st.str = (e.st.str ?? 0) + e.st.ritual;
    if (e.st.fortify) e.block += e.st.fortify;
    this.decay(e);
    e.turns++;
  }

  enemyDo(e: Enemy, a: EAct) {
    switch (a.k) {
      case 'atk':
        for (let i = 0; i < (a.hits ?? 1); i++) {
          if (this.over || e.dead) return;
          if (e.st.stun) return;
          this.enemyHit(e, a.n);
        }
        break;
      case 'block': e.block += Math.round(a.n * this.hpScale); this.ev({ t: 'block', uid: e.uid, n: a.n }); break;
      case 'blockAll': for (const x of this.alive()) { x.block += Math.round(a.n * this.hpScale); this.ev({ t: 'block', uid: x.uid, n: a.n }); } break;
      case 'buff': this.applyStatus(e, a.s, a.n, false); break;
      case 'buffAll': for (const x of this.alive()) this.applyStatus(x, a.s, a.n, false); break;
      case 'debuff': this.applyStatus(this.p, a.s, a.n, false); break;
      case 'heal': this.healUnit(e, Math.round(a.n * this.hpScale)); break;
      case 'summon': for (let i = 0; i < (a.n ?? 1); i++) { const s = this.spawn(a.id); if (s) { this.chooseMove(s); this.ev({ t: 'summon', uid: s.uid }); } } break;
      case 'card': for (let i = 0; i < a.n; i++) this.addCard(a.id, a.to); break;
      case 'fn': a.f(this, e); break;
    }
  }

  enemyHit(e: Enemy, n: number) {
    const p = this.p;
    let amt = n * e.dmgMult + (e.st.str ?? 0);
    if (e.st.weak) amt *= 0.75;
    if (p.st.vuln) amt *= 1.5;
    this.ev({ t: 'swing', uid: e.uid, tgt: p.uid });
    const d: DmgCalc = { src: 'enemy', school: 'physical', amt, target: p, attacker: e, isAttack: true };
    this.each(x => x.h.inDmg?.(this, x.n, d));
    let dmg = Math.max(0, Math.floor(d.amt));
    if (!this.mem.trapUsed) {
      if (p.st.trapFreeze) { delete p.st.trapFreeze; this.applyStatus(e, 'stun', 1, true); this.mem.trapUsed = 1; this.ev({ t: 'text', uid: e.uid, text: 'Frozen!' }); }
      if (p.st.trapImmo) { const b = p.st.trapImmo; delete p.st.trapImmo; this.applyStatus(e, 'burn', b, true); this.mem.trapUsed = 1; }
    }
    if (p.st.dodge) {
      p.st.dodge--; if (p.st.dodge <= 0) delete p.st.dodge;
      this.ev({ t: 'dodge', uid: p.uid, text: 'Dodge' });
      this.retaliate(e);
      return;
    }
    const dealt = this.takeDamage(p, dmg, d);
    if (dealt > 0 && p.resName === 'Rage' && (this.mem.hitRage ?? 0) < RAGE_FROM_HITS) {
      this.mem.hitRage = (this.mem.hitRage ?? 0) + 1;
      p.res = Math.min(this.rageCap(), p.res + 1);
    }
    this.each(x => x.h.onHurt?.(this, x.n, dealt, d));
    this.retaliate(e);
    this.checkPlayerDeath();
  }

  retaliate(e: Enemy) {
    const p = this.p;
    if (e.dead) return;
    if (p.st.thorns) this.effectDamage(e, p.st.thorns, 'nature', 'thorns');
    if (!e.dead && p.st.lightningShield) this.effectDamage(e, p.st.lightningShield, 'nature', 'thorns');
    if (!e.dead && p.st.retribution) this.effectDamage(e, p.st.retribution, 'holy', 'thorns');
  }

  /** Apply already-computed damage to a unit through invuln/absorb/block. Returns HP lost. */
  takeDamage(u: Unit, amt: number, d: DmgCalc, ignoreBlock = false): number {
    if (u.dead || amt <= 0) return 0;
    if (u.st.invuln) { this.ev({ t: 'text', uid: u.uid, text: 'Immune' }); return 0; }
    if (u.st.poly && !u.isPlayer) delete u.st.poly;
    let rem = amt;
    if (!ignoreBlock) {
      if (u.st.absorb) {
        const used = Math.min(u.st.absorb, rem);
        u.st.absorb -= used; rem -= used;
        if (u.st.absorb <= 0) delete u.st.absorb;
      }
      const b = Math.min(u.block, rem);
      u.block -= b; rem -= b;
    }
    u.hp -= rem;
    this.ev({ t: 'dmg', uid: u.uid, n: rem, school: d.school, crit: d.crit, text: rem === 0 ? 'Blocked' : undefined });
    if (!u.isPlayer) {
      const e = u as Enemy;
      if (rem > 0 && e.st.enrage) e.st.str = (e.st.str ?? 0) + e.st.enrage;
      if (e.hp <= 0) this.killEnemy(e);
      else this.checkPhase(e);
    }
    return rem;
  }

  checkPhase(e: Enemy) {
    const ph = e.def.phases;
    if (!ph) return;
    while (e.phase < ph.length && (e.hp / e.maxHp) * 100 <= ph[e.phase].pct) {
      const next = ph[e.phase];
      e.phase++;
      this.ev({ t: 'phase', uid: e.uid, text: next.msg });
      this.log(next.msg);
      next.enter?.(this, e);
      this.chooseMove(e);
    }
  }

  killEnemy(e: Enemy) {
    if (e.dead) return;
    e.hp = 0;
    e.dead = true;
    e.block = 0;
    this.ev({ t: 'die', uid: e.uid });
    this.log(`${e.name} dies.`);
    e.def.onDeath?.(this, e);
    this.each(x => x.h.onKill?.(this, x.n, e));
    this.checkEnd();
  }

  // ---------- player damage ----------
  scaleVal(x: Scale | undefined, ctx?: PlayCtx, target?: Unit): number {
    if (!x) return 0;
    let v = 0;
    switch (x.src) {
      case 'cp': v = ctx?.cp ?? this.p.cp; break;
      case 'rage': v = ctx?.rage ?? this.p.res; break;
      case 'shards': v = this.p.shards; break;
      case 'block': v = this.p.block; break;
      case 'debuffs': v = target ? DEBUFF_IDS.filter(s => target.st[s]).length : 0; break;
      case 'missingHp': v = this.p.maxHp - this.p.hp; break;
      case 'hand': v = this.hand.length; break;
      case 'burn': v = target?.st.burn ?? 0; break;
      case 'regen': v = this.p.st.regen ?? 0; break;
      case 'absorb': v = this.p.st.absorb ?? 0; break;
    }
    return Math.floor(v * x.m);
  }

  cardSchool(def: CardDef, a?: { school?: School }): School {
    return a?.school ?? def.school ?? (def.type === 'attack' ? 'physical' : 'arcane');
  }

  isSpell(def: CardDef): boolean {
    return (def.school ?? 'physical') !== 'physical' && def.type !== 'aura';
  }

  /** Compute outgoing card damage for one hit. */
  calcCardHit(def: CardDef, base: number, school: School, target: Unit, preview: boolean): DmgCalc {
    const scale = def.scale ?? (school === 'physical' ? 'ap' : 'sp');
    let amt = base;
    if (def.cls !== 'neutral' && def.cls !== 'curse' && def.cls !== 'token') {
      amt += scale === 'ap' ? this.ap + (this.p.st.str ?? 0) : this.sp + (this.p.st.sp ?? 0);
    } else if (def.tags?.includes('eng')) {
      amt += 0;
    }
    if (def.type === 'attack' && this.p.st.snd) amt += this.p.st.snd;
    if (this.p.st.empower) amt += this.p.st.empower;
    const d: DmgCalc = { src: 'card', card: def, school, amt, target, attacker: this.p, isAttack: def.type === 'attack' };
    this.each(x => x.h.outDmg?.(this, x.n, d));
    this.finishOutgoing(d, preview);
    return d;
  }

  finishOutgoing(d: DmgCalc, preview: boolean) {
    const t = d.target;
    if (this.p.st.weak) d.amt *= 0.75;
    if (t.st.vuln) d.amt *= 1.5;
    if (t.st.mark) d.amt += t.st.mark;
    if (d.school === 'fire' && t.st.firevuln) d.amt += t.st.firevuln;
    if (!preview && !d.noCrit && (d.src === 'card' || d.src === 'pet')) {
      let chance = d.school === 'physical' ? this.physCrit : this.spellCrit;
      this.each(x => { chance += x.h.critMod?.(this, x.n, d) ?? 0; });
      const forced = d.src === 'card' && (this.p.st.critnext ?? 0) > 0;
      if (forced || this.rng.next() * 100 < chance) {
        d.crit = true;
        d.amt *= 1.5 + (this.mem.critBonus ?? 0) / 100;
      }
    }
    if (d.school === 'physical' && t.st.airborne) d.amt *= 0.5;
    d.amt = Math.max(0, Math.floor(d.amt));
  }

  /** Deal a resolved damage packet from the player to a unit and fire hit hooks. */
  hit(d: DmgCalc): number {
    const t = d.target;
    if (t.dead) return 0;
    if (d.crit) this.each(x => x.h.onCrit?.(this, x.n, d));
    const before = t.hp;
    const dealt = this.takeDamage(t, d.amt, d);
    const total = Math.min(before, d.amt);
    if (!t.isPlayer && t.st.jlight && d.src === 'card') this.heal(t.st.jlight);
    this.each(x => x.h.onHit?.(this, x.n, d, dealt));
    if (!t.isPlayer && !t.dead && (d.src === 'card') && d.isAttack) {
      const e = t as Enemy;
      if (e.st.thorns) this.takeDamage(this.p, e.st.thorns, { src: 'thorns', school: 'nature', amt: e.st.thorns, target: this.p, isAttack: false });
      this.checkPlayerDeath();
    }
    return total;
  }

  /** Non-card damage (DoTs, pets, totems, thorns, item procs). */
  effectDamage(t: Unit, amt: number, school: School, src: DmgCalc['src']): number {
    if (t.dead || amt <= 0) return 0;
    const d: DmgCalc = { src, school, amt, target: t, attacker: t.isPlayer ? undefined : this.p, isAttack: false };
    if (src === 'dot') {
      d.amt = Math.floor(amt);
      if (!t.isPlayer) this.each(x => x.h.outDmg?.(this, x.n, d));
      d.amt = Math.max(0, Math.floor(d.amt));
      const dealt = this.takeDamage(t, d.amt, d, true);
      if (!t.isPlayer) this.each(x => x.h.onHit?.(this, x.n, d, dealt));
      if (t.isPlayer) this.checkPlayerDeath();
      return dealt;
    }
    if (t.isPlayer) {
      const dealt = this.takeDamage(t, Math.floor(amt), d);
      this.checkPlayerDeath();
      return dealt;
    }
    if (src === 'pet') this.each(x => x.h.outDmg?.(this, x.n, d));
    this.finishOutgoing(d, false);
    return this.hit(d);
  }

  petAttack() {
    const pet = this.p.pet;
    if (!pet || this.over) return;
    const marked = this.alive().filter(e => e.st.mark).sort((a, b) => b.st.mark - a.st.mark)[0];
    const t = marked ?? this.randomEnemy();
    if (!t) return;
    const scale = this.p.cls === 'warlock' ? Math.floor(this.sp / 2) : Math.floor(this.ap / 2);
    const amt = pet.dmg + scale + (this.p.st.petpow ?? 0);
    const def = PETS[pet.id];
    const school: School = def?.school ?? 'physical';
    this.ev({ t: 'petAtk', uid: this.p.uid, tgt: t.uid, school });
    if (def?.aoe) for (const e of this.alive()) this.effectDamage(e, amt, school, 'pet');
    else this.effectDamage(t, amt, school, 'pet');
    def?.onAttack?.(this, t);
  }

  // ---------- player actions ----------
  gainBlock(n: number, def?: CardDef, raw = false) {
    let amt = n;
    if (!raw) {
      amt += this.p.st.dex ?? 0;
      this.each(x => { amt = x.h.blockMod?.(this, x.n, amt, def) ?? amt; });
      if (this.p.st.frail) amt *= 0.75;
    }
    amt = Math.max(0, Math.floor(amt));
    this.p.block += amt;
    if (amt) this.ev({ t: 'block', uid: this.p.uid, n: amt });
  }

  heal(n: number) {
    const p = this.p;
    let amt = n;
    this.each(x => { amt = x.h.healMod?.(this, x.n, amt) ?? amt; });
    amt = Math.max(0, Math.floor(amt));
    const healed = Math.min(amt, p.maxHp - p.hp);
    p.hp += healed;
    if (amt) this.ev({ t: 'heal', uid: p.uid, n: amt });
    this.each(x => x.h.onHeal?.(this, x.n, healed, amt - healed));
  }

  healUnit(u: Unit, n: number) {
    if (u.isPlayer) return this.heal(n);
    const h = Math.min(n, u.maxHp - u.hp);
    u.hp += h;
    if (h) this.ev({ t: 'heal', uid: u.uid, n: h });
  }

  applyStatus(t: Unit, s: string, n: number, fromPlayer: boolean) {
    if (n <= 0 || t.dead) return;
    let amt = n;
    if (t.isPlayer && (s === 'feared' || s === 'dazed') && t.st.fearward) { this.ev({ t: 'text', uid: t.uid, text: 'Immune' }); return; }
    if (fromPlayer || t.isPlayer) this.each(x => { amt = x.h.applyMod?.(this, x.n, s, amt, t) ?? amt; });
    if (amt <= 0) { if (t.isPlayer) this.ev({ t: 'text', uid: t.uid, text: 'Immune' }); return; }
    if ((s === 'stun' || s === 'poly') && this.isBoss(t)) { s = 'weak'; amt = 1; }
    if (s === 'stun' || s === 'poly') amt = 1;
    t.st[s] = (t.st[s] ?? 0) + amt;
    if (s === 'chill' && t.st.chill >= 4) {
      delete t.st.chill;
      if (this.isBoss(t)) t.st.weak = (t.st.weak ?? 0) + 2;
      else t.st.stun = 1;
      this.ev({ t: 'text', uid: t.uid, text: 'Frozen!' });
      this.mem.frozeThisCombat = (this.mem.frozeThisCombat ?? 0) + 1;
    }
    this.ev({ t: 'status', uid: t.uid, text: s, n: amt });
  }

  addCard(id: string, to: 'hand' | 'draw' | 'discard', up = false) {
    const ci: CardInst = { uid: this.nextUid(), id, up };
    if (to === 'hand' && this.hand.length < MAX_HAND) this.hand.push(ci);
    else if (to === 'draw') this.draw.splice(this.rng.int(0, this.draw.length), 0, ci);
    else this.discard.push(ci);
  }

  rageCap() { return RAGE_CAP + (this.mem.rageCap ?? 0); }
  gainRes(n: number) {
    const cap = this.p.resName === 'Rage' ? this.rageCap() : 99;
    this.p.res = Math.max(0, Math.min(cap, this.p.res + n));
  }
  gainCp(n: number) { this.p.cp = Math.max(0, Math.min(5, this.p.cp + n)); }
  gainShards(n: number) { this.p.shards = Math.max(0, Math.min(5, this.p.shards + n)); }
  loseHp(n: number) {
    if (n <= 0) return;
    this.p.hp -= n;
    this.ev({ t: 'dmg', uid: this.p.uid, n, school: 'shadow' });
    this.checkPlayerDeath();
  }

  cleanse(u: Unit) {
    for (const s of DEBUFF_IDS) delete u.st[s];
  }

  // ---------- card play ----------
  costOf(ci: CardInst): number {
    const def = getCard(ci.id);
    let c = cardCost(def, ci.up);
    if (c < 0) return c;
    this.each(x => { c += x.h.costMod?.(this, x.n, def) ?? 0; });
    if (def.type === 'attack' && this.p.st.rapid) c -= 1;
    if (def.kw?.includes('opener') && !this.p.st.stealth) c += 1;
    if (this.p.st.clearcast && this.isSpell(def)) c = 0;
    return Math.max(0, c);
  }

  canPlay(ci: CardInst): { ok: boolean; why?: string } {
    if (this.over) return { ok: false, why: 'Combat over' };
    const def = getCard(ci.id);
    const kw = def.kw ?? [];
    if (kw.includes('unplayable') || def.cost < 0) return { ok: false, why: 'Unplayable' };
    const cost = this.costOf(ci);
    if (cost > this.p.res) return { ok: false, why: `Not enough ${this.p.resName}` };
    if (def.shards && this.p.shards < def.shards) return { ok: false, why: 'Needs Soul Shard' };
    if (kw.includes('finisher') && this.p.cp <= 0) return { ok: false, why: 'Needs Combo Points' };
    if (cardActions(def, ci.up).some(a => a.k === 'judge') && !this.p.seal) return { ok: false, why: 'No active Seal' };
    return { ok: true };
  }

  needsTarget(def: CardDef, up: boolean): boolean {
    return cardActions(def, up).some(a =>
      (a.k === 'dmg' && (a.tgt ?? 'enemy') === 'enemy') ||
      (a.k === 'apply' && (a.tgt ?? (STATUSES[a.s]?.debuff ? 'enemy' : 'self')) === 'enemy') ||
      a.k === 'judge' || a.k === 'petAtk') || !!def.tgt;
  }

  mkCtx(ci: CardInst, def: CardDef, target?: Enemy): PlayCtx {
    return { card: ci, def, target, cp: this.p.cp, rage: this.p.res, killed: false, dealt: 0 };
  }

  playCard(handIdx: number, targetUid?: number): boolean {
    const ci = this.hand[handIdx];
    if (!ci) return false;
    const chk = this.canPlay(ci);
    if (!chk.ok) return false;
    const def = getCard(ci.id);
    const kw = def.kw ?? [];
    let target = this.enemies.find(e => e.uid === targetUid && !e.dead);
    if (this.needsTarget(def, ci.up) && !target) {
      const al = this.alive();
      if (al.length === 1) target = al[0];
      else return false;
    }
    const cost = this.costOf(ci);
    if (this.p.st.clearcast && this.isSpell(def) && cardCost(def, ci.up) > 0) {
      this.p.st.clearcast--; if (this.p.st.clearcast <= 0) delete this.p.st.clearcast;
    }
    this.p.res -= cost;
    if (def.shards) this.p.shards -= def.shards;
    this.hand.splice(handIdx, 1);
    this.ev({ t: 'play', uid: this.p.uid, text: def.name, card: def.id, tgt: target?.uid, school: def.school });
    this.log(`You cast ${def.name}.`);
    if (kw.includes('caster') && (this.p.form === 'bear' || this.p.form === 'cat')) {
      this.p.form = 'caster';
      this.ev({ t: 'text', uid: this.p.uid, text: 'Caster Form' });
    }
    // form abilities shift you into their form
    if (def.form && this.p.form !== def.form) this.setForm(def.form);
    const ctx = this.mkCtx(ci, def, target);
    const dealsDamage = cardActions(def, ci.up).some(a => a.k === 'dmg');
    for (const a of cardActions(def, ci.up)) {
      if (this.over) break;
      this.doAction(a, ctx, ci.up);
    }
    if (dealsDamage && this.p.st.critnext) { this.p.st.critnext--; if (this.p.st.critnext <= 0) delete this.p.st.critnext; }
    if (def.type === 'attack') {
      this.attacksThisTurn++;
      if (this.p.seal && !this.over) SEALS[this.p.seal]?.onAttack?.(this, ctx);
      if (this.p.st.sweep && dealsDamage) { this.p.st.sweep--; if (!this.p.st.sweep) delete this.p.st.sweep; }
      if (this.p.st.stealth) delete this.p.st.stealth;
    }
    if (kw.includes('opener')) delete this.p.st.stealth;
    if (kw.includes('finisher')) this.p.cp = 0;
    this.cardsPlayedThisTurn++;
    this.each(x => x.h.onCardPlayed?.(this, x.n, def, ctx));
    if (def.type === 'aura') { /* auras vanish once played */ }
    else if (kw.includes('cooldown')) this.exhaust.push(ci);
    else this.discard.push(ci);
    this.checkEnd();
    return true;
  }

  resolveTargets(tgt: string | undefined, ctx: PlayCtx): Unit[] {
    switch (tgt) {
      case 'all': return this.alive();
      case 'random': { const r = this.randomEnemy(); return r ? [r] : []; }
      case 'self': return [this.p];
      default: {
        const t = ctx.target && !ctx.target.dead ? ctx.target : this.randomEnemy();
        return t ? [t] : [];
      }
    }
  }

  doAction(a: Action, ctx: PlayCtx, up: boolean) {
    const def = ctx.def;
    switch (a.k) {
      case 'dmg': {
        const school = this.cardSchool(def, a);
        for (let h = 0; h < (a.hits ?? 1); h++) {
          const tgt = a.tgt ?? 'enemy';
          const targets = this.resolveTargets(tgt, ctx);
          if (tgt === 'enemy' && def.type === 'attack' && this.p.st.sweep && targets[0]) {
            const other = this.randomEnemy(targets[0] as Enemy);
            if (other) targets.push(other);
          }
          for (const t of targets) {
            const base = a.n + this.scaleVal(a.x, ctx, t);
            const d = this.calcCardHit(def, base, school, t, false);
            const dealt = this.hit(d);
            ctx.dealt += dealt;
            if (a.ls && dealt > 0) this.heal(Math.floor(dealt * a.ls));
            if (t.dead) ctx.killed = true;
          }
          if (this.over) return;
        }
        break;
      }
      case 'block': this.gainBlock(a.n + this.scaleVal(a.x, ctx, ctx.target), def); break;
      case 'absorb': {
        let amt = a.n + Math.floor(this.sp / 2);
        this.each(x => { amt = x.h.blockMod?.(this, x.n, amt, def) ?? amt; });
        this.p.st.absorb = (this.p.st.absorb ?? 0) + amt;
        this.ev({ t: 'block', uid: this.p.uid, n: amt });
        break;
      }
      case 'heal': this.heal(a.n + this.scaleVal(a.x, ctx, ctx.target) + this.sp + (this.p.st.sp ?? 0)); break;
      case 'apply': {
        const tgt = a.tgt ?? (STATUSES[a.s]?.debuff ? 'enemy' : 'self');
        const n = a.n + this.scaleVal(a.x, ctx, ctx.target);
        for (const t of this.resolveTargets(tgt, ctx)) this.applyStatus(t, a.s, n, true);
        break;
      }
      case 'draw': this.drawCards(a.n); break;
      case 'res': this.gainRes(a.n); break;
      case 'cp': this.gainCp(a.n); break;
      case 'shard': this.gainShards(a.n); break;
      case 'hp': this.loseHp(a.n); break;
      case 'seal': this.p.seal = a.id; this.ev({ t: 'text', uid: this.p.uid, text: SEALS[a.id]?.name ?? a.id }); break;
      case 'judge': {
        const s = this.p.seal;
        const t = ctx.target ?? this.randomEnemy();
        if (s && t) {
          SEALS[s]?.judge(this, t, up);
          if (!this.mem.keepSeal) this.p.seal = null;
        }
        break;
      }
      case 'totem': {
        const t = TOTEMS[a.id];
        if (t) {
          this.p.totems[t.element] = a.id;
          t.onPlace?.(this);
          this.ev({ t: 'text', uid: this.p.uid, text: t.name });
        }
        break;
      }
      case 'form': this.setForm(a.id); break;
      case 'pet': {
        const pd = PETS[a.id];
        if (pd) {
          this.p.pet = { id: a.id, name: pd.name, dmg: pd.dmg + (up ? 2 : 0), icon: pd.icon };
          pd.onSummon?.(this);
          this.ev({ t: 'summon', uid: this.p.uid, text: pd.name });
        }
        break;
      }
      case 'petAtk': {
        const pet = this.p.pet;
        const t = ctx.target ?? this.randomEnemy();
        if (pet && t) {
          const scale = this.p.cls === 'warlock' ? Math.floor(this.sp / 2) : Math.floor(this.ap / 2);
          this.effectDamage(t, pet.dmg + a.n + scale + (this.p.st.petpow ?? 0), PETS[pet.id]?.school ?? 'physical', 'pet');
          PETS[pet.id]?.onAttack?.(this, t);
        }
        break;
      }
      case 'add': for (let i = 0; i < (a.n ?? 1); i++) this.addCard(a.card, a.to); break;
      case 'cleanse': this.cleanse(this.p); break;
      case 'fn': a.f(this, ctx, up); break;
    }
  }

  setForm(f: Form) {
    this.p.form = f;
    FORMS[f]?.onEnter?.(this);
    this.ev({ t: 'text', uid: this.p.uid, text: FORMS[f]?.name ?? f });
  }

  /** Damage number to display on a card in hand for the first dmg action (deterministic, no crit). */
  previewDamage(ci: CardInst, target?: Unit): number | null {
    const def = getCard(ci.id);
    const a = cardActions(def, ci.up).find(x => x.k === 'dmg') as Extract<Action, { k: 'dmg' }> | undefined;
    if (!a) return null;
    const t = target ?? this.alive()[0] ?? this.p;
    const ctx = this.mkCtx(ci, def, target as Enemy | undefined);
    const base = a.n + this.scaleVal(a.x, ctx, t);
    const d = this.calcCardHit(def, base, this.cardSchool(def, a), t, true);
    return d.amt;
  }

  usePotion(slot: number, targetUid?: number): boolean {
    const id = this.potions[slot];
    if (!id || this.over) return false;
    const def = getCard(id);
    let target = this.enemies.find(e => e.uid === targetUid && !e.dead);
    if (this.needsTarget(def, false) && !target) {
      const al = this.alive();
      if (al.length === 1) target = al[0];
      else return false;
    }
    this.potions[slot] = null;
    const ctx = this.mkCtx({ uid: -1, id, up: false }, def, target);
    for (const a of def.a) this.doAction(a, ctx, false);
    this.ev({ t: 'play', uid: this.p.uid, text: def.name, card: def.id, tgt: target?.uid, school: def.school });
    this.checkEnd();
    return true;
  }
}
