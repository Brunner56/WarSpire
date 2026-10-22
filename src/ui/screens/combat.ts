import { h, modal, sleep, toast } from '../dom';
import type { App } from '../app';
import { topBar, deckModal } from './run';
import { cardEl, showCard, hpBar, statusRow } from '../components';
import { enemySvg } from '../render/enemyArt';
import { dollSvg, itemsToDoll } from '../render/doll';
import { backdropSvg } from '../render/backdrop';
import { svgImg } from '../render/toImg';
import { DUNGEON_BY_ID } from '../../data/dungeons';
import { wowIcon, localArt, PET_ICONS } from '../wowart';
import { CLASS_BY_ID } from '../../data/classes';
const CLASS_COLOR = Object.fromEntries(Object.values(CLASS_BY_ID).map(c => [c.id, c.color]));
import { getCard, cardActions } from '../../data/cards';
import { SEALS, TOTEMS, FORMS } from '../../data/mechanics';
import { describeCard } from '../../engine/describe';
import type { Combat, CEvent } from '../../engine/combat';
import type { Character } from '../../engine/character';
import { RunState, resolveCombat, gearList } from '../../engine/run';
import type { Enemy, EnemyMove, IntentKind } from '../../engine/types';

let selected: number | null = null;
let potionSel: number | null = null;
let lastCombat: Combat | null = null;

const INTENT_ICON: Record<IntentKind, string> = { attack: '⚔️', defend: '🛡️', buff: '💪', debuff: '🌀', atkdef: '⚔️', atkdebuff: '⚔️', summon: '📯', stun: '💫', unknown: '❔', special: '⚠️' };
const SCHOOL_CLASS: Record<string, string> = { physical: 'phys', holy: 'holy', fire: 'fire', frost: 'frost', arcane: 'arcane', shadow: 'shadow', nature: 'nature' };

function intentEl(c: Combat, e: Enemy) {
  if (e.st.stun || e.st.poly) return h('div', { class: 'intent stun' }, h('span', null, e.st.poly ? '🐑' : '💫'), h('small', null, 'Stunned'));
  const m = e.move;
  if (!m) return h('div', { class: 'intent' });
  const k = c.intentOf(m);
  const atks = m.acts.filter(a => a.k === 'atk') as { k: 'atk'; n: number; hits?: number }[];
  let num = '';
  if (atks.length) {
    const a = atks[0];
    const dmg = c.enemyHitDamage(e, a.n);
    num = a.hits && a.hits > 1 ? `${dmg}×${a.hits}` : String(dmg);
  }
  const extra = k === 'atkdef' ? '🛡️' : k === 'atkdebuff' ? '🌀' : '';
  return h('div', { class: `intent k-${k} ${atks.length && c.enemyHitDamage(e, atks[0].n) * (atks[0].hits ?? 1) >= 20 ? 'big' : ''}` },
    h('span', null, INTENT_ICON[k] + extra), num ? h('b', null, num) : null, h('small', null, m.name));
}

function moveDesc(c: Combat, e: Enemy, m: EnemyMove): string {
  return m.acts.map(a => {
    switch (a.k) {
      case 'atk': return `Attack for ${c.enemyHitDamage(e, a.n)}${a.hits && a.hits > 1 ? ` × ${a.hits}` : ''}.`;
      case 'block': return `Gain ${Math.round(a.n * c.hpScale)} Block.`;
      case 'blockAll': return `All enemies gain ${Math.round(a.n * c.hpScale)} Block.`;
      case 'buff': return `Gain ${a.n} ${a.s === 'str' ? 'Attack Power' : a.s}.`;
      case 'buffAll': return `All enemies gain ${a.n} ${a.s === 'str' ? 'Attack Power' : a.s}.`;
      case 'debuff': return `Inflict ${a.n} ${a.s}.`;
      case 'heal': return `Heal ${Math.round(a.n * c.hpScale)}.`;
      case 'summon': return `Summon reinforcements.`;
      case 'card': return `Shuffle ${a.n} ${getCard(a.id).name} into your ${a.to}.`;
      case 'fn': return a.t ?? 'Something unusual.';
    }
  }).join(' ');
}

function enemyInfo(c: Combat, e: Enemy) {
  modal(h('div', null,
    h('h3', null, e.name, e.def.boss ? ' 👑' : e.def.elite ? ' 💀' : ''),
    e.def.lore ? h('p', { class: 'muted' }, e.def.lore) : null,
    e.move ? h('p', null, h('b', null, `Intends: ${e.move.name}. `), moveDesc(c, e, e.move)) : null,
    e.def.phases ? h('p', { class: 'muted small' }, `Phases at ${e.def.phases.map(p => p.pct + '%').join(', ')} health.`) : null,
    Object.keys(e.st).length ? h('div', null, statusRow(e)) : null,
  ));
}

