/* ───────── ตารางงานหน้าใหม่ ช่วง 2: ฟอร์มเพิ่ม / แก้ / ลบงาน (19 พ.ย. 2569) ─────────
 * ช่องและกติกาเหมือนฟอร์มหน้าเดิม (planner.html openCreate / openEdit / saveTask):
 *   เลข PM + File Name (บังคับ · ติ๊ก "งานนี้ไม่มีเลข PM" แล้วกรอกชื่องานเอง) · รายละเอียดงาน · แผนก/ทีม · วันเริ่ม–สิ้นสุด · รถหลายคัน (เตือนรถชนงานอื่น)
 *   ต่างจังหวัด · กะกลางวัน/กลางคืน · ผู้เข้างานในทีม · ยืมตัวจากทีมอื่น · จ้างรายวัน · หมายเหตุ
 * บันทึกด้วย wtm createTask / updateTask / deleteTask (หลังบ้านตรวจสิทธิ์ซ้ำ · แก้ = รวมกับค่าเดิม ช่องที่ไม่ส่งคงเดิม เช่น คนรายวัน dayOverrides)
 * ปุ่ม/ช่องผูกคำสั่งด้วย .onclick (CSP ห้าม onclick ในข้อความ HTML) · คลาส sn- */
var SNF = { t: null, own: {}, ext: {}, veh: {}, daily: [], pm: null, nopm: false, saving: false, pmRows: null };
function snfCanEdit(dn, tn) { return snCanAdd(dn, tn); }
function snfDepts() { return snDepts().filter(function (d) { return snTeamsOf(d.name).some(function (tn) { return snfCanEdit(d.name, tn); }); }); }
function snfPm() { if (SNF.pmRows) return Promise.resolve(SNF.pmRows); return aCall('wtm', 'confirmedProjects', {}).then(function (r) { SNF.pmRows = r && r.ok !== false ? r.rows || [] : []; return SNF.pmRows; }).catch(function () { SNF.pmRows = []; return []; }); }
/* เปิดฟอร์ม · t = งานเดิม (แก้) · pre = { dept, team, date } (เพิ่มจากแถว) */
function snfOpen(t, pre) {
  pre = pre || {}; SNF.t = t || null; SNF.own = {}; SNF.ext = {}; SNF.veh = {}; SNF.daily = []; SNF.saving = false;
  var cu = SN.d.cu || {};
  if (t) {
    if (!snfCanEdit(t.deptName, t.teamName)) return toast('คุณไม่มีสิทธิ์แก้ไขงานนี้', 1);
    (t.members || []).forEach(function (c) { var e = snEmp(c); if ((t.borrowedMembers || []).indexOf(c) >= 0 && !snInTeam(e, t.deptName, t.teamName)) SNF.ext[c] = 1; else SNF.own[c] = 1; });
    (t.vehicleIds && t.vehicleIds.length ? t.vehicleIds : t.vehicleId ? [String(t.vehicleId)] : []).forEach(function (v) { SNF.veh[String(v)] = 1; });
    SNF.daily = (t.dailyWorkers || []).map(function (w) { return { name: w.name || '', days: w.days || 1, wage: w.wage || 0 }; });
    SNF.pm = String(t.pmCode || '').trim() ? { code: t.pmCode, name: t.pmFileName || '' } : null; SNF.nopm = !SNF.pm;
  } else {
    if (!snfDepts().length) return toast('คุณไม่มีสิทธิ์สร้างงาน', 1);
    SNF.pm = null; SNF.nopm = false;
  }
  var dn = t ? t.deptName : pre.dept || (snfDepts().length === 1 ? snfDepts()[0].name : ''), tn = t ? t.teamName : pre.team || '', d0 = t ? snNorm(t.start) : pre.date || '', d1 = t ? snNorm(t.end || t.start) : pre.date || '';
  var opt = function (v, l, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(l) + '</option>'; };
  var body = '<div class="sn-f"><div id="snf-al"></div>' +
    '<div class="sn-pmbox"><div class="sn-fr2"><label class="f sn-rel"><span>เลข PM <b class="req">*</b></span><input id="snf-pmc" autocomplete="off" placeholder="พิมพ์เพื่อค้นหา" value="' + esc(SNF.pm ? SNF.pm.code : '') + '"><div class="sn-dd" id="snf-pmr" hidden></div></label>' +
    '<label class="f"><span>File Name</span><input id="snf-pmn" autocomplete="off" placeholder="เลือกจากเลข PM" value="' + esc(SNF.pm ? SNF.pm.name : '') + '" readonly></label></div>' +
    '<label class="sn-ck"><input type="checkbox" id="snf-nopm"' + (SNF.nopm ? ' checked' : '') + '><span><b>งานนี้ไม่มีเลข PM</b> <em>— ติ๊กแล้วกรอกชื่องานเอง</em></span></label></div>' +
    '<label class="f" id="snf-titw"' + (SNF.nopm ? '' : ' hidden') + '><span>ชื่องาน <b class="req">*</b></span><input id="snf-tit" placeholder="เช่น ติดตั้ง LED BigC รังสิต" value="' + esc(t && !SNF.pm ? t.title : '') + '"></label>' +
    '<label class="f"><span>รายละเอียดงาน</span><textarea id="snf-sit" rows="2" placeholder="สถานที่ / รายละเอียดเพิ่มเติม">' + esc(t ? t.site || '' : '') + '</textarea></label>' +
    '<div class="sn-fr2"><label class="f"><span>แผนก <b class="req">*</b></span><select id="snf-dep">' + opt('', '— เลือกแผนก —') + snfDepts().map(function (d) { return opt(d.name, d.name, d.name === dn); }).join('') + '</select></label>' +
    '<label class="f"><span>ทีม <b class="req">*</b></span><select id="snf-tm"></select></label></div>' +
    '<div class="sn-fr2"><label class="f"><span>วันเริ่ม <b class="req">*</b></span><input type="date" id="snf-sta" value="' + esc(d0) + '"></label><label class="f"><span>วันสิ้นสุด <b class="req">*</b></span><input type="date" id="snf-end" value="' + esc(d1) + '"></label></div><div id="snf-hol"></div>' +
    '<label class="f sn-rel"><span>รถ (เลือกได้มากกว่า 1 คัน)</span><input id="snf-vq" autocomplete="off" placeholder="ค้นหาทะเบียน / รุ่นรถ..."><div class="sn-dd" id="snf-vr" hidden></div></label><div class="sn-tags" id="snf-vt"></div><div id="snf-vw"></div>' +
    '<label class="sn-ck sn-box"><input type="checkbox" id="snf-prov"' + (t && t.isProvince ? ' checked' : '') + '><span>งานต่างจังหวัด <em>(+' + snMoney(+(SN.d.config.provBonus || 300)) + '/คน/วัน)</em></span></label>' +
    '<div class="f"><span>กะการทำงาน</span><div class="sn-shift"><label><input type="radio" name="snf-sh" value="day"' + (!t || t.shift !== 'night' ? ' checked' : '') + '><div><b>กลางวัน</b><small>08:00 – 17:00</small></div></label><label><input type="radio" name="snf-sh" value="night"' + (t && t.shift === 'night' ? ' checked' : '') + '><div><b>กลางคืน</b><small>18:00 – 06:00</small></div></label></div></div>' +
    '<div class="sn-sec"><i style="background:#0F766E"></i>ผู้เข้างาน (ภายในทีม)</div><div class="sn-mem" id="snf-mem"><div class="muted">เลือกทีมก่อน</div></div>' +
    '<div class="sn-sec"><i style="background:#D97706"></i>ผู้เข้างาน (จากทีมอื่น — ยืมตัว)</div><label class="f sn-rel"><input id="snf-xq" autocomplete="off" placeholder="ค้นหาชื่อพนักงาน..."><div class="sn-dd" id="snf-xr" hidden></div></label><div class="sn-tags" id="snf-xt"></div>' +
    '<div class="sn-sec"><i style="background:#7A4FD6"></i>ผู้เข้างาน (จ้างรายวัน)<span class="sp"></span><button type="button" class="btn sm" id="snf-dadd">+ เพิ่ม</button></div><div id="snf-daily"></div>' +
    '<label class="f"><span>หมายเหตุ</span><textarea id="snf-not" rows="2">' + esc(t ? t.notes || '' : '') + '</textarea></label><div id="snf-cost"></div></div>';
  var foot = (t ? '<button class="btn" id="snf-del" style="color:#C0392B;margin-right:auto">ลบงาน</button>' : '') + '<button class="btn" id="snf-cx">ยกเลิก</button><button class="btn pri" id="snf-save">บันทึก</button>';
  drawer(t ? 'แก้ไขงาน' : 'สร้างงานใหม่', body, foot);
  snfTeams(tn); snfVehTags(); snfExtTags(); snfDaily(); snfHol(); snfCost(); snfBind();
}
function snfTeams(sel) {
  var dn = $('#snf-dep').value, s = $('#snf-tm'), L = dn ? snTeamsOf(dn).filter(function (tn) { return snfCanEdit(dn, tn); }) : [];
  s.innerHTML = '<option value="">— เลือกทีม —</option>' + L.map(function (tn) { return '<option value="' + esc(tn) + '"' + (tn === sel || L.length === 1 ? ' selected' : '') + '>' + esc(tn) + '</option>'; }).join('');
  snfMembers();
}
function snfMembers() {
  var dn = $('#snf-dep').value, tn = $('#snf-tm').value, w = $('#snf-mem'); if (!w) return;
  if (!tn) { w.innerHTML = '<div class="muted">เลือกทีมก่อน</div>'; return; }
  var d0 = $('#snf-sta').value, d1 = $('#snf-end').value || d0, AT = d0 ? snAttFor(d0, d1) : { lv: {} };
  var L = SN.d.employees.filter(function (e) { return e.status === 1 && snInTeam(e, dn, tn); });
  Object.keys(SNF.own).forEach(function (c) { if (!L.some(function (e) { return e.code === c; })) { var e = snEmp(c); if (e) L.push(e); } });   // คนเดิมที่ย้ายทีมไปแล้วยังติ๊กอยู่
  w.innerHTML = L.length ? L.map(function (e) { var lv = d0 && AT.lv[e.code + '::' + d0]; return '<label class="sn-mrow"><input type="checkbox" class="snf-mcb" value="' + esc(e.code) + '"' + (SNF.own[e.code] ? ' checked' : '') + '><span class="sn-av sm" style="background:#52525B">' + (snPhoto(e.photo) ? '<img src="' + esc(snPhoto(e.photo)) + '" alt="" loading="lazy">' : esc(String(e.nickname || e.name).slice(0, 2))) + '</span><b>' + esc(e.nickname || e.name) + '</b><small>' + esc(e.position || '') + '</small>' + (lv ? '<em class="sn-lvt">ลา' + esc(lv.type ? ' · ' + lv.type : '') + '</em>' : '') + '</label>'; }).join('') : '<div class="muted">ทีมนี้ยังไม่มีพนักงาน</div>';
  $$('.snf-mcb').forEach(function (cb) { cb.onchange = function () { if (cb.checked) SNF.own[cb.value] = 1; else delete SNF.own[cb.value]; snfCost(); }; });
}
function snfVehTags() {
  var w = $('#snf-vt'); if (!w) return;
  w.innerHTML = Object.keys(SNF.veh).map(function (id) { var v = SN.d.vehicles.filter(function (x) { return String(x.id) === id; })[0]; return '<span class="sn-tag g">' + esc(v ? v.plate + (v.model ? ' · ' + v.model : '') : id) + '<button type="button" data-snfvx="' + esc(id) + '" aria-label="เอาออก">✕</button></span>'; }).join('');
  $$('[data-snfvx]').forEach(function (b) { b.onclick = function () { delete SNF.veh[b.dataset.snfvx]; snfVehTags(); }; }); snfCarWarn();
}
function snfCarWarn() {   // รถถูกใช้ในงานอื่นช่วงเดียวกัน (เตือน · ไม่บังคับ เหมือนหน้าเดิม)
  var w = $('#snf-vw'); if (!w) return; var a = $('#snf-sta').value, b = $('#snf-end').value || a, me = SNF.t && SNF.t.id, msg = [];
  if (a) Object.keys(SNF.veh).forEach(function (id) { SN.d.tasks.forEach(function (t) { if (t.id === me) return; var tv = t.vehicleIds && t.vehicleIds.length ? t.vehicleIds : t.vehicleId ? [String(t.vehicleId)] : []; if (tv.map(String).indexOf(id) >= 0 && !(b < snNorm(t.start) || a > snNorm(t.end || t.start))) { var v = SN.d.vehicles.filter(function (x) { return String(x.id) === id; })[0]; msg.push('รถ ' + esc(v ? v.plate : id) + ' ถูกใช้ใน "' + esc(t.title) + '" อยู่แล้ว'); } }); });
  w.innerHTML = msg.length ? '<div class="sn-warn">' + msg.join('<br>') + '</div>' : '';
}
function snfExtTags() {
  var w = $('#snf-xt'); if (!w) return;
  w.innerHTML = Object.keys(SNF.ext).map(function (c) { var e = snEmp(c); return '<span class="sn-tag o">' + esc(e ? (e.nickname || e.name) + ' · ' + (e.team || '') : c) + '<button type="button" data-snfxx="' + esc(c) + '" aria-label="เอาออก">✕</button></span>'; }).join('');
  $$('[data-snfxx]').forEach(function (b) { b.onclick = function () { delete SNF.ext[b.dataset.snfxx]; snfExtTags(); snfCost(); }; });
}
function snfDaily() {
  var w = $('#snf-daily'); if (!w) return;
  w.innerHTML = SNF.daily.map(function (d, i) { return '<div class="sn-drow"><input placeholder="ชื่อ" value="' + esc(d.name) + '" data-snfd="' + i + '" data-k="name"><input type="number" min="1" value="' + esc(d.days) + '" data-snfd="' + i + '" data-k="days" title="จำนวนวัน"><input type="number" min="0" step="50" value="' + esc(d.wage) + '" data-snfd="' + i + '" data-k="wage" title="ค่าแรงรวม (บาท)"><button type="button" class="btn sm" data-snfdx="' + i + '" aria-label="เอาออก">✕</button></div>'; }).join('');
  $$('[data-snfd]').forEach(function (x) { x.oninput = function () { var d = SNF.daily[+x.dataset.snfd], k = x.dataset.k; d[k] = k === 'name' ? x.value : +x.value || 0; snfCost(); }; });
  $$('[data-snfdx]').forEach(function (b) { b.onclick = function () { SNF.daily.splice(+b.dataset.snfdx, 1); snfDaily(); snfCost(); }; });
}
function snfHol() { var w = $('#snf-hol'); if (!w) return; var a = $('#snf-sta').value, b = $('#snf-end').value || a, n = 0, L = []; if (a && b >= a) { for (var d = new Date(a + 'T00:00:00'); snDs(d) <= b && n < 62; d.setDate(d.getDate() + 1), n++) if (snHolStrict(snDs(d))) L.push(dTxt(snDs(d))); } w.innerHTML = L.length ? '<div class="sn-info">มีวันหยุดในช่วงงาน: ' + esc(L.join(' · ')) + ' · คิดเบี้ยวันหยุด +' + snMoney(+(SN.d.config.holBonus || 700)) + '/คน/วัน</div>' : ''; }
function snfCost() {   // ประมาณการเบี้ยวันหยุด + ต่างจังหวัด + จ้างรายวัน (สูตรเดียวกับหน้าเดิม)
  var w = $('#snf-cost'); if (!w) return; var a = $('#snf-sta').value, b = $('#snf-end').value || a, n = Object.keys(SNF.own).length + Object.keys(SNF.ext).length, prov = $('#snf-prov') && $('#snf-prov').checked, hb = +(SN.d.config.holBonus || 700), pb = +(SN.d.config.provBonus || 300), c = 0, days = 0;
  if (a && b >= a) for (var d = new Date(a + 'T00:00:00'); snDs(d) <= b && days < 366; d.setDate(d.getDate() + 1), days++) { if (snHolStrict(snDs(d))) c += hb * n; if (prov) c += pb * n; }
  c += SNF.daily.reduce(function (s, x) { return s + (+x.wage || 0); }, 0);
  w.innerHTML = c ? '<div class="sn-costb">ค่าใช้จ่ายโดยประมาณ <b>' + snMoney(c) + '</b></div>' : '';
}
function snfSearch(inp, box, items, pick) {   // ช่องค้นหา + รายการให้เลือก (รถ · ยืมตัว · เลข PM)
  var go = function () { var q = inp.value.trim().toLowerCase(), L = items(q).slice(0, 40); box.hidden = !L.length && !q; box.innerHTML = L.length ? L.map(function (x, i) { return '<button type="button" data-snfi="' + i + '">' + x.html + '</button>'; }).join('') : '<div class="muted" style="padding:8px 12px">ไม่พบรายการ</div>';
    $$('[data-snfi]', box).forEach(function (b) { b.onmousedown = function (e) { e.preventDefault(); pick(L[+b.dataset.snfi]); inp.value = ''; box.hidden = true; }; }); };
  inp.oninput = go; inp.onfocus = go; inp.onblur = function () { setTimeout(function () { box.hidden = true; }, 150); };
}
function snfBind() {
  $('#dx').onclick = $('#snf-cx').onclick = function () { closeD(); };
  $('#snf-dep').onchange = function () { snfTeams(''); snfCost(); };
  $('#snf-tm').onchange = function () { snfMembers(); snfCost(); };
  ['#snf-sta', '#snf-end'].forEach(function (k) { $(k).onchange = function () { if (k === '#snf-sta' && !$('#snf-end').value) $('#snf-end').value = $('#snf-sta').value; snfHol(); snfCost(); snfMembers(); snfCarWarn(); }; });
  $('#snf-prov').onchange = snfCost;
  $('#snf-nopm').onchange = function () { SNF.nopm = this.checked; $('#snf-titw').hidden = !SNF.nopm; if (SNF.nopm) { SNF.pm = null; $('#snf-pmc').value = ''; $('#snf-pmn').value = ''; } };
  $('#snf-dadd').onclick = function () { SNF.daily.push({ name: '', days: 1, wage: 0 }); snfDaily(); var L = $$('#snf-daily input[data-k="name"]'); if (L.length) L[L.length - 1].focus(); };
  snfSearch($('#snf-vq'), $('#snf-vr'), function (q) { return SN.d.vehicles.filter(function (v) { return !SNF.veh[String(v.id)] && String(v.status || '') !== 'inactive' && (!q || (v.plate + ' ' + (v.model || '')).toLowerCase().indexOf(q) >= 0); }).map(function (v) { return { id: String(v.id), html: '<b>' + esc(v.plate) + '</b> <small>' + esc(v.model || '') + '</small>' }; }); }, function (x) { SNF.veh[x.id] = 1; snfVehTags(); });
  snfSearch($('#snf-xq'), $('#snf-xr'), function (q) { if (!q) return []; var dn = $('#snf-dep').value, tn = $('#snf-tm').value; return SN.d.employees.filter(function (e) { return e.status === 1 && !SNF.ext[e.code] && !SNF.own[e.code] && !snInTeam(e, dn, tn) && ((e.nickname || '') + ' ' + e.name + ' ' + e.code).toLowerCase().indexOf(q) >= 0; }).map(function (e) { return { code: e.code, html: '<b>' + esc(e.nickname || e.name) + '</b> <small>' + esc((e.team || '') + ' · ' + (e.position || '')) + '</small>' }; }); }, function (x) { SNF.ext[x.code] = 1; snfExtTags(); snfCost(); });
  var pc = $('#snf-pmc'); snfPm().then(function () { snfSearch(pc, $('#snf-pmr'), function (q) { var w = q.split(/\s+/).filter(Boolean); return (SNF.pmRows || []).filter(function (r) { var h = (r[0] + ' ' + r[1] + ' ' + (r[4] || '')).toLowerCase(); return w.every(function (x) { return h.indexOf(x) >= 0; }); }).map(function (r) { return { code: r[0], name: r[1], html: '<b>' + esc(r[0]) + '</b> <small>' + esc(r[1] || '') + '</small>' }; }); }, function (x) { SNF.pm = { code: x.code, name: x.name }; SNF.nopm = false; $('#snf-nopm').checked = false; $('#snf-titw').hidden = true; pc.value = x.code; $('#snf-pmn').value = x.name; }); var v0 = SNF.pm ? SNF.pm.code : ''; pc.addEventListener('focus', function () { if (pc.value === v0 && v0) pc.select(); }); });
  $('#snf-save').onclick = snfSave;
  var del = $('#snf-del'); if (del) del.onclick = function () { ask({ title: 'ลบงานนี้?', desc: '"' + SNF.t.title + '" จะหายจากตารางงานของทุกคน', tone: 'warn', buttons: [{ k: 'no', label: 'ยกเลิก' }, { k: 'yes', label: 'ลบงาน', cls: 'pri' }] }).then(function (k) { if (k !== 'yes') return; busy(del, 1);
    aCall('wtm', 'deleteTask', { id: SNF.t.id }).then(function (r) { if (r && r.ok === false) throw new Error(r.error); SN.d.tasks = SN.d.tasks.filter(function (x) { return x.id !== SNF.t.id; }); closeD(); toast('ลบงานแล้ว'); snAfterSave(); }).catch(function (e) { busy(del, 0); toast(e.message, 1); }); }); };
}
function snfErr(m) { var a = $('#snf-al'); if (a) { a.innerHTML = '<div class="alert">' + m + '</div>'; a.scrollIntoView({ block: 'nearest' }); } }
function snfSave() {
  if (SNF.saving) return;
  var pmc = $('#snf-pmc').value.trim();
  if (!SNF.nopm && SNF.pm && pmc && pmc !== SNF.pm.code) SNF.pm = null;   // แก้ข้อความเลข PM โดยไม่เลือกจากรายการ
  if (!SNF.nopm && !(SNF.pm && SNF.pm.code && SNF.pm.name)) return snfErr('กรุณาเลือกเลข PM และ File Name หรือติ๊ก "งานนี้ไม่มีเลข PM"');
  var title = SNF.nopm ? $('#snf-tit').value.trim() : SNF.pm.code + ' - ' + SNF.pm.name, dn = $('#snf-dep').value, tn = $('#snf-tm').value, a = $('#snf-sta').value, b = $('#snf-end').value;
  if (!title || !dn || !tn || !a || !b) return snfErr('กรุณากรอกข้อมูลที่จำเป็น (ชื่องาน แผนก ทีม วันที่)');
  if (b < a) return snfErr('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
  if (!snfCanEdit(dn, tn)) return snfErr('คุณไม่มีสิทธิ์สร้าง/แก้ไขงานในแผนกหรือทีมนี้');
  var own = Object.keys(SNF.own), ext = Object.keys(SNF.ext), vids = Object.keys(SNF.veh), sh = ($$('input[name="snf-sh"]').filter(function (x) { return x.checked; })[0] || {}).value || 'day';
  if (SNF.t) { var lead = (SNF.t.members || [])[0]; own.sort(function (x, y) { return (x === lead ? -1 : 0) - (y === lead ? -1 : 0); }); }   // หัวหน้างาน (คนแรก) อยู่ลำดับเดิม
  var data = { title: title, site: $('#snf-sit').value.trim(), deptName: dn, teamName: tn, start: a, end: b, vehicleId: vids[0] || '', vehicleIds: vids, isProvince: $('#snf-prov').checked, members: own.concat(ext), borrowedMembers: ext,
    dailyWorkers: SNF.daily.filter(function (d) { return String(d.name).trim() || +d.wage; }).map(function (d) { return { name: String(d.name).trim() || 'ไม่ระบุ', days: +d.days || 1, wage: +d.wage || 0 }; }), shift: sh, notes: $('#snf-not').value.trim(), pmCode: SNF.pm ? SNF.pm.code : '', pmFileName: SNF.pm ? SNF.pm.name : '' };
  if (!SNF.t) { data.otHours = 0; data.customer = ''; } else data.id = SNF.t.id;
  SNF.saving = true; var btn = $('#snf-save'); busy(btn, 1); btn.textContent = 'กำลังบันทึก…';
  aCall('wtm', SNF.t ? 'updateTask' : 'createTask', data).then(function (r) {
    SNF.saving = false; if (!r || r.ok === false) throw new Error(r && r.error || 'บันทึกไม่สำเร็จ');
    var nt = Object.assign({}, SNF.t || { status: 'pending', otHours: 0, dayOverrides: {}, customer: '', sortIndex: Date.now(), createdAt: new Date().toISOString() }, data, { id: r.id || (SNF.t && SNF.t.id) });
    SN.d.tasks = SN.d.tasks.filter(function (x) { return x.id !== nt.id; }).concat([nt]);
    closeD(); toast(SNF.t ? 'บันทึกการแก้ไขแล้ว' : 'สร้างงานแล้ว'); snAfterSave();
  }).catch(function (e) { SNF.saving = false; busy(btn, 0); btn.textContent = 'บันทึก'; snfErr(esc(e.message)); });
}
/* หลังบันทึก: วาดทันทีจากข้อมูลในเครื่อง แล้วโหลดของจริงจากหลังบ้านเงียบ ๆ (ได้ค่าที่หลังบ้านคำนวณ · งานที่คนอื่นแก้พร้อมกัน) */
function snAfterSave() { if ($('#sn-root')) snDraw(); SN.ver = 'x'; snCheck(); }
