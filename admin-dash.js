/* หลังบ้าน (admin.html) · Dashboard · ศูนย์อนุมัติ
 * แยกจากสคริปต์ในหน้า admin.html 31 ต.ค. 2569 (ปรับโครงสร้างขั้น 5 · ย้ายทั้งก้อนตามลำดับเดิม ไม่แก้เนื้อ)
 * ทุกไฟล์ admin-*.js ใช้ชื่อร่วมกัน (global) และต้องโหลดตามลำดับใน admin.html */
'use strict';
/* ───────── Dashboard ───────── */
function vDash(){var nm=String(A.d.me.nickname||A.d.me.name||'').split(' ')[0];return '<div class="ph"><div><h1>'+(A.d.me.id==='admin'?'Dashboard':'สวัสดี คุณ'+esc(nm))+'</h1><div class="sub" id="db-sub">กำลังโหลด…</div></div><span class="sp"></span><button class="btn" id="db-re">รีเฟรช</button></div><div id="db-body"><div class="loading"><span class="spin"></span>กำลังโหลด…</div></div>'}
function bDash(){var load=function(force){aCall('hrDashboard',!!force).then(function(d){A.db=d;A.dbAt=Date.now();var w=(A.fxAt||0)+2600-Date.now();if(w>0)setTimeout(drawDash,w);else drawDash()}).catch(function(e){if($('#db-body')&&!A.db)$('#db-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $('#db-re').onclick=function(){$('#db-sub').textContent='กำลังรีเฟรช…';fxArm('dash');load(true)};if(A.db)drawDash();if(!A.db||Date.now()-(A.dbAt||0)>60000)load()}
function drawDash(){if(!$('#db-body'))return;var d=A.db,k=d.kpi,dt=new Date(d.date+'T12:00:00'),TD=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'],TM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  if(d.lead){drawLead(d);return}
  $('#db-sub').textContent='ขอบเขตข้อมูล: '+d.scope+(coCur()?' · '+(((A.d.companies||[]).filter(function(c){return c.id===coCur()})[0]||{}).short||''):'')+' · '+TD[dt.getDay()]+' '+dt.getDate()+' '+TM[dt.getMonth()]+' '+(dt.getFullYear()+543)+' · อัปเดต '+new Date().toTimeString().slice(0,5)+' น.';
  var kpi=function(go,icn,l,v,sub,tone){return '<button class="kpi'+(tone?' t-'+tone:'')+'" data-go="'+go+'"><span class="kh"><i>'+ic(icn)+'</i><span class="l">'+l+'</span></span><span class="v num">'+v+'</span><span class="d">'+sub+'</span></button>'};
  var SEV={bad:['clockx','#FCE8E6','#C0392B'],warn:['alarm','#FFF3DC','#B26A00']},mine=A.d.me.id!=='admin';
  var tr=d.trend.length?'<div class="bars2">'+d.trend.map(function(t,i){var last=i===d.trend.length-1,dd=new Date(t.date+'T12:00:00');return '<div class="bc'+(last?' hi':'')+'" title="'+t.date+' · '+t.pct+'%"><span>'+t.pct+'%</span><i style="height:calc((100% - 44px) * '+(Math.max(3,t.pct)/100)+')"></i><em>'+dd.getDate()+' '+TM[dd.getMonth()]+'</em></div>'}).join('')+'</div><div class="faint" style="font-size:12px;margin-top:10px">ล่าสุด '+d.trend[d.trend.length-1].pct+'%'+(d.trend[d.trend.length-1].live?' (วันนี้ · ยังลงเวลาไม่ครบ)':'')+' · เข้างานวันนี้ '+k.present+' จาก '+k.expected+' คน</div>':'<div class="muted">ยังไม่มีข้อมูลสรุปรายวัน (ระบบสรุปทุกคืน 23:30)</div>';
  /* แบบ C (Figma 03 · 6 ใบ): รวม "มาสาย" + "ยังไม่ลงเวลา" เป็น "ต้องติดตามวันนี้" · เพิ่มลาวันนี้ + วันหยุดถัดไป */
  var two=function(a,al,b,bl,ca,cb){return '<span class="kv2"><b class="'+ca+'">'+a+'</b><small>'+al+'</small><i></i><b class="'+cb+'">'+b+'</b><small>'+bl+'</small></span>'};
  var lt=(k.leaveTypes||[]).map(function(x){return x.name.replace(/^ลา/,'')+' '+x.n}).join(' · '),nh=k.nextHoliday,pk=k.pendingKinds||{};
  var follow=(k.late||0)+(k.absent||0);
  $('#db-body').innerHTML='<div class="grid g6">'+
    kpi('list','emp','พนักงานทั้งหมด',k.total,'ทดลองงาน '+k.probation+' · ลาระยะยาว '+k.longLeave)+
    kpi('att','clock','เข้างานวันนี้',k.present+' / '+k.expected,pct(k.present,k.expected)+'% · ลา '+k.leaveToday+' คน','ok')+
    kpi('att','clockx','ต้องติดตามวันนี้',two(k.late||0,'มาสาย',k.absent||0,'ยังไม่ลงเวลา','warn','bad'),follow?'กดเพื่อดูรายชื่อ':'ทุกคนลงเวลาแล้ว',follow?'bad':'ok')+
    kpi('lv','leave','ลาวันนี้',two(k.leaveToday||0,'',(k.leaveAhead?'+'+k.leaveAhead:'0'),'ล่วงหน้า 7 วัน','info','mut'),lt||'ไม่มีคนลาวันนี้','info')+
    kpi('set','cal','วันหยุดถัดไป',nh?(+nh.date.slice(8,10))+' '+TM[+nh.date.slice(5,7)-1]:'—',nh?esc(nh.name)+' · '+(nh.days?'อีก '+nh.days+' วัน':'วันนี้'):'ยังไม่มีวันหยุดที่กำหนด')+
    kpi('appr','check','รออนุมัติ',k.pending,(pk.leave||pk.line||pk.device||pk.help)?['ลา '+(pk.leave||0),'เชื่อม LINE '+(pk.line||0)].concat(pk.device?['เครื่องใหม่ '+pk.device]:[]).concat(pk.help?['แจ้งปัญหา '+pk.help]:[]).join(' · '):'ไม่มีคำขอค้าง')+'</div>'+
   '<div class="grid '+(mine?'g-side':'')+'" style="margin-top:14px"><section class="card"><div class="ch"><h3>อัตราเข้างาน '+d.trend.length+' วันล่าสุด</h3><span class="sp"></span><button class="btn sm" data-go="att">ลงเวลาวันนี้</button></div><div class="cb">'+tr+'</div></section>'+
    (mine?'<section class="card mine"><div class="ch"><h3>ของฉัน</h3><span class="sp"></span>'+(A.d.me.role!=='exec'?'<button class="btn sm" data-go="profile" data-id="'+esc(A.d.me.id)+'">ข้อมูลพนักงาน</button>':'')+'</div><div class="cb" id="db-mine"><div class="who2"><span class="av" data-av="'+esc(A.d.me.id)+'" style="width:52px;height:52px">'+esc((A.d.me.nickname||A.d.me.name||'?').slice(0,1))+'</span><div><b style="font-size:15px">'+esc(A.d.me.name)+(A.d.me.nickname?' ('+esc(A.d.me.nickname)+')':'')+'</b><div class="muted" style="font-size:12.5px">รหัส '+esc(A.d.me.code||'-')+' · '+esc(ROLE[A.d.me.role]||A.d.me.role)+'</div></div></div><div id="db-quota" class="faint" style="font-size:13px">กำลังโหลดโควตาการลา…</div></div></section>':'')+'</div>'+
   '<div class="grid g-side" style="margin-top:14px"><section class="card"><div class="ch"><h3>คำขอรออนุมัติ'+(d.pending.length?' ('+k.pending+')':'')+'</h3><span class="sp"></span><button class="btn sm" data-go="appr">ศูนย์อนุมัติ</button></div><div class="list">'+
    (d.pending.length?d.pending.map(function(p){return '<div class="li">'+(p.employee_id?av(emp(p.employee_id)||{id:p.employee_id,first_name:p.employee||'?',last_name:''},34):'<span class="av" style="width:34px;height:34px;font-size:12px;background:#EDEDED;color:#141414">'+esc((p.employee||'?').slice(0,1))+'</span>')+'<div style="flex:1;min-width:0"><b style="font-weight:600">'+esc(p.title)+'</b><div class="muted" style="font-size:12.5px">'+esc(p.sub)+'</div></div><span class="badge '+(p.kind==='line'?'b-ok':p.kind==='help'?'b-bad':'b-mute')+'">'+(p.kind==='line'?'เชื่อม LINE':p.kind==='help'?'แจ้งเข้าระบบไม่ได้':p.kind==='device'?'เครื่องใหม่':'คำขอลา')+'</span><button class="btn sm" data-go="appr">ดู</button></div>'}).join(''):'<div class="li muted">ไม่มีคำขอรออนุมัติ</div>')+'</div></section>'+
   '<section class="card"><div class="ch"><h3>รายการผิดปกติวันนี้</h3><span class="sp"></span><button class="btn sm" data-go="att">ดูทั้งหมด'+(d.anomalyCount>8?' ('+d.anomalyCount+')':'')+'</button></div><div class="list">'+
    (d.anomalies.length?d.anomalies.map(function(a){var v=SEV[a.sev]||SEV.warn;return '<button class="li" data-go="att" style="width:100%;border:0;border-bottom:1px solid var(--line);background:none;text-align:left;font:inherit;cursor:pointer"><span class="an-i" style="background:'+v[1]+';color:'+v[2]+'">'+ic(v[0])+'</span><div style="flex:1;min-width:0"><b style="font-weight:600">'+esc(a.title)+'</b><div class="muted" style="font-size:12.5px">'+esc(a.sub)+'</div></div><span class="faint">'+ic('chevR').replace('<svg','<svg width="16" height="16"')+'</span></button>'}).join(''):'<div class="li muted">ไม่มีรายการผิดปกติวันนี้</div>')+'</div></section></div>'+
   '<section class="card" style="margin-top:14px"><div class="ch"><h3>กำลังคนวันนี้ตามแผนก</h3></div><div class="cb" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px 28px">'+
    (d.departments.length?d.departments.map(function(x){return '<div><div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:5px"><span>'+esc(x.name)+'</span><span class="muted num">มา '+x.in+'/'+x.total+(x.leave?' · ลา '+x.leave:'')+'</span></div><div class="meter"><i style="width:'+pct(x.in,x.total)+'%"></i></div></div>'}).join(''):'<div class="muted">ยังไม่มีพนักงาน</div>')+'</div></section>';
  if(mine)loadMine();
  loadPhotos();
  $$('#db-body [data-go]').forEach(function(b){b.onclick=function(){go(b.dataset.go,b.dataset.id)}});
  pgFx();
}
/* ภาพเปิดหน้า (30 ต.ค. 2569 ผู้ใช้ขอ): ตัวเลขนับขึ้น (count-up) + กล่องเลื่อนขึ้นทีละใบ (staggered slide-up) + แท่งกราฟ/แถบโตขึ้น
 * เล่นเมื่อเข้าเมนู Dashboard / อนุมัติ / พนักงาน / การลา / รายงาน / ลงเวลา / ตารางงาน / Confirmed / โครงสร้างองค์กร / ตั้งค่า (ทุกแท็บ) / บันทึก error / Audit Log (go · หลังเข้าระบบ · สลับแท็บรายงาน) หรือกดรีเฟรช · A.fx = เมนูที่รอเล่น ('*' = หลังเข้าระบบ)
 * เล่นครั้งเดียวต่อการเข้า (พิมพ์ค้นหา/กรองไม่เล่น) · ข้อมูล Dashboard ใหม่มาระหว่างเล่น = รอเล่นจบค่อยวาด · ปิดเมื่อผู้ใช้ตั้งลดการเคลื่อนไหว */
var FXV={msg:1,dash:1,appr:1,list:1,lv:1,rep:1,set:1,att:1,sched:1,conf:1,org:1,errlog:1,audit:1};   // 30 ต.ค. 2569: + ลงเวลาวันนี้ · ตารางงาน · Confirmed · โครงสร้างองค์กร · ตั้งค่าทุกแท็บ · บันทึก error · Audit Log
function fxArm(v){A.fx=FXV[v]?v:null}   // แถบแท็บ/เมนูย่อย (เมนูซ้ายหน้าตั้งค่า · แท็บรายงาน/องค์กร/อนุมัติ) นิ่งเสมอ · กดเปลี่ยนแท็บ = ข้อมูลข้างในเล่นเต็ม (30 ต.ค. 2569 ผู้ใช้)
function pgFx(){var v=A.view,c=$('.content');if(c&&!A.fx&&A.fxLast&&A.fxLast.v===v&&Date.now()-A.fxLast.t<700)A.fx=v;   // วาดซ้ำทันทีหลังเล่น (เช่น โหลดข้อมูลเสร็จแล้ววาดใหม่) = เล่นต่อ ไม่ให้หายกลางทาง
  if(!c||!A.fx||(A.fx!==v&&A.fx!=='*')||!FXV[v])return;A.fx=null;A.fxLast={v:v,t:Date.now()};
  if(!Element.prototype.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var E='cubic-bezier(.2,.8,.2,1)',n=0,q=function(x){return [].slice.call(c.querySelectorAll(x))},db=v==='dash';
  q(db?'#db-body .kpi, #db-body > .grid > section, #db-body > section':'.sum > *, .rp-lg > *, .content > .tools, .content > section, #lv-body > section, #xd-body section, #ap-body .kpi, #ap-body > section, #us-body .an-c, #us-body .py-k, #st-body > *, #att-body > section, #au-body > section, #er-body > *, iframe.plf').forEach(function(e){if(n>24)return;e.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],{duration:850,delay:Math.min(120*n++,960),easing:E,fill:'backwards'})});
  q('.bars2 i').forEach(function(e,i){e.style.transformOrigin='bottom';e.animate([{transform:'scaleY(0)'},{transform:'none'}],{duration:1200,delay:600+70*i,easing:E,fill:'backwards'})});
  // Dashboard ผู้บริหาร (SVG): เส้นกราฟลากจากซ้ายไปขวา · แท่งโตจากล่าง · จุดปลายเส้นค่อยขึ้น
  q('#xd-body svg polyline, #xd-body svg path').forEach(function(e,i){var L=e.getTotalLength?e.getTotalLength():0;if(!L)return;e.animate([{strokeDasharray:L,strokeDashoffset:L},{strokeDasharray:L,strokeDashoffset:0}],{duration:1600,delay:500+40*i,easing:E,fill:'backwards'})});
  if(!db)q('.content table tbody tr').slice(0,14).forEach(function(e,i){e.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:600,delay:Math.min(260+40*i,900),easing:E,fill:'backwards'})});   // แถวตารางค่อยขึ้น (ทุกหน้าที่เป็นตาราง)
  q('#us-body .an-ch svg').forEach(function(e,i){e.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1600,delay:500+100*i,easing:E,fill:'backwards'})});   // Cloudflare: กราฟเส้นลากจากซ้ายไปขวา
  q('#xd-body svg rect').forEach(function(e,i){e.style.transformBox='fill-box';e.style.transformOrigin='bottom';e.animate([{transform:'scaleY(0)'},{transform:'none'}],{duration:1200,delay:600+70*i,easing:E,fill:'backwards'})});
  q('#xd-body svg circle').forEach(function(e){e.animate([{opacity:0},{opacity:1}],{duration:400,delay:2000,fill:'backwards'})});
  q('#xd-body i[style*="width"]').forEach(function(e,i){e.style.transformOrigin='left';e.animate([{transform:'scaleX(0)'},{transform:'none'}],{duration:1200,delay:900+30*i,easing:E,fill:'backwards'})});
  q('.meter i').forEach(function(e,i){e.style.transformOrigin='left';e.animate([{transform:'scaleX(0)'},{transform:'none'}],{duration:1200,delay:900+50*i,easing:E,fill:'backwards'})});
  var tx=[];q(db?'#db-body .kpi:not([data-go="set"]) .v, #db-body .bars2 span':'.sum b, .rp-lg > *, .xd-kv, #rp-body tbody td:not(:first-child), #xd-body .xd-t td.num, #xd-body svg.xd-bar text, #xd-body svg.xd-ln text:last-of-type, .content .kpi .v, #us-body .an-v, #us-body .py-k b').forEach(function(el){
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),t,td=el.tagName==='TD'||el.tagName==='text';while((t=w.nextNode())&&tx.length<600)if(t.parentNode.tagName!=='SMALL'&&(td?/^\s*[\d.,]+%?\s*$/:/\d/).test(t.nodeValue))tx.push([t,t.nodeValue])});
  if(!tx.length)return;var t0=performance.now(),D=2000;A.fxAt=Date.now();
  (function step(now){var p=Math.min(1,(now-t0)/D),k=1-Math.pow(1-p,3);
    tx.forEach(function(x){x[0].nodeValue=p<1?x[1].replace(/\d[\d,]*(\.\d+)?/g,function(m,f){var d=f?f.length-1:0,r=(+m.replace(/,/g,'')*k).toFixed(d);return m.indexOf(',')>0?(+r).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}):r}):x[1]});
    if(p<1)requestAnimationFrame(step)})(t0);
}
/* ภาพเปิดข้อมูลใน iframe ตารางงาน / Confirmed (planner.html · 30 ต.ค. 2569 ผู้ใช้ขอ): รอให้หน้าในกรอบวาดข้อมูลเสร็จ (ไม่มีการเปลี่ยนแปลง 300ms)
 * แล้วเล่นชุดเดียวกับหน้าอื่น: ป้ายสรุปเลื่อนขึ้น + ตัวเลขนับขึ้น · แถวตาราง/การ์ดค่อยขึ้น · เล่นครั้งเดียวต่อการเข้าเมนู (สลับมุมมองในตารางงานไม่เล่น) */
