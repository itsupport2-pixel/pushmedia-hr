'use strict';
/* แอปพนักงาน (liff.html) · Community — โพสต์ภายในองค์กร (1 พ.ย. 2569 · หลังบ้าน app-cf/src/community.js · หน้าตาร่วม cb-shared.js + cb.css)
 * ไฟล์นี้โหลดหลัง liff-nav.js (ห่อ drawer / onEnter / boot / V.home ที่ประกาศไว้ก่อน) และก่อน liff-leave.js (เรียก start() · มี sheet())
 * หน้า: cb (ฟีด) · cbp:<id> (อ่านโพสต์ + แสดงความคิดเห็น) · cbnew (สร้างโพสต์แบบ Facebook ไม่มีหัวข้อ) · การ์ดบนหน้าหลัก · เมนูขวา
 * เมนู ⋯ / อีโมจิ / แท็กคน / ปักหมุด / ย้ายหมวด / แก้ไข / ยืนยันลบ = แผ่นเลื่อนขึ้นจากล่าง (sheet) · กติกา: เจ้าของแก้ได้ ลบไม่ได้ · ลบได้เฉพาะ admin */
P.chat='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>';
S.cb={b:null,f:{cat:"",filter:"all"},L:null,P:{},reply:null,ups:[],dirty:false};
TITLE.cb="Community";TITLE.cbp="Community";TITLE.cbnew="สร้างโพสต์";NOTAB.push("cbp","cbnew");
const CB_BASE=API.replace(/\/api$/,"");
/* ตัวฉัน: รหัสพนักงานมาจาก cbBoot (todayInfo ไม่ส่ง id) */
const cbMe=()=>{const b=S.cb.b&&S.cb.b.me||{},m=S.me||{};return {id:b.id||m.id,name:m.name,nick:m.nickname||"",ph:b.ph,pic:b.pic,mod:!!b.mod,admin:!!b.admin,ro:!!b.ro}};
const cbO=()=>({base:CB_BASE,cats:(S.cb.b&&S.cb.b.cats)||[],me:cbMe()});
function cbBootLoad(force){if(S.cb.bp&&!force)return S.cb.bp;S.cb.bp=api("cbBoot").then(b=>{S.cb.b=b;return b}).catch(e=>{S.cb.bp=null;throw e});return S.cb.bp}
function cbLoad(more){const f=S.cb.f,q={cat:f.cat,filter:f.filter};if(more&&S.cb.L)q.cursor=S.cb.L.next;S.cb.loading=1;
  return api("cbList",q).then(r=>{S.cb.loading=0;S.cb.dirty=false;if(more&&S.cb.L){S.cb.L.items=S.cb.L.items.concat(r.items);S.cb.L.next=r.next}else S.cb.L=r;if(cur()==="cb")repaint()}).catch(e=>{S.cb.loading=0;toast(e.message)})}
function cbOpen(id,focus){return api("cbGet",{id}).then(d=>{S.cb.P[id]=d;if(cur()==="cbp:"+id){repaint();if(focus){const t=$("#cbct");if(t)t.focus()}}}).catch(e=>{toast(e.message);if(cur()==="cbp:"+id)back()})}
const cbPost=id=>(S.cb.P[id]&&S.cb.P[id].post)||((S.cb.L&&S.cb.L.items)||[]).find(x=>x.id===id);

/* ── การ์ดบนหน้าหลัก: ปักหมุด + ล่าสุด ── */
function cbHomeCard(){const b=S.cb.b;if(!b)return "";
  return `<div class="card cbl-home"><button class="cbl-hh" data-act="go:cb"><b>Community</b>${b.unread?`<span class="cbl-badge">${b.unread} ใหม่</span>`:""}<span style="flex:1"></span><span class="cap">ดูทั้งหมด ›</span></button>${b.latest.length?b.latest.slice(0,4).map(p=>`<button class="cbl-hr" data-cbo="${CB.esc(p.id)}">${CB.av(CB_BASE,p.author,26)}${p.pinned?CB.ic("pin","cbl-pin"):""}${CB.chip(b.cats,p.cat)}<span class="cbl-ht${p.unread?" un":""}">${CB.esc(p.body.split("\n")[0])}</span></button>`).join(""):`<span class="cap" style="padding:2px 16px 12px">ยังไม่มีโพสต์ · กดเพื่อเริ่มโพสต์แรก</span>`}</div>`}
