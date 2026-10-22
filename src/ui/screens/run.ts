import { h, modal, toast } from '../dom';
import { App, registerScreen } from '../app';
import { charDoll } from './title';
import { statsPanel } from './hub';
import { renderCombat } from './combat';
import { cardEl, showCard, itemTile, itemTooltip, goldEl, hpBar } from '../components';
import { getCard, canUpgrade } from '../../data/cards';
import { EVENTS } from '../../data/events';
import { DUNGEON_BY_ID } from '../../data/dungeons';
import { SLOTS, SLOT_NAME } from '../../data/items';
import { itemsToDoll } from '../render/doll';
import { canEquip } from '../../engine/loot';
import { setCounts, Character } from '../../engine/character';
import {
  RunState, reachable, enterNode, makeCombat, takeRewardCard, skipRewardCards, takeRewardPotion, takeRewardItem, finishReward, nextAct, restHeal, upgradeCard,
  removeCard, duplicateCard, leaveNode, buyCard, buyItem, buyPotion, buyRemoval, chooseEvent, eventFollowUp, finishRun, keepCandidates, keepLimit,
  maxHpOf, gearList, runDerived, equipItem, unequip, sellBagItem, sellValue, drinkPotionOutside, actOf, dungeonOf, HEROIC_RANKS, MapNode, RunSummary,
} from '../../engine/run';
import type { CardInst, Item } from '../../engine/types';

const NODE_ICON: Record<string, string> = { combat: '⚔️', elite: '💀', rest: '🔥', shop: '💰', event: '❓', treasure: '🎁', boss: '👑' };
const NODE_NAME: Record<string, string> = { combat: 'Enemies', elite: 'Elite', rest: 'Campfire', shop: 'Goblin Vendor', event: 'Unknown', treasure: 'Treasure', boss: 'Boss' };

let lastSummary: RunSummary | null = null;

registerScreen('run', (app: App) => {
  const run = app.profile.run;
  const ch = app.char();
  if (!run) {
    if (lastSummary) return summaryView(app, ch, lastSummary);
    app.screen = 'hub';
    return h('div');
  }
  const p = run.pending;
  if (p?.kind === 'combat') {
    if (!app.combat) { app.combat = makeCombat(run, ch); app.combat.start(); }
    return renderCombat(app, run, ch, app.combat);
  }
  app.combat = null;
  return h('div', { class: 'screen run-screen' },
    topBar(app, run, ch),
    p === null ? mapView(app, run, ch) : h('div', { class: 'overlay-wrap' }, mapView(app, run, ch, true), h('div', { class: 'overlay-panel' }, pendingView(app, run, ch))),
  );
});

export function topBar(app: App, run: RunState, ch: Character, inCombat = false) {
  const mx = maxHpOf(run, ch);
  const dg = dungeonOf(run);
  return h('div', { class: 'topbar' },
    h('div', { class: 'tb-hp' }, '❤️', h('b', null, inCombat && app.combat ? `${app.combat.p.hp}/${app.combat.p.maxHp}` : `${run.hp}/${mx}`)),
    h('div', { class: 'tb-gold' }, goldEl(run.gold)),
    h('div', { class: 'tb-pots' }, run.potions.map((pid, i) => h('button', { class: `pot ${pid ? '' : 'empty'}`, onclick: () => {
      if (!pid) return;
      const def = getCard(pid);
      const close = modal(h('div', null, h('h3', null, `${def.icon} ${def.name}`), h('p', null, def.text ?? ''),
        !inCombat && pid === 'po_heal' ? h('button', { class: 'btn primary', onclick: () => { drinkPotionOutside(run, ch, i); app.save(); close(); app.render(); } }, 'Drink') : null,
        inCombat ? h('p', { class: 'muted small' }, 'Use potions from the combat potion belt.') : null,
        h('button', { class: 'btn small', onclick: () => { run.potions[i] = null; app.save(); close(); app.render(); } }, 'Discard')));
    } }, pid ? getCard(pid).icon : '·'))),
    h('div', { class: 'tb-right' },
      h('button', { class: 'btn small', onclick: () => deckModal(run.deck) }, `🂠 ${run.deck.length}`),
      h('button', { class: 'btn small', onclick: () => gearModal(app, run, ch) }, '🎒'),
      h('button', { class: 'btn small', onclick: () => menuModal(app, run) }, '☰'),
    ),
    h('div', { class: 'tb-where' }, `${dg.icon} ${dg.name}${dg.acts.length > 1 ? ` — ${actOf(run).name}` : ''}${run.rank ? ` · ${HEROIC_RANKS[run.rank].name}` : ''}`),
  );
}

