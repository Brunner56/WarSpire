// Paper-doll SVG renderer: race body + appearance + visibly equipped gear.
import type { Item, RaceId, Slot, WeaponType, OffType } from '../../engine/types';
import { RACE_BY_ID } from '../../data/races';

export interface DollGear {
  slot: Slot;
  armor?: Item['armor'];
  wpn?: WeaponType;
  off?: OffType;
  q: Item['q'];
  look: { c1: string; c2?: string; style?: string };
  set?: string;
}

export interface DollSpec {
  race: RaceId;
  skin: number;
  hair: number;
  hairColor: number;
  face: number;
  gear: DollGear[];
  skinOverride?: string;
  flip?: boolean;
  aura?: string;
  form?: string;
}

let uidc = 0;

const shade = (hex: string, amt: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r + amt * 255)));
  g = Math.max(0, Math.min(255, Math.round(g + amt * 255)));
  b = Math.max(0, Math.min(255, Math.round(b + amt * 255)));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
export { shade };

const QGLOW: Record<string, string> = { epic: '#b048ff', legendary: '#ff8a1a', rare: '#2a8aff' };

export function weaponSvg(w: WeaponType, c1: string, c2: string, x: number, y: number, big = false): string {
  const s = big ? 1.25 : 1;
  const metal = '#d8dde6';
  const hilt = c2;
  const g = (inner: string) => `<g transform="translate(${x},${y}) scale(${s})">${inner}</g>`;
  switch (w) {
    case 'sword': return g(`<rect x="-2" y="-46" width="4" height="40" rx="1" fill="${metal}" stroke="${shade(c1, -0.2)}" stroke-width="0.8"/><rect x="-1" y="-44" width="1" height="36" fill="${c1}" opacity=".6"/><rect x="-8" y="-7" width="16" height="3" rx="1" fill="${hilt}"/><rect x="-1.5" y="-4" width="3" height="8" fill="#5a3a1a"/><circle cx="0" cy="5" r="2.2" fill="${hilt}"/>`);
    case 'sword2h': return g(`<rect x="-3" y="-62" width="6" height="56" rx="1" fill="${metal}" stroke="${shade(c1, -0.2)}" stroke-width="0.8"/><rect x="-1" y="-60" width="2" height="52" fill="${c1}" opacity=".7"/><path d="M-11 -8 L11 -8 L8 -4 L-8 -4Z" fill="${hilt}"/><rect x="-2" y="-4" width="4" height="12" fill="#4a2a1a"/><circle cx="0" cy="9" r="3" fill="${hilt}"/>`);
    case 'axe': return g(`<rect x="-1.5" y="-40" width="3" height="46" fill="#6a4a2a"/><path d="M1 -40 Q16 -36 15 -24 Q8 -27 1 -26Z" fill="${metal}" stroke="${c1}" stroke-width="1.2"/>`);
    case 'axe2h': return g(`<rect x="-2" y="-58" width="4" height="66" fill="#5a3a1a"/><path d="M2 -58 Q24 -52 22 -34 Q12 -38 2 -36Z" fill="${metal}" stroke="${c1}" stroke-width="1.5"/><path d="M-2 -58 Q-24 -52 -22 -34 Q-12 -38 -2 -36Z" fill="${metal}" stroke="${c1}" stroke-width="1.5"/>`);
    case 'mace': return g(`<rect x="-1.5" y="-34" width="3" height="40" fill="#6a4a2a"/><circle cx="0" cy="-36" r="6" fill="${c1}" stroke="${shade(c1, -0.3)}"/><path d="M0 -46 L2 -41 L-2 -41Z M-9 -36 L-5 -38 L-5 -34Z M9 -36 L5 -38 L5 -34Z" fill="${metal}"/>`);
    case 'mace2h': return g(`<rect x="-2" y="-54" width="4" height="62" fill="#5a3a1a"/><rect x="-11" y="-66" width="22" height="14" rx="3" fill="${c1}" stroke="${shade(c1, -0.35)}" stroke-width="1.2"/><rect x="-11" y="-61" width="22" height="3" fill="${c2}"/>`);
    case 'dagger': return g(`<path d="M0 -26 L2.5 -6 L-2.5 -6Z" fill="${metal}" stroke="${c1}" stroke-width="0.8"/><rect x="-5" y="-7" width="10" height="2.5" fill="${hilt}"/><rect x="-1.2" y="-5" width="2.4" height="7" fill="#4a2a1a"/>`);
    case 'fist': return g(`<path d="M-4 -2 L-6 -14 M0 -2 L0 -16 M4 -2 L6 -14" stroke="${metal}" stroke-width="2.2" stroke-linecap="round"/><rect x="-6" y="-3" width="12" height="5" rx="2" fill="${c1}"/>`);
    case 'staff': return g(`<rect x="-1.8" y="-68" width="3.6" height="80" rx="1.5" fill="#6a4a2a"/><circle cx="0" cy="-70" r="6" fill="${c1}" opacity=".9"/><circle cx="0" cy="-70" r="3" fill="#fff" opacity=".7"/><path d="M-6 -64 Q0 -58 6 -64" stroke="${c2}" stroke-width="2" fill="none"/>`);
    case 'polearm': return g(`<rect x="-1.6" y="-72" width="3.2" height="84" fill="#5a3a1a"/><path d="M0 -86 L5 -72 L0 -68 L-5 -72Z" fill="${metal}"/><path d="M1 -70 Q16 -66 12 -54 L1 -58Z" fill="${metal}" stroke="${c1}"/>`);
    case 'bow': return g(`<path d="M-2 -40 Q16 -10 -2 22" stroke="${c1}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M-2 -40 L-2 22" stroke="#e8e0c8" stroke-width="0.8"/><circle cx="6" cy="-9" r="2" fill="${c2}"/>`);
    case 'gun': return g(`<rect x="-3" y="-36" width="5" height="34" rx="1" fill="#3a3a3a"/><rect x="-4" y="-6" width="8" height="14" rx="2" fill="#6a4a2a"/><rect x="-3.5" y="-30" width="6" height="3" fill="${c1}"/>`);
  }
  return '';
}

