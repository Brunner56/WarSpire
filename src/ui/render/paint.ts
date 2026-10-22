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

export const INK = '#1c0f0a';
const WARM = '#fff0c4', COOL = '#2c1840';
/** Painterly light/shadow: highlights lean warm, shadows lean cool purple (never plain grey). */
export const lit = (c: string, a: number) => mix(shade(c, a), WARM, 0.18);
export const dim = (c: string, a: number) => mix(shade(c, -a), COOL, 0.28);

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

  /** Painted volume: warm lit side, mid tone, cool shadow side, with soft brushy transitions. */
  vol(c: string, strength = 1): string {
    return this.key(`vol${c}${strength}`, id => `<linearGradient id="${id}" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${lit(c, 0.14 * strength)}"/><stop offset=".3" stop-color="${lit(c, 0.08 * strength)}"/><stop offset=".38" stop-color="${c}"/><stop offset=".64" stop-color="${c}"/><stop offset=".74" stop-color="${dim(c, 0.16 * strength)}"/><stop offset="1" stop-color="${dim(c, 0.3 * strength)}"/></linearGradient>`);
  }
  /** Painted cylinder (limbs, poles). */
  cyl(c: string): string {
    return this.key(`cyl${c}`, id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${lit(c, 0.1)}"/><stop offset=".28" stop-color="${lit(c, 0.12)}"/><stop offset=".36" stop-color="${c}"/><stop offset=".62" stop-color="${c}"/><stop offset=".74" stop-color="${dim(c, 0.2)}"/><stop offset="1" stop-color="${dim(c, 0.3)}"/></linearGradient>`);
  }
  /** Painted metal: warm specular streak, cool dark core. */
  metal(c: string): string {
    return this.key(`met${c}`, id => `<linearGradient id="${id}" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${lit(c, 0.2)}"/><stop offset=".18" stop-color="${lit(c, 0.24)}"/><stop offset=".26" stop-color="${lit(c, 0.42)}"/><stop offset=".33" stop-color="${lit(c, 0.18)}"/><stop offset=".42" stop-color="${c}"/><stop offset=".62" stop-color="${c}"/><stop offset=".72" stop-color="${dim(c, 0.24)}"/><stop offset="1" stop-color="${dim(c, 0.34)}"/></linearGradient>`);
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
  /**
   * The hand-painted look: wobbles every edge like an inked brush line, mottles the paint with
   * soft brush blotches, and dusts it with paper grain, keeping everything inside the silhouette.
   */
  painted(wobble = 2.6, seed = 4): string {
    return this.key(`paint${wobble}${seed}`, id => `<filter id="${id}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="wob"/>
      <feDisplacementMap in="SourceGraphic" in2="wob" scale="${wobble}" xChannelSelector="R" yChannelSelector="G" result="ink"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="3" seed="${seed + 9}" result="stroke"/>
      <feColorMatrix in="stroke" type="matrix" values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  2.2 0 0 0 -1.05" result="lightA"/>
      <feColorMatrix in="stroke" type="matrix" values="0 0 0 0 .16  0 0 0 0 .08  0 0 0 0 .2  -2.2 0 0 0 1.05" result="darkA"/>
      <feComposite in="lightA" in2="ink" operator="in" result="lightIn"/>
      <feComposite in="darkA" in2="ink" operator="in" result="darkIn"/>
      <feBlend in="lightIn" in2="ink" mode="soft-light" result="p1"/>
      <feBlend in="darkIn" in2="p1" mode="multiply" result="p2"/>
      <feComposite in="p2" in2="ink" operator="arithmetic" k2=".55" k3=".45" result="p3"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="${seed + 3}" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .08  0 0 -1.3 0 .62" result="grainA"/>
      <feComposite in="grainA" in2="ink" operator="in" result="grainIn"/>
      <feComposite in="grainIn" in2="p3" operator="over" result="grained"/>
      <feMorphology in="ink" operator="erode" radius="2.2" result="core"/>
      <feGaussianBlur in="core" stdDeviation="2.6" result="coreSoft"/>
      <feComposite in="ink" in2="coreSoft" operator="out" result="rimMask"/>
      <feFlood flood-color="#2a1430" flood-opacity=".38"/>
      <feComposite in2="rimMask" operator="in" result="rim"/>
      <feComposite in="rim" in2="grained" operator="over" result="shaded"/>
      <feComposite in="shaded" in2="ink" operator="in" result="body"/>
      <feMorphology in="ink" operator="dilate" radius="${(wobble * 0.55).toFixed(1)}" result="fat"/>
      <feFlood flood-color="${INK}"/>
      <feComposite in2="fat" operator="in" result="contour"/>
      <feMerge><feMergeNode in="contour"/><feMergeNode in="body"/></feMerge>
    </filter>`);
  }
  /** Cheaper painted look for big scenes: wobbly ink and brush streaks only. */
  paintedLite(wobble = 3, seed = 4): string {
    return this.key(`plite${wobble}${seed}`, id => `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="1" seed="${seed}" result="wob"/>
      <feDisplacementMap in="SourceGraphic" in2="wob" scale="${wobble}" xChannelSelector="R" yChannelSelector="G" result="ink"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.015 0.07" numOctaves="2" seed="${seed + 9}" result="stroke"/>
      <feColorMatrix in="stroke" type="matrix" values="0 0 0 0 .14  0 0 0 0 .08  0 0 0 0 .18  -2 0 0 0 1" result="darkA"/>
      <feComposite in="darkA" in2="ink" operator="in" result="darkIn"/>
      <feBlend in="darkIn" in2="ink" mode="multiply"/>
    </filter>`);
  }
  defsSvg(): string { return `<defs>${this.defs.join('')}</defs>`; }
}

/** Outlined shape helper. */
/** Outlined shape with a second, looser sketch line riding the ink, like a pencil under-drawing. */
export const sh = (d: string, fill: string, sw = 1.6, extra = '') => sw <= 0 || fill === 'none'
  ? `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${Math.max(sw, 0)}" stroke-linejoin="round" ${extra}/>`
  : `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/><path d="${d}" fill="none" stroke="${INK}" stroke-width="${(sw * 0.38).toFixed(2)}" stroke-linejoin="round" opacity=".5" transform="translate(${(sw * 0.45).toFixed(2)} ${(-sw * 0.35).toFixed(2)})"/>`;

/** Animations that must live inside the SVG (it is rendered as an image). */
export const SVG_ANIM = `<style>.flicker,.flame{animation:fl .7s infinite alternate;transform-box:fill-box;transform-origin:center bottom}@keyframes fl{to{opacity:.82;transform:scaleY(1.06)}}.aura-pulse{animation:ap 2s infinite}@keyframes ap{50%{opacity:.3}}.float{animation:fo 2s infinite alternate}@keyframes fo{to{transform:translateY(-4px)}}</style>`;
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
