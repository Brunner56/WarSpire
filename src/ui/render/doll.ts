// Hero renderer in a Reforged-concept-inspired style: heavily muscled anatomy drawn as
// hand-authored shapes, oversized forearms, fists and boots, small heads on massive traps,
// cel shading with heavy ink and interior muscle lines. Every equipped item is drawn.
import type { Item, RaceId, Slot, WeaponType, OffType } from '../../engine/types';
import { RACE_BY_ID } from '../../data/races';
import { Paint, INK, sh, ln, rivet, shade, mix, mirror, hatch, SVG_ANIM } from './paint';

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
const STEEL = '#9aa4b2';
const LEATHER = '#5e3b20';
const BONE = '#efe4c8';
const SW = 2.3; // silhouette ink weight
const inner = (d: string, w = 1.1, op = 0.75) => ln(d, INK, w, `opacity="${op}"`);
/** A shape and its mirror on the other side of the body. */
const pair = (d: string, fill: string, w = SW) => sh(d, fill, w) + sh(mirror(d), fill, w);
const pairLn = (d: string, w = 1.1, op = 0.75) => inner(d, w, op) + inner(mirror(d), w, op);

// ------------------------------------------------------------------ anatomy (viewer-left side; mirrored)
const A = {
  thigh: 'M82 160 Q66 166 63 188 Q62 204 69 213 L89 213 Q96 198 98 178 Q98 165 93 160 Z',
  calf: 'M67 208 Q58 220 62 236 L89 236 Q94 222 89 208 Z',
  boot: 'M62 224 L93 224 Q97 236 95 246 Q94 254 86 255 L48 255 Q38 253 42 244 Q48 236 60 236 Z',
  bootCuff: 'M58 218 Q76 214 96 218 L97 230 Q76 226 57 230 Z',
  delt: 'M72 80 Q52 76 44 94 Q41 110 52 116 Q66 114 72 100 Z',
  upper: 'M51 104 Q40 112 38 128 Q37 142 44 148 L61 144 Q66 128 65 112 Z',
  fore: 'M43 140 Q29 150 27 168 Q26 182 33 189 L59 187 Q64 168 61 150 Q59 141 52 139 Z',
  fist: 'M29 184 Q22 190 25 201 Q30 211 43 211 Q57 211 59 198 Q59 187 53 183 Z',
  trap: 'M88 66 Q74 72 64 86 L82 88 Z',
};
const TORSO = 'M70 82 Q100 74 130 82 Q142 96 137 117 Q131 141 125 153 L75 153 Q69 141 63 117 Q58 96 70 82 Z';
const PELVIS = 'M75 150 L125 150 L129 172 Q100 179 71 172 Z';
const NECK = 'M89 58 L111 58 L113 78 L87 78 Z';

