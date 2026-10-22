import { h, toast } from '../dom';
import { App, registerScreen } from '../app';
import { RACES, RACE_BY_ID } from '../../data/races';
import { CLASSES, CLASS_BY_ID } from '../../data/classes';
import { PETS, HUNTER_PETS, CLASS_MECHANIC_TEXT } from '../../data/mechanics';
import { STARTER_GEAR, makeItem } from '../../data/items';
import { dollSvg, itemsToDoll } from '../render/doll';
import { createCharacter } from '../../engine/save';
import { wowIcon, RACE_ICONS, CLASS_ICONS, PET_ICONS } from '../wowart';
import type { ClassId, RaceId } from '../../engine/types';

const NAMES: Record<RaceId, string[]> = {
  human: ['Aldric', 'Bryndis', 'Cedric', 'Elaine', 'Gareth', 'Rowena', 'Tobias', 'Lyra'],
  dwarf: ['Brokk', 'Durna', 'Thorgrim', 'Hilda', 'Magni', 'Ygrid', 'Brann', 'Kurdra'],
  nightelf: ['Aelyndra', 'Thalorien', 'Shandris', 'Faelan', 'Ilyria', 'Vaeris', 'Nymira', 'Talandor'],
  gnome: ['Fizzwick', 'Tinkra', 'Nobbin', 'Sprocket', 'Gimbel', 'Wizzle', 'Bixie', 'Cogsworth'],
  orc: ['Grommok', 'Durza', 'Karnag', 'Ogra', 'Thrall', 'Zugra', 'Morgul', 'Garra'],
  undead: ['Mortis', 'Sylvara', 'Grimwald', 'Vespera', 'Ashcroft', 'Lenore', 'Hollis', 'Morwen'],
  tauren: ['Hamuul', 'Taima', 'Grokk', 'Mahala', 'Tahu', 'Yona', 'Bravehoof', 'Kaya'],
  troll: ["Zul'jin", 'Vanira', "Jin'do", 'Zalia', 'Rokhan', 'Sen', "Tal'gor", 'Mazi'],
};

interface Draft { race: RaceId; cls: ClassId; spec: string; skin: number; hair: number; hairColor: number; face: number; name: string; pet: string }
let draft: Draft | null = null;

