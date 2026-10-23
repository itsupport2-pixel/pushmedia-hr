/* Push Media HR · ค่าระบบจริง (GitHub Pages) · LINE MINI App "Push Media HR" (Provider 2004436385)
 * แต่ละช่องตั้ง Endpoint URL ต่างกันเล็กน้อย เพื่อให้หน้าเว็บรู้ว่าเปิดมาจากช่องไหน แล้วใช้ LIFF ID ให้ตรง:
 *   Developing → https://itsupport2-pixel.github.io/pushmedia-hr/            (ค่าเริ่มต้น · เปิดได้เฉพาะ Admin/Tester)
 *   Published  → https://itsupport2-pixel.github.io/pushmedia-hr/?ch=pub     (สำหรับพนักงานทุกคน)
 * จำช่องล่าสุดไว้ในเครื่อง (ตอน LINE login แล้วกลับมา พารามิเตอร์อาจหาย)
 * หลังบ้าน 2 เวอร์ชัน (ช่วงทดลองคู่ขนาน): ค่าเริ่มต้น = Apps Script เดิม · เปิดด้วย ?be=cf = เวอร์ชัน Cloudflare (จำในเครื่อง) · ?be=gas = กลับเวอร์ชันเดิม */
(function () {
  var IDS = { dev: '2012151622-Z47Zaz4B', pub: '2012151624-SdlUS0FT' };
  var BY_CHANNEL = { '2012151622': 'dev', '2012151624': 'pub' };
  var API = {
    gas: 'https://script.google.com/macros/s/AKfycbyi-htjhk6Y17o51CDP6u3RpK4lmtilVEtQjHWEs7XC1MQml69jXL5bQPhWHyqtrYNc/exec',
    cf: 'https://pushmedia-hr-api.itsupport2-3a4.workers.dev'
  };
  var q = new URLSearchParams(location.search), ch = q.get('ch'), st = decodeURIComponent(q.get('liff.state') || ''), be = q.get('be');
  if (!ch && q.get('liffClientId')) ch = BY_CHANNEL[q.get('liffClientId')];
  if (!ch && /[?&]ch=pub\b/.test(st)) ch = 'pub';
  if (!be) { var m = /[?&]be=(cf|gas)\b/.exec(st); if (m) be = m[1]; }
  try { if (ch && IDS[ch]) localStorage.setItem('pmhr_ch', ch); else ch = localStorage.getItem('pmhr_ch'); } catch (e) {}
  try { if (be && API[be]) localStorage.setItem('pmhr_be', be); else be = localStorage.getItem('pmhr_be'); } catch (e) {}
  if (!IDS[ch]) ch = 'dev';
  if (!API[be] || !/^https:\/\//.test(API[be])) be = 'gas';
  window.HR_CONFIG = { api: API[be], liffId: IDS[ch], channel: ch, backend: be };
  // ป้ายเล็กมุมจอ ให้คนทดลองรู้ว่ากำลังใช้หลังบ้านเวอร์ชันใหม่ (ข้อมูลช่วงทดลองไม่ใช่ข้อมูลจริง)
  if (be === 'cf') document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div'); b.textContent = 'ระบบใหม่ (ทดลอง)';
    b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;background:#2F6FDB;color:#fff;font:600 11px/1 sans-serif;padding:5px 8px;border-radius:99px;opacity:.85;pointer-events:none';
    document.body.appendChild(b);
  });
})();
