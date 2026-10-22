// SVG art for enemies. Humanoids reuse the paper doll; other creatures use templates.
import type { EnemyArt } from '../../engine/types';
import { dollSvg, shade } from './doll';

let n = 0;

function wrap(inner: string, size = 1, vb = '0 0 140 140'): string {
  const px = Math.round(110 * size);
  return `<svg viewBox="${vb}" width="${px}" height="${px}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

export function enemySvg(a: EnemyArt): string {
  const c1 = a.c1, c2 = a.c2 ?? shade(a.c1, -0.25), c3 = a.c3 ?? shade(c2, 0.2);
  const id = 'e' + n++;
  const d = (c: string) => shade(c, -0.3);
  const glow = `<defs><filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="${id}r"><stop offset="0" stop-color="${shade(c1, 0.3)}"/><stop offset="1" stop-color="${c1}"/></radialGradient></defs>`;
  const shadow = `<ellipse cx="70" cy="132" rx="40" ry="6" fill="#000" opacity=".35"/>`;
  const eyes = (x: number, y: number, gap = 8, col = '#ffeb3b', r = 2.5) => `<circle cx="${x - gap / 2}" cy="${y}" r="${r}" fill="${col}" filter="url(#${id}g)"/><circle cx="${x + gap / 2}" cy="${y}" r="${r}" fill="${col}" filter="url(#${id}g)"/>`;
  const size = a.size ?? 1;
  switch (a.k) {
    case 'humanoid':
    case 'giant':
    case 'trogg': {
      const race = a.race ?? (a.k === 'giant' ? 'tauren' : a.k === 'trogg' ? 'dwarf' : 'human');
      const gear: any[] = [
        { slot: 'chest', armor: a.k === 'giant' ? 'plate' : 'leather', q: 'rare', look: { c1, c2 } },
        { slot: 'legs', armor: 'mail', q: 'common', look: { c1: shade(c2, -0.2) } },
        { slot: 'feet', q: 'common', look: { c1: '#2a1a10' } },
      ];
      if (a.helm) gear.push({ slot: 'head', q: 'rare', armor: 'plate', look: { c1: a.helm === 'crown' ? '#d4af37' : c2, c2: c1, style: a.helm } });
      if (a.k === 'giant') gear.push({ slot: 'shoulder', armor: 'plate', q: 'epic', look: { c1: c2, c2: c1 } });
      if (a.wpn) gear.push({ slot: 'mainhand', wpn: a.wpn, q: 'common', look: { c1: c2, c2: '#c0c0c0' } });
      if (a.off) gear.push({ slot: 'offhand', off: a.off, q: 'common', look: { c1: c2, c2: c1 } });
      const skin = a.k === 'trogg' ? c1 : a.k === 'giant' ? shade(c1, 0.1) : undefined;
      const px = Math.round(120 * size * (a.k === 'giant' ? 1.15 : 1));
      return dollSvg({ race: race as any, skin: 0, hair: a.hair ?? 0, hairColor: 0, face: 0, gear, skinOverride: skin, flip: true }, { w: px, h: Math.round(px * 1.5) });
    }
    case 'skeleton': {
      const gear: any[] = [];
      if (a.wpn) gear.push({ slot: 'mainhand', wpn: a.wpn, q: 'common', look: { c1: '#8a8a8a', c2: c2 } });
      if (a.off) gear.push({ slot: 'offhand', off: a.off, q: 'common', look: { c1: c2, c2: c1 } });
      if (a.helm) gear.push({ slot: 'head', q: 'rare', armor: 'cloth', look: { c1: c2, style: a.helm } });
      gear.push({ slot: 'chest', armor: 'cloth', q: 'common', look: { c1: shade(c2, -0.1), c2: c1 } });
      const px = Math.round(120 * size);
      return dollSvg({ race: 'undead', skin: 0, hair: 4, hairColor: 2, face: 0, gear, skinOverride: c1, flip: true }, { w: px, h: Math.round(px * 1.5) });
    }
    case 'ghost': {
      return wrap(`${glow}<g opacity=".82" class="float"><path d="M40 60 Q40 22 70 22 Q100 22 100 60 L100 112 Q92 104 86 116 Q78 104 70 118 Q62 104 54 116 Q48 104 40 112Z" fill="url(#${id}r)" stroke="${c2}" stroke-width="2"/>${eyes(70, 52, 16, '#e0f8ff', 4)}<path d="M60 72 Q70 80 80 72" stroke="${c2}" stroke-width="2" fill="none"/></g>`, size);
    }
    case 'elemental': {
      return wrap(`${glow}${shadow}<g filter="url(#${id}g)" class="flicker"><path d="M70 14 Q86 34 96 30 Q92 50 106 60 Q96 70 102 90 Q86 88 84 108 Q74 96 70 118 Q66 96 56 108 Q54 88 38 90 Q44 70 34 60 Q48 50 44 30 Q54 34 70 14Z" fill="url(#${id}r)" stroke="${c2}" stroke-width="2"/>
        <path d="M70 34 Q80 48 86 46 Q82 62 90 72 Q78 76 70 92 Q62 76 50 72 Q58 62 54 46 Q60 48 70 34Z" fill="${c2}" opacity=".7"/></g>${eyes(70, 56, 14, '#fff', 3.5)}
        <path d="M40 74 Q20 78 18 98" stroke="${c1}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M100 74 Q120 78 122 98" stroke="${c1}" stroke-width="9" stroke-linecap="round" fill="none"/>${a.wpn ? `<g transform="translate(122,96) scale(1.2)"><rect x="-3" y="-60" width="6" height="66" fill="#3a2a1a"/><rect x="-14" y="-74" width="28" height="18" rx="3" fill="${c3}" stroke="#ffd27a"/></g>` : ''}`, size);
    }
    case 'ooze':
      return wrap(`${glow}${shadow}<path d="M26 128 Q20 90 44 74 Q52 44 76 46 Q104 48 108 80 Q124 96 116 128Z" fill="url(#${id}r)" stroke="${c2}" stroke-width="2" opacity=".9"/><circle cx="60" cy="96" r="5" fill="${c2}" opacity=".6"/><circle cx="92" cy="108" r="4" fill="${c2}" opacity=".6"/>${eyes(72, 76, 18, '#fff', 4)}`, size);
    case 'golem':
      return wrap(`${glow}${shadow}<rect x="44" y="42" width="52" height="56" rx="6" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/><rect x="54" y="20" width="32" height="26" rx="4" fill="${shade(c1, 0.1)}" stroke="${d(c1)}" stroke-width="2"/><rect x="60" y="30" width="20" height="5" fill="${c2}" filter="url(#${id}g)"/>
        <rect x="24" y="44" width="18" height="48" rx="6" fill="${shade(c1, -0.1)}" stroke="${d(c1)}"/><rect x="98" y="44" width="18" height="48" rx="6" fill="${shade(c1, -0.1)}" stroke="${d(c1)}"/><rect x="50" y="98" width="16" height="32" fill="${shade(c1, -0.15)}"/><rect x="74" y="98" width="16" height="32" fill="${shade(c1, -0.15)}"/><circle cx="70" cy="68" r="8" fill="${c2}" filter="url(#${id}g)"/>`, size);
    case 'beast':
    case 'boar':
      return wrap(`${glow}${shadow}<ellipse cx="68" cy="84" rx="38" ry="22" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><path d="M36 80 Q20 60 32 44 Q46 40 50 62Z" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/>
        <path d="M24 46 L34 40 L30 50Z M30 52 l-8 6 l10 -2Z" fill="#fff"/>${eyes(36, 50, 0, '#ffeb3b', 2.5)}<path d="M100 80 Q122 74 128 60" stroke="${c1}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <rect x="42" y="98" width="8" height="30" rx="3" fill="${c2}"/><rect x="58" y="100" width="8" height="28" rx="3" fill="${c2}"/><rect x="80" y="100" width="8" height="28" rx="3" fill="${c2}"/><rect x="94" y="98" width="8" height="30" rx="3" fill="${c2}"/><path d="M50 66 Q68 60 90 68" stroke="${c2}" stroke-width="3" fill="none"/>`, size);
    case 'hound': {
      const head = (x: number, y: number) => `<path d="M${x} ${y} Q${x - 22} ${y - 4} ${x - 26} ${y + 10} Q${x - 14} ${y + 18} ${x} ${y + 14}Z" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/><path d="M${x - 4} ${y - 2} L${x - 2} ${y - 14} L${x - 10} ${y - 4}Z" fill="${c2}"/>${eyes(x - 12, y + 4, 0, '#ff5a1f', 2.5)}<path d="M${x - 24} ${y + 12} l4 -2 l2 4 l3 -3" stroke="#fff" stroke-width="1.2" fill="none"/>`;
      return wrap(`${glow}${shadow}<ellipse cx="74" cy="84" rx="36" ry="20" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/>${head(48, 56)}${c3 !== shade(c2, 0.2) || a.c3 ? head(54, 40) : ''}
        <path d="M106 78 Q128 66 126 52" stroke="${c1}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="46" y="96" width="8" height="32" rx="3" fill="${c2}"/><rect x="62" y="98" width="8" height="30" rx="3" fill="${c2}"/><rect x="88" y="98" width="8" height="30" rx="3" fill="${c2}"/><rect x="100" y="96" width="8" height="32" rx="3" fill="${c2}"/>
        <path d="M54 70 L60 62 L66 70 L72 62 L78 70 L84 62 L90 70" stroke="${c2}" stroke-width="2" fill="none"/>`, size);
    }
    case 'dragon':
      return wrap(`${glow}${shadow}<path d="M64 60 Q20 10 6 40 Q24 44 26 60 Q14 66 18 80 Q40 70 64 76Z" fill="${shade(c1, 0.1)}" stroke="${c2}" stroke-width="2" opacity=".95"/>
        <path d="M84 60 Q120 6 136 36 Q118 42 118 58 Q130 64 126 78 Q104 70 84 76Z" fill="${shade(c1, 0.05)}" stroke="${c2}" stroke-width="2" opacity=".95"/>
        <ellipse cx="74" cy="90" rx="32" ry="26" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><path d="M56 80 Q50 50 46 34 Q56 22 66 30 Q64 50 70 72Z" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/>
        <path d="M40 30 Q54 18 68 26 L64 40 Q50 42 40 36Z" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/><path d="M50 22 L44 6 L56 18 M60 20 L62 4 L66 20" stroke="${c2}" stroke-width="3" fill="none"/>${eyes(52, 28, 0, a.c3 ?? '#ffeb3b', 2.5)}
        <path d="M70 98 Q74 108 78 98 Q82 108 86 98" stroke="${c2}" stroke-width="2" fill="none"/><path d="M100 100 Q126 112 132 128" stroke="${c1}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <rect x="54" y="108" width="10" height="22" rx="3" fill="${c1}"/><rect x="84" y="108" width="10" height="22" rx="3" fill="${c1}"/>`, size);
    case 'whelp':
      return wrap(`${glow}${shadow}<path d="M60 70 Q34 40 24 58 Q38 62 40 74Z" fill="${shade(c1, 0.15)}" stroke="${c2}" stroke-width="2"/><path d="M80 70 Q106 40 116 58 Q102 62 100 74Z" fill="${shade(c1, 0.15)}" stroke="${c2}" stroke-width="2"/>
        <ellipse cx="70" cy="92" rx="22" ry="18" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><circle cx="70" cy="64" r="14" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/><path d="M62 52 L58 40 L66 50 M78 52 L82 40 L74 50" stroke="${c2}" stroke-width="2.5" fill="none"/>${eyes(70, 62, 10, '#ffeb3b', 2.5)}
        <path d="M90 100 Q110 108 112 122" stroke="${c1}" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="58" y="106" width="7" height="20" rx="2" fill="${c1}"/><rect x="76" y="106" width="7" height="20" rx="2" fill="${c1}"/>`, size);
    case 'egg':
      return wrap(`${glow}${shadow}<ellipse cx="70" cy="86" rx="28" ry="38" fill="url(#${id}r)" stroke="${c2}" stroke-width="2"/><path d="M50 70 Q60 64 70 72 Q80 64 90 70" stroke="${c2}" stroke-width="2" fill="none"/><circle cx="70" cy="92" r="8" fill="${c2}" opacity=".5" filter="url(#${id}g)" class="aura-pulse"/>`, size);
    case 'spider':
      return wrap(`${glow}${shadow}${[0, 1, 2, 3].map(i => `<path d="M60 ${84 + i * 4} Q${30 - i * 4} ${60 + i * 10} ${16 + i * 4} ${100 + i * 8}" stroke="${c2}" stroke-width="3" fill="none"/><path d="M80 ${84 + i * 4} Q${110 + i * 4} ${60 + i * 10} ${124 - i * 4} ${100 + i * 8}" stroke="${c2}" stroke-width="3" fill="none"/>`).join('')}
        <ellipse cx="70" cy="96" rx="26" ry="20" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><circle cx="70" cy="74" r="12" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/>${eyes(70, 72, 8, '#ff3a3a', 2)}`, size);
    case 'serpent':
      return wrap(`${glow}${shadow}<path d="M30 124 Q20 100 50 100 Q90 100 96 84 Q102 64 78 62 Q60 60 62 44" stroke="${c1}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M30 124 Q20 100 50 100 Q90 100 96 84 Q102 64 78 62 Q60 60 62 44" stroke="${c2}" stroke-width="4" fill="none" stroke-dasharray="4 6"/>
        <path d="M50 30 Q64 22 78 32 Q74 46 62 48 Q50 46 50 30Z" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/>${eyes(64, 34, 10, '#ffeb3b', 2.2)}<path d="M64 46 L62 56 M62 56 l-3 3 M62 56 l3 3" stroke="#c0392b" stroke-width="1.5"/>`, size);
    case 'demon':
      return wrap(`${glow}${shadow}<path d="M42 50 Q10 30 12 70 Q26 60 40 66Z" fill="${c2}" opacity=".9"/><path d="M98 50 Q130 30 128 70 Q114 60 100 66Z" fill="${c2}" opacity=".9"/>
        <path d="M46 46 L94 46 L100 100 L40 100Z" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><circle cx="70" cy="34" r="16" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/><path d="M58 24 Q48 8 56 0 M82 24 Q92 8 84 0" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round"/>${eyes(70, 32, 10, '#7fff00', 3)}
        <path d="M64 42 l3 3 l3 -3 l3 3 l3 -3" stroke="#fff" stroke-width="1.2" fill="none"/><rect x="28" y="50" width="14" height="44" rx="6" fill="${c1}"/><rect x="98" y="50" width="14" height="44" rx="6" fill="${c1}"/>
        <path d="M48 100 L44 130 L58 130 L62 100Z M78 100 L82 130 L96 130 L92 100Z" fill="${shade(c1, -0.15)}"/>`, size);
    case 'murloc':
      return wrap(`${glow}${shadow}<path d="M48 60 Q46 30 70 28 Q96 30 92 62 Q100 96 84 104 L56 104 Q40 96 48 60Z" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><path d="M60 30 L64 14 L70 26 L76 12 L80 30" fill="${c2}" stroke="${d(c2)}"/>
        <circle cx="60" cy="50" r="6" fill="#fff"/><circle cx="80" cy="50" r="6" fill="#fff"/><circle cx="61" cy="51" r="3" fill="#111"/><circle cx="79" cy="51" r="3" fill="#111"/><path d="M56 68 Q70 82 84 68 Q70 74 56 68Z" fill="#7a1a1a"/><path d="M58 70 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4" stroke="#fff" stroke-width="1" fill="none"/>
        <rect x="34" y="64" width="10" height="30" rx="5" fill="${c1}"/><rect x="96" y="64" width="10" height="30" rx="5" fill="${c1}"/><rect x="56" y="104" width="10" height="24" rx="4" fill="${shade(c1, -0.1)}"/><rect x="74" y="104" width="10" height="24" rx="4" fill="${shade(c1, -0.1)}"/>`, size);
    case 'rat':
      return wrap(`${glow}${shadow}<ellipse cx="74" cy="104" rx="30" ry="18" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><path d="M46 98 Q30 92 28 104 Q36 112 48 110Z" fill="${c1}" stroke="${d(c1)}"/><circle cx="46" cy="90" r="6" fill="${shade(c1, 0.2)}"/>${eyes(36, 100, 0, c2, 2)}<path d="M102 108 Q130 110 128 90" stroke="#c89a9a" stroke-width="3" fill="none"/>`, size);
    case 'plant':
      return wrap(`${glow}${shadow}<path d="M70 130 Q66 100 70 80" stroke="#3a6a2a" stroke-width="10" fill="none"/>${[[-1, 0], [1, 6], [-1, 14]].map(([s, o]) => `<path d="M70 ${100 + o} Q${70 + s * 40} ${80 + o} ${70 + s * 50} ${104 + o}" stroke="${c1}" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}
        <circle cx="70" cy="62" r="24" fill="url(#${id}r)" stroke="${d(c1)}" stroke-width="2"/><path d="M50 60 Q70 86 90 60 Q70 70 50 60Z" fill="${c2}"/><path d="M54 62 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6" stroke="#fff" stroke-width="1.5" fill="none"/>${eyes(70, 48, 14, '#ffeb3b', 3)}`, size);
    case 'totem':
      return wrap(`${glow}${shadow}<rect x="56" y="30" width="28" height="100" rx="4" fill="${c1}" stroke="${d(c1)}" stroke-width="2"/><path d="M50 30 L90 30 L84 18 L56 18Z" fill="${c2}"/><circle cx="70" cy="50" r="7" fill="${c2}" filter="url(#${id}g)"/><path d="M60 72 h20 M60 88 h20 M60 104 h20" stroke="${c2}" stroke-width="3"/>`, size);
  }
  return wrap(`${shadow}<circle cx="70" cy="80" r="30" fill="${c1}"/>`, size);
}
