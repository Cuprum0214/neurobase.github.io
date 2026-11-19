/* 测验 · 选题页（v47 分页流程）：选择范围/题型/题数后生成题目并跳转答题页。
   出题确定性可复现（seed = 日期+范围+题型）；会话存 localStorage(nb-qz-session)。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var L = NB.learn;

  NB.mountShell('learn');

  var TERMS = window.NB_TERMS || [];
  var MODULES = window.NB_MODULES || [];
  var BY_ID = {};
  TERMS.forEach(function (term) { BY_ID[term.id] = term; });

  var setupEl = document.getElementById('qz-setup');
  var moduleEl = document.getElementById('qz-module');
  var typesEl = document.getElementById('qz-types');
  var countEl = document.getElementById('qz-count');
  var feedbackEl = document.getElementById('qz-feedback');

  var SESSION_KEY = 'nb-qz-session';

  function isEn() { return NB.locale() === 'en'; }
  function termName(term) { return isEn() ? term.name_en : term.name_zh; }
  function termDef(term) { return isEn() && term.definition_en ? term.definition_en : term.definition; }
  function termPlain(term) { return isEn() && term.plain_en ? term.plain_en : term.plain; }

  /* ---------------- 模块下拉 ---------------- */
  function renderModules() {
    var html = '<option value="">' + NB.esc(t('quiz.moduleAll')) + '</option>';
    html += MODULES.map(function (m) {
      return '<option value="' + NB.esc(m.id) + '">' + NB.esc(NB.moduleName(m)) + '</option>';
    }).join('');
    moduleEl.innerHTML = html;
  }

  /* ---------------- 出题（确定性） ---------------- */
  function pickOptions(correct, all, rnd, n) {
    var rest = all.filter(function (x) { return x !== correct; });
    var picks = L.rng.shuffle(rest, rnd).slice(0, n - 1);
    var opts = L.rng.shuffle([correct].concat(picks), rnd);
    return opts;
  }

  function makeSingle(term, pool, rnd) {
    var stem = termDef(term) || termPlain(term) || '';
    var correct = term.id;
    var opts = pickOptions(correct, pool.map(function (p) { return p.id; }), rnd, 4);
    return {
      kind: 'single',
      termId: term.id,
      stem: stem,
      options: opts.map(function (id) {
        return { id: id, label: BY_ID[id] ? termName(BY_ID[id]) : id, correct: id === correct };
      })
    };
  }

  function makeMulti(term, pool, rnd) {
    var related = (term.related || []).filter(function (id) { return BY_ID[id]; });
    var correct = related.slice(0, 4);
    if (correct.length < 2) return null;
    var rest = pool.filter(function (p) { return p.id !== term.id && correct.indexOf(p.id) === -1; });
    var distract = L.rng.shuffle(rest, rnd).slice(0, Math.min(3, Math.max(2, rest.length))).map(function (p) { return p.id; });
    var opts = L.rng.shuffle(correct.concat(distract), rnd);
    return {
      kind: 'multi',
      termId: term.id,
      stem: t('quiz.multiStem', { name: termName(term) }),
      options: opts.map(function (id) {
        return { id: id, label: BY_ID[id] ? termName(BY_ID[id]) : id, correct: correct.indexOf(id) !== -1 };
      })
    };
  }

  function makeFill(term) {
    return {
      kind: 'fill',
      termId: term.id,
      stem: t('quiz.fillStem'),
      def: termDef(term) || termPlain(term) || ''
    };
  }

  function buildItems() {
    var mod = moduleEl.value;
    var pool = mod ? TERMS.filter(function (p) { return p.module === mod; }) : TERMS;
    var kinds = typesEl.value === 'mix' ? ['single', 'multi', 'fill'] : [typesEl.value];
    var count = Math.min(parseInt(countEl.value, 10) || 10, pool.length);
    var seed = 'quiz:' + NB.learn.todayStamp() + ':' + (mod || 'all') + ':' + typesEl.value;
    var rnd = L.rng.seeded(seed);
    var picked = L.rng.shuffle(pool, rnd).slice(0, count);
    var items = [];
    var qi = 0;
    picked.forEach(function (term) {
      var kind = kinds[qi % kinds.length];
      qi += 1;
      if (kind === 'multi') {
        var m = makeMulti(term, pool, rnd);
        if (m) { items.push(m); return; }
        kind = 'single';
      }
      if (kind === 'fill') { items.push(makeFill(term)); return; }
      items.push(makeSingle(term, pool, rnd));
    });
    return items;
  }

  /* ---------------- 事件 ---------------- */
  setupEl.addEventListener('submit', function (e) {
    e.preventDefault();
    feedbackEl.textContent = '';
    feedbackEl.className = 'sp-feedback';
    if (!TERMS.length) return;
    var items = buildItems();
    if (!items.length) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ items: items }));
    } catch (err) { /* 存储不可用时静默 */ }
    NB.go('quiz-run.html');
  });

  renderModules();
})();
