/* 神经信号与范式演示：EEG α 节律 / ERP-P300 (oddball) / SSVEP 闪烁+频谱 / 运动想象 μ-ERD。
   全部用 Canvas 2D 绘制；jsdom 等无 canvas 上下文的环境自动降级为「仅接口可用、不跑动画」。
   导出 NB.labSignals 供自测。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var esc = NB.esc;

  NB.mountShell('lab');

  function cssVar(name) {
    try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#333'; }
    catch (e) { return '#333'; }
  }

  /* 高斯峰：在 center 处幅度 amp、宽度 wd 的钟形 */
  function peak(x, center, wd, amp) {
    var d = (x - center) / wd;
    return amp * Math.exp(-0.5 * d * d);
  }
  function noise(amp) { return (Math.random() - 0.5) * amp; }

  function getCtx(cv) {
    try {
      return cv && typeof cv.getContext === 'function' ? cv.getContext('2d') : null;
    } catch (e) { return null; }
  }

  /* ============================ 演示注册表 ============================ */
  var demos = [];
  function reg(d) { demos.push(d); }

  var eegCv = document.getElementById('sig-eeg');
  var erpCv = document.getElementById('sig-erp');
  var ssvepSpecCv = document.getElementById('sig-ssvep-spec');
  var miCv = document.getElementById('sig-mi');

  /* ---------- 1. EEG α 节律 ---------- */
  var eeg = { paused: false, draw: null, ctx: null };
  reg(eeg);
  eeg.ctx = getCtx(eegCv);
  eeg.draw = function (now) {
    var ctx = eeg.ctx;
    if (!ctx) return;
    var w = eegCv.width, h = eegCv.height, mid = h / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = cssVar('--line');
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    ctx.strokeStyle = cssVar('--accent');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    var t0 = now / 1;
    for (var x = 0; x <= w; x += 2) {
      var tm = (t0 + x * 2.2); /* ms 滚动 */
      var y = mid + 9 * Math.sin(2 * Math.PI * 10 * tm / 1000)
        + 3.5 * Math.sin(2 * Math.PI * 30 * tm / 1000)
        + noise(2.5);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = cssVar('--ink');
    ctx.font = '11px sans-serif';
    ctx.fillText('≈ 10 Hz · ' + esc(t('labSignals.ampUv')), 8, 14);
  };

  /* ---------- 2. ERP 与 P300 ---------- */
  var erpStimLabel = document.getElementById('erp-stim-label');
  var erp = { paused: false, draw: null, ctx: null, type: 'standard', lastSwitch: 0 };
  reg(erp);
  erp.ctx = getCtx(erpCv);
  erp.draw = function (now) {
    var ctx = erp.ctx;
    if (!ctx) return;
    var w = erpCv.width, h = erpCv.height, mid = h / 2;
    /* 刺激序列：每 1400ms 一个刺激，约 15% 概率为偏差 */
    var period = 1400;
    var i0 = Math.floor(now / period);
    var rand = (Math.sin(i0 * 12.9898) * 43758.5453) % 1;
    if (rand < 0) rand += 1;
    var type = rand < 0.15 ? 'deviant' : 'standard';
    if (type !== erp.type) { erp.type = type; erp.lastSwitch = now; }
    if (erpStimLabel) erpStimLabel.textContent = t('labSignals.erpStimuli') + '：' +
      (type === 'deviant' ? t('labSignals.waveDeviant') : t('labSignals.waveStandard'));

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = cssVar('--line');
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    /* 时间轴 -100..600 ms 映射到 0..w */
    var t0 = -100, t1 = 600;
    ctx.strokeStyle = type === 'deviant' ? cssVar('--primary') : cssVar('--ink-soft');
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (var x = 0; x <= w; x += 2) {
      var tm = t0 + (x / w) * (t1 - t0);
      var y = mid
        + peak(tm, 100, 30, 2.2)        /* P1 */
        + peak(tm, 150, 28, -2.8)       /* N1 */
        + (type === 'deviant' ? peak(tm, 300, 45, 9) : 0) /* P300 */
        + noise(0.8);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = cssVar('--ink');
    ctx.font = '11px sans-serif';
    ctx.fillText(esc(t('labSignals.timeMs')), w - 58, h - 6);
    ctx.fillText(esc(t('labSignals.ampUv')), 6, 14);
    if (type === 'deviant') {
      ctx.fillStyle = cssVar('--primary');
      ctx.fillText('P300', w * (300 - t0) / (t1 - t0) + 4, mid - 14);
    }
  };

  /* ---------- 3. SSVEP：闪烁 + 频谱 ---------- */
  var boxA = document.getElementById('ssvep-box-a');
  var boxB = document.getElementById('ssvep-box-b');
  var attend = function () {
    var sel = document.querySelector('input[name="ssvep-attend"]:checked');
    return sel ? sel.value : 'a';
  };
  var ssvep = { paused: false, draw: null, ctx: null };
  reg(ssvep);
  ssvep.ctx = getCtx(ssvepSpecCv);
  ssvep.draw = function (now) {
    var ctx = ssvep.ctx;
    var tm = now / 1;
    if (boxA) boxA.style.background = Math.sin(2 * Math.PI * 8 * tm / 1000) > 0 ? cssVar('--primary') : cssVar('--bg');
    if (boxB) boxB.style.background = Math.sin(2 * Math.PI * 12 * tm / 1000) > 0 ? cssVar('--accent') : cssVar('--bg');
    if (!ctx) return;
    var w = ssvepSpecCv.width, h = ssvepSpecCv.height;
    ctx.clearRect(0, 0, w, h);
    var target = attend() === 'a' ? 8 : 12;
    /* 频率轴 0–20 Hz */
    var fmax = 20;
    ctx.strokeStyle = cssVar('--line');
    ctx.beginPath();
    ctx.moveTo(0, h - 16);
    ctx.lineTo(w, h - 16);
    ctx.stroke();
    ctx.fillStyle = cssVar('--ink');
    ctx.font = '11px sans-serif';
    ctx.fillText('Hz', w - 22, h - 4);
    for (var f = 0; f <= fmax; f += 4) {
      var fx = (f / fmax) * w;
      ctx.fillText(String(f), fx + 2, h - 4);
    }
    /* 峰值（目标频率 + 谐波 + 噪声呼吸） */
    var breathe = 0.85 + 0.15 * Math.sin(2 * Math.PI * tm / 1600);
    var bins = [target, target * 2];
    for (var k = 0; k < bins.length; k++) {
      var fk = bins[k];
      if (fk > fmax) continue;
      var ampPx = h * (k === 0 ? 0.55 : 0.18) * breathe;
      var bx = (fk / fmax) * w;
      ctx.fillStyle = k === 0 ? cssVar('--accent') : cssVar('--ink-soft');
      ctx.fillRect(bx - 5, h - 16 - ampPx, 10, ampPx);
      ctx.fillStyle = cssVar('--ink');
      if (k === 0) ctx.fillText(target + ' Hz', bx - 16, h - 16 - ampPx - 6);
    }
  };

  /* ---------- 4. 运动想象 μ-ERD ---------- */
  var mi = { paused: false, draw: null, ctx: null };
  reg(mi);
  mi.ctx = getCtx(miCv);
  mi.draw = function (now) {
    var ctx = mi.ctx;
    if (!ctx) return;
    var w = miCv.width, h = miCv.height, mid = h / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = cssVar('--line');
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    /* 前半静息（mu 幅度高），后半想象（ERD 幅度降至约 35%） */
    var split = w * 0.6;
    ctx.strokeStyle = cssVar('--accent');
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    var t0 = now / 1;
    for (var x = 0; x <= w; x += 2) {
      var seg = x >= split;
      var amp = seg ? 4.2 : 12;
      var tm = t0 + x * 2.2;
      var y = mid + amp * Math.sin(2 * Math.PI * 10 * tm / 1000)
        + amp * 0.4 * Math.sin(2 * Math.PI * 22 * tm / 1000)
        + noise(2);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    /* 分界与标注 */
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = cssVar('--muted');
    ctx.beginPath();
    ctx.moveTo(split, 6);
    ctx.lineTo(split, h - 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cssVar('--ink');
    ctx.font = '11px sans-serif';
    ctx.fillText(esc(t('labSignals.restState')), 10, 16);
    ctx.fillText(esc(t('labSignals.imagineState')), split + 12, 16);
  };

  /* ---------- 主循环与暂停 ---------- */
  var anyCtx = demos.some(function (d) { return !!d.ctx; });
  function toggle(d, btn) {
    d.paused = !d.paused;
    if (btn) btn.textContent = t(d.paused ? 'lab.play' : 'lab.pause');
    return d.paused;
  }
  var toggles = [
    ['sig-eeg-toggle', eeg],
    ['sig-erp-toggle', erp],
    ['sig-ssvep-toggle', ssvep],
    ['sig-mi-toggle', mi]
  ];
  toggles.forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    if (el) el.addEventListener('click', function () { toggle(pair[1], el); });
  });

  function loop(now) {
    demos.forEach(function (d) { if (!d.paused && d.draw) d.draw(now); });
    window.requestAnimationFrame(loop);
  }
  if (anyCtx && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(loop);
  }

  /* ============================ 对外接口 ============================ */
  window.NB.labSignals = {
    demos: { eeg: eeg, erp: erp, ssvep: ssvep, mi: mi },
    toggle: toggle,
    cssVar: cssVar
  };
})();
