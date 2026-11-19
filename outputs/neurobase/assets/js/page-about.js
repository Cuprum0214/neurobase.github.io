/* 关于：模块数 / 词条目标（由数据实时算出）+ 项目文件入口（带真实文件数） */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;

  NB.mountShell('about');

  /* ---------- 知识模块数 ---------- */
  var mods = (window.NB_MODULES || []).slice();
  var modEl = document.getElementById('nb-about-modules');
  if (modEl) modEl.textContent = mods.length ? String(mods.length) : '—';

  /* ---------- 词条目标：各模块 target 之和；缺 target 时退化为当前已收录条数 ---------- */
  var terms = window.NB_TERMS || [];
  var target = mods.reduce(function (sum, m) {
    var n = parseInt(m && m.target, 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  var entEl = document.getElementById('nb-about-entries');
  if (entEl) entEl.textContent = target > 0 ? target + '+' : String(terms.length);

  /* ---------- 项目文件入口：把真实文件数填进文案 ---------- */
  var meta = window.NB_DOCS_META || null;
  var link = document.getElementById('nb-about-docs');
  if (link && meta && typeof meta.count === 'number') {
    var label = t('about.allDocs', { n: meta.count });
    /* allDocs 文案自带箭头；放回按钮文本，去掉重复的箭头后缀交由 CSS/文案本身处理 */
    link.textContent = label;
  }
})();
