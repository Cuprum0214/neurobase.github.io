/* help.js — 全局「帮助」功能导览（离线版）
 * 导航按钮 #nb-help-open（mountShell 注入，位于反馈箱右侧）打开功能导览：
 * 依次介绍当前页面各部分，被介绍元素高亮（.tour-spot 高亮框 + 挖洞 box-shadow），
 * 其余背景变暗，气泡显示步骤进度 / 标题 / 概述 / 「讲解」要点 / 操作按钮。
 *
 * 高亮定位（v1.24.11 重写，见 D-031）：
 *   · 页面全局有 `scroll-behavior: smooth`，直接 scrollIntoView 后立刻取
 *     getBoundingClientRect 会读到「动画还没走完」的位置 → 高亮框落在旧位置。
 *     这里在程序滚动期间把 html 的 scroll-behavior 临时改成 auto，滚动同步完成后
 *     再测量；随后用两帧 rAF + 短时 settle 循环兜住字体/图片引起的后续重排。
 *   · 滚动目标不是一个点而是「可视带」：上边界避开 sticky 顶栏，下边界避开气泡，
 *     让被介绍元素落在气泡上方、顶栏下方的可见区域中央。
 *   · 顶栏内的元素（导航 / 字号控件 / 反馈箱 / 帮助）本身常驻可见，不触发滚动。
 *   · 窗口 resize / 页面滚动（程序滚动、键盘翻页）都会重新同步高亮框位置。
 * 纯前端无后端；全部样式走 NeuroBase CSS 变量 → 自动跟随明/暗主题与字号缩放。
 */
