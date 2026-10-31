/* หลังบ้าน (admin.html) · ฟอร์มพนักงาน · ลิงก์เชิญ/คำขอ LINE · โครงสร้างองค์กร · เริ่มหน้า (boot) — ต้องโหลดเป็นไฟล์สุดท้าย
 * แยกจากสคริปต์ในหน้า admin.html 31 ต.ค. 2569 (ปรับโครงสร้างขั้น 5 · ย้ายทั้งก้อนตามลำดับเดิม ไม่แก้เนื้อ)
 * ทุกไฟล์ admin-*.js ใช้ชื่อร่วมกัน (global) และต้องโหลดตามลำดับใน admin.html */
'use strict';
/* ───────── ฟอร์ม ───────── */
var SECS=[['s1','ข้อมูลส่วนตัว',['emp_code','first_name','last_name','phone','email']],['s2','ตำแหน่งงาน',['department_id','start_date']],['s3','เวลาทำงานและการลงเวลา',['work_start','work_end','work_days','checkin_type','checkin_sites']],['s5','เงินเดือนและบัญชี',['bank_account']],['s6','สิทธิ์ในระบบ',['role']]];
function blank(){var c=A.d.employees.map(function(e){return +e.emp_code||0});var d0=A.d.org.departments.filter(function(d){return d.active!=='FALSE'})[0];
  return {emp_code:String(Math.max.apply(null,c.concat(0))+1).padStart(4,'0'),title:'นาย',first_name:'',last_name:'',nickname:'',phone:'',email:'',department_id:d0?d0.id:'',team_id:'',position_id:'',manager_id:'',end_date:'',start_date:new Date().toISOString().slice(0,10),
   employment_type:'daily',status:'probation',role:'employee',work_start:'08:30',work_end:'17:30',work_days:[1,2,3,4,5],checkin_type:'field',checkin_sites:[],humansoft_id:'',express_code:'',approval_flow:'',approver2_id:'',bank_name:'',bank_account:'',reason:''}}
