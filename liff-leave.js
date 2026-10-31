'use strict';
/* แอปพนักงาน (liff.html) แยกเป็นไฟล์ตามหน้า (31 ต.ค. 2569) · ลำดับโหลดมีผล: core → home → messenger → auth → nav → leave (leave เรียก start() ท้ายสุด)
 * ทุกไฟล์ใช้ตัวแปรระดับบนสุดร่วมกัน · โค้ดที่รันตอนโหลดเรียกได้เฉพาะของที่ประกาศในไฟล์ก่อนหน้า (ฟังก์ชันไม่ hoist ข้ามไฟล์)
 * ไฟล์นี้: การลา (ฟอร์ม · ตรวจสอบ · รายละเอียด · โควตา · เอกสาร) · อนุมัติ (หัวหน้า/HR) · sheet · เรียก start() ท้ายสุด */
/* ===== โมดูลการลา (Phase 2c) · หน้าตาตาม Figma หน้า 05 section "LIFF · โมดูลการลา" ===== */
const PART={full:"เต็มวัน",am:"ครึ่งวันเช้า",pm:"ครึ่งวันบ่าย"};
const LST={wait:["รอหัวหน้าอนุมัติ","c-orange"],mgr:["รอผู้อนุมัติขั้นที่ 2","c-orange"],hr:["รอ HR อนุมัติ","c-orange"],ok:["อนุมัติแล้ว","c-green"],chg:["รออนุมัติการยกเลิก","c-blue"],back:["ส่งกลับแก้ไข","c-yellow"],no:["ไม่อนุมัติ","c-red"],cancel:["ยกเลิกแล้ว","c-grey"]};
const lchip=(st,ap)=>`<span class="chip ${(LST[st]||["",""])[1]} mini" style="white-space:nowrap">${ap&&st==="wait"?"รออนุมัติ":(LST[st]||[st])[0]}</span>`;
const nt=(c,i,t)=>`<div class="note ${c}">${ic(i)}<span>${t}</span></div>`;
const er=(i,t)=>`<div class="eff">${ic(i)}<span>${t}</span></div>`;
const ISO=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const addD=(s,n)=>{const d=DT(s);d.setDate(d.getDate()+n);return ISO(d)};
const fD=s=>{const d=DT(s);return `${TH_DS[d.getDay()]} ${d.getDate()} ${TH_S[d.getMonth()]}`};
const fDY=s=>{const d=DT(s);return `${d.getDate()} ${TH_S[d.getMonth()]} ${d.getFullYear()+543}`};
const nd=n=>(n%1?n.toFixed(1):n)+" วัน";
const rangeTxt=(a,b)=>!a?"—":a===b||!b?fDY(a):(a.slice(0,7)===b.slice(0,7)?`${DT(a).getDate()}–${fDY(b)}`:`${fDY(a)} – ${fDY(b)}`);
const tl=steps=>steps.map((s,i,a)=>`<div class="tli"><span class="tlr"><i style="background:${s[3]?s[0]:"#fff"};border-color:${s[0]}"></i>${i<a.length-1?"<em></em>":""}</span><span><span style="display:block">${s[1]}</span><span class="cap">${s[2]}</span></span></div>`).join("");
const ACT={ok:"อนุมัติ",partial:"อนุมัติบางวัน",no:"ไม่อนุมัติ",back:"ส่งกลับแก้ไข",ack:"HR รับทราบ"};
function stepsOf(r){const A=[["var(--green)","ยื่นคำขอ",esc(r.employee||"คุณ")+" · "+fAt(r.created_at),true]];
  (r.history||[]).forEach(h=>A.push([h.action==="no"?"var(--red)":h.action==="back"?"var(--yellow)":"var(--green)",(h.step==="hr"?"HR":h.step==="mgr"?"ขั้นที่ 2":"ขั้นที่ 1")+" · "+(ACT[h.action]||h.action),esc(h.by)+" · "+fAt(h.at)+(h.note?" · "+esc(h.note):""),true]));
  if(r.status==="wait")A.push(["var(--orange)","หัวหน้าทีม"+(L.info&&L.info.lead&&!r.mine_lead?" · "+esc(L.info.lead):""),"รอพิจารณา",false]);
  if(r.status==="mgr")A.push(["var(--orange)","ผู้อนุมัติขั้นที่ 2","รอพิจารณา",false]);
  if(r.status==="hr")A.push(["var(--orange)","ฝ่ายบุคคล (HR)","รออนุมัติ",false]);
  if(r.status==="chg")A.push(["var(--orange)","หัวหน้าทีม","รอพิจารณาการยกเลิก · วันลาเดิมยังมีผล",false]);
  if(r.status==="back")A.push(["var(--yellow)","รอคุณแก้ไขแล้วส่งใหม่","",false]);return A}
const fAt=s=>{if(!s)return "";const d=new Date(s);return isNaN(d)?s:`${d.getDate()} ${TH_S[d.getMonth()]} · ${p2(d.getHours())}:${p2(d.getMinutes())}`};

const L={info:null,f:null,pv:null,pvT:null,det:{},aps:null,apf:"wait",mrf:"all"};
function loadLeave(force){if(L.info&&!force)return Promise.resolve(L.info);return api("leaveInfo").then(i=>{L.info=i;LS.set("leave",i);return i})}
const curV=()=>cur().split(":")[0];
const lvRepaint=()=>{if(["leave","lvsum","lvdetail","approve","apdetail","quota","myreqs","home","req","sched"].includes(curV()))repaint()};

