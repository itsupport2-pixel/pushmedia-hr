'use strict';
/* แอปพนักงาน (liff.html) แยกเป็นไฟล์ตามหน้า (31 ต.ค. 2569) · ลำดับโหลดมีผล: core → home → messenger → auth → nav → leave (leave เรียก start() ท้ายสุด)
 * ทุกไฟล์ใช้ตัวแปรระดับบนสุดร่วมกัน · โค้ดที่รันตอนโหลดเรียกได้เฉพาะของที่ประกาศในไฟล์ก่อนหน้า (ฟังก์ชันไม่ hoist ข้ามไฟล์)
 * ไฟล์นี้: งานเมสเซนเจอร์ (หน้าหลัก · ตารางงาน · รายละเอียด · ขอใช้ · แผนที่ · ส่งเสร็จ/ไม่สำเร็จ) */
/* ---------- งานเมสเซนเจอร์ (31 ต.ค. 2569 · แทนระบบ Messenger เดิม · Figma หน้า 15 ส่วน D) ----------
 * ตำแหน่ง Messenger: หน้าหลักการ์ด "งานเมสเซนเจอร์วันนี้" · แท็บตารางงาน = รายการ/แผนที่ตามวัน · กดงาน = รายละเอียด + รับงาน / ส่งเสร็จ (รูป + พิกัด) / ส่งไม่สำเร็จ
 * พนักงานทุกคน: เอกสาร › ขอใช้เมสเซนเจอร์ + งานที่ฉันขอ (ยกเลิกได้ ต้องมีเหตุผล) · ลิงก์ Update ในการ์ด LINE → ?go=mjob&no=<เลขงาน> */
S.mj={};S.mjl={};S.mm="list";S.mdet={};
const MSTW=st=>st==="wait"&&!S.macc?["รอส่ง","c-orange"]:MST[st]||MST.wait;   // ยังไม่เปิดขั้นรับงาน = รอส่ง
const MST={wait:["รอรับงาน","c-orange"],go:["กำลังไปส่ง","c-blue"],done:["ส่งเสร็จ","c-green"],cancel:["ยกเลิก","c-red"],fail:["ส่งไม่สำเร็จ","c-red"]};
const MV=["home","sched","mjob","mmine"];
function loadMsg(ym,force){if(S.mjl[ym]||(S.mj[ym]&&!force))return;S.mjl[ym]=1;api("msgJobs",ym).then(r=>{S.mj[ym]=r;S.macc=!!r.acc;S.mjl[ym]=0;if(MV.includes(cur().split(":")[0]))repaint()}).catch(e=>{S.mjl[ym]=0;S.mj[ym]={ym,jobs:[],err:e.message};if(MV.includes(cur().split(":")[0]))repaint()})}
const msgDay=d=>{const ym=d.slice(0,7),r=S.mj[ym];if(!r){setTimeout(()=>loadMsg(ym),0);return null}return (r.jobs||[]).filter(j=>j.d===d).sort((a,b)=>String(a.time).localeCompare(String(b.time)))};
const msgReload=()=>{S.mj={};S.mdet={};};
function msgHome(){const d=ISO(new Date()),L=msgDay(d),r=S.mj[d.slice(0,7)]||{};
  const w=L?L.filter(j=>j.st==="wait"||j.st==="go"):[],nx=w[0];
  return `<button class="card mhome" data-act="tab:sched" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;text-align:left;width:100%;border:1.5px solid #141414"><span style="display:flex;align-items:center;gap:8px;width:100%"><span style="color:var(--blue);display:flex">${ic("cal","width:22px;height:22px")}</span><b style="flex:1;font-size:16px">งานเมสเซนเจอร์วันนี้</b><span class="cap" style="color:var(--blue);font-weight:600">ดูทั้งหมด ›</span></span>
  ${!L?`<span class="skel" style="height:62px;width:100%;display:block"></span>`:r.err?`<span class="cap" style="color:var(--red)">${esc(r.err)}</span>`:`<span style="display:flex;gap:8px;width:100%">${(S.macc?[[L.length,"ทั้งหมด",""],[L.filter(j=>j.st==="wait").length,"รอรับ","var(--orange)"],[L.filter(j=>j.st==="go").length,"กำลังไป","var(--blue)"],[L.filter(j=>j.st==="done").length,"เสร็จ","var(--green)"]]:[[L.length,"ทั้งหมด",""],[L.filter(j=>j.st==="wait"||j.st==="go").length,"รอส่ง","var(--orange)"],[L.filter(j=>j.st==="done").length,"เสร็จ","var(--green)"]]).map(x=>`<span class="mstat"><b style="${x[2]?`color:${x[2]}`:""}">${x[0]}</b><span>${x[1]}</span></span>`).join("")}</span>
  ${nx?`<span class="mnext">ถัดไป ${esc(String(nx.time).split("-")[0])} · ${esc(nx.company)}${nx.urgent?" · ด่วน":""}</span>`:`<span class="cap">${L.length?"ส่งครบทุกงานแล้ว":"วันนี้ไม่มีงานเมสเซนเจอร์"}</span>`}`}</button>`}
