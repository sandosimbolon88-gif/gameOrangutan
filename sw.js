/* Cache offline sederhana: game tetap jalan tanpa internet setelah dibuka sekali. */
const CACHE = 'shb-v1-20261108';
const FILES = [
  './', './index.html', './css/style.css', './manifest.webmanifest', './assets/icon.svg',
  './js/config.js', './js/content.js', './js/util.js', './js/audio.js',
  './js/art/orangutan.js', './js/art/props.js', './js/art/scenery.js',
  './js/leaderboard.js', './js/ui.js',
  './js/lessons/feed.js', './js/lessons/climb.js', './js/lessons/forage.js', './js/lessons/nest.js', './js/lessons/island.js', './js/lessons/release.js',
  './js/game.js', './js/main.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('shb-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// network-first agar perubahan langsung terpakai, cache sebagai cadangan offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.registration.scope)) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
