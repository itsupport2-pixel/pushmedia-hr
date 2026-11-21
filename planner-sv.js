/* planner-sv.js — เคส Service ขั้น 2 · ผูกงานในตารางงานกับเคส Codex (21 พ.ย. 2569 · ผู้ใช้อนุมัติ Figma หน้า 59)
 * ไม่แก้โค้ดเดิมใน planner.html: ต่อท้ายฟังก์ชันเดิมจากภายนอก (openCreate / openEdit / renderPlannerList / apiPost)
 * - ทาง A: หน้าเคส Service (admin-svc.js) เรียก svOpenFromCase(เคส) → เปิดฟอร์มสร้างงานเดิม + เลือกเคสให้
 * - ทาง B: ฟอร์มสร้าง/แก้งานเดิม เมื่อทีมชื่อมีคำว่า Service → มีช่อง "เลขเคส Service" (ไม่บังคับ)
 * - บันทึกงานสำเร็จ (createTask/updateTask เดิม) แล้วค่อยเรียก wtm svLink · ผูกไม่สำเร็จ = งานยังอยู่ แจ้งเตือนให้ผูกใหม่
 * - แถวงานในตารางงาน (มุมมองรายการ): งานที่ผูกเคส = ชิป SV-… + "รับเคส: ชื่อ" · งานไม่ผูก = ไม่แสดงอะไร (ผู้ใช้สั่ง)
 * ทั้งหมดทำงานเมื่อหลังบ้านตอบ svLinks.on = true (สวิตช์ sv_sched) · ปิดอยู่ = ไม่มีอะไรเปลี่ยน */
