// Run difficulties. The index is stored as RunState.rank and Character.cleared[dungeon].

export type DifficultyId = 'normal' | 'heroic' | 'mythic' | 'hardcore';

export interface DifficultyDef {
  id: DifficultyId;
  name: string;
  icon: string;
  color: string;
  /** enemy health / damage multipliers on top of the dungeon's own scaling */
  hp: number;
  dmg: number;
  /** quality boost for random loot rolls */
  loot: number;
  xp: number;
  /** which dungeon set tiers can drop (1 = Dungeon Set 1, 2 = Dungeon Set 2) */
  sets: (1 | 2)[];
  /** extra items you may keep at the end of a won run */
  keepBonus: number;
  permadeath?: boolean;
  blurb: string;
}

/**
 * Difficulty strength k, fitted by tests/difftune.test.ts (DIFFTUNE=1):
 * heroes who progressed through Normal win ~20% on Heroic and ~10% on Mythic.
 * Enemy HP scales by k and enemy damage by 1 + 0.6·(k − 1).
 */
export const DIFF_TUNE = { heroic: 1.45, mythic: 1.64 };

const scale = (k: number) => ({ hp: k, dmg: 1 + 0.6 * (k - 1) });

export const DIFFICULTIES: DifficultyDef[] = [
  { id: 'normal', name: 'Normal', icon: '⚔️', color: '#c9b48a', ...scale(1), loot: 0, xp: 1, sets: [], keepBonus: 0,
    blurb: 'The standard experience.' },
  { id: 'heroic', name: 'Heroic', icon: '🛡️', color: '#4ab0ff', ...scale(DIFF_TUNE.heroic), loot: 2, xp: 1.3, sets: [1], keepBonus: 1,
    blurb: 'Tougher, harder-hitting enemies. More rare loot and Dungeon Set 1 pieces. Keep 1 extra item.' },
  { id: 'mythic', name: 'Mythic', icon: '🔥', color: '#c86bff', ...scale(DIFF_TUNE.mythic), loot: 4, xp: 1.6, sets: [1, 2], keepBonus: 1,
    blurb: 'Brutal enemies. Rare and epic loot, plus Dungeon Set 1 and 2 pieces. Keep 1 extra item.' },
  { id: 'hardcore', name: 'Hardcore', icon: '☠️', color: '#ff4a3a', ...scale(DIFF_TUNE.mythic), loot: 4, xp: 1.6, sets: [1, 2], keepBonus: 1, permadeath: true,
    blurb: 'Mythic difficulty with permadeath: if you fall, this hero and all of their progress are erased forever.' },
];

export function difficulty(rank: number): DifficultyDef {
  return DIFFICULTIES[Math.max(0, Math.min(DIFFICULTIES.length - 1, rank))];
}

/** Re-derive multipliers after the tuner changes DIFF_TUNE (tests only). */
export function applyDiffTune() {
  Object.assign(DIFFICULTIES[1], scale(DIFF_TUNE.heroic));
  Object.assign(DIFFICULTIES[2], scale(DIFF_TUNE.mythic));
  Object.assign(DIFFICULTIES[3], scale(DIFF_TUNE.mythic));
}
