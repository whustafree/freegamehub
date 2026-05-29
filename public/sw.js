/**
 * FreeGameHub Service Worker v3.0
 * Estrategia: Cache First para Vite assets, Network First para API
 * Offline support para juegos guardados
 */

const CACHE_NAME = 'freegamehub-v3';
const STATIC_CACHE = 'fgh-static-v3';
const API_CACHE = 'fgh-api-v3';
const IMAGE_CACHE = 'fgh-images-v3';

// Instalación: Cachear el shell mínimo
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando v3...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(['/', '/index.html']))
      .then(() => self.skipWaiting())
  );
});

// Activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando v3...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith('freegamehub-') || (name.startsWith('fgh-') && !name.includes('v3')))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Estrategias de cacheo
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Images: Cache First con límite
  if (request.destination === 'image') {
    event.respondWith(cacheFirstLimited(request, IMAGE_CACHE, 150));
    return;
  }

  // Vite assets (JS, CSS, fonts): Cache First
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Everything else: Network First, fallback to cache
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match('/');
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.destination === 'document') return caches.match('/');

    return new Response(
      JSON.stringify({ success: false, error: 'Sin conexión', offline: true }),
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    );
  }
}

async function cacheFirstLimited(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const keys = await cache.keys();
      if (keys.length < maxItems) {
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><rect fill="%2311111b" width="300" height="150"/><text fill="%235c5c70" x="50%" y="50%" text-anchor="middle" font-family="sans-serif">Offline</text></svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification('FreeGameHub', {
      body: data.body || '¡Nuevos juegos gratuitos disponibles!',
      icon: '/vite.svg',
      tag: 'new-games',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Ver juegos' },
        { action: 'close', title: 'Cerrar' }
      ]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/'));
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
