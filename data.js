// data.js — Fox Curio's Floating Bookshop: core rules library.
// Single source of truth for every rule number/table/list. Values extracted from the
// original PDF (pages cited inline). Flavor text is paraphrased, never copied verbatim.
// See CLAUDE.md §6 (Data Extraction Ledger) and §2 (rulings A5/A6/A7).

export const META = {
  title: "Fox Curio's Floating Bookshop",
  subtitle: 'A Year Upon a River',
  startCoins: 100,          // How to play, p30
  startBooks: 500,          // p30
  baseBookCap: 500,         // p40
  maxBookCap: 700,          // Extra shelves x2 at Port Imes, p194 (ruling A7)
  bookTradeRate: 1,         // 1 book = 1 coin, p41
  seasonLength: 20,         // p28
  weekLength: 5,            // "A week on the River is five days", p31
  seasons: ['bloom', 'burn', 'brimming', 'brink', 'brisk'],
};

// Customer forecast tiers -> card counts. NOTE ruling A5 (CLAUDE.md §2): the per-season
// Weather tables print their own count next to each row and that number governs; the
// numbers below are the generic Reference-card summary (p221) and differ for the two
// lowest tiers (season tables use snail=2, quiet=3). The engine reads the count off each
// weather row, not this map. Kept for display only.
export const FORECAST_REFERENCE = {
  dead: 0, snail: 1, quiet: 2, steady: 4, busy: 6, extreme: 7,
};

// Book genre — roll d20 after each customer. p62 / reference p221.
export const BOOK_GENRES = [
  'Fantasy', 'Science fiction', 'Action/adventure', 'Mystery fiction/nonfiction',
  'Horror/thriller/paranormal', 'Historical fiction/nonfiction', 'Romance', "Children's",
  'Young animal', 'Autobiography/biography', 'Self-help/how-to/DIY', 'Travel',
  'Cookbooks/potion recipes', 'Crime fiction/nonfiction', 'Comic or graphic novel',
  'Fairytales/myths & legends/ghost stories', 'Magic/spell books', 'Poetry', 'Philosophy',
  'Art & design/photography',
];

// Extra customers — roll d20 at end of day. p62.
export const EXTRA_CUSTOMERS = [
  { min: 1, max: 10, draw: 0, text: 'No extra cards' },
  { min: 11, max: 15, draw: 1, text: 'Draw one extra card' },
  { min: 16, max: 19, draw: 2, text: 'Draw two extra cards' },
  { min: 20, max: 20, draw: 3, text: 'Draw three extra cards' },
];

// End-of-day customer weighting. p39.
export const CUSTOMER_WEIGHT = { normal: 10, royalty: 20 }; // royalty = J,Q,K (Ace = normal)

// ---------------------------------------------------------------------------
// CUSTOMERS — 52 prompts by suit + rank. pp54-61. Paraphrased.
// `deepen` = what they share once befriended (heart-worthy). royalty flag drives tally.
// ---------------------------------------------------------------------------
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRoyal = (r) => r === 'J' || r === 'Q' || r === 'K';

const HEARTS = [
  ['A', 'A rowdy group of schoolchildren, loud and book-loving; charming but they leave a mess.'],
  ['2', 'An elderly couple, slow-moving, blocking the shelves; cheery or grumbly by the weather.', 'They share a strange tale of the River of old.'],
  ['3', 'A quiet, purposeful tradesanimal in earthy brown/grey (beaver, badger, stoat, platypus); good repair advice.', 'They gift you a genuinely useful contraption.'],
  ['4', 'A young animal (frog, stoat, vole, bear, fox) who asks a curious question unrelated to books.', 'They share their favourite book with you.'],
  ['5', 'A traveller in strange clothes with marvellous tales of far lands.', 'They share sneaky adventures and show you trinkets.'],
  ['6', 'An animal fresh from a swim — deliberate, for pleasure, or an accidental tumble in.'],
  ['7', 'A haughty-but-polite warrior in armour, perhaps missing a limb; noisy as they move.'],
  ['8', 'An important figure in fine clothes (harbourmaster, captain, mayor); haughty or humble.', 'They confide their fears.'],
  ['9', 'A fellow bookseller — old friend, mentor, rival, or new acquaintance; talks shop.'],
  ['10', 'A well-dressed but pompous animal making loud remarks about your shop.', 'They suggest things to fix or improve.'],
  ['J', 'A surprising face you did not expect — old flame, family, old friend, or enemy.'],
  ['Q', 'A familiar face — family, a customer already in today, someone glimpsed in town, a friend.'],
  ['K', 'A strange, cloaked figure with a hidden face who buys a book without speaking.'],
];
const SPADES = [
  ['A', 'A chatty animal going on about weather, plans, or family drama.', 'They spill juicy secrets about other customers.'],
  ['2', 'A polite fisherfolk who smells of fish and keeps out of your way.', 'They discuss the fish trade and bring gifts of fresh fish.'],
  ['3', 'A shifty animal, vague, paying in strange sparking coins; things go missing.', 'They confess ambitions to be a pirate, traveller, or trader.'],
  ['4', 'A loud animal striking up conversation at inconvenient moments.', 'They tell you about their life.'],
  ['5', 'A trio of young cubs/kits who read quietly then buy a book each with coins and buttons.', 'They bring drawings of favourite books and adventure tales.'],
  ['6', 'A travelling couple who seem to have wandered in by accident, asking for local tips.'],
  ['7', 'A heavily perfumed animal whose scent makes you sneeze.', 'They boast of their many children and achievements.'],
  ['8', 'A slow-moving elderly animal who asks you to hold their many bags — but always buys.', 'They speak of a long-lost lover and wonder where they ended up.'],
  ['9', 'A riverstrider who carries goods up and down the River and knows the waterways.', 'They share River secrets — wrecks, fishing spots, berry patches.'],
  ['10', 'A delivery: this animal carries a letter or parcel for you — complaint, review, or gift.'],
  ['J', 'An astrologer who reads the stars and tells you your fortune.', 'They give you specific star-based advice.'],
  ['Q', 'A weary animal seeking shelter who leaves a big pack blocking the door.', 'They recount their travels and many misfortunes.'],
  ['K', 'A trader passing through on a run, talking up the wares on their boat.', 'They tell you where the best wares are bought.'],
];
const CLUBS = [
  ['A', 'A salesanimal, uninterested in books, trying to sell you something extravagant and useless.'],
  ['2', 'A family — eager, excited, or bored; the cubs make loud funny comments.'],
  ['3', 'A giddy booklover full of questions.', 'They shyly admit to a book they want to write.'],
  ['4', 'A seeker of knowledge who keeps asking about your most interesting books.', 'They share the best advice they ever received.'],
  ['5', 'A lanternbearer biding time before, or gearing up after, their shift.', 'They tell spooky tales of things seen along the River.'],
  ['6', 'A scholar collecting books for their library, full of rare-book lore.', 'They describe their most prized, wicked books.'],
  ['7', 'A shopkeeper from town dropping by to chat and find a book; talks business.'],
  ['8', 'A lost soul unsure where they belong, seeking books to help figure things out.', 'They tell you of a dream involving plants.'],
  ['9', 'A young couple — giggly, loud, or very quiet — blocking your way together.', 'They tell you how they met.'],
  ['10', 'A shy animal (mouse, vole, hedgehog, weasel, bee, swallow) who avoids eye contact but buys a lot.', 'They quietly say how much they like the shop.'],
  ['J', 'An animal eating something, leaving crumbs and sticky pawprints, ignoring your protests.'],
  ['Q', 'A stunning animal in delicate finery who makes you blush.'],
  ['K', 'A local legend the townsfolk gossip about — polite, and unremarkable to you.'],
];
const DIAMONDS = [
  ['A', 'A melancholic animal who blows their nose often.', 'They tell a terribly sad tale of a partner or an unlucky day.'],
  ['2', 'An overly friendly animal who knows unsettlingly much about you already — yet seems harmless.'],
  ['3', 'An animal clutching a large bag that makes an odd noise/smell/shape — and never mentions it.'],
  ['4', 'An oblivious animal (raccoon, skunk, possum, squirrel, anteater) whose tail keeps bumping shelves.', 'They tell you about their work helping others.'],
  ['5', 'A large gruff animal with a deep voice, shy about themselves.', 'They speak wistfully of favourite childhood books.'],
  ['6', 'A mischievous animal moving books around, knocking piles over, asking for books that do not exist.'],
  ['7', 'A dirty animal leaving footprints and fur.', 'They explain the messy work they do.'],
  ['8', 'An artist (weaver, carver, knitter, painter, florist, tailor) asking to sell their creations here.', 'They generously bring you a personal creation each visit.'],
  ['9', 'A magical animal who levitates their wallet and books onto the counter, drawing stares.', 'They bring charms against everyday annoyances.'],
  ['10', 'A cloaked fortune teller who reads your cards with unnervingly accurate advice.'],
  ['J', 'An animal caught in the weather — dripping, sweating, or snow-covered and apologetic.'],
  ['Q', 'A complaining animal grumbling about you, the shop, or the weather.', 'They reveal a stressful life choice weighing on them.'],
  ['K', 'A busy animal rushing about as a nuisance — but they always buy books.', 'They rattle off the many things they are juggling.'],
];

