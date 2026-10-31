/* หลังบ้าน (admin.html) · Community — โพสต์ภายในองค์กร (1 พ.ย. 2569 · หลังบ้าน app-cf/src/community.js · หน้าตาร่วม cb-shared.js + cb.css)
 * ผู้ใช้กำหนด: หน้าตาแบบ Facebook · ไอคอนเส้น · โพสต์ไม่มีหัวข้อ · กระดานเดียวทุกบริษัท · เจ้าของแก้ได้ ลบไม่ได้ · ลบได้เฉพาะ admin · ปักหมุด/ปิดความคิดเห็น/ย้ายหมวด = HR + admin
 * การกดทั้งหมดรับที่ตัวรับคลิกตัวเดียว (cbClick) · วาดใหม่เฉพาะส่วน (#cb-feed / #cb-post) · ทุกไฟล์ admin-*.js ใช้ชื่อร่วมกัน (global) โหลดตามลำดับใน admin.html (ก่อน admin-org.js) */
'use strict';
var CB_BASE=API.replace(/\/api$/,'');
function cbMe(){var b=A.cbB&&A.cbB.me||{},m=A.d&&A.d.me||{};return {id:m.id,name:m.name||'ผู้ดูแลระบบ',nick:m.nickname||'',ph:b.ph,pic:b.pic,mod:!!b.mod,admin:!!b.admin,ro:!!b.ro}}
function cbBoot(force){if(A.cbBP&&!force)return A.cbBP;A.cbFail=0;A.cbBP=aCall('cbBoot').then(function(b){A.cbB=b;cbBadge(b.unread);return b}).catch(function(e){A.cbBP=null;A.cbFail=Date.now();throw e});return A.cbBP}
function cbBadge(n){A.cbUn=n||0;var a=$('.side a[data-nav="cb"]');if(!a)return;var c=a.querySelector('.cnt');if(!A.cbUn){if(c)c.remove();return}if(!c){c=document.createElement('span');c.className='cnt';a.appendChild(c)}c.textContent=A.cbUn}
function cbOpts(){return {base:CB_BASE,cats:(A.cbB&&A.cbB.cats)||[],me:cbMe()}}

/* ───────── ฟีด ───────── */
function vCb(){if(A.cbId)return vCbPost();var f=A.cbF||(A.cbF={cat:'',filter:'all',q:''}),cats=(A.cbB&&A.cbB.cats)||[],me=cbMe();
  var chip=function(id,l){return '<button class="chip" data-cbcat="'+id+'" aria-pressed="'+(f.cat===id)+'">'+esc(l)+'</button>'};
  return '<div class="ph"><div><h1>Community</h1><div class="sub">พูดคุย สอบถาม แจ้งปัญหา · ทุกคนในบริษัทเห็นและช่วยกันตอบได้</div></div><span class="sp"></span>'+
   '<label class="cba-q">'+CB.ic('search')+'<input type="search" id="cb-q" placeholder="ค้นหาโพสต์และความคิดเห็น" value="'+esc(f.q)+'" aria-label="ค้นหา"></label></div>'+
   '<div class="cba-g"><div class="cba-feed">'+(me.ro?'':'<button class="cbcard cba-start" data-cbnew>'+CB.av(CB_BASE,me,40)+'<span>คุณคิดอะไรอยู่ '+esc(CB.who(me))+'</span>'+CB.ic('image','cbg')+'</button>')+
   '<div class="cba-bar"><div class="chips">'+chip('','ทั้งหมด')+cats.map(function(c){return chip(c.id,c.name)}).join('')+'</div><div class="segt">'+[['all','ล่าสุด'],['noreply','ยังไม่มีคนตอบ'],['mine','ของฉัน']].map(function(x){return '<button data-cbflt="'+x[0]+'" aria-pressed="'+(f.filter===x[0])+'">'+x[1]+'</button>'}).join('')+'</div></div>'+
   '<div id="cb-feed"><div class="loading"><span class="spin"></span></div></div></div>'+
   '<aside class="cba-side"><section class="cbcard cba-rule"><b>กติกาการใช้งาน</b><span>ใช้ชื่อจริง สุภาพ ไม่พาดพิงบุคคลภายนอก</span><span>ห้ามโพสต์ข้อมูลส่วนตัว เลขบัญชี หรือเงินเดือน</span><span>แก้ไขข้อความของตัวเองได้ · ลบได้เฉพาะ admin</span></section></aside></div>'}
