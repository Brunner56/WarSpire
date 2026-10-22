// Warcraft III-inspired creature art. Humanoids reuse the hero renderer; beasts, dragons,
// elementals and demons are hand-built painted templates. All creatures face left (toward the hero).
import type { EnemyArt } from '../../engine/types';
import { dollSvg } from './doll';
import { Paint, INK, sh, ln, limb, rivet, shade, mix, SVG_ANIM } from './paint';

const BONE = '#efe4c8';

function wrap(P: Paint, inner: string, size = 1, vb = '0 0 160 150'): string {
  const px = Math.round(118 * size);
  const f = P.painted(2.8, inner.length % 13);
  return `<svg viewBox="${vb}" width="${px}" height="${Math.round(px * 150 / 160)}" xmlns="http://www.w3.org/2000/svg">${SVG_ANIM}${P.defsSvg()}<g filter="${f}">${inner}</g></svg>`;
}

const shadow = (rx = 46) => `<ellipse cx="82" cy="142" rx="${rx}" ry="6" fill="#000" opacity=".45"/>`;

function eye(P: Paint, x: number, y: number, r: number, col: string): string {
  return `<ellipse cx="${x}" cy="${y}" rx="${r * 1.25}" ry="${r}" fill="${col}" stroke="${INK}" stroke-width=".8" filter="${P.filterGlow(1.4)}"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.3}" rx="${r * 0.35}" ry="${r * 0.3}" fill="#fff" opacity=".9"/>`;
}
const teeth = (x1: number, y: number, x2: number, n: number, h: number, up = false) =>
  [...Array(n)].map((_, i) => { const x = x1 + ((x2 - x1) * (i + 0.5)) / n; const w = Math.abs(x2 - x1) / n / 2; return sh(`M${x - w} ${y} L${x} ${y + (up ? -h : h)} L${x + w} ${y}Z`, BONE, 0.7); }).join('');

