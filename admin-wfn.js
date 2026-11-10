/* ── Workflow: กล่อง "ส่งแจ้งเตือน" + ค่าสรุปประจำเดือนในกล่องเริ่มเมื่อ (1 พ.ย. 2569 ผู้ใช้ขอ: รวม LINE รายคน / กลุ่ม / อีเมล เป็นกล่องเดียว · เลือกผู้รับ + เพิ่มคน + เพิ่มอีเมล + เงื่อนไข · หน้า Notification เหลือ Workflow หน้าเดียว)
 * หลังบ้าน app/gas/notify/WorkflowNotify.js · cfg = { ch:{line,group,mail}, to:[บทบาท], people:[id], groups:[], mails:[{email,label,on}], card, gcard, text, pdf, conds:[{field,op,value}] } */
var WFN_ROLE_L={approver:'ผู้อนุมัติขั้นปัจจุบัน',employee:'พนักงานที่ลา',hr:'HR ทุกคน',dept_head:'หัวหน้าแผนกของพนักงาน',requester:'ผู้ขอ (เจ้าของงาน)',assignee:'เมสเซนเจอร์ที่รับงาน',messengers:'เมสเซนเจอร์ทุกคน',organizers:'ผู้จัดงาน',top10:'พนักงานที่ติด Top 10 (การ์ดของใครของมัน)',leads:'หัวหน้าของพนักงาน (ไม่มี = HR)',dept_heads:'หัวหน้าแผนกทุกแผนก',execs:'ผู้บริหารทุกคน'};
var WFN_ROLES={leave:['approver','employee','hr','dept_head'],messenger:['requester','assignee','messengers','organizers','hr'],help_new:['hr'],monthsum:['top10','employee','leads','hr','dept_heads','execs']};
var WFN_MAIN=[['help_new','แจ้งเข้าระบบไม่ได้'],['leave','การลา'],['messenger','งานเมสเซนเจอร์'],['monthsum','สรุปประจำเดือน']];
function wfnBase(t){return /^leave/.test(t)?'leave':t}
WF_CARD.auto='ข้อความ/การ์ดเดิมของระบบ';
/* Workflow ของการแจ้งเตือนอื่น ๆ (10 พ.ย. 2569) · ช่องทาง "ในระบบ" = กระดิ่ง · ผู้รับ subject = ผู้รับตามเหตุการณ์ */
function wfnSimple(t){var T=((A.wfd||{}).trig||{})[t];return T&&T.simple?T:null}
function wfnRolesOf(t){var S=wfnSimple(t);return S?(S.group?['hr']:['subject','hr']):(WFN_ROLES[wfnBase(t)]||[])}
function wfnRoleL(r,t){if(r==='subject'){var S=wfnSimple(t);return 'ผู้รับตามเหตุการณ์'+(S?' ('+S.who+')':'')}return t==='monthsum'&&r==='employee'?'พนักงานเจ้าของคำชี้แจง':(WFN_ROLE_L[r]||r)}
function wfnDef(tr){var b=wfnBase(tr),d={ch:{line:true},to:['hr'],people:[],groups:[],mails:[],card:'text',text:'',conds:[]},S=wfnSimple(tr);
  if(S)return Object.assign(d,S.group?{ch:{group:true},to:[],groups:['hr']}:{ch:{app:true,line:true},to:['subject']},{card:'auto',gcard:'auto'});
  if(b==='leave'){d.to=['approver'];d.card='request'}else if(b==='messenger'){d.to=['requester'];d.card='msg_status'}else if(b==='monthsum')d.text='สรุปเดือน {ym} · {name}';else d.text='แจ้งเข้าระบบไม่ได้ {req_no} · รหัส {code} {name}';return d}