function bCb(){if(A.cbId)return bCbPost();var f=A.cbF;
  cbBoot().then(function(){if(A.view==='cb'&&!A.cbId&&!$('[data-cbcat="c_qa"]'))render()}).catch(function(){});
  var qt;$('#cb-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){f.q=v.trim();cbLoad()},300)};
  cbLoad()}
function cbLoad(more){var f=A.cbF,q={cat:f.cat,filter:f.filter,q:f.q};if(more)q.cursor=A.cbL.next;else if($('#cb-feed')&&!A.cbL)$('#cb-feed').innerHTML='<div class="loading"><span class="spin"></span></div>';
  return aCall('cbList',q).then(function(r){if(more){A.cbL.items=A.cbL.items.concat(r.items);A.cbL.next=r.next}else A.cbL=r;drawCbFeed()}).catch(function(e){if($('#cb-feed'))$('#cb-feed').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function drawCbFeed(){var L=A.cbL,el=$('#cb-feed');if(!el||!L)return;var o=cbOpts();
  if(!L.items.length){el.innerHTML='<div class="cbcard cba-empty">'+(A.cbF.q?'ไม่พบโพสต์ที่ตรงกับ “'+esc(A.cbF.q)+'”':'ยังไม่มีโพสต์ · เริ่มโพสต์แรกได้เลย')+'</div>';return}
  el.innerHTML=L.items.map(function(p){return CB.card(p,{base:o.base,cats:o.cats,me:o.me,menuOpen:A.cbMenu===p.id})}).join('')+(L.next?'<button class="cba-more" data-cbmore>แสดงโพสต์เก่ากว่านี้</button>':'')}

/* ───────── อ่านโพสต์ ───────── */
function vCbPost(){return '<div class="ph"><div><div class="crumb"><a href="#" id="cb-back">Community</a> ›</div><h1 id="cb-h">โพสต์</h1></div></div><div class="cba-g"><div class="cba-feed" id="cb-post"><div class="loading"><span class="spin"></span></div></div><aside class="cba-side" id="cb-pside"></aside></div>'}
function bCbPost(){$('#cb-back').onclick=function(e){e.preventDefault();A.cbId=null;A.cbP=null;A.cbL=null;render();cbBoot(true)};
  cbBoot().catch(function(){});cbOpenPost(A.cbId)}
function cbOpenPost(id){return aCall('cbGet',{id:id}).then(function(d){A.cbP=d;drawCbPost();cbBoot(true);if(A.cbFocus){A.cbFocus=0;var t=$('#cbct');if(t){t.focus();t.scrollIntoView({block:'center'})}}}).catch(function(e){if($('#cb-post'))$('#cb-post').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function drawCbPost(){var d=A.cbP,el=$('#cb-post');if(!el||!d)return;var p=d.post,o=cbOpts(),rep=A.cbReply&&d.comments.filter(function(c){return c.id===A.cbReply})[0];
  $('#cb-h').textContent=p.deleted?'โพสต์ที่ถูกลบ':'โพสต์ของ '+CB.who(p.author);
  var card=CB.card(Object.assign({},p,{solved:!!p.solved_id}),{base:o.base,cats:o.cats,me:o.me,full:1,menuOpen:A.cbMenu===p.id});
  el.innerHTML=(p.deleted?'<div class="alert">โพสต์นี้ถูก admin ลบแล้ว (admin ยังเห็นหน้านี้)</div>':'')+card.replace(/<\/article>$/,'<div class="cbthread">'+CB.thread(d,o)+'</div>'+(d.can.comment?CB.commentBox({base:o.base,me:o.me,reply:rep?CB.who(rep.author):''}):(p.locked?'<div class="cbnone" style="padding:8px 16px 14px">ปิดการแสดงความคิดเห็นแล้ว</div>':''))+'</article>');
  cbPaintUps();
  $('#cb-pside').innerHTML='<section class="cbcard cba-rule"><b>'+(p.author.id===o.me.id?'เจ้าของโพสต์ทำได้':'ทุกคนทำได้')+'</b>'+(p.author.id===o.me.id?'<span>แก้ไขข้อความ (กด ⋯)</span><span>เลือกคำตอบที่ถูกต้อง</span><span>ลบไม่ได้ — แจ้ง admin ให้ลบ</span>':'<span>ถูกใจ · แสดงความคิดเห็น · ตอบกลับ</span><span>แนบรูปได้ 4 รูป · แท็กเพื่อนด้วย @ชื่อ</span><span>พบเนื้อหาไม่เหมาะสม แจ้ง HR / admin</span>')+'</section>'+
    (o.me.mod?'<section class="cbcard cba-rule"><b>ผู้ดูแล</b><span>ปักหมุด · ปิดความคิดเห็น · ย้ายหมวด = HR + admin</span><span>ลบ = admin เท่านั้น (ข้อมูลยังเก็บไว้ + Audit Log)</span></section>':'')}
function cbRedraw(){if(A.cbId)drawCbPost();else drawCbFeed()}
function cbFind(id){if(A.cbP&&A.cbP.post.id===id)return A.cbP.post;return ((A.cbL&&A.cbL.items)||[]).filter(function(x){return x.id===id})[0]}
function cbReloadPost(){return A.cbId?cbOpenPost(A.cbId):cbLoad()}

/* ───────── รูปที่แนบ (ช่องความคิดเห็น / หน้าต่างสร้างโพสต์) ───────── */
A.cbUps=[];A.cbXUps=[];
function cbPaintUps(){var b=$('.cbx #cbups');if(b)b.innerHTML=CB.upsHTML(A.cbXUps);var c=$('.cbcbox #cbups');if(c)c.innerHTML=CB.upsHTML(A.cbUps);cbSendState()}
function cbSendState(){var t=$('#cbct'),s=$('[data-cbsend]');if(t&&s)s.disabled=!t.value.trim();var x=$('#cbx-txt'),g=$('#cbx-go');if(x&&g)g.disabled=!x.value.trim()}
function cbAddFiles(inp){var ups=inp.closest('.cbx')?A.cbXUps:A.cbUps,files=Array.prototype.slice.call(inp.files||[]);inp.value='';
  if(ups.length+files.length>4){toast('แนบรูปได้ไม่เกิน 4 รูป',1);files=files.slice(0,4-ups.length)}
  files.forEach(function(f){var u={src:'',id:''};ups.push(u);cbPaintUps();CB.shrink(f).then(function(d){u.src=d;cbPaintUps();return aCall('cbUpload',{data:d})}).then(function(r){u.id=r.id;cbPaintUps()}).catch(function(e){ups.splice(ups.indexOf(u),1);cbPaintUps();toast(e.message,1)})})}

/* ───────── สร้างโพสต์ (หน้าต่างแบบ Facebook) ───────── */
function cbCompose(){var b=A.cbB||{cats:[],me:{}},me=cbMe(),cats=b.cats.filter(function(c){return c.post_perm!=='mod'||me.mod}),cat=(A.cbF&&A.cbF.cat&&cats.some(function(c){return c.id===A.cbF.cat}))?A.cbF.cat:(cats.filter(function(c){return c.id==='c_talk'})[0]||cats[0]||{}).id;
  A.cbXUps=[];var w=document.createElement('div');w.className='cba-mw';
  w.innerHTML='<div class="cba-modal cbx" role="dialog" aria-modal="true" aria-labelledby="cbx-t"><div class="cba-mh"><span></span><h3 id="cbx-t">สร้างโพสต์</h3><button class="cba-x" data-cbxclose aria-label="ปิด">'+CB.ic('x')+'</button></div><div class="cba-mb">'+
    CB.composer({base:CB_BASE,me:me,cats:cats,cat:cat,mod:me.mod,pinDef:dAdd(dIso(new Date()),7),pinMin:dAdd(dIso(new Date()),1)})+'</div></div>';
  document.body.appendChild(w);$('#cbx-txt').focus();
  w.addEventListener('mousedown',function(e){if(e.target===w&&!$('#cbx-txt').value.trim())cbComposeClose()})}
function cbComposeClose(){var w=$('.cba-mw');if(w)w.remove();A.cbXUps=[]}
function cbComposeGo(btn){var t=$('#cbx-txt');if(!t.value.trim())return;if(A.cbXUps.some(function(u){return !u.id}))return toast('รอรูปอัปโหลดเสร็จก่อน',1);
  var a={cat:$('#cbx-cat').value,body:t.value,imgs:A.cbXUps.map(function(u){return u.id})};if($('#cbx-pin')&&$('#cbx-pin').checked)a.pin_until=dObj($('#cbx-pind').value).getTime()+86399000;busy(btn,1);
  aCall('cbPost',a).then(function(r){cbComposeClose();toast('โพสต์แล้ว');A.cbId=r.id;A.cbP=null;A.cbL=null;A.view='cb';render();scrollTo(0,0)}).catch(function(e){busy(btn,0);toast(e.message,1)})}

/* ───────── แผงอีโมจิ / แท็กคน ───────── */
function cbPop(html,anchor){cbPopClose();var p=document.createElement('div');p.className='cba-pop';p.innerHTML=html;document.body.appendChild(p);var r=anchor.getBoundingClientRect(),w=p.firstChild.offsetWidth||320;
  p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';p.style.top=(r.top-p.offsetHeight-8>8?r.top-p.offsetHeight-8:r.bottom+8)+'px';return p}
function cbPopClose(){var p=$('.cba-pop');if(p)p.remove()}
var cbTagT;function cbTagSearch(q){clearTimeout(cbTagT);cbTagT=setTimeout(function(){if(!q.trim()){cbTagPaint(null,q);return}aCall('cbFind',{q:q}).then(function(r){cbTagPaint(r.people,q)}).catch(function(){})},250)}
function cbTagPaint(list,q){var p=$('.cba-pop .cbtag');if(!p)return;var tmp=document.createElement('div');tmp.innerHTML=CB.tagPanel(list,q);var inp=$('#cbtag-q'),pos=inp?inp.selectionStart:0;p.replaceWith(tmp.firstChild);var i2=$('#cbtag-q');if(i2){i2.focus();i2.selectionStart=i2.selectionEnd=pos}}

/* ───────── การกดทั้งหมด ───────── */
function cbAct(k,id){var p=cbFind(id),done=function(m){toast(m);cbReloadPost();cbBoot(true)};
  if(k==='pin'){drawer('ปักหมุดโพสต์','<label class="f"><span>ปักหมุดถึงวันที่</span><input type="date" id="cb-pin" value="'+dAdd(dIso(new Date()),7)+'" min="'+dAdd(dIso(new Date()),1)+'"></label><div class="faint" style="font-size:12.5px">โพสต์แสดงบนสุดของ Community จนถึงวันนั้น (สูงสุด 1 ปี)</div>','<button class="btn pri" id="cb-pinok">ปักหมุด</button>');
    $('#cb-pinok').onclick=function(){var v=$('#cb-pin').value;if(!v)return;aCall('cbMod',{id:id,action:'pin',until:dObj(v).getTime()+86399000}).then(function(){closeD();done('ปักหมุดแล้ว')}).catch(function(e){toast(e.message,1)})};return}
  if(k==='move'){drawer('ย้ายหมวด','<label class="f"><span>หมวด</span><select id="cb-mv">'+A.cbB.cats.map(function(c){return '<option value="'+c.id+'"'+(p&&c.id===p.cat?' selected':'')+'>'+esc(c.name)+'</option>'}).join('')+'</select></label>','<button class="btn pri" id="cb-mvok">ย้าย</button>');
    $('#cb-mvok').onclick=function(){aCall('cbMod',{id:id,action:'move',cat:$('#cb-mv').value}).then(function(){closeD();done('ย้ายหมวดแล้ว')}).catch(function(e){toast(e.message,1)})};return}
  if(k==='edit'){var go=function(full){cbEdit('post',id,full,function(){done('แก้ไขแล้ว')})};if(A.cbP&&A.cbP.post.id===id)go(A.cbP.post.body);else aCall('cbGet',{id:id}).then(function(d){go(d.post.body)}).catch(function(e){toast(e.message,1)});return}
  if(k==='delete'){ask({title:'ลบโพสต์นี้?',desc:'ซ่อนจากทุกคนทันที · ข้อมูลยังเก็บไว้ในระบบและบันทึกใน Audit Log',tone:'bad',icon:'del',buttons:[{k:'no',label:'ยกเลิก'},{k:'ok',label:'ลบ',tone:'bad'}]}).then(function(r){if(r!=='ok')return;
    aCall('cbDelete',{kind:'post',id:id}).then(function(){toast('ลบโพสต์แล้ว');if(A.cbId){A.cbId=null;A.cbP=null;A.cbL=null;render()}else cbLoad();cbBoot(true)}).catch(function(e){toast(e.message,1)})});return}
  aCall('cbMod',{id:id,action:k}).then(function(){done({unpin:'เลิกปักหมุดแล้ว',lock:'ปิดการแสดงความคิดเห็นแล้ว',unlock:'เปิดให้แสดงความคิดเห็นแล้ว'}[k]||'บันทึกแล้ว')}).catch(function(e){toast(e.message,1)})}
function cbEdit(kind,id,body,done){drawer(kind==='post'?'แก้ไขโพสต์':'แก้ไขความคิดเห็น','<label class="f"><span>ข้อความ</span><textarea id="cb-edt" rows="8" maxlength="'+(kind==='post'?5000:2000)+'">'+esc(body)+'</textarea></label><div class="faint" style="font-size:12.5px">ทุกคนจะเห็นว่า "แก้ไขแล้ว" · ระบบเก็บข้อความเดิมไว้</div>','<button class="btn pri" id="cb-edok">บันทึก</button>');
  $('#cb-edok').onclick=function(){var b=this;busy(b,1);aCall('cbEdit',{kind:kind,id:id,body:$('#cb-edt').value}).then(function(){closeD();done()}).catch(function(e){busy(b,0);toast(e.message,1)})}}
function cbClick(e){if(A.view!=='cb'&&!$('.cba-mw')&&!$('.cba-pop'))return;var t=e.target.closest('[data-cbnew],[data-cbcat],[data-cbflt],[data-cbmore],[data-cbopen],[data-cbmenu],[data-cbmi],[data-cblike],[data-cbcomment],[data-cbrep],[data-cbrepx],[data-cbedc],[data-cbsol],[data-cbdelc],[data-cbsend],[data-cbrm],[data-cbemo],[data-cbemi],[data-cbtag],[data-cbtagp],[data-cbxclose],#cbx-go');
  if(!e.target.closest('.cba-pop')&&!(t&&(t.dataset.cbemo||t.dataset.cbtag!==undefined)))cbPopClose();
  if(A.cbMenu&&!(t&&(t.dataset.cbmenu||t.dataset.cbmi))&&!e.target.closest('.cbmenu')){A.cbMenu=null;cbRedraw()}
  if(!t)return;var d=t.dataset;
  if(d.cbnew!==undefined)return cbCompose();
  if(d.cbxclose!==undefined)return cbComposeClose();
  if(t.id==='cbx-go')return cbComposeGo(t);
  if(d.cbcat!==undefined){A.cbF.cat=d.cbcat;$$('[data-cbcat]').forEach(function(x){x.setAttribute('aria-pressed',x===t)});return cbLoad()}
  if(d.cbflt){A.cbF.filter=d.cbflt;$$('[data-cbflt]').forEach(function(x){x.setAttribute('aria-pressed',x===t)});return cbLoad()}
  if(d.cbmore!==undefined){t.disabled=true;return cbLoad(true)}
  if(d.cbopen){if(A.cbId===d.cbopen)return;A.cbId=d.cbopen;A.cbP=null;A.cbReply=null;A.cbUps=[];render();scrollTo(0,0);return}
  if(d.cbcomment){if(A.cbId===d.cbcomment){var tc=$('#cbct');if(tc)tc.focus();return}A.cbFocus=1;A.cbId=d.cbcomment;A.cbP=null;A.cbReply=null;A.cbUps=[];render();return}
  if(d.cbmenu){A.cbMenu=A.cbMenu===d.cbmenu?null:d.cbmenu;cbRedraw();return}
  if(d.cbmi){var m=d.cbmi.split('|');A.cbMenu=null;cbRedraw();return cbAct(m[0],m[1])}
  if(d.cblike){var p=cbFind(d.cblike);if(!p)return;var on=!p.liked;p.liked=on;p.likes=Math.max(0,(p.likes||0)+(on?1:-1));cbRedraw();
    aCall('cbLike',{post_id:d.cblike,on:on}).then(function(r){p.likes=r.likes;p.liked=r.liked;cbRedraw()}).catch(function(x){p.liked=!on;p.likes+=on?-1:1;cbRedraw();toast(x.message,1)});return}
  var P=A.cbP;
  if(d.cbrep){A.cbReply=d.cbrep;var keep=$('#cbct')?$('#cbct').value:'';drawCbPost();var c=P.comments.filter(function(x){return x.id===d.cbrep})[0],ta=$('#cbct');if(ta){ta.value=keep||('@'+CB.who(c.author)+' ');ta.focus();cbSendState()}return}
  if(d.cbrepx!==undefined){A.cbReply=null;var kv=$('#cbct').value;drawCbPost();$('#cbct').value=kv;cbSendState();return}
  if(d.cbedc){var cc=P.comments.filter(function(x){return x.id===d.cbedc})[0];return cbEdit('comment',cc.id,cc.body,function(){toast('แก้ไขแล้ว');cbOpenPost(P.post.id)})}
  if(d.cbsol!==undefined){busy(t,1);aCall('cbSolve',{post_id:P.post.id,comment_id:d.cbsol}).then(function(){cbOpenPost(P.post.id)}).catch(function(x){busy(t,0);toast(x.message,1)});return}
  if(d.cbdelc){ask({title:'ลบความคิดเห็นนี้?',desc:'ซ่อนจากทุกคนทันที · ข้อมูลยังเก็บไว้ในระบบและบันทึกใน Audit Log',tone:'bad',icon:'del',buttons:[{k:'no',label:'ยกเลิก'},{k:'ok',label:'ลบ',tone:'bad'}]}).then(function(r){if(r!=='ok')return;
    aCall('cbDelete',{kind:'comment',id:d.cbdelc}).then(function(){toast('ลบแล้ว');cbOpenPost(P.post.id)}).catch(function(x){toast(x.message,1)})});return}
  if(d.cbsend!==undefined){var v=$('#cbct').value;if(!v.trim())return;if(A.cbUps.some(function(u){return !u.id}))return toast('รอรูปอัปโหลดเสร็จก่อน',1);busy(t,1);
    aCall('cbComment',{post_id:P.post.id,parent_id:A.cbReply||'',body:v,imgs:A.cbUps.map(function(u){return u.id})}).then(function(){A.cbReply=null;A.cbUps=[];return cbOpenPost(P.post.id)}).catch(function(x){busy(t,0);toast(x.message,1)});return}
  if(d.cbrm){var inX=!!t.closest('.cbx');(inX?A.cbXUps:A.cbUps).splice(+d.cbrm,1);cbPaintUps();return}
  if(d.cbemo){if($('.cba-pop .cbemo')){cbPopClose();return}cbPop(CB.emojiPanel(d.cbemo),t);return}
  if(d.cbemi){var x=d.cbemi.split('|');CB.insert(document.getElementById(x[0]),x[1]);return}
  if(d.cbtag!==undefined){if($('.cba-pop .cbtag')){cbPopClose();return}cbPop(CB.tagPanel(null,''),t);$('#cbtag-q').focus();return}
  if(d.cbtagp){CB.insert($('#cbx-txt'),'@'+d.cbtagp+' ');cbPopClose();return}}
document.addEventListener('click',cbClick);
document.addEventListener('input',function(e){var t=e.target;if(t.id==='cbct'||t.id==='cbx-txt'){cbSendState();if(t.id==='cbct'){t.style.height='auto';t.style.height=Math.min(140,t.scrollHeight)+'px'}}if(t.id==='cbtag-q')cbTagSearch(t.value)});
document.addEventListener('change',function(e){if(e.target.hasAttribute&&e.target.hasAttribute('data-cbfile'))cbAddFiles(e.target)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if($('.cba-pop'))return cbPopClose();if(A.cbMenu){A.cbMenu=null;return cbRedraw()}if($('.cba-mw')&&!$('#cbx-txt').value.trim())cbComposeClose()}
  if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='cbct'&&!e.isComposing){e.preventDefault();var s=$('[data-cbsend]');if(s&&!s.disabled)s.click()}});

/* ───────── การ์ด Community บน Dashboard (ปักหมุด + ล่าสุด 5) ───────── */
function cbDashCard(){var b=A.cbB;if(!b)return '';var cats=b.cats;return '<section class="card cba-dash"><div class="cba-dh"><b>Community</b>'+(b.unread?'<span class="cba-new">'+b.unread+' ใหม่</span>':'')+'<span class="sp"></span><button class="lnk" data-go="cb">ดูทั้งหมด →</button></div>'+
  (b.latest.length?b.latest.map(function(p){return '<button class="cba-dr" data-cbgo="'+esc(p.id)+'">'+CB.av(CB_BASE,p.author,28)+(p.pinned?CB.ic('pin','cba-pin'):'')+CB.chip(cats,p.cat)+'<span class="cba-dt'+(p.unread?' un':'')+'">'+esc(p.body.split('\n')[0])+'</span><span class="cba-dc">'+CB.ic('comment')+p.replies+'</span></button>'}).join(''):'<div class="faint" style="padding:10px 18px 14px">ยังไม่มีโพสต์</div>')+'</section>'}
