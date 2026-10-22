import { h, modal, toast } from '../dom';
import { App, registerScreen } from '../app';
import { charDoll } from './title';
import { CLASS_BY_ID } from '../../data/classes';
import { RACE_BY_ID } from '../../data/races';
import { DUNGEONS } from '../../data/dungeons';
import { TIER_REQ, TALENT_BY_ID } from '../../data/talents';
import { CLASS_MECHANIC_TEXT, PETS } from '../../data/mechanics';
import { classCards, getCard } from '../../data/cards';
import { SLOTS, SLOT_NAME } from '../../data/items';
import {
  Character, xpToNext, talentPointsAvailable, talentPointsSpent, canLearnTalent, derive, collectProviders, equippedItems, classTalentsByTree, setCounts, MAX_LEVEL,
} from '../../engine/character';
import { HEROIC_RANKS, isUnlocked, maxRank, newRun, unlockLevel } from '../../engine/run';
import { canEquip } from '../../engine/loot';
import { cardEl, showCard, itemTile, itemTooltip } from '../components';
import type { Slot } from '../../engine/types';
import { wowIcon, TALENT_ICONS, CARD_ICONS } from '../wowart';

const rankSel: Record<string, number> = {};

registerScreen('hub', (app: App) => {
  const ch = app.char();
  const cls = CLASS_BY_ID[ch.cls];
  const tabs: [string, string][] = [['dungeons', '🗺️ Dungeons'], ['talents', '✨ Talents'], ['gear', '🛡️ Armory'], ['spells', '📖 Spellbook'], ['hero', '👤 Hero']];
  const pts = talentPointsAvailable(ch);
  const body = app.hubTab === 'talents' ? talentsTab(app, ch) : app.hubTab === 'gear' ? gearTab(app, ch) : app.hubTab === 'spells' ? spellsTab(ch) : app.hubTab === 'hero' ? heroTab(app, ch) : dungeonsTab(app, ch);
  return h('div', { class: 'screen hub-screen' },
    h('div', { class: 'hub-head', style: { '--cc': cls.color } },
      h('button', { class: 'btn ghost small back', onclick: () => app.go('title') }, '←'),
      charDoll(ch, 64),
      h('div', { class: 'hh-info' },
        h('div', { class: 'hh-name', style: { color: cls.color } }, ch.name),
        h('div', { class: 'hh-sub' }, `Level ${ch.level} ${RACE_BY_ID[ch.race].name} ${cls.trees.find(t => t.id === ch.spec)?.name} ${cls.name}`),
        ch.level < MAX_LEVEL ? h('div', { class: 'xpbar' }, h('div', { class: 'fill', style: { width: `${(ch.xp / xpToNext(ch.level)) * 100}%` } }), h('span', null, `${ch.xp} / ${xpToNext(ch.level)} XP`)) : h('div', { class: 'tag' }, 'Max Level'),
      ),
    ),
    h('div', { class: 'tabs' }, tabs.map(([id, label]) => h('button', { class: `tab ${app.hubTab === id ? 'on' : ''}`, onclick: () => { app.hubTab = id; app.render(); } }, label, id === 'talents' && pts > 0 ? h('span', { class: 'badge' }, String(pts)) : null))),
    h('div', { class: 'tab-body', 'data-scroll': 'hub-' + app.hubTab }, body),
  );
});

