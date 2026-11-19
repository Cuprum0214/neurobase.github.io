/* 首页：知识模块导航 + 每日一词 + 学习进度 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;

  NB.mountShell('home');

  /* ---------- 11 个知识模块 ---------- */
  var targetSum = NB.MODULES.reduce(function (sum, m) { return sum + (m.target || 0); }, 0);
  document.getElementById('modules-target').textContent = t('home.targetLine', { n: targetSum });
  document.getElementById('modules').innerHTML = NB.MODULES.map(function (m) {
    var n = NB.termsByModule(m.id).length;
    return '<li>' +
      '<a class="mod-card" href="' + NB.hrefTerms({ module: m.id }) + '">' +
        '<span class="mod-icon" aria-hidden="true">' + NB.esc(m.icon) + '</span>' +
        '<span>' +
          '<span class="mod-name">' + NB.esc(m.name_zh) + '</span>' +
          '<span class="mod-sub">' + NB.esc(m.code + ' · ' + m.name_en) + '</span>' +
          '<span class="mod-sub">' + n + ' / ' + NB.esc(m.target) + '</span>' +
        '</span>' +
      '</a>' +
    '</li>';
  }).join('');

  /* ---------- 每日一词（按日期确定；「换一个」在本机临时切换） ---------- */
  var baseTerm = NB.getDailyTerm();
  var baseIndex = baseTerm ? NB.TERMS.indexOf(baseTerm) : -1;
  var offset = 0;
  var dailyBody = document.getElementById('daily-body');

  function renderDaily() {
    if (baseIndex < 0) return;
    var term = NB.TERMS[(baseIndex + offset) % NB.TERMS.length];
    var mod = NB.getModule(term.module);
    dailyBody.innerHTML =
      '<div class="badge-row">' +
        '<span class="pill pill-primary">' + NB.esc(mod ? mod.code + ' · ' + mod.name_zh : term.module) + '</span>' +
        (term.abbr ? '<span class="abbr">' + NB.esc(term.abbr) + '</span>' : '') +
      '</div>' +
      '<p class="daily-name">' + NB.esc(term.name_zh) +
        (term.name_en ? ' <span class="daily-hint">' + NB.esc(term.name_en) + '</span>' : '') + '</p>' +
      '<p class="daily-def" title="' + NB.esc(term.definition) + '">' + NB.esc(term.definition) + '</p>' +
      '<p class="daily-cta"><a class="btn-primary" href="' + NB.hrefTerm(term.id) + '">' + NB.esc(t('home.dailyCta')) + '</a></p>';
  }
  document.getElementById('daily-shuffle').addEventListener('click', function () {
    offset = (offset + 1) % NB.TERMS.length;
    renderDaily();
  });
  renderDaily();

  /* ---------- 学习进度 ---------- */
  var badge = document.getElementById('progress-badge');
  var bar = document.getElementById('progress-bar');
  var body = document.getElementById('progress-body');
  var clearBtn = document.getElementById('progress-clear');

  function renderProgress() {
    var count = NB.progress.count();
    var total = NB.progress.total();
    var pct = NB.progress.percent();
    badge.textContent = count + ' / ' + total;
    bar.style.width = pct + '%';
    bar.parentNode.setAttribute('aria-valuenow', String(pct));
    clearBtn.hidden = count === 0;

    var last = NB.progress.lastTerm();
    if (last) {
      body.innerHTML =
        '<p class="progress-line">' + NB.esc(t('progress.resumeLast')) + '：<strong>' + NB.esc(NB.termName(last)) + '</strong>' +
        ' · ' + NB.esc(t('progress.of', { n: count, total: total })) + '</p>' +
        '<a class="btn-primary progress-cta" href="' + NB.hrefTerm(last.id) + '">' +
        NB.esc(t('progress.resume')) + ' →</a>';
    } else {
      body.innerHTML = '<p class="progress-line">' + NB.esc(t('progress.empty')) + '</p>';
    }
  }
  clearBtn.addEventListener('click', function () {
    if (!window.confirm(t('progress.clear') + '？')) return;
    NB.progress.clear();
    renderProgress();
    NB.renderResume();
  });
  renderProgress();

  /* ---------- 数据来源与最近更新（Phase 7） ---------- */
  var updBox = document.getElementById('home-updates');
  if (updBox) {
    var recent = NB.TERMS.slice()
      .sort(function (a, b) {
        return String(b.updated_at || '').localeCompare(String(a.updated_at || '')) || String(a.id).localeCompare(String(b.id));
      })
      .slice(0, 3);
    var UPD = window.NB_UPDATES || { runs: [], queue: [] };
    var runs = UPD.runs || [];
    var last = runs[0];
    updBox.innerHTML = recent.map(function (x) {
      var mod = NB.getModule(x.module);
      return '<li class="upd-item">' +
        '<a href="' + NB.hrefTerm(x.id) + '">' + NB.esc(x.name_zh) + '</a>' +
        '<span class="upd-item-meta">' + NB.esc(mod ? mod.code + ' · ' + mod.name_zh : x.module) +
          ' · ' + NB.esc(NB.fmtDate(x.updated_at)) +
          ' · ' + t('updates.refCount', { n: (x.references || []).length }) + '</span>' +
      '</li>';
    }).join('') +
      (last
        ? '<li class="upd-item upd-item-run">' +
            '<span class="upd-badge">' + NB.esc(t('updates.runStatus.' + last.status)) + '</span>' +
            '<span class="upd-item-meta">' + NB.esc(t('updates.statusLine', {
              date: NB.fmtDate(last.finished_at || last.started_at),
              mode: last.mode,
              status: t('updates.runStatus.' + last.status)
            })) + '</span></li>'
        : '');
    NB.homeUpdates = { rows: recent.length, lastRun: last ? last.id : '' };
  }

  /* ---------- 首屏搜索：本地跳转（file:// 下也可用） ---------- */
  var form = document.getElementById('hero-search');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = document.getElementById('hero-q').value.trim();
    window.location.href = NB.hrefTerms({ q: q });
  });
})();
