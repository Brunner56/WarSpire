// Renders SVG art once into an image URL and reuses it. The painted filters are expensive,
// so letting the browser cache the rasterised image keeps combat smooth on phones.
const cache = new Map<string, string>();
const MAX = 160;

export function svgUrl(svg: string): string {
  let url = cache.get(svg);
  if (url) { cache.delete(svg); cache.set(svg, url); return url; }
  url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  cache.set(svg, url);
  if (cache.size > MAX) {
    const [k, v] = cache.entries().next().value as [string, string];
    cache.delete(k);
    URL.revokeObjectURL(v);
  }
  return url;
}

/** <img> element for an SVG string, sized from the SVG's own width/height attributes. */
export function svgImg(svg: string, cls = 'art'): HTMLImageElement {
  const img = document.createElement('img');
  img.className = cls;
  img.alt = '';
  img.decoding = 'async';
  img.draggable = false;
  const w = /width="(\d+)"/.exec(svg)?.[1];
  const hgt = /height="(\d+)"/.exec(svg)?.[1];
  if (w) img.width = +w;
  if (hgt) img.height = +hgt;
  img.src = svgUrl(svg);
  return img;
}
