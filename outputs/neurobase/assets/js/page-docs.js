/* 项目文件：按目录分组列出 docs/ 下的文档与数据文件；?doc=<slug> 渲染单篇内容 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var D = window.NB_DOCS;

  NB.mountShell('about');

  var files = (D && D.files) || [];
  var params = new URLSearchParams(window.location.search);
  var slug = String(params.get('doc') || '');

  var listEl = document.getElementById('nb-docs-list');
  var viewEl = document.getElementById('nb-docs-view');

  function fmtSize(n) {
    if (!n && n !== 0) return '';
    return n < 1024 ? n + ' B' : (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB';
  }
  function extClass(ext) {
    return ext === 'json' ? ' is-json' : ext === 'sql' ? ' is-sql' : ' is-md';
  }
  function groupTitle(g) {
    return g ? D.source + g + '/' : D.source;
  }
  /* 清单里的 path 是相对 docs/ 的（source = 'docs/'），展示时补全为完整路径 */
  function fullPath(f) {
    return f.path.indexOf(D.source) === 0 ? f.path : D.source + f.path;
  }

  /* ---------- 清单视图 ---------- */
  function renderList() {
    var metaEl = document.getElementById('nb-docs-meta');
    if (metaEl) {
      metaEl.textContent = t('docs.count', { n: files.length }) +
        ' · ' + t('docs.updatedAt') + ' ' + NB.fmtDate(D.generatedAt);
    }

    var groups = [];
    files.forEach(function (f) {
      var key = f.group || '';
      var g = groups.filter(function (x) { return x.key === key; })[0];
      if (!g) { g = { key: key, items: [] }; groups.push(g); }
      g.items.push(f);
    });

    var host = document.getElementById('nb-docs-groups');
    host.innerHTML = groups.map(function (g) {
      var rows = g.items.map(function (f) {
        return '<li>' +
          '<a class="file-row" href="docs.html?doc=' + encodeURIComponent(f.slug) + '">' +
            '<span class="file-ext' + extClass(f.ext) + '">' + NB.esc(f.ext) + '</span>' +
            '<span class="file-name">' + NB.esc(f.name) + '</span>' +
            '<span class="file-title">' + NB.esc(f.title || '') + '</span>' +
            '<span class="file-size">' + NB.esc(fmtSize(f.size)) + '</span>' +
          '</a>' +
        '</li>';
      }).join('');
      return '<p class="doc-group-title">' + NB.esc(groupTitle(g.key)) + '</p>' +
        '<ul class="file-list">' + rows + '</ul>';
    }).join('');
  }

  /* ---------- 详情视图 ---------- */
  function renderDoc() {
    var f = files.filter(function (x) { return x.slug === slug; })[0];
    var body = document.getElementById('nb-doc-body');

    listEl.hidden = true;
    viewEl.hidden = false;

    if (!f) {
      document.getElementById('nb-doc-title').textContent = t('docs.notFound');
      document.getElementById('nb-doc-path').textContent = slug;
      body.innerHTML = '<p class="notice">' + NB.esc(t('docs.notFound')) + '</p>';
      return;
    }

    document.getElementById('nb-doc-title').textContent = f.title || f.name;
    document.getElementById('nb-doc-path').textContent = fullPath(f);
    var extEl = document.getElementById('nb-doc-ext');
    extEl.textContent = f.ext;
    extEl.className = 'file-ext' + extClass(f.ext);
    document.getElementById('nb-doc-size').textContent = fmtSize(f.size);
    document.title = (f.title || f.name) + ' · NeuroBase';

    if (f.html !== undefined) {
      body.innerHTML = f.html;
    } else {
      body.innerHTML = '<pre class="md-pre"><code>' + NB.esc(f.text || '') + '</code></pre>';
    }
  }

  if (slug) renderDoc(); else renderList();
})();
