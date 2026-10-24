import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

/* ─────────────────────────────────────────────────────────────
   Boot sequence
   ───────────────────────────────────────────────────────────── */

// Flag used by the inline watchdog in index.html
window.__KERP_BOOTED__ = false;

// Safe mode: strips glass blur / heavy motion for low-power or
// GPU-constrained devices (index.html sets the class before paint).
if (new URLSearchParams(window.location.search).has('safe')) {
  document.documentElement.classList.add('safe-mode');
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  window.__KERP_BOOTED__ = true;
} catch (err) {
  window.__KERP_BOOT_ERROR__ = err;
  // eslint-disable-next-line no-console
  console.error('[K-ERP] Fatal mount error:', err);
}

// Fade out the boot splash once the workspace has painted
const dismissBoot = () => {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.add('done');
  setTimeout(() => boot.remove(), 700);
};
requestAnimationFrame(() => requestAnimationFrame(dismissBoot));

// Safety net: never leave the user staring at the splash
setTimeout(dismissBoot, 8000);

/* ─────────────────────────────────────────────────────────────
   Service worker policy
   -----------------------------------------------------------------
   A PWA cache is only ever enabled deliberately (?sw=1 on a
   production build). Everywhere else — dev server, live preview,
   iframe embeds — any existing registration is removed and all
   caches are dropped so a stale build can never be served.
   ───────────────────────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  const wantsSW = import.meta.env.PROD && new URLSearchParams(window.location.search).has('sw');

  if (wantsSW) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => console.log('[PWA] Service worker active:', reg.scope))
        .catch(err => console.warn('[PWA] Registration failed:', err));
    });
  } else {
    navigator.serviceWorker.getRegistrations()
      .then(regs => {
        if (regs.length) console.info('[K-ERP] Purging stale service worker(s) for a clean load');
        return Promise.all(regs.map(r => r.unregister().catch(() => false)));
      })
      .then(() => (window.caches ? window.caches.keys() : []))
      .then(keys => Promise.all((keys || []).map(k => window.caches.delete(k).catch(() => false))))
      .catch(() => { /* non-fatal */ });
  }
}
