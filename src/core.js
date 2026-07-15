// core.js — foundational constants, DOM/util helpers, raw dice + card deck. No imports.

export const APP = { version: '0.1.0', storageKey: 'foxcurio.save.v1' };

// ---- DOM helpers ----
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}
export const clearNode = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };
// Auto-grow a textarea to fit its content (paired with `.autogrow` CSS: overflow hidden).
export function autoGrow(ta) {
  const grow = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
  ta.classList.add('autogrow');
  ta.addEventListener('input', grow);
  requestAnimationFrame(grow); // measure after mount
  return ta;
}
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- misc utils ----
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---- dice ----
export const rollDie = (sides) => 1 + Math.floor(Math.random() * sides);
export const d6 = () => rollDie(6);
export const d20 = () => rollDie(20);

// ---- cards (standard 52, no jokers) ----
export const SUITS = ['hearts', 'spades', 'clubs', 'diamonds'];
export const SUIT_SYMBOL = { hearts: '♥', spades: '♠', clubs: '♣', diamonds: '♦' };
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const isRoyal = (rank) => rank === 'J' || rank === 'Q' || rank === 'K';
export const isRed = (suit) => suit === 'hearts' || suit === 'diamonds';

export function buildDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ suit, rank });
  return deck;
}
export function shuffle(deck) {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function drawCard() {
  return { suit: pick(SUITS), rank: pick(RANKS) };
}
