const CACHE = "mwapp-v3";

// Предзагружаем всё, без чего экран не соберётся. Раньше здесь не хватало
// i18n.js, и при первом запуске без сети приложение падало на пустом словаре.
const ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./js/i18n.js",
  "./js/qr.js",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  // addAll падает целиком, если хоть один файл не отдался. Кладём поштучно,
  // чтобы отсутствие одного файла не оставило приложение вовсе без кэша.
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(ASSETS.map((u) => c.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Чужие домены не трогаем вовсе: счётчик Cloudflare и шрифты Google идут
  // напрямую в сеть. Раньше мы пытались положить их ответ в кэш, а ответы
  // с другого домена непрозрачны — cache.put на них выбрасывает ошибку.
  // Для счётчика это критично: перехваченный запрос до него не доходит.
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  // Сначала сеть — приложение обновляется часто, и свежая версия важнее.
  // Кэш только когда сети нет.
  e.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        return res;
      })
      .catch(() =>
        // ignoreSearch обязателен: адреса несут либо метку запуска
        // (?launch=homescreen), либо версию для сброса кэша (?v=8),
        // и без него офлайн-запуск не находил бы ничего.
        caches.match(req, { ignoreSearch: true }).then(
          (hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
        )
      )
  );
});
