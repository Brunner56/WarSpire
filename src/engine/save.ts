// Persistent profile storage (localStorage; works in iOS WKWebView / Safari).
import type { Character, Look } from './character';
import type { RunState } from './run';
import type { ClassId, RaceId, Slot } from './types';
import { starterItems, UidGen } from './loot';

export interface Settings { fast: boolean; sound: boolean; wowArt: boolean }

export interface Profile {
  v: 1;
  characters: Character[];
  activeId: string | null;
  run: RunState | null;
  nextUid: number;
  settings: Settings;
}

const KEY = 'warspire.profile.v1';

export function newProfile(): Profile {
  return { v: 1, characters: [], activeId: null, run: null, nextUid: 1, settings: { fast: false, sound: true, wowArt: true } };
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return newProfile();
    const p = JSON.parse(raw) as Profile;
    if (p.v !== 1) return newProfile();
    p.settings = { ...newProfile().settings, ...(p.settings ?? {}) };
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
