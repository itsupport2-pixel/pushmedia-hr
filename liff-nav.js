'use strict';
/* แอปพนักงาน (liff.html) แยกเป็นไฟล์ตามหน้า (31 ต.ค. 2569) · ลำดับโหลดมีผล: core → home → messenger → auth → nav → leave (leave เรียก start() ท้ายสุด)
 * ทุกไฟล์ใช้ตัวแปรระดับบนสุดร่วมกัน · โค้ดที่รันตอนโหลดเรียกได้เฉพาะของที่ประกาศในไฟล์ก่อนหน้า (ฟังก์ชันไม่ hoist ข้ามไฟล์)
 * ไฟล์นี้: เปลี่ยนหน้า (stack/แท็บ/ย้อนกลับ) · toast · เมนูข้าง · ปุ่มทั่วไป · ลงเวลา · ขนาดจอ */
/* ---------- navigation (เหมือนต้นแบบ) ---------- */
const TABS=[["home","หน้าหลัก","home"],["sched","ตารางงาน","cal"],["clock","ลงเวลางาน","finger"],["req","เอกสาร","doc"],["menu","เมนู","menu"]];
let tick=null;
const cur=()=>S.stack.length?S.stack[S.stack.length-1]:S.tab;
function paintChrome(){const [n]=cur().split(":");document.title=(TITLE[n]||"Push Media Center")+" · Push Media Center";
  const tb=$("#tabbar");tb.hidden=NOTAB.includes(n);
  tb.innerHTML=TABS.map(x=>x[0]==="clock"?`<button class="fab" data-tab="clock"><span class="ring"><i>${ic("finger")}</i></span>${x[1]}</button>`:`<button data-tab="${x[0]}" ${S.tab===x[0]&&!S.stack.length?'aria-current="page"':""}>${ic(x[2])}${x[1]}</button>`).join("");}
function build(anim){const [n,arg]=cur().split(":");const v=document.createElement("div");v.className="view "+(n==="home"?"home":["clock","done","lvdone"].includes(n)?"white":"");v.innerHTML=V[n](arg);if(anim)v.classList.add(anim);return v;}
/* หน้าที่แสดงอยู่ = ตัวท้ายสุดที่ไม่ได้กำลังเลื่อนออก (ระหว่างแอนิเมชันย้อนกลับ หน้าเก่ายังค้างอยู่ท้ายสุดได้ ~0.4 วิ · หลังบ้านตอบเร็วกว่านั้นได้) */
const liveView=()=>[...$("#views").children].reverse().find(v=>!v.classList.contains("out-r"))||null;
function repaint(){const box=$("#views"),v=liveView();if(!v)return show("fade");const st=v.scrollTop,[n,arg]=cur().split(":");v.innerHTML=V[n](arg);v.scrollTop=st;if(cur()==="clock")startClock();if(n==="leave")paintLeaveChecks();tabsToActive();fitChips()}
/* ป้ายประเภทวันในการ์ดข้อมูลประจำวัน: บรรทัดเดียวเสมอ · ยาวเกินพื้นที่ → ลดขนาดตัวอักษรทีละน้อย (ไม่ต่ำกว่า 11px) แล้วค่อยตัด … */
function fitChips(){document.querySelectorAll("#views .daily .chip").forEach(c=>{c.style.fontSize="";let f=14;while(c.scrollWidth>c.clientWidth+1&&f>11){f-=.5;c.style.fontSize=f+"px"}})}
/* แถบแท็บเลื่อนได้: เลื่อนให้แท็บที่เลือกอยู่ในจอเสมอ (หลังวาดหน้าใหม่ scrollLeft กลับเป็น 0) */
function tabsToActive(){document.querySelectorAll("#views .tabs").forEach(t=>{const a=t.querySelector('[aria-pressed="true"]');if(a)t.scrollLeft=Math.max(0,a.offsetLeft-t.offsetLeft-16)})}
function show(mode){const box=$("#views");box.querySelectorAll(".out-r").forEach(x=>x.remove());const old=box.lastElementChild;clearInterval(tick);
  if(mode==="back"&&old&&old.classList.contains("view")){const v=build();box.insertBefore(v,old);old.classList.add("out-r");old.addEventListener("animationend",()=>old.remove(),{once:true});setTimeout(()=>old.remove(),400);}
  else{const v=build(mode==="push"?"in-r":"fade");box.appendChild(v);if(old){if(mode==="push")setTimeout(()=>old.remove(),300);else old.remove();}}
  paintChrome();if(cur()==="clock")startClock();tabsToActive();fitChips();}