function vForm(){
  var isNew=!A.id,e=isNew?null:emp(A.id);
  if(!A.f){A.f=isNew?blank():Object.assign({},e,{bank_name:PROF&&PROF.id===A.id?PROF.bank_name:'',bank_account:'',reason:''});}
  var f=A.f,er=A.err;
  var fld=function(k,label,inner,o){o=o||{};return '<label class="f'+(er[k]?' bad':'')+'"'+(o.full?' style="grid-column:1/-1"':'')+'><span>'+label+(o.req?' <b class="req">*</b>':'')+'</span>'+inner+(er[k]?'<span class="er">'+esc(er[k])+'</span>':o.h?'<span class="h">'+o.h+'</span>':'')+'</label>'};
  var inp=function(k,o){o=o||{};return '<input data-k="'+k+'" value="'+esc(f[k]||'')+'"'+(o.type?' type="'+o.type+'"':'')+(o.ph?' placeholder="'+o.ph+'"':'')+(o.ro?' readonly':'')+(o.im?' inputmode="'+o.im+'"':'')+'>'};
  var sel=function(k,opts){return '<select data-k="'+k+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(f[k])===String(o[0])?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select>'};
  var act=function(t){return A.d.org[t].filter(function(x){return x.active!=='FALSE'})};
  var qa=function(t){return isHR()?' <button type="button" class="qa" data-qa="'+t+'">+ เพิ่ม</button>':''};
  var teams=act('teams').filter(function(t){return t.department_id===f.department_id}),pos=act('positions').filter(function(p){return !p.department_id||p.department_id===f.department_id});
  // ผู้อนุมัติ: เลือกได้ทุกคนที่ยังทำงาน (หัวหน้า/ผู้จัดการขึ้นก่อน) · ไม่ขึ้นกับทีม
  var RK={exec:0,manager:1,hr:2,lead:3},leads=A.d.employees.filter(function(x){return x.status!=='resigned'&&x.id!==A.id}).sort(function(a,b){var x=RK[a.role]===undefined?9:RK[a.role],y=RK[b.role]===undefined?9:RK[b.role];return x-y||String(a.emp_code).localeCompare(String(b.emp_code))}),pn=function(x){return x.emp_code+' '+x.first_name+' '+x.last_name+' · '+(ROLE[x.role]||'')};
  var errN=Object.keys(er).length;
  return '<button class="back" id="bk">← '+(isNew?'กลับไปรายชื่อพนักงาน':'กลับไปโปรไฟล์')+'</button><div class="ph"><div><h1>'+(isNew?'เพิ่มพนักงาน':'แก้ไขข้อมูล · '+esc(e.first_name+' '+e.last_name))+'</h1><div class="sub">'+(isNew?'ช่องที่มี * ต้องกรอก · บันทึกแล้วส่งลิงก์เชื่อม LINE ได้ทันที':'ทุกการแก้ไขบันทึกใน Audit Log พร้อมเหตุผล')+'</div></div></div>'+
   (errN?'<div class="alert" role="alert">ยังบันทึกไม่ได้ · แก้ '+errN+' ช่องที่ขึ้นสีแดง</div>':'')+
   '<div class="fl"><nav class="toc">'+SECS.filter(function(x){return isHR()||(x[0]!=='s5'&&x[0]!=='s6')}).map(function(s){var bad=s[2].some(function(k){return er[k]});return '<a href="#'+s[0]+'" class="'+(bad?'err':'')+'">'+(bad?'! ':'')+s[1]+'</a>'}).join('')+'</nav><form id="ef" novalidate style="display:flex;flex-direction:column;gap:14px;min-width:0">'+
   '<section class="card" id="s1"><div class="ch"><h3>ข้อมูลส่วนตัว</h3></div><div class="cb g">'+fld('emp_code','รหัสพนักงาน',inp('emp_code',{im:'numeric',ro:!isNew}),{req:1,h:isNew?'ระบบเสนอเลขถัดไปให้ แก้ได้':'รหัสเปลี่ยนไม่ได้หลังสร้าง'})+fld('title','คำนำหน้า',sel('title',[['นาย','นาย'],['นาง','นาง'],['นางสาว','นางสาว']]))+
    fld('first_name','ชื่อ',inp('first_name'),{req:1})+fld('last_name','นามสกุล',inp('last_name'),{req:1})+fld('nickname','ชื่อเล่น',inp('nickname'))+fld('phone','มือถือ',inp('phone',{im:'tel',ph:'08xxxxxxxx'}),{h:'ใช้ยืนยันตัวตนตอนเชื่อม LINE (4 ตัวท้าย)'})+fld('email','อีเมลบริษัท',inp('email',{type:'email'}),{full:1})+'</div></section>'+
   '<section class="card" id="s2"><div class="ch"><h3>ตำแหน่งงาน</h3></div><div class="cb g">'+(isHR()&&(A.d.companies||[]).length>1?(function(){if(!f.company_id)f.company_id=coCur()||A.d.companies[0].id;return fld('company_id','บริษัท',sel('company_id',A.d.companies.map(function(c){return [c.id,c.short+' · '+c.name_th]})),{h:'ใช้แยกเอกสารเงินเดือน / ภาษีตามบริษัท'})})():'')+fld('department_id','แผนก'+qa('departments'),act('departments').length?sel('department_id',act('departments').map(function(d){return [d.id,d.name]})):'<button type="button" class="btn" data-qa="departments">+ เพิ่มแผนกแรก</button>',{req:1,h:act('departments').length?'':'ยังไม่มีแผนกในระบบ'})+fld('team_id','ทีม'+(f.department_id?qa('teams'):''),sel('team_id',[['','— ไม่ระบุ —']].concat(teams.map(function(t){return [t.id,t.name]}))))+
    fld('position_id','ตำแหน่ง'+qa('positions'),sel('position_id',[['','— ไม่ระบุ —']].concat(pos.map(function(p){return [p.id,p.name]}))),{})+fld('manager_id','ผู้อนุมัติการลา ขั้นที่ 1',sel('manager_id',[['','อัตโนมัติ: หัวหน้าทีม (ไม่มีทีม → HR)']].concat(leads.map(function(x){return [x.id,pn(x)]}))),{h:'เลือกได้ทุกคน ไม่ขึ้นกับทีม'})+fld('approver2_id','ผู้อนุมัติการลา ขั้นที่ 2',sel('approver2_id',[['','ค่าเริ่มต้นของระบบ ('+(A.d.flowDefault==='lead'||!A.d.flowDefault?'ไม่มี':'หัวหน้าแผนก')+')'],['none','ไม่มี (อนุมัติขั้นเดียว)'],['dept','หัวหน้าแผนก (อัตโนมัติ)']].concat(leads.map(function(x){return [x.id,pn(x)]}))),{h:'HR รับทราบ/อนุมัติต่อท้ายตามตั้งค่าระบบ'})+
    fld('start_date','วันเริ่มงาน',inp('start_date',{type:'date'}),{req:1})+fld('employment_type','ประเภทพนักงาน',sel('employment_type',[['monthly','รายเดือน'],['daily','รายวัน']]))+(isHR()?fld('status','สถานะ',sel('status',Object.keys(ST).map(function(k){return [k,ST[k][0]]})))+fld('end_date','วันที่ลาออก',inp('end_date',{type:'date'}),{h:'วันทำงานวันสุดท้าย · ใช้เมื่อสถานะ ลาออก'}):'')+'</div></section>'+
   '<section class="card" id="s3"><div class="ch"><h3>เวลาทำงานและการลงเวลา</h3></div><div class="cb" style="display:flex;flex-direction:column;gap:14px"><div class="g">'+fld('work_start','เวลาเข้างาน',inp('work_start',{type:'time'}),{req:1,h:'00:00 = เวลายืดหยุ่น ไม่นับสาย'})+fld('work_end','เวลาเลิกงาน',inp('work_end',{type:'time'}),{req:1})+'</div>'+
    '<div class="f'+(er.work_days?' bad':'')+'"><span>วันทำงาน <b class="req">*</b></span><div class="days" role="group" aria-label="วันทำงาน">'+[1,2,3,4,5,6,0].map(function(d){return '<button type="button" data-day="'+d+'" aria-pressed="'+(f.work_days.indexOf(d)>=0)+'">'+DOW[d]+'</button>'}).join('')+'</div>'+(er.work_days?'<span class="er">'+er.work_days+'</span>':'')+'</div>'+
    '<div class="f'+(er.checkin_type?' bad':'')+'"><span>ประเภทการลงเวลา <b class="req">*</b></span><div class="opts" role="radiogroup">'+Object.keys(CHK).map(function(k){return '<button type="button" class="opt" role="radio" data-chk="'+k+'" aria-pressed="'+(f.checkin_type===k)+'" aria-checked="'+(f.checkin_type===k)+'"><b>'+CHK[k][0]+'</b><span>'+CHK[k][1]+'</span></button>'}).join('')+'</div>'+(er.checkin_type?'<span class="er">'+er.checkin_type+'</span>':'')+'</div>'+
    (f.checkin_type==='office'||f.checkin_type==='both'?'<div class="f'+(er.checkin_sites?' bad':'')+'"><span>จุดลงเวลาที่อนุญาต <b class="req">*</b></span>'+act('gps_sites').map(function(s){return '<label style="display:flex;gap:8px;color:var(--fg)"><input type="checkbox" data-site="'+s.id+'"'+(f.checkin_sites.indexOf(s.id)>=0?' checked':'')+' style="width:auto">'+esc(s.name)+' <span class="faint">รัศมี '+esc(s.radius_m)+' ม.</span></label>'}).join('')+(er.checkin_sites?'<span class="er">'+er.checkin_sites+'</span>':'')+'</div>':'')+
    '<div class="g">'+fld('humansoft_id','รหัสสแกนนิ้ว HumanSoft',inp('humansoft_id',{im:'numeric'}))+'</div></div></section>'+
   (isHR()?'<section class="card" id="s5"><div class="ch"><h3>เงินเดือนและบัญชี</h3><span class="badge b-warn" style="margin-left:auto">เห็นเฉพาะ HR</span></div><div class="cb g">'+fld('bank_name','ธนาคาร',sel('bank_name',[['','— เลือก —'],['กสิกรไทย','กสิกรไทย'],['กรุงเทพ','กรุงเทพ'],['ไทยพาณิชย์','ไทยพาณิชย์'],['กรุงไทย','กรุงไทย'],['กรุงศรีอยุธยา','กรุงศรีอยุธยา'],['ทหารไทยธนชาต','ทหารไทยธนชาต']]))+
    fld('bank_account','เลขบัญชีธนาคาร',inp('bank_account',{im:'numeric',ph:isNew||!(PROF&&PROF.id===A.id&&PROF.bank_account_masked)?'xxx-x-xxxxx-x':'ปัจจุบัน '+PROF.bank_account_masked}),{h:isNew?'':'กรอกเมื่อต้องการเปลี่ยน · เว้นว่าง = ใช้เลขเดิม'})+'</div></section>'+
   '<section class="card" id="s6"><div class="ch"><h3>สิทธิ์ในระบบ</h3></div><div class="cb g">'+fld('role','บทบาท',sel('role',Object.keys(ROLE).filter(function(k){return k!=='admin'||A.d.me.role==='admin'||f.role==='admin'}).map(function(k){return [k,ROLE[k]]})),{h:'หัวหน้าทีม = อนุมัติคำขอของทีม · HR = เห็นและแก้ข้อมูลทุกคน · ผู้ดูแลระบบ = สิทธิ์ทั้งหมด (ไม่นับเป็นผู้อนุมัติขั้น HR)'})+'</div></section>':'')+
   '<div class="foot">'+(isNew?'':fld('reason','เหตุผลการแก้ไข (ไม่บังคับ)',inp('reason',{ph:'เช่น ปรับเวลาทำงานตามประกาศ 12/2569'})).replace('class="f','style="flex:1;min-width:220px" class="f'))+'<span class="sp"></span><button type="button" class="btn" id="cn">ยกเลิก</button><button class="btn pri" id="sv">'+(isNew?'บันทึกพนักงาน':'บันทึกการแก้ไข')+'</button></div></form></div>';
}
function bForm(){
  var f=A.f,y=function(){var s=scrollY;render();scrollTo(0,s)};
  $('#bk').onclick=$('#cn').onclick=function(){go(A.id?'profile':'list',A.id)};
  $$('[data-k]').forEach(function(el){el.addEventListener(el.tagName==='SELECT'?'change':'input',function(){f[el.dataset.k]=el.value;delete A.err[el.dataset.k];if(el.dataset.k==='department_id'){f.team_id='';f.position_id='';y()}})});
  /* เพิ่มแผนก/ทีม/ตำแหน่งจากฟอร์มพนักงานได้เลย (ไม่ต้องออกไปหน้าโครงสร้างองค์กร) */
  $$('[data-qa]').forEach(function(b){b.onclick=function(ev){ev.preventDefault();ev.stopPropagation();var t=b.dataset.qa,L={departments:'แผนก',teams:'ทีม',positions:'ตำแหน่ง'}[t];
    drawer('เพิ่ม'+L,'<label class="f"><span>ชื่อ'+L+' <b class="req">*</b></span><input id="qan" placeholder="'+(t==='departments'?'เช่น ฝ่ายบุคคล':t==='teams'?'เช่น ทีม LED A':'เช่น เจ้าหน้าที่ IT')+'"></label>'+(t==='departments'?'':'<div class="muted" style="font-size:13px">อยู่ในแผนก: '+esc(org('departments',f.department_id)||'— ไม่ระบุ —')+'</div>'),'<button class="btn pri" id="qaok">เพิ่ม'+L+'</button>');
    setTimeout(function(){var el=$('#qan');if(el)el.focus()},50);
    $('#qaok').onclick=function(){var n=$('#qan').value.trim();if(!n)return toast('กรอกชื่อ'+L,1);var k=this;busy(k,1);var item={name:n};if(t!=='departments')item.department_id=f.department_id||'';
      aCall('saveOrgItem',t,item).then(function(r){if(!r.ok){busy(k,0);return toast(r.errors.name||'บันทึกไม่ได้',1)}
        return reload(false).then(function(){closeD();f[{departments:'department_id',teams:'team_id',positions:'position_id'}[t]]=r.id;if(t==='departments'){f.team_id='';f.position_id=''}delete A.err.department_id;y();toast('เพิ่ม'+L+' “'+n+'” แล้ว')})}).catch(function(e){busy(k,0);toast(e.message,1)})}}});
  $$('[data-day]').forEach(function(b){b.onclick=function(){var d=+b.dataset.day;f.work_days=f.work_days.indexOf(d)>=0?f.work_days.filter(function(x){return x!==d}):f.work_days.concat(d);delete A.err.work_days;y()}});
  $$('[data-chk]').forEach(function(b){b.onclick=function(){f.checkin_type=b.dataset.chk;delete A.err.checkin_type;delete A.err.checkin_sites;y()}});
  $$('[data-site]').forEach(function(c){c.onchange=function(){var id=c.dataset.site;f.checkin_sites=c.checked?f.checkin_sites.concat(id):f.checkin_sites.filter(function(x){return x!==id})}});
  $('#ef').onsubmit=function(ev){ev.preventDefault();var b=$('#sv');busy(b,1);var data=Object.assign({},f);if(!A.id)delete data.id;else data.id=A.id;if(A.id&&!data.bank_account)delete data.bank_account
    aCall('saveEmployee',data).then(function(r){if(!r.ok){A.err=r.errors;render();var el=$('.f.bad');if(el)el.scrollIntoView({block:'center'});return}
      var isNew=!A.id;PROF=null;return reload(false).then(function(){toast(isNew?'เพิ่มพนักงานแล้ว':'บันทึกการแก้ไขแล้ว');go('profile',r.id);if(isNew)invite([r.id])})}).catch(function(e){busy(b,0);toast(e.message,1)})};
}

/* ───────── ลิงก์เชิญ LINE ───────── */
function drawer(title,body,foot){$('#ov').innerHTML='<div class="dbg" id="dbg"></div><aside class="drw" role="dialog" aria-label="'+esc(title)+'"><div class="ch"><h3>'+esc(title)+'</h3><span class="sp"></span><button class="btn sm" id="dx" aria-label="ปิด">✕</button></div><div class="cb">'+body+'</div>'+(foot?'<div class="ch" style="border-top:1px solid var(--line);border-bottom:0;justify-content:flex-end">'+foot+'</div>':'')+'</aside>';$('#dbg').onclick=$('#dx').onclick=closeD;mpBind($('#ov'))}
function closeD(){$('#ov').innerHTML=''}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeD()});
function invite(ids){
  drawer('ส่งลิงก์เชื่อม LINE','<div class="loading"><span class="spin"></span>กำลังสร้างลิงก์…</div>');
  aCall('createInvites',ids).then(function(list){
    var okL=list.filter(function(x){return x.url}),bad=list.filter(function(x){return x.error});
    var one=okL.length===1?okL[0]:null,qrSvg='';
    if(one&&window.qrcode){var q=qrcode(0,'M');q.addData(one.url);q.make();qrSvg=q.createSvgTag({cellSize:4,margin:0,scalable:true})}
    var body=(one?'<div style="display:flex;gap:16px;flex-wrap:wrap"><div class="qr">'+qrSvg+'</div><div style="flex:1;min-width:200px;font-size:13.5px">ให้พนักงานสแกน QR หรือเปิดลิงก์ใน LINE แล้ว<ol style="padding-left:18px"><li>กรอก <b>รหัสพนักงาน</b> + <b>เบอร์มือถือ 4 ตัวท้าย</b></li><li>ระบบผูกบัญชีให้ทันที แล้วเปิดแอปได้เลย</li></ol></div></div>':'')+
     okL.map(function(x){var e=emp(x.id);return '<div style="margin-top:12px"><div style="font-size:13px;margin-bottom:4px"><b>'+esc(e?e.first_name+' '+e.last_name:x.code)+'</b> <span class="faint num">'+esc(x.code)+'</span></div><div class="copy"><input readonly value="'+esc(x.url)+'" aria-label="ลิงก์เชิญ"><button class="btn sm" data-cp>คัดลอก</button></div></div>'}).join('')+
     (bad.length?'<div class="alert" style="margin-top:12px">ข้าม '+bad.length+' คน: '+bad.map(function(x){var e=emp(x.id);return esc((e?e.nickname:x.id)+' ('+x.error+')')}).join(', ')+'</div>':'')+
     (okL.length?'<p class="faint" style="font-size:12.5px">ลิงก์ใช้ได้ถึง '+esc(okL[0].expires_at.slice(0,10))+' ('+A.d.inviteDays+' วัน) · ใช้ได้ครั้งเดียว · กรอกผิด 5 ครั้งพัก 15 นาที · ลิงก์เก่าของคนเดียวกันถูกยกเลิกอัตโนมัติ</p>':'');
    drawer(one?'เชื่อม LINE · '+(emp(one.id)||{}).first_name:'ส่งลิงก์เชื่อม LINE · '+okL.length+' คน',body,'<button class="btn" id="dc">ปิด</button>');$('#dc').onclick=closeD;
    $$('[data-cp]').forEach(function(b){b.onclick=function(){var i=b.previousElementSibling;(navigator.clipboard?navigator.clipboard.writeText(i.value):Promise.reject()).then(function(){toast('คัดลอกลิงก์แล้ว')}).catch(function(){i.select();toast('เลือกข้อความแล้ว กด Ctrl+C')})}});
    A.sel=[];
  }).catch(function(e){closeD();toast(e.message,1)});
}
function unlink(id){var e=emp(id);
  drawer('ยกเลิกการเชื่อม LINE','<p>ยกเลิกการเชื่อม LINE ของ <b>'+esc(full(e))+'</b>?</p><ul style="font-size:13.5px"><li>พนักงานจะใช้แอปไม่ได้จนกว่าจะเชื่อมใหม่</li><li>ประวัติเดิมยังอยู่ครบ</li></ul><label class="f"><span>เหตุผล (บันทึกใน Audit Log) <b class="req">*</b></span><input id="ur" placeholder="เช่น พนักงานเปลี่ยนบัญชี LINE"></label><div id="ue" class="er" style="color:var(--bad);font-size:12px;margin-top:6px"></div>','<button class="btn" id="un">ไม่ยกเลิก</button><button class="btn bad" id="uy">ยกเลิกการเชื่อม</button>');
  $('#un').onclick=closeD;$('#uy').onclick=function(){var b=this;if(!$('#ur').value.trim()){$('#ue').textContent='กรอกเหตุผลก่อน';return}busy(b,1);aCall('unlinkLine',id,$('#ur').value).then(function(){PROF=null;return reload()}).then(function(){closeD();toast('ยกเลิกการเชื่อม LINE แล้ว')}).catch(function(e){busy(b,0);$('#ue').textContent=e.message})};
}

