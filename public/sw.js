const CACHE_NAME = 'freegamehub-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;800&display=swap'
];

// 1. Instalación (Guardar archivos)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Activación (Limpiar cachés viejas)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. Interceptar peticiones (Modo Offline)
self.addEventListener('fetch', (e) => {
  // Solo interceptamos GET (las imágenes y archivos)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      // Si está en caché, lo devolvemos (velocidad extrema)
      // Si no, lo pedimos a internet
      return cached || fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Guardamos lo nuevo que vayamos visitando (imágenes de juegos)
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Si no hay internet y no está en caché, podríamos mostrar una página de error
      // Pero por ahora dejamos que falle suavemente
    })
  );
});