export function offhandSvg(o: OffType, c1: string, c2: string, x: number, y: number): string {
  const g = (inner: string) => `<g transform="translate(${x},${y})">${inner}</g>`;
  switch (o) {
    case 'shield': return g(`<path d="M-13 -16 L13 -16 L12 4 Q8 16 0 22 Q-8 16 -12 4Z" fill="${c1}" stroke="${shade(c1, -0.35)}" stroke-width="2"/><path d="M-9 -12 L9 -12 L8 3 Q5 12 0 16 Q-5 12 -8 3Z" fill="none" stroke="${c2}" stroke-width="1.5"/><circle cx="0" cy="0" r="4" fill="${c2}"/>`);
    case 'orb': return g(`<circle cx="0" cy="-6" r="7" fill="${c1}" opacity=".85"/><circle cx="-2" cy="-8" r="2.5" fill="#fff" opacity=".7"/><circle cx="0" cy="-6" r="9" fill="none" stroke="${c2}" stroke-width=".8" opacity=".6"/>`);
    case 'tome': return g(`<rect x="-8" y="-12" width="15" height="19" rx="1.5" fill="${c1}" stroke="${shade(c1, -0.3)}"/><rect x="-6" y="-12" width="2" height="19" fill="${c2}"/><circle cx="1" cy="-3" r="2.5" fill="${c2}"/>`);
    case 'weapon': return weaponSvg('dagger', c1, c2, x, y);
  }
}

interface Body { cx: number; shoulderY: number; hipY: number; footY: number; headY: number; headR: number; torsoW: number; legW: number; armW: number }

