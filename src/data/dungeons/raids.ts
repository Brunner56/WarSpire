// Raids: Onyxia's Lair, Molten Core, Blackwing Lair. Longer multi-act runs with phase-based bosses.
import type { DungeonDef } from './dsl';
import { atk, blk, blkAll, buff, buffAll, deb, heal, summon, card, fx, mv, mvI, enemy, elite, boss, healLowest, healAllies } from './dsl';
import type { Combat } from '../../engine/combat';

const spawnN = (c: Combat, id: string, n: number) => { for (let i = 0; i < n; i++) { const s = c.spawn(id); if (s) c.chooseMove(s); } };

// ======================= ONYXIA'S LAIR =======================
export const ONY: DungeonDef = {
  id: 'ony', name: "Onyxia's Lair", tier: 10, kind: 'raid', lvl: '60 · Raid', icon: '🐲', colors: ['#120808', '#5a1a3a'], unlock: 'ubrs',
  desc: 'Expose Lady Katrana Prestor\'s deception, then descend into Dustwallow\'s lair to slay the Broodmother herself.',
  acts: [
    { name: 'The Wyrmbog', rows: 9, bossName: 'Lady Katrana Prestor',
      easy: [['on_whelp', 'on_whelp', 'on_whelp'], ['on_warder']],
      normal: [['on_warder', 'on_whelp', 'on_whelp'], ['on_drake'], ['on_guard', 'on_whelp'], ['on_warder', 'on_warder']],
      elites: [['on_captain'], ['on_ancient']],
      boss: ['on_katrana'] },
    { name: "Onyxia's Lair", rows: 8, bossName: 'Onyxia',
      easy: [['on_whelp', 'on_whelp', 'on_whelp', 'on_whelp']],
      normal: [['on_guard', 'on_warder'], ['on_drake', 'on_whelp', 'on_whelp'], ['on_guard', 'on_guard'], ['on_warder', 'on_drake']],
      elites: [['on_captain', 'on_whelp'], ['on_ancient', 'on_warder']],
      boss: ['on_onyxia'] },
  ],
  enemies: [
    enemy('on_whelp', 'Onyxian Whelp', [14, 17], { k: 'whelp', c1: '#2a2a2a', c2: '#5a1a3a' }, [mv('bite', 'Bite', atk(5)), mv('breath', 'Flame Breath', atk(2), deb('burn', 2))], { tags: ['dragon'] }),
    enemy('on_warder', 'Onyxian Warder', [48, 54], { k: 'giant', c1: '#2a2a2a', c2: '#8a1a4a', wpn: 'polearm' }, [mv('nova', 'Fire Nova', atk(6), deb('burn', 2)), mv('pierce', 'Pierce Armor', atk(9), deb('vuln', 2))], { tags: ['dragon'] }),
    enemy('on_drake', 'Onyxian Drake', [58, 64], { k: 'dragon', c1: '#2a2a2a', c2: '#8a1a4a', size: 0.9 }, [mv('breath', 'Flame Breath', atk(12)), mv('tail', 'Tail Sweep', atk(6, 2))], { tags: ['dragon'] }),
    enemy('on_guard', 'Onyxian Lair Guard', [66, 72], { k: 'giant', c1: '#1a1a1a', c2: '#c0392b', wpn: 'axe2h' }, [mv('wave', 'Blast Wave', atk(8), deb('weak', 1)), mv('ignite', 'Ignite Armor', deb('frail', 3), atk(6))], { tags: ['dragon'] }),
    elite('on_captain', 'Scalebane Captain', [170, 180], { k: 'giant', c1: '#3a1a1a', c2: '#d4af37', wpn: 'sword2h', size: 1.2 }, [mv('cleave', 'Cleave', atk(16)), mv('rally', 'Rally the Brood', summon('on_whelp', 2), buff('str', 2)), mv('strike', 'Shield Bash', atk(9), deb('dazed', 1))], { tags: ['dragon'] }),
    elite('on_ancient', 'Wyrmbog Ancient', [180, 190], { k: 'serpent', c1: '#4a5a2a', c2: '#a0c03a', size: 1.5 }, [mv('acid', 'Acidic Spit', atk(8), deb('poison', 6)), mv('crush', 'Crushing Coils', atk(18)), mv('shed', 'Shed Skin', blk(20), heal(15))], { tags: ['beast'] }),
    boss('on_katrana', 'Lady Katrana Prestor', [260, 270], { k: 'humanoid', race: 'human', c1: '#1a1a1a', c2: '#8a1a4a', wpn: 'staff', helm: 'crown', hair: 3 },
      [mv('charm', 'Royal Charm', card('c_mind_control', 2, 'draw'), deb('weak', 1)), mv('guards', 'Summon Royal Guard', summon('on_warder')), mv('bolt', 'Shadow Bolt', atk(12)),
        mv('breath', 'Dragonfire', atk(10), deb('burn', 4)), mv('claw', 'Talon Rake', atk(8, 2)), mv('roar', 'Black Dragon Roar', deb('feared', 2), atk(8))],
      { first: 'bolt', tags: ['dragon', 'humanoid'], lore: 'A noblewoman of Stormwind\'s court... or is she?',
        phases: [{ pct: 50, msg: 'Katrana Prestor reveals her draconic form! "You meddlesome mortals!"', moves: ['breath', 'claw', 'roar'],
          enter: (c, e) => { e.name = 'Katrana, Unveiled'; c.applyStatus(e, 'str', 3, false); e.block += Math.round(15 * c.hpScale); } }] }),
    boss('on_onyxia', 'Onyxia', [470, 490], { k: 'dragon', c1: '#1a1a1a', c2: '#8a1a4a', size: 1.7 },
      [mv('breath', 'Flame Breath', atk(14), deb('burn', 3)), mv('tail', 'Tail Sweep', atk(7, 2)), mv('buffet', 'Wing Buffet', atk(10), deb('dazed', 1)), mv('cleave', 'Cleave', atk(18)),
        mv('fireball', 'Fireball', atk(16)), mv('whelps', 'Whelp Swarm', summon('on_whelp', 3)), mvI('deep', 'DEEP BREATH', 'attack', atk(32)),
        mv('roar', 'Bellowing Roar', deb('feared', 2), atk(8)), mv('erupt', 'Lava Eruption', atk(6, 3), deb('burn', 2))],
      { first: 'breath', tags: ['dragon'], lore: 'Broodmother of the black dragonflight, daughter of Deathwing.',
        phases: [
          { pct: 65, msg: 'Onyxia: "This meaningless exertion bores me. I\'ll incinerate you all from above!"', moves: ['fireball', 'whelps', 'deep', 'fireball'],
            enter: (c, e) => { e.st.airborne = 1; spawnN(c, 'on_whelp', 2); } },
          { pct: 40, msg: 'Onyxia: "It seems you\'ll need another lesson, mortals!"', moves: ['roar', 'erupt', 'breath', 'cleave', 'tail'],
            enter: (_c, e) => { delete e.st.airborne; } },
        ],
        pick: (c, e) => {
          const pool = c.movePool(e);
          if (e.phase === 1) { e.mem.p2 = (e.mem.p2 ?? 0) + 1; return e.mem.p2 % 3 === 0 ? 'deep' : c.rng.pick(['fireball', 'whelps', 'fireball']); }
          const last = e.lastMoves[e.lastMoves.length - 1];
          return c.rng.pick(pool.filter(m => m !== last));
        } }),
  ],
};