function menuModal(app: App, run: RunState) {
  const close = modal(h('div', null,
    h('h3', null, 'Menu'),
    h('button', { class: 'btn', onclick: () => { close(); app.go('title'); } }, 'Save & Quit to Title'),
    h('button', { class: 'btn danger', onclick: () => {
      close();
      const c2 = modal(h('div', null, h('h3', null, 'Abandon run?'), h('p', null, 'You keep experience earned so far but no loot.'),
        h('button', { class: 'btn danger', onclick: () => { run.pending = { kind: 'end', win: false }; app.combat = null; app.save(); c2(); app.render(); } }, 'Abandon')));
    } }, 'Abandon Run'),
  ));
}

export function deckModal(deck: CardInst[], title = 'Your Deck') {
  const sorted = [...deck].sort((a, b) => getCard(a.id).type.localeCompare(getCard(b.id).type) || getCard(a.id).name.localeCompare(getCard(b.id).name));
  modal(h('div', null, h('h3', null, `${title} (${deck.length})`), h('div', { class: 'card-grid' }, sorted.map(c => cardEl(c, { small: true, onClick: () => showCard(c) })))), { cls: 'wide' });
}

export function pickCardModal(deck: CardInst[], title: string, filter: (c: CardInst) => boolean, onPick: (c: CardInst) => void, showUpgrade = false) {
  const opts = deck.filter(filter);
  const close = modal(h('div', null, h('h3', null, title),
    opts.length ? null : h('p', { class: 'muted' }, 'No eligible cards.'),
    h('div', { class: 'card-grid' }, opts.map(c => h('div', { class: 'pickable' },
      cardEl(c, { small: true, onClick: () => {
        const c2 = modal(h('div', { class: 'center' }, h('h3', null, title),
          h('div', { class: 'row center' }, cardEl(c), showUpgrade ? h('span', { class: 'arrow' }, '→') : null, showUpgrade ? cardEl({ id: c.id, up: true }) : null),
          h('button', { class: 'btn primary', onclick: () => { c2(); close(); onPick(c); } }, 'Confirm')));
      } }))))), { cls: 'wide' });
}

function gearModal(app: App, run: RunState, ch: Character) {
  const eq = gearList(run);
  const sets = setCounts(eq);
  const d = runDerived(run, ch);
  const close = modal(h('div', null,
    h('h3', null, 'Equipment'),
    h('div', { class: 'armory-top' }, charDoll(ch, 130, itemsToDoll(eq)), statsPanel(d, ch)),
    SLOTS.map(slot => h('div', { class: 'slotrow' }, h('span', { class: 'slotname' }, SLOT_NAME[slot]), itemTile(run.gear[slot], { slot, onClick: () => {
      const it = run.gear[slot]; if (!it) return;
      const c2 = modal(h('div', null, itemTooltip(it, { equippedSet: sets }), h('button', { class: 'btn small', onclick: () => { unequip(run, ch, slot); app.save(); c2(); close(); gearModal(app, run, ch); } }, 'Unequip to Bag')));
    } }))),
    h('h3', null, `Bags (${run.bag.length}/8)`),
    run.bag.length ? null : h('p', { class: 'muted small' }, 'Empty.'),
    run.bag.map(it => itemTile(it, { onClick: () => {
      const usable = canEquip(ch.cls, it);
      const c2 = modal(h('div', null, itemTooltip(it, { equippedSet: sets, compare: run.gear[it.slot], usable }),
        h('div', { class: 'row' },
          usable ? h('button', { class: 'btn primary small', onclick: () => { equipItem(run, ch, it); app.save(); c2(); close(); gearModal(app, run, ch); app.render(); } }, 'Equip') : null,
          h('button', { class: 'btn small', onclick: () => { sellBagItem(run, it.uid); app.save(); c2(); close(); gearModal(app, run, ch); app.render(); } }, `Sell (${sellValue(it)}g)`))));
    } })),
  ), { cls: 'wide' });
}

