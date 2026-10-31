'use strict';
/* แอปพนักงาน (liff.html) แยกเป็นไฟล์ตามหน้า (31 ต.ค. 2569) · ลำดับโหลดมีผล: core → home → messenger → auth → nav → leave (leave เรียก start() ท้ายสุด)
 * ทุกไฟล์ใช้ตัวแปรระดับบนสุดร่วมกัน · โค้ดที่รันตอนโหลดเรียกได้เฉพาะของที่ประกาศในไฟล์ก่อนหน้า (ฟังก์ชันไม่ hoist ข้ามไฟล์)
 * ไฟล์นี้: เชื่อมบัญชี LINE · หน้าต้อนรับ · ตั้งค่าครั้งแรก · เข้าระบบ · ลิงก์จากการ์ด LINE · boot · GPS */
/* ---------- เชื่อมบัญชี LINE (ครั้งแรก) ---------- */
function linkView(lineName,msg){const inv=!!S.invite;S.lineName=lineName;
  $("#views").innerHTML=`<div class="view white">${band(inv?"ยืนยันตัวตน":"ลงทะเบียนพนักงาน")}<form class="pad" id="lf" novalidate>${stepsBar(0)}<div class="fcard">
  <b style="font-size:17px">${lineName?"สวัสดีคุณ "+esc(lineName):"เชื่อมบัญชี LINE"}</b><span class="cap">${inv?"กรอกข้อมูลให้ตรงกับที่ HR บันทึกไว้ ทำครั้งเดียวแล้วใช้แอปได้เลย":"ไม่มีลิงก์จาก HR ก็ได้ ระบบจะส่งคำขอให้ HR ยืนยันก่อน"}</span>
  ${fl("code","รหัสพนักงาน (4 หลัก)",`<input class="inp" id="code" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="เช่น 0012">`)}
  ${fl("p4","เบอร์มือถือ 4 ตัวท้าย",`<input class="inp" id="p4" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••">`)}
  ${msg?`<div class="note c-red" role="alert">${ic("alert")}<span>${esc(msg)}</span></div>`:""}</div>
  <div class="note c-blue">${ic("info")}<span>บัญชี LINE หนึ่งบัญชีผูกกับพนักงานได้คนเดียว · กรอกผิด 5 ครั้ง ระบบพัก 15 นาที</span></div>
  ${S.setup&&!inv?`<div class="fcard" style="gap:8px"><b>ผู้ดูแลระบบ: ตั้งค่าครั้งแรก</b><span class="cap">ยังไม่มี HR ในระบบ · ใช้รหัสผู้ดูแลเพิ่มตัวคุณเป็น HR และเชื่อม LINE นี้ได้เลย</span><button type="button" class="btn out" id="su">ตั้งค่าครั้งแรก</button></div>`:""}</form>
  <span class="spacer"></span><div class="foot"><button class="btn pri" id="go">${inv?"เชื่อมบัญชี":"ส่งคำขอให้ HR"}</button></div></div>`;
  $("#tabbar").hidden=true;
  const submit=ev=>{ev&&ev.preventDefault();const c=$("#code").value.trim(),p=$("#p4").value.trim();
    if(!/^\d{4}$/.test(c)||!/^\d{4}$/.test(p))return linkView(lineName,"กรอกรหัสพนักงาน 4 หลัก และเบอร์ 4 ตัวท้าย");
    const b=$("#go");b.disabled=true;b.innerHTML='<span class="spin"></span>กำลังตรวจสอบ…';
    (inv?call("redeemInvite",S.idt,S.invite,c,p):call("requestLink",S.idt,c,p)).then(r=>{
      if(r.linked)afterLink(r);else waitingView(new Date().toISOString());
    }).catch(e=>{linkView(lineName,e.message);$("#code").value=c})};
  $("#lf").onsubmit=submit;$("#go").onclick=submit;
  if($("#su"))$("#su").onclick=()=>setupView();
}
const MARK=`<svg class="mk" viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M10 4h13v19a9 9 0 0 0 18 0V4h13a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z"/></svg>`;
const stepsBar=a=>`<div class="steps" aria-label="ขั้นตอน ${a+1} จาก 3">${["ยืนยันตัวตน","HR ยืนยัน","เริ่มใช้งาน"].map((t,i)=>`<span class="st ${i<a?"ok on":i===a?"on":""}"><span class="d">${i<a?"✓":i+1}</span>${t}</span>${i<2?`<span class="ln ${i<a?"ok":""}"></span>`:""}`).join("")}</div>`;
/* หน้าต้อนรับ (เปิดแอปครั้งแรก ยังไม่เชื่อม LINE) */
function welcomeView(lineName){$("#tabbar").hidden=true;
  $("#views").innerHTML=`<div class="view white"><div class="wl-hero">${S.pub&&S.pub.logo?`<img src="${esc(S.pub.logo)}" alt="" style="width:56px;height:56px;object-fit:contain;background:#fff;border-radius:12px">`:MARK}<h2>ยินดีต้อนรับสู่ ${esc(S.pub&&S.pub.app||"Push Media Center")}</h2><p>ลงเวลา ลางาน และติดตามเอกสาร ในแอป LINE ที่เดียว</p></div>
  <div class="pad"><div class="fcard" style="gap:16px">${[["finger","ลงเวลาเข้า–ออกงาน","ตรวจพิกัด GPS ที่สำนักงานหรือหน้างาน"],["doc","ยื่นลาและเอกสาร","ติดตามสถานะการอนุมัติได้ทันที"],["cal","ตารางงานและโควตาการลา","ดูงานวันนี้และวันลาคงเหลือ"]].map(f=>`<div class="wl-f"><span class="b">${ic(f[0])}</span><span><b>${f[1]}</b><span class="cap">${f[2]}</span></span></div>`).join("")}</div>
  <div class="note c-blue">${ic("info")}<span>เข้าด้วยบัญชี LINE ของคุณ ไม่ต้องจำรหัสผ่าน · ข้อมูลส่วนตัวเห็นเฉพาะคุณและ HR · <a href="privacy.html" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">นโยบายความเป็นส่วนตัว</a></span></div></div>
  <span class="spacer"></span><div class="foot"><button class="btn pri" id="wgo">เริ่มใช้งาน</button></div></div>`;
  $("#wgo").onclick=()=>{LS.set("welcomed",1);linkView(lineName)}}
/* เชื่อมสำเร็จ: แสดงครั้งเดียวต่อพนักงานต่อเครื่อง แล้วเข้าหน้าหลัก */
function linkedView(me){$("#tabbar").hidden=true;LS.set("seen_"+(me&&me.id||""),1);
  $("#views").innerHTML=`<div class="view white"><div class="okv"><div class="c">${ic("ok")}</div><h2>เชื่อมบัญชีสำเร็จ</h2><span class="muted">สวัสดีคุณ${esc(me?(me.nickname||me.name):"")}</span></div>
  <div class="pad" style="padding-top:0"><div class="fcard" style="gap:14px"><b>เริ่มต้นใช้งาน 3 อย่าง</b>${[["finger","ลงเวลา","กดปุ่มลายนิ้วมือตรงกลางแถบล่าง"],["doc","ขอลางาน","เมนูเอกสาร › ขอลางาน · เลือกวันในปฏิทิน"],["userClock","ดูโควตาการลา","หน้าหลัก › โควตาการลา"]].map((f,i)=>`<div class="wl-f"><span class="b" style="width:40px;height:40px">${ic(f[0])}</span><span><b>${i+1}. ${f[1]}</b><span class="cap">${f[2]}</span></span></div>`).join("")}</div>
  <div class="note c-green">${ic("ok")}<span>แอปจำการเข้าระบบไว้ เปิดครั้งถัดไปเข้าหน้าหลักทันที</span></div></div>
  <span class="spacer"></span><div class="foot"><button class="btn pri" id="lgo">ไปหน้าหลัก</button></div></div>`;
  $("#lgo").onclick=()=>boot()}
const afterLink=r=>{setTok(r.token);S.me=r.me;history.replaceState(null,"",location.pathname+(DEV?"?dev="+encodeURIComponent(DEV):""));linkedView(r.me)};
/* ตั้งค่าครั้งแรก (ยังไม่มี HR เชื่อม LINE): รหัสผู้ดูแล + ข้อมูลตัวเอง → เป็น HR + เชื่อม LINE นี้ */
function setupView(msg,v){v=v||{};const er=(msg&&msg.errors)||{};
  const inp=(id,label,o)=>fl(id,label,`<input class="inp${er[o.k||id]?" err":""}" id="${id}" ${o.a||""} value="${esc(v[id]||"")}" placeholder="${o.ph||""}">`)+(er[o.k||id]?`<span class="cap" style="color:var(--red);margin-top:-6px">${esc(er[o.k||id])}</span>`:"");
  $("#views").innerHTML=`<div class="view white">${band("ตั้งค่าครั้งแรก")}<form class="pad" id="sf" novalidate><div class="fcard">
  <b style="font-size:17px">เพิ่มตัวคุณเป็น HR</b><span class="cap">ใช้ได้ครั้งเดียวตอนเริ่มระบบ · หลังจากนี้ HR เพิ่มพนักงานและส่งลิงก์เชื่อม LINE ให้คนอื่น</span>
  ${inp("spw","รหัสผู้ดูแลระบบ *",{a:'type="password" autocomplete="off"'})}
  ${inp("emp_code","รหัสพนักงาน (4 หลัก) *",{a:'inputmode="numeric" maxlength="4"',ph:"เช่น 0077"})}
  ${inp("first_name","ชื่อ *",{})}${inp("last_name","นามสกุล *",{})}${inp("nickname","ชื่อเล่น",{})}
  ${inp("phone","เบอร์มือถือ",{a:'inputmode="tel"',ph:"08xxxxxxxx"})}
  ${inp("department","แผนก *",{ph:"เช่น ฝ่ายบุคคล"})}
  ${msg&&msg.text?`<div class="note c-red" role="alert">${ic("alert")}<span>${esc(msg.text)}</span></div>`:""}</div>
  <div class="note c-blue">${ic("info")}<span>บทบาท HR · วันทำงาน จ.–ศ. · ประเภทการลงเวลา "ไม่ต้องลงเวลา" — แก้ได้ภายหลังในหน้าผู้ดูแล</span></div></form>
  <span class="spacer"></span><div class="foot"><button class="btn pri" id="sgo">บันทึกและเชื่อม LINE</button><button class="btn out" id="sbk">กลับ</button></div></div>`;
  $("#sbk").onclick=()=>linkView(S.lineName);
  const go=ev=>{ev&&ev.preventDefault();const f={};["spw","emp_code","first_name","last_name","nickname","phone","department"].forEach(k=>f[k]=$("#"+k).value.trim());
    if(!f.spw)return setupView({text:"กรอกรหัสผู้ดูแลระบบ"},f);
    const b=$("#sgo");b.disabled=true;b.innerHTML='<span class="spin"></span>กำลังบันทึก…';
    call("firstHrSetup",S.idt,f.spw,f).then(r=>{if(!r.ok){delete f.spw;return setupView({errors:r.errors,text:"ตรวจช่องที่ขึ้นสีแดง"},f)}
      S.setup=false;afterLink(r)}).catch(e=>{delete f.spw;setupView({text:e.message},f)})};
  $("#sf").onsubmit=go;$("#sgo").onclick=go;
}
function waitingView(at){$("#tabbar").hidden=true;
  $("#views").innerHTML=`<div class="view white">${band("ลงทะเบียนพนักงาน")}<div class="pad">${stepsBar(1)}
  <div class="okv" style="padding:8px 0 4px"><div class="c" style="background:var(--orange-soft);color:var(--orange);width:84px;height:84px">${ic("hour")}</div><h2>ส่งคำขอแล้ว</h2><span class="muted">รอ HR ยืนยันว่าเป็นคุณ โดยปกติภายในวันทำงาน</span></div>
  <div class="fcard"><b>สถานะคำขอ</b><div class="tl3">${[["var(--green)","ส่งคำขอ",at?fAt(at):"",1],["var(--orange)","HR ยืนยันตัวตน","รอดำเนินการ",0],["var(--text-3)","เริ่มใช้งาน","",0]].map(x=>`<div class="r"><i style="border-color:${x[0]};background:${x[3]?x[0]:"#fff"}"></i><span><span style="display:block">${x[1]}</span>${x[2]?`<span class="cap">${esc(x[2])}</span>`:""}</span></div>`).join("")}</div></div>
  <div class="note c-blue">${ic("info")}<span>เมื่อยืนยันแล้ว ระบบแจ้งทาง LINE · เปิดแอปนี้อีกครั้งได้เลย</span></div></div>
  <span class="spacer"></span><div class="foot"><button class="btn out" onclick="location.reload()">ตรวจสอบอีกครั้ง</button></div></div>`}
function fatal(e){$("#views").innerHTML=`<div class="view white"><div class="okv"><div class="c" style="background:var(--red-soft);color:var(--red)">${ic("alert")}</div><h2>เปิดแอปไม่สำเร็จ</h2><span class="muted">${esc(e.message)}</span><span class="cap" style="color:var(--text-3)">ช่อง ${esc(CFG.channel||"-")} · ${esc(CFG.liffId||"-")}</span></div><div class="pad"><button class="btn pri" onclick="location.reload()">ลองใหม่</button></div></div>`;$("#tabbar").hidden=true}

/* ---------- เข้าระบบ ---------- */
function getIdToken(){
  if(DEV)return Promise.resolve("dev|"+DEV);
  if(!window.liff||!CFG.liffId)return Promise.reject(new Error("ยังไม่ได้ตั้งค่า LIFF ID"));
  return liff.init({liffId:CFG.liffId}).then(()=>{try{sessionStorage.removeItem("pmhr_swap")}catch(x){}if(!liff.isLoggedIn()){liff.login({redirectUri:location.href});return new Promise(()=>{})}return liff.getIDToken()})
    .catch(e=>{   // เปิดจากอีกช่อง LINE (Developing / Published) แต่หน้าเว็บเดาช่องผิด → สลับไปอีกช่องเอง 1 ครั้งต่อการเปิด
      let tried="";try{tried=sessionStorage.getItem("pmhr_swap")||""}catch(x){}
      if(/invalid liff id/i.test(String(e&&e.message))&&!tried){const other=CFG.channel==="pub"?"dev":"pub";
        try{sessionStorage.setItem("pmhr_swap",CFG.channel||"dev");localStorage.setItem("pmhr_ch",other)}catch(x){}
        const u=new URL(location.href);u.searchParams.set("ch",other);location.replace(u.toString());return new Promise(()=>{})}
      throw e});
}
/* ชื่อระบบ + โลโก้บริษัท (ตั้งค่าระบบ › ข้อมูลบริษัท) · ไม่ต้องล็อกอิน · จำไว้ในเครื่อง */
function loadPub(){S.pub=LS.get("pub");return call("publicInfo").then(p=>{S.pub=p;LS.set("pub",p);if(p.app)document.title=p.app}).catch(()=>{})}
function start(){loadPub();
  if(VA){S.tok=VA;["today","leave"].forEach(x=>LS.del(x));const b=document.createElement("div");b.id="va-bar";b.innerHTML='<svg class="va-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3.2"/><path d="M3.5 19.5c0-3.1 2.5-5.5 5.5-5.5 1.2 0 2.3.4 3.2 1"/><path d="M15.5 13.5h5.5l-2-2"/><path d="M21 17.5h-5.5l2 2"/></svg>มุมมองผู้ดูแลระบบ · ดูได้อย่างเดียว';document.body.appendChild(b);boot();return}
  const t=LS.get("tok");
  if(t&&!S.invite){S.tok=t;if(window.liff&&CFG.liffId&&!DEV)liff.init({liffId:CFG.liffId}).then(refreshLine).catch(()=>{});boot();return}
  startLine()}
/* เข้าระบบจากที่จำไว้ → อัปเดตชื่อ/รูปโปรไฟล์ LINE วันละครั้ง (เงียบ ๆ ไม่กระทบการใช้งาน) */
function refreshLine(){try{if(LS.get("lpic")===ISO(new Date())||!liff.isLoggedIn())return;const t=liff.getIDToken();if(!t)return;
  api("refreshLine",t).then(r=>{if(r&&r.ok)LS.set("lpic",ISO(new Date()))}).catch(()=>{})}catch(x){}}
function startLine(){getIdToken().then(t=>{S.idt=t;return call("loginLine",t)}).then(r=>{S.relog=0;if(r.linked){setTok(r.token);if(r.me&&!LS.get("seen_"+r.me.id))linkedView(r.me);else boot()}
  else{S.setup=!!r.setup;if(r.pending)waitingView(r.pending.at);else if(S.invite||LS.get("welcomed"))linkView(r.lineName);else welcomeView(r.lineName)}}).catch(fatal)}
/* เปิดหน้าตรงจากปุ่มในการ์ด LINE (Workflow แจ้งเตือน 30 ต.ค. 2569): ?go=approve|myreqs|leave · LIFF อาจส่งมาใน liff.state */
const DEEP=(()=>{const st=decodeURIComponent(Q.get("liff.state")||""),gp=k=>Q.get(k)||(new RegExp("[?&]"+k+"=([\\w-]+)").exec(st)||[])[1]||"",g=gp("go");return {approve:1,myreqs:1,leave:1,apd:1,mjob:1}[g]?{g:g,id:gp("id"),act:gp("act"),no:gp("no")}:null})();let deepDone=0;
/* ปุ่มในการ์ดคำขอลา (?go=apd&id=…&act=ok|no): เปิดรายการอนุมัติ → คำขอนั้น → ยืนยันอนุมัติ / ใส่เหตุผลไม่อนุมัติ (ปุ่มส่งกดได้เมื่อมีเหตุผล) */
function deepGo(d){if(d.g==="mjob")return d.no?go("mjob:"+d.no):null;if(d.g!=="apd")return go(d.g);go("approve");let n=0;const t=setInterval(()=>{n++;const a=(L.aps||[]).find(x=>x.id===d.id);
  if(a){clearInterval(t);go("apdetail:"+a.id);if(d.act)setTimeout(()=>{if(!a.step){toast("คำขอนี้ดำเนินการไปแล้ว");return}if(d.act==="no")apNoSheet(a.id,"no");else if(d.act==="ok")sheet(`<h3>อนุมัติคำขอลานี้?</h3><span class="cap" style="text-align:center">${esc(a.employee)} · ${esc(a.type)} ${nd(a.days_total)} · ${esc(a.req_no)}</span><button class="btn pri" data-apokc="${a.id}">ยืนยันอนุมัติ</button><button class="btn out" data-dclose>ยกเลิก</button>`)},400);return}
  if((L.aps&&n>12)||n>40){clearInterval(t);if(L.aps)toast("ไม่พบคำขอนี้ในรายการรออนุมัติของคุณ · อาจมีคนอนุมัติไปแล้ว")}},250)}
function boot(){S.tab="home";S.stack=[];const c=LS.get("today");S.today=c&&c.d===ISO(new Date())?c.t:null;if(S.today)S.me=S.today.me;if(!L.info)L.info=LS.get("leave");show("fade");if(DEEP&&!deepDone){deepDone=1;deepGo(DEEP)}refreshToday();loadLeave(true).then(()=>{if(cur()==="home")repaint()}).catch(()=>{});
  const now=new Date();api("myAttendance",`${now.getFullYear()}-${p2(now.getMonth()+1)}`).then(m=>{S.month=m;if(cur()==="home")repaint()}).catch(()=>{})}
function refreshToday(){return api("todayInfo").then(t=>{S.today=t;S.me=t.me;LS.set("today",{d:ISO(new Date()),t});if(["home","clock","sched"].includes(cur()))repaint();return t}).catch(e=>{toast(e.message)})}

/* ---------- ตำแหน่ง GPS (LIFF / LINE MINI App) · ทดสอบในเครื่อง ?lat=&lng= ---------- */
function getPos(){
  if(Q.get("lat"))return Promise.resolve({lat:+Q.get("lat"),lng:+Q.get("lng"),acc:+(Q.get("acc")||10)});
  return new Promise(ok=>{if(!navigator.geolocation)return ok({err:"มือถือไม่รองรับการระบุตำแหน่ง"});
    navigator.geolocation.getCurrentPosition(p=>ok({lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy}),
      ()=>ok({err:"ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาเปิดตำแหน่งที่ตั้ง (GPS) แล้วกดปุ่มอัปเดตตำแหน่ง"}),{enableHighAccuracy:true,timeout:15000,maximumAge:0})});
}
function dist(a,b,c,d){const R=6371000,r=Math.PI/180,x=Math.sin((c-a)*r/2),y=Math.sin((d-b)*r/2),h=x*x+Math.cos(a*r)*Math.cos(c*r)*y*y;return Math.round(2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)))}
function openClock(){S.pos=null;S.opt=0;S.shift=null;S.again=false;go("clock");Promise.all([refreshToday().then(t=>t||(S.today&&S.today.date===ISO(new Date())?S.today:null)||(CFG.backup&&(S.today=outageToday()))),getPos()]).then(x=>{S.pos=x[1];if(cur()==="clock"){repaint();startClock()}})}
