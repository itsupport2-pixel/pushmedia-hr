/* ฟอร์มมือถือแบบใหม่ 6 หลัก (ผู้ใช้อนุมัติ Figma หน้า 60 · 22 พ.ย. 2569)
 * ใส่คลาส m6 ที่ html + ต่อท้ายป้าย "(ไม่บังคับ)" ในฟอร์ม ขอใช้เมสเซนเจอร์ / สร้างงาน · ไม่แตะข้อมูลที่ส่ง ไม่แตะการลงเวลา
 * 22 พ.ย. 2569: เอาสวิตช์ ui_m6 ออกแล้ว (ผู้ใช้สั่ง) · ใช้กับทุกคน */
(function(){
  var H=document.documentElement;H.classList.add("m6");
  function add(l,t){if(!l||l.querySelector(".m6-opt"))return;var s=document.createElement("small");s.className="m6-opt";s.textContent=t;l.appendChild(document.createTextNode(" "));l.appendChild(s)}
  function mark(){
    document.querySelectorAll(".mq-f").forEach(function(f){var l=f.querySelector(".mq-l");if(l&&!l.querySelector(".mq-req")&&!/ไม่บังคับ/.test(l.textContent))add(l,"(ไม่บังคับ)")});
    var fm=document.getElementById("ts-form");if(!fm)return;
    fm.querySelectorAll(".ts-f").forEach(function(f){var s=f.querySelector(":scope>span:first-child");if(s&&!s.querySelector("em"))add(s,"(ไม่บังคับ)")});
    fm.querySelectorAll(".ts-lb").forEach(function(s){var sm=s.querySelector("small");if(!sm||/ไม่บังคับ/.test(sm.textContent))return;
      if(/^รถ/.test(s.textContent))sm.textContent="(ไม่บังคับ · เลือกได้หลายคัน)";else if(/^รูปหน้างาน/.test(s.textContent))sm.textContent=sm.textContent.replace("(","(ไม่บังคับ · ")});
    var w=document.createTreeWalker(fm,NodeFilter.SHOW_TEXT),n;while((n=w.nextNode()))if(n.nodeValue.indexOf("ช่องที่มี * ต้องกรอก")>=0)n.nodeValue=n.nodeValue.replace("ช่องที่มี * ต้องกรอก","ช่องที่ไม่บังคับมีคำว่า (ไม่บังคับ)");
  }
  var q=0;new MutationObserver(function(){if(q)return;q=1;requestAnimationFrame(function(){q=0;mark()})}).observe(document.body,{childList:true,subtree:true});
  mark();
})();
