/* 认知实验模拟：Stroop 效应 / 简单·选择反应时 / 数字记忆广度。
   三个实验独立运行；结果与说明均为教学示意，导出 NB.labCogsim 供自测。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;

  NB.mountShell('lab');

  /* ============================ 0. 模块导航 ============================ */
  /* 首屏只列三个实验模块；hash（#stroop / #rt / #digit）决定显示哪个实验，
     浏览器前进 / 后退与直链都能还原，空值或未识别的 hash 回到模块列表。 */
  var EXP_KEYS = ['stroop', 'rt', 'digit'];
  var menuEl = document.getElementById('cogsim-menu');
  var detailEl = document.getElementById('cogsim-detail');
  var expBackEl = document.getElementById('cogsim-back');
  var expPanels = Array.prototype.slice.call(document.querySelectorAll('[data-exp-panel]'));
  var expCards = Array.prototype.slice.call(document.querySelectorAll('.cogsim-card[data-exp]'));
  var shownExp = '';
  var lastExp = '';

  function expFromHash() {
    var key = String(location.hash || '').replace(/^#/, '');
    return EXP_KEYS.indexOf(key) >= 0 ? key : '';
  }

  function focusCard(key) {
    var target = expCards.filter(function (card) {
      return card.getAttribute('data-exp') === key;
    })[0] || expCards[0];
    if (target) target.focus();
  }

  function showExp(key) {
    var active = EXP_KEYS.indexOf(key) >= 0 ? key : '';
    if (menuEl) menuEl.hidden = !!active;
    if (detailEl) detailEl.hidden = !active;
    expPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-exp-panel') !== active;
    });
    if (active) lastExp = active;
    /* 从列表进入实验时把焦点交给「返回实验列表」，避免焦点停在已隐藏的卡片上 */
    if (active && active !== shownExp && expBackEl) expBackEl.focus();
    shownExp = active;
  }

  function applyHash() {
    showExp(expFromHash());
  }

  expCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var key = card.getAttribute('data-exp');
      showExp(key);
      if (expFromHash() !== key) location.hash = key;
    });
  });

  if (expBackEl) {
    expBackEl.addEventListener('click', function () {
      showExp('');
      focusCard(lastExp);
      if (location.hash) location.hash = '';
    });
  }

  window.addEventListener('hashchange', applyHash);
  applyHash();


  var COLORS = ['red', 'blue', 'green', 'yellow'];
  var COLOR_NAMES = { red: 'labCogsim.colorRed', blue: 'labCogsim.colorBlue', green: 'labCogsim.colorGreen', yellow: 'labCogsim.colorYellow' };

  /* ============================ 1. Stroop 效应 ============================ */
  var STROOP_TRIALS = 20;
  var stroopStartEl = document.getElementById('stroop-start');
  var stroopWordEl = document.getElementById('stroop-word');
  var stroopProgEl = document.getElementById('stroop-progress');
  var stroopResultEl = document.getElementById('stroop-result');
  var stroopBtnsEl = document.getElementById('stroop-btns');
  var stroopBtns = Array.prototype.slice.call(stroopBtnsEl.querySelectorAll('[data-color]'));
  var stroop = {
    running: false, idx: 0, locked: false, seq: [], word: '', ink: '',
    okAll: 0, nAll: 0,
    rtCong: 0, nCong: 0, rtInc: 0, nInc: 0
  };

  /* 精确 50/50 配额：一半一致（字义=颜色），一半不一致（字义≠颜色），再打乱 */
  function stroopSequence(n) {
    var half = Math.floor(n / 2);
    var seq = [];
    var i, w, pool, ink;
    for (i = 0; i < half; i++) {
      w = COLORS[i % COLORS.length];
      seq.push({ word: w, ink: w, congru: true });
    }
    for (i = 0; i < n - half; i++) {
      w = COLORS[i % COLORS.length];
      pool = COLORS.filter(function (c) { return c !== w; });
      ink = pool[Math.floor(Math.random() * pool.length)];
      seq.push({ word: w, ink: ink, congru: false });
    }
    for (i = seq.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = seq[i]; seq[i] = seq[j]; seq[j] = tmp;
    }
    return seq;
  }

  function stroopSetButtons(on) {
    stroopBtns.forEach(function (b) {
      if (on) b.removeAttribute('disabled');
      else b.setAttribute('disabled', 'disabled');
    });
  }

  function stroopTrial() {
    if (stroop.idx >= STROOP_TRIALS) { stroopDone(); return; }
    var cur = stroop.seq[stroop.idx];
    stroop.word = cur.word;
    stroop.ink = cur.ink;
    stroop.congru = cur.congru;
    stroop.t0 = Date.now();
    stroop.locked = false;
    stroopWordEl.textContent = t(COLOR_NAMES[cur.word]);
    stroopWordEl.className = 'lab-exp-word ink-' + cur.ink;
    stroopProgEl.textContent = t('labCogsim.trialCount', { n: stroop.idx + 1 }) + ' / ' + STROOP_TRIALS +
      ' · ' + (cur.congru ? t('labCogsim.stroopCongruent') : t('labCogsim.stroopIncongruent'));
    /* 每道新题都要重新启用色块：上一题作答后按钮被禁用，若只依赖开始时启用，
       第 2 题起会一直处于 disabled 状态而无法作答。 */
    stroopSetButtons(true);
  }

  function stroopAnswer(color) {
    if (!stroop.running || stroop.locked) return;
    stroop.locked = true;
    var rt = Date.now() - stroop.t0;
    var okc = color === stroop.ink;
    stroop.nAll++;
    if (okc) stroop.okAll++;
    if (stroop.congru) { stroop.rtCong += rt; stroop.nCong++; }
    else { stroop.rtInc += rt; stroop.nInc++; }

    stroopBtns.forEach(function (b) {
      b.classList.remove('flash-ok', 'flash-err');
      if (b.getAttribute('data-color') === color) b.classList.add(okc ? 'flash-ok' : 'flash-err');
    });
    stroopSetButtons(false);
    setTimeout(function () {
      stroopBtns.forEach(function (b) { b.classList.remove('flash-ok', 'flash-err'); });
      stroop.idx++;
      if (stroop.running) stroopTrial();
    }, 320);
  }

  function stroopDone() {
    stroop.running = false;
    stroopSetButtons(false);
    var acc = stroop.nAll ? Math.round((stroop.okAll / stroop.nAll) * 100) : 0;
    var rc = stroop.nCong ? Math.round(stroop.rtCong / stroop.nCong) : 0;
    var ri = stroop.nInc ? Math.round(stroop.rtInc / stroop.nInc) : 0;
    var diff = (stroop.nCong && stroop.nInc) ? ri - rc : 0;
    stroopWordEl.textContent = '';
    stroopWordEl.className = 'lab-exp-word';
    stroopProgEl.textContent = t('labCogsim.allDone');
    stroopResultEl.textContent =
      t('labCogsim.stroopResultDetail', { acc: acc, rc: rc, ri: ri }) +
      (stroop.nCong && stroop.nInc ? '；' + t('labCogsim.stroopDiff', { diff: diff }) : '') +
      '。' + t('labCogsim.stroopCompared');
    if (stroopStartEl) {
      stroopStartEl.removeAttribute('disabled');
      stroopStartEl.textContent = t('labCogsim.again');
    }
  }

  stroopBtnsEl.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-color]') : null;
    if (btn && !btn.hasAttribute('disabled')) stroopAnswer(btn.getAttribute('data-color'));
  });

  /* 键盘作答：Q=红 · W=蓝 · E=绿 · R=黄（与色块 data-key 角标一致）。
     只在实验进行中响应，并跳过输入控件、组合键与长按重复，避免干扰页面其他操作。 */
  var STROOP_KEYMAP = { q: 'red', w: 'blue', e: 'green', r: 'yellow' };
  var STROOP_CODEMAP = { KeyQ: 'red', KeyW: 'blue', KeyE: 'green', KeyR: 'yellow' };
  function stroopColorFromKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return null;
    var k = String(e.key || '').toLowerCase();
    if (STROOP_KEYMAP[k]) return STROOP_KEYMAP[k];
    return STROOP_CODEMAP[e.code] || null;
  }
  document.addEventListener('keydown', function (e) {
    if (!stroop.running || stroop.locked || e.repeat) return;
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    var color = stroopColorFromKey(e);
    if (!color) return;
    e.preventDefault();
    stroopBtns.forEach(function (b) {
      if (b.getAttribute('data-color') === color) {
        b.classList.add('key-down');
        setTimeout(function () { b.classList.remove('key-down'); }, 140);
      }
    });
    stroopAnswer(color);
  });

  function stroopStart() {
    if (stroop.running) return;
    stroop.running = true;
    stroop.idx = 0;
    stroop.locked = false;
    stroop.okAll = 0; stroop.nAll = 0;
    stroop.rtCong = 0; stroop.nCong = 0; stroop.rtInc = 0; stroop.nInc = 0;
    stroop.seq = stroopSequence(STROOP_TRIALS);
    stroopResultEl.textContent = '';
    if (stroopStartEl) {
      stroopStartEl.setAttribute('disabled', 'disabled');
      stroopStartEl.textContent = t('labCogsim.stroopStart');
    }
    stroopSetButtons(true);
    stroopTrial();
  }

  if (stroopStartEl) {
    stroopStartEl.addEventListener('click', stroopStart);
    stroopStartEl.textContent = t('labCogsim.stroopStart');
  }
  stroopProgEl.textContent = t('labCogsim.stroopIdle');
  stroopSetButtons(false);

  /* ============================ 2. 反应时 ============================ */
  var RT_TRIALS = 10;
  var rtHowEl = document.getElementById('rt-how');
  var rtStimEl = document.getElementById('rt-stim');
  var rtReadyEl = document.getElementById('rt-ready');
  var rtReactEl = document.getElementById('rt-react');
  var rtRedEl = document.getElementById('rt-red');
  var rtBlueEl = document.getElementById('rt-blue');
  var rtResultEl = document.getElementById('rt-result');
  var rtNoteEl = document.getElementById('rt-note');
  var rtKeysEl = document.getElementById('rt-keys');
  var rtStartBtn = document.getElementById('rt-start');
  var rtLastAnswerAt = 0;
  var rt = {
    running: false, mode: 'simple', idx: 0, correct: 0, rtSum: 0, rtCount: 0,
    timer: null, t0: 0, shown: false, earned: []
  };

  function rtMode() {
    var sel = document.querySelector('input[name="rt-mode"]:checked');
    return sel ? sel.value : 'simple';
  }
  function rtSetActions(on) {
    rtReactEl.hidden = !(on && rt.mode === 'simple');
    rtRedEl.hidden = !(on && rt.mode === 'choice');
    rtBlueEl.hidden = !(on && rt.mode === 'choice');
  }
  function rtPaintMode() {
    rtHowEl.textContent = t(rt.mode === 'simple' ? 'labCogsim.rtSimpleHow' : 'labCogsim.rtChoiceHow');
    rtNoteEl.textContent = t('labCogsim.rtCompared');
    /* 空格键提示只在简单反应时（有「反应」按钮）下有意义 */
    if (rtKeysEl) rtKeysEl.hidden = rt.mode !== 'simple';
  }
  function rtResetStage() {
    if (rt.timer) { clearTimeout(rt.timer); rt.timer = null; }
    rt.shown = false;
    rtStimEl.hidden = true;
    rtReadyEl.hidden = true;
    rtSetActions(false);
  }
  function rtTrial() {
    if (rt.idx >= RT_TRIALS) { rtDone(); return; }
    rt.shown = false;
    rtStimEl.hidden = true;
    rtReadyEl.hidden = false;
    rtReadyEl.textContent = t('labCogsim.rtWait');
    rtResultEl.textContent = t('labCogsim.rtTrialCount', { n: rt.idx + 1, total: RT_TRIALS });
    var delay = 800 + Math.random() * 1700;
    rt.timer = setTimeout(function () {
      rt.timer = null;
      if (!rt.running) return;
      rt.shown = true;
      rtReadyEl.hidden = true;
      rtStimEl.hidden = false;
      rtStimEl.className = 'lab-rt-stim ' + (rt.mode === 'choice' ? 'stim-' + (Math.random() < 0.5 ? 'red' : 'blue') : 'stim-gray');
      rt.t0 = Date.now();
    }, delay);
  }
  function rtAnswer(color) {
    if (!rt.running) return;
    /* 空格键会同时触发 keydown 与聚焦按钮的默认 click；60ms 去抖保证一次按键只计一次 */
    var nowMs = Date.now();
    if (nowMs - rtLastAnswerAt < 60) return;
    rtLastAnswerAt = nowMs;
    if (!rt.shown) {
      /* 提前点击（false start）：提示后重新安排本轮，不计入成绩。
         rtTrial() 会重写结果行，因此在它之后再补上提示文案。 */
      if (rt.timer) { clearTimeout(rt.timer); rt.timer = null; }
      rtTrial();
      rtResultEl.textContent = t('labCogsim.rtTooSoon') + ' · ' + rtResultEl.textContent;
      return;
    }
    rtStimEl.hidden = true;
    rtReadyEl.hidden = true;
    rt.shown = false;
    var rtNow = Date.now() - rt.t0;
    rt.rtSum += rtNow;
    rt.rtCount++;
    var okc = true;
    if (rt.mode === 'choice') {
      okc = rtStimEl.className.indexOf('stim-' + color) >= 0;
      if (okc) rt.correct++;
    } else {
      rt.correct++;
    }
    rtResultEl.textContent = (okc ? '✓ ' : '✗ ') + rtNow + ' ms';
    rt.idx++;
    rt.timer = setTimeout(function () { rtTrial(); }, 420);
  }
  function rtDone() {
    rt.running = false;
    rtResetStage();
    rtSetActions(false);
    var acc = rt.rtCount ? Math.round((rt.correct / rt.rtCount) * 100) : 0;
    var rtAvg = rt.rtCount ? Math.round(rt.rtSum / rt.rtCount) : 0;
    rtResultEl.textContent = t('labCogsim.rtResult', { n: rt.rtCount, rt: rtAvg, acc: acc }) +
      '。' + t('labCogsim.rtDoneHint');
    if (rtStartBtn) { rtStartBtn.removeAttribute('disabled'); rtStartBtn.textContent = t('labCogsim.again'); }
  }
  rtReactEl.addEventListener('click', function () { rtAnswer(null); });
  rtRedEl.addEventListener('click', function () { rtAnswer('red'); });
  rtBlueEl.addEventListener('click', function () { rtAnswer('blue'); });

  /* 空格键 = 「反应」：仅简单反应时、实验进行中生效。
     空格在按钮聚焦时还会触发浏览器合成的 click，rtAnswer 内的 60ms 去抖负责去重；
     preventDefault 同时阻止页面滚动与按钮默认激活。 */
  document.addEventListener('keydown', function (e) {
    if (!rt.running || rt.mode !== 'simple' || e.repeat) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var isSpace = e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space';
    if (!isSpace) return;
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    e.preventDefault();
    rtReactEl.classList.add('key-down');
    setTimeout(function () { rtReactEl.classList.remove('key-down'); }, 140);
    rtAnswer(null);
  });
  rtStartBtn.addEventListener('click', function () {
    if (rt.running) return;
    rt.running = true;
    rt.mode = rtMode();
    rt.idx = 0;
    rt.correct = 0;
    rt.rtSum = 0;
    rt.rtCount = 0;
    rtResultEl.textContent = '';
    rtPaintMode();
    rtSetActions(true);
    rtStartBtn.setAttribute('disabled', 'disabled');
    rtStartBtn.textContent = t('labCogsim.rtRunningLabel');
    rtTrial();
  });
  rtPaintMode();
  rtResetStage();
  rtReadyEl.hidden = false;
  rtReadyEl.textContent = t('labCogsim.rtIdle');

  /* ============================ 3. 记忆广度 ============================ */
  var DIGIT_MAX = 12;
  /* 答错后结果区停留时长：留出时间让用户看清正确答案 */
  var DIGIT_REVEAL_MS = 1600;
  var digitStartEl = document.getElementById('digit-start');
  var digitDisplayEl = document.getElementById('digit-display');
  var digitInputRowEl = document.getElementById('digit-input-row');
  var digitInputEl = document.getElementById('digit-input');
  var digitSubmitEl = document.getElementById('digit-submit');
  var digitResultEl = document.getElementById('digit-result');
  var digit = { running: false, len: 3, attempt: 1, seq: '', timer: null, best: 0, locked: false };

  function digitSeq(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(Math.floor(Math.random() * 10));
    return out.join('');
  }
  function digitShow() {
    /* 新数字串出现前先清空填写框，避免上一轮的答案残留 */
    digit.locked = false;
    digitInputEl.value = '';
    digit.seq = digitSeq(digit.len);
    digitDisplayEl.textContent = digit.seq;
    digitResultEl.textContent = t('labCogsim.trialCount', { n: digit.len }) + '（' + digit.attempt + '/2）';
    var ms = 1000 + digit.len * 250;
    digit.timer = setTimeout(function () {
      digitDisplayEl.textContent = '';
      digitInputRowEl.hidden = false;
      digitInputEl.value = '';
      digitInputEl.focus();
    }, ms);
  }
  /* 答错的统一提示：错误徽标 + 本题正确答案，方便对照记忆 */
  function digitWrongText() {
    return t('labCogsim.errBadge') + ' · ' + t('labCogsim.digitAnswerReveal', { seq: digit.seq });
  }
  function digitAnswer() {
    /* locked：上一题的正误反馈展示期间忽略重复提交 */
    if (!digit.running || digit.locked) return;
    var ans = digitInputEl.value.replace(/\s+/g, '');
    digitInputEl.value = '';
    digitInputRowEl.hidden = true;
    digit.locked = true;
    if (ans === digit.seq) {
      if (digit.attempt === 1) {
        digit.attempt = 2;
        digitResultEl.textContent = t('labCogsim.okBadge');
        setTimeout(digitShow, 600);
      } else {
        digit.best = digit.len;
        digit.len++;
        digit.attempt = 1;
        digitResultEl.textContent = t('labCogsim.okBadge');
        if (digit.len > DIGIT_MAX) { digitDone(); return; }
        setTimeout(digitShow, 600);
      }
    } else {
      /* 答错：先显示正确答案，停留片刻后再进入下一轮或结束 */
      digitResultEl.textContent = digitWrongText();
      if (digit.attempt === 1) {
        digit.attempt = 2;
        setTimeout(digitShow, DIGIT_REVEAL_MS);
      } else {
        var wrongSeq = digit.seq;
        setTimeout(function () { digitDone(wrongSeq); }, DIGIT_REVEAL_MS);
      }
    }
  }
  function digitDone(lastWrongSeq) {
    digit.running = false;
    digit.locked = false;
    var span = digit.best >= 3 ? digit.best : 2;
    var summary = t('labCogsim.digitDone', { n: span });
    /* 最后一题答错时，总结文案里也带上正确答案，避免一闪而过 */
    if (lastWrongSeq) summary += ' · ' + t('labCogsim.digitAnswerReveal', { seq: lastWrongSeq });
    digitResultEl.textContent = summary;
    digitDisplayEl.textContent = '';
    digitInputRowEl.hidden = true;
    digitInputEl.blur();
    if (digitStartEl) digitStartEl.removeAttribute('disabled');
  }
  digitStartEl.addEventListener('click', function () {
    if (digit.running) return;
    digit.running = true;
    digit.locked = false;
    digit.len = 3;
    digit.attempt = 1;
    digit.best = 0;
    digitResultEl.textContent = '';
    digitStartEl.setAttribute('disabled', 'disabled');
    digitShow();
  });
  digitSubmitEl.addEventListener('click', digitAnswer);
  digitInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); digitAnswer(); }
  });

  /* ============================ 对外接口 ============================ */
  /* 自测脚本直接调用这些入口，因此启动前先切到对应模块，保证面板可见 */
  window.NB.labCogsim = {
    STROOP_TRIALS: STROOP_TRIALS,
    RT_TRIALS: RT_TRIALS,
    stroopStart: function () { showExp('stroop'); stroopStart(); },
    stroopAnswer: stroopAnswer,
    rtStart: function () { showExp('rt'); rtStartBtn.click(); },
    rtAnswer: rtAnswer,
    digitStart: function () { showExp('digit'); digitStartEl.click(); },
    digitAnswer: digitAnswer,
    state: function () {
      return {
        stroop: { running: stroop.running, idx: stroop.idx, locked: stroop.locked, congru: stroop.nCong, incongru: stroop.nInc },
        rt: { running: rt.running, mode: rt.mode, idx: rt.idx, shown: rt.shown },
        digit: { running: digit.running, len: digit.len, attempt: digit.attempt, seq: digit.seq, locked: digit.locked }
      };
    }
  };
})();
