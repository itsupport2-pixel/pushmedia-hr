/* ตัวเลือกวันที่ของระบบ (9 พ.ย. 2569 ผู้ใช้ขอ: "ภาษาไทย = พ.ศ. ทั้งระบบ · ภาษาอังกฤษ = ค.ศ. ทั้งระบบ")
 * ช่องวันที่ของเบราว์เซอร์ (input type=date / month) แสดงปี ค.ศ. ตามเครื่องเสมอ → แทนด้วยตัวเลือกนี้ทุกช่องอัตโนมัติ
 * - ช่องเดิมยังเป็นช่องเดิม: .value อ่าน/ตั้งเป็น YYYY-MM-DD (month = YYYY-MM) เหมือนเดิม · .type ยังตอบ 'date' · เปลี่ยนค่าแล้วยิง input + change
 *   → โค้ดหน้าเว็บเดิมไม่ต้องแก้ · ค่าที่ส่งเข้าระบบเหมือนเดิมทุกอย่าง
 * - แสดงผล: ไทย 14/07/2570 · อังกฤษ 14/07/2027 · ภาษาอ่านจาก hrLang() (หลังบ้าน) · ไม่มี = ไทย (แอป LINE / ตารางงาน)
 * - เคารพ min / max / disabled / required · ปุ่มวันนี้ / ล้าง · เลือกปีและเดือนจากรายการได้ (วันเกิด) */
