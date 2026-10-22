/* Push Media HR · ค่าระบบจริง (GitHub Pages) · LINE MINI App "Push Media HR" (Provider 2004436385)
 * แต่ละช่องตั้ง Endpoint URL ต่างกันเล็กน้อย เพื่อให้หน้าเว็บรู้ว่าเปิดมาจากช่องไหน แล้วใช้ LIFF ID ให้ตรง:
 *   Developing → https://itsupport2-pixel.github.io/pushmedia-hr/            (ค่าเริ่มต้น · เปิดได้เฉพาะ Admin/Tester)
 *   Published  → https://itsupport2-pixel.github.io/pushmedia-hr/?ch=pub     (สำหรับพนักงานทุกคน)
 * จำช่องล่าสุดไว้ในเครื่อง (ตอน LINE login แล้วกลับมา พารามิเตอร์อาจหาย) */
(function () {
  var IDS = { dev: '2012151622-Z47Zaz4B', pub: '2012151624-SdlUS0FT' };
  var BY_CHANNEL = { '2012151622': 'dev', '2012151624': 'pub' };
  var q = new URLSearchParams(location.search), ch = q.get('ch');
  if (!ch && q.get('liffClientId')) ch = BY_CHANNEL[q.get('liffClientId')];
  if (!ch) { var st = q.get('liff.state') || ''; if (/[?&]ch=pub\b/.test(decodeURIComponent(st))) ch = 'pub'; }
  try { if (ch && IDS[ch]) localStorage.setItem('pmhr_ch', ch); else ch = localStorage.getItem('pmhr_ch'); } catch (e) {}
  if (!IDS[ch]) ch = 'dev';
  window.HR_CONFIG = {
    api: 'https://script.google.com/macros/s/AKfycbyi-htjhk6Y17o51CDP6u3RpK4lmtilVEtQjHWEs7XC1MQml69jXL5bQPhWHyqtrYNc/exec',
    liffId: IDS[ch], channel: ch
  };
})();
