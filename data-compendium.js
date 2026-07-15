// data-compendium.js — reference content: towns, shops, post offices, distances, recipes,
// fish/animals/plants, trades, occupations, astrology, fishing, item catalog.
// Extracted from the PDF (pages cited). Flavor paraphrased, never copied. See CLAUDE.md §6.

// ---------------------------------------------------------------------------
// TOWNS — pp152-195. Ordered upstream (Thistle Down) -> downstream (Port Imes).
// ---------------------------------------------------------------------------
export const TOWNS = [
  {
    key: 'thistle_down', name: 'Thistle Down', course: 'upper',
    blurb: 'A bustling town of academics and inventors; colourful flags and debated carved symbols.',
    notable: ['Thistle Down School', 'Ancient Library of Wonderment and Wisdom', 'Lavish Theatre'],
    seasonal: 'Higher up, it often gets early snowfalls in mid-late Brink.',
    characters: [
      { name: 'Mia', species: 'Weasel', pronouns: 'she/her', note: 'Gathers bulrush and crafts warm jackets, blankets and pillows.' },
      { name: 'Von', species: 'Turtle', pronouns: 'they/them', note: 'Perpetually gloomy; adds miserable comments to any conversation.' },
    ],
    shops: [
      { name: 'Rushdown Clothing', items: [{ name: 'Bulrush jacket', price: 120, note: 'Brink & Brisk only; enables Brisk river travel' }] },
      { name: "Appleford's Food Store", items: [
        { name: 'Cream', price: 20 }, { name: 'Cheese', price: 15 }, { name: 'Bag of potatoes', price: 8 },
        { name: 'Bag of carrots', price: 4 }, { name: 'Ginger', price: 19 }, { name: 'Chestnuts', price: 15 }] },
      { name: 'The Bake House', items: [
        { name: 'Chestnut sweet buns', price: 3, note: 'pack of two' }, { name: 'Caramel sweet buns', price: 3, note: 'pack of two' },
        { name: 'Honey slice', price: 7 }, { name: 'Curry pie', price: 10 }] },
    ],
    specialBooks: [{ title: 'New Leaf: Starting Afresh', price: 34 }],
  },
  {
    key: 'rueberry', name: 'Rueberry', course: 'upper',
    blurb: 'Built by farmers on rich soil; giant wildflowers shade the streets and vast fields stretch behind.',
    notable: ['Dreaming Frog Tavern', 'Floating Fields', "Kern's Fortunes and Misfortunes"],
    seasonal: 'Wildflowers shade the town in Bloom/Burn; harvest crowds fill it in Burn/Brink.',
    characters: [
      { name: 'Manuka', species: 'Wallaby', pronouns: 'she/her', note: 'A town fixture on her bench, 9am-4pm daily.' },
      { name: 'Heli', species: 'Sugar glider', pronouns: 'she/her', note: "Owns Sprout's Grocery; teaches dance on the fifth day of each week." },
    ],
    shops: [
      { name: "Sprout's Grocery", items: [
        { name: 'Beetroot', price: 10 }, { name: 'Parsnips', price: 10 }, { name: 'Cheese', price: 45 },
        { name: 'Wildflower cordial', price: 33 }, { name: 'Bag of apples', price: 17, note: 'Merry variety' }, { name: 'Lemon myrtle leaves', price: 20 }] },
      { name: 'Moss & Thicket', items: [
        { name: 'Mystery seed', price: 20, note: 'grows in 20 days; purple, white (glows), or orange' }, { name: 'Plant pot', price: 40 }] },
      { name: "Jammin'", items: [
        { name: 'Blueberry jam', price: 40 }, { name: 'Apple jam', price: 35 }, { name: 'Orange marmalade', price: 30 }] },
    ],
    specialBooks: [{ title: 'Love & Lemon Myrtle', price: 30 }],
  },
  {
    key: 'roost', name: 'Roost', course: 'upper', availability: ['bloom', 'burn', 'brink'],
    blurb: 'A wandering tent-town that appears on the Riverbank in Bloom, Burn and Brink; a nightly communal fire shares news from Beyond.',
    notable: ["Ki's Haunted Tent", "Flower's Sandwiches", 'Tent of Living Stories', 'The Box with Teeth'],
    seasonal: 'Present only in Bloom, Burn and Brink; empty during Brimming and Brisk.',
    characters: [
      { name: 'Meri', species: 'Heron', pronouns: 'they/them', note: 'Soft-spoken tarot reader, widely travelled.' },
      { name: 'Calico', species: 'Possum', pronouns: 'she/her', note: 'Born deaf; makes protective glass companions.' },
    ],
    shops: [
      { name: 'The Food Tent', items: [
        { name: 'Ginger', price: 30 }, { name: 'Chilli berries', price: 20, note: 'pack of three' }, { name: 'Calming tea blend', price: 40 },
        { name: 'Focus tea blend', price: 40 }, { name: 'Broth', price: 20 }, { name: 'Hearty stock', price: 35 }] },
      { name: 'Adventuring Gear', items: [
        { name: 'Ice skates', price: 150, note: 'enables Brisk river travel' }, { name: 'Candles', price: 10, note: 'pack of three' }] },
    ],
    specialBooks: [{ title: 'The Breeze in the Brambles', price: 20 }],
  },
  {
    key: 'hurst', name: 'Hurst', course: 'upper',
    blurb: 'A squat, friendly town built by small animalfolk, with spacious gathering areas and some of the best swimming spots on the River.',
    notable: ['Bathing Ponds', 'Chestnut Bakery', 'Stained walkway', 'Checker Square'],
    seasonal: 'Waters fill with young swimmers in Burn; a swim race is held at Burn Solstice.',
    characters: [
      { name: 'Eunice', species: 'Hedgehog', pronouns: 'they/them', note: 'Busy post-office clerk who knows all the River travel times; wears a monocle.' },
    ],
    shops: [
      { name: 'Maintenance Shop', items: [
        { name: 'Gear oil', price: 45, note: 'keeps gears turning' }, { name: 'Washer', price: 12, note: 'for leaks' }] },
      { name: 'The Corner Shop', items: [
        { name: 'Fire lettuce', price: 5 }, { name: 'Spiced acorn cider', price: 5 }, { name: 'Smoking drink', price: 2 }, { name: 'Chestnuts', price: 22 }] },
    ],
    specialBooks: [{ title: 'Slugs, Snails and other Slimy tales', price: 50 }, { title: "The River-Wader's Handbook (Updated and revised)", price: 43 }],
  },
  {
    key: 'mersey', name: 'Mersey', course: 'middle',
    blurb: 'A floating town of reed platforms linked by planks; washing lines flap and plants trail from verandahs.',
    notable: ['Lightsmith Workshop', 'Afternoon Tea House', 'Washway Laundry'],
    seasonal: 'Largely unaffected by Brimming floods; a ghost (Torrena) haunts it in Brisk.',
    characters: [
      { name: 'Pino', species: 'Harvest mouse', pronouns: 'she/her', note: 'Runs the grocery with her wife Geri; always a little flustered.' },
    ],
    shops: [
      { name: "Gilli's Fish shop", items: [{ name: 'Fresh fish fillet', price: 25, note: 'seasonal' }] },
      { name: 'Mersey General Supplies', items: [
        { name: 'Eucalyptus incense', price: 20, note: 'for runny noses' }, { name: 'BugOff Spray', price: 30, note: 'Nook beetle treatment' },
        { name: 'Pipes', price: 60 }, { name: 'Candles', price: 11, note: 'pack of five, wattle scented' }] },
      { name: "O. Kay's Grocery", items: [
        { name: 'Wheat flour', price: 5 }, { name: 'Jar of pickles', price: 8 }, { name: 'Cream', price: 10 },
        { name: 'Wattle cordial', price: 19 }, { name: 'Bag of apples', price: 12, note: 'Pink Salmon variety' }] },
    ],
    specialBooks: [{ title: 'The Adventures of Rickety Bee: The Gates of Murlo', price: 18 }, { title: 'Keeping Crickets as Pets', price: 22 }],
  },
  {
    key: 'kiawake', name: 'Kiawake', course: 'middle',
    blurb: 'A town on reed poles high above the water, reached by stairs; kites spin and woven curtains hang over doorways.',
    notable: ["Traveller's Roost Tavern", "Kirk's Flying Devices", 'Starfilled Observatory'],
    seasonal: 'In Brimming the floodwaters rise to the lowest platform; you moor and walk straight in.',
    characters: [
      { name: 'Carr', species: 'Frilled neck lizard', pronouns: 'they/them', note: 'Grumbly takeaway cook who sneaks regulars extra chips.' },
      { name: 'Gason', species: 'Owl', pronouns: 'he/him', note: 'A busy postowl who knows everyone; referees tugball on days off.' },
    ],
    shops: [
      { name: 'Flippers Takeaway', items: [
        { name: 'Fish and chips', price: 12 }, { name: 'Fish cakes', price: 10, note: 'three, spicy creamy sauce' }] },
      { name: 'Stream Supplies', items: [{ name: 'Gear oil', price: 50 }, { name: 'Pipes', price: 40 }] },
      { name: 'Grocery Shop', items: [
        { name: 'Reed flour', price: 4 }, { name: 'Reed bread', price: 13 }, { name: 'Rice', price: 8, note: 'one bag' }] },
    ],
    specialBooks: [{ title: 'The View from up Here, by T. Leaf', price: 48 }],
  },
  {
    key: 'ennerck', name: 'Ennerck', course: 'lower',
    blurb: 'Mahogany buildings cloaked in reed-scent; the River’s main reed processor, full of woven baskets and carved decoration.',
    notable: ['Singing Square', "Merwin's Magical Cloaks and Other Disguises", 'Kinderwood Forest'],
    seasonal: 'Reed harvests are in full swing during Burn.',
    characters: [
      { name: 'Kurto', species: 'Beaver', pronouns: 'he/him', note: 'Surly boat-worker who builds wonderful cricket houses.' },
      { name: 'Tella', species: 'Otter', pronouns: 'she/them', note: 'A River courier who grumbles about the weather.' },
    ],
    shops: [
      { name: 'Reed Emporium', items: [
        { name: 'Eucalyptus incense', price: 20, note: 'packet of 10 sticks' }, { name: 'BugOff Spray', price: 55, note: 'prevention & treatment' }, { name: 'Basket', price: 100 }] },
      { name: 'Riverst Grocery', items: [
        { name: 'Stock', price: 40 }, { name: 'Reed flowers', price: 10, note: 'cinnamon-like flavour' }, { name: 'Rice', price: 7 },
        { name: 'Reed flour', price: 7 }, { name: 'Bag of apples', price: 15, note: 'Red Waltz variety' }] },
      { name: "Skipper Pye's", items: [
        { name: 'Lantern oil', price: 70 }, { name: 'Spanner', price: 130 }, { name: 'Reed raft reinforcements', price: 250, note: 'enables Brimming downstream travel' }] },
    ],
    specialBooks: [{ title: 'Reedy to Cook: 100 Fragrant Recipes for Cooking with Reeds', price: 53 }],
  },
  {
    key: 'arborea', name: 'Arborea', course: 'lower',
    blurb: 'A town inside a giant hollow tree, warm and cosy; renowned Beefolk make honey and nectar. A market runs the 5th/10th/15th/20th of Bloom, Burn and Brink.',
    notable: ['Treebark Library', 'River Brew House', "Jedda's Charms: For Healing and Protection"],
    seasonal: 'Warmest refuge in Brisk; surrounded by wattle/bottlebrush/myrtle blossom in Bloom/Burn.',
    marketBonus: { days: [5, 10, 15, 20], seasons: ['bloom', 'burn', 'brink'], bonusCards: 2, note: '+2 customer cards when selling on market days' },
    characters: [
      { name: 'Tam', species: 'Bear', pronouns: 'he/them', note: 'Large but kind; helps the beefolk. Missing one eye, with a different story each time.' },
      { name: 'Lark', species: 'Stoat', pronouns: 'they/them', note: 'A silent lanternbearer who startles travellers from the dark trees.' },
    ],
    shops: [
      { name: 'Honey Darling', items: [
        { name: 'Myrtle honey', price: 60 }, { name: 'Lemon honey', price: 60 }, { name: 'Wattle honey', price: 60 }, { name: 'Mead', price: 34 }] },
      { name: 'Branch Grocery', items: [
        { name: 'Lemon myrtle leaves', price: 15 }, { name: 'Wattle tea', price: 20 }, { name: 'Myrtle jam', price: 38 },
        { name: 'Bag of chestnuts', price: 20 }, { name: 'Chilli berries', price: 10, note: 'pack of three' }, { name: 'Chestnut flour', price: 6 }] },
      { name: 'River Supplies', items: [
        { name: 'Spanner', price: 105 }, { name: 'Washer', price: 10 }, { name: 'Candles', price: 20, note: 'pack of 15, myrtle scented' }] },
    ],
    specialBooks: [{ title: 'Beekeeping for the Brave', price: 35 }, { title: 'Raven: The Stories of a Hero', price: 42 }],
  },
  {
    key: 'plenty', name: 'Plenty', course: 'lower',
    blurb: 'A fishing town on giant lily pads that sway with the water; patched-up buildings, nets and hooks everywhere.',
    notable: ['Underwater Theatre', 'Cursed Flame', 'Floating Gardens'],
    seasonal: 'Unaffected by Brimming floods (the pads rise); River stars bloom around it in Bloom.',
    characters: [
      { name: 'Jerry & the Warblers', species: 'Frogs', pronouns: 'he/him', note: 'A beloved band of four frogs (bass, drums, keys, and Jerry).' },
      { name: 'Palin', species: 'Platypus', pronouns: 'he/them', note: 'Known for elaborate decorated hats and a warm greeting for everyone.' },
    ],
    shops: [
      { name: "Lily's Lilies", items: [
        { name: 'River lily cordial', price: 18 }, { name: 'Bouquet of River lilies', price: 25 }, { name: 'River lily honey', price: 50 }] },
      { name: 'Riverboat Equipment', items: [
        { name: 'BugOff spray', price: 30 }, { name: 'Lantern oil', price: 20 }, { name: 'Spanner', price: 110 }] },
      { name: 'Plenty To Takeaway', items: [
        { name: 'Fish and chips', price: 9 }, { name: 'Fish cakes', price: 10 }, { name: 'Fish dumplings', price: 12 }, { name: 'Fillet of fish', price: 27 }] },
    ],
    specialBooks: [{ title: 'The History of Tugball', price: 50 }, { title: 'River Bends', price: 20 }],
  },
  {
    key: 'port_imes', name: 'Port Imes', course: 'lower',
    blurb: 'The bustling trade centre nearest the Rivermouth; goods from the Great Sea and Beyond, and wares sold nowhere else.',
    notable: ['Fountain of Fortune', "Burr's Dumplings", 'Tree of Many Faces'],
    seasonal: 'In Brisk, ice-trapped crews repair vessels. Does not take part in the Reed Festival or Harvest Feast.',
    characters: [
      { name: 'Brady', species: 'Falcon', pronouns: 'he/him', note: 'The portmaster; knows every trade vessel and still finds time to chat.' },
      { name: 'Farron', species: 'Echidna', pronouns: 'he/them', note: 'A purple-clad magician with a terrible memory who collects rare magical plants.' },
      { name: 'Harti', species: 'Duck', pronouns: 'she/her', note: 'Tired mother of many; sings heartbreaking songs in a lovely voice.' },
    ],
    shops: [
      { name: "Ime's General Supplies", items: [
        { name: 'Lantern oil', price: 80 }, { name: 'Gear oil', price: 30 }, { name: 'Chestnut coffee beans', price: 70 }, { name: 'Ice skates', price: 150, note: 'enables Brisk travel' }] },
      { name: 'Riverbank Furniture', items: [
        { name: 'Extra shelves', price: 400, note: '+100 max inventory; can be purchased twice' },
        { name: 'Record player', price: 500, note: '+1 customer card every day; single purchase' }] },
      { name: 'Port Bakery', items: [
        { name: 'Custard tart', price: 10 }, { name: 'Apricot housecakes', price: 10, note: 'pack of two' }, { name: 'Oat bread', price: 20 },
        { name: 'Honey bread', price: 18 }, { name: 'Myrtle & cheese bread', price: 22 }] },
    ],
    specialBooks: [{ title: 'Fisher Fables', price: 30 }, { title: 'Beyonders: The History of the Beyond told by Twelve Travellers', price: 55 }],
  },
];

