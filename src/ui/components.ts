// Shared UI pieces: cards, items, statuses, bars, tooltips.
import { h, modal } from './dom';
import type { CardDef, CardInst, Item, Unit, StatKey } from '../engine/types';
import { getCard, cardCost } from '../data/cards';
import { describeCard, KW_TEXT } from '../engine/describe';
import { statusDef } from '../engine/statuses';
import { QUALITY_COLOR, SLOT_NAME, STAT_NAME, FX, SET_BY_ID } from '../data/items';
import { CLASS_BY_ID } from '../data/classes';
import type { Combat } from '../engine/combat';

const TYPE_NAME: Record<string, string> = { attack: 'Attack', skill: 'Ability', aura: 'Aura', curse: 'Affliction' };
const RARITY_COLOR: Record<string, string> = { starter: '#9d9d9d', common: '#e8e8e8', uncommon: '#1eff00', rare: '#3a9aff', special: '#ff8000' };
const SCHOOL_COLOR: Record<string, string> = { physical: '#c8b090', holy: '#ffe680', fire: '#ff7a3a', frost: '#7fd3ff', arcane: '#d68cff', shadow: '#a070d0', nature: '#7be37b' };

export function cardEl(ci: CardInst | { id: string; up: boolean }, opts: { c?: Combat; cost?: number; dim?: boolean; small?: boolean; onClick?: () => void; selected?: boolean; target?: Unit } = {}): HTMLElement {
  const def = getCard(ci.id);
  const cost = opts.cost ?? cardCost(def, ci.up);
  const cls = def.cls in CLASS_BY_ID ? CLASS_BY_ID[def.cls as keyof typeof CLASS_BY_ID] : null;
  const accent = cls?.color ?? (def.cls === 'curse' ? '#6a2a6a' : '#9a8a6a');
  const d = describeCard(def, ci.up, opts.c ? { c: opts.c, t: opts.target } : undefined);
  const text = d.text.replace(/\[\+(\d+)\]/g, '<b class="up">$1</b>').replace(/\[-(\d+)\]/g, '<b class="down">$1</b>');
  const school = def.school ?? (def.type === 'attack' ? 'physical' : undefined);
  const base = cardCost(def, ci.up);
  return h('div', {
    class: `card t-${def.type} ${opts.small ? 'small' : ''} ${opts.dim ? 'dim' : ''} ${opts.selected ? 'selected' : ''} ${ci.up ? 'upgraded' : ''}`,
    style: { '--accent': accent, '--rarity': RARITY_COLOR[def.rarity] ?? '#ccc' },
    onclick: opts.onClick,
  },
    def.cost >= 0 ? h('div', { class: `cost ${cost < base ? 'cheaper' : ''}` }, String(cost)) : null,
    h('div', { class: 'cname' }, def.name + (ci.up ? '+' : '')),
    h('div', { class: 'cart', style: { '--school': school ? SCHOOL_COLOR[school] : '#888' } }, h('span', null, def.icon)),
    h('div', { class: 'ctype' }, `${TYPE_NAME[def.type]}${school && school !== 'physical' ? ' · ' + school[0].toUpperCase() + school.slice(1) : ''}`),
    h('div', { class: 'ctext', html: text }),
    d.kws.length ? h('div', { class: 'ckw' }, d.kws.join(' · ')) : null,
  );
}

export function cardDetail(def: CardDef, up: boolean): HTMLElement {
  const kws = (def.kw ?? []).filter(k => k !== 'caster' || def.cls === 'druid').map(k => h('div', { class: 'kwline' }, KW_TEXT[k]));
  return h('div', { class: 'card-detail' }, cardEl({ id: def.id, up }), up ? null : h('div', { class: 'muted small' }, 'Rank 2 (upgrade):'), up ? null : cardEl({ id: def.id, up: true }, { small: true }), h('div', { class: 'kwlist' }, kws));
}

export function showCard(ci: { id: string; up: boolean }) {
  modal(cardDetail(getCard(ci.id), ci.up));
}

export function hpBar(hp: number, max: number, block = 0, absorb = 0): HTMLElement {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  return h('div', { class: 'hpbar' },
    h('div', { class: 'fill', style: { width: pct + '%' } }),
    absorb ? h('div', { class: 'absorb-ov', style: { width: Math.min(100, (absorb / max) * 100) + '%' } }) : null,
    h('div', { class: 'hptext' }, `${Math.max(0, hp)} / ${max}`),
    block ? h('div', { class: 'blockbadge' }, h('span', null, '🛡'), String(block)) : null,
  );
}

export function statusRow(u: Unit): HTMLElement {
  const row = h('div', { class: 'statuses' });
  for (const [s, n] of Object.entries(u.st)) {
    if (!n || s === 'absorb' && false) continue;
    const def = statusDef(s);
    if (def.hidden) continue;
    row.appendChild(h('div', { class: `st ${def.debuff ? 'debuff' : 'buff'}`, title: `${def.name}: ${def.desc(n)}`, onclick: (e: Event) => { e.stopPropagation(); modal(h('div', null, h('h3', null, `${def.icon} ${def.name}`), h('p', null, def.desc(n)))); } },
      h('span', null, def.icon), s === 'stun' || s === 'poly' || s === 'invuln' || s === 'airborne' || s === 'immune' || s === 'stealth' ? null : h('b', null, String(n))));
  }
  return row;
}

