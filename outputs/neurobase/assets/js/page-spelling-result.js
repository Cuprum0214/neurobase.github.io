/* 拼写与缩写训练 · 学习结果页：读取本轮会话(nb-sp-session)展示答对题数与错题回顾。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var SESSION_KEY = 'nb-sp-session';
  var lineEl = document.getElementById('sp-result-line');
  var subEl = document.getElementById('sp-result-sub');
  var mistakesEl = document.getElementById('sp-mistakes');
  var emptyEl = document.getElementById('sp-result-empty');
  var againBtn = document.getElementById('sp-again');

  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { /* 忽略 */ }

  var results = session && Array.isArray(session.results) ? session.results : [];
  if (results.length) {
    var total = results.length;
    var correct = session.correct || results.filter(function (r) { return r.ok; }).length;
    lineEl.textContent = t('spelling.result', { correct: correct, total: total });
    var pct = Math.round(correct / total * 100);
    subEl.textContent = t('learn.rate', { pct: pct });
    var wrong = results.filter(function (r) { return !r.ok; });
    if (wrong.length) {
      var html = '<h2 class="result-sub">' + NB.esc(t('spelling.mistakesTitle')) + '</h2>';
      wrong.forEach(function (r, i) {
        html += '<div class="qz-item">' +
          '<p class="qz-num">' + NB.esc(t('quiz.question', { n: i + 1 })) + '</p>' +
          '<p class="qz-stem">' + NB.esc(r.prompt) + '</p>' +
          '<p class="qz-answer">' + NB.esc(t('spelling.correctAnswer', { answer: r.correctAnswer })) + '</p>' +
          '<p class="qz-answer">' + NB.esc(t('spelling.yourAnswer', { answer: r.yourAnswer || t('quiz.unanswered') })) + '</p>' +
          '</div>';
      });
      mistakesEl.innerHTML = html;
    }
    emptyEl.hidden = true;
  } else {
    lineEl.hidden = true;
    subEl.hidden = true;
    emptyEl.hidden = false;
  }

  againBtn.addEventListener('click', function () {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* 忽略 */ }
    NB.go('spelling.html');
  });
})();