// Post offices — snail/owl/express times (days) & prices; seasonal unavailability. pp158-194.
export const POST_OFFICES = {
  thistle_down: { snail: { days: [10, 20], price: 5, unavailable: ['brisk', 'brimming'] }, owl: { days: [4, 6], price: 10, briskPrice: 12 }, express: { days: [1, 3], price: 15, unavailable: ['brimming', 'brisk'] } },
  rueberry: { snail: { days: [10, 20], price: 3, unavailable: ['brisk'] }, owl: { days: [4, 6], price: 6, briskPrice: 8 } },
  hurst: { snail: { days: [10, 20], price: 2, unavailable: ['brisk', 'brimming'] }, owl: { days: [4, 6], price: 4, briskPrice: 7 } },
  mersey: { snail: { days: [13, 25], price: 6, unavailable: ['brisk', 'brimming'] }, owl: { days: [7, 8], price: 10, briskPrice: 12 } },
  kiawake: { snail: { days: [8, 19], price: 5, unavailable: ['brisk', 'brimming'] }, owl: { days: [3, 6], price: 9, briskPrice: 11 } },
  ennerck: { snail: { days: [13, 25], price: 6, unavailable: ['brisk', 'brimming'] }, owl: { days: [7, 8], price: 10, briskPrice: 12 }, express: { days: [1, 4], price: 12, unavailable: ['brisk', 'brimming'] } },
  arborea: { snail: { days: [12, 23], price: 5, unavailable: ['brisk', 'brimming'] }, owl: { days: [5, 8], price: 7, briskPrice: 11 } },
  plenty: { snail: { days: [10, 20], price: 8, unavailable: ['brisk', 'brimming'] }, owl: { days: [3, 6], price: 12, briskPrice: 14 } },
  port_imes: { snail: { days: [10, 20], price: 4, unavailable: ['brisk', 'brimming'] }, owl: { days: [3, 5], price: 7, briskPrice: 10 }, express: { days: [1, 2], price: 13, unavailable: ['brisk', 'brimming'] } },
  // Roost is a wandering town without a listed post office.
};

