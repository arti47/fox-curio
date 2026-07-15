// main.js — entry point / boot.
import { $ } from './core.js';
import { Settings, applyTheme, nextTheme } from './settings.js';
import { initRouter } from './router.js';
import { Store } from './store.js';
import { updateToast } from './ui.js';

function boot() {
  applyTheme();

  // Header theme toggle
  $('#theme-toggle').addEventListener('click', () => {
    const mode = nextTheme();
    Settings.setTheme(mode);
  });
  // React to OS theme changes while in 'system' mode
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (Settings.theme() === 'system') applyTheme('system');
  });

  // Re-render resource header whenever the save changes
  Store.subscribe(() => {
    import('./screens.js').then((m) => m.renderResourceStrip());
  });

  initRouter();
  registerServiceWorker();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // file:// has no SW; skip quietly so the app still runs from a plain clone.
  if (location.protocol === 'file:') return;
  navigator.serviceWorker.register('service-worker.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          updateToast(() => { sw.postMessage('skipWaiting'); location.reload(); });
        }
      });
    });
  }).catch(() => { /* offline dev is fine */ });
}

document.addEventListener('DOMContentLoaded', boot);