/* ---------- ฟอร์มขอลา ---------- */
function newLeaveForm(edit){const i=L.info,t0=i.types[0];
  L.f=edit?{edit_id:edit.id,type_id:edit.type_id,a:edit.days[0].date,b:edit.days[edit.days.length-1].date,parts:Object.fromEntries(edit.days.map(x=>[x.date,x.part])),reason:edit.reason,substitute_id:"",mon:edit.days[0].date.slice(0,7),pick:0}
    :{type_id:t0?t0.id:"",a:null,b:null,parts:{},reason:"",substitute_id:"",mon:i.today.slice(0,7),pick:0};L.pv=null}
const offDay=s=>{const i=L.info;return !!i.holidays.find(h=>h.date===s)||i.workDays.indexOf(DT(s).getDay())<0};
function fDays(f){if(!f.a)return [];const o=[];for(let s=f.a;s<=(f.b||f.a);s=addD(s,1))if(!offDay(s))o.push({date:s,part:f.parts[s]||"full"});return o}
function reqObj(){const f=L.f;return {type_id:f.type_id,date_from:f.a,date_to:f.b||f.a,parts:f.parts,reason:f.reason,substitute_id:f.substitute_id,edit_id:f.edit_id||""}}
function runPreview(){clearTimeout(L.pvT);const f=L.f;if(!f||!f.a){L.pv=null;return}
  L.pvT=setTimeout(()=>{api("previewLeave",reqObj()).then(p=>{L.pv=p;if(curV()==="leave")paintLeaveChecks()}).catch(()=>{})},250)}
function cal(f){const [y,m]=f.mon.split("-").map(Number),first=new Date(y,m-1,1),start=addD(ISO(first),-first.getDay()),dim=new Date(y,m,0).getDate(),cells=Math.ceil((first.getDay()+dim)/7)*7,i=L.info;
  const minMon=i.today.slice(0,7)<=f.mon&&false;
  let h=`<div class="cal"><div class="cal-h"><button type="button" data-lvmon="-1" aria-label="เดือนก่อน">${ic("chevL")}</button><b>${TH_M[m-1]} ${y+543}</b><button type="button" data-lvmon="1" aria-label="เดือนถัดไป">${ic("chevR")}</button></div><div class="cal-g">${TH_DS.map(x=>`<span class="cal-w">${x}</span>`).join("")}`;
  for(let k=0;k<cells;k++){const s=addD(start,k),d=DT(s),inM=d.getMonth()===m-1,sel=f.a&&s>=f.a&&s<=(f.b||f.a),edge=s===f.a||s===(f.b||f.a),hol=i.holidays.find(x=>x.date===s),mine=i.myDays.find(x=>x.date===s),job=i.jobDays.find(x=>x.date===s),wk=i.workDays.indexOf(d.getDay())<0;
    const past=s<addD(i.today,-7);
    h+=`<button type="button" class="cd ${inM?"":"om"} ${wk?"wk off":""} ${hol?"hol off":""} ${sel?"rs":""} ${edge&&!offDay(s)?"edge":""} ${s===i.today?"td":""}" data-lvday="${s}" ${past||!inM?"disabled":""} aria-label="${fDY(s)}${hol?" "+esc(hol.name):""}${job?" มีงาน":""}${mine?" มีคำขอลาแล้ว":""}" aria-pressed="${!!sel}"><b>${d.getDate()}</b><span class="mk">${job?'<i class="mj"></i>':""}${mine?`<i class="ml ${mine.status}"></i>`:""}${hol?'<i class="hl"></i>':""}</span></button>`}
  return h+`</div><div class="cal-l"><span><i class="mj"></i>มีงาน</span><span><i class="ml"></i>วันลาของคุณ</span><span><i class="ml wait"></i>รออนุมัติ</span><span><i class="hl"></i>วันหยุด</span></div></div>`}
