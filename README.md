# WarSpire

A Slay-the-Spire-style roguelike deckbuilder set in the World of Warcraft Classic era, built for iPhone/iPad (and any modern browser).

Every run is a classic dungeon. Pick a path through a branching map, fight with a deck of class abilities, choose rewards that synergise with your talent spec, loot gear that shows up on your character, and defeat the final boss. Clear dungeons to unlock the next one, then get attuned for three long, multi-wing **raids**: Onyxia's Lair, Molten Core and Blackwing Lair.

## Features

- **8 races, each with a unique passive**: Human (Diplomacy), Dwarf (Stoneform), Night Elf (Shadowmeld), Gnome (Expansive Mind / Engineering), Orc (Blood Fury / Hardiness), Undead (Cannibalize / Will of the Forsaken), Tauren (Endurance / War Stomp), Troll (Berserking / Regeneration). Classic race/class restrictions apply.
- **9 classes with distinct mechanics**: Warrior Rage, Paladin Seals & Judgements, Hunter pets, Rogue Combo Points & Stealth openers, Priest shields (plus racial priest spells), Shaman Totems, Mage Chill/Freeze & Ignite, Warlock demons & Soul Shards, Druid shapeshifting.
- **27 talent specs**: 3 trees × 6 talents per class. Capstones grant signature abilities (Mortal Strike, Shadowform, Moonkin Form, Holy Shield...). Your primary spec shapes your starter deck and the rewards you're offered.
- **~260 cards**, unlocked as you level (1–60), with Rank 2 upgrades at campfires.
- **Gear**: 10 slots, stats (Stamina, Strength, Agility, Intellect, Spirit, Armor, Attack/Spell Power, Crit), named Classic loot with play-style-altering effects (Thunderfury, Sulfuras, Hand of Justice, Ironfoe...), random "of the Bear/Eagle/Owl..." greens, and Tier 1/Tier 2 sets with 2- and 4-piece bonuses. **Equipped gear is drawn on your character.**
- **9 dungeons**: Ragefire Chasm, The Deadmines, Wailing Caverns, Shadowfang Keep, Scarlet Monastery, Zul'Farrak, Blackrock Depths, Stratholme, Upper Blackrock Spire.
- **3 raids** with multi-phase bosses: Onyxia (Deep Breath, whelps, fear), Molten Core (Garr, Majordomo, Ragnaros' submerge), Blackwing Lair (Razorgore's eggs, Vaelastrasz's Burning Adrenaline, Chromaggus' afflictions, Nefarian's class calls).
- **Progression & replayability**: persistent heroes with XP/levels, talent points, a kept-loot armory (keep 1 item per dungeon win, 2 per raid), dungeon unlock chain + raid attunement, and Heroic I–V difficulty ranks per dungeon.
- Random events (Spirit Healer, Goblin gambler, a certain reckless paladin...), Goblin vendors, campfires and treasure.

## Running

```bash
npm install
npm run dev        # local dev server (open on your phone via the LAN URL)
npm test           # engine tests + full-run simulations for every class/spec
npm run build      # production build into dist/
```

Optional balance report (a bot plays the whole campaign for every spec):

```bash
CAMPAIGN=1 TREES=3 npx vitest run tests/campaign.test.ts
```

## Playing on iOS

### Option A — Add to Home Screen (no Mac needed)
Host `dist/` on any HTTPS static host (GitHub Pages, Netlify, etc.), open it in Safari, then **Share → Add to Home Screen**. It runs full-screen, offline-capable, and saves progress locally.

### Option B — Native iOS app with Capacitor (requires a Mac with Xcode)
```bash
npm install
npm run build
npx cap add ios        # first time only
npx cap sync ios
npx cap open ios       # opens Xcode — pick your team and run on a device/simulator
```
`capacitor.config.json` is already set up (app id `com.warspire.game`, portrait, dark background).

## Project layout

- `src/engine/` — combat engine, run/map logic, character progression, loot, save system (UI-independent, fully unit tested).
- `src/data/` — classes, races, cards, talents, items/sets, mechanics (seals/totems/forms/pets), events, dungeons & raids.
- `src/ui/` — DOM UI: screens, SVG paper-doll character renderer, enemy art, battle backdrops.
- `tests/` — data integrity tests, "every card/enemy works" tests, and bot simulations.

*WarSpire is a fan project inspired by World of Warcraft Classic and Slay the Spire; it is not affiliated with Blizzard Entertainment or Mega Crit.*
