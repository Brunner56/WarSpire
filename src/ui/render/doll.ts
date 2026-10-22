// Warcraft III-inspired hero renderer: heroic 3/4 stance, chunky proportions, oversized
// pauldrons and weapons, bold outlines and painted shading. Every equipped item is drawn.
import type { Item, RaceId, Slot, WeaponType, OffType } from '../../engine/types';
import { RACE_BY_ID } from '../../data/races';
import { Paint, INK, sh, ln, limb, rivet, shade, mix } from './paint';

export { shade };

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
  team?: string;
}

const QGLOW: Record<string, string> = { epic: '#c060ff', legendary: '#ff9a20', rare: '#3a9aff' };
const GOLD = '#d9a93a';
const STEEL = '#b8c2d0';
const LEATHER = '#6b4526';

// ---------------------------------------------------------------- weapons
export function weaponSvg(P: Paint, w: WeaponType, c1: string, c2: string, glow?: string): string {
  const steel = P.metal(mix(STEEL, c1, 0.25));
  const wrap = (y1: number, y2: number) => `${sh(`M-2.6 ${y1} H2.6 V${y2} H-2.6Z`, P.cyl(LEATHER), 1.2)}${[...Array(Math.floor((y2 - y1) / 3))].map((_, i) => ln(`M-2.6 ${y1 + 2 + i * 3} L2.6 ${y1 + i * 3}`, shade(LEATHER, -0.25), 0.8)).join('')}`;
  const gem = (x: number, y: number, r = 2.4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.orb(c2)}" stroke="${INK}" stroke-width=".8"/>`;
  const halo = glow ? `<ellipse cx="0" cy="-40" rx="10" ry="46" fill="${P.glowFill(glow)}" opacity=".7"/>` : '';
  switch (w) {
    case 'sword': return halo + sh('M-4 -8 L-4.5 -50 L0 -60 L4.5 -50 L4 -8Z', steel) + ln('M0 -56 L0 -12', shade(STEEL, -0.3), 1.2) + ln('M-2.6 -50 L-2.4 -12', '#fff', 0.7, 'opacity=".6"')
      + sh('M-13 -10 Q-7 -6 0 -7 Q7 -6 13 -10 L12 -5 Q0 -2 -12 -5Z', P.metal(c2)) + gem(0, -7) + wrap(-4, 8) + sh('M-3.6 8 L3.6 8 L2.6 13 L-2.6 13Z', P.metal(c2), 1.2);
    case 'sword2h': return halo + sh('M-6 -10 L-7 -72 L0 -86 L7 -72 L6 -10Z', steel, 1.8) + ln('M0 -80 L0 -14', shade(STEEL, -0.3), 1.6) + ln('M-4 -72 L-4 -14', '#fff', 0.8, 'opacity=".55"')
      + ln('M-3 -60 l3 -3 l3 3 M-3 -46 l3 -3 l3 3', c2, 1.2, `filter="${P.filterGlow(1)}"`)
      + sh('M-18 -14 L-10 -9 Q0 -6 10 -9 L18 -14 L14 -5 Q0 -1 -14 -5Z', P.metal(c2)) + gem(0, -8, 3) + wrap(-4, 14) + sh('M-4 14 L4 14 L0 21Z', P.metal(c2), 1.2);
    case 'axe': return halo + sh('M-2.6 -48 L2.6 -48 L2.4 10 L-2.4 10Z', P.cyl('#6b4a2a')) + sh('M2 -46 Q24 -50 26 -30 Q22 -22 26 -14 Q14 -18 2 -20Z', steel, 1.7)
      + ln('M6 -44 Q22 -46 24 -30 Q21 -22 24 -16', '#fff', 0.9, 'opacity=".6"') + sh('M-3.6 -50 h7.2 v6 h-7.2Z', P.metal(c2), 1.1) + rivet(0, -34);
    case 'axe2h': return halo + sh('M-3 -70 L3 -70 L2.8 14 L-2.8 14Z', P.cyl('#5a3a1a')) + sh('M2 -68 Q32 -72 34 -46 Q29 -36 34 -26 Q16 -32 2 -34Z', steel, 1.8)
      + sh('M-2 -68 Q-32 -72 -34 -46 Q-29 -36 -34 -26 Q-16 -32 -2 -34Z', steel, 1.8) + sh('M-5 -72 h10 v10 h-10Z', P.metal(c2), 1.2) + gem(0, -67, 2.6)
      + ln('M8 -64 Q28 -66 30 -48', '#fff', 1, 'opacity=".55"') + wrap(-10, 6);
    case 'mace': return halo + sh('M-2.4 -36 L2.4 -36 L2.2 10 L-2.2 10Z', P.cyl('#6b4a2a')) + sh('M-9 -52 L-6 -38 L6 -38 L9 -52 L6 -60 L-6 -60Z', P.metal(c1), 1.6)
      + [-1, 0, 1].map(i => sh(`M${i * 6} -62 l${i * 4 - 2} -6 l4 0Z`, steel, 1)).join('') + ln('M-4 -58 L-3 -40', '#fff', 0.9, 'opacity=".6"') + gem(0, -49, 2.2) + wrap(-2, 10);
    case 'mace2h': return halo + sh('M-3 -58 L3 -58 L2.8 14 L-2.8 14Z', P.cyl('#4a2e18')) + sh('M-17 -82 L17 -82 L19 -62 L-19 -62Z', P.metal(c1), 2)
      + sh('M-17 -82 L17 -82 L15 -86 L-15 -86Z', P.metal(shade(c1, 0.15)), 1.2) + sh('M-6 -80 L6 -80 L6 -64 L-6 -64Z', P.metal(c2), 1.2) + gem(0, -72, 3)
      + ln('M-14 -79 L-15 -65 M14 -79 L15 -65', '#fff', 0.9, 'opacity=".5"') + wrap(-6, 12);
    case 'dagger': return halo + sh('M-2.6 -6 Q-4 -24 1 -34 Q4 -22 3 -6Z', steel, 1.4) + ln('M0 -28 L0.4 -8', '#fff', 0.7, 'opacity=".6"')
      + sh('M-8 -7 L8 -7 L7 -4 L-7 -4Z', P.metal(c2), 1.1) + wrap(-4, 5) + `<circle cx="0" cy="6.5" r="2.2" fill="${P.metal(c2)}" stroke="${INK}" stroke-width=".8"/>`;
    case 'fist': return halo + [-5, 0, 5].map(x => sh(`M${x - 1.6} -4 Q${x - 2} -20 ${x + 2} -28 Q${x + 2.4} -18 ${x + 1.6} -4Z`, steel, 1)).join('') + sh('M-8 -6 h16 v8 h-16Z', P.metal(c1), 1.3);
    case 'staff': return `<ellipse cx="0" cy="-84" rx="16" ry="16" fill="${P.glowFill(glow ?? c1)}"/>` + sh('M-2.6 -76 Q-4 -40 -2 0 Q-3 20 -1.6 30 L1.6 30 Q3 0 2.8 -40 Q4 -60 2.6 -76Z', P.cyl('#6a4424'))
      + sh('M-2 -76 Q-12 -84 -8 -96 Q-4 -88 0 -90 Q4 -88 8 -96 Q12 -84 2 -76Z', P.metal(c2), 1.3) + `<circle cx="0" cy="-86" r="6.5" fill="${P.orb(c1)}" stroke="${INK}" stroke-width="1.2" filter="${P.filterGlow(1.5)}"/>`
      + ln('M-2 -40 q4 4 0 8 q-4 4 0 8', shade(c2, 0.1), 1.6);
    case 'polearm': return halo + sh('M-2.4 -80 L2.4 -80 L2.2 30 L-2.2 30Z', P.cyl('#5a3a1a')) + sh('M0 -112 L7 -88 L2 -80 L-2 -80 L-7 -88Z', steel, 1.5)
      + sh('M2 -86 Q26 -84 24 -60 L2 -68Z', steel, 1.5) + ln('M6 -84 Q22 -82 21 -64', '#fff', 0.9, 'opacity=".55"') + sh('M-4 -82 h8 v6 h-8Z', P.metal(c2), 1) + gem(0, -79, 2);
    case 'bow': return halo + sh('M-2 -56 Q10 -58 14 -34 Q18 -12 14 6 Q8 22 -2 30 Q8 14 9 -12 Q8 -38 -2 -50Z', P.vol(c1), 1.6)
      + ln('M-2 -54 L-2 30', '#f0e6c8', 0.8) + sh('M9 -16 h6 v10 h-6Z', P.cyl(LEATHER), 1) + gem(12, -34, 2) + gem(12, 10, 2);
    case 'gun': return halo + sh('M-3.5 -46 h7 v36 h-7Z', P.metal('#5a5a60'), 1.5) + sh('M-6 -50 h12 v6 h-12Z', P.metal(c2), 1.3) + sh('M-6 -10 L6 -10 L8 12 L-4 14Z', P.vol('#7a4a22'), 1.5) + rivet(0, -28);
  }
  return '';
}

