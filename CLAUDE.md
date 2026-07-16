# Fox Curio's Floating Bookshop — Solo Player App · Canonical Project Spec

> Instantiated from **RPG Player-Character App — Autonomous Build Instructions (v2)**.
> This file is the project's living source of truth. **Every code change updates it in the
> same change** (profile, data model, file tables, roadmap checkboxes, ledger ticks,
> changelog). A code change with a stale CLAUDE.md is incomplete.
>
> **Game:** *Fox Curio's Floating Bookshop: A Year Upon a River* by Ella Lim (Lost Ways
> Club, 2023). A **solo journalling game**. **Source of record: the original PDF** —
> `../Fox Curio's Floating Bookshop/Fox Curio's Floating Bookshop.pdf` (226 pp; cite page
> numbers in data-file comments). Secondary: the full pasted text in the chat transcript and
> the earlier partial `../fox_curios.md`. Where the book contradicts itself, the PDF governs
> and the ruling is recorded in §2 Ambiguities.

---

## 0. The central ruling — this is a solo journalling game, not a party combat RPG

The v2 template was written for combat-style party RPGs. Fox Curio has **no pass/fail
resolution, no attributes, no skills, no combat, no HP/death, no magic, no adversaries, no
GM, and no other players.** Cards and dice are a **prompt oracle** that drives a daily
routine; the *journal is the actual play.* Accordingly, the following template subsystems
are ruled **CONDITIONAL-absent and omitted** (never invented):

| Template subsystem | Ruling |
|---|---|
| §3.1 pass/fail resolution, §3.2 opposed tests | **Absent.** Replaced by a card+dice **prompt/oracle engine**. No success criteria exist. |
| §3.4 attributes, §3.5 derived stats, §3.6 skills | **Absent.** Character is pure narrative flavor. |
| §3.10 health/damage/death, §3.14 powers/magic | **Absent.** No character vitals, no spells. |
| §3.17 combat, §3.18 bestiary stat blocks | **Absent.** "Customers" are prompt archetypes, not statted foes. |
| §3.8 shared group entity | **Absent as a party entity.** The *shop* is modelled as a light persistent object (quirks, repairs, upgrades) — not a stat-bearing crew. |
| Firebase multiplayer, shared combat sync, GM screen, roles/campaigns/join codes | **Absent.** Single-player by design. Cloud is retained only as *optional personal cross-device backup* of one's own save (stretch, Phase 6). |

**Elevated / load-bearing instead:** the **creation wizard** (bookseller + shop), the
**day engine** (§3.1-analogue), the **calendar/lifecycle** (§3.12), **resource tracking**
(coins/books/hearts), the **built-in journal**, **fishing/travel/repairs/orders**
sub-loops (§3.13), and the **River compendium** (§3.21-analogue reference content).

Retained LOCKED architecture that *does* apply: no build step (vanilla ESM), installable
PWA + service worker, local-first `localStorage`, themed UI primitives (no native
alert/confirm/prompt), accessibility (`aria-live` results, labeled buttons), phone-first
responsive (zero horizontal overflow at 360px), JSON export/import backup, single-source-
of-truth data files, committed regression harness, rules-accuracy audit before "done".

---

## 1. What we are building

A **solo bookseller's daybook**: an installable, offline-capable PWA that lets one player
create a bookseller + shop, then play through a year on the River — running each day's
card+dice prompts, tracking coins/books/hearts, writing journal entries, and browsing a
searchable compendium. Phone-first; light + dark following system with an in-app toggle.

### 1.1 Product Decisions (Stage B answers — canonical)

| Decision | Answer |
|---|---|
| **Usage mode** | **Single-device solo.** No multiplayer/GM. Optional personal cloud backup only (stretch). |
| **User's seat** | Solo player (no GM). |
| **Dice/card input** | Digital-only engine (native dice + native card deck). *(Manual-entry may be a later convenience toggle; not committed.)* |
| **Missing tables** | **User is supplying the rest of the rulebook.** Awaiting tables are ledgered as blocked; no values invented in the interim. |
| **App shape** | **Full daybook + built-in journal** (writing lives in the app). |
| **Build plan** | **Spec doc first** (this file) → sign-off → Phase 0. |
| **Theme** | **Cozy watercolor river** — parchment/ink base; wattle-yellow + bottlebrush-red accents; willow green. Light+dark, default follows system. |
| **Platform** | Phone-first PWA; usable on tablet/desktop. |

---

## 2. System Profile (completed; rulings inline)

**2.1 Resolution / oracle.** No pass/fail. Randomizers feed lookup tables:
- **52-card deck** (jokers removed): drives **weather** (card 1 **rank A–K** → that season's
  Weather row = weather text + duration + customer-forecast-with-count; card 2 rank →
  duration; if duration ≠ "all day", draw a 3rd card for the rest), **customer**
  interactions (one flip per forecast slot; suit+rank → prompt), and **fishing** (draw to a
  royal = bite; then to two same-colour = caught[red]/lost[black]).
- **d20:** daily task (per season) · book genre (per customer) · extra-customers (end of
  day) · birth day-number.
- **d6:** total earnings (single roll → season Earnings table) · **books sold = season
  Books-Sold table[d6] + a *second* d6** · arrival prompt · tradesanimal timing (odd=today /
  even=+1 day) · a few in-prompt rolls (e.g. Harvest-Feast prize).
- **Forecast counts are printed per weather row** and, per the season-page instruction, the
  number on the row is what you draw — these differ from the generic Reference-card summary
  for the two lowest tiers (see **Ambiguity A5**).

**2.2 Opposed tests.** None (solo).

**2.3 Resources & currencies.**
- **Coins** — start **100**. Earned per day (d6 earnings table); spent on restock/supplies/
  repairs/orders. May go to 0; then **trade books at 1 book = 1 coin**.
- **Books (inventory)** — start **500**. **Base cap 500; upgradable to 700** via *Extra
  shelves* at Port Imes (400 coins each, **buyable twice**, +100 each). Decremented daily
  (see 2.1 books-sold two-roll); replenished by **restocking** (season cost: Bloom 200 /
  Burn 250 / Brimming 220 / Brink 200 / **Brisk: unavailable** — trade stops). Restock resets
  to 500 and the new stock arrives **next day** by trade boat. If books hit 0 in Brisk, the
  shop must close until Bloom. *(Record player, 500 coins at Port Imes: +1 customer card
  every day, single purchase.)*
- **Hearts** — per **player-created customer profile**, 0→6. A profile is a *named* character
  you choose to record (Name/Age/Hometown/Occupation/Observations/description); a heart is
  filled when they share something **meaningful** (a story, secret, doubt, fear, history) —
  not casual chat. **Favour at 3 and at 6** (call in a favour to waive a monetary/material
  cost when something goes wrong). At **2+ hearts**, a mailed letter returns a gift. Hearts
  live on the profile, **not** on a card face — a repeated card *may* be the same animal
  (your call), so you advance a friendship whenever you decide a flip is that friend. See
  ruling A2 (book text supplied 2026-07-16; the old per-card model is superseded).

**2.4–2.6 Attributes / derived / skills.** None. Character = name · species · age-word ·
"how you came by the shop" · "who you were before" · "what books are to you" · birth moon
+ day-number · 3 signature items. No numbers.

