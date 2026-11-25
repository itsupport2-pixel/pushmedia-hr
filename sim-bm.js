/* ── ปุ่ม SIM Monitor ที่ทำงานในแท็บ cmp.dtac.co.th (ใช้ร่วม 2 ทาง · 24 พ.ย. 2569) ──
 *   1) ปุ่มบุ๊กมาร์ก: admin-sim.js simBmCode() แปลงฟังก์ชันนี้เป็นข้อความ javascript: (AUTO = '' → ผู้ใช้กดเลือกเอง)
 *   2) ส่วนขยาย Chrome (tools/sim-extension): background.js เปิดแท็บ CMP เบื้องหลังแล้วเรียก simBmMain(API, K, HR, AUTO) ใน world MAIN
 *      AUTO = 'auto' (Sync เต็มเมื่อถึงรอบ ไม่งั้น Sync เร็ว) | 'quick' | 'full' · หน้า /report = ดึงประวัติเดือนที่ขาด · ผลอยู่ใน window.__PMHR_RES {state: run|done|error|login, msg}
 * ห้ามอ้างตัวแปรภายนอก (ฟังก์ชันถูกแปลงเป็นข้อความ / ฉีดเข้าหน้าเว็บอื่น) · ห้ามใช้คอมเมนต์ // (รวมเป็นบรรทัดเดียว)
 * เดิม: ปุ่มบุ๊กมาร์ก v2 (ทำงานในแท็บ cmp.dtac.co.th) · ไม่เปิดแท็บใหม่ · ส่ง fetch ก้อนละ 250 แถว · ล้มกลางทาง = กดใหม่ (ระบบเริ่มรอบใหม่ · ข้อมูลเดิมไม่เสีย)
 * อ่านแบบเดียวกับปุ่มเดิม (~/Claude/CMP-SIM-Monitor/bookmarklet): DataTable หน้า /msisdn + /msisdn_info ทีละ 10 เบอร์ (Sync เต็มเท่านั้น) */
/* 25 พ.ย. 2569 ผู้ใช้: "เลือกช่วงเวลา/เดือนที่จะดึง · กำหนดวันแล้วไล่ดึงทีละเดือน" (เลือกแบบกดดึงเอง)
 *   AUTO = 'hist' + MON = {from:'YYYY-MM', to:'YYYY-MM', force} → หน้า /report ไล่ดึงทีละครึ่งเดือนตามช่วงที่เลือก · ส่งเสร็จครึ่งไหนบันทึกทันที · ช่วงที่ครบแล้วข้าม (force = ดึงซ้ำ) */