const SLOT_ICON: Record<string, string> = { head: '⛑️', shoulder: '🦺', chest: '👕', hands: '🧤', legs: '👖', feet: '🥾', mainhand: '⚔️', offhand: '🛡️', ring: '💍', trinket: '📿' };
const WPN_ICON: Record<string, string> = { sword: '🗡️', sword2h: '⚔️', axe: '🪓', axe2h: '🪓', mace: '🔨', mace2h: '🔨', dagger: '🔪', fist: '🤜', staff: '🪄', polearm: '🔱', bow: '🏹', gun: '🔫' };
const OFF_ICON: Record<string, string> = { shield: '🛡️', orb: '🔮', tome: '📕', weapon: '🔪' };

export function itemIcon(it: Item): string {
  if (it.slot === 'mainhand' && it.wpn) return WPN_ICON[it.wpn];
  if (it.slot === 'offhand' && it.off) return OFF_ICON[it.off];
  return SLOT_ICON[it.slot];
}

export function statLines(stats: Partial<Record<StatKey, number>>): string[] {
  const order: StatKey[] = ['armor', 'ap', 'sp', 'sta', 'str', 'agi', 'int', 'spi', 'crit'];
  return order.filter(k => stats[k]).map(k => k === 'armor' ? `${stats[k]} Armor` : k === 'crit' ? `+${stats[k]}% Critical Strike` : `+${stats[k]} ${STAT_NAME[k]}`);
}

export function itemTile(it: Item | undefined, opts: { onClick?: () => void; slot?: string; compact?: boolean } = {}): HTMLElement {
  if (!it) return h('div', { class: 'itile empty', onclick: opts.onClick }, h('span', { class: 'iicon' }, SLOT_ICON[opts.slot ?? 'chest'] ?? '▫️'), h('span', { class: 'iname muted' }, opts.slot ? SLOT_NAME[opts.slot as keyof typeof SLOT_NAME] : 'Empty'));
  return h('div', { class: `itile q-${it.q}`, onclick: opts.onClick, style: { '--q': QUALITY_COLOR[it.q] } },
    h('span', { class: 'iicon', style: { background: `linear-gradient(135deg, ${it.look.c1}, ${it.look.c2 ?? it.look.c1})` } }, itemIcon(it)),
    h('span', { class: 'iname' }, it.name),
    opts.compact ? null : h('span', { class: 'istats' }, statLines(it.stats).slice(0, 3).join(' · ')),
  );
}

export function itemTooltip(it: Item, opts: { equippedSet?: Record<string, number>; compare?: Item; usable?: boolean } = {}): HTMLElement {
  const lines: (HTMLElement | null)[] = [];
  lines.push(h('div', { class: 'tt-name', style: { color: QUALITY_COLOR[it.q] } }, it.name));
  lines.push(h('div', { class: 'tt-sub' }, `${SLOT_NAME[it.slot]}${it.armor ? ' · ' + it.armor[0].toUpperCase() + it.armor.slice(1) : ''}${it.wpn ? ' · ' + (it.twoHand ? 'Two-Hand ' : '') + it.wpn.replace('2h', '') : ''}${it.off ? ' · ' + it.off : ''}`));
  lines.push(h('div', { class: 'tt-ilvl' }, `Item Level ${it.ilvl}`));
  for (const l of statLines(it.stats)) lines.push(h('div', { class: 'tt-stat' }, l));
  if (it.fx && FX[it.fx]) lines.push(h('div', { class: 'tt-equip' }, `Equip: ${FX[it.fx].desc}`));
  if (it.set) {
    const s = SET_BY_ID[it.set];
    const have = opts.equippedSet?.[it.set] ?? 0;
    lines.push(h('div', { class: 'tt-set' }, `${s.name} (${have}/4)`));
    for (const b of s.bonuses) lines.push(h('div', { class: `tt-setb ${have >= b.n ? 'on' : ''}` }, `(${b.n}) Set: ${b.fx.desc}`));
  }
  if (it.cls) lines.push(h('div', { class: 'tt-sub' }, `Classes: ${it.cls.map(c => CLASS_BY_ID[c].name).join(', ')}`));
  if (opts.usable === false) lines.push(h('div', { class: 'tt-bad' }, 'You cannot equip this item.'));
  if (it.flavor) lines.push(h('div', { class: 'tt-flavor' }, `"${it.flavor}"`));
  if (opts.compare) {
    const diff: string[] = [];
    const keys = new Set([...Object.keys(it.stats), ...Object.keys(opts.compare.stats)]) as Set<StatKey>;
    for (const k of keys) {
      const dv = (it.stats[k] ?? 0) - (opts.compare.stats[k] ?? 0);
      if (dv) diff.push(`${dv > 0 ? '+' : ''}${dv} ${k === 'crit' ? 'Crit' : STAT_NAME[k]}`);
    }
    lines.push(h('div', { class: 'tt-compare' }, h('div', { class: 'muted' }, `vs. equipped ${opts.compare.name}:`), h('div', null, diff.length ? diff.map(x => h('span', { class: x.startsWith('+') ? 'up' : 'down' }, x + '  ')) : 'No stat change')));
  }
  return h('div', { class: 'tooltip' }, lines);
}

export function goldEl(n: number) { return h('span', { class: 'gold' }, `${n}`, h('span', { class: 'coin' }, '●')); }

export function section(title: string, ...children: (HTMLElement | null)[]) {
  return h('div', { class: 'section' }, h('h3', null, title), ...children);
}