function fxFrame(fr){var d;try{d=fr.contentDocument}catch(e){return}var H=d&&d.documentElement,show=function(){if(H)H.classList.remove('fx-wait')};   // ข้อมูลถูกซ่อนไว้ตั้งแต่แรก (planner.html ?fx=1) → เผยตอนเริ่มเล่น ไม่กะพริบ
  if(!d||!d.body||!Element.prototype.animate||matchMedia('(prefers-reduced-motion: reduce)').matches){show();return}
  var done=0,tm=null,first=null,again=0,stop=setTimeout(function(){mo.disconnect();show()},8000);
  var run=function(){if(done)return;var rows=[].slice.call(d.querySelectorAll('table tbody tr')).filter(function(t){return t.offsetParent}),chips=[].slice.call(d.querySelectorAll('.hr-sum > *'));if(!rows.length&&!chips.length)return;
    done=1;first=chips[0]||rows[0];var E='cubic-bezier(.2,.8,.2,1)';requestAnimationFrame(show);   // ดูต่ออีก 2 วิ: ถ้าหน้าในกรอบวาดข้อมูลจริงทับ (ของเดิมหลุดจากหน้า) = เล่นใหม่ 1 ครั้ง
    setTimeout(function(){mo.disconnect();clearTimeout(stop)},2000);
    chips.forEach(function(e,i){e.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:800,delay:90*i,easing:E,fill:'backwards'})});
    rows.slice(0,16).forEach(function(e,i){e.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:650,delay:Math.min(250+45*i,1000),easing:E,fill:'backwards'})});
    var tx=[];chips.forEach(function(c){[].slice.call(c.querySelectorAll('b')).forEach(function(b){if(/^\s*\d+\s*$/.test(b.textContent))tx.push([b,b.textContent])})});
    if(!tx.length)return;var t0=performance.now(),D=2000;(function step(now){var p=Math.min(1,(now-t0)/D),k=1-Math.pow(1-p,3);tx.forEach(function(x){x[0].textContent=p<1?String(Math.round(+x[1]*k)):x[1]});if(p<1)requestAnimationFrame(step)})(t0)};
  var mo=new MutationObserver(function(){if(done&&first&&!first.isConnected&&!again){again=1;done=0;H.classList.add('fx-wait')}clearTimeout(tm);if(!done)tm=setTimeout(run,150)});mo.observe(d.body,{childList:true,subtree:true});tm=setTimeout(run,150)}