function msgCard(j,sel){const st=MSTW(j.st);return `<button class="job mjob${sel?" sel":""}" data-act="go:mjob:${esc(j.no)}" data-mno="${esc(j.no)}" style="text-align:left;width:100%"><span style="display:flex;align-items:center;gap:6px"><b class="tn" style="flex:1">${esc(j.time||"-")}</b>${j.urgent?`<span class="chip c-red" style="font-size:12px">ด่วน</span>`:""}<span class="chip ${st[1]}" style="font-size:12px">${st[0]}</span></span>
  <b style="font-size:16px;font-weight:600">${esc(j.company||"-")}</b>${j.place?`<span class="m">${ic("pin")}${esc(j.place)}</span>`:""}<span class="cap">${esc((j.types||[]).join(", ")||"-")} · ผู้ขอ ${esc(j.by||"-")}${j.messenger?" · "+esc(j.messenger):""}</span></button>`}
function msgSched(){const today=ISO(new Date());if(!S.md)S.md=today;const d=S.md,L=msgDay(d),r=S.mj[d.slice(0,7)]||{},D=DT(d);
  const strip=[-2,-1,0,1,2].map(k=>{const x=DT(d);x.setDate(x.getDate()+k);return x}),pts=L?L.filter(j=>j.lat!=null):[];
  if(S.mm==="map"&&L)setTimeout(drawMsgMap,30);
  return band("งานเมสเซนเจอร์")+`<div class="pad" style="gap:12px">
  <div class="mstrip"><button data-mday="-1" aria-label="วันก่อนหน้า">${ic("chevL")}</button>${strip.map(x=>{const v=ISO(x);return `<button data-mday="${v}" ${v===d?'aria-pressed="true"':""}><span>${TH_D[x.getDay()].slice(0,2)}</span><b>${x.getDate()}</b>${v===today?"<i></i>":""}</button>`}).join("")}<button data-mday="+1" aria-label="วันถัดไป">${ic("chevR")}</button></div>
  <span class="cap" style="text-align:center">วัน${TH_D[D.getDay()]} ${D.getDate()} ${TH_M[D.getMonth()]} ${D.getFullYear()+543}${L?` · ${L.length} งาน`:""}</span>
  <div class="mseg"><button data-mmode="list" ${S.mm==="list"?'aria-pressed="true"':""}>รายการ</button><button data-mmode="map" ${S.mm==="map"?'aria-pressed="true"':""}>แผนที่</button></div>
  ${!L?`<div class="skel" style="height:110px"></div><div class="skel" style="height:110px"></div>`:r.err?`<div class="note c-red">${ic("alert")}<span>${esc(r.err)}</span></div><button class="btn out" data-mre>ลองใหม่</button>`:
   S.mm==="map"?`<div id="mmap" class="mmap"></div><span class="cap" id="mdist">${pts.length?`จุดเรียงตามเวลา 1 → ${pts.length}`:"งานวันนี้ยังไม่มีพิกัด"}${pts.length<L.length?` · ไม่มีพิกัด ${L.length-pts.length} งาน`:""}</span>${L.map(j=>msgCard(j,j.no===S.msel)).join("")}`:
   L.length?L.map(j=>msgCard(j)).join(""):`<div class="empty">ไม่มีงานเมสเซนเจอร์วันนี้</div>`}
  <button class="btn out" data-act="go:mreq">${ic("doc")}ขอใช้เมสเซนเจอร์</button></div>`}
