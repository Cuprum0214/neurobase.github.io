/* 神经科学↔工程对照：分组筛选 + 双列对照表（左列跳转词条） */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var M = window.NB_ENG_MAP;

  NB.mountShell('explore');

  function isEn() { return NB.locale() === 'en'; }
  function pick(zh, en) { return isEn() ? (en || zh || '') : (zh || en || ''); }

  var groups = (M && M.groups) || [];
  var state = { group: '' };

  document.getElementById('nb-map-note').textContent = pick(M && M.meta && M.meta.note_zh, M && M.meta && M.meta.note_en);
  document.getElementById('nb-map-source').textContent = t('engMap.source');

  function rowCount() {
    var n = 0;
    groups.forEach(function (g) { n += (g.rows || []).length; });
    return n;
  }

  function renderCats() {
    var el = document.getElementById('nb-map-cats');
    var html = '<button class="chip" type="button" data-group="" aria-pressed="' + (state.group === '') + '">' +
      NB.esc(t('engMap.filterAll')) + '（' + rowCount() + '）</button>';
    html += groups.map(function (g) {
      return '<button class="chip" type="button" data-group="' + NB.esc(g.id) + '" aria-pressed="' + (state.group === g.id) + '">' +
        NB.esc(pick(g.name_zh, g.name_en)) + '（' + (g.rows || []).length + '）</button>';
    }).join('');
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll('.chip'), function (btn) {
      btn.addEventListener('click', function () {
        state.group = btn.getAttribute('data-group') || '';
        renderCats();
        filterGroups();
      });
    });
  }

  function termCell(termId, label) {
    var term = NB.getTerm(termId);
    if (!term) return '<span class="emap-neural">' + NB.esc(label) + '</span>';
    return '<a class="emap-neural emap-term" href="' + NB.hrefTerm(termId) + '">' + NB.esc(label) + '</a>';
  }

  function groupHtml(g) {
    var rows = (g.rows || []).map(function (r) {
      return '<tr id="row-' + NB.esc(r.id) + '">' +
        '<td class="emap-col-neural">' + termCell(r.term_id, pick(r.neural_zh, r.neural_en)) + '</td>' +
        '<td class="emap-col-eng">' + NB.esc(pick(r.eng_zh, r.eng_en)) + '</td>' +
        '<td class="emap-col-note">' + NB.esc(pick(r.note_zh, r.note_en)) + '</td>' +
      '</tr>';
    }).join('');
    return '<section class="emap-group" id="group-' + NB.esc(g.id) + '" data-group="' + NB.esc(g.id) + '">' +
      '<h2 class="sec-title">' + NB.esc(pick(g.name_zh, g.name_en)) + '</h2>' +
      '<p class="meta">' + NB.esc(pick(g.desc_zh, g.desc_en)) + '</p>' +
      '<div class="table-wrap">' +
        '<table class="emap-table">' +
          '<caption class="sr-only">' + NB.esc(pick(g.name_zh, g.name_en)) + '</caption>' +
          '<thead><tr>' +
            '<th scope="col">' + NB.esc(t('engMap.colNeural')) + '</th>' +
            '<th scope="col">' + NB.esc(t('engMap.colEng')) + '</th>' +
            '<th scope="col">' + NB.esc(t('engMap.colNote')) + '</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
    '</section>';
  }

  document.getElementById('nb-map-groups').innerHTML = groups.map(groupHtml).join('');

  function filterGroups() {
    Array.prototype.forEach.call(document.querySelectorAll('.emap-group'), function (sec) {
      sec.hidden = !!state.group && sec.getAttribute('data-group') !== state.group;
    });
  }

  renderCats();
  filterGroups();

  NB.mapSummary = { groups: groups.length, rows: rowCount() };
})();
