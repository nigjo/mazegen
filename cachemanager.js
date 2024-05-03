/* 
 * Copyright 2024 nigjo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//based on
//https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers

const CACHE_MANAGER_VERSION = 'v0.1.4';

const CACHE_BASE_NAME = 'docksrunner';
const CACHE_NAME = CACHE_BASE_NAME + '_' + CACHE_MANAGER_VERSION;

//Minimale Dateien
const MIN_CACHED_RESOURCES = [
  './',
  'index.html',
  'res/game.css',
  'res/game.js',
  'res/dock_runner-192.png'
];
//Weitere Resourcen.
//Nicht dringend, aber später wichtig.
const PRE_CACHED_RESOURCES = [
  'res/v_topdown.svg',
  'res/v_topdown.js',
  'assets/assets.json',
  'view.html',
  'code.html',
  'res/swinit.js',
  'res/qr-code.png',
  'res/game_bg_water.svg',
  'res/game_bg_way.svg',
  'res/game_bg_wall.svg'
];

self.addEventListener("install", event => {
  console.log('install manager', CACHE_MANAGER_VERSION);
  async function preCacheResources() {
    // Open the app's cache.
    const cache = await caches.open(CACHE_NAME);
    console.log('CM', 'init pre cache');
    // Cache all static resources.
    await cache.addAll(MIN_CACHED_RESOURCES);
    console.log('CM', 'done.');
  }
  event.waitUntil(preCacheResources());
});

self.addEventListener("fetch", event => {
  console.log('CM', 'request', event.request.url);
  async function findCacheOrOrg() {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = event.request.url.split(/[?#]/)[0];
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
      console.debug('CM', 'cached', cachedResponse.url);
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
      console.debug('CM', 'fetched', fetchResponse.url);
      return fetchResponse;
    }
  }
  event.respondWith(findCacheOrOrg());
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
      } else {
        console.log('CM', 'add some resources');
        caches.open(name).then(c => {
          c.addAll(MIN_CACHED_RESOURCES);
          c.addAll(PRE_CACHED_RESOURCES);
        });
      }
    }));
  }

  event.waitUntil(deleteOldCaches());
});
