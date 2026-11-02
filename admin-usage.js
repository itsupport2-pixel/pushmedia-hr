/* ── ตั้งค่า › การใช้งาน (Usage) · 2 พ.ย. 2569 ผู้ใช้ขอ: เมนูย่อย "การใช้งาน" รวม Cloudflare + LINE ──
 * แท็บ Cloudflare = หน้าเดิม (admin-settings.js t==='cf') · แท็บ LINE = lineUsage (app/gas/notify/LineUsage.js) */
function usTabs(){var t=A.usTab||'cf',b=function(k,l){return '<button type="button" data-ust="'+k+'" aria-pressed="'+(t===k)+'">'+l+'</button>'};
  return '<div class="evs" role="group" aria-label="การใช้งาน" style="margin-bottom:14px;display:inline-flex">'+b('cf','Cloudflare')+b('line','LINE')+'</div>'}
function usTabBind(){$$('[data-ust]').forEach(function(x){x.onclick=function(){if((A.usTab||'cf')===x.dataset.ust)return;A.usTab=x.dataset.ust;fxArm('set');drawSet()}})}
function luView(){var cur=dIso(new Date()).slice(0,7),d=new Date(+cur.slice(0,4),+cur.slice(5,7)-2,1),prev=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);A.luYm=A.luYm||cur;
  var mb=function(m){return '<button type="button" data-luy="'+m+'" aria-pressed="'+(A.luYm===m)+'">'+esc(xdYmTxt(m))+'</button>'};
  return '<section class="card"><div class="ch"><h3 style="display:flex;align-items:center;gap:10px"><span class="ln-logo">'+LINE_LOGO+'</span>การใช้งาน LINE OA</h3><span class="sp"></span><div class="evs" role="group" aria-label="เดือน" style="display:inline-flex">'+mb(cur)+mb(prev)+'</div><button class="btn sm" id="lu-re">รีเฟรช</button></div><div class="cb" id="lu-body"><div class="loading"><span class="spin"></span>กำลังโหลดจาก LINE…</div></div></section>'}
