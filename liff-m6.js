/* ฟอร์มมือถือแบบใหม่ 6 หลัก (ผู้ใช้อนุมัติ Figma หน้า 60 · 22 พ.ย. 2569)
 * สวิตช์ ตั้งค่า › ตารางงาน › ui_m6 (off / pilot / on) อ่านผ่าน uiFlags (อ่านอย่างเดียว) หลังเข้าระบบ
 * เปิด = ใส่คลาส m6 ที่ html + ต่อท้ายป้าย "(ไม่บังคับ)" ในฟอร์ม · ไม่แตะข้อมูลที่ส่ง ไม่แตะการลงเวลา */
(function(){
  var H=document.documentElement, asked=0;
  function set(on){H.classList.toggle("m6",!!on);if(on)mark()}
  try{if(LS.get("m6")===1)set(1)}catch(e){}
  function add(l,t){if(!l||l.querySelector(".m6-opt"))return;var s=document.createElement("small");s.className="m6-opt";s.textContent=t;l.appendChild(document.createTextNode(" "));l.appendChild(s)}
  function mark(){
    if(!H.classList.contains("m6"))return;
    document.querySelectorAll(".mq-f").forEach(function(f){var l=f.querySelector(".mq-l");if(l&&!l.querySelector(".mq-req")&&!/ไม่บังคับ/.test(l.textContent))add(l,"(ไม่บังคับ)")});
    var fm=document.getElementById("ts-form");if(!fm)return;
    fm.querySelectorAll(".ts-f").forEach(function(f){var s=f.querySelector(":scope>span:first-child");if(s&&!s.querySelector("em"))add(s,"(ไม่บังคับ)")});
    fm.querySelectorAll(".ts-lb").forEach(function(s){var sm=s.querySelector("small");if(!sm||/ไม่บังคับ/.test(sm.textContent))return;
      if(/^รถ/.test(s.textContent))sm.textContent="(ไม่บังคับ · เลือกได้หลายคัน)";else if(/^รูปหน้างาน/.test(s.textContent))sm.textContent=sm.textContent.replace("(","(ไม่บังคับ · ")});
    var w=document.createTreeWalker(fm,NodeFilter.SHOW_TEXT),n;while((n=w.nextNode()))if(n.nodeValue.indexOf("ช่องที่มี * ต้องกรอก")>=0)n.nodeValue=n.nodeValue.replace("ช่องที่มี * ต้องกรอก","ช่องที่ไม่บังคับมีคำว่า (ไม่บังคับ)");
  }
  var q=0;new MutationObserver(function(){if(!H.classList.contains("m6")||q)return;q=1;requestAnimationFrame(function(){q=0;mark()})}).observe(document.body,{childList:true,subtree:true});
  function ask(){if(asked||!S.tok)return;asked=1;api("uiFlags").then(function(r){var on=!!(r&&r.m6);LS.set("m6",on?1:0);set(on)}).catch(function(){asked=0})}
  var t=setInterval(function(){if(S.tok){clearInterval(t);ask()}},800);
})();
