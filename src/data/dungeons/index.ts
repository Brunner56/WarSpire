import type { EnemyDef } from '../../engine/types';
import type { DungeonDef } from './dsl';
import { RFC, DM, WC, SFK, SM } from './early';
import { ZF, BRD, STRAT, UBRS } from './late';
import { ONY, MC, BWL } from './raids';

export type { DungeonDef, ActDef } from './dsl';

export const DUNGEONS: DungeonDef[] = [RFC, DM, WC, SFK, SM, ZF, BRD, STRAT, UBRS, ONY, MC, BWL];
export const DUNGEON_BY_ID = Object.fromEntries(DUNGEONS.map(d => [d.id, d])) as Record<string, DungeonDef>;

const ENEMIES = new Map<string, EnemyDef>();
for (const d of DUNGEONS) for (const e of d.enemies) {
  if (ENEMIES.has(e.id)) throw new Error('Duplicate enemy ' + e.id);
  ENEMIES.set(e.id, e);
}

export function getEnemyDef(id: string): EnemyDef {
  const e = ENEMIES.get(id);
  if (!e) throw new Error('Unknown enemy ' + id);
  return e;
}
export const allEnemyIds = () => [...ENEMIES.keys()];

/** Per-tier difficulty tuning on top of the base curve, from the bot difficulty report (tests/difficulty.ts). */
export const TIER_TUNE: number[] = [1.66, 1.4, 1.49, 1.38, 1.34, 1.23, 1.13, 1.01, 1, 1.02, 0.81, 0.77];

/** HP and damage multipliers by dungeon tier. */
export const tierScale = (tier: number) => {
  const k = TIER_TUNE[tier - 1] ?? 1;
  return { hp: (1 + 0.15 * (tier - 1)) * k, dmg: (1 + 0.075 * (tier - 1)) * k };
};
