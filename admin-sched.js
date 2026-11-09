/* หลังบ้าน (admin.html) · ตารางงาน (planner) · Confirmed
 * แยกจากสคริปต์ในหน้า admin.html 31 ต.ค. 2569 (ปรับโครงสร้างขั้น 5 · ย้ายทั้งก้อนตามลำดับเดิม ไม่แก้เนื้อ)
 * ทุกไฟล์ admin-*.js ใช้ชื่อร่วมกัน (global) และต้องโหลดตามลำดับใน admin.html */
'use strict';
/* ───────── ตารางงาน = หน้าเว็บ Workforce Task Manager เดิมทั้งชุด (planner.html · สร้างด้วย app/tools/build-planner.mjs · หลังบ้าน app/gas/schedule/Wtm.js) ───────── */
var PLANNER_V='dp1109a';   // เลขรุ่นหน้า planner.html (build-planner.mjs ตั้งให้ทุกครั้ง · กันเบราว์เซอร์จำหน้าเก่า)
function vConf(){return '<iframe class="plf" src="planner.html?desktop=1&page=confirmed'+(A.fx==='conf'||A.fx==='*'?'&fx=1':'')+'&v='+PLANNER_V+'" title="Confirmed"></iframe>'}
function vPlanner(){return '<iframe class="plf" src="planner.html?desktop=1'+(A.fx==='sched'||A.fx==='*'?'&fx=1':'')+'&v='+PLANNER_V+'" title="ตารางงาน" allow="geolocation"></iframe>'}
/* (เดิม) ตารางงานช่วง 1 ที่เขียนใหม่ — ไม่ได้ใช้แล้ว เก็บไว้อ้างอิง */
var THD=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
function isoAdd(d,n){var x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2)}
function locISO(){var x=new Date();return x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2)+'-'+('0'+x.getDate()).slice(-2)}
function wkStart(d){d=d||locISO();return isoAdd(d,-new Date(d+'T12:00:00').getDay())}
function sdRange(a,b){var A1=new Date(a+'T12:00:00'),B1=new Date(b+'T12:00:00');return A1.getDate()+' '+THM[A1.getMonth()]+' – '+B1.getDate()+' '+THM[B1.getMonth()]+' '+String(B1.getFullYear()+543).slice(-2)}
function loadSched(){var w=A.sw;aCall('scheduleWeek',w).then(function(d){if(A.sw!==w)return;A.sd=d;if(A.view==='sched')drawSched()}).catch(function(e){if($('#sc-body'))$('#sc-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function jobOn(j,dt){return j.date_from<=dt&&j.date_to>=dt}
function pcell(d,dt,id,slot){var p=d.people[id]||{},a=(d.att[dt]||{})[id],l=(d.leave[dt]||{})[id],cls='',t='';
  if(l&&l.part==='full')cls='lv';else if(a&&a.in){cls=a.late?'late':'ok';t=a.in}else if(dt===d.today&&a&&A.satt&&['not_yet','absent'].indexOf(a.st)>=0)cls='no';
  if(!A.satt&&cls!=='lv')cls='';
  return '<td class="pc '+cls+'"><div><span class="av" data-av="'+esc(id)+'" style="width:32px;height:32px">'+esc((p.nick||'?')[0])+'</span><span class="pt"><b>'+esc(p.nick||'—')+(A.satt&&t?' <i>'+esc(t)+'</i>':'')+(l?' <i class="lvt">'+(l.part==='full'?'ลา':l.part==='am'?'ลาเช้า':'ลาบ่าย')+'</i>':'')+'</b><small>'+esc(p.pos||'')+'</small></span></div></td>'}
function drawSched(){var b=$('#sc-body'),d=A.sd;if(!b||!d)return;
  var depts=A.d.org.departments,teams=A.d.org.teams,tn=function(id){return org('teams',id)},dn=function(id){return org('departments',id)};
  var all=d.jobs.filter(function(j){return (A.sdp==='all'||j.dept_id===A.sdp)&&(A.stm==='all'||j.team_id===A.stm)});
  var cnt={all:all.length,pm:all.filter(function(j){return j.pm_code}).length};cnt.nopm=cnt.all-cnt.pm;
  var jobs=all.filter(function(j){return A.sf==='all'||(A.sf==='pm'?!!j.pm_code:!j.pm_code)});
  $('#sc-sub').textContent=sdRange(d.from,d.to)+' · '+cnt.all+' งาน'+(isHR()?'':' · ขอบเขต: '+scopeTxt(d.sched!=='none'?'sched':'att'));
  var vplate=function(id){var v=d.vehicles.filter(function(x){return x.id===id})[0];return v?v.plate:''};
  var pill=function(attr,txt,on,dis){return '<button class="scbtn'+(on?' on':'')+'"'+attr+(dis?' disabled title="ช่วง 2"':'')+'>'+txt+'</button>'};
  var deptOpts=depts.filter(function(x){return x.active!=='FALSE'&&d.jobs.some(function(j){return j.dept_id===x.id})});
  var teamOpts=teams.filter(function(x){return x.active!=='FALSE'&&(A.sdp==='all'||x.department_id===A.sdp)&&d.jobs.some(function(j){return j.team_id===x.id})});
  var h='<div class="sctb">'+pill(' data-sw="-7"','‹')+'<span class="scbtn rng">'+ic('cal')+sdRange(d.from,d.to)+'</span>'+pill(' data-sw="7"','›')+pill(' data-sw="0"','สัปดาห์นี้',false)+
   '<span class="scg"></span>'+pill('','☰ รายการ',true)+pill('','ตาราง',false,1)+pill('','รายชื่อทีม',false,1)+pill('','ตามช่าง',false,1)+pill(' id="sc-att"',ic('clock')+'เวลาเข้างาน',A.satt)+
   '<span class="sp"></span>'+(d.canVehicles?pill(' id="sc-veh"','รถบริษัท'):'')+(d.sched!=='none'?'<button class="btn pri" id="sc-add">+ เพิ่มงาน</button>':'')+'</div>'+
   '<div class="sctb">'+pill(' data-sf="all"','ทั้งหมด <b>'+cnt.all+'</b>',A.sf==='all')+pill(' data-sf="pm"','✓ ผูก PM แล้ว <b>'+cnt.pm+'</b>',A.sf==='pm')+pill(' data-sf="nopm"','⚠ ยังไม่ผูก <b>'+cnt.nopm+'</b>',A.sf==='nopm')+
   (deptOpts.length>1?'<select id="sc-dp" class="scsel"><option value="all">ทุกแผนก</option>'+deptOpts.map(function(x){return '<option value="'+x.id+'"'+(A.sdp===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':'')+
   (teamOpts.length>1?'<select id="sc-tm" class="scsel"><option value="all">ทุกทีม</option>'+teamOpts.map(function(x){return '<option value="'+x.id+'"'+(A.stm===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':'')+'</div>';
  h+='<div class="tw scw"><table class="sct"><thead><tr><th class="cd">วันที่</th><th class="ct">ทีม</th><th class="cj">โครงการ / หน้างาน</th><th class="cv">รถ</th><th>คนที่ 1</th><th>คนที่ 2</th><th>คนที่ 3</th><th>คนที่ 4</th><th>คนที่ 5</th><th class="cc">ค่าใช้จ่าย</th></tr></thead><tbody>';
  d.dates.forEach(function(dt){var dj=jobs.filter(function(j){return jobOn(j,dt)}),D=new Date(dt+'T12:00:00'),isT=dt===d.today;
    var dcell='<td class="cd'+(isT?' td':'')+'" rowspan="'+Math.max(1,dj.length)+'"><div class="dbx"><b>'+D.getDate()+'</b><span>'+THD[D.getDay()]+'</span></div><small>'+THM[D.getMonth()]+' '+String(D.getFullYear()+543).slice(-2)+'</small></td>';
    if(!dj.length){h+='<tr class="dst">'+dcell+'<td colspan="9" class="emp"><span class="faint">ไม่มีงาน</span>'+(d.sched!=='none'?' <button class="scbtn" data-addon="'+dt+'">+ เพิ่มงาน</button>':'')+'</td></tr>';return}
    var groups={},order=[];dj.forEach(function(j){var k=j.team_id||('d:'+j.dept_id);if(!groups[k]){groups[k]=[];order.push(k)}groups[k].push(j)});
    order.sort(function(a,b){var na=a.indexOf('d:')===0?dn(a.slice(2)):tn(a),nb=b.indexOf('d:')===0?dn(b.slice(2)):tn(b);return na<nb?-1:1});
    var first=true;order.forEach(function(k,gi){var g=groups[k].sort(function(a,b){return a.sort-b.sort}),nm=k.indexOf('d:')===0?dn(k.slice(2)):tn(k);
      g.forEach(function(j,i){var ppl=(j.people[dt]||[]),hw=j.daily_workers.filter(function(w){return dt<isoAdd(j.date_from,w.days||1)}),items=ppl.map(function(p){return pcell(d,dt,p.employee_id)}).concat(hw.map(function(w){return '<td class="pc hire"><div><span class="hav">จ้าง</span><span class="pt"><b>'+esc(w.name)+'</b><small>'+Number(w.wage||0).toLocaleString()+'฿ · '+(w.days||1)+' วัน</small></span></div></td>'})),cells='';
        if(items.length>5){items=items.slice(0,4).concat(['<td class="pc"><div class="pe more">+'+(items.length-4)+' คน</div></td>'])}
        for(var s=0;s<5;s++)cells+=items[s]||'<td class="pc"><div class="pe">'+(j.can_edit?'+':'')+'</div></td>';
        var bl=(j.base||[]).join(),chg=j.base&&j.base.length&&j.date_from!==j.date_to&&ppl.map(function(p){return p.employee_id}).join()!==bl,cst=(j.costs||{})[dt]||{total:0};
        h+='<tr class="jr'+(first?' dst':'')+(i===0&&gi>0?' tst':'')+'" data-job="'+esc(j.id)+'">'+(first?dcell:'')+(i===0?'<td class="ct" rowspan="'+g.length+'"><b>'+esc(nm||'—')+'</b> <span class="n">'+g.length+'</span></td>':'')+
          '<td class="cj"><b>'+esc(j.title)+'</b><div class="tg">'+(j.shift==='night'?'<span class="t nt">☾ กะดึก</span>':'')+(j.province?'<span class="t pv">ต่างจังหวัด</span>':'')+(chg?'<span class="t ch">คนเปลี่ยน</span>':'')+(j.pm_code?'<span class="t pm">'+esc(j.pm_code)+'</span>':'<span class="t np">ยังไม่ผูก PM</span>')+'<span class="faint">'+esc(j.site_name||'')+'</span></div></td>'+
          '<td class="cv">'+(j.vehicle_ids.length?'<span class="car">'+esc(vplate(j.vehicle_ids[0]))+(j.vehicle_ids.length>1?' <i>+'+(j.vehicle_ids.length-1)+'</i>':'')+'</span>':'<span class="faint">'+(j.can_edit?'+ รถ':'—')+'</span>')+'</td>'+cells+
          '<td class="cc"'+(cst.total?' title="'+esc([cst.hol?'วันหยุด '+cst.hol.toLocaleString():'',cst.prov?'ต่างจังหวัด '+cst.prov.toLocaleString():'',cst.hire?'จ้างรายวัน '+cst.hire.toLocaleString():'',cst.extra?'อื่น ๆ '+cst.extra.toLocaleString():''].filter(String).join(' + '))+'"':'')+'>'+(cst.total?'<b>'+cst.total.toLocaleString()+'฿</b><small>'+esc([cst.hol?'วันหยุด':'',cst.prov?'ต่างจังหวัด':'',cst.hire?'จ้าง':'',cst.extra?'อื่น ๆ':''].filter(String).join(' + '))+'</small>':'<span class="faint">—</span>')+'</td></tr>';first=false})})});
  h+='</tbody></table></div><div class="sclg"><span><i class="ok"></i>เข้างานแล้ว (เวลา)</span><span><i class="late"></i>สาย</span><span><i class="no"></i>ยังไม่ลงเวลา (วันนี้)</span><span><i class="lv"></i>ลา</span></div>';
  b.innerHTML=h;
  $$('[data-sw]').forEach(function(x){x.onclick=function(){var n=+x.dataset.sw;A.sw=n?isoAdd(A.sw,n):wkStart();b.innerHTML='<div class="loading"><span class="spin"></span>กำลังโหลด…</div>';loadSched()}});
  $$('[data-sf]').forEach(function(x){x.onclick=function(){A.sf=x.dataset.sf;drawSched()}});
  if($('#sc-dp'))$('#sc-dp').onchange=function(){A.sdp=this.value;A.stm='all';drawSched()};if($('#sc-tm'))$('#sc-tm').onchange=function(){A.stm=this.value;drawSched()};
  $('#sc-att').onclick=function(){A.satt=!A.satt;drawSched()};
  if($('#sc-add'))$('#sc-add').onclick=function(){jobForm(null,d.today>=d.from&&d.today<=d.to?d.today:d.from)};
  $$('[data-addon]').forEach(function(x){x.onclick=function(){jobForm(null,x.dataset.addon)}});
  if($('#sc-veh'))$('#sc-veh').onclick=vehDrawer;
  $$('tr.jr').forEach(function(tr){tr.onclick=function(){var j=d.jobs.filter(function(x){return x.id===tr.dataset.job})[0];if(j)jobForm(j)}});
  loadPhotos()}
function jobForm(j,day){var d=A.sd,ed=!j||j.can_edit,v=j||{title:'',pm_code:'',site_name:'',site_id:'',date_from:day,date_to:day,dept_id:A.d.me.department_id||'',team_id:A.d.me.team_id||'',shift:'day',vehicle_ids:[],cost:'',note:'',people:{}};
  var ppl=j?((j.base&&j.base.length?j.base:(j.people[j.date_from]||[]).map(function(p){return p.employee_id}))):[],byD={};
  if(j)Object.keys(j.people).forEach(function(dt){var l=j.people[dt].map(function(p){return p.employee_id});if(l.join()!==ppl.join())byD[dt]=l});
  var depts=A.d.org.departments.filter(function(x){return x.active!=='FALSE'&&(isHR()||d.sched==='all'||x.id===A.d.me.department_id)});
  var F={ppl:ppl.slice(),byD:byD,tab:'all',veh:v.vehicle_ids.slice(),shift:v.shift,prov:!!v.province,hire:(v.daily_workers||[]).map(function(w){return {name:w.name,days:w.days,wage:w.wage}})};
  var cur=function(){return F.tab==='all'?F.ppl:F.byD[F.tab]||F.ppl};
  var dis=ed?'':' disabled';
  var box=function(n,t,inner){return '<div class="dfs"><h4><span class="n">'+n+'</span>'+t+'</h4><div class="dfg">'+inner+'</div></div>'};
  var f=function(k,l,inner,sp,h){return '<label class="f'+(sp?' s'+sp:'')+'" id="jf-'+k+'"><span>'+l+'</span>'+inner+(h?'<span class="h">'+h+'</span>':'')+'</label>'};
  var teamSel=function(){var t=A.d.org.teams.filter(function(x){return x.active!=='FALSE'&&x.department_id===$('#j-dept').value&&(isHR()||d.sched!=='team'||x.id===A.d.me.team_id)});return '<option value="">— ทั้งแผนก —</option>'+t.map(function(x){return '<option value="'+x.id+'"'+(v.team_id===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')};
  var body=box(1,'งาน',f('title','ชื่องาน / โครงการ *','<input id="j-title" value="'+esc(v.title)+'"'+dis+'>')+f('pm_code','เลขโครงการ PM','<input id="j-pm" value="'+esc(v.pm_code)+'" placeholder="เช่น PM264366"'+dis+'>',3,'ไม่บังคับ · ว่าง = "ยังไม่ผูก PM"')+f('site_name','รายละเอียดหน้างาน','<input id="j-sn" value="'+esc(v.site_name)+'"'+dis+'>',3)+
     f('site_id','สถานที่ (ใช้ตรวจพิกัดตอนลงเวลา)','<select id="j-site"'+dis+'><option value="">— ไม่ระบุ —</option>'+d.sites.map(function(x){return '<option value="'+x.id+'"'+(v.site_id===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>',0,'เพิ่มจุดใหม่ได้ที่ โครงสร้าง › จุดลงเวลา'))+
    box(2,'วันและทีม',f('date_from','วันที่เริ่ม *','<input type="date" id="j-from" value="'+esc(v.date_from)+'"'+dis+'>',3)+f('date_to','ถึงวันที่','<input type="date" id="j-to" value="'+esc(v.date_to)+'"'+dis+'>',3,'งานหลายวัน: เปลี่ยนคนรายวันได้ที่หมวด คนและรถ')+
     f('dept_id','แผนก *','<select id="j-dept"'+dis+'>'+depts.map(function(x){return '<option value="'+x.id+'"'+(v.dept_id===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>',3)+f('team_id','ทีม','<select id="j-team"'+dis+'></select>',3)+
     '<div class="f s3"><span>กะ</span><span class="chips"><button type="button" data-jsh="day" aria-pressed="'+(v.shift!=='night')+'"'+dis+'>กลางวัน</button><button type="button" data-jsh="night" aria-pressed="'+(v.shift==='night')+'"'+dis+'>☾ กะดึก</button></span></div>'+
     '<label class="f s3 prv"><span>งานต่างจังหวัด</span><span class="tgl"><input type="checkbox" id="j-prov"'+(v.province?' checked':'')+dis+'><i></i><small>คิด '+d.rates.prov+' ฿/คน/วัน</small></span></label>')+
    box(3,'คนและรถ','<div class="f" id="jf-people"><span>คนที่ไปงาน (สูงสุด 5 คนต่อวัน)</span><div id="j-tabs" class="dtabs"></div><div id="j-ppl"></div>'+(ed?'<select id="j-add" style="margin-top:6px"></select>':'')+'</div>'+
     '<div class="f" id="jf-daily_workers"><span>จ้างรายวัน / ผู้รับเหมา</span><div id="j-hire"></div>'+(ed?'<button type="button" class="btn sm" id="j-hadd" style="align-self:flex-start;margin-top:4px">+ เพิ่มคนจ้างรายวัน</button>':'')+'<span class="h">ค่าจ้างคิดครั้งเดียวในวันแรกของงาน · แสดงในช่องคนสีม่วง</span></div>'+
     '<div class="f"><span>รถ</span><span class="chips" id="j-veh">'+(d.vehicles.length?d.vehicles.map(function(x){return '<button type="button" data-jv="'+x.id+'" aria-pressed="'+(F.veh.indexOf(x.id)>=0)+'"'+dis+'>'+esc(x.plate)+'</button>'}).join(''):'<span class="faint" style="font-size:13px">ยังไม่มีรถในระบบ'+(d.canVehicles?' · เพิ่มที่ปุ่ม "รถบริษัท"':'')+'</span>')+'</span></div>'+
     f('cost','ค่าใช้จ่ายอื่น (บาท · ไม่บังคับ)','<input id="j-cost" inputmode="decimal" value="'+esc(v.cost||'')+'"'+dis+'>',3,'ค่าทางด่วน ฯลฯ · คิดวันแรกของงาน')+f('note','หมายเหตุ','<textarea id="j-note" rows="2"'+dis+'>'+esc(v.note)+'</textarea>'))+
    box(4,'ค่าใช้จ่าย (คำนวณอัตโนมัติ)','<div class="f" id="j-costv"></div>');
  drawer(j?(ed?'แก้ไขงาน '+(j.job_no||''):'รายละเอียดงาน '+(j.job_no||'')):'เพิ่มงาน',body,ed?(j?'<button class="btn bad" id="j-del">ลบงาน</button>':'')+'<button class="btn" id="j-x">ยกเลิก</button><button class="btn pri" id="j-ok">บันทึกงาน</button>':'<button class="btn" id="j-x">ปิด</button>');
  $('.drw').classList.add('wide');$('#j-x').onclick=closeD;
  var tsel=function(){$('#j-team').innerHTML=teamSel()};tsel();$('#j-dept').onchange=function(){v.team_id='';tsel()};
  $$('[data-jsh]').forEach(function(x){x.onclick=function(){F.shift=x.dataset.jsh;$$('[data-jsh]').forEach(function(y){y.setAttribute('aria-pressed',y===x)})}});
  $$('[data-jv]').forEach(function(x){x.onclick=function(){var i=F.veh.indexOf(x.dataset.jv);if(i>=0)F.veh.splice(i,1);else F.veh.push(x.dataset.jv);x.setAttribute('aria-pressed',i<0)}});
  var pinfo=function(id){var p=d.pool.filter(function(x){return x.id===id})[0]||d.people[id]||{};return p};
  var warn=function(id){var from=$('#j-from').value,to=$('#j-to').value||from,w=[];if(!from)return '';
    for(var dt=from;dt<=to&&w.length<3;dt=isoAdd(dt,1)){var l=(d.leave[dt]||{})[id];if(l)w.push('ลา '+new Date(dt+'T12:00:00').getDate()+' '+THM[new Date(dt+'T12:00:00').getMonth()]+(l.st==='wait'?' (รออนุมัติ)':''));
      var o=d.jobs.filter(function(x){return (!j||x.id!==j.id)&&jobOn(x,dt)&&(x.people[dt]||[]).some(function(p){return p.employee_id===id})})[0];if(o)w.push('มีงาน "'+o.title+'" '+new Date(dt+'T12:00:00').getDate()+' '+THM[new Date(dt+'T12:00:00').getMonth()])}
    return w.join(' · ')};
  var drawP=function(){var from=$('#j-from').value,to=$('#j-to').value||from,days=[];for(var x=from;x&&x<=to&&days.length<31;x=isoAdd(x,1))days.push(x);
    Object.keys(F.byD).forEach(function(k){if(days.indexOf(k)<0)delete F.byD[k]});if(F.tab!=='all'&&days.indexOf(F.tab)<0)F.tab='all';
    $('#j-tabs').innerHTML=days.length>1?'<button type="button" data-jt="all" aria-pressed="'+(F.tab==='all')+'">ทุกวัน</button>'+days.map(function(x){var D1=new Date(x+'T12:00:00');return '<button type="button" data-jt="'+x+'" aria-pressed="'+(F.tab===x)+'">'+THD[D1.getDay()]+' '+D1.getDate()+(F.byD[x]?' •':'')+'</button>'}).join('')+(F.tab!=='all'&&F.byD[F.tab]&&ed?'<button type="button" class="rst" id="j-rst">ใช้ชุดหลัก</button>':'')+'<div class="h" style="width:100%">'+(F.tab==='all'?'"ทุกวัน" = คนชุดหลัก · เลือกวันเพื่อเปลี่ยนคนเฉพาะวันนั้น (• = วันที่คนต่างจากชุดหลัก)':'กำลังแก้คนเฉพาะ '+THD[new Date(F.tab+'T12:00:00').getDay()]+' '+new Date(F.tab+'T12:00:00').getDate()+' '+THM[new Date(F.tab+'T12:00:00').getMonth()])+'</div>':'';
    $$('[data-jt]').forEach(function(x){x.onclick=function(){F.tab=x.dataset.jt;drawP()}});if($('#j-rst'))$('#j-rst').onclick=function(){delete F.byD[F.tab];drawP()};
    var L=cur(),mut=function(fn){if(F.tab!=='all'&&!F.byD[F.tab])F.byD[F.tab]=F.ppl.slice();fn(F.tab==='all'?F.ppl:F.byD[F.tab]);drawP()};
    $('#j-ppl').innerHTML=L.length?L.map(function(id,i){var p=pinfo(id),w=warn(id);return '<div class="jp'+(w?' w':'')+'"><span class="av" data-av="'+esc(id)+'" style="width:30px;height:30px">'+esc((p.nick||'?')[0])+'</span><span class="pt"><b>'+(i+1)+'. '+esc(p.nick||'')+(p.code?' · '+esc(p.code):'')+'</b><small>'+esc(p.pos||'')+(p.team_id&&p.team_id!==$('#j-team').value&&$('#j-team').value?' · ยืมจากทีม '+esc(org('teams',p.team_id)):'')+'</small></span>'+(w?'<span class="jw">⚠ '+esc(w)+'</span>':'')+(ed?'<button type="button" class="btn sm" data-jrm="'+i+'" aria-label="เอาออก">✕</button>':'')+'</div>'}).join(''):'<div class="faint" style="font-size:13px">ยังไม่มีคน</div>';
    $$('[data-jrm]').forEach(function(x){x.onclick=function(){mut(function(l){l.splice(+x.dataset.jrm,1)})}});
    var a=$('#j-add');if(a){var tm=$('#j-team').value,dp=$('#j-dept').value,pool=d.pool.filter(function(p){return L.indexOf(p.id)<0});
      var grp=function(lbl,arr){return arr.length?'<optgroup label="'+esc(lbl)+'">'+arr.map(function(p){var w=warn(p.id);return '<option value="'+p.id+'">'+esc(p.nick+' · '+p.code+' · '+(p.pos||''))+(w?' ⚠ '+esc(w):'')+'</option>'}).join('')+'</optgroup>':''};
      a.innerHTML='<option value="">'+(L.length>=5?'ครบ 5 คนแล้ว':'+ เลือกพนักงาน')+'</option>'+(L.length>=5?'':grp('ทีมนี้',pool.filter(function(p){return tm&&p.team_id===tm}))+grp('แผนกเดียวกัน',pool.filter(function(p){return p.dept_id===dp&&(!tm||p.team_id!==tm)}))+grp('ยืมจากแผนกอื่น',pool.filter(function(p){return p.dept_id!==dp})));
      a.disabled=L.length>=5;a.onchange=function(){var val=a.value;if(val)mut(function(l){l.push(val)})}}
    drawCost();loadPhotos()};
  var drawH=function(){$('#j-hire').innerHTML=F.hire.map(function(w,i){return '<div class="jh"><input data-hn="'+i+'" placeholder="ชื่อ / ทีมผู้รับเหมา" value="'+esc(w.name||'')+'"'+dis+'><input data-hd="'+i+'" inputmode="numeric" placeholder="วัน" value="'+esc(w.days||1)+'"'+dis+'><input data-hw="'+i+'" inputmode="decimal" placeholder="ค่าจ้างรวม ฿" value="'+esc(w.wage||'')+'"'+dis+'>'+(ed?'<button type="button" class="btn sm" data-hx="'+i+'" aria-label="ลบ">✕</button>':'')+'</div>'}).join('')||'<span class="faint" style="font-size:13px">ไม่มี</span>';
    $$('[data-hn],[data-hd],[data-hw]').forEach(function(x){x.oninput=function(){var i=+(x.dataset.hn||x.dataset.hd||x.dataset.hw);F.hire[i][x.dataset.hn!==undefined?'name':x.dataset.hd!==undefined?'days':'wage']=x.value;drawCost()}});
    $$('[data-hx]').forEach(function(x){x.onclick=function(){F.hire.splice(+x.dataset.hx,1);drawH();drawCost()}})};
  /* ประมาณค่าใช้จ่ายทั้งงาน (สูตรเดียวกับเซิร์ฟเวอร์ แต่ไม่หักกรณีคนเดียวกันได้สิทธิ์จากงานอื่นในวันเดียวกัน) */
  var drawCost=function(){var el=$('#j-costv');if(!el)return;var from=$('#j-from').value,to=$('#j-to').value||from,hol=0,hd=0,pd=0,num=function(x){return Number(String(x||'').replace(/[,\s]/g,''))||0};
    for(var x=from;x&&x<=to;x=isoAdd(x,1)){var n=(F.byD[x]||F.ppl).length;if(new Date(x+'T12:00:00').getDay()===0||d.holidays.indexOf(x)>=0)hd+=n;if($('#j-prov').checked)pd+=n}
    var hi=F.hire.reduce(function(s,w){return s+num(w.wage)},0),ex=num($('#j-cost').value),tot=hd*d.rates.hol+pd*d.rates.prov+hi+ex;
    el.innerHTML='<div class="cst"><div><span>วันหยุด (อาทิตย์ / วันหยุดบริษัท) · '+hd+' คน-วัน × '+d.rates.hol+'</span><b>'+(hd*d.rates.hol).toLocaleString()+' ฿</b></div><div><span>ต่างจังหวัด · '+pd+' คน-วัน × '+d.rates.prov+'</span><b>'+(pd*d.rates.prov).toLocaleString()+' ฿</b></div><div><span>จ้างรายวัน</span><b>'+hi.toLocaleString()+' ฿</b></div><div><span>ค่าใช้จ่ายอื่น</span><b>'+ex.toLocaleString()+' ฿</b></div><div class="tt"><span>รวมทั้งงาน (โดยประมาณ)</span><b>'+tot.toLocaleString()+' ฿</b></div></div><span class="h">คนเดียวกันได้ค่าวันหยุด/ต่างจังหวัดไม่เกินอย่างละ 1 ครั้งต่อวัน แม้อยู่หลายงาน · ตัวเลขในตารางหักส่วนนี้แล้ว · ตั้งอัตราที่ ตั้งค่า › เวลาทำงาน</span>'};
  drawH();drawP();['#j-from','#j-to','#j-team'].forEach(function(k){$(k).addEventListener('change',drawP)});$('#j-prov').onchange=drawCost;$('#j-cost').addEventListener('input',drawCost);
  if($('#j-hadd'))$('#j-hadd').onclick=function(){F.hire.push({name:'',days:1,wage:''});drawH();drawCost()};
  if(!ed)return;
  $('#j-ok').onclick=function(){var k=this,x={id:j?j.id:'',title:$('#j-title').value,pm_code:$('#j-pm').value,site_name:$('#j-sn').value,site_id:$('#j-site').value,date_from:$('#j-from').value,date_to:$('#j-to').value||$('#j-from').value,dept_id:$('#j-dept').value,team_id:$('#j-team').value,shift:F.shift,people:F.ppl,people_by_date:F.byD,province:$('#j-prov').checked,daily_workers:F.hire,vehicle_ids:F.veh,cost:$('#j-cost').value,note:$('#j-note').value};
    busy(k,1);$$('.drw .f').forEach(function(l){l.classList.remove('bad');var e=l.querySelector('.er');if(e)e.remove()});
    aCall('saveJob',x).then(function(r){busy(k,0);if(!r.ok){Object.keys(r.errors).forEach(function(n){var l=$('#jf-'+n);if(l){l.classList.add('bad');l.insertAdjacentHTML('beforeend','<span class="er">'+esc(r.errors[n])+'</span>')}});toast('ยังบันทึกไม่ได้ · ตรวจช่องสีแดง',1);return}
      closeD();toast(j?'บันทึกการแก้ไขแล้ว':'เพิ่มงาน '+r.job_no+' แล้ว');if(x.date_from<A.sw||x.date_from>isoAdd(A.sw,6))A.sw=wkStart(x.date_from);loadSched()}).catch(function(e){busy(k,0);toast(e.message,1)})};
  if($('#j-del'))$('#j-del').onclick=function(){var k=this;ask({tone:'bad',icon:'del',title:'ลบงาน “'+j.title+'” ?',desc:'ลบทุกวันในช่วงนี้ · กู้คืนไม่ได้',buttons:[{k:'no',label:'ยกเลิก'},{k:'yes',label:'ลบงาน',cls:'bad'}]}).then(function(a){if(a!=='yes')return;busy(k,1);aCall('deleteJob',j.id).then(function(){closeD();toast('ลบงานแล้ว');loadSched()}).catch(function(e){busy(k,0);toast(e.message,1)})})}}
function vehDrawer(){var d=A.sd,draw=function(list){$('#vh-list').innerHTML=list.length?'<ul class="tl">'+list.map(function(v){return '<li style="display:flex;gap:8px;align-items:center"><span style="flex:1"><b>'+esc(v.plate)+'</b> <span class="faint">'+esc(v.model||'')+(v.dept_id?' · '+esc(org('departments',v.dept_id)):'')+'</span>'+(v.status==='inactive'?' <span class="badge b-mute">ไม่ใช้งาน</span>':'')+'</span><button class="btn sm" data-vh="'+esc(v.id)+'">แก้ไข</button></li>'}).join('')+'</ul>':'<span class="faint">ยังไม่มีรถ</span>';
    $$('[data-vh]').forEach(function(x){x.onclick=function(){fill(list.filter(function(v){return v.id===x.dataset.vh})[0])}})},
   fill=function(v){v=v||{};$('#vh-id').value=v.id||'';$('#vh-plate').value=v.plate||'';$('#vh-model').value=v.model||'';$('#vh-dept').value=v.dept_id||'';$('#vh-st').checked=v.status==='inactive';$('#vh-ok').textContent=v.id?'บันทึกการแก้ไข':'เพิ่มรถ'};
  drawer('รถบริษัท','<div id="vh-list"><span class="spin"></span></div><div class="dfs" style="margin-top:14px"><h4>เพิ่ม / แก้ไขรถ</h4><div class="dfg"><input type="hidden" id="vh-id"><label class="f s3"><span>ทะเบียน *</span><input id="vh-plate" placeholder="เช่น 2ฒศ1467"></label><label class="f s3"><span>รุ่น / ประเภท</span><input id="vh-model" placeholder="เช่น Toyota Hilux"></label>'+
    '<label class="f s3"><span>แผนกที่ใช้</span><select id="vh-dept"><option value="">— ส่วนกลาง —</option>'+A.d.org.departments.filter(function(x){return x.active!=='FALSE'}).map(function(x){return '<option value="'+x.id+'">'+esc(x.name)+'</option>'}).join('')+'</select></label><label class="f s3" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="vh-st" style="width:16px;height:16px"> <span>ไม่ใช้งานแล้ว</span></label></div></div>','<button class="btn" id="vh-new">ล้างฟอร์ม</button><button class="btn pri" id="vh-ok">เพิ่มรถ</button>');
  $('.drw').classList.add('wide');aCall('listVehicles').then(draw).catch(function(e){toast(e.message,1)});
  $('#vh-new').onclick=function(){fill(null)};
  $('#vh-ok').onclick=function(){var k=this;busy(k,1);aCall('saveVehicle',{id:$('#vh-id').value,plate:$('#vh-plate').value,model:$('#vh-model').value,dept_id:$('#vh-dept').value,status:$('#vh-st').checked?'inactive':'active'}).then(function(r){busy(k,0);if(!r.ok){toast(r.errors.plate,1);return}draw(r.vehicles);fill(null);toast('บันทึกรถแล้ว');loadSched()}).catch(function(e){busy(k,0);toast(e.message,1)})}}
/* ภาพรวมพนักงาน (Figma 241:4900): ลงเวลาวันนี้ · เวลาผิดปกติเดือนนี้ · ใบลาปีนี้ · โควตา */
var OV=null,THM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],THW=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
function tenure(d){if(!d)return '';var a=new Date(d+'T12:00:00'),b=new Date(),m=(b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth()-(b.getDate()<a.getDate()?1:0);if(m<0)return '';return ' · '+(m>=12?Math.floor(m/12)+' ปี ':'')+(m%12?m%12+' เดือน':m<12?'ไม่ถึง 1 เดือน':'')}
function sd(s){var d=new Date(s+'T12:00:00');return THW[d.getDay()]+' '+d.getDate()+' '+THM[d.getMonth()]}
function ovSt(d){var s=AST[d.status]||[d.status,'b-mute'];return '<span class="badge '+s[1]+'">'+(d.late_min?'สาย '+d.late_min+' นาที':s[0])+'</span>'}
function ovCards(e){var o=OV&&OV.id===e.id?OV.d:null;
  var hd=function(k,t,r){return '<div class="oh"><span class="ob">'+ic(k)+'</span><b>'+t+'</b><small>'+(r||'')+'</small></div>'};
  if(!o)return '<div class="ovg">'+['ลงเวลาวันนี้','เวลาผิดปกติ','ใบลา','โควตาการลา'].map(function(t,i){return '<section class="ovc">'+hd(['clock','alarm','check','leave'][i],t)+'<span class="spin"></span></section>'}).join('')+'</div>';
  var t=o.today||{},now=new Date(),ym=THM[now.getMonth()]+' '+(now.getFullYear()+543),m=o.month,last=o.issues[0],na=function(k,ti){return '<section class="ovc">'+hd(k,ti)+'<span class="faint" style="font-size:13px">ไม่มีสิทธิ์ดูข้อมูลนี้</span></section>'};
  var c1='<section class="ovc">'+hd('clock','ลงเวลาวันนี้',sd(t.date||new Date().toISOString().slice(0,10)))+'<div class="ot"><div><small>เข้างาน</small><b>'+esc(t.first_in||'—')+'</b></div><div><small>ออกงาน</small><b>'+esc(t.last_out||'—')+'</b></div></div><div>'+(t.status?ovSt(t):'')+(t.note?' <span class="faint" style="font-size:12.5px">'+esc(t.note)+'</span>':'')+'</div><span class="faint" style="font-size:12.5px">เวลาทำงาน '+esc(o.expect.start)+'–'+esc(o.expect.end)+'</span></section>';
  var c2=!m?'':'<section class="ovc">'+hd('alarm','เวลาผิดปกติ',ym)+'<div class="otl"><div class="w"><b>'+m.late+'</b><small>สาย</small></div><div class="b"><b>'+m.absent+'</b><small>ขาดงาน</small></div><div class="i"><b>'+m.missing+'</b><small>ลงเวลาไม่ครบ</small></div></div>'+
   '<span class="faint" style="font-size:12.5px">'+(m.late?'สายรวม '+m.late_min+' นาที':'ไม่มีมาสายเดือนนี้')+(last?' · ล่าสุด '+sd(last.date)+(last.late_min?' ('+last.late_min+' นาที)':''):'')+'</span>'+(isHR()?'<button class="lnk" id="ov-fix">แก้ไขเวลา →</button>':'')+'</section>';
  var c3=!o.docs?'':'<section class="ovc">'+hd('check','ใบลา','ปี '+(now.getFullYear()+543))+'<dl class="okv"><dt>ทั้งหมด</dt><dd>'+o.docs.total+' ใบ</dd><dt>รออนุมัติ</dt><dd style="color:var(--warn)">'+o.docs.pending+' ใบ</dd><dt>อนุมัติ</dt><dd style="color:var(--ok)">'+o.docs.ok+' ใบ</dd><dt>ไม่อนุมัติ</dt><dd class="faint">'+o.docs.no+' ใบ</dd></dl></section>';
  var c4=!o.quota?'':'<section class="ovc">'+hd('leave','โควตาการลา','ปี '+(now.getFullYear()+543))+(o.quota.length?o.quota.map(function(q){var u=q.used+q.reserved,pc=q.quota?Math.min(100,Math.round(u/q.quota*100)):0;return '<div class="oq"><div><span>'+esc(q.name)+'</span><b>'+u+(q.quota!==null?' / '+q.quota:'')+' วัน</b></div><i><s style="width:'+pc+'%"></s></i></div>'}).join(''):'<span class="faint">ไม่มีประเภทการลา</span>')+'</section>';
  return '<div class="ovg">'+(o.today?c1:na('clock','ลงเวลาวันนี้'))+(m?c2:na('alarm','เวลาผิดปกติ'))+(o.docs?c3:na('check','ใบลา'))+(o.quota?c4:na('leave','โควตาการลา'))+'</div>'}
/* ข้อมูลเพิ่มเติม · ที่อยู่ · ฝึกอบรม · สินทรัพย์ (HR) — พนักงานแก้ข้อมูลเพิ่มเติม/ที่อยู่/ฝึกอบรมเองได้ในแอป · สินทรัพย์ HR บันทึก */
var EDUL={'มัธยมต้น':'มัธยมต้น','มัธยมปลาย':'มัธยมปลาย','ปวช.':'ปวช.','ปวส.':'ปวส.','ปริญญาตรี':'ปริญญาตรี','ปริญญาโท':'ปริญญาโท','ปริญญาเอก':'ปริญญาเอก','อื่น ๆ':'อื่น ๆ'},LICT={'รถยนต์':'รถยนต์','จักรยานยนต์':'จักรยานยนต์','รถบรรทุก':'รถบรรทุก','อื่น ๆ':'อื่น ๆ'};
var GEN={male:'ชาย',female:'หญิง',other:'อื่น ๆ'},MAR={single:'โสด',married:'สมรส',divorced:'หย่าร้าง',widowed:'หม้าย'};
var ITK={training:['การฝึกอบรม',[['#','หลักสูตร'],['course','ชื่อหลักสูตร',1],['provider','จัดโดย',0,3],['hours','จำนวนชั่วโมง',0,3],['#','ช่วงเวลา'],['date_from','วันที่เริ่ม','date',2],['date_to','วันที่จบ','date',2],['expiry_date','วันหมดอายุ','date',2],['#','ใบประกาศและหมายเหตุ'],['file','รูปใบประกาศ (ถ้ามี)','file'],['note','หมายเหตุ']]],
  assets:['สินทรัพย์ถือครอง',[['#','ข้อมูลทรัพย์สิน'],['name','ชื่อทรัพย์สิน',1],['category','ประเภท',AST_CATS,3,'select'],['serial','หมายเลขเครื่อง / Serial',0,3],['brand','ยี่ห้อ',0,3],['model','รุ่น',0,3],['#','การรับ–คืน'],['received_date','วันที่รับ','date',3],['returned_date','วันที่คืน (ว่าง = ยังถือครอง)','date',3],['#','รูปและหมายเหตุ'],['file','รูปทรัพย์สิน','file'],['note','หมายเหตุ']]],
  education:['ข้อมูลการศึกษา',[['#','การศึกษา'],['level','ระดับการศึกษา',EDUL,3],['institute','สถาบัน',1,3],['major','สาขาวิชา'],['grad_date','วันที่จบ','date',3],['gpa','เกรดเฉลี่ย',0,3],['note','หมายเหตุ']]],
  work_prev:['ประวัติงานก่อนเข้าบริษัท',[['#','งานเดิม'],['company','บริษัท',1,3],['position','ตำแหน่ง',0,3],['date_from','เริ่มงาน','date',3],['date_to','ออกจากงาน','date',3],['reason','เหตุผลที่ออก'],['note','หมายเหตุ']]],
  job_hist:['ประวัติตำแหน่งในบริษัท',[['#','การเปลี่ยนแปลง'],['effective_date','วันที่มีผล *','date',3],['department','แผนก','pick',3],['team','ทีม','pick',3],['position','ตำแหน่ง','pick',3],['note','หมายเหตุ']]],
  license:['ใบขับขี่',[['#','ใบขับขี่'],['license_type','ประเภท',LICT],['license_no','เลขที่ใบขับขี่',0,3],['expiry_date','วันหมดอายุ','date',3],['file','รูปใบขับขี่','file'],['note','หมายเหตุ']]],
  name_hist:['ประวัติเปลี่ยนชื่อ–นามสกุล',[['#','การเปลี่ยนชื่อ'],['old_name','ชื่อ–นามสกุลเดิม',1,3],['new_name','ชื่อ–นามสกุลใหม่',0,3],['change_date','วันที่เปลี่ยน','date',3],['file','รูปเอกสาร','file'],['note','หมายเหตุ']]]};
var EHRF=[['#','ข้อมูลการจ้าง'],['probation_passed_date','วันที่ผ่านการทดลองงาน','date'],['resign_reason','เหตุผลที่ลาออก','ta']];
/* ประวัติตำแหน่ง (5 พ.ย. 2569 ผู้ใช้: ให้เลือกและเพิ่มข้อมูลง่ายกว่านี้): เลือกจากโครงสร้างองค์กร · ทีมและตำแหน่งกรองตามแผนก/ทีม · ชื่อที่ไม่มีแล้ว (ประวัติเก่า) เลือก "อื่น ๆ" แล้วพิมพ์เอง */
function jhPickBind(){var O=A.d.org,on=function(a){return (a||[]).filter(function(x){return x.active!=='FALSE'})},byN=function(a,n){return a.filter(function(x){return x.name===n})[0]};
  var D=on(O.departments),T=on(O.teams),P=on(O.positions);
  var lists={department:function(){return D},team:function(){var d=byN(D,$('[data-it="department"]').value);return d?T.filter(function(t){return t.department_id===d.id}):T},
    position:function(){var d=byN(D,$('[data-it="department"]').value),t=byN(T,$('[data-it="team"]').value);if(!d)return P;var a=P.filter(function(p){var pl=posPl(p);return pl.length?pl.some(function(x){return x.d===d.id&&(!x.t||!t||x.t===t.id)}):p.department_id===d.id});return a.length?a:P}};
  var fill=function(k,keep){var s=$('[data-pk="'+k+'"]'),i=$('[data-it="'+k+'"]'),cur=i.value,L=lists[k](),inL=L.some(function(x){return x.name===cur});
    if(cur&&!inL&&!keep){cur='';i.value=''}
    s.innerHTML='<option value="">— ไม่ระบุ —</option>'+L.map(function(x){return '<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>'}).join('')+'<option value="__o">อื่น ๆ · พิมพ์เอง</option>';
    var oth=!!cur&&!inL;s.value=oth?'__o':cur;i.hidden=!oth};
  ['department','team','position'].forEach(function(k){var s=$('[data-pk="'+k+'"]'),i=$('[data-it="'+k+'"]');fill(k,true);s.onchange=function(){if(s.value==='__o'){i.value='';i.hidden=false;i.focus()}else{i.value=s.value;i.hidden=true}
    if(k==='department'){fill('team');fill('position')}if(k==='team')fill('position')};i.oninput=function(){if(k==='department'){fill('team');fill('position')}if(k==='team')fill('position')}})}
/* ป้ายวันหมดอายุการอบรม (6 พ.ย. 2569): หมดอายุแล้ว · เหลือไม่เกิน 30 วัน */
function trExpBadge(x){if(!x)return '';var t=dIso(new Date()),s=new Date(t+'T12:00:00');s.setDate(s.getDate()+30);var n=dIso(s);return x<t?' <span class="badge b-bad">หมดอายุแล้ว</span>':x<=n?' <span class="badge b-warn">ใกล้หมดอายุ</span>':''}
function empFileShrink(file){return new Promise(function(ok,no){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){URL.revokeObjectURL(u);var z=Math.min(1,1280/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*z);c.height=Math.round(im.height*z);var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);var q=.85,d=c.toDataURL('image/jpeg',q);while(d.length>390000&&q>.3){q-=.1;d=c.toDataURL('image/jpeg',q)}if(d.length>390000)return no(new Error('รูปใหญ่เกินไป'));ok(d)};im.onerror=function(){URL.revokeObjectURL(u);no(new Error('อ่านรูปไม่ได้ ใช้ได้เฉพาะไฟล์รูปภาพ'))};im.src=u})}
var EXTF=[['#','ชื่อภาษาอังกฤษ'],['first_name_en','ชื่อ',0,2],['last_name_en','นามสกุล',0,2],['nickname_en','ชื่อเล่น',0,2],['#','ข้อมูลส่วนตัว'],['birth_date','วันเกิด','date',2],['gender','เพศ',GEN,4],['marital_status','สถานภาพ',MAR],['#','ที่อยู่'],['addr_idcard','ที่อยู่ตามทะเบียนบ้าน','ta',3],['addr_current','ที่อยู่ปัจจุบัน','ta',3]];
function extCards(p,edit){
  if(!p)return '<section class="card"><div class="ch"><h3>ข้อมูลเพิ่มเติมและที่อยู่</h3></div><div class="cb"><span class="spin"></span></div></section>';
  var x=p.ext||{},v=function(k){return esc(x[k]||'—')};
  var item=function(k,it){if(k!=='training'&&k!=='assets')return itemNew(k,it);return k==='training'?'<b>'+esc(it.course)+'</b>'+(it.provider?' <span class="faint">'+esc(it.provider)+'</span>':'')+(it.file_id?' <button class="btn sm" data-itfv="'+esc(it.file_id)+'">ดูรูป</button>':'')+'<br><span class="faint">'+(it.date_from||it.date_to?thd(it.date_from||it.date_to)+(it.date_to&&it.date_to!==it.date_from&&it.date_from?' – '+thd(it.date_to):''):'ไม่ระบุวันที่')+(it.hours?' · '+esc(it.hours)+' ชม.':'')+(it.expiry_date?' · หมดอายุ '+thd(it.expiry_date):'')+'</span>'+trExpBadge(it.expiry_date)
    :'<b>'+esc(it.name)+'</b>'+(it.serial?' <span class="mono faint">'+esc(it.serial)+'</span>':'')+' <span class="badge '+(it.returned_date?'b-mute">คืนแล้ว':'b-ok">ถือครอง')+'</span><br><span class="faint">รับ '+thd(it.received_date)+(it.returned_date?' · คืน '+thd(it.returned_date):'')+'</span>'};
  var list=function(k){var a=p[k]||[];return '<section class="card"><div class="ch"><h3>'+ITK[k][0]+'</h3>'+(edit?'<button class="btn sm" data-itadd="'+k+'" style="margin-left:auto">+ เพิ่ม</button>':'')+'</div><div class="cb">'+(a.length?'<ul class="tl">'+a.map(function(it){
    return '<li style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:160px">'+item(k,it)+'</span>'+(edit?'<button class="btn sm" data-ited="'+k+'|'+esc(it.id)+'">แก้ไข</button><button class="btn sm bad" data-itdel="'+k+'|'+esc(it.id)+'">ลบ</button>':'')+'</li>'}).join('')+'</ul>':'<span class="faint">'+(k==='license'?'ไม่มีใบขับขี่':'ไม่มีข้อมูล')+'</span>')+'</div></section>'};
  return shiftProfileCard(p,edit)+'<section class="card"><div class="ch"><h3>ข้อมูลเพิ่มเติมและที่อยู่</h3>'+(edit?'<button class="btn sm" id="xed" style="margin-left:auto">แก้ไข</button>':'')+'</div><div class="cb"><dl class="kv"><dt>ชื่อ (อังกฤษ)</dt><dd>'+esc(((x.first_name_en||'')+' '+(x.last_name_en||'')).trim()||'—')+'</dd><dt>ชื่อเล่น (อังกฤษ)</dt><dd>'+v('nickname_en')+'</dd><dt>วันเกิด</dt><dd>'+thd(x.birth_date)+'</dd><dt>เพศ</dt><dd>'+(GEN[x.gender]||'—')+'</dd><dt>สถานภาพ</dt><dd>'+(MAR[x.marital_status]||'—')+'</dd><dt>ที่อยู่ตามทะเบียนบ้าน</dt><dd style="white-space:pre-line">'+v('addr_idcard')+'</dd><dt>ที่อยู่ปัจจุบัน</dt><dd style="white-space:pre-line">'+v('addr_current')+'</dd></dl></div></section>'+ehrCard(p)+list('training')+astProfileCard(p,edit)+(p.education?list('education')+list('work_prev')+list('job_hist')+list('license')+list('name_hist'):'');
}
/* วันที่ผ่านทดลองงาน + เหตุผลลาออก (HR) */
function ehrCard(p){if(!isHR()||p.education===undefined)return '';return '<section class="card"><div class="ch"><h3>ข้อมูลการจ้าง</h3><button class="btn sm" id="ehred" style="margin-left:auto">แก้ไข</button></div><div class="cb"><dl class="kv"><dt>วันที่ผ่านการทดลองงาน</dt><dd>'+(p.probation_passed_date?thd(p.probation_passed_date):'—')+'</dd><dt>เหตุผลที่ลาออก</dt><dd style="white-space:pre-line">'+esc(p.resign_reason||'—')+'</dd></dl></div></section>'}
function itemNew(k,it){var f=it.file_id?' <button class="btn sm" data-itfv="'+esc(it.file_id)+'">ดูรูป</button>':'',D=function(x){return x?thd(x):''},J=function(a){return a.filter(String).map(esc).join(' · ')};
  if(k==='education')return '<b>'+esc(it.institute)+'</b>'+(it.level?' <span class="faint">'+esc(it.level)+'</span>':'')+'<br><span class="faint">'+(J([it.major,it.grad_date?'จบ '+D(it.grad_date):it.grad_year?'จบปี '+it.grad_year:'',it.gpa?'เกรดเฉลี่ย '+it.gpa:''])||'—')+'</span>';
  if(k==='work_prev')return '<b>'+esc(it.company)+'</b>'+(it.position?' <span class="faint">'+esc(it.position)+'</span>':'')+'<br><span class="faint">'+(J([D(it.date_from)+(it.date_to?' – '+D(it.date_to):''),it.reason])||'—')+'</span>';
  if(k==='job_hist')return '<b>'+esc(D(it.effective_date))+'</b> '+(J([it.department,it.team,it.position])||'—')+(it.note?'<br><span class="faint">'+esc(it.note)+'</span>':'');
  if(k==='license')return '<b>'+esc(it.license_type)+'</b>'+(it.license_no?' <span class="mono faint">'+esc(it.license_no)+'</span>':'')+f+'<br><span class="faint">'+(it.expiry_date?'หมดอายุ '+D(it.expiry_date):'ไม่ระบุวันหมดอายุ')+'</span>';
  return '<b>'+esc(it.old_name)+'</b>'+(it.new_name?' → <b>'+esc(it.new_name)+'</b>':'')+f+'<br><span class="faint">'+(it.change_date?D(it.change_date):'ไม่ระบุวันที่')+'</span>'}
/* ฟอร์มใน Drawer: fields = [[key,label,1(บังคับ)|'date'|'ta'|{ตัวเลือก},ความกว้าง 2|3 จาก 6]] · ['#',ชื่อหมวด] = เริ่มกล่องใหม่ · ตัวเลือก ≤4 = ปุ่มเลือก · save(d) คืน Promise ของ {ok,errors} */
function drawerForm(title,fields,val,save){
  var n=0,open=false,h='',one=fields.filter(function(f){return f[0]==='#'}).length<2;   // ส่วนเดียว: ไม่ต้องมีเลขลำดับ + หัวข้อที่ซ้ำกับชื่อหน้าต่าง (6 พ.ย. 2569)
  fields.forEach(function(f){if(f[0]==='#'){h+=(open?'</div></div>':'')+'<div class="dfs">'+(one?'':'<h4><span class="n">'+(++n)+'</span>'+esc(f[1])+'</h4>')+'<div class="dfg">';open=true;return}
    if(!open){h+='<div class="dfs"><div class="dfg">';open=true}
    var t=f[2],cur=val[f[0]]||'',k=t&&typeof t==='object'?Object.keys(t):null;
    var inner=t==='pick'?'<select data-pk="'+f[0]+'"></select><input data-it="'+f[0]+'" class="pk-o" maxlength="120" placeholder="พิมพ์ชื่อ" value="'+esc(cur)+'" hidden>':t==='file'?'<div class="dfu"><input type="file" id="dfi" accept="image/jpeg,image/png,image/webp" data-itfile aria-label="'+esc(f[1])+'"><label class="dfu-drop" for="dfi" id="dfd"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-4.5-4.5L7 20"/></svg><b>เลือกรูป หรือลากมาวาง</b><small>JPG, PNG, WebP · ระบบย่อขนาดให้อัตโนมัติ</small></label><div class="dfu-prev" id="dfv" hidden><img id="dfp" alt=""><div class="dfu-m"><b id="dfn"></b><small id="dfs"></small><div class="dfu-a"><label class="btn sm" for="dfi">เปลี่ยนรูป</label><button type="button" class="btn sm" id="dfx" hidden>เอาออก</button></div></div></div></div>':t==='ta'||f[0]==='note'?'<textarea data-it="'+f[0]+'" rows="3" maxlength="300">'+esc(cur)+'</textarea>'
      :k&&k.length<=4&&f[4]!=='select'?'<input type="hidden" data-it="'+f[0]+'" value="'+esc(cur)+'"><span class="chips" role="radiogroup">'+k.map(function(x){return '<button type="button" data-chip="'+f[0]+'|'+x+'" aria-pressed="'+(cur===x)+'">'+t[x]+'</button>'}).join('')+'</span>'
      :k?'<select data-it="'+f[0]+'">'+(f[4]==='select'?'':'<option value="">— ไม่ระบุ —</option>')+k.map(function(x){return '<option value="'+x+'"'+(cur===x?' selected':'')+'>'+t[x]+'</option>'}).join('')+'</select>'
      :'<input data-it="'+f[0]+'"'+(t==='date'?' type="date"':'')+(f[0]==='hours'||f[0]==='gpa'?' inputmode="decimal"':'')+(f[0]==='gpa'?' maxlength="4" placeholder="เช่น 2.88"':'')+' value="'+esc(cur)+'">';
    var tg=k&&k.length<=4&&f[4]!=='select'||t==='file'?'div':'label';   // ปุ่มเลือกอยู่ใน <label> ไม่ได้ (กดชื่อช่องแล้วไปกดปุ่มแรก)
    h+='<'+tg+' class="f'+(f[3]?' s'+f[3]:'')+'" id="w-'+f[0]+'"><span>'+f[1]+(t===1?' <b class="req">*</b>':'')+'</span>'+inner+(t==='date'&&f[0]==='birth_date'?'<span class="h" id="age"></span>':'')+'</'+tg+'>'});
  drawer(title,h+(open?'</div></div>':''),'<button class="btn" id="itx">ยกเลิก</button><button class="btn pri" id="itok">บันทึก</button>');
  $('.drw').classList.add('wide');if(one)$('.drw').classList.add('one');$('#itx').onclick=closeD;
  $$('[data-chip]').forEach(function(b){b.onclick=function(){var a=b.dataset.chip.split('|'),x=$('[data-it="'+a[0]+'"]'),on=x.value!==a[1];x.value=on?a[1]:'';$$('[data-chip^="'+a[0]+'|"]').forEach(function(c){c.setAttribute('aria-pressed',on&&c===b)})}});
  var bd=$('[data-it="birth_date"]'),age=function(){var v=bd.value,el=$('#age');if(!el)return;if(!v){el.textContent='';return}var d=new Date(v),t=new Date(),y=t.getFullYear()-d.getFullYear()-((t.getMonth()<d.getMonth()||t.getMonth()===d.getMonth()&&t.getDate()<d.getDate())?1:0);el.textContent=y>=0&&y<120?'อายุ '+y+' ปี':''};if(bd){bd.oninput=age;age()}
  var ai=$('[data-it="addr_idcard"]'),ac=$('[data-it="addr_current"]');if(ai&&ac){$('#w-addr_current').insertAdjacentHTML('beforeend','<span class="same"><input type="checkbox" id="same"'+(ac.value&&ac.value===ai.value?' checked':'')+'>เหมือนที่อยู่ตามทะเบียนบ้าน</span>');
    var sync=function(){if($('#same').checked){ac.value=ai.value;ac.readOnly=true}else ac.readOnly=false};$('#same').onchange=sync;ai.addEventListener('input',function(){if($('#same').checked)ac.value=ai.value});sync()}
  $('#itok').onclick=function(){var b=this,d={};$$('[data-it]').forEach(function(el){d[el.dataset.it]=el.value.trim()});busy(b,1);
    save(d).then(function(r){if(r.ok)return;busy(b,0);$$('.drw .f').forEach(function(l){l.classList.remove('bad');var e=l.querySelector('.er');if(e)e.remove()});
      Object.keys(r.errors||{}).forEach(function(n){var l=$('#w-'+n);if(l){l.classList.add('bad');l.insertAdjacentHTML('beforeend','<span class="er">'+esc(r.errors[n])+'</span>')}})}).catch(function(e){busy(b,0);toast(e.message,1)})};
}
/* ฟอร์มรายการในโปรไฟล์ · ใช้จากหน้าทะเบียนทรัพย์สินด้วย */
function itemForm(k,it){var fileD='';if(k==='assets'&&it.id)it=Object.assign({},it,{category:astCatK(it.category)});if(k==='job_hist'&&!it.id){var e0=emp(A.id)||{};it={effective_date:dIso(new Date()),department:org('departments',e0.department_id)||'',team:org('teams',e0.team_id)||'',position:org('positions',e0.position_id)||''}}drawerForm((it.id?'แก้ไข':'เพิ่ม')+ITK[k][0],ITK[k][1],it,function(d){d.employee_id=it.employee_id||A.id;if(fileD)d.file=fileD;if(it.id)d.id=it.id;return aCall('saveEmpItem',k,d).then(function(r){if(r.ok){if(k==='assets')A.as=null;if(PROF&&A.view==='profile')PROF[k]=r.items;closeD();render();toast('บันทึกแล้ว')}return r})});
    if(k==='job_hist')jhPickBind();
    /* 9 พ.ย. 2569 ผู้ใช้แจ้ง: "เอาออก" ลบไฟล์เดิมได้จริง (ส่ง __remove__) · การฝึกอบรมแนบ PDF ได้ (≤ 10 MB) */
    var ff=$('.drw [data-itfile]');if(ff){var cur='',PDF=k==='training',PIC='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#FFF5F5"/><path d="M20 10h18l10 10v34H20z" fill="#fff" stroke="#DC2626" stroke-width="3"/><text x="34" y="46" font-size="12" font-family="sans-serif" font-weight="700" fill="#DC2626" text-anchor="middle">PDF</text></svg>'),
      show=function(src,nm,sub,canX){var v=$('#dfv');if(!v)return;$('#dfd').hidden=!!src;v.hidden=!src;if(src){$('#dfp').src=/^data:application\/pdf/.test(src)?PIC:src;$('#dfn').textContent=nm;$('#dfs').textContent=sub;$('#dfx').hidden=!canX}},
      isPdf=function(d){return /^data:application\/pdf/.test(d||'')},
      old=function(){fileD='';ff.value='';show(cur,cur?(isPdf(cur)?'PDF ปัจจุบัน':'รูปปัจจุบัน'):'',PDF?'เลือกไฟล์ใหม่เพื่อแทนที่':'เลือกรูปใหม่เพื่อแทนที่',!!cur)};
      if(PDF){ff.accept='application/pdf,image/jpeg,image/png,image/webp';var lb=$('#dfd b'),sm=$('#dfd small');if(lb)lb.textContent='เลือกไฟล์ หรือลากมาวาง';if(sm)sm.textContent='PDF (ไม่เกิน 10 MB) หรือรูป JPG, PNG, WebP'}
      ff.onchange=function(){var f=ff.files[0];if(!f)return;if(f.type==='application/pdf'){if(!PDF){old();return toast('แนบได้เฉพาะรูป',1)}if(f.size>10*1024*1024){old();return toast('PDF ใหญ่เกิน 10 MB',1)}var fr=new FileReader();fr.onload=function(){fileD=String(fr.result);show(fileD,'PDF ที่เลือก',f.name,true)};fr.readAsDataURL(f);return}
        empFileShrink(f).then(function(d){fileD=d;show(d,'รูปที่เลือก',f.name,true)}).catch(function(e){old();toast(e.message,1)})};
      $('#dfx').onclick=function(){if(fileD&&fileD!=='__remove__'){old();return}fileD='__remove__';ff.value='';show('');var dz0=$('#dfd small');if(dz0)dz0.textContent='จะลบไฟล์เดิมเมื่อกดบันทึก · เลือกไฟล์ใหม่ได้'};
      var dz=$('#dfd');['dragenter','dragover'].forEach(function(n){dz.addEventListener(n,function(e){e.preventDefault();dz.classList.add('on')})});dz.addEventListener('dragleave',function(){dz.classList.remove('on')});dz.addEventListener('drop',function(e){e.preventDefault();dz.classList.remove('on');var fs=e.dataTransfer&&e.dataTransfer.files;if(fs&&fs.length){ff.files=fs;ff.onchange()}});
      if(it.file_id)aCall('getEmpFile',it.file_id).then(function(d){if(fileD||!$('#dfv'))return;cur=d;old()}).catch(function(){});else if(it.photo_url){$('#dfp').referrerPolicy='no-referrer';cur=it.photo_url;old()}}
  if(k==='assets'&&it.asset_code){var cb0=$('.drw .cb');if(cb0)cb0.insertAdjacentHTML('afterbegin','<div class="ast-fhd"><b>'+esc(it.asset_code)+'</b>'+(it.old_code?'<span>รหัสเดิม '+esc(it.old_code)+'</span>':'')+'<span>'+astSt(it.status)+'</span></div>')}}
function bExt(){
  if(PROF)astProfileBind(PROF);
  if($('#xed'))$('#xed').onclick=function(){drawerForm('ข้อมูลเพิ่มเติมและที่อยู่',EXTF,PROF.ext||{},function(d){d.reason='HR แก้ไขข้อมูลเพิ่มเติม';return aCall('saveEmployeeExt',A.id,d).then(function(r){if(r.ok){PROF.ext=r.ext;closeD();render();toast(r.changed?'บันทึกแล้ว':'ไม่มีอะไรเปลี่ยน')}return r})})};
  if($('#ehred'))$('#ehred').onclick=function(){drawerForm('ข้อมูลการจ้าง',EHRF,PROF,function(d){return aCall('saveEmployeeHr',A.id,d).then(function(r){if(r.ok){PROF.probation_passed_date=r.probation_passed_date;PROF.resign_reason=r.resign_reason;closeD();render();toast(r.changed?'บันทึกแล้ว':'ไม่มีอะไรเปลี่ยน')}return r})})};
  $$('[data-itfv]').forEach(function(b){b.onclick=function(){busy(b,1);aCall('getEmpFile',b.dataset.itfv).then(function(d){busy(b,0);if(/^data:application\/pdf/.test(d)&&window.trDl){trDl(d,'ใบรับรอง');return}drawer('รูปแนบ','<img src="'+esc(d)+'" alt="รูปแนบ" style="display:block;max-width:100%;border-radius:8px">','<button class="btn" id="itfx">ปิด</button>');$('#itfx').onclick=closeD}).catch(function(e){busy(b,0);toast(e.message,1)})}});
  var form=itemForm;
  var find=function(v){var p=v.split('|');return [p[0],(PROF[p[0]]||[]).filter(function(x){return x.id===p[1]})[0]]};
  $$('[data-itadd]').forEach(function(b){b.onclick=function(){form(b.dataset.itadd,{})}});
  $$('[data-ited]').forEach(function(b){b.onclick=function(){var f=find(b.dataset.ited);if(f[1])form(f[0],f[1])}});
  $$('[data-itdel]').forEach(function(b){b.onclick=function(){var f=find(b.dataset.itdel),k=f[0];if(!f[1])return;
    drawer('ลบรายการ'+ITK[k][0]+'?','<p style="margin:0">'+esc(f[1].course||f[1].name)+' · ลบแล้วกู้คืนไม่ได้ (มีประวัติใน Audit Log)</p>','<button class="btn bad" id="itdok">ลบรายการ</button>');
    $('#itdok').onclick=function(){var x=this;busy(x,1);aCall('deleteEmpItem',k,f[1].id).then(function(r){PROF[k]=r.items;closeD();render();toast('ลบแล้ว')}).catch(function(e){busy(x,0);toast(e.message,1)})}}});
}

/* กะการทำงาน (ลงเวลาแบบเลือกกะ) — ตั้งค่าระบบ › เวลาทำงาน + โปรไฟล์พนักงาน · ช่องในตารางใช้ data-shf (ไม่ปนกับ data-sv ของปุ่มบันทึกการตั้งค่า) */
var SHCOL={morning:'#F2A93B',afternoon:'#EC6F3D',night:'#5A5FD6'};
var shDot=function(id){return '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;background:'+(SHCOL[id]||'#8C8C8C')+'"></span>'};
function shiftCard(d){var L=d.shifts||[];
  return '<section class="card" style="margin-top:12px"><div class="ch"><h3>กะการทำงาน (ลงเวลาแบบเลือกกะ)</h3><span class="badge b-mute" style="margin-left:auto">ตั้งกะเฉพาะคน '+(d.shiftUsers||0)+' คน</span></div><div class="cb">'+
   '<div class="faint" style="font-size:12.5px;margin-bottom:10px">พนักงานทุกคนเลือกกะตอนลงเวลาเข้า (กำหนดกะเฉพาะคนได้ที่ หน้าพนักงาน › กะการทำงาน) · คิดสาย / กลับก่อนตามกะที่เลือก · เวลาออกน้อยกว่าเวลาเข้า = ข้ามเที่ยงคืน · ค่าตอนนี้เป็นค่าชั่วคราว รอยืนยันเงื่อนไข</div>'+
   '<div class="tw"><table style="min-width:640px"><thead><tr><th>กะ</th><th>เวลาเข้า</th><th>เวลาออก</th><th>นับสายเมื่อเกิน (นาที)</th><th>เริ่มนับสาย</th><th></th></tr></thead><tbody>'+L.map(function(x){
    return '<tr data-shrow="'+esc(x.id)+'"><td><label class="f" style="flex-direction:row;align-items:center">'+shDot(x.id)+'<input data-shf="name" value="'+esc(x.name)+'" style="width:90px"></label></td><td><label class="f"><input type="time" data-shf="start_time" value="'+esc(x.start)+'"></label></td><td><label class="f"><input type="time" data-shf="end_time" value="'+esc(x.end)+'"></label></td><td><label class="f"><input data-shf="late_after_min" inputmode="numeric" value="'+esc(x.late_after_min)+'" style="width:80px"></label></td><td class="num">'+esc(x.late_after)+(x.overnight?' <span class="badge b-mute">ข้ามวัน</span>':'')+'</td><td><button class="btn sm" data-shsave="'+esc(x.id)+'">บันทึก</button></td></tr>'}).join('')+'</tbody></table></div></div></section>'}
/* วันหยุดบริษัท — ตั้งค่าระบบ › เวลาทำงาน · แก้ย้อนหลังได้ (ระบบคำนวณสรุปลงเวลาของวันนั้นใหม่) */
var WD=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
/* ตั้งค่าระบบ › วันหยุด (Figma 367:6463) · ใช้ saveHoliday/deleteHoliday เดิม */
var TH_M=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],TH_MS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function holLink(d){var y=new Date().getFullYear(),n=(d.holidays||[]).filter(function(h){return h.date.slice(0,4)===String(y)}).length;
  return '<section class="card" style="margin-top:12px"><div class="list"><div class="li"><div style="flex:1;min-width:0"><b>วันหยุด ปี '+(y+543)+'</b><div class="muted" style="font-size:12.5px">'+n+' วัน · วันหยุดนักขัตฤกษ์และวันหยุดบริษัท</div></div><button class="btn sm" data-stab2="hol">จัดการ ›</button></div></div></section>'}
function holPage(d){var L=d.holidays||[],cy=new Date().getFullYear(),y=Number(A.holY||cy),k=A.holK||'all',td=new Date(Date.now()+7*36e5).toISOString().slice(0,10);
  var yr=L.filter(function(h){return h.date.slice(0,4)===String(y)}).sort(function(a,b){return a.date<b.date?-1:1}),nat=yr.filter(function(h){return h.kind!=='company'}).length,com=yr.length-nat;
  var nx=L.filter(function(h){return h.date>=td}).sort(function(a,b){return a.date<b.date?-1:1})[0];
  var dd=function(s){var x=new Date(s+'T12:00:00');return x.getDate()+' '+TH_MS[x.getMonth()]};
  var days=function(s){return Math.round((new Date(s+'T12:00:00')-new Date(td+'T12:00:00'))/864e5)};
  var rows=yr.filter(function(h){return k==='all'||(k==='company'?h.kind==='company':h.kind!=='company')}),by={};rows.forEach(function(h){(by[h.date.slice(5,7)]=by[h.date.slice(5,7)]||[]).push(h)});
  var sumc=function(n,l,w){return '<div class="hs-c'+(w?' w':'')+'"><b>'+n+'</b><span>'+l+'</span></div>'};
  var seg=function(v,l){return '<button type="button" data-holk="'+v+'" aria-pressed="'+(k===v)+'">'+l+'</button>'};
  return '<div class="hs-sum">'+sumc(yr.length,'วันหยุดปี '+(y+543))+sumc(nat,'นักขัตฤกษ์')+sumc(com,'วันหยุดบริษัท')+(nx?sumc(WD[new Date(nx.date+'T12:00:00').getDay()]+' '+dd(nx.date),'วันหยุดถัดไป · '+esc(nx.name)+(days(nx.date)?' · อีก '+days(nx.date)+' วัน':' · วันนี้'),1):sumc('—','ยังไม่มีวันหยุดถัดไป',1))+'</div>'+
   '<section class="card" style="margin-top:14px"><div class="hs-tb"><div class="hs-yr"><button type="button" data-holy="'+(y-1)+'" aria-label="ปีก่อน">‹</button><b>ปี '+(y+543)+'</b><button type="button" data-holy="'+(y+1)+'" aria-label="ปีถัดไป">›</button></div>'+
   '<div class="sc-seg">'+seg('all','ทั้งหมด '+yr.length)+seg('national','นักขัตฤกษ์ '+nat)+seg('company','บริษัท '+com)+'</div><span class="sp"></span><button class="btn" id="hol-copy">คัดลอกจากปีที่แล้ว</button><button class="btn pri" id="hol-add">+ เพิ่มวันหยุด</button></div>'+
   (rows.length?Object.keys(by).sort().map(function(m){return '<div class="hs-mh"><b>'+TH_M[+m-1]+' '+(y+543)+'</b><span>'+by[m].length+' วัน</span></div>'+by[m].map(function(h){var x=new Date(h.date+'T12:00:00'),past=h.date<td,isNx=nx&&h.date===nx.date;
     return '<div class="hs-r'+(past?' past':'')+(isNx?' nx':'')+'"><div class="hs-d"><b>'+x.getDate()+'</b><span>'+WD[x.getDay()]+'</span></div><div class="hs-t"><b>'+esc(h.name)+'</b><span>'+dd(h.date)+' '+(y+543)+(isNx?(days(h.date)?' · อีก '+days(h.date)+' วัน':' · วันนี้'):past?' · ผ่านแล้ว':'')+'</span></div><span class="badge '+(h.kind==='company'?'hs-co':'b-mute')+'">'+(h.kind==='company'?'วันหยุดบริษัท':'นักขัตฤกษ์')+'</span><span class="hs-a"><button type="button" class="lnk2" data-hed="'+esc(h.date)+'">แก้ไข</button><span>·</span><button type="button" class="lnk2 bad" data-hdel="'+esc(h.date)+'">ลบ</button></span></div>'}).join('')}).join('')
    :'<div class="muted" style="text-align:center;padding:28px">ยังไม่มีวันหยุด'+(k==='all'?'':'ประเภทนี้')+'ของปี '+(y+543)+'</div>')+'</section>'}
function bHol(){if(!$('#hol-add'))return;var done=function(r,msg){if(r.ok){A.cfg.holidays=r.holidays;closeD();drawSet();toast(msg)}return r};
  if($('#hol-y'))$('#hol-y').onchange=function(){A.holY=this.value;drawSet()};
  $$('[data-holy]').forEach(function(b){b.onclick=function(){A.holY=b.dataset.holy;drawSet()}});
  $$('[data-holk]').forEach(function(b){b.onclick=function(){A.holK=b.dataset.holk;drawSet()}});
  var bon=(A.cfg.settings.sched_hol_bonus||{}).value||'700';
  var form=function(h){h=h||{kind:'company',date:'',name:''};var isE=!!h.date;
    drawer(isE?'แก้ไขวันหยุด':'เพิ่มวันหยุด','<div class="hf"><label class="f"><span class="fl">วันที่ *</span><input type="date" id="hf-date" value="'+esc(h.date)+'"><small class="er" id="hf-e-date"></small></label>'+
      '<label class="f"><span class="fl">ชื่อวันหยุด *</span><input id="hf-name" value="'+esc(h.name)+'" placeholder="เช่น หยุดพิเศษส่งท้ายปี" maxlength="120"><small class="er" id="hf-e-name"></small></label>'+
      '<div class="f"><span class="fl">ประเภท</span><div class="hf-k" role="radiogroup">'+[['national','นักขัตฤกษ์','ตามประกาศราชการ'],['company','วันหยุดบริษัท','บริษัทประกาศเอง']].map(function(x){return '<label class="hf-kc"><input type="radio" name="hf-kind" value="'+x[0]+'"'+(h.kind===x[0]||(x[0]==='national'&&h.kind!=='company')?' checked':'')+'><b>'+x[1]+'</b><small>'+x[2]+'</small></label>'}).join('')+'</div></div>'+
      '<div class="hf-n"><div>• มีผลกับ: ลงเวลา (ไม่นับขาด/สาย) · การลา (ไม่นับวัน) · ตารางงาน (ค่าเบี้ยวันหยุด '+esc(bon)+'฿)</div><div>• ถ้าเป็นวันที่ผ่านมาแล้ว ระบบคำนวณสรุปลงเวลาของวันนั้นใหม่ให้</div></div></div>',
      '<button class="btn" id="hf-x">ยกเลิก</button><button class="btn pri" id="hf-ok">บันทึก</button>');
    $('#hf-x').onclick=closeD;$('#hf-ok').onclick=function(){var b=this,x={date:$('#hf-date').value,name:$('#hf-name').value.trim(),kind:($('input[name="hf-kind"]:checked')||{}).value||'company'};if(isE)x.old_date=h.date;
      $('#hf-e-date').textContent='';$('#hf-e-name').textContent='';busy(b,1);
      aCall('saveHoliday',x).then(function(r){busy(b,0);if(!r.ok){Object.keys(r.errors||{}).forEach(function(k){var e=$('#hf-e-'+k);if(e)e.textContent=r.errors[k]});return}if(x.date.slice(0,4)!==String(A.holY||new Date().getFullYear()))A.holY=x.date.slice(0,4);done(r,isE?'แก้ไขวันหยุดแล้ว':'เพิ่มวันหยุดแล้ว')}).catch(function(e){busy(b,0);toast(e.message,1)})}};
  var cp=$('#hol-copy');if(cp)cp.onclick=function(){var y=Number(A.holY||new Date().getFullYear()),L=A.cfg.holidays||[],have={};L.forEach(function(h){have[h.date]=1});
    var src=L.filter(function(h){return h.kind==='company'&&h.date.slice(0,4)===String(y-1)}),dr=src.map(function(h){return {name:h.name,date:y+h.date.slice(4)}}).filter(function(x){return !have[x.date]&&!isNaN(new Date(x.date+'T12:00:00'))});
    drawer('คัดลอกวันหยุดบริษัทจากปี '+(y-1+543),dr.length?'<p class="muted" style="margin-top:0;font-size:13px">วันหยุดบริษัทของปี '+(y-1+543)+' ที่ยังไม่มีในปี '+(y+543)+' · ตรวจและแก้วันที่ก่อนบันทึก (บางวันอาจต้องเลื่อน)</p><div class="hf-cp">'+dr.map(function(x,i){return '<label class="hf-cr"><input type="checkbox" data-cpi="'+i+'" checked><input type="date" data-cpd="'+i+'" value="'+x.date+'"><b>'+esc(x.name)+'</b></label>'}).join('')+'</div>':'<p class="muted">ไม่มีวันหยุดบริษัทของปี '+(y-1+543)+' ที่ต้องคัดลอก</p>',
      dr.length?'<button class="btn" id="cp-x">ยกเลิก</button><button class="btn pri" id="cp-ok">คัดลอก</button>':'<button class="btn" id="cp-x">ปิด</button>');
    $('#cp-x').onclick=closeD;if(!dr.length)return;
    $('#cp-ok').onclick=function(){var b=this,pick=dr.map(function(x,i){return {name:x.name,date:$('[data-cpd="'+i+'"]').value,kind:'company',on:$('[data-cpi="'+i+'"]').checked}}).filter(function(x){return x.on}),n=0,last=null;busy(b,1);
      pick.reduce(function(p,x){return p.then(function(){return aCall('saveHoliday',x).then(function(r){if(r.ok){n++;last=r}})})},Promise.resolve()).then(function(){busy(b,0);if(last)done(last,'คัดลอกแล้ว '+n+' วัน');else{closeD();toast('ไม่มีวันที่คัดลอกได้ (อาจซ้ำกับวันหยุดเดิม)',1)}}).catch(function(e){busy(b,0);toast(e.message,1)})}};
  $('#hol-add').onclick=function(){form(null)};
  $$('[data-hed]').forEach(function(b){b.onclick=function(){form(A.cfg.holidays.filter(function(h){return h.date===b.dataset.hed})[0])}});
  $$('[data-hdel]').forEach(function(b){b.onclick=function(){var h=A.cfg.holidays.filter(function(x){return x.date===b.dataset.hdel})[0];
    drawer('ลบวันหยุด','<p>ลบ <b>'+esc(h.name)+'</b> ('+esc(h.date)+')?</p><div class="faint" style="font-size:13px">ถ้าวันนี้ผ่านมาแล้ว คนที่ไม่ได้ลงเวลาในวันนั้นจะถูกนับเป็นขาดงาน</div>','<button class="btn bad" id="hdok">ลบวันหยุด</button>');
    $('#hdok').onclick=function(){var x=this;busy(x,1);aCall('deleteHoliday',h.date).then(function(r){done(r,'ลบวันหยุดแล้ว')}).catch(function(e){busy(x,0);toast(e.message,1)})}}});
}
function bShift(){$$('[data-shsave]').forEach(function(b){b.onclick=function(){var tr=b.closest('tr'),o={id:b.dataset.shsave};$$('[data-shf]',tr).forEach(function(x){o[x.dataset.shf]=x.value.trim()});
  $$('.f',tr).forEach(function(l){l.classList.remove('bad');var e=l.querySelector('.er');if(e)e.remove()});busy(b,1);
  aCall('saveShift',o).then(function(r){busy(b,0);if(!r.ok){Object.keys(r.errors).forEach(function(k){var i=tr.querySelector('[data-shf="'+k+'"]');if(i){i.parentNode.classList.add('bad');i.parentNode.insertAdjacentHTML('beforeend','<span class="er">'+esc(r.errors[k])+'</span>')}});return}
   var m={};r.shifts.forEach(function(x){m[x.id]=x});A.cfg.shifts=A.cfg.shifts.map(function(x){return Object.assign({},x,m[x.id]||{},{late_after_min:x.id===o.id?o.late_after_min:x.late_after_min})});drawSet();toast('บันทึกกะ'+o.name+'แล้ว')}).catch(function(e){busy(b,0);toast(e.message,1)})}})}
function shiftProfileCard(p,edit){var sl=p.shiftList||[],sh=p.shifts||{allowed:[],default:''},nm=function(id){var x=sl.filter(function(s){return s.id===id})[0];return x?x.name:id};
  return '<section class="card"><div class="ch"><h3>กะการทำงาน (เลือกตอนลงเวลา)</h3>'+(edit?'<button class="btn sm" id="shed" style="margin-left:auto">แก้ไข</button>':'')+'</div><div class="cb">'+(sh.allowed.length===1?'<span class="faint">กะเดียว: '+shDot(sh.allowed[0])+esc(nm(sh.allowed[0]))+' · ไม่แสดงแถบเลือกกะ (ใช้กะนี้อัตโนมัติ)</span>':sh.auto?'<dl class="kv"><dt>เลือกได้</dt><dd>ทุกกะ <span class="faint">(ค่าเริ่มต้น)</span></dd><dt>กะประจำ</dt><dd>'+shDot(sh.default)+esc(nm(sh.default))+' <span class="faint">ตามเวลาเข้างานในโปรไฟล์</span></dd></dl>':
   '<dl class="kv"><dt>เลือกได้</dt><dd>'+sh.allowed.map(function(id){var x=sl.filter(function(s){return s.id===id})[0];return shDot(id)+esc(nm(id))+(x?' <span class="faint">'+esc(x.start)+'–'+esc(x.end)+'</span>':'')}).join('<br>')+'</dd><dt>กะประจำ</dt><dd>'+shDot(sh.default)+esc(nm(sh.default))+'</dd></dl><div class="faint" style="font-size:12px;margin-top:8px">เลือกกะที่ไม่ใช่กะประจำ → แจ้งหัวหน้าทีม</div>')+'</div></section>'}
function bShiftProfile(){if(!$('#shed'))return;$('#shed').onclick=function(){var sl=PROF.shiftList||[],sh=PROF.shifts||{allowed:[],default:''};
  drawer('กะการทำงานของพนักงาน','<div class="faint" style="font-size:13px;margin-bottom:10px">ไม่ติ๊กเลย = เลือกได้ทุกกะ (ค่าเริ่มต้น) · ติ๊ก 1 กะ = ไม่แสดงแถบเลือกกะ ใช้กะนั้นเลย · ติ๊ก 2 กะขึ้นไป = เลือกได้เฉพาะกะที่ติ๊ก</div>'+sl.map(function(x){return '<label style="display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)"><input type="checkbox" data-sha="'+esc(x.id)+'"'+(!sh.auto&&sh.allowed.indexOf(x.id)>=0?' checked':'')+' style="width:auto">'+shDot(x.id)+'<b style="flex:1">'+esc(x.name)+'</b><span class="faint">'+esc(x.start)+'–'+esc(x.end)+' · สายหลัง '+esc(x.late_after)+'</span></label>'}).join('')+
   '<label class="f" style="margin-top:12px"><span>กะประจำ</span><select id="shdef">'+sl.map(function(x){return '<option value="'+esc(x.id)+'"'+(sh.default===x.id?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select></label>','<button class="btn pri" id="shok">บันทึก</button>');
  $('#shok').onclick=function(){var b=this,ids=$$('[data-sha]').filter(function(c){return c.checked}).map(function(c){return c.dataset.sha});busy(b,1);
   aCall('saveEmployeeShifts',A.id,{shift_ids:ids,default_shift:$('#shdef').value}).then(function(r){if(!r.ok){busy(b,0);return toast(r.errors.shift_ids||'บันทึกไม่ได้',1)}PROF.shifts=r.shifts;closeD();render();toast('บันทึกกะแล้ว')}).catch(function(e){busy(b,0);toast(e.message,1)})}}}


/* ───────── ตารางงาน › รายงานตารางงาน (3 พ.ย. 2569 ผู้ใช้ขอ: รายคน/รายทีม ไปงานกี่วันจากวันทำงานของเดือน · ไปโปรเจกต์ไหน · การจัดคนในทีม · กรองตามตำแหน่ง) ─────────
 * schedReport(ym) คืนรายคน (วันไปงาน/วันทำงาน · วันหยุดที่ไปงาน · ลา · ว่าง · โปรเจกต์) + โปรเจกต์ + ยืมตัวข้ามทีม · รวมรายทีมในหน้าเว็บ (ตามตัวกรองตำแหน่ง) */
function srYmTxt(ym){return TH_M[+ym.slice(5,7)-1]+' '+(+ym.slice(0,4)+543)}
function srYms(){var t=locISO().slice(0,7),y=+t.slice(0,4),m=+t.slice(5,7),o=[];for(var i=1;i>=-12;i--){var x=new Date(y,m-1+i,1);o.push(x.getFullYear()+'-'+('0'+(x.getMonth()+1)).slice(-2))}return o}
function srPct(a,b){return b?Math.round(a*100/b):0}
function srBar(a,b){var p=Math.min(100,srPct(a,b)),c=p>=80?'hi':p>=50?'md':'lo';return '<span class="sr-bar '+c+'"><i style="width:'+p+'%"></i></span>'}
function srFrac(a,b){return '<b class="num">'+f1s(a)+'</b><span class="faint">/'+b+'</span>'}
function f1s(x){return x%1?(+x).toFixed(1):String(x)}
function srTeam(id){return id?org('teams',id)||'—':'ไม่มีทีม'}
function srPj(d,k){return (d.pjm||{})[k]||{k:k,title:k.replace(/^T:/,''),pm:''}}
function srPjName(p){return p.pm&&p.title.indexOf(p.pm)<0?p.pm+' · '+p.title:p.title}
function vSrep(){A.srYm=A.srYm||locISO().slice(0,7);A.srTab=A.srTab||'team';A.srD=A.srD||'all';A.srT=A.srT||'all';A.srP=A.srP||'all';A.srQ=A.srQ||'';
  var tab=function(k,l){return '<button type="button" data-srt="'+k+'"'+(A.srTab===k?' aria-pressed="true"':'')+'>'+l+'</button>'},sc=acc('att');
  return '<div class="ph"><div><h1>รายงานตารางงาน</h1><div class="sub">วันไปงานเทียบวันทำงานของเดือน · โปรเจกต์ · การจัดคนในทีม · ขอบเขต: '+esc(scopeTxt('att'))+'</div></div><span class="sp"></span><button class="btn btn-ex" id="sr-xls">'+fileIc('xls')+'Export Excel</button></div>'+
   '<div class="rp-tabs" role="group" aria-label="มุมมอง">'+tab('team','รายทีม')+tab('emp','รายคน')+tab('proj','รายโปรเจกต์')+'</div>'+
   '<section class="card rp-tools" style="padding:14px 16px"><div class="rp-f"><label>เดือน<select id="sr-ym">'+srYms().map(function(y){return '<option value="'+y+'"'+(A.srYm===y?' selected':'')+'>'+srYmTxt(y)+'</option>'}).join('')+'</select></label>'+
    (sc==='all'?'<label>แผนก<select id="sr-dep"></select></label>':'')+(sc==='all'||sc==='dept'?'<label>ทีม<select id="sr-team"></select></label>':'')+
    '<label>ตำแหน่ง<select id="sr-pos"></select></label><label>ค้นหา<input type="search" id="sr-q" placeholder="ชื่อ รหัส หรือโปรเจกต์" value="'+esc(A.srQ)+'"></label></div></section>'+
   '<div id="sr-body"><div class="loading"><span class="spin"></span></div></div>'}
function bSrep(){
  var load=function(){$('#sr-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังรวมข้อมูล '+esc(srYmTxt(A.srYm))+'…</div>';var y=A.srYm;
    aCall('schedReport',y).then(function(d){if(A.srYm!==y)return;d.pjm={};d.projects.forEach(function(p){d.pjm[p.k]=p});A.sr=d;drawSrep()}).catch(function(e){if($('#sr-body'))$('#sr-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $$('[data-srt]').forEach(function(b){b.onclick=function(){A.srTab=b.dataset.srt;$$('[data-srt]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});drawSrep()}});
  $('#sr-ym').onchange=function(){A.srYm=this.value;load()};
  if($('#sr-dep'))$('#sr-dep').onchange=function(){A.srD=this.value;A.srT='all';drawSrep()};
  if($('#sr-team'))$('#sr-team').onchange=function(){A.srT=this.value;drawSrep()};
  $('#sr-pos').onchange=function(){A.srP=this.value;drawSrep()};
  var qt;$('#sr-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){A.srQ=v;drawSrep()},200)};
  $('#sr-xls').onclick=srCsv;
  if(A.sr&&A.sr.ym===A.srYm)drawSrep();else load()}
/* ตัวกรอง: แผนก → ทีม → ตำแหน่ง (แสดงเฉพาะที่มีคนในรายงาน + จำนวนคน) */
function srOpts(){var d=A.sr,o=function(v,l,n,cur){return '<option value="'+esc(v)+'"'+(cur===v?' selected':'')+'>'+esc(l)+(n?' ('+n+')':'')+'</option>'},cd={},ct={},cp={},pn={};
  d.people.forEach(function(p){cd[p.dept_id]=(cd[p.dept_id]||0)+1;if(A.srD!=='all'&&p.dept_id!==A.srD)return;ct[p.team_id]=(ct[p.team_id]||0)+1;if(A.srT!=='all'&&p.team_id!==A.srT)return;var k=p.pos||'(ไม่ระบุ)';cp[k]=(cp[k]||0)+1});
  if(A.srD!=='all'&&!cd[A.srD])A.srD='all';if(A.srT!=='all'&&!ct[A.srT])A.srT='all';if(A.srP!=='all'&&!cp[A.srP])A.srP='all';
  if($('#sr-dep'))$('#sr-dep').innerHTML=o('all','ทุกแผนก',d.people.length,A.srD)+Object.keys(cd).map(function(k){return [k,org('departments',k)||'ไม่มีแผนก']}).sort(function(a,b){return a[1].localeCompare(b[1],'th')}).map(function(x){return o(x[0],x[1],cd[x[0]],A.srD)}).join('');
  if($('#sr-team'))$('#sr-team').innerHTML=o('all','ทุกทีม',0,A.srT)+Object.keys(ct).map(function(k){return [k,srTeam(k)]}).sort(function(a,b){return a[1].localeCompare(b[1],'th')}).map(function(x){return o(x[0],x[1],ct[x[0]],A.srT)}).join('');
  $('#sr-pos').innerHTML=o('all','ทุกตำแหน่ง',0,A.srP)+Object.keys(cp).sort(function(a,b){return a.localeCompare(b,'th')}).map(function(k){return o(k,k,cp[k],A.srP)}).join('')}
function srPeople(){var d=A.sr,q=(A.srQ||'').trim().toLowerCase();
  return d.people.filter(function(p){if(A.srD!=='all'&&p.dept_id!==A.srD)return false;if(A.srT!=='all'&&p.team_id!==A.srT)return false;if(A.srP!=='all'&&(p.pos||'(ไม่ระบุ)')!==A.srP)return false;
    if(!q)return true;if((p.code+' '+p.name+' '+p.nick).toLowerCase().indexOf(q)>=0)return true;return Object.keys(p.proj).some(function(k){return srPjName(srPj(d,k)).toLowerCase().indexOf(q)>=0})})}
function srTeams(rows){var d=A.sr,m={},tin={};(d.teams||[]).forEach(function(t){tin[t.team_id]=t});
  rows.forEach(function(p){var t=m[p.team_id]=m[p.team_id]||{id:p.team_id,dept_id:p.dept_id,n:0,work:0,wd:0,extra:0,leave:0,idle:0,out:0,low:[],full:0,proj:{}};
    t.n++;t.work+=p.work;t.wd+=p.wd;t.extra+=p.extra;t.leave+=p.leave;t.idle+=p.idle;t.out+=p.cross;Object.keys(p.proj).forEach(function(k){t.proj[k]=1});
    var r=srPct(p.work,p.wd);if(r<50)t.low.push(p);if(r>=100)t.full++});
  return Object.keys(m).map(function(k){var t=m[k];t.in=(tin[k]||{}).in||0;t.np=Object.keys(t.proj).length;return t}).sort(function(a,b){return srPct(b.work,b.wd)-srPct(a.work,a.wd)})}
function drawSrep(){var d=A.sr;if(!d||!$('#sr-body'))return;srOpts();var rows=srPeople(),T=srTeams(rows);
  var tw=0,twd=0,tex=0,tlv=0,low=0,cr=0,pj={};rows.forEach(function(p){tw+=p.work;twd+=p.wd;tex+=p.extra;tlv+=p.leave;cr+=p.cross;if(srPct(p.work,p.wd)<50)low++;Object.keys(p.proj).forEach(function(k){pj[k]=1})});
  var cur=d.ym===d.today.slice(0,7),kp=function(l,v,s){return '<div class="sr-k"><small>'+l+'</small><b>'+v+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>'};
  var h='<div class="sr-ks">'+kp('พนักงาน',rows.length+' คน',T.length+' ทีม')+kp('ไปงาน / วันทำงาน',f1s(tw)+'<small>/'+twd+' คน-วัน</small>',srPct(tw,twd)+'% ของวันทำงาน')+kp('ไปงานวันหยุด',f1s(tex)+'<small> คน-วัน</small>','อาทิตย์ · วันหยุดบริษัท · วันนอกตาราง')+
    kp('โปรเจกต์',Object.keys(pj).length,'ที่คนในรายงานไปทำ')+kp('ช่วยทีมอื่น',cr+'<small> คน-วัน</small>','ไปงานของทีมอื่น')+kp('ไปงานไม่ถึงครึ่ง',low+' คน','ไปงานต่ำกว่า 50% ของวันทำงาน')+'</div>'+
    (cur?'<div class="faint sr-note">เดือนนี้ยังไม่จบ · วันทำงานนับทั้งเดือน (รวมวันที่ยังไม่ถึง) · งานที่จัดล่วงหน้านับรวมแล้ว</div>':'');
  if(!rows.length){$('#sr-body').innerHTML=h+'<section class="card"><div class="rp-empty">ไม่พบข้อมูลตามเงื่อนไขนี้</div></section>';return}
  if(A.srTab==='team')h+=srTeamT(T);else if(A.srTab==='proj')h+=srProjT(rows);else h+=srEmpT(rows);
  $('#sr-body').innerHTML=h;
  $$('[data-srtm]').forEach(function(r){r.onclick=function(){A.srT=r.dataset.srtm;A.srD='all';A.srTab='emp';$$('[data-srt]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.srt==='emp')});drawSrep();scrollTo(0,0)}});
  $$('[data-srp]').forEach(function(r){r.onclick=function(){srPerson(r.dataset.srp)}});
  $$('[data-srj]').forEach(function(r){r.onclick=function(){srProj(r.dataset.srj)}})}
function srTeamT(T){return '<section class="card" style="padding:0;overflow:auto"><table class="xd-t sr-t"><thead><tr><th>ทีม</th><th class="num">คน</th><th>ไปงาน / วันทำงาน (คน-วัน)</th><th class="num">เฉลี่ยต่อคน</th><th class="num">วันหยุดที่ไปงาน</th><th class="num">ลา</th><th class="num">ว่าง</th><th class="num">โปรเจกต์</th><th class="num" title="คนทีมอื่นมาช่วยงานของทีมนี้">ยืมคนทีมอื่น</th><th class="num" title="คนในทีมไปช่วยงานของทีมอื่น">ไปช่วยทีมอื่น</th><th>ไปงานไม่ถึงครึ่ง</th></tr></thead><tbody>'+
  T.map(function(t){var avg=t.n?t.work/t.n:0,wa=t.n?Math.round(t.wd/t.n):0;
    return '<tr class="ck" data-srtm="'+esc(t.id)+'" title="ดูรายคนของทีมนี้"><td><b>'+esc(srTeam(t.id))+'</b><small class="sr-sub">'+esc(org('departments',t.dept_id))+'</small></td><td class="num">'+t.n+'</td><td><div class="sr-uc">'+srBar(t.work,t.wd)+srFrac(t.work,t.wd)+'<span class="sr-pc">'+srPct(t.work,t.wd)+'%</span></div></td>'+
     '<td class="num">'+avg.toFixed(1)+'<span class="faint">/'+wa+' วัน</span></td><td class="num">'+(t.extra?f1s(t.extra):'<span class="faint">0</span>')+'</td><td class="num">'+f1s(t.leave)+'</td><td class="num">'+f1s(t.idle)+'</td><td class="num">'+t.np+'</td><td class="num">'+(t.in||'<span class="faint">0</span>')+'</td><td class="num">'+(t.out||'<span class="faint">0</span>')+'</td>'+
     '<td>'+(t.low.length?t.low.slice(0,4).map(function(p){return '<span class="sr-chip">'+esc(p.nick||p.name)+' '+srPct(p.work,p.wd)+'%</span>'}).join('')+(t.low.length>4?'<span class="faint"> +'+(t.low.length-4)+'</span>':''):'<span class="faint">—</span>')+'</td></tr>'}).join('')+
  '</tbody></table></section><div class="faint sr-note">กดที่ทีมเพื่อดูรายคน · คน-วัน = จำนวนคน × จำนวนวัน · ว่าง = วันทำงานที่ไม่มีงานและไม่ได้ลา</div>'}
function srEmpT(rows){var d=A.sr,s=A.srS||{k:'pct',dir:-1},val=function(p){return s.k==='pct'?srPct(p.work,p.wd):s.k==='name'?p.code:p[s.k]};
  rows=rows.slice().sort(function(a,b){var x=val(a),y=val(b);return ((typeof x==='string'?x.localeCompare(y):x-y)*s.dir)||(a.code<b.code?-1:1)});
  var th=function(k,l,c){var on=s.k===k;return '<th class="'+(c||'')+' sk'+(on?' on':'')+'" data-srs="'+k+'">'+l+(on?(s.dir<0?' ↓':' ↑'):'')+'</th>'};
  setTimeout(function(){$$('[data-srs]').forEach(function(t){t.onclick=function(e){e.stopPropagation();var k=t.dataset.srs;A.srS=s.k===k?{k:k,dir:-s.dir}:{k:k,dir:k==='name'?1:-1};drawSrep()}})});
  return '<section class="card" style="padding:0;overflow:auto"><table class="xd-t sr-t"><thead><tr>'+th('name','พนักงาน')+'<th>ตำแหน่ง · ทีม</th>'+th('pct','ไปงาน / วันทำงาน')+th('extra','วันหยุดที่ไปงาน','num')+th('leave','ลา','num')+th('idle','ว่าง','num')+th('cross','ช่วยทีมอื่น','num')+th('nproj','โปรเจกต์ที่ไป')+'</tr></thead><tbody>'+
   rows.map(function(p){var pk=Object.keys(p.proj).sort(function(a,b){return p.proj[b]-p.proj[a]});
    return '<tr class="ck" data-srp="'+esc(p.id)+'"><td><b>'+esc(p.name)+'</b><small class="sr-sub">('+esc(p.nick||'-')+') · '+esc(p.code)+'</small></td><td>'+esc(p.pos||'—')+'<small class="sr-sub">'+esc(srTeam(p.team_id))+'</small></td>'+
     '<td><div class="sr-uc">'+srBar(p.work,p.wd)+srFrac(p.work,p.wd)+'<span class="sr-pc">'+srPct(p.work,p.wd)+'%</span></div></td><td class="num">'+(p.extra||'<span class="faint">0</span>')+'</td><td class="num">'+(p.leave?f1s(p.leave):'<span class="faint">0</span>')+'</td><td class="num">'+f1s(p.idle)+'</td><td class="num">'+(p.cross||'<span class="faint">0</span>')+'</td>'+
     '<td class="sr-pjs">'+(pk.length?pk.slice(0,3).map(function(k){var j=srPj(d,k);return '<span class="sr-chip" title="'+esc(j.title)+'">'+esc(j.pm||j.title.slice(0,22))+' <em>'+p.proj[k]+'</em></span>'}).join('')+(pk.length>3?'<span class="faint"> +'+(pk.length-3)+'</span>':''):'<span class="faint">ไม่มีงาน</span>')+'</td></tr>'}).join('')+
   '</tbody></table></section><div class="faint sr-note">กดที่ชื่อเพื่อดูปฏิทินรายวันและโปรเจกต์ทั้งหมด · ตัวเลขในป้ายโปรเจกต์ = จำนวนวัน</div>'}
function srProjT(rows){var d=A.sr,ids={},q=(A.srQ||'').trim().toLowerCase();rows.forEach(function(p){ids[p.id]=1});
  var L=d.projects.map(function(j){var ps=Object.keys(j.people).filter(function(i){return ids[i]});return {j:j,ps:ps,pd:ps.reduce(function(s,i){return s+j.people[i]},0)}}).filter(function(x){return x.ps.length||(!q&&A.srD==='all'&&A.srT==='all'&&A.srP==='all'&&x.j.other)})
    .filter(function(x){return !q||srPjName(x.j).toLowerCase().indexOf(q)>=0||x.ps.length}).sort(function(a,b){return b.pd-a.pd});
  var P={};d.people.forEach(function(p){P[p.id]=p});
  return '<section class="card" style="padding:0;overflow:auto"><table class="xd-t sr-t"><thead><tr><th>โปรเจกต์</th><th>ทีมเจ้าของงาน</th><th>ช่วงที่มีคนไป</th><th class="num">วัน</th><th class="num">คน-วัน</th><th>คนที่ไป (วัน)</th></tr></thead><tbody>'+
   L.map(function(x){var j=x.j,ps=x.ps.sort(function(a,b){return j.people[b]-j.people[a]});
    return '<tr class="ck" data-srj="'+esc(j.k)+'"><td><b class="sr-wrap" style="display:block">'+esc(j.pm||j.title)+'</b>'+(j.pm?'<small class="sr-sub sr-wrap">'+esc(j.title)+'</small>':'<small class="sr-sub">ไม่มีเลข PM</small>')+'</td><td>'+esc(srTeam(j.team_id))+'</td><td>'+esc(j.from===j.to?sd(j.from):sd(j.from)+' – '+sd(j.to))+'</td><td class="num">'+j.ndays+'</td><td class="num">'+x.pd+(j.other?'<small class="sr-sub" title="คนนอกตัวกรอง/ขอบเขต">+'+j.other+' อื่น</small>':'')+'</td>'+
     '<td class="sr-pjs">'+ps.slice(0,6).map(function(i){var p=P[i];return '<span class="sr-chip'+(p.team_id!==j.team_id&&j.team_id?' x':'')+'"'+(p.team_id!==j.team_id&&j.team_id?' title="ยืมจากทีม '+esc(srTeam(p.team_id))+'"':'')+'>'+esc(p.nick||p.name)+' <em>'+j.people[i]+'</em></span>'}).join('')+(ps.length>6?'<span class="faint"> +'+(ps.length-6)+'</span>':'')+'</td></tr>'}).join('')+
   '</tbody></table></section><div class="faint sr-note">'+L.length+' โปรเจกต์ · ป้ายเส้นประ = ยืมคนจากทีมอื่น · โปรเจกต์รวมตามเลข PM (งานหลายใบเลขเดียวกันรวมเป็นโปรเจกต์เดียว)</div>'}
/* รายละเอียดรายคน: ปฏิทินทั้งเดือน + โปรเจกต์ทั้งหมด */
function srPerson(id){var d=A.sr,p=d.people.filter(function(x){return x.id===id})[0];if(!p)return;
  var first=new Date(d.from+'T12:00:00').getDay(),cells='';for(var i=0;i<first;i++)cells+='<i></i>';
  d.dates.forEach(function(ds){var js=p.days[ds]||[],lv=p.lvDays[ds],ho=d.holidays[ds],idle=p.idleDays.indexOf(ds)>=0,c=js.length?'j':lv?'l':ho?'h':idle?'i':'o';
    var t=js.map(function(k){return srPjName(srPj(d,k))}).join(' · ')||(lv?'ลา'+(lv<1?'ครึ่งวัน':''):ho?ho:idle?'ว่าง (วันทำงาน ไม่มีงาน)':'วันหยุด');
    cells+='<b class="sr-d '+c+'" title="'+esc(sd(ds)+' · '+t)+'">'+(+ds.slice(8))+(js.length>1?'<em>'+js.length+'</em>':'')+'</b>'});
  var pk=Object.keys(p.proj).sort(function(a,b){return p.proj[b]-p.proj[a]});
  drawer(p.name+' ('+(p.nick||'-')+')','<div class="sr-pp"><div class="faint">'+esc(p.code)+' · '+esc(p.pos||'—')+' · '+esc(srTeam(p.team_id))+' · '+esc(srYmTxt(d.ym))+'</div>'+
    '<div class="sr-ks sm">'+[['ไปงาน',f1s(p.work)+'/'+p.wd+' วัน'],['วันหยุดที่ไปงาน',p.extra+' วัน'],['ลา',f1s(p.leave)+' วัน'],['ว่าง',f1s(p.idle)+' วัน']].map(function(x){return '<div class="sr-k"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'}).join('')+'</div>'+
    '<div class="sr-cal">'+THD.map(function(x){return '<s>'+x+'</s>'}).join('')+cells+'</div><div class="sr-lg"><span class="j">ไปงาน</span><span class="i">ว่าง</span><span class="l">ลา</span><span class="h">วันหยุด</span></div>'+
    '<h4 style="margin:18px 0 8px">โปรเจกต์ที่ไป ('+pk.length+')</h4>'+(pk.length?'<ul class="sr-pl">'+pk.map(function(k){var j=srPj(d,k),ds=Object.keys(p.days).filter(function(x){return p.days[x].indexOf(k)>=0}).sort();
      return '<li><div><b>'+esc(j.pm||j.title)+'</b>'+(j.pm?'<small>'+esc(j.title)+'</small>':'')+'<small>'+esc(ds.map(function(x){return +x.slice(8)}).join(', '))+' '+esc(THM[+d.ym.slice(5,7)-1])+(j.team_id&&j.team_id!==p.team_id?' · งานของทีม '+esc(srTeam(j.team_id)):'')+'</small></div><span class="num">'+p.proj[k]+' วัน</span></li>'}).join('')+'</ul>':'<div class="faint">เดือนนี้ยังไม่มีชื่อในงาน</div>')+'</div>')}
function srProj(k){var d=A.sr,j=d.pjm[k];if(!j)return;var P={};d.people.forEach(function(p){P[p.id]=p});var ps=Object.keys(j.people).sort(function(a,b){return j.people[b]-j.people[a]});
  drawer(j.pm||j.title,'<div class="sr-pp"><div class="faint">'+esc(j.title)+'<br>ทีมเจ้าของงาน: '+esc(srTeam(j.team_id))+' · '+esc(j.from===j.to?sd(j.from):sd(j.from)+' – '+sd(j.to))+' · '+j.njobs+' ใบงาน</div>'+
   '<div class="sr-ks sm">'+[['วันที่มีคนไป',j.ndays+' วัน'],['คน-วัน',j.pdays],['คน',ps.length+(j.other?' + อื่น':'')]].map(function(x){return '<div class="sr-k"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>'}).join('')+'</div>'+
   '<ul class="sr-pl">'+ps.map(function(i){var p=P[i];return '<li><div><b>'+esc(p.name)+' ('+esc(p.nick||'-')+')</b><small>'+esc(p.pos||'—')+' · '+esc(srTeam(p.team_id))+(j.team_id&&p.team_id!==j.team_id?' · ยืมตัว':'')+'</small></div><span class="num">'+j.people[i]+' วัน</span></li>'}).join('')+
   (j.other?'<li><div><span class="faint">คนนอกขอบเขต/ตัวกรอง</span></div><span class="num">'+j.other+' คน-วัน</span></li>':'')+'</ul></div>')}
function srCsv(){var d=A.sr;if(!d)return;var rows=srPeople(),q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v},out,nm;
  if(A.srTab==='team'){nm='ทีม';out=[['ทีม','แผนก','คน','ไปงาน (คน-วัน)','วันทำงาน (คน-วัน)','%','เฉลี่ยต่อคน','วันหยุดที่ไปงาน','ลา','ว่าง','โปรเจกต์','ยืมคนทีมอื่น','ไปช่วยทีมอื่น','ไปงานไม่ถึงครึ่ง']];
    srTeams(rows).forEach(function(t){out.push([srTeam(t.id),org('departments',t.dept_id),t.n,t.work,t.wd,srPct(t.work,t.wd),t.n?(t.work/t.n).toFixed(1):0,t.extra,t.leave,t.idle,t.np,t.in,t.out,t.low.map(function(p){return p.nick||p.name}).join(' ')])})}
  else if(A.srTab==='proj'){nm='โปรเจกต์';var P={};d.people.forEach(function(p){P[p.id]=p});out=[['เลข PM','ชื่องาน','ทีมเจ้าของงาน','ตั้งแต่','ถึง','วัน','คน-วัน','คนที่ไป']];
    d.projects.forEach(function(j){out.push([j.pm,j.title,srTeam(j.team_id),j.from,j.to,j.ndays,j.pdays,Object.keys(j.people).map(function(i){return (P[i].nick||P[i].name)+' '+j.people[i]}).join(', ')])})}
  else{nm='รายคน';out=[['รหัส','ชื่อ','ชื่อเล่น','ตำแหน่ง','ทีม','ไปงาน (วัน)','วันทำงาน','%','วันหยุดที่ไปงาน','ลา','ว่าง','ช่วยทีมอื่น','โปรเจกต์ (วัน)']];
    rows.forEach(function(p){out.push([p.code,p.name,p.nick,p.pos,srTeam(p.team_id),p.work,p.wd,srPct(p.work,p.wd),p.extra,p.leave,p.idle,p.cross,Object.keys(p.proj).map(function(k){var j=srPj(d,k);return (j.pm||j.title)+' '+p.proj[k]}).join(', ')])})}
  var blob=new Blob(['\ufeff'+out.map(function(r){return r.map(q).join(',')}).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='รายงานตารางงาน_'+nm+'_'+d.ym+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