/* ───────── คำขอเชื่อม LINE ───────── */
function vReq(){var L=A.d.linkRequests;
  return '<div class="ph"><div><h1>คำขอเชื่อม LINE</h1><div class="sub">พนักงานที่ลงทะเบียนเองโดยไม่ผ่านลิงก์เชิญ · ตรวจว่าเป็นคนเดียวกันก่อนยืนยัน</div></div></div><section class="card">'+
   (L.length?'<div class="tw"><table style="min-width:640px"><thead><tr><th>พนักงาน</th><th>ชื่อบัญชี LINE</th><th>ส่งเมื่อ</th><th></th></tr></thead><tbody>'+L.map(function(r){return '<tr><td><b>'+esc(r.name)+'</b> <span class="faint num">'+esc(r.code)+'</span></td><td>'+esc(r.line_name)+'</td><td class="num">'+esc((r.at||'').slice(0,16).replace('T',' '))+'</td><td style="text-align:right;white-space:nowrap"><button class="btn sm" data-no="'+r.id+'">ไม่ใช่คนนี้</button> <button class="btn sm ok" data-yes="'+r.id+'">ยืนยัน</button></td></tr>'}).join('')+'</tbody></table></div>'
   :'<div class="loading">ไม่มีคำขอรอยืนยัน</div>')+'</section>'}
