/* ============================================================================
   NeuroBase · 学习工具公共层（普通脚本，非 ES module —— file:// 双击打开也能运行）
   提供：拼写归一化判分、错题本 / 收藏 / 测验统计 CRUD、
       确定性随机数（出题可复现，便于自测）
   依赖：core.js（window.NB）；数据挂在 window.NB_TERMS
   ============================================================================ */
(function () {
  'use strict';

  var NB = window.NB || {};
  var TERMS = window.NB_TERMS || [];

  var MISTAKES_KEY = 'nb-mistakes';
  var FAVORITES_KEY = 'nb-favorites';
  var QUIZ_KEY = 'nb-quiz-stats';
  var MISTAKE_LIMIT = 200;
  var FAVORITE_LIMIT = 100;

  /* ---------------- 日期工具（本地时区，YYYY-MM-DD 字符串，可排序可比较） ---------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dayStamp(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStamp() { return dayStamp(new Date()); }
  function addDays(stamp, days) {
    var d = new Date(stamp + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return dayStamp(d);
  }
  function stampCmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

  /* ---------------- localStorage 读写（容错） ---------------- */
  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  /* ================= 拼写归一化判分 ================= */
  /* 转小写、去空白与常见标点，中英文均可比较 */
  function normAns(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[\s\u3000\u00a0\-\u2010\u2011\u2012\u2013\u2014_.:;,!'"“”‘’()\[\]{}<>/\\|·]+/g, '');
  }
  /* 一个词条的所有可接受答案：name_en / abbr / 别名（去空） */
  function termCandidates(t) {
    var list = [t.name_en, t.abbr];
    if (Array.isArray(t.aliases)) list = list.concat(t.aliases);
    return list.filter(Boolean);
  }
  function answerOK(t, input) {
    var target = normAns(input);
    if (!target) return false;
    return termCandidates(t).some(function (c) { return normAns(c) === target; });
  }
  /* 缩写模式判定：输入是否等于 abbr（或短别名 <=6 字符） */
  function abbrOK(t, input) {
    var target = normAns(input);
    if (!target) return false;
    var cands = [];
    if (t.abbr) cands.push(t.abbr);
    if (Array.isArray(t.aliases)) t.aliases.forEach(function (a) { if (a && a.length <= 6) cands.push(a); });
    return cands.some(function (c) { return normAns(c) === target; });
  }
  /* 中文名判定：输入是否等于 name_zh 或别名（用于「看英文写中文」） */
  function zhOK(t, input) {
    var target = normAns(input);
    if (!target) return false;
    var cands = [t.name_zh];
    if (Array.isArray(t.aliases)) cands = cands.concat(t.aliases);
    return cands.some(function (c) { return c && normAns(c) === target; });
  }

  /* ================= 错题本 ================= */
  function mistakesAll() { return readJSON(MISTAKES_KEY, []); }
  function mistakesSave(list) { writeJSON(MISTAKES_KEY, list.slice(0, MISTAKE_LIMIT)); }
  function mistakeAdd(rec) {
    var list = mistakesAll();
    list.unshift(rec);
    mistakesSave(list);
    return list.length;
  }
  function mistakeRemove(id) {
    var list = mistakesAll().filter(function (r) { return r.id !== id; });
    mistakesSave(list);
    return list.length;
  }
  function mistakesClear() { mistakesSave([]); }
  function mistakesCount() { return mistakesAll().length; }

  /* ================= 收藏 ================= */
  function favoritesAll() { return readJSON(FAVORITES_KEY, []); }
  function favoritesSave(list) { writeJSON(FAVORITES_KEY, list.slice(0, FAVORITE_LIMIT)); }
  function favoriteHas(id) { return favoritesAll().indexOf(id) !== -1; }
  function favoriteToggle(id) {
    var list = favoritesAll();
    var i = list.indexOf(id);
    if (i === -1) { list.push(id); } else { list.splice(i, 1); }
    favoritesSave(list);
    return favoriteHas(id);
  }
  function favoritesCount() { return favoritesAll().length; }
  function favoritesClear() { favoritesSave([]); }

  /* ================= 测验统计 ================= */
  function quizStats() { return readJSON(QUIZ_KEY, { taken: 0, correct: 0, wrong: 0 }); }
  function quizRecord(correct, wrong) {
    var s = quizStats();
    s.taken += 1;
    s.correct += correct;
    s.wrong += wrong;
    writeJSON(QUIZ_KEY, s);
    /* 每日活动统计：给「我的学习」的每周测验目标用 */
    try {
      if (window.NB && window.NB.community && window.NB.community.activity) {
        window.NB.community.activity.bump('quiz');
      }
    } catch (e) { /* 忽略 */ }
    return s;
  }

  /* ================= 确定性随机数（mulberry32，可复现） ================= */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashCode(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRng(seedStr) { return mulberry32(hashCode(seedStr)); }
  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ================= 对外接口 ================= */
  window.NB.learn = {
    dayStamp: dayStamp,
    todayStamp: todayStamp,
    addDays: addDays,
    stampCmp: stampCmp,
    normAns: normAns,
    termCandidates: termCandidates,
    answerOK: answerOK,
    abbrOK: abbrOK,
    zhOK: zhOK,
    mistakes: { all: mistakesAll, add: mistakeAdd, remove: mistakeRemove, clear: mistakesClear, count: mistakesCount },
    favorites: { all: favoritesAll, has: favoriteHas, toggle: favoriteToggle, count: favoritesCount, clear: favoritesClear },
    quiz: { stats: quizStats, record: quizRecord },
    rng: { mulberry32: mulberry32, seeded: seededRng, shuffle: shuffle }
  };
})();
