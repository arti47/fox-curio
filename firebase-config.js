// firebase-config.js — PLACEHOLDER. Local-only mode needs no keys and works with zero config.
//
// This solo journalling game is single-player by design (see CLAUDE.md §0). Cloud is only
// an optional, later stretch for backing up YOUR OWN save across devices — never multiplayer.
// To enable it (Phase 6), flip FIREBASE_ENABLED to true and paste your own config below.
// NEVER commit real keys.

export const FIREBASE_ENABLED = false;

export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  databaseURL: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};
