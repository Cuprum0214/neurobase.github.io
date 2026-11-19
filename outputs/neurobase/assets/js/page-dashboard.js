/* 我的学习：目标设置 + 今日进度 + 进度看板 + 模块进度 + 薄弱项推荐 + 本机数据管理 */
(function () {
  'use strict';

  var NB = window.NB;
  var t = NB.t;
  var esc = NB.esc;
  var C = NB.community;
  var L = NB.learn;
  var MODULES = window.NB_MODULES || [];
  var TERMS = window.NB_TERMS || [];

  NB.mountShell('dashboard');

  var BY_ID = {};
  TERMS.forEach(function (term) { BY_ID[term.id] = term; });
  var resetArmed = false;

  function $(id) { return document.getElementById(id); }
  function isEn() { return NB.locale() === 'en'; }
  function termName(term) { return isEn() ? (term.name_en || term.name_zh) : term.name_zh; }
  function moduleName(m) { return isEn() ? m.name_en : m.name_zh; }
  function pctOf(n, total) { return total ? Math.min(100, Math.round((n / total) * 100)) : 0; }

  /* ================= 目标 ================= */
  function renderGoals() {
    var g = C.goals.get();
    $('ds-goal-daily').innerHTML = C.goals.DAILY.map(function (n) {
      return '<button type="button" class="chip" data-daily="' + n + '" aria-pressed="' + (g.dailyTerms === n ? 'true' : 'false') + '">' +
        esc(t('dashboard.goalDailyUnit', { n: n })) + '</button>';
    }).join('');
    $('ds-goal-weekly').innerHTML = C.goals.WEEKLY.map(function (n) {
      return '<button type="button" class="chip" data-weekly="' + n + '" aria-pressed="' + (g.weeklyQuiz === n ? 'true' : 'false') + '">' +
        esc(t('dashboard.goalWeeklyUnit', { n: n })) + '</button>';
    }).join('');
  }
  $('ds-goal-daily').addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-daily]') : null;
    if (!b) return;
    C.goals.set({ dailyTerms: Number(b.getAttribute('data-daily')) });
    renderGoals();
    renderToday();
    $('ds-goal-msg').textContent = t('dashboard.goalSaved');
    NB.announce(t('dashboard.goalSaved'));
  });
  $('ds-goal-weekly').addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-weekly]') : null;
    if (!b) return;
    C.goals.set({ weeklyQuiz: Number(b.getAttribute('data-weekly')) });
    renderGoals();
    renderToday();
    $('ds-goal-msg').textContent = t('dashboard.goalSaved');
    NB.announce(t('dashboard.goalSaved'));
  });

  /* ================= 今日进度 ================= */
  function renderToday() {
    var g = C.goals.get();
    var terms = C.activity.todayTerms();
    var quiz = C.activity.weekQuiz();
    var done = C.checkin.done();
    var rows = [
      { label: t('dashboard.todayTerms', { n: terms, goal: g.dailyTerms }), pct: pctOf(terms, g.dailyTerms) },
      { label: t('dashboard.todayQuiz', { n: quiz, goal: g.weeklyQuiz }), pct: pctOf(quiz, g.weeklyQuiz) },
      { label: t('dashboard.todayCheckin'), pct: done ? 100 : 0, text: t(done ? 'dashboard.todayCheckinDone' : 'dashboard.todayCheckinMiss') }
    ];
    $('ds-today').innerHTML = rows.map(function (r) {
      return '<li class="ds-today-item">' +
        '<span class="ds-today-label">' + esc(r.label) + '</span>' +
        (r.text ? '<span class="pill ' + (r.pct ? 'pill-primary' : 'pill-slate') + '">' + esc(r.text) + '</span>' : '') +
        '<span class="mini-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + r.pct + '">' +
          '<span class="mini-bar-fill" style="width:' + r.pct + '%"></span></span>' +
      '</li>';
    }).join('');
  }

  /* ================= 进度看板 ================= */
  function renderBoard() {
    var read = NB.progress.count();
    var total = NB.progress.total();
    var fav = L.favorites.count();
    var mis = L.mistakes.count();
    var qs = L.quiz.stats();
    var answered = (Number(qs.correct) || 0) + (Number(qs.wrong) || 0);
    var pct = answered ? Math.round((Number(qs.correct) / answered) * 100) : 0;
    var streak = C.checkin.streak();
    $('ds-board').innerHTML =
      '<li class="ds-tile"><span class="ds-tile-num">' + esc(t('dashboard.boardReadVal', { n: read, total: total })) + '</span>' +
        '<span class="ds-tile-label">' + esc(t('dashboard.boardRead')) + '</span>' +
        '<span class="mini-bar"><span class="mini-bar-fill" style="width:' + pctOf(read, total) + '%"></span></span></li>' +
      '<li class="ds-tile"><span class="ds-tile-num">' + fav + '</span>' +
        '<span class="ds-tile-label">' + esc(t('dashboard.boardFav')) + '</span></li>' +
      '<li class="ds-tile"><span class="ds-tile-num">' + mis + '</span>' +
        '<span class="ds-tile-label">' + esc(t('dashboard.boardMistakes')) + '</span></li>' +
      '<li class="ds-tile"><span class="ds-tile-num">' + esc(t('dashboard.boardQuizVal', { pct: pct })) + '</span>' +
        '<span class="ds-tile-label">' + esc(t('dashboard.boardQuiz')) + '</span>' +
        '<span class="ds-tile-sub">' + esc(t('dashboard.boardQuizSub', { n: qs.taken || 0, correct: qs.correct || 0 })) + '</span></li>' +
      '<li class="ds-tile"><span class="ds-tile-num">' + streak + '</span>' +
        '<span class="ds-tile-label">' + esc(t('dashboard.boardStreak')) + '</span></li>';
  }

  /* ================= 模块进度 ================= */
  function moduleStats() {
    var visited = {};
    NB.progress.ids().forEach(function (id) { visited[id] = 1; });
    var stats = MODULES.map(function (m) {
      return { id: m.id, module: m, read: 0, target: Number(m.target) || 0, mistakes: 0, terms: [] };
    });
    var byId = {};
    stats.forEach(function (s) { byId[s.id] = s; });
    TERMS.forEach(function (term) {
      var s = byId[term.module];
      if (!s) return;
      s.terms.push(term);
      if (visited[term.id]) s.read += 1;
    });
    L.mistakes.all().forEach(function (m) {
      var term = BY_ID[m.termId];
      if (term && byId[term.module]) byId[term.module].mistakes += 1;
    });
    return stats;
  }

  function renderModules(stats) {
    $('ds-modules').innerHTML = stats.map(function (s) {
      var pct = pctOf(s.read, s.target);
      return '<li class="ds-module">' +
        '<span class="ds-module-name">' + esc(moduleName(s.module)) + '</span>' +
        '<span class="ds-module-count">' + esc(t('dashboard.moduleItem', { read: s.read, target: s.target })) + '</span>' +
        '<span class="mini-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
          '<span class="mini-bar-fill" style="width:' + pct + '%"></span></span>' +
      '</li>';
    }).join('');
  }

  /* ================= 薄弱项推荐 ================= */
  function renderWeak(stats) {
    var read = NB.progress.count();
    var mis = L.mistakes.count();
    var qs = L.quiz.stats();
    var hasData = read > 0 || mis > 0 || (Number(qs.taken) || 0) > 0;

    var items = [];
    if (hasData) {
      var ranked = stats.slice().sort(function (a, b) {
        if (b.mistakes !== a.mistakes) return b.mistakes - a.mistakes;
        return pctOf(a.read, a.target) - pctOf(b.read, b.target);
      });
      var picked = {};
      var addTerm = function (s, term) {
        var unread = !NB.progress.isVisited(term.id);
        items.push({
          term: term,
          reason: s.mistakes > 0
            ? t('dashboard.weakReasonMistake', { n: s.mistakes, module: moduleName(s.module) })
            : t('dashboard.weakReasonBehind', { module: moduleName(s.module), read: s.read, target: s.target }),
          unread: unread
        });
      };
      ranked.forEach(function (s) {
        if (items.length >= 3) return;
        if (s.mistakes > 0) {
          var misTerms = L.mistakes.all().map(function (m) { return BY_ID[m.termId]; })
            .filter(function (term) { return term && term.module === s.id && !picked[term.id]; });
          misTerms.slice(0, 2).forEach(function (term) {
            if (items.length >= 3 || picked[term.id]) return;
            picked[term.id] = 1;
            addTerm(s, term);
          });
        }
        s.terms.forEach(function (term) {
          if (items.length >= 3 || picked[term.id] || NB.progress.isVisited(term.id)) return;
          picked[term.id] = 1;
          addTerm(s, term);
        });
      });
    }

    $('ds-weak-empty').hidden = items.length !== 0;
    $('ds-weak').innerHTML = items.map(function (it) {
      return '<li class="ds-weak-item">' +
        '<a class="ds-weak-name" href="' + esc(NB.hrefTerm(it.term.id)) + '">' + esc(termName(it.term)) + '</a>' +
        '<p class="ds-weak-reason">' + esc(it.reason) + '</p>' +
        '<a class="btn btn-ghost btn-sm" href="' + esc(NB.hrefTerm(it.term.id)) + '">' + esc(t('dashboard.weakCta')) + '</a>' +
      '</li>';
    }).join('');
  }

  /* ================= 本机数据 ================= */
  $('ds-reset').addEventListener('click', function () {
    var msg = $('ds-reset-msg');
    if (!resetArmed) {
      resetArmed = true;
      $('ds-reset').textContent = t('dashboard.prefResetConfirm');
      msg.textContent = t('dashboard.prefResetHint');
      return;
    }
    resetArmed = false;
    NB.progress.clear();
    if (L.favorites.clear) L.favorites.clear();
    L.mistakes.clear();
    try {
      localStorage.removeItem('nb-quiz-stats');
      localStorage.removeItem('nb-checkin');
      localStorage.removeItem('nb-activity');
    } catch (e) { /* 忽略 */ }
    $('ds-reset').textContent = t('dashboard.prefReset');
    msg.textContent = t('dashboard.prefResetOk');
    NB.announce(t('dashboard.prefResetOk'));
    renderAll();
  });

  /* ================= 启动 ================= */
  function renderAll() {
    var stats = moduleStats();
    renderGoals();
    renderToday();
    renderBoard();
    renderModules(stats);
    renderWeak(stats);
  }
  renderAll();
})();