/* การ์ด "ของฉัน": โควตาการลาปีนี้ของผู้ใช้ (จำไว้ในหน้า · โหลดใหม่ทุก 5 นาที) */
function loadMine(){var draw=function(li){var q=$('#db-quota');if(!q)return;var ts=(li.types||[]).filter(function(t){return t.quota!==null});q.className='';q.innerHTML=ts.length?ts.map(function(t){var u=(t.used||0)+(t.reserved||0);return '<div class="q"><div><b style="font-weight:500">'+esc(t.name)+'</b><span class="num">ใช้ '+(+u.toFixed(1))+' / '+t.quota+' วัน</span></div><div class="tr"><i style="width:'+Math.min(100,t.quota?u/t.quota*100:0)+'%"></i></div></div>'}).join('')+'<div class="faint" style="font-size:12px">ปี '+(li.year+543)+' · รวมที่รออนุมัติ</div>':'<span class="faint">ไม่มีโควตาการลา</span>'};
  if(A.mine&&Date.now()-A.mine.at<300000)return draw(A.mine.d);aCall('leaveInfo').then(function(li){A.mine={at:Date.now(),d:li};draw(li)}).catch(function(){var q=$('#db-quota');if(q)q.textContent='โหลดโควตาไม่สำเร็จ'})}

