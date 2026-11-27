/* ตั้งค่า › บทบาทและสิทธิ์ · แผงสิทธิ์รวม (27 พ.ย. 2569 · Figma หน้า 71 จอ 1B · ผู้ใช้: "ทำแบบนี้ได้เลย ห้ามกระทบการใช้งาน")
 * อ่าน: permOverview (security/Access.js · อ่านอย่างเดียว) · ไม่เปลี่ยนกติกาเดิม
 * แท็บ ตามบทบาท: เช็กลิสต์ ดู + แก้ · ช่องที่มาจากตารางบทบาท (access_scopes) กดได้ → บันทึกด้วย saveAccessMatrix เดิม (ทั้งตาราง · ค่าขอบเขตเดิมคงไว้ถ้าไม่ได้กด)
 *   ติ๊กใหม่ = ขอบเขตตามบทบาท (พนักงาน ตัวเอง · หัวหน้าทีม ทีม · หัวหน้าแผนก แผนก · ผู้บริหาร ทั้งหมด) · ค่าที่ต่างจากนี้แสดงป้ายขอบเขตให้เปลี่ยนได้
 *   ช่องอื่นเป็นกติกาในโค้ด แสดงอย่างเดียว (ล็อก) · ช่องตามรายชื่อ กดแล้วไปแท็บ ตามเมนู
 * แท็บ ตามเมนู: รายชื่อพิเศษ 8 รายการ · บันทึกด้วยฟังก์ชันเดิมของแต่ละเมนู (เซิร์ฟเวอร์ตรวจสิทธิ์เดิม)
 * คลาสใหม่ขึ้นต้น prm- · ฟังก์ชันขึ้นต้น prm */
var PRM_R=[['employee','พนักงาน','ข้อมูลตัวเอง','#64748B'],['lead','หัวหน้าทีม','คนในทีม','#0EA5E9'],['manager','หัวหน้าแผนก','ทุกทีมในแผนก','#6366F1'],['exec','ผู้บริหาร','ทั้งบริษัท','#A855F7'],['hr','HR','ทั้งบริษัท','#EC4899'],['admin','ผู้ดูแลระบบ','ทั้งบริษัท','#141414']];
var PRM_OPT={emp:['self','team','dept','all'],att:['none','self','team','dept','all'],leave:['none','self','team','dept','all'],approve:['none','team','dept','all'],edit:['none','self','team','dept','all'],sched:['none','team','dept','all'],asset:['none','self','team','dept','all']};
var PRM_SC={none:'—',self:'ตัวเอง',team:'ทีม',dept:'แผนก',all:'ทั้งหมด'};
var PRM_DEF={employee:'self',lead:'team',manager:'dept',exec:'all'};
/* รายชื่อพิเศษ · who = ได้เสมอโดยไม่ต้องอยู่ในรายชื่อ · ed = ใครแก้ได้ (เซิร์ฟเวอร์ตรวจซ้ำ) · by = เก็บเป็นรหัสพนักงาน (c) หรือรหัสภายใน (i) */
var PRM_L={sim:{n:'SIM Monitor',ic:'dtac',d:'เห็นเมนู SIM Monitor · เป็นผู้รับผิดชอบ SIM เปิดใช้งานคำขอเบิก SIM',who:'ผู้ดูแลระบบเสมอ',ed:'admin',by:'c',src:'SIM Monitor › ซิงก์ข้อมูล'},
  sv:{n:'เคส Service',ic:'codex',d:'เห็นเมนูเคส Service · ลงตารางงานจากเคส',who:'ผู้ดูแลระบบเสมอ',ed:'hr',by:'c',src:'ตั้งค่า › ตารางงาน › เคส Service'},
  svrep:{n:'รายงาน Service',ic:'usage',d:'ดูรายงาน Service แบบผู้บริหาร',who:'ผู้ดูแลระบบเสมอ',ed:'hr',by:'c',src:'ตั้งค่า › ตารางงาน › เคส Service'},
  lm:{n:'ส่งประกาศ',ic:'mega',d:'ส่ง LINE ถึงพนักงาน แผนก และกลุ่ม · ดูประวัติการส่ง',who:'ผู้ดูแลระบบเสมอ',ed:'admin',by:'i',src:'ส่งประกาศ › ผู้มีสิทธิ์',max:30},
  pay:{n:'เงินเดือน',ic:'wallet',d:'งวดเงินเดือน สลิป PEAK · ข้อมูลอ่อนไหว',who:'บัญชีผู้ดูแลระบบเสมอ · HR ไม่ได้อัตโนมัติ',ed:'admin',by:'i',src:'ตั้งค่า › บทบาทและสิทธิ์ › เงินเดือน',max:30},
  map:{n:'แผนที่การลงเวลา',ic:'rep',d:'เห็นแผนที่ลงเวลาทั้งบริษัท',who:'ผู้ดูแลระบบ และผู้บริหารเสมอ',ed:'admin',by:'i',src:'รายงาน › แผนที่'},
  msgadm:{n:'ผู้จัดงานเมสเซนเจอร์',ic:'msgr',d:'มอบหมาย แก้ ยกเลิกงานเมสเซนเจอร์',who:'HR ผู้ดูแลระบบ ผู้บริหารเสมอ',ed:'hr',by:'i',src:'งานเมสเซนเจอร์ › ตั้งค่า'},
  msgstaff:{n:'เมสเซนเจอร์ · รับงาน',ic:'msgr',d:'รับงานส่งของ · ขึ้นในรายชื่อมอบหมาย',who:'ทุกคนที่ตำแหน่ง Messenger',ed:'hr',by:'i',src:'งานเมสเซนเจอร์ › ตั้งค่า'}};