function helmSvg(g: DollGear, b: Body, ears: string): string {
  const { cx, headY, headR } = b;
  const c1 = g.look.c1, c2 = g.look.c2 ?? shade(c1, -0.2);
  const style = g.look.style ?? (g.armor === 'cloth' ? 'hood' : g.armor === 'leather' ? 'cap' : g.armor === 'mail' ? 'coif' : 'plate');
  const top = headY - headR;
  switch (style) {
    case 'hood': return `<path d="M${cx - headR - 4} ${headY + 8} Q${cx - headR - 5} ${top - 6} ${cx} ${top - 8} Q${cx + headR + 5} ${top - 6} ${cx + headR + 4} ${headY + 8} L${cx + headR - 2} ${headY + 2} Q${cx} ${top + 4} ${cx - headR + 2} ${headY + 2}Z" fill="${c1}" stroke="${shade(c1, -0.3)}"/>`;
    case 'crown': return `<path d="M${cx - 11} ${top + 3} L${cx - 11} ${top - 6} L${cx - 6} ${top - 1} L${cx} ${top - 9} L${cx + 6} ${top - 1} L${cx + 11} ${top - 6} L${cx + 11} ${top + 3}Z" fill="${c2 === c1 ? '#d4af37' : c1}" stroke="#7a5a0a"/><circle cx="${cx}" cy="${top - 1}" r="2" fill="${c2}"/>`;
    case 'hat': return `<ellipse cx="${cx}" cy="${top + 2}" rx="${headR + 10}" ry="4" fill="${c1}" stroke="${shade(c1, -0.3)}"/><path d="M${cx - 10} ${top + 2} Q${cx - 9} ${top - 14} ${cx} ${top - 15} Q${cx + 9} ${top - 14} ${cx + 10} ${top + 2}Z" fill="${c1}"/><rect x="${cx - 10}" y="${top - 2}" width="20" height="3" fill="${c2}"/>`;
    case 'mask': return `<path d="M${cx - headR} ${headY + 2} L${cx + headR} ${headY + 2} L${cx + headR - 2} ${headY + headR - 2} Q${cx} ${headY + headR + 4} ${cx - headR + 2} ${headY + headR - 2}Z" fill="${c1}"/><path d="M${cx - headR} ${headY - 6} Q${cx} ${top - 6} ${cx + headR} ${headY - 6} L${cx + headR} ${headY - 10} Q${cx} ${top - 10} ${cx - headR} ${headY - 10}Z" fill="${c1}"/>`;
    case 'goggles': return `<rect x="${cx - headR}" y="${headY - 6}" width="${headR * 2}" height="3" fill="#3a2a1a"/><circle cx="${cx - 6}" cy="${headY - 4}" r="4.5" fill="#8acfff" stroke="#c08a3a" stroke-width="2"/><circle cx="${cx + 6}" cy="${headY - 4}" r="4.5" fill="#8acfff" stroke="#c08a3a" stroke-width="2"/>`;
    case 'skull': return `<path d="M${cx - headR - 2} ${headY + 4} Q${cx - headR - 3} ${top - 6} ${cx} ${top - 7} Q${cx + headR + 3} ${top - 6} ${cx + headR + 2} ${headY + 4}Z" fill="#d8d8c8" stroke="#6a6a5a"/><circle cx="${cx - 5}" cy="${headY - 4}" r="3" fill="#222"/><circle cx="${cx + 5}" cy="${headY - 4}" r="3" fill="#222"/><path d="M${cx - 12} ${top} Q${cx - 22} ${top - 12} ${cx - 16} ${top - 18}" stroke="#d8d8c8" stroke-width="3" fill="none"/><path d="M${cx + 12} ${top} Q${cx + 22} ${top - 12} ${cx + 16} ${top - 18}" stroke="#d8d8c8" stroke-width="3" fill="none"/>`;
    case 'cap': return `<path d="M${cx - headR - 1} ${headY - 2} Q${cx} ${top - 9} ${cx + headR + 1} ${headY - 2} L${cx + headR + 1} ${headY - 6} Q${cx} ${top - 5} ${cx - headR - 1} ${headY - 6}Z" fill="${c1}" stroke="${shade(c1, -0.3)}"/>${ears}`;
    case 'coif': return `<path d="M${cx - headR - 3} ${headY + 10} L${cx - headR - 3} ${headY - 4} Q${cx} ${top - 8} ${cx + headR + 3} ${headY - 4} L${cx + headR + 3} ${headY + 10} L${cx + headR - 1} ${headY + 10} L${cx + headR - 1} ${headY - 3} Q${cx} ${top} ${cx - headR + 1} ${headY - 3} L${cx - headR + 1} ${headY + 10}Z" fill="${c1}" stroke="${shade(c1, -0.35)}"/><path d="M${cx - headR} ${headY} h${headR * 2}" stroke="${shade(c1, -0.2)}" stroke-dasharray="1.5 1.5"/>`;
    case 'horned':
    case 'spiked':
    case 'plate':
    case 'winged':
    default: {
      const horns = style === 'horned' || style === 'spiked' || g.q === 'epic' || g.q === 'legendary'
        ? `<path d="M${cx - headR} ${headY - 6} Q${cx - headR - 14} ${headY - 14} ${cx - headR - 10} ${top - 12}" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${cx + headR} ${headY - 6} Q${cx + headR + 14} ${headY - 14} ${cx + headR + 10} ${top - 12}" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round"/>` : '';
      const wings = style === 'winged' ? `<path d="M${cx - headR} ${headY - 4} l-10 -10 l4 10 l-6 -2 l8 8Z M${cx + headR} ${headY - 4} l10 -10 l-4 10 l6 -2 l-8 8Z" fill="${c2}"/>` : '';
      return `${horns}${wings}<path d="M${cx - headR - 2} ${headY + 9} L${cx - headR - 2} ${headY - 5} Q${cx} ${top - 9} ${cx + headR + 2} ${headY - 5} L${cx + headR + 2} ${headY + 9} Z" fill="${c1}" stroke="${shade(c1, -0.35)}" stroke-width="1.2"/><rect x="${cx - headR + 2}" y="${headY - 4}" width="${(headR - 2) * 2}" height="3.5" fill="#111" rx="1"/><path d="M${cx} ${top - 8} L${cx} ${headY + 9}" stroke="${shade(c1, 0.25)}" stroke-width="1.5"/>`;
    }
  }
}

