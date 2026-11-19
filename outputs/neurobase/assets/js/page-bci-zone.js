/* BCI 专区：主题聚合 + 链路六环节 + 案例入口；所有术语 chip 跳转词条详情页 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var Z = window.NB_BCI_ZONE;

  NB.mountShell('explore');

  function isEn() { return NB.locale() === 'en'; }
  function pick(zh, en) { return isEn() ? (en || zh || '') : (zh || en || ''); }

  var topics = (Z && Z.topics) || [];
  var pipeline = (Z && Z.pipeline) || [];
  var cases = (Z && Z.cases) || [];

  function termChips(ids) {
    var html = (ids || []).map(function (id) {
      var term = NB.getTerm(id);
      if (!term) return '';
      return '<li><a class="chip-term" href="' + NB.hrefTerm(id) + '">' + NB.esc(NB.termName(term)) + '</a></li>';
    }).join('');
    return html ? '<ul class="chips zone-terms">' + html + '</ul>' : '';
  }

  document.getElementById('nb-zone-note').textContent = pick(Z && Z.meta && Z.meta.note_zh, Z && Z.meta && Z.meta.note_en);
  document.getElementById('nb-zone-source').textContent = t('bciZone.source');

  document.getElementById('nb-zone-topics').innerHTML = topics.map(function (tp) {
    return '<article class="zone-topic" id="topic-' + NB.esc(tp.id) + '" data-topic="' + NB.esc(tp.id) + '">' +
      '<div class="zone-topic-head">' +
        '<span class="zone-icon" aria-hidden="true">' + NB.esc(tp.icon || '•') + '</span>' +
        '<h3 class="zone-topic-name">' + NB.esc(pick(tp.name_zh, tp.name_en)) + '</h3>' +
      '</div>' +
      '<p class="zone-desc">' + NB.esc(pick(tp.desc_zh, tp.desc_en)) + '</p>' +
      termChips(tp.terms) +
    '</article>';
  }).join('');

  document.getElementById('nb-zone-pipeline').innerHTML = pipeline.map(function (st) {
    return '<li class="pipeline-step" data-step="' + NB.esc(st.step) + '">' +
      '<span class="pipeline-no" aria-hidden="true">' + NB.esc(st.step) + '</span>' +
      '<p class="pipeline-name">' + NB.esc(pick(st.name_zh, st.name_en)) + '</p>' +
      '<p class="pipeline-desc">' + NB.esc(pick(st.desc_zh, st.desc_en)) + '</p>' +
      termChips(st.terms) +
    '</li>';
  }).join('');

  document.getElementById('nb-zone-cases').innerHTML = cases.map(function (c) {
    return '<a class="case-card" id="case-' + NB.esc(c.id) + '" href="' + NB.esc(c.href) + '">' +
      '<p class="case-name">' + NB.esc(pick(c.name_zh, c.name_en)) + '</p>' +
      '<p class="case-desc">' + NB.esc(pick(c.desc_zh, c.desc_en)) + '</p>' +
      '<span class="case-cta">' + NB.esc(t('bciZone.caseCta')) + ' <span aria-hidden="true">→</span></span>' +
    '</a>';
  }).join('');

  var seen = {};
  topics.forEach(function (tp) { (tp.terms || []).forEach(function (id) { seen[id] = true; }); });
  pipeline.forEach(function (st) { (st.terms || []).forEach(function (id) { seen[id] = true; }); });
  NB.zoneSummary = {
    topics: topics.length,
    pipeline: pipeline.length,
    cases: cases.length,
    uniqueTerms: Object.keys(seen).length
  };
})();