export function enemySvg(a: EnemyArt): string {
  const P = new Paint();
  const c1 = a.c1, c2 = a.c2 ?? shade(a.c1, -0.25), c3 = a.c3;
  const size = a.size ?? 1;
  const glowEye = a.k === 'demon' ? '#9aff3a' : a.k === 'elemental' ? '#fff6c0' : a.k === 'ghost' ? '#cff6ff' : '#ffd23a';
  switch (a.k) {
    case 'humanoid':
    case 'giant':
    case 'trogg': {
      const race = a.race ?? (a.k === 'giant' ? 'tauren' : a.k === 'trogg' ? 'dwarf' : 'human');
      const gear: any[] = [
        { slot: 'chest', armor: a.k === 'giant' ? 'plate' : a.k === 'trogg' ? undefined : 'leather', q: 'rare', look: { c1, c2 } },
        { slot: 'legs', armor: 'mail', q: 'common', look: { c1: shade(c2, -0.2) } },
        { slot: 'feet', q: 'common', look: { c1: '#2a1a10' } },
      ].filter(g => g.slot !== 'chest' || a.k !== 'trogg');
      if (a.helm) gear.push({ slot: 'head', q: 'rare', armor: 'plate', look: { c1: a.helm === 'crown' ? '#d4af37' : c2, c2: c1, style: a.helm } });
      if (a.k === 'giant') gear.push({ slot: 'shoulder', armor: 'plate', q: 'epic', look: { c1: c2, c2: c1 } }, { slot: 'hands', armor: 'plate', q: 'rare', look: { c1: c2 } });
      if (a.wpn) gear.push({ slot: 'mainhand', wpn: a.wpn, q: 'common', look: { c1: c2, c2: '#c0c0c0' } });
      if (a.off) gear.push({ slot: 'offhand', off: a.off, q: 'common', look: { c1: c2, c2: c1 } });
      const skin = a.k === 'trogg' ? c1 : a.k === 'giant' ? shade(c1, 0.1) : undefined;
      const px = Math.round(124 * size * (a.k === 'giant' ? 1.15 : 1));
      return dollSvg({ race: race as any, skin: 0, hair: a.hair ?? (a.k === 'trogg' ? 4 : 0), hairColor: 0, face: a.k === 'trogg' ? 2 : 0, gear, skinOverride: skin, flip: true, team: c1 }, { w: px, h: Math.round(px * 1.23) });
    }
    case 'skeleton': {
      const gear: any[] = [{ slot: 'legs', armor: 'cloth', q: 'common', look: { c1: shade(c2, -0.15) } }];
      if (a.wpn) gear.push({ slot: 'mainhand', wpn: a.wpn, q: 'common', look: { c1: '#8a8a8a', c2 } });
      if (a.off) gear.push({ slot: 'offhand', off: a.off, q: 'common', look: { c1: c2, c2: c1 } });
      if (a.helm) gear.push({ slot: 'head', q: 'rare', armor: 'cloth', look: { c1: c2, style: a.helm } });
      gear.push({ slot: 'chest', armor: 'cloth', q: 'common', look: { c1: shade(c2, -0.1), c2: c1 } });
      gear.push({ slot: 'shoulder', armor: 'plate', q: 'rare', look: { c1: '#6a6a70', c2: BONE } });
      const px = Math.round(124 * size);
      return dollSvg({ race: 'undead', skin: 0, hair: 4, hairColor: 2, face: 0, gear, skinOverride: c1, flip: true, team: c2 }, { w: px, h: Math.round(px * 1.23) });
    }
    case 'ghost': {
      const body = P.vol(c1);
      return wrap(P, `<g class="float" opacity=".88">
        <ellipse cx="80" cy="70" rx="56" ry="64" fill="${P.glowFill(c1)}" opacity=".6"/>
        ${sh('M50 62 Q46 20 80 16 Q114 20 110 62 L114 118 Q104 106 98 124 Q90 108 82 128 Q74 108 66 124 Q58 108 48 120Z', body, 1.8)}
        ${sh('M40 70 Q26 90 22 112 Q34 98 44 96Z', body, 1.4)}${sh('M118 70 Q132 88 134 108 Q122 96 114 96Z', body, 1.4)}
        ${ln('M60 70 Q58 96 62 118 M80 70 L82 124 M100 70 Q102 96 98 118', shade(c1, 0.25), 1.2, 'opacity=".6"')}
        ${sh('M56 36 Q80 26 104 36 L102 48 Q80 40 58 48Z', P.vol(c2), 1.4)}
        ${eye(P, 70, 50, 4.2, glowEye)}${eye(P, 92, 50, 4.2, glowEye)}
        ${sh('M70 64 Q80 74 92 64 Q86 70 80 70 Q74 70 70 64Z', INK, 1)}
        ${ln('M30 104 l8 6 l-2 8 M128 102 l-6 8 l2 8', '#9aa0a8', 2.2)}
      </g>`, size);
    }
    case 'elemental': {
      // Firelord-style: molten muscular torso armoured in black rock, flame crown, lava-pool base
      const core = c1, rockC = c3 ?? shade(c2, -0.35);
      const hot = mix(core, '#fff3a0', 0.55);
      const lava = P.vol(core), rock = P.vol(rockC);
      const flame = (d: string, col: string) => sh(d, P.vol(col), 1.6, 'class="flicker"');
      const crack = (d: string) => ln(d, hot, 2.2, `filter="${P.filterGlow(1.2)}"`);
      return wrap(P, `<ellipse cx="80" cy="78" rx="70" ry="70" fill="${P.glowFill(core)}" opacity=".5"/>
        ${sh('M30 150 Q36 126 54 120 Q66 132 80 124 Q94 132 106 120 Q124 126 130 150 Z', lava, 2)}${sh('M40 150 Q50 136 62 138 Q70 146 80 140 Q90 146 98 138 Q110 136 120 150 Z', P.vol(rockC), 1.6)}
        ${crack('M48 146 Q56 140 64 144 M96 144 Q104 140 112 146')}
        ${sh('M56 126 Q46 100 52 76 L108 76 Q114 100 104 126 Q92 134 80 130 Q68 134 56 126 Z', lava, 2.4)}
        ${crack('M66 92 L72 104 L68 116 M94 90 L88 104 L94 118 M80 108 L80 126')}
        ${sh('M50 62 Q80 46 110 62 L114 80 Q98 92 80 88 Q62 92 46 80 Z', rock, 2.4)}${crack('M62 70 L70 78 M98 70 L90 78 M80 64 V78')}
        ${sh('M50 58 Q36 50 26 62 Q24 80 38 86 Q50 84 54 72 Z', rock, 2.3)}${sh('M110 58 Q124 50 134 62 Q136 80 122 86 Q110 84 106 72 Z', rock, 2.3)}
        ${sh('M34 50 L24 34 L40 46 Z M44 46 L42 30 L50 44 Z M126 50 L136 34 L120 46 Z M116 46 L118 30 L110 44 Z', rock, 1.6)}
        ${sh('M32 82 Q22 96 22 112 L42 112 Q46 98 44 84 Z', lava, 2.2)}${sh('M128 82 Q138 96 138 112 L118 112 Q114 98 116 84 Z', lava, 2.2)}
        ${sh('M18 104 L46 100 L48 118 L16 122 Z', rock, 2)}${sh('M142 104 L114 100 L112 118 L144 122 Z', rock, 2)}
        ${[[18, 120], [26, 122], [34, 121]].map(([x, y]) => sh(`M${x} ${y} l-3 10 l6 -8 Z`, P.vol(hot), 1.2)).join('')}${[[126, 121], [134, 122], [142, 120]].map(([x, y]) => sh(`M${x} ${y} l3 10 l-6 -8 Z`, P.vol(hot), 1.2)).join('')}
        ${flame('M80 -2 Q90 14 100 8 Q98 24 110 28 Q100 34 104 46 Q92 42 80 50 Q68 42 56 46 Q60 34 50 28 Q62 24 60 8 Q70 14 80 -2 Z', core)}
        ${flame('M80 14 Q86 24 92 22 Q90 32 96 36 Q88 40 80 44 Q72 40 64 36 Q70 32 68 22 Q74 24 80 14 Z', hot)}
        ${sh('M66 38 Q80 30 94 38 L96 56 Q88 66 80 66 Q72 66 64 56 Z', rock, 2.2)}
        ${eye(P, 73, 48, 3, '#fff6c0')}${eye(P, 87, 48, 3, '#fff6c0')}${ln('M68 44 L77 47 M92 44 L83 47', INK, 2)}
        ${sh('M72 57 Q80 62 88 57 L86 61 Q80 64 74 61 Z', hot, 1)}
        ${a.wpn ? `<g transform="translate(140 104) rotate(-12) scale(1.25)">${sh('M-3 -84 L3 -84 L3 12 L-3 12Z', P.cyl('#2a1a10'), 1.8)}${sh('M-20 -104 L20 -104 L22 -80 L-22 -80Z', P.metal(shade(rockC, 0.2)), 2.2)}${ln('M-16 -96 h32 M-16 -88 h32', hot, 2, `filter="${P.filterGlow(1.5)}"`)}</g>` : ''}
        ${[[24, 30], [134, 24], [40, 8], [120, 42], [146, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${hot}" class="flicker" filter="${P.filterGlow(1)}"/>`).join('')}`, size, '0 -8 160 160');
    }
    case 'ooze':
      return wrap(P, `${shadow(50)}${sh('M28 140 Q20 100 46 84 Q52 50 82 48 Q114 50 116 84 Q140 100 132 140Z', P.orb(c1, mix(c1, '#ffffff', 0.6)), 2, 'opacity=".95"')}
        ${[[60, 108, 6], [102, 118, 5], [84, 128, 4], [52, 128, 3.4], [110, 96, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(c1, 0.25)}" stroke="${shade(c1, -0.3)}" stroke-width=".8" opacity=".8"/>`).join('')}
        ${ln('M54 70 Q70 54 94 58', '#fff', 3, 'opacity=".45"')}
        ${eye(P, 70, 80, 5, '#fff')}${eye(P, 96, 80, 5, '#fff')}<circle cx="70" cy="81" r="2.2" fill="${INK}"/><circle cx="96" cy="81" r="2.2" fill="${INK}"/>
        ${sh('M66 98 Q82 110 100 98 Q84 104 66 98Z', shade(c1, -0.4), 1.2)}`, size);
    case 'golem': {
      const metal = P.metal(c1);
      return wrap(P, `${shadow(52)}
        ${sh(limb(66, 98, 62, 136, 13, 12), metal)}${sh(limb(96, 98, 100, 136, 13, 12), metal)}
        ${sh('M50 138 h26 v6 h-28Z M86 138 h28 v6 h-28Z', P.metal(shade(c1, -0.15)), 1.4)}
        ${sh('M42 44 L118 44 L124 70 L114 104 L46 104 L36 70Z', metal, 2.2)}
        ${sh('M56 52 L104 52 L108 74 L100 92 L60 92 L52 74Z', P.metal(shade(c1, -0.1)), 1.4)}
        <circle cx="80" cy="72" r="11" fill="${P.orb(c2)}" stroke="${INK}" stroke-width="1.8" filter="${P.filterGlow(2)}"/>
        ${sh('M62 18 L98 18 L102 44 L58 44Z', metal, 2)}${sh('M64 28 L96 28 L96 34 L64 34Z', INK, .5)}${ln('M66 31 H94', c2, 3, `filter="${P.filterGlow(1.4)}"`)}
        ${sh('M28 40 Q42 30 56 42 L52 60 Q38 64 26 56Z', P.metal(shade(c1, 0.1)), 1.8)}${sh('M104 42 Q118 30 132 40 L134 56 Q122 64 108 60Z', P.metal(shade(c1, 0.1)), 1.8)}
        ${sh(limb(36, 56, 26, 94, 11, 10), metal)}${sh(limb(124, 56, 134, 94, 11, 10), metal)}
        ${sh('M14 92 h24 v20 h-24Z', P.metal(shade(c1, -0.1)), 1.8)}${sh('M122 92 h24 v20 h-24Z', P.metal(shade(c1, -0.1)), 1.8)}
        ${[[48, 50], [112, 50], [46, 96], [114, 96], [62, 22], [98, 22], [20, 98], [140, 98]].map(([x, y]) => rivet(x, y, 1.6)).join('')}
        ${ln('M48 48 L60 92', '#fff', 1.4, 'opacity=".35"')}`, size);
    }
    case 'beast':
    case 'boar': {
      const hide = P.vol(c1);
      const boar = a.k === 'boar';
      return wrap(P, `${shadow()}
        ${sh('M118 78 Q146 70 156 50 Q150 74 124 92Z', hide, 1.6)}
        ${sh(limb(108, 96, 116, 132, 9, 7), P.vol(shade(c1, -0.15)))}${sh(limb(60, 96, 52, 132, 9, 7), P.vol(shade(c1, -0.15)))}
        ${sh('M44 70 Q60 52 96 56 Q124 58 126 84 Q124 104 96 108 Q66 110 50 100 Q36 90 44 70Z', hide, 2)}
        ${sh('M56 100 Q80 112 112 100 Q96 108 80 108 Q64 108 56 100Z', P.vol(c2), 1)}
        ${ln('M70 60 Q74 72 68 84 M86 58 Q90 72 84 86 M102 62 Q106 74 100 88', shade(c1, -0.3), 2.2)}
        ${sh(limb(98, 98, 104, 134, 10, 8), hide)}${sh(limb(66, 98, 62, 134, 10, 8), hide)}
        ${[52, 58, 64, 98, 104, 110].map(x => sh(`M${x} 134 l3 8 l3 -8Z`, BONE, .8)).join('')}
        ${sh('M50 66 Q40 46 22 46 Q8 48 6 60 Q8 72 22 76 Q36 80 50 80Z', hide, 2)}
        ${sh('M8 62 Q18 68 32 66 L30 76 Q16 76 8 70Z', P.vol(shade(c2, -0.1)), 1.4)}${teeth(10, 64, 30, 5, 4)}
        ${boar ? sh('M14 66 Q2 60 4 48 Q10 58 18 60Z', BONE, 1.1) : sh('M40 46 L46 30 L50 48Z M30 46 L32 32 L38 46Z', P.vol(c2), 1.2)}
        ${eye(P, 26, 54, 2.8, glowEye)}${ln('M18 50 L32 48', INK, 1.6)}`, size);
    }
    case 'hound': {
      const hide = P.vol(c1);
      const twoHead = !!c3;
      const head = (dx: number, dy: number) => `<g transform="translate(${dx} ${dy})">${sh('M52 60 Q40 40 20 42 Q4 44 2 56 Q4 68 16 72 Q32 78 50 76Z', hide, 2)}
        ${sh('M4 58 Q14 64 30 62 L28 74 Q12 72 4 66Z', P.vol(shade(c1, -0.2)), 1.3)}${teeth(6, 60, 28, 6, 4)}${teeth(8, 70, 26, 5, 3.4, true)}
        ${sh('M40 44 L50 24 L54 46Z', P.vol(c2), 1.3)}${eye(P, 26, 52, 3, '#ff7a1f')}${ln('M16 48 L34 46', INK, 1.8)}</g>`;
      return wrap(P, `${shadow()}
        ${sh('M116 80 Q148 72 154 48 Q148 76 122 96Z', hide, 1.6)}
        ${sh(limb(110, 96, 118, 134, 10, 8), P.vol(shade(c1, -0.15)))}${sh(limb(62, 96, 54, 134, 10, 8), P.vol(shade(c1, -0.15)))}
        ${sh('M44 70 Q62 46 100 54 Q128 58 126 86 Q122 106 94 108 Q64 110 50 98 Q38 88 44 70Z', hide, 2)}
        ${[56, 68, 80, 92, 104].map((x, i) => sh(`M${x} ${56 - (i % 2) * 2} L${x + 4} ${40 - (i % 2) * 4} L${x + 9} ${57}Z`, P.vol(c2), 1.1)).join('')}
        ${ln('M66 66 Q72 80 66 94 M84 64 Q90 80 84 98 M100 66 Q104 80 100 94', shade(c1, -0.3), 1.8)}
        ${sh(limb(100, 98, 106, 134, 11, 9), hide)}${sh(limb(68, 98, 62, 134, 11, 9), hide)}
        ${[54, 60, 66, 100, 106, 112].map(x => sh(`M${x} 134 l3 8 l3 -8Z`, BONE, .8)).join('')}
        ${twoHead ? head(10, -18) : ''}${head(0, 6)}`, size);
    }
    case 'dragon': {
      const sc = P.scales(c1);
      const wing = P.vol(c3 ?? shade(c2, 0.05));
      const horn = P.vol(BONE);
      return wrap(P, `${shadow(56)}
        ${sh('M98 62 Q122 6 156 4 Q146 20 154 30 Q138 32 142 46 Q126 46 128 62 Q112 60 108 74Z', wing, 1.8)}${ln('M100 62 Q124 20 154 6 M110 66 Q132 36 152 30 M118 70 Q132 52 140 46', shade(c2, -0.25), 1.4)}
        ${sh('M118 108 Q150 108 158 128 Q150 120 128 122Z', sc, 1.6)}
        ${sh(limb(112, 104, 120, 136, 11, 9), sc)}
        ${sh('M60 78 Q72 54 104 60 Q132 66 130 98 Q126 120 98 122 Q68 124 58 108 Q50 96 60 78Z', sc, 2.2)}
        ${sh('M64 96 Q84 118 116 108 Q100 120 82 118 Q66 114 64 96Z', P.vol(c2), 1.3)}${ln('M70 102 l6 -4 M78 108 l6 -5 M88 112 l6 -6 M98 112 l6 -6', shade(c2, -0.25), 1.2)}
        ${sh('M66 82 Q54 58 52 38 Q62 30 70 36 Q70 56 78 74Z', sc, 2)}
        ${sh(limb(76, 108, 70, 136, 11, 9), sc)}${[64, 70, 76, 114, 120, 126].map(x => sh(`M${x} 136 l3 7 l3 -7Z`, BONE, .8)).join('')}
        ${sh('M66 42 Q56 22 36 22 Q14 22 4 34 Q6 44 22 46 Q40 50 58 52Z', sc, 2.1)}
        ${sh('M8 40 Q22 44 40 42 L40 46 Q22 48 8 44Z', '#3a0808', 1.2)}${sh('M6 44 Q20 48 40 46 L38 54 Q18 54 6 48Z', P.scales(shade(c1, -0.1)), 1.5)}${teeth(8, 40, 36, 7, 4)}${teeth(10, 46, 34, 6, 3, true)}
        ${sh('M52 26 Q60 6 80 2 Q66 14 60 30Z', horn, 1.3)}${sh('M42 24 Q44 10 58 4 Q50 14 50 26Z', horn, 1.2)}
        ${sh('M60 32 L70 26 L66 36 L76 34 L66 44Z', P.vol(c2), 1)}
        ${eye(P, 30, 30, 3.2, c3 ?? '#ffd23a')}${ln('M20 26 L38 24', INK, 1.8)}
        ${sh('M50 66 Q14 30 8 62 Q2 80 18 82 Q14 70 30 72 Q24 60 44 74Z', wing, 1.8, 'opacity=".95"')}${ln('M48 68 Q20 44 12 66', shade(c2, -0.25), 1.2)}`, size);
    }
    case 'whelp': {
      const sc = P.scales(c1);
      return wrap(P, `${shadow(36)}
        ${sh('M88 84 Q110 50 136 54 Q124 64 130 74 Q114 74 110 90Z', P.vol(shade(c1, 0.15)), 1.6)}
        ${sh('M98 112 Q124 116 132 132 Q120 124 104 124Z', sc, 1.4)}
        ${sh('M56 96 Q60 74 84 76 Q108 80 106 106 Q100 126 80 126 Q58 124 56 96Z', sc, 2)}${sh('M64 106 Q80 124 98 112 Q86 120 76 118Z', P.vol(c2), 1)}
        ${sh(limb(68, 116, 66, 138, 7, 6), sc)}${sh(limb(94, 116, 96, 138, 7, 6), sc)}
        ${sh('M66 80 Q52 54 34 56 Q18 58 16 70 Q22 80 38 80 Q52 84 64 92Z', sc, 2)}${teeth(20, 72, 36, 4, 3)}
        ${sh('M48 58 L52 42 L56 60Z M40 58 L40 46 L46 58Z', P.vol(BONE), 1)}${eye(P, 36, 64, 3, '#ffd23a')}
        ${sh('M62 88 Q36 60 26 78 Q38 80 40 92Z', P.vol(shade(c1, 0.15)), 1.5)}`, size);
    }
    case 'egg':
      return wrap(P, `${shadow(36)}<ellipse cx="80" cy="94" rx="46" ry="52" fill="${P.glowFill(c2)}" opacity=".5" class="aura-pulse"/>
        ${sh('M80 30 Q114 34 116 96 Q114 140 80 142 Q46 140 44 96 Q46 34 80 30Z', P.scales(c1), 2.2)}
        ${ln('M66 62 L74 74 L68 86 L78 96 M96 80 L90 94 L98 104', c2, 2.6, `filter="${P.filterGlow(1.6)}"`)}${ln('M56 50 Q64 40 74 38', '#fff', 2, 'opacity=".35"')}`, size);
    case 'spider': {
      const carapace = P.vol(c1);
      const legs = [0, 1, 2, 3].map(i => sh(limb(70, 96 + i * 3, 30 - i * 6, 80 + i * 10, 3.4, 2.6), P.vol(c2), 1.2) + sh(limb(30 - i * 6, 80 + i * 10, 18 - i * 3, 128 + i * 4, 2.6, 1.6), P.vol(c2), 1.2)
        + sh(limb(94, 96 + i * 3, 130 + i * 6, 80 + i * 10, 3.4, 2.6), P.vol(c2), 1.2) + sh(limb(130 + i * 6, 80 + i * 10, 142 + i * 3, 128 + i * 4, 2.6, 1.6), P.vol(c2), 1.2)).join('');
      return wrap(P, `${shadow(56)}${legs}${sh('M84 72 Q126 70 128 104 Q124 132 92 130 Q66 126 70 98Z', carapace, 2)}${ln('M96 80 Q108 96 100 122 M110 84 Q118 100 112 118', shade(c1, 0.25), 1.4)}
        ${sh('M50 86 Q52 70 70 72 Q84 76 82 96 Q76 110 60 106 Q48 102 50 86Z', carapace, 2)}${[[58, 84], [64, 80], [70, 84], [62, 90]].map(([x, y]) => eye(P, x, y, 2, '#ff3a2a')).join('')}
        ${sh('M50 98 L44 110 L52 104Z M60 104 L58 116 L64 106Z', BONE, .9)}`, size);
    }
    case 'serpent': {
      const sc = P.scales(c1);
      return wrap(P, `${shadow(52)}
        ${sh('M150 132 Q130 142 100 136 Q60 130 50 116 Q40 100 62 92 Q96 82 108 70 Q118 58 104 50', 'none', 0)}
        <path d="M150 132 Q120 144 90 136 Q50 128 48 112 Q48 96 76 92 Q110 86 112 66 Q112 50 92 46" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
        <path d="M150 132 Q120 144 90 136 Q50 128 48 112 Q48 96 76 92 Q110 86 112 66 Q112 50 92 46" fill="none" stroke="${sc}" stroke-width="22" stroke-linecap="round"/>
        <path d="M146 128 Q118 138 90 130 Q56 122 56 112" fill="none" stroke="${P.vol(c2)}" stroke-width="7" stroke-linecap="round"/>
        ${sh('M98 40 Q90 18 66 20 Q42 22 34 36 Q40 48 60 52 Q80 58 98 54Z', sc, 2)}${sh('M100 30 Q118 26 122 48 Q112 42 100 50Z', P.vol(c2), 1.3)}
        ${sh('M36 38 Q50 46 66 44 L64 54 Q46 52 36 46Z', P.vol(shade(c2, -0.2)), 1.3)}${teeth(40, 42, 62, 2, 7)}
        ${eye(P, 56, 32, 3, '#ffeb3b')}${ln('M48 28 L64 26', INK, 1.6)}${ln('M36 46 L26 52 M26 52 l-4 -3 M26 52 l-3 4', '#c0392b', 1.6)}`, size);
    }
    case 'demon': {
      const skin = P.vol(c1);
      return wrap(P, `${shadow(50)}
        ${sh('M60 50 Q20 10 6 34 Q14 40 10 54 Q22 52 22 66 Q34 60 46 70Z', P.vol(c2), 1.8)}${sh('M100 50 Q140 10 154 34 Q146 40 150 54 Q138 52 138 66 Q126 60 114 70Z', P.vol(c2), 1.8)}
        ${ln('M58 52 Q30 28 12 36 M102 52 Q130 28 148 36', shade(c2, -0.3), 1.4)}
        ${sh(limb(70, 100, 62, 128, 12, 9), P.fur(shade(c1, -0.25)))}${sh(limb(94, 100, 102, 128, 12, 9), P.fur(shade(c1, -0.25)))}
        ${sh('M52 136 L62 124 L72 136Z M92 136 L102 124 L112 136Z', P.vol('#2a1a10'), 1.4)}
        ${sh('M44 46 Q80 32 116 46 Q122 66 112 86 Q104 106 80 108 Q56 106 48 86 Q38 66 44 46Z', skin, 2.4)}${ln('M58 60 Q70 70 80 64 Q90 70 102 60', INK, 1.2, 'opacity=".7"')}${ln('M80 70 V100 M68 82 Q80 86 92 82 M70 94 Q80 97 90 94', INK, 1, 'opacity=".6"')}
        ${ln('M66 58 Q80 64 94 58 M68 72 Q80 78 92 72 M80 64 V96', shade(c1, -0.3), 1.6)}
        ${sh(limb(52, 54, 32, 82, 11, 9), skin)}${sh(limb(32, 82, 26, 100, 9, 8), skin)}${sh(limb(108, 54, 128, 82, 11, 9), skin)}${sh(limb(128, 82, 134, 100, 9, 8), skin)}
        ${[[24, 104], [134, 104]].map(([x, y]) => sh(`M${x - 6} ${y - 4} l-4 10 M${x} ${y} l-2 11 M${x + 6} ${y - 4} l2 10`, 'none', 2.4)).join('')}
        ${sh('M62 20 Q80 10 98 20 Q102 40 92 50 Q80 56 68 50 Q58 40 62 20Z', skin, 2)}
        ${sh('M64 22 Q48 6 52 -6 Q58 10 70 16Z', P.vol(BONE), 1.4)}${sh('M96 22 Q112 6 108 -6 Q102 10 90 16Z', P.vol(BONE), 1.4)}
        ${eye(P, 72, 32, 3.2, glowEye)}${eye(P, 88, 32, 3.2, glowEye)}${ln('M66 28 L76 30 M94 28 L84 30', INK, 2)}
        ${sh('M70 42 Q80 48 90 42 L88 46 Q80 50 72 46Z', INK, 1)}${teeth(72, 43, 88, 4, 3)}
        <ellipse cx="80" cy="74" rx="8" ry="6" fill="${P.glowFill(glowEye)}"/>`, size, '0 -12 160 162');
    }
    case 'murloc': {
      const skin = P.scales(c1);
      return wrap(P, `${shadow(36)}
        ${sh(limb(70, 110, 66, 134, 8, 6), P.vol(c1))}${sh(limb(92, 110, 96, 134, 8, 6), P.vol(c1))}${sh('M56 136 l10 -6 l12 6Z M86 136 l10 -6 l12 6Z', P.vol(c2), 1.2)}
        ${sh('M56 66 Q54 34 82 32 Q110 34 108 66 Q116 98 98 114 L66 114 Q48 98 56 66Z', skin, 2.2)}
        ${sh('M62 34 L66 12 L74 28 L80 8 L86 28 L96 12 L98 34', P.vol(c2), 1.4)}
        ${sh('M62 80 Q82 94 104 80 Q100 92 84 94 Q68 92 62 80Z', P.vol(shade(c2, 0.2)), 1)}
        ${sh(limb(56, 70, 38, 92, 7, 6), P.vol(c1))}${sh(limb(108, 70, 126, 90, 7, 6), P.vol(c1))}
        <ellipse cx="70" cy="50" rx="7" ry="8" fill="#fff" stroke="${INK}" stroke-width="1.2"/><ellipse cx="94" cy="50" rx="7" ry="8" fill="#fff" stroke="${INK}" stroke-width="1.2"/>
        <circle cx="68" cy="52" r="3.4" fill="${INK}"/><circle cx="92" cy="52" r="3.4" fill="${INK}"/>
        ${sh('M62 64 Q82 84 104 64 Q82 72 62 64Z', '#7a1a1a', 1.4)}${teeth(66, 66, 100, 7, 4)}
        ${a.wpn !== undefined ? '' : `<g transform="translate(126 96) rotate(-10)">${sh('M-2 -60 L2 -60 L2 20 L-2 20Z', P.cyl('#6b4a2a'))}${sh('M0 -76 L6 -58 L0 -54 L-6 -58Z', P.metal('#b8c2d0'), 1.2)}</g>`}`, size);
    }
    case 'rat':
      return wrap(P, `${shadow(40)}${sh('M112 118 Q148 120 150 96', 'none', 0)}<path d="M112 118 Q148 122 152 96" fill="none" stroke="${INK}" stroke-width="5"/><path d="M112 118 Q148 122 152 96" fill="none" stroke="#c89a9a" stroke-width="3"/>
        ${sh('M50 108 Q56 82 90 84 Q120 88 118 116 Q112 134 84 134 Q54 132 50 108Z', P.fur(c1), 2)}
        ${sh('M56 100 Q42 90 22 104 Q20 114 34 118 Q48 120 58 114Z', P.vol(c1), 2)}<circle cx="50" cy="90" r="8" fill="${P.vol(shade(c1, 0.15))}" stroke="${INK}" stroke-width="1.4"/>
        ${eye(P, 36, 104, 2.4, c2)}${sh('M22 106 l-4 2 l4 2Z', '#e8a0a0', .8)}${teeth(24, 112, 30, 2, 4)}
        ${[[62, 132], [100, 132]].map(([x, y]) => sh(`M${x - 6} ${y} h12 l-2 6 h-8Z`, P.vol('#c89a9a'), 1)).join('')}
        <ellipse cx="86" cy="100" rx="6" ry="4" fill="${c2}" opacity=".6"/>`, size);
    case 'plant': {
      const stem = P.vol('#3a6a2a');
      return wrap(P, `${shadow(44)}
        ${[[-1, 0], [1, 8], [-1, 18], [1, -6]].map(([s, o], i) => `<path d="M80 ${110 + o} Q${80 + s * 40} ${88 + o} ${80 + s * 62} ${112 + o + i * 3}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M80 ${110 + o} Q${80 + s * 40} ${88 + o} ${80 + s * 62} ${112 + o + i * 3}" fill="none" stroke="${stem}" stroke-width="6" stroke-linecap="round"/>`).join('')}
        ${sh('M74 140 Q70 110 76 84 L86 84 Q90 110 88 140Z', stem, 1.8)}
        ${[0, 72, 144, 216, 288].map(r => `<g transform="rotate(${r} 80 60)">${sh('M80 60 Q92 30 80 16 Q68 30 80 60Z', P.vol(c2), 1.4)}</g>`).join('')}
        ${sh('M56 60 Q58 34 80 34 Q104 34 106 60 Q104 84 80 86 Q56 84 56 60Z', P.vol(c1), 2)}
        ${sh('M60 64 Q80 92 100 64 Q80 74 60 64Z', '#4a0a1a', 1.4)}${teeth(62, 66, 98, 7, 5)}
        ${eye(P, 70, 50, 3, '#ffeb3b')}${eye(P, 90, 50, 3, '#ffeb3b')}`, size);
    }
    case 'totem': {
      const wood = P.vol(c1);
      return wrap(P, `${shadow(30)}${sh('M62 30 L98 30 L100 138 L60 138Z', wood, 2)}
        ${sh('M54 30 L106 30 L100 14 L60 14Z', P.vol(c2), 1.8)}${sh('M44 40 L60 34 L60 60 L46 56Z M116 40 L100 34 L100 60 L114 56Z', P.vol(c2), 1.5)}
        ${eye(P, 72, 50, 4, c2)}${eye(P, 88, 50, 4, c2)}${sh('M70 66 Q80 76 90 66 L88 74 Q80 80 72 74Z', INK, 1)}
        ${ln('M64 90 H96 M64 106 H96 M64 122 H96', shade(c1, -0.3), 2.2)}${ln('M70 98 l4 -4 l4 4 l4 -4 l4 4 l4 -4', c2, 1.6)}`, size);
    }
  }
  return wrap(P, `${shadow()}<circle cx="80" cy="90" r="30" fill="${P.vol(c1)}" stroke="${INK}" stroke-width="2"/>`, size);
}