// ------------------------------------------------------------------ weapons (grip at 0,0; blade toward -y)
export function weaponSvg(P: Paint, w: WeaponType, c1: string, c2: string, glow?: string): string {
  const steel = P.metal(mix(STEEL, c1, 0.25));
  const wrap = (y1: number, y2: number) => sh(`M-3 ${y1} H3 V${y2} H-3Z`, P.cyl(LEATHER), 1.4) + [...Array(Math.max(1, Math.floor((y2 - y1) / 3.2)))].map((_, i) => inner(`M-3 ${y1 + 2.6 + i * 3.2} L3 ${y1 + i * 3.2}`, 0.9, 0.7)).join('');
  const gem = (x: number, y: number, r = 2.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.orb(c2)}" stroke="${INK}" stroke-width=".9"/>`;
  const halo = glow ? `<ellipse cx="0" cy="-44" rx="12" ry="50" fill="${P.glowFill(glow)}" opacity=".75"/>` : '';
  const notch = (pts: string) => inner(pts, 1, 0.6);
  switch (w) {
    case 'sword': return halo + sh('M-4.5 -8 L-5 -52 L0 -63 L5 -52 L4.5 -8Z', steel, 2) + inner('M0 -58 L0 -12', 1.2) + notch('M-5 -30 l2 2 l-2 2')
      + sh('M-14 -11 Q-7 -5 0 -7 Q7 -5 14 -11 L13 -4 Q0 -1 -13 -4Z', P.metal(c2), 1.6) + gem(0, -7) + wrap(-4, 8) + sh('M-4 8 L4 8 L3 14 L-3 14Z', P.metal(c2), 1.4);
    case 'sword2h': return halo + sh('M-7 -10 L-8 -76 L0 -90 L8 -76 L7 -10Z', steel, 2.2) + inner('M0 -84 L0 -14', 1.6) + notch('M8 -50 l-3 3 l3 3 M-8 -36 l3 2 l-3 2')
      + ln('M-3 -62 l3 -3 l3 3 M-3 -48 l3 -3 l3 3', c2, 1.4, `filter="${P.filterGlow(1)}"`)
      + sh('M-20 -15 L-11 -9 Q0 -6 11 -9 L20 -15 L15 -4 Q0 0 -15 -4Z', P.metal(c2), 1.8) + gem(0, -8, 3.2) + wrap(-4, 15) + sh('M-5 15 L5 15 L0 23Z', P.metal(c2), 1.4);
    case 'axe': return halo + sh('M-3 -50 L3 -50 L2.8 12 L-2.8 12Z', P.cyl('#6b4a2a'), 1.8) + sh('M2 -48 Q28 -54 30 -30 Q24 -22 30 -12 Q14 -18 2 -20Z', steel, 2.1)
      + notch('M26 -40 l-3 2 l3 3 M28 -22 l-3 2') + ln('M7 -46 Q24 -48 26 -32', '#fff', 1.1, 'opacity=".55"') + sh('M-4 -52 h8 v7 h-8Z', P.metal(c2), 1.3) + ln('M-3 -10 L3 -4 M-3 -4 L3 2', '#7a1a10', 2.2);
    case 'axe2h': return halo + sh('M-3.4 -74 L3.4 -74 L3.2 16 L-3.2 16Z', P.cyl('#5a3a1a'), 1.9) + sh('M2 -72 Q36 -78 38 -48 Q32 -36 38 -24 Q18 -32 2 -34Z', steel, 2.2)
      + sh('M-2 -72 Q-36 -78 -38 -48 Q-32 -36 -38 -24 Q-18 -32 -2 -34Z', steel, 2.2) + sh('M-6 -77 h12 v12 h-12Z', P.metal(c2), 1.4) + gem(0, -71, 2.8)
      + ln('M10 -66 Q30 -66 32 -50', c2, 2.6, `opacity=".9"`) + ln('M-10 -66 Q-30 -66 -32 -50', c2, 2.6) + notch('M36 -40 l-3 2 l3 3 M-36 -44 l3 2 l-3 3') + wrap(-10, 6)
      + sh('M-4 16 L4 16 L0 24Z', P.metal(STEEL), 1.3);
    case 'mace': return halo + sh('M-2.8 -36 L2.8 -36 L2.6 10 L-2.6 10Z', P.cyl('#6b4a2a'), 1.8) + sh('M-10 -54 L-7 -38 L7 -38 L10 -54 L7 -63 L-7 -63Z', P.metal(c1), 2)
      + [-1, 0, 1].map(i => sh(`M${i * 7 - 2} -63 l${i * 4} -8 l4 1Z`, steel, 1.2)).join('') + gem(0, -51, 2.4) + wrap(-2, 10);
    case 'mace2h': return halo + sh('M-3.4 -60 L3.4 -60 L3.2 16 L-3.2 16Z', P.cyl('#4a2e18'), 1.9) + sh('M-20 -86 L20 -86 L22 -62 L-22 -62Z', P.metal(c1), 2.4)
      + sh('M-20 -86 L20 -86 L17 -91 L-17 -91Z', P.metal(shade(c1, 0.15)), 1.5) + sh('M-7 -84 L7 -84 L7 -64 L-7 -64Z', P.metal(c2), 1.4) + gem(0, -74, 3.4)
      + [-16, 16].map(x => rivet(x, -74, 1.8)).join('') + wrap(-6, 12);
    case 'dagger': return halo + sh('M-3 -6 Q-4.5 -26 1 -37 Q4.5 -24 3.4 -6Z', steel, 1.7) + sh('M-9 -8 L9 -8 L8 -4 L-8 -4Z', P.metal(c2), 1.3) + wrap(-4, 6)
      + `<circle cx="0" cy="7.5" r="2.6" fill="${P.metal(c2)}" stroke="${INK}" stroke-width="1"/>`;
    case 'fist': return halo + [-6, 0, 6].map(x => sh(`M${x - 2} -4 Q${x - 2.4} -22 ${x + 2.4} -31 Q${x + 2.8} -20 ${x + 2} -4Z`, steel, 1.3)).join('') + sh('M-10 -7 h20 v10 h-20Z', P.metal(c1), 1.6);
    case 'staff': return `<ellipse cx="0" cy="-90" rx="18" ry="18" fill="${P.glowFill(glow ?? c1)}"/>` + sh('M-3 -80 Q-5 -40 -2.4 0 Q-3.4 22 -2 34 L2 34 Q3.4 0 3.2 -40 Q5 -62 3 -80Z', P.cyl('#6a4424'), 1.9)
      + inner('M-2 -50 q4 4 0 8 q-4 4 0 8 M1 -20 q-3 3 0 6', 1, 0.6)
      + sh('M-2.4 -80 Q-14 -88 -10 -102 Q-5 -92 0 -94 Q5 -92 10 -102 Q14 -88 2.4 -80Z', P.metal(c2), 1.5) + `<circle cx="0" cy="-90" r="7.5" fill="${P.orb(c1)}" stroke="${INK}" stroke-width="1.4" filter="${P.filterGlow(1.6)}"/>`;
    case 'polearm': return halo + sh('M-2.8 -84 L2.8 -84 L2.6 34 L-2.6 34Z', P.cyl('#5a3a1a'), 1.8) + sh('M0 -118 L8 -92 L2 -84 L-2 -84 L-8 -92Z', steel, 1.8)
      + sh('M2 -90 Q30 -88 28 -62 L2 -70Z', steel, 1.8) + notch('M26 -78 l-3 2 l3 3') + sh('M-5 -86 h10 v7 h-10Z', P.metal(c2), 1.2) + gem(0, -82, 2.2);
    case 'bow': return halo + sh('M-2 -60 Q12 -62 16 -36 Q20 -12 16 8 Q9 26 -2 34 Q9 16 10 -12 Q9 -40 -2 -54Z', P.vol(c1), 1.9)
      + ln('M-2 -58 L-2 34', '#f0e6c8', 0.9) + sh('M10 -18 h7 v12 h-7Z', P.cyl(LEATHER), 1.2) + gem(13, -36, 2.2) + gem(13, 12, 2.2);
    case 'gun': return halo + sh('M-4 -50 h8 v40 h-8Z', P.metal('#5a5a60'), 1.8) + sh('M-7 -55 h14 v7 h-14Z', P.metal(c2), 1.4) + sh('M-7 -10 L7 -10 L9 14 L-5 16Z', P.vol('#7a4a22'), 1.8) + rivet(0, -30);
  }
  return '';
}

