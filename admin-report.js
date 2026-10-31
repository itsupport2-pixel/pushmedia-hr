/* หลังบ้าน (admin.html) · ลงเวลาวันนี้ · ตัวเลือกช่วงวัน · รายงาน · แผนที่ · บันทึก error
 * แยกจากสคริปต์ในหน้า admin.html 31 ต.ค. 2569 (ปรับโครงสร้างขั้น 5 · ย้ายทั้งก้อนตามลำดับเดิม ไม่แก้เนื้อ)
 * ทุกไฟล์ admin-*.js ใช้ชื่อร่วมกัน (global) และต้องโหลดตามลำดับใน admin.html */
'use strict';
/* ───────── ลงเวลาวันนี้ (Phase 2b) ───────── */
var AST={ok:['ปกติ','b-ok'],late:['มาสาย','b-warn'],not_yet:['ยังไม่ลงเวลา','b-bad'],working:['กำลังทำงาน','b-info'],missing_out:['ไม่มีลงเวลาออก','b-warn'],missing_in:['ไม่มีลงเวลาเข้า','b-warn'],leave:['ลา','b-info'],leave_wait:['ลา (รออนุมัติ)','b-warn'],holiday:['วันหยุด','b-mute'],off:['วันหยุด','b-mute'],absent:['ขาดงาน','b-bad']};
function vAtt(){var t=dIso(new Date()),d=A.attDate&&A.attDate<=t?A.attDate:t;A.attDate=d;return '<div class="ph"><div><h1 id="att-h">'+(d===t?'ลงเวลาวันนี้':'ลงเวลา '+esc(dTxt(d,1)))+'</h1><div class="sub" id="att-sub">กำลังโหลด…</div></div><span class="sp"></span>'+
  '<div class="att-dt"><button class="btn" id="att-prev" aria-label="วันก่อนหน้า">‹</button><input type="date" id="att-date" class="amp-in" value="'+d+'" max="'+t+'" aria-label="เลือกวันที่"><button class="btn" id="att-next" aria-label="วันถัดไป"'+(d>=t?' disabled':'')+'>›</button>'+(d!==t?'<button class="btn" id="att-today">วันนี้</button>':'')+'</div>'+
  ofSel('att')+(isHR()?'<button class="btn" id="att-fix" title="แก้เวลา ลงเวลาแทน หรือยกเลิกรายการที่ผิด · ย้อนหลังได้">แก้เวลา / ลงแทน</button>':'')+'<button class="btn" id="att-re">รีเฟรช</button></div><div id="att-body"><div class="loading"><span class="spin"></span></div></div>'}