function enemyArtEl(e: Enemy): HTMLElement {
  const el = h('div', { class: 'eart' }, svgImg(enemySvg(e.def.art)));
  // Private art override: public/wow/enemies/<enemy id>.png
  localArt(`enemies/${e.def.id}.png`, url => { el.innerHTML = ''; el.appendChild(h('img', { class: 'eimg', src: url, alt: e.name })); });
  return el;
}

function backdropEl(dungeonId: string): HTMLElement {
  const el = h('div', { class: 'backdrop' }, svgImg(backdropSvg(dungeonId, ...DUNGEON_BY_ID[dungeonId].colors), 'bdimg'));
  // Private art override: public/wow/backdrops/<dungeon id>.jpg
  localArt(`backdrops/${dungeonId}.jpg`, url => { el.innerHTML = ''; el.style.background = `center bottom / cover no-repeat url(${url})`; el.classList.add('photo'); });
  return el;
}

function classMech(c: Combat): HTMLElement | null {
  const p = c.p;
  const parts: (HTMLElement | null)[] = [];
  if (p.cls === 'rogue' || (p.cls === 'druid' && (p.form === 'cat' || p.cp > 0))) parts.push(h('div', { class: 'cp' }, [0, 1, 2, 3, 4].map(i => h('span', { class: i < p.cp ? 'on' : '' }))));
  if (p.cls === 'warlock') parts.push(h('div', { class: 'shards', title: 'Soul Shards' }, [0, 1, 2, 3, 4].map(i => h('span', { class: i < p.shards ? 'on' : '' }, '◆'))));
  if (p.seal) parts.push(h('div', { class: 'mech', onclick: () => modal(h('div', null, h('h3', null, SEALS[p.seal!].name), h('p', null, SEALS[p.seal!].desc))) }, SEALS[p.seal].icon, h('small', null, 'Seal')));
  for (const [el, t] of Object.entries(p.totems)) if (t) parts.push(h('div', { class: `mech totem ${el}`, onclick: () => modal(h('div', null, h('h3', null, TOTEMS[t].name), h('p', null, TOTEMS[t].desc))) }, TOTEMS[t].icon));
  if (p.form !== 'caster') parts.push(h('div', { class: 'mech', onclick: () => modal(h('div', null, h('h3', null, FORMS[p.form].name), h('p', null, FORMS[p.form].desc))) }, FORMS[p.form].icon, h('small', null, FORMS[p.form].name.split(' ')[0])));
  if (p.pet) parts.push(h('div', { class: 'mech pet' }, wowIcon(PET_ICONS[p.pet.id], p.pet.icon, 'micon'), h('small', null, p.pet.name)));
  if (c.mem.chicken) parts.push(h('div', { class: 'mech' }, '🐔'));
  return parts.length ? h('div', { class: 'mechrow' }, parts) : null;
}

