const CACHE_NAME = 'b3-v1';
const ASSETS = [
  './',
  './index.html',
  './dados.json',
  './icon.png',
  './manifest.json'
];

// Instala o Service Worker e guarda os arquivos no cache do celular
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa e remove caches antigos, se houver
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Serve do cache imediatamente, mas atualiza o cache em segundo plano com a versão da rede
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Se a resposta for válida, atualiza o cache
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se estiver totalmente offline, não faz nada, apenas falha silenciosamente
      });

      // Retorna o cache imediatamente (se houver) ou espera a rede
      return cachedResponse || fetchPromise;
    })
  );
});
