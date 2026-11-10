/* เงินเดือน › ภาษีประจำปี (10 พ.ย. 2569 ผู้ใช้ขอ): ภ.ง.ด.1 รายเดือน ย้อนหลังทั้งปี · ภ.ง.ด.1ก · หนังสือรับรอง 50 ทวิ
 * ข้อมูล = งวดเงินเดือนที่ "จ่ายแล้ว" ตามวันที่จ่าย (payAnnual · TaxAnnual.js) · ไม่คำนวณเงินเดือนใหม่
 * เอกสาร: พิมพ์ลงภาพแบบฟอร์มทางการของกรมสรรพากร ตามตำแหน่งช่องจริงในไฟล์ PDF ของกรมฯ (forms/rd-fields.js) → เบราว์เซอร์ "บันทึกเป็น PDF" */
var TX = { year: '', co: '', view: 'year', m: 1, d: null, q: '' };
function txN(x) { return (Number(x) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function txBE(y) { return String(+y + 543); }
var TX_MON = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
function pyTax() {
  if (!TX.year) TX.year = String(new Date().getFullYear());
  if (!TX.co) TX.co = ((pyCos()[0]) || {}).id || '';
  pyBody('<div class="loading"><span class="spin"></span>กำลังรวมข้อมูลทั้งปี…</div>');
  aCall('payAnnual', TX.year, TX.co).then(function (d) { TX.d = d; txDraw(); }).catch(function (e) { pyBody('<div class="alert">' + esc(e.message) + '</div>'); });
}
function txDraw() {
  var d = TX.d, c = d.checks, T = d.types || {}, now = new Date().getFullYear(), ys = []; for (var y = now + 1; y >= 2026; y--) ys.push(y);
  var kpi = function (l, v, s) { return '<div class="tx-k"><span>' + l + '</span><b class="num">' + v + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
  var warn = [];
  if (c.block.length) warn.push(['bad', 'ต้องแก้ก่อนยืนยันรายงาน', c.block.map(esc).join('<br>')]);
  if (c.untyped.length) warn.push(['bad', 'รายการเงินได้ที่ยังไม่กำหนดประเภท (' + c.untyped.length + ')', c.untyped.map(function (i) { return esc(i.name) + (i.used ? ' <b>· มียอดในปีนี้</b>' : ''); }).join(' · ') + ' <button class="btn sm" data-pyt2="items">ไปกำหนดประเภท</button>']);
  if (c.edited_after) warn.push(['bad', 'ข้อมูลเปลี่ยนหลังยืนยันรายงาน', 'ยืนยันเมื่อ ' + esc(fdt(c.edited_after.confirmed_at)) + ' · ยืนยันใหม่ก่อนออก 50 ทวิ · ดูประวัติการแก้ที่ Audit Log (ค้นหา pay_runs)']);
  if (c.unpaid.length) warn.push(['warn', 'งวดที่ยังไม่ยืนยันการจ่าย ไม่นับในรายงาน (' + c.unpaid.length + ')', c.unpaid.map(function (r) { return esc(r.ym) + (r.kind === 'bonus' ? ' (โบนัส)' : '') + ' · ' + esc(r.status_name); }).join(' · ')]);
  if (c.dup.length) warn.push(['bad', 'รายการจ่ายซ้ำ (' + c.dup.length + ')', c.dup.map(function (x) { return esc(x.code + ' ' + x.name) + ' · ' + esc(x.ym); }).join('<br>')]);
  if (c.missing.length) warn.push(['warn', 'ข้อมูลพนักงานไม่ครบ (' + c.missing.length + ')', c.missing.map(function (x) { return esc(x.code + ' ' + x.name) + ' · ' + [x.id_card, x.address, x.name_missing].filter(Boolean).map(esc).join(' · '); }).join('<br>')]);
  if (c.mismatch.length) warn.push(['warn', 'ตัวเลือก "คิดภาษี" ไม่ตรงกับประเภทเงินได้ (' + c.mismatch.length + ')', c.mismatch.map(function (x) { return esc(x.name) + ' · ' + esc(x.why); }).join('<br>')]);
  if (c.shift.length) warn.push(['info', 'งวดที่จ่ายต่างปีกับเดือนของงวด (' + c.shift.length + ')', c.shift.map(function (r) { return esc(r.ym) + ' จ่าย ' + esc(thd(r.pay_date)); }).join(' · ') + ' · นับตามวันที่จ่ายจริง']);
  if (c.p3_excluded) warn.push(['info', 'ไม่รวมสัญญาบริการ (ภ.ง.ด.3) ' + c.p3_excluded + ' คน', 'นอกขอบเขตรายงานนี้']);
  var fBad = (c.filed || []).filter(function (f) { return Math.abs(f.diff.income) > 0.009 || Math.abs(f.diff.tax) > 0.009 || f.diff.count; });
  if (fBad.length) warn.push(['bad', 'ยอดยื่น ภ.ง.ด.1 จริงไม่ตรงกับระบบ (' + fBad.length + ' เดือน)', fBad.map(function (f) { return esc(f.ym) + ' · เงินได้ต่าง ' + txN(f.diff.income) + ' · ภาษีต่าง ' + txN(f.diff.tax) + (f.diff.count ? ' · จำนวนรายต่าง ' + f.diff.count : ''); }).join('<br>')]);
  var M = TX.view === 'm' ? +TX.m : 0, q = TX.q.trim();
  var rows = d.people.filter(function (x) { if (M && !(x.months[M] && (x.months[M].income || x.months[M].tax))) return false; return !q || (x.code + ' ' + x.name + ' ' + x.id_card).indexOf(q) >= 0; });
  var val = function (x, k) { return M ? (x.months[M] || {})[k] || 0 : x.total[k]; };
  var sumI = rows.reduce(function (s, x) { return s + val(x, 'income'); }, 0), sumT = rows.reduce(function (s, x) { return s + val(x, 'tax'); }, 0);
  pyBody('<div class="tools" style="flex-wrap:wrap"><select id="tx-y" aria-label="ปีภาษี">' + ys.map(function (y) { return '<option value="' + y + '"' + (String(y) === TX.year ? ' selected' : '') + '>ปีภาษี ' + txBE(y) + '</option>'; }).join('') + '</select>' +
    '<select id="tx-co" aria-label="บริษัท">' + (d.companies || []).map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === d.company.id ? ' selected' : '') + '>' + esc(x.short) + '</option>'; }).join('') + '</select>' +
    '<select id="tx-v" aria-label="มุมมอง"><option value="year">ทั้งปี (ภ.ง.ด.1ก)</option>' + TX_MON.slice(1).map(function (n, i) { return '<option value="' + (i + 1) + '"' + (TX.view === 'm' && +TX.m === i + 1 ? ' selected' : '') + '>ภ.ง.ด.1 ' + n + '</option>'; }).join('') + '</select>' +
    '<input id="tx-q" placeholder="ค้นหา รหัส ชื่อ เลขประจำตัว" value="' + esc(TX.q) + '"><span class="sp"></span>' +
    '<button class="btn" id="tx-xl">Export Excel</button><button class="btn" id="tx-p1k"' + (M ? ' disabled title="เลือกมุมมองทั้งปี"' : '') + '>PDF ภ.ง.ด.1ก + ใบแนบ</button><button class="btn" id="tx-c50all"' + (M ? ' disabled' : '') + '>50 ทวิ ทุกคน</button>' +
    '<button class="btn" id="tx-fl">ยอดยื่นจริง</button><button class="btn" id="tx-im">นำเข้าจากระบบอื่น</button><button class="btn pri" id="tx-ok">' + (d.confirmed ? 'ยืนยันรายงานใหม่' : 'ยืนยันรายงาน ภ.ง.ด.1ก') + '</button></div>' +
    '<div class="tx-ks">' + kpi('พนักงานที่มีเงินได้', d.totals.count + ' คน', 'ลาออกแล้ว ' + d.totals.resigned + ' · ไม่มีภาษีหัก ' + d.totals.notax) + kpi('เงินได้รวมทั้งบริษัท', txN(d.totals.income), d.totals.untyped ? 'ยังไม่มีประเภท ' + txN(d.totals.untyped) : 'งวดจ่ายแล้ว ' + d.paid_runs + ' งวด') +
      kpi('ภาษีหัก ณ ที่จ่ายรวม', txN(d.totals.tax), 'ประกันสังคม ' + txN(d.totals.sso)) + kpi('สถานะรายงาน', d.confirmed ? (c.edited_after ? 'ต้องยืนยันใหม่' : 'ยืนยันแล้ว') : 'ยังไม่ยืนยัน', d.confirmed ? esc(fdt(d.confirmed.at)) + ' · ' + esc(d.confirmed.hash) : esc(d.company.name || d.company.short)) + '</div>' +
    (warn.length ? '<div class="tx-w">' + warn.map(function (w) { return '<details class="tx-wi tx-' + w[0] + '"' + (w[0] === 'bad' ? ' open' : '') + '><summary>' + w[1] + '</summary><div>' + w[2] + '</div></details>'; }).join('') + '</div>' : '<div class="note-b" style="margin:10px 0">ตรวจข้อมูลผ่าน · ยอดรายเดือนรวมกันตรงกับยอดทั้งปี</div>') +
    '<section class="card"><div class="ch"><h3>' + (M ? 'ภ.ง.ด.1 เดือน' + TX_MON[M] + ' ' + txBE(TX.year) : 'ภ.ง.ด.1ก ปีภาษี ' + txBE(TX.year)) + ' · ' + esc(d.company.short) + '</h3><span class="sp"></span><span class="faint">' + rows.length + ' คน · เงินได้ ' + txN(sumI) + ' · ภาษี ' + txN(sumT) + '</span></div>' +
    '<div class="tw"><table class="py-t"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>เลขประจำตัวผู้เสียภาษี</th><th>สถานะ</th><th class="num">เงินได้</th><th class="num">ภาษีที่หัก</th><th class="num">ประกันสังคม</th><th></th></tr></thead><tbody>' +
    (rows.length ? rows.map(function (x) { var k = x.employee_id || ('code:' + x.code); return '<tr><td class="num">' + esc(x.code) + '</td><td><b>' + esc(x.name) + '</b>' + (x.src.import ? ' <span class="badge b-mute">นำเข้า</span>' : '') + (x.total.untyped ? ' <span class="badge b-warn">มียอดที่ยังไม่มีประเภท</span>' : '') + '</td><td class="num">' + (x.id_ok ? esc(x.id_card) : '<span class="badge b-bad">' + (x.id_card ? 'ไม่ถูกต้อง' : 'ไม่มี') + '</span>') + '</td><td>' + (x.status === 'resigned' ? '<span class="badge b-mute">ลาออก' + (x.end ? ' ' + esc(thd(x.end)) : '') + '</span>' : '<span class="badge b-ok">ทำงาน</span>') + '</td><td class="num">' + txN(val(x, 'income')) + '</td><td class="num">' + txN(val(x, 'tax')) + '</td><td class="num">' + txN(val(x, 'sso')) + '</td><td style="white-space:nowrap"><button class="btn sm" data-txp="' + esc(k) + '">ดูรายเดือน</button>' + (M ? '' : ' <button class="btn sm" data-txc="' + esc(k) + '">50 ทวิ</button>') + '</td></tr>'; }).join('') : '<tr><td colspan="8" class="muted" style="text-align:center;padding:24px">ไม่มีพนักงานที่ได้รับเงินในช่วงนี้ (นับเฉพาะงวดที่จ่ายแล้ว)</td></tr>') +
    '</tbody></table></div></section><div class="note-b" style="margin-top:12px">ข้อมูลจากงวดเงินเดือนสถานะ "จ่ายแล้ว" ตามวันที่จ่ายจริง · รวมพนักงานที่ลาออกและพนักงานที่ไม่มีภาษีหัก · ไม่รวมสัญญาบริการ (ภ.ง.ด.3) · เอกสารพิมพ์ลงแบบฟอร์มทางการของกรมสรรพากร (ใบแนบ ภ.ง.ด.1ก พิมพ์ ธ.ค. 2559) · ทุกการเปิดดูและออกเอกสารบันทึกใน Audit Log</div>');
  var re = function () { TX.d = null; pyTax(); };
  $('#tx-y').onchange = function () { TX.year = this.value; re(); }; $('#tx-co').onchange = function () { TX.co = this.value; re(); };
  $('#tx-v').onchange = function () { if (this.value === 'year') TX.view = 'year'; else { TX.view = 'm'; TX.m = +this.value; } txDraw(); };
  $('#tx-q').oninput = function () { TX.q = this.value; var p = this.selectionStart; txDraw(); var n = $('#tx-q'); if (n) { n.focus(); n.setSelectionRange(p, p); } };
  $$('[data-pyt2]').forEach(function (b) { b.onclick = function () { PY.tab = b.dataset.pyt2; render(); }; });
  $$('[data-txp]').forEach(function (b) { b.onclick = function () { txPerson(txFind(b.dataset.txp)); }; });
  $$('[data-txc]').forEach(function (b) { b.onclick = function () { tx50([b.dataset.txc]); }; });
  $('#tx-c50all').onclick = function () { tx50([]); };
  $('#tx-ok').onclick = txConfirm; $('#tx-fl').onclick = txFilings; $('#tx-im').onclick = txImport; $('#tx-xl').onclick = txExcel;
  $('#tx-p1k').onclick = function () { if (d.checks.block.length && !confirm('ยังมีข้อที่ต้องแก้ (' + d.checks.block.join(' · ') + ')\nพิมพ์เป็นฉบับร่างเพื่อตรวจทานหรือไม่?')) return; txPrintP1k(); };
}
function txFind(k) { return TX.d.people.filter(function (x) { return (x.employee_id || ('code:' + x.code)) === k; })[0]; }
function txPerson(x) {
  if (!x) return; var T = TX.d.types || {}, ty = Object.keys(T).filter(function (t) { return t !== 'exempt'; });
  var used = ty.filter(function (t) { return Object.keys(x.months).some(function (m) { return x.months[m].by[t]; }); });
  var head = '<tr><th>เดือน (ตามวันที่จ่าย)</th>' + used.map(function (t) { return '<th class="num" title="' + esc(T[t].name) + '">' + esc(t.replace(/_/g, ' ').replace('40 1 3p', '40(1) 3%').replace('40 1 2 out', '40(1)(2)').replace('40 1', '40(1)').replace('40 2 in', '40(2)').replace('40 2 out', '40(2) ต่างประเทศ')) + '</th>'; }).join('') + (x.total.untyped ? '<th class="num">ยังไม่มีประเภท</th>' : '') + '<th class="num">ภาษีที่หัก</th><th class="num">ประกันสังคม</th><th class="num">กองทุนสำรองฯ</th><th>งวด</th></tr>';
  var mrow = function (m) { var M = x.months[m]; if (!M) return ''; return '<tr><td>' + (m ? TX_MON[m] : 'ยอดทั้งปี (นำเข้า)') + '</td>' + used.map(function (t) { return '<td class="num">' + txN(M.by[t] || 0) + '</td>'; }).join('') + (x.total.untyped ? '<td class="num">' + txN(M.untyped) + '</td>' : '') + '<td class="num">' + txN(M.tax) + '</td><td class="num">' + txN(M.sso) + '</td><td class="num">' + txN(M.pvd) + '</td><td class="faint" style="font-size:12px">' + M.runs.map(function (r) { return r.kind === 'import' ? 'นำเข้า' : esc(r.ym) + (r.kind === 'bonus' ? ' โบนัส' : '') + ' · จ่าย ' + esc(thd(r.day)); }).join('<br>') + '</td></tr>'; };
  var ms = []; for (var m = 0; m <= 12; m++) ms.push(mrow(m));
  drawer(esc(x.code + ' ' + x.name), '<dl class="kv"><dt>เลขประจำตัวผู้เสียภาษี</dt><dd class="num">' + (esc(x.id_card) || '—') + (x.id_ok ? '' : ' <span class="badge b-bad">ตรวจไม่ผ่าน</span>') + '</dd><dt>ที่อยู่</dt><dd>' + (esc(x.address) || '<span class="badge b-warn">ไม่มี</span>') + '</dd><dt>สถานะ</dt><dd>' + (x.status === 'resigned' ? 'ลาออก ' + esc(thd(x.end)) : 'ทำงาน') + (x.start ? ' · เริ่มงาน ' + esc(thd(x.start)) : '') + '</dd></dl>' +
    '<div class="tw" style="margin-top:12px"><table class="py-t">' + head + ms.join('') + '<tr class="pg-sum"><td><b>รวมทั้งปี</b></td>' + used.map(function (t) { return '<td class="num"><b>' + txN(x.total.by[t] || 0) + '</b></td>'; }).join('') + (x.total.untyped ? '<td class="num"><b>' + txN(x.total.untyped) + '</b></td>' : '') + '<td class="num"><b>' + txN(x.total.tax) + '</b></td><td class="num"><b>' + txN(x.total.sso) + '</b></td><td class="num"><b>' + txN(x.total.pvd) + '</b></td><td></td></tr></table></div>' +
    '<p class="faint" style="font-size:12.5px">เงินได้รวม ' + txN(x.total.income) + ' · ข้อมูลจากผลคำนวณของงวดที่จ่ายแล้ว (ไม่คำนวณใหม่)</p>', '<button class="btn" id="px">ปิด</button><button class="btn pri" id="px50">50 ทวิ</button>');
  $('#px').onclick = closeD; $('#px50').onclick = function () { closeD(); tx50([x.employee_id || ('code:' + x.code)]); };
}
function txConfirm() {
  var d = TX.d; if (d.checks.block.length) { toast('ยังยืนยันไม่ได้: ' + d.checks.block.join(' · '), 1); return; }
  drawer('ยืนยันรายงาน ภ.ง.ด.1ก ปี ' + txBE(TX.year), '<p class="muted" style="margin-top:0">บันทึกภาพรวมรายงาน ณ ตอนนี้ (' + d.totals.count + ' คน · เงินได้ ' + txN(d.totals.income) + ' · ภาษี ' + txN(d.totals.tax) + ') พร้อมค่าตรวจสอบ · ถ้าข้อมูลเงินเดือนเปลี่ยนภายหลัง ระบบจะแจ้งให้ยืนยันใหม่ · ฉบับเดิมไม่ถูกลบ</p><label class="f"><span>หมายเหตุ (ไม่บังคับ)</span><textarea id="tx-nt" rows="2" maxlength="200"></textarea></label>',
    '<button class="btn" id="px">ยกเลิก</button><button class="btn pri" id="pok">ยืนยันรายงาน</button>');
  $('#px').onclick = closeD; $('#pok').onclick = function () { var b = this; busy(b, 1); aCall('payAnnualConfirm', TX.year, d.company.id, $('#tx-nt').value).then(function (r) { busy(b, 0); if (!r.ok) { toast((r.block || []).join(' · '), 1); return; } closeD(); toast('ยืนยันแล้ว · ' + r.hash); pyTax(); }).catch(function (e) { busy(b, 0); toast(e.message, 1); }); };
}
function txFilings() {
  var d = TX.d, F = {}; (d.checks.filed || []).forEach(function (f) { F[f.ym] = f; });
  var row = function (m) { var ym = TX.year + '-' + (m < 10 ? '0' : '') + m, f = F[ym] || {}, s = d.months[m - 1] || {}; return '<tr data-fym="' + ym + '"><td>' + TX_MON[m] + '</td><td class="num faint">' + (s.count || 0) + ' · ' + txN(s.income) + ' · ' + txN(s.tax) + '</td><td><input class="num" data-k="count" value="' + (f.ym ? f.count : '') + '" style="width:60px"></td><td><input class="num" data-k="income" value="' + (f.ym ? f.income : '') + '" style="width:120px"></td><td><input class="num" data-k="tax" value="' + (f.ym ? f.tax : '') + '" style="width:100px"></td><td><input data-k="filed_at" type="date" value="' + esc(f.filed_at || '') + '"></td><td><input data-k="ref" value="' + esc(f.ref || '') + '" style="width:110px" maxlength="80"></td><td><button class="btn sm" data-fsave="' + ym + '">บันทึก</button></td></tr>'; };
  var rs = []; for (var m = 1; m <= 12; m++) rs.push(row(m));
  drawer('ยอดที่ยื่น ภ.ง.ด.1 จริง · ' + esc(d.company.short) + ' ปี ' + txBE(TX.year), '<p class="muted" style="margin-top:0">กรอกตามแบบที่ยื่นกรมสรรพากรแล้ว · ระบบเทียบกับยอดจากงวดที่จ่ายแล้ว (ช่องสีจาง = ระบบ: จำนวนราย · เงินได้ · ภาษี) แล้วแจ้งเดือนที่ไม่ตรง</p><div class="tw"><table class="py-t"><thead><tr><th>เดือน</th><th class="num">ระบบ</th><th>จำนวนราย</th><th>เงินได้</th><th>ภาษี</th><th>วันที่ยื่น</th><th>เลขอ้างอิง</th><th></th></tr></thead><tbody>' + rs.join('') + '</tbody></table></div>', '<button class="btn" id="px">ปิด</button>');
  $('#px').onclick = function () { closeD(); pyTax(); };
  $$('[data-fsave]').forEach(function (b) { b.onclick = function () { var tr = b.closest('tr'), v = { ym: b.dataset.fsave, co: d.company.id }; tr.querySelectorAll('[data-k]').forEach(function (i) { v[i.dataset.k] = i.value.replace(/,/g, ''); }); busy(b, 1);
    aCall('payFilingSave', v).then(function (r) { busy(b, 0); if (!r.ok) { toast(Object.values(r.errors || {}).join(' · '), 1); return; } toast('บันทึก ' + v.ym + ' แล้ว'); }).catch(function (e) { busy(b, 0); toast(e.message, 1); }); }; });
}
/* นำเข้าจากระบบอื่น (HumanSoft ฯลฯ): ไฟล์ตัวอย่าง → ตรวจ → นำเข้า · ใช้ออกเอกสารภาษีเท่านั้น ไม่สร้างงวดเงินเดือน */
var TX_IMP_COLS = ['emp_code', 'id_card', 'name', 'month', 'tax_type', 'income', 'tax', 'sso', 'pvd'];
function txImport() {
  var d = TX.d;
  drawer('นำเข้ายอดภาษีจากระบบอื่น · ปี ' + txBE(TX.year), '<p class="muted" style="margin-top:0">ใช้กับปีที่จ่ายเงินเดือนด้วยระบบอื่น (เช่น HumanSoft) เพื่อออก ภ.ง.ด.1ก / 50 ทวิ จากระบบนี้ · <b>ไม่สร้างงวดเงินเดือน</b> · ถ้าเดือนเดียวกันมีทั้งงวดในระบบและยอดนำเข้า ระบบจะแจ้งว่าซ้ำ</p>' +
    '<p style="font-size:13px">คอลัมน์: ' + TX_IMP_COLS.join(' · ') + ' · month 1–12 หรือเว้นว่าง = ยอดทั้งปี · tax_type ใช้รหัส ' + Object.keys(d.types).map(esc).join(' / ') + '</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="ti-tpl">ไฟล์ตัวอย่าง (Excel)</button><label class="btn pri" style="position:relative">เลือกไฟล์ Excel<input type="file" id="ti-f" accept=".xlsx,.xls,.csv" class="vh"></label><input id="ti-src" value="HumanSoft" maxlength="40" style="width:140px" aria-label="ระบบต้นทาง"></div><div id="ti-res" style="margin-top:12px"></div><h4 style="margin:16px 0 6px">ชุดที่นำเข้าแล้ว</h4><div id="ti-list" class="faint">กำลังโหลด…</div>',
    '<button class="btn" id="px">ปิด</button>');
  $('#px').onclick = function () { closeD(); pyTax(); };
  var list = function () { aCall('payTaxImportList', TX.year, d.company.id).then(function (L) { $('#ti-list').innerHTML = L.length ? L.map(function (b) { return '<div class="lbox" style="margin-bottom:6px"><b style="flex:1">' + esc(b.source) + ' · ' + b.rows + ' แถว · เงินได้ ' + txN(b.income) + ' · ภาษี ' + txN(b.tax) + '<small class="faint" style="display:block">' + esc(fdt(b.at)) + '</small></b><button class="btn sm" data-tidel="' + esc(b.batch) + '" style="color:var(--bad)">ลบชุดนี้</button></div>'; }).join('') : 'ยังไม่มี';
    $$('[data-tidel]').forEach(function (x) { x.onclick = function () { var why = prompt('เหตุผลที่ลบชุดนำเข้านี้'); if (!why) return; aCall('payTaxImportDelete', x.dataset.tidel, why).then(function () { toast('ลบแล้ว'); list(); }).catch(function (e) { toast(e.message, 1); }); }; }); }); };
  list();
  $('#ti-tpl').onclick = function () { pyXlsx().then(function (X) { var ws = X.utils.aoa_to_sheet([TX_IMP_COLS, ['0001', '', '', '1', '40_1', '30000', '500', '750', '0'], ['', '1234567890123', 'นายตัวอย่าง สมมติ', '', '40_1', '360000', '6000', '9000', '0']]); var wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, 'นำเข้า'); X.writeFile(wb, 'นำเข้ายอดภาษี-ตัวอย่าง.xlsx'); }); };
  var rows = null;
  $('#ti-f').onchange = function () { var f = this.files[0]; if (!f) return; var fr = new FileReader(); fr.onload = function () { pyXlsx().then(function (X) {
    var wb = X.read(new Uint8Array(fr.result), { type: 'array' }), js = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
    rows = js.map(function (r) { var o = {}; TX_IMP_COLS.forEach(function (k) { o[k] = String(r[k] == null ? '' : r[k]).replace(/,/g, '').trim(); }); return o; });
    aCall('payTaxImport', TX.year, d.company.id, rows, false).then(function (r) {
      $('#ti-res').innerHTML = '<div class="' + (r.bad.length ? 'alert' : 'note-b') + '">ตรวจแล้ว: ใช้ได้ ' + r.good + ' แถว · ผิด ' + r.bad.length + ' แถว' + (r.bad.length ? '<br>' + r.bad.slice(0, 30).map(function (b) { return 'แถว ' + b.row + ' ' + esc(b.code || '') + ': ' + esc(b.error); }).join('<br>') : '') + '</div>' + (!r.bad.length && r.good ? '<button class="btn pri" id="ti-go" style="margin-top:8px">นำเข้า ' + r.good + ' แถว</button>' : '');
      if ($('#ti-go')) $('#ti-go').onclick = function () { var b = this; busy(b, 1); aCall('payTaxImport', TX.year, d.company.id, rows, true, $('#ti-src').value).then(function (x) { busy(b, 0); if (!x.ok) { toast('มีแถวผิด', 1); return; } toast('นำเข้าแล้ว ' + x.rows + ' แถว'); $('#ti-res').innerHTML = ''; list(); }).catch(function (e) { busy(b, 0); toast(e.message, 1); }); };
    }).catch(function (e) { toast(e.message, 1); }); }); }; fr.readAsArrayBuffer(f); this.value = ''; };
}
function txExcel() {
  var d = TX.d, T = d.types, ty = Object.keys(T).filter(function (t) { return t !== 'exempt'; });
  pyXlsx().then(function (X) {
    var wb = X.utils.book_new(), add = function (name, aoa) { X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(aoa), name); };
    add('สรุป ภ.ง.ด.1ก', [['ปีภาษี', txBE(d.year)], ['บริษัท', d.company.name || d.company.short], ['เลขประจำตัวผู้เสียภาษี', d.company.tax_id || ''], ['สถานะ', d.confirmed ? 'ยืนยันแล้ว ' + d.confirmed.at + ' · ' + d.confirmed.hash : 'ยังไม่ยืนยัน (ฉบับร่าง)'], [], ['ประเภทเงินได้', 'จำนวนราย', 'เงินได้ทั้งสิ้น', 'ภาษีที่นำส่งทั้งสิ้น']].concat(ty.map(function (t) { var b = d.by_type[t] || {}; return [T[t].name, b.count || 0, b.income || 0, b.tax || 0]; })).concat([['รวม', d.totals.count, d.totals.income, d.totals.tax]]));
    ty.forEach(function (t) { var L = d.people.filter(function (x) { return x.total.by[t]; }); if (!L.length) return; add('ใบแนบ ' + t, [['ลำดับที่', 'เลขประจำตัวผู้เสียภาษี (ผู้มีเงินได้)', 'คำนำหน้า', 'ชื่อ', 'ชื่อสกุล', 'ที่อยู่', 'จำนวนเงินได้ที่จ่ายทั้งปี', 'จำนวนเงินภาษีที่หักและนำส่งทั้งปี', 'เงื่อนไข', 'สถานะ']].concat(L.map(function (x, i) { return [i + 1, x.id_card, x.title, x.first, x.last, x.address, x.total.by[t], txShare(x, t), 1, x.status === 'resigned' ? 'ลาออก' : '']; }))); });
    add('รายเดือน (ภ.ง.ด.1)', [['รหัส', 'ชื่อ', 'เลขประจำตัว'].concat(TX_MON.slice(1).map(function (m) { return 'เงินได้ ' + m; }), TX_MON.slice(1).map(function (m) { return 'ภาษี ' + m; }), ['เงินได้รวม', 'ภาษีรวม', 'ประกันสังคม'])].concat(d.people.map(function (x) { var I = [], Tt = []; for (var m = 1; m <= 12; m++) { I.push((x.months[m] || {}).income || 0); Tt.push((x.months[m] || {}).tax || 0); } return [x.code, x.name, x.id_card].concat(I, Tt, [x.total.income, x.total.tax, x.total.sso]); })));
    add('ตรวจข้อมูล', [['หัวข้อ', 'รายละเอียด']].concat(d.checks.block.map(function (b) { return ['ต้องแก้', b]; }), d.checks.unpaid.map(function (r) { return ['งวดยังไม่จ่าย', r.ym + ' ' + r.status_name]; }), d.checks.missing.map(function (x) { return ['ข้อมูลไม่ครบ', x.code + ' ' + x.name + ' ' + [x.id_card, x.address].join(' ')]; }), d.checks.dup.map(function (x) { return ['จ่ายซ้ำ', x.code + ' ' + x.name + ' ' + x.ym]; })));
    X.writeFile(wb, 'ภาษีประจำปี-' + txBE(d.year) + '-' + d.company.short + '.xlsx');
    aCall('payTaxLog', TX.year, d.company.id, 'xlsx', d.totals.count).catch(function () {});
  });
}
function txShare(x, t) { var ts = Object.keys(x.total.by).filter(function (k) { return x.total.by[k]; }); return ts.length === 1 ? x.total.tax : Math.round(x.total.tax * x.total.by[t] / x.total.income * 100) / 100; }

