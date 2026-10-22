// Optional World of Warcraft art. Icons are loaded at runtime from Wowhead's public icon CDN
// (nothing is bundled in this repo). Larger art (enemy portraits, dungeon backdrops) can be
// supplied privately by dropping image files into public/wow/ (git-ignored) — see README.
// Every image falls back to the built-in emoji/SVG art if it fails to load.
import type { Item, Slot, ArmorType, WeaponType, OffType } from '../engine/types';

const CDN = 'https://wow.zamimg.com/images/wow/icons/large/';
let enabled = true;
export function setWowArt(on: boolean) { enabled = on; }
export function wowArtEnabled() { return enabled; }

export const CARD_ICONS: Record<string, string> = {
  // Warrior
  w_heroic: 'ability_rogue_ambush', w_parry: 'ability_parry', w_charge: 'ability_warrior_charge', w_rend: 'ability_gouge', w_overpower: 'ability_meleedamage',
  w_hamstring: 'ability_shockwave', w_slam: 'ability_warrior_decisivestrike', w_sweeping: 'ability_rogue_slicedice', w_execute: 'inv_sword_48', w_mortal: 'ability_warrior_savageblow',
  w_retaliation: 'ability_warrior_challange', w_battle_shout: 'ability_warrior_battleshout', w_cleave: 'ability_warrior_cleave', w_bloodrage: 'ability_racial_bloodrage',
  w_berserker: 'spell_nature_ancestralguardian', w_whirlwind: 'ability_whirlwind', w_intercept: 'ability_rogue_sprint', w_bloodthirst: 'spell_nature_bloodlust',
  w_recklessness: 'ability_criticalstrike', w_deathwish: 'spell_shadow_deathpact', w_rampage: 'ability_warrior_innerrage', w_sunder: 'ability_warrior_sunder',
  w_shield_block: 'ability_defend', w_revenge: 'ability_warrior_revenge', w_thunder: 'spell_nature_thunderclap', w_demo_shout: 'ability_warrior_warcry',
  w_def_stance: 'ability_warrior_defensivestance', w_last_stand: 'spell_holy_ashestoashes', w_concussion: 'ability_thunderbolt', w_shield_wall: 'ability_warrior_shieldwall',
  w_shield_slam: 'inv_shield_05', w_taunt: 'ability_warrior_punishingblow',
  // Paladin
  p_strike: 'spell_holy_crusaderstrike', p_guard: 'spell_holy_devotionaura', p_seal_right: 'ability_thunderbolt', p_judgement: 'spell_holy_righteousfury',
  p_seal_light: 'spell_holy_healingaura', p_seal_wisdom: 'spell_holy_righteousnessaura', p_holy_light: 'spell_holy_holybolt', p_flash: 'spell_holy_flashheal',
  p_exorcism: 'spell_holy_excorcism_02', p_holy_shock: 'spell_holy_searinglight', p_holy_wrath: 'spell_holy_excorcism', p_lay_hands: 'spell_holy_layonhands',
  p_cleanse: 'spell_holy_renew', p_seal_justice: 'spell_holy_sealofwrath', p_hoj: 'spell_holy_sealofmight', p_devotion: 'spell_holy_devotionaura',
  p_rfury: 'spell_holy_sealoffury', p_consecration: 'spell_holy_innerfire', p_holy_shield: 'spell_holy_blessingofprotection', p_divine_shield: 'spell_holy_divineintervention',
  p_blessing_sanc: 'spell_nature_lightningshield', p_seal_crusader: 'spell_holy_holysmite', p_seal_command: 'ability_warrior_innerrage', p_might: 'spell_holy_fistofjustice',
  p_ret_aura: 'spell_holy_auraoflight', p_hammer_wrath: 'ability_thunderclap', p_repentance: 'spell_holy_prayerofhealing', p_crusade: 'ability_paladin_divinestorm',
  p_kings: 'spell_magic_magearmor',
  // Hunter
  h_auto: 'ability_marksmanship', h_disengage: 'ability_rogue_feint', h_mark: 'ability_hunter_snipershot', h_kill_cmd: 'ability_hunter_killcommand',
  h_mend_pet: 'ability_hunter_mendpet', h_intimidation: 'ability_devour', h_bestial: 'ability_druid_ferociousbite', h_spirit_bond: 'ability_druid_demoralizingroar',
  h_feed_pet: 'ability_hunter_beasttraining', h_aspect_beast: 'ability_mount_pinktiger', h_arcane: 'ability_impalingbolt', h_multi: 'ability_upgrademoonglaive',
  h_concussive: 'spell_frost_stun', h_hawk: 'spell_nature_ravenform', h_rapid: 'ability_hunter_runningshot', h_aimed: 'inv_spear_07', h_volley: 'ability_marksmanship',
  h_trueshot: 'ability_trueshot', h_serpent: 'ability_hunter_quickshot', h_raptor: 'ability_meleedamage', h_wingclip: 'ability_rogue_trip',
  h_freeze_trap: 'spell_frost_chainsofice', h_immo_trap: 'spell_fire_flameshock', h_explosive: 'spell_fire_selfdestruct', h_deterrence: 'ability_whirlwind',
  h_wyvern: 'inv_spear_02', h_feign: 'ability_rogue_feigndeath', h_mongoose: 'ability_hunter_swiftstrike',
  // Rogue
  r_sinister: 'spell_shadow_ritualofsacrifice', r_feint: 'ability_rogue_feint', r_eviscerate: 'ability_rogue_eviscerate', r_garrote: 'ability_rogue_garrote',
  r_rupture: 'ability_rogue_rupture', r_deadly: 'ability_rogue_dualweild', r_envenom: 'ability_rogue_disembowel', r_mutilate: 'ability_poisonsting',
  r_cold_blood: 'spell_ice_lament', r_expose: 'ability_warrior_riposte', r_vendetta: 'ability_poisonsting', r_gouge: 'ability_gouge', r_snd: 'ability_rogue_slicedice',
  r_riposte: 'ability_warrior_challange', r_evasion: 'spell_shadow_shadowward', r_blade_flurry: 'ability_warrior_punishingblow', r_adrenaline: 'spell_shadow_shadowworddominate',
  r_killing: 'ability_rogue_murderspree', r_sprint: 'ability_rogue_sprint', r_thistle: 'inv_drink_milk_05', r_ambush: 'ability_rogue_ambush', r_cheap: 'ability_cheapshot',
  r_backstab: 'ability_backstab', r_hemo: 'spell_shadow_lifedrain', r_ghostly: 'spell_shadow_curse', r_kidney: 'ability_rogue_kidneyshot', r_vanish: 'ability_vanish',
  r_premed: 'spell_shadow_possession',
  // Priest
  pr_smite: 'spell_holy_holysmite', pr_fade: 'spell_magic_lesserinvisibilty', pr_pws: 'spell_holy_powerwordshield', pr_inner_fire: 'spell_holy_innerfire',
  pr_inner_focus: 'spell_frost_windwalkon', pr_mana_burn: 'spell_shadow_manaburn', pr_fortitude: 'spell_holy_wordfortitude', pr_dispel: 'spell_holy_dispelmagic',
  pr_pi: 'spell_holy_powerinfusion', pr_barrier: 'spell_holy_divinespirit', pr_penance: 'spell_holy_penance', pr_renew: 'spell_holy_renew', pr_flash: 'spell_holy_flashheal',
  pr_greater: 'spell_holy_greaterheal', pr_holy_fire: 'spell_holy_searinglight', pr_nova: 'spell_holy_holynova', pr_prayer: 'spell_holy_prayerofhealing02',
  pr_chastise: 'spell_holy_chastise', pr_lightwell: 'spell_holy_summonlightwell', pr_swp: 'spell_shadow_shadowwordpain', pr_mind_blast: 'spell_shadow_unholyfrenzy',
  pr_mind_flay: 'spell_shadow_siphonmana', pr_vamp: 'spell_shadow_unsummonbuilding', pr_scream: 'spell_shadow_psychicscream', pr_shadowform: 'spell_shadow_shadowform',
  pr_silence: 'spell_shadow_mindshear', pr_desperate: 'spell_holy_restoration', pr_fear_ward: 'spell_holy_excorcism', pr_starshards: 'spell_arcane_starfire',
  pr_plague: 'spell_shadow_blackplague', pr_shadowguard: 'spell_nature_lightningshield',
  // Shaman
  s_strike: 'inv_mace_01', s_guard: 'spell_nature_stoneskintotem', s_searing: 'spell_fire_searingtotem', s_bolt: 'spell_nature_lightning', s_earth_shock: 'spell_nature_earthshock',
  s_flame_shock: 'spell_fire_flameshock', s_frost_shock: 'spell_frost_frostshock', s_chain: 'spell_nature_chainlightning', s_magma: 'spell_fire_selfdestruct',
  s_fire_nova: 'spell_fire_sealoffire', s_em: 'spell_nature_wispheal', s_storm: 'spell_shaman_thunderstorm', s_lshield: 'spell_nature_lightningshield',
  s_flametongue: 'spell_fire_flametounge', s_rockbiter: 'spell_nature_rockbiter', s_strength: 'spell_nature_earthbindtotem', s_windfury: 'spell_nature_windfury',
  s_stormstrike: 'ability_shaman_stormstrike', s_lava_lash: 'ability_shaman_lavalash', s_grace: 'spell_nature_invisibilitytotem', s_hwave: 'spell_nature_magicimmunity',
  s_lhw: 'spell_nature_healingwavelesser', s_stoneskin: 'spell_nature_stoneskintotem', s_hstream: 'inv_spear_04', s_manaspring: 'spell_nature_manaregentotem',
  s_chain_heal: 'spell_nature_healingwavegreater', s_manatide: 'spell_frost_summonwaterelemental', s_reincarnation: 'spell_nature_reincarnation',
  s_purge: 'spell_nature_purge', s_earthbind: 'spell_nature_strengthofearthtotem02',
  // Mage
  m_fireball: 'spell_fire_flamebolt', m_frost_armor: 'spell_frost_frostarmor02', m_int: 'spell_holy_magicalsentry', m_poly: 'spell_nature_polymorph',
  m_blink: 'spell_arcane_blink', m_mana_gem: 'inv_misc_gem_emerald_01', m_missiles: 'spell_nature_starfall', m_explosion: 'spell_nature_wispsplode',
  m_mana_shield: 'spell_shadow_detectlesserinvisibility', m_pom: 'spell_nature_enchantarmor', m_evocation: 'spell_nature_purge', m_counterspell: 'spell_frost_iceshock',
  m_mage_armor: 'spell_magearmor', m_arcane_power: 'spell_nature_lightning', m_fire_blast: 'spell_fire_fireball', m_scorch: 'spell_fire_soulburn',
  m_flamestrike: 'spell_fire_selfdestruct', m_blast_wave: 'spell_holy_excorcism_02', m_pyro: 'spell_fire_fireball02', m_combustion: 'spell_fire_sealoffire',
  m_fire_ward: 'spell_fire_firearmor', m_frostbolt: 'spell_frost_frostbolt02', m_cone: 'spell_frost_glacier', m_nova: 'spell_frost_frostnova',
  m_blizzard: 'spell_frost_icestorm', m_ice_lance: 'spell_frost_frostblast', m_ice_block: 'spell_frost_frost', m_ice_barrier: 'spell_ice_lament',
  m_cold_snap: 'spell_frost_wizardmark',
  // Warlock
  l_bolt: 'spell_shadow_shadowbolt', l_skin: 'spell_shadow_ragingscream', l_imp: 'spell_shadow_summonimp', l_tap: 'spell_shadow_burningspirit',
  l_corruption: 'spell_shadow_abominationexplosion', l_agony: 'spell_shadow_curseofsargeras', l_drain_life: 'spell_shadow_lifedrain02', l_drain_soul: 'spell_shadow_haunting',
  l_siphon: 'spell_shadow_requiem', l_weakness: 'spell_shadow_curseofmannoroth', l_reckless: 'spell_shadow_unholystrength', l_doom: 'spell_shadow_auraofdarkness',
  l_dark_pact: 'spell_shadow_darkritual', l_fear: 'spell_shadow_possession', l_voidwalker: 'spell_shadow_summonvoidwalker', l_succubus: 'spell_shadow_summonsuccubus',
  l_felhunter: 'spell_shadow_summonfelhunter', l_infernal: 'spell_shadow_summoninfernal', l_healthstone: 'inv_stone_04', l_soul_link: 'spell_shadow_gathershadows',
  l_demon_armor: 'spell_shadow_ragingscream', l_sacrifice: 'spell_shadow_psychicscream', l_immolate: 'spell_fire_immolation', l_searing: 'spell_fire_soulburn',
  l_shadowburn: 'spell_shadow_scourgebuild', l_rain: 'spell_shadow_rainoffire', l_hellfire: 'spell_fire_incinerate', l_soul_fire: 'spell_fire_fireball02',
  l_conflag: 'spell_fire_fireball', l_death_coil: 'spell_shadow_deathcoil', l_shadow_ward: 'spell_shadow_antishadow',
  // Druid
  d_wrath: 'spell_nature_abolishmagic', d_barkskin: 'spell_nature_stoneclawtotem', d_bear: 'ability_racial_bearform', d_cat: 'ability_druid_catform',
  d_moonfire: 'spell_nature_starfall', d_starfire: 'spell_arcane_starfire', d_swarm: 'spell_nature_insectswarm', d_roots: 'spell_nature_stranglevines',
  d_faerie: 'spell_nature_faeriefire', d_hurricane: 'spell_nature_cyclone', d_starfall: 'spell_nature_natureswrath', d_moonkin: 'spell_nature_forceofnature',
  d_innervate: 'spell_nature_lightning', d_claw: 'ability_druid_rake', d_rake: 'ability_druid_disembowel', d_shred: 'spell_shadow_vampiricaura',
  d_bite: 'ability_druid_ferociousbite', d_rip: 'ability_ghoulfrenzy', d_tigers: 'ability_mount_jungletiger', d_maul: 'ability_druid_maul',
  d_swipe: 'inv_misc_monsterclaw_03', d_roar: 'ability_druid_demoralizingroar', d_frenzied: 'ability_bullrush', d_feral_charge: 'ability_hunter_pet_bear',
  d_enrage: 'ability_druid_enrage', d_lotp: 'spell_nature_unyeildingstamina', d_rejuv: 'spell_nature_rejuvenation', d_touch: 'spell_nature_healingtouch',
  d_regrowth: 'spell_nature_resistnature', d_swiftmend: 'inv_relics_idolofrejuvenation', d_tranq: 'spell_nature_tranquility', d_thorns: 'spell_nature_thorns',
  d_motw: 'spell_nature_regeneration', d_ns: 'spell_nature_ravenform',
  // Neutral, curses, tokens, potions
  n_bandage: 'inv_misc_bandage_12', n_copper_bomb: 'inv_misc_bomb_09', n_iron_grenade: 'inv_misc_bomb_08', n_sapper: 'spell_fire_selfdestruct', n_net: 'inv_misc_net_01',
  n_dark_rune: 'inv_misc_rune_04', n_tuber: 'inv_misc_food_55', n_thorium: 'inv_misc_bomb_08', n_mithril_shield: 'inv_misc_armorkit_17', n_flask: 'inv_misc_food_64',
  n_battle_chicken: 'inv_misc_food_15',
  c_wound: 'ability_backstab', c_res_sick: 'spell_shadow_deathscream', c_tongues: 'spell_shadow_curseoftounges', c_burning: 'inv_gauntlets_03',
  c_living_bomb: 'inv_enchant_essenceastralsmall', c_poisoned: 'spell_nature_corrosivebreath', c_brood_red: 'inv_misc_head_dragon_red',
  c_brood_black: 'inv_misc_head_dragon_black', c_brood_bronze: 'inv_misc_head_dragon_bronze', c_shadowflame: 'spell_fire_incinerate',
  c_mind_control: 'spell_shadow_shadowworddominate', c_dazed_rock: 'inv_stone_15',
  t_mana_gem: 'inv_misc_gem_emerald_01', t_healthstone: 'inv_stone_04',
  po_heal: 'inv_potion_54', po_mana: 'inv_potion_76', po_giants: 'inv_potion_61', po_sages: 'inv_potion_25', po_stone: 'inv_potion_69', po_swift: 'inv_potion_95',
  po_free: 'inv_potion_04', po_lip: 'inv_potion_62', po_fire: 'inv_potion_24', po_rage: 'inv_potion_41', po_dense: 'inv_misc_bomb_06', po_frost_oil: 'inv_potion_20',
};

