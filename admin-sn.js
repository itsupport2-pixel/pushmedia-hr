/* ───────── ตารางงานแบบใหม่ (ไม่ใช้ iframe) · 19 พ.ย. 2569 ผู้ใช้เลือก "เขียนใหม่ทั้งหมด" ─────────
 * หน้าตา + ขั้นตอนเหมือนหน้าเดิม (planner.html) · ไม่มีมุมมอง "ตาราง" · ใช้คำสั่งหลังบ้านชุดเดิม wtm(bootstrap · tasks · attendance · leaves …)
 * ช่วง 1: มุมมอง "รายการ" · ช่วง 2: เพิ่ม/แก้/ลบงาน (admin-sn-form.js) · รายชื่อทีม · ตามช่าง · Export · รถ · ตั้งค่า = เปิดหน้าเดิม (snOld)
 * ข้อมูลเก็บในหน่วยความจำ → กดเมนูซ้ำขึ้นทันที แล้วเช็กเลขรุ่นข้อมูล (wtm version) เบื้องหลัง · คลาส CSS ใช้ prefix sn- เท่านั้น */
var SN = { d: null, off: 0, dept: 'all', pm: 'all', att: true, ver: '', att2: {}, busy: 0, old: false, oldTasks: false };
/* ค่าเริ่มต้น (20 พ.ย. 2569 ผู้ใช้): ระบบจริง = หน้าเดิม · dev / เครื่องทดสอบ = หน้าใหม่ · เลือกเองได้ด้วยปุ่ม ลองหน้าใหม่ / หน้าเดิม (sn_on = 1 / 0) */
function snDef() { var a = String(typeof API === 'string' ? API : ''); return /-dev[.\/]|^\/api$/.test(a); }
function snOn() { try { var v = localStorage.getItem('sn_on'); return v === '1' ? true : v === '0' ? false : snDef(); } catch (e) { return snDef(); } }
function snSet(on) { try { localStorage.setItem('sn_on', on ? '1' : '0'); } catch (e) {} SN.old = false; render(); }
function vSched() { if (snOn() && !SN.old && !SN.d && !(window.ss && ss('hr_va'))) snRestore(); return snOn() && !SN.old ? '<div id="sn-root">' + (SN.d ? '' : snSkel()) + '</div>' : (A.d && A.d.me && (isHR() || A.d.me.role === 'admin') ? snTry() : '') + vPlanner(); }
function bSched() { if (snOn() && !SN.old && !SN.d && !(window.ss && ss('hr_va'))) snRestore(); var tb = $('#sn-tryb'); if (tb) tb.onclick = function () { if (snOn()) { SN.old = false; render(); } else snSet(1); }; if (!snOn() || SN.old) return; if (SN.d) { snDraw(); snCheck(); } else snLoad(); }
function snTry() { return '<div class="sn-try"><span>ตารางงานหน้าใหม่ (ทดลอง · เร็วกว่า · ช่วงแรกดูอย่างเดียว)</span><button class="btn sm" id="sn-tryb">' + (snOn() ? 'กลับหน้าใหม่' : 'ลองหน้าใหม่') + '</button></div>'; }
/* เปิดหน้าเดิมเพื่อทำรายการที่หน้าใหม่ยังไม่มี (ช่วง 1) */
function snOld(why) { SN.old = true; render(); if (why) toast(why); }
function snSkel() { var r = ''; for (var i = 0; i < 8; i++) r += '<div class="sn-sk-row"><i></i><i></i><i></i><i></i></div>'; return '<div class="sn-sk"><div class="sn-sk-bar"></div><div class="sn-sk-bar s"></div>' + r + '</div>'; }
function snLoad() {
  if (SN.busy) return; SN.busy = 1;
  aCall('wtm', 'bootstrap', {}).then(function (d) { SN.busy = 0; SN.d = d; SN.att2 = {}; SN.oldTasks = false; snVer(); snDraw(); })
    .catch(function (e) { SN.busy = 0; var r = $('#sn-root'); if (r) r.innerHTML = '<div class="alert">' + esc(e.message) + ' <button class="btn sm" id="sn-retry">ลองใหม่</button></div>'; var rb = $('#sn-retry'); if (rb) rb.onclick = snLoad; });
}
function snVer() { aCall('wtm', 'version', {}).then(function (v) { SN.ver = v && v.version || ''; snSave(); }).catch(function () {}); }
/* 19 พ.ย. 2569 ผู้ใช้: "ยังขึ้นโหลด ไม่ลื่นเหมือนระบบเดียวกัน" → ① จำข้อมูลล่าสุดในเครื่อง (ต่อผู้ใช้) เปิดหลังรีเฟรชขึ้นทันที แล้วเช็กเลขรุ่นเบื้องหลัง
 * ② โหลดเบื้องหลังหลังเข้าระบบ (ก่อนกดเมนู) · ข้อมูลในเครื่องเก็บ 3 วัน · ออกจากระบบ = ลบ (snForget) */
