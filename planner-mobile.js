'use strict';
/* ตารางงาน (planner.html ในกรอบหลังบ้าน ?desktop=1) บนจอมือถือ ≤ 640px · 8 พ.ย. 2569
 * รูปแบบเดียวกับหลังบ้าน (admin-mobile.js): แถวบน = ช่วงสัปดาห์ (ซ้าย) + ตัวกรอง + ⋯ (ขวา) · ปุ่มเพิ่มงานลอยมุมขวาล่าง
 * แผนก / ตัวเลือกแสดงผล → แผ่นตัวกรอง · Export / รถบริษัท / ตั้งค่า → แผ่น ⋯ · ย้ายตัวจริงเข้าแผ่น (onclick เดิมทำงานเหมือนเดิม)
 * ไม่แตะข้อมูลและฟังก์ชันของตารางงาน */
(function(){
  if(!/[?&]desktop=1\b/.test(location.search))return;
  var MQ=window.matchMedia('(max-width:640px)'),busy=false,tm=0,sh=null;
  var FIC='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 5h18M6 12h12M10 19h4"/></svg>';
  function filt(){var fc=document.querySelector('#content .hr-fc');if(!fc)return [];return [].slice.call(fc.querySelectorAll(':scope > .hr-pl,:scope > .hr-pds,:scope > .hr-tg'))}
  function more(){var ph=document.querySelector('#content .hr-ph');if(!ph)return [];return [].slice.call(ph.querySelectorAll(':scope > .hb'))}
  function close(){if(!sh)return;var s=sh;sh=null;s.items.forEach(function(it){if(it.ph.parentNode){it.el.classList.add('pz-hid');it.ph.parentNode.replaceChild(it.el,it.ph)}});s.ov.remove()}
  function open(kind,title,els){close();if(!els.length)return;
    var ov=document.createElement('div');ov.className='pz-ov';ov.innerHTML='<div class="pz-sh" role="dialog" aria-modal="true"><div class="pz-h"><b></b><button type="button" class="pz-x">เสร็จ</button></div><div class="pz-b"></div></div>';
    ov.querySelector('b').textContent=title;var body=ov.querySelector('.pz-b'),items=[];
    els.forEach(function(el){var ph=document.createComment('pz');el.parentNode.replaceChild(ph,el);el.classList.remove('pz-hid');body.appendChild(el);items.push({el:el,ph:ph})});
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.pz-x'))close()});
    if(kind==='more')body.addEventListener('click',function(e){if(e.target.closest('button'))setTimeout(close,0)});
    document.body.appendChild(ov);sh={kind:kind,ov:ov,items:items}}
  function refill(){if(!sh)return;if(sh.items.some(function(it){return it.ph.isConnected}))return;var k=sh.kind,t=sh.ov.querySelector('.pz-h b').textContent;sh.ov.remove();sh=null;var els=k==='filter'?filt():more();if(els.length)open(k,t,els)}
  function count(){var n=0,pd=document.querySelector('.hr-pds .hr-pd.on');if(pd&&pd!==document.querySelector('.hr-pds .hr-pd'))n++;return n}
  function bar(){
    var fc=document.querySelector('#content .hr-fc');if(!fc)return;var b=fc.querySelector(':scope > .pz-bar');
    if(!b){b=document.createElement('div');b.className='pz-bar';b.innerHTML='<span class="pz-q"></span><button type="button" class="pz-ft" aria-label="ตัวกรอง">'+FIC+'<span></span></button><button type="button" class="pz-mr" aria-label="เพิ่มเติม">⋯</button>';
      b.querySelector('.pz-ft').onclick=function(){open('filter','ตัวกรอง',filt())};b.querySelector('.pz-mr').onclick=function(){open('more','เพิ่มเติม',more())};fc.insertBefore(b,fc.firstChild)}
    var wk=fc.querySelector('.hr-wk'),row=wk&&wk.parentElement,slot=b.querySelector('.pz-q');if(row&&row!==fc&&row.parentNode!==slot)slot.appendChild(row);
    var n=count(),lab=b.querySelector('.pz-ft span');if(lab.textContent!==(n?String(n):''))lab.textContent=n?String(n):'';
    filt().concat(more()).forEach(function(e){e.classList.add('pz-hid')});
    var pri=document.querySelector('#content .hr-ph > .btn-p');if(pri)pri.classList.add('pz-fab')}
  function run(){if(busy)return;busy=true;try{if(!MQ.matches)close();else{refill();bar()}}catch(e){if(window.console)console.warn('pz',e)}ob.takeRecords();busy=false}
  var ob=new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(run,30)});
  function start(){ob.observe(document.body,{childList:true,subtree:true});run()}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  if(MQ.addEventListener)MQ.addEventListener('change',run);
})();
