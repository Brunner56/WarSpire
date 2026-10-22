// Themed battle backdrops drawn from each dungeon's palette.
import { shade } from './doll';

export function backdropSvg(dungeonId: string, c0: string, c1: string): string {
  const wall = shade(c0, 0.04), wall2 = shade(c1, -0.35), floor = shade(c1, -0.45);
  const torch = (x: number, y: number) => `<g><rect x="${x - 2}" y="${y}" width="4" height="16" fill="#3a2a1a"/><ellipse cx="${x}" cy="${y - 4}" rx="5" ry="8" fill="#ffb030" class="flame"/><circle cx="${x}" cy="${y - 2}" r="40" fill="url(#tg)" opacity=".55"/></g>`;
  let mid = '';
  switch (dungeonId) {
    case 'rfc': case 'brd': case 'mc':
      mid = `<path d="M0 260 Q80 220 140 250 T300 240 T400 255 L400 300 L0 300Z" fill="${shade(c1, -0.2)}" opacity=".8"/>
        <path d="M0 290 Q100 270 200 285 T400 280" stroke="#ff6a1f" stroke-width="3" fill="none" opacity=".7" class="flame"/>
        ${[30, 120, 230, 330].map((x, i) => `<path d="M${x} 0 L${x + 14} ${50 + i * 9} L${x + 28} 0Z" fill="${wall2}"/>`).join('')}`;
      break;
    case 'dm': case 'zf':
      mid = `${[40, 160, 280].map(x => `<rect x="${x}" y="40" width="16" height="230" fill="${shade(c1, -0.25)}"/><rect x="${x - 10}" y="40" width="36" height="10" fill="${shade(c1, -0.1)}"/>`).join('')}<path d="M0 70 L400 60" stroke="${shade(c1, -0.1)}" stroke-width="8"/>`;
      break;
    case 'wc':
      mid = `${[20, 110, 210, 320].map((x, i) => `<path d="M${x} 300 Q${x + 20} ${180 - i * 10} ${x + 40} 300Z" fill="#1f4a1f" opacity=".8"/><path d="M${x + 30} 0 Q${x + 10} 60 ${x + 40} 110" stroke="#2f6a2f" stroke-width="5" fill="none"/>`).join('')}`;
      break;
    case 'sfk': case 'strat': case 'sm':
      mid = `${[50, 200, 350].map(x => `<path d="M${x - 40} 280 L${x - 40} 110 Q${x} 50 ${x + 40} 110 L${x + 40} 280" fill="${shade(c0, -0.15)}" stroke="${shade(c1, -0.1)}" stroke-width="6"/><path d="M${x - 24} 150 Q${x} 100 ${x + 24} 150 L${x + 24} 220 L${x - 24} 220Z" fill="${shade(c1, 0.1)}" opacity=".35"/>`).join('')}`;
      break;
    default:
      mid = `${[60, 200, 340].map(x => `<path d="M${x - 30} 280 L${x - 22} 60 L${x + 22} 60 L${x + 30} 280Z" fill="${shade(c0, -0.1)}" stroke="${shade(c1, -0.2)}" stroke-width="3"/><path d="M${x - 34} 60 h68 l-6 -14 h-56Z" fill="${shade(c1, -0.15)}"/>`).join('')}
        <path d="M0 40 Q200 -10 400 40" stroke="${c1}" stroke-width="2" fill="none" opacity=".5"/>`;
  }
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c0, -0.05)}"/><stop offset="1" stop-color="${wall}"/></linearGradient>
    <radialGradient id="tg"><stop offset="0" stop-color="#ffb030" stop-opacity=".6"/><stop offset="1" stop-color="#ffb030" stop-opacity="0"/></radialGradient>
    <linearGradient id="bgf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${floor}"/><stop offset="1" stop-color="#050302"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#bgw)"/>
    ${[...Array(9)].map((_, r) => `<path d="M0 ${r * 30 + 10} H400" stroke="${shade(c0, 0.06)}" stroke-width="1" opacity=".5"/>`).join('')}
    ${mid}
    ${torch(140, 110)}${torch(260, 110)}
    <path d="M0 250 L400 250 L400 300 L0 300Z" fill="url(#bgf)"/>
    <path d="M0 250 H400" stroke="${shade(c1, 0.1)}" stroke-width="1.5" opacity=".6"/>
  </svg>`;
}