export function offhandSvg(P: Paint, o: OffType, c1: string, c2: string, team: string): string {
  switch (o) {
    case 'shield': return sh('M-20 -26 L20 -26 Q22 0 16 12 Q8 26 0 32 Q-8 26 -16 12 Q-22 0 -20 -26Z', P.metal(STEEL), 2)
      + sh('M-16 -22 L16 -22 Q17 -2 12 9 Q6 21 0 26 Q-6 21 -12 9 Q-17 -2 -16 -22Z', P.vol(c1))
      + sh('M-3 -18 L3 -18 L3 -2 L14 -2 L14 4 L3 4 L2 20 L-2 20 L-3 4 L-14 4 L-14 -2 L-3 -2Z', P.vol(team), 1.1)
      + `<circle cx="0" cy="1" r="5" fill="${P.metal(c2)}" stroke="${INK}" stroke-width="1.2"/>` + [[-17, -23], [17, -23], [-16, 8], [16, 8], [0, 28]].map(([x, y]) => rivet(x, y)).join('')
      + ln('M-15 -20 Q-14 0 -9 12', '#fff', 1, 'opacity=".4"');
    case 'orb': return `<circle cx="0" cy="-10" r="18" fill="${P.glowFill(c1)}"/>` + `<circle cx="0" cy="-10" r="8" fill="${P.orb(c1)}" stroke="${INK}" stroke-width="1.3"/>`
      + ln('M-9 -4 Q0 4 9 -4', c2, 1.5) + `<circle cx="-3" cy="-13" r="2.2" fill="#fff" opacity=".8"/>`;
    case 'tome': return sh('M-11 -16 L9 -18 L11 8 L-9 10Z', P.vol(c1), 1.6) + sh('M-11 -16 L-8 -17 L-6 9 L-9 10Z', P.vol(shade(c1, -0.2)), 1)
      + sh('M-1 -10 l5 -1 l1 8 l-5 1Z', P.metal(c2), 1) + `<circle cx="1.5" cy="-6" r="1.8" fill="${P.orb(c2)}"/>` + ln('M-6 -14 L8 -15.5', '#fff', 0.7, 'opacity=".5"');
    case 'weapon': return weaponSvg(P, 'dagger', c1, c2);
  }
}