function snKey() { return 'sn_cache_' + (A.d && A.d.me && A.d.me.id || ''); }
function snSave() { if (!SN.d || !SN.ver) return; try { localStorage.setItem(snKey(), JSON.stringify({ v: SN.ver, at: Date.now(), d: SN.d })); } catch (e) { try { localStorage.removeItem(snKey()); } catch (x) {} } }
function snRestore() { if (SN.d) return true; try { var c = JSON.parse(localStorage.getItem(snKey()) || 'null'); if (c && c.d && c.v && Date.now() - c.at < 3 * 864e5) { SN.d = c.d; SN.ver = c.v; SN.att2 = {}; SN.oldTasks = false; return true; } } catch (e) {} return false; }
function snForget() { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('sn_cache_') === 0) localStorage.removeItem(k); }); } catch (e) {} }
(function snPre() { if (!window.A || !A.d || !A.d.me || !A.tok) return setTimeout(snPre, 1500); if (!snOn() || (window.ss && ss('hr_va'))) return;   // ดูในมุมมอง = ไม่จำ
  if (!snRestore()) setTimeout(function () { if (!SN.d) snLoad(); }, 1200); else setTimeout(snCheck, 1500); })();
/* กลับเข้าเมนู: แสดงของเดิมทันที แล้วเช็กว่ามีคนแก้งานไหม → โหลดใหม่เงียบ ๆ */
function snCheck() { aCall('wtm', 'version', {}).then(function (v) { var nv = v && v.version || ''; if (SN.ver && nv && nv !== SN.ver && !SN.busy) { SN.busy = 1; aCall('wtm', 'bootstrap', {}).then(function (d) { SN.busy = 0; SN.d = d; SN.att2 = {}; SN.oldTasks = false; SN.ver = nv; snSave(); if ($('#sn-root')) snDraw(); }).catch(function () { SN.busy = 0; }); } else if (nv) SN.ver = nv; }).catch(function () {}); }

