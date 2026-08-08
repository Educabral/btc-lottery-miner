const CACHE_NAME = 'btc-miner-v9';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app2.js',
  '/pixgo-mascote.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força a atualização imediata do worker
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Estratégia Network-First: Sempre tenta pegar a versão mais nova da internet/servidor
  // Se estiver sem internet, pega do Cache (PWA Offline)
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