function bAtt(){
  var load=function(){aCall('attendanceToday',A.attDate).then(function(d){A.att=d;drawAtt()}).catch(function(e){if($('#att-body'))$('#att-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  ofBind('att',drawAtt);$('#att-re').onclick=function(){fxArm('att');load()};A.attLoad=load;if($('#att-fix'))$('#att-fix').onclick=function(){openFix('',A.att?A.att.date:'')};
  /* เลือกวันที่ดูเวลา (28 ต.ค. 2569 ผู้ใช้ขอ) · ดูเป็นวันปกติ ไม่ขึ้นกับรอบสรุป 23:30 */
  var setD=function(v){var t=dIso(new Date());if(!v||v>t)v=t;if(v===A.attDate)return;A.attDate=v;render()};
  $('#att-date').onchange=function(){setD(this.value)};$('#att-prev').onclick=function(){var x=dObj(A.attDate);x.setDate(x.getDate()-1);setD(dIso(x))};
  $('#att-next').onclick=function(){var x=dObj(A.attDate);x.setDate(x.getDate()+1);setD(dIso(x))};if($('#att-today'))$('#att-today').onclick=function(){setD(dIso(new Date()))};
  load();
}
/* เวลา + สถานที่ที่ลงเวลา (เข้า/ออก) · นอกพื้นที่ = ป้ายส้ม · มีพิกัด = ลิงก์แผนที่ · HR ลงแทน/แก้ = ป้าย "แก้โดย HR" */
function attAt(t,a,loc0,bad0){if(!t)return '<span class="faint">—</span>';a=a||(loc0?{loc:loc0,ok:!bad0}:null);
  return '<div class="num" style="font-weight:600">'+esc(t)+'</div>'+(a&&(a.loc||a.adj)?'<div class="at-loc">'+(a.loc?'<span class="badge '+(a.ok?'b-ok':'b-warn')+'"'+(a.dist?' title="ห่างจุดลงเวลา '+(a.dist>=1000?(a.dist/1000).toFixed(1)+' กม.':a.dist+' ม.')+'"':'')+'>'+(a.ok||a.loc==='นอกพื้นที่'?'':'นอกพื้นที่ · ')+esc(a.loc)+'</span>':'')+
    (a.gps?'<a href="https://www.google.com/maps?q='+encodeURIComponent(a.gps)+'" target="_blank" rel="noopener" class="at-map" title="เปิดแผนที่">แผนที่</a>':'')+(a.adj?'<span class="badge b-mute">แก้โดย HR</span>':'')+'</div>':'')}
function drawAtt(){if(!$('#att-body'))return;var d=A.att,c=d.counts,f=A.attF||'all';
  // กรองแผนก/ทีม → นับตัวเลขใหม่จากรายชื่อที่เหลือ
  var ofs=ofSt('att');if(ofs.d!=='all'||ofs.t!=='all'){var pp=d.people.filter(function(p){return ofOk('att',p.department,org('teams',p.team_id))});c={total:pp.length,in:0,late:0,leave:0,absent:0,out_of_area:0,exempt:c.exempt};pp.forEach(function(p){if(p.first_in)c.in++;if(p.status==='late')c.late++;if(/leave/.test(p.status))c.leave++;if(p.status==='not_yet'||p.status==='absent')c.absent++;if(p.out_of_area)c.out_of_area++});d={date:d.date,today:d.today,counts:c,people:pp}}
  $('#att-sub').innerHTML=esc(dTxt(d.date,1))+' · '+c.total+' คน'+(c.exempt?' · <span title="ตั้งที่ ข้อมูลพนักงาน › ประเภทการลงเวลา">ไม่รวม '+c.exempt+' คนที่ไม่ต้องลงเวลา</span>':'');
  var sb=function(k,l,n,w){return '<button data-af="'+k+'" class="'+(w&&n?'w':'')+'" aria-pressed="'+(f===k)+'"><b class="num">'+n+'</b><span>'+l+'</span></button>'};
  var rows=d.people.filter(function(p){return f==='all'||(f==='in'&&p.first_in)||(f==='late'&&p.status==='late')||(f==='leave'&&/leave/.test(p.status))||(f==='absent'&&(p.status==='not_yet'||p.status==='absent'))||(f==='out'&&p.out_of_area)});
  $('#att-body').innerHTML='<div class="sum">'+sb('all','ทั้งหมด',c.total)+sb('in','ลงเวลาแล้ว',c.in)+sb('absent',d.today===false?'ขาดงาน / ไม่ลงเวลา':'ยังไม่ลงเวลา',c.absent,1)+sb('late','มาสาย',c.late,1)+sb('out','นอกพื้นที่',c.out_of_area,1)+sb('leave','ลา',c.leave)+'</div>'+
   '<section class="card"><div class="tw"><table style="min-width:720px"><thead><tr><th>พนักงาน</th><th>แผนก</th><th>เข้า</th><th>ออก</th><th>สถานะ</th>'+(canMap()?'<th>อุปกรณ์</th>':'')+'<th>หมายเหตุ</th>'+(isHR()?'<th></th>':'')+'</tr></thead><tbody>'+
   (rows.length?rows.map(function(p){var s=AST[p.status]||[p.status,'b-mute'];return '<tr><td><b>'+esc(p.code)+'</b> '+esc(p.name)+(p.nickname?' <span class="muted">('+esc(p.nickname)+')</span>':'')+'</td><td>'+esc(p.department)+'</td><td>'+attAt(p.first_in,p.in_at,p.location,p.out_of_area)+'</td><td>'+attAt(p.last_out,p.out_at)+'</td><td><span class="badge '+s[1]+'">'+s[0]+(p.late_min?' '+p.late_min+' นาที':'')+'</span></td>'+(canMap()?'<td class="muted" style="font-size:12.5px;white-space:nowrap">'+(p.device?devHtml(p.device):'')+(p.device_new?' <span class="badge b-warn">เครื่องใหม่</span>':'')+'</td>':'')+'<td class="muted" style="font-size:12.5px">'+esc((p.notes||[]).join(' · ')||p.leave||'')+(!canMap()&&p.device_new?' <span class="badge b-warn">เครื่องใหม่</span>':'')+'</td>'+(isHR()?'<td><button class="btn sm" data-fix="'+p.id+'">แก้เวลา</button></td>':'')+'</tr>'}).join(''):'<tr><td colspan="8" class="muted" style="text-align:center;padding:24px">ไม่มีรายการ</td></tr>')+'</tbody></table></div></section>';
  $$('[data-af]').forEach(function(b){b.onclick=function(){A.attF=b.dataset.af;drawAtt()}});
  $$('[data-fix]').forEach(function(b){b.onclick=function(){openFix(b.dataset.fix,d.date)}});
}
/* HR แก้เวลาลงงาน: เลือกคน + วัน → รายการของวันนั้น · ลงเวลาแทน (Time Adjust) · ยกเลิกรายการที่ผิด (แถวยังอยู่) · ต้องมีเหตุผลทุกครั้ง */
var FIXK={add_in:'ลงเวลาเข้าแทน',add_out:'ลงเวลาออกแทน','void':'ยกเลิกรายการ'};
function openFix(emp,date){var P=((A.att&&A.att.people)||A.d.employees.filter(function(e){return e.status!=='resigned'}).map(function(e){return {id:e.id,code:e.emp_code,name:e.first_name+' '+e.last_name,nickname:e.nickname}})).slice().sort(function(a,b){return a.code<b.code?-1:1}),today=(A.att&&A.att.date)||new Date().toISOString().slice(0,10);
  drawer('แก้เวลาลงงาน','<div style="display:grid;grid-template-columns:1fr 150px;gap:10px"><label class="f"><span>พนักงาน</span><select id="fx-emp"><option value="">— เลือกพนักงาน —</option>'+P.map(function(p){return '<option value="'+esc(p.id)+'"'+(p.id===emp?' selected':'')+'>'+esc(p.code+' '+p.name+(p.nickname?' ('+p.nickname+')':''))+'</option>'}).join('')+'</select></label><label class="f"><span>วันที่</span><input type="date" id="fx-date" max="'+today+'" value="'+esc(date||today)+'"></label></div><div id="fx-body" style="margin-top:14px"></div>');
  var load=function(){var e=$('#fx-emp').value,dt=$('#fx-date').value;if(!e||!dt){$('#fx-body').innerHTML='<div class="faint">เลือกพนักงานและวันที่</div>';return}
    $('#fx-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังโหลด…</div>';aCall('dayRecords',e,dt).then(drawFix).catch(function(x){$('#fx-body').innerHTML='<div class="alert">'+esc(x.message)+'</div>'})};
  $('#fx-emp').onchange=load;$('#fx-date').onchange=load;load()}
function drawFix(d){if(!$('#fx-body'))return;var s=d.summary,st=AST[s.status]||[s.status,'b-mute'];
  var after=function(r,msg){drawFix(r);toast(msg);if(A.att&&r.date===A.att.date&&A.attLoad)A.attLoad();if(A.view==='profile'){OV=null;render()}};
  $('#fx-body').innerHTML='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px"><span class="badge '+st[1]+'">'+st[0]+(s.late_min?' '+s.late_min+' นาที':'')+'</span><span class="num">เข้า '+(s.first_in||'—')+' · ออก '+(s.last_out||'—')+'</span>'+(s.leave?'<span class="badge b-info">ลา'+esc(s.leave)+'</span>':'')+(s.note?'<span class="faint">'+esc(s.note)+'</span>':'')+'</div>'+
   '<div class="tw"><table><thead><tr><th>เวลา</th><th></th><th>ช่องทาง / หมายเหตุ</th><th></th></tr></thead><tbody>'+(d.records.length?d.records.map(function(r){var v=r.voided,x=v?' style="text-decoration:line-through;color:var(--fnt)"':'';
    return '<tr><td class="num"'+x+'><b>'+esc(r.time)+'</b></td><td'+x+'>'+(r.io==='IN'?'เข้า':'ออก')+'</td><td style="font-size:12.5px"><span'+x+'>'+esc(r.type==='Time Adjust'?'HR ลงแทน':r.type==='LINE-Checkin'?'แอป LINE':r.type)+(r.location?' · '+esc(r.location):'')+'</span>'+(r.note?'<div class="muted">'+esc(r.note)+'</div>':'')+(r.by?'<div class="faint">โดย '+esc(r.by)+'</div>':'')+(v?'<div style="color:var(--bad)">ยกเลิกโดย '+esc(v.by)+' · '+esc(v.reason)+'</div>':'')+'</td><td>'+(v?'':'<button class="btn sm" data-fxv="'+esc(r.id)+'">ยกเลิก</button>')+'</td></tr>'}).join(''):'<tr><td colspan="4" class="muted" style="text-align:center;padding:16px">ไม่มีการลงเวลาในวันนี้</td></tr>')+'</tbody></table></div>'+
   '<div id="fx-void"></div><h4 style="margin:16px 0 8px">ลงเวลาแทน</h4><div style="display:grid;grid-template-columns:110px 120px 1fr;gap:8px;align-items:end"><label class="f"><span>ประเภท</span><select id="fx-io"><option value="IN">เข้างาน</option><option value="OUT"'+(s.first_in&&!s.last_out?' selected':'')+'>ออกงาน</option></select></label><label class="f"><span>เวลา</span><input type="time" id="fx-time"></label><label class="f"><span>เหตุผล <b class="req">*</b></span><input id="fx-reason" maxlength="300" placeholder="เช่น ลืมลงเวลา โทรศัพท์เสีย"></label></div><div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn pri" id="fx-add">บันทึกเวลา</button></div>'+
   (d.history.length?'<h4 style="margin:16px 0 6px">ประวัติการแก้ของวันนี้</h4>'+d.history.map(function(h){return '<div class="faint" style="font-size:12.5px;padding:3px 0">'+esc(String(h.at).slice(0,16).replace('T',' '))+' · '+esc(h.by)+' · '+esc(FIXK[h.kind]||h.kind)+' '+esc(h.time)+' · '+esc(h.reason)+'</div>'}).join(''):'')+
   '<div class="faint" style="font-size:12px;margin-top:12px">ไม่มีการลบข้อมูล: รายการที่ยกเลิกยังเก็บไว้ · ทุกการแก้บันทึกใน Audit Log · วันก่อนหน้า ระบบคำนวณสรุปของวันนั้นใหม่ทันที</div>';
  $('#fx-add').onclick=function(){var b=this,o={employee_id:d.employee.id,date:d.date,io:$('#fx-io').value,time:$('#fx-time').value,reason:$('#fx-reason').value.trim()};
    if(!o.time)return toast('ใส่เวลา',1);if(o.reason.length<3)return toast('ระบุเหตุผล',1);busy(b,1);
    aCall('adjustTime',o).then(function(r){after(r,'บันทึกเวลา'+(o.io==='IN'?'เข้า':'ออก')+' '+o.time+' แล้ว')}).catch(function(e){busy(b,0);toast(e.message,1)})};
  $$('[data-fxv]').forEach(function(b){b.onclick=function(){var r=d.records.filter(function(x){return x.id===b.dataset.fxv})[0];
    $('#fx-void').innerHTML='<div class="card" style="margin-top:10px;padding:12px"><b>ยกเลิกรายการ '+esc(r.time)+' '+(r.io==='IN'?'เข้า':'ออก')+'</b><label class="f" style="margin-top:8px"><span>เหตุผล <b class="req">*</b></span><input id="fxv-reason" maxlength="300" placeholder="เช่น กดผิด ลงเวลาซ้ำ"></label><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn" id="fxv-no">ไม่ยกเลิก</button><button class="btn bad" id="fxv-ok">ยืนยันยกเลิก</button></div></div>';
    $('#fxv-reason').focus();$('#fxv-no').onclick=function(){$('#fx-void').innerHTML=''};
    $('#fxv-ok').onclick=function(){var x=this,why=$('#fxv-reason').value.trim();if(why.length<3)return toast('ระบุเหตุผล',1);busy(x,1);
      aCall('voidRecord',d.employee.id,d.date,r.id,why).then(function(res){after(res,'ยกเลิกรายการแล้ว')}).catch(function(e){busy(x,0);toast(e.message,1)})}}});
}

/* ───────── ตัวเลือกช่วงวัน (Figma 419:7274 แบบ ค) ─────────
   dpBtn(id,a,b) = ปุ่มเปิด · dpRange(ปุ่ม,{a,b},onApply(a,b)) · a/b = 'YYYY-MM-DD' หรือ '' (ทุกช่วงเวลา) */
var DPM=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],DPS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],DPW=['อา','จ','อ','พ','พฤ','ศ','ส'],DPD=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
function dIso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function dObj(s){var p=String(s).split('-');return new Date(+p[0],p[1]-1,+p[2])}
function dAdd(s,n){var d=dObj(s);d.setDate(d.getDate()+n);return dIso(d)}
function dTxt(s,wd){var d=dObj(s);return (wd?DPD[d.getDay()]+' ':'')+d.getDate()+' '+DPS[d.getMonth()]+' '+(d.getFullYear()+543)}
function rngTxt(a,b){if(!a)return 'ทุกช่วงเวลา';if(!b||a===b)return dTxt(a,1);var x=dObj(a),y=dObj(b);return x.getFullYear()===y.getFullYear()?x.getDate()+' '+DPS[x.getMonth()]+' – '+dTxt(b):dTxt(a)+' – '+dTxt(b)}
function dpBtn(id,a,b){return '<button class="btn dpt" id="'+id+'" aria-haspopup="dialog" aria-expanded="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span>'+esc(rngTxt(a,b))+'</span><svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>'}
function dpPresets(max){var t=dIso(new Date()),d=dObj(t),w=d.getDay(),y=d.getFullYear(),m=d.getMonth(),cl=function(x){return max&&x>max?max:x};
  return [['all','ทุกช่วงเวลา','',''],['today','วันนี้',t,t],['yday','เมื่อวาน',dAdd(t,-1),dAdd(t,-1)],['tw','สัปดาห์นี้',dAdd(t,-w),cl(dAdd(t,6-w))],['lw','สัปดาห์ที่แล้ว',dAdd(t,-w-7),dAdd(t,-w-1)],
    ['tm','เดือนนี้',dIso(new Date(y,m,1)),cl(dIso(new Date(y,m+1,0)))],['lm','เดือนที่แล้ว',dIso(new Date(y,m-1,1)),dIso(new Date(y,m,0))],['d30','30 วันล่าสุด',dAdd(t,-29),t]]}
function dpRange(btn,cur,onApply){
  var old=document.querySelector('.dp');if(old){old._close();if(old._btn===btn)return}
  var S={a:cur.a||'',b:cur.b||'',h:''},one=window.innerWidth<820;
  var mx=cur.max||'';// วันที่เลือกได้สูงสุด (เช่น วันนี้) · หลังจากนั้นกดไม่ได้
  var startV=function(){var e=dObj(S.b||S.a||mx||dIso(new Date())),L=new Date(e.getFullYear(),e.getMonth()-(one?0:1),1);
    if(!one&&S.a&&S.a<dIso(L))L=new Date(dObj(S.a).getFullYear(),dObj(S.a).getMonth(),1);return L};
  S.v=startV();
  var el=document.createElement('div');el.className='dp';el.setAttribute('role','dialog');el.setAttribute('aria-label','เลือกช่วงวัน');el._btn=btn;document.body.appendChild(el);btn.setAttribute('aria-expanded','true');
  var close=function(){el.remove();btn.setAttribute('aria-expanded','false');document.removeEventListener('mousedown',om,true);document.removeEventListener('keydown',kd,true);window.removeEventListener('resize',pos)},
      om=function(e){if(!el.contains(e.target)&&!btn.contains(e.target))close()},kd=function(e){if(e.key==='Escape'){e.stopPropagation();close();btn.focus()}};
  el._close=close;
  var pos=function(){var r=btn.getBoundingClientRect(),w=el.offsetWidth,l=r.left<innerWidth/2&&r.left+w<=innerWidth-8?r.left+window.scrollX:r.right+window.scrollX-w;el.style.left=Math.max(8+window.scrollX,l)+'px';el.style.top=(r.bottom+window.scrollY+6)+'px'};
  var mo=function(v,i,n){var y=v.getFullYear(),m=v.getMonth(),first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),t=dIso(new Date()),lo=S.a,hi=S.b||(S.a&&S.h?S.h:'');if(lo&&hi&&hi<lo){var x=lo;lo=hi;hi=x}
    var h='<div class="dp-mo"><div class="dp-h"><button type="button" class="dp-nv'+(i===0?'':' x')+'" data-nv="-1" aria-label="เดือนก่อน">‹</button><b>'+DPM[m]+' '+(y+543)+'</b><button type="button" class="dp-nv'+(i===n-1?'':' x')+'" data-nv="1" aria-label="เดือนถัดไป"'+(mx&&dIso(new Date(y,m+1,1))>mx?' disabled':'')+'>›</button></div><div class="dp-g">'+
      (document.documentElement.lang==='en'?['Su','Mo','Tu','We','Th','Fr','Sa']:DPW).map(function(w){return '<div class="wd">'+w+'</div>'}).join('');
    for(var k=0;k<first;k++)h+='<div></div>';
    for(var d=1;d<=dim;d++){var s=dIso(new Date(y,m,d)),c=(first+d-1)%7,cl='d c'+c+(c===0||c===6?' wk':'')+(s===t?' td':'')+(d===dim?' last':'');
      if(lo&&hi&&s>=lo&&s<=hi)cl+=' in';if(s===lo)cl+=' s';if(s===(hi||lo))cl+=' e';
      h+='<button type="button" class="'+cl+'" data-d="'+s+'" aria-label="'+dTxt(s,1)+'"'+(s===lo||s===hi?' aria-pressed="true"':'')+(mx&&s>mx?' disabled':'')+'><span>'+d+'</span></button>'}
    return h+'</div></div>'};
  var draw=function(){var n=one?1:2,P=dpPresets(mx),lo=S.a,hi=S.b||S.a,cnt=lo?Math.round((dObj(hi)-dObj(lo))/864e5)+1:0;
    el.innerHTML='<div class="dp-sc">'+P.map(function(p){return '<button type="button" data-pr="'+p[0]+'" aria-pressed="'+(p[2]===S.a&&p[3]===(S.b||S.a))+'">'+p[1]+'</button>'}).join('')+'</div>'+
      '<div class="dp-m"><div class="dp-cal">'+[0,1].slice(0,n).map(function(i){return mo(new Date(S.v.getFullYear(),S.v.getMonth()+i,1),i,n)}).join('')+'</div>'+
      '<div class="dp-f"><div class="dp-bx"><small>วันเริ่ม</small><b>'+(lo?dTxt(lo,1):'—')+'</b></div><span class="faint">–</span><div class="dp-bx"><small>ถึงวันที่</small><b>'+(S.b?dTxt(S.b,1):lo?'เลือกวันสุดท้าย':'—')+'</b></div>'+
      '<span class="n">'+(cnt?cnt+' วัน':'ทุกช่วงเวลา')+'</span><span class="sp"></span><button type="button" class="btn" data-x>ยกเลิก</button><button type="button" class="btn pri" data-ok>ตกลง</button></div></div>';
    el.querySelectorAll('[data-nv]').forEach(function(b){b.onclick=function(){S.v=new Date(S.v.getFullYear(),S.v.getMonth()+Number(b.dataset.nv),1);draw()}});
    el.querySelectorAll('[data-d]').forEach(function(b){var k=b.dataset.d;
      b.onclick=function(){if(!S.a||S.b){S.a=k;S.b='';S.h=''}else if(k<S.a){S.b=S.a;S.a=k}else S.b=k;draw()};
      b.onmouseenter=function(){if(S.a&&!S.b&&S.h!==k){S.h=k;paint()}}});
    el.querySelectorAll('[data-pr]').forEach(function(b){b.onclick=function(){var p=dpPresets(mx).filter(function(x){return x[0]===b.dataset.pr})[0];S.a=p[2];S.b=p[3];S.h='';S.v=startV();draw()}});
    el.querySelector('[data-x]').onclick=function(){close();btn.focus()};
    el.querySelector('[data-ok]').onclick=function(){var a=S.a,b=S.b||S.a;close();onApply(a,b)};
    pos()};
  // ชี้เมาส์ = แค่ทาสีช่วงใหม่ (ไม่สร้างปุ่มใหม่ เพื่อไม่ให้เมาส์หลุด)
  var paint=function(){var lo=S.a,hi=S.h;if(hi<lo){var x=lo;lo=hi;hi=x}
    el.querySelectorAll('[data-d]').forEach(function(b){var k=b.dataset.d;b.classList.toggle('in',k>=lo&&k<=hi);b.classList.toggle('s',k===lo);b.classList.toggle('e',k===hi)})};
  draw();setTimeout(function(){document.addEventListener('mousedown',om,true)},0);document.addEventListener('keydown',kd,true);window.addEventListener('resize',pos)}

/* ───────── รายงาน (เมนู "รายงาน" · ข้อเสนอจัดเมนูใหม่ Figma 441:7719: Matrix · Dashboard ผู้บริหาร · สรุปทำเงินเดือน · รายงาน OT) ─────────
   Matrix (Figma 426:8186): ตารางคน × วัน · ช่วงวันที่เลือกได้ถึงวันนี้ · ตามขอบเขต "ลงเวลา" ของผู้ใช้ · ส่งออก Excel (CSV) / PDF (พิมพ์) */
var RP_ST={ok:'มาทำงาน',late:'มาสาย',working:'กำลังทำงาน',missing_out:'ไม่มีออก',missing_in:'ไม่มีเข้า',leave:'ลา',leave_wait:'ลา (รออนุมัติ)',holiday:'วันหยุด',off:'วันหยุด',absent:'ขาดงาน',not_yet:'ยังไม่ลงเวลา'};
/* ปุ่มส่งออกแบบเดียวกันทั้งระบบ: ไอคอนไฟล์ + "Export Excel / PDF / Text" (ผู้ใช้ขอ 27 ต.ค. 2569) · exBtn(kind, id, label?, attr?) */
function exBtn(kind,id,label,attr){return '<button class="btn btn-ex" id="'+id+'"'+(attr?' '+attr:'')+'>'+fileIc(kind)+esc(label||('Export '+{xls:'Excel',pdf:'PDF',txt:'Text'}[kind]))+'</button>'}
function fileIc(kind){var c=kind==='pdf'?'#DC2626':kind==='txt'?'#2563EB':'#15803D',l=kind==='pdf'?'PDF':kind==='txt'?'TXT':'XLS';
  return '<svg class="fic" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 1.5h8l5 5v12H4z" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 1.5v5h5" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linejoin="round"/><rect x="1" y="10" width="13" height="7" rx="2" fill="'+c+'"/><text x="7.5" y="15.2" text-anchor="middle" font-size="4.8" font-weight="700" fill="#fff" font-family="Arial,sans-serif">'+l+'</text></svg>'}
function vRepMx(){if(A.rpa===undefined){var tm=dpPresets(dIso(new Date())).filter(function(x){return x[0]==='tm'})[0];A.rpa=tm[2];A.rpb=tm[3];A.rpq='';A.rpd='all';A.rpt='all'}
  var sc=acc('att'),deps=A.d.org.departments.filter(function(d){return d.active!=='FALSE'}),tms=A.d.org.teams.filter(function(t){return t.active!=='FALSE'&&(A.rpd==='all'||t.department_id===A.rpd)});
  var tab=function(l,on,soon){return '<button type="button"'+(on?' aria-pressed="true"':'')+(soon?' disabled title="อยู่ระหว่างพัฒนา"':'')+'>'+l+(soon?' <span class="sn">เร็ว ๆ นี้</span>':'')+'</button>'};
  return '<div class="ph"><div><h1>รายงาน</h1><div class="sub">ตารางสรุปรายวันต่อคน · ขอบเขต: '+esc(scopeTxt('att'))+'</div></div><span class="sp"></span><button class="btn btn-ex rp-noprint" id="rp-xls">'+fileIc('xls')+'Export Excel</button><button class="btn btn-ex rp-noprint" id="rp-pdf">'+fileIc('pdf')+'Export PDF</button></div>'+
   rpTabs('mx')+
   '<section class="card rp-tools" style="padding:14px 16px"><div class="rp-f"><label>ช่วงวันที่'+dpBtn('rp-rg',A.rpa,A.rpb)+'</label>'+
    (sc==='all'?'<label>แผนก<select id="rp-dep"><option value="all">ทุกแผนก</option>'+deps.map(function(d){return '<option value="'+d.id+'"'+(A.rpd===d.id?' selected':'')+'>'+esc(d.name)+'</option>'}).join('')+'</select></label>':'')+
    (sc==='all'||sc==='dept'?'<label>ทีม<select id="rp-team"><option value="all">ทุกทีม</option>'+tms.map(function(t){return '<option value="'+t.id+'"'+(A.rpt===t.id?' selected':'')+'>'+esc(t.name)+'</option>'}).join('')+'</select></label>':'')+
    '<label>ค้นหาชื่อ<input type="search" id="rp-q" placeholder="ชื่อ ชื่อเล่น รหัส" value="'+esc(A.rpq)+'"></label></div><div class="rp-lg" id="rp-lg"></div></section>'+
   '<section class="card" style="padding:0;overflow:hidden"><div id="rp-body"><div class="loading"><span class="spin"></span></div></div></section>'}
function bRepMx(){
  var load=function(){$('#rp-body').innerHTML='<div class="loading"><span class="spin"></span></div>';aCall('attMatrix',A.rpa,A.rpb).then(function(d){A.rpm=d;drawRep()}).catch(function(e){if($('#rp-body'))$('#rp-body').innerHTML='<div class="alert" style="margin:16px">'+esc(e.message)+'</div>'})};
  $('#rp-rg').onclick=function(){var b=this;dpRange(b,{a:A.rpa,b:A.rpb,max:dIso(new Date())},function(a,z){if(!a){var t=dIso(new Date());a=t.slice(0,4)+'-01-01';z=t}A.rpa=a;A.rpb=z;b.querySelector('span').textContent=rngTxt(a,z);load()})};
  if($('#rp-dep'))$('#rp-dep').onchange=function(){A.rpd=this.value;A.rpt='all';drawRep()};
  if($('#rp-team'))$('#rp-team').onchange=function(){A.rpt=this.value;drawRep()};
  var qt;$('#rp-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){A.rpq=v;drawRep()},200)};
  $('#rp-xls').onclick=function(){repCsv()};$('#rp-pdf').onclick=function(){if(!A.rpm)return;window.print()};
  if(A.rpm&&A.rpm.from===A.rpa&&A.rpm.to===A.rpb)drawRep();else load()}
function repRows(){var d=A.rpm;if(!d)return [];var q=(A.rpq||'').trim().toLowerCase();
  var rows=d.people.filter(function(p){return (A.rpd==='all'||p.department_id===A.rpd)&&(A.rpt==='all'||p.team_id===A.rpt)&&(!q||(p.code+' '+p.name+' '+(p.nickname||'')).toLowerCase().indexOf(q)>=0)});
  var s=A.rps;if(!s)return rows;   // เรียงตามหัวคอลัมน์ (Figma 480:8493) · ค่าเท่ากัน = ตามรหัสพนักงาน
  var val=function(p){return s.k==='name'?p.name:s.k==='pos'?(p.position||''):p.sum[s.k]};
  return rows.slice().sort(function(a,b){var x=val(a),y=val(b),c=typeof x==='string'?x.localeCompare(y,'th'):x-y;return (c*s.dir)||(a.code<b.code?-1:1)})}
/* หัวคอลัมน์กดเรียง: ปกติ → (ตัวเลข มาก→น้อย | ข้อความ ก–ฮ) → กลับด้าน → ปกติ */
function repSort(k){var s=A.rps,num=k!=='name'&&k!=='pos',first=num?-1:1;
  A.rps=!s||s.k!==k?{k:k,dir:first}:s.dir===first?{k:k,dir:-first}:null;drawRep()}
function repTh(k,cls,html){var s=A.rps,on=s&&s.k===k,st=on?(s.dir<0?'desc':'asc'):'none';
  return '<th class="'+cls+' sk'+(on?' on':'')+'" data-sk="'+k+'" aria-sort="'+(on?(s.dir<0?'descending':'ascending'):'none')+'" title="กดเพื่อเรียง">'+html+'<i class="si '+st+'"></i></th>'}
function repCell(x,ds,d){if(x.s==='nodata'){var w=dObj(ds).getDay();return d.holidays[ds]?{c:'ho',h:'วันหยุด',t:'วันหยุด'}:(w===0||w===6)?{c:'we',h:'',t:''}:{c:'nd',h:'–',t:'ไม่มีข้อมูล'}}var we=x.s==='off',ho=x.s==='holiday'||(!x.i&&d.holidays[ds]);
  if(x.i||x.o){var t=x.i&&x.o?x.i+'–'+x.o:x.i?x.i:'ออก '+x.o,c=x.off?'of':'',sub=x.off?'นอกพื้นที่':'สำนักงาน';if(x.adj){c+=' aj';sub='แก้เวลา'}if(x.lv)sub=x.lv;
    return {c:c,h:'<span class="'+(x.l?'late':'')+'">'+t+'</span><small>'+esc(sub)+'</small>',t:t+(x.off?' นอกพื้นที่':'')+(x.adj?' แก้เวลา':'')+(x.l?' สาย '+x.l+' นาที':'')}}
  if(/leave/.test(x.s))return {c:'lv',h:esc(x.lv||'ลา')+(x.s==='leave_wait'?'<small>รออนุมัติ</small>':''),t:'ลา '+(x.lv||'')};
  if(ho)return {c:'ho',h:'วันหยุด',t:'วันหยุด'};if(we)return {c:'we',h:'',t:''};
  if(x.s==='absent')return {c:'ab',h:'ขาดงาน',t:'ขาดงาน'};return {c:'ny',h:'—',t:''}}
/* ตัวกรองแผนก/ทีม: แสดงเฉพาะที่มีพนักงานในรายงานนี้ (ตามขอบเขตสิทธิ์) + จำนวนคน · แผนก/ทีมว่างไม่ขึ้น */
function repOpts(){var d=A.rpm;if(!d)return;var cd={},ct={};d.people.forEach(function(p){cd[p.department_id]=(cd[p.department_id]||0)+1;if(A.rpd==='all'||p.department_id===A.rpd)ct[p.team_id]=(ct[p.team_id]||0)+1});
  var o=function(v,l,n,cur){return '<option value="'+esc(v)+'"'+(cur===v?' selected':'')+'>'+esc(l)+(n?' ('+n+')':'')+'</option>'};
  var ds=A.d.org.departments.filter(function(x){return cd[x.id]}).sort(function(a,b){return a.name.localeCompare(b.name)}),ts=A.d.org.teams.filter(function(x){return ct[x.id]}).sort(function(a,b){return a.name.localeCompare(b.name)});
  if(A.rpd!=='all'&&!cd[A.rpd])A.rpd='all';if(A.rpt!=='all'&&!ct[A.rpt])A.rpt='all';
  if($('#rp-dep'))$('#rp-dep').innerHTML=o('all','ทุกแผนก',d.people.length,A.rpd)+ds.map(function(x){return o(x.id,x.name,cd[x.id],A.rpd)}).join('');
  if($('#rp-team'))$('#rp-team').innerHTML=o('all','ทุกทีม',0,A.rpt)+ts.map(function(x){return o(x.id,x.name,ct[x.id],A.rpt)}).join('')}
function drawRep(){var d=A.rpm;if(!d||!$('#rp-body'))return;repOpts();var rows=repRows(),TD=['อา','จ','อ','พ','พฤ','ศ','ส'];
  var tot={present:0,absent:0,off:0,adj:0,leave:0},we=0,nd=0;rows.forEach(function(p){['present','absent','off','adj','leave'].forEach(function(k){tot[k]+=p.sum[k]});d.dates.forEach(function(ds){var st=p.days[ds].s,c=repCell(p.days[ds],ds,d).c;if(c==='we')we++;if(c==='nd')nd++})});
  var hol=Object.keys(d.holidays).length;
  $('#rp-lg').innerHTML='<span class="rp-ok">มาทำงาน · '+tot.present+'</span><span class="rp-ab">ขาดงาน · '+tot.absent+'</span><span class="rp-of">นอกพื้นที่ (เช็คอินนอกพื้นที่) · '+tot.off+'</span><span class="rp-aj">ขอแก้เวลา · '+tot.adj+'</span><span class="rp-ho">วันหยุดบริษัท · '+hol+' วัน</span><span class="rp-lv">ลา · '+tot.leave+'</span><span class="rp-we">เสาร์–อาทิตย์ / วันไม่ทำงาน · '+we+'</span>'+(nd?'<span class="rp-nd">– ไม่มีข้อมูล (ก่อนเริ่มใช้ระบบ/ก่อนวันเริ่มงาน) · '+nd+'</span>':'');
  if(!rows.length){$('#rp-body').innerHTML='<div class="rp-empty">ไม่พบพนักงานตามเงื่อนไขนี้</div>';return}
  var h='<div class="faint" style="padding:10px 16px;font-size:12.5px">'+rows.length+' คน · '+d.dates.length+' วัน ('+esc(rngTxt(d.from,d.to))+') · เลื่อนซ้าย–ขวาเพื่อดูวันอื่น (ชื่อและสรุปค้างไว้)'+(d.exempt?' · <span title="ตั้งที่ ข้อมูลพนักงาน › ประเภทการลงเวลา">ไม่รวม '+d.exempt+' คนที่ไม่ต้องลงเวลา</span>':'')+'</div><div class="rp-tw"><table class="rp-t"><thead><tr><th class="fx c0">#</th>'+repTh('name','fx c1','พนักงาน')+repTh('pos','fx c2','ตำแหน่ง')+repTh('present','sm s-p','มา<small>วัน</small>')+repTh('absent','sm s-a','ขาด<small>วัน</small>')+repTh('off','sm s-o','นอกฯ<small>วัน</small>')+repTh('adj','sm s-j','แก้เวลา<small>ครั้ง</small>')+repTh('leave','sm s-l last','ลา<small>วัน</small>')+''+
   d.dates.map(function(ds){var dt=dObj(ds),wd=dt.getDay(),cl=d.holidays[ds]?'ho':(wd===0||wd===6?'we':'');return '<th class="dy '+cl+'"'+(d.holidays[ds]?' title="'+esc(d.holidays[ds])+'"':'')+'>'+dt.getDate()+' '+DPS[dt.getMonth()]+'<small>'+TD[wd]+'</small></th>'}).join('')+'</tr></thead><tbody>';
  rows.forEach(function(p,i){var sm=function(v,c){return '<td class="sm '+c+'">'+v+'</td>'};
    h+='<tr><td class="fx c0">'+(i+1)+'</td><td class="fx c1 nm"><b>'+esc(p.name)+'</b><small>('+esc(p.nickname||'-')+') · '+esc(p.code)+'</small></td><td class="fx c2">'+esc(p.position||'')+'</td>'+
     sm(p.sum.present,'s-p')+sm(p.sum.absent,'s-a')+sm(p.sum.off,'s-o')+sm(p.sum.adj,'s-j')+sm(p.sum.leave,'s-l last')+
     d.dates.map(function(ds){var c=repCell(p.days[ds],ds,d);return '<td class="dy '+c.c+'" title="'+esc(c.t)+'">'+c.h+'</td>'}).join('')+'</tr>'});
  $('#rp-body').innerHTML=h+'</tbody></table></div>';$$('#rp-body [data-sk]').forEach(function(t){t.onclick=function(){repSort(t.dataset.sk)}})}
function repCsv(){var d=A.rpm;if(!d)return;var rows=repRows(),q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  var out=[['รหัส','ชื่อ','ชื่อเล่น','ตำแหน่ง','มา','ขาด','นอกพื้นที่','แก้เวลา','ลา'].concat(d.dates)];
  rows.forEach(function(p){out.push([p.code,p.name,p.nickname||'',p.position||'',p.sum.present,p.sum.absent,p.sum.off,p.sum.adj,p.sum.leave].concat(d.dates.map(function(ds){var c=repCell(p.days[ds],ds,d);return c.t||''})))});
  var blob=new Blob(['﻿'+out.map(function(r){return r.map(q).join(',')}).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='matrix_'+d.from+'_'+d.to+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}

/* ───────── รายงาน › แท็บ (28 ต.ค. 2569): Matrix · Dashboard ผู้บริหาร (Figma 426:7739) · แผนที่ (Figma 426:9080 · admin + ผู้บริหาร) ───────── */
function canMap(){var m=A.d&&A.d.me;return !!m&&(m.map||m.role==='admin'||m.role==='exec')}   // 29 ต.ค. 2569: + คนที่ผู้ดูแลระบบให้สิทธิ์ (me.map)
function vRep(){var t=A.rpTab||'mx';if(t==='map'&&!canMap())t=A.rpTab='mx';return t==='xd'?vXd():t==='map'?vMap():vRepMx()}
function bRep(){$$('[data-rpt]').forEach(function(b){b.onclick=function(){if(A.rpTab===b.dataset.rpt)return;A.rpTab=b.dataset.rpt;fxArm('rep');render()}});var t=A.rpTab||'mx';if(t==='xd')bXd();else if(t==='map')bMap();else bRepMx()}
function rpTabs(on){var tab=function(k,l,soon){return '<button type="button" data-rpt="'+(soon?'':k)+'"'+(on===k?' aria-pressed="true"':'')+(soon?' disabled title="อยู่ระหว่างพัฒนา"':'')+'>'+l+(soon?' <span class="sn">เร็ว ๆ นี้</span>':'')+'</button>'};
  return '<div class="rp-tabs" role="group" aria-label="รายงาน">'+tab('mx','Matrix')+tab('xd','Dashboard ผู้บริหาร')+(canMap()?tab('map','แผนที่'):'')+tab('pay','สรุปทำเงินเดือน',1)+tab('ot','รายงาน OT',1)+'</div>'}
var XD_C=['#2563EB','#0891B2','#16A34A','#7C3AED','#D97706','#DC2626','#DB2777','#4B5563','#0D9488','#9333EA','#65A30D','#EA580C'];
function xdColor(id){return xdColor2(id)}
function xdYmTxt(ym){return DPS[+ym.slice(5,7)-1]+' '+(+ym.slice(0,4)+543)}
function vXd(){var cur=dIso(new Date()).slice(0,7);A.xdYm=A.xdYm||cur;A.xdCmp=A.xdCmp||'prev';A.xdDep=A.xdDep||'all';
  var ms=[];for(var k=0;k<12;k++){var d=new Date(+cur.slice(0,4),+cur.slice(5,7)-1-k,1),ym=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);ms.push(ym)}
  return '<div class="ph"><div><h1>รายงาน</h1><div class="sub">สรุปรายเดือนสำหรับผู้บริหาร · เทียบเดือนก่อน / เฉลี่ย 3 เดือน · ขอบเขต: '+esc(scopeTxt('att'))+'</div></div><span class="sp"></span>'+
   '<label class="xd-l">เดือน<select id="xd-ym">'+ms.map(function(m){return '<option value="'+m+'"'+(m===A.xdYm?' selected':'')+'>'+xdYmTxt(m)+(m===cur?' (ถึงวันนี้)':'')+'</option>'}).join('')+'</select></label>'+
   '<span class="xd-l">เทียบกับ</span><div class="segt"><button data-xdc="prev" aria-pressed="'+(A.xdCmp==='prev')+'">เดือนก่อน</button><button data-xdc="avg3" aria-pressed="'+(A.xdCmp==='avg3')+'">เฉลี่ย 3 เดือน</button></div><button class="btn" id="xd-rl">โหลดใหม่</button></div>'+
   rpTabs('xd')+'<div id="xd-body"><div class="loading"><span class="spin"></span>กำลังรวมข้อมูล 6 เดือน…</div></div>'}
function bXd(){var load=function(){$('#xd-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังรวมข้อมูล 6 เดือน…</div>';
    aCall('execDashboard',A.xdYm).then(function(d){A.xd=d;drawXd()}).catch(function(e){if($('#xd-body'))$('#xd-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $('#xd-ym').onchange=function(){A.xdYm=this.value;load()};
  $$('[data-xdc]').forEach(function(b){b.onclick=function(){A.xdCmp=b.dataset.xdc;$$('[data-xdc]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});drawXd()}});
  $('#xd-rl').onclick=function(){fxArm('rep');load()};if(A.xd&&A.xd.ym===A.xdYm)drawXd();else load()}
/* รวมสถิติของคนกลุ่มหนึ่งในเดือน ym */
function xdAgg(ps,ym){var t={exp:0,pres:0,abs:0,lv:0,late:0,off:0,adj:0,n:0};ps.forEach(function(p){var m=p.mo[ym];if(!m)return;if(m.exp||m.lv)t.n++;['exp','pres','abs','lv','late','off','adj'].forEach(function(k){t[k]+=m[k]})});
  t.rate=t.exp?t.pres/t.exp*100:null;t.lateP=t.pres?t.late/t.pres*100:null;t.offP=t.pres?t.off/t.pres*100:null;t.absPP=t.n?t.abs/t.n:0;t.lvPP=t.n?t.lv/t.n:0;return t}
function xdCmpOf(ps,f){var d=A.xd,i=d.months.indexOf(d.ym);if(A.xdCmp==='prev')return i>0?f(xdAgg(ps,d.months[i-1])):null;
  var v=d.months.slice(Math.max(0,i-3),i).map(function(m){return f(xdAgg(ps,m))}).filter(function(x){return x!=null});return v.length?v.reduce(function(a,b){return a+b},0)/v.length:null}
function xdSpark(vals,col,w,h){w=w||150;h=h||34;var v=vals.map(function(x){return x==null?null:+x}),ok=v.filter(function(x){return x!=null});if(ok.length<2)return '<svg width="'+w+'" height="'+h+'"></svg>';
  var mn=Math.min.apply(0,ok),mx=Math.max.apply(0,ok),rg=mx-mn||1,pts=[];v.forEach(function(x,i){if(x!=null)pts.push((i/(v.length-1)*(w-4)+2).toFixed(1)+','+(h-3-(x-mn)/rg*(h-6)).toFixed(1))});
  return '<svg class="xd-sp" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline fill="none" stroke="'+(col||'#141414')+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" points="'+pts.join(' ')+'"/></svg>'}
function xdDelta(cur,cmp,unit,lowGood,dp){if(cur==null||cmp==null)return '<span class="faint">ไม่มีข้อมูลเทียบ</span>';var d=cur-cmp,z=Math.abs(d)<Math.pow(10,-(dp||1))/2;if(z)return '<span class="faint">ไม่เปลี่ยน</span>';
  var good=lowGood?d<0:d>0;return '<span class="'+(good?'xd-up':'xd-dn')+'">'+(d>0?'▲':'▼')+' '+Math.abs(d).toFixed(dp==null?1:dp)+(unit||'')+'</span>'}
function xdSt(r){return r==null?'':r>=95?'<span class="badge b-ok">✓ ดี</span>':r>=90?'<span class="badge b-warn">เฝ้าระวัง</span>':'<span class="badge b-bad">ต่ำกว่าเป้า</span>'}
function f1(x){return x==null?'—':(+x).toFixed(1)}
function drawXd(){var d=A.xd;if(!d||!$('#xd-body'))return;var all=d.people,dep=A.xdDep,ps=dep==='all'?all:all.filter(function(p){return p.dept===dep});
  var used=d.depts.filter(function(x){return all.some(function(p){return p.dept===x.id})}),ym=d.ym,a=xdAgg(ps,ym),cmpTxt=A.xdCmp==='prev'?'จากเดือนก่อน':'จากเฉลี่ย 3 เดือน';
  if(dep!=='all'&&!used.some(function(x){return x.id===dep})){A.xdDep='all';return drawXd()}
  var ser=function(f){return d.months.map(function(m){return f(xdAgg(ps,m))})};
  var chip=function(id,l){return '<button class="xd-chip" data-xdd="'+id+'" aria-pressed="'+(dep===id)+'">'+(id==='all'?'':'<i style="background:'+xdColor(id)+'"></i>')+esc(l)+'</button>'};
  var card=function(t,v,right,sub,sp){return '<section class="card xd-k"><div class="xd-kh"><span>'+t+'</span><span class="faint">'+(right||'')+'</span></div><div class="xd-kv">'+v+'</div><div class="xd-ks">'+sub+'</div>'+sp+'</section>'};
  var rate=function(x){return x.rate},h='';
  h+='<div class="xd-chips"><span class="faint">ดูข้อมูลของ</span>'+chip('all','ทั้งบริษัท')+used.map(function(x){return chip(x.id,x.name)}).join('')+'</div>';
  if(!a.exp&&!a.lv){$('#xd-body').innerHTML=h+'<section class="card"><div class="rp-empty">ยังไม่มีข้อมูลลงเวลาของเดือนนี้ (ระบบสรุปวันที่จบแล้วเท่านั้น)</div></section>';bindXd();return}
  h+='<div class="xd-g6">'+
   card('อัตรามาทำงาน',f1(a.rate)+'%',xdSt(a.rate),xdDelta(a.rate,xdCmpOf(ps,rate),' จุด')+' <span class="faint">'+cmpTxt+'</span>',xdSpark(ser(rate)))+
   card('ขาดงาน',a.abs,f1(a.absPP)+' วัน/คน','<span class="faint">วัน-คน</span> · '+xdDelta(a.abs,xdCmpOf(ps,function(x){return x.abs}),' วัน',1,0),xdSpark(ser(function(x){return x.abs})))+
   card('ลา',a.lv%1?a.lv.toFixed(1):a.lv,f1(a.lvPP)+' วัน/คน','<span class="faint">วัน-คน</span> · '+xdDelta(a.lv,xdCmpOf(ps,function(x){return x.lv}),' วัน',1,0),xdSpark(ser(function(x){return x.lv})))+
   card('มาสายเกิน 15 นาที',f1(a.lateP)+'%',a.late+' ครั้ง',xdDelta(a.lateP,xdCmpOf(ps,function(x){return x.lateP}),' จุด',1),xdSpark(ser(function(x){return x.lateP})))+
   card('ทำงานนอกพื้นที่',f1(a.offP)+'%','ของวันที่มา',xdDelta(a.offP,xdCmpOf(ps,function(x){return x.offP}),' จุด'),xdSpark(ser(function(x){return x.offP})))+
   card('ขอแก้เวลา / ลงแทน',a.adj,'วัน','<span class="faint">วัน-คน</span> · '+xdDelta(a.adj,xdCmpOf(ps,function(x){return x.adj}),' วัน',1,0),xdSpark(ser(function(x){return x.adj})))+'</div>';
  // อัตรามาทำงานรายเดือน (เส้น) + เวลาเข้างาน (แท่ง)
  var rs=ser(rate),okv=rs.filter(function(x){return x!=null}),lo=Math.max(0,Math.floor(Math.min.apply(0,okv.concat([95]))-1)),W=620,H=200,px=function(i){return 40+i*(W-60)/(rs.length-1)},py=function(v){return 14+(100-v)/(100-lo)*(H-40)};
  var ln='<svg viewBox="0 0 '+W+' '+H+'" class="xd-ln" role="img" aria-label="อัตรามาทำงานรายเดือน">';
  for(var g=0;g<=4;g++){var gv=100-g*(100-lo)/4;ln+='<line x1="40" x2="'+(W-14)+'" y1="'+py(gv)+'" y2="'+py(gv)+'" stroke="#EEE"/><text x="34" y="'+(py(gv)+4)+'" text-anchor="end" font-size="11" fill="#909090">'+gv.toFixed(gv%1?1:0)+'%</text>'}
  if(lo<95)ln+='<line x1="40" x2="'+(W-14)+'" y1="'+py(95)+'" y2="'+py(95)+'" stroke="#1A8A4A" stroke-dasharray="4 4" opacity=".5"/>';
  var pts=[];rs.forEach(function(v,i){if(v!=null)pts.push(px(i)+','+py(v))});ln+='<polyline fill="none" stroke="#141414" stroke-width="2" points="'+pts.join(' ')+'"/>';
  rs.forEach(function(v,i){ln+='<text x="'+px(i)+'" y="'+(H-6)+'" text-anchor="middle" font-size="11" fill="'+(i===rs.length-1?'#141414':'#909090')+'"'+(i===rs.length-1?' font-weight="600"':'')+'>'+xdYmTxt(d.months[i]).replace(/ 25(\d\d)$/,' $1')+'</text>';if(v!=null&&i===rs.length-1)ln+='<circle cx="'+px(i)+'" cy="'+py(v)+'" r="4" fill="#141414"/><text x="'+(px(i)-8)+'" y="'+(py(v)-10)+'" text-anchor="end" font-size="12" font-weight="600">'+v.toFixed(1)+'%</text>'});ln+='</svg>';
  var BK=[[0,479,'ก่อน','08:00'],[480,510,'08:00','–08:30'],[511,540,'08:31','–09:00'],[541,570,'09:01','–09:30'],[571,600,'09:31','–10:00'],[601,780,'10:01','–13:00'],[781,960,'13:01','–16:00'],[961,1140,'16:01','–19:00'],[1141,1320,'19:01','–22:00'],[1321,1439,'22:01','–00:00']],bc=BK.map(function(){return 0}),tot=0,ontime=0;
  ps.forEach(function(p){Object.keys(p.days).forEach(function(ds){var x=p.days[ds];if(x[0]!=='p'||x[1]==null)return;tot++;if(x[1]<=540)ontime++;for(var i=0;i<BK.length;i++)if(x[1]>=BK[i][0]&&x[1]<=BK[i][1]){bc[i]++;break}})});
  var bm=Math.max.apply(0,bc.concat([1])),bw=36,hb='<svg viewBox="0 0 '+(BK.length*44+10)+' 200" class="xd-bar" role="img" aria-label="เวลาเข้างาน">';
  BK.forEach(function(b,i){var hh=bc[i]/bm*130,x=8+i*44;hb+='<rect x="'+x+'" y="'+(150-hh)+'" width="'+bw+'" height="'+Math.max(hh,bc[i]?2:1)+'" rx="3" fill="'+(b[1]<=540?'#141414':'#B26A00')+'"/><text x="'+(x+bw/2)+'" y="'+(144-hh)+'" text-anchor="middle" font-size="11" font-weight="600">'+bc[i]+'</text><text x="'+(x+bw/2)+'" y="168" text-anchor="middle" font-size="10" fill="#909090">'+b[2]+'</text><text x="'+(x+bw/2)+'" y="182" text-anchor="middle" font-size="10" fill="#909090">'+b[3]+'</text>'});hb+='</svg>';
  h+='<div class="xd-g2"><section class="card xd-c"><h3>อัตรามาทำงานรายเดือน</h3><div class="faint xd-cs">วันที่มีบันทึกเวลา ÷ วันทำงานที่ต้องมา (ไม่นับวันหยุด วันลา และก่อนวันเริ่มงาน) · เส้นประ = เป้า 95%</div>'+ln+'</section>'+
   '<section class="card xd-c"><h3>เวลาเข้างาน</h3><div class="faint xd-cs">สแกนแรกของวัน · '+tot+' วัน-คน · ไม่เกิน 09:00 = '+(tot?(ontime/tot*100).toFixed(1):'0')+'%</div><div class="xd-lg"><span><i style="background:#141414"></i>ไม่เกิน 09:00</span><span><i style="background:#B26A00"></i>หลัง 09:00</span></div>'+hb+'</section></div>';
  // สรุปรายแผนก
  var rows=used.map(function(x){var pp=all.filter(function(p){return p.dept===x.id});return {id:x.id,name:x.name,ps:pp,a:xdAgg(pp,ym)}}).filter(function(r){return r.a.exp});
  rows.sort(function(p,q){return (p.a.rate||0)-(q.a.rate||0)});var ca=xdAgg(all,ym),mxAbs=Math.max.apply(0,rows.map(function(r){return r.a.absPP}).concat([0.01]));
  var tr=function(r,isAll){var x=r.a,c=xdCmpOf(r.ps,rate),dd=x.rate!=null&&c!=null?x.rate-c:null;
    return '<tr'+(isAll?' class="xd-tot"':' data-xdd="'+r.id+'" class="ck"')+'><td>'+(isAll?'<b>ทั้งบริษัท</b>':'<i class="xd-dot" style="background:'+xdColor(r.id)+'"></i>'+esc(r.name))+'</td><td class="num">'+x.n+'</td><td class="num"><b>'+f1(x.rate)+'%</b></td><td class="num">'+(dd==null?'—':Math.abs(dd)<0.05?'<span class="faint">0.0</span>':'<span class="'+(dd>0?'xd-up':'xd-dn')+'">'+(dd>0?'▲':'▼')+' '+Math.abs(dd).toFixed(1)+'</span>')+'</td>'+
     '<td class="num">'+f1(x.absPP)+(isAll?'':' <span class="xd-hb"><i style="width:'+Math.round(x.absPP/mxAbs*100)+'%"></i></span>')+'</td><td class="num">'+f1(x.lvPP)+'</td><td class="num">'+f1(x.lateP)+'%</td><td class="num">'+f0(x.offP)+'%</td><td>'+xdSpark(d.months.map(function(m){return xdAgg(r.ps,m).rate}),isAll?'#141414':xdColor(r.id),110,26)+'</td><td>'+xdSt(x.rate)+'</td></tr>'};
  h+='<section class="card xd-c"><h3>สรุปรายแผนก</h3><div class="faint xd-cs">มาสาย = เข้าหลังเวลาเริ่มงานเกิน 15 นาที · คลิกแถวเพื่อดูเฉพาะแผนก · สถานะ: ดี ≥ 95% · เฝ้าระวัง 90–95% · ต่ำกว่าเป้า &lt; 90%</div><div class="tw"><table class="xd-t"><thead><tr><th>แผนก</th><th class="num">คน</th><th class="num">อัตรามาทำงาน</th><th class="num">เทียบ</th><th class="num">ขาด/คน</th><th class="num">ลา/คน</th><th class="num">มาสาย</th><th class="num">นอกพื้นที่</th><th>6 เดือน</th><th>สถานะ</th></tr></thead><tbody>'+
   rows.map(function(r){return tr(r)}).join('')+tr({ps:all,a:ca},1)+'</tbody></table></div></section>';
  // อัตรามาทำงานรายวัน แยกแผนก + การลา
  var dd=[],dt=dObj(d.from);while(dIso(dt)<=d.to){dd.push(dIso(dt));dt.setDate(dt.getDate()+1)}
  var cl=function(r){return r==null?'':r<80?'h0':r<85?'h1':r<88?'h2':r<91?'h3':r<97?'h4':'h5'};
  var grid='<div class="xd-hm" style="grid-template-columns:150px repeat('+dd.length+',minmax(14px,1fr))"><span></span>'+dd.map(function(s){return '<span class="xd-hd'+(d.holidays[s]?' ho':'')+'">'+(+s.slice(8))+'</span>'}).join('');
  rows.slice().sort(function(p,q){return (q.a.rate||0)-(p.a.rate||0)}).forEach(function(r){grid+='<span class="xd-hn"><i class="xd-dot" style="background:'+xdColor(r.id)+'"></i>'+esc(r.name)+'</span>'+dd.map(function(s){var e=0,p=0,hw=0;r.ps.forEach(function(x){var v=x.days[s];if(!v)return;if(v[0]==='p'||v[0]==='a'){e++;if(v[0]==='p')p++}if(v[0]==='p'&&d.holidays[s])hw++});
    if(s>d.end)return '<span class="xd-c0 fu"></span>';if(d.holidays[s])return '<span class="xd-c0 hol"'+(hw?' title="ทำงานวันหยุด '+hw+' คน"':' title="'+esc(d.holidays[s])+'"')+'>'+(hw||'')+'</span>';
    if(!e)return '<span class="xd-c0"></span>';var rr=p/e*100;return '<span class="xd-c0 '+cl(rr)+'" title="'+dTxt(s)+' · '+r.name+' · '+rr.toFixed(0)+'% ('+p+'/'+e+')"></span>'}).join('')});grid+='</div>';
  var lvSum=function(arr){var m={},req={};arr.forEach(function(z){if(!ps.some(function(p){return p.id===z[0]}))return;m[z[1]]=(m[z[1]]||0)+z[2];(req[z[1]]=req[z[1]]||{})[z[3]]=1});
    return Object.keys(m).map(function(k){return {n:k,v:m[k],r:Object.keys(req[k]).length}}).sort(function(x,y){return y.v-x.v})};
  var lm=lvSum(d.leave_month),la=lvSum(d.leave_ahead),lmT=lm.reduce(function(s,x){return s+x.v},0),laT=la.reduce(function(s,x){return s+x.v},0),laR=la.reduce(function(s,x){return s+x.r},0),lmM=Math.max.apply(0,lm.map(function(x){return x.v}).concat([1])),laM=Math.max.apply(0,la.map(function(x){return x.v}).concat([1]));
  var bar=function(x,m,cls,right){return '<div class="xd-lv"><span>'+esc(x.n)+'</span><span class="xd-lb '+cls+'"><i style="width:'+Math.round(x.v/m*100)+'%"></i></span><b>'+(x.v%1?x.v.toFixed(1):x.v)+'</b><span class="faint">'+right+'</span></div>'};
  h+='<div class="xd-g2b"><section class="card xd-c"><h3>อัตรามาทำงานรายวัน แยกแผนก</h3><div class="faint xd-cs">'+xdYmTxt(ym)+' · สีเข้ม = มาครบ · สีอ่อน = ขาดหรือลา · กรอบส้ม = วันหยุด (ตัวเลข = จำนวนคนที่ทำงานวันหยุด)</div><div class="xd-lg"><span><i class="xd-c0 h0"></i>&lt;80%</span><span><i class="xd-c0 h1"></i>80%</span><span><i class="xd-c0 h2"></i>85%</span><span><i class="xd-c0 h3"></i>88%</span><span><i class="xd-c0 h4"></i>91%</span><span><i class="xd-c0 h5"></i>≥97%</span><span><i class="xd-c0 hol"></i>ทำงานวันหยุด</span></div><div class="xd-hw">'+grid+'</div></section>'+
   '<section class="card xd-c"><h3>การลาแยกประเภท</h3><div class="faint xd-cs">'+xdYmTxt(ym)+' · รวม '+(lmT%1?lmT.toFixed(1):lmT)+' วัน · เฉลี่ย '+f1(a.n?lmT/a.n:0)+' วัน/คน</div>'+(lm.length?lm.map(function(x){return bar(x,lmM,'',lmT?Math.round(x.v/lmT*100)+'%':'')}).join(''):'<div class="faint" style="padding:8px 0">ไม่มีวันลาที่อนุมัติในเดือนนี้</div>')+
   '<div class="xd-lh"><h3>ลาล่วงหน้า</h3><button class="lnk" data-go="lv">ดูรายชื่อ →</button></div><div class="faint xd-cs">ตั้งแต่พรุ่งนี้ · '+laR+' ใบ · '+(laT%1?laT.toFixed(1):laT)+' วัน</div>'+(la.length?la.map(function(x){return bar(x,laM,'pu',x.r+' ใบ')}).join(''):'<div class="faint" style="padding:8px 0">ยังไม่มีใบลาล่วงหน้า</div>')+'</section></div>';
  // ตรงต่อเวลา + ควรติดตาม
  var mins=function(p){var v=[];Object.keys(p.days).forEach(function(s){var x=p.days[s];if(x[0]==='p'&&x[1]!=null)v.push(x[1])});return v};
  var good=ps.map(function(p){var v=mins(p),m=p.mo[ym]||{};return {p:p,v:v,m:m,late:Object.keys(p.days).some(function(s){return p.days[s][4]})}}).filter(function(x){return x.v.length&&!x.late&&x.m.exp&&!x.m.abs})
    .map(function(x){x.avg=x.v.reduce(function(s,y){return s+y},0)/x.v.length;return x}).sort(function(x,y){return x.avg-y.avg});
  var watch=ps.map(function(p){var s6=d.months.reduce(function(s,m){return s+(p.mo[m]?p.mo[m].abs:0)},0);return {p:p,m:(p.mo[ym]||{}).abs||0,s6:s6}}).filter(function(x){return x.m>0}).sort(function(x,y){return y.m-x.m||y.s6-x.s6});
  var hm=function(m){m=Math.round(m);return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)},nm=function(p){return '<b>'+esc(p.name)+'</b>'+(p.nickname?' ('+esc(p.nickname)+')':'')+'<small><i class="xd-dot" style="background:'+xdColor(p.dept)+'"></i>'+esc(org('departments',p.dept)||'—')+'</small>'};
  var gx=A.xdGoodAll?good:good.slice(0,5),wx=A.xdWatchAll?watch:watch.slice(0,5);
  h+='<div class="xd-g2"><section class="card xd-c"><div class="xd-lh"><h3>พนักงานตรงต่อเวลา</h3>'+(good.length?'<span class="badge b-ok">✓ '+good.length+' คน · '+Math.round(good.length/Math.max(1,a.n)*100)+'% '+(dep==='all'?'ของบริษัท':'ของแผนก')+'</span>':'')+'</div><div class="faint xd-cs">ไม่สายเลย และไม่ขาดงานในเดือนนี้ · เรียงจากเวลาเข้าเฉลี่ยเร็วสุด</div>'+
    (gx.length?gx.map(function(x,i){return '<div class="xd-pr"><span class="xd-n">'+(i+1)+'</span><span class="xd-nm">'+nm(x.p)+'</span><span class="xd-v"><b>'+hm(x.avg)+'</b><small>เข้างานเฉลี่ย</small></span><span class="xd-v"><b>'+x.m.pres+'/'+x.m.exp+'</b><small>วันมา/ทั้งหมด</small></span><span class="xd-v"><b>'+x.p.streak+'</b><small>วันไม่สายติดกัน</small></span></div>'}).join(''):'<div class="faint" style="padding:8px 0">ยังไม่มี</div>')+
    (good.length>5?'<button class="lnk" id="xd-ga">'+(A.xdGoodAll?'ย่อรายชื่อ':'ดูทั้งหมด '+good.length+' คน')+'</button>':'')+'</section>'+
   '<section class="card xd-c"><h3>พนักงานที่ควรติดตาม</h3><div class="faint xd-cs">ขาดงานมากที่สุดในเดือนนี้ · 6 เดือน = รวมขาดงาน 6 เดือนล่าสุด</div>'+
    (wx.length?wx.map(function(x,i){return '<div class="xd-pr"><span class="xd-n">'+(i+1)+'</span><span class="xd-nm">'+nm(x.p)+'</span><span class="xd-v"><b class="bad">'+x.m+'</b><small>ขาดเดือนนี้</small></span><span class="xd-v"><b>'+x.s6+'</b><small>6 เดือน</small></span></div>'}).join(''):'<div class="faint" style="padding:8px 0">ไม่มีพนักงานขาดงานในเดือนนี้</div>')+
    (watch.length>5?'<button class="lnk" id="xd-wa">'+(A.xdWatchAll?'ย่อรายชื่อ':'ดูทั้งหมด '+watch.length+' คน')+'</button>':'')+'</section></div>';
  // สิ่งที่ควรรู้
  var ins=[];if(rows.length){var lowR=rows[0],hiR=rows[rows.length-1];
    if(lowR.a.rate<95)ins.push(['!','bad',lowR.name+' มาทำงาน '+f1(lowR.a.rate)+'% ต่ำสุดในบริษัท · ขาดงานเฉลี่ย '+f1(lowR.a.absPP)+' วัน/คน']);
    var drops=rows.map(function(r){var c=xdCmpOf(r.ps,rate);return {r:r,d:c==null||r.a.rate==null?0:r.a.rate-c}}).sort(function(x,y){return x.d-y.d});
    if(drops[0]&&drops[0].d<=-0.5)ins.push(['↘','warn',drops[0].r.name+' ลดลงมากสุด '+Math.abs(drops[0].d).toFixed(1)+' จุด'+cmpTxt]);
    if(hiR.a.rate>=95)ins.push(['✓','ok',hiR.name+' ดีที่สุด '+f1(hiR.a.rate)+'% · อยู่เหนือเป้า 95%'])}
  var wd={e1:0,p1:0,e2:0,p2:0};ps.forEach(function(p){Object.keys(p.days).forEach(function(s){var x=p.days[s];if(x[0]!=='p'&&x[0]!=='a')return;var w=dObj(s).getDay(),k=w===1||w===5?1:w>=2&&w<=4?2:0;if(!k)return;wd['e'+k]++;if(x[0]==='p')wd['p'+k]++})});
  if(wd.e1&&wd.e2){var r1=wd.p1/wd.e1*100,r2=wd.p2/wd.e2*100;ins.splice(Math.min(2,ins.length),0,['📅','info','วันจันทร์และวันศุกร์มาทำงานเฉลี่ย '+r1.toFixed(1)+'% · '+(r1<r2?'ต่ำกว่า':'สูงกว่า')+' วันกลางสัปดาห์ '+r2.toFixed(1)+'%'])}
  if(ins.length)h+='<section class="card xd-c"><h3>สิ่งที่ควรรู้เดือนนี้</h3><div class="faint xd-cs">สรุปอัตโนมัติจากตัวเลขด้านบน</div><div class="xd-ins">'+ins.map(function(x){return '<div><span class="xd-ii '+x[1]+'">'+x[0]+'</span><span>'+esc(x[2])+'</span></div>'}).join('')+'</div></section>';
  $('#xd-body').innerHTML=h;bindXd()}
function f0(x){return x==null?'—':Math.round(x)}
function bindXd(){$$('[data-xdd]').forEach(function(b){b.onclick=function(){A.xdDep=A.xdDep===b.dataset.xdd&&b.tagName==='TR'?'all':b.dataset.xdd;drawXd();scrollTo(0,0)}});
  if($('#xd-ga'))$('#xd-ga').onclick=function(){A.xdGoodAll=!A.xdGoodAll;drawXd()};if($('#xd-wa'))$('#xd-wa').onclick=function(){A.xdWatchAll=!A.xdWatchAll;drawXd()};
  $$('#xd-body [data-go]').forEach(function(b){b.onclick=function(){go(b.dataset.go)}})}

/* ── แผนที่ลงเวลา (Leaflet + แผนที่ OpenStreetMap โทนเทา · โหลดเมื่อเปิดแท็บ) ── */
function loadLeaflet(){if(window.L&&L.map&&L.markerClusterGroup)return Promise.resolve();if(window._llp)return window._llp;
  var CD='https://cdnjs.cloudflare.com/ajax/libs/',css=function(u){var c=document.createElement('link');c.rel='stylesheet';c.href=u;document.head.appendChild(c)},
    js=function(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.onload=function(){ok()};s.onerror=function(){no(new Error('โหลดแผนที่ไม่สำเร็จ (ตรวจอินเทอร์เน็ต)'))};document.head.appendChild(s)})};
  css(CD+'leaflet/1.9.4/leaflet.min.css');css(CD+'leaflet.markercluster/1.5.3/MarkerCluster.css');css(CD+'leaflet.markercluster/1.5.3/MarkerCluster.Default.css');
  /* รวม/แตกหมุดแบบมีแอนิเมชัน (Leaflet.markercluster · ผู้ใช้ขอ 28 ต.ค. 2569) */
  window._llp=(window.L&&L.map?Promise.resolve():js(CD+'leaflet/1.9.4/leaflet.min.js')).then(function(){return js(CD+'leaflet.markercluster/1.5.3/leaflet.markercluster.js')}).catch(function(e){window._llp=null;throw e});return window._llp}
function vMap(){var t=dIso(new Date());A.mpDate=A.mpDate||t;A.mpF=A.mpF||'gps';A.mpDep=A.mpDep||'all';A.mpQ=A.mpQ||'';
  var deps=A.d.org.departments.filter(function(d){return d.active!=='FALSE'});
  return '<div class="ph"><div><h1>รายงาน</h1><div class="sub">ตำแหน่ง GPS ตอนลงเวลาเข้า · รวมหมุดที่อยู่ในรัศมีจุดลงเวลา · เห็นเฉพาะผู้ดูแลระบบ ผู้บริหาร และคนที่ได้รับสิทธิ์</div></div><span class="sp"></span><span class="faint" id="mp-up"></span>'+
   '<input type="date" id="mp-date" class="amp-in" value="'+A.mpDate+'" max="'+t+'" aria-label="วันที่"><select id="mp-dep" class="amp-in" aria-label="แผนก"><option value="all">ทุกแผนก</option>'+deps.map(function(d){return '<option value="'+d.id+'"'+(A.mpDep===d.id?' selected':'')+'>'+esc(d.name)+'</option>'}).join('')+'</select>'+
   '<input type="search" id="mp-q" class="amp-in" placeholder="ค้นหา ชื่อ / รหัส" value="'+esc(A.mpQ)+'">'+(A.d.me.role==='admin'?'<button class="btn" id="mp-acc" data-tip="เลือกคนที่เห็นแผนที่ได้ (นอกจากผู้ดูแลระบบและผู้บริหาร)">⚙ สิทธิ์ดูแผนที่</button>':'')+'<button class="btn pri" id="mp-rl">รีเฟรช</button></div>'+rpTabs('map')+
   '<div class="amp-g"><section class="card amp-side"><div class="amp-h"><b id="mp-ti">เข้างาน</b><span class="faint" id="mp-gs"></span></div><div class="amp-st" id="mp-st"></div><div class="amp-ls" id="mp-ls"><div class="loading"><span class="spin"></span></div></div></section>'+
   '<section class="card amp-mapc"><div id="mp-map"></div><div class="amp-lg"><span><i style="background:#141414"></i>ในพื้นที่</span><span><i style="background:#D97706"></i>นอกพื้นที่</span><span><i class="ring"></i>พื้นที่ลงเวลา</span></div></section></div>'+
   '<div class="faint" style="font-size:12.5px;margin-top:10px">สีหมุด = แผนก · จุดมุมขวาล่าง = ในพื้นที่ (ดำ) / นอกพื้นที่ (ส้ม) · วงเขียว = พื้นที่ลงเวลา (รัศมีที่ตั้งในระบบ) · คลิกชื่อด้านซ้าย = เลื่อนแผนที่ไปที่หมุด · วงตัวเลข = หมุดที่รวมกัน (กดหรือซูมเข้าเพื่อกระจาย · ซูมสุดแล้วกระจายแบบขาแมงมุม)</div>'}
/* สิทธิ์ดูแผนที่รายคน (29 ต.ค. 2569 ผู้ใช้ขอ) · เฉพาะผู้ดูแลระบบ · ผู้ดูแลระบบ/ผู้บริหารเห็นเสมอ (ติ๊กไม่ได้) */
function mapAcc(){drawer('สิทธิ์ดูแผนที่','<div class="loading"><span class="spin"></span>กำลังโหลด…</div>');aCall('mapAccess').then(function(d){var sel={};d.ids.forEach(function(i){sel[i]=1});
  var row=function(p){return '<label class="ma-r" data-maq="'+esc((p.code+' '+p.name+' '+p.nickname+' '+p.dept).toLowerCase())+'"><input type="checkbox" data-ma="'+p.id+'"'+(p.always||sel[p.id]?' checked':'')+(p.always?' disabled':'')+'>'+av(p,28)+'<span><b>'+esc(p.code)+' '+esc(p.name)+(p.nickname?' ('+esc(p.nickname)+')':'')+'</b><small>'+esc(p.dept||'—')+(p.always?' · '+(p.role==='admin'?'ผู้ดูแลระบบ':'ผู้บริหาร')+' (เห็นเสมอ)':'')+'</small></span></label>'};
  var ppl=d.people.slice().sort(function(a,b){return (b.always-a.always)||((sel[b.id]?1:0)-(sel[a.id]?1:0))||(a.code<b.code?-1:1)});
  $('#ov .cb').innerHTML='<p class="muted" style="margin-top:0">คนที่ติ๊กเห็นแท็บ รายงาน › แผนที่ ของทั้งบริษัท · บันทึกใน Audit Log</p><input type="search" id="ma-q" class="amp-in" placeholder="ค้นหา ชื่อ / รหัส / แผนก" style="width:100%;margin-bottom:8px"><div id="ma-l">'+ppl.map(row).join('')+'</div>';
  $('#ov .drw').insertAdjacentHTML('beforeend','<div class="ch" style="border-top:1px solid var(--line);border-bottom:0;justify-content:flex-end"><span class="faint" id="ma-n"></span><span class="sp"></span><button class="btn" id="ma-x">ยกเลิก</button><button class="btn pri" id="ma-ok">บันทึก</button></div>');
  var cnt=function(){$('#ma-n').textContent='ให้สิทธิ์เพิ่ม '+$$('[data-ma]:checked:not(:disabled)').length+' คน'};cnt();loadPhotos();
  $$('[data-ma]').forEach(function(c){c.onchange=cnt});$('#ma-q').oninput=function(){var q=this.value.trim().toLowerCase();$$('[data-maq]').forEach(function(r){r.hidden=!!q&&r.dataset.maq.indexOf(q)<0})};
  $('#ma-x').onclick=closeD;$('#ma-ok').onclick=function(){var b=this;busy(b,1);aCall('saveMapAccess',$$('[data-ma]:checked:not(:disabled)').map(function(c){return c.dataset.ma})).then(function(r){busy(b,0);closeD();toast(r.changed?'บันทึกสิทธิ์ดูแผนที่แล้ว':'ไม่มีการเปลี่ยนแปลง')}).catch(function(e){busy(b,0);toast(e.message,1)})}
}).catch(function(e){$('#ov .cb').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function bMap(){if($('#mp-acc'))$('#mp-acc').onclick=mapAcc;var load=function(){$('#mp-ls').innerHTML='<div class="loading"><span class="spin"></span></div>';
    aCall('attMap',A.mpDate).then(function(d){A.mp=d;$('#mp-up').textContent='อัปเดต '+new Date().toTimeString().slice(0,5);drawMap()}).catch(function(e){if($('#mp-ls'))$('#mp-ls').innerHTML='<div class="alert" style="margin:12px">'+esc(e.message)+'</div>'})};
  $('#mp-date').onchange=function(){if(!this.value)return;A.mpDate=this.value;load()};
  $('#mp-dep').onchange=function(){A.mpDep=this.value;drawMap()};
  var qt;$('#mp-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){A.mpQ=v;drawMap()},200)};
  $('#mp-rl').onclick=load;
  loadLeaflet().then(function(){if(!$('#mp-map'))return;if(A.mpMap){try{A.mpMap.remove()}catch(e){}}
    var m=A.mpMap=L.map('mp-map',{zoomControl:true,attributionControl:true,maxZoom:22,zoomSnap:0,zoomDelta:1,wheelPxPerZoomLevel:14,wheelDebounceTime:60}).setView([13.7325,100.4955],12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:22,maxNativeZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(m);
    A.mpLayer=L.layerGroup().addTo(m);A.mpCl=null;A.mpFit=1;var zl=function(){var el=document.getElementById('mp-map');if(el)el.classList.toggle('z-lo',m.getZoom()<15)};m.on('zoomend',zl);zl();
    if(A.mp&&A.mp.date===A.mpDate)drawMap();else load()}).catch(function(e){$('#mp-map').innerHTML='<div class="alert" style="margin:16px">'+esc(e.message)+'</div>';load()})}
function mpRows(){var d=A.mp;if(!d)return [];var q=(A.mpQ||'').trim().toLowerCase();return d.people.filter(function(p){return (A.mpDep==='all'||p.dept===A.mpDep)&&(!q||(p.code+' '+p.name+' '+p.nickname).toLowerCase().indexOf(q)>=0)})}
function mpIni(p){var s=(p.nickname||p.name||'?').replace(/^\s+/,'');return s.slice(0,2)}
function drawMap(){var d=A.mp;if(!d||!$('#mp-ls'))return;var all=mpRows(),gps=all.filter(function(p){return p.lat!=null}),inA=all.filter(function(p){return p.in_area}),out=all.filter(function(p){return !p.in_area});
  var isT=d.date===dIso(new Date());$('#mp-ti').textContent=(isT?'เข้างานวันนี้':'เข้างาน '+dTxt(d.date,1))+' ('+all.length+')';$('#mp-gs').textContent=gps.length+' มี GPS · '+(all.length-gps.length)+' ไม่มี';
  var st=function(k,v,l,cls){return '<button data-mpf="'+k+'" aria-pressed="'+(A.mpF===k)+'"><b class="'+(cls||'')+'">'+v+'</b><span>'+l+'</span></button>'};
  $('#mp-st').innerHTML=st('in',inA.length,'ในพื้นที่')+st('out',out.length,'นอกพื้นที่','wr')+st('gps',gps.length,'มี GPS','ok')+st('all',all.length,'ทั้งหมด');
  var rows=A.mpF==='in'?inA:A.mpF==='out'?out:A.mpF==='gps'?gps:all;
  $('#mp-ls').innerHTML=rows.length?rows.map(function(p,i){return '<button class="amp-r" data-mpp="'+p.id+'"><span class="faint">'+(i+1)+'</span><span class="amp-av" style="border-color:'+xdColor2(p.dept)+'">'+(mpPhoto(p.id)?'<img src="'+esc(mpPhoto(p.id))+'" alt="" referrerpolicy="no-referrer" style="width:30px;height:30px">':'<span style="width:30px;height:30px;background:'+xdColor2(p.dept)+';color:#fff">'+esc(mpIni(p))+'</span>')+'</span><span class="amp-nm"><b>'+esc(p.name)+(p.nickname?' ('+esc(p.nickname)+')':'')+'</b><small>'+esc(p.dept_name||'—')+' '+(p.lat!=null?'<em class="g">GPS</em>':'<em>ไม่มี GPS</em>')+(p.in_area?'<em>'+esc(p.loc||'ในพื้นที่')+'</em>':'<em class="o">นอกพื้นที่</em>')+(p.adj?'<em>แก้โดย HR</em>':'')+'</small></span><b class="amp-t'+(p.in_area?'':' o')+'">'+esc(p.time)+'</b></button>'}).join(''):'<div class="rp-empty">ไม่มีรายการ</div>';
  $$('[data-mpf]').forEach(function(b){b.onclick=function(){A.mpF=b.dataset.mpf;drawMap()}});
  $$('[data-mpp]').forEach(function(b){b.onclick=function(){var p=d.people.filter(function(x){return x.id===b.dataset.mpp})[0];if(!p||p.lat==null||!A.mpMap){toast('ไม่มีพิกัด GPS ของรายการนี้',1);return}var mk=A.mpMk&&A.mpMk[p.id];if(mk&&A.mpCl){A.mpMap.flyTo([p.lat,p.lng],Math.max(A.mpMap.getZoom(),19),{duration:1.1});A.mpMap.once('moveend',function(){A.mpCl.zoomToShowLayer(mk,function(){mk.openPopup()})})}}});
  paintMap()}
function xdColor2(id){var d=A.d.org.departments.filter(function(x){return x.active!=='FALSE'}).map(function(x){return x.id}),i=d.indexOf(id);return i<0?'#9CA3AF':XD_C[i%XD_C.length]}
/* รูปโปรไฟล์ในหมุด: รูปในระบบ HR → รูป LINE → ตัวอักษร · โหลดรูปที่ยังไม่มีแล้ววาดหมุดใหม่ */
function mpPhoto(id){var u=PH[id];return u||(u===''?linePic(id):'')}
function mpPhotos(){var ids=(A.mp?A.mp.people:[]).map(function(p){return p.id}).filter(function(id){return !(id in PH)&&!PHask[id]});if(!ids.length)return;ids.forEach(function(id){PHask[id]=1});
  var n=0;for(var i=0;i<ids.length;i+=40)(function(b){n++;aCall('photosFor',b).then(function(m){b.forEach(function(id){PH[id]=m[id]||''})}).catch(function(){b.forEach(function(id){delete PHask[id]})}).then(function(){if(!--n)drawMap()})})(ids.slice(i,i+40))}
function paintMap(){var d=A.mp,m=A.mpMap;if(!d||!m||!A.mpLayer||!window.L||!L.markerClusterGroup)return;A.mpLayer.clearLayers();if(A.mpCl)m.removeLayer(A.mpCl);A.mpMk={};var ps=mpRows().filter(function(p){return p.lat!=null}),bounds=[];
  var pop=function(p){var g='https://www.google.com/maps?q='+p.lat+','+p.lng;return '<div class="amp-pop"><b>'+esc(p.name)+(p.nickname?' ('+esc(p.nickname)+')':'')+'</b><div>'+esc(p.dept_name||'—')+' · เข้า '+esc(p.time)+'</div><div>'+(p.in_area?'<em>'+esc(p.loc||'ในพื้นที่')+'</em>':'<em class="o">นอกพื้นที่</em>'+(p.dist?' ห่างจุดลงเวลา '+(p.dist>=1000?(p.dist/1000).toFixed(1)+' กม.':p.dist+' ม.'):''))+'</div><a href="'+g+'" target="_blank" rel="noopener">เปิดใน Google Maps ↗</a></div>'};
  d.sites.forEach(function(s){L.circle([s.lat,s.lng],{radius:s.radius,color:'#2F9A68',weight:1.5,opacity:.85,fillColor:'#4CB782',fillOpacity:.18,interactive:false}).addTo(A.mpLayer);bounds.push([s.lat,s.lng]);
    L.marker([s.lat+s.radius/111320,s.lng],{interactive:false,icon:L.divIcon({className:'',html:'<div class="amp-site"><span>'+esc(d.sites.length===1||/^push ?media$/i.test(s.name||'')?'สำนักงาน':(s.name||'สำนักงาน'))+'</span></div>',iconSize:[0,0]}),zIndexOffset:-500}).addTo(A.mpLayer)});
  var cl=A.mpCl=L.markerClusterGroup({animate:true,animateAddingMarkers:false,maxClusterRadius:function(z){return z>=19?28:60},spiderfyOnMaxZoom:true,showCoverageOnHover:false,zoomToBoundsOnClick:true});
  ps.forEach(function(p){bounds.push([p.lat,p.lng]);var u=mpPhoto(p.id),c=xdColor2(p.dept);
    var face=u?'<img src="'+esc(u)+'" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{textContent:this.dataset.i}))" data-i="'+esc(mpIni(p))+'">':'<span style="background:'+c+';color:#fff">'+esc(mpIni(p))+'</span>';
    var mk=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:'<div class="amp-pin" style="border-color:'+c+'">'+face+'<i class="'+(p.in_area?'':'o')+'"></i></div>',iconSize:[0,0]}),title:p.name}).bindPopup(pop(p),{closeButton:false,offset:[0,-16]});
    cl.addLayer(mk);A.mpMk[p.id]=mk});
  m.addLayer(cl);
  if(A.mpFit&&bounds.length){A.mpFit=0;try{m.flyToBounds(bounds,{padding:[40,40],maxZoom:15,duration:1})}catch(e){}}mpPhotos()}

/* ───────── บันทึก error ของระบบ (29 ต.ค. 2569 · เฉพาะผู้ดูแลระบบ) ─────────
   ข้อมูลจาก Worker ตาราง _errors (เวลา · คำสั่ง · ข้อความ · ใครเจอ · แอป · ชนิด · บรรทัดโค้ดเมื่อเป็นบั๊ก) + _err_notes (สถานะการแก้ไขรายกลุ่ม)
   รวมกลุ่มตาม คำสั่ง + ข้อความ (ตัวเลขในข้อความถือเป็นตัวเดียวกัน) · เก็บ 60 วัน */
var EK={bug:['บั๊กในระบบ','b-bad','โค้ดทำงานผิดพลาด (เช่น TypeError) · ควรแก้'],crash:['ระบบขัดข้อง','b-bad','Worker ล้มทั้งคำสั่ง · ควรตรวจทันที'],auth:['สิทธิ์ / หมดเวลา','b-mute','หมดเวลาเข้าสู่ระบบหรือไม่มีสิทธิ์ · ปกติไม่ใช่บั๊ก'],user:['เงื่อนไข / กรอกข้อมูล','b-warn','ข้อมูลไม่ผ่านเงื่อนไข (เช่น ไม่ใส่เหตุผล) · ถ้าเกิดบ่อยอาจต้องปรับหน้าจอให้ชัดขึ้น'],fail:['ไม่สำเร็จ','b-mute','บันทึกแบบเดิม (ก่อน 29 ต.ค.)']};
var ES={open:['ยังไม่ตรวจ','b-warn'],watch:['กำลังติดตาม','b-info'],fixed:['แก้แล้ว','b-ok'],ignore:['ไม่ต้องแก้','b-mute']};
function errKey(x){return x.fn+'|'+String(x.msg||'').replace(/\d+/g,'#')}
function vErr(){A.erDays=A.erDays||7;A.erK=A.erK||'all';A.erS=A.erS||'all';A.erQ=A.erQ||'';
  var rg=function(v,l){return '<button data-erd="'+v+'" aria-pressed="'+(A.erDays===v)+'">'+l+'</button>'};
  return '<div class="ph"><div><h1>บันทึก error ของระบบ</h1><div class="sub">เฉพาะผู้ดูแลระบบ · ใช้วิเคราะห์ปัญหาและติดตามการแก้ไข · เก็บย้อนหลัง 60 วัน · ไม่เก็บข้อมูลที่ผู้ใช้ส่งมา</div></div><span class="sp"></span>'+
   '<div class="segt">'+rg(1,'24 ชม.')+rg(7,'7 วัน')+rg(30,'30 วัน')+rg(60,'60 วัน')+'</div><button class="btn" id="er-re">รีเฟรช</button></div><div id="er-body"><div class="loading"><span class="spin"></span>กำลังโหลด…</div></div>'}
function bErr(){var load=function(){$('#er-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังโหลด…</div>';
    aCall('errorLog',A.erDays).then(function(d){A.er=d;drawErr()}).catch(function(e){if($('#er-body'))$('#er-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $$('[data-erd]').forEach(function(b){b.onclick=function(){A.erDays=+b.dataset.erd;$$('[data-erd]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});load()}});
  $('#er-re').onclick=function(){fxArm('errlog');load()};A.erLoad=load;load()}
function errGroups(){var d=A.er,N={},G={},out=[];(d.notes||[]).forEach(function(n){N[n.k]=n});
  d.rows.forEach(function(x){var k=errKey(x),g=G[k];if(!g){g=G[k]={k:k,fn:x.fn,msg:x.msg,kind:x.kind,n:0,who:{},apps:{},last:x.at,first:x.at,rows:[],days:{}};out.push(g)}
    g.n++;g.first=x.at;g.rows.push(x);if(x.who)g.who[x.who]=1;if(x.client)g.apps[x.client.split(' · ')[0]]=1;g.days[x.at.slice(0,10)]=(g.days[x.at.slice(0,10)]||0)+1;if(x.kind==='bug'||x.kind==='crash')g.kind=x.kind});
  out.forEach(function(g){var n=N[g.k];g.status=n?n.status:'open';g.note=n?n.note:'';g.nby=n?n.by:'';g.nat=n?n.at:'';
    if(g.status==='fixed'&&g.last>g.nat)g.again=1});   // แก้แล้วแต่เกิดซ้ำหลังบันทึก → เตือน
  return out}
function drawErr(){var d=A.er;if(!d||!$('#er-body'))return;var gs=errGroups(),q=(A.erQ||'').trim().toLowerCase();
  var cnt=function(f){return d.rows.filter(f).length},bugs=cnt(function(x){return x.kind==='bug'||x.kind==='crash'});
  var open=gs.filter(function(g){return (g.kind==='bug'||g.kind==='crash')&&(g.status==='open'||g.again)}).length;
  var kpi=function(l,v,sub,cls){return '<div class="kpi"><span class="l">'+l+'</span><span class="v num '+(cls||'')+'">'+v+'</span><span class="d">'+(sub||'&nbsp;')+'</span></div>'};
  var rows=gs.filter(function(g){return (A.erK==='all'||g.kind===A.erK||(A.erK==='bug'&&g.kind==='crash'))&&(A.erS==='all'||g.status===A.erS||(A.erS==='open'&&g.again))&&(!q||(g.fn+' '+g.msg+' '+Object.keys(g.who).join(' ')).toLowerCase().indexOf(q)>=0)})
    .sort(function(a,b){var pa=(a.kind==='bug'||a.kind==='crash')&&a.status!=='fixed'&&a.status!=='ignore'?0:1,pb=(b.kind==='bug'||b.kind==='crash')&&b.status!=='fixed'&&b.status!=='ignore'?0:1;return pa-pb||(a.last<b.last?1:-1)});
  var chip=function(attr,v,l,cur){return '<button class="chip" data-'+attr+'="'+v+'" aria-pressed="'+(cur===v)+'">'+l+'</button>'};
  var dd=[],t=dObj(dIso(new Date()));for(var i=Math.min(A.erDays,30)-1;i>=0;i--){var x=new Date(t);x.setDate(x.getDate()-i);dd.push(dIso(x))}
  var spark=function(g){var m=Math.max.apply(0,dd.map(function(s){return g.days[s]||0}).concat([1]));return '<span class="er-sp">'+dd.map(function(s){var v=g.days[s]||0;return '<i style="height:'+(v?Math.max(3,Math.round(v/m*18)):1)+'px'+(v?'':';opacity:.25')+'" title="'+dTxt(s)+' · '+v+' ครั้ง"></i>'}).join('')+'</span>'};
  $('#er-body').innerHTML='<div class="grid g4" style="grid-template-columns:repeat(5,minmax(0,1fr))">'+kpi('ทั้งหมด',d.rows.length,gs.length+' กลุ่ม')+kpi('บั๊ก / ระบบขัดข้อง',bugs,'ควรแก้',bugs?'bad':'')+
    kpi('เงื่อนไข / กรอกข้อมูล',cnt(function(x){return x.kind==='user'}),'ผู้ใช้กรอกไม่ผ่าน',cnt(function(x){return x.kind==='user'})?'warn':'')+kpi('สิทธิ์ / หมดเวลา',cnt(function(x){return x.kind==='auth'}),'ปกติไม่ใช่บั๊ก')+kpi('บั๊กที่ยังไม่แก้',open,'กลุ่ม',open?'bad':'ok')+'</div>'+
   '<div class="toolbar" style="margin-top:14px">'+chip('erk','all','ทุกชนิด',A.erK)+chip('erk','bug','บั๊ก / ขัดข้อง',A.erK)+chip('erk','user','เงื่อนไข / กรอกข้อมูล',A.erK)+chip('erk','auth','สิทธิ์ / หมดเวลา',A.erK)+
    '<span style="width:10px"></span>'+chip('ers','all','ทุกสถานะ',A.erS)+chip('ers','open','ยังไม่ตรวจ',A.erS)+chip('ers','watch','กำลังติดตาม',A.erS)+chip('ers','fixed','แก้แล้ว',A.erS)+chip('ers','ignore','ไม่ต้องแก้',A.erS)+
    '<span class="sp"></span><input type="search" id="er-q" class="amp-in" placeholder="ค้นหา คำสั่ง / ข้อความ / รหัสพนักงาน" value="'+esc(A.erQ)+'" style="width:260px"></div>'+
   '<section class="card"><div class="tw"><table class="xd-t er-t"><thead><tr><th>สถานะ</th><th>ชนิด</th><th>คำสั่ง</th><th>ข้อความ</th><th class="num">ครั้ง</th><th class="num">คน</th><th>'+Math.min(A.erDays,30)+' วันล่าสุด</th><th>ล่าสุด</th><th>แอป</th></tr></thead><tbody>'+
   (rows.length?rows.map(function(g,i){var s=ES[g.status]||ES.open,k=EK[g.kind]||EK.user;return '<tr class="ck" data-erg="'+i+'"><td><span class="badge '+s[1]+'">'+s[0]+'</span>'+(g.again?' <span class="badge b-bad" title="บันทึกว่าแก้แล้ว แต่เกิดซ้ำหลังจากนั้น">เกิดซ้ำ</span>':'')+'</td><td><span class="badge '+k[1]+'">'+k[0]+'</span></td><td class="mono">'+esc(g.fn)+'</td><td style="white-space:normal;max-width:420px">'+esc(g.msg)+(g.note?'<div class="faint" style="font-size:12px">📝 '+esc(g.note)+'</div>':'')+'</td><td class="num"><b>'+g.n+'</b></td><td class="num">'+Object.keys(g.who).length+'</td><td>'+spark(g)+'</td><td class="num">'+esc(g.last.slice(5,16))+'</td><td>'+esc(Object.keys(g.apps).join(', ')||'—')+'</td></tr>'}).join(''):'<tr><td colspan="9" class="rp-empty">'+(d.rows.length?'ไม่พบตามตัวกรอง':'ไม่มี error ในช่วงนี้ 🎉')+'</td></tr>')+'</tbody></table></div></section>'+
   '<div class="faint" style="font-size:12.5px;margin-top:10px">เรียง: บั๊กที่ยังไม่แก้ขึ้นก่อน · คลิกแถวเพื่อดูรายละเอียดแต่ละครั้ง (ใครเจอ · แอป · บรรทัดโค้ด) และบันทึกสถานะการแก้ไข · "เกิดซ้ำ" = เคยบันทึกว่าแก้แล้วแต่ยังเกิดหลังจากนั้น</div>';
  A.erRows=rows;
  $$('[data-erk]').forEach(function(b){b.onclick=function(){A.erK=b.dataset.erk;drawErr()}});$$('[data-ers]').forEach(function(b){b.onclick=function(){A.erS=b.dataset.ers;drawErr()}});
  var qt;$('#er-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){A.erQ=v;drawErr();var e=$('#er-q');if(e){e.focus();e.setSelectionRange(v.length,v.length)}},250)};
  $$('[data-erg]').forEach(function(r){r.onclick=function(){errDetail(A.erRows[+r.dataset.erg])}})}
function errDetail(g){var k=EK[g.kind]||EK.user,who=Object.keys(g.who);
  var occ=g.rows.slice(0,100).map(function(x){var w=String(x.who||'').split('|');return '<tr><td class="num">'+esc(x.at.slice(5,19))+'</td><td>'+(x.who?esc(w[0])+' <span class="faint">'+esc(w[1]||'')+'</span>':'<span class="faint">—</span>')+'</td><td>'+esc(x.client||'—')+'</td></tr>'+(x.stack?'<tr><td colspan="3"><code class="er-st">'+esc((x.name?x.name+': ':'')+x.stack)+'</code></td></tr>':'')}).join('');
  drawer('รายละเอียด error','<div style="display:flex;flex-direction:column;gap:12px">'+
    '<div><span class="badge '+k[1]+'">'+k[0]+'</span> <span class="mono">'+esc(g.fn)+'</span><div style="font-size:15px;font-weight:600;margin-top:6px">'+esc(g.msg)+'</div><div class="faint" style="font-size:12.5px;margin-top:4px">'+esc(k[2])+'</div></div>'+
    '<div class="er-kv"><div><small>จำนวนครั้ง</small><b>'+g.n+'</b></div><div><small>ผู้ใช้ที่เจอ</small><b>'+who.length+'</b></div><div><small>ครั้งแรก (ในช่วง)</small><b>'+esc(g.first.slice(5,16))+'</b></div><div><small>ล่าสุด</small><b>'+esc(g.last.slice(5,16))+'</b></div></div>'+
    (who.length?'<div><small class="faint">ผู้ใช้ที่เจอ (รหัสพนักงาน · บทบาท)</small><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">'+who.slice(0,40).map(function(w){var p=w.split('|');return '<span class="badge b-mute">'+esc(p[0])+' · '+esc(p[1]||'')+'</span>'}).join('')+'</div></div>':'')+
    '<div><small class="faint">แต่ละครั้ง (ล่าสุด 100 ครั้ง)</small><div class="tw" style="max-height:260px;overflow:auto"><table class="xd-t"><thead><tr><th>เวลา</th><th>ใคร</th><th>แอป</th></tr></thead><tbody>'+occ+'</tbody></table></div></div>'+
    '<label class="f"><span>สถานะการแก้ไข</span><select id="er-st">'+Object.keys(ES).map(function(s){return '<option value="'+s+'"'+(g.status===s?' selected':'')+'>'+ES[s][0]+'</option>'}).join('')+'</select></label>'+
    '<label class="f"><span>บันทึก / สาเหตุ / วิธีแก้</span><textarea id="er-note" rows="3" maxlength="500" placeholder="เช่น สาเหตุ · แก้ใน cf-3.35 · รอผู้ใช้ทดสอบ">'+esc(g.note||'')+'</textarea>'+(g.nby?'<span class="h">บันทึกล่าสุดโดย '+esc(g.nby)+' · '+esc(g.nat)+'</span>':'')+'</label></div>',
    '<button class="btn pri" id="er-sv">บันทึกสถานะ</button>');
  $('#er-sv').onclick=function(){var b=this;busy(b,1);aCall('errorNote',g.k,$('#er-st').value,$('#er-note').value.trim()).then(function(){busy(b,0);closeD();toast('บันทึกสถานะแล้ว');A.erLoad&&A.erLoad()}).catch(function(e){busy(b,0);toast(e.message,1)})}}

