/* 拼写与缩写训练 · 选题页（v47 分页流程）：选择模式/范围/题数后生成题目并跳转答题页。
   出题使用确定性随机（seed 不变可复现）；会话存 localStorage(nb-sp-session)。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var TERMS = window.NB_TERMS || [];
  var MODULES = window.NB_MODULES || [];

  var setupEl = document.getElementById('sp-setup');
  var modeEl = document.getElementById('sp-mode');
  var moduleEl = document.getElementById('sp-module');
  var countEl = document.getElementById('sp-count');
  var feedbackEl = document.getElementById('sp-feedback');

  var SESSION_KEY = 'nb-sp-session';
  var mode = 'zh2en';

  /* ---------------- 模块下拉 ---------------- */
  function renderModules() {
    var html = '<option value="">' + NB.esc(t('spelling.sourceAll')) + '</option>';
    html += MODULES.map(function (m) {
      return '<option value="' + NB.esc(m.id) + '">' + NB.esc(NB.moduleName(m)) + '</option>';
    }).join('');
    moduleEl.innerHTML = html;
  }

  /* ---------------- 出题 ---------------- */
  function termForMode(term) {
    if (mode === 'abbr') {
      /* 缩写训练需要可判定的缩写/短别名 */
      if (term.abbr) return true;
      if (Array.isArray(term.aliases) && term.aliases.some(function (a) { return a && a.length <= 6; })) return true;
      return false;
    }
    return true;
  }

  function buildItems() {
    var mod = moduleEl.value;
    var list = TERMS.filter(function (term) {
      if (!termForMode(term)) return false;
      if (mod) return term.module === mod;
      return true;
    });
    var count = parseInt(countEl.value, 10) || 10;
    var rnd = L.rng.seeded('spelling:' + mode + ':' + (mod || 'all'));
    return L.rng.shuffle(list, rnd).slice(0, Math.min(count, list.length)).map(function (term) {
      return { termId: term.id };
    });
  }

  /* ---------------- 事件 ---------------- */
  modeEl.addEventListener('change', function () { mode = modeEl.value; });

  setupEl.addEventListener('submit', function (e) {
    e.preventDefault();
    feedbackEl.textContent = '';
    feedbackEl.className = 'sp-feedback';
    var items = buildItems();
    if (!items.length) {
      feedbackEl.textContent = NB.esc(t('spelling.emptySource'));
      feedbackEl.className = 'sp-feedback bad';
      return;
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        mode: mode,
        items: items,
        idx: 0,
        results: [],
        correct: 0,
        done: 0,
        finished: false
      }));
    } catch (err) { /* 存储不可用时静默，导航后无法恢复 */ }
    NB.go('spelling-run.html?n=0');
  });

  renderModules();
})();
