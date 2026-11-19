/* ============================================================================
   NeuroBase · 社区与个性化公共层（普通脚本，非 ES module —— file:// 双击打开也能运行）
   提供：学习打卡（连续天数 / 7 日热力）、问答（发布 / 回答 / 举报 / 审核 / 删除）、
        每日活动统计（新词 / 测验）、学习目标与推荐所需数据。
   存储：localStorage 为权威（离线可用）；云层已配置且登录时做 best-effort 同步。
   依赖：core.js（window.NB）、learn.js（日期工具）、cloud.js（可选，window.NB.cloud）
   ============================================================================ */
(function () {
  'use strict';

  var NB = window.NB || {};
  var POSTS_KEY = 'nb-community-posts';
  var REPORTS_KEY = 'nb-community-reports';
  var CHECKIN_KEY = 'nb-checkin';
  var GOALS_KEY = 'nb-goals';
  var ACTIVITY_KEY = 'nb-activity';
  var AUTHOR_KEY = 'nb-community-author';
  var POST_LIMIT = 200;
  var ACTIVITY_KEEP = 180;

  /* ---------------- 基础工具 ---------------- */
  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function writeJSON(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dayStamp(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStamp() { return dayStamp(new Date()); }
  function addDays(stamp, n) {
    var d = new Date(stamp + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return dayStamp(d);
  }
  function nowIso() { return new Date().toISOString(); }
  function trim(s, max) { return String(s == null ? '' : s).replace(/\s+$/g, '').slice(0, max); }
  function uid(prefix) {
    return String(prefix || 'x') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  }
  function sortedDesc(list) {
    return list.slice().sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
  }

  /* ---------------- 云层（可选） ---------------- */
  function cloudReady() {
    return !!(NB.cloud && typeof NB.cloud.enabled === 'function' && NB.cloud.enabled());
  }
  function authed() {
    return !!(NB.cloud && typeof NB.cloud.isAuthed === 'function' && NB.cloud.isAuthed());
  }
  function cloudUser() {
    try { return (NB.cloud && NB.cloud.user && NB.cloud.user()) || null; } catch (e) { return null; }
  }
  function cloudUpsert(table, rows, conflict) {
    if (!cloudReady() || !authed() || !NB.cloud.upsert) return Promise.resolve({ ok: false, code: 'off' });
    try { return NB.cloud.upsert(table, rows, conflict); } catch (e) { return Promise.resolve({ ok: false, code: 'error' }); }
  }
  function cloudRows(table, query) {
    if (!cloudReady() || !authed() || !NB.cloud.select) return Promise.resolve({ ok: false, code: 'off', rows: [] });
    try { return NB.cloud.select(table, query); } catch (e) { return Promise.resolve({ ok: false, code: 'error', rows: [] }); }
  }

  /* ---------------- 本机身份（匿名但稳定） ---------------- */
  function authorId() {
    var v = readJSON(AUTHOR_KEY, null);
    if (v && typeof v === 'string') return v;
    v = uid('u');
    writeJSON(AUTHOR_KEY, v);
    return v;
  }
  function authorName() {
    var u = cloudUser();
    if (u && u.email) return String(u.email).split('@')[0];
    return '';
  }

  /* ================= 打卡 ================= */
  function checkinState() {
    var v = readJSON(CHECKIN_KEY, null);
    if (v && Array.isArray(v.days)) return { days: v.days.filter(Boolean), updatedAt: v.updatedAt || '' };
    return { days: [], updatedAt: '' };
  }
  function checkinSave(st) { writeJSON(CHECKIN_KEY, st); }
  function checkinToday() { return checkinState().days.indexOf(todayStamp()) >= 0; }

  /* 连续天数：今天已打卡从今天倒数；否则从昨天倒数（当天还没打卡不算断签） */
  function streakOf(days) {
    var set = {};
    days.forEach(function (d) { set[d] = 1; });
    var stamp = todayStamp();
    if (!set[stamp]) stamp = addDays(stamp, -1);
    var n = 0;
    while (set[stamp]) { n++; stamp = addDays(stamp, -1); }
    return n;
  }
  function streak() { return streakOf(checkinState().days); }
  function totalCheckins() { return checkinState().days.length; }
  function checkin() {
    var st = checkinState();
    var today = todayStamp();
    if (st.days.indexOf(today) >= 0) return { ok: false, code: 'already', streak: streakOf(st.days), total: st.days.length };
    st.days.push(today);
    st.days = st.days.slice().sort().reverse().slice(0, 400);
    st.updatedAt = nowIso();
    checkinSave(st);
    var u = cloudUser();
    cloudUpsert('community_checkins', [{ user_id: u ? u.id : null, day: today }], 'user_id,day');
    return { ok: true, streak: streakOf(st.days), total: st.days.length };
  }
  function weekCells() {
    var st = checkinState();
    var set = {};
    st.days.forEach(function (d) { set[d] = 1; });
    var out = [];
    var today = todayStamp();
    for (var i = 6; i >= 0; i--) {
      var stamp = addDays(today, -i);
      out.push({ stamp: stamp, done: !!set[stamp], today: stamp === today });
    }
    return out;
  }

  /* ================= 每日活动（新词 / 测验） ================= */
  function activityAll() {
    var v = readJSON(ACTIVITY_KEY, null);
    if (!v || typeof v !== 'object' || !v.days || typeof v.days !== 'object') return { days: {} };
    return v;
  }
  function activityPrune(a) {
    var keys = Object.keys(a.days).sort();
    while (keys.length > ACTIVITY_KEEP) { delete a.days[keys.shift()]; }
    return a;
  }
  function bump(kind) {
    var a = activityAll();
    var today = todayStamp();
    var row = a.days[today] || { terms: 0, quiz: 0 };
    if (kind === 'quiz') row.quiz += 1; else row.terms += 1;
    a.days[today] = row;
    activityPrune(a);
    writeJSON(ACTIVITY_KEY, a);
    return row;
  }
  function todayTerms() {
    var row = activityAll().days[todayStamp()];
    return row ? Number(row.terms) || 0 : 0;
  }
  function weekQuiz() {
    var a = activityAll();
    var n = 0;
    var today = todayStamp();
    for (var i = 0; i < 7; i++) {
      var row = a.days[addDays(today, -i)];
      if (row) n += Number(row.quiz) || 0;
    }
    return n;
  }

  /* ================= 学习目标 ================= */
  var DAILY_CHOICES = [3, 5, 10, 15];
  var WEEKLY_CHOICES = [1, 2, 3, 5];
  function goals() {
    var v = readJSON(GOALS_KEY, null) || {};
    var d = Number(v.dailyTerms);
    var q = Number(v.weeklyQuiz);
    return {
      dailyTerms: DAILY_CHOICES.indexOf(d) >= 0 ? d : 5,
      weeklyQuiz: WEEKLY_CHOICES.indexOf(q) >= 0 ? q : 2
    };
  }
  function setGoals(patch) {
    var next = goals();
    var d = Number(patch && patch.dailyTerms);
    var q = Number(patch && patch.weeklyQuiz);
    if (DAILY_CHOICES.indexOf(d) >= 0) next.dailyTerms = d;
    if (WEEKLY_CHOICES.indexOf(q) >= 0) next.weeklyQuiz = q;
    writeJSON(GOALS_KEY, next);
    return next;
  }

  /* ================= 问答：本机存储 ================= */
  function postsAll() {
    var list = readJSON(POSTS_KEY, []);
    if (!Array.isArray(list)) return [];
    return list.filter(function (p) { return p && p.id && p.title; }).map(function (p) {
      p.replies = Array.isArray(p.replies) ? p.replies : [];
      p.reports = Array.isArray(p.reports) ? p.reports : [];
      return p;
    });
  }
  function postsSave(list) { writeJSON(POSTS_KEY, sortedDesc(list).slice(0, POST_LIMIT)); }
  function posts() { return sortedDesc(postsAll()); }
  function getPost(id) {
    var list = postsAll();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function addPost(input) {
    var title = trim(input && input.title, 80);
    var body = trim(input && input.body, 1000);
    if (!title) return { ok: false, code: 'title' };
    if (!body) return { ok: false, code: 'body' };
    var post = {
      id: uid('q'),
      title: title,
      body: body,
      module: trim(input && input.module, 24),
      author: authorName(),
      authorId: authorId(),
      createdAt: nowIso(),
      hidden: false,
      replies: [],
      reports: []
    };
    postsSave([post].concat(postsAll()));
    var u = cloudUser();
    cloudUpsert('community_posts', [{
      id: post.id, user_id: u ? u.id : null, author: post.author || null,
      title: post.title, body: post.body, module: post.module || null, hidden: false
    }], 'id');
    return { ok: true, post: post };
  }

  function addReply(postId, body) {
    var text = trim(body, 1000);
    if (!text) return { ok: false, code: 'body' };
    var list = postsAll();
    var post = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === postId) post = list[i];
    if (!post) return { ok: false, code: 'missing' };
    var reply = {
      id: uid('r'),
      author: authorName(),
      authorId: authorId(),
      createdAt: nowIso(),
      body: text
    };
    post.replies.push(reply);
    postsSave(list);
    var u = cloudUser();
    cloudUpsert('community_replies', [{
      id: reply.id, post_id: postId, user_id: u ? u.id : null,
      author: reply.author || null, body: reply.body
    }], 'id');
    return { ok: true, reply: reply, count: post.replies.length };
  }

  function canManage(post, admin) {
    return !!admin || (post && post.authorId === authorId());
  }
  function removePost(id, admin) {
    var list = postsAll();
    var target = null;
    list.forEach(function (p) { if (p.id === id) target = p; });
    if (!target) return { ok: false, code: 'missing' };
    if (!canManage(target, admin)) return { ok: false, code: 'forbidden' };
    postsSave(list.filter(function (p) { return p.id !== id; }));
    if (cloudReady() && authed() && NB.cloud.del) {
      try { NB.cloud.del('community_posts', 'id=eq.' + encodeURIComponent(id)); } catch (e) { /* 忽略 */ }
    }
    return { ok: true };
  }
  function removeReply(postId, replyId, admin) {
    var list = postsAll();
    var target = null;
    list.forEach(function (p) { if (p.id === postId) target = p; });
    if (!target) return { ok: false, code: 'missing' };
    if (!canManage(target, admin)) return { ok: false, code: 'forbidden' };
    target.replies = target.replies.filter(function (r) { return r.id !== replyId; });
    postsSave(list);
    if (cloudReady() && authed() && NB.cloud.del) {
      try { NB.cloud.del('community_replies', 'id=eq.' + encodeURIComponent(replyId)); } catch (e) { /* 忽略 */ }
    }
    return { ok: true };
  }
  function setHidden(postId, hidden) {
    var list = postsAll();
    var target = null;
    list.forEach(function (p) { if (p.id === postId) target = p; });
    if (!target) return { ok: false, code: 'missing' };
    target.hidden = !!hidden;
    postsSave(list);
    if (cloudReady() && authed() && NB.cloud.upsert) {
      try { NB.cloud.upsert('community_posts', [{ id: postId, hidden: !!hidden }], 'id'); } catch (e) { /* 忽略 */ }
    }
    return { ok: true };
  }

  /* ================= 举报 ================= */
  function reportsAll() {
    var list = readJSON(REPORTS_KEY, []);
    return Array.isArray(list) ? list : [];
  }
  function report(targetType, targetId, reason, note) {
    var rec = {
      id: uid('rep'),
      targetType: targetType === 'reply' ? 'reply' : 'post',
      targetId: String(targetId || ''),
      reason: trim(reason, 40) || 'other',
      note: trim(note, 300),
      at: nowIso()
    };
    if (!rec.targetId) return { ok: false, code: 'missing' };
    var list = reportsAll();
    list.unshift(rec);
    writeJSON(REPORTS_KEY, list.slice(0, 200));
    if (targetType === 'post') {
      var posts = postsAll();
      posts.forEach(function (p) {
        if (p.id !== rec.targetId) return;
        p.reports = p.reports || [];
        p.reports.push({ reason: rec.reason, note: rec.note, at: rec.at });
      });
      postsSave(posts);
    }
    var u = cloudUser();
    cloudUpsert('community_reports', [{
      id: rec.id, target_type: rec.targetType, target_id: rec.targetId,
      reason: rec.reason, note: rec.note || null, user_id: u ? u.id : null
    }], 'id');
    return { ok: true, report: rec };
  }
  function reportCount(post) {
    if (!post) return 0;
    return (post.reports || []).length;
  }
  function reportedPosts() {
    return posts().filter(function (p) { return reportCount(p) > 0; });
  }
  function minePosts() {
    return posts().filter(function (p) { return p.authorId === authorId(); });
  }

  /* ================= 云层拉取（登录后合并） ================= */
  function mapCloudPost(r) {
    return {
      id: String(r.id || ''),
      title: String(r.title || ''),
      body: String(r.body || ''),
      module: String(r.module || ''),
      author: String(r.author || ''),
      authorId: '',
      createdAt: String(r.created_at || ''),
      hidden: !!r.hidden,
      replies: [],
      reports: []
    };
  }
  function pullCommunity() {
    if (!cloudReady() || !authed()) return Promise.resolve({ ok: false, code: 'off', added: 0 });
    return cloudRows('community_posts', 'select=*&order=created_at.desc&limit=100').then(function (pr) {
      if (!pr.ok) return { ok: false, code: pr.code || 'rest_failed', added: 0 };
      return cloudRows('community_replies', 'select=*&order=created_at.asc&limit=500').then(function (rr) {
        var local = postsAll();
        var byId = {};
        local.forEach(function (p) { byId[p.id] = p; });
        var added = 0;
        pr.rows.forEach(function (row) {
          var remote = mapCloudPost(row);
          if (!remote.id || !remote.title) return;
          if (byId[remote.id]) {
            byId[remote.id].hidden = remote.hidden;
            return;
          }
          byId[remote.id] = remote;
          local.push(remote);
          added++;
        });
        if (rr.ok) {
          rr.rows.forEach(function (row) {
            var post = byId[String(row.post_id || '')];
            if (!post) return;
            var rid = String(row.id || '');
            if (!rid || post.replies.some(function (x) { return x.id === rid; })) return;
            post.replies.push({
              id: rid, author: String(row.author || ''), authorId: '',
              createdAt: String(row.created_at || ''), body: String(row.body || '')
            });
          });
        }
        postsSave(local);
        return { ok: true, added: added };
      });
    });
  }

  /* ================= 对外接口 ================= */
  window.NB = window.NB || {};
  window.NB.community = {
    todayStamp: todayStamp,
    addDays: addDays,
    authorId: authorId,
    authorName: authorName,
    cloudReady: cloudReady,
    authed: authed,
    checkin: {
      state: checkinState,
      done: checkinToday,
      run: checkin,
      streak: streak,
      total: totalCheckins,
      week: weekCells
    },
    activity: { bump: bump, todayTerms: todayTerms, weekQuiz: weekQuiz, all: activityAll },
    goals: { get: goals, set: setGoals, DAILY: DAILY_CHOICES, WEEKLY: WEEKLY_CHOICES },
    posts: {
      all: posts,
      mine: minePosts,
      reported: reportedPosts,
      get: getPost,
      add: addPost,
      reply: addReply,
      remove: removePost,
      removeReply: removeReply,
      hide: setHidden,
      canManage: canManage,
      reportCount: reportCount
    },
    report: report,
    reportsAll: reportsAll,
    pull: pullCommunity
  };
})();