function bReq(){$$('[data-yes],[data-no]').forEach(function(b){b.onclick=function(){var ok=!!b.dataset.yes;busy(b,1);aCall('decideLink',b.dataset.yes||b.dataset.no,ok).then(function(){return reload()}).then(function(){toast(ok?'ยืนยันการเชื่อม LINE แล้ว':'ปฏิเสธคำขอแล้ว')}).catch(function(e){busy(b,0);toast(e.message,1)})}})}

/* ───────── โครงสร้างองค์กร ───────── */
var OT={departments:['แผนก',[['code','รหัส'],['name','ชื่อแผนก']]],teams:['ทีม',[['code','รหัส'],['name','ชื่อทีม'],['department_id','แผนก'],['min_staff','ขั้นต่ำคน/วัน'],['works_saturday','ทำงานวันเสาร์']]],positions:['ตำแหน่ง',[['name','ชื่อตำแหน่ง'],['department_id','แผนก']]],gps_sites:['จุดลงเวลา',[['name','ชื่อจุด'],['lat','ละติจูด'],['lng','ลองจิจูด'],['radius_m','รัศมี (ม.)']]]};
function vOrg(){var t=A.otab,def=OT[t],rows=A.d.org[t];
  var cell=function(r,k){return k==='department_id'?esc(org('departments',r[k])||'—'):k==='works_saturday'?(r[k]==='TRUE'?'✓':'—'):esc(r[k]||'—')};
  return '<div class="ph"><div><h1>โครงสร้างองค์กร</h1><div class="sub">ใช้ในฟอร์มพนักงาน · ปิดใช้งานแทนการลบ เพื่อไม่ให้ข้อมูลเดิมเสีย</div></div><span class="sp"></span><button class="btn pri" id="oa">+ เพิ่ม'+def[0]+'</button></div>'+
   '<div class="otab" role="tablist">'+Object.keys(OT).map(function(k){return '<button role="tab" data-ot="'+k+'" aria-selected="'+(k===t)+'">'+OT[k][0]+' <span class="faint">'+A.d.org[k].filter(function(x){return x.active!=='FALSE'}).length+'</span></button>'}).join('')+'</div>'+
   '<section class="card"><div class="tw"><table style="min-width:600px"><thead><tr>'+def[1].map(function(c){return '<th>'+c[1]+'</th>'}).join('')+(t==='teams'&&isHR()?'<th>แสดงในตารางงาน</th>':'')+'<th>สถานะ</th><th></th></tr></thead><tbody>'+
   rows.map(function(r){var tv=t==='teams'&&isHR()?orgTv(r):'';return '<tr>'+def[1].map(function(c){return '<td>'+cell(r,c[0])+'</td>'}).join('')+tv+'<td>'+(r.active==='FALSE'?'<span class="badge b-mute">ปิดใช้งาน</span>':'<span class="badge b-ok">ใช้งาน</span>')+'</td><td style="text-align:right;white-space:nowrap"><button class="btn sm" data-oe="'+r.id+'">แก้ไข</button> <button class="btn sm" data-oo="'+r.id+'">'+(r.active==='FALSE'?'เปิดใช้':'ปิดใช้')+'</button></td></tr>'}).join('')+'</tbody></table></div></section>'}
