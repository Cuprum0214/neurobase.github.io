/**
 * 生成原生版数据文件（无需构建即可 file:// 直接加载）
 *  · 词条：读取 data/terms*.json（13 个文件）汇总、排序
 *  · 模块：11 个（冻结，见下方 MODULES）
 *  · 文案：读取 data/i18n/zh.json + en.json
 * 输出：outputs/neurobase/assets/js/data/{terms.js,i18n.js}
 * 说明：data/ 是词条与文案的唯一数据源（与前端技术栈解耦，勿放回旧工程目录）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* 仓库根由脚本位置推导，本地与 GitHub Actions 共用同一份构建逻辑 */
const WS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(WS, 'data');
const I18N = path.join(WS, 'data', 'i18n');
const OUT = path.join(WS, 'outputs', 'neurobase', 'assets', 'js', 'data');

/* 生成前快照：判断是否真有内容变化，决定要不要 bump 指纹 */
const before = new Map();
if (fs.existsSync(OUT)) {
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith('.js')) before.set(f, fs.readFileSync(path.join(OUT, f), 'utf8'));
  }
}

/* 11 个模块（冻结，与 PLAN.md §2.2 一致） */
const MODULES = [
  { id: 'neuron', code: 'M1', name_zh: '神经元与神经信号', name_en: 'Neurons & Neural Signals', target: 30, icon: '⚡' },
  { id: 'synapse', code: 'M2', name_zh: '突触与神经递质', name_en: 'Synapses & Neurotransmitters', target: 28, icon: '🔗' },
  { id: 'anatomy', code: 'M3', name_zh: '脑解剖分区', name_en: 'Brain Anatomy', target: 30, icon: '🧠' },
  { id: 'sensory', code: 'M4', name_zh: '感觉与知觉', name_en: 'Sensation & Perception', target: 28, icon: '👁️' },
  { id: 'motor', code: 'M5', name_zh: '运动控制', name_en: 'Motor Control', target: 26, icon: '🏃' },
  { id: 'attention', code: 'M6', name_zh: '注意', name_en: 'Attention', target: 24, icon: '🎯' },
  { id: 'memory', code: 'M7', name_zh: '记忆', name_en: 'Memory', target: 26, icon: '💾' },
  { id: 'language', code: 'M8', name_zh: '语言', name_en: 'Language', target: 22, icon: '💬' },
  { id: 'emotion', code: 'M9', name_zh: '情绪', name_en: 'Emotion', target: 24, icon: '❤️' },
  { id: 'methods', code: 'M10', name_zh: '认知神经科学方法', name_en: 'Methods in Cognitive Neuroscience', target: 26, icon: '🔬' },
  { id: 'bci', code: 'M11', name_zh: 'BCI 基础', name_en: 'BCI Fundamentals', target: 36, icon: '🖥️' }
];

const files = fs.readdirSync(SRC).filter((f) => /^terms.*\.json$/.test(f));
const order = new Map(MODULES.map((m, i) => [m.id, i]));
let terms = [];
for (const f of files) {
  const list = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
  if (!Array.isArray(list)) throw new Error(f + ' 不是数组');
  terms.push(...list);
}
terms.sort((a, b) => {
  const ma = order.has(a.module) ? order.get(a.module) : 99;
  const mb = order.has(b.module) ? order.get(b.module) : 99;
  if (ma !== mb) return ma - mb;
  return String(a.id).localeCompare(String(b.id));
});

/* 自检：id 唯一 / 模块合法 / 必需字段 */
const seen = new Set();
const bad = [];
for (const t of terms) {
  if (!t.id || seen.has(t.id)) bad.push('id 重复或缺失: ' + JSON.stringify(t.id));
  seen.add(t.id);
  if (!order.has(t.module)) bad.push('模块非法: ' + t.id + ' -> ' + t.module);
  for (const k of ['name_zh', 'definition', 'difficulty', 'updated_at']) {
    if (!t[k]) bad.push('缺字段 ' + k + ': ' + t.id);
  }
  if (!Array.isArray(t.references) || !t.references.length) bad.push('references 为空: ' + t.id);
}