export function renderCombat(app: App, run: RunState, ch: Character, c: Combat): HTMLElement {
  if (lastCombat !== c) { selected = null; potionSel = null; lastCombat = c; }
  const rr = () => app.render();
  const selCard = selected !== null ? c.hand[selected] : null;
  const selDef = selCard ? getCard(selCard.id) : null;
  const needT = selCard ? c.needsTarget(selDef!, selCard.up) && c.alive().length > 1 : false;
  const potNeedsT = potionSel !== null && c.potions[potionSel] ? c.needsTarget(getCard(c.potions[potionSel]!), false) && c.alive().length > 1 : false;

  const act = async (fn: () => void) => {
    if (app.busy) return;
    fn();
    rr();
    floaters(c);
    if (c.over) await endCombat(app, run, ch, c);
  };

  const enemies = h('div', { class: 'enemies' }, c.enemies.filter(e => !e.dead || c.events.some(ev => ev.uid === e.uid)).map(e => {
    const targetable = (needT || potNeedsT) && !e.dead;
    return h('div', {
      class: `enemy ${e.dead ? 'dead' : ''} ${targetable ? 'targetable' : ''} ${e.def.boss ? 'boss' : ''} ${e.def.elite ? 'elite' : ''}`,
      'data-uid': String(e.uid),
      onclick: () => {
        if (e.dead) return;
        if (selected !== null && selCard) {
          const i = selected;
          act(() => { if (c.playCard(i, e.uid)) selected = null; });
        } else if (potionSel !== null) {
          const i = potionSel;
          act(() => { c.usePotion(i, e.uid); potionSel = null; });
        } else enemyInfo(c, e);
      },
    },
      intentEl(c, e),
      enemyArtEl(e),
      h('div', { class: 'ename' }, e.name),
      hpBar(e.hp, e.maxHp, e.block),
      statusRow(e),
    );
  }));

  const p = c.p;
  const gear = itemsToDoll(gearList(run));
  const player = h('div', { class: `player ${(selCard && !needT) ? 'castzone' : ''}`, 'data-uid': '1', onclick: () => {
    if (selected !== null && selCard && !needT) { const i = selected; act(() => { if (c.playCard(i)) selected = null; }); }
  } },
    h('div', { class: 'pdoll' }, svgImg(dollSvg({ race: ch.race, skin: ch.look.skin, hair: ch.look.hair, hairColor: ch.look.hairColor, face: ch.look.face, gear, team: CLASS_COLOR[ch.cls], aura: p.form === 'moonkin' ? '#8acfff' : p.st.shadowform ? '#7a3aaa' : undefined }, { w: 178, h: 216, pet: p.pet?.icon }))),
    h('div', { class: 'pinfo' },
      hpBar(p.hp, p.maxHp, p.block, p.st.absorb ?? 0),
      statusRow(p),
      classMech(c),
    ),
  );

  const resOrb = h('div', { class: `res-orb r-${p.resName.toLowerCase()}` }, h('b', null, String(p.res)), h('small', null, p.resName === 'Rage' ? `/${10}` : `/${p.resMax}`));

  const hand = h('div', { class: `hand n${c.hand.length}` }, c.hand.map((ci, i) => {
    const ok = c.canPlay(ci).ok;
    const t = selected === i ? undefined : undefined;
    return h('div', { class: `hand-card ${selected === i ? 'sel' : ''}`, style: { '--i': String(i), '--n': String(c.hand.length) } },
      cardEl(ci, { c, cost: c.costOf(ci), dim: !ok, selected: selected === i, target: t, onClick: () => {
        if (app.busy) return;
        potionSel = null;
        if (selected === i) {
          const def = getCard(ci.id);
          if (!c.needsTarget(def, ci.up) || c.alive().length === 1) { act(() => { if (c.playCard(i)) selected = null; }); return; }
          selected = null; rr(); return;
        }
        if (!ok) { toast(c.canPlay(ci).why ?? 'Cannot play', 'bad'); }
        selected = i; rr();
      } }));
  }));

  const selBar = selCard ? h('div', { class: 'selbar' },
    h('span', null, h('span', { class: 'sb-name' }, selDef!.name + (selCard.up ? '+' : '') + ': '), h('span', { class: 'sb-text', html: describeCard(selDef!, selCard.up, { c }).text.replace(/\[\+(\d+)\]/g, '<b class="up">$1</b>').replace(/\[-(\d+)\]/g, '<b class="down">$1</b>') }),
      needT ? h('div', { class: 'muted small' }, '🎯 Tap an enemy to target') : null),
    !needT ? h('button', { class: 'btn primary small', onclick: () => { const i = selected!; act(() => { if (c.playCard(i)) selected = null; }); } }, 'Cast') : null,
    h('button', { class: 'btn ghost small', onclick: () => showCard(selCard) }, 'ⓘ'),
    h('button', { class: 'btn ghost small', onclick: () => { selected = null; rr(); } }, '✕'),
  ) : potionSel !== null ? h('div', { class: 'selbar' }, h('span', null, '🎯 Choose a target for your potion'), h('button', { class: 'btn ghost small', onclick: () => { potionSel = null; rr(); } }, '✕')) : null;

  const pots = h('div', { class: 'cpots' }, c.potions.map((pid, i) => h('button', { class: `pot ${pid ? '' : 'empty'} ${potionSel === i ? 'sel' : ''}`, onclick: () => {
    if (!pid || app.busy) return;
    const def = getCard(pid);
    const close = modal(h('div', null, h('h3', null, `${def.icon} ${def.name}`), h('p', null, def.text ?? describeCard(def, false).text),
      h('button', { class: 'btn primary', onclick: () => {
        close();
        if (c.needsTarget(def, false) && c.alive().length > 1) { potionSel = i; selected = null; rr(); return; }
        act(() => { c.usePotion(i); });
      } }, 'Drink / Use')));
  } }, pid ? getCard(pid).icon : '·')));

  const endBtn = h('button', { class: `btn endturn ${c.hand.every(ci => !c.canPlay(ci).ok) ? 'glow' : ''}`, onclick: () => endTurnFlow(app, run, ch, c) }, 'End Turn');

  return h('div', { class: 'screen combat-screen' },
    topBar(app, run, ch, true),
    h('div', { class: 'battlefield' },
      backdropEl(run.dungeonId),
      player,
      enemies,
      h('div', { class: 'fx-layer' }),
      h('div', { class: 'turn-label' }, `Turn ${c.turn}`),
    ),
    selBar,
    h('div', { class: 'ctrl' },
      resOrb,
      h('button', { class: 'pile', onclick: () => deckModal(c.draw, 'Draw Pile') }, '🂠', h('b', null, String(c.draw.length))),
      h('button', { class: 'pile', onclick: () => deckModal(c.discard, 'Discard Pile') }, '♻️', h('b', null, String(c.discard.length))),
      c.exhaust.length ? h('button', { class: 'pile', onclick: () => deckModal(c.exhaust, 'On Cooldown') }, '⏳', h('b', null, String(c.exhaust.length))) : null,
      pots,
      endBtn,
    ),
    hand,
  );
}