V.home=(f=>()=>{const h=f();if(!S.today||!S.cb.b)return h;const i=h.indexOf('<div class="tiles">');return i<0?h+cbHomeCard():h.slice(0,i)+cbHomeCard()+h.slice(i)})(V.home);

/* ── ฟีด ── */
V.cb=()=>{const b=S.cb.b,L=S.cb.L,f=S.cb.f,o=cbO();if((!L||S.cb.dirty)&&!S.cb.loading)setTimeout(()=>cbLoad(),0);if(!b&&!S.cb.bp)cbBootLoad().then(()=>{if(cur()==="cb")repaint()}).catch(e=>toast(e.message));
  return band("Community")+`<div class="cbl-feed">${b&&!o.me.ro?`<button class="cbcard cbl-start" data-act="go:cbnew">${CB.av(CB_BASE,o.me,38)}<span>คุณคิดอะไรอยู่ ${CB.esc(CB.who(o.me))}</span>${CB.ic("image","cbg")}</button>`:""}
  <div class="cbl-chips">${[["","ทั้งหมด"]].concat(o.cats.map(c=>[c.id,c.name])).map(x=>`<button data-cbcat="${x[0]}" aria-pressed="${f.cat===x[0]}">${CB.esc(x[1])}</button>`).join("")}</div>
  <div class="cbl-seg">${[["all","ล่าสุด"],["noreply","ยังไม่มีคนตอบ"],["mine","ของฉัน"]].map(x=>`<button data-cbflt="${x[0]}" aria-pressed="${f.filter===x[0]}">${x[1]}</button>`).join("")}</div>
  ${!L?`<div class="skel" style="height:180px;border-radius:12px"></div><div class="skel" style="height:180px;border-radius:12px"></div>`:!L.items.length?`<div class="cbcard cbl-empty">${f.filter==="mine"?"ยังไม่มีโพสต์ของคุณ":"ยังไม่มีโพสต์ · เริ่มโพสต์แรกได้เลย"}</div>`:L.items.map(p=>CB.card(p,o)).join("")+(L.next?`<button class="cbl-more" data-cbmore>แสดงโพสต์เก่ากว่านี้</button>`:"")}</div>`};

/* ── อ่านโพสต์ (ช่องแสดงความคิดเห็นติดล่างจอ) ── */
V.cbp=id=>{const d=S.cb.P[id],o=cbO();if(!d)return band("Community")+`<div class="cbl-feed"><div class="skel" style="height:240px;border-radius:12px"></div></div>`;
  const p=d.post,rep=S.cb.reply&&d.comments.find(c=>c.id===S.cb.reply);
  const card=CB.card(Object.assign({},p,{solved:!!p.solved_id}),Object.assign(o,{full:1}));
  return band(CB.cat(o.cats,p.cat).name)+`<div class="cbl-feed cbl-post">${card.replace(/<\/article>$/,`<div class="cbthread">${CB.thread(d,o)}</div>${!d.can.comment&&p.locked?'<div class="cbnone" style="padding:6px 16px 14px">ปิดการแสดงความคิดเห็นแล้ว</div>':""}</article>`)}</div>
  ${d.can.comment?`<div class="cbl-bar">${CB.commentBox({base:CB_BASE,me:o.me,reply:rep?CB.who(rep.author):""})}</div>`:""}`};