/* ── พิมพ์ลงแบบฟอร์มทางการ ── */
function txForms() { return window.RD_FORMS ? Promise.resolve(window.RD_FORMS) : new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'forms/rd-fields.js?v=' + (window.BUILD || Date.now()); s.onload = function () { ok(window.RD_FORMS); }; s.onerror = function () { no(new Error('โหลดตำแหน่งช่องแบบฟอร์มไม่ได้')); }; document.head.appendChild(s); }); }
/* หน้า 1 แผ่น: ภาพแบบฟอร์ม + ข้อความวางตามช่อง · v = {ชื่อช่อง: ค่า} · ช่องกล่อง (comb) วางทีละตัวอักษร · ช่องเลือก = ✓ */
function txPage(F, k, v) {
  var f = F[k], pw = f.w, ph = f.h, bg = new URL('forms/rd-' + k + '.png', location.href).href, h = '';
  Object.keys(v).forEach(function (name) {
    var val = v[name]; if (val === '' || val == null || val === false) return; var r = f.f[name]; if (!r) return;
    var L = function (x, y, w, hh) { return 'left:' + (x / pw * 100) + '%;top:' + (y / ph * 100) + '%;width:' + (w / pw * 100) + '%;height:' + (hh / ph * 100) + '%'; };
    if (r[5] === 'C' || r[5] === 'R') { h += '<i class="ck" style="' + L(r[0], r[1], r[2], r[3]) + '">✓</i>'; return; }
    var s = String(val);
    if (r[4] > 0) { var cw = r[2] / r[4]; s.split('').slice(0, r[4]).forEach(function (ch, i) { if (ch === '-' || ch === ' ') return; h += '<i class="cb" style="' + L(r[0] + cw * i, r[1], cw, r[3]) + '">' + esc(ch) + '</i>'; }); return; }
    var mm = /^(-?[\d,]+)\.(\d{2})$/.exec(s);
    if (mm && r[6]) { var dv = r[6]; h += '<i class="tx" style="' + L(r[0], r[1], dv - r[0] - 1, r[3]) + ';text-align:right">' + esc(mm[1]) + '</i><i class="cb" style="' + L(dv, r[1], r[0] + r[2] - dv, r[3]) + '">' + mm[2] + '</i>'; return; }   // บาท | สตางค์ แยกตามเส้นในแบบฟอร์ม
    var al = /^[\d,.\-]+$/.test(s) && r[2] < 140 ? 'right' : 'left';
    h += '<i class="tx" style="' + L(r[0], r[1], r[2], r[3]) + ';text-align:' + al + ';font-size:' + Math.max(6, Math.min(11, r[3] * 0.72)) / pw * 100 + 'vw">' + esc(s) + '</i>';
  });
  return '<section class="pg ' + (pw > ph ? 'land' : 'port') + '"><img src="' + bg + '" alt="">' + h + '</section>';
}
function txPrint(title, pages) {
  var html = '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500&display=swap" rel="stylesheet"><style>' +
    '@page port{size:A4 portrait;margin:0}@page land{size:A4 landscape;margin:0}body{margin:0;font-family:"IBM Plex Sans Thai",sans-serif;color:#0a2a8a}' +
    '.pg{position:relative;overflow:hidden;page-break-after:always;break-after:page}.pg.port{page:port;width:210mm;height:297mm}.pg.land{page:land;width:297mm;height:210mm}.pg img{position:absolute;inset:0;width:100%;height:100%}' +
    '.pg i{position:absolute;font-style:normal;display:flex;align-items:center;white-space:nowrap;overflow:hidden;line-height:1}.pg i.tx{padding:0 2px;font-size:9.5pt}.pg.land i.tx{font-size:8.5pt}.pg i.tx[style*="text-align:right"]{justify-content:flex-end}.pg i.cb{justify-content:center;font-size:9pt}.pg i.ck{justify-content:center;font-size:10pt;font-weight:600}' +
    '</style></head><body>' + pages.join('') + '</body></html>';
  html = html.replace(/font-size:[\d.]+vw/g, '');   // ใช้ขนาดตัวอักษรคงที่ตามชนิดหน้า
  var fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(fr); var dc = fr.contentWindow.document; dc.open(); dc.write(html); dc.close();
  var go = function () { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { toast('พิมพ์ไม่ได้: ' + e.message, 1); } setTimeout(function () { fr.remove(); }, 60000); };
  var imgs = Array.prototype.slice.call(dc.images); Promise.all([(dc.fonts && dc.fonts.ready) || Promise.resolve()].concat(imgs.map(function (im) { return im.complete ? 1 : new Promise(function (ok) { im.onload = im.onerror = ok; }); }))).then(function () { setTimeout(go, 300); });
  toast('เลือก "บันทึกเป็น PDF" ในหน้าต่างพิมพ์');
}
function txTin(s) { s = String(s || '').replace(/\D/g, ''); return s.length === 13 ? s[0] + '-' + s.slice(1, 5) + '-' + s.slice(5, 10) + '-' + s.slice(10, 12) + '-' + s[12] : s; }
function txBranch(c) { var b = String(c.branch || ''); return /^\d{1,5}$/.test(b) ? ('00000' + b).slice(-5) : '00000'; }   // สำนักงานใหญ่ = 00000
function txPrintP1k() {
  var d = TX.d, C = d.company, T = d.types;
  txForms().then(function (F) {
    var pages = [], ty = Object.keys(T).filter(function (t) { return t !== 'exempt'; }), sheets = 0, att = [];
    ty.forEach(function (t) {
      var L = d.people.filter(function (x) { return x.total.by[t]; }); if (!L.length) return; var n = Math.ceil(L.length / 7);
      for (var s = 0; s < n; s++) {
        var v = { 'Text1.0': txTin(C.tax_id), 'Text1.1': txBranch(C), 'Text1.2': String(s + 1), 'Text1.3': String(n) }; v['Radio Button0=' + T[t].att] = 1; var si = 0, st = 0;
        L.slice(s * 7, s * 7 + 7).forEach(function (x, j) { var r = j + 1, P = r === 1 ? { seq: '1.4', id: '1.5', fn: '1.6', ln: '1.7', inc: '1.8', tax: '1.9', cd: '1.10', ad: '1.11' } : { seq: r + '.1', id: r + '.2', fn: r + '.3', ln: r + '.4', inc: r + '.5', tax: r + '.6', cd: r + '.7', ad: r + '.8' }, inc = x.total.by[t], tx = txShare(x, t);
          v['Text' + P.seq] = String(s * 7 + j + 1); v['Text' + P.id] = txTin(x.id_card); v['Text' + P.fn] = ((x.title || '') + (x.first || x.name)).trim(); v['Text' + P.ln] = x.last || ''; v['Text' + P.inc] = txN(inc); v['Text' + P.tax] = txN(tx); v['Text' + P.cd] = '1'; v['Text' + P.ad] = x.address || ''; si += inc; st += tx; });
        v['Text8.6'] = txN(si); v['Text8.7'] = txN(st); att.push(txPage(F, 'p1ka', v)); sheets++;
      }
    });
    var m = { 'Text1.0': txTin(C.tax_id), 'Text1.1': txBranch(C), 'Text1.2': C.name || C.short, 'Text1.17': txBE(d.year), 'Radio Button0=0': 1, 'Radio Button2=Yes': 1, 'Text1.19': String(sheets) };
    var R = { '40_1': ['2.1', '2.2', '2.3'], '40_1_3p': ['2.6', '2.7', '2.8'], '40_1_2_out': ['2.9', '2.10', '2.11'], '40_2_in': ['2.12', '2.13', '2.14'], '40_2_out': ['2.15', '2.16', '2.17'] };
    ty.forEach(function (t) { var b = d.by_type[t]; if (!b || !b.count) return; m['Text' + R[t][0]] = String(b.count); m['Text' + R[t][1]] = txN(b.income); m['Text' + R[t][2]] = txN(b.tax); });
    m['Text2.18'] = String(d.totals.count); m['Text2.19'] = txN(d.totals.income); m['Text2.20'] = txN(d.totals.tax);
    pages.push(txPage(F, 'p1k', m)); txPrint('ภ.ง.ด.1ก ' + txBE(d.year) + ' ' + C.short + (d.confirmed && !d.checks.edited_after ? '' : ' (ฉบับร่าง)'), pages.concat(att));
    aCall('payTaxLog', TX.year, d.company.id, 'p1k', d.totals.count).catch(function () {});
  }).catch(function (e) { toast(e.message, 1); });
}
/* 50 ทวิ: ids ว่าง = ทุกคน · ตัวอย่างก่อน แล้วกด "ออกเลขที่และพิมพ์" (ต้องยืนยันรายงานก่อน) */
function tx50(ids) {
  var d = TX.d;
  aCall('pay50', TX.year, d.company.id, ids, false).then(function (r) {
    if (!r.ok) { toast((r.block || []).join(' · '), 1); return; }
    var can = d.confirmed && !d.checks.edited_after;
    drawer('หนังสือรับรอง 50 ทวิ · ' + r.docs.length + ' ฉบับ', '<p class="muted" style="margin-top:0">พิมพ์ลงแบบฟอร์มทางการของกรมสรรพากร (ฉบับที่ 1 และ 2) · ออกเลขที่ต่อเนื่อง เล่มที่ = ปี พ.ศ. · ออกซ้ำ = ฉบับใหม่ ฉบับเดิมยังเก็บในประวัติ</p>' + (can ? '' : '<div class="alert">ยังออกเลขที่จริงไม่ได้: ' + (d.confirmed ? 'ข้อมูลเปลี่ยนหลังยืนยัน · ยืนยันรายงานใหม่ก่อน' : 'ยืนยันรายงาน ภ.ง.ด.1ก ก่อน') + ' · พิมพ์ฉบับร่างเพื่อตรวจทานได้</div>') +
      '<div class="tw"><table class="py-t"><thead><tr><th>รหัส</th><th>ชื่อ</th><th class="num">เงินได้ 40(1)</th><th class="num">40(2)</th><th class="num">ภาษี</th><th class="num">ประกันสังคม</th></tr></thead><tbody>' + r.docs.slice(0, 200).map(function (x) { return '<tr><td>' + esc(x.code) + '</td><td>' + esc(x.name) + (x.status === 'resigned' ? ' <span class="badge b-mute">ลาออก</span>' : '') + '</td><td class="num">' + txN(x.r1.pay) + '</td><td class="num">' + txN(x.r2.pay) + '</td><td class="num">' + txN(x.total.tax) + '</td><td class="num">' + txN(x.sso) + '</td></tr>'; }).join('') + '</tbody></table></div><label class="f" style="margin-top:10px"><span>วันที่ออกหนังสือรับรอง</span><input type="date" id="c50-dt" value="' + new Date().toISOString().slice(0, 10) + '"></label>',
      '<button class="btn" id="px">ปิด</button><button class="btn" id="pdr">พิมพ์ฉบับร่าง</button><button class="btn pri" id="pis"' + (can ? '' : ' disabled') + '>ออกเลขที่และพิมพ์</button>');
    $('#px').onclick = closeD; $('#pdr').onclick = function () { tx50Print(r, $('#c50-dt').value, true); };
    $('#pis').onclick = function () { var b = this, dt = $('#c50-dt').value; busy(b, 1); aCall('pay50', TX.year, d.company.id, ids, true).then(function (x) { busy(b, 0); if (!x.ok) { toast((x.block || []).join(' · '), 1); return; } closeD(); toast('ออกแล้ว ' + x.docs.length + ' ฉบับ'); tx50Print(x, dt, false); }).catch(function (e) { busy(b, 0); toast(e.message, 1); }); };
  }).catch(function (e) { toast(e.message, 1); });
}
function tx50Print(r, dt, draft) {
  var C = r.company; dt = /^\d{4}-\d{2}-\d{2}$/.test(dt || '') ? dt : new Date().toISOString().slice(0, 10);
  txForms().then(function (F) {
    var pages = [];
    r.docs.forEach(function (x) {
      var v = { book_no: draft ? '' : x.book, run_no: draft ? 'ร่าง' : x.no, id1: txTin(C.tax_id), name1: C.name || C.short, add1: C.address || '', id1_2: txTin(x.id_card), name2: x.name, add2: x.address || '', item: String(x.seq || ''), chk1: 1,
        date1: x.r1.pay ? txBE(r.year) : '', 'pay1.0': x.r1.pay ? txN(x.r1.pay) : '', 'tax1.0': x.r1.pay ? txN(x.r1.tax) : '', date2: x.r2.pay ? txBE(r.year) : '', 'pay1.1': x.r2.pay ? txN(x.r2.pay) : '', 'tax1.1': x.r2.pay ? txN(x.r2.tax) : '',
        'pay1.14': txN(x.total.pay), 'tax1.14': txN(x.total.tax), total: txBaht(x.total.tax), 'Text1.0.1': x.sso ? txN(x.sso) : '', 'Text1.1.0': x.pvd ? txN(x.pvd) : '', chk8: 1, date_pay: String(+dt.slice(8, 10)), month_pay: TX_MON[+dt.slice(5, 7)], year_pay: txBE(dt.slice(0, 4)) };
      pages.push(txPage(F, 'c50', v), txPage(F, 'c50', v));   // ฉบับที่ 1 + 2
    });
    txPrint('50 ทวิ ' + txBE(r.year) + ' ' + C.short + (draft ? ' (ฉบับร่าง)' : ''), pages); if (draft) aCall('payTaxLog', String(r.year), C.id, 'c50_draft', r.docs.length).catch(function () {});
  }).catch(function (e) { toast(e.message, 1); });
}
/* จำนวนเงินเป็นตัวอักษรไทย (บาท สตางค์) */
function txBaht(n) {
  n = Math.round((Number(n) || 0) * 100) / 100; if (!n) return 'ศูนย์บาทถ้วน';
  var D = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'], P = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  var rd = function (s) { var o = '', L = s.length; for (var i = 0; i < L; i++) { var x = +s[i], p = L - i - 1; if (!x) continue; if (p === 0 && x === 1 && L > 1) o += 'เอ็ด'; else if (p === 1 && x === 2) o += 'ยี่'; else if (p === 1 && x === 1) o += ''; else o += D[x]; o += P[p]; } return o; };
  var w = function (s) { s = s.replace(/^0+/, '') || '0'; if (s === '0') return ''; var o = ''; while (s.length > 6) { var hd = s.slice(0, s.length - 6); o += rd(hd) + 'ล้าน'; s = s.slice(s.length - 6).replace(/^0+/, ''); if (!s) return o; } return o + rd(s); };
  var b = Math.floor(n), st = Math.round((n - b) * 100);
  return (b ? w(String(b)) + 'บาท' : '') + (st ? w(String(st)) + 'สตางค์' : 'ถ้วน');
}
