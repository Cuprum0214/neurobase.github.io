/* page-admin.js — 反馈管理页（admin.html）
 *
 * 两种模式（自动选择，页面无需改结构）：
 *   1. 本地模式（cloud-status = off）
 *      读取 localStorage nb-feedback，口令门解锁后管理；适用于纯离线使用。
 *   2. 云端模式（cloud-config.js 已配置）
 *      用 Supabase Auth 管理员邮箱登录，经 RPC admin_list_feedback /
 *      admin_reply_feedback 读写。身份与权限完全由数据库 RLS + admins 白名单校验，
 *      **前端不含任何可越权的密钥**（尤其没有 service_role）。
 *
 * 云端模式下如果账号不在 public.admins 白名单，RPC 返回 not_admin，页面给出明确提示。
 * 本地口令门在云端模式自动停用；公网部署请务必配置 Supabase（见 docs/DEPLOY.md）。
 */
(function () {
  'use strict';
  var NB = window.NB || {};
  var t = NB.t || function (k) { return k; };
  var esc = NB.esc || function (s) { return String(s == null ? '' : s); };

  /* 口令校验统一走 core.js 的 NB.adminCheck（源码只保存加盐摘要，不含明文） */
  function adminCheck(val) {
    return typeof NB.adminCheck === 'function' ? NB.adminCheck(val) === true : false;
  }
  var UNLOCK_KEY = 'nb-admin-unlocked';
  var TYPE_KEYS = { err: 'fb.typeErr', use: 'fb.typeUse', idea: 'fb.typeIdea', other: 'fb.typeOther' };
  var DEV_KEYS = { pc: 'fb.devPc', tablet: 'fb.devTablet', phone: 'fb.devPhone' };
  var TYPE_IDS = ['err', 'use', 'idea', 'other'];

  var TXT = {
    zh: {
      cloudOff: '云端未配置：当前为本地口令模式。',
      cloudAnon: '云端模式：请用管理员邮箱登录后管理反馈。',
      cloudSignIn: '登录管理员账号',
      cloudWho: '管理员',
      cloudRefresh: '刷新列表',
      cloudLoading: '正在从云端加载…',
      cloudNotAdmin: '当前账号没有管理员权限：邮箱需先加入 public.admins 白名单。',
      cloudFail: '加载失败：',
      cloudOk: '已保存到云端',
      cloudNoReply: '回复内容不能为空',
      total: '共 {n} 条',
      unread: '未读 {n} 条'
    },
    en: {
      cloudOff: 'Cloud not configured: using local passcode mode.',
      cloudAnon: 'Cloud mode: sign in with an admin email to manage feedback.',
      cloudSignIn: 'Sign in as admin',
      cloudWho: 'Admin',
      cloudRefresh: 'Refresh',
      cloudLoading: 'Loading from cloud…',
      cloudNotAdmin: 'This account is not an admin. Add its email to public.admins first.',
      cloudFail: 'Load failed: ',
      cloudOk: 'Saved to cloud',
      cloudNoReply: 'Reply cannot be empty',
      total: '{n} total',
      unread: '{n} unread'
    }
  };
  function lang() { try { return (NB.locale && NB.locale() === 'en') ? 'en' : 'zh'; } catch (e) { return 'zh'; } }
  function T(key, params) {
    var table = TXT[lang()] || TXT.zh;
    var out = table[key] != null ? table[key] : key;
    if (params) for (var k in params) out = out.split('{' + k + '}').join(String(params[k]));
    return out;
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function load() { return NB.feedback ? NB.feedback.load() : []; }
  function save(list) { if (NB.feedback) NB.feedback.save(list); }
  function cloud() { return (window.NB && window.NB.cloud) || null; }
  function cloudMode() {
    var C = cloud();
    return !!(C && C.status && C.status() !== 'off');
  }

  function isUnlocked() {
    try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
  }
  function setUnlocked() {
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e) { /* 忽略 */ }
  }
  function showGate(show) {
    var gate = qs('#nb-admin-gate');
    var app = qs('#nb-admin-app');
    if (gate) gate.hidden = !show;
    if (app) app.hidden = show;
  }

  function typeLabel(type) { return t(TYPE_KEYS[type] || 'fb.typeOther'); }
  function deviceLabel(dev) { return t(DEV_KEYS[dev] || 'fb.devPc'); }
  function fmtTime(iso) {
    if (NB.feedback) return NB.feedback.fmtTime(iso);
    var d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso || '') : d.toISOString();
  }

  /* ---------------- 统计 ---------------- */
  function setStats(total, unread) {
    var tEl = qs('#nb-admin-total');
    if (tEl) tEl.textContent = t('admin.total', { n: total });
    var uEl = qs('#nb-admin-unread');
    if (uEl) uEl.textContent = t('admin.unread', { n: unread });
  }

  /* ---------------- 列表渲染（本地与云端共用） ---------------- */
  function renderRows(list, isCloud) {
    var root = qs('#nb-admin-list');
    if (!root) return;
    if (!list.length) {
      root.innerHTML = '<p class="admin-empty">' + esc(t('admin.empty')) + '</p>';
      return;
    }
    root.innerHTML = list.map(function (it) {
      var replied = (it.replies && it.replies.length) > 0 || it.status === 'replied' || it.status === 'closed';
      var unreadBadge = it.read ? ''
        : '<span class="fb-badge fb-badge-new">' + esc(t('fb.unreadBadge')) + '</span>';
      var repliesHtml = (it.replies || []).map(function (r) {
        return '<div class="fb-reply">' +
          '<div class="fb-reply-head"><span class="fb-reply-tag">' + esc(t('admin.replyAt')) + '</span>' +
          '<span class="fb-reply-at">' + esc(fmtTime(r.at)) + '</span></div>' +
          '<p class="fb-reply-body">' + esc(r.body) + '</p>' +
        '</div>';
      }).join('');
      return '<article class="admin-item card" data-id="' + esc(it.id) + '"' +
          ' data-read="' + (it.read ? '1' : '0') + '"' +
          (isCloud ? ' data-cloud="1"' : '') + '>' +
        '<div class="admin-item-head">' +
          '<span class="fb-item-type">' + esc(typeLabel(it.type)) + '</span>' +
          (it.other ? '<span class="fb-item-other">' + esc(it.other) + '</span>' : '') +
          (it.code ? '<span class="fb-item-code">' + esc(it.code) + '</span>' : '') +
          '<span class="fb-item-at">' + esc(fmtTime(it.at)) + '</span>' +
          unreadBadge +
          '<span class="fb-badge ' + (replied ? 'fb-badge-ok' : 'fb-badge-wait') + '">' +
            esc(replied ? t('fb.replied') : t('fb.pending')) + '</span>' +
        '</div>' +
        '<p class="fb-item-body">' + esc(it.body) + '</p>' +
        '<div class="admin-item-meta">' +
          '<span>' + esc(t('fb.device')) + '：' + esc(deviceLabel(it.device)) + '</span>' +
          '<span>' + esc(t('admin.from', { page: it.page || '—' })) + '</span>' +
        '</div>' +
        repliesHtml +
        '<div class="admin-reply-form">' +
          '<textarea class="fb-input fb-area fb-reply-area" maxlength="1000" placeholder="' + esc(t('admin.replyPh')) + '"></textarea>' +
          '<div class="admin-reply-actions">' +
            '<button type="button" class="btn btn-primary fb-reply-send">' + esc(t('admin.replySend')) + '</button>' +
            '<button type="button" class="btn fb-toggle-read">' +
              (it.read ? esc(t('admin.markUnread')) : esc(t('admin.markRead'))) + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function render() {
    var list = load();
    var unread = list.filter(function (x) { return !x.read; }).length;
    setStats(list.length, unread);
    renderRows(list, false);
  }

  /* ---------------- 本地写操作 ---------------- */
  function replyTo(id, body) {
    var list = load();
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { hit = list[i]; break; }
    }
    if (!hit) return;
    if (!hit.replies) hit.replies = [];
    hit.replies.push({ at: NB.feedback.nowIso(), body: body });
    hit.read = true;
    save(list);
  }

  function toggleRead(id) {
    var list = load();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { list[i].read = !list[i].read; break; }
    }
    save(list);
  }

  /* ---------------- 云端模式 ---------------- */
  var KNOWN_TYPES = {
    err: 'err', use: 'use', idea: 'idea', other: 'other',
    '内容错误': 'err', '使用问题': 'use', '改进建议': 'idea', '其他': 'other',
    'Content error': 'err', 'Usage issue': 'use', 'Suggestion': 'idea', 'Other': 'other'
  };

  function mapCloudRow(r) {
    return {
      id: r.id,
      type: KNOWN_TYPES[r.type] || 'other',
      other: r.type_other || '',
      at: r.created_at,
      read: r.status !== 'new',
      status: r.status,
      code: r.code,
      body: r.body,
      device: r.device,
      page: r.page,
      replies: r.reply ? [{ at: r.replied_at || r.updated_at || r.created_at, body: r.reply }] : []
    };
  }

  function ensureCloudBar() {
    var app = qs('#nb-admin-app');
    if (!app) return null;
    var bar = qs('#nb-admin-cloudbar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'nb-admin-cloudbar';
    bar.className = 'admin-cloudbar';
    app.insertBefore(bar, app.firstChild);
    return bar;
  }

  function updateCloudBar() {
    var bar = ensureCloudBar();
    if (!bar) return;
    var C = cloud();
    var st = C ? C.status() : 'off';
    if (st === 'off') {
      bar.innerHTML = '<span class="admin-cloud-txt">' + esc(T('cloudOff')) + '</span>';
      return;
    }
    if (st === 'anon') {
      bar.innerHTML = '<span class="admin-cloud-txt">' + esc(T('cloudAnon')) + '</span>' +
        '<button type="button" class="btn btn-primary btn-sm" id="nb-admin-cloud-signin">' + esc(T('cloudSignIn')) + '</button>';
      var b = qs('#nb-admin-cloud-signin');
      if (b) b.addEventListener('click', function () {
        if (NB.authUI && NB.authUI.open) NB.authUI.open();
        else if (C) C.signIn('', ''); /* 理论上不会走到；仅兜底提示 */
      });
      return;
    }
    var who = C.user() ? (C.user().email || C.user().id) : '';
    bar.innerHTML = '<span class="admin-cloud-txt">' + esc(T('cloudWho')) + '：' + esc(who) + '</span>' +
      '<button type="button" class="btn btn-sm" id="nb-admin-cloud-refresh">' + esc(T('cloudRefresh')) + '</button>';
    var r = qs('#nb-admin-cloud-refresh');
    if (r) r.addEventListener('click', renderCloud);
  }

  function renderCloud() {
    var root = qs('#nb-admin-list');
    if (!root) return;
    var C = cloud();
    if (!C || C.status() === 'off') {
      root.innerHTML = '<p class="admin-empty">' + esc(T('cloudOff')) + '</p>';
      return;
    }
    if (C.status() !== 'authed') {
      setStats(0, 0);
      root.innerHTML = '<p class="admin-empty">' + esc(T('cloudAnon')) + '</p>';
      return;
    }
    root.innerHTML = '<p class="admin-empty">' + esc(T('cloudLoading')) + '</p>';
    C.rpc('admin_list_feedback', { p_status: null, p_limit: 100, p_offset: 0 }).then(function (res) {
      if (!res || !res.ok) {
        var msg = String((res && res.message) || (res && res.code) || '');
        root.innerHTML = '<p class="admin-empty">' +
          esc(/not_admin/.test(msg) ? T('cloudNotAdmin') : (T('cloudFail') + msg)) + '</p>';
        return;
      }
      var rows = Array.isArray(res.data) ? res.data : [];
      var list = rows.map(mapCloudRow);
      setStats(list.length, list.filter(function (x) { return !x.read; }).length);
      renderRows(list, true);
    });
  }

  /* ---------------- 事件 ---------------- */
  function bind() {
    var root = qs('#nb-admin-list');
    if (root) root.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('.admin-item') : null;
      if (!item) return;
      var id = item.getAttribute('data-id');
      var isCloud = item.getAttribute('data-cloud') === '1';
      var C = cloud();

      var send = e.target.closest('.fb-reply-send');
      if (send) {
        var area = qs('.fb-reply-area', item);
        var body = area ? area.value.trim() : '';
        if (!body) return;
        if (isCloud && C) {
          send.disabled = true;
          C.rpc('admin_reply_feedback', { p_id: id, p_reply: body, p_status: 'replied' }).then(function (res) {
            send.disabled = false;
            if (res && res.ok) renderCloud();
            else if (area) area.setAttribute('placeholder', T('cloudFail') + ((res && res.message) || ''));
          });
        } else {
          replyTo(id, body);
          render();
        }
        return;
      }

      var toggle = e.target.closest('.fb-toggle-read');
      if (toggle) {
        if (isCloud && C) {
          C.rpc('admin_reply_feedback', {
            p_id: id,
            p_reply: null,
            p_status: item.getAttribute('data-read') === '1' ? 'new' : 'read'
          }).then(function (res) {
            if (res && res.ok) renderCloud();
          });
        } else {
          toggleRead(id);
          render();
        }
      }
    });

    var readall = qs('#nb-admin-readall');
    if (readall) readall.addEventListener('click', function () {
      if (cloudMode()) {
        var C = cloud();
        var items = Array.prototype.slice.call(document.querySelectorAll('.admin-item[data-cloud="1"]'));
        if (!C || C.status() !== 'authed') return;
        Promise.all(items.map(function (it) {
          return C.rpc('admin_reply_feedback', {
            p_id: it.getAttribute('data-id'), p_reply: null, p_status: 'read'
          });
        })).then(renderCloud);
        return;
      }
      var list = load();
      for (var i = 0; i < list.length; i++) list[i].read = true;
      save(list);
      render();
    });
  }

  /* ---------------- 本地口令门 ---------------- */
  function unlock() {
    var input = qs('#nb-admin-pass');
    var err = qs('#nb-admin-gerr');
    var val = input ? input.value.trim() : '';
    if (!adminCheck(val)) {
      if (err) { err.textContent = esc(t('admin.gateErr')); err.hidden = false; }
      return false;
    }
    setUnlocked();
    if (err) err.hidden = true;
    showGate(false);
    render();
    bind();
    return true;
  }

  function initCloud() {
    showGate(false);
    updateCloudBar();
    renderCloud();
    bind();
    var C = cloud();
    if (C && typeof C.on === 'function') {
      C.on(function (evt) {
        if (evt.type === 'session') { updateCloudBar(); renderCloud(); }
      });
    }
  }

  function initLocalMode() {
    if (isUnlocked()) {
      showGate(false);
      render();
      bind();
      return;
    }
    showGate(true);
    var btn = qs('#nb-admin-unlock');
    if (btn) btn.addEventListener('click', unlock);
    var input = qs('#nb-admin-pass');
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); unlock(); }
    });
  }

  function init() {
    NB.mountShell('', { currentId: null });
    var C = cloud();
    /* 只有「已配置 + 已登录」才进云端管理；未登录仍保留本地口令模式，
       顶部状态条提供管理员登录入口，避免配置云端后本地数据无法管理。 */
    if (cloudMode() && C && C.status() === 'authed') { initCloud(); return; }
    initLocalMode();
    if (cloudMode()) { ensureCloudBar(); updateCloudBar(); }
  }

  /* 可测接口：口令校验与解锁（供自测 / 排障使用） */
  NB.admin = NB.admin || {};
  NB.admin.checkPass = function (val) { return adminCheck(val); };
  NB.admin.unlock = unlock;
  NB.admin.cloudMode = cloudMode;
  NB.admin.renderCloud = renderCloud;
  NB.admin.mapCloudRow = mapCloudRow;

  /* 脚本位于 body 末尾，DOM 已就绪；与其余页面脚本一致立即执行（不等 DOMContentLoaded） */
  init();
})();
