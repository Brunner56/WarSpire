// Leveling dungeons: Ragefire Chasm, The Deadmines, Wailing Caverns, Shadowfang Keep, Scarlet Monastery.
import type { DungeonDef } from './dsl';
import { atk, blk, blkAll, buff, buffAll, deb, heal, summon, card, fx, mv, mvI, enemy, elite, boss, healLowest, healNamed } from './dsl';

export const RFC: DungeonDef = {
  id: 'rfc', name: 'Ragefire Chasm', tier: 1, kind: 'dungeon', lvl: '1–10', icon: '🔥', colors: ['#3a0d06', '#a8340f'],
  desc: 'Beneath Orgrimmar, the Searing Blade cult and their troggs serve the demon Taragaman.',
  acts: [{ name: 'Ragefire Chasm', rows: 11, bossName: 'Taragaman the Hungerer',
    easy: [['rfc_trogg'], ['rfc_cultist'], ['rfc_earthborer', 'rfc_earthborer']],
    normal: [['rfc_trogg', 'rfc_shaman'], ['rfc_cultist', 'rfc_enforcer'], ['rfc_molten', 'rfc_trogg'], ['rfc_earthborer', 'rfc_earthborer', 'rfc_shaman'], ['rfc_enforcer', 'rfc_shaman']],
    elites: [['rfc_oggleflint'], ['rfc_jergosh'], ['rfc_bazzalan']],
    boss: ['rfc_taragaman'] }],
  enemies: [
    enemy('rfc_trogg', 'Ragefire Trogg', [16, 20], { k: 'trogg', c1: '#7a5a4a', c2: '#3a2a1a' }, [mv('claw', 'Claw', atk(6)), mv('bash', 'Bash', atk(4), deb('weak', 1))]),
    enemy('rfc_shaman', 'Ragefire Shaman', [12, 15], { k: 'trogg', c1: '#6a5a6a', c2: '#c0392b' }, [mv('bolt', 'Lightning Bolt', atk(5)), mvI('heal', 'Healing Wave', 'buff', healLowest(6)), mv('lust', 'Bloodlust', buffAll('str', 1))]),
    enemy('rfc_cultist', 'Searing Blade Cultist', [17, 21], { k: 'humanoid', race: 'orc', c1: '#7a1a1a', c2: '#2a2a2a', wpn: 'dagger' }, [mv('curse', 'Curse of Agony', atk(3), deb('weak', 1)), mv('bolt', 'Shadow Bolt', atk(7))]),
    enemy('rfc_enforcer', 'Searing Blade Enforcer', [22, 26], { k: 'humanoid', race: 'orc', c1: '#5a1a1a', c2: '#8a8a8a', wpn: 'axe', off: 'shield' }, [mv('slam', 'Shield Slam', atk(6), blk(5)), mv('strike', 'Strike', atk(9))]),
    enemy('rfc_molten', 'Molten Elemental', [18, 22], { k: 'elemental', c1: '#ff5a1f', c2: '#ffd27a' }, [mv('fire', 'Fire Shield', atk(5), deb('burn', 2)), mv('blast', 'Flame Buffet', atk(8))], { tags: ['elemental'] }),
    enemy('rfc_earthborer', 'Earthborer', [13, 16], { k: 'serpent', c1: '#8a6a4a', c2: '#4a3a2a' }, [mv('acid', 'Acid', atk(4), deb('frail', 1)), mv('burrow', 'Burrow', blk(7), atk(2))], { tags: ['beast'] }),
    elite('rfc_oggleflint', 'Oggleflint', [56, 62], { k: 'trogg', c1: '#8a6a3a', c2: '#3a2a1a', size: 1.25 }, [mv('cleave', 'Cleave', atk(11)), mv('enrage', 'Enrage', buff('str', 2), blk(6)), mv('frenzy', 'Frenzy', atk(5, 2))], { first: 'cleave' }),
    elite('rfc_jergosh', 'Jergosh the Invoker', [50, 56], { k: 'humanoid', race: 'orc', c1: '#4a0a5a', c2: '#c0392b', wpn: 'staff' }, [mv('immolate', 'Immolate', atk(6), deb('burn', 3)), mv('curse', 'Curse of Weakness', deb('weak', 2), deb('frail', 1)), mv('bolt', 'Shadow Bolt', atk(12))], { pattern: ['immolate', 'curse', 'bolt'], tags: ['humanoid'] }),
    elite('rfc_bazzalan', 'Bazzalan', [52, 58], { k: 'demon', c1: '#8a3a2a', c2: '#3a1a0a' }, [mv('ss', 'Sinister Strike', atk(9)), mv('poison', 'Deadly Poison', atk(4), deb('poison', 4)), mv('evasion', 'Evasion', blk(10), buff('str', 1))], { tags: ['demon'] }),
    boss('rfc_taragaman', 'Taragaman the Hungerer', [150, 160], { k: 'demon', c1: '#b0301a', c2: '#3a0a0a', size: 1.4 },
      [mv('uppercut', 'Uppercut', atk(14)), mv('nova', 'Fire Nova', atk(5), deb('burn', 3)), mv('feast', 'Hungering Feast', heal(12), buff('str', 2)), mv('rend', 'Demonic Rend', atk(4, 3))],
      { first: 'uppercut', tags: ['demon'], lore: 'A ravenous demon fed by the Searing Blade.' }),
  ],
};