export function offhandSvg(P: Paint, o: OffType, c1: string, c2: string, team: string, q: string): string {
  switch (o) {
    case 'shield': {
      if (q === 'common' || q === 'uncommon' || q === 'poor') {
        // round wooden shield with an iron rim and bolts
        return `<circle cx="0" cy="0" r="27" fill="${P.metal(STEEL)}" stroke="${INK}" stroke-width="2.4"/><circle cx="0" cy="0" r="21" fill="${P.vol('#8a5a2a')}" stroke="${INK}" stroke-width="1.4"/>`
          + inner('M-12 -17 L-12 17 M-4 -21 L-4 21 M4 -21 L4 21 M12 -17 L12 17', 1, 0.5) + inner('M-16 -8 L-8 -2 M10 8 L16 14', 1.3, 0.6)
          + `<circle cx="0" cy="0" r="6.5" fill="${P.metal(STEEL)}" stroke="${INK}" stroke-width="1.6"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => rivet(Math.cos(a * Math.PI / 180) * 24, Math.sin(a * Math.PI / 180) * 24, 1.7)).join('');
      }
      return sh('M-22 -28 L22 -28 Q24 0 18 13 Q9 28 0 34 Q-9 28 -18 13 Q-24 0 -22 -28Z', P.metal(STEEL), 2.4)
        + sh('M-17 -23 L17 -23 Q18 -2 13 10 Q6 23 0 28 Q-6 23 -13 10 Q-18 -2 -17 -23Z', P.vol(c1), 1.4)
        + sh('M-3 -19 L3 -19 L3 -3 L15 -3 L15 3 L3 3 L2 22 L-2 22 L-3 3 L-15 3 L-15 -3 L-3 -3Z', P.vol(team), 1.2)
        + `<circle cx="0" cy="0" r="6" fill="${P.metal(c2)}" stroke="${INK}" stroke-width="1.4"/>` + [[-19, -25], [19, -25], [-17, 9], [17, 9], [0, 30]].map(([x, y]) => rivet(x, y, 1.6)).join('');
    }
    case 'orb': return `<circle cx="0" cy="-8" r="20" fill="${P.glowFill(c1)}"/><circle cx="0" cy="-8" r="9" fill="${P.orb(c1)}" stroke="${INK}" stroke-width="1.5"/>` + ln('M-10 -1 Q0 7 10 -1', c2, 1.8);
    case 'tome': return sh('M-13 -18 L10 -20 L13 9 L-10 11Z', P.vol(c1), 1.9) + sh('M-13 -18 L-9 -19 L-7 10 L-10 11Z', P.vol(shade(c1, -0.2)), 1.2)
      + sh('M-1 -11 l6 -1 l1 9 l-6 1Z', P.metal(c2), 1.2) + `<circle cx="2" cy="-6.5" r="2" fill="${P.orb(c2)}"/>`;
    case 'weapon': return weaponSvg(P, 'dagger', c1, c2);
  }
}

// ------------------------------------------------------------------ heads (frontal, centred on x=100)
interface HeadCtx { P: Paint; skin: string; hairC: string; race: RaceId; hair: number; face: number; helm?: DollGear; team: string }

const HEAD: Record<RaceId, string> = {
  human: 'M86 38 Q86 21 100 20 Q114 21 114 38 Q116 54 110 64 Q105 70 100 70 Q95 70 90 64 Q84 54 86 38 Z',
  dwarf: 'M85 38 Q85 21 100 20 Q115 21 115 38 Q117 52 112 60 Q100 66 88 60 Q83 52 85 38 Z',
  nightelf: 'M87 37 Q87 19 100 18 Q113 19 113 37 Q114 54 108 64 Q104 71 100 71 Q96 71 92 64 Q86 54 87 37 Z',
  gnome: 'M82 38 Q82 16 100 15 Q118 16 118 38 Q119 56 112 64 Q106 69 100 69 Q94 69 88 64 Q81 56 82 38 Z',
  orc: 'M85 38 Q84 22 100 21 Q116 22 115 38 Q121 52 117 64 Q110 74 100 74 Q90 74 83 64 Q79 52 85 38 Z',
  undead: 'M87 38 Q87 21 100 20 Q113 21 113 38 Q114 52 109 61 Q105 66 100 66 Q95 66 91 61 Q86 52 87 38 Z',
  tauren: 'M84 32 Q84 18 100 18 Q116 18 116 32 Q121 46 116 58 Q112 76 100 78 Q88 76 84 58 Q79 46 84 32 Z',
  troll: 'M88 36 Q88 16 100 15 Q112 16 112 36 Q114 52 109 62 Q105 72 100 72 Q95 72 91 62 Q86 52 88 36 Z',
};

function earsSvg(c: HeadCtx): string {
  const S = c.P.vol(c.skin);
  switch (c.race) {
    case 'nightelf': return pair('M88 40 Q68 30 56 12 Q66 34 88 50 Z', S, 1.8) + pairLn('M84 40 Q70 32 62 20', 0.9, 0.6);
    case 'troll': return pair('M89 40 Q70 38 58 30 Q70 48 89 50 Z', S, 1.8);
    case 'gnome': return pair('M84 40 Q70 32 64 22 Q66 40 84 50 Z', S, 1.8);
    case 'orc': return pair('M86 40 Q78 34 74 28 Q76 42 86 50 Z', S, 1.6);
    case 'tauren': return pair('M85 36 Q70 34 64 42 Q72 48 85 44 Z', S, 1.8);
    default: return pair('M87 40 Q81 38 81 45 Q82 52 87 51 Z', S, 1.5);
  }
}

function hairBack(c: HeadCtx): string {
  const f = c.P.vol(c.hairC);
  if (c.race === 'tauren') return sh('M86 26 Q72 44 76 84 Q88 74 100 82 Q112 74 124 84 Q128 44 114 26 Z', f, SW);
  if (c.hair % 6 === 1) return sh('M86 30 Q74 56 78 92 Q90 82 100 88 Q110 82 122 92 Q126 56 114 30 Z', f, SW);
  return '';
}

function hairFront(c: HeadCtx): string {
  const f = c.P.vol(c.hairC);
  if (c.race === 'tauren') return sh('M90 22 Q100 14 110 22 Q106 28 100 26 Q94 28 90 22Z', f, 1.4);
  switch (c.hair % 6) {
    case 0: return sh('M85 38 Q82 18 100 17 Q118 18 115 38 Q110 26 102 28 Q96 24 90 30 Q87 34 85 38 Z', f, SW);
    case 1: return sh('M85 40 Q82 17 100 16 Q118 17 115 40 Q112 26 100 25 Q88 26 85 40 Z', f, SW);
    case 2: return sh('M94 26 Q92 6 100 -4 Q108 6 106 26 Q100 22 94 26 Z', f, SW) + inner('M98 4 L102 22', 0.9, 0.6);
    case 3: return sh('M85 38 Q82 18 100 17 Q118 18 115 38 Q108 26 100 26 Q92 26 85 38 Z', f, SW) + `<ellipse cx="100" cy="11" rx="7" ry="6" fill="${f}" stroke="${INK}" stroke-width="1.8"/>`;
    case 4: return c.race === 'orc' || c.race === 'dwarf' ? '' : inner('M90 24 Q100 20 110 24', 1.4, 0.5);
    default: return sh('M85 38 L80 18 L90 24 L92 10 L99 22 L104 8 L108 22 L116 12 L115 38 Q108 26 100 26 Q92 26 85 38 Z', f, SW);
  }
}

function headSvg(c: HeadCtx): string {
  const { P, skin, race } = c;
  const S = P.vol(skin);
  const out: string[] = [hairBack(c)];
  if (race === 'tauren') out.push(pair('M88 28 Q70 28 62 10 Q60 30 84 38 Z', P.vol(BONE), SW) + pairLn('M80 26 l-4 -4 M74 22 l-3 -4', 0.9, 0.5));
  out.push(earsSvg(c));
  out.push(sh(HEAD[race], S, SW));
  // cheekbone / jaw definition
  out.push(pairLn(race === 'orc' ? 'M88 56 Q92 62 96 66' : 'M90 54 Q93 60 96 63', 1, 0.45));
  // eyes
  const glow = race === 'nightelf' || race === 'undead' || race === 'troll' || race === 'orc';
  const eyeCol = race === 'nightelf' ? '#e6fbff' : race === 'undead' ? '#ffe46a' : race === 'orc' ? '#ffcf3a' : race === 'troll' ? '#ffd27a' : '#fff';
  const ey = race === 'gnome' ? 42 : race === 'tauren' ? 38 : 42;
  const ex = race === 'gnome' ? 8 : 7;
  const er = race === 'gnome' ? 1.35 : race === 'orc' ? 0.9 : 1;
  const eye = (x: number) => glow
    ? `<path d="M${x - 4 * er} ${ey} Q${x} ${ey - 3 * er} ${x + 4 * er} ${ey} Q${x} ${ey + 2 * er} ${x - 4 * er} ${ey}Z" fill="${eyeCol}" stroke="${INK}" stroke-width=".8" filter="${P.filterGlow(1.4)}"/>`
    : `<ellipse cx="${x}" cy="${ey}" rx="${3.4 * er}" ry="${2.4 * er}" fill="#fff" stroke="${INK}" stroke-width=".9"/><circle cx="${x}" cy="${ey + 0.2}" r="${1.5 * er}" fill="#3a2410"/><circle cx="${x + 0.5}" cy="${ey - 0.5}" r=".5" fill="#fff"/>`;
  out.push(eye(100 - ex) + eye(100 + ex));
  // brows: heavy and angry for orcs/dwarves, swept for elves
  const brow = race === 'orc' || race === 'dwarf' || race === 'tauren' ? 'M88 36 L98 39' : race === 'nightelf' ? 'M88 38 L98 38 L86 32' : 'M89 38 L98 39';
  out.push(ln(brow, race === 'orc' ? shade(skin, -0.38) : shade(c.hairC, -0.15), race === 'orc' || race === 'dwarf' ? 3 : 1.8) + ln(mirror(brow), race === 'orc' ? shade(skin, -0.38) : shade(c.hairC, -0.15), race === 'orc' || race === 'dwarf' ? 3 : 1.8));
  // nose & mouth
  switch (race) {
    case 'dwarf': out.push(`<ellipse cx="100" cy="51" rx="5" ry="4.5" fill="${S}" stroke="${INK}" stroke-width="1.5"/>`); break;
    case 'gnome': out.push(`<ellipse cx="100" cy="52" rx="5.2" ry="5" fill="${S}" stroke="${INK}" stroke-width="1.5"/>` + inner('M93 61 Q100 64 107 61', 1.2)); break;
    case 'troll': out.push(sh('M100 42 L106 58 L94 58 Z', S, 1.5) + inner('M94 65 Q100 67 106 65', 1.2)); break;
    case 'tauren': out.push(`<ellipse cx="100" cy="64" rx="14" ry="10" fill="${P.vol(shade(skin, 0.1))}" stroke="${INK}" stroke-width="${SW}"/><ellipse cx="95" cy="63" rx="2" ry="1.6" fill="${INK}"/><ellipse cx="105" cy="63" rx="2" ry="1.6" fill="${INK}"/><circle cx="100" cy="72" r="3.6" fill="none" stroke="${GOLD}" stroke-width="1.8"/>`); break;
    case 'orc': out.push(inner('M97 46 L95 54 L100 55 L105 54 L103 46', 1.2) + sh('M88 63 Q100 58 112 63 Q110 70 100 70 Q90 70 88 63Z', '#3a0a0a', 1.4)
      + [92, 96, 104, 108].map(x => sh(`M${x - 1.6} 63 L${x} 67 L${x + 1.6} 63Z`, BONE, 0.6)).join('') + pair('M90 66 Q87 56 90 50 Q93 58 94 66 Z', P.vol(BONE), 1.4)); break;
    case 'undead': out.push(inner('M98 48 L100 52 L102 48', 1) + sh('M92 58 L108 58 L107 65 L93 65 Z', BONE, 1.3) + inner('M96 58 V65 M100 58 V65 M104 58 V65', 0.7)); break;
    default: out.push(inner('M100 44 L98 53 L102 54', 1.1) + inner('M95 61 Q100 63 105 61', 1.2));
  }
  if (race === 'troll') out.push(pair('M93 66 Q84 58 86 44 Q90 56 96 64 Z', P.vol(BONE), 1.5));
  if (race === 'dwarf') out.push(sh('M84 50 Q82 74 90 88 Q96 100 100 104 Q104 100 110 88 Q118 74 116 50 Q110 58 100 57 Q90 58 84 50 Z', P.fur(c.hairC), SW)
    + sh('M90 55 Q100 51 110 55 Q112 60 106 60 Q100 57 94 60 Q88 60 90 55 Z', P.vol(c.hairC), 1.5) + `<rect x="97" y="92" width="6" height="5" rx="1" fill="${P.metal(GOLD)}" stroke="${INK}" stroke-width=".9"/>`);
  if (c.face % 4 === 1) out.push(ln('M104 32 L109 50', '#8a1e14', 1.6));
  if (c.face % 4 === 2) out.push(ln('M88 46 h6 M106 46 h6 M90 49 h5 M105 49 h5', c.team, 1.8, 'opacity=".9"'));
  if (c.face % 4 === 3) out.push(ln('M96 26 Q100 30 104 26 M100 30 V36', '#4fc3f7', 1.3, `filter="${P.filterGlow(.7)}"`));
  out.push(c.helm ? helmSvg(c) : hairFront(c));
  return out.join('');
}

function helmSvg(c: HeadCtx): string {
  const g = c.helm!;
  const { P } = c;
  const c1 = g.look.c1, c2 = g.look.c2 ?? shade(c1, -0.2);
  const style = g.look.style ?? (g.armor === 'cloth' ? 'hood' : g.armor === 'leather' ? 'cap' : g.armor === 'mail' ? 'coif' : 'plate');
  const big = g.q === 'epic' || g.q === 'legendary';
  const horns = (col: string) => pair('M88 26 Q66 22 60 2 Q58 24 84 34 Z', P.vol(col), SW) + pairLn('M78 22 l-4 -3 M70 16 l-3 -4', 0.9, 0.5);
  switch (style) {
    case 'hood': return sh('M80 66 Q76 26 100 12 Q124 26 120 66 Q114 72 112 60 Q112 32 100 28 Q88 32 88 60 Q86 72 80 66 Z', P.vol(c1), SW) + inner('M88 20 Q100 14 112 20', 1, 0.5) + ln('M88 60 Q92 64 94 60 M112 60 Q108 64 106 60', c2, 1.6);
    case 'crown': return sh('M86 30 L84 14 L92 22 L100 8 L108 22 L116 14 L114 30 Q100 26 86 30 Z', P.metal(GOLD), SW) + `<circle cx="100" cy="20" r="2.6" fill="${P.orb(c1)}" stroke="${INK}" stroke-width=".9"/>` + hairFront({ ...c, hair: 0 });
    case 'hat': return sh('M70 30 Q100 22 130 30 Q124 36 100 33 Q76 36 70 30 Z', P.vol(c1), 2) + sh('M88 31 Q90 6 104 -2 Q100 14 112 31 Z', P.vol(c1), 2) + sh('M88 27 L112 27 L112 31 L88 31 Z', c2, 1.2);
    case 'mask': return hairFront({ ...c, hair: 0 }) + sh('M86 50 L114 50 Q114 64 106 70 Q100 74 94 70 Q86 64 86 50 Z', P.vol(c1), SW) + inner('M92 56 L100 66 L108 56', 0.9, 0.5);
    case 'goggles': return hairFront(c) + sh('M84 38 L116 38 L116 42 L84 42 Z', P.vol(LEATHER), 1.2) + `<circle cx="93" cy="41" r="5.5" fill="${P.orb('#7fd3ff')}" stroke="${GOLD}" stroke-width="2.4"/><circle cx="107" cy="41" r="5.5" fill="${P.orb('#7fd3ff')}" stroke="${GOLD}" stroke-width="2.4"/>`;
    case 'skull': return horns(BONE) + sh('M84 52 Q80 16 100 14 Q120 16 116 52 L110 50 Q108 40 100 40 Q92 40 90 50 Z', P.vol(BONE), SW) + `<circle cx="93" cy="30" r="4" fill="${INK}"/><circle cx="107" cy="30" r="4" fill="${INK}"/><circle cx="93" cy="30" r="1.6" fill="#7fffd0" filter="${P.filterGlow(1)}"/><circle cx="107" cy="30" r="1.6" fill="#7fffd0" filter="${P.filterGlow(1)}"/>`;
    case 'cap': return sh('M84 38 Q82 14 100 13 Q118 14 116 38 Q110 28 100 28 Q90 28 84 38 Z', P.vol(c1), SW) + inner('M86 30 Q100 22 114 30', 1, 0.5);
    case 'coif': return sh('M82 72 L82 34 Q82 12 100 12 Q118 12 118 34 L118 72 L111 72 L111 40 Q111 30 100 30 Q89 30 89 40 L89 72 Z', P.mail(c1), SW) + sh('M84 24 Q100 12 116 24 L116 28 Q100 18 84 28 Z', P.metal(c2), 1.3);
    default: {
      // open-faced spangenhelm with nose guard (or full helm for plate), horns on epics
      const hornSvg = style === 'horned' || style === 'spiked' || big ? horns(style === 'spiked' ? c2 : BONE) : '';
      const wings = style === 'winged' ? pair('M86 26 L64 10 L72 22 L60 24 L84 32 Z', P.metal(c2), 1.6) : '';
      const full = g.armor === 'plate';
      return hornSvg + wings + sh(full ? 'M82 60 L82 32 Q82 10 100 9 Q118 10 118 32 L118 60 L112 70 L88 70 Z' : 'M83 44 L83 30 Q83 10 100 9 Q117 10 117 30 L117 44 Q110 36 100 36 Q90 36 83 44 Z', P.metal(c1), SW)
        + (full ? sh('M88 40 L112 40 L112 45 L88 45 Z', INK, .5) + inner('M96 50 V64 M100 50 V66 M104 50 V64', 1, 0.6) : sh('M98 34 L102 34 L102 52 L98 52 Z', P.metal(c1), 1.4))
        + inner('M100 10 V34', 1.6, 0.6) + sh('M83 26 Q100 18 117 26 L117 30 Q100 22 83 30 Z', P.metal(c2), 1.3)
        + rivet(88, 28, 1.4) + rivet(112, 28, 1.4) + rivet(100, 22, 1.4) + (big ? sh('M97 9 L100 -4 L103 9 Z', P.metal(c2), 1.3) : '');
    }
  }
}

// ------------------------------------------------------------------ body
export function dollSvg(spec: DollSpec, opts: { w?: number; h?: number; pet?: string } = {}): string {
  const P = new Paint();
  const race = RACE_BY_ID[spec.race];
  const skin = spec.skinOverride ?? race.skins[spec.skin % race.skins.length];
  const hairC = race.hairColors[spec.hairColor % race.hairColors.length];
  const team = spec.team ?? '#c0392b';
  const G: Partial<Record<Slot, DollGear>> = {};
  for (const g of spec.gear) G[g.slot] = g;
  const S = P.vol(skin);
  const chest = G.chest, legs = G.legs, feet = G.feet, hands = G.hands, sho = G.shoulder;
  const robe = chest?.armor === 'cloth';
  const best = spec.gear.some(g => g.q === 'legendary') ? 'legendary' : spec.gear.filter(g => g.q === 'epic').length >= 3 ? 'epic' : '';
  const fillFor = (g: DollGear | undefined, base: string) => !g ? P.vol(base) : g.armor === 'plate' ? P.metal(g.look.c1) : g.armor === 'mail' ? P.mail(g.look.c1) : P.vol(g.look.c1);
  const out: string[] = [];
  out.push(`<ellipse cx="100" cy="254" rx="62" ry="8" fill="#000" opacity=".45"/>`);
  if (best) out.push(`<ellipse cx="100" cy="253" rx="66" ry="10" fill="none" stroke="${QGLOW[best]}" stroke-width="2.6" opacity=".85" class="aura-pulse" filter="${P.filterGlow(2)}"/>`);
  if (spec.aura) out.push(`<ellipse cx="100" cy="140" rx="80" ry="120" fill="${P.glowFill(spec.aura)}" opacity=".5"/>`);
  const b: string[] = [];

  // cape behind (rare+ chest or heavy armor)
  if (chest && (chest.armor === 'plate' || chest.armor === 'mail' || ['rare', 'epic', 'legendary'].includes(chest.q))) {
    const capeC = chest.q === 'epic' || chest.q === 'legendary' ? (chest.look.c2 ?? team) : shade(team, -0.12);
    b.push(sh('M70 84 Q60 150 54 232 L66 224 L72 236 L84 226 L94 238 L100 226 L106 238 L116 226 L128 236 L134 224 L146 232 Q140 150 130 84 Z', P.vol(capeC), SW)
      + inner('M76 120 Q72 170 70 220 M124 120 Q128 170 130 220 M100 130 V222', 1, 0.45));
  }
  // legs
  const pants = legs?.look.c1 ?? '#6a4a2c';
  const legFill = legs ? fillFor(legs, pants) : P.vol(pants);
  b.push(pair(A.thigh, legFill), pair(A.calf, legFill));
  if (!legs || legs.armor === 'leather' || legs.armor === 'cloth') {
    // torn trousers showing skin, Reforged-bandit style
    b.push(pair('M70 182 L76 178 L80 186 L74 192 Z', S, 1.3) + pairLn('M68 176 l4 2 M84 196 l3 4', 0.9, 0.6) + pairLn('M72 166 Q80 190 78 210', 1, 0.45));
  } else {
    const kc = P.metal(legs.look.c2 ?? shade(legs.look.c1, 0.15));
    b.push(pair('M64 204 Q76 196 90 204 Q86 220 76 222 Q66 220 64 204 Z', kc, 1.8) + pair('M70 210 L76 202 L82 210', 'none', 0) + [72, 128].map(x => rivet(x, 210, 1.5)).join(''));
  }
  // boots
  const bootC = feet?.look.c1 ?? '#3e2a1a';
  const bootFill = feet?.armor === 'plate' ? P.metal(bootC) : P.vol(bootC);
  b.push(pair(A.boot, bootFill), pair(A.bootCuff, P.vol(feet?.look.c2 ?? shade(bootC, 0.12)), 1.8));
  b.push(pairLn('M50 248 L90 248', 1.2, 0.5) + pairLn('M64 238 Q74 234 86 238', 1, 0.5));
  if (feet?.armor === 'plate' || feet?.q === 'epic' || feet?.q === 'legendary') b.push(pair('M48 246 L38 238 L50 240 Z M58 226 L50 216 L62 222 Z', P.metal(STEEL), 1.4));
  // robe skirt
  if (robe) {
    const rc = chest!.look.c1, ra = chest!.look.c2 ?? shade(rc, -0.2);
    b.push(sh('M74 146 Q62 196 52 236 L70 232 L84 240 L100 234 L116 240 L130 232 L148 236 Q138 196 126 146 Z', P.vol(rc), SW)
      + ln('M100 150 L100 234', ra, 4) + inner('M84 160 Q78 200 74 232 M116 160 Q122 200 126 232', 1, 0.5) + ln('M56 230 L70 226 L84 234 L100 228 L116 234 L130 226 L144 230', ra, 2.4));
  }
  // traps, back of shoulders
  b.push(pair(A.trap, S));
  // torso
  const chestFill = chest ? fillFor(chest, chest.look.c1) : S;
  b.push(sh(TORSO, chestFill, SW));
  b.push(sh(PELVIS, legFill, SW));
  if (!chest) {
    b.push(inner('M74 104 Q86 115 100 107 Q114 115 126 104') + inner('M100 108 L100 148') + inner('M85 124 Q100 128 115 124 M86 138 Q100 141 114 138', 1, 0.6)
      + hatch(118, 112, 4, 7, 3, 70) + ln('M72 86 L128 146', P.vol(LEATHER), 5));
  } else if (chest.armor === 'plate') {
    const ac = chest.look.c2 ?? GOLD;
    b.push(inner('M100 82 L100 146', 1.6, 0.55) + inner('M70 108 Q100 120 130 108 M72 128 Q100 138 128 128', 1.4, 0.6)
      + sh('M86 92 Q100 86 114 92 L112 112 Q100 118 88 112 Z', P.metal(ac), 1.6) + `<circle cx="100" cy="102" r="5.5" fill="${P.vol(team)}" stroke="${INK}" stroke-width="1.4"/>`
      + [[74, 90], [126, 90], [76, 140], [124, 140]].map(([x, y]) => rivet(x, y, 1.6)).join(''));
  } else if (chest.armor === 'mail') {
    b.push(sh('M70 82 Q100 74 130 82 L130 92 Q100 84 70 92 Z', P.vol(chest.look.c2 ?? LEATHER), 1.4) + ln('M74 90 L126 148 M126 90 L74 148', P.vol(LEATHER), 4.4) + rivet(100, 119, 2.2));
  } else if (chest.armor === 'leather') {
    // laced vest with a bandana collar and ragged hem
    const ac = chest.look.c2 ?? '#6a2a2a';
    b.push(sh('M84 80 Q100 98 116 80 L112 98 Q100 110 88 98 Z', P.vol(ac), 1.8)
      + inner('M100 100 L100 146', 1.4, 0.7) + [108, 118, 128, 138].map(y => ln(`M95 ${y} L105 ${y + 4} M105 ${y} L95 ${y + 4}`, '#3a2210', 1.6)).join('')
      + sh('M75 150 L80 156 L86 150 L92 157 L100 150 L108 157 L114 150 L120 156 L125 150 L125 153 L75 153 Z', chestFill, 1.2) + hatch(120, 116, 4, 7, 3, 70));
  } else if (robe) {
    const ac = chest.look.c2 ?? GOLD;
    b.push(ln('M84 80 L100 104 L116 80', ac, 3.4) + ln('M74 132 Q100 124 126 132', ac, 3) + `<circle cx="100" cy="106" r="3.6" fill="${P.orb(team)}" stroke="${INK}" stroke-width="1"/>`);
  }
  // belt, buckle, team-color loincloth
  b.push(sh('M73 146 Q100 152 127 146 L128 160 Q100 166 72 160 Z', P.vol('#2a1a10'), SW) + sh('M91 147 h18 v15 h-18 Z', P.metal(STEEL), 1.8) + sh('M95 151 h10 v7 h-10 Z', '#2a1a10', 1));
  if (!robe) b.push(sh('M88 162 L112 162 L114 198 L106 192 L100 200 L94 192 L86 198 Z', P.vol(team), SW) + inner('M92 168 L92 192 M108 168 L108 192', 1, 0.5));
  // neck
  b.push(sh(NECK, S, 1.8));

  // arms (bare muscular arms; sleeves for cloth & mail)
  const upperFill = robe ? P.vol(chest!.look.c1) : chest?.armor === 'mail' ? P.mail(chest.look.c1) : S;
  const arm = (side: 'L' | 'R') => {
    const m = (d: string) => (side === 'L' ? d : mirror(d));
    const o: string[] = [];
    o.push(sh(m(A.upper), upperFill, SW));
    if (upperFill === S) o.push(inner(m('M46 118 Q51 130 48 142'), 1, 0.6) + hatch(side === 'L' ? 55 : 142, 122, 3, 6, 3, 80));
    if (chest?.armor === 'plate') o.push(sh(m('M48 108 Q56 104 64 110 L62 126 Q54 124 46 126 Z'), P.metal(chest.look.c1), 1.6));
    const foreFill = hands ? (hands.armor === 'plate' || hands.armor === 'mail' ? P.metal(hands.look.c1) : P.vol(hands.look.c1)) : S;
    o.push(sh(m(A.fore), foreFill, SW));
    if (!hands) o.push(inner(m('M36 156 Q44 166 42 180'), 1, 0.55) + ln(m('M30 172 Q44 168 60 172'), P.vol(LEATHER), 4));
    else if (hands.armor === 'plate' || hands.armor === 'mail') {
      // bracer with team-colored panels and bolts (Reforged style)
      o.push(sh(m('M34 150 L56 148 L58 172 L32 176 Z'), P.vol(hands.look.c2 ?? team), 1.8) + rivet(side === 'L' ? 38 : 162, 156, 1.8) + rivet(side === 'L' ? 52 : 148, 166, 1.8) + inner(m('M30 178 L60 174'), 1.4, 0.7));
    } else o.push(ln(m('M30 156 L60 150 M29 166 L61 160 M29 176 L60 170'), shade(hands.look.c1, -0.3), 2));
    o.push(sh(m(A.fist), hands ? foreFill : S, SW) + inner(m('M30 197 Q42 194 56 197'), 1.1, 0.7) + inner(m('M38 199 L38 207 M44 199 L44 208 M50 199 L50 207'), 0.9, 0.55));
    return o.join('');
  };
  b.push(arm('L'));
  // deltoids / pauldrons
  const pauldron = (side: 'L' | 'R') => {
    const m = (d: string) => (side === 'L' ? d : mirror(d));
    if (!sho) return sh(m(A.delt), S, SW) + inner(m('M52 96 Q58 104 64 102'), 1, 0.5);
    const c1 = sho.look.c1, c2 = sho.look.c2 ?? team;
    const fill = sho.armor === 'plate' ? P.metal(c1) : sho.armor === 'mail' ? P.mail(c1) : P.vol(c1);
    const spiky = sho.armor === 'plate' || sho.q === 'epic' || sho.q === 'legendary' || !!sho.set;
    let o = '';
    if (sho.armor === 'cloth') return sh(m('M74 78 Q46 72 38 96 Q44 112 58 110 Q68 104 74 96 Z'), fill, SW) + `<circle cx="${side === 'L' ? 56 : 144}" cy="92" r="3.4" fill="${P.orb(c2)}" stroke="${INK}" stroke-width="1"/>`;
    if (sho.armor === 'leather') return sh(m('M76 78 Q46 70 36 96 Q42 114 60 112 Q72 106 76 94 Z'), fill, SW) + sh(m('M38 96 Q46 116 62 112 Q50 104 46 96 Z'), P.fur('#c8b89a'), 1.6);
    if (spiky) o += sh(m('M56 76 L50 54 L64 72 Z'), P.metal(STEEL), 1.6) + sh(m('M44 84 L30 70 L48 78 Z'), P.metal(STEEL), 1.6);
    o += sh(m('M78 78 Q48 66 34 90 Q30 108 44 118 Q60 120 70 108 Q78 94 78 78 Z'), fill, SW + 0.3);
    o += sh(m('M70 84 Q50 78 42 94 Q42 106 52 108 Q64 104 70 92 Z'), P.vol(c2), 1.6);
    o += sh(m('M34 104 Q48 122 70 110 L68 118 Q48 128 32 112 Z'), P.metal(shade(c1, -0.08)), 1.6);
    o += [[46, 92], [60, 88], [54, 102]].map(([x, y]) => `<circle cx="${side === 'L' ? x : 200 - x}" cy="${y}" r="2.6" fill="${P.metal(STEEL)}" stroke="${INK}" stroke-width="1.1"/>`).join('');
    return o;
  };
  b.push(pauldron('L'));
  b.push(arm('R'));
  b.push(pauldron('R'));

  out.push(`<g transform="translate(100 254) scale(${race.body.w} ${race.body.h}) translate(-100 -254)">${b.join('')}`);
  // head with its own scale (small heads on big shoulders, except chunky gnomes/tauren)
  const hs = spec.race === 'gnome' ? 1.25 : spec.race === 'tauren' ? 1.05 : spec.race === 'dwarf' ? 1.0 : spec.race === 'orc' ? 1.0 : 0.96;
  const head = headSvg({ P, skin, hairC, race: spec.race, hair: spec.hair, face: spec.face, helm: G.head, team });
  out.push(`<g transform="translate(100 74) scale(${hs / race.body.w} ${hs / race.body.h}) translate(-100 -66)">${head}</g>`);
  // weapon in right fist, offhand on left forearm
  const mh = G.mainhand;
  const rightFist = { x: 157, y: 198 };
  if (mh?.wpn) {
    const two = ['staff', 'polearm', 'sword2h', 'axe2h', 'mace2h'].includes(mh.wpn);
    const ang = mh.wpn === 'bow' ? 6 : mh.wpn === 'staff' ? 8 : two ? 30 : 34;
    const glow = mh.q === 'legendary' || mh.q === 'epic' ? QGLOW[mh.q] : undefined;
    out.push(`<g transform="translate(${rightFist.x} ${rightFist.y}) rotate(${ang}) scale(${two ? 1.6 : 1.5})">${weaponSvg(P, mh.wpn, mh.look.c1, mh.look.c2 ?? GOLD, glow)}</g>`);
    out.push(sh(mirror(A.fist), hands ? (hands.armor === 'plate' || hands.armor === 'mail' ? P.metal(hands.look.c1) : P.vol(hands.look.c1)) : S, SW) + inner(mirror('M30 197 Q42 194 56 197'), 1.1, 0.7));
  }
  const oh = G.offhand;
  if (oh?.off) {
    const pos = oh.off === 'shield' ? 'translate(40 166) scale(1.25)' : 'translate(42 202) scale(1.25)';
    out.push(`<g transform="${pos}">${offhandSvg(P, oh.off, oh.look.c1, oh.look.c2 ?? GOLD, team, oh.q)}</g>`);
  }
  out.push('</g>');
  if (opts.pet) out.push(`<text x="182" y="250" font-size="30" text-anchor="middle">${opts.pet}</text>`);
  const flip = spec.flip ? 'translate(200,0) scale(-1,1)' : '';
  const paintF = P.painted(2.4, spec.race.length + spec.hair);
  return `<svg viewBox="-22 -40 248 302" width="${opts.w ?? 120}" height="${opts.h ?? 165}" xmlns="http://www.w3.org/2000/svg">${SVG_ANIM}${P.defsSvg()}<g transform="${flip}"><g filter="${paintF}">${out.join('')}</g></g></svg>`;
}

export function itemsToDoll(items: Item[]): DollGear[] {
  return items.map(i => ({ slot: i.slot, armor: i.armor, wpn: i.wpn, off: i.off, q: i.q, look: i.look, set: i.set }));
}
