// High-level dungeons: Zul'Farrak, Blackrock Depths, Stratholme, Upper Blackrock Spire.
import type { DungeonDef } from './dsl';
import { atk, blk, blkAll, buff, buffAll, deb, heal, summon, card, fx, mv, mvI, enemy, elite, boss, healLowest, healNamed } from './dsl';

export const ZF: DungeonDef = {
  id: 'zf', name: "Zul'Farrak", tier: 6, kind: 'dungeon', lvl: '40–48', icon: '🏜️', colors: ['#3a2a10', '#c2a060'], unlock: 'sm',
  desc: 'The Sandfury trolls of Tanaris sacrifice prisoners atop their pyramid. Chief Ukorz Sandscalp rules from the temple steps.',
  acts: [{ name: "Zul'Farrak", rows: 12, bossName: 'Chief Ukorz Sandscalp',
    easy: [['zf_axe'], ['zf_scarab', 'zf_scarab', 'zf_scarab'], ['zf_witch']],
    normal: [['zf_axe', 'zf_witch'], ['zf_zombie', 'zf_zombie'], ['zf_basilisk', 'zf_scarab', 'zf_scarab'], ['zf_axe', 'zf_axe'], ['zf_witch', 'zf_zombie', 'zf_axe']],
    elites: [['zf_antusul'], ['zf_zumrah'], ['zf_gahzrilla'], ['zf_bly']],
    boss: ['zf_ukorz', 'zf_ruuzlu'] }],
  enemies: [
    enemy('zf_axe', 'Sandfury Axe Thrower', [26, 30], { k: 'humanoid', race: 'troll', c1: '#c2a060', c2: '#5a3a1a', wpn: 'axe' }, [mv('throw', 'Throw Axe', atk(6, 2)), mv('ham', 'Hamstring', atk(5), deb('weak', 1))]),
    enemy('zf_witch', 'Sandfury Witch Doctor', [22, 26], { k: 'humanoid', race: 'troll', c1: '#3a6a5a', c2: '#c2a060', wpn: 'staff', helm: 'mask' }, [mv('bolt', 'Shadow Bolt', atk(9)), mvI('ward', 'Healing Ward', 'buff', healLowest(10)), mv('hex', 'Hex', deb('dazed', 1), deb('weak', 1))]),
    enemy('zf_scarab', 'Scarab', [8, 10], { k: 'spider', c1: '#3a5a7a', c2: '#c0c03a', size: 0.6 }, [mv('bite', 'Bite', atk(3), deb('poison', 1)), mv('chomp', 'Chomp', atk(4))], { tags: ['beast'] }),
    enemy('zf_zombie', 'Sandfury Zombie', [30, 34], { k: 'skeleton', c1: '#8a9a7a', c2: '#5a3a1a' }, [mv('bite', 'Infected Bite', atk(7), card('c_wound', 1)), mv('claw', 'Claw', atk(9))], { tags: ['undead'] }),
    enemy('zf_basilisk', 'Sandfury Basilisk', [27, 31], { k: 'beast', c1: '#a08a5a', c2: '#5a4a2a' }, [mv('gaze', 'Crystal Gaze', deb('dazed', 1), blk(6)), mv('bite', 'Bite', atk(9))], { tags: ['beast'] }),
    elite('zf_antusul', "Antu'sul", [90, 96], { k: 'humanoid', race: 'troll', c1: '#2e5e5e', c2: '#c2a060', wpn: 'staff', helm: 'mask', size: 1.2 }, [mvI('ward', 'Healing Ward', 'buff', heal(15)), mv('grab', 'Earthgrab', deb('weak', 2), atk(6)), mv('lightning', 'Lightning Bolt', atk(13))],
      { phases: [{ pct: 50, msg: "Antu'sul: \"Sul'lithuz! Rise!\"", moves: ['lightning', 'grab', 'ward'], enter: c => { const s = c.spawn('zf_basilisk'); if (s) c.chooseMove(s); } }] }),
    elite('zf_zumrah', "Witch Doctor Zum'rah", [84, 90], { k: 'humanoid', race: 'troll', c1: '#3a3a5a', c2: '#7fff00', wpn: 'staff', helm: 'mask' }, [mv('volley', 'Shadow Bolt Volley', atk(7, 2)), mv('zombies', 'Summon Zombies', summon('zf_zombie', 2)), mv('ward', 'Ward of Zum\'rah', blk(14), buff('str', 1))], { first: 'zombies' }),
    elite('zf_gahzrilla', "Gahz'rilla", [108, 116], { k: 'serpent', c1: '#4a8ab0', c2: '#c0e0ff', size: 1.5 }, [mv('freeze', 'Freeze Solid', deb('dazed', 1), atk(8)), mv('slam', "Gahz'rilla Slam", atk(18)), mv('icicle', 'Icicle', atk(5, 3))], { tags: ['beast'] }),
    elite('zf_bly', 'Sergeant Bly', [84, 90], { k: 'humanoid', race: 'human', c1: '#5a5a5a', c2: '#8b0000', wpn: 'sword', off: 'shield' }, [mv('bash', 'Shield Bash', atk(9), deb('dazed', 1)), mv('revenge', 'Revenge', atk(12), blk(6)), mv('wall', 'Shield Wall', blk(18))]),
    boss('zf_ukorz', 'Chief Ukorz Sandscalp', [230, 240], { k: 'humanoid', race: 'troll', c1: '#c2a060', c2: '#8b0000', wpn: 'axe2h', helm: 'horned', size: 1.3 },
      [mv('cleave', 'Cleave', atk(14)), mv('enrage', 'Enrage', buff('str', 3), blk(8)), mv('slash', 'Wide Slash', atk(8, 2))], { first: 'cleave', tags: ['humanoid'] }),
    boss('zf_ruuzlu', 'Ruuzlu', [115, 125], { k: 'humanoid', race: 'troll', c1: '#5a3a1a', c2: '#c2a060', wpn: 'axe' }, [mv('strike', 'Strike', atk(9)), mv('exploit', 'Exploit Weakness', atk(6), deb('vuln', 2))], { tags: ['humanoid'] }),
  ],
};

