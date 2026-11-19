/* 教材导读：分类筛选 + 书目卡（难度 / 语言 / 模块 / 自撰导读）+ 学习路径 + 从词条来源定位 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var R = window.NB_READING;

  NB.mountShell('reading');

  var books = R.books || [];
  var cats = R.categories || [];
  var paths = R.reading_paths || [];
  var byId = {};
  books.forEach(function (b) { byId[b.id] = b; });

  var params = new URLSearchParams(window.location.search);
  var jumpId = String(params.get('book') || '');
  var initCat = String(params.get('cat') || '');
  var state = {
    cat: cats.some(function (c) { return c.id === initCat; }) ? initCat : ''
  };

  var catsEl = document.getElementById('nb-cats');
  var listEl = document.getElementById('nb-books');
  var pathsEl = document.getElementById('nb-paths');
  var jumpEl = document.getElementById('nb-jump');

  function isEn() { return NB.locale() === 'en'; }
  function bookTitle(b) { return isEn() ? (b.title || b.title_zh || '') : (b.title_zh || b.title || ''); }
  function bookSub(b) { return !isEn() && b.title_zh && b.title ? b.title : ''; }
  function catName(id) {
    var c = cats.filter(function (x) { return x.id === id; })[0];
    return c ? (isEn() ? c.name_en : c.name_zh) : id;
  }
  function catCount(id) { return books.filter(function (b) { return b.category === id; }).length; }
  function lvLabel(lv) { var k = 'reading.level.' + lv; var v = t(k); return v === k ? String(lv || '') : v; }
  function langLabel(lg) { var k = 'reading.language.' + lg; var v = t(k); return v === k ? String(lg || '') : v; }
  function noteOf(b) { return isEn() && b.note_en ? b.note_en : b.note; }
  function titleHtml(b) {
    var label = NB.esc(bookTitle(b));
    if (!b.url) return label;
    return '<a class="book-link" href="' + NB.esc(b.url) + '" target="_blank" rel="noopener" title="' +
      NB.esc(t('reading.link')) + '">' + label + '<span class="book-ext" aria-hidden="true">↗</span></a>';
  }

  /* ---------- 分类筛选 ---------- */
  function renderCats() {
    var html = '<button class="chip" type="button" data-cat="" aria-pressed="' + (state.cat === '') + '">' +
      NB.esc(t('reading.filterAll')) + '（' + books.length + '）</button>';
    html += cats.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + NB.esc(c.id) + '" aria-pressed="' + (state.cat === c.id) + '">' +
        NB.esc(catName(c.id)) + '（' + catCount(c.id) + '）</button>';
    }).join('');
    catsEl.innerHTML = html;
    Array.prototype.forEach.call(catsEl.querySelectorAll('.chip'), function (btn) {
      btn.addEventListener('click', function () {
        state.cat = btn.getAttribute('data-cat') || '';
        renderCats();
        renderBooks();
        syncUrl();
      });
    });
  }

  /* ---------- 书目卡 ---------- */
  function bookCard(b) {
    var mods = (b.modules || []).map(function (mid) {
      var m = NB.getModule(mid);
      if (!m) return '';
      var name = m.code + ' ' + NB.moduleName(m);
      return '<li title="' + NB.esc(name) + '">' + NB.esc(name) + '</li>';
    }).join('');

    var bits = [];
    if (b.edition) bits.push('第 ' + b.edition + ' 版');
    if (b.year) bits.push(String(b.year));
    if (b.publisher) bits.push(b.publisher);
    bits.push(langLabel(b.language));
    if (b.translated) bits.push('中译本');

    return '<li class="book-card' + (jumpId === b.id ? ' is-hl' : '') + '" id="book-' + NB.esc(b.id) + '">' +
      '<div class="book-head">' +
        '<div class="book-titles">' +
          '<p class="book-title">' + titleHtml(b) + '</p>' +
          (bookSub(b) ? '<p class="book-sub">' + NB.esc(bookSub(b)) + '</p>' : '') +
        '</div>' +
        '<span class="pill pill-primary">' + NB.esc(lvLabel(b.level)) + '</span>' +
      '</div>' +
      '<p class="book-authors">' + NB.esc((b.authors || []).join(', ')) + '</p>' +
      '<p class="book-meta">' + NB.esc(bits.join(' · ')) + '</p>' +
      '<p class="book-cat">' + NB.esc(catName(b.category)) + '</p>' +
      (b.note ? '<p class="book-note">' + NB.esc(noteOf(b)) + '</p>' : '') +
      (mods ? '<ul class="chips">' + mods + '</ul>' : '') +
    '</li>';
  }

  function renderBooks() {
    var list = state.cat ? books.filter(function (b) { return b.category === state.cat; }) : books;
    listEl.innerHTML = list.map(bookCard).join('');
  }

  /* ---------- 学习路径 ---------- */
  function renderPaths() {
    pathsEl.innerHTML = paths.map(function (p) {
      var steps = (p.steps || []).map(function (id) {
        var b = byId[id];
        return '<li>' + NB.esc(b ? bookTitle(b) : id) + '</li>';
      }).join('');
      return '<div class="path-card">' +
        '<p class="path-name">' + NB.esc(p.name) + '</p>' +
        '<ol class="path-steps">' + steps + '</ol>' +
      '</div>';
    }).join('');
  }

  function syncUrl() {
    try {
      window.history.replaceState(null, '', 'reading.html' + (state.cat ? '?cat=' + encodeURIComponent(state.cat) : ''));
    } catch (e) { /* file:// 下个别浏览器不允许改写地址，忽略即可 */ }
  }

  renderCats();
  renderBooks();
  renderPaths();

  /* 从词条来源跳转而来：?book=<id> → 清筛选、定位并高亮该教材 */
  var target = byId[jumpId];
  if (target) {
    jumpEl.hidden = false;
    jumpEl.textContent = t('reading.jumpNotice', { title: bookTitle(target) });
    var el = document.getElementById('book-' + jumpId);
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();
