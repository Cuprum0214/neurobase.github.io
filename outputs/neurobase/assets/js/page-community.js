/* 学习社区（论坛 / 贴吧样式）
 * 列表 ↔ 帖子详情（同页 hash 路由 #p=<id>）、发帖、楼层回复、点赞、收藏、举报、
 * 管理员口令门 / 删除 / 隐藏 / 置顶 / 精华 / 锁定 / 禁言。
 * 数据层：forum.js（window.NB.forum）。本文件只负责渲染与交互。
 */
(function () {
  'use strict';

  var NB = window.NB;
  if (!NB || !NB.forum) return;
  var t = NB.t;
  var esc = NB.esc;
  var F = NB.forum;
  var MODULES = window.NB_MODULES || [];

  NB.mountShell('community');

  function $(id) { return document.getElementById(id); }
  function T(key, fb) { var v = t(key); return (v === key && fb) ? fb : v; }
  function isEn() { return NB.locale() === 'en'; }

  var state = {
    order: 'new',
    scope: 'all',
    module: '',
    query: '',
    page: 1,
    thread: '',
    replyTo: '',
    confirm: {},
    report: null,
    ban: null,
    reportedChipAdded: false
  };

  function moduleName(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return isEn() ? MODULES[i].name_en : MODULES[i].name_zh;
    return '';
  }
  function fillModules(sel, withAll) {
    if (!sel) return;
    var html = withAll ? '<option value="">' + esc(T('forum.boardAll', '全部板块')) + '</option>' : '';
    for (var i = 0; i < MODULES.length; i++) {
      html += '<option value="' + esc(MODULES[i].id) + '">' +
        esc((isEn() ? MODULES[i].name_en : MODULES[i].name_zh)) + '</option>';
    }
    sel.innerHTML = html;
    if (sel.id === 'fm-board') sel.value = state.module || '';
  }

  /* ---------------- 时间 / 文本 ---------------- */
  function timeText(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var diff = Date.now() - d.getTime();
    if (diff < 60000) return T('forum.justNow', '刚刚');
    if (diff < 3600000) return Math.floor(diff / 60000) + T('forum.minutesAgo', ' 分钟前');
    if (diff < 86400000) return Math.floor(diff / 3600000) + T('forum.hoursAgo', ' 小时前');
    if (diff < 172800000) return T('forum.yesterday', '昨天');
    var now = new Date();
    if (d.getFullYear() === now.getFullYear()) return (d.getMonth() + 1) + '月' + d.getDate() + '日';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function excerpt(s, n) {
    var one = String(s || '').replace(/\s+/g, ' ').trim();
    return one.length > n ? one.slice(0, n) + '…' : one;
  }
  function initials(name) {
    var s = String(name || '?').trim();
    return s ? s.slice(0, 1).toUpperCase() : '?';
  }
  function avatarColor(seed) {
    var s = String(seed || '');
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return 'hsl(' + h + ',46%,42%)';
  }
  function avatar(name, id) {
    return '<span class="fm-avatar" aria-hidden="true" style="background:' + avatarColor(id || name) + '">' +
      esc(initials(name)) + '</span>';
  }
  function authorOf(obj) {
    return obj.author || T('forum.anonymous', '匿名学习者');
  }
  function isMine(obj) { return obj.authorId && obj.authorId === F.authorId(); }
  function badge(text, kind) {
    return '<span class="fm-badge fm-badge-' + (kind || 'plain') + '">' + esc(text) + '</span>';
  }
  function badgesFor(post) {
    var out = '';
    if (post.pinned) out += badge(T('forum.badgePinned', '置顶'), 'pin');
    if (post.featured) out += badge(T('forum.badgeFeatured', '精华'), 'good');
    if (post.locked) out += badge(T('forum.badgeLocked', '已锁定'), 'lock');
    if (post.hidden) out += badge(T('forum.badgeHidden', '已隐藏'), 'warn');
    var m = F.meta(post);
    if (m.reports > 0 && (F.admin.on() || isMine(post))) out += badge(T('forum.badgeReported', '已被举报'), 'warn');
    return out;
  }
  function icon(name) {
    var map = {
      like: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 22V10l5-8 1.2.8c.6.4.9 1.1.8 1.8L13 9h5.5a2 2 0 0 1 2 2.4l-1.6 7.6A3 3 0 0 1 16 22H7zM4 10h2v12H4z"/></svg>',
      fav: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>',
      reply: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v11H9l-5 5z"/></svg>',
      report: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22zM11 9h2v6h-2zm0 8h2v2h-2z"/></svg>'
    };
    return map[name] || '';
  }
  function statChip(kind, count, on) {
    var label = kind === 'reply' ? T('forum.statReplies', '回复')
      : kind === 'like' ? T('forum.like', '点赞') : T('forum.fav', '收藏');
    return '<span class="fm-stat' + (on ? ' is-on' : '') + '" title="' + esc(label + ' ' + count) + '" aria-label="' + esc(label + ' ' + count) + '">' +
      icon(kind) + '<b>' + count + '</b></span>';
  }

  /* ---------------- 列表 ---------------- */
  function listOptions() {
    return {
      order: state.order,
      scope: state.scope === 'reported' ? 'all' : state.scope,
      reported: state.scope === 'reported',
      module: state.module,
      query: state.query,
      page: state.page
    };
  }

  function rowHtml(post) {
    var m = F.meta(post);
    var mine = isMine(post);
    var admin = F.admin.on();
    var mod = moduleName(post.module);
    var actions = '';
    if (admin) {
      actions = '<div class="fm-row-actions">' +
        '<button type="button" class="btn btn-ghost btn-xs" data-act="pin" data-id="' + esc(post.id) + '" aria-pressed="' + (post.pinned ? 'true' : 'false') + '">' +
          esc(post.pinned ? T('forum.unpin', '取消置顶') : T('forum.pin', '置顶')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-xs" data-act="hide" data-id="' + esc(post.id) + '">' +
          esc(post.hidden ? T('forum.unhide', '恢复') : T('forum.hide', '隐藏')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-xs fm-danger" data-act="del" data-id="' + esc(post.id) + '">' +
          esc(state.confirm['p:' + post.id] ? T('forum.deleteConfirm', '确认删除？再点一次') : T('forum.delete', '删除')) + '</button>' +
      '</div>';
    }
    return '<li class="fm-row' + (post.hidden ? ' is-hidden' : '') + (post.pinned ? ' is-pinned' : '') + '" data-id="' + esc(post.id) + '">' +
      '<div class="fm-row-body" tabindex="0" role="button" data-open="' + esc(post.id) + '" aria-label="' + esc(post.title) + '">' +
        avatar(authorOf(post), post.authorId || post.id) +
        '<div class="fm-row-main">' +
          '<div class="fm-row-title">' +
            '<span class="fm-title">' + esc(post.title) + '</span>' +
            (badgesFor(post) ? '<span class="fm-row-badges">' + badgesFor(post) + '</span>' : '') +
          '</div>' +
          '<p class="fm-row-excerpt">' + esc(excerpt(post.body, 90)) + '</p>' +
          '<p class="fm-row-meta">' + esc(authorOf(post)) +
            (mine ? ' · ' + esc(T('forum.mine', '我')) : '') +
            (mod ? ' · ' + esc(mod) : '') +
            ' · ' + esc(timeText(post.createdAt)) +
          '</p>' +
          actions +
        '</div>' +
        '<div class="fm-row-stats">' +
          statChip('reply', m.replies) + statChip('like', m.likes) + statChip('fav', m.favs) +
        '</div>' +
      '</div>' +
    '</li>';
  }

  function renderList() {
    var res = F.list(listOptions());
    var list = res.items;
    $('fm-list').innerHTML = list.map(rowHtml).join('');
    $('fm-list').hidden = list.length === 0;
    var more = $('fm-more');
    more.hidden = !res.hasMore;
    $('fm-count').textContent = T('forum.count', '共 {n} 个主题').replace('{n}', res.total);
    var empty = $('fm-empty');
    empty.hidden = list.length !== 0;
    var cta = $('fm-empty-cta');
    if (cta) cta.hidden = list.length !== 0 || !!state.query;
    var head = $('fm-listhead');
    if (head) head.classList.toggle('is-empty', list.length === 0);
    empty.textContent = state.query
      ? T('forum.emptySearch', '没有匹配的帖子，换个关键词试试。')
      : state.scope === 'mine' ? T('forum.emptyMine', '你还没有发过帖子，来提第一个问题吧。')
      : state.scope === 'favs' ? T('forum.emptyFavs', '还没有收藏；在帖子详情点「收藏」即可保存。')
      : state.scope === 'featured' ? T('forum.emptyFeatured', '还没有精华帖。')
      : state.scope === 'reported' ? T('forum.emptyReported', '当前没有待处理举报。')
      : T('forum.empty', '还没有主题 —— 发第一帖吧。');
    renderKpis();
    renderScopes();
  }

  function renderKpis() {
    var s = F.stats();
    $('fm-kpi-posts').textContent = s.posts;
    $('fm-kpi-replies').textContent = s.replies;
    $('fm-kpi-members').textContent = s.members;
  }

  function renderScopes() {
    var admin = F.admin.on();
    if (admin && !state.reportedChipAdded) {
      var box = $('fm-scopes');
      if (box && !box.querySelector('[data-scope="reported"]')) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.setAttribute('data-scope', 'reported');
        b.setAttribute('aria-pressed', 'false');
        b.textContent = T('forum.scopeReported', '待审举报');
        box.appendChild(b);
        state.reportedChipAdded = true;
      }
    }
    var chips = $('fm-scopes') ? $('fm-scopes').querySelectorAll('[data-scope]') : [];
    Array.prototype.forEach.call(chips, function (c) {
      var on = c.getAttribute('data-scope') === state.scope;
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (c.getAttribute('data-scope') === 'reported') {
        var n = F.reports().length;
        c.textContent = T('forum.scopeReported', '待审举报') + (n ? ' ' + n : '');
        c.hidden = !admin;
      }
    });
    var orders = $('fm-orders') ? $('fm-orders').querySelectorAll('[data-order]') : [];
    Array.prototype.forEach.call(orders, function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-order') === state.order ? 'true' : 'false');
    });
  }

  /* ---------------- 详情 ---------------- */
  function openThread(id) {
    var post = F.get(id);
    if (!post) { closeThread(); return; }
    state.thread = post.id;
    if (window.location.hash !== '#p=' + encodeURIComponent(post.id)) {
      try { window.history.replaceState(null, '', '#p=' + encodeURIComponent(post.id)); }
      catch (e) { /* file:// 下个别浏览器限制，忽略 */ }
    }
    $('fm-listview').hidden = true;
    $('fm-thread').hidden = false;
    renderThread();
    try { $('fm-thread').scrollIntoView({ block: 'start', behavior: NB.motionOn && NB.motionOn() ? 'smooth' : 'auto' }); }
    catch (e) { /* 忽略 */ }
  }
  function closeThread() {
    state.thread = '';
    state.replyTo = '';
    $('fm-thread').hidden = true;
    $('fm-listview').hidden = false;
    if (window.location.hash) {
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search); }
      catch (e) { /* 忽略 */ }
    }
    renderList();
    try { $('fm-listview').scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) { /* 忽略 */ }
  }

  function opActions(post) {
    var m = F.meta(post);
    var mine = isMine(post);
    var admin = F.admin.on();
    var likeOn = post.likes.indexOf(F.authorId()) >= 0;
    var favOn = post.favs.indexOf(F.authorId()) >= 0;
    var out = '<div class="fm-op-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm' + (likeOn ? ' is-on' : '') + '" data-act="like" data-id="' + esc(post.id) + '" aria-pressed="' + (likeOn ? 'true' : 'false') + '">' +
        icon('like') + esc(T('forum.like', '点赞')) + ' <b>' + m.likes + '</b></button>' +
      '<button type="button" class="btn btn-ghost btn-sm' + (favOn ? ' is-on' : '') + '" data-act="fav" data-id="' + esc(post.id) + '" aria-pressed="' + (favOn ? 'true' : 'false') + '">' +
        icon('fav') + esc(favOn ? T('forum.faved', '已收藏') : T('forum.fav', '收藏')) + ' <b>' + m.favs + '</b></button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="report" data-id="' + esc(post.id) + '" data-type="post">' +
        icon('report') + esc(T('forum.report', '举报')) + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="copy" data-id="' + esc(post.id) + '">' +
        esc(T('forum.copyLink', '复制链接')) + '</button>';
    if (mine && !admin) {
      out += '<button type="button" class="btn btn-ghost btn-sm fm-danger" data-act="del" data-id="' + esc(post.id) + '">' +
        esc(state.confirm['p:' + post.id] ? T('forum.deleteConfirm', '确认删除？再点一次') : T('forum.delete', '删除')) + '</button>';
    }
    if (admin) {
      out += '<button type="button" class="btn btn-ghost btn-sm" data-act="pin" data-id="' + esc(post.id) + '" aria-pressed="' + (post.pinned ? 'true' : 'false') + '">' +
          esc(post.pinned ? T('forum.unpin', '取消置顶') : T('forum.pin', '置顶')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="feature" data-id="' + esc(post.id) + '" aria-pressed="' + (post.featured ? 'true' : 'false') + '">' +
          esc(post.featured ? T('forum.unfeature', '取消精华') : T('forum.feature', '设精华')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="lock" data-id="' + esc(post.id) + '">' +
          esc(post.locked ? T('forum.unlock', '解除锁定') : T('forum.lock', '锁定')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="hide" data-id="' + esc(post.id) + '">' +
          esc(post.hidden ? T('forum.unhide', '恢复') : T('forum.hide', '隐藏')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="ban" data-id="' + esc(post.id) + '">' +
          esc(T('forum.ban', '禁言作者')) + '</button>' +
        '<button type="button" class="btn btn-ghost btn-sm fm-danger" data-act="del" data-id="' + esc(post.id) + '">' +
          esc(state.confirm['p:' + post.id] ? T('forum.deleteConfirm', '确认删除？再点一次') : T('forum.delete', '删除')) + '</button>';
    }
    return out + '</div>';
  }

  function floorHtml(post, reply, index) {
    var m = { likes: (reply.likes || []).length };
    var likeOn = (reply.likes || []).indexOf(F.authorId()) >= 0;
    var admin = F.admin.on();
    var mine = reply.authorId && reply.authorId === F.authorId();
    var quoted = '';
    if (reply.replyTo) {
      var target = null;
      post.replies.forEach(function (r) { if (r.id === reply.replyTo) target = r; });
      if (target) quoted = '<p class="fm-quote">' + esc(T('forum.quote', '回复')) + ' @' + esc(authorOf(target)) + '：' + esc(excerpt(target.body, 60)) + '</p>';
    }
    var acts = '<div class="fm-floor-actions">' +
      '<button type="button" class="btn btn-ghost btn-xs' + (likeOn ? ' is-on' : '') + '" data-act="rlike" data-id="' + esc(post.id) + '" data-reply="' + esc(reply.id) + '" aria-pressed="' + (likeOn ? 'true' : 'false') + '">' +
        icon('like') + esc(T('forum.like', '点赞')) + ' ' + m.likes + '</button>' +
      '<button type="button" class="btn btn-ghost btn-xs" data-act="rquote" data-id="' + esc(post.id) + '" data-reply="' + esc(reply.id) + '">' +
        esc(T('forum.quoteBtn', '回复')) + '</button>' +
      '<button type="button" class="btn btn-ghost btn-xs" data-act="rreport" data-id="' + esc(post.id) + '" data-reply="' + esc(reply.id) + '">' +
        esc(T('forum.report', '举报')) + '</button>';
    if (admin || mine) {
      acts += '<button type="button" class="btn btn-ghost btn-xs fm-danger" data-act="rdel" data-id="' + esc(post.id) + '" data-reply="' + esc(reply.id) + '">' +
        esc(state.confirm['r:' + reply.id] ? T('forum.deleteConfirm', '确认删除？再点一次') : T('forum.delete', '删除')) + '</button>';
    }
    if (admin) {
      acts += '<button type="button" class="btn btn-ghost btn-xs" data-act="rhide" data-id="' + esc(post.id) + '" data-reply="' + esc(reply.id) + '">' +
        esc(reply.hidden ? T('forum.unhide', '恢复') : T('forum.hide', '隐藏')) + '</button>';
    }
    return '<li class="fm-floor' + (reply.hidden ? ' is-hidden' : '') + '" id="fm-r-' + esc(reply.id) + '" data-reply="' + esc(reply.id) + '">' +
      '<div class="fm-floor-side"><span class="fm-floor-no">' + (index + 1) + '</span>' + avatar(authorOf(reply), reply.authorId || reply.id) + '</div>' +
      '<div class="fm-floor-main">' +
        '<p class="fm-floor-meta"><b>' + esc(authorOf(reply)) + '</b>' +
          (mine ? ' · ' + esc(T('forum.mine', '我')) : '') +
          ' · ' + esc(timeText(reply.createdAt)) +
          (reply.hidden ? ' ' + badge(T('forum.badgeHidden', '已隐藏'), 'warn') : '') +
        '</p>' +
        quoted +
        '<p class="fm-floor-body">' + esc(reply.body) + '</p>' +
        acts +
      '</div>' +
    '</li>';
  }

  function renderThread() {
    var post = F.get(state.thread);
    if (!post) { closeThread(); return; }
    var m = F.meta(post);
    var mod = moduleName(post.module);
    $('fm-thread-crumb').textContent = (mod ? mod + ' · ' : '') + T('forum.floorCount', '{n} 条回复').replace('{n}', m.replies);
    $('fm-op').innerHTML =
      '<div class="fm-op-head">' +
        avatar(authorOf(post), post.authorId || post.id) +
        '<div class="fm-op-meta">' +
          '<p class="fm-op-author"><b>' + esc(authorOf(post)) + '</b>' +
            (isMine(post) ? ' ' + badge(T('forum.mine', '我'), 'me') : '') + '</p>' +
          '<p class="meta">' + esc(timeText(post.createdAt)) + (mod ? ' · ' + esc(mod) : '') + '</p>' +
        '</div>' +
        '<div class="fm-op-badges">' + badgesFor(post) + '</div>' +
      '</div>' +
      '<h2 class="fm-op-title" id="fm-thread-title">' + esc(post.title) + '</h2>' +
      '<div class="fm-op-body">' + esc(post.body) + '</div>' +
      opActions(post);
    var floors = post.replies.map(function (r, i) { return floorHtml(post, r, i); }).join('');
    $('fm-floors').innerHTML = floors;
    $('fm-floor-empty').hidden = post.replies.length > 0;
    $('fm-floor-count').textContent = T('forum.floorCount', '{n} 条回复').replace('{n}', m.replies);

    var banned = F.isBanned();
    var note = $('fm-reply-note');
    var send = $('fm-reply-send');
    var box = $('fm-reply-body');
    if (post.locked && !F.admin.on()) {
      note.textContent = T('forum.lockedNote', '该帖已被锁定，暂时不能回复。');
      send.disabled = true;
      if (box) box.disabled = true;
    } else if (banned && !F.admin.on()) {
      note.textContent = T('forum.bannedNote', '你已被禁言，暂时不能发言。');
      send.disabled = true;
      if (box) box.disabled = true;
    } else {
      note.textContent = state.replyTo
        ? T('forum.replyingTo', '正在回复 #{n}').replace('{n}', replyNo(post, state.replyTo))
        : '';
      send.disabled = false;
      if (box) box.disabled = false;
    }
    var form = $('fm-reply-form');
    if (form) form.setAttribute('data-reply-to', state.replyTo || '');
    renderKpis();
  }
  function replyNo(post, id) {
    for (var i = 0; i < post.replies.length; i++) if (post.replies[i].id === id) return i + 1;
    return 0;
  }

  /* ---------------- 渲染入口（保留输入） ---------------- */
  var renderTimer = null;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      var active = document.activeElement;
      var keepValue = $('fm-reply-body') ? $('fm-reply-body').value : '';
      var keepFocus = active && active.id === 'fm-reply-body';
      renderList();
      if (state.thread) {
        renderThread();
        var box = $('fm-reply-body');
        if (box && keepValue && box.id === 'fm-reply-body') box.value = keepValue;
        if (box && keepFocus) { try { box.focus(); } catch (e) { /* 忽略 */ } }
      }
      renderAdmin();
      renderIdentity();
    }, 120);
  }

  /* ---------------- 模式 / 身份 ---------------- */
  function renderMode() {
    var st = F.cloud.state();
    var el = $('fm-mode');
    var live = $('fm-live');
    if (!el) return;
    if (st.state === 'ready') {
      var who = F.cloud.authed();
      el.textContent = who ? T('forum.modeLiveAuthed', '多人实时 · 已登录') : T('forum.modeLive', '多人实时');
      el.className = 'pill fm-mode is-live';
      el.title = T('forum.modeLiveTip', '内容来自云端，他人的发言会自动出现。');
      if (live) live.textContent = T('forum.liveNow', '● 实时同步');
    } else {
      var why = st.reason === 'noconfig' ? T('forum.modeNoCloud', '本机模式')
        : T('forum.modeLocal', '本机模式 · 云端未启用');
      el.textContent = why;
      el.className = 'pill pill-slate fm-mode';
      el.title = T('forum.modeLocalTip', '内容保存在当前浏览器；按 docs/DEPLOY.md 启用云端后即为全员实时。');
      if (live) live.textContent = '';
    }
  }
  function renderIdentity() {
    var el = $('fm-identity');
    if (!el) return;
    el.textContent = T('forum.identity', '当前身份：{name}').replace('{name}', F.authorName());
  }
  function renderAdmin() {
    var on = F.admin.on();
    var badge = $('fm-admin-badge');
    var panel = $('fm-admin-panel');
    var open = $('fm-admin-open');
    var gate = $('fm-admin-gate');
    if (badge) badge.hidden = !on;
    if (panel) panel.hidden = !on;
    if (open) open.hidden = on;
    if (gate && on) gate.hidden = true;
    renderBans();
  }
  function renderBans() {
    var list = F.bans();
    var box = $('fm-bans');
    var empty = $('fm-bans-empty');
    if (!box) return;
    box.innerHTML = list.map(function (b) {
      return '<li class="fm-banrow"><span>' + esc(b.name || b.key) + '</span>' +
        '<span class="meta">' + esc(b.until ? T('forum.banUntil', '至 {d}').replace('{d}', b.until.slice(0, 10)) : T('forum.banForever2', '永久')) + '</span>' +
        '<button type="button" class="btn btn-ghost btn-xs" data-act="unban" data-key="' + esc(b.key) + '">' +
        esc(T('forum.unban', '解除')) + '</button></li>';
    }).join('');
    if (empty) empty.hidden = list.length > 0;
  }

  /* ---------------- 发帖 ---------------- */
  function openCompose() {
    if (F.isBanned() && !F.admin.on()) {
      NB.announce(T('forum.bannedNote', '你已被禁言，暂时不能发言。'));
      return;
    }
    $('fm-compose').hidden = false;
    $('fm-compose-err').textContent = '';
    $('fm-title').value = '';
    $('fm-body').value = '';
    $('fm-name').value = '';
    if ($('fm-module')) $('fm-module').value = state.module || '';
    setTimeout(function () { try { $('fm-title').focus(); } catch (e) { /* 忽略 */ } }, 30);
  }
  function closeCompose() { $('fm-compose').hidden = true; }

  function submitCompose(e) {
    e.preventDefault();
    var title = $('fm-title').value;
    var body = $('fm-body').value;
    var module_ = $('fm-module') ? $('fm-module').value : '';
    var name = $('fm-name') ? $('fm-name').value : '';
    var r = F.add({ title: title, body: body, module: module_, name: name });
    if (!r.ok) {
      var map = {
        title: T('forum.errTitle', '请填写标题（1–80 字）。'),
        body: T('forum.errBody', '请填写正文。'),
        fast: T('forum.errFast', '发帖太快了，休息一下再发。'),
        banned: T('forum.bannedNote', '你已被禁言，暂时不能发言。')
      };
      $('fm-compose-err').textContent = map[r.code] || T('forum.errGeneric', '发布失败，请稍后重试。');
      return;
    }
    closeCompose();
    state.scope = 'all';
    state.order = 'new';
    state.page = 1;
    renderList();
    renderIdentity();
    openThread(r.post.id);
    NB.announce(T('forum.postOk', '已发布'));
  }

  /* ---------------- 举报 ---------------- */
  function openReport(target) {
    state.report = target;
    $('fm-report-what').textContent = target.type === 'reply'
      ? T('forum.reportReply', '目标：楼层回复') : T('forum.reportPost', '目标：主题帖');
    $('fm-report-note').value = '';
    $('fm-report-reason').value = 'spam';
    $('fm-report').hidden = false;
    try { $('fm-report-reason').focus(); } catch (e) { /* 忽略 */ }
  }
  function closeReport() { $('fm-report').hidden = true; state.report = null; }
  function submitReport() {
    if (!state.report) { closeReport(); return; }
    var r = F.report(state.report.type, state.report.id, $('fm-report-reason').value, $('fm-report-note').value);
    closeReport();
    if (r.ok) {
      renderList();
      if (state.thread) renderThread();
      NB.announce(T('forum.reportOk', '已提交举报，管理员会尽快处理。'));
    }
  }

  /* ---------------- 禁言 ---------------- */
  function openBan(userId, name) {
    if (!userId) {
      NB.announce(T('forum.banNoUser', '该内容没有可识别的作者身份，无法禁言。'));
      return;
    }
    state.ban = { id: userId, name: name };
    $('fm-ban-who').textContent = T('forum.banWho', '对象：{name}').replace('{name}', name || userId);
    $('fm-ban-reason').value = '';
    $('fm-ban').hidden = false;
    try { $('fm-ban-days').focus(); } catch (e) { /* 忽略 */ }
  }
  function closeBan() { $('fm-ban').hidden = true; state.ban = null; }
  function submitBan(e) {
    e.preventDefault();
    if (!state.ban) { closeBan(); return; }
    var days = Number($('fm-ban-days').value);
    var r = F.ban(state.ban.id, state.ban.name, days, $('fm-ban-reason').value);
    closeBan();
    if (r.ok) {
      renderBans();
      renderThread();
      NB.announce(T('forum.banOk', '已禁言'));
    }
  }

  /* ---------------- 事件 ---------------- */
  function onListClick(e) {
    var actBtn = e.target.closest ? e.target.closest('[data-act]') : null;
    if (actBtn && actBtn.getAttribute('data-id')) {
      e.preventDefault();
      e.stopPropagation();
      handleAction(actBtn.getAttribute('data-act'), actBtn);
      return;
    }
    var openEl = e.target.closest ? e.target.closest('[data-open]') : null;
    if (openEl) {
      openThread(openEl.getAttribute('data-open'));
    }
  }
  function onListKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var openEl = e.target.closest ? e.target.closest('[data-open]') : null;
    if (!openEl) return;
    e.preventDefault();
    openThread(openEl.getAttribute('data-open'));
  }

  function handleAction(act, el) {
    var id = el.getAttribute('data-id');
    var replyId = el.getAttribute('data-reply');
    var r;
    if (act === 'like') {
      r = F.like(id);
      if (r.ok) { renderList(); if (state.thread) renderThread(); }
    } else if (act === 'fav') {
      r = F.fav(id);
      if (r.ok) { renderList(); if (state.thread) renderThread(); NB.announce(r.on ? T('forum.favOk', '已收藏') : T('forum.favOff', '已取消收藏')); }
    } else if (act === 'report') {
      openReport({ type: 'post', id: id });
    } else if (act === 'rreport') {
      openReport({ type: 'reply', id: replyId });
    } else if (act === 'rlike') {
      r = F.likeReply(id, replyId);
      if (r.ok) renderThread();
    } else if (act === 'rquote') {
      state.replyTo = replyId;
      renderThread();
      try { $('fm-reply-body').focus(); } catch (e) { /* 忽略 */ }
    } else if (act === 'copy') {
      var link = window.location.href.split('#')[0] + '#p=' + encodeURIComponent(id);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link);
      } catch (e) { /* 忽略 */ }
      NB.announce(T('forum.copyOk', '链接：{u}').replace('{u}', link));
    } else if (act === 'del') {
      var key = 'p:' + id;
      if (!state.confirm[key]) { state.confirm[key] = true; renderList(); if (state.thread) renderThread(); return; }
      delete state.confirm[key];
      r = F.remove(id);
      if (r.ok) {
        NB.announce(T('forum.deleteOk', '已删除'));
        if (state.thread === id) closeThread(); else renderList();
      } else {
        NB.announce(T('forum.forbidden', '没有权限执行该操作。'));
      }
    } else if (act === 'rdel') {
      var rkey = 'r:' + replyId;
      if (!state.confirm[rkey]) { state.confirm[rkey] = true; renderThread(); return; }
      delete state.confirm[rkey];
      r = F.removeReply(id, replyId);
      if (r.ok) { renderThread(); NB.announce(T('forum.deleteOk', '已删除')); }
      else NB.announce(T('forum.forbidden', '没有权限执行该操作。'));
    } else if (act === 'pin') {
      var post = F.get(id);
      r = F.pin(id, !(post && post.pinned));
      if (r.ok) { renderList(); if (state.thread) renderThread(); }
    } else if (act === 'feature') {
      var p2 = F.get(id);
      r = F.feature(id, !(p2 && p2.featured));
      if (r.ok) { renderList(); if (state.thread) renderThread(); }
    } else if (act === 'lock') {
      var p3 = F.get(id);
      r = F.lock(id, !(p3 && p3.locked));
      if (r.ok) { renderThread(); NB.announce(T('forum.lockOk', '已更新')); }
    } else if (act === 'hide') {
      var p4 = F.get(id);
      r = F.hide(id, !(p4 && p4.hidden));
      if (r.ok) { renderList(); if (state.thread) renderThread(); }
    } else if (act === 'rhide') {
      var post5 = F.get(id);
      var rp = null;
      if (post5) post5.replies.forEach(function (x) { if (x.id === replyId) rp = x; });
      r = F.hideReply(id, replyId, !(rp && rp.hidden));
      if (r.ok) renderThread();
    } else if (act === 'ban') {
      var post6 = F.get(id);
      if (post6) openBan(post6.authorId, authorOf(post6));
    } else if (act === 'unban') {
      F.unban(el.getAttribute('data-key'));
      renderBans();
    }
  }

  $('fm-list').addEventListener('click', onListClick);
  $('fm-list').addEventListener('keydown', onListKey);
  $('fm-thread').addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!btn) return;
    e.preventDefault();
    handleAction(btn.getAttribute('data-act'), btn);
  });

  $('fm-orders').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-order]') : null;
    if (!b) return;
    state.order = b.getAttribute('data-order');
    state.page = 1;
    renderList();
  });
  $('fm-scopes').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-scope]') : null;
    if (!b) return;
    state.scope = b.getAttribute('data-scope');
    state.page = 1;
    renderList();
  });
  $('fm-board').addEventListener('change', function () {
    state.module = this.value;
    state.page = 1;
    renderList();
  });
  var searchTimer = null;
  $('fm-search').addEventListener('input', function () {
    var v = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = v;
      state.page = 1;
      renderList();
    }, 180);
  });
  $('fm-more').addEventListener('click', function () { state.page += 1; renderList(); });
  $('fm-empty-new').addEventListener('click', openCompose);
  $('fm-back').addEventListener('click', function () { closeThread(); });
  $('fm-new').addEventListener('click', openCompose);

  $('fm-compose').addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) closeCompose();
  });
  $('fm-compose-form').addEventListener('submit', submitCompose);
  $('fm-report').addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) closeReport();
  });
  $('fm-report-send').addEventListener('click', submitReport);
  $('fm-ban').addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) closeBan();
  });
  $('fm-ban-form').addEventListener('submit', submitBan);

  $('fm-reply-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var body = $('fm-reply-body').value;
    if (!String(body || '').trim()) {
      NB.announce(T('forum.replyEmpty', '回复内容不能为空。'));
      try { $('fm-reply-body').focus(); } catch (err) { /* 忽略 */ }
      return;
    }
    var r = F.reply(state.thread, body, state.replyTo);
    if (!r.ok) {
      var map = {
        banned: T('forum.bannedNote', '你已被禁言，暂时不能发言。'),
        locked: T('forum.lockedNote', '该帖已被锁定，暂时不能回复。'),
        body: T('forum.replyEmpty', '回复内容不能为空。'),
        missing: T('forum.missing', '帖子不存在或已被删除。')
      };
      NB.announce(map[r.code] || T('forum.errGeneric', '操作失败，请稍后重试。'));
      return;
    }
    state.replyTo = '';
    $('fm-reply-body').value = '';
    renderThread();
    renderList();
    NB.announce(T('forum.replyOk', '回复成功'));
    var last = $('fm-floors');
    if (last && last.lastElementChild) {
      try { last.lastElementChild.scrollIntoView({ block: 'center' }); } catch (err) { /* 忽略 */ }
    }
  });

  $('fm-admin-open').addEventListener('click', function () {
    var gate = $('fm-admin-gate');
    gate.hidden = false;
    $('fm-admin-err').textContent = '';
    $('fm-admin-pass').value = '';
    try { $('fm-admin-pass').focus(); } catch (e) { /* 忽略 */ }
  });
  $('fm-admin-cancel').addEventListener('click', function () {
    $('fm-admin-gate').hidden = true;
  });
  $('fm-admin-gate').addEventListener('submit', function (e) {
    e.preventDefault();
    var r = F.admin.unlock($('fm-admin-pass').value);
    if (!r.ok) {
      $('fm-admin-err').textContent = T('admin.gateErr', '口令错误，请重试');
      $('fm-admin-pass').value = '';
      return;
    }
    $('fm-admin-gate').hidden = true;
    $('fm-admin-err').textContent = '';
    renderAdmin();
    renderList();
    if (state.thread) renderThread();
    NB.announce(T('forum.adminOk', '管理模式已开启'));
  });
  $('fm-admin-panel').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act="unban"]') : null;
    if (!b) return;
    F.unban(b.getAttribute('data-key'));
    renderBans();
    NB.announce(T('forum.unbanOk', '已解除禁言'));
  });
  $('fm-admin-lock').addEventListener('click', function () {    F.admin.lock();
    state.confirm = {};
    renderAdmin();
    renderList();
    if (state.thread) renderThread();
    NB.announce(T('forum.adminOff', '已退出管理'));
  });

  $('fm-rename').addEventListener('click', function () {
    var btn = $('fm-rename');
    if (btn.nextElementSibling && btn.nextElementSibling.classList.contains('fm-rename-form')) return;
    var form = document.createElement('form');
    form.className = 'fm-rename-form';
    form.innerHTML = '<label class="sr-only" for="fm-rename-input">' + esc(T('forum.nickname', '昵称')) + '</label>' +
      '<input class="input" id="fm-rename-input" type="text" maxlength="16" value="' + esc(F.authorName()) + '">' +
      '<button type="submit" class="btn btn-primary btn-sm">' + esc(T('forum.save', '保存')) + '</button>';
    btn.parentNode.insertBefore(form, btn.nextSibling);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = form.querySelector('input').value;
      var C = window.NB && window.NB.cloud;
      var authed = !!(C && C.account && typeof C.account.setName === 'function' && C.status() === 'authed');
      function finish(ok, msg) {
        if (!ok) {
          NB.announce(msg || T('forum.nameFail', '修改失败，请稍后重试'));
          return;
        }
        renderIdentity();
        if (form.parentNode) form.parentNode.removeChild(form);
        NB.announce(T('forum.nameOk', '昵称已更新'));
      }
      if (authed) {
        /* 登录后账号名优先：社区改昵称走账号设置，唯一性由服务端校验 */
        C.account.setName(v).then(function (r) {
          if (r && r.ok) return finish(true);
          if (r && r.code === 'name_taken') return finish(false, T('forum.nameTaken', '该账号名已被使用'));
          if (r && r.code === 'network') return finish(false, T('forum.nameOffline', '修改账号名需要联网'));
          finish(false, (r && r.message) || '');
        }, function () { finish(false, ''); });
        return;
      }
      if (F.setAuthorName(v) || !String(v || '').trim()) finish(true);
    });
    try { form.querySelector('input').focus(); } catch (err) { /* 忽略 */ }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('fm-report').hidden) closeReport();
    else if (!$('fm-ban').hidden) closeBan();
    else if (!$('fm-compose').hidden) closeCompose();
  });

  window.addEventListener('hashchange', function () {
    var m = /^#p=(.+)$/.exec(window.location.hash || '');
    if (m) openThread(decodeURIComponent(m[1]));
    else if (state.thread) closeThread();
  });

  /* ---------------- 启动 ---------------- */
  fillModules($('fm-module'), false);
  fillModules($('fm-board'), true);
  renderList();
  renderMode();
  renderAdmin();
  renderIdentity();

  var hash = /^#p=(.+)$/.exec(window.location.hash || '');
  if (hash) openThread(decodeURIComponent(hash[1]));

  F.subscribe(function (evt) {
    if (evt && evt.type === 'cloud') renderMode();
    if (evt && evt.type === 'identity') renderIdentity();
    if (evt && evt.type === 'admin') { renderAdmin(); renderList(); if (state.thread) renderThread(); }
    scheduleRender();
  });

  /* 登录 / 退出后署名规则变化（账号名优先），即时刷新身份行 */
  if (window.NB && NB.cloud && typeof NB.cloud.on === 'function') {
    NB.cloud.on(function (evt) {
      if (evt && evt.type === 'session') renderIdentity();
    });
  }

  /* 云端探测是异步的，稍后再刷新一次模式徽标 */
  setTimeout(renderMode, 1200);
  setTimeout(function () { renderMode(); if (F.cloud.state().state === 'ready') F.cloud.pull(); }, 2600);
})();