/* โครงสร้างองค์กร › ทีม: สวิตช์ "แสดงในตารางงาน" (ข้อมูลชุดเดียวกับ ตั้งค่าระบบ › ตารางงาน) */
function orgTv(r){if(!A.otv){if(!A.otvL){A.otvL=1;aCall('schedTeamsGet').then(function(d){A.otv=d;A.otvL=0;if(A.view==='org'&&A.otab==='teams')render()}).catch(function(){A.otvL=0})}return '<td class="faint">…</td>'}
  var dn=org('departments',r.department_id),g=A.otv.filter(function(x){return x.dept===dn})[0],tm=g&&g.teams.filter(function(x){return x.id===r.id})[0];
  if(!tm)return '<td class="faint">—</td>';var off=!tm.active;
  return '<td><label class="tsw" title="'+(off?'ทีมปิดใช้งาน ไม่แสดงในตารางงาน':'แสดง/ไม่แสดงในตารางงาน')+'"><input type="checkbox" data-otv="'+esc(r.id)+'"'+(tm.visible?' checked':'')+(off?' disabled':'')+' aria-label="แสดง '+esc(r.name)+' ในตารางงาน"><i></i></label> <span class="'+(tm.visible?'':'faint')+'" style="font-size:12.5px">'+(off?'—':tm.visible?'แสดง':'ไม่แสดง')+'</span></td>'}
