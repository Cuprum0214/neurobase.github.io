/* ============================================================================
   NeuroBase · AI 助教面板 ai-tutor.js（普通脚本，无依赖）

   行为：
     · 左下角固定浮标，点击展开对话面板（不与右下角「继续学习」胶囊冲突）
     · 提问转发到 Cloudflare Worker（cloud-config.js 的 workerUrl）
     · 自动附带当前词条上下文（?id= 命中时），提高术语对齐度
     · 未配置 / 断网 / 限流 / 服务异常 → 面板内提示，不影响其他功能
     · 每条回答都带固定免责声明（前端兜底，不依赖后端返回）

   依赖：core.js（NB.locale / NB.getTerm / NB.esc）、cloud.js（NB.cloud.askTutor）
   ============================================================================ */
(function () {
  'use strict';

  var TXT = {
    zh: {
      fab: 'AI 助教',
      title: 'AI 助教',
      sub: '只答神经科学、认知科学与学习方法',
      hello: '你好，我是 NeuroBase 的 AI 助教。可以问我术语区别、机制解释或记忆方法。',
      placeholder: '问一个神经科学问题…（Enter 发送，Shift+Enter 换行）',
      send: '发送',
      thinking: '思考中…',
      off: 'AI 助教尚未配置。在 assets/js/cloud-config.js 填入 workerUrl 后即可使用。',
      offline: '当前网络不可用，请连网后再试。',
      limited: '提问有点频繁，请等一分钟再试。',
      failed: '回答失败，请稍后重试。',
      empty: '请先输入问题。',
      disc: '以上内容由 AI 生成，仅供学习参考，不能替代教材与专业意见。',
      close: '关闭',
      chips: ['树突和轴突有什么区别？', '什么是动作电位？', 'P300 怎么用于脑机接口？', '怎么记住英文术语？']
    },
    en: {
      fab: 'AI Tutor',
      title: 'AI Tutor',
      sub: 'Neuroscience, cognitive science and study methods only',
      hello: 'Hi, I am the NeuroBase AI tutor. Ask me about term differences, mechanisms, or memory techniques.',
      placeholder: 'Ask a neuroscience question… (Enter to send, Shift+Enter for a new line)',
      send: 'Send',
      thinking: 'Thinking…',
      off: 'AI tutor is not configured. Set workerUrl in assets/js/cloud-config.js to enable it.',
      offline: 'Network unavailable. Please try again when online.',
      limited: 'Too many questions. Please wait a minute.',
      failed: 'Request failed. Please try again.',
      empty: 'Please type a question first.',
      disc: 'AI-generated content for study reference only; not a substitute for textbooks or professional advice.',
      close: 'Close',
      chips: ['Dendrite vs axon?', 'What is an action potential?', 'How is P300 used in BCI?', 'How to memorize English terms?']
    }
  };

  function lang() {
    try { return (window.NB && window.NB.locale && window.NB.locale() === 'en') ? 'en' : 'zh'; }
    catch (e) { return 'zh'; }
  }
  function T(key) {
    var table = TXT[lang()] || TXT.zh;
    return table[key] != null ? table[key] : (TXT.zh[key] != null ? TXT.zh[key] : key);
  }
  function esc(s) {
    if (window.NB && window.NB.esc) return window.NB.esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cloud() { return (window.NB && window.NB.cloud) || null; }
  function $(sel) { return document.querySelector(sel); }

  var history = [];
  var busy = false;
  var built = false;

  /* ---------------- 当前页面词条上下文（最多 2000 字） ---------------- */
  function pageContext() {
    try {
      var q = new URLSearchParams(window.location.search || '');
      var id = q.get('id');
      if (!id || !window.NB || typeof window.NB.getTerm !== 'function') return '';
      var term = window.NB.getTerm(id);
      if (!term) return '';

      var lines = [];
      lines.push('词条：' + [term.name_zh, term.name_en].filter(Boolean).join(' / '));
      if (term.aliases && term.aliases.length) lines.push('别名：' + term.aliases.join('、'));
      if (term.definition) lines.push('定义：' + term.definition);
      if (term.plain) lines.push('通俗解释：' + term.plain);
      if (term.engineering_link) lines.push('工程对接：' + term.engineering_link);

      var related = Array.isArray(term.related) ? term.related.slice(0, 3) : [];
      var relLines = related.map(function (rid) {
        var t2 = window.NB.getTerm(rid);
        if (!t2) return '';
        return '· ' + [t2.name_zh, t2.name_en].filter(Boolean).join(' / ') + '：' +
          String(t2.definition || '').slice(0, 80);
      }).filter(Boolean);
      if (relLines.length) lines.push('相关词条：\n' + relLines.join('\n'));

      return lines.join('\n').slice(0, 2000);
    } catch (e) { return ''; }
  }

  /* ---------------- 浮球拖动 / 定位 ---------------- */
  var POS_KEY = 'nb.ai.fab.pos';     /* 本地缓存：打开即还原 */
  var PREF_KEY = 'ai_fab';           /* 云端偏好键：跟着账号跨设备 */
  var MIN_GAP = 8;
  var DRAG_SLOP = 3;
  var dragMoved = false;
  var dragState = null;
  var userMoved = false;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function fabSize(fab) {
    var r = fab.getBoundingClientRect();
    return { w: r.width || 66, h: r.height || 66 };
  }

  /* 把球钉在 (x, y)，只夹在视口内，并标记左右半屏 */
  function pinFab(fab, x, y) {
    var s = fabSize(fab);
    var nx = clamp(x, MIN_GAP, Math.max(MIN_GAP, window.innerWidth - s.w - MIN_GAP));
    var ny = clamp(y, MIN_GAP, Math.max(MIN_GAP, window.innerHeight - s.h - MIN_GAP));
    fab.style.left = nx + 'px';
    fab.style.top = ny + 'px';
    fab.style.bottom = 'auto';
    fab.classList.toggle('nb-ai-fab--right', nx + s.w / 2 > window.innerWidth / 2);
    return { x: nx, y: ny, w: s.w, h: s.h };
  }

  /* 位置按视口比例记录，换设备 / 换分辨率都能落在相对位置 */
  function readPos(fab) {
    var left = parseFloat(fab.style.left);
    var top = parseFloat(fab.style.top);
    var r = fab.getBoundingClientRect();
    if (!isFinite(left)) left = r.left;
    if (!isFinite(top)) top = r.top;
    return {
      rx: +(left / Math.max(1, window.innerWidth)).toFixed(4),
      ry: +(top / Math.max(1, window.innerHeight)).toFixed(4)
    };
  }

  /* 落点保存：本地立即写，登录后同步到云端偏好 */
  function rememberFab(fab) {
    var pos = readPos(fab);
    try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch (e) { /* 隐私模式忽略 */ }
    var cloud = window.NB && window.NB.cloud;
    if (cloud && cloud.prefs && cloud.prefs.set) {
      try { cloud.prefs.set(PREF_KEY, pos); } catch (e2) { /* 云端失败不影响本地 */ }
    }
  }

  function applyPos(fab, rec) {
    if (!rec) return false;
    if (isFinite(rec.rx) && isFinite(rec.ry)) {
      pinFab(fab, rec.rx * window.innerWidth, rec.ry * window.innerHeight);
      return true;
    }
    if (isFinite(rec.x) && isFinite(rec.y)) {   /* 兼容 v1.23.6 的像素记录 */
      pinFab(fab, rec.x, rec.y);
      return true;
    }
    return false;
  }

  /* 先用本地缓存还原，再等云端偏好到达后校正（用户本次已拖过则不覆盖） */
  function restoreFab(fab) {
    var local = null;
    try { local = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { local = null; }
    applyPos(fab, local);

    var cloud = window.NB && window.NB.cloud;
    if (!cloud || !cloud.prefs || !cloud.isAuthed || !cloud.isAuthed()) return;
    var cached = cloud.prefs.get(PREF_KEY, null);
    if (cached && !userMoved) applyPos(fab, cached);
    Promise.resolve(cloud.prefs.pull()).then(function (r) {
      if (userMoved) return;
      var p = (r && r.ok && r.prefs && r.prefs[PREF_KEY]) || cloud.prefs.get(PREF_KEY, null);
      if (p) applyPos(fab, p);
    }).catch(function () { /* 离线时保持本地位置 */ });
  }

  /* ---------------- 液体物理 ---------------- */
  /* 球内浅水驱动（物理内核在 ai-fluid.js）。
     这里只负责把指针的 px/ms 换算成容器加速度，并管理 rAF 生命周期：
     容器的加速度（而不是速度）才是液体被甩起来的直接原因 —— 匀速拖动
     液面只微微滞后，急加速 / 急停才会真的把水堆到一边。
     引擎不可用（老浏览器、canvas 取不到 context）时返回 null，
     由下面的 CSS 弹簧模型接管，视觉降级但不报错。 */
  function createFluidDriver(fab, canvas) {
    var fluid = window.NB && window.NB.fluid;
    if (!fluid || !canvas || !fluid.create) return null;
    var eng = null;
    try { eng = fluid.create(canvas); } catch (e) { eng = null; }
    if (!eng) return null;

    if (eng.reduced) {
      return { press: function () {}, move: function () {}, release: function () {} };
    }

    var NOOP = { press: function () {}, move: function () {}, release: function () {} };
    if (!window.requestAnimationFrame) return NOOP;

    var axT = 0, ayT = 0, axS = 0, ayS = 0;
    var pvx = 0, pvy = 0, lastT = 0, lastMoveAt = 0;
    var lastVx = 0, lastVy = 0;
    var scale = 33;              /* CSS px per world unit（球半径） */
    var raf = 0, prev = 0, calmT = 0;

    function nowMs() {
      return (window.performance && window.performance.now) ? window.performance.now() : Date.now();
    }

    function measure() {
      var r = fab.getBoundingClientRect();
      var s = (r.width || 0) / 2;
      scale = s > 8 ? s : 33;
    }

    function tick(ts) {
      raf = 0;
      /* 「动画：关」时冻结液体：只静置渲染一帧，不再排下一帧（按压 / 拖动会重新 kick） */
      if (document.documentElement.classList.contains('motion-off')) {
        try { eng.setAccel(0, 0); eng.render(); } catch (e) { /* 忽略 */ }
        return;
      }
      var dt = prev ? Math.min(0.033, Math.max(0.008, (ts - prev) / 1000)) : 0.016;
      prev = ts;
      /* 手指停住后容器不再加速，惯性输入随之衰减 */
      if (lastMoveAt && nowMs() - lastMoveAt > 80) {
        axT *= 0.82;
        ayT *= 0.82;
      }
      var k = Math.min(1, dt * 22);
      axS += (axT - axS) * k;
      ayS += (ayT - ayS) * k;
      eng.setAccel(axS, ayS);
      eng.advance(dt);
      eng.render();
      if (eng.isCalm()) {
        calmT += dt;
        if (calmT > 0.35) {
          eng.setAccel(0, 0);
          eng.render();
          return;
        }
      } else {
        calmT = 0;
      }
      raf = window.requestAnimationFrame(tick);
    }

    function kick() {
      if (raf) return;
      calmT = 0;
      prev = 0;
      raf = window.requestAnimationFrame(tick);
    }

    return {
      press: function () {
        measure();
        lastMoveAt = nowMs();
        pvx = 0; pvy = 0; lastT = 0;
        lastVx = 0; lastVy = 0;
        /* 按压：容器被向下顶，液面整块上抬一下（液池振子驱动，见 ai-fluid.js） */
        eng.impulse(0, 260, 0.06);
        kick();
      },
      move: function (vx, vy) {
        var t = nowMs();
        var sec = lastT ? Math.min(0.1, Math.max(0.004, (t - lastT) / 1000)) : 0.016;
        lastT = t;
        lastMoveAt = t;
        lastVx = vx; lastVy = vy;
        /* px/ms → 世界单位/s²：除以球半径把像素折算成「球半径」 */
        var aw = ((vx - pvx) / sec) * 1000 / scale;
        var ah = ((vy - pvy) / sec) * 1000 / scale;
        pvx = vx; pvy = vy;
        axT = clamp(aw, -560, 560);
        ayT = clamp(ah, -560, 560);
        kick();
      },
      release: function () {
        /* 手指离开 = 容器在约 50ms 内停住，这个减速度才是水花的来源 */
        var ax = -lastVx * 1000 / scale / 0.05;
        var ay = -lastVy * 1000 / scale / 0.05;
        eng.impulse(clamp(ax, -800, 800), clamp(ay, -800, 800), 0.07);
        axT = 0; ayT = 0; axS = 0; ayS = 0;
        lastVx = 0; lastVy = 0; lastMoveAt = 0;
        kick();
      }
    };
  }

  /* 液体驱动：唯一的液体实现是 canvas 浅水引擎（ai-fluid.js）。
     引擎不可用（脚本缺失 / 老浏览器）时返回空实现，浮球其余交互不受影响。 */
  function createFluid(fab) {
    var noop = { press: function () {}, move: function () {}, release: function () {} };
    var canvas = fab && fab.querySelector ? fab.querySelector('.nb-ai-fab-fluid') : null;
    if (!canvas) return noop;
    var driver = null;
    try { driver = createFluidDriver(fab, canvas); } catch (e) { driver = null; }
    return driver || noop;
  }

  function initFabDrag(fab) {
    var transToken = 0;   /* 过渡锁代际：新一次按下递增，作废尚未执行的解锁 */
    var liquid = createFluid(fab);
    /* 拖动全程锁死过渡，并强制把 transition: none 落到计算样式。
       否则 pointermove 改 transform、pointerup 改 left/top 时，
       浏览器仍按变更前的 0.22s 过渡做动画，位移会叠加或回弹。 */
    function lockTransition() {
      transToken += 1;        /* 连续快速拖动时，让上一次未执行完的解锁失效 */
      fab.style.transition = 'none';
      void fab.offsetWidth;   /* 强制样式落地：同一帧内后续改 transform/left 不再走过渡 */
    }
    function unlockTransition() {
      /* 位置先以无过渡状态落定，下一帧再交还 CSS 过渡，避免 hover 抬升被叠加成回弹 */
      var token = transToken;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (token === transToken) fab.style.transition = '';
        });
      });
    }

    fab.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var r = fab.getBoundingClientRect();
      dragState = {
        id: e.pointerId, sx: e.clientX, sy: e.clientY,
        left: r.left, top: r.top, dx: 0, dy: 0, moved: false,
        touch: e.pointerType === 'touch',
        px: e.clientX, py: e.clientY,
        lastT: (window.performance && window.performance.now) ? window.performance.now() : Date.now()
      };
      try { fab.setPointerCapture(e.pointerId); } catch (err) { /* 老浏览器降级 */ }
      lockTransition();
      liquid.press();
    });

    fab.addEventListener('pointermove', function (e) {
      var st = dragState;
      if (!st || e.pointerId !== st.id) return;
      var now = (window.performance && window.performance.now) ? window.performance.now() : Date.now();
      var dtm = Math.max(8, now - (st.lastT || now));
      var vx = (e.clientX - st.px) / dtm;   /* px/ms，驱动液面惯性 */
      var vy = (e.clientY - st.py) / dtm;
      st.px = e.clientX; st.py = e.clientY; st.lastT = now;
      liquid.move(vx, vy);

      var dx = e.clientX - st.sx;
      var dy = e.clientY - st.sy;
      if (!st.moved) {
        var slop = st.touch ? 8 : DRAG_SLOP;   /* 触屏留一点余量，免得轻点变拖动 */
        if (Math.abs(dx) < slop && Math.abs(dy) < slop) return;
        st.moved = true;
        fab.classList.add('is-dragging');
        fab.style.willChange = 'transform';
      }
      st.dx = dx;
      st.dy = dy;
      /* 只写 transform：走合成层，不触发布局，跟手最快 */
      fab.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(1.06)';
      if (e.cancelable) e.preventDefault();
    });

    function finish(e) {
      var st = dragState;
      if (!st || (e && e.pointerId !== st.id)) return;
      dragState = null;
      if (!st.moved) {
        liquid.release();
        fab.classList.remove('is-dragging');
        fab.style.willChange = '';
        fab.style.transform = '';
        fab.style.transition = '';
        return;
      }
      dragMoved = true;
      userMoved = true;

      /* 落点以抬起坐标为准：快速甩动时最后一个 pointermove 可能落后于手指/鼠标 */
      var dx = st.dx;
      var dy = st.dy;
      if (e && e.type === 'pointerup' && isFinite(e.clientX) && isFinite(e.clientY)) {
        dx = e.clientX - st.sx;
        dy = e.clientY - st.sy;
      }

      /* 先清位移再把落点写进 left/top，全程锁着过渡。
         若过渡已恢复：left 突增 dx 同时残留 transform 仍带 dx，视觉上会叠加成 2dx，
         松手瞬间球先被甩到视口边缘再滑回来 —— 这正是「松手吸附边缘」的成因。 */
      fab.style.transform = '';
      pinFab(fab, st.left + dx, st.top + dy);   /* 落在哪就是哪，只夹在视口内 */
      void fab.offsetWidth;                     /* 位置立即生效，用户看不到中间态 */
      fab.style.willChange = '';
      fab.classList.remove('is-dragging');
      rememberFab(fab);
      unlockTransition();
      liquid.release();
      var panel = $('#nb-ai-panel');
      if (panel && !panel.hidden) placePanel(panel, fab);
      setTimeout(function () { dragMoved = false; }, 0);
    }
    fab.addEventListener('pointerup', finish);
    fab.addEventListener('pointercancel', finish);
  }

  /* 面板跟随球：优先在球上方展开，空间不足则向下；左右与球同侧对齐 */
  function placePanel(panel, fab) {
    if (!panel || !fab) return;
    var f = fab.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var gap = 12;
    var narrow = vw <= 520;
    var above = f.top - gap - MIN_GAP;
    var below = vh - f.bottom - gap - MIN_GAP;
    var up = above >= Math.min(220, vh * 0.45) || above >= below;

    panel.style.top = up ? 'auto' : (f.bottom + gap) + 'px';
    panel.style.bottom = up ? (vh - f.top + gap) + 'px' : 'auto';

    if (narrow) {
      panel.style.left = '0.5rem';
      panel.style.right = '0.5rem';
      panel.style.width = 'auto';
    } else {
      var pw = Math.min(368, vw - 2 * MIN_GAP);
      var onRight = f.left + f.width / 2 > vw / 2;
      panel.style.width = pw + 'px';
      panel.style.right = 'auto';
      panel.style.left = (onRight ? Math.max(MIN_GAP, f.right - pw) : Math.min(f.left, vw - pw - MIN_GAP)) + 'px';
    }

    var room = up ? above : below;
    panel.style.maxHeight = Math.max(200, Math.min(room, vh * 0.72)) + 'px';
  }

  /* ---------------- DOM ---------------- */
  function build() {
    if (built || $('#nb-ai-fab')) return;
    built = true;

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'nb-ai-fab';
    fab.className = 'nb-ai-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'nb-ai-panel');
    fab.setAttribute('aria-label', T('fab'));
    fab.innerHTML = '<span class="nb-ai-fab-glass" aria-hidden="true">' +
        '<canvas class="nb-ai-fab-fluid" width="264" height="264"></canvas>' +
      '</span>' +
      '<span class="nb-ai-fab-label">' + esc(T('fab')) + '</span>';
    document.body.appendChild(fab);
    restoreFab(fab);
    initFabDrag(fab);

    /* 登录后就地把位置对齐到账号偏好（不必刷新页面） */
    var cloud = window.NB && window.NB.cloud;
    if (cloud && cloud.on) {
      cloud.on(function (evt) {
        if (!evt || !evt.detail || !evt.detail.signedIn || userMoved) return;
        var f = $('#nb-ai-fab');
        if (f) restoreFab(f);
      });
    }

    var panel = document.createElement('section');
    panel.id = 'nb-ai-panel';
    panel.className = 'nb-ai-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', T('title'));
    panel.hidden = true;
    panel.innerHTML =
      '<header class="nb-ai-head">' +
        '<div>' +
          '<p class="nb-ai-kicker">TUTOR</p>' +
          '<h2 class="nb-ai-title">' + esc(T('title')) + '</h2>' +
          '<p class="nb-ai-sub">' + esc(T('sub')) + '</p>' +
        '</div>' +
        '<button type="button" class="nb-ai-x" data-ai-close aria-label="' + esc(T('close')) + '">✕</button>' +
      '</header>' +
      '<div class="nb-ai-log" id="nb-ai-log" role="log" aria-live="polite"></div>' +
      '<div class="nb-ai-chips" id="nb-ai-chips"></div>' +
      '<form class="nb-ai-form" id="nb-ai-form">' +
        '<textarea id="nb-ai-input" rows="2" maxlength="600" placeholder="' + esc(T('placeholder')) + '"></textarea>' +
        '<button type="submit" class="btn btn-primary nb-ai-send" id="nb-ai-send">' + esc(T('send')) + '</button>' +
      '</form>' +
      '<p class="nb-ai-disc">' + esc(T('disc')) + '</p>';
    document.body.appendChild(panel);

    fab.addEventListener('click', function () {
      if (dragMoved) { dragMoved = false; return; }   /* 拖动结束的那一次 click 不算点击 */
      toggle();
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-ai-close]')) { close(); }
    });
    var form = $('#nb-ai-form');
    form.addEventListener('submit', function (e) { e.preventDefault(); send(); });
    var input = $('#nb-ai-input');
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        send();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });
    window.addEventListener('resize', function () {
      var f = $('#nb-ai-fab');
      if (!f) return;
      if (f.style.left) {
        var r = f.getBoundingClientRect();
        pinFab(f, parseFloat(f.style.left) || r.left, r.top);
        var p = $('#nb-ai-panel');
        if (p && !p.hidden) placePanel(p, f);
      }
    });

    paintChips();
    if (!configured()) setDisabled(true, T('off'));
    else pushMsg('ai', T('hello'));
  }

  function paintChips() {
    var box = $('#nb-ai-chips');
    if (!box) return;
    var chips = T('chips') || [];
    box.innerHTML = chips.map(function (c) {
      return '<button type="button" class="nb-ai-chip" data-chip="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-chip]') : null;
      if (!b) return;
      var q = b.getAttribute('data-chip') || '';
      var input = $('#nb-ai-input');
      if (input) input.value = q;
      send();
    });
  }

  function configured() {
    var C = cloud();
    return !!(C && C.workerUrl && C.workerUrl());
  }

  function toggle() {
    var panel = $('#nb-ai-panel');
    if (!panel) return;
    if (panel.hidden) open(); else close();
  }
  function open() {
    var panel = $('#nb-ai-panel');
    var fab = $('#nb-ai-fab');
    if (!panel) return;
    panel.hidden = false;
    placePanel(panel, fab);
    if (fab) fab.setAttribute('aria-expanded', 'true');
    var input = $('#nb-ai-input');
    if (input && !input.disabled) setTimeout(function () { input.focus(); }, 60);
  }
  function close() {
    var panel = $('#nb-ai-panel');
    var fab = $('#nb-ai-fab');
    if (!panel) return;
    panel.hidden = true;
    if (fab) fab.setAttribute('aria-expanded', 'false');
  }

  function setDisabled(disabled, note) {
    var input = $('#nb-ai-input');
    var sendBtn = $('#nb-ai-send');
    if (input) input.disabled = disabled;
    if (sendBtn) sendBtn.disabled = disabled;
    if (note) pushMsg('note', note);
  }

  /* ---------------- 消息渲染 ---------------- */
  function pushMsg(kind, text) {
    var log = $('#nb-ai-log');
    if (!log) return null;
    var el = document.createElement('div');
    el.className = 'nb-ai-msg nb-ai-' + kind;
    if (kind === 'user') {
      el.innerHTML = '<span class="nb-ai-who">' + esc(lang() === 'en' ? 'You' : '你') + '</span>' +
        '<p class="nb-ai-text">' + esc(text) + '</p>';
    } else if (kind === 'ai') {
      el.innerHTML = '<span class="nb-ai-who">' + esc(T('title')) + '</span>' +
        '<p class="nb-ai-text">' + esc(text) + '</p>';
    } else if (kind === 'note') {
      el.innerHTML = '<p class="nb-ai-text">' + esc(text) + '</p>';
    } else {
      el.innerHTML = '<p class="nb-ai-text">' + esc(text) + '</p>';
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function pushLoading() {
    var log = $('#nb-ai-log');
    if (!log) return;
    var el = document.createElement('div');
    el.className = 'nb-ai-msg nb-ai-loading';
    el.id = 'nb-ai-loading';
    el.innerHTML = '<span class="nb-ai-who">' + esc(T('title')) + '</span>' +
      '<p class="nb-ai-text"><span class="nb-ai-dots" aria-hidden="true"></span>' + esc(T('thinking')) + '</p>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }
  function clearLoading() {
    var el = $('#nb-ai-loading');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* ---------------- 发送 ---------------- */
  function send() {
    if (busy) return;
    var input = $('#nb-ai-input');
    var C = cloud();
    if (!input || input.disabled) return;

    var q = String(input.value || '').trim();
    if (!q) { pushMsg('note', T('empty')); return; }
    if (!configured()) { pushMsg('note', T('off')); return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      pushMsg('note', T('offline'));
      return;
    }

    busy = true;
    input.value = '';
    var sendBtn = $('#nb-ai-send');
    if (sendBtn) sendBtn.disabled = true;
    pushMsg('user', q);
    pushLoading();

    C.askTutor({
      question: q,
      locale: lang(),
      context: pageContext(),
      history: history.slice(-6)
    }).then(function (r) {
      busy = false;
      if (sendBtn) sendBtn.disabled = false;
      clearLoading();

      if (!r.ok) {
        if (r.code === 'off') pushMsg('note', T('off'));
        else if (r.code === 'rate_limited') pushMsg('note', T('limited'));
        else if (r.code === 'network') pushMsg('note', T('offline'));
        else pushMsg('note', T('failed') + (r.message ? '（' + r.message + '）' : ''));
        return;
      }

      var answer = String(r.answer || '').trim();
      if (!answer) { pushMsg('note', T('failed')); return; }
      pushMsg('ai', answer);

      var disc = r.disclaimer || T('disc');
      var log = $('#nb-ai-log');
      if (log) {
        var d = document.createElement('p');
        d.className = 'nb-ai-msg-disc';
        d.textContent = disc;
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
      }

      history.push({ role: 'user', content: q.slice(0, 800) });
      history.push({ role: 'assistant', content: answer.slice(0, 800) });
      if (history.length > 6) history = history.slice(-6);
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    var tries = 0;
    (function tick() {
      if (!document.body) {
        if (++tries > 30) return;
        return setTimeout(tick, 100);
      }
      build();
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.NB = window.NB || {};
  window.NB.aiTutor = { open: open, close: close, send: send, pageContext: pageContext, _build: build };
})();
