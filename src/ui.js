// ui.js — themed modals/toasts/confirm/prompt. Accessible: focus trap, Escape, focus restore.
import { el, $, clearNode, autoGrow } from './core.js';

let toastWrap = null;
function ensureToastWrap() {
  if (!toastWrap) { toastWrap = el('div', { class: 'toast-wrap', 'aria-live': 'polite' }); document.body.append(toastWrap); }
  return toastWrap;
}
export function showToast(message, ms = 2600) {
  const t = el('div', { class: 'toast', role: 'status', text: message });
  ensureToastWrap().append(t);
  setTimeout(() => t.remove(), ms);
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

// Generic modal. content: string|Node. Returns { close }.
export function modal({ title, content, actions = [] } = {}) {
  const prevFocus = document.activeElement;
  const box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Dialog' });
  if (title) box.append(el('h2', { text: title }));
  const body = el('div', { class: 'modal__body' });
  if (typeof content === 'string') body.innerHTML = content; else if (content) body.append(content);
  box.append(body);
  const actionBar = el('div', { class: 'modal__actions' });
  const backdrop = el('div', { class: 'modal-backdrop' });

  function close() {
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }
  for (const a of actions) {
    const btn = el('button', { class: `btn ${a.variant === 'ghost' ? 'btn--ghost' : ''}`.trim(), text: a.label });
    btn.addEventListener('click', () => { const keep = a.onClick && a.onClick(); if (!keep) close(); });
    actionBar.append(btn);
  }
  if (actions.length) box.append(actionBar);
  backdrop.append(box);

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      const f = Array.from(box.querySelectorAll(FOCUSABLE));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  document.body.append(backdrop);
  const focusTarget = box.querySelector(FOCUSABLE) || box;
  focusTarget.focus();
  return { close, box, body };
}

export function confirmModal(message, { title = 'Confirm', okLabel = 'OK', cancelLabel = 'Cancel', danger = false } = {}) {
  return new Promise((resolve) => {
    modal({
      title, content: `<p>${message}</p>`,
      actions: [
        { label: cancelLabel, variant: 'ghost', onClick: () => { resolve(false); } },
        { label: okLabel, onClick: () => { resolve(true); } },
      ],
    });
  });
}

export function promptModal(message, { title = 'Enter', value = '', okLabel = 'Save', multiline = false } = {}) {
  return new Promise((resolve) => {
    const input = multiline
      ? el('textarea', { class: 'tall', style: 'min-height:220px' }) : el('input', { type: 'text' });
    input.value = value;
    const wrap = el('div', {}, [el('p', { text: message }), input]);
    if (multiline) autoGrow(input);
    modal({
      title, content: wrap,
      actions: [
        { label: 'Cancel', variant: 'ghost', onClick: () => resolve(null) },
        { label: okLabel, onClick: () => resolve(input.value) },
      ],
    });
    setTimeout(() => input.focus(), 30);
  });
}

// Toast with a single action button (e.g. Undo). Auto-dismisses.
export function actionToast(text, label, onClick, ms = 6000) {
  const t = el('div', { class: 'toast', role: 'status' });
  const btn = el('button', { class: 'btn btn--sm', text: label, onClick: () => { onClick(); t.remove(); } });
  t.append(text + ' ', btn);
  ensureToastWrap().append(t);
  setTimeout(() => t.remove(), ms);
}

// "Update available — reload" toast used by the service-worker flow.
export function updateToast(onReload) {
  const t = el('div', { class: 'toast', role: 'status' });
  t.append('New version available. ', el('button', { class: 'btn btn--sm', text: 'Reload', onClick: onReload }));
  ensureToastWrap().append(t);
}
