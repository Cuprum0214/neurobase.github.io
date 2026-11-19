/* BCI 案例拆解：四个代表性案例按「问题 / 范式 / 信号 / 解码 / 性能 / 局限」六环节展示。
   全部文案走 i18n（labBci.*），导出 NB.labBci 供自测。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var esc = NB.esc;

  NB.mountShell('lab');

  var STEPS = [
    { key: 'problem', icon: '🎯' },
    { key: 'paradigm', icon: '🔁' },
    { key: 'signal', icon: '📡' },
    { key: 'decode', icon: '🧮' },
    { key: 'perf', icon: '📊' },
    { key: 'limit', icon: '⚠️' }
  ];
  var CASES = [1, 2, 3, 4];

  var labelEl = document.getElementById('bci-case-label');
  var titleEl = document.getElementById('bci-case-title');
  var descEl = document.getElementById('bci-case-desc');
  var stepsEl = document.getElementById('bci-steps');
  var takeawayEl = document.getElementById('bci-takeaway');

  function renderCase(n) {
    var idx = CASES.indexOf(n);
    if (idx < 0) return;
    document.querySelectorAll('.bci-case-nav [data-case]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-case') === String(n)));
    });
    labelEl.textContent = t('labBci.caseLabel', { n: n });
    titleEl.textContent = t('labBci.case' + n + 'Title');
    descEl.textContent = t('labBci.case' + n + 'Desc');
    stepsEl.innerHTML = STEPS.map(function (s) {
      return '<li class="bci-step">' +
        '<span class="bci-step-icon" aria-hidden="true">' + s.icon + '</span>' +
        '<span class="bci-step-body">' +
          '<span class="bci-step-label">' + esc(t('labBci.step' + cap(s.key))) + '</span>' +
          '<span class="bci-step-text">' + esc(t('labBci.case' + n + cap(s.key))) + '</span>' +
        '</span>' +
      '</li>';
    }).join('');
    takeawayEl.textContent = t('labBci.takeaway');
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  document.querySelectorAll('.bci-case-nav [data-case]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      renderCase(parseInt(btn.getAttribute('data-case'), 10));
    });
  });

  renderCase(1);

  window.NB.labBci = {
    STEPS: STEPS,
    CASES: CASES,
    render: renderCase
  };
})();
