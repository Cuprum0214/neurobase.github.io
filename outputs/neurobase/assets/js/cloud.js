/* ============================================================================
   NeuroBase · 云端接入层 cloud.js（普通脚本，零依赖，file:// 双击可用）

   职责：
     1. Auth      —— 邮箱注册 / 登录 / 登出 / 会话持久化 / access_token 自动续期
     2. REST      —— 对 Supabase PostgREST 的最小封装（select / upsert / delete）
     3. 同步引擎  —— 本地 localStorage ⇄ 云端双向合并，登录后换设备可恢复
     4. Realtime  —— 订阅本人数据变更（WebSocket），失败静默回退到轮询
     5. 降级      —— 未配置 / 未登录 / 断网 / 服务不可用：一律不抛错、不影响离线功能

   依赖：
     cloud-config.js（window.NB_CLOUD = { url, anonKey, workerUrl, realtime }）
     core.js（window.NB.progress）、learn.js（window.NB.learn）

   本地键：nb-cloud-session（会话）、nb-cloud-meta（同步时间）
   云端表：profiles / user_progress / user_favorites / user_mistakes /
           user_quiz_stats / sr_cards

   合并策略（重要，改动前先读）：
     · 首次登录 → merge：进度 / 收藏 / 错题取并集，测验统计取 max，绝不清空任何一边
     · 之后每次改动 → mirror：本地为权威，云端做全量 upsert + 删除多余行
     · 收到 Realtime 变更 → mergePull：只并入云端新增，不删除本地
   ============================================================================ */