// ---------------------------------------------------------------- heads
interface HeadCtx { P: Paint; skin: string; hairC: string; race: RaceId; hair: number; face: number; helm?: DollGear; team: string }

function hairBack(c: HeadCtx): string {
  const { P, hairC, hair, race } = c;
  const f = P.vol(hairC);
  if (race === 'tauren') return sh('M-14 -30 Q-24 -10 -16 14 Q-8 6 -4 18 Q0 4 4 2 L4 -24Z', f);
  if (hair % 6 === 1) return sh('M-12 -26 Q-22 -6 -16 22 Q-10 14 -6 24 Q-2 12 2 18 L6 -8 Q8 -26 -2 -32Z', f);
  if (hair % 6 === 3) return sh('M-10 -22 Q-26 -20 -24 -2 Q-20 6 -16 -2 Q-18 -14 -8 -16Z', f);
  return '';
}

function hairFront(c: HeadCtx): string {
  const { P, hairC, hair, race } = c;
  const f = P.vol(hairC);
  if (race === 'tauren') return sh('M-6 -30 Q4 -38 14 -32 Q8 -30 6 -26 Q0 -30 -6 -26Z', f, 1.2);
  switch (hair % 6) {
    case 0: return sh('M-10 -18 Q-12 -34 4 -35 Q18 -35 19 -22 Q14 -28 8 -26 Q10 -30 2 -29 Q-4 -24 -6 -14Z', f);
    case 1: return sh('M-10 -16 Q-13 -35 4 -36 Q19 -35 20 -21 Q12 -30 2 -28 Q-6 -24 -8 -10Z', f);
    case 2: return sh('M-6 -30 Q-2 -48 6 -52 Q4 -44 10 -48 Q8 -40 14 -42 Q12 -34 16 -30 Q6 -36 -6 -30Z', f) + sh('M-10 -18 Q-10 -28 -4 -31 Q-6 -24 -8 -14Z', f, 1);
    case 3: return sh('M-10 -18 Q-12 -34 4 -35 Q18 -35 19 -22 Q10 -30 0 -27 Q-6 -22 -7 -12Z', f) + `<circle cx="-6" cy="-36" r="6" fill="${f}" stroke="${INK}" stroke-width="1.4"/>`;
    case 4: return race === 'dwarf' || race === 'orc' ? ln('M-8 -28 Q2 -34 14 -30', shade(c.skin, 0.12), 1.4, 'opacity=".6"') : sh('M-10 -14 Q-12 -22 -8 -24 Q-8 -18 -6 -12Z', f, 1);
    default: return sh('M-11 -16 L-14 -34 L-4 -30 L-2 -44 L5 -33 L12 -42 L13 -31 L22 -32 L18 -22 Q10 -28 0 -26 Q-6 -22 -8 -12Z', f);
  }
}