export const DM: DungeonDef = {
  id: 'dm', name: 'The Deadmines', tier: 2, kind: 'dungeon', lvl: '10–20', icon: '⛏️', colors: ['#1a1410', '#6b4a2a'], unlock: 'rfc',
  desc: 'The Defias Brotherhood builds a juggernaut beneath Moonbrook. Edwin VanCleef awaits aboard his ship.',
  acts: [{ name: 'The Deadmines', rows: 12, bossName: 'Edwin VanCleef',
    easy: [['dm_miner'], ['dm_henchman'], ['dm_goblin', 'dm_goblin']],
    normal: [['dm_miner', 'dm_henchman'], ['dm_pirate', 'dm_pirate'], ['dm_goblin', 'dm_miner', 'dm_goblin'], ['dm_overseer', 'dm_henchman'], ['dm_pirate', 'dm_overseer']],
    elites: [['dm_rhahkzor'], ['dm_sneed'], ['dm_gilnid', 'dm_goblin'], ['dm_smite'], ['dm_cookie']],
    boss: ['dm_vancleef'] }],
  enemies: [
    enemy('dm_miner', 'Defias Miner', [17, 21], { k: 'humanoid', race: 'human', c1: '#6a4a2a', c2: '#8b0000', wpn: 'axe', helm: 'mask' }, [mv('pick', 'Pickaxe', atk(7)), mv('dig', 'Dig In', blk(6), atk(3))]),
    enemy('dm_henchman', 'Defias Henchman', [18, 22], { k: 'humanoid', race: 'human', c1: '#3a2a2a', c2: '#8b0000', wpn: 'dagger', helm: 'mask' }, [mv('stab', 'Backstab', atk(9)), mv('poison', 'Poisoned Blade', atk(3), deb('poison', 3))]),
    enemy('dm_pirate', 'Defias Pirate', [19, 23], { k: 'humanoid', race: 'human', c1: '#2a3a6a', c2: '#d4af37', wpn: 'sword', helm: 'hat' }, [mv('cut', 'Cutlass Flurry', atk(4, 2)), mv('grog', 'Grog', buff('str', 2), blk(3))]),
    enemy('dm_goblin', 'Goblin Engineer', [13, 16], { k: 'humanoid', race: 'gnome', c1: '#4a7a3a', c2: '#c08a3a', wpn: 'mace', helm: 'goggles' }, [mv('bomb', 'Explosive Charge', atk(8)), mvI('repair', 'Field Repair', 'defend', blkAll(4))]),
    enemy('dm_overseer', 'Defias Overseer', [24, 28], { k: 'humanoid', race: 'human', c1: '#5a1a1a', c2: '#2a2a2a', wpn: 'sword', helm: 'mask' }, [mv('rally', 'Rally', buffAll('str', 1), blk(4)), mv('whip', 'Whip', atk(8), deb('vuln', 1))]),
    enemy('dm_blackguard', 'Defias Blackguard', [15, 18], { k: 'humanoid', race: 'human', c1: '#1a1a1a', c2: '#5a0a0a', wpn: 'dagger', helm: 'mask' }, [mv('stab', 'Stab', atk(6)), mv('kick', 'Kick', atk(3), deb('weak', 1))]),
    enemy('dm_sneed_pilot', 'Sneed', [20, 24], { k: 'humanoid', race: 'gnome', c1: '#4a7a3a', c2: '#d4af37', wpn: 'mace' }, [mv('disarm', 'Disarm', deb('weak', 2), atk(4)), mv('hit', 'Wrench', atk(7))]),
    elite('dm_rhahkzor', "Rhahk'Zor", [66, 72], { k: 'giant', c1: '#8a6a4a', c2: '#5a3a1a', wpn: 'mace2h' }, [mv('slam', "Rhahk'Zor Slam", atk(15)), mv('roar', 'Bellow', buff('str', 3), blk(5)), mv('swipe', 'Swipe', atk(6, 2))], { pattern: ['swipe', 'slam', 'roar'], lore: '"VanCleef pay big for your heads!"' }),
    elite('dm_sneed', "Sneed's Shredder", [64, 70], { k: 'golem', c1: '#8a7a3a', c2: '#5a5a5a' }, [mv('saw', 'Saw Blades', atk(4, 3)), mv('overdrive', 'Overdrive', blk(12), buff('str', 1))], { tags: ['mech'], onDeath: c => { const s = c.spawn('dm_sneed_pilot'); if (s) c.chooseMove(s); } }),
    elite('dm_gilnid', 'Gilnid', [58, 64], { k: 'humanoid', race: 'gnome', c1: '#3a5a2a', c2: '#ff6600', wpn: 'mace' }, [mv('metal', 'Molten Metal', atk(7), deb('burn', 3)), mv('smelt', 'Smelt Dark Iron', blk(10), buff('str', 1)), mv('call', 'Call Engineer', summon('dm_goblin'))]),
    elite('dm_smite', 'Mr. Smite', [76, 82], { k: 'humanoid', race: 'tauren', c1: '#3a2a2a', c2: '#8b0000', wpn: 'mace2h' }, [mv('slam', 'Smite Slam', atk(16)), mv('stomp', 'Smite Stomp', deb('dazed', 1), blk(10)), mv('cleave', 'Thrash', atk(5, 2))],
      { base: ['slam', 'stomp', 'cleave'], phases: [{ pct: 50, msg: 'Mr. Smite: "You landlubbers are tougher than I thought!"', moves: ['slam', 'cleave'], enter: (c, e) => c.applyStatus(e, 'str', 3, false) }] }),
    elite('dm_cookie', 'Cookie', [60, 66], { k: 'murloc', c1: '#3a8a6a', c2: '#ffffff' }, [mv('cook', "Cookie's Cooking", heal(10), buff('str', 1)), mv('ladle', 'Ladle Smack', atk(9)), mv('acid', 'Spoiled Stew', atk(4), deb('poison', 4))]),
    boss('dm_vancleef', 'Edwin VanCleef', [185, 195], { k: 'humanoid', race: 'human', c1: '#1a1a1a', c2: '#8b0000', wpn: 'sword', off: 'weapon', helm: 'mask', size: 1.15 },
      [mv('thrash', 'Thrash', atk(5, 3)), mv('cut', 'Cutthroat', atk(12), deb('weak', 1)), mv('guards', 'Call Blackguards', summon('dm_blackguard', 2)), mv('vanish', 'Vanish', buff('str', 3), blk(15)), mv('expose', 'Expose Weakness', atk(6), deb('vuln', 2))],
      { first: 'cut', tags: ['humanoid'], base: ['thrash', 'cut', 'guards', 'expose'], phases: [{ pct: 50, msg: 'VanCleef: "None may challenge the Brotherhood!"', moves: ['thrash', 'vanish', 'expose', 'cut'], enter: c => { for (let i = 0; i < 2; i++) { const s = c.spawn('dm_blackguard'); if (s) c.chooseMove(s); } } }],
        lore: 'Leader of the Defias Brotherhood, betrayed by the nobles of Stormwind.' }),
  ],
};