/** Talent icons by talent name (Classic names); capstones use their ability's icon. */
export const TALENT_ICONS: Record<string, string> = {
  'Improved Rend': 'ability_gouge', Deflection: 'ability_parry', 'Tactical Mastery': 'spell_nature_enchantarmor', Impale: 'ability_searingarrow',
  'Deep Wounds': 'ability_backstab', Cruelty: 'ability_rogue_eviscerate', 'Unbridled Wrath': 'spell_nature_stoneclawtotem', Enrage: 'spell_shadow_unholyfrenzy',
  'Improved Cleave': 'ability_warrior_cleave', Flurry: 'ability_ghoulfrenzy', 'Shield Specialization': 'inv_shield_06', Anticipation: 'spell_nature_mirrorimage',
  Toughness: 'spell_holy_devotion', 'Improved Revenge': 'ability_warrior_revenge', Defiance: 'ability_warrior_innerrage',
  'Divine Intellect': 'spell_nature_sleep', 'Healing Light': 'spell_holy_holybolt', Illumination: 'spell_holy_greaterheal', 'Improved Seal of Righteousness': 'ability_thunderbolt',
  'Holy Reach': 'spell_holy_purify', Redoubt: 'ability_defend', "Guardian's Favor": 'spell_holy_sealofprotection', 'Blessing of Kings': 'spell_magic_magearmor',
  Reckoning: 'spell_holy_blessingofstrength', Benediction: 'spell_frost_windwalkon', 'Improved Judgement': 'spell_holy_righteousfury', Conviction: 'spell_holy_retributionaura',
  'Two-Handed Specialization': 'inv_hammer_04', Vengeance: 'ability_racial_avatar', 'Endurance Training': 'spell_nature_reincarnation', 'Unleashed Fury': 'ability_bullrush',
  Ferocity: 'inv_misc_monsterclaw_04', 'Bestial Discipline': 'spell_nature_abolishmagic', Frenzy: 'inv_misc_monsterclaw_03', 'Lethal Shots': 'ability_searingarrow',
  "Improved Hunter's Mark": 'ability_hunter_snipershot', Efficiency: 'spell_frost_wizardmark', Barrage: 'ability_upgrademoonglaive', 'Mortal Shots': 'ability_piercedamage',
  'Monster Slaying': 'inv_misc_head_dragon_black', 'Clever Traps': 'spell_nature_timestop', 'Improved Stings': 'ability_hunter_quickshot', 'Killer Instinct': 'spell_holy_blessingofstamina',
  Malice: 'ability_racial_bloodrage', 'Vile Poisons': 'ability_rogue_feigndeath', Ruthlessness: 'ability_druid_disembowel', Lethality: 'ability_criticalstrike',
  'Seal Fate': 'spell_shadow_chilltouch', Precision: 'ability_marksmanship', 'Lightning Reflexes': 'spell_nature_invisibilty', 'Improved Sinister Strike': 'spell_shadow_ritualofsacrifice',
  Endurance: 'spell_shadow_shadowward', 'Weapon Expertise': 'inv_sword_27', 'Master of Deception': 'spell_shadow_charm', Camouflage: 'ability_stealth',
  Initiative: 'spell_shadow_fumble', Setup: 'spell_nature_mirrorimage', Opportunity: 'ability_warrior_warcry', Meditation: 'spell_nature_sleep',
  'Improved Power Word: Shield': 'spell_holy_powerwordshield', 'Mental Agility': 'ability_hibernation', 'Mental Strength': 'spell_nature_enchantarmor', 'Divine Spirit': 'spell_holy_divinespirit',
  'Holy Specialization': 'spell_holy_sealofsalvation', 'Spiritual Healing': 'spell_nature_moonglow', 'Searing Light': 'spell_holy_searinglightpriest', 'Spiritual Guidance': 'spell_holy_spiritualguidence',
  'Shadow Focus': 'spell_shadow_burningspirit', 'Improved Shadow Word: Pain': 'spell_shadow_shadowwordpain', 'Shadow Weaving': 'spell_shadow_blackplague',
  Darkness: 'spell_shadow_twilight', Blackout: 'spell_shadow_gathershadows', Concussion: 'spell_fire_fireball', 'Call of Flame': 'spell_fire_immolation',
  'Elemental Fury': 'spell_fire_volcano', 'Elemental Focus': 'spell_shadow_manaburn', 'Lightning Mastery': 'spell_lightning_lightningbolt01',
  'Ancestral Knowledge': 'spell_shadow_grimward', 'Elemental Weapons': 'spell_fire_flametounge', 'Thundering Strikes': 'ability_thunderbolt',
  'Tidal Focus': 'spell_frost_manarecharge', 'Totemic Focus': 'spell_nature_moonglow', 'Healing Way': 'spell_nature_healingway', 'Restorative Totems': 'spell_nature_manaregentotem',
  Purification: 'spell_frost_wizardmark', 'Arcane Subtlety': 'spell_holy_dispelmagic', 'Arcane Focus': 'spell_holy_devotion', 'Arcane Concentration': 'spell_shadow_manaburn',
  'Arcane Meditation': 'spell_shadow_siphonmana', 'Arcane Instability': 'spell_shadow_teleport', 'Improved Fireball': 'spell_fire_flamebolt', Ignite: 'spell_fire_incinerate',
  Incinerate: 'spell_fire_flameshock', 'Burning Soul': 'spell_fire_fire', 'Fire Power': 'spell_fire_immolation', 'Improved Frostbolt': 'spell_frost_frostbolt02',
  Frostbite: 'spell_frost_frostarmor', Shatter: 'spell_frost_frostshock', 'Frost Warding': 'spell_frost_frostward', "Winter's Chill": 'spell_frost_chillingblast',
  'Improved Corruption': 'spell_shadow_abominationexplosion', Suppression: 'spell_shadow_unsummonbuilding', 'Improved Life Tap': 'spell_shadow_burningspirit',
  'Fel Concentration': 'spell_shadow_fingerofdeath', Nightfall: 'spell_shadow_twilight', 'Demonic Embrace': 'spell_shadow_metamorphosis', 'Unholy Power': 'spell_shadow_shadowworddominate',
  'Fel Domination': 'spell_nature_removecurse', 'Master Summoner': 'spell_shadow_impphaseshift', 'Master Demonologist': 'spell_shadow_shadowpact',
  'Improved Shadow Bolt': 'spell_shadow_shadowbolt', Bane: 'spell_shadow_deathpact', Devastation: 'spell_fire_flameshock', Aftermath: 'spell_fire_fire', Ruin: 'spell_shadow_shadowwordpain',
  'Improved Wrath': 'spell_nature_abolishmagic', "Nature's Grasp": 'spell_nature_natureswrath', Moonfury: 'spell_nature_moonglow', "Nature's Grace": 'spell_nature_naturesblessing',
  'Thick Hide': 'inv_misc_pelt_bear_03', 'Sharpened Claws': 'inv_misc_monsterclaw_04', 'Primal Fury': 'ability_racial_cannibalize', 'Heart of the Wild': 'spell_holy_blessingofagility',
  'Improved Rejuvenation': 'spell_nature_rejuvenation', 'Gift of Nature': 'spell_nature_protectionformnature', Intensity: 'spell_frost_windwalkon', Furor: 'spell_holy_blessingofstamina',
  'Tranquil Spirit': 'spell_holy_elunesgrace',
};