function headSvg(c: HeadCtx): string {
  const { P, skin, race, face } = c;
  const S = P.vol(skin);
  const dark = shade(skin, -0.32);
  const out: string[] = [];
  out.push(hairBack(c));
  // ears behind / beside
  const earL = race === 'nightelf' ? sh('M-6 -18 Q-28 -30 -38 -44 Q-24 -28 -6 -10Z', S, 1.4) + ln('M-10 -18 Q-24 -28 -32 -38', dark, 0.9)
    : race === 'troll' ? sh('M-6 -18 Q-26 -24 -34 -34 Q-22 -18 -6 -10Z', S, 1.4)
      : race === 'gnome' ? sh('M-8 -18 Q-22 -26 -26 -32 Q-18 -16 -8 -10Z', S, 1.4)
        : race === 'orc' ? sh('M-7 -18 Q-16 -24 -18 -28 Q-12 -14 -7 -10Z', S, 1.4)
          : race === 'tauren' ? sh('M-10 -22 Q-22 -22 -26 -16 Q-18 -12 -10 -14Z', S, 1.4)
            : `<ellipse cx="-8" cy="-15" rx="3.6" ry="5" fill="${S}" stroke="${INK}" stroke-width="1.3"/>`;
  out.push(earL);
  // horns (behind head)
  if (race === 'tauren') out.push(sh('M-6 -26 Q-30 -26 -34 -50 Q-26 -36 -2 -32Z', P.vol('#efe4c8'), 1.5) + sh('M12 -28 Q30 -34 26 -56 Q38 -36 16 -22Z', P.vol('#efe4c8'), 1.5));
  // skull / face shape
  const shapes: Record<RaceId, string> = {
    human: 'M-9 -18 Q-10 -33 4 -34 Q18 -34 19 -20 Q20 -9 15 -3 Q9 2 3 1 Q-5 -1 -8 -8Z',
    dwarf: 'M-10 -18 Q-11 -34 4 -35 Q19 -35 20 -20 Q21 -8 15 -2 Q9 2 2 1 Q-6 -1 -9 -8Z',
    nightelf: 'M-8 -18 Q-9 -34 4 -35 Q17 -35 18 -21 Q19 -10 13 -1 Q9 4 4 3 Q-4 0 -7 -8Z',
    gnome: 'M-11 -18 Q-13 -38 4 -39 Q22 -38 22 -20 Q22 -8 16 -2 Q9 3 1 1 Q-8 -2 -10 -8Z',
    orc: 'M-10 -18 Q-11 -32 3 -33 Q17 -33 18 -22 Q22 -12 20 -3 Q14 5 3 4 Q-8 2 -9 -8Z',
    undead: 'M-8 -18 Q-9 -33 4 -34 Q16 -34 17 -21 Q18 -11 13 -4 Q9 0 3 -1 Q-4 -2 -7 -9Z',
    tauren: 'M-12 -20 Q-12 -34 4 -35 Q16 -35 20 -26 Q30 -20 30 -10 Q30 -2 22 0 Q12 4 2 2 Q-10 0 -11 -10Z',
    troll: 'M-8 -20 Q-9 -36 4 -37 Q16 -37 17 -24 L26 -12 Q22 -8 17 -8 Q16 0 10 3 Q2 4 -4 0 Q-8 -6 -8 -12Z',
  };
  out.push(sh(shapes[race], S, 1.7));
  // cheek shadow / rim light
  out.push(ln(race === 'tauren' ? 'M-6 -6 Q4 0 18 -2' : 'M-6 -6 Q0 0 8 1', dark, 1.2, 'opacity=".55"'));
  out.push(ln('M-7 -24 Q-6 -31 2 -33', '#fff', 1.1, 'opacity=".35"'));
  // eyes
  const glowing = race === 'nightelf' || race === 'undead' || race === 'troll';
  const eyeCol = race === 'nightelf' ? '#e6fbff' : race === 'undead' ? '#ffe46a' : race === 'troll' ? '#ffd27a' : '#fff';
  const eye = (x: number, y: number, s: number) => glowing
    ? `<ellipse cx="${x}" cy="${y}" rx="${2.4 * s}" ry="${1.5 * s}" fill="${eyeCol}" filter="${P.filterGlow(1.2)}"/>`
    : `<ellipse cx="${x}" cy="${y}" rx="${2.5 * s}" ry="${2 * s}" fill="#fff" stroke="${INK}" stroke-width=".7"/><circle cx="${x + 0.6 * s}" cy="${y + 0.2}" r="${1.25 * s}" fill="${race === 'orc' ? '#c02a10' : '#3a2410'}"/><circle cx="${x + 1 * s}" cy="${y - 0.4}" r="${0.45 * s}" fill="#fff"/>`;
  const ey = race === 'gnome' ? -19 : race === 'tauren' ? -22 : -18;
  const es = race === 'gnome' ? 1.25 : race === 'orc' ? 0.85 : 1;
  out.push(eye(race === 'tauren' ? 6 : 7, ey, es) + eye(race === 'tauren' ? 15 : 14.5, ey - 0.4, es * 0.8));
  // brows
  const brow = race === 'orc' || race === 'dwarf' ? 'M2 -23 L11 -21 L18 -23' : race === 'nightelf' ? 'M2 -21 L10 -22 L20 -28' : 'M3 -22 L10 -22.5 M12 -22.5 L18 -22';
  out.push(ln(brow, race === 'orc' ? dark : shade(c.hairC, -0.15), race === 'orc' || race === 'dwarf' ? 2.6 : 1.6));
  // nose & mouth
  switch (race) {
    case 'dwarf': out.push(`<ellipse cx="18" cy="-12" rx="4.5" ry="3.8" fill="${shade(skin, 0.05)}" stroke="${INK}" stroke-width="1.2"/>`); break;
    case 'gnome': out.push(`<ellipse cx="20" cy="-12" rx="4" ry="4.5" fill="${shade(skin, 0.06)}" stroke="${INK}" stroke-width="1.2"/>`, ln('M8 -5 Q12 -3 16 -6', INK, 1)); break;
    case 'troll': out.push(ln('M18 -18 L25 -11 L18 -9', INK, 1.1), ln('M9 -3 Q13 -1 16 -4', INK, 1)); break;
    case 'tauren': out.push(sh('M18 -14 Q28 -14 30 -8 Q30 -2 22 -1 Q16 -2 16 -8Z', P.vol(shade(skin, 0.12)), 1.3) + `<ellipse cx="25" cy="-9" rx="1.6" ry="1.2" fill="${INK}"/>` + `<circle cx="27" cy="-4" r="3" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`); break;
    case 'orc': out.push(ln('M15 -16 Q19 -12 15 -10', INK, 1.2), sh('M5 -3 Q12 0 19 -4 L18 -1 Q12 3 6 0Z', shade(skin, -0.12), 1)); break;
    case 'undead': out.push(ln('M15 -15 L17 -10', INK, 1)); break;
    default: out.push(ln('M16 -17 Q20 -12 16 -10', INK, 1.1), ln('M8 -4 Q12 -2 15 -5', INK, 1.1));
  }
  // race extras
  if (race === 'orc') out.push(sh('M7 -1 Q6 -7 9 -9 Q9 -5 10 -1Z', P.vol('#f4ecd4'), 0.9) + sh('M15 -2 Q15 -8 18 -10 Q18 -5 18 -1Z', P.vol('#f4ecd4'), 0.9));
  if (race === 'troll') out.push(sh('M10 1 Q4 -6 8 -16 Q10 -8 14 -1Z', P.vol('#f4ecd4'), 1) + sh('M16 -2 Q14 -10 20 -16 Q19 -8 19 -2Z', P.vol('#f4ecd4'), 1));
  if (race === 'undead') out.push(sh('M3 -3 L16 -5 L15 2 L4 3Z', '#e8dfc4', 1) + ln('M6 -3.5 V2.6 M9 -4 V2.8 M12 -4.4 V2.5', INK, 0.6) + ln('M-2 -12 Q2 -10 4 -14', shade(skin, -0.25), 1));
  if (race === 'dwarf') out.push(sh('M-8 -10 Q-10 6 -2 18 Q2 26 8 30 Q10 22 14 26 Q14 14 20 4 Q22 -4 18 -8 Q12 -4 6 -6 Q0 -4 -8 -10Z', P.fur(c.hairC), 1.5)
    + sh('M6 -9 Q12 -7 20 -10 Q22 -6 18 -4 Q12 -5 6 -6Z', P.vol(c.hairC), 1.1) + `<rect x="4" y="18" width="5" height="4" rx="1" fill="${GOLD}" stroke="${INK}" stroke-width=".8"/>`);
  // face markings
  if (face % 4 === 1) out.push(ln('M11 -26 L15 -13', '#8a1e14', 1.4));
  if (face % 4 === 2) out.push(ln('M3 -18 h5 M3 -15 h6 M13 -15 h5', c.team, 1.6, 'opacity=".85"'));
  if (face % 4 === 3) out.push(ln('M2 -28 Q6 -24 4 -20 M8 -29 Q11 -25 9 -21', '#4fc3f7', 1.1, `opacity=".9" filter="${c.P.filterGlow(.6)}"`));
  if (!c.helm) out.push(hairFront(c));
  else out.push(helmSvg(c));
  return out.join('');
}