/* ── สร้างโพสต์ (เต็มจอ) ── */
V.cbnew=()=>{const b=S.cb.b,o=cbO();if(!b){cbBootLoad().then(()=>{if(cur()==="cbnew")repaint()});return band("สร้างโพสต์")+loadingV()}
  const cats=b.cats.filter(c=>c.post_perm!=="mod"||o.me.mod),cat=S.cb.ncat||(cats.find(c=>c.id===S.cb.f.cat)||cats.find(c=>c.id==="c_talk")||cats[0]||{}).id;S.cb.ncat=cat;
  const d0=new Date(),iso=n=>{const x=new Date(d0);x.setDate(x.getDate()+n);return ISO(x)};
  return `<header class="cbl-nh"><button data-back aria-label="ปิด">${CB.ic("x")}</button><h1>สร้างโพสต์</h1><span></span></header><div class="cbl-compose cbx">${CB.composer({base:CB_BASE,me:o.me,cats,cat,mod:o.me.mod,text:S.cb.ntext||"",pinDef:iso(7),pinMin:iso(1)})}<span class="cap">โพสต์ด้วยชื่อจริง · ทุกคนในบริษัทเห็น · ห้ามใส่ข้อมูลส่วนตัว เลขบัญชี เงินเดือน</span></div>`};

/* ── รูปที่แนบ ── */
function cbPaintUps(){const b=$("#cbups");if(b)b.innerHTML=CB.upsHTML(S.cb.ups);cbSendState()}
function cbSendState(){const t=$("#cbct"),s=$("[data-cbsend]");if(t&&s)s.disabled=!t.value.trim();const x=$("#cbx-txt"),g=$("#cbx-go");if(x&&g)g.disabled=!x.value.trim()}
function cbAddFiles(inp){let fs=[...(inp.files||[])];inp.value="";if(S.cb.ups.length+fs.length>4){toast("แนบรูปได้ไม่เกิน 4 รูป");fs=fs.slice(0,4-S.cb.ups.length)}
  fs.forEach(f=>{const u={src:"",id:""};S.cb.ups.push(u);cbPaintUps();CB.shrink(f).then(d=>{u.src=d;cbPaintUps();return api("cbUpload",{data:d})}).then(r=>{u.id=r.id;cbPaintUps()}).catch(e=>{S.cb.ups.splice(S.cb.ups.indexOf(u),1);cbPaintUps();toast(e.message)})})}

/* ── เมนู ⋯ / ผู้ดูแล / แก้ไข (แผ่นเลื่อนขึ้น) ── */
const cbSheetClose=()=>{$("#ov").innerHTML=""};
function cbMenuSheet(id){const p=cbPost(id);if(!p)return;const it=CB.menuItems(p,cbMe());if(!it.length)return;
  sheet(`<div class="cbl-sh">${it.map(x=>x.sep?"<hr>":`<button data-cbmi="${x.k}|${CB.esc(id)}" class="${x.bad?"bad":""}">${CB.ic(x.ic)}<span><b>${x.t}</b>${x.d?`<small>${x.d}</small>`:""}</span></button>`).join("")}</div>`)}