function buildSuit(suit, rows) {
  return rows.map(([rank, text, deepen]) => ({
    suit, rank, text, deepen: deepen || null, royalty: isRoyal(rank),
  }));
}
export const CUSTOMERS = {
  hearts: buildSuit('hearts', HEARTS),
  spades: buildSuit('spades', SPADES),
  clubs: buildSuit('clubs', CLUBS),
  diamonds: buildSuit('diamonds', DIAMONDS),
};

// ---------------------------------------------------------------------------
// SEASONS — weather (by card rank), daily tasks (d20), earnings (d6),
// books sold (d6 + second d6), restock, holidays, orders, weeks, calendar.
// ---------------------------------------------------------------------------
// Weather row: { rank, weather, forecast, cards, duration, noTravel? }
// duration in { 'all day','morning','afternoon','evening','night' }
// Task: { id, text, effect? }  effect keys: repair, cards (per-day delta),
//   cardsRainy, noTravel, halve, closeEarly, bonusCards+days, bonusCardsToday, needs

export const SEASONS = {
  // ===================== BLOOM ===================== (pp74-87)
  bloom: {
    name: 'Bloom', blurb: 'Snowmelt and green shoots; blossom colours the Riverbank.',
    weeks: ['Thaw', 'Birdsong', 'Sprout', 'Busk'],
    restock: 200,
    travelNote: 'Frozen until snowmelt; travel resumes on the 5th.',
    weatherEvent: { trigger: 'Warm', text: 'Warm x3: that night, luminescent insects turn the River turquoise.' },
    seasonalSigns: ['River-insect clicks and creaks', 'Hayfever sneezes', 'Sweet pollen air', 'Pollen-stained fur on customers'],
    calendar: [
      { day: 1, holiday: 'rinse', noTravel: true }, { day: 2, noTravel: true },
      { day: 3, noTravel: true }, { day: 4, noTravel: true },
      { day: 5, note: 'Snowmelt — travel resumes' }, { day: 6, note: 'Sunset 5pm' },
      { day: 12, note: 'Blooming (full) moon' }, { day: 14, holiday: 'skyflower' },
      { day: 16, note: 'Sunset 7pm' },
    ],
    // Weather table, p79
    weather: [
      { rank: 'A', weather: 'Warm and sunny.', forecast: 'extreme', cards: 7, duration: 'all day' },
      { rank: '2', weather: 'Warm, light breeze; pollen drifts.', forecast: 'busy', cards: 6, duration: 'morning' },
      { rank: '3', weather: 'Sunny and windy; pollen thick.', forecast: 'steady', cards: 4, duration: 'afternoon' },
      { rank: '4', weather: 'Cold with steady rain.', forecast: 'steady', cards: 4, duration: 'night' },
      { rank: '5', weather: 'Rain on and off.', forecast: 'steady', cards: 4, duration: 'all day' },
      { rank: '6', weather: 'Showers off and on, sunny.', forecast: 'steady', cards: 4, duration: 'afternoon' },
      { rank: '7', weather: 'Sunny; the water is clear.', forecast: 'busy', cards: 6, duration: 'all day' },
      { rank: '8', weather: 'Strong winds; blossoms blown away, rough water.', forecast: 'quiet', cards: 3, duration: 'all day', noTravel: true },
      { rank: '9', weather: 'Thunderstorm; dark water.', forecast: 'snail', cards: 2, duration: 'morning' },
      { rank: '10', weather: 'Warm.', forecast: 'busy', cards: 6, duration: 'evening' },
      { rank: 'J', weather: 'Hail.', forecast: 'snail', cards: 2, duration: 'morning' },
      { rank: 'Q', weather: 'Sunny.', forecast: 'extreme', cards: 7, duration: 'evening' },
      { rank: 'K', weather: 'Blustery and warm.', forecast: 'busy', cards: 6, duration: 'all day' },
    ],
    // Daily tasks, pp80-82
    tasks: [
      { id: 1, text: 'Boxes of new stock to price and shelve. What titles interest you?' },
      { id: 2, text: 'The windows need cleaning. Who or what dirtied them?' },
      { id: 3, text: 'Dust and tidy shelves; return misplaced books. Which strayed furthest?' },
      { id: 4, text: 'Refresh the front window display around a theme.' },
      { id: 5, text: 'Overdue bookkeeping — tally inventory and receipts. Need a restock?' },
      { id: 6, text: 'Blossoms drifted in; sweep them before customers tread them into the carpet.' },
      { id: 7, text: 'Pollen makes your nose run — burn eucalyptus incense or suffer all day.', effect: { needs: 'Eucalyptus incense' } },
      { id: 8, text: 'A customer broke the outside tap; it leaks. Fix with washer + spanner, or call a plumber.', effect: { repair: 'plumbing', cards: -1 } },
      { id: 9, text: 'Nook beetles have infested the shop. You need BugOff spray.', effect: { repair: 'beetles', cards: -1, needs: 'BugOff Spray' } },
      { id: 10, text: 'Repaint the walls to freshen the space. What colour?' },
      { id: 11, text: 'All the clocks stopped; you open late. Halve customers and earnings today.', effect: { halve: true } },
      { id: 12, text: 'Clean the dirtied rugs and mats — air them on deck if fine.' },
      { id: 13, text: 'Make holiday decorations; young ones offer to help.' },
      { id: 14, text: 'A stray tugball smashed a window. Call a glassmith; cover it meanwhile.', effect: { repair: 'glass' } },
      { id: 15, text: 'Oil the deck if fine, else oil the till and clockwork.' },
      { id: 16, text: 'Build a themed book display.' },
      { id: 17, text: 'Sweep blossoms off the deck and gutters all day.' },
      { id: 18, text: 'Read a new arrival and write a shelf review. Which book, which genre?' },
      { id: 19, text: 'Set up a themed sale with posters. Draw +1 customer card for the next two days.', effect: { bonusCards: 1, days: 2 } },
      { id: 20, text: 'Design merch: 20 book bags at 10 coins. Even roll = a customer buys one.' },
    ],
    earnings: [32, 75, 83, 55, 42, 68],           // d6 -> coins, p83
    booksSold: [50, 40, 35, 30, 60, 70],          // d6 -> value, then + second d6, p83
    orders: [
      { customer: 'Mia', at: 'Thistle Down', book: 'Raven: The Stories of a Hero', from: 'Arborea', reward: 53 },
      { customer: 'Tam', at: 'Arborea', book: 'The Breeze in the Brambles', from: 'Roost', reward: 50 },
      { customer: 'Mave', at: 'Roost', book: 'Reedy to Cook', from: 'Ennerck', reward: 42 },
    ],
    holidays: ['rinse', 'skyflower'],
  },

  // ===================== BURN ===================== (pp88-105)
  burn: {
    name: 'Burn', blurb: 'Hot days and harvests; the sun barely sets.',
    weeks: ['Bask', 'Simmer', 'Hearth', 'Harvest'],
    restock: 250,
    travelNote: 'Travel allowed all season.',
    weatherEvent: { trigger: 'Thunderstorm', text: 'Thunderstorm x3: next day a bushfire burns near town — join the townsfolk to fight it.' },
    seasonalSigns: ['Buzzing insect songs', 'Lazy, relaxed animalfolk', 'Coloured flags on boats and shops'],
    calendar: [
      { day: 6, note: 'Sunset 8pm' }, { day: 7, holiday: 'reed' }, { day: 8, holiday: 'reed' },
      { day: 12, note: 'Burning (full) moon' }, { day: 14, holiday: 'harvest' },
      { day: 16, note: 'Sunset 10pm' }, { day: 18, holiday: 'solstice_burn' },
    ],
    // Weather table, p93 (some rows omit the printed count; filled per ruling A5 convention)
    weather: [
      { rank: 'A', weather: 'Warm and sunny; the water is clear.', forecast: 'extreme', cards: 7, duration: 'all day' },
      { rank: '2', weather: 'Hot and breezy.', forecast: 'steady', cards: 4, duration: 'morning' },
      { rank: '3', weather: 'Hot and humid.', forecast: 'quiet', cards: 3, duration: 'evening' },
      { rank: '4', weather: 'Thunderstorm; the sky is black.', forecast: 'snail', cards: 2, duration: 'night' },
      { rank: '5', weather: 'Sunny, partly cloudy.', forecast: 'steady', cards: 4, duration: 'all day' },
      { rank: '6', weather: 'Showers off and on, sunny.', forecast: 'busy', cards: 6, duration: 'all day' },
      { rank: '7', weather: 'Sunny; the water glistens.', forecast: 'busy', cards: 6, duration: 'evening' },
      { rank: '8', weather: 'Still and hot.', forecast: 'steady', cards: 4, duration: 'all day' },
      { rank: '9', weather: 'Thunderstorm; the water is dark.', forecast: 'snail', cards: 2, duration: 'morning' },
      { rank: '10', weather: 'Warm, partly cloudy.', forecast: 'steady', cards: 4, duration: 'afternoon' },
      { rank: 'J', weather: 'Stiflingly warm.', forecast: 'quiet', cards: 3, duration: 'afternoon' },
      { rank: 'Q', weather: 'Sunny with a light breeze.', forecast: 'extreme', cards: 7, duration: 'evening' },
      { rank: 'K', weather: 'Cloudy and cool; the water is grey.', forecast: 'steady', cards: 4, duration: 'all day' },
    ],
    tasks: [
      { id: 1, text: 'Boxes of new stock to price and shelve. What titles interest you?' },
      { id: 2, text: 'The windows need cleaning. Who or what dirtied them?' },
      { id: 3, text: 'Dust and tidy shelves. Where is the most misplaced book?' },
      { id: 4, text: 'Refresh the window display; a customer offers an item from their pack. What is it?' },
      { id: 5, text: 'The third customer shrieks — nook beetles! You need BugOff spray.', effect: { repair: 'beetles', cards: -1, needs: 'BugOff Spray' } },
      { id: 6, text: 'Young swimmers tracked water in; mop the puddles.' },
      { id: 7, text: 'A loud fly you cannot find buzzes about, irritating you all day.' },
      { id: 8, text: 'The little fan breaks; customers wilt and leave. Fix with a spanner, or call a clocksmith.', effect: { repair: 'fan', cards: -1 } },
      { id: 9, text: 'The till jams; ask customers for exact change all day.' },
      { id: 10, text: 'Make holiday decorations; a friend may help.' },
      { id: 11, text: 'The weather makes you close up early. Why?', effect: { closeEarly: true } },
      { id: 12, text: 'Skip the chores; sit with a cool drink. What has made you happy lately?' },
      { id: 13, text: 'Repaint the walls, or patch marks. What colour?' },
      { id: 14, text: 'Build a themed book display.' },
      { id: 15, text: 'Overdue bookkeeping — tally inventory and receipts. Need a restock?' },
      { id: 16, text: 'Word of mouth brings a crowd by afternoon. Draw +2 customer cards.', effect: { bonusCardsToday: 2 } },
      { id: 17, text: 'Rearrange shelves, moving unpopular genres to the front; customers ask for exactly those.' },
      { id: 18, text: 'Raft maintenance if fine — oil decks and paddle, coil ropes — else tidy the counter.' },
      { id: 19, text: 'You make cool juice; grateful customers want cups, so you mix drinks all day.' },
      { id: 20, text: 'Read a new arrival and write a shelf review. Which book, which genre?' },
    ],
    earnings: [20, 28, 42, 59, 50, 63],           // p97
    booksSold: [50, 40, 50, 30, 60, 70],
    orders: [
      { customer: 'Pino', at: 'Mersey', book: 'The History of Tugball', from: 'Plenty', reward: 55 },
      { customer: 'Flint', at: 'Port Imes', book: 'Love & Lemon Myrtle', from: 'Rueberry', reward: 60 },
      { customer: 'Mia', at: 'Thistle Down', book: 'Slugs, Snails and other Slimy tales', from: 'Hurst', reward: 54 },
    ],
    holidays: ['reed', 'harvest', 'solstice_burn'],
  },

  // ===================== BRIMMING ===================== (pp106-121)
  brimming: {
    name: 'Brimming', blurb: 'Flooding brings chaos to the River.',
    weeks: ['Frogsong', 'Flood', 'Rush', 'Ease'],
    restock: 220,
    travelNote: 'Travel impossible days 7–17 (flooding) unless raft is reinforced.',
    floodDays: { from: 7, to: 17 },
    weatherEvent: { trigger: 'Sunny', text: 'Sunny x3: next day a cloud of vibrant butterflies settles on dry surfaces above the floodwaters.' },
    seasonalSigns: ['Strong current pulls loose things away', 'Jagged rocks and logs stop travel', 'Loud rushing water everywhere'],
    calendar: [
      { day: 4, holiday: 'night_market' }, { day: 7, note: 'Flooding begins', noTravel: true },
      { day: 8, noTravel: true }, { day: 9, noTravel: true }, { day: 10, noTravel: true },
      { day: 11, noTravel: true }, { day: 12, noTravel: true }, { day: 13, holiday: 'breakneck', noTravel: true },
      { day: 14, note: 'Brimming (full) moon', noTravel: true }, { day: 15, noTravel: true },
      { day: 16, noTravel: true }, { day: 17, note: 'Floodwaters recede' },
    ],
    // Weather table, p111
    weather: [
      { rank: 'A', weather: 'Cold with steady rain.', forecast: 'steady', cards: 4, duration: 'all day' },
      { rank: '2', weather: 'Blustery and chilly.', forecast: 'quiet', cards: 3, duration: 'morning' },
      { rank: '3', weather: 'Warm.', forecast: 'steady', cards: 4, duration: 'morning' },
      { rank: '4', weather: 'Stormy; thunder grumbles, sky black.', forecast: 'quiet', cards: 3, duration: 'night' },
      { rank: '5', weather: 'Cloudy.', forecast: 'busy', cards: 6, duration: 'all day' },
      { rank: '6', weather: 'Thunderstorm; loud thunder, distant lightning.', forecast: 'snail', cards: 2, duration: 'all day', noTravel: true },
      { rank: '7', weather: 'Sunny.', forecast: 'busy', cards: 6, duration: 'all day' },
      { rank: '8', weather: 'Steady rain; sky and water grey.', forecast: 'quiet', cards: 3, duration: 'all day' },
      { rank: '9', weather: 'Cool; a chill breeze.', forecast: 'steady', cards: 4, duration: 'morning' },
      { rank: '10', weather: 'Cloudy and warm.', forecast: 'busy', cards: 6, duration: 'afternoon' },
      { rank: 'J', weather: 'Hot.', forecast: 'extreme', cards: 7, duration: 'afternoon' },
      { rank: 'Q', weather: 'Light rain.', forecast: 'steady', cards: 4, duration: 'evening' },
      { rank: 'K', weather: 'Heavy rain.', forecast: 'snail', cards: 2, duration: 'all day' },
    ],
    tasks: [
      { id: 1, text: 'Boxes of new stock to price and shelve. What titles interest you?' },
      { id: 2, text: 'The windows look grubby in the morning light. Who or what dirtied them?' },
      { id: 3, text: 'Dust and tidy shelves. Where is the most misplaced book?' },
      { id: 4, text: 'Refresh the window display around a theme.' },
      { id: 5, text: 'Flood debris has swept around the raft; clear it before it causes damage.' },
      { id: 6, text: 'A drifting log holes the decking. You need a shipwright; patch it, but no travel until fixed.', effect: { repair: 'deck', noTravel: true } },
      { id: 7, text: 'Sort and reply to the mail. What is the funniest letter?' },
      { id: 8, text: 'Roof piping breaks; rain soaks customers at the door. Fix with spanner + pipes, or a plumber. On rainy days, draw two fewer cards until fixed.', effect: { repair: 'piping', cardsRainy: -2 } },
      { id: 9, text: 'You net floating debris — mostly sticks, occasionally something useful. What do you find?' },
      { id: 10, text: 'Make holiday decorations; excited customers offer to help.' },
      { id: 11, text: 'Overdue bookkeeping — tally inventory and receipts. Need a restock?' },
      { id: 12, text: 'Build a themed book display.' },
      { id: 13, text: 'A roof leak needs a shipwright; the dripping bucket irritates you. No travel until fixed.', effect: { repair: 'roof', noTravel: true } },
      { id: 14, text: 'Refresh the shop layout — a few shelves, or everything.' },
      { id: 15, text: 'A leak sprang above a bookshelf overnight; rearrange furniture to avoid it. Needs a shipwright; no travel until fixed.', effect: { repair: 'roof', noTravel: true } },
      { id: 16, text: 'The River is mesmerising; between customers, watch the strong waters from the deck.' },
      { id: 17, text: 'A customer says something that occupies your thoughts all day.' },
      { id: 18, text: 'Raft maintenance if fine — oil decks and paddle, coil ropes — else tidy the counter.' },
      { id: 19, text: 'If fine, climb up and check the roof for leaks and damage.' },
      { id: 20, text: 'Dry the damp couch and rugs — by the fire if cool, on deck if nice.' },
    ],
    earnings: [20, 45, 60, 55, 68, 37],           // p115
    booksSold: [50, 40, 30, 30, 60, 70],
    orders: [
      { customer: 'Calom', at: 'Mersey', book: 'Fisher Fables', from: 'Port Imes', reward: 70 },
      { customer: 'Elma', at: 'Arborea', book: 'New Leaf', from: 'Thistle Down', reward: 55 },
    ],
    holidays: ['night_market', 'breakneck'],
  },

  // ===================== BRINK ===================== (pp122-137)
  brink: {
    name: 'Brink', blurb: 'Cooling weather; the River slows, leaves fall.',
    weeks: ['Reedsong', 'Frost', 'Fall', 'Quieting'],
    restock: 200,
    travelNote: 'Travel allowed all season. Last restock (until Bloom) is the 19th.',
    lastRestockDay: 19,
    weatherEvent: { trigger: 'Heavy fog', text: 'Heavy fog x3: next day a dense fog blankets the River — travel stops and everyone stays in.' },
    seasonalSigns: ['Crunchy leaves on deck and gutters', 'Misty, frosty mornings', 'Thick jumpers and scarves', 'Nights cool enough for a fire'],
    calendar: [
      { day: 1, holiday: 'salmon_run' }, { day: 6, note: 'Sunset 6pm' },
      { day: 7, holiday: 'gloomin' }, { day: 8, holiday: 'gloomin' }, { day: 9, holiday: 'gloomin' }, { day: 10, holiday: 'gloomin' },
      { day: 15, note: 'Brink (full) moon' }, { day: 16, note: 'Sunset 5pm' },
      { day: 19, note: 'Last chance to restock until Bloom' }, { day: 20, holiday: 'weeping' },
    ],
    // Weather table, p127
    weather: [
      { rank: 'A', weather: 'Cool with light showers.', forecast: 'busy', cards: 6, duration: 'all day' },
      { rank: '2', weather: 'Frosty.', forecast: 'busy', cards: 6, duration: 'morning' },
      { rank: '3', weather: 'Blustery; leaves tossed around.', forecast: 'busy', cards: 6, duration: 'afternoon' },
      { rank: '4', weather: 'Strong winds; windows rattle, debris thrown against boats.', forecast: 'quiet', cards: 3, duration: 'morning', noTravel: true },
      { rank: '5', weather: 'Freezing rain.', forecast: 'steady', cards: 4, duration: 'all day' },
      { rank: '6', weather: 'Warm; the water is clear.', forecast: 'busy', cards: 6, duration: 'afternoon' },
      { rank: '7', weather: 'Heavy fog; objects blurry and smudged.', forecast: 'quiet', cards: 3, duration: 'all day', noTravel: true },
      { rank: '8', weather: 'Cold with a light breeze.', forecast: 'steady', cards: 4, duration: 'evening' },
      { rank: '9', weather: 'Thunderstorm.', forecast: 'snail', cards: 2, duration: 'morning' },
      { rank: '10', weather: 'Fog; the River is silent and eerie.', forecast: 'snail', cards: 2, duration: 'all day', noTravel: true },
      { rank: 'J', weather: 'Hail.', forecast: 'quiet', cards: 3, duration: 'evening' },
      { rank: 'Q', weather: 'Misty; everything soft and blurry.', forecast: 'steady', cards: 4, duration: 'afternoon' },
      { rank: 'K', weather: 'Blustery and warm.', forecast: 'extreme', cards: 7, duration: 'all day' },
    ],
    tasks: [
      { id: 1, text: 'Boxes of new stock to price and shelve. Which titles are highly praised?' },
      { id: 2, text: 'The windows need cleaning. Who or what dirtied them?' },
      { id: 3, text: 'Dust and tidy shelves. What is the strangest misplaced book you find?' },
      { id: 4, text: 'Refresh the window display around a theme.' },
      { id: 5, text: 'The chimney clogged; no fire until fixed and customers are cold. Call a firesmith.', effect: { repair: 'chimney', cards: -1 } },
      { id: 6, text: 'A customer knocks the woodpile over; tidying it, customers keep getting in the way.' },
      { id: 7, text: 'The deck has frosted over and is slippery; melt the ice, opening late.' },
      { id: 8, text: 'Leaves have blown into the gutter overnight; clear them between customers.' },
      { id: 9, text: 'Leaves blow in and cover the shelves and floor; you sweep all day.' },
      { id: 10, text: 'Maintain the fireplace for the season ahead; a customer makes it trickier. How?' },
      { id: 11, text: 'Tidy the messy desk; a customer makes you spill tea on important papers. What were they?' },
      { id: 12, text: 'The deck plants need care — watering, trimming, repotting.' },
      { id: 13, text: 'A roof leak needs a shipwright; the dripping irritates you. No travel until fixed.', effect: { repair: 'roof', noTravel: true } },
      { id: 14, text: 'Overdue bookkeeping — tally inventory and receipts. Need a restock?' },
      { id: 15, text: 'Make holiday decorations; young ones offer great ideas.' },
      { id: 16, text: 'The weather makes you close up early. Why?', effect: { closeEarly: true } },
      { id: 17, text: 'Young ones report a hole in the decking. You need a shipwright; no travel until fixed.', effect: { repair: 'deck', noTravel: true } },
      { id: 18, text: 'Build a themed book display; customers comment on your choices.' },
      { id: 19, text: 'You wake with a cold — make ginger tea if you have the ingredients, else sniffle all day.', effect: { needs: 'Ginger tea ingredients' } },
      { id: 20, text: 'Reorganise book sections; move the least popular categories to the front.' },
    ],
    earnings: [20, 45, 60, 55, 65, 62],           // p131
    booksSold: [50, 40, 25, 30, 60, 70],
    orders: [
      { customer: 'Meri', at: 'Roost', book: 'Beekeeping for the Brave', from: 'Arborea', reward: 30 },
      { customer: 'Heli', at: 'Rueberry', book: 'Keeping Crickets as Pets', from: 'Mersey', reward: 25 },
      { customer: 'Peako', at: 'Plenty', book: 'The Adventures of Rickety Bee: The Gates of Murlo', from: 'Mersey', reward: 35 },
    ],
    holidays: ['salmon_run', 'gloomin', 'weeping'],
  },

  // ===================== BRISK ===================== (pp138-151)
  brisk: {
    name: 'Brisk', blurb: 'The quietest season; snow and ice cover the River.',
    weeks: ['Chill', 'Hush', 'Blanket', 'Awaken'],
    restock: null,                                 // trade stops; restock unavailable
    travelNote: 'River frozen; shop cannot move after the 9th. Foot travel needs a bulrush jacket + ice skates.',
    lastMoveDay: 9,
    weatherEvent: { trigger: 'Snowstorm', text: 'Snowstorm x3: next day a massive snowstorm forces everyone inside all day.' },
    seasonalSigns: ['Everything white and cold', 'The River dramatically changed', 'Breath mists in the air', 'Sounds muffled in snow'],
    calendar: [
      { day: 3, note: 'River freezes solid', noTravel: true }, { day: 4, noTravel: true },
      { day: 5, noTravel: true }, { day: 6, note: 'Sunset 12pm', noTravel: true },
      { day: 7, noTravel: true }, { day: 8, noTravel: true },
      { day: 9, note: 'Make a Starfall lantern for the solstice', noTravel: true },
      { day: 10, holiday: 'solstice_brisk', noTravel: true }, { day: 11, noTravel: true },
      { day: 12, note: 'Brisk (full) moon', noTravel: true }, { day: 13, noTravel: true },
      { day: 14, noTravel: true }, { day: 15, noTravel: true }, { day: 16, note: 'Sunset 3pm', noTravel: true },
      { day: 17, noTravel: true }, { day: 18, holiday: 'ice_dance', noTravel: true },
      { day: 19, noTravel: true }, { day: 20, noTravel: true },
    ],
    // Weather table, p143
    weather: [
      { rank: 'A', weather: 'Snowstorm; wind howls against the windows.', forecast: 'dead', cards: 0, duration: 'all day', noTravel: true },
      { rank: '2', weather: 'Cold but clear.', forecast: 'steady', cards: 4, duration: 'morning' },
      { rank: '3', weather: 'Cold and cloudy, light breeze.', forecast: 'snail', cards: 2, duration: 'evening' },
      { rank: '4', weather: 'Cold and sunny; everything glistens.', forecast: 'steady', cards: 4, duration: 'afternoon' },
      { rank: '5', weather: 'Snow; everything quiet.', forecast: 'quiet', cards: 3, duration: 'all day' },
      { rank: '6', weather: 'Light snowfall.', forecast: 'steady', cards: 4, duration: 'all day' },
      { rank: '7', weather: 'Cool and sunny.', forecast: 'steady', cards: 4, duration: 'evening' },
      { rank: '8', weather: 'Heavy snow, no visibility.', forecast: 'dead', cards: 0, duration: 'all day', noTravel: true },
      { rank: '9', weather: 'Thick snow.', forecast: 'snail', cards: 2, duration: 'morning' },
      { rank: '10', weather: 'Sleet and strong winds, no visibility.', forecast: 'dead', cards: 0, duration: 'night', noTravel: true },
      { rank: 'J', weather: 'Bitterly cold; icicles hang from trees and bushes.', forecast: 'quiet', cards: 3, duration: 'afternoon' },
      { rank: 'Q', weather: 'Sleet.', forecast: 'quiet', cards: 3, duration: 'evening' },
      { rank: 'K', weather: 'Cold and windy.', forecast: 'snail', cards: 2, duration: 'all day' },
    ],
    tasks: [
      { id: 1, text: 'Spend the day reading a book that intrigues you; write a shelf review. Which book, which genre?' },
      { id: 2, text: 'The windows need cleaning. Who or what dirtied them?' },
      { id: 3, text: 'Dust and tidy shelves. Where is the most misplaced book?' },
      { id: 4, text: 'Redecorate the front window around a theme for the quiet weeks.' },
      { id: 5, text: 'The door handle freezes shut; defrost it or find another way to reach customers.' },
      { id: 6, text: 'The chimney is clogged; the fire is out and customers leave cold. Call a firesmith.', effect: { repair: 'chimney', cards: -1 } },
      { id: 7, text: 'Thick snow covers the deck; the first customer offers to help shovel. Accept?' },
      { id: 8, text: 'Snow-laden gutters leak into icicles that menace the door. Fix with spanner + pipes or a plumber; snap icicles each morning.', effect: { repair: 'gutters' } },
      { id: 9, text: 'Skip the chores; sit and enjoy the atmosphere with a cup of tea.' },
      { id: 10, text: 'A snowball breaks the window; customers leave cold. Call a glassmith.', effect: { repair: 'glass', cards: -1 } },
      { id: 11, text: 'You cannot light the oil lamps; the shop is dark for a day. Light candles if you have them.' },
      { id: 12, text: 'The cold stops the till for a day. Gear oil fixes it now; otherwise draw one fewer card.', effect: { repair: 'till', cards: -1, needs: 'Gear oil' } },
      { id: 13, text: 'The weather makes you close up early. Why?', effect: { closeEarly: true } },
      { id: 14, text: 'A teetering pile of mail; sort and reply. Best and worst letters?' },
      { id: 15, text: 'Snow tracked in soaked the rugs; dry them indoors if the weather is bad.' },
      { id: 16, text: 'Restack and dry the snowy woodpile; a customer or friend offers to help.' },
      { id: 17, text: 'Dusters have nested in the shop, knocking things over. Tempt or trap them out.' },
      { id: 18, text: 'You spill the last lantern oil; the shop is dark until you buy more.', effect: { repair: 'lanternOil', cards: -1, needs: 'Lantern oil' } },
      { id: 19, text: 'Build a themed book display.' },
      { id: 20, text: 'Refresh the shop layout for the new year — a few shelves, or everything.' },
    ],
    earnings: [20, 10, 16, 27, 30, 25],           // p147
    booksSold: [50, 40, 35, 30, 60, 70],
    orders: [
      { customer: 'Art', at: 'Plenty', book: "The River-Wader's Handbook (Updated and revised)", from: 'Hurst', reward: 65 },
      { customer: 'Nim', at: 'Kiawake', book: 'Beyonders: The History of the Beyond told by Twelve Travellers', from: 'Port Imes', reward: 73 },
      { customer: 'Kurto', at: 'Ennerck', book: 'River Bends', from: 'Plenty', reward: 40 },
      { customer: 'Eunice', at: 'Hurst', book: 'The View From Up Here', from: 'Kiawake', reward: 68 },
    ],
    holidays: ['solstice_brisk', 'ice_dance'],
  },
};