export const CLASS_ICONS: Record<string, string> = Object.fromEntries(['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'].map(c => [c, 'classicon_' + c]));
export const RACE_ICONS: Record<string, string> = { human: 'race_human_male', dwarf: 'race_dwarf_male', nightelf: 'race_nightelf_male', gnome: 'race_gnome_male', orc: 'race_orc_male', undead: 'race_scourge_male', tauren: 'race_tauren_male', troll: 'race_troll_male' };
export const PET_ICONS: Record<string, string> = { wolf: 'ability_hunter_pet_wolf', cat: 'ability_hunter_pet_cat', boar: 'ability_hunter_pet_boar', raptor: 'ability_hunter_pet_raptor', imp: 'spell_shadow_summonimp', voidwalker: 'spell_shadow_summonvoidwalker', succubus: 'spell_shadow_summonsuccubus', felhunter: 'spell_shadow_summonfelhunter', infernal: 'spell_shadow_summoninfernal' };
export const STATUS_ICONS: Record<string, string> = {
  str: 'ability_warrior_battleshout', sp: 'spell_holy_magicalsentry', dex: 'ability_defend', vuln: 'ability_warrior_sunder', weak: 'ability_warrior_warcry',
  frail: 'ability_warrior_sunder', poison: 'ability_poisonsting', bleed: 'ability_gouge', burn: 'spell_fire_immolation', affliction: 'spell_shadow_shadowwordpain',
  siphon: 'spell_shadow_requiem', doom: 'spell_shadow_auraofdarkness', chill: 'spell_frost_frostarmor02', stun: 'spell_frost_stun', poly: 'spell_nature_polymorph',
  mark: 'ability_hunter_snipershot', regen: 'spell_nature_rejuvenation', thorns: 'spell_nature_thorns', dodge: 'ability_rogue_feint', invuln: 'spell_holy_divineintervention',
  fortify: 'ability_warrior_defensivestance', absorb: 'spell_holy_powerwordshield', stealth: 'ability_stealth', feared: 'spell_shadow_possession', dazed: 'spell_frost_stun',
  clearcast: 'spell_shadow_manaburn', critnext: 'ability_criticalstrike', sweep: 'ability_rogue_slicedice', consecration: 'spell_holy_innerfire', airborne: 'ability_druid_flightform',
};

