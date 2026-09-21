/* Service worker: makes the site installable and lets pages open with a weak connection. */
const CACHE = 'bgi-v1';
const PRECACHE = [
 "/",
 "/index.html",
 "/about.html",
 "/minerals.html",
 "/services.html",
 "/nigeria.html",
 "/international.html",
 "/contact.html",
 "/privacy.html",
 "/terms.html",
 "/404.html",
 "/thank-you.html",
 "/assets/css/styles.css",
 "/assets/js/app.js",
 "/manifest.webmanifest",
 "/assets/img/amethyst-inclusions.jpg",
 "/assets/img/amethyst-rough.jpg",
 "/assets/img/aquamarine.jpg",
 "/assets/img/charcoal-stack.jpg",
 "/assets/img/coal-collection-site.jpg",
 "/assets/img/coal-pile.jpg",
 "/assets/img/emblem.png",
 "/assets/img/fluorspar-rough.jpg",
 "/assets/img/gold-dust-bars.jpg",
 "/assets/img/gold-lab-scale.jpg",
 "/assets/img/kaolin-rough.jpg",
 "/assets/img/lithium-ore.jpg",
 "/assets/img/mixed-gem-parcel.jpg",
 "/assets/img/office-signboard.jpg",
 "/assets/img/ruby-garnet-rough.jpg",
 "/assets/img/tourmaline-kunzite.jpg",
 "/assets/icons/icon-192.png"
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('/index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => { const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => m); return m || net; }));
});