// ---------------------------------------------------------------------------
// HOLIDAYS — pp84-87,98-105,116-121,132-137,148-151. name/date/location/3 prompts/token.
// `openPenalty` true everywhere: skipping a holiday to open = snail's-pace forecast (p34).
// ---------------------------------------------------------------------------
export const HOLIDAYS = {
  rinse: {
    name: 'Rinse', season: 'bloom', day: 1, location: 'All River',
    about: 'New-year tradition: swim in the barely-thawed River to rinse off the old year, then warm up by riverbank fires with hot, spicy drinks and share dreams.',
    participate: 'Swim and ponder a dream for the year; decide what to wash away. Gather at the fire with a hot drink.',
    prompts: [
      'Someone hands you a hot drink after your swim — the start of a long friendship. Who is it?',
      'A townsfolk gives you a pot and seed to plant with your swim-water. Do you plant it?',
      'The young ones dare you to a longest-in-the-water contest. How long do you last?',
    ],
    token: 'A bottle of the drink you enjoyed after your swim.',
  },
  skyflower: {
    name: 'Skyflower Festival', season: 'bloom', day: 14, location: 'All River', // ruling A6
    about: 'Pink skyflowers fall and carpet the River. Considered good luck, they are made into sweet cordial; young ones hand out flower chains and crowns.',
    participate: 'Drink skyflower cordial (not too much), join the feasts, sing, and take a flower chain.',
    prompts: [
      'You join a game of dizzy paddle — spun in a canoe, then racing an obstacle course. How do you go?',
      'Everyone has an hour to write and perform a short play. What is your play about?',
      'Spin the bottle: you must add a line to a silly song. What line do you contribute?',
    ],
    token: 'A splitting headache the next day.',
  },
  reed: {
    name: 'Reed Festival', season: 'burn', day: 7, days: [7, 8], location: 'Riverwide',
    about: 'Reeds are harvested and carved into flutes on the first day; songs and performances fill the second. Young ones leave reeds in the pockets of those they fancy.',
    participate: 'Harvest and carve a reed flute (day 1), then play it with the townsfolk (day 2).',
    prompts: [
      'A townsfolk says the flute sings sweeter if you carve something of yourself into it. What do you carve?',
      'While carving, the talk turns to a strange happening at a past Reed Festival. What was it?',
      'The young ones perform a ballad about a mishap with a boat and some trousers. What happened?',
    ],
    token: 'A mysterious reed flute appears in your pocket. Who gave it to you?',
  },
  harvest: {
    name: 'Harvest Feast', season: 'burn', day: 14, location: 'Riverwide',
    about: "The year's first harvest feast. A dance asks the spirits to raise the River again (do not overdo it, or Brimming turns heavy). Long tables groan with food into the night.",
    participate: 'Join the dance, then fill a plate. Rueberry holds the biggest celebration.',
    prompts: [
      'You are asked to join the Rueberry harvest on the 16th of Burn. Do you go?',
      'A popping-berry contest: how many citrusy berries fit in your mouth before they burst?',
      'Dive for golden rocks hidden in the riverbed. Roll d6 — 1–3: nothing; 4: blackberry pie; 5: fig jam; 6: crisp tart apples.',
    ],
    token: 'A recipe for your favourite dish, from a kind animalfolk.',
  },
  solstice_burn: {
    name: 'Burn Solstice (Midnight Sun)', season: 'burn', day: 18, location: 'Riverwide',
    about: "On the solstice the sun does not set. A delirious night of dares; young ones try to stay awake longest while elders work the long day, then rest.",
    participate: 'Join a town celebration of the midnight sun. Dare others and take a dare yourself.',
    prompts: [
      'The young ones play hide-and-seek around town and the houseboats. Where do you hide?',
      'You are dared to stay awake all night and still open the shop. Do you?',
      'You are asked to read scary stories to the little ones. What story do you tell?',
    ],
    token: 'You spend the next day in bed, or wishing you could.',
  },
  night_market: {
    name: 'Night Market', season: 'brimming', day: 4, location: 'Plenty',
    about: 'Merchants from the Great Sea and Beyond bring wares to the lily-pad stalls of Plenty for one night of food, songs, and trinkets.',
    participate: 'Wander the stalls, buy an item or two, and eat some market food.',
    prompts: [
      'A fortune teller warns something shocking will happen this week. What is it?',
      'A trinket recalls a fable — an object said to grant a wish at the cost of a dream. Do you buy it?',
      'Candles that smell of your favourite thing; you buy half a dozen. What is their scent?',
    ],
    token: 'You somehow spend 100 coins and are not sure where. Deduct 100 coins.',
    tokenEffect: { coins: -100 },
  },
  breakneck: {
    name: 'Breakneck Rapids Race', season: 'brimming', day: 13, location: 'Riverwide',
    about: 'Daring animalfolk race canoes down the flooded River. Three races: the speed trial, the honoured Roost-to-Plenty, and the fun cobble-together DIY race.',
    participate: 'Watch from the bank, then join the DIY race — build a boat from reeds, bark, cardboard and old inflatables.',
    prompts: [
      'An unexpected face enters the speed trial. Who is it?',
      'The DIY winners use something very silly to keep their boat afloat. What was it?',
      'A shocking twist in the Roost-to-Plenty race — the winner overcame a big setback. What happened?',
    ],
    token: 'You come home dripping wet with a small trophy.',
  },
  salmon_run: {
    name: 'Salmon Run', season: 'brink', day: 1, location: 'Riverwide',
    about: 'Giant, sacred salmon travel up the River. Some animalfolk swim the whole River alongside them, from Rivermouth to Thistle Down, over the season.',
    participate: 'Join the swim when the swimmers reach your town. (Port Imes 1st; Plenty 3rd; Arborea 7th; Ennerck 8th; Kiawake 9th; Mersey 10th; Hurst 13th; Roost 15th; Rueberry 19th; Thistle Down 20th.)',
    prompts: [
      'You swim a stretch alongside the salmon. What is it like to share their journey?',
      'A salmon surfaces to converse with you. What does it say?',
      'You watch the swimmers pass. Do you envy them, or are you content to watch?',
    ],
    token: 'A giant salmon scale, the size of a dinner plate, found floating on the water.',
  },
  gloomin: {
    name: 'Gloomin', season: 'brink', day: 7, days: [7, 8, 9, 10], location: 'Riverwide',
    about: 'For four nights, giant moths hatch and swarm toward any light, big enough to carry off an animal. Towns empty before sunset and extinguish all lights.',
    participate: 'Close early or head home before sunset; hide all lights and draw the curtains. Shelter with, or welcome, others.',
    prompts: [
      'On the second night, a knock at your door. Do you open it? Who is it?',
      'You invent a game with a broom and a basket. What is the game?',
      'Stuck inside, you sort your belongings and find holiday trinkets. Which brings back fond memories?',
    ],
    token: 'A lasting fear of giant moths.',
  },
  weeping: {
    name: 'Weeping Day', season: 'brink', day: 20, location: 'Riverwide',
    about: 'As the weeping trees drop their last leaves, animalfolk remember their dead, believed to have lived in the trees for a year. Candles and vigils are held beneath the branches.',
    participate: 'Sit beneath the weeping trees, watch the leaves fall, and remember or support those who grieve.',
    prompts: [
      'A ghostly figure walks behind the gathering. Does it seem familiar?',
      'You learn a regular customer died this month; you place their favourite book at the tree. Which book?',
      'A story of the dead reveals a relative of yours had a connection to the River. Who, and what connection?',
    ],
    token: 'A carved wooden salmon token, made to remember a friend.',
  },
  solstice_brisk: {
    name: 'Brisk Solstice (Darkfall)', season: 'brisk', day: 10, location: 'Riverwide',
    about: 'The longest night. Animalfolk make lanterns for a parade to a great bonfire, shed the old year by throwing pinecones into the fire, and roast nuts and berries into the morning.',
    participate: 'Make a lantern and join the parade; enjoy soup and warm tarts; throw a pinecone with something you want to leave behind.',
    prompts: [
      'Coloured lights dance and weave a pattern in the sky. What do they remind you of?',
      'The finest lantern is a golden fish that shines light from its mouth. What are your favourites?',
      'A magician enchants everyone’s snow creations to move. What snow creation do you make?',
    ],
    token: 'You feel lighter, freer, and more optimistic for the future.',
  },
  ice_dance: {
    name: 'Ice Dance Festival', season: 'brisk', day: 18, location: 'Riverwide',
    about: 'On the frozen River, skaters race and dance to live music, snowanimals are built, and candles line the ice while a feast warms every paw.',
    participate: 'Find a partner or dance alone, enjoy the music, and grab a warm drink and a plate.',
    prompts: [
      'Invited to go sledding without a sled, you improvise with something from your shop. What?',
      'A traditional dance tells of the River falling in love with the mountain gods. Happy or tragic ending?',
      'The musicians take a request — a song you heard on the River this year. Which song?',
    ],
    token: 'A song from the dance stuck in your head the next day.',
  },
};

