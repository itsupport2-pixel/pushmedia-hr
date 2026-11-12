/* สลับภาษาหน้านโยบาย · แยกจาก privacy.html เพื่อให้ CSP ปิดสคริปต์ฝังหน้า (7 พ.ย. 2569) */
(function(){var b=document.body,set=function(l){b.classList.toggle('en',l==='en');document.documentElement.lang=l;document.querySelectorAll('[data-set]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.set===l)});try{localStorage.setItem('pmhr_lang',l)}catch(e){}};
var q=new URLSearchParams(location.search).get('lang'),s;try{s=localStorage.getItem('pmhr_lang')}catch(e){}set(q==='en'||q==='th'?q:(s==='en'?'en':'th'));
document.querySelectorAll('[data-set]').forEach(function(x){x.onclick=function(){set(x.dataset.set)}});
/* ปุ่มกลับ (12 พ.ย. 2569 · หน้าจอโฮมไม่มีปุ่มกลับของเบราว์เซอร์/LINE): มีหน้าก่อน = ย้อนกลับ · ไม่มี (เปิดลิงก์ตรง) = ไปหน้าแอป */
var bk=document.querySelector('[data-back]');if(bk)bk.onclick=function(e){if(history.length>1&&document.referrer&&new URL(document.referrer).origin===location.origin){e.preventDefault();history.back()}}})();
