import type { ClassId, HookSet, RaceId } from '../engine/types';

export interface RaceDef {
  id: RaceId;
  name: string;
  faction: 'Alliance' | 'Horde';
  classes: ClassId[];
  passiveName: string;
  passive: string;
  hooks: HookSet;
  skins: string[];
  hairColors: string[];
  body: { h: number; w: number };
  ears: 'round' | 'long' | 'pointy' | 'none';
  extra?: 'beard' | 'tusks' | 'horns' | 'jaw' | 'tusksBig';
  icon: string;
}

export const RACES: RaceDef[] = [
  {
    id: 'human', name: 'Human', faction: 'Alliance', icon: '🦁',
    classes: ['warrior', 'paladin', 'rogue', 'priest', 'mage', 'warlock'],
    passiveName: 'Diplomacy & The Human Spirit',
    passive: 'Vendors are 20% cheaper and you earn 10% more gold. +2 Spirit.',
    hooks: { run: { shop: 0.2, gold: 0.1 }, stats: { spi: 2 } },
    skins: ['#f1c7a5', '#e0ac85', '#c68863', '#8d5a3b', '#f6d7bf'],
    hairColors: ['#2b1d12', '#6b4423', '#c9a050', '#a33b1e', '#d9d2c5', '#111111'],
    body: { h: 1, w: 1 }, ears: 'round',
  },
  {
    id: 'dwarf', name: 'Dwarf', faction: 'Alliance', icon: '🍺',
    classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest'],
    passiveName: 'Stoneform',
    passive: 'The first time each combat you fall below 50% HP, gain 12 Block and remove all debuffs.',
    hooks: {
      onHurt: (c) => {
        if (!c.mem.stoneform && c.p.hp > 0 && c.p.hp < c.p.maxHp / 2) {
          c.mem.stoneform = 1; c.cleanse(c.p); c.gainBlock(12, undefined, true);
          c.ev({ t: 'text', uid: c.p.uid, text: 'Stoneform!' });
        }
      },
    },
    skins: ['#f0c19c', '#d9a07a', '#b07850', '#8a5a3c', '#e8d0bc'],
    hairColors: ['#3a2210', '#8b4513', '#d4a017', '#b22222', '#e8e8e8', '#222'],
    body: { h: 0.78, w: 1.25 }, ears: 'round', extra: 'beard',
  },
  {
    id: 'nightelf', name: 'Night Elf', faction: 'Alliance', icon: '🌙',
    classes: ['warrior', 'hunter', 'rogue', 'priest', 'druid'],
    passiveName: 'Shadowmeld & Quickness',
    passive: 'Start each combat with 1 Dodge. +3% crit chance.',
    hooks: { onCombatStart: c => c.applyStatus(c.p, 'dodge', 1, true), stats: { crit: 3 } },
    skins: ['#a98fd6', '#8a76c4', '#7b6bb5', '#b8a3e0', '#6c5aa0'],
    hairColors: ['#2f4f8f', '#5e9b8a', '#e8e8f0', '#6a3d9a', '#1f6f3f', '#9ad1d4'],
    body: { h: 1.12, w: 0.95 }, ears: 'long',
  },
  {
    id: 'gnome', name: 'Gnome', faction: 'Alliance', icon: '⚙️',
    classes: ['warrior', 'rogue', 'mage', 'warlock'],
    passiveName: 'Expansive Mind & Engineering Specialist',
    passive: 'On your first turn each combat, gain 1 extra resource and draw 1 extra card. Engineering items deal 50% more damage.',
    hooks: {
      resBonus: c => (c.turn === 1 ? 1 : 0),
      drawBonus: c => (c.turn === 1 ? 1 : 0),
      outDmg: (_c, _n, d) => { if (d.card?.tags?.includes('eng')) d.amt *= 1.5; },
    },
    skins: ['#f3cfb3', '#e6b796', '#d39e7c', '#f7e0d0', '#c58c6a'],
    hairColors: ['#ff69b4', '#40e0d0', '#ffd700', '#e8e8e8', '#7b68ee', '#ff4500'],
    body: { h: 0.62, w: 0.9 }, ears: 'pointy',
  },
  {
    id: 'orc', name: 'Orc', faction: 'Horde', icon: '🪓',
    classes: ['warrior', 'hunter', 'rogue', 'shaman', 'warlock'],
    passiveName: 'Blood Fury & Hardiness',
    passive: 'On your first turn each combat, your cards deal +3 damage. Immune to Daze (stuns).',
    hooks: {
      outDmg: (c, _n, d) => { if (c.turn === 1 && d.src === 'card') d.amt += 3; },
      applyMod: (_c, _n, s, amt, t) => (t.isPlayer && s === 'dazed' ? 0 : amt),
    },
    skins: ['#5f8f3a', '#4e7a2f', '#6f9e48', '#7a6a3a', '#3f6a2a'],
    hairColors: ['#111111', '#3a2a1a', '#6b4423', '#8b0000', '#d9d2c5', '#444'],
    body: { h: 1.05, w: 1.2 }, ears: 'pointy', extra: 'tusks',
  },
  {
    id: 'undead', name: 'Undead', faction: 'Horde', icon: '💀',
    classes: ['warrior', 'rogue', 'priest', 'mage', 'warlock'],
    passiveName: 'Cannibalize & Will of the Forsaken',
    passive: 'After each victorious combat, restore 6 HP. Immune to Fear.',
    hooks: {
      run: { postHeal: 6 },
      applyMod: (_c, _n, s, amt, t) => (t.isPlayer && s === 'feared' ? 0 : amt),
    },
    skins: ['#9fb0a0', '#8a9a8c', '#b5b9a8', '#7d8f86', '#a7a093'],
    hairColors: ['#2b2b2b', '#5a4a3a', '#8a8a8a', '#3f5f4f', '#6b2b2b', '#d0d0c0'],
    body: { h: 1, w: 0.85 }, ears: 'round', extra: 'jaw',
  },
  {
    id: 'tauren', name: 'Tauren', faction: 'Horde', icon: '🐂',
    classes: ['warrior', 'hunter', 'shaman', 'druid'],
    passiveName: 'Endurance & War Stomp',
    passive: '+15% Max HP. Start each combat by applying 1 Weakened to ALL enemies.',
    hooks: {
      run: { maxHpPct: 0.15 },
      onCombatStart: c => { for (const e of c.alive()) c.applyStatus(e, 'weak', 1, true); },
    },
    skins: ['#7a5230', '#5c3d22', '#3b2a1a', '#a07850', '#d8c8b0'],
    hairColors: ['#1a1a1a', '#3a2a1a', '#6b4423', '#d9d2c5', '#8b5a2b', '#555'],
    body: { h: 1.2, w: 1.4 }, ears: 'none', extra: 'horns',
  },
  {
    id: 'troll', name: 'Troll', faction: 'Horde', icon: '🗿',
    classes: ['warrior', 'hunter', 'rogue', 'priest', 'shaman', 'mage'],
    passiveName: 'Berserking & Regeneration',
    passive: 'At the start of your turn, if below 50% HP, gain 1 extra resource. Resting heals 10% more.',
    hooks: {
      resBonus: c => (c.p.hp < c.p.maxHp / 2 ? 1 : 0),
      run: { rest: 0.1 },
    },
    skins: ['#4f8fa0', '#3d7a8a', '#5fa39a', '#6a8fb0', '#3f6f7a'],
    hairColors: ['#d24d57', '#2ecc71', '#3498db', '#f39c12', '#e8e8e8', '#8e44ad'],
    body: { h: 1.1, w: 1 }, ears: 'long', extra: 'tusksBig',
  },
];

export const RACE_BY_ID = Object.fromEntries(RACES.map(r => [r.id, r])) as Record<RaceId, RaceDef>;
