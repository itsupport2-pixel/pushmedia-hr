/* แอปพนักงาน · ดีไซน์ใหม่ (Figma หน้า 22 · 10 พ.ย. 2569) · โหลดหลัง liff-leave.js
 * แทนที่เฉพาะหน้าที่โครงสร้างเปลี่ยน: โควตาการลา (ตัดการ์ดสรุปดำตามที่ผู้ใช้สั่ง) · รายละเอียดทรัพย์สิน (รูปใหญ่แบบเดิม) · การแจ้งเตือนว่าง
 * หน้าอื่นเปลี่ยนแค่หน้าตา (liff-v2.css) · ถอยกลับ: เอา <script liff-v2.js> + <link liff-v2.css> ออกจาก liff.html */
/* เปิดในแอป LINE → ซ่อนแถบชื่อหน้า (ใช้หัวของ LINE) */
if(/\bLine\//i.test(navigator.userAgent)||(window.liff&&liff.isInClient&&liff.isInClient()))document.documentElement.classList.add('in-line');
/* เปิดจากไอคอนบนหน้าจอโฮม (12 พ.ย. 2569): เว้นพื้นที่ใต้แถบเวลา/แบตเตอรี่ ไม่ให้เนื้อหาไปอยู่ใต้แถบ (iPhone ทำเอฟเฟกต์เบลอทับ) */
try{if(navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))document.documentElement.classList.add('standalone')}catch(e){}
Object.assign(P,{
  cam:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.5" r="3.2"/>',
  beach:'<path d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8zM12 12v8M8.5 20h7"/>',
  plus:'<path d="M12 6v12M6 12h12"/><rect x="3.5" y="3.5" width="17" height="17" rx="4"/>',
  bag:'<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17"/>',
  tag:'<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.3"/>',
  tool:'<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.8 8.8a2 2 0 0 1-2.8-2.8l8.8-8.8a4 4 0 0 0-2.2-2.2z"/>',
  barcode:'<path d="M4 6v12M7 6v12M10.5 6v12M13 6v12M16.5 6v12M20 6v12"/>'
});
/* โควตาการลา: ไอคอนตามประเภท · ตัวเลขคงเหลือใหญ่ · แถบสีดำ = วันคงเหลือ (ตาม Figma) · ส้ม = รออนุมัติ (จองไว้) */
const QIC=q=>{const n=String(q.name||"");return /พักร้อน|พักผ่อน/.test(n)?["beach","#FFF5E3","#D9921F"]:/ป่วย/.test(n)?["plus","#FDECEC","#D64545"]:/กิจ/.test(n)?["bag","#EEEFFC","#5A5FD6"]:["cal","#F2F2F2","#3A3A3A"]};
V.quota=()=>{const i=L.info;if(!i)return band("โควตาการลา")+loadingV();
  return band("โควตาการลา")+`<div class="pad" style="gap:12px">${i.types.map(q=>{const c=QIC(q),lf=q.quota?Math.max(0,Math.min(100,q.left/q.quota*100)):0,r=q.quota?Math.min(100-lf,q.reserved/q.quota*100):0;
    return `<div class="qv2"><div class="t"><span class="ti" style="background:${c[1]};color:${c[2]}">${ic(c[0])}</span><span class="nm"><b>${esc(q.name)}</b><span>ใช้แล้ว ${nd(q.used)}</span></span><span class="n">${q.quota==null?'ไม่จำกัด':`${nd(q.left).replace(/\s*วัน$/,"")}<small>/ ${q.quota} วัน</small>`}</span></div>${q.quota?`<div class="bar"><i style="width:${lf}%"></i><i class="r" style="width:${r}%"></i></div>`:""}${q.reserved?`<span class="rs">รออนุมัติ ${nd(q.reserved)} · จองไว้แล้ว</span>`:""}</div>`}).join("")}
  <button class="qlink" data-act="go:myreqs">${ic("docOk")}ดูคำขอลาของฉัน<span class="chev">${ic("chevR")}</span></button></div>`};
/* รายละเอียดทรัพย์สิน: การ์ดหัว (รูปใหญ่ · ชื่อ · สถานะ · รหัส) + รายการพร้อมไอคอน + แจ้งชำรุด/สูญหาย */
V.adet=id=>{const a=(S.as||[]).find(x=>x.id===id);if(!a)return band("รายละเอียดทรัพย์สิน")+`<div class="pad"><div class="empty">ไม่พบรายการนี้</div></div>`;
  const R=[["tag","ประเภท",AS_CATS[asCatK(a.category)]],["tool","ยี่ห้อ / รุ่น",[a.brand,a.model].filter(Boolean).join(" / ")],["barcode","Serial",a.serial],["barcode","รหัสเดิม",a.old_code],["ok","ตรวจล่าสุด",a.last_checked?fDY(a.last_checked):""],["cal","วันที่รับ",a.received_date?fDY(a.received_date):""],["edit","หมายเหตุ",a.note]].filter(x=>x[2]);
  const held=asHeld(a)&&a.employee_id;
  return band("รายละเอียดทรัพย์สิน")+`<div class="pad" style="gap:12px"><div class="adv2-h">${asPic(a,"b")}<h2>${esc(a.name)}</h2><div>${asChip(a.status)}</div><span class="adv2-code">${ic("barcode")}${esc(a.asset_code||"ยังไม่มีรหัส")}</span></div>
  ${R.length?`<div class="adv2-l">${R.map(x=>`<div class="adv2-r"><span class="ti">${ic(x[0])}</span><span>${x[1]}</span><b>${esc(x[2])}</b></div>`).join("")}</div>`:""}
  ${held?`<button class="adv2-rep" data-acgo="${esc(a.id)}|damaged|">${ic("alert")}<span><b>แจ้งชำรุด</b><span>ส่งเรื่องให้ HR ตรวจสอบ</span></span><span class="chev">${ic("chevR")}</span></button><button class="adv2-rep" data-acgo="${esc(a.id)}|lost|">${ic("alert")}<span><b>แจ้งสูญหาย</b><span>ส่งเรื่องให้ HR ตรวจสอบ</span></span><span class="chev">${ic("chevR")}</span></button>`:""}</div>`};
/* การแจ้งเตือน: กล่องว่างแบบใหม่ */
V.notif=(f=>()=>{const h=f();return h.replace('<div class="empty">ยังไม่มีการแจ้งเตือน</div>',`<div class="nfe"><span class="bi">${ic("bell")}</span><b>ยังไม่มีการแจ้งเตือน</b><span>ผลอนุมัติ งานใหม่ และประกาศจาก HR<br>จะแสดงที่นี่ และส่งทาง LINE ด้วย</span></div>`)})(V.notif);
