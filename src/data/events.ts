// "?" map nodes: Azeroth-flavored random events with choices.
export interface EventApi {
  gold(): number;
  hp(): number;
  maxHp(): number;
  level(): number;
  hasPotionSlot(): boolean;
  addGold(n: number): void;
  damage(n: number): void;
  heal(n: number): void;
  healPct(p: number): void;
  addMaxHp(n: number): void;
  addCard(id: string, up?: boolean): string; // returns card name
  addRandomClassCard(rarity: 'common' | 'uncommon' | 'rare'): string;
  addCurse(id: string): string;
  upgradeRandom(n: number): string[];
  giveItem(quality?: 'uncommon' | 'rare' | 'epic'): string;
  givePotion(): string;
  chance(p: number): boolean;
  pick<T>(a: T[]): T;
}

export interface EventResult { text: string; combat?: string[]; elite?: boolean; pick?: 'remove' | 'upgrade' | 'duplicate' }
export interface EventChoice { label: string; desc: string; req?: (a: EventApi) => boolean; go: (a: EventApi) => EventResult }
export interface EventDef { id: string; title: string; icon: string; text: string; choices: EventChoice[]; only?: string[] }

const leave: EventChoice = { label: 'Leave', desc: 'Move on.', go: () => ({ text: 'You continue deeper into the dungeon.' }) };

