var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
  '/',
  '/apple-launch-page.png',
  '/apple-touch-icon.png',
  '/busy.gif',
  '/custom.css',
  '/jquery.js',
  '/jquery/jquery.mobile-1.4.0.min.js',
  '/scripts/db.js',
  '/scripts/export.js',
  '/scripts/helper.js',
  '/scripts/main.js',
  '/scripts/quiz.js',
  '/scripts/sync.js',
  '/scripts/voc.js',
  '/scripts/speech.js'
]; // todo images jquery

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