/* ── ตัวช่วย (ตรรกะเดียวกับหน้าเดิม) ── */
function snDs(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function snNorm(s) { s = String(s || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); var d = new Date(s); return isNaN(d) ? '' : snDs(d); }
function snMembersOn(t, ds) { var ov = t && t.dayOverrides && ds ? t.dayOverrides[ds] : null; return ov && Array.isArray(ov.members) ? ov.members.slice() : (t && t.members || []).slice(); }
function snEmp(code) { var L = SN.d.employees; for (var i = 0; i < L.length; i++) if (L[i].code === code) return L[i]; return null; }
function snInTeam(e, dn, tn) { return !!e && !!tn && ((e.dept === dn && e.team === tn) || (e.dept2 === dn && e.team2 === tn)); }
function snHolStrict(ds) { return new Date(ds + 'T00:00:00').getDay() === 0 || SN.d.holidays.some(function (h) { return h.date === ds; }); }
function snMoney(n) { return Number(n).toLocaleString('th-TH') + '฿'; }
function snPhoto(p) { if (!/^hrphoto:/.test(p || '')) return /^https:\/\//.test(p || '') ? p : ''; var a = String(API || ''); return /^https:\/\//.test(a) ? a.replace(/\/+$/, '') + '/photo/' + p.slice(8) : ''; }
function snDates() { var t = new Date(), mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7) + SN.off * 7); var L = []; for (var i = 0; i < 7; i++) { var d = new Date(mon); d.setDate(mon.getDate() + i); L.push(d); } return L; }
/* 27 พ.ย. 2569 ผู้ใช้: ตารางงานในเว็บทุกคนดูได้ทั้งหมด · เพิ่ม/แก้ตามแถว "จัดตารางงาน" (เซิร์ฟเวอร์ส่งมาใน cu.menuPermsRaw = planner:all:<แก้>) */
function snScope() { return 'all'; }
function snEditSc() { var cu = SN.d.cu || {}; if (cu.hr || cu.admin) return 'all'; var m = /planner:[a-z]+:([a-z]+)/.exec(cu.menuPermsRaw || ''); return m ? m[1] : 'none'; }
function snDepts() { var sc = snScope(), cu = SN.d.cu || {}; return SN.d.depts.filter(function (d) { if (sc !== 'all' && d.name !== cu.dept) return false; var st = SN.d.schedTeams[d.name]; return st && st.length; }); }
function snTeamsOf(dn) { var L = SN.d.schedTeams[dn] || [], cu = SN.d.cu || {}; return snScope() === 'team' ? L.filter(function (t) { return t === cu.team; }) : L; }
function snCostGrants(tasks, dss) {   // เบี้ยวันหยุด / ต่างจังหวัด คนละครั้งต่อวัน (เหมือน _rpComputeCostGrants)
  var g = {}, cl = {}, HB = +(SN.d.config.holBonus || 700), PB = +(SN.d.config.provBonus || 300);
  var so = tasks.slice().sort(function (a, b) { return (a.id || 0) - (b.id || 0); });
  dss.forEach(function (ds) { var hol = snHolStrict(ds); so.forEach(function (t) { var ts = snNorm(t.start), te = snNorm(t.end || t.start); if (!ts || ds < ts || ds > te) return; var c = 0;
    snMembersOn(t, ds).forEach(function (code) { if (hol && !cl[code + '::' + ds + '::h']) { cl[code + '::' + ds + '::h'] = 1; c += HB; } if (t.isProvince && !cl[code + '::' + ds + '::p']) { cl[code + '::' + ds + '::p'] = 1; c += PB; } });
    if (c) g[t.id + '::' + ds] = c; }); });
  return g;
}
function snCostFor(t, ds, g) { var c = g[t.id + '::' + ds] || 0; if (ds === snNorm(t.start)) c += (t.dailyWorkers || []).reduce(function (s, w) { return s + (w.wage || 0); }, 0); return c; }
/* ลงเวลา / ลา ของสัปดาห์ที่ดู (เดือนอื่นจากที่ bootstrap ส่งมา = โหลดเพิ่มครั้งเดียวต่อเดือน) */
function snAttFor(from, to) {
  var d = SN.d; if (from >= d._attDateFrom && to <= d._attDateTo) return { att: d.attendance || {}, lv: d.leaves || {} };
  var k = from.slice(0, 7); if (SN.att2[k]) return SN.att2[k];
  SN.att2[k] = { att: {}, lv: {}, loading: 1 }; var f = k + '-01', l = new Date(+k.slice(0, 4), +k.slice(5, 7), 0).getDate(), t = k + '-' + ('0' + l).slice(-2);
  Promise.all([aCall('wtm', 'attendance', { dateFrom: f, dateTo: t }), aCall('wtm', 'leaves', { dateFrom: f, dateTo: t })]).then(function (r) { SN.att2[k] = { att: r[0] || {}, lv: r[1] || {} }; if ($('#sn-root')) snDraw(); }).catch(function () {});
  return SN.att2[k];
}
function snNeedOld(dates) {   // ดูสัปดาห์ก่อนงานชุดแรก → โหลดงานเก่าเบื้องหลังครั้งเดียว (tasksOld)
  var d = SN.d; if (!d._tasksSince || SN.oldTasks || snDs(dates[0]) >= d._tasksSince) return;
  SN.oldTasks = 'loading'; aCall('wtm', 'tasksOld', { before: d._tasksSince }).then(function (r) { var have = {}; d.tasks.forEach(function (t) { have[t.id] = 1; }); (r && r.tasks || []).forEach(function (t) { if (!have[t.id]) d.tasks.push(t); }); SN.oldTasks = true; if ($('#sn-root')) snDraw(); }).catch(function () { SN.oldTasks = false; });
}

