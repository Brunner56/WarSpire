// Minimal DOM helpers.
type Child = Node | string | number | null | undefined | false | Child[];
type Props = Record<string, any> | null;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props, ...children: Child[]): HTMLElementTagNameMap[K];
export function h(tag: string, props?: Props, ...children: Child[]): HTMLElement;
export function h(tag: string, props: Props = null, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, children);
  return el;
}

function append(el: Node, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

export function svg(markup: string, cls = ''): HTMLElement {
  const d = document.createElement('div');
  d.className = 'svgwrap ' + cls;
  d.innerHTML = markup;
  return d;
}

export function clear(el: HTMLElement) { while (el.firstChild) el.removeChild(el.firstChild); }

export function toast(msg: string, kind: 'info' | 'good' | 'bad' = 'info') {
  const t = h('div', { class: `toast ${kind}` }, msg);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2200);
}

export function modal(content: HTMLElement, opts: { onClose?: () => void; closable?: boolean; cls?: string } = {}): () => void {
  const close = () => { bg.remove(); opts.onClose?.(); };
  const bg = h('div', { class: 'modal-bg ' + (opts.cls ?? ''), onclick: (e: Event) => { if (e.target === bg && opts.closable !== false) close(); } },
    h('div', { class: 'modal' },
      opts.closable !== false ? h('button', { class: 'modal-x', onclick: close, 'aria-label': 'Close' }, '✕') : null,
      content));
  document.body.appendChild(bg);
  return close;
}

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function esc(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }
