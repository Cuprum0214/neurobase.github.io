/* feedback.js — 全局反馈箱（离线版）
 * 仿参考 index.html 的反馈箱交互：导航按钮 #nb-fb-open 打开 <dialog>，
 * 类型选择 + 设备自动识别（只读）+ 内容 textarea + 字数统计 + 「我的留言」折叠区。
 * 数据存 localStorage 键 nb-feedback（无后端、纯离线，符合 N1 约定）；
 * 回复由 admin.html 管理，写回同一条记录 replies[]。
 * 全部样式走 NeuroBase CSS 变量 → 自动跟随明/暗主题与字号缩放。
 */
(function () {
  'use strict';
  var NB = window.NB || {};
  var t = NB.t || function (k) { return k; };
  var esc = NB.esc || function (s) { return String(s == null ? '' : s); };

  var KEY = 'nb-feedback';
  var MAX = 100;
  var LIMIT = 1000;
  /* 口令校验统一走 core.js 的 NB.adminCheck（源码只保存加盐摘要，不含明文） */
  var TYPE_KEYS = { err: 'fb.typeErr', use: 'fb.typeUse', idea: 'fb.typeIdea', other: 'fb.typeOther' };
  var DEV_KEYS = { pc: 'fb.devPc', tablet: 'fb.devTablet', phone: 'fb.devPhone' };
  var TYPE_IDS = ['err', 'use', 'idea', 'other'];

  /* ---------------- 云端能力（Phase 6 增量） ----------------
     新增文案走本地双语兜底，不改 data/i18n/*.json：
     这些键只服务云功能，避免为 10 个键全量重生成 terms.js / i18n.js。
     离线（未配置 / 未登录 / 断网）时行为与 v1.x 完全一致。 */
  var CLOUD_TXT = {
    zh: {
      modeOnline: '在线模式 · 回复会显示在「我的提问记录」',
      modeAuthed: '在线模式 · 已登录，回复会自动同步',
      modeOffline: '离线模式 · 反馈仅存本机',
      sending: '正在提交…',
      okCloud: '提交成功！回复会显示在下方「我的提问记录」里。',
      okLocal: '已保存到本机；云端暂不可用，可稍后重试或复制邮件发送。'
    },
    en: {
      modeOnline: 'Online · replies appear under My questions',
      modeAuthed: 'Online · signed in, replies sync automatically',
      modeOffline: 'Offline · stored on this device only',
      sending: 'Submitting…',
      okCloud: 'Submitted! Replies will appear under My questions below.',
      okLocal: 'Saved locally. Cloud unavailable; retry later or send by email.'
    }
  };
  var STATUS_TXT = {
    zh: { new: '待处理', read: '已读', replied: '已回复', closed: '已关闭' },
    en: { new: 'new', read: 'read', replied: 'replied', closed: 'closed' }
  };
  function lang() { try { return (NB.locale && NB.locale() === 'en') ? 'en' : 'zh'; } catch (e) { return 'zh'; } }
  function T2(key, params) {
    var table = CLOUD_TXT[lang()] || CLOUD_TXT.zh;
    var out = table[key] != null ? table[key] : key;
    if (params) {
      for (var k in params) out = out.split('{' + k + '}').join(String(params[k]));
    }
    return out;
  }
  function statusName(s) {
    var table = STATUS_TXT[lang()] || STATUS_TXT.zh;
    return table[s] || s || '';
  }
  function cloud() { return (window.NB && window.NB.cloud) || null; }
  function cloudReady() {
    var C = cloud();
    return !!(C && C.status && C.status() !== 'off');
  }

  /* ---------------- 设备识别（UA 正则，参考实现的简化版） ---------------- */
  function detectDevice() {
    var ua = navigator.userAgent || '';
    if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua)) return 'tablet';
    if (/Android|Mobile|iPhone|iPod|Windows Phone|Opera Mini|IEMobile|BlackBerry|SamsungBrowser/i.test(ua)) return 'phone';
    return 'pc';
  }

  /* ---------------- 本地存储 ---------------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch (e) { /* 隐私模式：忽略 */ }
  }
  function nowIso() { return new Date().toISOString(); }
  function fmtTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso || '');
    var p = function (n) { return n < 10 ? '0' + n : String(n); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function pageLabel() {
    var p = String(location.pathname || '').split('/').pop() || 'index.html';
    return p;
  }

  /* ---------------- dialog 构建 ---------------- */
  function typeOptionsHtml() {
    return TYPE_IDS.map(function (id) {
      return '<option value="' + id + '">' + esc(t(TYPE_KEYS[id])) + '</option>';
    }).join('');
  }

  function mineListHtml() {
    var list = load();
    if (!list.length) {
      return '<p class="fb-empty">' + esc(t('fb.emptyMine')) + '</p>';
    }
    return list.map(function (it) {
      var replied = (it.replies && it.replies.length) > 0 || it.status === 'replied' || it.status === 'closed';
      var replies = (it.replies || []).filter(function (r) { return r && r.body; });
      var badge = replied
        ? '<span class="fb-badge fb-badge-ok">' + esc(t('fb.replied')) + '</span>'
        : '<span class="fb-badge fb-badge-wait">' + esc(t('fb.pending')) + '</span>';
      var replyHtml = replies.map(function (r) {
        return '<div class="fb-reply">' +
            '<div class="fb-reply-head"><span class="fb-reply-tag">' + esc(t('admin.replyAt')) + '</span>' +
            '<span class="fb-reply-at">' + esc(fmtTime(r.at)) + '</span></div>' +
            '<p class="fb-reply-body">' + esc(r.body) + '</p>' +
          '</div>';
      }).join('');
      return '<article class="fb-item">' +
        '<div class="fb-item-head">' +
          '<span class="fb-item-type">' + esc(t(TYPE_KEYS[it.type] || 'fb.typeOther')) + '</span>' +
          '<span class="fb-item-at">' + esc(fmtTime(it.at)) + '</span>' +
          badge +
        '</div>' +
        '<p class="fb-item-body">' + esc(it.body) + '</p>' +
        replyHtml +
      '</article>';
    }).join('');
  }

  function dialogHtml() {
    return '<div class="fb-card">' +
        '<button type="button" class="fb-x" id="nb-fb-close" aria-label="' + esc(t('fb.close')) + '">✕</button>' +
        '<header class="fb-head">' +
          '<p class="fb-kicker">FEEDBACK</p>' +
          '<h3 class="fb-title" id="nb-fb-title">' + esc(t('fb.title')) + '</h3>' +
          '<p class="fb-sub">' + esc(t('fb.sub')) + '</p>' +
          '<p class="fb-mode" id="nb-fb-mode"></p>' +
        '</header>' +
        '<form class="fb-form" id="nb-fb-form" novalidate>' +
          '<div class="fb-field">' +
            '<label class="fb-label" for="nb-fb-type">' + esc(t('fb.type')) +
              ' <span class="fb-req">' + esc(t('fb.required')) + '</span></label>' +
            '<select class="fb-input" id="nb-fb-type" required>' + typeOptionsHtml() + '</select>' +
            '<input class="fb-input fb-other" id="nb-fb-other" type="text" maxlength="60" ' +
              'placeholder="' + esc(t('fb.otherPh')) + '" hidden>' +
          '</div>' +
          '<div class="fb-field">' +
            '<span class="fb-label">' + esc(t('fb.device')) +
              ' <span class="fb-auto">' + esc(t('fb.deviceAuto')) + '</span></span>' +
            '<input class="fb-input fb-device" id="nb-fb-device" type="text" readonly value="' +
              esc(t(DEV_KEYS[detectDevice()] || 'fb.devPc')) + '">' +
            '<p class="fb-hint">' + esc(t('fb.deviceHint')) + '</p>' +
          '</div>' +
          '<div class="fb-field">' +
            '<label class="fb-label" for="nb-fb-text">' + esc(t('fb.body')) +
              ' <span class="fb-req">' + esc(t('fb.required')) + '</span></label>' +
            '<textarea class="fb-input fb-area" id="nb-fb-text" maxlength="' + LIMIT + '" required ' +
              'placeholder="' + esc(t('fb.bodyPh')) + '"></textarea>' +
            '<div class="fb-meta"><span class="fb-count" id="nb-fb-count">0 / ' + LIMIT + '</span></div>' +
          '</div>' +
          '<p class="fb-status" id="nb-fb-status" role="status" aria-live="polite"></p>' +
          '<button type="submit" class="btn btn-primary fb-send" id="nb-fb-send">' +
            '<span class="btn-label">' + esc(t('fb.send')) + '</span>' +
          '</button>' +
        '</form>' +
        '<details class="fb-mine" id="nb-fb-mine">' +
          '<summary class="fb-mine-head">' +
            '<span>' + esc(t('fb.mineTitle')) + '</span>' +
            '<span class="fb-mine-count" id="nb-fb-mine-count">' + load().length + '</span>' +
          '</summary>' +
          '<div class="fb-mine-body">' +
            '<p class="fb-hint">' + esc(t('fb.mineHint')) + '</p>' +
            '<div class="fb-mine-list" id="nb-fb-mine-list">' + mineListHtml() + '</div>' +
            '<div class="fb-mine-tools">' +
              '<button type="button" class="btn" id="nb-fb-export">' + esc(t('fb.exportBtn')) + '</button>' +
              '<button type="button" class="btn" id="nb-fb-restore-btn">' + esc(t('fb.restoreBtn')) + '</button>' +
            '</div>' +
            '<div class="fb-restore" id="nb-fb-restore-box" hidden>' +
              '<p class="fb-hint">' + esc(t('fb.restoreHint')) + '</p>' +
              '<textarea class="fb-restore-text" id="nb-fb-restore" rows="4" spellcheck="false" aria-label="' + esc(t('fb.restoreHint')) + '"></textarea>' +
              '<button type="button" class="btn btn-primary fb-restore-apply" id="nb-fb-restore-apply">' + esc(t('fb.restoreApply')) + '</button>' +
              '<p class="fb-restore-msg" id="nb-fb-restore-msg" role="status" aria-live="polite"></p>' +
            '</div>' +
          '</div>' +
        '</details>' +
        '<div class="fb-foot">' +
          '<a class="fb-admin-link" href="admin.html" id="nb-fb-admin-open">' + esc(t('fb.adminLink')) + '</a>' +
          '<form class="fb-admin-gate" id="nb-fb-admin-form" hidden>' +
            '<label class="fb-admin-gate-label" for="nb-fb-admin-pass">' + esc(t('admin.gatePh')) + '</label>' +
            '<div class="fb-admin-gate-row">' +
              '<input type="password" class="fb-input fb-admin-gate-input" id="nb-fb-admin-pass" ' +
                'autocomplete="off" maxlength="16" placeholder="' + esc(t('admin.gatePh')) + '">' +
              '<button type="submit" class="btn btn-primary fb-admin-gate-btn">' + esc(t('admin.gateUnlock')) + '</button>' +
            '</div>' +
            '<p class="fb-admin-gate-err" id="nb-fb-admin-err" role="alert" hidden></p>' +
          '</form>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- 打开 / 关闭（showModal 不可用时回退 open 属性，兼容 jsdom 与旧内核） ---------------- */
  var dlg = null;
  function ensureDlg() {
    if (dlg && dlg.parentNode === document.body) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'fb-dialog';
    dlg.id = 'nb-fb-dialog';
    dlg.setAttribute('aria-labelledby', 'nb-fb-title');
    dlg.innerHTML = dialogHtml();
    document.body.appendChild(dlg);
    bindDlg();
    return dlg;
  }
  function openBox() {
    var el = ensureDlg();
    resetForm();
    setStatus(''); /* 打开时清空上次的状态提示（成功/错误都不残留） */
    refreshMine();
    resetAdminGate();
    refreshMode();
    /* v1.23.21：打开即同步云端回复（登录按账号，未登录按本地 code），不阻塞弹窗 */
    syncMine().then(function (changed) { if (changed) refreshMine(); });
    try {
      if (typeof el.showModal === 'function') { el.showModal(); return; }
    } catch (e) { /* jsdom / 旧内核：走 fallback */ }
    el.setAttribute('open', '');
  }
  function closeBox() {
    if (!dlg) return;
    try {
      if (typeof dlg.close === 'function' && dlg.open) { dlg.close(); return; }
    } catch (e) { /* 同上 */ }
    dlg.removeAttribute('open');
  }
  function resetForm() {
    var f = qs('#nb-fb-form');
    if (f) f.reset();
    var other = qs('#nb-fb-other');
    if (other) other.hidden = true;
    /* 注意：此处不清空 #nb-fb-status —— 提交成功/失败的提示要在 resetForm 之后保留，
       否则 submitFeedback 里的 setStatus(fb.ok) 会被立刻清掉（v1.4.0 修复）。 */
    var c = qs('#nb-fb-count');
    if (c) c.textContent = '0 / ' + LIMIT;
  }
  function setStatus(msg, ok) {
    var s = qs('#nb-fb-status');
    if (!s) return;
    s.textContent = msg;
    s.className = 'fb-status' + (ok ? ' fb-status-ok' : ' fb-status-err');
  }
  function refreshMine() {
    var n = qs('#nb-fb-mine-count');
    if (n) n.textContent = load().length;
    var list = qs('#nb-fb-mine-list');
    if (list) list.innerHTML = mineListHtml();
  }

  /* ---------------- 本机凭据导出 / 恢复（v1.23.22） ----------------
     导出 JSON：code + 记录摘要 + 本地回复，供换设备 / 换浏览器后恢复。
     凭据由用户自行保管，不经过任何第三方；文本同时填入恢复框，便于 file:// 下手动复制。 */
  function exportPayload() {
    return {
      app: 'neurobase-feedback',
      v: 1,
      exported_at: nowIso(),
      items: load().map(function (it) {
        var o = {
          code: it.code || '',
          at: it.at || '',
          type: it.type || 'other',
          other: it.other || '',
          body: it.body || '',
          status: it.status || 'new',
          remote: !!it.remote
        };
        if (it.replies && it.replies.length) o.replies = it.replies;
        return o;
      })
    };
  }
  function exportMine() {
    var text = JSON.stringify(exportPayload(), null, 2);
    var box = qs('#nb-fb-restore-box');
    var area = qs('#nb-fb-restore');
    var msg = qs('#nb-fb-restore-msg');
    if (box) box.hidden = false;
    if (area) { area.value = text; area.focus(); area.select(); }
    var copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        var p = navigator.clipboard.writeText(text);
        if (p && p.catch) p.catch(function () {});
        copied = true;
      }
    } catch (e) { copied = false; }
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'neurobase-feedback-' + String(nowIso()).slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    } catch (e2) { /* 下载失败时仍有文本框可复制 */ }
    if (msg) msg.textContent = copied ? t('fb.exportOk') : t('fb.exportShown');
    return text;
  }
  function restoreMine(raw) {
    var msg = qs('#nb-fb-restore-msg');
    var area = qs('#nb-fb-restore');
    var text = raw == null ? (area ? area.value : '') : String(raw);
    var data = null;
    try { data = JSON.parse(String(text || '').trim()); } catch (e) { data = null; }
    var items = data && Array.isArray(data.items) ? data.items : null;
    if (!items) {
      if (msg) msg.textContent = t('fb.restoreBad');
      return 0;
    }
    var list = load();
    var byCode = {};
    list.forEach(function (it) { if (it.code) byCode[it.code] = it; });
    var added = 0;
    items.slice(0, 500).forEach(function (src) {
      if (!src || typeof src !== 'object') return;
      var code = String(src.code || '').trim().toLowerCase();
      var body = String(src.body || '').slice(0, 4000);
      if (!code && !body) return;
      var hit = code && byCode[code] ? byCode[code] : null;
      if (hit) {
        if (src.status) hit.status = src.status;
        if ((!hit.replies || !hit.replies.length) && Array.isArray(src.replies)) {
          hit.replies = src.replies.filter(function (r) { return r && r.body; }).slice(0, 20);
        }
        return;
      }
      var rec = {
        id: 'fb-restore-' + (code || String(nowIso()).replace(/[^0-9]/g, '')) + '-' + added,
        at: src.at || nowIso(),
        type: TYPE_KEYS[src.type] ? src.type : 'other',
        other: String(src.other || '').slice(0, 120),
        device: '',
        page: '',
        body: body,
        code: code,
        remote: !!src.remote,
        replies: Array.isArray(src.replies)
          ? src.replies.filter(function (r) { return r && r.body; }).slice(0, 20)
          : []
      };
      list.unshift(rec);
      if (code) byCode[code] = rec;
      added++;
    });
    save(list);
    refreshMine();
    syncMine().then(function (changed) { if (changed) refreshMine(); });
    if (msg) msg.textContent = added ? t('fb.restoreOk', { n: added }) : t('fb.restoreNone');
    return added;
  }

  /* ---------------- 事件绑定（委托到 document，导航按钮由 mountShell 注入） ---------------- */
  function qs(sel, root) { return (root || document).querySelector(sel); }

  function bindDlg() {
    var box = dlg;
    var close = qs('#nb-fb-close', box);
    if (close) close.addEventListener('click', closeBox);
    box.addEventListener('click', function (e) {
      if (e.target === box) closeBox(); /* 点遮罩关闭 */
    });
    var type = qs('#nb-fb-type', box);
    if (type) type.addEventListener('change', function () {
      var other = qs('#nb-fb-other', box);
      if (other) other.hidden = type.value !== 'other';
    });
    var text = qs('#nb-fb-text', box);
    if (text) text.addEventListener('input', function () {
      var c = qs('#nb-fb-count', box);
      if (c) c.textContent = text.value.length + ' / ' + LIMIT;
    });
    var form = qs('#nb-fb-form', box);
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitFeedback();
    });
    var expBtn = qs('#nb-fb-export', box);
    if (expBtn) expBtn.addEventListener('click', function () { exportMine(); });
    var resBtn = qs('#nb-fb-restore-btn', box);
    if (resBtn) resBtn.addEventListener('click', function () {
      var wrap = qs('#nb-fb-restore-box');
      if (wrap) wrap.hidden = !wrap.hidden;
    });
    var applyBtn = qs('#nb-fb-restore-apply', box);
    if (applyBtn) applyBtn.addEventListener('click', function () { restoreMine(); });
    var adminOpen = qs('#nb-fb-admin-open', box);
    if (adminOpen) adminOpen.addEventListener('click', function (e) {
      e.preventDefault(); /* 先过口令，再进 admin.html */
      showAdminGate();
    });
    var adminForm = qs('#nb-fb-admin-form', box);
    if (adminForm) adminForm.addEventListener('submit', function (e) {
      e.preventDefault();
      tryAdminGate();
    });
  }

  /* ---------------- 管理员入口口令 ----------------
     反馈箱「管理员入口」不再直接跳转：先在本层校验口令，
     通过后才进入 admin.html；admin.html 自身的口令门保留为第二道防线。
     口令明文不落源码：core.js 只保存加盐 SHA-256 摘要，此处统一调用 NB.adminCheck。
     纯前端口令是「软限制」，只用于避免误入，不构成真正鉴权。 */
  function showAdminGate() {
    var form = qs('#nb-fb-admin-form');
    var input = qs('#nb-fb-admin-pass');
    var err = qs('#nb-fb-admin-err');
    if (form) form.hidden = false;
    if (err) { err.hidden = true; err.textContent = ''; }
    if (input) {
      input.value = '';
      try { input.focus(); } catch (e) { /* 忽略 */ }
    }
  }
  function checkAdminPass(val) {
    if (typeof NB.adminCheck === 'function') return NB.adminCheck(val) === true;
    return false;
  }
  function tryAdminGate() {
    var input = qs('#nb-fb-admin-pass');
    var err = qs('#nb-fb-admin-err');
    if (!checkAdminPass(input ? input.value : '')) {
      if (err) { err.textContent = t('admin.gateErr'); err.hidden = false; }
      if (input) {
        input.value = '';
        try { input.focus(); } catch (e) { /* 忽略 */ }
      }
      return false;
    }
    if (err) err.hidden = true;
    if (typeof window !== 'undefined' && window.location) window.location.href = 'admin.html';
    return true;
  }
  function resetAdminGate() {
    var form = qs('#nb-fb-admin-form');
    if (form) form.hidden = true;
    var input = qs('#nb-fb-admin-pass');
    if (input) input.value = '';
    var err = qs('#nb-fb-admin-err');
    if (err) { err.hidden = true; err.textContent = ''; }
  }

  function submitFeedback() {
    var type = qs('#nb-fb-type');
    var other = qs('#nb-fb-other');
    var text = qs('#nb-fb-text');
    var tVal = type ? type.value : 'other';
    var bVal = text ? text.value.trim() : '';
    var otherVal = tVal === 'other' ? (other ? other.value.trim() : '') : '';
    var rec = createRecord(tVal, bVal, otherVal);
    if (!rec) return;
    saveRecord(rec);
    resetForm();
    refreshMine();

    if (!cloudReady()) {
      setStatus(t('fb.ok'), true);
      return;
    }

    /* 在线模式：先落本机（断网也不丢），再异步提交换取查询码 */
    setStatus(T2('sending'), true);
    var C = cloud();
    C.rpc('submit_feedback', {
      p_type: rec.type,
      p_type_other: rec.other || null,
      p_body: rec.body,
      p_contact: null,
      p_page: rec.page,
      p_device: rec.device,
      p_width: (typeof window !== 'undefined' && window.innerWidth) || null
    }).then(function (r) {
      var row = r && r.ok && Array.isArray(r.data) ? r.data[0] : null;
      if (row && row.code) {
        rec.code = row.code;
        rec.remoteId = row.id || '';
        rec.remote = true;
        rec.status = 'new';
        replaceRecord(rec);
        setStatus(T2('okCloud'), true);
      } else {
        rec.remote = false;
        replaceRecord(rec);
        setStatus(T2('okLocal'), false);
      }
      refreshMine();
    });
  }

  /* ---------------- 在线模式辅助（Phase 6 → v1.23.21 取消查询码） ----------------
     回复不再依赖 6 位查询码：打开反馈箱时自动同步到「我的提问记录」。
     · 已登录：按账号拉取自己的反馈列表（RLS fb_self_select）；
     · 未登录：用本地记录中保存的 code 逐条调用 get_feedback_by_code（code 仅作内部凭据，不展示）。 */
  var TYPE_FROM_CLOUD = {
    err: 'err', use: 'use', idea: 'idea', other: 'other',
    '内容错误': 'err', '使用问题': 'use', '改进建议': 'idea', '其他': 'other',
    'Content error': 'err', 'Usage issue': 'use', 'Suggestion': 'idea', 'Other': 'other'
  };
  function mergeCloudRow(list, row, hit) {
    var target = hit || null;
    if (!target) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].remoteId && list[i].remoteId === row.id) { target = list[i]; break; }
      }
    }
    if (!target) {
      target = {
        id: 'fb-cloud-' + (row.id || row.code),
        at: row.created_at || nowIso(),
        type: TYPE_FROM_CLOUD[row.type] || 'other',
        other: row.type_other || '',
        device: row.device || '',
        page: row.page || '',
        body: row.body || '',
        code: row.code || '',
        remote: true,
        remoteId: row.id || '',
        status: row.status || 'new',
        replies: []
      };
      list.unshift(target);
    }
    if (row.status) target.status = row.status;
    if (row.code) target.code = row.code;
    if (row.id) target.remoteId = row.id;
    if (row.reply) {
      var at = row.replied_at || row.updated_at || row.created_at || nowIso();
      var replies = target.replies || [];
      var dup = false;
      for (var k = 0; k < replies.length; k++) {
        if (replies[k] && replies[k].body === row.reply) { dup = true; break; }
      }
      if (!dup) target.replies = replies.concat([{ at: at, body: row.reply }]);
    }
    return target;
  }
  function syncMine() {
    var C = cloud();
    if (!cloudReady() || !C || typeof C.rpc !== 'function') return Promise.resolve(false);
    var list = load();
    var tasks = [];
    if (typeof C.isAuthed === 'function' && C.isAuthed() && typeof C.select === 'function') {
      tasks.push(C.select('feedback',
        'select=id,code,type,type_other,body,status,reply,replied_at,created_at,device,page&order=created_at.desc&limit=50'
      ).then(function (r) {
        if (!r || !r.ok || !Array.isArray(r.rows)) return;
        r.rows.forEach(function (row) { mergeCloudRow(list, row); });
      }));
    } else {
      list.filter(function (it) { return it.remote && it.code; }).slice(0, 20).forEach(function (it) {
        tasks.push(C.rpc('get_feedback_by_code', { p_code: it.code }).then(function (r) {
          var row = r && r.ok && Array.isArray(r.data) ? r.data[0] : null;
          if (row) mergeCloudRow(list, row, it);
        }));
      });
    }
    if (!tasks.length) return Promise.resolve(false);
    return Promise.all(tasks).then(function () {
      save(list);
      return true;
    }).catch(function () { return false; });
  }
  function replaceRecord(rec) {
    var list = load();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === rec.id) { list[i] = rec; save(list); return rec; }
    }
    list.unshift(rec);
    save(list);
    return rec;
  }
  function refreshMode() {
    var el = qs('#nb-fb-mode');
    var C = cloud();
    var st = C && C.status ? C.status() : 'off';
    if (el) {
      el.className = 'fb-mode' + (st === 'off' ? ' is-off' : ' is-on');
      el.textContent = st === 'authed' ? T2('modeAuthed') : st === 'anon' ? T2('modeOnline') : T2('modeOffline');
    }
  }
  /* 校验 + 建记录（表单提交与对外接口共用同一入口） */
  function createRecord(tVal, bVal, otherVal) {
    if (TYPE_IDS.indexOf(tVal) < 0) tVal = 'other';
    bVal = String(bVal || '').trim();
    otherVal = tVal === 'other' ? String(otherVal || '').trim() : '';
    if (!bVal) { setStatus(t('fb.errBody')); return null; }
    if (bVal.length > LIMIT) { setStatus(t('fb.errLong')); return null; }
    return {
      id: 'fb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      at: nowIso(),
      type: tVal,
      other: otherVal,
      device: detectDevice(),
      page: pageLabel(),
      body: bVal,
      code: '',
      remote: false,
      status: 'local',
      replies: []
    };
  }
  function saveRecord(rec) {
    var list = load();
    list.unshift(rec);
    save(list);
  }

  /* ---------------- 导航按钮入口（mountShell 注入的 #nb-fb-open） ---------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('#nb-fb-open') : null;
    if (btn) { e.preventDefault(); openBox(); }
  });

  /* ---------------- 对外（供 admin.html 与自测复用） ---------------- */
  window.NB.feedback = {
    KEY: KEY,
    load: load,
    save: save,
    detectDevice: detectDevice,
    fmtTime: fmtTime,
    nowIso: nowIso,
    pageLabel: pageLabel,
    createRecord: createRecord,
    saveRecord: saveRecord,
    replaceRecord: replaceRecord,
    submitFeedback: submitFeedback,
    syncMine: syncMine,
    exportMine: exportMine,
    restoreMine: restoreMine,
    checkAdminPass: checkAdminPass,
    resetAdminGate: resetAdminGate,
    refreshMode: refreshMode,
    cloudReady: cloudReady,
    submit: function (rec) { /* admin 端回写回复用 */ var l = load(); var i = -1; for (var k = 0; k < l.length; k++) if (l[k].id === rec.id) { i = k; break; } if (i < 0) { l.unshift(rec); } else { l[i] = rec; } save(l); return rec; },
    openBox: openBox,
    closeBox: closeBox
  };
})();
