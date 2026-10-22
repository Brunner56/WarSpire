// Tiny DSL for writing enemies and dungeons.
import type { EAct, EnemyArt, EnemyDef, EnemyMove } from '../../engine/types';
import type { Combat } from '../../engine/combat';
import type { Enemy } from '../../engine/types';

export const atk = (n: number, hits?: number): EAct => ({ k: 'atk', n, hits });
export const blk = (n: number): EAct => ({ k: 'block', n });
export const blkAll = (n: number): EAct => ({ k: 'blockAll', n });
export const buff = (s: string, n: number): EAct => ({ k: 'buff', s, n });
export const buffAll = (s: string, n: number): EAct => ({ k: 'buffAll', s, n });
export const deb = (s: string, n: number): EAct => ({ k: 'debuff', s, n });
export const heal = (n: number): EAct => ({ k: 'heal', n });
export const summon = (id: string, n = 1): EAct => ({ k: 'summon', id, n });
export const card = (id: string, n = 1, to: 'discard' | 'draw' | 'hand' = 'discard'): EAct => ({ k: 'card', id, n, to });
export const fx = (f: (c: Combat, e: Enemy) => void, t?: string): EAct => ({ k: 'fn', f, t });
export const mv = (id: string, name: string, ...acts: EAct[]): EnemyMove => ({ id, name, acts });
export const mvI = (id: string, name: string, intent: EnemyMove['intent'], ...acts: EAct[]): EnemyMove => ({ id, name, acts, intent });

export const enemy = (id: string, name: string, hp: [number, number], art: EnemyArt, moves: EnemyMove[], o: Partial<EnemyDef> = {}): EnemyDef =>
  ({ id, name, hp, art, moves, ...o });
export const elite = (id: string, name: string, hp: [number, number], art: EnemyArt, moves: EnemyMove[], o: Partial<EnemyDef> = {}): EnemyDef =>
  ({ id, name, hp, art, moves, elite: true, ...o });
export const boss = (id: string, name: string, hp: [number, number], art: EnemyArt, moves: EnemyMove[], o: Partial<EnemyDef> = {}): EnemyDef =>
  ({ id, name, hp, art, moves, boss: true, ...o });

export interface ActDef {
  name: string;
  rows: number;
  easy: string[][];
  normal: string[][];
  elites: string[][];
  boss: string[];
  bossName: string;
}

export interface DungeonDef {
  id: string;
  name: string;
  tier: number;
  kind: 'dungeon' | 'raid';
  lvl: string;
  desc: string;
  icon: string;
  colors: [string, string];
  unlock?: string;
  acts: ActDef[];
  enemies: EnemyDef[];
}

// Common enemy behaviours
export const healLowest = (n: number): EAct => fx((c, e) => {
  const t = c.alive().filter(x => x.hp < x.maxHp).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] ?? e;
  c.healUnit(t, Math.round(n * c.hpScale));
}, `Heal ${n}`);
export const healAllies = (n: number): EAct => fx(c => { for (const x of c.alive()) c.healUnit(x, Math.round(n * c.hpScale)); }, `Heal all ${n}`);
export const healNamed = (id: string, n: number): EAct => fx((c, e) => {
  const t = c.alive().find(x => x.def.id === id) ?? e;
  c.healUnit(t, Math.round(n * c.hpScale));
}, `Heal ${n}`);
