// Hand-rolled, dependency-free service worker. Page navigations are
// network-first (see below) so a deploy is never hidden behind a stale
// cached page; everything else (Monaco's self-hosted assets, hashed Next.js
// chunks, icons) is cache-first, falling back to the network and caching
// the response for next time. Keeps every tool page usable offline once
// visited, without needing build-time knowledge of Next's hashed filenames.
const CACHE_NAME = "devtools-cache-v2";
// Pre-cached so the offline fallback works even before any other page has
// been visited (and thus cached) yet.
const PRECACHE_URLS = ["/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations (HTML documents) go network-first so a deploy is never
  // masked by a stale cached page; fall back to the cache (then the offline
  // page) only when the network is unavailable.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached ?? caches.match("/offline"))
        )
    );
    return;
  }

  // Everything else (hashed /_next/static/* assets, icons, etc.) is safe to
  // serve cache-first: their URLs already change whenever their content does.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("/offline"));
    })
  );
});