function luBind(){var load=function(f){var b=$('#lu-body');if(b)b.innerHTML='<div class="loading"><span class="spin"></span>กำลังโหลดจาก LINE…</div>';aCall('lineUsage',A.luYm,!!f).then(function(r){A.lu=r;luDraw()}).catch(function(e){var b2=$('#lu-body');if(b2)b2.innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $$('[data-luy]').forEach(function(x){x.onclick=function(){A.luYm=x.dataset.luy;$$('[data-luy]').forEach(function(y){y.setAttribute('aria-pressed',y===x)});load()}});
  $('#lu-re').onclick=function(){load(1)};if(A.lu&&A.lu.ym===A.luYm)luDraw();else load()}
function luDraw(){var r=A.lu,b=$('#lu-body');if(!b||!r)return;var n=function(v){return v==null?'—':(+v).toLocaleString('th-TH')};
  var h='';
  if(!r.token)h+='<div class="alert" style="background:var(--warn-s);color:var(--warn)">ยังไม่ได้เชื่อม LINE Messaging API · ตั้งที่ ตั้งค่า › LINE</div>';
  // ① โควตาเดือนนี้ (LINE)
  if(r.cur){var q=r.quota,u=r.used,lim=q>0,left=lim&&u!=null?Math.max(0,q-u):null,pc=lim&&u!=null?Math.min(100,u/q*100):null;
    h+='<div class="lu-k3"><div class="lu-k"><span>ข้อความที่ใช้ไปเดือนนี้</span><b>'+n(u)+'</b><small>นับโดย LINE · Push + Multicast + Broadcast (Reply ไม่นับ)</small></div>'+
     '<div class="lu-k"><span>โควตาของแพ็กเกจ</span><b>'+(q==null?'—':q<0?'ไม่จำกัด':n(q))+'</b><small>'+(q==null?'อ่านโควตาไม่ได้'+(r.err?' · '+esc(r.err):''):'ต่อเดือน · ตั้งใน LINE OA Manager')+'</small></div>'+
     '<div class="lu-k"><span>คงเหลือ</span><b'+(pc!=null&&pc>=90?' style="color:var(--bad)"':'')+'>'+(left==null?'—':n(left))+'</b><small>'+(pc==null?'':'ใช้ไป '+pc.toFixed(1)+'%')+'</small>'+(pc==null?'':'<span class="lu-bar"><i style="width:'+pc+'%;'+(pc>=90?'background:var(--bad)':pc>=70?'background:var(--warn)':'')+'"></i></span>')+'</div></div>'}
  else h+='<div class="faint" style="font-size:12.5px;margin-bottom:10px">LINE ให้ดูโควตาได้เฉพาะเดือนปัจจุบัน · เดือนก่อนแสดงจากบันทึกของระบบ</div>';
  // ② รายวัน push / reply (14 วันล่าสุด)
  var D=r.days||[];if(D.length){var mx=Math.max.apply(0,D.map(function(x){return (x.push||0)+(x.reply||0)}).concat([1])),W=D.length*44+10,tp=0,tr=0;D.forEach(function(x){tp+=x.push||0;tr+=x.reply||0});
    var sv='<svg viewBox="0 0 '+W+' 170" class="lu-ch" role="img" aria-label="ข้อความรายวัน">';D.forEach(function(x,i){var X=8+i*44,hp=(x.push||0)/mx*120,hr=(x.reply||0)/mx*120;
      sv+='<rect x="'+X+'" y="'+(130-hp)+'" width="30" height="'+Math.max(hp,x.push?2:0)+'" rx="3" fill="#06C755"/><rect x="'+X+'" y="'+(130-hp-hr)+'" width="30" height="'+Math.max(hr,x.reply?2:0)+'" rx="3" fill="#9CA3AF"/>'+
       ((x.push||0)+(x.reply||0)?'<text x="'+(X+15)+'" y="'+(124-hp-hr)+'" text-anchor="middle" font-size="10" font-weight="600">'+((x.push||0)+(x.reply||0))+'</text>':'')+
       '<text x="'+(X+15)+'" y="148" text-anchor="middle" font-size="10" fill="#909090">'+(+x.d.slice(8))+'</text>'+(x.push==null?'<text x="'+(X+15)+'" y="162" text-anchor="middle" font-size="9" fill="#C0C0C0">รอ</text>':'')});sv+='</svg>';
    h+='<div class="lu-sec"><div class="xd-lh"><h4>ส่งรายวัน · 14 วันล่าสุด</h4><div class="xd-lg"><span><i style="background:#06C755"></i>Push '+n(tp)+'</span><span><i style="background:#9CA3AF"></i>Reply '+n(tr)+' (ไม่นับโควตา)</span></div></div>'+sv+'<div class="faint" style="font-size:12px">จาก LINE · นับเป็นจำนวนผู้รับ (ส่งเข้ากลุ่ม 1 ครั้ง = จำนวนสมาชิกในกลุ่ม) · LINE สรุปถึงเมื่อวาน · "รอ" = LINE ยังไม่สรุป</div></div>'}
  // ③ ใช้ไปกับอะไร (บันทึกของระบบ)
  var C=r.cats||[],tot=C.reduce(function(s,c){return s+c.person+c.group},0);
  h+='<div class="lu-sec"><h4>ระบบส่งไปกับเรื่องอะไร · '+esc(xdYmTxt(r.ym))+'</h4><div class="tw"><table class="xd-t"><thead><tr><th>เรื่อง</th><th class="num">LINE รายคน</th><th class="num">เข้ากลุ่ม (ครั้ง)</th><th class="num">ไม่มี LINE</th><th class="num">ส่งไม่สำเร็จ</th><th style="width:30%">สัดส่วน</th></tr></thead><tbody>'+
   (C.length?C.map(function(c){var s=c.person+c.group;return '<tr><td><b>'+esc(c.name)+'</b></td><td class="num">'+n(c.person)+'</td><td class="num">'+n(c.group)+'</td><td class="num">'+(c.nolink?n(c.nolink):'<span class="faint">0</span>')+'</td><td class="num">'+(c.fail?'<b style="color:var(--bad)">'+n(c.fail)+'</b>':'<span class="faint">0</span>')+'</td><td><span class="tp-bar"><i style="width:'+(tot?s/tot*100:0)+'%;background:#06C755"></i></span></td></tr>'}).join(''):'<tr><td colspan="6" class="rp-empty">ยังไม่มีการส่งในเดือนนี้</td></tr>')+
   '</tbody></table></div><div class="faint" style="font-size:12px;margin-top:6px">จากบันทึกของระบบ HR (ไม่รวมระบบอื่นที่ใช้ OA เดียวกัน) · "เข้ากลุ่ม" นับเป็นครั้งที่ส่ง LINE จะคิดตามจำนวนสมาชิกในกลุ่ม · ข้อมูลเมื่อ '+esc(fdt(r.at))+'</div></div>';
  b.innerHTML=h}
