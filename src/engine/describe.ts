// Generates readable rules text for cards from their action lists.
import type { Action, CardDef, Keyword, Unit } from './types';
import { cardActions } from '../data/cards';
import { statusDef } from './statuses';
import { SEALS, TOTEMS, FORMS, PETS } from '../data/mechanics';
import type { Combat } from './combat';

const SCHOOL_NAME: Record<string, string> = { physical: '', holy: 'Holy ', fire: 'Fire ', frost: 'Frost ', arcane: 'Arcane ', shadow: 'Shadow ', nature: 'Nature ' };
const SIMPLE = new Set(['str', 'sp', 'dex', 'dodge', 'regen', 'thorns', 'fortify', 'clearcast', 'critnext', 'sweep', 'empower', 'petpow', 'stealth', 'retribution', 'lightningShield']);
const SRC_NAME: Record<string, string> = { cp: 'Combo Point', rage: 'Rage', shards: 'Soul Shard', block: 'Block', debuffs: 'debuff on the target', missingHp: 'missing HP', hand: 'card in hand', burn: 'Burning', regen: 'Regeneration', absorb: 'Shield' };

const resName = (def: CardDef) => def.cls === 'warrior' ? 'Rage' : def.cls === 'rogue' ? 'Energy' : (def.cls === 'neutral' || def.cls === 'token') ? 'resource' : 'Mana';
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export const KW_TEXT: Record<Keyword, string> = {
  cooldown: 'Cooldown (removed for the rest of combat once played).',
  innate: 'Prepared (always in your opening hand).',
  retain: 'Retain (not discarded at end of turn).',
  finisher: 'Finisher (consumes all Combo Points).',
  opener: 'Opener (always in your opening hand; costs 1 more outside Stealth).',
  unplayable: 'Unplayable.',
  caster: 'Spell (shifts a Druid out of Bear/Cat Form).',
  ethereal: 'Fleeting (removed if still in hand at end of turn).',
};

export function describeAction(a: Action, def: CardDef, live?: { c: Combat; t?: Unit }): string {
  const scale = (x?: { src: string; m: number }) => (x ? ` (+${x.m} per ${SRC_NAME[x.src] ?? x.src})` : '');
  switch (a.k) {
    case 'dmg': {
      const school = SCHOOL_NAME[a.school ?? def.school ?? (def.type === 'attack' ? 'physical' : 'arcane')] ?? '';
      let n: string = String(a.n);
      if (live && !a.x) {
        const t = live.t ?? live.c.alive()[0];
        if (t) {
          const d = live.c.calcCardHit(def, a.n, (a.school ?? def.school ?? 'physical'), t, true);
          n = d.amt > a.n ? `[+${d.amt}]` : d.amt < a.n ? `[-${d.amt}]` : String(d.amt);
        }
      }
      const where = a.tgt === 'all' ? ' to ALL enemies' : a.tgt === 'random' ? ' to a random enemy' : '';
      const times = a.hits && a.hits > 1 ? ` ${a.hits} times` : '';
      const ls = a.ls ? ` Heal for ${Math.round(a.ls * 100)}% of the damage.` : '';
      return `Deal ${n}${scale(a.x)} ${school}damage${where}${times}.${ls}`;
    }
    case 'block': return `Gain ${a.n}${scale(a.x)} Block.`;
    case 'absorb': return `Gain ${a.n} Shield.`;
    case 'heal': return `Restore ${a.n}${scale(a.x)} HP.`;
    case 'apply': {
      const sd = statusDef(a.s);
      const tgt = a.tgt ?? (sd.debuff ? 'enemy' : 'self');
      if (a.s === 'stun') return tgt === 'all' ? 'Stun ALL enemies.' : 'Stun the target.';
      if (a.s === 'poly') return tgt === 'all' ? 'Incapacitate ALL enemies.' : 'Incapacitate the target (breaks on damage).';
      if (a.s === 'invuln') return 'Become Invulnerable until your next turn.';
      if (a.s === 'stealth') return 'Enter Stealth.';
      if (tgt === 'self') {
        if (SIMPLE.has(a.s)) return `Gain ${a.n}${scale(a.x)} ${sd.name}.`;
        return `${sd.name}: ${sd.desc(a.n)}`;
      }
      const who = tgt === 'all' ? ' to ALL enemies' : tgt === 'random' ? ' to a random enemy' : '';
      return `Apply ${a.n}${scale(a.x)} ${sd.name}${who}.`;
    }
    case 'draw': return `Draw ${plural(a.n, 'card')}.`;
    case 'res': return `Gain ${a.n} ${resName(def)}.`;
    case 'cp': return `Gain ${plural(a.n, 'Combo Point')}.`;
    case 'shard': return `Gain ${plural(a.n, 'Soul Shard')}.`;
    case 'hp': return `Lose ${a.n} HP.`;
    case 'seal': return `${SEALS[a.id]?.name}: ${SEALS[a.id]?.desc}`;
    case 'judge': return 'Judge your Seal.';
    case 'totem': { const t = TOTEMS[a.id]; return `Place ${t?.name} (${t?.element}): ${t?.desc}`; }
    case 'form': return `Shift into ${FORMS[a.id]?.name}.`;
    case 'pet': { const p = PETS[a.id]; return `Summon ${p?.name}: ${p?.desc}`; }
    case 'petAtk': return `Your pet attacks the target for +${a.n} damage.`;
    case 'add': return `Add ${a.n && a.n > 1 ? a.n + ' ' : 'a '}${a.card === 't_mana_gem' ? 'Mana Gem' : a.card === 't_healthstone' ? 'Healthstone' : a.card} to your hand.`;
    case 'cleanse': return 'Remove all your debuffs.';
    case 'fn': return '';
  }
}

export function describeCard(def: CardDef, up: boolean, live?: { c: Combat; t?: Unit }): { text: string; kws: string[] } {
  const kws = (def.kw ?? []).filter(k => k !== 'caster' || def.cls === 'druid');
  const kwNames = kws.map(k => KW_TEXT[k].split(' (')[0].replace('.', ''));
  if (def.form) kwNames.unshift(FORMS[def.form].name);
  if (def.shards) kwNames.unshift(`${def.shards} Soul Shard`);
  let text: string;
  const hasFn = def.a.some(a => a.k === 'fn');
  if (def.text && (!up || hasFn || (!def.u && def.uc === undefined))) {
    text = def.text;
    if (up && hasFn) text += ' (Rank 2: improved.)';
    else if (up && !def.u) text += ' (Rank 2.)';
  } else {
    text = cardActions(def, up).map(a => describeAction(a, def, live)).filter(Boolean).join(' ');
  }
  return { text, kws: kwNames };
}
