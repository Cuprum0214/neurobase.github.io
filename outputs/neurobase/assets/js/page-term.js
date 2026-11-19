/* 词条详情：定义 / 通俗解释 / 工程对接 / 示意图 / 标签 / 相关术语 / 反向引用 / 来源核验 / 上下词条
   另含：主色「最近浏览」胶囊（与右下角「继续学习」同款）+ 折叠面板、朗读、复制链接 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var esc = NB.esc;
  var RECENT_SHOWN = 8;

  /* 来源登记（Phase 7）：标题 → 可核验检索入口 */
  var SRC_MAP = {};
  ((window.NB_SOURCES || {}).sources || []).forEach(function (s) { SRC_MAP[s.title] = s; });

  var id = new URLSearchParams(window.location.search).get('id') || '';
  var term = NB.getTerm(id);
  NB.mountShell('terms', { currentId: term ? term.id : id });

  var root = document.getElementById('nb-term');
  var crumbs = document.getElementById('nb-crumbs');

  /* ---------------- 未找到 ---------------- */
  if (!term) {
    document.title = t('term.notFoundTitle') + ' · NeuroBase';
    crumbs.innerHTML =
      '<a href="index.html">' + esc(t('term.breadcrumbHome')) + '</a>' +
      '<span class="sep">/</span>' +
      '<a href="terms.html">' + esc(t('term.breadcrumbTerms')) + '</a>';
    root.innerHTML =
      '<div class="not-found">' +
        '<p class="emoji" aria-hidden="true">🔍</p>' +
        '<h1>' + esc(t('term.notFoundTitle')) + '</h1>' +
        '<p>' + esc(t('term.notFoundDesc')) + '</p>' +
        '<a class="btn-primary nb-back" href="terms.html">' + esc(t('term.backToTerms')) + '</a>' +
      '</div>';
    NB.renderResume(id);
    return;
  }

  /* 记一次浏览（本地存储），并让悬浮键不再重复指向当前词条 */
  NB.progress.visit(term.id);
  NB.renderResume(term.id);

  var mod = NB.getModule(term.module);
  document.title = term.name_zh + ' · NeuroBase';

  /* ---------------- 面包屑 ---------------- */
  crumbs.innerHTML =
    '<a href="index.html">' + esc(t('term.breadcrumbHome')) + '</a>' +
    '<span class="sep">/</span>' +
    '<a href="terms.html">' + esc(t('term.breadcrumbTerms')) + '</a>' +
    (mod ? '<span class="sep">/</span><a href="' + NB.hrefTerms({ module: mod.id }) + '">' +
      esc(mod.code + ' ' + mod.name_zh) + '</a>' : '') +
    '<span class="sep">/</span><span class="current">' + esc(term.name_zh) + '</span>';

  /* ---------------- 分块渲染 ---------------- */
  function section(titleKey, inner, extraClass) {
    return '<section class="term-section' + (extraClass ? ' ' + extraClass : '') + '">' +
      '<h2 class="sec-title">' + esc(t(titleKey)) + '</h2>' + inner + '</section>';
  }
  function linkCards(list) {
    return '<ul class="grid-2">' + list.map(function (x) {
      return '<li><a class="card-link" href="' + NB.hrefTerm(x.id) + '">' +
        '<span class="name">' + esc(x.name_zh) + '</span>' +
        '<span class="en">' + esc(x.name_en || '') + '</span>' +
      '</a></li>';
    }).join('') + '</ul>';
  }

  var related = NB.resolveRelated(term);
  var backlinks = NB.getBacklinks(term.id);
  var adj = NB.getAdjacent(term.id);

  /* 最近浏览（不含当前词条） */
  var recent = NB.progress.recent().filter(function (x) { return x.id !== term.id; });
  var recentShown = recent.slice(0, RECENT_SHOWN);

  var recentButton = recentShown.length
    ? '<button class="btn-recent" id="nb-recent-btn" type="button" aria-expanded="false" aria-controls="nb-recent">' +
        '<span aria-hidden="true">↩</span>' +
        '<span>' + esc(t('term.recent')) + '</span>' +
        '<span class="pill-count">' + recentShown.length + '</span>' +
        '<span aria-hidden="true" id="nb-recent-caret">▾</span>' +
      '</button>'
    : '';
  var recentPanel = recentShown.length
    ? '<section class="recent-panel" id="nb-recent" hidden aria-label="' + esc(t('term.recentTitle')) + '">' +
        '<div class="recent-head">' +
          '<h2 class="recent-title">' + esc(t('term.recentTitle')) + '</h2>' +
          '<button class="recent-close" id="nb-recent-close" type="button" aria-label="' + esc(t('term.recentClose')) + '">✕ ' + esc(t('term.recentClose')) + '</button>' +
        '</div>' +
        '<ul class="recent-list">' + recentShown.map(function (x) {
          var m = NB.getModule(x.module);
          return '<li><a href="' + NB.hrefTerm(x.id) + '">' +
            '<span>' + esc(x.name_zh) + '</span>' +
            (m ? '<span class="pill-count">' + esc(m.code) + '</span>' : '') +
          '</a></li>';
        }).join('') + '</ul>' +
        '<p class="recent-hint">' + esc(t('term.recentHint')) + '</p>' +
      '</section>'
    : '';

  root.innerHTML =
    '<header class="term-header">' +
      '<div class="term-topbar">' +
        '<button class="btn-back" id="nb-back" type="button" data-back data-fallback="terms.html">' +
          '<span aria-hidden="true">←</span>' +
          '<span data-back-label>' + esc(t('action.back')) + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="term-title-row">' +
        (mod ? '<span class="pill pill-primary">' + esc(mod.code + ' · ' + mod.name_zh) + '</span>' : '') +
        '<h1>' + esc(term.name_zh) + '</h1>' +
        (term.name_en ? '<span class="term-name-en">' + esc(term.name_en) + '</span>' : '') +
      '</div>' +
      '<div class="badge-row">' +
        (term.abbr ? '<span class="abbr">' + esc(term.abbr) + '</span>' : '') +
        '<span class="pill pill-slate">' + esc(t('term.difficultyLabel')) + '：' + esc(NB.difficultyLabel(term.difficulty)) + '</span>' +
        '<span class="pill pill-slate">' + esc(t('term.updatedAt')) + ' ' + esc(NB.fmtDate(term.updated_at)) + '</span>' +
        '<span class="pill pill-slate">' + esc(term.pinyin) + '</span>' +
      '</div>' +
      '<div class="btn-row">' +
        recentButton +
        '<button class="btn" id="nb-read" type="button">🔊 ' + esc(t('term.read')) + '</button>' +
        '<button class="btn" id="nb-copy" type="button">' + esc(t('term.copyLink')) + '</button>' +
        '<button class="btn" id="nb-fav" type="button" aria-pressed="false">☆ ' + esc(t('learn.favoriteOn')) + '</button>' +
      '</div>' +
      recentPanel +
    '</header>' +

    section('term.definition', '<p class="definition-text">' + esc(term.definition) + '</p>') +
    (term.plain ? section('term.plain', '<p class="plain-text">' + esc(term.plain) + '</p>') : '') +
    (term.engineering_link ? section('term.engineering', '<p class="eng-text">' + esc(term.engineering_link) + '</p>') : '') +
    (term.figure ? section('term.figure',
      '<img class="term-figure" id="nb-figure" src="' + esc(term.figure) + '" loading="lazy" alt="' +
      esc(t('term.figureAlt', { name: term.name_zh })) + '">') : '') +
    (term.tags && term.tags.length
      ? section('term.tags', '<ul class="chips">' + term.tags.map(function (x) {
          return '<li>' + esc(x) + '</li>';
        }).join('') + '</ul>')
      : '') +
    (related.length ? section('term.related', linkCards(related)) : '') +
    (backlinks.length ? section('term.backlinks', linkCards(backlinks)) : '') +
    section('term.references',
      '<ul class="refs">' + (term.references || []).map(function (r) {
        var src = SRC_MAP[r.title];
        return '<li><div class="ref-item">' +
          '<div class="ref-head">' +
            '<span class="pill pill-primary">' + esc(NB.refTypeLabel(r.type)) + '</span>' +
            '<span class="ref-title">' + esc(r.title) + '</span>' +
          '</div>' +
          '<p class="ref-meta">' + esc(t('term.verifiedAt')) + ' ' + esc(NB.fmtDate(r.verified_at)) +
            (src ? ' · <a href="' + esc(src.url) + '" target="_blank" rel="noopener noreferrer">' +
              esc(t('term.verifyLink')) + '</a>' : '') +
          '</p>' +
        '</div></li>';
      }).join('') + '</ul>' +
      '<p class="source-note">' + esc(t('term.sourceNote')) + '</p>') +

    '<nav class="adj-nav" aria-label="' + esc(t('term.prev')) + ' / ' + esc(t('term.next')) + '">' +
      (adj.prev
        ? '<a href="' + NB.hrefTerm(adj.prev.id) + '"><span class="hint">← ' + esc(t('term.prev')) + '</span>' +
          '<span class="name">' + esc(adj.prev.name_zh) + '</span></a>'
        : '<span class="spacer"></span>') +
      (adj.next
        ? '<a class="next" href="' + NB.hrefTerm(adj.next.id) + '"><span class="hint">' + esc(t('term.next')) + ' →</span>' +
          '<span class="name">' + esc(adj.next.name_zh) + '</span></a>'
        : '<span class="spacer"></span>') +
    '</nav>';

  /* ---------------- 「最近浏览」折叠栏 ---------------- */
  var recentBtn = document.getElementById('nb-recent-btn');
  var recentBox = document.getElementById('nb-recent');
  if (recentBtn && recentBox) {
    var caret = document.getElementById('nb-recent-caret');
    var closeBtn = document.getElementById('nb-recent-close');
    var setOpen = function (open) {
      recentBox.hidden = !open;
      recentBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (caret) caret.textContent = open ? '▴' : '▾';
    };
    recentBtn.addEventListener('click', function () { setOpen(recentBox.hidden); });
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { setOpen(false); recentBtn.focus(); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !recentBox.hidden) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (recentBox.hidden) return;
      if (recentBox.contains(e.target) || recentBtn.contains(e.target)) return;
      setOpen(false);
    });
  }

  /* ---------------- 朗读 ---------------- */
  var readBtn = document.getElementById('nb-read');
  var speaking = false;
  var paintRead = function () { readBtn.textContent = (speaking ? '⏹ ' : '🔊 ') + t(speaking ? 'term.readStop' : 'term.read'); };
  readBtn.addEventListener('click', function () {
    if (!('speechSynthesis' in window)) {
      readBtn.disabled = true;
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      speaking = false;
      paintRead();
      return;
    }
    var u = new SpeechSynthesisUtterance([term.name_zh, term.definition, term.plain].filter(Boolean).join('。'));
    u.lang = 'zh-CN';
    u.onend = function () { speaking = false; paintRead(); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    speaking = true;
    paintRead();
  });

  /* ---------------- 左上角「返回」：按来源页面命名，回到上一页 ---------------- */
  var backBtn = document.getElementById('nb-back');
  if (backBtn) NB.initBack(backBtn);

  /* ---------------- 收藏 ---------------- */
  var favBtn = document.getElementById('nb-fav');
  var paintFav = function () {
    var on = NB.learn.favorites.has(term.id);
    favBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    favBtn.textContent = (on ? '★ ' : '☆ ') + t(on ? 'learn.favoriteOff' : 'learn.favoriteOn');
  };
  paintFav();
  favBtn.addEventListener('click', function () {
    NB.learn.favorites.toggle(term.id);
    paintFav();
  });

  /* ---------------- 复制链接 ---------------- */
  var copyBtn = document.getElementById('nb-copy');
  copyBtn.addEventListener('click', function () {
    var url = window.location.href;
    var done = function () {
      copyBtn.textContent = t('term.copied');
      window.setTimeout(function () { copyBtn.textContent = t('term.copyLink'); }, 1500);
    };
    var legacy = function () {
      try {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', 'readonly');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch (e) {
        window.prompt(t('term.copyLink'), url);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, legacy);
    } else {
      legacy();
    }
  });

  /* ---------------- 示意图：文件缺失时整块隐藏（不显示破图） ---------------- */
  var fig = document.getElementById('nb-figure');
  if (fig) {
    fig.addEventListener('error', function () {
      var box = fig.closest('.term-section');
      if (box && box.parentNode) box.parentNode.removeChild(box);
    });
  }
})();