// ======================= MOLTEN CORE =======================
export const MC: DungeonDef = {
  id: 'mc', name: 'Molten Core', tier: 11, kind: 'raid', lvl: '60 · Raid', icon: '🌋', colors: ['#1a0500', '#c23a00'], unlock: 'ony',
  desc: 'Beneath Blackrock Mountain the Firelord Ragnaros stirs. Douse the runes, defeat his lieutenants and banish him from Azeroth.',
  acts: [
    { name: 'The Core', rows: 9, bossName: 'Garr',
      easy: [['mc_hound', 'mc_hound'], ['mc_surger']],
      normal: [['mc_giant'], ['mc_hound', 'mc_hound', 'mc_surger'], ['mc_flameguard', 'mc_surger'], ['mc_flamewaker', 'mc_flameguard']],
      elites: [['mc_lucifron', 'mc_protector'], ['mc_magmadar'], ['mc_gehennas', 'mc_protector']],
      boss: ['mc_firesworn', 'mc_garr', 'mc_firesworn'] },
    { name: 'Lieutenants of Flame', rows: 9, bossName: 'Majordomo Executus',
      easy: [['mc_giant'], ['mc_flamewaker', 'mc_surger']],
      normal: [['mc_giant', 'mc_surger'], ['mc_flamewaker', 'mc_flamewaker'], ['mc_hound', 'mc_hound', 'mc_flameguard'], ['mc_flameguard', 'mc_flameguard']],
      elites: [['mc_geddon'], ['mc_shazzrah'], ['mc_golemagg', 'mc_rager'], ['mc_sulfuron', 'mc_priest']],
      boss: ['mc_healer', 'mc_majordomo', 'mc_elite'] },
    { name: "Ragnaros' Lair", rows: 4, bossName: 'Ragnaros',
      easy: [['mc_surger', 'mc_surger']],
      normal: [['mc_giant', 'mc_flameguard'], ['mc_surger', 'mc_surger', 'mc_hound']],
      elites: [['mc_elite', 'mc_elite']],
      boss: ['mc_ragnaros'] },
  ],
  enemies: [
    enemy('mc_giant', 'Molten Giant', [66, 72], { k: 'giant', c1: '#4a2a1a', c2: '#ff6a1f', size: 1.3 }, [mv('stomp', 'Stomp', atk(14)), mv('knock', 'Knockback', atk(8), deb('dazed', 1))], { tags: ['elemental'] }),
    enemy('mc_surger', 'Lava Surger', [42, 48], { k: 'elemental', c1: '#ff4500', c2: '#ffd27a' }, [mv('surge', 'Surge', atk(7, 2)), mv('splash', 'Lava Splash', atk(4), deb('burn', 3))], { tags: ['elemental'] }),
    enemy('mc_hound', 'Core Hound', [36, 42], { k: 'hound', c1: '#5a2a1a', c2: '#ff6a1f' }, [mv('bite', 'Bite', atk(8)), mv('serrated', 'Serrated Bite', atk(4), deb('bleed', 3))], { tags: ['beast'] }),
    enemy('mc_flameguard', 'Flameguard', [48, 54], { k: 'elemental', c1: '#ff8a1f', c2: '#4a1a0a' }, [mv('shield', 'Fire Shield', buff('thorns', 3), blk(10)), mv('flames', 'Flames', atk(11))], { tags: ['elemental'] }),
    enemy('mc_flamewaker', 'Flamewaker', [52, 58], { k: 'giant', c1: '#3a1a0a', c2: '#ffb030', wpn: 'axe2h' }, [mv('sunder', 'Sunder Armor', atk(8), deb('frail', 2)), mv('fist', 'Fist of Ragnaros', atk(13))], { tags: ['elemental'] }),
    enemy('mc_protector', 'Flamewaker Protector', [44, 50], { k: 'giant', c1: '#3a1a0a', c2: '#c0c0c0', wpn: 'sword', off: 'shield' }, [mv('cleave', 'Cleave', atk(10)), mv('dom', 'Dominate Mind', card('c_mind_control', 1, 'draw'), blk(8))], { tags: ['elemental'] }),
    enemy('mc_rager', 'Core Rager', [50, 56], { k: 'hound', c1: '#7a3a1a', c2: '#ffd27a', size: 1.15 }, [mv('mangle', 'Mangle', atk(10), deb('weak', 1)), mv('bite', 'Bite', atk(8))], { tags: ['beast'] }),
    enemy('mc_priest', 'Flamewaker Priest', [40, 46], { k: 'giant', c1: '#3a1a0a', c2: '#a335ee', wpn: 'staff' }, [mvI('heal', 'Dark Mending', 'buff', healLowest(18)), mv('swp', 'Shadow Word: Pain', deb('affliction', 5)), mv('bolt', 'Shadow Bolt', atk(9))], { tags: ['elemental'] }),
    enemy('mc_healer', 'Flamewaker Healer', [44, 50], { k: 'giant', c1: '#3a1a0a', c2: '#4fc3f7', wpn: 'staff' }, [mvI('heal', 'Heal', 'buff', healLowest(16)), mv('shock', 'Shadow Shock', atk(10)), mv('shield', 'Magic Reflection', blkAll(8))], { tags: ['elemental'] }),
    enemy('mc_elite', 'Flamewaker Elite', [58, 64], { k: 'giant', c1: '#2a0a0a', c2: '#ff4500', wpn: 'axe2h' }, [mv('blast', 'Blast Wave', atk(9), deb('weak', 1)), mv('fireball', 'Fireball', atk(13))], { tags: ['elemental'] }),
    enemy('mc_firesworn', 'Firesworn', [30, 36], { k: 'elemental', c1: '#ff6a1f', c2: '#ffd27a', size: 0.8 }, [mv('immolate', 'Immolate', atk(6), deb('burn', 2))],
      { tags: ['elemental'], onDeath: c => { c.ev({ t: 'text', uid: c.p.uid, text: 'Eruption!' }); c.effectDamage(c.p, Math.round(7 * c.dmgScale), 'fire', 'effect'); } }),
    elite('mc_lucifron', 'Lucifron', [176, 186], { k: 'demon', c1: '#c0392b', c2: '#2a0a0a', size: 1.3 }, [mv('doom', 'Impending Doom', deb('affliction', 6), atk(4)), mv('curse', "Lucifron's Curse", deb('weak', 2), deb('frail', 2)), mv('shock', 'Shadow Shock', atk(14))], { tags: ['demon'] }),
    elite('mc_magmadar', 'Magmadar', [220, 232], { k: 'hound', c1: '#6a2a0a', c2: '#ff8a1f', size: 1.6 }, [mv('panic', 'Panic', deb('feared', 2), atk(6)), mv('bomb', 'Lava Bomb', atk(10), deb('burn', 4)), mv('frenzy', 'Frenzy', buff('str', 3), atk(8))], { tags: ['beast'] }),
    elite('mc_gehennas', 'Gehennas', [176, 186], { k: 'demon', c1: '#8a2a0a', c2: '#1a0a0a', size: 1.3 }, [mv('rain', 'Rain of Fire', atk(7, 2), deb('burn', 2)), mv('curse', "Gehennas' Curse", deb('weak', 3), atk(5)), mv('bolt', 'Shadow Bolt', atk(14))], { tags: ['demon'] }),
    elite('mc_geddon', 'Baron Geddon', [228, 240], { k: 'elemental', c1: '#ff6a1f', c2: '#3a1a0a', size: 1.5 }, [mv('bomb', 'Living Bomb', card('c_living_bomb', 1, 'draw'), atk(6)), mv('inferno', 'Inferno', atk(5, 4)), mv('ignite', 'Ignite Mana', deb('dazed', 2), atk(4))], { tags: ['elemental'] }),
    elite('mc_shazzrah', 'Shazzrah', [196, 206], { k: 'humanoid', race: 'orc', c1: '#c0392b', c2: '#4fc3f7', wpn: 'staff', size: 1.3 }, [mv('ae', 'Arcane Explosion', atk(7, 2)), mv('curse', "Shazzrah's Curse", deb('vuln', 3)), mv('blink', 'Blink', blk(20), atk(4)), mv('counter', 'Counterspell', deb('dazed', 2))], { tags: ['elemental'] }),
    elite('mc_golemagg', 'Golemagg the Incinerator', [255, 270], { k: 'giant', c1: '#4a2a1a', c2: '#ff4500', size: 1.6 }, [mv('splash', 'Magma Splash', atk(10), deb('burn', 3)), mv('pyro', 'Pyroblast', atk(18)), mv('quake', 'Earthquake', atk(6, 2), deb('dazed', 1))], { tags: ['elemental'] }),
    elite('mc_sulfuron', 'Sulfuron Harbinger', [216, 226], { k: 'giant', c1: '#2a0a0a', c2: '#ffb030', wpn: 'mace2h', size: 1.35 }, [mv('hand', 'Hand of Ragnaros', atk(10), deb('dazed', 1)), mv('inspire', 'Inspire', buffAll('str', 2)), mv('flame', 'Flame Spear', atk(15))], { tags: ['elemental'] }),
    boss('mc_garr', 'Garr', [300, 315], { k: 'elemental', c1: '#6a4a2a', c2: '#ff6a1f', size: 1.6 },
      [mv('pulse', 'Antimagic Pulse', fx(c => { for (const s of ['str', 'sp', 'dex', 'absorb', 'thorns', 'regen', 'empower']) delete c.p.st[s]; }, 'Dispel your buffs'), atk(8)), mv('shackles', 'Magma Shackles', deb('dazed', 1), deb('weak', 1)), mv('slam', 'Slam', atk(18)), mv('summon', 'Call Firesworn', summon('mc_firesworn', 2))],
      { first: 'slam', tags: ['elemental'] }),
    boss('mc_majordomo', 'Majordomo Executus', [340, 355], { k: 'humanoid', race: 'orc', c1: '#c0392b', c2: '#d4af37', wpn: 'staff', helm: 'crown', size: 1.3 },
      [mv('reflect', 'Magic Reflection', buff('thorns', 6), blk(20)), mv('teleport', 'Teleport', deb('dazed', 1), atk(10)), mv('wave', 'Blast Wave', atk(8), deb('weak', 1)), mv('call', 'Reinforce', summon('mc_elite'))],
      { first: 'wave', tags: ['elemental'], lore: '"Reckless mortals! None may challenge the sons of the living flame!"' }),
    enemy('mc_son', 'Son of Flame', [38, 44], { k: 'elemental', c1: '#ff8a1f', c2: '#ffe27a' }, [mv('flame', 'Flame', atk(8)), mv('burn', 'Scorch', atk(4), deb('burn', 2))], { tags: ['elemental'] }),
    boss('mc_ragnaros', 'Ragnaros', [600, 630], { k: 'elemental', c1: '#ff4500', c2: '#ffd27a', c3: '#5a1a0a', size: 1.9, wpn: 'mace2h' },
      [mv('wrath', 'Wrath of Ragnaros', atk(18), deb('feared', 1)), mv('burst', 'Lava Burst', atk(8, 2)), mv('fire', 'Elemental Fire', atk(10), deb('burn', 5)), mv('smash', 'Sulfuras Smash', atk(28)), mv('magma', 'Magma Blast', atk(12), card('c_dazed_rock', 2, 'draw'))],
      { first: 'wrath', tags: ['elemental'], base: ['wrath', 'burst', 'fire', 'magma'], lore: '"BY FIRE BE PURGED!"',
        phases: [{ pct: 50, msg: 'Ragnaros submerges! "COME FORTH, MY SERVANTS! DEFEND YOUR MASTER!"', moves: ['wrath', 'burst', 'fire', 'smash', 'magma'],
          enter: (c, e) => { e.st.invuln = 2; spawnN(c, 'mc_son', 4); } }] }),
  ],
};