// Travel distances (days) between adjacent towns, upstream order. +1 day travelling upstream. p155.
export const DISTANCES = [
  { from: 'thistle_down', to: 'rueberry', days: 1 },
  { from: 'rueberry', to: 'roost', days: 2 },
  { from: 'roost', to: 'hurst', days: 2 },
  { from: 'hurst', to: 'mersey', days: 3 },
  { from: 'mersey', to: 'kiawake', days: 2 },
  { from: 'kiawake', to: 'ennerck', days: 2 },
  { from: 'ennerck', to: 'arborea', days: 1 },
  { from: 'arborea', to: 'plenty', days: 3 },
  { from: 'plenty', to: 'port_imes', days: 2 },
];

// Journey & Arrival prompts. pp66-69.
export const JOURNEY_PROMPTS = [
  'What is your first impression of the town? Does it look different by season or festival?',
  'What is your favourite thing about this town?',
  'What is one thing that scares you about this town?',
  'You see something big and mysterious on the Riverbank. What is it?',
  'You glimpse animalfolk sitting along the Riverbank. What are they doing?',
  'You hear animalfolk singing on the Riverbank. What is the song?',
  'You see something strange in the River waters as you arrive. What is it?',
  'Something is out of the ordinary along this stretch of River. What is it?',
];
export const ARRIVAL = {
  bloom: ['Blossoms cover the wharf and water.', 'A magnificent boat is docked (two days); townsfolk gossip about its owner.', 'A busy local market is on.', 'Fishing boats sort a big haul on the wharf.', 'Animalfolk fish, sketch, weave and make along the wharf.', 'The wharf is being repaired after a collision — wait a day before docking.'],
  burn: ['Smoke spirals from the forest behind town; hazy nights ahead.', 'Harvest is underway; the air is full of voices.', 'Animalfolk stand ankle-deep or swim lazily by the wharf.', 'A band sets up near the wharf for an evening show.', 'A tugball game tonight fills the River with spectators.', 'A market is held along the wharf.'],
  brimming: ['A fallen tree blocks the riverpath — wait a day before docking.', 'Plant debris covers the water; animalfolk clear it.', 'A food stall on the wharf sends aromatic smells over the water.', 'Interesting boats and houseboats are moored at the wharf.', 'The wharf is being repaired — wait a day.', 'Chattering animalfolk cast fishing lines from the wharf.'],
  brink: ['The wharf is full of colourful boats and canoes.', 'A fallen tree blocks the riverpath — wait a day.', 'The wharf is being repaired; not finished for another day.', 'The wharf is eerily quiet and empty.', 'A local market is on — voices and cooking smells.', 'Leaves cover the River, wharf and town; your steps crunch.'],
  brisk: ['Snow-animal figures decorate the ice around the wharf.', 'A cordoned ice rink; animals spin in merry circles.', 'A snowdrift has covered the wharf; only the end lantern shows.', 'A snow slide at the wharf’s end; animals whiz down.', 'The wharf twinkles with beautiful lights.', 'The wharf is quiet and still; no town sounds.'],
};