function dungeonsTab(app: App, ch: Character) {
  const card = (d: typeof DUNGEONS[number]) => {
    const unlocked = isUnlocked(ch, d.id);
    const cleared = ch.cleared[d.id] ?? -1;
    const mr = maxRank(ch, d.id);
    const sel = Math.min(rankSel[d.id] ?? mr, mr);
    const prereq = d.unlock ? DUNGEONS.find(x => x.id === d.unlock)!.name : '';
    return h('div', { class: `dcard ${unlocked ? '' : 'locked'} ${d.kind}`, style: { background: `linear-gradient(135deg, ${d.colors[0]}, ${d.colors[1]})` } },
      h('div', { class: 'dc-top' },
        h('span', { class: 'dc-icon' }, unlocked ? d.icon : '🔒'),
        h('div', { class: 'dc-title' }, h('b', null, d.name), h('span', { class: 'muted small' }, `Level ${d.lvl}${d.kind === 'raid' ? ` · ${d.acts.length} wings` : ''}`)),
        cleared >= 0 ? h('span', { class: 'tag good' }, cleared === 0 ? 'Cleared' : `Heroic ${cleared}`) : null,
      ),
      h('div', { class: 'dc-desc' }, d.desc),
      unlocked ? h('div', { class: 'dc-actions' },
        mr > 0 ? h('div', { class: 'rank-sel' },
          h('button', { class: 'btn small', onclick: () => { rankSel[d.id] = Math.max(0, sel - 1); app.render(); } }, '−'),
          h('span', { title: HEROIC_RANKS[sel].desc }, HEROIC_RANKS[sel].name),
          h('button', { class: 'btn small', onclick: () => { rankSel[d.id] = Math.min(mr, sel + 1); app.render(); } }, '+')) : null,
        h('button', { class: 'btn primary', onclick: () => startRun(app, ch, d.id, sel) }, d.kind === 'raid' ? 'Enter Raid' : 'Enter Dungeon'),
      ) : h('div', { class: 'dc-lock muted small' }, d.kind === 'raid' && d.id === 'ony' ? `Attunement: defeat General Drakkisath in ${prereq}.` : `Clear ${prereq} to unlock.`),
      unlocked && sel > 0 ? h('div', { class: 'muted small' }, HEROIC_RANKS.slice(1, sel + 1).map(r => r.desc).join(' ')) : null,
    );
  };
  return h('div', null,
    h('h3', { class: 'sect' }, 'Dungeons'),
    DUNGEONS.filter(d => d.kind === 'dungeon').map(card),
    h('h3', { class: 'sect' }, 'Raids'),
    h('p', { class: 'muted small center' }, 'Longer multi-wing runs with phase-based bosses, epic loot and tier sets.'),
    DUNGEONS.filter(d => d.kind === 'raid').map(card),
  );
}

function startRun(app: App, ch: Character, id: string, rank: number) {
  const p = app.profile;
  if (p.run) { toast('Finish or abandon your current run first.', 'bad'); return; }
  p.run = newRun(ch, id, rank, p.nextUid + 10000);
  app.save();
  app.go('run');
}

function talentsTab(app: App, ch: Character) {
  const cls = CLASS_BY_ID[ch.cls];
  const avail = talentPointsAvailable(ch);
  return h('div', null,
    h('div', { class: 'talent-head' },
      h('div', null, h('b', null, `${avail}`), ' points available', h('div', { class: 'muted small' }, 'You earn 1 talent point every 2 levels from level 10.')),
      h('button', { class: 'btn small', onclick: () => { ch.talents = {}; app.save(); app.render(); } }, 'Reset'),
    ),
    cls.trees.map(t => {
      const spent = talentPointsSpent(ch, t.id);
      const ts = classTalentsByTree(ch.cls, t.id);
      return h('div', { class: `tree ${ch.spec === t.id ? 'primary' : ''}` },
        h('div', { class: 'tree-head' },
          h('span', { class: 'tree-icon' }, t.icon), h('b', null, `${t.name}`), h('span', { class: 'muted' }, ` ${spent} pts`),
          ch.spec === t.id ? h('span', { class: 'tag good' }, 'Primary Spec') : h('button', { class: 'btn small', onclick: () => { ch.spec = t.id; app.save(); app.render(); toast(`${t.name} is now your primary spec.`, 'good'); } }, 'Set Primary'),
        ),
        [0, 1, 2, 3].map(tier => h('div', { class: `tier ${spent >= TIER_REQ[tier] ? '' : 'locked'}` },
          h('span', { class: 'tier-req' }, TIER_REQ[tier] ? `${TIER_REQ[tier]}` : ''),
          ts.filter(x => x.tier === tier).map(tal => {
            const r = ch.talents[tal.id] ?? 0;
            const can = canLearnTalent(ch, tal.id);
            return h('button', { class: `talent ${r > 0 ? 'has' : ''} ${r >= tal.max ? 'max' : ''} ${can ? 'can' : ''} ${tal.card ? 'cap' : ''}`, onclick: () => {
              const close = modal(h('div', null,
                h('h3', null, `${tal.icon} ${tal.name}`),
                h('div', { class: 'muted' }, `Rank ${r}/${tal.max} · ${t.name} tier ${tier + 1}`),
                r > 0 ? h('p', null, h('b', null, 'Current: '), tal.desc(r)) : null,
                r < tal.max ? h('p', null, h('b', null, 'Next rank: '), tal.desc(r + 1)) : null,
                tal.card ? h('div', { class: 'center' }, cardEl({ id: tal.card, up: false })) : null,
                h('div', { class: 'row' },
                  can ? h('button', { class: 'btn primary', onclick: () => { ch.talents[tal.id] = r + 1; app.save(); close(); app.render(); } }, 'Learn') : h('span', { class: 'muted small' }, avail <= 0 ? 'No talent points available.' : r >= tal.max ? 'Maxed.' : `Requires ${TIER_REQ[tier]} points in ${t.name}.`),
                  r > 0 ? h('button', { class: 'btn small', onclick: () => { if (r === 1) delete ch.talents[tal.id]; else ch.talents[tal.id] = r - 1; if (!validTalents(ch)) { ch.talents[tal.id] = r; toast('Other talents depend on this one.', 'bad'); } app.save(); close(); app.render(); } }, 'Unlearn') : null,
                )));
            } }, h('span', { class: 'ti' }, wowIcon(TALENT_ICONS[tal.name] ?? (tal.card ? CARD_ICONS[tal.card] : undefined), tal.icon, 'timg')), h('span', { class: 'tr' }, `${r}/${tal.max}`), h('span', { class: 'tn' }, tal.name));
          }))),
      );
    }),
  );
}