const SET_SLOT: Record<string, Record<ArmorType, string>> = {
  head: { plate: 'inv_helmet_03', mail: 'inv_helmet_09', leather: 'inv_helmet_15', cloth: 'inv_helmet_29' },
  shoulder: { plate: 'inv_shoulder_02', mail: 'inv_shoulder_09', leather: 'inv_shoulder_07', cloth: 'inv_shoulder_25' },
  chest: { plate: 'inv_chest_plate06', mail: 'inv_chest_chain_05', leather: 'inv_chest_leather_09', cloth: 'inv_chest_cloth_21' },
  hands: { plate: 'inv_gauntlets_10', mail: 'inv_gauntlets_11', leather: 'inv_gauntlets_05', cloth: 'inv_gauntlets_17' },
  legs: { plate: 'inv_pants_04', mail: 'inv_pants_03', leather: 'inv_pants_02', cloth: 'inv_pants_08' },
  feet: { plate: 'inv_boots_plate_01', mail: 'inv_boots_02', leather: 'inv_boots_08', cloth: 'inv_boots_cloth_03' },
};
const WPN: Record<WeaponType, string> = { sword: 'inv_sword_04', sword2h: 'inv_sword_39', axe: 'inv_axe_01', axe2h: 'inv_axe_09', mace: 'inv_mace_01', mace2h: 'inv_hammer_04', dagger: 'inv_weapon_shortblade_05', fist: 'inv_gauntlets_04', staff: 'inv_staff_08', polearm: 'inv_spear_04', bow: 'inv_weapon_bow_02', gun: 'inv_weapon_rifle_01' };
const OFF: Record<OffType, string> = { shield: 'inv_shield_06', orb: 'inv_misc_orb_01', tome: 'inv_misc_book_09', weapon: 'inv_weapon_shortblade_05' };
const NAMED_ITEMS: Record<string, string> = {
  mc_sulfuras: 'inv_hammer_unique_sulfuras', mc_thunderfury: 'inv_sword_39', bwl_ashkandi: 'inv_sword_50', on_tooth: 'inv_misc_bone_elfskull_01',
  on_blood: 'inv_jewelry_talisman_11', dm_cruel: 'inv_sword_23', brd_hoj: 'inv_jewelry_talisman_01', st_rivendare: 'ability_mount_undeadhorse',
};

