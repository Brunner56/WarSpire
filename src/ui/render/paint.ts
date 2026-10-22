// Painterly SVG helpers for the Warcraft III-inspired art style:
// bold dark outlines, gradient-shaded volumes, metallic speculars and rim lights.

export const shade = (hex: string, amt: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r + amt * 255)));
  g = Math.max(0, Math.min(255, Math.round(g + amt * 255)));
  b = Math.max(0, Math.min(255, Math.round(b + amt * 255)));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const mix = (a: string, b: string, t: number) => {
  const p = (x: string) => { const n = parseInt(x.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);
};

export const INK = '#120a04';

let seq = 0;

/** Collects <defs> for one SVG and hands out fill references. */
export class Paint {
  id = 'p' + (seq++).toString(36);
  private defs: string[] = [];
  private cache = new Map<string, string>();
  private n = 0;

  private key(k: string, make: (id: string) => string): string {
    const hit = this.cache.get(k);
    if (hit) return hit;
    const id = `${this.id}_${this.n++}`;
    this.defs.push(make(id));
    const ref = `url(#${id})`;
    this.cache.set(k, ref);
    return ref;
  }

  /** Cel-shaded volume: hard-edged light / base / shadow bands, light from top-left. */
  vol(c: string, strength = 1): string {
    return this.key(`vol${c}${strength}`, id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, 0.13 * strength)}"/><stop offset=".34" stop-color="${shade(c, 0.13 * strength)}"/><stop offset=".34" stop-color="${c}"/><stop offset=".68" stop-color="${c}"/><stop offset=".68" stop-color="${shade(c, -0.2 * strength)}"/><stop offset="1" stop-color="${shade(c, -0.26 * strength)}"/></linearGradient>`);
  }
  /** Cel-shaded cylinder (limbs, poles). */
  cyl(c: string): string {
    return this.key(`cyl${c}`, id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(c, 0.12)}"/><stop offset=".3" stop-color="${shade(c, 0.12)}"/><stop offset=".3" stop-color="${c}"/><stop offset=".66" stop-color="${c}"/><stop offset=".66" stop-color="${shade(c, -0.24)}"/><stop offset="1" stop-color="${shade(c, -0.28)}"/></linearGradient>`);
  }
  /** Painted metal: hard specular streak and dark core. */
  metal(c: string): string {
    return this.key(`met${c}`, id => `<linearGradient id="${id}" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${shade(c, 0.22)}"/><stop offset=".22" stop-color="${shade(c, 0.22)}"/><stop offset=".22" stop-color="${shade(c, 0.42)}"/><stop offset=".3" stop-color="${shade(c, 0.42)}"/><stop offset=".3" stop-color="${c}"/><stop offset=".62" stop-color="${c}"/><stop offset=".62" stop-color="${shade(c, -0.25)}"/><stop offset="1" stop-color="${shade(c, -0.32)}"/></linearGradient>`);
  }
  /** Radial glow/sphere. */
  orb(c: string, hot = '#ffffff'): string {
    return this.key(`orb${c}${hot}`, id => `<radialGradient id="${id}" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="${hot}"/><stop offset=".25" stop-color="${shade(c, 0.25)}"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.35)}"/></radialGradient>`);
  }
  /** Fading glow (transparent edge). */
  glowFill(c: string): string {
    return this.key(`gl${c}`, id => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".85"/><stop offset=".45" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`);
  }
  /** Chainmail ring texture. */
  mail(c: string): string {
    return this.key(`mail${c}`, id => `<pattern id="${id}" width="4" height="3.4" patternUnits="userSpaceOnUse"><rect width="4" height="3.4" fill="${shade(c, -0.12)}"/><path d="M0 1.7 a2 1.7 0 0 1 4 0" fill="none" stroke="${shade(c, 0.25)}" stroke-width=".7"/><path d="M-2 3.4 a2 1.7 0 0 1 4 0 M2 3.4 a2 1.7 0 0 1 4 0" fill="none" stroke="${shade(c, 0.08)}" stroke-width=".6"/></pattern>`);
  }
  /** Overlapping scales (dragons, serpents, murlocs). */
  scales(c: string): string {
    return this.key(`sc${c}`, id => `<pattern id="${id}" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="${c}"/><path d="M0 6 Q4 0 8 6 M-4 3 Q0 -3 4 3 M4 3 Q8 -3 12 3" fill="none" stroke="${shade(c, -0.22)}" stroke-width=".9"/><path d="M1.5 5 Q4 1.5 6.5 5" fill="none" stroke="${shade(c, 0.18)}" stroke-width=".6"/></pattern>`);
  }
  /** Fur/hair strands. */
  fur(c: string): string {
    return this.key(`fur${c}`, id => `<pattern id="${id}" width="6" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="6" height="8" fill="${c}"/><path d="M1 0 L1.6 8 M4 0 L3.4 8" stroke="${shade(c, -0.18)}" stroke-width=".8"/><path d="M2.6 0 L2.8 6" stroke="${shade(c, 0.14)}" stroke-width=".5"/></pattern>`);
  }
  /** Stone bricks for backdrops. */
  bricks(c: string, w = 40, hgt = 20): string {
    return this.key(`br${c}${w}`, id => `<pattern id="${id}" width="${w}" height="${hgt * 2}" patternUnits="userSpaceOnUse"><rect width="${w}" height="${hgt * 2}" fill="${c}"/><path d="M0 0 H${w} M0 ${hgt} H${w} M0 ${hgt * 2} H${w} M${w / 2} 0 V${hgt} M0 ${hgt} V${hgt * 2} M${w} ${hgt} V${hgt * 2}" stroke="${shade(c, -0.12)}" stroke-width="1.6"/><path d="M1 1.5 H${w / 2 - 2} M${w / 2 + 1} ${hgt + 1.5} H${w - 2}" stroke="${shade(c, 0.07)}" stroke-width="1"/></pattern>`);
  }
  filterGlow(dev = 2.4): string {
    return this.key(`fg${dev}`, id => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${dev}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  }
  filterBlur(dev = 3): string {
    return this.key(`fb${dev}`, id => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${dev}"/></filter>`);
  }
  defsSvg(): string { return `<defs>${this.defs.join('')}</defs>`; }
}