export const WC: DungeonDef = {
  id: 'wc', name: 'Wailing Caverns', tier: 3, kind: 'dungeon', lvl: '15–25', icon: '🐍', colors: ['#0d2416', '#3f7a3a'], unlock: 'dm',
  desc: 'The Druids of the Fang have twisted Naralex\'s dream into a nightmare of deviate beasts.',
  acts: [{ name: 'Wailing Caverns', rows: 12, bossName: 'Mutanus the Devourer',
    easy: [['wc_raptor'], ['wc_viper', 'wc_viper'], ['wc_lasher']],
    normal: [['wc_raptor', 'wc_viper'], ['wc_fang', 'wc_lasher'], ['wc_ecto', 'wc_viper'], ['wc_fang', 'wc_raptor'], ['wc_lasher', 'wc_lasher', 'wc_viper']],
    elites: [['wc_anacondra'], ['wc_cobrahn'], ['wc_kresh'], ['wc_verdan']],
    boss: ['wc_mutanus'] }],
  enemies: [
    enemy('wc_raptor', 'Deviate Ravager', [19, 23], { k: 'beast', c1: '#4a7a3a', c2: '#a0522d' }, [mv('bite', 'Bite', atk(7)), mv('rend', 'Rend', atk(3), deb('bleed', 3))], { tags: ['beast'] }),
    enemy('wc_fang', 'Druid of the Fang', [22, 26], { k: 'humanoid', race: 'nightelf', c1: '#2e5e2e', c2: '#8a6a3a', wpn: 'staff' }, [mv('bolt', 'Lightning Bolt', atk(8)), mvI('heal', 'Healing Touch', 'buff', healLowest(10)), mv('sleep', 'Slumber', deb('feared', 1), atk(3))]),
    enemy('wc_lasher', 'Deviate Lasher', [16, 20], { k: 'plant', c1: '#3a8a3a', c2: '#c03a8a' }, [mv('lash', 'Lash', atk(4, 2)), mv('slash', 'Wide Slash', atk(5), deb('frail', 1))]),
    enemy('wc_ecto', 'Evolving Ectoplasm', [20, 24], { k: 'ooze', c1: '#7acf5a', c2: '#3a6a2a' }, [mv('acid', 'Acid Splash', atk(5), deb('vuln', 1)), mv('evolve', 'Evolve', buff('str', 2), blk(5))]),
    enemy('ev_murloc', 'Murloc Tidehunter', [14, 18], { k: 'murloc', c1: '#3a8a8a', c2: '#c0a03a' }, [mv('spear', 'Spear Jab', atk(6)), mv('mrgl', 'Mrrglglgl!', buffAll('str', 1), atk(2))], { tags: ['beast'] }),
    enemy('ev_murloc_oracle', 'Murloc Oracle', [12, 15], { k: 'murloc', c1: '#5a7a3a', c2: '#a03aa0' }, [mv('bolt', 'Lightning Bolt', atk(7)), mvI('heal', 'Healing Wave', 'buff', healLowest(8))], { tags: ['beast'] }),
    enemy('wc_viper', 'Deviate Viper', [11, 14], { k: 'serpent', c1: '#5a8a3a', c2: '#c0c03a' }, [mv('bite', 'Poison Bite', atk(3), deb('poison', 3)), mv('strike', 'Strike', atk(5))], { tags: ['beast'] }),
    elite('wc_anacondra', 'Lady Anacondra', [66, 72], { k: 'humanoid', race: 'nightelf', c1: '#1e5e3e', c2: '#d4af37', wpn: 'staff' }, [mv('thorns', 'Thorns', buff('thorns', 3), blk(8)), mv('bolt', 'Lightning Bolt', atk(12)), mv('sleep', 'Sleep', deb('feared', 2), atk(4))]),
    elite('wc_cobrahn', 'Lord Cobrahn', [70, 76], { k: 'serpent', c1: '#2e7d32', c2: '#d4af37', size: 1.3 }, [mv('poison', 'Poison', atk(5), deb('poison', 5)), mv('form', 'Serpent Form', buff('str', 3), heal(10)), mv('bite', 'Bite', atk(13))]),
    elite('wc_kresh', 'Kresh', [78, 84], { k: 'beast', c1: '#6a7a4a', c2: '#3a4a2a', size: 1.3 }, [mv('snap', 'Snap', atk(11)), mv('shell', 'Shell Shield', blk(16))], { startBlock: 10, start: { fortify: 3 }, tags: ['beast'] }),
    elite('wc_verdan', 'Verdan the Everliving', [82, 88], { k: 'plant', c1: '#2a6a2a', c2: '#8acf5a', size: 1.4 }, [mv('vines', 'Grasping Vines', atk(8), deb('weak', 1)), mv('bloom', 'Lifebloom', heal(12), blk(4)), mv('crush', 'Crush', atk(14))]),
    boss('wc_mutanus', 'Mutanus the Devourer', [205, 215], { k: 'murloc', c1: '#3a6a5a', c2: '#8a2a5a', size: 1.6 },
      [mv('nightmare', "Naralex's Nightmare", deb('feared', 2), atk(6)), mv('terrify', 'Terrify', deb('weak', 2), deb('vuln', 2)), mv('devour', 'Devour', atk(16)), mv('crack', 'Thundercrack', atk(7, 2))],
      { first: 'crack', tags: ['beast'], base: ['nightmare', 'terrify', 'devour', 'crack'], phases: [{ pct: 50, msg: 'Mutanus feeds on the nightmare!', moves: ['devour', 'crack', 'nightmare'], enter: (c, e) => { c.healUnit(e, Math.round(15 * c.hpScale)); c.applyStatus(e, 'str', 2, false); } }] }),
  ],
};