registerScreen('create', (app: App) => {
  if (!draft) draft = { race: 'human', cls: 'warrior', spec: 'arms', skin: 0, hair: 0, hairColor: 0, face: 0, name: NAMES.human[Math.floor(Math.random() * 8)], pet: 'wolf' };
  const d = draft;
  const race = RACE_BY_ID[d.race];
  const cls = CLASS_BY_ID[d.cls];
  const rerender = () => app.render();

  const preview = () => {
    const gear = itemsToDoll(STARTER_GEAR[d.cls].map((t, i) => makeItem(t, i)));
    return h('div', { class: 'svgwrap', html: dollSvg({ race: d.race, skin: d.skin, hair: d.hair, hairColor: d.hairColor, face: d.face, gear }, { w: 150, h: 190, pet: d.cls === 'hunter' ? PETS[d.pet].icon : undefined }) });
  };

  const stepper = (label: string, key: 'skin' | 'hair' | 'hairColor' | 'face', max: number) =>
    h('div', { class: 'stepper' },
      h('button', { class: 'btn small', onclick: () => { d[key] = (d[key] + max - 1) % max; rerender(); } }, '◀'),
      h('span', null, `${label} ${d[key] + 1}`),
      h('button', { class: 'btn small', onclick: () => { d[key] = (d[key] + 1) % max; rerender(); } }, '▶'));

  return h('div', { class: 'screen create-screen' },
    h('div', { class: 'topnav' }, h('button', { class: 'btn ghost', onclick: () => { draft = null; app.go('title'); } }, '← Back'), h('h2', null, 'Create Your Hero')),
    h('div', { class: 'create-preview' },
      preview(),
      h('div', { class: 'cp-info' },
        h('div', { class: 'cp-name', style: { color: cls.color } }, d.name || '—'),
        h('div', null, `${race.name} ${cls.name}`),
        h('div', { class: `faction ${race.faction.toLowerCase()}` }, race.faction),
      ),
    ),
    h('div', { class: 'panel' },
      h('h3', null, 'Race'),
      h('div', { class: 'grid4' }, RACES.map(r => h('button', { class: `pick ${r.id === d.race ? 'on' : ''} ${r.faction.toLowerCase()}`, onclick: () => {
        d.race = r.id; d.skin = 0; d.hairColor = 0; d.name = NAMES[r.id][Math.floor(Math.random() * 8)];
        if (!r.classes.includes(d.cls)) { d.cls = r.classes[0]; d.spec = CLASS_BY_ID[d.cls].trees[0].id; }
        rerender();
      } }, h('span', { class: 'pick-icon' }, wowIcon(RACE_ICONS[r.id], r.icon, 'pimg')), h('span', null, r.name)))),
      h('div', { class: 'passive' }, h('b', null, race.passiveName), h('div', null, race.passive)),
    ),
    h('div', { class: 'panel' },
      h('h3', null, 'Class'),
      h('div', { class: 'grid3' }, CLASSES.map(c => {
        const ok = race.classes.includes(c.id);
        return h('button', { class: `pick ${c.id === d.cls ? 'on' : ''} ${ok ? '' : 'locked'}`, style: { '--cc': c.color }, onclick: () => {
          if (!ok) { toast(`${race.name}s cannot be ${c.name}s in the Old World.`, 'bad'); return; }
          d.cls = c.id; d.spec = c.trees[0].id; rerender();
        } }, h('span', { class: 'pick-icon' }, wowIcon(CLASS_ICONS[c.id], c.icon, 'pimg')), h('span', { style: { color: ok ? c.color : undefined } }, c.name));
      })),
      h('div', { class: 'passive' }, h('div', null, cls.desc), h('div', { class: 'muted small' }, CLASS_MECHANIC_TEXT[cls.id]), h('div', { class: 'muted small' }, `Armor: ${cls.armor} · Base HP ${cls.hp}`)),
    ),
    h('div', { class: 'panel' },
      h('h3', null, 'Specialization'),
      h('div', { class: 'grid3' }, cls.trees.map(t => h('button', { class: `pick tall ${t.id === d.spec ? 'on' : ''}`, onclick: () => { d.spec = t.id; rerender(); } },
        h('span', { class: 'pick-icon' }, t.icon), h('b', null, t.name), h('span', { class: 'muted small' }, t.role)))),
      h('div', { class: 'passive' }, cls.trees.find(t => t.id === d.spec)!.desc, h('div', { class: 'muted small' }, 'Your spec shapes your starting deck and the rewards you are offered. You can change it any time between runs.')),
    ),
    d.cls === 'hunter' ? h('div', { class: 'panel' },
      h('h3', null, 'Animal Companion'),
      h('div', { class: 'grid4' }, HUNTER_PETS.map(pid => h('button', { class: `pick ${pid === d.pet ? 'on' : ''}`, onclick: () => { d.pet = pid; rerender(); } }, h('span', { class: 'pick-icon' }, wowIcon(PET_ICONS[pid], PETS[pid].icon, 'pimg')), h('span', null, PETS[pid].name)))),
      h('div', { class: 'passive' }, PETS[d.pet].desc),
    ) : null,
    h('div', { class: 'panel' },
      h('h3', null, 'Appearance'),
      h('div', { class: 'steppers' }, stepper('Skin', 'skin', race.skins.length), stepper('Hair', 'hair', 6), stepper('Hair Color', 'hairColor', race.hairColors.length), stepper('Features', 'face', 4)),
      h('h3', null, 'Name'),
      h('div', { class: 'name-row' },
        h('input', { class: 'name-input', maxlength: '14', value: d.name, oninput: (e: Event) => { d.name = (e.target as HTMLInputElement).value.replace(/[^A-Za-z' -]/g, ''); } }),
        h('button', { class: 'btn small', onclick: () => { d.name = NAMES[d.race][Math.floor(Math.random() * 8)]; rerender(); } }, '🎲')),
    ),
    h('button', { class: 'btn primary big', onclick: () => {
      const name = d.name.trim();
      if (name.length < 2) { toast('Choose a name of at least 2 letters.', 'bad'); return; }
      createCharacter(app.profile, { name, race: d.race, cls: d.cls, spec: d.spec, look: { skin: d.skin, hair: d.hair, hairColor: d.hairColor, face: d.face }, pet: d.cls === 'hunter' ? d.pet : undefined });
      draft = null;
      app.save();
      app.hubTab = 'dungeons';
      app.go('hub');
    } }, 'Enter Azeroth'),
  );
});
