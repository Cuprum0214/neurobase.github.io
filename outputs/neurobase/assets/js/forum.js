/* ============================================================================
   NeuroBase · 学习社区论坛数据层（普通脚本，file:// 双击打开也能运行）
   ----------------------------------------------------------------------------
   模型（localStorage 为权威，离线可用；云端可用时做 best-effort 同步）：
     nb-community-posts   帖子数组（含回复、点赞、收藏、举报、置顶/精华/隐藏）
     nb-community-reports 举报流水（与帖子内 reports 同步，兼容旧版键名）
     nb-forum-bans        禁言名单
     nb-community-author  本机作者身份（沿用旧键，升级不丢身份）

   设计要点：
     · 所有读写都做容错，任何一条脏数据不会让整页白屏。
     · 旧版（内嵌 replies + reports）记录可直接读取，字段按需补齐。
     · 云端（Supabase）缺表 / 未登录 / 断网时自动停留在「本机模式」，
       不阻塞任何本地功能；建表后可无缝升级为多人实时（见 docs/supabase/community-v2.sql）。
   对外：window.NB.forum
   ============================================================================ */
(function () {
  'use strict';

  var NB = window.NB || {};
  var POSTS_KEY = 'nb-community-posts';
  var REPORTS_KEY = 'nb-community-reports';
  var BANS_KEY = 'nb-forum-bans';
  var AUTHOR_KEY = 'nb-community-author';
  var ADMIN_KEY = 'nb-admin-unlocked';
  var RENAME_KEY = 'nb-forum-rename';
  var LIMIT_POSTS = 500;
  var LIMIT_REPLIES = 200;
  var PAGE_SIZE = 20;
  var MAX_TITLE = 80;
  var MAX_BODY = 2000;
  var MAX_REPLY = 1000;
  var MAX_AUTHOR = 24;

  var listeners = [];
  var channel = null;
  var adminSecret = ''; /* 仅内存保存，用于云端管理 RPC；刷新页面后需重新输入 */
  var cloud = { state: 'idle', mode: 'local', reason: '', pulledAt: 0, timer: null, ws: null, wsRef: 0, tries: 0 };

  /* ---------------- 基础工具 ---------------- */
  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function trim(v, max) {
    var s = String(v == null ? '' : v).replace(/\r\n/g, '\n').replace(/\u0000/g, '').trim();
    if (max && s.length > max) s = s.slice(0, max);
    return s;
  }
  function uid(prefix) {
    var rnd = Math.random().toString(36).slice(2, 8);
    return (prefix || 'x') + Date.now().toString(36) + rnd;
  }
  function nowIso() { return new Date().toISOString(); }
  function asArray(v) { return Array.isArray(v) ? v : []; }
  function esc(s) { return typeof NB.esc === 'function' ? NB.esc(s) : String(s == null ? '' : s); }
  function emit(evt) {
    listeners.slice().forEach(function (fn) {
      try { fn(evt); } catch (e) { /* 单个订阅者异常不影响其它 */ }
    });
  }

  /* ---------------- 身份 ---------------- */
  function authorState() {
    var st = readJSON(AUTHOR_KEY, null);
    if (!st || typeof st !== 'object' || !st.id) {
      st = { id: uid('u-'), name: '', at: nowIso() };
      writeJSON(AUTHOR_KEY, st);
    }
    return { id: String(st.id), name: String(st.name || '') };
  }
  function authorId() { return authorState().id; }
  /* 登录后以账号名为准（未设置时回退邮箱前缀）；未登录用本机昵称 */
  function accountName() {
    try {
      var C = window.NB && window.NB.cloud;
      if (C && C.account && typeof C.account.name === 'function') {
        return String(C.account.name() || '');
      }
    } catch (e) { /* 云层未加载 */ }
    return '';
  }
  function authorName() {
    var st = authorState();
    return accountName() || st.name || ('学习者 ' + st.id.slice(-4).toUpperCase());
  }
  function setAuthorName(name) {
    var st = authorState();
    st.name = trim(name, 16);
    writeJSON(AUTHOR_KEY, st);
    emit({ type: 'identity' });
    return st.name;
  }
  function resetIdentity() {
    writeJSON(AUTHOR_KEY, { id: uid('u-'), name: '', at: nowIso() });
    emit({ type: 'identity' });
  }

  /* ---------------- 账号改名：历史署名回填 ----------------
     帖子 / 回复里的作者名是发布时的快照。账号名变化后：
       · 本机：按本机身份 id、云账号 id、旧署名（仅补无 id 的老数据）回填；
       · 云端：由 cloud.js 直接 PATCH 本人 posts / replies；
       · 跨页面：cloud.js 写 nb-forum-rename 标记，社区页加载时消费。 */
  function ownAuthorIds(extra) {
    var ids = {};
    ids[authorId()] = 1;
    try {
      var C = window.NB && window.NB.cloud;
      var u = C && typeof C.user === 'function' ? C.user() : null;
      if (u && u.id) ids[String(u.id)] = 1;
    } catch (e) { /* 云层未加载 */ }
    (extra || []).forEach(function (x) { if (x) ids[String(x)] = 1; });
    return ids;
  }

  function renameAuthor(name, meta) {
    var nm = trim(name, MAX_AUTHOR);
    if (!nm) return 0;
    var m = meta || {};
    var ids = ownAuthorIds([m.userId, m.localId]);
    var from = String(m.from || '');
    var list = loadPosts();
    var changed = 0;
    list.forEach(function (p) {
      var mine = !!ids[p.authorId] || (!p.authorId && !!from && p.author === from);
      if (mine && p.author !== nm) { p.author = nm; changed++; }
      p.replies.forEach(function (r) {
        var mineR = !!ids[r.authorId] || (!r.authorId && !!from && r.author === from);
        if (mineR && r.author !== nm) { r.author = nm; changed++; }
      });
    });
    if (changed) savePosts(list);
    var bl = bans();
    var bc = 0;
    bl.forEach(function (b) {
      if (ids[b.key] && b.name !== nm) { b.name = nm; bc++; }
    });
    if (bc) writeJSON(BANS_KEY, bl);
    if (changed || bc) emit({ type: 'identity', renamed: changed + bc });
    return changed + bc;
  }

  function applyPendingRename() {
    var m = readJSON(RENAME_KEY, null);
    if (!m || typeof m !== 'object' || !m.to) return;
    renameAuthor(m.to, m);
    try { window.localStorage.removeItem(RENAME_KEY); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 帖子读写 ---------------- */
  function normalizeReply(r, postId) {
    if (!r || typeof r !== 'object') return null;
    var id = String(r.id || '');
    if (!id) return null;
    return {
      id: id,
      postId: postId || String(r.postId || ''),
      author: String(r.author || ''),
      authorId: String(r.authorId || ''),
      createdAt: String(r.createdAt || r.created_at || nowIso()),
      body: trim(r.body, MAX_REPLY),
      hidden: !!r.hidden,
      likes: asArray(r.likes).map(String),
      reports: asArray(r.reports),
      replyTo: String(r.replyTo || '')
    };
  }
  function normalizePost(p) {
    if (!p || typeof p !== 'object') return null;
    var id = String(p.id || '');
    if (!id) return null;
    var title = trim(p.title, MAX_TITLE);
    if (!title) return null;
    var replies = asArray(p.replies).map(function (r) { return normalizeReply(r, id); }).filter(Boolean);
    return {
      id: id,
      title: title,
      body: trim(p.body, MAX_BODY),
      module: String(p.module || ''),
      author: String(p.author || ''),
      authorId: String(p.authorId || ''),
      createdAt: String(p.createdAt || p.created_at || nowIso()),
      updatedAt: String(p.updatedAt || p.updated_at || p.createdAt || p.created_at || nowIso()),
      hidden: !!p.hidden,
      pinned: !!p.pinned,
      featured: !!p.featured,
      locked: !!p.locked,
      likes: asArray(p.likes).map(String),
      favs: asArray(p.favs).map(String),
      reports: asArray(p.reports),
      replies: replies.slice(-LIMIT_REPLIES)
    };
  }
  function loadPosts() {
    var raw = readJSON(POSTS_KEY, []);
    var list = asArray(raw).map(normalizePost).filter(Boolean);
    return list;
  }
  function savePosts(list) {
    var out = list.slice(0, LIMIT_POSTS);
    writeJSON(POSTS_KEY, out);
    return out;
  }
  function findPost(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* ---------------- 禁言 ---------------- */
  function bans() {
    return asArray(readJSON(BANS_KEY, []))
      .filter(function (b) { return b && (b.key || b.id); })
      .map(function (b) {
        return {
          key: String(b.key || b.id),
          name: String(b.name || ''),
          until: String(b.until || ''),
          reason: String(b.reason || ''),
          at: String(b.at || '')
        };
      });
  }
  function banActive(b) {
    if (!b) return false;
    if (!b.until) return true;
    return new Date(b.until).getTime() > Date.now();
  }
  function activeBans() { return bans().filter(banActive); }
  function banOf(key) {
    var list = activeBans();
    for (var i = 0; i < list.length; i++) if (list[i].key === String(key)) return list[i];
    return null;
  }
  function isBanned(key) { return !!banOf(key || authorId()); }
  function setBan(key, name, days, reason) {
    var k = String(key || '');
    if (!k) return { ok: false, code: 'key' };
    var d = Number(days);
    var until = d > 0 ? new Date(Date.now() + d * 86400000).toISOString() : '';
    var list = bans().filter(function (b) { return b.key !== k; });
    list.unshift({ key: k, name: String(name || ''), until: until, reason: trim(reason, 100), at: nowIso() });
    writeJSON(BANS_KEY, list.slice(0, 200));
    if (adminSecret) adminRpc('ban', { p_key: k, p_name: String(name || ''), p_days: d || 0, p_reason: trim(reason, 100) });
    emit({ type: 'moderation' });
    cloudGuard();
    return { ok: true, until: until };
  }
  function clearBan(key) {
    var k = String(key || '');
    writeJSON(BANS_KEY, bans().filter(function (b) { return b.key !== k; }));
    if (adminSecret) adminRpc('unban', { p_key: k });
    emit({ type: 'moderation' });
    cloudGuard();
    return { ok: true };
  }

  /* ---------------- 管理员会话 ---------------- */
  function adminOn() {
    try { return window.sessionStorage.getItem(ADMIN_KEY) === '1'; } catch (e) { return false; }
  }
  function adminUnlock(pass) {
    var pass_ = String(pass == null ? '' : pass).trim();
    var good = typeof NB.adminCheck === 'function' ? NB.adminCheck(pass_) : false;
    if (!good) return { ok: false, code: 'pass' };
    try { window.sessionStorage.setItem(ADMIN_KEY, '1'); } catch (e) { /* 隐私模式忽略 */ }
    adminSecret = pass_;
    emit({ type: 'admin', on: true });
    return { ok: true };
  }
  function adminLock() {
    try { window.sessionStorage.removeItem(ADMIN_KEY); } catch (e) { /* 忽略 */ }
    adminSecret = '';
    emit({ type: 'admin', on: false });
    return { ok: true };
  }

  /* ---------------- 业务：发帖 / 回帖 ---------------- */
  function canSpeak() {
    if (adminOn()) return { ok: true };
    var ban = banOf(authorId());
    if (ban) return { ok: false, code: 'banned', ban: ban };
    return { ok: true };
  }
  function tooFast() {
    var list = loadPosts();
    var me = authorId();
    var now = Date.now();
    var recent = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].authorId !== me) continue;
      if (now - new Date(list[i].createdAt).getTime() < 20000) recent++;
    }
    return recent >= 3;
  }
  function addPost(input) {
    var speak = canSpeak();
    if (!speak.ok) return speak;
    var title = trim(input && input.title, MAX_TITLE);
    var body = trim(input && input.body, MAX_BODY);
    if (!title) return { ok: false, code: 'title' };
    if (!body) return { ok: false, code: 'body' };
    if (tooFast()) return { ok: false, code: 'fast' };
    var post = normalizePost({
      id: uid('q'),
      title: title,
      body: body,
      module: trim(input && input.module, 24),
      author: trim(input && input.name, MAX_AUTHOR) || authorName(),
      authorId: authorId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      likes: [], favs: [], reports: [], replies: []
    });
    if (input && input.name) setAuthorName(input.name);
    var list = loadPosts();
    list.unshift(post);
    savePosts(list);
    emit({ type: 'post', action: 'add', id: post.id });
    cloudWritePost(post);
    return { ok: true, post: post };
  }

  function addReply(postId, body, replyTo) {
    var speak = canSpeak();
    if (!speak.ok) return speak;
    var text = trim(body, MAX_REPLY);
    if (!text) return { ok: false, code: 'body' };
    var list = loadPosts();
    var post = findPost(list, String(postId || ''));
    if (!post) return { ok: false, code: 'missing' };
    if (post.locked && !adminOn()) return { ok: false, code: 'locked' };
    if (post.hidden && !adminOn()) return { ok: false, code: 'hidden' };
    var reply = normalizeReply({
      id: uid('r'),
      postId: post.id,
      author: authorName(),
      authorId: authorId(),
      createdAt: nowIso(),
      body: text,
      replyTo: String(replyTo || '')
    }, post.id);
    post.replies.push(reply);
    if (post.replies.length > LIMIT_REPLIES) post.replies = post.replies.slice(-LIMIT_REPLIES);
    post.updatedAt = nowIso();
    savePosts(list);
    emit({ type: 'reply', action: 'add', id: post.id, replyId: reply.id });
    cloudWriteReply(reply);
    return { ok: true, reply: reply, count: post.replies.length };
  }

  /* ---------------- 业务：删除 / 隐藏 / 置顶 ---------------- */
  function canManage(post) {
    return adminOn() || (post && post.authorId && post.authorId === authorId());
  }
  function removePost(id) {
    var list = loadPosts();
    var post = findPost(list, String(id || ''));
    if (!post) return { ok: false, code: 'missing' };
    if (!canManage(post)) return { ok: false, code: 'forbidden' };
    savePosts(list.filter(function (p) { return p.id !== post.id; }));
    emit({ type: 'post', action: 'remove', id: post.id });
    if (adminSecret && adminOn()) adminRpc('delete_post', { p_id: post.id });
    else cloudDelete('community_posts', 'id=eq.' + encodeURIComponent(post.id));
    return { ok: true };
  }
  function removeReply(postId, replyId) {
    var list = loadPosts();
    var post = findPost(list, String(postId || ''));
    if (!post) return { ok: false, code: 'missing' };
    var reply = null;
    for (var i = 0; i < post.replies.length; i++) if (post.replies[i].id === String(replyId)) reply = post.replies[i];
    if (!reply) return { ok: false, code: 'missing' };
    if (!adminOn() && reply.authorId !== authorId() && !canManage(post)) return { ok: false, code: 'forbidden' };
    post.replies = post.replies.filter(function (r) { return r.id !== reply.id; });
    post.updatedAt = nowIso();
    savePosts(list);
    emit({ type: 'reply', action: 'remove', id: post.id, replyId: reply.id });
    if (adminSecret && adminOn() && reply.authorId !== authorId()) adminRpc('delete_reply', { p_id: reply.id });
    else cloudDelete('community_replies', 'id=eq.' + encodeURIComponent(reply.id));
    return { ok: true };
  }
  function patchPost(id, patch) {
    var list = loadPosts();
    var post = findPost(list, String(id || ''));
    if (!post) return { ok: false, code: 'missing' };
    if (!adminOn()) return { ok: false, code: 'forbidden' };
    Object.keys(patch || {}).forEach(function (k) { post[k] = patch[k]; });
    post.updatedAt = nowIso();
    savePosts(list);
    emit({ type: 'post', action: 'patch', id: post.id });
    cloudPatchPost(post, patch);
    return { ok: true, post: post };
  }
  function hidePost(id, hidden) { return patchPost(id, { hidden: !!hidden }); }
  function pinPost(id, pinned) { return patchPost(id, { pinned: !!pinned }); }
  function featurePost(id, featured) { return patchPost(id, { featured: !!featured }); }
  function lockPost(id, locked) { return patchPost(id, { locked: !!locked }); }
  function hideReply(postId, replyId, hidden) {
    if (!adminOn()) return { ok: false, code: 'forbidden' };
    var list = loadPosts();
    var post = findPost(list, String(postId || ''));
    if (!post) return { ok: false, code: 'missing' };
    var hit = null;
    post.replies.forEach(function (r) { if (r.id === String(replyId)) hit = r; });
    if (!hit) return { ok: false, code: 'missing' };
    hit.hidden = !!hidden;
    savePosts(list);
    emit({ type: 'reply', action: 'patch', id: post.id, replyId: hit.id });
    cloudPatchReply(hit, { hidden: !!hidden });
    return { ok: true };
  }

  /* ---------------- 业务：点赞 / 收藏 ---------------- */
  function toggleIn(arr, value) {
    var i = arr.indexOf(value);
    if (i >= 0) { arr.splice(i, 1); return false; }
    arr.push(value);
    return true;
  }
  function like(postId) {
    var speak = canSpeak();
    if (!speak.ok) return speak;
    var list = loadPosts();
    var post = findPost(list, String(postId || ''));
    if (!post) return { ok: false, code: 'missing' };
    var on = toggleIn(post.likes, authorId());
    post.updatedAt = nowIso();
    savePosts(list);
    emit({ type: 'post', action: 'like', id: post.id });
    cloudReaction(post.id, 'like', on);
    return { ok: true, on: on, count: post.likes.length };
  }
  function likeReply(postId, replyId) {
    var speak = canSpeak();
    if (!speak.ok) return speak;
    var list = loadPosts();
    var post = findPost(list, String(postId || ''));
    if (!post) return { ok: false, code: 'missing' };
    var hit = null;
    post.replies.forEach(function (r) { if (r.id === String(replyId)) hit = r; });
    if (!hit) return { ok: false, code: 'missing' };
    var on = toggleIn(hit.likes, authorId());
    savePosts(list);
    emit({ type: 'reply', action: 'like', id: post.id, replyId: hit.id });
    cloudReaction(hit.id, 'like', on);
    return { ok: true, on: on, count: hit.likes.length };
  }
  function fav(postId) {
    var speak = canSpeak();
    if (!speak.ok) return speak;
    var list = loadPosts();
    var post = findPost(list, String(postId || ''));
    if (!post) return { ok: false, code: 'missing' };
    var on = toggleIn(post.favs, authorId());
    post.updatedAt = nowIso();
    savePosts(list);
    emit({ type: 'post', action: 'fav', id: post.id });
    cloudReaction(post.id, 'fav', on);
    return { ok: true, on: on, count: post.favs.length };
  }

  /* ---------------- 业务：举报 ---------------- */
  function report(targetType, targetId, reason, note) {
    var type = targetType === 'reply' ? 'reply' : 'post';
    var id = String(targetId || '');
    if (!id) return { ok: false, code: 'missing' };
    var rec = {
      id: uid('rep'),
      targetType: type,
      targetId: id,
      reason: trim(reason, 40) || 'other',
      note: trim(note, 300),
      by: authorId(),
      at: nowIso()
    };
    var list = readJSON(REPORTS_KEY, []);
    list = asArray(list);
    list.unshift(rec);
    writeJSON(REPORTS_KEY, list.slice(0, 300));

    /* 帖子内冗余一份，列表页可直接显示「已举报」徽标 */
    var posts = loadPosts();
    var post = findPost(posts, type === 'post' ? id : '');
    if (type === 'reply') {
      posts.forEach(function (p) {
        p.replies.forEach(function (r) {
          if (r.id !== id) return;
          r.reports = asArray(r.reports);
          r.reports.push({ reason: rec.reason, note: rec.note, at: rec.at, by: rec.by });
          post = p;
        });
      });
    } else if (post) {
      post.reports = asArray(post.reports);
      post.reports.push({ reason: rec.reason, note: rec.note, at: rec.at, by: rec.by });
    }
    if (post) savePosts(posts);
    emit({ type: 'report', id: id, targetType: type });
    cloudReport(rec);
    return { ok: true, report: rec };
  }
  function reports() {
    return asArray(readJSON(REPORTS_KEY, [])).map(function (r) {
      return {
        id: String(r.id || ''),
        targetType: r.targetType === 'reply' ? 'reply' : 'post',
        targetId: String(r.targetId || ''),
        reason: String(r.reason || ''),
        note: String(r.note || ''),
        by: String(r.by || ''),
        at: String(r.at || '')
      };
    });
  }
  function clearReportsFor(targetId) {
    var id = String(targetId || '');
    writeJSON(REPORTS_KEY, reports().filter(function (r) { return r.targetId !== id; }));
    var posts = loadPosts();
    var changed = false;
    posts.forEach(function (p) {
      if (p.id === id && asArray(p.reports).length) { p.reports = []; changed = true; }
      p.replies.forEach(function (r) {
        if (r.id === id && asArray(r.reports).length) { r.reports = []; changed = true; }
      });
    });
    if (changed) savePosts(posts);
    if (adminSecret) adminRpc('clear_reports', { p_id: id });
    emit({ type: 'moderation' });
    return { ok: true };
  }

  /* ---------------- 查询 / 统计 ---------------- */
  function meta(post) {
    return {
      likes: asArray(post.likes).length,
      favs: asArray(post.favs).length,
      replies: asArray(post.replies).filter(function (r) { return !r.hidden; }).length,
      reports: asArray(post.reports).length
    };
  }
  function heat(post) {
    var m = meta(post);
    return m.likes * 3 + m.replies * 2 + m.favs * 3 + (post.featured ? 6 : 0);
  }
  function list(options) {
    var opt = options || {};
    var me = authorId();
    var q = trim(opt.query, 60).toLowerCase();
    var items = loadPosts();
    if (opt.scope === 'mine') items = items.filter(function (p) { return p.authorId === me; });
    if (opt.scope === 'favs') items = items.filter(function (p) { return p.favs.indexOf(me) >= 0; });
    if (opt.scope === 'featured') items = items.filter(function (p) { return p.featured; });
    if (opt.module) items = items.filter(function (p) { return p.module === opt.module; });
    if (opt.reported) items = items.filter(function (p) { return meta(p).reports > 0; });
    if (!opt.includeHidden && !adminOn()) items = items.filter(function (p) { return !p.hidden; });
    if (q) {
      items = items.filter(function (p) {
        return (p.title + '\n' + p.body + '\n' + p.author).toLowerCase().indexOf(q) >= 0;
      });
    }
    var order = opt.order || 'new';
    items.sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (order === 'hot') return heat(b) - heat(a);
      if (order === 'replies') return meta(b).replies - meta(a).replies;
      if (order === 'old') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    var page = Math.max(1, Number(opt.page) || 1);
    return {
      total: items.length,
      page: page,
      pageSize: PAGE_SIZE,
      hasMore: items.length > page * PAGE_SIZE,
      items: items.slice(0, page * PAGE_SIZE)
    };
  }
  function get(id) {
    var p = findPost(loadPosts(), String(id || ''));
    return p || null;
  }
  function stats() {
    var items = loadPosts();
    var visible = items.filter(function (p) { return !p.hidden; });
    var replyCount = 0;
    visible.forEach(function (p) { replyCount += meta(p).replies; });
    return {
      posts: visible.length,
      replies: replyCount,
      members: (function () {
        var set = {};
        visible.forEach(function (p) { if (p.authorId) set[p.authorId] = 1; });
        return Object.keys(set).length;
      })(),
      reports: reports().length,
      banned: activeBans().length
    };
  }
  function myFavs() { return loadPosts().filter(function (p) { return p.favs.indexOf(authorId()) >= 0; }); }

  /* ---------------- 云端（可选；失败静默） ---------------- */
  function cfg() {
    var c = window.NB_CLOUD || {};
    return {
      url: String(c.url || '').replace(/\/+$/, ''),
      key: String(c.anonKey || ''),
      realtime: c.realtime !== false
    };
  }
  function cloudReady() {
    var c = cfg();
    return !!(c.url && c.key);
  }
  function session() {
    try { return window.NB.cloud && window.NB.cloud.session ? window.NB.cloud.session() : null; }
    catch (e) { return null; }
  }
  function authed() {
    try { return !!(window.NB.cloud && window.NB.cloud.isAuthed && window.NB.cloud.isAuthed()); }
    catch (e) { return false; }
  }
  function token() {
    var s = session();
    return s && (s.access_token || s.token) ? String(s.access_token || s.token) : cfg().key;
  }
  function req(path, options) {
    var c = cfg();
    if (!c.url || !c.key) return Promise.resolve({ ok: false, code: 'off' });
    var opt = options || {};
    var headers = {
      apikey: c.key,
      Authorization: 'Bearer ' + (opt.auth ? token() : c.key)
    };
    if (opt.body != null) headers['Content-Type'] = 'application/json';
    if (opt.prefer) headers.Prefer = opt.prefer;
    var init = { method: opt.method || 'GET', headers: headers, mode: 'cors', cache: 'no-store' };
    if (opt.body != null) init.body = JSON.stringify(opt.body);
    return fetch(c.url + '/rest/v1/' + path, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        return { ok: res.ok, status: res.status, data: data, code: res.ok ? '' : 'http_' + res.status };
      });
    }).catch(function (err) {
      return { ok: false, code: 'network', message: String(err && err.message || err) };
    });
  }

  function setCloud(state, mode, reason) {
    var changed = cloud.state !== state || cloud.mode !== mode;
    cloud.state = state;
    cloud.mode = mode;
    cloud.reason = reason || '';
    if (changed) emit({ type: 'cloud', state: state, mode: mode });
  }

  function probe() {
    if (!cloudReady()) { setCloud('unavailable', 'local', 'noconfig'); return Promise.resolve(false); }
    if (cloud.state === 'ready') return Promise.resolve(true);
    return req('community_posts?select=id&limit=1').then(function (r) {
      if (r.ok) {
        setCloud('ready', 'cloud', '');
        return true;
      }
      /* 401/403：表在但 RLS 拒绝匿名读 → 仍可尝试登录后同步 */
      if (r.status === 401 || r.status === 403) { setCloud('ready', 'cloud', 'auth'); return true; }
      setCloud('unavailable', 'local', r.code || 'probe');
      return false;
    });
  }

  function mapRow(r) {
    return normalizePost({
      id: r.id,
      title: r.title,
      body: r.body,
      module: r.module,
      author: r.author,
      authorId: r.user_id || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at,
      hidden: r.hidden,
      pinned: r.pinned,
      featured: r.featured,
      locked: r.locked
    });
  }

  function pull() {
    if (!cloudReady()) return Promise.resolve({ ok: false, code: 'off' });
    return probe().then(function (ready) {
      if (!ready) return { ok: false, code: 'unavailable' };
      return req('community_posts?select=*&order=created_at.desc&limit=' + LIMIT_POSTS).then(function (pr) {
        if (!pr.ok || !Array.isArray(pr.data)) return { ok: false, code: pr.code || 'posts' };
        return req('community_replies?select=*&order=created_at.asc&limit=1000').then(function (rr) {
          var local = loadPosts();
          var byId = {};
          local.forEach(function (p) { byId[p.id] = p; });
          var added = 0;
          pr.data.forEach(function (row) {
            var remote = mapRow(row);
            if (!remote) return;
            var cur = byId[remote.id];
            if (!cur) { local.push(remote); byId[remote.id] = remote; added++; return; }
            /* 服务器字段为准，本地维护点赞/收藏/举报 */
            cur.title = remote.title;
            cur.body = remote.body;
            cur.module = remote.module;
            cur.hidden = remote.hidden;
            cur.pinned = remote.pinned;
            cur.featured = remote.featured;
            cur.locked = remote.locked;
            if (remote.author) cur.author = remote.author;
            cur.updatedAt = remote.updatedAt;
          });
          if (rr.ok && Array.isArray(rr.data)) {
            rr.data.forEach(function (row) {
              var post = byId[String(row.post_id || '')];
              if (!post) return;
              var rid = String(row.id || '');
              if (!rid) return;
              var exists = null;
              for (var j = 0; j < post.replies.length; j++) {
                if (post.replies[j].id === rid) { exists = post.replies[j]; break; }
              }
              if (exists) {
                /* 云端为权威：账号改名后旧回复也要跟着更新 */
                if (row.author && exists.author !== row.author) exists.author = row.author;
                return;
              }
              var rep = normalizeReply({
                id: rid, postId: post.id, author: row.author, authorId: row.user_id,
                createdAt: row.created_at, body: row.body, hidden: row.hidden
              }, post.id);
              if (rep) post.replies.push(rep);
            });
          }
          savePosts(local);
          /* 点赞 / 收藏与禁言名单：以服务器为准合并（拉取失败则保持本地） */
          return req('community_reactions?select=target_id,kind,user_id&limit=5000').then(function (rx) {
            if (rx.ok && Array.isArray(rx.data)) applyReactions(local, rx.data);
            return req('community_bans?select=*&limit=200');
          }).then(function (bx) {
            if (bx.ok && Array.isArray(bx.data)) mergeBans(bx.data);
            savePosts(local);
            cloud.pulledAt = Date.now();
            emit({ type: 'sync', added: added });
            return { ok: true, added: added };
          });
        });
      });
    }).catch(function () { return { ok: false, code: 'exception' }; });
  }

  function applyReactions(list, rows) {
    var me = authorId();
    var s = session();
    var myCloudId = s && s.user ? String(s.user.id || '') : '';
    var map = {};
    rows.forEach(function (r) {
      var k = String(r.target_id || '') + '|' + String(r.kind || '');
      if (!map[k]) map[k] = [];
      map[k].push(String(r.user_id || ''));
    });
    function pick(arr, kind, targetId) {
      var key = targetId + '|' + kind;
      if (!Object.prototype.hasOwnProperty.call(map, key)) return arr;
      return map[key].map(function (u) { return (myCloudId && u === myCloudId) ? me : u; });
    }
    list.forEach(function (p) {
      p.likes = pick(p.likes, 'like', p.id);
      p.favs = pick(p.favs, 'fav', p.id);
      p.replies.forEach(function (r) { r.likes = pick(r.likes, 'like', r.id); });
    });
  }

  function mergeBans(rows) {
    var remote = rows.map(function (r) {
      return {
        key: String(r.key || ''),
        name: String(r.name || ''),
        until: r.until ? String(r.until) : '',
        reason: String(r.reason || ''),
        at: String(r.created_at || '')
      };
    }).filter(function (b) { return !!b.key; });
    if (!remote.length) return;
    var local = bans();
    var seen = {};
    remote.forEach(function (b) { seen[b.key] = 1; });
    writeJSON(BANS_KEY, remote.concat(local.filter(function (b) { return !seen[b.key]; })));
  }

  function cloudWritePost(post) {
    if (!cloudReady()) return;
    cloudGuard();
    if (!authed()) return;
    var u = session();
    req('community_posts', {
      method: 'POST', auth: true, prefer: 'resolution=merge-duplicates',
      body: [{
        id: post.id,
        user_id: u && u.user ? u.user.id : null,
        author: post.author,
        title: post.title,
        body: post.body,
        module: post.module || null,
        hidden: false
      }]
    });
  }
  function cloudWriteReply(reply) {
    if (!cloudReady() || !authed()) return;
    var u = session();
    req('community_replies', {
      method: 'POST', auth: true, prefer: 'resolution=merge-duplicates',
      body: [{
        id: reply.id,
        post_id: reply.postId,
        user_id: u && u.user ? u.user.id : null,
        author: reply.author,
        body: reply.body
      }]
    });
  }
  function cloudPatchPost(post, patch) {
    if (!adminOn()) return;
    if (adminSecret && cloud.state === 'ready') {
      var map = {
        hidden: ['hide_post', 'unhide_post'],
        pinned: ['pin', 'unpin'],
        featured: ['feature', 'unfeature'],
        locked: ['lock', 'unlock']
      };
      Object.keys(patch || {}).forEach(function (k) {
        if (!map[k]) return;
        adminRpc(patch[k] ? map[k][0] : map[k][1], { p_id: post.id });
      });
      return;
    }
    if (!cloudReady() || !authed()) return;
    var body = {};
    ['hidden', 'pinned', 'featured', 'locked'].forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) body[k] = !!patch[k];
    });
    if (!Object.keys(body).length) return;
    req('community_posts?id=eq.' + encodeURIComponent(post.id), { method: 'PATCH', auth: true, body: body });
  }
  function cloudPatchReply(reply, patch) {
    if (!adminOn()) return;
    if (adminSecret && cloud.state === 'ready') {
      adminRpc(patch.hidden ? 'hide_reply' : 'unhide_reply', { p_id: reply.id });
      return;
    }
    if (!cloudReady() || !authed()) return;
    req('community_replies?id=eq.' + encodeURIComponent(reply.id), {
      method: 'PATCH', auth: true, body: { hidden: !!patch.hidden }
    });
  }
  function cloudDelete(table, query) {
    if (!cloudReady() || !authed()) return;
    req(table + '?' + query, { method: 'DELETE', auth: true });
  }
  function cloudReaction(targetId, kind, on) {
    if (!cloudReady() || !authed()) return;
    var u = session();
    var uid_ = u && u.user ? u.user.id : '';
    if (!uid_) return;
    if (on) {
      req('community_reactions', {
        method: 'POST', auth: true, prefer: 'resolution=merge-duplicates',
        body: [{ id: kind + ':' + targetId + ':' + uid_, target_id: targetId, kind: kind, user_id: uid_ }]
      });
    } else {
      req('community_reactions?target_id=eq.' + encodeURIComponent(targetId) +
        '&kind=eq.' + kind + '&user_id=eq.' + encodeURIComponent(uid_), { method: 'DELETE', auth: true });
    }
  }
  function cloudReport(rec) {
    if (!cloudReady() || !authed()) return;
    var u = session();
    req('community_reports', {
      method: 'POST', auth: true,
      body: [{
        id: rec.id, target_type: rec.targetType, target_id: rec.targetId,
        reason: rec.reason, note: rec.note || null,
        user_id: u && u.user ? u.user.id : null
      }]
    });
  }
  function cloudBan(ban) {
    if (!cloudReady() || !authed() || !ban) return;
    req('community_bans', {
      method: 'POST', auth: true, prefer: 'resolution=merge-duplicates',
      body: [{ key: ban.key, name: ban.name || null, until: ban.until || null, reason: ban.reason || null }]
    });
  }
  function cloudUnban(key) {
    if (!cloudReady() || !authed() || !key) return;
    req('community_bans?key=eq.' + encodeURIComponent(key), { method: 'DELETE', auth: true });
  }
  /* 管理动作：云端真正生效靠 RPC（函数内校验口令摘要），本机模式直接改 localStorage */
  function adminRpc(action, extra) {
    if (!cloudReady() || !adminSecret || cloud.state !== 'ready') return;
    var body = { p_pass: adminSecret, p_action: action };
    Object.keys(extra || {}).forEach(function (k) { body[k] = extra[k]; });
    req('rpc/community_admin', { method: 'POST', auth: true, body: body });
  }
  /* 云端表缺失时，写请求会 404；统一吞掉并回到本机模式提示 */
  function cloudGuard() {
    if (!cloudReady()) return;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(function () {
      if (cloud.state === 'ready') return;
      probe();
    }, 1500);
  }

  /* ---------------- 实时：本机跨标签 + 云端 Realtime ---------------- */
  function bindLocalRealtime() {
    try {
      window.addEventListener('storage', function (e) {
        if (!e || !e.key) return;
        if (e.key === RENAME_KEY) {
          /* 另一个标签页改了账号名：立即回填本机历史署名 */
          applyPendingRename();
          emit({ type: 'identity' });
          return;
        }
        if (e.key === POSTS_KEY || e.key === BANS_KEY || e.key === REPORTS_KEY) {
          emit({ type: 'storage', key: e.key });
        }
      });
    } catch (e) { /* 忽略 */ }
    try {
      if (typeof BroadcastChannel === 'function') {
        channel = new BroadcastChannel('nb-forum');
        channel.onmessage = function () { emit({ type: 'storage', key: POSTS_KEY }); };
      }
    } catch (e) { channel = null; }
  }
  function broadcast() {
    try { if (channel) channel.postMessage({ at: Date.now() }); } catch (e) { /* 忽略 */ }
  }

  function startRealtime() {
    if (!cloudReady() || !cfg().realtime) return;
    if (cloud.state !== 'ready') return;
    if (typeof WebSocket === 'undefined' || cloud.ws) return;
    var c = cfg();
    var url = c.url.replace(/^http/, 'ws') +
      '/realtime/v1/websocket?apikey=' + encodeURIComponent(c.key) + '&vsn=1.0.0';
    try { cloud.ws = new WebSocket(url); } catch (e) { cloud.ws = null; return; }
    var ws = cloud.ws;
    var beat = null;
    ws.onopen = function () {
      cloud.tries = 0;
      ['community_posts', 'community_replies', 'community_reactions'].forEach(function (table) {
        cloud.wsRef += 1;
        try {
          ws.send(JSON.stringify({
            topic: 'realtime:public:' + table,
            event: 'phx_join',
            payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: '*', schema: 'public', table: table }] } },
            ref: String(cloud.wsRef)
          }));
        } catch (e) { /* 忽略 */ }
      });
      beat = setInterval(function () {
        cloud.wsRef += 1;
        try { ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(cloud.wsRef) })); }
        catch (e) { /* 忽略 */ }
      }, 25000);
    };
    ws.onmessage = function (msg) {
      var data = null;
      try { data = JSON.parse(msg.data); } catch (e) { return; }
      if (!data) return;
      if (data.event === 'postgres_changes' || data.event === 'INSERT' || data.event === 'UPDATE' || data.event === 'DELETE') {
        clearTimeout(cloud.timer);
        cloud.timer = setTimeout(function () { pull(); }, 700);
      }
    };
    ws.onclose = function () {
      if (beat) { clearInterval(beat); beat = null; }
      cloud.ws = null;
      if (cloud.state !== 'ready' || cloud.tries >= 3) return;
      cloud.tries += 1;
      setTimeout(function () { if (!cloud.ws) startRealtime(); }, 5000 * cloud.tries);
    };
    ws.onerror = function () { /* onclose 统一处理 */ };
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* 写操作后广播给其它标签页，并（若已登录）把数据推到云端 */
  var rawAdd = addPost;
  addPost = function (input) {
    var r = rawAdd(input);
    if (r.ok) broadcast();
    return r;
  };
  var rawReply = addReply;
  addReply = function (a, b, c) {
    var r = rawReply(a, b, c);
    if (r.ok) broadcast();
    return r;
  };
  var rawLike = like;
  like = function (id) { var r = rawLike(id); if (r.ok) broadcast(); return r; };
  var rawFav = fav;
  fav = function (id) { var r = rawFav(id); if (r.ok) broadcast(); return r; };
  var rawReport = report;
  report = function (a, b, c, d) { var r = rawReport(a, b, c, d); if (r.ok) broadcast(); return r; };

  /* ---------------- 初始化 ---------------- */
  try {
    window.addEventListener('nb:account-name', function (e) {
      var d = e && e.detail ? e.detail : {};
      if (!d.to) return;
      renameAuthor(d.to, d);
      try { window.localStorage.removeItem(RENAME_KEY); } catch (e2) { /* 忽略 */ }
    });
  } catch (e) { /* 自定义事件不可用 */ }
  applyPendingRename();
  bindLocalRealtime();
  if (cloudReady()) {
    setTimeout(function () {
      probe().then(function (ready) {
        if (!ready) return;
        pull();
        startRealtime();
        setInterval(function () {
          if (document.visibilityState === 'visible' && cloud.state === 'ready') pull();
        }, 60000);
      });
    }, 900);
  } else {
    setCloud('unavailable', 'local', 'noconfig');
  }

  /* ---------------- 对外接口 ---------------- */
  window.NB = window.NB || {};
  window.NB.forum = {
    /* 身份 */
    authorId: authorId,
    authorName: authorName,
    setAuthorName: setAuthorName,
    resetIdentity: resetIdentity,
    renameAuthor: renameAuthor,
    /* 帖子 */
    list: list,
    get: get,
    add: addPost,
    reply: addReply,
    remove: removePost,
    removeReply: removeReply,
    hide: hidePost,
    pin: pinPost,
    feature: featurePost,
    lock: lockPost,
    hideReply: hideReply,
    /* 互动 */
    like: like,
    likeReply: likeReply,
    fav: fav,
    myFavs: myFavs,
    /* 举报 */
    report: report,
    reports: reports,
    clearReports: clearReportsFor,
    /* 管理 */
    admin: { on: adminOn, unlock: adminUnlock, lock: adminLock },
    bans: activeBans,
    isBanned: isBanned,
    ban: function (key, name, days, reason) {
      var r = setBan(key, name, days, reason);
      if (r.ok) cloudBan(banOf(key) || { key: key, name: name, until: r.until, reason: reason });
      return r;
    },
    unban: function (key) {
      var r = clearBan(key);
      if (r.ok) cloudUnban(key);
      return r;
    },
    /* 统计 / 辅助 */
    stats: stats,
    meta: meta,
    /* 实时 / 云 */
    subscribe: subscribe,
    cloud: {
      state: function () { return { state: cloud.state, mode: cloud.mode, reason: cloud.reason, pulledAt: cloud.pulledAt }; },
      probe: probe,
      pull: pull,
      authed: authed,
      enabled: cloudReady
    }
  };
})();