export const SFK: DungeonDef = {
  id: 'sfk', name: 'Shadowfang Keep', tier: 4, kind: 'dungeon', lvl: '20–30', icon: '🐺', colors: ['#14121e', '#4a3a6a'], unlock: 'wc',
  desc: 'Archmage Arugal\'s worgen curse grips the keep overlooking Pyrewood.',
  acts: [{ name: 'Shadowfang Keep', rows: 12, bossName: 'Archmage Arugal',
    easy: [['sfk_worg'], ['sfk_bat', 'sfk_bat'], ['sfk_darkcaster']],
    normal: [['sfk_moonwalker', 'sfk_darkcaster'], ['sfk_servitor', 'sfk_bat'], ['sfk_worg', 'sfk_worg'], ['sfk_moonwalker', 'sfk_servitor'], ['sfk_darkcaster', 'sfk_worg', 'sfk_bat']],
    elites: [['sfk_rethilgore'], ['sfk_silverlaine'], ['sfk_springvale'], ['sfk_fenrus']],
    boss: ['sfk_arugal'] }],
  enemies: [
    enemy('sfk_moonwalker', 'Shadowfang Moonwalker', [22, 26], { k: 'hound', c1: '#5a5a6a', c2: '#2a2a3a' }, [mv('claw', 'Claw Flurry', atk(4, 2)), mv('howl', 'Howl', buffAll('str', 1), blk(4))]),
    enemy('sfk_servitor', 'Haunted Servitor', [22, 26], { k: 'ghost', c1: '#9ab0c8', c2: '#3a4a6a' }, [mv('haunt', 'Haunting', deb('feared', 1), atk(4)), mv('touch', 'Ghostly Touch', atk(8))], { tags: ['undead'] }),
    enemy('sfk_bat', 'Vampiric Bat', [12, 15], { k: 'beast', c1: '#3a2a3a', c2: '#8a1a1a', size: 0.7 }, [mv('bite', 'Draining Bite', atk(5), heal(3)), mv('screech', 'Screech', deb('weak', 1), atk(3))], { tags: ['beast'] }),
    enemy('sfk_darkcaster', 'Shadowfang Darkcaster', [18, 22], { k: 'humanoid', race: 'human', c1: '#2a1a3a', c2: '#6a5a8a', wpn: 'staff' }, [mv('bolt', 'Shadow Bolt', atk(9)), mv('curse', 'Curse of Shadow', deb('vuln', 2))]),
    enemy('sfk_worg', 'Wolfguard Worg', [20, 24], { k: 'hound', c1: '#6a6a6a', c2: '#3a3a3a' }, [mv('bite', 'Bite', atk(8)), mv('rend', 'Rend', atk(3), deb('bleed', 4))], { tags: ['beast'] }),
    elite('sfk_rethilgore', 'Rethilgore', [78, 84], { k: 'hound', c1: '#4a4a5a', c2: '#8a1a1a', size: 1.3 }, [mv('drain', 'Soul Drain', atk(10), heal(5)), mv('maul', 'Maul', atk(14)), mv('howl', 'Howl', buff('str', 2), blk(6))]),
    elite('sfk_silverlaine', 'Baron Silverlaine', [76, 82], { k: 'ghost', c1: '#c0c8d8', c2: '#4a4a6a', size: 1.2 }, [mv('veil', 'Veil of Shadow', deb('weak', 2), deb('frail', 2)), mv('strike', 'Shadow Strike', atk(7, 2))], { tags: ['undead'] }),
    elite('sfk_springvale', 'Commander Springvale', [82, 88], { k: 'humanoid', race: 'human', c1: '#4a4a5a', c2: '#d4af37', wpn: 'mace', off: 'shield' }, [mvI('light', 'Holy Light', 'buff', heal(15)), mv('hoj', 'Hammer of Justice', deb('dazed', 1), atk(8)), mv('devo', 'Devotion Aura', blk(15), buff('str', 1)), mv('strike', 'Crusader Strike', atk(12))], { tags: ['undead'] }),
    elite('sfk_fenrus', 'Fenrus the Devourer', [84, 90], { k: 'hound', c1: '#2a2a2a', c2: '#a0a0a0', size: 1.35 }, [mv('saliva', 'Toxic Saliva', atk(6), deb('poison', 4)), mv('devour', 'Devour', atk(15)), mv('frenzy', 'Frenzy', buff('str', 2), atk(5))]),
    boss('sfk_arugal', 'Archmage Arugal', [210, 220], { k: 'humanoid', race: 'undead', c1: '#3a1a5a', c2: '#c0c0c0', wpn: 'staff', helm: 'hood', size: 1.15 },
      [mv('volley', 'Shadow Bolt Volley', atk(6, 2)), mv('curse', "Arugal's Curse", deb('weak', 2), card('c_wound', 1)), mv('void', 'Void Bolt', atk(18)), mv('summon', 'Summon Worgen', summon('sfk_moonwalker'))],
      { first: 'volley', tags: ['undead', 'humanoid'], base: ['volley', 'curse', 'void', 'summon'], phases: [{ pct: 50, msg: 'Arugal: "Release your rage!"', moves: ['volley', 'void', 'thunder', 'summon'], enter: (c, e) => { e.block += Math.round(20 * c.hpScale); } }],
        lore: 'The archmage who summoned the worgen and lost his mind to them.' }),
  ],
};
// Arugal's late move
SFK.enemies.find(e => e.id === 'sfk_arugal')!.moves.push(mv('thunder', 'Thundershock', atk(10), blk(12)));