// ======================= BLACKWING LAIR =======================
const classCall = (c: Combat) => {
  const p = c.p;
  const nef = c.alive().find(e => e.def.id === 'bwl_nefarian');
  const say = (t: string) => c.ev({ t: 'text', uid: nef?.uid ?? p.uid, text: t });
  switch (p.cls) {
    case 'warrior': say('Warriors! Berserker Stance!'); c.applyStatus(p, 'vuln', 3, false); break;
    case 'paladin': say('Paladins... Blessing of Protection!'); if (nef) nef.block += Math.round(30 * c.hpScale); break;
    case 'hunter': say('Hunters and your pea-shooters!'); p.pet = null; c.applyStatus(p, 'weak', 1, false); break;
    case 'rogue': say('Rogues? Stop hiding!'); delete p.st.stealth; p.cp = 0; c.applyStatus(p, 'dazed', 2, false); break;
    case 'priest': say('Priests! If you\'re going to keep healing, heal ME!'); if (nef) c.healUnit(nef, Math.round(40 * c.hpScale)); break;
    case 'shaman': say('Shamans, show me what your totems can do!'); p.totems = {}; spawnN(c, 'bwl_totem', 1); break;
    case 'mage': say('Mages too? You should be more careful!'); c.addCard('c_mind_control', 'draw'); c.addCard('c_mind_control', 'draw'); c.applyStatus(p, 'dazed', 1, false); break;
    case 'warlock': say('Warlocks... you shouldn\'t play with magic you don\'t understand!'); spawnN(c, 'bwl_infernal', 2); break;
    case 'druid': say('Druids and your silly shapeshifting!'); c.setForm('cat'); c.applyStatus(p, 'weak', 2, false); break;
  }
};