/* รายละเอียดงาน (arg = เลขงาน) · โหลดจาก msgDetail (รูป · ไทม์ไลน์ · ปุ่มที่ทำได้) */
function msgDet(no,force){if(S.mdet[no]&&!force)return S.mdet[no];if(!S.mdet["_l"+no]){S.mdet["_l"+no]=1;api("msgDetail",no).then(r=>{S.mdet[no]=r;S.macc=!!r.acc;S.mdet["_l"+no]=0;if(cur()==="mjob:"+no)repaint()}).catch(e=>{S.mdet["_l"+no]=0;S.mdet[no]={err:e.message};if(cur()==="mjob:"+no)repaint()})}return S.mdet[no]||null}
const MACT={create:"สร้างงาน",edit:"แก้ไขงาน",accept:"รับงาน",assign:"มอบหมายให้",done:"ส่งเสร็จ",cancel:"ยกเลิก",fail:"ส่งไม่สำเร็จ"};
V.mjob=no=>{const j=msgDet(no);if(!j)return band(esc(no))+`<div class="pad"><div class="skel" style="height:220px"></div></div>`;if(j.err)return band(esc(no))+`<div class="pad"><div class="note c-red">${ic("alert")}<span>${esc(j.err)}</span></div></div>`;
  const st=MSTW(j.st),D=DT(j.d),c=j.can||{};
  const gm=j.lat!=null?`https://www.google.com/maps/dir/?api=1&destination=${j.lat},${j.lng}`:j.map||(j.addr||j.place?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.addr||j.place)}`:"");
  const kv=(a,b)=>b?`<div class="kv"><span>${a}</span><b>${b}</b></div>`:"";
  const ph=(j.photos||[]);
  return band(esc(j.no))+`<div class="pad" style="gap:12px"><div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">
  <span style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip ${st[1]}" style="font-size:12px">${st[0]}</span>${j.urgent?`<span class="chip c-red" style="font-size:12px">ด่วน</span>`:""}${(j.types||[]).map(t=>`<span class="chip c-grey" style="font-size:12px">${esc(t)}</span>`).join("")}${j.photo_need?`<span class="chip c-grey" style="font-size:12px">ต้องมีรูปตอนส่งเสร็จ</span>`:""}</span>
  <b style="font-size:19px">${esc(j.company||"-")}</b><span class="muted" style="font-weight:600">วัน${TH_D[D.getDay()]} ${D.getDate()} ${TH_S[D.getMonth()]} · ${esc(j.time||"-")}</span>
  ${j.urgent&&j.urgent_note?`<div class="note c-red">${ic("alert")}<span>${esc(j.urgent_note)}</span></div>`:""}
  <div class="kvs">${kv("สถานที่",esc([j.place,j.addr].filter(Boolean).join(" · ")))}${kv("ผู้ติดต่อ",esc([j.contact,j.phone].filter(Boolean).join(" · ")))}${kv("ผู้ขอ",esc(j.by)+(j.dept?" · "+esc(j.dept):""))}${kv("เมสเซนเจอร์",esc(j.messenger||""))}${kv("รายละเอียด",esc(j.detail||""))}${j.note?kv(j.st==="done"?"หมายเหตุ":"เหตุผล",esc(j.note)):""}</div>
  ${ph.length?`<div class="mphs">${ph.map(p=>`<figure><img src="${esc(p.data)}" alt=""><figcaption>${p.kind==="proof"?"รูปยืนยัน":"รูปแนบ"}</figcaption></figure>`).join("")}</div>`:""}</div>
  <div style="display:flex;gap:10px">${gm?`<a class="btn ${c.accept||c.done?"out":"pri"}" style="flex:1" href="${esc(gm)}" target="_blank" rel="noopener">${ic("nav")}Google Maps</a>`:""}${j.phone?`<a class="btn out" style="flex:1" href="tel:${esc(String(j.phone).replace(/[^0-9+]/g,""))}">${ic("phone")}โทร</a>`:""}</div>
  ${c.accept?`<button class="btn pri" data-macc="${j.id}">รับงานนี้</button>`:""}
  ${c.done&&!c.accept?`<button class="btn pri mgreen" data-mdone="${j.id}">ส่งเสร็จ${j.photo_need?" + ถ่ายรูป":""}</button>`:""}
  ${c.assign?`<button class="btn out" data-masg="${j.id}">${j.messenger?"เปลี่ยนคนส่ง":"มอบหมายเมสเซนเจอร์"}</button>`:""}
  ${c.fail?`<button class="btn out mred" data-mfail="${j.id}">ส่งไม่สำเร็จ</button>`:""}${c.cancel?`<button class="btn out mred" data-mcan="${j.id}">ยกเลิกงาน</button>`:""}
  ${(j.events||[]).length?`<div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px"><b>ไทม์ไลน์</b>${j.events.map(e=>`<span class="mtl"><i></i><span><b>${esc(MACT[e.action]||e.action)}</b> · ${esc(e.by||"")}${e.action==="assign"?" → "+esc(e.note):["done","cancel","fail"].includes(e.action)&&e.note?" · "+esc(e.note):""}<small>${esc(String(e.at).replace("T"," ").slice(5,16))}</small></span></span>`).join("")}</div>`:""}</div>`};
/* ฟอร์มขอใช้เมสเซนเจอร์ (ทุกคน) */
V.mreq=()=>{const M=S.mmeta;if(!M){api("msgMeta").then(m=>{S.mmeta=m;if(cur()==="mreq")repaint()}).catch(e=>toast(e.message));return band("ขอใช้เมสเซนเจอร์")+`<div class="pad"><div class="skel" style="height:300px"></div></div>`}
  const f=S.mform||{date:ISO(new Date()),time_from:"",time_to:"",type_id:(M.types[0]||{}).id};
  return band("ขอใช้เมสเซนเจอร์")+`<form class="pad" id="mrf" novalidate style="gap:12px"><div class="fcard">
  ${fl("mf-type","ประเภทงาน *",`<select class="inp" id="mf-type">${M.types.filter(t=>t.active!==false).map(t=>`<option value="${t.id}" ${t.id===f.type_id?"selected":""}>${esc(t.name)}${t.photo?" (ต้องมีรูปตอนส่งเสร็จ)":""}</option>`).join("")}</select>`)}
  ${fl("mf-date","วันที่ *",`<input class="inp" type="date" id="mf-date" value="${esc(f.date)}" min="${ISO(new Date())}">`)}
  <div style="display:flex;gap:10px">${fl("mf-tf","เวลาเริ่ม *",`<input class="inp" type="time" id="mf-tf" value="${esc(f.time_from)}">`)}${fl("mf-tt","ถึง",`<input class="inp" type="time" id="mf-tt" value="${esc(f.time_to)}">`)}</div>
  ${fl("mf-co","บริษัท / ร้าน *",`<input class="inp" id="mf-co" maxlength="120" value="${esc(f.company||"")}" placeholder="เช่น บริษัท ตัวอย่าง จำกัด">`)}
  ${fl("mf-pl","สถานที่ *",`<input class="inp" id="mf-pl" maxlength="200" value="${esc(f.place||"")}" placeholder="เช่น อาคาร A ชั้น 12 ถ.สีลม">`)}
  ${fl("mf-map","ลิงก์ Google Maps (ถ้ามี)",`<input class="inp" id="mf-map" inputmode="url" value="${esc(f.map_url||"")}" placeholder="https://maps.app.goo.gl/…">`)}
  <div style="display:flex;gap:10px">${fl("mf-ct","ผู้ติดต่อ",`<input class="inp" id="mf-ct" maxlength="80" value="${esc(f.contact||"")}">`)}${fl("mf-ph","เบอร์โทร",`<input class="inp" id="mf-ph" inputmode="tel" maxlength="20" value="${esc(f.phone||"")}">`)}</div>
  ${fl("mf-dt","รายละเอียด",`<textarea class="ta" id="mf-dt" maxlength="1000" placeholder="เช่น ส่งใบแจ้งหนี้ 2 ฉบับ ให้เซ็นรับ">${esc(f.detail||"")}</textarea>`)}
  <label class="mchk"><input type="checkbox" id="mf-ur" ${f.urgent?"checked":""}><span>งานด่วน</span></label>
  <div id="mf-urw" ${f.urgent?"":"hidden"}>${fl("mf-un","ความด่วน",`<input class="inp" id="mf-un" maxlength="120" value="${esc(f.urgent_note||"")}" placeholder="เช่น ต้องถึงก่อน 11:00 น.">`)}</div>
  <span class="cap">ผู้ขอ / แผนก: ใช้จากบัญชีของคุณ · งานวันนี้แจ้งกลุ่มเมสเซนเจอร์ทันที · งานล่วงหน้าแจ้งเช้าวันนั้น</span></div>
  <button class="btn pri" type="submit" id="mf-go">ส่งคำขอ</button><button class="btn out" type="button" data-act="go:mmine">งานที่ฉันขอ</button></form>`};
V.mmine=()=>{const now=new Date(),ym=ISO(now).slice(0,7),r=S.mj[ym];if(!r){setTimeout(()=>loadMsg(ym),0)}const L=r?(r.jobs||[]).filter(j=>j.by_id===(r.me||{}).id).sort((a,b)=>(b.d+b.time).localeCompare(a.d+a.time)):null;
  return band("งานที่ฉันขอ")+`<div class="pad" style="gap:12px">${!L?`<div class="skel" style="height:110px"></div>`:L.length?L.map(j=>msgCard(j)).join(""):`<div class="empty">เดือนนี้ยังไม่มีงานที่ขอ</div>`}<button class="btn pri" data-act="go:mreq">${ic("doc")}ขอใช้เมสเซนเจอร์</button></div>`};
function loadLeafletL(){if(window.L&&window.L.map)return Promise.resolve();   // แอปมีตัวแปร L (ข้อมูลการลา) อยู่แล้ว → ใช้ Leaflet ผ่าน window.L เสมอ
  if(window._llp)return window._llp;const CD="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";const c=document.createElement("link");c.rel="stylesheet";c.href=CD+"leaflet.min.css";document.head.appendChild(c);
  return window._llp=new Promise((ok,no)=>{const sc=document.createElement("script");sc.src=CD+"leaflet.min.js";sc.onload=()=>ok();sc.onerror=()=>{window._llp=null;no(new Error("โหลดแผนที่ไม่สำเร็จ (ตรวจอินเทอร์เน็ต)"))};document.head.appendChild(sc)})}
const hav=(a,b)=>{const R=6371,t=x=>x*Math.PI/180,dl=t(b.lat-a.lat),dg=t(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
function drawMsgMap(){const lv=liveView(),el=lv&&lv.querySelector("#mmap");if(!el||el._m)return;const L0=(msgDay(S.md)||[]).filter(j=>j.lat!=null);if(!L0.length){el.innerHTML=`<div class="empty" style="padding-top:90px">ไม่มีพิกัดของงานวันนี้</div>`;return}
  el._m=1;loadLeafletL().then(()=>{if(!el.isConnected)return;const LF=window.L,m=LF.map(el,{zoomControl:false,attributionControl:false});el._m=m;LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(m);
    const col={wait:"#B26A00",go:"#1F5FBF",done:"#1A8A4A",cancel:"#B42318",fail:"#B42318"},ll=L0.map(j=>[j.lat,j.lng]);if(ll.length>1)LF.polyline(ll,{color:"#1F5FBF",weight:3,dashArray:"6 6"}).addTo(m);
    L0.forEach((j,i)=>{LF.marker([j.lat,j.lng],{icon:LF.divIcon({className:"",html:`<span class="mpin" style="background:${col[j.st]||col.wait}">${i+1}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(m).on("click",()=>{S.msel=j.no;const c=lv.querySelector(`.mjob[data-mno="${j.no}"]`);lv.querySelectorAll(".mjob.sel").forEach(x=>x.classList.remove("sel"));if(c){c.classList.add("sel");c.scrollIntoView({block:"nearest",behavior:"smooth"})}})});
    m.fitBounds(ll,{padding:[30,30],maxZoom:15});let km=0;for(let i=1;i<L0.length;i++)km+=hav(L0[i-1],L0[i]);const ds=lv.querySelector("#mdist");if(ds&&L0.length>1)ds.textContent+=` · ระยะทางตรงรวม ~${km.toFixed(1)} กม.`}).catch(e=>{el._m=0;el.innerHTML=`<div class="empty" style="padding-top:90px">${esc(e.message)}</div>`})}