(function () {
  'use strict';
  var NB = window.NB || {};
  var t = NB.t || function (k) { return k; };
  var esc = NB.esc || function (s) { return String(s == null ? '' : s); };

  /* 步骤：依次介绍页面各部分（导航栏 → 字号调节 → 首页检索 → 每日一词 → 学习进度 → 知识模块 → 反馈箱 → 帮助）。
     · sel   —— 主选择器；同时写入 tour-spot 的 data-target，供自测与调试定位
     · sels  —— 可选候选列表（例如主导航在窄屏换成了 .main-nav-mobile），取第一个「有实际尺寸」的
     · points —— 「讲解」区块的要点条数（文案键：<key>Point1 … <key>PointN）
     启动时按当前页面实际存在的元素过滤：其他栏目页自动只保留通用步骤（导航 / 字号 / 反馈箱 / 帮助）。 */
  var STEPS = [
    { sel: '#nb-header .main-nav', sels: ['#nb-header .main-nav', '#nb-header .main-nav-mobile'], key: 'help.step1', points: 3 },
    { sel: '.toolbar .nav-font', key: 'help.step8', points: 2 },
    { sel: '#hero-search', key: 'help.step2', points: 2 },
    { sel: 'section[aria-labelledby="daily-title"]', key: 'help.step3', points: 2 },
    { sel: 'section[aria-labelledby="progress-title"]', key: 'help.step4', points: 2 },
    { sel: 'section[aria-labelledby="modules-title"]', key: 'help.step5', points: 2 },
    { sel: '#nb-fb-open', key: 'help.step6', points: 2 },
    { sel: '#nb-help-open', key: 'help.step7', points: 2 }
  ];

  var SPOT_PAD = 10;      /* 高亮框相对目标外扩的像素（描边不压住内容） */
  var EDGE = 12;          /* 高亮框与视口边缘的最小留白 */
  var SETTLE_MS = 700;    /* 步骤切换后持续校准的时长（兜住字体/图片重排） */

  /* ---------------- 引导层（惰性注入 document.body，同反馈箱 dialog 模式） ---------------- */
  var tour = null;
  var idx = 0;
  var active = STEPS;
  var settleUntil = 0;
  var rafId = 0;
  var bound = false;

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function ensureTour() {
    if (tour && tour.parentNode === document.body) return tour;
    tour = document.createElement('div');
    tour.className = 'tour-layer';
    tour.id = 'nb-tour';
    tour.hidden = true;
    tour.innerHTML =
      '<div class="tour-mask" id="nb-tour-mask"></div>' +
      '<div class="tour-spot" id="nb-tour-spot"></div>' +
      '<div class="tour-pop" id="nb-tour-pop" role="dialog" aria-modal="true" aria-labelledby="nb-tour-title" aria-describedby="nb-tour-desc">' +
        '<div class="tour-head">' +
          '<p class="tour-count" id="nb-tour-count"></p>' +
          '<span class="tour-progress" aria-hidden="true"><span class="tour-bar" id="nb-tour-bar"></span></span>' +
        '</div>' +
        '<h3 class="tour-title" id="nb-tour-title"></h3>' +
        '<p class="tour-desc" id="nb-tour-desc"></p>' +
        '<div class="tour-why" id="nb-tour-why">' +
          '<p class="tour-why-head" id="nb-tour-why-label"></p>' +
          '<ul class="tour-points" id="nb-tour-points"></ul>' +
        '</div>' +
        '<div class="tour-actions">' +
          '<button type="button" class="tour-skip" id="nb-tour-skip"></button>' +
          '<button type="button" class="tour-prev" id="nb-tour-prev">' +
            '<svg class="tour-prev-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 3 5.5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '<span id="nb-tour-prev-label"></span>' +
          '</button>' +
          '<button type="button" class="tour-next" id="nb-tour-next"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(tour);
    bindTour();
    return tour;
  }

  function bindTour() {
    qs('#nb-tour-skip', tour).addEventListener('click', close);
    qs('#nb-tour-prev', tour).addEventListener('click', prev);
    qs('#nb-tour-next', tour).addEventListener('click', next);
    if (!bound) {
      bound = true;
      /* 锁定滚动期间仍可能发生：键盘翻页 / 缩放 / 窗口尺寸变化 / 程序滚动。
         这些都会让目标元素相对视口的坐标变化，必须重新对齐高亮框。 */
      window.addEventListener('resize', function () { if (isOpen()) runSettle(); });
      window.addEventListener('scroll', function () { if (isOpen()) scheduleSync(); }, { passive: true });
      if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
        document.fonts.ready.then(function () { if (isOpen()) runSettle(); });
      }
    }
  }

  /* ---------------- 定位：滚动 + 测量 ---------------- */
  function current() { return active[idx]; }
  function count() { return active.length; }
  function isOpen() { return !!(tour && !tour.hidden); }

  /* 候选元素里挑「真实可见」的那个：有布局尺寸优先，其次退回第一个存在的元素
     （jsdom 等无布局环境所有 rect 都是 0，此时仍要保证步骤数量与 data-target 稳定）。
     必须逐个遍历同名节点：桌面导航与窄屏导航会各自渲染一份 #nb-fb-open / #nb-help-open，
     只取 querySelector 的第一个命中会拿到被 display:none 隐藏的桌面副本。 */
  function resolve(step) {
    var list = step.sels || [step.sel];
    var fallback = null;
    for (var i = 0; i < list.length; i++) {
      var nodes = document.querySelectorAll(list[i]);
      for (var j = 0; j < nodes.length; j++) {
        var el = nodes[j];
        if (!fallback) fallback = el;
        var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
        if (r && (r.width > 0 || r.height > 0)) return el;
      }
    }
    return fallback;
  }

  function inHeader(el) {
    return !!(el && el.closest && el.closest('#nb-header'));
  }

  /* 临时关掉平滑滚动 → 程序滚动同步生效，读到的 rect 就是最终位置。
     （页面 :root 上有 scroll-behavior: smooth，直接滚动会读出动画中间帧，高亮框必然偏。） */
  function instantScroll(fn) {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    try { fn(); } finally {
      if (prev) root.style.scrollBehavior = prev;
      else root.style.removeProperty('scroll-behavior');
    }
  }

  /* 可视带：上边界避开 sticky 顶栏，下边界避开气泡卡片 */
  function band() {
    var top = EDGE;
    var header = qs('#nb-header');
    if (header && header.getBoundingClientRect) {
      var hr = header.getBoundingClientRect();
      if (hr.height) top = Math.max(top, hr.bottom + EDGE);
    }
    var pop = qs('#nb-tour-pop', tour);
    var popTop = pop && pop.getBoundingClientRect ? pop.getBoundingClientRect().top : 0;
    var bottom = (popTop && popTop > top) ? popTop - EDGE : window.innerHeight - EDGE;
    if (bottom - top < 96) bottom = window.innerHeight - EDGE;
    return { top: top, bottom: bottom };
  }

  function scrollIntoBand(el) {
    var r = el.getBoundingClientRect();
    if (!r || (!r.width && !r.height)) return;
    if (inHeader(el)) return;                   /* 顶栏常驻可见，不滚 */
    var b = band();
    var h = Math.min(r.height, b.bottom - b.top);
    var targetTop;
    if (r.height > b.bottom - b.top) {
      targetTop = b.top;                        /* 比可视带还高：顶部对齐，露出起始部分 */
    } else {
      targetTop = b.top + (b.bottom - b.top - r.height) / 2;
    }
    if (r.top >= b.top - 1 && r.top + h <= b.bottom + 1) return;
    var dy = r.top - targetTop;
    if (Math.abs(dy) < 1) return;
    instantScroll(function () {
      try { window.scrollBy(0, dy); }
      catch (e) { window.scrollTo(0, (window.pageYOffset || 0) + dy); }
    });
  }

  /* 高亮框贴合目标矩形：上下左右各外扩 SPOT_PAD，但外扩量会被视口边缘吃掉
     （目标贴边时不让高亮框溢出屏幕，框线与元素边缘仍然重合）。 */
  function syncSpot() {
    if (!isOpen()) return;
    var step = current();
    var spot = qs('#nb-tour-spot', tour);
    if (!step || !spot) return;
    var el = resolve(step);
    spot.setAttribute('data-target', step.sel);
    if (!el || !el.getBoundingClientRect) return;
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) {
      /* 无布局环境（自测 / 隐藏元素）：保留一个 0 尺寸框，不写脏坐标 */
      spot.style.left = '0px';
      spot.style.top = '0px';
      spot.style.width = '0px';
      spot.style.height = '0px';
      tour.classList.add('no-target');
      return;
    }
    tour.classList.remove('no-target');
    var pl = Math.max(0, Math.min(SPOT_PAD, r.left));
    var pt = Math.max(0, Math.min(SPOT_PAD, r.top));
    var pr = Math.max(0, Math.min(SPOT_PAD, window.innerWidth - r.right));
    var pb = Math.max(0, Math.min(SPOT_PAD, window.innerHeight - r.bottom));
    spot.style.left = (r.left - pl) + 'px';
    spot.style.top = (r.top - pt) + 'px';
    spot.style.width = (r.width + pl + pr) + 'px';
    spot.style.height = (r.height + pt + pb) + 'px';
  }

  function scheduleSync() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      syncSpot();
    });
  }

  /* 步骤切换后的短时校准循环：滚动后的重排、字体替换、图片解码都可能改变目标尺寸 */
  function settleLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (!isOpen()) return;
    syncSpot();
    if (Date.now() > settleUntil) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0;
      settleLoop();
    });
  }

  function runSettle() {
    settleUntil = Date.now() + SETTLE_MS;
    settleLoop();
  }

  /* ---------------- 步骤渲染 ---------------- */
  function renderPoints(step) {
    var list = qs('#nb-tour-points', tour);
    if (!list) return;
    var box = qs('#nb-tour-why', tour);
    var n = step.points || 0;
    if (!n) {
      if (box) box.hidden = true;
      list.innerHTML = '';
      return;
    }
    if (box) box.hidden = false;
    var label = qs('#nb-tour-why-label', tour);
    if (label) label.textContent = t('help.explainTitle');
    list.innerHTML = '';
    for (var i = 1; i <= n; i++) {
      var text = t(step.key + 'Point' + i);
      if (!text || /Point\d+$/.test(text)) continue;   /* 缺键时不留空行 */
      var li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    }
  }

  function showStep() {
    if (!tour) return;
    var step = current();
    if (!step) return;
    qs('#nb-tour-title', tour).textContent = t(step.key + 'Title');
    qs('#nb-tour-desc', tour).textContent = t(step.key + 'Desc');
    qs('#nb-tour-count', tour).textContent = t('help.count', { cur: idx + 1, total: count() });
    renderPoints(step);
    qs('#nb-tour-prev', tour).disabled = idx === 0;
    qs('#nb-tour-prev-label', tour).textContent = t('help.prev');
    qs('#nb-tour-skip', tour).textContent = t('help.skip');
    qs('#nb-tour-next', tour).textContent = t(idx === count() - 1 ? 'help.done' : 'help.next');
    var bar = qs('#nb-tour-bar', tour);
    if (bar) bar.style.width = Math.round(((idx + 1) / count()) * 100) + '%';

    /* 先渲染文案 → 气泡高度确定 → 再按「去掉气泡后的可视带」滚动 → 最后测量高亮 */
    var el = resolve(step);
    if (el) scrollIntoBand(el);
    runSettle();
  }

  /* ---------------- 开关 ---------------- */
  function open() {
    var el = ensureTour();
    active = STEPS.filter(function (s) { return !!resolve(s); });
    idx = 0;
    el.hidden = false;
    document.body.classList.add('nb-touring');
    /* 先放下滚动锁再测量：锁定时 html 的 scrollbar-gutter 已为滚动条留位，
       锁定不会改变内容宽度（详见 D-031），因此高亮坐标与锁定前一致。 */
    showStep();
  }

  function close() {
    if (!tour) return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    settleUntil = 0;
    tour.hidden = true;
    document.body.classList.remove('nb-touring');
  }

  function next() { if (idx < count() - 1) { idx++; showStep(); } else { close(); } }
  function prev() { if (idx > 0) { idx--; showStep(); } }
  function goto(i) { if (i >= 0 && i < count()) { idx = i; showStep(); } }

  /* ---------------- 导航按钮入口（mountShell 注入的 #nb-help-open，委托到 document） ---------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('#nb-help-open') : null;
    if (btn) { e.preventDefault(); open(); }
  });

  /* ---------------- 对外（供自测 / 其他页面复用） ---------------- */
  window.NB.help = {
    STEPS: STEPS,
    open: open,
    close: close,
    isOpen: isOpen,
    current: current,
    count: count,
    next: next,
    prev: prev,
    goto: goto,
    sync: syncSpot
  };
})();