(function () {
  'use strict';

  var CFG = window.NB_CLOUD || {};
  var SESSION_KEY = 'nb-cloud-session';
  var META_KEY = 'nb-cloud-meta';
  var PROGRESS_KEY = 'nb-progress';
  var FAVORITES_KEY = 'nb-favorites';
  var MISTAKES_KEY = 'nb-mistakes';
  var QUIZ_KEY = 'nb-quiz-stats';
  var REFRESH_SKEW = 90 * 1000;      /* 提前 90 秒续期 */
  var SYNC_DEBOUNCE = 1200;
  var POLL_MS = 180000;

  var listeners = [];
  var syncing = false;
  var pending = 0;
  var timer = null;
  var pollTimer = null;
  var ws = null;
  var wsTries = 0;
  var wsRef = 0;
  var lastError = '';

  /* ---------------- 基础工具 ---------------- */
  function readLS(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function writeLS(key, v) { try { localStorage.setItem(key, v); return true; } catch (e) { return false; } }
  function delLS(key) { try { localStorage.removeItem(key); } catch (e) { /* 忽略 */ } }
  function readJSON(key, fallback) {
    try {
      var raw = readLS(key);
      if (raw == null) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function nowIso() { return new Date().toISOString(); }
  function trimSlash(u) { return String(u || '').replace(/\/+$/, ''); }

  function enabled() {
    return !!CFG && CFG.enabled !== false &&
      /^https?:\/\//.test(String(CFG.url || '')) &&
      String(CFG.anonKey || '').length > 20;
  }
  function workerUrl() { return trimSlash(CFG.workerUrl || ''); }
  function baseRest() { return trimSlash(CFG.url) + '/rest/v1'; }
  function baseAuth() { return trimSlash(CFG.url) + '/auth/v1'; }
  function anonKey() { return String(CFG.anonKey || ''); }
  /* Supabase 2025 新密钥体系：publishable key 只放 apikey 头，不做 Bearer token */
  function isPublishable() { return /^sb_publishable_/.test(anonKey()); }

  /* ---------------- 事件 ---------------- */
  function on(fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }
  function emit(type, detail) {
    var evt = { type: type, detail: detail || null, at: nowIso() };
    listeners.slice().forEach(function (fn) {
      try { fn(evt); } catch (e) { /* 监听方异常不得影响同步 */ }
    });
  }

  /* ---------------- 会话 ---------------- */
  function session() {
    var s = readJSON(SESSION_KEY, null);
    if (!s || !s.access_token) return null;
    return s;
  }
  function setSession(data) {
    if (!data || !data.access_token) return null;
    var prev = session();
    var user = data.user || (prev && prev.user) || null;
    if (!user && data.access_token) {
      /* Supabase 在 refresh 时也返回 user；缺失则保留旧的 */
      user = prev ? prev.user : null;
    }
    var s = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || (prev && prev.refresh_token) || '',
      expires_at: Date.now() + (Number(data.expires_in || 3600) * 1000),
      user: user ? { id: user.id, email: user.email || '' } : null
    };
    writeJSON(SESSION_KEY, s);
    emit('session', { signedIn: true, user: s.user });
    return s;
  }
  function clearSession() {
    delLS(SESSION_KEY);
    stopRealtime();
    stopPolling();
    emit('session', { signedIn: false, user: null });
  }
  function user() {
    var s = session();
    return s && s.user ? s.user : null;
  }
  function uid() {
    var u = user();
    return u ? u.id : '';
  }
  function isAuthed() { return !!session(); }

  /**
   * 云端可用状态：
   *   'off'    —— 未配置（纯离线，正常）
   *   'anon'   —— 已配置但未登录（可提交反馈）
   *   'authed' —— 已登录（可同步）
   */
  function status() {
    if (!enabled()) return 'off';
    return isAuthed() ? 'authed' : 'anon';
  }
  function lastErrorText() { return lastError; }

  /* ---------------- 底层请求 ---------------- */
  function http(url, opts) {
    if (typeof fetch !== 'function') {
      /* 极旧内核 / 无 fetch 环境：按网络失败降级，不抛错中断调用方 */
      return Promise.resolve({ ok: false, status: 0, data: null, error: 'fetch_unavailable' });
    }
    var o = opts || {};
    var headers = {
      apikey: anonKey(),
      'Content-Type': 'application/json'
    };
    if (o.token) headers.Authorization = 'Bearer ' + o.token;
    else if (!isPublishable()) headers.Authorization = 'Bearer ' + anonKey();
    if (o.headers) {
      Object.keys(o.headers).forEach(function (k) { headers[k] = o.headers[k]; });
    }
    var init = { method: o.method || 'GET', headers: headers, mode: 'cors', cache: 'no-store' };
    if (o.body !== undefined && o.body !== null) {
      init.body = typeof o.body === 'string' ? o.body : JSON.stringify(o.body);
    }
    return fetch(url, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        if (text) {
          try { data = JSON.parse(text); } catch (e) { data = text; }
        }
        return { ok: res.ok, status: res.status, data: data };
      });
    }).catch(function (err) {
      return { ok: false, status: 0, data: null, error: String(err && err.message || err) };
    });
  }

  function pickError(res) {
    var d = res && res.data;
    if (d && d.error) {
      if (typeof d.error === 'string') return d.error;
      return d.error.message || d.error.code || JSON.stringify(d.error);
    }
    if (d && d.message) return d.message;
    if (res && res.error) return res.error;
    return 'http_' + (res ? res.status : 0);
  }

  /* ---------------- 认证 ---------------- */
  function authRequest(path, body, token) {
    return http(baseAuth() + path, { method: 'POST', body: body, token: token || '' });
  }

  function signUp(email, password) {
    if (!enabled()) return Promise.resolve({ ok: false, code: 'off', message: '云端未配置' });
    return authRequest('/signup', { email: String(email || '').trim(), password: String(password || '') })
      .then(function (res) {
        if (!res.ok) {
          var msg = pickError(res);
          return { ok: false, code: 'signup_failed', message: msg };
        }
        /* 若项目关闭了「邮箱确认」，signup 直接返回 session */
        if (res.data && res.data.access_token) {
          setSession(res.data);
          return { ok: true, needsConfirm: false, user: user() };
        }
        return { ok: true, needsConfirm: true, user: null };
      });
  }

  /** 重发注册确认邮件（Supabase: POST /auth/v1/resend, type=signup） */
  function resendConfirm(email) {
    if (!enabled()) return Promise.resolve({ ok: false, code: 'off', message: '云端未配置' });
    var addr = String(email || '').trim();
    if (!addr || addr.indexOf('@') < 1) {
      return Promise.resolve({ ok: false, code: 'bad_email', message: '邮箱格式不正确' });
    }
    return authRequest('/resend', { type: 'signup', email: addr }).then(function (res) {
      if (!res.ok) return { ok: false, code: 'resend_failed', message: pickError(res) };
      return { ok: true };
    });
  }

  /* 未验证邮箱时 Supabase 返回 400 + "Email not confirmed" */
  function isConfirmError(msg) {
    return /email[\s_-]*not[\s_-]*confirmed?/i.test(String(msg || ''));
  }

  function signIn(email, password) {
    if (!enabled()) return Promise.resolve({ ok: false, code: 'off', message: '云端未配置' });
    return authRequest('/token?grant_type=password', {
      email: String(email || '').trim(),
      password: String(password || '')
    }).then(function (res) {
      if (!res.ok) {
        var msg = pickError(res);
        return { ok: false, code: isConfirmError(msg) ? 'confirm_needed' : 'signin_failed', message: msg };
      }
      setSession(res.data);
      startRealtime();
      startPolling();
      return sync('merge').then(function (r) {
        return { ok: true, user: user(), sync: r };
      });
    });
  }

  function signOut() {
    var s = session();
    clearSession();
    if (!s) return Promise.resolve({ ok: true });
    return authRequest('/logout', {}, s.access_token).then(function () { return { ok: true }; });
  }

  function refreshToken() {
    var s = session();
    if (!s || !s.refresh_token) return Promise.resolve(false);
    return authRequest('/token?grant_type=refresh_token', { refresh_token: s.refresh_token }).then(function (res) {
      if (!res.ok || !res.data || !res.data.access_token) {
        /* refresh_token 失效：清档，回到未登录，不报错 */
        clearSession();
        return false;
      }
      setSession(res.data);
      return true;
    });
  }

  function ensureToken() {
    var s = session();
    if (!s) return Promise.resolve('');
    if (s.expires_at && s.expires_at - Date.now() > REFRESH_SKEW) {
      return Promise.resolve(s.access_token);
    }
    return refreshToken().then(function (ok) {
      var s2 = session();
      return ok && s2 ? s2.access_token : '';
    });
  }

  /* ---------------- PostgREST ---------------- */
  function restGet(table, query) {
    if (!enabled() || !isAuthed()) return Promise.resolve({ ok: false, code: 'off', rows: [] });
    return ensureToken().then(function (token) {
      if (!token) return { ok: false, code: 'no_token', rows: [] };
      var url = baseRest() + '/' + table + (query ? '?' + query : '');
      return http(url, { token: token }).then(function (res) {
        if (!res.ok) return { ok: false, code: 'rest_failed', message: pickError(res), rows: [] };
        return { ok: true, rows: Array.isArray(res.data) ? res.data : [] };
      });
    });
  }

  function restUpsert(table, rows, onConflict) {
    if (!enabled() || !isAuthed() || !rows || !rows.length) {
      return Promise.resolve({ ok: true, skipped: true });
    }
    return ensureToken().then(function (token) {
      if (!token) return { ok: false, code: 'no_token' };
      var q = onConflict ? '?on_conflict=' + encodeURIComponent(onConflict) : '';
      return http(baseRest() + '/' + table + q, {
        method: 'POST',
        token: token,
        body: rows,
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }
      }).then(function (res) {
        if (!res.ok) return { ok: false, code: 'upsert_failed', message: pickError(res) };
        return { ok: true, count: rows.length };
      });
    });
  }

  function restDelete(table, query) {
    if (!enabled() || !isAuthed()) return Promise.resolve({ ok: true, skipped: true });
    return ensureToken().then(function (token) {
      if (!token) return { ok: false, code: 'no_token' };
      return http(baseRest() + '/' + table + (query ? '?' + query : ''), {
        method: 'DELETE',
        token: token,
        headers: { Prefer: 'return=minimal' }
      }).then(function (res) {
        if (!res.ok) return { ok: false, code: 'delete_failed', message: pickError(res) };
        return { ok: true };
      });
    });
  }

  /* ---------------- 用户偏好（profiles.prefs，跨设备） ---------------- */
  var PREFS_KEY = 'nb-cloud-prefs';
  var prefsCache = null;

  function localPrefs() {
    var v = readJSON(PREFS_KEY, {});
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  }

  function prefsSnapshot() {
    if (!prefsCache) prefsCache = localPrefs();
    return prefsCache;
  }

  /* 读单个偏好：本地缓存优先，离线时照样可用 */
  function prefGet(key, fallback) {
    var p = prefsSnapshot();
    return Object.prototype.hasOwnProperty.call(p, key) ? p[key] : fallback;
  }

  /* 从云端拉全量偏好，云端值覆盖本地（本地独有的键保留） */
  function pullPrefs() {
    if (!enabled() || !isAuthed()) return Promise.resolve({ ok: false, code: 'off' });
    return restGet('profiles', 'select=prefs&limit=1').then(function (r) {
      if (!r.ok) return { ok: false, code: r.code || 'rest_failed', message: r.message };
      if (!r.rows.length) return { ok: false, code: 'no_row' };
      var remote = r.rows[0].prefs;
      if (!remote || typeof remote !== 'object') return { ok: true, prefs: prefsSnapshot() };
      var merged = prefsSnapshot();
      Object.keys(remote).forEach(function (k) { merged[k] = remote[k]; });
      prefsCache = merged;
      writeJSON(PREFS_KEY, merged);
      emit('prefs', merged);
      return { ok: true, prefs: merged };
    });
  }

  /* 写单个偏好：本地立即生效，登录态下再推云端（失败只记 lastError） */
  function prefSet(key, value) {
    var p = prefsSnapshot();
    p[key] = value;
    prefsCache = p;
    writeJSON(PREFS_KEY, p);
    if (!enabled() || !isAuthed() || !uid()) return Promise.resolve({ ok: true, local: true });
    return ensureToken().then(function (token) {
      if (!token) return { ok: false, code: 'no_token' };
      return http(baseRest() + '/profiles?id=eq.' + encodeURIComponent(uid()) + '&select=id', {
        method: 'PATCH',
        token: token,
        body: { prefs: p },
        headers: { Prefer: 'return=representation' }
      }).then(function (res) {
        if (!res.ok) {
          lastError = pickError(res);
          return { ok: false, code: 'prefs_failed', message: lastError };
        }
        if (Array.isArray(res.data) && res.data.length) return { ok: true, synced: true };
        /* 档案行还没建（少见）：补一次 upsert */
        return restUpsert('profiles', [{ id: uid(), prefs: p }], 'id').then(function (r2) {
          return r2.ok ? { ok: true, synced: true, created: true } : r2;
        });
      });
    });
  }

  /* ---------------- 账号名（profiles.display_name，全站唯一） ----------------
     唯一性由数据库唯一索引 + account_set_name() RPC 保证，客户端不做本地抢占。
     本机只缓存服务端值（prefs.displayName），离线时用于显示；改名必须联网。
     改名成功后把论坛历史署名一并更新（云端 PATCH + 本机标记 + 事件）。 */
  var NAME_MAX = 24;
  var FORUM_RENAME_KEY = 'nb-forum-rename';

  function normalizeAccountName(name) {
    var v = String(name == null ? '' : name)
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    /* 按 Unicode 码点截断，避免把 emoji 的代理对切开 */
    if (typeof Array.from === 'function') {
      var chars = Array.from(v);
      if (chars.length > NAME_MAX) v = chars.slice(0, NAME_MAX).join('');
    } else if (v.length > NAME_MAX) {
      v = v.slice(0, NAME_MAX);
    }
    return v;
  }

  /* 展示用账号名：自定义名优先，否则用邮箱前缀 */
  function accountName() {
    if (!isAuthed()) return '';
    var v = normalizeAccountName(prefGet('displayName', ''));
    if (v) return v;
    var u = user();
    if (u && u.email) return String(u.email).split('@')[0];
    return '';
  }

  /* 输入框回填用：只返回用户真正保存过的名字（不含邮箱前缀回退） */
  function accountStored() {
    return normalizeAccountName(prefGet('displayName', ''));
  }

  /* 只写本地缓存；服务端值由 RPC / refreshAccountName 提供 */
  function cacheAccountName(name) {
    var p = prefsSnapshot();
    if (name) p.displayName = name;
    else delete p.displayName;
    prefsCache = p;
    writeJSON(PREFS_KEY, p);
  }

  /* 从服务端读权威账号名；列未部署 / 离线时保留本地缓存 */
  function refreshAccountName() {
    if (!enabled() || !isAuthed() || !uid()) return Promise.resolve({ ok: false, code: 'off' });
    return restGet('profiles', 'select=display_name&limit=1').then(function (r) {
      if (!r.ok || !r.rows.length) return { ok: false, code: r.code || 'rest_failed' };
      var dn = normalizeAccountName(r.rows[0].display_name || '');
      var prev = accountStored();
      cacheAccountName(dn);
      if (dn !== prev) emit('account', { name: dn, display: accountName() });
      return { ok: true, name: dn };
    }, function () { return { ok: false, code: 'network' }; });
  }

  /* 写论坛改名标记；社区页在线时通过事件立即消费，不在线时下次进入社区页消费 */
  function queueForumRename(from, to, userId) {
    var payload = {
      from: String(from || ''),
      to: String(to || ''),
      userId: String(userId || ''),
      at: Date.now()
    };
    writeJSON(FORUM_RENAME_KEY, payload);
    try {
      if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('nb:account-name', { detail: payload }));
      }
    } catch (e) { /* 事件不可用则等社区页读取标记 */ }
  }

  /* 保存账号名：必须登录且联网；空字符串表示清除自定义名（回退邮箱前缀） */
  function setAccountName(name) {
    var v = normalizeAccountName(name);
    if (!enabled()) return Promise.resolve({ ok: false, code: 'off', message: '云端未配置' });
    if (!isAuthed() || !uid()) return Promise.resolve({ ok: false, code: 'auth', message: '请先登录' });
    var prev = accountName();
    function fail(code, message) { return { ok: false, code: code, message: message || '' }; }
    return rpc('account_set_name', { p_name: v }).then(function (res) {
      if (!res.ok) {
        var msg = String(res.message || '');
        if (res.status === 404 || /could not find the function|schema cache/i.test(msg)) {
          return fail('server_not_ready', msg);
        }
        if (res.status === 0 || /fetch|network/i.test(msg)) return fail('network', msg);
        return fail(res.code || 'rpc_failed', msg);
      }
      var data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!data || data.ok !== true) {
        var code = data && data.code ? String(data.code) : 'rpc_failed';
        if (code === 'name_taken') return fail('name_taken', '该账号名已被使用');
        if (code === 'bad_name') return fail('bad_name', '账号名需为 1–24 个字符');
        if (code === 'auth') return fail('auth', '登录已过期，请重新登录');
        return fail(code, (data && data.message) || '账号名保存失败');
      }
      var saved = normalizeAccountName(data.name != null ? data.name : v);
      cacheAccountName(saved);
      var display = accountName();
      var myId = String(uid() || '');
      /* 云端历史帖子 / 回复已由 account_set_name() 同一事务回填；这里只处理本机 */
      queueForumRename(prev, display, myId);
      emit('account', { name: saved, display: display });
      return { ok: true, name: saved, display: display, synced: true, cleared: !saved };
    }, function () {
      return fail('network', '网络异常，账号名未保存');
    });
  }

  /* ---------------- 本地数据读取 ---------------- */
  function localProgressIds() {
    var p = readJSON(PROGRESS_KEY, {});
    var ids = [];
    if (Array.isArray(p)) ids = p;
    else if (p && Array.isArray(p.visited)) ids = p.visited;
    var seen = {};
    return ids.map(String).filter(function (id) {
      if (!id || seen[id]) return false;
      seen[id] = 1;
      return true;
    });
  }
  function localFavorites() {
    var v = readJSON(FAVORITES_KEY, []);
    return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  }
  function localMistakes() {
    var v = readJSON(MISTAKES_KEY, []);
    return Array.isArray(v) ? v.filter(function (x) { return x && x.id; }) : [];
  }
  function localQuiz() {
    var v = readJSON(QUIZ_KEY, null);
    var n = function (x) { return Math.max(0, Number(x) || 0); };
    if (!v || typeof v !== 'object') return { taken: 0, correct: 0, wrong: 0 };
    return { taken: n(v.taken), correct: n(v.correct), wrong: n(v.wrong) };
  }

  function summary() {
    return {
      progress: localProgressIds().length,
      favorites: localFavorites().length,
      mistakes: localMistakes().length,
      quiz: localQuiz(),
      lastSyncAt: (readJSON(META_KEY, {}) || {}).lastSyncAt || '',
      pending: pending,
      syncing: syncing
    };
  }

  /* ---------------- 本地写回（合并结果落地） ---------------- */
  function saveProgressIds(ids) {
    writeJSON(PROGRESS_KEY, { visited: ids.slice(0, 500), updatedAt: nowIso() });
  }
  function saveFavorites(ids) {
    writeJSON(FAVORITES_KEY, ids.slice(0, 100));
  }
  function saveMistakes(list) {
    writeJSON(MISTAKES_KEY, list.slice(0, 200));
  }
  function saveQuiz(q) {
    writeJSON(QUIZ_KEY, { taken: q.taken, correct: q.correct, wrong: q.wrong });
  }

  /* ---------------- 云端 → 本地 ---------------- */
  function rowToMistake(r) {
    return {
      id: r.id,
      termId: r.term_id || '',
      source: r.source || '',
      at: r.created_at || nowIso(),
      prompt: r.prompt || '',
      yourAnswer: r.your_answer || '',
      correctAnswer: r.correct_answer || ''
    };
  }

  /**
   * 拉取云端全量（四张表并行）
   * 返回 { progress: [], favorites: [], mistakes: [], quiz: null }
   */
  function pull() {
    if (!enabled() || !isAuthed()) {
      return Promise.resolve({ ok: false, code: 'off' });
    }
    var u = uid();
    var q = 'user_id=eq.' + encodeURIComponent(u);
    return Promise.all([
      restGet('user_progress', q + '&select=term_id,visits,last_seen_at&limit=500'),
      restGet('user_favorites', q + '&select=term_id,created_at&limit=200'),
      restGet('user_mistakes', q + '&select=id,term_id,source,prompt,your_answer,correct_answer,created_at&limit=500'),
      restGet('user_quiz_stats', q + '&select=taken,correct,wrong,updated_at&limit=1')
    ]).then(function (rs) {
      var anyFail = rs.filter(function (r) { return !r.ok; })[0];
      if (anyFail) {
        lastError = anyFail.message || anyFail.code || 'pull_failed';
        return { ok: false, code: 'pull_failed', message: lastError };
      }
      return {
        ok: true,
        progress: rs[0].rows,
        favorites: rs[1].rows,
        mistakes: rs[2].rows,
        quiz: rs[3].rows[0] || null
      };
    });
  }

  /**
   * 把云端数据并入本地（并集，本地多的保留）
   * mode='replace' 时改为云端覆盖（仅用于用户主动「从云端恢复」）
   */
  function mergeIntoLocal(remote, mode) {
    var replace = mode === 'replace';

    /* 进度：保持本地「最近访问在前」的顺序，云端新增按 last_seen_at 倒序追加 */
    var localIds = localProgressIds();
    var byId = {};
    localIds.forEach(function (id) { byId[id] = 1; });
    var remoteIds = (remote.progress || [])
      .slice()
      .sort(function (a, b) { return String(b.last_seen_at || '').localeCompare(String(a.last_seen_at || '')); })
      .map(function (r) { return String(r.term_id || ''); })
      .filter(Boolean);
    var mergedIds = replace ? remoteIds.filter(function (id, i, arr) { return arr.indexOf(id) === i; })
      : localIds.concat(remoteIds.filter(function (id) { return !byId[id]; }));
    saveProgressIds(mergedIds.filter(function (id, i, arr) { return arr.indexOf(id) === i; }));

    /* 收藏：并集；replace 时以云端为准 */
    var localFav = localFavorites();
    var remoteFav = (remote.favorites || []).map(function (r) { return String(r.term_id || ''); }).filter(Boolean);
    var fav = replace ? remoteFav : localFav.concat(remoteFav.filter(function (id) { return localFav.indexOf(id) < 0; }));
    saveFavorites(fav.filter(function (id, i, arr) { return arr.indexOf(id) === i; }));

    /* 错题：按 id 去重；云端补本地没有的，本地已有的保持原文 */
    var localMis = localMistakes();
    var seen = {};
    localMis.forEach(function (m) { seen[m.id] = 1; });
    var extra = (remote.mistakes || []).map(rowToMistake).filter(function (m) { return m.id && !seen[m.id]; });
    var mis = replace ? (remote.mistakes || []).map(rowToMistake) : localMis.concat(extra);
    saveMistakes(mis);

    /* 测验统计：取 max，避免重复登录把次数翻倍 */
    var lq = localQuiz();
    var rq = remote.quiz || {};
    saveQuiz(replace ? {
      taken: Number(rq.taken) || 0,
      correct: Number(rq.correct) || 0,
      wrong: Number(rq.wrong) || 0
    } : {
      taken: Math.max(lq.taken, Number(rq.taken) || 0),
      correct: Math.max(lq.correct, Number(rq.correct) || 0),
      wrong: Math.max(lq.wrong, Number(rq.wrong) || 0)
    });

    return summary();
  }

  /* ---------------- 本地 → 云端（mirror） ---------------- */
  function buildRows() {
    var u = uid();
    if (!u) return null;
    var ids = localProgressIds();
    var now = nowIso();
    var progress = ids.map(function (id, i) {
      /* 本地只有顺序没有逐条时间：用「越靠前越近」折算，最小间隔 1 分钟 */
      var t = new Date(Date.now() - i * 60000).toISOString();
      return { user_id: u, term_id: id, visits: 1, first_seen_at: t, last_seen_at: t };
    });
    var favorites = localFavorites().map(function (id) {
      return { user_id: u, term_id: id, created_at: now, updated_at: now };
    });
    var mistakes = localMistakes().map(function (m) {
      return {
        user_id: u,
        id: String(m.id).slice(0, 64),
        term_id: m.termId ? String(m.termId).slice(0, 80) : null,
        source: m.source ? String(m.source).slice(0, 40) : null,
        prompt: m.prompt ? String(m.prompt).slice(0, 300) : null,
        your_answer: m.yourAnswer ? String(m.yourAnswer).slice(0, 200) : null,
        correct_answer: m.correctAnswer ? String(m.correctAnswer).slice(0, 200) : null,
        created_at: m.at || now,
        updated_at: now
      };
    });
    var q = localQuiz();
    return {
      progress: progress,
      favorites: favorites,
      mistakes: mistakes,
      quiz: { user_id: u, taken: q.taken, correct: q.correct, wrong: q.wrong, updated_at: now }
    };
  }

  function inList(ids) {
    return ids.map(function (id) { return '"' + String(id).replace(/"/g, '') + '"'; }).join(',');
  }

  /** 全量推送：upsert 本地全部 + 删除云端多余行 */
  function push() {
    if (!enabled() || !isAuthed()) return Promise.resolve({ ok: false, code: 'off' });
    var rows = buildRows();
    if (!rows) return Promise.resolve({ ok: false, code: 'no_user' });
    var u = encodeURIComponent(uid());

    return Promise.all([
      restUpsert('user_progress', rows.progress, 'user_id,term_id'),
      restUpsert('user_favorites', rows.favorites, 'user_id,term_id'),
      restUpsert('user_mistakes', rows.mistakes, 'user_id,id'),
      restUpsert('user_quiz_stats', [rows.quiz], 'user_id')
    ]).then(function (ups) {
      var fail = ups.filter(function (r) { return !r.ok; })[0];
      if (fail) {
        lastError = fail.message || fail.code || 'push_failed';
        return { ok: false, code: 'push_failed', message: lastError };
      }

      /* 删除云端「本地已不存在」的行（mirror）；空集合则删本用户全部 */
      var pIds = rows.progress.map(function (r) { return r.term_id; });
      var fIds = rows.favorites.map(function (r) { return r.term_id; });
      var mIds = rows.mistakes.map(function (r) { return r.id; });
      var pq = 'user_id=eq.' + u + (pIds.length ? '&term_id=not.in.(' + inList(pIds) + ')' : '');
      var fq = 'user_id=eq.' + u + (fIds.length ? '&term_id=not.in.(' + inList(fIds) + ')' : '');
      var mq = 'user_id=eq.' + u + (mIds.length ? '&id=not.in.(' + inList(mIds) + ')' : '');

      return Promise.all([
        restDelete('user_progress', pq),
        restDelete('user_favorites', fq),
        restDelete('user_mistakes', mq)
      ]).then(function () { return { ok: true, count: rows.progress.length + rows.favorites.length + rows.mistakes.length }; });
    });
  }

  /* ---------------- 同步编排 ---------------- */
  /**
   * sync('merge')  —— 拉云端并入本地，再整体推送（登录 / 手动同步）
   * sync('push')   —— 只推送（本地改动后）
   * sync('pull')   —— 只拉取并入（Realtime / 轮询）
   * sync('replace')—— 云端覆盖本地（用户主动恢复）
   */
  function sync(mode) {
    var m = mode || 'merge';
    if (!enabled() || !isAuthed()) return Promise.resolve({ ok: false, code: 'off' });
    if (syncing) return Promise.resolve({ ok: false, code: 'busy' });

    syncing = true;
    pending = 0;
    emit('sync', { phase: 'start', mode: m });

    var chain;
    if (m === 'push') chain = push();
    else if (m === 'pull') chain = pull().then(function (r) {
      if (!r.ok) return r;
      mergeIntoLocal(r, 'merge');
      emit('data', { source: 'remote' });
      return { ok: true, mode: 'pull' };
    });
    else if (m === 'replace') chain = pull().then(function (r) {
      if (!r.ok) return r;
      mergeIntoLocal(r, 'replace');
      emit('data', { source: 'remote', replace: true });
      return { ok: true, mode: 'replace' };
    });
    else chain = pull().then(function (r) {
      if (!r.ok) return r;
      mergeIntoLocal(r, 'merge');
      emit('data', { source: 'merge' });
      return push();
    });

    return chain.then(function (r) {
      syncing = false;
      if (r && r.ok) {
        var meta = readJSON(META_KEY, {}) || {};
        meta.lastSyncAt = nowIso();
        writeJSON(META_KEY, meta);
        lastError = '';
      }
      emit('sync', { phase: 'end', mode: m, result: r || null, error: lastError });
      return r || { ok: false, code: 'unknown' };
    }).catch(function (err) {
      syncing = false;
      lastError = String(err && err.message || err);
      emit('sync', { phase: 'end', mode: m, error: lastError });
      return { ok: false, code: 'exception', message: lastError };
    });
  }

  function scheduleSync() {
    if (!enabled() || !isAuthed()) return;
    pending += 1;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      if (!navigator.onLine) return;       /* 断网：保留 pending，联网后补推 */
      sync('push');
    }, SYNC_DEBOUNCE);
  }

  /* ---------------- Realtime（失败静默回退轮询） ---------------- */
  function stopRealtime() {
    if (ws) {
      try { ws.close(); } catch (e) { /* 忽略 */ }
      ws = null;
    }
  }

  function startRealtime() {
    if (!enabled() || !isAuthed() || CFG.realtime === false) return;
    if (typeof WebSocket === 'undefined') return;
    if (ws) return;

    var u = uid();
    var url = trimSlash(CFG.url).replace(/^http/, 'ws') +
      '/realtime/v1/websocket?apikey=' + encodeURIComponent(anonKey()) + '&vsn=1.0.0';
    var tables = ['user_progress', 'user_favorites', 'user_mistakes', 'sr_cards'];
    try {
      ws = new WebSocket(url);
    } catch (e) {
      ws = null;
      return;
    }

    var heartbeat = null;

    ws.onopen = function () {
      wsTries = 0;
      tables.forEach(function (table) {
        wsRef += 1;
        try {
          ws.send(JSON.stringify({
            topic: 'realtime:public:' + table,
            event: 'phx_join',
            payload: {
              config: {
                broadcast: { self: false },
                presence: { key: '' },
                postgres_changes: [{ event: '*', schema: 'public', table: table, filter: 'user_id=eq.' + u }]
              }
            },
            ref: String(wsRef)
          }));
        } catch (e) { /* 单表订阅失败不影响其他表 */ }
      });
      heartbeat = setInterval(function () {
        wsRef += 1;
        try { ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(wsRef) })); }
        catch (e) { /* 忽略 */ }
      }, 25000);
    };

    ws.onmessage = function (msg) {
      var data = null;
      try { data = JSON.parse(msg.data); } catch (e) { return; }
      if (!data) return;
      if (data.event === 'postgres_changes' || data.event === 'INSERT' || data.event === 'UPDATE' || data.event === 'DELETE') {
        schedulePull();
      }
    };

    ws.onclose = function () {
      if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
      ws = null;
      if (!enabled() || !isAuthed()) return;
      wsTries += 1;
      if (wsTries <= 3) {
        setTimeout(function () { if (!ws) startRealtime(); }, 4000 * wsTries);
      }
    };

    ws.onerror = function () { /* onclose 统一处理 */ };
  }

  var pullTimer = null;
  function schedulePull() {
    if (pullTimer) return;
    pullTimer = setTimeout(function () {
      pullTimer = null;
      if (!enabled() || !isAuthed() || syncing) return;
      sync('pull');
    }, 800);
  }

  function startPolling() {
    if (pollTimer || !enabled()) return;
    pollTimer = setInterval(function () {
      if (document.visibilityState === 'visible' && isAuthed() && !syncing) sync('pull');
    }, POLL_MS);
  }
  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  /* ---------------- 挂钩本地写操作 ---------------- */
  function hookLocalWrites() {
    var L = window.NB && window.NB.learn;
    if (L && !L.__cloudHooked) {
      L.__cloudHooked = true;
      if (L.mistakes) {
        var mAdd = L.mistakes.add, mRemove = L.mistakes.remove, mClear = L.mistakes.clear;
        L.mistakes.add = function (rec) { var r = mAdd.apply(null, arguments); scheduleSync(); return r; };
        L.mistakes.remove = function (id) { var r = mRemove.apply(null, arguments); scheduleSync(); return r; };
        L.mistakes.clear = function () { var r = mClear.apply(null, arguments); scheduleSync(); return r; };
      }
      if (L.favorites) {
        var fToggle = L.favorites.toggle;
        L.favorites.toggle = function (id) { var r = fToggle.apply(null, arguments); scheduleSync(); return r; };
      }
      if (L.quiz) {
        var qRecord = L.quiz.record;
        L.quiz.record = function () { var r = qRecord.apply(null, arguments); scheduleSync(); return r; };
      }
    }

    var P = window.NB && window.NB.progress;
    if (P && !P.__cloudHooked) {
      P.__cloudHooked = true;
      var pVisit = P.visit, pClear = P.clear;
      P.visit = function (id) { var r = pVisit.apply(null, arguments); scheduleSync(); return r; };
      P.clear = function () { var r = pClear.apply(null, arguments); scheduleSync(); return r; };
    }
  }

  /* ---------------- 在线/离线与页面切换 ---------------- */
  function bindNetwork() {
    window.addEventListener('online', function () {
      if (enabled() && isAuthed()) {
        sync(pending > 0 ? 'push' : 'pull');
        refreshAccountName();
      }
    });
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && enabled() && isAuthed() && !syncing) {
        var meta = readJSON(META_KEY, {}) || {};
        if (!meta.lastSyncAt || Date.now() - new Date(meta.lastSyncAt).getTime() > 60000) sync('pull');
      }
    });
  }

  /* ---------------- 反馈箱 RPC（在线模式，供 feedback.js 调用） ---------------- */
  function rpc(name, args) {
    if (!enabled()) return Promise.resolve({ ok: false, code: 'off' });
    return ensureToken().then(function (token) {
      return http(baseRest() + '/rpc/' + name, {
        method: 'POST',
        token: token || '',
        body: args || {}
      }).then(function (res) {
        if (!res.ok) {
          var msg = pickError(res);
          var code = 'rpc_failed';
          if (res.status === 429 || /rate_limited/i.test(msg)) code = 'rate_limited';
          return { ok: false, code: code, message: msg, status: res.status };
        }
        return { ok: true, data: res.data };
      });
    });
  }

  /* ---------------- AI 助教（转发到 Worker） ---------------- */
  function askTutor(payload) {
    var base = workerUrl();
    if (!base) return Promise.resolve({ ok: false, code: 'off', message: 'AI 助教未配置' });
    /* 兼容两种后端：Cloudflare Worker（…/api/tutor）与 Supabase Edge Function（…/functions/v1/<slug>） */
    var isEdge = /\/functions\/v1\//.test(base);
    var url = isEdge ? base : base + '/api/tutor';
    var body = {
      question: String((payload && payload.question) || '').slice(0, 600),
      locale: (payload && payload.locale) === 'en' ? 'en' : 'zh',
      context: String((payload && payload.context) || '').slice(0, 2000),
      history: Array.isArray(payload && payload.history) ? payload.history.slice(-6) : []
    };
    var init = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    };
    /* Supabase Functions 网关要求 apikey；Cloudflare Worker 不需要，加了也无害 */
    if (isEdge && CFG.anonKey) init.headers.apikey = CFG.anonKey;
    return fetch(url, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) {
          var msg = data && data.error ? (data.error.message || data.error.code) : ('http_' + res.status);
          return { ok: false, code: (data && data.error && data.error.code) || 'tutor_failed', message: msg };
        }
        return {
          ok: true,
          answer: (data && data.answer) || '',
          model: (data && data.model) || '',
          disclaimer: (data && data.disclaimer) || ''
        };
      });
    }).catch(function (err) {
      return { ok: false, code: 'network', message: String(err && err.message || err) };
    });
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    if (!enabled()) {
      emit('status', { status: 'off' });
      return;
    }
    hookLocalWrites();
    bindNetwork();
    if (isAuthed()) {
      /* 后台续期 + 静默同步，不阻塞页面 */
      ensureToken().then(function () { return sync('merge'); }).then(function () {
        return refreshAccountName();
      }).then(function () {
        startRealtime();
        startPolling();
      });
    }
    emit('status', { status: status() });
  }

  window.NB = window.NB || {};
  window.NB.cloud = {
    /* 状态 */
    enabled: enabled,
    status: status,
    configured: enabled,
    isAuthed: isAuthed,
    user: user,
    session: session,
    summary: summary,
    lastError: lastErrorText,
    workerUrl: workerUrl,
    /* 认证 */
    signUp: signUp,
    signIn: signIn,
    resendConfirm: resendConfirm,
    signOut: signOut,
    refresh: refreshToken,
    /* 数据 */
    pull: pull,
    push: push,
    sync: sync,
    mergeIntoLocal: mergeIntoLocal,
    scheduleSync: scheduleSync,
    select: restGet,
    upsert: restUpsert,
    del: restDelete,
    /* 能力 */
    rpc: rpc,
    askTutor: askTutor,
    prefs: { get: prefGet, set: prefSet, pull: pullPrefs },
    account: { name: accountName, stored: accountStored, setName: setAccountName, refresh: refreshAccountName },
    on: on,
    /* 供自测注入 */
    _internals: {
      SESSION_KEY: SESSION_KEY,
      META_KEY: META_KEY,
      PREFS_KEY: PREFS_KEY,
      prefGet: prefGet,
      prefSet: prefSet,
      pullPrefs: pullPrefs,
      accountName: accountName,
      setAccountName: setAccountName,
      refreshAccountName: refreshAccountName,
      localProgressIds: localProgressIds,
      localFavorites: localFavorites,
      localMistakes: localMistakes,
      localQuiz: localQuiz,
      buildRows: buildRows,
      mergeIntoLocal: mergeIntoLocal,
      summary: summary,
      setSession: setSession,
      clearSession: clearSession,
      pickError: pickError
    }
  };

  /* 脚本顺序保证 core/learn 已就绪；再兜底等 DOMContentLoaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
