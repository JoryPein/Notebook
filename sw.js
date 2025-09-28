const CACHE_NAME = 'markdown-notes-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'https://cdn.tailwindcss.com/',
  'https://uicdn.toast.com/editor/latest/toastui-editor.min.css',
  'https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截请求并使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有匹配的资源，则返回它
        if (response) {
          return response;
        }

        // 否则，正常发起网络请求
        return fetch(event.request).then(
            (response) => {
                // 如果请求失败或不是我们想要缓存的类型，则直接返回
                if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                    return response;
                }

                // 克隆响应，因为响应体只能被读取一次
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                
                return response;
            }
        );
      })
  );
});

// 清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});