function cbAct(k,id){const p=cbPost(id),after=m=>{cbSheetClose();toast(m);S.cb.dirty=true;if(cur()==="cbp:"+id)cbOpen(id);else cbLoad();cbBootLoad(true)};
  if(k==="pin"){const x=new Date();x.setDate(x.getDate()+7);sheet(`<h3>ปักหมุดโพสต์</h3><label class="cbl-f">ปักหมุดถึงวันที่<input type="date" id="cbpin" value="${ISO(x)}"></label><button class="btn pri" data-cbdo="pin|${CB.esc(id)}">ปักหมุด</button>`);return}
  if(k==="move"){sheet(`<h3>ย้ายหมวด</h3><div class="cbl-sh">${S.cb.b.cats.map(c=>`<button data-cbdo="move|${CB.esc(id)}|${c.id}">${CB.chip(S.cb.b.cats,c.id)}${p&&p.cat===c.id?'<small style="margin-left:auto">หมวดปัจจุบัน</small>':""}</button>`).join("")}</div>`);return}
  if(k==="edit"){const go=b=>sheet(`<h3>แก้ไขโพสต์</h3><textarea class="cbl-edt" id="cbedt" maxlength="5000">${CB.esc(b)}</textarea><span class="cap">ทุกคนจะเห็นว่า "แก้ไขแล้ว" · ระบบเก็บข้อความเดิมไว้</span><button class="btn pri" data-cbdo="edit|${CB.esc(id)}">บันทึก</button>`);
    if(S.cb.P[id])go(S.cb.P[id].post.body);else api("cbGet",{id}).then(d=>{S.cb.P[id]=d;go(d.post.body)}).catch(e=>toast(e.message));return}
  if(k==="delete"){sheet(`<h3>ลบโพสต์นี้?</h3><span class="cap">ซ่อนจากทุกคนทันที · ข้อมูลยังเก็บไว้ในระบบและบันทึกใน Audit Log</span><button class="btn cbl-bad" data-cbdo="delete|${CB.esc(id)}">ลบโพสต์</button><button class="btn" data-dclose>ยกเลิก</button>`);return}
  api("cbMod",{id,action:k}).then(()=>after({unpin:"เลิกปักหมุดแล้ว",lock:"ปิดการแสดงความคิดเห็นแล้ว",unlock:"เปิดให้แสดงความคิดเห็นแล้ว"}[k]||"บันทึกแล้ว")).catch(e=>toast(e.message))}
function cbDo(t,a){const [k,id,x]=a.split("|"),after=m=>{cbSheetClose();toast(m);S.cb.dirty=true;if(cur()==="cbp:"+id)cbOpen(id);else if(S.cb.P[id]&&k==="editc")cbOpen(S.cb.P[id].post.id);else cbLoad();cbBootLoad(true)};t.disabled=true;
  const fail=e=>{t.disabled=false;toast(e.message)};
  if(k==="pin"){const v=$("#cbpin").value;if(!v)return fail(new Error("เลือกวันที่"));return api("cbMod",{id,action:"pin",until:DT(v).getTime()+12*3600e3-1000}).then(()=>after("ปักหมุดแล้ว")).catch(fail)}
  if(k==="move")return api("cbMod",{id,action:"move",cat:x}).then(()=>after("ย้ายหมวดแล้ว")).catch(fail);
  if(k==="edit")return api("cbEdit",{kind:"post",id,body:$("#cbedt").value}).then(()=>after("แก้ไขแล้ว")).catch(fail);
  if(k==="editc"){const [,pid]=cur().split(":");return api("cbEdit",{kind:"comment",id,body:$("#cbedt").value}).then(()=>{cbSheetClose();toast("แก้ไขแล้ว");cbOpen(pid)}).catch(fail)}
  if(k==="delete")return api("cbDelete",{kind:"post",id}).then(()=>{cbSheetClose();toast("ลบโพสต์แล้ว");S.cb.dirty=true;if(cur()==="cbp:"+id)back();cbLoad();cbBootLoad(true)}).catch(fail);
  if(k==="delc"){const [,pid]=cur().split(":");return api("cbDelete",{kind:"comment",id}).then(()=>{cbSheetClose();toast("ลบแล้ว");cbOpen(pid)}).catch(fail)}}

/* ── แท็กคน (แผ่นเลื่อนขึ้น) ── */
let cbTagT;function cbTagSearch(q){clearTimeout(cbTagT);cbTagT=setTimeout(()=>{if(!q.trim())return cbTagPaint(null,q);api("cbFind",{q}).then(r=>cbTagPaint(r.people,q)).catch(()=>{})},250)}
function cbTagPaint(list,q){const p=document.querySelector("#ov .cbtag");if(!p)return;const tmp=document.createElement("div");tmp.innerHTML=CB.tagPanel(list,q);p.replaceWith(tmp.firstChild);const i=$("#cbtag-q");if(i){i.focus();i.selectionStart=i.selectionEnd=i.value.length}}

