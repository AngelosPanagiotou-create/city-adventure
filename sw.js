const CACHE_NAME = 'city-adventure-v5'; // Ανεβάσαμε έκδοση για να ανανεωθεί η μνήμη
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; 
        }
        
        return fetch(event.request).then(networkResponse => {
            // Αν το αρχείο ανήκει στον φάκελο tiles, αποθήκευσέ το δυναμικά!
            if (event.request.url.includes('/tiles/')) {
                let responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
        });
      })
  );
});

// Καθαρισμός παλιάς μνήμης όταν ανεβάζουμε νέα έκδοση
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
});
