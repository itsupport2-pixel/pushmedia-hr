/* Push Media HR · ค่าระบบจริง (GitHub Pages) · LINE MINI App "Push Media HR" (Provider 2004436385)
 * แต่ละช่องตั้ง Endpoint URL ต่างกันเล็กน้อย เพื่อให้หน้าเว็บรู้ว่าเปิดมาจากช่องไหน แล้วใช้ LIFF ID ให้ตรง:
 *   Developing → https://itsupport2-pixel.github.io/pushmedia-hr/            (ค่าเริ่มต้น · เปิดได้เฉพาะ Admin/Tester)
 *   Published  → https://itsupport2-pixel.github.io/pushmedia-hr/?ch=pub     (สำหรับพนักงานทุกคน)
 * จำช่องล่าสุดไว้ในเครื่อง (ตอน LINE login แล้วกลับมา พารามิเตอร์อาจหาย)
 * หลังบ้าน: Cloudflare Workers + D1 (ย้ายระบบ 24 ต.ค. 2569) · Apps Script เดิมหยุดรับคำสั่งแล้ว (ชีตเป็นสำเนา)
 * ถอยกลับ: เปลี่ยน DEFAULT_BE เป็น 'gas' หลังรัน cutoverRollback ใน Apps Script */
(function () {
  // login = ช่อง LINE Login สำรอง (LIFF ธรรมดา) ใช้เมื่อ MINI App ใช้ไม่ได้ · ใส่ LIFF ID + Channel ID เมื่อสร้างช่องแล้ว (ดู LINE-FALLBACK.md)
  var IDS = { dev: '2012151622-Z47Zaz4B', pub: '2012151624-SdlUS0FT', login: '2012235420-HusTQ3rY' };   // login = ช่อง LINE Login 2012235420 LIFF "Push Media Center"
  var BY_CHANNEL = { '2012151622': 'dev', '2012151624': 'pub', '2012235420': 'login' };
  var API = {
    gas: 'https://script.google.com/macros/s/AKfycbyi-htjhk6Y17o51CDP6u3RpK4lmtilVEtQjHWEs7XC1MQml69jXL5bQPhWHyqtrYNc/exec',
    cf: 'https://pushmedia-hr-api.itsupport2-3a4.workers.dev'
  };
  var DEFAULT_BE = 'cf';
  var q = new URLSearchParams(location.search), ch = q.get('ch'), st = decodeURIComponent(q.get('liff.state') || ''), be = q.get('be');
  if (!ch && q.get('liffClientId')) ch = BY_CHANNEL[q.get('liffClientId')];
  if (!ch) { var mc = /[?&]ch=(pub|login)\b/.exec(st); if (mc) ch = mc[1]; }
  if (!be) { var m = /[?&]be=(cf|gas)\b/.exec(st); if (m) be = m[1]; }
  try { if (ch && IDS[ch]) localStorage.setItem('pmhr_ch', ch); else ch = localStorage.getItem('pmhr_ch'); } catch (e) {}
  try { localStorage.removeItem('pmhr_be'); } catch (e) {}   // เลิกจำหลังบ้านจากช่วงทดลอง (ทุกคนใช้ค่าเริ่มต้น)
  if (!IDS[ch]) ch = 'dev';
  // หน้าหลังบ้านบนเบราว์เซอร์ (30 ต.ค. 2569): ปุ่มเข้าด้วย LINE ใช้ LIFF ของช่อง LINE Login 2012235420 (Published) · Endpoint = admin.html
  // เดิมใช้ช่อง Developing 2012151622 → เข้าได้เฉพาะ Admin ของช่อง (คนอื่นขึ้น 400 "developing status")
  var WEB_ADMIN_LIFF = '2012235420-8QQjOo7S', isAdminPage = /\/admin\.html$/.test(location.pathname);
  if (!API[be]) be = DEFAULT_BE;
  // หลังบ้านโหมดสำรอง (ดูอย่างเดียว · 26 ต.ค. 2569): Cloudflare ขัดข้อง → admin.html ตั้ง pmhr_failover แล้วโหลดใหม่ → ใช้ Apps Script + สำเนา Google Sheets
  var fo = false; try { fo = sessionStorage.getItem('pmhr_failover') === '1'; } catch (e) {}
  if (fo) be = 'gas';
  var GOOGLE_CLIENT_ID = '902459045498-tnh7v08k557koh0flhds23hs5mg69r4h.apps.googleusercontent.com';   // Google Cloud โครงการ pushmedia-hr · ปุ่มเข้าสู่ระบบด้วย Google (ไม่ใช่ค่าลับ)
  // backup = ระบบสำรองการลงเวลา (Apps Script) ใช้เมื่อ Cloudflare ขัดข้อง · 26 ต.ค. 2569
  window.HR_CONFIG = { api: API[be], liffId: isAdminPage ? WEB_ADMIN_LIFF : IDS[ch], channel: ch, backend: be, googleClientId: GOOGLE_CLIENT_ID, backup: be === 'cf' ? API.gas : '',
    adminBackup: API.gas, primary: API.cf, failover: fo };
})();