/* ───────── ศูนย์อนุมัติ ───────── */
function vAppr(){if(A.apa===undefined){var tm=dpPresets(dIso(new Date())).filter(function(x){return x[0]==='tm'})[0];A.apa=tm[2];A.apb=tm[3]}// ค่าเริ่มต้น = เดือนปัจจุบัน
  return '<div class="ph"><div><h1>ศูนย์อนุมัติ</h1><div class="sub">คุณเป็นผู้อนุมัติในฐานะ '+ROLE[A.d.me.role]+' · คำขอทุกประเภทรวมไว้ที่นี่</div></div><span class="sp"></span>'+ofSel('ap')+dpBtn('ap-rg',A.apa,A.apb)+'</div><div id="ap-body"><div class="loading"><span class="spin"></span>กำลังโหลด…</div></div>'}
/* ตัวกรองแผนก/ทีม ใช้ร่วมหลายหน้า (ศูนย์อนุมัติ · การลา · ลงเวลาวันนี้) · k = ชื่อหน้า · ทีมแสดงเฉพาะในแผนกที่เลือก */
function ofSt(k){A.of=A.of||{};return A.of[k]||(A.of[k]={d:'all',t:'all'})}
function ofSel(k,every){var s=ofSt(k),o=A.d.org,vd={},vt={};A.d.employees.forEach(function(e){vd[e.department_id]=1;vt[e.team_id]=1});// ไม่ใช่ HR: แสดงเฉพาะแผนก/ทีมที่มีคนในขอบเขตที่เห็น
  var deps=o.departments.filter(function(d){return d.active!=='FALSE'&&(every||isHR()||vd[d.id])}).sort(function(a,b){return a.name.localeCompare(b.name)}),dep=deps.filter(function(d){return d.name===s.d})[0];
  var ts=o.teams.filter(function(t){return t.active!=='FALSE'&&(every||isHR()||vt[t.id])&&(!dep||t.department_id===dep.id)}).sort(function(a,b){return a.name.localeCompare(b.name)});
  var op=function(v,l,cur){return '<option value="'+esc(v)+'"'+(cur===v?' selected':'')+'>'+esc(l)+'</option>'};
  return '<span class="ofs" id="ofs-'+k+'"><select class="fsel" data-ofd="'+k+'" aria-label="แผนก">'+op('all','ทุกแผนก',s.d)+deps.map(function(d){return op(d.name,d.name,s.d)}).join('')+'</select><select class="fsel" data-oft="'+k+'" aria-label="ทีม">'+op('all','ทุกทีม',s.t)+ts.map(function(t){return op(t.name,t.name,s.t)}).join('')+'</select></span>'}
