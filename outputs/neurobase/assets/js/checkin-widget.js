/* ============================================================================
   NeuroBase · 首页打卡本（便签本日历 + 签到 + 鼓励弹窗）
   · 数据与「学习社区」共用 localStorage 键 nb-checkin（days: ['YYYY-MM-DD', ...]）；
     社区页加载了 community.js 时直接复用 NB.community.checkin，两处口径一致。
   · 日历按月翻页：▲ 上一页 / ▼ 下一页，切换时整页上下翻动。
   · 签到成功后弹出「签到成功」+ 随机一句鼓励（中 / 英各 18 句，见 i18n checkin.enc1-18）。
   依赖：core.js（NB.t / NB.esc / NB.storageOK / NB.motionOn / NB.announce）
   ============================================================================ */
(function () {
  'use strict';
  var NB = window.NB;
  if (!NB) return;
  var t = NB.t;

  var root = document.getElementById('nb-checkin');
  if (!root) return;

  var page = document.getElementById('ck-page');
  var statEl = document.getElementById('ck-stat');
  var noteEl = document.getElementById('ck-note');
  var signBtn = document.getElementById('ck-sign');
  var todayBtn = document.getElementById('ck-today');
  if (!page || !statEl || !noteEl || !signBtn) return;

  var KEY = 'nb-checkin';
  var LIMIT = 400;
  var ENC_COUNT = 18;
  var storeOK = typeof NB.storageOK === 'function' ? NB.storageOK() : true;

  /* ---------------- 日期工具（与 community.js 同规则） ---------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function stampOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return stampOf(new Date()); }
  function parse(stamp) { return new Date(stamp + 'T00:00:00'); }
  function shift(stamp, n) { var d = parse(stamp); d.setDate(d.getDate() + n); return stampOf(d); }
  function isStamp(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v); }
  function monthKey(y, m) { return y + '-' + pad(m + 1); }

  /* ---------------- 本机存储（与社区共用同一个键） ---------------- */
  function readState() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) return { days: [], updatedAt: '' };
    try {
      var o = JSON.parse(raw);
      var days = o && Array.isArray(o.days) ? o.days : (Array.isArray(o) ? o : []);
      return { days: days.filter(isStamp), updatedAt: (o && o.updatedAt) || '' };
    } catch (e) { return { days: [], updatedAt: '' }; }
  }
  function writeState(list) {
    var st = { days: list.slice().sort().reverse().slice(0, LIMIT), updatedAt: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 隐私模式：忽略 */ }
    return st;
  }
  function communityApi() {
    var c = NB.community && NB.community.checkin;
    return (c && typeof c.state === 'function' && typeof c.run === 'function') ? c : null;
  }
  function days() {
    var api = communityApi();
    if (api) {
      try { var st = api.state(); return st && Array.isArray(st.days) ? st.days.filter(isStamp) : []; } catch (e) { /* 回退本机 */ }
    }
    return readState().days;
  }

  /* 连续天数：今天已打卡从今天倒数；否则从昨天倒数（当天还没打卡不算断签） */
  function streakOf(list) {
    var set = {}, day = today(), n = 0;
    for (var i = 0; i < list.length; i++) set[list[i]] = 1;
    if (!set[day]) day = shift(day, -1);
    while (set[day]) { n++; day = shift(day, -1); }
    return n;
  }

  function cloudSync(day) {
    try {
      var c = NB.cloud;
      if (!c || typeof c.enabled !== 'function' || !c.enabled()) return;
      if (typeof c.isAuthed !== 'function' || !c.isAuthed()) return;
      if (typeof c.upsert !== 'function') return;
      var u = typeof c.user === 'function' ? c.user() : null;
      c.upsert('community_checkins', [{ user_id: u ? u.id : null, day: day }], 'user_id,day');
    } catch (e) { /* 离线 / 未配置：忽略 */ }
  }

  function signToday() {
    var api = communityApi();
    if (api) { try { return api.run(); } catch (e) { /* 回退本机实现 */ } }
    var list = readState().days;
    var day = today();
    if (list.indexOf(day) >= 0) {
      return { ok: false, code: 'already', streak: streakOf(list), total: list.length };
    }
    var st = writeState(list.concat([day]));
    cloudSync(day);
    return { ok: true, streak: streakOf(st.days), total: st.days.length };
  }

  /* ---------------- 视图状态 ---------------- */
  var now = new Date();
  var viewY = now.getFullYear();
  var viewM = now.getMonth();
  var selected = today();
  var lastEnc = 0;
  var flipToken = 0;
  var modal = null;
  var lastFocus = null;

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function mondayIndex(d) { return (d.getDay() + 6) % 7; }

  function noteText(set) {
    var day = today();
    var p = { m: Number(selected.slice(5, 7)), d: Number(selected.slice(8, 10)) };
    if (!storeOK) return t('checkin.noStore');
    if (selected > day) return t('checkin.noteFuture', p);
    if (selected === day) return set[selected] ? t('checkin.noteTodayDone') : t('checkin.noteToday');
    return set[selected] ? t('checkin.noteDone', p) : t('checkin.noteMiss', p);
  }

  function render() {
    var list = days();
    var set = {};
    for (var i = 0; i < list.length; i++) set[list[i]] = 1;

    var day = today();
    var prefix = monthKey(viewY, viewM);
    var monthCount = 0;
    for (var k = 0; k < list.length; k++) if (list[k].slice(0, 7) === prefix) monthCount++;

    var cells = [];
    var lead = mondayIndex(new Date(viewY, viewM, 1));
    var total = daysInMonth(viewY, viewM);
    for (var b = 0; b < lead; b++) cells.push('<td class="ck-blank"></td>');
    for (var d = 1; d <= total; d++) {
      var stamp = prefix + '-' + pad(d);
      var cls = ['ck-day'];
      if (set[stamp]) cls.push('is-done');
      if (stamp === day) cls.push('is-today');
      if (stamp === selected) cls.push('is-sel');
      var aria = t('checkin.dayAria', { m: Number(prefix.slice(5, 7)), d: d }) +
        (set[stamp] ? t('checkin.checked') : '');
      cells.push(
        '<td><button type="button" class="' + cls.join(' ') + '" data-day="' + stamp + '"' +
        ' aria-pressed="' + (stamp === selected ? 'true' : 'false') + '"' +
        ' aria-label="' + NB.esc(aria) + '">' + d + '</button></td>'
      );
    }
    while (cells.length % 7 !== 0) cells.push('<td class="ck-blank"></td>');
    /* 固定补满 6 行（42 格）：任意月份高度一致，翻月时蓝色面板不伸缩 */
    while (cells.length < 42) cells.push('<td class="ck-blank"></td>');

    var rows = [];
    for (var r = 0; r < cells.length; r += 7) rows.push('<tr>' + cells.slice(r, r + 7).join('') + '</tr>');
    var heads = t('checkin.weekdays').split(',');
    var thead = heads.map(function (w) { return '<th scope="col">' + NB.esc(w) + '</th>'; }).join('');

    page.innerHTML =
      '<table class="ck-cal">' +
        '<caption class="ck-month">' + NB.esc(t('checkin.month', { y: viewY, m: viewM + 1 })) + '</caption>' +
        '<thead><tr>' + thead + '</tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody>' +
      '</table>';

    statEl.textContent = t('checkin.stat', { s: streakOf(list), m: monthCount, t: list.length });
    noteEl.textContent = noteText(set);

    var done = !!set[day];
    signBtn.disabled = done || !storeOK;
    signBtn.textContent = done ? t('checkin.done') : t('checkin.sign');

    var n = new Date();
    if (todayBtn) todayBtn.hidden = (viewY === n.getFullYear() && viewM === n.getMonth());
  }

  /* ---------------- 上下翻页 ---------------- */
  function flip(dir) {
    var motion = typeof NB.motionOn === 'function' ? NB.motionOn() : true;
    if (!motion) { render(); return; }
    var my = ++flipToken;
    var outCls = dir > 0 ? 'ck-out-down' : 'ck-out-up';
    var inCls = dir > 0 ? 'ck-in-down' : 'ck-in-up';
    page.classList.remove('ck-out-up', 'ck-out-down', 'ck-in-up', 'ck-in-down');
    void page.offsetWidth; /* 强制重排，让同一个动画类可以重复触发 */
    page.classList.add(outCls);
    setTimeout(function () {
      if (my !== flipToken) return;
      render();
      page.classList.remove(outCls);
      page.classList.add(inCls);
      setTimeout(function () {
        if (my !== flipToken) return;
        page.classList.remove(inCls);
      }, 240);
    }, 150);
  }

  function moveMonth(delta) {
    var m = viewM + delta, y = viewY;
    if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
    viewY = y;
    viewM = m;
    var n = new Date();
    selected = (viewY === n.getFullYear() && viewM === n.getMonth()) ? today() : monthKey(viewY, viewM) + '-01';
    flip(delta);
  }

  /* ---------------- 鼓励弹窗 ---------------- */
  function pickEnc() {
    var i = Math.floor(Math.random() * ENC_COUNT) + 1;
    if (i === lastEnc) i = (i % ENC_COUNT) + 1;
    lastEnc = i;
    return i;
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'ck-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="ck-mask" data-act="close"></div>' +
      '<div class="ck-dialog" role="dialog" aria-modal="true" aria-labelledby="ck-modal-title">' +
        '<div class="ck-seal" aria-hidden="true">✓</div>' +
        '<h3 class="ck-modal-title" id="ck-modal-title"></h3>' +
        '<p class="ck-modal-day" id="ck-modal-day"></p>' +
        '<p class="ck-modal-enc" id="ck-modal-enc"></p>' +
        '<button type="button" class="ck-modal-btn" data-act="close"></button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      var hit = e.target && e.target.closest ? e.target.closest('[data-act="close"]') : null;
      if (hit) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!modal || modal.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        var btn = modal.querySelector('.ck-modal-btn');
        if (btn) btn.focus();
      }
    });
    return modal;
  }

  function openModal(result) {
    var m = ensureModal();
    var n = new Date();
    var idx = pickEnc();
    m.querySelector('#ck-modal-title').textContent = t('checkin.ok');
    m.querySelector('#ck-modal-day').textContent = t('checkin.modalSub', {
      m: n.getMonth() + 1, d: n.getDate(), s: (result && result.streak) || 0
    });
    m.querySelector('#ck-modal-enc').textContent = t('checkin.enc' + idx);
    m.querySelector('.ck-modal-btn').textContent = t('checkin.close');
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add('ck-lock');
    var btn = m.querySelector('.ck-modal-btn');
    if (btn) { try { btn.focus(); } catch (e) { /* 忽略 */ } }
    NB.announce(t('checkin.ok'));
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('ck-lock');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (e) { /* 忽略 */ }
    }
  }

  /* ---------------- 事件 ---------------- */
  page.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-day]') : null;
    if (!btn) return;
    selected = btn.getAttribute('data-day');
    render();
    NB.announce(noteEl.textContent);
  });

  var prev = document.getElementById('ck-prev');
  var next = document.getElementById('ck-next');
  if (prev) prev.addEventListener('click', function () { moveMonth(-1); });
  if (next) next.addEventListener('click', function () { moveMonth(1); });
  if (todayBtn) {
    todayBtn.addEventListener('click', function () {
      var n = new Date();
      var back = viewY !== n.getFullYear() || viewM !== n.getMonth();
      viewY = n.getFullYear();
      viewM = n.getMonth();
      selected = today();
      if (back) flip(1); else render();
    });
  }

  signBtn.addEventListener('click', function () {
    if (!storeOK || signBtn.disabled) return;
    var r = signToday();
    if (!r || !r.ok) {
      render();
      NB.announce(t('checkin.already'));
      return;
    }
    /* 签到后回到今天所在月份，确保新打上的那格可见 */
    var n = new Date();
    viewY = n.getFullYear();
    viewM = n.getMonth();
    selected = today();
    render();
    openModal(r);
  });

  /* 其它标签页写入 / 页面切回时刷新（首页打卡本永远是打卡的唯一入口） */
  window.addEventListener('focus', function () { render(); });

  render();

  /* 自测 / 其它页面复用接口 */
  NB.checkinWidget = {
    render: render,
    today: today,
    days: days,
    streak: function () { return streakOf(days()); },
    signedToday: function () { return days().indexOf(today()) >= 0; }
  };
})();
