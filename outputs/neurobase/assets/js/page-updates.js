/* 数据来源与最近更新（Phase 7）：概览 / 最近更新 / 来源登记 / 同步记录与待审队列 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var SRC = window.NB_SOURCES || { meta: {}, sources: [] };
  var UPD = window.NB_UPDATES || { meta: {}, runs: [], queue: [] };

  NB.mountShell('explore');

  var today = new Date().toISOString().slice(0, 10);
  var dayMs = 86400000;
  var sources = SRC.sources || [];
  var runs = UPD.runs || [];
  var queue = UPD.queue || [];
  var terms = NB.TERMS || [];

  var recentWindow = new Date(new Date(today + 'T00:00:00Z').getTime() - 30 * dayMs).toISOString().slice(0, 10);
  var recentUpdates = terms.filter(function (x) { return String(x.updated_at || '').slice(0, 10) >= recentWindow; });
  var pending = queue.filter(function (q) { return q.status === 'pending'; });

  /* ---------- 概览 ---------- */
  var stats = [
    { n: terms.length, key: 'updates.statTerms' },
    { n: sources.length, key: 'updates.statSources' },
    { n: recentUpdates.length, key: 'updates.statRecent' },
    { n: pending.length, key: 'updates.statPending' }
  ];
  document.getElementById('upd-stats').innerHTML = stats.map(function (s) {
    return '<li class="eco-stat"><b>' + s.n + '</b><span>' + NB.esc(t(s.key)) + '</span></li>';
  }).join('');

  var lastRun = runs[0];
  var statusText = lastRun
    ? t('updates.statusLine', {
        date: NB.fmtDate(lastRun.finished_at || lastRun.started_at),
        mode: lastRun.mode,
        status: t('updates.runStatus.' + lastRun.status)
      })
    : t('updates.statusNone');
  var coverage = SRC.meta && SRC.meta.term_without_source === 0 ? t('updates.coverageOk') : t('updates.coverageBad');
  document.getElementById('upd-status').innerHTML =
    '<span class="upd-badge">' + NB.esc(coverage) + '</span>' +
    '<span class="upd-badge">' + NB.esc(statusText) + '</span>';

  /* ---------- 最近更新 ---------- */
  var recent = terms
    .slice()
    .sort(function (a, b) { return String(b.updated_at || '').localeCompare(String(a.updated_at || '')) || String(a.id).localeCompare(String(b.id)); })
    .slice(0, 12);
  document.getElementById('upd-recent').innerHTML = recent.map(function (x) {
    var mod = NB.getModule(x.module);
    return '<li class="upd-item">' +
      '<a href="' + NB.hrefTerm(x.id) + '">' + NB.esc(x.name_zh) + '</a>' +
      '<span class="upd-item-meta">' + NB.esc(mod ? mod.code + ' · ' + mod.name_zh : x.module) +
        ' · ' + NB.esc(NB.fmtDate(x.updated_at)) +
        ' · ' + t('updates.refCount', { n: (x.references || []).length }) + '</span>' +
    '</li>';
  }).join('');

  /* ---------- 来源登记表 ---------- */
  document.getElementById('upd-sources').innerHTML = sources.map(function (s) {
    return '<tr>' +
      '<th scope="row" class="upd-source-title">' + NB.esc(s.title) + '</th>' +
      '<td><span class="pill pill-primary">' + NB.esc(NB.refTypeLabel(s.type)) + '</span></td>' +
      '<td>' + (s.terms || []).length + '</td>' +
      '<td>' + NB.esc(NB.fmtDate(s.verified_at)) + '</td>' +
      '<td><a href="' + NB.esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
        NB.esc(t('updates.open')) + '<span class="sr-only">（' + NB.esc(s.title) + '）</span></a></td>' +
    '</tr>';
  }).join('');

  /* ---------- 同步记录 ---------- */
  document.getElementById('upd-sync').innerHTML = runs.length
    ? runs.slice(0, 6).map(function (r) {
        return '<li class="upd-sync-item">' +
          '<span class="upd-badge">' + NB.esc(t('updates.runStatus.' + r.status)) + '</span>' +
          '<span>' + NB.esc(NB.fmtDate(r.finished_at || r.started_at)) + ' · ' + NB.esc(r.mode) +
            ' · ' + t('updates.checked', { n: r.checked }) +
            ' · ' + t('updates.changed', { n: r.changed }) + '</span>' +
          (r.note ? '<span class="upd-note">' + NB.esc(r.note) + '</span>' : '') +
        '</li>';
      }).join('')
    : '<li class="upd-empty">' + NB.esc(t('updates.noRuns')) + '</li>';

  document.getElementById('upd-queue').innerHTML = pending.length
    ? pending.slice(0, 10).map(function (q) {
        var label = q.kind === 'source-link' ? t('updates.kindLink') : t('updates.kindFrontier');
        return '<li class="upd-item">' +
          '<span class="pill pill-slate">' + NB.esc(label) + '</span> ' +
          '<span class="upd-item-title">' + NB.esc(q.target_id) + ' · ' + NB.esc(q.field) + '</span>' +
          '<span class="upd-item-meta">' + NB.esc(NB.fmtDate(q.detected_at)) +
            (q.note ? ' · ' + NB.esc(q.note) : '') + '</span>' +
        '</li>';
      }).join('')
    : '<li class="upd-empty">' + NB.esc(t('updates.noQueue')) + '</li>';

  /* 暴露统计用于自测断言（不参与渲染） */
  NB.updatesSummary = {
    terms: terms.length,
    sources: sources.length,
    recent: recentUpdates.length,
    pending: pending.length,
    runs: runs.length,
    sourceRows: sources.length,
    recentRows: recent.length
  };
})();

