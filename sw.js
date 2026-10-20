// La red primero y, si no hay señal en el laboratorio, la última copia guardada.
// Así una actualización de las fichas se ve apenas hay conexión, y el QR sigue
// abriendo la página aunque el celular esté sin datos.
// Al cambiar la lista de archivos, subir el número de CACHE.
const CACHE = "embv-v3";
const ARCHIVOS = ["./", "index.html", "estilos.css", "app.js", "iconos.svg", "logo.svg", "manifest.webmanifest", "datos/reactivos.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("./")))
  );
});
