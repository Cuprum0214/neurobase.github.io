/* ============================================================================
   NeuroBase · AI 球内液体 · ai-fluid.js（普通脚本，无依赖）

   参考 matsuoka-601/WaterBall（WebGPU 上的 MLS-MPM 实时流体球）的物理思路：
   液体不该是一块被整体旋转的平板，而要由「质量与动量守恒 + 不可压缩压力」
   自己长出形状。MPM 需要 GPU 与粒子网格传递，在 66px、纯静态、无构建的
   页面里放不下；这里取同一组守恒律在球形容器里的最小可用离散：

     球内一维变底床浅水方程（Saint-Venant）
       ∂h/∂t + ∂(h u)/∂x = 0
       ∂u/∂t + u ∂u/∂x = -g ∂s/∂x - a_x - drag·u
     其中 h 是水深、s 是自由表面、b(x)=√(1-x²) 是球内壁下缘。
     底床从球心向两侧抬高，所以波在贴壁处自然变陡、爬升 —— 也就是真实的
     弯月面。容器加速度 a_x 直接进动量方程，向右甩水就往左堆，改方向立刻
     反向，快慢决定波峰高低，这正是「随方向与速度流动」的来源。

   为了不把它做成一根只会起伏的线，另有三层：
     · 液池振子：液面整体的垂直自由度，上下甩动时把水真的送到球顶再翻落
     · 示踪粒子：在液体内部随 u 平流，把「水在流动」画出来
     · 飞溅粒子：液面速度超过阈值时抛出的水珠，落回液面

   渲染层额外做两件事，专门对付小尺寸下的观感问题：
     · 4 倍超采样 + Catmull-Rom 平滑曲线，液面不再是逐列折线的锯齿
     · 球内圆形裁剪：被甩到球顶以上的水由球壁收住，而不是画到球外

   模拟部分不依赖 DOM，可在 Node 里 require 后做物理回归测试。
   ============================================================================ */
