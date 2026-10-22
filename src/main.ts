import './style.css';
import { App } from './ui/app';
import { setWowArt } from './ui/wowart';
import './ui/screens/title';
import './ui/screens/create';
import './ui/screens/hub';
import './ui/screens/run';

const root = document.getElementById('app')!;
const app = new App(root);
setWowArt(app.profile.settings.wowArt);
if (app.profile.run && app.profile.characters.some(c => c.id === app.profile.run!.charId)) {
  app.profile.activeId = app.profile.run.charId;
}
app.go('title');
(window as any).warspire = app;

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => undefined));
}
