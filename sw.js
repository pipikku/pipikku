// キャッシュの名前（バージョン）
// ★今後ファイルを更新した際は、ここを 'pipi-navi-v3' などのように数字を増やすと、端末側へ強制アップデートをかけられます。
const CACHE_NAME = 'pipi-navi-v2';

// キャッシュするファイルのリスト
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './chara.png',
  './chara2.png'
];

// 1. インストールイベント（ファイルをキャッシュに登録）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 全ての資産をキャッシュ中...');
      return cache.addAll(ASSETS);
    }).then(() => {
      // 新しいサービスワーカーをすぐに有効化させる
      return self.skipWaiting();
    })
  );
});

// 2. アクティベートイベント（古い不要なキャッシュを削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] 古いキャッシュを削除:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // ページのリロードなしで即座に制御を開始する
      return self.clients.claim();
    })
  );
});

// 3. フェッチイベント（ネットワークから取得を試み、失敗したらキャッシュを返す）
self.addEventListener('fetch', (event) => {
  // 基本的に拡張機能などのリクエスト（chrome-extension://等）は除外する
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // 常に最新のネットワーク通信を優先し、繋がらない場合はキャッシュを見る（Network First戦略）
    fetch(event.request)
      .then((response) => {
        // 正常なレスポンスならキャッシュを更新して返す
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時などはキャッシュから返す
        return caches.match(event.request);
      })
  );
});
