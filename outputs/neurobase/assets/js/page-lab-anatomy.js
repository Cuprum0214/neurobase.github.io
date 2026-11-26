/* 交互式脑解剖：三视图模式 —— 3D 全景（真实解剖皮层表面 + 分区部件，旋转 / 拆分 / 挪动 / 复位 / 点选说明）+ 2D 示意图（点选 / 分层 / 标注）+ 矢状剖面。
   3D 引擎 three.js（本地化，MIT）；皮层表面为 FreeSurfer fsaverage5（pial，含真实沟回，brain-surface.js 内嵌数据）；
   分区部件为教学示意，与 2D 脑区一一对应；真实表面点击按坐标近似归属脑区。
   全部文案走 i18n；jsdom / 无 WebGL 环境自动降级为「接口可用、不渲染」并提示。
   导出 NB.labAnatomy（2D）+ NB.labAnatomy3d（3D）供自测。 */
(function () {
  'use strict';
  var NB = window.NB;
  var t = NB.t;
  var esc = NB.esc;

  NB.mountShell('lab');

  /* ============================ 公共：脑区数据 ============================ */
  var REGIONS = [
    { key: 'frontal', layer: 'surface', kws: ['执行功能', '工作记忆', '布洛卡区'],
      related: ['anatomy-prefrontal-cortex', 'language-broca-area', 'memory-working-memory'] },
    { key: 'parietal', layer: 'surface', kws: ['躯体感觉', '空间注意', '顶内沟'],
      related: ['sensory-somatosensory-system', 'attention-dorsal-ventral-network'] },
    { key: 'temporal', layer: 'surface', kws: ['听觉', '语言理解', '语义记忆'],
      related: ['language-wernicke-area', 'anatomy-hippocampus'] },
    { key: 'occipital', layer: 'surface', kws: ['视觉皮层', 'V1', 'SSVEP'],
      related: ['sensory-visual-cortex', 'sensory-visual-pathway', 'bci-ssvep'] },
    { key: 'cerebellum', layer: 'surface', kws: ['运动协调', '平衡', '程序性学习'],
      related: ['anatomy-cerebellum', 'memory-declarative-nondeclarative'] },
    { key: 'brainstem', layer: 'surface', kws: ['中脑', '脑桥', '延髓', '觉醒'],
      related: ['anatomy-brainstem', 'attention-sustained-attention'] },
    { key: 'corpus-callosum', layer: 'deep', kws: ['白质', '半球间传递', '裂脑'],
      related: ['anatomy-corpus-callosum'] },
    { key: 'thalamus', layer: 'deep', kws: ['感觉中继', '注意门控', '睡眠'],
      related: ['anatomy-thalamus', 'attention-selective-attention'] },
    { key: 'hippocampus', layer: 'deep', kws: ['情景记忆', '空间导航', 'LTP'],
      related: ['anatomy-hippocampus', 'memory-long-term-potentiation', 'memory-place-cell'] },
    { key: 'ventricle', layer: 'deep', kws: ['脑脊液', '缓冲', '代谢废物清除'], related: [] }
  ];
  var BY_KEY = {};
  REGIONS.forEach(function (r) { BY_KEY[r.key] = r; });

  var infoName = document.getElementById('info-name');
  var infoText = document.getElementById('info-text');
  var infoKws = document.getElementById('info-kws');
  var infoRelated = document.getElementById('info-related');
  /* 信息面板当前对应的脑区（词条跳转返回时按它原样恢复右侧说明） */
  var infoRegion = null;
  var infoApprox = false;

  function termName(id) {
    var term = NB.getTerm(id);
    if (!term) return id;
    return NB.termName(term);
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pascal(key) { return key.split('-').map(cap).join(''); }

  /* ============================ 公共：信息面板 ============================ */
  function selectRegion(key, keepOthers) {
    if (!key || !BY_KEY[key]) return;
    var reg = BY_KEY[key];
    infoRegion = key;
    infoApprox = false;
    document.querySelectorAll('.region.selected').forEach(function (el) { el.classList.remove('selected'); });
    if (keepOthers !== true) {
      document.querySelectorAll('.region[data-region="' + key + '"]').forEach(function (el) {
        el.classList.add('selected');
      });
    }
    infoName.textContent = t('labAnatomy.region' + pascal(key));
    infoText.textContent = t('labAnatomy.region' + pascal(key) + 'Info');
    infoKws.innerHTML = reg.kws.map(function (kw) {
      return '<span class="chip">' + esc(kw) + '</span>';
    }).join('');
    infoRelated.innerHTML = reg.related.length
      ? '<p class="anatomy-info-label">' + esc(t('lab.learnMore')) + '</p>' +
        reg.related.map(function (id) {
          return '<a class="btn btn-sm btn-ghost" href="' + esc(NB.hrefTerm(id)) + '">' + esc(termName(id)) + '</a>';
        }).join('')
      : '';
    infoKws.hidden = false;
    infoRelated.hidden = false;
    scheduleSave();
  }
  function showDefault() {
    infoRegion = null;
    infoApprox = false;
    document.querySelectorAll('.region.selected').forEach(function (el) { el.classList.remove('selected'); });
    infoName.textContent = t('labAnatomy.title');
    infoText.textContent = t('labAnatomy.regionNone');
    infoKws.hidden = true;
    infoRelated.hidden = true;
    scheduleSave();
  }

  /* ============================ 2D 示意图 / 剖面 ============================ */
  var lateral = document.getElementById('brain-lateral');
  var section = document.getElementById('brain-section');
  var layerSurfaceBtn = document.getElementById('layer-surface');
  var layerDeepBtn = document.getElementById('layer-deep');
  var labelsBtn = document.getElementById('toggle-labels');

  var LATERAL_KEYS = ['frontal', 'parietal', 'occipital', 'temporal', 'cerebellum', 'brainstem',
    'corpus-callosum', 'ventricle', 'thalamus', 'hippocampus'];
  var SECTION_KEYS = ['corpus-callosum', 'thalamus', 'hippocampus', 'brainstem', 'cerebellum'];
  function paintLabels() {
    var paint = function (svg, keys) {
      Array.prototype.forEach.call(svg.querySelectorAll('.region-label'), function (el, i) {
        if (i < keys.length) el.textContent = t('labAnatomy.region' + pascal(keys[i]));
      });
    };
    if (lateral) paint(lateral, LATERAL_KEYS);
    if (section) paint(section, SECTION_KEYS);
  }

  /* ---------- 2D / 剖面：把真实网格投影轮廓注入 SVG（数据缺失时保留内置回退路径） ---------- */
  function init2DFigures() {
    var D = window.NB_2D;
    if (!D || !D.lateral) return false;
    var setD = function (id, d, cls) {
      var el = document.getElementById(id);
      if (!el || !d) return;
      el.setAttribute('d', d);
      if (cls) el.setAttribute('class', cls);
      el.__nbReal = true;
    };
    setD('anat-outline', D.lateral.outline);
    setD('anat-surface-shade', D.lateral.outline);
    if (D.lateral.regions) {
      ['frontal', 'parietal', 'occipital', 'temporal'].forEach(function (k) {
        setD('reg-' + k, D.lateral.regions[k]);
      });
    }
    if (D.section && D.section.outline) {
      setD('anat-section-outline', D.section.outline);
      setD('anat-section-shade', D.section.outline);
    }
    /* 真实深部结构投影（MNI152 aseg 网格 → 2D 轮廓） */
    if (D.deep) {
      setD('reg-corpus-callosum', D.deep['corpus-callosum']);
      setD('reg-thalamus', D.deep['thalamus-l']);
      setD('sec-corpus-callosum', D.deep['corpus-callosum']);
      setD('sec-thalamus', D.deep['thalamus-l']);
    }
    NB.labAnatomy2d = {
      real: true,
      outlinePoints: (D.lateral.outline.match(/[-0-9.]+ [0-9.]+/g) || []).length,
      sectionPoints: D.section ? (D.section.outline.match(/[-0-9.]+ [0-9.]+/g) || []).length : 0,
      regions: D.lateral.regions
    };
    return true;
  }

  function onClickFigure(e) {
    if (e.target && e.target.closest) {
      var hit = e.target.closest('[data-region]');
      if (hit) { selectRegion(hit.getAttribute('data-region')); return; }
    }
    if (e.target && e.target.tagName === 'svg') showDefault();
  }
  init2DFigures();
  if (lateral) lateral.addEventListener('click', onClickFigure);
  if (section) section.addEventListener('click', onClickFigure);

  function setHidden(el, on) {
    if (!el) return;
    if (on) el.setAttribute('hidden', '');
    else el.removeAttribute('hidden');
  }
  function setLayer(deep) {
    document.querySelectorAll('.layer-surface').forEach(function (g) { setHidden(g, deep); });
    document.querySelectorAll('.layer-deep').forEach(function (g) { setHidden(g, !deep); });
    layerSurfaceBtn.setAttribute('aria-pressed', String(!deep));
    layerDeepBtn.setAttribute('aria-pressed', String(deep));
    if (deep) {
      var firstDeep = document.querySelector('.layer-deep .region');
      if (firstDeep) selectRegion(firstDeep.getAttribute('data-region'));
    } else {
      showDefault();
    }
    scheduleSave();
  }
  if (layerSurfaceBtn) layerSurfaceBtn.addEventListener('click', function () { setLayer(false); });
  if (layerDeepBtn) layerDeepBtn.addEventListener('click', function () { setLayer(true); });

  function toggleLabels() {
    var on = labelsBtn.getAttribute('aria-pressed') === 'true';
    labelsBtn.setAttribute('aria-pressed', String(!on));
    document.querySelectorAll('.label-group').forEach(function (g) { setHidden(g, on); });
    scheduleSave();
  }
  if (labelsBtn) labelsBtn.addEventListener('click', toggleLabels);

  /* ============================ 3D 全景模块 ============================ */
  var VIEW3D = '3d', VIEW2D = '2d', VIEWSEC = 'section';
  var wrap3d = document.getElementById('anatomy-3d-wrap');
  var wrap2d = document.getElementById('anatomy-2d-wrap');
  var wrapSec = document.getElementById('anatomy-section-wrap');
  var view3dBtn = document.getElementById('view-3d');
  var view2dBtn = document.getElementById('view-2d');
  var viewSecBtn = document.getElementById('view-section');
  var loadingEl = document.getElementById('anat3d-loading');
  var autorotateBtn = document.getElementById('anat3d-autorotate');
  var explodeBtn = document.getElementById('anat3d-explode');
  var resetBtn = document.getElementById('anat3d-reset');
  var modeRealBtn = document.getElementById('anat3d-mode-real');
  var modePartsBtn = document.getElementById('anat3d-mode-parts');
  var selectionEl = document.getElementById('anat3d-selection');

  var currentView = VIEW3D;
  function switchView(v) {
    currentView = v;
    setHidden(wrap3d, v !== VIEW3D);
    setHidden(wrap2d, v !== VIEW2D);
    setHidden(wrapSec, v !== VIEWSEC);
    view3dBtn.setAttribute('aria-selected', String(v === VIEW3D));
    view2dBtn.setAttribute('aria-selected', String(v === VIEW2D));
    viewSecBtn.setAttribute('aria-selected', String(v === VIEWSEC));
    if (v === VIEW2D) paintLabels();
    if (v !== VIEW3D) endPartGesture();
    if (v === VIEW3D) { showDefault(); NB3D.startLoop(); }
    else NB3D.stopLoop();
    if (v === VIEWSEC) showDefault();
    scheduleSave();
  }
  view3dBtn.addEventListener('click', function () { switchView(VIEW3D); });
  view2dBtn.addEventListener('click', function () { switchView(VIEW2D); });
  viewSecBtn.addEventListener('click', function () { switchView(VIEWSEC); });

  /* ---------- 3D 引擎 ---------- */
  var NB3D = {
    ready: false,
    renderer: null, scene: null, camera: null, controls: null,
    focus: null,        /* 观察目标（controls 存在时与其同步；无 WebGL 时仍保留状态，便于视角记忆与自测） */
    mode: 'real',       /* 'real' 真实皮层表面 | 'parts' 分区部件 */
    parts: {},          /* key -> THREE.Group */
    surfaceMesh: null,  /* THREE.Mesh（fsaverage5 pial 皮层表面） */
    unitList: [],        /* { group, mesh, base(Vector3), dir(Vector3) } */
    selectedKey: null,
    dragging: false,
    raycaster: null,
    dragPlane: null,
    dragStartHit: null,   /* 按下时射线与拖动平面的交点（世界坐标） */
    dragStartPos: null,   /* 按下时部件 group.position 快照 */
    regionFaceCounts: {}, /* key -> 真实网格三角面数 */
    cameraHome: null,
    anim: null,
    /* 单部件手势：左键拖动平移 / 右键拖动旋转 / 左键双击复位（不再有弹窗菜单） */
    rotating: false,
    rotPivot: null,       /* 旋转中心（世界坐标，按下时快照） */
    rotStartQuat: null,
    rotStartPos: null,
    rotStartPointer: null
  };
  var EXPLODE_D = 0.95;
  var ROTATE_SPEED = 0.008; /* 每像素弧度 */
  var CAM_POS = new THREE.Vector3(2.4, 1.5, 3.0);
  var CAM_TARGET = new THREE.Vector3(0, -0.15, 0);
  var BASE_SCALE = 0.52; /* 模型缩放：整脑约 2.4 单位宽 */

  function buildPart(key, def) {
    var group = new THREE.Group();
    var reg = BY_KEY[key];
    def.units.forEach(function (u) {
      var geo;
      if (u.type === 'sphere') geo = new THREE.SphereGeometry(u.r, 28, 20);
      else if (u.type === 'folia') {
        /* 小脑：球面顶点按前后向正弦位移，形成平行叶片（横向沟） */
        geo = new THREE.SphereGeometry(u.r, 72, 48);
        var pos = geo.attributes.position;
        for (var i = 0; i < pos.count; i++) {
          var px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
          var k = 1 + (u.foliaAmp || 0.045) * Math.sin(pz * (u.foliaFreq || 22));
          pos.setXYZ(i, px * k, py * k, pz * k);
        }
        geo.computeVertexNormals();
      } else if (u.type === 'ribbon') {
        /* 胼胝体 / 侧脑室：沿曲线扫掠的扁带（截面压扁） */
        geo = new THREE.TubeGeometry(u.curve, 64, u.r, 8, false);
      } else if (u.type === 'cylinder') geo = new THREE.CylinderGeometry(u.rTop, u.rBottom, u.h, 16);
      else if (u.type === 'torus') geo = new THREE.TorusGeometry(u.r, u.tube, 12, 32, u.arc);
      else if (u.type === 'tube') geo = new THREE.TubeGeometry(u.curve, 24, u.r, 10, false);
      else if (u.type === 'mesh') {
        /* 真实体积提取网格（MNI152 aseg）：坐标已与 pial 表面同空间，不再乘 BASE_SCALE */
        geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(u.data.v, 3));
        geo.setIndex(u.data.f);
        geo.computeVertexNormals();
      }
      var mat = new THREE.MeshPhongMaterial({
        color: reg.color,
        transparent: !!u.opacity,
        opacity: u.opacity || 1,
        shininess: 28,
        side: u.type === 'mesh' ? THREE.DoubleSide : THREE.FrontSide
      });
      var mesh = new THREE.Mesh(geo, mat);
      if (u.type === 'mesh') {
        mesh.position.y = -0.15;   /* 与皮层表面统一对齐 */
      } else {
        mesh.scale.set(u.scale[0] * BASE_SCALE, u.scale[1] * BASE_SCALE, u.scale[2] * BASE_SCALE);
        mesh.position.set(u.pos[0] * BASE_SCALE, u.pos[1] * BASE_SCALE, u.pos[2] * BASE_SCALE);
        if (u.rot) mesh.rotation.set(u.rot[0], u.rot[1], u.rot[2]);
      }
      group.add(mesh);
      NB3D.unitList.push({
        group: group, mesh: mesh,
        base: mesh.position.clone(),
        dir: new THREE.Vector3(u.dir[0], u.dir[1], u.dir[2]).normalize()
      });
    });
    group.userData.regionKey = key;
    NB3D.scene.add(group);
    NB3D.parts[key] = group;
  }

  /* ---------- 真实皮层表面 → 6 个解剖区域部件（部件模式同样使用真实网格，含沟回） ---------- */
  var SURFACE_KEYS = ['frontal', 'parietal', 'temporal', 'occipital', 'cerebellum', 'brainstem'];
  var INTERNAL_KEYS = ['corpus-callosum', 'thalamus', 'hippocampus', 'ventricle'];

  function buildSurfaceParts() {
    var B = window.NB_BRAIN;
    if (!B || !B.v || !B.f) return false;
    var v = B.v, f = B.f, nf = f.length / 3;
    var buckets = {};
    SURFACE_KEYS.forEach(function (k) { buckets[k] = []; });
    for (var i = 0; i < nf; i++) {
      var a = f[i * 3], b = f[i * 3 + 1], c = f[i * 3 + 2];
      var cx = (v[a * 3] + v[b * 3] + v[c * 3]) / 3;
      var cy = (v[a * 3 + 1] + v[b * 3 + 1] + v[c * 3 + 1]) / 3;
      var cz = (v[a * 3 + 2] + v[b * 3 + 2] + v[c * 3 + 2]) / 3;
      var rk = regionOfPoint({ x: cx, y: cy, z: cz });
      if (buckets[rk]) buckets[rk].push(a, b, c);
    }
    /* pial 皮层表面不含小脑 / 脑干：误判的少量边缘面并入颞叶，两区回退程序化几何 */
    var MIN_REAL_FACES = 1200;
    ['cerebellum', 'brainstem'].forEach(function (k) {
      if (buckets[k].length / 3 < MIN_REAL_FACES) {
        buckets.temporal = buckets.temporal.concat(buckets[k]);
        buckets[k] = [];
      }
    });
    var built = {};
    SURFACE_KEYS.forEach(function (key) {
      var faces = buckets[key];
      if (!faces.length) return;
      var map = {}, verts = [], idx = [];
      var sumX = 0, sumY = 0, sumZ = 0;
      for (var j = 0; j < faces.length; j++) {
        var oi = faces[j];
        if (map[oi] === undefined) {
          map[oi] = verts.length / 3;
          verts.push(v[oi * 3], v[oi * 3 + 1], v[oi * 3 + 2]);
          sumX += v[oi * 3]; sumY += v[oi * 3 + 1]; sumZ += v[oi * 3 + 2];
        }
        idx.push(map[oi]);
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      var mat = new THREE.MeshPhongMaterial({
        color: REGION_COLORS[key], specular: 0x2a2a2a, shininess: 18, side: THREE.DoubleSide
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = -0.15;   /* 与完整表面 / 内部结构统一对齐 */
      var n = verts.length / 3;
      var dir = new THREE.Vector3(sumX / n, sumY / n, sumZ / n);
      if (dir.lengthSq() < 1e-6) dir.set(0, 0.2, 0);
      dir.normalize();
      var group = new THREE.Group();
      group.add(mesh);
      group.userData.regionKey = key;
      NB3D.scene.add(group);
      NB3D.parts[key] = group;
      NB3D.unitList.push({ group: group, mesh: mesh, base: mesh.position.clone(), dir: dir });
      NB3D.regionFaceCounts[key] = idx.length / 3;
      built[key] = true;
    });
    return built;
  }

  /* 真实体积提取网格（MNI152 aseg → Surface Nets）：存在则用真实网格，否则回退程序化形态 */
  function deepReal(key, dir, fallbackUnits) {
    var D = window.NB_DEEP;
    if (D && D[key] && D[key].v && D[key].v.length && D[key].f && D[key].f.length) {
      return [{ type: 'mesh', data: D[key], dir: dir }];
    }
    return fallbackUnits;
  }

  function buildBrain() {
    var U = THREE, V = U.Vector3;
    var defs = [
      { key: 'frontal', units: [
        { type: 'sphere', r: 0.68, scale: [1.0, 0.92, 0.92], pos: [0, 0.32, 0.72], dir: [0.1, 0.3, 1] } ] },
      { key: 'parietal', units: [
        { type: 'sphere', r: 0.6, scale: [1.05, 0.75, 1.0], pos: [0, 0.8, -0.22], dir: [0, 1, -0.25] } ] },
      { key: 'occipital', units: [
        { type: 'sphere', r: 0.55, scale: [0.95, 0.82, 0.95], pos: [0, 0.02, -1.02], dir: [0, -0.15, -1] } ] },
      { key: 'temporal', units: [
        { type: 'sphere', r: 0.42, scale: [0.85, 0.6, 1.2], pos: [-0.78, -0.4, 0.22], dir: [-1, -0.25, 0.3] },
        { type: 'sphere', r: 0.42, scale: [0.85, 0.6, 1.2], pos: [0.78, -0.4, 0.22], dir: [1, -0.25, 0.3] } ] },
      { key: 'cerebellum', units: [
        { type: 'folia', r: 0.54, foliaFreq: 22, foliaAmp: 0.05, scale: [1.15, 0.45, 0.82], pos: [0, -0.80, -0.95], dir: [0, -0.5, -1] } ] },
      { key: 'brainstem', units: [
        { type: 'cylinder', rTop: 0.15, rBottom: 0.11, h: 0.85, scale: [1, 1, 1], pos: [0, -1.02, -0.40], rot: [0.28, 0, 0], dir: [0, -1, -0.1] },
        { type: 'sphere', r: 0.2, scale: [1.0, 0.75, 0.85], pos: [0, -0.86, -0.42], dir: [0, -1, -0.1] } ] },
      { key: 'corpus-callosum', units: deepReal('corpus-callosum', [0, 1, -0.1], [
        { type: 'ribbon', r: 0.075, scale: [1, 1, 0.42], pos: [0, 0, 0],
          curve: new U.CatmullRomCurve3([
            new V(0.42, 0.02, -0.52), new V(0.45, 0.26, -0.12), new V(0.3, 0.4, 0.26),
            new V(0, 0.42, 0.4), new V(-0.3, 0.4, 0.26), new V(-0.45, 0.26, -0.12),
            new V(-0.42, 0.02, -0.52)]),
          dir: [0, 1, -0.1] } ]) },
      { key: 'thalamus', units: (function () {
        var L = deepReal('thalamus-l', [-0.6, 0.4, -0.5], [
          { type: 'sphere', r: 0.18, scale: [0.72, 0.9, 0.68], pos: [-0.24, 0.06, -0.46], dir: [-0.6, 0.4, -0.5] }]);
        var R = deepReal('thalamus-r', [0.6, 0.4, -0.5], [
          { type: 'sphere', r: 0.18, scale: [0.72, 0.9, 0.68], pos: [0.24, 0.06, -0.46], dir: [0.6, 0.4, -0.5] }]);
        return L.concat(R);
      })() },
      { key: 'hippocampus', units: [
        { type: 'tube', r: 0.075, curve: new U.CatmullRomCurve3([
          new V(-0.3, -0.28, -0.8), new V(-0.15, -0.36, -0.6), new V(0, -0.28, -0.4) ]), scale: [1, 1, 1], pos: [0, 0, 0], dir: [-0.7, 0.3, -0.6] },
        { type: 'tube', r: 0.075, curve: new U.CatmullRomCurve3([
          new V(0.3, -0.28, -0.8), new V(0.15, -0.36, -0.6), new V(0, -0.28, -0.4) ]), scale: [1, 1, 1], pos: [0, 0, 0], dir: [0.7, 0.3, -0.6] } ] },
      { key: 'ventricle', units: [
        { type: 'ribbon', r: 0.085, scale: [1, 1, 0.55], pos: [0, 0, 0], opacity: 0.38,
          curve: new U.CatmullRomCurve3([
            new V(0.2, 0.04, 0.02), new V(0.28, 0.2, 0.2), new V(0.3, 0.3, 0.02),
            new V(0.26, 0.24, -0.3), new V(0.2, 0.08, -0.46)]),
          dir: [-0.7, 0.5, 0.2] },
        { type: 'ribbon', r: 0.085, scale: [1, 1, 0.55], pos: [0, 0, 0], opacity: 0.38,
          curve: new U.CatmullRomCurve3([
            new V(-0.2, 0.04, 0.02), new V(-0.28, 0.2, 0.2), new V(-0.3, 0.3, 0.02),
            new V(-0.26, 0.24, -0.3), new V(-0.2, 0.08, -0.46)]),
          dir: [0.7, 0.5, 0.2] } ] }
    ];
    var realSurfaceParts = buildSurfaceParts();   /* 返回已构建的区域 map，或 false */
    defs.forEach(function (d) {
      /* 已有真实皮层网格的区域跳过；小脑 / 脑干 / 内部结构用程序化几何（数据不可得） */
      if (realSurfaceParts && realSurfaceParts[d.key]) return;
      var reg = BY_KEY[d.key];
      reg.color = REGION_COLORS[d.key];
      buildPart(d.key, d);
    });
  }

  var REGION_COLORS = {
    frontal: 0x6b9ad4, parietal: 0x7aa6d8, occipital: 0x5584c4, temporal: 0x77a4d6,
    cerebellum: 0x5f93b8, brainstem: 0x6d8ca6,
    'corpus-callosum': 0x12a0a8, thalamus: 0x3aa5a0, hippocampus: 0x8a9fd8, ventricle: 0x9ad0e0
  };

  /* ---------- 真实皮层表面（fsaverage5 pial，含沟回） ---------- */
  function buildSurface() {
    var B = window.NB_BRAIN;
    if (!B || !B.v || !B.f) return;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(B.v, 3));
    geo.setIndex(B.f);
    geo.computeVertexNormals();
    var mat = new THREE.MeshPhongMaterial({
      color: 0xd9d2c0, specular: 0x333333, shininess: 14, side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -0.15;   /* 与分区部件中心对齐（归一化几何 y 中心为 0） */
    mesh.userData.kind = 'surface';
    NB3D.surfaceMesh = mesh;
    NB3D.scene.add(mesh);
  }

  /* 归一化坐标（three.js y-up：x 左右 / y 上下 / z 前后，+z 为前）→ 脑区（启发式近似，Talairach 映射）
     注意：FreeSurfer pial 皮层表面不含小脑 / 脑干，这两区由程序化几何表示（数据缺失回退） */
  function regionOfPoint(p) {
    var x = p.x, y = p.y, z = p.z;
    if (y < -0.25 && Math.abs(x) < 0.12 && z < 0.05) return 'brainstem';   /* 底部中央 */
    if (z < -0.25 && y < -0.20) return 'cerebellum';                       /* 后下（pial 中极少，回退） */
    if (z > 0.14) return 'frontal';                                        /* 前部 */
    if (z < -0.28) return 'occipital';                                     /* 后部 */
    if (y > 0.10) return 'parietal';                                       /* 上部 */
    return 'temporal';                                                     /* 其余两侧下部 */
  }

  function setMode(m) {
    if (m !== 'real' && m !== 'parts') return;
    NB3D.mode = m;
    var real = m === 'real';
    if (modeRealBtn) modeRealBtn.setAttribute('aria-pressed', String(real));
    if (modePartsBtn) modePartsBtn.setAttribute('aria-pressed', String(!real));
    if (NB3D.surfaceMesh) NB3D.surfaceMesh.visible = real;
    Object.keys(NB3D.parts).forEach(function (k) { NB3D.parts[k].visible = !real; });
    if (explodeBtn) {
      explodeBtn.disabled = real;
      explodeBtn.setAttribute('aria-disabled', String(real));
    }
    if (selectionEl) {
      if (real) {
        selectionEl.removeAttribute('hidden');
        selectionEl.textContent = t('labAnatomy3d.surfaceHint');
      } else {
        selectionEl.setAttribute('hidden', '');
      }
    }
    selectPart(null);
    scheduleSave();
  }

  function highlightPart(key, on) {
    var group = NB3D.parts[key];
    if (!group) return;
    group.children.forEach(function (mesh) {
      if (on) mesh.material.emissive = new THREE.Color(0x224466);
      else mesh.material.emissive = new THREE.Color(0x000000);
    });
  }
  /* 选中部件：高亮 + 手势目标切换 + 右侧信息面板显示名称 / 说明 / 关键词 / 相关词条 */
  function selectPart(key) {
    if (NB3D.selectedKey) highlightPart(NB3D.selectedKey, false);
    NB3D.selectedKey = key || null;
    if (selectionEl && NB3D.mode === 'parts') selectionEl.setAttribute('hidden', '');
    if (NB3D.selectedKey) {
      highlightPart(NB3D.selectedKey, true);
      selectRegion(NB3D.selectedKey);
    } else {
      showDefault();
    }
    scheduleSave();
  }

  /* ---------- 单部件手势：左键拖动平移 / 右键拖动旋转 / 左键双击复位 ---------- */
  function setCanvasCursor(c) {
    if (NB3D.renderer && NB3D.renderer.domElement) NB3D.renderer.domElement.style.cursor = c;
  }
  /* 结束单部件手势：清空旋转快照并恢复相机控制 */
  function endPartGesture() {
    NB3D.dragging = false;
    NB3D.rotating = false;
    NB3D.rotPivot = null;
    NB3D.rotStartQuat = null;
    NB3D.rotStartPos = null;
    NB3D.rotStartPointer = null;
    NB3D.dragStartHit = null;
    NB3D.dragStartPos = null;
    if (NB3D.controls) NB3D.controls.enabled = true;
    setCanvasCursor('grab');
    scheduleSave();
  }

  /* 单部件复位：只恢复该部件的位置与旋转，不影响整体视角与「全部拆分」状态 */
  function resetPart(key) {
    var group = NB3D.parts[key];
    if (!group) return false;
    group.position.set(0, 0, 0);
    group.quaternion.set(0, 0, 0, 1);
    group.updateMatrixWorld(true);
    scheduleSave();
    return true;
  }

  function init3D() {
    var U = THREE;
    if (!U || !wrap3d) return;
    /* 场景 / 相机 / 部件几何不依赖渲染器：即使无 WebGL 也构建，保证接口与点选数据可用 */
    NB3D.scene = new U.Scene();
    NB3D.camera = new U.PerspectiveCamera(45, 1, 0.1, 50);
    NB3D.camera.position.copy(CAM_POS);
    NB3D.focus = CAM_TARGET.clone();
    buildBrain();
    buildSurface();
    setMode('real');   /* 默认真实皮层表面（fsaverage5 pial，含沟回） */
    NB3D.scene.add(new U.AmbientLight(0xffffff, 0.62));
    var key = new U.DirectionalLight(0xffffff, 0.8);
    key.position.set(3, 4, 2.5);
    NB3D.scene.add(key);
    var fill = new U.DirectionalLight(0x8899ff, 0.32);
    fill.position.set(-3, -1, -2.5);
    NB3D.scene.add(fill);
    NB3D.raycaster = new U.Raycaster();
    NB3D.dragPlane = new U.Plane(new U.Vector3(0, 0, 1), 0);

    var renderer;
    try {
      renderer = new U.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { renderer = null; }
    if (!renderer) {
      /* 加载中文字已移除：仅在 WebGL 不可用时显示降级说明 */
      if (loadingEl) {
        loadingEl.textContent = t('labAnatomy3d.noWebgl');
        loadingEl.removeAttribute('hidden');
      }
      return;
    }
    NB3D.ready = true;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    NB3D.renderer = renderer;

    NB3D.controls = new THREE.OrbitControls(NB3D.camera, renderer.domElement);
    NB3D.controls.target.copy(CAM_TARGET);
    /* 右键专供「拖动旋转部件」：取消 OrbitControls 默认的右键平移，避免两种手势互相抢事件 */
    if (NB3D.controls.mouseButtons) NB3D.controls.mouseButtons.RIGHT = null;
    NB3D.controls.enableDamping = true;
    NB3D.controls.dampingFactor = 0.08;
    NB3D.controls.minDistance = 1.7;
    NB3D.controls.maxDistance = 7.5;
    NB3D.controls.autoRotateSpeed = 1.2;
    NB3D.controls.addEventListener('end', saveViewState);   /* 相机拖拽 / 缩放结束后存档 */

    attach3DHandlers();
    sizeRenderer();
    window.addEventListener('resize', sizeRenderer);
    if (loadingEl) loadingEl.setAttribute('hidden', '');
    NB3D.startLoop();
  }

  function sizeRenderer() {
    if (!NB3D.renderer || !wrap3d) return;
    var w = wrap3d.clientWidth || 300;
    var h = wrap3d.clientHeight || 420;
    NB3D.renderer.setSize(w, h, false);
    NB3D.camera.aspect = w / h;
    NB3D.camera.updateProjectionMatrix();
    if (NB3D.renderer.domElement) {
      NB3D.renderer.domElement.style.width = '100%';
      NB3D.renderer.domElement.style.height = '100%';
      NB3D.renderer.domElement.style.display = 'block';
      NB3D.renderer.domElement.style.touchAction = 'none';
      var box = document.getElementById('anatomy-3d-canvas-box');
      if (box && box.firstChild !== NB3D.renderer.domElement) box.appendChild(NB3D.renderer.domElement);
    }
  }

  /* ---------- 交互：点选 / 拖动 ---------- */
  function pick(ev) {
    if (!NB3D.renderer) return null;
    var rect = NB3D.renderer.domElement.getBoundingClientRect();
    var ndc = new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
    NB3D.raycaster.setFromCamera(ndc, NB3D.camera);
    if (NB3D.mode === 'real') {
      return surfaceHit(NB3D.raycaster);
    }
    var hits = NB3D.raycaster.intersectObjects(NB3D.scene.children, true);
    for (var i = 0; i < hits.length; i++) {
      var obj = hits[i].object;
      if (obj && obj.parent && obj.parent.userData && obj.parent.userData.regionKey) {
        return { key: obj.parent.userData.regionKey, point: hits[i].point };
      }
    }
    return null;
  }

  /* 真实皮层表面：命中面 → 面中心归一化坐标 → 近似脑区 */
  function surfaceHit(raycaster) {
    if (!NB3D.surfaceMesh) return null;
    var hits = raycaster.intersectObject(NB3D.surfaceMesh);
    if (!hits.length) return null;
    var f = hits[0].face;
    var pos = NB3D.surfaceMesh.geometry.getAttribute('position');
    var a = new THREE.Vector3().fromBufferAttribute(pos, f.a);
    var b = new THREE.Vector3().fromBufferAttribute(pos, f.b);
    var c = new THREE.Vector3().fromBufferAttribute(pos, f.c);
    var center = a.add(b).add(c).divideScalar(3);
    return { key: regionOfPoint(center), point: center, surface: true };
  }
  function selectSurfaceRegion(key) {
    if (!BY_KEY[key]) return;
    selectRegion(key, true);
    infoApprox = true;   /* 真实皮层表面点选属于近似归属 */
    if (selectionEl) {
      selectionEl.textContent = t('labAnatomy.region' + pascal(key)) + ' ' + t('labAnatomy3d.regionApprox');
    }
  }
  function showSurfaceDefault() {
    showDefault();
    if (selectionEl) selectionEl.textContent = t('labAnatomy3d.surfaceHint');
  }

  function ndcOf(ev) {
    var rect = NB3D.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  /* 部件世界包围盒中心（部件几何在子 mesh 上，group.position 仅作为拖动偏移） */
  function partCenter(group) {
    var box = new THREE.Box3().setFromObject(group);
    var c = new THREE.Vector3();
    if (box.isEmpty()) c.copy(group.position);
    else box.getCenter(c);
    return c;
  }

  /* 绕部件自身中心旋转：记录按下时的枢轴 / 姿态 / 指针位置，移动时按相机左右轴与上下轴合成四元数 */
  function startPartRotate(ev) {
    var group = NB3D.parts[NB3D.selectedKey];
    if (!group) return;
    NB3D.rotPivot = partCenter(group);
    NB3D.rotStartQuat = group.quaternion.clone();
    NB3D.rotStartPos = group.position.clone();
    NB3D.rotStartPointer = { x: ev.clientX, y: ev.clientY };
    NB3D.rotating = true;
    NB3D.dragging = true;
    if (NB3D.controls) NB3D.controls.enabled = false;
  }

  function movePartRotate(ev) {
    var group = NB3D.parts[NB3D.selectedKey];
    if (!group || !NB3D.rotPivot || !NB3D.rotStartQuat || !NB3D.rotStartPos || !NB3D.rotStartPointer) return;
    var dx = ev.clientX - NB3D.rotStartPointer.x;
    var dy = ev.clientY - NB3D.rotStartPointer.y;
    var right = new THREE.Vector3().setFromMatrixColumn(NB3D.camera.matrixWorld, 0).normalize();
    var up = new THREE.Vector3().setFromMatrixColumn(NB3D.camera.matrixWorld, 1).normalize();
    var qUp = new THREE.Quaternion().setFromAxisAngle(up, dx * ROTATE_SPEED);
    var qRight = new THREE.Quaternion().setFromAxisAngle(right, dy * ROTATE_SPEED);
    var q = qUp.multiply(qRight);
    /* 绕枢轴 c 旋转：p' = c + q·(p0 - c)，姿态 q·q0 */
    group.quaternion.copy(NB3D.rotStartQuat).premultiply(q);
    group.position.copy(NB3D.rotStartPos).sub(NB3D.rotPivot).applyQuaternion(q).add(NB3D.rotPivot);
  }

  function on3dDown(ev) {
    if (!NB3D.renderer) return;
    var dom = NB3D.renderer.domElement;
    if (dom.setPointerCapture && typeof ev.pointerId === 'number') {
      try { dom.setPointerCapture(ev.pointerId); } catch (e) {}
    }
    var hit = pick(ev);

    /* 右键拖动：分区部件模式下旋转命中的部件（不改变整体视角） */
    if (ev.button === 2) {
      if (NB3D.mode === 'parts' && hit) {
        selectPart(hit.key);
        startPartRotate(ev);
        setCanvasCursor('grabbing');
        ev.preventDefault();
      }
      return;
    }
    /* 只处理左键；中键留给相机推拉 */
    if (typeof ev.button === 'number' && ev.button !== 0) return;

    if (!hit) {
      if (NB3D.mode === 'real') showSurfaceDefault();
      selectPart(null);
      return;
    }
    if (NB3D.mode === 'real') {
      selectSurfaceRegion(hit.key);   /* 右侧信息面板同步显示脑区名称与基本知识 */
      ev.preventDefault();
      return;   /* 真实表面整体不拖动，仅查看说明 */
    }
    selectPart(hit.key);   /* 点击部件 → 高亮 + 右侧信息面板讲解 */
    var group = NB3D.parts[hit.key];
    if (!group) return;
    /* 左键拖动平移：拖动平面过部件包围盒中心、法线 = 相机视线方向；拖动期间保持同一平面，深度不变 */
    var center = partCenter(group);
    var camDir = NB3D.camera.getWorldDirection(new THREE.Vector3());
    NB3D.dragPlane.setFromNormalAndCoplanarPoint(camDir, center);
    NB3D.raycaster.setFromCamera(ndcOf(ev), NB3D.camera);
    var startHit = new THREE.Vector3();
    if (!NB3D.raycaster.ray.intersectPlane(NB3D.dragPlane, startHit)) return;
    NB3D.dragStartHit = startHit.clone();
    NB3D.dragStartPos = group.position.clone();
    NB3D.dragging = true;
    if (NB3D.controls) NB3D.controls.enabled = false;
    setCanvasCursor('move');
    ev.preventDefault();
  }
  function on3dMove(ev) {
    if (!NB3D.renderer) return;
    if (NB3D.rotating) {
      movePartRotate(ev);
      setCanvasCursor('grabbing');
      ev.preventDefault();
    } else if (NB3D.dragging && NB3D.selectedKey && NB3D.dragStartHit && NB3D.dragStartPos) {
      /* 相对位移：同一固定平面上的交点差 → 平移 group.position；部件深度不变，不会因透视产生缩放 */
      NB3D.raycaster.setFromCamera(ndcOf(ev), NB3D.camera);
      var cur = new THREE.Vector3();
      if (NB3D.raycaster.ray.intersectPlane(NB3D.dragPlane, cur)) {
        cur.sub(NB3D.dragStartHit);
        NB3D.parts[NB3D.selectedKey].position.copy(NB3D.dragStartPos).add(cur);
      }
      setCanvasCursor('move');
      ev.preventDefault();
    } else {
      var hit = pick(ev);
      setCanvasCursor(hit ? (NB3D.mode === 'parts' ? 'grab' : 'pointer') : 'grab');
    }
  }
  function on3dUp(ev) {
    if (NB3D.renderer && NB3D.renderer.domElement && NB3D.renderer.domElement.releasePointerCapture &&
      ev && typeof ev.pointerId === 'number') {
      try { NB3D.renderer.domElement.releasePointerCapture(ev.pointerId); } catch (e) {}
    }
    endPartGesture();
    saveViewState();   /* 拖拽 / 旋转结束后立即存档，避免快速点词条时丢失 */
  }
  /* 左键双击命中部件 → 复位该部件（位置与角度，不改变整体视角） */
  function on3dDblClick(ev) {
    if (!NB3D.renderer) return;
    if (NB3D.mode !== 'parts') return;
    if (typeof ev.button === 'number' && ev.button !== 0) return;
    var hit = pick(ev);
    if (!hit) return;
    selectPart(hit.key);
    if (resetPart(hit.key) && selectionEl) {
      selectionEl.textContent = t('labAnatomy.region' + pascal(hit.key)) + ' ' + t('labAnatomy3d.partResetDone');
      selectionEl.removeAttribute('hidden');
    }
    ev.preventDefault();
  }
  function attach3DHandlers() {
    var dom = NB3D.renderer.domElement;
    dom.addEventListener('pointerdown', on3dDown);
    dom.addEventListener('pointermove', on3dMove);
    dom.addEventListener('pointerup', on3dUp);
    dom.addEventListener('pointerleave', on3dUp);
    dom.addEventListener('pointercancel', on3dUp);
    dom.addEventListener('dblclick', on3dDblClick);
    dom.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
  }

  /* ---------- 拆分 / 合并 / 复位 / 自动旋转 ---------- */
  var explodeState = false;
  var animT = null;
  function ease(t01) { return t01 < 0.5 ? 4 * t01 * t01 * t01 : 1 - Math.pow(-2 * t01 + 2, 3) / 2; }
  function animateUnits(toExplode, done) {
    if (animT) cancelAnimationFrame(animT);
    var start = performance.now();
    var dur = 550;
    function step(now) {
      var k = Math.min(1, (now - start) / dur);
      var e = ease(k);
      NB3D.unitList.forEach(function (u) {
        if (toExplode) u.mesh.position.copy(u.base.clone().add(u.dir.clone().multiplyScalar(EXPLODE_D * e)));
        else u.mesh.position.copy(u.base.clone().add(u.dir.clone().multiplyScalar(EXPLODE_D * (1 - e))));
      });
      if (k < 1) animT = requestAnimationFrame(step);
      else { animT = null; if (done) done(); }
    }
    animT = requestAnimationFrame(step);
  }
  function explode() {
    if (!NB3D.ready || NB3D.mode !== 'parts') return;   /* 拆分为分区部件功能 */
    explodeState = !explodeState;
    explodeBtn.setAttribute('aria-pressed', String(explodeState));
    explodeBtn.textContent = t(explodeState ? 'labAnatomy3d.merge' : 'labAnatomy3d.explode');
    animateUnits(explodeState, scheduleSave);
    scheduleSave();
  }
  /* 全部复位：恢复所有部件的位置 / 旋转与拆分状态，但不改变当前观察视角（不重置相机） */
  function reset() {
    if (animT) cancelAnimationFrame(animT);
    if (NB3D.mode === 'parts') {
      NB3D.unitList.forEach(function (u) { u.mesh.position.copy(u.base); });
      Object.keys(NB3D.parts).forEach(function (k) {
        NB3D.parts[k].position.set(0, 0, 0);
        NB3D.parts[k].quaternion.set(0, 0, 0, 1);
      });
      selectPart(null);
      if (explodeState) {
        explodeState = false;
        explodeBtn.setAttribute('aria-pressed', 'false');
        explodeBtn.textContent = t('labAnatomy3d.explode');
      }
    } else {
      showSurfaceDefault();
    }
    endPartGesture();
    scheduleSave();
  }
  function toggleAutoRotate() {
    var on = autorotateBtn.getAttribute('aria-pressed') === 'true';
    autorotateBtn.setAttribute('aria-pressed', String(!on));
    if (NB3D.controls) NB3D.controls.autoRotate = !on;
    scheduleSave();
    return !on;
  }
  explodeBtn.addEventListener('click', explode);
  resetBtn.addEventListener('click', reset);
  autorotateBtn.addEventListener('click', toggleAutoRotate);
  if (modeRealBtn) modeRealBtn.addEventListener('click', function () { setMode('real'); });
  if (modePartsBtn) modePartsBtn.addEventListener('click', function () { setMode('parts'); });

  /* ---------- 渲染循环 ---------- */
  var loopId = null;
  function loop() {
    /* 拖动部件期间暂停相机控制：避免 autoRotate / 惯性阻尼继续旋转相机，
       否则部件相对指针漂移、透视下出现异常缩放感 */
    if (NB3D.controls && !NB3D.dragging) NB3D.controls.update();
    NB3D.renderer.render(NB3D.scene, NB3D.camera);
    loopId = requestAnimationFrame(loop);
  }
  NB3D.startLoop = function () {
    if (!NB3D.ready || loopId) return;
    loopId = requestAnimationFrame(loop);
  };
  NB3D.stopLoop = function () {
    if (loopId) { cancelAnimationFrame(loopId); loopId = null; }
  };

  /* ============================ 视图状态记忆：词条跳转返回后原样恢复 ============================
     场景：在交互式脑解剖里转动视角 / 缩放 / 选中某脑区 / 切到 2D 或剖面 / 拆分并挪动部件之后，
     点「相关词条」跳到 term.html 阅读；用浏览器返回或词条页「返回 交互式脑解剖」回来时，
     应看到离开瞬间的同一画面，而不是默认视角。
     做法：本页持续写「会话级存档」（sessionStorage，不可用时回退 localStorage），
     并在跳往词条页时写一个「返回标记」；只有带着返回标记进来的加载才恢复存档。
     若从本页去的是其他页面（导航栏 / 返回实验区等），立即清空存档，下次进入仍是默认视角。 */
  var STATE_KEY = 'nb-anatomy-view';
  var RETURN_KEY = 'nb-anatomy-return';
  var STATE_TTL = 30 * 60 * 1000;   /* 返回标记 30 分钟内有效，避免陈旧视角被误恢复 */
  var stateReady = false;           /* 初始化 / 恢复完成前不写存档，防止默认状态覆盖旧存档 */
  var restoring = false;
  var saveTimer = null;
  var stateStore = (function () {
    try {
      var s = window.sessionStorage;
      var probe = '__nb_anatomy_probe__';
      s.setItem(probe, '1');
      s.removeItem(probe);
      return s;
    } catch (e) {
      try { return window.localStorage; } catch (e2) { return null; }
    }
  })();

  function num(v, dft) { return typeof v === 'number' && isFinite(v) ? v : dft; }
  function num3(arr, dft) {
    return [num(arr && arr[0], dft[0]), num(arr && arr[1], dft[1]), num(arr && arr[2], dft[2])];
  }

  /* 当前画面快照：视图 / 3D 模式 / 相机姿态 / 选中脑区 / 部件姿态 / 拆分 / 2D 分层与标注 / 滚动 */
  function snapshotView() {
    var st = {
      v: 1,
      at: Date.now(),
      view: currentView,
      mode: NB3D.mode,
      layer: (layerDeepBtn && layerDeepBtn.getAttribute('aria-pressed') === 'true') ? 'deep' : 'surface',
      labels: !(labelsBtn && labelsBtn.getAttribute('aria-pressed') === 'false'),
      region: infoRegion,
      approx: !!infoApprox,
      part: NB3D.selectedKey,
      explode: !!explodeState,
      autoRotate: !!(NB3D.controls && NB3D.controls.autoRotate),
      cam: null,
      parts: {},
      scroll: Math.max(0, Math.round(window.pageYOffset || document.documentElement.scrollTop || 0))
    };
    if (NB3D.camera) {
      var tg = (NB3D.controls && NB3D.controls.target) || NB3D.focus || CAM_TARGET;
      st.cam = {
        p: [NB3D.camera.position.x, NB3D.camera.position.y, NB3D.camera.position.z],
        t: [tg.x, tg.y, tg.z]
      };
    }
    Object.keys(NB3D.parts).forEach(function (k) {
      var g = NB3D.parts[k];
      st.parts[k] = {
        p: [g.position.x, g.position.y, g.position.z],
        q: [g.quaternion.x, g.quaternion.y, g.quaternion.z, g.quaternion.w]
      };
    });
    return st;
  }

  function saveViewState() {
    if (!stateReady || restoring || !stateStore) return;
    try { stateStore.setItem(STATE_KEY, JSON.stringify(snapshotView())); } catch (e) { /* 隐私模式忽略 */ }
  }
  function scheduleSave() {
    if (!stateReady || restoring) return;
    if (saveTimer) return;
    saveTimer = window.setTimeout(function () { saveTimer = null; saveViewState(); }, 300);
  }
  function markReturn() {
    if (!stateStore) return;
    try { stateStore.setItem(RETURN_KEY, String(Date.now())); } catch (e) { /* 忽略 */ }
  }
  function clearViewState() {
    if (!stateStore) return;
    try { stateStore.removeItem(STATE_KEY); stateStore.removeItem(RETURN_KEY); } catch (e) { /* 忽略 */ }
  }
  function readViewState() {
    if (!stateStore) return null;
    try {
      var at = Number(stateStore.getItem(RETURN_KEY) || 0);
      if (!at || Date.now() - at > STATE_TTL) return null;
      var raw = stateStore.getItem(STATE_KEY);
      if (!raw) return null;
      var st = JSON.parse(raw);
      return (st && st.v === 1) ? st : null;
    } catch (e) { return null; }
  }

  /* 拆分状态直接摆位（不播动画），保证一进页面就是离开时的样子 */
  function applyExplode(on) {
    explodeState = !!on;
    NB3D.unitList.forEach(function (u) {
      if (!u.base || !u.dir) return;
      u.mesh.position.copy(u.base);
      if (explodeState) u.mesh.position.add(u.dir.clone().multiplyScalar(EXPLODE_D));
    });
    if (explodeBtn) {
      explodeBtn.setAttribute('aria-pressed', String(explodeState));
      explodeBtn.textContent = t(explodeState ? 'labAnatomy3d.merge' : 'labAnatomy3d.explode');
    }
  }
  function applyPartPose(list) {
    if (!list) return;
    Object.keys(list).forEach(function (k) {
      var g = NB3D.parts[k], v = list[k];
      if (!g || !v || !v.p || !v.q) return;
      var p = num3(v.p, [0, 0, 0]);
      g.position.set(p[0], p[1], p[2]);
      g.quaternion.set(num(v.q[0], 0), num(v.q[1], 0), num(v.q[2], 0), num(v.q[3], 1));
      g.updateMatrixWorld(true);
    });
  }
  function restoreScroll(y) {
    if (!y) return;
    try { if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'; } catch (e) {}
    var apply = function () { try { window.scrollTo(0, y); } catch (e) {} };
    apply();
    if (window.requestAnimationFrame) window.requestAnimationFrame(apply);
    window.setTimeout(apply, 200);
  }

  function applyViewState(st) {
    restoring = true;
    try {
      /* 2D 分层 / 标注：只在与当前不同时切换，避免多余的面板重置 */
      if (st.layer === 'deep' && layerDeepBtn && layerSurfaceBtn &&
        layerDeepBtn.getAttribute('aria-pressed') !== 'true') setLayer(true);
      if (st.layer !== 'deep' && layerDeepBtn && layerSurfaceBtn &&
        layerDeepBtn.getAttribute('aria-pressed') === 'true') setLayer(false);
      if (st.labels === false && labelsBtn && labelsBtn.getAttribute('aria-pressed') === 'true') toggleLabels();

      /* 3D 显示模式 + 每个部件的位置 / 旋转 + 拆分偏移 */
      setMode(st.mode === 'parts' ? 'parts' : 'real');
      applyPartPose(st.parts);
      applyExplode(!!st.explode);

      /* 相机：位置 + 观察目标（滚轮缩放也在位置上体现） */
      if (st.cam && NB3D.camera) {
        var p = num3(st.cam.p, [CAM_POS.x, CAM_POS.y, CAM_POS.z]);
        var tg = num3(st.cam.t, [CAM_TARGET.x, CAM_TARGET.y, CAM_TARGET.z]);
        NB3D.camera.position.set(p[0], p[1], p[2]);
        if (!NB3D.focus) NB3D.focus = new THREE.Vector3(tg[0], tg[1], tg[2]);
        else NB3D.focus.set(tg[0], tg[1], tg[2]);
        if (NB3D.controls) NB3D.controls.target.copy(NB3D.focus);
        NB3D.camera.lookAt(NB3D.focus);
        if (NB3D.controls) NB3D.controls.update();
      }
      var auto = !!st.autoRotate;
      if (NB3D.controls) NB3D.controls.autoRotate = auto;
      if (autorotateBtn) autorotateBtn.setAttribute('aria-pressed', String(auto));

      /* 视图切换会重置信息面板 / 收起部位菜单，必须排在选择恢复之前 */
      switchView(st.view === VIEW2D ? VIEW2D : (st.view === VIEWSEC ? VIEWSEC : VIEW3D));

      /* 选中部位（含高亮）→ 右侧信息面板脑区；旧存档里的 rotate / menu 字段直接忽略 */
      if (st.mode === 'parts' && st.part && NB3D.parts[st.part]) {
        selectPart(st.part);
        if (!st.region) showDefault();   /* 离开时右侧面板是默认态（选中部位仍在，但不显示说明） */
      }
      if (st.region && BY_KEY[st.region]) {
        if (st.view === VIEW3D && st.mode === 'real') selectSurfaceRegion(st.region);
        else selectRegion(st.region);
      }
      if (autorotateBtn) {
        autorotateBtn.setAttribute('aria-pressed',
          String(NB3D.controls ? !!NB3D.controls.autoRotate : auto));
      }

      restoreScroll(st.scroll);
    } catch (e) {
      /* 存档损坏 / 旧版本字段缺失：忽略并保持当前默认画面，不影响页面使用 */
    } finally {
      restoring = false;
    }
  }

  /* 离开本页时的去向判定：词条页 → 存档 + 返回标记；其他页面 → 清空存档 */
  document.addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    var a = ev.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || a.hasAttribute('download') || a.getAttribute('target') === '_blank') return;
    if (/(^|\/)term\.html(\?|#|$)/.test(href)) {
      saveViewState();
      markReturn();
    } else {
      clearViewState();
    }
  }, true);
  window.addEventListener('pagehide', saveViewState);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') saveViewState();
  });

  /* ---------- 启动 ---------- */
  showDefault();
  paintLabels();
  switchView(currentView); /* 默认 3D：隐藏 2D/剖面 wrap */
  init3D();
  /* 从词条页返回：恢复离开瞬间的画面；其他入口进入：保持默认并清掉陈旧存档 */
  (function () {
    var saved = readViewState();
    if (saved) applyViewState(saved);
    else clearViewState();
    stateReady = true;
  })();

  window.NB.labAnatomy = {
    REGIONS: REGIONS,
    selectRegion: selectRegion,
    setLayer: setLayer,
    toggleLabels: toggleLabels,
    switchView: switchView,
    state: snapshotView,
    saveState: saveViewState,
    clearState: clearViewState
  };
  window.NB.labAnatomy3d = {
    ready: function () { return NB3D.ready; },
    partCount: function () { return Object.keys(NB3D.parts).length; },
    parts: Object.keys(NB3D.parts),
    mode: function () { return NB3D.mode; },
    setMode: setMode,
    surfaceFaces: function () {
      return (NB3D.surfaceMesh && NB3D.surfaceMesh.geometry.index)
        ? NB3D.surfaceMesh.geometry.index.count / 3 : 0;
    },
    surfaceVerts: function () {
      return (NB3D.surfaceMesh && NB3D.surfaceMesh.geometry.getAttribute('position'))
        ? NB3D.surfaceMesh.geometry.getAttribute('position').count : 0;
    },
    regionAt: regionOfPoint,
    deepInfo: function (key) {
      var g = NB3D.parts[key];
      if (!g || !g.children.length) return null;
      var geo = g.children[0].geometry;
      return { verts: geo.attributes.position.count, tris: (geo.index ? geo.index.count : 0) / 3 };
    },
    deepSource: function (key) {
      var D = window.NB_DEEP;
      if (!D) return 'model';
      if (D[key] && D[key].v) return 'real';
      if (D[key + '-l'] && D[key + '-r']) return 'real';
      return 'model';
    },
    regionFaces: function (key) { return NB3D.regionFaceCounts[key] || 0; },
    regionFaceTotal: function () {
      var s = 0;
      Object.keys(NB3D.regionFaceCounts).forEach(function (k) { s += NB3D.regionFaceCounts[k]; });
      return s;
    },
    selectPart: selectPart,
    explode: explode,
    merge: function () { if (explodeState) explode(); },
    reset: reset,
    resetPart: resetPart,
    /* 兼容旧调用：单部件弹窗菜单已取消，旋转 / 复位改为鼠标手势 */
    rotateMode: function () { return false; },
    setRotateMode: function () { return false; },
    partMenuVisible: function () { return false; },
    partMenuRegion: function () { return null; },
    resetSelectedPart: function () { return NB3D.selectedKey ? resetPart(NB3D.selectedKey) : false; },
    partState: function (key) {
      var g = NB3D.parts[key];
      if (!g) return null;
      return {
        position: [g.position.x, g.position.y, g.position.z],
        quaternion: [g.quaternion.x, g.quaternion.y, g.quaternion.z, g.quaternion.w]
      };
    },
    partObject: function (key) { return NB3D.parts[key] || null; },
    cameraObject: function () { return NB3D.camera || null; },
    cameraState: function () {
      if (!NB3D.camera) return null;
      var tgt = (NB3D.controls && NB3D.controls.target) || NB3D.focus || CAM_TARGET;
      return {
        position: [NB3D.camera.position.x, NB3D.camera.position.y, NB3D.camera.position.z],
        target: [tgt.x, tgt.y, tgt.z]
      };
    },
    toggleAutoRotate: toggleAutoRotate,
    switchView: switchView,
    view: function () { return currentView; }
  };
})();
