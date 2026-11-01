/* ── รายงาน › Top 10 + วิเคราะห์พฤติกรรม (1 พ.ย. 2569 ผู้ใช้ขอ: "รายชื่อ Top 10 การลา ขาด แก้ไขเวลา ของทั้งบริษัทในแต่ละเดือน" + "หน้าวิเคราะห์การเปลี่ยนแปลงพฤติกรรมของพนักงาน")
 * ใช้ข้อมูลชุดเดียวกับ Dashboard ผู้บริหาร (execDashboard: รายคนรายเดือน 6 เดือนถึงเดือนที่เลือก) → ไม่ต้องแก้หลังบ้าน
 * ขอบเขต = "ลงเวลา" ของผู้ใช้ (HR/admin/ผู้บริหาร = ทั้งบริษัท) · ค่าเริ่มต้น = เดือนที่แล้ว (เดือนจบแล้ว เทียบได้เต็มที่)
 * นับเป็น "วัน": ลา = วันที่ระบบลงเวลาสรุปว่าลา · ขาด = วันทำงานที่ไม่มีบันทึกเวลา · แก้ไขเวลา = วันที่มีรายการ HR ลงแทน/แก้เวลา (Time Adjust) */
var TP_K=[['lv','การลา','วัน'],['abs','ขาดงาน','วัน'],['adj','แก้ไขเวลา','วัน']];
function tpPrev(){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return dIso(d).slice(0,7)}
function tpHead(tab,title,sub){var cur=dIso(new Date()).slice(0,7);A.tpYm=A.tpYm||tpPrev();var ms=[];
  for(var k=0;k<12;k++){var d=new Date(+cur.slice(0,4),+cur.slice(5,7)-1-k,1);ms.push(d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2))}
  return '<div class="ph"><div><h1>'+title+'</h1><div class="sub">'+sub+' · ขอบเขต: '+esc(scopeTxt('att'))+'</div></div><span class="sp"></span>'+
   '<label class="xd-l">เดือน<select id="tp-ym">'+ms.map(function(m){return '<option value="'+m+'"'+(m===A.tpYm?' selected':'')+'>'+xdYmTxt(m)+(m===cur?' (ถึงวันนี้)':'')+'</option>'}).join('')+'</select></label><button class="btn" id="tp-rl">โหลดใหม่</button></div>'+
   rpTabs(tab)+'<div id="tp-body"><div class="loading"><span class="spin"></span>กำลังรวมข้อมูล 6 เดือน…</div></div>'}