export const EVENTS: EventDef[] = [
  {
    id: 'spirit_healer', title: 'Spirit Healer', icon: '👼',
    text: 'A translucent angel hovers over a ring of stones. "It is not yet your time. I can bring you back... at a cost."',
    choices: [
      { label: 'Accept Resurrection', desc: 'Heal to full. Gain Resurrection Sickness (curse).', go: a => { a.healPct(1); a.addCurse('c_res_sick'); return { text: 'Warmth floods through you, but a lingering sickness remains.' }; } },
      { label: 'Pray', desc: 'Heal 15% of max HP.', go: a => { a.healPct(0.15); return { text: 'The Spirit Healer smiles faintly.' }; } },
    ],
  },
  {
    id: 'goblin_gamble', title: 'Goblin Gambler', icon: '🎲',
    text: '"Time is money, friend!" A goblin shakes a cup of dice. "Double or nothin\'!"',
    choices: [
      { label: 'Bet 50 gold', desc: '50%: win 120 gold. Otherwise lose your bet.', req: a => a.gold() >= 50, go: a => { a.addGold(-50); if (a.chance(0.5)) { a.addGold(120); return { text: 'Sixes! The goblin grumbles and pays up.' }; } return { text: 'Snake eyes. "Better luck next time!"' }; } },
      { label: 'Buy a mystery box (75g)', desc: 'Receive a random item.', req: a => a.gold() >= 75, go: a => { a.addGold(-75); const n = a.giveItem(a.chance(0.3) ? 'rare' : 'uncommon'); return { text: `Inside the box: ${n}!` }; } },
      leave,
    ],
  },
  {
    id: 'ancient_tome', title: 'Ancient Tome', icon: '📖',
    text: 'A dusty spellbook lies open on a lectern, its pages glowing with forgotten knowledge.',
    choices: [
      { label: 'Study it', desc: 'Lose 8 HP. Learn a random uncommon class ability.', go: a => { a.damage(8); const n = a.addRandomClassCard('uncommon'); return { text: `Your mind burns, but you learn ${n}.` }; } },
      { label: 'Study deeply', desc: 'Lose 16 HP. Learn a random rare class ability.', req: a => a.hp() > 16, go: a => { a.damage(16); const n = a.addRandomClassCard('rare'); return { text: `Searing insight! You learn ${n}.` }; } },
      leave,
    ],
  },
  {
    id: 'fishing_pool', title: 'Fishing Pool', icon: '🎣',
    text: 'Bubbles break the surface of an underground pool. Something shimmers beneath.',
    choices: [
      { label: 'Fish', desc: 'Catch something... or not.', go: a => {
        const r = a.pick(['gold', 'potion', 'item', 'murloc', 'nothing']);
        if (r === 'gold') { a.addGold(45); return { text: 'You reel in a waterlogged coin purse: 45 gold!' }; }
        if (r === 'potion' && a.hasPotionSlot()) { const n = a.givePotion(); return { text: `You fish up a sealed flask: ${n}.` }; }
        if (r === 'item') { const n = a.giveItem(); return { text: `A glinting treasure on your hook: ${n}!` }; }
        if (r === 'murloc') return { text: 'Mrgllglrgl! Murlocs burst out of the water!', combat: ['ev_murloc', 'ev_murloc'] };
        return { text: 'Only an old boot. You toss it back.' };
      } },
      { label: 'Rest by the water', desc: 'Heal 20% of max HP.', go: a => { a.healPct(0.2); return { text: 'The sound of water soothes your wounds.' }; } },
    ],
  },
  {
    id: 'leeroy', title: 'A Reckless Paladin', icon: '🐔',
    text: 'A paladin in mismatched armor stares at a room full of whelp eggs. "Alright, chums, I\'m back! Let\'s do this!"',
    choices: [
      { label: 'Charge in with him!', desc: 'Fight an elite now for elite rewards.', go: () => ({ text: '"LEEEEEROY JENKINS!"', combat: [], elite: true }) },
      { label: 'Wait for a plan', desc: 'Gain 25 gold from his abandoned chicken. Heal 5.', go: a => { a.addGold(25); a.heal(5); return { text: 'At least he had chicken.' }; } },
    ],
  },
  {
    id: 'mailbox', title: 'Mailbox', icon: '📬',
    text: 'An oddly placed mailbox. One letter is addressed to you: "Your auction has sold!"',
    choices: [
      { label: 'Collect gold', desc: 'Gain 60 gold.', go: a => { a.addGold(60); return { text: 'Cha-ching.' }; } },
      { label: 'Collect the package', desc: 'Receive an item.', go: a => { const n = a.giveItem(); return { text: `A package from the Auction House: ${n}.` }; } },
    ],
  },
  {
    id: 'brazier', title: 'Ancient Brazier', icon: '🕯️',
    text: 'Arcane flames dance in a brazier etched with titan runes. Your abilities resonate with its power.',
    choices: [
      { label: 'Reach into the flames', desc: 'Upgrade 2 random cards. Lose 6 HP.', go: a => { a.damage(6); const up = a.upgradeRandom(2); return { text: up.length ? `Empowered: ${up.join(', ')}.` : 'Nothing to empower.' }; } },
      { label: 'Focus your training', desc: 'Choose a card to upgrade.', go: () => ({ text: 'You meditate before the flames.', pick: 'upgrade' }) },
      leave,
    ],
  },
  {
    id: 'trainer', title: 'Wandering Class Trainer', icon: '🧑‍🏫',
    text: '"You have much to learn, young one. And some habits to unlearn."',
    choices: [
      { label: 'Unlearn a technique', desc: 'Remove a card from your deck.', go: () => ({ text: 'You let go of an old habit.', pick: 'remove' }) },
      { label: 'Learn a technique (40g)', desc: 'Gain a random class card.', req: a => a.gold() >= 40, go: a => { a.addGold(-40); const n = a.addRandomClassCard(a.chance(0.3) ? 'uncommon' : 'common'); return { text: `You learn ${n}.` }; } },
      leave,
    ],
  },
  {
    id: 'shrine', title: 'Shrine of the Light', icon: '⛪',
    text: 'A small shrine to the Light, untouched by the corruption around it.',
    choices: [
      { label: 'Pray for vigor', desc: 'Gain 6 Max HP.', go: a => { a.addMaxHp(6); return { text: 'You feel more resilient.' }; } },
      { label: 'Pray for mending', desc: 'Heal 30% of max HP.', go: a => { a.healPct(0.3); return { text: 'Your wounds close.' }; } },
    ],
  },
  {
    id: 'injured_adventurer', title: 'Injured Adventurer', icon: '🤕',
    text: 'A wounded gnome waves weakly. "My party wiped... Could you spare something?"',
    choices: [
      { label: 'Give 30 gold', desc: 'Receive their spare gear.', req: a => a.gold() >= 30, go: a => { a.addGold(-30); const n = a.giveItem('uncommon'); return { text: `Grateful, they hand you ${n}.` }; } },
      { label: 'Bandage them', desc: 'Lose 5 HP. Gain a Heavy Runecloth Bandage card.', go: a => { a.damage(5); a.addCard('n_bandage'); return { text: 'They teach you a field dressing technique.' }; } },
      leave,
    ],
  },
  {
    id: 'cursed_chest', title: 'Suspicious Chest', icon: '🧰',
    text: 'An ornate chest sits alone in an alcove. A faint purple glow seeps from the keyhole.',
    choices: [
      { label: 'Pry it open', desc: 'Receive a rare item. 50%: gain a curse.', go: a => { const n = a.giveItem('rare'); if (a.chance(0.5)) { a.addCurse('c_tongues'); return { text: `${n}... and a whispering curse.` }; } return { text: `Inside: ${n}!` }; } },
      leave,
    ],
  },
  {
    id: 'murloc_camp', title: 'Murloc Camp', icon: '🐟',
    text: 'Mrrglglglgl! A camp of murlocs guards a pile of shiny trinkets.',
    choices: [
      { label: 'Attack the camp', desc: 'Fight murlocs. Win an item.', go: () => ({ text: 'The murlocs charge!', combat: ['ev_murloc', 'ev_murloc', 'ev_murloc_oracle'] }) },
      { label: 'Sneak around', desc: 'Lose 5 HP to a sneaky nibble.', go: a => { a.damage(5); return { text: 'Something bites your ankle on the way past.' }; } },
    ],
  },
  {
    id: 'engineer', title: 'Gnomish Engineer', icon: '🔧',
    text: '"Ah, a test subject! Care to try my latest invention? Mostly safe!"',
    choices: [
      { label: 'Take a gadget', desc: 'Gain a random Engineering card.', go: a => { const id = a.pick(['n_copper_bomb', 'n_iron_grenade', 'n_net', 'n_sapper', 'n_battle_chicken']); const n = a.addCard(id); return { text: `You receive: ${n}.` }; } },
      { label: 'Volunteer as test subject', desc: '50%: gain 10 Max HP. 50%: lose 10 HP.', go: a => { if (a.chance(0.5)) { a.addMaxHp(10); return { text: 'The Gnomish Battle Enhancer works! You feel sturdier.' }; } a.damage(10); return { text: 'KABOOM. Your eyebrows are gone.' }; } },
      leave,
    ],
  },
  {
    id: 'mirror', title: 'Scrying Mirror', icon: '🪞',
    text: 'A dark mirror shows a perfect reflection of your skills.',
    choices: [
      { label: 'Gaze into it', desc: 'Duplicate a card in your deck.', go: () => ({ text: 'Your reflection steps forward and teaches you.', pick: 'duplicate' }) },
      leave,
    ],
  },
];