function hairSvg(style: number, color: string, b: Body, race: RaceId): string {
  const { cx, headY, headR } = b;
  const top = headY - headR;
  switch (style % 6) {
    case 0: return `<path d="M${cx - headR} ${headY - 2} Q${cx - headR - 1} ${top - 4} ${cx} ${top - 4} Q${cx + headR + 1} ${top - 4} ${cx + headR} ${headY - 2} Q${cx + 6} ${top + 4} ${cx - headR} ${headY - 2}Z" fill="${color}"/>`;
    case 1: return `<path d="M${cx - headR - 1} ${headY + 22} Q${cx - headR - 4} ${top - 5} ${cx} ${top - 5} Q${cx + headR + 4} ${top - 5} ${cx + headR + 1} ${headY + 22} L${cx + headR - 3} ${headY + 20} L${cx + headR - 2} ${headY - 4} Q${cx} ${top + 3} ${cx - headR + 2} ${headY - 4} L${cx - headR + 3} ${headY + 20}Z" fill="${color}"/>`;
    case 2: return `<path d="M${cx - 4} ${top + 2} Q${cx} ${top - 18} ${cx + 4} ${top + 2}Z" fill="${color}"/><path d="M${cx - 3} ${top - 2} L${cx} ${top - 14} L${cx + 3} ${top - 2}" fill="${color}"/>`;
    case 3: return `<path d="M${cx - headR} ${headY - 2} Q${cx} ${top - 6} ${cx + headR} ${headY - 2} Q${cx} ${top + 2} ${cx - headR} ${headY - 2}Z" fill="${color}"/><circle cx="${cx}" cy="${top - 5}" r="6" fill="${color}"/>`;
    case 4: return race === 'dwarf' || race === 'tauren' ? '' : `<path d="M${cx - headR} ${headY} Q${cx - headR - 2} ${headY - 8} ${cx - headR + 3} ${headY - 10}" stroke="${color}" stroke-width="2" fill="none"/>`;
    default: return `<path d="M${cx - headR} ${headY - 2} L${cx - 10} ${top - 8} L${cx - 4} ${top - 2} L${cx} ${top - 12} L${cx + 4} ${top - 2} L${cx + 10} ${top - 8} L${cx + headR} ${headY - 2} Q${cx} ${top + 4} ${cx - headR} ${headY - 2}Z" fill="${color}"/>`;
  }
}

