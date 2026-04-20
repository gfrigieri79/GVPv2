self.addEventListener('install', (e) => {
  console.log('GVP.OS Titan: Motor ativado!');
});

self.addEventListener('fetch', (e) => {
  // Mantém o app funcionando
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});