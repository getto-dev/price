const STATIC_CACHE = 'price-static-v1';
const DYNAMIC_CACHE = 'price-dynamic-v1';

const isProd = typeof self !== 'undefined' && self.location && self.location.pathname.includes('/price');
const basePath = isProd ? '/price' : '';

const STATIC_FILES = [
  `${basePath}/`,
  `${basePath}/manifest.json`,
  `${basePath}/icons/android/android-192.png`,
  `${basePath}/icons/android/android-512.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, cloned);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(`${basePath}/`);
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        fetch(request).then((response) => {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response);
          });
        }).catch(() => {});
        return cached;
      }

      return fetch(request).then((response) => {
        const cloned = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, cloned);
        });
        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