(function (root, factory) {
  var api = factory();
  if (root) {
    root.NB = root.NB || {};
    root.NB.fluid = api;
  }
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  /* ---------- 常量（世界单位：球半径 = 1，y 轴向下为正） ---------- */
  var GRAVITY = 210;        /* 1 单位 ≈ 0.033m，210 ≈ 6.9 m/s²（视觉时间略放缓） */
  var COLS = 97;            /* 液面横向网格数（奇数：中心列正对球心，左右严格对称） */
  var DT = 1 / 2400;        /* 固定步长：满足 CFL((|u|+√(gh))·dt/dx < 1) */
  var DRAG = 0.55;          /* 线性阻尼，模拟水的粘性耗散 */
  var DRAG_QUAD = 1.1;      /* 二次阻尼：大振幅晃荡比小涟漪衰减快得多，
                               否则甩一下要三四秒才回平，看着像液面在来回晃 */
  var MIN_H = 1e-4;         /* 干格阈值 */
  var MAX_U = 13;           /* 速度上限，防激波发散 */
  var MIN_G = 55;           /* 失重时的有效重力下限，避免波速归零 */
  var MAX_G = 600;

  /* 液池整体的垂直自由度（让「上下甩」真的把水甩到球顶）。
     一维浅水只描述某一高度上的水面形状，容器上下运动时它只会「变重/变轻」，
     永远看不出水被抛起来。真实的球里，液面是一个可以整体升降的振子：
       容器向下加速（ay>0）→ 液体受到向上的惯性 → 液面整块抬起、甩向球顶；
       加速度一撤，重力把液面拉回，于是「冲到顶 → 沿壁翻落」的循环出现。
     LIFT_* 就是这条振子，位移以球半径为单位，向上为正。 */
  var LIFT_K = 100;         /* 弹簧刚度 ω≈10 rad/s，周期 ≈0.63s */
  var LIFT_C = 7.6;         /* 阻尼（ζ≈0.38）：留一点回弹，不是果冻 */
  var LIFT_GAIN = 0.34;     /* 容器垂直加速度 → 液面位移 */
  var LIFT_TOP = 1.06;      /* 液面最高抬到球心上方 1.06R（拱到球顶，不全填满） */
  var LIFT_BOTTOM = -0.42;  /* 最低压到球心下方 0.42R（向上甩时水更沉） */

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function Sim(opt) {
    opt = opt || {};
    this.R = 1;
    this.g = opt.g == null ? GRAVITY : opt.g;
    this.cols = opt.cols || COLS;
    this.dt = DT;
    this.drag = opt.drag == null ? DRAG : opt.drag;
    this.spawnRate = opt.spawnRate == null ? 1 : opt.spawnRate;

    var n = this.cols;
    this.dx = 2 / n;
    /* 用 Float64：体积修复量只有 1e-7 量级，Float32 会在长跑中把它吃掉 */
    this.x = new Float64Array(n);
    this.b = new Float64Array(n);
    this.h = new Float64Array(n);
    this.s = new Float64Array(n);
    this.u = new Float64Array(n);      /* 面速度：u[i] 位于 i 与 i+1 之间 */
    this.flux = new Float64Array(n);   /* 面通量缓冲，先算后更新，保证严格守恒 */
    this.hTmp = new Float64Array(n);   /* 人工粘性扩散的临时缓冲，避免每步分配 */

    var i;
    for (i = 0; i < n; i++) {
      var xc = -1 + (i + 0.5) * this.dx;
      this.x[i] = xc;
      var bb = Math.sqrt(Math.max(0, 1 - xc * xc));
      this.b[i] = bb;
      this.h[i] = bb;                  /* 液面在球心 → 恰好半瓶 */
      this.s[i] = 0;
    }
    this.vol0 = this.volume();

    this.accX = 0;
    this.accY = 0;
    this.impX = 0;
    this.impY = 0;
    this.impT = 0;
    this.accT = 0;

    /* 液池整体升降：位移（向上为正）与速度 */
    this.lift = 0;
    this.liftV = 0;

    /* 示踪粒子：液体内部的被动平流点 */
    this.tracers = [];
    this.resetTracers();

    /* 飞溅水珠 */
    this.drops = [];
    this.maxSpeed = 0;
    this.energy = 0;
  }

  Sim.prototype.resetTracers = function () {
    var n = this.cols;
    this.tracers.length = 0;
    for (var k = 0; k < 26; k++) {
      var col = Math.floor((k * 7 + 3) % n);
      this.tracers.push({
        x: this.x[col],
        f: 0.25 + ((k * 13) % 60) / 100,   /* 在 s 与 b 之间的相对深度 */
        y: 0
      });
    }
    this.placeTracers();
  };

  Sim.prototype.placeTracers = function () {
    for (var k = 0; k < this.tracers.length; k++) {
      var t = this.tracers[k];
      var sc = this.sampleAt(t.x);
      t.y = sc.s + (sc.b - sc.s) * t.f;
    }
  };

  /* 任意 x 处的表面与底床（线性插值） */
  Sim.prototype.sampleAt = function (x) {
    var f = (x + 1) / this.dx - 0.5;
    var i0 = Math.floor(f);
    var t = f - i0;
    var i1 = i0 + 1;
    if (i0 < 0) { i0 = 0; i1 = 1; t = 0; }
    if (i1 >= this.cols) { i1 = this.cols - 1; i0 = i1 - 1; t = 1; }
    return {
      s: this.s[i0] + (this.s[i1] - this.s[i0]) * t,
      b: this.b[i0] + (this.b[i1] - this.b[i0]) * t,
      h: this.h[i0] + (this.h[i1] - this.h[i0]) * t,
      u: this.u[i0] || 0
    };
  };

  Sim.prototype.volume = function () {
    var v = 0;
    for (var i = 0; i < this.cols; i++) v += this.h[i];
    return v * this.dx;
  };

  /* 面通量：正值表示由 j 流向 j+1（水量/单位时间）。
     两条限制缺一不可：
       · 目标列不能超过球径 2b（否则水位会涨到球径数倍）
       · 源列不能被抽干（否则 h 变负，下一次 clip 就把水凭空吃掉） */
  Sim.prototype.faceFlux = function (j, h, b, dt, dx) {
    var uj = this.u[j];
    if (uj === 0) return 0;
    var fl = uj > 0 ? uj * h[j] : uj * h[j + 1];
    var k = dx / dt;
    if (fl > 0) {
      var src = h[j] * k;
      if (fl > src) fl = src;
      var room = 2 * b[j + 1] - h[j + 1];
      if (room <= 0) return 0;
      var cap = room * k;
      return fl > cap ? cap : fl;
    }
    var src2 = h[j + 1] * k;
    if (-fl > src2) fl = -src2;
    var room2 = 2 * b[j] - h[j];
    if (room2 <= 0) return 0;
    var cap2 = room2 * k;
    return -fl > cap2 ? -cap2 : fl;
  };

  /* 一个固定步长 */
  Sim.prototype.step = function (dt, ax, ay) {
    var n = this.cols, dx = this.dx;
    var g = clamp(this.g - (ay || 0), MIN_G, MAX_G);
    var h = this.h, s = this.s, b = this.b, u = this.u;
    var drag = this.drag;
    var i;

    /* 1. 动量：压力梯度（自由表面斜率）+ 容器加速度的反作用。
       y 轴向下为正，η = -s，故 ∂u/∂t = +g·∂s/∂x：
       表面低的一侧 s 大，水从深的一侧被推向浅的一侧。 */
    for (i = 0; i < n - 1; i++) {
      var ds = (s[i + 1] - s[i]) / dx;
      var uu = u[i] + (g * ds - ax) * dt;
      if (h[i] <= MIN_H && h[i + 1] <= MIN_H) uu = 0;
      /* 小振幅时额外阻尼：真实的水在小球里被表面张力很快抹平。
         阈值取 0.5、系数 2.6：既能把残余波压下去，又不会在液面还明显
         倾斜时把它「粘住」—— 那会表现为回平过程中卡一下。 */
      var ampU = uu < 0 ? -uu : uu;
      var extra = ampU < 1.0 ? (1.0 - ampU) * 3.0 : 0;
      u[i] = clamp(uu * (1 - (drag + DRAG_QUAD * ampU + extra) * dt), -MAX_U, MAX_U);
    }
    /* 壁面不可穿透 */
    u[0] = 0;
    u[n - 2] = 0;
    u[n - 1] = 0;

    /* 1.5 液池整体升降：容器垂直加速度的直接反作用。
       ay>0 是容器向下加速，惯性把水「留在高处」，液面整块抬起；
       ay<0 是容器向上急停，水被压回球底。这一项让上下快速拖动时
       水真的能冲到球顶，再靠重力回落 —— 一维浅水给不了这个自由度。 */
    var ayR = ay || 0;
    this.liftV += (-LIFT_K * this.lift - LIFT_C * this.liftV + ayR * LIFT_GAIN) * dt;
    this.lift += this.liftV * dt;
    if (this.lift > LIFT_TOP) {
      this.lift = LIFT_TOP;
      if (this.liftV > 0) this.liftV *= -0.3;   /* 撞到球顶：丢掉大部分冲量 */
    } else if (this.lift < LIFT_BOTTOM) {
      this.lift = LIFT_BOTTOM;
      if (this.liftV < 0) this.liftV *= -0.3;
    }

    /* 2. 连续：面通量 + 容量上限。
       每列最多容纳球的直径 2b；下游已满时不再进流，多出的水只能留在上游
       或从别的面走。通量对两侧使用同一个值，内部界面上严格抵消 ——
       这是球内浅水能守住体积的关键（旧写法在边界列只进不出，水位会涨到球径数倍）。 */
    var kInv = dt / dx;
    var overflow = 0;
    /* 必须先把所有面通量算完再改 h。边算边写会让下一个面的迎风读到的
       h 已经是新值，两个相邻面不再共享同一个通量，体积就会缓慢流失。 */
    var F = this.flux;
    for (i = 0; i < n - 1; i++) F[i] = this.faceFlux(i, h, b, dt, dx);
    F[n - 1] = 0;
    for (i = 0; i < n; i++) {
      var fL = i > 0 ? F[i - 1] : 0;
      var fR = i < n - 1 ? F[i] : 0;
      var nh = h[i] + (fL - fR) * kInv;
      if (nh < 0) { overflow -= nh; nh = 0; }
      h[i] = nh;
    }
    /* 干格截断会吃掉一点水（两个面同时把同一列抽到负值附近）。
       把这点缺口按「剩余容量」还回去：局部、守恒、不改变流动方向。 */
    if (overflow > 0) {
      this.lastOverflow = (this.lastOverflow || 0) + overflow;
      var roomSum = 0;
      for (i = 0; i < n; i++) {
        var roomI = 2 * b[i] - h[i];
        if (roomI > 0) roomSum += roomI;
      }
      if (roomSum > 1e-9) {
        var unit = overflow / roomSum;
        for (i = 0; i < n; i++) {
          var roomJ = 2 * b[i] - h[i];
          if (roomJ > 0) h[i] += roomJ * unit;
        }
      } else {
        this.overflowStuck = (this.overflowStuck || 0) + overflow;
      }
    }

    /* 3. 由水深反推自由表面。顶到球顶时只夹表面，不改水深 ——
       改 h 会凭空吞掉水量，这是浅水格式里最容易丢体积的地方。 */
    for (i = 0; i < n; i++) {
      var sv = b[i] - h[i];
      if (sv < -b[i]) sv = -b[i];
      s[i] = sv;
    }

    /* 3.5 人工粘性（体积严格守恒）。
       一阶迎风浅水在强加速度下会沿贴壁段长出逐格尖刺：那是格式噪声，
       不是水该有的形状（画到画布上就是锯齿）。
       注意必须扩散「自由表面 s」，不能扩散水深 h —— 静止时 h=b(x) 是
       球内的弧形底床，对 h 做拉普拉斯会把水从贴壁处往中心推，等于凭空
       改掉平衡态。s 在静止时是常数，扩散它才是正确的低通。
       每步一次、强度很小：2~4 格的短波几十步内被抹平，主波几乎不受影响。 */
    var sT = this.hTmp;
    var alphaV = 0.02;
    var sum0 = 0;
    for (i = 0; i < n; i++) sum0 += s[i];
    for (i = 0; i < n; i++) {
      var sl = s[i > 0 ? i - 1 : 0];
      var sr = s[i < n - 1 ? i + 1 : n - 1];
      sT[i] = s[i] + alphaV * (sl + sr - 2 * s[i]);
    }
    var sum1 = 0;
    for (i = 0; i < n; i++) sum1 += sT[i];
    var shift = (sum1 - sum0) / n;    /* 补回均值差：sum(s) 不变 → 体积不变 */
    for (i = 0; i < n; i++) {
      var sv2 = sT[i] - shift;
      var hv = b[i] - sv2;
      var capH = 2 * b[i];
      if (hv < 0) hv = 0;
      if (hv > capH) hv = capH;
      h[i] = hv;
      s[i] = b[i] - hv;
    }

    /* 4. 液面速度统计（用于水花与静止判定） */
    var maxV = 0, energy = 0;
    for (i = 0; i < n - 1; i++) {
      var sp = Math.abs(u[i]);
      if (sp > maxV) maxV = sp;
      energy += u[i] * u[i];
    }
    this.maxSpeed = maxV;
    this.energy = energy / (n - 1);

    this.advectTracers(dt, ax);
  };

  Sim.prototype.advectTracers = function (dt, ax) {
    var self = this;
    for (var k = 0; k < this.tracers.length; k++) {
      var t = this.tracers[k];
      var sc = this.sampleAt(t.x);
      t.x += (sc.u + ax * 0.0015) * dt;
      if (t.x < -0.985 || t.x > 0.985) t.x = t.x < 0 ? -0.985 : 0.985;
      var s2 = self.sampleAt(t.x);
      /* 液面整体被甩起来时，水体也跟着走，否则流线会漂在液面之上 */
      var sEff = s2.s - self.lift;
      var depth = s2.b - sEff;
      if (depth <= MIN_H) depth = MIN_H;
      t.f = clamp(t.f, 0.12, 0.92);
      t.y = sEff + depth * t.f;
    }
  };

  /* 主推进：内部固定步长，掉帧时最多补 12 步 */
  Sim.prototype.advance = function (frameDt, ax, ay, allowDrops) {
    this.accT += clamp(frameDt, 0, 0.05);
    var ex = (ax == null ? this.accX : ax);
    var ey = (ay == null ? this.accY : ay);
    if (this.impT > 0) {
      ex += this.impX;
      ey += this.impY;
      this.impT -= this.dt;
      if (this.impT <= 0) { this.impX = 0; this.impY = 0; }
    }
    var steps = 0;
    while (this.accT >= this.dt && steps < 60) {
      this.step(this.dt, ex, ey);
      this.accT -= this.dt;
      steps++;
    }
    if (steps === 60) this.accT = 0;
    if (allowDrops !== false) {
      this.updateDrops(frameDt);
      this.updateCling(frameDt);
    }
    return steps;
  };

  Sim.prototype.impulse = function (ax, ay, dur) {
    this.impX = ax;
    this.impY = ay;
    this.impT = dur || 0.06;
  };

  Sim.prototype.setAccel = function (ax, ay) {
    this.accX = ax;
    this.accY = ay;
  };

  /* ---------- 飞溅水珠 ---------- */
  Sim.prototype.spawnDrop = function () {
    var n = this.cols;
    var best = -1, bestSp = 0;
    for (var i = 1; i < n - 2; i++) {
      var sp = Math.abs(this.u[i]);
      if (sp > bestSp) { bestSp = sp; best = i; }
    }
    if (best < 0 || bestSp < 6) return;
    if (this.drops.length >= 18) this.drops.shift();
    var dir = this.u[best] > 0 ? 1 : -1;
    var xc = this.x[best];
    this.drops.push({
      x: xc,
      y: this.s[best] - this.lift - 0.02,
      vx: dir * bestSp * 0.055,
      vy: -bestSp * 0.03 - 1.2,
      life: 0.5 + Math.min(0.5, bestSp * 0.012),
      age: 0
    });
  };

  /* 水被甩到球顶之后开始回落：从两侧沿壁掉下的水珠。
     这是「冲到顶 → 翻滚下来」里翻落那一段的可见证据。 */
  Sim.prototype.updateCling = function (frameDt) {
    if (this.lift < 0.4 || this.liftV > -0.15) {
      this.clingAcc = 0;
      return;
    }
    var rate = Math.min(1, (this.lift - 0.4) / 0.6 + Math.min(1, -this.liftV / 6) * 0.5);
    this.clingAcc = (this.clingAcc || 0) + frameDt;
    if (this.clingAcc < 0.16 - rate * 0.1) return;
    this.clingAcc = 0;
    if (this.drops.length >= 18) return;
    var side = Math.random() < 0.5 ? -1 : 1;
    var xw = side * (0.42 + Math.random() * 0.4);
    var sc = this.sampleAt(xw);
    /* 起点必须在水面之上（y 更小），否则 updateDrops 会判定它已经落回液面、
       刚生成就被删掉。 */
    var yTop = clamp(sc.s - this.lift, -0.99, 0.4) - 0.05;
    this.drops.push({
      x: xw,
      y: yTop,
      vx: side * (0.25 + Math.random() * 0.5),
      vy: 0.5 + Math.random() * 0.9,
      life: 0.55 + Math.random() * 0.35,
      age: 0
    });
  };

  Sim.prototype.updateDrops = function (dt) {
    if (this.spawnRate > 0 && this.maxSpeed > 7) {
      this.spawnAcc = (this.spawnAcc || 0) + dt;
      if (this.spawnAcc > 0.05 / this.spawnRate) {
        this.spawnAcc = 0;
        this.spawnDrop();
      }
    } else {
      this.spawnAcc = 0;
    }
    for (var k = this.drops.length - 1; k >= 0; k--) {
      var d = this.drops[k];
      d.age += dt;
      d.vy += this.g * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.x < -1) d.x = -1;
      if (d.x > 1) d.x = 1;
      var sc = this.sampleAt(d.x);
      var sEff = sc.s - this.lift;
      if (d.age > d.life || (d.y > sEff && d.vy > 0)) this.drops.splice(k, 1);
    }
  };

  /* ---------- 统计 ---------- */
  Sim.prototype.stats = function () {
    var n = this.cols, m = 0, mx = 0, my = 0;
    for (var i = 0; i < n; i++) {
      var w = this.h[i];
      m += w;
      mx += this.x[i] * w;
      my += (this.s[i] + this.b[i]) * 0.5 * w;
    }
    if (m < 1e-9) m = 1e-9;
    return {
      n: n,
      volume: m * this.dx,
      volumeTarget: this.vol0,
      cx: mx / m,
      cy: my / m,
      maxSpeed: this.maxSpeed,
      energy: this.energy,
      minS: Math.min.apply(null, Array.prototype.slice.call(this.s)),
      maxS: Math.max.apply(null, Array.prototype.slice.call(this.s)),
      lift: this.lift,
      liftV: this.liftV
    };
  };

  Sim.prototype.surfaceAt = function (x) {
    return this.sampleAt(x).s;
  };

  /* 液面相对「水平」的最大偏离（扣掉整体水位偏移）。
     恢复判定必须看形状：只看速度会在波过零点时误判液面已经静止，
     把倾斜的液面冻在那里 —— 肉眼看到的就是「斜着卡一下」。 */
  Sim.prototype.tilt = function () {
    var n = this.cols, i, mean = 0, m = 0;
    for (i = 0; i < n; i++) mean += this.s[i];
    mean /= n;
    for (i = 0; i < n; i++) {
      var v = this.s[i] - mean;
      if (v < 0) v = -v;
      if (v > m) m = v;
    }
    return m;
  };

  Sim.prototype.isCalm = function () {
    return this.maxSpeed < 0.35 && this.energy < 0.02
      && this.tilt() < 0.012
      && Math.abs(this.liftV) < 0.3 && Math.abs(this.lift) < 0.02;
  };

  /* ==========================================================================
     Canvas 渲染层
     ========================================================================== */
  /* CSS 上球的直径约 66px，画布内部取 264px：4 倍超采样。
     液面、球壁、水滴的边缘都因此有足够抗锯齿余量。 */
  var BUF = 264;
  var VIEW_HALF = BUF / 2;
  var PX = VIEW_HALF / 66;      /* 旧 132 画布像素 → 新画布像素的倍率 */
  var HAS_PATH2D = typeof Path2D !== 'undefined';

  function create(canvas, opt) {
    if (!canvas || !canvas.getContext || typeof document === 'undefined') return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var sim = new Sim(opt);
    var reduced = false;
    try {
      reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { reduced = false; }

    canvas.width = BUF;
    canvas.height = BUF;

    /* 气泡：属于渲染层，不参与物理。缓慢上浮，碰到自由表面就回到球底。 */
    var bubbles = [];
    (function seedBubbles() {
      var spots = [[-0.42, 0.12], [0.18, 0.22], [0.54, 0.3], [-0.1, 0.42], [0.34, 0.62]];
      for (var k = 0; k < spots.length; k++) {
        bubbles.push({
          x: spots[k][0], y: spots[k][1],
          r: (k % 2 ? 1.1 : 1.5) * PX,
          v: 0.05 + k * 0.012
        });
      }
    })();

    function updateBubbles(dt) {
      for (var k = 0; k < bubbles.length; k++) {
        var bu = bubbles[k];
        var sc = sim.sampleAt(bu.x);
        var sEff = sc.s - sim.lift;
        bu.y -= bu.v * dt;
        if (bu.y < sEff + 0.08 || sc.b - sEff < 0.12) {
          bu.y = sc.b - 0.1;
          bu.x = clamp(bu.x + (k % 2 ? 0.12 : -0.12), -0.72, 0.72);
        }
        if (bu.y > sc.b - 0.04) bu.y = sc.b - 0.06;
      }
    }

    /* 绘制用的液面副本：物理液面 + 整体升降 + 回落塌陷，再做 8 遍拉普拉斯平滑。
       平滑只作用于绘制副本，不改物理状态，体积与静止判定都不受影响；
       物理层的人工粘性已经把逐格尖刺压掉，这里再把剩下的折角磨圆，
       配合 Catmull-Rom 才是「一条连续曲线」而不是「一串小折线」。 */
    var sSmooth = new Float64Array(sim.cols);
    var sWork = new Float64Array(sim.cols);

    function buildSurface() {
      var n = sim.cols, i, pass;
      var li = clamp(sim.lift, LIFT_BOTTOM, LIFT_TOP);
      /* 振子尾巴上的微小残量不参与渲染：否则液面会因为 taper 一直微微
         鼓着，看起来像没回平。 */
      if (Math.abs(li) < 0.02) li = 0;
      /* 回落阶段（liftV<0）让液面中心先塌下去一点点：
         水是从球顶两侧沿壁流下来的，不是一整块平板平贴着落回球底。 */
      var fall = clamp(-sim.liftV / 6, 0, 1);
      var dipK = fall * clamp(li / LIFT_TOP, 0, 1) * 0.22;
      for (i = 0; i < n; i++) {
        var x = sim.x[i];
        /* 贴壁处略收：球壁本身在收窄，液面不该整块硬平移出球外 */
        var taper = 1 - 0.3 * x * x;
        sWork[i] = sim.s[i] - li * taper + dipK * (1 - x * x);
      }
      for (pass = 0; pass < 8; pass++) {
        for (i = 0; i < n; i++) {
          var a = sWork[i > 0 ? i - 1 : 0];
          var b2 = sWork[i];
          var c2 = sWork[i < n - 1 ? i + 1 : n - 1];
          sSmooth[i] = (a + b2 + b2 + c2) * 0.25;
        }
        for (i = 0; i < n; i++) sWork[i] = sSmooth[i];
      }

      /* 贴壁外推：最外几列受球壁几何限制会急速退落（水深容量趋零），
         画出来就是液面在壁前陡降成一个凹槽。实际的水是贴着壁的，
         这里按内部趋势把末端几列拉直，多出来的部分由球内裁剪收掉。 */
      var E = 8;
      var sL = sSmooth[E];
      var sR = sSmooth[n - 1 - E];
      for (i = 0; i < E; i++) sSmooth[i] = sL;
      for (i = 0; i < E; i++) sSmooth[n - 1 - i] = sR;
      return li;
    }

    function sx(i) { return VIEW_HALF + sim.x[i] * VIEW_HALF; }
    function sy(i) { return VIEW_HALF + sSmooth[i] * VIEW_HALF; }

    /* 液面曲线：从球的左边缘出发，经过各列，到右边缘。
       两端不让它收向球极点（那会在贴壁处抽出一条垂直的缝），而是保持
       末列水位、直接延伸到球外，再由球内圆形裁剪收口 —— 视觉上就是
       「水贴着球壁」，而不是「液面在壁前掉下去」。 */
    function edgeX(k) {
      if (k < 0) return 0;
      if (k >= sim.cols) return BUF;
      return sx(k);
    }
    function edgeY(k) {
      if (k < 0) return sy(0);
      if (k >= sim.cols) return sy(sim.cols - 1);
      return sy(k);
    }

    /* Catmull-Rom → 三次贝塞尔：用相邻四点估切线，节点处 C1 连续。
       液面因此是一条连续曲线，而不是 96 段互相折角的直线。 */
    function traceSurface(c) {
      var n = sim.cols;
      for (var i = -1; i < n; i++) {
        var k0 = i - 1 < -1 ? -1 : i - 1;
        var k3 = i + 2 > n ? n : i + 2;
        var x0 = edgeX(k0), y0 = edgeY(k0);
        var x1 = edgeX(i), y1 = edgeY(i);
        var x2 = edgeX(i + 1), y2 = edgeY(i + 1);
        var x3 = edgeX(k3), y3 = edgeY(k3);
        c.bezierCurveTo(
          x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6,
          x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6,
          x2, y2
        );
      }
    }

    /* 液体区域 = 液面曲线（两端延伸到球外）+ 下半球内壁，球内裁剪收口 */
    function traceLiquid(c) {
      c.moveTo(edgeX(-1), edgeY(-1));
      traceSurface(c);
      c.arc(VIEW_HALF, VIEW_HALF, VIEW_HALF, 0, Math.PI, false);
      c.closePath();
    }

    function render() {
      var li = buildSurface();

      ctx.clearRect(0, 0, BUF, BUF);

      /* 球内裁剪：液面被甩到球顶以上时，高处的水由球壁收住，
         不会画到球外拉出一条直线。 */
      ctx.save();
      ctx.beginPath();
      ctx.arc(VIEW_HALF, VIEW_HALF, VIEW_HALF, 0, Math.PI * 2);
      ctx.clip();

      var path = null;
      if (HAS_PATH2D) { path = new Path2D(); traceLiquid(path); }

      function fillLiquid(color) {
        if (path) { ctx.fillStyle = color; ctx.fill(path); return; }
        ctx.beginPath(); traceLiquid(ctx); ctx.fillStyle = color; ctx.fill();
      }
      function clipLiquid() {
        if (path) { ctx.clip(path); return; }
        ctx.beginPath(); traceLiquid(ctx); ctx.clip();
      }

      /* 1. 液体主体：上浅下深，保留玻璃球里的通透 */
      var grd = ctx.createLinearGradient(0, 0, 0, BUF);
      grd.addColorStop(0, 'rgba(158, 220, 255, 0.80)');
      grd.addColorStop(0.42, 'rgba(66, 152, 228, 0.88)');
      grd.addColorStop(1, 'rgba(14, 68, 138, 0.94)');
      fillLiquid(grd);

      /* 1.5 被甩到球顶的水膜：贴着玻璃内壁的一圈亮水。
          它让「水冲上去了」在视觉上有一个明确的上界，而不是一团模糊的蓝。 */
      if (li > 0.16) {
        var cling = clamp((li - 0.16) / 0.72, 0, 1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(VIEW_HALF, VIEW_HALF, VIEW_HALF * 0.985,
          Math.PI * 1.02, Math.PI * 2 - 0.02, false);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(196, 238, 255, ' + (0.3 * cling).toFixed(3) + ')';
        ctx.lineWidth = VIEW_HALF * 0.18 * cling;
        ctx.stroke();
        ctx.restore();
      }

      /* 1.6 贴壁下淌的水带：水被甩到顶部后沿球内壁往下爬的那一层。
          用月牙形填充（外弧 - 内弧），分几段让厚度向下递减，
          看起来是一层正在往下流的水膜，而不是一圈装饰描边。 */
      if (li > 0.3) {
        var runK = clamp((li - 0.3) / 0.75, 0, 1);
        var fallK = clamp(-sim.liftV / 6, 0, 1);
        var Rb = VIEW_HALF * 0.995;
        var span = 0.42 * runK + 0.22 * fallK;
        var wTop = VIEW_HALF * 0.15 * runK;
        var SEG = 5;
        ctx.save();
        for (var side = -1; side <= 1; side += 2) {
          for (var seg = 0; seg < SEG; seg++) {
            var f0 = seg / SEG;
            var f1 = (seg + 1.02) / SEG;
            var aa0 = -Math.PI / 2 + side * (0.05 + span * f0);
            var aa1 = -Math.PI / 2 + side * (0.05 + span * f1);
            var wSeg = wTop * (1 - f0 * 0.8);
            var lo = Math.min(aa0, aa1);
            var hi = Math.max(aa0, aa1);
            ctx.beginPath();
            ctx.arc(VIEW_HALF, VIEW_HALF, Rb, lo, hi, false);
            ctx.arc(VIEW_HALF, VIEW_HALF, Rb - wSeg, hi, lo, true);
            ctx.closePath();
            ctx.fillStyle = 'rgba(198, 240, 255, ' + (0.28 * runK * (1 - f0 * 0.5)).toFixed(3) + ')';
            ctx.fill();
          }
        }
        ctx.restore();
      }

      /* 2. 液体内部的示踪流线：把水平环流画出来 */
      ctx.save();
      clipLiquid();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (var k = 0; k < sim.tracers.length; k++) {
        var t = sim.tracers[k];
        var sc = sim.sampleAt(t.x);
        var sp = Math.abs(sc.u);
        if (sp < 0.8) continue;
        var strength = Math.min(1, (sp - 0.8) / 10);
        var tx = VIEW_HALF + t.x * VIEW_HALF;
        var ty = VIEW_HALF + t.y * VIEW_HALF;
        var len = Math.min(11, 2 + sp * 0.55) * PX;
        var dir = sc.u >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + dir * len, ty + dir * strength * 1.6 * PX);
        ctx.strokeStyle = 'rgba(208, 244, 255, ' + (0.05 + strength * 0.26).toFixed(3) + ')';
        ctx.lineWidth = (0.9 + strength * 1.0) * PX;
        ctx.stroke();
      }
      ctx.restore();

      /* 2.5 气泡：被液体裁住，缓慢上浮 */
      ctx.save();
      clipLiquid();
      for (var bi = 0; bi < bubbles.length; bi++) {
        var bu = bubbles[bi];
        var bx = VIEW_HALF + bu.x * VIEW_HALF;
        var by = VIEW_HALF + bu.y * VIEW_HALF;
        ctx.beginPath();
        ctx.arc(bx, by, bu.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(238, 252, 255, 0.5)';
        ctx.fill();
      }
      ctx.restore();

      /* 3. 液面亮线：真实的自由表面曲线（平滑后的） */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(edgeX(-1), edgeY(-1));
      traceSurface(ctx);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(198, 240, 255, 0.5)';
      ctx.lineWidth = 2.6 * PX;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = 1.0 * PX;
      ctx.stroke();
      ctx.restore();

      /* 4. 飞溅水珠 */
      ctx.save();
      for (var d = 0; d < sim.drops.length; d++) {
        var dr = sim.drops[d];
        var dpx = VIEW_HALF + dr.x * VIEW_HALF;
        var dpy = VIEW_HALF + dr.y * VIEW_HALF;
        var fade = 1 - dr.age / dr.life;
        if (fade < 0) continue;
        ctx.beginPath();
        ctx.arc(dpx, dpy, (1.5 + fade * 0.7) * PX, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 250, 255, ' + (0.85 * fade).toFixed(3) + ')';
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    }

    render();

    if (reduced) {
      return {
        sim: sim,
        reduced: true,
        setAccel: function () {},
        impulse: function () {},
        advance: function () { return 0; },
        render: function () {},
        isCalm: function () { return true; },
        stats: function () { return sim.stats(); }
      };
    }

    return {
      sim: sim,
      reduced: false,
      canvas: canvas,
      setAccel: function (ax, ay) { sim.setAccel(ax, ay); },
      impulse: function (ax, ay, dur) { sim.impulse(ax, ay, dur); },
      advance: function (dt) {
        var r = sim.advance(dt, null, null, true);
        updateBubbles(dt);
        return r;
      },
      render: render,
      isCalm: function () { return sim.isCalm(); },
      stats: function () { return sim.stats(); }
    };
  }

  return {
    Sim: Sim,
    create: create,
    constants: {
      gravity: GRAVITY,
      cols: COLS,
      dt: DT,
      liftK: LIFT_K,
      liftGain: LIFT_GAIN,
      liftTop: LIFT_TOP
    }
  };
});