function wfnEmps(){return ((A.d&&A.d.employees)||[]).filter(function(e){return e.status!=='resigned'})}
function wfnEmpName(id){var e=((A.d&&A.d.employees)||[]).filter(function(x){return x.id===id})[0];return e?e.first_name+' '+e.last_name+(e.nickname?' ('+e.nickname+')':''):'(ไม่พบพนักงาน)'}
function wfnTitle(c,trig){var ch=c.ch||{},b=wfnBase(trig),who=[];
  if(ch.line||ch.mail||ch.app)who=(c.to||[]).map(function(r){return wfnRoleL(r,b).replace(/ \(.*\)$/,'')}).concat((c.people||[]).map(wfnEmpName));
  if(ch.group)who=who.concat((c.groups&&c.groups.length?c.groups:['hr']).map(wfGroupName));
  if(ch.mail)who=who.concat((c.mails||[]).filter(function(m){return m.on!==false}).map(function(m){return m.label||m.email}));
  var chs=[ch.app?'ในระบบ':'',ch.line?'LINE':'',ch.group?'กลุ่ม LINE':'',ch.mail?'อีเมล':''].filter(String);
  return ['ส่งถึง '+(who.length?who.slice(0,2).join(', ')+(who.length>2?' +'+(who.length-2):''):'…'),(chs.length?chs.join(' · '):'ยังไม่เลือกช่องทาง')+((c.conds||[]).length?' · มีเงื่อนไข':'')]}
function wfnIssues(n,c,add){var ch=c.ch||{};if(!ch.line&&!ch.group&&!ch.mail&&!ch.app){add(n.id,'ยังไม่ได้เลือกช่องทาง');return}
  var who=(c.to||[]).length+(c.people||[]).length;if((ch.line||ch.app)&&!who)add(n.id,'LINE: ยังไม่ได้เลือกผู้รับ');
  if(ch.mail&&!who&&!(c.mails||[]).some(function(m){return m.on!==false}))add(n.id,'อีเมล: ยังไม่มีผู้รับ');
  if(ch.group){var gs=(((A.cfg||{}).lineMsg||{}).groups||[]);(c.groups&&c.groups.length?c.groups:['hr']).forEach(function(g){if(g==='hr'){if(!sv('hr_line_group'))add(n.id,'ยังไม่ได้เลือกกลุ่ม HR (ตั้งค่า › LINE)')}else if(g==='msg'){if(!sv('msg_line_group'))add(n.id,'ยังไม่ได้เลือกกลุ่ม Messenger')}else if(!gs.some(function(x){return x.id===g&&!x.left_at}))add(n.id,'กลุ่มนี้ไม่มีแล้ว หรือบอทออกจากกลุ่ม')})}
  var needT=((ch.line||ch.app)&&c.card==='text')||(ch.group&&(c.gcard||'text')==='text');if(needT&&!String(c.text||'').trim())add(n.id,'ยังไม่ได้พิมพ์ข้อความ');
  (c.conds||[]).forEach(function(x,i){if(x.value===''||x.value==null)add(n.id,'เงื่อนไขที่ '+(i+1)+' ยังไม่ใส่ค่า')})}
function wfnCards(trig,br,to){var b=wfnBase(trig);if(wfnSimple(trig))return ['auto','text'];
  if(b==='monthsum')return to.indexOf('top10')>=0?['ms_emp']:br==='ready'||br==='remind'?['ms_ready','text']:br==='done'||br==='info'?['ms_ack','text']:['text'];   // top10 = การ์ดรายคนเสมอ (2 พ.ย. 2569: เดิมกลายเป็น text แล้วเตือนให้พิมพ์ข้อความ)
  if(b==='messenger')return {'new':['msg_job','msg_status','text'],cancel:['msg_status','msg_cancel','text'],late:['msg_status','msg_overdue','text']}[br]||['msg_status','msg_job','text'];
  if(b==='help_new')return ['text'];
  var dec=['ok','no','back'].indexOf(br)>=0||trig==='leave_decided',onlyEmp=to.length===1&&to[0]==='employee';
  return dec?(onlyEmp?['result','text']:['result','request','text']):onlyEmp?['receipt','text']:['request','text']}