fs.mkdirSync(OUT, { recursive: true });
const banner = '/* 本文件由 .deepworks/tmp/build-native/build-data.mjs 自动生成，请勿手改。 */\n';
fs.writeFileSync(
  path.join(OUT, 'terms.js'),
  banner +
    'window.NB_MODULES = ' + JSON.stringify(MODULES, null, 2) + ';\n\n' +
    'window.NB_TERMS = [\n' + terms.map((t) => JSON.stringify(t)).join(',\n') + '\n];\n',
  'utf8'
);

const zh = JSON.parse(fs.readFileSync(path.join(I18N, 'zh.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(I18N, 'en.json'), 'utf8'));
fs.writeFileSync(
  path.join(OUT, 'i18n.js'),
  banner + 'window.NB_I18N = ' + JSON.stringify({ zh, en }, null, 2) + ';\n',
  'utf8'
);

/* ---- 教材导读数据（data/reading_list.json → window.NB_READING） ---- */
const rl = JSON.parse(fs.readFileSync(path.join(SRC, 'reading_list.json'), 'utf8'));
const catIds = new Set(rl.categories.map((c) => c.id));
const levelIds = new Set(Object.keys(rl.meta.levels));
const langIds = new Set(Object.keys(rl.meta.languages));
const bookIds = new Set(rl.books.map((b) => b.id));
const rlBad = [];
rl.books.forEach((b) => {
  if (!catIds.has(b.category)) rlBad.push('书目分类非法: ' + b.id + ' -> ' + b.category);
  if (!levelIds.has(b.level)) rlBad.push('书目难度非法: ' + b.id + ' -> ' + b.level);
  if (!langIds.has(b.language)) rlBad.push('书目语言非法: ' + b.id + ' -> ' + b.language);
  if (!b.note) rlBad.push('书目缺导读: ' + b.id);
  if (!b.url || !/^https?:\/\//.test(b.url)) rlBad.push('书目缺网页链接: ' + b.id);
  if (b.id && bookIds.has(b.id)) return;
});
const dupBook = rl.books.map((b) => b.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupBook.length) rlBad.push('书目 id 重复: ' + dupBook.join(', '));
rl.reading_paths.forEach((p) => {
  p.steps.forEach((s) => { if (!bookIds.has(s)) rlBad.push('阅读路径指向不存在的书: ' + p.id + ' -> ' + s); });
});
fs.writeFileSync(
  path.join(OUT, 'reading.js'),
  banner +
    'window.NB_READING = {\n' +
    '  meta: ' + JSON.stringify(rl.meta) + ',\n' +
    '  categories: ' + JSON.stringify(rl.categories) + ',\n' +
    '  reading_paths: ' + JSON.stringify(rl.reading_paths) + ',\n' +
    '  books: [\n' + rl.books.map((b) => '    ' + JSON.stringify(b)).join(',\n') + '\n  ]\n};\n',
  'utf8'
);

/* ---- 内容生态数据（BCI 专区 / 神经科学↔工程对照 / 科研前沿速览） ----
   三份源文件都在 data/ 下；这里做结构自检（id 唯一 / 词条引用存在 / 双列完整 /
   前沿摘要与 DOI 非空），任何一项失败都让构建以非零码退出，避免页面出现死链。 */
const termIds = new Set(terms.map((t) => t.id));
const ecoBad = [];
const loadJson = (name) => {
  const p = path.join(SRC, name);
  if (!fs.existsSync(p)) throw new Error('缺少数据源: ' + name);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};
const need = (cond, msg) => { if (!cond) ecoBad.push(msg); };
const checkTerms = (ids, where) => {
  need(Array.isArray(ids) && ids.length > 0, where + ' 未关联词条');
  (ids || []).forEach((id) => { if (!termIds.has(id)) ecoBad.push(where + ' 指向不存在词条: ' + id); });
};

const zone = loadJson('bci_zone.json');
const topicIds = new Set();
zone.topics.forEach((tp) => {
  need(!!tp.id && !topicIds.has(tp.id), 'BCI 主题 id 重复或缺失: ' + tp.id);
  topicIds.add(tp.id);
  need(!!tp.name_zh && !!tp.name_en && !!tp.desc_zh && !!tp.desc_en, 'BCI 主题文案不完整: ' + tp.id);
  checkTerms(tp.terms, 'BCI 主题 ' + tp.id);
});
zone.pipeline.forEach((st, i) => {
  need(st.step === i + 1, 'BCI 链路 step 不连续: ' + st.id);
  need(!!st.name_zh && !!st.name_en && !!st.desc_zh, 'BCI 链路文案不完整: ' + st.id);
  checkTerms(st.terms, 'BCI 链路 ' + st.id);
});
zone.cases.forEach((c) => {
  need(/^lab-bci\.html\?case=[1-4]$/.test(c.href || ''), 'BCI 案例 href 非法: ' + c.id);
  need(!!c.name_zh && !!c.name_en && !!c.desc_zh, 'BCI 案例文案不完整: ' + c.id);
});
const zoneTermCount = new Set(zone.topics.flatMap((t) => t.terms)).size;

const emap = loadJson('engineering_map.json');
const rowIds = new Set();
let mapRows = 0;
emap.groups.forEach((g) => {
  need(!!g.id && !!g.name_zh && !!g.name_en && !!g.desc_zh, '对照表分组信息缺失: ' + g.id);
  need(Array.isArray(g.rows) && g.rows.length >= 3, '对照表分组行数不足: ' + g.id);
  (g.rows || []).forEach((r) => {
    mapRows++;
    need(!!r.id && !rowIds.has(r.id), '对照表行 id 重复或缺失: ' + r.id);
    rowIds.add(r.id);
    need(!!r.neural_zh && !!r.neural_en && !!r.eng_zh && !!r.eng_en, '对照表双列文案不完整: ' + r.id);
    need(!!r.note_zh && !!r.note_en, '对照表缺说明: ' + r.id);
    if (!termIds.has(r.term_id)) ecoBad.push('对照表指向不存在词条: ' + r.id + ' -> ' + r.term_id);
  });
});

const fr = loadJson('frontier.json');
const frIds = new Set();
fr.items.forEach((it) => {
  need(!!it.id && !frIds.has(it.id), '前沿条目 id 重复或缺失: ' + it.id);
  frIds.add(it.id);
  need(/^\d{4}-\d{2}-\d{2}$/.test(it.date || ''), '前沿条目日期格式非法: ' + it.id);
  need(!!it.title_zh && !!it.title_en, '前沿条目标题缺失: ' + it.id);
  need((it.summary_zh || '').length >= 60, '前沿条目中文摘要过短: ' + it.id);
  need((it.summary_en || '').length >= 100, '前沿条目英文摘要过短: ' + it.id);
  need(/^10\.\d{4,9}\//.test(it.doi || ''), '前沿条目 DOI 非法: ' + it.id);
  need(!!it.journal && !!it.authors, '前沿条目来源信息缺失: ' + it.id);
  checkTerms(it.term_ids, '前沿条目 ' + it.id);
});

fs.writeFileSync(
  path.join(OUT, 'bci-zone.js'),
  banner + 'window.NB_BCI_ZONE = ' + JSON.stringify(zone, null, 2) + ';\n',
  'utf8'
);
fs.writeFileSync(
  path.join(OUT, 'eng-map.js'),
  banner + 'window.NB_ENG_MAP = ' + JSON.stringify(emap, null, 2) + ';\n',
  'utf8'
);
fs.writeFileSync(
  path.join(OUT, 'frontier.js'),
  banner + 'window.NB_FRONTIER = ' + JSON.stringify(fr, null, 2) + ';\n',
  'utf8'
);

/* ---- Phase 7：来源登记与同步记录（data/sources.json → window.NB_SOURCES） ---- */
const srcDoc = loadJson('sources.json');
const updDoc = fs.existsSync(path.join(SRC, 'update-log.json'))
  ? loadJson('update-log.json')
  : { meta: { version: 1, updated_at: new Date().toISOString().slice(0, 10), last_run: '', last_status: 'none' }, runs: [], queue: [] };
const srcBad = [];
const srcTermIds = new Set();
srcDoc.sources.forEach((s) => {
  need(!!s.id && !!s.type && !!s.title, '来源字段缺失: ' + s.id);
  need(/^https?:\/\//.test(s.url || ''), '来源链接非法: ' + s.id);
  need(/^\d{4}-\d{2}-\d{2}$/.test(s.verified_at || ''), '来源核验日期非法: ' + s.id);
  need(Array.isArray(s.terms) && s.terms.length > 0, '来源未关联词条: ' + s.id);
  (s.terms || []).forEach((id) => {
    if (!termIds.has(id)) srcBad.push('来源指向不存在词条: ' + s.id + ' -> ' + id);
    srcTermIds.add(id);
  });
});
terms.forEach((t) => { if (!srcTermIds.has(t.id)) srcBad.push('词条未被来源覆盖: ' + t.id); });
need(Array.isArray(updDoc.runs), '同步记录 runs 非数组');
need(Array.isArray(updDoc.queue), '待审队列 queue 非数组');
(updDoc.queue || []).forEach((q) => {
  need(!!q.id && !!q.kind && !!q.target_id && !!q.field, '待审项字段缺失: ' + q.id);
  need(['pending', 'approved', 'rejected'].indexOf(q.status) >= 0, '待审项状态非法: ' + q.id);
});

fs.writeFileSync(
  path.join(OUT, 'sources.js'),
  banner + 'window.NB_SOURCES = ' + JSON.stringify(srcDoc) + ';\n',
  'utf8'
);
fs.writeFileSync(
  path.join(OUT, 'updates.js'),
  banner + 'window.NB_UPDATES = ' + JSON.stringify(updDoc) + ';\n',
  'utf8'
);

const byModule = {};
for (const m of MODULES) byModule[m.code + ' ' + m.id] = terms.filter((t) => t.module === m.id).length;

console.log('源文件: ' + files.length + ' 个（' + files.join(', ') + '）');
console.log('词条总数: ' + terms.length + '（唯一 id: ' + seen.size + '）');
console.log('模块分布: ' + JSON.stringify(byModule));
console.log('缺失模块词条: ' + MODULES.filter((m) => !byModule[m.code + ' ' + m.id]).map((m) => m.id).join(', '));
console.log(
  'terms.js: ' + (fs.statSync(path.join(OUT, 'terms.js')).size / 1024).toFixed(1) + ' KB；i18n.js: ' +
    (fs.statSync(path.join(OUT, 'i18n.js')).size / 1024).toFixed(1) + ' KB；reading.js: ' +
    (fs.statSync(path.join(OUT, 'reading.js')).size / 1024).toFixed(1) + ' KB'
);
console.log('i18n 键集合一致: ' + (JSON.stringify(Object.keys(zh).sort()) === JSON.stringify(Object.keys(en).sort())));
console.log('教材: ' + rl.books.length + ' 本 / 分类 ' + rl.categories.length + ' / 阅读路径 ' + rl.reading_paths.length);
console.log(
  '内容生态: BCI 主题 ' + zone.topics.length + '（去重术语 ' + zoneTermCount + '）/ 链路 ' + zone.pipeline.length +
    ' 环节 / 案例 ' + zone.cases.length + '；对照表 ' + emap.groups.length + ' 组 ' + mapRows + ' 行；前沿 ' + fr.items.length + ' 条'
);
bad.push(...rlBad);
bad.push(...ecoBad);
bad.push(...srcBad);
if (bad.length) {
  console.log('❌ 数据自检失败 ' + bad.length + ' 项：');
  bad.slice(0, 20).forEach((b) => console.log('   - ' + b));
  process.exit(1);
}
console.log('✅ 数据自检通过（id 唯一 / 模块合法 / 字段完整 / references 非空）');

/* ---------- 仅有内容变化时才 bump 缓存指纹 ---------- */
const changed = [];
for (const [f, s] of before) {
  const p = path.join(OUT, f);
  if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== s) changed.push(f);
}
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.js') && !before.has(f)) changed.push(f);
}

if (!changed.length) {
  console.log('数据无变化，跳过指纹 bump');
} else {
  const dir = path.join(WS, 'outputs', 'neurobase');
  const htmls = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
  let max = 0;
  for (const f of htmls) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of s.matchAll(/\?v=(\d+)/g)) max = Math.max(max, Number(m[1]));
  }
  const next = max + 1;
  let n = 0;
  for (const f of htmls) {
    const p = path.join(dir, f);
    const s = fs.readFileSync(p, 'utf8');
    const out = s.replace(/\?v=\d+/g, '?v=' + next);
    if (out !== s) {
      n += (s.match(/\?v=\d+/g) || []).length;
      fs.writeFileSync(p, out, 'utf8');
    }
  }
  console.log('内容变更 ' + changed.length + ' 个数据文件，指纹 ?v=' + max + ' -> ?v=' + next + '（' + n + ' 处 / ' + htmls.length + ' 个 HTML）');
}

