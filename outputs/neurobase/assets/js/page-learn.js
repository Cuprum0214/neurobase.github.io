/* 学习中心：错题本（移除/清空）+ 收藏（跳词条/取消）+ 进度统计（浏览/测验/错题/收藏） */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var TERMS = window.NB_TERMS || [];
  var BY_ID = {};
  TERMS.forEach(function (term) { BY_ID[term.id] = term; });

  var mistakesListEl = document.getElementById('mistakes-list');
  var mistakesEmptyEl = document.getElementById('mistakes-empty');
  var mistakesHintEl = document.getElementById('mistakes-hint');
  var mistakesClearBtn = document.getElementById('mistakes-clear');
  var favListEl = document.getElementById('favorites-list');
  var favEmptyEl = document.getElementById('favorites-empty');
  var favHintEl = document.getElementById('favorites-hint');
  var progressEl = document.getElementById('progress-stats');

  function isEn() { return NB.locale() === 'en'; }
  function termName(term) { return isEn() ? term.name_en : term.name_zh; }
  function termDef(term) { return isEn() && term.definition_en ? term.definition_en : term.definition; }
  function sourceName(s) { return s === 'quiz' ? t('learn.quiz') : s === 'spelling' ? t('learn.spelling') : s; }

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      var p = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    } catch (e) { return ''; }
  }

  /* ---------------- 错题本 ---------------- */
  function renderMistakes() {
    var list = L.mistakes.all();
    mistakesHintEl.textContent = t('learn.mistakesHint', { n: list.length });
    mistakesClearBtn.hidden = list.length === 0;
    mistakesEmptyEl.hidden = list.length !== 0;
    mistakesListEl.innerHTML = list.map(function (m) {
      var term = BY_ID[m.termId];
      var name = term ? termName(term) : m.termId;
      var href = term ? NB.hrefTerm(m.termId) : 'terms.html';
      return '<li class="mistake-item" data-id="' + NB.esc(m.id) + '">' +
        '<div class="mistake-main">' +
          '<a class="mistake-name" href="' + NB.esc(href) + '">' + NB.esc(name) + '</a>' +
          '<p class="mistake-meta">' + NB.esc(t('learn.mistakeSource', { name: sourceName(m.source) })) +
            (m.at ? ' · ' + NB.esc(fmtDate(m.at)) : '') + '</p>' +
          (m.prompt ? '<p class="mistake-prompt">' + NB.esc(t('learn.mistakePrompt', { prompt: m.prompt })) + '</p>' : '') +
          (m.yourAnswer ? '<p class="mistake-wrong">' + NB.esc(t('learn.mistakeYourAnswer', { answer: m.yourAnswer })) + '</p>' : '') +
          (m.correctAnswer ? '<p class="mistake-right">' + NB.esc(t('learn.mistakeCorrectAnswer', { answer: m.correctAnswer })) + '</p>' : '') +
        '</div>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-remove="' + NB.esc(m.id) + '" data-i18n="learn.remove">移除</button>' +
      '</li>';
    }).join('');
  }

  mistakesListEl.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-remove]') : null;
    if (!btn) return;
    L.mistakes.remove(btn.getAttribute('data-remove'));
    renderMistakes();
    renderProgress();
  });

  mistakesClearBtn.addEventListener('click', function () {
    L.mistakes.clear();
    renderMistakes();
    renderProgress();
  });

  /* ---------------- 收藏 ---------------- */
  function renderFavorites() {
    var ids = L.favorites.all();
    favHintEl.textContent = t('learn.favoritesHint', { n: ids.length });
    favEmptyEl.hidden = ids.length !== 0;
    favListEl.innerHTML = ids.map(function (id) {
      var term = BY_ID[id];
      if (!term) return '';
      return '<li class="fav-item" data-id="' + NB.esc(id) + '">' +
        '<a class="fav-name" href="' + NB.esc(NB.hrefTerm(id)) + '">' + NB.esc(termName(term)) + '</a>' +
        '<p class="fav-meta">' + NB.esc(term.name_en || '') + '</p>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-unfav="' + NB.esc(id) + '" data-i18n="learn.unfavorite">取消收藏</button>' +
      '</li>';
    }).join('');
  }

  favListEl.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-unfav]') : null;
    if (!btn) return;
    L.favorites.toggle(btn.getAttribute('data-unfav'));
    renderFavorites();
    renderProgress();
  });

  /* ---------------- 进度统计 ---------------- */
  function renderProgress() {
    var browse = NB.progress.count();
    var total = NB.progress.total();
    var pct = total ? Math.round((browse / total) * 100) : 0;
    var qs = L.quiz.stats();
    var mis = L.mistakes.count();
    var fav = L.favorites.count();
    progressEl.innerHTML =
      '<li>' + NB.esc(t('learn.progressBrowse', { n: browse, total: total, pct: pct })) +
        '<span class="mini-bar"><span class="mini-bar-fill" style="width:' + pct + '%"></span></span></li>' +
      '<li>' + NB.esc(t('learn.progressQuiz', { n: qs.taken, correct: qs.correct, wrong: qs.wrong })) + '</li>' +
      '<li>' + NB.esc(t('learn.progressMistakes', { n: mis })) + '</li>' +
      '<li>' + NB.esc(t('learn.progressFavorites', { n: fav })) + '</li>';
  }

  /* ---------------- 启动 ---------------- */
  renderMistakes();
  renderFavorites();
  renderProgress();
})();
