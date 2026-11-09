'use strict';
/* หลังบ้านบนจอมือถือ ≤ 640px (8 พ.ย. 2569 · รอบ 2 แบบแอป) · ปรับเฉพาะการแสดงผล ไม่แตะข้อมูล/คำสั่ง/ขั้นตอนอนุมัติ
 * - ตาราง → แถวรายการกะทัดรัด (หัวแถว + ข้อมูลย่อยบรรทัดเดียว · ปุ่มอยู่มุมขวา)
 * - ตัวกรอง → ปุ่ม "ตัวกรอง (n)" เปิดแผ่นจากด้านล่าง · ปุ่มรอง (Export/นำเข้า/รีเฟรช/แก้เวลา…) → ปุ่ม "⋯" เปิดแผ่นจากด้านล่าง
 *   ย้ายปุ่ม/ช่องตัวจริงเข้าแผ่น (การกด/เลือกทำงานเหมือนเดิม) · หน้าวาดใหม่แล้วแผ่นที่เปิดอยู่จะรับตัวใหม่ต่อ
 * - ชิปหลายตัว (≥ 5) → dropdown · ตัวเลขสรุป → แถบปัดได้ */
(function(){
  var MQ=window.matchMedia('(max-width:640px)');
  var CARD={train:1,att:1,appr:1,lv:1,list:1,asset:1,msg:1,ot:1,audit:1,errlog:1,org:1};
  var DESK={set:1,pay:1,rep:1,usage:1,sched:1,srep:1,conf:1};
  var FSEL='select,.drg,[id^=ofs-],#ap-rg,#lv-rg,.dpt,.xd-l';
  var busy=false,tm=0,sh=null;
  var T=function(s){return window.hrLang&&hrLang()==='en'&&window.hrT?hrT(s):s};
  function view(){return (window.A&&A.view)||''}
  function vis(e){if(!e)return false;if(e.classList.contains('m-hid')||e.getClientRects().length)return true;return getComputedStyle(e).display==='contents'&&[].some.call(e.children,vis)}
  /* ---------- ตาราง → รายการ ---------- */
  function cards(){
    if(!CARD[view()]||(view()==='att'&&A.attTab==='mx'))return;
    document.querySelectorAll('.content table').forEach(function(t){
      if(t.closest('.m-sh'))return;
      var ths=[].map.call(t.querySelectorAll('thead th'),function(h){return h.textContent.trim()});if(!ths.length)return;
      t.classList.add('m-card');
      t.querySelectorAll('tbody tr').forEach(function(tr){var head=false;[].forEach.call(tr.children,function(td,i){
        var chk=td.querySelector(':scope > input[type=checkbox]')&&!td.textContent.trim();td.classList.toggle('m-x',!!chk);if(chk)return;
        if(td.colSpan>1){td.classList.add('m-full');return}
        if(!head){head=true;td.classList.add('m-h');return}
        td.setAttribute('data-l',ths[i]||'');
        var x=td.textContent.trim(),btn=td.querySelector('button,a.btn');
        td.classList.toggle('m-act',!!btn&&td.textContent.trim()===[].map.call(td.querySelectorAll('button,a.btn'),function(b){return b.textContent.trim()}).join('').trim());
        td.classList.toggle('m-e',(x===''||x==='—'||x==='-')&&!td.querySelector('button,img,input,select,a,svg'));
        td.classList.toggle('m-lbl',/^[\d.,:\s/%+–-]+$/.test(x)&&x.length<=12);
        td.classList.toggle('m-bdg',!!td.querySelector('.badge,.pill,[class*=b-]'))});
        tr.classList.toggle('m-has-act',!!tr.querySelector('td.m-act'))})})}
  /* ---------- แผ่นจากด้านล่าง ---------- */
  function closeSheet(){if(!sh)return;var s=sh;sh=null;s.items.forEach(function(it){if(it.ph.parentNode){it.el.classList.add('m-hid');it.ph.parentNode.replaceChild(it.el,it.ph)}});s.ov.remove()}
  function openSheet(kind,title,els){
    closeSheet();if(!els.length)return;
    var ov=document.createElement('div');ov.className='m-sh-ov';ov.innerHTML='<div class="m-sh" role="dialog" aria-modal="true"><div class="m-sh-h"><b></b><button type="button" class="btn sm m-sh-x">'+T('เสร็จ')+'</button></div><div class="m-sh-b"></div></div>';
    ov.querySelector('b').textContent=title;var body=ov.querySelector('.m-sh-b'),items=[];
    els.forEach(function(el){var ph=document.createComment('m');el.parentNode.replaceChild(ph,el);el.classList.remove('m-hid');body.appendChild(el);items.push({el:el,ph:ph})});
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.m-sh-x'))closeSheet()});
    if(kind==='more')body.addEventListener('click',function(e){var b=e.target.closest('button,a');if(b&&!b.closest('.m-sh-h'))setTimeout(closeSheet,0)});
    document.body.appendChild(ov);sh={kind:kind,ov:ov,items:items}}
  function filterEls(){var c=document.querySelector('.content');if(!c)return [];var out=[];
    c.querySelectorAll('.ph,.tools,.ast-ctl,.toolbar').forEach(function(box){box.querySelectorAll(':scope > '+FSEL.split(',').join(',:scope > ')+',:scope > .att-dt ~ select').forEach(function(e){if(out.indexOf(e)<0&&vis(e))out.push(e)})});
    if(view()==='rep'){var ph=c.querySelector(':scope > .ph');if(ph)ph.querySelectorAll(':scope > .segt').forEach(function(e){if(out.indexOf(e)<0&&vis(e))out.push(e)})}
    c.querySelectorAll('.xd-chips').forEach(function(e){if(out.indexOf(e)<0&&vis(e))out.push(e)});
    // กลุ่มตัวกรองแบบป้าย (Matrix / รายงานตารางงาน ฯลฯ): กล่องที่มี label ครอบ select/ช่วงวันที่ ≥ 2 ช่อง
    c.querySelectorAll('.content .card > div, .content > div, .content .card').forEach(function(e){if(e.closest('.m-sh,.m-bar')||out.indexOf(e)>=0)return;var n=e.querySelectorAll(':scope > label > select, :scope > label > .dpt, :scope > label > input:not([type=checkbox])').length;if(n>=2&&vis(e))out.push(e)});return out}
  function moreEls(){var c=document.querySelector('.content');if(!c)return [];var out=[];
    c.querySelectorAll('.ph,.ast-hd,.ast-ctl,.tools').forEach(function(box){box.querySelectorAll(':scope > .btn:not(.pri):not(.m-ft):not(.m-mr):not([aria-pressed]):not([data-asv]):not([data-astt]), :scope > a.btn:not(.pri)').forEach(function(e){if(vis(e))out.push(e)})});return out}
  function active(){return filterEls().filter(function(e){return e.tagName==='SELECT'&&e.selectedIndex>0}).length+[].filter.call(document.querySelectorAll('.content select.m-csel'),function(s){return s.selectedIndex>0}).length}
  var FIC='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18M6 12h12M10 19h4"/></svg>';
  function bar(){
    var c=document.querySelector('.content');if(!c)return;var ph=c.querySelector(':scope > .ph');
    var f=filterEls(),m=moreEls(),b=c.querySelector(':scope > .m-bar');
    var q=c.querySelector('.tools input#q,#ast-q,#ms-q,#cb-q,.cba-q input,.content > .tools > input:not([type=checkbox])')||c.querySelector('.ph > .att-dt')||c.querySelector('.m-bar .m-q > .m-tabrow')||c.querySelector(':scope > .rp-tabs,:scope > .otab,.toolbar > .segt,:scope > [role=tablist]');
    if(q&&/rp-tabs|otab|segt/.test(q.className)||q&&q.getAttribute&&q.getAttribute('role')==='tablist')q.classList.add('m-tabrow');
    var post=view()==='cb'&&c.querySelector('.cba-start');
    var pri0=ph&&ph.querySelector(':scope > .btn.pri');if(pri0)pri0.classList.add('m-fab');
    if(!f.length&&!m.length&&!q&&!post&&!(sh&&sh.items.length)){if(b)b.remove();return}
    if(!b){b=document.createElement('div');b.className='m-bar';b.innerHTML='<span class="m-q"></span><button type="button" class="btn m-ft" aria-label="'+T('ตัวกรอง')+'">'+FIC+'<span></span></button><button type="button" class="btn m-mr" aria-label="'+T('เพิ่มเติม')+'">⋯</button>';
      b.querySelector('.m-ft').onclick=function(){openSheet('filter',T('ตัวกรอง'),filterEls())};
      b.querySelector('.m-mr').onclick=function(){openSheet('more',T('เพิ่มเติม'),moreEls())};
      var hd=ph||c.querySelector(':scope > .ast-hd,:scope > .cba-wrap > .cba-head');if(hd&&hd.parentNode===c&&hd.nextSibling)c.insertBefore(b,hd.nextSibling);else c.insertBefore(b,c.firstChild)}
    var slot=b.querySelector('.m-q');
    if(q&&!slot.firstChild&&!slot.contains(q)){var w=q.closest('.cba-q')||q,ph0=document.createComment('mq');w.parentNode.replaceChild(ph0,w);w._mph=ph0;slot.appendChild(w)}   // ช่องเดียว · ไม่ลบของเดิมทิ้ง
    b.classList.toggle('m-dt',!!slot.querySelector('.att-dt'));b.classList.toggle('m-solo',!slot.firstChild&&!f.length);
    slot.hidden=!slot.firstChild||!slot.firstChild.isConnected;b.classList.toggle('m-wq',true);
    var n=active(),ft=b.querySelector('.m-ft'),lab=ft.querySelector('span'),s2=n?String(n):'';
    if(lab.textContent!==s2)lab.textContent=s2;ft.classList.toggle('on',n>0);
    ft.hidden=!f.length&&!(sh&&sh.kind==='filter');b.querySelector('.m-mr').hidden=!m.length&&!(sh&&sh.kind==='more');
    f.concat(m).forEach(function(e){e.classList.add('m-hid')});
    document.querySelectorAll('.content .card').forEach(function(cd){cd.classList.toggle('m-empty',!cd.textContent.trim()&&!cd.querySelector('img,svg,canvas,input,select,button,iframe,table'))});
    document.querySelectorAll('.content .tools,.content .ast-ctl').forEach(function(t){t.classList.toggle('m-empty',![].some.call(t.children,function(x){return !x.classList.contains('m-hid')&&x.getClientRects().length&&!(x.tagName==='SPAN'&&!x.textContent.trim()&&!x.children.length)}))});
    var pri=ph&&ph.querySelector(':scope > .btn.pri'),fab=document.querySelector('.m-fab');
    if(pri){if(fab&&fab!==pri&&fab.classList.contains('m-post'))fab.remove();pri.classList.add('m-fab')}
    else if(post){if(!fab||!fab.classList.contains('m-post')){if(fab)fab.remove();fab=document.createElement('button');fab.type='button';fab.className='btn pri m-fab m-post';fab.textContent='+ '+T('โพสต์');fab.onclick=function(){var st=document.querySelector('.cba-start');if(st)st.click()};document.body.appendChild(fab)}}
    else if(fab&&fab.classList.contains('m-post'))fab.remove()}
  /* ชิป ≥ 5 ตัว → dropdown (กดชิปตัวจริงแทน) */
  function chips(){document.querySelectorAll('.content .toolbar,.content .chips-row,.content [data-chipbox]').forEach(function(){});
    var groups=new Map();document.querySelectorAll('.content button.chip,.content button.cba-chip').forEach(function(b){var p=b.parentElement;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(b)});
    groups.forEach(function(bs,p){if(bs.length<5)return;p.classList.add('m-chipbox');var s=p.querySelector(':scope > select.m-csel');
      if(!s){s=document.createElement('select');s.className='m-csel';s.setAttribute('aria-label',T('ประเภท'));s.onchange=function(){var b=bs.filter(function(x){return x.isConnected})[s.selectedIndex]||p.querySelectorAll('button.chip,button.cba-chip')[s.selectedIndex];if(b)b.click()};p.insertBefore(s,p.firstChild)}
      var html=bs.map(function(b,i){return '<option value="'+i+'"'+(b.disabled?' disabled':'')+(b.getAttribute('aria-pressed')==='true'?' selected':'')+'>'+b.textContent.trim().replace(/[<>&]/g,'')+'</option>'}).join('');if(s.innerHTML!==html)s.innerHTML=html})}
  function kstrip(){if(view()==='dash')return;var P=new Set();document.querySelectorAll('.content .kpi').forEach(function(k){var p=k.parentElement;if(p&&p.querySelectorAll(':scope > .kpi').length>=3)P.add(p)});P.forEach(function(p){p.classList.add('m-ks')})}
  function dup(){var tt=document.querySelector('.tb .tt b'),h=document.querySelector('.content .ph h1');if(tt&&h)h.classList.toggle('m-dup',h.textContent.trim()===tt.textContent.trim())}
  function note(){var c=document.querySelector('.content');if(!c)return;var d=c.querySelector(':scope > .m-dn');
    if(!DESK[view()]){if(d)d.remove();return}
    if(d)d.remove()}
  function refill(){if(!sh)return;var kind=sh.kind,live=sh.items.some(function(it){return it.ph.isConnected});if(live)return;
    // หน้าวาดใหม่ระหว่างเปิดแผ่น: ทิ้งตัวเก่า ย้ายตัวใหม่เข้าแผ่นเดิม
    var els=kind==='filter'?filterEls():moreEls(),title=sh.ov.querySelector('.m-sh-h b').textContent;sh.ov.remove();sh=null;if(els.length)openSheet(kind,title,els)}
  function unbar(){document.querySelectorAll('.m-bar').forEach(function(b){var w=b.querySelector('.m-q').firstChild;if(w&&w._mph&&w._mph.parentNode){w._mph.parentNode.replaceChild(w,w._mph)}b.remove()});
    document.querySelectorAll('.m-hid').forEach(function(e){e.classList.remove('m-hid')});document.querySelectorAll('.m-fab').forEach(function(e){if(e.classList.contains('m-post'))e.remove();else e.classList.remove('m-fab')});document.querySelectorAll('.m-tabrow').forEach(function(e){e.classList.remove('m-tabrow')})}
  var lastV='';
  function run(){if(busy)return;busy=true;try{if(view()!==lastV){lastV=view();if(sh){sh.ov.remove();sh=null}}var fb=document.querySelector('.m-post');if(fb&&(!MQ.matches||view()!=='cb'))fb.remove();if(!MQ.matches){closeSheet();if(document.querySelector('.m-bar,.m-hid,.m-fab'))unbar()}else{dup();note();cards();kstrip();chips();refill();bar()}}catch(e){if(window.console)console.warn('m',e)}ob.takeRecords();busy=false}
  var ob=new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(run,30)});
  function start(){ob.observe(document.body,{childList:true,subtree:true});run()}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  document.addEventListener('change',function(e){if(MQ.matches&&e.target&&e.target.tagName==='SELECT')setTimeout(run,0)});
  if(MQ.addEventListener)MQ.addEventListener('change',run);
  window.pmMobileSheetClose=closeSheet;
})();