// ---------------------------------------------------------------------------
// ORDER OF PLAY — pp42,46. For the day-engine walkthrough (Phase 3).
// ---------------------------------------------------------------------------
export const ORDER_OF_PLAY = {
  bookselling: [
    'Draw two cards: read the Weather table (rank) and its forecast; draw a 3rd card if the duration is not all day.',
    'Place facedown the number of customer cards the forecast calls for.',
    'Roll d20 for the daily task; add/remove customer cards if the task says so.',
    'Begin your journal. Flip the first customer card, read the prompt, roll d20 for book genre.',
    'Continue flipping customer cards until all are done.',
    'End of day: roll d20 on the Extra customers table; draw more cards if prompted.',
    'Tally total customers (+10 each normal card, +20 each royalty); roll d6 earnings and d6 (+d6) books sold.',
    'Shuffle the deck.',
  ],
  daysOff: [
    'Draw two cards and read the Weather table; check the calendar for holidays.',
    'Choose your day — celebration, town, travel, fishing — and journal it.',
    'Record customers and earnings as zero; deduct any purchases.',
  ],
  closingEarly: 'Play the customer cards for the day but skip the extra-customer roll; tally customers, earnings and books sold as usual, then halve them.',
};

// ---------------------------------------------------------------------------
// CHARACTER CREATION option lists — pp18-21.
// ---------------------------------------------------------------------------
export const CREATION = {
  names: ['Torrent', 'Rin', 'Corr', 'Meri', 'Adria', 'Lyra', 'Reva', 'Myri', 'Kia', 'Tun',
    'Tako', 'April', 'Moss', 'Arn', 'Bea', 'Dern', 'Rye', 'Tay', 'Goz', 'Kari', 'Esta', 'Rillan'],
  species: ['Beaver', 'Water rat', 'Shrew', 'Harvest mouse', 'Otter', 'Mink', 'Vole', 'Hare',
    'Bee', 'Capybara', 'Badger', 'Rabbit', 'Wallaby', 'Weasel', 'Duck', 'Swan', 'Wren', 'Owl',
    'Falcon', 'Penguin', 'Platypus', 'Echidna', 'Frog', 'Lizard', 'Snake', 'Turtle'],
  ages: ['Young', 'Wise', 'Optimistic', 'Pessimistic', 'Fresh', 'Grey-furred', 'Weary'],
  acquisition: [
    'You inherited it from family — parents, grandparents, or a mysterious relative.',
    'You bought it after seeing it advertised in the paper; it felt right.',
    'You applied for the job after the previous bookseller went missing.',
    'You found it moored and empty, and the townsfolk simply started calling you the bookseller.',
    'It was given to you — by parents, a friend, a stranger, or a mysterious patron.',
  ],
  formerLifeBookseller: [
    'You ran a pristine, orderly shop in a busy inland town and know the trade.',
    'You worked a dusty, failing seaside shop and want a fresh start somewhere lively.',
    'You worked in the stifling family book business and want to prove yourself.',
  ],
  formerLifeOther: [
    'You were a wandering traveller doing odd jobs; now you want a place of your own.',
    'You lived and worked on the water and cannot sleep without its rocking — but have never met this River.',
    'You have just finished your studies and are unsure what the future holds.',
  ],
  booksToYou: [
    'Friends since childhood, telling you stories and taking you on adventures.',
    'Heavy back-pain machines that look nice on shelves but you never open.',
    'Enjoyable ways to pass time, with a few favourites deep in your heart.',
    'Unimportant — plays and songs are more your thing.',
  ],
  moons: [
    { key: 'blooming', name: 'Blooming moon', text: 'Shy and quiet but full of potential; easy to trust and thriving around others.' },
    { key: 'burning', name: 'Burning moon', text: 'Warm and passionate; can be lazy and slow, but easy to fire up.' },
    { key: 'brimming', name: 'Brimming moon', text: 'Fast-moving and adaptable; swept up by ideas and obsessions, dislikes sitting still. Fine riverstriders.' },
    { key: 'brink', name: 'Brink moon', text: 'Creative and bold; particular about home and comforts, thriving when making things. Great painters, weavers, writers.' },
    { key: 'brisk', name: 'Brisk moon', text: 'Brave and strong; can seem cold at first. Fine lanternbearers, warriors, blacksmiths.' },
  ],
  items: [
    'A sweater in plain colours', 'A nicely ironed, clean collared shirt',
    'Large glasses that always seem smudged', 'Odd socks of varying colours and lengths',
    'A flat-brimmed hat with a long ribbon', 'A large floppy hat you must keep pushing up',
    'Corduroy pants with holes in the knees', 'Bright, oversized trousers you roll up',
    'A silver monocle on a long chain', 'A gold, slightly dented pocket watch',
    'A well-loved knitted shawl that keeps you warm', 'A ragged scar',
    'A long coat with deep pockets that swishes', 'A missing limb, ear, tail, eye, or wing',
    'A crutch, wheelchair, or walking stick', 'An eyepatch',
    'A bandana/neckerchief (several, for different occasions)', 'A comfortable old puffy vest',
    'A well-worn jacket with ironed-on arm patches', 'A patchy pair of overalls',
  ],
};