(function () {
  'use strict';
  var SV = { on: false, edit: false, links: {}, at: 0, form: null, busy: false };
  var TEAM_RE = /service/i;
  window.__SV = SV;
  function h(s) { return typeof escapeHtml === 'function' ? escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function stl(s) { s = String(s || '').replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  function today() { return new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); }
  var TM = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  function fdt(s) { var t = Date.parse(String(s || '').replace(' ', 'T')); if (isNaN(t)) return String(s || ''); var d = new Date(t + 7 * 3600e3); if (!/[zZ]|[+-]\d\d:?\d\d$/.test(String(s))) d = new Date(t); return d.getUTCDate() + ' ' + TM[d.getUTCMonth()] + ' ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); }

  var st = document.createElement('style');
  st.textContent = '.sv-box{background:#F5F8FF;border:1px solid #BFD3FB;border-radius:12px;padding:12px 14px;margin-bottom:12px;position:relative}' +
    '.sv-lb{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#1D4ED8;margin-bottom:6px}.sv-lb span{font-weight:500;color:var(--ink-3,#64748B)}' +
    '.sv-sel{display:flex;align-items:center;gap:10px;min-height:42px;padding:6px 8px 6px 12px;border:1px solid #BFD3FB;border-radius:10px;background:#fff}' +
    '.sv-id{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;font-weight:700;color:#1D4ED8;white-space:nowrap}.sv-sj{flex:1;min-width:0;font-size:13px;color:var(--ink,#0F172A);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.sv-st{font-size:10.5px;font-weight:600;color:#475569;background:#F1F5F9;border-radius:99px;padding:1px 8px;white-space:nowrap}' +
    '.sv-x{border:0;background:none;color:#64748B;cursor:pointer;font-size:16px;line-height:1;padding:4px 6px;border-radius:6px}.sv-x:hover{background:#EEF2FF;color:#1D4ED8}' +
    '.sv-rc{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;font-size:12px;color:#64748B}.sv-rc b{display:inline-flex;align-items:center;background:#fff;border:1px solid #E2E8F0;border-radius:99px;padding:2px 10px;font-weight:600;color:#334155}' +
    '.sv-res{display:none;position:absolute;left:14px;right:14px;top:calc(100% - 8px);z-index:30;background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:4px;box-shadow:0 10px 24px rgba(15,23,42,.10);max-height:320px;overflow:auto}' +
    '.sv-it{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer}.sv-it:hover,.sv-it.on{background:#EAF1FE}.sv-it .sv-id{min-width:118px}.sv-it small{display:block;font-size:11.5px;color:#64748B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.sv-em{padding:10px;font-size:12.5px;color:#64748B}' +
    '.sv-badge{display:inline-flex;align-items:center;margin-left:10px;padding:3px 10px;border-radius:99px;background:#EAF1FE;color:#1D4ED8;font-size:12px;font-weight:600;vertical-align:middle}' +
    '.sv-chip{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:#1D4ED8;background:#EAF1FE;border:1px solid #BFD3FB;border-radius:5px;padding:0 6px;flex-shrink:0;white-space:nowrap;cursor:pointer}' +
    '.sv-chip:hover{background:#DCE8FD}.sv-rcv{font-size:10px;font-weight:600;color:#334155;background:#F1F5F9;border-radius:5px;padding:0 6px;flex-shrink:0;white-space:nowrap}';
  document.head.appendChild(st);
  var LINK = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';

  /* ── ข้อมูลงาน → เคส ── */
  var _ap = window.apiPost;
  function loadLinks(cb) {
    if (typeof _ap !== 'function' || !(typeof CONFIG !== 'undefined' && CONFIG.GAS_URL)) return;
    SV.cbs = SV.cbs || []; if (cb) SV.cbs.push(cb);
    if (SV.busy) return;   // กำลังโหลดอยู่: เรียกต่อเมื่อผลมาถึง
    SV.busy = true;
    var done = function () { var L = SV.cbs || []; SV.cbs = []; if (SV.on) L.forEach(function (f) { try { f(); } catch (e) {} }); };
    _ap('svLinks', {}).then(function (r) { SV.busy = false; SV.at = Date.now(); if (!r || !r.on) { SV.on = false; SV.cbs = []; if (cb && typeof toast === 'function') toast('ยังไม่เปิดใช้การลงตารางงานจากเคส', 'er'); return; } SV.on = true; SV.edit = !!r.edit; SV.links = r.links || {}; chips(); done(); })
      .catch(function () { SV.busy = false; SV.at = Date.now(); SV.cbs = []; });
  }
  window.svReloadLinks = function (cb) { SV.at = 0; loadLinks(cb); };

  /* บันทึกงานด้วยคำสั่งเดิมสำเร็จ → ผูกเคส (ไม่แตะข้อมูลที่ส่งให้ createTask/updateTask) */
  if (typeof _ap === 'function') {
    window.apiPost = async function (action, data) {
      var res = await _ap.apply(this, arguments);
      try {
        var f = SV.form;
        if (SV.on && f && (action === 'createTask' || action === 'updateTask') && action === f.act && res && res.ok !== false && !res.error) {
          var tid = action === 'createTask' ? res.id : (data && data.id);
          if (action === 'createTask' || Number(tid) === Number(f.tid)) {
            SV.form = null;
            if (tid && f.cid !== f.orig) {
              var r2 = await _ap('svLink', { taskId: tid, caseId: f.cid });
              if (r2 && r2.ok !== false && !r2.error) { if (f.cid) SV.links[String(tid)] = { c: f.cid, r: f.rc || '' }; else delete SV.links[String(tid)]; svParentRefresh(); }
              else if (typeof toast === 'function') toast('บันทึกงานแล้ว แต่ผูกเคสไม่สำเร็จ: ' + ((r2 && r2.error) || 'ลองแก้งานแล้วเลือกเคสอีกครั้ง'), 'er');
            }
          }
        }
      } catch (e) {}
      return res;
    };
  }
  function svParentRefresh() { try { var P = window.parent; if (P && P !== window && P.A && P.A.view === 'svc' && typeof P.svcLoad === 'function') P.svcLoad(); } catch (e) {} }

  /* ── ช่องเลขเคสในฟอร์ม ── */
  function boxHtml(p) {
    return '<div class="sv-box" id="' + p + '-sv-box" style="display:none"><div class="sv-lb">เลขเคส Service <span>— ไม่บังคับ · ผูกแล้วงานนี้จะขึ้นในหน้าเคส</span></div>' +
      '<div id="' + p + '-sv-pick"><input type="text" class="fc" id="' + p + '-sv-q" placeholder="ค้นเลขเคส ลูกค้า เรื่อง สถานที่…" autocomplete="off"></div><div class="sv-res" id="' + p + '-sv-res"></div>' +
      '<div id="' + p + '-sv-sel" style="display:none"></div></div>';
  }
  function selHtml(p, c, lock) {
    return '<div class="sv-sel"><span class="sv-id">' + h(c.id) + '</span><span class="sv-sj">' + h([c.s, c.cu].filter(Boolean).join(' · ') || '—') + '</span>' + (c.st ? '<span class="sv-st">' + h(stl(c.st)) + '</span>' : '') +
      (lock ? '' : '<button type="button" class="sv-x" id="' + p + '-sv-clr" title="เอาเคสออก" aria-label="เอาเคสออก">✕</button>') + '</div>' +
      '<div class="sv-rc">ผู้รับเคส (Codex) ' + (c.rc ? String(c.rc).split(/\s*,\s*/).map(function (n) { return '<b>' + h(n) + '</b>'; }).join('') : '<span>—</span>') + '<span>· แสดงอย่างเดียว · คนไปหน้างานเลือกในช่องผู้เข้างานเหมือนเดิม</span></div>';
  }
  function teamOf(p) { var el = document.getElementById(p === 'f' ? 'f-tm' : 'ef-tm-x'); return el ? el.value : (SV.efTeam || ''); }
  function toggle(p) { var b = document.getElementById(p + '-sv-box'); if (!b) return; var show = TEAM_RE.test(teamOf(p) || '') || !!(SV.form && SV.form.cid); b.style.display = show ? '' : 'none'; }
  function setSel(p, c, lock) {
    var pick = document.getElementById(p + '-sv-pick'), sel = document.getElementById(p + '-sv-sel'), res = document.getElementById(p + '-sv-res');
    if (res) res.style.display = 'none';
    if (!c) { if (sel) { sel.style.display = 'none'; sel.innerHTML = ''; } if (pick) pick.style.display = ''; return; }
    if (sel) { sel.innerHTML = selHtml(p, c, lock); sel.style.display = ''; } if (pick) pick.style.display = 'none';
    var x = document.getElementById(p + '-sv-clr'); if (x) x.onclick = function () { if (SV.form) { SV.form.cid = ''; SV.form.rc = ''; } setSel(p, null); var q = document.getElementById(p + '-sv-q'); if (q) { q.value = ''; q.focus(); } };
  }
  function fillFrom(c, note) {
    var q = function (id) { return document.getElementById(id); };
    var no = q('f-nopm'), pm = typeof pmPickValue === 'function' ? pmPickValue('f') : null;
    if (no && !no.checked && !pm) { no._ok = true; no.checked = true; try { crNoPmToggle(); } catch (e) {} no._ok = false; }   // งาน Service ไม่มีเลข PM (เหมือนกดยืนยันในหน้าเดิม)
    var tt = q('f-tit'); if (tt && !tt.value.trim()) { tt.value = (c.id + ' - ' + (c.s || '')).trim(); }
    var si = q('f-sit'); if (si && !si.value.trim()) si.value = [c.loc, c.cu ? '(' + c.cu + ')' : ''].filter(Boolean).join(' ');
    var nt = q('f-not'); if (note && nt && !nt.value.trim()) nt.value = 'จากเคส ' + c.id + ' ใน Codex Assist' + (c.s ? '\nปัญหา: ' + c.s : '') + (c.at ? ' · ลูกค้าแจ้ง ' + fdt(c.at) : '');
  }
  function bind(p, act, tid, orig) {
    var q = document.getElementById(p + '-sv-q'), res = document.getElementById(p + '-sv-res'); if (!q || !res) return;
    var tmr = 0, seq = 0, rows = [];
    var draw = function () {
      res.innerHTML = rows.length ? rows.map(function (c, i) { return '<div class="sv-it" data-i="' + i + '"><span class="sv-id">' + h(c.id) + '</span><span style="flex:1;min-width:0"><span style="font-size:13px;font-weight:600">' + h(c.s || '—') + '</span><small>' + h([c.cu, c.loc, c.rc ? 'รับเคส: ' + c.rc : ''].filter(Boolean).join(' · ')) + '</small></span>' + (c.ln ? '<span class="sv-st">ลงแล้ว ' + c.ln + ' งาน</span>' : '') + '<span class="sv-st">' + h(stl(c.st)) + '</span></div>'; }).join('')
        : '<div class="sv-em">ไม่พบเคสที่ยังไม่ปิด</div>';
      res.style.display = 'block';
      [].forEach.call(res.querySelectorAll('[data-i]'), function (el) { el.onmousedown = function (e) { e.preventDefault(); var c = rows[+el.dataset.i]; SV.form = { act: act, tid: tid, orig: orig || '', cid: c.id, rc: c.rc || '' }; setSel(p, c); if (p === 'f') fillFrom(c, false); }; });
    };
    var search = function () { var my = ++seq; _ap('svPick', { q: q.value.trim() }).then(function (r) { if (my !== seq) return; rows = (r && r.rows) || []; draw(); }).catch(function () {}); };
    q.oninput = function () { clearTimeout(tmr); tmr = setTimeout(search, 250); };
    q.onfocus = search;
    q.onblur = function () { setTimeout(function () { res.style.display = 'none'; }, 150); };
  }

  /* ทาง B (สร้างงาน) + ทาง A ใช้ฟอร์มเดียวกัน */
  var _oc = window.openCreate;
  if (typeof _oc === 'function') {
    window.openCreate = function () {
      SV.form = null;
      var r = _oc.apply(this, arguments);
      try {
        if (SV.on && SV.edit) {
          var box = document.getElementById('f-pm-box');
          if (box && !document.getElementById('f-sv-box')) {
            box.insertAdjacentHTML('afterend', boxHtml('f')); bind('f', 'createTask', 0, '');
            ['f-tm', 'f-dep'].forEach(function (id) { var el = document.getElementById(id); if (el) el.addEventListener('change', function () { setTimeout(function () { toggle('f'); }, 0); }); });
            toggle('f'); setTimeout(function () { toggle('f'); }, 60); setTimeout(function () { toggle('f'); }, 400);   // ทีมในฟอร์มเดิมถูกตั้งหลังวาดเสร็จ
          }
        }
      } catch (e) {}
      return r;
    };
  }
  /* แก้งานเดิม → ผูก/เปลี่ยน/เอาเคสออกทีหลังได้ */
  var _oe = window.openEdit;
  if (typeof _oe === 'function') {
    window.openEdit = function (id) {
      SV.form = null;
      var r = _oe.apply(this, arguments);
      try {
        var t = ((typeof DB !== 'undefined' && DB.tasks) || []).find(function (x) { return x.id === id; }), L = SV.links[String(id)];
        if (SV.on && SV.edit && t && (TEAM_RE.test(t.teamName || '') || L)) {
          var sit = document.getElementById('ef-sit'), fg = sit && sit.closest('.fg');
          if (fg && !document.getElementById('ef-sv-box')) {
            fg.insertAdjacentHTML('beforebegin', boxHtml('ef')); SV.efTeam = t.teamName || '';
            var orig = L ? L.c : '';
            SV.form = { act: 'updateTask', tid: id, orig: orig, cid: orig, rc: L ? L.r : '' };
            bind('ef', 'updateTask', id, orig);
            document.getElementById('ef-sv-box').style.display = '';
            if (L) setSel('ef', { id: L.c, rc: L.r });
          }
        }
      } catch (e) {}
      return r;
    };
  }

  /* ทาง A: เรียกจากหน้าเคส Service (admin-svc.js) */
  window.svReady = function () { try { return typeof DB !== 'undefined' && !!DB.teams && DB.teams.length > 0 && !!document.querySelector('.rp-view-btn'); } catch (e) { return false; } };
  window.svOpenFromCase = function (c) {
    if (!c || !c.id) return false;
    var go2 = function () {
      var T = (typeof DB !== 'undefined' && DB.teams) || [], tm = T.find(function (t) { return /^service$/i.test(t.name || '') && /digital signage/i.test(t.deptName || ''); }) || T.find(function (t) { return TEAM_RE.test(t.name || ''); });
      window.openCreate(tm ? tm.name : null, today(), tm ? tm.deptName : null);
      if (!document.getElementById('f-sv-box')) return;
      SV.form = { act: 'createTask', tid: 0, orig: '', cid: c.id, rc: c.rc || '' };
      document.getElementById('f-sv-box').style.display = '';
      setSel('f', c); fillFrom(c, true);
      var h3 = document.querySelector('#modal-ov .mh h3'); if (h3 && !h3.querySelector('.sv-badge')) h3.insertAdjacentHTML('beforeend', '<span class="sv-badge">จากเคส ' + h(c.id) + '</span>');
    };
    if (SV.on) { go2(); return true; }
    loadLinks(go2); return true;
  };

  /* ── ชิปในแถวงาน (มุมมองรายการ) ── */
  function chips() {
    if (!SV.on) return;
    [].forEach.call(document.querySelectorAll('td[onclick^="openDetail("]'), function (td) {
      if (td.querySelector('.sv-chip')) return;
      var m = /^openDetail\((\d+)/.exec(td.getAttribute('onclick') || ''), L = m && SV.links[m[1]]; if (!L) return;
      var line = td.querySelector('div[style*="margin-top:3px"]'); if (!line) return;
      line.insertAdjacentHTML('afterbegin', '<span class="sv-chip" data-svc="' + h(L.c) + '" title="เปิดรายละเอียดเคส">' + LINK + h(L.c) + '</span>' + (L.r ? '<span class="sv-rcv">รับเคส: ' + h(L.r) + '</span>' : ''));
    });
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('.sv-chip'); if (!c) return;
    e.stopPropagation(); e.preventDefault();
    try { var P = window.parent; if (P && P !== window && typeof P.svcOpen === 'function') P.svcOpen(c.dataset.svc); else if (typeof toast === 'function') toast('เคส ' + c.dataset.svc); } catch (x) {}
  }, true);
  var _rl = window.renderPlannerList;
  if (typeof _rl === 'function') {
    window.renderPlannerList = function () { var r = _rl.apply(this, arguments); try { chips(); if (Date.now() - SV.at > 60000) loadLinks(); } catch (e) {} return r; };
  }
  setTimeout(loadLinks, 1200);
})();
