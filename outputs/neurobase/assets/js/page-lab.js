/* 互动实验室入口页：四个互动模块卡片（脑解剖 / 认知实验 / 信号范式 / BCI 案例）。
   卡片链接与文案均由 i18n 提供，本脚本负责外壳挂载与可测接口导出。 */
(function () {
  'use strict';
  var NB = window.NB;

  NB.mountShell('lab');

  var CARDS = [
    { key: 'anatomy', href: 'lab-anatomy.html' },
    { key: 'cogsim', href: 'lab-cogsim.html' },
    { key: 'signals', href: 'lab-signals.html' },
    { key: 'bci', href: 'lab-bci.html' }
  ];

  /* 对外接口（供自测断言） */
  window.NB.lab = {
    CARDS: CARDS,
    cardCount: function () { return CARDS.length; }
  };
})();