/* รูปยืนยัน: ย่อ ≤1280px · JPEG ≤ ~380,000 ตัวอักษร */
function msgShrink(file){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),img=new Image();img.onload=()=>{const k=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);let q=.8,d=c.toDataURL("image/jpeg",q);while(d.length>380000&&q>.35){q-=.1;d=c.toDataURL("image/jpeg",q)}d.length>390000?no(new Error("รูปใหญ่เกินไป")):ok(d)};img.onerror=()=>no(new Error("เปิดรูปไม่ได้"));img.src=u})}
const msgGps=()=>new Promise(ok=>{if(!navigator.geolocation)return ok({});navigator.geolocation.getCurrentPosition(p=>ok({lat:p.coords.latitude,lng:p.coords.longitude}),()=>ok({}),{enableHighAccuracy:true,timeout:8000,maximumAge:60000})});
const msgDone_=(no)=>{S.mdet[no]=null;msgReload();repaint()};
function msgReason(id,fail){sheet(`<h3>${fail?"ส่งไม่สำเร็จ":"ยกเลิกงาน"}</h3>${fl("mrs","เหตุผล *",`<textarea class="ta" id="mrs" placeholder="${fail?"เช่น ร้านปิด / ผู้รับไม่อยู่":"เช่น ลูกค้าเลื่อนนัด"}"></textarea>`)}<button class="btn pri" data-mrsok="${id}|${fail?1:0}" disabled>ยืนยัน</button><button class="btn out" data-dclose>ยกเลิก</button>`);
  const ta=$("#mrs"),b=$("[data-mrsok]");ta.oninput=()=>{b.disabled=!ta.value.trim()};setTimeout(()=>ta.focus(),60)}