function wfnGCards(trig,br){var b=wfnBase(trig);if(wfnSimple(trig))return ['auto','text'];if(b==='monthsum')return ['ms_ready','text'];if(b==='messenger')return {'new':['msg_job','text'],cancel:['msg_cancel','msg_status','text'],late:['msg_overdue','text']}[br]||['msg_status','text'];if(b==='help_new')return ['text'];return ['summary','text']}
function wfnFields(trig,br){var b=wfnBase(trig),dp=((A.d&&A.d.org&&A.d.org.departments)||[]).map(function(d){return [d.name,d.name]});
  var F=b==='monthsum'||wfnSimple(trig)?[]:wfFields(b==='leave'?(['ok','no','back'].indexOf(br)>=0?'leave_decided':'leave_new'):trig);return F.concat([['rdept','แผนกของผู้รับ','sel',dp]])}
function wfnInsp(n,c,trig){var b=wfnBase(trig),br=(b==='leave'||b==='messenger'||b==='monthsum')?wfBranch(n.id):'',ch=c.ch=c.ch||{},to=c.to=c.to||[];c.people=c.people||[];c.mails=c.mails||[];c.conds=c.conds||[];
  var opt=function(list,v){return list.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(v)===String(o[0])?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')};
  var cards=wfnCards(trig,br,to),gcards=wfnGCards(trig,br),fix=false;if(cards.indexOf(c.card)<0){c.card=cards[0];fix=true}if(gcards.indexOf(c.gcard)<0){c.gcard=gcards[0];fix=true}if(fix){WE.dirty=true;setTimeout(function(){wfDraw(true)},0)}
  var chip=function(k,l){return '<button type="button" class="wfn-ch'+(ch[k]?' on':'')+'" data-nch="'+k+'" aria-pressed="'+!!ch[k]+'">'+l+'</button>'};
  var S=wfnSimple(trig),h='<div class="f">ช่องทาง <small class="faint">เลือกได้หลายช่องพร้อมกัน</small><div class="wfn-chs">'+(S?chip('app',ic('bell')+'ในระบบ (กระดิ่ง)'):'')+chip('line',LINE_IC+'LINE รายคน')+chip('group',LINE_IC+'LINE กลุ่ม')+chip('mail',GMAIL_IC+'อีเมล')+'</div></div>';
  if(ch.line||ch.mail||ch.app){var em=wfnEmps().filter(function(e){return c.people.indexOf(e.id)<0}).sort(function(a,x){return String(a.emp_code)<String(x.emp_code)?-1:1});
    h+='<div class="f">ส่งถึง'+wfnRolesOf(trig).map(function(r){return '<label class="fl-c"><input type="checkbox" data-nto="'+r+'"'+(to.indexOf(r)>=0?' checked':'')+'><span>'+esc(wfnRoleL(r,b))+'</span></label>'}).join('')+'</div>'+
     '<div class="f">เพิ่มรายคน'+c.people.map(function(id,i){return '<div class="wfe-em"><span style="flex:1;min-width:0">'+esc(wfnEmpName(id))+'</span><button class="btn sm" data-npdel="'+i+'" aria-label="เอาออก">✕</button></div>'}).join('')+
     '<select id="wfn-padd"><option value="">+ เลือกพนักงาน…</option>'+em.map(function(e){return '<option value="'+esc(e.id)+'">'+esc((e.emp_code||'')+' '+e.first_name+' '+e.last_name+(e.nickname?' ('+e.nickname+')':''))+'</option>'}).join('')+'</select></div>'}
  if(ch.group){var gs=(((A.cfg||{}).lineMsg||{}).groups||[]).filter(function(g){return !g.left_at}),G=c.groups&&c.groups.length?c.groups:[b==='messenger'?'msg':'hr'];c.groups=G;
    var it=(b==='messenger'?[['msg','กลุ่ม Messenger (ตามตั้งค่า)']]:[]).concat([['hr','กลุ่ม HR (ตามตั้งค่า)']]).concat(gs.map(function(g){return [g.id,g.name||'(ไม่ทราบชื่อกลุ่ม)']}));
    h+='<div class="f">กลุ่ม LINE'+it.map(function(x){return '<label class="fl-c"><input type="checkbox" data-ngr="'+esc(x[0])+'"'+(G.indexOf(x[0])>=0?' checked':'')+'><span>'+esc(x[1])+'</span></label>'}).join('')+'</div>'}
  if(ch.mail)h+='<div class="f">อีเมลเพิ่ม <small class="faint">นอกจากอีเมลของผู้รับข้างบน</small>'+c.mails.map(function(m,i){return '<div class="wfe-em"><label class="fl-c" style="flex:1;min-width:0"><input type="checkbox" data-nmon="'+i+'"'+(m.on!==false?' checked':'')+'><span style="min-width:0"><b>'+esc(m.label||m.email)+'</b>'+(m.label?'<br><small class="faint">'+esc(m.email)+'</small>':'')+'</span></label><button class="btn sm" data-nmdel="'+i+'" aria-label="ลบ">✕</button></div>'}).join('')+
     '<div class="wfe-row wfe-er"><input id="wfn-em" placeholder="อีเมล" inputmode="email"><input id="wfn-el" placeholder="ชื่อ/ตำแหน่ง"></div><button class="btn sm" id="wfn-ea">+ เพิ่มอีเมล</button></div>'+
     (b==='monthsum'?'<label class="fl-c"><input type="checkbox" id="wfn-pdf"'+(c.pdf!==false?' checked':'')+'><span>แนบ PDF (A4 แนวนอน)</span></label><div class="faint" style="font-size:12px">เนื้อหาอีเมล = สรุป Top 10 ทั้งบริษัท (ฉบับเดียวกันทุกคน)</div>':'<div class="faint" style="font-size:12px">เนื้อหาอีเมล = ข้อความด้านล่าง</div>');
  if(ch.line||(S&&ch.app))h+='<label class="f">'+(S?'ข้อความ':'การ์ด LINE รายคน')+'<select data-c="card">'+opt(cards.map(function(k){return [k,WF_CARD[k]]}),c.card)+'</select></label>'+(b==='monthsum'&&to.indexOf('top10')>=0?'<div class="faint" style="font-size:12px">พนักงานที่ติด Top 10 ได้การ์ดสรุปของตัวเองเสมอ · คนที่ HR ตัดออกไม่ได้รับ</div>':'');
  if(ch.group)h+='<label class="f">การ์ดเข้ากลุ่ม<select data-c="gcard">'+opt(gcards.map(function(k){return [k,WF_CARD[k]]}),c.gcard)+'</select></label>';
  if(((ch.line||(S&&ch.app))&&c.card==='text')||(ch.group&&c.gcard==='text')||(ch.mail&&b!=='monthsum'&&(!S||c.card==='text'))){var V=S?['name','count','text']:b==='monthsum'?['ym','name','code','by','note']:b==='messenger'?['req_no','company','dates','type','name','by','note']:['name','type','days','dates','req_no','code','by','note'];
    h+='<label class="f">ข้อความ<textarea data-c="text" rows="3">'+esc(c.text||'')+'</textarea></label><div class="wfe-vars">'+V.map(function(v){return '<button class="btn sm" data-var="{'+v+'}">{'+v+'}</button>'}).join('')+'</div>'}
  var F=wfnFields(trig,br),fo=function(f){return f||['','','sel',[]]},fd=function(k){return fo(F.filter(function(f){return f[0]===k})[0])};
  h+='<div class="f">เงื่อนไข <small class="faint">ทุกข้อต้องตรง · แผนกของผู้รับ = กรองผู้รับ</small>'+c.conds.map(function(x,i){var f=fd(x.field);
    return '<div class="wfn-cond"><select data-ncf="'+i+'">'+opt(F.map(function(f){return [f[0],f[1]]}),x.field)+'</select><select data-nco="'+i+'">'+opt((f[2]==='num'?['gte','gt','eq','ne','lte','lt']:['eq','ne']).map(function(o){return [o,WF_OPN[o]]}),x.op||'eq')+'</select>'+
     (f[2]==='num'?'<input type="number" min="0" data-ncv="'+i+'" value="'+esc(x.value==null?'':x.value)+'">':'<select data-ncv="'+i+'">'+opt([['','— เลือก —']].concat(f[3]||[]),x.value)+'</select>')+'<button class="btn sm" data-ncdel="'+i+'" aria-label="ลบเงื่อนไข">✕</button></div>'}).join('')+'<button class="btn sm" id="wfn-cadd">+ เพิ่มเงื่อนไข</button></div>';
  return h+'<div class="f">ตัวอย่างที่จะส่ง<div class="wfe-pv" id="wfe-pv"><span class="spin"></span></div></div>'}
function wfnBind(n,c,upd){var re=function(){upd();wfInsp()};
  $$('#wfe-i [data-nch]').forEach(function(x){x.onclick=function(){var k=x.dataset.nch;c.ch[k]=!c.ch[k];re()}});
  $$('#wfe-i [data-nto]').forEach(function(x){x.onchange=function(){var r=x.dataset.nto,i=c.to.indexOf(r);if(x.checked&&i<0)c.to.push(r);if(!x.checked&&i>=0)c.to.splice(i,1);re()}});
  $$('#wfe-i [data-npdel]').forEach(function(x){x.onclick=function(){c.people.splice(+x.dataset.npdel,1);re()}});
  var pa=$('#wfn-padd');if(pa)pa.onchange=function(){if(pa.value&&c.people.indexOf(pa.value)<0)c.people.push(pa.value);re()};
  $$('#wfe-i [data-ngr]').forEach(function(x){x.onchange=function(){var g=x.dataset.ngr,i=c.groups.indexOf(g);if(x.checked&&i<0)c.groups.push(g);if(!x.checked&&i>=0)c.groups.splice(i,1);re()}});
  $$('#wfe-i [data-nmon]').forEach(function(x){x.onchange=function(){c.mails[+x.dataset.nmon].on=x.checked;re()}});
  $$('#wfe-i [data-nmdel]').forEach(function(x){x.onclick=function(){c.mails.splice(+x.dataset.nmdel,1);re()}});
  var ea=$('#wfn-ea');if(ea)ea.onclick=function(){var e=$('#wfn-em').value.trim().toLowerCase(),l=$('#wfn-el').value.trim().slice(0,60);if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){toast('รูปแบบอีเมลไม่ถูกต้อง',1);return}if(c.mails.some(function(m){return m.email===e})){toast('มีอีเมลนี้แล้ว',1);return}if(c.mails.length>=30){toast('ไม่เกิน 30 อีเมล',1);return}c.mails.push({email:e,label:l,on:true});re()};
  var pd=$('#wfn-pdf');if(pd)pd.onchange=function(){c.pdf=pd.checked;upd()};
  $$('#wfe-i [data-ncf]').forEach(function(x){x.onchange=function(){var k=c.conds[+x.dataset.ncf];k.field=x.value;k.value='';k.op='eq';re()}});
  $$('#wfe-i [data-nco]').forEach(function(x){x.onchange=function(){c.conds[+x.dataset.nco].op=x.value;upd()}});
  $$('#wfe-i [data-ncv]').forEach(function(x){x.oninput=x.onchange=function(){c.conds[+x.dataset.ncv].value=x.value;upd()}});
  $$('#wfe-i [data-ncdel]').forEach(function(x){x.onclick=function(){c.conds.splice(+x.dataset.ncdel,1);re()}});
  var ca=$('#wfn-cadd');if(ca)ca.onclick=function(){var F=wfnFields(wfTrig(),wfBranch(n.id));c.conds.push({field:F[F.length-1][0],op:'eq',value:''});re()}}