**2.7 Creation options.** Bookseller wizard then Shop wizard (full lists in `data.js`):
- Bookseller: name (22 suggestions + custom) · species (26 + custom) · age (7 words) ·
  acquisition (5) · former life (6, two groups of 3) · books-to-you (4) · birth moon (5) +
  day-number 1–20 · **3 signature items** (of 20).
- Shop: **2 quirks** (of 7) · **3 brought items** (of 13) · **3 previous-owner leftovers**
  (of 10) · **floorplan** (freeform layout — implemented as a simple notes/label canvas,
  not a grid sim).

**2.8 Group entity.** The **shop** is a light persistent object: quirks, repair state,
inventory cap/upgrade, and mooring (current town). Not a stat entity.

**2.9 Conditions.** **Repairs.** Broken deck/paddle/roof (shipwright 80/day), clogged
chimney (firesmith 60/day), till/clock/gears (clocksmith 50/day), glass panes (glassmith
50/day), taps/sinks/piping (plumber 70/day). Some **inhibit travel or reduce customers
until fixed**. Hire via post office (tradesanimal arrives **next day**, then **odd d6 =
fixed that day / even = +1 day**, re-roll daily, cost/day deducted each day). Specific
repair triggers live in the season Daily-Task tables (T18), e.g. Bloom-8 broken tap
(−1 card/day), Bloom-9/Burn-5 nook beetles (−1 card/day), Brimming-6/13/15 hull/roof
(no travel until fixed), Brink-5/Brisk-6 clogged chimney (−1 card/day), Brisk-10 broken
window (−1 card/day). Weather-driven closures (Brisk snowstorm = Dead/0) are separate.

**2.10 Health/damage/death.** None.

**2.11 Rest & recovery.** No rest mechanic; "days off" (fishing / town / travel /
festivities / watch the River) record **0 customers & 0 earnings**, minus purchases.

**2.12 Lifecycle (app owns these).**
- **Day** — the core unit; Bookselling Order of Play (8 steps) or Days-Off Order of Play
  (3 steps).
- **Week / microseason** — 4 per season, all named (now complete, T23): **Bloom** Thaw ·
  Birdsong · Sprout · Busk; **Burn** Bask · Simmer · Hearth · Harvest; **Brimming** Frogsong ·
  Flood · Rush · Ease; **Brink** Reedsong · Frost · Fall · Quieting; **Brisk** Chill · Hush ·
  Blanket · Awaken. Each season page also has a calendar with moon phase, sunset times, and
  dated holidays/weather-travel flags.
- **Season** — **20 days**; on rollover the engine swaps to that season's tables and
  applies travel rules (Bloom: travel resumes day 5; Brimming: no travel days 7–17 without
  raft reinforcement; Brisk: shop can't move after day 9, needs bulrush jacket + ice skates
  to travel on foot).