document.addEventListener("click",e=>{const t=e.target.closest("[data-mday],[data-mmode],[data-mre],[data-macc],[data-mdone],[data-mfail],[data-mcan],[data-masg],[data-masgto],[data-mrsok],[data-mdook]");if(!t)return;e.stopPropagation();const d=t.dataset,base=S.md||ISO(new Date()),no=cur().split(":")[1];
  if(d.mday){if(d.mday==="-1"||d.mday==="+1"){const x=DT(base);x.setDate(x.getDate()+(+d.mday));S.md=ISO(x)}else S.md=d.mday;S.msel=null;repaint();return}
  if(d.mmode){S.mm=d.mmode;repaint();return}
  if(d.mre!==undefined){const ym=base.slice(0,7);S.mj[ym]=null;loadMsg(ym,true);repaint();return}
  if(d.macc){t.disabled=true;api("msgAccept",d.macc).then(()=>{toast("รับงานแล้ว");msgDone_(no)}).catch(er=>{t.disabled=false;toast(er.message);msgDone_(no)});return}
  if(d.mdone){const j=S.mdet[no]||{};sheet(`<h3>ส่งเสร็จ</h3><span class="cap" style="text-align:center">${esc(j.company||"")} · ระบบบันทึกพิกัดตอนกดยืนยัน</span>
    <label class="mphoto"><input type="file" accept="image/*" capture="environment" id="mdph" class="vh"><span id="mdpv">${ic("clip")}${j.photo_need?"ถ่ายรูปยืนยัน (จำเป็น)":"แนบรูปยืนยัน (ไม่บังคับ)"}</span></label>
    ${fl("mdnt","หมายเหตุ",`<input class="inp" id="mdnt" maxlength="200" placeholder="เช่น ฝากไว้กับ รปภ.">`)}<button class="btn pri mgreen" data-mdook="${d.mdone}" ${j.photo_need?"disabled":""}>ยืนยันส่งเสร็จ</button><button class="btn out" data-dclose>ยกเลิก</button>`);
    $("#mdph").onchange=ev=>{const f=ev.target.files[0];if(!f)return;msgShrink(f).then(u=>{S.mph=u;$("#mdpv").innerHTML=`<img src="${u}" alt="">`;$("[data-mdook]").disabled=false}).catch(er=>toast(er.message))};S.mph=null;return}
  if(d.mdook){t.disabled=true;t.textContent="กำลังบันทึก…";msgGps().then(g=>api("msgDone",d.mdook,{photo:S.mph||"",note:($("#mdnt")||{}).value||"",lat:g.lat,lng:g.lng})).then(()=>{$("#ov").innerHTML="";toast("บันทึกส่งเสร็จแล้ว");S.mph=null;msgDone_(no)}).catch(er=>{t.disabled=false;t.textContent="ยืนยันส่งเสร็จ";toast(er.message)});return}
  if(d.mfail){msgReason(d.mfail,1);return}if(d.mcan){msgReason(d.mcan,0);return}
  if(d.mrsok){const [id,f]=d.mrsok.split("|"),v=$("#mrs").value.trim();if(!v)return;t.disabled=true;api("msgCancel",id,v,f==="1").then(()=>{$("#ov").innerHTML="";toast(f==="1"?"บันทึกส่งไม่สำเร็จแล้ว":"ยกเลิกงานแล้ว · แจ้งกลุ่มแล้ว");msgDone_(no)}).catch(er=>{t.disabled=false;toast(er.message)});return}
  if(d.masg){const go=M=>sheet(`<h3>มอบหมายเมสเซนเจอร์</h3>${(M.messengers||[]).map(x=>`<button class="mrow" data-masgto="${d.masg}|${x.id}"><span>${esc(x.name)}</span></button>`).join("")||`<span class="cap">ยังไม่มีพนักงานตำแหน่ง Messenger</span>`}<button class="btn out" data-dclose>ยกเลิก</button>`);S.mmeta?go(S.mmeta):api("msgMeta").then(m=>{S.mmeta=m;go(m)}).catch(er=>toast(er.message));return}
  if(d.masgto){const [id,emp]=d.masgto.split("|");api("msgAssign",id,emp).then(()=>{$("#ov").innerHTML="";toast("มอบหมายแล้ว");msgDone_(no)}).catch(er=>toast(er.message))}},true);
document.addEventListener("change",e=>{if(e.target&&e.target.id==="mf-ur"){const w=$("#mf-urw");if(w)w.hidden=!e.target.checked}});
document.addEventListener("submit",e=>{if(!e.target||e.target.id!=="mrf")return;e.preventDefault();const v=id=>($("#"+id)||{}).value||"",b=$("#mf-go");
  const o={type_id:v("mf-type"),date:v("mf-date"),time_from:v("mf-tf"),time_to:v("mf-tt"),company:v("mf-co").trim(),place:v("mf-pl").trim(),map_url:v("mf-map").trim(),contact:v("mf-ct").trim(),phone:v("mf-ph").trim(),detail:v("mf-dt").trim(),urgent:$("#mf-ur").checked,urgent_note:v("mf-un").trim()};
  S.mform=o;b.disabled=true;b.textContent="กำลังส่ง…";api("msgSave",o).then(r=>{S.mform=null;msgReload();toast("ส่งคำขอแล้ว · "+r.job_no);S.stack.pop();go("mmine")}).catch(er=>{b.disabled=false;b.textContent="ส่งคำขอ";toast(er.message)})},true);