function startClock(){clearInterval(tick);const up=()=>{const d=new Date(),t=$("#ct"),c=$("#cd");if(!t)return clearInterval(tick);t.textContent=`${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;const cb=$("#cbt");if(cb)cb.textContent=`${p2(d.getHours())}:${p2(d.getMinutes())}`;c.textContent=`วัน${TH_D[d.getDay()]}ที่ ${d.getDate()} ${TH_M[d.getMonth()]} ${d.getFullYear()+543}`;};up();tick=setInterval(up,1000);}
function go(s){S.stack.push(s);try{history.pushState({pm:1},"")}catch(x){}show("push");onEnter()}
/* ปุ่มย้อนกลับของเครื่อง (Android) / ปัดขอบจอ → ย้อนหน้าในแอปแทนการปิดแอป */
addEventListener("popstate",()=>{if(S.skipPop){S.skipPop=0;return}if(S.stack.length)back()});
function back(){if(!S.stack.length)return;const c=cur();S.stack.pop();if(c==="leave")L.f=null;show("back");if(cur()==="leave")setTimeout(paintLeaveChecks,0)}
function toTab(t){S.tab=t;S.stack=[];show("fade");onEnter();if(t==="home")loadLeave(true).then(()=>{if(cur()==="home")repaint()}).catch(()=>{})}
function onEnter(){const n=cur();
  if(n==="worktime"){const now=new Date(),ym=S.wym||`${now.getFullYear()}-${p2(now.getMonth()+1)}`;S.wym=ym;api("myAttendance",ym).then(m=>{S.wdata=m;if(cur()==="worktime")repaint()}).catch(e=>toast(e.message))}
  const n0=n.split(":")[0];if(["pedit","paddr","tredit"].includes(n0)){S.perr=null;S.pform=null}
  if(["profile","pedit","paddr","tredit"].includes(n0)&&!S.prof)api("myProfile").then(p=>{S.prof=p;if(["profile","pedit","paddr","tredit"].includes(cur().split(":")[0]))repaint()}).catch(e=>toast(e.message));
  if(["quota","myreqs","lvdone"].includes(n))loadLeave(true).then(()=>{if(cur().split(":")[0]===n)repaint()}).catch(e=>toast(e.message));
  if(n==="approve")loadAps();
}
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;$("#screen").appendChild(t);setTimeout(()=>t.remove(),2300)}
function drawer(open){const o=$("#ov");if(!open){o.innerHTML="";return}$("#screen").style.setProperty("--top","0px");
  const lead=L.info&&L.info.isLead||S.me&&["lead","manager","hr","exec","admin"].includes(S.me.role);const M=[["หน้าหลัก","home","tab:home"],["ข้อมูลพนักงาน","idc","go:profile"],["เวลาการทำงาน","cal","go:worktime"],["ตารางงาน","calGrid","tab:sched"],["ลงเวลาการทำงาน","pin","clock"],["ยื่นเอกสาร","doc","tab:req"],["เอกสารของฉัน","docOk","go:myreqs"],...(lead?[["อนุมัติเอกสาร","docOk","go:approve"]]:[]),["โควตาการลา","search","go:quota"],["การแจ้งเตือน","bell","soon"]];
  o.innerHTML=`<div class="scrim" data-dclose></div><aside class="drawer" role="dialog" aria-label="เมนู"><div class="logo">${S.pub&&S.pub.logo?`<img src="${esc(S.pub.logo)}" alt="${esc(S.pub.company||"")}" style="max-height:44px;max-width:180px;object-fit:contain">`:LOGO}</div><nav>${M.map((m,i)=>`<button data-dgo="${m[2]}" ${i===0?'aria-current="page"':""}>${ic(m[1])}${m[0]}</button>`).join("")}</nav><div class="ver">${S.me?esc(S.me.code)+" · ":""}Push Media Center · <a href="privacy.html" target="_blank" rel="noopener" style="color:inherit">นโยบายความเป็นส่วนตัว</a></div><footer><button data-dlogout aria-label="ออกจากระบบ">${ic("door")}</button><i></i><button data-dclose aria-label="ปิดเมนู">${ic("x")}</button></footer></aside>`;}

/* ---------- actions ---------- */
function act(a){if(a==="soon"){toast("เมนูนี้กำลังพัฒนา จะเปิดใช้เร็ว ๆ นี้");return}if(a==="clock"){openClock();return}if(a==="lv:leave"){openLeave();return}
  if(a.startsWith("go:"))go(a.slice(3));else if(a.startsWith("tab:"))toTab(a.slice(4));}
document.addEventListener("click",e=>{const t=e.target.closest("button,[data-dclose]");if(!t)return;const d=t.dataset||{};
  if(d.dclose!==undefined){drawer(false);return}
  if(d.again!==undefined){S.again=d.again==="1";repaint();return}
  if(d.dlogout!==undefined){drawer(false);call("logout",S.tok);setTok(null);if(window.liff&&liff.closeWindow&&!DEV){try{liff.closeWindow()}catch(_){}}toast("ออกจากระบบแล้ว");return}
  if(d.toast){toast(d.toast);return}
  if(d.dgo){drawer(false);act(d.dgo);return}
  if(d.act){act(d.act);return}
  if(d.tab){if(d.tab==="menu"){drawer(true);return}if(d.tab==="clock"){openClock();return}toTab(d.tab);return}
  if(d.back!==undefined){back();if(history.state&&history.state.pm){S.skipPop=1;history.back()}return}   // เก็บประวัติเบราว์เซอร์ให้ตรงกับหน้าในแอป
  if(d.home!==undefined){S.tab="home";S.stack=[];show("fade");return}
  if(d.loc!==undefined){t.classList.add("busy");getPos().then(p=>{S.pos=p;t.classList.remove("busy");if(cur()==="clock")repaint();toast(p.err?p.err:"อัปเดตตำแหน่งแล้ว · ความแม่นยำ ±"+Math.round(p.acc||0)+" ม.")});return}
  if(d.shift&&!t.disabled){const n=$("#cn"),v=n?n.value:"";S.shift=d.shift;repaint();const n2=$("#cn");if(n2)n2.value=v;return}
  if(d.opt){document.querySelectorAll(".opt").forEach(o=>o.setAttribute("aria-checked",o===t));S.opt=+d.opt;return}
  if(d.earlyok!==undefined){const v=($("#er")||{}).value||"";if(!v.trim()){$("#er-e").hidden=false;$("#er").classList.add("err");return}$("#ov").innerHTML="";const b=document.querySelector('[data-clock="out"]');if(b)doClock("out",b,v.trim());return}
  if(d.clock){doClock(d.clock,t,"");return}
  if(d.ptab){S.ptab=+d.ptab;repaint();return}
});
/* ลงเวลา · early = เหตุผลออกก่อนเวลา (จากหน้าต่างเตือน) */
function earlySheet(r){sheet(`<div style="align-self:center;width:52px;height:52px;border-radius:50%;background:var(--orange-soft,#FFF3DC);color:var(--orange,#B26A00);display:grid;place-items:center">${ic("alarm")}</div><h3 style="text-align:center;margin:0">ยังไม่ถึงเวลาเลิกงาน</h3><span class="cap" style="text-align:center">${r.shift?"กะ"+esc(r.shift)+" ":""}เลิก ${esc(r.end)} น. · ตอนนี้ ${hhmm()} น.<br>ออกก่อนเวลา ${r.early_min>=60?Math.floor(r.early_min/60)+" ชม. ":""}${r.early_min%60} นาที · ระบบจะบันทึกเป็น "ออกก่อนเวลา"</span>${fl("er","เหตุผลที่ออกก่อนเวลา *",`<textarea class="ta" id="er" placeholder="เช่น ลาครึ่งบ่าย · ไปหน้างานต่อ · ป่วยกลับบ้าน"></textarea><span class="emsg" id="er-e" hidden>กรุณาระบุเหตุผลก่อนลงเวลาออก (หัวหน้าจะเห็นเหตุผลนี้)</span>`)}<button class="btn pri" data-earlyok disabled>ลงเวลาออกตอนนี้</button><button class="btn out" data-dclose>ยังไม่ออก · กลับ</button>`);
  const x=$("#er"),ok=$("[data-earlyok]");x.oninput=()=>{ok.disabled=!x.value.trim();if(x.value.trim()){x.classList.remove("err");$("#er-e").hidden=true}};setTimeout(()=>x.focus(),300)}
function doClock(kind,t,early){const n=$("#cn"),note=n?n.value.trim():"",p=S.pos;{const d={clock:kind};
    t.disabled=true;const old=t.innerHTML;t.innerHTML='<span class="spin"></span>กำลังบันทึก…';
    api("clock",d.clock,p.lat,p.lng,p.acc,note,devInfo(),d.clock==="in"?S.shift||"":"",early||"").then(r=>{
      if(!r.ok&&r.need_early_note){t.disabled=false;t.innerHTML=old;earlySheet(r);return}
      if(!r.ok&&r.need_shift){t.disabled=false;t.innerHTML=old;toast("เลือกกะการทำงานก่อนลงเวลา");return}
      if(!r.ok&&(r.device_pending||r.device_blocked)){t.disabled=false;t.innerHTML=old;S.devmsg=r;S.stack[S.stack.length-1]="devwait";show("fade");return}
      if(!r.ok&&r.need_note){t.disabled=false;t.innerHTML=old;n.classList.add("err");const er=$("#cn-e");er.hidden=false;er.textContent="อยู่นอกพื้นที่"+(r.target?" (ห่าง "+r.target+" "+fmtDist(r.distance_m)+")":"")+" กรุณาระบุเหตุผล";n.focus();return}
      S.last=r;S.today=null;S.month=null;S.stack[S.stack.length-1]="done";show("fade");refreshToday();
      const now=new Date();api("myAttendance",`${now.getFullYear()}-${p2(now.getMonth()+1)}`).then(m=>{S.month=m}).catch(()=>{});
    }).catch(err=>{
      if(CFG.backup&&DOWN_RE.test(err.message)){t.innerHTML='<span class="spin"></span>ระบบหลักขัดข้อง · กำลังบันทึกสำรอง…';
        return backupClock(d.clock,p,note,d.clock==="in"?S.shift||"":"").then(r=>{S.last={ok:true,backup:true,time:r.time,kind:r.kind,location:"บันทึกสำรอง (รอนำเข้า)",in_area:true,lat:p.lat,lng:p.lng};S.stack[S.stack.length-1]="done";show("fade")})
          .catch(e2=>{t.disabled=false;t.innerHTML=old;toast(e2.message)})}
      t.disabled=false;t.innerHTML=old;toast(err.message)})}}
document.addEventListener("change",e=>{const id=e.target.id;
  if(id==="wy"||id==="wm"){S.wym=`${$("#wy").value}-${p2($("#wm").value)}`;S.wdata=null;repaint();onEnter()}});
document.addEventListener("input",e=>{if(e.target.classList.contains("err")){e.target.classList.remove("err");const er=$("#"+e.target.id+"-e");if(er)er.hidden=true}});
document.addEventListener("keydown",e=>{if(e.key==="Escape")drawer(false)});
function fit(){const d=$("#device");if(innerWidth<=500){d.style.transform="";d.style.margin="";return}const s=Math.min(1,(innerHeight-48)/868);d.style.transform=s<1?`scale(${s})`:"";d.style.margin=s<1?`${-(1-s)*434}px 0`:"";}
addEventListener("resize",()=>{fit();fitChips()});fit();
const sb=()=>{const d=new Date(),el=$("#sbt");if(el)el.textContent=`${d.getHours()}:${p2(d.getMinutes())}`};sb();setInterval(sb,20000);
$("#views").innerHTML=`<div class="view white"><div class="okv"><span class="spin" style="width:34px;height:34px;border-color:var(--blue-soft);border-top-color:var(--blue)"></span><span class="muted">กำลังเปิดแอป…</span></div></div>`;