- **Year** — 5 seasons / 100 days; end-of-year reflection; optional new year (legacy: 3
  leftover marks carry to next character's shop).
- **App requirement:** explicit **End Day / End Season / End Year** controls that fire the
  full boundary bundle with a confirmation summary + one-step undo.

**2.13 Extended / progress loops (one generic pattern each).** Fishing (card mini-game;
fish species gated by season, T11) · Travel (multi-day per the **distance map T25**; +1
upstream; blocked by wind/storm/fog/flood/ice/damage; **Journey** prompt per day; **Arrival**
d6 on docking) · Repairs (post + timing roll) · **Book orders** (per-season list, T22:
customer · book · source town · reward coins; deliver in person or post for a fee) ·
Letters→gifts (2+ hearts; reply in 2× the town's mail time, gift = random item from a shop
in the current town) · **Restock delivery** (next-day) · **Weather-event counters** (2.22).

**2.14 Powers.** None.

**2.15 Advancement.** No XP. Progress = **hearts/favours**, **inventory upgrade** (Port
Imes +100), multi-year **legacy marks**.

**2.16 Inventory & wealth.** Dual resource (coins + books) + **supplies/tools** bought from
**town shops** (each town has 2–4 shops with priced goods — T26) + **caught fish** +
signature items. No weight/encumbrance. Books cap clamps at 500→700 (2.3). Mechanical items
of note (T28): **Bulrush jacket** 120 (enables Brisk foot travel) · **Ice skates** 150 (same)
· **Reed raft reinforcements** 250 at Ennerck (enables Brimming downstream travel) · **Extra
shelves** 400×2 (+100 books each) · **Record player** 500 (+1 card/day) · repair consumables
(spanner, washer, gear oil, pipes, BugOff spray, eucalyptus incense, lantern oil, candles) ·
recipe ingredients. Post offices (T26) sell snail/owl/express mail at per-town rates with
seasonal availability. Over-limit: coins can't go negative (trade books 1:1 instead).

**2.17 Combat.** None.

**2.18 Bestiary/NPCs.** No stat blocks. **Compendium content**: 52 customer archetypes,
10 towns + their characters, 8 fish, 6 animals, 7 plants, 11 recipes, 5 trades, 11
occupations, 5 moons.

**2.19 Pregens.** None published; the name/species lists seed a "surprise me" quick-gen.

**2.20 Solo rules.** The whole game *is* solo — no separate solo tab; the app is the solo
assistant.

**2.21 Rollable tables.** Weather (per season, by card rank), Customers, Book Genre, Daily
Task (per season), Earnings (per season), Books Sold (per season), Extra Customers, Arrival
(per season), Journey prompts, Fishing, Trades timing, Harvest-Feast prize (d6). **All now
in the full rulebook.**

**2.22 Weather-event counters — a real subsystem.** Each season tracks one recurring weather
type across a 3-mark counter; on the 3rd mark a scripted event fires the next day:
**Bloom** Warm ×3 → turquoise luminescent insects that night · **Burn** Thunderstorm ×3 →
bushfire next day (help fight it) · **Brimming** Sunny ×3 → butterfly cloud next day ·
**Brink** Heavy fog ×3 → dense fog next day (travel stops, stay in) · **Brisk** Snowstorm ×3
→ everyone shut inside all next day. The app tracks the per-season counter, resets it at
season rollover, and surfaces the triggered event as a Day prompt. Each season page also
lists a "mayhem/mystery" flavour trio (non-mechanical prompt colour).

### Ambiguities (proposed rulings — user may correct)
- **A1 — Engine tables. ✅ RESOLVED.** Full rulebook supplied; all T17–T24 are now
  extractable (Weather/Daily-Task/Earnings/Books-Sold per season, holidays, book orders,
  week names). No values invented; nothing left blocked.
- **A5 — Forecast-count discrepancy. ✅ CONFIRMED vs PDF p.79.** The season Weather tables
  print **Snail's pace = 2, Quiet = 3**; the Reference card / How-to-play say **Snail's
  pace = 1, Quiet = 2** (Dead 0, Steady 4, Busy 6, Extremely busy 7 agree). Genuine in-book
  inconsistency. **Ruling:** store the exact count printed on each weather row (data-driven
  per row), per the season-page instruction; Reference-card mapping is the overridden summary.
- **A6 — Skyflower Festival date. ✅ CONFIRMED vs PDF.** The **calendar (p.76) shows day 14**;
  the **holiday page (p.86) says "24th day of Bloom."** Book contradicts itself; Bloom is 20
  days. **Ruling:** day 14.
- **A7 — Books cap. ✅ CONFIRMED.** *Extra shelves* (Port Imes) is "can be purchased twice,"
  +100 each. **Ruling:** base 500, max **700**.
- **A2 — Heart-tracked customers. ✅ RESOLVED (book text supplied 2026-07-16).** The book's
  *Returning customers* / *Gaining hearts* / *Customer profile* rules confirm hearts live on
  **player-created, named customer profiles** (template: Name/Age/Hometown/Occupation/
  Observations/Drawing), *not* on card archetypes. A profile is recorded **when and if the
  player wants** (often after a few visits); a heart is filled only for meaningful shares;
  favours at 3/6 waive a cost; 2+ hearts → letter gift. **Ruling:** implemented as a
  Customer-Profiles system (`src/profiles.js`, Home *Friends* card, flip *Add to a friend*);
  the earlier "each of 52 card faces = a profile" ruling is **superseded**. The old suit-rank
  `hearts` map is retained on old saves for back-compat but no longer written.
- **A3 — Floorplan.** No grid rules given. Ruling: implement as a **freeform labelled
  layout / notes canvas**, not a simulation.
- **A4 — "Returning customers." ✅ RESOLVED (same book text).** A repeated card **may or may
  not** be the same animal — the player interprets it (same town → likelier to recur; new
  town → likely new faces; a traveller can reappear elsewhere). No RNG rule; recurrence stays
  **player-driven**, now expressed by adding a heart to the chosen profile from any flip.

---

## 3. Architecture (adapted LOCKED)

- **No build step.** Vanilla JS, native ES modules (`<script type="module" src="src/main.js">`).
- **Installable PWA:** `manifest.json`, `service-worker.js` (network-first; caches shell +
  all `data*.js`; versioned `CACHE_VERSION`; in-app "Update available — reload" toast).
- **Storage:** `localStorage` local-only mode with **zero config**. Optional cloud backup
  (Phase 6 stretch) behind a clearly-marked `firebase-config.js` placeholder + `FIREBASE_ENABLED`
  flag; **never commit real keys**. No multiplayer/roles/campaign schema (solo).
- **Themed UI primitives:** shared `modal()` + `showToast/confirmModal/promptModal`
  (focus trap, Escape, `aria-modal`, focus restore, visual-viewport sized).
- **Accessibility:** keyboard + screen-reader; `aria-live` on roll/draw results and the
  resource header; labeled icon buttons; `aria-current` nav.
- **Responsive:** phone-first; **zero horizontal overflow at 360px** on every screen.

---

## 4. File structure

| File | Purpose |
|---|---|
| `index.html` | App shell: header (resource + date), bottom nav, screen mount, module entry |
| `styles.css` | Watercolor-river theme (light+dark) + component styles |
| `data.js` | **Core rules library** — all in-book tables (customers, genre, forecast, extra-customers, seasons, arrivals, order-of-play, creation & shop option lists) + placeholders for awaiting tables |
| `data-compendium.js` | Reference content: towns, recipes, fish/animals/plants, trades, occupations, astrology |
| `firebase-config.js` | Placeholder config + `FIREBASE_ENABLED` (optional backup only) — CONDITIONAL |
| `manifest.json`, `service-worker.js`, `icon.svg` | PWA |
| `tests/` + `package.json` | Dev-only headless harness (`npm test`, `playwright-core`); `node_modules` gitignored; not in SW shell |
| `README.md` | Setup + personal-use licensing note |
| `CLAUDE.md` | This spec |

### 4.1 `src/` module map (responsibilities)

| Module | Responsibility |
|---|---|
| `core.js` | Constants, DOM/util helpers, raw **dice** (d6/d20) + **card deck** (build/shuffle/draw). No imports. |
| `ui.js` | Themed modals/toasts/confirm/prompt. |
| `rules.js` | Pure lookups over data (customer by suit+rank, genre by d20, forecast→card count, restock/season rules, trade math). |
| `calendar.js` | Season/week/day model; lifecycle boundary bundles (End Day/Season/Year) + undo. |
| `character.js` | Character + shop object shape, normalization/migration, resource math (coins/books/hearts). |
| `settings.js` | Toggles (theme, optional cloud backup, future conveniences). |
| `store.js` | localStorage persistence + JSON export/import (+ optional cloud sync hook). |
| `sync.js` | Optional personal cloud backup — CONDITIONAL (Phase 6). |
| `wizard.js` | Creation wizard (bookseller + shop) + "surprise me" quick-gen. |
| `engine.js` | **The day engine:** weather draw, forecast→customer cards, daily-task roll, customer-flip loop (+genre), end-of-day tally (extra customers, totals, earnings, books sold), **roll/draw log** writes. |
| `fishing.js` | Fishing card mini-game. |
| `travel.js` | Travel legality, Journey prompts, Arrival roll, season travel rules. |
| `repairs.js` | Repairs + tradesanimal lifecycle: trigger from daily task, standing card/travel penalties, self-fix via item, hire trade (next-day arrival + odd/even d6 timing + per-day fee), daily tick. |
| `mail.js` | Letters → gifts: post-office availability by town/season, send to a **profile** friend, reply in 2× mail time (daily tick), 2+-heart gift = random current-town shop item. |
| `profiles.js` | Player-created **customer profiles** (template fields) + friendship **hearts** (0–6, change/clamp) + **favours** (earned at 3/6, `useFavour`). CRUD over `character.profiles`. |
| `town.js` | Moored-town economy: restock, buy supplies/upgrades/travel-gear. |
| `compendium.js` | Normalizes all reference data into searchable categories (customers, towns, recipes, fish, animals, plants, trades, occupations, moons, genres, items) + flat/scoped search. |
| `screens.js` | Top-level screen renderers (home/day/journal/compendium/settings) + resource header + log view. |
| `router.js` | Bottom-nav routing + conditional tab gating. |
| `main.js` | Entry point / boot. |

When adding/moving a `src/` file: update these tables **and** the service-worker app-shell
list, then bump `CACHE_VERSION` — same change.

---

## 5. Data model (localStorage; shape below)

```
save/
  meta:      { version, createdAt, updatedAt, activeCharacterId }
  legacy:    [ leftover marks... ]   // 3 leftovers carried from a completed year; a new bookseller inherits them (consumed on create)
  settings:  { theme:"system|light|dark", cloudBackup:false, ... }
characters/{id}
  identity:  { name, species, age, acquisition, formerLife, booksToYou,
               birthMoon, birthDay, items[3], appearance, portraitUrl }
  shop:      { quirks[2], broughtItems[3], leftovers[3], floorplan,
               inventoryCap:500, upgrades{ shelves:0..2, recordPlayer:false },
               repairs{ "<flag>": { label, cards, cardsRainy, noTravel, needs,
                 trade, triggeredDay, hired:false, arriveCountdown, perDay } },
                 // keyed by repair flag (plumbing/piping/gutters/glass/chimney/deck/
                 // roof/fan/till/beetles/lanternOil); only *active* repairs present;
                 // entry deleted when fixed. hired+arriveCountdown+perDay drive the
                 // tradesanimal lifecycle (next-day arrival, per-day fee, odd d6 fix).
               mooredTown, raftReinforced:false, hasBulrushJacket, hasIceSkates }
  resources: { coins:100, books:500 }
  weatherEvent: { season, count:0..3 }                  // per 2.22, resets on rollover
  hearts:    { "<suit>-<rank>": 0..6 }                  // DEPRECATED (old saves); superseded by profiles (A2)
  profiles:  [ { id, name, age, hometown, occupation, observations, description,
                 hearts:0..6, favoursUsed, ts } ]        // player-created; hearts/favours live here (A2/A4)
  calendar:  { year, seasonIndex(0..4), day(1..20), weekName }
  supplies:  [ { name, qty } ]   caught:[ ... ]
  mail:      [ { kind, recipientKey, sentSeason, sentDay, countdown, price, gift? } ]
                                                        // reply when countdown→0 (2× mail time); gift at 2+ hearts
  orders:    [ { customer, book, sourceTown, reward, done } ]   // T22-shaped
  log:       [ { day, kind, inputs, dice[], cards[], outcome, deltas, ts } ]  // capped ~100
  journal:   [ { id, year, season, day, title, body, prompts[], ts } ]
  legacy:    [ marks... ]                                // multi-year carry
```

Rules: every rules number lives in `data*.js` (never hardcoded in `src/`); every schema
addition ships a **normalization path** back-filling defaults on old saves (never crash on
old data); every field addition is documented here **in the same change**.

---

## 6. Data Extraction Ledger (T-numbered) — mandatory

**How to continue (for any AI resuming):** work top-to-bottom within the current phase;
extract each table **from the PDF** (`../Fox Curio's Floating Bookshop/Fox Curio's Floating
Bookshop.pdf`, read via the `pages` param) — it is the authoritative source; the pasted
chat text is a fast cross-reference. Paraphrase (never copy prose); **cite the PDF page** in
a data-file comment so the audit (§9) can re-check fast; **tick the box in the same change**
+ append a changelog row; estimated counts yield to real counts. Corroborate any surprising
value against the PDF before recording (the book contains real self-contradictions — see
A5/A6). **An unticked box = data not extracted. Never build UI against an unticked table.**
**Status (2026-07-15): full source available — every ⛔ block lifted; A5/A6/A7 confirmed.**

**Extractable now (in `../fox_curios.md`) → `data.js`:**
- [x] T1 Customer prompts, all 52 (Hearts/Spades/Clubs/Diamonds A–K)
- [x] T2 Book Genre d20 (20)
- [x] T3 Customer forecast tiers → card counts (6)
- [x] T4 Extra-customers d20 bands (4)
- [x] T5 Season overview: holidays, travel rule, restock cost (5)
- [x] T6 Fishing procedure
- [x] T7 Travel legality rules + Journey prompts (8)
- [x] T8 Arrival d6 tables per season (5×6)
- [x] T14 Bookseller creation option lists (names×22, species×26, ages×7, acquisition×5, former-life×6, books-to-you×4, moons×5, items×20)
- [x] T15 Shop creation lists (quirks×7, brought×13, leftovers×10)
- [x] T16 Order-of-play sequences (bookselling / days-off / travel)

**Extractable now → `data-compendium.js`:**
- [x] T9 Towns (10) — course, notable locations, characters
- [x] T10 Recipes (11) + ingredients
- [x] T11 Fish (8) / Animals (6) / Plants (7)
- [x] T12 Trades (5, day-rates) + Occupations (11)
- [x] T13 Astrology / moons (5)

**Now extractable (blocks lifted) → `data.js`:**
- [x] T17 Weather tables per season — by card rank A–K: weather text · duration · forecast
  label + **exact printed count** (per A5) · season weather-event type (2.22). 5×13 rows.
- [x] T18 Daily-task d20 tables per season (5×20), incl. repair triggers & card-count effects
- [x] T19 Total-earnings d6 tables per season (5×6, single-roll)
- [x] T20 Books-sold d6 tables per season (5×6) — value **plus a second d6** (2.1)
- [x] T21 Holidays (12): name · date · location · 3 event prompts · token; incl. Special-
  Events (Helping with Harvest, Lantern-making, Starfall, Skyflower song, Receiving parcels)
- [x] T22 Book-orders per season (Bloom 3 · Burn 3 · Brimming 2 · Brink 3 · Brisk 4):
  customer · book title · source town · reward coins
- [x] T23 Microseason week names (5×4) — complete set in 2.12
- [x] T24 Restock costs per season + Port Imes upgrades (Extra shelves 400×2→cap 700; Record
  player 500 = +1 card/day) + restock next-day delivery / Brisk unavailable rule

**Newly discovered (from full rulebook) → `data-compendium.js` / `data.js`:**
- [x] T25 Town travel **distance map** (9 leg times; +1 upstream) + Salmon-Run per-town dates
- [x] T26 **Town shops** (10 towns × 2–4 shops): item · price · seasonal availability; and
  **post offices** (snail/owl/express times, prices, seasonal availability) per town
- [x] T27 Season weather-event counters (5) + season calendars (moon phase, sunset times,
  dated holiday/travel flags) + seasonal signs + special books per town
- [x] T28 Mechanical items & upgrades (bulrush jacket, ice skates, raft reinforcements,
  spanner, gear oil, washer, pipes, BugOff, incense, lantern oil, candles, extra shelves,
  record player) — id · price · town(s) · effect
- [x] T29 Item Reference (Appendix V): which town(s) sell each ingredient/tool category
- [x] T30 Word oracle (d100 inspiration words) → `data.js` `WORD_ORACLE`; rolled 3-at-a-time
  by the Day-screen inspiration roller (`screens.inspirationBox`)

---

## 7. Build roadmap (build strictly in order)

- [x] **Phase 0 — Foundations.** Scaffold all §4 files; extract the **full core data
  library — T1–T29** (verified; multiple sub-phases, data before features) — watercolor
  theme (light+dark, system default); PWA shell + service worker; app shell with router +
  localStorage.
- [x] **Phase 1 — Creation wizard.** Bookseller flow (T14) + shop flow (T15) with legal
  selection counts (pick-exactly-N enforced); "surprise me" quick-gen; floorplan-lite;
  persistence + migration. `src/wizard.js`; **5 dropdown-driven pages** (bookseller
  identity · your past · signature items · the shop · review) driven by a `PAGES` array
  (per-page `valid`), progress bar, Next gated on validity. All choices are `<select>`s:
  single-selects (`selectField`), grouped optgroups for former-life (`selectGroupedField`),
  suggestions-or-Custom for name/species (`suggestField`), and pick-exactly-N as N
  dedup-excluding dropdowns (`multiSelectField`). Writes character (100 coins / 500 books /
  Bloom day 1) via Store.
- [x] **Phase 2 — Daybook core.** Resource header on every in-play screen; **built-in
  journal** (per-day entries, edit/delete, search) `screens.renderJournal`; calendar model
  `src/calendar.js` (week names, season/year rollover) + **End Day** lifecycle with confirm
  summary + one-step undo (`Store.markUndo/undo`); weatherEvent counter resets on season
  rollover; JSON export/import in Settings. (Full bookselling engine still Phase 3.)
- [x] **Phase 3 — Day engine.** `src/engine.js` — Bookselling Order of Play end-to-end: weather draw by card
  rank (T17) with duration re-draw + weather-event counter (2.22), forecast→cards (printed
  count per A5), daily task (T18) incl. card-count effects, customer flip loop with genre
  (T1/T2), end-of-day tally (T4 extra + +10/+20 rule + T19 earnings + T20 books-sold
  two-roll); closing-early halving rule; **roll/draw log** (`aria-live`, capped).
- [x] **🏁 Milestone — First Session Playable:** create bookseller+shop → live daybook →
  run a full day's prompts → track coins/books → write a journal entry, end-to-end. ✅
  Verified in-browser and via `npm test` (70/70).
- [x] **Phase 4 — Sub-loops (complete).** **Fishing** (`src/fishing.js`, season-gated
  catch), **Town economy** (`src/town.js` — restock, buy supplies, Port Imes upgrades
  shelves→cap 700 + record player, travel-gear flags), **Hearts** (fill on befriendable
  customer flips, favour toasts at 2/3/6), **Travel** (`src/travel.js` — legality by
  season/day/gear/damage, distance +1 upstream, arrival prompt, multi-day advance),
  **Holiday participation** (about/prompts/token + token effects; celebrate = day off),
  **Book orders** (per-season fulfil for reward coins), **Repairs + tradesanimals**
  (`src/repairs.js` — persistent broken state, standing card/travel penalties, self-fix or
  hire-a-trade with next-day arrival + odd/even d6 timing + per-day fee, daily tick),
  **Recipes** (`shareMeal` — pick a dish, seed its shared-meal reveal into the journal),
  **Letters→gifts** (`src/mail.js` — post office by town/season, reply in 2× mail time,
  2+-heart gift). Season rollover handled; repairs & mail tick on End Day / day off / travel.
- [x] **Phase 5 — Compendium.** `src/compendium.js` + `renderLibrary` (River tab): searchable
  browse of customers/towns/shops/recipes/fish/animals/plants/trades/occupations/moons/genres/
  items (T9–T13, T26–T29), flat search + **collapsible per-category accordions** (native
  `<details>`, all collapsed by default; a search auto-opens matching categories via
  `compendium.groupedHits`). (Cross-links from automated surfaces: deferred polish.)
- [~] **Phase 6 — Backup & polish (CONDITIONAL/stretch).** ✅ **Multi-year legacy carry**
  (`calendar.onYearRollover` + save-level `legacy` pool + wizard inheritance: a year boundary
  captures the shop's 3 leftovers, records the year on the character, seeds an end-of-year
  reflection journal entry; a new bookseller inherits the 3 marks, preserved through "Surprise
  me", consumed on create). ⏳ remaining (stretch): optional personal **cloud backup**
  (blocked — needs real Firebase keys, never committed), PWA update toast polish, optional
  manual dice/card entry toggle.
- [ ] **Hardening (always).** Committed regression harness; accessibility pass; full
  **rules-accuracy audit** (§8) with every finding closed.

**Per-feature spec format (mandatory):** Rule (cited) · Target (file·module·function) ·
Behavior/UI · Schema (name·type·default·location, §5 updated) · Acceptance (browser check).

---

## 8. Process rules (LOCKED)

1. **Living spec** — update this file in the same change as any code change.
2. **Single source of truth** — all rules numbers in `data*.js`; never hardcode in `src/`.
3. **Changelog** — every change appends a dated row (what · why · root-cause for fixes ·
   verification · cache version).
4. **Verify in a real browser** — every phase verified headless (Playwright), flow works
   end-to-end with **zero console errors**. "Syntax valid" is not verification.
5. **Regression harness** — `npm test` boots headless and asserts: boot/wiring smoke (every
   tab, zero JS errors); resource-math invariants (coins/books clamps, trade 1:1, cap
   500/600); day-engine invariants (forecast→card count, genre range, end-of-day tally);
   lifecycle bundles fire + undo cleanly; **zero horizontal overflow at 360/390px**; a11y
   basics; every closed audit finding. Each bug fix adds a check that would catch its return.
6. **Cache discipline** — any shipped-file change bumps `CACHE_VERSION`.
7. **Root-cause fixes** — debug to the actual cause; record cause+fix in the changelog.
8. **Scope guard** — core rules only. **No setting/adventure/art prose.** Anything not in
   the book (e.g. a convenience helper) is explicitly labelled a house aid.
9. **Module discipline** — respect §4.1; explicit import/export; split modules along the
   same lines when they outgrow their job.

---

## 9. Rules-accuracy audit (before "done")

Re-verify the finished app against the (full) rulebook: fully check every formula and
creation/selection count; audit **engine behaviour hardest** — forecast→card mapping,
end-of-day tally (+10/normal, +20/royalty; earnings/books-sold), travel legality per
season/day, restock costs & inventory cap/upgrade, repair timing (odd/even), heart
thresholds (3/6; letter-gift at 2+), lifecycle boundary bundles. Document findings as a
numbered work-list (Rule / Target / Fix / Why); close each with a regression check; record
what was verified clean.

### 9.1 Audit pass 1 (2026-07-15) — engine + economy findings

**Findings (closed):**
- **R1 — Close-early must skip the extra-customer roll.** Rule: `ORDER_OF_PLAY.closingEarly`
  ("skip the extra-customer roll; …then halve"). Target: `engine`/`screens.renderSession`.
  Was: UI rolled extras first, *then* offered "close early (halve)", so extras were counted.
  Fix: close-early is now offered at customer-completion and goes straight to tally (extras
  skipped); the post-extras phase only tallies. Regression: "R1 close-early skips the
  extra-customer roll" + "…tallies only forecast customers, then halves".
- **R2 — Weather-forced early close unhandled.** Rule: tasks with `effect.closeEarly`
  ("the weather makes you close up early"). Target: `screens.renderSession`. Was: ignored.
  Fix: on such a task the customer-completion step hides the extra-roll button and surfaces
  the forced early close. (Shares R1's close-early path/regression.)
- **R3 — Books→coins 1:1 trade missing.** Rule §2.3/§2.16 ("coins can't go negative — trade
  books 1:1 instead"). Target: `town.tradeBooksForCoins` + Town UI. Was: unimplemented.
  Fix: added a 1 book = 1 coin trade control. Regression: "R3 trade books→coins 1:1" +
  clamp-to-available.

**Verified clean:** forecast→card count uses each weather row's printed `cards` (A5 honoured);
duration re-draw (card2 duration, card3 afternoon) with count from card1; tally +10/+20 with
Ace=normal; earnings d6 + books-sold d6(+d6); extra-customers bands; book cap clamp & no
negative books; repair odd/even timing + per-day fee (Phase-4 audit); heart thresholds 2/3/6;
mail reply = 2× mail time, gift at 2+ hearts; travel legality per season/day/gear/damage;
holiday snail's-pace open = 1 (p34, previously PDF-verified — source PDF no longer on disk,
value unchanged). **Note:** the local source PDF/`fox_curios.md` are no longer present, so any
future ruling that needs the book must have it re-supplied.

### 9.2 Audit pass 2 (2026-07-15) — daily-task in-prompt rolls

**Finding (closed):**
- **R4 — In-prompt task rolls had no UI.** Rule: a few daily tasks embed a die roll the player
  resolves and journals (T18). Target: `engine`/`screens.renderSession` + `data.js`. Audited all
  **100** tasks (5×20): structured effects (repair/±cards/halve/closeEarly/bonusCards) are all
  surfaced; the **only** task carrying an unhandled embedded roll is **Bloom-20** ("Design merch…
  Even roll = a customer buys one"). Was: shown as plain text, no way to roll or act. Fix: added a
  data-driven `roll` field on such tasks (`{ die, note }`) and a **generic roll+journal helper**
  (`screens.taskRollWidget`) that appears only on flagged tasks — rolls the die, shows even/odd,
  and seeds a journal entry; the player interprets the outcome (no auto-applied quantities, per the
  journalling design §0). Regression: "exactly one task flagged (bloom-20)", "bloom-20 roll die+note",
  "every even/odd-roll task is flagged". **Also** added a **How to play & journal** guide in Settings
  (`JOURNAL_GUIDE` + `ORDER_OF_PLAY`, `screens.guideCard`).

**Verified clean (task audit):** no other task text contains an unhandled "even/odd roll" or
embedded quantity; the item-conditional tasks (incense/BugOff/ginger/candles/gear/lantern oil) are
narrative `needs`-style prompts, not rolls.

---

## 10. Content & IP

Extract **numbers and mechanics**; **paraphrase all flavour/effect text — never copy prose
verbatim.** Exclude the setting fiction, art, and logos. This is a **personal play aid**
built from the user's own book; the README states that public distribution is the user's
licensing responsibility and that openly-licensed material is the safe basis for anything
public.

---

## 11. Changelog

| Date | Change | Verification | Cache |
|---|---|---|---|
| 2026-07-16 | **Favours auto-waive real costs.** A favour now actually cancels a cost instead of only logging a note. Added `profiles.totalFavours`/`spendAnyFavour`, `repairs.waiveRepairFee` (+`favourCovered` skips the per-day fee in `tickRepairs`), and a `free` param on `town.buy`/`town.restock`/`mail.sendLetter`. A shared `screens.favourBtn` adds a **🎁 Use favour** button (shown only when a favour is available) beside every cost: shop items, restock, postage, and repair hire — it spends one favour, performs the action at **0 coins**, and journals which friend. The Home Friends "Use favour" button became an info-only pill (spending happens at the cost). SW → v0.22.0. Harness +5. | `npm test` **134/134**; headless @390px: 6-heart friend = 2 favours; buy-with-favour left coins 500 (favour 2→1), repair "Hire (favour)" set `favourCovered` + spent last favour (→0), covered repair charges 0 on tick; zero overflow, zero console errors | fox-curio-v0.22.0 |
| 2026-07-16 | **Customer Profiles system (rulings A2/A4 resolved from supplied book text).** The book (*Returning customers* / *Gaining hearts* / *Customer profile* template) confirms hearts live on **player-created named profiles**, not card faces. New `src/profiles.js` (CRUD + `changeHeart`/`favoursAvailable`/`useFavour`) + `character.profiles[]` schema (old suit-rank `hearts` map deprecated, kept for back-compat). **Home Friends card** (`friendsCard`/`friendRow`): create/edit/delete profiles with the 6 template fields, ♥ N/6 +/−, favours-available pill + **Use favour** (waive a cost, logged to journal). **Flip → "＋ Friend"** (`befriendFromFlip`): add a heart to an existing profile or record a new one (obs prefilled from the customer). **Mail** recipients/gift-threshold moved from suit-rank hearts to profiles. SW shell +`profiles.js` → v0.21.0. Harness +8. | `npm test` **129/129**; headless @390px: created "Otter De/Hurst·Fisher", hearts→3 shows "1 favour available", Use favour (favoursUsed 1 + journal note), flip ＋Friend modal added a heart to existing (→4); mail recipients now profile-keyed; zero overflow, zero console errors | fox-curio-v0.21.0 |
| 2026-07-15 | **Hearts: add a remove control + /6 label.** The customer heart button only ever incremented (clamped at 6, no way down). Generalised `addHeart`→`changeHeart(key, delta)`: the ♥ button now reads `♥ N/6` and adds (disabled at 6); a new `−` button removes a heart (disabled at 0). Favour/gift toasts still fire on the way up (2/3/6); a "Heart removed" toast on the way down. SW → v0.20.0. | headless @390px: forced a befriendable flip (spades-A), ♥0/6 with − disabled; +3→3, −1→2, maxed→6 with + disabled; store matched UI each step; zero overflow, zero console errors; `npm test` **121/121** | fox-curio-v0.20.0 |
| 2026-07-15 | **Home inventory panel.** Added an **Inventory** card to the Home screen (`screens.inventoryCard`) surfacing what was tracked but never shown: **gear & upgrades** (`ownedSummary`), **supplies** (bought consumables + mail gifts, qty-aware, zero-qty hidden), **caught fish** (aggregated by name), and **signature items**, plus a coins/books line and a hint that buying happens at the moored town. Empty rows read "none yet". SW → v0.19.0. | `npm test` **121/121**; headless @390px: seeded char → Gear "Extra shelves ×1 (cap 600) · Record player · Ice skates", Supplies "BugOff Spray ×2 · Eucalyptus incense" (zero-qty hidden), Caught "Trout · Perch ×2", items shown; fresh char → 4×"none yet"; zero overflow, zero console errors | fox-curio-v0.19.0 |
| 2026-07-15 | **Word-oracle inspiration roller (T30).** Added the d100 inspiration-word table (`WORD_ORACLE`, user-supplied) + `core.d100`. On the selling session (where task+customers render) a new **✨ Inspiration** card rolls **3 words**, with **Reroll**, an inline **Today's journal** textarea (autogrow), tap-a-word-**inserts-at-cursor**, **Insert all**, and **Save entry** (writes the day's journal entry). The draft (words+text) is module-scoped and **persists across the session's re-renders**, keyed to the day; cleared on Finish day. SW → v0.18.0. Harness +4. | `npm test` **121/121**; headless @390px: forced Bloom session (target 1), Inspiration card + 3 chips, insert-at-cursor ("The Change drifted by."), reroll swaps words & keeps text, text survives a customer-flip re-render, Save wrote entry (0→1) & cleared box; zero overflow, zero console errors | fox-curio-v0.18.0 |
| 2026-07-15 | **Task in-prompt rolls + play/journal guide (audit §9.2, R4).** Audited all 100 daily tasks: only **Bloom-20** embeds a die roll with no UI. Added a data-driven `roll:{die,note}` field on it and a generic **roll+journal helper** (`screens.taskRollWidget`) shown only on flagged tasks — rolls d6, shows even/odd, seeds a journal entry; player interprets the outcome (no auto-applied quantities, per §0). Added a **How to play & journal** guide to Settings (`JOURNAL_GUIDE` in data.js + `ORDER_OF_PLAY`, `screens.guideCard`, collapsible order-of-play accordions). SW → v0.17.0. Harness +5. | `npm test` **117/117**; headless @390px: Settings guide (16 steps + 3 accordions), forced Bloom d20=20 → `.task-roll` widget, rolled d6→even, journal button enabled, entry written; zero overflow, zero console errors | fox-curio-v0.17.0 |
| 2026-07-15 | **Fix: update/undo toast buttons unclickable.** Root cause: `.toast-wrap` is `pointer-events:none` (so passive toasts don't block the UI), which also disabled the interactive **Reload** (update-available) and **Undo** buttons inside it — clicks passed straight through. Fix: `.toast .btn { pointer-events: auto; }` re-enables just the buttons. CSS-only; SW → v0.16.0. | headless @390px: injected `updateToast`+`actionToast`, both buttons compute `pointer-events:auto`, Playwright real-click hit-test succeeds on Reload **and** Undo (previously would intercept); `npm test` **112/112**; zero console errors | fox-curio-v0.16.0 |
| 2026-07-15 | **River: drop accordion counts.** Removed the per-category entry-count from the River-tab accordion summaries (`renderLibrary`) + its now-dead `.acc-count` CSS; summaries show just the category name. SW → v0.15.0. | `npm test` **112/112**; headless @390px: 11 accordions, 0 count spans, first summary = "Customers", zero console errors | fox-curio-v0.15.0 |
| 2026-07-15 | **Wizard: cards lift + accent-label separation.** The `.wiz-card` borders were invisible in dark mode (fill == page bg). Now each card has a lighter fill (`color-mix(surface, text 7%)`), a stronger border (`color-mix(border, text 22%)`), and a soft shadow so it lifts off the page; the recessed dropdown (`--bg`) reads as the answer. The question label became a smaller UPPERCASE accent-coloured eyebrow (`.wiz-card > label`), visually distinct from its control (count badge kept non-caps/muted). Gap 14→18px. CSS-only; SW → v0.14.0. | `npm test` **112/112**; headless @390px both schemes: dark card fill srgb .22 vs body .13 (lifts), select bg == body (recessed), label = accent uppercase 12.5px; light border/shadow separate cleanly; screenshots confirm; zero overflow, zero console errors | fox-curio-v0.14.0 |
| 2026-07-15 | **Wizard: card-per-question spacing.** Each top-level field now renders in its own bordered card (`.wiz-card`) so questions no longer cluster — added the class to `selectField`/`selectGroupedField`/`suggestField`/`multiSelectField` outer boxes + the floorplan field, with CSS neutralizing inner-slot margins. SW → v0.13.0. | `npm test` **112/112**; headless @360px: 5 cards on identity + 5 on shop pages, uniform 14px gaps, 1px borders, zero overflow, zero console errors | fox-curio-v0.13.0 |
| 2026-07-15 | **Wizard → dropdowns, 5 pages.** Replaced all chip-button pickers with `<select>` controls and consolidated the 9 one-field pages into **5** (bookseller identity · your past · signature items · the shop · review). New builders in `wizard.js`: `selectField` (single), `selectGroupedField` (former-life optgroups: Bookseller / Other path), `suggestField` (name/species suggestions + "Custom…" reveal), `multiSelectField` (pick-exactly-N as N dropdowns that exclude each other's picks — no dupes, live count badge). Plain selects re-gate Next without a full re-render (no scroll jump); multi-selects re-render for cross-slot exclusion. Removed dead chip/single/multi/number builders. SW → v0.12.0. | `npm test` **112/112**; headless Chromium @360px: walked all 5 pages via real `selectOption` — Next disabled-until-valid on p1, Custom-name box revealed + accepted "Wobblesworth", former-life 2 optgroups, 3 item dropdowns dedup to 3 distinct + (3/3) badge, p4 9 selects + floorplan, review showed custom name, character created; **zero overflow**, **zero console errors** | fox-curio-v0.12.0 |
| 2026-07-15 | **UX revamp — wizard/textboxes/River/Home.** (1) Creation wizard split from 3 crammed steps into **9 one-group-per-page screens** (`PAGES` array with per-page `valid`, progress bar; Back/Next gating unchanged; Surprise/create/legacy-inherit intact). (2) **Bigger, auto-growing text areas**: new `core.autoGrow` (+`.autogrow`/`.tall`/`.tall-md` CSS + shared `.field` form-control styling that was previously unstyled outside modals); journal body starts ~260px and grows, wizard floorplan + edit-entry modal enlarged. (3) **River tab accordions**: `renderLibrary` now renders native `<details>` per category (all collapsed by default; search auto-opens matches) via new `compendium.groupedHits`; dropped the category `<select>`. (4) **Removed the Home "Rules library" panel** (+ its now-dead `dataStats` import). SW → v0.11.0. Harness +3 (groupedHits empty/full/filtered). | `npm test` **112/112**; headless Chromium @360px: Home card gone, wizard walked all 9 pages (Step N of 9, progressbar, Create on last, character persisted), journal textarea 260→766px on 15 lines, River 11 accordions all-collapsed → search "honey" auto-opened 2, **zero horizontal overflow** on every screen, **zero console errors** | fox-curio-v0.11.0 |
| 2026-07-15 | **Rules-accuracy audit (pass 1) + Phase 6 legacy carry.** Audit findings closed (§9.1): **R1** close-early now skips the extra-customer roll (was counting extras then halving) — offered at customer-completion, straight to tally; **R2** weather-forced `closeEarly` tasks now steer to that early close (were ignored); **R3** added books→coins 1:1 trade (`town.tradeBooksForCoins` + Town UI), the §2.3 fallback when broke. **Legacy carry**: `calendar.onYearRollover` (save-level `legacy` pool + character mark + end-of-year reflection entry) wired into every day-advance (End Day / day off / holiday celebrate / travel); wizard inherits the 3 leftovers (preserved through Surprise, consumed on create). Also fixed a latent bug in `celebrate` (undefined `save` ref; now ticks repairs+mail too). SW → v0.10.0. Harness +7 (legacy rollover ×3, audit R1/R3 ×4). | `npm test` **109/109**; browser (SW cache busted): trade 0→40c/300→260b, close-early reached tally halved with **no** extra roll, year-rollover pool captured → new bookseller inherited all 3 leftovers (hint shown, preserved through Surprise, pool consumed, char legacy mark set); zero console errors | fox-curio-v0.10.0 |
| 2026-07-15 | **Phase 5 — Compendium.** New `src/compendium.js` normalizes every reference record into searchable categories (52 customers, 10 towns w/ shops+people+special books+post, 11 recipes, 8 fish, 6 animals, 7 plants, 5 trades, 11 occupations, 5 moons, 20 genres, item catalog) with flat + per-category search; `renderLibrary` replaces the River-tab placeholder (search box + category select + results). SW → v0.9.0. Harness +6 (counts, scoped/flat/empty search). | `npm test` **102/102**; browser: River tab search "willow"→Weeping trees (1), "ginger"→2 recipes, category=Customers→52, zero console errors, 375px clean | fox-curio-v0.9.0 |
| 2026-07-15 | **Phase 4 (part 4) — Recipes + Letters→gifts (Phase 4 complete).** `src/mail.js`: post-office availability by town+season (snail/owl/express, brisk pricing), send a letter to any heart-tracked customer, reply queued at 2× the typical mail time and delivered by a daily tick (End Day / day off / per travelled day); at 2+ hearts the reply carries a gift = a random item from a shop in the current town, added to supplies. Post-office card on Town (recipient/kind selects + pending list). Recipes: `shareMeal` modal on Day picks a dish (ingredients + shared-meal reveal) and seeds a journal entry. SW → v0.8.0. Harness +7 (mail availability, recipients, send/deduct/queue, gift-on-reply, no-gift under 2 hearts; recipes via compendium data). | `npm test` **96/96**; browser: snail letter 4c → countdown 30 (2×15), day-off ticked 30→28, Share a meal seeded "Shared Cheesy parsnips" journal entry; zero console errors | fox-curio-v0.8.0 |
| 2026-07-15 | **Phase 4 (part 3) — Repairs + tradesanimals.** New `src/repairs.js`: a daily task with `effect.repair` now persists a broken repair (was previously a no-op — task card penalties weren't applied either; now `effect.cards`/`cardsRainy` flow through `repairCardPenalty` daily incl. trigger day, and non-repair one-day `cards` deltas apply too). Standing repairs reduce customer cards and block travel (`travel.canTravel` now uses `travelRepairBlock`, replacing the old hardcoded deck/roof check). Resolve by using the needed item (self-fix, consumes a supply) or hiring a trade at the post office: arrives next day, then each worked day rolls d6 (odd = fixed) and charges the trade's per-day fee — ticked on End Day, day off, and per travelled day. Added `REPAIR_LABELS` (data-compendium). Repairs UI on Town (hire/use) + a Day-screen notice. SW → v0.7.0. Harness +7 (trigger, penalty sum, travel block, self-fix, hire, transit-then-work timing, fee accounting). | `npm test` **91/91**; browser (seeded save): repairs card renders 3 states, self-fix consumed BugOff + cleared beetles, hire firesmith → en route (no charge), travel disabled by holed deck, Day −1 card modifier from chimney, full day: firesmith arrived day-7 (no fee) then worked day-7→8 (−60c, odd d6 → fixed); zero console errors; 375px clean | fox-curio-v0.7.0 |
| 2026-07-15 | Instantiated project spec from template v2. Ruled solo-journalling adaptation (§0): combat/powers/death/bestiary/multiplayer/GM omitted; journal + day engine + compendium elevated. Recorded Stage B decisions (§1.1). Built Data Extraction Ledger (§6) with T17–T24 blocked awaiting full rulebook. Roadmap seeded (§7). No code yet. | Spec review pending user sign-off | — |
| 2026-07-15 | **Full rulebook received** — all ⛔ blocks lifted. Corrected facts: weather is drawn by **card rank** (not d20); **books-sold = table[d6] + second d6**; books **cap 700** (Extra shelves ×2), not 600; Record player +1 card/day. Added weather-event counter subsystem (2.22), complete week names (2.12), town-shop/post-office economy (2.16, 2.13), distance map. New ambiguities A5 (forecast-count discrepancy), A6 (Skyflower date typo), A7 (cap). Ledger extended with T25–T29; schema gained upgrades/weatherEvent/mail/favours fields. No code yet. | Spec review pending user sign-off | — |
| 2026-07-15 | **Original PDF supplied** — set as authoritative source of record (page cites). Spot-checked pp.76–87: **A5 confirmed** (p.79 prints Quiet 3 / Snail's 2), **A6 confirmed** (p.76 calendar day 14 vs p.86 "24th"), A7 confirmed. All three rulings finalized. Verified clean: Bloom weather/tasks/earnings/books-sold two-roll, weather-event, week names. Ledger "how to continue" now points at the PDF. No code yet. | Cross-checked vs PDF pp.76–87 | — |
| 2026-07-15 | **Phase 4 (part 2) — Travel, Holidays, Book orders.** `src/travel.js` (legality by season/day/gear/raft-damage, distance along town chain +1 upstream, arrival d6 prompt, multi-day calendar advance with season-rollover reset, Undo); Travel screen (non-nav route). Holiday participation modal (about/participate/3 prompts/token, token coin-effects e.g. Night Market −100, Celebrate = day off). Book orders per season on Town screen (fulfil → reward coins, `ordersDone` field added to schema/normalize). Harness +8 (travel legality + distances). SW → v0.6.0. | `npm test` **84/84**; `node --check` all modules clean; browser UI verify pending (classifier outage) | fox-curio-v0.6.0 |
| 2026-07-15 | **Phase 4 (part 1) — Fishing, Town economy, Hearts.** `src/fishing.js` (draw-to-bite, reel to two-same-colour, season-gated catch → keep/release); `src/town.js` + Town screen (restock to 500 / season cost, buy supplies, Port Imes Extra-shelves ×2 → cap 700, Record player, bulrush jacket / ice skates / raft-reinforcement flags, duplicate-guards); hearts filled on befriendable flips with favour toasts at 2/3/6; new non-nav routes town/fishing. Harness +6 (fishing, town economy). SW → v0.5.0. Remaining Phase 4: travel/arrival, holiday participation, book orders, recipes, letters, repair lifecycle. | `npm test` **76/76**; browser: Port Imes buy (2000→1600c, shelves→cap 600), fishing result, heart 0→1; zero console errors | fox-curio-v0.5.0 |
| 2026-07-15 | **Phase 3 complete — Day engine + 🏁 First Session Playable.** `src/engine.js`: weather by card rank (card1=weather+forecast, card2=duration, card3=afternoon), weather-event counter (+reset at 3, fires next-day event), forecast→customer count with holiday snail's-pace override + Record-player/Arborea-market modifiers, daily-task d20 (bonus/halve applied), customer flips with d20 genre, extra-customers roll, end-of-day tally (+10/+20, earnings d6, books-sold d6+d6), close-early halving, apply to resources (books clamped to cap), advance calendar, roll log (capped 100). Guided Day-screen UI (`aria-live`), card pips, recent-days log. Engine smoke added to harness. SW → v0.4.0. | Browser: full day (holiday snail's-pace verified, +coins/−books applied, log 4 cards, day advanced, update-toast fired); `npm test` **70/70**; zero console errors | fox-curio-v0.4.0 |
| 2026-07-15 | **Phase 2 complete — Daybook core.** `src/calendar.js` (weekNameFor, nextCalendar, endDaySummary); Journal screen (new entry for current day, search, edit/delete); Day screen with **End the day** → confirm-summary modal → advance, with `Store.markUndo/undo` one-step undo + weatherEvent reset on season rollover; `actionToast` (Undo) in ui.js. SW shell + `CACHE_VERSION` → v0.3.0. | Browser: End Day from Bloom d20 → Burn d1/Bask + weatherEvent reset; Undo restored Bloom d20 + counter; journal entry saved; header live; **zero console errors** | fox-curio-v0.3.0 |
| 2026-07-15 | **Phase 1 complete — Creation wizard.** `src/wizard.js`: 3-step bookseller/shop/review flow, pick-exactly-N enforced (items 3, quirks 2, brought 3, leftovers 3), single-selects + custom-text name/species, birth moon+day, mooring town, floorplan notes, "Surprise me" quick-gen. Writes a normalized character to Store; resource header + Home CTA react. Added chip/wizard CSS; wired `renderCreate` from wizard into router; SW shell + `CACHE_VERSION` bumped to v0.2.0. | Browser end-to-end: Surprise me → 3 steps → Create → character persisted (3 items/2 quirks/3+3, moored Ennerck, 100c/500b, Bloom d1), resource header shows live, **zero console errors**, 360px clean | fox-curio-v0.2.0 |
| 2026-07-15 | **Phase 0 complete.** Verified all 5 season Weather tables vs PDF pp.79/93/111/127/143 (Burn omits some counts on-page → filled per A5). Built `data.js` + `data-compendium.js` (T1–T29: 52 customers, 5×[13 weather/20 tasks/6 earnings/6 books-sold], 12 holidays, 15 book orders, 10 towns + shops/post/distances, 11 recipes, 8 fish, 5 trades, item catalog). Scaffolded PWA shell: `index.html`, watercolor `styles.css` (light+dark, system default), `manifest.json`, `service-worker.js`, `icon.svg`, `firebase-config.js` placeholder; `src/` core/ui/settings/store/rules/screens/router/main; committed `tests/run.js`. Corrected estimates→real counts: holidays 12 (not ~13), creation items 20 (not 19), names 22. | `npm test` 65/65 pass; browser boot **zero console errors**; router/nav/aria-current, theme toggle (system→light→dark), localStorage, and **zero horizontal overflow at 360px** all verified in-browser | fox-curio-v0.1.0 |