V.leave=()=>{const i=L.info;if(!i)return band("ขอลางาน")+loadingV();if(!L.f)newLeaveForm();const f=L.f,ds=fDays(f),t=i.types.find(x=>x.id===f.type_id)||{},jobs=ds.filter(x=>i.jobDays.find(j=>j.date===x.date));
  return band(f.edit_id?"แก้ไขคำขอลา":"ขอลางาน")+`<form class="pad" id="f" novalidate>
  ${f.edit_id?nt("c-blue","info","คำขอนี้ยังไม่ได้รับอนุมัติ แก้ไขได้ทันที หัวหน้าทีมจะเห็นป้าย “แก้ไขแล้ว”"):""}
  <div class="lv-step"><span class="n">1</span><b>ประเภทการลา</b></div>
  <div class="lt-g">${i.types.map(x=>`<button type="button" class="ltc" data-lvtype="${x.id}" aria-pressed="${f.type_id===x.id}"><b>${esc(x.name)}</b><span class="q ${x.left!=null&&x.left<=0?"z":""}">${x.left==null?"ไม่จำกัด":"คงเหลือ "+nd(x.left)}${x.reserved?` · รอ ${nd(x.reserved)}`:""}</span><span class="cap" style="font-size:11.5px;line-height:1.35">${x.advance_days?"ยื่นล่วงหน้า "+x.advance_days+" วัน":x.backdate_days?"ยื่นย้อนหลังได้ "+x.backdate_days+" วัน":"ยื่นได้ทุกเมื่อ"}</span></button>`).join("")}</div>
  <div class="lv-step"><span class="n">2</span><b>เลือกวันลา</b><span class="cap" style="margin-left:auto">แตะวันแรก แล้วแตะวันสุดท้าย</span></div>
  ${cal(f)}
  ${ds.length?`<div class="dl">${ds.map(x=>{const j=i.jobDays.find(z=>z.date===x.date);return `<div class="dr"><div class="t"><b>${fD(x.date)}</b>${j?`<span class="chip c-blue mini">${ic("cal","width:13px;height:13px")}งาน ${esc(j.site||j.job)}</span>`:`<span class="chip c-grey mini">ทำงานปกติ</span>`}</div>${t.half_day?`<div class="seg" role="group" aria-label="ช่วงเวลา ${fD(x.date)}">${Object.keys(PART).map(p=>`<button type="button" data-lvpart="${x.date}|${p}" aria-pressed="${x.part===p}">${PART[p]}</button>`).join("")}</div>`:""}</div>`}).join("")}</div>`:""}
  <div id="lvchk"></div>
  <div class="lv-step"><span class="n">${ds.length?4:3}</span><b>รายละเอียด</b></div>
  <div class="fcard">${fl("lr","เหตุผลการลา *",`<textarea class="ta" id="lr" placeholder="ระบุเหตุผลการลา">${esc(f.reason)}</textarea>`)}
  ${jobs.length?fl("lsub","เสนอผู้รับงานแทน (หัวหน้าทีมเป็นผู้ตัดสิน)",`<select class="sel" id="lsub"><option value="">ให้หัวหน้าทีมเลือก</option>${i.team.map(x=>`<option value="${x.id}" ${f.substitute_id===x.id?"selected":""}>${esc(x.name)}${x.nickname?" ("+esc(x.nickname)+")":""}</option>`).join("")}</select>`):""}</div>
  <div class="lv-step"><span class="n">${ds.length?5:4}</span><b>ผู้อนุมัติ</b></div>
  <div class="fcard" style="gap:0;padding-bottom:4px" id="lvappr">${tl([["var(--orange)","หัวหน้าทีม"+(i.lead?" · "+esc(i.lead):""),"อนุมัติ / ส่งกลับแก้ไข / ไม่อนุมัติ",false],["#C5CCD6","แจ้งผลทาง LINE + อัปเดตตารางงานและการลงเวลา","อัตโนมัติเมื่ออนุมัติ",false]])}</div>
  </form><span class="spacer"></span><div class="foot"><button class="btn pri" data-lvnext>ตรวจสอบก่อนส่ง</button></div>`};
