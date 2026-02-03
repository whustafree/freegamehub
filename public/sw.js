/**
 * FreeGameHub Service Worker v2.0
 * Estrategia: Cache First para assets, Network First para API
 */

const CACHE_NAME = 'freegamehub-v2';
const STATIC_CACHE = 'fgh-static-v2';
const API_CACHE = 'fgh-api-v2';
const IMAGE_CACHE = 'fgh-images-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/stats.html'
];

// Instalación: Cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v2...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v2...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('freegamehub-') || 
                   (name.startsWith('fgh-') && !name.includes('v2'));
          })
          .map((name) => {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Estrategias de cacheo
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // No interceptar peticiones no-GET
  if (request.method !== 'GET') return;
  
  // No interceptar extensiones de Chrome
  if (url.protocol === 'chrome-extension:') return;
  
  // Estrategia para API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiStrategy(request));
    return;
  }
  
  // Estrategia para imágenes
  if (request.destination === 'image') {
    event.respondWith(imageStrategy(request));
    return;
  }
  
  // Estrategia para assets estáticos
  event.respondWith(staticStrategy(request));
});

// Cache First para assets estáticos
async function staticStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Refrescar en background
    fetch(request).then((response) => {
      if (response.ok) cache.put(request, response);
    }).catch(() => {});
    return cached;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error fetching:', request.url, error);
    // Retornar página offline si existe
    return caches.match('/offline.html');
  }
}

// Network First para API (datos siempre frescos)
async function apiStrategy(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] API offline, usando caché');
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Respuesta fallback para API
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Sin conexión',
        offline: true 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 503 
      }
    );
  }
}

// Cache First con límite para imágenes
async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) return cached;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Limitar tamaño de caché de imágenes
      const cacheSize = await getCacheSize(IMAGE_CACHE);
      if (cacheSize < 100) { // Máximo 100 imágenes
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    // Retornar imagen placeholder
    return new Response(
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><rect fill="%23333" width="300" height="150"/><text fill="%23999" x="50%" y="50%" text-anchor="middle">Sin imagen</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Helper: Contar items en caché
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  return keys.length;
}

// Background Sync para actualizaciones
self.addEventListener('sync', (event) => {
  if (event.tag === 'refresh-games') {
    event.waitUntil(refreshGames());
  }
});

async function refreshGames() {
  try {
    const response = await fetch('/api/free-games');
    const data = await response.json();
    
    // Notificar a los clientes
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'GAMES_UPDATED',
        count: data.games?.length || 0
      });
    });
  } catch (error) {
    console.error('[SW] Error en background sync:', error);
  }
}

// Push Notifications (para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '¡Nuevos juegos gratuitos disponibles!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'new-games',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Ver juegos' },
      { action: 'close', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('FreeGameHub', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