/* ── กล่อง "เริ่มเมื่อ" ของสรุปประจำเดือน: กำหนดการ / หมวด / ข้อความท้ายการ์ด / เส้นทางคำชี้แจง (เดิมอยู่แท็บสรุปประจำเดือน · บันทึกพร้อม flow ผ่าน msSaveCfg) ── */
function wfnMsTrig(){var c=A.wfMs;if(!c)return '<div class="loading"><span class="spin"></span>กำลังโหลดค่าสรุปประจำเดือน…</div>';
  var cats=String(c.cats).split(','),ck=function(k,l,s){return '<label class="fl-c"><input type="checkbox" data-msk="'+k+'"'+(c[k]==='on'?' checked':'')+'><span>'+l+(s?'<br><small class="faint">'+s+'</small>':'')+'</span></label>'};
  return '<div class="wfe-row3"><label class="f">วันที่<input type="number" min="1" max="28" data-msn="day" value="'+esc(c.day)+'"></label><label class="f">เวลา (ชม.)<input type="number" min="0" max="23" data-msn="hour" value="'+esc(c.hour)+'"></label><label class="f">ชี้แจงภายใน (วัน)<input type="number" min="1" max="30" data-msn="due" value="'+esc(c.due)+'"></label></div>'+
   '<div class="faint" style="font-size:12px">ทุกเดือน ระบบเตรียมรายชื่อของเดือนที่แล้ว ตามวันที่/เวลานี้</div>'+
   ck('review','HR ตรวจก่อนส่ง','ส่งเมื่อ HR กดอนุมัติที่ศูนย์อนุมัติ')+ck('remind','เตือน HR ถ้ายังไม่ส่ง','09:00 ทุกวัน สูงสุด 3 วัน (ทาง “ยังไม่ส่ง”)')+ck('auto','ส่งอัตโนมัติเมื่อไม่ต้องตรวจ','ใช้เมื่อปิด “HR ตรวจก่อนส่ง”')+
   '<div class="f">หมวด Top '+esc(c.topn)+'<label class="fl-c"><input type="checkbox" data-mscat="ab"'+(cats.indexOf('ab')>=0?' checked':'')+'><span>ขาดงาน</span></label><label class="fl-c"><input type="checkbox" data-mscat="lv"'+(cats.indexOf('lv')>=0?' checked':'')+'><span>ลา</span></label></div>'+
   '<label class="f">ข้อความท้ายการ์ด · ขาดงาน<textarea rows="2" data-mst="note_ab">'+esc(c.note_ab)+'</textarea></label><label class="f">ข้อความท้ายการ์ด · ลา<textarea rows="2" data-mst="note_lv">'+esc(c.note_lv)+'</textarea></label><div class="faint" style="font-size:12px">{due} = วันครบกำหนดชี้แจง</div>'+
   '<label class="f">คำชี้แจงให้ใครรับทราบ<select data-msr><option value="lead_hr"'+(c.route!=='hr'?' selected':'')+'>หัวหน้าทีม → HR</option><option value="hr"'+(c.route==='hr'?' selected':'')+'>HR อย่างเดียว</option></select></label>'+
   '<button class="btn sm" id="wfn-gal">ดูตัวอย่างทุกรูปแบบ</button>'}
