/* Community · หน้าตาที่ใช้ร่วมกัน (หลังบ้าน admin-community.js + แอปพนักงาน liff-community.js) · 1 พ.ย. 2569
 * ผู้ใช้ขอ: หน้าตาแบบ Facebook · ไอคอนเส้นแบบมืออาชีพ (ไม่ใช้อีโมจิในส่วนควบคุม) · ผลิตเป็นสตริง HTML ล้วน การกดจัดการในไฟล์ของแต่ละหน้า
 * ข้อความผู้ใช้ผ่าน CB.esc เสมอ · ลิงก์ http(s) กดได้ · ไม่รับ HTML */
(function () {
  'use strict';
  var CB = {};
  /* ไอคอนเส้น (ชุดเดียวกับ Lucide · stroke 2 · viewBox 24) */
  var P = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    image: '<path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/>',
    tag: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    pinoff: '<path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    move: '<path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><path d="M2 13h10"/><path d="m9 16 3-3-3-3"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    like: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    comment: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    check: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    reply: '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
    eyeoff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>'
  };
  CB.ic = function (k, cls) { return '<svg class="cbi' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || '') + '</svg>'; };
  CB.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var E = CB.esc;
  CB.text = function (s) { return E(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/(^|\s)(@[^\s@<]{1,30})/g, '$1<b class="cbmen">$2</b>').replace(/\n/g, '<br>'); };
  var MS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  CB.ago = function (t) { var s = (Date.now() - t) / 1000, d = new Date(t), y = d.getFullYear() !== new Date().getFullYear();
    if (s < 60) return 'เมื่อสักครู่'; if (s < 3600) return Math.floor(s / 60) + ' นาที'; if (s < 86400) return Math.floor(s / 3600) + ' ชม.'; if (s < 172800) return 'เมื่อวาน';
    if (s < 7 * 86400) return Math.floor(s / 86400) + ' วัน'; return d.getDate() + ' ' + MS[d.getMonth()] + (y ? ' ' + String(d.getFullYear() + 543).slice(-2) : ''); };
  CB.date = function (t) { var d = new Date(t); return d.getDate() + ' ' + MS[d.getMonth()] + ' ' + (d.getFullYear() + 543); };
  CB.who = function (p) { return p && (p.nick || String(p.name || '').split(' ')[0]) || 'ไม่ทราบชื่อ'; };
  CB.full = function (p) { return p ? (p.name || '') + (p.nick ? ' (' + p.nick + ')' : '') : ''; };
  CB.cat = function (cats, id) { for (var i = 0; i < (cats || []).length; i++) if (cats[i].id === id) return cats[i]; return { id: id, name: 'ทั่วไป', color: '#5F5F5F' }; };
  CB.chip = function (cats, id) { var c = CB.cat(cats, id); return '<span class="cbchip" style="--c:' + E(c.color || '#5F5F5F') + '">' + E(c.name) + '</span>'; };
  /* รูปโปรไฟล์: ตัวอักษรแรก + รูปในระบบ (p.ph → /photo/:id) หรือรูป LINE (p.pic) ทับเมื่อโหลดได้ */
  CB.av = function (base, p, s) { var id = p && p.id;
    return '<span class="cbav" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s / 2.5) + 'px">' + E(CB.who(p).slice(0, 1)) +
      (p && p.ph && id ? '<img src="' + base + '/photo/' + encodeURIComponent(id) + '" alt="" loading="lazy" onerror="this.remove()">' : p && /^https:\/\//.test(p.pic || '') ? '<img src="' + E(p.pic) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '</span>'; };
  CB.img = function (base, id) { return base + '/cb/img/' + encodeURIComponent(id); };
  CB.imgs = function (base, ids, link) { if (!ids || !ids.length) return '';
    return '<div class="cbimgs n' + Math.min(ids.length, 4) + '">' + ids.slice(0, 4).map(function (i) { var u = CB.img(base, i);
      return link ? '<a href="' + u + '" target="_blank" rel="noopener"><img src="' + u + '" alt="รูปแนบ" loading="lazy"></a>' : '<img src="' + u + '" alt="รูปแนบ" loading="lazy">'; }).join('') + '</div>'; };
  /* เมนู ⋯ ของโพสต์ (เฉพาะที่คนนี้ทำได้) · me = {id, mod, admin, ro} */
  CB.menuItems = function (p, me) { var it = [], own = p.author && p.author.id === me.id && !me.ro, mod = me.mod && !me.ro;
    if (mod) it.push(p.pinned ? { k: 'unpin', ic: 'pinoff', t: 'เลิกปักหมุดโพสต์' } : { k: 'pin', ic: 'pin', t: 'ปักหมุดโพสต์', d: 'แสดงบนสุดของ Community จนถึงวันที่เลือก' });
    if (own) it.push({ k: 'edit', ic: 'pencil', t: 'แก้ไขโพสต์', d: 'ทุกคนจะเห็นว่า "แก้ไขแล้ว"' });
    if (mod) it.push(p.locked ? { k: 'unlock', ic: 'unlock', t: 'เปิดให้แสดงความคิดเห็น' } : { k: 'lock', ic: 'lock', t: 'ปิดการแสดงความคิดเห็น', d: 'ผู้ดูแลยังตอบได้' });
    if (mod) it.push({ k: 'move', ic: 'move', t: 'ย้ายหมวด' });
    if (me.admin && !me.ro) it.push({ sep: 1 }, { k: 'delete', ic: 'trash', t: 'ลบโพสต์', d: 'ซ่อนจากทุกคน · ข้อมูลยังเก็บไว้ใน Audit Log', bad: 1 });
    return it; };
  CB.menu = function (p, me) { var it = CB.menuItems(p, me); if (!it.length) return '';
    return '<div class="cbmenu" role="menu">' + it.map(function (x) { return x.sep ? '<hr>' : '<button role="menuitem" data-cbmi="' + x.k + '|' + E(p.id) + '"' + (x.bad ? ' class="bad"' : '') + '>' + CB.ic(x.ic) + '<span><b>' + x.t + '</b>' + (x.d ? '<small>' + x.d + '</small>' : '') + '</span></button>'; }).join('') + '</div>'; };
  /* การ์ดโพสต์ (ฟีด + หน้าโพสต์) · o = {base, cats, me, full, menuOpen} */
  CB.card = function (p, o) { var me = o.me || {}, base = o.base, hasMenu = CB.menuItems(p, me).length, long = !o.full && (p.body.length > 320 || p.body.split('\n').length > 5);
    return '<article class="cbcard' + (p.pinned ? ' pinned' : '') + '" data-cbid="' + E(p.id) + '">' +
      (p.pinned ? '<div class="cbpinbar">' + CB.ic('pin') + 'ปักหมุด' + (p.pin_until ? ' · ถึง ' + CB.date(p.pin_until) : '') + '</div>' : '') +
      '<header class="cbhd">' + CB.av(base, p.author, 40) + '<div class="cbwho"><b>' + E(CB.full(p.author)) + '</b><span>' + (p.author && p.author.pos ? E(p.author.pos) + ' · ' : '') + CB.ago(p.created_at) + (p.edited ? ' · แก้ไขแล้ว' : '') + ' · ' + CB.chip(o.cats, p.cat) + '</span></div>' +
      (p.unread && !o.full ? '<i class="cbdot" title="มีความเคลื่อนไหวใหม่"></i>' : '') +
      (hasMenu ? '<div class="cbmw"><button class="cbmore" data-cbmenu="' + E(p.id) + '" aria-label="ตัวเลือกโพสต์" aria-expanded="' + !!o.menuOpen + '">' + CB.ic('more') + '</button>' + (o.menuOpen ? CB.menu(p, me) : '') + '</div>' : '') + '</header>' +
      (p.solved || p.locked ? '<div class="cbflags">' + (p.solved ? '<span class="ok">' + CB.ic('check') + 'มีคำตอบแล้ว</span>' : '') + (p.locked ? '<span>' + CB.ic('lock') + 'ปิดการแสดงความคิดเห็น</span>' : '') + '</div>' : '') +
      '<div class="cbtxt' + (long ? ' clamp' : '') + '">' + CB.text(p.body) + '</div>' + (long ? '<button class="cbseemore" data-cbopen="' + E(p.id) + '">ดูเพิ่มเติม</button>' : '') +
      (o.full ? CB.imgs(base, p.imgs, 1) : (p.imgs && p.imgs.length ? '<div data-cbopen="' + E(p.id) + '" class="cbimgl">' + CB.imgs(base, p.imgs) + '</div>' : '')) +
      '<div class="cbstat">' + (p.likes ? '<span class="cblk">' + CB.ic('like') + '</span>' + p.likes : '') + '<span class="sp"></span>' + (p.replies ? '<button data-cbopen="' + E(p.id) + '">' + p.replies + ' ความคิดเห็น</button>' : '') + '</div>' +
      '<div class="cbacts"><button data-cblike="' + E(p.id) + '" class="' + (p.liked ? 'on' : '') + '" aria-pressed="' + !!p.liked + '"' + (me.ro ? ' disabled' : '') + '>' + CB.ic('like') + 'ถูกใจ</button>' +
      '<button data-cbcomment="' + E(p.id) + '">' + CB.ic('comment') + 'แสดงความคิดเห็น</button></div></article>'; };
  /* ความคิดเห็น · d = ผลจาก cbGet · o = {base, me} */
  CB.comment = function (c, d, o) { if (c.deleted) return '<div class="cbcm del"><span class="cbdelx">' + CB.ic('eyeoff') + 'ความคิดเห็นนี้ถูก admin ลบ</span></div>';
    var best = d.post.solved_id === c.id;
    return '<div class="cbcm' + (best ? ' best' : '') + '" id="cbc-' + E(c.id) + '">' + CB.av(o.base, c.author, c.parent ? 28 : 34) + '<div class="cbcb">' + (best ? '<span class="cbbest">' + CB.ic('check') + 'คำตอบที่เจ้าของโพสต์เลือก</span>' : '') +
      '<div class="cbbub"><b>' + E(CB.full(c.author)) + '</b>' + (c.author && c.author.pos ? '<small>' + E(c.author.pos) + '</small>' : '') + '<div>' + CB.text(c.body) + '</div></div>' + CB.imgs(o.base, c.imgs, 1) +
      '<div class="cbca"><span>' + CB.ago(c.created_at) + (c.edited ? ' · แก้ไขแล้ว' : '') + '</span>' + (d.can.comment ? '<button data-cbrep="' + E(c.id) + '">ตอบกลับ</button>' : '') +
      (c.mine ? '<button data-cbedc="' + E(c.id) + '">แก้ไข</button>' : '') + (d.can.solve && !c.parent ? '<button data-cbsol="' + (best ? '' : E(c.id)) + '">' + (best ? 'ยกเลิกคำตอบ' : 'เลือกเป็นคำตอบ') + '</button>' : '') +
      (d.can.del ? '<button class="bad" data-cbdelc="' + E(c.id) + '">ลบ</button>' : '') + '</div></div></div>'; };
  CB.thread = function (d, o) { var tops = d.comments.filter(function (c) { return !c.parent; }), kids = {};
    d.comments.forEach(function (c) { if (c.parent) (kids[c.parent] = kids[c.parent] || []).push(c); });
    return tops.length ? tops.map(function (c) { return CB.comment(c, d, o) + ((kids[c.id] || []).length ? '<div class="cbkids">' + kids[c.id].map(function (k) { return CB.comment(k, d, o); }).join('') + '</div>' : ''); }).join('') : '<div class="cbnone">ยังไม่มีความคิดเห็น · เป็นคนแรกที่แสดงความคิดเห็น</div>'; };
  /* ช่องแสดงความคิดเห็น (แบบ Facebook) · o = {base, me(ผู้ใช้: id,name,nick), reply: ชื่อคนที่ตอบ} */
  CB.commentBox = function (o) {
    return '<div class="cbcbox">' + (o.reply ? '<div class="cbrepto">' + CB.ic('reply') + 'กำลังตอบ <b>' + E(o.reply) + '</b><button data-cbrepx aria-label="ยกเลิกการตอบ">' + CB.ic('x') + '</button></div>' : '') +
      '<div class="cbups" id="cbups"></div><div class="cbcrow">' + CB.av(o.base, o.me, 34) + '<div class="cbpill"><textarea id="cbct" rows="1" maxlength="2000" placeholder="' + (o.reply ? 'ตอบกลับ ' + E(o.reply) + '…' : 'แสดงความคิดเห็นในชื่อ ' + E(CB.who(o.me))) + '"></textarea>' +
      '<span class="cbpi"><button data-cbemo="cbct" aria-label="อีโมจิ" title="อีโมจิ">' + CB.ic('smile') + '</button><label aria-label="แนบรูป" title="แนบรูป">' + CB.ic('camera') + '<input type="file" accept="image/*" multiple data-cbfile class="cbvh"></label></span></div>' +
      '<button class="cbsend" data-cbsend aria-label="ส่ง" disabled>' + CB.ic('send') + '</button></div></div>'; };
  /* หน้าต่างสร้างโพสต์ (แบบ Facebook) · o = {base, me, cats(ที่โพสต์ได้), cat, mod, text, pinDef, pinMin} */
  CB.composer = function (o) { var me = o.me || {};
    return '<div class="cbx-who">' + CB.av(o.base, me, 44) + '<div><b>' + E(me.name || 'ผู้ดูแลระบบ') + '</b><div class="cbx-pills"><span class="cbx-pill">' + CB.ic('users') + 'ทุกคนในบริษัท</span>' +
      '<label class="cbx-pill cbx-sel">' + CB.ic('folder') + '<select id="cbx-cat" aria-label="หมวด">' + o.cats.map(function (c) { return '<option value="' + E(c.id) + '"' + (c.id === o.cat ? ' selected' : '') + '>' + E(c.name) + '</option>'; }).join('') + '</select>' + CB.ic('down') + '</label></div></div></div>' +
      '<textarea id="cbx-txt" class="cbx-txt" maxlength="5000" placeholder="คุณคิดอะไรอยู่ ' + E(CB.who(me)) + '">' + E(o.text || '') + '</textarea><div class="cbups" id="cbups"></div><div id="cbx-pop"></div>' +
      '<div class="cbx-add"><b>เพิ่มลงในโพสต์ของคุณ</b><label class="cbx-ic cbg" title="รูปภาพ (สูงสุด 4)" aria-label="รูปภาพ">' + CB.ic('image') + '<input type="file" accept="image/*" multiple data-cbfile class="cbvh"></label>' +
      '<button class="cbx-ic cbbl" data-cbtag title="แท็กเพื่อนร่วมงาน" aria-label="แท็กเพื่อนร่วมงาน">' + CB.ic('tag') + '</button><button class="cbx-ic cbor" data-cbemo="cbx-txt" title="อีโมจิ" aria-label="อีโมจิ">' + CB.ic('smile') + '</button></div>' +
      (o.mod ? '<label class="cbx-mod"><input type="checkbox" id="cbx-pin">' + CB.ic('pin') + '<span>ปักหมุดถึง</span><input type="date" id="cbx-pind" value="' + o.pinDef + '" min="' + o.pinMin + '"><small>เฉพาะผู้ดูแล</small></label>' : '') +
      '<button class="cbx-go" id="cbx-go"' + (o.text ? '' : ' disabled') + '>โพสต์</button>'; };
  /* แผงอีโมจิ (ใส่ลงในข้อความ) + แผงค้นชื่อสำหรับแท็ก */
  CB.EMO = ['😀', '😂', '😊', '😍', '🥰', '😅', '🤔', '😮', '😢', '😡', '👍', '👏', '🙏', '💪', '👌', '🎉', '❤️', '🔥', '✅', '⚠️', '📌', '📷', '☕', '🍚'];
  CB.emojiPanel = function (target) { return '<div class="cbpop cbemo" role="dialog" aria-label="อีโมจิ">' + CB.EMO.map(function (e) { return '<button data-cbemi="' + target + '|' + e + '">' + e + '</button>'; }).join('') + '</div>'; };
  CB.tagPanel = function (list, q) { return '<div class="cbpop cbtag" role="dialog" aria-label="แท็กเพื่อนร่วมงาน"><div class="cbtagq">' + CB.ic('search') + '<input id="cbtag-q" placeholder="พิมพ์ชื่อหรือชื่อเล่น" value="' + E(q || '') + '" autocomplete="off"></div>' +
    (list ? (list.length ? list.map(function (p) { return '<button data-cbtagp="' + E(p.nick || String(p.name).split(' ')[0]) + '"><b>' + E(p.nick || p.name) + '</b><small>' + E(p.name) + '</small></button>'; }).join('') : '<div class="cbnone">ไม่พบชื่อ</div>') : '<div class="cbnone">พิมพ์อย่างน้อย 1 ตัวอักษร</div>') + '</div>'; };
  CB.insert = function (ta, s) { if (!ta) return; var a = ta.selectionStart == null ? ta.value.length : ta.selectionStart, b = ta.selectionEnd == null ? a : ta.selectionEnd;
    ta.value = ta.value.slice(0, a) + s + ta.value.slice(b); ta.selectionStart = ta.selectionEnd = a + s.length; ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true })); };
  /* ย่อรูป ≤ 1280px เป็น JPEG · พื้นขาว (PNG โปร่งใสไม่กลายเป็นดำ) · ≤ ~390,000 ตัวอักษร */
  CB.shrink = function (file) { return new Promise(function (ok, no) { var u = URL.createObjectURL(file), img = new Image();
    img.onload = function () { var k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      var q = .82, d = c.toDataURL('image/jpeg', q); while (d.length > 390000 && q > .4) { q -= .1; d = c.toDataURL('image/jpeg', q); } ok(d); };
    img.onerror = function () { URL.revokeObjectURL(u); no(new Error('เปิดรูปไม่ได้')); }; img.src = u; }); };
  CB.upsHTML = function (ups) { return ups.map(function (u, i) { return '<span class="cbup' + (u.id ? '' : ' ld') + '">' + (u.src ? '<img src="' + u.src + '" alt="">' : '') + '<button data-cbrm="' + i + '" aria-label="เอารูปออก">' + CB.ic('x') + '</button></span>'; }).join(''); };
  window.CB = CB;
})();
