// Application shell: owns the profile, routes between screens and persists state.
import { clear } from './dom';
import { Profile, loadProfile, saveProfile, activeChar } from '../engine/save';
import type { Character } from '../engine/character';
import type { Combat } from '../engine/combat';

export type Screen = 'title' | 'create' | 'hub' | 'run';

type Renderer = (app: App) => HTMLElement;
const SCREENS: Partial<Record<Screen, Renderer>> = {};
export function registerScreen(s: Screen, r: Renderer) { SCREENS[s] = r; }

export class App {
  profile: Profile;
  root: HTMLElement;
  screen: Screen = 'title';
  combat: Combat | null = null;
  hubTab = 'dungeons';
  busy = false;
  scrollMemo: Record<string, number> = {};
  /** Called after every render (music and ambient sounds). */
  afterRender: (app: App) => void = () => undefined;

  constructor(root: HTMLElement) {
    this.root = root;
    this.profile = loadProfile();
  }

  char(): Character {
    const c = activeChar(this.profile);
    if (!c) throw new Error('No active character');
    return c;
  }
  hasChar() { return !!activeChar(this.profile); }

  save() { saveProfile(this.profile); }

  go(s: Screen) {
    this.screen = s;
    this.render();
    window.scrollTo(0, 0);
  }

  render() {
    const r = SCREENS[this.screen];
    if (!r) return;
    const scrollers = this.root.querySelectorAll<HTMLElement>('[data-scroll]');
    scrollers.forEach(el => { this.scrollMemo[el.dataset.scroll!] = el.scrollTop; });
    clear(this.root);
    this.root.appendChild(r(this));
    this.root.querySelectorAll<HTMLElement>('[data-scroll]').forEach(el => {
      const v = this.scrollMemo[el.dataset.scroll!];
      if (v !== undefined) el.scrollTop = v;
    });
    this.afterRender(this);
  }
}
