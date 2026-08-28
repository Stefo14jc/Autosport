const CACHE = "autosport-v1";
const STATIC = ["/", "/index.html"];
const COLA_KEY = "offline_queue";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method === "GET") {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  if (req.method === "GET" && req.url.includes("/api/accesorios")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }
  if (req.method === "POST" && req.url.includes("/api/movimientos")) {
    e.respondWith(
      fetch(req.clone()).catch(async () => {
        const body = await req.clone().json();
        const cola = JSON.parse(localStorage.getItem(COLA_KEY) || "[]");
        cola.push({
          url: req.url,
          method: "POST",
          body,
          timestamp: Date.now(),
        });
        localStorage.setItem(COLA_KEY, JSON.stringify(cola));
        return new Response(
          JSON.stringify({ offline: true, mensaje: "Guardado localmente" }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }),
    );
  }
});
