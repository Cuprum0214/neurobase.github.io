/* 内容生态 hub：三板块入口卡 + 数据概览 + 建议使用顺序 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var ZONE = window.NB_BCI_ZONE;
  var MAP = window.NB_ENG_MAP;
  var FR = window.NB_FRONTIER;

  NB.mountShell('explore');

  var topics = (ZONE && ZONE.topics) || [];
  var pipeline = (ZONE && ZONE.pipeline) || [];
  var cases = (ZONE && ZONE.cases) || [];
  var groups = (MAP && MAP.groups) || [];
  var items = (FR && FR.items) || [];

  var zoneTerms = {};
  topics.forEach(function (tp) {
    (tp.terms || []).forEach(function (id) { zoneTerms[id] = true; });
  });
  (pipeline || []).forEach(function (st) {
    (st.terms || []).forEach(function (id) { zoneTerms[id] = true; });
  });

  var rows = 0;
  groups.forEach(function (g) { rows += (g.rows || []).length; });

  var stats = [
    { n: topics.length, key: 'explore.statTopics' },
    { n: Object.keys(zoneTerms).length, key: 'explore.statZoneTerms' },
    { n: rows, key: 'explore.statMapRows' },
    { n: items.length, key: 'explore.statFrontier' }
  ];
  document.getElementById('nb-eco-stats').innerHTML = stats.map(function (s) {
    return '<li class="eco-stat"><b>' + s.n + '</b><span>' + NB.esc(t(s.key)) + '</span></li>';
  }).join('');

  var cards = [
    {
      id: 'bci',
      icon: '🧠',
      href: 'bci.html',
      title: t('explore.zoneTitle'),
      desc: t('explore.zoneDesc'),
      meta: t('explore.zoneMeta', { topics: topics.length, terms: Object.keys(zoneTerms).length, cases: cases.length })
    },
    {
      id: 'bridge',
      icon: '🔌',
      href: 'bridge.html',
      title: t('explore.mapTitle'),
      desc: t('explore.mapDesc'),
      meta: t('explore.mapMeta', { groups: groups.length, rows: rows })
    },
    {
      id: 'frontier',
      icon: '📄',
      href: 'frontier.html',
      title: t('explore.frontierTitle'),
      desc: t('explore.frontierDesc'),
      meta: t('explore.frontierMeta', { n: items.length })
    },
    {
      id: 'updates',
      icon: '🗂️',
      href: 'updates.html',
      title: t('updates.ecoTitle'),
      desc: t('updates.ecoDesc'),
      meta: t('updates.ecoMeta', {
        sources: ((window.NB_SOURCES || {}).sources || []).length,
        terms: (window.NB_TERMS || []).length
      })
    }
  ];
  document.getElementById('nb-eco-cards').innerHTML = cards.map(function (c) {
    return '<a class="eco-card" id="eco-' + c.id + '" href="' + NB.esc(c.href) + '">' +
      '<span class="eco-icon" aria-hidden="true">' + c.icon + '</span>' +
      '<p class="eco-card-title">' + NB.esc(c.title) + '</p>' +
      '<p class="eco-card-desc">' + NB.esc(c.desc) + '</p>' +
      '<p class="eco-card-meta">' + NB.esc(c.meta) + '</p>' +
      '<span class="eco-card-cta">' + NB.esc(t('explore.open')) + ' <span aria-hidden="true">→</span></span>' +
    '</a>';
  }).join('');

  var steps = [
    t('explore.step1'),
    t('explore.step2'),
    t('explore.step3')
  ];
  document.getElementById('nb-eco-steps').innerHTML = steps.map(function (s, i) {
    return '<li class="eco-step"><span class="eco-step-no" aria-hidden="true">' + (i + 1) + '</span>' +
      '<span class="eco-step-text">' + NB.esc(s) + '</span></li>';
  }).join('');

  /* 暴露数据用于自测断言（不参与渲染） */
  NB.ecoSummary = {
    topics: topics.length,
    zoneTerms: Object.keys(zoneTerms).length,
    mapRows: rows,
    frontier: items.length
  };
})();
