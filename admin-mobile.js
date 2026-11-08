'use strict';
/* หลังบ้านบนจอมือถือ ≤ 640px (8 พ.ย. 2569) · ไม่แตะข้อมูลและไม่เปลี่ยนการทำงานของหน้า ปรับเฉพาะการแสดงผล
 * กลุ่มใช้งานบนมือถือ: ตาราง → การ์ด (อ่านหัวคอลัมน์มาเป็นป้าย) · พับตัวกรองไว้ใต้ปุ่มเดียว
 * กลุ่มงานละเอียด: ขึ้นบรรทัดบอกว่าเหมาะกับจอคอม · ยังเปิดดูได้ตามเดิม */
(function(){
  var MQ=window.matchMedia('(max-width:640px)');
  var CARD={att:1,appr:1,lv:1,list:1,asset:1,msg:1},DESK={set:1,pay:1,rep:1,audit:1,usage:1,org:1,sched:1,srep:1,conf:1,errlog:1};
  var open={},busy=false,tm=0;
  var T=function(s){return window.hrLang&&hrLang()==='en'&&window.hrT?hrT(s):s};
  function view(){return (window.A&&A.view)||''}
  function cards(){
    if(!CARD[view()])return;
    if(view()==='att'&&A.attTab==='mx')return;
    document.querySelectorAll('.content table').forEach(function(t){
      var ths=[].map.call(t.querySelectorAll('thead th'),function(h){return h.textContent.trim()});if(!ths.length)return;
      t.classList.add('m-card');
      t.querySelectorAll('tbody tr').forEach(function(tr){var head=false;[].forEach.call(tr.children,function(td,i){
        var chk=td.querySelector(':scope > input[type=checkbox]')&&!td.textContent.trim();td.classList.toggle('m-x',!!chk);if(chk)return;
        if(!head&&td.colSpan===1){head=true;td.classList.add('m-h')}
        if(td.colSpan>1){td.classList.add('m-full');return}
        td.setAttribute('data-l',ths[i]||'');
        var x=td.textContent.trim();td.classList.toggle('m-e',(x===''||x==='—'||x==='-')&&!td.querySelector('button,img,input,select,a,svg'))})})})}
  function active(c){return [].filter.call(c.querySelectorAll('select'),function(s){return s.selectedIndex>0}).length}
  function filters(){
    var key=view();
    document.querySelectorAll('.content .tools,.content .ast-ctl,.content .ph').forEach(function(c){
      var n=c.querySelectorAll('select').length;if(n<1)return;
      var k=key+':'+(c.className.split(' ')[0]);
      c.classList.add('m-fc');c.classList.toggle('m-open',!!open[k]);
      var b=c.querySelector(':scope > .m-ft');
      if(!b){b=document.createElement('button');b.type='button';b.className='btn m-ft';b.onclick=function(){open[k]=!open[k];c.classList.toggle('m-open',open[k]);paint(c,b)};c.appendChild(b)}
      paint(c,b)})}
  function paint(c,b){var n=active(c),o=c.classList.contains('m-open'),s=T('ตัวกรอง')+(n?' ('+n+')':'');if(b.textContent!==s)b.textContent=s;b.setAttribute('aria-expanded',o)}
  function dup(){var tt=document.querySelector('.tb .tt b'),h=document.querySelector('.content .ph h1');if(tt&&h)h.classList.toggle('m-dup',h.textContent.trim()===tt.textContent.trim())}
  function note(){
    var c=document.querySelector('.content');if(!c)return;var d=c.querySelector(':scope > .m-dn');
    if(!DESK[view()]){if(d)d.remove();return}
    if(!d){d=document.createElement('div');d.className='m-dn';d.textContent=T('หน้านี้เหมาะกับจอคอม · บนมือถือดูได้ แต่บางตารางต้องปัดซ้าย–ขวา');c.insertBefore(d,c.firstChild)}}
  function run(){if(busy||!MQ.matches)return;busy=true;try{dup();note();filters();cards()}catch(e){}ob.takeRecords();busy=false}
  var ob=new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(run,40)});
  function start(){ob.observe(document.body,{childList:true,subtree:true});run()}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  document.addEventListener('change',function(e){if(e.target&&e.target.tagName==='SELECT'&&MQ.matches){var c=e.target.closest('.m-fc'),b=c&&c.querySelector(':scope > .m-ft');if(b)paint(c,b)}});
  MQ.addEventListener&&MQ.addEventListener('change',run);
})();