function wfnMsBind(){var c=A.wfMs;if(!c)return;var d=function(){WE.dirty=true;WE.msDirty=true};
  $$('#wfe-i [data-msn]').forEach(function(x){x.oninput=function(){c[x.dataset.msn]=x.value.trim();d()}});
  $$('#wfe-i [data-msk]').forEach(function(x){x.onchange=function(){c[x.dataset.msk]=x.checked?'on':'off';d()}});
  $$('#wfe-i [data-mscat]').forEach(function(x){x.onchange=function(){var l=String(c.cats).split(',').filter(String),i=l.indexOf(x.dataset.mscat);if(x.checked&&i<0)l.push(x.dataset.mscat);if(!x.checked&&i>=0)l.splice(i,1);c.cats=l.join(',');d()}});
  $$('#wfe-i [data-mst]').forEach(function(x){x.oninput=function(){c[x.dataset.mst]=x.value;d()}});
  var r=$('#wfe-i [data-msr]');if(r)r.onchange=function(){c.route=r.value;d()};
  var g=$('#wfn-gal');if(g)g.onclick=msGal}
function wfnMsLoad(){if(A.wfMs)return;aCall('msGet','').then(function(r){A.wfMs=JSON.parse(JSON.stringify(r.cfg));if(WE&&WE.sel&&$('#wfe-i'))wfInsp()}).catch(function(e){toast(e.message,1)})}

