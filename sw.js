const CACHE_NAME = 'city-adventure-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Όταν ανοίγει η εφαρμογή, αποθηκεύει τα αρχεία στη μνήμη του κινητού
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Όταν η εφαρμογή ζητάει αρχεία, τα δίνει από τη μνήμη, ακόμα και χωρίς internet!
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Τα βρήκε στη μνήμη (Offline)
        }
        return fetch(event.request); // Προσπαθεί να τα κατεβάσει αν δεν τα έχει
      })
  );
});