(function () {
  if (window.__dp) return; window.__dp = 1;
  var st = document.createElement('style'); st.textContent = '.xdp-in{cursor:pointer;caret-color:transparent}.f input.xdp-in[readonly]{background:inherit;color:inherit}input.xdp-in{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'1.8\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'3\' y=\'5\' width=\'18\' height=\'16\' rx=\'2\'/%3E%3Cpath d=\'M16 3v4M8 3v4M3 10h18\'/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 10px center!important;background-size:16px!important;padding-right:34px!important}input.xdp-in.xdp-on{border-color:#141414!important;outline:none}input.xdp-in:disabled{cursor:not-allowed;opacity:.6}.xdp-pop{position:fixed;z-index:2147483000;width:320px;box-sizing:border-box;background:#fff;border:1px solid #E5E7EB;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.06);padding:12px;font:inherit;font-size:14px;color:#141414;animation:xdpIn .14s ease-out}@keyframes xdpIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}.xdp-pop.xdp-sheet{left:0!important;right:0;bottom:0;top:auto!important;width:auto;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));animation:xdpUp .18s ease-out}@keyframes xdpUp{from{transform:translateY(100%)}to{transform:none}}.xdp-h{display:flex;align-items:center;gap:6px;margin-bottom:8px}.xdp-h .xdp-sy{flex:0 0 116px}.xdp-h select{flex:1;min-width:0;height:34px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;font:inherit;font-size:14px;font-weight:600;color:#141414;padding:0 6px;cursor:pointer}.xdp-nv{flex:none;width:34px;height:34px;border:1px solid #E5E7EB;border-radius:8px;background:#fff;color:#141414;display:grid;place-items:center;cursor:pointer;padding:0}.xdp-nv:hover{background:#F3F4F6}.xdp-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}.xdp-w{text-align:center;font-size:12px;color:#6B7280;padding:4px 0}.xdp-mg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.xdp-mg .xdp-d{height:40px}.xdp-d{height:36px;border:0;border-radius:8px;background:none;font:inherit;font-size:14px;color:#141414;cursor:pointer;padding:0}.xdp-d:hover:not(:disabled){background:#F3F4F6}.xdp-d.now{box-shadow:inset 0 0 0 1.5px #141414}.xdp-d.sel{background:#141414!important;color:#fff;font-weight:700}.xdp-d:disabled{color:#C4C7CC;cursor:not-allowed}.xdp-sheet .xdp-d{height:44px;font-size:15px}.xdp-f{display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #F0F0F0}.xdp-l{border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:#141414;padding:6px 8px;border-radius:8px;cursor:pointer}.xdp-l:hover:not(:disabled){background:#F3F4F6}.xdp-l:disabled{color:#C4C7CC}'; (document.head || document.documentElement).appendChild(st);
  var P = HTMLInputElement.prototype, VAL = Object.getOwnPropertyDescriptor(P, 'value'), TYPE = Object.getOwnPropertyDescriptor(P, 'type');
  var MTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
    MTS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    MEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    MES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    WTH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], WEN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var en = function () { try { return window.hrLang && window.hrLang() === 'en'; } catch (e) { return false; } };
  var yr = function (y) { return en() ? y : y + 543; };
  var P2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var isoOk = function (s, m) { return m ? /^\d{4}-(0[1-9]|1[0-2])$/.test(s) : /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s; };
  var todayIso = function () { var d = new Date(); return d.getFullYear() + '-' + P2(d.getMonth() + 1) + '-' + P2(d.getDate()); };
  function show(el) {
    var v = el.__dpv || '', m = el.__dpm;
    if (!v) return '';
    if (m) return (en() ? MES : MTS)[+v.slice(5, 7) - 1] + ' ' + yr(+v.slice(0, 4));
    return v.slice(8, 10) + '/' + v.slice(5, 7) + '/' + yr(+v.slice(0, 4));
  }
  function paint(el) { VAL.set.call(el, show(el)); el.setAttribute('data-xdpv', el.__dpv || ''); }
  function setIso(el, v, fire) {
    v = String(v == null ? '' : v); if (v && !isoOk(v, el.__dpm)) v = '';
    var old = el.__dpv; el.__dpv = v; paint(el);
    if (fire && old !== v) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function up(el) {
    if (el.__dp) return; var t = (el.getAttribute('type') || '').toLowerCase(); if (t !== 'date' && t !== 'month') return;
    var v0 = VAL.get.call(el); el.__dp = 1; el.__dpm = t === 'month';
    TYPE.set.call(el, 'text');
    Object.defineProperty(el, 'value', { configurable: true, get: function () { return this.__dpv || ''; }, set: function (v) { setIso(this, v, false); } });
    Object.defineProperty(el, 'type', { configurable: true, get: function () { return this.__dpm ? 'month' : 'date'; }, set: function () {} });
    el.readOnly = true; el.setAttribute('inputmode', 'none'); el.setAttribute('autocomplete', 'off'); el.setAttribute('data-xdp', el.__dpm ? 'month' : 'date'); el.classList.add('xdp-in');
    if (!el.placeholder) el.placeholder = el.__dpm ? (en() ? 'Select month' : 'เลือกเดือน') : (en() ? 'dd/mm/yyyy' : 'วว/ดด/ปปปป');
    setIso(el, v0, false);
  }
  function scan(root) { if (root.nodeType !== 1) return; if (root.tagName === 'INPUT') up(root); else root.querySelectorAll && root.querySelectorAll('input[type=date],input[type=month]').forEach(up); }
  new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'attributes') up(m.target); else m.addedNodes.forEach(scan); }); })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['type'] });
  // ใส่ value ก่อนช่องถูกแปลง (ช่วงสั้น ๆ ระหว่างวาดหน้า): อ่านค่าจากช่องเดิมตอนแปลง · โค้ดที่อ่านค่าทันทีหลังวาดได้ค่าเดิม (ช่อง date ของเบราว์เซอร์)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(document.body); }); else scan(document.body);

  /* ── หน้าต่างเลือก ── */
  var pop = null, cur = null, view = null;
  function close() { if (pop) { pop.remove(); pop = null; } if (cur) { cur.classList.remove('xdp-on'); cur = null; } document.removeEventListener('keydown', key, true); }
  function key(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function lim(el) { return { min: el.getAttribute('min') || '', max: el.getAttribute('max') || '' }; }
  function okDay(el, iso) { var L = lim(el), k = el.__dpm ? iso.slice(0, 7) : iso; return (!L.min || k >= L.min.slice(0, k.length)) && (!L.max || k <= L.max.slice(0, k.length)); }
  function years(el) {
    var L = lim(el), now = new Date().getFullYear(), a = L.min ? +L.min.slice(0, 4) : now - 100, b = L.max ? +L.max.slice(0, 4) : now + 15;
    if (view.y < a) a = view.y; if (view.y > b) b = view.y; var out = []; for (var y = b; y >= a; y--) out.push(y); return out;
  }
  function draw() {
    var el = cur, E = en(), M = E ? MEN : MTH, h = '';
    h += '<div class="xdp-h"><button type="button" class="xdp-nv" data-xdpn="-1" aria-label="' + (E ? 'Previous' : 'ก่อนหน้า') + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>';
    if (!el.__dpm) h += '<select class="xdp-sm" aria-label="' + (E ? 'Month' : 'เดือน') + '">' + M.map(function (n, i) { return '<option value="' + i + '"' + (i === view.m ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>';
    h += '<select class="xdp-sy" aria-label="' + (E ? 'Year' : 'ปี') + '">' + years(el).map(function (y) { return '<option value="' + y + '"' + (y === view.y ? ' selected' : '') + '>' + (E ? y : 'พ.ศ. ' + (y + 543)) + '</option>'; }).join('') + '</select>';
    h += '<button type="button" class="xdp-nv" data-xdpn="1" aria-label="' + (E ? 'Next' : 'ถัดไป') + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button></div>';
    var sel = el.__dpv, t = todayIso();
    if (el.__dpm) {
      h += '<div class="xdp-mg">' + (E ? MES : MTS).map(function (n, i) { var k = view.y + '-' + P2(i + 1), dis = !okDay(el, k + '-01'); return '<button type="button" class="xdp-d' + (sel === k ? ' sel' : '') + (t.slice(0, 7) === k ? ' now' : '') + '" data-xdpd="' + k + '"' + (dis ? ' disabled' : '') + '>' + n + '</button>'; }).join('') + '</div>';
    } else {
      h += '<div class="xdp-g">' + (E ? WEN : WTH).map(function (w) { return '<span class="xdp-w">' + w + '</span>'; }).join('');
      var first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay(), n = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
      for (var i = 0; i < first; i++) h += '<span></span>';
      for (var d = 1; d <= n; d++) { var k = view.y + '-' + P2(view.m + 1) + '-' + P2(d), dis = !okDay(el, k); h += '<button type="button" class="xdp-d' + (sel === k ? ' sel' : '') + (t === k ? ' now' : '') + '" data-xdpd="' + k + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>'; }
      h += '</div>';
    }
    var tk = el.__dpm ? t.slice(0, 7) : t;
    h += '<div class="xdp-f">' + (el.required ? '<span></span>' : '<button type="button" class="xdp-l" data-xdpc>' + (E ? 'Clear' : 'ล้าง') + '</button>') + '<button type="button" class="xdp-l" data-xdpd="' + tk + '"' + (okDay(el, el.__dpm ? tk + '-01' : tk) ? '' : ' disabled') + '>' + (E ? (el.__dpm ? 'This month' : 'Today') : (el.__dpm ? 'เดือนนี้' : 'วันนี้')) + '</button></div>';
    pop.innerHTML = h;
    pop.querySelectorAll('[data-xdpn]').forEach(function (b) { b.onclick = function () { var s = +b.getAttribute('data-xdpn'); if (el.__dpm) view.y += s; else { view.m += s; if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; } } draw(); }; });
    var sm = pop.querySelector('.xdp-sm'), sy = pop.querySelector('.xdp-sy');
    if (sm) sm.onchange = function () { view.m = +sm.value; draw(); };
    sy.onchange = function () { view.y = +sy.value; draw(); };
    pop.querySelectorAll('[data-xdpd]').forEach(function (b) { b.onclick = function () { var x = cur; setIso(x, b.getAttribute('data-xdpd'), true); close(); x.focus(); }; });
    var c = pop.querySelector('[data-xdpc]'); if (c) c.onclick = function () { var x = cur; setIso(x, '', true); close(); x.focus(); };
  }
  function place() {
    if (!pop || !cur) return; var r = cur.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight, pw = pop.offsetWidth, ph = pop.offsetHeight;
    pop.classList.toggle('xdp-sheet', W < 560); if (W < 560) { pop.style.left = ''; pop.style.top = ''; return; }
    pw = pop.offsetWidth; ph = pop.offsetHeight;
    var x = Math.min(Math.max(8, r.left), W - pw - 8), y = r.bottom + 6; if (y + ph > H - 8 && r.top - ph - 6 > 8) y = r.top - ph - 6;
    pop.style.left = x + 'px'; pop.style.top = Math.max(8, y) + 'px';
  }
  function open(el) {
    if (el.disabled) return; close(); cur = el; el.classList.add('xdp-on');
    var b = el.__dpv || (el.getAttribute('min') && todayIso() < el.getAttribute('min') ? el.getAttribute('min') : el.getAttribute('max') && todayIso() > el.getAttribute('max') ? el.getAttribute('max') : todayIso());
    view = { y: +b.slice(0, 4), m: +(b.slice(5, 7) || 1) - 1 };
    pop = document.createElement('div'); pop.className = 'xdp-pop'; pop.setAttribute('data-noi18n', ''); pop.setAttribute('role', 'dialog');
    pop.addEventListener('mousedown', function (e) { if (e.target.tagName !== 'SELECT') e.preventDefault(); });
    (el.closest('dialog[open]') || document.body).appendChild(pop); draw(); place();
    document.addEventListener('keydown', key, true);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('input[data-xdp]');
    if (el) { if (cur === el) close(); else open(el); return; }
    if (pop && !pop.contains(e.target)) close();
  }, true);
  document.addEventListener('keydown', function (e) { var el = e.target; if (!el || !el.__dp) return; if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(el); } else if ((e.key === 'Backspace' || e.key === 'Delete') && !el.required) { e.preventDefault(); setIso(el, '', true); } });
  window.addEventListener('resize', place); document.addEventListener('scroll', function (e) { if (pop && !pop.contains(e.target)) place(); }, true);
  // เปลี่ยนภาษา → วาดค่าทุกช่องใหม่ (ปี พ.ศ. ↔ ค.ศ.)
  var sl = window.setLang; if (sl) window.setLang = function () { var r = sl.apply(this, arguments); document.querySelectorAll('input[data-xdp]').forEach(paint); if (pop) draw(); return r; };
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-lang]')) setTimeout(function () { document.querySelectorAll('input[data-xdp]').forEach(paint); }, 0); });
  window.dpUpgrade = scan;
})();
