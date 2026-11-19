/* 拼写与缩写训练 · 答题页（v47 分页流程）：从 nb-sp-session 会话读题，逐题作答；
   检查后给出对错反馈并显示「下一题 / 查看学习结果」按钮；答完全部跳转结果页。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var TERMS = window.NB_TERMS || [];
  var BY_ID = {};
  TERMS.forEach(function (term) { BY_ID[term.id] = term; });

  var SESSION_KEY = 'nb-sp-session';
  var runEl = document.getElementById('sp-run');
  var nosessionEl = document.getElementById('sp-nosession');
  var progressEl = document.getElementById('sp-progress');
  var promptEl = document.getElementById('sp-prompt');
  var listenEl = document.getElementById('sp-listen');
  var speakBtn = document.getElementById('sp-speak');
  var answerForm = document.getElementById('sp-answer');
  var inputEl = document.getElementById('sp-input');
  var feedbackEl = document.getElementById('sp-feedback');
  var navEl = document.getElementById('sp-nav');
  var nextBtn = document.getElementById('sp-next');
  var finishBtn = document.getElementById('sp-finish');
  var footerEl = document.getElementById('sp-footer');

  var session = null;
  var mode = 'zh2en';
  var idx = 0;
  var current = null;
  var answered = false;
  var speakTimer = null;

  function isEn() { return NB.locale() === 'en'; }
  function termName(term) { return isEn() ? term.name_en : term.name_zh; }
  function termPlain(term) { return isEn() && term.plain_en ? term.plain_en : term.plain; }
  function termDef(term) { return isEn() && term.definition_en ? term.definition_en : term.definition; }

  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveSession() {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 渲染题目 ---------------- */
  function promptHtml(term) {
    if (mode === 'zh2en') {
      /* 「看释义写英文」：释义必须是这个词的含义（定义/通俗解释），不给拼音简写 */
      var def = termDef(term) || termPlain(term) || term.name_zh;
      return '<p class="sp-question">' + NB.esc(def) + '</p>';
    }
    if (mode === 'zh2name') {
      return '<p class="sp-question">' + NB.esc(term.name_zh) + '</p>' +
        '<p class="sp-extra">' + NB.esc(t('spelling.zhTarget')) + '</p>';
    }
    if (mode === 'en2zh') {
      return '<p class="sp-question">' + NB.esc(term.name_en) + '</p>' +
        '<p class="sp-extra">' + NB.esc(t('spelling.enTarget')) + '</p>';
    }
    if (mode === 'abbr') {
      var cand = term.abbr || (term.aliases || []).filter(function (a) { return a && a.length <= 6; })[0] || '';
      var full = isEn() ? term.name_zh : term.name_en;
      return '<p class="sp-question">' + NB.esc(t('spelling.abbrFull', { full: full })) + '</p>' +
        (term.abbr ? '<p class="sp-extra">' + NB.esc(t('spelling.abbrTarget')) + '</p>' : '');
    }
    if (mode === 'dict') {
      return '<p class="sp-question">' + NB.esc(t('spelling.dictHint')) + '</p>';
    }
    return '';
  }

  function speak(text) {
    if (!window.speechSynthesis || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 不支持或失败时静默忽略 */ }
  }

  function showCurrent() {
    if (idx >= session.items.length) {
      session.finished = true;
      saveSession();
      NB.go('spelling-result.html');
      return;
    }
    answered = false;
    current = BY_ID[session.items[idx].termId];
    progressEl.textContent = t('spelling.count', { n: session.items.length }) + ' · ' + t('quiz.question', { n: idx + 1 });
    promptEl.innerHTML = promptHtml(current);
    listenEl.hidden = mode !== 'dict';
    feedbackEl.textContent = '';
    feedbackEl.className = 'sp-feedback';
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.placeholder = t(mode === 'en2zh' ? 'spelling.placeholderZh' : 'spelling.placeholder');
    answerForm.querySelector('button[type="submit"]').disabled = false;
    navEl.hidden = true;
    if (mode === 'dict' && window.speechSynthesis) {
      speak(isEn() ? current.name_zh : current.name_en);
    }
  }

  function checkAnswer() {
    var val = inputEl.value.trim();
    var ok = mode === 'abbr' ? L.abbrOK(current, val) :
             mode === 'en2zh' ? L.zhOK(current, val) : L.answerOK(current, val);
    var promptText = promptHtml(current).replace(/<[^>]+>/g, '').trim().slice(0, 120);
    var correctAnswer = mode === 'en2zh'
      ? (current.name_zh || current.name_en)
      : (current.abbr ? (current.name_en + ' / ' + current.abbr) : (current.name_en || current.name_zh));
    session.done += 1;
    if (ok) {
      session.correct += 1;
      feedbackEl.textContent = NB.esc(t('spelling.correct'));
      feedbackEl.className = 'sp-feedback ok';
    } else {
      L.mistakes.add({
        id: 'sp-' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
        termId: current.id,
        source: 'spelling',
        at: new Date().toISOString(),
        prompt: promptText,
        yourAnswer: val.slice(0, 80),
        correctAnswer: mode === 'en2zh' ? (current.name_zh || current.name_en) : (current.name_en || current.name_zh)
      });
      feedbackEl.innerHTML =
        NB.esc(t('spelling.wrong')) + '<br>' +
        NB.esc(t('spelling.correctAnswer', { answer: correctAnswer })) +
        (val ? '<br>' + NB.esc(t('spelling.yourAnswer', { answer: val })) : '');
      feedbackEl.className = 'sp-feedback bad';
      speak(current.name_en);
    }
    session.results.push({
      termId: current.id,
      ok: ok,
      prompt: promptText,
      yourAnswer: val.slice(0, 80),
      correctAnswer: correctAnswer
    });
    saveSession();
    inputEl.disabled = true;
    answerForm.querySelector('button[type="submit"]').disabled = true;
    answered = true;
    navEl.hidden = false;
    var last = idx + 1 >= session.items.length;
    nextBtn.hidden = last;
    finishBtn.hidden = !last;
  }

  function nextItem() {
    idx += 1;
    session.idx = idx;
    saveSession();
    if (idx >= session.items.length) {
      session.finished = true;
      saveSession();
      NB.go('spelling-result.html');
    } else {
      NB.go('spelling-run.html?n=' + idx);
    }
  }

  /* ---------------- 事件 ---------------- */
  speakBtn.addEventListener('click', function () {
    if (current) speak(isEn() ? current.name_en : current.name_zh);
  });
  answerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!current) return;
    if (!answered) checkAnswer();
  });
  /* 回车：未检查时提交检查；已检查时进入下一题/结果页 */
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && answered) { e.preventDefault(); nextItem(); }
  });
  nextBtn.addEventListener('click', nextItem);
  finishBtn.addEventListener('click', nextItem);

  /* ---------------- 启动 ---------------- */
  session = readSession();
  if (!session || !Array.isArray(session.items) || !session.items.length) {
    runEl.hidden = true;
    nosessionEl.hidden = false;
    /* 没有进行中的训练时才给出返回入口；答题过程中不显示返回键 */
    if (footerEl) footerEl.hidden = false;
    return;
  }
  mode = session.mode || 'zh2en';
  idx = session.idx || 0;
  var m = /[?&]n=(\d+)/.exec(location.search || '');
  if (m) {
    var n = parseInt(m[1], 10);
    if (!isNaN(n) && n >= 0 && n < session.items.length) idx = n;
  }
  showCurrent();
  if (mode !== 'dict') inputEl.focus();
})();
