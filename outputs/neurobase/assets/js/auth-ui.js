/* ============================================================================
   NeuroBase · 账号入口与同步面板 auth-ui.js（普通脚本，无依赖）

   行为：
     · 云端未配置（cloud.js status = 'off'）→ 工具栏显示「离线」，点击给出配置指引
     · 已配置未登录 → 「登录」，弹出登录 / 注册表单
     · 已登录 → 显示同步状态与账号名，可修改账号名 / 立即同步 / 从云端恢复 / 清空本地 / 退出
     · 任何失败都不破坏离线使用；断网时保留本地数据并提示

   依赖：core.js（NB.t / NB.esc / NB.locale）、cloud.js（NB.cloud）
   ============================================================================ */
(function () {
  'use strict';

  var TXT = {
    zh: {
      btnOff: '离线',
      btnIn: '登录',
      btnOn: '已同步',
      btnOnShort: '云',
      titleIn: '登录 NeuroBase',
      titleUp: '创建 NeuroBase 账号',
      subIn: '登录后，学习进度、收藏与错题会跨设备同步。',
      subUp: '注册后可在手机与电脑之间同步学习数据。',
      email: '邮箱',
      password: '密码',
      pwdHint: '至少 6 位',
      showPwd: '显示密码',
      hidePwd: '隐藏密码',
      signIn: '登录',
      signUp: '注册',
      signOut: '退出登录',
      settings: '账号设置',
      accName: '账号名',
      accNameHint: '1–24 字，自定义名全站唯一，留空用邮箱前缀',
      saveName: '保存账号名',
      nameSaved: '账号名已保存，论坛署名已同步',
      nameCleared: '已恢复默认账号名（邮箱前缀），论坛署名已同步',
      nameTaken: '该账号名已被使用，换一个试试',
      nameInvalid: '账号名需为 1–24 个字符',
      nameNeedNet: '修改账号名需要联网校验唯一性',
      nameServer: '服务端尚未升级，暂时无法修改账号名',
      nameAuth: '登录已过期，请重新登录后再改',
      dataLabel: '学习数据',
      toUp: '没有账号？去注册',
      toIn: '已有账号？去登录',
      account: '我的账号',
      syncNow: '立即同步',
      syncing: '同步中…',
      lastSync: '上次同步',
      never: '尚未同步',
      restore: '用云端数据覆盖本地',
      wipe: '清空本机学习数据',
      wipeConfirm: '确定清空本机的进度、收藏与错题吗？此操作不可撤销，云端数据不受影响。',
      offTitle: '云端尚未配置',
      offBody: '在 assets/js/cloud-config.js 填入 Supabase 的 Project URL 与 anon key 后即可登录同步。当前所有功能仍可离线使用。',
      errEmail: '请输入有效邮箱',
      errPwd: '密码至少 6 位',
      errNet: '网络不可用，本地数据已保留',
      okConfirm: '注册成功，请到邮箱点击确认链接后再登录。',
      okSigned: '已登录，正在同步…',
      confirmKicker: 'VERIFY EMAIL',
      confirmTitle: '还差一步：验证邮箱',
      confirmSub: '确认邮件已发送至',
      confirmStep1: '打开邮箱，找不到就看一下「垃圾邮件 / 广告邮件」。',
      confirmStep2: '点击邮件里的确认链接（链接 24 小时内有效）。',
      confirmStep3: '回到这里，用刚才的邮箱和密码登录。',
      confirmResend: '重新发送确认邮件',
      confirmResent: '已重新发送，请稍后查收。',
      confirmBack: '返回登录',
      confirmCooldown: '请在 {s} 秒后再试。',
      confirmNotOpen: '本项目已关闭邮箱确认，注册后应直接登录；若仍提示未确认，请联系管理员。',
      dataLine: '进度 {p} · 收藏 {f} · 错题 {m}',
      syncOk: '已同步',
      syncFail: '同步失败，稍后自动重试',
      restored: '已用云端数据覆盖本地',
      wiped: '已清空本机学习数据',
      close: '关闭',
      busy: '请稍候…'
    },
    en: {
      btnOff: 'Offline',
      btnIn: 'Sign in',
      btnOn: 'Synced',
      btnOnShort: 'Cloud',
      titleIn: 'Sign in to NeuroBase',
      titleUp: 'Create a NeuroBase account',
      subIn: 'Your progress, favorites and mistakes sync across devices.',
      subUp: 'Sign up to sync your study data between phone and desktop.',
      email: 'Email',
      password: 'Password',
      pwdHint: 'at least 6 characters',
      showPwd: 'Show password',
      hidePwd: 'Hide password',
      signIn: 'Sign in',
      signUp: 'Sign up',
      signOut: 'Sign out',
      settings: 'Account settings',
      accName: 'Account name',
      accNameHint: '1–24 characters; custom names are unique site-wide; leave blank to use the email prefix',
      saveName: 'Save account name',
      nameSaved: 'Account name saved; forum signature updated',
      nameCleared: 'Default account name restored; forum signature updated',
      nameTaken: 'That name is already taken. Try another.',
      nameInvalid: 'Account name must be 1–24 characters',
      nameNeedNet: 'Changing your account name requires a connection to check uniqueness',
      nameServer: 'The server has not been upgraded yet, so the name cannot be changed',
      nameAuth: 'Your session expired; sign in again before changing it',
      dataLabel: 'Study data',
      toUp: 'No account? Sign up',
      toIn: 'Already have one? Sign in',
      account: 'My account',
      syncNow: 'Sync now',
      syncing: 'Syncing…',
      lastSync: 'Last sync',
      never: 'never',
      restore: 'Replace local with cloud',
      wipe: 'Clear local study data',
      wipeConfirm: 'Clear progress, favorites and mistakes on this device? This cannot be undone; cloud data is untouched.',
      offTitle: 'Cloud not configured',
      offBody: 'Fill in your Supabase Project URL and anon key in assets/js/cloud-config.js to enable sign-in. Everything still works offline.',
      errEmail: 'Please enter a valid email',
      errPwd: 'Password must be at least 6 characters',
      errNet: 'Network unavailable; local data kept',
      okConfirm: 'Account created. Check your email and confirm before signing in.',
      okSigned: 'Signed in, syncing…',
      confirmKicker: 'VERIFY EMAIL',
      confirmTitle: 'One more step: verify your email',
      confirmSub: 'Confirmation email sent to',
      confirmStep1: 'Open your inbox — check spam/promotions if you cannot find it.',
      confirmStep2: 'Click the confirmation link (valid for 24 hours).',
      confirmStep3: 'Come back here and sign in with the same email and password.',
      confirmResend: 'Resend confirmation email',
      confirmResent: 'Sent again. Please check your inbox shortly.',
      confirmBack: 'Back to sign in',
      confirmCooldown: 'Please wait {s}s before retrying.',
      confirmNotOpen: 'Email confirmation is disabled for this project, so sign-up should sign you in directly. If it still asks for confirmation, contact the admin.',
      dataLine: 'Progress {p} · Favorites {f} · Mistakes {m}',
      syncOk: 'Synced',
      syncFail: 'Sync failed, will retry',
      restored: 'Local data replaced by cloud',
      wiped: 'Local study data cleared',
      close: 'Close',
      busy: 'Please wait…'
    }
  };

  function lang() {
    try { return (window.NB && window.NB.locale && window.NB.locale() === 'en') ? 'en' : 'zh'; }
    catch (e) { return 'zh'; }
  }
  function T(key) {
    var table = TXT[lang()] || TXT.zh;
    return table[key] != null ? table[key] : (TXT.zh[key] != null ? TXT.zh[key] : key);
  }
  function esc(s) {
    if (window.NB && window.NB.esc) return window.NB.esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cloud() { return (window.NB && window.NB.cloud) || null; }
  function $(sel) { return document.querySelector(sel); }
  function loc() {
    try { return new Date().toLocaleString(); } catch (e) { return ''; }
  }

  var dlg = null;
  var mode = 'in';          /* 'in' | 'up' | 'confirm' */
  var busy = false;
  var pendingEmail = '';    /* 等待邮箱确认的地址 */
  var resendAt = 0;         /* 上次重发时间戳（冷却 60s） */

  /* ---------------- 工具栏按钮 ---------------- */
  function syncVisual() {
    var btn = $('#nb-auth-btn');
    if (!btn) return;
    var C = cloud();
    var st = C ? C.status() : 'off';
    var sum = C ? C.summary() : { pending: 0, syncing: false };
    var label = btn.querySelector('.nb-auth-label');
    var dot = btn.querySelector('.nb-auth-dot');

    btn.classList.toggle('is-off', st === 'off');
    btn.classList.toggle('is-anon', st === 'anon');
    btn.classList.toggle('is-on', st === 'authed');
    if (dot) dot.className = 'nb-auth-dot' + (sum.syncing ? ' is-busy' : sum.pending ? ' is-pending' : '');

    if (label) {
      if (st === 'off') label.textContent = T('btnOff');
      else if (st === 'anon') label.textContent = T('btnIn');
      else label.textContent = sum.syncing ? T('syncing') : T('btnOn');
    }
    btn.title = st === 'off'
      ? T('offTitle')
      : st === 'anon'
        ? T('btnIn')
        : (T('account') + ' · ' + ((C.summary().lastSyncAt || '') ? T('lastSync') + ' ' + new Date(C.summary().lastSyncAt).toLocaleString() : T('never')));
  }

  function mountButton() {
    var toolbar = $('#nb-header .toolbar');
    if (!toolbar || $('#nb-auth-btn')) return !!toolbar;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tb-btn nb-auth-btn';
    btn.id = 'nb-auth-btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-controls', 'nb-auth-dialog');
    btn.innerHTML = '<span class="nb-auth-dot" aria-hidden="true"></span>' +
      '<span class="nb-auth-label">' + esc(T('btnIn')) + '</span>';
    btn.addEventListener('click', openBox);
    toolbar.insertBefore(btn, toolbar.firstChild);
    syncVisual();
    return true;
  }

  function whenHeader(fn) {
    var tries = 0;
    (function tick() {
      if ($('#nb-header .toolbar')) { fn(); return; }
      tries += 1;
      if (tries > 25) return;
      setTimeout(tick, 100);
    })();
  }

  /* ---------------- 弹窗 ---------------- */
  /* 注册成功后：前往邮箱确认的指引卡 */
  function confirmHtml() {
    return '<div class="nb-auth-card nb-auth-card--confirm">' +
      '<button type="button" class="nb-auth-x" data-close aria-label="' + esc(T('close')) + '">✕</button>' +
      '<p class="nb-auth-kicker">' + esc(T('confirmKicker')) + '</p>' +
      '<h3 class="nb-auth-title">' + esc(T('confirmTitle')) + '</h3>' +
      '<p class="nb-auth-sub">' + esc(T('confirmSub')) + ' <strong class="nb-auth-addr">' + esc(pendingEmail || '') + '</strong></p>' +
      '<ol class="nb-auth-steps">' +
        '<li>' + esc(T('confirmStep1')) + '</li>' +
        '<li>' + esc(T('confirmStep2')) + '</li>' +
        '<li>' + esc(T('confirmStep3')) + '</li>' +
      '</ol>' +
      '<p class="nb-auth-status" id="nb-auth-status" role="status" aria-live="polite"></p>' +
      '<div class="nb-auth-actions">' +
        '<button type="button" class="btn btn-primary nb-auth-submit" data-act="resend">' + esc(T('confirmResend')) + '</button>' +
        '<button type="button" class="btn" data-act="back">' + esc(T('confirmBack')) + '</button>' +
      '</div>' +
      '</div>';
  }

  /* 密码显隐图标（睁眼 = 点击显示，斜线眼 = 点击隐藏） */
  function eyeSvg() {
    var on = '<svg class="nb-auth-eye-face nb-auth-eye-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M1.9 12S5.5 5.6 12 5.6 22.1 12 22.1 12 18.5 18.4 12 18.4 1.9 12 1.9 12Z"/>' +
      '<circle cx="12" cy="12" r="3.1"/>' +
      '</svg>';
    var off = '<svg class="nb-auth-eye-face nb-auth-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M1.9 12S5.5 5.6 12 5.6 22.1 12 22.1 12 18.5 18.4 12 18.4 1.9 12 1.9 12Z"/>' +
      '<circle cx="12" cy="12" r="3.1"/>' +
      '<path d="M3.5 20.5 20.5 3.5"/>' +
      '</svg>';
    return on + off;
  }

  function shellHtml() {
    var C = cloud();
    var st = C ? C.status() : 'off';
    var sum = C ? C.summary() : { progress: 0, favorites: 0, mistakes: 0, lastSyncAt: '' };
    var who = C && C.user() ? (C.user().email || C.user().id) : '';

    /* 验证邮箱提示卡优先于状态判断：注册成功后即便云端状态短暂为 off 也要能看到指引 */
    if (mode === 'confirm') {
      return confirmHtml();
    }

    if (st === 'off') {
      return '<div class="nb-auth-card">' +
        '<button type="button" class="nb-auth-x" data-close aria-label="' + esc(T('close')) + '">✕</button>' +
        '<h3 class="nb-auth-title">' + esc(T('offTitle')) + '</h3>' +
        '<p class="nb-auth-sub">' + esc(T('offBody')) + '</p>' +
        '<div class="nb-auth-foot"><button type="button" class="btn btn-primary" data-close>' + esc(T('close')) + '</button></div>' +
        '</div>';
    }

    if (st === 'authed') {
      var line = T('dataLine')
        .replace('{p}', String(sum.progress || 0))
        .replace('{f}', String(sum.favorites || 0))
        .replace('{m}', String(sum.mistakes || 0));
      var last = sum.lastSyncAt ? new Date(sum.lastSyncAt).toLocaleString() : T('never');
      var shown = C.account && C.account.name ? C.account.name() : who;
      var stored = C.account && C.account.stored ? C.account.stored() : '';
      var fallback = '';
      try { fallback = who && who.indexOf('@') > 0 ? String(who).split('@')[0] : ''; } catch (e) { fallback = ''; }
      return '<div class="nb-auth-card">' +
        '<button type="button" class="nb-auth-x" data-close aria-label="' + esc(T('close')) + '">✕</button>' +
        '<p class="nb-auth-kicker">ACCOUNT</p>' +
        '<h3 class="nb-auth-title">' + esc(T('account')) + '</h3>' +
        '<p class="nb-auth-name" id="nb-auth-name-view">' + esc(shown) + '</p>' +
        '<p class="nb-auth-who" title="' + esc(who) + '">' + esc(who) + '</p>' +
        '<dl class="nb-auth-meta">' +
          '<div><dt>' + esc(T('dataLabel')) + '</dt><dd>' + esc(line) + '</dd></div>' +
          '<div><dt>' + esc(T('lastSync')) + '</dt><dd>' + esc(last) + '</dd></div>' +
        '</dl>' +
        '<div class="nb-auth-settings">' +
          '<p class="nb-auth-settings-title">' + esc(T('settings')) + '</p>' +
          '<label class="nb-auth-field">' +
            '<span>' + esc(T('accName')) + ' <em>' + esc(T('accNameHint')) + '</em></span>' +
            '<input type="text" id="nb-auth-name" maxlength="24" autocomplete="nickname" placeholder="' + esc(fallback) + '" value="' + esc(stored) + '">' +
          '</label>' +
          '<button type="button" class="btn nb-auth-save" data-act="save-name">' + esc(T('saveName')) + '</button>' +
        '</div>' +
        '<p class="nb-auth-status" id="nb-auth-status" role="status" aria-live="polite"></p>' +
        '<div class="nb-auth-actions">' +
          '<button type="button" class="btn btn-primary" data-act="sync">' + esc(T('syncNow')) + '</button>' +
          '<button type="button" class="btn" data-act="restore">' + esc(T('restore')) + '</button>' +
          '<button type="button" class="btn" data-act="wipe">' + esc(T('wipe')) + '</button>' +
          '<button type="button" class="btn" data-act="out">' + esc(T('signOut')) + '</button>' +
        '</div>' +
        '</div>';
    }

    var isUp = mode === 'up';
    return '<div class="nb-auth-card">' +
      '<button type="button" class="nb-auth-x" data-close aria-label="' + esc(T('close')) + '">✕</button>' +
      '<p class="nb-auth-kicker">' + (isUp ? 'CREATE ACCOUNT' : 'SIGN IN') + '</p>' +
      '<h3 class="nb-auth-title">' + esc(isUp ? T('titleUp') : T('titleIn')) + '</h3>' +
      '<p class="nb-auth-sub">' + esc(isUp ? T('subUp') : T('subIn')) + '</p>' +
      '<form class="nb-auth-form" id="nb-auth-form" novalidate>' +
        '<label class="nb-auth-field">' +
          '<span>' + esc(T('email')) + '</span>' +
          '<input type="email" id="nb-auth-email" autocomplete="email" required>' +
        '</label>' +
        '<label class="nb-auth-field">' +
          '<span>' + esc(T('password')) + ' <em>' + esc(T('pwdHint')) + '</em></span>' +
          '<span class="nb-auth-pwd">' +
            '<input type="password" id="nb-auth-password" autocomplete="' + (isUp ? 'new-password' : 'current-password') + '" minlength="6" required>' +
            '<button type="button" class="nb-auth-eye" data-act="eye-pwd" aria-pressed="false" aria-label="' + esc(T('showPwd')) + '" title="' + esc(T('showPwd')) + '">' + eyeSvg() + '</button>' +
          '</span>' +
        '</label>' +
        '<p class="nb-auth-status" id="nb-auth-status" role="status" aria-live="polite"></p>' +
        '<button type="submit" class="btn btn-primary nb-auth-submit">' + esc(isUp ? T('signUp') : T('signIn')) + '</button>' +
        '<button type="button" class="nb-auth-link" data-act="toggle">' + esc(isUp ? T('toIn') : T('toUp')) + '</button>' +
      '</form>' +
      '</div>';
  }

  function ensureDlg() {
    if (dlg && dlg.parentNode === document.body) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'nb-auth-dialog';
    dlg.id = 'nb-auth-dialog';
    dlg.innerHTML = shellHtml();
    document.body.appendChild(dlg);
    bind(dlg);
    return dlg;
  }

  function closeBox() {
    if (!dlg) return;
    try {
      if (typeof dlg.close === 'function' && dlg.open) { dlg.close(); return; }
    } catch (e) { /* 旧内核 */ }
    dlg.removeAttribute('open');
  }

  function openBox() {
    var C = cloud();
    if (C && C.status() === 'off') {
      var el = ensureDlg();
      el.innerHTML = shellHtml();
      bind(el);
      show(el);
      return;
    }
    mode = 'in';
    var el2 = ensureDlg();
    el2.innerHTML = shellHtml();
    bind(el2);
    show(el2);
    /* 打开面板时向服务端取一次权威账号名（唯一性以服务端为准） */
    if (C && C.status() === 'authed' && C.account && typeof C.account.refresh === 'function') {
      C.account.refresh().then(function (r) {
        if (!r || !r.ok) return;
        var view = $('#nb-auth-name-view');
        if (view) view.textContent = C.account.name();
        var inp = $('#nb-auth-name');
        if (inp && inp !== document.activeElement) inp.value = C.account.stored();
      });
    }
  }

  function show(el) {
    try {
      if (typeof el.showModal === 'function') { el.showModal(); return; }
    } catch (e) { /* jsdom / 旧内核 */ }
    el.setAttribute('open', '');
  }

  function setStatus(msg, kind) {
    var s = $('#nb-auth-status');
    if (!s) return;
    s.textContent = msg || '';
    s.className = 'nb-auth-status' + (kind ? ' is-' + kind : '');
  }

  function rerender() {
    if (!dlg) return;
    var wasOpen = false;
    try { wasOpen = dlg.open; } catch (e) { wasOpen = dlg.hasAttribute('open'); }
    dlg.innerHTML = shellHtml();
    bind(dlg);
    if (wasOpen) show(dlg);
  }

  function bind(el) {
    if (!el || el.__delegated) return;
    el.__delegated = true;

    el.addEventListener('click', function (e) {
      if (e.target === el) { closeBox(); return; }
      var closeBtn = e.target.closest ? e.target.closest('[data-close]') : null;
      if (closeBtn) { closeBox(); return; }
      var act = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!act) return;
      var a = act.getAttribute('data-act');
      if (a === 'toggle') {
        mode = mode === 'up' ? 'in' : 'up';
        rerender();
        setTimeout(function () { var f = $('#nb-auth-email'); if (f) f.focus(); }, 30);
      } else if (a === 'eye-pwd') {
        togglePwd(act);
      } else if (a === 'save-name') {
        doSaveName();
      } else if (a === 'sync') {
        doSync();
      } else if (a === 'resend') {
        doResend();
      } else if (a === 'back') {
        mode = 'in';
        rerender();
        setTimeout(function () { var f = $('#nb-auth-email'); if (f) { f.value = pendingEmail || ''; f.focus(); } }, 30);
      } else if (a === 'restore') {
        doRestore();
      } else if (a === 'wipe') {
        doWipe();
      } else if (a === 'out') {
        doSignOut();
      }
    });

    el.addEventListener('submit', function (e) {
      if (!e.target || e.target.id !== 'nb-auth-form') return;
      e.preventDefault();
      doSubmit();
    });
  }

  /* ---------------- 动作 ---------------- */
  /* 切换密码明文 / 掩码：保留光标位置与输入内容，按钮进入「显示中」状态 */
  function togglePwd(btn) {
    var inp = $('#nb-auth-password');
    if (!inp) return;
    var show = inp.type === 'password';
    var start = null, end = null;
    try { start = inp.selectionStart; end = inp.selectionEnd; } catch (e) { /* 老内核 */ }
    inp.type = show ? 'text' : 'password';
    try {
      if (start != null) inp.setSelectionRange(start, end != null ? end : start);
    } catch (e) { /* 老内核 */ }
    var label = show ? T('hidePwd') : T('showPwd');
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  /* 保存账号名：必须联网，由服务端校验唯一性；成功后论坛历史署名同步 */
  function doSaveName() {
    if (busy) return;
    var C = cloud();
    if (!C || !C.account || typeof C.account.setName !== 'function') return;
    var inp = $('#nb-auth-name');
    var v = inp ? inp.value : '';
    if (!navigator.onLine) { setStatus(T('nameNeedNet'), 'err'); return; }
    busy = true;
    setStatus(T('busy'));
    var p;
    try {
      p = C.account.setName(v);
    } catch (e) {
      busy = false;
      setStatus(T('syncFail'), 'err');
      return;
    }
    Promise.resolve(p).then(function (r) {
      busy = false;
      if (!r || !r.ok) {
        var code = r && r.code;
        if (code === 'name_taken') setStatus(T('nameTaken'), 'err');
        else if (code === 'bad_name') setStatus(T('nameInvalid'), 'err');
        else if (code === 'network') setStatus(T('nameNeedNet'), 'err');
        else if (code === 'server_not_ready') setStatus(T('nameServer'), 'err');
        else if (code === 'auth') setStatus(T('nameAuth'), 'err');
        else setStatus((r && r.message) || T('syncFail'), 'err');
        return;
      }
      if (inp) inp.value = r.name || '';
      var view = $('#nb-auth-name-view');
      if (view) view.textContent = r.display || r.name || '';
      setStatus(r.cleared ? T('nameCleared') : T('nameSaved'), 'ok');
      syncVisual();
    });
  }

  function doSubmit() {
    if (busy) return;
    var C = cloud();
    if (!C) return;
    var emailEl = $('#nb-auth-email');
    var pwdEl = $('#nb-auth-password');
    var email = emailEl ? emailEl.value.trim() : '';
    var pwd = pwdEl ? pwdEl.value : '';

    if (!email || email.indexOf('@') < 1) { setStatus(T('errEmail'), 'err'); return; }
    if (pwd.length < 6) { setStatus(T('errPwd'), 'err'); return; }
    if (!navigator.onLine) { setStatus(T('errNet'), 'err'); return; }

    busy = true;
    setStatus(T('busy'));
    var p = mode === 'up' ? C.signUp(email, pwd) : C.signIn(email, pwd);
    p.then(function (r) {
      busy = false;
      if (!r.ok) {
        if (r.code === 'off') { setStatus(T('offTitle'), 'err'); return; }
        setStatus(r.message || T('errNet'), 'err');
        return;
      }
      if (r.needsConfirm) {
        pendingEmail = email;
        mode = 'confirm';
        rerender();
        return;
      }
      if (r.code === 'confirm_needed') {
        pendingEmail = email;
        mode = 'confirm';
        rerender();
        setStatus(T('okConfirm'), 'err');
        return;
      }
      setStatus(T('okSigned'), 'ok');
      syncVisual();
      /* 本地数据已被云端合并，刷新页面让所有视图重绘（进度条 / 收藏角标 / 错题列表） */
      setTimeout(function () { location.reload(); }, 700);
    });
  }

  function doResend() {
    var C = cloud();
    if (!C) return;
    if (!pendingEmail) { setStatus(T('errEmail'), 'err'); return; }
    var left = Math.ceil((resendAt + 60000 - Date.now()) / 1000);
    if (left > 0) { setStatus(T('confirmCooldown').replace('{s}', String(left)), 'err'); return; }
    var btn = document.querySelector('[data-act="resend"]');
    if (btn) btn.disabled = true;
    setStatus(T('busy'));
    C.resendConfirm(pendingEmail).then(function (r) {
      if (btn) btn.disabled = false;
      if (!r || !r.ok) {
        if (r && r.code === 'off') { setStatus(T('offTitle'), 'err'); return; }
        setStatus((r && r.message) || T('errNet'), 'err');
        return;
      }
      resendAt = Date.now();
      setStatus(T('confirmResent'), 'ok');
    });
  }

  function doSync() {
    var C = cloud();
    if (!C) return;
    setStatus(T('syncing'));
    C.sync('merge').then(function (r) {
      syncVisual();
      if (r && r.ok) { setStatus(T('syncOk'), 'ok'); setTimeout(rerender, 500); }
      else setStatus(T('syncFail'), 'err');
    });
  }

  function doRestore() {
    var C = cloud();
    if (!C) return;
    setStatus(T('syncing'));
    C.sync('replace').then(function (r) {
      syncVisual();
      if (r && r.ok) { setStatus(T('restored'), 'ok'); setTimeout(function () { location.reload(); }, 600); }
      else setStatus(T('syncFail'), 'err');
    });
  }

  function doWipe() {
    var C = cloud();
    if (!C) return;
    if (!window.confirm(T('wipeConfirm'))) return;
    try {
      localStorage.removeItem('nb-progress');
      localStorage.removeItem('nb-favorites');
      localStorage.removeItem('nb-mistakes');
      localStorage.removeItem('nb-quiz-stats');
    } catch (e) { /* 忽略 */ }
    setStatus(T('wiped'), 'ok');
    setTimeout(function () { location.reload(); }, 600);
  }

  function doSignOut() {
    var C = cloud();
    if (!C) return;
    C.signOut().then(function () {
      syncVisual();
      closeBox();
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    whenHeader(function () {
      mountButton();
      var C = cloud();
      if (C && typeof C.on === 'function') {
        C.on(function (evt) {
          if (evt.type === 'session' || evt.type === 'sync' || evt.type === 'status') {
            syncVisual();
            if (dlg && (dlg.open || dlg.hasAttribute('open'))) rerender();
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* 注册后进入「验证邮箱」提示卡（自测也走这里） */
  function showConfirmView(email) {
    pendingEmail = String(email || '');
    mode = 'confirm';
    var el = ensureDlg();
    el.innerHTML = shellHtml();
    bind(el);
    show(el);
    return el;
  }

  /* 供自测 */
  window.NB = window.NB || {};
  window.NB.authUI = {
    open: openBox,
    close: closeBox,
    mode: function () { return mode; },
    mount: mountButton,
    confirmView: showConfirmView
  };
})();