// ---------------------------------------------------------------------------
// FISHING — p70-71. Procedure only; species gated by season below.
// ---------------------------------------------------------------------------
export const FISHING = {
  procedure: [
    'Shuffle the deck (skip if fishing mid-bookselling day).',
    'Draw cards face up in a line until a royal appears — each card is an hour passing; the royal is a bite.',
    'Keep drawing (reeling in) until two same-colour cards land next to each other.',
    'Two black cards: the fish slipped away. Two red cards: you hooked and landed it.',
  ],
};

// ---------------------------------------------------------------------------
// ANIMALS & PLANTS — pp204-208.
// ---------------------------------------------------------------------------
export const FISH = [
  { name: 'Blue suncatcher', seasons: ['bloom', 'burn', 'brimming'], prompt: 'Reminds you of warm memories on the River.' },
  { name: 'Ice kin', seasons: ['brisk'], prompt: 'Reminds you of a time when you were warm.' },
  { name: 'Murroa', seasons: ['bloom', 'burn', 'brimming', 'brink', 'brisk'], prompt: 'Reminds you of a time you had to hide something.' },
  { name: 'Rainbow skip', seasons: ['brink'], prompt: 'Reminds you of a friend.' },
  { name: 'Red-bellied jewel', seasons: ['bloom', 'burn', 'brimming', 'brink', 'brisk'], prompt: 'You reflect on your time on the River.' },
  { name: 'River gulper', seasons: ['bloom', 'burn'], prompt: 'You think of a customer who had a lasting effect on you.' },
  { name: 'Stream spinner', seasons: ['bloom', 'burn'], prompt: 'Reminds you of a time you felt joyful.' },
  { name: 'Water-beater', seasons: ['bloom', 'burn', 'brimming', 'brink'], prompt: 'Reminds you of a time when you were scared.' },
];
export const ANIMALS = [
  { name: 'Dusters', text: 'Small black furry creatures that nest in dusty depths; munch paper and socks, always in groups.' },
  { name: 'Galosh beetles', text: 'Large shiny riverbank insects that leave gumboot-shaped tracks in the mud; young ones race them.' },
  { name: 'Giant moths', text: 'Grey furry monsters big enough to carry off an animal; drawn to any light, they swarm the River for a few nights each year (see Gloomin).' },
  { name: 'Nook beetles', text: 'Paper-chewing pests that crawl through cracks and emit a shrill chirp; where there is one, there are a hundred.' },
  { name: 'Salmon', text: 'Ship-long sacred fish that arrive each year, speaking a melodic language and telling tales of salt and sea monsters.' },
  { name: 'Scurry crabs', text: 'Elusive river crabs that nip stray toes; iridescent red when grown and very tasty roasted.' },
];
export const PLANTS = [
  { name: 'Giant lilies', text: 'Pads up to 10m wide, thick as a tree; used as platforms, marketplaces and homes, common in the lower course.' },
  { name: 'Reeds', text: 'Thick red-striped grasses with endless uses: bridges, houses, instruments, boats.' },
  { name: 'River lilies', text: 'Many-scented lilies in every colour but blue and green; fill the air with sweet aromas.' },
  { name: 'River stars', text: 'Tiny plants with white surface flowers that cover the water in Bloom, looking like stars.' },
  { name: 'Skyflowers', text: 'Pink star-like flowers that fall from the skyfields; made into dizzying cordial and used to sweeten baking.' },
  { name: 'Thimble grass', text: 'Round yellow stems with a sweet taste; thimble-shaped seeds float and travel to root.' },
  { name: 'Weeping trees', text: 'Willow-like trees with teardrop leaves, deeply sacred to the Riverfolk, especially at Brink.' },
];

