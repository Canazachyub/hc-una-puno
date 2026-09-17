// Service worker: la app abre y genera el Word sin señal.
// Navegación: red primero, caché si no hay señal. Recursos: caché primero y se actualiza por detrás.

const CACHE = 'hc-app-v2';
const BASE = ['./', './index.html', './manifest.webmanifest', './header.png', './footer.png', './icon.svg', './icon-192.png'];

async function precache() {
  const cache = await caches.open(CACHE);
  let archivos = [];
  try {
    const r = await fetch('./precache.json', { cache: 'no-store' });
    if (r.ok) archivos = (await r.json()).archivos.map((f) => `./${f}`);
  } catch {
    return;
  }
  const vigentes = new Set([...BASE, ...archivos].map((u) => new URL(u, self.registration.scope).href));
  await Promise.all(
    [...vigentes].map(async (url) => {
      if (await cache.match(url)) return;
      try {
        const r = await fetch(url, { cache: 'no-store' });
        if (r.ok) await cache.put(url, r);
      } catch {
        // se reintenta en la próxima visita
      }
    }),
  );
  // Borra los archivos de versiones anteriores del build.
  for (const req of await cache.keys()) {
    if (req.url.includes('/assets/') && !vigentes.has(req.url)) await cache.delete(req);
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(BASE))
      .then(precache)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.tipo === 'precache') e.waitUntil(precache());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copia));
          return r;
        })
        .catch(() =>
          caches.match('./index.html', { ignoreVary: true }).then((r) => r || caches.match('./', { ignoreVary: true })),
        ),
    );
    return;
  }

  if (url.pathname.endsWith('/precache.json')) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // ignoreVary: los módulos cargados con import() llevan cabecera Origin y no coincidirían.
      const guardado = await cache.match(req, { ignoreSearch: true, ignoreVary: true });
      const red = fetch(req)
        .then((r) => {
          if (r.ok) cache.put(req, r.clone());
          return r;
        })
        .catch(() => guardado);
      return guardado || red;
    }),
  );
});
