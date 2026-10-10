/* Steady service worker: caches the whole app so it works fully offline.
   Bump VERSION (here and in app.js) on every release, and list every course file in ASSETS. Progress lives in localStorage and is never touched here. */
const VERSION = '3.4.1';
const CACHE = 'steady-' + VERSION;
const ASSETS = ['./', 'index.html', 'app.css', 'app.js', 'config.js', 'i18n.js', 'manifest.webmanifest',
  'courses/ai-foundations.js', 'courses/ai-foundations.practice.js', 'courses/personal-finance.js', 'courses/personal-finance.practice.js',
  'fonts/plex-ar-400.woff2', 'fonts/plex-ar-500.woff2', 'fonts/plex-ar-700.woff2',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(a => new Request(a, {cache: 'reload'}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && (k.startsWith('ai-study') || k.startsWith('steady'))).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (req.mode === 'navigate') return (await cache.match('index.html')) || fetch(req);
    const hit = await cache.match(req, {ignoreSearch: true});
    if (hit) return hit;
    try { return await fetch(req); }
    catch (err) { return new Response('Not available offline', {status: 503, headers: {'Content-Type': 'text/plain'}}); }
  })());
});