/* ตัวอย่างอีเมลเต็มจอ (2 พ.ย. 2569 ผู้ใช้: "ตัวอย่างของ mail เล็กเกินไป กดเปิดขึ้นมาเลยได้ไหม มีปุ่มปิด") · ใช้หน้าต่างแบบเดียวกับ "ดูตัวอย่างทุกรูปแบบ" */
function wfnMailFull(html){var ov=document.createElement('div');ov.className='msg-ov';ov.style.zIndex=400;
  ov.innerHTML='<div class="msg-box" role="dialog" aria-modal="true" aria-label="ตัวอย่างอีเมล"><div class="msg-hd"><b>ตัวอย่างอีเมล</b><span class="faint" style="font-size:12.5px">หน้าตาเดียวกับที่ผู้รับเห็น · ข้อมูลจริงของรอบล่าสุด</span><span class="sp"></span><button class="btn sm" id="wfn-mx">ปิด</button></div><div class="msg-pv mail"><iframe title="ตัวอย่างอีเมล"></iframe></div></div>';
  document.body.appendChild(ov);ov.querySelector('iframe').srcdoc=html;
  var close=function(){ov.remove();document.removeEventListener('keydown',k)},k=function(e){if(e.key==='Escape'){e.stopPropagation();close()}};
  ov.querySelector('#wfn-mx').onclick=close;ov.onclick=function(e){if(e.target===ov)close()};document.addEventListener('keydown',k,true)}

