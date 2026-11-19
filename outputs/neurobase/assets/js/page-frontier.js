/* 科研前沿速览：按类型筛选 + 日期倒序卡片（原题 / 自撰摘要 / 期刊作者 DOI / 关联词条） */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var F = window.NB_FRONTIER;

  NB.mountShell('explore');

  function isEn() { return NB.locale() === 'en'; }
  function pick(zh, en) { return isEn() ? (en || zh || '') : (zh || en || ''); }

  var items = ((F && F.items) || []).slice().sort(function (a, b) {
    return String(b.date || '').localeCompare(String(a.date || ''));
  });
  var kinds = [];
  items.forEach(function (it) {
    if (it.kind && kinds.indexOf(it.kind) < 0) kinds.push(it.kind);
  });
  var state = { kind: '' };

  document.getElementById('nb-frontier-note').textContent = pick(F && F.meta && F.meta.note_zh, F && F.meta && F.meta.note_en);
  document.getElementById('nb-frontier-source').textContent = t('frontier.source');

  function kindLabel(k) {
    var key = 'frontier.kind.' + k;
    var v = t(key);
    return v === key ? String(k || '') : v;
  }
  function countOf(k) {
    return k ? items.filter(function (it) { return it.kind === k; }).length : items.length;
  }

  function termChips(ids) {
    var html = (ids || []).map(function (id) {
      var term = NB.getTerm(id);
      if (!term) return '';
      return '<li><a class="chip-term" href="' + NB.hrefTerm(id) + '">' + NB.esc(NB.termName(term)) + '</a></li>';
    }).join('');
    return html ? '<ul class="chips frontier-terms">' + html + '</ul>' : '';
  }

  function itemHtml(it) {
    var tags = (it.tags || []).map(function (tag) {
      return '<li>' + NB.esc(tag) + '</li>';
    }).join('');
    var doiUrl = 'https://doi.org/' + String(it.doi || '').replace(/^https?:\/\/doi\.org\//, '');
    return '<li class="frontier-item" data-kind="' + NB.esc(it.kind || '') + '" id="fr-' + NB.esc(it.id) + '">' +
      '<div class="frontier-head">' +
        '<span class="pill pill-primary">' + NB.esc(kindLabel(it.kind)) + '</span>' +
        '<time class="frontier-date" datetime="' + NB.esc(it.date) + '">' + NB.esc(it.date) + '</time>' +
      '</div>' +
      '<h2 class="frontier-title">' + NB.esc(pick(it.title_zh, it.title_en)) + '</h2>' +
      (isEn() || !it.title_en ? '' : '<p class="frontier-title-en" lang="en">' + NB.esc(it.title_en) + '</p>') +
      '<p class="frontier-summary">' + NB.esc(pick(it.summary_zh, it.summary_en)) + '</p>' +
      '<p class="frontier-source">' +
        '<span class="frontier-journal">' + NB.esc(it.journal || '') + '</span>' +
        '<span aria-hidden="true"> · </span>' +
        '<span class="frontier-authors">' + NB.esc(it.authors || '') + '</span>' +
        '<span aria-hidden="true"> · </span>' +
        '<a href="' + NB.esc(doiUrl) + '" target="_blank" rel="noopener">DOI: ' + NB.esc(it.doi || '') + '</a>' +
      '</p>' +
      (tags ? '<ul class="chips frontier-tags">' + tags + '</ul>' : '') +
      termChips(it.term_ids) +
    '</li>';
  }

  function renderKinds() {
    var el = document.getElementById('nb-frontier-kinds');
    var html = '<button class="chip" type="button" data-kind="" aria-pressed="' + (state.kind === '') + '">' +
      NB.esc(t('frontier.filterAll')) + '（' + items.length + '）</button>';
    html += kinds.map(function (k) {
      return '<button class="chip" type="button" data-kind="' + NB.esc(k) + '" aria-pressed="' + (state.kind === k) + '">' +
        NB.esc(kindLabel(k)) + '（' + countOf(k) + '）</button>';
    }).join('');
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll('.chip'), function (btn) {
      btn.addEventListener('click', function () {
        state.kind = btn.getAttribute('data-kind') || '';
        renderKinds();
        renderList();
      });
    });
  }

  function renderList() {
    var list = state.kind ? items.filter(function (it) { return it.kind === state.kind; }) : items;
    document.getElementById('nb-frontier-list').innerHTML = list.map(itemHtml).join('');
    document.getElementById('nb-frontier-count').textContent =
      t('frontier.count', { n: list.length, total: items.length });
  }

  renderKinds();
  renderList();

  NB.frontierSummary = {
    total: items.length,
    newest: items.length ? items[0].date : '',
    kinds: kinds.length
  };
})();