function vTop(){return tpHead('top','Top 10 รายเดือน','อันดับพนักงานที่ลา ขาดงาน และแก้ไขเวลามากที่สุดในเดือน · เท่ากันเรียงตามยอด 6 เดือน')}
function vBh(){return tpHead('bh','วิเคราะห์พฤติกรรม','เทียบเดือนที่เลือกกับค่าเฉลี่ย 3 เดือนก่อนหน้าของพนักงานแต่ละคน')}
function tpBind(draw){var load=function(){$('#tp-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังรวมข้อมูล 6 เดือน…</div>';
    aCall('execDashboard',A.tpYm).then(function(d){A.tp=d;draw()}).catch(function(e){if($('#tp-body'))$('#tp-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $('#tp-ym').onchange=function(){A.tpYm=this.value;load()};$('#tp-rl').onclick=function(){fxArm('rep');load()};
  if(A.tp&&A.tp.ym===A.tpYm)draw();else load()}
function bTop(){tpBind(drawTop)}
function bBh(){tpBind(drawBh)}
/* แผนก (ปุ่มเลือก) · ใช้ร่วมกันทั้ง 2 แท็บ */
function tpPs(){var d=A.tp,dep=A.tpDep||'all';return dep==='all'?d.people:d.people.filter(function(p){return p.dept===dep})}
function tpChips(){var d=A.tp,dep=A.tpDep||'all',used=d.depts.filter(function(x){return d.people.some(function(p){return p.dept===x.id})});
  if(dep!=='all'&&!used.some(function(x){return x.id===dep}))A.tpDep=dep='all';
  var chip=function(id,l){return '<button class="xd-chip" data-tpd="'+id+'" aria-pressed="'+(dep===id)+'">'+(id==='all'?'':'<i style="background:'+xdColor(id)+'"></i>')+esc(l)+'</button>'};
  return '<div class="xd-chips"><span class="faint">ดูข้อมูลของ</span>'+chip('all','ทั้งบริษัท')+used.map(function(x){return chip(x.id,x.name)}).join('')+'</div>'}
function tpBindCommon(draw){$$('[data-tpd]').forEach(function(b){b.onclick=function(){A.tpDep=b.dataset.tpd;draw()}});
  $$('#tp-body [data-tpp]').forEach(function(b){b.onclick=function(){tpPerson(b.dataset.tpp)}})}
function tpN(v){return v%1?(+v).toFixed(1):String(v)}
function tpNm(p){return '<b>'+esc(p.name)+'</b>'+(p.nickname?' ('+esc(p.nickname)+')':'')+'<small><i class="xd-dot" style="background:'+xdColor(p.dept)+'"></i>'+esc(org('departments',p.dept)||'—')+'</small>'}
function tpMo(p,m){return p.mo[m]||{exp:0,pres:0,abs:0,lv:0,late:0,off:0,adj:0,inSum:0}}
function tpSum(ps,m,f){return ps.reduce(function(s,p){return s+tpMo(p,m)[f]},0)}
/* อันดับของเดือน m: ค่าเดือนนั้นมากก่อน → เท่ากันเรียงตามยอดสะสมถึงเดือนนั้น · ค่า 0 ไม่เข้าอันดับ */
function tpRank(d,ps,f,m){m=m||d.ym;var upto=d.months.slice(0,d.months.indexOf(m)+1);
  return ps.map(function(p){return {p:p,v:tpMo(p,m)[f],s6:upto.reduce(function(s,x){return s+tpMo(p,x)[f]},0)}}).filter(function(x){return x.v>0})
    .sort(function(a,b){return b.v-a.v||b.s6-a.s6||(a.p.name<b.p.name?-1:1)})}
var TP_LT=['#141414','#5A5A5A','#8C8C8C','#B5B5B5','#D4D4D4'];   // สีประเภทลา (โทนขาว–ดำของระบบ)

/* ── Top 10 (ปรับให้ผู้บริหารอ่านง่าย 1 พ.ย. 2569 17:20 ตามภาพผู้ใช้): ตัวเลขสรุป 3 หมวด → เลือกหมวด → อันดับเต็มความกว้างแบบแถบยาว + แผนก + ข้อสังเกต ── */
function drawTop(){var d=A.tp;if(!d||!$('#tp-body'))return;var ym=d.ym,i=d.months.indexOf(ym),pm=i>0?d.months[i-1]:null,ps=tpPs(),cat=A.tpCat||'lv',h=tpChips();
  var K=TP_K.filter(function(k){return k[0]===cat})[0],R={},in10={};
  TP_K.forEach(function(k){R[k[0]]=tpRank(d,ps,k[0]);R[k[0]].slice(0,10).forEach(function(x){(in10[x.p.id]=in10[x.p.id]||[]).push(k[1])})});
  if(ym===dIso(new Date()).slice(0,7))h+='<div class="alert" style="background:var(--warn-s);color:var(--warn)">เดือนนี้ยังไม่จบ · นับถึง '+esc(dTxt(d.end))+'</div>';
  // ① ตัวเลขสรุป 3 หมวด (กดเพื่อเลือกหมวด)
  h+='<div class="tp-k3">'+TP_K.map(function(k){var f=k[0],t=tpSum(ps,ym,f),pt=pm?tpSum(ps,pm,f):null,r=R[f],t10=r.slice(0,10).reduce(function(s,x){return s+x.v},0);
    return '<button class="card tp-kc" data-tpc="'+f+'" aria-pressed="'+(cat===f)+'"><span class="tp-kl">'+k[1]+'รวม</span><span class="tp-kv">'+tpN(t)+' <small>วัน</small></span>'+
     '<span class="tp-ks">'+(pt==null?'':xdDelta(t,pt,' วัน',1,0)+' <span class="faint">จากเดือนก่อน ('+tpN(pt)+')</span>')+'</span>'+
     '<span class="tp-ks faint">'+r.length+' คน · Top 10 รวม '+tpN(t10)+' วัน'+(t?' = '+Math.round(t10/t*100)+'% ของทั้งหมด':'')+'</span></button>'}).join('')+'</div>';
  // ② อันดับของหมวดที่เลือก
  var rows=R[cat],all=A['tpAll_'+cat],show=all?rows:rows.slice(0,10),mx=Math.max.apply(0,show.map(function(x){return x.v}).concat([1]));
  var hist={};d.months.slice(Math.max(0,i-5),i).forEach(function(m){tpRank(d,ps,cat,m).slice(0,10).forEach(function(x){(hist[x.p.id]=hist[x.p.id]||{})[m]=1})});
  var streak=function(id){var n=1;for(var j=i-1;j>=0&&hist[id]&&hist[id][d.months[j]];j--)n++;return n};
  var lvT={},types=[];if(cat==='lv')d.leave_month.forEach(function(z){var o=lvT[z[0]]=lvT[z[0]]||{};o[z[1]]=(o[z[1]]||0)+z[2];if(types.indexOf(z[1])<0)types.push(z[1])});
  var tCol=function(t){return TP_LT[types.indexOf(t)%TP_LT.length]};
  var bar=function(x){var w=x.v/mx*100;if(cat!=='lv'||!lvT[x.p.id])return '<span class="tp-bar"><i style="width:'+w+'%;background:'+(cat==='abs'?'var(--bad)':'#141414')+'"></i></span>';
    var o=lvT[x.p.id],tot=Object.keys(o).reduce(function(s,t){return s+o[t]},0);
    return '<span class="tp-bar" style="--w:'+w+'%"><span class="tp-stk" style="width:'+w+'%">'+Object.keys(o).map(function(t){return '<i style="flex:'+o[t]/tot+';background:'+tCol(t)+'" title="'+esc(t)+' '+tpN(o[t])+' วัน"></i>'}).join('')+'</span></span>'};
  var chg=function(x){var pv=pm?tpMo(x.p,pm)[cat]:null;if(pv==null)return '<td class="num faint">—</td><td class="num faint">—</td>';
    var df=x.v-pv;return '<td class="num">'+tpN(pv)+'</td><td class="num">'+(df===0?'<span class="faint">เท่าเดิม</span>':'<span class="'+(df>0?'xd-dn':'xd-up')+'">'+(df>0?'+':'−')+tpN(Math.abs(df))+'</span>')+'</td>'};
  var tags=function(x){var t=[],o=(in10[x.p.id]||[]).filter(function(l){return l!==K[1]}),s=streak(x.p.id);
    if(s>=3)t.push('<span class="badge b-warn">ติด Top 10 ต่อเนื่อง '+s+' เดือน</span>');if(o.length)t.push('<span class="badge b-bad">ติด Top 10 '+o.join(' + ')+' ด้วย</span>');
    if(cat==='lv'&&lvT[x.p.id])t.push('<span class="faint">'+Object.keys(lvT[x.p.id]).map(function(l){return esc(l)+' '+tpN(lvT[x.p.id][l])}).join(' · ')+'</span>');return t.join(' ')};
  var tbl='<div class="tw"><table class="xd-t tp-t tp-tt"><colgroup><col style="width:48px"><col style="width:44%"><col><col style="width:84px"><col style="width:76px"></colgroup><thead><tr><th class="num">#</th><th>พนักงาน</th><th>'+K[1]+' '+xdYmTxt(ym)+'</th><th class="num">เดือนก่อน</th><th class="num">เปลี่ยน</th></tr></thead><tbody>'+
   (show.length?show.map(function(x,j){
     return '<tr class="ck" data-tpp="'+esc(x.p.id)+'"><td class="num"><span class="xd-n'+(j<3?' top':'')+'">'+(j+1)+'</span></td><td class="tp-pn"><b>'+esc(x.p.name)+'</b>'+(x.p.nickname?' ('+esc(x.p.nickname)+')':'')+'<div class="faint"><i class="xd-dot" style="background:'+xdColor(x.p.dept)+'"></i>'+esc(org('departments',x.p.dept)||'—')+'</div>'+(tags(x)?'<div class="tp-tg">'+tags(x)+'</div>':'')+'</td>'+
      '<td><div class="tp-bv">'+bar(x)+'<b>'+tpN(x.v)+' วัน</b></div></td>'+chg(x)+'</tr>'}).join('')
    :'<tr><td colspan="5" class="rp-empty">ไม่มีพนักงาน'+K[1]+'ในเดือนนี้</td></tr>')+'</tbody></table></div>';
  var leg=cat==='lv'&&types.length?'<div class="xd-lg">'+types.map(function(t){return '<span><i style="background:'+tCol(t)+'"></i>'+esc(t)+'</span>'}).join('')+'</div>':'';
  // ③ แยกตามแผนก + ข้อสังเกต
  var deps=d.depts.map(function(x){var pp=ps.filter(function(p){return p.dept===x.id}),t=tpSum(pp,ym,cat);return {x:x,t:t,n:pp.length}}).filter(function(r){return r.t>0}).sort(function(a,b){return b.t-a.t}),dm=Math.max.apply(0,deps.map(function(r){return r.t}).concat([1])),tot=tpSum(ps,ym,cat);
  var dep='<section class="card xd-c"><h3>'+K[1]+'แยกตามแผนก</h3><div class="faint xd-cs">'+xdYmTxt(ym)+' · วันรวม (เฉลี่ยต่อคน)</div>'+(deps.length?deps.map(function(r){return '<div class="tp-dr"><span><i class="xd-dot" style="background:'+xdColor(r.x.id)+'"></i>'+esc(r.x.name)+'</span><span class="tp-bar"><i style="width:'+r.t/dm*100+'%;background:'+xdColor(r.x.id)+'"></i></span><b>'+tpN(r.t)+'</b><span class="faint">'+(r.n?(r.t/r.n).toFixed(1):'0')+'/คน</span></div>'}).join(''):'<div class="faint">ไม่มี</div>')+'</section>';
  var ins=[],t10=rows.slice(0,10),multi=t10.filter(function(x){return (in10[x.p.id]||[]).length>1}),st3=t10.filter(function(x){return streak(x.p.id)>=3});
  if(tot&&t10.length)ins.push(['i','info','Top 10 รวม '+tpN(t10.reduce(function(s,x){return s+x.v},0))+' วัน คิดเป็น '+Math.round(t10.reduce(function(s,x){return s+x.v},0)/tot*100)+'% ของ'+K[1]+'ทั้งหมด ('+rows.length+' คน)']);
  if(multi.length)ins.push(['!','bad',multi.length+' คนใน Top 10 นี้ติด Top 10 หมวดอื่นด้วย: '+multi.slice(0,4).map(function(x){return x.p.nickname||x.p.name}).join(', ')+(multi.length>4?' …':'')]);
  if(st3.length)ins.push(['!','warn',st3.length+' คนติด Top 10 '+K[1]+'ต่อเนื่อง 3 เดือนขึ้นไป: '+st3.slice(0,4).map(function(x){return x.p.nickname||x.p.name}).join(', ')+(st3.length>4?' …':'')]);
  if(pm){var up=rows.map(function(x){return {x:x,df:x.v-tpMo(x.p,pm)[cat]}}).sort(function(a,b){return b.df-a.df})[0];if(up&&up.df>=2)ins.push(['↗','warn','เพิ่มขึ้นมากสุด: '+(up.x.p.nickname||up.x.p.name)+' '+tpN(tpMo(up.x.p,pm)[cat])+' → '+tpN(up.x.v)+' วัน'])}
  if(deps.length&&tot)ins.push(['i','info','แผนก '+deps[0].x.name+' มี'+K[1]+'มากสุด '+tpN(deps[0].t)+' วัน ('+Math.round(deps[0].t/tot*100)+'%)']);
  if(cat==='lv'&&types.length){var tt={};d.leave_month.forEach(function(z){if(ps.some(function(p){return p.id===z[0]}))tt[z[1]]=(tt[z[1]]||0)+z[2]});var top=Object.keys(tt).sort(function(a,b){return tt[b]-tt[a]})[0],ts=Object.keys(tt).reduce(function(s,k){return s+tt[k]},0);if(top)ins.push(['i','info','ประเภทที่ลามากสุด: '+top+' '+tpN(tt[top])+' วัน ('+Math.round(tt[top]/ts*100)+'% ของวันลาที่อนุมัติ)'])}
  var insH='<section class="card xd-c"><h3>ข้อสังเกต</h3><div class="faint xd-cs">สรุปอัตโนมัติจากตัวเลข</div>'+(ins.length?'<div class="xd-ins">'+ins.map(function(x){return '<div><span class="xd-ii '+x[1]+'">'+x[0]+'</span><span>'+esc(x[2])+'</span></div>'}).join('')+'</div>':'<div class="faint">ไม่มี</div>')+'</section>';
  h+='<div class="tp-main"><section class="card xd-c"><div class="xd-lh"><h3>Top 10 '+K[1]+' · '+xdYmTxt(ym)+'</h3>'+leg+'</div><div class="faint xd-cs">เรียงจากมากไปน้อย · เท่ากันเรียงตามยอด 6 เดือน · กดแถวเพื่อดูรายละเอียด</div>'+tbl+
   (rows.length>10?'<button class="lnk" data-tpa="'+cat+'">'+(all?'ย่อเหลือ 10 อันดับ':'ดูทั้งหมด '+rows.length+' คน')+'</button>':'')+'</section><div class="tp-side">'+insH+dep+'</div></div>';
  h+='<div class="faint" style="font-size:12.5px">ลา = วันที่ระบบสรุปว่าลา (ครึ่งวันนับ 1 วัน) · ขาดงาน = วันทำงานที่ไม่มีบันทึกเวลาและไม่ได้ลา · แก้ไขเวลา = วันที่มี HR ลงเวลาแทน/แก้เวลา</div>';
  $('#tp-body').innerHTML=h;tpBindCommon(drawTop);
  $$('[data-tpc]').forEach(function(b){b.onclick=function(){A.tpCat=b.dataset.tpc;drawTop()}});
  $$('[data-tpa]').forEach(function(b){b.onclick=function(){var k='tpAll_'+b.dataset.tpa;A[k]=!A[k];drawTop()}})}

/* ── วิเคราะห์พฤติกรรม ──
 * ฐาน = ค่าเฉลี่ย 3 เดือนก่อนหน้าที่มีข้อมูล (อย่างน้อย 1 เดือน) · คนที่ไม่มีเดือนก่อนหน้า (พนักงานใหม่) ไม่นำมาเทียบ
 * สัญญาณ: ขาด ≥ +2 วัน · ลา ≥ +2 วัน · สาย ≥ +3 ครั้ง · แก้เวลา ≥ +2 วัน · อัตรามาทำงาน ±10 จุด · เข้างานช้าลง/เร็วขึ้น ≥ 15 นาที
 *        + ขาด/ลาวันจันทร์หรือวันศุกร์ (≥ 2 ครั้ง และ ≥ 2/3 ของทั้งหมด) + ขาดหรือสายเพิ่มขึ้นต่อเนื่อง 3 เดือน */
var BH_T={abs:2,lv:2,late:3,adj:2,rate:10,inT:15};
var BH_SIG={abs:'ขาดงานเพิ่ม',lv:'ลาเพิ่ม',late:'มาสายเพิ่ม',adj:'แก้ไขเวลาเพิ่ม',rate:'อัตรามาทำงานลดลง',inT:'เข้างานช้าลง',mf:'ขาด/ลาวันจันทร์หรือวันศุกร์',tr_abs:'ขาดงานเพิ่มต่อเนื่อง 3 เดือน',tr_late:'มาสายเพิ่มต่อเนื่อง 3 เดือน'};
function bhOf(p,d){var ym=d.ym,i=d.months.indexOf(ym),c=tpMo(p,ym);if(!c.exp&&!c.lv)return null;
  var bm=d.months.slice(Math.max(0,i-3),i).filter(function(m){var x=tpMo(p,m);return x.exp||x.lv});
  var avg=function(f){return bm.length?bm.reduce(function(s,m){return s+f(tpMo(p,m))},0)/bm.length:null};
  var rt=function(x){return x.exp?x.pres/x.exp*100:null},it=function(x){return x.pres>=5&&x.inSum?x.inSum/x.pres:null};
  var b={abs:avg(function(x){return x.abs}),lv:avg(function(x){return x.lv}),late:avg(function(x){return x.late}),adj:avg(function(x){return x.adj})},
    rv=bm.map(function(m){return rt(tpMo(p,m))}).filter(function(v){return v!=null}),iv=bm.map(function(m){return it(tpMo(p,m))}).filter(function(v){return v!=null});
  b.rate=rv.length?rv.reduce(function(s,v){return s+v},0)/rv.length:null;b.inT=iv.length?iv.reduce(function(s,v){return s+v},0)/iv.length:null;
  var cur={abs:c.abs,lv:c.lv,late:c.late,adj:c.adj,rate:c.exp>=5?rt(c):null,inT:it(c)},bad=[],good=[],pat=[],sig=[],sc=0;
  var hm=function(m){m=Math.round(m);return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)};
  if(bm.length){
    [['abs','ขาดงาน','วัน',3],['lv','ลา','วัน',1],['late','มาสาย','ครั้ง',1],['adj','แก้ไขเวลา','วัน',1]].forEach(function(k){var df=cur[k[0]]-b[k[0]];
      if(df>=BH_T[k[0]]){bad.push(k[1]+'เพิ่ม '+tpN(+b[k[0]].toFixed(1))+' → '+tpN(cur[k[0]])+' '+k[2]);sig.push(k[0]);sc+=df*k[3]}
      else if(-df>=BH_T[k[0]]){good.push(k[1]+'ลดลง '+tpN(+b[k[0]].toFixed(1))+' → '+tpN(cur[k[0]])+' '+k[2])}});
    if(cur.rate!=null&&b.rate!=null){var dr=cur.rate-b.rate;if(dr<=-BH_T.rate){bad.push('อัตรามาทำงาน '+b.rate.toFixed(0)+'% → '+cur.rate.toFixed(0)+'%');sig.push('rate');sc+=-dr/5}else if(dr>=BH_T.rate)good.push('อัตรามาทำงาน '+b.rate.toFixed(0)+'% → '+cur.rate.toFixed(0)+'%')}
    if(cur.inT!=null&&b.inT!=null){var di=cur.inT-b.inT;
      if(di>=BH_T.inT){bad.push('เข้างานเฉลี่ยช้าลง '+hm(b.inT)+' → '+hm(cur.inT));sig.push('inT');sc+=di/15}else if(-di>=BH_T.inT)good.push('เข้างานเฉลี่ยเร็วขึ้น '+hm(b.inT)+' → '+hm(cur.inT))}
    if(b.abs>=1&&!cur.abs&&c.exp>=5&&good.every(function(x){return x.indexOf('ขาดงาน')<0}))good.push('ไม่ขาดงานเลยเดือนนี้ (เดิมเฉลี่ย '+tpN(+b.abs.toFixed(1))+' วัน)')}
  var mf=0,al=0;Object.keys(p.days).forEach(function(s){var x=p.days[s];if(x[0]!=='a'&&x[0]!=='l')return;al++;var w=dObj(s).getDay();if(w===1||w===5)mf++});
  if(mf>=2&&mf/al>=2/3){pat.push('ขาด/ลาวันจันทร์หรือวันศุกร์ '+mf+' จาก '+al+' ครั้ง');sig.push('mf');sc+=mf}
  var t3=d.months.slice(Math.max(0,i-2),i+1);if(t3.length===3)[['abs','ขาดงาน'],['late','มาสาย']].forEach(function(k){var v=t3.map(function(m){return tpMo(p,m)[k[0]]});
    if(v[0]<v[1]&&v[1]<v[2]&&v[2]>=2){pat.push(k[1]+'เพิ่มต่อเนื่อง 3 เดือน ('+v.join(' → ')+')');sig.push('tr_'+k[0]);sc+=2}});
  sc+=bad.length+pat.length;
  return {p:p,base:bm.length,b:b,cur:cur,bad:bad,good:good,pat:pat,sig:sig,sc:sc,lvl:sc>=8||bad.length+pat.length>=3?'h':'m'}}
/* ปรับให้ผู้บริหารอ่านง่าย (1 พ.ย. 2569 17:20): สรุปเป็นประโยค → ตัวชี้วัด 6 ใบ → ประเด็นที่พบ/แผนก → ตารางรายชื่อ */
function drawBh(){var d=A.tp;if(!d||!$('#tp-body'))return;var ym=d.ym,i=d.months.indexOf(ym),ps=tpPs(),h=tpChips();
  if(ym===dIso(new Date()).slice(0,7))h+='<div class="alert" style="background:var(--warn-s);color:var(--warn)">เดือนนี้ยังไม่จบ (นับถึง '+esc(dTxt(d.end))+') · จำนวนวันจะน้อยกว่าเดือนก่อน ๆ ผลเทียบอาจดูดีกว่าความจริง · แนะนำเลือกเดือนที่จบแล้ว</div>';
  var R=ps.map(function(p){return bhOf(p,d)}).filter(Boolean);
  if(!R.length){$('#tp-body').innerHTML=h+'<section class="card"><div class="rp-empty">ยังไม่มีข้อมูลลงเวลาของเดือนนี้ (ระบบสรุปวันที่จบแล้วเท่านั้น)</div></section>';tpBindCommon(drawBh);return}
  var cmp=R.filter(function(x){return x.base}),nw=R.length-cmp.length;
  var worse=R.filter(function(x){return x.sig.length}).sort(function(a,b){return b.sc-a.sc}),better=cmp.filter(function(x){return x.good.length&&!x.sig.length}).sort(function(a,b){return b.good.length-a.good.length});
  var hi=worse.filter(function(x){return x.lvl==='h'}).length,stable=cmp.filter(function(x){return !x.sig.length&&!x.good.length}).length;
  var cnt={};worse.forEach(function(x){x.sig.forEach(function(k){cnt[k]=(cnt[k]||0)+1})});var ck=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]});
  // ① สรุปเป็นประโยค
  h+='<section class="card tp-hl"><div class="tp-hn"><b class="bad">'+worse.length+'</b><span>ควรติดตาม'+(hi?'<br><small>ระดับสูง '+hi+' คน</small>':'')+'</span></div><div class="tp-hn"><b class="ok">'+better.length+'</b><span>ดีขึ้น</span></div><div class="tp-hn"><b>'+stable+'</b><span>คงที่</span></div>'+(nw?'<div class="tp-hn"><b class="faint">'+nw+'</b><span>ยังเทียบไม่ได้<br><small>ไม่มีเดือนก่อน</small></span></div>':'')+
   '<p>'+xdYmTxt(ym)+' จากพนักงาน '+R.length+' คน มี <b>'+worse.length+' คน</b>ที่พฤติกรรมแย่ลงจากค่าเฉลี่ย 3 เดือนก่อนของตัวเอง'+(ck.length?' ส่วนใหญ่เป็นเรื่อง<b>'+BH_SIG[ck[0]]+'</b> ('+cnt[ck[0]]+' คน)'+(ck[1]?' และ'+BH_SIG[ck[1]]+' ('+cnt[ck[1]]+' คน)':''):'')+' · ดีขึ้น '+better.length+' คน</p></section>';
  // ② ตัวชี้วัด 6 ใบ (กลุ่มที่เลือก) เทียบเฉลี่ย 3 เดือน
  var bm=d.months.slice(Math.max(0,i-3),i),a=xdAgg(ps,ym),avg=function(f){var v=bm.map(function(m){return f(xdAgg(ps,m))}).filter(function(x){return x!=null});return v.length?v.reduce(function(s,x){return s+x},0)/v.length:null};
  var kc=function(l,f,unit,lowGood,dp){var cu=f(a),bv=avg(f);return '<section class="card xd-k"><div class="xd-kh"><span>'+l+'</span></div><div class="xd-kv">'+(cu==null?'—':cu.toFixed(dp)+unit)+'</div><div class="xd-ks">'+xdDelta(cu,bv,unit==='%'?' จุด':'',lowGood,dp)+' <span class="faint">จากเฉลี่ย 3 เดือน'+(bv==null?'':' ('+bv.toFixed(dp)+unit+')')+'</span></div>'+xdSpark(d.months.map(function(m){return f(xdAgg(ps,m))}))+'</section>'};
  h+='<div class="xd-g6">'+kc('อัตรามาทำงาน',function(x){return x.rate},'%',0,1)+kc('ขาดงาน (วัน/คน)',function(x){return x.n?x.abs/x.n:null},'',1,2)+kc('ลา (วัน/คน)',function(x){return x.n?x.lv/x.n:null},'',1,2)+
   kc('มาสาย',function(x){return x.lateP},'%',1,1)+kc('แก้ไขเวลา (วัน/คน)',function(x){return x.n?x.adj/x.n:null},'',1,2)+kc('ทำงานนอกพื้นที่',function(x){return x.offP},'%',0,1)+'</div>';
  // ③ ประเด็นที่พบ + แผนก
  var cm=Math.max.apply(0,ck.map(function(k){return cnt[k]}).concat([1]));
  var deps=d.depts.map(function(x){var pp=R.filter(function(r){return r.p.dept===x.id}),w=pp.filter(function(r){return r.sig.length}).length;return {x:x,n:pp.length,w:w}}).filter(function(r){return r.n}).sort(function(a,b){return b.w/b.n-a.w/a.n});
  h+='<div class="xd-g2"><section class="card xd-c"><h3>ประเด็นที่พบ</h3><div class="faint xd-cs">จำนวนคนต่อประเด็น (1 คนอาจมีหลายประเด็น)</div>'+(ck.length?ck.map(function(k){return '<div class="tp-dr"><span>'+BH_SIG[k]+'</span><span class="tp-bar"><i style="width:'+cnt[k]/cm*100+'%;background:'+(k==='mf'||k.indexOf('tr_')===0?'var(--warn)':'var(--bad)')+'"></i></span><b>'+cnt[k]+'</b><span class="faint">คน</span></div>'}).join(''):'<div class="faint">ไม่พบ</div>')+'</section>'+
   '<section class="card xd-c"><h3>แยกตามแผนก</h3><div class="faint xd-cs">คนที่ควรติดตาม ÷ คนในแผนก</div>'+deps.map(function(r){return '<div class="tp-dr"><span><i class="xd-dot" style="background:'+xdColor(r.x.id)+'"></i>'+esc(r.x.name)+'</span><span class="tp-bar"><i style="width:'+r.w/r.n*100+'%;background:'+xdColor(r.x.id)+'"></i></span><b>'+r.w+'/'+r.n+'</b><span class="faint">'+Math.round(r.w/r.n*100)+'%</span></div>'}).join('')+'</section></div>';
  // ④ ตารางรายชื่อ
  var cell=function(x,f,dp){var bv=x.b[f],cv=x.cur[f];if(bv==null)return '<td class="num">'+tpN(cv)+'</td>';var bad=cv-bv>=BH_T[f],good=bv-cv>=BH_T[f];return '<td class="num"><span class="faint">'+tpN(+bv.toFixed(1))+' → </span><b'+(bad?' class="bad"':good?' class="ok"':'')+'>'+tpN(cv)+'</b></td>'};
  var who=function(x){return '<td class="tp-pn"><b>'+esc(x.p.name)+'</b>'+(x.p.nickname?' ('+esc(x.p.nickname)+')':'')+'<div class="faint"><i class="xd-dot" style="background:'+xdColor(x.p.dept)+'"></i>'+esc(org('departments',x.p.dept)||'—')+'</div></td>'};
  var lim=function(arr,k){return A[k]?arr:arr.slice(0,10)},more=function(arr,k){return arr.length>10?'<button class="lnk" data-bha="'+k+'">'+(A[k]?'ย่อรายชื่อ':'ดูทั้งหมด '+arr.length+' คน')+'</button>':''};
  h+='<section class="card xd-c"><div class="xd-lh"><h3>พนักงานที่ควรติดตาม</h3><span class="faint">'+worse.length+' คน · เรียงจากเปลี่ยนมากสุด</span></div><div class="faint xd-cs">ตัวเลข = เฉลี่ย 3 เดือนก่อน → เดือนนี้ · ตัวแดง = แย่ลงเกินเกณฑ์ · กดแถวเพื่อดู 6 เดือน</div>'+
   '<div class="tw"><table class="xd-t tp-t"><thead><tr><th class="num">#</th><th>พนักงาน</th><th>ระดับ</th><th>ประเด็น</th><th class="num">ขาด (วัน)</th><th class="num">ลา (วัน)</th><th class="num">สาย (ครั้ง)</th><th class="num">แก้เวลา (วัน)</th></tr></thead><tbody>'+
   (worse.length?lim(worse,'bhAllW').map(function(x,j){return '<tr class="ck" data-tpp="'+esc(x.p.id)+'"><td class="num">'+(j+1)+'</td>'+who(x)+'<td>'+(x.lvl==='h'?'<span class="badge b-bad">สูง</span>':'<span class="badge b-warn">ปานกลาง</span>')+'</td><td class="tp-is">'+x.bad.concat(x.pat).map(esc).join('<br>')+(x.base?'':'<div class="faint">ไม่มีเดือนก่อนให้เทียบ</div>')+'</td>'+cell(x,'abs')+cell(x,'lv')+cell(x,'late')+cell(x,'adj')+'</tr>'}).join('')
    :'<tr><td colspan="8" class="rp-empty">ไม่มีพนักงานที่พฤติกรรมเปลี่ยนเกินเกณฑ์</td></tr>')+'</tbody></table></div>'+more(worse,'bhAllW')+'</section>';
  h+='<section class="card xd-c"><div class="xd-lh"><h3>พนักงานที่ดีขึ้น</h3><span class="faint">'+better.length+' คน</span></div><div class="faint xd-cs">ดีขึ้นจากค่าเฉลี่ย 3 เดือนก่อนของตัวเอง และไม่มีด้านที่แย่ลง</div>'+
   '<div class="tw"><table class="xd-t tp-t"><thead><tr><th class="num">#</th><th>พนักงาน</th><th>สิ่งที่ดีขึ้น</th><th class="num">ขาด (วัน)</th><th class="num">ลา (วัน)</th><th class="num">สาย (ครั้ง)</th><th class="num">แก้เวลา (วัน)</th></tr></thead><tbody>'+
   (better.length?lim(better,'bhAllG').map(function(x,j){return '<tr class="ck" data-tpp="'+esc(x.p.id)+'"><td class="num">'+(j+1)+'</td>'+who(x)+'<td class="tp-is">'+x.good.map(esc).join('<br>')+'</td>'+cell(x,'abs')+cell(x,'lv')+cell(x,'late')+cell(x,'adj')+'</tr>'}).join('')
    :'<tr><td colspan="7" class="rp-empty">ยังไม่มี</td></tr>')+'</tbody></table></div>'+more(better,'bhAllG')+'</section>';
  h+='<div class="faint" style="font-size:12.5px">เกณฑ์: ขาด/ลา/แก้ไขเวลา เปลี่ยน ≥ 2 วัน · มาสาย ≥ 3 ครั้ง · อัตรามาทำงาน ≥ 10 จุด (เดือนที่ต้องมา ≥ 5 วัน) · เวลาเข้างานเฉลี่ย ≥ 15 นาที · ระดับสูง = หลายประเด็นหรือเปลี่ยนมาก · ใช้ประกอบการพูดคุยกับพนักงาน ไม่ใช่ข้อสรุป</div>';
  $('#tp-body').innerHTML=h;tpBindCommon(drawBh);
  $$('[data-bha]').forEach(function(b){b.onclick=function(){A[b.dataset.bha]=!A[b.dataset.bha];drawBh()}})}

function tpPerson(id){var d=A.tp,p=d&&d.people.filter(function(x){return x.id===id})[0];if(!p)return;var r=bhOf(p,d);
  var hm=function(m){m=Math.round(m);return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)};
  var tb='<div class="tw"><table class="xd-t tp-dt"><thead><tr><th>เดือน</th><th class="num">มา/ต้องมา</th><th class="num">ขาด</th><th class="num">ลา</th><th class="num">สาย</th><th class="num">แก้เวลา</th><th class="num">นอกพื้นที่</th><th class="num">เข้าเฉลี่ย</th></tr></thead><tbody>'+
   d.months.map(function(m){var x=tpMo(p,m),on=m===d.ym;return '<tr'+(on?' class="xd-tot"':'')+'><td>'+xdYmTxt(m)+'</td><td class="num">'+(x.exp?x.pres+'/'+x.exp:'—')+'</td><td class="num">'+(x.abs?'<b style="color:var(--bad)">'+x.abs+'</b>':0)+'</td><td class="num">'+tpN(x.lv)+'</td><td class="num">'+x.late+'</td><td class="num">'+x.adj+'</td><td class="num">'+x.off+'</td><td class="num">'+(x.pres&&x.inSum?hm(x.inSum/x.pres):'—')+'</td></tr>'}).join('')+'</tbody></table></div>';
  var lt=d.leave_month.filter(function(z){return z[0]===id}),lts={};lt.forEach(function(z){lts[z[1]]=(lts[z[1]]||0)+z[2]});
  var ch=r?r.bad.map(function(t){return '<span class="badge b-bad">'+esc(t)+'</span>'}).concat(r.pat.map(function(t){return '<span class="badge b-warn">'+esc(t)+'</span>'}),r.good.map(function(t){return '<span class="badge b-ok">'+esc(t)+'</span>'})).join(''):'';
  drawer(p.name+(p.nickname?' ('+p.nickname+')':''),'<div class="faint" style="margin-bottom:10px">'+esc(p.code)+' · '+esc(org('departments',p.dept)||'—')+'</div>'+
   '<h4 style="margin:0 0 6px">'+xdYmTxt(d.ym)+' เทียบเฉลี่ย 3 เดือนก่อน</h4><div class="bh-cs" style="margin-bottom:14px">'+(ch||'<span class="faint">ไม่เปลี่ยนเกินเกณฑ์'+(r&&!r.base?' · ไม่มีข้อมูลเดือนก่อน':'')+'</span>')+'</div>'+
   (Object.keys(lts).length?'<div style="margin-bottom:14px"><b>การลาที่อนุมัติเดือนนี้:</b> '+Object.keys(lts).map(function(t){return esc(t)+' '+tpN(lts[t])+' วัน'}).join(' · ')+'</div>':'')+
   '<h4 style="margin:0 0 6px">6 เดือนล่าสุด</h4>'+tb+'<div class="faint" style="font-size:12px;margin-top:8px">หน่วย: วัน (สาย/แก้เวลา/นอกพื้นที่ = จำนวนวัน) · สาย = เกิน 15 นาที</div>',
   '<button class="btn" data-go2="rmx">ดู Matrix ลงเวลา</button>');
  var g=$('[data-go2="rmx"]');if(g)g.onclick=function(){closeD();A.attTab='mx';go('att')}}
