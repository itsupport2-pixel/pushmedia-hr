/* แอปบนหน้าจอโฮม (11 พ.ย. 2569 ผู้ใช้ขอ: บันทึกไว้หน้าจอโฮม เปิดแล้วเข้าระบบเลย ไม่ต้องเด้งไป LINE · iOS + Android)
 * หลังบ้าน app/gas/security/HomeApp.js · หน้าจอโฮมไม่มีบัญชี LINE → ผูกเครื่องครั้งเดียวด้วยรหัส 8 ตัวจากแอป LINE (เมนู › ใช้บนหน้าจอโฮม)
 * เครื่องเก็บกุญแจไว้ใน localStorage ("home") · ครั้งต่อไปเข้าเองอัตโนมัติ · HR ปิดได้ที่ ตั้งค่าระบบ › เวลาทำงาน › แอปบนหน้าจอโฮม */
"use strict";
/* เปิดจากไอคอนบนหน้าจอโฮม (ไม่ใช่ในแอป LINE) · iOS: navigator.standalone · Android/อื่น ๆ: display-mode standalone · ?home=1 = start_url ใน manifest */
function isHomeCtx(){try{const ua=navigator.userAgent||"";if(/\bLine\//i.test(ua)||!/iPhone|iPad|iPod|Android/i.test(ua))return false;
  return navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||Q.get("home")==="1"}catch(x){return false}}
function homeLabel(){const ua=navigator.userAgent||"";return /iPhone/i.test(ua)?"iPhone":/iPad/i.test(ua)?"iPad":/Android/i.test(ua)?((/;\s*([^;)]+)\s+Build\//.exec(ua)||[])[1]||"Android").slice(0,40):"มือถือ"}
function homeStart(){loadPub();const k=LS.get("home");
  if(!k||!k.d||!k.s){homePairView();return}
  $("#views").innerHTML='<div class="view white"><div class="pad" style="padding-top:40vh;text-align:center"><span class="spin"></span></div></div>';$("#tabbar").hidden=true;
  call("homeLogin",k.d,k.s).then(r=>{S.relog=0;setTok(r.token);boot()}).catch(e=>{const m=String(e&&e.message||"");
    if(/HOME_OFF/.test(m)){homeOffView();return}
    if(/HOME_REVOKED/.test(m)){LS.del("home");homePairView("เครื่องนี้ถูกยกเลิกการเชื่อมแล้ว · สร้างรหัสใหม่ในแอป LINE");return}
    homePairView(m)})}
function homeOffView(){$("#tabbar").hidden=true;$("#views").innerHTML=`<div class="view white">${band("Push Media Center")}<div class="pad"><div class="fcard" style="gap:10px;text-align:center;align-items:center">${ic("alert")}<b style="font-size:17px">ปิดการใช้งานบนหน้าจอโฮมอยู่</b><span class="cap">HR ปิดการเข้าระบบจากไอคอนบนหน้าจอโฮมไว้ · กรุณาใช้แอปพนักงานใน LINE OA ของบริษัท</span>${location.hostname==="pct.push.co.th"?'<a class="btn pri" href="https://liff.line.me/2012235420-HusTQ3rY">เปิดในแอป LINE</a>':""}</div></div></div>`}
function homePairView(msg){$("#tabbar").hidden=true;
  $("#views").innerHTML=`<div class="view white">${band("เชื่อมเครื่องนี้")}<form class="pad" id="hpf" novalidate><div class="fcard" style="gap:12px">
   <b style="font-size:17px">เข้าระบบจากหน้าจอโฮม</b>
   <span class="cap">ทำครั้งเดียวต่อเครื่อง · เปิดแอปพนักงานใน LINE → เมนู ☰ → <b>ใช้บนหน้าจอโฮม</b> → กด <b>สร้างรหัส</b> แล้วนำรหัส 8 ตัวมากรอกที่นี่ (รหัสใช้ได้ 10 นาที)</span>
   ${fl("hpc","รหัสจากแอป LINE",`<input class="inp" id="hpc" maxlength="9" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="เช่น K7QP2MXA" style="font-size:22px;letter-spacing:3px;text-transform:uppercase">`)}
   ${msg?`<div class="note c-red" role="alert">${ic("alert")}<span>${esc(msg)}</span></div>`:""}</div>
   <div class="note c-blue">${ic("info")}<span>เข้าระบบแล้ว ครั้งต่อไปเปิดจากไอคอนได้เลย · ลบเครื่องได้ที่ เมนู › ใช้บนหน้าจอโฮม ในแอป LINE · ลาออกหรือยกเลิกการเชื่อม LINE = เครื่องนี้ใช้ไม่ได้ทันที</span></div></form>
   <span class="spacer"></span><div class="foot"><button class="btn pri" id="hpgo">เข้าระบบ</button></div></div>`;
  const go=ev=>{ev&&ev.preventDefault();const c=$("#hpc").value.toUpperCase().replace(/[^A-Z0-9]/g,"");if(c.length!==8)return homePairView("กรอกรหัส 8 ตัวจากแอป LINE");
    const b=$("#hpgo");b.disabled=true;b.innerHTML='<span class="spin"></span>กำลังตรวจสอบ…';
    call("homePairRedeem",c,homeLabel()).then(r=>{LS.set("home",{d:r.device,s:r.secret});S.relog=0;setTok(r.token);toast("เชื่อมเครื่องนี้แล้ว");boot()}).catch(e=>{homePairView(/HOME_OFF/.test(e.message)?"HR ปิดการใช้งานบนหน้าจอโฮมไว้":e.message);const x=$("#hpc");if(x)x.value=c})};
  $("#hpf").onsubmit=go;$("#hpgo").onclick=go}
/* ออกจากระบบบนหน้าจอโฮม = ยกเลิกเครื่องนี้ด้วย (กันคนอื่นหยิบมือถือไปใช้ต่อ) */
function homeLogout(){const k=LS.get("home");const done=()=>{LS.del("home");setTok(null);homePairView()};if(k&&k.d&&S.tok)call("homeRevoke",S.tok,k.d).catch(()=>{}).then(done);else done()}

/* ── ในแอป LINE: เมนู › ใช้บนหน้าจอโฮม ── */
TITLE.homeapp="ใช้บนหน้าจอโฮม";NOTAB.push("homeapp");
V.homeapp=()=>{const h=S.home||{},u=location.origin+location.pathname,ios=/iPhone|iPad|iPod/i.test(navigator.userAgent||"");
  const step=(n,t)=>`<div style="display:flex;gap:10px;align-items:flex-start"><b style="flex:none;width:22px;height:22px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:12px">${n}</b><span style="font-size:14.5px;line-height:1.55">${t}</span></div>`;
  return band("ใช้บนหน้าจอโฮม")+`<div class="pad" style="display:flex;flex-direction:column;gap:12px">
   <div class="fcard" style="gap:10px"><b style="font-size:16px">เปิดระบบจากไอคอนบนมือถือ ไม่ต้องเข้า LINE</b><span class="cap">ทำครั้งเดียวต่อเครื่อง · ใช้งานได้เหมือนในแอป LINE รวมถึงลงเวลา</span>
    ${step(1,ios?`คัดลอกลิงก์ แล้วเปิดใน <b>Safari</b>`:`คัดลอกลิงก์ แล้วเปิดใน <b>Chrome</b>`)}
    <div style="display:flex;gap:8px"><input class="inp" readonly value="${esc(u)}" style="flex:1;font-size:13px"><button type="button" class="btn out" id="ha-cp" style="min-width:84px">คัดลอก</button></div>
    ${step(2,ios?`กดปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรขึ้น) → <b>เพิ่มไปยังหน้าจอโฮม</b>`:`กด <b>⋮</b> มุมขวาบน → <b>เพิ่มลงในหน้าจอหลัก</b> หรือ <b>ติดตั้งแอป</b>`)}
    ${step(3,`เปิดจากไอคอน <b>Push Media Center</b> บนหน้าจอ แล้วกรอกรหัสด้านล่าง`)}</div>
   <div class="fcard" style="gap:10px;align-items:center;text-align:center">${h.code?`<span class="cap">รหัสเชื่อมเครื่อง · ใช้ได้ครั้งเดียว</span><b style="font-size:34px;letter-spacing:6px;font-family:ui-monospace,monospace">${esc(h.code.slice(0,4)+" "+h.code.slice(4))}</b><span class="cap" id="ha-left">หมดอายุใน 10:00 นาที</span><button type="button" class="btn out" id="ha-new">สร้างรหัสใหม่</button>`:`<span class="cap">กดสร้างรหัสเมื่อพร้อมกรอกบนหน้าจอโฮม (รหัสใช้ได้ 10 นาที)</span><button type="button" class="btn pri" id="ha-new" style="width:100%">สร้างรหัส</button>`}</div>
   <div class="sec"><h3>เครื่องที่เชื่อมอยู่</h3></div>
   ${(h.devices||[]).length?h.devices.map(d=>`<div class="fcard" style="flex-direction:row;align-items:center;gap:12px">${ic("phone")}<div style="flex:1;min-width:0"><b>${esc(d.label)}</b><div class="cap">เชื่อมเมื่อ ${esc(String(d.created_at).slice(0,10))} · ใช้ล่าสุด ${esc(String(d.last_at).slice(0,10))}</div></div><button type="button" class="lnk-del" data-harm="${esc(d.id)}">ลบ</button></div>`).join(""):`<div class="cap" style="padding:0 4px">ยังไม่มีเครื่องที่เชื่อม</div>`}
  </div>`};
function homeAppEnter(){api("homeDevices").then(r=>{S.home=Object.assign(S.home||{},{devices:r.list,on:r.on});if(cur()==="homeapp")repaint()}).catch(e=>toast(e.message))}
let homeTick=0;
document.addEventListener("click",e=>{const t=e.target.closest("#ha-new,#ha-cp,[data-harm]");if(!t)return;
  if(t.id==="ha-cp"){const v=location.origin+location.pathname;(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast("คัดลอกลิงก์แล้ว")).catch(()=>toast(v));return}
  if(t.id==="ha-new"){t.disabled=true;api("homePairCode").then(r=>{S.home={code:r.code,exp:Date.now()+r.sec*1000,devices:r.devices};repaint();clearInterval(homeTick);
    homeTick=setInterval(()=>{const el=$("#ha-left");if(!S.home||!S.home.exp){clearInterval(homeTick);return}const s=Math.max(0,Math.round((S.home.exp-Date.now())/1000));if(el)el.textContent=s?`หมดอายุใน ${Math.floor(s/60)}:${String(s%60).padStart(2,"0")} นาที`:"รหัสหมดอายุแล้ว · กดสร้างรหัสใหม่";if(!s){clearInterval(homeTick);S.home.code="";S.home.exp=0;if(cur()==="homeapp")repaint()}},1000)}).catch(x=>{t.disabled=false;toast(x.message)});return}
  if(t.dataset.harm){if(!confirm("ลบเครื่องนี้? เครื่องนั้นจะออกจากระบบทันที"))return;api("homeRevoke",t.dataset.harm).then(()=>{toast("ลบเครื่องแล้ว");homeAppEnter()}).catch(x=>toast(x.message))}});
