/* 术语检索：模块筛选 + 自写搜索（中 / 英 / 缩写 / 拼音 / 别名 / 标签 / 释义）+ 命中高亮 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;

  NB.mountShell('terms');

  var params = new URLSearchParams(window.location.search);
  var state = {
    q: params.get('q') || '',
    module: NB.getModule(params.get('module')) ? params.get('module') : ''
  };

  var input = document.getElementById('nb-q');
  var select = document.getElementById('nb-module');
  var results = document.getElementById('nb-results');
  var empty = document.getElementById('nb-empty');
  var resultLine = document.getElementById('nb-result-line');

  /* ---------- 收藏夹 ---------- */
  var fav = NB.learn && NB.learn.favorites ? NB.learn.favorites : null;
  var favToggle = document.getElementById('nb-fav-toggle');
  var favPanel = document.getElementById('nb-fav-panel');
  var favList = document.getElementById('nb-fav-list');
  var favEmpty = document.getElementById('nb-fav-empty');
  var favCount = document.getElementById('nb-fav-count');
  var favCloseBtn = document.getElementById('nb-fav-close');

  function favItems() {
    if (!fav) return [];
    return fav.all().map(function (id) { return NB.getTerm(id); }).filter(Boolean);
  }

  function renderFav() {
    if (!fav || !favList) return;
    var items = favItems();
    favCount.textContent = String(items.length);
    favEmpty.hidden = items.length > 0;
    favEmpty.textContent = t('terms.favEmpty');
    favList.innerHTML = items.map(function (tm) {
      return '<li class="fav-item">' +
        '<a class="fav-link" href="' + NB.hrefTerm(tm.id) + '">' +
          '<span class="fav-star" aria-hidden="true">★</span>' +
          '<span class="fav-name">' + NB.esc(tm.name_zh) + '</span>' +
          (tm.name_en ? '<span class="fav-en">' + NB.esc(tm.name_en) + '</span>' : '') +
        '</a>' +
        '<button class="fav-remove" type="button" data-id="' + NB.esc(tm.id) + '" title="' +
          NB.esc(t('terms.favRemove')) + '" aria-label="' +
          NB.esc(t('terms.favRemove') + '：' + tm.name_zh) + '">×</button>' +
      '</li>';
    }).join('');
  }

  function favOpen(open) {
    if (!favPanel || !favToggle) return;
    favPanel.hidden = !open;
    favToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) renderFav();
  }

  if (favToggle && favPanel) {
    favToggle.addEventListener('click', function () {
      favOpen(favPanel.hidden);
    });
    if (favCloseBtn) {
      favCloseBtn.addEventListener('click', function () {
        favOpen(false);
        favToggle.focus();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !favPanel.hidden) { favOpen(false); favToggle.focus(); }
    });
    favList.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('.fav-remove') : null;
      if (!btn || !fav) return;
      e.preventDefault();
      fav.toggle(btn.getAttribute('data-id'));
      renderFav();
      render();
    });
    renderFav();
    /* 从词条页收藏后返回（bfcache 恢复）时刷新。
       仅在 persisted 时重渲染：首次加载的 pageshow 也会触发，
       若无条件 render 会重置 input.value，把用户刚输入的搜索词清空。 */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      renderFav();
      render();
    });
  }

  /* ---------- 模块下拉 ---------- */
  select.innerHTML = '<option value="">' + NB.esc(t('nb.allModules')) + '</option>' +
    NB.MODULES.map(function (m) {
      var n = NB.termsByModule(m.id).length;
      return '<option value="' + NB.esc(m.id) + '">' + NB.esc(m.code + ' ' + m.name_zh) + '（' + n + '）</option>';
    }).join('');

  /* ---------- 命中高亮（先打不可见标记再转义，避免破坏 HTML） ---------- */
  function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text) {
    var s = String(text == null ? '' : text);
    var tokens = state.q.split(/[\s\u3000]+/)
      .map(function (x) { return x.trim(); })
      .filter(Boolean)
      .sort(function (a, b) { return b.length - a.length; });
    tokens.forEach(function (tk) {
      s = s.replace(new RegExp(escRx(tk), 'gi'), function (m) { return '\u0002' + m + '\u0003'; });
    });
    return NB.esc(s).split('\u0002').join('<mark>').split('\u0003').join('</mark>');
  }

  function card(term) {
    var mod = NB.getModule(term.module);
    var starred = fav && fav.has(term.id);
    return '<li>' +
      '<a class="term-card' + (starred ? ' is-fav' : '') + '" href="' + NB.hrefTerm(term.id) + '">' +
        '<div class="term-card-top">' +
          '<span class="term-card-name">' +
            (starred ? '<span class="fav-star" aria-hidden="true">★</span>' : '') +
            hl(term.name_zh) +
          '</span>' +
          (mod ? '<span class="pill pill-primary">' + NB.esc(mod.code) + '</span>' : '') +
        '</div>' +
        (term.name_en ? '<p class="meta">' + hl(term.name_en) + (term.abbr ? ' · ' + NB.esc(term.abbr) : '') + '</p>' : '') +
        '<p class="term-card-def">' + hl(term.definition) + '</p>' +
      '</a>' +
    '</li>';
  }

  /* ---------- 渲染 ---------- */
  function syncUrl() {
    var qs = [];
    if (state.q) qs.push('q=' + encodeURIComponent(state.q));
    if (state.module) qs.push('module=' + encodeURIComponent(state.module));
    try {
      window.history.replaceState(null, '', 'terms.html' + (qs.length ? '?' + qs.join('&') : ''));
    } catch (e) { /* file:// 下个别浏览器不允许改写地址，忽略即可 */ }
  }

  function render() {
    var list = NB.searchTerms(state.q, state.module);
    input.value = state.q;
    select.value = state.module;
    results.innerHTML = list.map(card).join('');
    empty.hidden = list.length > 0;

    var mod = state.module ? NB.getModule(state.module) : null;
    resultLine.innerHTML =
      '<span>' + NB.esc(t('nb.resultCount', { n: list.length })) + '</span>' +
      (mod
        ? '<span class="pill pill-primary">' + NB.esc(t('nb.filtered', { name: mod.code + ' ' + mod.name_zh })) + '</span>' +
          '<button class="btn" type="button" id="nb-showall">' + NB.esc(t('nb.showAll')) + '</button>'
        : '');
    var showAll = document.getElementById('nb-showall');
    if (showAll) {
      showAll.addEventListener('click', function () {
        state.module = '';
        render();
        syncUrl();
      });
    }
    syncUrl();
  }

  var timer = null;
  input.addEventListener('input', function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      state.q = input.value.trim();
      render();
    }, 120);
  });
  select.addEventListener('change', function () {
    state.module = select.value;
    render();
  });

  render();
})();
