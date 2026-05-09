const CACHE_NAME = 'kafka-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/styles/design-system.css',
    '/src/core/app.js'
];

// Install event: Cache core foundational assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // we use addAll but wrap it to continue even if some files (like icons) are missing
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url))
            );
        })
    );
});

// Fetch event: Network-first strategy with extension filtering
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // FIX: Ignore non-http(s) protocols (like chrome-extension://)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network works, return response
                return response;
            })
            .catch(() => {
                // If network fails, try the cache
                return caches.match(event.request);
            })
    );
});