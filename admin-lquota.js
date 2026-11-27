/* การลา › โควตาการลา (27 พ.ย. 2569 · Figma หน้า 69 · เซิร์ฟเวอร์ app/gas/leave/LeaveQuota.js)
 * ภาพรวมทุกคนตามขอบเขต "ดูการลา" · HR / ผู้ดูแลแก้รายคน + ตั้งหลายคน · ค่าตั้งต้นตามอายุงาน (ตั้งค่า › การลา) */
function lqCanSee(){return isHR()||['team','dept','all'].indexOf(acc('leave'))>=0}
function lqY(){return A.lqY||(A.lqY=+dIso(new Date()).slice(0,4))}
function lqNum(v){return v==null?'—':(v%1?v.toFixed(1):String(v))}
function lqThD(d){return d?(+d.slice(8,10))+' '+['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][+d.slice(5,7)-1]+' '+(+d.slice(0,4)+543):''}
function lqSt(c){if(c.q===null)return 'inf';if(c.left<0)return 'over';if(c.q===0&&!c.own)return 'none';if(c.left<=1)return 'low';return 'ok'}
function lqEmp(r){var p=String(r.name||'').split(' ');return {id:r.id,first_name:p[0]||'?',last_name:p.slice(1).join(' ')}}
function vLvq(){var y=lqY(),cy=+dIso(new Date()).slice(0,4),can=isHR();
  return '<div class="ph"><div><h1>การลา</h1><div class="sub">โควตาปี '+(y+543)+' · ใช้ไป · คงเหลือ ของพนักงาน'+(acc('leave')==='all'||can?'ทุกคน':'ในขอบเขตของคุณ')+(can?' · ตั้งเองรายคนได้':'')+'</div></div><span class="sp"></span>'+
   '<span class="og9-sel"><select id="lq-y" aria-label="ปีโควตา">'+[cy-1,cy,cy+1].map(function(v){return '<option value="'+v+'"'+(v===y?' selected':'')+'>ปี '+(v+543)+'</option>'}).join('')+'</select><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>'+
   exBtn('xls','lq-xls')+(can?'<button class="btn pri" id="lq-bulk" disabled>ตั้งโควตาหลายคน</button>':'')+'</div>'+lvTabs('quota')+'<div id="lq-body">'+SK('rows')+'</div>'}
function bLvq(){var load=function(){$('#lq-body').innerHTML=SK('rows');aCall('leaveQuotaList',lqY()).then(function(d){A.lqD=d;A.lqSel={};lqDraw()}).catch(function(e){if($('#lq-body'))$('#lq-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $('#lq-y').onchange=function(){A.lqY=+this.value;load()};
  $('#lq-xls').onclick=lqCsv;if($('#lq-bulk'))$('#lq-bulk').onclick=lqBulk;
  if(A.lqD&&A.lqD.year===lqY())lqDraw();else load()}
function lqRows(){var d=A.lqD,f=A.lqF||'all',dp=A.lqDept||'all',q=String(A.lqQ||'').trim().toLowerCase();
  return d.rows.filter(function(r){if(dp!=='all'&&r.dept!==dp)return false;if(q&&(r.code+' '+r.name+' '+r.nick).toLowerCase().indexOf(q)<0)return false;
    var cs=d.types.map(function(t){return r.cells[t.id]});
    if(f==='own')return cs.some(function(c){return c&&c.own});if(f==='low')return cs.some(function(c){return c&&lqSt(c)==='low'});if(f==='over')return cs.some(function(c){return c&&lqSt(c)==='over'});
    if(f==='none')return cs.some(function(c){return c&&lqSt(c)==='none'});if(f==='nostart')return !r.start;return true})}
function lqCount(f){var o=A.lqF;A.lqF=f;var dp=A.lqDept,q=A.lqQ;A.lqDept='all';A.lqQ='';var n=lqRows().length;A.lqF=o;A.lqDept=dp;A.lqQ=q;return n}
function lqCell(c){if(!c)return '<span class="faint">—</span>';var st=lqSt(c);
  if(st==='inf')return '<div class="lq-c"><b>ไม่จำกัด</b><small>ใช้ '+lqNum(c.used)+(c.wait?' · รอ '+lqNum(c.wait):'')+'</small></div>';
  if(st==='none')return '<div class="lq-c lq-none"><b>ยังไม่ได้สิทธิ์</b><small>'+esc(c.note||'')+'</small></div>';
  var pc=c.q>0?Math.min(100,100*(c.used+c.wait)/c.q):(c.used+c.wait>0?100:0);
  return '<div class="lq-c lq-'+st+'"><div class="lq-t"><b>'+(st==='over'?'เกิน '+lqNum(-c.left):'เหลือ '+lqNum(c.left))+' วัน</b><small>ใช้ '+lqNum(c.used)+(c.wait?' + รอ '+lqNum(c.wait):'')+' / '+lqNum(c.q)+'</small>'+(c.own?'<span class="lq-own" title="'+esc(c.reason||'')+'">ตั้งเอง</span>':'')+'</div><i class="lq-bar"><i style="width:'+pc+'%"></i></i>'+(c.own?'<small class="faint">'+esc(c.reason||'')+'</small>':c.note?'<small class="faint">'+esc(c.note)+'</small>':'')+'</div>'}
function lqDraw(){var d=A.lqD,b=$('#lq-body');if(!b||!d)return;var can=d.canEdit,f=A.lqF||'all',dp=A.lqDept||'all';
  var depts={};d.rows.forEach(function(r){var k=r.dept||'ไม่มีแผนก';depts[k]=(depts[k]||0)+1});
  var L=lqRows(),N=A.lqN||60,sel=A.lqSel||{},nSel=Object.keys(sel).length;
  var kp=function(k,lab,n,col,hint){return '<button type="button" class="kpi lq-k'+(f===k?' on':'')+'" data-lqf="'+k+'"><small class="muted">'+lab+'</small><b style="font-size:22px'+(col?';color:'+col:'')+'">'+n+'</b><small class="faint">'+hint+'</small></button>'};
  var chip=function(k,lab,n){return '<button type="button" data-lqd="'+esc(k)+'" aria-pressed="'+(dp===k)+'">'+esc(lab)+' <small>'+n+'</small></button>'};
  b.innerHTML='<div class="ms-k lq-ks">'+kp('all','พนักงานทั้งหมด',d.rows.length,'','คนที่ยังทำงาน')+kp('own','ตั้งเองรายคน',lqCount('own'),'','HR แก้ทับค่าตามกติกา')+kp('none','ยังไม่ได้สิทธิ์',lqCount('none'),'#9A5B00','อายุงานหรือทดลองงานยังไม่ครบ')+kp('low','ใกล้หมดโควตา',lqCount('low'),'#9A5B00','เหลือไม่เกิน 1 วัน')+kp('over','เกินโควตา',lqCount('over'),'#B42318','ลาเกินจำนวนวันที่ได้')+'</div>'+
   '<div class="card lq-bar0"><div class="lq-chips" role="group" aria-label="แผนก">'+chip('all','ทุกแผนก',d.rows.length)+Object.keys(depts).sort().map(function(k){return chip(k,k,depts[k])}).join('')+'</div>'+
   '<input type="search" id="lq-q" class="amp-in" placeholder="ค้นหา ชื่อ / ชื่อเล่น / รหัส" value="'+esc(A.lqQ||'')+'" aria-label="ค้นหา"></div>'+
   (f!=='all'?'<div class="lq-fnote">กรอง: '+esc({own:'ตั้งเองรายคน',none:'ยังไม่ได้สิทธิ์',low:'ใกล้หมดโควตา',over:'เกินโควตา',nostart:'ไม่มีวันเริ่มงาน'}[f]||f)+' · '+L.length+' คน <button type="button" class="btn sm" data-lqf="all">ดูทั้งหมด</button></div>':'')+
   (lqCount('nostart')&&f!=='nostart'?'<div class="note-b" style="margin:0 0 12px">มีพนักงาน '+lqCount('nostart')+' คนที่ไม่มีวันเริ่มงานในระบบ · ระบบให้โควตาเต็มไปก่อน <button type="button" class="btn sm" data-lqf="nostart">ดูรายชื่อ</button></div>':'')+
   '<section class="card"><div class="tw"><table class="lq-tb"><thead><tr>'+(can?'<th class="lq-ck"><input type="checkbox" id="lq-all" aria-label="เลือกทั้งหมดที่แสดง"'+(L.length&&L.every(function(r){return sel[r.id]})?' checked':'')+'></th>':'')+'<th>พนักงาน</th><th>อายุงาน</th>'+d.types.map(function(t){return '<th>'+esc(t.name)+'<small class="faint">'+(t.quota===null?'ไม่จำกัด':lqNum(t.quota)+' วัน/ปี')+'</small></th>'}).join('')+'<th></th></tr></thead><tbody>'+
   (L.length?L.slice(0,N).map(function(r){var over=d.types.some(function(t){var c=r.cells[t.id];return c&&lqSt(c)==='over'});
     return '<tr data-lqr="'+r.id+'"'+(over?' class="lq-hl"':'')+'>'+(can?'<td class="lq-ck"><input type="checkbox" data-lqs="'+r.id+'" aria-label="เลือก '+esc(r.name)+'"'+(sel[r.id]?' checked':'')+'></td>':'')+
      '<td><div class="lq-who">'+av(lqEmp(r),34)+'<div><b>'+esc(r.name)+(r.nick?' <span class="faint">'+esc(r.nick)+'</span>':'')+'</b><small>'+esc(r.code)+' · '+esc(r.dept||'—')+(r.team?' · '+esc(r.team):'')+'</small></div></div></td>'+
      '<td><b class="lq-ten">'+(r.tenure?esc(r.tenure):'<span class="lq-warn">ไม่มีวันเริ่มงาน</span>')+'</b>'+(r.start?'<small class="faint">เริ่ม '+lqThD(r.start)+'</small>':'')+'</td>'+
      d.types.map(function(t){return '<td>'+lqCell(r.cells[t.id])+'</td>'}).join('')+'<td><button type="button" class="btn sm" data-lqe="'+r.id+'">'+(can?'แก้ไข':'ดู')+'</button></td></tr>'}).join(''):'<tr><td colspan="'+(d.types.length+(can?4:3))+'" class="muted" style="text-align:center;padding:28px">ไม่พบพนักงานตามที่กรอง</td></tr>')+
   '</tbody></table></div>'+(L.length>N?'<div style="padding:12px 16px;text-align:center"><button type="button" class="btn" id="lq-more">แสดงเพิ่ม · อีก '+(L.length-N)+' คน</button></div>':'')+'<div class="faint lq-foot">แสดง '+Math.min(N,L.length)+' จาก '+L.length+' คน · แถวสีแดงอ่อน = มีประเภทที่ลาเกินโควตา · ค่าตามกติกาคิดจากวันเริ่มงาน ตั้งที่ ตั้งค่า › การลา</div></section>';
  var bb=$('#lq-bulk');if(bb){bb.disabled=!nSel;bb.textContent=nSel?'ตั้งโควตา '+nSel+' คน':'ตั้งโควตาหลายคน'}
  $$('[data-lqf]').forEach(function(x){x.onclick=function(){A.lqF=x.dataset.lqf;A.lqN=60;lqDraw()}});
  $$('[data-lqd]').forEach(function(x){x.onclick=function(){A.lqDept=x.dataset.lqd;A.lqN=60;lqDraw()}});
  var qt;$('#lq-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){A.lqQ=v;A.lqN=60;lqDraw();var i=$('#lq-q');if(i){i.focus();i.setSelectionRange(v.length,v.length)}},250)};
  if($('#lq-more'))$('#lq-more').onclick=function(){A.lqN=N+60;lqDraw()};
  $$('[data-lqe]').forEach(function(x){x.onclick=function(){lqOpen(x.dataset.lqe)}});
  $$('[data-lqs]').forEach(function(x){x.onchange=function(){if(x.checked)sel[x.dataset.lqs]=1;else delete sel[x.dataset.lqs];A.lqSel=sel;lqDraw()}});
  if($('#lq-all'))$('#lq-all').onchange=function(){var on=this.checked;L.forEach(function(r){if(on)sel[r.id]=1;else delete sel[r.id]});A.lqSel=sel;lqDraw()}}
/* แผงรายคน */
function lqOpen(id){drawer('โควตาการลา',SK('g','กำลังโหลด…'));aCall('leaveQuotaGet',id,lqY()).then(function(g){lqForm(g)}).catch(function(e){$('.drw .cb').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function lqForm(g){var r=g.row,can=g.canEdit,st={};g.types.forEach(function(t){var c=r.cells[t.id]||{};st[t.id]={own:!!c.own,q:c.own?c.q:'',reason:c.own?c.reason:''}});
  var KR={day1:'ตั้งแต่วันแรก',months:'ทำงานครบ N เดือน',probation:'ผ่านทดลองงาน'},FR={full:'ได้เต็ม',prorata:'ปีแรกได้ตามสัดส่วนเดือนที่เหลือ'};
  var card=function(t){var c=r.cells[t.id]||{},s=st[t.id],q=s.own&&s.q!==''&&!isNaN(+s.q)?+s.q:c.rule,left=q===null?null:q-c.used-c.wait;
    return '<div class="lq-tc'+(s.own?' own':'')+'" data-lqt="'+t.id+'"><div class="lq-th"><b>'+esc(t.name)+'</b><span class="badge '+(s.own?'b-info':'b-mute')+'">'+(s.own?'ตั้งเองรายคน':'ใช้ค่าตามกติกา')+'</span></div>'+
     (can?'<div class="segt lq-seg" role="group" aria-label="วิธีคิดโควตา '+esc(t.name)+'"><button type="button" data-lqm="rule" aria-pressed="'+!s.own+'">ตามกติกา · '+(c.rule===null?'ไม่จำกัด':lqNum(c.rule)+' วัน')+'</button><button type="button" data-lqm="own" aria-pressed="'+s.own+'">ตั้งเองรายคน</button></div>':'')+
     '<div class="faint lq-rn">กติกา: '+esc(KR[t.kind].replace('N',t.months))+' · '+esc(FR[t.first])+(t.quota===null?' · ไม่จำกัดวัน':' · '+lqNum(t.quota)+' วันต่อปี')+(c.note?' · '+esc(c.note):'')+'</div>'+
     (s.own&&can?'<div class="lq-in"><label class="f" data-lk="'+t.id+'"><span>โควตาปีนี้ (วัน)</span><input data-lqq inputmode="decimal" value="'+esc(s.q)+'"><span class="er"></span></label><label class="f lq-rs"><span>เหตุผล · บันทึกใน Audit Log</span><input data-lqrs maxlength="200" placeholder="เช่น ข้อตกลงตอนรับเข้า · ยกยอดจากปีก่อน" value="'+esc(s.reason)+'"></label></div>':'')+
     '<div class="lq-st"><div><small>โควตา</small><b>'+lqNum(q)+'</b></div><div><small>ใช้ไป</small><b>'+lqNum(c.used)+'</b></div><div><small>รออนุมัติ</small><b style="color:#9A5B00">'+lqNum(c.wait)+'</b></div><div><small>คงเหลือ</small><b style="color:'+(left===null?'inherit':left<0?'#B42318':'#1A7A42')+'">'+(left===null?'—':left<0?'เกิน '+lqNum(-left):lqNum(left))+'</b></div></div></div>'};
  var draw=function(){$('.drw .cb').innerHTML='<div class="lq-hd">'+av(lqEmp(r),48)+'<div><b>'+esc(r.name)+(r.nick?' <span class="faint">'+esc(r.nick)+'</span>':'')+'</b><small>'+esc(r.code)+' · '+esc(r.dept||'—')+(r.pos?' · '+esc(r.pos):'')+'</small></div></div>'+
     '<div class="lq-ten2"><div><small>เริ่มงาน</small><b>'+(r.start?lqThD(r.start):'<span class="lq-warn">ไม่มีในระบบ</span>')+'</b></div><div><small>อายุงาน</small><b>'+esc(r.tenure||'—')+'</b></div><div><small>ปีโควตา</small><b>'+(g.year+543)+'</b></div></div>'+
     g.types.map(card).join('')+
     '<div class="lq-hist"><b>ประวัติการแก้โควตา</b>'+(g.hist.length?g.hist.map(function(h){return '<div><span class="faint">'+esc(String(h.at).slice(0,10).split('-').reverse().join('/'))+'</span> <b>'+esc(h.by)+'</b> '+esc(h.type)+' '+esc(lqNum(typeof h.from==='number'?h.from:null)==='—'?String(h.from):lqNum(h.from))+' → '+esc(typeof h.to==='number'?lqNum(h.to):String(h.to))+(h.reason?' · '+esc(h.reason):'')+'</div>'}).join(''):'<div class="faint">ยังไม่เคยแก้ · ใช้ค่าตามกติกาทุกประเภท</div>')+'</div>';
    $$('.drw [data-lqt]').forEach(function(el){var id=el.dataset.lqt;
      el.querySelectorAll('[data-lqm]').forEach(function(b){b.onclick=function(){st[id].own=b.dataset.lqm==='own';if(st[id].own&&st[id].q===''){var c=r.cells[id]||{};st[id].q=c.rule===null?'':String(c.rule)}draw();if(st[id].own){var i=$('.drw [data-lqt="'+id+'"] [data-lqq]');if(i){i.focus();i.select()}}}});
      var qi=el.querySelector('[data-lqq]'),ri=el.querySelector('[data-lqrs]');if(qi)qi.oninput=function(){st[id].q=qi.value.trim();var c=r.cells[id]||{},q=+st[id].q,box=el.querySelector('.lq-st');if(box&&st[id].q!==''&&!isNaN(q)){var left=q-c.used-c.wait,bs=box.querySelectorAll('b');bs[0].textContent=lqNum(q);bs[3].textContent=left<0?'เกิน '+lqNum(-left):lqNum(left);bs[3].style.color=left<0?'#B42318':'#1A7A42'}};if(ri)ri.oninput=function(){st[id].reason=ri.value}})};
  $('.drw h3').textContent='โควตาการลา · '+r.name;draw();
  var ft=lqFoot();
  ft.innerHTML=can?'<span class="faint lq-fn">กลับไปใช้ค่าตามกติกาได้ทุกเมื่อ · มีผลกับใบลาใหม่ทันที</span><button class="btn" id="lq-x">ยกเลิก</button><button class="btn pri" id="lq-sv">บันทึก</button>':'<span class="faint lq-fn">ดูอย่างเดียว · แก้ได้เฉพาะ HR / ผู้ดูแล</span><button class="btn" id="lq-x">ปิด</button>';
  $('#lq-x').onclick=closeD;
  if(can)$('#lq-sv').onclick=function(){var b=this,items=g.types.map(function(t){var s=st[t.id];return s.own?{type_id:t.id,mode:'own',quota:s.q,reason:String(s.reason||'').trim()}:{type_id:t.id,mode:'rule'}});
    busy(b,1);aCall('leaveQuotaSave',r.id,g.year,items).then(function(res){busy(b,0);if(!res.ok){Object.keys(res.errors).forEach(function(k){var x=$('.drw [data-lk="'+k+'"]');if(x){x.classList.add('bad');x.querySelector('.er').textContent=res.errors[k]}});toast('ตรวจช่องที่มีกรอบแดง',1);return}
      toast(res.changed?'บันทึกโควตาแล้ว · '+res.changed+' ประเภท':'ไม่มีอะไรเปลี่ยน');lqPatch(res.data.row);closeD()}).catch(function(e){busy(b,0);toast(e.message,1)})}}
function lqFoot(){var x=$('.drw .lq-df');if(!x){x=document.createElement('div');x.className='ch lq-df';x.style.cssText='border-top:1px solid var(--line);border-bottom:0;justify-content:flex-end;gap:8px';$('.drw').appendChild(x)}return x}
function lqPatch(row){var d=A.lqD;if(!d)return;for(var i=0;i<d.rows.length;i++)if(d.rows[i].id===row.id){d.rows[i]=row;break}lqDraw()}
/* ตั้งหลายคน */
function lqBulk(){var d=A.lqD,ids=Object.keys(A.lqSel||{});if(!d||!ids.length)return toast('ติ๊กเลือกพนักงานก่อน',1);
  var T=d.types.filter(function(t){return t.quota!==null}),st={t:(T[0]||{}).id,op:'set',n:'',reason:''};
  var nm=function(id){var r=d.rows.filter(function(x){return x.id===id})[0];return r?r.name:id};
  drawer('ตั้งโควตาหลายคน','');var draw=function(){$('.drw .cb').innerHTML='<div class="lq-bk">'+
     '<label class="f"><span>ประเภทการลา</span><select id="lqb-t">'+T.map(function(t){return '<option value="'+t.id+'"'+(st.t===t.id?' selected':'')+'>'+esc(t.name)+'</option>'}).join('')+'</select></label>'+
     '<div class="segt lq-seg" role="group" aria-label="วิธีตั้ง">'+[['set','ตั้งเป็น N วัน'],['add','เพิ่ม / ลด N วัน'],['rule','กลับไปใช้ค่าตามกติกา']].map(function(o){return '<button type="button" data-lqo="'+o[0]+'" aria-pressed="'+(st.op===o[0])+'">'+o[1]+'</button>'}).join('')+'</div>'+
     (st.op!=='rule'?'<div class="lq-in"><label class="f" data-lk="n"><span>'+(st.op==='add'?'เพิ่ม / ลด (วัน) · ลดใส่ติดลบ เช่น -1':'จำนวนวัน')+'</span><input id="lqb-n" inputmode="decimal" value="'+esc(st.n)+'"><span class="er"></span></label><label class="f lq-rs" data-lk="reason"><span>เหตุผล · บันทึกใน Audit Log</span><input id="lqb-r" maxlength="200" placeholder="เช่น ยกยอดวันลาพักร้อนจากปีก่อน" value="'+esc(st.reason)+'"><span class="er"></span></label></div>':'<div class="faint" style="font-size:13px">ลบค่าที่ตั้งเองของประเภทนี้ แล้วกลับไปใช้ค่าตามอายุงาน</div>')+
     '<div class="lq-who2"><b>ใช้กับ '+ids.length+' คนที่ติ๊กไว้ · ปี '+(d.year+543)+'</b><span>'+ids.slice(0,12).map(function(i){return esc(nm(i))}).join(' · ')+(ids.length>12?' · และอีก '+(ids.length-12)+' คน':'')+'</span></div></div>';
    $('#lqb-t').onchange=function(){st.t=this.value};$$('[data-lqo]').forEach(function(b){b.onclick=function(){st.op=b.dataset.lqo;draw()}});
    if($('#lqb-n'))$('#lqb-n').oninput=function(){st.n=this.value.trim()};if($('#lqb-r'))$('#lqb-r').oninput=function(){st.reason=this.value}};
  draw();var ft=lqFoot();
  ft.innerHTML='<span class="sp"></span><button class="btn" id="lqb-x">ยกเลิก</button><button class="btn pri" id="lqb-go">ดูตัวอย่างก่อนบันทึก</button>';$('#lqb-x').onclick=closeD;
  $('#lqb-go').onclick=function(){var b=this,tn=(T.filter(function(t){return t.id===st.t})[0]||{}).name||'';busy(b,1);
    aCall('leaveQuotaBulk',ids,d.year,st.t,st.op,st.n,st.reason,false).then(function(p){busy(b,0);if(!p.ok){Object.keys(p.errors).forEach(function(k){var x=$('.drw [data-lk="'+k+'"]');if(x){x.classList.add('bad');x.querySelector('.er').textContent=p.errors[k]}});return}
      var ch=p.items.filter(function(x){return !x.skip&&x.from!==x.to});
      ask({title:'ตั้ง'+tn+' '+p.items.length+' คน?',desc:(st.op==='rule'?'กลับไปใช้ค่าตามกติกา':st.op==='add'?(+st.n>0?'เพิ่ม ':'ลด ')+lqNum(Math.abs(+st.n))+' วัน':'ตั้งเป็น '+lqNum(+st.n)+' วัน')+' · ปี '+(d.year+543)+(st.reason?' · '+st.reason:'')+' · เปลี่ยนจริง '+ch.length+' คน',
        list:p.items.slice(0,30).map(function(x){return [x.name,x.skip?x.skip:lqNum(x.from),x.skip?'ไม่เปลี่ยน':lqNum(x.to)+(x.own?'':' ตามกติกา')]}),buttons:[{k:'no',label:'ยกเลิก'},{k:'yes',label:'บันทึก '+p.items.length+' คน',cls:'pri'}]}).then(function(k){if(k!=='yes')return;busy(b,1);
        aCall('leaveQuotaBulk',ids,d.year,st.t,st.op,st.n,st.reason,true).then(function(r){busy(b,0);closeD();toast('บันทึกแล้ว · เปลี่ยน '+r.changed+' คน');A.lqSel={};aCall('leaveQuotaList',d.year).then(function(x){A.lqD=x;lqDraw()})}).catch(function(e){busy(b,0);toast(e.message,1)})})}).catch(function(e){busy(b,0);toast(e.message,1)})}}
function lqCsv(){var d=A.lqD;if(!d)return;var q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  var hd=['รหัส','ชื่อ','ชื่อเล่น','แผนก','ทีม','เริ่มงาน','อายุงาน'];d.types.forEach(function(t){hd.push(t.name+' โควตา',t.name+' ใช้ไป',t.name+' รออนุมัติ',t.name+' คงเหลือ',t.name+' ที่มา')});var out=[hd];
  lqRows().forEach(function(r){var a=[r.code,r.name,r.nick,r.dept,r.team,r.start,r.tenure];d.types.forEach(function(t){var c=r.cells[t.id]||{};a.push(c.q===null?'ไม่จำกัด':c.q,c.used,c.wait,c.left===null?'':c.left,c.own?'ตั้งเอง · '+(c.reason||''):(c.note||'ตามกติกา'))});out.push(a)});
  var blob=new Blob(['﻿'+out.map(function(r){return r.map(q).join(',')}).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='โควตาการลา_'+(d.year+543)+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