// ---------------------------------------------------------------------------
// RECIPES — pp202-203. Each shared meal reveals something about a friend.
// ---------------------------------------------------------------------------
export const RECIPES = [
  { name: 'Cheesy parsnips', ingredients: ['Parsnips', 'Cheese', 'A chilli berry'], reveals: 'A story about how they let someone down.' },
  { name: 'Chilli stew', ingredients: ['A chilli berry', 'Two different vegetables', 'Broth or stock'], reveals: 'A raucous tale of youthful mischief.' },
  { name: 'Fish cakes', ingredients: ['Fresh fish (bought or caught)', 'Bag of potatoes or rice', 'Jar of pickles'], reveals: 'Their favourite place on the River.' },
  { name: 'Ginger tea', ingredients: ['Lemon myrtle leaves', 'Ginger'], reveals: 'Something shocking about themselves. (Also clears your nose and throat.)' },
  { name: 'Hearty soup', ingredients: ['Broth or stock', 'Cream', 'A vegetable'], reveals: 'A time when they found courage.' },
  { name: 'Honey cakes', ingredients: ['Honey', 'Flour'], reveals: 'A heartfelt story.' },
  { name: 'Jam sandwiches', ingredients: ['Bread', 'Jam or marmalade'], reveals: 'Their dream career.' },
  { name: 'Pastry pockets', ingredients: ['Flour', 'Cheese', 'Ginger', 'Carrots (savoury) or apples (sweet)'], reveals: 'How they are really feeling today.' },
  { name: 'Pudding', ingredients: ['A flavouring (coffee beans, river lily cordial, or honey)', 'Flour', 'Cream'], reveals: 'Someone they admire.' },
  { name: 'Roasted Honey Chestnuts', ingredients: ['Bag of chestnuts', 'Honey', 'A fire to roast over'], reveals: 'A regret.' },
  { name: 'Salad', ingredients: ['Reed flowers', 'Bread', 'Greens', 'A cordial for dressing'], reveals: 'A secret.' },
];