function bOrg(){
  $$('[data-otv]').forEach(function(x){x.onchange=function(){var r=A.d.org.teams.filter(function(y){return y.id===x.dataset.otv})[0],dn=org('departments',r.department_id),g=A.otv.filter(function(y){return y.dept===dn})[0];
    var l=g.teams.filter(function(t){return t.visible&&t.name!==r.name}).map(function(t){return t.name});if(x.checked)l.push(r.name);x.disabled=true;var m={};m[dn]=l;
    aCall('saveSchedTeamVis',m).then(function(res){if(!res.ok)throw new Error(res.error);A.otv=null;render();toast((x.checked?'แสดง ':'ซ่อน ')+r.name+' ในตารางงานแล้ว')}).catch(function(e){x.disabled=false;x.checked=!x.checked;toast(e.message,1)})}});$$('[data-ot]').forEach(function(b){b.onclick=function(){A.otab=b.dataset.ot;fxArm('org');render()}});$('#oa').onclick=function(){orgForm(null)};
  $$('[data-oe]').forEach(function(b){b.onclick=function(){orgForm(A.d.org[A.otab].filter(function(r){return r.id===b.dataset.oe})[0])}});
  $$('[data-oo]').forEach(function(b){b.onclick=function(){var r=A.d.org[A.otab].filter(function(x){return x.id===b.dataset.oo})[0];busy(b,1);aCall('setOrgActive',A.otab,r.id,r.active==='FALSE').then(function(){A.otv=null;return reload()}).catch(function(e){busy(b,0);toast(e.message,1)})}})}