function ofBind(k,redraw,every){var w=$('#ofs-'+k);if(!w)return;var s=ofSt(k);
  w.querySelector('[data-ofd]').onchange=function(){s.d=this.value;s.t='all';w.outerHTML=ofSel(k,every);ofBind(k,redraw,every);redraw()};
  w.querySelector('[data-oft]').onchange=function(){s.t=this.value;redraw()}}
function ofOk(k,dept,team){var s=ofSt(k);return (s.d==='all'||dept===s.d)&&(s.t==='all'||team===s.t)}
function bAppr(){A.apTab=A.apTab||'pending';A.apType=A.apType||'all';
  ofBind('ap',drawAppr);
  $('#ap-rg').onclick=function(){var b=this;dpRange(b,{a:A.apa,b:A.apb,max:dIso(new Date())},function(a,z){A.apa=a;A.apb=z;b.querySelector('span').textContent=rngTxt(a,z);A.apFor=null;$('#ap-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังโหลด…</div>';loadAppr()})};if(A.ap&&A.apFor===A.apTab)drawAppr();loadAppr()}
function loadAppr(){var t=A.apTab;aCall('approvalCenter',t==='no'||t==='cancel'?'done':t,A.apa?A.apa+'..'+A.apb:'').then(function(d){if(t!==A.apTab)return;A.ap=d;A.apFor=t;drawAppr()}).catch(function(e){if($('#ap-body'))$('#ap-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function drawAppr(){if(!$('#ap-body'))return;var d=A.ap,k=d.kpi,T=A.apType;
  // แท็บ "ไม่อนุมัติ" = ดำเนินการแล้วซึ่งไม่อนุมัติหรือส่งกลับแก้ไข · แท็บ "ยกเลิกแล้ว" (28 ต.ค. 2569 ผู้ใช้ขอ) = คำขอที่ถูกยกเลิก
  var items=d.items.filter(function(x){return (T==='all'||x.kind===T)&&(A.apTab!=='no'||x.status==='no'||x.status==='back')&&(A.apTab!=='cancel'||x.status==='cancel')&&ofOk('ap',x.dept,x.team)});
  var kpi=function(l,v,sub,cls){return '<div class="kpi"><span class="l">'+l+'</span><span class="v num '+(cls||'')+'">'+v+'</span><span class="d">'+(sub||'&nbsp;')+'</span></div>'};
  var SB={wait:'b-warn',mgr:'b-warn',hr:'b-warn',chg:'b-info',ok:'b-ok',no:'b-bad',back:'b-warn',cancel:'b-mute'};
  var chip=function(v,l,dis){return '<button class="chip" data-aty="'+v+'" aria-pressed="'+(T===v)+'"'+(dis?' disabled title="เร็ว ๆ นี้"':'')+'>'+l+'</button>'};
  $('#ap-body').innerHTML='<div class="grid g4">'+kpi('คำขอทั้งหมด',k.month,esc(rngTxt(A.apa,A.apb)))+kpi('รออนุมัติ',k.pending,'ของคุณ (ทุกช่วงเวลา)',k.pending?'warn':'')+kpi('อนุมัติแล้ว',k.approved,esc(rngTxt(A.apa,A.apb)),'ok')+kpi('ไม่อนุมัติ / ส่งกลับ',k.rejected+' / '+k.back,esc(rngTxt(A.apa,A.apb)))+'</div>'+
   '<div class="toolbar" style="margin-top:14px"><div class="segt"><button data-atab="pending" aria-pressed="'+(A.apTab==='pending')+'">รออนุมัติ'+(k.pending?' ('+k.pending+')':'')+'</button><button data-atab="done" aria-pressed="'+(A.apTab==='done')+'">ดำเนินการแล้ว</button><button data-atab="no" aria-pressed="'+(A.apTab==='no')+'">ไม่อนุมัติ</button><button data-atab="cancel" aria-pressed="'+(A.apTab==='cancel')+'">ยกเลิกแล้ว</button></div>'+
    chip('all','ทุกประเภท')+chip('leave','คำขอลา')+chip('line','เชื่อม LINE')+chip('device','อุปกรณ์ใหม่')+chip('help','แจ้งเข้าระบบไม่ได้')+chip('ot','OT',1)+chip('time','แก้ไขเวลา',1)+chip('shift','เปลี่ยนตารางงาน',1)+'</div>'+
   '<section class="card"><div class="tw"><table style="min-width:900px"><thead><tr><th>เลขที่</th><th>ผู้ขอ</th><th>ประเภท</th><th>รายละเอียด</th><th>ผู้อนุมัติ</th><th>ยื่นเมื่อ</th><th>สถานะ</th></tr></thead><tbody>'+
   (items.length?items.map(function(x,i){return '<tr class="ck" data-api="'+i+'"><td class="mono">'+esc(x.no)+'</td><td><div class="who-c">'+av(emp(x.employee_id)||{id:x.employee_id,first_name:x.employee,last_name:''},28)+'<span>'+esc(x.employee)+'<small>'+esc(x.dept||'')+'</small></span></div></td>'+
     '<td><span class="badge '+(x.kind==='line'?'b-ok':x.kind==='device'?'b-warn':x.kind==='help'?'b-bad':'b-mute')+'">'+esc(x.type)+'</span></td><td>'+esc(x.title)+(x.self?' <span class="badge b-info">คำขอของคุณ</span>':'')+(x.edited?' <span class="badge b-info">แก้ไขแล้ว</span>':'')+'<div style="font-size:12.5px;color:'+(x.flags.length?'var(--bad)':'var(--fnt)')+'">'+esc(x.detail)+(x.flags.length?' · '+esc(x.flags[0]):'')+'</div></td>'+
     '<td style="font-size:12.5px">'+(x.history.length?x.history.map(function(h){return '<div>'+(h.step==='hr'?'HR':h.step==='mgr'?'ขั้นที่ 2':'ขั้นที่ 1')+' · '+esc(h.by||'—')+'</div>'}).join(''):'')+(x.stepText?'<div class="faint">รอ '+esc(x.stepText)+'</div>':x.history.length?'':'—')+'</td><td class="num">'+esc(fdt(x.created_at))+'</td><td><span class="badge '+(SB[x.status]||'b-mute')+'">'+esc(x.statusText)+'</span></td></tr>'}).join(''):'<tr><td colspan="7" class="muted" style="text-align:center;padding:28px">'+(A.apTab==='pending'?'ไม่มีคำขอรอคุณอนุมัติ':'ยังไม่มีรายการ')+'</td></tr>')+'</tbody></table></div></section>';
  loadPhotos();
  $$('[data-atab]').forEach(function(b){b.onclick=function(){A.apTab=b.dataset.atab;fxArm('appr');$('#ap-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังโหลด…</div>';loadAppr()}});
  $$('[data-aty]').forEach(function(b){b.onclick=function(){A.apType=b.dataset.aty;drawAppr()}});
  $$('[data-api]').forEach(function(tr){tr.onclick=function(){apDetail(items[+tr.dataset.api])}});
}
function fdt(s){if(!s)return '';var d=new Date(s);if(isNaN(d))return s;var TM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];return d.getDate()+' '+TM[d.getMonth()]+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function apDetail(x){var PART={full:'เต็มวัน',am:'ครึ่งเช้า',pm:'ครึ่งบ่าย'},ACT={ok:'อนุมัติ',partial:'อนุมัติบางวัน',no:'ไม่อนุมัติ',back:'ส่งกลับแก้ไข',ack:'HR รับทราบ',done:'ดำเนินการแล้ว',closed:'ปิดเรื่อง'};
  var body='<dl class="kv"><dt>เลขที่</dt><dd class="mono">'+esc(x.no)+'</dd><dt>ผู้ขอ</dt><dd>'+esc(x.code)+' '+esc(x.employee)+' · '+esc(x.dept||'')+'</dd><dt>ประเภท</dt><dd>'+esc(x.type)+'</dd><dt>รายละเอียด</dt><dd>'+esc(x.title)+'<br>'+esc(x.detail)+'</dd>'+(x.reason?'<dt>'+(x.kind==='help'?'ที่แจ้งมา':'เหตุผล')+'</dt><dd>'+esc(x.reason)+'</dd>':'')+'<dt>สถานะ</dt><dd>'+esc(x.statusText)+'</dd></dl>'+
   (x.days.length?'<h4 style="margin:14px 0 6px">วันลา</h4><ul class="tl">'+x.days.map(function(d){return '<li>'+esc(d.date)+' · '+(PART[d.part]||d.part)+(d.status==='no'?' · ไม่อนุมัติ':'')+'</li>'}).join('')+'</ul>':'')+
   (x.flags.length?'<div class="alert" style="margin-top:12px;background:var(--warn-s);color:var(--warn)">'+x.flags.map(esc).join('<br>')+'</div>':'')+
   (x.history.length?'<h4 style="margin:14px 0 6px">ประวัติ</h4><ul class="tl">'+x.history.map(function(h){return '<li>'+(h.step==='hr'?'HR':h.step==='mgr'?'ขั้นที่ 2':'ขั้นที่ 1')+' · '+(ACT[h.action]||h.action)+' · '+esc(h.by)+' · '+esc(fdt(h.at))+(h.note?' · '+esc(h.note):'')+'</li>'}).join('')+'</ul>':'')+
   (x.kind==='help'?'<div class="alert" style="margin-top:12px;background:#F5F5F5;color:var(--mut);font-size:13px">ตรวจตัวตนก่อนดำเนินการ เช่น โทรกลับตามเบอร์ในข้อมูลพนักงาน (ไม่ใช่เบอร์ที่กรอกมาเท่านั้น) · ห้ามแจ้งรหัสผ่านทางข้อความ</div>'+(x.mine?'<label class="f" style="margin-top:14px">บันทึกการดำเนินการ (จำเป็นเมื่อปิดเรื่อง)<textarea id="apn" rows="3" style="width:100%;border:1px solid var(--line);border-radius:7px;padding:8px"></textarea></label>':''):'')+
   (x.mine&&x.kind==='leave'?'<label class="f" style="margin-top:14px">หมายเหตุ (จำเป็นเมื่อไม่อนุมัติ/ส่งกลับ · ผู้ขอจะเห็น)<textarea id="apn" rows="3" style="width:100%;border:1px solid var(--line);border-radius:7px;padding:8px"></textarea></label>':'');
  var foot=!x.mine?'':x.kind==='help'?'<button class="btn ok" id="ap-ok">ดำเนินการแล้ว</button><button class="btn bad" id="ap-no">ปิดเรื่อง</button>':x.kind==='device'?'<button class="btn ok" id="ap-ok">อนุญาตเครื่องนี้</button><button class="btn bad" id="ap-no">ไม่อนุญาต</button>':x.kind==='line'?'<button class="btn ok" id="ap-ok">ยืนยันว่าเป็นพนักงานคนนี้</button><button class="btn bad" id="ap-no">ไม่ใช่</button>':
    '<button class="btn ok" id="ap-ok">'+(x.status==='chg'?'อนุมัติการยกเลิก':'อนุมัติ')+'</button>'+(x.status==='chg'?'':'<button class="btn" id="ap-back">ส่งกลับแก้ไข</button>')+'<button class="btn bad" id="ap-no">ไม่อนุมัติ</button>';
  drawer(x.type+' · '+x.no,body,foot);
  var after=function(m){closeD();toast(m);reload(false).then(function(){render()})};
  var dec=function(a){var n=($('#apn')||{}).value||'';if((a==='no'||a==='back')&&!n.trim()){toast('กรอกหมายเหตุ',1);return}
    aCall('decideLeave',x.id,a,n.trim(),[]).then(function(r){after({ok:'อนุมัติแล้ว',no:'ไม่อนุมัติแล้ว',back:'ส่งกลับแก้ไขแล้ว'}[a]+(r&&r.status==='hr'?' · ส่งต่อ HR':''))}).catch(function(e){toast(e.message,1)})};
  if(!x.mine)return;
  if(x.kind==='help'){var hd=function(ok){var n=($('#apn')||{}).value||'';if(!ok&&!n.trim()){toast('กรอกเหตุผลที่ปิดเรื่อง',1);return}aCall('decideLoginHelp',x.id,ok,n.trim()).then(function(){after(ok?'บันทึกว่าดำเนินการแล้ว':'ปิดเรื่องแล้ว')}).catch(function(e){toast(e.message,1)})};$('#ap-ok').onclick=function(){hd(true)};$('#ap-no').onclick=function(){hd(false)};return}
  if(x.kind==='device'){$('#ap-ok').onclick=function(){aCall('decideDevice',x.id,true).then(function(){after('อนุญาตอุปกรณ์แล้ว')}).catch(function(e){toast(e.message,1)})};$('#ap-no').onclick=function(){aCall('decideDevice',x.id,false).then(function(){after('ไม่อนุญาตอุปกรณ์')}).catch(function(e){toast(e.message,1)})};return}
  if(x.kind==='line'){$('#ap-ok').onclick=function(){aCall('decideLink',x.id,true).then(function(){after('เชื่อม LINE แล้ว')}).catch(function(e){toast(e.message,1)})};$('#ap-no').onclick=function(){aCall('decideLink',x.id,false).then(function(){after('ปฏิเสธคำขอแล้ว')}).catch(function(e){toast(e.message,1)})};return}
  $('#ap-ok').onclick=function(){dec('ok')};$('#ap-no').onclick=function(){dec('no')};if($('#ap-back'))$('#ap-back').onclick=function(){dec('back')};
}