// Bookshop setup lists — pp22-23.
export const SHOP_SETUP = {
  quirks: [
    'The floor slants slightly to the left.',
    'The front door jams in cold weather.',
    'During thunderstorms the roof creaks ominously.',
    'Suspicious claw marks mark the wooden floor.',
    'In strong winds a mournful singing is heard — the windows, or...?',
    'A small hole in the back-left corner; in warm months tiny footsteps scurry.',
    'Paddled around the River, the raft drifts ever so slightly right.',
  ],
  broughtItems: [
    'A porcelain teapot painted by your grandmother',
    'A wind chime that sings sweet songs',
    'A large knitted rug with swirling, hypnotic shapes',
    'A photograph of a faraway land from your friends',
    'A tall potted plant that grows purple flowers in Bloom',
    'A small statue of a smiling god',
    'A couple of blue paper lanterns that float in the air',
    'A string of fairy lights',
    'A skull of a three-horned beast',
    'A large illustrated map of the land',
    'A charm to ward off monsters',
    "A woven doormat reading 'Beware'",
    'A hard-to-decipher tapestry — a beheading, or animals playing with a face-like ball?',
  ],
  leftovers: [
    'A large dent in the counter; loose change and pencils roll into it.',
    "A kitchen mug reading 'River's Best Dad.'",
    "A pinned note with a sketched map and an 'x' in the middle.",
    "A book bookmarked: 'Must tell Ena her grandson stopped by with urgent news.'",
    'A somewhat lewd drawing carved into the countertop.',
    'A pen that writes notes to you when you leave the room.',
    'A faded blue jacket in the corner; a small gold key in the pocket.',
    'A plant with round green leaves that seems to move when unwatched.',
    'A rickety, very comfortable wooden chair with maroon cushions.',
    'A palm-sized red lantern with a half-melted candle that floats when lit.',
  ],
};