export const BRD: DungeonDef = {
  id: 'brd', name: 'Blackrock Depths', tier: 7, kind: 'dungeon', lvl: '48–56', icon: '⚒️', colors: ['#1a0a05', '#8a2a0a'], unlock: 'zf',
  desc: 'The Dark Iron capital of Shadowforge City. Emperor Dagran Thaurissan holds Princess Moira under his spell.',
  acts: [{ name: 'Blackrock Depths', rows: 13, bossName: 'Emperor Dagran Thaurissan',
    easy: [['brd_guard'], ['brd_hound', 'brd_hound'], ['brd_torturer']],
    normal: [['brd_guard', 'brd_torturer'], ['brd_fireguard', 'brd_hound'], ['brd_golem', 'brd_torturer'], ['brd_guard', 'brd_guard'], ['brd_fireguard', 'brd_fireguard', 'brd_hound']],
    elites: [['brd_roccor'], ['brd_angerforge'], ['brd_argelmach'], ['brd_baelgar']],
    boss: ['brd_dagran', 'brd_moira'] }],
  enemies: [
    enemy('brd_guard', 'Anvilrage Guardsman', [30, 34], { k: 'humanoid', race: 'dwarf', c1: '#3a3a3a', c2: '#ff4500', wpn: 'mace', off: 'shield', helm: 'plate' }, [mv('bash', 'Shield Bash', atk(8), blk(6)), mv('strike', 'Strike', atk(11))]),
    enemy('brd_fireguard', 'Fireguard Destroyer', [28, 32], { k: 'elemental', c1: '#ff6a1f', c2: '#3a3a3a' }, [mv('nova', 'Fire Nova', atk(5), deb('burn', 3)), mv('buffet', 'Flame Buffet', atk(10))], { tags: ['elemental'] }),
    enemy('brd_torturer', "Twilight's Hammer Torturer", [24, 28], { k: 'humanoid', race: 'human', c1: '#3a1a4a', c2: '#2a2a2a', wpn: 'dagger', helm: 'hood' }, [mv('bolt', 'Shadow Bolt', atk(10)), mv('curse', 'Curse of Agony', deb('affliction', 4), deb('vuln', 1))]),
    enemy('brd_golem', 'Ragereaver Golem', [36, 40], { k: 'golem', c1: '#5a4a3a', c2: '#ff4500' }, [mv('smash', 'Smash', atk(13)), mv('armor', 'Iron Plating', blk(12))], { tags: ['mech'] }),
    enemy('brd_hound', 'Bloodhound Mastiff', [20, 24], { k: 'hound', c1: '#5a3a2a', c2: '#2a1a0a' }, [mv('bite', 'Bite', atk(7)), mv('feast', 'Gnaw', atk(4), heal(4))], { tags: ['beast'] }),
    elite('brd_roccor', 'Lord Roccor', [100, 108], { k: 'elemental', c1: '#6a5a4a', c2: '#ff8a3a', size: 1.35 }, [mv('shock', 'Earth Shock', atk(12)), mv('tremor', 'Ground Tremor', deb('dazed', 1), atk(6)), mv('skin', 'Stoneskin', blk(15), buff('str', 1))], { tags: ['elemental'] }),
    elite('brd_angerforge', 'General Angerforge', [108, 116], { k: 'humanoid', race: 'dwarf', c1: '#2a2a2a', c2: '#ff4500', wpn: 'axe2h', helm: 'horned', size: 1.15 }, [mv('sunder', 'Sunder Armor', atk(8), deb('frail', 2)), mv('blow', 'Mighty Blow', atk(18)), mv('flurry', 'Flurry', atk(6, 2))],
      { phases: [{ pct: 40, msg: 'Angerforge: "Reinforcements!"', moves: ['blow', 'flurry', 'sunder'], enter: c => { for (let i = 0; i < 2; i++) { const s = c.spawn('brd_guard'); if (s) c.chooseMove(s); } } }] }),
    elite('brd_argelmach', 'Golem Lord Argelmach', [102, 110], { k: 'humanoid', race: 'dwarf', c1: '#3a3a4a', c2: '#4fc3f7', wpn: 'mace', helm: 'goggles' }, [mv('chain', 'Chain Lightning', atk(7, 2)), mv('shield', 'Lightning Shield', buff('thorns', 4), blk(10)), mv('golem', 'Activate Golem', summon('brd_golem'))]),
    elite('brd_baelgar', "Bael'Gar", [118, 126], { k: 'giant', c1: '#a03a1a', c2: '#ffb030', size: 1.4 }, [mv('spout', 'Lava Spout', atk(14), deb('burn', 3)), mv('volley', 'Fireball Volley', atk(6, 2)), mv('harden', 'Harden', blk(14))], { tags: ['elemental'] }),
    boss('brd_dagran', 'Emperor Dagran Thaurissan', [260, 270], { k: 'humanoid', race: 'dwarf', c1: '#1a1a1a', c2: '#ff4500', wpn: 'mace2h', helm: 'crown', size: 1.3 },
      [mv('hand', 'Hand of Thaurissan', atk(10), deb('dazed', 1)), mv('avatar', 'Avatar of Flame', atk(6, 3), deb('burn', 2)), mv('will', 'Iron Will', blk(20), buff('str', 2))], { first: 'hand', tags: ['humanoid'] }),
    boss('brd_moira', 'Princess Moira Bronzebeard', [110, 120], { k: 'humanoid', race: 'dwarf', c1: '#4a1a6a', c2: '#d4af37', wpn: 'staff', helm: 'crown' },
      [mvI('heal', 'Heal', 'buff', healNamed('brd_dagran', 25)), mv('blast', 'Mind Blast', atk(10)), mv('swp', 'Shadow Word: Pain', deb('affliction', 4), atk(3))], { tags: ['humanoid'] }),
  ],
};

