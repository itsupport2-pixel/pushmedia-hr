/* ใช้ร่วมทุกหน้า (7 พ.ย. 2569): แทนสคริปต์/ตัวจัดการเหตุการณ์แบบฝังในหน้า เพื่อให้ CSP ปิด inline script ได้
 * - data-build บนแท็กนี้ = เลข build จาก tools/stamp-web.sh · มีเวอร์ชันใหม่ → แถบให้กดโหลดใหม่ (เดิมอยู่ท้าย admin.html / liff.html)
 * - [data-reload] กดแล้วโหลดหน้าใหม่ · img[data-rmerr] โหลดไม่ได้ = เอารูปออก หรือแทนด้วยตัวย่อใน data-fbtxt */
(function () {
  var me = document.currentScript, B = me && me.getAttribute('data-build') || '';
  document.addEventListener('click', function (e) { var t = e.target && e.target.closest && e.target.closest('[data-reload]'); if (t) location.reload(); });
  document.addEventListener('error', function (e) {
    var t = e.target; if (!t || t.tagName !== 'IMG' || !t.hasAttribute('data-rmerr')) return;
    if (t.hasAttribute('data-fbtxt')) { var s = document.createElement('span'); s.textContent = t.getAttribute('data-fbtxt'); t.replaceWith(s); } else t.remove();
  }, true);
  if (!/^\d{12}$/.test(B)) return;
  var shown = 0;
  function chk() {
    if (shown || document.hidden) return;
    fetch('build.txt?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      t = String(t || '').trim(); if (!/^\d{12}$/.test(t) || t <= B) return; shown = 1;
      var d = document.createElement('div'); d.setAttribute('role', 'status');
      d.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:99999;background:#141414;color:#fff;border-radius:999px;padding:8px 8px 8px 18px;display:flex;gap:12px;align-items:center;font:14px "IBM Plex Sans Thai",sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25)';
      d.innerHTML = '<span>มีเวอร์ชันใหม่ของระบบ</span><button type="button" style="border:0;border-radius:999px;background:#fff;color:#141414;padding:6px 14px;font:inherit;font-weight:600;cursor:pointer">โหลดใหม่</button>';
      d.querySelector('button').onclick = function () { location.reload(); }; document.body.appendChild(d);
    }).catch(function () {});
  }
  setTimeout(chk, 15000); setInterval(chk, 300000); document.addEventListener('visibilitychange', chk);
})();
