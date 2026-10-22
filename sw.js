// La red primero, pero sin esperarla de más: si hay una copia guardada y la red no contesta en
// ESPERA ms (poca señal en el laboratorio), se muestra la copia y la red termina de actualizarla
// en segundo plano. Sin copia, se espera a la red. Así una actualización de las fichas se ve
// apenas hay conexión, y el QR abre la página en el acto aunque la señal sea mala o no haya.
// Al cambiar cualquier archivo, subir el número de CACHE; al agregar uno, sumarlo a ARCHIVOS.
const CACHE = "embv-v5";
const ESPERA = 2500;
const ARCHIVOS = ["./", "index.html", "estilos.css", "app.js", "aprender.js", "iconos.svg", "logo.svg", "manifest.webmanifest",
  "datos/reactivos.json", "tipografia/overpass.woff2", "tipografia/overpass-mono.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  let guardar = Promise.resolve();
  const red = fetch(req).then(res => {
    if (res.ok){ const c = res.clone(); guardar = caches.open(CACHE).then(k => k.put(req, c)); }
    return res;
  });
  // La copia se actualiza aunque la página ya se haya servido desde la copia vieja.
  e.waitUntil(red.then(() => guardar, () => {}));
  e.respondWith((async () => {
    const copia = await caches.match(req, {ignoreSearch: true}) || (req.mode === "navigate" ? await caches.match("./") : undefined);
    if (!copia) return red;
    const plazo = new Promise(ok => setTimeout(() => ok(copia), ESPERA));
    return Promise.race([red.catch(() => copia), plazo]);
  })());
});