/* แถว: ic = ไอคอนเมนูจริง (ic() ใน admin-core.js) · v/e = 6 บทบาท · m:เรื่อง = จากตารางบทบาท (กดได้) · L = ได้เสมอ · 0 = ไม่ได้ (ล็อก) · - = ไม่มีสิทธิ์นี้ · l:รายชื่อ */
var PRM_ROWS=[['ภาพรวม'],
  {n:'ภาพรวม Dashboard',ic:'dash',d:'ตัวเลขตามข้อมูลที่เห็น',v:'L L L L L L',e:'- - - - - -'},
  {n:'ชุมชน',ic:'chat',d:'แก้ = ดูแลโพสต์ ปักหมุด ลบโพสต์คนอื่น',v:'L L L L L L',e:'0 0 0 0 L L'},
  {n:'ศูนย์อนุมัติ · ใบลา',ic:'check',d:'แก้ = อนุมัติ · ผู้อนุมัติจริงมาจากผังองค์กร',v:'- - - - - -',e:'m:approve m:approve m:approve m:approve L L'},
  ['พนักงาน'],
  {n:'พนักงาน · การอบรม',ic:'emp',d:'แก้ = ข้อมูลส่วนตัว ตำแหน่ง เวลาทำงาน · เพิ่ม ลาออก เปลี่ยนบทบาท = HR',v:'m:emp m:emp m:emp m:emp L L',e:'m:edit m:edit m:edit m:edit L L'},
  {n:'ลงเวลา',ic:'clock',d:'แก้ = คำขอแก้เวลาแทนพนักงาน',v:'m:att m:att m:att m:att L L',e:'0 0 0 0 L L'},
  {n:'การลา',ic:'leave',d:'แก้ = แก้โควตาการลา · ยื่นลาของตัวเองได้ทุกคน',v:'m:leave m:leave m:leave m:leave L L',e:'0 0 0 0 L L'},
  {n:'ตารางงาน',ic:'cal',d:'ดู = ทุกคนเห็นทั้งหมด · แก้ = เพิ่ม แก้ ลบงาน',v:'L L L L L L',e:'m:sched m:sched m:sched m:sched L L'},
  {n:'Confirmed',ic:'box',d:'ยืนยันงานปิดโปรเจกต์',v:'0 0 L L L L',e:'- - - - - -'},
  {n:'งานเมสเซนเจอร์',ic:'msgr',d:'ดู = ขอใช้ + งานของตัวเอง · แก้ = จัดงาน มอบหมาย',v:'L L L L L L',e:'l:msgadm l:msgadm l:msgadm L L L'},
  {n:'เคส Service',ic:'codex',d:'เห็นเมนู · ลงตารางงานจากเคส',v:'l:sv l:sv l:sv l:sv l:sv L',e:'- - - - - -'},
  {n:'รายงาน Service',ic:'usage',d:'รายงานแบบผู้บริหาร',v:'l:svrep l:svrep l:svrep l:svrep l:svrep L',e:'- - - - - -'},
  {n:'LINE Photo Archive',ic:'gdrive',d:'แก้ = ตั้งค่าบอทเก็บรูป',v:'L L L L L L',e:'0 0 0 0 L L'},
  {n:'ทรัพย์สิน',ic:'box',d:'แก้ = อนุมัติ นำเข้า เปิดรอบตรวจสอบ',v:'m:asset m:asset m:asset m:asset L L',e:'0 0 0 0 L L'},
  {n:'SIM Monitor',ic:'dtac',d:'แก้ = เปิดใช้งานคำขอเบิก SIM · ข้อมูลเบอร์',v:'l:sim l:sim l:sim l:sim l:sim L',e:'l:sim l:sim l:sim l:sim l:sim L'},
  {n:'คำขอเบิก SIM',ic:'dtac',d:'ยื่นได้ทุกคน · อนุมัติ = คนที่ผู้ยื่นเลือก',v:'L L L L L L',e:'- - - - - -'},
  {n:'เงินเดือน',ic:'wallet',d:'งวดเงินเดือน สลิป PEAK · ต้องยืนยันรหัส',v:'l:pay l:pay l:pay l:pay l:pay L',e:'l:pay l:pay l:pay l:pay l:pay L'},
  ['องค์กรและระบบ'],
  {n:'โครงสร้างองค์กร',ic:'org',d:'แผนก ทีม ตำแหน่ง ลำดับอนุมัติ',v:'0 0 0 0 L L',e:'0 0 0 0 L L'},
  {n:'รายงาน',ic:'rep',d:'ตามข้อมูลที่เห็น',v:'0 0 L L L L',e:'- - - - - -'},
  {n:'แผนที่การลงเวลา',ic:'rep',d:'เห็นทั้งบริษัท',v:'l:map l:map l:map L l:map L',e:'- - - - - -'},
  {n:'ส่งประกาศ',ic:'mega',d:'ดู = ประวัติการส่ง · แก้ = ส่ง LINE',v:'l:lm l:lm l:lm l:lm l:lm L',e:'l:lm l:lm l:lm l:lm l:lm L'},
  {n:'กลุ่ม LINE',ic:'chat',d:'',v:'0 0 0 L L L',e:'0 0 0 0 L L'},
  {n:'ตั้งค่าระบบ · Audit Log · การใช้งาน',ic:'set',d:'ข้อมูลอ่อนไหว · HR และผู้ดูแลระบบเท่านั้น',v:'0 0 0 0 L L',e:'0 0 0 0 L L'},
  {n:'บันทึก error',ic:'bug',d:'',v:'0 0 0 L 0 L',e:'0 0 0 0 0 L'}];