function validTalents(ch: Character): boolean {
  for (const [id, r] of Object.entries(ch.talents)) {
    const t = TALENT_BY_ID[id];
    if (!t || r <= 0) continue;
    const others = Object.entries(ch.talents).filter(([oid]) => TALENT_BY_ID[oid]?.tree === t.tree && TALENT_BY_ID[oid].tier < t.tier).reduce((s, [, x]) => s + x, 0);
    if (others < TIER_REQ[t.tier]) return false;
  }
  return true;
}

function gearTab(app: App, ch: Character) {
  const eq = equippedItems(ch);
  const d = derive(ch, eq, collectProviders(ch, eq));
  const sets = setCounts(eq);
  const slotRow = (slot: Slot) => {
    const it = eq.find(i => i.slot === slot);
    return h('div', { class: 'slotrow' }, h('span', { class: 'slotname' }, SLOT_NAME[slot]), itemTile(it, { slot, onClick: () => pickItem(app, ch, slot) }));
  };
  return h('div', null,
    h('div', { class: 'armory-top' }, charDoll(ch, 150), statsPanel(d, ch)),
    h('p', { class: 'muted small center' }, 'Items equipped here are worn at the start of every run. Win runs to add loot to your armory.'),
    SLOTS.map(slotRow),
    Object.keys(sets).length ? h('div', { class: 'muted small' }, Object.entries(sets).map(([s, n]) => `${s}: ${n}/4`).join(' · ')) : null,
    h('h3', { class: 'sect' }, `Armory (${ch.armory.length})`),
    h('div', { class: 'armory-list' }, ch.armory.map(it => itemTile(it, { onClick: () => modal(itemTooltip(it, { equippedSet: sets, usable: canEquip(ch.cls, it) })) }))),
  );
}

export function statsPanel(d: ReturnType<typeof derive>, ch: Character) {
  const s = d.stats;
  const row = (k: string, v: string | number) => h('div', { class: 'srow' }, h('span', null, k), h('b', null, String(v)));
  return h('div', { class: 'stats-panel' },
    row('Max HP', d.maxHp), row('Attack Power', `+${d.ap}`), row('Spell Power', `+${d.sp}`), row('Phys Crit', `${d.physCrit.toFixed(1)}%`), row('Spell Crit', `${d.spellCrit.toFixed(1)}%`),
    row('Armor', `${s.armor} (${d.startBlock} Block)`), row('Spirit', `${s.spi} (+${d.postHeal} HP/fight)`),
    h('div', { class: 'muted small' }, `STR ${s.str} · AGI ${s.agi} · STA ${s.sta} · INT ${s.int}`),
  );
}

