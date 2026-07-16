// router.js — bottom-nav routing + conditional tab gating.
import { el, $, clearNode } from './core.js';
import {
  renderHome, renderDay, renderJournal, renderLibrary, renderSettings, renderResourceStrip,
  renderTown, renderFishing, renderTravel,
} from './screens.js';
import { renderCreate } from './wizard.js';

const ROUTES = {
  home: { label: 'Home', icon: '🦊', render: renderHome },
  create: { label: 'Create', icon: '✒️', render: renderCreate },
  day: { label: 'Shop', icon: '📖', render: renderDay },
  journal: { label: 'Journal', icon: '🖋', render: renderJournal },
  library: { label: 'River', icon: '🗺', render: renderLibrary },
  settings: { label: 'Settings', icon: '⚙️', render: renderSettings },
  town: { label: 'Town', icon: '🏘', render: renderTown },
  fishing: { label: 'Fishing', icon: '🎣', render: renderFishing },
  travel: { label: 'Travel', icon: '🛶', render: renderTravel },
};
const NAV_ORDER = ['home', 'create', 'day', 'journal', 'library', 'settings'];

let current = 'home';

export function go(route) {
  if (!ROUTES[route]) route = 'home';
  const changed = route !== current; // same-route re-render (a button action) keeps scroll
  current = route;
  if (location.hash !== `#${route}`) history.replaceState(null, '', `#${route}`);
  render(changed);
}

function render(scrollTop = true) {
  const screen = $('#screen');
  clearNode(screen);
  renderResourceStrip();
  ROUTES[current].render(screen);
  screen.focus({ preventScroll: true });
  if (scrollTop) window.scrollTo(0, 0); // only on tab change, not on in-place updates
  updateNav();
}

function updateNav() {
  const nav = $('#bottom-nav');
  if (!nav.childElementCount) buildNav(nav);
  for (const btn of nav.children) {
    const active = btn.dataset.route === current;
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  }
}

function buildNav(nav) {
  for (const route of NAV_ORDER) {
    const r = ROUTES[route];
    const btn = el('button', { class: 'nav-item', 'aria-current': 'false', dataset: { route } }, [
      el('span', { class: 'nav-ico', 'aria-hidden': 'true', text: r.icon }),
      el('span', { text: r.label }),
    ]);
    btn.addEventListener('click', () => go(route));
    nav.append(btn);
  }
}

export function initRouter() {
  $('#brand-btn').addEventListener('click', () => go('home'));
  window.addEventListener('hashchange', () => {
    const route = location.hash.slice(1);
    if (route && route !== current) go(route);
  });
  const initial = location.hash.slice(1);
  go(ROUTES[initial] ? initial : 'home');
}