function orgForm(r){var t=A.otab,def=OT[t];r=r||{};
  var input=function(c){var k=c[0];if(k==='department_id')return '<select id="o_'+k+'"><option value="">— ไม่ระบุ —</option>'+A.d.org.departments.filter(function(d){return d.active!=='FALSE'}).map(function(d){return '<option value="'+d.id+'"'+(r[k]===d.id?' selected':'')+'>'+esc(d.name)+'</option>'}).join('')+'</select>';
    if(k==='works_saturday')return '<select id="o_'+k+'"><option value="FALSE">ไม่ทำงาน</option><option value="TRUE"'+(r[k]==='TRUE'?' selected':'')+'>ทำงาน</option></select>';return '<input id="o_'+k+'" value="'+esc(r[k]||'')+'"'+(/lat|lng|radius|min_staff/.test(k)?' inputmode="decimal"':'')+'>'};
  drawer((r.id?'แก้ไข':'เพิ่ม')+def[0],'<form id="of" style="display:flex;flex-direction:column;gap:12px">'+def[1].map(function(c){return '<label class="f" id="w_'+c[0]+'"><span>'+c[1]+'</span>'+input(c)+'<span class="er"></span></label>'}).join('')+(t==='gps_sites'?'<p class="faint" style="font-size:12.5px;margin:0">คัดลอกพิกัดจาก Google Maps (คลิกขวาที่จุด → ตัวเลขแรกคือละติจูด)</p>':'')+'</form>','<button class="btn" id="oc">ยกเลิก</button><button class="btn pri" id="os">บันทึก</button>');
  $('#oc').onclick=closeD;$('#os').onclick=function(){var b=this,item={id:r.id};def[1].forEach(function(c){item[c[0]]=$('#o_'+c[0]).value});busy(b,1);
    aCall('saveOrgItem',t,item).then(function(res){if(!res.ok){busy(b,0);$$('#of .f').forEach(function(w){w.classList.remove('bad');$('.er',w).textContent=''});Object.keys(res.errors).forEach(function(k){var w=$('#w_'+k);if(w){w.classList.add('bad');$('.er',w).textContent=res.errors[k]}});return}
      return reload().then(function(){closeD();toast('บันทึกแล้ว')})}).catch(function(e){busy(b,0);toast(e.message,1)})}}

// หน้าที่วาดหลังโหลดข้อมูล → เล่นภาพเปิดหลังวาดเสร็จ   (ย้ายมาจาก admin-dash.js 31 ต.ค. 2569: ต้องรันหลังทุกไฟล์ประกาศฟังก์ชันครบ เดิมเป็นสคริปต์เดียวจึงได้ hoisting)
bList=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(bList);
drawLv=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawLv);
drawRep=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawRep);
drawXd=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawXd);
drawAppr=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawAppr);
usDraw=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(usDraw);
drawAtt=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawAtt);
drawErr=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawErr);
drawSet=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(drawSet);
bOrg=(function(f){return function(){var r=f.apply(this,arguments);pgFx();return r}})(bOrg);
bNone=(function(f){return function(){var arm=A.fx===A.view||A.fx==='*',r=f.apply(this,arguments);pgFx();var fr=$('iframe.plf');if(fr&&arm)fr.addEventListener('load',function(){fxFrame(fr)},{once:true});return r}})(bNone);   // ตารางงาน / Confirmed (iframe) → กรอบเลื่อนขึ้น + ข้อมูลข้างในเล่นเมื่อวาดเสร็จ
boot();