// ------------------------------------------------------------------ map
function mapView(app: App, run: RunState, ch: Character, dim = false) {
  const act = actOf(run);
  const rows = act.rows + 1;
  const W = 340, rowH = 74, H = rows * rowH + 60;
  const pos = (n: MapNode) => ({ x: 34 + n.col * ((W - 68) / 5) + ((n.id * 37) % 13) - 6, y: H - 40 - n.row * rowH + (n.type === 'boss' ? -10 : 0) });
  const reach = new Set(reachable(run));
  const byId = new Map(run.map.map(n => [n.id, n]));
  const lines: string[] = [];
  for (const n of run.map) for (const c of n.next) {
    const a = pos(n), b = pos(byId.get(c)!);
    const walked = run.visited.includes(n.id) && run.visited.includes(c);
    lines.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${walked ? 'walked' : ''}"/>`);
  }
  const svgEl = h('div', { class: 'map-svg', html: `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none"><g class="map-lines">${lines.join('')}</g></svg>` });
  const nodes = run.map.map(n => {
    const p = pos(n);
    const visited = run.visited.includes(n.id);
    const can = reach.has(n.id) && !dim;
    return h('button', {
      class: `mnode t-${n.type} ${visited ? 'visited' : ''} ${can ? 'reach' : ''} ${run.pos === n.id ? 'here' : ''}`,
      style: { left: `${(p.x / W) * 100}%`, top: `${p.y}px` },
      onclick: () => {
        if (!can) { toast(`${NODE_NAME[n.type]}${reach.size ? '' : ''}`, 'info'); return; }
        enterNode(run, ch, n.id);
        app.save();
        app.render();
      },
    }, n.type === 'boss' ? h('span', { class: 'boss-label' }, '👑 ' + act.bossName) : NODE_ICON[n.type]);
  });
  const here = run.pos !== null ? run.map.find(n => n.id === run.pos)! : null;
  const scrollTo = here ? pos(here).y : H;
  const wrap = h('div', { class: `map-wrap ${dim ? 'dim' : ''}`, 'data-scroll': 'map-' + run.act + '-' + run.visited.length },
    h('div', { class: 'map-inner', style: { height: H + 'px' } }, svgEl, nodes));
  requestAnimationFrame(() => { wrap.scrollTop = Math.max(0, scrollTo - wrap.clientHeight * 0.6); });
  if (!dim) {
    return h('div', { class: 'map-screen' },
      wrap,
      h('div', { class: 'legend' }, Object.entries(NODE_ICON).map(([k, v]) => h('span', null, `${v} ${NODE_NAME[k]}`))),
    );
  }
  return wrap;
}

