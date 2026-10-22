// Painted, themed battle scenes for every dungeon and raid (Warcraft III-inspired).
import { Paint, INK, sh, ln, shade, mix, SVG_ANIM } from './paint';
export { shade };

const W = 400, H = 300, FLOOR = 238;

function torch(P: Paint, x: number, y: number, col = '#ffb030') {
  return `<circle cx="${x}" cy="${y - 6}" r="46" fill="${P.glowFill(col)}" opacity=".55"/>`
    + sh(`M${x - 5} ${y} L${x + 5} ${y} L${x + 3} ${y + 16} L${x - 3} ${y + 16}Z`, P.metal('#5a4a3a'), 1.2)
    + sh(`M${x} ${y - 20} Q${x + 8} ${y - 8} ${x + 5} ${y} Q${x} ${y + 3} ${x - 5} ${y} Q${x - 8} ${y - 8} ${x} ${y - 20}Z`, P.orb(col, '#fff6c0'), 1, 'class="flame"');
}
function banner(P: Paint, x: number, y: number, c: string, emblem: string) {
  return sh(`M${x - 18} ${y} L${x + 18} ${y} L${x + 18} ${y + 70} L${x} ${y + 60} L${x - 18} ${y + 70}Z`, P.vol(c), 1.6)
    + ln(`M${x - 22} ${y} H${x + 22}`, P.metal('#d9a93a'), 4) + ln(`M${x - 14} ${y + 6} V${y + 60} M${x + 14} ${y + 6} V${y + 60}`, shade(c, 0.18), 1.2)
    + `<text x="${x}" y="${y + 40}" font-size="22" text-anchor="middle" fill="${shade(c, 0.45)}" stroke="${INK}" stroke-width=".8" font-family="serif">${emblem}</text>`;
}
function pillar(P: Paint, x: number, w: number, c: string, top = 30) {
  return sh(`M${x - w / 2} ${FLOOR} L${x - w / 2} ${top + 18} L${x + w / 2} ${top + 18} L${x + w / 2} ${FLOOR}Z`, P.cyl(c), 1.8)
    + sh(`M${x - w / 2 - 8} ${top + 18} L${x + w / 2 + 8} ${top + 18} L${x + w / 2 + 4} ${top} L${x - w / 2 - 4} ${top}Z`, P.vol(shade(c, 0.08)), 1.6)
    + sh(`M${x - w / 2 - 8} ${FLOOR} L${x + w / 2 + 8} ${FLOOR} L${x + w / 2 + 4} ${FLOOR - 14} L${x - w / 2 - 4} ${FLOOR - 14}Z`, P.vol(shade(c, 0.05)), 1.6)
    + ln(`M${x - w / 4} ${top + 24} V${FLOOR - 18}`, '#fff', 1.4, 'opacity=".22"');
}
function arch(P: Paint, x: number, w: number, top: number, c: string, inside: string) {
  return sh(`M${x - w / 2} ${FLOOR} L${x - w / 2} ${top + w / 2} Q${x - w / 2} ${top} ${x} ${top} Q${x + w / 2} ${top} ${x + w / 2} ${top + w / 2} L${x + w / 2} ${FLOOR}Z`, inside, 3, `stroke="${shade(c, -0.25)}"`)
    + `<path d="M${x - w / 2 - 6} ${FLOOR} L${x - w / 2 - 6} ${top + w / 2} Q${x - w / 2 - 6} ${top - 6} ${x} ${top - 8} Q${x + w / 2 + 6} ${top - 6} ${x + w / 2 + 6} ${top + w / 2} L${x + w / 2 + 6} ${FLOOR}" fill="none" stroke="${P.vol(c)}" stroke-width="10"/>`
    + `<path d="M${x - w / 2 - 6} ${FLOOR} L${x - w / 2 - 6} ${top + w / 2} Q${x - w / 2 - 6} ${top - 6} ${x} ${top - 8} Q${x + w / 2 + 6} ${top - 6} ${x + w / 2 + 6} ${top + w / 2} L${x + w / 2 + 6} ${FLOOR}" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
}
function stalactites(P: Paint, c: string, n = 9, seed = 3) {
  return [...Array(n)].map((_, i) => { const x = (i + 0.5) * (W / n) + ((i * seed * 37) % 18) - 9; const h = 30 + ((i * seed * 53) % 50); return sh(`M${x - 12} 0 Q${x - 4} ${h * 0.6} ${x} ${h} Q${x + 4} ${h * 0.6} ${x + 12} 0Z`, P.vol(c), 1.4); }).join('');
}
function floorTiles(P: Paint, c: string, cracks = true) {
  const lines = [...Array(9)].map((_, i) => { const x = -200 + i * 100; return `M${200 + (x - 200) * 0.45} ${FLOOR} L${x} ${H}`; }).join(' ');
  return sh(`M0 ${FLOOR} H${W} V${H} H0Z`, P.vol(c), 1.2) + ln(lines + ` M0 ${FLOOR + 16} H${W} M0 ${FLOOR + 38} H${W}`, shade(c, -0.18), 1.4)
    + (cracks ? ln(`M60 ${FLOOR + 30} l14 6 l8 -4 M300 ${FLOOR + 24} l-10 10 l12 4`, shade(c, -0.25), 1) : '') + ln(`M0 ${FLOOR} H${W}`, shade(c, 0.18), 2);
}
const fog = (P: Paint, c: string, op = 0.35) => `<ellipse cx="200" cy="${FLOOR + 6}" rx="260" ry="34" fill="${P.glowFill(c)}" opacity="${op}"/>`;
const rays = (P: Paint, c: string, x = 200) => `<path d="M${x - 30} 0 L${x - 120} ${FLOOR} L${x + 40} ${FLOOR} L${x + 30} 0Z" fill="${P.glowFill(c)}" opacity=".35"/>`;

export function backdropSvg(dungeonId: string, c0: string, c1: string): string {
  const P = new Paint();
  const sky = (a: string, b: string) => `<linearGradient id="${P.id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let defs = '';
  let body = '';
  const wall = (c: string, bw = 44, bh = 20) => `<rect width="${W}" height="${FLOOR}" fill="${P.bricks(c, bw, bh)}"/><rect width="${W}" height="${FLOOR}" fill="url(#${P.id}vig)"/>`;
  defs += `<radialGradient id="${P.id}vig" cx=".5" cy=".55" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>`;
  switch (dungeonId) {
    case 'rfc': case 'mc': case 'ony': {
      const rock = dungeonId === 'ony' ? '#2a1a1e' : dungeonId === 'mc' ? '#3a1a10' : '#4a2216';
      const lava = dungeonId === 'ony' ? '#ff6a1f' : '#ff7a1a';
      defs += sky(shade(rock, -0.1), shade(rock, 0.05));
      body += `<rect width="${W}" height="${FLOOR}" fill="url(#${P.id}sky)"/>`;
      body += sh(`M0 ${FLOOR - 70} Q60 ${FLOOR - 120} 120 ${FLOOR - 90} Q180 ${FLOOR - 140} 250 ${FLOOR - 100} Q320 ${FLOOR - 150} ${W} ${FLOOR - 90} V${FLOOR} H0Z`, P.vol(shade(rock, 0.06)), 1.6);
      body += `<path d="M0 ${FLOOR - 24} Q100 ${FLOOR - 40} 200 ${FLOOR - 26} T${W} ${FLOOR - 30} V${FLOOR - 10} H0Z" fill="${P.orb(lava, '#fff3a0')}" class="flame"/>`;
      body += `<ellipse cx="200" cy="${FLOOR - 20}" rx="230" ry="60" fill="${P.glowFill(lava)}" opacity=".5"/>`;
      body += stalactites(P, rock, 10, dungeonId.length);
      body += [70, 330].map(x => sh(`M${x - 26} ${FLOOR} L${x - 14} ${FLOOR - 120} L${x} ${FLOOR - 140} L${x + 16} ${FLOOR - 116} L${x + 26} ${FLOOR}Z`, P.vol(rock), 1.8) + ln(`M${x - 8} ${FLOOR - 100} L${x - 2} ${FLOOR - 60} L${x - 10} ${FLOOR - 20}`, lava, 2.2, `filter="${P.filterGlow(1.4)}"`)).join('');
      if (dungeonId === 'ony') body += [130, 270].map(x => sh(`M${x - 10} ${FLOOR - 6} Q${x - 12} ${FLOOR - 34} ${x} ${FLOOR - 36} Q${x + 12} ${FLOOR - 34} ${x + 10} ${FLOOR - 6}Z`, P.scales('#3a1a24'), 1.4)).join('');
      if (dungeonId === 'mc') body += `<text x="200" y="120" font-size="64" text-anchor="middle" fill="${P.glowFill('#ffb030')}" opacity=".5">🜂</text>`;
      body += floorTiles(P, shade(rock, -0.05)) + fog(P, lava, 0.25);
      body += [[40, 60], [160, 30], [280, 70], [360, 40], [220, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffd27a" class="flicker" filter="${P.filterGlow(1)}"/>`).join('');
      break;
    }
    case 'dm': {
      defs += sky('#1a1410', '#2a2016');
      body += `<rect width="${W}" height="${FLOOR}" fill="url(#${P.id}sky)"/>` + wall('#3a2c20', 52, 22);
      body += [60, 200, 340].map(x => sh(`M${x - 8} ${FLOOR} L${x - 8} 40 L${x + 8} 40 L${x + 8} ${FLOOR}Z`, P.cyl('#5a3e24'), 1.6)).join('');
      body += sh(`M0 34 L${W} 30 L${W} 46 L0 50Z`, P.vol('#5a3e24'), 1.6) + ln('M30 52 L60 90 M370 48 L340 90', P.vol('#5a3e24'), 7);
      body += sh(`M110 ${FLOOR} L130 ${FLOOR - 20} L270 ${FLOOR - 20} L290 ${FLOOR}Z`, P.vol('#3a2a1a'), 1.4) + ln(`M120 ${FLOOR - 4} H280`, P.metal('#8a8a8a'), 3);
      body += sh(`M150 ${FLOOR - 40} h50 v20 h-50Z M156 ${FLOOR - 52} h38 v12 h-38Z`, P.vol('#7a5a2a'), 1.4) + `<circle cx="160" cy="${FLOOR - 16}" r="6" fill="${P.metal('#555')}" stroke="${INK}"/><circle cx="190" cy="${FLOOR - 16}" r="6" fill="${P.metal('#555')}" stroke="${INK}"/>`;
      body += banner(P, 130, 58, '#7a1010', '⚔') + banner(P, 270, 58, '#7a1010', '⚔');
      body += torch(P, 100, 120) + torch(P, 300, 120) + floorTiles(P, '#3a2a1c');
      break;
    }
    case 'wc': {
      defs += sky('#0b1e14', '#16301e');
      body += `<rect width="${W}" height="${FLOOR}" fill="url(#${P.id}sky)"/>` + stalactites(P, '#24402a', 8, 5);
      body += `<path d="M180 0 Q190 120 186 ${FLOOR}" stroke="${P.vol('#6fb0d0')}" stroke-width="22" fill="none" opacity=".75"/>` + ln(`M178 0 Q186 120 182 ${FLOOR}`, '#e0f6ff', 2, 'opacity=".6"');
      body += [30, 110, 290, 370].map((x, i) => sh(`M${x} ${FLOOR} Q${x + 24} ${FLOOR - 120 - i * 10} ${x + 48} ${FLOOR}Z`, P.vol('#1f4a24'), 1.4) + ln(`M${x + 10} 0 Q${x - 10} 70 ${x + 20} 130`, P.vol('#3a6a2a'), 5)).join('');
      body += [[80, FLOOR - 4], [330, FLOOR - 6], [250, FLOOR - 2]].map(([x, y]) => sh(`M${x - 3} ${y} V${y - 14}`, '#d0e8c0', 2) + `<ellipse cx="${x}" cy="${y - 16}" rx="12" ry="7" fill="${P.orb('#7affc0')}" stroke="${INK}" stroke-width="1.2" filter="${P.filterGlow(2)}"/>`).join('');
      body += floorTiles(P, '#24382a', false) + fog(P, '#7affc0', 0.3);
      break;
    }
    case 'sfk': case 'sm': case 'strat': case 'brd': case 'ubrs': case 'bwl': case 'zf':
    default: {
      const theme: Record<string, { stone: string; ban: string; emb: string; window?: string; light?: string; fogC?: string }> = {
        sfk: { stone: '#2e2a38', ban: '#3a2a5a', emb: '🐺', window: '#a8b8ff', light: '#b8c8ff', fogC: '#8a9ad0' },
        sm: { stone: '#5a4a44', ban: '#8b0000', emb: '✠', window: '#ff6a5a', light: '#ffe0a0', fogC: '#ffd0a0' },
        strat: { stone: '#3a3a34', ban: '#4a5a2a', emb: '☠', window: '#7aff5a', light: '#9aff7a', fogC: '#7aff5a' },
        brd: { stone: '#2a1e1a', ban: '#5a1a0a', emb: '⚒', window: '#ff7a1a', light: '#ffb060', fogC: '#ff7a1a' },
        ubrs: { stone: '#2a1414', ban: '#8a1010', emb: '🐉', window: '#ff5a2a', light: '#ffb080', fogC: '#ff6a3a' },
        bwl: { stone: '#1e1a2a', ban: '#3a1a5a', emb: '🐲', window: '#c060ff', light: '#d0a0ff', fogC: '#a050ff' },
        zf: { stone: '#8a6a40', ban: '#3a6a5a', emb: '☥', window: '#ffe6a0', light: '#fff0c0', fogC: '#ffd890' },
      };
      const t = theme[dungeonId] ?? { stone: mix(c0, '#4a4040', 0.5), ban: c1, emb: '◆', window: c1, light: '#ffe0a0', fogC: c1 };
      if (dungeonId === 'zf') {
        defs += sky('#e8a860', '#f6d8a0');
        body += `<rect width="${W}" height="${FLOOR}" fill="url(#${P.id}sky)"/><circle cx="320" cy="60" r="28" fill="${P.orb('#fff2c0', '#ffffff')}" filter="${P.filterGlow(4)}"/>`;
        body += [...Array(6)].map((_, i) => sh(`M${80 + i * 22} ${FLOOR - 30 - i * 24} H${320 - i * 22} V${FLOOR - 6 - i * 24} H${80 + i * 22}Z`, P.vol(shade(t.stone, -0.02 * i)), 1.6)).join('');
        body += sh(`M180 ${FLOOR - 180} L220 ${FLOOR - 180} L224 ${FLOOR - 150} L176 ${FLOOR - 150}Z`, P.vol(t.stone), 1.6);
        body += [24, 376].map(x => pillar(P, x, 28, t.stone, 70)).join('') + banner(P, 60, 90, t.ban, t.emb) + banner(P, 340, 90, t.ban, t.emb);
        body += floorTiles(P, '#c8a060', false) + fog(P, '#ffe6b0', 0.3);
        break;
      }
      defs += sky(shade(t.stone, -0.18), shade(t.stone, -0.05));
      body += `<rect width="${W}" height="${FLOOR}" fill="url(#${P.id}sky)"/>` + wall(t.stone);
      body += arch(P, 200, 110, 40, t.stone, P.vol(shade(t.window!, -0.6)));
      body += [0, 1, 2].map(i => ln(`M${160 + i * 40} 70 V${FLOOR - 6}`, INK, 3)).join('') + ln(`M150 120 H250 M146 170 H254`, INK, 3);
      body += `<path d="M150 ${FLOOR} L150 95 Q150 45 200 45 Q250 45 250 95 L250 ${FLOOR}Z" fill="${P.glowFill(t.window!)}" opacity=".28"/>`;
      body += rays(P, t.light!, 200);
      body += pillar(P, 70, 34, shade(t.stone, 0.06)) + pillar(P, 330, 34, shade(t.stone, 0.06));
      body += banner(P, 120, 54, t.ban, t.emb) + banner(P, 280, 54, t.ban, t.emb);
      body += torch(P, 70, 120, dungeonId === 'strat' ? '#7aff5a' : dungeonId === 'bwl' ? '#c060ff' : '#ffb030') + torch(P, 330, 120, dungeonId === 'strat' ? '#7aff5a' : dungeonId === 'bwl' ? '#c060ff' : '#ffb030');
      if (dungeonId === 'brd' || dungeonId === 'ubrs') body += ln('M0 20 Q100 60 200 24 Q300 60 400 20', P.metal('#5a5a5a'), 4, 'stroke-dasharray="7 3"');
      if (dungeonId === 'bwl') body += [110, 290].map(x => sh(`M${x - 8} ${FLOOR} V${FLOOR - 70} H${x + 8} V${FLOOR}Z`, P.metal('#4a4a5a'), 1.4) + `<ellipse cx="${x}" cy="${FLOOR - 80}" rx="14" ry="18" fill="${P.orb('#c060ff')}" stroke="${INK}" stroke-width="1.6" filter="${P.filterGlow(2)}"/>`).join('');
      body += floorTiles(P, shade(t.stone, -0.06)) + fog(P, t.fogC!, dungeonId === 'strat' ? 0.45 : 0.25);
    }
  }
  const f = P.paintedLite(3, dungeonId.length);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" width="400" height="300" xmlns="http://www.w3.org/2000/svg">${SVG_ANIM}${P.defsSvg().replace('</defs>', defs + '</defs>')}<g filter="${f}">${body}</g><rect width="${W}" height="${H}" fill="url(#${P.id}vig)"/></svg>`;
}