// ---------------------------------------------------------------------------
// TRADES — p209. Hire via post office (arrives next day); each day roll a die:
// odd = fixed today, even = +1 day. Deduct the daily cost each day worked.
// ---------------------------------------------------------------------------
export const TRADES = [
  { key: 'plumber', name: 'Plumber', perDay: 70, fixes: 'Taps, sinks, drains, piping.' },
  { key: 'glassmith', name: 'Glassmith', perDay: 50, fixes: 'New window panes.' },
  { key: 'shipwright', name: 'Shipwright', perDay: 80, fixes: 'Broken decks, paddles, roofs, rudders.' },
  { key: 'clocksmith', name: 'Clocksmith', perDay: 50, fixes: 'Clocks and geared objects, including the till.' },
  { key: 'firesmith', name: 'Firesmith', perDay: 60, fixes: 'Unclogs chimneys, cleans fireplaces, mends general appliances.' },
];
export const TRADE_RULE = { hireVia: 'post office', arrival: 'next day', timing: 'Each day roll a die: odd = fixed that day, even = +1 day. Deduct the daily cost each day.' };

// Which trade resolves each repair flag used in SEASONS tasks.
export const REPAIR_TRADES = {
  plumbing: 'plumber', piping: 'plumber', gutters: 'plumber',
  glass: 'glassmith', chimney: 'firesmith',
  deck: 'shipwright', roof: 'shipwright',
  fan: 'clocksmith', till: 'clocksmith',
  beetles: null, lanternOil: null, // resolved by items, not tradesanimals
};

