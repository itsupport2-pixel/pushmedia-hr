/* หน้าแรก = Endpoint URL ของ LINE MINI App · เปิดจาก LINE (หรือมีพารามิเตอร์ของ LIFF/ลิงก์เชิญ) → แอปพนักงาน · เปิดจากคอม/เบราว์เซอร์ → หน้าหลังบ้าน */
(function () {
  var q = location.search, ua = navigator.userAgent;
  var inLine = / Line\//i.test(ua) || /liff|LIFF/.test(ua) || /[?&](liff\.state|invite|code|liffClientId)=/.test(q);
  // 10 พ.ย. 2569 ผู้ใช้ขอ: มือถือที่เปิดนอก LINE (Safari/Chrome · กดลิงก์จากข้อความ) → เปิดแอป LINE ที่แอปพนักงาน (LIFF ช่อง LINE Login 2012235420)
  // เฉพาะโดเมนจริง · คอมยังเข้าหลังบ้านเหมือนเดิม · HR ที่จะใช้หลังบ้านบนมือถือ เข้า pct.push.co.th/admin.html ตรง ๆ (หรือ ?web=1)
  var mob = /iPhone|iPad|iPod|Android/i.test(ua), LIFF = 'https://liff.line.me/2012235420-HusTQ3rY';
  if (!inLine && mob && location.hostname === 'pct.push.co.th' && !/[?&]web=1\b/.test(q)) { location.replace(LIFF); return; }
  location.replace((inLine ? 'liff.html' : 'admin.html') + q + location.hash);
})();
