/* หน้ากำลังโหลดแบบโครงหน้า (7 พ.ย. 2569 · Figma หน้า 20 แบบ B): ไฟล์เล็ก โหลดก่อนไฟล์ระบบ จึงขึ้นได้เร็ว
 * แสดงเฉพาะคนที่เคยเข้าระบบในเครื่องนี้ · คนที่ยังไม่เข้าระบบจะไม่เห็นโครงหน้าแวบก่อนหน้าเข้าสู่ระบบ
 * โครงหน้าไม่มีข้อมูลพนักงาน · โหลดนาน 8 วินาทีแจ้งให้รอ · 30 วินาทีมีปุ่มลองใหม่ (data-reload ใน sec-boot.js) */
(function () {
  var has = false;
  try { has = !!localStorage.getItem('hr_tok') || Object.keys(localStorage).some(function (k) { return /^pmhr_.*_tok$/.test(k) && localStorage.getItem(k) !== 'null'; }); } catch (e) {}
  var n = function (t) { var s = ''; for (var i = 0; i < t; i++) s += i; return s.split(''); };
  var sk = function (w, h, cls) { return '<span class="bsk' + (cls ? ' ' + cls : '') + '" style="width:' + w + ';height:' + h + 'px"></span>'; };
  var row = function () { return '<div class="sk-row">' + sk('30px', 30, 'rd') + '<div class="sk-col">' + sk('150px', 10) + sk('90px', 8) + '</div></div>'; };
  var msg = '<div class="sk-msg" role="status" aria-live="polite"><span class="sk-t">กำลังโหลด</span></div>';
  window.pmSkAdmin = function () {
    return '<div class="boot-sk sk-admin" id="boot-sk" aria-busy="true"><aside class="sk-nav">' + n(9).map(function () { return '<div class="sk-ni">' + sk('22px', 22, 'dk') + sk('36px', 6, 'dk') + '</div>'; }).join('') + '</aside>' +
      '<div class="sk-main"><header class="sk-top"><img src="push-media-logo-black.svg" alt="" height="26"><span class="sk-g"></span>' + sk('180px', 30, 'sk-hide') + sk('30px', 30, 'rd') + '</header>' +
      '<div class="sk-body">' + sk('230px', 20) + sk('160px', 10) + '<div class="sk-kpis">' + n(4).map(function () { return '<div class="sk-kpi">' + sk('70px', 10) + sk('100px', 20) + sk('70%', 8) + '</div>'; }).join('') + '</div>' +
      '<div class="sk-card">' + n(7).map(row).join('') + '</div>' + msg + '</div></div></div>';
  };
  window.pmSkAppBody = function () {
    return '<div class="sk-app"><div class="sk-ph"><div class="sk-who">' + sk('46px', 46, 'rd') + '<div class="sk-col">' + sk('150px', 12) + sk('90px', 9) + '</div></div>' +
      '<div class="sk-quick">' + n(5).map(function () { return '<div class="sk-ni">' + sk('26px', 26) + sk('42px', 7) + '</div>'; }).join('') + '</div></div>' +
      '<div class="sk-abody">' + sk('120px', 13) + '<div class="sk-card sk-pad">' + sk('90px', 24) + sk('86%', 10) + sk('64%', 10) + '</div><div class="sk-card">' + n(3).map(row).join('') + '</div>' + msg + '</div></div>';
  };
  window.pmSkApp = function () { return '<div class="view boot-sk" id="boot-sk" aria-busy="true">' + window.pmSkAppBody() + '</div>'; };
  window.pmSkWatch = function () {
    clearTimeout(window.pmSkT1); clearTimeout(window.pmSkT2);
    var set = function (h) { var m = document.querySelector('#boot-sk .sk-msg'); if (m) { m.classList.add('on'); m.innerHTML = h; } };
    window.pmSkT1 = setTimeout(function () { set('<b>ใช้เวลานานกว่าปกติ</b><span>กำลังโหลดต่อ ไม่ต้องปิดหน้านี้</span>'); }, 8000);
    window.pmSkT2 = setTimeout(function () { set('<b>โหลดนานผิดปกติ</b><span>ตรวจอินเทอร์เน็ต แล้วกดลองใหม่</span><button type="button" class="sk-btn" data-reload>ลองใหม่</button>'); }, 30000);
  };
  var a = document.getElementById('app'), v = document.getElementById('views');
  if (has && a) { a.innerHTML = window.pmSkAdmin(); window.pmSkWatch(); }
  else if (has && v) { v.innerHTML = window.pmSkApp(); window.pmSkWatch(); }
})();