// ------------------------------------------------------------------ pending views
function pendingView(app: App, run: RunState, ch: Character): HTMLElement {
  const p = run.pending!;
  const rr = () => { app.save(); app.render(); };
  switch (p.kind) {
    case 'reward': {
      return h('div', { class: 'reward' },
        h('h2', null, p.title),
        p.gold ? h('div', { class: 'rw-line' }, '💰 ', goldEl(p.gold), ' gold looted') : null,
        p.cards ? h('div', { class: 'rw-line clickable', onclick: () => cardRewardModal(app, run) }, '🂠 Choose a new ability') : null,
        p.items.length ? h('div', null,
          h('div', { class: 'muted small' }, p.boss ? 'The boss dropped loot — choose ONE:' : 'Loot:'),
          p.items.map(it => {
            const usable = canEquip(ch.cls, it);
            return h('div', { class: 'loot' }, itemTile(it, { onClick: () => modal(itemTooltip(it, { equippedSet: setCounts(gearList(run)), compare: run.gear[it.slot], usable })) }),
              h('div', { class: 'row' },
                usable ? h('button', { class: 'btn primary small', onclick: () => { takeRewardItem(run, ch, it.uid, 'equip'); rr(); } }, 'Equip') : null,
                usable ? h('button', { class: 'btn small', onclick: () => { takeRewardItem(run, ch, it.uid, 'bag'); rr(); } }, 'Bag') : null,
                h('button', { class: 'btn small', onclick: () => { takeRewardItem(run, ch, it.uid, 'sell'); rr(); } }, `Sell ${sellValue(it)}g`)));
          })) : null,
        p.potion ? h('div', { class: 'rw-line clickable', onclick: () => { if (!takeRewardPotion(run)) toast('Potion belt is full.', 'bad'); rr(); } }, `${getCard(p.potion).icon} ${getCard(p.potion).name}`, h('span', { class: 'muted small' }, ' — tap to take')) : null,
        h('button', { class: 'btn primary big', onclick: () => { finishReward(run, ch); rr(); } }, p.boss ? 'Continue' : 'Proceed'),
      );
    }
    case 'rest': {
      const d = runDerived(run, ch);
      const heal = Math.round(d.maxHp * ((run.rank >= 5 ? 0.2 : 0.3) + d.run.rest));
      return h('div', { class: 'rest' },
        h('div', { class: 'campfire' }, '🔥'),
        h('h2', null, 'Campfire'),
        h('p', { class: 'muted' }, 'You make camp. Eat, drink, or visit your class trainer.'),
        p.done ? h('button', { class: 'btn primary big', onclick: () => { leaveNode(run); rr(); } }, 'Continue') : h('div', { class: 'rest-opts' },
          h('button', { class: 'btn big', onclick: () => { const n = restHeal(run, ch); toast(`Restored ${n} HP`, 'good'); rr(); } }, h('div', null, '🍖 Eat & Drink'), h('small', null, `Heal ${heal} HP`)),
          h('button', { class: 'btn big', onclick: () => pickCardModal(run.deck, 'Train: learn Rank 2', c => !c.up && canUpgrade(getCard(c.id)), c => { upgradeCard(run, c.uid); rr(); }, true) }, h('div', null, '📜 Class Trainer'), h('small', null, 'Upgrade a card')),
        ),
      );
    }
    case 'shop': {
      const s = p.stock;
      return h('div', { class: 'shop' },
        h('h2', null, '💰 Goblin Vendor'), h('p', { class: 'muted' }, '"Everything for sale, friend! Cheap! ...Well, not cheap."'),
        h('div', { class: 'shop-cards' }, s.cards.map((x, i) => h('div', { class: `shop-item ${x.sold ? 'sold' : ''}` },
          cardEl(x.card, { small: true, onClick: () => showCard(x.card) }),
          x.sold ? h('div', { class: 'muted' }, 'Sold') : h('button', { class: `btn small ${run.gold >= x.price ? 'primary' : ''}`, onclick: () => { buyCard(run, i); rr(); } }, goldEl(x.price))))),
        h('h3', null, 'Gear'),
        s.items.map((x, i) => h('div', { class: `loot ${x.sold ? 'sold' : ''}` }, itemTile(x.item, { onClick: () => modal(itemTooltip(x.item, { compare: run.gear[x.item.slot], usable: canEquip(ch.cls, x.item), equippedSet: setCounts(gearList(run)) })) }),
          x.sold ? h('span', { class: 'muted' }, 'Sold') : h('div', { class: 'row' },
            canEquip(ch.cls, x.item) ? h('button', { class: 'btn small primary', onclick: () => { buyItem(run, ch, i, 'equip'); rr(); } }, 'Buy & Equip ', goldEl(x.price)) : h('button', { class: 'btn small', onclick: () => { buyItem(run, ch, i, 'bag'); rr(); } }, 'Buy ', goldEl(x.price))))),
        h('h3', null, 'Potions'),
        h('div', { class: 'row wrap' }, s.potions.map((x, i) => h('button', { class: `btn small ${x.sold ? 'sold' : ''}`, onclick: () => { if (!x.sold) { buyPotion(run, i); rr(); } } }, `${getCard(x.id).icon} ${getCard(x.id).name} `, x.sold ? 'Sold' : goldEl(x.price)))),
        h('h3', null, 'Services'),
        s.removed ? h('p', { class: 'muted' }, 'Unlearning used.') : h('button', { class: 'btn', onclick: () => pickCardModal(run.deck, 'Unlearn a card', () => true, c => { buyRemoval(run, c.uid); rr(); }) }, '🗑️ Unlearn a card ', goldEl(s.removePrice)),
        h('button', { class: 'btn primary big', onclick: () => { leaveNode(run); rr(); } }, 'Leave'),
      );
    }
    case 'event': {
      const ev = EVENTS.find(e => e.id === p.id)!;
      if (p.result) {
        const r = p.result;
        const cont = () => { eventFollowUp(run); rr(); };
        return h('div', { class: 'event' }, h('div', { class: 'ev-icon' }, ev.icon), h('h2', null, ev.title), h('p', { class: 'ev-result' }, r.text),
          r.pick ? h('button', { class: 'btn primary big', onclick: () => {
            const done = () => { p.result = { ...r, pick: undefined }; rr(); };
            if (r.pick === 'remove') pickCardModal(run.deck, 'Remove a card', () => true, c => { removeCard(run, c.uid); done(); });
            else if (r.pick === 'upgrade') pickCardModal(run.deck, 'Upgrade a card', c => !c.up && canUpgrade(getCard(c.id)), c => { upgradeCard(run, c.uid); done(); }, true);
            else pickCardModal(run.deck, 'Duplicate a card', c => getCard(c.id).cls !== 'curse', c => { duplicateCard(run, c.uid); done(); });
          } }, 'Choose a card') : h('button', { class: 'btn primary big', onclick: cont }, r.combat || r.elite ? 'Fight!' : 'Continue'));
      }
      const api = { gold: run.gold, hp: run.hp };
      return h('div', { class: 'event' }, h('div', { class: 'ev-icon' }, ev.icon), h('h2', null, ev.title), h('p', { class: 'ev-text' }, ev.text),
        ev.choices.map((c, i) => {
          const res0 = c.req ? c.req({ gold: () => api.gold, hp: () => api.hp } as any) : true;
          return h('button', { class: `btn choice ${res0 ? '' : 'disabled'}`, onclick: () => { if (!res0) return; chooseEvent(run, ch, i); rr(); } }, h('b', null, c.label), h('small', null, c.desc));
        }));
    }
    case 'actEnd': {
      const dg = dungeonOf(run);
      const next = dg.acts[run.act + 1];
      return h('div', { class: 'reward' }, h('h2', null, `${actOf(run).name} cleared!`), h('p', null, 'Your raid regroups: resurrections, repairs and buffs. You recover 60% of your missing health.'),
        h('p', { class: 'muted' }, `Next: ${next.name} — ${next.bossName} awaits.`),
        h('button', { class: 'btn primary big', onclick: () => { nextAct(run, ch); rr(); } }, `Onward to ${next.name}`));
    }
    case 'end':
      return endView(app, run, ch, p.win);
    default:
      return h('div');
  }
}