function pickItem(app: App, ch: Character, slot: Slot) {
  const opts = ch.armory.filter(i => i.slot === slot && canEquip(ch.cls, i));
  const cur = ch.equipped[slot];
  const close = modal(h('div', null,
    h('h3', null, SLOT_NAME[slot]),
    opts.length ? null : h('p', { class: 'muted' }, 'No items for this slot yet.'),
    opts.map(it => h('div', { class: `pick-item ${cur === it.uid ? 'on' : ''}` },
      itemTooltip(it, { equippedSet: setCounts(equippedItems(ch)) }),
      cur === it.uid ? h('button', { class: 'btn small', onclick: () => { delete ch.equipped[slot]; app.save(); close(); app.render(); } }, 'Unequip')
        : h('button', { class: 'btn primary small', onclick: () => {
          ch.equipped[slot] = it.uid;
          if (slot === 'mainhand' && it.twoHand) delete ch.equipped.offhand;
          if (slot === 'offhand') { const mh = ch.armory.find(x => x.uid === ch.equipped.mainhand); if (mh?.twoHand) delete ch.equipped.mainhand; }
          app.save(); close(); app.render();
        } }, 'Equip'))),
  ));
}

function spellsTab(ch: Character) {
  const cls = CLASS_BY_ID[ch.cls];
  const cards = classCards(ch.cls);
  const group = (title: string, list: typeof cards) => h('div', null, h('h3', { class: 'sect' }, title),
    h('div', { class: 'card-grid' }, list.map(c => {
      const locked = (c.race && c.race !== ch.race) || unlockLevel(c) > ch.level || (c.talent && !(ch.talents[c.talent] > 0));
      const why = c.race && c.race !== ch.race ? `${RACE_BY_ID[c.race].name} only` : c.talent && !(ch.talents[c.talent] > 0) ? `Talent: ${TALENT_BY_ID[c.talent].name}` : `Level ${unlockLevel(c)}`;
      return h('div', { class: `spell ${locked ? 'locked' : ''}` }, cardEl({ id: c.id, up: false }, { small: true, onClick: () => showCard({ id: c.id, up: false }) }), locked ? h('div', { class: 'lockline' }, '🔒 ' + why) : null);
    })));
  return h('div', null,
    h('p', { class: 'muted small center' }, 'Abilities unlock as you level and appear as rewards during runs. Capstone talents grant signature abilities.'),
    group('Starting Abilities', cards.filter(c => c.rarity === 'starter')),
    cls.trees.map(t => group(`${t.icon} ${t.name}`, cards.filter(c => c.tree === t.id))),
    group('Other', cards.filter(c => c.rarity !== 'starter' && !c.tree && (!c.race || c.race === ch.race))),
  );
}

function heroTab(app: App, ch: Character) {
  const race = RACE_BY_ID[ch.race];
  const cls = CLASS_BY_ID[ch.cls];
  return h('div', null,
    h('div', { class: 'panel' }, h('h3', null, `${race.icon} ${race.name} Racial`), h('b', null, race.passiveName), h('p', null, race.passive)),
    h('div', { class: 'panel' }, h('h3', null, `${cls.icon} ${cls.name}`), h('p', null, cls.desc), h('p', { class: 'muted' }, CLASS_MECHANIC_TEXT[ch.cls]),
      ch.pet ? h('p', null, `Companion: ${PETS[ch.pet].icon} ${PETS[ch.pet].name} — ${PETS[ch.pet].desc}`) : null),
    h('div', { class: 'panel' }, h('h3', null, 'Record'),
      h('div', { class: 'srow' }, h('span', null, 'Runs'), h('b', null, String(ch.stats.runs))),
      h('div', { class: 'srow' }, h('span', null, 'Victories'), h('b', null, String(ch.stats.wins))),
      h('div', { class: 'srow' }, h('span', null, 'Deaths'), h('b', null, String(ch.stats.deaths))),
      h('div', { class: 'srow' }, h('span', null, 'Bosses slain'), h('b', null, String(ch.stats.bossKills)))),
    h('button', { class: 'btn danger', onclick: () => {
      const close = modal(h('div', null, h('h3', null, `Delete ${ch.name}?`), h('p', null, 'This cannot be undone.'),
        h('button', { class: 'btn danger', onclick: () => {
          const p = app.profile;
          p.characters = p.characters.filter(c => c.id !== ch.id);
          if (p.run?.charId === ch.id) p.run = null;
          p.activeId = p.characters[0]?.id ?? null;
          app.save(); close(); app.go('title');
        } }, 'Delete')));
    } }, 'Delete Hero'),
  );
}

export { getCard };
