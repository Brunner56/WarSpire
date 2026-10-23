// Persistent profile storage (localStorage; works in iOS WKWebView / Safari).
import type { Character, Look } from './character';
import type { RunState } from './run';
import type { ClassId, RaceId, Slot } from './types';
import { starterItems, UidGen } from './loot';

export interface Settings {
  fast: boolean; sound: boolean; wowArt: boolean;
  /** 0..1 volumes; motion = combat animations */
  musicVol: number; sfxVol: number; motion: boolean;
}

export interface Profile {
  v: 1;
  characters: Character[];
  activeId: string | null;
  run: RunState | null;
  nextUid: number;
  settings: Settings;
  /** Hardcore heroes who died (memorial). */
  fallen?: FallenHero[];
  /** Save-format revision for migrations. */
  rev?: number;
}

export interface FallenHero { name: string; race: RaceId; cls: ClassId; level: number; dungeon: string; at: number }

const KEY = 'warspire.profile.v1';

export function newProfile(): Profile {
  return { v: 1, rev: 2, characters: [], activeId: null, run: null, nextUid: 1, settings: { fast: false, sound: true, wowArt: true, musicVol: 0.6, sfxVol: 0.8, motion: true } };
}

/** rev 2: Heroic I–V ranks became Normal/Heroic/Mythic/Hardcore; old Heroic clears count as Normal clears. */
function migrate(p: Profile) {
  if ((p.rev ?? 1) < 2) {
    for (const ch of p.characters) for (const k of Object.keys(ch.cleared)) ch.cleared[k] = Math.min(ch.cleared[k], 0);
    if (p.run && p.run.rank > 0) p.run.rank = 1;
  }
  p.rev = 2;
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return newProfile();
    const p = JSON.parse(raw) as Profile;
    if (p.v !== 1) return newProfile();
    p.settings = { ...newProfile().settings, ...(p.settings ?? {}) };
    migrate(p);
    return p;
  } catch {
    return newProfile();
  }
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage full or unavailable */ }
}

export function wipeProfile() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function createCharacter(p: Profile, o: { name: string; race: RaceId; cls: ClassId; spec: string; look: Look; pet?: string }): Character {
  const uid = new UidGen(p.nextUid);
  const items = starterItems(o.cls, uid);
  p.nextUid = uid.n + 1;
  const equipped: Partial<Record<Slot, number>> = {};
  for (const it of items) equipped[it.slot] = it.uid;
  const ch: Character = {
    id: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
    name: o.name, race: o.race, cls: o.cls, spec: o.spec, look: o.look, pet: o.pet,
    level: 1, xp: 0, talents: {}, armory: items, equipped, cleared: {},
    stats: { runs: 0, wins: 0, deaths: 0, bossKills: 0, bestFloor: 0 }, created: Date.now(),
  };
  p.characters.push(ch);
  p.activeId = ch.id;
  return ch;
}

export function activeChar(p: Profile): Character | null {
  return p.characters.find(c => c.id === p.activeId) ?? null;
}