function helmSvg(c: HeadCtx): string {
  const g = c.helm!;
  const { P } = c;
  const c1 = g.look.c1, c2 = g.look.c2 ?? shade(c1, -0.2);
  const style = g.look.style ?? (g.armor === 'cloth' ? 'hood' : g.armor === 'leather' ? 'cap' : g.armor === 'mail' ? 'coif' : 'plate');
  const big = g.q === 'epic' || g.q === 'legendary';
  const horns = (col: string) => sh('M-6 -30 Q-26 -34 -30 -56 Q-18 -40 -2 -36Z', P.metal(col), 1.4) + sh('M12 -32 Q30 -40 26 -60 Q38 -40 16 -28Z', P.metal(col), 1.4);
  switch (style) {
    case 'hood': return sh('M-14 -6 Q-18 -32 0 -42 Q16 -46 24 -28 Q22 -32 18 -26 Q12 -32 2 -30 Q-6 -24 -6 -8 Q-10 4 -14 -6Z', P.vol(c1), 1.7) + ln('M-8 -34 Q4 -42 18 -36', shade(c1, 0.2), 1.2) + ln('M16 -26 L22 -28', c2, 1.4);
    case 'crown': return sh('M-8 -30 L-9 -42 L-3 -35 L3 -46 L9 -35 L16 -42 L16 -29 Q4 -33 -8 -30Z', P.metal(c2 === c1 ? GOLD : GOLD), 1.4) + `<circle cx="3" cy="-37" r="2.2" fill="${P.orb(c1)}" stroke="${INK}" stroke-width=".7"/>` + hairFront({ ...c, hair: 0 });
    case 'hat': return sh('M-22 -26 Q4 -34 30 -26 Q26 -22 4 -24 Q-14 -22 -22 -26Z', P.vol(c1), 1.5) + sh('M-8 -27 Q-6 -48 6 -56 Q4 -44 16 -27Z', P.vol(c1), 1.5) + sh('M-8 -29 L16 -29 L16 -26 L-8 -26Z', c2, 1);
    case 'mask': return hairFront({ ...c, hair: 0 }) + sh('M0 -10 L20 -12 Q20 -5 15 -1 Q8 3 2 1 Q-2 -3 0 -10Z', P.vol(c1), 1.3) + ln('M-2 -10 Q-8 -8 -12 -2', c1, 2.4);
    case 'goggles': return hairFront(c) + sh('M-10 -22 L20 -23 L20 -20 L-10 -19Z', P.vol(LEATHER), 1) + `<circle cx="8" cy="-20" r="4.5" fill="${P.orb('#7fd3ff')}" stroke="${GOLD}" stroke-width="2"/><circle cx="16" cy="-20.5" r="3.6" fill="${P.orb('#7fd3ff')}" stroke="${GOLD}" stroke-width="1.8"/>`;
    case 'skull': return horns('#e8dfc4') + sh('M-12 -14 Q-14 -40 4 -42 Q22 -42 22 -18 L16 -14 Q14 -22 8 -22 Q4 -18 -2 -22 Q-6 -16 -12 -14Z', P.vol('#e8dfc4'), 1.6) + `<circle cx="6" cy="-28" r="3" fill="${INK}"/><circle cx="15" cy="-28" r="2.6" fill="${INK}"/><circle cx="6" cy="-28" r="1.2" fill="#7fffd0" filter="${P.filterGlow(1)}"/>`;
    case 'cap': return sh('M-11 -20 Q-12 -38 4 -39 Q20 -38 21 -22 L18 -20 Q10 -28 0 -26 Q-6 -24 -9 -16Z', P.vol(c1), 1.6) + ln('M-8 -24 Q4 -32 18 -24', shade(c1, -0.25), 1, 'stroke-dasharray="2 2"');
    case 'coif': return sh('M-13 2 L-14 -22 Q-14 -40 4 -40 Q21 -40 22 -24 L22 -16 L18 -16 Q16 -30 4 -30 Q-6 -28 -7 -14 L-6 4Z', P.mail(c1), 1.6) + sh('M-10 -32 Q4 -42 20 -30 L20 -27 Q4 -36 -10 -28Z', P.metal(c2), 1.1);
    case 'horned': case 'spiked': case 'plate': case 'winged': default: {
      const hornSvg = style === 'horned' || style === 'spiked' || big ? horns(style === 'spiked' ? c2 : '#e8dfc4') : '';
      const wings = style === 'winged' ? sh('M-10 -28 L-30 -40 L-22 -30 L-34 -30 L-12 -22Z', P.metal(c2), 1.2) + sh('M18 -30 L32 -44 L28 -32 L38 -32 L20 -24Z', P.metal(c2), 1.2) : '';
      return hornSvg + wings + sh('M-14 2 L-15 -22 Q-14 -42 4 -43 Q22 -42 23 -24 L23 -6 L18 -2 L18 -14 L6 -14 L4 -4 L-6 4Z', P.metal(c1), 1.8)
        + sh('M6 -20 L22 -20 L22 -16 L6 -16Z', INK, 0.5) + ln('M4 -42 L4 -14', shade(c1, 0.3), 1.6) + sh('M-14 -24 Q4 -32 23 -24 L23 -21 Q4 -28 -14 -20Z', P.metal(c2), 1.1)
        + rivet(-8, -16) + rivet(-2, -24) + (big ? sh('M2 -43 L4 -54 L6 -43Z', P.metal(c2), 1) : '');
    }
  }
}