function cardRewardModal(app: App, run: RunState) {
  const p = run.pending;
  if (!p || p.kind !== 'reward' || !p.cards) return;
  const close = modal(h('div', { class: 'center' },
    h('h3', null, 'Choose an ability'),
    h('div', { class: 'card-choice' }, p.cards.map((c, i) => h('div', { class: 'cc-wrap' }, cardEl(c, { onClick: () => { takeRewardCard(run, i); app.save(); close(); app.render(); } }),
      h('button', { class: 'btn small ghost', onclick: () => showCard(c) }, 'ⓘ')))),
    h('button', { class: 'btn', onclick: () => { skipRewardCards(run); app.save(); close(); app.render(); } }, 'Skip'),
  ), { cls: 'wide' });
}

function endView(app: App, run: RunState, ch: Character, win: boolean) {
  const cands = win ? keepCandidates(run) : [];
  const limit = keepLimit(run);
  const chosen = new Set<number>();
  const dg = DUNGEON_BY_ID[run.dungeonId];
  const list = h('div', null);
  const draw = () => {
    list.replaceChildren(...cands.map(it => h('div', { class: `loot keep ${chosen.has(it.uid) ? 'on' : ''}`, onclick: () => {
      if (chosen.has(it.uid)) chosen.delete(it.uid);
      else if (chosen.size < limit) chosen.add(it.uid);
      else toast(`You may keep ${limit}.`, 'bad');
      draw();
    } }, itemTile(it), h('span', { class: 'check' }, chosen.has(it.uid) ? '✅' : '⬜'))));
  };
  draw();
  return h('div', { class: 'reward end' },
    h('div', { class: 'ev-icon' }, win ? '🏆' : '💀'),
    h('h2', null, win ? `${dg.name} Conquered!` : 'You have fallen...'),
    h('p', { class: 'muted' }, win ? 'Your name echoes through the halls of Azeroth.' : 'Your spirit returns to the graveyard. Experience earned is kept.'),
    h('div', { class: 'rw-line' }, `✨ ${run.xp} experience · ${run.kills.normal + run.kills.elite + run.kills.boss} foes slain`),
    win && cands.length ? h('div', null, h('h3', null, `Keep ${limit === 1 ? 'one item' : `up to ${limit} items`} for your Armory`), list) : null,
    h('button', { class: 'btn primary big', onclick: () => {
      lastSummary = finishRun(ch, run, [...chosen]);
      app.profile.nextUid = Math.max(app.profile.nextUid, run.uid + 1);
      app.profile.run = null;
      app.combat = null;
      app.save();
      app.render();
    } }, 'Return to Town'),
  );
}