function floaters(c: Combat) {
  const evs = c.events.splice(0);
  const layer = document.querySelector('.fx-layer') as HTMLElement | null;
  if (!layer) return;
  const lr = layer.getBoundingClientRect();
  const offsets: Record<number, number> = {};
  for (const ev of evs) {
    if (ev.t === 'play') continue;
    const target = document.querySelector(`[data-uid="${ev.uid}"]`) as HTMLElement | null;
    if (!target) continue;
    const r = target.getBoundingClientRect();
    const k = offsets[ev.uid] = (offsets[ev.uid] ?? 0) + 1;
    const f = document.createElement('div');
    f.className = 'floater ' + floatClass(ev);
    f.textContent = floatText(ev);
    f.style.left = `${r.left - lr.left + r.width / 2 + ((k % 3) - 1) * 16}px`;
    f.style.top = `${r.top - lr.top + r.height * 0.35 - k * 6}px`;
    f.style.animationDelay = `${(k - 1) * 90}ms`;
    layer.appendChild(f);
    setTimeout(() => f.remove(), 1500 + k * 90);
    if (ev.t === 'dmg' && (ev.n ?? 0) > 0) { target.classList.remove('hit'); void target.offsetWidth; target.classList.add('hit'); }
    if (ev.t === 'phase') toast(ev.text ?? '', 'bad');
  }
}

function floatText(ev: CEvent): string {
  switch (ev.t) {
    case 'dmg': return ev.text ?? `${ev.crit ? '💥' : ''}-${ev.n}`;
    case 'heal': return `+${ev.n}`;
    case 'block': return `🛡${ev.n}`;
    case 'status': return ev.text ? `${(ev.n ?? 0) > 1 ? ev.n + ' ' : ''}${statusName(ev.text)}` : '';
    case 'dodge': return 'Dodge!';
    case 'die': return '☠';
    case 'summon': return ev.text ? `📯 ${ev.text}` : '📯';
    case 'phase': return '⚠';
    default: return ev.text ?? '';
  }
}
function statusName(s: string) {
  const m: Record<string, string> = { str: 'AP', sp: 'SP', vuln: 'Exposed', weak: 'Weak', frail: 'Sundered', poison: 'Poison', bleed: 'Bleed', burn: 'Burn', affliction: 'Affliction', chill: 'Chill', stun: 'Stun', poly: 'Sheep', mark: 'Mark', dodge: 'Dodge', thorns: 'Thorns', regen: 'Regen' };
  return m[s] ?? s;
}
function floatClass(ev: CEvent): string {
  if (ev.t === 'dmg') return `dmg ${SCHOOL_CLASS[ev.school ?? 'physical'] ?? ''} ${ev.crit ? 'crit' : ''}`;
  return ev.t;
}

async function endTurnFlow(app: App, run: RunState, ch: Character, c: Combat) {
  if (app.busy || c.over) return;
  app.busy = true;
  selected = null; potionSel = null;
  const fast = app.profile.settings.fast;
  try {
    c.endPlayerTurn();
    app.render(); floaters(c);
    if (c.over) { app.busy = false; await endCombat(app, run, ch, c); return; }
    await sleep(fast ? 120 : 320);
    for (const e of [...c.enemies]) {
      if (e.dead) continue;
      c.enemyAct(e);
      app.render(); floaters(c);
      if (c.over) break;
      await sleep(fast ? 160 : 480);
    }
    if (!c.over) { c.finishEnemyPhase(); app.render(); floaters(c); }
  } finally {
    app.busy = false;
  }
  if (c.over) await endCombat(app, run, ch, c);
}

async function endCombat(app: App, run: RunState, ch: Character, c: Combat) {
  if (app.combat !== c) return;
  app.busy = true;
  await sleep(c.over === 'win' ? 700 : 1100);
  resolveCombat(run, ch, c);
  app.combat = null;
  app.busy = false;
  app.save();
  app.render();
}

export function _unused() { return cardActions; }
