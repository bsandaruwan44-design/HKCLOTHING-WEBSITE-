const CACHE_NAME = 'hk-clothing-pos-v1';
const ASSETS = [
    'index.html',
    'inventory.html',
    'reports.html',
    'settings.html',
    'css/style.css',
    'js/db.js',
    'js/pos.js',
    'js/inventory.js',
    'js/reports.js',
    'js/settings.js',
    'manifest.json',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/dexie/dist/dexie.js',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