/* คำอธิบาย flow สรุปประจำเดือน (แผงขวาตอนยังไม่เลือกกล่อง · 2 พ.ย. 2569 ผู้ใช้: "ยังงง flow สรุปรายเดือน") */
function wfnMsHelp(){var st=function(n,t,s){return '<li><b>'+t+'</b><div class="faint">'+s+'</div></li>'};
  return '<div class="wfn-help"><b>flow นี้ทำงานอย่างไร</b><ol>'+
   st(1,'เริ่มเมื่อ (กล่องสีส้ม)','ทุกเดือนตามวันที่/เวลาที่ตั้ง · กดกล่องนี้เพื่อตั้งวัน เวลา หมวด Top 10 ข้อความท้ายการ์ด')+
   st(2,'เตรียมรายชื่อ Top 10','ระบบคำนวณจากลงเวลาเดือนที่แล้วเอง')+
   st(3,'แจ้ง HR ในระบบ','รายการ “สรุปประจำเดือน · รอ HR อนุมัติส่ง” ขึ้นที่ ศูนย์อนุมัติ + ตัวเลขที่กระดิ่งและเมนูอนุมัติ (ไม่ส่ง LINE)')+
   st(4,'รอ HR อนุมัติ','HR เปิด ศูนย์อนุมัติ › รายการสรุปประจำเดือน ดูรายชื่อ + ผู้รับอีเมล ตัดคนที่ไม่ต้องส่ง แล้วกด “อนุมัติและส่ง” · ยังไม่อนุมัติ = เตือน HR 09:00')+
   st(5,'หลัง HR กดส่ง','กล่องอีเมล → ผู้บริหาร / หัวหน้าแผนก (สรุปทั้งบริษัท + PDF) · กล่อง LINE → พนักงานที่ติด Top 10 (การ์ดของใครของมัน + ปุ่มชี้แจง)')+
   st(6,'รอคำชี้แจง','พนักงานชี้แจงในแอป → หัวหน้ารับทราบในศูนย์อนุมัติ → HR รับทราบ → การ์ดผลถึงพนักงาน · ระหว่างทางแจ้งในระบบ (ศูนย์อนุมัติ + กระดิ่ง) ไม่ส่ง LINE')+'</ol>'+
   '<b>ต้องตั้งก่อนใช้จริง</b><ul><li>กล่อง <b>อีเมล</b> (ส่งถึง … อีเมล): ติ๊ก “ผู้บริหารทุกคน” / “หัวหน้าแผนกทุกแผนก” หรือเพิ่มอีเมลเอง · ตอนนี้ยังไม่มีใครได้อีเมล</li><li>กล่อง <b>เริ่มเมื่อ</b>: ตรวจวันที่/เวลา (ค่าเริ่มต้นวันที่ 1 เวลา 08:00)</li><li>กด “บันทึก” มุมขวาบน · ดูหน้าตาทุกข้อความได้ที่ปุ่ม “ดูตัวอย่างทุกรูปแบบ” ในกล่องเริ่มเมื่อ</li></ul></div>'}
