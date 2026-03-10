// sw.js
const CACHE_NAME = 'estadisticamente-v2.0';
const urlsToCache = [
  './',
  './index.html',
  './integracion-dashboard.html',
  './nivelinicial.html',
  './login.html',
  './materials.html',
  './juegos.html',
  './dem.html',
  './styles.css',
  './script.js',
  './chatbot.js',
  './download.js',
  './voz.js',
  './nivelprimario.js',
  './frequencies.js',
  './statistics.js',
  './charts-chartjs.js',
  './Sin título (4).png',
  './seleccionar.png',
  './img/profemarce.png',
  // CDN externos
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://polyfill.io/v3/polyfill.min.js?features=es6',
  'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
  'https://cdn.plot.ly/plotly-2.24.1.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', function(event) {
  console.log('🔄 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Cache abierto, agregando recursos...');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('⚠️ Algunos recursos no se pudieron cachear:', error);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('🎯 Service Worker activado');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }

        // Si no está en cache, hacer fetch y cachear
        return fetch(event.request).then(function(response) {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta para cachear
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          // Si falla la red, intentar devolver la página principal para rutas HTML
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
          console.log('❌ Error de red:', error);
        });
      })
  );
});

// Manejar mensajes desde la app
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});