// Chooses the soundtrack for the current screen and plays sounds for changes outside combat (gold, levels, loot).
import type { App } from '../app';
import { playMusic, TrackId } from './music';
import { sfx } from './audio';
import { DUNGEON_BY_ID } from '../../data/dungeons';
import { activeChar } from '../../engine/save';
import type { Combat } from '../../engine/combat';

function trackFor(app: App): TrackId | null {
  if (app.screen !== 'run') return 'tavern';
  const run = app.profile.run;
  if (!run) return 'tavern';
  const p = run.pending;
  if (p?.kind === 'combat' && app.combat) {
    const boss = app.combat.enemies.some(e => e.def.boss);
    if (boss) return DUNGEON_BY_ID[run.dungeonId]?.kind === 'raid' ? 'raid' : 'boss';
    return 'combat';
  }
  if (p?.kind === 'end') return 'tavern';
  return 'dungeon';
}

let seen: { run?: unknown; gold?: number; hp?: number; deck?: number; level?: number; combat?: Combat | null } = {};

export function afterRender(app: App) {
  const s = app.profile.settings;
  playMusic(s.sound && s.musicVol > 0 ? trackFor(app) : null);

  const ch = activeChar(app.profile);
  if (ch) {
    if (seen.level !== undefined && ch.level > seen.level) sfx('levelup');
    seen.level = ch.level;
  }
  const run = app.profile.run;
  if (!run) { seen = { level: seen.level }; return; }
  if (seen.run !== run) seen = { run, level: seen.level };
  if (app.combat && seen.combat !== app.combat) sfx('shuffle');
  seen.combat = app.combat;
  if (!app.combat) {
    if (seen.gold !== undefined && run.gold !== seen.gold) sfx('coin');
    else if (seen.deck !== undefined && run.deck.length > seen.deck) sfx('card');
    else if (seen.hp !== undefined && run.hp > seen.hp) sfx('heal');
  }
  seen.gold = run.gold; seen.deck = run.deck.length; seen.hp = run.hp;
}
