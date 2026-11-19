/* ============================================================================
   NeuroBase · 公共层（普通脚本，非 ES module —— file:// 双击打开也能运行）
   提供：文案 t()、数据查询、学习进度、主题、搜索、页面外壳（顶栏/页脚/悬浮继续学习）
   依赖：assets/js/data/terms.js、assets/js/data/i18n.js（均挂在 window 上，无需构建）
   ============================================================================ */
(function () {
  'use strict';

  var LOCALE_KEY = 'nb-locale';
  var THEME_KEY = 'nb-theme';
  var PROGRESS_KEY = 'nb-progress';
  var RECENT_LIMIT = 12;
  /* 反馈箱「管理员入口」、admin.html 口令门与社区管理入口共用的口令校验。
     源码只保存「加盐 SHA-256 摘要」，不出现口令明文；改口令只需重算这一处摘要。
     这仍是纯前端软限制（仅防误入，不构成服务端鉴权）；真正的删除/禁言权限由
     Supabase RLS + 管理 RPC 在数据库侧校验（见 docs/supabase/community-v2.sql）。 */
  var ADMIN_SALT = 'nb-admin::v1::';
  var ADMIN_HASH = '2a8a664b72feba7fbe773df50b2720b3e3a5a4c4b6089a591ad6098e8dcdac59';

  /* 纯 JS SHA-256（file:// 下没有 crypto.subtle，内置实现保证双击打开也能校验） */
  var SHA_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function sha256Hex(input) {
    var str = String(input == null ? '' : input);
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) bytes.push(c);
      else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var c2 = str.charCodeAt(++i);
        var cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
        bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    var bitsHi = Math.floor((bytes.length * 8) / 4294967296);
    var bitsLo = (bytes.length * 8) >>> 0;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    bytes.push((bitsHi >>> 24) & 255, (bitsHi >>> 16) & 255, (bitsHi >>> 8) & 255, bitsHi & 255,
      (bitsLo >>> 24) & 255, (bitsLo >>> 16) & 255, (bitsLo >>> 8) & 255, bitsLo & 255);

    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    for (var off = 0; off < bytes.length; off += 64) {
      for (var j = 0; j < 16; j++) {
        w[j] = (bytes[off + j * 4] << 24) | (bytes[off + j * 4 + 1] << 16) |
          (bytes[off + j * 4 + 2] << 8) | bytes[off + j * 4 + 3];
      }
      for (j = 16; j < 64; j++) {
        var x = w[j - 15], y = w[j - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], cc = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (j = 0; j < 64; j++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + SHA_K[j] + w[j]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var maj = (a & b) ^ (a & cc) ^ (b & cc);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = cc; cc = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + cc) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + ((H[i] >>> 0).toString(16))).slice(-8);
    return out;
  }

  function adminCheck(pass) {
    var v = String(pass == null ? '' : pass).trim();
    if (!v) return false;
    return sha256Hex(ADMIN_SALT + v) === ADMIN_HASH;
  }

  var MODULES = window.NB_MODULES || [];
  var TERMS = window.NB_TERMS || [];
  var BY_ID = new Map(TERMS.map(function (t) { return [t.id, t]; }));

  /* 原生版新增文案（沿用原版键名体系，统一放 nb.* 前缀，不与既有键冲突） */
  var EXTRA = {
    zh: {
      nb: {
        search: '检索',
        allModules: '全部模块',
        moduleFilter: '模块筛选',
        dailyShuffle: '换一个',
        difficulty: '难度',
        openEntry: '打开词条',
        moduleLabel: '所属模块',
        keywords: '关键词',
        showAll: '显示全部',
        filtered: '已按「{name}」筛选',
        resultCount: '找到 {n} 条',
        categoryFilter: '分类筛选',
        pathSteps: '书单顺序'
      },
      fb: {
        open: '反馈箱',
        title: '意见反馈',
        sub: '发现内容错误、使用不便或想提建议？欢迎留言。',
        type: '反馈类型',
        typeErr: '内容纠错',
        typeUse: '使用问题',
        typeIdea: '功能建议',
        typeOther: '其他',
        otherPh: '请补充说明',
        device: '你的设备',
        deviceAuto: '自动识别',
        deviceHint: '由浏览器自动识别，无需填写。',
        devPc: '电脑',
        devTablet: '平板',
        devPhone: '手机',
        body: '反馈内容',
        bodyPh: '请描述你遇到的问题或建议…',
        count: '{n} / 1000',
        required: '必填',
        send: '提交反馈',
        errType: '请选择反馈类型',
        errBody: '请填写反馈内容',
        errLong: '反馈内容请控制在 1000 字以内',
        ok: '已收到你的反馈，感谢！',
        mineTitle: '我的提问记录',
        mineHint: '提问保存在当前浏览器；管理员回复后，打开反馈箱会自动同步到这里。',
        emptyMine: '还没有提问记录。',
        exportBtn: '导出凭据',
        exportOk: '已复制凭据并下载文件；凭据含提问内容，请妥善保管。',
        exportShown: '凭据已填入下方文本框，可手动全选复制；凭据含提问内容，请妥善保管。',
        restoreBtn: '恢复凭据',
        restoreHint: '粘贴此前导出的凭据文本（JSON），可在换设备 / 换浏览器后找回记录',
        restoreApply: '恢复',
        restoreBad: '凭据格式不正确，请粘贴完整内容',
        restoreOk: '已恢复 {n} 条记录，正在同步回复…',
        restoreNone: '没有可恢复的新记录',
        pending: '待回复',
        replied: '已回复',
        unreadBadge: '未读',
        adminLink: '管理员入口',
        close: '关闭'
      },
      admin: {
        title: '反馈管理',
        desc: '查看访客反馈并回复。数据保存在本机浏览器（localStorage）。',
        total: '共 {n} 条反馈',
        unread: '未读 {n}',
        markRead: '标为已读',
        markUnread: '标为未读',
        replyPh: '输入回复内容…',
        replySend: '发送回复',
        replyAt: '管理员回复',
        empty: '暂无反馈',
        saved: '已保存',
        from: '来源：{page}',
        allRead: '全部标为已读',
        gateTitle: '管理员验证',
        gateDesc: '本页为反馈管理入口，请输入管理员口令后查看与回复。',
        gatePh: '输入口令',
        gateUnlock: '解锁',
        gateErr: '口令错误，请重试',
        gateLockedHint: '口令为本机离线版「软限制」，仅用于避免误入。'
      },
      help: {
        open: '帮助',
        title: '页面功能导览',
        skip: '跳过',
        prev: '上一步',
        next: '下一步',
        done: '完成',
        count: '第 {cur} / {total} 步',
        explainTitle: '讲解',
        step1Title: '栏目导航',
        step1Desc: '顶部按栏目分组：首页是学习入口，术语检索可查全部词条，另有互动实验室、学习工具、内容生态、教材导读与关于；当前所在栏目用实心蓝色块标出。',
        step1Point1: '首页 = 检索 + 每日一词 + 学习进度 + 知识模块，是最顺手的起点。',
        step1Point2: '互动实验室放脑解剖、认知实验与信号演示；学习工具放拼写与测验。',
        step1Point3: '内容生态汇总 BCI 专区、神经科学↔工程对照与前沿速览；项目文件在「关于」里。',
        step2Title: '首页检索',
        step2Desc: '在搜索框输入中文、英文或缩写（如 P300、SSVEP、突触），点「检索」即跳转术语检索页查看结果；回车与点按钮效果相同。',
        step2Point1: '支持中英混输与缩写，大小写不敏感。',
        step2Point2: '结果页还能按模块继续筛选，或直接进入「术语检索」浏览全部词条。',
        step3Title: '每日一词',
        step3Desc: '按日期自动轮换一个核心概念，帮你每天积累一个术语；打开过的词条会计入学习进度。',
        step3Point1: '单击卡片可查看学术定义、通俗解释、工程对接与来源核验。',
        step3Point2: '点「换一个」可随时随机切换。',
        step4Title: '学习进度',
        step4Desc: '自动记录你浏览过的词条：进度条与徽章显示已读数量与完成度，下方列出最近看过的词条。',
        step4Point1: '记录只保存在本机浏览器，换设备不会同步。',
        step4Point2: '点「清除进度」可随时清空本机学习记录。',
        step5Title: '知识模块',
        step5Desc: '按 11 个知识模块组织全部词条，覆盖从神经元、突触到脑机接口的神经与认知科学基础框架。',
        step5Point1: '点模块卡片可查看该模块的词条清单。',
        step5Point2: '模块名旁的数字是该模块的目标词条数，可用来对照进度。',
        step6Title: '反馈箱',
        step6Desc: '发现问题、有改进建议或发现内容错误？点「反馈箱」打开留言框，选择类别并填写后提交即可。',
        step6Point1: '可留联系方式，管理员回复后会同步到「我的提问」。',
        step6Point2: '反馈保存在本机浏览器，也可导出凭证在换设备后恢复。',
        step7Title: '帮助',
        step7Desc: '任何时候点这里都能重新打开本功能导览；导览只介绍当前页面真实存在的区块，其他栏目页会自动精简步骤。',
        step7Point1: '用「上一步 / 下一步」分步浏览，「跳过」直接关闭。',
        step7Point2: '最后一步点「完成」，高亮与背景变暗效果一起恢复。',
        step8Title: '字号调节',
        step8Desc: '工具栏右侧「A 字号」控件可调节正文阅读字号：拖动滑块在 25%–300% 间连续缩放，或点「− / +」按钮每次微调 5%；设置保存在本机。',
        step8Point1: '只放大文字，不改变页面布局，按钮与图片位置保持稳定。',
        step8Point2: '刷新或切换页面后仍然生效。'
      }
    },
    en: {
      nb: {
        search: 'Search',
        allModules: 'All modules',
        moduleFilter: 'Filter by module',
        dailyShuffle: 'Another one',
        difficulty: 'Level',
        openEntry: 'Open entry',
        moduleLabel: 'Module',
        keywords: 'Keywords',
        showAll: 'Show all',
        filtered: 'Filtered by “{name}”',
        resultCount: '{n} found',
        categoryFilter: 'Filter by category',
        pathSteps: 'Reading order'
      },
      fb: {
        open: 'Feedback',
        title: 'Feedback',
        sub: 'Spotted an error, a usability issue, or have a suggestion? Leave a message.',
        type: 'Category',
        typeErr: 'Content correction',
        typeUse: 'Usage issue',
        typeIdea: 'Feature suggestion',
        typeOther: 'Other',
        otherPh: 'Please specify',
        device: 'Your device',
        deviceAuto: 'Auto-detected',
        deviceHint: 'Detected automatically by your browser.',
        devPc: 'Desktop',
        devTablet: 'Tablet',
        devPhone: 'Phone',
        body: 'Message',
        bodyPh: 'Describe the issue or suggestion…',
        count: '{n} / 1000',
        required: 'Required',
        send: 'Submit',
        errType: 'Please choose a category',
        errBody: 'Please write a message',
        errLong: 'Message must be within 1000 characters',
        ok: 'Thanks for your feedback!',
        mineTitle: 'My questions',
        mineHint: 'Saved in this browser; replies sync here when you open the box.',
        emptyMine: 'No questions yet.',
        exportBtn: 'Export credentials',
        exportOk: 'Credential copied and downloaded. It contains your questions — keep it safe.',
        exportShown: 'Credential filled into the box below — select and copy it. Keep it safe.',
        restoreBtn: 'Restore credentials',
        restoreHint: 'Paste a previously exported credential (JSON) to recover records on another device',
        restoreApply: 'Restore',
        restoreBad: 'Invalid credential — please paste the complete text',
        restoreOk: 'Restored {n} record(s), syncing replies…',
        restoreNone: 'Nothing new to restore',
        pending: 'Awaiting reply',
        replied: 'Replied',
        unreadBadge: 'New',
        adminLink: 'Admin panel',
        close: 'Close'
      },
      admin: {
        title: 'Feedback Admin',
        desc: 'Review visitor feedback and reply. Data is stored in this browser (localStorage).',
        total: '{n} messages',
        unread: '{n} unread',
        markRead: 'Mark read',
        markUnread: 'Mark unread',
        replyPh: 'Type a reply…',
        replySend: 'Send reply',
        replyAt: 'Admin reply',
        empty: 'No feedback yet.',
        saved: 'Saved',
        from: 'From: {page}',
        allRead: 'Mark all read',
        gateTitle: 'Admin verification',
        gateDesc: 'This page manages feedback. Enter the admin passcode to view and reply.',
        gatePh: 'Enter passcode',
        gateUnlock: 'Unlock',
        gateErr: 'Incorrect passcode, try again.',
        gateLockedHint: 'Passcode is a soft access hint in this local offline build.'
      },
      help: {
        open: 'Help',
        title: 'Page tour',
        skip: 'Skip',
        prev: 'Back',
        next: 'Next',
        done: 'Done',
        count: 'Step {cur} / {total}',
        explainTitle: 'Walkthrough',
        step1Title: 'Section navigation',
        step1Desc: 'The top bar groups the site by section: Home is the learning entry, Glossary searches every term, and Lab, Learning tools, Explore, Reading List and About cover the rest; the current section is marked with a solid blue block.',
        step1Point1: 'Home combines search, term of the day, progress and modules — the easiest starting point.',
        step1Point2: 'Lab hosts brain anatomy, cognitive experiments and signal demos; Learning tools hosts spelling drills and quizzes.',
        step1Point3: 'Explore gathers the BCI zone, the neuroscience-to-engineering map and the frontier digest; project files live under About.',
        step2Title: 'Home search',
        step2Desc: 'Type Chinese, English or an acronym (P300, SSVEP, synapse) and press Search to open the glossary results; the Enter key works exactly like the button.',
        step2Point1: 'Mixed Chinese/English input and acronyms are both accepted; case does not matter.',
        step2Point2: 'On the results page you can keep filtering by module, or open Glossary to browse everything.',
        step3Title: 'Term of the day',
        step3Desc: 'A core concept rotates automatically each day so your vocabulary grows steadily; every term you open is counted in your learning progress.',
        step3Point1: 'Click the card for the academic definition, plain-language explanation, engineering link and sources.',
        step3Point2: 'Press Shuffle to switch to a random term at any time.',
        step4Title: 'Learning progress',
        step4Desc: 'Terms you have opened are tracked automatically: the bar and badge show how many you have read and how far you are, with recent entries listed below.',
        step4Point1: 'History stays in this browser only; it does not sync across devices.',
        step4Point2: 'Press Reset progress to clear the local history whenever you like.',
        step5Title: 'Knowledge modules',
        step5Desc: 'All terms are grouped into 11 modules that follow the neuroscience and cognitive science framework, from neurons and synapses to brain-computer interfaces.',
        step5Point1: 'Click a module card to see the term list for that module.',
        step5Point2: 'The number next to the module name is its target term count, useful for checking coverage.',
        step6Title: 'Feedback box',
        step6Desc: 'Found a mistake, a usability problem, or have a suggestion? Open the Feedback box, choose a category, write your message and submit it.',
        step6Point1: 'You can leave contact details; admin replies appear in "My questions".',
        step6Point2: 'Messages are stored in this browser, and you can export a credential to restore them elsewhere.',
        step7Title: 'Help',
        step7Desc: 'Click here any time to reopen this tour. It only introduces blocks that really exist on the current page, so other sections show a shorter list.',
        step7Point1: 'Use Back / Next to walk through the steps, or Skip to close the tour immediately.',
        step7Point2: 'On the last step press Done; the highlight and the dimmed background are restored right away.',
        step8Title: 'Text size',
        step8Desc: 'The "A Text size" control on the right of the toolbar sets reading size: drag the slider between 25% and 300%, or tap the − / + buttons to step by 5% each time.',
        step8Point1: 'Only text is enlarged; layout, buttons and images keep their positions.',
        step8Point2: 'The setting is saved in this browser and persists after refresh or page changes.'
      }
    }
  };
  function mergeDict(base, over) {
    var out = {};
    var k;
    for (k in base) out[k] = base[k];
    for (k in over) {
      var b = out[k];
      var o = over[k];
      if (b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(b) && !Array.isArray(o)) {
        var merged = {};
        var x;
        for (x in b) merged[x] = b[x];
        for (x in o) merged[x] = o[x];
        out[k] = merged;
      } else {
        out[k] = o;
      }
    }
    return out;
  }
  var RAW = window.NB_I18N || { zh: {}, en: {} };
  var I18N = {
    zh: mergeDict(EXTRA.zh, RAW.zh || {}),
    en: mergeDict(EXTRA.en, RAW.en || {})
  };

  /* ---------------- 基础工具 ---------------- */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* 隐私模式：忽略即可 */ } }
  function fmtDate(v) { return String(v == null ? '' : v).slice(0, 10); }

  /* ---------------- 文案 ---------------- */
  function locale() { return read(LOCALE_KEY) === 'en' ? 'en' : 'zh'; }
  /* 中英切换：写入本机偏好并重载页面，让静态 data-i18n 与页面脚本渲染的文案一起更新 */
  function setLocale(loc) {
    var next = loc === 'en' ? 'en' : 'zh';
    write(LOCALE_KEY, next);
    document.documentElement.setAttribute('lang', next === 'en' ? 'en' : 'zh-CN');
    applyI18n(document);
    try { window.location.reload(); } catch (e) { /* 测试 / 受限环境忽略 */ }
    return next;
  }
  function t(key, params) {
    var dict = I18N[locale()] || I18N.zh || {};
    var out = key.split('.').reduce(function (acc, k) { return acc == null ? acc : acc[k]; }, dict);
    if (out == null || typeof out !== 'string') return key;
    if (params) {
      for (var k in params) out = out.split('{' + k + '}').join(String(params[k]));
    }
    return out;
  }

  /* ---------------- 数据查询 ---------------- */
  function getTerm(id) { return BY_ID.get(String(id == null ? '' : id)) || null; }
  function getModule(id) { return MODULES.filter(function (m) { return m.id === id; })[0] || null; }
  function moduleName(m) { if (!m) return ''; return locale() === 'en' && m.name_en ? m.name_en : m.name_zh; }
  function termName(term) { if (!term) return ''; return locale() === 'en' ? (term.name_en || term.name_zh) : (term.name_zh || term.name_en); }
  function termsByModule(id) { return TERMS.filter(function (x) { return x.module === id; }); }
  function resolveRelated(term) {
    return (term && term.related ? term.related : []).map(getTerm).filter(Boolean);
  }
  function getBacklinks(id) {
    return TERMS.filter(function (x) { return (x.related || []).indexOf(id) >= 0; });
  }
  function getAdjacent(id) {
    var i = -1;
    for (var k = 0; k < TERMS.length; k++) if (TERMS[k].id === id) { i = k; break; }
    return {
      prev: i > 0 ? TERMS[i - 1] : null,
      next: i >= 0 && i < TERMS.length - 1 ? TERMS[i + 1] : null
    };
  }
  function getDailyTerm(now) {
    if (!TERMS.length) return null;
    var d = now || new Date();
    var day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return TERMS[((day % TERMS.length) + TERMS.length) % TERMS.length];
  }
  function difficultyLabel(d) {
    var v = t('reading.level.' + d);
    return v === 'reading.level.' + d ? String(d || '') : v;
  }
  function refTypeLabel(type) {
    var v = t('term.refType.' + type);
    return v === 'term.refType.' + type ? String(type || '') : v;
  }

  /* ---------------- 学习进度（localStorage，键 nb-progress） ---------------- */
  function loadProgress() {
    var raw = read(PROGRESS_KEY);
    var visited = [];
    if (raw) {
      try {
        var p = JSON.parse(raw);
        if (Array.isArray(p)) visited = p;
        else if (p && Array.isArray(p.visited)) visited = p.visited;
      } catch (e) { visited = []; }
    }
    var seen = new Set();
    return {
      visited: visited
        .map(function (x) { return String(x); })
        .filter(function (id) {
          if (!BY_ID.has(id) || seen.has(id)) return false;
          seen.add(id);
          return true;
        })
    };
  }
  var state = loadProgress();
  function persist() {
    write(PROGRESS_KEY, JSON.stringify({ visited: state.visited, updatedAt: new Date().toISOString() }));
  }
  var progress = {
    count: function () { return state.visited.length; },
    total: function () { return TERMS.length; },
    percent: function () { return TERMS.length ? Math.round((state.visited.length / TERMS.length) * 100) : 0; },
    isVisited: function (id) { return state.visited.indexOf(id) >= 0; },
    ids: function () { return state.visited.slice(); },
    recentIds: function () { return state.visited.slice(0, RECENT_LIMIT); },
    recent: function () { return progress.recentIds().map(getTerm).filter(Boolean); },
    lastTerm: function () { return state.visited.length ? getTerm(state.visited[0]) : null; },
    visit: function (id) {
      if (!BY_ID.has(id)) return;
      state.visited = [id].concat(state.visited.filter(function (x) { return x !== id; }));
      persist();
      /* 每日活动统计：给「我的学习」的目标进度用（community.js 未加载时静默跳过） */
      try {
        if (window.NB && window.NB.community && window.NB.community.activity) {
          window.NB.community.activity.bump('terms');
        }
      } catch (e) { /* 忽略 */ }
    },
    clear: function () { state.visited = []; persist(); }
  };

  /* ---------------- 主题：白天 / 黑夜 / 跟随系统 ---------------- */
  var THEMES = ['light', 'dark', 'system'];
  function theme() { var v = read(THEME_KEY); return THEMES.indexOf(v) >= 0 ? v : 'system'; }
  /* 部分环境（旧内核 / 内嵌 WebView / 测试环境）没有 matchMedia，缺了也不能让整页脚本中断 */
  function prefersDark() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) {
      return false;
    }
  }
  function applyTheme(value) {
    var v = value || theme();
    var dark = v === 'dark' || (v === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', dark);
  }
  function setTheme(v) { write(THEME_KEY, v); applyTheme(v); }
  function cycleTheme() { var next = THEMES[(THEMES.indexOf(theme()) + 1) % THEMES.length]; setTheme(next); return next; }
  function themeLabel(v) { return t(v === 'light' ? 'toolbar.themeLight' : v === 'dark' ? 'toolbar.themeDark' : 'toolbar.themeSystem'); }
  function themeIcon(v) { return v === 'light' ? '☀️' : v === 'dark' ? '🌙' : '🌗'; }
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (e) { /* 老浏览器忽略 */ }

  /* ---------------- 动画偏好：默认跟随系统，可手动关闭（html.motion-off） ----------------
     与 prefers-reduced-motion 同效：关闭后 CSS 过渡/动画时长压到 0.001ms。 */
  var MOTION_KEY = 'nb-motion';
  function motionOn() { return read(MOTION_KEY) !== 'off'; }
  function applyMotion(on) {
    var v = typeof on === 'boolean' ? on : motionOn();
    document.documentElement.classList.toggle('motion-off', !v);
    return v;
  }
  function setMotion(on) {
    write(MOTION_KEY, on ? 'on' : 'off');
    applyMotion(!!on);
    return !!on;
  }
  applyMotion();

  /* 屏幕阅读器播报区：所有页面共用，调用 NB.announce() 即可 */
  var liveEl = null;
  function announce(msg) {
    if (!msg) return;
    if (!liveEl || !liveEl.isConnected) {
      liveEl = document.getElementById('nb-live');
      if (!liveEl) {
        liveEl = document.createElement('div');
        liveEl.id = 'nb-live';
        liveEl.className = 'sr-only';
        liveEl.setAttribute('role', 'status');
        liveEl.setAttribute('aria-live', 'polite');
        liveEl.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveEl);
      }
    }
    liveEl.textContent = '';
    liveEl.textContent = String(msg);
  }

  /* ---------------- 字号：25%–300%，只缩放正文（--nb-font-scale 由 CSS 正文层使用，布局不变） ---------------- */
  /* 约定（D-027/D-029）：localStorage 用 nb-font 存整数百分比；CSS 变量写 (百分比/100).toFixed(2)；越界值忽略不写 */
  var FONT_KEY = 'nb-font';
  var FONT_MIN = 25;
  var FONT_MAX = 300;
  function fontPct() {
    var v = parseInt(read(FONT_KEY), 10);
    return (isNaN(v) || v < FONT_MIN || v > FONT_MAX) ? 100 : v;
  }
  function applyFontScale() {
    var raw = read(FONT_KEY);
    var v = parseInt(raw, 10);
    var miss = raw == null || raw === '' || isNaN(v);
    if (!miss && (v < FONT_MIN || v > FONT_MAX)) {
      /* 越界：忽略不写自定义值，保持 :root 默认 --nb-font-scale: 1 */
      document.documentElement.style.removeProperty('--nb-font-scale');
      return 100;
    }
    var p = miss ? 100 : v;
    document.documentElement.style.setProperty('--nb-font-scale', (p / 100).toFixed(2));
    return p;
  }
  function setFontScale(p) {
    var v = parseInt(p, 10);
    if (isNaN(v) || v < FONT_MIN || v > FONT_MAX) return fontPct();
    write(FONT_KEY, String(v));
    applyFontScale();
    return v;
  }

  /* 字号数字就地编辑：点击百分比 → 就地变输入框（Enter / 失焦提交，Esc 取消）。
     越界或非数字：回退当前值并播报提示，绝不写入非法值。
     顶部工具栏与「学习数据」页共用；onChange 让滑块 / 胶囊显示同步。 */
  function mountFontInput(display, onChange) {
    if (!display || display.getAttribute('data-font-edit') === '1') return false;
    var label = t('toolbar.fontCustom', { min: FONT_MIN, max: FONT_MAX });
    display.setAttribute('data-font-edit', '1');
    display.setAttribute('role', 'button');
    display.setAttribute('tabindex', '0');
    display.setAttribute('title', label);
    display.setAttribute('aria-label', label);
    display.classList.add('is-editable');
    var input = null;
    function sync() { if (typeof onChange === 'function') onChange(); }
    function closeInput() {
      if (!input) return;
      var el = input;
      input = null;
      if (el.parentNode) el.parentNode.removeChild(el);
      display.style.display = '';
    }
    function commit(refocus) {
      if (!input) return;
      var raw = String(input.value == null ? '' : input.value).replace(/[^\d]/g, '');
      var v = raw === '' ? NaN : parseInt(raw, 10);
      var valid = !isNaN(v) && v >= FONT_MIN && v <= FONT_MAX;
      closeInput();
      if (valid) setFontScale(v);
      else if (raw !== '') announce(t('toolbar.fontInvalid', { min: FONT_MIN, max: FONT_MAX }));
      sync();
      if (refocus) { try { display.focus(); } catch (e) { /* 测试环境忽略 */ } }
    }
    function cancel() {
      if (!input) return;
      closeInput();
      try { display.focus(); } catch (e) { /* 测试环境忽略 */ }
    }
    function begin() {
      if (input || !display.parentNode) return;
      var el = document.createElement('input');
      el.type = 'text';
      el.className = 'font-value-input';
      el.setAttribute('inputmode', 'numeric');
      el.setAttribute('autocomplete', 'off');
      el.setAttribute('maxlength', '3');
      el.setAttribute('aria-label', label);
      el.value = String(fontPct());
      display.parentNode.insertBefore(el, display);
      display.style.display = 'none';
      input = el;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); commit(true); }
        else if (e.key === 'Escape' || e.keyCode === 27) { e.preventDefault(); cancel(); }
      });
      el.addEventListener('input', function () {
        var clean = String(el.value).replace(/[^\d]/g, '').slice(0, 3);
        if (clean !== el.value) el.value = clean;
      });
      el.addEventListener('blur', function () { commit(false); });
      try { el.focus(); el.select(); } catch (e) { /* 测试环境忽略 */ }
    }
    display.addEventListener('click', begin);
    display.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        begin();
      }
    });
    return true;
  }

  /* ---------------- 检索（无需第三方库：中/英/缩写/拼音/拼音首字母/别名/标签/释义） ---------------- */
  var STRIP = /[\s\u3000\-_,，。、·:：;；'’‘"“”()（）【】\[\]{}<>《》!！?？/\\|~^*#]/g;
  function norm(v) { return String(v == null ? '' : v).toLowerCase().replace(STRIP, ''); }
  var SEP = '\u0001';
  function fields(term) {
    return [
      [norm(term.name_zh), 100],
      [norm(term.name_en), 90],
      [norm(term.abbr), 85],
      [norm(term.pinyin), 70],
      [norm(term.pinyin_initials), 70],
      [(term.aliases || []).map(norm).join(SEP), 65],
      [norm(term.definition), 30],
      [norm(term.plain), 20],
      [norm((term.tags || []).join(SEP)), 15]
    ];
  }
  function scoreField(val, token) {
    if (!val) return -1;
    if (val === token) return 1;
    var parts = val.split(SEP);
    for (var i = 0; i < parts.length; i++) if (parts[i] && parts[i] === token) return 1;
    if (val.indexOf(token) === 0) return 2;
    for (var j = 0; j < parts.length; j++) if (parts[j] && parts[j].indexOf(token) === 0) return 2;
    if (val.indexOf(token) >= 0) return 3;
    return -1;
  }
  function scoreToken(term, token) {
    var best = 0;
    var list = fields(term);
    for (var i = 0; i < list.length; i++) {
      var rank = scoreField(list[i][0], token);
      if (rank < 0) continue;
      var s = list[i][1] + (rank === 1 ? 40 : rank === 2 ? 20 : 8);
      if (s > best) best = s;
    }
    return best;
  }
  function searchTerms(query, moduleId) {
    var pool = moduleId ? termsByModule(moduleId) : TERMS;
    var q = String(query == null ? '' : query).trim();
    if (!q) return pool.slice();
    var tokens = q.split(/[\s\u3000]+/).map(norm).filter(Boolean);
    if (!tokens.length) return pool.slice();
    var hits = [];
    pool.forEach(function (term, i) {
      var total = 0;
      for (var k = 0; k < tokens.length; k++) {
        var s = scoreToken(term, tokens[k]);
        if (!s) { total = 0; break; }
        total += s;
      }
      if (total > 0) hits.push({ term: term, total: total, i: i });
    });
    hits.sort(function (a, b) { return (b.total - a.total) || (a.i - b.i); });
    return hits.map(function (h) { return h.term; });
  }

  /* ---------------- 链接 ---------------- */
  function hrefTerm(id) { return 'term.html?id=' + encodeURIComponent(id); }
  function hrefTerms(opts) {
    var parts = [];
    if (opts && opts.q) parts.push('q=' + encodeURIComponent(opts.q));
    if (opts && opts.module) parts.push('module=' + encodeURIComponent(opts.module));
    return 'terms.html' + (parts.length ? '?' + parts.join('&') : '');
  }

  /* ---------------- 页面外壳 ---------------- */
  /* 静态文案：HTML 里直接写中文默认值 + data-i18n 键名；
     切换语言时统一替换，无需为每个页面手写一遍 JS。 */
  function applyI18n(root) {
    var scope = root || document;
    qsa('[data-i18n]', scope).forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    qsa('[data-i18n-placeholder]', scope).forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    qsa('[data-i18n-title]', scope).forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    qsa('[data-i18n-aria]', scope).forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
  }

  function navItems() {
    return [
      { key: 'home', label: t('nav.home'), href: 'index.html' },
      { key: 'terms', label: t('nav.terms'), href: 'terms.html' },
      { key: 'lab', label: t('nav.lab'), href: 'lab.html' },
      { key: 'learn', label: t('nav.learn'), href: 'learn.html' },
    { key: 'community', label: t('nav.community'), href: 'community.html' },
    { key: 'dashboard', label: t('nav.dashboard'), href: 'dashboard.html' },
    { key: 'reading', label: t('nav.reading'), href: 'reading.html' },
    { key: 'explore', label: t('nav.explore'), href: 'explore.html' },
    { key: 'about', label: t('nav.about'), href: 'about.html' }
    ];
  }
  /* active 用于标记当前栏目；项目文件页属于「关于」栏目，因此 docs.html 传 'about'。
     反馈箱 / 帮助是功能入口不是栏目：紧跟「关于」右侧渲染为按钮（触发全局 dialog / 引导），不参与栏目高亮。 */
  function navHtml(active) {
    return navItems().map(function (it) {
      return '<a href="' + esc(it.href) + '"' + (it.key === active ? ' aria-current="page"' : '') + '>' +
        esc(it.label) + '</a>';
    }).join('') +
      '<button type="button" class="nav-fb" id="nb-fb-open" aria-haspopup="dialog" aria-controls="nb-fb-dialog">' +
        esc(t('fb.open')) +
      '</button>' +
      '<button type="button" class="nav-help" id="nb-help-open" aria-haspopup="dialog" aria-controls="nb-tour">' +
        esc(t('help.open')) +
      '</button>';
  }

  function renderResume(currentId) {
    var old = qs('#nb-resume');
    if (old) old.parentNode.removeChild(old);
    var last = progress.lastTerm();
    if (!last || last.id === currentId) return;
    var a = document.createElement('a');
    a.id = 'nb-resume';
    a.className = 'resume-pill nb-fixed-ui';
    a.href = hrefTerm(last.id);
    a.innerHTML =
      '<span aria-hidden="true">↩</span>' +
      '<span>' + esc(t('progress.resume')) + '</span>' +
      '<span class="resume-name">· ' + esc(t('progress.resumeLast')) + ' ' + esc(termName(last)) + '</span>' +
      '<span class="pill-count">' + progress.count() + '/' + progress.total() + '</span>';
    document.body.appendChild(a);
  }

  function mountShell(active, options) {
    var opts = options || {};
    applyI18n(document);
    var header = qs('#nb-header');
    if (header) {
      header.className = 'site-header nb-fixed-ui';
      header.innerHTML =
        '<div class="header-inner">' +
          '<a class="brand" href="index.html">' +
            '<span class="brand-text">' +
              '<span class="brand-title">' + esc(t('app.title')) + '</span>' +
              '<span class="brand-sub">' + esc(t('app.subtitle')) + '</span>' +
            '</span>' +
          '</a>' +
          '<nav class="main-nav" aria-label="' + esc(t('nav.home')) + '">' + navHtml(active) + '</nav>' +
          '<div class="toolbar">' +
            '<div class="nav-font" id="nb-font-ctl" title="' + esc(t('toolbar.fontSize')) + '">' +
              '<span class="font-label" aria-hidden="true">A</span>' +
              '<button type="button" class="font-step" id="nb-font-minus" title="' + esc(t('toolbar.fontSmaller')) + '" aria-label="' + esc(t('toolbar.fontSmaller')) + '">−</button>' +
              '<input type="range" class="font-range" id="nb-font-range" min="25" max="300" step="5" value="100" aria-label="' + esc(t('toolbar.fontSize')) + '">' +
              '<button type="button" class="font-step" id="nb-font-plus" title="' + esc(t('toolbar.fontLarger')) + '" aria-label="' + esc(t('toolbar.fontLarger')) + '">+</button>' +
              '<span class="font-value" id="nb-font-value">100%</span>' +
            '</div>' +
            '<button type="button" class="tb-btn" id="nb-lang-btn" aria-label="' + esc(t('action.switchLang')) + '"></button>' +
            '<button type="button" class="tb-btn" id="nb-theme-btn"></button>' +
          '</div>' +
        '</div>' +
        '<nav class="main-nav-mobile nb-fixed-ui" aria-label="' + esc(t('nav.home')) + '">' + navHtml(active) + '</nav>';
      var lbtn = qs('#nb-lang-btn', header);
      if (lbtn) {
        var paintLang = function () {
          var en = locale() === 'en';
          lbtn.title = t('action.switchLang');
          lbtn.setAttribute('aria-label', t('action.switchLang'));
          lbtn.innerHTML = '<span aria-hidden="true">🌐</span><span>' + (en ? '中' : 'EN') + '</span>';
        };
        paintLang();
        lbtn.addEventListener('click', function () { setLocale(locale() === 'en' ? 'zh' : 'en'); });
      }
      var btn = qs('#nb-theme-btn', header);
      if (btn) {        var paint = function () {
          var v = theme();
          btn.title = t('toolbar.theme');
          btn.innerHTML = '<span aria-hidden="true">' + themeIcon(v) + '</span><span>' + esc(themeLabel(v)) + '</span>';
        };
        paint();
        btn.addEventListener('click', function () { cycleTheme(); paint(); renderResume(opts.currentId); });
      }
      var fontRange = qs('#nb-font-range', header);
      var fontValue = qs('#nb-font-value', header);
      if (fontRange) {
        var paintFont = function () {
          var p = applyFontScale();
          fontRange.value = String(p);
          if (fontValue) fontValue.textContent = p + '%';
        };
        paintFont();
        fontRange.addEventListener('input', function () {
          var p = setFontScale(fontRange.value);
          if (fontValue) fontValue.textContent = p + '%';
        });
        var stepFont = function (delta) {
          var p = setFontScale(fontPct() + delta);
          fontRange.value = String(p);
          if (fontValue) fontValue.textContent = p + '%';
        };
        var fontMinus = qs('#nb-font-minus', header);
        var fontPlus = qs('#nb-font-plus', header);
        if (fontMinus) fontMinus.addEventListener('click', function () { stepFont(-5); });
        if (fontPlus) fontPlus.addEventListener('click', function () { stepFont(5); });
        if (fontValue) mountFontInput(fontValue, paintFont);
      }
    }
    var footer = qs('#nb-footer');
    if (footer) {
      footer.className = 'site-footer nb-fixed-ui';
      footer.innerHTML =
        '<div class="site-footer-inner">' +
          '<p>' + esc(t('footer.disclaimer')) + '</p>' +
          '<p>' + esc(t('footer.rights')) + ' · <span class="site-ver" title="NeuroBase release">V5.0.0</span></p>' +
        '</div>';
    }
    applyTheme();
    applyFontScale();
    initBackButtons();
    renderResume(opts.currentId);
  }

  /* ---------------- 智能返回：按来源页面命名，点击回到上一页 ---------------- */
  var BACK_KEY = 'nb.prevPage';
  function backStore() { try { return window.sessionStorage; } catch (e) { return null; } }
  function currentPageLabel() {
    var h = document.querySelector('h1');
    var txt = h ? String(h.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (!txt) txt = String(document.title || '').split(' · ')[0].trim();
    return txt;
  }
  function sameSiteRef(ref) {
    if (!ref) return false;
    if (window.location.protocol === 'file:') return ref.indexOf('file:') === 0;
    try { return new URL(ref).origin === window.location.origin; } catch (e) { return false; }
  }
  function readPrevPage() {
    var st = backStore();
    if (!st) return null;
    try { return JSON.parse(st.getItem(BACK_KEY) || 'null'); } catch (e) { return null; }
  }
  function rememberPage() {
    var st = backStore();
    if (!st) return;
    try { st.setItem(BACK_KEY, JSON.stringify({ href: window.location.href, label: currentPageLabel() })); } catch (e) { /* 隐私模式忽略 */ }
  }
  var PREV_PAGE = readPrevPage();
  function backSource() {
    if (PREV_PAGE && PREV_PAGE.href && PREV_PAGE.href !== window.location.href) return PREV_PAGE;
    var ref = document.referrer || '';
    if (sameSiteRef(ref) && ref !== window.location.href) return { href: ref, label: '' };
    return null;
  }
  function initBack(el) {
    if (!el || el.__nbBackInit) return;
    el.__nbBackInit = true;
    var src = backSource();
    var label = el.querySelector('[data-back-label]') ||
      (el.querySelectorAll('span').length ? el.querySelectorAll('span')[el.querySelectorAll('span').length - 1] : null);
    if (src && src.label) {
      var txt = t('action.backTo', { name: src.label });
      if (label) label.textContent = txt; else el.textContent = txt;
    }
    el.addEventListener('click', function (ev) {
      if (backSource()) {
        if (window.history.length > 1) { ev.preventDefault(); window.history.back(); }
        return;
      }
      var fb = el.getAttribute('data-fallback');
      if (fb) { ev.preventDefault(); go(fb); }   /* 无来源时回到默认页面 */
    });
  }
  function initBackButtons() {
    qsa('[data-back]').forEach(function (el) { initBack(el); });
    rememberPage();
    window.addEventListener('pagehide', rememberPage);
  }

  /* ---------------- 页面跳转（分页学习流程用；自测可经 __navStub 拦截） ---------------- */
  function go(url) {
    if (typeof window.__navStub === 'function') { window.__navStub(url); return; }
    try { window.location.href = url; } catch (e) { /* 极少数环境下导航被禁用时静默 */ }
  }

  /* ---------------- 本地存储可用性（file:// 或无痕模式可能禁用 localStorage） ---------------- */
  function storageOK() {
    try {
      var k = '__nb_store_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- 对外接口 ---------------- */
  window.NB = {
    MODULES: MODULES,
    TERMS: TERMS,
    adminPassHash: ADMIN_HASH,
    adminCheck: adminCheck,
    sha256: sha256Hex,
    go: go,
    storageOK: storageOK,
    t: t,
    esc: esc,
    fmtDate: fmtDate,
    locale: locale,
    setLocale: setLocale,
    theme: theme,
    setTheme: setTheme,
    cycleTheme: cycleTheme,
    themeLabel: themeLabel,
    themeIcon: themeIcon,
    applyTheme: applyTheme,
    fontPct: fontPct,
    applyFontScale: applyFontScale,
    setFontScale: setFontScale,
    mountFontInput: mountFontInput,
    motionOn: motionOn,
    setMotion: setMotion,
    applyMotion: applyMotion,
    announce: announce,
    getTerm: getTerm,
    getModule: getModule,
    moduleName: moduleName,
    termName: termName,
    termsByModule: termsByModule,
    resolveRelated: resolveRelated,
    getBacklinks: getBacklinks,
    getAdjacent: getAdjacent,
    getDailyTerm: getDailyTerm,
    difficultyLabel: difficultyLabel,
    refTypeLabel: refTypeLabel,
    progress: progress,
    searchTerms: searchTerms,
    hrefTerm: hrefTerm,
    hrefTerms: hrefTerms,
    mountShell: mountShell,
    initBack: initBack,
    backSource: backSource,
    applyI18n: applyI18n,
    renderResume: renderResume
  };
})();