export const SM: DungeonDef = {
  id: 'sm', name: 'Scarlet Monastery', tier: 5, kind: 'dungeon', lvl: '28–40', icon: '🛐', colors: ['#2a0808', '#a01818'], unlock: 'sfk',
  desc: 'The zealots of the Scarlet Crusade guard their cathedral. High Inquisitor Whitemane keeps Commander Mograine from death itself.',
  acts: [{ name: 'Scarlet Monastery', rows: 12, bossName: 'Mograine & Whitemane',
    easy: [['sm_monk'], ['sm_wizard'], ['sm_spirit', 'sm_spirit']],
    normal: [['sm_monk', 'sm_wizard'], ['sm_myrmidon', 'sm_chaplain'], ['sm_spirit', 'sm_spirit', 'sm_wizard'], ['sm_myrmidon', 'sm_monk'], ['sm_chaplain', 'sm_myrmidon', 'sm_wizard']],
    elites: [['sm_loksey'], ['sm_doan'], ['sm_herod'], ['sm_vishas']],
    boss: ['sm_mograine', 'sm_whitemane'] }],
  enemies: [
    enemy('sm_monk', 'Scarlet Monk', [24, 28], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#e0e0e0', wpn: 'fist' }, [mv('kick', 'Flying Kick', atk(5, 2)), mv('evade', 'Evasion', blk(10))]),
    enemy('sm_myrmidon', 'Scarlet Myrmidon', [28, 32], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#c0c0c0', wpn: 'sword2h', helm: 'plate' }, [mv('strike', 'Strike', atk(10)), mv('enrage', 'Enrage', buff('str', 2), blk(4))]),
    enemy('sm_wizard', 'Scarlet Wizard', [20, 24], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#d4af37', wpn: 'staff' }, [mv('fireball', 'Fireball', atk(9), deb('burn', 2)), mv('armor', 'Frost Armor', blk(8), deb('frail', 1))]),
    enemy('sm_chaplain', 'Scarlet Chaplain', [22, 26], { k: 'humanoid', race: 'human', c1: '#ffffff', c2: '#8b0000', wpn: 'mace' }, [mvI('shield', 'Power Word: Shield', 'defend', blkAll(6)), mvI('renew', 'Renew', 'buff', healLowest(8)), mv('smite', 'Smite', atk(7))]),
    enemy('sm_spirit', 'Unfettered Spirit', [17, 21], { k: 'ghost', c1: '#a0c0d0', c2: '#5a6a8a' }, [mv('wail', 'Wail', deb('feared', 1), atk(4)), mv('touch', 'Chilling Touch', atk(7))], { tags: ['undead'] }),
    enemy('sm_hound', 'Scarlet Tracking Hound', [16, 19], { k: 'hound', c1: '#7a5a3a', c2: '#3a2a1a' }, [mv('bite', 'Bite', atk(7)), mv('track', 'Track', deb('vuln', 1), atk(3))], { tags: ['beast'] }),
    elite('sm_loksey', 'Houndmaster Loksey', [76, 82], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#6a4a2a', wpn: 'polearm' }, [mv('hounds', 'Release Hounds', summon('sm_hound', 2)), mv('lust', 'Bloodlust', buffAll('str', 2)), mv('strike', 'Strike', atk(12))], { first: 'hounds' }),
    elite('sm_doan', 'Arcanist Doan', [76, 82], { k: 'humanoid', race: 'human', c1: '#4a1a6a', c2: '#d4af37', wpn: 'staff' }, [mv('ae', 'Arcane Explosion', atk(6, 2)), mv('poly', 'Polymorph', deb('dazed', 2), deb('weak', 1)), mv('bubble', 'Arcane Bubble', blk(20), buff('str', 3))],
      { base: ['ae', 'poly', 'bubble'], phases: [{ pct: 50, msg: 'Doan: "Burn in righteous fire!"', moves: ['bubble', 'detonate', 'ae'] }] }),
    elite('sm_herod', 'Herod', [92, 98], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#d4af37', wpn: 'axe2h', helm: 'plate', size: 1.25 }, [mv('charge', 'Rushing Charge', atk(8), buff('str', 2)), mv('ww', 'Whirlwind', atk(6, 3)), mv('cleave', 'Cleave', atk(13))], { pattern: ['charge', 'cleave', 'ww'], lore: '"Blades of Light!"' }),
    elite('sm_vishas', 'Interrogator Vishas', [72, 78], { k: 'humanoid', race: 'human', c1: '#3a0a0a', c2: '#2a2a2a', wpn: 'dagger' }, [mv('swp', 'Shadow Word: Pain', deb('affliction', 5), atk(3)), mv('strike', 'Interrogate', atk(11)), mv('fear', 'Intimidate', deb('feared', 1), deb('weak', 1))]),
    boss('sm_mograine', 'Scarlet Commander Mograine', [150, 160], { k: 'humanoid', race: 'human', c1: '#8b0000', c2: '#d4af37', wpn: 'mace2h', helm: 'plate', size: 1.15 },
      [mv('cs', 'Crusader Strike', atk(12)), mv('hoj', 'Hammer of Justice', deb('dazed', 1), atk(6)), mv('shield', 'Divine Shield', blk(20), buff('str', 1))], { first: 'cs', tags: ['humanoid'] }),
    boss('sm_whitemane', 'High Inquisitor Whitemane', [110, 120], { k: 'humanoid', race: 'human', c1: '#ffffff', c2: '#8b0000', wpn: 'staff', helm: 'hat' },
      [mv('smite', 'Holy Smite', atk(8)), mvI('heal', 'Heal', 'buff', healNamed('sm_mograine', 20)), mv('sleep', 'Deep Sleep', deb('feared', 2), deb('dazed', 1)),
        mvI('rez', 'Scarlet Resurrection', 'special', fx((c, e) => { e.mem.rez = 1; const m = c.spawn('sm_mograine'); if (m) { m.hp = Math.round(m.maxHp * 0.5); c.chooseMove(m); c.ev({ t: 'text', uid: m.uid, text: 'Arise, my champion!' }); } }))],
      { tags: ['humanoid'], pick: (c, e) => {
        if (!e.mem.rez && !c.alive().some(x => x.def.id === 'sm_mograine')) return 'rez';
        const opts = ['smite', 'heal', 'sleep'].filter(m => m !== e.lastMoves[e.lastMoves.length - 1]);
        return c.rng.pick(opts);
      } }),
  ],
};
SM.enemies.find(e => e.id === 'sm_doan')!.moves.push(mv('detonate', 'Detonation', atk(9, 2)));
