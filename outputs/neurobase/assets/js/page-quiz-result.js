/* 测验 · 结果页：读取本轮结果(nb-qz-result)展示得分与逐题解析；错题自动在答题页进错题本。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var RESULT_KEY = 'nb-qz-result';
  var scoreEl = document.getElementById('qz-score');
  var rateEl = document.getElementById('qz-rate');
  var reviewEl = document.getElementById('qz-review');
  var emptyEl = document.getElementById('qz-result-empty');
  var againBtn = document.getElementById('qz-again');

  var data = null;
  try { data = JSON.parse(localStorage.getItem(RESULT_KEY) || 'null'); } catch (e) { data = null; }

  var items = data && Array.isArray(data.items) ? data.items : [];
  if (items.length) {
    var s = data.score || { correct: 0, wrong: 0, total: items.length };
    scoreEl.textContent = t('quiz.score', { n: s.correct, total: s.total });
    rateEl.textContent =
      t('quiz.resultCorrect', { n: s.correct }) + ' · ' +
      t('quiz.resultWrong', { n: s.wrong }) + ' · ' +
      t('learn.rate', { pct: Math.round(s.correct / s.total * 100) });
    var html = '';
    items.forEach(function (r, i) {
      var num = t('quiz.question', { n: i + 1 });
      var badge = r.ok ? t('quiz.correctBadge') : t('quiz.wrongBadge');
      html += '<div class="qz-item">' +
        '<p class="qz-num">' + NB.esc(num) + ' <span class="qz-badge ' + (r.ok ? 'ok' : 'bad') + '">' + NB.esc(badge) + '</span></p>' +
        '<p class="qz-stem">' + NB.esc(r.stem) + '</p>' +
        '<p class="qz-answer">' + NB.esc(t('quiz.answer')) + '：' + NB.esc(r.correctAnswer) + '</p>' +
        '<p class="qz-answer">' + NB.esc(t('quiz.youAnswered', { answer: r.yourAnswer || t('quiz.unanswered') })) + '</p>' +
        (r.explain ? '<p class="qz-explain">' + NB.esc(t('quiz.explain')) + '：' + NB.esc(r.explain) + '</p>' : '') +
        '</div>';
    });
    reviewEl.innerHTML = html;
    emptyEl.hidden = true;
  } else {
    scoreEl.hidden = true;
    rateEl.hidden = true;
    reviewEl.hidden = true;
    emptyEl.hidden = false;
  }

  againBtn.addEventListener('click', function () {
    try { localStorage.removeItem(RESULT_KEY); } catch (e) { /* 忽略 */ }
    NB.go('quiz.html');
  });
})();
