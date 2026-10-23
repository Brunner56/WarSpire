import './style.css';
import { App } from './ui/app';
import { setWowArt } from './ui/wowart';
import { dollSvg } from './ui/render/doll';
import { enemySvg } from './ui/render/enemyArt';
import { backdropSvg } from './ui/render/backdrop';
import { DUNGEONS } from './data/dungeons';
import './ui/screens/title';
import './ui/screens/create';
import './ui/screens/hub';
import './ui/screens/run';
import { installAudioUnlock, sfx, audioReady } from './ui/sound/audio';
import { afterRender } from './ui/sound/director';
import { applySettings } from './ui/settings';

const root = document.getElementById('app')!;
const app = new App(root);
setWowArt(app.profile.settings.wowArt);
installAudioUnlock();
applySettings(app.profile.settings);
app.afterRender = afterRender;
// tap sounds for buttons, map nodes and cards
document.addEventListener('click', e => {
  const t = (e.target as HTMLElement).closest?.('button, .mnode, .char-card, .pickable, .hand-card, .chip');
  if (t) sfx(t.matches('.hand-card, .pickable') ? 'card' : 'click');
}, true);
if (app.profile.run && app.profile.characters.some(c => c.id === app.profile.run!.charId)) {
  app.profile.activeId = app.profile.run.charId;
}
app.go('title');
(window as any).warspire = app;
(window as any).__art = { dollSvg, enemySvg, backdropSvg, DUNGEONS };
(window as any).__audio = () => audioReady()?.state ?? 'locked';

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => undefined));
}