// Short human labels for each repair flag (for UI). Content, so it lives here.
export const REPAIR_LABELS = {
  plumbing: 'Broken tap', piping: 'Broken roof piping', gutters: 'Leaking gutters',
  glass: 'Broken window', chimney: 'Clogged chimney',
  deck: 'Holed decking', roof: 'Roof leak',
  fan: 'Broken fan', till: 'Jammed till',
  beetles: 'Nook beetles', lanternOil: 'Out of lantern oil',
};

// ---------------------------------------------------------------------------
// OCCUPATIONS — pp210-211 (partial list).
// ---------------------------------------------------------------------------
export const OCCUPATIONS = [
  { name: 'Blacksmith', text: 'Works steel and iron — anchors, knives, ship metal.' },
  { name: 'Firesmith', text: 'Cleans fireplaces and chimneys and builds incredible fires.' },
  { name: 'Fisherfolk', text: 'Spends days on the water with nets, poles and crab pots.' },
  { name: 'Lanternbearer', text: 'Lights the wayfinding lanterns along the River and wharves; tough and brave.' },
  { name: 'Magician', text: 'Knows the way of magic — charms, spells and entertaining displays.' },
  { name: 'Postmaster', text: 'Runs a post office; knows the trade routes and mail obstructions.' },
  { name: 'Plumber', text: 'Fixes pipes, sinks, drains and bathrooms.' },
  { name: 'Reeder', text: 'Harvests and carves reeds into thatch, instruments, staffs and paddles.' },
  { name: 'Riversift', text: 'Walks the Riverbank collecting interesting debris to resell.' },
  { name: 'Riverstrider', text: 'Carries goods and passengers up and down the River; a skilled navigator.' },
  { name: 'Shipwright', text: 'Maintains and builds boats, houseboats and canoes.' },
];

// ---------------------------------------------------------------------------
// ASTROLOGY — pp214-216. Moon meanings.
// ---------------------------------------------------------------------------
export const ASTROLOGY = [
  { key: 'blooming', name: 'Blooming moon', text: 'A time of growing and beginning again; things started now take hold — but do not get carried away.' },
  { key: 'burning', name: 'Burning moon', text: 'A volatile time; things simmer and warm up. A chance to try something new.' },
  { key: 'brimming', name: 'Brimming moon', text: 'Secrets surface, limits are tested, truths spoken; high creativity, but beware burnout.' },
  { key: 'brink', name: 'Brink moon', text: 'A chance to breathe — clarity, taking stock, looking after yourself.' },
  { key: 'brisk', name: 'Brisk moon', text: 'Rest and recovery; a season of solitude. Things may cool off or end — thank them and reflect.' },
];