/* ไอคอนจากหน้าเดิม (planner.html hrLayout · ไฟล์ Excel/PDF · มุมมอง) · 20 พ.ย. 2569 ผู้ใช้: ขาดไอคอน + ดำเกินไป */
function snFic(k) { var c = k === 'pdf' ? '#DC2626' : '#15803D', l = k === 'pdf' ? 'PDF' : 'XLS'; return '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="flex:none"><path d="M4 1.5h8l5 5v12H4z" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 1.5v5h5" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-linejoin="round"/><rect x="1" y="10" width="13" height="7" rx="2" fill="' + c + '"/><text x="7.5" y="15.2" text-anchor="middle" font-size="4.8" font-weight="700" fill="#fff" font-family="Arial,sans-serif">' + l + '</text></svg>'; }
var SN_IC = { plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  list: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  team: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  tech: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/><path d="M17 11l2 2 4-4"/></svg>',
  car: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M3 17V11l2-5h11l3 5h2v6"/></svg>',
  set: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>' };
/* ── วาดหน้า ── */
var SN_DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], SN_CAP = 5, SN_H = '62px';
function snDraw() {
  var r = $('#sn-root'); if (!r || !SN.d) return; var d = SN.d, dates = snDates(), dss = dates.map(snDs), from = dss[0], to = dss[6], td = snDs(new Date());
  snNeedOld(dates);
  var AT = snAttFor(from, to), depts = snDepts(), show = depts.filter(function (x) { return SN.dept === 'all' || x.name === SN.dept; });
  var inWeek = function (t) { var ts = snNorm(t.start), te = snNorm(t.end || t.start); return ts && ts <= to && te >= from; };
  var wk = d.tasks.filter(function (t) { return inWeek(t) && depts.some(function (x) { return x.name === t.deptName && snTeamsOf(x.name).some(function (n) { return n.trim().toLowerCase() === String(t.teamName || '').trim().toLowerCase(); }); }); });
  var wkShow = wk.filter(function (t) { return SN.dept === 'all' || t.deptName === SN.dept; }), pmYes = wkShow.filter(function (t) { return String(t.pmCode || '').trim(); }).length;
  // วันนี้: คนที่มีงานแต่ยังไม่ลงเวลา / ลาแต่มีงาน
  var tdAT = td >= from && td <= to ? AT : snAttFor(td, td), ppl = {}, noIn = 0, lvJob = 0;
  d.tasks.forEach(function (t) { var ts = snNorm(t.start), te = snNorm(t.end || t.start); if (!ts || td < ts || td > te) return; if (SN.dept !== 'all' && t.deptName !== SN.dept) return; snMembersOn(t, td).forEach(function (c) { ppl[c] = 1; }); });
  Object.keys(ppl).forEach(function (c) { if (tdAT.lv[c + '::' + td]) lvJob++; else if (!tdAT.att[c + '::' + td]) noIn++; });
  var g = snCostGrants(d.tasks.filter(inWeek), dss), cu = d.cu || {}, canAdd = snEditSc() !== 'none';
  var fmtR = function (a, b) { var o = { day: 'numeric', month: 'short' }; return a.toLocaleDateString('th-TH', o) + ' – ' + b.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }); };
  var chip = function (k, l, n) { return '<button class="sn-chip' + (SN.dept === k ? ' on' : '') + '" data-snd="' + esc(k) + '">' + esc(l) + ' <span>' + n + '</span></button>'; };
  var cnt = function (dn) { return wk.filter(function (t) { return dn === 'all' || t.deptName === dn; }).length; };
  var sum = function (k, n, l, w) { return '<button class="sn-sum' + (SN.pm === k ? ' on' : '') + '"' + (k ? ' data-snp="' + k + '"' : '') + '><b class="' + (w && n ? 'w' : '') + '">' + n + '</b><span>' + l + '</span></button>'; };
  var html = '<div class="sn-top"><div class="sn-sub">' + fmtR(dates[0], dates[6]) + ' · ' + wkShow.length + ' งาน · เวลาเข้างานจากระบบลงเวลา' + (SN.oldTasks === 'loading' ? ' · กำลังโหลดงานเก่า…' : '') + '</div><span class="sp"></span>' +
    '<button class="btn sn-ib2" data-sno="export">' + snFic('xls') + 'Export Excel</button><button class="btn sn-ib2" data-sno="export">' + snFic('pdf') + 'Export PDF</button><button class="btn sn-ib2" data-sno="car">' + SN_IC.car + 'รถบริษัท</button>' + (cu.admin ? '<button class="btn sn-ib2" id="sn-set" title="สีตำแหน่งงาน · ค่าเบี้ย (ตั้งค่าระบบ › ตารางงาน)">' + SN_IC.set + 'ตั้งค่าตารางงาน</button>' : '') + (cu.hr || cu.admin ? '<button class="btn" id="sn-back" title="กลับไปใช้ตารางงานหน้าเดิม">หน้าเดิม</button>' : '') + (canAdd ? '<button class="btn pri sn-ib2" id="sn-add">' + SN_IC.plus + 'เพิ่มงาน</button>' : '') + '</div>' +
    '<div class="sn-bar"><div class="sn-chips"><span class="sn-lb">แผนก</span>' + chip('all', 'ทุกแผนก', cnt('all')) + depts.map(function (x) { return chip(x.name, x.name, cnt(x.name)); }).join('') + '</div>' +
    '<div class="sn-wk"><button class="sn-ib" data-snw="-1" aria-label="สัปดาห์ก่อน">‹</button><b>' + fmtR(dates[0], dates[6]) + '</b><button class="sn-ib" data-snw="1" aria-label="สัปดาห์ถัดไป">›</button></div><button class="btn" data-snw="0">สัปดาห์นี้</button>' +
    '<div class="sn-views"><button class="on">' + SN_IC.list + ' รายการ</button><button data-sno="view">' + SN_IC.team + ' รายชื่อทีม</button><button data-sno="view">' + SN_IC.tech + ' ตามช่าง</button></div>' +
    '<span class="sp"></span><label class="sn-tg"><input type="checkbox" id="sn-att"' + (SN.att ? ' checked' : '') + '><i></i>เวลาเข้างาน</label><span class="sn-lg"><i class="n"></i>กะดึก</span><span class="sn-lg"><i class="b"></i>ยืมตัวจากทีมอื่น</span></div>' +
    '<div class="sn-sums">' + sum('all', wkShow.length, 'งานทั้งหมด') + sum('yes', pmYes, 'ผูกเลข PM แล้ว') + sum('no', wkShow.length - pmYes, 'ยังไม่ผูก PM', 1) + sum('', noIn, 'คนยังไม่ลงเวลา (วันนี้)', 1) + sum('', lvJob, 'คนลาแต่มีงาน (วันนี้)', 1) + '</div>';
  var rows = dates.map(function (dt, di) { return snDay(dt, dss[di], show, AT, g, td); }).join('');
  html += '<section class="sn-card"><div class="sn-tw"><table class="sn-t"><thead><tr><th style="width:84px">วันที่</th><th style="width:96px">ทีม</th><th style="min-width:300px">โครงการ / หน้างาน</th><th style="width:116px">รถ</th>' +
    [1, 2, 3, 4, 5].map(function (i) { return '<th style="min-width:150px">คนที่ ' + i + '</th>'; }).join('') + '<th style="width:86px;text-align:right">ต้นทุน</th></tr></thead><tbody>' + (rows || '<tr><td colspan="10" class="muted" style="text-align:center;padding:30px">ไม่มีทีมที่แสดงในตารางงาน · ตั้งได้ที่ ตั้งค่าตารางงาน</td></tr>') + '</tbody></table></div></section>';
  r.innerHTML = html; snBind(); if (window.pgFx) setTimeout(pgFx, 0);   /* เอฟเฟ็กต์เปิดหน้าแบบเมนูอื่น */
}
function snDay(dt, ds, show, AT, g, td) {
  var dow = dt.getDay(), hol = SN.d.holidays.filter(function (h) { return h.date === ds; })[0], dc = dow === 0 || hol ? '#A3A3A3' : '#141414', today = ds === td;
  var R = [];
  show.forEach(function (dept) {
    snTeamsOf(dept.name).forEach(function (tn, ti) {
      var L = SN.d.tasks.filter(function (t) { var ts = snNorm(t.start), te = snNorm(t.end || t.start); return String(t.teamName || '').trim().toLowerCase() === tn.trim().toLowerCase() && String(t.deptName || '').trim().toLowerCase() === dept.name.trim().toLowerCase() && ts <= ds && te >= ds; })
        .filter(function (t) { var h = !!String(t.pmCode || '').trim(); return SN.pm === 'all' || (SN.pm === 'yes') === h; }).sort(function (a, b) { return (a.sortIndex || 0) - (b.sortIndex || 0); });
      var subs = L.map(function (t) { return Math.max(1, Math.ceil((snMembersOn(t, ds).length + (t.dailyWorkers || []).length) / SN_CAP)); }), n = Math.max(1, subs.reduce(function (a, b) { return a + b; }, 0)), k = 0;
      L.forEach(function (t, i) { for (var s = 0; s < subs[i]; s++) R.push({ dept: dept, tn: tn, t: t, sub: s, subN: subs[i], first: k++ === 0, n: n }); });
      for (; k < n; k++) R.push({ dept: dept, tn: tn, t: null, sub: 0, subN: 1, first: k === 0, n: n });
    });
  });
  if (!R.length) return '';
  var seen = {}, span = {}; R.forEach(function (r) { span[r.dept.name] = (span[r.dept.name] || 0) + 1; });
  return R.map(function (r, i) {
    var ac = r.dept.color || '#888', t = r.t, night = t && t.shift === 'night', nb = night ? 'background:#F5F6FA;' : '';
    var h = '<tr class="' + (night ? 'sn-night' : '') + (i === 0 ? ' sn-d0' : '') + '"' + (t ? ' data-snt="' + t.id + '" data-snds="' + ds + '"' : '') + '>';
    if (i === 0) h += '<td rowspan="' + R.length + '" class="sn-day" style="background:' + (today ? '#F7F7F8' : '#fff') + '"><div class="sn-dn" style="background:' + dc + '"><b>' + dt.getDate() + '</b><span>' + SN_DOW[dow] + '</span></div><div class="sn-dm" style="color:' + dc + '">' + dt.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }) + '</div>' + (hol ? '<div class="sn-hol">' + esc(String(hol.name).slice(0, 10)) + '</div>' : '') + '</td>';
    if (!seen[r.dept.name]) { seen[r.dept.name] = 1; }
    if (r.first) h += '<td rowspan="' + r.n + '" class="sn-team" style="color:' + ac + ';border-left:4px solid ' + ac + '"><span>' + esc(r.tn) + '</span><em style="background:' + ac + '20;color:' + ac + '">' + r.n + '</em></td>';
    if (!t) return h + '<td colspan="8" class="sn-empty"><div>ไม่มีงาน' + (snCanAdd(r.dept.name, r.tn) ? '<button type="button" data-sna="' + esc(r.dept.name) + '" data-snat="' + esc(r.tn) + '" data-snad="' + ds + '">+ เพิ่มงาน</button>' : '') + '</div></td></tr>';
    var mems = snMembersOn(t, ds).map(snEmp).filter(Boolean), roster = mems.concat((t.dailyWorkers || []).map(function (w) { return { __d: 1, w: w }; })), sl = roster.slice(r.sub * SN_CAP, r.sub * SN_CAP + SN_CAP);
    if (r.sub === 0) {
      var rs = r.subN > 1 ? ' rowspan="' + r.subN + '"' : '', pm = String(t.pmCode || '').trim();
      h += '<td' + rs + ' class="sn-job" style="' + nb + '" title="' + esc(t.title) + '"><div class="sn-jt">' + esc(t.title) + (r.subN > 1 ? ' <span class="sn-mc">(' + roster.length + ' คน)</span>' : '') + '</div><div class="sn-jm">' +
        (night ? '<span class="sn-nt">' + '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' + 'กะดึก</span>' : '') + (pm ? '<span class="sn-pm" title="ผูกกับ Confirmed แล้ว' + (t.pmFileName ? ' · ' + esc(t.pmFileName) : '') + '">' + esc(pm) + '</span>' : '<span class="sn-nopm">ยังไม่ผูก PM</span>') + (t.site ? '<span class="sn-site">' + esc(t.site) + '</span>' : '') + '</div></td>';
      var vids = t.vehicleIds && t.vehicleIds.length ? t.vehicleIds : t.vehicleId ? [String(t.vehicleId)] : [], v = SN.d.vehicles.filter(function (x) { return String(x.id) === String(vids[0] || ''); })[0];
      h += '<td' + rs + ' class="sn-car" style="' + nb + '">' + (v ? '<span class="sn-plate"><b>' + esc(v.plate || '') + '</b>' + (vids.length > 1 ? '<i>+' + (vids.length - 1) + '</i>' : '') + '</span>' + (v.model ? '<small>' + esc(v.model) + '</small>' : '') : '<span class="sn-nocar">—</span>') + '</td>';
    }
    for (var p = 0; p < SN_CAP; p++) {
      var x = sl[p];
      if (!x) { h += '<td class="sn-p sn-p0" style="' + nb + '"></td>'; continue; }
      if (x.__d) { h += '<td class="sn-p"><div class="sn-pi sn-dw"><span class="sn-av" style="background:#7A4FD6">จ้าง</span><div><b>' + esc(x.w.name || 'ไม่ระบุ') + '</b><small>' + snMoney(x.w.wage || 0) + '</small></div></div></td>'; continue; }
      var br = (t.borrowedMembers || []).indexOf(x.code) >= 0 && !snInTeam(x, t.deptName, t.teamName), a = AT.att[x.code + '::' + ds], at = a ? (a.time || a) : '', al = a && a.loc || '', lv = AT.lv[x.code + '::' + ds];
      var acol = al === 'Pushmedia' ? '#16A34A' : al === 'นอกพื้นที่' ? '#D97706' : '#DC2626', ph = snPhoto(x.photo), bg = (SN.d.config.positionColors && SN.d.config.positionColors[x.position]) || '';
      h += '<td class="sn-p" style="' + nb + '"><div class="sn-pi"' + (bg ? ' style="background:' + esc(bg) + '"' : '') + '><span class="sn-av" style="background:' + ac + (br ? ';box-shadow:0 0 0 2px #fff,0 0 0 4px #F97316' : '') + '">' + (ph ? '<img src="' + esc(ph) + '" alt="" loading="lazy">' : esc(String(x.nickname || x.name || '?').slice(0, 2))) + '</span><div><div class="sn-pn"><b>' + esc(x.nickname || x.name) + '</b>' +
        (lv ? '<em class="sn-lv">' + esc(lv.type || 'ลา') + '</em>' : at && SN.att ? '<em style="color:' + acol + '">' + esc(at) + '</em>' : '') + '</div><small>' + esc(x.position || '') + '</small>' + (br ? '<div class="sn-br">ยืม · ' + esc(x.team || 'ทีมอื่น') + '</div>' : '') + '</div></div></td>';
    }
    if (r.sub === 0) { var c = snCostFor(t, ds, g); h += '<td' + (r.subN > 1 ? ' rowspan="' + r.subN + '"' : '') + ' class="sn-cost" style="' + nb + '">' + (c ? '<b>' + snMoney(c) + '</b>' : '<span>—</span>') + '</td>'; }
    return h + '</tr>';
  }).join('');
}
function snCanAdd(dn, tn) { var cu = SN.d.cu || {}; var sc = snEditSc(); return sc === 'all' || (sc === 'dept' && dn === cu.dept) || (sc === 'team' && dn === cu.dept && tn === cu.team); }
function snBind() {
  $$('[data-snd]').forEach(function (b) { b.onclick = function () { SN.dept = b.dataset.snd; snDraw(); }; });
  $$('[data-snp]').forEach(function (b) { b.onclick = function () { SN.pm = SN.pm === b.dataset.snp ? 'all' : b.dataset.snp; snDraw(); }; });
  $$('[data-snw]').forEach(function (b) { b.onclick = function () { var k = +b.dataset.snw; SN.off = k ? SN.off + k : 0; snDraw(); }; });
  var bk = $('#sn-back'); if (bk) bk.onclick = function () { snSet(0); };
  var a = $('#sn-att'); if (a) a.onchange = function () { SN.att = a.checked; snDraw(); };
  var st = $('#sn-set'); if (st) st.onclick = function () { hrNav('set', 'sched'); };
  var ad = $('#sn-add'); if (ad) ad.onclick = function () { snfOpen(null, SN.dept !== 'all' ? { dept: SN.dept } : {}); };
  $$('[data-sna]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); snfOpen(null, { dept: b.dataset.sna, team: b.dataset.snat, date: b.dataset.snad }); }; });
  var W = { view: 'มุมมองนี้ยังอยู่ในหน้าเดิม', export: 'Export อยู่ในหน้าเดิม', car: 'จัดการรถอยู่ในหน้าเดิม', set: 'ตั้งค่าตารางงานอยู่ในหน้าเดิม' };
  $$('[data-sno]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); snOld(W[b.dataset.sno]); }; });
  $$('tr[data-snt]').forEach(function (tr) { tr.onclick = function () { snDetail(+tr.dataset.snt, tr.dataset.snds); }; });
}
/* รายละเอียดงาน (ดูอย่างเดียว) · แก้ไข = หน้าเดิม */
function snDetail(id, ds) {
  var t = SN.d.tasks.filter(function (x) { return x.id === id; })[0]; if (!t) return;
  var mem = snMembersOn(t, ds).map(snEmp).filter(Boolean), vids = t.vehicleIds && t.vehicleIds.length ? t.vehicleIds : t.vehicleId ? [String(t.vehicleId)] : [];
  var cars = vids.map(function (v) { return SN.d.vehicles.filter(function (x) { return String(x.id) === String(v); })[0]; }).filter(Boolean);
  var row = function (l, v) { return v ? '<div class="sn-dr"><span>' + l + '</span><div>' + v + '</div></div>' : ''; }, dd = function (s) { return s ? dTxt(snNorm(s)) : ''; };
  drawer(t.title, '<div class="sn-det">' + row('หน้างาน', esc(t.site || '')) + row('ลูกค้า', esc(t.customer || '')) + row('แผนก / ทีม', esc((t.deptName || '') + ' · ' + (t.teamName || ''))) +
    row('วันที่', esc(dd(t.start) + (snNorm(t.end) && snNorm(t.end) !== snNorm(t.start) ? ' – ' + dd(t.end) : ''))) + row('กะ', t.shift === 'night' ? 'กะดึก' : 'กะกลางวัน') + row('เลข PM', esc(t.pmCode || '') || '<span class="muted">ยังไม่ผูก PM</span>') +
    row('รถ', cars.map(function (c) { return esc((c.plate || '') + (c.model ? ' · ' + c.model : '')); }).join('<br>')) +
    row('คนในงาน (' + esc(dTxt(ds)) + ')', mem.map(function (e) { return esc((e.nickname || e.name) + (e.position ? ' · ' + e.position : '')); }).join('<br>') + (t.dailyWorkers || []).map(function (w) { return '<br>จ้างรายวัน · ' + esc(w.name || ''); }).join('')) +
    row('หมายเหตุ', esc(t.notes || '').replace(/\n/g, '<br>')) + (snCanAdd(t.deptName, t.teamName) ? '<div style="margin-top:16px"><button class="btn pri" id="sn-edit">แก้ไขงาน</button></div>' : '') + '</div>');
  var eb = $('#sn-edit'); if (eb) eb.onclick = function () { snfOpen(t); };   /* CSP ห้าม onclick ในข้อความ HTML · ช่วง 2: แก้ในหน้าใหม่ */
}
