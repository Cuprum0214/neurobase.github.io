/* 测验 · 答题页（v47 分页流程）：从 nb-qz-session 会话渲染题目，收集答案后判分；
   错题自动进错题本，写入测验统计，跳转结果页(quiz-result.html)。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var TERMS = window.NB_TERMS || [];
  var BY_ID = {};
  TERMS.forEach(function (term) { BY_ID[term.id] = term; });

  var SESSION_KEY = 'nb-qz-session';
  var RESULT_KEY = 'nb-qz-result';
  var runEl = document.getElementById('qz-run');
  var nosessionEl = document.getElementById('qz-nosession');
  var progressEl = document.getElementById('qz-progress');
  var formEl = document.getElementById('qz-form');
  var submitBtn = document.getElementById('qz-submit');
  var footerEl = document.getElementById('qz-footer');

  function isEn() { return NB.locale() === 'en'; }
  function termName(term) { return isEn() ? term.name_en : term.name_zh; }
  function termPlain(term) { return isEn() && term.plain_en ? term.plain_en : term.plain; }

  var items = [];
  var submitted = false;

  /* ---------------- 渲染题目 ---------------- */
  function renderItems() {
    progressEl.textContent = t('quiz.count') + ' · ' + items.length;
    var html = '';
    items.forEach(function (item, i) {
      var num = t('quiz.question', { n: i + 1 });
      if (item.kind === 'fill') {
        html += '<div class="qz-item">' +
          '<p class="qz-num">' + NB.esc(num) + '</p>' +
          '<p class="qz-stem">' + NB.esc(item.stem) + '</p>' +
          '<p class="qz-def">' + NB.esc(item.def) + '</p>' +
          '<input class="sp-input" data-kind="fill" type="text" autocomplete="off" spellcheck="false" ' +
          'placeholder="' + NB.esc(t('spelling.placeholder')) + '">' +
          '</div>';
      } else {
        var type = item.kind === 'multi' ? 'checkbox' : 'radio';
        var opts = '<div class="qz-opts">' + item.options.map(function (o) {
          var letter = String.fromCharCode(65 + item.options.indexOf(o));
          return '<label class="qz-opt"><input type="' + type + '" name="opt-' + i + '" value="' +
            NB.esc(o.id) + '"><span class="qz-letter" aria-hidden="true">' + letter + '</span>' +
            '<span class="qz-opt-label">' + NB.esc(o.label) + '</span></label>';
        }).join('') + '</div>';
        html += '<div class="qz-item">' +
          '<p class="qz-num">' + NB.esc(num) + '</p>' +
          '<p class="qz-stem">' + NB.esc(item.stem) + '</p>' +
          opts +
          '</div>';
      }
    });
    formEl.innerHTML = html;
  }

  /* ---------------- 判分 ---------------- */
  function collectAnswers() {
    var map = {};
    var inputs = formEl.querySelectorAll('input[data-kind="fill"]');
    for (var i = 0; i < inputs.length; i++) {
      var q = items[i];
      if (q.kind === 'fill') map[q.termId] = inputs[i].value;
    }
    items.forEach(function (q, qi) {
      if (q.kind === 'fill') return;
      var sel = formEl.querySelectorAll('input[name="opt-' + qi + '"]:checked');
      var vals = [];
      for (var j = 0; j < sel.length; j++) vals.push(sel[j].value);
      map[q.termId] = vals;
    });
    return map;
  }

  function judge(item, answers) {
    var got = answers[item.termId];
    var term = BY_ID[item.termId];
    if (item.kind === 'fill') {
      return { ok: L.answerOK(term, got || ''), yourAnswer: got || '' };
    }
    var correctIds = item.options.filter(function (o) { return o.correct; }).map(function (o) { return o.id; });
    var picked = Array.isArray(got) ? got : [];
    var pickedLabels = picked.map(function (id) {
      var o = item.options.filter(function (x) { return x.id === id; })[0];
      return o ? o.label : id;
    });
    if (item.kind === 'single') {
      return { ok: picked.length === 1 && picked[0] === correctIds[0], yourAnswer: pickedLabels.join(', ') };
    }
    var same = picked.length === correctIds.length &&
      correctIds.every(function (id) { return picked.indexOf(id) !== -1; });
    return { ok: same, yourAnswer: pickedLabels.join(', ') };
  }

  function correctAnswerText(item) {
    var term = BY_ID[item.termId];
    if (item.kind === 'fill') return termName(term);
    return item.options.filter(function (o) { return o.correct; })
      .map(function (o) { return o.label; }).join(' / ');
  }

  function submitQuiz() {
    if (submitted) return;
    submitted = true;
    var answers = collectAnswers();
    var correct = 0;
    var wrong = 0;
    var review = items.map(function (item) {
      var term = BY_ID[item.termId];
      var j = judge(item, answers);
      if (j.ok) { correct += 1; } else { wrong += 1; }
      return {
        kind: item.kind,
        termId: item.termId,
        stem: item.kind === 'fill' ? item.def : item.stem,
        correctAnswer: correctAnswerText(item),
        explain: termPlain(term),
        yourAnswer: j.yourAnswer,
        ok: j.ok
      };
    });
    /* 错题进错题本 */
    review.forEach(function (r) {
      if (r.ok) return;
      L.mistakes.add({
        id: 'qz-' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
        termId: r.termId,
        source: 'quiz',
        at: new Date().toISOString(),
        prompt: r.stem.slice(0, 120),
        yourAnswer: r.yourAnswer.slice(0, 80),
        correctAnswer: r.correctAnswer
      });
    });
    L.quiz.record(correct, wrong);
    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify({ score: { correct: correct, wrong: wrong, total: items.length }, items: review }));
    } catch (err) { /* 存储不可用时静默 */ }
    try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* 忽略 */ }
    NB.go('quiz-result.html');
  }

  submitBtn.addEventListener('click', submitQuiz);

  /* ---------------- 启动 ---------------- */
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { session = null; }
  if (!session || !Array.isArray(session.items) || !session.items.length) {
    runEl.hidden = true;
    nosessionEl.hidden = false;
    /* 没有进行中的测验时才给出返回入口；答题过程中不显示返回键 */
    if (footerEl) footerEl.hidden = false;
    return;
  }
  items = session.items;
  renderItems();
})();
