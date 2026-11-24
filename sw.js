/* EPIC HOME service worker, v2.16.0
   Page, theme.css and theme.js: network first, so a new upload or a new colour shows straight away; the saved copy is used offline.
   The page is handed to the app with theme.js added, so behaviour can change without re-uploading index.html.
   Icons, manifest, fonts: saved copy first. */
const CACHE = 'epic-home-v1.9.7';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './logo.svg', './theme.css', './theme.js'];
const HOOK = '<script src="theme.js" defer></script>';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* add the theme.js hook to the page, once */
function withHook(res){
  if (!res || !res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  return res.text().then(html => {
    if (!html.includes('theme.js')) html = html.includes('</body>') ? html.replace('</body>', HOOK + '</body>') : html + HOOK;
    const h = new Headers(res.headers); h.delete('content-length');
    return new Response(html, {status: res.status, statusText: res.statusText, headers: h});
  }).catch(() => res);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  const nav = req.mode === 'navigate';

  if (nav || (sameOrigin && /\.(css|js)$/.test(url.pathname) && !url.pathname.endsWith('sw.js'))) {
    e.respondWith(
      fetch(req, {cache: 'no-cache'}).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return nav ? withHook(res) : res;
      }).catch(() => caches.match(req).then(hit => hit || (nav ? caches.match('./index.html') : undefined))
                                .then(hit => nav ? withHook(hit) : hit))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
