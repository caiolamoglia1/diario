// Service worker do Nosso Diário: deixa o app instalável, abre rápido e mostra os avisos.
// Os dados (Supabase) nunca são guardados aqui: só os arquivos do próprio site.
const CACHE = 'nosso-diario-v2';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // páginas: tenta a rede primeiro (versão nova), usa o cache se estiver sem internet
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('/', copy));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // arquivos com hash no nome (/assets/...) nunca mudam: cache primeiro
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        cached =>
          cached ||
          fetch(request).then(response => {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});

// aviso que chega do servidor (push), mesmo com o app fechado
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Nosso Diário', body: event.data?.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nosso Diário', {
      body: data.body || '',
      tag: data.tag,
      renotify: Boolean(data.tag),
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    })
  );
});

// tocar no aviso abre (ou traz para frente) o diário
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const open = clients.find(client => 'focus' in client);
      return open ? open.focus() : self.clients.openWindow('/');
    })
  );
});
