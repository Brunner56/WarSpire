import { h, modal } from '../dom';
import { App, registerScreen } from '../app';
import { dollSvg, itemsToDoll } from '../render/doll';
import { equippedItems } from '../../engine/character';
import { CLASS_BY_ID } from '../../data/classes';
import { RACE_BY_ID } from '../../data/races';
import { DUNGEON_BY_ID } from '../../data/dungeons';
import { wipeProfile, newProfile } from '../../engine/save';
import type { Character } from '../../engine/character';
import { setWowArt } from '../wowart';

export function charDoll(ch: Character, w = 90, extraGear?: ReturnType<typeof itemsToDoll>) {
  const gear = extraGear ?? itemsToDoll(equippedItems(ch));
  return h('div', { class: 'svgwrap', html: dollSvg({ race: ch.race, skin: ch.look.skin, hair: ch.look.hair, hairColor: ch.look.hairColor, face: ch.look.face, gear }, { w, h: Math.round(w * 1.2) }) });
}

registerScreen('title', (app: App) => {
  const p = app.profile;
  const runChar = p.run ? p.characters.find(c => c.id === p.run!.charId) : null;
  const root = h('div', { class: 'screen title-screen' },
    h('div', { class: 'title-art' },
      h('div', { class: 'logo' }, h('span', { class: 'logo-w' }, 'WAR'), h('span', { class: 'logo-s' }, 'SPIRE')),
      h('div', { class: 'tagline' }, 'A roguelike deckbuilder of the Old World'),
    ),
    runChar && p.run ? h('button', { class: 'btn primary big', onclick: () => { p.activeId = runChar.id; app.go('run'); } },
      `⚔️ Continue: ${runChar.name} — ${DUNGEON_BY_ID[p.run.dungeonId].name}`) : null,
    h('h2', { class: 'center' }, 'Choose Your Hero'),
    h('div', { class: 'char-list' },
      p.characters.map(ch => {
        const cls = CLASS_BY_ID[ch.cls];
        return h('div', { class: `char-card ${p.activeId === ch.id ? 'active' : ''}`, style: { '--cc': cls.color }, onclick: () => { p.activeId = ch.id; app.save(); app.go(p.run?.charId === ch.id ? 'run' : 'hub'); } },
          charDoll(ch, 80),
          h('div', { class: 'cc-info' },
            h('div', { class: 'cc-name', style: { color: cls.color } }, ch.name),
            h('div', { class: 'cc-sub' }, `Level ${ch.level} ${RACE_BY_ID[ch.race].name} ${cls.name}`),
            h('div', { class: 'cc-sub muted' }, `${cls.trees.find(t => t.id === ch.spec)?.name ?? ''} · ${Object.values(ch.cleared).length} dungeons cleared`),
            p.run?.charId === ch.id ? h('div', { class: 'tag' }, 'In a run') : null,
          ));
      }),
      h('div', { class: 'char-card new', onclick: () => app.go('create') }, h('div', { class: 'plus' }, '+'), h('div', null, 'Create New Hero')),
    ),
    h('div', { class: 'title-foot' },
      h('button', { class: 'btn ghost', onclick: () => howToPlay() }, '📜 How to Play'),
      h('button', { class: 'btn ghost', onclick: () => { p.settings.wowArt = !p.settings.wowArt; setWowArt(p.settings.wowArt); app.save(); app.render(); } }, `🎨 WoW Art: ${p.settings.wowArt ? 'On' : 'Off'}`),
      h('button', { class: 'btn ghost', onclick: () => {
        const close = modal(h('div', null, h('h3', null, 'Erase all progress?'), h('p', null, 'This deletes every character and run. This cannot be undone.'),
          h('button', { class: 'btn danger', onclick: () => { wipeProfile(); app.profile = newProfile(); close(); app.go('title'); } }, 'Erase Everything')));
      } }, '⚙️ Reset Save'),
    ),
  );
  return root;
});

export function howToPlay() {
  modal(h('div', { class: 'howto' },
    h('h2', null, 'How to Play'),
    h('p', null, 'Create a hero from any of the 8 classic races and 9 classes. Each race has a unique passive, and each class plays very differently: Warriors build Rage, Rogues chain Combo Points, Paladins wield Seals, Shamans drop Totems, Hunters fight beside a pet, Warlocks summon demons, and Druids shapeshift.'),
    h('h3', null, 'Runs'),
    h('p', null, 'Every run is a dungeon. Choose a path through the map — fights ⚔️, elites 💀, campfires 🔥, vendors 💰, mysteries ❓ and treasure 🎁 — and defeat the final boss. Raids are longer, multi-wing runs that unlock once you are attuned.'),
    h('h3', null, 'Combat'),
    h('p', null, 'Each turn you gain resource and draw 5 cards. Tap a card to select it, then tap an enemy (or Cast). Enemies show their intent above their heads. Block expires at the start of your turn; Shields do not.'),
    h('h3', null, 'Building your hero'),
    h('p', null, 'After fights, choose rewards that synergise with your spec. Gear raises your stats and rare items change how you play. Equipped gear appears on your character. At the end of a successful run you keep one item (two from raids) for future runs.'),
    h('p', null, 'Levelling up unlocks new abilities and talent points. Talent capstones grant signature abilities like Mortal Strike, Shadowform or Moonkin Form. Clear a dungeon to unlock Heroic ranks for greater challenge and rewards.'),
  ));
}