/** Outlined shape helper. */
export const sh = (d: string, fill: string, sw = 1.6, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
/** Unoutlined detail line. */
export const ln = (d: string, color: string, w = 1, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
/** Tapered limb between two points with radii r1 → r2, as an outlined path. */
export function limb(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number): string {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const a = [x1 + nx * r1, y1 + ny * r1], b = [x2 + nx * r2, y2 + ny * r2], c = [x2 - nx * r2, y2 - ny * r2], d = [x1 - nx * r1, y1 - ny * r1];
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} A${r2} ${r2} 0 0 1 ${c[0].toFixed(1)} ${c[1].toFixed(1)} L${d[0].toFixed(1)} ${d[1].toFixed(1)} A${r1} ${r1} 0 0 1 ${a[0].toFixed(1)} ${a[1].toFixed(1)}Z`;
}
export const rivet = (x: number, y: number, r = 1.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8dcc0" stroke="${INK}" stroke-width=".6"/>`;

/** Mirror an absolute-command path (M L Q C T S H V Z) across the vertical line x = cx. */
export function mirror(d: string, cx = 100): string {
  const toks = d.match(/[MLQCTSHVZ]|-?\d*\.?\d+/gi) ?? [];
  let out = '', cmd = '', rel = false, i = 0;
  for (const t of toks) {
    if (/[A-Z]/i.test(t)) { rel = t !== t.toUpperCase(); cmd = t.toUpperCase(); out += ' ' + t; i = 0; continue; }
    const v = parseFloat(t);
    const isX = cmd === 'H' || (cmd !== 'V' && i % 2 === 0);
    out += ' ' + (isX ? (rel ? -v : +(2 * cx - v).toFixed(2)) : v);
    i++;
  }
  return out.trim();
}

/** Short sketchy hatch strokes inside a shadow area. */
export const hatch = (x: number, y: number, n: number, len = 6, gap = 3, ang = 40) =>
  [...Array(n)].map((_, i) => `<path d="M${x + i * gap} ${y} l${(Math.cos((ang * Math.PI) / 180) * len).toFixed(1)} ${(Math.sin((ang * Math.PI) / 180) * len).toFixed(1)}" stroke="${INK}" stroke-width=".8" opacity=".45" stroke-linecap="round"/>`).join('');
