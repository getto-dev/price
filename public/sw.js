// Версия кеша - обновляется при каждом деплое
const CACHE_VERSION = 'v2-' + Date.now();
const STATIC_CACHE = 'price-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'price-dynamic-' + CACHE_VERSION;

// Определяем режим (production если путь содержит /price)
const isProd = typeof self !== 'undefined' && self.location && self.location.pathname.includes('/price');
const basePath = isProd ? '/price' : '';

// Отключаем логирование в production
const DEBUG = !isProd;
const log = DEBUG ? console.log.bind(console, '[SW]') : () => {};
const logError = console.error.bind(console, '[SW]');

// Критичные файлы для офлайн-доступа
const STATIC_FILES = [
  `${basePath}/`,
  `${basePath}/manifest.json`,
  `${basePath}/icons/android/android-192x192.png`,
  `${basePath}/icons/android/android-512x512.png`,
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  log('Installing, version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      log('Caching static files');
      return cache.addAll(STATIC_FILES);
    }).catch((error) => {
      logError('Failed to cache static files:', error);
    })
  );
  // Активируем сразу, не дожидаясь закрытия вкладок
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  log('Activating, version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.includes(CACHE_VERSION))
          .map((key) => {
            log('Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      log('Claiming clients');
      return self.clients.claim();
    }).then(() => {
      // Уведомляем клиентов об обновлении
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: CACHE_VERSION
        });
      });
    }).catch((error) => {
      logError('Activation failed:', error);
    })
  );
});

// Обработка fetch-запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем non-GET запросы
  if (request.method !== 'GET') return;

  // Пропускаем chrome-extension и другие не-http(s) запросы
  if (!url.protocol.startsWith('http')) return;

  // Для запросов с других доменов - cache-first
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request);
      }).catch(() => {
        // Возвращаем пустой ответ при ошибке
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // Для навигационных запросов (страницы) - network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кешируем успешный ответ
          if (response.ok) {
            const cloned = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, cloned);
            }).catch(() => {
              // Игнорируем ошибки кеширования
            });
          }
          return response;
        })
        .catch(() => {
          // При ошибке сети - возвращаем из кеша или главную страницу
          return caches.match(request).then((cached) => {
            return cached || caches.match(`${basePath}/`);
          });
        })
    );
    return;
  }

  // Для остальных запросов - stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, cloned);
            }).catch(() => {
              // Игнорируем ошибки кеширования
            });
          }
          return response;
        })
        .catch((error) => {
          // Если нет кеша и сеть недоступна - возвращаем ошибку
          logError('Fetch failed:', error);
          return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });

      // Возвращаем кеш если есть, иначе ждём сеть
      return cached || fetchPromise;
    })
  );
});

// Обработка сообщений от клиентов
self.addEventListener('message', (event) => {
  log('Message received:', event.data);

  if (event.data === 'skipWaiting' || event.data?.type === 'SKIP_WAITING') {
    log('Skip waiting requested');
    self.skipWaiting();
  }
});
