//based on
//https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers

const CACHE_MANAGER_VERSION = 'v0.1.2';

const CACHE_BASE_NAME = 'docksrunner';
const CACHE_NAME = CACHE_BASE_NAME + '_v1';

const PRE_CACHED_RESOURCES = [
  './',
  'index.html',
  'res/swinit.html',
  'res/dock_runner.svg',
  'res/dock_runner-192.png',
  'res/v_topdown.svg',
  'res/v_topdown.js',
  'res/game.js',
  'res/game.css',
  'assets/assets.json'
];

self.addEventListener("install", event => {
  console.log('install manager', CACHE_MANAGER_VERSION);
  async function preCacheResources() {
    // Open the app's cache.
    const cache = await caches.open(CACHE_NAME);
    console.log('CM', 'init pre cache');
    // Cache all static resources.
    cache.addAll(PRE_CACHED_RESOURCES);
  }
  event.waitUntil(preCacheResources());
});

self.addEventListener("fetch", event => {
  console.log('WORKER: Fetching', event.request);
  async function findCacheOrOrg() {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = event.request.url;
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      fetch(cacheKey).then(r => {
        if (r.ok) {
          // store new resource
          console.log('CM', 'update cache for ', cacheKey);
          cache.put(cacheKey, r.clone());
        }
      });
      // Return the old resource.
      return cachedResponse;
    } else {
      // The resource wasn't found in the cache, so fetch it from the network.
      const fetchResponse = await fetch(cacheKey);
      if (fetchResponse.ok) {
        // Put the response in cache.
        console.log('CM', 'caching new file ', cacheKey);
        cache.put(cacheKey, fetchResponse.clone());
      } else {
        console.log('CM', 'cached file', cacheKey);
      }
      // And return the response.
      return fetchResponse;
    }
  }
  event.responseWith(findCacheOrOrg());
});

self.addEventListener("activate", event => {
  console.log('activate manager', CACHE_MANAGER_VERSION);
  async function deleteOldCaches() {
    // List all caches by their names.
    const names = await caches.keys();
    await Promise.all(names.map(name => {
      if (name !== CACHE_NAME) {
        // If a cache's name is the current name, delete it.
        console.log('CM', 'delete old cache', name);
        return caches.delete(name);
      }
    }));
  }

  event.waitUntil(deleteOldCaches());
});