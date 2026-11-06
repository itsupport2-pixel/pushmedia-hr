/* หน้าแรก = Endpoint URL ของ LINE MINI App · เปิดจาก LINE (หรือมีพารามิเตอร์ของ LIFF/ลิงก์เชิญ) → แอปพนักงาน · เปิดจากคอม/เบราว์เซอร์ → หน้าหลังบ้าน */
(function () {
  var q = location.search, ua = navigator.userAgent;
  var inLine = / Line\//i.test(ua) || /liff|LIFF/.test(ua) || /[?&](liff\.state|invite|code|liffClientId)=/.test(q);
  location.replace((inLine ? 'liff.html' : 'admin.html') + q + location.hash);
})();
