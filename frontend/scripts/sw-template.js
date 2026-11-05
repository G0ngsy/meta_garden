/* Generated during production build. Do not serve this template directly. */
const CACHE = 'meta-garden-__CACHE_VERSION__'
const ASSETS = __PRECACHE_URLS__
self.addEventListener('install', event => {
  // The worker can only activate when every required file has been stored.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)))
})
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('meta-garden-') && key !== CACHE) await caches.delete(key)
    }
    await self.clients.claim()
  })())
})
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
  if (event.data === 'CHECK_READY') {
    event.waitUntil((async () => {
      try {
        const cache = await caches.open(CACHE)
        const ready = (await Promise.all(ASSETS.map(url => cache.match(url)))).every(Boolean)
        event.ports[0]?.postMessage({ ready })
      } catch { event.ports[0]?.postMessage({ ready: false }) }
    })())
  }
})
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  // Never cache API, WebSocket or arbitrary third-party responses.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match('/index.html')) || fetch(event.request)))
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(url.pathname)) || fetch(event.request)))
  }
})