export function dollSvg(spec: DollSpec, opts: { w?: number; h?: number; pet?: string } = {}): string {
  const race = RACE_BY_ID[spec.race];
  const id = 'd' + uidc++;
  const skin = spec.skinOverride ?? race.skins[spec.skin % race.skins.length];
  const hairC = race.hairColors[spec.hairColor % race.hairColors.length];
  const gear: Partial<Record<Slot, DollGear>> = {};
  for (const g of spec.gear) gear[g.slot] = g;
  const gnome = spec.race === 'gnome';
  const b: Body = {
    cx: 60, shoulderY: gnome ? 98 : 64, hipY: gnome ? 132 : 112, footY: 172, headY: gnome ? 70 : 42, headR: gnome ? 19 : spec.race === 'tauren' ? 17 : 15,
    torsoW: gnome ? 28 : 34, legW: gnome ? 9 : 12, armW: gnome ? 8 : 9,
  };
  const { cx, shoulderY: sy, hipY: hy, footY: fy, headY, headR, torsoW, legW, armW } = b;
  const pants = gear.legs?.look.c1 ?? '#5a4a3a';
  const shirt = gear.chest?.look.c1 ?? '#8a7a62';
  const chestAccent = gear.chest?.look.c2 ?? shade(shirt, -0.15);
  const boots = gear.feet?.look.c1 ?? '#3a2a1a';
  const glove = gear.hands?.look.c1;
  const dark = (c: string) => shade(c, -0.25);
  const parts: string[] = [];
  // defs
  parts.push(`<defs>
    <linearGradient id="${id}sk" x1="0" x2="1"><stop offset="0" stop-color="${shade(skin, 0.06)}"/><stop offset="1" stop-color="${shade(skin, -0.12)}"/></linearGradient>
    <linearGradient id="${id}ch" x1="0" x2="1"><stop offset="0" stop-color="${shade(shirt, 0.12)}"/><stop offset=".55" stop-color="${shirt}"/><stop offset="1" stop-color="${shade(shirt, -0.2)}"/></linearGradient>
    <filter id="${id}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`);
  // shadow
  parts.push(`<ellipse cx="${cx}" cy="${fy + 3}" rx="30" ry="5" fill="#000" opacity=".35"/>`);
  if (spec.aura) parts.push(`<ellipse cx="${cx}" cy="${(hy + headY) / 2}" rx="46" ry="78" fill="${spec.aura}" opacity=".18" filter="url(#${id}glow)"/>`);
  // legs
  const legTop = hy - 4;
  parts.push(`<rect x="${cx - legW - 1}" y="${legTop}" width="${legW}" height="${fy - legTop - 6}" rx="3" fill="${pants}" stroke="${dark(pants)}"/>`);
  parts.push(`<rect x="${cx + 1}" y="${legTop}" width="${legW}" height="${fy - legTop - 6}" rx="3" fill="${pants}" stroke="${dark(pants)}"/>`);
  if (gear.legs?.armor === 'plate' || gear.legs?.armor === 'mail') {
    parts.push(`<rect x="${cx - legW}" y="${(legTop + fy) / 2 - 4}" width="${legW - 2}" height="6" rx="2" fill="${gear.legs.look.c2 ?? shade(pants, 0.2)}"/><rect x="${cx + 2}" y="${(legTop + fy) / 2 - 4}" width="${legW - 2}" height="6" rx="2" fill="${gear.legs.look.c2 ?? shade(pants, 0.2)}"/>`);
  }
  // boots
  parts.push(`<path d="M${cx - legW - 3} ${fy - 14} h${legW + 2} v12 h-${legW + 6} q-2 0 -2 -3Z" fill="${boots}" stroke="${dark(boots)}"/>`);
  parts.push(`<path d="M${cx + 1} ${fy - 14} h${legW + 2} v9 q0 3 2 3 h-${legW + 4}Z" fill="${boots}" stroke="${dark(boots)}"/>`);
  // back arm (left on screen) & torso & robe
  const armY = sy + 2;
  const armLen = hy - sy + 2;
  const armSkin = `url(#${id}sk)`;
  const sleeve = gear.chest ? shirt : shirt;
  parts.push(`<rect x="${cx - torsoW / 2 - armW + 1}" y="${armY}" width="${armW}" height="${armLen}" rx="4" fill="${armSkin}"/>`);
  parts.push(`<rect x="${cx - torsoW / 2 - armW + 1}" y="${armY}" width="${armW}" height="${armLen * 0.55}" rx="4" fill="${sleeve}" stroke="${dark(sleeve)}"/>`);
  parts.push(`<rect x="${cx + torsoW / 2 - 1}" y="${armY}" width="${armW}" height="${armLen}" rx="4" fill="${armSkin}"/>`);
  parts.push(`<rect x="${cx + torsoW / 2 - 1}" y="${armY}" width="${armW}" height="${armLen * 0.55}" rx="4" fill="${sleeve}" stroke="${dark(sleeve)}"/>`);
  // torso
  const robe = gear.chest?.armor === 'cloth';
  const bottom = robe ? fy - 22 : hy + 2;
  parts.push(`<path d="M${cx - torsoW / 2} ${sy} L${cx + torsoW / 2} ${sy} L${cx + torsoW / 2 - 2 + (robe ? 8 : 0)} ${bottom} L${cx - torsoW / 2 + 2 - (robe ? 8 : 0)} ${bottom}Z" fill="url(#${id}ch)" stroke="${dark(shirt)}" stroke-width="1.2"/>`);
  if (robe) parts.push(`<path d="M${cx} ${hy - 6} L${cx} ${bottom}" stroke="${chestAccent}" stroke-width="3"/>`);
  const ca = gear.chest?.armor;
  if (ca === 'plate') parts.push(`<path d="M${cx - torsoW / 2 + 4} ${sy + 8} Q${cx} ${sy + 18} ${cx + torsoW / 2 - 4} ${sy + 8}" stroke="${shade(shirt, 0.3)}" stroke-width="2" fill="none"/><path d="M${cx - torsoW / 2 + 4} ${sy + 20} Q${cx} ${sy + 30} ${cx + torsoW / 2 - 4} ${sy + 20}" stroke="${chestAccent}" stroke-width="2" fill="none"/><circle cx="${cx}" cy="${sy + 14}" r="3.5" fill="${chestAccent}"/>`);
  else if (ca === 'mail') parts.push(`<path d="M${cx - torsoW / 2 + 3} ${sy + 6} h${torsoW - 6} M${cx - torsoW / 2 + 3} ${sy + 14} h${torsoW - 6} M${cx - torsoW / 2 + 3} ${sy + 22} h${torsoW - 6} M${cx - torsoW / 2 + 3} ${sy + 30} h${torsoW - 6}" stroke="${shade(shirt, 0.25)}" stroke-dasharray="2 2" stroke-width="1.5"/>`);
  else if (ca === 'leather') parts.push(`<path d="M${cx - 6} ${sy} L${cx} ${sy + 12} L${cx + 6} ${sy}" stroke="${chestAccent}" stroke-width="2" fill="none"/>`);
  // belt
  parts.push(`<rect x="${cx - torsoW / 2 + 1}" y="${hy - 6}" width="${torsoW - 2}" height="5" fill="${gear.chest ? shade(chestAccent, -0.15) : '#4a3020'}"/><rect x="${cx - 3}" y="${hy - 6.5}" width="6" height="6" rx="1" fill="#d4af37"/>`);
  // hands / gloves
  const lhx = cx - torsoW / 2 - armW / 2 + 1, rhx = cx + torsoW / 2 + armW / 2 - 1, hyy = sy + armLen + 2;
  for (const hx of [lhx, rhx]) {
    parts.push(`<circle cx="${hx}" cy="${hyy}" r="${armW / 2 + 1}" fill="${glove ?? skin}" stroke="${dark(glove ?? skin)}"/>`);
    if (glove) parts.push(`<rect x="${hx - armW / 2 - 1}" y="${hyy - 12}" width="${armW + 2}" height="7" rx="2" fill="${glove}" stroke="${dark(glove)}"/>`);
  }
  // shoulders
  if (gear.shoulder) {
    const s = gear.shoulder, c1 = s.look.c1, c2 = s.look.c2 ?? shade(c1, 0.2);
    const r = s.armor === 'plate' ? 10 : s.armor === 'mail' ? 9 : s.armor === 'leather' ? 8 : 7;
    const spikes = s.q === 'epic' || s.q === 'legendary' || s.armor === 'plate';
    for (const sx of [cx - torsoW / 2 - 1, cx + torsoW / 2 + 1]) {
      const dir = sx < cx ? -1 : 1;
      if (spikes) parts.push(`<path d="M${sx + dir * 2} ${sy - 4} L${sx + dir * 12} ${sy - 16} L${sx + dir * 8} ${sy - 2}Z" fill="${c2}"/>`);
      parts.push(`<ellipse cx="${sx}" cy="${sy + 1}" rx="${r + 2}" ry="${r - 1}" fill="${c1}" stroke="${dark(c1)}" stroke-width="1.2"/><ellipse cx="${sx}" cy="${sy - 1}" rx="${r - 3}" ry="${r - 5}" fill="${shade(c1, 0.18)}"/>`);
    }
  }
  // neck/head
  parts.push(`<rect x="${cx - 5}" y="${headY + headR - 6}" width="10" height="${sy - headY - headR + 8}" fill="${armSkin}"/>`);
  // hair behind (long)
  const hair = hairSvg(spec.hair, hairC, b, spec.race);
  const helmed = !!gear.head;
  // ears
  let ears = '';
  if (race.ears === 'long') ears = `<path d="M${cx - headR + 2} ${headY - 2} L${cx - headR - 16} ${headY - 16} L${cx - headR + 1} ${headY + 4}Z" fill="${skin}" stroke="${dark(skin)}"/><path d="M${cx + headR - 2} ${headY - 2} L${cx + headR + 16} ${headY - 16} L${cx + headR - 1} ${headY + 4}Z" fill="${skin}" stroke="${dark(skin)}"/>`;
  else if (race.ears === 'pointy') ears = `<path d="M${cx - headR + 2} ${headY - 1} L${cx - headR - 9} ${headY - 7} L${cx - headR + 1} ${headY + 5}Z" fill="${skin}" stroke="${dark(skin)}"/><path d="M${cx + headR - 2} ${headY - 1} L${cx + headR + 9} ${headY - 7} L${cx + headR - 1} ${headY + 5}Z" fill="${skin}" stroke="${dark(skin)}"/>`;
  else if (race.ears === 'round') ears = `<circle cx="${cx - headR}" cy="${headY + 1}" r="3.5" fill="${skin}" stroke="${dark(skin)}"/><circle cx="${cx + headR}" cy="${headY + 1}" r="3.5" fill="${skin}" stroke="${dark(skin)}"/>`;
  parts.push(ears);
  if (spec.race === 'tauren') {
    parts.push(`<path d="M${cx - headR + 2} ${headY - 8} Q${cx - headR - 18} ${headY - 10} ${cx - headR - 16} ${headY - 26}" stroke="#e8e0c8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${cx + headR - 2} ${headY - 8} Q${cx + headR + 18} ${headY - 10} ${cx + headR + 16} ${headY - 26}" stroke="#e8e0c8" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  }
  // head
  if (spec.race === 'tauren') parts.push(`<ellipse cx="${cx}" cy="${headY}" rx="${headR}" ry="${headR + 1}" fill="url(#${id}sk)" stroke="${dark(skin)}"/><ellipse cx="${cx}" cy="${headY + 9}" rx="10" ry="7" fill="${shade(skin, 0.15)}" stroke="${dark(skin)}"/><circle cx="${cx - 4}" cy="${headY + 9}" r="1.6" fill="#222"/><circle cx="${cx + 4}" cy="${headY + 9}" r="1.6" fill="#222"/><circle cx="${cx}" cy="${headY + 13}" r="2.4" fill="none" stroke="#d4af37" stroke-width="1.2"/>`);
  else parts.push(`<ellipse cx="${cx}" cy="${headY}" rx="${headR}" ry="${headR + (spec.race === 'troll' ? 3 : 1)}" fill="url(#${id}sk)" stroke="${dark(skin)}"/>`);
  // face
  const eyeC = spec.race === 'nightelf' || spec.race === 'undead' ? '#e8f8ff' : spec.race === 'troll' ? '#ffd27a' : '#2a1a10';
  const eyeGlow = spec.race === 'nightelf' ? `filter="url(#${id}glow)"` : '';
  parts.push(`<ellipse cx="${cx - 5}" cy="${headY - 2}" rx="2.2" ry="${spec.race === 'nightelf' ? 1.4 : 2}" fill="${eyeC}" ${eyeGlow}/><ellipse cx="${cx + 5}" cy="${headY - 2}" rx="2.2" ry="${spec.race === 'nightelf' ? 1.4 : 2}" fill="${eyeC}" ${eyeGlow}/>`);
  parts.push(`<path d="M${cx - 6} ${headY - 6} l4 -1 M${cx + 6} ${headY - 6} l-4 -1" stroke="${shade(hairC, -0.1)}" stroke-width="1.4"/>`);
  if (spec.race !== 'tauren') parts.push(`<path d="M${cx - 4} ${headY + 7} Q${cx} ${headY + 9} ${cx + 4} ${headY + 7}" stroke="${dark(skin)}" stroke-width="1.2" fill="none"/>`);
  if (spec.face % 4 === 1) parts.push(`<path d="M${cx + 3} ${headY - 7} l5 9" stroke="#8a2a2a" stroke-width="1.2"/>`);
  if (spec.face % 4 === 2) parts.push(`<path d="M${cx - 9} ${headY + 1} h5 M${cx + 4} ${headY + 1} h5" stroke="#c0392b" stroke-width="1.6"/>`);
  if (spec.face % 4 === 3) parts.push(`<path d="M${cx - 2} ${headY - 12} l2 4 l2 -4" stroke="#4fc3f7" stroke-width="1.2" fill="none"/>`);
  if (race.extra === 'tusks' || race.extra === 'tusksBig') {
    const L = race.extra === 'tusksBig' ? 9 : 5;
    parts.push(`<path d="M${cx - 5} ${headY + 8} q-2 -${L} 1 -${L + 2}" stroke="#f0ead8" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${cx + 5} ${headY + 8} q2 -${L} -1 -${L + 2}" stroke="#f0ead8" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  }
  if (race.extra === 'jaw') parts.push(`<path d="M${cx - 6} ${headY + 7} h12 v4 h-12Z" fill="#e8e0c8" stroke="#6a6a5a" stroke-width=".6"/><path d="M${cx - 4} ${headY + 7} v4 M${cx} ${headY + 7} v4 M${cx + 4} ${headY + 7} v4" stroke="#6a6a5a" stroke-width=".6"/>`);
  if (race.extra === 'beard') parts.push(`<path d="M${cx - headR + 1} ${headY + 2} Q${cx - headR} ${headY + 26} ${cx} ${headY + 30} Q${cx + headR} ${headY + 26} ${cx + headR - 1} ${headY + 2} Q${cx} ${headY + 12} ${cx - headR + 1} ${headY + 2}Z" fill="${hairC}" stroke="${shade(hairC, -0.2)}"/><path d="M${cx - 5} ${headY + 7} Q${cx} ${headY + 9} ${cx + 5} ${headY + 7}" stroke="${shade(hairC, -0.3)}" stroke-width="1.5" fill="none"/>`);
  if (!helmed) parts.push(hair);
  else parts.push(helmSvg(gear.head!, b, ''));
  // weapons
  if (gear.mainhand?.wpn) {
    const w = gear.mainhand;
    const two = ['staff', 'polearm', 'sword2h', 'axe2h', 'mace2h'].includes(w.wpn!);
    const wsv = weaponSvg(w.wpn!, w.look.c1, w.look.c2 ?? '#d4af37', rhx + (w.wpn === 'bow' ? -2 : 0), hyy + (two ? 6 : 2));
    parts.push(QGLOW[w.q] && (w.q === 'epic' || w.q === 'legendary') ? `<g filter="url(#${id}glow)">${wsv}</g>` : wsv);
  }
  if (gear.offhand?.off) {
    const o = gear.offhand;
    parts.push(offhandSvg(o.off!, o.look.c1, o.look.c2 ?? '#d4af37', lhx - (o.off === 'shield' ? 4 : 0), hyy + (o.off === 'shield' ? -4 : 0)));
  }
  // legendary aura
  const best = spec.gear.some(g => g.q === 'legendary') ? 'legendary' : spec.gear.filter(g => g.q === 'epic').length >= 3 ? 'epic' : '';
  if (best) parts.push(`<ellipse cx="${cx}" cy="${fy}" rx="34" ry="6" fill="none" stroke="${QGLOW[best]}" stroke-width="2" opacity=".8" class="aura-pulse"/>`);
  // pet
  if (opts.pet) parts.push(`<text x="${cx + 42}" y="${fy - 2}" font-size="22" text-anchor="middle">${opts.pet}</text>`);
  const sc = `translate(${cx},${fy}) scale(${race.body.w * (gnome ? 1 : 1)},${race.body.h * (gnome ? 1 : 1)}) translate(${-cx},${-fy})`;
  const flip = spec.flip ? `translate(120,0) scale(-1,1)` : '';
  return `<svg viewBox="-20 -30 160 214" width="${opts.w ?? 120}" height="${opts.h ?? 180}" xmlns="http://www.w3.org/2000/svg"><g transform="${flip}"><g transform="${sc}">${parts.join('')}</g></g></svg>`;
}

export function itemsToDoll(items: Item[]): DollGear[] {
  return items.map(i => ({ slot: i.slot, armor: i.armor, wpn: i.wpn, off: i.off, q: i.q, look: i.look, set: i.set }));
}