export const STRAT: DungeonDef = {
  id: 'strat', name: 'Stratholme', tier: 8, kind: 'dungeon', lvl: '55–60', icon: '☠️', colors: ['#10140f', '#4a5a3a'], unlock: 'brd',
  desc: 'The plagued city burns eternally. Baron Rivendare commands the Scourge from his ziggurat.',
  acts: [{ name: 'Stratholme', rows: 13, bossName: 'Baron Rivendare',
    easy: [['st_rat', 'st_rat', 'st_rat'], ['st_ghoul'], ['st_spectre']],
    normal: [['st_ghoul', 'st_skeleton'], ['st_conjuror', 'st_spectre'], ['st_abom'], ['st_rat', 'st_rat', 'st_ghoul'], ['st_skeleton', 'st_conjuror', 'st_rat']],
    elites: [['st_ramstein'], ['st_barthilas'], ['st_balnazzar'], ['st_maleki']],
    boss: ['st_rivendare'] }],
  enemies: [
    enemy('st_ghoul', 'Ghoul Ravener', [30, 34], { k: 'skeleton', c1: '#7a8a6a', c2: '#3a2a1a' }, [mv('claw', 'Claw', atk(6, 2)), mv('plague', 'Ghoul Plague', atk(4), card('c_poisoned', 1))], { tags: ['undead'] }),
    enemy('st_skeleton', 'Skeletal Guardian', [30, 34], { k: 'skeleton', c1: '#e0e0d0', c2: '#5a5a6a', wpn: 'sword', off: 'shield' }, [mv('shield', 'Bone Shield', blk(12), atk(3)), mv('bash', 'Bash', atk(11))], { tags: ['undead'] }),
    enemy('st_conjuror', 'Crimson Conjuror', [26, 30], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#4fc3f7', wpn: 'staff' }, [mv('fireball', 'Fireball', atk(11), deb('burn', 2)), mv('water', 'Summon Water Elemental', summon('st_water'))]),
    enemy('st_water', 'Water Elemental', [20, 24], { k: 'elemental', c1: '#3a8ad0', c2: '#c0e8ff' }, [mv('bolt', 'Frostbolt', atk(7), deb('frail', 1))], { tags: ['elemental'] }),
    enemy('st_rat', 'Plagued Rat', [9, 12], { k: 'rat', c1: '#6a6a5a', c2: '#7fff00' }, [mv('bite', 'Diseased Bite', atk(4), deb('poison', 2))], { tags: ['beast'] }),
    enemy('st_abom', 'Venom Belcher', [44, 50], { k: 'giant', c1: '#8aa07a', c2: '#5a2a2a' }, [mv('cleave', 'Cleave', atk(14)), mv('cloud', 'Poison Cloud', deb('poison', 5), blk(8))], { tags: ['undead'] }),
    enemy('st_spectre', 'Spectral Citizen', [22, 26], { k: 'ghost', c1: '#b0c8e0', c2: '#4a5a7a' }, [mv('wail', 'Wail', deb('feared', 1), deb('weak', 1)), mv('touch', 'Haunting Touch', atk(8))], { tags: ['undead'] }),
    elite('st_ramstein', 'Ramstein the Gorger', [136, 146], { k: 'giant', c1: '#8aa07a', c2: '#3a3a2a', size: 1.5 }, [mv('ko', 'Knockout', atk(12), deb('dazed', 1)), mv('trample', 'Trample', atk(7, 2)), mv('gorge', 'Gorge', heal(20), buff('str', 2))], { tags: ['undead'] }),
    elite('st_barthilas', 'Magistrate Barthilas', [98, 106], { k: 'humanoid', race: 'human', c1: '#3a3a5a', c2: '#c0c0c0', wpn: 'mace' }, [mv('crow', 'Crow Form', blk(15), buff('str', 1)), mv('drain', 'Drain Blow', atk(10), heal(6)), mv('blow', 'Mighty Blow', atk(16))], { tags: ['undead'] }),
    elite('st_balnazzar', 'Balnazzar', [128, 136], { k: 'demon', c1: '#5a1a5a', c2: '#2a0a2a', size: 1.4 }, [mv('shock', 'Shadow Shock', atk(12), deb('vuln', 1)), mv('dom', 'Domination', card('c_mind_control', 2, 'draw'), atk(6)), mv('scream', 'Psychic Scream', deb('feared', 2), atk(4))], { tags: ['demon'] }),
    elite('st_maleki', 'Maleki the Pallid', [108, 116], { k: 'skeleton', c1: '#c0d0e0', c2: '#3a5a8a', wpn: 'staff', helm: 'hood' }, [mv('bolt', 'Frostbolt', atk(10), deb('frail', 2)), mv('tomb', 'Ice Tomb', deb('dazed', 2), blk(6)), mv('drain', 'Drain Life', atk(8), heal(8))], { tags: ['undead'] }),
    boss('st_rivendare', 'Baron Rivendare', [300, 315], { k: 'humanoid', race: 'undead', c1: '#2a2a3a', c2: '#4a8aaa', wpn: 'sword2h', helm: 'skull', size: 1.3 },
      [mv('ms', 'Mortal Strike', atk(18), deb('weak', 1)), mv('bolt', 'Shadow Bolt', atk(10)), mv('aura', 'Unholy Aura', deb('affliction', 3), buff('str', 1)), mv('raise', 'Raise Dead', summon('st_skeleton', 2))],
      { first: 'raise', tags: ['undead'], base: ['ms', 'bolt', 'aura', 'raise'], phases: [{ pct: 40, msg: 'Rivendare invokes a Death Pact!', moves: ['ms', 'bolt', 'raise', 'pact'] }],
        lore: 'Master of Stratholme, rider of the Deathcharger.' }),
  ],
};
STRAT.enemies.find(e => e.id === 'st_rivendare')!.moves.push(mvI('pact', 'Death Pact', 'buff', fx((c, e) => {
  let n = 0;
  for (const x of c.alive()) if (x !== e && x.def.id === 'st_skeleton') { c.killEnemy(x); n++; }
  c.healUnit(e, Math.round((15 + 15 * n) * c.hpScale));
}, 'Sacrifice minions to heal')));

export const UBRS: DungeonDef = {
  id: 'ubrs', name: 'Upper Blackrock Spire', tier: 9, kind: 'dungeon', lvl: '58–60', icon: '🐉', colors: ['#1a0505', '#7a1010'], unlock: 'strat',
  desc: 'The Dark Horde and Blackrock dragonkin breed chromatic dragons atop the Spire. Slay General Drakkisath to earn the Blood of the Black Dragon Champion — and your attunement to Onyxia\'s Lair.',
  acts: [{ name: 'Upper Blackrock Spire', rows: 13, bossName: 'General Drakkisath',
    easy: [['ub_whelp', 'ub_whelp', 'ub_whelp'], ['ub_orc'], ['ub_worg', 'ub_worg']],
    normal: [['ub_orc', 'ub_summoner'], ['ub_dragonspawn', 'ub_whelp'], ['ub_flamescale', 'ub_flamescale'], ['ub_orc', 'ub_worg', 'ub_whelp'], ['ub_dragonspawn', 'ub_summoner']],
    elites: [['ub_rend'], ['ub_gyth'], ['ub_beast'], ['ub_solakar']],
    boss: ['ub_guard', 'ub_drakkisath', 'ub_guard'] }],
  enemies: [
    enemy('ub_orc', 'Blackhand Elite', [36, 40], { k: 'humanoid', race: 'orc', c1: '#1a1a1a', c2: '#c0392b', wpn: 'axe', off: 'shield', helm: 'horned' }, [mv('cleave', 'Cleave', atk(12)), mv('wall', 'Shield Wall', blk(15), atk(3))]),
    enemy('ub_dragonspawn', 'Rage Talon Dragonspawn', [42, 46], { k: 'giant', c1: '#a01a1a', c2: '#d4af37' }, [mv('strike', 'Fire Strike', atk(13), deb('burn', 2)), mv('clap', 'Thunderclap', atk(6), deb('weak', 1))], { tags: ['dragon'] }),
    enemy('ub_whelp', 'Rookery Whelp', [11, 14], { k: 'whelp', c1: '#3a3a3a', c2: '#c0392b' }, [mv('bite', 'Bite', atk(4)), mv('breath', 'Fire Breath', atk(2), deb('burn', 2))], { tags: ['dragon'] }),
    enemy('ub_flamescale', 'Rage Talon Flamescale', [28, 32], { k: 'whelp', c1: '#c0392b', c2: '#ffb030', size: 1.3 }, [mv('breath', 'Flame Breath', atk(8), deb('burn', 3)), mv('claw', 'Claw', atk(10))], { tags: ['dragon'] }),
    enemy('ub_worg', 'Bloodaxe Worg', [26, 30], { k: 'hound', c1: '#4a2a1a', c2: '#c0392b' }, [mv('bite', 'Bite', atk(9)), mv('howl', 'Howl', buffAll('str', 1), atk(3))], { tags: ['beast'] }),
    enemy('ub_summoner', 'Blackhand Summoner', [28, 32], { k: 'humanoid', race: 'orc', c1: '#2a0a3a', c2: '#c0392b', wpn: 'staff' }, [mv('fireball', 'Fireball', atk(12)), mv('whelps', 'Summon Whelps', summon('ub_whelp', 2))]),
    elite('ub_rend', 'Warchief Rend Blackhand', [146, 156], { k: 'humanoid', race: 'orc', c1: '#1a1a1a', c2: '#c0392b', wpn: 'polearm', helm: 'horned', size: 1.25 }, [mv('ww', 'Whirlwind', atk(7, 3)), mv('cleave', 'Cleave', atk(15)), mv('enrage', 'Enrage', buff('str', 3), blk(10))], { tags: ['humanoid'], lore: 'Son of Blackhand, Warchief of the Dark Horde.' }),
    elite('ub_gyth', 'Gyth', [152, 162], { k: 'dragon', c1: '#2a2a2a', c2: '#8acfff', size: 1.4 }, [mv('breath', 'Flame Breath', atk(12), deb('burn', 3)), mv('freeze', 'Freeze', deb('dazed', 1), atk(8)), mv('acid', 'Corrosive Acid', atk(6), deb('vuln', 2))], { tags: ['dragon'] }),
    elite('ub_beast', 'The Beast', [160, 170], { k: 'beast', c1: '#8a1a1a', c2: '#3a1a0a', size: 1.5 }, [mv('fireball', 'Fireball', atk(14)), mv('flamebreak', 'Flamebreak', atk(8), deb('burn', 4)), mv('terrify', 'Terrifying Roar', deb('feared', 2), atk(6))], { tags: ['beast'] }),
    elite('ub_solakar', 'Solakar Flamewreath', [126, 134], { k: 'humanoid', race: 'orc', c1: '#c0392b', c2: '#ffb030', wpn: 'staff' }, [mv('hatch', 'Hatch Eggs', summon('ub_whelp', 3)), mv('blast', 'Fire Blast', atk(12)), mv('shield', 'Fire Shield', buff('thorns', 4), blk(10))], { first: 'hatch' }),
    enemy('ub_guard', 'Chromatic Elite Guard', [66, 72], { k: 'giant', c1: '#5a2a7a', c2: '#d4af37' }, [mv('knock', 'Knockdown', deb('dazed', 1), atk(8)), mv('strike', 'Strike', atk(12))], { tags: ['dragon'] }),
    boss('ub_drakkisath', 'General Drakkisath', [320, 335], { k: 'giant', c1: '#8a0a0a', c2: '#1a1a1a', wpn: 'polearm', size: 1.55 },
      [mv('flamestrike', 'Flamestrike', atk(8, 2), deb('burn', 2)), mv('cleave', 'Cleave', atk(18)), mv('conflag', 'Conflagration', card('c_burning', 2, 'hand'), atk(6)), mv('rage', 'Rage', buff('str', 3), blk(12))],
      { first: 'cleave', tags: ['dragon'], lore: 'Commander of the Blackrock dragonkin; his blood opens the way to Onyxia.' }),
  ],
};