var PRM_SECC={'ภาพรวม':'#64748B','พนักงาน':'#0EA5E9','องค์กรและระบบ':'#6366F1'};
function prmS(){return A.prmS||(A.prmS={tab:'role',f:'all',q:''})}
function prmLoad(){var el=$('#prm-root');if(!el)return;el.innerHTML=SK('rows','กำลังโหลด…');
  aCall('permOverview').then(function(d){A.prmX=d;A.prmM=JSON.parse(JSON.stringify(d.matrix));prmDraw()}).catch(function(e){if($('#prm-root'))$('#prm-root').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function prmList(k){return ((A.prmX&&A.prmX.lists)||[]).filter(function(x){return x.k===k})[0]||{people:[]}}
function prmDef(a,r){var o=PRM_OPT[a],d=PRM_DEF[r];if(o.indexOf(d)>=0)return d;return o.filter(function(x){return x!=='none'})[0]}
/* ค่าของช่อง · คืน {t:'m'|'L'|'0'|'-'|'l', on, sc, a, r, chg, k} */
function prmCell(spec,ri){var r=PRM_R[ri][0];if(spec.indexOf('m:')===0){var a=spec.slice(2),v=A.prmM[a][r],o=A.prmX.matrix[a][r];return {t:'m',a:a,r:r,on:v!=='none',sc:v,chg:v!==o,def:prmDef(a,r)}}
  if(spec.indexOf('l:')===0){var k=spec.slice(2);return {t:'l',k:k,n:prmList(k).people.length,unset:!!prmList(k).unset}}return {t:spec}}
function prmBox(c,kind){var col=kind==='v'?'prm-v':'prm-e';
  if(c.t==='-')return '<span class="prm-na" aria-label="ไม่มีสิทธิ์นี้"></span>';
  if(c.t==='L')return '<span class="prm-ck prm-lk" title="ได้เสมอ ปรับไม่ได้">'+PRM_CK+'</span>';
  if(c.t==='0')return '<span class="prm-ck prm-off" title="ไม่ได้ · กติกาในระบบ ปรับไม่ได้"></span>';
  if(c.t==='l')return '<button class="prm-lp" data-prml="'+c.k+'" title="ได้เฉพาะคนในรายชื่อ · กดเพื่อแก้รายชื่อ"><i></i>'+(c.unset?'กติกาเดิม':c.n+' คน')+'</button>';
  var tag=c.on&&c.sc!==c.def?'<select class="prm-sc'+(c.chg?' chg':'')+'" data-prmsc="'+c.a+'|'+c.r+'" aria-label="ขอบเขต">'+PRM_OPT[c.a].filter(function(x){return x!=='none'}).map(function(x){return '<option value="'+x+'"'+(x===c.sc?' selected':'')+'>'+PRM_SC[x]+'</option>'}).join('')+'</select>':'';
  return '<span class="prm-cw"><button class="prm-ck '+col+(c.on?' on':'')+(c.chg?' chg':'')+'" data-prmm="'+c.a+'|'+c.r+'" role="checkbox" aria-checked="'+c.on+'" aria-label="'+(kind==='v'?'ดู':'แก้')+'">'+(c.on?PRM_CK:'')+'</button>'+tag+'</span>'}
var PRM_CK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function prmChanges(){var d=A.prmX,out=[];Object.keys(d.matrix).forEach(function(a){Object.keys(d.matrix[a]).forEach(function(r){if(d.matrix[a][r]!==A.prmM[a][r])out.push({a:a,r:r,from:d.matrix[a][r],to:A.prmM[a][r]})})});return out}
var PRM_AN={emp:'พนักงาน › ดู',edit:'พนักงาน › แก้',att:'ลงเวลา › ดู',leave:'การลา › ดู',approve:'ศูนย์อนุมัติ › อนุมัติ',sched:'ตารางงาน › แก้',asset:'ทรัพย์สิน › ดู'};
function prmRoleN(r){return (A.prmX.roles||{})[r]||0}
function prmDraw(){var el=$('#prm-root');if(!el||!A.prmX)return;var S=prmS(),d=A.prmX;
  var tabs='<div class="prm-tabs" role="tablist">'+[['role','check','ตามบทบาท',''],['menu','dash','ตามเมนู',String(d.lists.length)]].map(function(t){return '<button role="tab" class="'+(S.tab===t[0]?'on':'')+'" data-prmt="'+t[0]+'" aria-selected="'+(S.tab===t[0])+'">'+ic(t[1])+t[2]+(t[3]?'<span class="prm-tn">'+t[3]+'</span>':'')+'</button>'}).join('')+'</div>';
  el.innerHTML='<div class="prm-top">'+tabs+'<span class="faint">ติ๊กว่าแต่ละบทบาท ดู หรือ แก้ เมนูไหนได้ · ขอบเขตข้อมูลตามบทบาท · เซิร์ฟเวอร์ตรวจซ้ำทุกคำสั่ง</span></div><div id="prm-body"></div>';
  $$('[data-prmt]').forEach(function(b){b.onclick=function(){S.tab=b.dataset.prmt;prmDraw()}});
  if(S.tab==='menu')prmMenu();else prmRole()}
function prmCount(ri){var v=0,e=0,n=0;PRM_ROWS.forEach(function(x){if(Array.isArray(x))return;n++;var cv=prmCell(x.v.split(' ')[ri],ri),ce=prmCell(x.e.split(' ')[ri],ri);if(cv.t==='L'||(cv.t==='m'&&cv.on))v++;if(ce.t==='L'||(ce.t==='m'&&ce.on))e++});return {v:v,e:e,n:n}}
function prmRole(){var S=prmS(),b=$('#prm-body'),ch=prmChanges();
  var sum='<section class="card prm-sum"><div class="prm-sh"><b>สรุปสิทธิ์ตามบทบาท</b><span class="sp"></span><span class="prm-lg"><i class="prm-bv"></i>ดูได้</span><span class="prm-lg"><i class="prm-be"></i>แก้ได้</span><span class="faint">นับเฉพาะที่ได้ทั้งบทบาท ไม่นับตามรายชื่อ</span></div><div class="prm-sr">'+
    PRM_R.map(function(r,i){var c=prmCount(i);return '<div class="prm-sc0"><span class="prm-rn"><i style="background:'+r[3]+'"></i>'+r[1]+'</span><b>'+prmRoleN(r[0])+'<small>คน</small></b><span class="faint">เห็น'+r[2]+'</span>'+
      '<span class="prm-bar"><span><i class="prm-bv" style="width:'+Math.round(c.v*100/c.n)+'%"></i></span><em>ดู <b class="prm-tv">'+c.v+'</b></em></span><span class="prm-bar"><span><i class="prm-be" style="width:'+Math.max(3,Math.round(c.e*100/c.n))+'%"></i></span><em>แก้ <b class="prm-te">'+c.e+'</b></em></span></div>'}).join('')+'</div></section>';
  var isOv=function(x){return x.n==='การลา'||x.n==='รายงาน'},rows=PRM_ROWS.filter(function(x){if(Array.isArray(x))return true;var q=S.q.trim();if(q&&x.n.indexOf(q)<0&&(x.d||'').indexOf(q)<0)return false;
    var cs=(x.v+' '+x.e).split(' ');if(S.f==='edit')return cs.some(function(c){return c.indexOf('m:')===0});if(S.f==='list')return cs.some(function(c){return c.indexOf('l:')===0});
    if(S.f==='chg')return cs.some(function(c,i){if(c.indexOf('m:')!==0)return false;var a=c.slice(2),r=PRM_R[i%6][0],df=(A.prmX.defaults[a]||{})[r];return A.prmX.matrix[a][r]!==A.prmM[a][r]||(df&&A.prmM[a][r]!==df)});return true});
  var nAll=PRM_ROWS.filter(function(x){return !Array.isArray(x)}).length,nEd=PRM_ROWS.filter(function(x){return !Array.isArray(x)&&(x.v+' '+x.e).indexOf('m:')>=0}).length,nL=PRM_ROWS.filter(function(x){return !Array.isArray(x)&&(x.v+' '+x.e).indexOf('l:')>=0}).length;
  var tool='<div class="prm-tool"><label class="prm-q">'+ic('search')+'<input id="prm-q" placeholder="ค้นหาเมนู หรือเรื่อง…" value="'+esc(S.q)+'"></label>'+[['all','ทั้งหมด',nAll],['edit','ปรับได้',nEd],['list','ตามรายชื่อ',nL],['chg','ต่างจากค่าเริ่มต้น','']].map(function(f){return '<button class="prm-fc'+(S.f===f[0]?' on':'')+'" data-prmf="'+f[0]+'">'+(f[0]==='list'?'<i class="prm-dl"></i>':f[0]==='chg'?'<i class="prm-da"></i>':'')+f[1]+(f[2]!==''?'<span>'+f[2]+'</span>':'')+'</button>'}).join('')+'</div>';
  var head='<thead><tr><th class="prm-mc">เมนู<small>ช่องสีเทา = ได้เสมอ · เส้นประ = ไม่ได้ (กติกาในระบบ) · ม่วง = ตามรายชื่อ</small></th>'+PRM_R.map(function(r){return '<th class="prm-rc"><span class="prm-rn"><i style="background:'+r[3]+'"></i>'+r[1]+'</span><span class="prm-ve"><em class="prm-tv">ดู</em><em class="prm-te">แก้</em></span></th>'}).join('')+'</tr></thead>';
  var body='<tbody>'+rows.map(function(x){if(Array.isArray(x)){var n=PRM_ROWS.slice(PRM_ROWS.indexOf(x)+1).findIndex(function(y){return Array.isArray(y)});n=n<0?PRM_ROWS.length-PRM_ROWS.indexOf(x)-1:n;return '<tr class="prm-sec"><td colspan="7"><i style="background:'+PRM_SECC[x[0]]+'"></i>'+x[0]+'<span>'+n+' เมนู</span></td></tr>'}
    var vs=x.v.split(' '),es=x.e.split(' '),anyChg=false,cells=PRM_R.map(function(r,i){var cv=prmCell(vs[i],i),ce=prmCell(es[i],i);if(cv.chg||ce.chg)anyChg=true;return '<td class="prm-rc"><span class="prm-pair">'+prmBox(cv,'v')+prmBox(ce,'e')+'</span></td>'}).join('');
    return '<tr class="'+(anyChg?'prm-chg':'')+'"><td class="prm-mc"><span class="prm-m"><span class="prm-ic">'+ic(x.ic)+'</span><span><b>'+esc(x.n)+(isOv(x)&&A.prmX.overrides.length?'<em class="prm-bo">ข้อยกเว้นรายคน · ดูด้านล่าง</em>':'')+'</b>'+(x.d?'<small>'+esc(x.d)+'</small>':'')+'</span></span></td>'+cells+'</tr>'}).join('')+'</tbody>';
  var bar=ch.length?'<div class="prm-save"><i></i><span><b>ยังไม่บันทึก '+ch.length+' ช่อง</b><small>'+ch.slice(0,3).map(function(c){var r=PRM_R.filter(function(x){return x[0]===c.r})[0];return PRM_AN[c.a]+' › '+r[1]+': '+PRM_SC[c.from]+' → '+PRM_SC[c.to]}).join(' · ')+(ch.length>3?' · …':'')+'</small></span><button class="btn" id="prm-rs">ยกเลิก</button><button class="btn pri" id="prm-sv">ตรวจก่อนบันทึก ›</button></div>':'';
  b.innerHTML=sum+tool+'<section class="card prm-card"><div class="prm-tw"><table class="prm-t">'+head+body+'</table></div></section>'+bar;
  $('#prm-q').oninput=function(){var p=this.selectionStart;S.q=this.value;prmRole();var q=$('#prm-q');q.focus();try{q.setSelectionRange(p,p)}catch(e){}};
  $$('[data-prmf]').forEach(function(x){x.onclick=function(){S.f=x.dataset.prmf;prmRole()}});
  $$('[data-prmm]').forEach(function(x){x.onclick=function(){var p=x.dataset.prmm.split('|'),a=p[0],r=p[1],v=A.prmM[a][r];
    if(v!=='none'){if(PRM_OPT[a].indexOf('none')<0){toast('ดูข้อมูลพนักงานปิดไม่ได้ · อย่างน้อยเห็นข้อมูลตัวเอง',1);return}A.prmM[a][r]='none'}else{var o=A.prmX.matrix[a][r];A.prmM[a][r]=o!=='none'?o:prmDef(a,r)}prmRole()}});
  $$('[data-prmsc]').forEach(function(x){x.onclick=function(e){e.stopPropagation()};x.onchange=function(){var p=x.dataset.prmsc.split('|');A.prmM[p[0]][p[1]]=x.value;prmRole()}});
  $$('[data-prml]').forEach(function(x){x.onclick=function(){prmEdit(x.dataset.prml)}});
  if($('#prm-rs'))$('#prm-rs').onclick=function(){A.prmM=JSON.parse(JSON.stringify(A.prmX.matrix));prmRole()};
  if($('#prm-sv'))$('#prm-sv').onclick=prmConfirm}
/* ตรวจก่อนบันทึก (Figma จอ 4) · บอกว่าใครได้/เสียอะไร · จำนวนคน = คนในบทบาทนั้น (ไม่รวมข้อยกเว้นรายคน) */
function prmConfirm(){var ch=prmChanges();if(!ch.length)return;
  ask({tone:'warn',title:'บันทึกการเปลี่ยนสิทธิ์ '+ch.length+' รายการ?',desc:'มีผลทันทีเมื่อคนนั้นโหลดหน้าใหม่ · บันทึกใน Audit Log · การลงเวลาไม่เกี่ยว',
    list:ch.map(function(c){var r=PRM_R.filter(function(x){return x[0]===c.r})[0];return [PRM_AN[c.a]+' › '+r[1]+' · '+prmRoleN(c.r)+' คน',PRM_SC[c.from],PRM_SC[c.to]]}),
    buttons:[{k:'no',label:'กลับไปแก้'},{k:'ok',label:'บันทึก '+ch.length+' รายการ',cls:'pri'}]}).then(function(k){if(k!=='ok')return;var btn=$('#prm-sv');busy(btn,1);
    aCall('saveAccessMatrix',A.prmM).then(function(r){A.prmX.matrix=r.matrix;A.prmM=JSON.parse(JSON.stringify(r.matrix));if(A.acx){A.acx.matrix=r.matrix;A.acm=JSON.parse(JSON.stringify(r.matrix))}toast('บันทึกสิทธิ์แล้ว · มีผลเมื่อผู้ใช้โหลดหน้าใหม่');prmRole()}).catch(function(e){busy(btn,0);toast(e.message,1)})})}
/* แท็บ ตามเมนู · รายชื่อพิเศษ */
function prmCan(k){var L=PRM_L[k];return L.ed==='admin'?!!A.prmX.admin:true}
function prmAv(p,s){var n=String(p.n||'?').split(' ');return av({id:p.i,first_name:n[0]||'?',last_name:n.slice(1).join(' ')},s||28)}
function prmMenu(){var b=$('#prm-body'),d=A.prmX;
  b.innerHTML='<div class="prm-note">'+ic('help')+'<span>สิทธิ์ที่ให้เป็นรายคน ไม่ได้ให้ตามบทบาท · แก้ที่นี่หรือที่หน้าเดิมของเมนูก็ได้ ค่าเป็นชุดเดียวกัน · ทุกการเปลี่ยนบันทึกใน Audit Log</span></div><div class="prm-grid">'+
   d.lists.map(function(x){var L=PRM_L[x.k];if(!L)return '';var P=x.people,can=prmCan(x.k);
    return '<section class="card prm-lc"><div class="prm-lh"><span class="prm-ic">'+ic(L.ic)+'</span><b>'+esc(L.n)+'</b><span class="prm-cnt">'+(x.unset?'กติกาเดิม':P.length+' คน')+'</span></div><p>'+esc(L.d)+'</p>'+
     (P.length?'<div class="prm-avs">'+P.slice(0,6).map(function(p){return prmAv(p,28)}).join('')+(P.length>6?'<span class="prm-more">+'+(P.length-6)+'</span>':'')+'</div><div class="prm-nm">'+esc(P.slice(0,3).map(function(p){return p.n}).join(' · '))+(P.length>3?' · และอีก '+(P.length-3)+' คน':'')+'</div>':'<div class="prm-nm faint">'+(x.unset?'ยังไม่ได้เลือก · ใช้กติกาเดิม: HR และคนที่จัดตารางงานได้':'ยังไม่มีใครในรายชื่อ')+'</div>')+
     '<div class="prm-who">'+esc(L.who)+'</div><div class="prm-lf"><small>ตั้งได้ที่ '+esc(L.src)+' ด้วย</small>'+(can?'<button class="btn sm'+(x.k==='sim'?' pri':'')+'" data-prme="'+x.k+'">แก้รายชื่อ</button>':'<span class="faint prm-ro">'+ic('set')+'แก้ได้เฉพาะผู้ดูแลระบบ</span>')+'</div></section>'}).join('')+'</div>';
  $$('[data-prme]').forEach(function(x){x.onclick=function(){prmEdit(x.dataset.prme)}})}
function prmEdit(k){var L=PRM_L[k],x=prmList(k);if(!prmCan(k)){toast('รายชื่อนี้แก้ได้เฉพาะผู้ดูแลระบบ',1);return}
  var sel=x.people.map(function(p){return p.i}),E={};A.prmX.emps.forEach(function(e){E[e.i]=e});
  var txt=function(e){return e.n+' · '+e.c+(e.p?' · '+e.p:'')};
  drawer('รายชื่อ '+L.n,'<p class="faint prm-dd">'+esc(L.d)+'</p><label class="prm-pick">'+ic('search')+'<input id="prm-in" list="prm-emps" placeholder="ค้นชื่อ ชื่อเล่น รหัส หรือตำแหน่ง แล้วกด Enter"></label><datalist id="prm-emps">'+A.prmX.emps.map(function(e){return '<option value="'+esc(txt(e))+'">'}).join('')+'</datalist><div id="prm-sel"></div>'+
    '<div class="prm-tip"><b>'+esc(L.who)+'</b><span>ไม่ต้องใส่ในรายชื่อ · เอาคนออก = เมนูหรือปุ่มนั้นหายเมื่อคนนั้นโหลดหน้าใหม่</span></div>'+(k==='sv'?'<div class="prm-tip prm-warn"><b>รายชื่อว่าง = เฉพาะผู้ดูแลระบบ</b><span>ถ้าบันทึกโดยไม่มีใครในรายชื่อ คนอื่นจะไม่เห็นเมนูเคส Service</span></div>':'')+'<div id="prm-chg"></div>',
    '<button class="btn" id="prm-x">ยกเลิก</button><button class="btn pri" id="prm-ok">บันทึกรายชื่อ</button>');
  var orig=sel.slice(),draw=function(){$('#prm-sel').innerHTML='<div class="prm-sh2">ที่เลือกไว้ '+sel.length+' คน</div>'+(sel.length?sel.map(function(id){var e=E[id]||{i:id,n:'(ไม่พบ)',c:''};return '<div class="prm-pr">'+prmAv(e,34)+'<span><b>'+esc(e.n)+'</b><small>'+esc([e.c,e.p,e.d].filter(Boolean).join(' · '))+'</small></span><button class="prm-rm" data-prmrm="'+esc(id)+'">เอาออก</button></div>'}).join(''):'<div class="faint">ยังไม่มีใคร</div>');
    var add=sel.filter(function(i){return orig.indexOf(i)<0}),rm=orig.filter(function(i){return sel.indexOf(i)<0});
    $('#prm-chg').innerHTML=add.length||rm.length?'<div class="prm-tip prm-warn"><b>ยังไม่บันทึก</b><span>'+add.map(function(i){return 'เพิ่ม '+esc((E[i]||{}).n||i)}).concat(rm.map(function(i){return 'เอาออก '+esc((E[i]||{}).n||i)})).join(' · ')+'</span></div>':'';
    $$('[data-prmrm]').forEach(function(b){b.onclick=function(){sel=sel.filter(function(i){return i!==b.dataset.prmrm});draw()}})};
  draw();
  var inp=$('#prm-in'),pick=function(){var v=inp.value.trim(),e=A.prmX.emps.filter(function(y){return txt(y)===v})[0];if(!e)return;if(k==='map'&&(e.r==='admin'||e.r==='exec')){toast('ผู้ดูแลระบบและผู้บริหารเห็นแผนที่อยู่แล้ว',1);inp.value='';return}
    if(sel.indexOf(e.i)<0)sel.push(e.i);if(L.max&&sel.length>L.max){sel.pop();toast('ใส่ได้ไม่เกิน '+L.max+' คน',1)}inp.value='';draw()};
  inp.onchange=pick;inp.onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();pick()}};
  $('#prm-x').onclick=closeD;
  $('#prm-ok').onclick=function(){var btn=this,codes=sel.map(function(i){return (E[i]||{}).c}).filter(Boolean),call;
    if(k==='sim')call=aCall('simAccessSave',codes);else if(k==='sv')call=aCall('svAccessSave',codes);else if(k==='svrep')call=aCall('saveSettings',{sv_rep_access:codes.join(',')});
    else if(k==='lm')call=aCall('lmAccessSave',sel);else if(k==='pay')call=aCall('payAccessSave',sel);else if(k==='map')call=aCall('saveMapAccess',sel);
    else if(k==='msgadm')call=aCall('saveSettings',{msg_admins:sel.join(',')});else if(k==='msgstaff')call=aCall('saveSettings',{msg_staff:sel.join(',')});
    busy(btn,1);call.then(function(){closeD();toast('บันทึกรายชื่อ '+L.n+' แล้ว');return aCall('permOverview')}).then(function(d){if(d){A.prmX.lists=d.lists;prmDraw()}}).catch(function(e){busy(btn,0);toast(e.message,1)})}}
