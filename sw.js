// HSM Check sheets — offline cache. เปลี่ยนเลขเวอร์ชันทุกครั้งที่อัปเดตไฟล์ index.html, motor-temp.html หรือ fault-lookup.html
const CACHE = "hsm-check-1.7.0";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png",
  "./motor-temp.html", "./motor-manifest.webmanifest", "./motor-icon-180.png", "./motor-icon-192.png", "./motor-icon-512.png",
  "./fault-lookup.html", "./fault-manifest.webmanifest", "./fault-icon-180.png", "./fault-icon-192.png", "./fault-icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // ใช้ไฟล์ในเครื่องก่อน (เปิดได้แม้ไม่มีเน็ต) แล้วค่อยอัปเดตจากเซิร์ฟเวอร์เบื้องหลัง
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