function paintLeaveChecks(){const box=$("#lvchk"),p=L.pv,f=L.f,i=L.info;if(!box)return;const t=i.types.find(x=>x.id===f.type_id)||{};
  if(!p||!f.a){box.innerHTML="";return}
  const q=t.quota||0,used=t.used||0,res=t.reserved||0;
  box.innerHTML=(p.total?`<div class="lv-step"><span class="n">3</span><b>สรุปจำนวนวัน</b></div><div class="sumc"><div style="display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap"><span class="big">${nd(p.total)}</span><span style="opacity:.92;padding-bottom:2px">${esc(p.type)} · ${rangeTxt(p.days[0].date,p.days[p.days.length-1].date)}</span></div>
   ${q?`<div class="qb"><i style="width:${used/q*100}%;background:#fff"></i><i style="width:${res/q*100}%;background:rgba(255,255,255,.55)"></i><i style="width:${Math.min(p.total,Math.max(0,q-used-res))/q*100}%;background:#FFC48F"></i></div>`:""}
   <div style="display:flex;justify-content:space-between;font-size:12.5px;gap:8px"><span>ใช้แล้ว ${nd(used)}${res?` · รออนุมัติ ${nd(res)}`:""}</span><span style="white-space:nowrap">คงเหลือหลังลา <b>${p.left_after==null?"ไม่จำกัด":nd(p.left_after)}</b></span></div></div>`:"")+
   (p.errors||[]).map(x=>nt("c-red","alert",esc(x))).join("")+(p.warns||[]).map(x=>nt("c-orange","alert",esc(x))).join("");
  const ap=$("#lvappr");if(ap&&p.approvers)ap.innerHTML=tl(p.approvers.map((a,k)=>[k?"#C5CCD6":"var(--orange)",esc(a),k?"อนุมัติ/รับทราบหลังหัวหน้าอนุมัติ":"อนุมัติ / ส่งกลับแก้ไข / ไม่อนุมัติ",false]).concat([["#C5CCD6","แจ้งผลทาง LINE + อัปเดตตารางงานและการลงเวลา","อัตโนมัติเมื่ออนุมัติ",false]]));
}
V.lvsum=()=>{const p=L.pv,f=L.f;if(!p)return band("ตรวจสอบคำขอ")+`<div class="pad"><div class="empty">ไม่มีข้อมูล</div></div>`;
  const sub=f.substitute_id&&L.info.team.find(x=>x.id===f.substitute_id);
  return band("ตรวจสอบคำขอ")+`<div class="pad">
  <div class="fcard" style="gap:0;padding:2px 16px">${[["ประเภท",esc(p.type)],["วันที่",p.days.map(x=>fD(x.date)+(x.part!=="full"?` (${PART[x.part]})`:"")).join("<br>")],["จำนวน",nd(p.total)],["คงเหลือหลังลา",p.left_after==null?"ไม่จำกัด":nd(p.left_after)],["เหตุผล",esc(f.reason)],...(p.jobs.length?[["ผู้รับงานแทนที่เสนอ",sub?esc(sub.name):"ให้หัวหน้าทีมเลือก"]]:[])].map(r=>`<div class="kv"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}</div>
  <h3 class="lvh">เมื่อได้รับอนุมัติ ระบบจะ</h3><div class="fcard" style="gap:10px">${[er("cal","ตารางงาน: ทำเครื่องหมาย “ลา” "+rangeTxt(p.days[0].date,p.days[p.days.length-1].date)),...p.jobs.map(j=>er("swap",`งาน${esc(j.job)} ${fD(j.date)} → ${sub?"ย้ายให้ "+esc(sub.name)+" (หัวหน้าทีมยืนยัน)":"หัวหน้าทีมจัดคนแทน"}`)),...p.effects.map(x=>er("finger",esc(x))),er("bell","แจ้งผลทาง LINE")].join("")}</div>
  ${(p.warns||[]).map(x=>nt("c-orange","alert",esc(x))).join("")}
  <h3 class="lvh">ผู้อนุมัติ</h3><div class="fcard" style="gap:0;padding-bottom:4px">${tl(p.approvers.map((a,k)=>[k?"#C5CCD6":"var(--orange)",esc(a),k?"หลังหัวหน้าอนุมัติ":"รอพิจารณา",false]))}</div></div>
  <span class="spacer"></span><div class="foot"><button class="btn pri" data-lvsend>${f.edit_id?"บันทึกและส่งใหม่":"ยืนยันส่งคำขอลา"}</button><button class="btn out" data-back>กลับไปแก้</button></div>`};
V.lvdone=()=>{const d=L.done||{};return `<div class="okv" style="background:#fff"><div class="c">${ic("ok")}</div><h2>${d.edit?"ส่งคำขอที่แก้ไขแล้ว":"ส่งคำขอลาเรียบร้อย"}</h2><span class="muted">${esc(d.req_no||"")}<br>รอหัวหน้าทีมอนุมัติ</span></div>
  <div class="pad" style="background:#fff;flex:1;padding-top:0">${(d.warns||[]).map(x=>nt("c-orange","alert",esc(x))).join("")}${nt("c-blue","info","แจ้งหัวหน้าทีมแล้ว · ผลการอนุมัติจะส่งถึงคุณทาง LINE")}</div>
  <div class="foot"><button class="btn pri" data-lvopen="${esc(d.id||"")}">ดูคำขอลา</button><button class="btn out" data-home>กลับหน้าหลัก</button></div>`};

/* ---------- รายละเอียดคำขอ ---------- */
V.lvdetail=id=>{const r=L.det[id];if(!r)return band("คำขอลา")+loadingV();const back=(r.history||[]).filter(h=>h.action==="back").pop(),no=(r.history||[]).filter(h=>h.action==="no").pop();
  const btns=[];if(r.can.edit)btns.push([r.status==="back"?"แก้ไขแล้วส่งใหม่":"แก้ไขคำขอ",`data-lvedit="${r.id}"`,"pri"]);if(r.can.cancel)btns.push(["ยกเลิกคำขอ",`data-lvcancel="${r.id}"`,"out"]);if(r.can.request_cancel)btns.push([r.date_from<L.info.today?"ขอยกเลิกวันที่เหลือ (กลับมาทำงาน)":"ขอยกเลิกวันลา",`data-lvcancel="${r.id}"`,"out"]);
  return band("คำขอลา")+`<div class="pad">
  <div class="fcard" style="gap:6px"><div style="display:flex;align-items:center;gap:8px"><b style="font-size:19px;flex:1">${esc(r.type)}</b>${lchip(r.status)}</div><span>${rangeTxt(r.date_from,r.date_to)} · <b>${nd(r.days_total)}</b></span><span class="cap">${esc(r.req_no)} · ยื่นเมื่อ ${fAt(r.created_at)}${r.edited?" · แก้ไขแล้ว":""}</span></div>
  ${r.change?nt("c-blue","info","ขอยกเลิกวันลา · รอหัวหน้าทีมอนุมัติ · เหตุผล: "+esc(r.change.reason)):""}
  ${r.status==="back"&&back?nt("c-orange","alert","หัวหน้าทีมส่งกลับ: "+esc(back.note)):""}${r.status==="no"&&no?nt("c-red","alert","เหตุผลที่ไม่อนุมัติ: "+esc(no.note)):""}
  <h3 class="lvh">วันลา</h3><div class="dl">${r.days.map(x=>`<div class="dr"><div class="t"><b>${fD(x.date)}</b><span class="chip c-grey mini">${PART[x.part]}</span>${x.status==="no"?'<span class="chip c-red mini">ไม่อนุมัติ</span>':x.status==="cancel"?'<span class="chip c-grey mini">ยกเลิก</span>':""}</div></div>`).join("")}</div>
  <div class="fcard" style="gap:0;padding:2px 16px">${[["เหตุผล",esc(r.reason)],["ผู้รับงานแทน",r.substitute?esc(r.substitute):"—"]].map(x=>`<div class="kv"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div>
  <h3 class="lvh">ประวัติ</h3><div class="fcard" style="gap:0;padding-bottom:4px">${tl(stepsOf(r))}</div></div>
  <div class="foot">${btns.length?btns.map(b=>`<button class="btn ${b[2]}" ${b[1]}>${b[0]}</button>`).join(""):nt("c-blue","info",r.status==="ok"&&r.date_to<L.info.today?"วันลานี้ผ่านไปแล้ว แก้ไขได้โดยฝ่ายบุคคล (HR) เท่านั้น ระบบบันทึกประวัติทุกครั้ง":"ไม่มีการดำเนินการ")}</div>`};
function openDetail(id){L.det[id]=null;go("lvdetail:"+id);api("leaveDetail",id).then(r=>{L.det[id]=r;if(cur()==="lvdetail:"+id)repaint()}).catch(e=>toast(e.message))}

/* ---------- เอกสาร / โควตา / เอกสารของฉัน ---------- */
V.req=()=>band("เอกสาร")+`<div class="pad" style="gap:12px"><button class="mrow" data-act="go:mreq"><span style="color:var(--blue);display:flex">${ic("pin")}</span><span>ขอใช้เมสเซนเจอร์</span></button><button class="mrow" data-act="go:mmine"><span style="color:var(--blue);display:flex">${ic("board")}</span><span>งานเมสเซนเจอร์ที่ฉันขอ</span></button>${[["ขอลางาน","doc","blue","leave"],["ขอเพิ่ม/แก้ไขเวลา","clock","orange",""],["ขอโอที","hour","blue",""],["ขอเปลี่ยนกะการทำงาน","calClock","orange",""]].map(r=>`<button class="mrow" data-act="${r[3]?"lv:"+r[3]:"soon"}"><span style="color:var(--${r[2]});display:flex">${ic(r[1])}</span><span>${r[0]}</span>${r[3]?`<span class="chev">${ic("chevR")}</span>`:`<span class="chip c-grey" style="margin-left:auto;font-size:12px">เร็ว ๆ นี้</span>`}</button>`).join("")}
  <button class="mrow" data-act="go:myreqs"><span style="color:var(--blue);display:flex">${ic("docOk")}</span><span>เอกสารของฉัน</span><span class="chev">${ic("chevR")}</span></button></div>`;
V.quota=()=>{const i=L.info;if(!i)return band("โควตาการลา")+loadingV();return band("โควตาการลา")+`<div class="pad"><span class="muted" style="font-size:16px;margin-top:4px">โควตาปี ${i.year+543} · รออนุมัติถูกจองไว้</span>
  ${i.types.map(q=>`<div class="qcard"><div class="r"><span>${esc(q.name)}</span><span class="tn">${q.quota==null?"ไม่จำกัด":`คงเหลือ <b>${nd(q.left)}</b> / ${q.quota}`}</span></div>${q.quota?`<div class="track" style="display:flex"><i style="width:${q.used/q.quota*100}%;border-radius:99px 0 0 99px"></i><i style="width:${q.reserved/q.quota*100}%;background:var(--orange);opacity:.6;border-radius:0"></i></div>`:""}<div class="cap" style="margin-top:8px;display:flex;gap:14px"><span>ใช้แล้ว ${nd(q.used)}</span>${q.reserved?`<span style="color:var(--orange)">รออนุมัติ ${nd(q.reserved)}</span>`:""}</div></div>`).join("")}
  <button class="btn out" data-act="go:myreqs">ดูคำขอลาของฉัน</button></div>`};
V.myreqs=()=>{const i=L.info;if(!i)return band("เอกสารของฉัน")+loadingV();const F={all:()=>1,wait:l=>["wait","mgr","hr","chg","back"].includes(l.status),ok:l=>l.status==="ok"},rows=i.requests.filter(F[L.mrf]);
  return band("เอกสารของฉัน")+`<div class="pad"><div class="seg" style="background:#fff;box-shadow:var(--sh-2)">${[["all","ทั้งหมด"],["wait","รอดำเนินการ"],["ok","อนุมัติแล้ว"]].map(x=>`<button type="button" data-mrf="${x[0]}" aria-pressed="${L.mrf===x[0]}">${x[1]}</button>`).join("")}</div>
  ${rows.length?rows.map(l=>`<button class="card" data-lvopen="${l.id}" style="padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px;text-align:left;width:100%"><span style="color:${["wait","mgr","hr","chg","back"].includes(l.status)?"var(--orange)":"var(--blue)"};display:flex">${ic("doc")}</span><span style="flex:1;min-width:0"><span style="display:block">${esc(l.type)} ${rangeTxt(l.date_from,l.date_to)}</span><span class="cap">ยื่นเมื่อ ${fAt(l.created_at).split(" ·")[0]}${l.edited?" · แก้ไขแล้ว":""}</span></span>${lchip(l.status)}<span style="color:var(--text-3);display:flex">${ic("chevR","width:18px;height:18px")}</span></button>`).join(""):`<div class="empty">ยังไม่มีเอกสาร</div>`}
  <button class="btn pri" data-act="lv:leave">ยื่นคำขอลา</button></div>`};

/* ---------- หัวหน้าทีม / HR: อนุมัติ ---------- */
/* รูปพนักงาน (โหลดทีหลัง ทีละชุด) · ใส่ data-pav="<id>" ที่กรอบรูป */
const PAV={};function loadPav(){const all=[...document.querySelectorAll("[data-pav]")],paint=()=>all.forEach(el=>{const p=PAV[el.dataset.pav];if(p&&!el.querySelector("img"))el.innerHTML=`<img src="${esc(p)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`});paint();
  const u=[...new Set(all.map(e=>e.dataset.pav).filter(i=>i&&!(i in PAV)))].slice(0,60);if(!u.length)return;u.forEach(i=>PAV[i]="");api("photosFor",u).then(m=>{Object.assign(PAV,m||{});paint()}).catch(()=>{})}
const isHRme=()=>S.me&&["hr","admin"].includes(S.me.role);
function loadAps(){L.aps=null;if(L.apf==="acc")return api("approvalCenter","pending").then(d=>{L.aps=d.items.filter(x=>x.kind!=="leave");if(curV()==="approve")repaint()}).catch(e=>toast(e.message));return api("approvalsList",L.apf).then(a=>{L.aps=a;if(["approve","apdetail"].includes(curV()))repaint()}).catch(e=>toast(e.message))}
V.approve=()=>{const A=L.aps;setTimeout(loadPav,0);if(L.apf==="acc")return band("อนุมัติเอกสาร")+`<div class="pad">${apSeg()}${accList(A)}</div>`;return band("อนุมัติเอกสาร")+`<div class="pad">${apSeg()}
  ${!A?`<div class="skel" style="height:120px"></div>`:A.length?A.map(a=>`<button class="ap" data-apopen="${a.id}" style="text-align:left;width:100%"><div style="display:flex;gap:12px;align-items:center"><div class="ava av-sm" data-pav="${a.employee_id}">${AVA}</div><div style="flex:1;min-width:0"><b style="font-weight:600">${esc(a.employee)}</b><div class="cap">${esc(a.team)} · ยื่น ${fAt(a.created_at)}</div></div>${lchip(a.status,1)}</div>
   <div class="r"><span>ประเภท</span><span>${esc(a.type)}${a.status==="chg"?" · ขอยกเลิก":""}</span></div><div class="r"><span>วันที่</span><span>${rangeTxt(a.date_from,a.date_to)} · ${nd(a.days_total)}</span></div>
   ${(a.edited||a.flags.length)?`<div style="display:flex;gap:6px;flex-wrap:wrap">${a.edited?'<span class="chip c-blue mini">แก้ไขแล้ว</span>':""}${a.flags.map(x=>`<span class="chip c-red mini">${esc(x.split(" ·")[0])}</span>`).join("")}</div>`:""}
   <span style="color:var(--blue);font-weight:600;font-size:14px">${a.step?"พิจารณา":"ดูรายละเอียด"} ›</span></button>`).join(""):`<div class="empty">ไม่มีเอกสารในรายการนี้</div>`}</div>`};
/* แท็บรายการอนุมัติ · "เข้าระบบ" (เชื่อม LINE / อุปกรณ์ใหม่) เฉพาะ HR / ผู้ดูแลระบบ */
function apSeg(){const T=[["wait","รออนุมัติ"],["ok","อนุมัติแล้ว"],["no","ไม่อนุมัติ"],["all","ทั้งหมด"]].concat(isHRme()?[["acc","เข้าระบบ"]]:[]);
  return `<div class="seg" style="background:#fff;box-shadow:var(--sh-2);overflow-x:auto">${T.map(x=>`<button type="button" data-apf="${x[0]}" aria-pressed="${L.apf===x[0]}" style="font-size:${T.length>4?13:14}px;white-space:nowrap">${x[1]}</button>`).join("")}</div>`}
function accList(A){if(!A)return `<div class="skel" style="height:120px"></div>`;if(!A.length)return `<div class="empty">ไม่มีคำขอเข้าระบบรออนุมัติ</div>`;
  return A.map(x=>`<div class="ap"><div style="display:flex;gap:12px;align-items:center"><div class="ava av-sm" data-pav="${esc(x.employee_id)}">${AVA}</div><div style="flex:1;min-width:0"><b style="font-weight:600">${esc(x.employee)}</b><div class="cap">${esc(x.code||"")} · ${esc(x.dept||"")} · ${fAt(x.created_at)}</div></div><span class="chip ${x.kind==="line"?"c-green":"c-orange"} mini">${esc(x.type)}</span></div>
   <div class="r"><span>รายการ</span><span>${esc(x.title)}</span></div><div class="r"><span>รายละเอียด</span><span>${esc(x.detail)}</span></div>
   <div class="g2"><button class="btn out sm" style="color:var(--red);border-color:var(--red)" data-acno="${x.kind}|${x.id}">${x.kind==="line"?"ไม่ใช่คนนี้":"ไม่อนุญาต"}</button><button class="btn pri sm" data-acok="${x.kind}|${x.id}">${x.kind==="line"?"ยืนยันเป็นพนักงาน":"อนุญาตเครื่องนี้"}</button></div></div>`).join("")}
V.apdetail=id=>{const a=(L.aps||[]).find(x=>x.id===id);if(!a)return band("พิจารณาคำขอลา")+loadingV();
  setTimeout(loadPav,0);return band(a.status==="chg"?"พิจารณาการยกเลิก":"พิจารณาคำขอลา")+`<div class="pad">
  <div class="fcard" style="gap:10px"><div style="display:flex;gap:12px;align-items:center"><div class="ava av-sm" data-pav="${a.employee_id}">${AVA}</div><div style="flex:1;min-width:0"><b>${esc(a.employee)}</b><div class="cap">${esc(a.team)} · ${esc(a.req_no)}</div></div>${lchip(a.status,1)}</div>
  <div class="ap" style="box-shadow:none;padding:0;gap:8px">${[["ประเภท",esc(a.type)],["วันที่",a.days.map(x=>fD(x.date)+(x.part!=="full"?` (${PART[x.part]})`:"")).join(", ")],["จำนวน",nd(a.days_total)],["เหตุผล",esc(a.reason)],["ผู้รับงานแทนที่เสนอ",a.substitute?esc(a.substitute):"—"]].map(r=>`<div class="r"><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}</div></div>
  ${a.change?nt("c-blue","info","ขอยกเลิกวันลา: "+esc(a.change.reason)):""}${a.edited?nt("c-blue","info","พนักงานแก้ไขคำขอนี้แล้ว"):""}
  ${a.flags.map(x=>nt("c-orange","alert",esc(x))).join("")}
  <h3 class="lvh">ขั้นตอนอนุมัติ</h3><div class="fcard" style="gap:0;padding-bottom:4px">${tl(stepsOf(Object.assign({mine_lead:1},a)))}</div></div>
  ${a.step?`<div class="foot"><button class="btn pri" data-apok="${a.id}">${a.status==="chg"?"อนุมัติการยกเลิก":"อนุมัติ"}</button><div class="g2"><button class="btn out sm" data-apno="${a.id}|${a.status==="chg"?"no":"back"}">${a.status==="chg"?"ไม่อนุมัติการยกเลิก":"ส่งกลับแก้ไข"}</button>${a.status==="chg"?"":`<button class="btn out sm" style="color:var(--red);border-color:var(--red)" data-apno="${a.id}|no">ไม่อนุมัติ</button>`}</div>${a.days.length>1&&a.status!=="chg"?`<button class="sim" style="align-self:center;margin:0" data-appart="${a.id}">อนุมัติบางวัน</button>`:""}</div>`:""}`};
function apNoSheet(id,a){sheet(`<h3>${a==="back"?"ส่งกลับแก้ไข":"ไม่อนุมัติ"}</h3>${fl("apn","เหตุผล * (ผู้ขอจะเห็นข้อความนี้)",`<textarea class="ta" id="apn" placeholder="${a==="back"?"เช่น ขอให้เลื่อนเป็นสัปดาห์หน้า":"ระบุเหตุผล"}"></textarea>`)}<button class="btn pri" data-apnok="${id}|${a}">ยืนยัน</button><button class="btn out" data-dclose>ยกเลิก</button>`);const ta=$("#apn"),b=$("[data-apnok]");if(ta&&b){b.disabled=true;ta.oninput=()=>{b.disabled=!ta.value.trim()};setTimeout(()=>ta.focus(),60)}}   // ไม่อนุมัติ/ส่งกลับ: ต้องพิมพ์เหตุผลก่อน ปุ่มยืนยันจึงกดได้
function sheet(h){$("#ov").innerHTML=`<div class="scrim" data-dclose style="inset:0"></div><div class="sheetm" role="dialog" aria-modal="true"><div class="grab"></div>${h}</div>`}
function decide(id,action,note,days){return api("decideLeave",id,action,note||"",days||[]).then(r=>{$("#ov").innerHTML="";toast({ok:"อนุมัติแล้ว",partial:"อนุมัติบางวันแล้ว",no:"ไม่อนุมัติแล้ว",back:"ส่งกลับแก้ไขแล้ว"}[action]+(r.status==="hr"?" · ส่งต่อ HR":"")+" · แจ้งผู้ขอทาง LINE");S.stack.pop();show("back");loadAps()}).catch(e=>toast(e.message))}

/* ---------- actions ---------- */
function openLeave(edit){L.f=null;if(L.info)newLeaveForm(edit);go("leave");loadLeave(true).then(()=>{if(!L.f)newLeaveForm(edit);if(curV()==="leave"){repaint();runPreview()}}).catch(e=>toast(e.message))}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const d=t.dataset||{},f=L.f;
  if(d.lvtype){f.type_id=d.lvtype;repaint();runPreview();return}
  if(d.lvmon){const [y,m]=f.mon.split("-").map(Number),n=new Date(y,m-1+Number(d.lvmon),1);f.mon=`${n.getFullYear()}-${p2(n.getMonth()+1)}`;repaint();paintLeaveChecks();return}
  if(d.lvday){const s=d.lvday;if(!f.a||f.pick===0||s<f.a){f.a=s;f.b=s;f.pick=1}else{f.b=s;f.pick=0}f.reason=($("#lr")||{}).value||f.reason;repaint();runPreview();return}
  if(d.lvpart){const [s,p]=d.lvpart.split("|");f.parts[s]=p;t.parentNode.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b===t));runPreview();return}
  if(d.lvnext!==undefined){f.reason=$("#lr").value.trim();const sb=$("#lsub");f.substitute_id=sb?sb.value:"";
    if(!f.a){toast("เลือกวันลาในปฏิทิน");return}if(!f.reason){const el=$("#lr");el.classList.add("err");const m=$("#lr-e");m.hidden=false;m.textContent="กรุณาระบุเหตุผล";el.focus();return}
    t.disabled=true;t.innerHTML='<span class="spin"></span>กำลังตรวจสอบ…';
    api("previewLeave",reqObj()).then(p=>{L.pv=p;t.disabled=false;t.textContent="ตรวจสอบก่อนส่ง";if(p.errors.length){paintLeaveChecks();toast(p.errors[0]);$("#lvchk").scrollIntoView({behavior:"smooth",block:"center"});return}go("lvsum")}).catch(er2=>{t.disabled=false;t.textContent="ตรวจสอบก่อนส่ง";toast(er2.message)});return}
  if(d.lvsend!==undefined){t.disabled=true;t.innerHTML='<span class="spin"></span>กำลังส่ง…';
    api("submitLeave",reqObj()).then(r=>{if(!r.ok){t.disabled=false;t.textContent="ยืนยันส่งคำขอลา";toast(r.errors[0]);return}L.done={id:r.id,req_no:r.req_no,warns:r.warns,edit:!!f.edit_id};L.f=null;L.info=null;S.stack=["lvdone"];S.tab="req";show("fade");loadLeave(true)}).catch(er2=>{t.disabled=false;t.textContent="ยืนยันส่งคำขอลา";toast(er2.message)});return}
  if(d.lvopen!==undefined){if(d.lvopen)openDetail(d.lvopen);return}
  if(d.lvedit){const r=L.det[d.lvedit];openLeave(r);return}
  if(d.lvcancel){const r=L.det[d.lvcancel],imm=["wait","back"].includes(r.status);
    sheet(`<h3>${imm?"ยกเลิกคำขอลา?":"ขอยกเลิกวันลา"}</h3><span class="cap" style="text-align:center">${esc(r.type)} ${rangeTxt(r.date_from,r.date_to)}${imm?" · ยกเลิกได้ทันที คืนโควตาที่จองไว้":" · หัวหน้าทีมต้องอนุมัติ ระหว่างรอ วันลาเดิมยังมีผล"}</span>${fl("cr",imm?"เหตุผล (ไม่บังคับ)":"เหตุผล *",`<textarea class="ta" id="cr" placeholder="เช่น กลับมาทำงานได้แล้ว"></textarea>`)}<button class="btn pri" data-lvcok="${r.id}">${imm?"ยืนยันยกเลิก":"ส่งคำขอยกเลิก"}</button><button class="btn out" data-dclose>ไม่ใช่ตอนนี้</button>`);return}
  if(d.lvcok){const why=$("#cr").value.trim();t.disabled=true;api("cancelLeave",d.lvcok,why).then(r=>{$("#ov").innerHTML="";toast(r.status==="cancel"?"ยกเลิกคำขอแล้ว":"ส่งคำขอยกเลิกแล้ว · รอหัวหน้าทีม");L.info=null;loadLeave(true);openDetailReplace(d.lvcok)}).catch(er2=>{t.disabled=false;toast(er2.message)});return}
  if(d.mrf){L.mrf=d.mrf;repaint();return}
  if(d.apf){L.apf=d.apf;repaint();loadAps();return}
  if(d.acok||d.acno){const [k,id]=(d.acok||d.acno).split("|"),ok=!!d.acok;t.disabled=true;api(k==="line"?"decideLink":"decideDevice",id,ok).then(()=>{toast(k==="line"?(ok?"ยืนยันการเชื่อม LINE แล้ว":"ปฏิเสธคำขอแล้ว"):(ok?"อนุญาตอุปกรณ์แล้ว":"ไม่อนุญาตอุปกรณ์"));loadAps()}).catch(e2=>{t.disabled=false;toast(e2.message)});return}
  if(d.apopen){go("apdetail:"+d.apopen);return}
  if(d.apok){decide(d.apok,"ok");return}
  if(d.apno){const [id,a]=d.apno.split("|");apNoSheet(id,a);return}
  if(d.apokc){t.disabled=true;decide(d.apokc,"ok");return}
  if(d.apnok){const [id,a]=d.apnok.split("|"),n=$("#apn").value.trim();if(!n){$("#apn").classList.add("err");toast("กรุณาระบุเหตุผล");return}t.disabled=true;decide(id,a,n);return}
  if(d.appart){const a=L.aps.find(x=>x.id===d.appart);sheet(`<h3>อนุมัติบางวัน</h3><span class="cap" style="text-align:center">ติ๊กวันที่อนุมัติ · วันที่เหลือแจ้งว่าไม่อนุมัติ</span><div class="fcard" style="box-shadow:none;border:1px solid var(--line)">${a.days.map(x=>`<label style="display:flex;gap:10px;align-items:center"><input type="checkbox" class="apck" value="${x.date}" checked style="width:20px;height:20px">${fD(x.date)} · ${PART[x.part]}</label>`).join("")}</div>${fl("apn","หมายเหตุ",`<textarea class="ta" id="apn"></textarea>`)}<button class="btn pri" data-appok="${a.id}">อนุมัติวันที่เลือก</button><button class="btn out" data-dclose>ยกเลิก</button>`);return}
  if(d.appok){const ks=[...document.querySelectorAll(".apck:checked")].map(x=>x.value);t.disabled=true;decide(d.appok,"partial",$("#apn").value.trim(),ks).catch(()=>{t.disabled=false});return}
},true);
function openDetailReplace(id){api("leaveDetail",id).then(r=>{L.det[id]=r;if(cur()==="lvdetail:"+id)repaint()})}
document.addEventListener("change",e=>{if(e.target.id==="lsub"&&L.f){L.f.substitute_id=e.target.value;runPreview()}});
document.addEventListener("input",e=>{if(e.target.id==="lr"&&L.f)L.f.reason=e.target.value});

start();
