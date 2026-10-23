// Sound, music and animation settings, plus the build/version label.
import { h, modal } from './dom';
import type { App } from './app';
import type { Settings } from '../engine/save';
import { setVolumes, sfx } from './sound/audio';
import { setFxOptions } from './fx';

export function applySettings(s: Settings) {
  setVolumes({ sfx: s.sfxVol, music: s.musicVol, on: s.sound });
  setFxOptions({ motion: s.motion, fast: s.fast });
}

export function versionText(): string {
  const b = __BUILD__;
  const d = new Date(b.date);
  const when = isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return `v${b.version} · build ${b.build} (${b.sha})${when ? ' · ' + when : ''}`;
}

export function versionEl(): HTMLElement {
  return h('div', { class: 'version', title: 'Compare the build code with the latest commit on GitHub' }, '🛠 ', h('b', null, `v${__BUILD__.version}`), versionText().replace(`v${__BUILD__.version}`, ''));
}

export function settingsModal(app: App) {
  const s = app.profile.settings;
  const save = () => { applySettings(s); app.save(); };
  const slider = (label: string, key: 'musicVol' | 'sfxVol') => {
    const out = h('span', { class: 'vol' }, String(Math.round(s[key] * 100)));
    const input = h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(s[key] * 100)) }) as HTMLInputElement;
    input.addEventListener('input', () => { s[key] = Number(input.value) / 100; out.textContent = input.value; save(); });
    input.addEventListener('change', () => { if (key === 'sfxVol') sfx('hit', { school: 'physical', n: 8 }); app.render(); });
    return h('label', { class: 'row' }, h('span', null, label), input, out);
  };
  const toggle = (label: string, get: () => boolean, set: (v: boolean) => void) => {
    const btn = h('button', { class: 'btn small' }, get() ? 'On' : 'Off');
    btn.addEventListener('click', () => { set(!get()); btn.textContent = get() ? 'On' : 'Off'; save(); app.render(); });
    return h('label', { class: 'row' }, h('span', null, label), btn);
  };
  modal(h('div', { class: 'settings' },
    h('h3', null, '⚙️ Settings'),
    toggle('🔊 Sound', () => s.sound, v => { s.sound = v; }),
    slider('🎵 Music', 'musicVol'),
    slider('💥 Effects', 'sfxVol'),
    toggle('✨ Animations', () => s.motion, v => { s.motion = v; }),
    toggle('⏩ Fast combat', () => s.fast, v => { s.fast = v; }),
    h('p', { class: 'muted small' }, 'On iPhone, sound starts after your first tap. If you hear nothing, check the volume buttons.'),
    versionEl(),
  ));
}
