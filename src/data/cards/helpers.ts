// Terse builders for card actions.
import type { Action, ApplyTarget, DmgTarget, Form, PlayCtx, Scale, School } from '../../engine/types';
import type { Combat } from '../../engine/combat';

export const dmg = (n: number, o: { hits?: number; tgt?: DmgTarget; x?: Scale; school?: School; ls?: number } = {}): Action => ({ k: 'dmg', n, ...o });
export const aoe = (n: number, o: { hits?: number; school?: School } = {}): Action => ({ k: 'dmg', n, tgt: 'all', ...o });
export const blk = (n: number, x?: Scale): Action => ({ k: 'block', n, x });
export const absorb = (n: number): Action => ({ k: 'absorb', n });
export const heal = (n: number, x?: Scale): Action => ({ k: 'heal', n, x });
export const app = (s: string, n: number, tgt?: ApplyTarget, x?: Scale): Action => ({ k: 'apply', s, n, tgt, x });
export const self = (s: string, n: number): Action => ({ k: 'apply', s, n, tgt: 'self' });
export const draw = (n: number): Action => ({ k: 'draw', n });
export const res = (n: number): Action => ({ k: 'res', n });
export const cp = (n: number): Action => ({ k: 'cp', n });
export const shard = (n: number): Action => ({ k: 'shard', n });
export const lose = (n: number): Action => ({ k: 'hp', n });
export const seal = (id: string): Action => ({ k: 'seal', id });
export const judge = (): Action => ({ k: 'judge' });
export const totem = (id: string): Action => ({ k: 'totem', id });
export const form = (id: Form): Action => ({ k: 'form', id });
export const pet = (id: string): Action => ({ k: 'pet', id });
export const petAtk = (n: number): Action => ({ k: 'petAtk', n });
export const add = (card: string, to: 'hand' | 'draw' | 'discard' = 'hand', n = 1): Action => ({ k: 'add', card, to, n });
export const cleanse = (): Action => ({ k: 'cleanse' });
export const fn = (t: string, f: (c: Combat, ctx: PlayCtx, up: boolean) => void): Action => ({ k: 'fn', t, f });
export const per = (src: Scale['src'], m: number): Scale => ({ src, m });