/* ── การกดทั้งหมด ── */
document.addEventListener("click",e=>{const t=e.target.closest("[data-cbo],[data-cbopen],[data-cbcomment],[data-cbcat],[data-cbflt],[data-cbmore],[data-cbmenu],[data-cbmi],[data-cbdo],[data-cblike],[data-cbrep],[data-cbrepx],[data-cbedc],[data-cbsol],[data-cbdelc],[data-cbsend],[data-cbrm],[data-cbemo],[data-cbemi],[data-cbtag],[data-cbtagp],#cbx-go");if(!t)return;const d=t.dataset;
  const open=(id,focus)=>{if(cur()==="cbp:"+id){if(focus){const c=$("#cbct");if(c)c.focus()}return}S.cb.reply=null;S.cb.ups=[];go("cbp:"+id);cbOpen(id,focus)};
  if(d.cbo)return open(d.cbo);if(d.cbopen)return open(d.cbopen);if(d.cbcomment)return open(d.cbcomment,1);
  if(d.cbcat!==undefined){S.cb.f.cat=d.cbcat;S.cb.L=null;repaint();cbLoad();return}
  if(d.cbflt){S.cb.f.filter=d.cbflt;S.cb.L=null;repaint();cbLoad();return}
  if(d.cbmore!==undefined){t.disabled=true;cbLoad(true);return}
  if(d.cbmenu)return cbMenuSheet(d.cbmenu);
  if(d.cbmi){const [k,id]=d.cbmi.split("|");cbSheetClose();return cbAct(k,id)}
  if(d.cbdo)return cbDo(t,d.cbdo);
  if(d.cblike){const p=cbPost(d.cblike);if(!p)return;const on=!p.liked;p.liked=on;p.likes=Math.max(0,(p.likes||0)+(on?1:-1));repaint();
    api("cbLike",{post_id:d.cblike,on}).then(r=>{p.likes=r.likes;p.liked=r.liked;repaint()}).catch(x=>{p.liked=!on;p.likes+=on?-1:1;repaint();toast(x.message)});return}
  const [,pid]=cur().split(":"),P=pid&&S.cb.P[pid];
  if(d.cbrep){const keep=($("#cbct")||{}).value||"";S.cb.reply=d.cbrep;repaint();const c=P&&P.comments.find(x=>x.id===d.cbrep),ta=$("#cbct");if(ta&&c){ta.value=keep||"@"+CB.who(c.author)+" ";ta.focus();cbSendState()}return}
  if(d.cbrepx!==undefined){const keep=($("#cbct")||{}).value||"";S.cb.reply=null;repaint();const ta=$("#cbct");if(ta){ta.value=keep;cbSendState()}return}
  if(d.cbedc){const c=P.comments.find(x=>x.id===d.cbedc);sheet(`<h3>แก้ไขความคิดเห็น</h3><textarea class="cbl-edt" id="cbedt" maxlength="2000">${CB.esc(c.body)}</textarea><button class="btn pri" data-cbdo="editc|${CB.esc(c.id)}">บันทึก</button>`);return}
  if(d.cbdelc){sheet(`<h3>ลบความคิดเห็นนี้?</h3><span class="cap">ซ่อนจากทุกคนทันที · ข้อมูลยังเก็บไว้ในระบบและบันทึกใน Audit Log</span><button class="btn cbl-bad" data-cbdo="delc|${CB.esc(d.cbdelc)}">ลบ</button><button class="btn" data-dclose>ยกเลิก</button>`);return}
  if(d.cbsol!==undefined){t.disabled=true;api("cbSolve",{post_id:pid,comment_id:d.cbsol}).then(()=>{S.cb.dirty=true;return cbOpen(pid)}).catch(x=>{t.disabled=false;toast(x.message)});return}
  if(d.cbsend!==undefined){const ta=$("#cbct"),v=ta?ta.value:"";if(!v.trim())return;if(S.cb.ups.some(u=>!u.id))return toast("รอรูปอัปโหลดเสร็จก่อน");t.disabled=true;
    api("cbComment",{post_id:pid,parent_id:S.cb.reply||"",body:v,imgs:S.cb.ups.map(u=>u.id)}).then(()=>{S.cb.reply=null;S.cb.ups=[];S.cb.dirty=true;return cbOpen(pid)}).then(()=>{const v2=liveView();if(v2)v2.scrollTop=v2.scrollHeight}).catch(x=>{t.disabled=false;toast(x.message)});return}
  if(d.cbrm){S.cb.ups.splice(+d.cbrm,1);cbPaintUps();return}
  if(d.cbemo){S.cb.emoT=d.cbemo;sheet(`<h3>อีโมจิ</h3>${CB.emojiPanel(d.cbemo)}`);return}
  if(d.cbemi){const [tid,em]=d.cbemi.split("|");cbSheetClose();CB.insert(document.getElementById(tid),em);return}
  if(d.cbtag!==undefined){sheet(`<h3>แท็กเพื่อนร่วมงาน</h3>${CB.tagPanel(null,"")}`);setTimeout(()=>{const i=$("#cbtag-q");if(i)i.focus()},50);return}
  if(d.cbtagp){cbSheetClose();CB.insert($("#cbx-txt"),"@"+d.cbtagp+" ");return}
  if(t.id==="cbx-go"){const ta=$("#cbx-txt"),v=ta?ta.value:"";if(!v.trim())return;if(S.cb.ups.some(u=>!u.id))return toast("รอรูปอัปโหลดเสร็จก่อน");const a={cat:($("#cbx-cat")||{}).value||S.cb.ncat,body:v,imgs:S.cb.ups.map(u=>u.id)};
    const pin=$("#cbx-pin");if(pin&&pin.checked)a.pin_until=DT($("#cbx-pind").value).getTime()+12*3600e3-1000;t.disabled=true;
    api("cbPost",a).then(r=>{S.cb.ntext="";S.cb.ncat="";S.cb.ups=[];S.cb.dirty=true;toast("โพสต์แล้ว");S.stack.pop();go("cbp:"+r.id);cbOpen(r.id);cbBootLoad(true)}).catch(x=>{t.disabled=false;toast(x.message)});return}
});
document.addEventListener("change",e=>{const t=e.target;if(t.hasAttribute&&t.hasAttribute("data-cbfile")){cbAddFiles(t);return}if(t.id==="cbx-cat")S.cb.ncat=t.value});
document.addEventListener("input",e=>{const t=e.target;if(t.id==="cbx-txt"){S.cb.ntext=t.value;cbSendState()}if(t.id==="cbct"){cbSendState();t.style.height="auto";t.style.height=Math.min(120,t.scrollHeight)+"px"}if(t.id==="cbtag-q")cbTagSearch(t.value)});

/* เมนูขวา: + Community · เข้าหน้า = โหลดข้อมูล · เปิดแอป = โหลดการ์ดหน้าหลัก */
drawer=(f=>open=>{f(open);if(!open)return;const nav=document.querySelector("#ov .drawer nav");if(nav&&!nav.querySelector('[data-dgo="go:cb"]'))nav.children[1].insertAdjacentHTML("beforebegin",`<button data-dgo="go:cb">${ic("chat")}Community${S.cb.b&&S.cb.b.unread?` <span class="cbl-badge">${S.cb.b.unread}</span>`:""}</button>`)})(drawer);
onEnter=(f=>()=>{f();const n=cur().split(":")[0];if(n==="cbnew"&&!S.cb.ntext)S.cb.ups=[];if(n==="cb")cbBootLoad().then(()=>{if(cur()==="cb")repaint()}).catch(()=>{})})(onEnter);
boot=(f=>function(){const r=f.apply(this,arguments);setTimeout(()=>cbBootLoad().then(()=>{if(cur()==="home")repaint()}).catch(()=>{}),400);return r})(boot);
