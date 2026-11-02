'use strict';
/* แอปพนักงาน (liff.html) · สรุปประจำเดือน (1 พ.ย. 2569 · หลังบ้าน app/gas/report/MonthSum.js · แบบ Figma หน้า 17 ส่วน C)
 * การ์ดหน้าหลัก (สรุปเดือนก่อนที่ติด Top 10 · แสดงจนรับทราบแล้ว 7 วัน) · ms:<id> หน้าสรุป · msx:<id> ฟอร์มชี้แจง · msok:<id> ส่งแล้ว
 * ลิงก์จากการ์ด LINE: ?go=ms&id=<รายการ> · ไฟล์นี้โหลดหลัง liff-community.js (ห่อ V.home / onEnter / boot) และก่อน liff-leave.js */
S.ms={L:null,p:null,f:{}};
TITLE.ms="สรุปประจำเดือน";TITLE.msx="ชี้แจงสรุปเดือน";TITLE.msok="ชี้แจงสรุปเดือน";NOTAB.push("ms","msx","msok");
const MS_M=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],MS_WD=["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];
const msDt=d=>d?`${+d.slice(8,10)} ${MS_M[+d.slice(5,7)-1]} ${+d.slice(0,4)+543}`:"";
const msNum=v=>v%1?(+v).toFixed(1):String(v);
function msLoad(force){if(S.ms.p&&!force)return S.ms.p;S.ms.p=api("msMine").then(r=>{S.ms.L=r.items||[];return S.ms.L}).catch(e=>{S.ms.p=null;throw e});return S.ms.p}
const msIt=id=>(S.ms.L||[]).find(x=>x.id===id);
const MS_ST={wait:["b","ชี้แจงแล้ว · รอหัวหน้า"],lead_ok:["b","หัวหน้ารับทราบ · รอ HR"],done:["g","รับทราบแล้ว"],info:["o","ขอข้อมูลเพิ่ม"]};
function msPill(x){if(!x.exp_status)return `<span class="ms-pill">${x.ab_rank?"ต้องชี้แจง":"Top 10 ลา"}</span>`;const s=MS_ST[x.exp_status]||["",x.exp_status];return `<span class="ms-pill ${s[0]==="g"?"g":s[0]==="o"?"o":"b"}">${s[1]}</span>`}
function msTiles(x){const ml=MS_M[+x.ym.slice(5,7)-1];let h="";
  if(x.ab_rank)h+=`<div class="ms-r"><small>ขาดงาน · ${ml}</small><b>${msNum(x.ab_v)}<i>วัน</i></b><span>${x.ab_days.map(d=>+d.slice(8,10)).join(", ")} ${ml}</span></div>`;
  if(x.lv_rank)h+=`<div class="ms-b"><small>ลา · ${ml}</small><b>${msNum(x.lv_v)}<i>วัน</i></b><span>อันดับ ${x.lv_rank}</span></div>`;
  const tot=x.ab_rank?x.ab_tot:x.lv_tot;h+=`<div class="ms-n"><small>ยอดสะสมทั้งปี</small><b>${msNum(tot)}<i>วัน</i></b><span>${x.ab_rank?"ขาดงาน":"ลา"} ม.ค.–${ml}</span></div>`;
  return `<div class="ms-t" style="grid-template-columns:repeat(${(x.ab_rank?1:0)+(x.lv_rank?1:0)+1},1fr)">${h}</div>`}
function msCanEdit(x){return !x.exp_status||x.exp_status==="wait"||x.exp_status==="info"}
function msHomeCard(){const x=(S.ms.L||[])[0];if(!x)return "";
  if(x.exp_status==="done"){const lim=new Date(x.due+"T00:00:00");lim.setDate(lim.getDate()+7);if(new Date()>lim)return ""}
  const btn=x.exp_status&&x.exp_status!=="info"?`<button data-ms="ms:${x.id}" class="p">ดูรายละเอียด</button>`:`<button data-ms="ms:${x.id}">ดูรายละเอียด</button><button class="p" data-ms="msx:${x.id}">${x.exp_status==="info"?"ชี้แจงเพิ่ม":"ชี้แจง"}</button>`;
  return `<div class="ms-c"><div class="ms-h"><b>สรุปเดือน ${esc(x.short)}</b><span class="sp"></span>${msPill(x)}</div>${msTiles(x)}${x.exp_status?"":`<div class="ms-note${x.ab_rank?"":" m"}">${esc(x.note)}</div>`}${x.exp_status==="info"&&(x.hr_note||x.lead_note)?`<div class="ms-note" style="background:#FFF7ED;color:#C2410C">ขอข้อมูลเพิ่ม: ${esc(x.hr_note||x.lead_note)}</div>`:""}<div class="ms-btns">${btn}</div></div>`}
V.home=(f=>()=>{const h=f(),c=msHomeCard();if(!c)return h;const i=h.indexOf('<div class="card daily');return i<0?h+c:h.slice(0,i)+c+h.slice(i)})(V.home);
const msDay=(d,t,s)=>`<div class="ms-li"><div class="d"><b>${+d.slice(8,10)}</b><span>${MS_WD[new Date(d+"T12:00:00").getDay()]}</span></div><div class="t">${t}<small>${s}</small></div></div>`;
const msMo=(m,v,hl,red)=>`<div style="display:flex;padding:7px 10px;border-radius:8px;${hl?`background:${red?"#FEF2F2":"#F5F3FF"};font-weight:700;color:${red?"#B91C1C":"#7C3AED"}`:"color:#555"}"><span style="flex:1">${m}</span><span>${v?msNum(v)+" วัน":"—"}</span></div>`;
V.ms=id=>{const x=msIt(id);if(!x)return band("สรุปประจำเดือน")+`<div class="pad"><div class="skel" style="height:220px;border-radius:18px"></div></div>`;
  const s=x.series||{},n=(s.ab||s.lv||[]).length,ex=x.exp;
  let h=`<div class="pad" style="gap:14px;padding-bottom:110px"><div class="ms-c"><div class="ms-h"><b>${esc(x.label)}</b><span class="sp"></span>${msPill(x)}</div>${msTiles(x)}<div class="ms-note m">${x.ab_rank?"จัดอันดับจากจำนวนวันขาดงานของเดือนนี้ทั้งบริษัท (อันดับ "+x.ab_rank+") · ขาดงาน = วันทำงานที่ไม่มีลงเวลาและไม่มีใบลา":"จัดอันดับจากจำนวนวันลาของเดือนนี้ทั้งบริษัท (อันดับ "+x.lv_rank+")"}</div>${x.exp_status?"":`<div class="ms-note${x.ab_rank?"":" m"}">${esc(x.note)}</div>`}</div>`;
  if(x.ab_rank)h+=`<div class="ms-c"><div class="ms-sec"><span class="ms-dot" style="background:#DC2626"></span>วันที่ขาดงาน</div>${x.ab_days.map(d=>msDay(d,"ไม่มีลงเวลา · ไม่มีใบลา",msDt(d))).join("")}<div class="ms-sec">ขาดงานรายเดือน ปี ${+x.ym.slice(0,4)+543}</div><div>${(s.ab||[]).map((v,i)=>msMo(x.months[i]||"",v,i===n-1,1)).join("")}</div></div>`;
  if(x.lv_rank)h+=`<div class="ms-c"><div class="ms-sec"><span class="ms-dot" style="background:#7C3AED"></span>วันลารายเดือน ปี ${+x.ym.slice(0,4)+543}</div><div>${(s.lv||[]).map((v,i)=>msMo(x.months[i]||"",v,i===n-1,0)).join("")}</div></div>`;
  if(ex)h+=`<div class="ms-c"><div class="ms-sec">คำชี้แจงของคุณ</div>${(ex.days||[]).map(d=>`<div class="ms-note m"><b>${msDt(d.date)}</b> · ${esc(d.text)}</div>`).join("")}${ex.lv?`<div class="ms-note m"><b>การลา</b> · ${esc(ex.lv)}</div>`:""}${ex.extra?`<div class="ms-note m"><b>เพิ่มเติม</b> · ${esc(ex.extra)}</div>`:""}${x.lead_note?`<div class="ms-note" style="background:#FFF7ED;color:#C2410C">หัวหน้า: ${esc(x.lead_note)}</div>`:""}${x.hr_note?`<div class="ms-note" style="background:#FFF7ED;color:#C2410C">HR: ${esc(x.hr_note)}</div>`:""}</div>`;
  h+=`</div>`;
  const foot=msCanEdit(x)?`<div class="foot"><button class="btn pri" data-ms="msx:${x.id}">${x.exp_status==="wait"?"แก้คำชี้แจง":x.exp_status==="info"?"ชี้แจงเพิ่ม":"ชี้แจง"}</button></div>`:"";
  return band(esc(x.label))+h+foot};
V.msx=id=>{const x=msIt(id);if(!x)return band("ชี้แจงสรุปเดือน")+`<div class="pad"><div class="skel" style="height:220px;border-radius:18px"></div></div>`;
  const f=S.ms.f[id]||(S.ms.f[id]=(()=>{const e=x.exp||{},o={lv:e.lv||"",extra:e.extra||""};x.ab_days.forEach(d=>{const y=(e.days||[]).find(z=>z.date===d);o[d]=y?y.text:""});return o})());
  let h=`<div class="pad" style="gap:14px;padding-bottom:110px"><div class="ms-note m" style="background:#fff;box-shadow:0 1px 3px #0000000f">ชี้แจงแต่ละวันสั้น ๆ · ส่งถึงหัวหน้าทีมแล้วต่อไป HR · ครบกำหนด ${msDt(x.due)}</div>`;
  if(x.exp_status==="info"&&(x.lead_note||x.hr_note))h+=`<div class="ms-note" style="background:#FFF7ED;color:#C2410C">ขอข้อมูลเพิ่ม: ${esc(x.hr_note||x.lead_note)}</div>`;
  x.ab_days.forEach(d=>{h+=`<div class="ms-c"><div class="ms-sec"><span class="ms-dot" style="background:#DC2626"></span>${msDt(d)} (${MS_WD[new Date(d+"T12:00:00").getDay()]}) · ขาดงาน</div><textarea class="ta" data-msf="${d}" rows="3" maxlength="500" placeholder="ระบุเหตุผล">${esc(f[d])}</textarea></div>`});
  if(x.lv_rank)h+=`<div class="ms-c"><div class="ms-sec"><span class="ms-dot" style="background:#7C3AED"></span>การลา ${msNum(x.lv_v)} วัน${x.ab_rank?" (ไม่บังคับ)":""}</div><textarea class="ta" data-msf="lv" rows="3" maxlength="500" placeholder="ถ้ามีเหตุจำเป็น ระบุได้ที่นี่">${esc(f.lv)}</textarea></div>`;
  h+=`<div class="ms-c"><div class="ms-sec">เพิ่มเติม (ไม่บังคับ)</div><textarea class="ta" data-msf="extra" rows="2" maxlength="500" placeholder="เช่น แนวทางแก้ไขต่อจากนี้">${esc(f.extra)}</textarea></div>`;
  if(x.ab_rank)h+=`<div class="ms-note" style="background:#FFFBEB;color:#92400E">ถ้าขาดงานเพราะป่วยจริง ยื่นใบลาป่วยย้อนหลังได้ (ตามเงื่อนไขประเภทลา) · <u data-act="go:leave" style="cursor:pointer">ยื่นใบลา</u></div>`;
  return band("ชี้แจงสรุปเดือน "+esc(MS_M[+x.ym.slice(5,7)-1]))+h+`</div><div class="foot"><button class="btn pri" id="ms-send">ส่งคำชี้แจง</button></div>`};
V.msok=id=>{const x=msIt(id)||{};return band("ชี้แจงสรุปเดือน")+`<div class="pad" style="gap:14px;padding-top:28px;padding-bottom:110px"><div style="text-align:center"><div style="width:84px;height:84px;border-radius:50%;background:#F0FDF4;margin:0 auto;display:grid;place-items:center"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h2 style="margin:14px 0 4px;font-size:21px">ส่งคำชี้แจงแล้ว</h2><div class="cap">สรุปเดือน ${esc(x.short||"")}</div></div>
  <div class="ms-c"><div class="ms-tl"><div><i class="on">✓</i><span><b>ส่งคำชี้แจง</b><small>เมื่อสักครู่</small></span></div><div><i class="now"></i><span><b>หัวหน้าทีมรับทราบ</b><small>รอหัวหน้า</small></span></div><div><i></i><span><b>HR รับทราบ</b><small>ได้การ์ดผลทาง LINE เมื่อเสร็จ</small></span></div></div></div>
  <div class="ms-note m">แก้คำชี้แจงได้จนกว่าหัวหน้าจะรับทราบ · ดูได้ที่การ์ดสรุปเดือนในหน้าหลัก</div></div><div class="foot"><button class="btn pri" data-ms="home">กลับหน้าหลัก</button></div>`};
document.addEventListener("input",e=>{const t=e.target.closest&&e.target.closest("[data-msf]");if(!t)return;const id=cur().split(":")[1],f=S.ms.f[id];if(f)f[t.dataset.msf]=t.value});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ms],#ms-send");if(!b)return;
  if(b.id==="ms-send"){const id=cur().split(":")[1],x=msIt(id),f=S.ms.f[id];if(!x||!f)return;
    const miss=x.ab_days.filter(d=>!String(f[d]||"").trim());if(miss.length){toast("ชี้แจงให้ครบทุกวันที่ขาดงาน ("+miss.map(d=>+d.slice(8,10)).join(", ")+")");return}
    if(!x.ab_rank&&!String(f.lv||"").trim()&&!String(f.extra||"").trim()){toast("กรอกคำชี้แจง");return}
    b.disabled=true;api("msExplain",id,{days:x.ab_days.map(d=>({date:d,text:f[d]})),lv:f.lv,extra:f.extra}).then(()=>{delete S.ms.f[id];return msLoad(true)}).then(()=>{S.stack.pop();S.stack.pop();go("msok:"+id)}).catch(er=>{b.disabled=false;toast(er.message)});return}
  const t=b.dataset.ms;if(t==="home"){toTab("home");return}go(t)});
onEnter=(f=>()=>{f();const n=cur().split(":")[0];if(n==="ms"||n==="msx")msLoad(true).then(()=>{if(cur().split(":")[0]===n)repaint()}).catch(e=>toast(e.message))})(onEnter);
boot=(f=>function(){const r=f.apply(this,arguments);setTimeout(()=>msLoad().then(()=>{if(cur()==="home")repaint()}).catch(()=>{}),500);return r})(boot);
