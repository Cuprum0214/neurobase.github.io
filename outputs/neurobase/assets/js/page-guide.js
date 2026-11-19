/* 使用指南（guide.html）：只挂载框架层（顶栏 / 页脚），正文为静态内容。
   归属「关于」栏目高亮，与 about.html 一致。 */
(function () {
  'use strict';
  var NB = window.NB;
  if (!NB || typeof NB.mountShell !== 'function') return;
  NB.mountShell('about');
})();