// ---------------------------------------------------------------- body
export function dollSvg(spec: DollSpec, opts: { w?: number; h?: number; pet?: string } = {}): string {
  const P = new Paint();
  const race = RACE_BY_ID[spec.race];
  const skin = spec.skinOverride ?? race.skins[spec.skin % race.skins.length];
  const hairC = race.hairColors[spec.hairColor % race.hairColors.length];
  const team = spec.team ?? '#b8892a';
  const G: Partial<Record<Slot, DollGear>> = {};
  for (const g of spec.gear) G[g.slot] = g;
  const S = P.vol(skin);
  const out: string[] = [];

  const chest = G.chest, legs = G.legs, feet = G.feet, hands = G.hands, sh_ = G.shoulder;
  const shirt = chest?.look.c1 ?? '#7a6a52';
  const accent = chest?.look.c2 ?? shade(shirt, -0.2);
  const robe = chest?.armor === 'cloth';
  const best = spec.gear.some(g => g.q === 'legendary') ? 'legendary' : spec.gear.filter(g => g.q === 'epic').length >= 3 ? 'epic' : '';
  const fillFor = (g: DollGear | undefined, base: string) => {
    if (!g) return P.vol(base);
    if (g.armor === 'plate') return P.metal(g.look.c1);
    if (g.armor === 'mail') return P.mail(g.look.c1);
    return P.vol(g.look.c1);
  };

  // ground shadow & aura
  out.push(`<ellipse cx="82" cy="191" rx="40" ry="6" fill="#000" opacity=".45"/>`);
  if (best) out.push(`<ellipse cx="82" cy="190" rx="44" ry="8" fill="none" stroke="${QGLOW[best]}" stroke-width="2.4" opacity=".85" class="aura-pulse" filter="${P.filterGlow(2)}"/>`);
  if (spec.aura) out.push(`<ellipse cx="82" cy="110" rx="56" ry="92" fill="${P.glowFill(spec.aura)}" opacity=".5"/>`);

  const body: string[] = [];
  // cape
  const caped = !!chest && (chest.armor === 'plate' || chest.armor === 'mail' || chest.q === 'epic' || chest.q === 'legendary' || chest.q === 'rare');
  if (caped) {
    const capeC = chest!.q === 'epic' || chest!.q === 'legendary' ? accent : shade(team, -0.15);
    body.push(sh('M62 66 Q48 110 40 172 Q54 168 60 178 Q70 166 80 176 Q86 150 96 120 L100 66Z', P.vol(capeC), 1.8) + ln('M56 90 Q50 130 48 166 M70 100 Q66 140 66 170', shade(capeC, -0.25), 1.2));
  }
  // back arm (behind torso)
  const bSleeve = chest ? fillFor(chest, shirt) : S;
  body.push(sh(limb(62, 74, 52, 96, 9.5, 8), chest && !robe ? bSleeve : S));
  body.push(sh(limb(52, 96, 48, 114, 8, 7), hands ? fillFor(hands, hands.look.c1) : S));
  // back leg
  const legFill = legs ? fillFor(legs, legs.look.c1) : P.vol('#5a4632');
  body.push(sh(limb(72, 118, 66, 150, 11.5, 9), legFill));
  body.push(sh(limb(66, 150, 63, 172, 9, 8), legFill));
  // front leg
  body.push(sh(limb(90, 118, 97, 148, 12, 9.5), legFill));
  body.push(sh(limb(97, 148, 99, 172, 9.5, 8.5), legFill));
  if (legs?.armor === 'plate' || legs?.armor === 'mail') {
    const kc = P.metal(legs.look.c2 ?? shade(legs.look.c1, 0.15));
    body.push(sh('M58 144 Q66 138 73 145 Q68 154 60 151Z', kc, 1.3), sh('M90 142 Q98 136 106 143 Q100 153 92 150Z', kc, 1.3) + rivet(98, 145));
  }
  // boots
  const bootC = feet?.look.c1 ?? '#4a3020';
  const bootF = feet?.armor === 'plate' ? P.metal(bootC) : P.vol(bootC);
  const boot = (x: number, toe: number) => sh(`M${x - 9} 162 L${x + 8} 162 L${x + 9} 180 Q${x + toe} 182 ${x + toe + 2} 188 L${x - 11} 189 Q${x - 12} 176 ${x - 9} 162Z`, bootF, 1.7)
    + sh(`M${x - 11} 160 L${x + 10} 160 L${x + 10} 167 L${x - 11} 167Z`, P.vol(feet?.look.c2 ?? shade(bootC, 0.12)), 1.3) + ln(`M${x - 10} 186 L${x + toe + 1} 186`, shade(bootC, -0.3), 1.2);
  body.push(boot(63, 12), boot(99, 15));
  // robe skirt over legs
  if (robe) body.push(sh('M62 112 Q54 150 46 176 Q64 182 82 178 Q100 182 114 174 Q106 146 98 112Z', P.vol(shirt), 1.8)
    + ln('M80 116 L80 176', accent, 3.2) + ln('M68 122 Q62 150 58 176 M92 122 Q98 150 102 174', shade(shirt, -0.22), 1.1) + ln('M48 172 Q64 178 80 175 Q98 179 112 172', accent, 2));
  // torso
  const torsoD = 'M56 66 Q80 58 106 64 L104 92 Q100 110 96 118 L66 118 Q62 106 60 92Z';
  body.push(sh(torsoD, chest ? fillFor(chest, shirt) : P.vol('#7a6a52'), 1.9));
  if (!chest) body.push(ln('M78 66 L80 96 M76 72 l8 2 M76 80 l8 2 M77 88 l7 2', '#3a2a1a', 1.1));
  else if (chest.armor === 'plate') body.push(ln('M62 80 Q80 90 102 78', shade(shirt, -0.3), 1.6) + ln('M64 96 Q80 104 100 94 M66 108 Q80 114 98 106', shade(shirt, -0.28), 1.4)
    + sh('M72 70 Q80 66 90 70 L88 86 Q80 90 72 86Z', P.metal(accent), 1.3) + `<circle cx="81" cy="78" r="3.4" fill="${P.orb(team)}" stroke="${INK}" stroke-width=".9"/>` + rivet(62, 70) + rivet(100, 68) + ln('M60 72 Q62 88 66 100', '#fff', 1.2, 'opacity=".45"'));
  else if (chest.armor === 'mail') body.push(sh('M56 66 Q80 58 106 64 L104 74 Q80 68 57 76Z', P.vol(accent), 1.2) + ln('M64 74 L94 112 M98 76 L70 112', P.vol(LEATHER), 3.4) + rivet(81, 93, 1.8));
  else if (chest.armor === 'leather') body.push(ln('M70 66 L80 82 L92 66', accent, 2.2) + ln('M62 76 Q60 96 66 116', shade(shirt, -0.25), 1, 'stroke-dasharray="2.5 2"') + ln('M100 74 Q102 96 96 116', shade(shirt, -0.25), 1, 'stroke-dasharray="2.5 2"') + ln('M60 70 L102 112', P.vol(LEATHER), 3.6));
  else if (robe) body.push(ln('M72 66 L81 84 L90 66', accent, 3) + ln('M64 100 Q80 92 98 100', accent, 2.4) + `<circle cx="81" cy="86" r="2.6" fill="${P.orb(team)}" stroke="${INK}" stroke-width=".8"/>`);
  // belt & buckle & tabard
  body.push(sh('M64 110 Q80 116 98 110 L97 120 Q80 125 65 120Z', P.vol(LEATHER), 1.5) + sh('M76 111 h10 v10 h-10Z', P.metal(GOLD), 1.3) + `<rect x="79" y="114" width="4" height="4" fill="${INK}"/>`);
  if (!robe && chest) body.push(sh('M72 121 L90 121 L91 152 L81 158 L71 152Z', P.vol(team), 1.6) + ln('M75 124 L75 150 M87 124 L87 150', shade(team, 0.2), 1) + sh('M81 128 l4 6 l-4 6 l-4 -6Z', P.metal(GOLD), 1));
  // neck
  body.push(sh('M76 56 L88 56 L89 68 L75 68Z', S, 1.4));
  // back pauldron
  const pauldron = (cx: number, cy: number, s: number, front: boolean) => {
    if (!sh_) return front ? '' : '';
    const c1 = sh_.look.c1, c2 = sh_.look.c2 ?? shade(c1, 0.2);
    const r = (sh_.armor === 'plate' ? 17 : sh_.armor === 'mail' ? 15 : sh_.armor === 'leather' ? 13 : 12) * s;
    const spiky = sh_.armor === 'plate' || sh_.q === 'epic' || sh_.q === 'legendary' || !!sh_.set;
    const fill = sh_.armor === 'plate' ? P.metal(c1) : sh_.armor === 'mail' ? P.mail(c1) : P.vol(c1);
    let o = '';
    if (spiky) o += [-0.6, 0, 0.6].map(a => sh(`M${cx + Math.sin(a) * r * 0.5} ${cy - r * 0.4} L${cx + Math.sin(a) * r * 1.25} ${cy - r * 1.35 - (a === 0 ? 4 : 0)} L${cx + Math.sin(a) * r * 0.5 + 5} ${cy - r * 0.3}Z`, P.metal(c2), 1.2)).join('');
    if (sh_.armor === 'cloth') return o + sh(`M${cx - r} ${cy + 2} Q${cx} ${cy - r * 1.2} ${cx + r} ${cy + 2} L${cx + r * 0.8} ${cy + r * 0.8} Q${cx} ${cy + r * 0.4} ${cx - r * 0.8} ${cy + r * 0.8}Z`, fill, 1.6) + `<circle cx="${cx}" cy="${cy - 2}" r="${2.8 * s}" fill="${P.orb(c2)}" stroke="${INK}" stroke-width=".8"/>`;
    o += sh(`M${cx - r} ${cy + r * 0.35} Q${cx - r * 1.05} ${cy - r * 0.9} ${cx} ${cy - r} Q${cx + r * 1.05} ${cy - r * 0.9} ${cx + r} ${cy + r * 0.35} Q${cx} ${cy + r * 0.1} ${cx - r} ${cy + r * 0.35}Z`, fill, 1.9);
    if (sh_.armor === 'plate') o += sh(`M${cx - r * 0.95} ${cy + r * 0.3} Q${cx} ${cy + r * 0.05} ${cx + r * 0.95} ${cy + r * 0.3} L${cx + r * 0.85} ${cy + r * 0.62} Q${cx} ${cy + r * 0.38} ${cx - r * 0.85} ${cy + r * 0.62}Z`, P.metal(shade(c1, -0.08)), 1.4)
      + ln(`M${cx - r * 0.6} ${cy - r * 0.55} Q${cx} ${cy - r * 0.85} ${cx + r * 0.5} ${cy - r * 0.6}`, '#fff', 1.4, 'opacity=".55"') + sh(`M${cx - r * 0.9} ${cy - r * 0.1} Q${cx} ${cy - r * 0.42} ${cx + r * 0.9} ${cy - r * 0.1}`, 'none', 0) + ln(`M${cx - r * 0.95} ${cy + r * 0.05} Q${cx} ${cy - r * 0.3} ${cx + r * 0.95} ${cy + r * 0.05}`, c2, 2.2) + rivet(cx - r * 0.6, cy - r * 0.1) + rivet(cx + r * 0.6, cy - r * 0.1);
    else if (sh_.armor === 'leather') o += ln(`M${cx - r} ${cy + r * 0.3} Q${cx} ${cy + r * 0.05} ${cx + r} ${cy + r * 0.3}`, P.fur('#c8b89a'), 4);
    else o += ln(`M${cx - r * 0.9} ${cy + r * 0.25} Q${cx} ${cy} ${cx + r * 0.9} ${cy + r * 0.25}`, c2, 2.2);
    return o;
  };
  body.push(pauldron(60, 70, 0.85, false));
  if (!sh_) body.push(sh('M56 66 Q60 62 66 64 L64 74 L57 74Z', S, 1.2));
  out.push(`<g transform="translate(80 190) scale(${race.body.w} ${race.body.h}) translate(-80 -190)">${body.join('')}`);

  // head (own scale so gnomes/tauren keep chunky heads)
  const hs = spec.race === 'gnome' ? 1.32 : spec.race === 'tauren' ? 1.15 : spec.race === 'dwarf' ? 1.12 : 1.05;
  const head = headSvg({ P, skin, hairC, race: spec.race, hair: spec.hair, face: spec.face, helm: G.head, team });
  out.push(`<g transform="translate(83 ${spec.race === 'tauren' ? 60 : 58}) scale(${hs / race.body.w} ${hs / race.body.h})">${head}</g>`);

  // front arm, weapon, front pauldron, offhand
  const front: string[] = [];
  const fSleeve = chest && !robe ? fillFor(chest, shirt) : chest && robe ? P.vol(shirt) : S;
  front.push(sh(limb(102, 72, 114, 94, 10.5, 8.5), fSleeve));
  if (!chest || robe) front.push(ln('M106 80 Q110 86 112 90', shade(skin, -0.3), 1, 'opacity=".5"'));
  front.push(sh(limb(114, 94, 120, 108, 8.5, 7.5), hands ? fillFor(hands, hands.look.c1) : S));
  if (hands) front.push(sh('M108 96 Q116 90 122 96 L121 102 Q115 98 109 102Z', P.vol(hands.look.c2 ?? shade(hands.look.c1, 0.15)), 1.3));
  // weapon (behind the fist)
  const mh = G.mainhand;
  if (mh?.wpn) {
    const two = ['staff', 'polearm', 'sword2h', 'axe2h', 'mace2h'].includes(mh.wpn);
    const ang = mh.wpn === 'bow' ? 0 : mh.wpn === 'staff' ? 6 : two ? 12 : 28;
    const glow = mh.q === 'legendary' || mh.q === 'epic' ? QGLOW[mh.q] : undefined;
    front.push(`<g transform="translate(121 111) rotate(${ang}) scale(${two ? 1.05 : 1.15})">${weaponSvg(P, mh.wpn, mh.look.c1, mh.look.c2 ?? GOLD, glow)}</g>`);
  }
  front.push(`<circle cx="121" cy="111" r="8" fill="${hands ? fillFor(hands, hands.look.c1) : S}" stroke="${INK}" stroke-width="1.7"/>` + ln('M117 109 q4 -2 8 1', INK, 0.8));
  front.push(pauldron(104, 68, 1.1, true));
  if (!sh_) front.push(sh('M98 64 Q106 60 112 66 L110 76 L100 76Z', S, 1.3));
  const oh = G.offhand;
  if (oh?.off) front.push(`<g transform="translate(${oh.off === 'shield' ? 52 : 47} ${oh.off === 'shield' ? 112 : 116})">${offhandSvg(P, oh.off, oh.look.c1, oh.look.c2 ?? GOLD, team)}</g>`);
  front.push(`<circle cx="48" cy="115" r="7.2" fill="${hands ? fillFor(hands, hands.look.c1) : S}" stroke="${INK}" stroke-width="1.5"/>`);
  out.push(front.join('') + '</g>');

  if (opts.pet) out.push(`<text x="132" y="188" font-size="26" text-anchor="middle">${opts.pet}</text>`);
  const flip = spec.flip ? `translate(160,0) scale(-1,1)` : '';
  return `<svg viewBox="-6 -20 176 216" width="${opts.w ?? 120}" height="${opts.h ?? 180}" xmlns="http://www.w3.org/2000/svg">${P.defsSvg()}<g transform="${flip}">${out.join('')}</g></svg>`;
}

export function itemsToDoll(items: Item[]): DollGear[] {
  return items.map(i => ({ slot: i.slot, armor: i.armor, wpn: i.wpn, off: i.off, q: i.q, look: i.look, set: i.set }));
}