export function itemIconName(it: Pick<Item, 'id' | 'slot' | 'armor' | 'wpn' | 'off'>): string {
  if (NAMED_ITEMS[it.id]) return NAMED_ITEMS[it.id];
  const s: Slot = it.slot;
  if (s === 'mainhand' && it.wpn) return WPN[it.wpn];
  if (s === 'offhand' && it.off) return OFF[it.off];
  if (s === 'ring') return 'inv_jewelry_ring_03';
  if (s === 'trinket') return 'inv_jewelry_talisman_07';
  return SET_SLOT[s]?.[it.armor ?? 'cloth'] ?? 'inv_misc_questionmark';
}

/** An <img> of a WoW icon that swaps itself for the emoji fallback if it can't load. */
export function wowIcon(name: string | undefined, fallback: string, cls = 'wicon'): HTMLElement {
  const span = document.createElement('span');
  span.className = cls + ' fallback';
  span.textContent = fallback;
  if (!enabled || !name) return span;
  // Emoji underneath, icon on top: something is always visible while the icon loads.
  const wrapEl = document.createElement('span');
  wrapEl.className = cls + ' wwrap';
  const img = document.createElement('img');
  img.className = cls + ' wimg';
  img.alt = '';
  img.decoding = 'async';
  img.referrerPolicy = 'no-referrer';
  img.style.opacity = '0';
  img.onload = () => { img.style.opacity = '1'; };
  img.onerror = () => img.remove();
  img.src = CDN + name + '.jpg';
  wrapEl.append(span, img);
  return wrapEl;
}

// ---------- Private local art (public/wow/, git-ignored) ----------
const localCache = new Map<string, boolean>();
/** Try a local image; calls onReady(url) only if it exists. Results are cached. */
export function localArt(path: string, onReady: (url: string) => void) {
  if (!enabled) return;
  const url = `./wow/${path}`;
  const known = localCache.get(url);
  if (known === false) return;
  if (known === true) { onReady(url); return; }
  const img = new Image();
  img.onload = () => { localCache.set(url, true); onReady(url); };
  img.onerror = () => localCache.set(url, false);
  img.src = url;
}
