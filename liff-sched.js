'use strict';
/* แอปพนักงาน › ตารางงาน แบบใหม่ (20 พ.ย. 2569 · ผู้ใช้อนุมัติ Figma หน้า 52 ฉบับ 4 "ใช้แบบนี้ เริ่มทำบน dev")
 * โครงเดิม Workforce Task Manager: งานของฉัน | ทั้งหมด → วันในสัปดาห์ → แผนก → ทีม → การ์ด → ปุ่มเพิ่มงาน · รายละเอียดงาน · ฟอร์มสร้าง/แก้งาน
 * ข้อมูล: wtm('mobile') อ่านอย่างเดียว · บันทึก: wtm createTask / updateTask / deleteTask ตัวเดียวกับหลังบ้าน (ตรวจสิทธิ์ซ้ำที่เซิร์ฟเวอร์)
 * 22 พ.ย. 2569: เอาสวิตช์ liff_sched2 ออกแล้ว (ผู้ใช้สั่ง) · หน้าใหม่ใช้กับทุกคน · ไฟล์นี้ไม่แก้หน้าอื่น
 * โหลดหลัง liff-v2.js · คลาส CSS ขึ้นต้น ts- (liff-sched.css) */
(function(){
const TSI={cam:'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/>',users2:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  car:'<path d="M5 17h14M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M3 17v-6l2-5h11l3 5h2v6"/>',plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  save:'<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  note:'<path d="M5 4h14v16H5z"/><path d="M8.5 9h7M8.5 13h7M8.5 17h4"/>',brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M3 12.5h18"/>',
  route:'<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H17a3.5 3.5 0 0 0 0-7H7a3.5 3.5 0 0 1 0-7h8.5"/>'};
const ti=(k,c)=>`<svg class="i${c?" "+c:""}" viewBox="0 0 24 24" aria-hidden="true">${TSI[k]||P[k]||""}</svg>`;   /* ไอคอนเส้นชุดเดียวกับแอป (P ใน liff-core.js) + ที่ขาด */
const DCOL=["#2563EB","#0D9488","#7C3AED","#EA580C","#DB2777"],DFB="#475569";
const SHT={day:["กลางวัน","08:00 – 17:00","sun"],night:["กลางคืน","18:00 – 06:00","moon"]};
const TS={d:null,from:"",sel:"",mode:"mine",dept:"",team:"",busy:0,err:"",poll:null,pm:null,pmErr:""};
const ro=()=>!!VA;
const isoAdd=(s,k)=>{const d=new Date(s+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+k);return d.toISOString().slice(0,10)};
const isoToday=()=>{const d=new Date();return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
const monOf=s=>{const w=new Date(s+"T12:00:00Z").getUTCDay();return isoAdd(s,w===0?-6:1-w)};
const dShort=s=>{const d=DT(s);return `${TH_DS[d.getDay()]} ${d.getDate()} ${TH_S[d.getMonth()]}`};
const dLong=s=>{const d=DT(s);return `วัน${TH_D[d.getDay()]} ${d.getDate()} ${TH_M[d.getMonth()]} ${d.getFullYear()+543}`};
const nDays=(a,b)=>Math.round((DT(b)-DT(a))/864e5)+1;
const rangeT=t=>t.start===t.end?dShort(t.start):`${dShort(t.start)} – ${dShort(t.end)} (${nDays(t.start,t.end)} วัน)`;
const on=()=>true;   /* 22 พ.ย. 2569: เอาสวิตช์ liff_sched2 ออก · หน้าใหม่ถาวร */
const E=c=>(TS.d&&TS.d._e||{})[c]||null;
const dcol=n=>{const i=(TS.d&&TS.d.depts||[]).indexOf(n);return i>=0&&i<DCOL.length?DCOL[i]:DFB};
const memOn=(t,day)=>{const o=t.dov&&t.dov[day];return o&&Array.isArray(o.members)?o.members:t.mem};
const mineOn=(t,day)=>TS.d&&memOn(t,day).indexOf(TS.d.me.code)>=0;
const onDay=(t,day)=>t.start<=day&&t.end>=day;
const cleanTitle=t=>t.pm&&t.title.indexOf(t.pm)===0?t.title.slice(t.pm.length).replace(/^\s*[-–]\s*/,"")||t.title:t.title;
const phSrc=e=>{if(!e)return"";if(e.ph&&/^https?:\/\//.test(API))return API.replace(/\/+$/,"")+"/photo/"+e.ph;return e.lp||""};
const avH=(c,cls)=>{const e=E(c),s=phSrc(e),n=e?e.n:c;return `<span class="ts-av${cls?" "+cls:""}">${s?`<img src="${esc(s)}" alt="" loading="lazy">`:esc(String(n||"?").slice(0,2))}</span>`};
const leaveOf=(c,day)=>TS.d&&TS.d.leaves[c+"::"+day];

/* ---------- โหลดข้อมูล ---------- */
function load(silent){if(S.today&&S.today.me&&S.today.me.msg)return Promise.resolve();
  if(!TS.from)TS.from=monOf(isoToday());if(!TS.sel)TS.sel=isoToday();
  if(!silent){TS.busy=1;TS.err=""}
  return api("wtm","mobile",{from:TS.from}).then(r=>{TS.busy=0;
    if(!r||!r.on){const was=on();LS.set("ts2",0);TS.d={on:false};if(was&&cur()==="sched")repaint();return}
    LS.set("ts2",1);const m={};(r.emps||[]).forEach(e=>{m[e.c]=e});r._e=m;
    const first=!TS.d||!TS.d.on;TS.d=r;if(first&&r.me.see!=="self"&&TS.mode==="mine"&&!TS._m){TS._m=1}
    if(r.me.see!=="all")TS.dept=r.me.dept||"";if(r.me.see==="team")TS.team=r.me.team||"";
    if(cur()==="sched"||cur().split(":")[0]==="tsd")repaint();paintFab()})
  .catch(e=>{TS.busy=0;if(!silent){TS.err=e.message;if(cur()==="sched")repaint()}})}
function startPoll(){clearInterval(TS.poll);TS.poll=setInterval(()=>{if(cur()==="sched"&&document.visibilityState==="visible"&&!$("#ts-form")&&on())load(1)},60000)}

/* ---------- หน้าตารางงาน ---------- */
function hero(d){const sel=TS.sel,mine=d?d.tasks.filter(t=>onDay(t,sel)&&mineOn(t,sel)).length:0,all=d?d.tasks.filter(t=>onDay(t,sel)).length:0;
  const seg=d&&d.me.see!=="self"?`<div class="ts-seg" role="tablist">${[["mine","user","งานของฉัน",mine],["all","users2","ทั้งหมด",all]].map(x=>`<button type="button" data-ts="mode:${x[0]}" aria-pressed="${TS.mode===x[0]}">${ti(x[1])}${x[2]}<i>${x[3]}</i></button>`).join("")}</div>`:"";
  return `<div class="ts-hero"><div class="ts-ht"><div><h1>ตารางงาน</h1><span>${dLong(sel)}</span></div><button type="button" class="ts-tdy" data-ts="today">${ti("cal")}วันนี้</button></div>${seg}</div>`}
function week(d){const td=isoToday(),cnt=day=>d.tasks.filter(t=>onDay(t,day)&&inFilter(t,day)).length;
  return `<div class="ts-wk" id="ts-wk"><button type="button" class="ts-wn" data-ts="wk:-1" aria-label="สัปดาห์ก่อน">${ti("chevL")}</button><div class="ts-wd">${[0,1,2,3,4,5,6].map(i=>{const day=isoAdd(TS.from,i),dt=DT(day),n=cnt(day),hol=(d.holidays||[]).some(h=>h.date===day);
    return `<button type="button" data-ts="day:${day}" class="${day===TS.sel?"sel":""}${day===td?" td":""}${hol||dt.getDay()===0?" off":""}" aria-pressed="${day===TS.sel}"><small>${TH_DS[dt.getDay()].replace(".","")}</small><b>${dt.getDate()}</b><em>${n?n+" งาน":"—"}</em>${day===td?"<i></i>":""}</button>`}).join("")}</div><button type="button" class="ts-wn" data-ts="wk:1" aria-label="สัปดาห์ถัดไป">${ti("chevR")}</button></div>`}
function inFilter(t,day){if(TS.mode==="mine"||TS.d.me.see==="self")return mineOn(t,day);if(TS.dept&&t.dept!==TS.dept)return false;if(TS.team&&t.team!==TS.team)return false;return true}
function deptList(d){if(d.me.see!=="all")return d.me.dept?[d.me.dept]:[];const s={};d.tasks.forEach(t=>{if(t.dept)s[t.dept]=1});Object.keys(d.sched||{}).forEach(k=>{s[k]=1});
  return Object.keys(s).sort((a,b)=>{const ai=d.depts.indexOf(a),bi=d.depts.indexOf(b);return(ai<0?99:ai)-(bi<0?99:bi)||(a<b?-1:1)})}
function teamList(d,dept){const s={};(d.sched[dept]||[]).forEach(t=>{s[t]=1});d.tasks.forEach(t=>{if(t.dept===dept&&t.team)s[t.team]=1});return Object.keys(s)}
function chips(d){if(TS.mode!=="all"||d.me.see==="self")return"";const day=TS.sel,n=f=>d.tasks.filter(t=>onDay(t,day)&&f(t)).length;
  const lab={all:"ดูได้ทั้งหมด",dept:"ดูได้ทั้งแผนก",team:"ดูได้ทั้งทีม"}[d.me.see]||"";let h="";
  if(d.me.see==="all"){const L=deptList(d);h+=`<div class="ts-fl"><div class="ts-flh"><span>แผนก</span><em>${ti("eye")}${lab}</em></div><div class="ts-chs">${[["","ทุกแผนก",n(()=>1)]].concat(L.map(x=>[x,x,n(t=>t.dept===x)])).map(x=>`<button type="button" data-ts="dept:${esc(x[0])}" aria-pressed="${TS.dept===x[0]}"${x[0]?` style="--dc:${dcol(x[0])}"`:""}>${x[0]?"<i></i>":""}${esc(x[1])}<em>${x[2]}</em></button>`).join("")}</div></div>`}
  if(TS.dept&&d.me.see!=="team"){const L=teamList(d,TS.dept);if(L.length)h+=`<div class="ts-fl"><div class="ts-flh"><span>ทีม</span>${d.me.see==="dept"?`<em>${ti("eye")}${lab}</em>`:""}</div><div class="ts-chs">${[["","ทุกทีม",n(t=>t.dept===TS.dept)]].concat(L.map(x=>[x,x,n(t=>t.dept===TS.dept&&t.team===x)])).map(x=>`<button type="button" data-ts="team:${esc(x[0])}" aria-pressed="${TS.team===x[0]}"${x[0]?` style="--dc:${dcol(TS.dept)}"`:""}>${esc(x[1])}<em>${x[2]}</em></button>`).join("")}</div></div>`}
  if(d.me.see==="team")h+=`<div class="ts-fl"><div class="ts-flh"><span>ทีม ${esc(d.me.team||"")}</span><em>${ti("eye")}${lab}</em></div></div>`;
  return h}
function card(t,day){const ppl=memOn(t,day),mine=mineOn(t,day),c=dcol(t.dept),dw=(t.daily||[]).length,nm=ppl.map(x=>(E(x)||{}).n||x).concat((t.daily||[]).map(w=>w.name||"รายวัน"));
  const veh=(t.veh||[]).map(v=>{const x=(TS.d.vehicles||[]).find(y=>y.id===v);return x?x.plate+(x.model?" · "+x.model:""):""}).filter(Boolean),vt=t.vplate||veh.join(", ");
  return `<button type="button" class="ts-card" data-ts="open:${t.id}" style="--dc:${c}"><span class="ts-top">${t.pm?`<span class="ts-p ts-pm">${ti("tag")}${esc(t.pm)}</span>`:`<span class="ts-p ts-nopm">ไม่มีเลข PM</span>`}${t.shift==="night"?`<span class="ts-p ts-nt">${ti("moon")}กะกลางคืน</span>`:`<span class="ts-p ts-dy">${ti("sun")}กะกลางวัน</span>`}${mine&&TS.mode==="all"?`<span class="ts-p ts-me">${ti("chk")}งานของฉัน</span>`:""}${t.ph?`<span class="ts-p ts-phc">${ti("cam")}${t.ph}</span>`:""}<i class="ts-sp"></i>${ti("chevR")}</span>
  <b class="ts-tt">${esc(cleanTitle(t))}</b><span class="ts-dp"><i></i>${esc(t.dept||"")}${t.team?"  ·  ทีม "+esc(t.team):""}</span>
  <span class="ts-box"><span class="ts-r">${ti("cal","c-cal")}<small>วันที่</small><b>${rangeT(t)}</b></span>${vt?`<span class="ts-r">${ti("car","c-car")}<small>รถ</small><b>${esc(vt)}</b></span>`:""}${t.site?`<span class="ts-r">${ti("pin","c-pin")}<small>สถานที่</small><b>${esc(t.site)}</b></span>`:""}</span>
  ${ppl.length+dw?`<span class="ts-pp"><span class="ts-avs">${ppl.slice(0,4).map(x=>avH(x)).join("")}</span><span class="ts-nm">${esc(nm.join(", "))}</span><b>${ppl.length+dw} คน</b></span>`:`<span class="ts-pp"><span class="ts-nm">ยังไม่ได้จัดคน</span></span>`}</button>`}
function schedView(){const d=TS.d&&TS.d.on?TS.d:null;
  if(!d)return hero(null)+`<div class="pad ts-pad">${TS.err?`<div class="empty">${esc(TS.err)}<br><button type="button" class="ts-retry" data-ts="retry">ลองใหม่</button></div>`:`<div class="skel" style="height:86px;border-radius:18px"></div><div class="skel" style="height:190px;border-radius:18px"></div><div class="skel" style="height:190px;border-radius:18px"></div>`}</div>`;
  const day=TS.sel,list=d.tasks.filter(t=>onDay(t,day)&&inFilter(t,day)).sort((a,b)=>(a.shift===b.shift?0:a.shift==="day"?-1:1)||(a.start<b.start?-1:a.start>b.start?1:0)||(a.title<b.title?-1:1));
  const dt=DT(day),head=TS.mode==="mine"||d.me.see==="self"?`งานของฉัน · วัน${TH_D[dt.getDay()]} ${dt.getDate()}`:TS.team?`${esc(TS.dept)} · ทีม ${esc(TS.team)}`:TS.dept?`${esc(TS.dept)}`:"งานทั้งหมด";
  const hol=(d.holidays||[]).find(h=>h.date===day);
  return hero(d)+`<div class="pad ts-pad">${week(d)}${chips(d)}<div class="ts-lh">${TS.dept&&TS.mode==="all"?`<i style="--dc:${dcol(TS.dept)}"></i>`:""}<b>${head}</b><em>${list.length} งาน</em></div>
  ${hol?`<div class="ts-hol">${ti("cal")}${esc(hol.name)}</div>`:""}
  ${list.length?list.map(t=>card(t,day)).join(""):`<div class="ts-emp">${ti("eye")}<span>${TS.mode==="mine"||d.me.see==="self"?"วันนี้ไม่มีงานที่คุณมีชื่ออยู่"+(d.me.see!=="self"?" · แตะ ทั้งหมด เพื่อดูงานของทีม/แผนก":""):"ไม่มีงานในวันนี้"}</span></div>`}
  ${TS.busy?"":""}</div>`}
const V0=V.sched;
V.sched=a=>{if(S.today&&S.today.me&&S.today.me.msg)return V0(a);if(!on())return V0(a);setTimeout(paintFab,0);return schedView()};

/* ปุ่ม + เพิ่มงาน (ลอยเหนือรายการ · อยู่นอกหน้าเพื่อไม่เลื่อนตาม) */
function canAdd(){return TS.d&&TS.d.on&&!ro()&&(TS.d.canAdd||[]).length}
/* วางใน #screen (ไม่ใช่ #views · หน้าเปลี่ยนหน้าใช้ลูกตัวท้ายของ #views เป็นหน้าเดิม) · ลอยเหนือแถบล่าง */
function paintFab(){const box=$("#screen");if(!box)return;let f=$("#ts-fab");const want=cur()==="sched"&&on()&&canAdd()&&!(S.today&&S.today.me&&S.today.me.msg);
  if(!want){if(f)f.remove();return}if(!f){f=document.createElement("button");f.type="button";f.id="ts-fab";f.className="ts-fab";f.dataset.ts="new";f.innerHTML=ti("plus")+"เพิ่มงาน";box.appendChild(f)}const tb=$("#tabbar");f.style.bottom=((tb&&!tb.hidden?tb.offsetHeight:0)+18)+"px"}
const PC0=paintChrome;paintChrome=function(){PC0.apply(this,arguments);paintFab()};
const OE0=onEnter;onEnter=function(){OE0.apply(this,arguments);const [n,a]=cur().split(":");if(n==="sched"){load(TS.d&&TS.d.on?1:0);startPoll()}if(n==="tsd")phLoad(a)};

/* ---------- รายละเอียดงาน ---------- */
TITLE.tsd="รายละเอียดงาน";NOTAB.push("tsd");
const task=id=>TS.d&&TS.d.on?TS.d.tasks.find(t=>String(t.id)===String(id)):null;
V.tsd=id=>{const t=task(id);if(!t)return band("รายละเอียดงาน")+`<div class="pad"><div class="empty">ไม่พบงานนี้ อาจถูกลบหรือย้ายไปสัปดาห์อื่น</div></div>`;
  const day=onDay(t,TS.sel)?TS.sel:t.start,ppl=memOn(t,day),c=dcol(t.dept),veh=(t.veh||[]).map(v=>{const x=(TS.d.vehicles||[]).find(y=>y.id===v);return x?x.plate+(x.model?" · "+x.model:""):""}).filter(Boolean);
  const rows=[["cal","c-cal","วันที่",rangeT(t)],["clock","c-clk","เวลา","กะ"+SHT[t.shift][0]+" "+SHT[t.shift][1]]].concat(t.site?[["pin","c-pin","สถานที่",t.site]]:[]).concat(veh.length?[["car","c-car","รถ",veh.join(", ")]]:[]).concat(t.pm?[["tag","c-pm","เลข PM",t.pm+(t.pmf?" · "+t.pmf:"")]]:[]).concat(t.prov?[["route","c-car","ต่างจังหวัด","ใช่"]]:[]).concat(t.notes?[["note","c-car","หมายเหตุ",t.notes]]:[]);
  return band("รายละเอียดงาน")+`<div class="ts-dh" style="--dc:${c}"><span class="ts-top">${t.pm?`<span class="ts-p ts-pm">${ti("tag")}${esc(t.pm)}</span>`:`<span class="ts-p ts-nopm">ไม่มีเลข PM</span>`}${t.shift==="night"?`<span class="ts-p ts-nt">${ti("moon")}กะกลางคืน</span>`:`<span class="ts-p ts-dy">${ti("sun")}กะกลางวัน</span>`}</span><h2>${esc(cleanTitle(t))}</h2><span class="ts-dp"><i></i>${esc(t.dept||"")}${t.team?"  ·  ทีม "+esc(t.team):""}</span>
   ${t.site?`<button type="button" class="ts-nav" data-ts="map:${t.id}">${ti("nav")}นำทางไปสถานที่</button>`:""}</div>
  <div class="pad ts-pad"><span class="ts-sec">ข้อมูลงาน</span><div class="ts-info">${rows.map(r=>`<div class="ts-ir"><span class="ts-ic ${r[1]}">${ti(r[0])}</span><span><small>${r[2]}</small><b>${esc(r[3])}</b></span></div>`).join("")}</div>
  <span class="ts-sec">ผู้เข้างาน<em>${ppl.length+(t.daily||[]).length} คน${t.start!==t.end?" · วัน"+TH_D[DT(day).getDay()]+" "+DT(day).getDate():""}</em></span><div class="ts-info">${ppl.length?ppl.map(x=>{const e=E(x),lv=leaveOf(x,day);return `<div class="ts-ir">${avH(x,"lg")}<span><b>${esc(e?e.n:x)}</b><small>${esc(e?(e.p||e.t||""):"")}</small></span>${t.bor.indexOf(x)>=0?`<span class="ts-p ts-bor">ยืมตัว</span>`:""}${lv?`<span class="ts-p ts-lv">ลา</span>`:""}</div>`}).join(""):`<div class="ts-ir"><span><small>ยังไม่ได้จัดคน</small></span></div>`}${(t.daily||[]).map(w=>`<div class="ts-ir"><span class="ts-av lg">${esc(String(w.name||"?").slice(0,2))}</span><span><b>${esc(w.name||"ไม่ระบุ")}</b><small>จ้างรายวัน${w.days?" · "+w.days+" วัน":""}</small></span></div>`).join("")}</div>
  ${phSec(t)}
  ${t.ed&&!ro()?`<div class="ts-dft"><button type="button" class="ts-del" data-ts="del:${t.id}">${ti("trash")}ลบ</button><button type="button" class="ts-edit" data-ts="edit:${t.id}">${ti("edit")}แก้ไขงาน</button></div>`:`<span class="cap" style="text-align:center">${ro()?"โหมดดูในมุมมอง · ดูอย่างเดียว":"แก้ไขงานนี้ได้เฉพาะคนที่มีสิทธิ์จัดตารางงานของทีมนี้"}</span>`}</div>`};

/* ---------- รูปหน้างาน (20 พ.ย. 2569 · ไม่บังคับ GPS: มีพิกัดก็แนบ) ---------- */
const PH_MAX=8;TS.ph={};
const phUrl=u=>/^tpimg:/.test(u||"")?(/^https?:\/\//.test(API)?API.replace(/\/+$/,""):"")+"/"+u.slice(6):(u||"");
function phLoad(id){if(!id||!TS.d||!TS.d.on)return;const P=TS.ph[id]=TS.ph[id]||{list:null};api("wtm","taskPhotos",{taskId:+id}).then(r=>{P.list=(r&&r.photos)||[];P.up=!!(r&&r.canUpload);P.mng=!!(r&&r.canManage);phCount(id);if(cur()==="tsd:"+id)repaint()}).catch(e=>{P.list=P.list||[];P.err=e.message;if(cur()==="tsd:"+id)repaint()})}
function phCount(id){const t=task(id),P=TS.ph[id];if(t&&P&&P.list)t.ph=P.list.length}
function phSec(t){const P=TS.ph[t.id]||{},L=P.list,can=P.up&&!ro()&&(!L||L.length<PH_MAX);
  return `<span class="ts-sec">รูปหน้างาน<em>${L?L.length+" รูป":""}</em></span><div class="ts-info ts-phbox">${!L?`<div class="ts-phg"><span class="skel ts-phi"></span><span class="skel ts-phi"></span></div>`:`<div class="ts-phg">${L.map(x=>`<span class="ts-phi"><img src="${esc(phUrl(x.thumbUrl))}" alt="" loading="lazy" data-ts="phview:${t.id}:${esc(x.id)}">${(x.byMe||P.mng)&&!ro()?`<button type="button" data-ts="phdel:${t.id}:${esc(x.id)}" aria-label="ลบรูป">${ti("x")}</button>`:""}${x.lat!=null?`<i title="มีพิกัด">${ti("pin")}</i>`:""}</span>`).join("")}${can?`<button type="button" class="ts-phadd" data-ts="phadd:${t.id}"${P.busy?" disabled":""}>${P.busy?'<span class="spin dk"></span><span>'+esc(P.busy)+"</span>":ti("cam")+"<span>เพิ่มรูป / ถ่ายรูป</span>"}</button>`:""}</div>${!L.length&&!can?`<span class="cap">ยังไม่มีรูปหน้างาน</span>`:""}`}</div>`}
/* ย่อรูปในเครื่องก่อนส่ง (ด้านยาว 1600 px · JPG 0.82 · แบบเดียวกับหน้าตารางงานหลังบ้าน) */
function shrink(file){return new Promise((res,rej)=>{if(!file||!/^image\//.test(file.type||""))return rej(new Error("ไฟล์ไม่ใช่รูปภาพ"));const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{let w=im.naturalWidth,h=im.naturalHeight;const M=1600;if(w>M||h>M){if(w>=h){h=Math.round(h*M/w);w=M}else{w=Math.round(w*M/h);h=M}}const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);URL.revokeObjectURL(u);
    const b=c.toDataURL("image/jpeg",.82);res({base64:b,mimeType:"image/jpeg",filename:String(file.name||"photo").replace(/\.[^.]+$/,"")+".jpg",url:b})};im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("เปิดรูปไม่สำเร็จ"))};im.src=u})}
function pickPhotos(cb){let el=$("#ts-file");if(!el){el=document.createElement("input");el.type="file";el.id="ts-file";el.accept="image/*";el.multiple=true;el.hidden=true;document.body.appendChild(el)}
  el.value="";el.onchange=()=>{const f=[...(el.files||[])];if(f.length)cb(f)};el.click()}
/* พิกัดไม่บังคับ: ขอแบบเร็ว (ไม่เกิน 4 วิ) ได้ก็แนบ ไม่ได้ก็อัปต่อ */
const quickGps=()=>new Promise(r=>{if(!navigator.geolocation)return r(null);let done=0;const end=v=>{if(!done){done=1;r(v)}};setTimeout(()=>end(null),4000);
  try{navigator.geolocation.getCurrentPosition(p=>end({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}),()=>end(null),{enableHighAccuracy:false,timeout:3500,maximumAge:120000})}catch(_){end(null)}});
function phUpload(id,list){return quickGps().then(g=>api("wtm","addTaskPhotos",Object.assign({taskId:+id,files:list.map(x=>({base64:x.base64,mimeType:x.mimeType,filename:x.filename}))},g||{}))).then(r=>{if(!r||r.ok===false)throw new Error((r&&r.error)||"อัปโหลดไม่สำเร็จ");
  const P=TS.ph[id]=TS.ph[id]||{list:[]};P.list=(P.list||[]).concat(r.photos||[]);phCount(id);return(r.photos||[]).length})}
function phAddTo(id,files){const P=TS.ph[id]=TS.ph[id]||{list:[]},room=PH_MAX-(P.list||[]).length;if(room<=0)return toast("งานหนึ่งแนบรูปได้ไม่เกิน "+PH_MAX+" รูป");
  if(files.length>room)toast("แนบได้อีก "+room+" รูป · เลือก "+room+" รูปแรก");P.busy="กำลังเตรียมรูป…";repaint();
  Promise.all(files.slice(0,room).map(f=>shrink(f))).then(l=>{P.busy="กำลังอัปโหลด "+l.length+" รูป…";repaint();return phUpload(id,l)}).then(n=>{P.busy="";toast("อัปโหลดรูปแล้ว "+n+" รูป");if(cur()==="tsd:"+id)repaint()})
  .catch(e=>{P.busy="";toast(e.message);if(cur()==="tsd:"+id)repaint()})}

/* ---------- ฟอร์มสร้าง / แก้งาน ---------- */
const F={};
function openForm(t){const d=TS.d,ca=d.canAdd;let dept=t?t.dept:"",team=t?t.team:"";
  if(!t){const mine=ca.find(x=>x.d===d.me.dept&&x.t===d.me.team);const f0=mine||ca.find(x=>(!TS.dept||x.d===TS.dept)&&(!TS.team||x.t===TS.team))||ca[0];dept=f0.d;team=f0.t}
  Object.assign(F,{id:t?t.id:0,dept,team,start:t?t.start:TS.sel,end:t?t.end:TS.sel,shift:t?t.shift:"day",pm:t?t.pm:"",pmf:t?t.pmf:"",nopm:t?!t.pm:false,title:t&&!t.pm?t.title:"",site:t?t.site:"",
    mem:t?t.mem.filter(c=>t.bor.indexOf(c)<0):[],bor:t?t.bor.slice():[],daily:t?(t.daily||[]).map(w=>Object.assign({},w)):[],veh:t?(t.veh||[]).slice():[],prov:t?t.prov:false,notes:t?t.notes:"",q:"",bq:"",err:"",ph:[]});
  if(d.me.pm&&!TS.pm&&!TS.pmErr)api("wtm","confirmedProjects").then(r=>{if(r&&r.ok!==false){TS.pm=r.rows||[]}else TS.pmErr=(r&&r.error)||"โหลดรายการ PM ไม่สำเร็จ"}).catch(e=>{TS.pmErr=e.message});
  $("#ov").innerHTML=`<div class="scrim ts-scrim" style="inset:0"></div><div class="ts-sh" id="ts-form" role="dialog" aria-modal="true" aria-label="${t?"แก้ไขงาน":"สร้างงานใหม่"}"><div class="ts-shh"><div class="grab"></div><div class="ts-shr"><div><h3>${t?"แก้ไขงาน":"สร้างงานใหม่"}</h3><small>ช่องที่มี * ต้องกรอก · บันทึกแล้วขึ้นในตารางงานของทุกคนทันที</small></div><button type="button" class="ts-x" data-ts="close" aria-label="ปิด">${ti("x")}</button></div>
   <div class="ts-stp">${[["1","งาน"],["2","ทีม & วัน"],["3","คน"],["4","อื่น ๆ"]].map((x,i)=>`<button type="button" data-ts="step:${i}" class="${i===0?"on":""}"><i></i>${x[0]} ${x[1]}</button>`).join("")}</div></div>
   <div class="ts-shb" id="ts-shb"></div><div class="ts-shf"><span class="ts-sum" id="ts-sum"></span><button type="button" class="ts-cancel" data-ts="close">ยกเลิก</button><button type="button" class="ts-save" data-ts="save">${ti("save")}บันทึก</button></div></div>`;
  paintForm();const b=$("#ts-shb");b.addEventListener("scroll",stepSync,{passive:true})}
function teamPeople(){return(TS.d.emps||[]).filter(e=>e.d===F.dept&&e.t===F.team)}
function lvInRange(c){const out=[];if(!F.start||!F.end||F.end<F.start)return out;for(let d=F.start,i=0;d<=F.end&&i<62;d=isoAdd(d,1),i++){if(leaveOf(c,d))out.push(d)}return out}
function paintForm(){const b=$("#ts-shb");if(!b)return;const st=b.scrollTop,d=TS.d,ca=d.canAdd,depts=[...new Set(ca.map(x=>x.d))],teams=ca.filter(x=>x.d===F.dept).map(x=>x.t);
  const days=F.start&&F.end&&F.end>=F.start?nDays(F.start,F.end):0,tp=teamPeople(),q=F.q.trim().toLowerCase();
  const pmRes=!F.nopm&&F._pmq!=null?pmSearch(F._pmq):null;
  b.innerHTML=`${F.err?`<div class="ts-er">${esc(F.err)}</div>`:""}
  <section class="ts-g" data-g="0"><div class="ts-gh"><i style="background:#2563EB">1</i><b>ข้อมูลงาน</b>${ti("brief","c-cal")}</div>
   <div class="ts-pmb${F.nopm?" off":""}">${F.nopm?"":`<div class="ts-2"><label class="ts-f" style="flex:0 0 40%"><span>เลข PM <em>*</em></span><span class="ts-in">${ti("search")}<input id="ts-pm" value="${esc(F.pm)}" placeholder="ค้นหา PM" autocomplete="off"></span></label><label class="ts-f"><span>File Name <em>*</em></span><span class="ts-in"><input id="ts-pmf" value="${esc(F.pmf)}" placeholder="ชื่อไฟล์งาน" autocomplete="off"></span></label></div>
    ${pmRes?`<div class="ts-pmr">${pmRes}</div>`:""}${F.pm&&F.pmf&&TS.pm&&TS.pm.some(r=>r[0]===F.pm)?`<span class="ts-ok">${ti("chk")}พบในข้อมูล Confirmed</span>`:""}`}
    <label class="ts-ck"><input type="checkbox" id="ts-nopm" ${F.nopm?"checked":""}><span></span><b>งานนี้ไม่มีเลข PM</b><small>ติ๊กแล้วกรอกชื่องานเอง</small></label></div>
   ${F.nopm?`<label class="ts-f"><span>ชื่องาน <em>*</em></span><span class="ts-in"><input id="ts-title" value="${esc(F.title)}" placeholder="เช่น ตรวจเช็กจอประจำเดือน"></span></label>`:""}
   <label class="ts-f"><span>รายละเอียดงาน</span><span class="ts-in ta">${ti("pin")}<textarea id="ts-site" rows="2" placeholder="สถานที่ / รายละเอียดเพิ่มเติม">${esc(F.site)}</textarea></span></label></section>
  <section class="ts-g" data-g="1"><div class="ts-gh"><i style="background:#0D9488">2</i><b>ทีมและวันที่</b>${ti("cal","c-tl")}</div>
   <div class="ts-2"><label class="ts-f"><span>แผนก <em>*</em></span><span class="ts-in sel"><select id="ts-dept">${depts.map(x=>`<option${x===F.dept?" selected":""}>${esc(x)}</option>`).join("")}</select>${ti("chevD")}</span></label><label class="ts-f"><span>ทีม <em>*</em></span><span class="ts-in sel"><select id="ts-team">${teams.map(x=>`<option${x===F.team?" selected":""}>${esc(x)}</option>`).join("")}</select>${ti("chevD")}</span></label></div>
   <div class="ts-2"><label class="ts-f"><span>วันเริ่ม <em>*</em></span><span class="ts-in"><input type="date" id="ts-start" value="${F.start}"></span></label><label class="ts-f"><span>วันสิ้นสุด <em>*</em></span><span class="ts-in"><input type="date" id="ts-end" value="${F.end}" min="${F.start}"></span></label></div>
   ${days?`<span class="ts-days">${ti("clock")}รวม ${days} วัน · ${F.start===F.end?dShort(F.start):dShort(F.start)+" – "+dShort(F.end)}</span>`:""}
   <span class="ts-lb">กะการทำงาน</span><div class="ts-2">${["day","night"].map(k=>`<button type="button" class="ts-shc ${k}${F.shift===k?" on":""}" data-ts="shift:${k}" aria-pressed="${F.shift===k}"><span class="ts-shi">${ti(SHT[k][2])}</span><span><b>${SHT[k][0]}</b><small>${SHT[k][1]}</small></span>${F.shift===k?`<i>${ti("chk")}</i>`:""}</button>`).join("")}</div></section>
  <section class="ts-g" data-g="2"><div class="ts-gh"><i style="background:#7C3AED">3</i><b>ผู้เข้างาน</b><span class="ts-cnt">เลือก ${F.mem.length+F.bor.length+F.daily.length} คน</span></div>
   <span class="ts-in">${ti("search")}<input id="ts-q" value="${esc(F.q)}" placeholder="ค้นหาชื่อในทีม ${esc(F.team)}…" autocomplete="off"></span>
   <div class="ts-ml">${tp.filter(e=>!q||(e.n+" "+e.f+" "+e.p).toLowerCase().indexOf(q)>=0).map(e=>{const l=lvInRange(e.c),all=l.length&&l.length===days,s=F.mem.indexOf(e.c)>=0;
     return `<button type="button" class="ts-mr${s?" on":""}${all?" dis":""}" data-ts="mem:${e.c}" ${all?"disabled":""} aria-pressed="${s}"><span class="ts-cb">${s?ti("chk"):""}</span>${avH(e.c)}<span class="ts-mn"><b>${esc(e.n)}</b><small>${esc(e.p||"")}</small></span>${l.length?`<span class="ts-p ts-lv">ลา ${l.length===1?dShort(l[0]).replace(/^\S+ /,""):l.length+" วัน"}</span>`:""}</button>`}).join("")||`<span class="cap" style="padding:12px">ไม่มีพนักงานในทีมนี้</span>`}</div>
   <div class="ts-sub"><i style="background:#D97706"></i><b>ยืมตัวจากทีมอื่น</b></div>
   <div class="ts-bw">${F.bor.map(c=>{const e=E(c);return `<span class="ts-bc">${avH(c,"sm")}${esc(e?e.n:c)}${e&&e.t?" · "+esc(e.t):""}<button type="button" data-ts="unbor:${c}" aria-label="เอาออก">${ti("x")}</button></span>`}).join("")}</div>
   <span class="ts-in">${ti("search")}<input id="ts-bq" value="${esc(F.bq)}" placeholder="ค้นหาชื่อพนักงานทีมอื่น…" autocomplete="off"></span>${F.bq.trim()?`<div class="ts-pmr">${borSearch(F.bq)}</div>`:""}
   <div class="ts-sub"><i style="background:#7C3AED"></i><b>จ้างรายวัน</b><button type="button" class="ts-addw" data-ts="addw">${ti("plus")}เพิ่ม</button></div>
   ${F.daily.length?F.daily.map((w,i)=>`<div class="ts-dw"><input data-dw="name:${i}" value="${esc(w.name||"")}" placeholder="ชื่อ"><input data-dw="days:${i}" value="${esc(w.days||1)}" inputmode="numeric" placeholder="วัน"><input data-dw="wage:${i}" value="${esc(w.wage||"")}" inputmode="numeric" placeholder="ค่าแรง/วัน"><button type="button" data-ts="delw:${i}" aria-label="ลบ">${ti("x")}</button></div>`).join(""):`<span class="cap">ยังไม่มี · กด เพิ่ม เพื่อใส่ชื่อ จำนวนวัน และค่าแรง</span>`}</section>
  <section class="ts-g" data-g="3"><div class="ts-gh"><i style="background:#EA580C">4</i><b>รถและอื่น ๆ</b>${ti("car","c-or")}</div>
   <span class="ts-lb">รถ <small>(เลือกได้มากกว่า 1 คัน)</small></span><div class="ts-bw">${F.veh.map(v=>{const x=(d.vehicles||[]).find(y=>y.id===v);return `<span class="ts-vc">${ti("car")}${esc(x?x.plate+(x.model?" · "+x.model:""):v)}<button type="button" data-ts="unveh:${esc(v)}" aria-label="เอาออก">${ti("x")}</button></span>`}).join("")}
    <span class="ts-in sel sm">${ti("plus")}<select id="ts-veh"><option value="">เพิ่มรถ…</option>${(d.vehicles||[]).filter(v=>F.veh.indexOf(v.id)<0).map(v=>`<option value="${esc(v.id)}">${esc(v.plate+(v.model?" · "+v.model:""))}</option>`).join("")}</select></span></div>
   <label class="ts-pv"><span class="ts-ic c-car">${ti("route")}</span><span><b>งานต่างจังหวัด</b><small>ค่าเบี้ยตาม ตั้งค่า › ตารางงาน</small></span><input type="checkbox" id="ts-prov" ${F.prov?"checked":""}><i class="ts-sw"></i></label>
   <label class="ts-f"><span>หมายเหตุ</span><span class="ts-in ta">${ti("note")}<textarea id="ts-notes" rows="2" placeholder="เช่น นัดเข้าพื้นที่ 19:00">${esc(F.notes)}</textarea></span></label>
   <span class="ts-lb">รูปหน้างาน <small>(ไม่เกิน ${PH_MAX} รูป)</small></span>${F.id?`<span class="cap">เพิ่ม / ลบรูปของงานนี้ได้ที่หน้ารายละเอียดงาน</span>`:`<div class="ts-phg">${F.ph.map((x,i)=>`<span class="ts-phi"><img src="${x.url}" alt=""><button type="button" data-ts="unph:${i}" aria-label="เอารูปออก">${ti("x")}</button></span>`).join("")}${F.ph.length<PH_MAX?`<button type="button" class="ts-phadd" data-ts="pickf">${ti("cam")}<span>เพิ่มรูป / ถ่ายรูป</span></button>`:""}</div>${F.ph.length?`<span class="cap">อัปโหลดให้หลังกดบันทึกงาน</span>`:""}`}</section>`;
  b.scrollTop=st;sumSync()}
function pmSearch(q){if(TS.pmErr)return `<span class="cap" style="padding:10px 12px">${esc(TS.pmErr)} · พิมพ์เลข PM และ File Name เองได้</span>`;if(!TS.pm)return TS.d.me.pm?`<div style="padding:10px 12px;display:flex;flex-direction:column;gap:8px" aria-busy="true" aria-label="กำลังโหลดรายการ PM"><div class="skel" style="height:12px;width:62%"></div><div class="skel" style="height:12px;width:48%"></div><div class="skel" style="height:12px;width:56%"></div></div>`:"";
  q=q.trim().toLowerCase();if(!q)return"";const L=TS.pm.filter(r=>(r[0]+" "+r[1]).toLowerCase().indexOf(q)>=0).slice(0,8);
  return L.length?L.map(r=>`<button type="button" data-ts="pmpick:${esc(r[0])}"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></button>`).join(""):`<span class="cap" style="padding:10px 12px">ไม่พบ · พิมพ์ File Name เองได้</span>`}
function borSearch(q){q=q.trim().toLowerCase();const L=(TS.d.emps||[]).filter(e=>!(e.d===F.dept&&e.t===F.team)&&F.bor.indexOf(e.c)<0&&(e.n+" "+e.f+" "+e.t).toLowerCase().indexOf(q)>=0).slice(0,8);
  return L.length?L.map(e=>`<button type="button" data-ts="bor:${e.c}">${avH(e.c,"sm")}<b>${esc(e.n)}</b><span>${esc(e.f)} · ${esc(e.t||e.d)}</span></button>`).join(""):`<span class="cap" style="padding:10px 12px">ไม่พบชื่อ</span>`}
function sumSync(){const s=$("#ts-sum");if(!s)return;const n=F.mem.length+F.bor.length+F.daily.length;s.innerHTML=`<small>${F.team?esc(F.team)+" · ":""}${F.start?dShort(F.start).replace(/^\S+ /,"")+(F.end&&F.end!==F.start?" – "+dShort(F.end).replace(/^\S+ /,""):""):""}</small><b>${n} คน${F.bor.length?" (ยืม "+F.bor.length+")":""}${F.veh.length?" · รถ "+F.veh.length+" คัน":""}</b>`}
function stepSync(){const b=$("#ts-shb");if(!b)return;const gs=[...b.querySelectorAll(".ts-g")];let k=0;gs.forEach((g,i)=>{if(g.offsetTop-b.offsetTop-60<=b.scrollTop)k=i});if(b.scrollTop+b.clientHeight>=b.scrollHeight-4)k=gs.length-1;document.querySelectorAll(".ts-stp button").forEach((x,i)=>x.classList.toggle("on",i<=k))}
function closeForm(){$("#ov").innerHTML=""}
function save(btn){F.err="";const title=F.nopm?F.title.trim():(F.pm.trim()+" - "+F.pmf.trim());
  if(!F.nopm&&!(F.pm.trim()&&F.pmf.trim()))F.err='กรอกเลข PM และ File Name หรือติ๊ก "งานนี้ไม่มีเลข PM"';
  else if(F.nopm&&!title)F.err="กรอกชื่องาน";else if(!F.dept||!F.team)F.err="เลือกแผนกและทีม";else if(!F.start||!F.end)F.err="เลือกวันเริ่มและวันสิ้นสุด";else if(F.end<F.start)F.err="วันสิ้นสุดต้องไม่ก่อนวันเริ่ม";
  if(F.err){paintForm();$("#ts-shb").scrollTop=0;return}
  const t0=F.id?task(F.id):null,mem=F.mem.concat(F.bor.filter(c=>F.mem.indexOf(c)<0));
  const data={title,site:F.site.trim(),deptName:F.dept,teamName:F.team,start:F.start,end:F.end,vehicleId:F.veh[0]||"",vehicleIds:F.veh.slice(),isProvince:!!F.prov,members:mem,borrowedMembers:F.bor.slice(),
    dailyWorkers:F.daily.filter(w=>(w.name||"").trim()||+w.wage).map(w=>({name:(w.name||"").trim()||"ไม่ระบุ",days:parseInt(w.days,10)||1,wage:parseFloat(w.wage)||0})),shift:F.shift,notes:F.notes.trim(),pmCode:F.nopm?"":F.pm.trim(),pmFileName:F.nopm?"":F.pmf.trim()};
  if(!t0){data.otHours=0;data.customer="";data.status="pending"}else data.id=t0.id;
  btn.disabled=true;const old=btn.innerHTML;btn.innerHTML='<span class="spin"></span>กำลังบันทึก…';
  api("wtm",t0?"updateTask":"createTask",data).then(r=>{if(!r||r.ok===false)throw new Error((r&&(r.error||r.msg))||"บันทึกไม่สำเร็จ");
    const pend=!t0&&r.id&&F.ph.length?F.ph.slice():null;closeForm();toast(t0?"บันทึกการแก้ไขแล้ว":"สร้างงานแล้ว"+(pend?" · กำลังอัปโหลดรูป…":""));TS.sel=F.start;const m=monOf(F.start);if(m!==TS.from){TS.from=m}
    if(pend)phUpload(r.id,pend).then(n=>{toast("อัปโหลดรูปแล้ว "+n+" รูป");load(1)}).catch(e=>toast("สร้างงานแล้ว แต่อัปโหลดรูปไม่สำเร็จ: "+e.message+" · เพิ่มรูปได้ที่หน้ารายละเอียดงาน"));return load(1)})
  .catch(e=>{btn.disabled=false;btn.innerHTML=old;F.err=e.message;paintForm();const b=$("#ts-shb");if(b)b.scrollTop=0})}

/* ---------- ปุ่ม / ช่องกรอก ---------- */
document.addEventListener("click",e=>{const t=e.target.closest("[data-ts]");if(!t)return;const [k,...r]=t.dataset.ts.split(":"),v=r.join(":");
  if(k==="mode"){TS.mode=v;if(v==="all"&&TS.d&&TS.d.me.see==="all"){}repaint();return}
  if(k==="today"){TS.sel=isoToday();const m=monOf(TS.sel);if(m!==TS.from){TS.from=m;TS.d=Object.assign({},TS.d,{tasks:[]});repaint();load(1)}else repaint();return}
  if(k==="day"){TS.sel=v;repaint();return}
  if(k==="wk"){TS.from=isoAdd(TS.from,7*(+v));TS.sel=isoAdd(TS.sel,7*(+v));const dd=TS.d;if(dd&&dd.on)TS.d=Object.assign({},dd,{tasks:[]});repaint();load(1);return}
  if(k==="dept"){TS.dept=v;TS.team="";repaint();return}
  if(k==="team"){TS.team=v;repaint();return}
  if(k==="retry"){load(0);repaint();return}
  if(k==="open"){go("tsd:"+v);return}
  if(k==="map"){const x=task(v);if(!x)return;const u="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.site);try{if(window.liff&&liff.openWindow)liff.openWindow({url:u,external:true});else window.open(u,"_blank")}catch(_){window.open(u,"_blank")}return}
  if(k==="new"){if(canAdd())openForm(null);return}
  if(k==="phadd"){pickPhotos(files=>phAddTo(+v,files));return}
  if(k==="phview"){const P=TS.ph[r[0]];const x=P&&P.list.find(p=>p.id===r[1]);if(x)$("#ov").innerHTML=`<div class="ts-view" data-ts="phclose"><img src="${esc(phUrl(x.thumbUrl))}" alt=""><span>${esc(x.uploadedByName||"")} · ${esc(String(x.uploadedAt||"").slice(0,16).replace("T"," "))}</span><button type="button" data-ts="phclose" aria-label="ปิด">${ti("x")}</button></div>`;return}
  if(k==="phclose"){$("#ov").innerHTML="";return}
  if(k==="phdel"){const [tid,pid]=r;sheet(`<h3>ลบรูปนี้?</h3><span class="cap" style="text-align:center">ลบแล้วรูปหายจากงานนี้ทุกหน้า</span><button type="button" class="btn ts-delok" data-ts="phdelok:${tid}:${pid}">ลบรูป</button><button type="button" class="btn out" data-dclose>ยกเลิก</button>`);return}
  if(k==="phdelok"){const [tid,pid]=r;t.disabled=true;api("wtm","deleteTaskPhoto",{id:pid}).then(x=>{if(!x||x.ok===false)throw new Error((x&&x.error)||"ลบไม่สำเร็จ");$("#ov").innerHTML="";const P=TS.ph[tid];if(P)P.list=P.list.filter(p=>p.id!==pid);phCount(tid);toast("ลบรูปแล้ว");if(cur()==="tsd:"+tid)repaint()}).catch(e=>{$("#ov").innerHTML="";toast(e.message)});return}
  if(k==="edit"){const x=task(v);if(x&&x.ed&&!ro())openForm(x);return}
  if(k==="del"){const x=task(v);if(!x)return;sheet(`<h3>ลบงานนี้?</h3><span class="cap" style="text-align:center">${esc(cleanTitle(x))}<br>${rangeT(x)} · ลบแล้วหายจากตารางงานของทุกคน</span><button type="button" class="btn ts-delok" data-ts="delok:${x.id}">ลบงาน</button><button type="button" class="btn out" data-dclose>ยกเลิก</button>`);return}
  if(k==="delok"){t.disabled=true;t.innerHTML='<span class="spin"></span>กำลังลบ…';api("wtm","deleteTask",{id:+v}).then(r=>{if(!r||r.ok===false)throw new Error((r&&r.error)||"ลบไม่สำเร็จ");$("#ov").innerHTML="";toast("ลบงานแล้ว");if(cur().split(":")[0]==="tsd"){back();if(history.state&&history.state.pm){S.skipPop=1;history.back()}}return load(1)}).catch(er=>{$("#ov").innerHTML="";toast(er.message)});return}
  if(!$("#ts-form"))return;
  if(k==="close"){closeForm();return}
  if(k==="save"){save(t);return}
  if(k==="step"){const g=document.querySelector(`.ts-g[data-g="${v}"]`),b=$("#ts-shb");if(g&&b)b.scrollTo({top:g.offsetTop-b.offsetTop-8,behavior:"smooth"});return}
  if(k==="shift"){F.shift=v;paintForm();return}
  if(k==="mem"){const i=F.mem.indexOf(v);if(i>=0)F.mem.splice(i,1);else F.mem.push(v);paintForm();return}
  if(k==="bor"){if(F.bor.indexOf(v)<0)F.bor.push(v);F.bq="";paintForm();return}
  if(k==="unbor"){F.bor=F.bor.filter(c=>c!==v);paintForm();return}
  if(k==="addw"){F.daily.push({name:"",days:1,wage:""});paintForm();return}
  if(k==="delw"){F.daily.splice(+v,1);paintForm();return}
  if(k==="unveh"){F.veh=F.veh.filter(x=>x!==v);paintForm();return}
  if(k==="pickf"){pickPhotos(files=>{Promise.all(files.slice(0,PH_MAX-F.ph.length).map(f=>shrink(f).catch(()=>null))).then(l=>{l.filter(Boolean).forEach(x=>F.ph.push(x));paintForm()})});return}
  if(k==="unph"){F.ph.splice(+v,1);paintForm();return}
  if(k==="pmpick"){const row=(TS.pm||[]).find(x=>x[0]===v);if(row){F.pm=row[0];F.pmf=row[1]}F._pmq=null;paintForm();return}
});
/* ช่องพิมพ์: เก็บค่าลง F · ช่องค้นหาวาดรายการใหม่โดยคงเคอร์เซอร์ */
const keepFocus=(id,fn)=>{const el=$("#"+id),p=el?el.selectionStart:null;fn();const n=$("#"+id);if(n){n.focus();if(p!=null)try{n.setSelectionRange(p,p)}catch(_){}}};
document.addEventListener("input",e=>{const el=e.target;if(!el.closest||!el.closest("#ts-form"))return;const id=el.id;
  if(id==="ts-pm"){F.pm=el.value;F._pmq=el.value;keepFocus(id,paintForm);return}
  if(id==="ts-pmf"){F.pmf=el.value;return}
  if(id==="ts-title"){F.title=el.value;return}if(id==="ts-site"){F.site=el.value;return}if(id==="ts-notes"){F.notes=el.value;return}
  if(id==="ts-q"){F.q=el.value;keepFocus(id,paintForm);return}
  if(id==="ts-bq"){F.bq=el.value;keepFocus(id,paintForm);return}
  if(el.dataset.dw){const [f,i]=el.dataset.dw.split(":");if(F.daily[+i])F.daily[+i][f]=el.value;sumSync();return}});
document.addEventListener("change",e=>{const el=e.target;if(!el.closest||!el.closest("#ts-form"))return;const id=el.id;
  if(id==="ts-nopm"){F.nopm=el.checked;paintForm();return}
  if(id==="ts-dept"){F.dept=el.value;const tl=TS.d.canAdd.filter(x=>x.d===F.dept);F.team=tl.length?tl[0].t:"";F.mem=[];paintForm();return}
  if(id==="ts-team"){F.team=el.value;F.mem=[];paintForm();return}
  if(id==="ts-start"){F.start=el.value;if(F.end<F.start)F.end=F.start;paintForm();return}
  if(id==="ts-end"){F.end=el.value;paintForm();return}
  if(id==="ts-veh"){if(el.value&&F.veh.indexOf(el.value)<0)F.veh.push(el.value);paintForm();return}
  if(id==="ts-prov"){F.prov=el.checked;return}});
/* ปัดซ้าย/ขวาที่แถบสัปดาห์ = เปลี่ยนสัปดาห์ */
let sx=null;document.addEventListener("touchstart",e=>{sx=e.target.closest&&e.target.closest("#ts-wk")?e.touches[0].clientX:null},{passive:true});
document.addEventListener("touchend",e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50){const b=document.querySelector(`[data-ts="wk:${dx<0?1:-1}"]`);if(b)b.click()}},{passive:true});
window.__ts=TS;
})();
