/* ข้อมูลสด (25 พ.ย. 2569 ผู้ใช้: "คนหนึ่งลงตารางงาน อีกคนเห็นเปลี่ยนตาม · ดู Report อยู่ พนักงานลงเวลา เวลาต้องขึ้นเองไม่ต้องรีเฟรช" · เลือก WebSocket)
 * ต่อ wss://<api>/live → ส่ง {a: token} → ได้ {t:[หมวด]} ทุกครั้งที่หลังบ้านบันทึก (ไม่มีข้อมูลจริง) → เรียก HRLive.onChange(หมวด)
 * สายหลุด/ต่อไม่ได้ = ถาม GET /live/ver ทุก 15 วินาที (เฉพาะตอนเปิดหน้าอยู่) แล้วต่อใหม่แบบเว้นช่วง · ต่อติดใหม่ = ถามเลขรุ่นครั้งเดียว (เก็บสิ่งที่พลาดตอนหลุด)
 * ใช้เฉพาะเมื่อ API เป็นหลังบ้าน Cloudflare (https) · โหมดสำรอง / ตัวจำลองในเครื่อง = ไม่ทำงาน */
(function () {
  var L = window.HRLive = { st: 'off', ver: null, fails: 0, vfails: 0, onChange: null, tok: null };
  var ws = null, retry = 0, pingT = 0, pollT = 0, verBusy = 0;
  var base = function () { var a = String((window.HR_CONFIG || {}).api || ''); return /^https:\/\/[^/]+\.workers\.dev\/?$/.test(a) ? a.replace(/\/+$/, '') : ''; };
  L.enabled = function () { var c = window.HR_CONFIG || {}; return !!base() && !c.failover && !/[?&]be=gas/.test(location.search) && typeof WebSocket === 'function'; };
  var emit = function (cats) { if (cats && cats.length && typeof L.onChange === 'function') try { L.onChange(cats); } catch (e) {} };
  /* ตัวสำรอง: เทียบเลขรุ่นต่อหมวด · ครั้งแรกจำไว้เฉย ๆ */
  L.checkVer = function () {
    if (verBusy || !L.enabled() || document.hidden) return; verBusy = 1;
    fetch(base() + '/live/ver', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      verBusy = 0; if (!j || !j.ok) return; L.vfails = 0; var v = j.v || {}, o = L.ver, ch = [];
      if (o) Object.keys(v).forEach(function (k) { if (o[k] !== v[k]) ch.push(k); });
      L.ver = v; emit(ch);
    }).catch(function () { verBusy = 0; L.vfails++; });
  };
  var poll = function (on) { clearInterval(pollT); pollT = 0; if (on) pollT = setInterval(function () { if (L.st !== 'live') L.checkVer(); }, 15000); };
  var later = function () { clearTimeout(L._rt); var ms = Math.min(30000, 2000 * Math.pow(2, Math.min(retry++, 4))); L._rt = setTimeout(L.connect, ms); };
  L.connect = function () {
    if (!L.enabled() || !L.tok || document.hidden) return;
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
    try { ws = new WebSocket(base().replace(/^https:/, 'wss:') + '/live'); } catch (e) { L.st = 'off'; poll(1); later(); return; }
    L.st = 'connecting';
    ws.onopen = function () { try { ws.send(JSON.stringify({ a: L.tok })); } catch (e) {} };
    ws.onmessage = function (e) {
      if (e.data === 'pong') return; var m = null; try { m = JSON.parse(e.data); } catch (x) { return; }
      if (m.ok) { L.st = 'live'; retry = 0; L.fails = 0; L.checkVer(); clearInterval(pingT); pingT = setInterval(function () { try { if (ws && ws.readyState === 1) ws.send('ping'); } catch (x) {} }, 25000); return; }
      if (m.err === 'auth') { L.st = 'denied'; return; }   // token หมด → ไม่ต่อซ้ำ (เข้าสู่ระบบใหม่แล้วค่อยเริ่มใหม่ผ่าน L.start)
      if (m.t) emit(m.t);
    };
    ws.onclose = function () { clearInterval(pingT); var was = L.st; ws = null; if (was === 'denied') { poll(1); return; } L.st = 'off'; L.fails++; poll(1); later(); };
    ws.onerror = function () {};
  };
  /* เริ่ม/เปลี่ยนผู้ใช้ (หลังเข้าสู่ระบบ) · หยุด (ออกจากระบบ) */
  L.start = function (tok) { if (!L.enabled() || !tok) return; if (L.tok !== tok) { L.stop(); L.tok = tok; } retry = 0; poll(1); L.checkVer(); L.connect(); };
  L.stop = function () { L.tok = null; clearTimeout(L._rt); clearInterval(pingT); poll(0); var w = ws; ws = null; L.st = 'off'; if (w) try { w.onclose = null; w.close(1000); } catch (e) {} };
  document.addEventListener('visibilitychange', function () { if (document.hidden || !L.tok) return; if (L.st !== 'live') { retry = 0; L.connect(); } L.checkVer(); });
  window.addEventListener('online', function () { if (L.tok && L.st !== 'live') { retry = 0; L.connect(); } });
})();