export const BWL: DungeonDef = {
  id: 'bwl', name: 'Blackwing Lair', tier: 12, kind: 'raid', lvl: '60 · Raid', icon: '🦇', colors: ['#0a0a12', '#3a1a5a'], unlock: 'mc',
  desc: 'Nefarian\'s laboratory atop Blackrock Spire, where he forges the chromatic dragonflight. End his experiments.',
  acts: [
    { name: 'Dragonmaw Garrison', rows: 9, bossName: 'Razorgore the Untamed',
      easy: [['bwl_technician', 'bwl_technician'], ['bwl_legionnaire']],
      normal: [['bwl_legionnaire', 'bwl_mage'], ['bwl_dragonspawn'], ['bwl_technician', 'bwl_legionnaire', 'bwl_technician'], ['bwl_mage', 'bwl_mage']],
      elites: [['bwl_vael'], ['bwl_broodlord']],
      boss: ['bwl_egg', 'bwl_razorgore', 'bwl_egg'] },
    { name: 'The Halls of Strife', rows: 9, bossName: 'Chromaggus',
      easy: [['bwl_dragonspawn']],
      normal: [['bwl_dragonspawn', 'bwl_mage'], ['bwl_wyrmguard'], ['bwl_legionnaire', 'bwl_legionnaire'], ['bwl_wyrmguard', 'bwl_technician']],
      elites: [['bwl_firemaw'], ['bwl_ebonroc'], ['bwl_flamegor']],
      boss: ['bwl_chromaggus'] },
    { name: "Nefarian's Lair", rows: 4, bossName: 'Nefarian',
      easy: [['bwl_drakonid', 'bwl_drakonid']],
      normal: [['bwl_wyrmguard', 'bwl_drakonid'], ['bwl_drakonid', 'bwl_drakonid', 'bwl_drakonid']],
      elites: [['bwl_wyrmguard', 'bwl_wyrmguard']],
      boss: ['bwl_nefarian'] },
  ],
  enemies: [
    enemy('bwl_technician', 'Blackwing Technician', [36, 42], { k: 'humanoid', race: 'gnome', c1: '#2a2a2a', c2: '#ff6600', wpn: 'mace', helm: 'goggles' }, [mv('bomb', 'Bomb', atk(10)), mvI('repair', 'Repair', 'defend', blkAll(8))]),
    enemy('bwl_legionnaire', 'Blackwing Legionnaire', [52, 58], { k: 'humanoid', race: 'orc', c1: '#1a1a1a', c2: '#c0392b', wpn: 'axe', helm: 'horned' }, [mv('strike', 'Strike', atk(12)), mv('enrage', 'Enrage', buff('str', 2), blk(6))]),
    enemy('bwl_mage', 'Blackwing Mage', [42, 48], { k: 'humanoid', race: 'orc', c1: '#2a0a3a', c2: '#ff6600', wpn: 'staff' }, [mv('fireball', 'Fireball', atk(13), deb('burn', 2)), mv('missiles', 'Arcane Missiles', atk(5, 3))]),
    enemy('bwl_dragonspawn', 'Death Talon Dragonspawn', [68, 74], { k: 'giant', c1: '#5a1a5a', c2: '#c0392b', wpn: 'polearm' }, [mv('cleave', 'Cleave', atk(15)), mv('wave', 'Blast Wave', atk(8), deb('weak', 1))], { tags: ['dragon'] }),
    enemy('bwl_wyrmguard', 'Death Talon Wyrmguard', [76, 84], { k: 'giant', c1: '#1a1a3a', c2: '#a335ee', wpn: 'sword2h', size: 1.2 }, [mv('strike', 'War Stomp', atk(10), deb('dazed', 1)), mv('blast', 'Shadow Blast', atk(16))], { tags: ['dragon'] }),
    enemy('bwl_drakonid', 'Chromatic Drakonid', [52, 58], { k: 'whelp', c1: '#5a2a7a', c2: '#ffd27a', size: 1.5 }, [mv('breath', 'Chromatic Breath', atk(10), deb('burn', 2)), mv('claw', 'Claw', atk(7, 2))], { tags: ['dragon'] }),
    enemy('bwl_egg', 'Dragon Egg', [40, 46], { k: 'egg', c1: '#3a1a1a', c2: '#c0392b' }, [mvI('pulse', 'Incubate', 'unknown', blk(4))], { tags: ['dragon'] }),
    enemy('bwl_totem', 'Corrupted Healing Totem', [30, 34], { k: 'totem', c1: '#3a1a5a', c2: '#7fff00' }, [mvI('heal', 'Corrupted Healing', 'buff', healAllies(10))]),
    enemy('bwl_infernal', 'Infernal', [30, 36], { k: 'golem', c1: '#3a5a1a', c2: '#7fff00' }, [mv('immolate', 'Immolation', atk(8), deb('burn', 2))], { tags: ['demon'] }),
    enemy('bwl_bone', 'Bone Construct', [24, 28], { k: 'skeleton', c1: '#d8d8c8', c2: '#3a3a3a' }, [mv('claw', 'Claw', atk(8))], { tags: ['undead'] }),
    elite('bwl_vael', 'Vaelastrasz the Corrupt', [360, 380], { k: 'dragon', c1: '#a01a1a', c2: '#3a0a0a', size: 1.5 },
      [mvI('essence', 'Essence of the Red', 'special', fx(c => { c.applyStatus(c.p, 'adrenaline', 12, false); c.applyStatus(c.p, 'str', 2, false); c.applyStatus(c.p, 'sp', 2, false); }, 'Grant you endless power')),
        mv('breath', 'Flame Breath', atk(14), deb('burn', 3)), mv('adrenaline', 'Burning Adrenaline', card('c_burning', 2, 'hand'), atk(6)), mv('tail', 'Tail Swipe', atk(8, 2)), mv('cleave', 'Cleave', atk(20))],
      { first: 'essence', startHpPct: 0.3, tags: ['dragon'], lore: '"Too late, friends! Nefarius\' corruption has taken hold... I cannot... control myself."' }),
    elite('bwl_broodlord', 'Broodlord Lashlayer', [270, 285], { k: 'giant', c1: '#1a1a1a', c2: '#c0392b', wpn: 'sword2h', size: 1.4 }, [mv('cleave', 'Cleave', atk(16)), mv('ms', 'Mortal Strike', atk(22), deb('weak', 2)), mv('wave', 'Blast Wave', atk(10), deb('weak', 1)), mv('knock', 'Knock Away', deb('dazed', 1), atk(8))], { tags: ['dragon'] }),
    elite('bwl_firemaw', 'Firemaw', [300, 315], { k: 'dragon', c1: '#1a1a1a', c2: '#ff4500', size: 1.5 }, [mv('buffet', 'Flame Buffet', atk(6), buff('str', 1)), mv('shadow', 'Shadow Flame', card('c_shadowflame', 1, 'hand'), atk(10)), mv('wing', 'Wing Buffet', atk(14))], { tags: ['dragon'] }),
    elite('bwl_ebonroc', 'Ebonroc', [300, 315], { k: 'dragon', c1: '#1a1a1a', c2: '#5a5a7a', size: 1.5 }, [mv('shadow', 'Shadow of Ebonroc', heal(20), atk(8)), mv('flame', 'Shadow Flame', card('c_shadowflame', 1, 'hand'), atk(10)), mv('wing', 'Wing Buffet', atk(14))], { tags: ['dragon'] }),
    elite('bwl_flamegor', 'Flamegor', [300, 315], { k: 'dragon', c1: '#1a1a1a', c2: '#ffb030', size: 1.5 }, [mv('frenzy', 'Frenzy', buff('str', 3), blk(10)), mv('nova', 'Fire Nova', atk(7, 2), deb('burn', 2)), mv('wing', 'Wing Buffet', atk(14))], { tags: ['dragon'] }),
    boss('bwl_razorgore', 'Razorgore the Untamed', [380, 400], { k: 'dragon', c1: '#2a2a2a', c2: '#c0392b', size: 1.6 },
      [mv('call', 'Call Legionnaire', summon('bwl_legionnaire')), mv('conflag', 'Conflagration', card('c_burning', 1, 'hand'), atk(10)), mv('volley', 'Fireball Volley', atk(8, 2)), mv('stomp', 'War Stomp', deb('dazed', 1), atk(12))],
      { tags: ['dragon'], start: { invuln: 1 },
        onTurnStart: (c, e) => { if (c.alive().some(x => x.def.id === 'bwl_egg')) e.st.invuln = 1; },
        pick: (c, e) => c.alive().some(x => x.def.id === 'bwl_egg') ? 'call' : c.rng.pick(['conflag', 'volley', 'stomp'].filter(m => m !== e.lastMoves[e.lastMoves.length - 1])),
        lore: 'Destroy the eggs to break Nefarian\'s control — only then can Razorgore be harmed.' }),
    boss('bwl_chromaggus', 'Chromaggus', [520, 545], { k: 'hound', c1: '#5a3a7a', c2: '#d4af37', c3: '#3a8a3a', size: 1.9 },
      [mv('lapse', 'Time Lapse', deb('dazed', 2), card('c_brood_bronze', 2, 'hand')), mv('acid', 'Corrosive Acid', atk(10), deb('vuln', 2)), mv('ignite', 'Ignite Flesh', atk(8), deb('burn', 5)),
        mv('frost', 'Frost Burn', atk(12), deb('frail', 2)), mv('incinerate', 'Incinerate', atk(22)), mv('brood', 'Brood Affliction', card('c_brood_red', 1, 'draw'), card('c_brood_black', 1, 'draw'), atk(6))],
      { first: 'brood', tags: ['dragon'], base: ['lapse', 'acid', 'ignite', 'frost', 'incinerate', 'brood'], phases: [{ pct: 20, msg: 'Chromaggus goes into a killing frenzy!', moves: ['incinerate', 'acid', 'ignite'], enter: (c, e) => c.applyStatus(e, 'str', 5, false) }] }),
    boss('bwl_nefarian', 'Nefarian', [760, 790], { k: 'dragon', c1: '#0a0a0a', c2: '#5a1a5a', c3: '#c0392b', size: 2 },
      [mv('volley', 'Shadow Bolt Volley', atk(7, 2)), mv('drakonids', 'Summon Drakonids', summon('bwl_drakonid', 2)), mv('fear', 'Fear', deb('feared', 2), atk(4)),
        mv('flame', 'Shadow Flame', card('c_shadowflame', 2, 'hand'), atk(12)), mv('roar', 'Bellowing Roar', deb('feared', 2), atk(8)), mvI('call', 'Class Call', 'special', fx(classCall, 'Calls out your class')),
        mv('veil', 'Veil of Shadow', deb('weak', 2), deb('frail', 2)), mv('cleave', 'Cleave', atk(24)), mv('raise', 'Raise the Dead', summon('bwl_bone', 3), buff('str', 2))],
      { first: 'drakonids', tags: ['dragon'], lore: '"Let the games begin!"',
        phases: [
          { pct: 70, msg: 'Nefarian: "Enough! Now you vermin shall feel the force of my birthright!"', moves: ['flame', 'roar', 'call', 'veil', 'cleave'], enter: (c, e) => { e.name = 'Nefarian'; } },
          { pct: 20, msg: 'Nefarian: "Impossible! Rise my minions! Serve your master once more!"', moves: ['raise', 'cleave', 'flame', 'call'], enter: c => spawnN(c, 'bwl_bone', 3) },
        ] }),
  ],
};
