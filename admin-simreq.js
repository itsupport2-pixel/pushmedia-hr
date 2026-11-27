/* เมนู คำขอเบิก SIM (27 พ.ย. 2569 · ระยะที่ 1 · Figma หน้า 68 `1919:16` จอ 1.1–1.6 · 2.x · 3.1–3.2)
 * ข้อมูล: app-cf/src/simreq.js (D1 sim_req*) · ตรวจสิทธิ์ srAuth (app/gas/admin/SimReq.js) · ยื่นได้ทุกคน · คิวเปิดใช้งาน = คนที่เห็นเมนู SIM Monitor
 * ฟอร์ม 4 ขั้น: โปรเจกต์ + ประเภท → จุดติดตั้ง / เบอร์ → MA + เอกสาร → ผู้อนุมัติ + ตรวจก่อนส่ง · คลาสใหม่ขึ้นต้น sq- · ฟังก์ชันขึ้นต้น sq */
var SQ_ST={draft:['ร่าง','#52525B','#F1F2F4'],pending:['รอตรวจ / อนุมัติ','#9A6700','#FFF4D6'],returned:['ส่งกลับแก้ไข','#9A6700','#FFF4D6'],rejected:['ไม่อนุมัติ','#C0392B','#FDECEA'],approved:['อนุมัติแล้ว รอเปิดใช้','#0A6C99','#E3F2FB'],partial:['เปิดใช้งานบางจุด','#0A6C99','#E3F2FB'],active:['เปิดใช้งานครบ','#2E7D32','#E8F5E9'],cancelled:['ยกเลิก','#52525B','#F1F2F4']};
var SQ_KIND={new:'ซิมใหม่ · เปิดเบอร์ใหม่กับ dtac',add:'เพิ่มจุดในโปรเจกต์เดิม',replace:'เปลี่ยนซิม · ซิมเสีย/สูญหาย'};
var SQ_PROV=('กรุงเทพมหานคร กระบี่ กาญจนบุรี กาฬสินธุ์ กำแพงเพชร ขอนแก่น จันทบุรี ฉะเชิงเทรา ชลบุรี ชัยนาท ชัยภูมิ ชุมพร เชียงราย เชียงใหม่ ตรัง ตราด ตาก นครนายก นครปฐม นครพนม นครราชสีมา นครศรีธรรมราช นครสวรรค์ นนทบุรี นราธิวาส น่าน บึงกาฬ บุรีรัมย์ ปทุมธานี ประจวบคีรีขันธ์ ปราจีนบุรี ปัตตานี พระนครศรีอยุธยา พะเยา พังงา พัทลุง พิจิตร พิษณุโลก เพชรบุรี เพชรบูรณ์ แพร่ ภูเก็ต มหาสารคาม มุกดาหาร แม่ฮ่องสอน ยโสธร ยะลา ร้อยเอ็ด ระนอง ระยอง ราชบุรี ลพบุรี ลำปาง ลำพูน เลย ศรีสะเกษ สกลนคร สงขลา สตูล สมุทรปราการ สมุทรสงคราม สมุทรสาคร สระแก้ว สระบุรี สิงห์บุรี สุโขทัย สุพรรณบุรี สุราษฎร์ธานี สุรินทร์ หนองคาย หนองบัวลำภู อ่างทอง อำนาจเจริญ อุดรธานี อุตรดิตถ์ อุทัยธานี อุบลราชธานี').split(' ');
var SQ_TM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
if(typeof SVX_TABI!=='undefined'){SVX_TABI.sqm=['user','#2F6FED'];SVX_TABI.sqt=['check','#B45309'];SVX_TABI.sqq=['list','#0A6C99'];SVX_TABI.sqa=['chart','#52525B']}
function sqD(d){d=String(d||'');var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(d);return m?(+m[3])+' '+SQ_TM[+m[2]-1]+' '+(+m[1]+543):'—'}
function sqB(st){var x=SQ_ST[st]||[st,'#52525B','#F1F2F4'];return '<span class="badge sq-b" style="color:'+x[1]+';background:'+x[2]+'">'+esc(x[0])+'</span>'}
function sqPh(ms){ms=String(ms||'');if(!/^66\d{8,9}$/.test(ms))return esc(ms);var l='0'+ms.slice(2);return l.slice(0,3)+'-'+l.slice(3,6)+'-'+l.slice(6)}
function sqKb(n){n=+n||0;return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'}
function sqF(){return A.sqF||(A.sqF={box:'mine',q:''})}
function sqEmpTxt(e){return e.n+' · '+e.c+(e.p?' · '+e.p:'')}
function sqPeople(){return A.sqPP?Promise.resolve(A.sqPP):aCall('srPeopleList').then(function(d){A.sqPP=d.emps;return d.emps})}
/* 28 พ.ย. 2569 ผู้ใช้: คำขอเบิก SIM อยู่เมนูเดียวกับ SIM Monitor (แท็บ คำขอเบิก SIM) · emb = วาดในแท็บ · sqGo = กลับมาหน้ารายการคำขอ */
function sqGo(){if(A.view==='sim')simGo('rq');else go('simr')}
function vSq(emb){
  if(A.sqEd)return '<div id="sq-root">'+SK('rows','กำลังโหลด…')+'</div>';
  var f=sqF();
  if(emb)return '<div class="sq-bar"><label class="sq-q">'+ic('search')+'<input id="sq-q" placeholder="ค้นหาเลขคำขอ โปรเจกต์ ลูกค้า ผู้ยื่น" value="'+esc(f.q)+'"></label><span class="sp"></span><button class="btn pri" id="sq-new">+ ขอเบิก SIM</button></div><div class="sq-subt" role="tablist" id="sq-tabs"></div><div id="sq-body">'+SK('rows','กำลังโหลด…')+'</div>';
  return '<div class="ph"><div><h1>คำขอเบิก SIM</h1><div class="sub">ขอเปิดเบอร์ SIM dtac สำหรับโปรเจกต์ · ส่งผู้ตรวจ / ผู้อนุมัติ · ผู้รับผิดชอบ SIM เปิดใช้งานทีละจุด</div></div><span class="sp"></span><button class="btn pri" id="sq-new">'+ic('plus')+' ขอเบิก SIM</button></div>'+
   '<div class="svx-tabs svx-tl" role="tablist" id="sq-tabs"></div>'+
   '<div class="sq-bar"><label class="sq-q">'+ic('search')+'<input id="sq-q" placeholder="ค้นหาเลขคำขอ โปรเจกต์ ลูกค้า ผู้ยื่น" value="'+esc(f.q)+'"></label></div><div id="sq-body">'+SK('rows','กำลังโหลด…')+'</div>'}
function bSq(){
  if(A.sqEd)return sqEdBoot();
  var f=sqF(),t=null;
  $('#sq-new').onclick=function(){sqEdit(null)};
  $('#sq-q').oninput=function(){clearTimeout(t);var v=this.value;t=setTimeout(function(){f.q=v;sqLoad()},250)};
  aCall('srBoot').then(function(b){A.sqB=b;sqTabs();sqLoad()}).catch(function(e){$('#sq-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function sqTabs(){var b=A.sqB,f=sqF(),n=b.n||{},T=[['sqm','mine','คำขอของฉัน',n.mine],['sqt','todo','รออนุมัติ',n.todo]];
  if(b.me.sim)T.push(['sqq','queue','คิวเปิดใช้งาน',n.queue],['sqa','all','ทั้งหมด',null]);
  if(!T.some(function(x){return x[1]===f.box}))f.box='mine';
  $('#sq-tabs').innerHTML=A.view==='sim'?T.map(function(x){return '<button class="sq-sb'+(f.box===x[1]?' on':'')+'" data-sqt="'+x[0]+'">'+esc(x[2])+(x[3]?'<span>'+x[3]+'</span>':'')+'</button>'}).join(''):T.map(function(x){return svxTab('data-sqt',x[0],x[2],x[3]||null,f.box===x[1])}).join('');
  $$('[data-sqt]').forEach(function(btn){btn.onclick=function(){f.box={sqm:'mine',sqt:'todo',sqq:'queue',sqa:'all'}[btn.dataset.sqt];sqTabs();sqLoad()}})}
function sqLoad(){var f=sqF(),el=$('#sq-body');if(!el)return;el.innerHTML=SK('rows');
  aCall('srList',{box:f.box,q:f.q}).then(function(d){if(!$('#sq-body'))return;A.sqL=d.rows;sqDraw()}).catch(function(e){el.innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function sqDraw(){var L=A.sqL||[],f=sqF(),el=$('#sq-body');
  if(!L.length){el.innerHTML='<section class="card state"><b>'+({mine:'ยังไม่มีคำขอ',todo:'ไม่มีคำขอที่รอคุณ',queue:'ไม่มีคำขอที่รอเปิดใช้งาน',all:'ไม่มีคำขอ'})[f.box]+'</b><span>'+(f.box==='mine'?'กด ขอเบิก SIM เพื่อเริ่ม':'รายการใหม่จะขึ้นที่นี่')+'</span></section>';return}
  el.innerHTML='<div class="card sq-tw"><table class="tbl sq-t"><thead><tr><th>เลขที่</th><th>โปรเจกต์</th><th>จุดติดตั้ง</th><th>สถานะ</th><th>ผู้ยื่น</th><th>ส่งเมื่อ</th><th>รอใคร</th></tr></thead><tbody>'+
   L.map(function(r){return '<tr data-sqo="'+esc(r.id)+'" tabindex="0"><td><b>'+esc(r.no)+'</b></td><td><b>'+esc(r.proj_no||'—')+'</b><small>'+esc(r.project||'')+(r.customer?' · '+esc(r.customer):'')+'</small></td>'+
    '<td>'+(r.st==='partial'||r.st==='active'?'<b>'+r.n_act+'</b> / '+r.n+' เปิดแล้ว':r.n+' จุด')+'</td><td>'+sqB(r.st)+'</td><td>'+esc(r.by)+'<small>'+esc(r.dept||'')+'</small></td><td>'+sqD(r.submitted||r.created)+'</td><td>'+(r.cur?esc(r.cur):'<span class="faint">—</span>')+'</td></tr>'}).join('')+'</tbody></table></div>';
  $$('[data-sqo]').forEach(function(tr){tr.onclick=function(){sqOpen(tr.dataset.sqo)};tr.onkeydown=function(e){if(e.key==='Enter')sqOpen(tr.dataset.sqo)}})}

/* ── รายละเอียดคำขอ (แผงขวา) ── */
function sqOpen(id){drawer('คำขอเบิก SIM',SK('rows','กำลังโหลด…'));aCall('srGet',{id:id}).then(sqDet).catch(function(e){$('.drw .cb').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function sqDet(d){var r=d.r,cb=$('.drw .cb');if(!cb)return;A.sqCur=d;$('.drw h3').textContent=r.no;
  var stp=r.steps.map(function(x,i){var on=r.st==='pending'&&i===r.cur_i,c=x.st==='ok'?'ok':x.st==='no'?'no':x.st==='back'?'back':on?'on':'';
    return '<div class="sq-sp sq-sp-'+(c||'w')+'"><span class="sq-dot">'+(x.st==='ok'?ic('check'):i+1)+'</span><span><b>'+esc(x.n)+'</b><small>'+(x.r==='review'?'ผู้ตรวจสอบ':'ผู้อนุมัติ')+' · '+(x.st==='ok'?'ผ่าน '+sqD(x.at):x.st==='no'?'ไม่อนุมัติ '+sqD(x.at):x.st==='back'?'ส่งกลับแก้ไข '+sqD(x.at):on?'รอดำเนินการ':'ยังไม่ถึงขั้นนี้')+'</small>'+(x.note?'<em>'+esc(x.note)+'</em>':'')+'</span></div>'}).join('');
  cb.innerHTML='<div class="sq-dh">'+sqB(r.st)+'<span class="faint">'+esc(SQ_KIND[r.kind]||'')+'</span></div>'+
   '<div class="sq-kv"><div><small>โปรเจกต์</small><b>'+esc(r.proj_no)+'</b><span>'+esc(r.project)+'</span></div><div><small>ลูกค้า</small><b>'+esc(r.customer||'—')+'</b><span>'+(r.proj_years?esc(r.proj_years)+' ปี':'')+(r.purpose?' · '+esc(r.purpose):'')+'</span></div>'+
   '<div><small>ผู้ยื่น</small><b>'+esc(r.by)+'</b><span>'+esc(r.dept||'')+' · '+sqD(r.req_date)+'</span></div><div><small>ผู้รับผิดชอบโปรเจกต์</small><b>'+esc(r.owner_name||'—')+'</b><span>'+esc(r.owner_code||'')+'</span></div>'+
   '<div><small>MA</small><b>'+(r.ma_end?sqD(r.ma_start)+' – '+sqD(r.ma_end):'—')+'</b><span>'+(r.ma_value!=null&&r.ma_value!==''?'฿'+Number(r.ma_value).toLocaleString('th-TH')+' ต่อปี':'')+'</span></div><div><small>ต้องการใช้</small><b>'+sqD(r.need)+'</b><span>'+esc(r.pkg||'')+'</span></div></div>'+
   (r.detail?'<div class="sq-dtx">'+esc(r.detail).replace(/\n/g,'<br>')+'</div>':'')+
   '<h4 class="sq-h4">จุดติดตั้ง '+d.pts.length+' จุด'+(r.n_act?' · เปิดแล้ว '+r.n_act:'')+'</h4><div class="sq-pts">'+d.pts.map(function(p){return '<div class="sq-pt'+(p.msisdn?' on':'')+'"><span class="sq-no">'+p.seq+'</span><span><b>'+esc(p.province||'ยังไม่ใส่จังหวัด')+'</b><small>'+esc([p.device,p.pkg||r.pkg,p.need_date?'ใช้ '+sqD(p.need_date):'',p.note].filter(Boolean).join(' · '))+'</small></span>'+(p.msisdn?'<span class="sq-ms"><b>'+sqPh(p.msisdn)+'</b><small>เปิด '+sqD(p.act_date)+'</small></span>':'')+'</div>'}).join('')+'</div>'+
   (r.steps.length?'<h4 class="sq-h4">ลำดับการอนุมัติ</h4><div class="sq-sps">'+stp+'</div>':'')+
   (r.files.length?'<h4 class="sq-h4">เอกสาร '+r.files.length+' ไฟล์</h4><div class="sq-fs">'+r.files.map(function(f){return '<button class="sq-f" data-sqfg="'+esc(f.k)+'">'+ic('dl')+'<span><b>'+esc(f.name)+'</b><small>'+sqKb(f.size)+'</small></span></button>'}).join('')+'</div>':'')+
   (d.problems.length?'<div class="alert sq-pr"><b>ยังส่งไม่ได้</b>'+d.problems.map(function(p){return '<div>· '+esc(p)+'</div>'}).join('')+'</div>':'')+
   '<h4 class="sq-h4">ประวัติ</h4><div class="sq-lg">'+d.log.map(function(l){return '<div><small>'+sqD(l.at)+' '+esc(String(l.at).slice(11,16))+'</small><span><b>'+esc(l.by_name)+'</b> '+esc(l.note||l.act)+'</span></div>'}).join('')+'</div>';
  var c=d.can,ft=[];
  if(c.cancel)ft.push('<button class="btn" id="sq-cancel">ยกเลิกคำขอ</button>');
  if(c.edit)ft.push('<button class="btn" id="sq-edit">แก้ไข</button>');
  if(c.submit&&!d.problems.length)ft.push('<button class="btn pri" id="sq-send">ส่งคำขอ</button>');
  if(c.decide)ft.push('<button class="btn" id="sq-no">ไม่อนุมัติ</button><button class="btn" id="sq-back">ส่งกลับแก้ไข</button><button class="btn pri" id="sq-ok">'+((r.steps[r.cur_i]||{}).r==='review'?'ตรวจแล้ว ส่งต่อ':'อนุมัติ')+'</button>');
  if(c.activate)ft.push('<button class="btn pri" id="sq-act">เปิดใช้งาน SIM</button>');
  var fo=$('.drw .sq-cf');if(!fo){fo=document.createElement('div');fo.className='ch sq-cf';$('.drw').appendChild(fo)}fo.innerHTML=ft.join('');fo.style.display=ft.length?'':'none';
  $$('[data-sqfg]').forEach(function(b){b.onclick=function(){sqFileOpen(r.id,b.dataset.sqfg)}});
  var run=function(fn,a,ok){return aCall(fn,a).then(function(x){if(ok)toast(ok);sqDet(x);sqRefresh()}).catch(function(e){toast(e.message,1)})};
  if($('#sq-edit'))$('#sq-edit').onclick=function(){closeD();sqEdit(r.id)};
  if($('#sq-send'))$('#sq-send').onclick=function(){var b=this;busy(b,1);run('srSubmit',{id:r.id},'ส่งคำขอแล้ว').then(function(){busy(b,0)})};
  if($('#sq-cancel'))$('#sq-cancel').onclick=function(){ask({title:'ยกเลิกคำขอ '+r.no+'?',desc:'ยกเลิกแล้วส่งต่อไม่ได้ ต้องสร้างคำขอใหม่',tone:'warn',buttons:[{k:'no',label:'ไม่ยกเลิก'},{k:'yes',label:'ยกเลิกคำขอ',cls:'bad'}]}).then(function(k){if(k==='yes')run('srCancel',{id:r.id},'ยกเลิกแล้ว')})};
  if($('#sq-ok'))$('#sq-ok').onclick=function(){var b=this;busy(b,1);run('srDecide',{id:r.id,act:'ok'},'บันทึกแล้ว').then(function(){busy(b,0)})};
  if($('#sq-no'))$('#sq-no').onclick=function(){sqNoteAsk('ไม่อนุมัติ','เหตุผลที่ไม่อนุมัติ',function(v){run('srDecide',{id:r.id,act:'no',note:v},'แจ้งผู้ยื่นแล้ว')})};
  if($('#sq-back'))$('#sq-back').onclick=function(){sqNoteAsk('ส่งกลับแก้ไข','สิ่งที่ต้องแก้ไข',function(v){run('srDecide',{id:r.id,act:'back',note:v},'ส่งกลับให้ผู้ยื่นแล้ว')})};
  if($('#sq-act'))$('#sq-act').onclick=function(){sqAct(d)}}
/* ช่องใส่เหตุผล (ไม่อนุมัติ / ส่งกลับ) · ใช้ ask() เดิม + ช่องข้อความ */
function sqNoteAsk(title,lb,done){var w=document.createElement('div');w.className='ask-w sq-ask';w.innerHTML='<div class="ask" role="dialog" aria-label="'+esc(title)+'"><div class="ask-b"><h3>'+esc(title)+'</h3><label class="sq-l">'+esc(lb)+'<textarea id="sq-note" rows="3" maxlength="500"></textarea></label></div><div class="ask-f"><span class="sp"></span><button class="btn" data-x>ยกเลิก</button><button class="btn pri" data-y>'+esc(title)+'</button></div></div>';
  document.body.appendChild(w);var ta=w.querySelector('textarea');ta.focus();
  w.querySelector('[data-x]').onclick=function(){w.remove()};w.querySelector('[data-y]').onclick=function(){var v=ta.value.trim();if(!v){toast('ใส่'+lb,1);ta.focus();return}w.remove();done(v)}}
function sqRefresh(){aCall('srBoot').then(function(b){A.sqB=b;if($('#sq-tabs'))sqTabs()}).catch(function(){});if($('#sq-body'))sqLoad()}
function sqFileOpen(id,k){toast('กำลังเปิดไฟล์…');aCall('srFileGet',{id:id,k:k}).then(function(f){var a=document.createElement('a');a.href=f.data;a.download=f.name;document.body.appendChild(a);a.click();a.remove()}).catch(function(e){toast(e.message,1)})}
/* เปิดใช้งาน SIM ทีละจุด (ผู้รับผิดชอบ SIM · จอ 3.2) */
function sqAct(d){var r=d.r,cb=$('.drw .cb'),td=dIso(new Date());
  cb.innerHTML='<div class="sq-dh">'+sqB(r.st)+'<b>'+esc(r.proj_no)+' · '+esc(r.project)+'</b></div><p class="faint sq-ah">ใส่เบอร์ที่เปิดกับ dtac ทีละจุด · ยังไม่ได้เบอร์ = เว้นไว้ บันทึกบางจุดได้ · เบอร์ที่บันทึกแล้วจะเติมโปรเจกต์ เลขคำขอ และวันเริ่มให้ใน SIM Monitor</p>'+
   '<div class="sq-at">'+d.pts.map(function(p){var dn=!!p.msisdn;return '<div class="sq-ar'+(dn?' on':'')+'"><span class="sq-no">'+p.seq+'</span><span class="sq-ap"><b>'+esc(p.province)+'</b><small>'+esc([p.device,p.pkg||r.pkg].filter(Boolean).join(' · '))+'</small></span><span class="sq-ai">'+
    '<input data-sqam="'+p.seq+'" inputmode="tel" placeholder="เบอร์ 08x-xxx-xxxx" value="'+(dn?esc('0'+p.msisdn.slice(2)):'')+'"'+(dn?' disabled':'')+'><input data-sqai="'+p.seq+'" placeholder="ICCID" value="'+esc(p.iccid||'')+'"'+(dn?' disabled':'')+'><input type="date" data-sqad="'+p.seq+'" value="'+esc(p.act_date||td)+'"'+(dn?' disabled':'')+'></span></div>'}).join('')+'</div>';
  var fo=$('.drw .sq-cf');fo.style.display='';fo.innerHTML='<button class="btn" id="sq-ab">ย้อนกลับ</button><button class="btn pri" id="sq-as">บันทึกเปิดใช้งาน</button>';
  $('#sq-ab').onclick=function(){sqDet(d)};
  $('#sq-as').onclick=function(){var b=this,pts=d.pts.filter(function(p){return !p.msisdn}).map(function(p){return {seq:p.seq,msisdn:($('[data-sqam="'+p.seq+'"]')||{}).value||'',iccid:($('[data-sqai="'+p.seq+'"]')||{}).value||'',act_date:($('[data-sqad="'+p.seq+'"]')||{}).value||''}}).filter(function(x){return x.msisdn.trim()||x.iccid.trim()});
    if(!pts.length){toast('ยังไม่ใส่เบอร์ของจุดใด',1);return}
    busy(b,1);aCall('srActivate',{id:r.id,pts:pts}).then(function(x){toast('บันทึกเปิดใช้งาน '+pts.length+' จุดแล้ว');sqDet(x);sqRefresh()}).catch(function(e){busy(b,0);toast(e.message,1)})}}

/* ── ฟอร์มขอเบิก 4 ขั้น (เต็มหน้า · จอ 1.2–1.5) ── */
function sqEdit(id){A.sqEd={id:id||'',step:1,f:null};sqGo()}
function sqBlank(){var me=A.sqB.me;return {kind:'new',proj_mode:'new',proj_no:'',project:'',customer:'',proj_years:'',purpose:'',owner_id:me.id==='admin'?'':me.id,n_est:1,pkg:'',need_date:'',detail:'',ma_start:'',ma_end:'',ma_value:'',steps:[{r:'approve',i:''}],pts:[{province:'',device:'',pkg:'',need_date:'',note:''}],files:[],no:'',st:'draft'}}
function sqEdBoot(){var E=A.sqEd,root=$('#sq-root');
  Promise.all([A.sqB?Promise.resolve(A.sqB):aCall('srBoot'),sqPeople(),E.id&&!E.f?aCall('srGet',{id:E.id}):Promise.resolve(null)]).then(function(x){A.sqB=x[0];
    if(!E.f){if(x[2]){var r=x[2].r;E.f={kind:r.kind,proj_mode:r.proj_mode,proj_no:r.proj_no,project:r.project,customer:r.customer||'',proj_years:r.proj_years||'',purpose:r.purpose||'',owner_id:r.owner_id||'',n_est:r.n_est||x[2].pts.length,pkg:r.pkg||'',need_date:r.need||'',detail:r.detail||'',ma_start:r.ma_start||'',ma_end:r.ma_end||'',ma_value:r.ma_value==null?'':r.ma_value,steps:r.steps.map(function(s){return {r:s.r,i:s.i}}),pts:x[2].pts.map(function(p){return {province:p.province,device:p.device,pkg:p.pkg,need_date:p.need_date,note:p.note}}),files:r.files,no:r.no,st:r.st};E.pr=x[2].problems}else E.f=sqBlank()}
    sqEdDraw()}).catch(function(e){root.innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function sqEmpOpts(){return '<datalist id="sq-emps">'+(A.sqPP||[]).map(function(e){return '<option value="'+esc(sqEmpTxt(e))+'">'}).join('')+'</datalist>'}
function sqEmpBy(txt){txt=String(txt||'').trim();return (A.sqPP||[]).filter(function(e){return sqEmpTxt(e)===txt})[0]||null}
function sqEmpName(id){var e=(A.sqPP||[]).filter(function(x){return x.i===id})[0];return e?sqEmpTxt(e):''}
function sqEdDraw(){var E=A.sqEd,f=E.f,s=E.step,root=$('#sq-root');if(!root)return;
  var steps=['โปรเจกต์ + ประเภท','จุดติดตั้ง / เบอร์','MA + เอกสาร','ผู้อนุมัติ + ส่ง'];
  root.innerHTML='<div class="ph"><div><button class="btn sm" id="sq-x">‹ กลับรายการ</button><h1 class="sq-eh">ขอเบิก SIM</h1><div class="sub">'+sqB(f.st)+(f.no?' <b>'+esc(f.no)+'</b>':' ยังไม่บันทึก')+'</div></div></div>'+
   '<div class="sq-stp">'+steps.map(function(t,i){return '<button class="sq-st'+(i+1===s?' on':i+1<s?' done':'')+'" data-sqgo="'+(i+1)+'"><span>'+(i+1<s?ic('check'):i+1)+'</span>'+esc(t)+'</button>'}).join('')+'</div>'+
   '<section class="card sq-card" id="sq-form">'+[sqS1,sqS2,sqS3,sqS4][s-1]()+'</section>'+
   '<div class="sq-foot"><button class="btn" id="sq-prev"'+(s===1?' disabled':'')+'>‹ ย้อนกลับ</button><span class="sp"></span><button class="btn" id="sq-save">บันทึกร่าง</button>'+(s<4?'<button class="btn pri" id="sq-next">ถัดไป ›</button>':'<button class="btn pri" id="sq-submit">ส่งคำขอ</button>')+'</div>'+sqEmpOpts();
  [sqB1,sqB2,sqB3,sqB4][s-1]();
  $('#sq-x').onclick=function(){A.sqEd=null;sqGo()};
  $$('[data-sqgo]').forEach(function(b){b.onclick=function(){sqRead();E.step=+b.dataset.sqgo;sqEdDraw()}});
  $('#sq-prev').onclick=function(){sqRead();E.step=Math.max(1,s-1);sqEdDraw()};
  if($('#sq-next'))$('#sq-next').onclick=function(){sqRead();var m=sqStepErr(s);if(m){toast(m,1);return}if(s===3){var b=this;busy(b,1);sqSave().then(function(){E.step=4;sqEdDraw()}).catch(function(e){busy(b,0);toast(e.message,1)});return}E.step=s+1;sqEdDraw()};   /* เข้าขั้น 4 = บันทึกร่างก่อน เพื่อให้เห็นผลตรวจก่อนส่ง */
  $('#sq-save').onclick=function(){sqRead();sqSave().then(function(){toast('บันทึกร่างแล้ว');sqEdDraw()}).catch(function(e){toast(e.message,1)})};
  if($('#sq-submit'))$('#sq-submit').onclick=function(){var b=this;sqRead();busy(b,1);sqSave().then(function(){return aCall('srSubmit',{id:E.id})}).then(function(x){toast('ส่งคำขอ '+x.r.no+' แล้ว');A.sqEd=null;A.sqF=null;sqGo();setTimeout(function(){sqOpen(x.r.id)},300)}).catch(function(e){busy(b,0);toast(e.message,1);sqEdDraw()})}}
function sqStepErr(s){var f=A.sqEd.f;if(s===1){if(!f.proj_no)return 'ใส่เลขที่ Project';if(!f.project)return 'ใส่ชื่อโปรเจกต์'}if(s===2){if(!f.pts.length)return 'เพิ่มจุดติดตั้งอย่างน้อย 1 จุด';var i=f.pts.findIndex(function(p){return !p.province});if(i>=0)return 'จุดที่ '+(i+1)+' ยังไม่ใส่จังหวัด'}if(s===3&&!f.ma_end)return 'ใส่วันสิ้นสุด MA';return ''}
function sqSave(){var E=A.sqEd,f=E.f;return aCall('srSave',Object.assign({id:E.id||undefined},f,{files:undefined,no:undefined,st:undefined})).then(function(x){E.id=x.r.id;f.no=x.r.no;f.st=x.r.st;f.files=x.r.files;E.pr=x.problems;return x})}
function sqV(id){var e=$('#'+id);return e?e.value:''}
function sqRead(){var f=A.sqEd.f,s=A.sqEd.step;
  if(s===1){f.kind=sqV('sq-kind')||f.kind;f.proj_mode=($('input[name=sq-pm]:checked')||{}).value||f.proj_mode;f.proj_no=sqV('sq-pno').trim().toUpperCase();f.project=sqV('sq-pnm').trim();f.customer=sqV('sq-cus').trim();f.proj_years=sqV('sq-yrs').trim();f.purpose=sqV('sq-pur').trim();f.n_est=+sqV('sq-nest')||0;var o=sqEmpBy(sqV('sq-own'));f.owner_id=o?o.i:(sqV('sq-own').trim()?f.owner_id:'')}
  if(s===2){f.pkg=sqV('sq-pkg').trim();f.need_date=sqV('sq-need');f.pts=$$('[data-sqp]').map(function(tr){var g=function(k){return (tr.querySelector('[data-k='+k+']')||{}).value||''};return {province:g('province'),device:g('device').trim(),pkg:g('pkg').trim(),need_date:g('need_date'),note:g('note').trim()}})}
  if(s===3){f.detail=sqV('sq-dtl');f.ma_start=sqV('sq-mas');f.ma_end=sqV('sq-mae');f.ma_value=sqV('sq-mav')}
  if(s===4){var rv=sqEmpBy(sqV('sq-rev')),ap=$$('[data-sqap]').map(function(i){var e=sqEmpBy(i.value);return e?{r:'approve',i:e.i}:null}).filter(Boolean);f.steps=(rv?[{r:'review',i:rv.i}]:[]).concat(ap.length?ap:[]);if(!ap.length)f.steps.push({r:'approve',i:''})}}
function sqS1(){var f=A.sqEd.f,P=A.sqB.projects||[];
  return '<h3>โปรเจกต์</h3><p class="faint">ข้อมูลระดับโปรเจกต์กรอกครั้งเดียว ใช้กับทุกจุดในคำขอนี้</p>'+
   '<div class="sq-seg"><label><input type="radio" name="sq-pm" value="new"'+(f.proj_mode==='new'?' checked':'')+'>โปรเจกต์ใหม่</label><label><input type="radio" name="sq-pm" value="exist"'+(f.proj_mode==='exist'?' checked':'')+'>โปรเจกต์ที่มีอยู่ · '+P.length+'</label></div>'+
   (f.proj_mode==='exist'?'<label class="sq-l">เลือกโปรเจกต์<input id="sq-pick" list="sq-projs" placeholder="พิมพ์เลขที่หรือชื่อโปรเจกต์"><datalist id="sq-projs">'+P.map(function(p){return '<option value="'+esc(p.no+' · '+(p.name||''))+'">'}).join('')+'</datalist></label><div id="sq-pinfo" class="faint"></div>':'')+
   '<div class="sq-g2"><label class="sq-l">ประเภทคำขอ<select id="sq-kind">'+Object.keys(SQ_KIND).map(function(k){return '<option value="'+k+'"'+(f.kind===k?' selected':'')+'>'+esc(SQ_KIND[k])+'</option>'}).join('')+'</select></label><label class="sq-l">จำนวนจุดโดยประมาณ<input id="sq-nest" type="number" min="1" max="200" value="'+esc(f.n_est||'')+'"><small>ใช้สร้างแถวในขั้นถัดไป · แก้ได้</small></label>'+
   '<label class="sq-l"><span>เลขที่ Project <i>*</i></span><input id="sq-pno" value="'+esc(f.proj_no)+'" placeholder="เช่น PJ-2570-014"><small>'+(f.proj_mode==='new'?'ห้ามซ้ำกับโปรเจกต์ที่มีอยู่':'จากโปรเจกต์ที่เลือก')+'</small></label><label class="sq-l"><span>ชื่อโปรเจกต์ <i>*</i></span><input id="sq-pnm" value="'+esc(f.project)+'"></label>'+
   '<label class="sq-l">ลูกค้า<input id="sq-cus" value="'+esc(f.customer)+'"></label><label class="sq-l">ระยะโปรเจกต์ · ปี<input id="sq-yrs" value="'+esc(f.proj_years)+'" inputmode="numeric"></label>'+
   '<label class="sq-l">วัตถุประสงค์การใช้งาน<input id="sq-pur" list="sq-purs" value="'+esc(f.purpose)+'"><datalist id="sq-purs"><option value="ป้ายดิจิทัล"><option value="กล้องวงจรปิด"><option value="Router สาขา"><option value="เครื่อง POS"><option value="ใช้ภายในองค์กร"></datalist></label>'+
   '<label class="sq-l">ผู้รับผิดชอบโปรเจกต์<input id="sq-own" list="sq-emps" value="'+esc(sqEmpName(f.owner_id))+'" placeholder="ค้นชื่อพนักงาน"></label></div>'+
   '<div class="sq-me faint">ผู้ขอเบิก <b>'+esc(A.sqB.me.name)+'</b> · '+esc(A.sqB.me.dept||'')+' · วันที่ขอเบิก '+sqD(dIso(new Date()))+' · อัตโนมัติ</div>'}
function sqB1(){$$('input[name=sq-pm]').forEach(function(r){r.onchange=function(){sqRead();sqEdDraw()}});
  var pk=$('#sq-pick');if(pk)pk.onchange=function(){var no=this.value.split(' · ')[0].trim(),p=(A.sqB.projects||[]).filter(function(x){return x.no===no})[0];if(!p)return;var f=A.sqEd.f;
    sqRead();f.proj_no=p.no;f.project=p.name||f.project;if(p.customer)f.customer=p.customer;if(p.years)f.proj_years=p.years;if(p.owner_id)f.owner_id=p.owner_id;if(p.ma_end&&!f.ma_end)f.ma_end=p.ma_end;if(p.ma_start&&!f.ma_start)f.ma_start=p.ma_start;if(f.kind==='new')f.kind='add';
    sqEdDraw();var pi=$('#sq-pinfo');if(pi)pi.textContent='โปรเจกต์นี้ใช้อยู่ '+(p.n||0)+' เบอร์'+(p.ma_end?' · MA ถึง '+sqD(p.ma_end):'')+' · ตรวจก่อนขอเพิ่ม เพื่อกันขอซ้ำ'}}
function sqS2(){var f=A.sqEd.f,pk=(A.sqB.pkgs||[]);
  if(f.pts.length<f.n_est&&f.pts.every(function(p){return !p.province&&!p.device&&!p.note}))while(f.pts.length<Math.min(f.n_est,200))f.pts.push({province:'',device:'',pkg:'',need_date:'',note:''});
  var miss=f.pts.map(function(p,i){return p.province?0:i+1}).filter(Boolean);
  return '<h3>จุดติดตั้ง / เบอร์</h3><div class="sq-g2"><label class="sq-l">ทุกจุดใช้แพ็กเกจเดียวกัน<input id="sq-pkg" list="sq-pkgs" value="'+esc(f.pkg)+'" placeholder="เช่น M2M DataSim 399"><datalist id="sq-pkgs">'+pk.map(function(p){return '<option value="'+esc(p)+'">'}).join('')+'</datalist><small>ใส่แพ็กเกจรายจุดในตาราง = ใช้แทน</small></label><label class="sq-l">ต้องการใช้ทุกจุดวันที่<input id="sq-need" type="date" value="'+esc(f.need_date)+'"></label></div>'+
   '<div class="sq-tools"><button class="btn sm" id="sq-paste">วางจาก Excel</button><span class="faint">คอลัมน์: จังหวัด · อุปกรณ์ · แพ็กเกจ · วันที่ต้องการใช้ · หมายเหตุ</span></div>'+
   '<div class="sq-ptw"><table class="tbl sq-pe"><thead><tr><th>#</th><th>จังหวัด <i>*</i></th><th>อุปกรณ์</th><th>แพ็กเกจ</th><th>ต้องการใช้</th><th>หมายเหตุ</th><th></th></tr></thead><tbody>'+
   f.pts.map(function(p,i){return '<tr data-sqp="'+i+'"'+(p.province?'':' class="sq-miss"')+'><td>'+(i+1)+'</td><td><select data-k="province"><option value="">เลือกจังหวัด</option>'+SQ_PROV.map(function(v){return '<option'+(p.province===v?' selected':'')+'>'+v+'</option>'}).join('')+'</select></td><td><input data-k="device" value="'+esc(p.device)+'"></td><td><input data-k="pkg" list="sq-pkgs" value="'+esc(p.pkg)+'" placeholder="'+esc(f.pkg||'')+'"></td><td><input type="date" data-k="need_date" value="'+esc(p.need_date)+'"></td><td><input data-k="note" value="'+esc(p.note)+'"></td><td><button class="btn sm" data-sqdel="'+i+'" aria-label="ลบจุดที่ '+(i+1)+'">ลบ</button></td></tr>'}).join('')+'</tbody></table></div>'+
   '<div class="sq-tools"><button class="btn sm" id="sq-add">+ เพิ่มจุด</button><span class="sp"></span>'+(miss.length?'<span class="sq-warn">จุดที่ '+miss.slice(0,6).join(', ')+(miss.length>6?' …':'')+' ยังไม่ใส่จังหวัด</span>':'<span class="faint">'+f.pts.length+' จุด · '+new Set(f.pts.map(function(p){return p.province})).size+' จังหวัด</span>')+'</div>'}
function sqB2(){var f=A.sqEd.f;
  $('#sq-add').onclick=function(){sqRead();if(f.pts.length>=200){toast('ได้ไม่เกิน 200 จุด',1);return}f.pts.push({province:'',device:'',pkg:'',need_date:'',note:''});sqEdDraw()};
  $$('[data-sqdel]').forEach(function(b){b.onclick=function(){sqRead();f.pts.splice(+b.dataset.sqdel,1);sqEdDraw()}});
  $$('[data-sqp] select').forEach(function(sel){sel.onchange=function(){this.closest('tr').classList.toggle('sq-miss',!this.value);var ms=$$('[data-sqp] select').map(function(x,i){return x.value?0:i+1}).filter(Boolean),w=$('.sq-warn')||$('.sq-tools .faint:last-child');if(w){w.className=ms.length?'sq-warn':'faint';w.textContent=ms.length?'จุดที่ '+ms.slice(0,6).join(', ')+(ms.length>6?' …':'')+' ยังไม่ใส่จังหวัด':$$('[data-sqp]').length+' จุด'}}});
  $('#sq-paste').onclick=function(){var w=document.createElement('div');w.className='ask-w sq-ask';w.innerHTML='<div class="ask" role="dialog" aria-label="วางจาก Excel"><div class="ask-b"><h3>วางจาก Excel</h3><p>คัดลอกแถวจาก Excel มาวาง · 1 แถว = 1 จุด · คอลัมน์ จังหวัด อุปกรณ์ แพ็กเกจ วันที่ต้องการใช้ หมายเหตุ · แถวที่วางต่อท้ายจุดเดิม</p><textarea id="sq-ptx" rows="8"></textarea></div><div class="ask-f"><span class="sp"></span><button class="btn" data-x>ยกเลิก</button><button class="btn pri" data-y>เพิ่มจุด</button></div></div>';
    document.body.appendChild(w);w.querySelector('textarea').focus();w.querySelector('[data-x]').onclick=function(){w.remove()};
    w.querySelector('[data-y]').onclick=function(){sqRead();var rows=w.querySelector('textarea').value.split(/\r?\n/).map(function(l){return l.split('\t')}).filter(function(c){return c.join('').trim()}),bad=0;
      f.pts=f.pts.filter(function(p){return p.province||p.device||p.note||p.pkg});
      rows.forEach(function(c){var pv=String(c[0]||'').trim().replace(/^จ\.\s*|^จังหวัด/,'');if(/^(กรุงเทพ|กทม)/.test(pv))pv='กรุงเทพมหานคร';if(SQ_PROV.indexOf(pv)<0){bad++;pv=''}
        var nd=String(c[3]||'').trim(),m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(nd);if(m){var y=+m[3];if(y>2400)y-=543;nd=y+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2)}else if(!/^\d{4}-\d{2}-\d{2}$/.test(nd))nd='';
        if(f.pts.length<200)f.pts.push({province:pv,device:String(c[1]||'').trim(),pkg:String(c[2]||'').trim(),need_date:nd,note:String(c[4]||'').trim()})});
      w.remove();f.n_est=f.pts.length;sqEdDraw();toast('เพิ่ม '+rows.length+' จุด'+(bad?' · '+bad+' จุดชื่อจังหวัดไม่ตรง เลือกใหม่':''),bad?1:0)}}}
function sqS3(){var f=A.sqEd.f,E=A.sqEd;
  return '<h3>รายละเอียดเพิ่มเติม + เอกสาร</h3><label class="sq-l">รายละเอียดเพิ่มเติม<textarea id="sq-dtl" rows="3" maxlength="2000">'+esc(f.detail)+'</textarea></label>'+
   '<div class="sq-g2"><label class="sq-l">วันเริ่ม MA<input id="sq-mas" type="date" value="'+esc(f.ma_start)+'"></label><label class="sq-l"><span>วันสิ้นสุด MA <i>*</i></span><input id="sq-mae" type="date" value="'+esc(f.ma_end)+'"><small id="sq-mad">'+sqMaLen(f)+'</small></label>'+
   '<label class="sq-l">มูลค่า MA ต่อปี · บาท · ไม่บังคับ<input id="sq-mav" type="number" min="0" value="'+esc(f.ma_value)+'"></label><div></div></div>'+
   '<h4 class="sq-h4">เอกสาร</h4><label class="sq-drop"><input type="file" id="sq-file" accept="application/pdf,image/png,image/jpeg,image/webp,.xlsx,.docx" multiple hidden>'+ic('ul')+'<b>ลากไฟล์มาวาง หรือกดเลือกไฟล์</b><small>PDF รูป Excel Word · ใบสั่งซื้อ · สัญญา · แผนผังจุดติดตั้ง · ไฟล์ละไม่เกิน 10 MB · สูงสุด 8 ไฟล์</small></label>'+
   '<div class="sq-fs">'+(f.files||[]).map(function(x){return '<div class="sq-f">'+ic('dl')+'<span><b>'+esc(x.name)+'</b><small>'+sqKb(x.size)+'</small></span><button class="btn sm" data-sqfd="'+esc(x.k)+'">ลบ</button></div>'}).join('')+'</div>'+(E.id?'':'<p class="faint">แนบไฟล์แล้วระบบจะบันทึกร่างให้ก่อน</p>')}
function sqMaLen(f){if(!f.ma_start||!f.ma_end)return '';var a=new Date(f.ma_start),b=new Date(f.ma_end),m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth()+(b.getDate()>=a.getDate()?1:0);return m>0?m+' เดือน · คำนวณ':''}
function sqB3(){var f=A.sqEd.f,E=A.sqEd;
  ['sq-mas','sq-mae'].forEach(function(k){$('#'+k).onchange=function(){f.ma_start=sqV('sq-mas');f.ma_end=sqV('sq-mae');$('#sq-mad').textContent=sqMaLen(f)}});
  var up=function(files){sqRead();files=[].slice.call(files||[]);if(!files.length)return;var big=files.filter(function(x){return x.size>10485760});if(big.length){toast(big[0].name+' ใหญ่เกิน 10 MB',1);return}
    (E.id?Promise.resolve():sqSave()).then(function(){return files.reduce(function(p,file){return p.then(function(){return new Promise(function(ok,no){var rd=new FileReader();rd.onload=function(){aCall('srFileAdd',{id:E.id,name:file.name,data:rd.result}).then(ok).catch(no)};rd.onerror=function(){no(new Error('อ่านไฟล์ไม่ได้'))};rd.readAsDataURL(file)})}).then(function(x){f.files=x.r.files;f.no=x.r.no})},Promise.resolve())})
     .then(function(){toast('แนบไฟล์แล้ว');sqEdDraw()}).catch(function(e){toast(e.message,1);sqEdDraw()})};
  $('#sq-file').onchange=function(){up(this.files)};
  var dz=$('.sq-drop');dz.ondragover=function(e){e.preventDefault();dz.classList.add('on')};dz.ondragleave=function(){dz.classList.remove('on')};dz.ondrop=function(e){e.preventDefault();dz.classList.remove('on');up(e.dataTransfer.files)};
  $$('[data-sqfd]').forEach(function(b){b.onclick=function(){sqRead();aCall('srFileDel',{id:E.id,k:b.dataset.sqfd}).then(function(x){f.files=x.r.files;sqEdDraw()}).catch(function(e){toast(e.message,1)})}})}
function sqS4(){var f=A.sqEd.f,E=A.sqEd,rv=f.steps.filter(function(x){return x.r==='review'})[0],ap=f.steps.filter(function(x){return x.r==='approve'});if(!ap.length)ap=[{r:'approve',i:''}];
  var nP=new Set(f.pts.map(function(p){return p.province}).filter(Boolean)).size;
  return '<div class="sq-g2 sq-s4"><div><h3>ผู้ตรวจสอบ และผู้อนุมัติ</h3>'+
   '<label class="sq-l">ผู้ตรวจสอบ · ไม่บังคับ<input id="sq-rev" list="sq-emps" value="'+esc(rv?sqEmpName(rv.i):'')+'" placeholder="ค้นชื่อพนักงาน"></label>'+
   ap.map(function(x,i){return '<label class="sq-l"><span>ผู้อนุมัติขั้นที่ '+(i+1)+(i===0?' <i>*</i></span>':'')+'<span class="sq-ar2"><input data-sqap="'+i+'" list="sq-emps" value="'+esc(sqEmpName(x.i))+'" placeholder="ค้นชื่อพนักงาน">'+(i>0?'<button class="btn sm" data-sqapx="'+i+'">ลบขั้น</button>':'')+'</span></label>'}).join('')+
   (ap.length<3?'<button class="btn sm" id="sq-apadd">+ เพิ่มขั้นอนุมัติ</button>':'')+'<p class="faint">ผู้ตรวจสอบดูก่อน แล้วผู้อนุมัติทีละขั้นตามลำดับ · อนุมัติครบแล้วผู้รับผิดชอบ SIM เปิดใช้งาน</p></div>'+
   '<div><h3>ตรวจก่อนส่ง</h3><div class="sq-kv sq-kv1"><div><small>ประเภท</small><b>'+esc(SQ_KIND[f.kind])+'</b></div><div><small>โปรเจกต์</small><b>'+esc(f.proj_no||'—')+'</b><span>'+esc(f.project)+'</span></div><div><small>ลูกค้า</small><b>'+esc(f.customer||'—')+'</b><span>'+(f.proj_years?esc(f.proj_years)+' ปี':'')+'</span></div>'+
   '<div><small>จุดติดตั้ง</small><b>'+f.pts.length+' จุด · '+nP+' จังหวัด</b><span>'+(f.need_date?'ต้องการใช้ '+sqD(f.need_date):'')+'</span></div><div><small>แพ็กเกจ</small><b>'+esc(f.pkg||'ตามรายจุด')+'</b></div><div><small>MA</small><b>'+(f.ma_end?sqD(f.ma_start)+' – '+sqD(f.ma_end):'—')+'</b><span>'+sqMaLen(f)+'</span></div><div><small>เอกสาร</small><b>'+(f.files||[]).length+' ไฟล์</b></div></div>'+
   (E.pr&&E.pr.length?'<div class="alert sq-pr"><b>ตรวจข้อมูลก่อนส่ง</b>'+E.pr.map(function(p){return '<div>· '+esc(p)+'</div>'}).join('')+'<small>ส่งไม่ได้จนกว่าจะครบ · กดบันทึกร่างเพื่อตรวจใหม่</small></div>':E.id?'<div class="sq-okbox">'+ic('check')+' ข้อมูลครบ ส่งได้</div>':'<p class="faint">กดบันทึกร่างเพื่อตรวจข้อมูลก่อนส่ง</p>')+'</div></div>'}
function sqB4(){var f=A.sqEd.f;
  if($('#sq-apadd'))$('#sq-apadd').onclick=function(){sqRead();var ap=f.steps.filter(function(x){return x.r==='approve'});if(ap.length<3){f.steps.push({r:'approve',i:''});sqEdDraw()}};
  $$('[data-sqapx]').forEach(function(b){b.onclick=function(){sqRead();var k=+b.dataset.sqapx,n=-1;f.steps=f.steps.filter(function(x){if(x.r!=='approve')return true;n++;return n!==k});sqEdDraw()}})}
