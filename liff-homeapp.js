/* แอปบนหน้าจอโฮม (11 พ.ย. 2569 ผู้ใช้ขอ: บันทึกไว้หน้าจอโฮม เปิดแล้วเข้าระบบเลย ไม่ต้องเด้งไป LINE · iOS + Android)
 * หลังบ้าน app/gas/security/HomeApp.js · หน้าจอโฮมไม่มีบัญชี LINE → ผูกเครื่องครั้งเดียวด้วยรหัส 8 ตัวจากแอป LINE (เมนู › ใช้บนหน้าจอโฮม)
 * เครื่องเก็บกุญแจไว้ใน localStorage ("home") · ครั้งต่อไปเข้าเองอัตโนมัติ · HR ปิดได้ที่ ตั้งค่าระบบ › เวลาทำงาน › แอปบนหน้าจอโฮม */
"use strict";
/* เปิดจากไอคอนบนหน้าจอโฮม (ไม่ใช่ในแอป LINE) · iOS: navigator.standalone · Android/อื่น ๆ: display-mode standalone · ?home=1 = start_url ใน manifest */
function isHomeCtx(){try{const ua=navigator.userAgent||"";if(/\bLine\//i.test(ua)||!/iPhone|iPad|iPod|Android/i.test(ua))return false;
  return navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||Q.get("home")==="1"}catch(x){return false}}
function homeLabel(){const ua=navigator.userAgent||"";return /iPhone/i.test(ua)?"iPhone":/iPad/i.test(ua)?"iPad":/Android/i.test(ua)?((/;\s*([^;)]+)\s+Build\//.exec(ua)||[])[1]||"Android").slice(0,40):"มือถือ"}
function homeStart(){loadPub();const k=LS.get("home");
  if(!k||!k.d||!k.s){homeReqView();return}
  $("#views").innerHTML='<div class="view white" style="align-items:center;justify-content:center"><span class="spin" role="status" aria-label="กำลังโหลด" style="border-color:#E5E5E5;border-top-color:#111"></span></div>';$("#tabbar").hidden=true;
  homeTry(k,true)}
/* ลองเข้าด้วยกุญแจเครื่อง · รออนุญาต = แสดงหน้ารอ แล้วลองซ้ำทุก 3 วินาที */
let homePoll=0;
function homeTry(k,first){call("homeLogin",k.d,k.s).then(r=>{clearTimeout(homePoll);S.relog=0;setTok(r.token);if(!first)toast("อนุญาตแล้ว · เข้าระบบ");boot()}).catch(e=>{const m=String(e&&e.message||"");
  if(/HOME_WAIT/.test(m)){homeWaitView(k);clearTimeout(homePoll);homePoll=setTimeout(()=>homeTry(k,false),3000);return}
  clearTimeout(homePoll);
  if(/HOME_OFF/.test(m)){homeOffView();return}
  if(/HOME_EXPIRED/.test(m)){LS.del("home");homeReqView("คำขอหมดอายุ (ไม่ได้กดอนุญาตใน 10 นาที) · ขอใหม่อีกครั้ง");return}
  if(/HOME_REVOKED|HOME_DENIED/.test(m)){LS.del("home");homeReqView("เครื่องนี้ไม่ได้รับอนุญาต หรือถูกยกเลิกแล้ว · ขอใหม่อีกครั้ง");return}
  if(first)homeReqView(m);else{clearTimeout(homePoll);homePoll=setTimeout(()=>homeTry(k,false),5000)}})}
function homeOffView(){$("#tabbar").hidden=true;$("#views").innerHTML=`<div class="view white">${band("Push Media Center")}<div class="pad"><div class="fcard" style="gap:10px;text-align:center;align-items:center">${ic("alert")}<b style="font-size:17px">ปิดการใช้งานบนหน้าจอโฮมอยู่</b><span class="cap">HR ปิดการเข้าระบบจากไอคอนบนหน้าจอโฮมไว้ · กรุณาใช้แอปพนักงานใน LINE OA ของบริษัท</span>${location.hostname==="pct.push.co.th"?'<a class="btn pri" href="https://liff.line.me/2012235420-HusTQ3rY">เปิดในแอป LINE</a>':""}</div></div></div>`}
/* ขั้นที่ 1: รหัสพนักงาน + เบอร์ 4 ตัวท้าย → ระบบส่งการ์ดขออนุญาตเข้า LINE */
function homeReqView(msg){$("#tabbar").hidden=true;clearTimeout(homePoll);
  $("#views").innerHTML=`<div class="view white">${band("เข้าระบบจากหน้าจอโฮม")}<form class="pad" id="hrf" novalidate><div class="fcard" style="gap:12px">
   <b style="font-size:17px">ยืนยันตัวตนครั้งแรก</b>
   <span class="cap">กรอกข้อมูลแล้วระบบจะส่งข้อความเข้า LINE ของคุณ · กด <b>อนุญาต</b> ในข้อความนั้น เครื่องนี้จะเข้าระบบได้เลย (ทำครั้งเดียวต่อเครื่อง)</span>
   ${fl("hrc","รหัสพนักงาน",`<input class="inp" id="hrc" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="เช่น 0012">`)}
   ${fl("hrp","เบอร์มือถือ 4 ตัวท้าย",`<input class="inp" id="hrp" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••">`)}
   ${msg?`<div class="note c-red" role="alert">${ic("alert")}<span>${esc(msg)}</span></div>`:""}</div>
   <div class="note c-blue">${ic("info")}<span>ต้องเชื่อม LINE กับแอปพนักงานไว้แล้ว · ลาออกหรือยกเลิกการเชื่อม LINE = เครื่องนี้ใช้ไม่ได้ทันที · ลบเครื่องได้ที่ เมนู › ใช้บนหน้าจอโฮม ในแอป LINE</span></div></form>
   <span class="spacer"></span><div class="foot"><button class="btn pri" id="hrgo">ส่งคำขออนุญาตไปที่ LINE</button></div></div>`;
  const go=ev=>{ev&&ev.preventDefault();const c=$("#hrc").value.trim(),p=$("#hrp").value.trim();if(!/^\d{3,6}$/.test(c)||!/^\d{4}$/.test(p))return homeReqView("กรอกรหัสพนักงาน และเบอร์มือถือ 4 ตัวท้าย");
    const b=$("#hrgo");b.disabled=true;b.innerHTML='<span class="spin"></span>กำลังส่ง…';
    call("homeRequest",c,p,homeLabel()).then(r=>{const k={d:r.device,s:r.secret,n:r.name};LS.set("home",k);homeWaitView(k);clearTimeout(homePoll);homePoll=setTimeout(()=>homeTry(k,false),3000)})
     .catch(e=>{homeReqView(/HOME_OFF/.test(e.message)?"HR ปิดการใช้งานบนหน้าจอโฮมไว้":e.message);const x=$("#hrc");if(x){x.value=c}})};
  $("#hrf").onsubmit=go;$("#hrgo").onclick=go}
/* ขั้นที่ 2: รอพนักงานกดอนุญาตใน LINE (ลองเข้าใหม่เองทุก 3 วินาที) */
function homeWaitView(k){if($("#hwv"))return;$("#tabbar").hidden=true;
  $("#views").innerHTML=`<div class="view white" id="hwv">${band("รออนุญาต")}<div class="pad"><div class="fcard" style="gap:12px;align-items:center;text-align:center">
   <span class="spin" style="width:34px;height:34px;border-color:#E5E5E5;border-top-color:#111"></span><b style="font-size:17px">เปิด LINE แล้วกด "อนุญาต"</b>
   <span class="cap">ระบบส่งข้อความ <b>ขอเข้าใช้งานจากเครื่องใหม่</b> เข้า LINE ${k&&k.n?"ของคุณ "+esc(k.n):"ของคุณ"} แล้ว · กดอนุญาตภายใน 10 นาที แล้วกลับมาหน้านี้ ระบบจะเข้าให้เอง</span>
   ${location.hostname==="pct.push.co.th"?'<a class="btn out" href="line://" style="width:100%">เปิดแอป LINE</a>':""}</div>
   <div style="text-align:center;margin-top:14px"><button type="button" class="lnk-del" id="hwc" style="color:var(--text-2,#666)">ยกเลิก / กรอกใหม่</button></div></div></div>`;
  $("#hwc").onclick=()=>{LS.del("home");homeReqView()}}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&$("#hwv")){const k=LS.get("home");if(k){clearTimeout(homePoll);homeTry(k,false)}}});
/* ออกจากระบบบนหน้าจอโฮม = ยกเลิกเครื่องนี้ด้วย (กันคนอื่นหยิบมือถือไปใช้ต่อ) */
function homeLogout(){const k=LS.get("home");const done=()=>{LS.del("home");setTok(null);homeReqView()};if(k&&k.d&&S.tok)call("homeRevoke",S.tok,k.d).catch(()=>{}).then(done);else done()}

/* ── ในแอป LINE: เมนู › ใช้บนหน้าจอโฮม (วิธีเพิ่ม + เครื่องที่เชื่อม) · การ์ดขออนุญาต → หน้า homeok ── */
TITLE.homeapp="ใช้บนหน้าจอโฮม";TITLE.homeok="ขอเข้าใช้งานจากเครื่องใหม่";NOTAB.push("homeapp","homeok");
V.homeapp=()=>{const h=S.home||{},u=location.origin+location.pathname,ios=/iPhone|iPad|iPod/i.test(navigator.userAgent||"");
  const step=(n,t)=>`<div style="display:flex;gap:10px;align-items:flex-start"><b style="flex:none;width:22px;height:22px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:12px">${n}</b><span style="font-size:14.5px;line-height:1.55">${t}</span></div>`;
  return band("ใช้บนหน้าจอโฮม")+`<div class="pad" style="display:flex;flex-direction:column;gap:12px">
   <div class="fcard" style="gap:12px"><b style="font-size:16px">เปิดระบบจากไอคอนบนมือถือ ไม่ต้องเข้า LINE</b><span class="cap">ทำครั้งเดียวต่อเครื่อง · ใช้งานได้เหมือนในแอป LINE รวมถึงลงเวลา</span>
    ${step(1,`กด <b>คัดลอกลิงก์</b> แล้ววางเปิดใน ${ios?"<b>Safari</b>":"<b>Chrome</b>"}`)}
    <button type="button" class="btn out" id="ha-cp" style="width:100%">คัดลอกลิงก์</button>
    ${step(2,ios?`กดปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรขึ้น) → <b>เพิ่มไปยังหน้าจอโฮม</b>`:`กด <b>⋮</b> มุมขวาบน → <b>เพิ่มลงในหน้าจอหลัก</b> หรือ <b>ติดตั้งแอป</b>`)}
    ${step(3,`เปิดจากไอคอน <b>Push Media Center</b> → กรอกรหัสพนักงาน + เบอร์ 4 ตัวท้าย`)}
    ${step(4,`กด <b>อนุญาต</b> ในข้อความที่ระบบส่งเข้า LINE · เสร็จแล้ว`)}</div>
   <div class="sec"><h3>เครื่องที่เชื่อมอยู่</h3></div>
   ${(h.devices||[]).length?h.devices.map(d=>`<div class="fcard" style="flex-direction:row;align-items:center;gap:12px">${ic("phone")}<div style="flex:1;min-width:0"><b>${esc(d.label)}</b><div class="cap">เชื่อมเมื่อ ${esc(String(d.created_at).slice(0,10))}${d.last_at?" · ใช้ล่าสุด "+esc(String(d.last_at).slice(0,10)):""}</div></div><button type="button" class="lnk-del" data-harm="${esc(d.id)}">ลบ</button></div>`).join(""):`<div class="cap" style="padding:0 4px">ยังไม่มีเครื่องที่เชื่อม</div>`}
  </div>`};
V.homeok=()=>{const id=cur().split(":")[1]||"",r=S.homeReq&&S.homeReq.id===id?S.homeReq:null;
  if(!r)return band("ขอเข้าใช้งานจากเครื่องใหม่")+loadingV();
  const st=r.status,done=st!=="wait";
  return band("ขอเข้าใช้งานจากเครื่องใหม่")+`<div class="pad" style="display:flex;flex-direction:column;gap:12px"><div class="fcard" style="gap:10px;align-items:center;text-align:center">${ic("phone")}
   <b style="font-size:18px">${esc(r.label)}</b><span class="cap">ขอเมื่อ ${esc(String(r.created_at).slice(11,16))} น. · เปิด Push Media Center จากไอคอนบนหน้าจอโฮมด้วยบัญชีของคุณ</span>
   ${done?`<div class="note ${st==="ok"?"c-blue":"c-red"}" style="width:100%">${ic(st==="ok"?"info":"alert")}<span>${st==="ok"?"อนุญาตเครื่องนี้แล้ว · กลับไปที่เครื่องนั้นได้เลย":st==="expired"?"คำขอหมดอายุ (เกิน 10 นาที) · ขอใหม่จากเครื่องนั้น":"คำขอนี้ปิดไปแล้ว"}</span></div>`:
   `<button type="button" class="btn pri" id="hok-ok" style="width:100%">อนุญาต</button><button type="button" class="btn out" id="hok-no" style="width:100%">ไม่ใช่ฉัน</button>`}</div>
   <div class="cap" style="padding:0 4px">ถ้าไม่ได้ขอเอง กด "ไม่ใช่ฉัน" · ลบเครื่องที่อนุญาตไว้ได้ที่ เมนู › ใช้บนหน้าจอโฮม</div></div>`};
function homeOkEnter(act){const id=cur().split(":")[1]||"";api("homeReqInfo",id).then(r=>{S.homeReq=r;if(cur().split(":")[0]==="homeok")repaint();
  if(act&&r.status==="wait"){if(act==="ok")homeDecide(id,true);else if(act==="no")homeDecide(id,false)}}).catch(e=>toast(e.message))}
function homeDecide(id,ok){api("homeApprove",id,ok).then(r=>{S.homeReq=Object.assign({},S.homeReq,{status:r.status==="ok"?"ok":"no"});repaint();toast(ok?"อนุญาตแล้ว · กลับไปที่เครื่องนั้นได้เลย":"ปฏิเสธคำขอแล้ว")}).catch(e=>toast(e.message))}
function homeAppEnter(){api("homeDevices").then(r=>{S.home=Object.assign(S.home||{},{devices:r.list,on:r.on});if(cur()==="homeapp")repaint()}).catch(e=>toast(e.message))}
document.addEventListener("click",e=>{const t=e.target.closest("#ha-cp,[data-harm],#hok-ok,#hok-no");if(!t)return;
  if(t.id==="hok-ok"||t.id==="hok-no"){t.disabled=true;homeDecide(cur().split(":")[1]||"",t.id==="hok-ok");return}
  if(t.id==="ha-cp"){const v=location.origin+location.pathname;(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast("คัดลอกลิงก์แล้ว · วางเปิดใน "+(/iPhone|iPad|iPod/i.test(navigator.userAgent||"")?"Safari":"Chrome"))).catch(()=>toast(v));return}
  if(t.dataset.harm){if(!confirm("ลบเครื่องนี้? เครื่องนั้นจะออกจากระบบทันที"))return;api("homeRevoke",t.dataset.harm).then(()=>{toast("ลบเครื่องแล้ว");homeAppEnter()}).catch(x=>toast(x.message))}});
