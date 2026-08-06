self.addEventListener('push', function(event) {
  let data = {
    title: '📦 Novo Pedido Recebido!',
    body: 'Abra o Cardapp para conferir os detalhes.',
    icon: '/app-icon-192.png',
    url: '/admin'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      console.warn("Falha ao analisar JSON do push, usando texto simples", e);
      data.body = event.data.text() || data.body;
    }
  }

  // Defesa: Evita que strings base64 quebrem a renderização do sistema operacional
  let iconUrl = data.icon || '/app-icon-192.png';
  if (iconUrl.startsWith('data:')) {
    iconUrl = '/app-icon-192.png';
  }

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: '/app-icon-192.png',
    vibrate: [300, 100, 300, 100, 300], // Vibração insistente
    tag: 'new-order', // Tag para agrupar e atualizar notificações
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/admin'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it.
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Requisito para PWA ser "instalável": fetch handler com network-first para navegação e atualizações imediatas
const CACHE_NAME = 'cardapp-cache-v8';
const OFFLINE_URL = '/';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/app-icon-192.png',
  '/app-icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Falha ao pré-cachear alguns arquivos:', err);
        return cache.add(OFFLINE_URL);
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ignorar chamadas de API do cache
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Network-First para requisições de navegação/HTML para GARANTIR que atualizações apareçam de imediato
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // Cache-First para ativos estáticos (imagens, scripts bundlados)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        return new Response('', { status: 408, statusText: 'Erro de Rede' });
      });
    })
  );
});
