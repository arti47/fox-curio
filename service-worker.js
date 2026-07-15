// service-worker.js — network-first, caches the app shell + all data files.
// Bump CACHE_VERSION on any shipped-file change (CLAUDE.md §8.6).
const CACHE_VERSION = 'fox-curio-v0.18.0';

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon.svg',
  './data.js',
  './data-compendium.js',
  './src/core.js',
  './src/ui.js',
  './src/settings.js',
  './src/store.js',
  './src/rules.js',
  './src/calendar.js',
  './src/engine.js',
  './src/fishing.js',
  './src/town.js',
  './src/travel.js',
  './src/repairs.js',
  './src/mail.js',
  './src/compendium.js',
  './src/wizard.js',
  './src/screens.js',
  './src/router.js',
  './src/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// Network-first for same-origin GETs; fall back to cache offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
