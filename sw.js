const CACHE_NAME = 'pipi-navi-v3'; // バージョンを上げて古いキャッシュをクリア

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',    // ★ここに元の正方形アイコン画像名を追加！
  './chara.png',
  './chara2.png'
];

// (以降の処理は前のままで大丈夫です)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => return cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => { if(k !== CACHE_NAME) return caches.delete(k); }))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return res;
    }).catch(() => caches.match(event.request))
  );
});