function simBmMain(API,K,HR,AUTO,MON){(async function(){
    var old=document.getElementById('pmhr-sim');if(old)old.remove();var box=document.createElement('div');box.id='pmhr-sim';box.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;background:#fff;border:1px solid #d8dde3;border-radius:14px;padding:16px 18px;font:14px/1.5 sans-serif;color:#141414;box-shadow:0 10px 30px rgba(0,0,0,.18);width:330px';document.body.appendChild(box);
    var show=function(h){window.__PMHR_PROG=String(h).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,200);box.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><b style="font-size:15px">SIM Monitor</b><span style="flex:1"></span><button id="pmhr-x" style="border:0;background:none;font-size:18px;cursor:pointer;color:#888">×</button></div>'+h;document.getElementById('pmhr-x').onclick=function(){box.remove()}};
    var btn=function(id,t,pri){return '<button id="'+id+'" style="display:block;width:100%;margin-top:8px;padding:9px 12px;border-radius:10px;cursor:pointer;font:600 14px sans-serif;'+(pri?'background:#141414;color:#fff;border:0':'background:#fff;color:#141414;border:1px solid #d0d4da')+'">'+t+'</button>'};
    var txt=function(v){var d=document.createElement('div');d.innerHTML=v==null?'':String(v);return d.textContent.trim()};var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
    var post=function(p,b){b.k=K;return fetch(API+'/api/sim/'+p,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(b)}).then(function(r){return r.json()})};
    var R0=function(st,m){window.__PMHR_RES={state:st,msg:String(m||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(),at:Date.now()}};R0('run');
    var err=function(m){show('<div style="color:#C0392B">'+m+'</div>');R0('error',m)};
    var addD=function(d,n){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
    var eom=function(m){var x=new Date(m+'-01T12:00:00Z');x.setUTCMonth(x.getUTCMonth()+1);x.setUTCDate(0);return x.toISOString().slice(0,10)};
    var pt=function(t){var m=/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/.exec(t||'');return m?Date.parse(m[1]+'T'+m[2]+'+07:00'):NaN};
    var TM=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],mn=function(m){return TM[+m.slice(5,7)-1]+' '+(+m.slice(0,4)+543)};
    /* ประวัติจากหน้า รายงาน: ทีละวัน (length 1000) → สรุปต่อเบอร์ต่อเดือน + เหตุการณ์ IMEI/เครือข่าย · เดือนที่ครบแล้วไม่ดึงซ้ำ · เดือนนี้ดึงใหม่ถึงวันนี้ */
    var hist=async function(P){
      /* 24 พ.ย. 2569 (ผู้ใช้เลือก "ทำตามข้อเสนอ"): หน้ารายงานของ CMP ช้ามาก และคำขอค้างทำให้ทั้งบัญชีค้าง (ล็อกการเข้าสู่ระบบ ทีละคำขอ)
       * → ส่วนขยายไม่ยิงหน้ารายงานอีก · ความเคลื่อนไหวรายวันเก็บจากการซิงก์สถานะทุกเช้า (sim_actm) · ปุ่มนี้เหลือไว้เติมย้อนหลังเองเท่านั้น */
      if(AUTO&&AUTO!=='hist'){R0('done','ไม่ต้องดึงจากหน้ารายงานแล้ว · ความเคลื่อนไหวรายวันเก็บจากการซิงก์สถานะทุกเช้า');return show('<div style="color:#2E7D32;font-weight:600">ไม่ต้องดึงจากหน้ารายงานแล้ว</div><div style="font-size:13px;color:#555;margin-top:4px">ความเคลื่อนไหวรายวันเก็บจากการซิงก์สถานะทุกเช้า</div>')}
      var dt=jQuery(jQuery.fn.dataTable.tables()[0]).DataTable(),base=(dt.ajax&&dt.ajax.params&&dt.ajax.params())||{},H={},H2={};(P.hist||[]).forEach(function(h){H[h.month]=h});(P.hist2||[]).forEach(function(h){H2[h.month+'-'+h.half]=h});
      var td=P.today,ym=td.slice(0,7),U=[];for(var i=6;i>=0;i--){var x=new Date(ym+'-01T12:00:00Z');x.setUTCMonth(x.getUTCMonth()-i);var m=x.toISOString().slice(0,7);
        [[1,m+'-01',m+'-15'],[2,m+'-16',eom(m)]].forEach(function(u){if(u[1]>td)return;U.push({m:m,h:u[0],d0:u[1],d1:u[2]<td?u[2]:td,full:u[2]<=td})})}
      /* 24 พ.ย. 2569 ผู้ใช้: "ทำไมไม่ดึงภายในเดือน หรือ 30 วัน" → ปกติดึงเฉพาะช่วงที่แตะ 30 วันล่าสุด · ย้อนหลังทั้งหมด (~6 เดือน) เป็นปุ่มรอง (กดเอง) · ส่วนขยายอัตโนมัติ = 30 วันเท่านั้น */
      var needAll=U.filter(function(u){var o=H[u.m];if(o&&+o.full===1&&!(P.hist2||[]).some(function(z){return z.month===u.m}))return false;var h=H2[u.m+'-'+u.h];return !(h&&(+h.full===1||h.last>=td))});
      var since=addD(td,-29),needR=needAll.filter(function(u){return u.d1>=since});
      /* ดึงครึ่งเดือนแล้วสรุปเดือนคำนวณใหม่จากครึ่งที่มี → ถ้าอีกครึ่งของเดือนเดียวกันยังไม่มีในระบบ ดึงมาด้วย (สรุปรายเดือนไม่ขาดครึ่ง) */
      needR.slice().forEach(function(u){var o=needAll.filter(function(x){return x.m===u.m&&x.h!==u.h})[0];if(o&&needR.indexOf(o)<0)needR.push(o)});
      needR.sort(function(a,b){return a.d0<b.d0?-1:1});
      var lab=function(u){return (+u.d0.slice(8))+'–'+(+u.d1.slice(8))+' '+mn(u.m)},cnt=function(L){return L.reduce(function(t,u){return t+(+u.d1.slice(8))-(+u.d0.slice(8))+1},0)},need=needR,nd=cnt(needR);
      var rangeRun=function(){var mf=MON&&/^\d{4}-\d{2}$/.test(MON.from)?MON.from:'',mt=MON&&/^\d{4}-\d{2}$/.test(MON.to)?MON.to:mf;if(!mf){R0('error','ไม่ได้เลือกเดือน');return err('ไม่ได้เลือกเดือนที่จะดึง')}if(mt<mf){var z0=mf;mf=mt;mt=z0}if(mt>ym)mt=ym;
        var UR=[];for(var mm=mf;mm<=mt;){[[1,mm+'-01',mm+'-15'],[2,mm+'-16',eom(mm)]].forEach(function(u){if(u[1]>td)return;UR.push({m:mm,h:u[0],d0:u[1],d1:u[2]<td?u[2]:td,full:u[2]<=td})});var xx=new Date(mm+'-01T12:00:00Z');xx.setUTCMonth(xx.getUTCMonth()+1);mm=xx.toISOString().slice(0,7)}
        var skip=0;if(!(MON&&MON.force))UR=UR.filter(function(u){var h=H2[u.m+'-'+u.h],o=H[u.m],ok=h?(+h.full===1||h.last>=td):(o&&+o.full===1&&!(P.hist2||[]).some(function(z){return z.month===u.m}));if(ok)skip++;return !ok});
        if(!UR.length){R0('done','ช่วงที่เลือกมีครบแล้ว ('+mn(mf)+(mt!==mf?' – '+mn(mt):'')+') · ติ๊ก ดึงซ้ำ ถ้าต้องการดึงใหม่');return show('<div style="color:#2E7D32;font-weight:600">ช่วงที่เลือกมีครบแล้ว</div>')}
        need=UR;nd=cnt(UR);return go2().catch(function(e){err('ดึงประวัติไม่ครบ: '+(e&&e.message||e)+'<br><small>ช่วงที่ส่งแล้วบันทึกไว้แล้ว · กดอีกครั้งเพื่อดึงต่อ (ช่วงที่ครบแล้วข้ามให้เอง)</small>')})};
      var openHR=function(){var o=document.getElementById('pmhr-o');if(o)o.onclick=function(){window.open(HR+'#sim','_blank','noopener')}};
      if(AUTO!=='hist'&&(!needAll.length||(AUTO&&!needR.length))){R0('done',needAll.length?'30 วันล่าสุดครบแล้ว':'ประวัติครบแล้ว');show('<div style="color:#2E7D32;font-weight:600">'+(needAll.length?'30 วันล่าสุดครบแล้ว':'ประวัติครบแล้วถึงวันนี้')+'</div>'+btn('pmhr-o','เปิดใน HR',true));openHR();return}
      var start=function(L){need=L;nd=cnt(L);go2().catch(function(e){err('ดึงประวัติไม่ครบ: '+(e&&e.message||e)+'<br><small>ช่วงที่ส่งแล้วบันทึกไว้แล้ว · กดปุ่มอีกครั้งเพื่อดึงต่อ</small>')})};
      if(AUTO!=='hist')show('<div style="color:#555;font-size:13px">สวัสดี '+P.who+'<br><b>ปกติไม่ต้องใช้</b> · ความเคลื่อนไหวรายวันเก็บจากการซิงก์สถานะทุกเช้าแล้ว<br>ใช้เมื่อต้องการเติมย้อนหลังเท่านั้น · หน้ารายงานของ CMP ช้ามาก · ระหว่างดึง ห้ามเปิดหน้า CMP อื่นหรือกดซ้ำ</div>'+
        (needR.length?btn('pmhr-h','ดึง 30 วันล่าสุด ('+cnt(needR)+' วัน)',true):'<div style="color:#2E7D32;font-size:13px;margin-top:8px">30 วันล่าสุดครบแล้ว</div>')+
        (needAll.length>needR.length?btn('pmhr-ha','ดึงย้อนหลังทั้งหมด · '+cnt(needAll)+' วัน (นาน · CMP อาจช้า)',false):''));
      if(document.getElementById('pmhr-h'))document.getElementById('pmhr-h').onclick=function(){start(needR)};
      if(document.getElementById('pmhr-ha'))document.getElementById('pmhr-ha').onclick=function(){start(needAll)};
      if(AUTO&&AUTO!=='hist')setTimeout(function(){start(needR)},0);
      var day1=async function(d){var all=[];for(var st=0;st<20000;st+=1000){var p=jQuery.extend({},base,{start:st,length:1000,date_start:d,date_end:d});
        var r,t0=Date.now(),tk=setInterval(function(){var sec=Math.round((Date.now()-t0)/1000);if(sec<8)return;var w=document.getElementById('pmhr-wait');if(!w){w=document.createElement('div');w.id='pmhr-wait';w.style.cssText='font-size:12px;color:#0A6C99;margin-top:6px';box.appendChild(w)}w.textContent='รอคำตอบจาก CMP '+sec+' วินาที · CMP ช้า รอได้ ห้ามกดซ้ำ';window.__PMHR_PROG=String(window.__PMHR_PROG||'').replace(/ · รอคำตอบ.*$/,'')+' · รอคำตอบจาก CMP '+sec+' วินาที'},5000);
        try{r=await fetch('/report/ajaxReport',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','X-Requested-With':'XMLHttpRequest'},body:jQuery.param(p)})}catch(e){clearInterval(tk);throw new Error(String(e&&e.message||e))}
        clearInterval(tk);if(!r.ok)throw new Error('HTTP '+r.status);var j;try{j=await r.json()}catch(e){throw new Error('รายงานตอบผิดรูปแบบ (หมดเวลาเข้าสู่ระบบ CMP?)')}
        var L=j.data||[];all=all.concat(L);if(L.length<1000)break}return all};
      var day=async function(d){var W=[0,5000,15000,30000],e0=null;for(var t=0;t<W.length;t++){if(W[t]){show('CMP ตอบช้า/ผิดพลาดที่วันที่ '+(+d.slice(8))+' · รอแล้วลองใหม่ครั้งที่ '+(t+1)+' / '+W.length+'<div style="font-size:12px;color:#888;margin-top:6px">'+(e0&&e0.message||'')+'</div>');await sleep(W[t])}try{return await day1(d)}catch(e){e0=e}}throw new Error('โหลดวันที่ '+d+' ไม่ได้ (ลอง '+W.length+' ครั้ง): '+(e0&&e0.message||e0)+' · หน้า CMP อาจช้าอยู่ ลองใหม่ภายหลัง')};
      var go2=async function(){var run='h'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),prev=null,pd='',k0=0,sum=[];
        for(var q=0;q<need.length;q++){var u=need[q],m=u.m,M={},E=[],days=0,first='',last='';
          if(pd!==addD(u.d0,-1)){prev=null;try{var c=await day(addD(u.d0,-1));if(c.length){prev={};c.forEach(function(x){var ms=txt(x.msisdn);prev[ms]={ev:txt(x.event_updated||x.event_update_date),im:txt(x.imei),nt:txt(x.event)}})}}catch(e){prev=null}}
          for(var d=u.d0;d<=u.d1;d=addD(d,1)){k0++;show('ดึงประวัติ '+lab(u)+' · วันที่ '+(+d.slice(8))+'<div style="height:6px;background:#eee;border-radius:3px;margin-top:8px"><div style="height:6px;border-radius:3px;background:#0AA6E8;width:'+Math.min(100,Math.round(k0/nd*100))+'%"></div></div><div style="font-size:12px;color:#888;margin-top:6px">'+k0+' / '+nd+' วัน · ช่วงที่ '+(q+1)+' / '+need.length+' · อย่าปิดแท็บนี้</div>');
            var L=await day(d);pd=d;if(!L.length)continue;days++;if(!first)first=d;last=d;var cur={};
            L.forEach(function(x){var ms=txt(x.msisdn);if(!/^66\d{8,}$/.test(ms))return;var ev=txt(x.event_updated||x.event_update_date),im=txt(x.imei),nt=txt(x.event),ts=txt(x.timestamp)||d+' 00:00:00';cur[ms]={ev:ev,im:im,nt:nt};
              var a=M[ms]||(M[ms]={msisdn:ms,days:0,active:0});a.days++;var tT=pt(ts),eT=pt(ev),act=!isNaN(eT)&&!isNaN(tT)&&eT<=tT&&eT>tT-864e5,p=prev&&prev[ms];if(p&&p.ev!==ev)act=true;if(act)a.active++;
              if(p){if(p.im&&im&&p.im!==im)E.push({at:d,msisdn:ms,type:'imei',from:p.im,to:im});if(p.nt&&nt&&p.nt!==nt)E.push({at:d,msisdn:ms,type:'net',from:p.nt,to:nt})}});prev=cur}
          var R=Object.keys(M).map(function(k){return M[k]}),parts=Math.max(1,Math.ceil(R.length/250),Math.ceil(E.length/500));
          for(var z=0;z<parts;z++){show('ส่งประวัติ '+lab(u)+' เข้าระบบ HR ก้อน '+(z+1)+' / '+parts+'…');var r=await post('ingest',{kind:'hist',v:3,run:run,month:m,half:u.h,part:z,parts:parts,rows:R.slice(z*250,(z+1)*250),events:E.slice(z*500,(z+1)*500),days:days,first:first,last:last,full:u.full});if(!r.ok)throw new Error(r.error)}
          sum.push(lab(u))}
        R0('done','ดึงประวัติ '+need.length+' ช่วง ('+nd+' วัน)');show('<div style="color:#2E7D32;font-weight:600">ดึงประวัติเสร็จ · '+need.length+' ช่วง</div><div style="font-size:12.5px;color:#555;margin-top:4px">'+sum.join(' · ')+'</div>'+btn('pmhr-o','เปิดใน HR',true));document.getElementById('pmhr-o').onclick=function(){window.open(HR+'#sim','_blank','noopener')}};
      if(AUTO==='hist')return rangeRun()};
    try{
      var REP=/\/report\/?$/.test(location.pathname);
      if(/\/login/.test(location.pathname)){R0('login','ต้องเข้าสู่ระบบ CMP');return show('<div style="color:#C0392B">ยังไม่ได้เข้าสู่ระบบ CMP · เข้าสู่ระบบ (ติ๊ก ให้ฉันลงชื่อเข้าใช้เสมอ) แล้วลองใหม่</div>')}
      if(!REP&&!/\/msisdn\/?$/.test(location.pathname))return err('เปิดหน้า <b>รายการหมายเลข</b> (cmp.dtac.co.th/msisdn) เพื่อซิงก์สถานะ<br>หรือหน้า <b>รายงาน</b> (cmp.dtac.co.th/report) เพื่อดึงประวัติ<br>แล้วกดปุ่มนี้อีกครั้ง');
      if(!window.jQuery||!jQuery.fn.DataTable||!jQuery.fn.dataTable.tables()[0])return err('ไม่พบตารางในหน้านี้ · รอหน้าโหลดเสร็จแล้วกดใหม่');
      show('กำลังตรวจกับระบบ HR…');var P;try{P=await post('plan',{v:3,auto:AUTO?1:0})}catch(e){return err('ติดต่อระบบ HR ไม่ได้ ('+e.message+')<br><small>ถ้าขึ้นทุกครั้ง แจ้งผู้ดูแลระบบ: หน้า CMP อาจไม่อนุญาตให้ส่งข้อมูลออก</small>')}
      if(!P.ok)return err(P.error);
      if(REP)return hist(P);
      show('<div style="color:#555;font-size:13px">สวัสดี '+P.who+' · ในระบบมี '+P.count+' เบอร์<br>Sync เต็มล่าสุด: '+(P.lastFull||'ยังไม่เคย')+'</div>'+btn('pmhr-q','Sync เร็ว · สถานะทุกเบอร์ (~10 วินาที)',!P.fullDue)+btn('pmhr-f','Sync เต็ม · + usage และพิกัด (~10 นาที)'+(P.fullDue?' · ถึงรอบแล้ว':''),P.fullDue));
      var go=async function(kind){
        var $t=jQuery(jQuery.fn.dataTable.tables()[0]),dt=$t.DataTable(),total=dt.page.info().recordsTotal,list=[],wait=function(){return new Promise(function(r){$t.one('draw.dt',function(){r()})})};
        var p=wait();dt.page.len(100).draw();await p;var pages=dt.page.info().pages;
        for(var i=0;i<pages;i++){if(i>0){p=wait();dt.page(i).draw('page');await p}list=list.concat(dt.rows({page:'current'}).data().toArray());show('อ่านรายการหมายเลข '+list.length+' / '+total)}
        var det=new Map(),H=null;
        if(kind==='full')for(var j=0;j<list.length;j+=10){var ch=list.slice(j,j+10),fd=new URLSearchParams();fd.set('msisdn',ch.map(function(d){return String(d.id).replace('msisdn-','')}).join(','));
          var res=await fetch('/msisdn_info',{method:'POST',body:fd,credentials:'same-origin'});if(!res.ok)throw new Error('อ่านรายละเอียดไม่สำเร็จ HTTP '+res.status);
          var doc=new DOMParser().parseFromString(await res.text(),'text/html'),tb=[].slice.call(doc.querySelectorAll('table')).find(function(t){return t.textContent.indexOf('ประมาณการใช้งาน')>=0});
          if(!tb)throw new Error('ไม่พบตารางรายละเอียด (หมดเวลาเข้าสู่ระบบ CMP? ลองเข้าใหม่)');if(!H)H=[].slice.call(tb.querySelectorAll('thead th')).map(function(th){return th.textContent.trim()});
          tb.querySelectorAll('tbody tr').forEach(function(tr){var c=[].slice.call(tr.cells).map(function(x){return x.textContent.trim()});if(/^66\d{8,}$/.test(c[0]||''))det.set(c[0],c)});
          show('อ่าน usage และพิกัด '+Math.min(j+10,list.length)+' / '+list.length+'<div style="height:6px;background:#eee;border-radius:3px;margin-top:8px"><div style="height:6px;border-radius:3px;background:#0AA6E8;width:'+Math.round(Math.min(j+10,list.length)/list.length*100)+'%"></div></div>');if(!AUTO)await sleep(400)}
        var g=function(c,n){var k=H?H.indexOf(n):-1;return k>=0?(c[k]||''):''};
        var rows=list.map(function(d){var ms=txt(d.msisdn),c=det.get(ms)||[];var o={id:txt(d.id),msisdn:ms,iccid:txt(d.iccid),groupcode:txt(d.groupcode),status:txt(d.status),networkStatus:txt(d.event),eventUpdate:txt(d.event_update_date),apn:txt(d.apn),ip:txt(d.ip_address),imei:txt(d.imei),brand:txt(d.brand_custom)||txt(d.brand),model:txt(d.model_custom)||txt(d.model),provinceCmp:txt(d.province),remark1:txt(d.remark1),remark2:txt(d.remark2),remark3:txt(d.remark3),remark4:txt(d.remark4)};
          if(kind==='full'){o.usageText=g(c,'ประมาณการใช้งาน');o.location=g(c,'ตำแหน่ง');o.tambon=g(c,'ตำบล');o.amphoe=g(c,'อำเภอ');o.province=g(c,'จังหวัด')}return o});
        dt.page.len(10).draw();
        var run='r'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),N=P.chunk||250,parts=Math.max(1,Math.ceil(rows.length/N)),r=null;
        for(var k=0;k<parts;k++){show('ส่งเข้าระบบ HR ก้อน '+(k+1)+' / '+parts+'…');r=await post('ingest',{kind:kind,run:run,part:k,parts:parts,total:total,rows:rows.slice(k*N,(k+1)*N)});if(!r.ok)throw new Error(r.error)}
        R0('done',(kind==='full'?'Sync เต็ม ':'Sync เร็ว ')+r.got+' / '+r.total+' เบอร์ · ใหม่ '+r.n_new+' · เปลี่ยน '+r.n_chg);show('<div style="color:#2E7D32;font-weight:600">ซิงก์เสร็จ · '+r.got+' / '+r.total+' เบอร์</div><div style="font-size:13px;color:#555;margin-top:4px">เบอร์ใหม่ '+r.n_new+' · มีการเปลี่ยนแปลง '+r.n_chg+(r.missing?' · หายจาก CMP '+r.missing:'')+(kind==='full'?' · ไม่มี usage '+rows.filter(function(x){return !x.usageText}).length:'')+'</div>'+btn('pmhr-o','เปิดใน HR',true));
        document.getElementById('pmhr-o').onclick=function(){window.open(HR+'#sim','_blank','noopener')}};
      var run1=function(kind){go(kind).catch(function(e){err('ซิงก์ไม่สำเร็จ: '+(e&&e.message||e)+'<br><small>กดปุ่มบุ๊กมาร์กอีกครั้งเพื่อเริ่มใหม่ · ข้อมูลที่ส่งแล้วไม่เสีย</small>')})};
      document.getElementById('pmhr-q').onclick=function(){run1('quick')};document.getElementById('pmhr-f').onclick=function(){run1('full')};
      if(AUTO)run1(AUTO==='full'||(AUTO==='auto'&&P.fullDue)?'full':'quick');
    }catch(e){err(String(e&&e.message||e))}})()}
