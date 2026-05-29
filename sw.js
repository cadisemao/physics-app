const CACHE_NAME = 'physics-app-v1';
const ASSETS = ['index.html','manifest.json','css/style.css','js/curriculum.js','js/database.js','js/stats.js','js/ui.js','js/app.js'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});
self.addEventListener('fetch',function(e){
  e.respondWith(caches.match(e.request).then(function(c){return c||fetch(e.request);}));
});
self.addEventListener('push',function(e){
  var d=e.data?e.data.json():{};
  e.waitUntil(self.registration.showNotification(d.title||'物理冲刺',{body:d.body||'该学习了！',icon:'icons/icon-192.png',tag:'physics-reminder'}));
});