// ---------------------------------------------------------------------------
// SPECIAL EVENTS — Appendix VIII, pp217-220 (paraphrased procedures).
// ---------------------------------------------------------------------------
export const SPECIAL_EVENTS = {
  lanternMaking: { name: 'Lantern-making', text: 'For the Brisk Solstice. Choose a shape (circular, conical, pear, rectangular, fish-like, dragon-like), a number of openings (one, two, many), and a binding (twine cord or plaited string).' },
  parcelsAndLetters: { name: 'Receiving parcels & letters', text: 'A reply arrives in twice the mail time from your current town. Mark the expected day. If you have 2+ hearts with the recipient, they include a gift — a random item from a shop in the town you are in.' },
  starfall: { name: 'Starfall', text: 'On the night before the Brisk Solstice the stars fall in shimmering trails. Make a warm meal or drink and watch them fall.' },
  harvestHelp: { name: 'Helping with the harvest', text: 'Be in Rueberry on or before the 16th of Burn. Share breakfast, choose orchard fruit, field berries, or potatoes, and work the day. Token: a sack of vegetables (and a sore body the next day).' },
  skyflowerSong: { name: 'A song for the Skyflower Festival', text: 'During spin the bottle you add a line to a partially written silly song about the fallen skyflowers.' },
};

// ---------------------------------------------------------------------------
// ITEM CATALOG — T28/T29. Mechanical items with effects, and where they are sold.
// price ranges reflect the cheapest/most-expensive listing across towns.
// ---------------------------------------------------------------------------
export const ITEMS = [
  { name: 'Bulrush jacket', effect: 'enablesBriskTravel', sold: [{ town: 'thistle_down', price: 120 }], note: 'With ice skates, enables foot travel on the frozen River in Brisk. Brink & Brisk only.' },
  { name: 'Ice skates', effect: 'enablesBriskTravel', sold: [{ town: 'roost', price: 150 }, { town: 'port_imes', price: 150 }], note: 'With a bulrush jacket, enables Brisk foot travel.' },
  { name: 'Reed raft reinforcements', effect: 'enablesBrimmingTravel', sold: [{ town: 'ennerck', price: 250 }], note: 'Allows downstream travel during Brimming flooding.' },
  { name: 'Extra shelves', effect: 'bookCapPlus100', maxOwned: 2, sold: [{ town: 'port_imes', price: 400 }], note: '+100 max inventory each; buy up to twice (cap 700).' },
  { name: 'Record player', effect: 'plusOneCardDaily', maxOwned: 1, sold: [{ town: 'port_imes', price: 500 }], note: '+1 customer card every day.' },
  { name: 'Spanner', effect: 'repairTool', sold: [{ town: 'arborea', price: 105 }, { town: 'plenty', price: 110 }, { town: 'ennerck', price: 130 }], note: 'Needed for many self-repairs.' },
  { name: 'Gear oil', effect: 'fixTill', sold: [{ town: 'port_imes', price: 30 }, { town: 'hurst', price: 45 }, { town: 'kiawake', price: 50 }], note: 'Keeps gears turning; fixes the till.' },
  { name: 'Washer', effect: 'fixLeak', sold: [{ town: 'arborea', price: 10 }, { town: 'hurst', price: 12 }], note: 'Helpful in leaky situations.' },
  { name: 'Pipes', effect: 'fixPiping', sold: [{ town: 'kiawake', price: 40 }, { town: 'mersey', price: 60 }] },
  { name: 'BugOff Spray', effect: 'clearBeetles', sold: [{ town: 'mersey', price: 30 }, { town: 'plenty', price: 30 }, { town: 'ennerck', price: 55 }], note: 'Clears (and prevents) nook beetles.' },
  { name: 'Eucalyptus incense', effect: 'clearPollen', sold: [{ town: 'mersey', price: 20 }, { town: 'ennerck', price: 20 }] },
  { name: 'Lantern oil', effect: 'lightLamps', sold: [{ town: 'plenty', price: 20 }, { town: 'ennerck', price: 70 }, { town: 'port_imes', price: 80 }] },
  { name: 'Candles', effect: 'light', sold: [{ town: 'roost', price: 10 }, { town: 'mersey', price: 11 }, { town: 'arborea', price: 20 }] },
];