function summaryView(app: App, ch: Character, s: RunSummary) {
  return h('div', { class: 'screen run-screen' }, h('div', { class: 'overlay-panel solo' }, h('div', { class: 'reward' },
    h('h2', null, s.win ? 'Victory' : 'Defeat'),
    h('div', { class: 'rw-line' }, `✨ +${s.xp} XP`),
    s.levelsGained ? h('div', { class: 'rw-line big-good' }, `⬆️ Level ${s.newLevel}!`) : null,
    s.newTalentPoints ? h('div', { class: 'rw-line' }, `🌟 +${s.newTalentPoints} talent point${s.newTalentPoints > 1 ? 's' : ''}`) : null,
    s.newCards.length ? h('div', { class: 'rw-line' }, `📖 New abilities unlocked: ${s.newCards.join(', ')}`) : null,
    s.kept.length ? h('div', { class: 'rw-line' }, `🎒 Added to Armory: ${s.kept.map(i => i.name).join(', ')}`) : null,
    s.unlocked ? h('div', { class: 'rw-line big-good' }, `🗝️ Unlocked: ${s.unlocked}`) : null,
    h('button', { class: 'btn primary big', onclick: () => { lastSummary = null; app.hubTab = s.newTalentPoints ? 'talents' : 'dungeons'; app.go('hub'); } }, 'Continue'),
  )));
}

export { hpBar };
