// Offline support. Network-first for the app's own files, always revalidating with the
// server (bypassing the browser's HTTP cache) so updates arrive as soon as they're online.
// Falls back to the saved copy when offline. Bump VERSION on every release.
const VERSION = '35';
const CACHE = 'iron77-v' + VERSION;
const DEMO_CACHE = 'iron77-demo-gifs'; // exercise demo animations, kept across releases
const DEMO_HOST = 'static.exercisedb.dev';
const FILES = ['./', 'index.html', 'styles.css', 'js/data.js', 'js/app.js', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/icon-32.png', 'icons/icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== DEMO_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'version') e.source.postMessage({ version: VERSION }); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.host === DEMO_HOST) {
    // Demo animations rarely change: serve from cache, fetch and keep on first view.
    // The host doesn't send CORS headers, so these are opaque responses (fine for <img>).
    e.respondWith(caches.open(DEMO_CACHE).then((c) => c.match(req.url).then((hit) => hit || fetch(req.url, { mode: 'no-cors' }).then((res) => { if (res.type === 'opaque' || (res.ok && (res.headers.get('content-type') || '').startsWith('image/'))) c.put(req.url, res.clone()); return res; }))));
    return;
  }
  const sameOrigin = url.origin === location.origin;
  const net = sameOrigin ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req);
  e.respondWith(net.then((res) => {
    if (res.ok && sameOrigin) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('./') : undefined))));
});
