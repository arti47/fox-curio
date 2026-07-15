// settings.js — feature/content toggles + theme. Off by default; explicit choice persists.
const KEY = 'foxcurio.settings.v1';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch { /* ignore */ }
}

export const Settings = {
  get(flag, fallback = undefined) {
    const s = read();
    return flag in s ? s[flag] : fallback;
  },
  set(flag, value) {
    const s = read(); s[flag] = value; write(s);
  },
  // Theme: 'system' | 'light' | 'dark'. Default follows system.
  theme() { return this.get('theme', 'system'); },
  setTheme(mode) { this.set('theme', mode); applyTheme(mode); },
};

export function applyTheme(mode = Settings.theme()) {
  const root = document.documentElement;
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
  // keep the browser UI colour in step
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    meta.setAttribute('content', dark ? '#211b14' : '#e9dcc3');
  }
}

// Cycle order for the header button: system -> light -> dark -> system
export function nextTheme(mode = Settings.theme()) {
  return mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
}
