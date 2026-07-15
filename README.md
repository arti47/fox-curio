# Fox Curio's Floating Bookshop — Solo Player App

A personal, offline-capable companion for the solo journalling game *Fox Curio's Floating
Bookshop: A Year Upon a River* by Ella Lim (Lost Ways Club, 2023). It runs your days on the
River — drawing cards, rolling dice, tracking coins/books/hearts, and holding your daybook.

> **Status:** Phase 0 (Foundations) complete — full rules data library, watercolor-river
> theme, installable PWA shell, and a bootable app with local saving. The creation wizard,
> day engine, journal and compendium arrive in later phases (see `CLAUDE.md`).

## Run it

No build step. Any static server works:

```bash
cd fox-curio-app
python3 -m http.server 8000    # then open http://localhost:8000
```

Opening `index.html` directly from disk also works, minus the service worker (which needs
`http(s)://`). The app runs fully offline in **local-only mode** with zero configuration —
your game is saved in this browser's `localStorage`. Export/import a JSON backup from
**Settings**.

## Optional cloud backup (later)

`firebase-config.js` is a placeholder with `FIREBASE_ENABLED = false`. This game is
single-player by design; cloud sync is only a future, optional way to back up *your own*
save across devices. **Never commit real keys.**

## Tests

```bash
npm install      # dev-only: playwright-core
npm test         # headless boot/wiring + rules invariants
```

## Project docs

`CLAUDE.md` is the canonical spec — the completed System Profile, data-extraction ledger,
build roadmap, and changelog.

## Licensing

This is a **personal play aid** built from the owner's copy of the book. All game text is
paraphrased; setting fiction and art are excluded. If you publish or distribute a build,
licensing is your responsibility — openly licensed material (an SRD / ORC / CC source) is
the safe basis for anything public.
